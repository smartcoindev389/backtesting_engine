from binance.client import Client
import os
from dotenv import load_dotenv

load_dotenv()

client = Client(os.getenv("BINANCE_API_KEY"),
                os.getenv("BINANCE_SECRET_KEY"))

def place_market_order(symbol, side, quantity):
    return client.create_order(
        symbol=symbol,
        side=side,
        type="MARKET",
        quantity=quantity
    )