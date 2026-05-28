"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface Props {
  data: Array<{ week: string; count: number }>
}

export function ReviewsOverTimeChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#031D44" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#031D44" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ stroke: "#031D44", strokeWidth: 1, strokeDasharray: "4 2" }}
          formatter={(v) => [v ?? 0, "reseñas"]}
          labelFormatter={l => `Semana del ${l}`}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#031D44"
          strokeWidth={2}
          fill="url(#areaGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#031D44" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
