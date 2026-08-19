import pytest
from fastapi.testclient import TestClient
from src.backend.main import app
from unittest.mock import patch

client = TestClient(app)

def test_chat_endpoint():
    """
    Tests the /api/chat endpoint:
    - Initializes a new session.
    - Processes a message through the LangGraph.
    - Verifies the final verdict is returned.
    """
    # Mock store to avoid real Redis dependency in CI/tests
    with patch('src.backend.api.endpoints.store') as mock_store:
        mock_store.get_state.return_value = None  # Simulate new session
        mock_store.save_state.return_value = None

        payload = {
            "session_id": "test_session_chat",
            "message": "Analyze Gold"
        }
        response = client.post("/api/chat", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        # Based on current mock graph implementation, it should return "Bullish"
        assert "final_verdict" in data
        assert "Bullish" in data["final_verdict"]

        # Verify state was persisted
        mock_store.save_state.assert_called_once()

def test_strategy_generation_endpoint():
    """
    Tests the /api/strategy/generate endpoint:
    - Initializes a new session.
    - Generates and backtests strategy hypotheses.
    - Verifies the comparative report is returned.
    """
    with patch('src.backend.api.endpoints.store') as mock_store:
        mock_store.get_state.return_value = None
        mock_store.save_state.return_value = None

        payload = {
            "session_id": "test_session_strat",
            "symbol": "XAUUSD",
            "strategy": "Breakout"
        }
        response = client.post("/api/strategy/generate", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "results" in data
        assert len(data["results"]) > 0

        # Verify state was persisted
        mock_store.save_state.assert_called_once()

def test_session_persistence_chat():
    """
    Tests that the chat endpoint loads existing state.
    """
    existing_state = {
        "messages": [{"role": "user", "content": "Hello"}],
        "current_analysis": {},
        "risk_veto": False,
        "final_verdict": "",
        "strategy_hypotheses": [],
        "next_steps": []
    }

    with patch('src.backend.api.endpoints.store') as mock_store:
        mock_store.get_state.return_value = existing_state
        mock_store.save_state.return_value = None

        payload = {
            "session_id": "existing_session",
            "message": "Analyze Silver"
        }
        response = client.post("/api/chat", json=payload)

        assert response.status_code == 200
        data = response.json()
        # Verify that the final state contains both messages
        state = data["state"]
        assert len(state["messages"]) == 2
        assert state["messages"][0]["content"] == "Hello"
        assert state["messages"][1]["content"] == "Analyze Silver"
