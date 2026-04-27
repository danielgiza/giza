from __future__ import annotations

import logging
from typing import Any, List

try:
    import MetaTrader5 as mt5
except ImportError:  # pragma: no cover - environment-dependent
    mt5 = None  # type: ignore[assignment]

from engine.mt5_connector import MT5Connector


class PositionManager:
    """Reads and closes positions safely."""

    def __init__(self, connector: MT5Connector, logger: logging.Logger) -> None:
        self.connector = connector
        self.logger = logger

    def get_positions(self, symbol: str | None = None) -> List[Any]:
        return self.connector.positions_get(symbol=symbol)

    def count_open_positions(self) -> int:
        return len(self.get_positions())

    def has_direction_position(self, symbol: str, direction: str) -> bool:
        target = getattr(mt5, "POSITION_TYPE_BUY", 0) if direction == "buy" else getattr(mt5, "POSITION_TYPE_SELL", 1)
        for pos in self.get_positions(symbol=symbol):
            if int(getattr(pos, "type", -1)) == int(target):
                return True
        return False

    def close_position(self, position: Any, deviation: int, magic: int, comment: str) -> bool:
        if mt5 is None:
            return False

        symbol = str(position.symbol)
        tick = self.connector.symbol_tick(symbol)
        if tick is None:
            self.logger.error("Cannot close position %s: missing tick", position.ticket)
            return False

        if int(position.type) == int(getattr(mt5, "POSITION_TYPE_BUY", 0)):
            order_type = getattr(mt5, "ORDER_TYPE_SELL", 1)
            price = float(tick.bid)
        else:
            order_type = getattr(mt5, "ORDER_TYPE_BUY", 0)
            price = float(tick.ask)

        request = {
            "action": getattr(mt5, "TRADE_ACTION_DEAL", 1),
            "symbol": symbol,
            "volume": float(position.volume),
            "type": order_type,
            "position": int(position.ticket),
            "price": price,
            "deviation": deviation,
            "magic": magic,
            "comment": comment,
            "type_time": getattr(mt5, "ORDER_TIME_GTC", 0),
            "type_filling": self.connector.detect_filling_mode(symbol),
        }

        result = self.connector.order_send(request)
        if result is None:
            return False

        done = int(getattr(result, "retcode", -1)) == int(getattr(mt5, "TRADE_RETCODE_DONE", 10009))
        if not done:
            self.logger.error("Failed to close position %s retcode=%s", position.ticket, getattr(result, "retcode", None))
        return done

    def close_opposite_positions(self, symbol: str, new_direction: str, deviation: int, magic: int) -> None:
        if mt5 is None:
            return

        target = getattr(mt5, "POSITION_TYPE_BUY", 0) if new_direction == "buy" else getattr(mt5, "POSITION_TYPE_SELL", 1)
        for pos in self.get_positions(symbol=symbol):
            if int(getattr(pos, "type", -1)) != int(target):
                self.logger.info("Closing opposite position on %s ticket=%s", symbol, pos.ticket)
                self.close_position(pos, deviation, magic, "Close opposite signal")
