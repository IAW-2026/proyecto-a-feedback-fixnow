# 1.2 — Asignación de Responsabilidades

> **Tipo A — Plataforma de Transporte**

## Distribución de webapps

| App          | Responsable               | Repositorio                    |
| ------------ | ------------------------- | ------------------------------ |
| Driver App   | Lautaro Uzeltinger        | `proyecto-a-driver-fixnow`   |
| Rider App    | Catalina Simonovich       | `proyecto-a-rider-fixnow`    |
| Payments App | Chiara Monardez Di Notolo | `proyecto-a-payments-fixnow` |
| Feedback App | Jose Ignacio Ubici        | `proyecto-a-feedback-fixnow` |

---

## Datos propios de cada app

### Driver App
<!-- Entidades que viven en la base de datos de esta app -->
Gestiona el perfil de los profesionales y la lógica de asignación por categoría de servicio: cuando recibe una solicitud de Rider App, filtra sus propios profesionales por `service_type` coincidente, evalúa disponibilidad y proximidad, y notifica a los candidatos para que puedan aceptar o rechazar.
* **Professional:** Perfil del trabajador. Almacena datos técnicos, especialidad y su calificación promedio.
* **Availability:** Gestiona la agenda del profesional, permitiendo bloquear horarios o asignar turnos programados. 
* **JobAssignment:** Registra los trabajos aceptados por el profesional y su estado de ejecución.

| Entidad         | Atributos principales                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `Professional`  | `id` (Clerk user_id), `full_name`, `email`, `service_type`, `rating`, `current_location` (lat/lng), `radius_km`, `is_available`, `is_verified` |
| `Availability`  | `professional_id`, `date`, `start_time`, `end_time`, `is_blocked`, `job_id` (si está ocupado)                                            |
| `JobAssignment` | `job_id` (ref. Rider App), `professional_id`, `status` (`pending` / `accepted` / `in_progress` / `completed` / `cancelled`), `accepted_at`             |

> `job_id` es una **referencia externa**: Driver App no es dueña del Job, solo guarda el ID para asociar asignaciones y luego actualizar el estado en Rider App. Driver App no realizará validaciones activas de los `job_id` almacenados en Availability mediante llamadas a la API de Rider App por cada consulta. Se asume Consistencia Eventual: la Rider App es responsable de notificar a la Driver App vía Webhook si un Job es cancelado o modificado, para que la Driver App actualice su tabla de disponibilidad.

-

### Rider App
<!-- Entidades que viven en la base de datos de esta app -->
Gestiona a los clientes finales y es la dueña de las solicitudes.
* **Client:** Perfil del cliente. Almacena datos personales y preferencias de contacto.
* **Job:** Representa la solicitud del servicio, conteniendo la descripción, ubicación y estado del pedido.

| Entidad | Atributos principales |
|---------|----------------------|
| `Client` | `id`(Clerk), `full_name`, `email`, `dirección`, `is_verified` |
| `Job` | `id`, `client_id` (Clerk), `service_type` (`plomeria` / `electricidad` / `gas`), `description`, `location` (lat/lng), `requested_date`, `urgency` (`immediate` / `scheduled`), `status` (`pending` / `accepted` / `in_progress` / `completed` / `cancelled`), `professional_id` (ref. Driver App), `estimated_price`, `cancelled_at`, `cancellation_reason` |

> `professional_id` es una **referencia externa**: Rider App almacena el ID del profesional asignado para mostrárselo al cliente, pero la fuente de verdad de ese perfil vive en Driver App.

-

### Payments App

<!-- Entidades que viven en la base de datos de esta app -->
Gestiona el ciclo de cobro de los servicios finalizados a través de Mercado Pago.
* **Payment:** Registra la transacción financiera, vinculando el pedido con el pago realizado y la comisión de la plataforma.  

| Entidad | Atributos principales |
|---------|----------------------|
| `Payment` | `id`, `job_id` (ref. Rider App), `client_id` (Clerk), `professional_id` (ref. Driver App), `amount`, `commission`, `status` (`pending` / `processing` / `paid` / `failed`), `mp_payment_id`, `paid_at` |

> Payments App **no accede directamente** a la base de datos de Rider App ni de Driver App. Recibe los datos necesarios (`job_id`, `client_id`, `professional_id`, `amount`) a través de una llamada desde **Rider App** cuando el Job pasa a estado `completed`. Tanto Rider App (cliente revisa su cobro) como Driver App (profesional verifica su liquidación) pueden consultar el estado del pago mediante GET.

-

### Feedback App

<!-- Entidades que viven en la base de datos de esta app -->
Gestiona las evaluaciones mutuas entre los actores del sistema para garantizar la confianza.
* **Review:** Almacena la calificación y el comentario sobre un servicio específico 

| Entidad | Atributos principales |
|---------|----------------------|
| `Review` | `id`, `job_id` (ref. Rider App), `reviewer_id` (Clerk), `reviewee_id` (Clerk), `reviewee_type` (`professional` / `client`), `rating` (1–5), `comment` |

> Feedback App recibe reseñas desde dos orígenes: Rider App (cliente califica al profesional) y Driver App (profesional califica al cliente). A su vez, Rider App puede consultar el historial de reseñas de un profesional. Cuando se registra una reseña sobre un profesional, Feedback App actualiza automáticamente su rating en Driver App.

-

---

## Datos o acciones que requieren comunicación entre apps

| # | App origen | Acción / dato necesario | App destino | Endpoint involucrado | Cuándo ocurre |
|---|------------|------------------------|-------------|---------------------|---------------|
| 1 | Rider App | Notificar nuevo Job para que Driver App asigne profesional | Driver App | `POST /api/jobs` | Cliente solicita un servicio |
| 2 | Driver App | Notificar que un profesional aceptó el Job | Rider App | `PATCH /api/jobs/:job_id` | Profesional acepta la solicitud |
| 3 | Driver App | Consultar Jobs programados disponibles por categoría | Rider App | `GET /api/jobs/available` | Profesional abre la sección de trabajos programados |
| 4 | Rider App | Iniciar el pago una vez que el Job está completado | Payments App | `POST /api/payments` | Rider App recibe confirmación de Job completado |
| 5 | Payments App | Notificar que el pago fue completado | Rider App | `PATCH /api/jobs/...` | Se marca el trabajo como completado |
| 6 | Payments App | Notificar que el pago fue completado | Driver App | `PATCH /api/jobs/...` | Se notifica al profesional que el pago fue completado |
| 7 | Rider App | Consultar el estado del pago de un Job | Payments App | `GET /api/payments/jobs/:job_id` | Cliente revisa el detalle de su solicitud |
| 8 | Driver App | Consultar el estado de liquidación de un Job | Payments App | `GET /api/payments/jobs/:job_id` | Profesional consulta si recibió su pago |
| 9 | Rider App | Enviar reseña del cliente sobre el profesional | Feedback App | `POST /api/reviews` | Cliente califica al profesional post-servicio |
| 10 | Driver App | Enviar reseña del profesional sobre el cliente | Feedback App | `POST /api/reviews` | Profesional califica al cliente post-servicio |
| 11 | Rider App | Consultar reseñas de un profesional | Feedback App | `GET /api/reviews/professionals/:id` | Cliente ve el historial de calificaciones del profesional |
| 12 | Feedback App | Actualizar el rating promedio del profesional | Driver App | `PUT /api/professionals/:id/rating` | Se registra una nueva reseña sobre un profesional |
*¿Agregar cambio de contraseña/nombre de usuario?*