import pytest
from src.backend.core.graph import create_trading_graph
from src.backend.core.state import AgentState

def test_full_orchestration_flow():
    """
    Verifies that a user query triggers the director, which then invokes
    specialists and finally produces a final verdict.
    """
    graph = create_trading_graph()

    initial_state: AgentState = {
        "messages": [{"role": "user", "content": "Analyze XAU/USD"}],
        "current_analysis": {},
        "risk_veto": False,
        "final_verdict": "",
        "strategy_hypotheses": [],
        "next_steps": []
    }

    # Run the graph
    final_state = graph.invoke(initial_state)

    # Verify that the final verdict was produced
    assert final_state["final_verdict"] != ""
    assert "Final Verdict: Bullish" in final_state["final_verdict"]

    # Verify that expected specialists were called
    analysis = final_state["current_analysis"]
    assert "market_intel" in analysis
    assert "pattern_det" in analysis
    assert "risk_mgmt" in analysis

    print(f"Full flow success: {final_state['final_verdict']}")

def test_risk_veto_bypass():
    """
    Verifies that if risk_veto is True, the graph bypasses further analysis
    and goes straight to a rejected verdict.
    """
    graph = create_trading_graph()

    # Initial state with risk_veto already True
    initial_state: AgentState = {
        "messages": [{"role": "user", "content": "Analyze XAU/USD"}],
        "current_analysis": {},
        "risk_veto": True,
        "final_verdict": "",
        "strategy_hypotheses": [],
        "next_steps": []
    }

    final_state = graph.invoke(initial_state)

    # Verify that the verdict is a rejection
    assert "TRADE REJECTED" in final_state["final_verdict"]

    # Verify that no specialist analysis was performed (since it bypassed)
    # Note: in our graph, the director handles risk_veto immediately.
    assert not final_state["current_analysis"] or "market_intel" not in final_state["current_analysis"]

    print(f"Risk veto success: {final_state['final_verdict']}")

def test_single_specialist_flow():
    """
    Verifies that the director can route to a specific specialist if requested.
    """
    graph = create_trading_graph()

    # Start with only backtest in next_steps
    initial_state: AgentState = {
        "messages": [{"role": "user", "content": "Backtest my strategy"}],
        "current_analysis": {},
        "risk_veto": False,
        "final_verdict": "",
        "strategy_hypotheses": [],
        "next_steps": ["backtest"]
    }

    final_state = graph.invoke(initial_state)

    assert "backtest" in final_state["current_analysis"]
    assert final_state["final_verdict"] != ""
