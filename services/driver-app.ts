/**
 * Llama a PUT /api/professionals/:id/rating en Driver App.
 * Si DRIVER_APP_URL no está configurada (Stage 1), loguea y retorna sin error
 * para no bloquear el flujo de la reseña.
 */
export async function updateProfessionalRating(
  professionalId: string,
  newAverageRating: number,
  totalReviews: number
): Promise<void> {
  const baseUrl = process.env.DRIVER_APP_URL

  if (!baseUrl) {
    console.log("[mock] Driver App — updateProfessionalRating", { //parte mockeada
      professionalId,
      newAverageRating,
      totalReviews,
    })
    return
  }

  const res = await fetch(
    `${baseUrl}/api/professionals/${professionalId}/rating`, //para cuando ya este la app para la etapa 3
    {
      method: "PUT",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.INTERNAL_API_SECRET}`,
      },
      body: JSON.stringify({
        new_average_rating: newAverageRating,
        total_reviews:      totalReviews,
      }),
    }
  )

  if (!res.ok) {
    // La reseña ya fue guardada — no revertimos, solo logueamos
    console.error("[Driver App] updateProfessionalRating falló", {
      status:          res.status,
      professionalId,
      newAverageRating,
      totalReviews,
    })
  }
}
