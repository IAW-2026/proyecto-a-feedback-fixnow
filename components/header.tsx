"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth, UserButton } from "@clerk/nextjs"

const adminLinks = [
  { href: "/admin/reviews",      label: "Reseñas"  },
  { href: "/admin/banned-words", label: "Palabras" },
]

export function Header() {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
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
            <span className="font-display text-lg font-bold text-foreground">
              FixNow
            </span>
            <span className="text-xs text-muted-foreground">Feedback</span>
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
                      className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                      {isActive && (
                        <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-foreground" />
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
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
