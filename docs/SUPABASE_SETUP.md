# Setup Backend DIGITRACE

## Yang perlu disiapkan

1. Buat satu proyek Supabase.
2. Jalankan [schema.sql](../supabase/schema.sql) pada SQL Editor.
3. Jalankan [seed.sql](../supabase/seed.sql) pada SQL Editor.
4. Buat akun admin dan akun pengguna melalui **Authentication → Users**.
5. Masukkan metadata saat membuat akun: `username`, `full_name`, `area`, dan bila perlu `school`.
6. Setelah akun admin terbentuk, jalankan SQL berikut dengan username admin yang benar:

```sql
update public.profiles
set role = 'admin'
where username = 'admin';
```

7. Salin Project URL dan publishable/anon key ke [js/config.js](../js/config.js).

## Aturan akun

- Gunakan username huruf kecil, misalnya `kenzie` atau `admin`.
- Aplikasi menerjemahkan username menjadi email internal, misalnya `kenzie@digitrace.local`.
- Gunakan kata sandi yang berbeda untuk setiap akun.
- Akun dibuat oleh admin; tidak ada registrasi dari halaman publik.
- Jangan memasukkan secret key/service role ke `js/config.js` atau browser.

## Pengujian minimum setelah setup

1. Login sebagai user dan pastikan profil hanya dapat membaca datanya sendiri.
2. Login sebagai admin dan pastikan `role` terbaca sebagai `admin`.
3. Pastikan tabel `plastic_types` berisi tujuh kategori.
4. Simpan satu record melalui fungsi `save_scan` setelah checkpoint scan selesai.

