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