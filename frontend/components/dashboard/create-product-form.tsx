import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma/prisma"
import {
  ProductFormValues,
  productSchema,
  type ProductFormState,
} from "@/lib/schemas/product.schema"
import { ProductForm } from "./product-form"


type Categories ={
  categories : {
    id: number,
    name:string
  }[]
  
}

export function CreateProductForm({categories}: Categories) {
  
  async function createProduct(
    values: ProductFormValues
  ): Promise<ProductFormState> {
    "use server"

    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login")
      
    const result = productSchema.safeParse(values)
    if (!result.success) {
      return {
        error: result.error.issues[0]?.message ?? "Data menu tidak valid.",
      }
    }

    const { desk, imgUrl, ...produk } = result.data
    const category = await prisma.category.findUnique({
      where: { id: produk.categoryId },
      select: { id: true },
    })
    if (!category) return { error: "Kategori tidak ditemukan." }

    let productId: number
    try {
      const product = await prisma.produk.create({
        data: { ...produk, desk: desk || null, imgUrl: imgUrl || null },
        select: { id: true },
      })
      productId = product.id
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        if (error.code === "P2002") {
          return { error: "Nama menu sudah digunakan." }
        }
        if (error.code === "P2003") {
          return { error: "Kategori sudah tidak tersedia. Muat ulang halaman." }
        }
      }
      throw error
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/menu")
    revalidatePath("/api/menus")
    revalidatePath("/")
    revalidatePath(`/menu/${productId}`)
    redirect("/dashboard/menu?status=created")
  }

  return <ProductForm action={createProduct} categories={categories} />
}
