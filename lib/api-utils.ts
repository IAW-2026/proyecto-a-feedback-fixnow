/**
 * Extrae y normaliza los parámetros de paginación de una request.
 * - page: mínimo 1
 * - limit: entre 1 y 50, default 10
 */
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
