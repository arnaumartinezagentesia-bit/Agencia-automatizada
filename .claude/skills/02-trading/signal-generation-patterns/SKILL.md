---
name: signal-generation-patterns
description: Architecture for turning raw market data into actionable trading signals with a strict separation of concerns — (a) indicator computation [deterministic], (b) signal combination/scoring [deterministic], (c) narrative interpretation [LLM allowed]. The final signal score is reproducible given the same data. Use when designing the signal pipeline.
category: 02-trading
tags: [signals, indicators, scoring, pipeline, determinism, feature-engineering]
version: "1.0.0"
created: "2026-08-26"
---

# Signal Generation Patterns

How the Trading MVP converts validated market data into a reproducible, actionable signal — while allowing an LLM to add human-readable narrative *without ever touching the number*.

## Purpose

Define a three-stage pipeline with a hard boundary between deterministic computation and LLM interpretation, so that the signal that drives capital is always reproducible and auditable.

## When to Use

- Designing or refactoring the signal/feature pipeline.
- Combining multiple indicators into a single score or decision.
- Adding an LLM-generated explanation to a signal without compromising reproducibility.

## When NOT to Use

- Sizing the resulting trade — that's `portfolio-risk-management`.
- Executing the trade — that's `order-execution-patterns`.
- Ingesting/validating the raw data — that's `market-data-ingestion`.

## Implementation

### The three-stage boundary

```text
raw candles ──▶ (a) INDICATORS  ──▶ (b) COMBINE/SCORE ──▶ signal (float/enum)
   [deterministic pure code]        [deterministic pure code]        │
                                                                     ▼
                                                        (c) INTERPRET / NARRATE
                                                            [LLM allowed — text only]
```

Stages (a) and (b) produce the actual signal. Stage (c) reads the signal + context and emits prose for humans; its output is **never** fed back into (a)/(b).

### (a) Indicators — deterministic

```python
import pandas as pd

def rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def sma(close: pd.Series, period: int) -> pd.Series:
    return close.rolling(period).mean()
```

Compute only on **closed** candles (see `market-data-ingestion` no-look-ahead rule).

### (b) Combine / score — deterministic

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class SignalConfig:
    rsi_buy: float = 30.0
    rsi_sell: float = 70.0
    trend_fast: int = 20
    trend_slow: int = 50

def score(df: pd.DataFrame, cfg: SignalConfig) -> dict:
    """Pure: same df + cfg -> same score. No randomness, no LLM, no wall clock."""
    r = rsi(df["close"]).iloc[-1]
    fast, slow = sma(df["close"], cfg.trend_fast).iloc[-1], sma(df["close"], cfg.trend_slow).iloc[-1]
    trend = 1 if fast > slow else -1
    mean_rev = 1 if r < cfg.rsi_buy else (-1 if r > cfg.rsi_sell else 0)
    raw = 0.6 * trend + 0.4 * mean_rev          # fixed, documented weights
    action = "BUY" if raw > 0.3 else ("SELL" if raw < -0.3 else "HOLD")
    return {"score": round(float(raw), 6), "action": action,
            "features": {"rsi": float(r), "trend": trend, "mean_rev": mean_rev}}
```

Weights/thresholds live in config and are versioned. A golden-master test pins `score()` outputs for a fixture dataset.

### (c) Interpret / narrate — LLM allowed

```python
def narrate(signal: dict) -> str:
    """LLM may generate this text. It describes; it does not decide."""
    prompt = ("Explain this trading signal for a human operator in 2 sentences. "
              "Do NOT change or recompute any number. Signal: " + str(signal))
    return call_llm(prompt)   # output stored for the UI/audit log only
```

The narration is display/audit metadata. If the LLM is unavailable, the signal still stands.

## Capital Preservation Constraint

The boundary is the whole point:
- **(a) indicator computation** and **(b) signal combination/scoring** are deterministic pure functions — reproducible given identical data + config, unit-tested with golden-master fixtures.
- **(c) interpretation/narrative** is the *only* place an LLM is allowed, and it produces text for humans that can never re-enter the scoring path.
The final signal score is therefore always reproducible, and no capital decision ever depends on a stochastic model output.

## Examples

### Example 1 — reproducibility test
`score(fixture_df, SignalConfig())` must equal a checked-in expected dict on every run and machine; CI fails if it drifts.

### Example 2 — safe narration
The scorer emits `{"action":"BUY","score":0.42,...}`; the LLM writes "Momentum turned positive as the 20-SMA crossed above the 50-SMA while RSI left oversold." The BUY/0.42 is untouched.

## References

- Technical indicators (RSI, SMA): https://www.investopedia.com/terms/r/rsi.asp
- pandas rolling windows: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.rolling.html
- Golden-master / characterization testing: https://en.wikipedia.org/wiki/Characterization_test
- Related: `.claude/skills/02-trading/backtesting-frameworks`
