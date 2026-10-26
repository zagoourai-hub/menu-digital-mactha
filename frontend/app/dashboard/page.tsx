import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Package, ReceiptText } from "lucide-react"
import { MenuCatalog } from "@/components/dashboard/menu-catalog"
import { prisma } from "@/lib/prisma/prisma"

export const metadata: Metadata = {
  title: "Dashboard Merchant | Matcha Yuk",
  description: "Ringkasan katalog menu dari database.",
}


export default async function DashboardPage() {
  const [totalProducts, publishedProducts, categoryCount, products] =
  await Promise.all([
    prisma.produk.count(),
    prisma.produk.count({ where: { published: true } }),
      prisma.category.count(),
      prisma.produk.findMany({
        select: {
          id: true,
          name: true,
          desk: true,
          price: true,
          imgUrl: true,
          published: true,
          category: { select: { name: true } },
        },
        orderBy: { id: "desc" },
        take: 4,
      }),
    ])

  return (
    <>
      <section className="border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="font-mono text-xs font-bold tracking-wider text-primary uppercase">
          Katalog bersama / Dashboard
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
          Ringkasan Katalog Menu
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Jumlah menu dan kategori diambil langsung dari database. Katalog masih
          digunakan bersama oleh semua akun.
        </p>
      </section>

      <section
        aria-label="Ringkasan katalog"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
        <StatCard
          label="Total menu"
          value={totalProducts}
          detail="Seluruh produk dalam katalog"
          />
        <StatCard
          label="Menu terbit"
          value={publishedProducts}
          detail="Produk dengan status terbit"
          />
        <StatCard
          label="Belum terbit"
          value={totalProducts - publishedProducts}
          detail="Produk yang belum diterbitkan"
        />
        <StatCard
          label="Kategori"
          value={categoryCount}
          detail="Kelompok menu di database"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <section>
          <div className="flex items-center justify-between gap-3 border border-b-0 border-border bg-card p-5">
            <div>
              <h2 className="font-serif text-2xl font-bold">Menu terbaru</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Empat produk terakhir di katalog
              </p>
            </div>
            <Package className="size-5 text-primary" aria-hidden="true" />
          </div>
          <MenuCatalog products={products} />
          <Link
            href="/dashboard/menu"
            className="mt-4 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
          >
            Buka katalog menu
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </section>

        <section className="h-fit border border-border bg-card p-5 shadow-sm">
          <ReceiptText className="size-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-serif text-xl font-bold">Order Masuk</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Database belum menyimpan transaksi pesanan.
          </p>
          <Link
            href="/dashboard/orders"
            className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
            >
            Buka halaman order
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  )
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: number
  detail: string
}) {
  return (
    <article className="flex min-h-36 flex-col justify-between border border-border bg-card p-5 shadow-sm">
      <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <div>
        <p className="font-mono text-3xl font-bold">{value}</p>
        <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
      </div>
    </article>
  )
}