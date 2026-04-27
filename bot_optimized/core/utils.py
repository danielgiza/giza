from __future__ import annotations

from datetime import datetime, time
from typing import Dict

try:
    import MetaTrader5 as mt5
except ImportError:  # pragma: no cover - environment-dependent
    mt5 = None  # type: ignore[assignment]


TIMEFRAME_MAP: Dict[str, int] = {
    "M1": int(getattr(mt5, "TIMEFRAME_M1", 1)),
    "M5": int(getattr(mt5, "TIMEFRAME_M5", 5)),
    "M15": int(getattr(mt5, "TIMEFRAME_M15", 15)),
    "M30": int(getattr(mt5, "TIMEFRAME_M30", 30)),
    "H1": int(getattr(mt5, "TIMEFRAME_H1", 16385)),
    "H4": int(getattr(mt5, "TIMEFRAME_H4", 16388)),
    "D1": int(getattr(mt5, "TIMEFRAME_D1", 16408)),
    "W1": int(getattr(mt5, "TIMEFRAME_W1", 32769)),
    "MN1": int(getattr(mt5, "TIMEFRAME_MN1", 49153)),
}


def timeframe_to_mt5(timeframe: str) -> int:
    """Convert timeframe text (H4, D1) to MT5 constant."""

    key = timeframe.upper()
    if key not in TIMEFRAME_MAP:
        raise ValueError(f"Unsupported timeframe: {timeframe}")
    return TIMEFRAME_MAP[key]


def _parse_hhmm(value: str) -> time:
    parts = value.strip().split(":")
    if len(parts) != 2:
        raise ValueError(f"Invalid time format {value}. Use HH:MM")
    return time(hour=int(parts[0]), minute=int(parts[1]))


def is_within_trading_hours(trading_hours: Dict[str, str], now_dt: datetime | None = None) -> bool:
    """Return True when current local time is inside configured window."""

    now_dt = now_dt or datetime.now()
    now_t = now_dt.time()
    start_t = _parse_hhmm(trading_hours["start"])
    end_t = _parse_hhmm(trading_hours["end"])

    if start_t <= end_t:
        return start_t <= now_t <= end_t

    return now_t >= start_t or now_t <= end_t
