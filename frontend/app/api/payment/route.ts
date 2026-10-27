import { randomUUID, createHash } from "node:crypto"
import { prisma } from "@/lib/prisma/prisma"
import { paymentRequestSchema } from "@/lib/schemas/payment.schema"
import {
  createSnapTransaction,
  getMidtransConfig,
  PaymentConfigurationError,
} from "@/lib/payment/midtrans"
import { readPaymentBody } from "@/lib/payment/request"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const config = getMidtransConfig()
    const origin = request.headers.get("origin")
    if (origin !== config.appUrl && origin !== new URL(request.url).origin) {
      return Response.json(
        { error: "Origin tidak diizinkan." },
        { status: 403 }
      )
    }
    const parsed = paymentRequestSchema.safeParse(
      await readPaymentBody(request)
    )
    if (!parsed.success)
      return Response.json(
        { error: "Data pesanan tidak valid." },
        { status: 400 }
      )
    const { checkoutKey, items, customerName, phone, note, method } =
      parsed.data
    const requestHash = createHash("sha256")
      .update(JSON.stringify({ items, customerName, phone, note, method }))
      .digest("hex")
    const existing = await prisma.order.findUnique({ where: { checkoutKey } })
    if (existing) {
      if (existing.requestHash !== requestHash)
        return Response.json(
          { error: "Kunci checkout sudah digunakan." },
          { status: 409 }
        )
      return Response.json({
        orderId: existing.id,
        redirectUrl: existing.redirectUrl,
        statusUrl: `/payment/${existing.id}`,
      })
    }
    const products = await prisma.produk.findMany({
      where: { id: { in: items.map((item) => item.id) }, published: true },
      select: {
        id: true,
        name: true,
        price: true,
        category: { select: { slug: true } },
      },
    })
    if (
      products.length !== items.length ||
      products.some((product) => product.price < 0)
    ) {
      return Response.json(
        { error: "Ada produk yang tidak tersedia." },
        { status: 400 }
      )
    }
    const orderItems = items.map((item) => {
      const product = products.find((product) => product.id === item.id)!
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        countsAsCup: product.category.slug !== "topping",
      }
    })
    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    if (!Number.isSafeInteger(total) || total <= 0 || total > 2_000_000_000) {
      return Response.json(
        { error: "Total pesanan tidak valid." },
        { status: 400 }
      )
    }
    const order = await prisma.$transaction(async (tx) => {
      // shortcut: global quota for one shop; use a shared per-outlet limiter before multi-tenant rollout.
      const recent = await tx.order.count({
        where: { createdAt: { gte: new Date(Date.now() - 60_000) } },
      })
      if (recent >= 30) return null
      return tx.order.create({
        data: {
          id: `MATCHA-${randomUUID()}`,
          checkoutKey,
          requestHash,
          customerName,
          phone,
          note,
          method,
          total,
          paymentEnvironment: config.isProduction ? "PRODUCTION" : "SANDBOX",
          items: { create: orderItems },
        },
      })
    })
    if (!order)
      return Response.json(
        { error: "Terlalu banyak pesanan. Coba satu menit lagi." },
        { status: 429, headers: { "Retry-After": "60" } }
      )
    try {
      const snap = await createSnapTransaction(config, order, orderItems)
      await prisma.order.update({
        where: { id: order.id },
        data: { snapToken: snap.token, redirectUrl: snap.redirect_url },
      })
      return Response.json(
        {
          orderId: order.id,
          token: snap.token,
          redirectUrl: snap.redirect_url,
          statusUrl: `/payment/${order.id}`,
        },
        { status: 201 }
      )
    } catch {
      // A timeout may happen after Midtrans accepted the order; never create a second charge on retry.
      return Response.json(
        {
          error:
            "Pembayaran belum dapat dibuka. Periksa status pesanan sebelum mencoba lagi.",
          orderId: order.id,
          statusUrl: `/payment/${order.id}`,
        },
        { status: 502 }
      )
    }
  } catch (error) {
    if (error instanceof PaymentConfigurationError)
      return Response.json(
        { code: "PAYMENT_NOT_CONFIGURED", error: error.message },
        { status: 503 }
      )
    if (error instanceof SyntaxError || error instanceof RangeError)
      return Response.json(
        { error: "Body JSON tidak valid atau terlalu besar." },
        { status: 400 }
      )
    return Response.json(
      { error: "Pembayaran tidak dapat diproses. Silakan coba lagi." },
      { status: 503 }
    )
  }
}
