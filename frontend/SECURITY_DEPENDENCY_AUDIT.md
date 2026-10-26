# Audit dependency

SAFE_NO_KNOWN_IOC: 746 package dibandingkan exact name/version dengan 446 baris feed resmi Wiz terbaru. Manifest, lifecycle, konfigurasi agent, dan artefak diperiksa statis. Tidak ada dependency dieksekusi selama audit.

Batas: IOC dikenal saja, bukan jaminan bebas malware; symlink tidak ditelusuri. Motion setup.mjs adalah utility gesture, referensi curl skill video-demo hanya petunjuk tercetak. Tidak ada commit history, perubahan global, atau hook.

SDK existing `midtrans-client@1.4.3` dipindah ke dependencies produksi; 746 pasangan
name/version tidak berubah. Implementasi SDK dan konfigurasi timeout diperiksa.
Setelah audit, validasi mengeksekusi SDK dengan transport mock, lint/typecheck/build,
serta pnpm menjalankan ulang postinstall `unrs-resolver` saat menyinkronkan manifest.
Tidak ada package mencurigakan atau lifecycle yang dijalankan selama fase audit.
