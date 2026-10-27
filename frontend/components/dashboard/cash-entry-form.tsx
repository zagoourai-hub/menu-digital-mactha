"use client"

import { useActionState, useState } from "react"
import {
  createCashEntry,
  changeCashEntry,
} from "@/app/dashboard/finance/actions"
import {
  businessDate,
  cashCategories,
  cashKindLabels,
  type CashEntryValues,
  type FinanceActionState,
} from "@/lib/schemas/finance.schema"

type Props = {
  initialId: string
  entry?: CashEntryValues & { id: string; version: number }
}
const inputClass =
  "mt-2 min-h-11 w-full border border-input bg-background px-3 py-2 font-normal"

export function CashEntryForm({ initialId, entry }: Props) {
  const [kind, setKind] = useState<CashEntryValues["kind"]>(
    entry?.kind ?? "EXPENSE"
  )
  const [category, setCategory] = useState(entry?.category ?? "Sewa")
  const legacySale = entry?.kind === "DIRECT_SALE" && entry.unitPrice === null
  const [unitPricing, setUnitPricing] = useState(!legacySale)
  const [unitPrice, setUnitPrice] = useState(entry?.unitPrice?.toString() ?? "")
  const [cups, setCups] = useState(entry?.cups?.toString() ?? "")
  const unitSale = kind === "DIRECT_SALE" && (!legacySale || unitPricing)
  const total = Number(unitPrice) * Number(cups)
  const validTotal =
    Number.isSafeInteger(total) && total > 0 && total <= 2_000_000_000
  const initial: FinanceActionState = { error: null, receipt: null }
  const [state, action, pending] = useActionState(
    async (previous: FinanceActionState, data: FormData) => {
      const result = await (entry ? changeCashEntry : createCashEntry)(
        previous,
        data
      )
      if (result.receipt && !entry) {
        setUnitPrice("")
        setCups("")
      }
      return result
    },
    initial
  )
  return (
    <form action={action} className="space-y-4">
      <input
        type="hidden"
        name="id"
        value={entry?.id ?? state.nextId ?? initialId}
      />
      {entry && <input type="hidden" name="version" value={entry.version} />}
      <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Jenis catatan
          <select
            name="kind"
            value={kind}
            onChange={(event) => {
              const value = event.target.value as CashEntryValues["kind"]
              setKind(value)
              setCategory(cashCategories[value][0])
            }}
            className={inputClass}
          >
            {Object.entries(cashKindLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Tanggal transaksi
          <input
            name="occurredOn"
            type="date"
            defaultValue={entry?.occurredOn ?? businessDate()}
            max={businessDate()}
            required
            className={inputClass}
          />
        </label>
        {legacySale && kind === "DIRECT_SALE" && (
          <label className="text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={unitPricing}
              onChange={(event) => setUnitPricing(event.target.checked)}
              className="mr-2"
            />
            Gunakan harga per cup untuk koreksi catatan lama
            <span className="mt-1 block text-xs text-muted-foreground">
              Catatan lama tersimpan sebagai total Rp{" "}
              {entry.amount.toLocaleString("id-ID")}. Nilainya tidak dikalikan
              otomatis.
            </span>
          </label>
        )}
        {unitSale ? (
          <label key="unit-price" className="text-sm font-semibold">
            Harga per cup (Rp)
            <input
              name="unitPrice"
              type="number"
              value={unitPrice}
              onChange={(event) => setUnitPrice(event.target.value)}
              min={1}
              max={2000000000}
              step={1}
              required
              className={inputClass}
            />
          </label>
        ) : (
          <label key="total-amount" className="text-sm font-semibold">
            {kind === "DIRECT_SALE"
              ? "Nominal total lama (Rp)"
              : "Nominal (Rp)"}
            <input
              name="amount"
              type="number"
              defaultValue={entry?.amount}
              min={1}
              max={2000000000}
              step={1}
              required
              className={inputClass}
            />
          </label>
        )}
        <label className="text-sm font-semibold">
          Kategori
          <select
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={inputClass}
          >
            {cashCategories[kind].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        {kind === "DIRECT_SALE" ? (
          <label className="text-sm font-semibold">
            Jumlah cup
            <input
              name="cups"
              type="number"
              min={1}
              max={1000000}
              step={1}
              value={cups}
              onChange={(event) => setCups(event.target.value)}
              required
              className={inputClass}
            />
          </label>
        ) : (
          <input name="cups" type="hidden" value="0" />
        )}
        {unitSale && (
          <p className="text-sm font-semibold sm:col-span-2" aria-live="polite">
            Total penjualan: Rp{" "}
            {Number.isSafeInteger(total) && total >= 0
              ? total.toLocaleString("id-ID")
              : "—"}
            {total > 2_000_000_000 && (
              <span className="mt-1 block text-destructive">
                Total maksimal Rp2.000.000.000.
              </span>
            )}
          </p>
        )}
        <label className="text-sm font-semibold sm:col-span-2">
          Keterangan
          <textarea
            name="description"
            defaultValue={entry?.description}
            maxLength={500}
            rows={3}
            className={inputClass}
          />
        </label>
        {entry && (
          <label className="text-sm font-semibold sm:col-span-2">
            Alasan koreksi/pembatalan
            <textarea
              name="reason"
              required
              minLength={3}
              maxLength={500}
              rows={2}
              className={inputClass}
            />
          </label>
        )}
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button
            type="submit"
            name="intent"
            value="UPDATE"
            disabled={unitSale && !validTotal}
            className="bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {pending
              ? "Menyimpan…"
              : entry
                ? "Simpan koreksi"
                : "Simpan catatan"}
          </button>
          {entry && (
            <button
              type="submit"
              name="intent"
              value="CANCEL"
              className="border border-destructive px-4 py-2 font-semibold text-destructive"
            >
              Batalkan catatan
            </button>
          )}
        </div>
      </fieldset>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.receipt && (
        <p role="status" className="text-sm text-primary">
          Catatan berhasil disimpan.
        </p>
      )}
    </form>
  )
}
