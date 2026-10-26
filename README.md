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

## Pembayaran dan hasil pengujian

Lihat [panduan payment](docs/payment.md) dan
[laporan bug pembayaran](docs/bug-reports/2026-10-26-payment.md).
Konfigurasi lokal payment belum lengkap pada pengujian terakhir; pembayaran serta
webhook sandbox belum terverifikasi end-to-end. Perbaikannya ditunda sesuai
keputusan pengguna. Tidak ada deployment produksi yang dilakukan.

## Validasi

```powershell
cd frontend
node --import tsx --test tests/payment.test.mjs
pnpm lint
pnpm typecheck
pnpm build
```

Pengujian payment otomatis memerlukan Node.js dengan dukungan `node:sqlite`.
Pengujian browser memakai Playwright MCP yang terpasang terpisah; panduannya ada
di `docs/payment.md`. Screenshot dan laporan JSON lokal tidak disertakan Git.
