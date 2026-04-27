from __future__ import annotations

import logging
from typing import Any, Dict, List, Tuple

from core.utils import timeframe_to_mt5
from engine.mt5_connector import MT5Connector


class MarketDataService:
    """Handles price/rate retrieval and symbol availability."""

    def __init__(self, connector: MT5Connector, logger: logging.Logger) -> None:
        self.connector = connector
        self.logger = logger

    def ensure_symbols_selected(self, symbols: List[str]) -> bool:
        all_ok = True
        for symbol in symbols:
            info = self.connector.symbol_info(symbol)
            if info is None or not getattr(info, "visible", False):
                if not self.connector.symbol_select(symbol):
                    self.logger.error("Cannot monitor symbol %s because selection failed", symbol)
                    all_ok = False
        return all_ok

    def get_symbol_data(
        self,
        symbol: str,
        timeframe: str,
        higher_timeframe: str,
        bars: int = 350,
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        lower = self.connector.get_rates(symbol, timeframe_to_mt5(timeframe), bars)
        higher = self.connector.get_rates(symbol, timeframe_to_mt5(higher_timeframe), bars)
        return lower, higher

    def get_spread_points(self, symbol: str) -> float:
        info = self.connector.symbol_info(symbol)
        tick = self.connector.symbol_tick(symbol)
        if info is None or tick is None:
            return float("inf")

        point = float(getattr(info, "point", 0.0) or 0.0)
        if point <= 0:
            return float("inf")

        return abs(float(tick.ask) - float(tick.bid)) / point
