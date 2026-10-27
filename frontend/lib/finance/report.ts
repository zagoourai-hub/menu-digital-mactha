import { z } from "zod"
import { prisma } from "@/lib/prisma/prisma"
import {
  businessDate,
  DAY_MS,
  type FinancePeriod,
} from "@/lib/schemas/finance.schema"

export function financeEnvironment() {
  return z
    .enum(["true", "false"])
    .default("false")
    .parse(process.env.MIDTRANS_IS_PRODUCTION) === "true"
    ? "PRODUCTION"
    : "SANDBOX"
}

export const rupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`

export async function getFinanceReport(
  period: FinancePeriod,
  page = 1,
  pdf = false
) {
  const environment = financeEnvironment()
  const where = {
    environment,
    occurredOn: { gte: period.from, lte: period.to },
  }
  const start = new Date(`${period.from}T00:00:00+07:00`)
  const end = new Date(
    new Date(`${period.to}T00:00:00+07:00`).getTime() + DAY_MS
  )
  const data = await prisma.$transaction(async (tx) => {
    const count = await tx.cashEntry.count({ where })
    if (pdf && count > 5000)
      throw new RangeError(
        "Laporan melebihi 5.000 catatan. Pilih rentang tanggal lebih pendek."
      )
    const [groups, entries, orders] = await Promise.all([
      tx.cashEntry.groupBy({
        by: ["occurredOn", "kind"],
        where: { ...where, cancelled: false },
        _sum: { amount: true, cups: true },
      }),
      tx.cashEntry.findMany({
        where,
        orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }, { id: "asc" }],
        skip: pdf ? 0 : (page - 1) * 50,
        take: pdf ? 5000 : 50,
        include: { audits: { orderBy: { createdAt: "desc" } } },
      }),
      tx.order.findMany({
        where: {
          paymentEnvironment: environment,
          events: {
            some: { status: "PAID", createdAt: { gte: start, lt: end } },
          },
        },
        select: {
          total: true,
          items: { select: { quantity: true, countsAsCup: true } },
          events: {
            where: { status: "PAID" },
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { createdAt: true },
          },
        },
      }),
    ])
    return { count, groups, entries, orders }
  })
  const days = Array.from(
    { length: Math.round((end.getTime() - start.getTime()) / DAY_MS) },
    (_, index) => ({
      date: businessDate(new Date(start.getTime() + index * DAY_MS)),
      onlineSales: 0,
      directSales: 0,
      otherIncome: 0,
      expenses: 0,
      onlineCups: 0,
      directCups: 0,
    })
  )
  for (const group of data.groups) {
    const day = days.find((day) => day.date === group.occurredOn)!
    if (group.kind === "DIRECT_SALE") {
      day.directSales += group._sum.amount ?? 0
      day.directCups += group._sum.cups ?? 0
    }
    if (group.kind === "OTHER_INCOME") day.otherIncome += group._sum.amount ?? 0
    if (group.kind === "EXPENSE") day.expenses += group._sum.amount ?? 0
  }
  for (const order of data.orders) {
    const date = order.events[0]?.createdAt
    if (!date || date < start || date >= end) continue
    const day = days.find((day) => day.date === businessDate(date))!
    day.onlineSales += order.total
    day.onlineCups += order.items.reduce(
      (sum, item) => sum + (item.countsAsCup ? item.quantity : 0),
      0
    )
  }
  const totals = days.reduce(
    (total, day) => ({
      onlineSales: total.onlineSales + day.onlineSales,
      directSales: total.directSales + day.directSales,
      otherIncome: total.otherIncome + day.otherIncome,
      expenses: total.expenses + day.expenses,
      onlineCups: total.onlineCups + day.onlineCups,
      directCups: total.directCups + day.directCups,
    }),
    {
      onlineSales: 0,
      directSales: 0,
      otherIncome: 0,
      expenses: 0,
      onlineCups: 0,
      directCups: 0,
    }
  )
  return {
    period,
    environment,
    days,
    ...totals,
    totalCups: totals.onlineCups + totals.directCups,
    income: totals.onlineSales + totals.directSales + totals.otherIncome,
    difference:
      totals.onlineSales +
      totals.directSales +
      totals.otherIncome -
      totals.expenses,
    entries: data.entries,
    count: data.count,
    page,
  }
}

export type FinanceReport = Awaited<ReturnType<typeof getFinanceReport>>
