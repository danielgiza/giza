from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date
from typing import Tuple

from core.config_loader import BotConfig


@dataclass
class DailyState:
    day: date
    start_balance: float


class RiskManager:
    """Validates daily and portfolio-level risk limits."""

    def __init__(self, config: BotConfig, logger: logging.Logger) -> None:
        self.config = config
        self.logger = logger
        self._state: DailyState | None = None

    def _refresh_daily_state(self, current_balance: float) -> None:
        today = date.today()
        if self._state is None or self._state.day != today:
            self._state = DailyState(day=today, start_balance=current_balance)
            self.logger.info("Daily baseline reset at balance %.2f", current_balance)

    def daily_pl_percent(self, current_balance: float) -> float:
        self._refresh_daily_state(current_balance)
        assert self._state is not None
        if self._state.start_balance == 0:
            return 0.0
        return ((current_balance - self._state.start_balance) / self._state.start_balance) * 100.0

    def can_trade(self, current_balance: float, open_positions_count: int) -> Tuple[bool, str]:
        if open_positions_count >= self.config.max_open_trades:
            return False, f"max_open_trades reached ({open_positions_count}/{self.config.max_open_trades})"

        daily_pl = self.daily_pl_percent(current_balance)
        if daily_pl <= -abs(self.config.max_daily_loss):
            return False, f"max_daily_loss reached ({daily_pl:.2f}%)"

        return True, "OK"

    def is_spread_acceptable(self, spread_points: float) -> bool:
        return spread_points <= self.config.max_spread_points
