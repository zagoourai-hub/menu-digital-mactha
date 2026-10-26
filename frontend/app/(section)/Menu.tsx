import Image from "next/image"
import { ArrowRight, Leaf } from "lucide-react"
import Kategory from "@/components/kategories"

export default function Menu() {
  return (
    <section id="menu" className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-xs font-bold tracking-widest text-primary uppercase">
            Katalog Minuman Digital
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Menu Kami
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Pilihan matcha dan teh segar racikan barista kami. Pilih minuman
            favoritmu dan sesuaikan dengan selera.
          </p>
        </header>

        <div className="relative mb-10 min-h-64 overflow-hidden rounded-3xl border border-border md:min-h-80">
          <Image
            src="/assets/images/banner.png"
            alt="Daun teh segar"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/80 to-background/15" />
          <div className="relative flex min-h-64 max-w-2xl flex-col items-start justify-center p-6 md:min-h-80 md:p-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary uppercase">
              <Leaf className="size-4" aria-hidden="true" />
              Racikan segar
            </span>
            <h3 className="mt-4 text-2xl leading-tight font-bold text-foreground md:text-4xl">
              Temukan minuman favoritmu
            </h3>
            <p className="mt-3 max-w-lg leading-6 text-muted-foreground">
              Jelajahi katalog Matcha Yuk dan pilih sajian yang cocok untuk
              menemani harimu.
            </p>
            <a
              href="#katalog-menu"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Lihat katalog <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div id="katalog-menu" className="scroll-mt-24">
          <Kategory />
        </div>
      </div>
    </section>
  )
}
