---
name: trading-system-deployment
description: Deploy the Trading MVP to production safely — a go-live checklist, blue-green / canary rollout for strategies, pre-deployment verification of exchange connectivity and risk configuration, and rollback procedures. Use when promoting a trading release or changing a live strategy.
category: 04-operations
tags: [deployment, go-live, blue-green, canary, rollback, release, trading]
version: "1.0.0"
created: "2026-08-26"
---

# Trading System Deployment

Safe production deployment for a system that trades real capital. A bad deploy here is not a broken page — it is potential financial loss. Every release is gated, verifiable, and reversible.

## Purpose

Provide a disciplined release process for the Trading MVP: pre-deployment verification (connectivity, risk config, secrets), progressive rollout (blue-green / canary starting in paper), and fast, safe rollback with a kill-switch.

## When to Use

- Promoting a release of the trading system to production.
- Rolling out a new or changed strategy to live capital.
- Defining rollback / kill-switch procedures.
- Verifying exchange connectivity and risk configuration before go-live.

## When NOT to Use

- Generic CI/CD pipeline authoring — use `ci-cd-pipelines` / `deployment-pipeline-design`.
- Container image building — use `docker-best-practices`.
- Runtime health alerting — use `exchange-api-monitoring`.

## Implementation

### Pre-deployment verification (must all pass)

```text
[ ] Ship-gate passed for every capital-affecting change (superpowers-methodology)
[ ] Secrets present & valid; sandbox vs live flag reviewed (python-security-hardening)
[ ] Exchange connectivity smoke test GREEN against LIVE (read-only) endpoints
[ ] Risk config validated: position caps, exposure limits, drawdown & daily-loss
    limits load correctly and are non-zero / sane (portfolio-risk-management)
[ ] Circuit breaker + kill-switch verified reachable
[ ] Golden-master tests for indicators/scoring pass on the release artifact
[ ] Observability wired: dashboards + alerts live (exchange-api-monitoring)
[ ] Rollback plan written and rehearsed
```

Automate the checks that can be automated:

```python
async def preflight(router, risk_cfg) -> list[str]:
    problems = []
    # 1) connectivity (read-only) on each configured venue
    for a in router.adapters:
        try:
            await a.fetch_balance()
        except Exception as e:
            problems.append(f"connectivity {a.id}: {e}")
    # 2) risk config sanity (deterministic assertions)
    if risk_cfg.max_daily_loss <= 0: problems.append("max_daily_loss unset")
    if not (0 < risk_cfg.risk_per_trade <= 0.05): problems.append("risk_per_trade out of range")
    if risk_cfg.max_gross <= 0: problems.append("max_gross unset")
    return problems     # empty == go
```

### Progressive rollout

1. **Paper first**: deploy the new version in paper/dry-run alongside production (blue-green). Compare its signals/fills to expectations for a soak period.
2. **Canary capital**: enable live trading for the new version with a *small* capital allocation and tight limits. Monitor PnL, slippage, error rate.
3. **Promote**: shift full allocation only after canary metrics are within expected bounds.
4. **Blue-green cutover**: keep the previous version warm; cut traffic/allocation over atomically so rollback is instant.

### Rollback / kill-switch

```text
KILL-SWITCH (immediate): trip circuit breaker -> cancel working orders where state
  is confirmed -> stop new order submission -> keep data/monitoring running.

ROLLBACK (version): shift allocation back to the previous (warm) blue-green version,
  reconcile positions vs exchange truth, verify limits, then investigate.
```

Never "fix forward" on a capital-affecting incident under time pressure — roll back / halt first, diagnose after.

### Config & secrets

- Environment-specific risk config is versioned and reviewed; production requires explicit `sandbox=False`.
- Secrets injected at runtime from the secrets manager; deployment fails closed if a required secret is missing.

## Capital Preservation Constraint

The go/no-go decision is **deterministic**: `preflight()` and the ship-gate return pass/fail from code assertions over connectivity and risk configuration — an LLM never authorizes a deployment. Rollout defaults to paper, then canary with capped capital; the kill-switch and rollback are code-driven and always available. If any deterministic check fails, the deploy is blocked. LLM assistance is limited to drafting release notes or post-incident write-ups.

## Examples

### Example 1 — blocked go-live
`preflight()` finds `max_daily_loss unset` → deployment pipeline fails the gate; release is blocked until the risk config is corrected.

### Example 2 — canary rollback
A new strategy's canary shows slippage 3× the modeled value; monitoring alerts, allocation is shifted back to the warm previous version, positions reconciled, and the strategy returns to paper for investigation.

## References

- Blue-green deployment: https://martinfowler.com/bliki/BlueGreenDeployment.html
- Canary releases: https://martinfowler.com/bliki/CanaryRelease.html
- Related: `.claude/skills/04-operations/deployment-pipeline-design`, `.claude/skills/00-core/superpowers-methodology`, `.claude/skills/02-trading/portfolio-risk-management`
