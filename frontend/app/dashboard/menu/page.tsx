import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { MenuCatalog } from "@/components/dashboard/menu-catalog"
import { CrudSuccessPopup } from "@/components/dashboard/crud-success-popup"
import { prisma } from "@/lib/prisma/prisma"
import { requireAdmin } from "@/lib/auth/permissions"

export const metadata: Metadata = {
  title: "Katalog Menu | Matcha Yuk",
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await requireAdmin()
  const { status } = await searchParams
  const success =
    status === "created"
      ? {
          title: "Produk ditambahkan",
          message: "Produk berhasil ditambahkan ke katalog menu.",
        }
      : status === "updated"
        ? {
            title: "Produk Berhasil diperbarui",
            message: "Perubahan produk berhasil disimpan.",
          }
        : status === "deleted"
          ? {
              title: "Produk dihapus",
              message: "Produk berhasil dihapus dari katalog menu.",
            }
          : null
  const [products, categories] = await Promise.all([
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
    }),
    prisma.category.findMany({
      select: { id: true, name: true, _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4 border border-border bg-card p-5 shadow-sm sm:p-6">
        <div>
          <p className="font-mono text-xs font-bold tracking-wider text-primary uppercase">
            Katalog bersama / Menu
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
            Katalog Menu
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {products.length} produk dari database. Katalog ini masih digunakan
            bersama oleh semua akun.
          </p>
        </div>
        <Link
          href="/dashboard/menu/create"
          className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" aria-hidden="true" />
          Tambah Menu
        </Link>
      </section>
      {success && <CrudSuccessPopup {...success} />}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <section aria-label="Daftar produk">
          <MenuCatalog products={products} showActions />
        </section>
        <section className="h-fit border border-border bg-card p-5 shadow-sm">
          <h2 className="font-serif text-xl font-bold">Kategori</h2>
          {categories.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Belum ada kategori di database.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border border-t border-border">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <span>{category.name}</span>
                  <span className="font-mono text-primary">
                    {category._count.products} menu
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
