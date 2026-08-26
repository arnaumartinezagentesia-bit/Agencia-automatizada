---
name: python-security-hardening
description: Harden production Python for a trading system, inspired by Trail of Bits engineering practices. Covers secure handling of exchange API keys, validation of financial inputs, SQL-injection prevention in backtesting queries, secrets rotation, and safe deserialization. Use when touching credentials, user/market inputs, or database queries.
category: 00-core
tags: [security, hardening, python, secrets, sql-injection, trail-of-bits]
version: "1.0.0"
created: "2026-08-26"
---

# Python Security Hardening

Security engineering practices for the Trading MVP's Python code, drawing on patterns popularized by [Trail of Bits](https://blog.trailofbits.com). In a trading system, a security defect is a capital-loss defect: leaked exchange keys or an injection in a backtest query can drain funds or corrupt decisions.

## Purpose

Provide concrete, reviewable patterns to (a) keep exchange credentials secret and rotatable, (b) validate every financial input before it reaches calculation or execution, (c) eliminate SQL injection in backtesting/analytics queries, and (d) avoid unsafe deserialization and dependency risks.

## When to Use

- Adding or refactoring code that reads exchange API keys / secrets.
- Accepting any external input that feeds an order, a risk calc, or a DB query (symbols, quantities, date ranges, uploaded CSVs).
- Building SQL against the backtesting / market-data store.
- Setting up dependency scanning, secrets rotation, or CI security gates.

## When NOT to Use

- Pure numerical/algorithmic design questions (use the trading skills).
- One-off local notebooks with no secrets and no production data (still avoid committing secrets).

## Implementation

### 1. Exchange API keys — never in code, least privilege, rotatable

```python
import os
from pydantic import BaseSettings, SecretStr

class ExchangeSecrets(BaseSettings):
    binance_key: SecretStr
    binance_secret: SecretStr
    class Config:
        env_file = ".env"          # never committed; .env in .gitignore
        env_file_encoding = "utf-8"

secrets = ExchangeSecrets()
# Use .get_secret_value() only at the call site; never log the raw value.
```

Rules:
- Store secrets in a manager (Vault / AWS Secrets Manager / Doppler), inject as env vars at runtime. See the `secrets-management` core skill.
- Create **read-only + trade** keys with withdrawals disabled and IP allow-listing on the exchange.
- Rotate on a schedule and on any suspected exposure; keep two active keys to rotate with zero downtime.
- Never log secrets. Add a logging filter that redacts anything matching key patterns.

### 2. Validate financial inputs (fail closed)

```python
from decimal import Decimal
from pydantic import BaseModel, condecimal, constr, validator

Symbol = constr(regex=r"^[A-Z0-9]{2,10}/[A-Z0-9]{2,10}$")   # e.g. BTC/USDT

class OrderRequest(BaseModel):
    symbol: Symbol
    qty: condecimal(gt=Decimal("0"), max_digits=28, decimal_places=8)
    price: condecimal(gt=Decimal("0"), max_digits=28, decimal_places=8)

    @validator("qty", "price")
    def finite(cls, v):
        if not v.is_finite():
            raise ValueError("non-finite numeric input")
        return v
```

Rules:
- Use `Decimal`, never `float`, for money/quantity to avoid rounding drift.
- Whitelist symbols; reject unknown markets.
- Enforce exchange min/max notional and tick/lot size before sending.
- Reject `NaN`/`inf` explicitly.

### 3. Prevent SQL injection in backtesting queries

```python
# WRONG — string interpolation is injectable
# cur.execute(f"SELECT * FROM ohlcv WHERE symbol='{symbol}'")

# RIGHT — parameterized query
cur.execute(
    "SELECT ts, open, high, low, close, volume "
    "FROM ohlcv WHERE symbol = %s AND ts BETWEEN %s AND %s",
    (symbol, start, end),
)
```

With SQLAlchemy, use bound parameters / the query builder — never f-strings. Validate identifiers (table/column names) against an allow-list because they cannot be parameterized.

### 4. Safe deserialization & dependencies

- Never `pickle.loads` untrusted data; prefer JSON with a schema. For model artifacts, load only trusted, checksum-verified files.
- Pin dependencies (`requirements.txt` / lockfile) and run `pip-audit` and `bandit` in CI.
- Use `secrets` / `hmac.compare_digest` for tokens and signature checks (constant-time).

```yaml
# CI security gate (excerpt)
- run: pip install bandit pip-audit
- run: bandit -r src -ll        # fail on medium+ severity
- run: pip-audit -r requirements.txt
```

## Capital Preservation Constraint

Security controls here are **deterministic guards**, implemented in code, executed before any capital-affecting action:
- Input validation, notional/lot checks, and SQL parameterization are pure code — never delegated to an LLM.
- An LLM may *explain* a flagged vulnerability or *suggest* a remediation, but it must never be the gate that decides whether an order, withdrawal, or query is permitted. The deterministic validator is the source of truth.

## Examples

### Example 1 — redacting secrets in logs
Add a `logging.Filter` that scrubs values matching API-key regexes so a stack trace can never leak `binance_secret`.

### Example 2 — rejecting a malformed order
`OrderRequest(symbol="btc-usdt", qty=-1)` raises a `ValidationError` before any exchange call, preventing a wrong-side / negative-quantity order.

## References

- Trail of Bits blog: https://blog.trailofbits.com
- Bandit: https://bandit.readthedocs.io
- pip-audit: https://github.com/pypa/pip-audit
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Python `secrets` / `hmac`: https://docs.python.org/3/library/secrets.html
