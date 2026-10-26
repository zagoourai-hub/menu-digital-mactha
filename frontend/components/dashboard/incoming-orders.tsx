import Link from "next/link"
import { ReceiptText } from "lucide-react"

export function IncomingOrders() {
  return (
    <section className="flex min-h-80 flex-col items-center justify-center border border-border bg-card p-8 text-center shadow-sm">
      <span className="flex size-14 items-center justify-center border border-primary/20 bg-primary/10 text-primary">
        <ReceiptText className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-serif text-2xl font-bold">
        Belum ada data order masuk
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
        Pesanan checkout tersimpan di database. Tampilan dan pemrosesan pesanan
        pada dashboard ini belum terhubung ke data tersebut.
      </p>
      <Link
        href="/dashboard/menu"
        className="mt-6 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Lihat katalog menu
      </Link>
    </section>
  )
}
