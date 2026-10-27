import { prisma } from "@/lib/prisma/prisma"
import { requireStaff } from "@/lib/auth/permissions"
import { orderStages } from "@/lib/schemas/order.schema"
import { OrderStatusButton } from "./order-status-button"

const paymentLabels: Record<string, string> = {
  PENDING_PAYMENT: "Menunggu pembayaran",
  PAID: "Lunas",
  FAILED: "Gagal/dibatalkan",
  EXPIRED: "Kedaluwarsa",
  REFUNDED: "Dana dikembalikan",
  PARTIALLY_REFUNDED: "Dana dikembalikan sebagian",
}

export async function IncomingOrders() {
  await requireStaff()
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      customerName: true,
      note: true,
      total: true,
      status: true,
      fulfillmentStatus: true,
      createdAt: true,
      items: { select: { id: true, name: true, quantity: true } },
    },
  })
  if (!orders.length)
    return (
      <p className="border border-border bg-card p-8 text-center">
        Belum ada pesanan masuk.
      </p>
    )

  return (
    <section aria-label="Daftar pesanan" className="grid gap-4 xl:grid-cols-2">
      {orders.map((order) => {
        const stage = Object.hasOwn(orderStages, order.fulfillmentStatus)
          ? orderStages[order.fulfillmentStatus as keyof typeof orderStages]
          : null
        return (
          <article
            key={order.id}
            className="border border-border bg-card p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold">{order.customerName}</h2>
            <p className="mt-1 font-mono text-xs break-all text-muted-foreground">
              {order.id}
            </p>
            <time
              className="mt-1 block text-xs text-muted-foreground"
              dateTime={order.createdAt.toISOString()}
            >
              {order.createdAt.toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
              })}{" "}
              WIB
            </time>
            <ul className="mt-4 space-y-1 text-sm">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity} × {item.name}
                </li>
              ))}
            </ul>
            {order.note && (
              <p className="mt-3 text-sm whitespace-pre-wrap">
                Catatan: {order.note}
              </p>
            )}
            <p className="mt-4 font-semibold">
              Rp {order.total.toLocaleString("id-ID")}
            </p>
            <p className="mt-2 text-sm">
              Pembayaran: {paymentLabels[order.status] ?? order.status}
            </p>
            <p className="mt-1 text-sm">
              Proses: {stage?.label ?? "Status tidak dikenal"}
            </p>
            {order.status === "PAID" && stage?.next && (
              <OrderStatusButton orderId={order.id} nextStatus={stage.next}>
                {stage.action}
              </OrderStatusButton>
            )}
          </article>
        )
      })}
    </section>
  )
}
