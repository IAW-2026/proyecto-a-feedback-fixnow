"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ReviewForm } from "@/components/review-form"
import { CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewReviewPage() {
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: { rating: number; comment: string }) => {
    // Simular llamada a la API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Review submitted:", data)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-md">
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Gracias por tu reseña
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tu opinion nos ayuda a mejorar el servicio
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => setSubmitted(false)}
                  className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Enviar otra reseña
                </button>
                <Link
                  href="/"
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-md">
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
              Deja tu opinion
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu feedback es importante para nosotros
            </p>
          </header>

          <div className="rounded-xl border border-border bg-card p-6">
            <ReviewForm onSubmit={handleSubmit} revieweeName="Carlos Mendez" />
          </div>
        </div>
      </main>
    </div>
  )
}
