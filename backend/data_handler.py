import time
import requests
import pandas as pd
from dateutil import parser as dateparser

BASE_URLS = [
    "https://data-api.binance.vision",
    "https://api.binance.com",
    "https://api1.binance.com",
    "https://api2.binance.com",
    "https://api3.binance.com",
    "https://api4.binance.com",
    "https://api.binance.us",
]

KLINES_PATH = "/api/v3/klines"
MAX_LIMIT = 1000


def _date_to_ms(date_str):
    if date_str is None:
        return None
    dt = dateparser.parse(date_str)
    return int(dt.timestamp() * 1000)


def _fetch_klines(symbol, interval, start_ms, end_ms):
    """Fetch klines from the first reachable Binance endpoint."""
    params = {
        "symbol": symbol,
        "interval": interval,
        "startTime": start_ms,
        "endTime": end_ms,
        "limit": MAX_LIMIT,
    }

    last_err = None
    for base in BASE_URLS:
        try:
            resp = requests.get(base + KLINES_PATH, params=params, timeout=10)
            if resp.status_code == 200:
                return resp.json()
            last_err = f"{base} returned HTTP {resp.status_code}"
        except requests.RequestException as e:
            last_err = f"{base}: {e}"
            continue

    raise ConnectionError(
        f"Could not reach any Binance API endpoint. Last error: {last_err}"
    )


def get_historical_data(symbol, interval, start_date=None, end_date=None):
    start_ms = _date_to_ms(start_date or "2019-01-01")
    end_ms = _date_to_ms(end_date or "2024-12-31")

    all_klines = []
    current_start = start_ms

    while current_start < end_ms:
        batch = _fetch_klines(symbol, interval, current_start, end_ms)
        if not batch:
            break

        all_klines.extend(batch)

        last_open_time = batch[-1][0]
        if last_open_time <= current_start:
            break
        current_start = last_open_time + 1

        time.sleep(0.1)

    if not all_klines:
        raise ValueError(f"No kline data returned for {symbol} {interval}")

    df = pd.DataFrame(all_klines, columns=[
        "time", "open", "high", "low", "close", "volume",
        "_1", "_2", "_3", "_4", "_5", "_6"
    ])
    df = df[["time", "open", "high", "low", "close", "volume"]]
    df["time"] = pd.to_datetime(df["time"], unit="ms")
    df.set_index("time", inplace=True)
    df = df.astype(float)
    return df