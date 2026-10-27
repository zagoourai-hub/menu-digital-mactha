import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { requireStaff } from "@/lib/auth/permissions"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireStaff()

  return (
    <DashboardShell
      user={{ name: session.user.name, email: session.user.email }}
      isAdmin={session.user.role === "admin"}
    >
      {children}
    </DashboardShell>
  )
}
