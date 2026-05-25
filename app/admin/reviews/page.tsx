import type { Review } from "@prisma/client"
import { unstable_cache } from "next/cache"
import { LayoutList, Clock, CheckCircle, XCircle } from "lucide-react"
import { db } from "@/lib/db"
import { getBannedWords } from "@/lib/word-filter"
import { Header } from "@/components/header"
import { AdminReviewCard } from "@/components/admin-review-card"
import { StatCard } from "@/components/stat-card"
import { FilterTab } from "@/components/filter-tab"
import { ReviewEmptyState } from "@/components/review-empty-state"

export const dynamic = "force-dynamic"

/**
 * Conteos globales por (status × revieweeType) — un solo query en lugar de dos.
 * Se cachea con tag "review-breakdown": se invalida únicamente cuando el admin
 * aprueba o rechaza una reseña, no en cada visita a la página.
 */
const getBreakdown = unstable_cache(
  () => db.review.groupBy({
    by: ["status", "revieweeType"],
    _count: { _all: true },
  }),
  ["review-breakdown"],
  { tags: ["review-breakdown"] },
)

type StatusFilter = "all" | "pending" | "approved" | "rejected"
type TypeFilter   = "all" | "professional" | "client"
type BreakdownRow = { status: string; revieweeType: string; _count: { _all: number } }

function sumBreakdown(rows: BreakdownRow[], fn: (b: BreakdownRow) => boolean): number {
  return rows.filter(fn).reduce((acc, b) => acc + b._count._all, 0)
}

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

  // 3 queries en paralelo: breakdown cacheado por tag, bannedWords sin caché (tabla pequeña)
  const [reviews, breakdown, bannedWords] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    getBreakdown(),
    getBannedWords(),
  ])

  // Cast explícito porque el genérico de Prisma no estrecha _count correctamente.
  const rows = breakdown as BreakdownRow[]

  const totalCount    = sumBreakdown(rows, () => true)
  const pendingCount  = sumBreakdown(rows, b => b.status === "pending")
  const approvedCount = sumBreakdown(rows, b => b.status === "approved")
  const rejectedCount = sumBreakdown(rows, b => b.status === "rejected")
  const profCount     = sumBreakdown(rows, b => b.revieweeType === "professional")
  const clientCount   = sumBreakdown(rows, b => b.revieweeType === "client")

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
            <ReviewEmptyState status={activeStatus} type={activeType} />
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
                    showStatusBadge={activeStatus === "all"}
                    bannedWords={bannedWords}
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
