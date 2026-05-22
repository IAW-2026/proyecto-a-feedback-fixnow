import Link from "next/link"

const accentActiveClass: Record<string, string> = {
  amber: "bg-amber-600 text-white",
  green: "bg-green-600 text-white",
  red:   "bg-red-600   text-white",
}

interface FilterTabProps {
  href:     string
  active:   boolean
  accent?:  "amber" | "green" | "red"
  size?:    "md" | "sm"
  children: React.ReactNode
}

export function FilterTab({ href, active, accent, size = "md", children }: FilterTabProps) {
  const activeClass = accent ? accentActiveClass[accent] : "bg-foreground text-background"

  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
        size === "sm" ? "text-xs" : "text-sm"
      } ${
        active
          ? activeClass
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  )
}
