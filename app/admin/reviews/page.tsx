import Link from "next/link"
import type { Review } from "@prisma/client"
import { LayoutList, Clock, CheckCircle, XCircle, MessageSquareOff, type LucideIcon } from "lucide-react"
import { db } from "@/lib/db"
import { Header } from "@/components/header"
import { AdminReviewCard } from "@/components/admin-review-card"

export const dynamic = "force-dynamic"

type StatusFilter = "all" | "pending" | "approved" | "rejected"
type TypeFilter   = "all" | "professional" | "client"

function parseStatus(v?: string): StatusFilter {
  // "pending" es el default — sin parámetro o con valor inválido cae aquí
  if (v === "all" || v === "approved" || v === "rejected") return v
  return "pending"
}
function parseType(v?: string): TypeFilter {
  return v === "professional" || v === "client" ? v : "all"
}

/** Construye la URL preservando ambos filtros activos.
 *  "pending" es el default, no necesita param → URL limpia.
 *  "all" sí necesita param explícito para no confundirse con el default. */
function buildUrl(status: StatusFilter, type: TypeFilter) {
  const p = new URLSearchParams()
  if (status !== "pending") p.set("status", status)
  if (type   !== "all")     p.set("type",   type)
  const qs = p.toString()
  return `/admin/reviews${qs ? `?${qs}` : ""}`
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const { status, type } = await searchParams
  const activeStatus = parseStatus(status)
  const activeType   = parseType(type)

  const where = {
    ...(activeStatus !== "all" && { status:       activeStatus }),
    ...(activeType   !== "all" && { revieweeType: activeType  }),
  }

  const [reviews, statusBreakdown, typeBreakdown] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    // Conteos globales por estado — para stat cards y tabs de estado
    db.review.groupBy({ by: ["status"],       _count: { id: true } }),
    // Conteos globales por tipo — para tabs de tipo
    db.review.groupBy({ by: ["revieweeType"], _count: { id: true } }),
  ])

  const totalCount    = statusBreakdown.reduce((acc, b) => acc + b._count.id, 0)
  const pendingCount  = statusBreakdown.find(b => b.status === "pending")?._count.id  ?? 0
  const approvedCount = statusBreakdown.find(b => b.status === "approved")?._count.id ?? 0
  const rejectedCount = statusBreakdown.find(b => b.status === "rejected")?._count.id ?? 0
  const profCount     = typeBreakdown.find(b => b.revieweeType === "professional")?._count.id ?? 0
  const clientCount   = typeBreakdown.find(b => b.revieweeType === "client")?._count.id       ?? 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">

          {/* Encabezado */}
          <header className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Panel de Moderación
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisión y control de reseñas del sistema
            </p>
          </header>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total reseñas" value={totalCount}    icon={LayoutList}  accent="navy"  />
            <StatCard label="Pendientes"    value={pendingCount}  icon={Clock}       accent="amber" />
            <StatCard label="Aprobadas"     value={approvedCount} icon={CheckCircle} accent="green" />
            <StatCard label="Rechazadas"    value={rejectedCount} icon={XCircle}     accent="red"   />
          </div>

          {/* ── Fila 1: filtro por estado ── */}
          <div className="mb-2 flex flex-wrap gap-2">
            <FilterTab href={buildUrl("all",      activeType)} active={activeStatus === "all"}>
              Todas ({totalCount})
            </FilterTab>
            <FilterTab href={buildUrl("pending",  activeType)} active={activeStatus === "pending"}  accent="amber">
              Pendientes ({pendingCount})
            </FilterTab>
            <FilterTab href={buildUrl("approved", activeType)} active={activeStatus === "approved"} accent="green">
              Aprobadas ({approvedCount})
            </FilterTab>
            <FilterTab href={buildUrl("rejected", activeType)} active={activeStatus === "rejected"} accent="red">
              Rechazadas ({rejectedCount})
            </FilterTab>
          </div>

          {/* ── Fila 2: filtro por tipo ── */}
          <div className="mb-6 flex flex-wrap gap-2">
            <FilterTab href={buildUrl(activeStatus, "all")}          active={activeType === "all"}          size="sm">
              Todos los tipos
            </FilterTab>
            <FilterTab href={buildUrl(activeStatus, "professional")} active={activeType === "professional"} size="sm">
              <span className="hidden sm:inline">Cliente → Profesional</span>
              <span className="sm:hidden">C → P</span>
              {" "}({profCount})
            </FilterTab>
            <FilterTab href={buildUrl(activeStatus, "client")}       active={activeType === "client"}       size="sm">
              <span className="hidden sm:inline">Profesional → Cliente</span>
              <span className="sm:hidden">P → C</span>
              {" "}({clientCount})
            </FilterTab>
          </div>

          {/* Lista */}
          {reviews.length === 0 ? (
            <EmptyState status={activeStatus} type={activeType} />
          ) : (
            <div className="space-y-3">
              {reviews.map((review: Review, index) => (
                <div
                  key={review.id}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <AdminReviewCard
                    id={review.id}
                    jobId={review.jobId}
                    reviewerId={review.reviewerId}
                    revieweeId={review.revieweeId}
                    revieweeType={review.revieweeType}
                    rating={review.rating}
                    comment={review.comment}
                    status={review.status}
                    createdAt={review.createdAt}
                  />
                </div>
              ))}
            </div>
          )}

          {reviews.length === 50 && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Mostrando las últimas 50 reseñas
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

/* ——— Stat cards ——— */

const accentStyles = {
  navy:  { border: "#031D44", iconBg: "bg-slate-100", iconColor: "text-slate-700", value: "text-foreground"  },
  amber: { border: "#d97706", iconBg: "bg-amber-50",  iconColor: "text-amber-600", value: "text-amber-600"   },
  green: { border: "#16a34a", iconBg: "bg-green-50",  iconColor: "text-green-600", value: "text-green-600"   },
  red:   { border: "#dc2626", iconBg: "bg-red-50",    iconColor: "text-red-600",   value: "text-red-600"     },
}

function StatCard({
  label, value, icon: Icon, accent = "navy",
}: {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: keyof typeof accentStyles
}) {
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

/* ——— Filter tabs ——— */

function FilterTab({
  href, active, accent, size = "md", children,
}: {
  href: string
  active: boolean
  accent?: "amber" | "green" | "red"
  size?: "md" | "sm"
  children: React.ReactNode
}) {
  const accentActiveClass: Record<string, string> = {
    amber: "bg-amber-600 text-white",
    green: "bg-green-600 text-white",
    red:   "bg-red-600   text-white",
  }
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

/* ——— Empty state ——— */

function EmptyState({ status, type }: { status: StatusFilter; type: TypeFilter }) {
  const typeLabel =
    type === "professional" ? " de clientes sobre profesionales"
    : type === "client"     ? " de profesionales sobre clientes"
    : ""

  const messages: Record<StatusFilter, string> = {
    all:      `No hay reseñas${typeLabel} en el sistema`,
    pending:  `No hay reseñas pendientes${typeLabel}`,
    approved: `No hay reseñas aprobadas${typeLabel}`,
    rejected: `No hay reseñas rechazadas${typeLabel}`,
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <MessageSquareOff className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="font-display text-base font-semibold text-foreground">Sin reseñas</p>
      <p className="mt-1 text-sm text-muted-foreground">{messages[status]}</p>
    </div>
  )
}
