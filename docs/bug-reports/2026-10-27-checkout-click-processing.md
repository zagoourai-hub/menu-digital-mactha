# Review bug klik dan pemrosesan checkout

- **Tanggal:** 27 Oktober 2026.
- **Lingkungan:** Chrome melalui Playwright MCP isolated, HTTPS ngrok, Midtrans sandbox.
- **Scope:** klik ganda, perubahan keranjang saat pending, kondisi setelah PAID,
  dan batas jumlah produk. Reproduksi awal dipertahankan sebagai riwayat;
  hasil perbaikan dicatat di bawah.
- **Asumsi beban:** penggunaan interaktif satu kedai; bukan uji beban multi-user.
- **Kesimpulan:** tiga bug UI/alur checkout terkonfirmasi. Klik ganda terlindungi
  pada kasus yang diuji, dan notifikasi pembayaran otomatis tetap berhasil.
- **Status akhir:** CLICK-001, CLICK-002, dan CLICK-003 **RESOLVED**, lulus
  pengujian ulang otomatis dan browser setelah perbaikan.

## Temuan awal

### CLICK-001 — Item yang sudah dibayar masih berada di keranjang

**Prioritas:** P2 / Sedang.

**Lokasi:**
[`frontend/components/payment-status.tsx:48`](../../frontend/components/payment-status.tsx#L48)
dan [`frontend/lib/stores/order.store.ts:42`](../../frontend/lib/stores/order.store.ts#L42).

**Perilaku dan masalah:** setelah PAID terverifikasi, efek pada halaman status
hanya menghapus key checkout di sessionStorage. Item di Zustand/localStorage tetap
ada. Pada transaksi sandbox nyata satu Brown Sugar Signature, status sudah PAID
dan key checkout sudah hilang, tetapi keranjang masih memiliki satu item tersebut.

**Reproduksi:**

1. Tambahkan satu Brown Sugar Signature ke keranjang dan checkout.
2. Selesaikan pembayaran melalui simulator sandbox.
3. Buka halaman status transaksi pada sesi checkout yang sama dan tunggu
   **Pembayaran berhasil**.
4. Periksa badge keranjang dan kembali ke checkout: item yang dibayar masih ada.

**Bukti runtime:** `afterPaid.cart = [{ id: 1, quantity: 1 }]`,
`afterPaid.checkoutKeyCleared = true`. Pembayaran dan webhook otomatis sudah
berhasil; data ini bukan fixture order PAID buatan.

**Perbaikan terkecil:** setelah PAID terverifikasi, hapus/kurangi item sesuai
snapshot order yang dibayar. Pertahankan item baru yang ditambahkan setelah
checkout; jangan mengosongkan semua isi keranjang tanpa pemeriksaan.

**Jika dibiarkan:** checkout berikutnya dapat mengirim ulang keranjang lama
sebagai order baru karena key idempotensi sebelumnya telah dihapus. Ini bukan
bukti charge otomatis ganda, tetapi dapat memicu pemesanan ulang yang tidak disengaja.

**Artefak:** `frontend/test-results/click-processing-review/paid-cart-remains.png`.

### CLICK-002 — Keranjang masih dapat diubah ketika request pembayaran berjalan

**Prioritas:** P2 / Sedang.

**Lokasi:**
[`frontend/app/checkout/page.tsx:51`](../../frontend/app/checkout/page.tsx#L51),
[`frontend/app/checkout/page.tsx:222`](../../frontend/app/checkout/page.tsx#L222),
dan [`frontend/components/order-quantity.tsx:28`](../../frontend/components/order-quantity.tsx#L28).

**Perilaku dan masalah:** tombol bayar dan radio metode dikunci saat pending,
tetapi tombol kuantitas serta input nama masih aktif. Payload sudah disalin saat
submit, sehingga perubahan berikutnya hanya mengubah tampilan keranjang, bukan
pesanan yang sedang dikirim.

**Reproduksi:**

1. Checkout satu produk dengan nama pemesan valid.
2. Perlambat koneksi/request payment, lalu klik bayar.
3. Saat tombol bertuliskan **Memproses pembayaran…**, klik tambah jumlah.
4. Tampilan menjadi dua item, sedangkan request yang sudah dikirim tetap satu.

**Bukti runtime:** request dikirim dengan quantity 1; setelah klik tambah ketika
pending, quantity tampilan/localStorage menjadi 2. Tombol kuantitas dan input nama
masih enabled. Pada probe, request ditahan sementara di lapisan jaringan Playwright
untuk mengamati kondisi pending, kemudian diteruskan ke API sebenarnya tanpa
mengganti respons. Quantity dikembalikan lewat UI sebelum transaksi diselesaikan.

**Perbaikan terkecil:** kunci kontrol pengeditan checkout/keranjang selama pending,
termasuk jalur edit lain yang menggunakan store yang sama, atau tampilkan snapshot
pesanan yang benar-benar dikirim agar perubahan tidak terlihat sebagai bagian dari
transaksi yang sedang diproses.

**Jika dibiarkan:** pelanggan melihat jumlah/total berbeda dari transaksi yang
sedang dibuat di Midtrans dan dapat mengira perubahan tersebut sudah tersimpan.

**Artefak:** `frontend/test-results/click-processing-review/pending-editable.png`.

### CLICK-003 — UI membolehkan quantity 100, API hanya menerima maksimal 99

**Prioritas:** P2 / Sedang.

**Lokasi:**
[`frontend/lib/stores/order.store.ts:57`](../../frontend/lib/stores/order.store.ts#L57),
[`frontend/lib/stores/order.store.ts:62`](../../frontend/lib/stores/order.store.ts#L62),
[`frontend/components/order-quantity.tsx:28`](../../frontend/components/order-quantity.tsx#L28),
dan [`frontend/lib/schemas/payment.schema.ts:18`](../../frontend/lib/schemas/payment.schema.ts#L18).

**Perilaku dan masalah:** tombol tambah dan store tidak memiliki batas atas.
Quantity 100 tetap ditampilkan dan tombol bayar aktif, tetapi server menolak
request tersebut karena schema membatasi quantity ke 99. UI hanya menampilkan
pesan umum `Data pesanan tidak valid.`.

**Reproduksi:**

1. Pada checkout yang memiliki satu produk quantity 1, klik tambah 99 kali.
2. Isi nama pemesan dan klik bayar.
3. UI menampilkan quantity 100; API mengembalikan HTTP 400.

**Bukti runtime:** `quantityLimit = 100`,
`quantityResponse = { quantity: 100, status: 400 }`.

**Perbaikan terkecil:** terapkan batas 99 pada `addItem`, `setQuantity`, dan
validasi state tersimpan; nonaktifkan tombol tambah saat batas tercapai. Pertahankan
validasi server dan tampilkan alasan batas jumlah yang mudah dipahami pengguna.

**Jika dibiarkan:** pengguna dapat menyusun keranjang lewat klik normal yang
tidak mungkin dibayar, tanpa petunjuk jelas tentang bagian yang harus diperbaiki.

**Artefak:** `frontend/test-results/click-processing-review/quantity-100-rejected.png`.

## Pemeriksaan yang lulus

- Klik ganda tombol bayar menghasilkan satu request checkout dan satu order baru.
- Request checkout yang diteruskan ke server asli mengembalikan HTTP 201.
- Transaksi sandbox selesai dan webhook otomatis mengubah order ke PAID.
- Request quantity 100 ditolak HTTP 400; tidak dilakukan pembayaran kedua.

## Bukti dan batas pengujian

Laporan JSON dan probe yang dipakai tersedia pada
`frontend/test-results/click-processing-review/`. Folder ini diabaikan Git; lampirkan
artefaknya bila laporan dibagikan ke luar workspace. Tidak ada secret atau Server
Key yang dicantumkan.

Probe tidak mengamati perpindahan otomatis Snap kembali ke aplikasi dalam jendela
12 detik, lalu membuka URL status order yang sebenarnya pada sesi yang sama untuk
memeriksa efek PAID. Hal ini belum cukup untuk menetapkan bug redirect tersendiri;
perlu pemeriksaan tombol/kondisi selesai pada Snap sebelum menyimpulkannya.

Belum diperiksa: beban tinggi, race multi-tab, browser lain, refund, dan transaksi
production. Tidak ada dana nyata yang digunakan.

## Perbaikan 27 Oktober 2026

- **CLICK-001:** snapshot ID/jumlah disimpan per checkout. PAID terverifikasi
  mengurangi jumlah yang dibayar satu kali, mempertahankan produk/jumlah tambahan,
  dan mengonsumsi snapshot agar reload tidak mengulang pengurangan.
- **CLICK-002:** status proses dipindahkan ke store bersama. Fieldset checkout,
  tombol sidebar, katalog, dan detail dikunci selama request; store juga menolak
  perubahan jumlah pada kondisi tersebut.
- **CLICK-003:** konstanta batas 99 digunakan bersama schema server dan store.
  Semua tombol tambah dinonaktifkan di batas tersebut; kuantitas lama yang
  tersimpan di atas batas dinormalisasi saat rehidrasi.

Validasi otomatis: **18 test lulus**, mencakup keranjang kosong sesudah PAID,
tambahan produk, replay/reload, beberapa snapshot pending, penguncian, data lama,
serta suite API/webhook. `pnpm typecheck` dan `pnpm build` lulus. Lint tanpa error;
warning existing dan artefak test dicatat, tanpa warning baru pada source perubahan.

Order lama tanpa snapshot lokal tidak dibersihkan otomatis karena jumlah yang
dibayar tidak dapat ditentukan dengan aman dari status publik.

Pengujian ulang Playwright MCP pada sesi Chrome isolated: **semua lulus**.

- Input nama/telepon, kuantitas checkout, serta tambah/kurang sidebar dinonaktifkan
  ketika request pembayaran ditahan. Klik ganda menghasilkan satu request nyata.
- Pembayaran QRIS sandbox selesai; webhook otomatis mengonfirmasi PAID tanpa
  replay manual. Keranjang awal satu produk ditambah menjadi dua produk sebelum
  konfirmasi: setelah PAID hanya satu unit yang dibayar dihapus, tersisa
  `[{ id: 1, quantity: 1 }, { id: 2, quantity: 1 }]`.
- Reload halaman PAID tidak mengurangi keranjang lagi; snapshot sudah dikonsumsi.
- Klik tambah sampai 99 mengunci tombol checkout, katalog, dan detail produk.

Artefak pengujian ulang: `frontend/test-results/click-processing-fixed/report.json`,
`pending-locked.png`, `paid-additions-preserved.png`, dan `quantity-capped.png`.
Folder artefak diabaikan Git. Timeout runner awal diperbaiki dengan memfokuskan
tab aktif dan menyesuaikan waktu uji; pengujian ulang lengkap selesai dengan sukses.

Pengujian mencakup tambahan keranjang dari tab kedua sebelum membuka status;
race penulisan beberapa tab secara bersamaan belum diuji menyeluruh. Pembayaran
production dan beban tinggi belum diuji. Tidak ada dana nyata yang digunakan.
