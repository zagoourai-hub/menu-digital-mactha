# Security Design

## 1. Authentication

- Role: `SUPER_ADMIN`, `OWNER`, `CASHIER`.
- Gunakan password hashing dengan Argon2id atau bcrypt yang dikonfigurasi dengan parameter aman.
- Access token dan refresh token dikelola melalui cookie `httpOnly`, `Secure` di HTTPS, dan `SameSite` yang sesuai.
- Terapkan rotasi refresh token dan invalidasi saat logout.
- Tambahkan proteksi CSRF bila menggunakan autentikasi cookie.
- Jangan simpan token atau secret di localStorage.

## 2. Authorization

- Terapkan `JwtAuthGuard`, `RolesGuard`, dan tenant/outlet access guard.
- `SUPER_ADMIN` dapat mengelola tenant sesuai kebijakan admin.
- `OWNER` hanya dapat mengelola brand miliknya.
- `CASHIER` hanya dapat melihat dan mengubah order untuk outlet yang diizinkan.
- Periksa kepemilikan resource pada setiap query/mutation. Menyembunyikan tombol di frontend bukan kontrol keamanan.
- Untuk endpoint publik, batasi respons ke data yang memang boleh diketahui customer.

## 3. Tenant isolation

- Jangan percaya `brandId`/`outletId` dari body sebagai otorisasi.
- Resolve tenant dari slug/resource di database, lalu validasi hubungan brand-outlet.
- Untuk dashboard, scope query berdasarkan identitas user yang telah diautentikasi.
- Tambahkan integration test yang mencoba mengakses outlet/brand tenant lain.

## 4. Input dan API

- Gunakan DTO dengan validasi whitelist dan penolakan properti tak dikenal.
- Terapkan rate limit pada login, create order, endpoint status publik, simulasi pembayaran, regenerasi QR, upload, dan webhook.
- Batasi ukuran body dan file upload.
- Gunakan CORS allowlist, Helmet, TLS, dan request ID.
- Jangan mengembalikan stack trace atau detail internal kepada pengguna.

## 5. Payment security

- DOKU Client ID/secret dan token hanya berada di backend.
- Simpan kredensial gateway terenkripsi menggunakan AES-256-GCM dengan key yang dikelola di secret manager/environment, bukan disimpan bersama ciphertext dalam database.
- Jangan log secret, token, signature, atau payload sensitif tanpa sanitasi.
- Verifikasi signature notifikasi dengan spesifikasi resmi provider.
- Gunakan idempotensi dan query status provider sebelum menandai payment berhasil bila diwajibkan.
- Endpoint simulasi bayar harus menolak mode `doku_live`.

## 6. SQLite and filesystem

- File database tidak boleh disajikan sebagai file statis atau dapat diakses publik.
- Hak akses file database dan volume dibatasi ke user proses backend.
- Simpan file database pada persistent volume.
- Backup harus dilindungi seperti data produksi dan diuji restore.
- Jangan menganggap enkripsi disk menggantikan kontrol akses aplikasi.

## 7. Privacy

- Data customer minimum: nama, nomor WhatsApp opsional, kode meja/tipe order.
- PRD menetapkan retensi data pelanggan 12 bulan; implementasikan kebijakan penghapusan/anonimisasi setelah aturan legal dan kebutuhan transaksi dikunci.
- Jangan menyimpan data kartu atau rekening.
- Siapkan halaman privacy dan terms sebelum go-live publik.

## 8. Security tests minimum

- Login gagal dan rate limit.
- Akses lintas brand/outlet ditolak.
- Payload DTO dengan properti asing ditolak.
- Harga dari client diabaikan dan dihitung ulang di backend.
- Webhook signature salah ditolak.
- Webhook duplikat tidak menggandakan perubahan status.
- Mode `doku_live` menolak simulasi pembayaran.
- Secret tidak muncul di respons API, frontend bundle, atau log.
