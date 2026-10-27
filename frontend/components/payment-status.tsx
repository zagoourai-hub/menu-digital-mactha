"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { useEffect } from "react"
import { useOrderStore } from "@/lib/stores/order.store"

const labels = {
  PENDING_PAYMENT: "Menunggu konfirmasi pembayaran",
  PAID: "Pembayaran berhasil",
  FAILED: "Pembayaran gagal atau dibatalkan",
  EXPIRED: "Pembayaran kedaluwarsa",
  REFUNDED: "Dana telah dikembalikan",
  PARTIALLY_REFUNDED: "Sebagian dana telah dikembalikan",
}

export function PaymentStatus({ orderId }: { orderId: string }) {
  const checkout = useOrderStore((state) => state.checkouts[orderId])
  const completeCheckout = useOrderStore((state) => state.completeCheckout)
  const query = useQuery({
    queryKey: ["payment", orderId],
    queryFn: async () => {
      const response = await fetch(
        `/api/payment/${encodeURIComponent(orderId)}`,
        { cache: "no-store" }
      )
      if (!response.ok) throw new Error("Status pesanan belum dapat dimuat.")
      return z
        .object({
          id: z.string(),
          total: z.number().int(),
          status: z.enum([
            "PENDING_PAYMENT",
            "PAID",
            "FAILED",
            "EXPIRED",
            "REFUNDED",
            "PARTIALLY_REFUNDED",
          ]),
        })
        .parse(await response.json())
    },
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING_PAYMENT" ? 3000 : false,
    retry: 1,
  })

  useEffect(() => {
    if (query.data?.status === "PAID" && checkout) completeCheckout(orderId)
    if (
      query.data?.status === "PAID" &&
      sessionStorage.getItem("matcha-checkout-order") === orderId
    ) {
      sessionStorage.removeItem("matcha-checkout")
      sessionStorage.removeItem("matcha-checkout-order")
    }
  }, [orderId, query.data?.status, checkout, completeCheckout])

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-16">
      <h1 className="text-3xl font-bold">Status pembayaran</h1>
      <p className="mt-4 font-mono text-sm break-all">{orderId}</p>
      <div className="mt-6 border border-border bg-card p-6" aria-live="polite">
        {query.isPending && <p>Memuat status…</p>}
        {query.isError && <p role="alert">{query.error.message}</p>}
        {query.data && (
          <>
            <p className="text-xl font-semibold">{labels[query.data.status]}</p>
            <p className="mt-3">
              Rp {query.data.total.toLocaleString("id-ID")}
            </p>
            {query.data.status === "PENDING_PAYMENT" && (
              <p className="mt-3 text-sm text-muted-foreground">
                Status diperbarui otomatis setelah konfirmasi server Midtrans.
                Jika pembayaran tidak dapat dibuka atau status tidak berubah,
                hubungi kasir dengan nomor pesanan ini sebelum membuat pesanan
                baru.
              </p>
            )}
          </>
        )}
        <button
          type="button"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
          className="mt-5 text-primary underline disabled:opacity-50"
        >
          Periksa lagi
        </button>
      </div>
      <Link href="/#menu" className="mt-6 inline-block text-primary underline">
        Kembali ke menu
      </Link>
    </main>
  )
}
