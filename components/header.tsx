"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth, UserButton } from "@clerk/nextjs"

const adminLinks = [
  { href: "/admin/reviews",      label: "Reseñas"   },
  { href: "/admin/banned-words", label: "Palabras"  },
  { href: "/admin/stats",        label: "Métricas"  },
]

export function Header() {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur"
      style={{
        background: "rgba(3, 29, 68, 0.92)",
        borderColor: "rgba(4, 57, 94, 0.6)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="FixNow Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-white">
              FixNow
            </span>
            <span className="text-xs" style={{ color: "#93afc7" }}>Feedback</span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {isSignedIn ? (
            <>
              <nav className="mr-2 hidden items-center gap-1 sm:flex">
                {adminLinks.map(({ href, label }) => {
                  const isActive = pathname.startsWith(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                      style={{ color: isActive ? "#DAB785" : "#DAB785CC" }}
                    >
                      {label}
                      {isActive && (
                        <span
                          className="absolute inset-x-3 -bottom-px h-0.5 rounded-full"
                          style={{ background: "#93afc7" }}
                        />
                      )}
                    </Link>
                  )
                })}
              </nav>
              <UserButton />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#DAB785",
                border: "1px solid rgba(218,183,133,0.3)",
              }}
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
