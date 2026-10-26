import type { Metadata } from "next"
import { IncomingOrders } from "@/components/dashboard/incoming-orders"

export const metadata: Metadata = {
  title: "Order Masuk | Matcha Yuk",
}

export default function OrdersPage() {
  return (
    <>
      <section className="border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="font-mono text-xs font-bold tracking-wider text-primary uppercase">
          Dashboard / Order
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
          Order Masuk
        </h1>
      </section>
      <IncomingOrders />
    </>
  )
}
