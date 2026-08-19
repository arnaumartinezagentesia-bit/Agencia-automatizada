# Design Specification: AI Agents Trading Enterprise (Pixel Art Sim)
**Date:** 2026-08-19
**Status:** Draft
**Architect:** Claude Code

## 1. Executive Summary
The "AI Agents Trading Enterprise" is a high-performance trading assistant system that combines a sophisticated multi-agent orchestration backend with a gamified "office simulation" frontend. The goal is to provide professional-grade trading analysis, strategy generation, and backtesting through an intuitive, visual interface where agents are represented as characters in a pixel-art world (Stardew Valley style).

## 2. System Architecture

### 2.1 High-Level Topology
The system follows a decoupled Client-Server architecture:
- **Backend:** Python-based agentic core running 24/7 on a cloud VPS.
- **Frontend:** Next.js web application rendering a 2D game world via Phaser.js.
- **Communication:** REST API for configuration and WebSockets for real-time state synchronization.

### 2.2 Backend Stack (The Brain)
- **Language:** Python 3.11+
- **Orchestration:** **LangGraph**. Used to implement a stateful graph where the "Director" agent manages the flow between specialized agents.
- **API Framework:** **FastAPI**. Handles WebSocket connections to push agent state updates to the frontend.
- **Task Scheduling:** **Celery + Redis**. Manages autonomous loops (24/7 monitoring) and scheduled market analysis.
- **Persistence:**
    - **PostgreSQL:** Long-term storage for user profiles, saved strategies, and trade history.
    - **Redis:** Short-term "Department Context Store" for active session state and inter-agent communication.
- **External Integrations:**
    - **Telegram Bot API:** Asynchronous alerts for critical events.
    - **Market Data APIs:** Integration with financial data providers for OHLCV and news.

### 2.3 Frontend Stack (The View)
- **Framework:** **Next.js** (React). Manages the application shell, chat interfaces, and the "Strategy Builder" panels.
- **Game Engine:** **Phaser.js**. Renders the 2D pixel art world.
- **Styling:** Tailwind CSS for UI panels.
- **State Management:** Zustand or Redux for synchronizing the game world state with the backend.

---

## 3. Agent Orchestration & Logic

### 3.1 Agent Hierarchy
1. **Trading Desk Lead (Director):**
    - **Role:** Entry point for user queries and final synthesis.
    - **Logic:** Decomposes requests $\rightarrow$ delegates to specialists $\rightarrow$ validates results $\rightarrow$ issues final verdict.
    - **Veto Power:** The Director must adhere to a strict "Preservation of Capital" rule; if the Risk Agent vetos, the Director cannot approve.

2. **Specialist Agents:**
    - **Market Intelligence Agent:** News analysis and macro impact.
    - **Pattern Detection Agent:** Technical analysis and chart patterns.
    - **Backtest Agent:** Deterministic execution of strategies over historical data.
    - **Risk Management Agent:** Position sizing, drawdown analysis, and vetoes.

### 3.2 The "Strategy Lab" Workflow
A specialized loop for creating and validating new strategies:
1. **Trigger:** User utilizes the **Strategy Builder** panel to define conditions (Indicators, Timeframe, Risk).
2. **Generation:** The Director instructs the Analysis Agent to generate $N$ strategy hypotheses based on the inputs.
3. **Validation:** All hypotheses are sent to the Backtest Agent.
4. **Comparative Analysis:** The Director receives the quantitative results $\rightarrow$ Filters the best $\rightarrow$ Presents a comparative report to the user.

---

## 4. Visual Simulation Design

### 4.1 The Office Map
The application is divided into specialized rooms:
- **Trading Office:** Contains computers, charts, and the trading team.
- **Dropshipping Office:** Contains shipping boxes and product researchers.
- **YouTube Office:** Contains recording gear and editors.
- **Director's Office:** Central hub for high-level management.
- **Monitoring Room:** A "War Room" with dashboards showing all agent health metrics.

### 4.2 Agent Behavior (The "Living" World)
Agents are characters with a State Machine:
- **State: IDLE** $\rightarrow$ Movement: Random wander / Interaction: Coffee machine / Visual: Relaxed.
- **State: WORKING** $\rightarrow$ Movement: Move to Computer $\rightarrow$ Sit $\rightarrow$ Visual: Typing/Analyzing.
- **State: THINKING** $\rightarrow$ Movement: Stationary $\rightarrow$ Visual: Thought bubble.
- **State: ALERT** $\rightarrow$ Movement: Urgent move to Director / Visual: Alert animation.
- **State: COLLABORATING** $\rightarrow$ Movement: Move to Meeting Table $\rightarrow$ Visual: Group discussion.

### 4.3 Interaction Model
- **Contextual Chat:** Clicking a character opens a chat focused on that agent's specialty.
- **Real-time Sync:** Backend state changes (e.g., `backtest_started`) trigger immediate visual changes in the Phaser.js world.

---

## 5. Infrastructure & Deployment

- **Version Control:** Private GitHub Repository.
- **Deployment:** Docker containers.
- **Hosting:** Linux VPS (Ubuntu) with a reverse proxy (Nginx) and SSL (Let's Encrypt).
- **CI/CD:** GitHub Actions for automated testing and deployment to the VPS.

## 6. Success Criteria
- [ ] Backend can orchestrate a request from Director $\rightarrow$ Specialists $\rightarrow$ Director.
- [ ] Strategy Builder can generate a strategy $\rightarrow$ Backtest it $\rightarrow$ Report result.
- [ ] Frontend renders a pixel art room with at least one agent moving according to backend state.
- [ ] Telegram Bot sends an alert when the Risk Agent triggers a veto.
