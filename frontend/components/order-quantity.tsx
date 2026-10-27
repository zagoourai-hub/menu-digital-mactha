"use client"

import { useOrderStore } from "@/lib/stores/order.store"
import { MAX_ORDER_QUANTITY } from "@/lib/schemas/payment.schema"

type OrderQuantityProps = {
  id: number
  name: string
  quantity: number
}

export function OrderQuantity({ id, name, quantity }: OrderQuantityProps) {
  const setQuantity = useOrderStore((state) => state.setQuantity)
  const pending = useOrderStore((state) => state.isCheckingOut)

  return (
    <div className="mt-2 inline-flex items-center border border-border text-sm">
      <button
        type="button"
        disabled={pending}
        aria-label={`${quantity === 1 ? "Hapus" : "Kurangi"} ${name}`}
        onClick={() => setQuantity(id, quantity - 1)}
        className="size-8 text-foreground hover:bg-muted"
      >
        −
      </button>
      <span className="min-w-8 text-center font-semibold">{quantity}</span>
      <button
        type="button"
        aria-label={`Tambah ${name}`}
        disabled={pending || quantity >= MAX_ORDER_QUANTITY}
        title={
          quantity >= MAX_ORDER_QUANTITY ? "Maksimal 99 per produk" : undefined
        }
        onClick={() => setQuantity(id, quantity + 1)}
        className="size-8 text-foreground hover:bg-muted"
      >
        +
      </button>
    </div>
  )
}
