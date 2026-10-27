import Link from "next/link"
import { Coffee, LayoutDashboard, UtensilsCrossed } from "lucide-react"
import { DashboardNavigation } from "./dashboard-navigation"

type DashboardShellProps = {
  children: React.ReactNode
  user: { name: string; email: string }
  isAdmin: boolean
}

export function DashboardShell({
  children,
  user,
  isAdmin,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="border-b border-border p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 font-serif text-lg font-bold"
          >
            <span className="flex size-9 items-center justify-center bg-primary text-primary-foreground">
              <Coffee className="size-5" aria-hidden="true" />
            </span>
            Matcha Yuk
          </Link>
        </div>
        <DashboardNavigation isAdmin={isAdmin} />
        <div className="mt-auto border-t border-border p-4 text-sm">
          <p className="font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </aside>

      <header className="relative z-40 border-b border-border bg-card/95 backdrop-blur lg:sticky lg:top-0">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="lg:hidden">
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
                <LayoutDashboard
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
                <span className="font-semibold">Menu</span>
              </summary>
              <div className="absolute top-10 left-0 w-64 border border-border bg-card shadow-lg">
                <DashboardNavigation isAdmin={isAdmin} />
              </div>
            </details>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {isAdmin ? "Pemilik kedai" : "Karyawan"}
          </span>
          <Link
            href="/#menu"
            className="ml-auto inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <UtensilsCrossed className="size-4" aria-hidden="true" />
            Lihat Menu
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6">
        {children}
      </main>
    </div>
  )
}
