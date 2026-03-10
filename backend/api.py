import sys
import os
import traceback

from flask import Flask, request, jsonify
from flask_cors import CORS

sys.path.insert(0, os.path.dirname(__file__))

from data_handler import get_historical_data
from strategy import apply_indicators, generate_signals
from backtester import (
    backtest,
    performance_summary,
    build_equity_curve_json,
    build_drawdown_curve,
)

app = Flask(__name__)
CORS(app)

TIMEFRAME_MAP = {
    "1m": "1m", "3m": "3m", "5m": "5m", "15m": "15m",
    "30m": "30m", "1h": "1h", "2h": "2h", "4h": "4h",
    "6h": "6h", "8h": "8h", "12h": "12h", "1d": "1d",
    "3d": "3d", "1w": "1w", "1M": "1M",
}


def _run_single_backtest(symbol, params):
    timeframe = params.get("timeframe", "1h")
    start_date = params.get("start_date")
    end_date = params.get("end_date")
    ema_period = int(params.get("ema_period", 200))
    rsi_threshold = int(params.get("rsi_threshold", 35))
    bb_window = int(params.get("bb_window", 20))
    bb_std = float(params.get("bb_std", 2))
    stop_loss_pct = float(params.get("stop_loss_pct", 2)) / 100
    risk_per_trade = float(params.get("risk_per_trade", 1)) / 100

    df = get_historical_data(symbol, timeframe, start_date, end_date)
    df = apply_indicators(df, ema_period=ema_period, bb_window=bb_window, bb_std=bb_std)
    df = generate_signals(df, rsi_threshold=rsi_threshold)

    equity_curve, equity_dates, trades = backtest(
        df,
        risk_pct=risk_per_trade,
        stop_loss_pct=stop_loss_pct,
        initial_equity=10000,
        symbol=symbol,
    )

    return equity_curve, equity_dates, trades


@app.route("/api/backtest", methods=["POST"])
def run_backtest():
    try:
        params = request.get_json(force=True)
        symbols = params.get("symbol", ["BTCUSDT"])
        if isinstance(symbols, str):
            symbols = [symbols]

        all_trades = []
        combined_equity_curve = []
        combined_equity_dates = []

        for sym in symbols:
            eq_curve, eq_dates, trades = _run_single_backtest(sym, params)
            all_trades.extend(trades)

            if not combined_equity_curve:
                combined_equity_curve = list(eq_curve)
                combined_equity_dates = list(eq_dates)
            else:
                min_len = min(len(combined_equity_curve), len(eq_curve))
                combined_equity_curve = [
                    combined_equity_curve[i] + eq_curve[i] - 10000
                    for i in range(min_len)
                ]
                combined_equity_dates = combined_equity_dates[:min_len]

        if not combined_equity_curve:
            return jsonify({"error": "No data returned for the given parameters"}), 400

        summary = performance_summary(combined_equity_curve, all_trades)

        all_trades.sort(key=lambda t: t.get("entry_time", ""))

        response = {
            "metrics": {
                "totalTrades": summary.get("Total Trades", 0),
                "winRate": summary.get("Win Rate", 0),
                "profitFactor": summary.get("Profit Factor", 0),
                "maxDrawdown": summary.get("Max Drawdown %", 0),
                "totalReturn": summary.get("Total Return %", 0),
                "finalEquity": summary.get("Final Equity", 0),
            },
            "equityCurve": build_equity_curve_json(
                combined_equity_curve, combined_equity_dates
            ),
            "drawdownCurve": build_drawdown_curve(
                combined_equity_curve, combined_equity_dates
            ),
            "trades": [
                {
                    "entryTime": t.get("entry_time", "")[:16].replace("T", " "),
                    "exitTime": t.get("exit_time", "")[:16].replace("T", " "),
                    "symbol": t.get("symbol", ""),
                    "entryPrice": t["entry_price"],
                    "exitPrice": t["exit_price"],
                    "profit": t["profit"],
                    "result": "Win" if t["result"] == "win" else "Loss",
                }
                for t in all_trades
            ],
        }

        return jsonify(response)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
