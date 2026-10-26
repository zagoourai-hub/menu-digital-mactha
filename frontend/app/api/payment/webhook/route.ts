import { prisma } from "@/lib/prisma/prisma"
import { midtransNotificationSchema } from "@/lib/schemas/payment.schema"
import {
  canUpdatePayment,
  getMidtransConfig,
  getMidtransStatus,
  paymentStatus,
  verifyNotification,
} from "@/lib/payment/midtrans"
import { readPaymentBody } from "@/lib/payment/request"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const parsed = midtransNotificationSchema.safeParse(
      await readPaymentBody(request)
    )
    if (!parsed.success)
      return Response.json(
        { error: "Notifikasi tidak valid." },
        { status: 400 }
      )
    const config = getMidtransConfig()
    const notification = parsed.data
    if (!verifyNotification(notification, config.serverKey))
      return Response.json({ error: "Signature tidak valid." }, { status: 403 })
    const order = await prisma.order.findUnique({
      where: { id: notification.order_id },
    })
    if (!order)
      return Response.json(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 }
      )
    if (Number(notification.gross_amount) !== order.total)
      return Response.json({ error: "Nominal tidak sesuai." }, { status: 400 })
    // Signature does not cover transaction_status; query Midtrans before changing money state.
    const confirmed = await getMidtransStatus(config, order.id)
    if (
      confirmed.order_id !== order.id ||
      Number(confirmed.gross_amount) !== order.total ||
      confirmed.transaction_id !== notification.transaction_id ||
      (order.transactionId && order.transactionId !== confirmed.transaction_id)
    ) {
      return Response.json(
        { error: "Transaksi tidak sesuai." },
        { status: 400 }
      )
    }
    const status = paymentStatus(confirmed)
    await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUniqueOrThrow({
        where: { id: order.id },
      })
      if (!canUpdatePayment(current.status, status)) return
      const updated = await tx.order.updateMany({
        where: { id: order.id, status: current.status },
        data: { status, transactionId: confirmed.transaction_id },
      })
      if (updated.count)
        await tx.paymentEvent.create({
          data: {
            orderId: order.id,
            status,
            transactionId: confirmed.transaction_id,
          },
        })
    })
    return Response.json({ received: true })
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof RangeError)
      return Response.json({ error: "Body tidak valid." }, { status: 400 })
    return Response.json(
      { error: "Notifikasi belum dapat diproses." },
      { status: 503 }
    )
  }
}
