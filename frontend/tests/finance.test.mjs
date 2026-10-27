import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  mkdirSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { DatabaseSync } from "node:sqlite"
import { mock, test } from "node:test"

test("finance access, ledger, reporting and PDF", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "matcha-finance-"))
  process.env.DATABASE_URL = `file:${join(directory, "test.db")}`
  process.env.MIDTRANS_IS_PRODUCTION = "false"
  const db = new DatabaseSync(join(directory, "test.db"))
  for (const name of readdirSync("prisma/migrations")
    .filter((name) => /^\d/.test(name))
    .sort())
    db.exec(
      readFileSync(resolve("prisma/migrations", name, "migration.sql"), "utf8")
    )
  db.close()
  mock.module("next/headers", {
    namedExports: { headers: async () => new Headers() },
  })
  mock.module("next/navigation", {
    namedExports: {
      redirect: (path) => {
        throw new Error(`redirect:${path}`)
      },
    },
  })
  mock.module("next/cache", { namedExports: { revalidatePath() {} } })
  const { auth } = await import("../lib/auth/auth.ts")
  const { prisma } = await import("../lib/prisma/prisma.ts")
  let role = "user"
  mock.method(auth.api, "getSession", async (options) => {
    assert.equal(options.query.disableCookieCache, true)
    return role === null
      ? null
      : { user: { id: "employee-1", name: "Karyawan Uji", role } }
  })
  const { createCashEntry, changeCashEntry } =
    await import("../app/dashboard/finance/actions.ts")
  const { getFinanceReport } = await import("../lib/finance/report.ts")
  const { businessDate, financePeriodSchema } =
    await import("../lib/schemas/finance.schema.ts")
  const { GET: pdf } = await import("../app/api/reports/finance/pdf/route.ts")
  t.after(async () => {
    mock.restoreAll()
    await prisma.$disconnect()
    rmSync(directory, { recursive: true, force: true })
  })
  const initial = { error: null, receipt: null }
  const period = { from: "2026-10-02", to: "2026-10-02" }
  const base = {
    id: randomUUID(),
    kind: "EXPENSE",
    occurredOn: period.from,
    amount: 6000,
    cups: 0,
    category: "Sewa",
    description: "Sewa tempat",
  }
  const form = (values) => {
    const data = new FormData()
    for (const [key, value] of Object.entries(values))
      data.set(key, String(value))
    return data
  }
  const request = (query) =>
    new Request(`http://localhost:3001/api/reports/finance/pdf?${query}`)

  await t.test(
    "anonymous and unknown roles cannot read exports or create entries",
    async () => {
      for (const value of [null, "owner"]) {
        role = value
        await assert.rejects(
          createCashEntry(initial, form(base)),
          value === null ? /redirect:\/login/ : /redirect:\/$/
        )
        assert.equal(
          (await pdf(request("from=2026-10-02&to=2026-10-02"))).status,
          value === null ? 401 : 403
        )
      }
      assert.equal(await prisma.cashEntry.count(), 0)
    }
  )
  await t.test(
    "employee writes are validated, idempotent, and cannot forge actor/environment or edit",
    async () => {
      role = "user"
      for (const override of [
        { amount: 0 },
        { amount: -1 },
        { amount: 1.5 },
        { occurredOn: "2999-01-01" },
        { occurredOn: "2026-02-30" },
        { kind: "EXPENSE", cups: 1 },
        { category: "Invalid" },
        { description: "x".repeat(501) },
        { kind: "DIRECT_SALE", category: "Penjualan langsung", cups: 0 },
      ])
        assert.ok(
          (await createCashEntry(initial, form({ ...base, ...override }))).error
        )
      const data = form({
        ...base,
        createdById: "forged",
        environment: "PRODUCTION",
      })
      assert.equal((await createCashEntry(initial, data)).error, null)
      assert.equal((await createCashEntry(initial, data)).error, null)
      assert.equal(await prisma.cashEntry.count(), 1)
      assert.ok(
        (await createCashEntry(initial, form({ ...base, amount: 7000 }))).error
      )
      const saved = await prisma.cashEntry.findUniqueOrThrow({
        where: { id: base.id },
      })
      assert.equal(saved.environment, "SANDBOX")
      assert.equal(saved.createdById, "employee-1")
      await assert.rejects(
        changeCashEntry(
          initial,
          form({ ...base, version: 1, intent: "CANCEL", reason: "cancel" })
        ),
        /redirect:\/dashboard\/orders/
      )
    }
  )
  await t.test(
    "owner corrections preserve audit and stale or cancelled records cannot change",
    async () => {
      role = "admin"
      const correction = {
        ...base,
        version: 1,
        intent: "UPDATE",
        reason: "Nominal sewa diperbaiki",
        amount: 8000,
      }
      assert.ok(
        (await changeCashEntry(initial, form({ ...correction, reason: "" })))
          .error
      )
      const concurrent = await Promise.all([
        changeCashEntry(initial, form(correction)),
        changeCashEntry(initial, form({ ...correction, amount: 9000 })),
      ])
      assert.equal(
        concurrent.filter((result) => result.error === null).length,
        1
      )
      const saved = await prisma.cashEntry.findUniqueOrThrow({
        where: { id: base.id },
        include: { audits: true },
      })
      assert.equal(saved.version, 2)
      assert.equal(saved.audits.length, 1)
      assert.equal(JSON.parse(saved.audits[0].beforeJson).amount, 6000)
      assert.equal(JSON.parse(saved.audits[0].afterJson).amount, saved.amount)
      assert.equal(
        (
          await changeCashEntry(
            initial,
            form({
              ...base,
              version: 2,
              intent: "CANCEL",
              reason: "Catatan tidak jadi",
            })
          )
        ).error,
        null
      )
      assert.equal((await getFinanceReport(period)).expenses, 0)
      assert.ok(
        (await changeCashEntry(initial, form({ ...correction, version: 3 })))
          .error
      )
      assert.equal(await prisma.cashEntryAudit.count(), 2)
    }
  )

  await t.test(
    "direct sales multiply unit price on the server and legacy totals need explicit correction",
    async () => {
      role = "user"
      const sale = {
        ...base,
        id: randomUUID(),
        kind: "DIRECT_SALE",
        category: "Penjualan langsung",
        amount: 1,
        unitPrice: 5001,
        cups: 5,
        description: "",
      }
      for (const override of [
        { unitPrice: 0 },
        { unitPrice: -1 },
        { unitPrice: 1.5 },
        { unitPrice: 2_000_000_000, cups: 2 },
        { cups: 1.5 },
        { unitPrice: "" },
      ])
        assert.ok(
          (await createCashEntry(initial, form({ ...sale, ...override }))).error
        )
      const data = form(sale)
      data.delete("description")
      assert.equal((await createCashEntry(initial, data)).error, null)
      assert.equal((await createCashEntry(initial, data)).error, null)
      let saved = await prisma.cashEntry.findUniqueOrThrow({
        where: { id: sale.id },
      })
      assert.equal(saved.amount, 25005)
      assert.equal(saved.unitPrice, 5001)
      assert.equal(saved.description, "")
      assert.equal((await getFinanceReport(period)).directSales, 25005)
      role = "admin"
      const correction = {
        ...sale,
        version: 1,
        intent: "UPDATE",
        reason: "Koreksi harga satuan",
        unitPrice: 5002,
      }
      assert.equal(
        (await changeCashEntry(initial, form(correction))).error,
        null
      )
      saved = await prisma.cashEntry.findUniqueOrThrow({
        where: { id: sale.id },
      })
      assert.equal(saved.amount, 25010)
      const missingUnit = form({ ...correction, version: 2, amount: 1 })
      missingUnit.delete("unitPrice")
      assert.ok((await changeCashEntry(initial, missingUnit)).error)
      const legacy = await prisma.cashEntry.create({
        data: {
          id: randomUUID(),
          environment: "SANDBOX",
          kind: "DIRECT_SALE",
          occurredOn: period.from,
          amount: 5001,
          cups: 5,
          category: "Penjualan langsung",
          description: "Lama",
          createdById: "legacy",
          createdByName: "Legacy",
        },
      })
      assert.equal((await getFinanceReport(period)).directSales, 30011)
      assert.equal(
        (await prisma.cashEntry.findUniqueOrThrow({ where: { id: legacy.id } }))
          .amount,
        5001
      )
      const legacyData = {
        ...base,
        id: legacy.id,
        kind: "DIRECT_SALE",
        category: "Penjualan langsung",
        amount: 5001,
        cups: 5,
        version: 1,
        intent: "UPDATE",
        reason: "Perbaiki keterangan",
        description: "Catatan lama",
      }
      assert.equal(
        (await changeCashEntry(initial, form(legacyData))).error,
        null
      )
      assert.equal(
        (await prisma.cashEntry.findUniqueOrThrow({ where: { id: legacy.id } }))
          .amount,
        5001
      )
      assert.equal(
        (
          await changeCashEntry(
            initial,
            form({
              ...legacyData,
              version: 2,
              unitPrice: 5001,
              reason: "Harga 5001 untuk lima cup",
            })
          )
        ).error,
        null
      )
      const converted = await prisma.cashEntry.findUniqueOrThrow({
        where: { id: legacy.id },
        include: { audits: true },
      })
      assert.equal(converted.amount, 25005)
      assert.equal(converted.unitPrice, 5001)
      assert.equal(converted.audits.length, 2)
      assert.equal(JSON.parse(converted.audits[1].afterJson).amount, 25005)
    }
  )

  const makeOrder = async (total, time, extra = {}) => {
    const {
      mode = "SANDBOX",
      status = "PAID",
      cups = 1,
      topping = 0,
      ...other
    } = extra
    return prisma.order.create({
      data: {
        id: `MATCHA-${randomUUID()}`,
        checkoutKey: randomUUID(),
        requestHash: "finance",
        customerName: "Customer",
        phone: "",
        note: "",
        method: "qris",
        total,
        status,
        paymentEnvironment: mode,
        items: {
          create: [
            {
              productId: 1,
              name: "Tea",
              price: total,
              quantity: cups,
              countsAsCup: true,
            },
            ...(topping
              ? [
                  {
                    productId: 2,
                    name: "Topping",
                    price: 0,
                    quantity: topping,
                    countsAsCup: false,
                  },
                ]
              : []),
          ],
        },
        ...(time
          ? {
              events: {
                create: {
                  status: "PAID",
                  transactionId: randomUUID(),
                  createdAt: new Date(time),
                },
              },
            }
          : {}),
        ...other,
      },
    })
  }
  await t.test(
    "gross sales, manual cash, WIB, first PAID, legacy, topping and environments reconcile",
    async () => {
      await prisma.cashEntryAudit.deleteMany()
      await prisma.cashEntry.deleteMany()
      await makeOrder(50000, "2026-10-01T17:00:00Z", { cups: 2, topping: 3 })
      const refunded = await makeOrder(30000, "2026-10-02T03:00:00Z", {
        status: "REFUNDED",
      })
      await prisma.paymentEvent.create({
        data: {
          orderId: refunded.id,
          status: "PAID",
          transactionId: randomUUID(),
          createdAt: new Date("2026-10-02T04:00:00Z"),
        },
      })
      const before = await makeOrder(80000, "2026-10-01T16:59:59.999Z")
      await prisma.paymentEvent.create({
        data: {
          orderId: before.id,
          status: "PAID",
          transactionId: randomUUID(),
          createdAt: new Date("2026-10-02T01:00:00Z"),
        },
      })
      await makeOrder(90000, "2026-10-02T17:00:00Z")
      await makeOrder(99000, "2026-10-02T03:00:00Z", { mode: "PRODUCTION" })
      await makeOrder(70000, "2026-10-02T03:00:00Z", { mode: null })
      await makeOrder(60000, null, { status: "PENDING_PAYMENT" })
      await makeOrder(61000, null)
      const entries = [
        {
          kind: "DIRECT_SALE",
          category: "Penjualan langsung",
          amount: 25000,
          cups: 2,
        },
        { kind: "OTHER_INCOME", category: "Modal", amount: 10000, cups: 0 },
        { kind: "EXPENSE", category: "Sewa", amount: 6000, cups: 0 },
        { kind: "EXPENSE", category: "Refund", amount: 30000, cups: 0 },
        {
          kind: "EXPENSE",
          category: "Sewa",
          amount: 100000,
          cups: 0,
          cancelled: true,
        },
      ]
      for (const entry of entries)
        await prisma.cashEntry.create({
          data: {
            id: randomUUID(),
            environment: "SANDBOX",
            occurredOn: period.from,
            description: "Catatan uji",
            createdById: "staff",
            createdByName: "Staff",
            ...entry,
          },
        })
      const report = await getFinanceReport(period)
      assert.equal(report.onlineSales, 80000)
      assert.equal(report.totalCups, 5)
      assert.equal(report.onlineCups, 3)
      assert.equal(report.directCups, 2)
      assert.equal(report.income, 115000)
      assert.equal(report.expenses, 36000)
      assert.equal(report.difference, 79000)
      assert.equal(report.days.length, 1)
      assert.equal(report.count, 5)
      process.env.MIDTRANS_IS_PRODUCTION = "true"
      assert.equal((await getFinanceReport(period)).onlineSales, 99000)
      assert.equal((await getFinanceReport(period)).expenses, 0)
      process.env.MIDTRANS_IS_PRODUCTION = "false"
      assert.equal(businessDate(new Date("2026-10-01T17:00:00Z")), "2026-10-02")
      for (const invalid of [
        { from: "2026-10-02", to: "2026-10-01" },
        { from: "2026-01-01", to: "2026-02-01" },
        { from: "2026-02-30", to: "2026-03-01" },
      ])
        assert.equal(financePeriodSchema.safeParse(invalid).success, false)
      assert.equal(
        financePeriodSchema.safeParse({ from: "2026-01-01", to: "2026-01-31" })
          .success,
        true
      )
    }
  )
  await t.test(
    "PDF is a private download, matches report data and handles empty/multipage reports",
    async () => {
      role = "user"
      assert.equal((await pdf(request("from=bad&to=2026-10-02"))).status, 400)
      const response = await pdf(request("from=2026-10-02&to=2026-10-02"))
      assert.equal(response.status, 200)
      assert.equal(response.headers.get("content-type"), "application/pdf")
      assert.equal(response.headers.get("cache-control"), "private, no-store")
      assert.match(response.headers.get("content-disposition"), /attachment/)
      const bytes = Buffer.from(await response.arrayBuffer())
      assert.equal(bytes.subarray(0, 5).toString(), "%PDF-")
      mkdirSync("test-results/finance", { recursive: true })
      writeFileSync("test-results/finance/sample.pdf", bytes)
      const empty = await pdf(request("from=2026-01-01&to=2026-01-01"))
      assert.equal(empty.status, 200)
      const emptyBytes = Buffer.from(await empty.arrayBuffer())
      assert.equal(
        [...emptyBytes.toString("latin1").matchAll(/\/Type \/Page\b/g)].length,
        1
      )
      writeFileSync("test-results/finance/empty.pdf", emptyBytes)
      await prisma.cashEntry.createMany({
        data: Array.from({ length: 55 }, (_, i) => ({
          id: randomUUID(),
          environment: "SANDBOX",
          kind: "EXPENSE",
          occurredOn: period.from,
          amount: 1,
          cups: 0,
          category: "Lainnya",
          description:
            `Biaya panjang ${i}: ` +
            "Catatan operasional kedai yang dibaca pemilik. ".repeat(9),
          createdById: "staff",
          createdByName: "Staff",
        })),
      })
      const paged = await getFinanceReport(period, 2)
      assert.equal(paged.entries.length, 10)
      assert.equal(paged.count, 60)
      assert.equal(paged.expenses, 36055)
      const multi = await pdf(request("from=2026-10-02&to=2026-10-02"))
      assert.equal(multi.status, 200)
      const multiBytes = Buffer.from(await multi.arrayBuffer())
      assert.ok(
        [...multiBytes.toString("latin1").matchAll(/\/Type \/Page\b/g)].length >
          1
      )
      writeFileSync("test-results/finance/multipage.pdf", multiBytes)
    }
  )
  await t.test(
    "oversized PDF refuses rather than silently truncating",
    async () => {
      const missing = 5001 - (await prisma.cashEntry.count())
      await prisma.cashEntry.createMany({
        data: Array.from({ length: missing }, () => ({
          id: randomUUID(),
          environment: "SANDBOX",
          kind: "EXPENSE",
          occurredOn: period.from,
          amount: 1,
          cups: 0,
          category: "Lainnya",
          description: "Batas ekspor",
          createdById: "staff",
          createdByName: "Staff",
        })),
      })
      assert.equal(
        (await pdf(request("from=2026-10-02&to=2026-10-02"))).status,
        422
      )
    }
  )
})
