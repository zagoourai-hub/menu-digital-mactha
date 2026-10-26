import {
  ArrowRight,
  CreditCard,
  Leaf,
  QrCode,
  ScanLine,
  ShoppingBag,
  Smartphone,
} from "lucide-react"

const benefits = [
  {
    icon: Leaf,
    title: "Menu digital",
    detail: "Perbarui pilihan menu dan informasi outlet dalam satu tempat.",
  },
  {
    icon: Smartphone,
    title: "Pesan dari ponsel",
    detail: "Pelanggan membuka menu dari tautan atau QR.",
  },
  {
    icon: CreditCard,
    title: "Pembayaran praktis",
    detail: "Tampilkan metode pembayaran yang tersedia di outlet.",
  },
  {
    icon: ShoppingBag,
    title: "Multi-outlet",
    detail: "Kelola informasi menu untuk beberapa outlet.",
  },
]

const steps = [
  {
    icon: ScanLine,
    title: "Scan QR menu",
    detail: "Pelanggan membuka menu melalui kode QR atau tautan outlet.",
  },
  {
    icon: ShoppingBag,
    title: "Pilih menu",
    detail: "Pilih minuman dan opsi yang tersedia.",
  },
  {
    icon: CreditCard,
    title: "Pilih pembayaran",
    detail: "Lanjutkan dengan metode pembayaran outlet.",
  },
  {
    icon: QrCode,
    title: "Pesanan diproses",
    detail: "Pesanan diteruskan ke tim outlet untuk disiapkan.",
  },
]

export default function LandingSections() {
  return (
    <>
      <section
        id="keunggulan"
        className="scroll-mt-20 border-y border-border bg-muted/40 px-5 py-16 md:px-8 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold tracking-widest text-primary uppercase">
              Keunggulan kami
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Kenapa Pilih Kami?
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Menu digital dan alur pemesanan untuk membantu operasional outlet.
            </p>
          </header>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, detail }) => (
              <li
                key={title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-semibold text-card-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="tentang"
        className="scroll-mt-20 px-5 py-16 md:px-8 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold tracking-widest text-primary uppercase">
              Alur pemesanan mudah
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Bagaimana Cara Kerjanya?
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Pelanggan memilih menu dari ponsel, lalu pesanan diteruskan ke
              outlet.
            </p>
          </header>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, detail }, index) => (
              <li
                key={title}
                className="relative rounded-2xl border border-border bg-card p-6"
              >
                <span className="absolute top-4 right-5 text-2xl font-bold text-muted-foreground/40">
                  0{index + 1}
                </span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-semibold text-card-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="hubungi-kami"
        className="scroll-mt-20 border-t border-border bg-muted/40 px-5 py-16 md:px-8 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold tracking-widest text-primary uppercase">
              Konsultasi dan demo
            </span>
            <h2 className="mt-3 text-3xl leading-tight font-bold text-foreground md:text-4xl">
              Mulai Transformasi Digital Kedai Anda Bersama Matcha Yuk
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Jelajahi menu demo dan lihat bagaimana alur pemesanan dapat
              disesuaikan dengan kebutuhan outlet Anda.
            </p>
          </header>
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card p-7 md:p-8">
              <h3 className="text-xl font-bold text-card-foreground">
                Untuk kebutuhan outlet Anda
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Mulai dari menu digital hingga alur order online. Detail
                integrasi dan paket dapat dibicarakan sesuai kebutuhan bisnis.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Katalog minuman digital",
                  "Alur pemesanan dari ponsel",
                  "Pilihan pembayaran per outlet",
                  "Dukungan untuk beberapa outlet",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <Leaf
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center rounded-3xl border border-border bg-card p-7 shadow-sm md:p-8">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <QrCode className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-card-foreground">
                Lihat demo menu
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Coba katalog minuman yang tersedia dan lihat tampilannya di
                halaman ini.
              </p>
              <a
                href="#menu"
                className="mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Jelajahi menu{" "}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background px-5 py-10 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <a
            href="#top"
            className="inline-flex items-center gap-2 font-bold text-foreground"
          >
            <Leaf className="size-5 text-primary" aria-hidden="true" /> Matcha
            Yuk
          </a>
          <nav
            aria-label="Navigasi footer"
            className="flex flex-wrap gap-x-5 gap-y-2"
          >
            <a href="#keunggulan" className="hover:text-primary">
              Fitur
            </a>
            <a href="#menu" className="hover:text-primary">
              Menu
            </a>
            <a href="#hubungi-kami" className="hover:text-primary">
              Hubungi Kami
            </a>
          </nav>
          <span>© 2026 Matcha Yuk</span>
        </div>
      </footer>
    </>
  )
}
