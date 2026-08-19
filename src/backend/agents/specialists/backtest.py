from typing import Any
from src.backend.agents.base import BaseAgent
from src.backend.core.state import AgentState
from src.backend.services.backtest_engine import BacktestEngine

class BacktestAgent(BaseAgent):
    """
    Trading Backtest Agent.
    Runs historical simulations and scores the result using a multi-dimensional framework.
    """
    def __init__(self):
        super().__init__("backtest")
        self.engine = BacktestEngine()

    def execute(self, state: AgentState) -> AgentState:
        # Extract strategy parameters from state
        # In a real system, these would be provided by the PatternDetectionAgent or StrategyDesigner
        params = state.get("current_analysis", {}).get("strategy_params", {
            "symbol": "AAPL",
            "period": 252, # 1 year of trading days
            "strategy": "Breakout"
        })

        # Run the backtest
        metrics = self.engine.run(params)

        # Apply 5-Dimension Scoring (based on backtest-expert.md)
        # 1. Sample Size (Trades Count)
        # 2. Expectancy (Total Return / Trades)
        # 3. Risk Management (Max Drawdown)
        # 4. Robustness (Sharpe Ratio)
        # 5. Execution Realism (Mocked here)

        trades_count = metrics.get("trades_count", 0)
        total_return = metrics.get("total_return", 0)
        max_dd = metrics.get("max_drawdown", 1.0)
        sharpe = metrics.get("sharpe_ratio", 0)

        # Simple scoring logic (0-100)
        scores = {
            "sample_size": min(100, (trades_count / 30) * 100), # 30 trades as baseline
            "expectancy": min(100, (total_return / (trades_count if trades_count > 0 else 1)) * 1000),
            "risk_mgmt": max(0, (1.0 - max_dd) * 100),
            "robustness": min(100, sharpe * 20),
            "execution_realism": 80 # Mocked
        }

        avg_score = sum(scores.values()) / len(scores)

        # Determine Verdict
        if avg_score > 80:
            verdict = "DEPLOY"
        elif avg_score > 50:
            verdict = "REFINE"
        else:
            verdict = "ABANDON"

        backtest_report = {
            "metrics": metrics,
            "scores": scores,
            "average_score": avg_score,
            "verdict": verdict
        }

        return self.update_analysis(state, "backtest_results", backtest_report)
