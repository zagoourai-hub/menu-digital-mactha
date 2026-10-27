import PDFDocument from "pdfkit"
import { join } from "node:path"
import { cashKindLabels } from "@/lib/schemas/finance.schema"
import { rupiah, type FinanceReport } from "./report"

export function createFinancePdf(report: FinanceReport, generatedBy: string) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 42,
      bufferPages: true,
      font: join(process.cwd(), "lib/finance/fonts/NotoSans-Regular.ttf"),
      info: { Title: "Laporan Keuangan Matcha Yuk", Author: "Matcha Yuk" },
    })
    const chunks: Buffer[] = []
    doc.on("data", (chunk) => chunks.push(chunk))
    doc.on("error", reject)
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    const width = doc.page.width - 84
    const bottom = doc.page.height - 55
    const ensure = (height: number) => {
      if (doc.y + height > bottom) doc.addPage()
    }
    const text = (value: string, size = 9) => {
      doc.fontSize(size)
      const height = doc.heightOfString(value, { width }) + 8
      ensure(height)
      doc.fillColor("#17251a").text(value, 42, doc.y, { width }).moveDown(0.4)
    }
    const row = (values: string[], widths: number[], header = false) => {
      doc.fontSize(8)
      const height =
        Math.max(
          ...values.map((value, index) =>
            doc.heightOfString(value, { width: widths[index] - 12 })
          )
        ) + 14
      ensure(height)
      const y = doc.y
      if (header) doc.rect(42, y, width, height).fill("#e8efdf")
      let x = 42
      values.forEach((value, index) => {
        doc
          .fillColor("#17251a")
          .text(value, x + 6, y + 6, { width: widths[index] - 12 })
        x += widths[index]
      })
      doc
        .moveTo(42, y + height)
        .lineTo(42 + width, y + height)
        .strokeColor("#d7ddcf")
        .stroke()
      doc.y = y + height + 2
    }
    doc.on("pageAdded", () => {
      doc
        .fontSize(8)
        .fillColor("#536446")
        .text("Matcha Yuk · Laporan Keuangan (lanjutan)", 42, 26)
      doc.y = 48
    })
    text("MATCHA YUK", 12)
    text("Laporan Keuangan Kedai", 21)
    text(`Periode ${report.period.from} sampai ${report.period.to} · WIB`)
    text(
      `Lingkungan: ${report.environment === "SANDBOX" ? "DATA UJI / SANDBOX" : "PRODUCTION"}`
    )
    text(
      `Diekspor oleh ${generatedBy} · ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`
    )
    text("Ringkasan", 13)
    const summary = [
      [
        "Cup online / langsung / total",
        `${report.onlineCups} / ${report.directCups} / ${report.totalCups}`,
      ],
      ["Penjualan online bruto", rupiah(report.onlineSales)],
      ["Penjualan langsung", rupiah(report.directSales)],
      ["Pemasukan lain", rupiah(report.otherIncome)],
      ["Total pemasukan", rupiah(report.income)],
      ["Total pengeluaran", rupiah(report.expenses)],
      ["Selisih periode", rupiah(report.difference)],
    ]
    summary.forEach((values) => row(values, [width * 0.6, width * 0.4]))
    doc.moveDown()
    text(
      "Nilai bruto sebelum biaya Midtrans. Refund dicatat manual sebagai pengeluaran. Selisih periode bukan saldo kas atau laba bersih. Pesanan lama sebelum fitur aktif tidak termasuk.",
      8
    )
    text("Rekap harian", 13)
    const dailyWidths = [90, 45, 125, 125, width - 385]
    row(
      ["Tanggal", "Cup", "Pemasukan", "Pengeluaran", "Selisih"],
      dailyWidths,
      true
    )
    report.days.forEach((day) => {
      const income = day.onlineSales + day.directSales + day.otherIncome
      row(
        [
          day.date,
          String(day.onlineCups + day.directCups),
          rupiah(income),
          rupiah(day.expenses),
          rupiah(income - day.expenses),
        ],
        dailyWidths
      )
    })
    doc.moveDown()
    text(`Catatan manual (${report.count})`, 13)
    if (!report.entries.length)
      text("Tidak ada catatan manual pada periode ini.")
    for (const entry of report.entries) {
      const pricing =
        entry.kind === "DIRECT_SALE" && entry.unitPrice !== null
          ? `${rupiah(entry.unitPrice)} × ${entry.cups} cup = ${rupiah(entry.amount)}\n`
          : ""
      const detail = `${pricing}${entry.description}\nPencatat: ${entry.createdByName} · Versi ${entry.version}${entry.cancelled ? " · DIBATALKAN (tidak masuk total)" : ""}`
      doc.fontSize(8)
      ensure(45 + doc.heightOfString(detail, { width }))
      row(
        [
          entry.occurredOn,
          cashKindLabels[entry.kind as keyof typeof cashKindLabels] ??
            entry.kind,
          entry.category,
          `${entry.cups} cup`,
          rupiah(entry.amount),
        ],
        [85, 110, 105, 55, width - 355]
      )
      text(detail, 8)
    }
    const pages = doc.bufferedPageRange()
    for (let index = 0; index < pages.count; index++) {
      doc.switchToPage(pages.start + index)
      const bottomMargin = doc.page.margins.bottom
      doc.page.margins.bottom = 0
      doc
        .fontSize(8)
        .fillColor("#536446")
        .text(
          `Matcha Yuk · ${report.period.from}–${report.period.to} · Halaman ${index + 1} / ${pages.count}`,
          42,
          doc.page.height - 30,
          { width, align: "right", lineBreak: false }
        )
      doc.page.margins.bottom = bottomMargin
    }
    doc.end()
  })
}
