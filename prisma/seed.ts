import { db } from "../lib/db"

async function main() {
  // Limpiar tabla primero para que sea idempotente
  await db.review.deleteMany()
  console.log("🗑️  Tabla limpiada")

  await db.review.createMany({
    data: [
      // --- Reseñas de clientes sobre profesionales ---
      {
        id: "a1b2c3d4-0001-0001-0001-000000000001",
        jobId: "job-f1a2b3c4-0001-0001-0001-000000000001",
        reviewerId: "usr_client_001",
        revieweeId: "usr_prof_001",
        revieweeType: "professional",
        rating: 5,
        comment: "Excelente trabajo, llegó a horario y resolvió el problema en minutos. Lo recomiendo totalmente.",
        createdAt: new Date("2025-04-01T10:30:00Z"),
      },
      {
        id: "a1b2c3d4-0002-0002-0002-000000000002",
        jobId: "job-f1a2b3c4-0002-0002-0002-000000000002",
        reviewerId: "usr_client_002",
        revieweeId: "usr_prof_002",
        revieweeType: "professional",
        rating: 4,
        comment: "Muy buen servicio, prolijo y puntual. Le daría 5 estrellas pero tardó un poco más de lo estimado.",
        createdAt: new Date("2025-04-03T14:00:00Z"),
      },
      {
        id: "a1b2c3d4-0003-0003-0003-000000000003",
        jobId: "job-f1a2b3c4-0003-0003-0003-000000000003",
        reviewerId: "usr_client_003",
        revieweeId: "usr_prof_003",
        revieweeType: "professional",
        rating: 2,
        comment: "El trabajo quedó a medias, tuve que llamar a otro profesional para que lo termine. Mala experiencia.",
        createdAt: new Date("2025-04-05T09:15:00Z"),
      },
      {
        id: "a1b2c3d4-0004-0004-0004-000000000004",
        jobId: "job-f1a2b3c4-0004-0004-0004-000000000004",
        reviewerId: "usr_client_004",
        revieweeId: "usr_prof_001",
        revieweeType: "professional",
        rating: 5,
        comment: "Segunda vez que lo contrato y siempre cumple. Muy profesional.",
        createdAt: new Date("2025-04-08T11:00:00Z"),
      },
      {
        id: "a1b2c3d4-0005-0005-0005-000000000005",
        jobId: "job-f1a2b3c4-0005-0005-0005-000000000005",
        reviewerId: "usr_client_005",
        revieweeId: "usr_prof_004",
        revieweeType: "professional",
        rating: 3,
        comment: "El servicio estuvo bien pero el precio final fue mayor al presupuestado.",
        createdAt: new Date("2025-04-10T16:30:00Z"),
      },
      {
        id: "a1b2c3d4-0006-0006-0006-000000000006",
        jobId: "job-f1a2b3c4-0006-0006-0006-000000000006",
        reviewerId: "usr_client_006",
        revieweeId: "usr_prof_005",
        revieweeType: "professional",
        rating: 5,
        comment: null,
        createdAt: new Date("2025-04-12T08:45:00Z"),
      },
      {
        id: "a1b2c3d4-0007-0007-0007-000000000007",
        jobId: "job-f1a2b3c4-0007-0007-0007-000000000007",
        reviewerId: "usr_client_007",
        revieweeId: "usr_prof_002",
        revieweeType: "professional",
        rating: 1,
        comment: "No se presentó en el horario acordado y no avisó. Pésima atención.",
        createdAt: new Date("2025-04-15T13:20:00Z"),
      },
      {
        id: "a1b2c3d4-0008-0008-0008-000000000008",
        jobId: "job-f1a2b3c4-0008-0008-0008-000000000008",
        reviewerId: "usr_client_008",
        revieweeId: "usr_prof_006",
        revieweeType: "professional",
        rating: 4,
        comment: "Muy atento y rápido. El trabajo quedó impecable.",
        createdAt: new Date("2025-04-18T10:00:00Z"),
      },
      {
        id: "a1b2c3d4-0009-0009-0009-000000000009",
        jobId: "job-f1a2b3c4-0009-0009-0009-000000000009",
        reviewerId: "usr_client_009",
        revieweeId: "usr_prof_007",
        revieweeType: "professional",
        rating: 5,
        comment: "Terminó antes de lo esperado y explicó todo lo que hizo. 10/10.",
        createdAt: new Date("2025-04-20T15:10:00Z"),
      },

      // --- Reseñas de profesionales sobre clientes ---
      {
        id: "a1b2c3d4-0010-0010-0010-000000000010",
        jobId: "job-f1a2b3c4-0001-0001-0001-000000000001",
        reviewerId: "usr_prof_001",
        revieweeId: "usr_client_001",
        revieweeType: "client",
        rating: 5,
        comment: "Cliente muy amable, explicó el problema con claridad y el lugar de trabajo estaba ordenado.",
        createdAt: new Date("2025-04-01T12:00:00Z"),
      },
      {
        id: "a1b2c3d4-0011-0011-0011-000000000011",
        jobId: "job-f1a2b3c4-0002-0002-0002-000000000002",
        reviewerId: "usr_prof_002",
        revieweeId: "usr_client_002",
        revieweeType: "client",
        rating: 4,
        comment: "Buen cliente, aunque costó un poco acordar el horario al principio.",
        createdAt: new Date("2025-04-03T16:30:00Z"),
      },
      {
        id: "a1b2c3d4-0012-0012-0012-000000000012",
        jobId: "job-f1a2b3c4-0003-0003-0003-000000000003",
        reviewerId: "usr_prof_003",
        revieweeId: "usr_client_003",
        revieweeType: "client",
        rating: 2,
        comment: "El cliente cambió los requerimientos a mitad del trabajo sin respetar el presupuesto acordado.",
        createdAt: new Date("2025-04-05T11:00:00Z"),
      },
      {
        id: "a1b2c3d4-0013-0013-0013-000000000013",
        jobId: "job-f1a2b3c4-0005-0005-0005-000000000005",
        reviewerId: "usr_prof_004",
        revieweeId: "usr_client_005",
        revieweeType: "client",
        rating: 5,
        comment: null,
        createdAt: new Date("2025-04-10T18:00:00Z"),
      },
      {
        id: "a1b2c3d4-0014-0014-0014-000000000014",
        jobId: "job-f1a2b3c4-0008-0008-0008-000000000008",
        reviewerId: "usr_prof_006",
        revieweeId: "usr_client_008",
        revieweeType: "client",
        rating: 5,
        comment: "Excelente cliente, muy puntual y cordial. Con gusto volvería a trabajar con él.",
        createdAt: new Date("2025-04-18T12:30:00Z"),
      },
      {
        id: "a1b2c3d4-0015-0015-0015-000000000015",
        jobId: "job-f1a2b3c4-0009-0009-0009-000000000009",
        reviewerId: "usr_prof_007",
        revieweeId: "usr_client_009",
        revieweeType: "client",
        rating: 4,
        comment: "Cliente tranquilo y fácil de tratar. El acceso al lugar fue sencillo.",
        createdAt: new Date("2025-04-20T17:00:00Z"),
      },
    ],
  })

  console.log("✅ Seed completado — 15 reviews insertadas")
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
    process.exit()
  })
