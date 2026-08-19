import logging
from typing import Dict, List, Any, Set

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TradingDeskLead:
    """
    The Director (Trading Desk Lead) responsible for routing requests to specialists
    and synthesizing their analysis into a final executive verdict.
    """

    def __init__(self):
        # Define keywords for routing to specialists
        self.routing_map = {
            "market_intel": ["macro", "news", "inflation", "fed", "economy", "outlook", "global"],
            "pattern_detection": ["technical", "pattern", "support", "resistance", "chart", "trend", "indicator"],
            "risk_mgmt": ["risk", "stop loss", "drawdown", "volatility", "exposure", "hedge"],
            "backtest": ["backtest", "performance", "cagr", "sharpe", "metrics", "historical"]
        }

    def route(self, state: Dict[str, Any]) -> Set[str]:
        """
        Decides which specialists to call based on the user's request.
        """
        query = ""
        if "messages" in state and state["messages"]:
            # Get the content of the last user message
            for msg in reversed(state["messages"]):
                if msg.get("role") == "user":
                    query = msg.get("content", "").lower()
                    break

        if not query:
            logger.warning("No user query found in state for routing.")
            return {"market_intel", "risk_mgmt"} # Default minimum set

        selected_specialists = set()
        for specialist, keywords in self.routing_map.items():
            if any(keyword in query for keyword in keywords):
                selected_specialists.add(specialist)

        # Always include risk_mgmt for every trade analysis
        selected_specialists.add("risk_mgmt")

        # If no specific keywords matched but we have a query, provide a basic set
        if len(selected_specialists) == 1: # Only risk_mgmt
             selected_specialists.update({"market_intel", "pattern_detection"})

        logger.info(f"Routing query: '{query}' -> Specialists: {selected_specialists}")
        return selected_specialists

    def synthesize(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesizes analysis from specialists into a final professional verdict.
        Respects the Risk Veto absolutely.
        """
        analysis = state.get("current_analysis", {})
        risk_veto = state.get("risk_veto", False)

        # 1. Handle Risk Veto (Highest Priority)
        if risk_veto:
            verdict = (
                "VERDICT: REJECTED / HIGH CAUTION\n\n"
                "Executive Summary: Despite potentially positive signals in other areas, "
                "the Risk Management agent has issued a VETO. "
                "Current market conditions or internal risk parameters exceed acceptable thresholds. "
                "Trading is NOT recommended at this time."
            )
            return {**state, "final_verdict": verdict}

        # 2. Gather components for synthesis
        macro = analysis.get("macro", "No macro analysis provided.")
        technical = analysis.get("technical", "No technical analysis provided.")
        backtest = analysis.get("backtest_results", {})

        # Determine backtest summary
        if backtest:
            cagr = backtest.get("cagr", 0)
            sharpe = backtest.get("sharpe", 0)
            backtest_summary = f"Backtest metrics show CAGR of {cagr}% and Sharpe Ratio of {sharpe}."
        else:
            backtest_summary = "No backtesting data available."

        # 3. Construct professional verdict
        # Simple heuristic for demo: if macro and technical both look positive
        positive_indicators = 0
        if "bullish" in macro.lower() or "positive" in macro.lower(): positive_indicators += 1
        if "bullish" in technical.lower() or "buy" in technical.lower() or "support" in technical.lower(): positive_indicators += 1

        if positive_indicators >= 2:
            verdict_status = "BUY / POSITIVE"
            recommendation = "Proceed with the strategy given the convergence of macro and technical signals."
        elif positive_indicators == 1:
            verdict_status = "NEUTRAL / HOLD"
            recommendation = "Wait for further confirmation as indicators are mixed."
        else:
            verdict_status = "AVOID / NEGATIVE"
            recommendation = "Do not enter position; indicators do not align with trade requirements."

        final_verdict = (
            f"VERDICT: {verdict_status}\n\n"
            f"Executive Summary:\n"
            f"- Macro: {macro}\n"
            f"- Technical: {technical}\n"
            f"- Performance: {backtest_summary}\n\n"
            f"Recommendation: {recommendation}"
        )

        return {**state, "final_verdict": final_verdict}

def director_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Functional wrapper for LangGraph node.
    Note: In a real LangGraph, the routing is handled by conditional edges,
    but synthesis is handled by the node.
    """
    director = TradingDeskLead()
    # If we are at the synthesis stage (final_verdict is empty but analysis exists)
    if not state.get("final_verdict") and state.get("current_analysis"):
        return director.synthesize(state)

    return state
