# Checklist Uji Terbatas DIGITRACE

Jalankan pemeriksaan ini sebelum membagikan prototipe kepada 10–13 pengguna.

## Persiapan

- [ ] `schema.sql` dan `seed.sql` sudah dijalankan.
- [ ] 1 akun admin serta 13 akun user aktif.
- [ ] `js/config.js` berisi Project URL dan publishable key, tanpa secret key.
- [ ] Website dibuka melalui HTTPS pada hosting, atau `localhost` saat pengembangan.
- [ ] Kamera ponsel telah diizinkan hanya saat pengguna menekan halaman Scan.

## Alur pengguna

- [ ] Login dengan username dan password yang benar mengarah ke dashboard.
- [ ] Password salah menampilkan pesan yang jelas tanpa membocorkan detail akun.
- [ ] Halaman dashboard/scan/ranking mengarah ke login ketika belum ada sesi.
- [ ] Scan meminta akses kamera dan menampilkan fallback manual jika kamera ditolak.
- [ ] Tekan tombol scan: kandidat jenis atau pilihan manual muncul.
- [ ] Pilih PET, HDPE, LDPE, PP, PS, PVC, atau OTHER.
- [ ] Materi edukasi memuat ciri, dampak, contoh, dan langkah pemilahan.
- [ ] Tombol simpan menambah tepat 10 poin dan satu riwayat.
- [ ] Dashboard memperbarui total scan, total poin, riwayat, dan pie chart.
- [ ] Riwayat akun A tidak tampak ketika masuk sebagai akun B.

## Alur admin

- [ ] Login admin mengarah ke `admin.html`.
- [ ] User biasa yang membuka `admin.html` tidak dapat membaca data admin.
- [ ] Jumlah pengguna, scan, poin, distribusi plastik, dan riwayat muncul.
- [ ] Filter pengguna dan jenis plastik memperbarui daftar riwayat.
- [ ] Leaderboard menampilkan total poin nyata dan menandai akun yang sedang masuk.

## Privasi dan batasan prototype

- [ ] Tidak ada bucket Storage untuk foto scan.
- [ ] Tabel `scan_records` tidak berisi URL, blob, atau foto.
- [ ] Setelah scan, hanya metadata jenis, nama objek, metode, confidence, poin, status, dan waktu yang disimpan.
- [ ] Identifikasi bentuk berjalan di browser dan hasilnya hanya kandidat.
- [ ] Pengguna selalu dapat memilih jenis plastik secara manual.
- [ ] Uji dilakukan dengan pencahayaan cukup serta koneksi internet aktif untuk pemuatan model pertama kali.

## Rilis terbatas

- [ ] Ganti password demo sebelum pengujian publik jika akun dapat diakses di internet.
- [ ] Tambahkan URL hosting HTTPS di pengaturan Site URL/Redirect URLs Supabase bila diperlukan.
- [ ] Bagikan hanya URL aplikasi serta username/password masing-masing pengguna.
- [ ] Catat temuan pengguna: apakah kandidat tepat, apakah materi mudah dipahami, dan apakah alur pemilahan jelas.

