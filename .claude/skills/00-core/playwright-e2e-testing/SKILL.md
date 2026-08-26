---
name: playwright-e2e-testing
description: Write end-to-end tests with Playwright for the trading dashboard — strategy config forms, equity-curve charts, and live WebSocket panels. Use when validating UI behaviour, mocking market-data streams, or asserting on rendered charts and tables. Covers deterministic fixtures so trading data in tests never depends on a live exchange.
category: 00-core
tags: [testing, playwright, e2e, frontend, dashboard, websocket]
version: "1.0.0"
created: "2026-08-26"
---

# Playwright E2E Testing (Trading Dashboard)

End-to-end UI testing for the Trading MVP dashboard using [Playwright](https://playwright.dev). Focuses on the parts unique to a trading UI: streaming data panels, equity curves, and risk-config forms.

## Purpose

Unit tests cover pure functions; E2E tests prove the dashboard actually renders correct numbers and reacts to streams. Because trading UIs show money-relevant data, E2E tests must be **deterministic**: they run against mocked, fixed fixtures — never a live exchange — so a chart assertion means the same thing on every run.

## When to Use

- Validating strategy-configuration forms (position size, stop-loss, exposure limits) submit and persist correctly.
- Asserting an equity curve / drawdown chart renders the expected series from known input data.
- Testing live panels fed by WebSocket streams (order book, PnL ticker) using mocked sockets.
- Regression-guarding a critical operator flow: load strategy → start (paper) → observe fills → stop.

## When NOT to Use

- Pure calculation logic (Sharpe, VaR, indicator math) — test that with `pytest` in the deterministic backend layer, not through the browser.
- Backend contract testing — use API/contract tests instead.
- Load/perf testing — Playwright is for correctness, not throughput.

## Implementation

### Install

```bash
npm i -D @playwright/test
npx playwright install --with-deps chromium
```

### Deterministic trading fixtures

Never let a test call a real exchange. Serve a fixed OHLCV/fills fixture and freeze time.

```ts
// fixtures/trading.ts
import { test as base } from '@playwright/test';
import ohlcv from './ohlcv.fixture.json';   // committed, deterministic dataset

export const test = base.extend({
  page: async ({ page }, use) => {
    // Freeze clock so time-based labels are stable
    await page.addInitScript(() => {
      const FIXED = new Date('2026-08-26T00:00:00Z').valueOf();
      Date.now = () => FIXED;
    });
    // Stub the REST market-data endpoint
    await page.route('**/api/ohlcv**', (route) =>
      route.fulfill({ json: ohlcv })
    );
    await use(page);
  },
});
export { expect } from '@playwright/test';
```

### Mocking a WebSocket stream

```ts
// Replace the app's WebSocket with a scripted mock that emits fixed frames.
await page.addInitScript(() => {
  class MockWS {
    onmessage: ((e: any) => void) | null = null;
    constructor(_url: string) {
      const frames = [
        { type: 'tick', symbol: 'BTC/USDT', price: 60000 },
        { type: 'fill', symbol: 'BTC/USDT', qty: 0.1, price: 60010 },
      ];
      setTimeout(() => frames.forEach(f =>
        this.onmessage?.({ data: JSON.stringify(f) })), 50);
    }
    send() {} close() {}
  }
  // @ts-ignore
  window.WebSocket = MockWS;
});
```

### Asserting on a chart

Charts render to canvas/SVG. Assert on the accessible data the component also exposes (a data table, `aria-label`, or a `data-testid` value) rather than pixels:

```ts
test('equity curve shows final portfolio value', async ({ page }) => {
  await page.goto('/dashboard/backtest/123');
  await expect(page.getByTestId('equity-final')).toHaveText('$12,340.00');
  await expect(page.getByTestId('max-drawdown')).toHaveText('-8.20%');
});
```

For genuine visual regressions, use snapshot comparison with a tolerance:

```ts
await expect(page.getByTestId('equity-chart')).toHaveScreenshot('equity.png',
  { maxDiffPixelRatio: 0.02 });
```

### Config-form flow

```ts
test('operator can set risk limits and start paper run', async ({ page }) => {
  await page.goto('/strategies/new');
  await page.getByLabel('Max position size (%)').fill('5');
  await page.getByLabel('Stop loss (%)').fill('2');
  await page.getByRole('button', { name: 'Start (paper)' }).click();
  await expect(page.getByTestId('run-status')).toHaveText('RUNNING');
});
```

## Capital Preservation Constraint

E2E tests **must not** place real orders or hit live exchange endpoints. Always:
- route all `/api/**` and exchange calls to mocked fixtures, and
- run any exercised strategy in **paper / dry-run** mode.
The numbers a chart displays are derived from deterministic backend calculations; the E2E test only verifies they are *displayed* correctly — it never re-computes or approximates them in JS.

## Examples

### Example 1 — regression guard for drawdown color coding
Assert that when `max-drawdown` exceeds the configured limit, the badge gets `data-state="breach"` and turns red — a purely presentational rule driven by a deterministic backend value.

### Example 2 — reconnect UX
Emit a `close` frame from the mock WebSocket and assert the dashboard shows a "Reconnecting…" banner and then recovers when frames resume.

## References

- Playwright docs: https://playwright.dev/docs/intro
- Network mocking: https://playwright.dev/docs/mock
- Visual comparisons: https://playwright.dev/docs/test-snapshots
- Clock / time control: https://playwright.dev/docs/clock
