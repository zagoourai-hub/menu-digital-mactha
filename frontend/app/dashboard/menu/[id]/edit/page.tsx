import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DeleteProductButton } from "@/components/dashboard/delete-product-button"
import { ProductForm } from "@/components/dashboard/product-form"
import { prisma } from "@/lib/prisma/prisma"
import { deleteProduct, updateProduct } from "../../actions"

export const metadata: Metadata = {
  title: "Edit Menu | Matcha Yuk",
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!Number.isSafeInteger(id) || id < 1) notFound()

  const [product, categories] = await Promise.all([
    prisma.produk.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        judul: true,
        price: true,
        categoryId: true,
        desk: true,
        imgUrl: true,
        published: true,
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
  ])
  if (!product) notFound()

  return (
    <>
      <section className="border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="font-mono text-xs font-bold tracking-wider text-primary uppercase">
          Katalog Menu / Edit
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
          Edit {product.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Perubahan berlaku pada katalog bersama.
        </p>
      </section>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        product={product}
      />
      <details className="border border-destructive/40 bg-card p-5">
        <summary className="cursor-pointer font-semibold text-destructive">
          Hapus menu
        </summary>
        <p className="mt-3 text-sm text-muted-foreground">
          Menghapus {product.name} dari katalog bersama secara permanen.
        </p>
        <DeleteProductButton
          name={product.name}
          action={deleteProduct.bind(null, product.id)}
        />
      </details>
    </>
  )
}
