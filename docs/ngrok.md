# Ngrok untuk pengujian webhook Midtrans

Ngrok yang sudah terpasang di komputer dipakai untuk meneruskan HTTPS publik ke
aplikasi lokal pada port 3001. Tidak ada package ngrok baru atau authtoken yang
ditambahkan ke repository.

## Menjalankan kembali

1. Dari `frontend/`, jalankan aplikasi (`pnpm dev` atau `pnpm start` jika build
   sudah tersedia).
2. Pada terminal lain, jalankan:

   ```powershell
   ngrok http 3001 --inspect=false
   ```

3. Salin origin HTTPS tunnel ke `frontend/.env.local`:

   ```dotenv
   APP_URL="https://DOMAIN-NGROK-ANDA"
   BETTER_AUTH_URL="https://DOMAIN-NGROK-ANDA"
   ```

   Ganti placeholder dengan URL HTTPS yang tampil pada ngrok. Kredensial tetap
   berada pada `.env`; `.env.local` hanya menimpa URL aplikasi dan auth. File ini
   diabaikan Git. Restart aplikasi setelah mengubah URL.

4. Pada dashboard **Midtrans sandbox**, buka **Settings → Payment → Notification
   URL**, lalu simpan Payment notification URL:

   ```text
   https://DOMAIN-NGROK-ANDA/api/payment/webhook
   ```

5. Buka aplikasi melalui URL ngrok. Create Snap menggunakan `APP_URL` untuk callback
   selesai; client auth memakai origin halaman saat ini. Origin tunnel yang
   dikonfigurasi diterima oleh payment dan auth tanpa mengizinkan semua domain.

Jika URL tunnel berubah, perbarui kedua URL pada `.env.local`, restart aplikasi,
dan ubah Notification URL di dashboard sandbox. Localhost tetap diperlukan karena
ngrok meneruskan request ke server lokal tersebut.

## Hasil verifikasi — 27 Oktober 2026

- Landing page, `/api/menus`, dan `/api/auth/get-session` melalui HTTPS publik:
  HTTP 200. Dashboard tanpa login diarahkan ke `/login`.
- POST webhook dengan signature salah: HTTP 403.
- Checkout melalui browser publik berhasil membuat order dan membuka QRIS sandbox.
- Payment notification URL tersimpan pada dashboard Midtrans sandbox.
- Pembayaran melalui simulator QRIS resmi memicu notifikasi **otomatis** melalui
  ngrok. Tidak ada replay manual pada transaksi pengujian ini.
- Halaman status yang terbuka berubah dari PENDING_PAYMENT menjadi PAID, total
  Rp36.000. Database menyimpan tepat satu audit event PAID.
- Notification History Midtrans menampilkan **Completed** untuk notifikasi Pending
  dan Settlement ke endpoint ngrok yang dikonfigurasi.

Bukti lokal ada di `frontend/test-results/ngrok-webhook/`:
`automatic-webhook.json`, `automatic-paid.png`, `notification-history.png`, dan
`simulator-paid.png`. Folder ini diabaikan Git. Percobaan awal runner mengalami
race saat membaca response body setelah browser redirect; transaksi yang sama
dilanjutkan tanpa membuat charge kedua, dan verifikasi akhirnya berhasil.

Validasi kode: 12 test otomatis lulus; typecheck dan build lulus. Lint tanpa error;
warning existing dan satu warning pada script artefak pengujian lokal masih ada.

Tunnel aktif selama proses ngrok dan server lokal berjalan. Setup ini memakai
sandbox dan tidak memindahkan dana nyata. Pengujian login penuh, payment production,
refund, dan beban tinggi tidak dilakukan.

Referensi: [ngrok CLI](https://ngrok.com/docs/gateway/agent/cli) dan
[Midtrans webhook](https://docs.midtrans.com/docs/https-notification-webhooks).
