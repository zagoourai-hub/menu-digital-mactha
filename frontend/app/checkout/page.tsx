"use client"

import { useRef, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, CreditCard, QrCode, ReceiptText } from "lucide-react"
import { useOrderStore } from "@/lib/stores/order.store"
import { OrderQuantity } from "@/components/order-quantity"
import { z } from "zod"

const methods = [
  { id: "qris", name: "QRIS", detail: "Scan kode QR", icon: QrCode },
  {
    id: "ewallet",
    name: "E-Wallet",
    detail: "Dompet digital",
    icon: CreditCard,
  },
  {
    id: "bank",
    name: "Transfer Bank",
    detail: "Rekening bank",
    icon: CreditCard,
  },
  {
    id: "cash",
    name: "Bayar di Kasir",
    detail: "Tunai atau kartu di outlet",
    icon: ReceiptText,
  },
] as const

export default function CheckoutPage() {
  const items = useOrderStore((state) => state.items)
  const [method, setMethod] = useState<(typeof methods)[number]["id"]>("qris")
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const checkout = useRef({ payload: "", key: "" })
  const submitting = useRef(false)
  const pending = useOrderStore((state) => state.isCheckingOut)
  const setPending = useOrderStore((state) => state.setCheckingOut)
  const recordCheckout = useOrderStore((state) => state.recordCheckout)
  const [error, setError] = useState("")
  const [statusUrl, setStatusUrl] = useState("")

  async function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || pending || !items.length) return
    submitting.current = true
    setPending(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const payload = {
      items: items.map(({ id, quantity }) => ({ id, quantity })),
      customerName: String(form.get("customerName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      note: String(form.get("note") ?? ""),
      method,
    }
    const serialized = JSON.stringify(payload)
    try {
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(serialized)
      )
      const fingerprint = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("")
      const saved = sessionStorage.getItem("matcha-checkout")
      if (saved) {
        const parsed = z
          .object({ payload: z.string(), key: z.uuid() })
          .safeParse(JSON.parse(saved))
        if (parsed.success) checkout.current = parsed.data
      }
      if (checkout.current.payload !== fingerprint) {
        checkout.current = { payload: fingerprint, key: crypto.randomUUID() }
      }
      sessionStorage.setItem(
        "matcha-checkout",
        JSON.stringify(checkout.current)
      )
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, checkoutKey: checkout.current.key }),
      })
      const result = z
        .object({
          orderId: z
            .string()
            .regex(/^MATCHA-[0-9a-f-]{36}$/)
            .optional(),
          error: z.string().optional(),
          redirectUrl: z.url().nullable().optional(),
          statusUrl: z
            .string()
            .regex(/^\/payment\/MATCHA-[0-9a-f-]{36}$/)
            .optional(),
        })
        .parse(await response.json())
      if (result.orderId) {
        recordCheckout(result.orderId, payload.items)
        sessionStorage.setItem("matcha-checkout-order", result.orderId)
      }
      if (result.statusUrl) setStatusUrl(result.statusUrl)
      if (!response.ok)
        throw new Error(result.error ?? "Pembayaran gagal diproses.")
      const destination = result.redirectUrl ?? result.statusUrl
      if (!destination) throw new Error("Tautan pembayaran tidak tersedia.")
      window.location.assign(destination)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Pembayaran belum dapat diproses."
      )
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-border pb-6">
          <div>
            <Link
              href="/#menu"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke
              menu
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
              Checkout
            </h1>
          </div>
          <ol className="flex items-center gap-2 font-mono text-xs text-muted-foreground sm:gap-4">
            <li>1 Keranjang</li>
            <li aria-hidden="true">›</li>
            <li
              aria-current="step"
              className="bg-primary/10 px-3 py-2 font-bold text-primary"
            >
              2 Pembayaran
            </li>
            <li aria-hidden="true">›</li>
            <li>3 Selesai</li>
          </ol>
        </header>

        <form
          onSubmit={pay}
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]"
        >
          <fieldset disabled={pending} className="contents">
            <div className="space-y-6">
              <section className="flex items-center gap-4 border border-border bg-card p-5 shadow-sm sm:p-7">
                <span className="flex size-11 items-center justify-center bg-primary/10 text-primary">
                  <ReceiptText className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">
                    Detail pesanan
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {count} item dalam pesanan Anda
                  </p>
                </div>
              </section>

              <section className="border border-border bg-card p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-bold text-card-foreground">
                  Data pemesan
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Kontak untuk informasi pesanan.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-card-foreground">
                    Nama pemesan
                    <input
                      name="customerName"
                      required
                      maxLength={100}
                      autoComplete="name"
                      placeholder="Nama Anda"
                      className="mt-2 h-12 w-full border border-input bg-background px-4 font-normal text-foreground outline-none focus:border-primary"
                    />
                  </label>
                  <label className="text-sm font-semibold text-card-foreground">
                    Nomor WhatsApp
                    <input
                      name="phone"
                      pattern="(\+62|62|0)[0-9]{8,13}"
                      maxLength={16}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="08..."
                      className="mt-2 h-12 w-full border border-input bg-background px-4 font-normal text-foreground outline-none focus:border-primary"
                    />
                  </label>
                </div>
              </section>

              <section className="border border-border bg-card p-5 shadow-sm sm:p-7">
                <fieldset>
                  <legend className="text-xl font-bold text-card-foreground">
                    Pilih Metode Pembayaran
                  </legend>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pilih metode untuk pesanan Anda.
                  </p>
                  <div className="mt-5 space-y-3">
                    {methods.map(({ id, name, detail, icon: Icon }) => (
                      <label
                        key={id}
                        className={`flex cursor-pointer items-center gap-4 border p-4 ${method === id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"} ${id === "cash" ? "opacity-50" : ""}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={id}
                          disabled={id === "cash" || pending}
                          checked={method === id}
                          onChange={() => setMethod(id)}
                          className="accent-primary"
                        />
                        <Icon
                          className="size-5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span className="flex-1">
                          <span className="block font-semibold text-card-foreground">
                            {name}
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            {detail}
                            {id === "cash" && " — belum tersedia"}
                          </span>
                        </span>
                        {method === id && (
                          <Check
                            className="size-5 text-primary"
                            aria-hidden="true"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                  {method === "qris" && (
                    <div className="mt-4 flex flex-col items-center border border-primary bg-primary/5 px-5 py-8 text-center">
                      <QrCode
                        className="size-16 text-primary"
                        aria-hidden="true"
                      />
                      <p className="mt-3 text-sm text-muted-foreground">
                        Kode QR akan tampil di halaman pembayaran Midtrans.
                      </p>
                    </div>
                  )}
                </fieldset>
              </section>

              <section className="border border-border bg-card p-5 shadow-sm sm:p-7">
                <label
                  htmlFor="barista-note"
                  className="text-lg font-bold text-card-foreground"
                >
                  Catatan untuk Barista
                </label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Opsional, tulis permintaan untuk pesanan Anda.
                </p>
                <textarea
                  id="barista-note"
                  name="note"
                  rows={3}
                  maxLength={200}
                  placeholder="Contoh: es sedikit"
                  className="mt-4 w-full resize-y border border-input bg-background p-4 text-foreground outline-none focus:border-primary"
                />
              </section>
            </div>

            <aside className="border border-border bg-card p-5 shadow-sm sm:p-7 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-card-foreground">
                Ringkasan Pesanan
              </h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {count} item
              </p>
              {items.length === 0 ? (
                <p className="mt-5 border-t border-border pt-5 text-sm text-muted-foreground">
                  Pesanan masih kosong. Pilih menu untuk melanjutkan.
                </p>
              ) : (
                <ul className="mt-5 divide-y divide-border border-y border-border">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-4">
                      <div className="relative size-14 shrink-0 overflow-hidden bg-muted">
                        {item.imgUrl && (
                          <Image
                            src={item.imgUrl}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-card-foreground">
                          {item.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Rp {item.price.toLocaleString("id-ID")} per item
                        </span>
                        <OrderQuantity
                          id={item.id}
                          name={item.name}
                          quantity={item.quantity}
                        />
                      </div>
                      <span className="font-mono text-sm font-semibold text-card-foreground">
                        Rp{" "}
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-5 flex justify-between border-b border-border pb-4 text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono text-foreground">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 py-5 font-bold text-card-foreground">
                <span>Total Tagihan</span>
                <span className="font-mono text-2xl text-primary">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
              <button
                type="submit"
                disabled={pending || items.length === 0 || method === "cash"}
                className="flex h-12 w-full items-center justify-center bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50"
              >
                {pending ? "Memproses pembayaran…" : "Bayar "}
              </button>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Total akhir dihitung dari harga menu terbaru di server.
              </p>
              {error && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              {statusUrl && (
                <Link
                  href={statusUrl}
                  className="mt-3 block text-sm text-primary underline"
                >
                  Lihat status pesanan
                </Link>
              )}
            </aside>
          </fieldset>
        </form>
      </div>
    </main>
  )
}
