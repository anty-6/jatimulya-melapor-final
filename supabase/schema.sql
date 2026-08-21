-- ============================================================
-- Jatimulya Melapor — Supabase schema
-- Jalankan ini di Supabase SQL editor (Project > SQL Editor)
-- ============================================================

-- 1. Tabel kategori pengaduan
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.categories (name) values
  ('Infrastruktur Jalan'),
  ('Kebersihan & Limbah'),
  ('Layanan Administrasi'),
  ('Lampu Penerangan'),
  ('Keamanan'),
  ('Bantuan Sosial'),
  ('Lainnya')
on conflict (name) do nothing;

-- 2. Tabel pengaduan (complaints)
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  complaint_number text not null unique,
  title text not null,
  category text not null,
  description text not null,
  location text not null,
  photo_urls text[] not null default '{}',
  is_anonymous boolean not null default false,
  reporter_name text,
  reporter_phone text,
  reporter_nik text,
  is_reporter_verified boolean not null default false,
  status text not null default 'baru'
    check (status in ('baru','diverifikasi','diproses','selesai','ditolak')),
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists complaints_status_idx on public.complaints (status);
create index if not exists complaints_created_at_idx on public.complaints (created_at desc);
create index if not exists complaints_complaint_number_idx on public.complaints (complaint_number);

-- 3. Riwayat status / respon admin
create table if not exists public.status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints (id) on delete cascade,
  status text not null,
  note text,
  changed_by text,
  created_at timestamptz not null default now()
);

create index if not exists status_history_complaint_idx on public.status_history (complaint_id);

-- 4. Profil admin (terhubung ke auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- 5. Pengaturan integrasi spreadsheet (Google Sheets)
create table if not exists public.spreadsheet_settings (
  id uuid primary key default gen_random_uuid(),
  spreadsheet_id text not null,
  sheet_name text not null default 'Pengaduan',
  last_synced_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Trigger: auto-generate nomor pengaduan + updated_at
-- ============================================================
create or replace function public.generate_complaint_number()
returns trigger as $$
declare
  seq_num int;
  year_str text;
begin
  year_str := to_char(now(), 'YYYY');
  select count(*) + 1 into seq_num
  from public.complaints
  where complaint_number like 'LP-' || year_str || '-%';

  new.complaint_number := 'LP-' || year_str || '-' || lpad(seq_num::text, 4, '0');
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_generate_complaint_number on public.complaints;
create trigger trg_generate_complaint_number
  before insert on public.complaints
  for each row
  when (new.complaint_number is null or new.complaint_number = '')
  execute function public.generate_complaint_number();

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_complaints_updated_at on public.complaints;
create trigger trg_complaints_updated_at
  before update on public.complaints
  for each row
  execute function public.set_updated_at();

-- Catat riwayat status otomatis setiap kali status berubah / data dibuat
create or replace function public.log_status_history()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.status_history (complaint_id, status, note, changed_by)
    values (new.id, new.status, 'Laporan diterima sistem', 'system');
  elsif (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.status_history (complaint_id, status, changed_by)
    values (new.id, new.status, coalesce(auth.email(), 'admin'));
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_log_status_history on public.complaints;
create trigger trg_log_status_history
  after insert or update on public.complaints
  for each row
  execute function public.log_status_history();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.complaints enable row level security;
alter table public.status_history enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.spreadsheet_settings enable row level security;

-- Siapa pun (termasuk warga belum login) boleh MENGIRIM pengaduan
create policy "public can insert complaints"
  on public.complaints for insert
  to anon, authenticated
  with check (true);

-- Siapa pun boleh membaca pengaduan untuk fitur cek-status (transparansi publik)
-- NIK & nomor HP tetap tersimpan tapi sebaiknya disensor di tampilan frontend
-- untuk pelapor yang memilih anonim (lihat lib/format.ts -> maskReporter)
create policy "public can read complaints"
  on public.complaints for select
  to anon, authenticated
  using (true);

-- Hanya admin (sudah login) yang boleh mengubah / menghapus
create policy "admin can update complaints"
  on public.complaints for update
  to authenticated
  using (true) with check (true);

create policy "admin can delete complaints"
  on public.complaints for delete
  to authenticated
  using (true);

-- Riwayat status: publik boleh baca, hanya admin boleh tulis manual
create policy "public can read status history"
  on public.status_history for select
  to anon, authenticated
  using (true);

create policy "admin can insert status history"
  on public.status_history for insert
  to authenticated
  with check (true);

-- Kategori: publik boleh baca, admin boleh kelola
create policy "public can read categories"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "admin can manage categories"
  on public.categories for all
  to authenticated
  using (true) with check (true);

-- Profiles: admin hanya boleh lihat & ubah profil sendiri
create policy "admin can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "admin can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Spreadsheet settings: hanya admin
create policy "admin can manage spreadsheet settings"
  on public.spreadsheet_settings for all
  to authenticated
  using (true) with check (true);

-- ============================================================
-- Storage bucket untuk bukti foto pengaduan
-- ============================================================
insert into storage.buckets (id, name, public)
values ('bukti-pengaduan', 'bukti-pengaduan', true)
on conflict (id) do nothing;

create policy "public can upload bukti pengaduan"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'bukti-pengaduan');

create policy "public can read bukti pengaduan"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'bukti-pengaduan');
