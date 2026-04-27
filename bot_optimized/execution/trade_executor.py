from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Dict, Tuple

try:
    import MetaTrader5 as mt5
except ImportError:  # pragma: no cover - environment-dependent
    mt5 = None  # type: ignore[assignment]

from core.config_loader import BotConfig
from execution.order_manager import OrderManager
from execution.position_manager import PositionManager
from risk.position_sizing import PositionSizer
from risk.risk_manager import RiskManager
from strategy.swing_strategy import SignalResult


class TradeExecutor:
    """Coordinates signal execution with risk and position safety controls."""

    def __init__(
        self,
        config: BotConfig,
        order_manager: OrderManager,
        position_manager: PositionManager,
        sizer: PositionSizer,
        risk_manager: RiskManager,
        logger: logging.Logger,
    ) -> None:
        self.config = config
        self.order_manager = order_manager
        self.position_manager = position_manager
        self.sizer = sizer
        self.risk_manager = risk_manager
        self.logger = logger
        self.recent_orders: Dict[str, datetime] = {}

    def _is_duplicate(self, symbol: str, direction: str) -> bool:
        key = f"{symbol}:{direction}"
        last = self.recent_orders.get(key)
        if last and datetime.now() - last < timedelta(seconds=60):
            return True
        return False

    def _mark_order(self, symbol: str, direction: str) -> None:
        self.recent_orders[f"{symbol}:{direction}"] = datetime.now()

    def _build_levels(self, symbol: str, direction: str, atr_value: float) -> Tuple[float, float, float]:
        tick = self.order_manager.connector.symbol_tick(symbol)
        if tick is None:
            return 0.0, 0.0, 0.0

        price = float(tick.ask if direction == "buy" else tick.bid)
        sl_distance = atr_value * self.config.atr_sl_multiplier
        tp_distance = atr_value * self.config.atr_tp_multiplier

        if direction == "buy":
            sl = price - sl_distance
            tp = price + tp_distance
        else:
            sl = price + sl_distance
            tp = price - tp_distance

        return price, sl, tp

    def apply_trailing_stop(self, symbol: str, atr_value: float) -> None:
        if not self.config.trailing_stop_enabled or atr_value <= 0 or mt5 is None:
            return

        info = self.order_manager.connector.symbol_info(symbol)
        tick = self.order_manager.connector.symbol_tick(symbol)
        if info is None or tick is None:
            return

        point = float(getattr(info, "point", 0.0) or 0.0)
        min_distance_points = max(
            float(getattr(info, "trade_stops_level", 0.0) or 0.0),
            float(getattr(info, "trade_freeze_level", 0.0) or 0.0),
        )

        for pos in self.position_manager.get_positions(symbol=symbol):
            if int(getattr(pos, "magic", 0)) != self.config.magic_number:
                continue

            if int(pos.type) == int(getattr(mt5, "POSITION_TYPE_BUY", 0)):
                candidate_sl = float(tick.bid) - atr_value * self.config.atr_sl_multiplier
                if candidate_sl <= float(getattr(pos, "sl", 0.0) or 0.0):
                    continue
                if point > 0 and ((float(tick.bid) - candidate_sl) / point) < min_distance_points:
                    continue
            else:
                existing_sl = float(getattr(pos, "sl", 0.0) or 0.0)
                candidate_sl = float(tick.ask) + atr_value * self.config.atr_sl_multiplier
                if existing_sl > 0 and candidate_sl >= existing_sl:
                    continue
                if point > 0 and ((candidate_sl - float(tick.ask)) / point) < min_distance_points:
                    continue

            request = {
                "action": getattr(mt5, "TRADE_ACTION_SLTP", 6),
                "position": int(pos.ticket),
                "symbol": symbol,
                "sl": candidate_sl,
                "tp": float(getattr(pos, "tp", 0.0) or 0.0),
                "magic": self.config.magic_number,
                "comment": "ATR trailing stop",
            }
            self.order_manager.connector.order_send(request)

    def execute_signal(
        self,
        symbol: str,
        signal: SignalResult,
        spread_points: float,
        capital_for_sizing: float,
        current_balance: float,
    ) -> Tuple[bool, str]:
        if signal.signal not in {"buy", "sell"}:
            self.apply_trailing_stop(symbol, signal.atr_value)
            return True, "no entry signal"

        if not self.risk_manager.is_spread_acceptable(spread_points):
            return False, f"spread too high: {spread_points:.1f} points"

        can_trade, reason = self.risk_manager.can_trade(current_balance, self.position_manager.count_open_positions())
        if not can_trade:
            return False, reason

        if self.position_manager.has_direction_position(symbol, signal.signal):
            return False, f"position already exists: {symbol} {signal.signal}"

        if self._is_duplicate(symbol, signal.signal):
            return False, "duplicate order prevented"

        self.position_manager.close_opposite_positions(
            symbol,
            new_direction=signal.signal,
            deviation=self.config.deviation,
            magic=self.config.magic_number,
        )

        price, sl, tp = self._build_levels(symbol, signal.signal, signal.atr_value)
        if price <= 0 or sl <= 0 or tp <= 0:
            return False, "failed to build order levels"

        volume = self.sizer.calculate_volume(
            symbol=symbol,
            balance=capital_for_sizing,
            risk_percent=self.config.risk_per_trade,
            sl_distance_price=abs(price - sl),
        )
        if volume <= 0:
            return False, "position size computed as zero"

        ok, msg, _ = self.order_manager.place_market_order(
            symbol=symbol,
            direction=signal.signal,
            volume=volume,
            sl=sl,
            tp=tp,
            deviation=self.config.deviation,
            magic=self.config.magic_number,
            comment=f"SwingBot {signal.signal.upper()}",
        )

        if ok:
            self._mark_order(symbol, signal.signal)
            return True, f"{signal.signal} order executed"

        return False, msg
