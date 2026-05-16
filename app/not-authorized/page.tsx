import { SignOutButton } from "@clerk/nextjs"
import { ShieldX } from "lucide-react"

export default function NotAuthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="font-display text-xl font-bold text-foreground">
          Acceso denegado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu cuenta no tiene permisos de administrador.
          Contactá al equipo técnico para obtener acceso.
        </p>
        <SignOutButton redirectUrl="/sign-in">
          <button className="mt-6 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Cerrar sesión
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}
