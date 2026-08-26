---
name: context7-docs
description: Fetch up-to-date, version-accurate library documentation via Context7 (MCP/CLI) so Claude Code writes code against the real current API instead of stale training data. Use when working with fast-moving libraries such as pandas, ccxt, vectorbt, polars, or FastAPI, especially when method signatures may have changed.
category: 00-core
tags: [documentation, context7, mcp, developer-tools, claude-code]
version: "1.0.0"
created: "2026-08-26"
---

# Context7 Documentation Integration

Use [Context7](https://github.com/upstash/context7) to pull current, version-pinned documentation for third-party libraries directly into the agent's context, eliminating hallucinated or deprecated APIs.

## Purpose

LLM training data lags behind library releases. For the Trading MVP this is dangerous: an outdated `ccxt` order signature or a removed `vectorbt` keyword can silently break execution or backtests. Context7 fetches the real, current docs for a specific library (and version) on demand, so generated code matches the installed package.

## When to Use

- You are about to write or review code against a library whose API may have changed (`pandas`, `numpy`, `ccxt`, `ccxt.pro`, `vectorbt`, `polars`, `scipy`, `fastapi`, `pydantic`, `sqlalchemy`).
- A generated snippet fails with `AttributeError`, `TypeError: unexpected keyword argument`, or a deprecation warning.
- You need the exact signature, enum values, or return shape of a method (e.g. `exchange.create_order(...)`).
- You are pinning a dependency and want docs matching that exact version.

## When NOT to Use

- The library is stable and you already know the API (e.g. Python stdlib `datetime`).
- The answer is a language feature, not a library API.
- You need conceptual/architectural guidance rather than an API reference — use the relevant `00-core` or `02-trading` skill instead.
- Offline environments where the MCP server / network is unavailable — fall back to the vendored docs of the pinned version.

## Implementation

### Option A — MCP server (preferred inside Claude Code)

Add Context7 as an MCP server so the agent can call it as a tool:

```jsonc
// .claude/mcp.json (or client MCP config)
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

Then, in a prompt, request docs explicitly:

```text
Use context7 to get the current ccxt docs for create_order and
show the exact parameters for a stop-limit order on Binance.
```

### Option B — One-shot CLI invocation

```bash
# Launch the Context7 MCP server ad hoc (stdio transport)
npx -y @upstash/context7-mcp

# Typical flow the agent performs via MCP tools:
#   1) resolve-library-id  -> maps "ccxt" to a Context7 library id
#   2) get-library-docs    -> returns focused docs for a topic/version
```

### Recommended workflow

1. **Resolve** the library id first (`resolve-library-id`) — names are fuzzy; confirm the match.
2. **Scope** the request with a topic (e.g. `topic: "websocket order book"`) to avoid pulling megabytes of docs and blowing the token budget.
3. **Pin** the version when reproducibility matters (`/ccxt/ccxt@4.x`).
4. **Cache** the returned snippet in the PR description or an ADR if it informed a non-obvious decision.

### Token-efficiency note

Always pass a narrow `topic` and a small token cap. Fetching an entire library reference defeats the purpose and violates the repo's token-efficiency policy. Prefer several small, targeted lookups over one giant dump.

## Examples

### Example 1 — verifying a ccxt order signature before writing execution code

```text
Prompt: "use context7, resolve ccxt, then get docs for create_order
limit + stop params. Version 4.x."
Result: exact keyword args (symbol, type, side, amount, price, params={'stopPrice': ...})
Action: implement order-execution-patterns code against the confirmed signature.
```

### Example 2 — vectorbt backtest API drift

```text
Symptom: Portfolio.from_signals(...) raises unexpected keyword 'fees'.
Fix: context7 -> vectorbt docs for from_signals -> confirm current arg name/location,
update backtesting-frameworks code accordingly.
```

## References

- Context7 GitHub: https://github.com/upstash/context7
- Context7 MCP package: https://www.npmjs.com/package/@upstash/context7-mcp
- Model Context Protocol: https://modelcontextprotocol.io
- ccxt manual: https://docs.ccxt.com
- vectorbt docs: https://vectorbt.dev
