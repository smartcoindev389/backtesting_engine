import { useBacktest } from "@/hooks/useBacktest";
import { StrategyControls } from "@/components/StrategyControls";
import { PerformanceCards } from "@/components/PerformanceCards";
import { EquityChart } from "@/components/EquityChart";
import { DrawdownChart } from "@/components/DrawdownChart";
import { TradeTable } from "@/components/TradeTable";
import { AlertCircle, BarChart3, Info } from "lucide-react";

const Index = () => {
  const { params, setParams, result, loading, error, runBacktest, resetParams } = useBacktest();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center gap-3">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h1 className="text-sm font-semibold tracking-wide">Backtest Engine</h1>
        <span className="text-xs text-muted-foreground font-mono ml-auto">v1.0</span>
      </header>

      <div className="flex h-[calc(100vh-49px)]">
        {/* Left Panel */}
        <aside className="w-80 min-w-80 border-r border-border overflow-hidden">
          <StrategyControls
            params={params}
            onChange={setParams}
            onRun={runBacktest}
            onReset={resetParams}
            loading={loading}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="panel p-4 border-loss/30 flex items-center gap-3 text-loss">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-32">
              <div className="text-center space-y-4">
                <div className="h-10 w-10 mx-auto border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Running backtest simulation...</p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="flex items-center justify-center py-32">
              <div className="text-center space-y-3 max-w-sm">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground">Configure your strategy parameters and click <span className="text-primary font-medium">Run Backtest</span> to see results.</p>
              </div>
            </div>
          )}

          {!loading && result && (
            <>
              {result.metrics.totalTrades === 0 && (
                <div className="panel p-4 border-warning/30 flex items-start gap-3 text-warning">
                  <Info className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium">No trades found for these parameters.</p>
                    <p className="text-muted-foreground">
                      Try a longer date range, lower the EMA period (e.g. 200 for long-term trend), 
                      increase the RSI threshold, or select a more volatile asset like ADAUSDT.
                    </p>
                  </div>
                </div>
              )}
              <PerformanceCards metrics={result.metrics} />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <EquityChart data={result.equityCurve} />
                <DrawdownChart data={result.drawdownCurve} />
              </div>
              <TradeTable trades={result.trades} />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
