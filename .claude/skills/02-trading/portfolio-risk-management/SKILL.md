---
name: portfolio-risk-management
description: Portfolio-level risk management — position sizing (Kelly, fixed-fractional), drawdown controls, asset correlation, VaR / Expected Shortfall, and per-sector/asset exposure limits. Every calculation is deterministic (numpy/pandas/scipy); the LLM only interprets results. Use when sizing positions or enforcing portfolio risk limits.
category: 02-trading
tags: [risk, position-sizing, kelly, var, expected-shortfall, drawdown, correlation]
version: "1.0.0"
created: "2026-08-26"
---

# Portfolio Risk Management

Portfolio-wide risk controls for the Trading MVP: how much to allocate, how to cap exposure, and how to measure tail risk. This is the core of capital preservation — so **all** numbers come from deterministic code, never from a model's guess.

## Purpose

Provide reproducible tools for position sizing, exposure limits, drawdown control, and tail-risk metrics (VaR, Expected Shortfall) computed with numpy/pandas/scipy. Complements the existing `risk-metrics-calculation` skill by focusing on portfolio construction and enforcement.

## When to Use

- Deciding position size for a signal (Kelly / fixed-fractional).
- Enforcing max exposure per asset / sector / total gross & net.
- Computing VaR / Expected Shortfall and drawdown-based limits.
- Accounting for correlation when aggregating risk across positions.

## When NOT to Use

- Single-instrument statistical metrics already covered by `risk-metrics-calculation` (reuse it).
- Order placement mechanics — that's `order-execution-patterns`.
- Signal generation — that's `signal-generation-patterns`.

## Implementation

### Position sizing (deterministic)

```python
from decimal import Decimal
import numpy as np

def fixed_fractional(equity: Decimal, risk_per_trade: Decimal,
                     entry: Decimal, stop: Decimal) -> Decimal:
    """Risk a fixed fraction of equity per trade. Pure, reproducible."""
    risk_amount = equity * risk_per_trade                # e.g. 1%
    per_unit_risk = abs(entry - stop)
    if per_unit_risk == 0:
        return Decimal("0")
    return risk_amount / per_unit_risk

def kelly_fraction(win_p: float, win_loss_ratio: float, cap: float = 0.25) -> float:
    """Fractional Kelly, capped for safety. Deterministic."""
    f = win_p - (1 - win_p) / win_loss_ratio
    return float(np.clip(f, 0.0, cap))                   # never negative, never > cap
```

Always use **fractional** (capped) Kelly — full Kelly is too aggressive for capital preservation.

### VaR & Expected Shortfall

```python
import numpy as np

def historical_var_es(returns: np.ndarray, alpha: float = 0.975):
    """Historical VaR/ES at confidence alpha. Deterministic given returns."""
    r = np.sort(returns)
    idx = int((1 - alpha) * len(r))
    var = -r[idx]                       # loss (positive number)
    es = -r[:idx].mean() if idx > 0 else var
    return {"VaR": float(var), "ES": float(es), "alpha": alpha}
```

### Correlation-aware portfolio risk

```python
def portfolio_vol(weights: np.ndarray, cov: np.ndarray) -> float:
    """sqrt(wᵀ Σ w). Deterministic."""
    return float(np.sqrt(weights @ cov @ weights))
```

Use the correlation matrix so two highly-correlated positions are treated as concentrated risk, not diversification.

### Exposure limits (hard, code-enforced)

```python
class ExposureLimits:
    def __init__(self, max_per_asset, max_per_sector, max_gross, max_net):
        self.max_per_asset = max_per_asset
        self.max_per_sector = max_per_sector
        self.max_gross = max_gross
        self.max_net = max_net

    def check(self, positions, sectors) -> list[str]:
        breaches = []
        for a, w in positions.items():
            if abs(w) > self.max_per_asset:
                breaches.append(f"asset {a} {w:.2%} > {self.max_per_asset:.2%}")
        # sector, gross, net aggregations ...
        gross = sum(abs(w) for w in positions.values())
        net = sum(positions.values())
        if gross > self.max_gross: breaches.append(f"gross {gross:.2%}")
        if abs(net) > self.max_net: breaches.append(f"net {net:.2%}")
        return breaches
```

A non-empty `breaches` list blocks new risk-increasing orders (integrates with `order-execution-patterns.pretrade_check`).

### Drawdown control

Track peak equity; if current drawdown exceeds a threshold, reduce sizing (de-risk) or halt (ties into the circuit breaker). All thresholds are config values, evaluated by code.

## Capital Preservation Constraint

This is the strictest application of the rule. **TODOS los cálculos** — position sizing, VaR, ES, correlation, exposure aggregation, drawdown — are implemented with `numpy` / `pandas` / `scipy` and are fully reproducible given the same inputs. The LLM is permitted **only** to interpret and narrate results ("ES rose because BTC/ETH correlation spiked to 0.9"); it must never compute a size, set a limit, or approve/deny a trade. Limits are hard gates enforced in code, unit-tested for breach behaviour.

## Examples

### Example 1 — sizing a trade
Equity $10,000, risk 1% per trade, entry 100, stop 96 → `fixed_fractional` = $100 / 4 = 25 units. Deterministic and testable.

### Example 2 — blocking a correlated over-concentration
Two positions each within the per-asset cap but 0.95-correlated push `portfolio_vol` and combined sector exposure over `max_per_sector`; `ExposureLimits.check` returns a breach and the new order is rejected.

## References

- Kelly criterion: https://en.wikipedia.org/wiki/Kelly_criterion
- Value at Risk / Expected Shortfall: https://en.wikipedia.org/wiki/Expected_shortfall
- numpy: https://numpy.org/doc/  · scipy.stats: https://docs.scipy.org/doc/scipy/reference/stats.html
- Existing skill: `.claude/skills/02-trading/risk-metrics-calculation`
