---
name: exchange-api-monitoring
description: Monitor the health of exchange APIs — detect degradation, abnormal latency, rate-limit hits, and WebSocket disconnects — with Prometheus metrics, Grafana panels, and Alertmanager rules tuned for trading. Includes a runbook for responding to exchange outages. Use when instrumenting connectivity or defining trading-specific alerts.
category: 04-operations
tags: [monitoring, prometheus, grafana, alerting, exchange, latency, runbook]
version: "1.0.0"
created: "2026-08-26"
---

# Exchange API Monitoring

Observability for the Trading MVP's most fragile dependency: external exchange APIs. Detects and alerts on degradation before it turns into missed fills, stale data, or capital risk.

## Purpose

Instrument every exchange interaction with metrics (latency, error rate, rate-limit usage, WS connection state), visualize them in Grafana, alert via Alertmanager on trading-relevant thresholds, and provide a runbook so on-call can respond to an exchange outage quickly and safely.

## When to Use

- Instrumenting `exchange-connectivity` / `market-data-ingestion` / `order-execution-patterns`.
- Defining alerts for API latency, error spikes, 429 rate-limit hits, or WS disconnects.
- Building Grafana dashboards for exchange health.
- Writing/So updating the exchange-outage response runbook.

## When NOT to Use

- General app metrics unrelated to exchanges — use `monitoring-observability` / `grafana-dashboards`.
- The connectivity abstraction itself — that's `exchange-connectivity`.

## Implementation

### Metrics (Prometheus client)

```python
from prometheus_client import Counter, Histogram, Gauge

api_latency = Histogram(
    "exchange_api_latency_seconds", "Exchange REST latency",
    ["exchange", "endpoint"],
    buckets=(0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10),
)
api_errors = Counter(
    "exchange_api_errors_total", "Exchange API errors",
    ["exchange", "endpoint", "type"],   # type: network|ratelimit|exchange
)
rate_limit_hits = Counter(
    "exchange_rate_limit_hits_total", "HTTP 429 / DDoSProtection hits", ["exchange"]
)
ws_connected = Gauge(
    "exchange_ws_connected", "WebSocket connected (1/0)", ["exchange", "stream"]
)

async def timed_call(exchange, endpoint, coro):
    with api_latency.labels(exchange, endpoint).time():
        try:
            return await coro
        except Exception as e:
            kind = classify(e)                       # network|ratelimit|exchange
            api_errors.labels(exchange, endpoint, kind).inc()
            if kind == "ratelimit":
                rate_limit_hits.labels(exchange).inc()
            raise
```

### Alert rules (Prometheus)

```yaml
groups:
- name: exchange-health
  rules:
  - alert: ExchangeHighLatency
    expr: histogram_quantile(0.95, sum(rate(exchange_api_latency_seconds_bucket[5m])) by (le,exchange)) > 2
    for: 3m
    labels: {severity: warning}
    annotations: {summary: "p95 latency > 2s on {{ $labels.exchange }}"}

  - alert: ExchangeErrorSpike
    expr: sum(rate(exchange_api_errors_total[5m])) by (exchange) > 1
    for: 2m
    labels: {severity: critical}
    annotations: {summary: "Error rate elevated on {{ $labels.exchange }}"}

  - alert: ExchangeWSDisconnected
    expr: exchange_ws_connected == 0
    for: 1m
    labels: {severity: critical}
    annotations: {summary: "WebSocket down: {{ $labels.exchange }}/{{ $labels.stream }}"}

  - alert: ExchangeRateLimited
    expr: increase(exchange_rate_limit_hits_total[5m]) > 0
    for: 0m
    labels: {severity: warning}
    annotations: {summary: "Rate-limit hits on {{ $labels.exchange }}"}
```

### Grafana panels

- p50/p95/p99 latency per exchange/endpoint.
- Error rate by type (stacked).
- WS connection uptime heatmap.
- Rate-limit budget consumed vs published limit.

### Runbook — exchange outage / degradation

```text
TRIGGER: ExchangeErrorSpike or ExchangeWSDisconnected (critical)

1. CONFIRM scope: one exchange or all? Check the exchange's status page.
2. PROTECT CAPITAL FIRST:
   - If order APIs are affected: engage the trading circuit breaker
     (halt new orders; see order-execution-patterns). Do NOT blind-retry orders.
   - Cancel resting orders only if you can confirm state; otherwise wait & reconcile.
3. DATA: fail over read/market-data to a healthy venue (exchange-connectivity router).
4. RECONCILE positions vs exchange truth once APIs recover.
5. COMMUNICATE: post status; record timeline.
6. RESET breaker only after a human verifies connectivity + reconciled state.
7. POST-INCIDENT: file an incident note (see incident-runbook-templates).
```

## Capital Preservation Constraint

Detection thresholds and the automated protective response (tripping the circuit breaker, failing over data) are **deterministic**, driven by metric values and configured thresholds — not by an LLM. During an outage the system fails safe: it halts new orders rather than guessing. An LLM may summarize the incident timeline or draft the post-mortem, but it never decides to resume trading; a human resets the breaker after verification.

## Examples

### Example 1 — latency creep before an outage
p95 latency crosses 2s → `ExchangeHighLatency` warns on-call, who pre-emptively reduces order rate before a full outage hits.

### Example 2 — WS drop
`exchange_ws_connected` hits 0 for 1m → critical alert; data path fails over to a secondary venue while reconnection with backoff runs.

## References

- Prometheus Python client: https://github.com/prometheus/client_python
- Alerting rules: https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/
- Grafana: https://grafana.com/docs/
- Related: `.claude/skills/00-core/monitoring-observability`, `.claude/skills/04-operations/incident-runbook-templates`
