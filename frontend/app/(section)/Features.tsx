import { BookOpen, QrCode, ShoppingBag, Store } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Menu Digital",
    detail: "Tampilan menu menarik dan mudah diakses.",
  },
  {
    icon: ShoppingBag,
    title: "Order Online",
    detail: "Pelanggan pesan langsung dari HP.",
  },
  { icon: QrCode, title: "QRIS", detail: "Pembayaran cepat dan praktis." },
  {
    icon: Store,
    title: "Multi-Outlet",
    detail: "Kelola banyak outlet dalam satu sistem.",
  },
]

export default function Features() {
  return (
    <section className="relative z-10 mx-auto -mt-8 mb-8 w-full max-w-7xl px-5 md:px-8">
      <ul className="grid gap-4 rounded-3xl border border-border bg-card p-5 shadow-lg sm:grid-cols-2 sm:p-7 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-border">
        {features.map(({ icon: Icon, title, detail }) => (
          <li
            key={title}
            className="flex items-center gap-4 lg:px-5 first:lg:pl-0 last:lg:pr-0"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold text-card-foreground">
                {title}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
