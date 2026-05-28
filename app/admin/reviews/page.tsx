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
type SortOption   = "date-desc" | "date-asc" | "rating-desc" | "rating-asc" | "flagged"
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

function parseSort(v?: string): SortOption {
  // "date-desc" es el default → URL limpia sin param
  if (v === "date-asc" || v === "rating-desc" || v === "rating-asc" || v === "flagged") return v
  return "date-desc"
}

/** Construye la URL preservando los tres filtros activos. */
function buildUrl(status: StatusFilter, type: TypeFilter, sort: SortOption) {
  const p = new URLSearchParams()
  if (status !== "pending")   p.set("status", status)
  if (type   !== "all")       p.set("type",   type)
  if (sort   !== "date-desc") p.set("sort",   sort)
  const qs = p.toString()
  return `/admin/reviews${qs ? `?${qs}` : ""}`
}

/**
 * Ordena las reseñas poniendo primero las que contienen palabras prohibidas.
 * Se aplica en memoria después del fetch porque Prisma no conoce la lista de palabras.
 */
function sortByFlagged(reviews: Review[], bannedWords: string[]): Review[] {
  if (bannedWords.length === 0) return reviews
  const isFlagged = (comment: string | null) => {
    if (!comment) return false
    const lower = comment.toLowerCase()
    return bannedWords.some(w => lower.includes(w))
  }
  return [...reviews].sort((a, b) => Number(isFlagged(b.comment)) - Number(isFlagged(a.comment)))
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; sort?: string }>
}) {
  const { status, type, sort } = await searchParams
  const activeStatus = parseStatus(status)
  const activeType   = parseType(type)
  const activeSort   = parseSort(sort)

  const where = {
    ...(activeStatus !== "all" && { status:       activeStatus }),
    ...(activeType   !== "all" && { revieweeType: activeType  }),
  }

  const orderBy =
    activeSort === "date-asc"    ? { createdAt: "asc"  as const } :
    activeSort === "rating-desc" ? { rating:    "desc" as const } :
    activeSort === "rating-asc"  ? { rating:    "asc"  as const } :
    { createdAt: "desc" as const } // date-desc y flagged — ambos traen por fecha desc desde DB

  const [reviews, breakdown, bannedWords] = await Promise.all([
    db.review.findMany({ where, orderBy }),
    getBreakdown(),
    getBannedWords(),
  ])

  const sortedReviews = activeSort === "flagged"
    ? sortByFlagged(reviews, bannedWords)
    : reviews

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
            <FilterTab href={buildUrl("all",      activeType, activeSort)} active={activeStatus === "all"}>
              Todas ({totalCount})
            </FilterTab>
            <FilterTab href={buildUrl("pending",  activeType, activeSort)} active={activeStatus === "pending"}  accent="amber">
              Pendientes ({pendingCount})
            </FilterTab>
            <FilterTab href={buildUrl("approved", activeType, activeSort)} active={activeStatus === "approved"} accent="green">
              Aprobadas ({approvedCount})
            </FilterTab>
            <FilterTab href={buildUrl("rejected", activeType, activeSort)} active={activeStatus === "rejected"} accent="red">
              Rechazadas ({rejectedCount})
            </FilterTab>
          </div>

          {/* ── Fila 2: filtro por tipo ── */}
          <div className="mb-2 flex flex-wrap gap-2">
            <FilterTab href={buildUrl(activeStatus, "all",          activeSort)} active={activeType === "all"}          size="sm">
              Todos los tipos
            </FilterTab>
            <FilterTab href={buildUrl(activeStatus, "professional", activeSort)} active={activeType === "professional"} size="sm">
              <span className="hidden sm:inline">Cliente → Profesional</span>
              <span className="sm:hidden">C → P</span>
              {" "}({profCount})
            </FilterTab>
            <FilterTab href={buildUrl(activeStatus, "client",       activeSort)} active={activeType === "client"}       size="sm">
              <span className="hidden sm:inline">Profesional → Cliente</span>
              <span className="sm:hidden">P → C</span>
              {" "}({clientCount})
            </FilterTab>
          </div>

          {/* ── Fila 3: ordenamiento ── */}
          <div className="mb-6 flex flex-wrap gap-2">
            <FilterTab href={buildUrl(activeStatus, activeType, "date-desc")}   active={activeSort === "date-desc"}   size="sm">
              Más reciente
            </FilterTab>
            <FilterTab href={buildUrl(activeStatus, activeType, "date-asc")}    active={activeSort === "date-asc"}    size="sm">
              Más antigua
            </FilterTab>
            <FilterTab href={buildUrl(activeStatus, activeType, "rating-desc")} active={activeSort === "rating-desc"} size="sm">
              Mayor rating
            </FilterTab>
            <FilterTab href={buildUrl(activeStatus, activeType, "rating-asc")}  active={activeSort === "rating-asc"}  size="sm">
              Menor rating
            </FilterTab>
            <FilterTab href={buildUrl(activeStatus, activeType, "flagged")}     active={activeSort === "flagged"}     size="sm" accent="red">
              Palabras prohibidas
            </FilterTab>
          </div>

          {/* Lista */}
          {sortedReviews.length === 0 ? (
            <ReviewEmptyState status={activeStatus} type={activeType} />
          ) : (
            <div className="space-y-3">
              {sortedReviews.map((review: Review) => (
                <AdminReviewCard
                  key={review.id}
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
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
