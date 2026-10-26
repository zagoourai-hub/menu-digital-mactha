import { prisma } from "@/lib/prisma/prisma"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  if (!/^MATCHA-[0-9a-f-]{36}$/.test(id))
    return Response.json({ error: "Pesanan tidak valid." }, { status: 400 })
  try {
    // The unguessable ID grants access only to status, never customer data or payment tokens.
    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, total: true, status: true },
    })
    if (!order)
      return Response.json(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 }
      )
    return Response.json(order, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return Response.json(
      { error: "Status belum dapat dimuat." },
      { status: 503 }
    )
  }
}
