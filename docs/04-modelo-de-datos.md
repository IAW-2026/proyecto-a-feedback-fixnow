# 1.4 — Modelo de Datos por Aplicación

> **Tipo A — Plataforma de Transporte**

## Datos de autenticación (login) compartidos

Todas las aplicaciones realizan login mediante Clerk. A nivel de modelo de datos, cada app persiste solo la referencia al usuario autenticado y datos de perfil necesarios para su dominio.

| App | Login | Datos de autenticación usados | Datos de credenciales almacenados localmente |
| --- | --- | --- | --- |
| Rider App | Clerk | `sub` (user_id), `role`, `email` | Ninguno |
| Driver App | Clerk | `sub` (user_id), `role`, `email` | Ninguno |
| Payments App | Clerk | `sub` (user_id), `role` | Ninguno |
| Feedback App | Clerk | `sub` (user_id), `role` | Ninguno |

Nota: las contraseñas y recuperación de cuenta son gestionadas exclusivamente por Clerk.

## Driver App

### Entidades principales
**Professional**
- `id`: UUID (Primary Key - coincide con el user_id de Clerk)
- `full_name`: String
- `email`: String
- `service_type`: Enum(`plomeria`, `electricidad`, `gas`)
- `rating`: Float
- `current_location`: Point(lat/lng)
- `radius_km`: Integer (radio de cobertura)
- `is_available`: Boolean
- `is_verified`: Boolean

**Availability**
- `id`: UUID
- `professional_id`: UUID (FK a Professional)
- `date`: Date
- `start_time`: Time
- `end_time`: Time
- `is_blocked`: Boolean
- `job_id`: UUID (referencia externa a Rider App, opcional si el bloque corresponde a un trabajo)

> El campo `job_id` en la entidad `Availability` se establece y escribe **automáticamente** por la Driver App en el momento en que el profesional acepta una solicitud programada. No se requiere ni se espera confirmación externa de la Rider App para realizar este registro local, ya que la Driver App es la única dueña y responsable de manejar la agenda de sus profesionales.

**JobAssignment**
- `id`: UUID
- `job_id`: UUID (Referencia externa a Rider App)
- `professional_id`: UUID (FK a Professional)
- `status`: Enum(`pending`, `accepted`, `in_progress`, `completed`, `cancelled`)
- `accepted_at`: Timestamp

## Rider App

### Entidades principales

**Client**
- `id`: UUID (Primary Key - coincide con el `user_id` de Clerk)
- `full_name`: String
- `email`: String
- `direccion`: String
- `is_verified`: Boolean

**Job (Solicitud de servicio)**
- `id`: UUID
- `client_id`: UUID (Clerk)
- `service_type`: Enum(`plomeria`, `electricidad`, `gas`)
- `description`: String
- `location`: Point(lat/lng)
- `requested_date`: Date
- `urgency`: Enum(`immediate`, `scheduled`)
- `status`: Enum(`pending`, `accepted`, `in_progress`, `completed`, `cancelled`)
- `professional_id`: UUID (referencia externa a Driver App)
- `estimated_price`: Decimal
- `cancelled_at`: Timestamp 
- `cancellation_reason`: String/Text

## Payments App

### Entidades principales

**Payment**
- `id`: UUID
- `job_id`: UUID (referencia externa a Rider App)
- `client_id`: UUID (Clerk)
- `professional_id`: UUID (referencia externa a Driver App)
- `amount`: Decimal
- `commission`: Decimal
- `status`: Enum(`pending`, `processing`, `paid`, `failed`)
- `mp_payment_id`: String
- `paid_at`: Timestamp

## Feedback App

### Entidades principales

**Review**
- `id`: UUID
- `job_id`: UUID (referencia externa a Rider App)
- `reviewer_id`: UUID (Clerk)
- `reviewee_id`: UUID (Clerk)
- `reviewee_type`: Enum(`professional`, `client`)
- `rating`: Integer (1-5)
- `comment`: String


## Datos duplicados y estrategia de consistencia

| Dato duplicado | Apps que lo tienen | Fuente de verdad | Estrategia |
| --- | --- | --- | --- |
| `user_id` (Clerk) | Todas | Clerk | Se utiliza el mismo identificador en todas las apps. |
| `job_id` | Driver, Payments, Feedback (y dueño en Rider) | Rider App | Rider App es dueña del Job y el resto referencia ese id. |
| `professional_id` | Driver, Rider, Payments | Driver App | Se usa como referencia para asignación y pagos. |
| `service_type` | Rider, Driver | Definido compartido | Se mantiene una lista común de valores permitidos. |
