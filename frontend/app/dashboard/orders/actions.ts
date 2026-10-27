"use server"

import { revalidatePath } from "next/cache"
import { requireStaff } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma/prisma"
import {
  updateOrderStatusSchema,
  type OrderStatusState,
} from "@/lib/schemas/order.schema"

export async function updateOrderStatus(
  _previous: OrderStatusState,
  formData: FormData
): Promise<OrderStatusState> {
  await requireStaff()
  const result = updateOrderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    nextStatus: formData.get("nextStatus"),
  })
  if (!result.success) return { error: "Data status pesanan tidak valid." }
  const { orderId, nextStatus } = result.data
  const previousStatus = {
    PROCESSING: "NEW",
    READY: "PROCESSING",
    COMPLETED: "READY",
  }[nextStatus]
  const updated = await prisma.order.updateMany({
    where: { id: orderId, status: "PAID", fulfillmentStatus: previousStatus },
    data: { fulfillmentStatus: nextStatus },
  })
  revalidatePath("/dashboard/orders")
  if (!updated.count)
    return {
      error: "Pesanan belum lunas atau status sudah berubah. Perbarui daftar.",
    }
  return { error: null }
}
