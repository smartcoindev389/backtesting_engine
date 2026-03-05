from binance.enums import *
from data_handler import get_historical_data
from strategy import apply_indicators, generate_signals
from backtester import backtest, performance_summary
from reporting import generate_report
from utils import load_config


# Load config
config = load_config()

symbol = config["symbols"][0]
timeframe = config["timeframe"]

print(f"\nRunning Backtest for {symbol} on {timeframe} timeframe\n")

# Get data
df = get_historical_data(symbol, timeframe)

# Apply indicators
df = apply_indicators(df, config["strategy"]["ema_period"])

# Generate signals
df = generate_signals(df)

# Run backtest
equity_curve, trades = backtest(
    df,
    risk_pct=config["risk"]["risk_per_trade"],
    # rr_ratio=config["strategy"]["rr_ratio"],
    initial_equity=10000
)

# Get performance summary
summary = performance_summary(equity_curve, trades)

print("===== PERFORMANCE SUMMARY =====")
for k, v in summary.items():
    print(f"{k}: {v}")

# Optional: plot equity curve
generate_report(equity_curve)