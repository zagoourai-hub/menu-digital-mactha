"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Leaf, ShoppingBag } from "lucide-react"
import { useOrderStore } from "@/lib/stores/order.store"
import { SidebarStore } from "@/lib/stores/sidebar.store"
import { OrderSidebar } from "@/components/order-sidebar"

export default function Navbar() {
  const pathname = usePathname()
  const isMenuDetail = pathname.startsWith("/menu/")
  const isCheckout = pathname === "/checkout"
  const isAuthPage = pathname === "/login" || pathname === "/register"
  const activeLink = isMenuDetail ? "menu" : isCheckout ? "" : "beranda"
  const orderCount = useOrderStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  )
  const isSidebarOpen = SidebarStore((state) => state.isOpen)
  const openSidebar = SidebarStore((state) => state.open)

  useEffect(() => {
    void useOrderStore.persist.rehydrate()
  }, [])

  if (isAuthPage || pathname.startsWith("/dashboard")) return null

  return (
    <>
      <nav
        aria-label="Navigasi utama"
        className="sticky top-0 z-50 h-[72px] border-b border-border bg-background/90 backdrop-blur-md"
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <Link
            href="/#top"
            className="flex shrink-0 items-center gap-2 text-foreground"
          >
            <Leaf className="size-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight">Matcha Yuk</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <Link
              aria-current={activeLink === "beranda" ? "page" : undefined}
              className={
                activeLink === "beranda"
                  ? "text-primary"
                  : "transition-colors hover:text-primary"
              }
              href="/#top"
            >
              Beranda
            </Link>
            <Link
              className="transition-colors hover:text-primary"
              href="/#keunggulan"
            >
              Fitur
            </Link>
            <Link
              aria-current={activeLink === "menu" ? "page" : undefined}
              className={
                activeLink === "menu"
                  ? "text-primary"
                  : "transition-colors hover:text-primary"
              }
              href="/#menu"
            >
              Menu
            </Link>
            <Link
              className="transition-colors hover:text-primary"
              href="/#tentang"
            >
              Tentang
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={openSidebar}
              aria-controls="order-sidebar"
              aria-expanded={isSidebarOpen}
              aria-label={`${orderCount} item dalam pesanan`}
              className="inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary"
            >
              <ShoppingBag className="size-5 text-primary" aria-hidden="true" />
              {orderCount}
            </button>
            <Link
              className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:px-5"
              href="/#menu"
            >
              <span className="sm:hidden">Menu</span>
              <span className="hidden sm:inline">
                {isMenuDetail || isCheckout ? "Kembali ke Menu" : "Coba Demo"}
              </span>
            </Link>
            {!isMenuDetail && (
              <Link
                className="hidden h-10 items-center rounded-full border border-primary px-5 text-sm font-semibold text-primary transition hover:bg-primary/10 sm:inline-flex"
                href="/#hubungi-kami"
              >
                Hubungi Kami
              </Link>
            )}
          </div>
        </div>
      </nav>
      <OrderSidebar />
    </>
  )
}
