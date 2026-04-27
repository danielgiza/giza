from __future__ import annotations

import logging

from engine.mt5_connector import MT5Connector


class PositionSizer:
    """Calculates lot size by risk percent and stop distance."""

    def __init__(self, connector: MT5Connector, logger: logging.Logger) -> None:
        self.connector = connector
        self.logger = logger

    @staticmethod
    def _normalize_volume(raw_volume: float, min_v: float, max_v: float, step: float) -> float:
        bounded = min(max(raw_volume, min_v), max_v)
        if step <= 0:
            return round(bounded, 2)

        steps = round((bounded - min_v) / step)
        normalized = min_v + steps * step
        return round(max(min(normalized, max_v), min_v), 2)

    def calculate_volume(
        self,
        symbol: str,
        balance: float,
        risk_percent: float,
        sl_distance_price: float,
        min_volume_override: float | None = None,
        max_volume_override: float | None = None,
    ) -> float:
        info = self.connector.symbol_info(symbol)
        if info is None:
            self.logger.error("Position sizing failed: symbol info unavailable for %s", symbol)
            return 0.0

        point = float(getattr(info, "point", 0.0) or 0.0)
        tick_size = float(getattr(info, "trade_tick_size", 0.0) or 0.0)
        tick_value = float(getattr(info, "trade_tick_value", 0.0) or 0.0)

        if point <= 0 or tick_size <= 0 or tick_value <= 0 or sl_distance_price <= 0:
            self.logger.error("Position sizing failed for %s due to invalid symbol or SL data", symbol)
            return 0.0

        sl_points = sl_distance_price / point
        if sl_points <= 0:
            return 0.0

        risk_amount = balance * (risk_percent / 100.0)
        value_per_point_per_lot = tick_value / (tick_size / point)
        if value_per_point_per_lot <= 0:
            return 0.0

        raw_volume = risk_amount / (sl_points * value_per_point_per_lot)
        broker_min = float(getattr(info, "volume_min", 0.01) or 0.01)
        broker_max = float(getattr(info, "volume_max", 100.0) or 100.0)
        min_v = max(broker_min, float(min_volume_override)) if min_volume_override is not None else broker_min
        max_v = min(broker_max, float(max_volume_override)) if max_volume_override is not None else broker_max
        step = float(getattr(info, "volume_step", 0.01) or 0.01)
        if min_v > max_v:
            self.logger.error(
                "Invalid lot override for %s: min %.2f > max %.2f after broker limits",
                symbol,
                min_v,
                max_v,
            )
            return 0.0

        volume = self._normalize_volume(raw_volume, min_v, max_v, step)
        self.logger.info(
            "Position size for %s => raw=%.4f normalized=%.2f (risk %.2f%%, SL %.1f points)",
            symbol,
            raw_volume,
            volume,
            risk_percent,
            sl_points,
        )
        return volume
