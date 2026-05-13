import { Header } from "@/components/header"
import { Star, ClipboardList, User } from "lucide-react"
import Link from "next/link"

const mainActions = [
  {
    title: "Dejar Reseña",
    description: "Califica a un profesional o cliente despues de completar un servicio",
    href: "/reviews/new",
    icon: Star,
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    title: "Consultar Historial",
    description: "Revisa las reseñas de profesionales o clientes",
    href: "/reviews/history",
    icon: ClipboardList,
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
]

// Demo user data - en produccion vendria de Clerk/Auth
const demoUser = {
  name: "Carlos Martinez",
  email: "carlos@email.com",
  avatar: null,
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl">
          {/* Welcome Section */}
          <header className="mb-8 text-center sm:text-left">
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Hola, {demoUser.name.split(" ")[0]}.
            </h1>
            <p className="mt-2 text-muted-foreground">
              ¿Qué deseas hacer hoy?
            </p>
          </header>

          {/* Main Actions */}
          <section className="grid gap-4 sm:grid-cols-2">
            {mainActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${action.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    {action.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {action.description}
                  </p>
                </Link>
              )
            })}
          </section>

          {/* Demo User Card */}
          <section className="mt-8">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{demoUser.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{demoUser.email}</p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Demo
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
