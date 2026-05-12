"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ReviewCard } from "@/components/review-card"
import { RatingSummary } from "@/components/rating-summary"
import { ArrowLeft, Wrench, User } from "lucide-react"
import Link from "next/link"

// Mock data - en produccion vendria de la API
const mockProfessionalReviews = [
  {
    id: "1",
    reviewerName: "Maria Garcia",
    rating: 5,
    comment: "Excelente servicio, muy profesional y puntual. Resolvio el problema rapidamente.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    reviewerName: "Juan Rodriguez",
    rating: 4,
    comment: "Buen trabajo, llego a tiempo y dejo todo limpio.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    reviewerName: "Ana Martinez",
    rating: 5,
    comment: "Muy recomendado, trabajo de calidad y precio justo.",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
]

const mockClientReviews = [
  {
    id: "1",
    reviewerName: "Carlos Electricista",
    rating: 5,
    comment: "Cliente muy amable, pago a tiempo y fue claro con lo que necesitaba.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    reviewerName: "Pedro Plomero",
    rating: 4,
    comment: "Buena comunicacion, lugar facil de encontrar.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
]

type TabType = "professionals" | "clients"

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>("professionals")

  const reviews = activeTab === "professionals" ? mockProfessionalReviews : mockClientReviews
  const totalReviews = reviews.length
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
  const distribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl">
          {/* Back Button */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <header className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Historial de Reseñas
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Consulta las reseñas de tus servicios
            </p>
          </header>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 rounded-lg bg-muted p-1">
            <button
              onClick={() => setActiveTab("professionals")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "professionals"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Profesionales</span>
              <span className="sm:hidden">Prof.</span>
            </button>
            <button
              onClick={() => setActiveTab("clients")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "clients"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4" />
              Clientes
            </button>
          </div>

          {/* Summary */}
          <div className="mb-6 rounded-xl border border-border bg-card p-6">
            <RatingSummary
              averageRating={averageRating}
              totalReviews={totalReviews}
              distribution={distribution}
            />
          </div>

          {/* Reviews List */}
          <section>
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              {activeTab === "professionals" ? "Reseñas de Profesionales" : "Reseñas de Clientes"}
            </h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    reviewerName={review.reviewerName}
                    rating={review.rating}
                    comment={review.comment}
                    createdAt={review.createdAt}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">
                  No hay reseñas disponibles
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
