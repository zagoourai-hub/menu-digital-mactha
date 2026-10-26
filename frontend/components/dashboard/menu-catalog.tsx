import Image from "next/image"
import Link from "next/link"
import { Coffee } from "lucide-react"

export type CatalogProduct = {
  id: number
  name: string
  desk: string | null
  price: number
  imgUrl: string | null
  published: boolean
  category: { name: string }
}

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

export function MenuCatalog({
  products,
  showActions = false,
}: {
  products: CatalogProduct[]
  showActions?: boolean
}) {
  if (products.length === 0) {
    return (
      <p className="border border-border bg-card p-6 text-sm text-muted-foreground">
        Belum ada produk di database.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border border border-border bg-card shadow-sm">
      {products.map((product) => (
        <li key={product.id} className="flex items-center gap-4 p-4 sm:p-5">
          <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden bg-muted text-primary">
            {product.imgUrl ? (
              <Image
                src={product.imgUrl}
                alt={product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <Coffee className="size-6" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{product.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {product.category.name}
              {product.desk ? ` · ${product.desk}` : ""}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-sm font-bold text-primary">
              {priceFormatter.format(product.price)}
            </p>
            <span className="text-xs text-muted-foreground">
              {product.published ? "Terbit" : "Belum terbit"}
            </span>
            {showActions && (
              <Link
                href={`/dashboard/menu/${product.id}/edit`}
                className="mt-1 block text-sm font-semibold text-primary hover:underline"
              >
                Edit menu
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
