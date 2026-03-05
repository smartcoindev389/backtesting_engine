from binance.client import Client
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

client = Client(os.getenv("BINANCE_API_KEY"),
                os.getenv("BINANCE_SECRET_KEY"))

def get_historical_data(symbol, interval):
    start_str = "1 Jan, 2019"
    end_str = "31 Dec, 2024"

    klines = client.get_historical_klines(
        symbol=symbol,
        interval=interval,
        start_str=start_str,
        end_str=end_str
    )
    
    df = pd.DataFrame(klines, columns=[
        "time","open","high","low","close","volume",
        "_","_","_","_","_","_"
    ])
    df = df[["time","open","high","low","close","volume"]]
    df["time"] = pd.to_datetime(df["time"], unit="ms")
    df.set_index("time", inplace=True)
    df = df.astype(float)
    return df