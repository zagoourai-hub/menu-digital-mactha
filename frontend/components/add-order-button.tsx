"use client"

import { ShoppingBag } from "lucide-react"
import { useOrderStore, type OrderProduct } from "@/lib/stores/order.store"
import { MAX_ORDER_QUANTITY } from "@/lib/schemas/payment.schema"

export function AddOrderButton({ product }: { product: OrderProduct }) {
  const addItem = useOrderStore((state) => state.addItem)
  const pending = useOrderStore((state) => state.isCheckingOut)
  const quantity = useOrderStore(
    (state) => state.items.find((item) => item.id === product.id)?.quantity ?? 0
  )

  return (
    <button
      type="button"
      disabled={pending || quantity >= MAX_ORDER_QUANTITY}
      onClick={() => addItem(product)}
      className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 bg-primary px-5 font-semibold text-primary-foreground transition hover:opacity-90"
    >
      <ShoppingBag className="size-4" aria-hidden="true" />
      {quantity >= MAX_ORDER_QUANTITY
        ? "Maksimal 99 per produk"
        : "Tambah ke pesanan"}
    </button>
  )
}
