# CLAUDE.md

Guía de contexto para Claude Code al trabajar en este repositorio.

## Comandos

```bash
pnpm dev                        # Servidor de desarrollo
pnpm build                      # Build de producción (corre prisma generate primero)
pnpm lint                       # ESLint
pnpm exec prisma db push        # Aplicar cambios del schema sin migración
pnpm exec prisma migrate dev    # Crear y aplicar migración
pnpm exec prisma db seed        # Seedear la DB con datos de prueba
pnpm exec tsc --noEmit          # Verificar tipos sin compilar
```

## Contexto del proyecto

**Feedback App** es uno de cuatro microservicios del proyecto universitario FixNow.
Las cuatro apps son: Rider App, Driver App, Payments App, Feedback App.

**Ninguna app accede directamente a la DB de otra** — toda comunicación cross-app es vía HTTP REST con JSON, autenticada con un service token compartido (`Authorization: Bearer <service-token>`, variable `INTERNAL_API_SECRET`).

**En esta etapa**, las llamadas salientes hacia otras apps (ej: actualizar rating en Driver App) deben mockearse o simularse — no existen realmente.

## Responsabilidades de esta app

- Recibe reseñas de Rider App (cliente califica profesional) y Driver App (profesional califica cliente)
- Expone historial de reseñas consumido por Rider y Driver apps
- Tras guardar una reseña sobre un profesional, **debería** llamar a Driver App para actualizar su rating promedio (pendiente de implementación real)

### Endpoints que expone esta app

```
POST /api/reviews/from-client          # Llamado por Rider App
POST /api/reviews/from-professional    # Llamado por Driver App
GET  /api/reviews/professionals/[id]   # Llamado por Rider App
GET  /api/reviews/clients/[id]         # Llamado por Driver App
```

Todos protegidos con `withServiceAuth()` — no usan Clerk JWT.

### Llamada saliente

```
PUT /api/professionals/[id]/rating    # Esta app → Driver App (mockeable en Stage 1)
```

## Modelo de datos actual

```prisma
model Review {
  id           String       @id @default(uuid())
  jobId        String
  reviewerId   String
  revieweeId   String
  revieweeType RevieweeType  // professional | client
  rating       Int           // 1–5
  comment      String?
  createdAt    DateTime      @default(now())

  @@unique([reviewerId, jobId])  // una reseña por usuario por trabajo
}
```

Reglas de negocio:
- Una reseña por `reviewerId` + `jobId` (409 si duplicado)
- `rating` entero entre 1 y 5
- Las reseñas se crean solo cuando el Job está en estado `completed`

### Cambio planeado — moderación de reseñas

Agregar campo `status` con enum `ReviewStatus`:

```prisma
enum ReviewStatus {
  pending    // recién creada, en cola de moderación
  approved   // aprobada por el admin, visible en las otras apps
  rejected   // rechazada, no se expone
}
```

- Las APIs de lectura (`/professionals/[id]`, `/clients/[id]`) filtrarán `status: "approved"`
- El panel admin tendrá acciones Aprobar / Rechazar por reseña
- Al crear una reseña, el default es `pending`

## Autenticación

Dos capas separadas:

1. **Frontend (admin):** Clerk v7 — `requireAdmin()` en `app/admin/layout.tsx`
2. **APIs inter-servicio:** `INTERNAL_API_SECRET` — validado en `withServiceAuth()` de `lib/service-auth.ts`

`INTERNAL_API_SECRET` actual: `"supersecretkey"` — coordinar valor definitivo con el equipo antes de producción. Agregar también en variables de entorno de Vercel.

## Stack técnico

- **Next.js** (App Router) + **React 19** + **TypeScript 5.7 strict mode**
- **Tailwind CSS v4** — sin `tailwind.config.js`, usa `globals.css` con `@theme inline`. Variante de supports: `supports-backdrop-filter:`, no `supports-[...]:`
- **shadcn/ui** (Radix UI) — componentes en `components/ui/`
- **Clerk v7** — `usePathname`, `useAuth`, `UserButton`, `requireAdmin()`. No usar `afterSignOutUrl` en `UserButton` (prop inválido en v7)
- **Prisma v7** + `@prisma/adapter-pg` + `pg` Pool
  - Config en `prisma.config.ts` (no en `package.json`)
  - Sin `url` en `schema.prisma` — la datasource la maneja `prisma.config.ts`
  - Seed: `migrations.seed = "tsx prisma/seed.ts"` en `prisma.config.ts`
- **PostgreSQL** vía Supabase — pooler para runtime, URL directa para migraciones
- **Vercel** para deploy — el build script es `prisma generate && next build`

## Estructura de archivos clave

```
app/
  admin/
    layout.tsx              # requireAdmin() — protege todo /admin
    reviews/page.tsx        # Panel de moderación con stats, filtros y cards
  api/reviews/
    from-client/route.ts
    from-professional/route.ts
    professionals/[id]/route.ts
    clients/[id]/route.ts
  sign-in/[[...sign-in]]/page.tsx   # Stats dinámicas desde DB en panel izquierdo
  page.tsx                  # Homepage pública (mínima)

components/
  header.tsx                # Nav con active indicator via usePathname()
  admin-review-card.tsx     # Card de reseña para el panel admin
  star-rating.tsx           # Reutilizado por admin-review-card

lib/
  db.ts                     # PrismaClient con Pool adapter
  clerk.ts                  # requireAdmin(), helpers de Clerk
  service-auth.ts           # withServiceAuth() wrapper para APIs inter-servicio
  api-utils.ts              # parsePagination()
  date-utils.ts             # formatDateRelative(), formatDateFull()
  utils.ts                  # cn() de shadcn

prisma/
  schema.prisma
  seed.ts                   # 15 reseñas de prueba (9 prof + 6 client)
```

## Convenciones de UI

- **Idioma:** español con tildes correctas (ó, é, á, í, ú, ¿, ¡)
- **Tipografía:** `font-display` (Space Grotesk) para títulos, `font-sans` (Inter) para cuerpo
- **Colores de marca:** `#031D44` (navy oscuro), `#04395E` (navy medio), `#DAB785` (dorado)
- Tokens de color vía variables CSS en formato `oklch` en `globals.css` — no hardcodear colores fuera de clases Tailwind
- Animaciones de entrada: `animate-in fade-in slide-in-from-bottom-2 duration-300` + `animationDelay` escalonado (de `tw-animate-css`, ya instalado)
- `StarRating`: prop `readonly` para solo lectura (renderiza `<span>`, no `<button>`)

## Ramas git

- `main` — producción / deploy en Vercel (sincronizada con `features`)
- `features` — rama de desarrollo principal, base para PRs
- `features-simulador` — página `/admin/simulate` para probar APIs sin otras apps (pendiente decidir si se integra)

## Estado actual

La app está completamente funcional con DB real:
- APIs inter-servicio operativas y protegidas
- Panel admin con stats, filtros, animaciones y empty state
- Autenticación Clerk funcionando
- Seed de 15 reseñas de prueba en Supabase

**Próximo paso planeado:** implementar sistema de moderación con `status` en el modelo `Review` (pending → approved/rejected desde el panel admin).
