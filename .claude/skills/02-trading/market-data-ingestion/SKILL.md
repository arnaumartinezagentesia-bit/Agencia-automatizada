---
name: market-data-ingestion
description: Ingest real-time and historical market data from exchanges via ccxt / ccxt.pro — WebSocket feeds, OHLCV normalization, reconnection handling, per-exchange rate limiting, and deterministic data-integrity validation (gaps, duplicates, outliers). Use when building the data layer that feeds backtests, signals, and dashboards.
category: 02-trading
tags: [market-data, ingestion, websocket, ccxt, ohlcv, data-quality]
version: "1.0.0"
created: "2026-08-26"
---

# Market Data Ingestion

Patterns for reliably pulling market data (ticks, order books, OHLCV) into the Trading MVP and normalizing it into a canonical, validated form. Clean data is the foundation of capital preservation — every downstream calculation trusts this layer.

## Purpose

Provide a robust ingestion pipeline: connect to exchanges via `ccxt`/`ccxt.pro`, handle reconnections and rate limits, normalize heterogeneous payloads into one OHLCV schema, and **deterministically** validate integrity (no look-ahead, no gaps, no duplicates, outliers flagged) before data is stored or consumed.

## When to Use

- Building or extending the real-time or historical data feed.
- Normalizing OHLCV/ticks/order-book data across multiple exchanges.
- Implementing reconnection, backfill, or rate-limit logic.
- Adding data-quality checks before data reaches backtests or live signals.

## When NOT to Use

- Deciding *what* to trade — that's `signal-generation-patterns`.
- Placing orders — that's `order-execution-patterns`.
- Deep validation-framework design — pair with `02-trading/data-quality-frameworks`.

## Implementation

### Canonical OHLCV schema

```python
from dataclasses import dataclass
from decimal import Decimal

@dataclass(frozen=True)
class Candle:
    ts: int          # epoch ms, UTC, bar OPEN time
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal
    symbol: str
    timeframe: str   # e.g. "1m"
```

### Streaming with reconnection (ccxt.pro)

```python
import asyncio, ccxt.pro as ccxtpro

async def stream_ohlcv(exchange_id: str, symbol: str, timeframe: str, sink):
    ex = getattr(ccxtpro, exchange_id)({"enableRateLimit": True})
    backoff = 1
    try:
        while True:
            try:
                candles = await ex.watch_ohlcv(symbol, timeframe)
                backoff = 1                      # reset after success
                for c in candles:
                    await sink(normalize(exchange_id, symbol, timeframe, c))
            except (ccxtpro.NetworkError, asyncio.TimeoutError):
                await asyncio.sleep(min(backoff, 60))   # capped exp backoff
                backoff *= 2
    finally:
        await ex.close()
```

### Rate limiting per exchange

- Set `enableRateLimit=True` (ccxt throttles to the exchange's published limits).
- Track weight/quota per exchange; serialize REST backfill calls; prefer WebSocket for high-frequency data to save REST budget.
- On HTTP 429 / `DDoSProtection`, honour `Retry-After` and increase backoff.

### Deterministic integrity validation

```python
import pandas as pd

def validate_ohlcv(df: pd.DataFrame, timeframe_ms: int) -> dict:
    """Pure function: same input -> same report. No LLM, no randomness."""
    report = {"gaps": [], "duplicates": 0, "outliers": [], "ok": True}

    # duplicates on (symbol, ts)
    dup = df.duplicated(subset=["symbol", "ts"]).sum()
    report["duplicates"] = int(dup)

    # gaps: consecutive ts must differ by exactly one timeframe
    ts = df.sort_values("ts")["ts"].to_numpy()
    deltas = ts[1:] - ts[:-1]
    for i, d in enumerate(deltas):
        if d != timeframe_ms:
            report["gaps"].append((int(ts[i]), int(ts[i + 1]), int(d)))

    # outliers: OHLC sanity + robust z-score on returns
    bad_ohlc = df[(df.high < df.low) | (df.close <= 0) | (df.open <= 0)]
    report["outliers"].extend(bad_ohlc["ts"].tolist())
    ret = df.sort_values("ts")["close"].pct_change()
    med, mad = ret.median(), (ret - ret.median()).abs().median()
    if mad and mad > 0:
        z = 0.6745 * (ret - med) / mad
        report["outliers"].extend(df.loc[z.abs() > 10, "ts"].tolist())

    report["ok"] = not (report["gaps"] or report["duplicates"] or report["outliers"])
    return report
```

### No look-ahead

Store the **bar open** timestamp and only mark a candle "closed" once `now >= open + timeframe`. Downstream code must consume closed candles only, so a signal can never peek at a still-forming bar.

## Capital Preservation Constraint

All validation and normalization here are **deterministic pure functions** (numpy/pandas). Gap detection, duplicate detection, and outlier flagging must be reproducible given identical inputs — never delegated to an LLM. An LLM may only *summarize* a validation report for a human (e.g. "3 gaps around the exchange maintenance window"); it must never decide whether data is acceptable to trade on. Bad data is rejected or quarantined by code, before it can influence any capital decision.

## Examples

### Example 1 — backfill then reconcile
Backfill 1m OHLCV via REST for the last 30 days, run `validate_ohlcv`; if gaps are found, re-request only the missing ranges and re-validate until `ok=True` before persisting.

### Example 2 — outlier quarantine
A single 1m candle shows a 40% wick from a bad print. The robust z-score flags its `ts`; the row is moved to a `quarantine` table and excluded from indicator computation, with an alert emitted.

## References

- ccxt manual: https://docs.ccxt.com
- ccxt.pro (WebSocket): https://docs.ccxt.com/#/ccxt.pro.manual
- pandas: https://pandas.pydata.org/docs/
- Median absolute deviation (robust outliers): https://en.wikipedia.org/wiki/Median_absolute_deviation
