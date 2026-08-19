# Core Backend & Agent Orchestration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "Brain" of the enterprise: a multi-agent system where a Director coordinates specialized trading agents to perform analysis, strategy generation, and backtesting, exposed via a FastAPI REST interface.

**Architecture:** Stateful Graph (LangGraph) where nodes are agents and edges are conditional transitions based on a shared state. A "Director" node acts as the router and synthesizer.

**Tech Stack:** Python 3.11+, LangGraph, FastAPI, Redis, PostgreSQL (via SQLAlchemy), Pytest.

**Spec:** `docs/superpowers/specs/2026-08-19-agentes-ia-trading-enterprise-design.md`

## Global Constraints
- **Immutability:** No mutation of state objects; always return updated state.
- **Deterministic Computation:** No critical trading math in LLMs; delegate to `backtest_engine`.
- **Preservation of Capital:** Risk Agent's veto must be absolute and blockable by the Director.
- **State Persistence:** All agent outputs must be recorded in the `DepartmentContextStore` (Redis).

---

## File Structure

### Core Infrastructure
- `src/backend/main.py`: FastAPI application entry point.
- `src/backend/core/state.py`: Definition of the `AgentState` TypedDict (the shared memory).
- `src/backend/core/store.py`: Redis-based `DepartmentContextStore` for persisting state across sessions.
- `src/backend/core/graph.py`: LangGraph definition (nodes, edges, and conditional routing).

### Agents
- `src/backend/agents/base.py`: Base class for agents to ensure consistent interfaces.
- `src/backend/agents/director.py`: Logic for `trading_desk_lead` (routing, synthesis, veto handling).
- `src/backend/agents/specialists/market_intel.py`: Logic for `trading_market_intelligence_agent`.
- `src/backend/agents/specialists/pattern_det.py`: Logic for `trading_pattern_detection_agent`.
- `src/backend/agents/specialists/risk_mgmt.py`: Logic for `trading_risk_management_agent`.
- `src/backend/agents/specialists/backtest.py`: Logic for `trading_backtest_agent`.

### Services (Deterministic Engines)
- `src/backend/services/backtest_engine.py`: Wrapper for deterministic backtesting logic (VectorBT/Backtrader interface).
- `src/backend/services/market_data.py`: Interface for fetching OHLCV and News data.

### API
- `src/backend/api/endpoints.py`: FastAPI routes for chat and the Strategy Builder.

### Tests
- `tests/backend/test_state.py`: Unit tests for state and store.
- `tests/backend/test_agents.py`: Unit tests for individual agent logic.
- `tests/backend/test_orchestration.py`: Integration tests for the full LangGraph flow.

---

## Implementation Tasks

### Task 1: Project Scaffolding & State Definition

**Files:**
- Create: `src/backend/main.py`
- Create: `src/backend/core/state.py`
- Create: `src/backend/core/store.py`
- Test: `tests/backend/test_state.py`

**Interfaces:**
- Produces: `AgentState` (TypedDict), `DepartmentContextStore` (Class).

- [ ] **Step 1: Define `AgentState` in `state.py`**
  Include: `messages` (list), `current_analysis` (dict), `risk_veto` (bool), `final_verdict` (str), `strategy_hypotheses` (list).
- [ ] **Step 2: Implement `DepartmentContextStore` in `store.py`**
  Create a class with `save_state(session_id, state)` and `get_state(session_id)` using Redis.
- [ ] **Step 3: Write failing test for state persistence**
  ```python
  def test_store_persistence():
      store = DepartmentContextStore()
      store.save_state("sess_1", {"test": "value"})
      assert store.get_state("sess_1")["test"] == "value"
  ```
- [ ] **Step 4: Run test to verify it fails** (due to missing Redis connection/class).
- [ ] **Step 5: Implement basic FastAPI app in `main.py`**
- [ ] **Step 6: Run tests and verify they pass.**
- [ ] **Step 7: Commit**
  `git commit -m "feat: backend scaffolding and state management"`

### Task 2: Deterministic Services (Market Data & Backtest Engine)

**Files:**
- Create: `src/backend/services/market_data.py`
- Create: `src/backend/services/backtest_engine.py`
- Test: `tests/backend/test_services.py`

**Interfaces:**
- Produces: `MarketDataService.get_ohlcv(symbol, tf)`, `BacktestEngine.run(strategy_params)`.

- [ ] **Step 1: Implement `MarketDataService`**
  Create a mock interface that returns dummy OHLCV data for now.
- [ ] **Step 2: Implement `BacktestEngine`**
  Create a class that takes strategy parameters and returns a mock `BacktestResult` (metrics: CAGR, MDD, Sharpe).
- [ ] **Step 3: Write tests for engine output**
  ```python
  def test_backtest_engine_returns_metrics():
      engine = BacktestEngine()
      res = engine.run({"symbol": "XAUUSD", "period": 20})
      assert "cagr" in res
      assert "max_drawdown" in res
  ```
- [ ] **Step 4: Run tests and verify they pass.**
- [ ] **Step 5: Commit**
  `git commit -m "feat: add deterministic market and backtest services"`

### Task 3: Specialist Agents Implementation

**Files:**
- Create: `src/backend/agents/base.py`
- Create: `src/backend/agents/specialists/market_intel.py`
- Create: `src/backend/agents/specialists/pattern_det.py`
- Create: `src/backend/agents/specialists/risk_mgmt.py`
- Create: `src/backend/agents/specialists/backtest.py`

**Interfaces:**
- Consumes: `MarketDataService`, `BacktestEngine`.
- Produces: Functions that return updated `AgentState`.

- [ ] **Step 1: Create `BaseAgent` in `base.py`**
- [ ] **Step 2: Implement `MarketIntelligenceAgent`**
  Logic: Process news $\rightarrow$ update `state['current_analysis']['macro']`.
- [ ] **Step 3: Implement `PatternDetectionAgent`**
  Logic: Process OHLCV $\rightarrow$ update `state['current_analysis']['technical']`.
- [ ] **Step 4: Implement `RiskManagementAgent`**
  Logic: Check `current_analysis` $\rightarrow$ set `state['risk_veto'] = True` if risk > threshold.
- [ ] **Step 5: Implement `BacktestAgent`**
  Logic: Take `strategy_params` $\rightarrow$ call `BacktestEngine` $\rightarrow$ update `state['current_analysis']['backtest_results']`.
- [ ] **Step 6: Write unit tests for each agent's state mutation.**
- [ ] **Step 7: Commit**
  `git commit -m "feat: implement specialist agents"`

### Task 4: The Director (Orchestrator)

**Files:**
- Create: `src/backend/agents/director.py`
- Test: `tests/backend/test_director.py`

**Interfaces:**
- Consumes: `AgentState`.
- Produces: `director_node(state)` function.

- [ ] **Step 1: Implement `TradingDeskLead` logic**
  - Route to specialists.
  - Check `risk_veto` $\rightarrow$ if True, force "Cautious/Rejected" verdict.
  - Synthesize `current_analysis` into `final_verdict`.
- [ ] **Step 2: Write test for Director veto logic**
  ```python
  def test_director_respects_veto():
      state = {"risk_veto": True, "current_analysis": {}}
      res = director_node(state)
      assert "REJECTED" in res['final_verdict'].upper()
  ```
- [ ] **Step 3: Run tests and verify they pass.**
- [ ] **Step 4: Commit**
  `git commit -m "feat: implement director agent with veto logic"`

### Task 5: LangGraph Workflow Construction

**Files:**
- Create: `src/backend/core/graph.py`
- Test: `tests/backend/test_orchestration.py`

**Interfaces:**
- Consumes: All agents.
- Produces: `trading_graph` (CompiledGraph).

- [ ] **Step 1: Define the graph nodes**
  - `director` $\rightarrow$ `specialists` $\rightarrow$ `director` (review) $\rightarrow$ `end`.
- [ ] **Step 2: Implement conditional edges**
  - If `director` decides more info is needed $\rightarrow$ route to specific specialist.
  - If `risk_veto` is True $\rightarrow$ route directly to synthesis.
- [ ] **Step 3: Compile the graph.**
- [ ] **Step 4: Write integration test for full flow**
  ```python
  def test_full_orchestration_flow():
      graph = compile_trading_graph()
      final_state = graph.invoke({"messages": [HumanMessage(content="Analyze Gold")]})
      assert "final_verdict" in final_state
  ```
- [ ] **Step 5: Run tests and verify they pass.**
- [ ] **Step 6: Commit**
  `git commit -m "feat: construct and verify LangGraph orchestration"`

### Task 6: Strategy Lab & Builder Logic

**Files:**
- Modify: `src/backend/agents/director.py`
- Modify: `src/backend/agents/specialists/backtest.py`
- Modify: `src/backend/api/endpoints.py`

**Interfaces:**
- Produces: `/api/strategy/generate` endpoint.

- [ ] **Step 1: Implement "Hypothesis Generation" in Director**
  Logic: When `action == "create_strategy"`, generate 3 variant param sets.
- [ ] **Step 2: Implement "Batch Backtest" in Backtest Agent**
  Logic: Loop through hypotheses $\rightarrow$ run `BacktestEngine` for each.
- [ ] **Step 3: Implement "Comparative Report" in Director**
  Logic: Rank results by CAGR/MDD $\rightarrow$ return structured JSON.
- [ ] **Step 4: Create FastAPI endpoint `/api/strategy/generate`**
  Input: User conditions $\rightarrow$ Invoke Graph $\rightarrow$ Return report.
- [ ] **Step 5: Write integration test for the Strategy Lab flow.**
- [ ] **Step 6: Commit**
  `git commit -m "feat: implement strategy lab and builder endpoints"`

### Task 7: Final Integration & API Wrap

**Files:**
- Modify: `src/backend/main.py`
- Modify: `src/backend/api/endpoints.py`

- [ ] **Step 1: Add chat endpoint `/api/chat`**
  Logic: Stream graph execution to user.
- [ ] **Step 2: Integrate `DepartmentContextStore` into API routes**
  Ensure `session_id` is used to load/save state in Redis.
- [ ] **Step 3: Final end-to-end test of all endpoints.**
- [ ] **Step 4: Commit**
  `git commit -m "feat: finalize backend API and state integration"`
