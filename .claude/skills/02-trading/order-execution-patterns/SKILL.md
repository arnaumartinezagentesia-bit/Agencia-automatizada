---
name: order-execution-patterns
description: Patterns for placing and managing exchange orders (market, limit, stop-loss), controlling slippage, reconciling positions, and enforcing idempotency and circuit breakers. All execution-decision logic is deterministic. Use when implementing the order lifecycle between a generated signal and a filled position.
category: 02-trading
tags: [execution, orders, slippage, idempotency, circuit-breaker, reconciliation]
version: "1.0.0"
created: "2026-08-26"
---

# Order Execution Patterns

The bridge between a decision and money moving: how the Trading MVP submits, tracks, and reconciles orders safely. Execution bugs are direct capital loss, so every decision here is deterministic, idempotent, and bounded by circuit breakers.

## Purpose

Define a reliable order lifecycle — build order → pre-trade checks → submit (idempotently) → track fills → reconcile position → handle errors — with slippage control and kill-switches. The logic that *decides* whether/how to execute is pure code; LLMs never sit in this path.

## When to Use

- Implementing market / limit / stop-loss / take-profit order placement.
- Managing the order lifecycle (open → partially filled → filled / cancelled).
- Reconciling internal position state with the exchange's truth.
- Adding slippage limits, retry logic, or trading circuit breakers.

## When NOT to Use

- Deciding *what/when* to trade — that's `signal-generation-patterns`.
- Sizing positions / exposure limits — that's `portfolio-risk-management`.
- Connectivity/failover plumbing — that's `exchange-connectivity`.

## Implementation

### Idempotent submission (client order id)

Every order carries a deterministic `clientOrderId`. Re-submitting the same intent must never create a duplicate.

```python
import hashlib

def client_order_id(strategy: str, symbol: str, side: str, ts_bucket: int, seq: int) -> str:
    raw = f"{strategy}:{symbol}:{side}:{ts_bucket}:{seq}"
    return "mvp-" + hashlib.sha256(raw.encode()).hexdigest()[:24]

async def submit_order(ex, intent) -> dict:
    coid = client_order_id(intent.strategy, intent.symbol, intent.side,
                           intent.ts_bucket, intent.seq)
    try:
        return await ex.create_order(
            intent.symbol, intent.type, intent.side, float(intent.qty),
            float(intent.price) if intent.price else None,
            params={"clientOrderId": coid},
        )
    except ccxt.DuplicateOrderId:
        return await ex.fetch_order_by_client_id(coid, intent.symbol)  # already placed
```

### Pre-trade deterministic checks (fail closed)

```python
def pretrade_check(intent, market, risk_state) -> None:
    assert intent.qty > 0, "non-positive qty"
    assert intent.qty >= market.min_qty, "below min lot"
    assert intent.qty * intent.ref_price >= market.min_notional, "below min notional"
    assert risk_state.exposure_ok(intent), "exposure limit breached"
    assert not risk_state.halted, "circuit breaker active"
```

### Slippage control

```python
def limit_price_with_slippage(side: str, ref: Decimal, max_bps: int) -> Decimal:
    slip = ref * Decimal(max_bps) / Decimal(10_000)
    return ref + slip if side == "buy" else ref - slip
```

Prefer marketable-limit orders over pure market orders so the fill price is bounded. Reject a fill (or the next child order) if realized slippage exceeds the configured `max_bps`.

### Circuit breakers

```python
class CircuitBreaker:
    def __init__(self, max_daily_loss, max_consec_errors):
        self.max_daily_loss = max_daily_loss
        self.max_consec_errors = max_consec_errors
        self.daily_pnl = Decimal("0"); self.errors = 0; self.halted = False
    def on_fill(self, pnl):
        self.daily_pnl += pnl
        if self.daily_pnl <= -self.max_daily_loss: self.halted = True
    def on_error(self):
        self.errors += 1
        if self.errors >= self.max_consec_errors: self.halted = True
    def on_success(self): self.errors = 0
```

When `halted`, the system cancels working orders and refuses new ones until a human resets it.

### Position reconciliation

Periodically (and after every fill) compare internal state to `fetch_positions()` / `fetch_balance()`. On drift, the **exchange is the source of truth**: log the discrepancy, correct internal state, and alert. Never assume a local optimistic update succeeded.

### Error handling

- Classify errors: retryable (`NetworkError`, `RequestTimeout`) vs terminal (`InsufficientFunds`, `InvalidOrder`).
- Retry retryables with capped exponential backoff and the *same* `clientOrderId` (safe due to idempotency).
- Terminal errors increment the circuit breaker and surface an alert.

## Capital Preservation Constraint

Every execution decision — whether to submit, at what bounded price, whether slippage/exposure/circuit-breaker checks pass — is **deterministic code**. Given the same intent and market/risk state, the system produces the same action every time. LLMs may only annotate or explain execution logs post-hoc; they must never choose an order type, price, size, or decide to bypass a check. The circuit breaker and pre-trade asserts are hard, code-enforced gates.

## Examples

### Example 1 — retry without duplication
A submit times out; the client retries with the identical `clientOrderId`. The exchange either accepts it once or returns `DuplicateOrderId`, which the code resolves by fetching the existing order — no double position.

### Example 2 — daily loss kill-switch
Cumulative realized PnL hits `-max_daily_loss`. `CircuitBreaker.halted` flips true, working orders are cancelled, new intents are rejected by `pretrade_check`, and an alert fires (see `exchange-api-monitoring`).

## References

- ccxt order methods: https://docs.ccxt.com/#/README?id=orders
- Idempotency keys: https://stripe.com/docs/api/idempotent_requests (concept)
- Slippage & market microstructure: https://en.wikipedia.org/wiki/Slippage_(finance)
