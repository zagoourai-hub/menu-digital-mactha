import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "./auth"

export async function requireStaff() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  })
  if (!session) redirect("/login")
  if (session.user.role !== "admin" && session.user.role !== "user")
    redirect("/")
  return session
}

export async function requireAdmin() {
  const session = await requireStaff()
  if (session.user.role !== "admin") redirect("/dashboard/orders")
  return session
}
