# Infrastructure & Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the AI Agents Trading Enterprise to a cloud VPS, ensuring 24/7 autonomous operation, security (SSL), and real-time alerts via Telegram.

**Architecture:** Multi-container deployment using Docker Compose. A Nginx reverse proxy handles incoming traffic, routing it to the Next.js frontend and the FastAPI backend. All state is persisted in Redis and PostgreSQL.

**Tech Stack:** Docker, Docker Compose, Nginx, Certbot (SSL), Ubuntu 22.04 LTS, Telegram Bot API.

**Spec:** `docs/superpowers/specs/2026-08-19-agentes-ia-trading-enterprise-design.md`

## Global Constraints
- **24/7 Operation:** The backend must run as a background daemon.
- **Security:** No secrets in source code; all API keys and DB passwords must be in `.env`.
- **Connectivity:** WebSocket connections must be supported by the Nginx proxy.
- **Reliability:** Containers must auto-restart on failure.

---

## File Structure

### Docker Configuration
- `docker/backend.Dockerfile`: Optimized Python image for the agentic core.
- `docker/frontend.Dockerfile`: Multi-stage build for Next.js (Build -> Serve).
- `docker-compose.yml`: Service orchestration (Backend, Frontend, Redis, Postgres).
- `docker/.env.example`: Template for required environment variables.

### Server Orchestration
- `scripts/setup-vps.sh`: Automation script for installing Docker and Nginx on a fresh Ubuntu server.
- `nginx/conf.d/enterprise.conf`: Nginx configuration for routing and WebSocket support.

---

## Implementation Tasks

### Task 1: Dockerization of the Ecosystem

**Files:**
- Create: `docker/backend.Dockerfile`
- Create: `docker/frontend.Dockerfile`
- Create: `docker-compose.yml`
- Create: `docker/.env.example`

- [ ] **Step 1: Implement `backend.Dockerfile`**
  - Use `python:3.11-slim`.
  - Install system dependencies for `tree-sitter` and `psycopg2`.
  - Copy requirements and install.
  - Set `PYTHONUNBUFFERED=1`.
- [ ] **Step 2: Implement `frontend.Dockerfile`**
  - Use multi-stage build: `node:18-alpine` for build, `nginx:alpine` (or standalone node) for serving.
  - Optimize for production build.
- [ ] **Step 3: Create `docker-compose.yml`**
  - Define `backend`, `frontend`, `redis`, and `postgres` services.
  - Set up networks and volumes for DB persistence.
  - Configure `restart: always`.
- [ ] **Step 4: Create `.env.example`**
  - Include: `POSTGRES_PASSWORD`, `REDIS_URL`, `TELEGRAM_BOT_TOKEN`, `MARKET_DATA_API_KEY`.
- [ ] **Step 5: Local Verification**
  - Run `docker-compose up --build` and verify that the frontend can communicate with the backend.
- [ ] **Step 6: Commit**
  `git commit -m "feat: dockerize full enterprise ecosystem"`

### Task 2: VPS Hardening & Nginx Setup

**Files:**
- Create: `nginx/conf.d/enterprise.conf`
- Create: `scripts/setup-vps.sh`

- [ ] **Step 1: Create Nginx Configuration**
  - Configure `proxy_pass` for `/api` and `/ws` (WebSockets).
  - Ensure headers like `Upgrade` and `Connection` are set for WebSockets.
- [ ] **Step 2: Write `setup-vps.sh`**
  - Automation for: `apt update`, `docker install`, `docker-compose install`, `nginx install`.
- [ ] **Step 3: Implement SSL Automation**
  - Add `certbot` commands to the setup script to generate and auto-renew certificates.
- [ ] **Step 4: Verify connectivity on VPS**
  - Deploy a test container and verify HTTPS access.
- [ ] **Step 5: Commit**
  `git commit -m "feat: implement VPS setup and Nginx proxy"`

### Task 3: Final Telegram Integration & Autonomous Loop

**Files:**
- Modify: `src/backend/main.py`
- Modify: `src/backend/agents/director.py`

- [ ] **Step 1: Implement Telegram Alert Service**
  - Create a utility to send messages via `python-telegram-bot`.
- [ ] **Step 2: Connect Risk Veto to Telegram**
  - Trigger an immediate alert when `risk_veto` is set to `True`.
- [ ] **Step 3: Implement "Morning Briefing" Loop**
  - Schedule a daily task in the backend to send a market summary to Telegram.
- [ ] **Step 4: Verify bot alerts in real-time**
- [ ] **Step 5: Commit**
  `git commit -m "feat: finalize telegram integration and autonomous alerts"`

### Task 4: End-to-End Production Verification

- [ ] **Step 1: Full Deployment**
  - Run `scripts/setup-vps.sh` on the target server.
  - Deploy via `docker-compose`.
- [ ] **Step 2: Functional Smoke Test**
  - Verify: Login $\rightarrow$ Strategy Build $\rightarrow$ Agent Movement $\rightarrow$ Telegram Notification.
- [ ] **Step 3: Stability Check**
  - Monitor logs for 24h to ensure no memory leaks or container crashes.
- [ ] **Step 4: Final Handoff**
  - Document the deployment process and credentials management.
- [ ] **Step 5: Commit**
  `git commit -m "feat: complete production deployment and verification"`
