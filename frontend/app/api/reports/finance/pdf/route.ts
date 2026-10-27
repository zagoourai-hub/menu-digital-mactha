import { auth } from "@/lib/auth/auth"
import { financePeriodSchema } from "@/lib/schemas/finance.schema"
import { getFinanceReport } from "@/lib/finance/report"
import { createFinancePdf } from "@/lib/finance/pdf"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
    query: { disableCookieCache: true },
  })
  if (!session)
    return Response.json({ error: "Silakan login." }, { status: 401 })
  if (session.user.role !== "admin" && session.user.role !== "user")
    return Response.json({ error: "Akses ditolak." }, { status: 403 })
  const params = new URL(request.url).searchParams
  const parsed = financePeriodSchema.safeParse({
    from: params.get("from"),
    to: params.get("to"),
  })
  if (!parsed.success)
    return Response.json(
      { error: "Pilih tanggal valid dan rentang maksimal 31 hari." },
      { status: 400 }
    )
  try {
    const report = await getFinanceReport(parsed.data, 1, true)
    const bytes = await createFinancePdf(report, session.user.name)
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="keuangan-${parsed.data.from}-${parsed.data.to}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    if (error instanceof RangeError)
      return Response.json({ error: error.message }, { status: 422 })
    return Response.json(
      { error: "PDF belum dapat dibuat. Coba kembali." },
      { status: 500 }
    )
  }
}
