from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List

from indicators.atr import atr
from indicators.ema import ema
from indicators.rsi import rsi


@dataclass
class SignalResult:
    signal: str
    reason: str
    atr_value: float
    ema50: float
    ema200: float
    rsi14: float
    trend_strength: float
    candle_confirmation: bool


class SwingStrategy:
    """EMA/RSI/ATR swing strategy with higher timeframe trend filter."""

    def __init__(self) -> None:
        self.min_bars = 220

    @staticmethod
    def _series(bars: List[Dict[str, Any]], field: str) -> List[float]:
        return [float(item[field]) for item in bars]

    def generate_signal(self, lower_bars: List[Dict[str, Any]], higher_bars: List[Dict[str, Any]]) -> SignalResult:
        if len(lower_bars) < self.min_bars or len(higher_bars) < self.min_bars:
            return SignalResult("hold", "not_enough_data", 0.0, 0.0, 0.0, 0.0, 0.0, False)

        close_l = self._series(lower_bars, "close")
        high_l = self._series(lower_bars, "high")
        low_l = self._series(lower_bars, "low")

        close_h = self._series(higher_bars, "close")

        ema50_l = ema(close_l, 50)
        ema200_l = ema(close_l, 200)
        rsi14_l = rsi(close_l, 14)
        atr14_l = atr(high_l, low_l, close_l, 14)

        ema50_h = ema(close_h, 50)
        ema200_h = ema(close_h, 200)

        idx = -2
        h_idx = -2

        values = [ema50_l[idx], ema200_l[idx], rsi14_l[idx], atr14_l[idx], ema50_h[h_idx], ema200_h[h_idx]]
        if any(value is None for value in values):
            return SignalResult("hold", "indicator_warmup", 0.0, 0.0, 0.0, 0.0, 0.0, False)

        closed_bar = lower_bars[idx]
        close = close_l[idx]
        ema50_val = float(ema50_l[idx])
        ema200_val = float(ema200_l[idx])
        rsi_val = float(rsi14_l[idx])
        atr_val = float(atr14_l[idx])
        last_open = float(closed_bar["open"])

        h_up = float(ema50_h[h_idx]) > float(ema200_h[h_idx])
        h_down = float(ema50_h[h_idx]) < float(ema200_h[h_idx])

        trend_strength = abs(ema50_val - ema200_val) / max(atr_val, 1e-9)
        candle_buy_confirm = close > last_open and close > ema50_val
        candle_sell_confirm = close < last_open and close < ema50_val

        buy = (
            ema50_val > ema200_val
            and candle_buy_confirm
            and 50.0 <= rsi_val <= 70.0
            and h_up
            and trend_strength >= 0.35
        )
        sell = (
            ema50_val < ema200_val
            and candle_sell_confirm
            and 30.0 <= rsi_val <= 50.0
            and h_down
            and trend_strength >= 0.35
        )

        if buy:
            return SignalResult("buy", "trend_follow_buy_strong", atr_val, ema50_val, ema200_val, rsi_val, trend_strength, True)
        if sell:
            return SignalResult("sell", "trend_follow_sell_strong", atr_val, ema50_val, ema200_val, rsi_val, trend_strength, True)

        return SignalResult("hold", "no_valid_setup", atr_val, ema50_val, ema200_val, rsi_val, trend_strength, False)
