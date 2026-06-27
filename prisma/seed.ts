import 'dotenv/config'
import { RevieweeType, ReviewStatus, ModerationActor } from '@prisma/client'
import { db as prisma } from '../lib/db'

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Limpiar tablas en orden de FK
  await prisma.moderationLog.deleteMany()
  await prisma.review.deleteMany()
  await prisma.bannedWord.deleteMany()
  console.log('🗑️  Tablas limpiadas')

  // 2. Palabras prohibidas
  const bannedWords = ['estafa', 'fraude', 'horrible', 'robo']
  await prisma.bannedWord.createMany({
    data: bannedWords.map((word) => ({ word })),
  })
  console.log(`✅ ${bannedWords.length} palabras prohibidas creadas`)

  // 3. Reseñas de profesionales
  // Promedios verificados: sum(scores) / scores.length === target
  const professionalRatings = [
    { id: 'prof-julio',                        jobIdPrefix: 'job-julio',      target: 4.4, scores: [4, 5, 4, 5, 4] },              // 22/5  = 4.4
    { id: 'prof-camila',                       jobIdPrefix: 'job-camila',     target: 4.7, scores: [5, 5, 4, 5, 5, 5, 4, 5, 4, 5] }, // 47/10 = 4.7
    { id: 'prof-diego',                        jobIdPrefix: 'job-diego',      target: 4.5, scores: [4, 5, 4, 5] },                  // 18/4  = 4.5
    { id: 'prof-sofia',                        jobIdPrefix: 'job-sofia',      target: 4.9, scores: [5, 5, 5, 5, 5, 5, 5, 5, 5, 4] }, // 49/10 = 4.9
    { id: 'prof-nicolas',                      jobIdPrefix: 'job-nicolas',    target: 4.3, scores: [4, 5, 4, 4, 4, 5, 4, 4, 4, 5] }, // 43/10 = 4.3
    { id: 'prof-valeria',                      jobIdPrefix: 'job-valeria',    target: 4.8, scores: [5, 5, 5, 5, 4] },              // 24/5  = 4.8
    { id: 'prof-martin',                       jobIdPrefix: 'job-martin',     target: 4.2, scores: [4, 5, 4, 4, 4] },              // 21/5  = 4.2
    { id: 'user_3EYemLF8a3fUCHbCIE70ayra8nT', jobIdPrefix: 'job-lautaro-1',  target: 4.3, scores: [4, 5, 4, 4, 4, 5, 4, 4, 4, 5] }, // 43/10 = 4.3
    { id: 'user_3DxYRYVCndXOSf04E0kum8vfk5O', jobIdPrefix: 'job-lautaro-2',  target: 5.0, scores: [5, 5] },                       // 10/2  = 5.0
    { id: 'user_3EYqDmV4wSgR0Tjk0glP0k3C5a8', jobIdPrefix: 'job-catalina',   target: 4.3, scores: [4, 5, 4, 4, 4, 5, 4, 4, 4, 5] }, // 43/10 = 4.3
    { id: 'prof-ana',                          jobIdPrefix: 'job-ana',        target: 4.8, scores: [5, 5, 5, 5, 4] },              // 24/5  = 4.8
    { id: 'prof-luis',                         jobIdPrefix: 'job-luis',       target: 4.6, scores: [5, 4, 5, 4, 5] },              // 23/5  = 4.6
    { id: 'prof-maria',                        jobIdPrefix: 'job-maria',      target: 4.9, scores: [5, 5, 5, 5, 5, 5, 5, 5, 5, 4] }, // 49/10 = 4.9
  ]

  const reviewData = professionalRatings.flatMap((prof) =>
    prof.scores.map((score, i) => ({
      jobId:        `${prof.jobIdPrefix}-rev-${i}`,
      reviewerId:   `client-00${(i % 3) + 1}`,
      revieweeId:   prof.id,
      revieweeType: RevieweeType.professional,
      rating:       score,
      comment:      `Trabajo finalizado, puntaje de ${score}.`,
      status:       ReviewStatus.approved,
    }))
  )

  await prisma.review.createMany({ data: reviewData })
  console.log(`✅ ${reviewData.length} reseñas de profesionales creadas`)

  // 4. Reseña rechazada con log de moderación IA
  const rejectedReview = await prisma.review.create({
    data: {
      jobId:        'job-rejected-1',
      reviewerId:   'client-001',
      revieweeId:   'prof-julio',
      revieweeType: RevieweeType.professional,
      rating:       1,
      comment:      'Fue una estafa total, no lo recomiendo.',
      status:       ReviewStatus.rejected,
    },
  })

  await prisma.moderationLog.create({
    data: {
      reviewId:  rejectedReview.id,
      decision:  ReviewStatus.rejected,
      reason:    'Contiene palabra prohibida: estafa.',
      decidedBy: ModerationActor.ai,
    },
  })
  console.log('✅ Reseña rechazada con log de moderación IA creada')

  console.log('🌱 Seed finalizado.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {})
  })
