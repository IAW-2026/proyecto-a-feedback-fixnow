import type { LucideIcon } from "lucide-react"

const accentStyles = {
  navy:  { border: "#031D44", iconBg: "bg-slate-100", iconColor: "text-slate-700", value: "text-foreground" },
  amber: { border: "#d97706", iconBg: "bg-amber-50",  iconColor: "text-amber-600", value: "text-amber-600"  },
  green: { border: "#16a34a", iconBg: "bg-green-50",  iconColor: "text-green-600", value: "text-green-600"  },
  red:   { border: "#b31b1b", iconBg: "bg-red-50",    iconColor: "text-red-600",   value: "text-red-600"    },
}

export type StatCardAccent = keyof typeof accentStyles

interface StatCardProps {
  label:   string
  value:   string | number
  icon:    LucideIcon
  accent?: StatCardAccent
}

export function StatCard({ label, value, icon: Icon, accent = "navy" }: StatCardProps) {
  const s = accentStyles[accent]
  return (
    <div
      className="rounded-xl border border-border bg-card p-4"
      style={{ borderLeft: `3px solid ${s.border}` }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs text-muted-foreground leading-snug">{label}</p>
        <span className={`rounded-md p-1.5 ${s.iconBg}`}>
          <Icon className={`h-3.5 w-3.5 ${s.iconColor}`} />
        </span>
      </div>
      <p className={`mt-2 font-display text-2xl font-bold ${s.value}`}>{value}</p>
    </div>
  )
}
