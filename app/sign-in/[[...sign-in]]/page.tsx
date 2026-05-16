import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">

      {/* Panel izquierdo — branding */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-10"
        style={{ background: "linear-gradient(160deg, #031D44 0%, #04395E 100%)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="FixNow" className="h-10 w-10 rounded-lg" />
          <div>
            <p className="text-lg font-bold text-white leading-none">FixNow</p>
            <p className="text-xs" style={{ color: "#DAB785" }}>Panel de Administración</p>
          </div>
        </div>

        {/* Centro — copy */}
        <div>
          <h1
            className="text-4xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Gestión de<br />
            <span style={{ color: "#DAB785" }}>Reseñas</span>
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#93afc7" }}>
            Supervisá y moderá las calificaciones entre clientes
            y profesionales de la plataforma FixNow.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Reseñas totales", value: "1.240" },
              { label: "Promedio general", value: "4.7 ★" },
              { label: "Profesionales", value: "318" },
              { label: "Pendientes", value: "12" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p className="text-2xl font-bold" style={{ color: "#DAB785" }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: "#93afc7" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "#4a6a85" }}>
          © 2026 FixNow. Todos los derechos reservados.
        </p>
      </div>

      {/* Panel derecho — formulario Clerk */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-6 py-12"
        style={{ background: "#f8f9fb" }}
      >
        {/* Logo mobile */}
        <div className="flex lg:hidden items-center gap-3 mb-10">
          <img src="/logo.png" alt="FixNow" className="h-9 w-9 rounded-lg" />
          <div>
            <p className="text-base font-bold leading-none" style={{ color: "#031D44" }}>FixNow</p>
            <p className="text-xs" style={{ color: "#DAB785" }}>Panel de Administración</p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h2
              className="text-2xl font-bold mb-1"
              style={{ color: "#031D44", fontFamily: "var(--font-display)" }}
            >
              Iniciar sesión
            </h2>
            <p className="text-sm" style={{ color: "#64748b" }}>
              Acceso exclusivo para administradores
            </p>
          </div>

          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#031D44",
                colorBackground: "#ffffff",
                colorText: "#111827",
                colorTextSecondary: "#6b7280",
                colorInputBackground: "#f9fafb",
                colorInputText: "#111827",
                borderRadius: "0.5rem",
                fontFamily: "Inter, sans-serif",
              },
              elements: {
                card: "shadow-sm border border-slate-200 rounded-2xl",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "border border-slate-200 text-slate-700 hover:bg-slate-50",
                formButtonPrimary:
                  "bg-[#031D44] hover:bg-[#04395E] text-[#DAB785] font-semibold",
                footerActionLink: "text-[#031D44] hover:text-[#04395E] font-medium",
                formFieldInput:
                  "border-slate-300 bg-slate-50 focus:border-[#031D44] focus:ring-[#031D44]",
                dividerLine: "bg-slate-200",
                dividerText: "text-slate-400 text-xs",
              },
            }}
          />

          <p className="mt-5 text-center text-xs" style={{ color: "#94a3b8" }}>
            ¿Problemas para ingresar? Contactá al equipo técnico.
          </p>
        </div>
      </div>
    </div>
  )
}
