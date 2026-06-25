import Link from "next/link"

const accentActiveClass: Record<string, string> = {
  amber: "bg-amber-600 text-white",
  green: "bg-green-600 text-white",
  red:   "bg-[#b31b1b]   text-white",
}

interface FilterTabProps {
  href:     string
  active:   boolean
  accent?:  "amber" | "green" | "red" | "blue"
  size?:    "md" | "sm"
  children: React.ReactNode
}

export function FilterTab({ href, active, accent, size = "md", children }: FilterTabProps) {
  const activeClass = accent ? accentActiveClass[accent] : "bg-[#12384a] text-background"

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
