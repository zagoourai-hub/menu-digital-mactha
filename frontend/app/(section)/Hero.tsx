import Image from "next/image"
import { ArrowRight, Leaf } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[560px] items-center overflow-hidden md:min-h-[680px]">
      <Image
        src="/assets/images/bg-hero.png"
        alt="Es matcha segar Matcha Yuk"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[65%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/90 to-background/5 dark:via-background/75" />
      <div className="mx-auto w-full max-w-7xl px-5 py-24 md:px-8">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur">
            <Leaf className="size-4" aria-hidden="true" />
            Platform menu digital untuk brand minuman
          </span>
          <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Kelola Pesanan Lebih Mudah,
            <span className="block text-primary">Kedai Makin Untung</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground md:text-lg">
            Sistem menu digital, order online, dan QRIS untuk brand minuman dan
            matcha. Tingkatkan pengalaman pelanggan dan efisiensi operasional
            outlet Anda.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#menu"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Coba Demo Sekarang
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href="#keunggulan"
              className="inline-flex h-12 items-center rounded-full border border-border bg-background/80 px-6 font-semibold text-foreground backdrop-blur transition hover:bg-muted"
            >
              Lihat Fitur
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
