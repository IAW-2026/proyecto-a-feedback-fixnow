# Modelo de datos

## Rider App

```
enum ServiceType {
  PLOMERIA
  ELECTRICIDAD
  GAS
}

enum Status {
  ONLINE
  BUSY
  OFFLINE
}

enum JobStatus {
  PENDING
  ACCEPTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// -- MODELS --

model Professional {
  id          String       @id
  firstName   String       @map("first_name")
  lastName    String       @map("last_name")
  email       String       @unique
  phoneNumber String       @map("phone_number")
  serviceType ServiceType? @map("service_type")
  rating      Float        @default(-1.0)

  latitude  Float
  longitude Float

  radiusKm   Int     @map("radious_km")
  status     Status  @default(OFFLINE)
  isVerified Boolean @default(false) @map("is_verified")

  activeJobID String? @map("active_job_id")

  jobRequest JobRequest[] @relation("AssignedJobs")

  @@map("professionals")
}

model JobRequest {
  id       String @id @default(cuid())
  jobId    String @unique @map("job_id") // Client's original job_id
  clientId String @map("client_id")

  serviceType    ServiceType @map("service_type")
  description    String?
  latitude       Float
  longitude      Float
  estimatedPrice Float?      @map("estimated_price")

  status     JobStatus @default(PENDING)
  assignedTo String?   @map("assigned_to") // Professional ID when accepted

  // Optional: Link to Professional
  professional Professional? @relation("AssignedJobs", fields: [assignedTo], references: [id], onDelete: SetNull)

  @@index([serviceType, status])
  @@index([assignedTo])
  @@map("job_requests")
}
```
## Driver App

```
enum ServiceType {
  PLOMERIA
  ELECTRICIDAD
  GAS
}

enum Status {
  ONLINE
  BUSY
  OFFLINE
}

enum JobStatus {
  PENDING
  ACCEPTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// -- MODELS --

model Professional {
  id          String       @id
  firstName   String       @map("first_name")
  lastName    String       @map("last_name")
  email       String       @unique
  phoneNumber String       @map("phone_number")
  serviceType ServiceType? @map("service_type")
  rating      Float        @default(-1.0)

  latitude  Float
  longitude Float

  radiusKm   Int     @map("radious_km")
  status     Status  @default(OFFLINE)
  isVerified Boolean @default(false) @map("is_verified")

  activeJobID String? @map("active_job_id")

  jobRequest JobRequest[] @relation("AssignedJobs")

  @@map("professionals")
}

model JobRequest {
  id       String @id @default(cuid())
  jobId    String @unique @map("job_id") // Client's original job_id
  clientId String @map("client_id")

  serviceType    ServiceType @map("service_type")
  description    String?
  latitude       Float
  longitude      Float
  estimatedPrice Float?      @map("estimated_price")

  status     JobStatus @default(PENDING)
  assignedTo String?   @map("assigned_to") // Professional ID when accepted

  // Optional: Link to Professional
  professional Professional? @relation("AssignedJobs", fields: [assignedTo], references: [id], onDelete: SetNull)

  @@index([serviceType, status])
  @@index([assignedTo])
  @@map("job_requests")
}
```

## FeedBack App

```
model Review {
  id           String       @id @default(uuid())
  jobId        String
  reviewerId   String
  revieweeId   String
  revieweeType RevieweeType
  rating       Int
  comment      String?
  status       ReviewStatus @default(pending)
  createdAt    DateTime     @default(now())

  @@unique([reviewerId, jobId])
  @@map("reviews")
}

enum RevieweeType {
  professional
  client
}

enum ReviewStatus {
  pending
  approved
  rejected
}

model BannedWord {
  id        String   @id @default(uuid())
  word      String   @unique
  createdAt DateTime @default(now())

  @@map("banned_words")
}
```

## Analytics APP
```
schemaPrisma
model SnapshotKPI {
  id                   String   @id @default(cuid())
  fecha                DateTime @unique @db.Date
  totalUsuarios        Int
  totalClientes        Int
  totalProfesionales   Int
  volumenTransacciones Decimal  @db.Decimal(14, 2)
  ingresosNetos        Decimal  @db.Decimal(14, 2)
  pedidosCompletados   Int
  calificacionPromedio Float        //FeedbackApp
  totalReseñas         Int          //FeedbackApp
  creadoEn             DateTime @default(now())
}

model TrabajoResumen {
  id                String              @id @default(cuid())
  trabajoExternoId  String              @unique
  categoria         Categoria
  estado            EstadoTrabajo
  monto             Decimal?            @db.Decimal(12, 2)
  comisionFixNow    Decimal?            @db.Decimal(12, 2)
  calificacion      Float?             //FeedbackApp
  duracionMinutos   Int?
  fechaCreacion     DateTime
  fechaFinalizacion DateTime?
  ciudad            String?
  motivoCancelacion MotivoCancelacion?
}

model MotivoCancelacion {
  id               String         @id @default(cuid())
  motivo           String
  categoria        Categoria
  fecha            DateTime
  trabajoResumen   TrabajoResumen @relation(fields: [trabajoResumenId], references: [id])
  trabajoResumenId String         @unique
}

model MetricaMensual {
  id                  String     @id @default(cuid())
  anio                Int
  mes                 Int
  categoria           Categoria?
  trabajosCompletados Int
  trabajosCancelados  Int
  ingresosTotal       Decimal    @db.Decimal(14, 2)
  clientesNuevos      Int
  ticketPromedio      Decimal    @db.Decimal(12, 2)

  @@unique([anio, mes, categoria])
}

model ProfesionalResumen {
  id                   String    @id @default(cuid())
  profesionalExternoId String    @unique
  nombre               String
  categoria            Categoria
  ciudad               String
  calificacionPromedio Float     
  totalTrabajos        Int
  totalCancelaciones   Int
  ingresoGenerado      Decimal   @db.Decimal(14, 2)
  ultimaActividad      DateTime
  activo               Boolean   @default(true)
  actualizadoEn        DateTime  @updatedAt
}

model ConfigDashboard {
  id            String   @id @default(cuid())
  clave         String   @unique
  valor         String
  actualizadoEn DateTime @updatedAt
}
```