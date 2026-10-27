"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma/prisma"
import {
  productSchema,
  type ProductFormState,
} from "@/lib/schemas/product.schema"

function refreshCatalog(id?: number) {
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/menu")
  revalidatePath("/api/menus")
  revalidatePath("/")
  if (id) revalidatePath(`/menu/${id}`)
}

function mutationError(error: unknown): ProductFormState {
  if (error instanceof Error && "code" in error) {
    if (error.code === "P2002") {
      return { error: "Nama menu sudah digunakan." }
    }
    if (error.code === "P2025") {
      return { error: "Menu tidak ditemukan. Muat ulang halaman." }
    }
    if (error.code === "P2003") {
      return { error: "Kategori sudah tidak tersedia. Muat ulang halaman." }
    }
  }
  throw error
}

export async function createProduct(
  values: unknown
): Promise<ProductFormState> {
  await requireAdmin()
  const result = productSchema.safeParse(values)
  if (!result.success)
    return {
      error: result.error.issues[0]?.message ?? "Data menu tidak valid.",
    }
  const { desk, imgUrl, ...fields } = result.data
  const category = await prisma.category.findUnique({
    where: { id: fields.categoryId },
    select: { id: true },
  })
  if (!category) return { error: "Kategori tidak ditemukan." }
  let productId: number
  try {
    const product = await prisma.produk.create({
      data: { ...fields, desk: desk || null, imgUrl: imgUrl || null },
      select: { id: true },
    })
    productId = product.id
  } catch (error) {
    return mutationError(error)
  }
  refreshCatalog(productId)
  redirect("/dashboard/menu?status=created")
}

export async function updateProduct(
  id: number,
  values: unknown
): Promise<ProductFormState> {
  await requireAdmin()
  if (!Number.isSafeInteger(id) || id < 1) {
    return { error: "ID menu tidak valid." }
  }
  const result = productSchema.safeParse(values)
  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Data menu tidak valid.",
    }
  }
  const { desk, imgUrl, ...fields } = result.data
  const category = await prisma.category.findUnique({
    where: { id: fields.categoryId },
    select: { id: true },
  })
  if (!category) return { error: "Kategori tidak ditemukan." }

  try {
    await prisma.produk.update({
      where: { id },
      data: { ...fields, desk: desk || null, imgUrl: imgUrl || null },
    })
  } catch (error) {
    return mutationError(error)
  }

  refreshCatalog(id)
  redirect("/dashboard/menu?status=updated")
}

export async function deleteProduct(id: number): Promise<void> {
  await requireAdmin()
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error("ID menu tidak valid.")
  }
  await prisma.produk.deleteMany({ where: { id } })
  refreshCatalog(id)
  redirect("/dashboard/menu?status=deleted")
}
