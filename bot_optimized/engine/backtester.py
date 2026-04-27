from __future__ import annotations

import csv
import logging
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from core.utils import timeframe_to_mt5
from engine.mt5_connector import MT5Connector
from strategy.swing_strategy import SwingStrategy


@dataclass
class SimTrade:
    symbol: str
    direction: str
    entry_time: int
    exit_time: int
    entry_price: float
    exit_price: float
    sl: float
    tp: float
    pnl: float
    reason: str


class Backtester:
    """Simple MT5-candle backtester for the swing strategy."""

    def __init__(self, connector: MT5Connector, strategy: SwingStrategy, logger: logging.Logger) -> None:
        self.connector = connector
        self.strategy = strategy
        self.logger = logger

    @staticmethod
    def _calc_metrics(trades: List[SimTrade]) -> Dict[str, float]:
        if not trades:
            return {
                "win_rate": 0.0,
                "profit_factor": 0.0,
                "max_drawdown": 0.0,
                "total_trades": 0.0,
                "net_pnl": 0.0,
            }

        wins = [t.pnl for t in trades if t.pnl > 0]
        losses = [t.pnl for t in trades if t.pnl < 0]
        gross_profit = sum(wins)
        gross_loss = abs(sum(losses))

        equity = 0.0
        peak = 0.0
        max_dd = 0.0
        for trade in trades:
            equity += trade.pnl
            peak = max(peak, equity)
            max_dd = max(max_dd, peak - equity)

        return {
            "win_rate": (len(wins) / len(trades)) * 100.0,
            "profit_factor": (gross_profit / gross_loss) if gross_loss > 0 else float("inf"),
            "max_drawdown": max_dd,
            "total_trades": float(len(trades)),
            "net_pnl": sum(t.pnl for t in trades),
        }

    def run(
        self,
        symbols: List[str],
        timeframe: str,
        higher_timeframe: str,
        output_csv: str,
        bars: int = 3000,
    ) -> Dict[str, float]:
        """Backtest using MT5 historical candles and export every trade to CSV."""

        all_trades: List[SimTrade] = []
        tf = timeframe_to_mt5(timeframe)
        htf = timeframe_to_mt5(higher_timeframe)

        for symbol in symbols:
            lower = self.connector.get_rates(symbol, tf, bars)
            higher = self.connector.get_rates(symbol, htf, bars)

            if len(lower) < 250 or len(higher) < 250:
                self.logger.warning("Skipping %s: insufficient data for backtest", symbol)
                continue

            open_trade: Dict[str, Any] | None = None
            for i in range(220, len(lower) - 1):
                current = lower[i]
                next_bar = lower[i + 1]

                aligned_higher = [bar for bar in higher if bar["time"] <= current["time"]]
                signal = self.strategy.generate_signal(lower[: i + 1], aligned_higher)

                if open_trade is not None:
                    direction = open_trade["direction"]
                    sl = open_trade["sl"]
                    tp = open_trade["tp"]
                    exit_price = None
                    reason = None

                    if direction == "buy":
                        if next_bar["low"] <= sl:
                            exit_price = sl
                            reason = "stop_loss"
                        elif next_bar["high"] >= tp:
                            exit_price = tp
                            reason = "take_profit"
                        elif signal.signal == "sell":
                            exit_price = next_bar["open"]
                            reason = "reverse_signal"
                    else:
                        if next_bar["high"] >= sl:
                            exit_price = sl
                            reason = "stop_loss"
                        elif next_bar["low"] <= tp:
                            exit_price = tp
                            reason = "take_profit"
                        elif signal.signal == "buy":
                            exit_price = next_bar["open"]
                            reason = "reverse_signal"

                    if exit_price is not None:
                        pnl = (
                            (exit_price - open_trade["entry_price"])
                            if direction == "buy"
                            else (open_trade["entry_price"] - exit_price)
                        )
                        all_trades.append(
                            SimTrade(
                                symbol=symbol,
                                direction=direction,
                                entry_time=open_trade["entry_time"],
                                exit_time=next_bar["time"],
                                entry_price=open_trade["entry_price"],
                                exit_price=exit_price,
                                sl=sl,
                                tp=tp,
                                pnl=pnl,
                                reason=reason,
                            )
                        )
                        open_trade = None

                if open_trade is None and signal.signal in {"buy", "sell"} and signal.atr_value > 0:
                    entry_price = next_bar["open"]
                    if signal.signal == "buy":
                        sl = entry_price - (signal.atr_value * 2.0)
                        tp = entry_price + (signal.atr_value * 3.0)
                    else:
                        sl = entry_price + (signal.atr_value * 2.0)
                        tp = entry_price - (signal.atr_value * 3.0)

                    open_trade = {
                        "symbol": symbol,
                        "direction": signal.signal,
                        "entry_time": next_bar["time"],
                        "entry_price": entry_price,
                        "sl": sl,
                        "tp": tp,
                    }

        out_path = Path(output_csv)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        with out_path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(
                [
                    "symbol",
                    "direction",
                    "entry_time",
                    "exit_time",
                    "entry_price",
                    "exit_price",
                    "stop_loss",
                    "take_profit",
                    "pnl",
                    "exit_reason",
                ]
            )
            for trade in all_trades:
                writer.writerow(
                    [
                        trade.symbol,
                        trade.direction,
                        datetime.utcfromtimestamp(trade.entry_time).isoformat(),
                        datetime.utcfromtimestamp(trade.exit_time).isoformat(),
                        f"{trade.entry_price:.5f}",
                        f"{trade.exit_price:.5f}",
                        f"{trade.sl:.5f}",
                        f"{trade.tp:.5f}",
                        f"{trade.pnl:.5f}",
                        trade.reason,
                    ]
                )

        self.logger.info("Backtest trades exported to %s", out_path)
        return self._calc_metrics(all_trades)
