---
name: exchange-connectivity
description: Multi-exchange connectivity abstraction (Binance, Kraken, Coinbase) built on ccxt — a unified adapter interface, per-exchange credential management, sandbox/testnet usage, symbol/precision normalization, and failover between venues. Use when adding a new exchange or making the system venue-agnostic.
category: 02-trading
tags: [exchange, connectivity, ccxt, failover, sandbox, multi-exchange]
version: "1.0.0"
created: "2026-08-26"
---

# Exchange Connectivity

A clean abstraction layer over multiple crypto exchanges so the rest of the Trading MVP is venue-agnostic. Isolates the quirks of each exchange (symbols, precision, rate limits, auth) behind one interface, and enables failover.

## Purpose

Let strategy, execution, and data code target a single `ExchangeAdapter` interface while credentials, endpoints, precision rules, and sandbox toggles are handled per exchange. Enables safe testing against testnets and graceful failover when one venue degrades.

## When to Use

- Adding support for a new exchange (Binance, Kraken, Coinbase, …).
- Making order/data code work across venues without branching.
- Wiring per-exchange API credentials and sandbox/testnet endpoints.
- Implementing failover / redundancy between exchanges.

## When NOT to Use

- Order lifecycle logic — that's `order-execution-patterns`.
- Data validation/normalization of candles — that's `market-data-ingestion`.
- API health alerting — that's `exchange-api-monitoring`.

## Implementation

### Unified adapter interface

```python
from typing import Protocol
from decimal import Decimal

class ExchangeAdapter(Protocol):
    id: str
    async def fetch_ohlcv(self, symbol: str, timeframe: str, limit: int) -> list: ...
    async def create_order(self, symbol: str, type: str, side: str,
                           qty: Decimal, price: Decimal | None, params: dict) -> dict: ...
    async def fetch_balance(self) -> dict: ...
    async def close(self) -> None: ...
```

### ccxt-backed implementation with sandbox + credentials

```python
import ccxt.async_support as ccxt

def build_exchange(exchange_id: str, creds, sandbox: bool = True):
    klass = getattr(ccxt, exchange_id)
    ex = klass({
        "apiKey": creds.key.get_secret_value(),
        "secret": creds.secret.get_secret_value(),
        "enableRateLimit": True,
        "options": {"defaultType": "spot"},
    })
    if sandbox:
        ex.set_sandbox_mode(True)      # use testnet where the exchange supports it
    return ex
```

Credentials come from the secrets store, one set per exchange (see `python-security-hardening` and `secrets-management`). Default to `sandbox=True`; live trading requires an explicit, reviewed flag.

### Symbol & precision normalization

```python
async def normalize_symbol(ex, unified: str) -> str:
    await ex.load_markets()
    if unified not in ex.markets:
        raise ValueError(f"{unified} not listed on {ex.id}")
    return unified   # ccxt already uses unified BASE/QUOTE symbols

def round_to_precision(ex, symbol: str, amount: float) -> float:
    return float(ex.amount_to_precision(symbol, amount))
```

Always round quantity/price with the exchange's own `amount_to_precision` / `price_to_precision` before submitting, to avoid rejects.

### Failover between venues

```python
class ExchangeRouter:
    def __init__(self, adapters: list[ExchangeAdapter]):
        self.adapters = adapters      # ordered by preference

    async def with_failover(self, op):
        last = None
        for a in self.adapters:
            try:
                return await op(a)
            except (ccxt.NetworkError, ccxt.ExchangeNotAvailable) as e:
                last = e
                continue
        raise last
```

Failover is appropriate for **read** operations (market data, balances). For **order** operations, do not blindly retry on another venue — positions are venue-specific; route deliberately and reconcile per exchange (see `order-execution-patterns`).

## Capital Preservation Constraint

Routing and failover decisions are **deterministic**: preference order and health thresholds are configuration evaluated in code, never chosen by an LLM at runtime. Live vs sandbox is an explicit, reviewed configuration flag — the system defaults to sandbox so an unconfigured deployment cannot accidentally trade real capital. Precision/limits are enforced from the exchange's own metadata, not estimated.

## Examples

### Example 1 — add Kraken
Implement/instantiate the ccxt Kraken adapter, load its markets, map unified symbols, and register it in `ExchangeRouter` after Binance. Strategy code is unchanged.

### Example 2 — data failover
Binance WebSocket drops; `with_failover` transparently serves OHLCV from Kraken for read paths while an alert fires, without interrupting the dashboard.

## References

- ccxt exchanges & unified API: https://docs.ccxt.com
- ccxt sandbox mode: https://docs.ccxt.com/#/README?id=sandbox-mode
- Binance testnet: https://testnet.binance.vision
