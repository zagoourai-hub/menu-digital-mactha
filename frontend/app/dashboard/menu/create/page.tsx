import type { Metadata } from "next"
import { CreateProductForm } from "@/components/dashboard/create-product-form"
import { prisma } from "@/lib/prisma/prisma"

export const metadata: Metadata = {
  title: "Tambah Menu | Matcha Yuk",
}

export default async function CreateProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true,  },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <>
      <section className="border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="font-mono text-xs font-bold tracking-wider text-primary uppercase">
          Katalog Menu / Tambah
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
          Tambah Menu
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Produk baru akan masuk ke katalog bersama.
        </p>
      </section>
      <CreateProductForm categories={categories} />
    </>
  )
}
