from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List


@dataclass
class BotConfig:
    """Typed runtime configuration loaded from a JSON file."""

    mt5_login: str
    mt5_password: str
    mt5_server: str
    live_trading: bool
    symbols: List[str]
    timeframe: str
    higher_timeframe: str
    risk_per_trade: float
    capital_base: str
    min_dynamic_lot: float
    max_dynamic_lot: float
    max_daily_loss: float
    max_trades_per_day: int
    max_open_trades: int
    max_spread_points: float
    atr_sl_multiplier: float
    atr_tp_multiplier: float
    min_trend_strength_atr: float
    min_candle_body_atr: float
    candle_close_bias: float
    trailing_stop_enabled: bool
    trading_hours: Dict[str, str]
    magic_number: int
    deviation: int
    polling_interval_seconds: int


def _require_keys(payload: Dict[str, Any], keys: List[str]) -> None:
    missing = [key for key in keys if key not in payload]
    if missing:
        raise ValueError(f"Missing config keys: {', '.join(missing)}")


def _validate_timeframe(value: str, field_name: str) -> str:
    supported = {"M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN1"}
    if value.upper() not in supported:
        raise ValueError(f"Unsupported {field_name}: {value}. Supported: {sorted(supported)}")
    return value.upper()


def _validate_hours(hours: Dict[str, str]) -> Dict[str, str]:
    if not isinstance(hours, dict) or "start" not in hours or "end" not in hours:
        raise ValueError("trading_hours must be an object with 'start' and 'end'.")
    return {"start": str(hours["start"]), "end": str(hours["end"])}


def load_config(config_path: str | Path) -> BotConfig:
    """Load and validate bot settings from JSON."""

    path = Path(config_path)
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")

    with path.open("r", encoding="utf-8") as handle:
        payload: Dict[str, Any] = json.load(handle)

    required = [
        "mt5_login",
        "mt5_password",
        "mt5_server",
        "live_trading",
        "symbols",
        "timeframe",
        "higher_timeframe",
        "risk_per_trade",
        "capital_base",
        "min_dynamic_lot",
        "max_dynamic_lot",
        "max_daily_loss",
        "max_trades_per_day",
        "max_open_trades",
        "max_spread_points",
        "atr_sl_multiplier",
        "atr_tp_multiplier",
        "min_trend_strength_atr",
        "min_candle_body_atr",
        "candle_close_bias",
        "trailing_stop_enabled",
        "trading_hours",
        "magic_number",
        "deviation",
        "polling_interval_seconds",
    ]
    _require_keys(payload, required)

    symbols = [str(item).upper() for item in payload["symbols"]]
    if not symbols:
        raise ValueError("symbols must contain at least one instrument")

    config = BotConfig(
        mt5_login=str(payload["mt5_login"] or "").strip(),
        mt5_password=str(payload["mt5_password"] or "").strip(),
        mt5_server=str(payload["mt5_server"] or "").strip(),
        live_trading=bool(payload["live_trading"]),
        symbols=symbols,
        timeframe=_validate_timeframe(str(payload["timeframe"]), "timeframe"),
        higher_timeframe=_validate_timeframe(str(payload["higher_timeframe"]), "higher_timeframe"),
        risk_per_trade=float(payload["risk_per_trade"]),
        capital_base=str(payload["capital_base"]).strip().lower(),
        min_dynamic_lot=float(payload["min_dynamic_lot"]),
        max_dynamic_lot=float(payload["max_dynamic_lot"]),
        max_daily_loss=float(payload["max_daily_loss"]),
        max_trades_per_day=int(payload["max_trades_per_day"]),
        max_open_trades=int(payload["max_open_trades"]),
        max_spread_points=float(payload["max_spread_points"]),
        atr_sl_multiplier=float(payload["atr_sl_multiplier"]),
        atr_tp_multiplier=float(payload["atr_tp_multiplier"]),
        min_trend_strength_atr=float(payload["min_trend_strength_atr"]),
        min_candle_body_atr=float(payload["min_candle_body_atr"]),
        candle_close_bias=float(payload["candle_close_bias"]),
        trailing_stop_enabled=bool(payload["trailing_stop_enabled"]),
        trading_hours=_validate_hours(payload["trading_hours"]),
        magic_number=int(payload["magic_number"]),
        deviation=int(payload["deviation"]),
        polling_interval_seconds=max(5, int(payload["polling_interval_seconds"])),
    )

    if not 0 < config.risk_per_trade <= 10:
        raise ValueError("risk_per_trade must be in range (0, 10]")
    if config.capital_base not in {"balance", "equity"}:
        raise ValueError("capital_base must be either 'balance' or 'equity'")
    if config.min_dynamic_lot <= 0 or config.max_dynamic_lot <= 0:
        raise ValueError("min_dynamic_lot and max_dynamic_lot must be positive")
    if config.min_dynamic_lot > config.max_dynamic_lot:
        raise ValueError("min_dynamic_lot cannot be greater than max_dynamic_lot")
    if not 0 < config.max_daily_loss <= 20:
        raise ValueError("max_daily_loss must be in range (0, 20]")
    if not 1 <= config.max_trades_per_day <= 20:
        raise ValueError("max_trades_per_day must be in range [1, 20]")
    if config.max_open_trades <= 0:
        raise ValueError("max_open_trades must be positive")
    if config.min_trend_strength_atr <= 0:
        raise ValueError("min_trend_strength_atr must be > 0")
    if config.min_candle_body_atr <= 0:
        raise ValueError("min_candle_body_atr must be > 0")
    if not 0.5 <= config.candle_close_bias <= 0.95:
        raise ValueError("candle_close_bias must be between 0.5 and 0.95")

    return config
