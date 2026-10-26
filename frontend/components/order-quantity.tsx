"use client"

import { useOrderStore } from "@/lib/stores/order.store"

type OrderQuantityProps = {
  id: number
  name: string
  quantity: number
}

export function OrderQuantity({ id, name, quantity }: OrderQuantityProps) {
  const setQuantity = useOrderStore((state) => state.setQuantity)

  return (
    <div className="mt-2 inline-flex items-center border border-border text-sm">
      <button
        type="button"
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
        onClick={() => setQuantity(id, quantity + 1)}
        className="size-8 text-foreground hover:bg-muted"
      >
        +
      </button>
    </div>
  )
}
