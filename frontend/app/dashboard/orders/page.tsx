import type { Metadata } from "next"
import { IncomingOrders } from "@/components/dashboard/incoming-orders"
import { requireStaff } from "@/lib/auth/permissions"
import { RefreshOrdersButton } from "@/components/dashboard/refresh-orders-button"

export const metadata: Metadata = {
  title: "Order Masuk | Matcha Yuk",
}

export default async function OrdersPage() {
  await requireStaff()
  return (
    <>
      <section className="border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="font-mono text-xs font-bold tracking-wider text-primary uppercase">
          Dashboard / Order
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
          Order Masuk
        </h1>
        <p className="mt-2 mb-4 text-sm text-muted-foreground">
          50 pesanan terbaru. Pesanan lunas dapat diproses hingga selesai.
        </p>
        <RefreshOrdersButton />
      </section>
      <IncomingOrders />
    </>
  )
}
