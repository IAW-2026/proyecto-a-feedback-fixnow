# 1.5 — Usuarios Compartidos

> **Tipo A — Plataforma de Transporte**

El sistema utiliza **Clerk** como servicio centralizado de autenticación. Los usuarios se autentican a través de Clerk independientemente de qué app estén usando, y la identidad se propaga entre servicios mediante el token JWT emitido por Clerk.

---

## ¿Qué apps comparten usuarios?

| Usuario | Apps donde puede autenticarse |
| --- | --- |
| Cliente | Rider App, Feedback App (JWT), Payments App (JWT) |
| Profesional | Driver App, Feedback App (JWT), Payments App (JWT) |
| Admin | Rider App, Driver App, Payments App, Feedback App |

Un mismo usuario de Clerk puede acceder a múltiples aplicaciones, dependiendo de su rol dentro del sistema.

---

## Login por aplicación (Clerk)

Las 4 aplicaciones del ecosistema son webapps completas con su propio frontend desarrollado en Next.js. Todas tienen pantalla de login y delegan la sesión en Clerk. 

| App | Acceso de Usuario (Frontend con JWT) | Acceso de Servidor (API con Service-Token) |
| --- | --- | --- |
| Rider App | Clientes (para gestionar Jobs) y Admins. | Driver y Payments App (para actualizar estados). |
| Driver App | Profesionales (para aceptar Jobs) y Admins. | Rider, Payments y Feedback App (para notificaciones y rating). |
| Payments App | Clientes (para la pantalla de Checkout) y Admins (para historial de transacciones). | Rider App (para iniciar el proceso de cobro internamente). |
| Feedback App | Admins (para panel de moderación y reportes de reseñas). | Rider y Driver App (para enviar las nuevas reseñas). |

Flujo esperado en cada app:
1. El usuario se autentica con Clerk desde el frontend de la app.
2. El frontend envía el JWT en cada request autenticada (`Authorization: Bearer <token>`).
3. El backend valida firma/expiración del token y usa los claims para autorización.
4. Cada microservicio usa `sub` como identificador global de usuario compartido.

Nota: no se almacenan contraseñas locales en ninguna app; las credenciales viven únicamente en Clerk.

---

## Claims del JWT relevantes por app

| App | Claims utilizados | Para qué |
| --- | --- | --- |
| Rider App | `sub` (user ID), `role` | Identificar al cliente que crea y gestiona Jobs ,verificando que tenga el rol `client` |
| Driver App | `sub` (user ID), `role` | Identificar al profesional y verificar que tenga rol `professional` |
| Payments App | `sub` (user ID), `role` | Asociar pagos al cliente/profesional y restringir consultas según rol |
| Feedback App | `sub` (user ID), `role` | Verificar identidad del calificador y permisos de publicación/consulta |

## Estrategia de roles

Los roles se gestionan mediante metadata en Clerk, utilizando el campo:
```
{
  "publicMetadata": {
    "role": "client" | "professional" | "admin"
  }
}
```

### Roles definidos
- client: puede solicitar y seleccionar servicios
- professional: puede aceptar y realizar trabajos
- admin: puede acceder a funciones administrativas en todas las apps
