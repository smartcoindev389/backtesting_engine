import { BacktestParams } from "@/hooks/useBacktest";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, RotateCcw, X, HelpCircle } from "lucide-react";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "DOGEUSDT", "SOLUSDT", "AVAXUSDT", "MATICUSDT", "LINKUSDT", "ADAUSDT", "ATOMUSDT", "APTUSDT", "ARBUSDT", "NEARUSDT", "FTMUSDT"];
const TIMEFRAMES = ["15m", "30m", "1h", "4h"];

const PARAM_TOOLTIPS: Record<string, string> = {
  emaPeriod:
    "Trend filter. Entries only when price is above this EMA (uptrend). Lower = more trades, weaker trend filter. Higher (e.g. 200–250) = fewer trades, stronger trend. Typical: 100–250.",
  rsiThreshold:
    "Oversold level for entries. Entry when RSI is below this value. Lower = fewer trades, stronger signal. Higher = more trades, weaker signal. Typical: 30–40.",
  bbWindow:
    "Number of candles used to calculate Bollinger Bands. Controls band sensitivity. Standard is 20; 30 gives smoother bands.",
  bbStd:
    "Distance of bands from the average (standard deviations). Entry when price touches the lower band. Higher = fewer trades, stronger signal. Typical: 2.0–2.5.",
  stopLossPct:
    "Exit when price moves this % against the trade. Protects capital. Lower = smaller losses but more stop-outs. Higher = fewer stop-outs but bigger losses. Typical for crypto: 1–2%.",
  riskPerTrade:
    "Portion of equity risked per trade (%). Position size is derived from this and your stop distance. Keeps risk consistent. Example: 1% on $10k = $100 risk per trade.",
};

interface Props {
  params: BacktestParams;
  onChange: (params: BacktestParams) => void;
  onRun: () => void;
  onReset: () => void;
  loading: boolean;
}

export function StrategyControls({ params, onChange, onRun, onReset, loading }: Props) {
  const update = (partial: Partial<BacktestParams>) => onChange({ ...params, ...partial });

  const toggleSymbol = (sym: string) => {
    const next = params.symbols.includes(sym)
      ? params.symbols.filter(s => s !== sym)
      : [...params.symbols, sym];
    if (next.length > 0) update({ symbols: next });
  };

  return (
    <div className="panel p-4 h-full overflow-y-auto space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Strategy Controls</h2>

      {/* Symbols */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Symbols</Label>
        <div className="flex flex-wrap gap-1.5">
          {SYMBOLS.map(sym => (
            <button
              key={sym}
              onClick={() => toggleSymbol(sym)}
              className={`px-2 py-1 rounded text-xs font-mono transition-colors border ${
                params.symbols.includes(sym)
                  ? "bg-primary/15 border-primary text-primary"
                  : "bg-secondary border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {params.symbols.map(sym => (
            <Badge key={sym} variant="secondary" className="text-xs font-mono gap-1">
              {sym}
              <X className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100" onClick={() => toggleSymbol(sym)} />
            </Badge>
          ))}
        </div>
      </div>

      {/* Timeframe */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Timeframe</Label>
        <Select value={params.timeframe} onValueChange={v => update({ timeframe: v })}>
          <SelectTrigger className="bg-secondary border-border text-sm font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEFRAMES.map(tf => (
              <SelectItem key={tf} value={tf} className="font-mono">{tf}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Start Date</Label>
          <Input
            type="date"
            value={params.startDate}
            onChange={e => update({ startDate: e.target.value })}
            className="bg-secondary border-border text-sm font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">End Date</Label>
          <Input
            type="date"
            value={params.endDate}
            onChange={e => update({ endDate: e.target.value })}
            className="bg-secondary border-border text-sm font-mono"
          />
        </div>
      </div>

      {/* Strategy Parameters */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Parameters</Label>
        {([
          ["EMA Period", "emaPeriod", 1, 500],
          ["RSI Threshold", "rsiThreshold", 1, 100],
          ["Bollinger Window", "bbWindow", 2, 100],
          ["Bollinger Deviation", "bbStd", 0.5, 5],
          ["Stop Loss %", "stopLossPct", 0.1, 20],
          ["Risk per Trade %", "riskPerTrade", 0.1, 10],
        ] as const).map(([label, key, min, max]) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 shrink-0 min-w-0">
              <Label className="text-xs text-secondary-foreground">{label}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Info: ${label}`}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
                  {PARAM_TOOLTIPS[key]}
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              type="number"
              min={min}
              max={max}
              step={key === "bbStd" || key === "stopLossPct" || key === "riskPerTrade" ? 0.1 : 1}
              value={params[key]}
              onChange={e => update({ [key]: parseFloat(e.target.value) || 0 })}
              className="bg-secondary border-border text-sm font-mono w-20 text-right"
            />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <Button
          onClick={onRun}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {loading ? "Running..." : "Run Backtest"}
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full border-border text-muted-foreground hover:text-foreground gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Parameters
        </Button>
      </div>
    </div>
  );
}
