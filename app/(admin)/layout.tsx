import { requireAdmin } from "@/lib/clerk"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return <>{children}</>
}
