// TODO Etapa 3: reemplazar el mock por la llamada real a Driver App
export async function updateProfessionalRating(
  professionalId: string,
  newAverageRating: number,
  totalReviews: number
): Promise<void> {
  // Simula la llamada a PUT /api/professionals/:id/rating en Driver App
  await new Promise((resolve) => setTimeout(resolve, 100))
  console.log("[mock] Driver App — updateProfessionalRating", {
    professionalId,
    newAverageRating,
    totalReviews,
  })
}
