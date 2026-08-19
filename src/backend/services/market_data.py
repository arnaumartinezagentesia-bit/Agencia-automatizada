from abc import ABC, abstractmethod
from typing import List, Dict, Any
import datetime
import random

class MarketDataInterface(ABC):
    @abstractmethod
    def get_ohlcv(self, symbol: str, timeframe: str) -> List[Dict[str, Any]]:
        """Fetch OHLCV data for a given symbol and timeframe."""
        pass

    @abstractmethod
    def get_news(self, symbol: str) -> List[Dict[str, Any]]:
        """Fetch recent news for a given symbol."""
        pass

class MarketDataService(MarketDataInterface):
    """
    Mock implementation of MarketDataService for deterministic testing.
    This can be replaced by a real implementation (e.g., BinanceMarketDataService).
    """
    def get_ohlcv(self, symbol: str, timeframe: str) -> List[Dict[str, Any]]:
        # Generate mock OHLCV data
        data = []
        now = datetime.datetime.now()
        for i in range(100):
            ts = now - datetime.timedelta(hours=i)
            data.append({
                "timestamp": ts.isoformat(),
                "open": random.uniform(1800, 2000),
                "high": random.uniform(2000, 2100),
                "low": random.uniform(1700, 1800),
                "close": random.uniform(1800, 2000),
                "volume": random.uniform(1000, 5000)
            })
        return data

    def get_news(self, symbol: str) -> List[Dict[str, Any]]:
        # Generate mock news data
        return [
            {"timestamp": datetime.datetime.now().isoformat(), "headline": f"Market outlook for {symbol} looks bullish", "sentiment": "positive"},
            {"timestamp": datetime.datetime.now().isoformat(), "headline": f"Central bank announces new rates affecting {symbol}", "sentiment": "neutral"},
            {"timestamp": datetime.datetime.now().isoformat(), "headline": f"Unexpected volatility in {symbol} prices", "sentiment": "negative"},
        ]
