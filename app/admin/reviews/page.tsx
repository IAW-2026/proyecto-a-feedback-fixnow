import Link from "next/link"
import type { Review } from "@prisma/client"
import { LayoutList, Star, UserCheck, Briefcase, type LucideIcon } from "lucide-react"
import { db } from "@/lib/db"
import { Header } from "@/components/header"
import { AdminReviewCard } from "@/components/admin-review-card"

export const dynamic = "force-dynamic"

type FilterType = "all" | "professional" | "client"

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const activeFilter: FilterType =
    type === "professional" ? "professional" : type === "client" ? "client" : "all"

  // Traer reviews filtradas + stats globales en paralelo
  const [reviews, stats, breakdown] = await Promise.all([
    db.review.findMany({
      where: activeFilter !== "all" ? { revieweeType: activeFilter } : {},
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.review.aggregate({
      _avg: { rating: true },
      _count: { id: true },
    }),
    db.review.groupBy({
      by: ["revieweeType"],
      _count: { id: true },
    }),
  ])

  const totalCount = stats._count.id
  const avgRating = stats._avg.rating ?? 0
  const profCount = breakdown.find((b: { revieweeType: string }) => b.revieweeType === "professional")?._count.id ?? 0
  const clientCount = breakdown.find((b: { revieweeType: string }) => b.revieweeType === "client")?._count.id ?? 0

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
            <StatCard label="Total reseñas" value={totalCount} icon={LayoutList} accent="navy" />
            <StatCard label="Promedio general" value={`${avgRating.toFixed(1)}`} icon={Star} accent="gold" />
            <StatCard label="Cliente → Profesional" value={profCount} icon={UserCheck} accent="blue" />
            <StatCard label="Profesional → Cliente" value={clientCount} icon={Briefcase} accent="purple" />
          </div>

          {/* Filtros */}
          <div className="mb-6 flex gap-2">
            <FilterTab href="/admin/reviews" active={activeFilter === "all"}>
              Todas ({totalCount})
            </FilterTab>
            <FilterTab href="/admin/reviews?type=professional" active={activeFilter === "professional"}>
              <span className="hidden sm:inline">Cliente → Profesional</span>
              <span className="sm:hidden">C → P</span>
              {" "}({profCount})
            </FilterTab>
            <FilterTab href="/admin/reviews?type=client" active={activeFilter === "client"}>
              <span className="hidden sm:inline">Profesional → Cliente</span>
              <span className="sm:hidden">P → C</span>
              {" "}({clientCount})
            </FilterTab>
          </div>

          {/* Lista */}
          {reviews.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">No hay reseñas para este filtro</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review: Review) => (
                <AdminReviewCard
                  key={review.id}
                  id={review.id}
                  jobId={review.jobId}
                  reviewerId={review.reviewerId}
                  revieweeId={review.revieweeId}
                  revieweeType={review.revieweeType}
                  rating={review.rating}
                  comment={review.comment}
                  createdAt={review.createdAt}
                />
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

/* ——— Subcomponentes de layout ——— */

const accentStyles = {
  navy:   { border: "#031D44", iconBg: "bg-slate-100",   iconColor: "text-slate-700",   value: "text-foreground" },
  gold:   { border: "#DAB785", iconBg: "bg-amber-50",    iconColor: "text-amber-600",   value: "text-foreground" },
  blue:   { border: "#3b82f6", iconBg: "bg-blue-50",     iconColor: "text-blue-600",    value: "text-blue-600"   },
  purple: { border: "#a855f7", iconBg: "bg-purple-50",   iconColor: "text-purple-600",  value: "text-purple-600" },
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent = "navy",
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

function FilterTab({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  )
}
