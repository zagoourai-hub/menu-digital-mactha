import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";


export async function GET() {

    try {

        const category = await prisma.category.findMany({
            select: { id: true, name: true,  slug: true },
            orderBy: { sortOrder: 'asc' }
        })

        const produk = await prisma.produk.findMany({
            select: { id: true, name: true, price: true, imgUrl:true, desk:true, categoryId: true },
            orderBy: { id: 'asc' }
        })
        return NextResponse.json({ category, produk })

    } catch (err) {
        console.error("GET /api/menu failed:", err)

        return NextResponse.json(
            {
                error: "gagal mengambil Data"
            },
            {
                status: 500
            }
        )
    }



}