# Akses pemilik dan karyawan

Implementasi melanjutkan field `User.role` dan plugin `admin()` Better Auth yang
sudah dibuat. Role yang dikenali adalah `admin` (pemilik kedai) dan `user`
(karyawan). Role lain ditolak. Migrasi normalisasi mengubah akun lama `USER`
menjadi `user` tanpa menaikkan hak akses atau mengubah akun admin.

| Kemampuan | Pemilik (`admin`) | Karyawan (`user`) |
| --- | --- | --- |
| Ringkasan dashboard/katalog internal | Ya | Tidak |
| Tambah, edit, hapus produk | Ya | Tidak |
| Lihat pesanan masuk | Ya | Ya |
| Ubah proses pesanan yang sudah lunas | Ya | Ya |
| Buat akun karyawan | Ya | Tidak |
| Lihat laporan keuangan dan unduh PDF | Ya | Ya |
| Tambah catatan keuangan manual | Ya | Ya |
| Koreksi/batalkan catatan keuangan | Ya | Tidak |
| Menandai pembayaran lunas melalui dashboard | Tidak | Tidak |

Karyawan diarahkan dari `/dashboard` atau URL katalog langsung ke
`/dashboard/orders`. Navigasi karyawan desktop/mobile menampilkan Order Masuk dan
Keuangan; rincian pencatatan dan laporan ada di [panduan keuangan](finance.md).
Guard server memeriksa session dan role pada setiap pembacaan data dashboard dan
mutasi. Pembatasan tidak hanya mengandalkan tombol atau proxy. Cookie cache
session dilewati saat memeriksa izin agar perubahan role tidak memakai role lama.

## Akun karyawan

Registrasi email/password publik dinonaktifkan melalui `disableSignUp: true`.
`/register` mengarahkan ke login dan tautan pendaftaran dihapus dari halaman auth.
Pemilik membuka **Dashboard → Karyawan**, mengisi nama, email dan kata sandi awal.
Server membuat akun lewat `auth.api.createUser` dengan role tetap `user`; field
role dari browser tidak digunakan. Pemilik menyampaikan kredensial awal kepada
karyawan. Tidak ada perubahan role atau pembuatan admin melalui form ini.

Akun pemilik yang sudah ada tetap digunakan. Tidak ada akun existing yang
dipromosikan otomatis. Fitur ganti/reset kata sandi dan pengelolaan akun lanjutan
tidak ditambahkan pada perubahan ini.

## Proses pesanan

Kolom baru `Order.fulfillmentStatus` menyimpan tahap operasional:

`NEW` (Baru) → `PROCESSING` (Diproses) → `READY` (Siap) → `COMPLETED` (Selesai).

Transisi hanya dapat dilakukan ketika `Order.status === "PAID"`. Status pembayaran
tetap ditentukan oleh webhook terverifikasi. Action tidak menerima perubahan
harga, item atau status pembayaran. Update memakai kondisi atomik untuk tahap
sebelumnya: request duplikat, tahap yang dilewati atau status pembayaran yang sudah
berubah ditolak. Tahap Selesai tidak memiliki tombol perubahan berikutnya.

Daftar menampilkan 50 pesanan terbaru beserta snapshot item dan catatan. Tombol
**Perbarui daftar** memuat ulang data; perubahan tahap juga menyegarkan daftar.
Migrasi menambahkan kolom dengan default `NEW` ke pesanan existing.

```powershell
cd frontend
pnpm exec prisma migrate deploy --config prisma7.config.ts
pnpm exec prisma generate --config prisma7.config.ts
```

Kedua migrasi baru sudah diterapkan pada database lokal. Tidak ada deployment
produksi atau perubahan kredensial.

## Validasi

```powershell
node --experimental-test-module-mocks --import tsx --test tests/dashboard-access.test.mjs tests/order-store.test.mjs tests/payment.test.mjs
pnpm typecheck
pnpm lint
pnpm build
```

Suite memakai database SQLite sementara dan seluruh migrasi repository. Test
akses memakai mock konteks Next/session serta API pembuatan karyawan; test
registrasi publik menjalankan validasi Better Auth asli. Cakupan: anon/role tidak
dikenal, larangan mutasi produk untuk karyawan, CRUD pemilik, penolakan signup,
role tetap pada form karyawan, transisi order lunas, unpaid/refund, replay,
konkurensi, dan normalisasi role lama. Seluruh **25 test lulus**. Typecheck dan
build lulus; lint tidak memiliki error (warning existing di skill/seed/artefak).

Playwright MCP dengan Chrome isolated dan database fixture terpisah juga lulus:
redirect anonim/karyawan, pembatasan URL produk dan akun karyawan, navigasi mobile,
transisi pesanan hingga Selesai yang bertahan setelah reload, larangan memproses
pesanan belum lunas, pembuatan produk oleh pemilik, pembuatan akun karyawan lewat
Better Auth asli, login akun baru, serta penolakan API signup dan redirect halaman
register. Tidak ada runtime error browser. Artefak lokal ada di
`frontend/test-results/dashboard-access/` (diabaikan Git).

Katalog dan pesanan masih digunakan bersama dalam aplikasi satu kedai ini.
Pembatasan per outlet/pemilik terpisah, pagination arsip, polling otomatis,
audit identitas karyawan pada perubahan tahap, dan notifikasi pelanggan belum
ditambahkan.
