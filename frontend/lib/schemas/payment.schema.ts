import { z } from "zod"

export const MAX_ORDER_QUANTITY = 99

export const paymentRequestSchema = z.strictObject({
  checkoutKey: z.uuid(),
  customerName: z.string().trim().min(1).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+62|62|0)[0-9]{8,13}$/)
    .or(z.literal(""))
    .default(""),
  note: z.string().trim().max(200).default(""),
  method: z.enum(["qris", "ewallet", "bank"]),
  items: z
    .array(
      z.strictObject({
        id: z.number().int().positive(),
        quantity: z.number().int().min(1).max(MAX_ORDER_QUANTITY),
      })
    )
    .min(1)
    .max(99)
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length
    ),
})

export const midtransStatusSchema = z.object({
  order_id: z.string().min(1).max(100),
  transaction_id: z.string().min(1).max(100),
  transaction_status: z.enum([
    "pending",
    "capture",
    "settlement",
    "deny",
    "cancel",
    "expire",
    "failure",
    "refund",
    "partial_refund",
    "authorize",
  ]),
  gross_amount: z.string().regex(/^\d{1,16}(?:\.00)?$/),
  fraud_status: z.enum(["accept", "challenge", "deny"]).optional(),
})

export const midtransNotificationSchema = midtransStatusSchema.extend({
  status_code: z.string().regex(/^\d{3}$/),
  signature_key: z.string().regex(/^[a-fA-F0-9]{128}$/),
})
