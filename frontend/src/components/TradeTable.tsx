import { useState, useMemo } from "react";
import { Trade } from "@/hooks/useBacktest";
import { ArrowUpDown } from "lucide-react";

interface Props {
  trades: Trade[];
}

type SortKey = keyof Trade;

export function TradeTable({ trades }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("entryTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...trades].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "number" ? (av as number) - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [trades, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const columns: { key: SortKey; label: string; align?: string }[] = [
    { key: "entryTime", label: "Entry Time" },
    { key: "exitTime", label: "Exit Time" },
    { key: "symbol", label: "Symbol" },
    { key: "entryPrice", label: "Entry Price", align: "right" },
    { key: "exitPrice", label: "Exit Price", align: "right" },
    { key: "profit", label: "Profit", align: "right" },
    { key: "result", label: "Result" },
  ];

  return (
    <div className="panel overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Trade History
          <span className="ml-2 text-xs font-normal text-muted-foreground">({trades.length} trades)</span>
        </h3>
      </div>
      <div className="overflow-auto max-h-80">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card">
            <tr className="border-b border-border">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={`px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className={`h-3 w-3 ${sortKey === col.key ? "text-primary" : "opacity-30"}`} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((trade, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-2 font-mono text-xs">{trade.entryTime}</td>
                <td className="px-4 py-2 font-mono text-xs">{trade.exitTime}</td>
                <td className="px-4 py-2 font-mono text-xs font-medium">{trade.symbol}</td>
                <td className="px-4 py-2 font-mono text-xs text-right">${trade.entryPrice.toLocaleString()}</td>
                <td className="px-4 py-2 font-mono text-xs text-right">${trade.exitPrice.toLocaleString()}</td>
                <td className={`px-4 py-2 font-mono text-xs text-right font-medium ${
                  trade.profit >= 0 ? "text-profit" : "text-loss"
                }`}>
                  {trade.profit >= 0 ? "+" : ""}${trade.profit.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    trade.result === "Win"
                      ? "bg-profit/15 text-profit"
                      : "bg-loss/15 text-loss"
                  }`}>
                    {trade.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
