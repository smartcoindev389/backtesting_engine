import { BacktestMetrics } from "@/hooks/useBacktest";
import { TrendingUp, TrendingDown, Target, BarChart3, Percent, DollarSign } from "lucide-react";

interface Props {
  metrics: BacktestMetrics;
}

const cards = [
  { key: "totalTrades" as const, label: "Total Trades", icon: BarChart3, format: (v: number) => v.toString() },
  { key: "winRate" as const, label: "Win Rate", icon: Target, format: (v: number) => `${v}%`, positive: (v: number) => v >= 50 },
  { key: "profitFactor" as const, label: "Profit Factor", icon: TrendingUp, format: (v: number) => v.toFixed(2), positive: (v: number) => v >= 1 },
  { key: "maxDrawdown" as const, label: "Max Drawdown", icon: TrendingDown, format: (v: number) => `${v}%`, positive: () => false },
  { key: "totalReturn" as const, label: "Total Return", icon: Percent, format: (v: number) => `${v > 0 ? "+" : ""}${v}%`, positive: (v: number) => v > 0 },
  { key: "finalEquity" as const, label: "Final Equity", icon: DollarSign, format: (v: number) => `$${v.toLocaleString()}` },
];

export function PerformanceCards({ metrics }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map(({ key, label, icon: Icon, format, positive }) => {
        const value = metrics[key];
        const isPositive = positive ? positive(value) : undefined;

        return (
          <div key={key} className="panel p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
            </div>
            <div className={`stat-value ${
              isPositive === true ? "text-profit" :
              isPositive === false ? "text-loss" :
              "text-foreground"
            }`}>
              {format(value)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
