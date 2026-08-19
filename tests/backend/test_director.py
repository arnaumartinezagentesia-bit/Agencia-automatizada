import pytest
from src.backend.agents.director import TradingDeskLead

def test_director_routing_logic():
    director = TradingDeskLead()
    state = {
        "messages": [{"role": "user", "content": "Analyze Gold (XAUUSD) for a long-term trade"}],
        "current_analysis": {},
        "risk_veto": False,
        "final_verdict": ""
    }

    # The director should decide which specialists to call.
    # For "Analyze Gold", it should probably call market intel and pattern detection.
    routing_decision = director.route(state)

    assert "market_intel" in routing_decision
    assert "pattern_detection" in routing_decision
    assert "risk_mgmt" in routing_decision

def test_director_synthesis_positive():
    director = TradingDeskLead()
    state = {
        "messages": [{"role": "user", "content": "Analyze Gold (XAUUSD)"}],
        "current_analysis": {
            "macro": "Bullish outlook due to inflation",
            "technical": "Strong support at 2000, bullish pattern detected",
            "backtest_results": {"cagr": 15, "max_drawdown": 5, "sharpe": 2.0}
        },
        "risk_veto": False,
        "final_verdict": ""
    }

    res = director.synthesize(state)
    verdict = res["final_verdict"]

    assert "BUY" in verdict.upper() or "POSITIVE" in verdict.upper()
    assert "inflation" in verdict.lower()
    assert "support" in verdict.lower()

def test_director_respects_veto():
    director = TradingDeskLead()
    state = {
        "messages": [{"role": "user", "content": "Analyze Gold (XAUUSD)"}],
        "current_analysis": {
            "macro": "Extremely Bullish",
            "technical": "Strong Buy",
            "backtest_results": {"cagr": 50, "max_drawdown": 2, "sharpe": 5.0}
        },
        "risk_veto": True,
        "final_verdict": ""
    }

    res = director.synthesize(state)
    verdict = res["final_verdict"]

    # Even with great analysis, risk_veto=True must result in REJECTED or CAUTION
    assert "REJECTED" in verdict.upper() or "CAUTION" in verdict.upper() or "AVOID" in verdict.upper()
    assert "risk" in verdict.lower()
