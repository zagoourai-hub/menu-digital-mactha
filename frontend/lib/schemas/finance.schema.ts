import { z } from "zod"

export const cashCategories = {
  DIRECT_SALE: ["Penjualan langsung"],
  OTHER_INCOME: ["Modal", "Lainnya"],
  EXPENSE: [
    "Sewa",
    "Bahan baku",
    "Gaji",
    "Listrik dan air",
    "Transportasi",
    "Refund",
    "Lainnya",
  ],
} as const

export const cashKindLabels = {
  DIRECT_SALE: "Penjualan langsung",
  OTHER_INCOME: "Pemasukan lain",
  EXPENSE: "Pengeluaran",
} as const

export const DAY_MS = 86_400_000
export function businessDate(date = new Date()) {
  return new Date(date.getTime() + 7 * 3_600_000).toISOString().slice(0, 10)
}

export const financePeriodSchema = z
  .object({
    from: z.iso.date(),
    to: z.iso.date(),
  })
  .refine(({ from, to }) => {
    const difference = Date.parse(to) - Date.parse(from)
    return difference >= 0 && difference < 31 * DAY_MS
  }, "Pilih rentang tanggal berurutan maksimal 31 hari.")

export const cashEntrySchema = z
  .object({
    kind: z.enum(["DIRECT_SALE", "OTHER_INCOME", "EXPENSE"]),
    occurredOn: z.iso
      .date()
      .refine(
        (date) => date <= businessDate(),
        "Tanggal tidak boleh di masa depan."
      ),
    amount: z.number().int().min(1).max(2_000_000_000),
    unitPrice: z
      .number()
      .int()
      .min(1)
      .max(2_000_000_000)
      .nullable()
      .default(null),
    cups: z.number().int().min(0).max(1_000_000),
    category: z.string().max(50),
    description: z.string().max(500).optional().default(""),
  })
  .superRefine((entry, ctx) => {
    if (
      entry.unitPrice !== null &&
      (entry.kind !== "DIRECT_SALE" ||
        entry.amount !== entry.unitPrice * entry.cups)
    )
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Total penjualan harus sesuai harga per cup × jumlah cup.",
      })
    if (
      !(cashCategories[entry.kind] as readonly string[]).includes(
        entry.category
      )
    )
      ctx.addIssue({
        code: "custom",
        path: ["category"],
        message: "Kategori tidak sesuai jenis catatan.",
      })
    if (entry.kind === "DIRECT_SALE" ? entry.cups < 1 : entry.cups !== 0)
      ctx.addIssue({
        code: "custom",
        path: ["cups"],
        message:
          "Jumlah cup wajib positif untuk penjualan langsung dan nol untuk catatan lainnya.",
      })
  })

export const cashEntryInputSchema = z
  .object({
    ...cashEntrySchema.shape,
    amount: z.coerce.number().int().min(1).max(2_000_000_000).optional(),
    cups: z.coerce.number().int().min(0).max(1_000_000),
    unitPrice: z
      .preprocess(
        (value) => (value === "" || value === null ? null : value),
        z.coerce.number().int().min(1).max(2_000_000_000).nullable()
      )
      .default(null),
  })
  .transform((entry, ctx) => {
    const result = cashEntrySchema.safeParse({
      ...entry,
      amount:
        entry.kind === "DIRECT_SALE" && entry.unitPrice !== null
          ? entry.unitPrice * entry.cups
          : entry.amount,
      unitPrice: entry.kind === "DIRECT_SALE" ? entry.unitPrice : null,
    })
    if (!result.success) {
      for (const issue of result.error.issues)
        ctx.addIssue({
          code: "custom",
          path: issue.path,
          message: issue.message,
        })
      return z.NEVER
    }
    return result.data
  })

export type CashEntryValues = z.infer<typeof cashEntrySchema>
export type FinancePeriod = z.infer<typeof financePeriodSchema>
export type FinanceActionState = {
  error: string | null
  receipt: string | null
  nextId?: string
}
