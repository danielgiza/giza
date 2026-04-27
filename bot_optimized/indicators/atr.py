from __future__ import annotations

from typing import List, Optional


def atr(high: List[float], low: List[float], close: List[float], period: int = 14) -> List[Optional[float]]:
    """Average True Range using Wilder smoothing."""

    n = len(close)
    out: List[Optional[float]] = [None] * n
    if n <= period:
        return out

    true_ranges: List[float] = []
    for i in range(n):
        if i == 0:
            tr = high[i] - low[i]
        else:
            tr = max(
                high[i] - low[i],
                abs(high[i] - close[i - 1]),
                abs(low[i] - close[i - 1]),
            )
        true_ranges.append(tr)

    initial = sum(true_ranges[1 : period + 1]) / period
    out[period] = initial
    prev = initial

    for i in range(period + 1, n):
        prev = ((prev * (period - 1)) + true_ranges[i]) / period
        out[i] = prev

    return out
