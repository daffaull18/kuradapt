# 📅 KURADAPT — Roadmap & Ide Project Baru

> Dokumen perencanaan DAFFTECH · Disusun 18 November 2026
> Status rilis saat ini: **v3.5.0** — mode online Supabase + lupa/reset password

---

## 📍 Posisi Kita Sekarang

| Aspek | Status |
|---|---|
| Frontend | ✅ Selesai & stabil — 680 test lulus, 0 gagal |
| Backend (Supabase) | ✅ Aktif — Auth + tabel `user_data` + RLS per pengguna |
| Sinkron lintas perangkat | ✅ Berjalan (unggah debounce 1,5 dtk · gabung dua arah) |
| Reset password via Gmail | ✅ Berjalan |
| Hosting | 🟡 GitHub Pages live · Cloudflare Pages menunggu akun |
| Data konten | ✅ 126 bab · 1.253 soal ber-pembahasan |
| Pengguna nyata | ⬜ Belum ada — belum pilot |

**Kesimpulan jujur:** aplikasi sudah *jauh lebih siap* daripada yang dipakai. **Langkah terbesar berikutnya bukan menambah fitur, tapi membuktikan dipakai orang sungguhan.**

---

## 🗺️ ROADMAP KURADAPT

### 🥇 Fase 0 — Rapihin & Buktikan (Minggu 1–2) ← PRIORITAS

> Tujuan: aplikasi siap dipakai orang lain tanpa kita pegangi.

- [ ] **Cloudflare Pages** — deploy kedua (CDN global + DDoS protection gratis)
- [ ] **Domain sendiri** `kuradapt.id` / `dafftech.id/kuradapt` (±Rp 15–20rb/tahun)
- [ ] **Bersihkan akun uji** di Supabase → ganti jadi 1 akun demo resmi
- [ ] **Panduan singkat 1 halaman** (PDF) untuk guru: cara daftar, buat kelas, input nilai
- [ ] **Backup otomatis database** — Supabase free backup mingguan, catat cara restore
- [ ] **Uji beban ringan** — 5–10 orang buka bersamaan (pastikan RLS & rate limit aman)
- [ ] **Bug bash**: kumpulkan dari pemakaian nyata, perbaiki yang paling sering

**Keluaran:** aplikasi bisa ditunjukkan ke 1 sekolah tanpa ada yang merah.

---

### 🥈 Fase 1 — Nilai & Rapor (Minggu 3–6)

> Ini permintaan paling sering dari guru: *bukan cuma nilai, tapi **rapor***.

- [ ] **Laporan/Rapor per siswa** — ringkasan tiap mapel, predikat, kehadiran, catatan wali kelas
- [ ] **Ekspor PDF rapor** (layout resmi, kop sekolah, tanda tangan) — via `window.print()` sudah setengah jalan
- [ ] **Rekap kelas untuk guru** — tabel semua siswa × mapel, sort, filter, ekspor CSV/Excel
- [ ] **Riwayat nilai berjenjang waktu** — grafik perkembangan siswa (naik/turun per UH)
- [ ] **Komponen nilai bisa diatur sekolah** — default 30/30/40, tapi boleh diganti (Tugas/UH/UTS/UAS)
- [ ] **Persetujuan wali kelas** — status "draft → disetujui → terbit" sebelum rapor terlihat siswa
- [ ] **Catatan perilaku & ekstrakurikuler** di rapor

**Keluaran:** guru bisa cetak rapor dari aplikasi → *nilai jual utama ke sekolah*.

---

### 🥉 Fase 2 — Tugas Daring Lintas Akun (Minggu 7–10)

> Roadmap lama yang tertunda karena butuh mode online — **sekarang sudah bisa**.

- [ ] **Guru memberi tugas** — deskripsi, tenggat, lampiran materi
- [ ] **Siswa mengunggah jawaban** — berkas (gambar/PDF/ZIP) ke **Supabase Storage**
- [ ] **Guru menilai** — skor + komentar per siswa → otomatis masuk transkrip
- [ ] **Status pengerjaan** — belum mulai / mengumpul / dinilai / terlambat
- [ ] **Pengumuman tenggat** otomatis (H-1, H-0) ke Pusat Pemberitahuan
- [ ] **Batas ukuran & jenis berkas** (keamanan) + pembersihan berkas lama

**Keluaran:** Kuradapt jadi LMS ringan yang benar-benar bisa dipakai harian.

---

### Fase 3 — Jangkauan Lebih Luas (Minggu 11–16)

**3a. Hemat kuota (daerah 3T)**
- [ ] PWA penuh: install ke HP, jalan tanpa internet
- [ ] Simpan materi & soal untuk dibaca offline (Cache API sudah ada fondasinya)
- [ ] Mode "hemat kuota" — gambar dikompres, sinkron hanya saat Wi-Fi

**3b. Multi-bahasa & aksesibilitas**
- [ ] Inggris untuk konten internasional / siswa asing
- [ ] Mode dyslexia-friendly (font khusus), ukuran teks dapat diubah
- [ ] Kontras tinggi untuk pengguna low vision

**3c. Penilaian lebih kaya**
- [ ] Soal pilihan ganda, benar-salah, isian singkat, **essay (dinilai guru)**
- [ ] **Bank soal bersama** — guru saling berbagi paket soal antar sekolah
- [ ] **Kuis langsung (live)** — semua siswa kerjakan bersama, papan peringkat real-time
- [ ] Analitik soal: tingkat kesukaran & ketepatan kunci jawaban otomatis

---

### Fase 4 — Skala & Kepercayaan (Bulan 4–6)

- [ ] **Admin sekolah mandiri** — sekolah daftar sendiri, kelola sendiri, tanpa DAFFTECH
- [ ] **Undangan massal siswa** — guru unggah daftar nama (CSV) → akun dibuat otomatis
- [ ] **Laporan mutu sekolah** — rekap untuk akreditasi (data siap upload BOS/rapor mutu)
- [ ] **Kepatuhan UU PDP** — halaman persetujuan data, hak hapus data, kebijakan privasi
- [ ] **Keamanan lanjutan** — 2FA wajib pengelola, deteksi login aneh, enkripsi data sensitif
- [ ] **Pantau biaya Supabase** — siap naik plan bila pengguna meledak (free tier: 50rb user, 500MB)

---

## 💡 IDE PROJECT BARU (DAFFTECH)

### 🎯 Yang paling nyambung dengan Kuradapt

| # | Project | Kenapa | Perkiraan |
|---|---|---|---|
| 1 | **Kuradapt Sekolah** (white-label) | Versi bermerek sekolah — logo & domain sendiri per sekolah. **Model bisnis paling jelas**: sekolah bayar lisensi tahunan | 2–3 minggu |
| 2 | **Bank Soal Bersama** | Terpisah dari Kuradapt tapi saling terhubung — guru berbagi soal lintas sekolah, ada sistem voting & rating kualitas | 2 minggu |
| 3 | **Rapor Digital Dapodik Bridge** | Ekspor data Kuradapt → format Dapodik/Kemendikbud — sekolah langsung pakai tanpa input ulang | 1–2 minggu |
| 4 | **Kuradapt Paud/TPA** | Segmen yang belum disentuh siapa pun — kelas usia dini, fokus motorik & moral, sangat dicari orang tua | 2 minggu |

### 🔥 Yang berpotensi besar sendiri

| # | Project | Kenapa | Perkiraan |
|---|---|---|---|
| 5 | **Absensi QR Sekolah** | Scan QR masuk kelas → laporan kehadiran otomatis ke wali siswa. Masalah nyata di tiap sekolah, penyelesaian sederhana | 1–2 minggu |
| 6 | **Jadwal Pelajaran Otomatis** | Algoritma penjadwalan (guru, ruang, jam, konflik) — guru piket sering pusing. *Sulit tapi sangat berharga* | 3–4 minggu |
| 7 | **Perpustakaan Sekolah QR** | Scan buku → pinjam/kembali → denda otomatis → notifikasi ke siswa | 1 minggu |
| 8 | **PPDB Online** | Pendaftaran siswa baru online: formulir, seleksi, pengumuman, daftar ulang. **Musiman tapi dicari tiap tahun** | 2–3 minggu |
| 9 | **Kantin/POS Sekolah** | Kasir digital + laporan harian untuk koperasi sekolah | 1–2 minggu |
| 10 | **Guru Les / Bimbel Online** | Marketplace atau sistem kelas untuk pengajar privat — sesuai pengalaman Kuradapt | 3 minggu |

### 🧰 Tool internal DAFFTECH (murah, cepat, berguna)

| # | Project | Fungsi |
|---|---|---|
| 11 | **Dafftech Landing v3** | Perbarui situs portofolio dengan showcase Kuradapt live |
| 12 | **Status Page** | Halaman status layanan DAFFTECH (operasional/maintenance) — kesan profesional |
| 13 | **Template Boilerplate** | Fondasi SPA + Supabase + auth + RLS yang sudah teruji (dipakai ulang untuk project 5–10) |
| 14 | **Invoice & Laporan Bulanan** | Untuk tagihan klien sekolah/komersial |

---

## ⭐ REKOMENDASI SAYA (urutan pengerjaan)

```
1. Cloudflare Pages + bersihkan akun uji     ← 1 hari, wajib
2. Fase 1: Rapor PDF + rekap kelas           ← nilai jual terbesar
3. Fase 2: Tugas daring lintas akun          ← fitur paling ditunggu guru
4. Absensi QR Sekolah (project baru #5)      ← jualan terpisah, cepat jadi
5. Kuradapt Sekolah white-label (#1)         ← mulai dapat pemasukan
```

**Prinsipnya:** *satu fitur yang dipakai setiap hari > sepuluh fitur yang hanya demen dilihat.*

---

## 📏 Aturan Main (jangan dilanggar)

1. **680 test harus tetap lulus** setiap kali mengubah kode — `node test.js`
2. **Mode lokal dulu, online lapisan** — bila Supabase gagal, aplikasi tetap jalan penuh
3. **Jangan sentuh kontrak UI**: 7 tab siswa · 4 `.stat-card` kelola · 8 link menu mobile · `tbNav` 4 link · `#/admin` khusus admin+super
4. **Keamanan**: sandi selalu di-hash (SHA-256 3.000 iterasi + salt), sesi ber-HMAC, RLS wajib aktif
5. **Nama DAFFTECH tidak boleh dihapus** dari mana pun (footer, sertifikat, laporan)

---

## 📆 Ringkasan Timeline

| Periode | Fokus | Milestone |
|---|---|---|
| Minggu 1–2 | Rapihin & buktikan | Cloudflare live, panduan guru, bug bash |
| Minggu 3–6 | **Rapor & rekap nilai** | Guru bisa cetak rapor ← *titik jual* |
| Minggu 7–10 | **Tugas daring** | LMS ringan lengkap |
| Minggu 11–16 | Jangkauan | Offline/PWA, multi-bahasa, kuis live |
| Bulan 4–6 | Skala | Sekolah mandiri, PPDP bridge, kepatuhan PDP |
| Paralel | Project baru | Absensi QR → white-label → PPDB |

---

© 2026 **DAFFTECH** — All Rights Reserved.
