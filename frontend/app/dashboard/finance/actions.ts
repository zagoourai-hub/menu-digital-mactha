"use server"

import { z } from "zod"
import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma/prisma"
import { requireAdmin, requireStaff } from "@/lib/auth/permissions"
import { financeEnvironment } from "@/lib/finance/report"
import {
  cashEntryInputSchema,
  type CashEntryValues,
  type FinanceActionState,
} from "@/lib/schemas/finance.schema"

const failure = (error: string): FinanceActionState => ({
  error,
  receipt: null,
})
function parseEntry(data: FormData) {
  return cashEntryInputSchema.safeParse(
    Object.fromEntries(
      [
        "kind",
        "occurredOn",
        "amount",
        "unitPrice",
        "cups",
        "category",
        "description",
      ].map((key) => [key, data.get(key) ?? undefined])
    )
  )
}

export async function createCashEntry(
  _previous: FinanceActionState,
  data: FormData
): Promise<FinanceActionState> {
  const { user } = await requireStaff()
  const id = z.uuid().safeParse(data.get("id"))
  const parsed = parseEntry(data)
  if (!id.success || !parsed.success)
    return failure(
      "Data catatan tidak valid. Periksa tanggal, nominal, jumlah cup, dan kategori."
    )
  const environment = financeEnvironment()
  if (parsed.data.kind === "DIRECT_SALE" && parsed.data.unitPrice === null)
    return failure(
      "Isi harga per cup untuk penjualan langsung. Muat ulang jika form masih meminta nominal total."
    )
  try {
    await prisma.cashEntry.create({
      data: {
        id: id.data,
        ...parsed.data,
        environment,
        createdById: user.id,
        createdByName: user.name,
      },
    })
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      error.code !== "P2002"
    )
      throw error
    const existing = await prisma.cashEntry.findUnique({
      where: { id: id.data },
    })
    if (
      !existing ||
      existing.cancelled ||
      existing.createdById !== user.id ||
      existing.environment !== environment ||
      Object.entries(parsed.data).some(
        ([key, value]) => existing[key as keyof CashEntryValues] !== value
      )
    )
      return failure(
        "Kunci catatan sudah digunakan. Muat ulang sebelum membuat catatan baru."
      )
  }
  revalidatePath("/dashboard/finance")
  return { error: null, receipt: id.data, nextId: randomUUID() }
}

export async function changeCashEntry(
  _previous: FinanceActionState,
  data: FormData
): Promise<FinanceActionState> {
  const { user } = await requireAdmin()
  const meta = z
    .object({
      id: z.uuid(),
      version: z.coerce.number().int().positive().max(2_000_000_000),
      intent: z.enum(["UPDATE", "CANCEL"]),
      reason: z.string().trim().min(3).max(500),
    })
    .safeParse(
      Object.fromEntries(
        ["id", "version", "intent", "reason"].map((key) => [key, data.get(key)])
      )
    )
  if (!meta.success)
    return failure(
      "Alasan koreksi/pembatalan minimal 3 karakter dan versi catatan harus valid."
    )
  const parsed = parseEntry(data)
  if (meta.data.intent === "UPDATE" && !parsed.success)
    return failure("Data koreksi tidak valid.")
  const { id, version, intent, reason } = meta.data
  const changed = await prisma.$transaction(async (tx) => {
    const before = await tx.cashEntry.findFirst({
      where: {
        id,
        environment: financeEnvironment(),
        version,
        cancelled: false,
      },
    })
    if (!before) return false
    if (
      intent === "UPDATE" &&
      parsed.success &&
      parsed.data.kind === "DIRECT_SALE" &&
      parsed.data.unitPrice === null &&
      (before.kind !== "DIRECT_SALE" || before.unitPrice !== null)
    )
      return false
    const updated = await tx.cashEntry.updateMany({
      where: { id, version, cancelled: false },
      data: {
        ...(intent === "UPDATE" && parsed.success
          ? parsed.data
          : { cancelled: true }),
        version: { increment: 1 },
      },
    })
    if (!updated.count) return false
    const after = await tx.cashEntry.findUniqueOrThrow({ where: { id } })
    await tx.cashEntryAudit.create({
      data: {
        entryId: id,
        actorId: user.id,
        actorName: user.name,
        reason,
        beforeJson: JSON.stringify(before),
        afterJson: JSON.stringify(after),
      },
    })
    return true
  })
  if (!changed)
    return failure(
      "Catatan sudah berubah/dibatalkan atau tidak tersedia. Perbarui halaman."
    )
  revalidatePath("/dashboard/finance")
  return { error: null, receipt: `${id}:${version + 1}` }
}
