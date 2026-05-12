"use client"

import { useState } from "react"
import { StarRating } from "./star-rating"

interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment: string }) => void | Promise<void>
  isLoading?: boolean
  revieweeName?: string
}

export function ReviewForm({ onSubmit, isLoading = false, revieweeName }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (rating === 0) {
      setError("Por favor selecciona una calificacion")
      return
    }

    await onSubmit({ rating, comment })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          {revieweeName ? `Califica a ${revieweeName}` : "Calificacion"}
        </label>
        <div className="flex flex-col items-center gap-2 py-4">
          <StarRating value={rating} onChange={setRating} size="lg" />
          <span className="text-sm text-muted-foreground">
            {rating === 0 && "Selecciona una calificacion"}
            {rating === 1 && "Muy malo"}
            {rating === 2 && "Malo"}
            {rating === 3 && "Regular"}
            {rating === 4 && "Bueno"}
            {rating === 5 && "Excelente"}
          </span>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="space-y-3">
        <label htmlFor="comment" className="block text-sm font-medium text-foreground">
          Comentario (opcional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuentanos tu experiencia..."
          rows={4}
          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || rating === 0}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Enviando..." : "Enviar reseña"}
      </button>
    </form>
  )
}
