# Menu Digital — Matcha Yuk

Aplikasi menu digital, keranjang, dashboard merchant, dan integrasi pembayaran
Midtrans Snap melalui Next.js Route Handler.

## Struktur

- `frontend/`: aplikasi Next.js, Prisma/SQLite, migrasi, dan pengujian.
- `docs/`: PRD, arsitektur, desain, panduan payment, dan laporan bug.

## Menjalankan secara lokal

Gunakan pnpm dari direktori `frontend/`. Konfigurasi environment mengikuti
`frontend/.env.example`; simpan kredensial hanya pada `.env` yang diabaikan Git.

```powershell
cd frontend
pnpm install --frozen-lockfile
pnpm exec prisma migrate deploy --config prisma7.config.ts
pnpm exec prisma generate --config prisma7.config.ts
pnpm dev
```

Server development memakai port 3001. Database SQLite lokal tidak disertakan.

## Pemilik dan karyawan

- `admin`: pemilik kedai, mengelola produk, membuat akun karyawan, dan memproses pesanan.
- `user`: karyawan, memproses pesanan lunas, mencatat keuangan, dan mengunduh laporan.
- Registrasi publik ditutup. Pemilik membuat akun melalui **Dashboard → Karyawan**.

Lihat [akses dashboard dan proses pesanan](docs/dashboard-access.md).

Menu **Keuangan** mencatat penjualan langsung, pemasukan lain, dan pengeluaran.
Penjualan online baru dihitung otomatis setelah pembayaran terverifikasi. Pemilik
dapat mengoreksi/membatalkan catatan dengan riwayat. Kedua role dapat mengunduh PDF.
Lihat [panduan keuangan](docs/finance.md) untuk perhitungan dan batas laporannya.

## Pembayaran dan hasil pengujian

Lihat [panduan payment](docs/payment.md) dan
[laporan bug pembayaran](docs/bug-reports/2026-10-26-payment.md).
URL aplikasi lokal dan validasi konfigurasi payment sudah diperbaiki. Checkout
Snap, simulasi QRIS sandbox, serta perubahan order ke PAID melalui webhook otomatis
ngrok sudah diuji. Lihat [setup ngrok](docs/ngrok.md) untuk menjalankan tunnel dan
memperbarui URL callback. Tidak ada deployment produksi yang dilakukan.

## Validasi

```powershell
cd frontend
node --import tsx --test tests/payment.test.mjs tests/order-store.test.mjs
node --experimental-test-module-mocks --import tsx --test tests/dashboard-access.test.mjs
node --experimental-test-module-mocks --import tsx --test tests/finance.test.mjs
pnpm lint
pnpm typecheck
pnpm build
```

Pengujian payment otomatis memerlukan Node.js dengan dukungan `node:sqlite`.
Pengujian browser memakai Playwright MCP yang terpasang terpisah; panduannya ada
di `docs/payment.md`. Screenshot dan laporan JSON lokal tidak disertakan Git.
