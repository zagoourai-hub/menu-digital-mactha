import { createProduct } from "@/app/dashboard/menu/actions"
import { ProductForm } from "./product-form"

type Categories = {
  categories: { id: number; name: string }[]
}

export function CreateProductForm({ categories }: Categories) {
  return <ProductForm action={createProduct} categories={categories} />
}
