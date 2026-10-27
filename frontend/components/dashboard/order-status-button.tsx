"use client"

import { useActionState } from "react"
import { updateOrderStatus } from "@/app/dashboard/orders/actions"

export function OrderStatusButton({
  orderId,
  nextStatus,
  children,
}: {
  orderId: string
  nextStatus: string
  children: React.ReactNode
}) {
  const [state, action, pending] = useActionState(updateOrderStatus, {
    error: null,
  })
  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="nextStatus" value={nextStatus} />
      <button
        type="submit"
        disabled={pending}
        className="bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {pending ? "Menyimpan…" : children}
      </button>
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  )
}
