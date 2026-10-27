# Keuangan kedai

Fitur di `/dashboard/finance` melanjutkan role existing: `user` adalah karyawan,
`admin` adalah pemilik kedai. Semua laporan masih untuk satu kedai bersama.

## Menggunakan fitur

1. Buka **Keuangan**. Pilih Hari ini, Bulan ini, atau tanggal awal/akhir, maksimal
   31 hari inklusif. Semua batas tanggal menggunakan WIB (`Asia/Jakarta`).
2. Tambahkan **Penjualan langsung** untuk penjualan di luar aplikasi: isi **Harga
   per cup (Rp)** dan **Jumlah cup**. Total dihitung otomatis dan diperlihatkan
   sebelum disimpan, misalnya Rp5.001 × 5 cup = Rp25.005. Jangan masukkan lagi
   transaksi checkout online.
3. Gunakan **Pemasukan lain** untuk modal/lainnya, tanpa menambah jumlah cup.
4. Gunakan **Pengeluaran** untuk sewa, bahan baku, gaji, listrik/air, transportasi,
   refund, atau lainnya. Isi nominal total positif; keterangan opsional, maksimal
   500 karakter. Catatan boleh
   bertanggal lampau, tetapi tidak boleh di masa depan.
5. Pemilik melihat catatan yang sama secara langsung. Tidak ada langkah kirim
   atau approval. Tombol **Unduh PDF** tersedia untuk kedua role.

Nominal rupiah bulat dibatasi Rp1–Rp2.000.000.000 per catatan; penjualan langsung
memuat 1–1.000.000 cup. Server mengalikan harga per cup dengan jumlah cup dan
memeriksa batas total setelah perkalian; total yang dikirim browser tidak dipercaya.
Tanggal/kategori/nominal divalidasi kembali di server.
Tiap penyimpanan memakai ID unik agar pengulangan request tidak menggandakan data.
Identitas pencatat dan lingkungan data ditetapkan server, bukan input browser.

## Koreksi dan riwayat

Karyawan hanya menambah catatan. Pemilik membuka **Koreksi / batalkan** pada
catatan, mengisi alasan minimal tiga karakter, kemudian menyimpan koreksi atau
membatalkan. Riwayat menampilkan pelaku, waktu, alasan dan perubahan nilai yang
mudah dibaca. Data sebelum/sesudah tetap tersimpan untuk audit.

Pembatalan tidak menghapus catatan; statusnya ditampilkan dan nilainya dikeluarkan
dari total. Catatan batal tidak dapat diubah/diaktifkan kembali. Bila perlu,
buat catatan pengganti. Pemeriksaan versi atomik menolak perubahan yang menimpa
koreksi pengguna lain. Riwayat juga tetap menyimpan identitas pencatat bila akun
karyawan kemudian dihapus lewat administrasi auth.

Catatan penjualan langsung lama tidak otomatis dikalikan. Kolom `unitPrice`
ditambahkan melalui migrasi `20261028000000_add_cash_unit_price` dengan nilai
awal `null`. Nilai `amount` lama tetap bermakna total. Untuk koreksi seperti
Rp5.001 yang sebenarnya harga per cup untuk lima cup, admin membuka catatan,
memilih **Gunakan harga per cup untuk koreksi catatan lama**, mengisi harga
Rp5.001 dan alasan, lalu menyimpan. Total menjadi Rp25.005 dengan riwayat audit.
Admin tetap dapat mengoreksi keterangan catatan lama tanpa mengubah nominalnya.
Catatan baru menyimpan harga per cup dan total, dan rincian perkalian tampil di
halaman serta PDF. Pengeluaran/pemasukan lain tetap memakai nominal total.

## Angka laporan

- **Penjualan online bruto:** nilai snapshot order baru pada event PAID terverifikasi
  pertama. Hitungan memakai waktu konfirmasi server, bukan tanggal order dibuat
  atau tahap pemrosesan. Event duplikat tidak dihitung lagi.
- **Cup online:** jumlah item pada snapshot checkout, satu unit menu selain
  kategori dengan slug `topping` adalah satu cup. Klasifikasi disimpan saat
  checkout; perubahan kategori di kemudian hari tidak mengubah laporan lama.
- **Cup total:** cup online ditambah cup penjualan langsung manual.
- **Pemasukan:** penjualan online + penjualan langsung + pemasukan lain.
- **Pengeluaran:** seluruh catatan pengeluaran aktif, termasuk refund manual.
- **Selisih periode:** pemasukan dikurangi pengeluaran. Ini bukan saldo fisik kas,
  saldo rekening, atau laba bersih.

Penjualan online tetap **bruto**, sebelum biaya Midtrans. Refund tidak menghapus
penjualan awal atau mengurangi cup otomatis: karyawan/pemilik mencatat nominal
refund sebagai pengeluaran, sehingga nilai penjualan tidak hilang dari periode
asal. Tidak ada panggilan baru ke Midtrans untuk membuka/mengekspor laporan.

## Data awal dan sandbox

Migrasi `20261027180000_add_finance` menambah `CashEntry`, `CashEntryAudit`,
`Order.paymentEnvironment`, snapshot `OrderItem.countsAsCup`, dan indeks terkait.
Tidak ada reset, penghapusan pesanan, atau backfill penjualan keuangan lama.

Order baru menyimpan `SANDBOX` atau `PRODUCTION` dari konfigurasi server saat
checkout. Catatan manual juga menyimpan lingkungan saat dibuat. Tampilan dan PDF
membaca lingkungan yang aktif melalui `MIDTRANS_IS_PRODUCTION`; data uji diberi
label jelas dan tidak tercampur dengan data production. Mengubah konfigurasi
tidak mengubah lingkungan catatan yang sudah tersimpan.

Pesanan lama memiliki lingkungan `null` dan **tidak masuk total keuangan**, sesuai
keputusan pengguna. Pesanan tersebut tetap tersedia pada Order Masuk. Catatan
manual baru yang bertanggal lampau tetap dilaporkan pada tanggal transaksinya.

```powershell
cd frontend
pnpm exec prisma migrate deploy --config prisma7.config.ts
pnpm exec prisma generate --config prisma7.config.ts
```

Migrasi sudah diterapkan pada database lokal. Tidak ada deployment produksi.

## PDF dan antarmuka server

- Page dan server actions memakai guard staff/admin existing; semua mutasi
  melakukan pemeriksaan akses sendiri. Role selain `user`/`admin` ditolak.
- `GET /api/reports/finance/pdf?from=YYYY-MM-DD&to=YYYY-MM-DD`: session wajib.
  Respons sukses `application/pdf`, `Content-Disposition: attachment`, dan
  `Cache-Control: private, no-store`. Anonim 401, role tidak dikenal 403, tanggal
  tidak valid 400, ekspor lebih dari 5.000 catatan manual 422. Tidak ada pemotongan
  baris diam-diam; pilih periode lebih pendek bila mencapai batas.
- PDF dan dashboard memakai fungsi perhitungan yang sama dan snapshot baca
  transaksi database. PDF mencantumkan waktu ekspor; catatan yang masuk setelah
  dashboard dimuat dapat muncul pada ekspor yang lebih baru.
- PDF A4 berisi identitas Matcha Yuk, periode/lingkungan, pembuat/waktu ekspor,
  ringkasan, rekap harian, semua catatan manual periode, dan nomor halaman.
  Kontak pelanggan, token payment, dan kredensial tidak disertakan.
- Riwayat dashboard dipaginasi 50 baris, tetapi total tetap menghitung seluruh
  periode. Catatan batal tetap terlihat dan ditandai pada halaman/PDF.

Runtime PDF memakai `pdfkit@0.20.2` dan `@types/pdfkit@0.17.7` untuk TypeScript.
Dependency serta graph transitif diaudit statis terhadap IOC sebelum pemasangan;
hasil `SAFE_NO_KNOWN_IOC`, instalasi dengan lifecycle script dinonaktifkan.
Font Noto Sans dibundel beserta lisensi SIL OFL. Output tracing build mencakup
font dan PDFKit. Tidak memerlukan browser headless atau Python pada server aplikasi.

## Validasi dan batasan

```powershell
node --experimental-test-module-mocks --import tsx --test tests/finance.test.mjs tests/dashboard-access.test.mjs tests/order-store.test.mjs tests/payment.test.mjs
pnpm lint
pnpm typecheck
pnpm build
```

**34 test lulus**, termasuk akses langsung, validasi input, idempotensi, koreksi
bersamaan, audit, pembatalan, batas WIB, pembayaran duplikat, topping, refund bruto,
legacy/sandbox/production, pagination, dan batas ekspor. Suite payment/auth/cart
existing tetap lulus. Typecheck/build lulus; lint tanpa error dengan warning
existing di skill, seed, dan artefak pengujian lokal.

Regresi harga per cup juga diuji: Rp5.001 × 5 = Rp25.005, penolakan total berlebih,
harga pecahan/negatif, total browser yang dipalsukan, retry tanpa duplikasi,
koreksi harga satuan, serta pelestarian nominal lama sampai dikoreksi admin.

Playwright MCP isolated memakai database fixture terpisah: karyawan membuat tiga
jenis catatan dan mengunduh PDF; pemilik mengoreksi/membatalkan dengan riwayat;
total dan cup sesuai setelah reload. Layout mobile tidak overflow dan tidak ada
runtime error browser. PDF kosong, dua halaman, dan delapan halaman dirender serta
diperiksa teks, total dan batas halaman. Bug halaman kosong akibat footer sudah
diperbaiki dan memiliki pemeriksaan regresi.

Artefak lokal di `frontend/test-results/finance/` dan
`frontend/test-results/finance-browser/` diabaikan Git. Tool Python untuk render
hanya dipasang pada direktori artefak pengujian, bukan dependency aplikasi/global.
Pengujian ulang Playwright dan render PDF untuk harga per cup tersimpan di
`frontend/test-results/unit-price-browser/`; nilai pada preview, database,
dashboard dan PDF cocok, termasuk koreksi eksplisit catatan lama.

Belum mencakup stok cup fisik, shift/tutup kas, saldo awal, fee Midtrans otomatis,
rekonsiliasi bank, pengiriman email/WhatsApp, atau isolasi beberapa kedai.
Belum diuji dengan pembayaran production atau beban tinggi.
