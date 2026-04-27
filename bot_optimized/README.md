# MT5 Swing Trading Bot (Python, Windows CMD)

A modular swing trading bot for **MetaTrader 5** using:

- EMA 50 / EMA 200
- RSI 14
- ATR 14
- Signal timeframe: H4
- Trend confirmation timeframe: D1

It supports:

- JSON-only configuration (no `.env`)
- Demo/live safety controls
- Risk management and position sizing
- CMD dashboard
- Historical backtesting with CSV export
- Dynamic lot sizing based on capital (balance/equity)

---

## 1) Folder Structure

```text
bot_optimized/
│
├── main.py
├── README.md
├── Instructions.txt
├── config_demo.json
├── config_live.json
│
├── core/
│   ├── config_loader.py
│   ├── logger.py
│   └── utils.py
│
├── engine/
│   ├── mt5_connector.py
│   ├── market_data.py
│   └── backtester.py
│
├── execution/
│   ├── order_manager.py
│   ├── position_manager.py
│   └── trade_executor.py
│
├── indicators/
│   ├── ema.py
│   ├── rsi.py
│   └── atr.py
│
├── risk/
│   ├── risk_manager.py
│   └── position_sizing.py
│
├── strategy/
│   └── swing_strategy.py
│
└── logs/
```

---

## 2) Setup (Windows CMD)

1. Install Python 3.10+.
2. Install MetaTrader 5 desktop terminal.
3. Open MT5 and log into your broker account.
4. Enable Algo Trading in MT5 terminal.
5. Open **CMD** and install the Python package:

```bat
pip install MetaTrader5
```

6. Go to project folder:

```bat
cd path\to\bot_optimized
```

---

## 3) JSON Config Only (No .env)

All parameters are stored in JSON files:

- `config_demo.json`
- `config_live.json`

If `mt5_login`, `mt5_password`, `mt5_server` are empty, the bot uses your currently logged-in MT5 terminal session.

Dynamic lot sizing setting:

- `capital_base`: `"balance"` or `"equity"`
  - `"equity"` = lot size updates with floating P/L in real time
  - `"balance"` = lot size uses account balance only
- `min_lot` / `max_lot`: enforce lot range (for example 2.0 to 3.0)
- `max_trades_per_day`: limits how many new entries can be opened daily

---

## 4) Run Commands

### Demo / safe mode

```bat
python main.py --config config_demo.json
```

### Live config (still safe unless enabled)

```bat
python main.py --config config_live.json
```

### Backtest

```bat
python main.py --config config_demo.json --backtest
```

Backtest exports CSV to `logs/backtest_results_YYYYMMDD_HHMMSS.csv`.

---

## 5) Live Trading Safety Rules

- `config_demo.json` defaults `live_trading: false`
- `config_live.json` defaults `live_trading: false`
- Live trading is enabled only when:
  1. You run with `config_live.json`
  2. `live_trading` is set to `true`
  3. Account is real
  4. You type `CONFIRM_LIVE` at startup

If any safety check fails, bot runs in monitor-only mode or exits.

---

## 6) Strategy Logic

### Buy

- EMA50 > EMA200 on H4
- Price close > EMA50 on H4
- RSI in [50, 70]
- EMA50 > EMA200 on D1
- Last closed candle is bullish and closes in top half (momentum confirmation)
- H4 EMA trend strength > configured threshold
- No existing buy position on symbol
- Spread acceptable

### Sell

- EMA50 < EMA200 on H4
- Price close < EMA50 on H4
- RSI in [30, 50]
- EMA50 < EMA200 on D1
- Last closed candle is bearish and closes in bottom half (momentum confirmation)
- H4 EMA trend strength > configured threshold
- No existing sell position on symbol
- Spread acceptable

### Exit

- SL = ATR * 2
- TP = ATR * 3
- Optional ATR trailing stop
- Opposite signal closes opposite position first

---

## 7) Risk Controls

- Risk per trade (default 1%)
- Max daily loss (default 3%)
- Max open trades (default 3)
- Automatic lot sizing by SL distance
- Broker lot normalization
- Spread filters

---

## 8) Important Warning

Always test thoroughly on a **demo account** before enabling live trading. Real trading involves risk of financial loss.
