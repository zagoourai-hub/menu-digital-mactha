# Payment dan webhook Midtrans

Keputusan pengguna 26 Oktober 2026: lanjutkan Midtrans dari kode existing,
menggantikan rencana DOKU pada scope payment ini. Implementasi memakai Next.js
Route Handler pada aplikasi existing, SQLite, dan SDK Node.js resmi `midtrans-client`
1.4.3 yang sudah terpasang. SDK dipindahkan dari devDependencies ke dependencies
produksi tanpa menambah package baru. Snap dibuat dengan `new midtransClient.Snap`,
checkout memanggil `snap.createTransaction`, dan konfirmasi webhook memanggil
`snap.transaction.status`. HTTP client SDK diberi timeout 10 detik dan redirect
dinonaktifkan. Deklarasi tipe lokal hanya mencakup API SDK yang dipakai karena SDK
ini tidak menyertakan tipe TypeScript; respons tetap divalidasi dengan Zod.
Dokumen PRD/arsitektur lama tetap menjadi referensi fitur lain yang belum dibangun.

## Konfigurasi

Gunakan `frontend/.env.example` sebagai referensi, lalu tambahkan variabel yang
dibutuhkan ke `.env` lokal tanpa menimpa konfigurasi existing:

- `MIDTRANS_SERVER_KEY`: Server Key sandbox dari dashboard Midtrans; hanya server.
- `MIDTRANS_IS_PRODUCTION=false`: sandbox secara default.
- Key sandbox harus memakai format `SB-Mid-server-...`; production memakai
  `Mid-server-...`. Client Key dan key yang tidak sesuai mode ditolak sebelum
  order dibuat. Format valid tetap memerlukan kredensial aktif dari Midtrans.
- `APP_URL=http://localhost:3001`: origin aplikasi untuk callback selesai. Saat memakai
  tunnel HTTPS, ganti dengan origin tunnel dan buka checkout dari origin tersebut.
- `DATABASE_URL`: SQLite existing. `BETTER_AUTH_*` tetap mengikuti konfigurasi auth.

Client Key tidak dibutuhkan karena checkout memakai Snap Redirect.
Aktifkan QRIS GoPay atau ShopeePay di akun Midtrans agar `other_qris` tersedia;
VA dan e-wallet juga memerlukan aktivasi pada merchant.

Dari `frontend/`:

```powershell
pnpm exec prisma migrate deploy --config prisma7.config.ts
pnpm exec prisma generate --config prisma7.config.ts
pnpm dev
```

Migrasi `20261026070000_add_payment_orders` hanya menambah `Order`, snapshot
`OrderItem`, dan `PaymentEvent` beserta indeks; tidak menghapus data existing.
Jangan jalankan reset database. Untuk produksi, backup database, gunakan persistent
volume dan HTTPS, lalu atur kredensial production secara terpisah. Belum ada deploy
produksi yang dilakukan.

Di dashboard Midtrans sandbox, atur **Settings → Configuration → Payment
Notification URL** ke `https://<domain-publik>/api/payment/webhook`. Midtrans harus
bisa mengakses URL ini tanpa login. Localhost memerlukan tunnel HTTPS. Finish URL
ditentukan per transaksi ke `/payment/<orderId>`.

## Route

- `POST /api/payment`: JSON `{ checkoutKey, customerName, phone, note, method, items }`.
  `checkoutKey` adalah UUID; `items` berisi `{ id, quantity }`. `method` berupa `qris`,
  `ewallet`, atau `bank`. Nama wajib, telepon dan catatan opsional. Harga selalu
  dibaca dari produk published di database. Request harus memiliki header Origin
  yang sama dengan URL aplikasi. Batas body 16 KiB, maksimal 99 produk unik dan
  quantity 99 per produk. Respons 201 berisi `orderId`, `token`, `redirectUrl`,
  `statusUrl`. Pengulangan payload dengan key sama mengembalikan order yang sama;
  key sama untuk payload berbeda menghasilkan 409. Kuota global persisten 30
  order baru/menit menghasilkan 429 sebelum memanggil Snap.
  Konfigurasi URL/key/mode yang tidak valid menghasilkan 503 dengan code
  `PAYMENT_NOT_CONFIGURED` dan pesan aman, tanpa membuat order atau memanggil
  provider. `APP_URL` hanya menerima HTTP/HTTPS; production wajib HTTPS.
- `POST /api/payment/webhook`: verifikasi SHA-512 signature secara constant-time,
  cocokkan nominal dan identitas transaksi, lalu query Status API Midtrans.
  `transaction_status` pada callback tidak dipercaya sendirian karena tidak
  dicakup signature. Update status dan audit event dilakukan dalam transaksi;
  notifikasi duplikat tidak menggandakan event. Status PAID tidak mundur menjadi
  pending/gagal; refund penuh final. Provider/DB gagal menghasilkan 503 agar
  notifikasi dapat diulang. Payload atau nominal salah 400, signature salah 403,
  order tidak dikenal 404; notifikasi terverifikasi yang selesai diproses 200.
- `GET /api/payment/<orderId>`: hanya `id`, `total`, `status`, tanpa cache.
  UUID acak pada order ID bertindak sebagai akses terbatas status, tanpa nama,
  telepon, item, token, atau URL pembayaran. Jangan membagikan URL status.
- `/payment/<orderId>`: status dari database, polling setiap 3 detik selama pending.
  Query parameter callback browser tidak pernah menandai order lunas.

Checkout menyimpan hash payload dan UUID idempotensi di sessionStorage, tanpa
kontak pelanggan. Menekan ulang checkout yang sama setelah reload tidak membuat
charge baru. Mengubah keranjang/data checkout menghasilkan key baru. Pilihan tunai
tetap terlihat tetapi belum aktif.
Snapshot ID/jumlah produk per order disimpan bersama keranjang di localStorage.
Setelah halaman status mengonfirmasi PAID, jumlah yang dibayar dikurangi satu kali
dan key idempotensi dihapus. Produk atau tambahan jumlah setelah checkout tetap
tersimpan. Order lama tanpa snapshot lokal tidak menghapus keranjang secara otomatis.
Selama request checkout berjalan, input dan perubahan keranjang dikunci melalui
store bersama. Batas 99 per produk berlaku pada store, data tersimpan, dan tombol
checkout/katalog/detail; validasi server tetap berlaku.

## Kegagalan dan batasan

Jika create Snap timeout atau respons gagal disimpan, order tetap disimpan dan
request dengan key yang sama tidak mengirim create Snap kedua. Halaman status
meminta pelanggan menghubungi kasir sebelum membuat pesanan baru. Rekonsiliasi
otomatis dan pemulihan URL Snap belum tersedia; kasir perlu mengecek order ID di
dashboard Midtrans bila status tertahan. Endpoint publik tidak melakukan query
provider sehingga polling tidak menambah panggilan berbayar.

Kuota masih global untuk satu kedai; belum ada limiter per pelanggan/outlet atau
perlindungan volumetrik di edge. Dashboard Order Masuk menampilkan pesanan dan
proses operasionalnya sesuai [akses pemilik/karyawan](dashboard-access.md).
Refund diproses melalui dashboard Midtrans lalu diterima lewat webhook;
aplikasi belum menyediakan tombol refund, pengurangan stok, atau cron rekonsiliasi.
Penghapusan/anonimisasi kontak sesuai kebijakan retensi perlu ditambahkan sebelum
peluncuran publik.

## Validasi

```powershell
node --import tsx --test tests/payment.test.mjs tests/order-store.test.mjs
pnpm lint
pnpm typecheck
pnpm build
```

Test membutuhkan Node.js yang mendukung `node:sqlite` (divalidasi pada Node 26),
memakai SQLite sementara dan seluruh migrasi repository, serta mock API Midtrans.
Database aplikasi dan kredensial asli tidak dipakai oleh test. Cakupan: input dan
origin, harga server, snapshot order, retry/concurrency, signature palsu, nominal
salah, status callback palsu, provider gagal, webhook duplikat, status tidak mundur,
refund, timeout create Snap, kuota, dan respons publik tanpa kontak pelanggan.
Test store mencakup batas jumlah, penguncian, rehidrasi snapshot, serta pembersihan
PAID satu kali yang mempertahankan tambahan keranjang.

Uji sandbox nyata masih diperlukan: buat order → bayar melalui simulator Midtrans
→ pastikan webhook 200 → status PAID tampil. Lakukan juga pending, expire, cancel,
dan pengiriman ulang notifikasi dari dashboard sebelum produksi.

Referensi resmi:
[Snap backend](https://docs.midtrans.com/reference/backend-integration),
[notifikasi dan signature](https://docs.midtrans.com/docs/https-notification-webhooks),
[Status API](https://docs.midtrans.com/reference/get-transaction-status),
[Other QRIS](https://docs.midtrans.com/reference/other-qris).

Hasil validasi lokal 26 Oktober 2026: 10 test otomatis lulus, typecheck dan build
lulus. Lint tanpa error dengan 6 warning existing di luar perubahan payment.
Migrasi diterapkan ke SQLite lokal. Smoke HTTP production build: landing,
checkout, `/api/menus`, dan halaman status mengembalikan 200; order tidak dikenal
menghasilkan 404; JSON rusak ditolak 400 pada payment dan webhook. Pemeriksaan
visual browser, category filtering interaktif, dan transaksi sandbox nyata belum
dijalankan.

## Pengujian browser melalui MCP terpisah

Pada 26 Oktober 2026, Playwright MCP global diuji lewat proses baru dengan
`--browser chrome --headless --isolated`, tanpa menyentuh koneksi extension dan
tab yang dipakai agent lain. Tidak ada dependency Playwright lokal yang ditambahkan.
Server Next.js khusus pengujian memakai port 3102.

```powershell
pnpm exec next start -p 3102
# Di terminal lain, berikan lokasi cli.js dari instalasi MCP global yang tersedia:
node tests/run-checkout-mcp.mjs <path-ke-playwright-mcp-cli.js>
```

Runner memakai fixture katalog existing `Signature`/`Brown Sugar Signature`,
menjalankan interaksi UI sebenarnya, dan menyimpan hasil di
`frontend/test-results/checkout/report.json`, `desktop.png`, serta `mobile.png`.
Folder hasil diabaikan Git. Exit 0 berarti assertion UI berhasil; periksa juga
entri `BLOCKED` karena checkout gateway dapat belum terkonfigurasi.

Hasil: **9 pemeriksaan PASS, 1 BLOCKED**. Filter kategori, tambah item, kuantitas,
total Rp36.000 untuk dua item, persistensi setelah reload, validasi nama/telepon,
pilihan metode, tampilan error payment, layout lebar 390px, serta error status
order tidak dikenal berhasil diperiksa. Tidak ada uncaught JavaScript error atau
respons HTTP gagal di luar kasus yang sedang diuji.

Create payment mengembalikan HTTP 503. Pemeriksaan konfigurasi lokal menunjukkan
`APP_URL` belum diisi dan Server Key yang tersedia belum dikenali sebagai key
sandbox berawalan `SB-`. Nilai kredensial tidak dicetak atau diubah. Belum ada
transaksi Midtrans nyata, penerimaan webhook sandbox, ataupun perpindahan ke PAID
yang diverifikasi melalui browser. Isi `APP_URL`, pastikan mode dan key sandbox
sesuai, lalu ulangi alur gateway sebelum menyatakan integrasi end-to-end lulus.

## Verifikasi sandbox setelah konfigurasi diperbaiki

Pada 26 Oktober 2026, dengan key sandbox baru dan server direstart, Playwright
berhasil membuat checkout HTTP 201, membuka Snap sandbox, dan menunggu gambar QRIS
selesai dimuat. QR diuji lewat simulator resmi Midtrans hingga PAID; Status API
mengonfirmasi `settlement` untuk total Rp36.000.

Webhook lokal diuji dengan replay manual respons bertanda tangan dari provider,
tanpa mengubah signature atau status. Handler membalas 200, menyimpan PAID dan satu
audit event; replay duplikat tetap 200 dengan jumlah event tetap satu. Halaman
status yang terbuka berubah otomatis ke **Pembayaran berhasil** tanpa reload.

Bukti tersimpan pada `frontend/test-results/sandbox-payment/`, diabaikan Git.
Delivery webhook otomatis dari internet belum diuji karena aplikasi masih berada
di localhost. Gunakan origin HTTPS publik dan atur Payment Notification URL pada
dashboard sandbox untuk memverifikasi delivery otomatis. Pengujian ini tidak
menggunakan dana nyata dan tidak memanggil API production.

## Verifikasi webhook otomatis melalui ngrok — 27 Oktober 2026

Setup HTTPS publik dan Payment notification URL pada dashboard sandbox selesai.
Playwright menguji transaksi baru lewat origin ngrok, membayarnya melalui
simulator QRIS, lalu mengamati halaman status berubah otomatis ke PAID.
Notification History Midtrans mencatat Pending dan Settlement sebagai Completed.
Database memiliki satu audit event PAID; tidak ada replay manual pada transaksi ini.

Lihat [panduan ngrok](ngrok.md) untuk konfigurasi, bukti lokal, dan cara menjalankan
kembali. Delivery otomatis yang sebelumnya belum terverifikasi kini sudah lulus
pada lingkungan sandbox. Setup production dan refund belum diuji.
