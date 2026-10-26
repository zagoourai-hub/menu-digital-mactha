"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { SidebarStore } from "@/lib/stores/sidebar.store"
import { useOrderStore } from "@/lib/stores/order.store"
import { OrderQuantity } from "@/components/order-quantity"

export function OrderSidebar() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isOpen = SidebarStore((state) => state.isOpen)
  const close = SidebarStore((state) => state.close)
  const items = useOrderStore((state) => state.items)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <dialog
      id="order-sidebar"
      ref={dialogRef}
      aria-label="Pesanan saya"
      onClose={close}
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-md border-l border-border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-black/50"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-xl font-bold">Pesanan saya</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Tutup pesanan"
            className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada menu dalam pesanan.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-4">
                  <div>
                    <span className="font-semibold">{item.name}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      Rp {item.price.toLocaleString("id-ID")} per item
                    </span>
                    <OrderQuantity
                      id={item.id}
                      name={item.name}
                      quantity={item.quantity}
                    />
                  </div>
                  <span className="shrink-0 font-mono font-semibold">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-border p-5">
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span className="font-mono text-primary">
              Rp {total.toLocaleString("id-ID")}
            </span>
          </div>
          {items.length > 0 ? (
            <Link
              href="/checkout"
              onClick={close}
              className="mt-5 flex h-12 items-center justify-center bg-primary px-5 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Checkout
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-5 flex h-12 w-full items-center justify-center bg-muted px-5 font-semibold text-muted-foreground"
            >
              Checkout
            </button>
          )}
        </footer>
      </div>
    </dialog>
  )
}
