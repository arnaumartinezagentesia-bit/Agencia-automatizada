from abc import ABC, abstractmethod
from typing import Dict, Any
from src.backend.core.state import AgentState

class BaseAgent(ABC):
    """
    Base class for all trading agents.
    """
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def execute(self, state: AgentState) -> AgentState:
        """
        Executes the agent's logic and returns the updated state.
        """
        pass

    def update_analysis(self, state: AgentState, key: str, value: Any) -> AgentState:
        """
        Helper to update the current_analysis section of the state.
        """
        if "current_analysis" not in state:
            state["current_analysis"] = {}
        state["current_analysis"][key] = value
        return state
