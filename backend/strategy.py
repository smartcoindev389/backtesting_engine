import pandas as pd
import ta


def apply_indicators(df, ema_period=200, atr_period=14, bb_window=20, bb_std=2):

    # EMA trend filter
    df["ema"] = df["close"].ewm(span=ema_period).mean()

    # Bollinger Bands
    bb = ta.volatility.BollingerBands(
        close=df["close"],
        window=bb_window,
        window_dev=bb_std
    )

    df["bb_high"] = bb.bollinger_hband()
    df["bb_low"] = bb.bollinger_lband()
    df["bb_mid"] = bb.bollinger_mavg()

    # RSI
    rsi = ta.momentum.RSIIndicator(close=df["close"], window=14)
    df["rsi"] = rsi.rsi()

    # ATR
    atr = ta.volatility.AverageTrueRange(
        high=df["high"],
        low=df["low"],
        close=df["close"],
        window=atr_period
    )

    df["atr"] = atr.average_true_range()

    # Volatility regime filter
    df["atr_mean"] = df["atr"].rolling(50).mean()

    return df


def generate_signals(
    df,
    rsi_threshold=35,
    use_volatility_filter=True
):

    df["signal"] = 0

    # Core entry logic
    base_condition = (
        (df["close"] > df["ema"]) &        # trend filter
        (df["rsi"] < rsi_threshold) &      # oversold
        (df["close"] <= df["bb_low"])      # price extreme
    )

    if use_volatility_filter:

        volatility_condition = (
            df["atr"] > df["atr_mean"]
        )

        df.loc[
            base_condition & volatility_condition,
            "signal"
        ] = 1

    else:

        df.loc[
            base_condition,
            "signal"
        ] = 1

    return df