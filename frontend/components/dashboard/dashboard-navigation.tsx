"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ReceiptText, UtensilsCrossed } from "lucide-react"

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Katalog Menu", icon: UtensilsCrossed, href: "/dashboard/menu" },
  { label: "Order Masuk", icon: ReceiptText, href: "/dashboard/orders" },
]

export function DashboardNavigation() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navigasi merchant" className="space-y-1 p-3">
      {navigation.map(({ label, icon: Icon, href }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          onClick={(event) =>
            event.currentTarget.closest("details")?.removeAttribute("open")
          }
          className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors ${pathname === href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
        >
          <Icon className="size-5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  )
}
