---
name: superpowers-methodology
description: Agile engineering methodology and flow-state practices for the Trading MVP. Provides sprint structure, a Definition of Done for trading features, ship-gate checklists for capital-affecting code, and a PR-description template for quantitative work. Use when planning sprints, defining DoD, or gating a trading feature for release.
category: 00-core
tags: [methodology, agile, definition-of-done, ship-gate, process, pr-template]
version: "1.0.0"
created: "2026-08-26"
---

# Superpowers Methodology

A lightweight, high-signal engineering methodology for shipping the Trading MVP quickly *without* compromising capital safety. Emphasizes short focused sprints, explicit Definitions of Done, and hard ship-gates for any code that can move money.

## Purpose

Give the team (human + agents) a repeatable rhythm: plan small, build in flow, and never ship capital-affecting code that hasn't cleared a deterministic ship-gate. It turns the "Preservation of Capital" rule into a checklist that is verified before merge.

## When to Use

- Planning a sprint or breaking an epic into shippable slices for the Trading MVP.
- Defining the Definition of Done (DoD) for a feature (strategy, risk control, execution path).
- Preparing to merge/release a quantitative or capital-affecting change (the ship-gate).
- Writing a PR description for a quantitative feature that reviewers can actually audit.

## When NOT to Use

- As a substitute for the technical trading skills — this is process, not implementation.
- Heavyweight enterprise governance; keep it lean for an MVP.

## Implementation

### Sprint structure (1–2 week cadence)

1. **Slice**: break each epic into slices that are individually shippable and reversible.
2. **Risk-tag** every slice: `capital-affecting` vs `non-capital`. Capital-affecting slices require the full ship-gate.
3. **Flow blocks**: schedule uninterrupted build blocks; batch reviews/standups to protect focus.
4. **Demo + retro**: demo against acceptance criteria; retro captures one process improvement.

### Definition of Done (DoD) — trading feature

A feature is Done only when **all** hold:

- [ ] Acceptance criteria met and demoed.
- [ ] All quantitative logic is **deterministic** (pure code) and covered by unit tests with fixed fixtures.
- [ ] Reproducibility proven: same inputs → identical outputs (seeded, no wall-clock/LLM in the math path).
- [ ] Risk limits enforced in code (position size, exposure, drawdown) with tests for breach behaviour.
- [ ] Secrets handled per `python-security-hardening`; no credentials in code/logs.
- [ ] Observability: structured logs + metrics for the new path.
- [ ] Docs/ADR updated if a non-obvious decision was made.
- [ ] Rollback path documented.

### Ship-gate checklist (capital-affecting code)

Run this as the merge gate. Any unchecked box blocks release.

```text
[ ] Deterministic:  no LLM call inside any quantitative/decision calculation
[ ] Reproducible:   golden-master test passes (inputs -> exact outputs)
[ ] Paper-tested:   feature ran in paper/dry-run mode end-to-end
[ ] Risk-bounded:   max loss / exposure caps enforced and unit-tested
[ ] Idempotent:     order/execution paths are idempotent (see order-execution-patterns)
[ ] Observed:       alerts + dashboards exist for the new path
[ ] Reversible:     documented rollback / kill-switch
```

### PR description template (quantitative feature)

```markdown
## What & why
<one paragraph: the change and the trading rationale>

## Capital-safety classification
- [ ] capital-affecting   - [ ] non-capital

## Determinism & reproducibility
- Math path: <files/functions>  (pure code, no LLM)
- Golden-master test: <path> — inputs -> expected outputs
- Seed/config used: <...>

## Risk controls touched
<limits enforced, and the tests that prove breach handling>

## Testing evidence
- Unit: <coverage/notes>
- Backtest / paper run: <summary metrics: Sharpe, max DD, turnover>

## Rollback
<how to disable / revert safely>
```

## Capital Preservation Constraint

The methodology operationalizes the rule: the **ship-gate mechanically rejects** any capital-affecting merge whose quantitative path is not deterministic and reproducible. LLMs may assist planning, PR summaries, and interpretation of backtest results — they must never sit inside the calculation or the gate decision itself. The golden-master test, not a model's judgment, decides "reproducible".

## Examples

### Example 1 — slicing an execution epic
"Add stop-loss orders" becomes: (a) deterministic stop trigger calc + tests, (b) idempotent order submit in paper mode, (c) dashboard + alert, (d) live enablement behind a flag — each a shippable slice, (b)–(d) capital-affecting.

### Example 2 — blocking a merge
A PR adds signal scoring that calls an LLM to pick a threshold. Ship-gate box "Deterministic" fails → PR is refactored so the threshold is a config/computed value; the LLM only annotates the resulting signal.

## References

- Agile Manifesto: https://agilemanifesto.org
- "Flow" (Csikszentmihalyi) — deep-work scheduling rationale
- Google Testing Blog (golden/characterization tests): https://testing.googleblog.com
- Trunk-based development: https://trunkbaseddevelopment.com
