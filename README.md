# ✨ Kuradapt

**Kurikulum Hidup, Masa Depan Terarah.** — *Belajar Adaptif, Kerja Responsif.*

**Kurikulum Pendamping lintas jenjang SD hingga Kuliah.** Saat kurikulum sekolah formal lambat diperbarui karena birokrasi, Kuradapt memperbarui materinya **setiap bulan** mengikuti perkembangan teknologi dan kebutuhan industri global terbaru.

Versi: **3.4.0** · Gratis · Bisa offline · Bisa di-install di HP (PWA)
**Lisensi: © 2026 DAFFTECH — All Rights Reserved** ([Situs resmi](https://daffaull18.github.io/dafftech-v2/) · `LICENSE`)

---

## 🧭 Alur Aplikasi v2

1. **Masuk** (halaman pertama saat platform dibuka — desain split panel gelap) & **Daftar** (wizard 3 langkah di atas latar berbeda) — sengaja dibuat berbeda total.
2. **Pilih Jenjang** → masuk ke **ruang jenjang yang terpisah** (Mini SD · Muda SMP · Mahir SMA/SMK · Tinggi Kuliah).
3. Tiap ruang punya 7 tab sendiri: **Beranda · Pengumuman · Materi · Latihan · Transkrip · Dokumen · Kegiatan** (tab **Kelola** khusus Admin/Operator).
4. **Papan Pengumuman** punya dua pintu:
   - **`#/pengumuman` — halaman khusus pengumuman**: murni daftar info (header + **semua** kartu pengumuman), tanpa hero/pilar/fitur, **terkunci viewport — tidak bisa di-scroll atas-bawah** (muat penuh se-layar; di layar pendek subjudul/tag otomatis dirapatkan). **Teks kartu tidak pernah terpotong** — baris grid selalu seukuran isi (`grid-auto-rows: max-content`); hanya bila layar benar-benar sempit daftar menggulir internal lewat scrollbar tipis. Dibuka lewat tautan *"Lihat papan pengumuman"* di halaman Masuk/Daftar serta link *Papan Pengumuman* di menu & footer.
   - **`#/beranda` — landing tersembunyi** (hero, 4 pilar, fitur): tetap ada, dibuka lewat URL langsung. Membuka `#/` (atau rute kosong) langsung diarahkan ke halaman Masuk.
   - **Nav atas (Beranda · Pengumuman · 4 Jenjang · Fitur) disembunyikan** di semua halaman — halaman jadi bersih: hanya logo, tombol tema, dan Masuk/Daftar Gratis.

---

## 🚀 Cara Menjalankan
1. Buka folder ini, **klik dua kali `index.html`** — aplikasi langsung jalan di browser.
2. Tidak perlu server/installasi. Bisa juga di-host gratis (GitHub Pages/Netlify) agar dapat link bersama.
3. Tombol **☾/☀ di topbar** = ganti tema **night / terang**.

> Data tersimpan otomatis di perangkat (localStorage + IndexedDB) — progres tetap ada walau browser ditutup.

---

## ⚡ Fitur Utama

| Fitur | Penjelasan |
|---|---|
| 📢 **Papan Pengumuman Live** | Muncul di halaman depan & tiap ruang; guru/dosen/industri bisa menerbitkan langsung (sinkron antar-tab via BroadcastChannel) |
| 🏫 **Ruang Terpisah per Jenjang** | SD, SMP, SMA/SMK, Kuliah punya ruang sendiri — materi, soal, transkrip, dan pengumuman tidak tercampur |
| 📚 **Materi + Bank Soal** | 5 jenjang · 31 peta mapel · **1.250+ soal** ber-pembahasan — 8–12 soal bervariasi per bab (diperbarui tiap bulan) |
| ⚡ **Latihan Adaptif + Remedial** | Kuis per bab/acak, deteksi soal salah, **remedial adaptif** otomatis, nilai terbaik tersimpan |
| 📝 **Transkrip Nilai Nyata** | **Semua nilai mulai 0 / "Belum dikerjakan"** — hanya terisi setelah dikerjakan atau diinput pengajar. Komponen Tugas 30% · UH 30% · UAS 40%, predikat A–E (kosong = "—"), KKM 75; kuliah: kode matkul, SKS, bobot, **IPK 4.00** · ekspor CSV |
| 📊 **Tab Pantau (tenaga pendidik)** | Guru/Dosen/Mitra Industri/Admin/Operator memantau progres belajar tiap peserta (bab, latihan, rata nilai, status) lintas jenjang + **input / perbarui / kosongkan nilai** per peserta per mapel |
| 🧩 **Pelajaran & Soal buatan Pengajar** | Tambah mata pelajaran + bab isi materi langsung dari ruang, lalu **buat paket soal** (draf → terbitkan) yang dikerjakan peserta — nilainya langsung masuk transkrip |
| ✏️ **CRUD Papan Pengumuman** | Tenaga pendidik bisa **Ubah / Hapus** kartu pengumuman (termasuk bawaan) — merge by-id, perubahan live ke semua tab |
| 🔑 **Pendaftaran Pengelola Berkode** | Akun Admin Sistem & Operator wajib **kode undangan aktif** (masa berlaku 180 hari, terikat peran) — kecuali pendaftar pengelola pertama |
| 📁 **Dokumen Digital** | Unggah & simpan tugas/jurnal/berkas (IndexedDB), unduh & hapus kapan saja |
| 🌙 **Tema Night & Terang** | Satu ketukan di topbar, tersimpan di perangkat |
| 👑 **Super Admin (peran ke-11)** | Pendaftar Super pertama lewat tautan khusus di wizard; setelah itu hanya dengan **kode undangan MASTER** — mengatur kewenangan pengelola (aktif/nonaktif) & menerbitkan kode MASTER |
| 🏛️ **Verifikasi Lembaga** | Pendaftar yang memilih provinsi → kabupaten → **lembaga** (referensi offline 38 provinsi + 44 lembaga Dapodik/PDDikti) statusnya **menunggu** — login ditolak sampai Admin/Super menyetujui |
| 📚 **Perpustakaan Digital** `#/perpustakaan` | Koleksi buku & modul gratis — **baca langsung di halaman** (tanpa mengunduh berkas), tenaga pendidik bisa menambah/menghapus judul |
| 📜 **Sistem Kurikulum** `#/kurikulum` | Kurikulum **ber-versi & ber-periode** — versi baru otomatis berlaku, versi lama jadi riwayat (tidak pernah terhapus), bisa diaktifkan ulang |
| 📅 **Pertemuan Online** (tab Kegiatan) | Jadwal konferensi video + tautan + kode undangan `RAPAT-XXXX`, status Akan/Berlangsung/Selesai, gabung & hapus |
| 🏭 **Koneksi Dunia Industri** `#/industri` | Mitra menerbitkan pelatihan/magang/lowongan → peserta **Ajukan Izin** → mitra **Izinkan/Tolak** (ada di daftar & audit log) |
| 🛡️ **Audit Log & Keamanan** | 14 tipe log aktivitas (nilai, pengumuman, kurikulum, verifikasi, …) + catat insiden + bersihkan log; **MFA opsional** 2 tahap saat masuk pengelola; **kunci 5 menit setelah 5 percobaan gagal** |
| 🔔 **Pusat Pemberitahuan** `v3.3` | Lonceng di topbar + panel riwayat: **soal, dokumen, nilai, pengumuman, jadwal, kegiatan, verifikasi, undangan, keamanan** — disaring per email & jenjang, penanda *sudah/belum dibaca*, **notifikasi sistem browser** (izin lewat tombol di panel), opsional **email Google** lewat Web App Apps Script (`NOTIF_WEBHOOK` di `config.js`) |
| 👤 **Profil Semua Pengguna** `#/profil` | Halaman profil tiap jenjang & peran: avatar, bio (bisa diedit), peran/jenjang/tanggal bergabung, 4 statistik (pengumuman, dokumen, kegiatan, rata-rata nilai), riwayat pemberitahuan, tombol keluar — plus **tombol Profil** di kartu pengumuman, daftar anggota ruang, dan panel pengelola |

## 🎯 Empat Pilar Jenjang Kuradapt

| Pilar | Jenjang | Fokus |
|---|---|---|
| 🎮 **Kuradapt Mini** | SD | Adaptasi logika dasar: matematika kontekstual, sains berbasis eksperimen rumah tangga, literasi digital dasar lewat game interaktif |
| 🧭 **Kuradapt Muda** | SMP | Penemuan minat & bakat — kurikulum beradaptasi dengan kecenderungan otak anak (seni, sains, atau sosial) |
| ⚡ **Kuradapt Mahir** | SMA/SMK | Menghapus keterlambatan ilmu: AI, Digital Marketing, Coding dengan standar industri sebelum diajarkan sekolah |
| 🚀 **Kuradapt Tinggi** | Kuliah | Project-Based Learning: studi kasus perusahaan besar untuk magang virtual & portofolio |

---

## 🚪 Ruang Terpisah (bukan satu halaman)

| Ruang | Alamat | Penghuni | Isi |
|---|---|---|---|
| **Halaman Masuk** | `#/masuk` | siapa saja (halaman pertama saat platform dibuka) | login split panel + tautan kecil ke papan pengumuman |
| **Pilih Jenjang** | `#/pilih` | akun dengan sesi aktif | kartu 4 jenjang (terbuka/terkunci), penukaran kode undangan |
| **Ruang per Jenjang** | `#/r/mini` · `#/r/muda` · `#/r/mahir` · `#/r/tinggi` | sesuai jenjang akun | 7 tab (peserta): Beranda · Pengumuman · Materi · Latihan · Transkrip · Dokumen · Kegiatan — tenaga pendidik bertambah tab **Kelola** (admin/operator) & **Pantau** (progres + input nilai) |
| **Panel Admin** | `#/admin` | **Admin Sistem** & **Super Admin** (Operator tetap diblokir) | statistik platform, pengguna, kegiatan, kode undangan, **verifikasi lembaga**, **kewenangan pengelola** (Super), **MFA + audit log + insiden**, pintasan layanan |
| **Perpustakaan Digital** | `#/perpustakaan` | akun dengan sesi aktif | buku & modul gratis — **baca langsung di halaman** (tanpa mengunduh berkas), tenaga pendidik bisa tambah/hapus |
| **Sistem Kurikulum** | `#/kurikulum` | akun dengan sesi aktif | versi & periode penerapan per jenjang — riwayat tersimpan & bisa diaktifkan ulang |
| **Koneksi Dunia Industri** | `#/industri` | akun dengan sesi aktif | info pelatihan/magang/lowongan mitra + pengajuan & izin akses peserta |
| **Pengumuman** (halaman khusus) | `#/pengumuman` | siapa saja lewat tautan kecil / menu / footer | murni papan pengumuman: header + **semua** kartu info — **terkunci viewport, tidak bisa di-scroll** (muat se-layar; kartu 4 kolom; teks tak terpotong, gulir internal hanya bila layar sempit) |
| **Papan Pengumuman** (landing tersembunyi) | `#/beranda` | siapa saja lewat URL langsung / setelah keluar | hero live, section pengumuman, 4 pilar jenjang, fitur — **nav atas disembunyikan** |

- **Penjaga peran (guard) di router**: ruang jenjang hanya bisa dibuka pemiliknya; Guru tidak bisa membuka ruang dosen/mahasiswa; tanpa sesi, semua rute terlindungi diarahkan ke `#/masuk`.
- **Semua tujuan "Keluar"** (modal konfirmasi di halaman Profil, menu mobile, API `K.keluar()`) membawa Anda kembali ke **`#/beranda`** — papan pengumuman, bukan ke login. (v3.3: chip user **tidak lagi membuka modal keluar** — klik chip = buka `#/profil`.)
- Ruang tiap jenjang **tidak pernah digabung** — tampilan, menu, dan isi keduanya berbeda penuh.

---

## 🧱 Tiga Lapis Kesiapan (yang sudah dibangun)

### ✅ Lapis 1 — "Kelihatan Asli"
- **PWA**: icon, manifest, service worker → bisa *Install app* di HP, jalan offline.
- **Tabel input nilai guru**: 16 peserta didik, nilai & catatan bisa dikoreksi → rata-rata, tuntas, rekomendasi remedial menyesuaikan otomatis.
- **Ekspor CSV** (buka di Excel) & **Cetak laporan A4** (tombol Cetak → tampil rekap rapi siap tanda tangan).
- **Sertifikat + kode verifikasi unik** (PN-2026-XXXXXX) terbit otomatis: kuis ≥70, lulus modul, selesai proyek — bisa dicetak.
- **Remedial adaptif Pilar 1**: tiap soal yang salah dicatat sistem, layar hasil menawarkan *Program Remedial Adaptif* (diulang **hanya soal yang belum dikuasai**), nilai terbaik yang dipakai, dan sertifikat "Remedial Pilar 1" terbit bila tuntas.
- **Tentang Aplikasi**: visi, versi, kontak, lisensi, kepatuhan regulasi.

### ✅ Lapis 2 — "Benar-Benar Bisa Dipakai"
- **Akun Masuk/Daftar** dengan peran: **Guru · Dosen** · Siswa · Mahasiswa · Industri (chip nama + peran di header, tombol Keluar). Peran Dosen otomatis memakai Ruang Guru.
- **Mode Lokal** (default, tanpa server) & **Mode Online (Supabase)** — aktif otomatis begitu `config.js` diisi.
- **Kode Kelas**: guru membuat kode 6 karakter → siswa masuk lewat panel *Gabung Kelas*.
- **Sinkronisasi database** (mode online): perubahan data diunggah otomatis (debounce 1,5 detik) & data terakhir diundun saat login.
- **Keamanan akun (v3.2.0)**: password di-hash **SHA-256 3.000 iterasi + salt acak per akun** (`k2$…` — versi lama `k$` djb2 otomatis dinaikkan saat masuk), **sesi ber-tanda HMAC kedaluwarsa 8 jam** (penyuntingan localStorage → sesi dicabut + insiden dicatat), **kunci masuk berjenjang 5 gagal → 5 menit · 10 → 15 menit · 15 → 30 menit**, tautan hanya `http(s)` (menolak `javascript:`), dan **Content-Security-Policy tanpa `unsafe-inline`** + header keamanan di `_headers` (HSTS, nosniff, anti-frame) untuk menutup celah injeksi skrip pihak ketiga.
- **Pusat pemberitahuan (v3.3.0)**: tiap aksi tenaga pendidik (kirim **soal, dokumen, nilai, pengumuman, jadwal, kegiatan**, hasil **verifikasi**, **undangan** ruang, ubah **kewenangan**) otomatis mengirim pemberitahuan ke penerimanya — tampil di **lonceng topbar** & **halaman Profil**, bisa sekalian muncul sebagai **notifikasi browser**. Untuk kiriman **email ke akun Google pengguna**, isi `NOTIF_WEBHOOK` di `config.js` dengan URL *Web App* **Google Apps Script** milik Anda (langkah + kodenya ada di `DEPLOY.md` — kuota gratis 100 email/jam); tanpa itu, notifikasi tetap jalan dalam aplikasi.
- **Profil pengguna (v3.3.0)**: `#/profil` menampilkan identitas, bio, statistik, dan riwayat pemberitahuan tiap akun; tombol **Profil** juga menempel di kartu pengumuman, daftar anggota ruang (`#shAnggota`), dan panel pengelola. **Penghapusan akun** tersedia di `#/admin` → *Daftar Pengguna* (hapus orang lain maupun akun sendiri; sesi berakhir otomatis, **email langsung bisa dipakai mendaftar ulang**).
- **Materi semua jenjang (v3.4.0)**: rute `#/materi` menampilkan **seluruh isi bab SD · SMP · SMA · SMK · Kuliah** (31 mata pelajaran · 126 bab) untuk **dibaca langsung di halaman** — filter per jenjang, pencarian judul bab/mapel, dan materi bab terbuka lazily saat dipilih. Pintasannya ada di *Layanan Platform* (layar pilih ruang), *Pintasan Platform* (`#/admin`), dan footer.
- **Perpustakaan mode baca (v3.4.0)**: tombol **Unduh .txt dihapus** — judul buku kini dibuka sebagai **artikel baca penuh di halaman** (`Baca` → mode baca → kembali ke daftar), jadi tidak ada lagi unduhan berkas teks.
- **Ruang live kegiatan (v3.4.0)**: tombol **Gabung Kegiatan** kini membuka **ruang kegiatan sungguhan** — daftar kehadiran *live*, **chat ruangan** (tersimpan & sinkron antar jendela), **angkat tangan**, serta **tautan video Zoom / Google Meet** milik tuan rumah yang dibuka lewat tombol *Gabung Video*. **Aturan tuan rumah**: peserta yang datang saat guru/dosen pembuat belum hadir melihat layar *"Menunggu tuan rumah"*; alat tuan rumah (mulai kegiatan, pasang tautan) hanya muncul untuk tenaga pendidik ruang.
- **Bank soal diperkaya (v3.4.1)**: jumlah soal latihan **756 → 1.253 soal** di seluruh 5 jenjang (126 bab) — tiap bab kini **8–12 soal bervariasi** sehingga jumlah soal tiap mata pelajaran berbeda-beda (tidak lagi 24 seragam), seluruhnya ber-pembahasan dan berimbang kunci jawabannya.

### ✅ Lapis 3 — "Dipercaya Sekolah"
- **Peta Kurikulum Merdeka** (tombol 📜 di Bank Silabus): CP & TP per fase — SD Fase B (IPAS), SMP Fase D (IPA), SMA Fase F (Informatika), SMK (OKUPASI/LSP), Kuliah (CPL Prodi TI).
- **Peta Penyetaraan Kurikulum 2013/KTSP → Merdeka** (di modal yang sama, juga lewat pintu di **Pilar 3**): 12 baris KD/KK lama dipetakan ke CP/TP Merdeka lengkap status *Setara penuh · Setara + penajaman · Perlu asesmen baru*, plus pencarian padanan (kode KD, fase, LSP, P5, CPL).
- **Setiap soal kuis menampilkan rujukan CP/TP**-nya di pembahasan.
- **Setiap modul industri menampilkan skema sertifikasi** (LSP Informatika, BNSP, OKUPASI SMK).

---

## ☁️ Aktifkan Mode Online (Supabase, gratis ±10 menit)

1. Daftar di **supabase.com** → *Create new project* (region: Singapore).
2. Buka **SQL Editor** → jalankan isi file `supabase-schema.sql` (sudah disediakan).
3. Buka **Settings → API** → salin *Project URL* dan *anon public key*.
4. Tempel ke `config.js`:
   ```js
   SUPABASE_URL: "https://xxxx.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGciOi..."
   ```
5. Simpan → buka aplikasi → tombol **Masuk** kini memakai akun sungguhan, data tersinkron antar perangkat.

> Tanpa langkah di atas, aplikasi tetap **100% berjalan** dalam mode lokal.

---

## 🌐 Publish ke Hosting Gratis (GitHub Pages / Netlify / Cloudflare)

Aplikasi ini adalah **static single-page file** (`index.html`) — tidak perlu build. Bisa di-host gratis di mana saja.

### Opsi A — GitHub Pages (direkomendasikan)

1. Buat repositori baru di GitHub (nama bebas, mis. `kuradapt`), **jangan** inisialisasi README.
2. Di folder project lokal, jalankan:
   ```powershell
   git init
   git add .
   git commit -m "Kuradapt v2.0.0 - release"
   git branch -M main
   git remote add origin https://github.com/USERNAME/kuradapt.git
   git push -u origin main
   ```
3. Di GitHub: **Settings → Pages** → Build and deployment → Source: **Deploy from a branch** → Branch: `main` → Save.
4. Tunggu ~1 menit. Aplikasi akan muncul di `https://USERNAME.github.io/kuradapt/`.

### Opsi B — Netlify (drag & drop, paling cepat)

1. Masuk ke **netlify.com** → klik **Add new site → Deploy manually**.
2. Seret seluruh folder `kuradapt/` (isi, bukan folder itu sendiri) ke area upload.
3. Selesai — Netlify akan givekan link `https://xxxx.netlify.app`.
4. (Opsional) Untuk custom domain: **Site settings → Domain management → Add custom domain**.

### Opsi C — Cloudflare Pages (DDoS protection + WAF gratis)

1. Masuk ke **dash.cloudflare.com** → **Workers & Pages → Create → Pages → Upload assets**.
2. Seret isi folder `kuradapt/` → deploy → dapat link `https://xxxx.pages.dev` (HTTPS otomatis).
3. Bonus proteksi gratis langsung aktif: **DDoS mitigation unmetered**, **WAF ruleset**, **Browser Integrity Check**, TLS/HTTPS + redirect HTTPS, DNSSEC.
4. (Opsional) Domain sendiri: tambahkan domain di Cloudflare lalu nyalakan **proxy** (awan oranye) agar selalu lewat jaringan pelindungnya.
5. File `_headers` otomatis dibaca Cloudflare Pages → HSTS, nosniff, anti-frame, dan CSP ikut terkirim.

> Catatan jujur: Cloudflare melindungi **trafik ke domain Anda**. Login mode lokal terjadi di dalam browser (localStorage) — di situ penjagaannya ada di aplikasi: hash SHA-256 iterasi, sesi ber-sign, kunci berjenjang, CSP. Data Supabase dijaga **RLS** di database.

> Catatan: Rute aplikasi pakai **hash** (`#/guru`, `#/siswa`), jadi berjalan normal pada static hosting tanpa aturan redirect khusus. File `_redirects` dan `netlify.toml` sudah disediakan untuk fallback.

---

## 🔗 Pemetaan ke Soal (5 Permasalahan)

| No. | Permasalahan | Solusi di Kuradapt |
|---|---|---|
| 1 | Rendahnya mutu & hasil belajar (TI belum optimal) | Simulasi + kuis interaktif, dasbor pemantauan hasil belajar & input nilai guru |
| 2 | Kesenjangan kompetensi digital guru | Bank silabus 30 template + 6 modul pelatihan bertingkat + indikator keberhasilan |
| 3 | Link & Match dengan dunia kerja | Analisis gap kompetensi ↔ DUDI, modul praktisi industri, sertifikat berskema LSP/BNSP |
| 4 | Kesenjangan digital kota–desa | 100% **offline** (PWA), ringan, tanpa instalasi, berjalan di perangkat apa pun |
| 5 | Motivasi & partisipasi belajar rendah | Gamifikasi: poin, streak 7 hari, misi, sertifikat, skor kecocokan |

---

## 📁 Struktur Proyek
```
kuradapt/
├── index.html            ← shell aplikasi (topbar, menu, sprite 74 ikon + logo SVG)
├── styles.css            ← design system light/night + animasi + responsif
├── app.js                ← logika: router, auth, kriptografi, ruang jenjang, kuis, transkrip, dokumen
├── boot.js               ← anti-kedip tema (skrip eksternal, mendukung CSP ketat)
├── boot-route.js         ← anti-kedip rute (skrip eksternal, mendukung CSP ketat)
├── _headers              ← header keamanan (Cloudflare Pages & Netlify): HSTS, nosniff, CSP
├── LICENSE               ← lisensi resmi DAFFTECH (hak cipta)
├── config.js             ← kunci database online (kosong = mode lokal)
├── data-wilayah.js       ← referensi offline 38 provinsi + 44 lembaga (Dapodik/PDDikti menyusul)
├── manifest.webmanifest  ← konfigurasi PWA
├── sw.js                 ← service worker (cache offline)
├── icons/                ← icon PWA 192 & 512 px
├── supabase-schema.sql   ← skema database (jalankan di Supabase)
├── gen-icon.js           ← generator icon (Node.js, opsional)
├── test.js               ← 652 pengujian fungsional otomatis (jsdom) — 40 bagian, termasuk tes keamanan, notifikasi & ruang live
└── README.md
```

**Jalankan pengujian:**
```powershell
npm install jsdom
node test.js     # hasil: 652 LULUS / 0 GAGAL
```

---

## 🛡️ Lisensi & Hak Cipta (DAFFTECH)

```
Copyright (c) 2026 DAFFTECH. All Rights Reserved.
https://daffaull18.github.io/dafftech-v2/
```

Kuradapt adalah karya **DAFFTECH** dan dilindungi hak cipta (lihat file `LICENSE`).

| Boleh | Tidak Boleh |
|---|---|
| Dipakai gratis untuk pendidikan/non-komersial | Menghapus/mengganti nama **DAFFTECH** |
| Dipelajari & dimodifikasi untuk kebutuhan sendiri | Mengklaim aplikasi/kode sebagai **karya sendiri** |
| Didokumentasikan dengan **atribusi penuh** ke DAFFTECH | Menjual / memonetisasi tanpa izin |
| | Mendistribusikan ulang kode sumber termodifikasi |

- Tanda hak cipta otomatis tampil di: **footer situs**, **modal Tentang**, **sertifikat**, dan **laporan cetak**.
- Untuk lisensi komersial/kerja sama: **hello@dafftech.id**

---

## 📅 Roadmap
- Uji coba (pilot) di 1–2 sekolah + umpan balik guru
- Tugas daring: lampiran jawaban siswa berkas (unggah) lintas akun — butuh mode online *(pengiriman teks & status pengerjaan sudah berjalan di mode lokal)*
- Mode hemat kuota untuk daerah 3T & laporan rapor mutu sekolah

## 🛡️ Kepatuhan
UU No. 20/2003 Sisdiknas · Kurikulum Merdeka (CP/TP) · Link & Match DUDI (Permendikbudristek) · Kepemilikan data: UU PDP No. 27/2022.

---
© 2026 **DAFFTECH** — All Rights Reserved. https://daffaull18.github.io/dafftech-v2/ · Gratis dipakai untuk pendidikan, dilarang plagiarisme.
