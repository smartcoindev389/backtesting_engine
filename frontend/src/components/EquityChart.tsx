import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Props {
  data: { date: string; equity: number }[];
}

export function EquityChart({ data }: Props) {
  return (
    <div className="panel p-4 space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Equity Curve</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
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
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Equity"]}
            />
            <Line
              type="monotone"
              dataKey="equity"
              stroke="hsl(173 80% 45%)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(173 80% 45%)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
