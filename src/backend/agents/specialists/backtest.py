from typing import Any, Dict
import logging
from src.backend.agents.base import BaseAgent
from src.backend.core.state import AgentState
from src.backend.services.backtest_engine import BacktestEngine

# Set up logging
logger = logging.getLogger(__name__)

class BacktestAgent(BaseAgent):
    """
    Trading Backtest Agent.
    Runs historical simulations and scores the result using a multi-dimensional framework.
    """
    def __init__(self):
        super().__init__("backtest")
        self.engine = BacktestEngine()

    def execute(self, state: AgentState) -> AgentState:
        # Check if we have a batch of hypotheses to test
        hypotheses = state.get("strategy_hypotheses")

        if hypotheses:
            logger.info(f"Running batch backtest for {len(hypotheses)} hypotheses")
            batch_results = []
            for h in hypotheses:
                params = h.get("params", {})
                metrics = self.engine.run(params)

                # Apply 5-Dimension Scoring
                scores = self._calculate_scores(metrics)
                avg_score = sum(scores.values()) / len(scores)

                batch_results.append({
                    "hypothesis_id": h.get("id"),
                    "description": h.get("description"),
                    "metrics": metrics,
                    "scores": scores,
                    "average_score": avg_score,
                    "verdict": self._determine_verdict(avg_score)
                })

            return self.update_analysis(state, "batch_backtest_results", batch_results)

        # Fallback to single strategy from current_analysis
        params = state.get("current_analysis", {}).get("strategy_params", {
            "symbol": "AAPL",
            "period": 252, # 1 year of trading days
            "strategy": "Breakout"
        })

        metrics = self.engine.run(params)
        scores = self._calculate_scores(metrics)
        avg_score = sum(scores.values()) / len(scores)

        backtest_report = {
            "metrics": metrics,
            "scores": scores,
            "average_score": avg_score,
            "verdict": self._determine_verdict(avg_score)
        }

        return self.update_analysis(state, "backtest_results", backtest_report)

    def _calculate_scores(self, metrics: Dict[str, Any]) -> Dict[str, float]:
        """Helper to calculate the 5-dimension scores."""
        trades_count = metrics.get("trades_count", 0)
        total_return = metrics.get("total_return", 0)
        max_dd = metrics.get("max_drawdown", 1.0)
        sharpe = metrics.get("sharpe_ratio", 0)

        return {
            "sample_size": min(100, (trades_count / 30) * 100),
            "expectancy": min(100, (total_return / (trades_count if trades_count > 0 else 1)) * 1000),
            "risk_mgmt": max(0, (1.0 - max_dd) * 100),
            "robustness": min(100, sharpe * 20),
            "execution_realism": 80 # Mocked
        }

    def _determine_verdict(self, avg_score: float) -> str:
        """Helper to determine verdict based on average score."""
        if avg_score > 80:
            return "DEPLOY"
        elif avg_score > 50:
            return "REFINE"
        else:
            return "ABANDON"
