from __future__ import annotations

import argparse
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict

try:
    import MetaTrader5 as mt5
except ImportError:  # pragma: no cover - environment-dependent
    mt5 = None  # type: ignore[assignment]

from core.config_loader import BotConfig, load_config
from core.logger import setup_logger
from core.utils import is_within_trading_hours
from engine.backtester import Backtester
from engine.market_data import MarketDataService
from engine.mt5_connector import MT5Connector
from execution.order_manager import OrderManager
from execution.position_manager import PositionManager
from execution.trade_executor import TradeExecutor
from risk.position_sizing import PositionSizer
from risk.risk_manager import RiskManager
from strategy.swing_strategy import SignalResult, SwingStrategy


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="MT5 Swing Trading Bot")
    parser.add_argument("--config", required=True, help="Path to config JSON")
    parser.add_argument("--backtest", action="store_true", help="Run historical backtest and exit")
    return parser.parse_args()


def clear_screen() -> None:
    os.system("cls" if os.name == "nt" else "clear")


def big_live_warning() -> bool:
    print("\n" + "=" * 80)
    print("!!! BIG WARNING: LIVE TRADING MODE REQUESTED !!!")
    print("REAL MONEY MAY BE LOST. PROCEED ONLY IF YOU FULLY UNDERSTAND THE RISK.")
    print("Type CONFIRM_LIVE to continue, anything else to abort.")
    print("=" * 80 + "\n")
    value = input("Confirmation: ").strip()
    return value == "CONFIRM_LIVE"


def is_real_account(account_info: object) -> bool:
    real_mode = int(getattr(mt5, "ACCOUNT_TRADE_MODE_REAL", 2)) if mt5 is not None else 2
    return int(getattr(account_info, "trade_mode", -1)) == real_mode


def build_mode_label(backtest: bool, live_enabled: bool, account_real: bool) -> str:
    if backtest:
        return "BACKTEST"
    if live_enabled and account_real:
        return "LIVE"
    return "DEMO/SAFE"


def get_capital_for_sizing(config: BotConfig, account_info: object) -> float:
    if config.capital_base == "equity":
        return float(getattr(account_info, "equity", 0.0))
    return float(getattr(account_info, "balance", 0.0))


def render_dashboard(
    mode: str,
    config: BotConfig,
    account_info: object,
    open_positions_count: int,
    signals: Dict[str, SignalResult],
    spreads: Dict[str, float],
    daily_pl: float,
    last_error: str,
) -> None:
    clear_screen()
    print("=" * 80)
    print(f"Swing Bot Dashboard | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | MODE: {mode}")
    print("=" * 80)
    print(f"Balance: {float(getattr(account_info, 'balance', 0.0)):.2f}")
    print(f"Equity : {float(getattr(account_info, 'equity', 0.0)):.2f}")
    print(f"Monitored Symbols: {', '.join(config.symbols)}")
    print(f"Open Positions   : {open_positions_count}")
    print(f"Daily P/L        : {daily_pl:.2f}%")
    print(f"Sizing Capital   : {config.capital_base.upper()}")
    print("-" * 80)
    print("SYMBOL   SIGNAL   RSI     ATR       SPREAD(points)   REASON")

    for symbol in config.symbols:
        sig = signals.get(symbol, SignalResult("n/a", "n/a", 0.0, 0.0, 0.0, 0.0))
        spread = spreads.get(symbol, float("nan"))
        print(
            f"{symbol:<8} {sig.signal:<7} {sig.rsi14:>6.2f}  {sig.atr_value:>8.5f}"
            f"   {spread:>10.2f}    {sig.reason}"
        )

    print("-" * 80)
    print(f"Last Error: {last_error or 'None'}")
    print("=" * 80)


def run_backtest(config: BotConfig, connector: MT5Connector, logger) -> int:
    strategy = SwingStrategy()
    backtester = Backtester(connector=connector, strategy=strategy, logger=logger)
    out_csv = Path("logs") / f"backtest_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    metrics = backtester.run(
        symbols=config.symbols,
        timeframe=config.timeframe,
        higher_timeframe=config.higher_timeframe,
        output_csv=str(out_csv),
    )

    print("\nBACKTEST RESULTS")
    print("-" * 40)
    print(f"Total Trades : {int(metrics['total_trades'])}")
    print(f"Win Rate     : {metrics['win_rate']:.2f}%")
    print(f"Profit Factor: {metrics['profit_factor']:.2f}")
    print(f"Max Drawdown : {metrics['max_drawdown']:.5f}")
    print(f"Net PnL      : {metrics['net_pnl']:.5f}")
    print(f"CSV Export   : {out_csv}")
    return 0


def main() -> int:
    args = parse_args()
    config = load_config(args.config)

    logger = setup_logger(logs_dir="logs")
    logger.info("Starting bot with config %s", args.config)

    connector = MT5Connector(
        logger=logger,
        login=config.mt5_login,
        password=config.mt5_password,
        server=config.mt5_server,
    )

    if not connector.initialize():
        return 1

    try:
        account = connector.account_info()
        if account is None:
            logger.error("Unable to verify account info. Exiting for safety.")
            return 1

        if args.backtest:
            return run_backtest(config, connector, logger)

        if not connector.ensure_account_verified():
            logger.error("Account/terminal verification failed. Exiting for safety.")
            return 1

        account_real = is_real_account(account)
        config_name = Path(args.config).name.lower()

        live_trade_requested = config_name == "config_live.json" and bool(config.live_trading)
        trading_enabled = not account_real

        if account_real:
            if live_trade_requested:
                if not big_live_warning():
                    logger.warning("Live trading confirmation failed. Running in monitor-only mode.")
                    trading_enabled = False
                else:
                    trading_enabled = True
                    logger.warning("LIVE TRADING ENABLED")
            else:
                trading_enabled = False
                logger.warning(
                    "Real account detected but live_trading is disabled or config file is not config_live.json."
                )

        market_data = MarketDataService(connector=connector, logger=logger)
        strategy = SwingStrategy()
        order_manager = OrderManager(connector=connector, logger=logger)
        position_manager = PositionManager(connector=connector, logger=logger)
        sizer = PositionSizer(connector=connector, logger=logger)
        risk_manager = RiskManager(config=config, logger=logger)
        executor = TradeExecutor(
            config=config,
            order_manager=order_manager,
            position_manager=position_manager,
            sizer=sizer,
            risk_manager=risk_manager,
            logger=logger,
        )

        if not market_data.ensure_symbols_selected(config.symbols):
            logger.error("One or more symbols cannot be selected. Exiting for safety.")
            return 1

        mode_label = build_mode_label(args.backtest, trading_enabled, account_real)
        last_error = ""

        while True:
            account = connector.account_info()
            if account is None:
                logger.error("Account info unavailable during runtime. Stopping for safety.")
                return 1

            signals: Dict[str, SignalResult] = {}
            spreads: Dict[str, float] = {}

            if not is_within_trading_hours(config.trading_hours):
                logger.info("Outside trading hours. Bot is waiting.")

            for symbol in config.symbols:
                lower, higher = market_data.get_symbol_data(
                    symbol=symbol,
                    timeframe=config.timeframe,
                    higher_timeframe=config.higher_timeframe,
                )

                signal = strategy.generate_signal(lower, higher)
                spread_points = market_data.get_spread_points(symbol)
                signals[symbol] = signal
                spreads[symbol] = spread_points

                if not is_within_trading_hours(config.trading_hours):
                    continue

                if not trading_enabled:
                    continue

                capital_for_sizing = get_capital_for_sizing(config, account)
                ok, msg = executor.execute_signal(
                    symbol=symbol,
                    signal=signal,
                    spread_points=spread_points,
                    capital_for_sizing=capital_for_sizing,
                    current_balance=float(getattr(account, "balance", 0.0)),
                )
                if not ok:
                    last_error = f"{symbol}: {msg}"
                    logger.warning(last_error)

            daily_pl = risk_manager.daily_pl_percent(float(getattr(account, "balance", 0.0)))
            render_dashboard(
                mode=mode_label,
                config=config,
                account_info=account,
                open_positions_count=position_manager.count_open_positions(),
                signals=signals,
                spreads=spreads,
                daily_pl=daily_pl,
                last_error=last_error,
            )

            time.sleep(config.polling_interval_seconds)

    except KeyboardInterrupt:
        logger.info("Bot stopped by user.")
        return 0
    except Exception as exc:
        logger.exception("Fatal error: %s", exc)
        return 1
    finally:
        connector.shutdown()


if __name__ == "__main__":
    sys.exit(main())
