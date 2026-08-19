import pytest
from src.backend.services.market_data import MarketDataService
from src.backend.services.backtest_engine import BacktestEngine

def test_market_data_service_get_ohlcv():
    service = MarketDataService()
    symbol = "XAUUSD"
    tf = "1h"
    data = service.get_ohlcv(symbol, tf)

    assert isinstance(data, list)
    assert len(data) > 0
    # Check if it's a list of dicts with OHLCV keys
    first_row = data[0]
    assert all(key in first_row for key in ["timestamp", "open", "high", "low", "close", "volume"])

def test_market_data_service_get_news():
    service = MarketDataService()
    symbol = "XAUUSD"
    news = service.get_news(symbol)

    assert isinstance(news, list)
    assert len(news) > 0
    assert "headline" in news[0]

def test_backtest_engine_returns_metrics():
    engine = BacktestEngine()
    params = {"symbol": "XAUUSD", "period": 20, "strategy": "SMA_Cross"}
    res = engine.run(params)

    assert "cagr" in res
    assert "max_drawdown" in res
    assert "sharpe_ratio" in res
    assert isinstance(res["cagr"], float)
    assert isinstance(res["max_drawdown"], float)
    assert isinstance(res["sharpe_ratio"], float)
