import { z } from "zod"
import { cashEntrySchema, cashKindLabels } from "@/lib/schemas/finance.schema"
import { rupiah } from "@/lib/finance/report"

const snapshotSchema = z.intersection(
  cashEntrySchema,
  z.object({ cancelled: z.boolean() })
)
function readSnapshot(json: string) {
  try {
    return snapshotSchema.safeParse(JSON.parse(json))
  } catch {
    return null
  }
}

function display(snapshot: z.infer<typeof snapshotSchema>) {
  return {
    Jenis: cashKindLabels[snapshot.kind],
    Tanggal: snapshot.occurredOn,
    Nominal: rupiah(snapshot.amount),
    "Harga per cup":
      snapshot.unitPrice === null
        ? "Tidak dicatat (total lama)"
        : rupiah(snapshot.unitPrice),
    Cup: String(snapshot.cups),
    Kategori: snapshot.category,
    Keterangan: snapshot.description,
    Status: snapshot.cancelled ? "Dibatalkan" : "Aktif",
  }
}

export function CashAuditDetails({
  beforeJson,
  afterJson,
}: {
  beforeJson: string
  afterJson: string
}) {
  const before = readSnapshot(beforeJson)
  const after = readSnapshot(afterJson)
  if (!before?.success || !after?.success)
    return <p>Rincian perubahan belum dapat ditampilkan.</p>
  const previous = display(before.data)
  const next = display(after.data)
  return (
    <ul className="mt-2 space-y-1 text-xs">
      {Object.entries(previous)
        .filter(([key, value]) => next[key as keyof typeof next] !== value)
        .map(([key, value]) => (
          <li key={key} className="break-words whitespace-pre-wrap">
            {key}: {value} → {next[key as keyof typeof next]}
          </li>
        ))}
    </ul>
  )
}
