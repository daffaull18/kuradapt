# 🚀 Kuradapt — Panduan Deploy Online (Hosting + Supabase)

Panduan ini untuk mempublikasikan Kuradapt agar bisa dibuka **dari mana saja oleh banyak orang**, dengan akun & data tersimpan di **Supabase** (login lintas perangkat).

Total waktu: **~15–20 menit** | Biaya: **Gratis**

---

## Langkah 1: Buat Project Supabase (Database Online)

1. Buka [https://supabase.com](https://supabase.com) → Daftar / Masuk.
2. Klik **"New Project"**.
3. Isi:
   - **Name**: `kuradapt`
   - **Database Password**: (simpan aman, tidak perlu diingat untuk mode anon)
   - **Region**: pilih **Singapore** (terdekat Indonesia)
4. Klik **Create new project** → tunggu ~1–2 menit hingga siap.

## Langkah 2: Jalankan Skema Database

1. Di dashboard Supabase, klik menu kiri **SQL Editor** → **New query**.
2. Salin **seluruh isi** file `supabase-schema.sql` dari folder project.
3. Tempel ke kotak query → klik **Run**.
4. Pastikan pesan sukses (tidak ada error).

> Skema membuat tabel `public.user_data` dengan Row Level Security (tiap user hanya bisa akses data milik sendiri).

## Langkah 3: Ambil Kunci API (URL + Anon Key)

> ✅ **SUDAH DIISI** untuk project ini — `config.js` sudah berisi Project URL
> `https://qprrdwvwcpivfjgxqkdt.supabase.co` dan publishable key Supabase.
> Langkah ini hanya perlu diulang bila membuat project Supabase baru.

1. Di dashboard Supabase, klik menu kiri **Settings** → **API**.
2. Salin dua nilai ini:
   - **Project URL** → contoh: `https://abcdefghijklmnop.supabase.co`
   - **anon public key / publishable key** → contoh: `sb_publishable_BG6M7p...`

## Langkah 4: Isi config.js

> ✅ **SUDAH DIISI** — tidak perlu diubah lagi kecuali ganti project Supabase.

Buka file `config.js` di folder project (editor teks apa saja, mis. Notepad):

```js
window.KURADAPT_CONFIG = {
  SUPABASE_URL: "https://xxxx.supabase.co",      // ← tempel Project URL di sini
  SUPABASE_ANON_KEY: "sb_publishable_...",       // ← tempel publishable/anon key di sini
  NOTIF_WEBHOOK: ""                              // ← URL Web App Apps Script (opsional, lihat Langkah 4b)
};
```

Simpan file.

> Jika keduanya dikosongkan, aplikasi otomatis kembali ke **mode lokal** (data di perangkat).

## Langkah 4b: (Opsional) Notifikasi Email Google

Pemberitahuan (soal, dokumen, nilai, pengumuman, jadwal, kegiatan, verifikasi, undangan, keamanan)
sudah tampil **di dalam aplikasi** (lonceng topbar + halaman Profil) tanpa langkah apa pun.
Agar pemberitahuan **ikut terkirim sebagai email ke akun Google pengguna**, aktifkan jembatan
**Google Apps Script** (gratis, ±5 menit, memakai akun Google Anda sendiri):

1. Buka **<https://script.google.com>** → **New project**.
2. Ganti isi `Code.gs` dengan kode berikut:

   ```js
   function kirim(e) {
     var d = JSON.parse(e.postData.contents);          // { ke:[...], subjek, pesan, dari, tgl }
     MailApp.sendEmail({
       to: d.ke.join(","),                             // daftar email tujuan
       subject: d.subjek,                              // contoh: "Kuradapt · Soal baru: PTS Matematika"
       body: d.pesan + "\n\n— " + d.dari + " (" + d.tgl + ")"
     });
   }
   ```

3. **Deploy → New deployment →** ikon gerigi → type **Web app**:
   *Execute as*: **Me** · *Who has access*: **Anyone** → **Deploy**.
4. Salin **Web app URL** yang berakhiran `/exec`, lalu tempel ke `config.js`:

   ```js
   NOTIF_WEBHOOK: "https://script.google.com/macros/s/AKfy.../exec",
   ```

5. Simpan → muat ulang aplikasi → halaman **Profil** akan menampilkan status
   *"Email Google: aktif"*.

**Catatan jujur:**
- Kiriman memakai `mode: "no-cors"` (Apps Script tidak mengirim header CORS) — permintaan tetap
  terkirim, hanya respons yang tak bisa dibaca browser. Bila URL salah/isot, tidak ada error yang
  muncul di aplikasi; periksa tab *Executions* di Apps Script untuk memastikan.
- Kuota **Gmail gratis: 100 email/jam** (reset tiap jam).
- Tanpa `NOTIF_WEBHOOK`, aplikasi tetap 100% berfungsi — notifikasi hanya tampil di dalam aplikasi
  dan sebagai notifikasi sistem browser.
- Izin notifikasi **browser** diminta lewat tombol *"Aktifkan notifikasi browser"* di panel lonceng.

## Langkah 5: Pengaturan Wajib Supabase (URL Situs + Konfirmasi Email)

Dua pengaturan ini menentukan apakah **pendaftaran lintas perangkat** dan
**link "Lupa Kata Sandi"** bisa jalan:

### 5a. URL Situs (wajib — supaya link email kembali ke aplikasi)

1. Dashboard Supabase → **Authentication** → **URL Configuration**.
2. **Site URL**: isi `https://daffaull18.github.io/kuradapt/`
3. **Redirect URLs**: klik **Add URL** → isi `https://daffaull18.github.io/kuradapt/`
   (bila nanti pindah ke `https://kuradapt.pages.dev/`, tambahkan juga).
4. **Save**.

> Tanpa ini, link konfirmasi & link **Lupa Kata Sandi** akan mengarah ke halaman
> kosong Supabase, bukan ke aplikasi Kuradapt.

### 5b. Konfirmasi Email (disarankan: MATIKAN)

Supabase secara default mengirim email konfirmasi saat pendaftaran. Bila **menyala**,
akun baru belum bisa dipakai login di perangkat lain sampai dikonfirmasi lewat email.

1. Dashboard Supabase → **Authentication** → **Sign In / Providers** → **Email**.
2. Matikan **Confirm email** → **Save**.

*Bila dibiarkan menyala*: aplikasi tetap jalan penuh di perangkat pertama (mode lokal),
dan pengguna diingatkan lewat toast *"Cek Gmail untuk konfirmasi pendaftaran"* — setelah
dikonfirmasi, login lintas perangkat baru bisa dipakai. Untuk production dengan
pengguna awam, **matikan** agar tidak ada yang bingung.

## Langkah 6: Publish ke Hosting Gratis

Pilih salah satu:

### Opsi A — GitHub Pages (direkomendasikan)

1. Buat akun di [https://github.com](https://github.com) (jika belum punya).
2. Buat repositori baru: **New repository** → nama `kuradapt` → **Public** → jangan centang "Add a README file".
3. Di komputer Anda, buka PowerShell di folder project:

```powershell
cd "C:\Users\user\OneDrive\Desktop\project Dinzz\kuradapt"
git init
git add .
git commit -m "Kuradapt v3.5.0 — online Supabase + lupa sandi"
git branch -M main
git remote add origin https://github.com/USERNAME-ANDA/kuradapt.git
git push -u origin main
```

4. Di GitHub: buka repositori → **Settings** → **Pages** (menu kiri).
5. Di **Build and deployment** → Source: pilih **Deploy from a branch** → Branch: `main` → klik **Save**.
6. Tunggu ~1 menit. Aplikasi akan live di:
   `https://USERNAME-ANDA.github.io/kuradapt/`

### Opsi B — Netlify (drag & drop, paling cepat)

1. Masuk ke [https://netlify.com](https://netlify.com) → Daftar / Masuk.
2. Klik **Add new site** → **Deploy manually**.
3. Seret seluruh **isi folder** `kuradapt/` (bukan folder itu sendiri) ke area upload.
4. Tunggu ~30 detik. Dapatkan link `https://xxxx.netlify.app`.
5. (Opsional) Di **Site settings → Domain management** bisa tambah domain custom.

### Opsi C — Cloudflare Pages (hosting + proteksi DDoS/WAF gratis)

1. Masuk ke [https://dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Upload assets**.
2. Beri nama `kuradapt` → seret isi folder `kuradapt/` → **Deploy site**.
3. Dapatkan link `https://kuradapt.pages.dev` (HTTPS otomatis & gratis, bandwidth unlimited).
4. Proteksi langsung aktif: **DDoS mitigation unmetered**, **Cloudflare Managed Ruleset (WAF)**, **Browser Integrity Check**, TLS + redirect HTTPS, DNSSEC.
5. (Opsional) Domain sendiri: tambahkan domain → aktifkan **proxy** (ikon awan oranye) agar selalu lewat jaringan Cloudflare.
6. File `_headers` dibaca otomatis Cloudflare Pages → HSTS, `nosniff`, anti-frame, CSP terkirim di setiap respons.

**Kalau domain sudah berada di Cloudflare (hosting lain):** arahkan DNS ke hosting → pastikan record memakai **proxy aktif (awan oranye)**. Hasilnya sama: trafik lewat WAF & DDoS protection Cloudflare.

> **Batas jujur:** Cloudflare melindungi trafik ke domain Anda (aset, halaman, API). Login mode lokal terjadi **di dalam browser** (localStorage) sehingga tidak terlihat Cloudflare — penjaganya ada di aplikasi (hash SHA-256 iterasi, sesi ber-sign 8 jam, kunci masuk berjenjang, CSP). Data Supabase dijaga **Row Level Security** di database.

---

## Langkah 7: Coba Aplikasi yang Sudah Online

1. Buka link aplikasi (GitHub Pages atau Netlify).
2. Klik **Masuk** → **Daftar** → isi nama, email, password, pilih peran (Guru/Dosen/Siswa/Mahasiswa/Industri).
3. Login dengan akun baru.
4. Buka dari **perangkat lain** (HP / laptop lain) dengan email yang sama → data & progres akan sama.

## Langkah 8: Coba Fitur Lupa / Atur Ulang Kata Sandi

1. Buka halaman **Masuk** → klik tautan kecil **"Lupa kata sandi?"** (di bawah kolom sandi).
2. Masukkan email terdaftar → klik **Kirim Permintaan Reset**.
3. Buka **Gmail** pengguna tersebut (cek folder **Spam/Promosi** bila tidak ada) →
   ada email berjudul **"Kuradapt · Atur Ulang Kata Sandi"**.
4. Buka tautan di email → aplikasi menampilkan form **Kata Sandi Baru** → simpan.
5. Masuk kembali dengan sandi baru.

**Dua jalur sesuai mode:**

| | Mode Online (Supabase terisi) | Mode Lokal (config kosong) |
|---|---|---|
| Pengirim email | Supabase Auth (`/auth/v1/recover`) | Jembatan email Google (`NOTIF_WEBHOOK`) |
| Isi email | Tautan atur ulang sandi | Kode verifikasi 6 digit (berlaku 10 menit) |
| Syarat | Langkah 5a & 5b sudah dijalankan | `NOTIF_WEBHOOK` harus diisi (Langkah 4b) |
| Tanpa pengirim | — | Muncul pesan: hubungi Admin Sistem |

---

## 🔒 Keamanan yang Sudah Terpasang

| Fitur | Keterangan |
|-------|------------|
| SHA-256 3.000 iterasi + salt per akun | Password di-hash di perangkat (`k2$…`); sandi versi lama otomatis dinaikkan saat masuk |
| Sesi ber-sign HMAC (8 jam) | Penyuntingan localStorage terdeteksi → sesi dicabut + insiden dicatat di audit log |
| Rate limit berjenjang | 5 gagal → kunci 5 menit · 10 → 15 menit · 15 → 30 menit (anti brute-force) |
| Validasi tautan | Hanya `http(s)` — `javascript:`/`data:` ditolak saat disimpan & saat dibuka |
| CSP tanpa unsafe-inline | Content-Security-Policy mencegah injeksi skrip (inline script dipindah ke `boot.js`/`boot-route.js`) |
| Header `_headers` | HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy (otomatis di Cloudflare Pages & Netlify) |
| Row Level Security | Setiap user hanya bisa baca/tulis data milik sendiri di Supabase |
| Token expiry | Sesi kadaluarsa otomatis dihandle oleh Supabase (mode online) |
| Cloudflare (opsional) | DDoS mitigation, WAF, Browser Integrity Check — aktif bila memakai Opsi C di atas |

---

## 📁 File yang Ditambahkan / Diperbarui

| File | Status | Keterangan |
|------|--------|------------|
| `config.js` | Diisi | Kunci Supabase project `kuradapt` (kosong = mode lokal) |
| `app.js` | Diupdate | v3.5.0: lapisan online Supabase (sinkron) + halaman `#/lupa` |
| `styles.css` | Diupdate | Navbar menyatu dengan halaman + gaya halaman lupa sandi |
| `boot-route.js` | Diupdate | Rute `lupa` dikenali anti-kedip |
| `sw.js` | Diupdate | Cache rilis `kuradapt-v3.5.0` |
| `test.js` | Diupdate | Mode online dimatikan saat pengujian (680 tes tetap lulus) |
| `_redirects` | Baru | Fallback SPA untuk static host |
| `_headers` | Baru | Header keamanan: HSTS, nosniff, anti-frame, CSP (Cloudflare Pages & Netlify) |
| `netlify.toml` | Baru | Konfigurasi Netlify |
| `supabase-schema.sql` | Baru | Skema database (jalankan di SQL Editor Supabase) |
| `DEPLOY.md` | Baru | Panduan ini |
| `README.md` | Diupdate | Ditambahi panduan deploy + changelog |

---

## 🆚 Mode Lokal vs Mode Online

| | Mode Lokal (default) | Mode Online (Supabase) |
|---|---|---|
| Data disimpan | localStorage di perangkat | Database Supabase (cloud) |
| Login lintas perangkat | ❌ Tidak | ✅ Ya |
| Perlu internet | ❌ Tidak (buka file://) | ✅ Ya |
| Biaya | Gratis | Gratis (tier gratis Supabase) |

---

## ❓ Troubleshooting

**Aplikasi tidak tampil di GitHub Pages?**
- Pastikan branch adalah `main` (bukan `master`).
- Pastikan file `index.html` ada di root repositori, bukan di dalam subfolder.

**Login gagal di mode online?**
- Pastikan `config.js` sudah diisi URL dan key yang benar.
- Pastikan skema `supabase-schema.sql` sudah dijalankan di SQL Editor.
- Cek konsol browser (F12) untuk pesan error.

**Data tidak sinkron antar perangkat?**
- Pastikan Anda login dengan email yang sama di kedua perangkat.
- Pastikan `config.js` diisi dengan benar dan file sudah di-publish ulang ke hosting.
- Pastikan skema `supabase-schema.sql` sudah dijalankan (buka `…/rest/v1/user_data`
  di browser — bila muncul `404 PGRST205`, skema belum jalan).
- Konfirmasi email Supabase (Langkah 5b) menentukan apakah akun baru bisa login
  di perangkat kedua.

**Email "Lupa Kata Sandi" tidak masuk Gmail?**
- Cek folder **Spam** dan **Promosi**.
- Pastikan **Site URL & Redirect URL** sudah diisi (Langkah 5a) — kalau tidak,
  email tetap terkirim tapi tautannya mengarah ke halaman kosong Supabase.
- Mode online: lihat menu **Authentication → Logs → Auth** di dashboard Supabase
  untuk memastikan permintaan `recover` diterima.
- Mode lokal: `NOTIF_WEBHOOK` harus diisi (Langkah 4b); cek tab *Executions* Apps Script.

---

**Selesai.** Kuradapt sudah siap digunakan secara online, gratis, dan aman.

© 2026 DAFFTECH — https://daffaull18.github.io/dafftech-v2/
