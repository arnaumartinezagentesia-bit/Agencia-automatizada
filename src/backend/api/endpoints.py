from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel

from src.backend.core.state import AgentState
from src.backend.core.store import DepartmentContextStore
from src.backend.core.graph import create_trading_graph
from src.backend.agents.director import TradingDeskLead
from src.backend.agents.specialists.backtest import BacktestAgent

# Global store and graph instances
store = DepartmentContextStore()
trading_graph = create_trading_graph()

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    message: str

class StrategyRequest(BaseModel):
    session_id: str
    symbol: str
    strategy: str = "Breakout"
    period: int = 252

@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Real-time interaction with the LangGraph.
    """
    try:
        # 1. Load existing state or initialize new one
        state = store.get_state(request.session_id)
        if state is None:
            state = {
                "messages": [],
                "current_analysis": {},
                "risk_veto": False,
                "final_verdict": "",
                "strategy_hypotheses": [],
                "next_steps": []
            }

        # 2. Update messages
        state["messages"].append({"role": "user", "content": request.message})

        # 3. Invoke Graph
        final_state = trading_graph.invoke(state)

        # 4. Save state back to store
        store.save_state(request.session_id, final_state)

        return {
            "status": "success",
            "final_verdict": final_state.get("final_verdict"),
            "state": final_state
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/strategy/generate")
async def generate_strategy(request: StrategyRequest):
    """
    Triggers the strategy generation and validation loop.
    1. Director generates multiple hypotheses.
    2. Backtest Agent runs batch validation.
    """
    try:
        # 1. Load state or initialize
        state = store.get_state(request.session_id)
        if state is None:
            state = {
                "messages": [],
                "current_analysis": {},
                "risk_veto": False,
                "final_verdict": "",
                "strategy_hypotheses": [],
                "next_steps": []
            }

        director = TradingDeskLead()
        backtest_agent = BacktestAgent()

        # 2. Hypothesis Generation
        conditions = {
            "symbol": request.symbol,
            "strategy": request.strategy,
            "period": request.period
        }
        hypotheses = director.generate_hypotheses(conditions)

        # 3. Prepare Agent State
        state["strategy_hypotheses"] = hypotheses

        # 4. Batch Backtesting
        final_state = backtest_agent.execute(state)

        # 5. Save updated state
        store.save_state(request.session_id, final_state)

        # 6. Return results
        results = final_state.get("current_analysis", {}).get("batch_backtest_results", [])

        if not results:
            raise HTTPException(status_code=500, detail="Failed to generate backtest results")

        return {
            "status": "success",
            "symbol": request.symbol,
            "hypotheses_tested": len(hypotheses),
            "results": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
