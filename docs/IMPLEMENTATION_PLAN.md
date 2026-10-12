# Rencana Implementasi MVP DIGITRACE

Dokumen ini adalah sumber acuan implementasi DIGITRACE dari prototipe statis menjadi MVP yang dapat diuji oleh 10–13 pengguna.

## Sasaran MVP

Alur yang harus bekerja dari awal sampai akhir:

1. Pengguna masuk menggunakan akun yang dibuat admin.
2. Pengguna mengambil gambar objek sampah melalui kamera.
3. Sistem menampilkan kandidat jenis plastik atau pilihan manual.
4. Pengguna mengonfirmasi jenis plastik.
5. Sistem menampilkan materi edukasi dan panduan pemilahan.
6. Pengguna menyimpan hasil dan memperoleh 10 poin.
7. Riwayat serta pie chart pengguna diperbarui.
8. Admin dapat melihat ringkasan data seluruh pengguna.

Foto hanya digunakan sementara selama identifikasi. Foto tidak disimpan di database atau penyimpanan berkas.

## Keputusan Teknis

- Frontend tetap menggunakan HTML, Tailwind CDN, dan JavaScript biasa agar perubahan cepat dan tidak membutuhkan migrasi framework.
- Backend acuan menggunakan Supabase Auth dan PostgreSQL.
- Konfigurasi backend dipisahkan dari komponen halaman.
- Browser hanya menerima publishable key. Secret key/service role tidak boleh masuk ke repository atau browser.
- Akun dibuat oleh admin melalui dashboard Supabase atau proses server tepercaya.
- Form login dapat menerima username, lalu aplikasi memetakannya ke email internal akun.
- Riwayat menyimpan metadata teks saja.
- Poin diberikan melalui fungsi database agar pengguna tidak dapat menentukan jumlah poin dari browser.
- Identifikasi gambar dibuat sebagai adapter terpisah. Pilihan manual harus tetap tersedia jika layanan identifikasi gagal.

## Batas MVP

Termasuk:

- 10–13 akun pengguna dan satu akun admin;
- login, logout, dan sesi;
- kamera dan pengambilan satu frame;
- kandidat identifikasi dan pilihan manual;
- materi edukasi tujuh kategori plastik;
- simpan riwayat dan poin;
- dashboard serta pie chart pengguna;
- dashboard admin;
- leaderboard dari data nyata jika alur inti sudah stabil.

Tidak termasuk:

- registrasi publik;
- reset kata sandi mandiri;
- penyimpanan foto scan;
- unggah foto profil;
- penukaran hadiah nyata;
- notifikasi;
- GPS otomatis;
- estimasi berat otomatis;
- pelatihan model AI sendiri;
- panel CMS untuk mengedit materi edukasi.

## Struktur Data

### `profiles`

Profil yang terhubung satu-ke-satu dengan akun autentikasi. Menyimpan username, nama, role, daerah, sekolah, dan status aktif.

### `plastic_types`

Katalog PET, HDPE, PVC, LDPE, PP, PS, dan OTHER beserta materi edukasi, contoh, langkah pemilahan, dan warna grafik.

### `products`

Katalog opsional kemasan yang sudah diketahui. Hanya menyimpan teks dan relasi jenis plastik.

### `scan_records`

Riwayat hasil konfirmasi pengguna. Tidak memiliki kolom gambar.

## Aturan Akses

- Pengguna yang belum login tidak dapat membaca data aplikasi.
- Pengguna dapat membaca profil dan riwayat miliknya sendiri.
- Pengguna menambah riwayat melalui fungsi `save_scan`, bukan insert langsung.
- Pengguna tidak dapat menentukan poin sendiri.
- Admin dapat membaca semua profil dan riwayat.
- Semua pengguna yang login dapat membaca katalog plastik dan produk.
- Leaderboard hanya mengungkap nama, daerah, jumlah scan, dan total poin.

## Checkpoint Eksekusi

### CP0 — Audit kondisi awal — SELESAI

- Empat halaman HTML telah diperiksa.
- Kamera nyata sudah tersedia, tetapi identifikasi masih simulasi.
- Poin dan riwayat masih menggunakan `localStorage`.
- Tidak ada backend, login, pie chart, edukasi detail, atau dashboard admin.

Kriteria selesai: kondisi yang bisa digunakan ulang dan seluruh gap utama telah terdokumentasi.

### CP1 — Blueprint dan kontrak data — SELESAI

- Rencana implementasi disimpan di repository.
- Skema database, aturan akses, fungsi simpan scan, dan seed edukasi tersedia.
- Batas MVP dan urutan kerja dikunci.

Kriteria selesai: SQL dapat diperiksa dan dijalankan pada proyek Supabase tanpa memerlukan penyimpanan gambar.

### CP2 — Fondasi frontend dan mode konfigurasi — SELESAI

- Buat folder `js/` dan modul konfigurasi, autentikasi, database, serta utilitas UI.
- Tambah konfigurasi contoh tanpa kredensial rahasia.
- Sediakan pesan konfigurasi yang jelas jika backend belum dihubungkan.
- Hilangkan duplikasi data pengguna hardcoded dari halaman utama.

Kriteria selesai: seluruh halaman dapat memuat modul bersama tanpa error dan rahasia tidak masuk repository.

### CP3 — Login, sesi, dan pembatasan halaman — SELESAI

- Tambah `login.html`.
- Hubungkan login username/password ke Supabase Auth.
- Tambah pemeriksaan sesi, role, status aktif, dan logout.
- Lindungi halaman pengguna dan `admin.html`.

Kriteria selesai: user hanya masuk ke area user, admin dapat masuk ke area admin, dan sesi bertahan setelah refresh.

### CP4 — Vertical slice manual — SELESAI

- Ubah bahasa barcode menjadi pemindaian objek.
- Ambil frame kamera hanya di memori browser.
- Tambah tahap kandidat/pilihan manual.
- Tambah halaman edukasi.
- Simpan satu hasil menggunakan `save_scan` dan berikan 10 poin.
- Lepaskan stream kamera setelah tidak digunakan.

Kriteria selesai: login → kamera → pilih PET manual → edukasi → simpan → riwayat database berhasil.

### CP5 — Dashboard dan riwayat pengguna — SELESAI

- Ganti poin, nama, total scan, dan riwayat hardcoded dengan data database.
- Tambah pie chart distribusi plastik.
- Tambah halaman seluruh riwayat dan keadaan kosong/error.
- Hapus statistik berat yang tidak memiliki sumber data.

Kriteria selesai: dua akun berbeda hanya melihat data masing-masing dan grafik sesuai riwayat.

### CP6 — Dashboard admin dan leaderboard nyata — SELESAI

- Tambah ringkasan seluruh pengguna.
- Tambah distribusi plastik global dan tabel riwayat.
- Tambah filter sederhana.
- Hubungkan leaderboard dengan agregasi database.

Kriteria selesai: admin melihat data semua user, user biasa tidak dapat mengakses data admin, dan ranking berasal dari scan nyata.

### CP7 — Identifikasi gambar sementara — SELESAI

- Tambah adapter layanan identifikasi gambar.
- Kompres frame sebelum dikirim.
- Jangan menyimpan gambar pada frontend maupun backend.
- Tampilkan maksimal tiga kandidat dengan confidence jika tersedia.
- Pertahankan pilihan manual ketika layanan gagal atau hasil tidak sesuai.

Kriteria selesai: gambar diproses sementara, kandidat muncul, dan tidak ada URL/path foto yang tersimpan pada riwayat.

### CP8 — QA, data uji, dan rilis terbatas — MENUNGGU UJI PERANGKAT

- Buat akun uji dan data awal.
- Uji alur user serta admin pada ponsel melalui HTTPS.
- Uji kamera ditolak, hasil tidak ditemukan, jaringan gagal, session kedaluwarsa, dan penyimpanan ganda.
- Perbaiki aksesibilitas dasar dan konsistensi navigasi.
- Dokumentasikan cara setup dan menjalankan aplikasi.

Verifikasi yang sudah dilakukan:

- Semua halaman utama merespons `200` pada preview lokal.
- Semua modul JavaScript lolos pemeriksaan sintaks.
- Backend nyata memuat 6 contoh kemasan, 14 profil (termasuk admin), serta 13 peserta leaderboard.
- Akun uji Kenzie hanya membaca riwayatnya sendiri; dua riwayat uji menghasilkan total 20 poin.

Yang masih perlu diuji pada perangkat pengguna: izin kamera di HTTPS, pemuatan model identifikasi pertama kali, fallback ketika kamera/jaringan ditolak, dan pengalaman alur lengkap pada ponsel.

Kriteria selesai: alur utama lolos pada akun uji, data konsisten antarpengguna, dan prototipe siap diuji 10–13 orang.

## Aturan Pengerjaan

- Satu checkpoint diselesaikan dan diverifikasi sebelum masuk checkpoint berikutnya.
- Perubahan lokal yang tidak terkait tidak boleh ditimpa.
- Fitur di luar batas MVP dicatat sebagai backlog, bukan dimasukkan di tengah implementasi.
- Alur manual memiliki prioritas lebih tinggi daripada identifikasi otomatis.
- Jika backend belum memiliki konfigurasi nyata, implementasi tetap menyediakan keadaan konfigurasi yang aman dan dapat dipahami.

