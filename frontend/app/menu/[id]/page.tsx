import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Leaf, Tag } from "lucide-react"
import { prisma } from "@/lib/prisma/prisma"
import { AddOrderButton } from "@/components/add-order-button"

export default async function MenuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const productId = Number(id)

  if (!Number.isInteger(productId) || productId < 1) notFound()

  const product = await prisma.produk.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      price: true,
      desk: true,
      imgUrl: true,
      category: { select: { name: true } },
    },
  })

  if (!product) notFound()

  const price = `Rp ${product.price.toLocaleString("id-ID")}`

  return (
    <main className="min-h-screen bg-background px-5 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-2 text-sm"
          >
            <Link
              href="/#menu"
              className="inline-flex shrink-0 items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Menu Kami
            </Link>
            <span className="text-border" aria-hidden="true">
              /
            </span>
            <span className="truncate font-medium text-foreground">
              {product.category.name} / {product.name}
            </span>
          </nav>
          <span className="inline-flex items-center gap-2 bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span
              className="size-2 rounded-full bg-primary"
              aria-hidden="true"
            />
            Detail menu
          </span>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col gap-5 lg:col-span-5">
            <div className="overflow-hidden border border-border bg-card shadow-sm">
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {product.imgUrl ? (
                  <Image
                    src={product.imgUrl}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-primary">
                    <Leaf className="size-16" aria-hidden="true" />
                  </div>
                )}
                <span className="absolute top-4 left-4 bg-primary px-3 py-1.5 text-xs font-semibold tracking-wide text-primary-foreground uppercase">
                  {product.category.name}
                </span>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-linear-to-t from-black/75 to-transparent p-5 pt-16 text-white">
                  <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                    <Leaf className="size-4 text-primary" aria-hidden="true" />
                    Matcha Yuk
                  </span>
                  <span className="bg-black/40 px-2 py-1 font-mono text-xs">
                    ID #{product.id}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-border bg-muted/50">
                <div className="p-4">
                  <span className="block text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Kategori
                  </span>
                  <span className="mt-1 block font-semibold text-card-foreground">
                    {product.category.name}
                  </span>
                </div>
                <div className="p-4">
                  <span className="block text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Harga menu
                  </span>
                  <span className="mt-1 block font-mono font-semibold text-primary">
                    {price}
                  </span>
                </div>
              </div>
            </div>

            <section className="border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center bg-primary/10 text-primary">
                    <Leaf className="size-4" aria-hidden="true" />
                  </span>
                  <h2 className="font-semibold text-card-foreground">
                    Tentang racikan
                  </h2>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  MENU #{product.id}
                </span>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">
                {product.desk || "Deskripsi menu belum tersedia."}
              </p>
            </section>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-7">
            <section className="border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
                  <span className="size-2 bg-primary" aria-hidden="true" />
                  {product.category.name}
                </span>
                <span className="bg-muted px-3 py-1.5 font-mono text-[11px] text-muted-foreground uppercase">
                  Menu pilihan
                </span>
              </div>
              <h1 className="mt-5 text-3xl leading-tight font-bold tracking-tight text-card-foreground sm:text-4xl">
                {product.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-2xl font-bold text-primary sm:text-3xl">
                  {price}
                </span>
                <span className="text-sm text-muted-foreground">
                  harga per menu
                </span>
              </div>
              {product.desk && (
                <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {product.desk}
                </p>
              )}
            </section>

            <section className="border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex size-8 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Informasi menu
                </h2>
              </div>
              <div className="divide-y divide-border border-y border-border">
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <span className="text-muted-foreground">Nama menu</span>
                  <span className="text-right font-semibold text-card-foreground">
                    {product.name}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <span className="text-muted-foreground">Kategori</span>
                  <span className="text-right font-semibold text-card-foreground">
                    {product.category.name}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Tag className="size-4" aria-hidden="true" />
                    Harga
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {price}
                  </span>
                </div>
              </div>
            </section>

            <section className="border border-border bg-muted/50 p-6 sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-card-foreground">
                  Ringkasan menu
                </h2>
                <span className="font-mono text-xs font-semibold text-primary">
                  MATCHA YUK
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-border pb-4 text-sm">
                <span className="text-muted-foreground">{product.name}</span>
                <span className="font-mono text-card-foreground">{price}</span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-4">
                <span className="text-sm font-semibold text-card-foreground">
                  Harga menu
                </span>
                <span className="font-mono text-xl font-bold text-primary">
                  {price}
                </span>
              </div>
              <AddOrderButton product={product} />
              <Link
                href="/#menu"
                className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 border border-border px-5 font-semibold text-foreground transition hover:bg-muted"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Kembali ke katalog
              </Link>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
