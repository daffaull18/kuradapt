-- =====================================================
--  Kuradapt — Skema Database (Supabase)
--  Jalankan: Supabase Dashboard → SQL Editor → New query → Run
--
--  Terdiri dari:
--   A. user_data        — pasangan key-value ringkas (lama, tetap dipakai)
--   B. profiles         — akun, peran, verifikasi lembaga (tahap 2)
--   C. Tabel data ruang — pengumuman, nilai, progres, dokumen, kegiatan,
--                         undangan, soal, pelajaran, jadwal, kurikulum,
--                         buku, industri, audit log, MFA, batas masuk
--   D. Fungsi & RLS     — penjaga peran mirip mode lokal
-- =====================================================

-- =====================================================
--  A. user_data (lama — jangan dihapus)
-- =====================================================
create table if not exists public.user_data (
  id          text primary key,          -- auth.uid() dari akun pengguna
  data        jsonb  not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.user_data enable row level security;

drop policy if exists "user_data milik sendiri" on public.user_data;
create policy "user_data milik sendiri"
  on public.user_data
  for all
  using (auth.uid()::text = id)
  with check (auth.uid()::text = id);

-- Otomatis perbarui timestamp setiap data diubah
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_user_data_touch on public.user_data;
create trigger trg_user_data_touch
  before update on public.user_data
  for each row execute function public.touch_updated_at();

-- =====================================================
--  B. profiles — akun pengguna (peran ke-11: super)
--  Id = auth.uid(); dibuat otomatis saat daftar Supabase Auth.
-- =====================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text unique not null,
  nama        text not null,
  peran       text not null default 'siswa'
              check (peran in ('siswa','mahasiswa','guru','dosen','industri','admin','operator','super')),
  jenjang     text check (jenjang in ('mini','muda','mahir','tinggi')),
  verif       text not null default 'aktif' check (verif in ('aktif','menunggu','ditolak')),
  nonaktif    boolean not null default false,
  wilayah     jsonb,                       -- { provinsi, kabupaten, kecamatan }
  lembaga     jsonb,                       -- { id, nama, tipe } — pilihan pendaftar
  nisn        text,                        -- NISN / NIP / NIM
  undangan    jsonb not null default '[]'::jsonb,   -- jenjang hasil penukaran kode
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Profil terisi otomatis saat akun dibuat (nama & peran dari metadata pendaftaran)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nama, peran, jenjang, wilayah, lembaga, nisn)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nama', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'peran', 'siswa'),
    new.raw_user_meta_data ->> 'jenjang',
    nullif(new.raw_user_meta_data ->> 'wilayah', '')::jsonb,
    nullif(new.raw_user_meta_data ->> 'lembaga', '')::jsonb,
    new.raw_user_meta_data ->> 'nisn'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
--  D1. Fungsi peran (security definer agar tidak berputar di RLS)
-- =====================================================
create or replace function public.peran_saya()
returns text language sql stable security definer set search_path = public as $$
  select peran from public.profiles where id = auth.uid();
$$;

create or replace function public.is_pengelola()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.peran_saya() in ('admin','operator','super'), false);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.peran_saya() in ('admin','super'), false);
$$;

-- Tenaga pendidik: guru/dosen/industri + seluruh pengelola (bisaTulis mode lokal)
create or replace function public.is_pendidik()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.peran_saya() in ('guru','dosen','industri','admin','operator','super'), false);
$$;

-- =====================================================
--  C. Tabel data ruang (cerminan kunci localStorage mode lokal)
-- =====================================================

-- Papan pengumuman live (merge by-id, penanda dihapus)
create table if not exists public.pengumuman (
  id         text primary key,
  judul      text not null,
  penulis    text,
  peran      text,
  jenjang    text not null default 'semua',
  isi        text,
  dihapus    boolean not null default false,
  tgl        timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Nilai per peserta per mapel per ruang (awal 0 sampai diinput pengajar)
create table if not exists public.nilai (
  ruang     text not null,
  email     text not null,
  mapel_id  text not null,
  tugas     int not null default 0,
  uh        int not null default 0,
  uas       int not null default 0,
  oleh      text,
  updated_at timestamptz not null default now(),
  primary key (ruang, email, mapel_id)
);

-- Progres belajar per peserta per ruang { bab: [], latihan: {} }
create table if not exists public.progres (
  ruang      text not null,
  email      text not null,
  bab        jsonb not null default '[]'::jsonb,
  latihan    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (ruang, email)
);

-- Dokumen digital (tugas/jurnal/berkas)
create table if not exists public.dokumen (
  id         text primary key,
  email      text not null,
  nama       text not null,
  ukuran     bigint default 0,
  tipe       text,
  ruang      text,
  data       text,                          -- data URL / teks isi berkas
  tgl        timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Kegiatan bersama (live/akan/selesai) + peserta
create table if not exists public.kegiatan (
  id         text primary key,
  judul      text not null,
  jenis      text,
  jenjang    text not null,
  pembuat    text,
  peran      text,
  durasi     int default 60,
  status     text default 'akan',
  peserta    jsonb not null default '[]'::jsonb,
  dihapus    boolean not null default false,
  tgl        timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Kode undangan pengelola & penukaran akses jenjang
create table if not exists public.undangan (
  kode       text primary key,
  jenjang    text not null,
  pembuat    text,
  peran      text,
  aktif      boolean not null default true,
  dipakai    jsonb not null default '[]'::jsonb,
  tgl        timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Paket soal buatan tenaga pendidik per ruang
create table if not exists public.soal (
  id         text primary key,
  ruang      text not null,
  paket      jsonb not null,                -- { judul, mapelId, soal: [...] }
  updated_at timestamptz not null default now()
);

-- Pelajaran tambahan buatan tenaga pendidik per ruang
create table if not exists public.pelajaran (
  id         text primary key,
  ruang      text not null,
  nama       text not null,
  ringkas    text,
  ikon       text,
  bab        jsonb not null default '[]'::jsonb,
  pengajar   text,
  tgl        timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Jadwal pertemuan online (tahap 2)
create table if not exists public.jadwal (
  id         text primary key,
  judul      text not null,
  tautan     text,
  kode       text,                          -- RAPAT-XXXX
  platform   text,
  waktu      timestamptz,
  durasi     int default 60,
  jenjang    text not null,
  pembuat    text,
  peran      text,
  dihapus    boolean not null default false,
  tgl        timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Kurikulum ber-versi & ber-periode (riwayat tidak pernah terhapus) (tahap 2)
create table if not exists public.kurikulum (
  id         text primary key,
  jenjang    text not null,
  judul      text not null,
  versi      text not null,
  periode    text,
  status     text not null default 'berlaku' check (status in ('berlaku','diganti')),
  catatan    text,
  dihapus    boolean not null default false,
  tgl        timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Perpustakaan digital: buku & modul gratis (tahap 2)
create table if not exists public.buku (
  id         text primary key,
  judul      text not null,
  penulis    text,
  kategori   text,
  jenjang    text not null default 'semua',
  ringkas    text,
  isi        text,
  dihapus    boolean not null default false,
  tgl        timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Koneksi dunia industri: info + pendaftar izin akses (tahap 2)
create table if not exists public.industri (
  id         text primary key,
  judul      text not null,
  perusahaan text,
  isi        text,
  jenis      text,
  jenjang    text not null default 'semua',
  email      text,
  pembuat    text,
  pendaftar  jsonb not null default '[]'::jsonb,   -- [{ email, nama, status, tgl }]
  dihapus    boolean not null default false,
  tgl        timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Audit log aktivitas & insiden (14 tipe, maks. 300 entri)
create table if not exists public.log (
  id         text primary key,
  tipe       text not null,
  pesan      text not null,
  pelaku     text,
  perangkat  text,
  tgl        timestamptz not null default now()
);

-- Pengaturan MFA pengelola (baris tunggal id = 1)
create table if not exists public.mfa (
  id         boolean primary key default true check (id),
  aktif      boolean not null default false,
  kode       text default '',
  berlaku    bigint default 0,
  updated_at timestamptz not null default now()
);
insert into public.mfa (id) values (true) on conflict do nothing;

-- Batas percobaan masuk per email (anti brute-force; idealnya diisi edge function)
create table if not exists public.gagal_masuk (
  email      text primary key,
  n          int not null default 0,
  sampai     bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- =====================================================
--  D2. Aktifkan RLS + kebijakan tiap tabel
--  Ringkas: baca bebas untuk akun aktif (data ruang terpisah
--  dijaga lewat kolom jenjang), tulis hanya tenaga pendidik /
--  pengelola, milik sendiri untuk progres & dokumen.
-- =====================================================

-- --- pengumuman: baca semua, tulis tenaga pendidik, hapus via merge flag
alter table public.pengumuman enable row level security;
drop policy if exists "pengumuman baca" on public.pengumuman;
create policy "pengumuman baca" on public.pengumuman for select to authenticated using (true);
drop policy if exists "pengumuman tulis" on public.pengumuman;
create policy "pengumuman tulis" on public.pengumuman for all to authenticated
  using (public.is_pendidik()) with check (public.is_pendidik());

-- --- nilai: pengajar tulis, peserta baca miliknya sendiri
alter table public.nilai enable row level security;
drop policy if exists "nilai baca" on public.nilai;
create policy "nilai baca" on public.nilai for select to authenticated
  using (email = auth.jwt() ->> 'email' or public.is_pendidik());
drop policy if exists "nilai tulis" on public.nilai;
create policy "nilai tulis" on public.nilai for all to authenticated
  using (public.is_pendidik()) with check (public.is_pendidik());

-- --- progres: milik sendiri (atau pengelola untuk pemantauan)
alter table public.progres enable row level security;
drop policy if exists "progres milik sendiri" on public.progres;
create policy "progres milik sendiri" on public.progres for all to authenticated
  using (email = auth.jwt() ->> 'email' or public.is_pengelola())
  with check (email = auth.jwt() ->> 'email' or public.is_pengelola());

-- --- dokumen: milik sendiri
alter table public.dokumen enable row level security;
drop policy if exists "dokumen milik sendiri" on public.dokumen;
create policy "dokumen milik sendiri" on public.dokumen for all to authenticated
  using (email = auth.jwt() ->> 'email' or public.is_pengelola())
  with check (email = auth.jwt() ->> 'email' or public.is_pengelola());

-- --- kegiatan: baca semua, tulis tenaga pendidik (gabung/tinggal peserta
--     tetap lewat kolom peserta — klien tenaga pendidik yang memperbarui)
alter table public.kegiatan enable row level security;
drop policy if exists "kegiatan baca" on public.kegiatan;
create policy "kegiatan baca" on public.kegiatan for select to authenticated using (true);
drop policy if exists "kegiatan tulis" on public.kegiatan;
create policy "kegiatan tulis" on public.kegiatan for all to authenticated
  using (public.is_pendidik()) with check (public.is_pendidik());

-- --- undangan: baca semua, terbitkan hanya pengelola, penukaran oleh siapa pun
--     (penanda dipakai ditambahkan saat penukaran)
alter table public.undangan enable row level security;
drop policy if exists "undangan baca" on public.undangan;
create policy "undangan baca" on public.undangan for select to authenticated using (true);
drop policy if exists "undangan tulis" on public.undangan;
create policy "undangan tulis" on public.undangan for all to authenticated
  using (public.is_pendidik()) with check (public.is_pendidik());

-- --- soal & pelajaran: baca isi ruang, tulis tenaga pendidik
alter table public.soal enable row level security;
drop policy if exists "soal baca" on public.soal;
create policy "soal baca" on public.soal for select to authenticated using (true);
drop policy if exists "soal tulis" on public.soal;
create policy "soal tulis" on public.soal for all to authenticated
  using (public.is_pendidik()) with check (public.is_pendidik());

alter table public.pelajaran enable row level security;
drop policy if exists "pelajaran baca" on public.pelajaran;
create policy "pelajaran baca" on public.pelajaran for select to authenticated using (true);
drop policy if exists "pelajaran tulis" on public.pelajaran;
create policy "pelajaran tulis" on public.pelajaran for all to authenticated
  using (public.is_pendidik()) with check (public.is_pendidik());

-- --- jadwal: baca semua, tulis tenaga pendidik
alter table public.jadwal enable row level security;
drop policy if exists "jadwal baca" on public.jadwal;
create policy "jadwal baca" on public.jadwal for select to authenticated using (true);
drop policy if exists "jadwal tulis" on public.jadwal;
create policy "jadwal tulis" on public.jadwal for all to authenticated
  using (public.is_pendidik()) with check (public.is_pendidik());

-- --- kurikulum: baca semua, tulis tenaga pendidik/pengelola
alter table public.kurikulum enable row level security;
drop policy if exists "kurikulum baca" on public.kurikulum;
create policy "kurikulum baca" on public.kurikulum for select to authenticated using (true);
drop policy if exists "kurikulum tulis" on public.kurikulum;
create policy "kurikulum tulis" on public.kurikulum for all to authenticated
  using (public.is_pendidik()) with check (public.is_pendidik());

-- --- buku: baca semua, tulis tenaga pendidik/pengelola
alter table public.buku enable row level security;
drop policy if exists "buku baca" on public.buku;
create policy "buku baca" on public.buku for select to authenticated using (true);
drop policy if exists "buku tulis" on public.buku;
create policy "buku tulis" on public.buku for all to authenticated
  using (public.is_pendidik()) with check (public.is_pendidik());

-- --- industri: baca semua, tulis tenaga pendidik/pengelola (mitra)
alter table public.industri enable row level security;
drop policy if exists "industri baca" on public.industri;
create policy "industri baca" on public.industri for select to authenticated using (true);
drop policy if exists "industri tulis" on public.industri;
create policy "industri tulis" on public.industri for all to authenticated
  using (public.is_pendidik()) with check (public.is_pendidik());

-- --- log: tulis semua akun terautentikasi, baca hanya pengelola,
--     hapus hanya pengelola (tombol Bersihkan Log)
alter table public.log enable row level security;
drop policy if exists "log tulis" on public.log;
create policy "log tulis" on public.log for insert to authenticated with check (true);
drop policy if exists "log baca" on public.log;
create policy "log baca" on public.log for select to authenticated using (public.is_pengelola());
drop policy if exists "log hapus" on public.log;
create policy "log hapus" on public.log for delete to authenticated using (public.is_pengelola());

-- --- mfa: hanya pengelola
alter table public.mfa enable row level security;
drop policy if exists "mfa pengelola" on public.mfa;
create policy "mfa pengelola" on public.mfa for all to authenticated
  using (public.is_pengelola()) with check (public.is_pengelola());

-- --- gagal_masuk: baca hanya pengelola; catat saat mencoba masuk
alter table public.gagal_masuk enable row level security;
drop policy if exists "gagal baca" on public.gagal_masuk;
create policy "gagal baca" on public.gagal_masuk for select to authenticated using (public.is_pengelola());
drop policy if exists "gagal tulis" on public.gagal_masuk;
create policy "gagal tulis" on public.gagal_masuk for all to authenticated
  using (true) with check (true);

-- --- profiles: baca diri sendiri + pengelola; perubahan status hanya pengelola
drop policy if exists "profiles baca" on public.profiles;
create policy "profiles baca" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_pengelola() or public.is_pendidik());
drop policy if exists "profiles ubah sendiri" on public.profiles;
create policy "profiles ubah sendiri" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- =====================================================
--  Indeks percepatan kueri ruang & audit
-- =====================================================
create index if not exists idx_nilai_ruang      on public.nilai (ruang);
create index if not exists idx_progres_ruang    on public.progres (ruang);
create index if not exists idx_kegiatan_ruang   on public.kegiatan (jenjang);
create index if not exists idx_jadwal_ruang     on public.jadwal (jenjang);
create index if not exists idx_kurikulum_ruang  on public.kurikulum (jenjang, status);
create index if not exists idx_buku_ruang       on public.buku (jenjang);
create index if not exists idx_industri_ruang   on public.industri (jenjang);
create index if not exists idx_soal_ruang       on public.soal (ruang);
create index if not exists idx_pelajaran_ruang  on public.pelajaran (ruang);
create index if not exists idx_log_tgl          on public.log (tgl desc);

-- =====================================================
--  CATATAN
--  • Nama & peran pengguna awal disimpan di auth.users.user_metadata
--    saat pendaftaran → trigger trg_on_auth_user_created menyalinnya
--    ke public.profiles (verifikasi lembaga: pilih lembaga → menunggu,
--    disetujui Admin/Super lewat kolom verif).
--  • Mode lokal TIDAK membutuhkan tabel ini — semua data hidup di
--    localStorage/IndexedDB perangkat.
--  • Kunci MFA & kode MASTER sebaiknya diisi/dibaca lewat Service Role
--    atau Edge Function supaya kode tidak terbaca klien biasa.
--  • Anti brute-force idealnya dicatat server-side (Edge Function) —
--    tabel gagal_masuk disediakan untuk itu.
--  • Kolom jenjang pada tabel ruang dipakai memisahkan SD/SMP/SMA-Kuliah
--    seperti ruang terpisah di mode lokal.
-- =====================================================
