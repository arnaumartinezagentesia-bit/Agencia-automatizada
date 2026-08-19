from typing import Literal, List, Dict, Any
from langgraph.graph import StateGraph, END
from src.backend.core.state import AgentState

# --- Node Functions ---

def director(state: AgentState):
    """
    Root node that orchestrates the flow.
    It determines which specialists to call and performs final synthesis.
    """
    print("--- NODE: DIRECTOR ---")

    # 1. If we already have a final verdict, we are done
    if state.get("final_verdict"):
        return state

    # 2. Handle Risk Veto: immediately trigger synthesis
    if state.get("risk_veto"):
        print("Risk veto detected. Bypassing further analysis.")
        # Clearing next_steps forces synthesis in the next director pass
        # or we can just synthesize now.
        return {
            "next_steps": [],
            "final_verdict": "TRADE REJECTED: Risk management vetoed the trade based on current parameters."
        }

    # 3. Initial Planning: Determine which specialists to call
    if not state.get("current_analysis") and not state.get("next_steps"):
        print("Planning analysis path...")
        # In a real implementation, this would be an LLM call.
        # We'll simulate based on common trading analysis needs.
        # For the purpose of this orchestration task, we'll assume a standard set.
        return {"next_steps": ["market_intel", "pattern_det", "risk_mgmt"]}

    # 4. Final Synthesis: All requested specialists have run
    if state.get("current_analysis") and not state.get("next_steps"):
        print("Synthesizing findings into final verdict...")
        # Simulate synthesis of results from current_analysis
        analysis = state.get("current_analysis", {})
        verdict = f"Final Verdict: Bullish. Analysis: {analysis}"
        return {"final_verdict": verdict}

    # 5. Continuation: Keep existing next_steps and let the router handle it
    return state

def market_intel(state: AgentState):
    print("--- NODE: MARKET INTEL ---")
    # Update analysis and remove self from next_steps
    current_analysis = state.get("current_analysis", {}).copy()
    current_analysis["market_intel"] = "Market is in a strong uptrend with positive momentum."

    next_steps = state.get("next_steps", []).copy()
    if "market_intel" in next_steps:
        next_steps.remove("market_intel")

    return {"current_analysis": current_analysis, "next_steps": next_steps}

def pattern_det(state: AgentState):
    print("--- NODE: PATTERN DET ---")
    current_analysis = state.get("current_analysis", {}).copy()
    current_analysis["pattern_det"] = "Bullish flag pattern identified on the 4h timeframe."

    next_steps = state.get("next_steps", []).copy()
    if "pattern_det" in next_steps:
        next_steps.remove("pattern_det")

    return {"current_analysis": current_analysis, "next_steps": next_steps}

def risk_mgmt(state: AgentState):
    print("--- NODE: RISK MGMT ---")
    current_analysis = state.get("current_analysis", {}).copy()
    current_analysis["risk_mgmt"] = "Risk-reward ratio is 3:1. Position size within limits."

    # We can simulate a risk veto here if needed for tests
    # risk_veto = True if some_condition else False
    risk_veto = False

    next_steps = state.get("next_steps", []).copy()
    if "risk_mgmt" in next_steps:
        next_steps.remove("risk_mgmt")

    return {"current_analysis": current_analysis, "next_steps": next_steps, "risk_veto": risk_veto}

def backtest(state: AgentState):
    print("--- NODE: BACKTEST ---")
    current_analysis = state.get("current_analysis", {}).copy()
    current_analysis["backtest"] = "Strategy has a 65% win rate over the last 100 trades."

    next_steps = state.get("next_steps", []).copy()
    if "backtest" in next_steps:
        next_steps.remove("backtest")

    return {"current_analysis": current_analysis, "next_steps": next_steps}

# --- Routing Logic ---

def route_from_director(state: AgentState) -> Literal["market_intel", "pattern_det", "risk_mgmt", "backtest", "director", END]:
    if state.get("final_verdict"):
        return END

    next_steps = state.get("next_steps", [])
    if not next_steps:
        # If no next steps, return to director for synthesis (if analysis exists)
        if state.get("current_analysis"):
            return "director"
        return END

    # Route to the first pending specialist
    return next_steps[0]

# --- Graph Construction ---

def create_trading_graph():
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("director", director)
    workflow.add_node("market_intel", market_intel)
    workflow.add_node("pattern_det", pattern_det)
    workflow.add_node("risk_mgmt", risk_mgmt)
    workflow.add_node("backtest", backtest)

    # Set Entry Point
    workflow.set_entry_point("director")

    # Conditional Edges from Director
    workflow.add_conditional_edges(
        "director",
        route_from_director,
        {
            "market_intel": "market_intel",
            "pattern_det": "pattern_det",
            "risk_mgmt": "risk_mgmt",
            "backtest": "backtest",
            "director": "director",
            END: END
        }
    )

    # Edges from Specialists back to Director
    workflow.add_edge("market_intel", "director")
    workflow.add_edge("pattern_det", "director")
    workflow.add_edge("risk_mgmt", "director")
    workflow.add_edge("backtest", "director")

    return workflow.compile()
