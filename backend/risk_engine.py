def calculate_position_size(equity, risk_pct, entry, stop):
    risk_amount = equity * risk_pct
    risk_per_unit = abs(entry - stop)
    if risk_per_unit == 0:
        return 0
    return risk_amount / risk_per_unit