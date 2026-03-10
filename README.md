# Analyzing Bot — Crypto Backtest Engine

A full-stack app for backtesting a **trend + mean-reversion** crypto strategy (EMA, RSI, Bollinger Bands) using Binance historical data. The frontend is a React dashboard; the backend is a Python Flask API that runs the backtest and returns metrics, equity curve, drawdown, and trades.

---

## Prerequisites

- **Python 3.10+** (backend)
- **Node.js 18+** and **npm** (frontend)

---

## Quick Start

### 1. Backend (API + backtester)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 api.py
```

The API runs at **http://localhost:5000**. Leave this terminal open.

### 2. Frontend (dashboard)

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:8080**. The Vite dev server proxies `/api` to the backend.

### 3. Use the app

1. Open **http://localhost:8080** in your browser.
2. Choose symbols, timeframe, date range, and strategy parameters.
3. Click **Run Backtest**. Results (metrics, equity curve, drawdown, trade table) appear when the run finishes.

---

## Project Structure

```
analyzing_bot/
├── backend/           # Python backtester + Flask API
│   ├── api.py         # Flask app, POST /api/backtest
│   ├── data_handler.py   # Fetch Binance OHLCV (public API)
│   ├── strategy.py    # EMA, RSI, Bollinger Bands, signals
│   ├── backtester.py # Simulate trades, performance summary
│   ├── config.yaml    # Default config (CLI)
│   ├── main.py        # CLI entry (optional)
│   └── requirements.txt
├── frontend/          # React + Vite + shadcn/ui
│   ├── src/
│   │   ├── pages/     # Index (dashboard), NotFound
│   │   ├── components/ # StrategyControls, charts, tables
│   │   └── hooks/     # useBacktest (calls /api/backtest)
│   ├── package.json
│   └── vite.config.ts # Proxy /api → localhost:5000
└── README.md
```

---

## Backend

- **Port:** 5000  
- **Endpoint:** `POST /api/backtest`  
- **Data:** Historical klines from Binance public API (no API keys required for backtesting).

Optional: create `backend/.env` with `BINANCE_API_KEY` and `BINANCE_SECRET_KEY` if you later add live trading; the backtest does not need them.

**CLI (optional):**

```bash
cd backend
python3 main.py   # Uses backend/config.yaml
```

---

## Frontend

- **Port:** 8080  
- **Proxy:** Requests to `/api/*` are sent to `http://localhost:5000`.

**Scripts:**

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests                |

---

## Strategy (summary)

- **Entries:** Price above EMA (uptrend) **and** RSI below threshold (oversold) **and** price at or below lower Bollinger Band.
- **Exits:** Mean reversion to BB mid, or stop loss.
- **Parameters:** EMA period, RSI threshold, Bollinger window/deviation, stop loss %, risk per trade %. All are configurable in the UI and passed to the backend.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| Backend won’t start | Ensure port 5000 is free. Use another port in `api.py` if needed. |
| Frontend can’t reach API | Start the backend first. Confirm `vite.config.ts` proxies `/api` to `http://localhost:5000`. |
| “No trades” or zeros | Try a longer date range, EMA 200, RSI 35, or a more volatile symbol (e.g. ADAUSDT). |
| Binance connection errors | The app uses public klines; some networks block Binance. Use a VPN or different network if required. |
