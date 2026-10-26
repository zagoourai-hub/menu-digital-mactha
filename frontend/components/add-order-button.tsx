"use client"

import { ShoppingBag } from "lucide-react"
import { useOrderStore, type OrderProduct } from "@/lib/stores/order.store"

export function AddOrderButton({ product }: { product: OrderProduct }) {
  const addItem = useOrderStore((state) => state.addItem)

  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 bg-primary px-5 font-semibold text-primary-foreground transition hover:opacity-90"
    >
      <ShoppingBag className="size-4" aria-hidden="true" />
      Tambah ke pesanan
    </button>
  )
}
