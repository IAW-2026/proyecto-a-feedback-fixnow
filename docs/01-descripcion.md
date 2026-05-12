# 1.1 — Descripción del Sistema

> **Tipo A — Plataforma de Transporte**

## ¿Qué problema resuelve?

Cuando una persona necesita un servicio como plomería, electricidad o gas, suele tener dificultades para encontrar a alguien disponible, saber si es confiable y coordinar el trabajo. Además, el pago y la calificación del servicio generalmente se manejan por fuera de un sistema.

FixNow busca resolver esto conectando clientes con profesionales de forma rápida. El cliente puede solicitar un servicio, el sistema muestra opciones disponibles y, una vez realizado el trabajo, se gestiona el pago y la calificación dentro de la plataforma.

También permite pedir servicios inmediatos o programarlos para otro momento.

## Actores del sistema

| Actor       | Descripción                                         | Apps donde interactúa                  |
|-------------|-----------------------------------------------------|----------------------------------------|
| Cliente     | Solicita servicios para el hogar                    | Rider App, Payments App, Feedback App  |
| Profesional | Realiza los servicios (plomero, electricista, gasista) | Driver App, Payments App, Feedback App |

## Flujo principal de uso

**Flujo Inmediato (Punta a Punta)**
1. **Login:** El cliente inicia sesión en la Rider App (vía Clerk).
2. **Creación:** El cliente solicita un servicio. Se genera el `Job` con estado `pending`.
3. **Matching:** Rider App notifica a Driver App, que muestra la solicitud a los profesionales disponibles.
4. **Asignación:** Un profesional (logueado en Driver App) acepta el pedido. La Rider App actualiza el `Job` a `accepted`.
5. **Ejecución:** Se realiza el trabajo. Driver App notifica a Rider App y el `Job` pasa a `completed`.
6. **Cobro:** El cliente es redirigido a Payments App (mantiene sesión de Clerk), donde procesa el pago.
7. **Feedback:** El cliente y el profesional ingresan a la Feedback App para calificarse mutuamente.

**Flujo Modificar**
1. El cliente inicia sesión en Rider App y visualiza un `Job` en estado `pending`.
2. Modifica la descripción o dirección. Rider App actualiza la base de datos y notifica los cambios a Driver App. 
*(Nota: Si el Job ya está en estado `accepted` o `in_progress`, no se puede modificar; debe ser cancelado).*

**Flujo Intermedio (Programado)**
1. El cliente crea un `Job` para una fecha y hora futura (estado `pending`).
2. Los profesionales revisan los trabajos programados en la Driver App.
3. Alguien lo acepta (pasa a `accepted`). Llegado el día, se ejecuta el Flujo Inmediato desde el paso 5.

**Flujo Alternativo: Sin Profesionales Disponibles (No Match)**
1. El cliente solicita un servicio inmediato desde Rider App (estado `pending`).
2. Driver App busca profesionales en el radio especificado, pero no hay ninguno disponible o todos rechazan la solicitud.
3. Driver App notifica a Rider App que no hay candidatos.
4. Rider App informa al cliente y el `Job` pasa a estado `cancelled`. El cliente deberá crear una nueva solicitud más tarde si lo desea.

**Flujo Alternativo: Cancelación por parte del Profesional**
1. Un profesional ya había aceptado un pedido (estado `accepted`) pero tiene un imprevisto.
2. El profesional cancela el trabajo desde la Driver App.
3. Driver App actualiza su `JobAssignment` a `cancelled` y notifica a Rider App.
4. Rider App cambia el estado del `Job` a `cancelled` y le notifica al cliente que el trabajador canceló la visita.
5. El flujo termina allí. El cliente está obligado a crear un `Job` completamente nuevo para volver a solicitar el servicio.