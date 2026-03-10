import numpy as np

FEE_RATE = 0.001      # 0.1% per side
SLIPPAGE = 0.0002     # 0.02%
COOLDOWN_BARS = 3


def backtest(
    df,
    risk_pct=0.01,
    stop_loss_pct=0.01,
    initial_equity=10000,
    symbol="UNKNOWN"
):

    equity = initial_equity
    equity_curve = []
    equity_dates = []
    trades = []

    position = None
    cooldown = 0

    for i in range(1, len(df)):

        row = df.iloc[i]
        prev = df.iloc[i - 1]
        timestamp = str(df.index[i])

        if cooldown > 0:
            cooldown -= 1
            equity_curve.append(equity)
            equity_dates.append(timestamp)
            continue

        if position is None and prev["signal"] == 1:

            entry_price = row["open"] * (1 + SLIPPAGE)

            stop_price = entry_price * (1 - stop_loss_pct)
            risk_per_unit = entry_price - stop_price

            if risk_per_unit <= 0:
                equity_curve.append(equity)
                equity_dates.append(timestamp)
                continue

            position_size = (equity * risk_pct) / risk_per_unit

            target_price = row["bb_mid"]

            position = {
                "entry": entry_price,
                "stop": stop_price,
                "target": target_price,
                "size": position_size,
                "entry_time": timestamp,
                "symbol": symbol,
            }

        elif position is not None:

            stop_hit = row["low"] <= position["stop"]
            target_hit = row["high"] >= position["target"]

            exit_price = None
            result = None

            if stop_hit:
                exit_price = position["stop"] * (1 - SLIPPAGE)
                result = "loss"

            elif target_hit:
                exit_price = position["target"] * (1 - SLIPPAGE)
                result = "win"

            if exit_price:

                gross_profit = (
                    (exit_price - position["entry"]) *
                    position["size"]
                )

                fee = (
                    (position["entry"] * position["size"]) +
                    (exit_price * position["size"])
                ) * FEE_RATE

                net_profit = gross_profit - fee

                equity += net_profit

                trades.append({
                    "entry_price": round(position["entry"], 2),
                    "exit_price": round(exit_price, 2),
                    "profit": round(net_profit, 2),
                    "result": result,
                    "entry_time": position["entry_time"],
                    "exit_time": timestamp,
                    "symbol": position["symbol"],
                })

                position = None
                cooldown = COOLDOWN_BARS

        equity_curve.append(equity)
        equity_dates.append(timestamp)

    return equity_curve, equity_dates, trades


# ==============================
# PERFORMANCE
# ==============================

def calculate_max_drawdown(equity_curve):

    peak = equity_curve[0]
    max_dd = 0

    for value in equity_curve:
        if value > peak:
            peak = value

        drawdown = (peak - value) / peak

        if drawdown > max_dd:
            max_dd = drawdown

    return max_dd


def performance_summary(equity_curve, trades):

    if len(trades) == 0:
        return {}

    profits = [t["profit"] for t in trades]

    gross_profit = sum(p for p in profits if p > 0)
    gross_loss = abs(sum(p for p in profits if p < 0))

    win_rate = sum(1 for t in trades if t["result"] == "win") / len(trades)

    profit_factor = (
        gross_profit / gross_loss
        if gross_loss != 0 else 0
    )

    max_dd = calculate_max_drawdown(equity_curve)

    total_return = (
        (equity_curve[-1] / equity_curve[0]) - 1
    )

    return {
        "Total Trades": len(trades),
        "Win Rate": round(win_rate * 100, 2),
        "Profit Factor": round(profit_factor, 2),
        "Max Drawdown %": round(max_dd * 100, 2),
        "Final Equity": round(equity_curve[-1], 2),
        "Total Return %": round(total_return * 100, 2)
    }


def build_drawdown_curve(equity_curve, equity_dates):
    peak = equity_curve[0]
    drawdown_curve = []
    for i, value in enumerate(equity_curve):
        if value > peak:
            peak = value
        dd = ((peak - value) / peak) * 100 if peak > 0 else 0
        drawdown_curve.append({
            "date": equity_dates[i][:10] if i < len(equity_dates) else "",
            "drawdown": round(dd, 2),
        })
    return drawdown_curve


def build_equity_curve_json(equity_curve, equity_dates):
    return [
        {
            "date": equity_dates[i][:10] if i < len(equity_dates) else "",
            "equity": round(val, 2),
        }
        for i, val in enumerate(equity_curve)
    ]