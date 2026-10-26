# PRD: Web Demo Publik — Menu Digital + Order Online + QRIS

- **Level:** Feature PRD
- **Epic:** `platform-menu-digital` (Platform menu digital + order online + QRIS untuk brand kedai minuman multi-outlet)
- **Owner:** bigboss (Zagoour)
- **Tanggal:** 19 Oktober 2026
- **Status:** Draft v1 (siap dieksekusi AI coding agent phase-by-phase)

---

## 1. Feature Name

**Web Demo Publik** — aplikasi web multi-outlet yang bisa dibuka publik via QR/link, berisi menu digital, keranjang, checkout, pembayaran QRIS (DOKU), dan dashboard kasir/admin. Dipakai untuk: (a) konten demo, (b) demo personal ke calon klien, (c) langsung dipakai di outlet es teh sendiri, (d) basis produk yang di-deploy per klien.

## 2. Keputusan Discovery (terkonfirmasi)

| Topik | Keputusan |
|---|---|
| Level | Feature PRD, parent epic `platform-menu-digital` |
| Scope MVP | Full: menu, order, QRIS asli via payment gateway, dashboard |
| Gateway | **DOKU** (SNAP QRIS MPM) |
| Mode pembayaran | **Sandbox di demo publik**, production aktif per klien / outlet sendiri |
| Tenancy | Multi-outlet per brand, multi-tenant (banyak brand/klien) |
| Struktur | `frontend/` + `backend/` saja (tanpa `ai-service/`) |
| Redis | **Ditunda** (tidak dipakai di MVP) |
| Stack | Next.js latest, shadcn/ui, Tailwind, Zustand, TanStack Query v5, React Hook Form + Zod, Motion, Sonner; NestJS, Prisma v7, PostgreSQL; Docker + Coolify |

## 3. Goal

**Problem.** Calon klien (brand minuman 2+ outlet) sulit percaya pada jasa menu digital + QRIS tanpa melihat produk nyata. Saat ini belum ada web yang bisa dibuka publik, direkam untuk konten, dan ditunjukkan dalam demo 15 menit. Tanpa itu, seluruh funnel outreach (50 dihubungi → 15 membalas → 8 demo → 5 klien) tidak punya bukti. Outlet es teh milik sendiri juga masih mencatat order manual sehingga belum ada data riil untuk dipamerkan.

**Solution.** Bangun satu aplikasi web multi-tenant: pelanggan scan QR meja/outlet → lihat menu → pesan → bayar QRIS → pantau status. Kasir/admin mengelola menu dan memproses order lewat dashboard. Demo publik memakai DOKU sandbox plus tombol simulasi bayar; klien nyata memakai DOKU production.

**Impact.**
- Web demo publik live sehingga 3 video pertama bisa direkam.
- Outlet sendiri memakai sistem ini dan menghasilkan data riil (jumlah order, waktu proses, % bayar QRIS).
- Waktu setup klien baru ≤ 3 hari (target Fase 4) karena brand/outlet/menu bisa dibuat lewat dashboard, bukan kode.

## 4. User Personas

1. **Pelanggan (Dina, 24, kedai)** — scan QR di meja, ingin pesan cepat tanpa antre dan bayar QRIS dari HP. Tidak mau install aplikasi.
2. **Kasir/Staf outlet (Rudi)** — melihat order masuk real-time di tablet/HP, menandai diproses/siap/selesai, tidak teknis.
3. **Owner brand (Bu Sari, 2–5 outlet)** — kelola menu & harga per outlet, lihat omzet harian, ingin laporan sederhana.
4. **Super Admin Zagoour (bigboss)** — buat brand/outlet klien baru, atur mode pembayaran, lihat semua tenant, setup klien ≤ 3 hari.
5. **Calon klien (viewer demo)** — membuka link demo dari DM/WA, mencoba alur lengkap tanpa login.

## 5. User Stories

**Pelanggan**
- US-01: Sebagai pelanggan, saya ingin membuka menu lewat scan QR/link outlet agar tidak perlu install aplikasi.
- US-02: Sebagai pelanggan, saya ingin mencari dan memfilter menu berdasarkan kategori agar cepat menemukan minuman.
- US-03: Sebagai pelanggan, saya ingin menambah item dengan opsi (ukuran, es/gula, topping) dan catatan ke keranjang.
- US-04: Sebagai pelanggan, saya ingin checkout dengan nama dan nomor meja/WA agar kasir tahu pesanan siapa.
- US-05: Sebagai pelanggan, saya ingin membayar lewat QRIS dan melihat status otomatis berubah setelah bayar.
- US-06: Sebagai pelanggan, saya ingin melihat status pesanan (menunggu bayar, diproses, siap) tanpa refresh manual.
- Edge: QRIS kedaluwarsa → saya bisa membuat QR baru; item habis saat checkout → saya diberi tahu dan bisa menyesuaikan; koneksi putus → keranjang tidak hilang.

**Kasir/Staf**
- US-07: Sebagai kasir, saya ingin login dan melihat order outlet saya saja, diurutkan terbaru, dengan bunyi/indikator order baru.
- US-08: Sebagai kasir, saya ingin mengubah status order (diproses → siap → selesai) dan menandai bayar tunai bila perlu.
- US-09: Sebagai kasir, saya ingin menandai menu habis/tersedia per outlet secara cepat.

**Owner**
- US-10: Sebagai owner, saya ingin CRUD kategori, menu, opsi, harga, dan foto menu agar bisa mengelola sendiri.
- US-11: Sebagai owner, saya ingin harga/ketersediaan berbeda per outlet bila perlu.
- US-12: Sebagai owner, saya ingin melihat ringkasan harian (jumlah order, omzet, % QRIS) dan mengunduh QR per outlet/meja.

**Super Admin**
- US-13: Sebagai super admin, saya ingin membuat brand, outlet, dan akun owner/kasir dalam hitungan menit.
- US-14: Sebagai super admin, saya ingin mengatur mode pembayaran per brand (`demo`, `doku_sandbox`, `doku_live`) dan kredensial DOKU.
- US-15: Sebagai super admin, saya ingin seed data demo (brand contoh, menu minuman) dengan satu perintah agar demo selalu siap.

## 6. Requirements

### 6.1 Functional Requirements

**Customer web (publik, tanpa login)**
- FR-01: Route `/{brandSlug}/{outletSlug}` menampilkan menu outlet; query `?table=<kode>` menyimpan nomor meja.
- FR-02: Daftar menu per kategori dengan foto, harga, status habis; pencarian teks; skeleton saat loading.
- FR-03: Detail menu dalam bottom sheet dengan opsi (single/multi choice, harga tambahan) dan catatan.
- FR-04: Keranjang tersimpan di Zustand + persist localStorage per outlet; edit qty, hapus item, subtotal live.
- FR-05: Form checkout (RHF + Zod): nama wajib, nomor meja atau tipe order (dine-in/take-away), WA opsional.
- FR-06: Server menghitung ulang total dari harga di database (tidak percaya harga dari client).
- FR-07: Metode bayar: QRIS (DOKU) atau bayar di kasir (opsional per outlet).
- FR-08: Halaman pembayaran menampilkan QR dari `qrContent`, nominal, hitung mundur kedaluwarsa, dan tombol "Buat QR baru".
- FR-09: Status order diperbarui lewat polling TanStack Query (`refetchInterval` 3 detik, berhenti pada status final).
- FR-10: Mode `demo`/`doku_sandbox` menampilkan banner jelas "MODE DEMO" dan tombol "Simulasikan Bayar".

**Payment (backend)**
- FR-11: Interface `PaymentProvider` (`createQris`, `queryStatus`, `verifyNotification`) dengan implementasi `DokuProvider` dan `DemoProvider`.
- FR-12: `DokuProvider.createQris` memanggil `POST /snap-adapter/b2b/v1.0/qr/qr-mpm-generate` dengan amount format `^\d{1,16}\.00$`, `partnerReferenceNo` = order code, dan `validityPeriod` (default 15 menit).
- FR-13: Header request DOKU: `X-PARTNER-ID`, `X-EXTERNAL-ID` (unik per hari), `X-TIMESTAMP`, `X-SIGNATURE`, `Authorization: Bearer <B2B token>`, `CHANNEL-ID: H2H`; signature mengikuti spesifikasi DOKU (HMAC-SHA512 atas stringToSign).
- FR-14: Token B2B DOKU di-cache in-memory sampai mendekati kedaluwarsa (tanpa Redis); renew otomatis.
- FR-15: Endpoint webhook notifikasi QRIS idempoten: menerima callback, memverifikasi, memanggil `qr-mpm-query` sebagai konfirmasi, lalu mengubah status order; balas HTTP 200.
- FR-16: Cron/interval fallback: order `PENDING_PAYMENT` yang belum final di-query ulang tiap menit dan kedaluwarsa sesuai waktu QR.
- FR-17: Kredensial DOKU disimpan per brand, terenkripsi (AES-256-GCM) di database.
- FR-18: Semua perubahan status pembayaran dicatat di tabel `PaymentEvent` (audit trail).

**Dashboard (login)**
- FR-19: Auth JWT (access + refresh httpOnly cookie), role: `SUPER_ADMIN`, `OWNER`, `CASHIER`.
- FR-20: Kasir: daftar order live (polling 5 detik), filter status, ubah status, tandai bayar tunai, toggle menu habis.
- FR-21: Owner: CRUD kategori/menu/opsi, upload foto, harga & ketersediaan per outlet, ringkasan harian.
- FR-22: Generator QR (PNG/PDF) per outlet dan per meja.
- FR-23: Super admin: CRUD brand/outlet/user, atur mode pembayaran per brand, impersonate-view brand (read-only).
- FR-24: Seed script: brand demo "Es Teh Zagoour Demo" 2 outlet, 20 menu, order contoh.

### 6.2 Non-Functional Requirements

- **Performa:** LCP < 2,5 dtk di 4G untuk halaman menu; menu di-prefetch server-side (HydrationBoundary); gambar via `next/image`, WebP, lazy.
- **Mobile-first:** didesain untuk layar 360–430px; tap target ≥ 44px; PWA-ready (manifest, tanpa offline wajib).
- **Keamanan:** validasi DTO (`whitelist`, `forbidNonWhitelisted`), rate limit pada endpoint publik (order & webhook), CORS terbatas, helmet, hash password argon2/bcrypt, verifikasi webhook, tidak ada secret di client.
- **Data privacy:** simpan data minimal pelanggan (nama, WA opsional); kebijakan retensi 12 bulan; tidak menyimpan data kartu/rekening.
- **Reliability:** webhook idempoten, pembuatan order memakai transaksi DB, unique constraint `(outletId, orderNumber per hari)`.
- **Observability:** log terstruktur (pino), request-id, error tracking dasar; health endpoint `/health`.
- **Accessibility:** kontras AA, label form, fokus terlihat, dukungan reduced-motion untuk animasi Motion.
- **Deploy:** Docker + Docker Compose, Coolify; CI GitHub Actions (lint, typecheck, test, build); env terpisah `development/staging/production`.
- **i18n:** UI Bahasa Indonesia; kode/komentar Inggris.

### 6.3 Tech Stack & Versi (diverifikasi dari dokumentasi resmi, 19 Okt 2026)

| Area | Pilihan | Catatan hasil cek dokumentasi |
|---|---|---|
| Frontend | Next.js latest (16.4 per rilis 6 Okt 2026), React sesuai peer dependency Next, App Router | Pasang via `create-next-app@latest`; jalankan update patch keamanan terbaru (ada security release 14 Okt 2026) |
| UI | Tailwind CSS + shadcn/ui | Init: `pnpm dlx shadcn@latest init -t next` |
| Animasi | `motion` (impor dari `motion/react`) | `npm install motion` |
| Notifikasi | Sonner (via komponen toast shadcn) | Verifikasi komponen saat setup |
| Server state | TanStack Query v5 | Pola prefetch + `HydrationBoundary`; jangan fetch data lewat Server Action, gunakan API |
| Client state | Zustand (+ persist) | Keranjang & UI state |
| Form | React Hook Form + Zod | Skema Zod dibagi lewat file kontrak |
| Backend | NestJS (v11) di Node ≥ 20.19 (disarankan Node 22 LTS) | CLI generator butuh Node 22.22.3+/24.15+/26+ |
| Validasi | `class-validator` + `class-transformer` global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })` | |
| ORM | **Prisma v7**, `provider = "prisma-client"`, `output = "../generated/prisma"`, driver adapter `@prisma/adapter-pg` | Config via `prisma.config.ts`; `datasource` tanpa `url` di schema, URL ada di config |
| DB | PostgreSQL | Tanpa Redis |
| Payment | DOKU SNAP QRIS MPM | Sandbox `https://api-sandbox.doku.com`, production `https://api.doku.com` |
| DevOps | Docker, Compose, Coolify, GitHub Actions | |

## 7. Arsitektur Ringkas

```
repo/
  frontend/   Next.js (customer web + dashboard)
  backend/    NestJS (REST API, webhook, cron)
  docker-compose.yml
```

**Backend modul (NestJS):** `auth`, `users`, `brands`, `outlets`, `menu` (categories, items, option groups), `orders`, `payments` (provider interface, doku, demo, webhook), `reports`, `qr`, `uploads`, `health`. Pola: **Controller → Service → Repository (Prisma)**, DTO terpisah, Guard (`JwtAuthGuard`, `RolesGuard`, `TenantGuard`).

**Model data inti (Prisma):** `Brand`, `Outlet`, `User`, `Category`, `MenuItem`, `OptionGroup`, `OptionChoice`, `OutletMenuItem` (harga/ketersediaan per outlet), `Order`, `OrderItem`, `OrderItemOption`, `Payment`, `PaymentEvent`, `BrandPaymentConfig`.

**Status order:** `PENDING_PAYMENT → PAID → PREPARING → READY → COMPLETED`; cabang `EXPIRED`, `CANCELLED`.

**Realtime tanpa Redis:** polling TanStack Query (customer 3 dtk, kasir 5 dtk). Upgrade ke SSE/WebSocket masuk backlog bila diperlukan.

## 8. Acceptance Criteria

**US-01/02/03 (menu)**
- [ ] Given QR outlet valid, When dibuka di HP, Then menu tampil < 2,5 dtk dengan kategori & foto.
- [ ] Given menu habis, Then item tampil abu-abu dan tombol tambah nonaktif.
- [ ] Given opsi wajib belum dipilih, When tambah ke keranjang, Then muncul error validasi.

**US-04/05/06 (checkout & bayar)**
- [ ] Given keranjang terisi, When checkout, Then server menghitung total dari DB dan menolak harga manipulasi.
- [ ] Given pilih QRIS, Then QR tampil dengan nominal benar dan countdown.
- [ ] Given pembayaran sukses (webhook/simulasi), Then status berubah `PAID` ≤ 5 detik di layar pelanggan tanpa refresh.
- [ ] Given QR kedaluwarsa, Then order `EXPIRED` dan tombol "Buat QR baru" membuat payment baru untuk order yang sama.
- [ ] Given webhook dikirim dua kali, Then status dan stok tidak berubah dua kali.
- [ ] Given keranjang terisi lalu koneksi putus & reload, Then keranjang tetap ada.

**US-07/08/09 (kasir)**
- [ ] Given order baru `PAID`, Then muncul di dashboard kasir ≤ 5 detik dengan indikator.
- [ ] Given kasir outlet A, Then tidak bisa melihat order outlet B (TenantGuard).
- [ ] Given kasir menandai menu habis, Then langsung tidak bisa dipesan pelanggan.

**US-10 s.d. 12 (owner)**
- [ ] Given owner menambah menu + foto, Then tampil di customer web tanpa deploy ulang.
- [ ] Given harga per outlet berbeda, Then customer outlet itu melihat harga outlet tersebut.
- [ ] Given ringkasan harian, Then angka order/omzet cocok dengan data order `PAID`/`COMPLETED`.
- [ ] Given generate QR meja, Then PNG/PDF terunduh dan link benar.

**US-13/14/15 (super admin)**
- [ ] Given super admin membuat brand+outlet+owner, Then owner bisa login dan melihat menu kosong.
- [ ] Given mode `demo`, Then tidak ada panggilan ke DOKU dan banner demo tampil.
- [ ] Given `pnpm seed` dijalankan, Then brand demo lengkap tersedia dan idempoten.

**Non-fungsional**
- [ ] CI hijau: lint, typecheck, unit test, build.
- [ ] Lighthouse mobile Performance ≥ 85 pada halaman menu.
- [ ] Tidak ada secret pada bundle frontend.

## 9. Risiko & Pertanyaan Terbuka (WAJIB dicek sebelum fase terkait)

1. **Akun DOKU:** QRIS DOKU hanya untuk Indonesian Business Account (verifikasi KTP untuk perorangan atau NPWP untuk korporat), aktivasi 1–2 hari kerja setelah dokumen terverifikasi. Cek apakah akun bigboss/NIB perorangan memenuhi syarat sebelum Phase 3.
2. **Dokumentasi DOKU yang belum terverifikasi:** endpoint pengambilan **B2B access token** dan **spesifikasi verifikasi signature notifikasi QRIS** tidak ditemukan pada halaman yang dicek (halaman integrasi SNAP QRIS dan halaman Notify QRIS legacy tidak memuat keduanya). Task `[BE]` terkait menandai "verifikasi di docs DOKU terbaru sebelum implementasi". Jangan menebak.
3. **Pemodelan multi-tenant per klien:** satu instance bersama (shared DB, kolom `brandId`) dipilih untuk MVP. Bila klien meminta isolasi, evaluasi deploy terpisah (Docker per klien) sebagai backlog.
4. **Jadwal vs scope:** scope "Full" besar. Rekomendasi eksekusi: setelah **Phase 2** (customer web + order + DemoProvider) web sudah cukup untuk direkam konten; Phase 3 (DOKU sandbox) dan Phase 4 (dashboard lengkap) menyusul tanpa memblokir konten.
5. **Legal/pajak:** kebijakan privasi dan syarat layanan sederhana untuk halaman publik (draft di Phase 6).

## 10. Out of Scope (MVP)

- Aplikasi mobile native, POS lengkap, integrasi printer thermal, manajemen stok bahan baku.
- Loyalty/voucher/promo kompleks, program poin.
- Pembayaran selain QRIS dan tunai (VA, e-wallet langsung, kartu).
- Delivery/ojek online, pickup scheduling.
- Redis, WebSocket/SSE, antrean job (BullMQ), multi-bahasa selain Indonesia.
- Fitur AI (`ai-service/`), rekomendasi menu.
- Laporan lanjutan (export akuntansi, multi-periode kompleks).
- Isolasi database per tenant.

---

## 11. Task List

> Aturan: Phase → Feature Group → Sub-task. Tiap sub-task atomik (satu file/fungsi/config). Tag: `[FE]` `[BE]` `[AI]` `[OPS]`. Total di bawah 400 task.

### Phase 0: Fondasi Repo & Tooling

**Feature Group 0.1: Repo & struktur**
- [ ] [OPS] Inisialisasi git repo dengan `.gitignore`, `.editorconfig`, `README.md`
- [ ] [OPS] Buat folder `frontend/` dan `backend/`
- [ ] [OPS] Tambah `.nvmrc` (Node 22 LTS) di root
- [ ] [OPS] Tambah `.env.example` root berisi semua variabel (tanpa nilai rahasia)

**Feature Group 0.2: Frontend scaffold**
- [ ] [FE] Jalankan `create-next-app@latest` di `frontend/` (TypeScript, App Router, Tailwind, alias `@/*`)
- [ ] [FE] Jalankan `pnpm dlx shadcn@latest init` dan atur tema warna brand demo
- [ ] [FE] Install `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`, `motion`
- [ ] [FE] Tambah komponen shadcn: button, input, sheet, dialog, tabs, badge, skeleton, sonner, form, select, checkbox, radio-group
- [ ] [FE] Buat `src/lib/query-client.ts` (helper QueryClient server/browser)
- [ ] [FE] Buat `src/app/providers.tsx` (QueryClientProvider + Toaster)
- [ ] [FE] Buat `src/lib/api-client.ts` (fetch wrapper tipe-aman + error handling)
- [ ] [FE] Buat `src/lib/env.ts` (validasi env publik dengan Zod)

**Feature Group 0.3: Backend scaffold**
- [ ] [BE] Jalankan `nest new backend` (TypeScript strict, pnpm)
- [ ] [BE] Install `class-validator`, `class-transformer`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `@nestjs/schedule`, `@nestjs/throttler`, `helmet`, `argon2`, `nestjs-pino`
- [ ] [BE] Konfigurasi `ValidationPipe` global di `main.ts` (`whitelist`, `forbidNonWhitelisted`, `transform`)
- [ ] [BE] Konfigurasi helmet, CORS, dan prefix `/api/v1` di `main.ts`
- [ ] [BE] Buat `config/env.validation.ts` (validasi env dengan Zod/class-validator)
- [ ] [BE] Buat `health/health.controller.ts` (`GET /health`)
- [ ] [BE] Buat `common/filters/http-exception.filter.ts` (format error seragam)

**Feature Group 0.4: Prisma v7**
- [ ] [BE] Install `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv`, `@types/pg`
- [ ] [BE] Buat `prisma/schema.prisma` dengan generator `provider = "prisma-client"` dan `output = "../generated/prisma"`
- [ ] [BE] Buat `prisma.config.ts` (schema path, migrations path, datasource url dari env)
- [ ] [BE] Buat `src/prisma/prisma.service.ts` (PrismaClient + `PrismaPg` adapter, lifecycle hooks)
- [ ] [BE] Buat `src/prisma/prisma.module.ts` (global module)

**Feature Group 0.5: Local dev & CI**
- [ ] [OPS] Buat `docker-compose.yml` dev (PostgreSQL + volume)
- [ ] [OPS] Buat `backend/Dockerfile` multi-stage
- [ ] [OPS] Buat `frontend/Dockerfile` multi-stage (standalone output)
- [ ] [OPS] Buat `.github/workflows/ci.yml` (lint, typecheck, test, build kedua app)

### Phase 1: Data Model, Auth & Tenancy

**Feature Group 1.1: Schema inti**
- [ ] [BE] Definisikan model `Brand` dan `Outlet` (slug unik) di schema
- [ ] [BE] Definisikan model `User` + enum `Role` (`SUPER_ADMIN`, `OWNER`, `CASHIER`) + relasi brand/outlet
- [ ] [BE] Definisikan model `Category`, `MenuItem`, `OptionGroup`, `OptionChoice`
- [ ] [BE] Definisikan model `OutletMenuItem` (harga override, `isAvailable`)
- [ ] [BE] Definisikan model `Order`, `OrderItem`, `OrderItemOption` + enum `OrderStatus`
- [ ] [BE] Definisikan model `Payment`, `PaymentEvent`, `BrandPaymentConfig` + enum `PaymentMode`
- [ ] [BE] Tambah index dan unique constraint (slug, orderNumber per outlet per hari, partnerReferenceNo)
- [ ] [BE] Jalankan migrasi `init` dan `prisma generate`

**Feature Group 1.2: Auth**
- [ ] [BE] Buat `auth/dto/login.dto.ts`
- [ ] [BE] Buat `auth/auth.service.ts` (validasi kredensial, terbit access+refresh token)
- [ ] [BE] Buat `auth/auth.controller.ts` (`login`, `refresh`, `logout`, `me`)
- [ ] [BE] Buat `auth/strategies/jwt.strategy.ts`
- [ ] [BE] Buat `auth/guards/jwt-auth.guard.ts`
- [ ] [BE] Buat `auth/guards/roles.guard.ts` + decorator `@Roles()`
- [ ] [BE] Buat `common/guards/tenant.guard.ts` (batasi akses per brand/outlet)
- [ ] [BE] Buat decorator `@CurrentUser()`

**Feature Group 1.3: Brand, outlet, user (super admin)**
- [ ] [BE] Buat DTO `create-brand.dto.ts` dan `create-outlet.dto.ts`
- [ ] [BE] Buat `brands/brands.service.ts` (create, list, update)
- [ ] [BE] Buat `brands/brands.controller.ts` (guard `SUPER_ADMIN`)
- [ ] [BE] Buat `outlets/outlets.service.ts` dan `outlets/outlets.controller.ts`
- [ ] [BE] Buat DTO `create-user.dto.ts` dan `users/users.service.ts`
- [ ] [BE] Buat `users/users.controller.ts` (guard role)

**Feature Group 1.4: Seed**
- [ ] [BE] Buat `prisma/seed.ts` (super admin dari env, idempoten)
- [ ] [BE] Tambah seed brand demo, 2 outlet, kategori, 20 menu + opsi
- [ ] [BE] Tambah script `pnpm seed` di `package.json`

### Phase 2: Customer Web — Menu, Keranjang, Order (DemoProvider)

**Feature Group 2.1: API menu publik**
- [ ] [BE] Buat DTO respons `public-menu.dto.ts`
- [ ] [BE] Buat `menu/public-menu.service.ts` (menu per outlet + override harga)
- [ ] [BE] Buat `menu/public-menu.controller.ts` (`GET /public/:brandSlug/:outletSlug/menu`)
- [ ] [BE] Tambah throttler pada controller publik

**Feature Group 2.2: Halaman menu**
- [ ] [FE] Buat `src/types/menu.ts` dan skema Zod respons menu
- [ ] [FE] Buat `src/features/menu/api.ts` (query function)
- [ ] [FE] Buat `src/app/[brandSlug]/[outletSlug]/page.tsx` (server prefetch + HydrationBoundary)
- [ ] [FE] Buat `src/features/menu/components/menu-header.tsx` (nama outlet, banner mode demo)
- [ ] [FE] Buat `src/features/menu/components/category-tabs.tsx`
- [ ] [FE] Buat `src/features/menu/components/menu-card.tsx`
- [ ] [FE] Buat `src/features/menu/components/menu-search.tsx`
- [ ] [FE] Buat `src/features/menu/components/menu-skeleton.tsx`
- [ ] [FE] Buat `src/features/menu/components/menu-detail-sheet.tsx` (opsi + catatan)
- [ ] [FE] Buat `src/features/menu/option-schema.ts` (Zod validasi opsi wajib)
- [ ] [FE] Buat hook `use-table-code.ts` (baca `?table=`)

**Feature Group 2.3: Keranjang**
- [ ] [FE] Buat `src/features/cart/cart-store.ts` (Zustand + persist per outlet)
- [ ] [FE] Buat `src/features/cart/price.ts` (hitung subtotal)
- [ ] [FE] Buat `src/features/cart/components/cart-bar.tsx` (bar bawah dengan animasi Motion)
- [ ] [FE] Buat `src/features/cart/components/cart-sheet.tsx` (edit qty/hapus)

**Feature Group 2.4: Pembuatan order**
- [ ] [BE] Buat `orders/dto/create-order.dto.ts` (item, opsi, tipe order, nama, meja)
- [ ] [BE] Buat `orders/pricing.service.ts` (hitung ulang total dari DB, validasi ketersediaan)
- [ ] [BE] Buat `orders/order-number.service.ts` (nomor urut per outlet per hari)
- [ ] [BE] Buat `orders/orders.service.ts` method `createOrder` (transaksi)
- [ ] [BE] Buat `orders/public-orders.controller.ts` (`POST /public/orders`, `GET /public/orders/:code`)
- [ ] [BE] Buat `payments/payment-provider.interface.ts`
- [ ] [BE] Buat `payments/providers/demo.provider.ts` (QR palsu + simulasi bayar)
- [ ] [BE] Buat `payments/payments.service.ts` (pilih provider per brand, buat Payment)
- [ ] [BE] Buat endpoint `POST /public/orders/:code/simulate-pay` (hanya mode demo/sandbox)

**Feature Group 2.5: Checkout & status (FE)**
- [ ] [FE] Buat `src/features/checkout/checkout-schema.ts` (Zod)
- [ ] [FE] Buat `src/app/[brandSlug]/[outletSlug]/checkout/page.tsx`
- [ ] [FE] Buat `src/features/checkout/components/checkout-form.tsx` (RHF)
- [ ] [FE] Buat `src/features/checkout/api.ts` (mutation create order)
- [ ] [FE] Buat `src/app/order/[code]/page.tsx` (status order)
- [ ] [FE] Buat `src/features/order/components/qris-panel.tsx` (QR, nominal, countdown)
- [ ] [FE] Buat `src/features/order/components/order-status-stepper.tsx`
- [ ] [FE] Buat `src/features/order/use-order-status.ts` (polling 3 dtk, stop saat final)
- [ ] [FE] Buat `src/features/order/components/demo-pay-button.tsx`
- [ ] [FE] Buat komponen error/empty/habis (`outlet-not-found.tsx`)

### Phase 3: Integrasi DOKU QRIS (Sandbox → Production)

**Feature Group 3.1: Riset & kredensial**
- [ ] [OPS] Daftar akun DOKU dan aktifkan sandbox, simpan Client ID/secret di secret manager
- [ ] [OPS] Cek kelayakan aktivasi QRIS production (KTP/NPWP, MCC, Brand Short Name)
- [ ] [BE] Verifikasi di dokumentasi DOKU terbaru: endpoint B2B access token dan format signature-nya (catat di `docs/doku-notes.md`)
- [ ] [BE] Verifikasi di dokumentasi DOKU terbaru: aturan verifikasi signature notifikasi QRIS (catat di `docs/doku-notes.md`)

**Feature Group 3.2: Client DOKU**
- [ ] [BE] Buat `payments/doku/doku.types.ts` (tipe request/respons)
- [ ] [BE] Buat `payments/doku/doku-signature.util.ts` (HMAC-SHA512 stringToSign + SHA-256 body)
- [ ] [BE] Buat unit test `doku-signature.util.spec.ts`
- [ ] [BE] Buat `payments/doku/doku-auth.service.ts` (ambil + cache token B2B in-memory)
- [ ] [BE] Buat `payments/doku/doku-http.client.ts` (header standar, timestamp, external-id harian)
- [ ] [BE] Buat `payments/providers/doku.provider.ts` method `createQris`
- [ ] [BE] Tambah `DokuProvider.queryStatus` (`qr-mpm-query`)
- [ ] [BE] Tambah method expire/cancel QR bila order dibatalkan
- [ ] [BE] Buat util `format-amount.ts` (angka ke `10000.00`)

**Feature Group 3.3: Konfigurasi per brand**
- [ ] [BE] Buat `crypto/encryption.service.ts` (AES-256-GCM)
- [ ] [BE] Buat DTO `update-payment-config.dto.ts`
- [ ] [BE] Buat `payments/payment-config.service.ts` (simpan/ambil kredensial terenkripsi)
- [ ] [BE] Buat `payments/payment-config.controller.ts` (guard `SUPER_ADMIN`)
- [ ] [BE] Update `payments.service.ts` agar memilih `DemoProvider`/`DokuProvider` sesuai `PaymentMode`

**Feature Group 3.4: Webhook & rekonsiliasi**
- [ ] [BE] Buat DTO `doku-notification.dto.ts`
- [ ] [BE] Buat `payments/webhooks/doku-webhook.controller.ts` (balas 200, tanpa guard JWT)
- [ ] [BE] Buat `payments/webhooks/doku-webhook.service.ts` (verifikasi, query konfirmasi, idempoten)
- [ ] [BE] Buat `payments/payment-events.service.ts` (catat `PaymentEvent`)
- [ ] [BE] Buat `payments/payment-reconcile.task.ts` (cron tiap menit: query ulang pending)
- [ ] [BE] Buat `orders/order-expiry.task.ts` (kedaluwarsakan order pending)
- [ ] [BE] Buat endpoint `POST /public/orders/:code/regenerate-qr`
- [ ] [BE] Buat unit test `doku-webhook.service.spec.ts` (duplikat & signature salah)
- [ ] [FE] Tambah tombol "Buat QR baru" di `qris-panel.tsx`

**Feature Group 3.5: Uji end-to-end sandbox**
- [ ] [BE] Buat e2e test alur order → QR → notifikasi → PAID dengan DOKU di-mock
- [ ] [OPS] Daftarkan URL webhook staging di dashboard DOKU sandbox
- [ ] [OPS] Uji manual satu order sandbox end-to-end dan catat hasil di `docs/doku-notes.md`

### Phase 4: Dashboard Kasir & Owner

**Feature Group 4.1: Auth FE**
- [ ] [FE] Buat `src/features/auth/login-schema.ts`
- [ ] [FE] Buat `src/app/(dashboard)/login/page.tsx` dan `login-form.tsx`
- [ ] [FE] Buat `src/features/auth/session.ts` (hook sesi, refresh)
- [ ] [FE] Buat `src/middleware.ts` (proteksi route dashboard)
- [ ] [FE] Buat `src/app/(dashboard)/layout.tsx` (sidebar + role-based nav)

**Feature Group 4.2: Kasir**
- [ ] [BE] Buat `orders/staff-orders.controller.ts` (list/filter order outlet, `PATCH status`)
- [ ] [BE] Buat DTO `update-order-status.dto.ts` + aturan transisi status
- [ ] [BE] Buat endpoint tandai bayar tunai (`POST /staff/orders/:id/cash-paid`)
- [ ] [BE] Buat endpoint toggle ketersediaan menu per outlet
- [ ] [FE] Buat `src/app/(dashboard)/orders/page.tsx` (daftar live)
- [ ] [FE] Buat `src/features/staff-orders/components/order-card.tsx`
- [ ] [FE] Buat `src/features/staff-orders/use-live-orders.ts` (polling 5 dtk + bunyi order baru)
- [ ] [FE] Buat `src/features/staff-orders/components/status-actions.tsx`
- [ ] [FE] Buat `src/app/(dashboard)/availability/page.tsx` (toggle menu habis)

**Feature Group 4.3: Manajemen menu (owner)**
- [ ] [BE] Buat DTO + `categories.service.ts` + `categories.controller.ts`
- [ ] [BE] Buat DTO + `menu-items.service.ts` + `menu-items.controller.ts`
- [ ] [BE] Buat DTO + service untuk `option-groups` dan `option-choices`
- [ ] [BE] Buat endpoint override harga/ketersediaan per outlet
- [ ] [BE] Buat `uploads/uploads.service.ts` (validasi tipe/ukuran, simpan ke volume/S3-compatible)
- [ ] [BE] Buat `uploads/uploads.controller.ts`
- [ ] [FE] Buat `src/app/(dashboard)/menu/page.tsx` (tabel menu)
- [ ] [FE] Buat `src/features/menu-admin/menu-form.tsx` (RHF + Zod, opsi dinamis)
- [ ] [FE] Buat `src/features/menu-admin/category-manager.tsx`
- [ ] [FE] Buat `src/features/menu-admin/image-uploader.tsx`
- [ ] [FE] Buat `src/features/menu-admin/outlet-override-table.tsx`

**Feature Group 4.4: Laporan & QR**
- [ ] [BE] Buat `reports/reports.service.ts` (ringkasan harian: order, omzet, % QRIS)
- [ ] [BE] Buat `reports/reports.controller.ts`
- [ ] [BE] Buat `qr/qr.service.ts` (generate PNG link outlet/meja)
- [ ] [BE] Buat `qr/qr.controller.ts` (unduh PNG/PDF)
- [ ] [FE] Buat `src/app/(dashboard)/reports/page.tsx` (kartu ringkasan)
- [ ] [FE] Buat `src/app/(dashboard)/qr/page.tsx` (pilih outlet/meja, unduh)

**Feature Group 4.5: Super admin**
- [ ] [FE] Buat `src/app/(dashboard)/admin/brands/page.tsx` (daftar & buat brand)
- [ ] [FE] Buat `src/features/admin/brand-form.tsx`
- [ ] [FE] Buat `src/features/admin/outlet-form.tsx`
- [ ] [FE] Buat `src/features/admin/user-form.tsx`
- [ ] [FE] Buat `src/features/admin/payment-config-form.tsx` (mode + kredensial DOKU)

### Phase 5: Polish, Konten-Ready & UX

**Feature Group 5.1: UX & animasi**
- [ ] [FE] Tambah animasi Motion transisi sheet, item masuk keranjang, stepper (hormati reduced-motion)
- [ ] [FE] Tambah toast Sonner untuk aksi sukses/gagal global
- [ ] [FE] Tambah halaman `not-found.tsx` dan `error.tsx` ramah pengguna
- [ ] [FE] Tambah `manifest.webmanifest` dan ikon PWA
- [ ] [FE] Tambah metadata SEO + OG image halaman demo

**Feature Group 5.2: Landing demo**
- [ ] [FE] Buat `src/app/page.tsx` (landing singkat: apa ini, tombol "Coba Demo", CTA WhatsApp)
- [ ] [FE] Buat tombol salin link demo dan tampilan QR demo di landing

**Feature Group 5.3: Kualitas**
- [ ] [FE] Tambah unit test `price.ts` dan `option-schema.ts`
- [ ] [FE] Tambah Playwright e2e alur pelanggan (menu → checkout → simulasi bayar)
- [ ] [BE] Tambah unit test `pricing.service.spec.ts`
- [ ] [BE] Tambah unit test transisi status order
- [ ] [FE] Audit Lighthouse mobile dan perbaiki temuan utama

### Phase 6: Deploy & Go-Live

**Feature Group 6.1: Deploy staging/produksi**
- [ ] [OPS] Siapkan server/Coolify project, domain, dan SSL
- [ ] [OPS] Buat resource PostgreSQL terkelola + jadwal backup harian
- [ ] [OPS] Set environment variable produksi di Coolify (secret terpisah dari repo)
- [ ] [OPS] Atur deploy otomatis dari branch `main` via GitHub Actions/Coolify webhook
- [ ] [OPS] Jalankan migrasi (`prisma migrate deploy`) pada tahap release
- [ ] [OPS] Jalankan seed demo di staging dan produksi
- [ ] [OPS] Pasang uptime monitor pada `/health`

**Feature Group 6.2: Go-live outlet sendiri**
- [ ] [OPS] Buat brand + outlet es teh sendiri lewat dashboard
- [ ] [OPS] Input menu asli dan foto
- [ ] [OPS] Cetak QR meja (hasil generator) dan pasang di outlet
- [ ] [OPS] Aktifkan mode `doku_live` setelah akun QRIS terverifikasi
- [ ] [OPS] Tes 1 transaksi nyata nominal kecil dan catat hasil

**Feature Group 6.3: Dokumen pendukung**
- [ ] [FE] Buat halaman `/privacy` dan `/terms` sederhana
- [ ] [OPS] Buat `docs/runbook.md` (deploy, rollback, rotasi secret, cek webhook)
- [ ] [OPS] Buat `docs/onboarding-klien.md` (langkah setup klien ≤ 3 hari)

---

## 12. Urutan Eksekusi untuk AI Coding Agent

1. Kerjakan fase berurutan; satu Feature Group per sesi, commit per Feature Group.
2. Sebelum menyentuh library tertentu, fetch ulang dokumentasi resminya (versi bisa berubah).
3. Jangan memakai `any` tanpa alasan; semua DTO berupa class, tipe respons dibagi lewat skema Zod di FE.
4. Jika menemukan informasi yang kurang (terutama DOKU token dan verifikasi notifikasi), berhenti dan tanya bigboss, jangan berasumsi.
5. Milestone konten: **akhir Phase 2** → bisa rekam demo; **akhir Phase 3** → demo QRIS sandbox; **akhir Phase 6** → siap klien.

Total task: ±165 (di bawah batas 400).
