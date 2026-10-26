import { createHash, timingSafeEqual } from "node:crypto"
import { z } from "zod"
import midtransClient from "midtrans-client"
import {
  midtransStatusSchema,
  midtransNotificationSchema,
} from "@/lib/schemas/payment.schema"

export function getMidtransConfig() {
  const env = z
    .object({
      MIDTRANS_SERVER_KEY: z.string().min(1),
      MIDTRANS_IS_PRODUCTION: z.enum(["true", "false"]).default("false"),
      APP_URL: z.url(),
    })
    .parse(process.env)
  const production = env.MIDTRANS_IS_PRODUCTION === "true"
  const appUrl = new URL(env.APP_URL)
  if (
    production &&
    (appUrl.protocol !== "https:" || env.MIDTRANS_SERVER_KEY.startsWith("SB-"))
  ) {
    throw new Error("Invalid production configuration")
  }
  return {
    isProduction: production,
    serverKey: env.MIDTRANS_SERVER_KEY,
    appUrl: appUrl.origin,
    snapUrl: production
      ? "https://app.midtrans.com"
      : "https://app.sandbox.midtrans.com",
  }
}

type Config = ReturnType<typeof getMidtransConfig>

function createSnapClient(config: Config) {
  const snap = new midtransClient.Snap({
    isProduction: config.isProduction,
    serverKey: config.serverKey,
  })
  snap.httpClient.http_client.defaults.timeout = 10_000
  snap.httpClient.http_client.defaults.maxRedirects = 0
  return snap
}

const enabledPayments = {
  qris: ["other_qris"],
  ewallet: ["gopay", "shopeepay"],
  bank: ["bca_va", "bni_va", "bri_va", "permata_va", "echannel"],
}

export async function createSnapTransaction(
  config: Config,
  order: {
    id: string
    total: number
    method: string
    customerName: string
    phone: string
  },
  items: { productId: number; name: string; price: number; quantity: number }[]
) {
  const method = z.enum(["qris", "ewallet", "bank"]).parse(order.method)
  const body = await createSnapClient(config).createTransaction({
    transaction_details: { order_id: order.id, gross_amount: order.total },
    item_details: items.map((item) => ({
      id: String(item.productId),
      name: item.name.slice(0, 50),
      price: item.price,
      quantity: item.quantity,
    })),
    customer_details: {
      first_name: order.customerName,
      phone: order.phone || undefined,
    },
    enabled_payments: enabledPayments[method],
    callbacks: { finish: `${config.appUrl}/payment/${order.id}` },
  })
  return z
    .object({
      token: z.string().min(1),
      redirect_url: z
        .url()
        .refine((url) => new URL(url).origin === config.snapUrl),
    })
    .parse(body)
}

export async function getMidtransStatus(config: Config, orderId: string) {
  return midtransStatusSchema.parse(
    await createSnapClient(config).transaction.status(orderId)
  )
}

export function verifyNotification(
  notification: z.infer<typeof midtransNotificationSchema>,
  serverKey: string
) {
  const expected = createHash("sha512")
    .update(
      `${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`
    )
    .digest()
  const actual = Buffer.from(notification.signature_key, "hex")
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function paymentStatus(status: z.infer<typeof midtransStatusSchema>) {
  if (status.fraud_status === "deny") return "FAILED"
  if (
    status.transaction_status === "settlement" ||
    (status.transaction_status === "capture" &&
      status.fraud_status === "accept")
  )
    return "PAID"
  if (status.transaction_status === "refund") return "REFUNDED"
  if (status.transaction_status === "partial_refund")
    return "PARTIALLY_REFUNDED"
  if (status.transaction_status === "expire") return "EXPIRED"
  if (["cancel", "deny", "failure"].includes(status.transaction_status))
    return "FAILED"
  return "PENDING_PAYMENT"
}

export function canUpdatePayment(current: string, next: string) {
  if (current === next || current === "REFUNDED") return false
  if (current === "PARTIALLY_REFUNDED") return next === "REFUNDED"
  if (current === "PAID")
    return ["REFUNDED", "PARTIALLY_REFUNDED"].includes(next)
  if (["EXPIRED", "FAILED"].includes(current))
    return ["PAID", "REFUNDED", "PARTIALLY_REFUNDED"].includes(next)
  return true
}
