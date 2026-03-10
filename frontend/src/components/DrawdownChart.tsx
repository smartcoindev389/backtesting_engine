import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Props {
  data: { date: string; drawdown: number }[];
}

export function DrawdownChart({ data }: Props) {
  return (
    <div className="panel p-4 space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Drawdown</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(215 12% 50%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(220 14% 18%)" }}
            />
            <YAxis
              tick={{ fill: "hsl(215 12% 50%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(220 14% 18%)" }}
              tickFormatter={v => `${v}%`}
              reversed
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220 18% 12%)",
                border: "1px solid hsl(220 14% 18%)",
                borderRadius: "6px",
                fontFamily: "JetBrains Mono",
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(215 12% 50%)" }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, "Drawdown"]}
            />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="hsl(0 72% 55%)"
              fill="hsl(0 72% 55% / 0.15)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
