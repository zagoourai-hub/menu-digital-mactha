import { randomUUID } from "node:crypto"
import Link from "next/link"
import { z } from "zod"
import { requireStaff } from "@/lib/auth/permissions"
import { getFinanceReport, rupiah } from "@/lib/finance/report"
import {
  businessDate,
  cashEntrySchema,
  cashKindLabels,
  financePeriodSchema,
} from "@/lib/schemas/finance.schema"
import { CashEntryForm } from "@/components/dashboard/cash-entry-form"
import { CashAuditDetails } from "@/components/dashboard/cash-audit-details"

export const metadata = { title: "Keuangan | Matcha Yuk" }

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string }>
}) {
  const { user } = await requireStaff()
  const params = await searchParams
  const today = businessDate()
  const period = financePeriodSchema.safeParse({
    from: params.from ?? today,
    to: params.to ?? today,
  })
  const page = z.coerce
    .number()
    .int()
    .min(1)
    .max(1000000)
    .safeParse(params.page ?? 1)
  if (!period.success || !page.success)
    return (
      <p role="alert">
        Tanggal/halaman tidak valid. Pilih rentang berurutan maksimal 31 hari.{" "}
        <Link href="/dashboard/finance" className="underline">
          Kembali ke hari ini
        </Link>
      </p>
    )
  const report = await getFinanceReport(period.data, page.data)
  const query = new URLSearchParams(period.data).toString()
  const isAdmin = user.role === "admin"
  return (
    <>
      <section className="space-y-4 border border-border bg-card p-5 sm:p-6">
        <h1 className="font-serif text-3xl font-bold">Keuangan</h1>
        {report.environment === "SANDBOX" && (
          <p className="border border-amber-400 bg-amber-50 p-3 text-sm font-semibold text-amber-950">
            Data uji (sandbox) — tidak termasuk laporan operasional.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Penjualan online dihitung otomatis setelah pembayaran lunas. Catat
          manual hanya penjualan di luar aplikasi. Refund dicatat sebagai
          pengeluaran. Selisih periode bukan saldo kas atau laba bersih.
        </p>
        <form className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Dari
            <input
              type="date"
              name="from"
              defaultValue={period.data.from}
              required
              className="mt-1 block min-h-11 border border-input bg-background px-3"
            />
          </label>
          <label className="text-sm">
            Sampai
            <input
              type="date"
              name="to"
              defaultValue={period.data.to}
              required
              className="mt-1 block min-h-11 border border-input bg-background px-3"
            />
          </label>
          <button className="min-h-11 bg-primary px-4 font-semibold text-primary-foreground">
            Tampilkan
          </button>
          <Link href="/dashboard/finance" className="p-2 text-sm underline">
            Hari ini
          </Link>
          <Link
            href={`/dashboard/finance?from=${today.slice(0, 7)}-01&to=${today}`}
            className="p-2 text-sm underline"
          >
            Bulan ini
          </Link>
          <a
            href={`/api/reports/finance/pdf?${query}`}
            className="min-h-11 border border-border px-4 py-3 text-sm font-semibold"
          >
            Unduh PDF
          </a>
        </form>
        <p className="text-xs text-muted-foreground">
          Waktu Indonesia Barat (WIB). Data pesanan sebelum fitur keuangan aktif
          tidak dimasukkan.
        </p>
      </section>
      <section
        aria-label="Ringkasan keuangan"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          [
            "Total cup",
            `${report.totalCups}`,
            `${report.onlineCups} online + ${report.directCups} langsung`,
          ],
          [
            "Penjualan online",
            rupiah(report.onlineSales),
            "Bruto sebelum biaya Midtrans",
          ],
          ["Penjualan langsung", rupiah(report.directSales), "Dicatat manual"],
          ["Pemasukan lain", rupiah(report.otherIncome), "Tidak menambah cup"],
          [
            "Total pemasukan",
            rupiah(report.income),
            "Penjualan + pemasukan lain",
          ],
          ["Pengeluaran", rupiah(report.expenses), "Termasuk refund manual"],
          [
            "Selisih periode",
            rupiah(report.difference),
            "Pemasukan − pengeluaran",
          ],
        ].map(([label, value, detail]) => (
          <article key={label} className="border border-border bg-card p-5">
            <h2 className="text-sm text-muted-foreground">{label}</h2>
            <p className="my-2 text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </article>
        ))}
      </section>
      <section className="border border-border bg-card p-5">
        <h2 className="mb-4 text-xl font-bold">Tambah catatan</h2>
        <CashEntryForm initialId={randomUUID()} />
      </section>
      <section className="border border-border bg-card p-5">
        <h2 className="mb-4 text-xl font-bold">Rekap harian</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2">Tanggal</th>
                <th className="p-2">Cup</th>
                <th className="p-2">Pemasukan</th>
                <th className="p-2">Pengeluaran</th>
                <th className="p-2">Selisih</th>
              </tr>
            </thead>
            <tbody>
              {report.days.map((day) => {
                const income =
                  day.onlineSales + day.directSales + day.otherIncome
                return (
                  <tr key={day.date} className="border-b border-border">
                    <td className="p-2 whitespace-nowrap">{day.date}</td>
                    <td className="p-2">{day.onlineCups + day.directCups}</td>
                    <td className="p-2 whitespace-nowrap">{rupiah(income)}</td>
                    <td className="p-2 whitespace-nowrap">
                      {rupiah(day.expenses)}
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      {rupiah(income - day.expenses)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section aria-label="Riwayat catatan" className="space-y-4">
        <h2 className="text-xl font-bold">
          Riwayat catatan manual ({report.count})
        </h2>
        {!report.entries.length && (
          <p>Belum ada catatan pada halaman/periode ini.</p>
        )}
        {report.entries.map((entry) => {
          const editable = cashEntrySchema.safeParse(entry)
          return (
            <article
              key={entry.id}
              className="space-y-3 border border-border bg-card p-5"
            >
              <h3 className="font-bold">
                {entry.category} — {rupiah(entry.amount)}{" "}
                {entry.cancelled && "(Dibatalkan)"}
              </h3>
              <p className="text-sm">
                {entry.occurredOn} ·{" "}
                {cashKindLabels[entry.kind as keyof typeof cashKindLabels] ??
                  entry.kind}{" "}
                · {entry.cups} cup
              </p>
              {entry.kind === "DIRECT_SALE" && entry.unitPrice !== null && (
                <p className="text-sm">
                  {rupiah(entry.unitPrice)} × {entry.cups} cup ={" "}
                  {rupiah(entry.amount)}
                </p>
              )}
              <p className="text-sm whitespace-pre-wrap">{entry.description}</p>
              <p className="text-xs text-muted-foreground">
                Dicatat {entry.createdByName} ·{" "}
                {entry.createdAt.toLocaleString("id-ID", {
                  timeZone: "Asia/Jakarta",
                })}{" "}
                WIB · Versi {entry.version}
              </p>
              {isAdmin && !entry.cancelled && editable.success && (
                <details>
                  <summary className="cursor-pointer text-sm font-semibold text-primary">
                    Koreksi / batalkan
                  </summary>
                  <div className="mt-4">
                    <CashEntryForm
                      key={entry.version}
                      initialId={entry.id}
                      entry={{
                        ...editable.data,
                        id: entry.id,
                        version: entry.version,
                      }}
                    />
                  </div>
                </details>
              )}
              {entry.audits.length > 0 && (
                <details>
                  <summary className="cursor-pointer text-sm">
                    Riwayat perubahan ({entry.audits.length})
                  </summary>
                  <ul className="mt-3 space-y-3 text-sm">
                    {entry.audits.map((audit) => (
                      <li
                        key={audit.id}
                        className="border-l-2 border-border pl-3"
                      >
                        <p>
                          {audit.actorName} ·{" "}
                          {audit.createdAt.toLocaleString("id-ID", {
                            timeZone: "Asia/Jakarta",
                          })}{" "}
                          WIB
                        </p>
                        <p className="whitespace-pre-wrap">
                          Alasan: {audit.reason}
                        </p>
                        <details>
                          <summary className="cursor-pointer">
                            Nilai sebelum / sesudah
                          </summary>
                          <CashAuditDetails
                            beforeJson={audit.beforeJson}
                            afterJson={audit.afterJson}
                          />
                        </details>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </article>
          )
        })}
        <nav
          aria-label="Halaman catatan"
          className="flex gap-4 text-sm font-semibold text-primary"
        >
          {report.page > 1 && (
            <Link href={`/dashboard/finance?${query}&page=${report.page - 1}`}>
              Sebelumnya
            </Link>
          )}
          <span>Halaman {report.page}</span>
          {report.page * 50 < report.count && (
            <Link href={`/dashboard/finance?${query}&page=${report.page + 1}`}>
              Berikutnya
            </Link>
          )}
        </nav>
      </section>
    </>
  )
}
