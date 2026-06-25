import {
  CheckCircle,
  XCircle,
  Star,
  ShieldAlert,
  TrendingUp,
} from "lucide-react"
import { db } from "@/lib/db"
import { Header } from "@/components/header"
import { StatCard } from "@/components/stat-card"
import { RatingBarChart } from "@/components/rating-bar-chart"
import { ReviewsOverTimeChart } from "@/components/reviews-over-time-chart"

export const dynamic = "force-dynamic"

type WeekRow = { week: Date; count: bigint }

export default async function StatsPage() {
  // Batch 1 — queries independientes en paralelo
  const [statusGroups, ratingGroups, avgByType, weeklyRaw, bannedWords] = await Promise.all([
    // Conteos por estado
    db.review.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    // Distribución de ratings (solo aprobadas — las que el público ve)
    db.review.groupBy({
      by: ["rating"],
      _count: { _all: true },
      where: { status: "approved" },
      orderBy: { rating: "asc" },
    }),
    // Rating promedio por tipo (solo aprobadas)
    db.review.groupBy({
      by: ["revieweeType"],
      _avg: { rating: true },
      where: { status: "approved" },
    }),
    // Reseñas por semana — últimas 10 semanas
    db.$queryRaw<WeekRow[]>`
      SELECT DATE_TRUNC('week', "createdAt") AS week, COUNT(*) AS count
      FROM reviews
      GROUP BY week
      ORDER BY week DESC
      LIMIT 10
    `,
    // Palabras prohibidas para calcular hits
    db.bannedWord.findMany({ orderBy: { word: "asc" } }),
  ])

  // Batch 2 — hits por palabra (depende de bannedWords)
  const wordHits = bannedWords.length > 0
    ? await Promise.all(
        bannedWords.map(bw =>
          db.review.count({
            where: { comment: { contains: bw.word, mode: "insensitive" } },
          }).then(count => ({ word: bw.word, count }))
        )
      )
    : []

  // ── Derivar métricas ──────────────────────────────────────────────

  const count = (s: string) =>
    statusGroups.find(g => g.status === s)?._count._all ?? 0

  const approvedCount = count("approved")
  const rejectedCount = count("rejected")
  const moderated     = approvedCount + rejectedCount
  const approvalRate  = moderated > 0
    ? Math.round((approvedCount / moderated) * 100)
    : null

  const avgFor = (type: string) => {
    const avg = avgByType.find(g => g.revieweeType === type)?._avg.rating
    return avg != null ? avg.toFixed(2) : "—"
  }

  const ratingData = ratingGroups.map(g => ({ rating: g.rating, count: g._count._all }))

  // Serializar BigInt + invertir para orden cronológico (más antigua primero)
  const weeklyData = (weeklyRaw as WeekRow[])
    .map(r => ({
      week: new Date(r.week).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
      count: Number(r.count),
    }))
    .reverse()

  const sortedWordHits = [...wordHits].sort((a, b) => b.count - a.count)
  const totalFlagged   = wordHits.reduce((acc, w) => acc + w.count, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">

          <header className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Estadísticas
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Vista general de la actividad y calidad de reseñas
            </p>
          </header>

          {/* ── Fila 1: métricas clave ── */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Aprobadas"
              value={approvedCount}
              icon={CheckCircle}
              accent="green"
            />
            <StatCard
              label="Rechazadas"
              value={rejectedCount}
              icon={XCircle}
              accent="red"
            />
            <StatCard
              label="Tasa de aprobación"
              value={approvalRate != null ? `${approvalRate}%` : "—"}
              icon={TrendingUp}
              accent="navy"
            />
            <StatCard
              label="Reseñas marcadas"
              value={totalFlagged}
              icon={ShieldAlert}
              accent="amber"
            />
          </div>

          {/* ── Fila 2: rating promedio por tipo ── */}
          <div className="mb-8 grid grid-cols-2 gap-3">
            <StatCard
              label="Rating prom. C → Profesional"
              value={avgFor("professional")}
              icon={Star}
              accent="amber"
            />
            <StatCard
              label="Rating prom. P → Cliente"
              value={avgFor("client")}
              icon={Star}
              accent="amber"
            />
          </div>

          {/* ── Fila 3: gráficos ── */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-4 text-sm font-medium text-foreground">
                Distribución de ratings
              </p>
              <p className="mb-3 text-xs text-muted-foreground">Solo reseñas aprobadas</p>
              <RatingBarChart data={ratingData} />
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-4 text-sm font-medium text-foreground">
                Reseñas por semana
              </p>
              <p className="mb-3 text-xs text-muted-foreground">Últimas 10 semanas</p>
              <ReviewsOverTimeChart data={weeklyData} />
            </div>

          </div>

          {/* ── Fila 4: palabras prohibidas ── */}
          {sortedWordHits.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-1 text-sm font-medium text-foreground">
                Palabras prohibidas — apariciones en reseñas
              </p>
              <p className="mb-4 text-xs text-muted-foreground">
                Incluye reseñas de cualquier estado
              </p>
              <ul className="space-y-2">
                {sortedWordHits.map(({ word, count }) => {
                  const pct = totalFlagged > 0 ? (count / totalFlagged) * 100 : 0
                  return (
                    <li key={word} className="flex items-center gap-3">
                      <code className="w-32 shrink-0 rounded bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                        {word}
                      </code>
                      <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                        <div
                          className="h-2 rounded-full bg-[#b31b1b] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                        {count}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
