import pytest
from src.backend.core.state import AgentState
from src.backend.agents.specialists.market_intel import MarketIntelligenceAgent
from src.backend.agents.specialists.pattern_det import PatternDetectionAgent
from src.backend.agents.specialists.risk_mgmt import RiskManagementAgent
from src.backend.agents.specialists.backtest import BacktestAgent

def test_market_intelligence_agent():
    agent = MarketIntelligenceAgent()
    state: AgentState = {
        "messages": [],
        "current_analysis": {"trend": "up"},
        "risk_veto": False,
        "final_verdict": "",
        "strategy_hypotheses": []
    }
    new_state = agent.execute(state)
    assert "market_intelligence" in new_state["current_analysis"]
    assert new_state["current_analysis"]["market_intelligence"]["recommendation"] == "Aggressive"

def test_pattern_detection_agent():
    agent = PatternDetectionAgent()
    state: AgentState = {
        "messages": [],
        "current_analysis": {},
        "risk_veto": False,
        "final_verdict": "",
        "strategy_hypotheses": []
    }
    new_state = agent.execute(state)
    assert "detected_patterns" in new_state["current_analysis"]
    assert len(new_state["current_analysis"]["detected_patterns"]) > 0

def test_risk_management_agent_no_veto():
    agent = RiskManagementAgent()
    state: AgentState = {
        "messages": [],
        "current_analysis": {"current_drawdown": 0.02, "open_positions_count": 2},
        "risk_veto": False,
        "final_verdict": "",
        "strategy_hypotheses": []
    }
    new_state = agent.execute(state)
    assert new_state["risk_veto"] is False
    assert "risk_assessment" in new_state["current_analysis"]

def test_risk_management_agent_veto():
    agent = RiskManagementAgent()
    state: AgentState = {
        "messages": [],
        "current_analysis": {"current_drawdown": 0.15, "open_positions_count": 2},
        "risk_veto": False,
        "final_verdict": "",
        "strategy_hypotheses": []
    }
    new_state = agent.execute(state)
    assert new_state["risk_veto"] is True
    assert "reason" in new_state["current_analysis"]["risk_assessment"]

def test_backtest_agent():
    agent = BacktestAgent()
    state: AgentState = {
        "messages": [],
        "current_analysis": {
            "strategy_params": {"symbol": "TSLA", "period": 100, "strategy": "Trend"}
        },
        "risk_veto": False,
        "final_verdict": "",
        "strategy_hypotheses": []
    }
    new_state = agent.execute(state)
    assert "backtest_results" in new_state["current_analysis"]
    results = new_state["current_analysis"]["backtest_results"]
    assert "verdict" in results
    assert "scores" in results
