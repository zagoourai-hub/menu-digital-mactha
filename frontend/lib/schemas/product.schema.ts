import { z } from "zod"

export const productSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  judul: z.string().trim().min(2, "Judul minimal 2 karakter").max(100),
  price: z
    .number({ error: "Harga wajib diisi" })
    .int()
    .min(0, "Harga tidak boleh negatif")
    .max(100000000),
  categoryId: z
    .number({ error: "Pilih kategori" })
    .int()
    .positive("Pilih kategori"),
  desk: z.string().trim().max(500, "Deskripsi maksimal 500 karakter"),
  imgUrl: z
    .string()
    .trim()
    .max(255)
    .refine(
      (value) =>
        value === "" ||
        (/^\/assets\/images\/[a-zA-Z0-9._/-]+$/.test(value) &&
          !value.includes("..")),
      "Gunakan path gambar dari /assets/images/"
    ),
  published: z.boolean(),
})

export type ProductFormState = { error: string | null }
export type ProductFormValues = z.infer<typeof productSchema>
