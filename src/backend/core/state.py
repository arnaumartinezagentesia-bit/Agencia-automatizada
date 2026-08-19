from typing import TypedDict, List, Dict, Any

class AgentState(TypedDict):
    messages: List[Any]
    current_analysis: Dict[str, Any]
    risk_veto: bool
    final_verdict: str
    strategy_hypotheses: List[Dict[str, Any]]
