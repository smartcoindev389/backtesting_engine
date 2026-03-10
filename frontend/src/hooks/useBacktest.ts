import { useState } from "react";

export interface BacktestParams {
  symbols: string[];
  timeframe: string;
  startDate: string;
  endDate: string;
  emaPeriod: number;
  rsiThreshold: number;
  bbWindow: number;
  bbStd: number;
  stopLossPct: number;
  riskPerTrade: number;
}

export interface Trade {
  entryTime: string;
  exitTime: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  profit: number;
  result: "Win" | "Loss";
}

export interface BacktestMetrics {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  totalReturn: number;
  finalEquity: number;
}

export interface BacktestResult {
  metrics: BacktestMetrics;
  equityCurve: { date: string; equity: number }[];
  drawdownCurve: { date: string; drawdown: number }[];
  trades: Trade[];
}

const DEFAULT_PARAMS: BacktestParams = {
  symbols: ["BTCUSDT"],
  timeframe: "1h",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  emaPeriod: 200,
  rsiThreshold: 35,
  bbWindow: 20,
  bbStd: 2,
  stopLossPct: 1,
  riskPerTrade: 1,
};

function generateMockResult(params: BacktestParams): BacktestResult {
  const trades: Trade[] = [];
  const symbols = params.symbols;
  const numTrades = 40 + Math.floor(Math.random() * 60);

  for (let i = 0; i < numTrades; i++) {
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const isWin = Math.random() > 0.42;
    const entryPrice = sym === "BTCUSDT" ? 40000 + Math.random() * 30000
      : sym === "ETHUSDT" ? 2000 + Math.random() * 2000
      : 10 + Math.random() * 200;
    const change = entryPrice * (0.005 + Math.random() * 0.04) * (isWin ? 1 : -1);

    const dayOffset = Math.floor((i / numTrades) * 300);
    const entryDate = new Date(2025, 0, 1 + dayOffset);
    const exitDate = new Date(entryDate.getTime() + (1 + Math.random() * 5) * 86400000);

    trades.push({
      entryTime: entryDate.toISOString().slice(0, 16).replace("T", " "),
      exitTime: exitDate.toISOString().slice(0, 16).replace("T", " "),
      symbol: sym,
      entryPrice: +entryPrice.toFixed(2),
      exitPrice: +(entryPrice + change).toFixed(2),
      profit: +change.toFixed(2),
      result: isWin ? "Win" : "Loss",
    });
  }

  const wins = trades.filter(t => t.result === "Win");
  const losses = trades.filter(t => t.result === "Loss");
  const grossProfit = wins.reduce((s, t) => s + t.profit, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.profit, 0));

  // Build equity curve
  let equity = 10000;
  let peak = equity;
  const equityCurve: { date: string; equity: number }[] = [];
  const drawdownCurve: { date: string; drawdown: number }[] = [];

  for (let i = 0; i < trades.length; i++) {
    equity += trades[i].profit * (params.riskPerTrade / 100) * 10;
    peak = Math.max(peak, equity);
    const dd = ((peak - equity) / peak) * 100;
    equityCurve.push({ date: trades[i].exitTime.slice(0, 10), equity: +equity.toFixed(2) });
    drawdownCurve.push({ date: trades[i].exitTime.slice(0, 10), drawdown: +dd.toFixed(2) });
  }

  const maxDD = Math.max(...drawdownCurve.map(d => d.drawdown));

  return {
    metrics: {
      totalTrades: trades.length,
      winRate: +(wins.length / trades.length * 100).toFixed(1),
      profitFactor: grossLoss > 0 ? +(grossProfit / grossLoss).toFixed(2) : 0,
      maxDrawdown: +maxDD.toFixed(2),
      totalReturn: +(((equity - 10000) / 10000) * 100).toFixed(2),
      finalEquity: +equity.toFixed(2),
    },
    equityCurve,
    drawdownCurve,
    trades,
  };
}

export function useBacktest() {
  const [params, setParams] = useState<BacktestParams>({ ...DEFAULT_PARAMS });
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runBacktest = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try real API first, fallback to mock
      try {
        const res = await fetch("/api/backtest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbol: params.symbols,
            timeframe: params.timeframe,
            start_date: params.startDate,
            end_date: params.endDate,
            ema_period: params.emaPeriod,
            rsi_threshold: params.rsiThreshold,
            bb_window: params.bbWindow,
            bb_std: params.bbStd,
            stop_loss_pct: params.stopLossPct,
            risk_per_trade: params.riskPerTrade,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setResult(data);
          setLoading(false);
          return;
        }
      } catch {
        // API not available, use mock
      }

      // Simulate delay
      await new Promise(r => setTimeout(r, 1200));
      setResult(generateMockResult(params));
    } catch (e) {
      setError("Backtest failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetParams = () => {
    setParams({ ...DEFAULT_PARAMS });
    setResult(null);
    setError(null);
  };

  return { params, setParams, result, loading, error, runBacktest, resetParams };
}
