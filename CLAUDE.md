# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

## Project context

This is **Feedback App**, one of four microservices in the FixNow platform (Type Transport). The four apps are:

- Rider App
- Driver App
- Payments App
- Feedback App

**No app accesses another app's database directly** — all cross-app communication is via HTTP REST with JSON, authenticated via a shared `INTERNAL_API_SECRET` service token (`Authorization: Bearer <service-token>`).

**Calls to APIs from other web apps must be mocked or simulated during this stage.**


## Feedback App responsibilities

- Receives reviews from **Rider App** (client rates professional) and **Driver App** (professional rates client)
- Exposes review history endpoints consumed by Rider and Driver apps
- After saving a review about a professional, **must call Driver App** to update that professional's average rating

### Endpoints this app exposes

```
POST /api/reviews/from-client          # Called by Rider App
POST /api/reviews/from-professional    # Called by Driver App
GET  /api/reviews/professionals/[id]   # Called by Rider App
GET  /api/reviews/clients/[id]         # Called by Driver App
```

All these endpoints are inter-service and protected with service token, not Clerk JWT.

### Outgoing call this app makes

```
PUT /api/professionals/[professional_id]/rating   # Called by this app → Driver App
```

## Data model

**Review** (owned by this app)
- `id`: UUID
- `job_id`: UUID (external ref to Rider App)
- `reviewer_id`: UUID (Clerk user_id)
- `reviewee_id`: UUID (Clerk user_id)
- `reviewee_type`: `professional` | `client`
- `rating`: Integer 1–5
- `comment`: String

Business rules:
- One review per `reviewer_id` per `job_id` (409 if duplicate)
- `rating` must be integer between 1 and 5 inclusive
- Reviews are only created when the Job status is `completed`

## Authentication

Two separate auth layers:
1. **End users (frontend):** Clerk JWT — `Authorization: Bearer <clerk_jwt>`. Admins only for this app's own frontend (moderation panel).
2. **Inter-service (API routes):** `INTERNAL_API_SECRET` env var — validated in `Authorization: Bearer <service-token>` header.

Clerk JWT claims used: `sub` (maps to `reviewer_id`/`reviewee_id`), `role` (`client` | `professional` | `admin`).

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5.7** **Use Typescript in strict mode**
- **Tailwind CSS v4** — uses `@tailwindcss/postcss`, no `tailwind.config.js`
- **shadcn/ui** (Radix UI) — components are in `components/ui/`, pre-installed and ready to use
- **React Hook Form** + **Zod** for form validation
- **Clerk** for authentication (not yet integrated — pending Stage 2)
- **Vercel** for deployment
- **ORM**: Prisma + PostgreSQL
- **SupaBase** BaaS

## Current state (Stage 1 — UI/UX)

All data is mocked. There is no database or real API yet. Mock data lives directly in page components. The app is deployed individually on Vercel with hardcoded demo data to demonstrate the UI before Stage 2 integration.

Key mock locations:
- `app/reviews/history/page.tsx` — `mockProfessionalReviews`, `mockClientReviews`
- `app/reviews/new/page.tsx` — hardcoded `revieweeName="Carlos Mendez"`

When implementing Stage 2, each `POST /api/reviews/*` route must end by calling Driver App's rating endpoint. The `job_id`, `reviewer_id`, and `reviewee_id` will come from Clerk session + query params, not from the form.

## UI conventions

- Spanish language throughout — use proper accents (ó, é, á, í, ú, ¿, ¡)
- `font-display` (Space Grotesk) for headings, `font-sans` (Inter) for body
- Color tokens via CSS variables in `oklch` format — never hardcode colors outside of Tailwind utility classes
- Star colors use `fill-star` / `fill-star-empty` custom tokens defined in `globals.css`
- `StarRating` component: use `readonly` prop for display-only, which renders `<span>` elements instead of `<button>`
