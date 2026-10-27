import type { ReactNode } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ChartNoAxesCombined,
  Coffee,
  LockKeyhole,
  QrCode,
  Store,
} from "lucide-react"

type AuthLayoutProps = {
  mode: "login" | "register"
  children: ReactNode
}

const benefits = [
  {
    icon: QrCode,
    title: "Menu digital & QR meja",
    detail: "Pelanggan pesan dan bayar dari ponsel.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Laporan penjualan",
    detail: "Pantau transaksi dan performa kedai.",
  },
  {
    icon: Store,
    title: "Kelola banyak outlet",
    detail: "Atur menu dan operasional dari satu tempat.",
  },
]

export function AuthLayout({ mode, children }: AuthLayoutProps) {
  const isLogin = mode === "login"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Kembali ke Matcha Yuk"
              className="flex size-9 items-center justify-center text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
                <Coffee className="size-4" aria-hidden="true" />
              </span>
              <span className="font-serif text-xl font-bold tracking-tight sm:text-2xl">
                Matcha Yuk
              </span>
            </Link>
          </div>
          <nav
            aria-label="Autentikasi"
            className="hidden items-center gap-2 sm:flex"
          >
            <Link
              href="/login"
              aria-current={isLogin ? "page" : undefined}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${isLogin ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Masuk
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pt-24 pb-8 md:px-8 md:pt-28">
        <div className="mb-6 hidden items-center justify-between text-xs text-muted-foreground lg:flex">
          <p className="font-mono tracking-wider uppercase">
            <span className="text-primary">●</span> Matcha Yuk Merchant Portal
            <span className="mx-2">/</span>
            <span className="text-foreground">
              {isLogin ? "Masuk" : "Daftar Mitra"}
            </span>
          </p>
          <p className="flex items-center gap-2 font-mono">
            <LockKeyhole className="size-4 text-primary" aria-hidden="true" />
            Portal akun Matcha Yuk
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.3fr]">
          <aside className="hidden flex-col gap-5 border border-border bg-card p-8 shadow-sm lg:flex">
            <span className="w-fit bg-primary/10 px-3 py-2 font-mono text-xs font-bold tracking-wider text-primary uppercase">
              <Store className="mr-2 inline size-4" aria-hidden="true" />
              Matcha Yuk Merchant OS
            </span>
            <div>
              <h1 className="font-serif text-4xl leading-tight font-bold text-card-foreground">
                Kelola kedai lebih praktis dalam satu dashboard.
              </h1>
              <p className="mt-4 leading-7 text-muted-foreground">
                Kelola menu dan pesanan kedai Matcha Yuk dari satu portal.
              </p>
            </div>
            <div
              role="img"
              aria-label="Minuman matcha di kedai"
              className="relative min-h-56 flex-1 bg-cover bg-center"
              style={{
                backgroundImage: "url('/assets/images/auth-matcha.jpg')",
              }}
            >
              <span className="absolute bottom-3 left-3 bg-background/90 px-3 py-2 font-mono text-xs font-semibold">
                Matcha Yuk · Portal Mitra
              </span>
            </div>
            <ul className="space-y-3">
              {benefits.map(({ icon: Icon, title, detail }) => (
                <li
                  key={title}
                  className="flex items-start gap-3 border border-border bg-background p-3"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-semibold text-card-foreground">
                      {title}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>

          <section className="min-w-0 border border-border bg-card p-5 shadow-sm sm:p-8 lg:p-10">
            <div className="mb-6 border border-border bg-muted p-4 lg:hidden">
              <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                Matcha Yuk <span className="text-primary">Portal</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Admin &amp; Kasir POS
              </p>
            </div>
            <div className="mb-6">
              <p className="mb-2 w-fit bg-primary/10 px-2 py-1 font-mono text-[11px] font-bold tracking-wider text-primary uppercase sm:hidden">
                {isLogin ? "Portal Mitra" : "Uji coba gratis 14 hari"}
              </p>
              <h2 className="font-serif text-3xl font-bold text-card-foreground sm:text-4xl">
                {isLogin ? "Selamat datang kembali!" : "Daftarkan kedai Anda"}
              </h2>
              <p className="mt-2 leading-6 text-muted-foreground">
                {isLogin
                  ? "Masuk untuk memantau pesanan dan mengelola gerai Anda."
                  : "Isi data kedai untuk memulai perjalanan bersama Matcha Yuk."}
              </p>
            </div>

            <div className="mb-6 grid gap-1 bg-muted p-1 sm:hidden">
              <Link
                href="/login"
                aria-current={isLogin ? "page" : undefined}
                className={`py-3 text-center font-semibold ${isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                Masuk
              </Link>
            </div>

            {children}

            <div className="mt-7 border-t border-border pt-5 text-center text-sm text-muted-foreground">
              Akun karyawan dibuat oleh pemilik kedai. Hubungi pemilik jika Anda
              belum memiliki akun.
            </div>

            <p className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-5 text-center font-mono text-[11px] text-muted-foreground">
              <LockKeyhole
                className="size-3.5 text-primary"
                aria-hidden="true"
              />
              Akses untuk pemilik kedai dan karyawan
            </p>
          </section>
        </div>

        <footer className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-border pt-5 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p>© 2026 Matcha Yuk · Menu digital dan portal kedai</p>
          <p className="flex items-center gap-2">
            <LockKeyhole className="size-4" aria-hidden="true" />
            <span>Portal untuk pemilik dan pengelola kedai</span>
          </p>
        </footer>
      </main>
    </div>
  )
}
