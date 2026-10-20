# KalimQuest

Aplikasi pembelajaran Bahasa Arab: React + Vite, Netlify Functions, Supabase Auth dan PostgreSQL.

## Mulai lokal

Node.js 22 atau lebih baru. Jalankan `npm ci`, lalu `npm run dev`.
Tanpa konfigurasi, mode tamu sudah dapat dimainkan. `npm run dev` hanya menjalankan frontend.
Untuk menguji akun dan API lokal: pasang Netlify CLI, salin `.env.example` ke `.env`, isi variabelnya, lalu jalankan `npx netlify dev`. Jangan mengunggah `.env`.

## Aktifkan backend

1. Buat proyek Supabase milik Anda.
2. Jalankan `supabase/schema.sql` sekali di SQL Editor. Tabel progres memiliki RLS. Pengguna hanya dapat membaca progres sendiri; penulisan melalui backend dengan penilaian server.
3. Aktifkan email/password pada Authentication. Atur Site URL ke alamat Netlify Anda dan URL redirect konfirmasi ke alamat tersebut. Pertahankan konfirmasi email dan konfigurasikan SMTP untuk penggunaan nyata.
4. Gunakan akun guru/orang tua; email anak tidak diperlukan. Setiap akun memiliki satu progres. Progres tamu tidak otomatis dipindahkan saat masuk.

## GitHub → Netlify

1. Buat repository kosong di GitHub.
2. Unggah isi folder ini (termasuk folder `netlify`, `shared`, `supabase`, dan file `netlify.toml`), bukan `node_modules`, `dist`, atau `.env`.
3. Di Netlify pilih impor proyek dari GitHub, lalu pilih repository tersebut.
4. Build command: `npm run build`. Publish directory: `dist`. Konfigurasi functions sudah ada dalam `netlify.toml`.
5. Pada environment variables Netlify, tambahkan empat variabel di bawah dan deploy ulang.

| Nama | Scope | Isi |
|---|---|---|
| VITE_SUPABASE_URL | Builds | Project URL Supabase |
| VITE_SUPABASE_ANON_KEY | Builds | anon/public key Supabase |
| SUPABASE_URL | Functions | Project URL yang sama |
| SUPABASE_SERVICE_ROLE_KEY | Functions | service_role key, rahasia server |

Jangan pernah memakai awalan VITE_ untuk service_role key. Variabel VITE_ masuk ke JavaScript publik. Runtime functions mengambil variabel dari pengaturan Netlify, bukan bagian build.environment pada TOML. Konfigurasi URL dan key harus berasal dari proyek Supabase yang sama.

## Pemeriksaan setelah deploy

- Mainkan mode tamu: raih minimal tiga jawaban tepat, muat ulang halaman, pastikan bintang tersimpan.
- Daftar akun pendamping, konfirmasi email, lalu masuk.
- Selesaikan lokasi pertama; buka website pada perangkat lain dengan akun sama dan periksa progresnya.
- Pastikan akun kedua tidak dapat membaca progres akun pertama.
- Periksa bahwa mengulang dengan nilai lebih rendah tidak menurunkan bintang terbaik.
- Pastikan lokasi berikutnya terkunci jika lokasi sebelumnya belum mendapat bintang.

## Materi dan audio

`shared/content.js` menyimpan lima tema, 20 kosakata, dan contoh kalimat. Materi ini contoh awal, belum divalidasi terhadap CP/ATP atau buku tertentu. Sesuaikan bersama guru. Ketika mengubah jumlah kata/soal atau urutan soal, ubah `shared/scoring.js` dan ujiannya juga. Daftar lokasi yang diizinkan ada pada constraint SQL.

Gambar sementara menggunakan emoji, bukan ilustrasi final. Peta menggunakan CSS dan jalur SVG. Tidak ada aset berbayar yang diperlukan. Google Fonts opsional; tersedia fallback font sistem.

Tambahkan rekaman pelafalan ke `public/audio/` sesuai petunjuk dalam folder tersebut. Audio guru belum disertakan. Jika MP3 tidak tersedia, aplikasi mencoba suara Arab perangkat dan menandainya sebagai suara otomatis. Jika tidak tersedia, anak dapat membaca bersama pendamping. Ini bukan fitur penilaian pelafalan. Soal audio memiliki bantuan teks.

## Cara kerja backend

GET `/.netlify/functions/progress`: baca progres pemilik token.
POST endpoint yang sama: `{ "worldId": "fruit", "answers": [0,1,2,3,1] }`.
Keduanya memerlukan `Authorization: Bearer <access_token>`.
Backend memverifikasi pengguna dengan Supabase Auth, memeriksa prasyarat lokasi dan jawaban, lalu menyimpan nilai maksimum lewat operasi upsert atomik. Identitas pengguna diambil dari token, tidak dari body. Skor adalah alat belajar, bukan sistem ujian anti-kecurangan; kunci latihan juga tersedia dalam source/frontend untuk mode tamu.

## Pengujian

`npm test` menguji penilaian, input tidak valid, dan guard backend. `npm run build` menghasilkan frontend produksi.
Build dan unit tests dapat dilakukan tanpa akun Supabase. Koneksi nyata, SQL, email, audio final dan lintas perangkat perlu diuji setelah kredensial layanan dipasang. Tidak ada dashboard guru, reset password, multi-profil, atau sinkronisasi tamu dalam versi ini.

Referensi resmi:
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/reference/javascript/auth-getuser
- https://docs.netlify.com/build/functions/environment-variables/
