# Jatimulya Melapor

Sistem informasi pengaduan masyarakat berbasis website — Desa Jatimulya,
Kecamatan Tambun Selatan, Kabupaten Bekasi.

Dibangun dengan **Next.js 14 (App Router)** + **Supabase** (Database, Auth,
Storage), lengkap dengan fitur **export laporan ke PDF** dan **sinkronisasi
ke Google Spreadsheet**.

## Fitur

**Untuk masyarakat**
- Mengirim pengaduan (dengan opsi lapor anonim) + upload foto bukti
- Cek status pengaduan beserta riwayat & respon admin (timeline)

**Untuk admin**
- Login admin (Supabase Auth)
- Dashboard ringkasan (statistik, tren, kategori terpopuler)
- Kelola & verifikasi pengaduan (ubah status, beri tanggapan resmi)
- **Cetak laporan ke PDF** — baik rekap per periode (kop surat resmi desa)
  maupun cetak satu pengaduan
- **Download laporan sebagai Excel (.xlsx)**
- **Sambungkan & sinkronkan data ke Google Spreadsheet** secara langsung

## 1. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor**, jalankan seluruh isi file [`supabase/schema.sql`](./supabase/schema.sql)
   — ini akan membuat semua tabel, trigger, RLS policy, dan storage bucket
   `bukti-pengaduan` sekaligus.
3. Buat user admin pertama: buka **Authentication > Users > Add User**,
   isi email & password admin desa.
4. Salin `Project URL`, `anon public key`, dan `service_role key` dari
   **Project Settings > API**.

## 2. Setup environment variables

```bash
cp .env.example .env.local
```

Isi `.env.local` dengan kredensial Supabase kamu. Untuk fitur Google Sheets,
ikuti langkah di bawah (opsional — bisa dilewati dulu, fitur export PDF &
Excel tetap berfungsi tanpa ini).

### Setup Google Sheets (opsional)

1. Buka [Google Cloud Console](https://console.cloud.google.com), buat
   project, lalu aktifkan **Google Sheets API**.
2. Buat **Service Account** (IAM & Admin > Service Accounts), lalu generate
   **JSON key**.
3. Dari file JSON tersebut, salin `client_email` ke
   `GOOGLE_SERVICE_ACCOUNT_EMAIL` dan `private_key` ke `GOOGLE_PRIVATE_KEY`
   di `.env.local`.
4. Buat Google Sheet baru, klik **Share**, lalu bagikan ke alamat email
   service account tadi sebagai **Editor**.
5. Salin Spreadsheet ID dari URL sheet (bagian antara `/d/` dan `/edit`).
6. Jalankan aplikasi → login admin → menu **Pengaturan** → masukkan
   Spreadsheet ID → simpan → buka menu **Laporan** → klik **Sinkronkan
   Sekarang**.

## 3. Install & jalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

- Halaman publik: beranda, form lapor (`/lapor`), cek status (`/status`)
- Login admin: `/admin/login`

## 4. Struktur folder penting

```
app/
  page.tsx                  Beranda
  lapor/page.tsx             Form pengaduan
  status/page.tsx            Cek status + timeline
  admin/
    login/page.tsx           Login admin
    (protected)/layout.tsx   Sidebar admin (berlaku ke semua halaman di bawah)
    (protected)/dashboard/   Dashboard statistik
    (protected)/pengaduan/   Daftar & detail/verifikasi pengaduan
    (protected)/laporan/     Export PDF / Excel / sync Google Sheets
    (protected)/pengaturan/  Konfigurasi Spreadsheet ID
  api/laporan/
    pdf/route.tsx            Generate PDF (rekap atau per-laporan)
    spreadsheet/route.ts     Generate & download .xlsx
    sync-sheets/route.ts     Push data ke Google Sheets
lib/
  supabase/                  Supabase client (browser, server, service role)
  pdf/                       Komponen dokumen @react-pdf/renderer
supabase/schema.sql           Skema database + RLS + storage bucket
```

## 5. Deploy

Aplikasi ini siap di-deploy ke [Vercel](https://vercel.com):

1. Push project ke GitHub
2. Import ke Vercel, isi environment variables yang sama seperti
   `.env.local`
3. Deploy

## Catatan

- RLS (Row Level Security) di Supabase sudah diatur supaya warga (anon)
  bisa **mengirim** & **membaca** pengaduan (untuk transparansi & cek
  status), sementara **mengubah status** hanya bisa dilakukan admin yang
  sudah login.
- Untuk skripsi: kolom NIK & no. WhatsApp pelapor sebaiknya disensor di
  tampilan publik (sudah diterapkan di halaman cek-status — hanya admin
  yang melihat data lengkap di halaman kelola pengaduan).
