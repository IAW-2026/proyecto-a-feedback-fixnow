"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface Props {
  data: Array<{ rating: number; count: number }>
}

const AMBER = "#d97706"
const MUTED = "#e5e7eb"

export function RatingBarChart({ data }: Props) {
  // Aseguramos que los 5 ratings siempre aparezcan, aunque alguno tenga 0 reseñas
  const filled = [1, 2, 3, 4, 5].map(r => ({
    rating: r,
    count: data.find(d => d.rating === r)?.count ?? 0,
  }))

  const max = Math.max(...filled.map(d => d.count), 1)

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={filled} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <XAxis
          dataKey="rating"
          tickFormatter={v => `${v}★`}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          domain={[0, max]}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
          formatter={(v) => [v ?? 0, "reseñas"]}
          labelFormatter={l => `${l} estrella${l !== 1 ? "s" : ""}`}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {filled.map(d => (
            <Cell key={d.rating} fill={d.count === max ? AMBER : MUTED} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
