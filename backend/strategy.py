import pandas as pd
import ta


def apply_indicators(df, ema_period=200, atr_period=14):

    # EMA
    df["ema"] = df["close"].ewm(span=ema_period).mean()

    # Bollinger Bands
    bb = ta.volatility.BollingerBands(
        close=df["close"],
        window=20,
        window_dev=2
    )
    df["bb_high"] = bb.bollinger_hband()
    df["bb_low"] = bb.bollinger_lband()
    df["bb_mid"] = bb.bollinger_mavg()

    # RSI
    rsi = ta.momentum.RSIIndicator(close=df["close"], window=14)
    df["rsi"] = rsi.rsi()

    # ATR (for dynamic stop)
    atr = ta.volatility.AverageTrueRange(
        high=df["high"],
        low=df["low"],
        close=df["close"],
        window=atr_period
    )
    df["atr"] = atr.average_true_range()

    return df


def generate_signals(df):

    df["signal"] = 0

    # Long entry:
    # Uptrend + RSI oversold + touch lower BB

    df.loc[
        (df["close"] > df["ema"]) &
        (df["rsi"] < 35) &
        (df["close"] <= df["bb_low"]),
        "signal"
    ] = 1

    return df