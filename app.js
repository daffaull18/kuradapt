/* ============================================================
   KURADAPT — Aplikasi Utama v2
   Kurikulum Hidup, Masa Depan Terarah.
   © 2026 DAFFTECH — All Rights Reserved
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- Penyimpanan ---------------- */
  const K = {
    users: "kuradapt_users",
    sesi: "kuradapt_sesi",
    tema: "kuradapt_theme",
    pengumuman: "kuradapt_pengumuman",
    nilai: "kuradapt_nilai",
    progres: "kuradapt_progres",
    dok: "kuradapt_dokmeta",
    kegiatan: "kuradapt_kegiatan",
    undangan: "kuradapt_undangan",
    soal: "kuradapt_soal",        /* paket soal input guru/dosen */
    mapelx: "kuradapt_mapelx",     /* mata pelajaran tambahan tenaga pendidik */
    jadwal: "kuradapt_jadwal",     /* jadwal pertemuan online */
    kurikulum: "kuradapt_kurikulum", /* versi kurikulum (riwayat) */
    buku: "kuradapt_buku",         /* perpustakaan digital */
    industri: "kuradapt_industri", /* profil & postingan mitra industri */
    log: "kuradapt_log",           /* audit log aktivitas & insiden */
    gagal: "kuradapt_gagal",       /* batas percobaan masuk */
    mfa: "kuradapt_mfa",           /* pengaturan MFA pengelola */
    v2: "kuradapt_v2",             /* penanda migrasi integritas sekali jalan */
    kunci: "kuradapt_key",         /* kunci HMAC per-instalasi (bukan sandi) */
    notif: "kuradapt_notif"        /* pusat pemberitahuan (soal, dokumen, nilai, dll.) */
  };

  function lsGet(k, def) {
    try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); }
    catch (e) { return def; }
  }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function uid(p) { return (p || "id") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function hashStr(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h; }
  function acak(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function ikon(id) { return '<svg class="i"><use href="#' + id + '"></use></svg>'; }

  /* ---------------- Konfigurasi jenjang ---------------- */
  const JENJANG = {
    mini: {
      nama: "Kuradapt Mini", label: "SD / MI", keys: ["sd"], ikon: "i-game",
      warna: "#f59e0b", tag: "Fase A – Fase C",
      desc: "Adaptasi logika dasar lewat game interaktif: matematika kontekstual, sains eksperimen rumah tangga, literasi digital."
    },
    muda: {
      nama: "Kuradapt Muda", label: "SMP / MTs", keys: ["smp"], ikon: "i-compass",
      warna: "#0284c7", tag: "Fase D – Fase E",
      desc: "Penemuan minat & bakat — kurikulum beradaptasi dengan kecenderungan otak anak: seni, sains, atau sosial."
    },
    mahir: {
      nama: "Kuradapt Mahir", label: "SMA / SMK", keys: ["sma", "smk"], ikon: "i-bolt",
      warna: "#1d4ed8", tag: "Fase F · Link & Match",
      desc: "Menghapus keterlambatan ilmu: AI, digital marketing, coding, jaringan & server dengan standar industri."
    },
    tinggi: {
      nama: "Kuradapt Tinggi", label: "Perguruan Tinggi", keys: ["kuliah"], ikon: "i-rocket",
      warna: "#7c3aed", tag: "Project-Based Learning",
      desc: "Proyek nyata berbasis studi kasus perusahaan, transkrip SKS, dan magang virtual untuk portofolio."
    }
  };
  const URUT = ["mini", "muda", "mahir", "tinggi"];

  const PERAN = {
    siswa: { nama: "Siswa", ikon: "i-cap" },
    mahasiswa: { nama: "Mahasiswa", ikon: "i-books" },
    guru: { nama: "Guru", ikon: "i-school" },
    dosen: { nama: "Dosen", ikon: "i-desk" },
    industri: { nama: "Mitra Industri", ikon: "i-building" },
    admin: { nama: "Admin Sistem", ikon: "i-shield" },
    operator: { nama: "Operator Jenjang", ikon: "i-gear" },
    super: { nama: "Super Admin", ikon: "i-trophy" }
  };

  /* opsi pendaftaran (8) */
  function opsiDaftar() {
    return [
      { id: "siswa-mini", peran: "siswa", jenjang: "mini", nama: "Siswa SD", sub: "Kuradapt Mini", ikon: "i-game" },
      { id: "siswa-muda", peran: "siswa", jenjang: "muda", nama: "Siswa SMP", sub: "Kuradapt Muda", ikon: "i-compass" },
      { id: "siswa-sma", peran: "siswa", jenjang: "mahir", nama: "Siswa SMA", sub: "Kuradapt Mahir", ikon: "i-bolt" },
      { id: "siswa-smk", peran: "siswa", jenjang: "mahir", nama: "Siswa SMK", sub: "Kuradapt Mahir", ikon: "i-toolbox" },
      { id: "mahasiswa", peran: "mahasiswa", jenjang: "tinggi", nama: "Mahasiswa", sub: "Kuradapt Tinggi", ikon: "i-books" },
      { id: "guru", peran: "guru", jenjang: null, nama: "Guru", sub: "Sekolah", ikon: "i-school" },
      { id: "dosen", peran: "dosen", jenjang: "tinggi", nama: "Dosen", sub: "Perguruan Tinggi", ikon: "i-desk" },
      { id: "industri", peran: "industri", jenjang: null, nama: "Mitra Industri", sub: "DUDI", ikon: "i-building" },
      { id: "admin", peran: "admin", jenjang: null, nama: "Admin Sistem", sub: "Kelola Platform", ikon: "i-shield" },
      { id: "operator", peran: "operator", jenjang: null, nama: "Operator Jenjang", sub: "Kelola Ruang", ikon: "i-gear" }
    ];
  }

  function jenjangSaya(s) {
    if (!s) return [];
    let base = [];
    if (s.peran === "siswa") base = s.jenjang ? [s.jenjang] : [];
    else if (s.peran === "mahasiswa" || s.peran === "dosen") base = ["tinggi"];
    else if (s.peran === "guru") base = ["mini", "muda", "mahir"];
    else if (s.peran === "industri") base = URUT.slice();
    else if (s.peran === "admin") base = URUT.slice();                 /* admin: seluruh jenjang */
    else if (s.peran === "super") base = URUT.slice();                 /* super admin: seluruh platform */
    else if (s.peran === "operator") base = s.jenjang ? [s.jenjang] : URUT.slice(); /* operator: jenjang yang dioperasikan (null = semua) */
    /* akses tambahan lewat kode undangan tenaga pendidik */
    (s.undangan || []).forEach(u => { if (JENJANG[u] && base.indexOf(u) === -1) base.push(u); });
    return base;
  }
  function bisaTulis(s, code) {
    if (!s || jenjangSaya(s).indexOf(code) === -1) return false;
    return ["guru", "dosen", "industri", "admin", "operator", "super"].indexOf(s.peran) > -1;
  }
  function panelKelola(s) { return !!s && (s.peran === "admin" || s.peran === "operator" || s.peran === "super"); }
  function peranLabel(s) { return s ? (PERAN[s.peran] ? PERAN[s.peran].nama : s.peran) + (s.jenjang && s.peran === "siswa" ? " · " + (JENJANG[s.jenjang] ? JENJANG[s.jenjang].label : "") : "") : ""; }

  /* ---------------- Data ---------------- */
  const DATA = () => window.KURADAPT_DATA || {};
  function mapelCustom(code) { return lsGet(K.mapelx, {})[code] || []; }
  function semuaMapel(code) {
    const out = [];
    (JENJANG[code] ? JENJANG[code].keys : []).forEach(k => {
      const d = DATA()[k];
      if (d && d.mapel) d.mapel.forEach(m => out.push(Object.assign({}, m, { _src: k, _srcLabel: d.jenjang || d.label })));
    });
    /* pelajaran tambahan buatan guru/dosen/mitra/admin/operator */
    mapelCustom(code).forEach(m => out.push(Object.assign({}, m)));
    return out;
  }
  function cariMapel(code, id) { return semuaMapel(code).find(m => m.id === id) || null; }
  function cariMapelCustom(code, id) {
    const semua = lsGet(K.mapelx, {});
    return (semua[code] || []).find(m => m.id === id) || null;
  }
  function tambahMapelx(code, data) {
    const semua = lsGet(K.mapelx, {});
    if (!semua[code]) semua[code] = [];
    const m = {
      id: uid("mx"), nama: data.nama, ringkas: data.ringkas || "Pelajaran tambahan dari tenaga pendidik",
      ikon: data.ikon || "i-books", bab: [],
      _src: code === "tinggi" ? "kuliah" : code,
      _srcLabel: code === "tinggi" ? "Tambahan Dosen" : "Tambahan Pengajar",
      pengajar: sesi() ? sesi().nama : "-", tgl: new Date().toISOString(), kustom: true
    };
    semua[code].push(m); lsSet(K.mapelx, semua);
    catatLog("pelajaran", "Pelajaran tambahan ditambahkan: " + m.nama + " (" + code + ")");
    return m;
  }
  function hapusMapelx(code, id) {
    const semua = lsGet(K.mapelx, {});
    semua[code] = (semua[code] || []).filter(m => m.id !== id);
    lsSet(K.mapelx, semua);
    /* nilai & progres pelajaran ini ikut dibersihkan agar transkrip tetap rapi */
    const store = lsGet(K.nilai, {});
    if (store[code]) Object.keys(store[code]).forEach(em => { if (store[code][em]) delete store[code][em][id]; });
    lsSet(K.nilai, store);
    const all = lsGet(K.progres, {});
    if (all[code]) Object.keys(all[code]).forEach(em => {
      const r = all[code][em];
      if (r && r.latihan) delete r.latihan[id];
    });
    lsSet(K.progres, all);
  }
  function tambahBabMapelx(code, mapelId, data) {
    const semua = lsGet(K.mapelx, {});
    const m = (semua[code] || []).find(x => x.id === mapelId);
    if (!m) return null;
    if (!m.bab) m.bab = [];
    const b = { id: uid("bx"), judul: data.judul, ringkas: data.ringkas || "", materi: data.materi, soal: [] };
    m.bab.push(b);
    lsSet(K.mapelx, semua);
    return b;
  }
  function totalSoal(code) {
    return semuaMapel(code).reduce((a, m) => a + (m.bab || []).reduce((b, x) => b + (x.soal ? x.soal.length : 0), 0), 0);
  }

  /* ---------------- Kriptografi: hash sandi v2 + tanda integritas HMAC ----------------
     SHA-256 murni JS (sinkron) — diverifikasi terhadap vektor resmi SHA-256.
     Dipakai untuk dua hal:
       1. Hash sandi versi 2: "k2$<iterasi>$<salt>$<hash>" — salt acak per akun,
          3.000 iterasi (~57 ms) → memperlambat menebak sandi secara massal.
       2. HMAC-SHA256 dengan kunci per-instalasi (kuradapt_key) sebagai tanda
          integritas sesi & setiap catatan pengguna. Penyuntingan localStorage
          terdeteksi → sesi dihentikan / catatan dibuang + insiden dicatat.
     Batas jujur: ini melindungi dari penyuntingan sembrono & tebakan sandi di
     perangkat; pengguna yang membuka DevTools tetap memegang kendali penuh atas
     perangkatnya sendiri. Perlindungan penuh butuh server tepercaya — aktifkan
     mode online Supabase (RLS), lihat supabase-schema.sql. */
  const ITERASI_SANDI = 3000;     /* kalibrasi: ~57 ms per hash */
  const MASA_SESI = 8 * 3600000;  /* sesi sah 8 jam sejak dibuat */
  const _enc = new TextEncoder();

  function sha256Bytes(bytes) {
    const KT = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));
    const l = bytes.length, bitLen = l * 8;
    const total = Math.ceil((l + 9) / 64) * 64;
    const buf = new Uint8Array(total);
    buf.set(bytes); buf[l] = 0x80;
    const dv = new DataView(buf.buffer);
    dv.setUint32(total - 8, Math.floor(bitLen / 4294967296));
    dv.setUint32(total - 4, bitLen >>> 0);
    let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const w = new Int32Array(64);
    for (let off = 0; off < total; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(w[i-15],7) ^ rotr(w[i-15],18) ^ (w[i-15] >>> 3);
        const s1 = rotr(w[i-2],17) ^ rotr(w[i-2],19) ^ (w[i-2] >>> 10);
        w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
      }
      let a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(e,6) ^ rotr(e,11) ^ rotr(e,25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + KT[i] + w[i]) | 0;
        const S0 = rotr(a,2) ^ rotr(a,13) ^ rotr(a,22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) | 0;
        h=g; g=f; f=e; e=(d+t1)|0; d=c; c=b; b=a; a=(t1+t2)|0;
      }
      H[0]=(H[0]+a)|0; H[1]=(H[1]+b)|0; H[2]=(H[2]+c)|0; H[3]=(H[3]+d)|0;
      H[4]=(H[4]+e)|0; H[5]=(H[5]+f)|0; H[6]=(H[6]+g)|0; H[7]=(H[7]+h)|0;
    }
    const out = new Uint8Array(32);
    for (let i = 0; i < 8; i++) { out[i*4]=H[i]>>>24; out[i*4+1]=(H[i]>>>16)&255; out[i*4+2]=(H[i]>>>8)&255; out[i*4+3]=H[i]&255; }
    return out;
  }
  function hexDari(b) { let s = ""; for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0"); return s; }
  function hmacSha256(kunci, pesan) {
    const k = kunci.length > 64 ? sha256Bytes(kunci) : kunci;
    const dalam = new Uint8Array(64 + pesan.length), luar = new Uint8Array(96);
    for (let i = 0; i < 64; i++) { const b = i < k.length ? k[i] : 0; dalam[i] = b ^ 0x36; luar[i] = b ^ 0x5c; }
    dalam.set(pesan, 64);
    luar.set(sha256Bytes(dalam), 64);
    return sha256Bytes(luar);
  }
  function acakBytes(n) {
    const a = new Uint8Array(n);
    try { if (typeof crypto !== "undefined" && crypto && crypto.getRandomValues) { crypto.getRandomValues(a); return a; } } catch (e) { }
    let t = (Date.now() ^ Math.floor(Math.random() * 4294967296)) >>> 0; /* cadangan lama */
    for (let i = 0; i < n; i++) { t = (t * 1664525 + 1013904223) >>> 0; a[i] = t >>> 24; }
    return a;
  }
  let _kunci = null;
  function kunciBytes() { /* 32 byte acak, sekali dibuat, disimpan di perangkat */
    if (_kunci) return _kunci;
    let hex = null;
    try { hex = localStorage.getItem(K.kunci); } catch (e) { }
    if (!/^[0-9a-f]{64}$/.test(hex || "")) {
      hex = hexDari(acakBytes(32));
      try { localStorage.setItem(K.kunci, hex); } catch (e) { }
    }
    _kunci = new Uint8Array(32);
    for (let i = 0; i < 32; i++) _kunci[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return _kunci;
  }
  function tanda(obj) { return hexDari(hmacSha256(kunciBytes(), _enc.encode(JSON.stringify(obj)))); }

  /* ---- hash sandi v2 (salt per akun + iterasi) ---- */
  function hashIterasi(pass, salt, n) {
    let h = hexDari(sha256Bytes(_enc.encode(salt + ":" + pass)));
    for (let i = 1; i < n; i++) h = hexDari(sha256Bytes(_enc.encode(h + ":" + salt)));
    return h;
  }
  function sandiBaru(pass, n) {
    const iters = n || ITERASI_SANDI, salt = hexDari(acakBytes(8));
    return "k2$" + iters + "$" + salt + "$" + hashIterasi(String(pass), salt, iters);
  }
  function sandiLama(s) { return "k$" + hashStr(s).toString(36); } /* warisan djb2 — hanya utk verifikasi lama */
  function samaKuat(a, b) { /* perbandingan tanpa berhenti di awal */
    if (a.length !== b.length) return false;
    let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return d === 0;
  }
  function cocokSandi(pass, u) {
    const t = String((u && u.pass) || "");
    if (t.slice(0, 3) === "k2$") {
      const p = t.split("$"), n = parseInt(p[1], 10);
      if (!(n >= 500 && n <= 200000) || !p[2] || !p[3]) return false;
      return samaKuat(hashIterasi(String(pass), p[2], n), p[3]);
    }
    if (t.slice(0, 2) === "k$") { /* akun lama (djb2 32-bit) — verifikasi lalu naik versi otomatis */
      if (!samaKuat(sandiLama(String(pass)), t)) return false;
      perbaruiSandi(u, pass);
      return true;
    }
    return false;
  }
  function perbaruiSandi(u, pass) {
    try {
      const users = daftarUsers();
      const x = users.find(y => y.email && u.email && String(y.email).toLowerCase() === String(u.email).toLowerCase());
      if (x) { x.pass = sandiBaru(pass); simpanUsers(users); catatLog("keamanan", "Sandi akun dinaikkan ke versi aman: " + u.email, u.nama || "Sistem"); }
    } catch (e) { }
  }

  /* ---------------- Sesi & pengguna (ber-sign + kedaluwarsa) ---------------- */
  let _cacheRaw = "", _cacheArr = [];
  let _sRaw = "", _sVal = null, _sSampai = 0, _sSibuk = false;
  function lsRaw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function resetSesi() { _sRaw = lsRaw(K.sesi); _sVal = null; _sSampai = 0; }
  function berhentiSesi(alasan, insiden) {
    lsSet(K.sesi, null); resetSesi();
    if (_sSibuk) return;
    _sSibuk = true;
    try {
      if (insiden) catatInsiden("Sesi dihentikan", alasan, "tinggi");
      else catatLog("keamanan", "Sesi berakhir: " + alasan, "Sistem");
    } finally { _sSibuk = false; }
  }
  function bacaSesi() {
    const raw = lsRaw(K.sesi);
    if (raw !== _sRaw) {
      _sRaw = raw; _sVal = null; _sSampai = 0;
      let s = null;
      try { s = JSON.parse(raw || "null"); } catch (e) { s = null; }
      if (s && typeof s === "object" && s.d && s.w && s.sig) {
        if (tanda({ d: s.d, w: s.w }) !== s.sig) {
          berhentiSesi("tanda integritas tidak cocok — isi sesi dimodifikasi di luar aplikasi", true);
        } else { _sVal = s.d; _sSampai = s.w + MASA_SESI; }
      } else if (s && typeof s === "object" && (s.email || s.nama || s.peran)) {
        berhentiSesi("format sesi lama tidak lagi sah — silakan masuk kembali", true);
      }
      /* null / objek kosong = memang tidak ada sesi (bukan kesalahan) */
    }
    if (_sVal && Date.now() > _sSampai) berhentiSesi("kedaluwarsa setelah 8 jam — silakan masuk kembali", false);
    return _sVal;
  }
  const sesi = () => bacaSesi();
  function simpanSesi(s) {
    const d = Object.assign({}, s), w = Date.now();
    lsSet(K.sesi, { d: d, w: w, sig: tanda({ d: d, w: w }) });
    /* paksa validasi ulang pada pembacaan berikutnya (jangan anggap benar tanpa cek) */
    _sRaw = "(basi)"; _sVal = null; _sSampai = 0;
  }
  function hapusSesi() { lsSet(K.sesi, null); resetSesi(); }
  function simpanUsers(users) { /* tulis dengan tanda integritas pada tiap catatan */
    const bersih = (users || []).map(u => {
      const c = Object.assign({}, u);
      delete c._sig;
      c._sig = tanda(c);
      return c;
    });
    lsSet(K.users, bersih);
  }
  const daftarUsers = () => {
    const raw = lsRaw(K.users);
    if (raw === _cacheRaw) return _cacheArr;
    let list = [];
    try { list = JSON.parse(raw || "[]"); } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];
    const sekali = !lsGet(K.v2, false); /* migrasi satu kali: tanda record lama */
    const out = []; let rusak = 0, ulang = false;
    list.forEach(u => {
      if (!u || typeof u !== "object" || !u.email) { rusak++; return; }
      if (u._sig) {
        const c = Object.assign({}, u); delete c._sig;
        if (tanda(c) === u._sig) out.push(u); else rusak++; /* dimodifikasi → buang */
      } else if (sekali) {
        const c = Object.assign({}, u); c._sig = tanda(c); out.push(c); ulang = true;
      } else rusak++;
    });
    if (sekali) lsSet(K.v2, true);
    if (ulang || rusak) simpanUsers(out);
    if (rusak) catatInsiden("Catatan pengguna dimodifikasi", rusak + " catatan dibuang — tanda integritas tidak cocok (penyuntingan localStorage terdeteksi)", "tinggi");
    _cacheRaw = lsRaw(K.users);
    _cacheArr = out;
    return out;
  };
  function cariUser(email) { return daftarUsers().find(u => u.email.toLowerCase() === String(email).toLowerCase()) || null; }

  /* ---------------- Tema ---------------- */
  function terapkanTema(t) {
    const tema = t === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", tema);
    lsSet(K.tema, tema);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", tema === "dark" ? "#0a1020" : "#f6f8fc");
    const use = document.querySelector("#themeIcon use");
    if (use) use.setAttribute("href", tema === "dark" ? "#i-sun" : "#i-moon");
  }
  function gantiTema() {
    const sekarang = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    terapkanTema(sekarang === "dark" ? "light" : "dark");
    toast(ikon(sekarang === "dark" ? "i-sun" : "i-moon") + " Tema <b>" + (sekarang === "dark" ? "Terang" : "Night") + "</b> aktif");
  }

  /* ---------------- Toast & Modal ---------------- */
  function toast(html, jenis) {
    const box = document.getElementById("toastBox");
    if (!box) return;
    const el = document.createElement("div");
    el.className = "toast" + (jenis ? " " + jenis : "");
    el.innerHTML = html;
    box.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .4s"; setTimeout(() => el.remove(), 420); }, 2600);
  }
  function bukaModal(html) {
    const m = document.getElementById("modal"), b = document.getElementById("modalBox");
    if (!m || !b) return;
    b.innerHTML = html; m.classList.add("open");
    b.querySelectorAll("[data-tutup]").forEach(x => x.onclick = tutupModal);
  }
  function tutupModal() { const m = document.getElementById("modal"); if (m) m.classList.remove("open"); }
  function mHead(icon, judul) {
    return '<div class="modal-head">' + ikon(icon) + '<h3>' + judul + '</h3>' +
      '<button class="icon-btn" data-tutup aria-label="Tutup">' + ikon("i-x") + '</button></div>';
  }

  /* ---------------- Tanggal ---------------- */
  function tglIndo(d) {
    const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const x = new Date(d);
    return x.getDate() + " " + bulan[x.getMonth()] + " " + x.getFullYear();
  }
  function relatif(d) {
    const diff = (Date.now() - new Date(d).getTime()) / 86400000;
    if (diff < 1) return "Hari ini";
    if (diff < 2) return "Kemarin";
    if (diff < 7) return Math.floor(diff) + " hari lalu";
    return tglIndo(d);
  }

  /* ---------------- Pengumuman (live) ---------------- */
  function seedPengumuman() {
    const h = n => new Date(Date.now() - n * 86400000).toISOString();
    return [
      { id: "p1", judul: "Penilaian Tengah Semester Genap", penulis: "Bu Sari Wulandari", peran: "guru", jenjang: "mini", tgl: h(0), isi: "Assalamu'alaikum, PTS genap untuk kelas 4–6 dilaksanakan minggu depan. Latihan adaptif Kuradapt Mini sudah diperbarui — silakan kerjakan minimal 2 bab per mapel agar siap." },
      { id: "p2", judul: "Praktikum IPAS: Air Bersih & Kesehatan", penulis: "Pak Hendra M.", peran: "guru", jenjang: "muda", tgl: h(1), isi: "Praktikum minggu ini memakai eksperimen sederhana di rumah. Unduh lembar kerja pada tab Dokumen, kerjakan lalu unggah foto jurnal praktikumnya." },
      { id: "p3", judul: "Modul AI Dasar Gratis — dibuka!", penulis: "Koordinator Kuradapt", peran: "guru", jenjang: "mahir", tgl: h(1), isi: "Modul Artificial Intelligence dasar (prompt engineering + Python) resmi dibuka untuk SMA/SMK. Standar industri, bisa langsung dipakai untuk proyek portofolio." },
      { id: "p4", judul: "Sertifikasi LSP/P1 Tkj Batch 2", penulis: "Pak Rizal, S.Kom", peran: "guru", jenjang: "mahir", tgl: h(2), isi: "Pendaftaran sertifikasi kompetensi TKJ dibuka. Modul Administrasi Jaringan & Server wajib selesai sebelum uji kompetensi. Kuota 25 peserta." },
      { id: "p5", judul: "Kuliah Tamu: Data Science untuk Industri", penulis: "Dr. Anindya P., M.T.", peran: "dosen", jenjang: "tinggi", tgl: h(2), isi: "Jumat pukul 10.00 di Aula Fasilkom, bersama praktisi data dari perusahaan e-commerce. Rekaman & materi diunggah ke tab Dokumen kelas." },
      { id: "p6", judul: "Magang Virtual Batch 3 — 40 slot", penulis: "Tim Kuradapt Tinggi", peran: "dosen", jenjang: "tinggi", tgl: h(3), isi: "Program magang virtual berbasis studi kasus perusahaan kembali dibuka. Transkrip SKS dan portofolio proyek otomatis tercatat di ruang Anda." },
      { id: "p7", judul: "Brief Proyek: Aplikasi Desa Digital", penulis: "PT Nusantara Digital", peran: "industri", jenjang: "semua", tgl: h(4), isi: "Menerima 3 tim mahasiswa/siswa terbaik untuk mengembangkan aplikasi layanan desa. Budget Rp15.000.000, durasi 2 bulan, bimbingan mingguan." },
      { id: "p8", judul: "Pembaruan Kurikulum Bulan Ini", penulis: "Tim Kuradapt", peran: "industri", jenjang: "semua", tgl: h(5), isi: "Seluruh materi 5 jenjang diperbarui mengikuti perkembangan teknologi & kebutuhan industri terbaru. 100+ soal baru ditambahkan pada latihan dan asesmen." }
    ];
  }
  function semuaPengumuman() {
    /* gabungkan seed + penyimpanan: ubahan menimpa seed (id sama → 1 entri),
       entri bertanda dihapus dibuang dari hasil akhir */
    const byId = {};
    seedPengumuman().forEach(p => { byId[p.id] = p; });
    lsGet(K.pengumuman, []).forEach(p => {
      if (p.dihapus) delete byId[p.id];
      else byId[p.id] = Object.assign(byId[p.id] || {}, p);
    });
    return Object.keys(byId).map(id => byId[id]);
  }
  function pengumumanBaru(p) {
    const semua = lsGet(K.pengumuman, []);
    semua.push(p); lsSet(K.pengumuman, semua);
    catatLog("pengumuman", "Pengumuman baru: " + p.judul);
    kirimNotif({
      tipe: "pengumuman", judul: "Pengumuman baru: " + p.judul,
      pesan: (p.penulis || "Tenaga pendidik") + " mengirim pengumuman untuk " +
        (p.jenjang === "semua" ? "semua jenjang" : (JENJANG[p.jenjang] ? JENJANG[p.jenjang].nama : "ruang ini")) + ".",
      ke: "*", jenjang: p.jenjang && p.jenjang !== "semua" ? [p.jenjang] : [],
      dari: p.penulis, rujuk: "#/pengumuman"
    });
  }
  function ubahPengumuman(id, patch) {
    /* pengumuman seed disalin dulu ke penyimpanan lalu diubah */
    const semua = lsGet(K.pengumuman, []);
    const idx = semua.findIndex(p => p.id === id);
    if (idx > -1) { Object.assign(semua[idx], patch); lsSet(K.pengumuman, semua); catatLog("pengumuman", "Pengumuman diubah: " + (patch.judul || id)); return; }
    const asli = semuaPengumuman().find(p => p.id === id);
    if (asli) { semua.push(Object.assign({}, asli, patch, { id: asli.id })); lsSet(K.pengumuman, semua); catatLog("pengumuman", "Pengumuman diubah: " + (patch.judul || asli.judul)); }
  }
  function hapusPengumuman(id) {
    const semua = lsGet(K.pengumuman, []);
    const idx = semua.findIndex(p => p.id === id);
    if (idx > -1) { semua.splice(idx, 1); }
    /* bila id berasal dari seed → tandai dihapus agar tidak muncul lagi */
    if (seedPengumuman().some(p => p.id === id)) semua.push({ id: id, dihapus: true });
    lsSet(K.pengumuman, semua);
    catatLog("pengumuman", "Pengumuman dihapus: " + id);
  }
  function pengumumanRuang(code) { return semuaPengumuman().filter(p => p.jenjang === code || p.jenjang === "semua"); }
  function baru(p) { return (Date.now() - new Date(p.tgl).getTime()) < 3 * 86400000; }

  function kartuPengumuman(p, withChipJenjang, withAksi) {
    const inisial = (p.penulis || "K").split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
    const jn = p.jenjang === "semua" ? "Semua Jenjang" : (JENJANG[p.jenjang] ? JENJANG[p.jenjang].nama : p.jenjang);
    return '<article class="ann-card" data-ann="' + esc(p.id) + '">' +
      (baru(p) ? '<span class="chip red baru">BARU</span>' : '') +
      '<div class="ac-head"><span class="ac-av">' + esc(inisial) + '</span>' +
      '<span class="meta"><b>' + esc(p.penulis) + '</b><small>' + esc(PERAN[p.peran] ? PERAN[p.peran].nama : p.peran) + ' · ' + relatif(p.tgl) + '</small></span>' +
      (p.email ? '<button class="chip ac-orang" data-profil="' + esc(p.email) + '" title="Lihat profil penulis">' + ikon("i-users") + ' Profil</button>' : '') + '</div>' +
      '<h3>' + esc(p.judul) + '</h3><p>' + esc(p.isi) + '</p>' +
      '<div class="ac-foot">' + (withChipJenjang ? '<span class="chip brand">' + ikon("i-cap") + esc(jn) + '</span>' : '') +
      '<span class="chip">' + ikon("i-clock") + tglIndo(p.tgl) + '</span>' +
      (withAksi ? '<span class="ann-act">' +
        '<button class="btn btn-sm btn-soft" data-ann-edit="' + esc(p.id) + '">' + ikon("i-pen") + ' Ubah</button>' +
        '<button class="btn btn-sm btn-danger" data-ann-hapus="' + esc(p.id) + '">' + ikon("i-trash") + '</button></span>' : '') +
      '</div></article>';
  }

  /* ---------------- Kegiatan bersama (live) ---------------- */
  function seedKegiatan() {
    const h = n => new Date(Date.now() - n * 3600000).toISOString();
    return [
      { id: "kg1", judul: "Kelas Live: Trigonometri Dasar", jenis: "Kelas Live", jenjang: "mahir", pembuat: "Bu Sari Wulandari", peran: "guru", tgl: h(2), durasi: 60, status: "berlangsung", peserta: ["Budi Santoso", "Rina Amelia"] },
      { id: "kg2", judul: "Diskusi Kelompok: Ekosistem Rumah", jenis: "Diskusi", jenjang: "mini", pembuat: "Pak Hendra M.", peran: "guru", tgl: h(5), durasi: 45, status: "akan", peserta: [] },
      { id: "kg3", judul: "Bimbingan Proyek Portofolio", jenis: "Bimbingan", jenjang: "tinggi", pembuat: "Dr. Anindya P., M.T.", peran: "dosen", tgl: h(1), durasi: 90, status: "berlangsung", peserta: ["Alya Putri"] },
      { id: "kg4", judul: "Simulasi Ujian Kompetensi TKJ", jenis: "Ujian", jenjang: "mahir", pembuat: "Pak Rizal, S.Kom", peran: "guru", tgl: h(26), durasi: 120, status: "selesai", peserta: ["Budi Santoso", "Dimas Prasetyo", "Siti Rahayu"] }
    ];
  }
  function semuaKegiatan() {
    /* gabungkan seed + penyimpanan (penyimpanan menimpa seed, id sama → 1 entri) */
    const byId = {};
    seedKegiatan().forEach(k => { byId[k.id] = k; });
    lsGet(K.kegiatan, []).forEach(k => { byId[k.id] = Object.assign(byId[k.id] || {}, k); });
    return Object.keys(byId).map(id => byId[id]).filter(k => !k.dihapus);
  }
  function kegiatanRuang(code) { return semuaKegiatan().filter(k => k.jenjang === code); }
  function simpanKegiatanBaru(k) {
    const semua = lsGet(K.kegiatan, []);
    semua.push(k); lsSet(K.kegiatan, semua);
    kirimNotif({
      tipe: "kegiatan", judul: "Kegiatan baru: " + (k.judul || "Kegiatan"),
      pesan: (k.pembuat || "Tenaga pendidik") + " membuka kegiatan " + (k.jenis || "") +
        " untuk ruang " + (JENJANG[k.jenjang] ? JENJANG[k.jenjang].nama : k.jenjang) + ".",
      ke: "*", jenjang: [k.jenjang], dari: k.pembuat, rujuk: "#/r/" + k.jenjang
    });
  }
  function ubahKegiatan(id, patch) {
    /* kegiatan seed disalin dulu ke penyimpanan lalu diubah */
    const semua = lsGet(K.kegiatan, []);
    const idx = semua.findIndex(k => k.id === id);
    if (idx > -1) { Object.assign(semua[idx], patch); lsSet(K.kegiatan, semua); return; }
    const asli = semuaKegiatan().find(k => k.id === id);
    if (asli) { semua.push(Object.assign({}, asli, patch, { id: asli.id })); lsSet(K.kegiatan, semua); }
  }
  function statusKegiatan(k) {
    if (k.status === "selesai") return ["selesai", "Selesai"];
    if (k.status === "akan") return ["akan", "Akan Datang"];
    return ["live", "Berlangsung"];
  }
  function jenisKegiatan() { return ["Kelas Live", "Diskusi", "Bimbingan", "Ujian", "Praktikum"]; }

  /* ---------------- Undangan (kode invite per jenjang) ---------------- */
  function semuaUndangan() { return lsGet(K.undangan, []); }
  function buatUndangan(jenjang, pembuat, peran) {
    const semua = semuaUndangan();
    const kode = "KA-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.floor(10 + Math.random() * 90);
    const u = { kode, jenjang, pembuat, peran, tgl: new Date().toISOString(), aktif: true, dipakai: [] };
    semua.push(u); lsSet(K.undangan, semua);
    return u;
  }
  function tukarUndangan(kode, user) {
    const semua = semuaUndangan();
    const u = semua.find(x => x.kode.toUpperCase() === String(kode).trim().toUpperCase() && x.aktif);
    if (!u) return null;
    /* masa berlaku kode: 180 hari sejak diterbitkan */
    if (Date.now() - new Date(u.tgl).getTime() > 180 * 86400000) return null;
    if (u.dipakai.indexOf(user.email) > -1) return u; /* sudah pernah dipakai — tetap sah */
    u.dipakai.push(user.email); lsSet(K.undangan, semua);
    return u;
  }
  function beriAksesUndangan(s, jenjang) {
    if (!s.undangan) s.undangan = [];
    if (s.undangan.indexOf(jenjang) === -1) s.undangan.push(jenjang);
    simpanSesi(s);
    /* simpan juga ke akun agar bertahan setelah keluar */
    const users = daftarUsers();
    const u = users.find(x => x.email === s.email);
    if (u) { if (!u.undangan) u.undangan = []; if (u.undangan.indexOf(jenjang) === -1) u.undangan.push(jenjang); simpanUsers(users); }
    kirimNotif({
      tipe: "undangan", judul: "Akses ruang " + (JENJANG[jenjang] ? JENJANG[jenjang].nama : jenjang) + " dibuka",
      pesan: "Kode undangan Anda telah disetujui — ruang tersebut kini terbuka di pilihan jenjang Anda.",
      ke: s.email, rujuk: "#/pilih"
    });
  }

  /* ---------------- Audit log (riwayat aktivitas & perubahan data penting) ---------------- */
  const TIPES_LOG = ["masuk", "daftar", "nilai", "pengumuman", "pelajaran", "soal", "kurikulum", "perpustakaan", "pertemuan", "industri", "verifikasi", "kewenangan", "keamanan", "insiden"];
  function semuaLog() { return lsGet(K.log, []); }
  function catatLog(tipe, pesan, pelaku) {
    const s = sesi();
    const semua = semuaLog();
    semua.push({
      id: uid("lg"), tipe: TIPES_LOG.indexOf(tipe) > -1 ? tipe : "keamanan",
      pesan: String(pesan || ""), pelaku: pelaku || (s ? s.nama : "Tamu"),
      perangkat: (typeof navigator !== "undefined" && navigator.userAgent ? navigator.userAgent.slice(0, 60) : "-"),
      tgl: new Date().toISOString()
    });
    if (semua.length > 300) semua.splice(0, semua.length - 300);
    lsSet(K.log, semua);
  }
  function bersihkanLog() { lsSet(K.log, []); }
  function catatInsiden(judul, detail, tingkat) {
    catatLog("insiden", "[" + (tingkat || "sedang") + "] " + judul + " — " + (detail || ""), sesi() ? sesi().nama : "Sistem");
  }

  /* ---------------- Pusat Notifikasi (pemberitahuan) ----------------
     Tiga lapis penyampaian:
       1. In-app  → panel lonceng di topbar + riwayat di halaman Profil.
       2. Browser → notifikasi sistem (Notification API) selama aplikasi terbuka,
          izin diminta lewat tombol di panel lonceng.
       3. Email Google (opsional) → bila KURADAPT_CONFIG.NOTIF_WEBHOOK diisi URL
          Web App Google Apps Script (akun Google Anda sendiri), tiap pemberitahuan
          ikut dikirim sebagai email lewat MailApp — data tidak pernah meninggalkan
          akun Google pengirim. Mode "no-cors" dipakai karena Apps Script tidak
          mengirim header CORS. Kuota gratis: 100 email/jam. */
  const IKON_NOTIF = {
    soal: "i-flag", dokumen: "i-folder", pengumuman: "i-bell", nilai: "i-star",
    jadwal: "i-calendar", kegiatan: "i-users", verifikasi: "i-shield",
    undangan: "i-link", keamanan: "i-lock"
  };
  function semuaNotif() { return lsGet(K.notif, []); }
  function cocokNotif(n, s) {
    if (!s || !s.email) return false;
    if (n.ke && n.ke !== "*" && String(n.ke).toLowerCase() !== String(s.email).toLowerCase()) return false;
    if (n.jenjang && n.jenjang.length) {
      /* tenaga pendidik & pengelola melihat pemberitahuan seluruh ruang */
      const luas = ["guru", "dosen", "industri", "admin", "operator", "super"].indexOf(s.peran) > -1;
      if (!luas && n.jenjang.indexOf(s.jenjang) === -1) return false;
    }
    return true;
  }
  function notifSaya() {
    const s = sesi();
    if (!s) return [];
    return semuaNotif().filter(n => cocokNotif(n, s))
      .sort((a, b) => String(b.tgl).localeCompare(String(a.tgl)));
  }
  function belumDibaca() {
    const me = emailSaya();
    return notifSaya().filter(n => (n.dibaca || []).indexOf(me) === -1).length;
  }
  function kirimNotif(o) {
    const n = {
      id: uid("nt"),
      tipe: String(o.tipe || "pengumuman"),
      judul: String(o.judul || "Pemberitahuan").slice(0, 140),
      pesan: String(o.pesan || "").slice(0, 400),
      ke: String(o.ke || "*"),
      jenjang: Array.isArray(o.jenjang) ? o.jenjang : [],
      dari: String(o.dari || (sesi() ? sesi().nama : "Kuradapt")),
      rujuk: String(o.rujuk || ""),
      tgl: new Date().toISOString(),
      dibaca: []
    };
    const semua = semuaNotif();
    semua.push(n);
    if (semua.length > 200) semua.splice(0, semua.length - 200);
    lsSet(K.notif, semua);
    notifBrowser(n);
    notifGoogle(n);
    perbaruiBadgeNotif();
    return n.id;
  }
  function bacaNotif(id) {
    const me = emailSaya();
    const semua = semuaNotif();
    const n = semua.find(x => x.id === id);
    if (n && (n.dibaca || []).indexOf(me) === -1) {
      n.dibaca = (n.dibaca || []).concat([me]);
      lsSet(K.notif, semua);
    }
    perbaruiBadgeNotif();
  }
  function bacaSemuaNotif() {
    const me = emailSaya();
    const s = sesi();
    const semua = semuaNotif();
    let ubah = false;
    semuaNotif().forEach(n => { /* hanya yang untuk saya yang ditandai */
      if (s && cocokNotif(n, { email: me, jenjang: s.jenjang, peran: s.peran }) && (n.dibaca || []).indexOf(me) === -1) {
        const t = semua.find(x => x.id === n.id);
        if (t) { t.dibaca = (t.dibaca || []).concat([me]); ubah = true; }
      }
    });
    if (ubah) lsSet(K.notif, semua);
    perbaruiBadgeNotif();
  }
  function hapusNotif(id) { lsSet(K.notif, semuaNotif().filter(n => n.id !== id)); perbaruiBadgeNotif(); }

  /* ---- lapis 2: notifikasi sistem browser ---- */
  function notifBrowser(n) {
    try {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const s = sesi();
      if (!s || !cocokNotif(n, s)) return;
      new Notification("Kuradapt · " + n.judul, { body: n.pesan, icon: "icons/icon-192.png", tag: n.id });
    } catch (e) { }
  }
  function mintaNotifBrowser(cb) {
    try {
      if (typeof Notification === "undefined") { cb && cb("tidak"); return; }
      if (Notification.permission === "granted") { cb && cb("ya"); return; }
      if (Notification.permission === "denied") { cb && cb("tolak"); return; }
      const p = Notification.requestPermission();
      if (p && p.then) p.then(x => cb && cb(x)); else cb && cb("tunda");
    } catch (e) { cb && cb("gagal"); }
  }

  /* ---- lapis 3: email Google lewat Web App Apps Script ---- */
  function konfigNotif() {
    const c = (typeof window !== "undefined" && window.KURADAPT_CONFIG) || {};
    return String(c.NOTIF_WEBHOOK || "");
  }
  function tujuanEmail(n) {
    const hasil = {};
    daftarUsers().forEach(u => {
      if (!u || !u.email || u.nonaktif) return;
      if (cocokNotif(n, { email: u.email, jenjang: u.jenjang, peran: u.peran })) hasil[String(u.email).toLowerCase()] = true;
    });
    return Object.keys(hasil);
  }
  function notifGoogle(n) {
    try {
      const url = konfigNotif();
      if (!/^https:\/\/[^\s]+$/i.test(url) || typeof fetch === "undefined") return;
      const ke = tujuanEmail(n);
      if (!ke.length) return;
      fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          aplikasi: "Kuradapt",
          ke: ke,
          subjek: "Kuradapt · " + n.judul,
          pesan: n.pesan + (n.rujuk ? "\n\nBuka: " + location.origin + location.pathname + n.rujuk : ""),
          dari: n.dari,
          tipe: n.tipe,
          tgl: n.tgl
        })
      }).catch(() => { });
    } catch (e) { }
  }

  /* ---- UI lonceng topbar ---- */
  function perbaruiBadgeNotif() {
    const b = document.getElementById("notifJml");
    if (!b) return;
    const n = sesi() ? belumDibaca() : 0;
    b.textContent = n > 99 ? "99+" : String(n);
    b.hidden = n === 0;
  }
  function renderPanelNotif() {
    const p = document.getElementById("notifPanel");
    if (!p) return;
    const s = sesi();
    if (!s) { p.innerHTML = '<div class="np-empty">Silakan masuk untuk melihat pemberitahuan.</div>'; return; }
    const list = notifSaya().slice(0, 12);
    const me = emailSaya();
    p.innerHTML =
      '<div class="np-head"><b>' + ikon("i-bell") + ' Pemberitahuan</b>' +
      (list.length ? '<button class="np-link" id="npBacaAll">Tandai semua dibaca</button>' : '') + '</div>' +
      (list.length ? list.map(n => {
        const baru = (n.dibaca || []).indexOf(me) === -1;
        return '<button class="np-item' + (baru ? " baru" : "") + '" data-nt="' + esc(n.id) + '">' +
          '<span class="np-ico">' + ikon(IKON_NOTIF[n.tipe] || "i-bell") + '</span>' +
          '<span class="np-txt"><b>' + esc(n.judul) + '</b>' +
          '<small>' + esc(n.dari) + ' · ' + relatif(n.tgl) + (baru ? ' · <i class="np-dot"></i>baru' : '') + '</small>' +
          '<p>' + esc(n.pesan) + '</p></span></button>';
      }).join("") :
        '<div class="np-empty">' + ikon("i-inbox") + '<b>Belum ada pemberitahuan</b><span>Soal, dokumen, nilai, dan pengumuman dari tenaga pendidik akan muncul di sini.</span></div>') +
      '<div class="np-foot">' +
      '<button class="btn btn-sm btn-soft" id="npBrowser">' + ikon("i-bell") + ' Aktifkan notifikasi browser</button>' +
      '<a class="np-link" href="#/profil" id="npProfil">Profil &amp; riwayat saya ' + ikon("i-arrow") + '</a></div>';

    p.querySelectorAll("[data-nt]").forEach(b => b.onclick = () => {
      const n = semuaNotif().find(x => x.id === b.dataset.nt);
      bacaNotif(b.dataset.nt);
      tutupPanelNotif();
      if (n && n.rujuk) navigasi(n.rujuk);
      else perbaruiBadgeNotif();
    });
    const ba = document.getElementById("npBacaAll");
    if (ba) ba.onclick = () => { bacaSemuaNotif(); renderPanelNotif(); };
    const br = document.getElementById("npBrowser");
    if (br) br.onclick = () => mintaNotifBrowser(x => {
      toast(x === "ya" ? ikon("i-check") + " Notifikasi browser <b>aktif</b> — pemberitahuan muncul di layar perangkat"
        : ikon("i-warn") + (x === "tolak" ? " Izin notifikasi <b>ditolak</b> browser — izinkan lewat gembok di address bar"
          : x === "tidak" ? " Browser ini tidak mendukung notifikasi sistem" : " Izin belum diberikan"), x === "ya" ? "" : "no");
    });
    const np = document.getElementById("npProfil");
    if (np) np.onclick = () => tutupPanelNotif();
  }
  function togglePanelNotif() {
    const p = document.getElementById("notifPanel");
    if (!p) return;
    if (p.hidden) { renderPanelNotif(); p.hidden = false; }
    else p.hidden = true;
  }
  function tutupPanelNotif() { const p = document.getElementById("notifPanel"); if (p) p.hidden = true; }

  /* ---------------- Batas percobaan masuk (anti brute-force berjenjang) ----------------
     5 gagal → kunci 5 menit · 10 gagal → 15 menit · 15 gagal → 30 menit.
     Hitungan bertahan sampai berhasil masuk (hapusGagal) agar pemain berulang
     tidak bisa mengulang siklus dari nol. */
  function statusGagal(email) {
    const g = lsGet(K.gagal, {});
    const k = String(email).toLowerCase();
    const e = g[k];
    if (!e) return { n: 0, terkunci: false };
    if (e.sampai && Date.now() > e.sampai) {
      e.sampai = 0; g[k] = e; lsSet(K.gagal, g); /* kunci lepas, hitungan tetap */
      return { n: e.n || 0, terkunci: false };
    }
    return { n: e.n || 0, terkunci: !!e.sampai && Date.now() <= e.sampai };
  }
  function catatGagal(email) {
    const g = lsGet(K.gagal, {});
    const k = String(email).toLowerCase();
    const e = g[k] || { n: 0, sampai: 0 };
    e.n = (e.n || 0) + 1;
    let menit = 0;
    if (e.n >= 15) menit = 30;
    else if (e.n >= 10) menit = 15;
    else if (e.n >= 5) menit = 5;
    if (menit) {
      e.sampai = Date.now() + menit * 60000;
      catatInsiden("Percobaan masuk berulang", e.n + " percobaan gagal untuk " + email + " — akses dikunci " + menit + " menit", "tinggi");
    }
    g[k] = e; lsSet(K.gagal, g);
    return e;
  }
  function hapusGagal(email) { const g = lsGet(K.gagal, {}); delete g[String(email).toLowerCase()]; lsSet(K.gagal, g); }

  /* ---------------- MFA (opsional, simulasi untuk akun pengelola) ---------------- */
  function pengaturanMfa() {
    const out = Object.assign({ aktif: false, kode: "", berlaku: 0 }, lsGet(K.mfa, {}));
    lsSet(K.mfa, out); return out;
  }

  /* ---------------- Reveal on scroll ---------------- */
  function pasangReveal(root) {
    const els = (root || document).querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver(list => list.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
    els.forEach(e => io.observe(e));
  }

  /* ============================================================
     TAMPILAN: LANDING (halaman pengumuman publik)
     ============================================================ */
  function viewLanding() {
    const ann = semuaPengumuman().slice().sort((a, b) => new Date(b.tgl) - new Date(a.tgl));
    const totalMapel = URUT.reduce((a, c) => a + semuaMapel(c).length, 0);
    const totalSoalSemua = URUT.reduce((a, c) => a + totalSoal(c), 0);

    const floatCards = ann.slice(0, 3).map((p, i) => {
      const inisial = p.penulis.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
      return '<div class="float-card fc-' + (i + 1) + '"><div class="fc-top"><span class="fc-av">' + esc(inisial) + '</span>' +
        '<span><b>' + esc(p.penulis) + '</b><small>' + esc(PERAN[p.peran].nama) + '</small></span></div>' +
        '<h4>' + esc(p.judul) + '</h4><p>' + esc(p.isi.slice(0, 90)) + '…</p></div>';
    }).join("");

    const pillars = URUT.map((c, i) => {
      const j = JENJANG[c];
      return '<button class="pillar-card reveal" style="--acc:' + j.warna + ';animation-delay:' + (i * 60) + 'ms" data-panah="' + c + '">' +
        '<span class="ico">' + ikon(j.ikon) + '</span>' +
        '<span class="acc-tag">' + esc(j.tag) + '</span>' +
        '<h3>' + esc(j.nama) + '</h3><p>' + esc(j.desc) + '</p>' +
        '<span class="chip">' + j.keys.map(k => (DATA()[k] ? DATA()[k].mapel.length : 0) + " mapel " + esc(DATA()[k] ? DATA()[k].jenjang : "")).join(" · ") + '</span>' +
        '</button>';
    }).join("");

    const fitur = [
      ["i-bell", "Papan Pengumuman Live", "Informasi langsung dari guru, dosen, & mitra industri — muncul real-time di setiap ruang jenjang."],
      ["i-receipt", "Transkrip Nilai Nyata", "Komponen tugas, ulangan, UAS, bobot, predikat, dan IPK 4.00 — bukan sekadar angka acak."],
      ["i-folder", "Dokumen Digital", "Simpan & unggah tugas, jurnal, dan berkas penunjang langsung di ruang jenjang Anda."],
      ["i-bolt", "Latihan Adaptif", "Ribuan soal pilihan ganda dengan pembahasan + remedial otomatis untuk soal yang salah."],
      ["i-moon", "Tema Night & Terang", "Nyaman belajar siang maupun malam — satu ketukan untuk berpindah tema."],
      ["i-shield", "Ruang Terpisah per Jenjang", "SD, SMP, SMA/SMK, dan Kuliah punya ruang sendiri — fokus, rapi, tidak tercampur."]
    ].map(f => '<article class="card reveal"><div class="pillar-card" style="border:none;padding:0;box-shadow:none;--acc:var(--brand)">' +
      '<span class="ico">' + ikon(f[0]) + '</span><h3>' + f[1] + '</h3><p style="color:var(--muted);font-size:.87rem;margin:0">' + f[2] + '</p></div></article>').join("");

    return '' +
      /* HERO */
      '<section class="hero"><div class="wrap hero-in"><div class="hero-body">' +
      '<span class="hero-badge"><span class="live"></span> Papan pengumuman live · ' + ann.length + ' info terkini</span>' +
      '<h1>Belajar <em>Adaptif</em>, Kerja <em>Responsif</em>.</h1>' +
      '<p class="lead"><b>Kuradapt — Kurikulum Hidup, Masa Depan Terarah.</b> Kurikulum Pendamping lintas jenjang SD hingga Kuliah yang materinya diperbarui setiap bulan mengikuti perkembangan teknologi dan kebutuhan industri — tanpa menunggu birokrasi sekolah.</p>' +
      '<div class="hero-cta">' +
      '<button class="btn btn-primary btn-lg" id="ctaDaftar">' + ikon("i-rocket") + ' Daftar Gratis</button>' +
      '<button class="btn btn-ghost btn-lg" id="ctaMasuk">' + ikon("i-user") + ' Sudah Punya Akun</button></div>' +
      '<div class="hero-facts">' +
      '<div class="f"><b>' + totalMapel + '</b><span>Mata pelajaran</span></div>' +
      '<div class="f"><b>' + totalSoalSemua + '+</b><span>Soal & pembahasan</span></div>' +
      '<div class="f"><b>4</b><span>Pilar jenjang</span></div>' +
      '<div class="f"><b>Bulanan</b><span>Pembaruan materi</span></div></div>' +
      '</div><div class="hero-visual">' + floatCards + '</div></div></section>' +

      /* PENGUMUMAN */
      '<section class="sec" id="pengumuman"><div class="wrap">' +
      '<div class="sec-head reveal"><span class="sec-tag">' + ikon("i-bell") + ' Live dari Tenaga Pendidik</span>' +
      '<h2>Papan Pengumuman Kuradapt</h2>' +
      '<p>Semua informasi penting — jadwal, penilaian, program, dan peluang — diumumkan langsung oleh guru, dosen, dan mitra industri.</p></div>' +
      '<div class="ann-grid" id="annGrid">' + ann.slice(0, 6).map(p => kartuPengumuman(p, true)).join("") + '</div>' +
      '<div style="text-align:center;margin-top:26px"><button class="btn btn-soft" id="btnSemuaPengumuman">' + ikon("i-inbox") + ' Lihat Semua Pengumuman (' + ann.length + ')</button></div>' +
      '</div></section>' +

      /* 4 JENJANG */
      '<section class="sec" id="jenjang" style="background:var(--bg2);border-block:1px solid var(--line)"><div class="wrap">' +
      '<div class="sec-head reveal"><span class="sec-tag">' + ikon("i-cap") + ' Kurikulum Pendamping Lintas Jenjang</span>' +
      '<h2>Empat Pilar Jenjang Kuradapt</h2><p>Ruang belajar terpisah untuk setiap jenjang — materi, latihan, transkrip, dan pengumuman khusus jenjang tersebut.</p></div>' +
      '<div class="pillar-grid">' + pillars + '</div></div></section>' +

      /* FITUR */
      '<section class="sec" id="fitur"><div class="wrap">' +
      '<div class="sec-head reveal"><span class="sec-tag">' + ikon("i-bolt") + ' Fitur Unggulan</span>' +
      '<h2>Semua yang dibutuhkan, dalam satu ruang</h2></div>' +
      '<div class="pillar-grid">' + fitur + '</div></div></section>' +

      /* CTA */
      '<section class="sec" style="padding-top:0"><div class="wrap">' +
      '<div class="cta-band reveal"><h2>Mulai hari ini — gratis selamanya</h2>' +
      '<p>Daftar, pilih jenjang Anda, dan langsung masuk ke ruang belajar + papan pengumuman jenjang tersebut.</p>' +
      '<button class="btn btn-lg" id="ctaDaftar2">' + ikon("i-arrow") + ' Buat Akun Kuradapt</button></div></div></section>' +

      footerHTML();
  }

  function footerHTML() {
    return '<footer class="site-foot"><div class="wrap"><div class="foot-grid">' +
      '<div><a href="#/beranda" class="brand" style="margin-bottom:12px"><span class="mark"><svg class="logo-i"><use href="#logo-kuradapt"></use></svg></span>' +
      '<span class="txt"><b>Kuradapt</b><small>Kurikulum Hidup · Masa Depan Terarah</small></span></a>' +
      '<p style="color:var(--muted);font-size:.87rem;max-width:320px">Kurikulum Pendamping lintas jenjang SD hingga Kuliah. Materi diperbarui setiap bulan mengikuti perkembangan teknologi & kebutuhan industri global.</p></div>' +
      '<div><h4>Jenjang</h4>' + URUT.map(c => '<a href="#/beranda" data-panah="' + c + '">' + JENJANG[c].nama + '</a>').join("") + '</div>' +
      '<div><h4>Navigasi</h4><a href="#/pengumuman">Papan Pengumuman</a><a href="#/beranda" data-scroll="fitur">Fitur</a><a href="#/daftar">Daftar</a><a href="#/masuk">Masuk</a></div>' +
      '<div><h4>Layanan</h4><a href="#/materi">Materi Belajar</a><a href="#/perpustakaan">Perpustakaan Digital</a><a href="#/kurikulum">Sistem Kurikulum</a><a href="#/industri">Koneksi Industri</a><a href="#/admin">Panel Admin</a></div>' +
      '<div><h4>Legal</h4><span>Lisensi: © 2026 DAFFTECH</span><span>All Rights Reserved</span><a href="LICENSE">Lihat LICENSE</a></div>' +
      '</div><div class="foot-bot"><span>© 2026 DAFFTECH — Karya anak bangsa untuk pendidikan Indonesia.</span>' +
      '<span>Kuradapt v2.0 · PWA · Offline-ready</span></div></div></footer>';
  }

  function pascaLanding() {
    const ke = id => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
    ["ctaDaftar", "ctaDaftar2"].forEach(id => { const b = document.getElementById(id); if (b) b.onclick = () => navigasi("#/daftar"); });
    ["ctaMasuk"].forEach(id => { const b = document.getElementById(id); if (b) b.onclick = () => navigasi("#/masuk"); });
    const semua = document.getElementById("btnSemuaPengumuman");
    if (semua) semua.onclick = () => {
      const list = semuaPengumuman().slice().sort((a, b) => new Date(b.tgl) - new Date(a.tgl));
      bukaModal(mHead("i-bell", "Semua Pengumuman") +
        '<div class="modal-body"><div class="stack">' + list.map(p => kartuPengumuman(p, true)).join("") + '</div></div>');
    };
    document.querySelectorAll("[data-panah]").forEach(el => {
      el.onclick = () => {
        const s = sesi();
        if (s && jenjangSaya(s).indexOf(el.dataset.panah) > -1) navigasi("#/r/" + el.dataset.panah);
        else { sessionStorage.setItem("kuradapt_niat", el.dataset.panah); navigasi("#/daftar"); toast(ikon("i-compass") + " Pilih jenjang <b>" + JENJANG[el.dataset.panah].nama + "</b> saat mendaftar"); }
      };
    });
    pasangReveal(document);
  }

  /* ============================================================
     TAMPILAN: PENGUMUMAN (halaman khusus — tujuan tautan "Lihat papan pengumuman")
     Murni daftar pengumuman: tanpa hero, tanpa pilar, tanpa fitur.
     ============================================================ */
  function viewPengumuman() {
    const ann = semuaPengumuman().slice().sort((a, b) => new Date(b.tgl) - new Date(a.tgl));
    return '' +
      '<section class="sec ann-only" id="pengumuman"><div class="wrap">' +
      '<div class="sec-head">' +
      '<span class="sec-tag">' + ikon("i-bell") + ' Live dari Tenaga Pendidik</span>' +
      '<h2>Papan Pengumuman Kuradapt</h2>' +
      '<p>Semua informasi penting — jadwal, penilaian, program, dan peluang — diumumkan langsung oleh guru, dosen, dan mitra industri.</p>' +
      '</div>' +
      '<div class="ann-grid" id="annGrid">' + ann.map(p => kartuPengumuman(p, true)).join("") + '</div>' +
      '</div></section>';
  }

  /* ---------------- Router ---------------- */
  function navigasi(h) {
    if (location.hash === h) terapkanRute();
    else { location.hash = h; terapkanRute(); } /* render langsung; hashchange akan render ulang idempoten */
  }

  function terapkanRute() {
    const h = (location.hash || "#/").replace(/^#/, "");
    const bagian = h.split("/").filter(Boolean); // ["r","mahir"]
    tutupModal();
    tutupMenu();
    tutupRuangLive();   /* pindah halaman = keluar dari ruang live kegiatan */
    /* penanda halaman — dipakai CSS menyembunyikan nav marketing (di semua halaman) */
    document.body.setAttribute("data-route", bagian[0] || "beranda");
    const view = document.getElementById("view");
    if (!view) return;

    if (bagian[0] === "masuk") { view.innerHTML = viewMasuk(); pascaMasuk(); }
    else if (bagian[0] === "daftar") { view.innerHTML = viewDaftar(); pascaDaftar(); }
    else if (bagian[0] === "pilih") {
      const s = sesi();
      if (!s) { toast(ikon("i-lock") + " Silakan masuk terlebih dahulu", "no"); navigasi("#/masuk"); return; }
      view.innerHTML = viewPilih(s); pascaPilih(s);
    }
    else if (bagian[0] === "r") {
      const s = sesi();
      const code = bagian[1];
      if (!s) { toast(ikon("i-lock") + " Silakan masuk terlebih dahulu", "no"); navigasi("#/masuk"); return; }
      if (!JENJANG[code] || jenjangSaya(s).indexOf(code) === -1) {
        toast(ikon("i-warn") + " Ruang jenjang tersebut bukan untuk peran Anda", "no");
        navigasi("#/pilih"); return;
      }
      bukaRuang(code, s, bagian[2] || "beranda");
    }
    else if (bagian[0] === "admin") {
      const s = sesi();
      if (!s) { toast(ikon("i-lock") + " Silakan masuk terlebih dahulu", "no"); navigasi("#/masuk"); return; }
      if (["admin", "super"].indexOf(s.peran) === -1) { toast(ikon("i-lock") + " Hanya <b>Admin Sistem</b> yang boleh membuka panel ini", "no"); navigasi("#/pilih"); return; }
      view.innerHTML = viewAdmin();
      view.querySelectorAll("[data-ruang]").forEach(b => b.onclick = () => navigasi("#/r/" + b.dataset.ruang));
      view.querySelectorAll("[data-go]").forEach(b => b.onclick = () => navigasi("#/" + b.dataset.go));
      pascaAdmin();
      perbaruiTopbar(); window.scrollTo({ top: 0 }); return;
    }
    else if (bagian[0] === "profil") {
      const s = sesi();
      if (!s) { toast(ikon("i-lock") + " Silakan masuk terlebih dahulu", "no"); navigasi("#/masuk"); return; }
      view.innerHTML = viewProfil(s); pascaProfil(s);
    }
    else if (bagian[0] === "materi") {
      const s = sesi();
      if (!s) { toast(ikon("i-lock") + " Silakan masuk terlebih dahulu", "no"); navigasi("#/masuk"); return; }
      /* rute dibuka (bukan render ulang) → kembali ke daftar jenjang */
      M.jen = "semua"; M.cari = ""; M.code = null; M.mapelId = null; M.babId = null;
      view.innerHTML = viewMateriJenjang(); pascaMateriJenjang();
    }
    else if (bagian[0] === "perpustakaan") {
      const s = sesi();
      if (!s) { toast(ikon("i-lock") + " Silakan masuk terlebih dahulu", "no"); navigasi("#/masuk"); return; }
      BK.id = null; /* masuk halaman → daftar judul (bukan lanjut baca) */
      view.innerHTML = viewPerpustakaan(); pascaPerpustakaan();
    }
    else if (bagian[0] === "kurikulum") {
      const s = sesi();
      if (!s) { toast(ikon("i-lock") + " Silakan masuk terlebih dahulu", "no"); navigasi("#/masuk"); return; }
      view.innerHTML = viewKurikulum(); pascaKurikulum();
    }
    else if (bagian[0] === "industri") {
      const s = sesi();
      if (!s) { toast(ikon("i-lock") + " Silakan masuk terlebih dahulu", "no"); navigasi("#/masuk"); return; }
      view.innerHTML = viewIndustri(); pascaIndustri();
    }
    else if (bagian[0] === "pengumuman") { view.innerHTML = viewPengumuman(); }
    else if (bagian[0] === "beranda") { view.innerHTML = viewLanding(); pascaLanding(); }
    else {
      /* HALAMAN AWAL PLATFORM = LOGIN. Landing pengumuman bukan default lagi —
         hanya dibuka lewat tautan "Lihat Pengumuman" (atau setelah keluar akun). */
      const tuju = sesi() ? "#/pilih" : "#/masuk";
      try { history.replaceState(null, "", tuju); } catch (e) { location.hash = tuju; }
      terapkanRute(); /* render langsung; tanpa hashchange ganda */
      return;
    }

    perbaruiTopbar();
    window.scrollTo({ top: 0 });
  }

  function perbaruiTopbar() {
    const s = sesi();
    const chip = document.getElementById("userChip");
    const bm = document.getElementById("btnMasuk"), bd = document.getElementById("btnDaftar");
    const mm = document.getElementById("mmAct");
    if (s) {
      const inisial = (s.nama || "U").split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
      chip.innerHTML = '<span class="av">' + esc(inisial) + '</span><span class="nm">' + esc(s.nama) + '</span>';
      chip.classList.add("show"); chip.title = peranLabel(s) + " — klik untuk membuka profil";
      chip.onclick = () => navigasi("#/profil");
      const bn = document.getElementById("btnNotif");
      if (bn) bn.style.display = "";
      perbaruiBadgeNotif();
      if (bm) bm.style.display = "none";
      if (bd) bd.style.display = "none";
      if (mm) mm.innerHTML = '<button class="btn btn-ghost" id="mmRuang">Ruang Saya</button><button class="btn btn-danger" id="mmKeluar">Keluar</button>';
      const mr = document.getElementById("mmRuang"); if (mr) mr.onclick = () => navigasi("#/pilih");
      const mk = document.getElementById("mmKeluar"); if (mk) mk.onclick = () => { hapusSesi(); toast(ikon("i-check") + " Berhasil keluar"); navigasi("#/beranda"); };
    } else {
      chip.classList.remove("show"); chip.innerHTML = ""; chip.onclick = null;
      const bn = document.getElementById("btnNotif");
      if (bn) { bn.style.display = "none"; tutupPanelNotif(); }
      perbaruiBadgeNotif();
      if (bm) bm.style.display = "";
      if (bd) bd.style.display = "";
      if (mm) mm.innerHTML = '<button class="btn btn-ghost" id="btnMasuk2">Masuk</button><button class="btn btn-primary" id="btnDaftar2">Daftar Gratis</button>';
      const b2 = document.getElementById("btnMasuk2"); if (b2) b2.onclick = () => navigasi("#/masuk");
      const d2 = document.getElementById("btnDaftar2"); if (d2) d2.onclick = () => navigasi("#/daftar");
    }
    const nav = document.getElementById("tbNav");
    if (nav) nav.querySelectorAll("a").forEach(a => a.classList.toggle("on", a.dataset.nav === "beranda" && location.hash === "#/beranda"));
  }

  /* ---------------- Menu ---------------- */
  function tutupMenu() {
    const m = document.getElementById("mobileMenu"), b = document.getElementById("btnMenu");
    if (m) m.classList.remove("open");
    if (b) b.setAttribute("aria-expanded", "false");
  }
  function bukaMenu() {
    const m = document.getElementById("mobileMenu"), b = document.getElementById("btnMenu");
    if (!m) return;
    const buka = !m.classList.contains("open");
    m.classList.toggle("open", buka);
    if (b) b.setAttribute("aria-expanded", String(buka));
  }

  /* ---------------- Scroll section ---------------- */
  function scrollSection(id) {
    const jalan = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (location.hash !== "#/beranda") { location.hash = "#/beranda"; setTimeout(jalan, 90); }
    else jalan();
  }

  /* ============================================================
     TAMPILAN: MASUK (desain A — split panel gelap)
     ============================================================ */
  function viewMasuk() {
    const s = sesi();
    if (s) { setTimeout(() => navigasi("#/pilih"), 0); }
    return '<div class="auth-split">' +
      '<aside class="auth-visual">' +
      '<span class="av-glow g1"></span><span class="av-glow g2"></span>' +
      '<div class="av-body">' +
      '<span class="chip brand" style="background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.3);color:#fff;margin-bottom:16px">' + ikon("i-lock") + ' Masuk ke Ruang Belajar</span>' +
      '<h2>Selamat datang kembali.</h2>' +
      '<p>Satu akun untuk seluruh ruang jenjang Anda — materi, latihan, transkrip, dan papan pengumuman tetap tersimpan.</p>' +
      '<ul class="steps">' +
      '<li><b>1</b><span>Pilih jenjang & peran sesuai identitas Anda.</span></li>' +
      '<li><b>2</b><span>Masuk ke ruang jenjang yang <b>terpisah</b> khusus untuk Anda.</span></li>' +
      '<li><b>3</b><span>Ikuti pengumuman live dari guru & dosen.</span></li>' +
      '</ul></div>' +
      '<div class="quote">“<b>Kurikulum Hidup, Masa Depan Terarah.</b> — Belajar Adaptif, Kerja Responsif.”</div>' +
      '</aside>' +
      '<div class="auth-form-side"><form class="auth-form" id="formMasuk" novalidate>' +
      '<div class="af-head"><h1>Masuk</h1><p>Gunakan email yang terdaftar di Kuradapt.</p></div>' +
      '<div class="field" id="fEmailM"><label for="emailM">Email</label><span class="inp-wrap">' + ikon("i-mail") +
      '<input type="email" id="emailM" placeholder="nama@email.com" autocomplete="email"></span>' +
      '<span class="errmsg">Email belum diisi dengan benar.</span></div>' +
      '<div class="field" id="fPassM"><label for="passM">Kata Sandi</label><span class="inp-wrap">' + ikon("i-lock") +
      '<input type="password" id="passM" placeholder="••••••••" autocomplete="current-password"></span>' +
      '<span class="errmsg">Kata sandi minimal 6 karakter.</span></div>' +
      '<div class="field" id="fMfa" style="display:none"><label for="mfaM">Kode Keamanan (MFA)</label><span class="inp-wrap">' + ikon("i-shield") +
      '<input id="mfaM" placeholder="6 digit kode" inputmode="numeric" autocomplete="one-time-code"></span>' +
      '<span class="errmsg">Kode salah atau kedaluwarsa (berlaku 5 menit).</span>' +
      '<span class="form-note" id="mfaCatatan" style="display:none"></span></div>' +
      '<button class="btn btn-primary btn-block btn-lg" type="submit">' + ikon("i-arrow") + ' Masuk ke Ruang Saya</button>' +
      '<p class="form-note" style="margin-top:14px">' + ikon("i-shield") + ' Mode lokal: data tersimpan aman di perangkat ini. Belum punya akun?</p>' +
      '<p class="auth-alt">Belum punya akun? <a href="#/daftar"><b>Daftar gratis sekarang</b></a></p>' +
      '<p class="auth-alt" style="margin-top:8px"><a href="#/pengumuman">' + ikon("i-bell") + ' Lihat papan pengumuman</a></p>' +
      '</form></div></div>';
  }

  function pascaMasuk() {
    const f = document.getElementById("formMasuk");
    if (!f) return;
    let tahanMfa = null; /* pengguna lolos sandi, menunggu kode MFA */
    f.onsubmit = e => {
      e.preventDefault();
      const email = document.getElementById("emailM").value.trim();
      const pass = document.getElementById("passM").value;
      let oke = true;
      const setErr = (id, bad) => { const el = document.getElementById(id); if (el) el.classList.toggle("err", bad); if (bad) oke = false; };
      /* tahap kedua: verifikasi kode MFA */
      if (tahanMfa) {
        const mfa = pengaturanMfa();
        const kode = String(document.getElementById("mfaM").value || "").trim();
        if (kode !== String(mfa.kode) || Date.now() > mfa.berlaku) {
          setErr("fMfa", true);
          toast(ikon("i-lock") + " Kode keamanan salah atau kedaluwarsa", "no");
          return;
        }
        const u = tahanMfa; tahanMfa = null;
        document.getElementById("fMfa").style.display = "none";
        catatLog("keamanan", "Berhasil masuk dengan MFA: " + u.email, u.nama);
        selesaikanMasuk(u);
        return;
      }
      setErr("fEmailM", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      setErr("fPassM", pass.length < 6);
      if (!oke) { toast(ikon("i-warn") + " Periksa kembali isian Anda", "no"); return; }
      /* batas percobaan masuk (anti brute-force berjenjang) */
      const kg = statusGagal(email);
      if (kg.terkunci) {
        setErr("fPassM", true);
        const sisa = Math.max(1, Math.ceil((((lsGet(K.gagal, {})[email.toLowerCase()] || {}).sampai || Date.now()) - Date.now()) / 60000));
        toast(ikon("i-lock") + " Terlalu banyak percobaan gagal — akses dikunci <b>" + sisa + " menit</b>", "no");
        return;
      }
      const u = cariUser(email);
      if (!u || !cocokSandi(pass, u)) {
        const g = catatGagal(email);
        setErr("fPassM", true);
        const sisaG = g.sampai ? Math.max(1, Math.ceil((g.sampai - Date.now()) / 60000)) : 0;
        toast(ikon("i-x") + (g.sampai ? " Akses dikunci <b>" + sisaG + " menit</b> (" + g.n + " percobaan gagal)" : " Email atau kata sandi tidak cocok · percobaan " + g.n + "/5"), "no");
        return;
      }
      hapusGagal(email);
      if (u.nonaktif) { toast(ikon("i-lock") + " Akun <b>dinonaktifkan</b> oleh pengelola platform", "no"); catatLog("keamanan", "Percobaan masuk akun nonaktif: " + email, u.nama); return; }
      if (u.verif === "menunggu") {
        toast(ikon("i-shield") + " Akun masih <b>menunggu verifikasi</b> lembaga oleh Admin Sistem", "no");
        catatLog("verifikasi", "Percobaan masuk akun belum terverifikasi: " + email, u.nama);
        return;
      }
      /* MFA opsional untuk akun pengelola */
      const mfa = pengaturanMfa();
      if (mfa.aktif && ["admin", "operator", "super"].indexOf(u.peran) > -1) {
        tahanMfa = u;
        const wrap = document.getElementById("fMfa"), cat = document.getElementById("mfaCatatan");
        if (wrap) wrap.style.display = "";
        if (cat) { cat.style.display = ""; cat.innerHTML = ikon("i-shield") + ' Kode demo (mode lokal): <b>' + esc(String(mfa.kode)) + '</b> — berlaku 5 menit.'; }
        toast(ikon("i-shield") + " Masukkan <b>kode keamanan (MFA)</b> yang dikirim ke pengelola");
        const el = document.getElementById("mfaM"); if (el) el.focus();
        return;
      }
      selesaikanMasuk(u);
    };

    function selesaikanMasuk(u) {
      simpanSesi({ email: u.email, nama: u.nama, peran: u.peran, jenjang: u.jenjang });
      catatLog("masuk", "Berhasil masuk: " + u.email, u.nama);
      toast(ikon("i-check") + " Selamat datang, <b>" + esc(u.nama) + "</b>!");
      navigasi("#/pilih");
    }
  }

  /* ============================================================
     TAMPILAN: DAFTAR (desain B — wizard di atas latar berbeda)
     ============================================================ */
  function viewDaftar() {
    const niat = sessionStorage.getItem("kuradapt_niat") || "";
    sessionStorage.removeItem("kuradapt_niat");
    const opts = opsiDaftar().map(o =>
      '<button type="button" class="role-opt' + (niat && (niat === o.jenjang || niat === o.id) ? " on" : "") + '" data-op="' + o.id + '">' +
      '<span class="ri">' + ikon(o.ikon) + '</span><b>' + o.nama + '</b><small>' + o.sub + '</small></button>').join("");

    return '<div class="reg-page"><span class="blob b1"></span><span class="blob b2"></span>' +
      '<div class="wizard">' +
      '<div class="wizard-head">' +
      '<span class="brand"><span class="mark" style="width:44px;height:44px"><svg class="logo-i"><use href="#logo-kuradapt"></use></svg></span>' +
      '<span class="txt"><b>Kuradapt</b><small>Kurikulum Hidup · Masa Depan Terarah</small></span></span>' +
      '<h1>Buat Akun Baru</h1><p>Tiga langkah singkat — langsung masuk ke ruang jenjang Anda.</p></div>' +
      '<div class="wiz-steps">' +
      '<span class="ws on" data-ws="1"><span class="n">1</span> Jenjang & Peran</span>' +
      '<span class="ws" data-ws="2"><span class="n">2</span> Identitas</span>' +
      '<span class="ws" data-ws="3"><span class="n">3</span> Kata Sandi</span></div>' +
      '<form class="card" id="formDaftar" novalidate>' +

      '<div class="wiz-step on" data-step="1">' +
      '<div class="field"><label>Saya mendaftar sebagai</label>' +
      '<div class="role-grid" id="roleGrid">' + opts + '</div>' +
      '<span class="errmsg" id="errRole" style="display:none">Pilih salah satu jenjang/peran terlebih dahulu.</span></div>' +
      '<p class="form-note" id="catatanSuper"></p>' +
      '<div class="wiz-foot"><button type="button" class="btn btn-ghost" id="wBack1">Masuk</button>' +
      '<button type="button" class="btn btn-primary" id="wNext1">Lanjut ' + ikon("i-arrow") + '</button></div></div>' +

      '<div class="wiz-step" data-step="2">' +
      '<div class="field" id="fNama"><label for="namaD">Nama Lengkap</label><span class="inp-wrap">' + ikon("i-user") +
      '<input id="namaD" placeholder="Nama sesuai identitas" autocomplete="name"></span>' +
      '<span class="errmsg">Nama minimal 3 karakter.</span></div>' +
      '<div class="field" id="fEmail"><label for="emailD">Email</label><span class="inp-wrap">' + ikon("i-mail") +
      '<input type="email" id="emailD" placeholder="nama@email.com" autocomplete="email"></span>' +
      '<span class="errmsg">Format email belum benar.</span></div>' +
      /* ---- integrasi data sekolah/kampus/perusahaan (referensi offline; Dapodik/PDDikti di tahap backend) ---- */
      '<div class="row"><div class="field"><label for="fProv">Provinsi</label><span class="inp-wrap">' + ikon("i-compass") +
      '<select id="fProv"><option value="">— Pilih provinsi —</option>' +
      Object.keys(window.WILAYAH || {}).map(p => '<option value="' + esc(p) + '">' + esc(p) + '</option>').join("") +
      '</select></span></div>' +
      '<div class="field"><label for="fKab">Kabupaten / Kota</label><span class="inp-wrap">' + ikon("i-school") +
      '<select id="fKab" disabled><option value="">— Pilih provinsi dulu —</option></select></span></div></div>' +
      '<div class="row"><div class="field"><label for="fKec">Kecamatan <small>(opsional)</small></label><span class="inp-wrap">' + ikon("i-compass") +
      '<input id="fKec" placeholder="Nama kecamatan (jika ada)"></span></div>' +
      '<div class="field"><label for="fLembaga">Sekolah / Kampus / Perusahaan</label><span class="inp-wrap">' + ikon("i-building") +
      '<select id="fLembaga" disabled><option value="">— Pilih kabupaten dulu —</option></select></span></div></div>' +
      '<div class="field"><label for="fNisn">NISN / NIP / No. Induk Lembaga <small>(opsional)</small></label><span class="inp-wrap">' + ikon("i-receipt") +
      '<input id="fNisn" placeholder="Nomor identitas pendidikan untuk verifikasi"></span></div>' +
      '<p class="form-note">' + ikon("i-shield") + ' Pemilihan lembaga memakai <b>referensi data offline</b> (contoh data sekolah/kampus) — ' +
      'sinkronisasi resmi Dapodik/PDDikti menyusul pada tahap backend. Akun yang memilih lembaga <b>menunggu verifikasi</b> Admin Sistem sebelum bisa masuk.</p>' +
      '<div class="wiz-foot"><button type="button" class="btn btn-ghost" id="wBack2">' + ikon("i-arrow") + ' Kembali</button>' +
      '<button type="button" class="btn btn-primary" id="wNext2">Lanjut ' + ikon("i-arrow") + '</button></div></div>' +

      '<div class="wiz-step" data-step="3">' +
      '<div class="field" id="fPass"><label for="passD">Kata Sandi</label><span class="inp-wrap">' + ikon("i-lock") +
      '<input type="password" id="passD" placeholder="Minimal 6 karakter" autocomplete="new-password"></span>' +
      '<span class="errmsg">Kata sandi minimal 6 karakter.</span></div>' +
      '<div class="field" id="fPass2"><label for="passD2">Ulangi Kata Sandi</label><span class="inp-wrap">' + ikon("i-lock") +
      '<input type="password" id="passD2" placeholder="Ulangi kata sandi" autocomplete="new-password"></span>' +
      '<span class="errmsg">Kata sandi tidak sama.</span></div>' +
      '<div class="field" id="fKodePeng" style="display:none"><label for="kodePeng">Kode Undangan Pengelola</label><span class="inp-wrap">' + ikon("i-lock") +
      '<input id="kodePeng" placeholder="KA-XXXX-NN" autocomplete="off" spellcheck="false"></span>' +
      '<span class="errmsg" id="errKodePeng">Kode tidak ditemukan, nonaktif, kedaluwarsa, atau belum diisi.</span></div>' +
      '<p class="form-note" id="catatanPeng" style="display:none"></p>' +
      '<p class="form-note" id="ringkasDaftar"></p>' +
      '<div class="wiz-foot"><button type="button" class="btn btn-ghost" id="wBack3">' + ikon("i-arrow") + ' Kembali</button>' +
      '<button type="submit" class="btn btn-primary">' + ikon("i-rocket") + ' Buat Akun & Masuk</button></div></div>' +

      '</form>' +
      '<p class="auth-alt">Sudah punya akun? <a href="#/masuk"><b>Masuk di sini</b></a></p>' +
      '<p class="auth-alt" style="margin-top:8px"><a href="#/pengumuman">' + ikon("i-bell") + ' Lihat papan pengumuman</a></p>' +
      '</div></div>';
  }

  function pascaDaftar() {
    let pilih = null, langkah = 1, superMode = false;
    const setLangkah = n => {
      langkah = n;
      document.querySelectorAll(".wiz-step").forEach(s => s.classList.toggle("on", Number(s.dataset.step) === n));
      document.querySelectorAll(".wiz-steps .ws").forEach(s => {
        const i = Number(s.dataset.ws);
        s.classList.toggle("on", i === n);
        s.classList.toggle("done", i < n);
      });
      if (n === 3) {
        const r = document.getElementById("ringkasDaftar");
        if (r && pilih) {
          const o = opsiDaftar().find(x => x.id === pilih);
          r.innerHTML = ikon("i-cap") + ' Anda mendaftar sebagai <b>' + esc(o.nama) + '</b> — ' +
            esc(o.jenjang ? JENJANG[o.jenjang].nama : "akun tenaga pendidik") + '. ' +
            (o.jenjang ? "Ruang jenjang tersebut akan terpisah khusus untuk Anda." : "Anda dapat mengirim pengumuman ke ruang jenjang.");
        }
      }
      const g = document.getElementById("roleGrid");
      if (g && n === 1) g.scrollIntoView({ block: "nearest" });
    };

    document.querySelectorAll("#roleGrid .role-opt").forEach(b => {
      b.onclick = () => {
        document.querySelectorAll("#roleGrid .role-opt").forEach(x => x.classList.remove("on"));
        b.classList.add("on"); pilih = b.dataset.op;
        const e = document.getElementById("errRole"); if (e) e.style.display = "none";
        tampilKodePeng();
      };
    });

    /* kode undangan pengelola (Admin Sistem & Operator) — hanya untuk peran pengelola */
    const tampilKodePeng = () => {
      const o = pilih ? opsiDaftar().find(x => x.id === pilih) : null;
      const pengel = !!o && ["admin", "operator"].indexOf(o.peran) > -1;
      const f = document.getElementById("fKodePeng");
      const c = document.getElementById("catatanPeng");
      if (f) f.style.display = pengel ? "" : "none";
      if (c) {
        if (!pengel) c.style.display = "none";
        else {
          const adaPengelola = daftarUsers().some(u => u.peran === "admin" || u.peran === "operator");
          c.style.display = "";
          c.innerHTML = adaPengelola
            ? ikon("i-shield") + ' Akun pengelola hanya bisa dibuka memakai <b>kode undangan aktif</b> yang diterbitkan pihak berwenang.'
            : ikon("i-unlock") + ' Belum ada akun pengelola di platform ini — <b>pendaftaran pengelola pertama</b> dapat dilakukan tanpa kode.';
        }
      }
    };
    if (!pilih) { const on = document.querySelector("#roleGrid .role-opt.on"); if (on) pilih = on.dataset.op; }

    /* ---- Super Admin: pendaftar pertama tanpa kode, sisanya lewat kode undangan MASTER ---- */
    const catatSuper = () => {
      const el = document.getElementById("catatanSuper");
      if (!el) return;
      const adaSuper = daftarUsers().some(u => u.peran === "super");
      if (!adaSuper) {
        el.style.display = "";
        el.innerHTML = ikon("i-trophy") + ' Belum ada <b>Super Admin</b> di platform ini — ' +
          '<a href="#" id="daftarSuper" style="font-weight:800">jadikan akun pertama sebagai Super Admin</a>' +
          ' (mengawasi seluruh platform, mengatur kewenangan pengelola, & menangani insiden).';
        const a = document.getElementById("daftarSuper");
        if (a) a.onclick = e => {
          e.preventDefault();
          superMode = !superMode;
          el.classList.toggle("brand", superMode);
          el.innerHTML = ikon("i-trophy") + (superMode
            ? ' Mode <b>Super Admin</b> aktif — lanjutkan langkah berikutnya untuk membuat akun pengawas platform.'
            : ' Belum ada <b>Super Admin</b> — <a href="#" id="daftarSuper" style="font-weight:800">jadikan akun pertama sebagai Super Admin</a>.');
          if (superMode) toast(ikon("i-trophy") + " Mendaftar sebagai <b>Super Admin</b>");
          if (!superMode) catatSuper();
        };
      } else {
        el.style.display = "";
        el.classList.remove("brand");
        el.innerHTML = ikon("i-trophy") + ' Super Admin aktif sudah ada. Peran ini hanya bisa dibuka dengan <b>kode undangan MASTER</b> yang diterbitkan Super Admin.';
      }
    };
    catatSuper();

    /* ---- data wilayah & lembaga (dependen: provinsi → kabupaten → lembaga) ---- */
    const isiKab = () => {
      const prov = document.getElementById("fProv"), kab = document.getElementById("fKab"), lemb = document.getElementById("fLembaga");
      if (!prov || !kab || !lemb) return;
      const daftar = (window.WILAYAH || {})[prov.value] || [];
      kab.disabled = !daftar.length;
      kab.innerHTML = daftar.length
        ? '<option value="">— Pilih kabupaten / kota —</option>' + daftar.map(k => '<option value="' + esc(k) + '">' + esc(k) + '</option>').join("")
        : '<option value="">— Pilih provinsi dulu —</option>';
      lemb.disabled = true;
      lemb.innerHTML = '<option value="">— Pilih kabupaten dulu —</option>';
    };
    const isiLembaga = () => {
      const prov = document.getElementById("fProv"), kab = document.getElementById("fKab"), lemb = document.getElementById("fLembaga");
      if (!prov || !kab || !lemb) return;
      const semua = window.LEMBAGA || [];
      const cocok = semua.filter(l => l.provinsi === prov.value && l.kota === kab.value);
      lemb.disabled = false;
      lemb.innerHTML = '<option value="">— Belum memilih lembaga (lewati) —</option>' +
        cocok.map(l => '<option value="' + esc(l.id) + '">' + esc(l.nama) + ' · ' + esc((l.tipe || "").toUpperCase()) + '</option>').join("") +
        (cocok.length ? "" : '<option value="">(belum ada data lembaga untuk kota ini)</option>');
    };
    const provEl = document.getElementById("fProv"), kabEl = document.getElementById("fKab");
    if (provEl) provEl.onchange = isiKab;
    if (kabEl) kabEl.onchange = isiLembaga;

    const w1 = document.getElementById("wNext1");
    if (w1) w1.onclick = () => {
      if (!pilih && !superMode) { const e = document.getElementById("errRole"); if (e) e.style.display = "block"; toast(ikon("i-warn") + " Pilih jenjang/peran dulu", "no"); return; }
      setLangkah(2);
    };
    const b1 = document.getElementById("wBack1");
    if (b1) b1.onclick = () => navigasi("#/masuk");
    const b2 = document.getElementById("wBack2");
    if (b2) b2.onclick = () => setLangkah(1);
    const w2 = document.getElementById("wNext2");
    if (w2) w2.onclick = () => {
      const nama = document.getElementById("namaD").value.trim();
      const email = document.getElementById("emailD").value.trim();
      let oke = true;
      const setErr = (id, bad) => { const el = document.getElementById(id); if (el) el.classList.toggle("err", bad); if (bad) oke = false; };
      setErr("fNama", nama.length < 3);
      setErr("fEmail", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      if (!oke) { toast(ikon("i-warn") + " Periksa kembali isian Anda", "no"); return; }
      if (cariUser(email)) { setErr("fEmail", true); toast(ikon("i-warn") + " Email sudah terdaftar", "no"); return; }
      setLangkah(3);
    };
    const b3 = document.getElementById("wBack3");
    if (b3) b3.onclick = () => setLangkah(2);

    const f = document.getElementById("formDaftar");
    if (f) f.onsubmit = e => {
      e.preventDefault();
      const pass = document.getElementById("passD").value, pass2 = document.getElementById("passD2").value;
      let oke = true;
      const setErr = (id, bad) => { const el = document.getElementById(id); if (el) el.classList.toggle("err", bad); if (bad) oke = false; };
      setErr("fPass", pass.length < 6);
      setErr("fPass2", pass !== pass2 || pass2.length < 6);
      if (!oke) { toast(ikon("i-x") + " Kata sandi belum sesuai", "no"); return; }
      if (!pilih && !superMode) { setLangkah(1); return; }
      const o = opsiDaftar().find(x => x.id === pilih) || { peran: "super", jenjang: null, nama: "Super Admin" };
      const namaBaru = document.getElementById("namaD").value.trim();
      const emailBaru = document.getElementById("emailD").value.trim();
      let peranAkhir = o.peran;
      /* pengelola (Admin Sistem / Operator): wajib kode undangan — kecuali pendaftar pertama */
      if (["admin", "operator"].indexOf(o.peran) > -1) {
        const adaPengelola = daftarUsers().some(u => u.peran === "admin" || u.peran === "operator");
        if (adaPengelola) {
          const elKode = document.getElementById("kodePeng");
          const kode = elKode ? String(elKode.value || "").trim() : "";
          const uKode = kode ? tukarUndangan(kode, { email: emailBaru, nama: namaBaru }) : null;
          if (!uKode) {
            const fk = document.getElementById("fKodePeng"); if (fk) fk.classList.add("err");
            toast(ikon("i-lock") + " Kode undangan pengelola tidak valid", "no");
            return;
          }
          /* kode undangan bertipe "super" = kode MASTER → akun menjadi Super Admin */
          if (uKode.jenjang === "super") peranAkhir = "super";
        }
      }
      /* Super Admin: pendaftar pertama tanpa kode; setelah itu hanya lewat kode MASTER */
      if (superMode) {
        const adaSuper = daftarUsers().some(u => u.peran === "super");
        if (adaSuper) { toast(ikon("i-lock") + " Super Admin sudah ada — minta kode undangan MASTER", "no"); setLangkah(1); return; }
        peranAkhir = "super";
      }
      /* data wilayah & lembaga (integrasi Dapodik/PDDikti — referensi offline dulu) */
      const amb = id => { const el = document.getElementById(id); return el ? String(el.value || "").trim() : ""; };
      const prov = amb("fProv"), kab = amb("fKab"), kec = amb("fKec"), lembagaId = amb("fLembaga"), nisn = amb("fNisn");
      const lembaga = lembagaId ? (window.LEMBAGA || []).find(l => l.id === lembagaId) || null : null;
      const users = daftarUsers();
      const u = { nama: namaBaru, email: emailBaru, pass: sandiBaru(pass), peran: peranAkhir, jenjang: o.jenjang, tgl: new Date().toISOString() };
      if (prov || kab) u.wilayah = { provinsi: prov, kabupaten: kab, kecamatan: kec };
      if (nisn) u.nisn = nisn;
      if (lembaga) { u.lembaga = { id: lembaga.id, nama: lembaga.nama, tipe: lembaga.tipe }; u.verif = "menunggu"; }
      users.push(u); simpanUsers(users);
      catatLog("daftar", "Akun baru " + peranAkhir + ": " + u.email + (lembaga ? " · lembaga " + lembaga.nama : ""), u.nama);
      if (u.verif === "menunggu") {
        catatLog("verifikasi", "Menunggu verifikasi lembaga: " + u.email, u.nama);
        toast(ikon("i-shield") + " Akun tercatat — <b>menunggu verifikasi</b> Admin Sistem sebelum bisa masuk", "no");
        navigasi("#/masuk");
        return;
      }
      simpanSesi({ email: u.email, nama: u.nama, peran: u.peran, jenjang: u.jenjang });
      toast(ikon("i-party") + " Akun dibuka! Selamat datang, <b>" + esc(u.nama) + "</b>");
      navigasi("#/pilih");
    };
    setLangkah(1);
    tampilKodePeng();
  }

  /* ============================================================
     TAMPILAN: PILIH JENJANG
     ============================================================ */
  function viewPilih(s) {
    const boleh = jenjangSaya(s);
    const cards = URUT.map(c => {
      const j = JENJANG[c];
      const open = boleh.indexOf(c) > -1;
      const mapel = semuaMapel(c).length;
      const soal = totalSoal(c);
      return '<button class="pick-card' + (open ? "" : " locked") + '" style="--acc:' + j.warna + '" data-ruang="' + c + '"' + (open ? "" : " disabled") + '>' +
        '<span class="pk-ico">' + ikon(j.ikon) + '</span>' +
        '<span class="pk-sub">' + esc(j.label) + '</span>' +
        '<h3>' + esc(j.nama) + '</h3>' +
        '<p>' + esc(j.desc) + '</p>' +
        '<span class="pk-go">' + (open ? mapel + " mapel · " + soal + " soal " + ikon("i-arrow") : ikon("i-lock") + " Bukan untuk peran Anda") + '</span></button>';
    }).join("");

    return '<div class="pick-page"><div class="wrap">' +
      '<div class="pick-head"><span class="sec-tag">' + ikon("i-compass") + ' Ruang Terpisah per Jenjang</span>' +
      '<h1>Halo, ' + esc(s.nama) + '</h1>' +
      '<p>Anda masuk sebagai <b>' + esc(peranLabel(s)) + '</b>. Pilih ruang jenjang — tiap ruang punya pengumuman, materi, latihan, transkrip, dan dokumennya sendiri.</p>' +
      '<div style="margin-top:12px"><button class="btn btn-soft" id="pickProfil">' + ikon("i-users") + ' Profil Saya</button></div></div>' +
      '<div class="pick-grid">' + cards + '</div>' +

      '<div class="pick-undang">' +
      '<div class="pu-box"><span class="pu-ico">' + ikon("i-link") + '</span>' +
      '<div class="pu-body"><h3>Punya kode undangan?</h3>' +
      '<p>Tenaga pendidik dapat mengundang Anda ke jenjang lain. Masukkan kode untuk membuka akses tambahan.</p>' +
      '<div class="pu-form"><span class="inp-wrap">' + ikon("i-flag") +
      '<input id="undInput" placeholder="KA-XXXX-NN" autocomplete="off" spellcheck="false"></span>' +
      '<button class="btn btn-primary" id="undTukar">' + ikon("i-unlock") + ' Tukar Kode</button></div></div></div>' +
      (s.peran === "admin" || s.peran === "super" ? '<div style="text-align:center;margin-top:16px"><button class="btn btn-soft" id="goAdmin2">' + ikon("i-shield") + ' Buka Panel Admin Sistem</button></div>' : '') +
      '</div>' +

      '<div class="pick-undang" style="margin-top:18px">' +
      '<div class="pu-body"><h3>' + ikon("i-arrow") + ' Layanan Platform</h3>' +
      '<p>Akses cepat ke layanan lintas jenjang — materi SD s.d. Kuliah, perpustakaan, kurikulum ber-versi, dan koneksi industri.</p>' +
      '<div class="stack">' +
      '<button class="list-item" data-go="materi"><span class="li-ico">' + ikon("i-brain") + '</span><span class="li-body"><b>Materi Belajar</b><small>isi bab SD, SMP, SMA, SMK & Kuliah — baca langsung</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      '<button class="list-item" data-go="perpustakaan"><span class="li-ico">' + ikon("i-books") + '</span><span class="li-body"><b>Perpustakaan Digital</b><small>buku & modul gratis — baca langsung di halaman</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      '<button class="list-item" data-go="kurikulum"><span class="li-ico">' + ikon("i-scroll") + '</span><span class="li-body"><b>Sistem Kurikulum</b><small>versi & periode penerapan — riwayat tersimpan</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      '<button class="list-item" data-go="industri"><span class="li-ico">' + ikon("i-building") + '</span><span class="li-body"><b>Koneksi Dunia Industri</b><small>pelatihan, magang & lowongan mitra</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      '</div></div></div>' +

      '<div style="text-align:center;margin-top:34px"><button class="btn btn-ghost" id="pickLogout">' + ikon("i-logout") + ' Keluar akun</button></div>' +
      '</div></div>';
  }

  function pascaPilih(s) {
    document.querySelectorAll("[data-ruang]").forEach(b => {
      if (b.disabled) return;
      b.onclick = () => navigasi("#/r/" + b.dataset.ruang);
    });
    const lo = document.getElementById("pickLogout");
    if (lo) lo.onclick = () => { hapusSesi(); toast(ikon("i-check") + " Berhasil keluar"); navigasi("#/beranda"); };
    const ga = document.getElementById("goAdmin2");
    if (ga) ga.onclick = () => navigasi("#/admin");
    document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => navigasi("#/" + b.dataset.go));
    const tukar = document.getElementById("undTukar");
    if (tukar) tukar.onclick = () => {
      const inp = document.getElementById("undInput");
      const kode = (inp.value || "").trim();
      if (kode.length < 4) { toast(ikon("i-warn") + " Masukkan kode undangan yang valid", "no"); return; }
      const u = tukarUndangan(kode, s);
      if (!u) { toast(ikon("i-warn") + " Kode <b>" + esc(kode) + "</b> tidak ditemukan atau sudah dinonaktifkan", "no"); return; }
      beriAksesUndangan(s, u.jenjang);
      siarkan();
      toast(ikon("i-check") + ' Akses <b>' + esc(JENJANG[u.jenjang].nama) + '</b> terbuka lewat kode ' + esc(u.kode));
      inp.value = "";
      terapkanRute();
    };
    const pr = document.getElementById("pickProfil");
    if (pr) pr.onclick = () => navigasi("#/profil");
  }

  /* ============================================================
     HALAMAN PROFIL (semua jenjang & peran)
     ============================================================ */
  function bioUser(s) { const u = cariUser(s.email); return (u && u.bio) ? String(u.bio) : ""; }
  function statistikProfil(s) {
    const boleh = jenjangSaya(s);
    const ann = semuaPengumuman().filter(p => p.email && String(p.email).toLowerCase() === String(s.email).toLowerCase()).length;
    const dok = dokMeta().filter(d => d.oleh === s.nama).length;
    const keg = semuaKegiatan().filter(k => k.pembuat === s.nama).length;
    /* rata-rata nilai akhir seluruh mapel yang sudah dinilai */
    const store = semuaNilai();
    let jml = 0, n = 0;
    boleh.forEach(code => {
      const milik = (store[code] || {})[s.email] || {};
      Object.keys(milik).forEach(mid => {
        const v = milik[mid] || {};
        const ada = Number(v.tugas) + Number(v.uh) + Number(v.uas);
        if (ada > 0) { jml += (Number(v.tugas) + Number(v.uh) + Number(v.uas)) / 3; n++; }
      });
    });
    return { ann, dok, keg, rata: n ? Math.round(jml / n) : null, ruang: boleh };
  }
  function viewProfil(s) {
    const st = statistikProfil(s);
    const inisial = (s.nama || "U").split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
    const riwayat = notifSaya().slice(0, 20);
    const me = emailSaya();
    const webhook = konfigNotif();
    const u = cariUser(s.email) || {};
    return '<div class="profil-page"><div class="wrap">' +
      '<div class="pf-card">' +
      '<div class="pf-head">' +
      '<span class="pf-av">' + esc(inisial) + '</span>' +
      '<div class="pf-id"><h1 class="nama-profil">' + esc(s.nama) + '</h1>' +
      '<p>' + esc(s.email) + '</p>' +
      '<div class="pf-chips">' +
      '<span class="chip brand">' + ikon(PERAN[s.peran] ? PERAN[s.peran].ikon : "i-users") + esc(peranLabel(s)) + '</span>' +
      '<span class="chip">' + ikon("i-cap") + esc(s.jenjang && JENJANG[s.jenjang] ? JENJANG[s.jenjang].nama : "Jenjang umum") + '</span>' +
      '<span class="chip">' + ikon("i-clock") + 'Bergabung ' + tglIndo(u.tgl || s.tgl || Date.now()) + '</span>' +
      '</div></div>' +
      '<div class="pf-act">' +
      '<button class="btn btn-soft" id="pfGanti">' + ikon("i-pen") + ' Ubah bio</button>' +
      '<button class="btn btn-ghost" id="pfKeluar">' + ikon("i-logout") + ' Keluar</button>' +
      '</div></div>' +
      '<div class="pf-bio"><b>' + ikon("i-file") + ' Bio</b><p id="pfBioTeks">' +
      (u.bio ? esc(u.bio) : '<span class="pf-muted">Belum ada bio — klik "Ubah bio" untuk memperkenalkan diri.</span>') + '</p></div>' +
      '<div class="pf-grid">' +
      '<div class="pf-stat"><span class="lbl">Pengumuman ditulis</span><span class="val">' + st.ann + '</span></div>' +
      '<div class="pf-stat"><span class="lbl">Dokumen diunggah</span><span class="val">' + st.dok + '</span></div>' +
      '<div class="pf-stat"><span class="lbl">Kegiatan dibuat</span><span class="val">' + st.keg + '</span></div>' +
      '<div class="pf-stat"><span class="lbl">Rata-rata nilai</span><span class="val">' + (st.rata === null ? "—" : st.rata) + '</span></div>' +
      '</div>' +
      '<div class="pf-block"><b>' + ikon("i-compass") + ' Ruang jenjang saya (' + st.ruang.length + ')</b>' +
      '<div class="pf-chips">' + st.ruang.map(c => '<button class="chip" data-ruang="' + c + '">' + ikon(JENJANG[c].ikon) + esc(JENJANG[c].nama) + '</button>').join("") + '</div></div>' +
      '<div class="pf-block"><b>' + ikon("i-bell") + ' Pemberitahuan saya (' + riwayat.length + ')</b>' +
      (webhook ? '<span class="chip brand">' + ikon("i-shield") + ' Email Google: aktif</span>' :
        '<span class="chip">' + ikon("i-lock") + ' Email Google: nonaktif (atur NOTIF_WEBHOOK)</span>') +
      '<div class="stack pf-notif">' + (riwayat.length ? riwayat.map(n => {
        const baru = (n.dibaca || []).indexOf(me) === -1;
        return '<button class="list-item' + (baru ? " np-baru" : "") + '" data-nt="' + esc(n.id) + '">' +
          '<span class="li-ico">' + ikon(IKON_NOTIF[n.tipe] || "i-bell") + '</span>' +
          '<span class="li-body"><b>' + esc(n.judul) + (baru ? ' <span class="chip brand">baru</span>' : '') + '</b>' +
          '<small>' + esc(n.dari) + ' · ' + relatif(n.tgl) + ' — ' + esc(n.pesan) + '</small></span>' +
          '<span class="li-end">' + ikon("i-arrow") + '</span></button>';
      }).join("") :
        '<div class="empty"><span class="e-ico">' + ikon("i-inbox") + '</span><b>Belum ada pemberitahuan</b>' +
        '<span>Soal, dokumen, nilai, dan pengumuman dari tenaga pendidik akan muncul di sini.</span></div>') + '</div>' +
      (riwayat.length ? '<div style="margin-top:10px"><button class="btn btn-sm btn-soft" id="pfBacaAll">' + ikon("i-check") + ' Tandai semua dibaca</button></div>' : '') +
      '</div>' +
      '</div>' +
      '<div style="text-align:center;margin-top:22px"><button class="btn btn-ghost" id="pfKeluar2">' + ikon("i-logout") + ' Keluar akun</button></div>' +
      '</div></div>';
  }
  function pascaProfil(s) {
    const keluar = () => { hapusSesi(); tutupPanelNotif(); toast(ikon("i-check") + " Berhasil keluar"); navigasi("#/masuk"); };
    const k1 = document.getElementById("pfKeluar"), k2 = document.getElementById("pfKeluar2");
    if (k1) k1.onclick = keluar;
    if (k2) k2.onclick = keluar;
    const ba = document.getElementById("pfBacaAll");
    if (ba) ba.onclick = () => { bacaSemuaNotif(); terapkanRute(); };
    document.querySelectorAll(".profil-page [data-ruang]").forEach(b => b.onclick = () => navigasi("#/r/" + b.dataset.ruang));
    document.querySelectorAll(".profil-page [data-nt]").forEach(b => b.onclick = () => {
      const n = semuaNotif().find(x => x.id === b.dataset.nt);
      bacaNotif(b.dataset.nt);
      if (n && n.rujuk) navigasi(n.rujuk); else terapkanRute();
    });
    const gg = document.getElementById("pfGanti");
    if (gg) gg.onclick = () => {
      const u = cariUser(s.email) || {};
      bukaModal(mHead("i-pen", "Ubah bio profil") +
        '<div class="modal-body"><p>Bio singkat ditampilkan di halaman profil Anda.</p>' +
        '<textarea id="bioInput" rows="4" maxlength="240" placeholder="Perkenalkan diri, minat, atau bidang yang diajarkan...">' + esc(u.bio || "") + '</textarea>' +
        '<div class="wiz-foot"><button class="btn btn-ghost" data-tutup>Batal</button>' +
        '<button class="btn btn-primary" id="bioSimpan">' + ikon("i-check") + ' Simpan</button></div></div>');
      document.getElementById("bioSimpan").onclick = () => {
        const nilai = (document.getElementById("bioInput").value || "").trim().slice(0, 240);
        const semua = daftarUsers();
        const t = semua.find(x => String(x.email).toLowerCase() === String(s.email).toLowerCase());
        if (t) { t.bio = nilai; simpanUsers(semua); }
        tutupModal();
        toast(ikon("i-check") + " Bio profil <b>diperbarui</b>");
        terapkanRute();
      };
    };
  }

  /* ---- profil pengguna lain (dari tombol "Profil" mana pun) ---- */
  function modalProfil(cari) {
    const s = sesi();
    const u = cariUser(cari) ||
      daftarUsers().find(x => String(x.nama).toLowerCase() === String(cari).toLowerCase()) || null;
    if (!u) { toast(ikon("i-warn") + " Profil tidak ditemukan", "no"); return; }
    const inisial = (u.nama || "U").split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
    const palsu = { email: u.email, nama: u.nama, peran: u.peran, jenjang: u.jenjang };
    const st = statistikProfil(palsu);
    bukaModal(mHead(PERAN[u.peran] ? PERAN[u.peran].ikon : "i-users", "Profil pengguna") +
      '<div class="modal-body">' +
      '<div class="pf-head" style="margin-bottom:14px">' +
      '<span class="pf-av">' + esc(inisial) + '</span>' +
      '<div class="pf-id"><h3 class="nama-profil" style="margin:0">' + esc(u.nama) + '</h3>' +
      '<p style="margin:2px 0 6px">' + esc(u.email) + '</p>' +
      '<div class="pf-chips">' +
      '<span class="chip brand">' + ikon(PERAN[u.peran] ? PERAN[u.peran].ikon : "i-users") + esc(PERAN[u.peran] ? PERAN[u.peran].nama : u.peran) + '</span>' +
      '<span class="chip">' + ikon("i-cap") + esc(u.jenjang && JENJANG[u.jenjang] ? JENJANG[u.jenjang].nama : "Jenjang umum") + '</span>' +
      (u.nonaktif ? '<span class="chip">' + ikon("i-lock") + ' nonaktif</span>' : '') +
      '</div></div></div>' +
      '<p>' + (u.bio ? esc(u.bio) : '<span class="pf-muted">Belum ada bio.</span>') + '</p>' +
      '<div class="pf-grid">' +
      '<div class="pf-stat"><span class="lbl">Pengumuman</span><span class="val">' + st.ann + '</span></div>' +
      '<div class="pf-stat"><span class="lbl">Dokumen</span><span class="val">' + st.dok + '</span></div>' +
      '<div class="pf-stat"><span class="lbl">Kegiatan</span><span class="val">' + st.keg + '</span></div>' +
      '<div class="pf-stat"><span class="lbl">Rata-rata nilai</span><span class="val">' + (st.rata === null ? "—" : st.rata) + '</span></div>' +
      '</div>' +
      '<p style="font-size:.8rem;opacity:.75;margin-top:12px">Bergabung ' + tglIndo(u.tgl || Date.now()) +
      (s && (s.peran === "admin" || s.peran === "super") ? '' : '') + '</p>' +
      '<div class="wiz-foot"><button class="btn btn-primary" data-tutup>Tutup</button></div></div>');
  }

  /* ---- anggota satu ruang jenjang ---- */
  function anggotaRuang(code) {
    return daftarUsers().filter(u =>
      u.jenjang === code || (u.undangan && u.undangan.indexOf(code) > -1));
  }
  function modalAnggota(code) {
    const ang = anggotaRuang(code);
    bukaModal(mHead("i-users", "Anggota " + (JENJANG[code] ? JENJANG[code].nama : code)) +
      '<div class="modal-body"><div class="stack">' +
      (ang.length ? ang.map(u =>
        '<button class="list-item" data-profil="' + esc(u.email) + '">' +
        '<span class="li-ico">' + ikon(PERAN[u.peran] ? PERAN[u.peran].ikon : "i-users") + '</span>' +
        '<span class="li-body"><b>' + esc(u.nama) + (u.email === emailSaya() ? ' <span class="chip">Anda</span>' : '') + '</b>' +
        '<small>' + esc(u.email) + ' · ' + esc(PERAN[u.peran] ? PERAN[u.peran].nama : u.peran) +
        (u.undangan && u.undangan.indexOf(code) > -1 ? ' · undangan' : '') + '</small></span>' +
        '<span class="li-end">' + ikon("i-arrow") + '</span></button>').join("")
        : '<div class="empty"><span class="e-ico">' + ikon("i-users") + '</span><b>Belum ada anggota</b></div>') +
      '</div><div class="wiz-foot"><button class="btn btn-primary" data-tutup>Tutup</button></div></div>');
  }

  /* ============================================================
     RUANG JENJANG (terpisah)
     ============================================================ */
  let R = { code: null, tab: "beranda", mapelId: null, babId: null, quiz: null, quizPilihMapel: null, annEdit: null, draftSoal: null };

  /* state halaman materi semua jenjang (#/materi) — jenjang filter, pencarian,
     mapel & bab terpilih (konten bab dirender lazily saat dibuka) */
  const M = { jen: "semua", cari: "", code: null, mapelId: null, babId: null };

  /* state pembaca perpustakaan (#/perpustakaan) — buku yang sedang DIBACA
     langsung di halaman (pengganti tombol "Unduh .txt") */
  const BK = { id: null };

  /* state ruang live kegiatan (overlay) — id kegiatan, nama peserta yang
     membuka ruang, & kunci jalan pintas Escape */
  const LR = { id: null, nama: null, onEsc: null };

  const TABS = [
    ["beranda", "i-school", "Beranda"],
    ["pengumuman", "i-bell", "Pengumuman"],
    ["materi", "i-books", "Materi"],
    ["latihan", "i-bolt", "Latihan"],
    ["transkrip", "i-receipt", "Transkrip"],
    ["dokumen", "i-folder", "Dokumen"],
    ["kegiatan", "i-calendar", "Kegiatan"]
  ];
  /* tab tambahan: Kelola (admin/operator), Pantau (seluruh tenaga pendidik) */
  function tabsUntuk(s) {
    const t = TABS.slice();
    if (panelKelola(s)) t.push(["kelola", s.peran === "admin" ? "i-shield" : "i-gear", "Kelola"]);
    if (bisaTulis(s, R.code)) t.push(["pantau", "i-chart", "Pantau"]);
    return t;
  }

  function emailSaya() { const s = sesi(); return s ? s.email : "tamu"; }
  function progresAll() {
    const all = lsGet(K.progres, {});
    let ubah = false;
    URUT.forEach(c => {
      const v = all[c];
      /* struktur lama: {bab, latihan} langsung di level jenjang (satu perangkat)
         → pindahkan ke pemilik sesi ini agar progres tiap pengguna terpisah */
      if (v && Array.isArray(v.bab)) { all[c] = {}; all[c][emailSaya()] = v; ubah = true; }
    });
    if (ubah) lsSet(K.progres, all);
    return all;
  }
  function progresUser(code, email) {
    const all = progresAll();
    if (!all[code]) all[code] = {};
    if (!all[code][email]) all[code][email] = { bab: [], latihan: {} };
    return all[code][email];
  }
  function progres() { return progresUser(R.code, emailSaya()); }
  function simpanProgres(rec) {
    const all = progresAll();
    if (!all[R.code]) all[R.code] = {};
    all[R.code][emailSaya()] = rec || progres();
    lsSet(K.progres, all);
  }
  function progresRuang() { return progres(); }
  function totalBab(code) { return semuaMapel(code).reduce((a, m) => a + (m.bab ? m.bab.length : 0), 0); }

  function bukaRuang(code, s, tab) {
    const ganti = (R.code !== code);
    R.code = code;
    if (ganti) { R.mapelId = null; R.babId = null; R.quiz = null; R.quizPilihMapel = null; R.annEdit = null; R.draftSoal = null; }
    if (tabsUntuk(s).some(t => t[0] === tab)) R.tab = tab;
    renderRuang(s);
  }

  function renderRuang(s) {
    s = s || sesi();
    const j = JENJANG[R.code];
    const view = document.getElementById("view");
    const pr = progresRuang();
    const tabs = tabsUntuk(s).map(t => '<button data-tab="' + t[0] + '"' + (R.tab === t[0] ? ' class="on"' : '') + '>' + ikon(t[1]) + t[2] + '</button>').join("");

    view.innerHTML =
      '<section class="space" data-j="' + R.code + '">' +
      '<div class="space-head"><div class="wrap">' +
      '<div class="sh-in"><div class="sh-brand">' +
      '<span class="sh-ico">' + ikon(j.ikon) + '</span>' +
      '<span><h1>' + esc(j.nama) + '</h1><span class="sh-sub">' + esc(j.label) + ' · ' + esc(j.tag) + ' · Ruang khusus ' + esc(peranLabel(s)) + '</span></span></div>' +
      '<div class="sh-stats">' +
      '<span class="sh-stat"><b>' + semuaMapel(R.code).length + '</b><span>Mapel</span></span>' +
      '<span class="sh-stat"><b>' + totalSoal(R.code) + '</b><span>Soal</span></span>' +
      '<span class="sh-stat"><b>' + pr.bab.length + '/' + totalBab(R.code) + '</b><span>Bab selesai</span></span>' +
      '<span class="sh-stat"><b>' + pengumumanRuang(R.code).length + '</b><span>Pengumuman</span></span>' +
      '<button class="sh-stat sh-mat" id="shAnggota" title="Lihat anggota ruang ini">' +
      '<b>' + anggotaRuang(R.code).length + '</b><span>Anggota ' + ikon("i-users") + '</span></button>' +
      '</div></div>' +
      '<div class="wrap"><div class="space-tabs" id="spaceTabs">' + tabs + '</div></div>' +
      '</div></div>' +
      '<div class="wrap space-body" id="spaceBody"></div>' +
      '</section>';

    document.getElementById("spaceTabs").querySelectorAll("[data-tab]").forEach(b => {
      b.onclick = () => { R.tab = b.dataset.tab; R.mapelId = null; R.babId = null; R.quiz = null; R.annEdit = null; R.draftSoal = null; renderRuang(); };
    });
    const shg = document.getElementById("shAnggota");
    if (shg) shg.onclick = () => modalAnggota(R.code);
    renderTab();
    pasangReveal(view);
  }

  function renderTab() {
    const body = document.getElementById("spaceBody");
    if (!body) return;
    if (R.tab === "beranda") body.innerHTML = tabBeranda();
    else if (R.tab === "pengumuman") { body.innerHTML = tabPengumuman(); pascaPengumuman(); }
    else if (R.tab === "materi") { body.innerHTML = tabMateri(); pascaMateri(); }
    else if (R.tab === "latihan") { body.innerHTML = tabLatihan(); pascaLatihan(); }
    else if (R.tab === "transkrip") { body.innerHTML = tabTranskrip(); pascaTranskrip(); }
    else if (R.tab === "dokumen") { body.innerHTML = tabDokumen(); pascaDokumen(); }
    else if (R.tab === "kegiatan") { body.innerHTML = tabKegiatan(); pascaKegiatan(); }
    else if (R.tab === "kelola") { body.innerHTML = tabKelola(); pascaKelola(); }
    else if (R.tab === "pantau") { body.innerHTML = tabPantau(); pascaPantau(); }
    pasangReveal(body);
  }

  /* ---------------- Beranda ruang ---------------- */
  function tabBeranda() {
    const pr = progresRuang();
    const mapel = semuaMapel(R.code);
    const nilaiList = mapel.map(m => nilaiMapel(R.code, m)).filter(x => x.ada);
    const rata = nilaiList.length ? Math.round(nilaiList.reduce((a, x) => a + x.akhir, 0) / nilaiList.length) : 0;
    const latCount = Object.keys(pr.latihan || {}).length;
    const ann = pengumumanRuang(R.code).slice(0, 3);
    const j = JENJANG[R.code];

    return '<div class="stat-grid">' +
      '<div class="stat-card"><span class="lbl">Mata Pelajaran</span><span class="val">' + mapel.length + '</span><span class="note">' + esc(j.label) + '</span></div>' +
      '<div class="stat-card"><span class="lbl">Bab Dipelajari</span><span class="val">' + pr.bab.length + '/' + totalBab(R.code) + '</span><span class="note">tandai selesai di tab Materi</span></div>' +
      '<div class="stat-card"><span class="lbl">Latihan Selesai</span><span class="val">' + latCount + '</span><span class="note">dari ' + mapel.length + ' mapel</span></div>' +
      '<div class="stat-card"><span class="lbl">Rata-rata Nilai</span><span class="val">' + (rata || "—") + '</span><span class="note">' + (rata >= 75 ? "tuntas · di atas KKM 75" : "kerjakan latihan untuk mengisi") + '</span></div>' +
      '</div>' +

      '<div class="grid-2"><div>' +
      '<div class="sec-head" style="margin-bottom:14px"><span class="sec-tag">' + ikon("i-bell") + ' Terbaru</span><h2 style="font-size:1.25rem">Pengumuman Ruang Ini</h2></div>' +
      '<div class="stack">' + (ann.length ? ann.map(p => kartuPengumuman(p, false)).join("") : '<div class="empty"><span class="e-ico">' + ikon("i-bell") + '</span><b>Belum ada pengumuman</b><span>Tenaga pendidik akan mengirim info ke sini.</span></div>') + '</div>' +
      '<button class="btn btn-soft" style="margin-top:14px" id="goPengumuman">' + ikon("i-arrow") + ' Semua Pengumuman</button>' +
      '</div><div>' +
      '<div class="sec-head" style="margin-bottom:14px"><span class="sec-tag">' + ikon("i-bolt") + ' Aksi Cepat</span><h2 style="font-size:1.25rem">Lanjut Belajar</h2></div>' +
      '<div class="stack">' +
      '<button class="list-item" id="goMateri"><span class="li-ico">' + ikon("i-books") + '</span><span class="li-body"><b>Buka Materi</b><small>' + mapel.length + ' mata pelajaran · ' + totalBab(R.code) + ' bab</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      '<button class="list-item" id="goLatihan"><span class="li-ico">' + ikon("i-bolt") + '</span><span class="li-body"><b>Kerjakan Latihan</b><small>' + totalSoal(R.code) + ' soal ber-pembahasan</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      '<button class="list-item" id="goTranskrip"><span class="li-ico">' + ikon("i-receipt") + '</span><span class="li-body"><b>Transkrip Nilai</b><small>komponen nyata · predikat · ekspor CSV</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      '<button class="list-item" id="goDokumen"><span class="li-ico">' + ikon("i-folder") + '</span><span class="li-body"><b>Dokumen Digital</b><small>unggah & simpan tugas/berkas</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      '</div></div></div>';
  }

  /* ---------------- Pengumuman ---------------- */
  function tabPengumuman() {
    const s = sesi();
    const boleh = bisaTulis(s, R.code);
    const list = pengumumanRuang(R.code).slice().sort((a, b) => new Date(b.tgl) - new Date(a.tgl));
    const sedangUbah = R.annEdit ? semuaPengumuman().find(p => p.id === R.annEdit) : null;
    const compose = boleh ?
      '<div class="compose"><h3>' + ikon("i-pen") + ' ' + (sedangUbah ? 'Ubah Pengumuman' : 'Kirim Pengumuman ke ' + esc(JENJANG[R.code].nama)) + '</h3>' +
      '<div class="row"><div class="field"><label for="annJudul">Judul</label><span class="inp-wrap">' + ikon("i-flag") +
      '<input id="annJudul" value="' + esc(sedangUbah ? sedangUbah.judul : "") + '" placeholder="Contoh: Jadwal penilaian minggu depan"></span></div>' +
      '<div class="field"><label for="annIsi">Isi pengumuman</label><textarea id="annIsi" placeholder="Tulis info untuk siswa/mahasiswa...">' + esc(sedangUbah ? sedangUbah.isi : "") + '</textarea></div></div>' +
      '<button class="btn btn-primary" id="annKirim">' + ikon(sedangUbah ? "i-check" : "i-bell") + ' ' + (sedangUbah ? 'Simpan Perubahan' : 'Terbitkan Sekarang') + '</button> ' +
      (sedangUbah ? '<button class="btn btn-ghost" id="annBatal">' + ikon("i-x") + ' Batal Ubah</button> ' : '') +
      '<span class="chip brand">' + ikon("i-refresh") + ' Live ke seluruh perangkat terbuka</span></div>'
      :
      '<div class="form-note">' + ikon("i-users") + ' Pengumuman dikelola oleh <b>tenaga pendidik</b> (guru/dosen/industri) untuk ruang ' + esc(JENJANG[R.code].nama) + '. Anda akan melihatnya langsung saat diterbitkan.</div>';

    return compose +
      '<div class="sec-head" style="margin:22px 0 16px"><span class="sec-tag">' + ikon("i-bell") + ' Live</span>' +
      '<h2 style="font-size:1.35rem">Papan Pengumuman · ' + esc(JENJANG[R.code].nama) + '</h2>' +
      '<p>' + list.length + ' pengumuman dari tenaga pendidik jenjang ini.' + (boleh ? ' Tekan <b>Ubah</b>/<b>Hapus</b> pada kartu untuk mengelola.' : '') + '</p></div>' +
      '<div class="ann-grid" id="ruangAnn">' +
      (list.length ? list.map(p => kartuPengumuman(p, false, boleh)).join("") :
        '<div class="empty"><span class="e-ico">' + ikon("i-inbox") + '</span><b>Belum ada pengumuman</b><span>Yang pertama muncul akan ditandai BARU.</span></div>') +
      '</div>';
  }

  function pascaPengumuman() {
    const s = sesi();
    const tombol = document.getElementById("annKirim");
    if (tombol) tombol.onclick = () => {
      const judul = (document.getElementById("annJudul").value || "").trim();
      const isi = (document.getElementById("annIsi").value || "").trim();
      if (judul.length < 4 || isi.length < 10) { toast(ikon("i-warn") + " Judul & isi pengumuman belum lengkap", "no"); return; }
      if (R.annEdit) {
        ubahPengumuman(R.annEdit, { judul: judul, isi: isi });
        R.annEdit = null; siarkan();
        toast(ikon("i-check") + " Pengumuman <b>diperbarui</b> — langsung terkirim live");
      } else {
        pengumumanBaru({ id: uid("p"), judul, isi, penulis: s.nama, peran: s.peran, email: s.email, jenjang: R.code, tgl: new Date().toISOString() });
        siarkan();
        toast(ikon("i-check") + " Pengumuman <b>terbit</b> — langsung terkirim live");
      }
      renderTab();
    };
    const batal = document.getElementById("annBatal");
    if (batal) batal.onclick = () => { R.annEdit = null; renderTab(); };

    document.querySelectorAll("[data-ann-edit]").forEach(b => b.onclick = () => {
      R.annEdit = b.dataset.annEdit;
      renderTab();
      toast(ikon("i-pen") + " Mode <b>ubah</b> — sunting lalu tekan Simpan Perubahan");
      const body = document.getElementById("spaceBody");
      if (body) body.scrollIntoView({ block: "start" });
    });
    document.querySelectorAll("[data-ann-hapus]").forEach(b => b.onclick = () => {
      const p = semuaPengumuman().find(x => x.id === b.dataset.annHapus);
      if (!p) return;
      bukaModal(mHead("i-warn", "Hapus pengumuman?") +
        '<div class="modal-body"><p>Pengumuman <b>' + esc(p.judul) + '</b> akan dihapus dari papan ruang ini.</p>' +
        '<div class="wiz-foot"><button class="btn btn-ghost" data-tutup>Batal</button><button class="btn btn-danger" id="okHapusAnn">Hapus</button></div></div>');
      document.getElementById("okHapusAnn").onclick = () => {
        hapusPengumuman(p.id);
        if (R.annEdit === p.id) R.annEdit = null;
        tutupModal(); siarkan();
        toast(ikon("i-trash") + " Pengumuman dihapus");
        renderTab();
      };
    });
  }

  /* ---------------- Materi ---------------- */
  function tabMateri() {
    const mapel = semuaMapel(R.code);
    if (!R.mapelId) {
      return '<div class="sec-head" style="margin-bottom:16px"><span class="sec-tag">' + ikon("i-books") + ' Materi</span>' +
        '<h2 style="font-size:1.4rem">Pilih Mata Pelajaran</h2><p>' + mapel.length + ' mapel · diperbarui setiap bulan mengikuti kurikulum & industri.</p></div>' +
        '<div class="stack">' + mapel.map(m => {
          const soal = (m.bab || []).reduce((a, b) => a + (b.soal ? b.soal.length : 0), 0);
          return '<button class="list-item" data-mapel="' + esc(m.id) + '">' +
            '<span class="li-ico">' + ikon(m.ikon || "i-books") + '</span>' +
            '<span class="li-body"><b>' + esc(m.nama) + (m._srcLabel ? ' <span class="chip" style="font-size:.62rem">' + esc(m._srcLabel) + '</span>' : '') + '</b>' +
            '<small>' + esc(m.ringkas || "") + '</small></span>' +
            '<span class="li-end">' + (m.bab ? m.bab.length : 0) + ' bab · ' + soal + ' soal ' + ikon("i-arrow") + '</span></button>';
        }).join("") + '</div>';
    }
    const m = cariMapel(R.code, R.mapelId);
    if (!m) { R.mapelId = null; return tabMateri(); }

    if (!R.babId) {
      const pr = progresRuang();
      const boleh = bisaTulis(sesi(), R.code);
      const kosong = !(m.bab || []).length;
      const tambahBab = (m.kustom && boleh) ?
        '<div class="compose"><h3>' + ikon("i-plus") + ' Tambah Isi Pelajaran — ' + esc(m.nama) + '</h3>' +
        '<div class="row"><div class="field"><label for="babJudul">Judul bab</label><span class="inp-wrap">' + ikon("i-flag") +
        '<input id="babJudul" placeholder="Contoh: Pengantar & Tujuan Pembelajaran"></span></div>' +
        '<div class="field"><label for="babRingkas">Ringkasan</label><span class="inp-wrap">' + ikon("i-pen") +
        '<input id="babRingkas" placeholder="Ringkasan singkat bab (opsional)"></span></div></div>' +
        '<div class="field"><label for="babIsi">Isi materi (boleh HTML sederhana: &lt;p&gt;, &lt;h4&gt;, &lt;ul&gt;, &lt;b&gt;)</label>' +
        '<textarea id="babIsi" rows="5" placeholder="Tulis materi bab di sini..."></textarea></div>' +
        '<button class="btn btn-primary" id="babTambah">' + ikon("i-plus") + ' Simpan Bab</button></div>'
        : '';
      return '<button class="btn btn-ghost btn-sm" id="matKembali">' + ikon("i-arrow") + ' Semua mapel</button>' +
        '<div class="sec-head" style="margin:16px 0"><span class="sec-tag">' + ikon(m.ikon || "i-books") + ' ' + esc(m.nama) + '</span>' +
        '<h2 style="font-size:1.4rem">Daftar Bab</h2><p>' + esc(m.ringkas || "") + '</p></div>' +
        tambahBab +
        '<div class="stack">' + (kosong && !tambahBab ?
          '<div class="empty"><span class="e-ico">' + ikon("i-books") + '</span><b>Belum ada bab</b><span>Materi pelajaran ini sedang disiapkan pengajar.</span></div>' : '') +
        (m.bab || []).map((b, i) => {
          const done = pr.bab.indexOf(b.id) > -1;
          return '<button class="list-item" data-bab="' + esc(b.id) + '">' +
            '<span class="li-ico">' + (done ? ikon("i-check") : (i + 1)) + '</span>' +
            '<span class="li-body"><b>' + esc(b.judul) + '</b><small>' + esc(b.ringkas || "") + '</small></span>' +
            '<span class="li-end">' + (b.soal ? b.soal.length + " soal" : "") + (done ? ' <span class="chip green">Selesai</span>' : "") + ' ' + ikon("i-arrow") + '</span></button>';
        }).join("") + '</div>';
    }

    const b = (m.bab || []).find(x => x.id === R.babId);
    if (!b) { R.babId = null; return tabMateri(); }
    const pr = progresRuang();
    const done = pr.bab.indexOf(b.id) > -1;
    return '<button class="btn btn-ghost btn-sm" id="babKembali">' + ikon("i-arrow") + ' Daftar bab ' + esc(m.nama) + '</button>' +
      '<article class="material" style="margin-top:16px">' +
      '<div class="m-meta"><span class="chip brand">' + esc(m.nama) + '</span><span class="chip">' + esc(JENJANG[R.code].label) + '</span>' +
      (b.soal ? '<span class="chip cyan">' + b.soal.length + ' latihan tersedia</span>' : '') +
      (done ? '<span class="chip green">' + ikon("i-check") + ' Selesai dipelajari</span>' : '') + '</div>' +
      '<h2>' + esc(b.judul) + '</h2>' +
      '<div class="m-body">' + (b.materi || "<p>Materi bab ini sedang disiapkan tim Kuradapt.</p>") + '</div>' +
      '<div class="m-foot">' +
      '<button class="btn ' + (done ? "btn-ghost" : "btn-primary") + '" id="babSelesai">' + ikon(done ? "i-refresh" : "i-check") + (done ? ' Batalkan penanda' : ' Tandai selesai') + '</button>' +
      (b.soal ? '<button class="btn btn-soft" id="babLatihan">' + ikon("i-bolt") + ' Latihan bab ini (' + b.soal.length + ' soal)</button>' : '') +
      '</div></article>';
  }

  function pascaMateri() {
    document.querySelectorAll("[data-mapel]").forEach(el => el.onclick = () => { R.mapelId = el.dataset.mapel; R.babId = null; renderTab(); });
    document.querySelectorAll("[data-bab]").forEach(el => el.onclick = () => { R.babId = el.dataset.bab; renderTab(); });
    const mk = document.getElementById("matKembali"); if (mk) mk.onclick = () => { R.mapelId = null; renderTab(); };
    const bk = document.getElementById("babKembali"); if (bk) bk.onclick = () => { R.babId = null; renderTab(); };
    const bs = document.getElementById("babSelesai");
    if (bs) bs.onclick = () => {
      const rec = progres();
      const arr = rec.bab;
      const i = arr.indexOf(R.babId);
      if (i > -1) { arr.splice(i, 1); toast(ikon("i-refresh") + " Penanda dibatalkan"); }
      else { arr.push(R.babId); toast(ikon("i-check") + " Bab ditandai <b>selesai</b>!"); }
      simpanProgres(rec);
      renderRuang();
    };
    const bl = document.getElementById("babLatihan");
    if (bl) bl.onclick = () => { R.tab = "latihan"; R.quizPilihMapel = R.mapelId; mulaiQuiz(R.code, R.mapelId, R.babId); };
    const bt = document.getElementById("babTambah");
    if (bt) bt.onclick = () => {
      const judul = (document.getElementById("babJudul").value || "").trim();
      const ringkas = (document.getElementById("babRingkas").value || "").trim();
      const isi = (document.getElementById("babIsi").value || "").trim();
      if (judul.length < 3) { toast(ikon("i-warn") + " Judul bab minimal 3 karakter", "no"); return; }
      if (isi.length < 10) { toast(ikon("i-warn") + " Isi materi minimal 10 karakter", "no"); return; }
      tambahBabMapelx(R.code, R.mapelId, { judul: judul, ringkas: ringkas, materi: isi });
      siarkan();
      toast(ikon("i-check") + " Bab <b>" + esc(judul) + "</b> tersimpan");
      renderTab();
    };
  }

  /* ---------------- Paket soal input guru/dosen ---------------- */
  function semuaPaket(code) { return lsGet(K.soal, {})[code] || []; }
  function cariPaket(code, id) { return semuaPaket(code).find(p => p.id === id) || null; }
  function simpanPaketBaru(code, p) {
    const semua = lsGet(K.soal, {});
    if (!semua[code]) semua[code] = [];
    semua[code].push(p); lsSet(K.soal, semua);
    catatLog("soal", "Paket soal dibuat: " + (p.judul || "-") + " (" + code + ", " + (p.soal ? p.soal.length : 0) + " soal)");
    kirimNotif({
      tipe: "soal", judul: "Soal baru: " + (p.judul || "Tanpa judul"),
      pesan: (sesi() ? sesi().nama : "Tenaga pendidik") + " mengirim paket soal (" +
        (p.soal ? p.soal.length : 0) + " soal) untuk ruang " + (JENJANG[code] ? JENJANG[code].nama : code) + ".",
      ke: "*", jenjang: [code], rujuk: "#/r/" + code
    });
  }
  function hapusPaket(code, id) {
    const semua = lsGet(K.soal, {});
    semua[code] = (semua[code] || []).filter(p => p.id !== id);
    lsSet(K.soal, semua);
    catatLog("soal", "Paket soal dihapus: " + id + " (" + code + ")");
  }

  /* ---------------- Latihan / Kuis ---------------- */
  function tabLatihan() {
    if (R.quiz) return renderQuiz();
    const mapel = semuaMapel(R.code);

    if (!R.quizPilihMapel) {
      const s = sesi();
      const boleh = bisaTulis(s, R.code);
      const paket = semuaPaket(R.code);
      const d = R.draftSoal || { judul: "", mapelId: mapel.length ? mapel[0].id : "", soal: [] };
      const nDraf = d.soal.length;

      const compose = boleh ?
        '<div class="compose"><h3>' + ikon("i-question") + ' Buat Soal — input langsung dari ' + esc(PERAN[s.peran] ? PERAN[s.peran].nama : s.peran) + ' ruang ini</h3>' +
        '<div class="row">' +
        '<div class="field"><label for="pkJudul">Judul paket soal</label><span class="inp-wrap">' + ikon("i-flag") +
        '<input id="pkJudul" value="' + esc(d.judul) + '" placeholder="Contoh: PTS Ganjil Matematika"></span></div>' +
        '<div class="field"><label for="pkMapel">Mata pelajaran</label><span class="inp-wrap">' + ikon("i-books") +
        '<select id="pkMapel">' + mapel.map(m => '<option value="' + esc(m.id) + '"' + (m.id === d.mapelId ? " selected" : "") + '>' + esc(m.nama) + '</option>').join("") + '</select></span></div>' +
        '</div>' +
        '<div class="field"><label for="pkSoal">Pertanyaan</label><textarea id="pkSoal" placeholder="Tulis pertanyaan pilihan ganda..."></textarea></div>' +
        '<div class="row">' +
        '<div class="field"><label for="pkO1">Opsi A</label><span class="inp-wrap">' + ikon("i-pen") + '<input id="pkO1" placeholder="Pilihan A"></span></div>' +
        '<div class="field"><label for="pkO2">Opsi B</label><span class="inp-wrap">' + ikon("i-pen") + '<input id="pkO2" placeholder="Pilihan B"></span></div>' +
        '<div class="field"><label for="pkO3">Opsi C</label><span class="inp-wrap">' + ikon("i-pen") + '<input id="pkO3" placeholder="Pilihan C"></span></div>' +
        '<div class="field"><label for="pkO4">Opsi D</label><span class="inp-wrap">' + ikon("i-pen") + '<input id="pkO4" placeholder="Pilihan D"></span></div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="field"><label for="pkKunci">Kunci jawaban</label><span class="inp-wrap">' + ikon("i-target") +
        '<select id="pkKunci"><option>A</option><option>B</option><option>C</option><option>D</option></select></span></div>' +
        '<div class="field"><label for="pkBahas">Pembahasan (opsional)</label><span class="inp-wrap">' + ikon("i-scroll") +
        '<input id="pkBahas" placeholder="Penjelasan jawaban benar"></span></div>' +
        '</div>' +
        '<div class="q-nav" style="max-width:none;justify-content:flex-start">' +
        '<button class="btn btn-primary" id="pkTambah">' + ikon("i-plus") + ' Tambahkan ke Draf (' + nDraf + ')</button>' +
        (nDraf ? '<button class="btn btn-soft" id="pkTerbit">' + ikon("i-check") + ' Terbitkan Paket (' + nDraf + ' soal)</button>' +
          '<button class="btn btn-ghost" id="pkBuang">' + ikon("i-trash") + ' Buang Draf</button>' : '') +
        '</div>' +
        (nDraf ? '<div class="stack" style="margin-top:12px" id="drafList">' + d.soal.map((x, i) =>
          '<div class="list-item" style="cursor:default"><span class="li-ico">' + (i + 1) + '</span>' +
          '<span class="li-body"><b>' + esc(x.q) + '</b><small>kunci: ' + "ABCD".charAt(x.a) + ' · ' + x.o.filter(v => v).length + ' opsi terisi</small></span>' +
          '<span class="li-end"><span class="chip green">draf</span></span></div>').join("") + '</div>' : '') +
        '</div>'
        : '';

      const blokPaket =
        '<div class="sec-head" style="margin:' + (boleh ? '6px' : '0') + ' 0 14px"><span class="sec-tag">' + ikon("i-question") + ' Pengajar</span>' +
        '<h2 style="font-size:1.3rem">Paket Soal Guru/Dosen (' + paket.length + ')</h2>' +
        '<p>Soal yang diinput langsung oleh pengajar ruang ini — kerjakan, nilainya langsung masuk transkrip.</p></div>' +
        '<div class="stack">' +
        (paket.length ? paket.map(p => {
          const mm = cariMapel(R.code, p.mapelId);
          return '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon("i-question") + '</span>' +
            '<span class="li-body"><b>' + esc(p.judul) + '</b><small>' + (p.soal || []).length + ' soal · ' + esc(mm ? mm.nama : "—") +
            ' · ' + esc(p.pengajar) + ' · ' + relatif(p.tgl) + '</small></span>' +
            '<span class="li-end"><button class="btn btn-sm btn-primary" data-paket="' + esc(p.id) + '">' + ikon("i-bolt") + ' Kerjakan</button>' +
            (boleh ? '<button class="btn btn-sm btn-danger" data-hapus-paket="' + esc(p.id) + '">' + ikon("i-trash") + '</button>' : '') +
            '</span></div>';
        }).join("") : '<div class="empty"><span class="e-ico">' + ikon("i-question") + '</span><b>Belum ada paket soal pengajar</b><span>' +
          (boleh ? 'Buat soal pertama lewat formulir di atas.' : 'Pengajar akan menginput soal khusus ruang ini.') + '</span></div>') +
        '</div>';

      return '<div class="sec-head" style="margin-bottom:16px"><span class="sec-tag">' + ikon("i-bolt") + ' Latihan Adaptif</span>' +
        '<h2 style="font-size:1.4rem">Pilih Mata Pelajaran</h2>' +
        '<p>' + totalSoal(R.code) + ' soal pilihan ganda dengan pembahasan. Salah jawab? Remedial adaptif menyusul otomatis.</p></div>' +
        compose + blokPaket +
        '<div class="sec-head" style="margin:24px 0 14px"><span class="sec-tag">' + ikon("i-bolt") + ' Bank Soal</span>' +
        '<h2 style="font-size:1.3rem">Latihan per Mata Pelajaran</h2></div>' +
        '<div class="stack">' + mapel.map(m => {
          const soal = (m.bab || []).reduce((a, b) => a + (b.soal ? b.soal.length : 0), 0);
          const pr = progresRuang().latihan[m.id] || null;
          return '<button class="list-item" data-lat="' + esc(m.id) + '">' +
            '<span class="li-ico">' + ikon(m.ikon || "i-bolt") + '</span>' +
            '<span class="li-body"><b>' + esc(m.nama) + '</b><small>' + soal + ' soal · ' + (m.bab ? m.bab.length : 0) + ' bab' +
            (pr ? ' · terbaik <b>' + pr.terbaik + '</b>' : '') + '</small></span>' +
            '<span class="li-end">' + (pr ? '<span class="chip green">' + pr.coba + '×</span>' : '<span class="chip">Mulai</span>') + ' ' + ikon("i-arrow") + '</span></button>';
        }).join("") + '</div>';
    }

    const m = cariMapel(R.code, R.quizPilihMapel);
    if (!m) { R.quizPilihMapel = null; return tabLatihan(); }
    return '<button class="btn btn-ghost btn-sm" id="latKembali">' + ikon("i-arrow") + ' Semua mapel</button>' +
      '<div class="sec-head" style="margin:16px 0"><span class="sec-tag">' + ikon("i-bolt") + ' ' + esc(m.nama) + '</span>' +
      '<h2 style="font-size:1.4rem">Pilih Cakupan Latihan</h2></div>' +
      '<div class="stack">' +
      '<button class="list-item" data-mulai="semua"><span class="li-ico">' + ikon("i-shuffle") + '</span>' +
      '<span class="li-body"><b>Acak seluruh bab</b><small>' + (m.bab || []).reduce((a, b) => a + (b.soal ? b.soal.length : 0), 0) + ' soal campuran</small></span>' +
      '<span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      (m.bab || []).map(b => '<button class="list-item" data-mulai="' + esc(b.id) + '"><span class="li-ico">' + ikon("i-file") + '</span>' +
        '<span class="li-body"><b>' + esc(b.judul) + '</b><small>' + (b.soal ? b.soal.length : 0) + ' soal</small></span>' +
        '<span class="li-end">' + ikon("i-arrow") + '</span></button>').join("") +
      '</div>';
  }

  function mulaiQuiz(code, mapelId, babId) {
    const m = cariMapel(code, mapelId);
    if (!m) return;
    let soal = [], label = "";
    if (babId && babId !== "semua") {
      const b = (m.bab || []).find(x => x.id === babId);
      if (b) { soal = (b.soal || []).slice(); label = b.judul; }
    } else {
      (m.bab || []).forEach(b => { soal = soal.concat(b.soal || []); });
      label = "Seluruh bab";
    }
    if (!soal.length) { toast(ikon("i-warn") + " Belum ada soal pada cakupan ini", "no"); return; }
    R.quiz = { mapelId, judul: m.nama, label, soal, idx: 0, jawab: [], benar: 0, selesai: false, mode: "utama", nilaiAwal: null, sumber: "bank" };
    renderTab();
  }

  function mulaiPaket(id) {
    const p = cariPaket(R.code, id);
    if (!p || !p.soal || !p.soal.length) { toast(ikon("i-warn") + " Paket soal tidak ditemukan", "no"); return; }
    const mm = cariMapel(R.code, p.mapelId);
    R.quiz = {
      mapelId: p.mapelId, judul: mm ? mm.nama : p.judul,
      label: p.judul + " · soal input " + p.pengajar,
      soal: p.soal.slice(), idx: 0, jawab: [], benar: 0, selesai: false,
      mode: "utama", nilaiAwal: null, sumber: "paket", paketId: p.id
    };
    renderTab();
  }

  function renderQuiz() {
    const q = R.quiz;
    if (!q) return "";
    if (q.selesai) return renderHasilQuiz(q);

    const i = q.idx, s = q.soal[i], sudah = q.jawab[i] != null;
    const dipilih = q.jawab[i];
    const benar = sudah && dipilih === s.a;
    const huruf = ["A", "B", "C", "D", "E", "F"];
    const dots = q.soal.map((x, k) => '<span class="' + (k === i ? "now" : (q.jawab[k] == null ? "" : (q.jawab[k] === q.soal[k].a ? "ok" : "no"))) + '"></span>').join("");
    const pct = Math.round(((i + (sudah ? 1 : 0)) / q.soal.length) * 100);

    return '<div class="quiz-wrap"><div class="quiz-top">' +
      '<span class="chip brand">' + ikon("i-bolt") + ' ' + esc(q.judul) + (q.mode === "remedial" ? ' · Mode Remedial' : '') + '</span>' +
      '<span class="q-dots" id="qDots">' + dots + '</span>' +
      '<span class="q-progress"><i style="width:' + pct + '%"></i></span></div>' +

      '<div class="q-card" id="qCard">' +
      '<div class="q-src"><span class="chip">Soal ' + (i + 1) + ' dari ' + q.soal.length + '</span>' +
      '<span class="chip">' + esc(q.label) + '</span>' +
      (s.tp ? '<span class="chip violet">Rujukan: ' + esc(s.tp.length > 40 ? s.tp.slice(0, 40) + "…" : s.tp) + '</span>' : '') + '</div>' +
      '<h3>' + esc(s.q) + '</h3>' +
      '<div class="q-opts">' + (s.o || []).map((o, k) => {
        let cls = "q-opt";
        if (sudah) {
          if (k === s.a) cls += " benar";
          else if (k === dipilih) cls += " salah";
        } else if (k === dipilih) cls += " pilih";
        return '<button class="' + cls + '" data-jwb="' + k + '"' + (sudah ? " disabled" : "") + '>' +
          '<span class="k">' + huruf[k] + '</span><span>' + esc(o) + '</span></button>';
      }).join("") + '</div>' +
      '<div class="q-feedback ' + (sudah ? (benar ? "ok show" : "no show") : "") + '" id="qFeed">' +
      '<b>' + (sudah ? (benar ? "✔ Benar! +1 poin" : "✘ Belum tepat") : '') + '</b>' +
      (sudah ? '<span>Pembahasan: ' + esc(s.bahas || s.alasan || "—") + '</span>' : '') + '</div>' +
      '<div class="q-nav"><span></span>' +
      (sudah ? '<button class="btn btn-primary" id="qNext">' + (i + 1 >= q.soal.length ? "Lihat Hasil " : "Soal Berikutnya ") + ikon("i-arrow") + '</button>' : '') +
      '</div></div>' +
      '<div class="q-nav" style="justify-content:space-between"><button class="btn btn-ghost btn-sm" id="qKeluar">Keluar latihan</button>' +
      '<span class="chip">' + q.benar + ' benar</span></div></div>';
  }

  function renderHasilQuiz(q) {
    const nilai = Math.round((q.benar / q.soal.length) * 100);
    const tuntas = nilai >= 75;
    const salahIdx = q.soal.map((s, i) => i).filter(i => q.jawab[i] !== q.soal[i].a);
    return '<div class="quiz-wrap"><div class="q-card q-result">' +
      '<div class="ring" style="--p:' + nilai + '"><b>' + nilai + '</b><small>Nilai</small></div>' +
      '<h3>' + (nilai >= 90 ? "Luar biasa! 🎉" : nilai >= 75 ? "Tuntas, pertahankan! 💪" : "Jangan menyerah, ada remedial!") + '</h3>' +
      '<p>Latihan <b>' + esc(q.judul) + '</b> — ' + esc(q.label) + '</p>' +
      '<div class="r-meta"><span class="chip green">' + q.benar + ' benar</span>' +
      '<span class="chip red">' + salahIdx.length + ' salah</span>' +
      '<span class="chip ' + (tuntas ? "brand" : "amber") + '">' + (tuntas ? "Tuntas (≥75)" : "Belum tuntas") + '</span></div>' +
      '<div class="q-nav" style="justify-content:center">' +
      (salahIdx.length ? '<button class="btn btn-primary" id="qRemedial">' + ikon("i-repeat") + ' Remedial Adaptif (' + salahIdx.length + ' soal)</button>' : '') +
      '<button class="btn btn-soft" id="qUlang">' + ikon("i-refresh") + ' Ulangi</button>' +
      '<button class="btn btn-ghost" id="qSelesai">' + ikon("i-check") + ' Selesai</button></div>' +
      '</div></div>';
  }

  function simpanNilaiQuiz() {
    const q = R.quiz;
    if (!q) return;
    const nilai = Math.round((q.benar / q.soal.length) * 100);
    const rec = progres();
    const cur = rec.latihan[q.mapelId] || { terbaik: 0, coba: 0, terakhir: 0 };
    cur.terbaik = Math.max(cur.terbaik, nilai);
    cur.coba = cur.coba + 1;
    cur.terakhir = nilai;
    cur.tgl = new Date().toISOString();
    rec.latihan[q.mapelId] = cur;
    simpanProgres(rec);
  }

  function pascaLatihan() {
    document.querySelectorAll("[data-lat]").forEach(el => el.onclick = () => { R.quizPilihMapel = el.dataset.lat; renderTab(); });
    const lk = document.getElementById("latKembali");
    if (lk) lk.onclick = () => { R.quizPilihMapel = null; R.quiz = null; renderTab(); };
    document.querySelectorAll("[data-mulai]").forEach(el => el.onclick = () => mulaiQuiz(R.code, R.quizPilihMapel, el.dataset.mulai));

    /* paket soal input pengajar */
    document.querySelectorAll("[data-paket]").forEach(el => el.onclick = () => mulaiPaket(el.dataset.paket));
    document.querySelectorAll("[data-hapus-paket]").forEach(el => el.onclick = () => {
      const p = cariPaket(R.code, el.dataset.hapusPaket);
      if (!p) return;
      bukaModal(mHead("i-warn", "Hapus paket soal?") +
        '<div class="modal-body"><p>Paket <b>' + esc(p.judul) + '</b> (' + p.soal.length + ' soal) akan dihapus dari ruang ini.</p>' +
        '<div class="wiz-foot"><button class="btn btn-ghost" data-tutup>Batal</button><button class="btn btn-danger" id="okHapusPaket">Hapus</button></div></div>');
      document.getElementById("okHapusPaket").onclick = () => {
        hapusPaket(R.code, p.id);
        tutupModal(); siarkan();
        toast(ikon("i-trash") + " Paket soal dihapus");
        renderTab();
      };
    });

    /* draf pembuatan soal (tenaga pendidik) */
    const pkTambah = document.getElementById("pkTambah");
    if (pkTambah) pkTambah.onclick = () => {
      const judul = (document.getElementById("pkJudul").value || "").trim();
      const mapelId = document.getElementById("pkMapel").value;
      const tanya = (document.getElementById("pkSoal").value || "").trim();
      const o = [1, 2, 3, 4].map(i => (document.getElementById("pkO" + i).value || "").trim());
      const kunci = document.getElementById("pkKunci").value;
      const bahas = (document.getElementById("pkBahas").value || "").trim();
      if (judul.length < 3) { toast(ikon("i-warn") + " Judul paket minimal 3 karakter", "no"); return; }
      if (tanya.length < 3) { toast(ikon("i-warn") + " Pertanyaan belum diisi", "no"); return; }
      if (o.filter(v => v).length < 2) { toast(ikon("i-warn") + " Minimal 2 opsi jawaban terisi", "no"); return; }
      if (!R.draftSoal) R.draftSoal = { judul: judul, mapelId: mapelId, soal: [] };
      R.draftSoal.judul = judul; R.draftSoal.mapelId = mapelId;
      R.draftSoal.soal.push({ q: tanya, o: o, a: "ABCD".indexOf(kunci), bahas: bahas || "—" });
      toast(ikon("i-check") + " Soal masuk draf (" + R.draftSoal.soal.length + ") — lengkapi lalu terbitkan");
      renderTab();
    };
    const pkTerbit = document.getElementById("pkTerbit");
    if (pkTerbit) pkTerbit.onclick = () => {
      const draf = R.draftSoal;
      if (!draf || !draf.soal.length) return;
      const s = sesi();
      simpanPaketBaru(R.code, {
        id: uid("pk"), judul: draf.judul, mapelId: draf.mapelId, soal: draf.soal,
        pengajar: s.nama, peran: s.peran, jenjang: R.code, tgl: new Date().toISOString()
      });
      R.draftSoal = null; siarkan();
      toast(ikon("i-check") + " Paket soal <b>terbit</b> — peserta bisa langsung mengerjakan");
      renderTab();
    };
    const pkBuang = document.getElementById("pkBuang");
    if (pkBuang) pkBuang.onclick = () => { R.draftSoal = null; toast(ikon("i-trash") + " Draf soal dibuang"); renderTab(); };

    const q = R.quiz;
    if (!q) return;
    document.querySelectorAll("[data-jwb]").forEach(b => b.onclick = () => {
      if (q.jawab[q.idx] != null) return;
      q.jawab[q.idx] = Number(b.dataset.jwb);
      if (q.jawab[q.idx] === q.soal[q.idx].a) q.benar++;
      renderTab();
    });
    const nx = document.getElementById("qNext");
    if (nx) nx.onclick = () => {
      if (q.idx + 1 >= q.soal.length) { q.selesai = true; simpanNilaiQuiz(); }
      else q.idx++;
      renderTab();
    };
    const kl = document.getElementById("qKeluar");
    if (kl) kl.onclick = () => { if (!q.selesai && q.jawab.some(x => x != null)) simpanNilaiQuiz(); R.quiz = null; renderTab(); };

    const ul = document.getElementById("qUlang");
    if (ul) ul.onclick = () => {
      if (q.sumber === "paket" && q.paketId) mulaiPaket(q.paketId);
      else mulaiQuiz(R.code, q.mapelId, "semua");
    };
    const sm = document.getElementById("qSelesai");
    if (sm) sm.onclick = () => { R.quiz = null; R.quizPilihMapel = null; renderTab(); toast(ikon("i-check") + " Nilai tersimpan ke transkrip"); };

    const rm = document.getElementById("qRemedial");
    if (rm) rm.onclick = () => {
      const salah = q.soal.filter((s, i) => q.jawab[i] !== s.a);
      const nilaiSebelum = Math.round((q.benar / q.soal.length) * 100);
      R.quiz = {
        mapelId: q.mapelId, judul: q.judul, label: "Remedial: soal yang salah", soal: salah,
        idx: 0, jawab: [], benar: 0, selesai: false, mode: "remedial", nilaiAwal: nilaiSebelum
      };
      toast(ikon("i-repeat") + " Mode <b>remedial adaptif</b> — hanya soal yang salah");
      renderTab();
    };
  }

  /* ---------------- Transkrip nilai ----------------
     ATURAN INTI: SEMUA nilai dimulai dari NOL / kosong.
     Tugas/UH/UAS hanya terisi bila guru/dosen/industri/admin/operator
     menginput nilai; nilai latihan terisi setelah peserta mengerjakan soal.
     Belum ada pengerjaan & belum ada input → akhir 0, predikat "—",
     status "Belum dikerjakan". */
  function semuaNilai() { return lsGet(K.nilai, {}); }
  function ambilNilaiGuru(code, email, mapelId) {
    const store = semuaNilai();
    return store[code] && store[code][email] ? (store[code][email][mapelId] || null) : null;
  }
  function nilaiPengguna(code, email, m) {
    const h = hashStr(m.id + "|" + code);
    const g = ambilNilaiGuru(code, email, m.id);
    const tugas = g && g.tugas != null ? g.tugas : 0;
    const uh = g && g.uh != null ? g.uh : 0;
    const uas = g && g.uas != null ? g.uas : 0;
    const dasar = Math.round(tugas * .3 + uh * .3 + uas * .4);
    const pr = progresUser(code, email).latihan[m.id];
    const latihan = pr ? pr.terbaik : null;
    /* nilai akhir = rata-rata hanya di antara komponen yang benar-benar ada */
    const bagian = [];
    if (g) bagian.push(dasar);
    if (latihan != null) bagian.push(latihan);
    const ada = bagian.length > 0;
    const akhir = ada ? Math.round(bagian.reduce((a, b) => a + b, 0) / bagian.length) : 0;
    const predikat = !ada ? "—" : akhir >= 90 ? "A" : akhir >= 80 ? "B" : akhir >= 70 ? "C" : akhir >= 60 ? "D" : "E";
    const sks = 2 + (h % 3);
    const bobot = !ada ? 0 : akhir >= 90 ? 4 : akhir >= 80 ? 3 : akhir >= 70 ? 2 : akhir >= 60 ? 1 : 0;
    const kode = (m._src === "kuliah" ? "KUL" : (m._src || code).toUpperCase()) + "-" + String(h % 900 + 100);
    const tuntas = ada && akhir >= 75;
    const status = !ada ? "Belum dikerjakan" : (tuntas ? "Tuntas" : "Remedial");
    return { tugas, uh, uas, dasar, latihan, akhir, predikat, sks, bobot, kode, tuntas, status, ada, oleh: g ? g.oleh : null, m };
  }
  function nilaiMapel(code, m) { return nilaiPengguna(code, emailSaya(), m); }
  function simpanNilaiInput(code, email, mapelId, v) {
    const clamp = x => Math.max(0, Math.min(100, Math.round(Number(x) || 0)));
    const store = semuaNilai();
    if (!store[code]) store[code] = {};
    if (!store[code][email]) store[code][email] = {};
    store[code][email][mapelId] = {
      tugas: clamp(v.tugas), uh: clamp(v.uh), uas: clamp(v.uas),
      tgl: new Date().toISOString(), oleh: sesi() ? sesi().nama : "-"
    };
    lsSet(K.nilai, store);
    catatLog("nilai", "Nilai diinput untuk " + email + " · " + mapelId + " (" + code + ")");
    if (Number(v.tugas) + Number(v.uh) + Number(v.uas) > 0) kirimNotif({
      tipe: "nilai", judul: "Nilai baru diinput",
      pesan: (sesi() ? sesi().nama : "Tenaga pendidik") + " memasukkan nilai " + mapelId +
        " untuk Anda (Tugas " + clamp(v.tugas) + " · UH " + clamp(v.uh) + " · UAS " + clamp(v.uas) + ").",
      ke: email, rujuk: "#/r/" + code
    });
  }
  function kosongkanNilaiInput(code, email, mapelId) {
    const store = semuaNilai();
    if (store[code] && store[code][email]) delete store[code][email][mapelId];
    lsSet(K.nilai, store);
    catatLog("nilai", "Nilai dikosongkan untuk " + email + " · " + mapelId + " (" + code + ")");
  }

  function tabTranskrip() {
    const s = sesi();
    const mapel = semuaMapel(R.code);
    const rows = mapel.map(m => nilaiMapel(R.code, m));
    const kuliah = R.code === "tinggi";
    const terisi = rows.filter(r => r.ada);
    const rata = terisi.length ? Math.round(terisi.reduce((a, r) => a + r.akhir, 0) / terisi.length) : 0;
    const tuntas = rows.filter(r => r.tuntas).length;
    const ipk = rows.length ? (rows.reduce((a, r) => a + r.bobot * r.sks, 0) / rows.reduce((a, r) => a + r.sks, 0)).toFixed(2) : "0.00";
    const totalSks = rows.reduce((a, r) => a + r.sks, 0);

    const kepala = kuliah ?
      '<th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Tugas</th><th>UTS</th><th>UAS</th><th>Latihan</th><th>Akhir</th><th>Bobot</th><th>Huruf</th>'
      : '<th>#</th><th>Mata Pelajaran</th><th>Tugas</th><th>UH</th><th>UAS</th><th>Latihan</th><th>Akhir</th><th>Predikat</th><th>Status</th>';

    const isi = rows.map((r, i) => kuliah ?
      '<tr><td>' + esc(r.kode) + '</td><td><b>' + esc(r.m.nama) + '</b></td><td class="num">' + r.sks + '</td>' +
      '<td class="num">' + r.tugas + '</td><td class="num">' + r.uh + '</td><td class="num">' + r.uas + '</td>' +
      '<td class="num">' + (r.latihan == null ? "—" : r.latihan) + '</td>' +
      '<td class="num">' + r.akhir + '</td><td class="num">' + r.bobot.toFixed(1) + '</td>' +
      '<td><span class="predikat ' + (r.ada ? r.predikat : "kosong") + '">' + r.predikat + '</span></td></tr>'
      :
      '<tr><td class="num">' + (i + 1) + '</td><td><b>' + esc(r.m.nama) + '</b>' +
      (r.m._srcLabel ? ' <span class="chip" style="font-size:.6rem">' + esc(r.m._srcLabel) + '</span>' : '') + '</td>' +
      '<td class="num">' + r.tugas + '</td><td class="num">' + r.uh + '</td><td class="num">' + r.uas + '</td>' +
      '<td class="num">' + (r.latihan == null ? "—" : r.latihan) + '</td>' +
      '<td class="num">' + r.akhir + '</td>' +
      '<td><span class="predikat ' + (r.ada ? r.predikat : "kosong") + '">' + r.predikat + '</span></td>' +
      '<td><span class="status-t ' + (r.ada ? (r.tuntas ? "tuntas" : "remed") : "kosong") + '">' +
      (r.ada ? (r.tuntas ? "✔ Tuntas" : "✘ Remedial") : "• Belum dikerjakan") + '</span></td></tr>').join("");

    return '<div class="trans-head"><div class="trans-id">' +
      '<span class="t-av">' + esc((s.nama || "K").split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase()) + '</span>' +
      '<span><h2>Transkrip Nilai — ' + esc(JENJANG[R.code].nama) + '</h2>' +
      '<p>' + esc(s.nama) + ' · ' + esc(peranLabel(s)) + ' · Kuradapt ' + esc(JENJANG[R.code].label) + ' · Terbit ' + tglIndo(new Date()) + '</p></span></div>' +
      '<div class="trans-sum">' +
      '<span class="ts"><b>' + (rata || "—") + '</b><span>Rata-rata</span></span>' +
      '<span class="ts"><b>' + tuntas + '/' + rows.length + '</b><span>Tuntas (KKM 75)</span></span>' +
      '<span class="ts"><b>' + terisi.length + '/' + rows.length + '</b><span>Sudah Dinilai</span></span>' +
      (kuliah ? '<span class="ts"><b>' + ipk + '</b><span>IPK (4.00)</span></span><span class="ts"><b>' + totalSks + '</b><span>Total SKS</span></span>' : '') +
      '</div></div>' +
      '<div class="table-wrap" style="margin-bottom:16px"><table class="trans" id="tabelTrans"><thead><tr>' + kepala + '</tr></thead>' +
      '<tbody>' + isi + '</tbody></table></div>' +
      '<div class="q-nav" style="max-width:none"><button class="btn btn-primary" id="expTrans">' + ikon("i-download") + ' Ekspor CSV</button>' +
      '<button class="btn btn-ghost" id="cetakTrans">' + ikon("i-print") + ' Cetak / PDF</button>' +
      '<span class="chip">' + ikon("i-shield") + ' Komponen: Tugas 30% · UH 30% · UAS 40%</span>' +
      '<span class="chip brand">' + ikon("i-refresh") + ' Nilai 0 = belum dikerjakan / belum diinput pengajar</span></div>';
  }

  function pascaTranskrip() {
    const ek = document.getElementById("expTrans");
    if (ek) ek.onclick = () => {
      const rows = semuaMapel(R.code).map(m => nilaiMapel(R.code, m));
      const kuliah = R.code === "tinggi";
      const kepala = kuliah ? ["Kode", "Mata Kuliah", "SKS", "Tugas", "UTS", "UAS", "Latihan", "Akhir", "Bobot", "Huruf"]
        : ["No", "Mata Pelajaran", "Tugas", "UH", "UAS", "Latihan", "Akhir", "Predikat", "Status"];
      const baris = rows.map((r, i) => kuliah ? [r.kode, r.m.nama, r.sks, r.tugas, r.uh, r.uas, r.latihan == null ? "-" : r.latihan, r.akhir, r.bobot.toFixed(1), r.predikat]
        : [i + 1, r.m.nama, r.tugas, r.uh, r.uas, r.latihan == null ? "-" : r.latihan, r.akhir, r.predikat, r.status]);
      const csv = [kepala].concat(baris).map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(";")).join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url; a.download = "transkrip-kuradapt.csv";
      document.body.appendChild(a); a.click(); a.remove();
      toast(ikon("i-download") + " File <b>transkrip-kuradapt.csv</b> diunduh");
    };
    const ck = document.getElementById("cetakTrans");
    if (ck) ck.onclick = () => {
      const box = document.getElementById("printArea") || (() => { const d = document.createElement("div"); d.id = "printArea"; document.body.appendChild(d); return d; })();
      box.innerHTML = "<b>Transkrip Nilai " + JENJANG[R.code].nama + " — " + esc(sesi().nama) + "</b>";
      window.print();
    };
  }

  /* ---------------- Dokumen ---------------- */
  function dokMeta() { return lsGet(K.dok, []); }
  function dbDok() {
    return new Promise((res, rej) => {
      if (!window.indexedDB) return rej(new Error("no-idb"));
      const r = window.indexedDB.open("kuradapt-dok", 1);
      r.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("isi")) db.createObjectStore("isi", { keyPath: "id" });
      };
      r.onsuccess = e => res(e.target.result);
      r.onerror = () => rej(new Error("idb-error"));
    });
  }
  function simpanDok(rec) {
    const oleh = rec.oleh || (sesi() ? sesi().nama : "-");
    rec.oleh = oleh;
    const meta = dokMeta().filter(x => x.id !== rec.id);
    meta.unshift({ id: rec.id, nama: rec.nama, ukuran: rec.ukuran, tipe: rec.tipe, tgl: rec.tgl || new Date().toISOString(), oleh: oleh });
    lsSet(K.dok, meta.slice(0, 200));
    if (rec.ruang) kirimNotif({
      tipe: "dokumen", judul: "Dokumen baru: " + rec.nama,
      pesan: oleh + " mengunggah berkas ke ruang " + (JENJANG[rec.ruang] ? JENJANG[rec.ruang].nama : rec.ruang) + " — siap diunduh.",
      ke: "*", jenjang: [rec.ruang], rujuk: "#/r/" + rec.ruang
    });
    return dbDok().then(db => new Promise((res, rej) => {
      const tx = db.transaction("isi", "readwrite");
      tx.objectStore("isi").put(rec);
      tx.oncomplete = () => res("idb");
      tx.onerror = () => rej(new Error("idb-write"));
    })).catch(() => {
      const isi = lsGet("kuradapt_dokisi", {});
      isi[rec.id] = rec.data;
      lsSet("kuradapt_dokisi", isi);
      return "lokal";
    });
  }
  function ambilDok(id) {
    return dbDok().then(db => new Promise((res, rej) => {
      const tx = db.transaction("isi", "readonly");
      const rq = tx.objectStore("isi").get(id);
      rq.onsuccess = () => res(rq.result ? rq.result.data : null);
      rq.onerror = () => rej(new Error("idb-read"));
    })).catch(() => Promise.resolve(lsGet("kuradapt_dokisi", {})[id] || null));
  }
  function hapusDok(id) {
    lsSet(K.dok, dokMeta().filter(x => x.id !== id));
    dbDok().then(db => {
      const tx = db.transaction("isi", "readwrite");
      tx.objectStore("isi").delete(id);
    }).catch(() => {
      const isi = lsGet("kuradapt_dokisi", {});
      delete isi[id];
      lsSet("kuradapt_dokisi", isi);
    });
    const isi = lsGet("kuradapt_dokisi", {});
    if (isi[id]) { delete isi[id]; lsSet("kuradapt_dokisi", isi); }
  }
  function ukuranF(b) { if (b < 1024) return b + " B"; if (b < 1048576) return (b / 1024).toFixed(1) + " KB"; return (b / 1048576).toFixed(2) + " MB"; }
  function ikonDok(t) {
    if (/pdf/.test(t)) return "i-file";
    if (/image/.test(t)) return "i-eye";
    if (/zip|rar|compress/.test(t)) return "i-folder";
    if (/sheet|csv|excel/.test(t)) return "i-chart";
    return "i-file";
  }

  function tabDokumen() {
    const list = dokMeta();
    return '<div class="sec-head" style="margin-bottom:16px"><span class="sec-tag">' + ikon("i-folder") + ' Dokumen Digital</span>' +
      '<h2 style="font-size:1.4rem">Simpan & Unggah Berkas</h2>' +
      '<p>Tugas, jurnal praktikum, sertifikat, atau berkas penunjang — tersimpan aman di perangkat ini (IndexedDB) dan bisa diunduh kapan saja.</p></div>' +
      '<div class="up-zone" id="upZone" tabindex="0" role="button" aria-label="Unggah dokumen">' +
      '<div class="uz-ico">' + ikon("i-upload") + '</div>' +
      '<b>Klik untuk memilih berkas</b><span>atau seret file ke sini · gambar, PDF, dokumen, zip (maks 2 MB/file)</span>' +
      '<input type="file" id="upInput" multiple hidden></div>' +
      '<div class="stat-grid" style="margin-top:18px">' +
      '<div class="stat-card"><span class="lbl">Total Berkas</span><span class="val">' + list.length + '</span><span class="note">tersimpan di ruang ini</span></div>' +
      '<div class="stat-card"><span class="lbl">Total Ukuran</span><span class="val">' + ukuranF(list.reduce((a, x) => a + (x.ukuran || 0), 0)) + '</span><span class="note">memori perangkat</span></div>' +
      '</div>' +
      '<div class="stack" style="margin-top:16px" id="docList">' +
      (list.length ? list.map(dokItem).join("") :
        '<div class="empty"><span class="e-ico">' + ikon("i-folder") + '</span><b>Belum ada dokumen</b><span>Unggah berkas pertama Anda di atas.</span></div>') +
      '</div>';
  }

  function dokItem(d) {
    return '<div class="doc-item" data-dok="' + esc(d.id) + '">' +
      '<span class="d-ico">' + ikon(ikonDok(d.tipe || "")) + '</span>' +
      '<span class="d-body"><b>' + esc(d.nama) + '</b><small>' + ukuranF(d.ukuran || 0) + ' · ' + tglIndo(d.tgl) + '</small></span>' +
      '<span class="d-act"><button class="btn btn-sm btn-soft" data-unduh="' + esc(d.id) + '">' + ikon("i-download") + '</button>' +
      '<button class="btn btn-sm btn-danger" data-hapus="' + esc(d.id) + '">' + ikon("i-trash") + '</button></span></div>';
  }

  function pascaDokumen() {
    const zone = document.getElementById("upZone"), input = document.getElementById("upInput");
    if (zone && input) {
      zone.onclick = () => input.click();
      zone.ondragover = e => { e.preventDefault(); zone.classList.add("drag"); };
      zone.ondragleave = () => zone.classList.remove("drag");
      zone.ondrop = e => { e.preventDefault(); zone.classList.remove("drag"); tangkapFile(e.dataTransfer.files); };
      input.onchange = () => tangkapFile(input.files);
    }
    document.querySelectorAll("[data-unduh]").forEach(b => b.onclick = () => unduhDok(b.dataset.unduh));
    document.querySelectorAll("[data-hapus]").forEach(b => b.onclick = () => {
      hapusDok(b.dataset.hapus);
      toast(ikon("i-trash") + " Dokumen dihapus");
      renderTab();
    });
  }

  function tangkapFile(files) {
    const arr = Array.prototype.slice.call(files || []);
    if (!arr.length) return;
    let sisa = arr.length;
    arr.forEach(f => {
      if (f.size > 2 * 1048576) { toast(ikon("i-warn") + " <b>" + esc(f.name) + "</b> lebih dari 2 MB", "no"); sisa--; if (!sisa) renderTab(); return; }
      const fr = new FileReader();
      fr.onload = () => {
        simpanDok({ id: uid("dok"), nama: f.name, ukuran: f.size, tipe: f.type || "", tgl: new Date().toISOString(), data: fr.result, ruang: R.code })
          .then(() => { sisa--; if (!sisa) { toast(ikon("i-check") + " Dokumen tersimpan"); renderTab(); } });
      };
      fr.onerror = () => { sisa--; if (!sisa) renderTab(); };
      fr.readAsDataURL(f);
    });
  }

  function unduhDok(id) {
    const meta = dokMeta().find(x => x.id === id);
    ambilDok(id).then(data => {
      if (!data || !meta) { toast(ikon("i-warn") + " Isi berkas tidak ditemukan", "no"); return; }
      const a = document.createElement("a");
      a.href = data; a.download = meta.nama;
      document.body.appendChild(a); a.click(); a.remove();
      toast(ikon("i-download") + " Mengunduh <b>" + esc(meta.nama) + "</b>");
    });
  }

  /* ============================================================
     KEGIATAN BERSAMA (live) — tenaga pendidik memulai, peserta bergabung
     ============================================================ */
  const IKON_JENIS = { "Kelas Live": "i-play", "Diskusi": "i-users", "Bimbingan": "i-hand", "Ujian": "i-target", "Praktikum": "i-toolbox" };
  function kartuKegiatan(k, s) {
    const st = statusKegiatan(k);
    const nama = s ? s.nama : null;
    const sudah = nama && (k.peserta || []).indexOf(nama) > -1;
    const bolehKelola = bisaTulis(s, k.jenjang);
    return '<article class="kg-card ' + st[0] + '" data-kg="' + esc(k.id) + '">' +
      '<div class="kg-top"><span class="kg-status ' + st[0] + '">' +
      ikon(st[0] === "live" ? "i-signal" : st[0] === "akan" ? "i-clock" : "i-check") + st[1] + '</span>' +
      '<span class="chip">' + ikon(IKON_JENIS[k.jenis] || "i-calendar") + esc(k.jenis) + '</span></div>' +
      '<h3>' + esc(k.judul) + '</h3>' +
      '<div class="kg-meta">' +
      '<span>' + ikon("i-user") + esc(k.pembuat) + ' · ' + esc(PERAN[k.peran] ? PERAN[k.peran].nama : k.peran) + '</span>' +
      '<span>' + ikon("i-clock") + relatif(k.tgl) + ' · ' + (k.durasi || 60) + ' menit</span>' +
      '<span>' + ikon("i-users") + (k.peserta || []).length + ' peserta</span></div>' +
      ((k.peserta || []).length ? '<div class="kg-peserta">' +
        k.peserta.slice(0, 6).map(n => '<span class="chip">' + esc(n) + '</span>').join("") +
        (k.peserta.length > 6 ? '<span class="chip">+' + (k.peserta.length - 6) + '</span>' : '') + '</div>' : '') +
      ((k.hadir || []).length ? '<div class="kg-hadir"><span class="chip green">' + ikon("i-signal") +
        (k.hadir.length) + ' sedang di ruang live</span></div>' : '') +
      '<div class="kg-act">' +
      (st[0] !== "selesai" && s ? (sudah
        ? '<button class="btn btn-primary btn-sm" data-masuk-kg="' + esc(k.id) + '">' + ikon("i-signal") + ' Masuk Ruang</button>' +
        '<button class="btn btn-soft btn-sm" data-tinggal="' + esc(k.id) + '">' + ikon("i-x") + ' Tinggalkan</button>'
        : '<button class="btn btn-primary btn-sm" data-gabung="' + esc(k.id) + '">' + ikon("i-hand") + ' Gabung Kegiatan</button>') : '') +
      (bolehKelola ? '<button class="btn btn-ghost btn-sm" data-status-kg="' + esc(k.id) + '">' + ikon("i-refresh") + ' Ubah Status</button>' +
        '<button class="btn btn-danger btn-sm" data-hapus-kg="' + esc(k.id) + '">' + ikon("i-trash") + '</button>' : '') +
      '</div></article>';
  }

  function tabKegiatan() {
    const s = sesi();
    const boleh = bisaTulis(s, R.code);
    const urut = { live: 0, akan: 1, selesai: 2 };
    const list = kegiatanRuang(R.code).slice().sort((a, b) =>
      (urut[statusKegiatan(a)[0]] - urut[statusKegiatan(b)[0]]) || (new Date(b.tgl) - new Date(a.tgl)));

    const compose = boleh ?
      '<div class="compose"><h3>' + ikon("i-calendar") + ' Mulai Kegiatan Bersama di ' + esc(JENJANG[R.code].nama) + '</h3>' +
      '<div class="row"><div class="field"><label for="kgJudul">Judul kegiatan</label><span class="inp-wrap">' + ikon("i-flag") +
      '<input id="kgJudul" placeholder="Contoh: Kelas Live Matematika Wajib"></span></div>' +
      '<div class="field"><label for="kgJenis">Jenis</label><span class="inp-wrap">' + ikon("i-game") +
      '<select id="kgJenis">' + jenisKegiatan().map(j => '<option>' + j + '</option>').join("") + '</select></span></div></div>' +
      '<div class="row"><div class="field"><label for="kgDurasi">Durasi (menit)</label><span class="inp-wrap">' + ikon("i-clock") +
      '<input id="kgDurasi" type="number" min="5" max="300" value="60"></span></div>' +
      '<div class="field"><label for="kgJadwal">Waktu mulai</label><span class="inp-wrap">' + ikon("i-calendar") +
      '<input id="kgJadwal" type="datetime-local"></span></div></div>' +
      '<button class="btn btn-primary" id="kgBuat">' + ikon("i-play") + ' Mulai Kegiatan Sekarang</button> ' +
      '<span class="chip brand">' + ikon("i-refresh") + ' Peserta melihat & bergabung live</span></div>'
      :
      '<div class="form-note">' + ikon("i-users") + ' Kegiatan bersama dikelola oleh <b>tenaga pendidik</b> ruang ini. Tekan <b>Gabung Kegiatan</b> saat kegiatan dibuka untuk ikut serta bersama peserta lain.</div>';

    return compose +
      '<div class="sec-head" style="margin:22px 0 16px"><span class="sec-tag">' + ikon("i-calendar") + ' Bersama</span>' +
      '<h2 style="font-size:1.35rem">Kegiatan ' + esc(JENJANG[R.code].nama) + '</h2>' +
      '<p>' + list.length + ' kegiatan · ' + list.filter(k => statusKegiatan(k)[0] === "live").length + ' sedang berlangsung.</p></div>' +
      '<div class="kg-grid">' +
      (list.length ? list.map(k => kartuKegiatan(k, s)).join("") :
        '<div class="empty"><span class="e-ico">' + ikon("i-calendar") + '</span><b>Belum ada kegiatan</b><span>Tenaga pendidik akan membuka kegiatan bersama di sini.</span></div>') +
      '</div>' +

      /* ---- Pertemuan Online: jadwal + tautan konferensi ---- */
      (boleh ? '<div class="compose" style="margin-top:26px"><h3>' + ikon("i-link") + ' Buat Jadwal Pertemuan Online</h3>' +
        '<div class="row"><div class="field"><label for="jdJudul">Judul pertemuan</label><span class="inp-wrap">' + ikon("i-flag") +
        '<input id="jdJudul" placeholder="Contoh: Konsultasi Tugas Kelompok"></span></div>' +
        '<div class="field"><label for="jdPlatform">Platform</label><span class="inp-wrap">' + ikon("i-link") +
        '<select id="jdPlatform">' + PLATFORM.map(p => '<option>' + p + '</option>').join("") + '</select></span></div>' +
        '<div class="field"><label for="jdTautan">Tautan pertemuan</label><span class="inp-wrap">' + ikon("i-link") +
        '<input id="jdTautan" placeholder="https://zoom.us/j/..."></span></div></div>' +
        '<div class="row"><div class="field"><label for="jdWaktu">Waktu mulai</label><span class="inp-wrap">' + ikon("i-calendar") +
        '<input id="jdWaktu" type="datetime-local"></span></div>' +
        '<div class="field"><label for="jdDurasi">Durasi (menit)</label><span class="inp-wrap">' + ikon("i-clock") +
        '<input id="jdDurasi" type="number" min="15" max="240" value="60"></span></div>' +
        '<div class="field"><label for="jdKode">Kode undangan rapat</label><span class="inp-wrap">' + ikon("i-lock") +
        '<input id="jdKode" placeholder="otomatis bila kosong"></span></div></div>' +
        '<button class="btn btn-primary" id="jdBuat">' + ikon("i-plus") + ' Simpan Jadwal Pertemuan</button> ' +
        '<span class="chip brand">' + ikon("i-users") + ' Peserta mendapat tautan + kode undangan</span></div>'
        : '<div class="form-note" style="margin-top:24px">' + ikon("i-link") + ' Jadwal <b>pertemuan online</b> dibuat oleh tenaga pendidik ruang ini — lengkap dengan tautan platform dan kode undangan rapat.</div>') +
      '<div class="sec-head" style="margin:24px 0 14px"><span class="sec-tag">' + ikon("i-link") + ' Pertemuan Online</span>' +
      '<h2 style="font-size:1.3rem">Jadwal Konferensi Video</h2>' +
      '<p>' + jadwalRuang(R.code).length + ' jadwal · tautan dibuka lewat tombol Gabung.</p></div>' +
      '<div class="kg-grid" id="jdGrid">' +
      (jadwalRuang(R.code).length ? jadwalRuang(R.code).map(j => kartuJadwal(j, s)).join("") :
        '<div class="empty"><span class="e-ico">' + ikon("i-link") + '</span><b>Belum ada jadwal pertemuan online</b>' +
        '<span>Tenaga pendidik akan membuat jadwal dengan tautan Zoom/Meet di sini.</span></div>') +
      '</div>';
  }

  function pascaKegiatan() {
    const s = sesi();
    const buat = document.getElementById("kgBuat");
    if (buat) buat.onclick = () => {
      const judul = (document.getElementById("kgJudul").value || "").trim();
      if (judul.length < 4) { toast(ikon("i-warn") + " Judul kegiatan belum lengkap", "no"); return; }
      const durasi = Math.max(5, Math.min(300, parseInt(document.getElementById("kgDurasi").value, 10) || 60));
      const jadwal = document.getElementById("kgJadwal").value;
      simpanKegiatanBaru({
        id: uid("kg"), judul, jenis: document.getElementById("kgJenis").value, jenjang: R.code,
        pembuat: s.nama, peran: s.peran, tgl: jadwal ? new Date(jadwal).toISOString() : new Date().toISOString(),
        durasi, status: jadwal && new Date(jadwal) > new Date() ? "akan" : "berlangsung", peserta: [s.nama]
      });
      siarkan();
      toast(ikon("i-check") + " Kegiatan <b>dibuka</b> — peserta bisa bergabung live");
      renderTab();
    };
    /* Gabung = masuk ke RUANG LIVE kegiatan (bukan sekadar menambah nama) */
    document.querySelectorAll("[data-gabung]").forEach(b => b.onclick = () => {
      const k = semuaKegiatan().find(x => x.id === b.dataset.gabung);
      if (!k) return;
      if (k.status === "selesai") { toast(ikon("i-warn") + " Kegiatan sudah selesai", "no"); return; }
      const p = (k.peserta || []).slice();
      if (p.indexOf(s.nama) === -1) p.push(s.nama);
      ubahKegiatan(k.id, { peserta: p });
      siarkan();
      toast(ikon("i-hand") + " Anda <b>bergabung</b> ke " + esc(k.judul));
      bukaRuangLive(k.id);
      renderTab();                    /* kartu di belakang overlay ikut diperbarui */
    });
    document.querySelectorAll("[data-masuk-kg]").forEach(b => b.onclick = () => {
      const k = semuaKegiatan().find(x => x.id === b.dataset.masukKg);
      if (!k) return;
      bukaRuangLive(k.id);
      renderTab();
    });
    document.querySelectorAll("[data-tinggal]").forEach(b => b.onclick = () => {
      const k = semuaKegiatan().find(x => x.id === b.dataset.tinggal);
      if (!k) return;
      const hadir = (k.hadir || []).filter(n => n !== s.nama);
      ubahKegiatan(k.id, { peserta: (k.peserta || []).filter(n => n !== s.nama), hadir: hadir });
      if (LR.id === k.id) tutupRuangLive(false);   /* sudah keluar — tak perlu kabar ulang */
      siarkan();
      toast(ikon("i-check") + " Anda meninggalkan kegiatan");
      renderTab();
    });
    document.querySelectorAll("[data-status-kg]").forEach(b => b.onclick = () => {
      const k = semuaKegiatan().find(x => x.id === b.dataset.statusKg);
      if (!k) return;
      const siklus = { akan: "berlangsung", berlangsung: "selesai", selesai: "akan" };
      ubahKegiatan(k.id, { status: siklus[k.status] || "berlangsung" });
      siarkan();
      toast(ikon("i-refresh") + " Status kegiatan → <b>" + statusKegiatan(Object.assign({}, k, { status: siklus[k.status] }))[1] + "</b>");
      renderTab();
    });
    document.querySelectorAll("[data-hapus-kg]").forEach(b => b.onclick = () => {
      const k = semuaKegiatan().find(x => x.id === b.dataset.hapusKg);
      if (!k) return;
      bukaModal(mHead("i-warn", "Hapus kegiatan?") +
        '<div class="modal-body"><p>Kegiatan <b>' + esc(k.judul) + '</b> akan dihapus dari ruang ini.</p>' +
        '<div class="wiz-foot"><button class="btn btn-ghost" data-tutup>Batal</button><button class="btn btn-danger" id="okHapusKg">Hapus</button></div></div>');
      document.getElementById("okHapusKg").onclick = () => {
        ubahKegiatan(k.id, { dihapus: true });
        tutupModal(); siarkan();
        toast(ikon("i-trash") + " Kegiatan dihapus");
        renderTab();
      };
    });

    /* ---- Pertemuan Online: buat / gabung / hapus jadwal ---- */
    const jdBuat = document.getElementById("jdBuat");
    if (jdBuat) jdBuat.onclick = () => {
      const judul = (document.getElementById("jdJudul").value || "").trim();
      const tautan = (document.getElementById("jdTautan").value || "").trim();
      const waktu = document.getElementById("jdWaktu").value;
      if (judul.length < 4) { toast(ikon("i-warn") + " Judul pertemuan belum lengkap", "no"); return; }
      if (!/^https?:\/\//i.test(tautan)) { toast(ikon("i-warn") + " Tautan harus diawali http:// atau https://", "no"); return; }
      const kode = (document.getElementById("jdKode").value || "").trim() ||
        "RAPAT-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      buatJadwal({
        id: uid("jd"), judul, tautan, kode,
        platform: document.getElementById("jdPlatform").value,
        waktu: waktu ? new Date(waktu).toISOString() : new Date().toISOString(),
        durasi: Math.max(15, Math.min(240, parseInt(document.getElementById("jdDurasi").value, 10) || 60)),
        jenjang: R.code, pembuat: s.nama, peran: s.peran, tgl: new Date().toISOString()
      });
      siarkan();
      toast(ikon("i-check") + " Jadwal pertemuan <b>tersimpan</b> — peserta bisa bergabung");
      renderTab();
    };
    document.querySelectorAll("[data-gabung-jd]").forEach(b => b.onclick = () => {
      const j = semuaJadwal().find(x => x.id === b.dataset.gabungJd);
      if (!j) return;
      toast(ikon("i-link") + " Membuka <b>" + esc(j.platform) + "</b> — kode undangan: " + esc(j.kode));
      catatLog("pertemuan", "Bergabung ke pertemuan: " + j.judul, s ? s.nama : "Tamu");
      try { if (typeof window.open === "function" && /^https?:\/\//i.test(j.tautan)) window.open(j.tautan, "_blank", "noopener"); } catch (e) { }
    });
    document.querySelectorAll("[data-hapus-jd]").forEach(b => b.onclick = () => {
      const j = semuaJadwal().find(x => x.id === b.dataset.hapusJd);
      if (!j) return;
      bukaModal(mHead("i-warn", "Hapus jadwal pertemuan?") +
        '<div class="modal-body"><p>Jadwal <b>' + esc(j.judul) + '</b> akan dihapus.</p>' +
        '<div class="wiz-foot"><button class="btn btn-ghost" data-tutup>Batal</button><button class="btn btn-danger" id="okHapusJd">Hapus</button></div></div>');
      document.getElementById("okHapusJd").onclick = () => {
        hapusJadwal(j.id); tutupModal(); siarkan();
        toast(ikon("i-trash") + " Jadwal pertemuan dihapus");
        renderTab();
      };
    });
  }

  /* ============================================================
     RUANG LIVE KEGIATAN — peserta benar-benar MASUK ke ruangan yang
     dibuka guru/dosen (bukan tombol "Gabung" lalu selesai):
     · kehadiran live — siapa yang sedang berada di ruang
     · chat peserta — tersimpan pada kegiatan, sinkron antar jendela
     · tautan video Zoom/Google Meet milik tuan rumah (dibuka tab baru)
     · ATURAN: tuan rumah (pembuat kegiatan / tenaga pendidik ruang)
       harus hadir lebih dulu sebelum ruangan dianggap berjalan
     ============================================================ */
  const PLATFORM_VIDEO = ["Zoom", "Google Meet", "Microsoft Teams", "Webex", "Discord"];
  function pendidikNama(nama, code) {
    const u = daftarUsers().find(x => x.nama === nama);
    return !!u && bisaTulis(u, code);
  }
  function tuanRumahHadir(k) {
    return (k.hadir || []).some(n => n === k.pembuat || pendidikNama(n, k.jenjang));
  }
  function jam(t) {
    const d = new Date(t);
    if (isNaN(d.getTime())) return "";
    const p = n => (n < 10 ? "0" : "") + n;
    return p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function ruangLiveHTML() {
    const s = sesi();
    const k = semuaKegiatan().find(x => x.id === LR.id);
    if (!s || !k) return "";
    const st = statusKegiatan(k);
    const hadir = k.hadir || [];
    const chat = (k.chat || []).slice(-50);
    const tangan = k.tangan || [];
    const host = tuanRumahHadir(k);
    const kelola = bisaTulis(s, k.jenjang) || k.pembuat === s.nama;
    const mulai = new Date(k.tgl).getTime();
    const menit = isNaN(mulai) ? 0 : Math.max(0, Math.round((Date.now() - mulai) / 60000));

    const kepala =
      '<div class="lr-head">' +
      '<div class="lr-info">' +
      '<span class="kg-status ' + st[0] + '">' + ikon(st[0] === "live" ? "i-signal" : st[0] === "akan" ? "i-clock" : "i-check") + st[1] + '</span>' +
      '<span class="chip">' + ikon(IKON_JENIS[k.jenis] || "i-calendar") + esc(k.jenis) + '</span>' +
      '<span class="chip">' + ikon("i-user") + esc(k.pembuat) + ' · ' + esc(PERAN[k.peran] ? PERAN[k.peran].nama : k.peran) + '</span>' +
      '<span class="chip">' + ikon("i-clock") + (st[0] === "live" ? "berjalan " + menit + " menit" : (k.durasi || 60) + " menit") + '</span>' +
      '<span class="chip green">' + ikon("i-signal") + hadir.length + ' di ruang</span>' +
      (tangan.length ? '<span class="chip amber">' + ikon("i-hand") + tangan.length + ' angkat tangan</span>' : '') +
      '</div>' +
      '<button class="btn btn-soft btn-sm" id="lrTutup" aria-label="Tutup ruangan">' + ikon("i-x") + ' Keluar</button>' +
      '</div>' +
      '<div class="lr-title"><h2>' + esc(k.judul) + '</h2>' +
      '<p>Dibuka oleh <b>' + esc(k.pembuat) + '</b> untuk ruang ' +
      esc(JENJANG[k.jenjang] ? JENJANG[k.jenjang].nama : k.jenjang) + '.</p></div>';

    /* --- panggung kiri: status tuan rumah + tautan video --- */
    const panggung = '<div class="lr-panggung ' + (host ? "buka" : "tunggu") + '">' +
      (host
        ? '<span class="lr-live-dot"></span>' +
        '<b>Ruang live terbuka</b>' +
        '<p>' + (st[0] === "live"
          ? "Tuan rumah sudah hadir — kegiatan berjalan bersama " + hadir.length + " peserta."
          : "Tuan rumah sudah hadir. Tekan <b>Mulai Kegiatan</b> bila statusnya belum berjalan.") + '</p>' +
        (k.tautan
          ? '<button class="btn btn-primary" id="lrVideo">' + ikon("i-link") + ' Gabung Video di ' + esc(k.platform || "Rapat") + '</button>' +
          '<span class="lr-kode">' + esc(k.tautan) + '</span>'
          : '<span class="lr-kode">' + ikon("i-warn") + ' Tautan video belum dipasang tuan rumah.</span>')
        : '<span class="e-ico">' + ikon("i-clock") + '</span>' +
        '<b>Menunggu tuan rumah</b>' +
        '<p>Tuan rumah <b>' + esc(k.pembuat) + '</b> belum masuk ruangan. Ruangan langsung live begitu beliau bergabung — silakan menunggu sambil chat.</p>') +
      '</div>';

    /* --- alat tuan rumah --- */
    const alat = (kelola
      ? '<div class="lr-host"><h4>' + ikon("i-shield") + ' Alat tuan rumah</h4>' +
      (st[0] === "akan"
        ? '<button class="btn btn-primary btn-sm" id="lrMulai">' + ikon("i-play") + ' Mulai Kegiatan Sekarang</button> '
        : '') +
      '<span class="inp-wrap"><select id="lrPlatform" aria-label="Platform video">' +
      PLATFORM_VIDEO.map(p => '<option' + (k.platform === p ? " selected" : "") + '>' + p + '</option>').join("") +
      '</select></span>' +
      '<span class="inp-wrap"><input id="lrTautan" placeholder="Tempel tautan rapat, mis. https://zoom.us/j/..." value="' + esc(k.tautan || "") + '" autocomplete="off"></span>' +
      '<button class="btn btn-soft btn-sm" id="lrPasang">' + ikon("i-check") + ' Pasang Tautan</button></div>'
      : '');

    /* --- daftar kehadiran --- */
    const daftarHadir =
      '<div class="lr-hadir"><h4>' + ikon("i-users") + ' Sedang di ruang (' + hadir.length + ')</h4>' +
      '<div class="lr-hadir-list">' +
      (hadir.length
        ? hadir.map(n => '<span class="chip green">' + ikon("i-user") + esc(n) +
          (n === k.pembuat ? ' <b class="lr-host-tag">tuan rumah</b>' : "") +
          (n === s.nama ? ' (Anda)' : "") + '</span>').join("")
        : '<span class="chip">belum ada yang masuk</span>') +
      '</div>' +
      '<p class="lr-hadir-note">' + (k.peserta || []).length + ' peserta terdaftar · ' +
      tangan.length + ' mengangkat tangan</p></div>';

    /* --- chat --- */
    const kotakChat =
      '<div class="lr-chat"><h4>' + ikon("i-mail") + ' Chat ruangan</h4>' +
      '<div class="lr-chat-list" id="lrChat">' +
      (chat.length
        ? chat.map(m => '<div class="lr-msg' + (m.dari === s.nama ? " saya" : "") + '">' +
          '<b>' + esc(m.dari) + '</b><span>' + esc(m.pesan) + '</span>' +
          '<small>' + jam(m.tgl) + '</small></div>').join("")
        : '<div class="lr-msg kosong"><span>Belum ada pesan — sapa tuan rumah dan peserta lain.</span></div>') +
      '</div>' +
      '<form class="lr-chat-form" id="lrForm">' +
      '<span class="inp-wrap"><input id="lrPesan" placeholder="Tulis pesan untuk ruangan..." autocomplete="off" maxlength="400"></span>' +
      '<button class="btn btn-primary btn-sm" type="submit" id="lrKirim">' + ikon("i-arrow") + ' Kirim</button>' +
      '</form></div>';

    const kaki =
      '<div class="lr-foot">' +
      '<button class="btn btn-soft btn-sm" id="lrTangan">' + ikon("i-hand") +
      (tangan.indexOf(s.nama) > -1 ? ' Batal Angkat Tangan' : ' Angkat Tangan') + '</button>' +
      '<span class="lr-foot-note">' + ikon("i-lock") +
      (host ? ' Ruang live bersama ' + esc(k.pembuat) : ' Menunggu tuan rumah masuk') + '</span>' +
      '<button class="btn btn-danger btn-sm" id="lrKeluar">' + ikon("i-logout") + ' Tinggalkan Ruangan</button>' +
      '</div>';

    return '<div class="lr-in" role="document">' + kepala +
      '<div class="lr-body"><div class="lr-kiri">' + panggung + alat + '</div>' +
      '<aside class="lr-kanan">' + daftarHadir + kotakChat + '</aside></div>' + kaki + '</div>';
  }

  function pascaRuangLive() {
    const s = sesi();
    const k = () => semuaKegiatan().find(x => x.id === LR.id);
    const tutup = document.getElementById("lrTutup");
    if (tutup) tutup.onclick = () => tutupRuangLive();
    const keluar = document.getElementById("lrKeluar");
    if (keluar) keluar.onclick = () => {
      const judul = ((k() || {}).judul) || "ruangan";
      tutupRuangLive();
      toast(ikon("i-check") + " Anda meninggalkan ruangan <b>" + esc(judul) + "</b>");
      renderTab();
    };

    const form = document.getElementById("lrForm");
    if (form) form.onsubmit = e => {
      e.preventDefault();
      const inp = document.getElementById("lrPesan");
      const teks = (inp.value || "").trim();
      const keg = k();
      if (!keg || !teks) return;
      const chat = (keg.chat || []).concat([{ dari: s.nama, pesan: teks, tgl: new Date().toISOString() }]).slice(-50);
      ubahKegiatan(keg.id, { chat: chat });
      inp.value = "";                  /* pesan terkirim → kolom dikosongkan */
      siarkan();
      gambarRuangLive();   /* draft & fokus input dipertahankan */
      const baru = document.getElementById("lrPesan");
      if (baru) baru.focus();
      const list = document.getElementById("lrChat");
      if (list) list.scrollTop = list.scrollHeight;
    };

    const tangan = document.getElementById("lrTangan");
    if (tangan) tangan.onclick = () => {
      const keg = k();
      if (!keg) return;
      const t = (keg.tangan || []).slice();
      const i = t.indexOf(s.nama);
      if (i > -1) { t.splice(i, 1); toast(ikon("i-check") + " Tangan diturunkan"); }
      else { t.push(s.nama); toast(ikon("i-hand") + " Anda mengangkat tangan"); }
      ubahKegiatan(keg.id, { tangan: t });
      siarkan();
      gambarRuangLive();
    };

    const mulai = document.getElementById("lrMulai");
    if (mulai) mulai.onclick = () => {
      const keg = k();
      if (!keg) return;
      ubahKegiatan(keg.id, { status: "berlangsung" });
      siarkan();
      toast(ikon("i-play") + " Kegiatan <b>dimulai</b> — peserta melihat status live");
      gambarRuangLive();
      renderTab();
    };

    const pasang = document.getElementById("lrPasang");
    if (pasang) pasang.onclick = () => {
      const keg = k();
      if (!keg) return;
      const tautan = (document.getElementById("lrTautan").value || "").trim();
      if (!/^https?:\/\//i.test(tautan)) {
        toast(ikon("i-warn") + " Tautan harus diawali http:// atau https://", "no");
        return;
      }
      ubahKegiatan(keg.id, {
        tautan: tautan,
        platform: document.getElementById("lrPlatform").value
      });
      siarkan();
      toast(ikon("i-check") + " Tautan video <b>dipasang</b> — peserta bisa bergabung");
      gambarRuangLive();
    };

    const video = document.getElementById("lrVideo");
    if (video) video.onclick = () => {
      const keg = k();
      if (!keg || !/^https?:\/\//i.test(keg.tautan || "")) return;
      catatLog("kegiatan", "Bergabung ke video ruangan: " + keg.judul, s ? s.nama : "Tamu");
      toast(ikon("i-link") + " Membuka <b>" + esc(keg.platform || "rapat") + "</b> — " + esc(keg.judul));
      try { if (typeof window.open === "function") window.open(keg.tautan, "_blank", "noopener"); } catch (e) { }
    };
  }

  function gambarRuangLive() {
    if (!LR.id) return;
    let box = document.getElementById("liveRoom");
    if (!box) {
      box = document.createElement("div");
      box.id = "liveRoom";
      box.className = "live-room";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-label", "Ruang kegiatan live");
      document.body.appendChild(box);
    }
    const lama = document.getElementById("lrPesan");
    const draf = lama ? lama.value : "";
    const fokus = !!lama && document.activeElement === lama;
    box.innerHTML = ruangLiveHTML();
    pascaRuangLive();
    const inp = document.getElementById("lrPesan");
    if (inp) { inp.value = draf; if (fokus) inp.focus(); }
    if (!LR.onEsc) {
      LR.onEsc = e => { if (e.key === "Escape") tutupRuangLive(); };
      document.addEventListener("keydown", LR.onEsc);
    }
  }

  function bukaRuangLive(id) {
    const s = sesi();
    const k = semuaKegiatan().find(x => x.id === id);
    if (!s || !k) return;
    if (LR.id && LR.id !== id) tutupRuangLive();   /* pindah ruang → keluar dari ruang lama dulu */
    if (k.status === "selesai") { toast(ikon("i-warn") + " Kegiatan sudah selesai — ruang ditutup", "no"); return; }
    const hadir = (k.hadir || []).slice();
    if (hadir.indexOf(s.nama) === -1) hadir.push(s.nama);
    const peserta = (k.peserta || []).slice();
    if (peserta.indexOf(s.nama) === -1) peserta.push(s.nama);
    ubahKegiatan(k.id, { hadir: hadir, peserta: peserta });   /* kehadiran = dasar "siapa live di ruang" */
    LR.id = id; LR.nama = s.nama;
    gambarRuangLive();
    siarkan();
  }

  function tutupRuangLive(kabarkan) {
    if (!LR.id) return;
    const s = sesi();
    const k = semuaKegiatan().find(x => x.id === LR.id);
    const nama = s ? s.nama : LR.nama;      /* sesi bisa saja sudah ditutup duluan */
    if (nama && k) {
      ubahKegiatan(k.id, { hadir: (k.hadir || []).filter(n => n !== nama) });
      if (kabarkan !== false) siarkan();
    }
    LR.id = null; LR.nama = null;
    const box = document.getElementById("liveRoom");
    if (box && box.parentNode) box.parentNode.removeChild(box);
    if (LR.onEsc) { document.removeEventListener("keydown", LR.onEsc); LR.onEsc = null; }
  }

  /* ============================================================
     PANTAU & NILAI — guru / dosen / mitra industri / admin / operator
     · memantau progres belajar peserta (SD, SMP, SMA, SMK, Mahasiswa)
     · input / perbarui / kosongkan nilai per peserta per mapel
     · menambah pelajaran (mata pelajaran ruang)
     ============================================================ */
  function pesertaRuang(code) {
    return daftarUsers().filter(u => (u.peran === "siswa" || u.peran === "mahasiswa") && jenjangSaya(u).indexOf(code) > -1);
  }
  function ringkasPeserta(code, u) {
    const pr = progresUser(code, u.email);
    const rows = semuaMapel(code).map(m => nilaiPengguna(code, u.email, m));
    const terisi = rows.filter(r => r.ada);
    const lat = Object.keys(pr.latihan || {});
    const rataLat = lat.length ? Math.round(lat.reduce((a, k) => a + (pr.latihan[k].terbaik || 0), 0) / lat.length) : 0;
    const rataNilai = terisi.length ? Math.round(terisi.reduce((a, r) => a + r.akhir, 0) / terisi.length) : 0;
    return { bab: pr.bab.length, lat: lat.length, rataLat, dinilai: terisi.length, rataNilai };
  }
  function bukaModalNilai(email) {
    const u = daftarUsers().find(x => x.email === email);
    if (!u) return;
    const mapel = semuaMapel(R.code);
    if (!mapel.length) { toast(ikon("i-warn") + " Belum ada mata pelajaran di ruang ini", "no"); return; }
    const angka = (id, label, ik) => '<div class="field"><label for="' + id + '">' + label + '</label><span class="inp-wrap">' + ikon(ik) +
      '<input id="' + id + '" type="number" min="0" max="100" value="0"></span></div>';
    const g0 = ambilNilaiGuru(R.code, email, mapel[0].id);
    bukaModal(mHead("i-receipt", "Input Nilai — " + esc(u.nama)) +
      '<div class="modal-body">' +
      '<div class="field"><label for="nkMapel">Mata pelajaran</label><span class="inp-wrap">' + ikon("i-books") +
      '<select id="nkMapel">' + mapel.map(m => '<option value="' + esc(m.id) + '">' + esc(m.nama) + '</option>').join("") + '</select></span></div>' +
      '<div class="compose" style="margin:0 0 14px"><div class="row">' +
      angka("nkTugas", "Tugas (30%)", "i-pen") + angka("nkUh", "Ulang Harian (30%)", "i-bolt") + angka("nkUas", "UAS / UTS (40%)", "i-file") +
      '</div><p class="form-note" style="margin:0">' + ikon("i-shield") +
      ' Nilai awal seluruhnya <b>0</b> (belum dikerjakan / belum diinput). Isian 0–100, desimal dibulatkan.</p></div>' +
      '<div class="wiz-foot"><button class="btn btn-ghost" data-tutup>Batal</button>' +
      '<button class="btn btn-soft" id="nkKosong">' + ikon("i-refresh") + ' Kosongkan</button>' +
      '<button class="btn btn-primary" id="nkSimpan">' + ikon("i-check") + ' Simpan Nilai</button></div></div>');
    const sel = document.getElementById("nkMapel");
    const isiAngka = () => {
      const g = ambilNilaiGuru(R.code, email, sel.value);
      document.getElementById("nkTugas").value = g ? g.tugas : 0;
      document.getElementById("nkUh").value = g ? g.uh : 0;
      document.getElementById("nkUas").value = g ? g.uas : 0;
    };
    if (sel) { isiAngka(); sel.onchange = isiAngka; }
    const simpan = document.getElementById("nkSimpan");
    if (simpan) simpan.onclick = () => {
      simpanNilaiInput(R.code, email, sel.value, {
        tugas: document.getElementById("nkTugas").value,
        uh: document.getElementById("nkUh").value,
        uas: document.getElementById("nkUas").value
      });
      siarkan(); tutupModal();
      toast(ikon("i-check") + " Nilai <b>" + esc(u.nama) + "</b> tersimpan di transkrip");
      renderTab();
    };
    const koso = document.getElementById("nkKosong");
    if (koso) koso.onclick = () => {
      kosongkanNilaiInput(R.code, email, sel.value);
      isiAngka(); siarkan();
      toast(ikon("i-refresh") + " Nilai dikosongkan — kembali <b>0</b>");
      renderTab();
    };
  }

  function tabPantau() {
    const s = sesi();
    const code = R.code;
    const peserta = pesertaRuang(code);
    const mapel = semuaMapel(code);
    const totalB = totalBab(code);
    const custom = mapelCustom(code);
    const ringkas = peserta.map(u => ({ u: u, r: ringkasPeserta(code, u) }));
    const rataBab = peserta.length ? Math.round(ringkas.reduce((a, x) => a + (totalB ? x.r.bab / totalB : 0), 0) / peserta.length * 100) : 0;
    const totalDinilai = ringkas.reduce((a, x) => a + x.r.dinilai, 0);

    const baris = ringkas.map(x => {
      const belum = x.r.dinilai === 0 && x.r.lat === 0;
      return '<tr><td><b>' + esc(x.u.nama) + '</b><br><small style="color:var(--muted)">' + esc(x.u.email) + '</small></td>' +
        '<td>' + esc(PERAN[x.u.peran] ? PERAN[x.u.peran].nama : x.u.peran) + '</td>' +
        '<td class="num">' + x.r.bab + '/' + totalB + '</td>' +
        '<td class="num">' + x.r.lat + ' mapel' + (x.r.rataLat ? ' · avg ' + x.r.rataLat : '') + '</td>' +
        '<td class="num">' + x.r.rataNilai + '</td>' +
        '<td>' + (belum ? '<span class="status-t kosong">• Belum dikerjakan</span>'
          : x.r.dinilai ? '<span class="status-t ' + (x.r.rataNilai >= 75 ? "tuntas" : "remed") + '">✔ ' + x.r.dinilai + ' mapel dinilai</span>'
            : '<span class="status-t tuntas">✔ latihan dikerjakan</span>') + '</td>' +
        '<td><button class="btn btn-sm btn-primary" data-input-nilai="' + esc(x.u.email) + '">' + ikon("i-receipt") + ' Input Nilai</button></td></tr>';
    }).join("");

    return '<div class="sec-head" style="margin-bottom:16px"><span class="sec-tag">' + ikon("i-chart") + ' Pantau Progres & Nilai</span>' +
      '<h2 style="font-size:1.4rem">Pemantauan Peserta · ' + esc(JENJANG[code].nama) + '</h2>' +
      '<p>Masuk sebagai <b>' + esc(peranLabel(s)) + '</b> — pantau progres belajar, input nilai, dan tambah pelajaran untuk ruang ini.</p></div>' +

      '<div class="stat-grid">' +
      '<div class="stat-card"><span class="lbl">Peserta Dipantau</span><span class="val">' + peserta.length + '</span><span class="note">siswa & mahasiswa ' + esc(JENJANG[code].label) + '</span></div>' +
      '<div class="stat-card"><span class="lbl">Progres Bab</span><span class="val">' + rataBab + '%</span><span class="note">rata-rata seluruh peserta</span></div>' +
      '<div class="stat-card"><span class="lbl">Mapel Dinilai</span><span class="val">' + totalDinilai + '</span><span class="note">nilai terinput pengajar</span></div>' +
      '<div class="stat-card"><span class="lbl">Mata Pelajaran</span><span class="val">' + mapel.length + '</span><span class="note">' + custom.length + ' tambahan pengajar</span></div>' +
      '</div>' +

      (peserta.length ?
        '<div class="table-wrap" style="margin-top:20px"><table class="trans" id="tabelPantau"><thead><tr>' +
        '<th>Peserta</th><th>Peran</th><th>Bab</th><th>Latihan</th><th>Rata Nilai</th><th>Status</th><th>Aksi</th>' +
        '</tr></thead><tbody>' + baris + '</tbody></table></div>'
        :
        '<div class="empty" style="margin-top:20px"><span class="e-ico">' + ikon("i-users") + '</span><b>Belum ada peserta di ruang ini</b>' +
        '<span>Siswa/mahasiswa yang mendaftar jenjang ini akan tampil di sini beserta progres & nilainya.</span></div>') +

      '<div class="compose" style="margin-top:24px"><h3>' + ikon("i-plus") + ' Tambah Pelajaran di ' + esc(JENJANG[code].nama) + '</h3>' +
      '<div class="row">' +
      '<div class="field"><label for="mxNama">Nama mata pelajaran / mata kuliah</label><span class="inp-wrap">' + ikon("i-books") +
      '<input id="mxNama" placeholder="Contoh: Sejarah Lokal Nusantara"></span></div>' +
      '<div class="field"><label for="mxRingkas">Deskripsi singkat</label><span class="inp-wrap">' + ikon("i-pen") +
      '<input id="mxRingkas" placeholder="Ringkasan pelajaran (opsional)"></span></div></div>' +
      '<button class="btn btn-primary" id="mxTambah">' + ikon("i-plus") + ' Tambahkan Pelajaran</button> ' +
      '<span class="chip brand">' + ikon("i-shield") + ' Langsung tampil di Materi, Latihan & Transkrip</span></div>' +

      '<div class="sec-head" style="margin:10px 0 12px"><span class="sec-tag">' + ikon("i-books") + ' Tambahan</span>' +
      '<h2 style="font-size:1.15rem">Pelajaran Tambahan (' + custom.length + ')</h2></div>' +
      '<div class="stack">' +
      (custom.length ? custom.map(m =>
        '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon(m.ikon || "i-books") + '</span>' +
        '<span class="li-body"><b>' + esc(m.nama) + '</b><small>' + esc(m.ringkas || "") + ' · ditambah ' + esc(m.pengajar || "-") + '</small></span>' +
        '<span class="li-end"><span class="chip">' + ((m.bab || []).length) + ' bab</span>' +
        '<button class="btn btn-sm btn-danger" data-hapus-mx="' + esc(m.id) + '">' + ikon("i-trash") + '</button></span></div>').join("")
        : '<div class="empty"><span class="e-ico">' + ikon("i-books") + '</span><b>Belum ada pelajaran tambahan</b>' +
        '<span>Tambahkan pelajaran baru lewat formulir di atas.</span></div>') +
      '</div>';
  }

  function pascaPantau() {
    document.querySelectorAll("[data-input-nilai]").forEach(b => b.onclick = () => bukaModalNilai(b.dataset.inputNilai));
    const tambah = document.getElementById("mxTambah");
    if (tambah) tambah.onclick = () => {
      const nama = (document.getElementById("mxNama").value || "").trim();
      const ringkas = (document.getElementById("mxRingkas").value || "").trim();
      if (nama.length < 3) { toast(ikon("i-warn") + " Nama pelajaran minimal 3 karakter", "no"); return; }
      const m = tambahMapelx(R.code, { nama: nama, ringkas: ringkas });
      siarkan();
      toast(ikon("i-check") + " Pelajaran <b>" + esc(m.nama) + "</b> ditambahkan ke ruang ini");
      renderTab();
    };
    document.querySelectorAll("[data-hapus-mx]").forEach(b => b.onclick = () => {
      const m = cariMapelCustom(R.code, b.dataset.hapusMx);
      if (!m) return;
      bukaModal(mHead("i-warn", "Hapus pelajaran?") +
        '<div class="modal-body"><p>Pelajaran <b>' + esc(m.nama) + '</b> beserta nilai & progresnya akan dihapus dari ruang ini.</p>' +
        '<div class="wiz-foot"><button class="btn btn-ghost" data-tutup>Batal</button><button class="btn btn-danger" id="okHapusMx">Hapus</button></div></div>');
      document.getElementById("okHapusMx").onclick = () => {
        hapusMapelx(R.code, m.id);
        tutupModal(); siarkan();
        toast(ikon("i-trash") + " Pelajaran dihapus");
        renderTab();
      };
    });
  }

  /* ============================================================
     PANEL KELOLA (admin & operator per jenjang)
     ============================================================ */
  function tabKelola() {
    const s = sesi();
    const admin = s.peran === "admin";
    const ann = pengumumanRuang(R.code);
    const kg = kegiatanRuang(R.code);
    const und = semuaUndangan().filter(u => u.jenjang === R.code);
    const pengguna = daftarUsers().filter(u => jenjangSaya(u).indexOf(R.code) > -1);

    const pilihanJenjang = '<div class="field"><label for="undJenjang">Jenjang tujuan</label><span class="inp-wrap">' + ikon("i-compass") +
      '<select id="undJenjang">' + URUT.map(c => '<option value="' + c + '"' + (c === R.code ? " selected" : "") + '>' + esc(JENJANG[c].nama) + '</option>').join("") + '</select></span></div>';

    return '<div class="stat-grid">' +
      '<div class="stat-card"><span class="lbl">Pengguna Ruang</span><span class="val">' + pengguna.length + '</span><span class="note">terdaftar di ' + esc(JENJANG[R.code].label) + '</span></div>' +
      '<div class="stat-card"><span class="lbl">Pengumuman</span><span class="val">' + ann.length + '</span><span class="note">diterbitkan</span></div>' +
      '<div class="stat-card"><span class="lbl">Kegiatan</span><span class="val">' + kg.length + '</span><span class="note">' + kg.filter(k => statusKegiatan(k)[0] === "live").length + ' berlangsung</span></div>' +
      '<div class="stat-card"><span class="lbl">Kode Undangan</span><span class="val">' + und.length + '</span><span class="note">' + und.filter(u => u.aktif).length + ' aktif</span></div>' +
      '</div>' +

      '<div class="grid-2" style="margin-top:22px"><div>' +
      '<div class="sec-head" style="margin-bottom:14px"><span class="sec-tag">' + ikon("i-link") + ' Undangan</span><h2 style="font-size:1.25rem">Kode Akses Jenjang</h2></div>' +
      '<div class="compose"><p style="margin-bottom:12px">Bagikan kode agar tenaga pendidik/peserta dari jenjang lain dapat membuka ruang ini lewat menu <b>Tukar Kode</b>.</p>' +
      (admin ? pilihanJenjang : '') +
      '<button class="btn btn-primary" id="undBuat">' + ikon("i-plus") + ' Buat Kode Undangan</button></div>' +
      '<div class="stack" style="margin-top:14px" id="undList">' +
      (und.length ? und.slice().reverse().map(u =>
        '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon("i-link") + '</span>' +
        '<span class="li-body"><b class="kode-undangan">' + esc(u.kode) + '</b>' +
        '<small>dibuat ' + esc(u.pembuat) + ' · ' + tglIndo(u.tgl) + ' · ' + u.dipakai.length + ' dipakai</small></span>' +
        '<span class="li-end"><button class="btn btn-sm btn-soft" data-salin="' + esc(u.kode) + '">' + ikon("i-file") + ' Salin</button>' +
        (u.aktif ? '<button class="btn btn-sm btn-danger" data-matikan="' + esc(u.kode) + '">' + ikon("i-x") + '</button>' : '<span class="chip">nonaktif</span>') +
        '</span></div>').join("")
        : '<div class="empty"><span class="e-ico">' + ikon("i-link") + '</span><b>Belum ada kode</b><span>Buat kode pertama untuk ruang ini.</span></div>') +
      '</div></div><div>' +
      '<div class="sec-head" style="margin-bottom:14px"><span class="sec-tag">' + ikon("i-shield") + ' Admin</span><h2 style="font-size:1.25rem">Panel Platform</h2></div>' +
      '<div class="stack">' +
      '<button class="list-item" id="goKelolaKegiatan"><span class="li-ico">' + ikon("i-calendar") + '</span><span class="li-body"><b>Kelola Kegiatan</b><small>' + kg.length + ' kegiatan di ruang ini</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      '<button class="list-item" id="goKelolaPengumuman"><span class="li-ico">' + ikon("i-bell") + '</span><span class="li-body"><b>Kelola Pengumuman</b><small>' + ann.length + ' pengumuman</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      (admin ? '<button class="list-item" id="goAdmin"><span class="li-ico">' + ikon("i-shield") + '</span><span class="li-body"><b>Panel Admin Sistem</b><small>statistik, pengguna, kegiatan & undangan seluruh jenjang</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' : '') +
      '</div>' +
      '<div class="form-note" style="margin-top:14px">' + ikon("i-shield") + ' Masuk sebagai <b>' + esc(peranLabel(s)) + '</b> — ' +
      (admin ? 'Anda mengelola <b>seluruh jenjang</b>.' : 'Anda mengelola jenjang yang ditugaskan.') + '</div>' +
      '</div></div>';
  }

  function pascaKelola() {
    const s = sesi();
    const buat = document.getElementById("undBuat");
    if (buat) buat.onclick = () => {
      const sel = document.getElementById("undJenjang");
      const jenjang = sel ? sel.value : R.code;
      const u = buatUndangan(jenjang, s.nama, s.peran);
      siarkan();
      toast(ikon("i-link") + ' Kode undangan <b class="kode-undangan">' + esc(u.kode) + '</b> untuk ' + esc(JENJANG[jenjang].nama));
      renderTab();
    };
    document.querySelectorAll("[data-salin]").forEach(b => b.onclick = () => {
      const kode = b.dataset.salin;
      try { navigator.clipboard.writeText(kode); } catch (e) { }
      toast(ikon("i-file") + ' Kode <b class="kode-undangan">' + esc(kode) + '</b> disalin');
    });
    document.querySelectorAll("[data-matikan]").forEach(b => b.onclick = () => {
      const semua = semuaUndangan();
      const u = semua.find(x => x.kode === b.dataset.matikan);
      if (u) { u.aktif = false; lsSet(K.undangan, semua); siarkan(); toast(ikon("i-x") + " Kode dinonaktifkan"); renderTab(); }
    });
    const gk = document.getElementById("goKelolaKegiatan");
    if (gk) gk.onclick = () => { R.tab = "kegiatan"; renderRuang(); };
    const gp = document.getElementById("goKelolaPengumuman");
    if (gp) gp.onclick = () => { R.tab = "pengumuman"; renderRuang(); };
    const ga = document.getElementById("goAdmin");
    if (ga) ga.onclick = () => navigasi("#/admin");
  }

  /* ============================================================
     LAYANAN TAMBAHAN: PERPUSTAKAAN · KURIKULUM · PERTERUAN · INDUSTRI
     ============================================================ */
  /* ---------------- Perpustakaan digital ---------------- */
  function seedBuku() {
    return [
      { id: "bk1", judul: "Panduan Belajar Adaptif Kuradapt", penulis: "Tim DAFFTECH", jenjang: "semua", kategori: "Panduan", ringkas: "Cara memakai ruang jenjang, latihan adaptif, dan transkrip nilai.", isi: "Buku panduan ini menjelaskan alur belajar di Kuradapt: pilih ruang jenjang, kerjakan materi dan latihan, lalu pantau transkrip nilai. Nilai dimulai dari nol dan hanya terisi setelah dikerjakan atau diinput pengajar.", tgl: "2026-01-10T08:00:00.000Z" },
      { id: "bk2", judul: "Literasi Digital Dasar", penulis: "DAFFTECH", jenjang: "mini", kategori: "Sains", ringkas: "Mengenal komputer, internet aman, dan kebiasaan belajar digital.", isi: "Materi literasi digital untuk siswa SD: mengenal perangkat, menjaga kata sandi, membedakan informasi benar dan hoaks, serta kebiasaan belajar yang sehat di depan layar.", tgl: "2026-02-01T08:00:00.000Z" },
      { id: "bk3", judul: "Matematika Kontekstual", penulis: "Guru Kuradapt", jenjang: "mini", kategori: "Matematika", ringkas: "Soal cerita sehari-hari untuk melatih logika dasar.", isi: "Kumpulan soal cerita bertema kehidupan sehari-hari: belanja, jam, pengukuran, dan pola angka. Setiap bab dilengkapi pembahasan langkah demi langkah.", tgl: "2026-02-12T08:00:00.000Z" },
      { id: "bk4", judul: "Penemuan Minat & Bakat", penulis: "Konselor Kuradapt", jenjang: "muda", kategori: "Bimbingan", ringkas: "Kuis dan refleksi untuk mengenali kecenderungan bakat siswa SMP.", isi: "Buku kerja penemuan minat: kuis kecenderungan (sains, seni, sosial), catatan refleksi, dan contoh rencana belajar tiga bulan sesuai hasil kuis.", tgl: "2026-02-20T08:00:00.000Z" },
      { id: "bk5", judul: "Sains Eksperimen Rumah Tangga", penulis: "Guru Kuradapt", jenjang: "muda", kategori: "Sains", ringkas: "20 eksperimen sederhana dengan alat dapur.", isi: "Eksperimen sederhana yang bisa dilakukan di rumah: tumbuhan, air, panas, dan listrik statis. Tiap eksperimen memuat tujuan, langkah, dan pertanyaan pemantauan.", tgl: "2026-03-02T08:00:00.000Z" },
      { id: "bk6", judul: "Dasar Kecerdasan Buatan", penulis: "DAFFTECH", jenjang: "mahir", kategori: "Teknologi", ringkas: "Pengantar AI, data, dan etika teknologi untuk SMA/SMK.", isi: "Pengantar kecerdasan buatan: apa itu model, data latih, contoh penerapan sehari-hari, serta etika penggunaan AI dalam pendidikan dan pekerjaan.", tgl: "2026-03-10T08:00:00.000Z" },
      { id: "bk7", judul: "Digital Marketing untuk Pemula", penulis: "Mitra Industri", jenjang: "mahir", kategori: "Vokasi", ringkas: "Konten, media sosial, dan pengukuran kampanye.", isi: "Dasar pemasaran digital: menentukan target audiens, membuat konten, jadwal unggah, dan membaca metrik seperti jangkauan serta konversi.", tgl: "2026-03-18T08:00:00.000Z" },
      { id: "bk8", judul: "Pemrograman Web: HTML, CSS, JavaScript", penulis: "DAFFTECH", jenjang: "mahir", kategori: "Teknologi", ringkas: "Belajar membuat halaman web dari nol.", isi: "Modul praktis membuat halaman web: struktur HTML, tata letak CSS, dan interaksi dasar JavaScript. Dilengkapi proyek portofolio sederhana.", tgl: "2026-04-01T08:00:00.000Z" },
      { id: "bk9", judul: "Studi Kasus Proyek Industri", penulis: "Tim Kuradapt", jenjang: "tinggi", kategori: "Proyek", ringkas: "Rangkaian studi kasus untuk pembelajaran berbasis proyek.", isi: "Kumpulan studi kasus perusahaan: analisis masalah, penyusunan solusi, pengukuran hasil, dan pelajaran proyek untuk portofolio mahasiswa.", tgl: "2026-04-12T08:00:00.000Z" },
      { id: "bk10", judul: "Metode Penelitian Ringkas", penulis: "Dosen Kuradapt", jenjang: "tinggi", kategori: "Akademik", ringkas: "Rumus masalah, tinjauan pustaka, dan penulisan laporan.", isi: "Panduan ringkas penelitian: merumuskan masalah, menyusun tinjauan pustaka, metode kualitatif dan kuantitatif, serta penulisan laporan ilmiah.", tgl: "2026-04-20T08:00:00.000Z" }
    ];
  }
  function semuaBuku() {
    const byId = {};
    seedBuku().forEach(b => { byId[b.id] = b; });
    lsGet(K.buku, []).forEach(b => {
      if (b.dihapus) delete byId[b.id];
      else byId[b.id] = Object.assign(byId[b.id] || {}, b);
    });
    return Object.keys(byId).map(id => byId[id]);
  }
  function bukuRuang(code) {
    return semuaBuku().filter(b => b.jenjang === "semua" || b.jenjang === code ||
      (code === "mahir" && b.jenjang === "mahir") || (code === "tinggi" && b.jenjang === "tinggi"));
  }
  function tambahBuku(b) {
    const semua = lsGet(K.buku, []);
    semua.push(b); lsSet(K.buku, semua);
    catatLog("perpustakaan", "Buku ditambahkan: " + b.judul);
  }
  function hapusBuku(id) {
    const semua = lsGet(K.buku, []);
    const idx = semua.findIndex(b => b.id === id);
    if (idx > -1) semua.splice(idx, 1);
    if (seedBuku().some(b => b.id === id)) semua.push({ id: id, dihapus: true });
    lsSet(K.buku, semua);
    catatLog("perpustakaan", "Buku dihapus: " + id);
  }
  /* ============================================================
     HALAMAN MATERI SEMUA JENJANG (#/materi)
     Menampilkan seluruh isi bab SD → Kuliah untuk DIBACA LANGSUNG
     di halaman (tanpa mengunduh .txt). Hanya bab yang dipilih yang
     dirender (lazily) supaya halaman tetap ringan.
     ============================================================ */
  const MAT_GRUP = [
    { key: "sd", code: "mini", label: "SD / MI", ikon: "i-game" },
    { key: "smp", code: "muda", label: "SMP / MTs", ikon: "i-compass" },
    { key: "sma", code: "mahir", label: "SMA", ikon: "i-bolt" },
    { key: "smk", code: "mahir", label: "SMK", ikon: "i-toolbox" },
    { key: "kuliah", code: "tinggi", label: "Perguruan Tinggi", ikon: "i-rocket" }
  ];
  /* mapel satu jenjang = data bawaan (data-sd/smp/sma/smk/kuliah.js)
     + mapel tambahan buatan tenaga pendidik di ruang pembawanya */
  function materiGrup(key) {
    const g = MAT_GRUP.find(x => x.key === key);
    const d = DATA()[key];
    const out = ((d && d.mapel) || []).map(m =>
      Object.assign({}, m, { _srcLabel: (d.jenjang || d.label || "") }));
    if (g) mapelCustom(g.code).forEach(m =>
      out.push(Object.assign({}, m, { _srcLabel: "Tambahan Ruang" })));
    return out;
  }
  function materiCocok(m, q) {
    if (!q) return true;
    const s = q.toLowerCase();
    if (String(m.nama || "").toLowerCase().indexOf(s) > -1) return true;
    if (String(m.ringkas || "").toLowerCase().indexOf(s) > -1) return true;
    return (m.bab || []).some(b =>
      String(b.judul || "").toLowerCase().indexOf(s) > -1 ||
      String(b.ringkas || "").toLowerCase().indexOf(s) > -1);
  }
  /* daftar hasil level-1 (diperbarui saat mengetik / mengganti jenjang) */
  function materiHasilHTML() {
    const cari = (M.cari || "").trim().toLowerCase();
    const grup = MAT_GRUP.filter(g => M.jen === "semua" || g.key === M.jen);
    let html = "", nMapel = 0, nBab = 0;
    grup.forEach(g => {
      const list = materiGrup(g.key).filter(m => materiCocok(m, cari));
      if (!list.length) return;
      const bab = list.reduce((a, m) => a + (m.bab ? m.bab.length : 0), 0);
      nMapel += list.length; nBab += bab;
      html += '<section class="mx-grup">' +
        '<div class="mx-grup-head"><span class="li-ico">' + ikon(g.ikon) + '</span>' +
        '<span class="li-body"><b>' + esc(g.label) + '</b><small>' + list.length +
        ' mata pelajaran · ' + bab + ' bab</small></span></div>' +
        '<div class="stack">' + list.map(m =>
          '<button class="list-item" data-mx-mapel="' + esc(m.id) + '" data-mx-code="' + esc(g.code) + '">' +
          '<span class="li-ico">' + ikon(m.ikon || "i-books") + '</span>' +
          '<span class="li-body"><b>' + esc(m.nama) +
          (m._srcLabel ? ' <span class="chip" style="font-size:.62rem">' + esc(m._srcLabel) + '</span>' : '') + '</b>' +
          '<small>' + esc(m.ringkas || "") + '</small></span>' +
          '<span class="li-end">' + (m.bab ? m.bab.length : 0) + ' bab ' + ikon("i-arrow") + '</span></button>').join("") +
        '</div></section>';
    });
    if (!html) html = '<div class="empty"><span class="e-ico">' + ikon("i-search") +
      '</span><b>Tidak ada materi yang cocok</b><span>Coba kata kunci lain, misalnya "Ekosistem" atau "Trigonometri".</span></div>';
    return '<p class="mx-ringkas">' + nMapel + ' mata pelajaran · ' + nBab + ' bab siap dibaca langsung</p>' + html;
  }

  function viewMateriJenjang() {
    /* ---- level 3: baca isi bab (hanya bab terpilih yang dirender) ---- */
    if (M.mapelId && M.babId) {
      const m = semuaMapel(M.code).find(x => x.id === M.mapelId);
      const b = m ? (m.bab || []).find(x => x.id === M.babId) : null;
      if (!m || !b) { M.mapelId = null; M.babId = null; }
      else {
        const no = (m.bab || []).indexOf(b) + 1;
        const jen = m._srcLabel || (MAT_GRUP.filter(g => g.code === M.code)[0] || {}).label || "";
        return '<div class="wrap" style="padding:46px 0 70px">' +
          '<div class="mx-head"><span class="sec-tag">' + ikon("i-books") + ' Membaca Materi</span>' +
          '<h1>' + esc(b.judul) + '</h1>' +
          '<p>' + esc(m.nama) + ' · Bab ' + no + ' dari ' + (m.bab || []).length +
          ' · ditampilkan langsung di halaman tanpa mengunduh berkas.</p>' +
          '<div class="mx-act">' +
          '<button class="btn btn-ghost btn-sm" id="mxKembali">' + ikon("i-arrow") + ' Daftar bab ' + esc(m.nama) + '</button>' +
          '<button class="btn btn-soft btn-sm" id="mxKeMapel">' + ikon("i-books") + ' Semua mata pelajaran</button>' +
          '</div></div>' +
          '<article class="material">' +
          '<div class="m-meta"><span class="chip brand">' + esc(m.nama) + '</span>' +
          '<span class="chip">' + esc(jen) + '</span>' +
          (b.soal && b.soal.length ? '<span class="chip cyan">' + b.soal.length + ' latihan tersedia</span>' : '') + '</div>' +
          '<h2>' + esc(b.judul) + '</h2>' +
          '<div class="m-body">' + (b.materi || "<p>Materi bab ini sedang disiapkan tim Kuradapt.</p>") + '</div>' +
          '</article></div>';
      }
    }

    /* ---- level 2: daftar bab satu mata pelajaran ---- */
    if (M.mapelId) {
      const m = semuaMapel(M.code).find(x => x.id === M.mapelId);
      if (!m) { M.mapelId = null; }
      else {
        const jen = m._srcLabel || (MAT_GRUP.filter(g => g.code === M.code)[0] || {}).label || "Materi";
        return '<div class="wrap" style="padding:46px 0 70px">' +
          '<div class="mx-head"><span class="sec-tag">' + ikon(m.ikon || "i-books") + ' ' + esc(jen) + '</span>' +
          '<h1>' + esc(m.nama) + '</h1>' +
          '<p>' + esc(m.ringkas || "") + ' — pilih bab untuk mulai membaca.</p>' +
          '<div class="mx-act"><button class="btn btn-ghost btn-sm" id="mxKeMapel">' +
          ikon("i-arrow") + ' Semua mata pelajaran</button></div></div>' +
          '<div class="stack">' + ((m.bab || []).length ? (m.bab || []).map((b, i) =>
            '<button class="list-item" data-mx-bab="' + esc(b.id) + '">' +
            '<span class="li-ico">' + (i + 1) + '</span>' +
            '<span class="li-body"><b>' + esc(b.judul) + '</b><small>' + esc(b.ringkas || "") + '</small></span>' +
            '<span class="li-end">' + (b.soal ? b.soal.length + ' soal' : '') + ' ' + ikon("i-arrow") + '</span></button>').join("") :
            '<div class="empty"><span class="e-ico">' + ikon("i-books") + '</span><b>Belum ada bab</b><span>Materi pelajaran ini sedang disiapkan pengajar.</span></div>') +
          '</div></div>';
      }
    }

    /* ---- level 1: semua jenjang ---- */
    const chips = '<div class="mx-chips">' +
      '<button class="chip mx-chip' + (M.jen === "semua" ? " on" : "") + '" data-mx-jen="semua">Semua Jenjang</button>' +
      MAT_GRUP.map(g => '<button class="chip mx-chip' + (M.jen === g.key ? " on" : "") +
        '" data-mx-jen="' + g.key + '">' + esc(g.label) + '</button>').join("") + '</div>';
    return '<div class="wrap" style="padding:46px 0 70px">' +
      '<div class="mx-head"><span class="sec-tag">' + ikon("i-brain") + ' Materi Belajar</span>' +
      '<h1>Materi Semua Jenjang</h1>' +
      '<p>Seluruh isi bab dari SD hingga Perguruan Tinggi — dibaca langsung di halaman ini, tanpa mengunduh berkas .txt.</p>' +
      chips +
      '<div class="mx-cari"><span class="inp-wrap">' + ikon("i-search") +
      '<input id="mxCari" placeholder="Cari judul bab atau mata pelajaran..." value="' + esc(M.cari || "") + '" autocomplete="off"></span></div>' +
      '</div>' +
      '<div id="mxHasil">' + materiHasilHTML() + '</div></div>';
  }

  function pascaMateriJenjang() {
    const render = () => {
      const v = document.getElementById("view");
      if (!v) return;
      v.innerHTML = viewMateriJenjang(); pascaMateriJenjang();
    };
    const bindHasil = () => {
      document.querySelectorAll("[data-mx-mapel]").forEach(b => b.onclick = () => {
        M.code = b.dataset.mxCode; M.mapelId = b.dataset.mxMapel; M.babId = null; render();
      });
      document.querySelectorAll("[data-mx-bab]").forEach(b => b.onclick = () => {
        M.babId = b.dataset.mxBab; render();
      });
    };
    document.querySelectorAll("[data-mx-jen]").forEach(b => b.onclick = () => {
      M.jen = b.dataset.mxJen; render();
    });
    const inp = document.getElementById("mxCari");
    if (inp) inp.oninput = () => {
      M.cari = inp.value;
      const h = document.getElementById("mxHasil");
      if (h) { h.innerHTML = materiHasilHTML(); bindHasil(); }   /* fokus input tidak terganggu */
    };
    bindHasil();
    const k1 = document.getElementById("mxKembali");
    if (k1) k1.onclick = () => { M.babId = null; render(); };
    const k2 = document.getElementById("mxKeMapel");
    if (k2) k2.onclick = () => { M.mapelId = null; M.babId = null; render(); };
  }

  function viewPerpustakaan() {
    const s = sesi();
    const boleh = bisaTulis(s, jenjangSaya(s)[0] || "mahir") || ["admin", "super", "operator"].indexOf(s.peran) > -1;
    const semua = semuaBuku();
    /* ---- MODE BACA: buku terpilih ditampilkan penuh di halaman ---- */
    if (BK.id) {
      const buku = semua.find(x => x.id === BK.id);
      if (!buku) BK.id = null;
      else {
        const jen = buku.jenjang === "semua" ? "Semua jenjang" : (JENJANG[buku.jenjang] ? JENJANG[buku.jenjang].nama : buku.jenjang);
        return '<div class="wrap" style="padding:46px 0 70px">' +
          '<div class="mx-head"><span class="sec-tag">' + ikon("i-eye") + ' Mode Baca — Perpustakaan Digital</span>' +
          '<h1>' + esc(buku.judul) + '</h1>' +
          '<p>' + esc(buku.penulis) + ' · ' + esc(buku.kategori) + ' · ' + esc(jen) +
          ' — dibaca langsung di halaman, tanpa mengunduh berkas.</p>' +
          '<div class="mx-act"><button class="btn btn-ghost btn-sm" id="bkKembali">' +
          ikon("i-arrow") + ' Kembali ke daftar buku</button></div></div>' +
          '<article class="material"><div class="m-meta">' +
          '<span class="chip brand">' + esc(buku.kategori) + '</span>' +
          '<span class="chip">' + esc(jen) + '</span>' +
          '<span class="chip cyan">' + esc(buku.penulis) + '</span></div>' +
          '<h2>' + esc(buku.judul) + '</h2>' +
          '<div class="m-body bk-isi">' + esc(buku.isi) + '</div>' +
          '</article></div>';
      }
    }
    return '<div class="wrap" style="padding:46px 0 70px">' +
      '<div class="pick-head"><span class="sec-tag">' + ikon("i-books") + ' Perpustakaan Digital</span>' +
      '<h1>Buku & Modul Gratis</h1>' +
      '<p>' + semua.length + ' judul buku digital — dibaca langsung di halaman tanpa unduh. Tenaga pendidik dapat menambah judul baru.</p></div>' +
      (boleh ? '<div class="compose"><h3>' + ikon("i-plus") + ' Tambah Judul Buku</h3>' +
        '<div class="row"><div class="field"><label for="bkJudul">Judul</label><span class="inp-wrap">' + ikon("i-flag") +
        '<input id="bkJudul" placeholder="Contoh: Modul Praktikum Terpadu"></span></div>' +
        '<div class="field"><label for="bkPenulis">Penulis / Pengajar</label><span class="inp-wrap">' + ikon("i-user") +
        '<input id="bkPenulis" placeholder="Nama penulis"></span></div>' +
        '<div class="field"><label for="bkKategori">Kategori</label><span class="inp-wrap">' + ikon("i-folder") +
        '<select id="bkKategori"><option>Panduan</option><option>Matematika</option><option>Sains</option><option>Teknologi</option><option>Vokasi</option><option>Akademik</option><option>Bimbingan</option><option>Proyek</option></select></span></div>' +
        '<div class="field"><label for="bkJenjang">Jenjang</label><span class="inp-wrap">' + ikon("i-compass") +
        '<select id="bkJenjang"><option value="semua">Semua jenjang</option>' + URUT.map(c => '<option value="' + c + '">' + JENJANG[c].nama + '</option>').join("") + '</select></span></div></div>' +
        '<div class="field"><label for="bkRingkas">Ringkasan</label><span class="inp-wrap">' + ikon("i-pen") +
        '<input id="bkRingkas" placeholder="Satu kalimat ringkasan buku"></span></div>' +
        '<div class="field"><label for="bkIsi">Isi / deskripsi</label><textarea id="bkIsi" rows="4" placeholder="Tulis isi atau deskripsi buku..."></textarea></div>' +
        '<button class="btn btn-primary" id="bkTambah">' + ikon("i-plus") + ' Simpan Judul</button></div>' : '') +
      '<div class="stack" style="margin-top:20px">' + (semua.length ? semua.map(b =>
        '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon("i-books") + '</span>' +
        '<span class="li-body"><b>' + esc(b.judul) + '</b><small>' + esc(b.penulis) + ' · ' + esc(b.kategori) + ' · ' +
        esc(b.jenjang === "semua" ? "Semua jenjang" : (JENJANG[b.jenjang] ? JENJANG[b.jenjang].nama : b.jenjang)) + '</small>' +
        '<small style="color:var(--muted)">' + esc(b.ringkas || "") + '</small></span>' +
        '<span class="li-end"><button class="btn btn-sm btn-soft" data-baca="' + esc(b.id) + '">' + ikon("i-eye") + ' Baca</button>' +
        (boleh ? '<button class="btn btn-sm btn-danger" data-hapus-buku="' + esc(b.id) + '">' + ikon("i-trash") + '</button>' : '') +
        '</span></div>').join("") :
        '<div class="empty"><span class="e-ico">' + ikon("i-books") + '</span><b>Belum ada buku</b><span>Tambahkan judul pertama lewat formulir di atas.</span></div>') + '</div></div>';
  }
  function pascaPerpustakaan() {
    const tambah = document.getElementById("bkTambah");
    if (tambah) tambah.onclick = () => {
      const judul = (document.getElementById("bkJudul").value || "").trim();
      const penulis = (document.getElementById("bkPenulis").value || "").trim();
      const ringkas = (document.getElementById("bkRingkas").value || "").trim();
      const isi = (document.getElementById("bkIsi").value || "").trim();
      if (judul.length < 3 || isi.length < 10) { toast(ikon("i-warn") + " Judul & isi buku belum lengkap", "no"); return; }
      tambahBuku({
        id: uid("bk"), judul, penulis: penulis || sesi().nama,
        kategori: document.getElementById("bkKategori").value,
        jenjang: document.getElementById("bkJenjang").value,
        ringkas, isi, tgl: new Date().toISOString()
      });
      siarkan();
      toast(ikon("i-check") + " Judul <b>" + esc(judul) + "</b> masuk perpustakaan");
      terapkanRute();
    };
    /* render ulang lokal — mereset rute akan mengembalikan daftar judul */
    const gambarBaca = () => {
      const v = document.getElementById("view");
      if (v) { v.innerHTML = viewPerpustakaan(); pascaPerpustakaan(); }
    };
    document.querySelectorAll("[data-baca]").forEach(b => b.onclick = () => {
      const buku = semuaBuku().find(x => x.id === b.dataset.baca);
      if (!buku) return;
      BK.id = buku.id;                 /* baca langsung di halaman (tanpa modal & tanpa unduh) */
      gambarBaca();
      window.scrollTo({ top: 0 });
    });
    const bkKembali = document.getElementById("bkKembali");
    if (bkKembali) bkKembali.onclick = () => { BK.id = null; gambarBaca(); };
    document.querySelectorAll("[data-hapus-buku]").forEach(b => b.onclick = () => {
      const buku = semuaBuku().find(x => x.id === b.dataset.hapusBuku);
      if (!buku) return;
      bukaModal(mHead("i-warn", "Hapus judul buku?") +
        '<div class="modal-body"><p>Buku <b>' + esc(buku.judul) + '</b> akan dihapus dari perpustakaan.</p>' +
        '<div class="wiz-foot"><button class="btn btn-ghost" data-tutup>Batal</button><button class="btn btn-danger" id="okHapusBuku">Hapus</button></div></div>');
      document.getElementById("okHapusBuku").onclick = () => {
        hapusBuku(buku.id); tutupModal(); siarkan();
        toast(ikon("i-trash") + " Buku dihapus"); terapkanRute();
      };
    });
  }
  /* Catatan: tombol "Unduh .txt" dihapus — buku kini dibaca langsung
     di halaman (mode baca, lihat viewPerpustakaan/BK.id). */
  /* ---------------- Kurikulum (ber-versi & ber-periode — riwayat tidak hilang) ---------------- */
  function seedKurikulum() {
    return [
      { id: "kk1", jenjang: "mini", judul: "Kurikulum Merdeka", versi: "v1.0", periode: "2022/2023", status: "diganti", catatan: "Fase A–C, pembelajaran berbasis proyek sederhana.", tgl: "2022-07-01T08:00:00.000Z" },
      { id: "kk2", jenjang: "mini", judul: "Kurikulum Merdeka", versi: "v2.0", periode: "2024/2025", status: "berlaku", catatan: "Penyempurnaan capaian pembelajaran Fase A–C.", tgl: "2024-07-01T08:00:00.000Z" },
      { id: "kk3", jenjang: "muda", judul: "Kurikulum Merdeka", versi: "v1.0", periode: "2022/2023", status: "diganti", catatan: "Fase D–E, peminatan awal minat bakat.", tgl: "2022-07-01T08:00:00.000Z" },
      { id: "kk4", jenjang: "muda", judul: "Kurikulum Merdeka", versi: "v2.1", periode: "2024/2025", status: "berlaku", catatan: "Penguatan literasi & numerasi, asesmen formatif.", tgl: "2024-07-01T08:00:00.000Z" },
      { id: "kk5", jenjang: "mahir", judul: "Kurikulum Merdeka", versi: "v1.0", periode: "2022/2023", status: "diganti", catatan: "Fase F, link & match dengan dunia kerja.", tgl: "2022-07-01T08:00:00.000Z" },
      { id: "kk6", jenjang: "mahir", judul: "Kurikulum Merdeka", versi: "v2.2", periode: "2024/2025", status: "berlaku", catatan: "Penguatan project-based learning & sertifikasi kompetensi.", tgl: "2024-07-01T08:00:00.000Z" },
      { id: "kk7", jenjang: "tinggi", judul: "Kurikulum Program Studi", versi: "v1.0", periode: "2022/2023", status: "diganti", catatan: "Kurikulum berbasis kompetensi lulusan.", tgl: "2022-07-01T08:00:00.000Z" },
      { id: "kk8", jenjang: "tinggi", judul: "Kurikulum Program Studi", versi: "v2.0", periode: "2024/2025", status: "berlaku", catatan: "Kurikulum merdeka kampus, MBKM & magang terintegrasi.", tgl: "2024-07-01T08:00:00.000Z" }
    ];
  }
  function semuaKurikulum() {
    /* gabung seed + riwayat custom per-ID (meniru semuaPengumuman):
       salinan seed yang diubah menimpa seed aslinya — tidak ada baris dobel,
       status "berlaku" selalu tunggal per jenjang+judul */
    const byId = {};
    seedKurikulum().forEach(k => { byId[k.id] = k; });
    lsGet(K.kurikulum, []).forEach(k => {
      if (k.dihapus) delete byId[k.id];
      else byId[k.id] = Object.assign(byId[k.id] || {}, k);
    });
    return Object.keys(byId).map(id => byId[id]);
  }
  function kurikulumJenjang(code) {
    return semuaKurikulum().filter(k => k.jenjang === code).sort((a, b) => new Date(b.tgl) - new Date(a.tgl));
  }
  function tambahKurikulum(k) {
    const semua = lsGet(K.kurikulum, []);
    semua.push(k); lsSet(K.kurikulum, semua);
    catatLog("kurikulum", "Versi kurikulum ditambahkan: " + k.judul + " " + k.versi + " (" + k.periode + ")");
  }
  function jadikanBerlaku(id) {
    /* versi lama TIDAK dihapus — statusnya menjadi "diganti" (riwayat tetap ada) */
    const semua = semuaKurikulum();
    const target = semua.find(k => k.id === id);
    if (!target) return;
    const lain = semua.filter(k => k.jenjang === target.jenjang && k.judul === target.judul && k.id !== id && k.status === "berlaku");
    const custom = lsGet(K.kurikulum, []);
    lain.forEach(k => {
      if (k.id.indexOf("kk") === 0) { /* seed: salin ke penyimpanan lalu tandai */ custom.push(Object.assign({}, k, { status: "diganti" })); }
      else { const i = custom.findIndex(x => x.id === k.id); if (i > -1) custom[i].status = "diganti"; }
    });
    if (target.id.indexOf("kk") === 0) custom.push(Object.assign({}, target, { status: "berlaku" }));
    else { const i = custom.findIndex(x => x.id === id); if (i > -1) custom[i].status = "berlaku"; }
    lsSet(K.kurikulum, custom);
    catatLog("kurikulum", "Kurikulum berlaku → " + target.judul + " " + target.versi + " (" + target.periode + ")");
  }
  function viewKurikulum() {
    const s = sesi();
    const boleh = bisaTulis(s, jenjangSaya(s)[0] || "mahir") || ["admin", "super", "operator"].indexOf(s.peran) > -1;
    const jenjangSayaList = jenjangSaya(s);
    const pilihAwal = jenjangSayaList[0] || "mini";
    const daftar = URUT.map(c =>
      '<button class="btn btn-sm ' + (c === pilihAwal ? "btn-primary" : "btn-ghost") + '" data-kur-j="' + c + '">' + esc(JENJANG[c].nama) + '</button>').join("");
    const tampil = code => {
      const list = kurikulumJenjang(code);
      const berlaku = list.find(k => k.status === "berlaku");
      return (berlaku ? '<div class="form-note" style="margin-bottom:14px">' + ikon("i-check") + ' Berlaku saat ini: <b>' +
        esc(berlaku.judul + " " + berlaku.versi) + '</b> · periode ' + esc(berlaku.periode) + '</div>' : '') +
        '<div class="stack">' + (list.length ? list.map(k =>
          '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon(k.status === "berlaku" ? "i-check" : "i-scroll") + '</span>' +
          '<span class="li-body"><b>' + esc(k.judul) + ' — ' + esc(k.versi) + '</b><small>Periode ' + esc(k.periode) + ' · ' + esc(k.catatan || "") + '</small></span>' +
          '<span class="li-end"><span class="chip ' + (k.status === "berlaku" ? "brand" : "") + '">' + esc(k.status) + '</span>' +
          (boleh && k.status !== "berlaku" ? '<button class="btn btn-sm btn-soft" data-berlaku="' + esc(k.id) + '">' + ikon("i-check") + ' Jadikan Berlaku</button>' : '') +
          '</span></div>').join("") :
          '<div class="empty"><span class="e-ico">' + ikon("i-scroll") + '</span><b>Belum ada kurikulum</b></div>') + '</div>';
    };
    return '<div class="wrap" style="padding:46px 0 70px">' +
      '<div class="pick-head"><span class="sec-tag">' + ikon("i-scroll") + ' Sistem Kurikulum</span>' +
      '<h1>Kurikulum Ber-versi & Ber-periode</h1>' +
      '<p>Setiap perubahan kurikulum memakai versi dan periode penerapan — riwayat kurikulum sebelumnya tetap tersimpan.</p></div>' +
      '<div class="q-nav" style="justify-content:flex-start;max-width:none" id="kurFilter">' + daftar + '</div>' +
      (boleh ? '<div class="compose" style="margin-top:18px"><h3>' + ikon("i-plus") + ' Tambah Versi Kurikulum</h3>' +
        '<div class="row"><div class="field"><label for="kurJudul">Nama kurikulum</label><span class="inp-wrap">' + ikon("i-flag") +
        '<input id="kurJudul" placeholder="Contoh: Kurikulum Merdeka"></span></div>' +
        '<div class="field"><label for="kurVersi">Versi</label><span class="inp-wrap">' + ikon("i-scroll") +
        '<input id="kurVersi" placeholder="v2.3"></span></div>' +
        '<div class="field"><label for="kurPeriode">Periode penerapan</label><span class="inp-wrap">' + ikon("i-calendar") +
        '<input id="kurPeriode" placeholder="2026/2027"></span></div>' +
        '<div class="field"><label for="kurJenjang">Jenjang</label><span class="inp-wrap">' + ikon("i-compass") +
        '<select id="kurJenjang">' + jenjangSayaList.map(c => '<option value="' + c + '">' + JENJANG[c].nama + '</option>').join("") + '</select></span></div></div>' +
        '<div class="field"><label for="kurCatatan">Catatan perubahan</label><span class="inp-wrap">' + ikon("i-pen") +
        '<input id="kurCatatan" placeholder="Ringkasan isi/perubahan kurikulum"></span></div>' +
        '<button class="btn btn-primary" id="kurTambah">' + ikon("i-plus") + ' Simpan Versi Baru</button> ' +
        '<span class="chip brand">' + ikon("i-refresh") + ' Versi lama otomatis jadi riwayat (tidak terhapus)</span></div>' : '') +
      '<div id="kurIsi" data-j="' + pilihAwal + '" style="margin-top:20px">' + tampil(pilihAwal) + '</div></div>';
  }
  function pascaKurikulum() {
    const tampil = code => {
      const isi = document.getElementById("kurIsi");
      if (!isi) return;
      isi.dataset.j = code;
      const s = sesi();
      const boleh = bisaTulis(s, code) || ["admin", "super", "operator"].indexOf(s.peran) > -1;
      const list = kurikulumJenjang(code);
      const berlaku = list.find(k => k.status === "berlaku");
      isi.innerHTML = (berlaku ? '<div class="form-note" style="margin-bottom:14px">' + ikon("i-check") + ' Berlaku saat ini: <b>' +
        esc(berlaku.judul + " " + berlaku.versi) + '</b> · periode ' + esc(berlaku.periode) + '</div>' : '') +
        '<div class="stack">' + (list.length ? list.map(k =>
          '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon(k.status === "berlaku" ? "i-check" : "i-scroll") + '</span>' +
          '<span class="li-body"><b>' + esc(k.judul) + ' — ' + esc(k.versi) + '</b><small>Periode ' + esc(k.periode) + ' · ' + esc(k.catatan || "") + '</small></span>' +
          '<span class="li-end"><span class="chip ' + (k.status === "berlaku" ? "brand" : "") + '">' + esc(k.status) + '</span>' +
          (boleh && k.status !== "berlaku" ? '<button class="btn btn-sm btn-soft" data-berlaku="' + esc(k.id) + '">' + ikon("i-check") + ' Jadikan Berlaku</button>' : '') +
          '</span></div>').join("") :
          '<div class="empty"><span class="e-ico">' + ikon("i-scroll") + '</span><b>Belum ada kurikulum</b></div>') + '</div>';
      isi.querySelectorAll("[data-berlaku]").forEach(b => b.onclick = () => {
        jadikanBerlaku(b.dataset.berlaku);
        siarkan();
        toast(ikon("i-check") + " Versi kurikulum dijadikan <b>berlaku</b> — riwayat lama tetap tersimpan");
        tampil(code);
      });
    };
    document.querySelectorAll("[data-kur-j]").forEach(b => b.onclick = () => {
      document.querySelectorAll("[data-kur-j]").forEach(x => { x.classList.remove("btn-primary"); x.classList.add("btn-ghost"); });
      b.classList.add("btn-primary"); b.classList.remove("btn-ghost");
      tampil(b.dataset.kurJ);
    });
    const isi = document.getElementById("kurIsi");
    if (isi && isi.dataset.j) tampil(isi.dataset.j);
    const tambah = document.getElementById("kurTambah");
    if (tambah) tambah.onclick = () => {
      const judul = (document.getElementById("kurJudul").value || "").trim();
      const versi = (document.getElementById("kurVersi").value || "").trim();
      const periode = (document.getElementById("kurPeriode").value || "").trim();
      const catatan = (document.getElementById("kurCatatan").value || "").trim();
      const code = document.getElementById("kurJenjang").value;
      if (judul.length < 3 || versi.length < 1 || periode.length < 4) { toast(ikon("i-warn") + " Lengkapi nama, versi, dan periode", "no"); return; }
      /* versi berikutnya otomatis berlaku; versi sebelumnya pada judul sama menjadi riwayat */
      const baruId = uid("kv");
      tambahKurikulum({ id: baruId, jenjang: code, judul, versi, periode, catatan, status: "berlaku", tgl: new Date().toISOString() });
      jadikanBerlaku(baruId);
      siarkan();
      toast(ikon("i-check") + " Kurikulum <b>" + esc(judul + " " + versi) + "</b> tersimpan & berlaku");
      tampil(code);
    };
  }
  /* ---------------- Pertemuan Online (jadwal + tautan konferensi) ---------------- */
  function semuaJadwal() { return lsGet(K.jadwal, []).filter(j => !j.dihapus); }
  function jadwalRuang(code) { return semuaJadwal().filter(j => j.jenjang === code); }
  function buatJadwal(j) {
    /* penjaga keamanan: tautan wajib http(s) — skema javascript:/data:/skema
       lain ditolak di sini (bukan hanya di tombol Gabung) supaya tidak ada
       jadwal berbahaya yang tersimpan walau lewat panggilan API */
    if (!j || !/^https?:\/\/[^\s"'<>]+$/i.test(String(j.tautan || ""))) {
      catatInsiden("Tautan ditolak", "Jadwal '" + String((j && j.judul) || "-") + "' tidak disimpan — tautan bukan http(s): " + String((j && j.tautan) || "").slice(0, 60), "sedang");
      return false;
    }
    const semua = lsGet(K.jadwal, []);
    semua.push(j); lsSet(K.jadwal, semua);
    catatLog("pertemuan", "Jadwal pertemuan online dibuat: " + j.judul + " (" + j.platform + ")");
    kirimNotif({
      tipe: "jadwal", judul: "Jadwal pertemuan: " + (j.judul || "Rapat"),
      pesan: (j.pembuat || "Tenaga pendidik") + " menjadwalkan pertemuan " + (j.platform || "online") +
        " — kode undangan " + (j.kode || "-") + ".",
      ke: "*", jenjang: [j.jenjang], dari: j.pembuat, rujuk: "#/r/" + j.jenjang
    });
    return true;
  }
  function hapusJadwal(id) {
    const semua = lsGet(K.jadwal, []);
    const i = semua.findIndex(j => j.id === id);
    if (i > -1) semua[i].dihapus = true;
    lsSet(K.jadwal, semua);
    catatLog("pertemuan", "Jadwal pertemuan online dihapus: " + id);
  }
  const PLATFORM = ["Zoom", "Google Meet", "Microsoft Teams", "WhatsApp Call", "Lainnya"];
  function statusJadwal(j) {
    const t = new Date(j.waktu).toISOString ? new Date(j.waktu).getTime() : NaN;
    if (isNaN(t)) return ["akan", "Terjadwal"];
    if (t > Date.now()) return ["akan", "Akan datang"];
    if (Date.now() - t < (j.durasi || 60) * 60000) return ["live", "Berlangsung"];
    return ["selesai", "Selesai"];
  }
  function kartuJadwal(j, s) {
    const st = statusJadwal(j);
    const bolehKelola = bisaTulis(s, j.jenjang) || ["admin", "super"].indexOf(s.peran) > -1;
    const t = new Date(j.waktu);
    return '<article class="kg-card ' + st[0] + '" data-jd="' + esc(j.id) + '">' +
      '<div class="kg-top"><span class="kg-status ' + st[0] + '">' + ikon(st[0] === "live" ? "i-signal" : st[0] === "akan" ? "i-clock" : "i-check") + st[1] + '</span>' +
      '<span class="chip">' + ikon("i-link") + esc(j.platform) + '</span></div>' +
      '<h3>' + esc(j.judul) + '</h3>' +
      '<div class="kg-meta">' +
      '<span>' + ikon("i-calendar") + (isNaN(t.getTime()) ? "-" : tglIndo(j.waktu)) + '</span>' +
      '<span>' + ikon("i-clock") + (isNaN(t.getTime()) ? "-" : t.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })) + ' · ' + (j.durasi || 60) + ' menit</span>' +
      '<span>' + ikon("i-user") + esc(j.pembuat) + '</span></div>' +
      '<div class="kg-meta"><span>' + ikon("i-lock") + 'Kode undangan: <b class="kode-undangan">' + esc(j.kode) + '</b></span></div>' +
      '<div class="kg-act">' +
      (s ? '<button class="btn btn-primary btn-sm" data-gabung-jd="' + esc(j.id) + '">' + ikon("i-link") + ' Gabung Pertemuan</button>' : '') +
      (bolehKelola ? '<button class="btn btn-danger btn-sm" data-hapus-jd="' + esc(j.id) + '">' + ikon("i-trash") + '</button>' : '') +
      '</div></article>';
  }
  /* ---------------- Koneksi Dunia Industri (pelatihan, magang, lowongan) ---------------- */
  function semuaPosting() { return lsGet(K.industri, []).filter(p => !p.dihapus); }
  function postingRuang(code) {
    return semuaPosting().filter(p => p.jenjang === "semua" || p.jenjang === code);
  }
  function tambahPosting(p) {
    const semua = lsGet(K.industri, []);
    semua.push(p); lsSet(K.industri, semua);
    catatLog("industri", "Info industri diterbitkan: [" + p.jenis + "] " + p.judul);
  }
  function hapusPosting(id) {
    const semua = lsGet(K.industri, []);
    const p = semua.find(x => x.id === id);
    if (p) p.dihapus = true;
    lsSet(K.industri, semua);
    catatLog("industri", "Info industri dihapus: " + id);
  }
  function ajukanMagang(id, s) {
    const semua = lsGet(K.industri, []);
    const p = semua.find(x => x.id === id);
    if (!p) return;
    p.pendaftar = p.pendaftar || [];
    if (!p.pendaftar.some(x => x.email === s.email)) {
      p.pendaftar.push({ email: s.email, nama: s.nama, status: "menunggu", tgl: new Date().toISOString() });
      lsSet(K.industri, semua);
      catatLog("industri", "Pendaftar magang/lowongan: " + s.email + " → " + p.judul);
    }
  }
  function setujuiPendaftar(id, email, setuju) {
    const semua = lsGet(K.industri, []);
    const p = semua.find(x => x.id === id);
    if (!p || !p.pendaftar) return;
    const f = p.pendaftar.find(x => x.email === email);
    if (f) { f.status = setuju ? "diizinkan" : "ditolak"; lsSet(K.industri, semua); }
    catatLog("industri", (setuju ? "Izin akses diberikan: " : "Izin akses ditolak: ") + email + " → " + p.judul);
  }
  const JENIS_INDUSTRI = ["Pelatihan", "Magang", "Lowongan Kerja", "Pembinaan Keterampilan"];
  function viewIndustri() {
    const s = sesi();
    const boleh = bisaTulis(s, jenjangSaya(s)[0] || "mahir") || ["admin", "super"].indexOf(s.peran) > -1;
    const list = semuaPosting();
    const statusSaya = p => (p.pendaftar || []).find(x => x.email === s.email);
    return '<div class="wrap" style="padding:46px 0 70px">' +
      '<div class="pick-head"><span class="sec-tag">' + ikon("i-building") + ' Koneksi Dunia Industri</span>' +
      '<h1>Pelatihan, Magang & Lowongan</h1>' +
      '<p>Mitra industri membagikan informasi kesempatan kerja; peserta mengajukan izin akses, mitra menyetujui.</p></div>' +
      (boleh ? '<div class="compose"><h3>' + ikon("i-plus") + ' Terbitkan Informasi Industri</h3>' +
        '<div class="row"><div class="field"><label for="inJudul">Judul</label><span class="inp-wrap">' + ikon("i-flag") +
        '<input id="inJudul" placeholder="Contoh: Magang Frontend Developer 2026"></span></div>' +
        '<div class="field"><label for="inJenis">Jenis</label><span class="inp-wrap">' + ikon("i-building") +
        '<select id="inJenis">' + JENIS_INDUSTRI.map(j => '<option>' + j + '</option>').join("") + '</select></span></div>' +
        '<div class="field"><label for="inJenjang">Target jenjang</label><span class="inp-wrap">' + ikon("i-compass") +
        '<select id="inJenjang"><option value="semua">Semua jenjang</option>' + URUT.map(c => '<option value="' + c + '">' + JENJANG[c].nama + '</option>').join("") + '</select></span></div>' +
        '<div class="field"><label for="inPerusahaan">Nama perusahaan</label><span class="inp-wrap">' + ikon("i-building") +
        '<input id="inPerusahaan" placeholder="PT / CV / Institusi"></span></div></div>' +
        '<div class="field"><label for="inIsi">Deskripsi & persyaratan</label><textarea id="inIsi" rows="4" placeholder="Jelaskan kegiatan, durasi, persyaratan, dan cara mendaftar..."></textarea></div>' +
        '<button class="btn btn-primary" id="inTambah">' + ikon("i-plus") + ' Terbitkan</button> ' +
        '<span class="chip brand">' + ikon("i-users") + ' Peserta mengajukan izin akses di kartu</span></div>' : '') +
      '<div class="stack" style="margin-top:20px">' + (list.length ? list.map(p => {
        const sd = statusSaya(p);
        const bisaKelola = boleh || p.email === s.email;
        return '<div class="list-item" style="cursor:default;align-items:flex-start"><span class="li-ico">' + ikon("i-building") + '</span>' +
          '<span class="li-body"><b>' + esc(p.judul) + '</b>' +
          '<small>' + esc(p.jenis) + ' · ' + esc(p.perusahaan) + ' · ' +
          esc(p.jenjang === "semua" ? "Semua jenjang" : (JENJANG[p.jenjang] ? JENJANG[p.jenjang].nama : p.jenjang)) +
          ' · ' + relatif(p.tgl) + '</small>' +
          '<small style="color:var(--muted);white-space:normal">' + esc(p.isi) + '</small>' +
          ((p.pendaftar || []).length ? '<small>' + ikon("i-users") + ' ' + p.pendaftar.length + ' pendaftar · ' +
            p.pendaftar.filter(x => x.status === "diizinkan").length + ' diizinkan</small>' : '') + '</span>' +
          '<span class="li-end" style="flex-direction:column;align-items:flex-end;gap:6px">' +
          (s && !bisaKelola ? (sd
            ? '<span class="chip ' + (sd.status === "diizinkan" ? "green" : sd.status === "ditolak" ? "red" : "") + '">' +
              (sd.status === "diizinkan" ? "Izin diberikan" : sd.status === "ditolak" ? "Ditolak" : "Menunggu") + '</span>'
            : '<button class="btn btn-sm btn-primary" data-ajukan="' + esc(p.id) + '">' + ikon("i-hand") + ' Ajukan Izin</button>') : '') +
          (bisaKelola ? (p.email === s.email || ["admin", "super"].indexOf(s.peran) > -1
            ? '<button class="btn btn-sm btn-danger" data-hapus-in="' + esc(p.id) + '">' + ikon("i-trash") + '</button>' : '') +
            ((p.pendaftar || []).length ? '<button class="btn btn-sm btn-soft" data-pendaftar="' + esc(p.id) + '">' +
              ikon("i-users") + ' Kelola (' + p.pendaftar.length + ')</button>' : '') : '') +
          '</span></div>';
      }).join("") :
        '<div class="empty"><span class="e-ico">' + ikon("i-building") + '</span><b>Belum ada informasi industri</b>' +
        '<span>Mitra industri akan membagikan pelatihan, magang, dan lowongan di sini.</span></div>') + '</div></div>';
  }
  function pascaIndustri() {
    const tambah = document.getElementById("inTambah");
    if (tambah) tambah.onclick = () => {
      const judul = (document.getElementById("inJudul").value || "").trim();
      const perusahaan = (document.getElementById("inPerusahaan").value || "").trim();
      const isi = (document.getElementById("inIsi").value || "").trim();
      if (judul.length < 4 || perusahaan.length < 2 || isi.length < 10) { toast(ikon("i-warn") + " Lengkapi judul, perusahaan, dan deskripsi", "no"); return; }
      const s = sesi();
      tambahPosting({
        id: uid("in"), judul, perusahaan, isi,
        jenis: document.getElementById("inJenis").value,
        jenjang: document.getElementById("inJenjang").value,
        email: s.email, pembuat: s.nama, tgl: new Date().toISOString(), pendaftar: []
      });
      siarkan();
      toast(ikon("i-check") + " Informasi <b>terbit</b> — peserta bisa mengajukan izin akses");
      terapkanRute();
    };
    document.querySelectorAll("[data-ajukan]").forEach(b => b.onclick = () => {
      ajukanMagang(b.dataset.ajukan, sesi());
      siarkan();
      toast(ikon("i-hand") + " Pengajuan terkirim — <b>menunggu izin</b> mitra industri");
      terapkanRute();
    });
    document.querySelectorAll("[data-hapus-in]").forEach(b => b.onclick = () => {
      const p = semuaPosting().find(x => x.id === b.dataset.hapusIn);
      if (!p) return;
      bukaModal(mHead("i-warn", "Hapus informasi industri?") +
        '<div class="modal-body"><p>Informasi <b>' + esc(p.judul) + '</b> akan dihapus.</p>' +
        '<div class="wiz-foot"><button class="btn btn-ghost" data-tutup>Batal</button><button class="btn btn-danger" id="okHapusIn">Hapus</button></div></div>');
      document.getElementById("okHapusIn").onclick = () => {
        hapusPosting(p.id); tutupModal(); siarkan();
        toast(ikon("i-trash") + " Informasi dihapus"); terapkanRute();
      };
    });
    document.querySelectorAll("[data-pendaftar]").forEach(b => b.onclick = () => {
      const p = semuaPosting().find(x => x.id === b.dataset.pendaftar);
      if (!p) return;
      bukaModal(mHead("i-users", "Pendaftar — " + esc(p.judul)) +
        '<div class="modal-body"><div class="stack">' +
        ((p.pendaftar || []).length ? p.pendaftar.map(x =>
          '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon("i-user") + '</span>' +
          '<span class="li-body"><b>' + esc(x.nama) + '</b><small>' + esc(x.email) + ' · ' + esc(x.status) + '</small></span>' +
          '<span class="li-end">' +
          (x.status === "diizinkan" ? '<span class="chip green">diizinkan</span>' :
            '<button class="btn btn-sm btn-primary" data-izin="1" data-pe="' + esc(x.email) + '">' + ikon("i-check") + ' Izinkan</button>' +
            '<button class="btn btn-sm btn-ghost" data-tolak="1" data-pe="' + esc(x.email) + '">' + ikon("i-x") + '</button>') +
          '</span></div>').join("") : '<div class="empty"><b>Belum ada pendaftar</b></div>') +
        '</div><div class="wiz-foot"><button class="btn btn-ghost" data-tutup>Tutup</button></div></div>');
      document.querySelectorAll("[data-izin]").forEach(t => t.onclick = () => { setujuiPendaftar(p.id, t.dataset.pe, true); tutupModal(); siarkan(); toast(ikon("i-check") + " Izin akses diberikan"); terapkanRute(); });
      document.querySelectorAll("[data-tolak]").forEach(t => t.onclick = () => { setujuiPendaftar(p.id, t.dataset.pe, false); tutupModal(); siarkan(); toast(ikon("i-x") + " Pengajuan ditolak"); terapkanRute(); });
    });
  }
  /* ============================================================
     PANEL ADMIN SISTEM (#/admin) — seluruh jenjang
     ============================================================ */
  function viewAdmin() {
    const s = sesi();
    if (!s || ["admin", "super"].indexOf(s.peran) === -1) {
      return '<div class="wrap" style="padding:80px 0"><div class="empty"><span class="e-ico">' + ikon("i-lock") + '</span><b>Akses terbatas — hanya Admin Sistem</b></div></div>';
    }
    const superMode = s.peran === "super";
    const ann = semuaPengumuman();
    const kg = semuaKegiatan();
    const und = semuaUndangan();
    const users = daftarUsers();
    const menunggu = users.filter(u => u.verif === "menunggu");
    const log = semuaLog().slice().reverse().slice(0, 40);
    const mfa = pengaturanMfa();
    const perJenjang = URUT.map(c => {
      const j = JENJANG[c];
      return '<button class="pick-card" style="--acc:' + j.warna + '" data-ruang="' + c + '">' +
        '<span class="pk-ico">' + ikon(j.ikon) + '</span><span class="pk-sub">' + esc(j.label) + '</span>' +
        '<h3>' + esc(j.nama) + '</h3>' +
        '<span class="pk-go">' + semuaMapel(c).length + ' mapel · ' + totalSoal(c) + ' soal · ' +
        pengumumanRuang(c).length + ' pengumuman · ' + kegiatanRuang(c).length + ' kegiatan ' + ikon("i-arrow") + '</span></button>';
    }).join("");

    return '<div class="wrap admin-page" style="padding:46px 0 70px">' +
      '<div class="pick-head"><span class="sec-tag">' + ikon("i-shield") + ' Panel Admin Sistem</span>' +
      '<h1>Kelola Platform Kuradapt</h1>' +
      '<p>Satu panel untuk seluruh jenjang — pengguna, pengumuman, kegiatan, dan kode undangan.</p></div>' +
      '<div class="stat-grid">' +
      '<div class="stat-card"><span class="lbl">Pengguna</span><span class="val">' + users.length + '</span><span class="note">terdaftar</span></div>' +
      '<div class="stat-card"><span class="lbl">Pengumuman</span><span class="val">' + ann.length + '</span><span class="note">seluruh jenjang</span></div>' +
      '<div class="stat-card"><span class="lbl">Kegiatan</span><span class="val">' + kg.length + '</span><span class="note">' + kg.filter(k => statusKegiatan(k)[0] === "live").length + ' berlangsung</span></div>' +
      '<div class="stat-card"><span class="lbl">Undangan</span><span class="val">' + und.length + '</span><span class="note">' + und.filter(u => u.aktif).length + ' aktif</span></div>' +
      '</div>' +
      '<div class="sec-head" style="margin:28px 0 16px"><span class="sec-tag">' + ikon("i-compass") + ' Ruang</span><h2 style="font-size:1.35rem">Semua Jenjang</h2></div>' +
      '<div class="pick-grid">' + perJenjang + '</div>' +
      '<div class="sec-head" style="margin:30px 0 14px"><span class="sec-tag">' + ikon("i-chart") + ' Pantauan</span><h2 style="font-size:1.35rem">Progres Peserta per Jenjang</h2></div>' +
      '<div class="stack">' + URUT.map(c => {
        const ps = pesertaRuang(c);
        const din = ps.reduce((a, u) => a + ringkasPeserta(c, u).dinilai, 0);
        const babRata = ps.length ? Math.round(ps.reduce((a, u) => a + ringkasPeserta(c, u).bab, 0) / ps.length) : 0;
        return '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon(JENJANG[c].ikon) + '</span>' +
          '<span class="li-body"><b>' + esc(JENJANG[c].nama) + '</b><small>' + ps.length + ' peserta · rata-rata ' + babRata +
          ' bab dipelajari · ' + din + ' nilai terinput</small></span>' +
          '<span class="li-end"><span class="chip' + (ps.length ? ' brand' : '') + '">' + (ps.length ? ps.length + ' aktif' : 'belum ada') + '</span>' +
          '<button class="btn btn-sm btn-soft" data-ruang="' + c + '">' + ikon("i-arrow") + '</button></span></div>';
      }).join("") + '</div>' +
      '<div class="grid-2" style="margin-top:30px"><div>' +
      '<div class="sec-head" style="margin-bottom:14px"><span class="sec-tag">' + ikon("i-users") + ' Pengguna</span><h2 style="font-size:1.25rem">Daftar Pengguna Terdaftar (' + users.length + ')</h2></div>' +
      '<div class="stack">' + (users.length ? users.slice().reverse().map(u =>
        '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon(PERAN[u.peran] ? PERAN[u.peran].ikon : "i-user") + '</span>' +
        '<span class="li-body"><b>' + esc(u.nama) + (u.email === s.email ? ' <span class="chip">akun Anda</span>' : '') +
        (u.nonaktif ? ' <span class="chip">nonaktif</span>' : '') + '</b><small>' + esc(u.email) + ' · ' + esc(PERAN[u.peran] ? PERAN[u.peran].nama : u.peran) +
        (u.jenjang && JENJANG[u.jenjang] ? ' · ' + esc(JENJANG[u.jenjang].label) : '') +
        ((u.undangan || []).length ? ' · akses tambahan: ' + u.undangan.map(x => JENJANG[x] ? JENJANG[x].label : x).join(", ") : '') + '</small></span>' +
        '<span class="li-end li-akun">' +
        '<button class="btn btn-sm btn-soft" data-profil="' + esc(u.email) + '">' + ikon("i-users") + ' Profil</button>' +
        '<button class="btn btn-sm btn-danger" data-hapus-akun="' + esc(u.email) + '">' + ikon("i-trash") + ' Hapus</button></span></div>').join("")
        : '<div class="empty"><span class="e-ico">' + ikon("i-users") + '</span><b>Belum ada pengguna</b></div>') + '</div></div><div>' +
      '<div class="sec-head" style="margin-bottom:14px"><span class="sec-tag">' + ikon("i-calendar") + ' Kegiatan</span><h2 style="font-size:1.25rem">Kegiatan Seluruh Jenjang</h2></div>' +
      '<div class="stack">' + (kg.length ? kg.slice().reverse().map(k => {
        const st = statusKegiatan(k);
        return '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon(IKON_JENIS[k.jenis] || "i-calendar") + '</span>' +
          '<span class="li-body"><b>' + esc(k.judul) + '</b><small>' + esc(k.pembuat) + ' · ' + esc(JENJANG[k.jenjang] ? JENJANG[k.jenjang].nama : k.jenjang) +
          ' · ' + (k.peserta || []).length + ' peserta</small></span>' +
          '<span class="li-end"><span class="chip ' + (st[0] === "live" ? "brand" : "") + '">' + st[1] + '</span></span></div>';
      }).join("") : '<div class="empty"><span class="e-ico">' + ikon("i-calendar") + '</span><b>Belum ada kegiatan</b></div>') + '</div></div></div>' +
      '<div class="sec-head" style="margin:30px 0 14px"><span class="sec-tag">' + ikon("i-link") + ' Undangan</span><h2 style="font-size:1.25rem">Kode Undangan Aktif</h2></div>' +
      '<div class="stack">' + (und.length ? und.slice().reverse().map(u =>
        '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon("i-link") + '</span>' +
        '<span class="li-body"><b class="kode-undangan">' + esc(u.kode) + '</b><small>' + esc(JENJANG[u.jenjang] ? JENJANG[u.jenjang].nama : u.jenjang) +
        ' · dibuat ' + esc(u.pembuat) + ' · ' + u.dipakai.length + ' dipakai</small></span>' +
        '<span class="li-end"><span class="chip' + (u.aktif ? ' brand' : '') + '">' + (u.aktif ? "aktif" : "nonaktif") + '</span></span></div>').join("")
        : '<div class="empty"><span class="e-ico">' + ikon("i-link") + '</span><b>Belum ada kode undangan</b></div>') + '</div>' +
      /* ---- Verifikasi pendaftaran lembaga ---- */
      '<div class="sec-head" style="margin:30px 0 14px"><span class="sec-tag">' + ikon("i-shield") + ' Verifikasi</span>' +
      '<h2 style="font-size:1.25rem">Pendaftaran Menunggu Verifikasi Lembaga (' + menunggu.length + ')</h2></div>' +
      '<div class="stack">' + (menunggu.length ? menunggu.map(u =>
        '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon("i-school") + '</span>' +
        '<span class="li-body"><b>' + esc(u.nama) + '</b><small>' + esc(u.email) + ' · ' +
        esc(u.lembaga ? u.lembaga.nama : "-") + ' · ' + esc(u.wilayah ? u.wilayah.kabupaten + ", " + u.wilayah.provinsi : "-") +
        (u.nisn ? ' · NISN/NIP: ' + esc(u.nisn) : '') + '</small></span>' +
        '<span class="li-end"><button class="btn btn-sm btn-primary" data-verif-ok="' + esc(u.email) + '">' + ikon("i-check") + ' Setujui</button>' +
        '<button class="btn btn-sm btn-danger" data-verif-no="' + esc(u.email) + '">' + ikon("i-x") + '</button></span></div>').join("")
        : '<div class="empty"><span class="e-ico">' + ikon("i-shield") + '</span><b>Tidak ada pendaftaran tertunda</b>' +
        '<span>Pendaftar yang memilih lembaga akan muncul di sini untuk diverifikasi.</span></div>') + '</div>' +
      /* ---- Kewenangan pengelola (Super Admin) ---- */
      (superMode ? '<div class="sec-head" style="margin:30px 0 14px"><span class="sec-tag">' + ikon("i-trophy") + ' Super Admin</span>' +
        '<h2 style="font-size:1.25rem">Kewenangan Pengelola</h2></div>' +
        '<div class="stack">' + users.filter(u => ["admin", "operator", "super"].indexOf(u.peran) > -1).map(u =>
          '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon(PERAN[u.peran] ? PERAN[u.peran].ikon : "i-shield") + '</span>' +
          '<span class="li-body"><b>' + esc(u.nama) + (u.peran === "super" ? ' <span class="chip brand">Super</span>' : '') + '</b>' +
          '<small>' + esc(u.email) + ' · ' + esc(PERAN[u.peran] ? PERAN[u.peran].nama : u.peran) + '</small></span>' +
          '<span class="li-end">' + (u.email === s.email ? '<span class="chip">akun Anda</span>' :
            '<button class="btn btn-sm ' + (u.nonaktif ? "btn-primary" : "btn-soft") + '" data-kewenangan="' + esc(u.email) + '">' +
            ikon(u.nonaktif ? "i-unlock" : "i-lock") + (u.nonaktif ? ' Aktifkan' : ' Nonaktifkan') + '</button>') +
          '</span></div>').join("") + '</div>' +
        '<div class="compose" style="margin-top:16px"><h3>' + ikon("i-link") + ' Kode Undangan MASTER (untuk Super Admin baru)</h3>' +
        '<button class="btn btn-primary" id="buatMaster">' + ikon("i-plus") + ' Buat Kode Master</button> ' +
        '<span class="chip brand">' + ikon("i-shield") + ' Pemegang kode otomatis menjadi Super Admin</span></div>' : '') +
      /* ---- Keamanan: MFA, audit log, insiden ---- */
      '<div class="sec-head" style="margin:30px 0 14px"><span class="sec-tag">' + ikon("i-lock") + ' Keamanan</span>' +
      '<h2 style="font-size:1.25rem">MFA, Audit Log & Insiden</h2></div>' +
      '<div class="grid-2"><div><div class="compose" style="margin:0">' +
      '<h3>' + ikon("i-shield") + ' Multi-Factor Authentication (pengelola)</h3>' +
      '<p class="form-note" style="margin:0 0 10px">' + (mfa.aktif
        ? 'MFA <b>aktif</b> — admin/operator/super diminta kode saat masuk. Kode demo: <b class="kode-undangan">' + esc(String(mfa.kode)) + '</b> (berlaku 5 menit).'
        : 'MFA <b>nonaktif</b>. Aktifkan untuk perlindungan ekstra akun pengelola.') + '</p>' +
      '<button class="btn btn-soft" id="mfaToggle">' + ikon(mfa.aktif ? "i-lock" : "i-unlock") + (mfa.aktif ? ' Nonaktifkan MFA' : ' Aktifkan MFA') + '</button> ' +
      '<button class="btn btn-ghost" id="mfaRegen">' + ikon("i-refresh") + ' Kode Baru</button></div>' +
      '<div class="compose" style="margin-top:16px"><h3>' + ikon("i-warn") + ' Catat Insiden Keamanan</h3>' +
      '<div class="row"><div class="field"><label for="insJudul">Kejadian</label><span class="inp-wrap">' + ikon("i-flag") +
      '<input id="insJudul" placeholder="Contoh: Akses mencurigakan"></span></div>' +
      '<div class="field"><label for="insTingkat">Tingkat</label><span class="inp-wrap">' + ikon("i-warn") +
      '<select id="insTingkat"><option>rendah</option><option>sedang</option><option>tinggi</option></select></span></div></div>' +
      '<div class="field"><label for="insDetail">Keterangan</label><span class="inp-wrap">' + ikon("i-pen") +
      '<input id="insDetail" placeholder="Detail singkat kejadian"></span></div>' +
      '<button class="btn btn-primary" id="insSimpan">' + ikon("i-check") + ' Catat ke Log</button></div></div>' +
      '<div><div class="sec-head" style="margin-bottom:10px"><span class="sec-tag">' + ikon("i-clock") + ' Audit Log</span>' +
      '<h2 style="font-size:1.15rem">Riwayat Aktivitas Terakhir (' + log.length + ')</h2></div>' +
      '<div class="stack" id="logStack">' + (log.length ? log.map(l =>
        '<div class="list-item" style="cursor:default"><span class="li-ico">' + ikon(l.tipe === "insiden" ? "i-warn" : l.tipe === "masuk" ? "i-user" : "i-refresh") + '</span>' +
        '<span class="li-body"><b>' + esc(l.pesan) + '</b><small>' + esc(l.tipe) + ' · ' + esc(l.pelaku) + ' · ' + relatif(l.tgl) + '</small></span>' +
        '<span class="li-end"><span class="chip' + (l.tipe === "insiden" ? " red" : '') + '">' + esc(l.tipe) + '</span></span></div>').join("")
        : '<div class="empty"><span class="e-ico">' + ikon("i-clock") + '</span><b>Belum ada aktivitas tercatat</b></div>') + '</div>' +
      '<button class="btn btn-ghost btn-sm" id="logBersih" style="margin-top:10px">' + ikon("i-trash") + ' Bersihkan Log</button></div></div>' +
      /* ---- Pintasan layanan ---- */
      '<div class="sec-head" style="margin:30px 0 14px"><span class="sec-tag">' + ikon("i-arrow") + ' Layanan</span>' +
      '<h2 style="font-size:1.25rem">Pintasan Platform</h2></div>' +
      '<div class="stack">' +
      '<button class="list-item" data-go="materi"><span class="li-ico">' + ikon("i-brain") + '</span><span class="li-body"><b>Materi Belajar</b><small>isi bab SD, SMP, SMA, SMK & Kuliah — baca langsung</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      '<button class="list-item" data-go="perpustakaan"><span class="li-ico">' + ikon("i-books") + '</span><span class="li-body"><b>Perpustakaan Digital</b><small>buku & modul gratis — tambah & baca langsung</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      '<button class="list-item" data-go="kurikulum"><span class="li-ico">' + ikon("i-scroll") + '</span><span class="li-body"><b>Sistem Kurikulum</b><small>versi & periode penerapan — riwayat tersimpan</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      '<button class="list-item" data-go="industri"><span class="li-ico">' + ikon("i-building") + '</span><span class="li-body"><b>Koneksi Dunia Industri</b><small>pelatihan, magang & lowongan mitra</small></span><span class="li-end">' + ikon("i-arrow") + '</span></button>' +
      '</div>' +
      '</div>';
  }

  /* ---------------- Hapus akun (pengelola) ----------------
     Memungkinkan email dipakai lagi untuk pendaftaran baru. Penghapusan diri
     sendiri otomatis mengakhiri sesi agar tidak menjadi "akun hantu". */
  function hapusAkun(email) {
    const semua = daftarUsers();
    const i = semua.findIndex(x => String(x.email).toLowerCase() === String(email).toLowerCase());
    if (i === -1) return false;
    const u = semua[i];
    semua.splice(i, 1);
    simpanUsers(semua);
    catatLog("kewenangan", "Akun dihapus: " + u.email + " (" + u.peran + ")");
    const s = sesi();
    if (s && String(s.email).toLowerCase() === String(email).toLowerCase()) {
      hapusSesi();
      navigasi("#/masuk");
    }
    return true;
  }

  /* ---- handler panel admin ---- */
  function pascaAdmin() {
    const users = daftarUsers();
    document.querySelectorAll("[data-verif-ok],[data-verif-no]").forEach(b => {
      const email = b.dataset.verifOk || b.dataset.verifNo;
      const ok = !!b.dataset.verifOk;
      b.onclick = () => {
        const semua = daftarUsers();
        const u = semua.find(x => x.email === email);
        if (!u) return;
        if (ok) { delete u.verif; } else { u.verif = "ditolak"; u.nonaktif = true; }
        simpanUsers(semua);
        catatLog("verifikasi", (ok ? "Lembaga disetujui: " : "Pendaftaran ditolak: ") + email);
        kirimNotif({
          tipe: "verifikasi",
          judul: ok ? "Akun Anda disetujui" : "Pendaftaran Anda ditolak",
          pesan: ok ? "Verifikasi lembaga selesai — akun " + email + " kini bisa masuk dan memakai semua fitur ruang."
            : "Pendaftaran lembaga untuk " + email + " tidak disetujui pengelola. Akun dinonaktifkan.",
          ke: email, rujuk: ok ? "#/pilih" : "#/profil"
        });
        toast(ikon(ok ? "i-check" : "i-x") + (ok ? " Akun <b>terverifikasi</b> — bisa masuk sekarang" : " Pendaftaran ditolak & akun dinonaktifkan"));
        terapkanRute();
      };
    });
    document.querySelectorAll("[data-kewenangan]").forEach(b => b.onclick = () => {
      const semua = daftarUsers();
      const u = semua.find(x => x.email === b.dataset.kewenangan);
      if (!u) return;
      u.nonaktif = !u.nonaktif;
      simpanUsers(semua);
      catatLog("kewenangan", (u.nonaktif ? "Dinonaktifkan: " : "Diaktifkan kembali: ") + u.email + " (" + u.peran + ")");
      kirimNotif({
        tipe: "keamanan", judul: u.nonaktif ? "Akun Anda dinonaktifkan" : "Akun Anda diaktifkan kembali",
        pesan: "Pengelola " + (sesi() ? sesi().nama : "-") + " mengubah kewenangan akun " + u.email + " menjadi " + (u.nonaktif ? "nonaktif" : "aktif") + ".",
        ke: u.email, rujuk: "#/profil"
      });
      toast(ikon(u.nonaktif ? "i-lock" : "i-unlock") + " Kewenangan " + esc(u.nama) + " → <b>" + (u.nonaktif ? "nonaktif" : "aktif") + "</b>");
      terapkanRute();
    });
    document.querySelectorAll("[data-hapus-akun]").forEach(b => b.onclick = () => {
      const email = b.dataset.hapusAkun;
      const u = daftarUsers().find(x => String(x.email).toLowerCase() === String(email).toLowerCase());
      if (!u) return;
      const diri = sesi() && String(sesi().email).toLowerCase() === String(email).toLowerCase();
      bukaModal(mHead("i-warn", "Hapus akun?") +
        '<div class="modal-body"><p>Akun <b>' + esc(u.nama) + '</b> (' + esc(u.email) +
        ') akan <b>dihapus permanen</b> dari penyimpanan perangkat ini' +
        (diri ? ' — ini akun Anda sendiri, sesi akan berakhir otomatis' : '') +
        '. Setelah dihapus, email ini <b>bisa dipakai mendaftar ulang</b>.</p>' +
        '<div class="wiz-foot"><button class="btn btn-ghost" data-tutup>Batal</button>' +
        '<button class="btn btn-danger" id="okHapusAkun">' + ikon("i-trash") + ' Hapus Akun</button></div></div>');
      document.getElementById("okHapusAkun").onclick = () => {
        tutupModal();
        if (hapusAkun(email)) toast(ikon("i-check") + " Akun <b>" + esc(u.nama) + "</b> dihapus — email bisa didaftarkan ulang");
        else toast(ikon("i-x") + " Akun tidak ditemukan", "no");
        terapkanRute();
      };
    });
    const bm = document.getElementById("buatMaster");
    if (bm) bm.onclick = () => {
      const u = buatUndangan("super", sesi().nama, "super");
      catatLog("kewenangan", "Kode undangan MASTER dibuat: " + u.kode);
      toast(ikon("i-trophy") + " Kode MASTER: <b class='kode-undangan'>" + u.kode + "</b>");
      terapkanRute();
    };
    const mt = document.getElementById("mfaToggle");
    if (mt) mt.onclick = () => {
      const m = pengaturanMfa();
      m.aktif = !m.aktif;
      if (m.aktif && !m.kode) { m.kode = String(Math.floor(100000 + Math.random() * 900000)); m.berlaku = Date.now() + 5 * 60000; }
      lsSet(K.mfa, m);
      catatLog("keamanan", "MFA " + (m.aktif ? "diaktifkan" : "dinonaktifkan") + " untuk akun pengelola");
      toast(ikon("i-shield") + " MFA <b>" + (m.aktif ? "aktif" : "nonaktif") + "</b>");
      terapkanRute();
    };
    const mr = document.getElementById("mfaRegen");
    if (mr) mr.onclick = () => {
      const m = pengaturanMfa();
      m.kode = String(Math.floor(100000 + Math.random() * 900000));
      m.berlaku = Date.now() + 5 * 60000;
      lsSet(K.mfa, m);
      catatLog("keamanan", "Kode MFA diperbarui");
      toast(ikon("i-refresh") + " Kode MFA baru: <b>" + m.kode + "</b>");
      terapkanRute();
    };
    const is = document.getElementById("insSimpan");
    if (is) is.onclick = () => {
      const judul = (document.getElementById("insJudul").value || "").trim();
      const detail = (document.getElementById("insDetail").value || "").trim();
      if (judul.length < 3) { toast(ikon("i-warn") + " Isi kejadian dulu", "no"); return; }
      catatInsiden(judul, detail, document.getElementById("insTingkat").value);
      toast(ikon("i-check") + " Insiden tercatat di audit log");
      terapkanRute();
    };
    const lb = document.getElementById("logBersih");
    if (lb) lb.onclick = () => {
      bersihkanLog();
      toast(ikon("i-trash") + " Audit log dibersihkan");
      terapkanRute();
    };
  }

  /* ---------------- Sinkronisasi live ---------------- */
  let bc = null;
  try { if (typeof BroadcastChannel !== "undefined") bc = new BroadcastChannel("kuradapt-live"); } catch (e) { bc = null; }
  function siarkan() { try { if (bc) bc.postMessage({ t: "live", w: Date.now() }); } catch (e) { } }
  function segarkanLive() {
    const h = location.hash || "#/";
    if (LR.id) gambarRuangLive();   /* ruang live terbuka → kehadiran & chat diperbarui */
    if (h === "#/beranda") {
      const grid = document.getElementById("annGrid");
      if (grid) {
        const ann = semuaPengumuman().slice().sort((a, b) => new Date(b.tgl) - new Date(a.tgl));
        grid.innerHTML = ann.slice(0, 6).map(p => kartuPengumuman(p, true)).join("");
      }
    } else if (h.indexOf("#/r/") === 0 && ["pengumuman", "kegiatan", "kelola", "pantau", "latihan", "transkrip", "materi"].indexOf(R.tab) > -1) renderTab();
    else if (h === "#/admin" || h === "#/perpustakaan" || h === "#/kurikulum" || h === "#/industri") terapkanRute();
  }
  if (bc) bc.onmessage = segarkanLive;
  window.addEventListener("storage", e => {
    if ([K.pengumuman, K.kegiatan, K.undangan, K.soal, K.mapelx, K.nilai,
      K.jadwal, K.kurikulum, K.buku, K.industri, K.log, K.mfa, K.users,
      K.notif].indexOf(e.key) > -1) { segarkanLive(); perbaruiBadgeNotif(); }
  });

  /* ---------------- Inisialisasi ---------------- */
  function init() {
    terapkanTema(lsGet(K.tema, "light"));

    const bt = document.getElementById("btnTheme"); if (bt) bt.onclick = gantiTema;
    const bm = document.getElementById("btnMenu"); if (bm) bm.onclick = bukaMenu;
    const b1 = document.getElementById("btnMasuk"); if (b1) b1.onclick = () => navigasi("#/masuk");
    const b2 = document.getElementById("btnDaftar"); if (b2) b2.onclick = () => navigasi("#/daftar");
    const bn = document.getElementById("btnNotif");
    if (bn) bn.onclick = e => { e.stopPropagation(); togglePanelNotif(); };

    /* Klik tombol "Profil" (kartu pengumuman, panel kelola, daftar anggota) → modal */
    document.addEventListener("click", e => {
      const el = e.target && e.target.closest ? e.target.closest("[data-profil]") : null;
      if (!el) return;
      modalProfil(el.dataset.profil);
    });

    /* Data-scroll dipasang lewat DELEGASI di document, supaya tautan yang dirender
       belakangan (halaman login/daftar, footer landing) tetap ikut berfungsi. */
    document.addEventListener("click", e => {
      const el = e.target && e.target.closest ? e.target.closest("[data-scroll]") : null;
      if (!el) return;
      e.preventDefault(); tutupMenu(); scrollSection(el.dataset.scroll);
    });
    document.querySelectorAll("[data-nav]").forEach(el => el.addEventListener("click", () => tutupMenu()));
    document.querySelectorAll("#mobileMenu a").forEach(a => a.addEventListener("click", () => tutupMenu()));

    const modal = document.getElementById("modal");
    if (modal) modal.addEventListener("click", e => { if (e.target === modal) tutupModal(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { tutupModal(); tutupMenu(); tutupPanelNotif(); } });
    /* klik di luar panel lonceng → tutup */
    document.addEventListener("click", e => {
      const p = document.getElementById("notifPanel");
      if (!p || p.hidden) return;
      /* elemen bisa sudah dilepas dari DOM (mis. panel dirender ulang saat diklik) */
      if (!e.target || !document.contains(e.target)) return;
      if (e.target.closest("#notifPanel") || e.target.closest("#btnNotif")) return;
      p.hidden = true;
    });

    window.addEventListener("hashchange", terapkanRute);
    terapkanRute();

    /* PWA: daftarkan service worker hanya saat dibuka lewat http(s) */
    try {
      if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
        navigator.serviceWorker.register("sw.js").catch(() => { });
      }
    } catch (e) { }
  }

  /* API publik (dipakai pengujian & integrasi) */
  window.terapkanRute = terapkanRute;
  window.Kuradapt = {
    daftar: (o) => {
      const ops = opsiDaftar().find(x => x.id === o.opsi);
      if (!ops) return false;
      if (cariUser(o.email)) return false;
      const users = daftarUsers();
      users.push({ nama: o.nama, email: o.email, pass: sandiBaru(o.pass), peran: ops.peran, jenjang: ops.jenjang, tgl: new Date().toISOString() });
      simpanUsers(users);
      return true;
    },
    masuk: (email, pass) => {
      const u = cariUser(email);
      if (!u || !cocokSandi(pass, u)) return false;
      /* kebijakan sama dengan UI: akun nonaktif / menunggu verifikasi ditolak */
      if (u.nonaktif) return false;
      if (u.verif === "menunggu") return false;
      simpanSesi({ email: u.email, nama: u.nama, peran: u.peran, jenjang: u.jenjang });
      return true;
    },
    keluar: () => { hapusSesi(); navigasi("#/beranda"); },
    sesi, semuaPengumuman, pengumumanRuang, semuaMapel, totalSoal, nilaiMapel, JENJANG, URUT, opsiDaftar,
    simpanDok, daftarDok: dokMeta, ambilDok, hapusDok, unduhDok,
    mulaiQuiz, gantiTema, terapkanTema, bukaRuang,
    init, navigasi, renderRuang, renderTab, viewLanding, viewMasuk, viewDaftar,
    /* peran baru: admin & operator, kegiatan, undangan */
    jenjangSaya, bisaTulis, panelKelola, PERAN,
    semuaKegiatan, kegiatanRuang, simpanKegiatanBaru, ubahKegiatan, statusKegiatan, jenisKegiatan,
    semuaUndangan, buatUndangan, tukarUndangan, beriAksesUndangan,
    viewPilih, viewAdmin, tabKegiatan, tabKelola,
    /* rombak v3: nilai kosong-awal, pantau, input nilai, pelajaran & soal pengajar, CRUD pengumuman */
    tabPantau, pesertaRuang, ringkasPeserta,
    nilaiPengguna, semuaNilai, ambilNilaiGuru, simpanNilaiInput, kosongkanNilaiInput,
    mapelCustom, tambahMapelx, hapusMapelx, cariMapelCustom, tambahBabMapelx,
    semuaPaket, cariPaket, simpanPaketBaru, hapusPaket, mulaiPaket,
    pengumumanBaru, ubahPengumuman, hapusPengumuman,
    progresUser, emailSaya,
    /* rombak v3.1: layanan tambahan, super admin, keamanan */
    viewPerpustakaan, viewKurikulum, viewIndustri, pascaAdmin,
    semuaBuku, bukuRuang, tambahBuku, hapusBuku,
    semuaKurikulum, kurikulumJenjang, tambahKurikulum, jadikanBerlaku,
    semuaJadwal, jadwalRuang, buatJadwal, hapusJadwal, statusJadwal, PLATFORM,
    semuaPosting, postingRuang, tambahPosting, hapusPosting, ajukanMagang, setujuiPendaftar, JENIS_INDUSTRI,
    semuaLog, catatLog, bersihkanLog, catatInsiden, statusGagal, catatGagal, hapusGagal, pengaturanMfa,
    /* v3.3: pusat pemberitahuan, profil pengguna, hapus akun */
    notifSaya, semuaNotif, kirimNotif, bacaNotif, bacaSemuaNotif, belumDibaca, hapusNotif,
    mintaNotifBrowser, konfigNotif, tujuanEmail, perbaruiBadgeNotif, togglePanelNotif, renderPanelNotif,
    viewProfil, modalProfil, anggotaRuang, modalAnggota, statistikProfil, hapusAkun,
    /* v3.4: halaman materi semua jenjang (baca langsung, tanpa unduh .txt) */
    viewMateriJenjang,
    /* v3.4: ruang live kegiatan (kehadiran, chat, tautan video tuan rumah) */
    bukaRuangLive, tutupRuangLive, ruangLiveHTML, tuanRumahHadir,
    ruangLive: () => LR.id,
    kuis: () => R.quiz, ruang: () => R, progres: progresRuang
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

})();
