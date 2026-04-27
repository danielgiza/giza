from __future__ import annotations

import logging
from typing import Any, Tuple

try:
    import MetaTrader5 as mt5
except ImportError:  # pragma: no cover - environment-dependent
    mt5 = None  # type: ignore[assignment]

from engine.mt5_connector import MT5Connector


class OrderManager:
    """Validates and sends market orders with safe retries."""

    def __init__(self, connector: MT5Connector, logger: logging.Logger) -> None:
        self.connector = connector
        self.logger = logger

    def validate_order(self, symbol: str, direction: str, volume: float, sl: float, tp: float) -> Tuple[bool, str]:
        if mt5 is None:
            return False, "MetaTrader5 package not available"

        info = self.connector.symbol_info(symbol)
        tick = self.connector.symbol_tick(symbol)
        if info is None or tick is None:
            return False, "symbol info or tick unavailable"

        if not getattr(info, "select", True) and not self.connector.symbol_select(symbol):
            return False, "symbol not selected"

        min_volume = float(getattr(info, "volume_min", 0.01) or 0.01)
        max_volume = float(getattr(info, "volume_max", 100.0) or 100.0)
        if not (min_volume <= volume <= max_volume):
            return False, f"invalid lot size {volume} (allowed {min_volume}..{max_volume})"

        point = float(getattr(info, "point", 0.0) or 0.0)
        if point <= 0:
            return False, "invalid symbol point"

        stop_level = float(getattr(info, "trade_stops_level", 0.0) or 0.0)
        freeze_level = float(getattr(info, "trade_freeze_level", 0.0) or 0.0)
        min_distance_points = max(stop_level, freeze_level)

        price = float(tick.ask if direction == "buy" else tick.bid)
        if direction == "buy":
            if not (sl < price < tp):
                return False, "buy SL/TP invalid relative to entry"
            sl_dist = (price - sl) / point
            tp_dist = (tp - price) / point
        else:
            if not (tp < price < sl):
                return False, "sell SL/TP invalid relative to entry"
            sl_dist = (sl - price) / point
            tp_dist = (price - tp) / point

        if sl_dist < min_distance_points or tp_dist < min_distance_points:
            return (
                False,
                f"SL/TP too close. min={min_distance_points:.1f} points, got sl={sl_dist:.1f}, tp={tp_dist:.1f}",
            )

        return True, "OK"

    def place_market_order(
        self,
        symbol: str,
        direction: str,
        volume: float,
        sl: float,
        tp: float,
        deviation: int,
        magic: int,
        comment: str,
        retries: int = 2,
    ) -> Tuple[bool, str, Any]:
        if mt5 is None:
            return False, "MetaTrader5 package not available", None

        valid, reason = self.validate_order(symbol, direction, volume, sl, tp)
        if not valid:
            return False, reason, None

        order_type = getattr(mt5, "ORDER_TYPE_BUY", 0) if direction == "buy" else getattr(mt5, "ORDER_TYPE_SELL", 1)
        safe_retcodes = {
            int(getattr(mt5, "TRADE_RETCODE_REQUOTE", 10004)),
            int(getattr(mt5, "TRADE_RETCODE_PRICE_CHANGED", 10020)),
            int(getattr(mt5, "TRADE_RETCODE_PRICE_OFF", 10021)),
        }

        for attempt in range(retries + 1):
            tick = self.connector.symbol_tick(symbol)
            if tick is None:
                return False, "missing market tick", None

            price = float(tick.ask if direction == "buy" else tick.bid)
            request = {
                "action": getattr(mt5, "TRADE_ACTION_DEAL", 1),
                "symbol": symbol,
                "volume": volume,
                "type": order_type,
                "price": price,
                "sl": sl,
                "tp": tp,
                "deviation": deviation,
                "magic": magic,
                "comment": comment,
                "type_time": getattr(mt5, "ORDER_TIME_GTC", 0),
                "type_filling": self.connector.detect_filling_mode(symbol),
            }

            result = self.connector.order_send(request)
            if result is None:
                return False, "order_send returned None", None

            retcode = int(getattr(result, "retcode", -1))
            if retcode in {
                int(getattr(mt5, "TRADE_RETCODE_DONE", 10009)),
                int(getattr(mt5, "TRADE_RETCODE_PLACED", 10008)),
            }:
                return True, "order executed", result

            if retcode in safe_retcodes and attempt < retries:
                self.logger.warning("Retrying order for %s due to retcode %s (attempt %s)", symbol, retcode, attempt + 1)
                continue

            return False, f"order rejected retcode={retcode}", result

        return False, "order retry limit reached", None
