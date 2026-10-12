# Rilis Terbatas DIGITRACE

Dokumen ini dipakai saat prototipe siap dibagikan kepada 10–13 pengguna uji.

## Sebelum dibagikan

1. Hosting-kan folder proyek ini pada layanan yang menyediakan HTTPS.
2. Tambahkan URL hosting tersebut pada **Authentication → URL Configuration** di Supabase, sebagai `Site URL` dan `Redirect URL` bila diperlukan.
3. Pastikan `js/config.js` pada versi yang diunggah berisi Project URL dan publishable key yang benar. Jangan memasukkan `service_role` atau secret key.
4. Bagikan satu akun khusus untuk setiap peserta. Jangan mengaktifkan pendaftaran publik.
5. Ganti password demo jika URL nantinya dapat diakses di luar kelompok uji.

## Uji 10 menit sebelum rilis

1. Masuk sebagai satu user, lakukan satu scan manual, lalu simpan.
2. Pastikan total poin bertambah 10, riwayat baru muncul, dan pie chart berubah.
3. Masuk sebagai user berbeda dan pastikan riwayat user pertama tidak terlihat.
4. Masuk sebagai admin dan pastikan data global serta leaderboard tampil.
5. Di ponsel HTTPS, izinkan kamera, tekan Scan, lalu pastikan kandidat atau pilihan manual dapat dibuka.

## Saat uji coba

Minta peserta menilai tiga hal: apakah langkah scan mudah dimengerti, apakah materi edukasi membantu, dan apakah cara pemilahan yang disarankan jelas. Foto kamera tidak dikirim atau disimpan; hanya hasil pilihan jenis sampah beserta metadata riwayat yang dicatat.

## Batasan yang perlu disampaikan

Identifikasi kamera pada versi ini memberi kandidat visual, bukan penentu resin plastik yang pasti. Peserta tetap harus mengonfirmasi atau memilih jenis plastik secara manual sebelum data disimpan.
