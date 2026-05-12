# 1.3 — Diseño de APIs Inter-Servicios

> **Tipo A — Plataforma de Transporte · FixNow**

Documentar cada endpoint que una app expone para ser consumido por otra app del sistema. Este contrato debe estar acordado por todos los integrantes antes de comenzar la Etapa 2.

Cada app expone los endpoints que otras apps necesitan consumir. **Ninguna app accede directamente a la base de datos de otra**: toda comunicación es vía HTTP REST con JSON.

Los valores entre corchetes como `[job_id]` son parámetros de ruta. Los campos marcados con `*` son obligatorios.

---

## Criterio de seguridad (consistente con 1.5 — Usuarios Compartidos)

Este documento describe integraciones entre apps (backend a backend), por lo tanto se aplican dos capas distintas de autenticación en el sistema:

1. Login de usuarios finales: cada app autentica con Clerk y usa JWT para su frontend y endpoints propios de usuario.
2. Integración inter-servicios: los endpoints listados aquí se protegen con `Authorization: Bearer <service-token>`.

En consecuencia, en este documento no se exige JWT de usuario final para consumir endpoints entre apps.

---

## Driver App — Endpoints expuestos

<!-- Documentar los endpoints que expone esta app -->
### 1. Recibir un nuevo Job y asignar profesional

**Descripción:** Rider App envía los datos del Job recién creado. Driver App ejecuta internamente la lógica de asignación: filtra sus profesionales por `service_type` coincidente, evalúa disponibilidad y proximidad, crea registros `JobAssignment` con status `pending` para los candidatos y los notifica. Devuelve la lista de candidatos a Rider App para que el cliente tenga feedback inmediato.

**Llamador:** Rider App → Driver App

```
POST /api/jobs
Authorization: Bearer <service-token>
```

**Request body:**
```json
{
  "job_id": "uuid*",
  "client_id": "clerk_user_id*",
  "service_type": "plomeria | electricidad | gas  *",
  "description": "string*",
  "location": {
    "lat": -38.7183,
    "lng": -62.2661
  },
  "urgency": "immediate | scheduled  *",
  "requested_date": "2026-05-10 | null",
  "scheduled_time": "14:30:00 | null",
  "estimated_price": 5000
}
```

> `requested_date` es obligatorio si `urgency` es `scheduled`. Para solicitudes inmediatas puede omitirse o enviarse `null`.

**Response 200:**
```json
{
  "candidates": [
    {
      "professional_id": "uuid",
      "full_name": "Carlos Gómez",
      "rating": 4.8,
      "distance_km": 1.2,
      "is_available": true
    }
  ],
  "total_notified": 3
}
```
**Response 401 Unauthorized:** Token de servicio invalido
**Response 404:** No se encontraron profesionales disponibles con ese `service_type` en el radio de búsqueda.
**Response 422 Unprocessable Entity:** Datos invalidos o faltantes (ej. falta `scheduled_time` en un pedido programado) 
---

### 2. Modificar la información de un Job

**Descrición:** Rider App actualiza la información de un Job existente, cuyo estado debe ser `pending`.

**Llamador:** Rider App → Driver App

```
PATCH /api/jobs/[job_id]
Authorization: Bearer <service-token>
```

**Request body:**
```json
{
  "description": "string",
  "location": {
    "lat": -38.7183,
    "lng": -62.2661
  },
  "urgency": "immediate | scheduled",
  "requested_date": "ISO8601 | null",
  "estimated_price": 6000
}
```

> `requested_date` es obligatorio si `urgency` es `scheduled`. Para solicitudes inmediatas puede omitirse o enviarse `null`.

**Response 200:**
```json
{
  "job_id": "uuid",
  "status": "updated",
  "updated_fields": ["description", "estimated_price"],
  "updated_at": "ISO8601"
}
```

**Response 400:** No se pudo modificar el Job porque no tenía estado `pending`.

### 3. Obtener el estado de asignación de un Job

**Descripción:** Rider App consulta si un profesional ya aceptó el Job y quién es. Se usa para actualizar la vista del cliente mientras espera confirmación.

**Llamador:** Rider App → Driver App

```
GET /api/jobs/[job_id]/assignment
Authorization: Bearer <service-token>
```

**Response 200:**
```json
{
  "job_id": "uuid",
  "status": "pending | accepted | in_progress | completed",
  "professional_id": "uuid | null",
  "full_name": "string | null",
  "accepted_at": "ISO8601 | null"
}
```

**Response 404:** No existe `JobAssignment` para ese `job_id`.

---

### 4. Actualizar el rating promedio de un profesional

**Descripción:** Feedback App llama a este endpoint cada vez que se registra una nueva reseña sobre un profesional. En Driver App persiste el nuevo rating promedio en el perfil del `Professional`.

**Llamador:** Feedback App → Driver App

```
PUT /api/professionals/[professional_id]/rating
Authorization: Bearer <service-token>
```

**Request body:**
```json
{
  "new_average_rating": 4.6,
  "total_reviews": 23
}
```

**Response 200:**
```json
{
  "professional_id": "uuid",
  "rating": 4.6,
  "total_reviews": 23,
  "updated_at": "ISO8601"
}
```
---

### 5. Notificar acreditación de un pago

**Descripción:** Payments App informa que el pago ha sido procesado exitosamente para que el profesional vea su ganancia reflejada.

**Llamador:** Payments App → Driver App

```
POST /api/jobs/[job_id]/payout-notification
Authorization: Bearer <service-token>
```

**Request body:**
```json
{ 
  "status": "paid*", 
  "amount": 7200, 
  "paid_at": "ISO8601" 
}
```

**Response 200:** Notificación recibida y procesada correctamente.
**Response 401 Unauthorized**
**Response 404:** El job no existe
**Response 500:** Error en la recepción; la Payments App debería reintentar la notificación

---

## Rider App — Endpoints expuestos

<!-- Documentar los endpoints que expone esta app -->
### 1. Obtener Jobs programados disponibles por categoría

**Descripción:** Driver App consulta este endpoint para mostrar a los profesionales los trabajos programados disponibles que coincidan con su especialidad y zona. Filtra por `service_type` y opcionalmente por proximidad geográfica.

**Llamador:** Driver App → Rider App

```
GET /api/jobs/available?service_type=electricidad&lat=-38.71&lng=-62.26
Authorization: Bearer <service-token>
```

**Query params:**

| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `service_type` | string | Sí | `plomeria`, `electricidad` o `gas` |
| `lat` | float | No | Latitud de la ubicación del profesional |
| `lng` | float | No | Longitud de la ubicación del profesional |
| `radius_km` | int | No | Radio de búsqueda (default: 20) |

**Response 200:**
```json
{
  "jobs": [
    {
      "job_id": "uuid",
      "service_type": "electricidad",
      "description": "Cambio de tablero eléctrico",
      "location": { "lat": -38.72, "lng": -62.27 },
      "requested_date": "2026-05-10T10:00:00Z",
      "urgency": "scheduled",
      "estimated_price": 8000,
      "distance_km": 3.4
    }
  ]
}
```
**Response 401 Unauthorized**
**Response 422 Unprocessable Entity:** Si falta `service_type`

---

### 2. Actualizar el estado y asignacion de un Job

**Descripción:** Driver App llama a este endpoint para notificarle a Rider App cuando un profesional acepta el Job y, si el pago se realiza en efectivo, cuando el trabajo es completado. Rider App actualiza su propia entidad `Job` con el nuevo estado y, en el caso de aceptación por parte de un profesional, guarda el `professional_id`.

**Llamador:** Driver App → Rider App

```
PATCH /api/jobs/[job_id]
Authorization: Bearer <service-token>
```

**Request body (al aceptar):**
```json
{
  "status": "accepted",
  "professional_id": "uuid"
}
```

**Request body (al completar):**
```json
{
  "status": "completed"
}
```

**Response 200:**
```json
{
  "job_id": "uuid",
  "status": "accepted | completed",
  "updated_at": "ISO8601"
}
```
**Response 401 Unauthorized**
**Response 404:** No existe un Job con ese `job_id`.

---

## Payments App — Endpoints expuestos

<!-- Documentar los endpoints que expone esta app -->
### 1. Registrar y procesar el pago de un Job

**Descripción:** Rider App llama a este endpoint cuando el usuario inicia el proceso de pago. Payments App crea el registro de `Payment`, inicia el cobro al cliente vía Mercado Pago y, al confirmarse, liquida al profesional descontando la comisión de la plataforma. Cuando finaliza el pago, notifica tanto a Rider App como a Driver App del cobro exitoso por el trabajo.

**Llamador:** Rider App → Payments App

```
POST /api/payments
Authorization: Bearer <service-token>
```

**Request body:**
```json
{
  "job_id": "uuid*",
  "client_id": "clerk_id*",
  "professional_id": "uuid*",
  "amount": 8000,
  "commission_rate": 0.10
}
```

> `commission_rate` es un porcentaje decimal. `commission = amount × commission_rate` se calcula en Payments App.

**Response 201:**
```json
{
  "payment_id": "uuid",
  "job_id": "uuid",
  "amount": 8000,
  "commission": 800,
  "status": "processing",
  "mp_payment_id": "string | null",
  "created_at": "ISO8601"
}
```
**Response 401 Unauthorized**
**Response 409:** Ya existe un pago para ese `job_id`.

---

### 2. Consultar el estado del pago de un Job

**Descripción:** Tanto Rider App (el cliente verifica su cobro) como Driver App (el profesional verifica su liquidación) pueden consultar este endpoint para conocer el estado del pago de un Job específico.

**Llamador:** Rider App → Payments App / Driver App → Payments App

```
GET /api/payments/jobs/[job_id]
Authorization: Bearer <service-token>
```

**Response 200:**
```json
{
  "payment_id": "uuid",
  "job_id": "uuid",
  "amount": 8000,
  "commission": 800,
  "status": "pending | processing | paid | failed",
  "paid_at": "ISO8601 | null"
}
```

**Response 404:** No existe un pago registrado para ese `job_id`.

---

## Feedback App — Endpoints expuestos

<!-- Documentar los endpoints que expone esta app -->
### 1. Registrar una reseña a un profesional

**Descripción:** Rider App llama a este endpoint para registrar la reseña del Cliente al profesional una vez que el Job tiene estado `completed`. Feedback App guarda la reseña y llama automáticamente al endpoint 3 de Driver App para actualizar el rating promedio del profesional.

**Llamador:** Rider App → Feedback App

```
POST /api/reviews/from-client
Authorization: Bearer <service-token>
```

**Request body:**
```json
{
  "job_id": "uuid*",
  "client_id": "clerk_user_id*",
  "professional_id": "clerk_user_id*",
  "rating": 5,
  "comment": "Muy puntual y prolijo el trabajo."
}
```

> `rating` debe ser un entero entre 1 y 5 inclusive.

**Response 201:** Reseña creada exitosamente.
```json
{
  "review_id": "uuid",
  "job_id": "uuid",
  "client_id": "clerk_user_id",
  "professional_id": "clerk_user_id",
  "rating": 5,
  "comment": "Muy puntual y prolijo el trabajo.",
  "created_at": "ISO8601"
}
```

**Response 409:** Ya existe una reseña de este `reviewer_id` para este `job_id`.
**Response 422 Unprocessable Entity:** (Rating fuera de rango 1-5)

---

### 2. Registrar una reseña a un cliente

**Descripción:** Driver App llama a este endpoint luego de que el Job sea marcado como `completed`.

**Llamador:** Driver App → Feedback App

```
POST /api/reviews/from-professional
Authorization: Bearer <service-token>
```

**Request body:**
```json
{
  "job_id": "uuid*",
  "professional_id": "clerk_user_id*",
  "client_id": "clerk_user_id*",
  "rating": 5,
  "comment": "Muy puntual y prolijo el trabajo."
}
```

> `rating` debe ser un entero entre 1 y 5 inclusive.

**Response 201:** Reseña creada correctamente.
```json
{
  "review_id": "uuid",
  "job_id": "uuid",
  "professional_id": "clerk_user_id",
  "client_id": "clerk_user_id",
  "rating": 5,
  "comment": "Muy puntual y prolijo el trabajo.",
  "created_at": "ISO8601"
}
```

**Response 409:** Ya existe una reseña de este `reviewer_id` para este `job_id`.

---

### 3. Consultar reseñas de un profesional

**Descripción:** Rider App llama a este endpoint para mostrarle al cliente el historial de calificaciones de un profesional, ya sea antes de confirmar una solicitud o como parte del detalle de un Job finalizado. Devuelve únicamente las reseñas donde `reviewee_type` es `professional`.

**Llamador:** Rider App → Feedback App

```
GET /api/reviews/professionals/[professional_id]
Authorization: Bearer <service-token>
```

**Query params opcionales:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `page` | int | Número de página (default: 1) |
| `limit` | int | Reseñas por página (default: 10) |

**Response 200:**
```json
{
  "professional_id": "uuid",
  "average_rating": 4.8,
  "total_reviews": 23,
  "reviews": [
    {
      "review_id": "uuid",
      "job_id": "uuid",
      "reviewer_id": "clerk_user_id",
      "rating": 5,
      "comment": "Muy puntual y prolijo el trabajo.",
      "created_at": "ISO8601"
    }
  ]
}
```

**Response 404:** No existen reseñas para ese `professional_id`.

---

### 4. Consultar reseñas de un cliente

**Descripción:** Driver App llama a este endpoint para que el profesional vea el historial de un cliente antes de aceptarlo.

**Llamador:** Driver App → Feedback App

```
GET /api/reviews/clients/[client_id]
Authorization: Bearer <service-token>
```

**Response 200:** 


---

<!-- Agregar secciones por cada integración adicional identificada -->

## Resumen de integraciones

| # | Llamador | Endpoint | Receptor | Cuándo |
|---|----------|----------|----------|--------|
| 1 | Rider App | `POST /api/jobs` | Driver App | Cliente solicita un servicio |
| 2 | Driver App | `PATCH /api/jobs/:job_id` | Rider App | Profesional acepta el Job |
| 3 | Driver App | `GET /api/jobs/available` | Rider App | Profesional abre trabajos programados |
| 4 | Driver App | `PATCH /api/jobs/:job_id` | Rider App | Profesional marca trabajo completado |
| 5 | Rider App | `POST /api/payments` | Payments App | Rider App recibe confirmación de Job completado |
| 6 | Rider App | `GET /api/payments/jobs/:job_id` | Payments App | Cliente consulta estado del pago |
| 7 | Driver App | `GET /api/payments/jobs/:job_id` | Payments App | Profesional verifica su liquidación |
| 8 | Rider App | `POST /api/reviews` | Feedback App | Cliente califica al profesional |
| 9 | Driver App | `POST /api/reviews` | Feedback App | Profesional califica al cliente |
| 10 | Rider App | `GET /api/reviews/professionals/:id` | Feedback App | Cliente consulta reseñas del profesional |
| 11 | Feedback App | `PUT /api/professionals/:id/rating` | Driver App | Nueva reseña sobre un profesional registrada |

---

## Autenticación entre servicios

Todos los endpoints listados en este documento son **endpoints inter-servicios**, no endpoints de usuario final. Se protegen mediante un `service-token` compartido (variable de entorno `INTERNAL_API_SECRET`) validado en el header `Authorization`. Este token no es el JWT de Clerk; es un secreto fijo acordado entre los integrantes durante la Etapa 1 y configurado como variable de entorno en cada deploy.

Los endpoints que el frontend de cada app consume directamente (paneles de admin, vistas de usuario) se protegen con el JWT de Clerk de forma habitual.

### Matriz de autorización por endpoint inter-servicios

* **Endpoint:** qué ruta se protege.
* **Llamador permitido:** qué app está autorizada a invocarlo. 
* **Mecanismo de autenticación:** en todos los casos, token interno de servicio (no JWT de usuario).
* **Regla minima de autorización:** validacion básica obligatoria ademas del token (por ejemplo, estado valido del job, rating entre 1 y 5, existencia de pago).

| Endpoint | Llamador permitido | Mecanismo de autenticación | Regla mínima de autorización |
| --- | --- | --- | --- |
| `POST /api/jobs` (Driver) | Rider App | Service token | Validar token interno y formato de `service_type` |
| `PATCH /api/jobs/[job_id]` (Driver) | Rider App | Service token | Validar token interno y que Job esté en estado editable |
| `GET /api/jobs/[job_id]/assignment` (Driver) | Rider App | Service token | Validar token interno |
| `PUT /api/professionals/[professional_id]/rating` (Driver) | Feedback App | Service token | Validar token interno y rango de rating |
| `POST /api/jobs/[job_id]/payout-notification` (Driver) | Payments App | Service token | Validar token interno y `status = paid` |
| `GET /api/jobs/available` (Rider) | Driver App | Service token | Validar token interno y `service_type` |
| `PATCH /api/jobs/[job_id]` (Rider) | Driver App | Service token | Validar token interno y transición de estado válida |
| `POST /api/payments` (Payments) | Rider App | Service token | Validar token interno y unicidad de `job_id` |
| `GET /api/payments/jobs/[job_id]` (Payments) | Rider App, Driver App | Service token | Validar token interno y existencia de pago |
| `POST /api/reviews/from-client` (Feedback) | Rider App | Service token | Validar token interno y rating entre 1 y 5 |
| `POST /api/reviews/from-professional` (Feedback) | Driver App | Service token | Validar token interno y rating entre 1 y 5 |
| `GET /api/reviews/professionals/[professional_id]` (Feedback) | Rider App | Service token | Validar token interno |
| `GET /api/reviews/clients/[client_id]` (Feedback) | Driver App | Service token | Validar token interno |
