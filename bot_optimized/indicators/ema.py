from __future__ import annotations

from typing import List, Optional


def ema(values: List[float], period: int) -> List[Optional[float]]:
    """Exponential moving average."""

    if period <= 0:
        raise ValueError("period must be > 0")

    result: List[Optional[float]] = [None] * len(values)
    if len(values) < period:
        return result

    multiplier = 2 / (period + 1)
    sma = sum(values[:period]) / period
    result[period - 1] = sma
    prev = sma

    for idx in range(period, len(values)):
        prev = (values[idx] - prev) * multiplier + prev
        result[idx] = prev

    return result
