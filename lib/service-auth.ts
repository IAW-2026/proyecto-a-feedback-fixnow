import { NextRequest, NextResponse } from "next/server"

export function validateServiceToken(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return false
  const token = authHeader.slice(7)
  return token === process.env.INTERNAL_API_SECRET
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (req: NextRequest, ctx: any) => Promise<NextResponse>

/**
 * Wrapper que valida el service token antes de ejecutar el handler.
 * Uso: export const GET = withServiceAuth(async (req, ctx) => { ... })
 */
export function withServiceAuth(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ctx) => {
    if (!validateServiceToken(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return handler(req, ctx)
  }
}
