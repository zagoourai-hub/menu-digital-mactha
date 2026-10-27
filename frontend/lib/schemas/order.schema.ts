import { z } from "zod"

export const orderStages = {
  NEW: { label: "Baru", next: "PROCESSING", action: "Proses pesanan" },
  PROCESSING: { label: "Diproses", next: "READY", action: "Tandai siap" },
  READY: { label: "Siap", next: "COMPLETED", action: "Selesaikan pesanan" },
  COMPLETED: { label: "Selesai", next: null, action: null },
} as const

export const updateOrderStatusSchema = z.object({
  orderId: z.string().regex(/^MATCHA-[0-9a-f-]{36}$/),
  nextStatus: z.enum(["PROCESSING", "READY", "COMPLETED"]),
})

export type OrderStatusState = { error: string | null }
