from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

try:
    import MetaTrader5 as mt5
except ImportError:  # pragma: no cover - environment-dependent
    mt5 = None  # type: ignore[assignment]


class MT5Connector:
    """Thin wrapper over MetaTrader5 package with logging and safety checks."""

    def __init__(self, logger: logging.Logger, login: str = "", password: str = "", server: str = "") -> None:
        self.logger = logger
        self.login = login
        self.password = password
        self.server = server

    def initialize(self) -> bool:
        if mt5 is None:
            self.logger.error("MetaTrader5 package is not installed. Install with: pip install MetaTrader5")
            return False

        if not mt5.initialize():
            self.logger.error("mt5.initialize() failed: %s", mt5.last_error())
            return False

        if self.login and self.password and self.server:
            login_ok = mt5.login(login=int(self.login), password=self.password, server=self.server)
            if not login_ok:
                self.logger.error("mt5.login() failed: %s", mt5.last_error())
                return False

        self.logger.info("Connected to MT5 terminal")
        return True

    def shutdown(self) -> None:
        if mt5 is not None:
            mt5.shutdown()

    def account_info(self) -> Any:
        return None if mt5 is None else mt5.account_info()

    def terminal_info(self) -> Any:
        return None if mt5 is None else mt5.terminal_info()

    def ensure_account_verified(self) -> bool:
        account = self.account_info()
        terminal = self.terminal_info()
        if account is None:
            self.logger.error("Unable to verify account info. Trading blocked.")
            return False
        if terminal is None:
            self.logger.error("Unable to verify terminal info. Trading blocked.")
            return False
        if not getattr(terminal, "trade_allowed", False):
            self.logger.error("Terminal trading not allowed. Enable Algo Trading in MT5 terminal.")
            return False
        if not getattr(account, "trade_allowed", False):
            self.logger.error("Account trading not allowed by broker/account settings.")
            return False
        return True

    def symbol_select(self, symbol: str) -> bool:
        if mt5 is None:
            return False
        ok = mt5.symbol_select(symbol, True)
        if not ok:
            self.logger.error("Failed to select symbol %s: %s", symbol, mt5.last_error())
        return ok

    def symbol_info(self, symbol: str) -> Any:
        return None if mt5 is None else mt5.symbol_info(symbol)

    def symbol_tick(self, symbol: str) -> Any:
        return None if mt5 is None else mt5.symbol_info_tick(symbol)

    def get_rates(self, symbol: str, timeframe: int, count: int) -> List[Dict[str, Any]]:
        if mt5 is None:
            return []
        raw = mt5.copy_rates_from_pos(symbol, timeframe, 0, count)
        if raw is None:
            self.logger.error("copy_rates_from_pos failed for %s: %s", symbol, mt5.last_error())
            return []
        return [
            {
                "time": int(item["time"]),
                "open": float(item["open"]),
                "high": float(item["high"]),
                "low": float(item["low"]),
                "close": float(item["close"]),
                "tick_volume": int(item["tick_volume"]),
            }
            for item in raw
        ]

    def positions_get(self, symbol: Optional[str] = None) -> List[Any]:
        if mt5 is None:
            return []
        positions = mt5.positions_get(symbol=symbol) if symbol else mt5.positions_get()
        return list(positions) if positions else []

    def order_send(self, request: Dict[str, Any]) -> Any:
        if mt5 is None:
            return None
        self.logger.info("ORDER REQUEST: %s", request)
        result = mt5.order_send(request)
        self.logger.info("ORDER RESPONSE: %s", result)
        return result

    def detect_filling_mode(self, symbol: str) -> int:
        """Detect a valid filling mode for this symbol."""

        if mt5 is None:
            return 0

        info = self.symbol_info(symbol)
        if info is not None and getattr(info, "filling_mode", None) is not None:
            value = int(info.filling_mode)
            if value in {
                getattr(mt5, "ORDER_FILLING_FOK", 0),
                getattr(mt5, "ORDER_FILLING_IOC", 1),
                getattr(mt5, "ORDER_FILLING_RETURN", 2),
            }:
                return value

        for candidate in [
            getattr(mt5, "ORDER_FILLING_RETURN", 2),
            getattr(mt5, "ORDER_FILLING_IOC", 1),
            getattr(mt5, "ORDER_FILLING_FOK", 0),
        ]:
            return candidate

        return getattr(mt5, "ORDER_FILLING_RETURN", 2)
