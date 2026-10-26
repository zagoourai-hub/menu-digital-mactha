import { z } from "zod"

const emailSchema = z.email("Email tidak valid")
const passwordSchema = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter")
  .max(128, "Kata sandi maksimal 128 karakter")

const identifierSchema = z
  .string()
  .trim()
  .min(1, "Email atau nomor WhatsApp wajib diisi")
  .refine(
    (value) =>
      emailSchema.safeParse(value).success ||
      /^\+?[0-9][0-9\s-]{7,15}$/.test(value),
    "Masukkan email atau nomor WhatsApp yang valid"
  )

export const authSignInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
})

export const authSignUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: emailSchema,
  password: passwordSchema,
  namaKedai: z
    .string()
    .trim()
    .min(2, "Nama kedai minimal 2 karakter")
    .optional(),
  kota: z.string().trim().min(2, "Kota wajib diisi").optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{7,15}$/, "Nomor WhatsApp tidak valid")
    .optional(),
})

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema,
  rememberDevice: z.boolean(),
})

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter"),
    namaKedai: z.string().trim().min(2, "Nama kedai minimal 2 karakter"),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9][0-9\s-]{7,15}$/, "Nomor WhatsApp tidak valid"),
    kota: z.string().trim().min(2, "Kota wajib diisi"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    terms: z.boolean().refine(Boolean, "Anda perlu menyetujui ketentuan"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi tidak sama",
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
