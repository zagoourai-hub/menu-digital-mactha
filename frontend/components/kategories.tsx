"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { BorderBeam } from "./ui/border-beam"
import { useMenu } from "@/lib/hook/use-menu"
import { cn } from "@/lib/utils"
import { useOrderStore } from "@/lib/stores/order.store"

const tabClass =
  "cursor-pointer rounded-full border px-5 py-2 text-sm font-medium transition-colors"

export default function Kategory() {
  const { data, error, isError, refetch, isPending } = useMenu()
  const [active, setActive] = useState<number | "all">("all")
  const addItem = useOrderStore((state) => state.addItem)

  if (isPending)
    return (
      <p className="py-8 text-center text-muted-foreground">Memuat menu...</p>
    )

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-border bg-card p-6 text-center"
      >
        <p className="text-muted-foreground">
          Gagal memuat menu: {error.message}
        </p>
        <button
          className="mt-3 font-semibold text-primary hover:underline"
          onClick={() => void refetch()}
        >
          Coba lagi
        </button>
      </div>
    )
  }

  const filtered =
    active === "all"
      ? data.produk
      : data.produk.filter((product) => product.categoryId === active)

  return (
    <>
      <div
        className="mb-6 flex flex-wrap justify-center gap-2"
        role="tablist"
        aria-label="Kategori menu"
      >
        <button
          role="tab"
          aria-selected={active === "all"}
          onClick={() => setActive("all")}
          className={cn(
            tabClass,
            active === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
          )}
        >
          Semua
        </button>
        {data.category.map((category) => (
          <button
            key={category.id}
            role="tab"
            aria-selected={active === category.id}
            onClick={() => setActive(category.id)}
            className={cn(
              tabClass,
              active === category.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((product) => (
          <Card
            key={product.id}
            className="relative overflow-hidden border-border bg-card"
          >
            {product.imgUrl && (
              <Link
                href={`/menu/${product.id}`}
                aria-label={`Lihat detail ${product.name}`}
                className="relative aspect-[4/3] overflow-hidden bg-muted"
              >
                <Image
                  src={product.imgUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </Link>
            )}
            <CardHeader className="gap-2 p-4">
              <CardTitle className="text-base text-card-foreground">
                <Link
                  href={`/menu/${product.id}`}
                  className="transition-colors hover:text-primary"
                >
                  {product.name}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                {product.desk}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between px-4 pb-4">
              <span className="font-semibold text-foreground">
                Rp {product.price.toLocaleString("id-ID")}
              </span>
              <button
                type="button"
                aria-label={`Tambah ${product.name}`}
                onClick={() => addItem(product)}
                className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </CardContent>
            <BorderBeam
              colorFrom="var(--primary)"
              colorTo="var(--primary)"
              borderWidth={2}
              duration={8}
              size={100}
            />
          </Card>
        ))}
      </div>
    </>
  )
}
