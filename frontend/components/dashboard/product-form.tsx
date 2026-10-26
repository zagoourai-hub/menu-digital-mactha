"use client"

import Link from "next/link"
import { useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  productSchema,
  type ProductFormState,
  type ProductFormValues,
} from "@/lib/schemas/product.schema"

type EditableProduct = {
  name: string
  judul: string
  price: number
  categoryId: number
  desk: string | null
  imgUrl: string | null
  published: boolean
}

type ProductFormProps = {
  categories: { id: number; name: string }[]
  action: (values: ProductFormValues) => Promise<ProductFormState>
  product?: EditableProduct
}

const inputClass =
  "mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"

export function ProductForm({ action, categories, product }: ProductFormProps) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      judul: product?.judul ?? "",
      price: product?.price,
      categoryId: product?.categoryId,
      desk: product?.desk ?? "",
      imgUrl: product?.imgUrl ?? "",
      published: product?.published ?? false,
    },
  })

  function onSubmit(values: ProductFormValues) {
    form.clearErrors("root")
    startTransition(async () => {
      const result = await action(values)
      if (result?.error) form.setError("root", { message: result.error })
    })
  }

  const { errors, isSubmitting } = form.formState

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5 border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Nama menu
          <input
            {...form.register("name")}
            required
            minLength={2}
            maxLength={100}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClass}
            placeholder="Iced Matcha Latte"
          />
          {errors.name && (
            <span
              id="name-error"
              className="mt-1 block text-xs text-destructive"
            >
              {errors.name.message}
            </span>
          )}
        </label>
        <label className="block text-sm font-semibold">
          Judul tampilan
          <input
            {...form.register("judul")}
            required
            minLength={2}
            maxLength={100}
            aria-invalid={!!errors.judul}
            aria-describedby={errors.judul ? "judul-error" : undefined}
            className={inputClass}
            placeholder="Matcha Latte Segar"
          />
          {errors.judul && (
            <span
              id="judul-error"
              className="mt-1 block text-xs text-destructive"
            >
              {errors.judul.message}
            </span>
          )}
        </label>
        <label className="block text-sm font-semibold">
          Harga (Rp)
          <input
            {...form.register("price", { valueAsNumber: true })}
            type="number"
            required
            min={0}
            max={100000000}
            step={1}
            aria-invalid={!!errors.price}
            aria-describedby={errors.price ? "price-error" : undefined}
            className={inputClass}
            placeholder="25000"
          />
          {errors.price && (
            <span
              id="price-error"
              className="mt-1 block text-xs text-destructive"
            >
              {errors.price.message}
            </span>
          )}
        </label>
        <label className="block text-sm font-semibold">
          Kategori
          <select
            {...form.register("categoryId", { valueAsNumber: true })}
            required
            aria-invalid={!!errors.categoryId}
            aria-describedby={errors.categoryId ? "category-error" : undefined}
            className={inputClass}
          >
            <option value="">Pilih kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <span
              id="category-error"
              className="mt-1 block text-xs text-destructive"
            >
              {errors.categoryId.message}
            </span>
          )}
        </label>
      </div>

      <label className="block text-sm font-semibold">
        Deskripsi
        <textarea
          {...form.register("desk")}
          maxLength={500}
          rows={4}
          aria-invalid={!!errors.desk}
          aria-describedby={errors.desk ? "desk-error" : undefined}
          className={inputClass}
          placeholder="Jelaskan menu secara singkat"
        />
        {errors.desk && (
          <span id="desk-error" className="mt-1 block text-xs text-destructive">
            {errors.desk.message}
          </span>
        )}
      </label>
      <label className="block text-sm font-semibold">
        Path gambar
        <input
          {...form.register("imgUrl")}
          maxLength={255}
          aria-invalid={!!errors.imgUrl}
          aria-describedby={errors.imgUrl ? "image-error" : undefined}
          className={inputClass}
          placeholder="/assets/images/nama-gambar.png"
        />
        <span className="mt-1 block text-xs font-normal text-muted-foreground">
          Opsional. Gunakan gambar yang sudah ada di public/assets/images.
        </span>
        {errors.imgUrl && (
          <span
            id="image-error"
            className="mt-1 block text-xs text-destructive"
          >
            {errors.imgUrl.message}
          </span>
        )}
      </label>
      <label className="flex items-center gap-3 text-sm font-semibold">
        <input
          {...form.register("published")}
          type="checkbox"
          className="size-4 accent-primary"
        />
        Tandai menu sebagai terbit
      </label>
      <p className="text-xs text-muted-foreground">
        Status ini belum menyembunyikan menu dari katalog pembeli.
      </p>

      {errors.root?.message && (
        <p
          role="alert"
          className="border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
        >
          {errors.root.message}
        </p>
      )}
      {categories.length === 0 && (
        <p role="alert" className="text-sm text-destructive">
          Belum ada kategori di database. Menu belum dapat disimpan.
        </p>
      )}
      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <button
          type="submit"
          disabled={isSubmitting || isPending || categories.length === 0}
          className="bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting || isPending
            ? "Menyimpan..."
            : product
              ? "Simpan perubahan"
              : "Tambah menu"}
        </button>
        <Link
          href="/dashboard/menu"
          className="border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          Batal
        </Link>
      </div>
    </form>
  )
}
