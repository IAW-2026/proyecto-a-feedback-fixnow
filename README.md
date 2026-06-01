[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Hxl9TssH)
# feedback

Aplicación **Feedback** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `fixnow`.

Esta app corresponde al módulo de reseñas y calificaciones en los proyectos de tipo **A (Transporte)**,

---
### 1- Link de Deploy de producción: <https://proyecto-a-feedback-fixnow.vercel.app>
---
### 2- Usuarios disponibles:
      user: admin+clerk_test@iaw.com
      password: iawuser#

      (respaldo)
      user: admin2+clerk_test@iaw.com
      password: iawuser#
---
### 3- Uso de la Aplicacion:
La aplicacion FixNow Feedback esta orientada al uso por parte de un usuario administrador, en donde puede moderar las reseñas entre usuarios y clientes provenientes de las apps de Driver y Rider.
Mas detalles sobre responsabilidades,modelo de datos y comunicación entre apps en  <https://github.com/IAW-2026/proyecto-a-etapa-1-fixnow/tree/main/docs>

*La ruta principal app/admin/:*
  - reviews/  (default despues de iniciar sesión): permite al moderador visualizar y filtrar todas las reseñas segun:
    - Estado (todas,pendientes,aprobadas,rechazadas)
    - Quien realizo la reseña (todos los tipos, cliente->profesional, profesional->cliente)
    - Antiguedad (mas reciente, mas antigua), rating (menor puntaje , mayor puntaje) y si contiene palabras prohibidas.
    
 Cuenta con armado de URL segun los parametros activos.    
 En cada tarjeta de reseña, el moderador puede aceptar o rechazar las mismas segun su criterio.

- banned-words/: Permite al moderador agregar y eliminar palabras que se consideran prohibidas, para facilitar el filtrado de las reseñas.

- stats/: Permite al moderador visualizar estadisticas relevantes como:
  - Cantidad de reseñas aprobadas y rechazadas, taza de aprobacion y cantidad de reseñas marcadas (con palabras prohibidas)
  - Graficos [via recharts] :distribucion de ratings (grafico de barras) y reseñas por semana (grafico XY)  
  - Cantidad de veces que aparecen las palabras prohibidas.   

---
### 4-Notas
#### Detalles sobre los endpoints:
  - Cuando se hace un POST (from-client / from-profesional): la validacion de formularios se hace con zod.Ademas al cargar en la base de datos, el estado por defecto es de "pendiente".
- Cuando se hace un GET  (client/professional): al armar el archivo json de respuesta se verifica si se cuenta con una palabra prohibida en el comentario y se censura automaticamente.  
- El PUT de actualizacion de rating que se hace  a DriveApp - /api/professionals/professionaid/rating esta mockeado, listo para implementar en la etapa 3.

#### Sobre palabras prohibidas
Se tomo en cuenta la opcion de agregar un estado flagged en el modelo de bd de Review, el problema viene de que al momento de agregar o cargar una palabra nueva, habria que hacer un backfill de toda la tabla, por eso se dejo que sort se haga en tiempo de consulta con las palabras existentes en BannedWord. 

---
### Stack y estructura de archivos
- Next.js (App Router) + React 19 + TypeScript 5.7 strict mode
- Tailwind CSS 
- Clerk v7 — usePathname, useAuth, UserButton, requireAdmin().
- Prisma v7 + @prisma/adapter-pg + pg Pool
- PostgreSQL vía Supabase
- Vercel para deploy

```
feedback-fixnow/
├── app/
│   ├── admin/
│   │   ├── layout.tsx                  # Guarda de ruta — requireAdmin()
│   │   ├── reviews/
│   │   │   ├── page.tsx                # Panel de moderación (filtros, sort)
│   │   │   └── actions.ts              # Server Actions: aprobar / rechazar
│   │   ├── banned-words/
│   │   │   ├── page.tsx                # CRUD palabras prohibidas
│   │   │   └── actions.ts              # Server Actions: agregar / eliminar
│   │   └── stats/
│   │       └── page.tsx                # Estadísticas y gráficos
│   ├── api/
│   │   └── reviews/
│   │       ├── from-client/route.ts        # POST — cliente reseña a profesional
│   │       ├── from-professional/route.ts  # POST — profesional reseña a cliente
│   │       ├── professionals/[id]/route.ts # GET — reseñas de un profesional
│   │       └── clients/[id]/route.ts   # GET — reseñas de un cliente
│   ├── sign-in/[[...sign-in]]/         # Página de login (Clerk)
│   ├── not-authorized/page.tsx
│   ├── page.tsx                        # Redirect a sign-in
│   ├── layout.tsx                      # Root layout (ClerkProvider, fuentes)
│   └── globals.css                     # Tokens de diseño (Tailwind v4)
│
├── components/
│   ├── admin-review-card.tsx           # Tarjeta de reseña con highlight
│   ├── filter-tab.tsx                  # Chip de filtro/sort (Link activo)
│   ├── stat-card.tsx                   # stats panel administracion
│   └── ...charts de stats y emptystates         
│
├── lib/
│   ├── db.ts                           # Cliente Prisma 
│   ├── clerk.ts                        # requireAdmin() — guard de sesión
│   ├── service-auth.ts                 # withServiceAuth() — guard de Bearer token
│   ├── word-filter.ts                  # acciones de highlight/censura sobre palabras prohibidas
│   ├── api-utils.ts                    # Helpers de respuesta HTTP
│   └── date-utils.ts                   # Formateo de fechas
│
├── services/
│   └── driver-app.ts                   # Mock de la app driver para actualizar rating
│
├── prisma/
│   └── schema.prisma                   # Modelos: Review, BannedWord
│
└──  proxy.ts                            # Middleware Clerk (Next.js 16+)
```

      
