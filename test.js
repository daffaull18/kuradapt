/* ============================================================
   KURADAPT v2 — Pengujian Fungsional (jsdom)
   Alur: landing pengumuman → daftar (wizard) → pilih jenjang →
   ruang terpisah (materi/latihan/transkrip/dokumen/pengumuman)
   Jalankan: node test.js   → target: semua LULUS / 0 GAGAL
   ============================================================ */
const fs = require("fs");
const { JSDOM, VirtualConsole } = require("jsdom");

const FILE = "C:\\Users\\user\\OneDrive\\Desktop\\project Dinzz\\kuradapt\\index.html";
const DIR = "C:\\Users\\user\\OneDrive\\Desktop\\project Dinzz\\kuradapt";
const html = fs.readFileSync(FILE, "utf8");
const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", e => errors.push("jsdomError: " + e.message));
vc.on("error", (...a) => errors.push("console.error: " + a.join(" ")));

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  url: "http://localhost/",
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(w) {
    w.IntersectionObserver = class { constructor(cb) { this.cb = cb; } observe(el) { this.cb([{ isIntersecting: true, target: el }]); } unobserve() { } disconnect() { } };
    w.confirm = () => true;
    w.print = () => { w.__printed = (w.__printed || 0) + 1; };
    w.scrollTo = () => { };
    w.Element.prototype.scrollIntoView = function () { };
    w.URL.createObjectURL = () => "blob:kuradapt-test";
    w.URL.revokeObjectURL = () => { };
    const _origClick = w.HTMLAnchorElement.prototype.click;
    w.HTMLAnchorElement.prototype.click = function () {
      if (this.download) { w.__dl = (w.__dl || []).concat(this.download); } else { _origClick.call(this); }
    };
  }
});

const w = dom.window, d = w.document;
/* muat konfigurasi + konten jenjang + aplikasi (script src tidak dieksekusi jsdom) */
["boot.js", "boot-route.js", "config.js", "data-sd.js", "data-smp.js", "data-sma.js", "data-smk.js", "data-kuliah.js", "data-wilayah.js", "app.js"].forEach(f => {
  try { w.eval(fs.readFileSync(DIR + "\\" + f, "utf8")); }
  catch (e) { errors.push("eval " + f + ": " + e.message); }
});
/* berkas sumber untuk tes kontrak (CSP, skrip eksternal, dsb.) */
const bootRoute = fs.readFileSync(DIR + "\\boot-route.js", "utf8");
const appSrc = fs.readFileSync(DIR + "\\app.js", "utf8");

const $ = s => d.querySelector(s);
const $$ = s => [...d.querySelectorAll(s)];
const click = el => { if (!el) throw new Error("elemen tidak ada untuk klik"); el.click(); };
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { if (cond) { pass++; console.log("  PASS  " + name); } else { fail++; console.log("  FAIL  " + name + (extra ? " -> " + extra : "")); } };
const goto = h => { w.location.hash = h; w.terapkanRute(); };
const isi = (sel, val) => { const el = $(sel); if (el) { el.value = val; } return !!el; };
const submit = sel => $(sel).dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
const K = w.Kuradapt;
/* progres kini per-pengguna: { [ruang]: { [email]: { bab, latihan } } }
   → kembalikan struktur { [ruang]: rekaman milik sesi aktif } agar tes tetap ringkas */
const st = () => {
  const p = JSON.parse(w.localStorage.getItem("kuradapt_progres") || "{}");
  const s = K.sesi();
  const code = K.ruang().code;
  const rec = (p[code] && p[code][s ? s.email : "tamu"]) || { bab: [], latihan: {} };
  const out = {}; out[code] = rec; return out;
};
const sesi = () => K.sesi();

function daftarCepat(opsi, nama, email, pass_) {
  const okDaftar = K.daftar({ opsi, nama, email, pass: pass_ });
  return okDaftar && K.masuk(email, pass_);
}

setTimeout(async () => {
  if ($(".boot")) K.init(); /* layar siap masih ada = router belum pernah jalan */

  /* ============================================================ */
  console.log("=== 1. BUKA PLATFORM → LANGSUNG HALAMAN LOGIN ===");
  ok("0 error JS saat load", errors.length === 0, errors[0] || "");
  ok("data 5 jenjang termuat", Object.keys(w.KURADAPT_DATA || {}).length === 5, Object.keys(w.KURADAPT_DATA || {}).join(","));
  ok("aplikasi terender (view terisi)", $("#view").innerHTML.length > 1000);
  ok("BUKA → LANGSUNG HALAMAN MASUK", !!$("#formMasuk"), w.location.hash);
  ok("hash awal diarahkan ke #/masuk", w.location.hash === "#/masuk", w.location.hash);
  ok("bukan wizard daftar", !$(".wizard"));
  ok("tautan kecil 'Lihat papan pengumuman' ada", !!$('.auth-alt a[href="#/pengumuman"]'));
  ok("tautan menuju halaman khusus (bukan scroll landing)", !!$('.auth-alt a[href="#/pengumuman"]') && !$('.auth-alt a[href="#/pengumuman"]').hasAttribute("data-scroll"));

  goto("#/beranda");
  console.log("=== 1b. LANDING PENGUMUMAN (halaman tersembunyi) ===");
  ok("landing bisa dibuka via tautan", !!$(".hero"), w.location.hash);
  ok("hero live badge", ($(".hero-badge") || {}).textContent?.includes("Papan pengumuman live"));
  ok("hero memuat slogan Adaptif/Responsif", ($(".hero h1") || {}).textContent?.includes("Adaptif"));
  ok("filosofi Kurikulum Hidup ada", d.body.textContent.includes("Kurikulum Hidup"));
  ok("CTA daftar ada", !!$("#ctaDaftar"));
  ok("CTA masuk ada", !!$("#ctaMasuk"));
  ok("4 kartu pilar jenjang", $$("#jenjang .pillar-card").length === 4, String($$("#jenjang .pillar-card").length));
  ok("papan pengumuman tampil 6 kartu", $$("#annGrid .ann-card").length === 6, String($$("#annGrid .ann-card").length));
  ok("minimal 8 pengumuman seed tenaga pendidik", K.semuaPengumuman().length >= 8, String(K.semuaPengumuman().length));
  ok("ada chip BARU", $$("#annGrid .ann-card .baru").length >= 1);
  ok("penulis berperan guru/dosen/industri", K.semuaPengumuman().every(p => ["guru", "dosen", "industri"].includes(p.peran)));
  ok("footer kredit DAFFTECH", d.body.textContent.includes("DAFFTECH"));
  ok("favicon logo SVG (bukan huruf polos)", $('link[rel="icon"]').getAttribute("href").includes("%3Cpath"));
  ok("font Sora + Plus Jakarta Sans dimuat", html.includes("family=Sora") && html.includes("Plus+Jakarta+Sans"));
  ok("nav atas menunjuk #/beranda", $('#tbNav a[data-nav="beranda"]').getAttribute("href") === "#/beranda");

  console.log("=== 2. TEMA NIGHT / LIGHT ===");
  ok("tema awal = light", d.documentElement.getAttribute("data-theme") === "light");
  click($("#btnTheme"));
  ok("ganti ke night", d.documentElement.getAttribute("data-theme") === "dark");
  ok("meta theme-color ikut gelap", $('meta[name="theme-color"]').getAttribute("content") === "#0a1020");
  ok("ikon tema berubah jadi matahari", $("#themeIcon use").getAttribute("href") === "#i-sun");
  ok("tema tersimpan", w.localStorage.getItem("kuradapt_theme") === '"dark"');
  click($("#btnTheme"));
  ok("kembali ke light", d.documentElement.getAttribute("data-theme") === "light");

  console.log("=== 3. TOPBAR & MENU RAPI ===");
  ok("nav atas punya 4 link", $$("#tbNav a").length === 4, String($$("#tbNav a").length));
  ok("semua label nav terisi & tunggal", $$("#tbNav a").every(a => a.textContent.trim().length > 3 && !a.querySelector("br")));
  ok("tombol hamburger ada", !!$("#btnMenu"));
  ok("menu mobile ada 8 link (5 lama + 3 pintasan layanan)", $$("#mobileMenu .mm-links a").length === 8, String($$("#mobileMenu .mm-links a").length));
  ok("pintasan perpustakaan/kurikulum/industri di menu", ["perpustakaan", "kurikulum", "industri"].every(h => !!$('#mobileMenu a[href="#/' + h + '"]')));
  click($("#btnMenu"));
  ok("menu mobile terbuka", $("#mobileMenu").classList.contains("open"));
  ok("aria-expanded true", $("#btnMenu").getAttribute("aria-expanded") === "true");
  click($$("#mobileMenu .mm-links a")[0]);
  ok("menu menutup setelah diklik", !$("#mobileMenu").classList.contains("open"));
  const css = fs.readFileSync(DIR + "\\styles.css", "utf8");
  ok("nav nowrap (tidak menumpuk)", /\.tb-nav a[^}]*white-space:\s*nowrap/s.test(css));
  ok("judul brand pakai ellipsis", /\.brand \.txt small[^}]*text-overflow:\s*ellipsis/s.test(css));
  ok("media query sembunyikan nav di layar kecil", css.includes("@media (max-width: 1020px)") && /#btnMenu\s*\{\s*display:\s*grid/s.test(css));
  ok("aturan layar sangat kecil (560px)", css.includes("@media (max-width: 560px)"));
  ok("variabel tema gelap ada", css.includes('[data-theme="dark"]'));
  ok("hamburger menu item ellipsis", /#mobileMenu \.mm-links a[^}]*text-overflow:\s*ellipsis/s.test(css));

  console.log("=== 3b. NAV ATAS TERSEMBUNYI + HALAMAN KHUSUS PENGUMUMAN ===");
  ok("nav atas disembunyikan di semua halaman", /body\[data-route\]\s*\.tb-nav\s*\{\s*display:\s*none/s.test(css));
  ok("tidak ada aturan yang menampilkan nav kembali", !/body\[data-route="beranda"\]\s*\.tb-nav\s*\{\s*display:\s*(flex|block)/s.test(css));
  ok("nav tersembunyi di halaman pengumuman", d.body.getAttribute("data-route") === "beranda");
  /* catatan: jsdom tidak memuat styles.css eksternal, jadi tes kelihatan-nav
     dilakukan lewat aturan CSS di atas + atribut data-route di sini */
  ok("link nav 'Pengumuman' → halaman khusus", !!$('#tbNav a[href="#/pengumuman"]'));
  ok("link menu mobile 'Papan Pengumuman' → halaman khusus", !!$('#mobileMenu .mm-links a[href="#/pengumuman"]'));
  ok("skrip anti-kedip mengenal rute pengumuman", /dikenal\s*=\s*\[[^\]]*"pengumuman"/.test(bootRoute));

  goto("#/masuk");
  const tautanPeng = $('#view .auth-alt a[href="#/pengumuman"]');
  ok("tautan pengumuman ada di halaman masuk", !!tautanPeng);
  click(tautanPeng);
  /* jsdom menavigasi anchor secara asinkron — beri satu tick agar hash diperbarui
     (browser asli memperbarui hash tepat saat klik juga) */
  await new Promise(r => setTimeout(r, 60));
  ok("ditekan → menuju halaman khusus pengumuman", w.location.hash === "#/pengumuman", w.location.hash);
  w.terapkanRute();
  ok("halaman khusus pengumuman tampil", !!$("#annGrid") && !!$("#pengumuman"));
  ok("rute bertanda pengumuman (nav tetap tersembunyi)", d.body.getAttribute("data-route") === "pengumuman", d.body.getAttribute("data-route"));
  ok("SEMUA pengumuman tampil di halaman khusus", $$("#annGrid .ann-card").length === K.semuaPengumuman().length, $$("#annGrid .ann-card").length + "/" + K.semuaPengumuman().length);
  ok("murni pengumuman — tanpa hero/pilar/fitur", !$(".hero") && !$(".pillar-grid") && !$("#fitur"));
  ok("tanpa footer (halaman murni pengumuman)", !$(".site-foot"));
  ok("halaman terkunci viewport — #view overflow hidden", /body\[data-route="pengumuman"\]\s*#view\s*\{[^}]*overflow:\s*hidden/s.test(css));
  ok("scroll halaman dikunci di body", /body\[data-route="pengumuman"\]\s*\{\s*overflow:\s*hidden/s.test(css));
  ok("daftar mengisi sisa ruang (gulir hanya di grid)", /body\[data-route="pengumuman"\][^{]*\.ann-grid\s*\{[^}]*overflow-y:\s*auto/s.test(css));
  ok("baris kartu selalu seukuran isi (max-content) — teks tak pernah terpotong", /body\[data-route="pengumuman"\][^{]*\.ann-grid\s*\{[^}]*grid-auto-rows:\s*max-content/s.test(css));
  ok("strategi layar pendek aktif (840px & 700px)", /@media \(max-height:\s*840px\)/.test(css) && /@media \(max-height:\s*700px\)/.test(css));
  ok("tidak mendarat di halaman lain", !$("#formMasuk") && !$(".wizard") && !$(".space"));

  goto("#/beranda");
  ok("landing #/beranda tetap utuh (hero + pilar + fitur)", !!$(".hero") && !!$("#jenjang") && !!$("#fitur"));
  ok("landing tetap menampilkan 6 kartu pengumuman", $$("#annGrid .ann-card").length === 6, String($$("#annGrid .ann-card").length));
  ok("footer 'Papan Pengumuman' → halaman khusus", !!$('.site-foot a[href="#/pengumuman"]'));

  console.log("=== 4. MODAL SEMUA PENGUMUMAN ===");
  click($("#btnSemuaPengumuman"));
  ok("modal terbuka", $("#modal").classList.contains("open"));
  ok("judul modal benar", $(".modal-head h3").textContent.includes("Semua Pengumuman"));
  ok("isi modal berisi kartu", $$(".modal-body .ann-card").length >= 8, String($$(".modal-body .ann-card").length));
  click($(".modal-head [data-tutup]"));
  ok("modal tertutup", !$("#modal").classList.contains("open"));

  console.log("=== 5. DAFTAR: WIZARD 3 LANGKAH (desain berbeda dari masuk) ===");
  goto("#/daftar");
  ok("halaman wizard tampil", !!$(".wizard"));
  ok("latar berbeda dari login (reg-page)", !!$(".reg-page") && !$(".auth-split"));
  ok("tautan pengumuman juga ada di halaman daftar", !!$('#view .auth-alt a[href="#/pengumuman"]'));
  ok("10 opsi jenjang/peran (termasuk Admin & Operator)", $$("#roleGrid .role-opt").length === 10, String($$("#roleGrid .role-opt").length));
  ok("3 langkah wizard", $$(".wiz-steps .ws").length === 3);
  ok("langkah 1 aktif", $('.wiz-step[data-step="1"]').classList.contains("on"));
  click($("#wNext1"));
  ok("lanjut tanpa pilihan ditolak", $("#errRole").style.display === "block" && $('.wiz-step[data-step="1"]').classList.contains("on"));
  click($$("#roleGrid .role-opt")[2]);
  ok("opsi Siswa SMA terpilih", $$("#roleGrid .role-opt")[2].classList.contains("on"));
  click($("#wNext1"));
  ok("pindah ke langkah 2", $('.wiz-step[data-step="2"]').classList.contains("on"));
  ok("tanda langkah 1 selesai", $('.ws[data-ws="1"]').classList.contains("done"));
  isi("#namaD", "Bu"); isi("#emailD", "budi");
  click($("#wNext2"));
  ok("nama pendek & email salah ditolak", $("#fNama").classList.contains("err") && $("#fEmail").classList.contains("err"));
  isi("#namaD", "Budi Santoso"); isi("#emailD", "budi@mail.com");
  click($("#wNext2"));
  ok("lanjut ke langkah 3", $('.wiz-step[data-step="3"]').classList.contains("on"));
  isi("#passD", "abc123"); isi("#passD2", "xyz789");
  submit("#formDaftar");
  ok("konfirmasi sandi beda ditolak", $("#fPass2").classList.contains("err") && !sesi());
  isi("#passD2", "abc123");
  submit("#formDaftar");
  ok("akun dibuat & sesi aktif", !!sesi());
  ok("nama sesi benar", sesi() && sesi().nama === "Budi Santoso", sesi() ? sesi().nama : "-");
  ok("peran siswa + jenjang mahir", sesi() && sesi().peran === "siswa" && sesi().jenjang === "mahir");
  ok("redirect ke pilih jenjang", w.location.hash === "#/pilih", w.location.hash);
  ok("chip user muncul", $("#userChip").classList.contains("show") && $("#userChip").textContent.includes("Budi"));
  ok("tombol masuk/daftar disembunyikan", $("#btnMasuk").style.display === "none" && $("#btnDaftar").style.display === "none");
  ok("user tersimpan", JSON.parse(w.localStorage.getItem("kuradapt_users")).length === 1);

  console.log("=== 6. PILIH JENJANG ===");
  ok("4 kartu jenjang", $$(".pick-card").length === 4, String($$(".pick-card").length));
  const unlocked = $$(".pick-card").filter(c => !c.disabled);
  ok("hanya jenjang mahir terbuka utk Siswa SMA", unlocked.length === 1 && unlocked[0].dataset.ruang === "mahir", unlocked.map(x => x.dataset.ruang).join(","));
  ok("3 kartu terkunci", $$(".pick-card.locked").length === 3);
  click(unlocked[0]);
  ok("masuk ruang #/r/mahir", w.location.hash === "#/r/mahir", w.location.hash);

  console.log("=== 7. RUANG JENJANG TERPISAH ===");
  ok("ruang bertanda data-j=mahir", $(".space").getAttribute("data-j") === "mahir");
  ok("judul ruang = Kuradapt Mahir", $(".space-head h1").textContent.includes("Kuradapt Mahir"));
  ok("7 tab ruang (termasuk Kegiatan)", $$("#spaceTabs button").length === 7, String($$("#spaceTabs button").length));
  ok("tab Kegiatan tersedia", !!$('#spaceTabs [data-tab="kegiatan"]'));
  ok("tab Beranda aktif", $('#spaceTabs [data-tab="beranda"]').classList.contains("on"));
  ok("statistik mapel ruang", $(".sh-stats").textContent.includes("Mapel"));
  goto("#/r/mini");
  ok("SISWA diblokir dari ruang lain", w.location.hash === "#/pilih", w.location.hash);
  goto("#/r/mahir");
  ok("kembali ke ruang sendiri", $(".space").getAttribute("data-j") === "mahir");

  console.log("=== 8. MATERI ===");
  click($('#spaceTabs [data-tab="materi"]'));
  const nMapel = $$("[data-mapel]").length;
  ok("daftar mapel SMA+SMK >= 10", nMapel >= 10, String(nMapel));
  ok("tab materi aktif", $('#spaceTabs [data-tab="materi"]').classList.contains("on"));
  click($("[data-mapel]"));
  const nBab = $$("[data-bab]").length;
  ok("daftar bab >= 4", nBab >= 4, String(nBab));
  click($("[data-bab]"));
  ok("materi bab terbuka", !!$(".material"));
  ok("isi materi panjang (>300 huruf)", ($(".m-body") || {}).textContent.length > 300, String(($(".m-body") || {}).textContent.length));
  ok("materi memuat heading/list/tabel", !!$(".m-body h4") || !!$(".m-body li") || !!$(".m-body table"));
  click($("#babSelesai"));
  ok("bab ditandai selesai (tersimpan)", (st().mahir && st().mahir.bab.length === 1), JSON.stringify(st().mahir || {}));
  ok("chip Selesai muncul", $(".m-meta").textContent.includes("Selesai"));
  click($("#babKembali"));
  ok("kembali ke daftar bab", $$("[data-bab]").length === nBab);
  ok("bab pertama bertanda selesai", $("[data-bab]").textContent.includes("Selesai"));
  click($("#matKembali"));
  ok("kembali ke daftar mapel", $$("[data-mapel]").length === nMapel);

  console.log("=== 9. LATIHAN: KUIS SAMPAI NILAI 100 ===");
  click($('#spaceTabs [data-tab="latihan"]'));
  ok("pilih mapel latihan", $$("[data-lat]").length === nMapel, String($$("[data-lat]").length));
  click($("[data-lat]"));
  ok("pilihan cakupan tampil", $$("[data-mulai]").length >= 5, String($$("[data-mulai]").length));
  click($("[data-mulai]"));
  let q = K.kuis();
  ok("kuis dimulai", !!q);
  const totalSoal = q ? q.soal.length : 0;
  ok("soal pada bab >= 5", totalSoal >= 5, String(totalSoal));
  ok("dots = jumlah soal", $$(".q-dots span").length === totalSoal, String($$(".q-dots span").length));
  for (let i = 0; i < totalSoal; i++) {
    q = K.kuis();
    const benar = q.soal[q.idx].a;
    click(d.querySelector('.q-opt[data-jwb="' + benar + '"]'));
    ok("soal " + (i + 1) + " jawaban benar", $("#qFeed").classList.contains("show") && $("#qFeed").classList.contains("ok"));
    ok("opsi benar tersorot", !!$(".q-opt.benar"));
    click($("#qNext"));
  }
  ok("layar hasil tampil", !!$(".q-result"));
  ok("nilai 100", $(".q-result .ring b").textContent.trim() === "100", $(".q-result .ring b").textContent);
  ok("0 soal salah", $(".q-result .r-meta").textContent.includes("0 salah"));
  ok("status tuntas", $(".q-result .r-meta").textContent.includes("Tuntas"));
  ok("remedial tidak muncul (semua benar)", !$("#qRemedial"));
  ok("nilai tersimpan ke progres", st().mahir && st().mahir.latihan[q.mapelId] && st().mahir.latihan[q.mapelId].terbaik === 100, JSON.stringify(st().mahir.latihan || {}));
  click($("#qSelesai"));
  ok("kembali ke pilihan mapel", !!$("[data-lat]") && !K.kuis());

  console.log("=== 10. LATIHAN: REMEDIAL ADAPTIF (jawab salah) ===");
  click($("[data-lat]"));
  click($("[data-mulai]"));
  q = K.kuis();
  const jml = q.soal.length;
  let salahCount = 0;
  for (let i = 0; i < jml; i++) {
    q = K.kuis();
    const s = q.soal[q.idx];
    const pilih = (s.a + 1) % s.o.length;
    if (pilih !== s.a) salahCount++;
    click(d.querySelector('.q-opt[data-jwb="' + pilih + '"]'));
    if (i === 0) ok("feedback salah muncul", $("#qFeed").classList.contains("no"));
    click($("#qNext"));
  }
  const nilaiSalah = Number($(".q-result .ring b").textContent.trim());
  ok("nilai < 100", nilaiSalah < 100, String(nilaiSalah));
  ok("tombol remedial muncul", !!$("#qRemedial"));
  ok("jumlah soal remedial = soal salah", $("#qRemedial").textContent.includes("(" + salahCount + " soal)"), $("#qRemedial").textContent.trim());
  click($("#qRemedial"));
  q = K.kuis();
  ok("mode remedial", q.mode === "remedial");
  ok("hanya soal salah yang diulang", q.soal.length === salahCount, q.soal.length + " vs " + salahCount);
  ok("label remedial tampil", $(".quiz-top").textContent.includes("Remedial"));
  for (let i = 0; i < salahCount; i++) {
    q = K.kuis();
    click(d.querySelector('.q-opt[data-jwb="' + q.soal[q.idx].a + '"]'));
    click($("#qNext"));
  }
  ok("remedial selesai nilai 100", $(".q-result .ring b").textContent.trim() === "100");
  click($("#qSelesai"));

  console.log("=== 11. TRANSCRIP NILAI NYATA ===");
  click($('#spaceTabs [data-tab="transkrip"]'));
  ok("tabel transkrip ada", !!$("#tabelTrans"));
  ok("baris = jumlah mapel", $$("#tabelTrans tbody tr").length === nMapel, $$("#tabelTrans tbody tr").length + " vs " + nMapel);
  const kolom = $$("#tabelTrans thead th").map(t => t.textContent).join("|");
  ok("kolom Tugas/UH/UAS/Akhir", ["Tugas", "UH", "UAS", "Akhir"].every(k => kolom.includes(k)), kolom);
  ok("kolom Predikat & Status", kolom.includes("Predikat") && kolom.includes("Status"));
  ok("predikat A–E tampil", $$("#tabelTrans .predikat").length === nMapel);
  ok("status tuntas/remedial tampil", $$("#tabelTrans .status-t").length === nMapel);
  ok("ringkasan rata-rata", $(".trans-sum").textContent.includes("Rata-rata"));
  ok("ringkasan KKM", $(".trans-sum").textContent.includes("KKM 75"));
  ok("identitas tercetak di transkrip", $(".trans-id").textContent.includes("Budi Santoso"));
  const rows = K.semuaMapel("mahir").map(m => K.nilaiMapel("mahir", m));
  ok("ATURAN INTI: semua komponen nilai mulai dari 0", rows.every(r => r.tugas === 0 && r.uh === 0 && r.uas === 0), JSON.stringify({ t: rows[0].tugas, u: rows[0].uh, a: rows[0].uas }));
  ok("nilai dasar = 0.3T+0.3U+0.4U", rows.every(r => r.dasar === Math.round(r.tugas * .3 + r.uh * .3 + r.uas * .4)));
  const mapelLat = Object.keys(st().mahir.latihan)[0];
  const rLat = rows.find(r => r.m.id === mapelLat);
  ok("mapel belum dikerjakan: akhir 0, predikat '—', status belum dikerjakan",
    rows.filter(r => !r.ada).every(r => r.akhir === 0 && r.predikat === "—" && r.status === "Belum dikerjakan"),
    JSON.stringify(rows.filter(r => !r.ada)[0] || {}));
  ok("predikat konsisten dengan nilai (yang sudah ada)", rows.filter(r => r.ada).every(r =>
    r.predikat === (r.akhir >= 90 ? "A" : r.akhir >= 80 ? "B" : r.akhir >= 70 ? "C" : r.akhir >= 60 ? "D" : "E")));
  ok("nilai latihan 100 ikut tercatat", rLat && rLat.latihan === 100, rLat ? String(rLat.latihan) : "-");
  ok("latihan dikerjakan → nilai akhir terisi (100, tuntas)", rLat && rLat.ada === true && rLat.akhir === 100 && rLat.tuntas === true, rLat ? String(rLat.akhir) : "-");
  const selTrans = $$("#tabelTrans tbody tr");
  ok("tabel menampilkan 0 untuk nilai kosong", rows.every((r, i) => {
    if (r.ada) return true;
    const td = selTrans[i] ? [...selTrans[i].querySelectorAll("td")] : [];
    /* kolom non-kuliah: 0=# 1=Mapel 2=Tugas 3=UH 4=UAS 5=Latihan 6=Akhir 7=Predikat 8=Status */
    return td.length > 6 && td[2].textContent === "0" && td[3].textContent === "0" && td[4].textContent === "0" && td[6].textContent === "0";
  }), rows.filter(r => !r.ada).length + " baris kosong");
  const nKosong = rows.filter(r => !r.ada).length;
  ok("label 'Belum dikerjakan' tampil di tabel", $$("#tabelTrans .status-t.kosong").length === nKosong,
    String($$("#tabelTrans .status-t.kosong").length) + "/" + nKosong);
  click($("#expTrans"));
  ok("ekspor CSV", (w.__dl || []).includes("transkrip-kuradapt.csv"), JSON.stringify(w.__dl));

  console.log("=== 12. DOKUMEN: SIMPAN / UNDUH / HAPUS ===");
  click($('#spaceTabs [data-tab="dokumen"]'));
  ok("zona unggah ada", !!$("#upZone"));
  ok("input file tersedia", !!$("#upInput"));
  ok("empty state sebelum unggah", $(".empty") && $(".empty").textContent.includes("Belum ada dokumen"));
  K.simpanDok({ id: "dok1", nama: "tugas-prakarya.pdf", ukuran: 20480, tipe: "application/pdf", tgl: new Date().toISOString(), data: "data:application/pdf;base64,SSBhbSBmaWxl", ruang: "mahir" });
  ok("daftar dokumen berisi 1", K.daftarDok().length === 1);
  K.renderTab();
  ok("item dokumen tampil", $(".doc-item") && $(".doc-item").textContent.includes("tugas-prakarya.pdf"));
  ok("ukuran & tanggal tampil", $(".doc-item").textContent.includes("KB"));
  ok("tombol unduh & hapus ada", !!$("[data-unduh]") && !!$("[data-hapus]"));
  click($("[data-hapus]"));
  ok("dokumen terhapus", K.daftarDok().length === 0);
  K.renderTab();
  ok("kembali ke empty state", $(".empty") !== null);

  console.log("=== 13. PENGUMUMAN LIVE OLEH TENAGA PENDIDIK ===");
  K.keluar();
  goto("#/daftar");
  ok("guru bisa didaftarkan", daftarCepat("guru", "Ibu Sari Wulandari", "guru@mail.com", "guru123"));
  goto("#/r/mini");
  ok("GURU masuk ruang mini", $(".space").getAttribute("data-j") === "mini");
  click($('#spaceTabs [data-tab="pengumuman"]'));
  ok("komposer pengumuman muncul utk guru", !!$("#annKirim"));
  isi("#annJudul", "Jadwal PTS Genap Kelas 5");
  isi("#annIsi", "PTS genap dilaksanakan Senin–Rabu minggu depan. Latihan adaptif Kuradapt Mini sudah diperbarui.");
  click($("#annKirim"));
  const baruSaya = K.semuaPengumuman().find(p => p.judul === "Jadwal PTS Genap Kelas 5");
  ok("pengumuman tersimpan", !!baruSaya);
  ok("penulis = guru yang masuk", baruSaya && baruSaya.penulis === "Ibu Sari Wulandari");
  ok("jenjang mini", baruSaya && baruSaya.jenjang === "mini");
  ok("tampil di papan ruang", $("#ruangAnn").textContent.includes("Jadwal PTS Genap Kelas 5"));
  goto("#/beranda");
  ok("tampil live di landing", $("#annGrid").textContent.includes("Jadwal PTS Genap Kelas 5"));
  ok("pengumuman baru ditandai BARU", $$("#annGrid .baru").length >= 1);

  console.log("=== 14. PEMISAHAN RUANG & PENJAGA PERAN ===");
  K.keluar();
  ok("sesi kosong setelah keluar", !sesi());
  goto("#/pilih");
  ok("#/pilih tanpa akun → diarahkan masuk", w.location.hash === "#/masuk", w.location.hash);
  goto("#/r/tinggi");
  ok("#/ruang tanpa akun → diarahkan masuk", w.location.hash === "#/masuk");
  ok("tombol masuk tampil lagi", $("#btnMasuk").style.display !== "none");
  ok("chip user disembunyikan", !$("#userChip").classList.contains("show"));

  console.log("=== 15. LAYAR MASUK (desain berbeda dari daftar) ===");
  ok("desain split, bukan wizard", !!$(".auth-split") && !$(".reg-page"));
  ok("panel visual kiri ada", !!$(".auth-visual"));
  ok("form masuk ada", !!$("#formMasuk"));
  ok("tautan ke daftar ada", $('a[href="#/daftar"]') !== null);
  isi("#emailM", "budi@mail.com"); isi("#passM", "salah123");
  submit("#formMasuk");
  ok("sandu salah ditolak", !sesi() && $("#fPassM").classList.contains("err"));
  isi("#passM", "abc123");
  submit("#formMasuk");
  ok("masuk berhasil", sesi() && sesi().nama === "Budi Santoso");
  ok("arahkan ke pilih jenjang", w.location.hash === "#/pilih");

  console.log("=== 16. TRANSCRIP KULIAH (SKS + IPK) ===");
  K.keluar();
  ok("mahasiswa baru dibuat", daftarCepat("mahasiswa", "Alya Putri", "alya@mail.com", "kuliah1"));
  goto("#/r/tinggi");
  ok("mahasiswa masuk ruang tinggi", $(".space").getAttribute("data-j") === "tinggi");
  click($('#spaceTabs [data-tab="transkrip"]'));
  const kolomK = $$("#tabelTrans thead th").map(t => t.textContent).join("|");
  ok("kolom SKS & Bobot", kolomK.includes("SKS") && kolomK.includes("Bobot"), kolomK);
  ok("kode matkul prefiks KUL-", $$("#tabelTrans tbody td")[0].textContent.startsWith("KUL-"), $$("#tabelTrans tbody td")[0].textContent);
  ok("IPK 4.00 tampil", $(".trans-sum").textContent.includes("IPK"));
  const rowsK = K.semuaMapel("tinggi").map(m => K.nilaiMapel("tinggi", m));
  ok("SKS 2–4 per mata kuliah", rowsK.every(r => r.sks >= 2 && r.sks <= 4));
  ok("bobot huruf 0–4", rowsK.every(r => r.bobot >= 0 && r.bobot <= 4));
  ok("guru tidak bisa buka ruang dosen/mahasiswa?", (() => { K.keluar(); daftarCepat("guru", "Pak Andi", "andi@mail.com", "andi12"); goto("#/r/tinggi"); return w.location.hash === "#/pilih"; })(), w.location.hash);

  console.log("=== 17. KEGIATAN BERSAMA (tenaga pendidik membuka, peserta bergabung) ===");
  goto("#/r/mini");
  ok("guru masuk ruang mini", $(".space").getAttribute("data-j") === "mini");
  click($('#spaceTabs [data-tab="kegiatan"]'));
  ok("tab kegiatan aktif", $('#spaceTabs [data-tab="kegiatan"]').classList.contains("on"));
  ok("komposer kegiatan utk guru", !!$("#kgBuat"));
  const nKgAwal = $$(".kg-card").length;
  ok("kartu kegiatan seed tampil", nKgAwal >= 1, String(nKgAwal));
  ok("status live/akan/selesai tampil", $$(".kg-status").length === nKgAwal);
  isi("#kgJudul", "Kelas Live IPA Semester Genap");
  click($("#kgBuat"));
  ok("kegiatan tersimpan", K.semuaKegiatan().some(k => k.judul === "Kelas Live IPA Semester Genap"));
  ok("kartu kegiatan bertambah", $$(".kg-card").length === nKgAwal + 1, String($$(".kg-card").length));
  const tombolGabung = $('[data-kg="kg2"] [data-gabung]');
  ok("peserta bisa bergabung", !!tombolGabung);
  if (tombolGabung) {
    click(tombolGabung);
    const kg2 = K.semuaKegiatan().find(k => k.id === "kg2");
    ok("nama peserta masuk daftar", kg2.peserta.indexOf("Pak Andi") > -1, kg2.peserta.join(","));
    ok("tombol berubah jadi Tinggalkan", !!$('[data-kg="kg2"] [data-tinggal]'));
  }
  const tombolStatus = $('[data-kg="kg2"] [data-status-kg]');
  ok("guru bisa ubah status kegiatan", !!tombolStatus);
  if (tombolStatus) {
    click(tombolStatus);
    ok("status kg2 → berlangsung", K.semuaKegiatan().find(k => k.id === "kg2").status === "berlangsung");
  }
  ok("guru TIDAK punya tab Kelola", !$('#spaceTabs [data-tab="kelola"]'));

  console.log("=== 18. ADMIN SISTEM: PANEL KELOLA + HALAMAN #/admin ===");
  K.keluar();
  ok("admin bisa didaftarkan", daftarCepat("admin", "Admin Utama", "admin@mail.com", "admin12"));
  goto("#/pilih");
  ok("admin akses 4 jenjang", K.jenjangSaya(sesi()).length === 4, K.jenjangSaya(sesi()).join(","));
  ok("semua kartu jenjang terbuka", $$(".pick-card:not(.locked)").length === 4, String($$(".pick-card:not(.locked)").length));
  ok("tombol Panel Admin ada", !!$("#goAdmin2"));
  ok("form tukar kode undangan ada", !!$("#undInput") && !!$("#undTukar"));
  goto("#/r/mahir");
  ok("admin punya tab Kelola", !!$('#spaceTabs [data-tab="kelola"]'));
  click($('#spaceTabs [data-tab="kelola"]'));
  ok("panel kelola tampil", !!$("#undBuat"));
  ok("statistik kelola ada", $$(".stat-card").length === 4);
  isi("#undJenjang", "mahir");
  click($("#undBuat"));
  const kodeRuang = K.semuaUndangan().slice(-1)[0];
  ok("kode undangan ruang dibuat", !!kodeRuang && kodeRuang.jenjang === "mahir", kodeRuang ? kodeRuang.kode : "-");
  ok("format kode KA-XXXX-NN", !!kodeRuang && /^KA-[A-Z0-9]{4}-\d{2}$/.test(kodeRuang.kode), kodeRuang ? kodeRuang.kode : "");
  ok("daftar kode tampil di panel", $("#undList").textContent.includes(kodeRuang.kode));
  isi("#undJenjang", "tinggi");
  click($("#undBuat"));
  const kodeBaru = K.semuaUndangan().slice(-1)[0];
  ok("admin bisa pilih jenjang tujuan kode", !!kodeBaru && kodeBaru.jenjang === "tinggi", kodeBaru ? kodeBaru.kode + "/" + kodeBaru.jenjang : "-");
  ok("kode tinggi tersimpan", K.semuaUndangan().filter(u => u.jenjang === "tinggi").length >= 1);
  goto("#/admin");
  ok("halaman admin terender", !!$(".admin-page"));
  ok("4 kartu jenjang di panel admin", $$(".admin-page .pick-card").length === 4, String($$(".admin-page .pick-card").length));
  ok("statistik platform (4 kartu)", $$(".admin-page .stat-card").length === 4);
  ok("daftar pengguna tampil", $(".admin-page").textContent.includes("Admin Utama"));
  ok("daftar kegiatan tampil", $(".admin-page").textContent.includes("Kelas Live IPA Semester Genap"));
  ok("daftar undangan tampil", $(".admin-page").textContent.includes(kodeBaru.kode));
  click($$(".admin-page .pick-card")[0]);
  ok("klik kartu ruang → buka ruang", w.location.hash.indexOf("#/r/") === 0, w.location.hash);

  console.log("=== 19. OPERATOR JENJANG: PANEL KELOLA ===");
  K.keluar();
  ok("operator bisa didaftarkan", daftarCepat("operator", "Operator Mahir", "op@mail.com", "op1234"));
  goto("#/pilih");
  ok("operator panelKelola = true", K.panelKelola(sesi()));
  goto("#/r/mahir");
  ok("operator punya tab Kelola", !!$('#spaceTabs [data-tab="kelola"]'));
  click($('#spaceTabs [data-tab="kelola"]'));
  ok("panel kelola operator tampil", !!$("#undBuat"));
  ok("operator TIDAK lihat tombol Panel Admin", !$("#goAdmin"));
  goto("#/admin");
  ok("operator diblokir dari #/admin", w.location.hash === "#/pilih", w.location.hash);
  goto("#/r/mini");
  ok("operator bisa tulis pengumuman (bisaTulis)", K.bisaTulis(sesi(), "mini"));

  console.log("=== 20. UNDANGAN: TUKAR KODE → AKSES JENJANG TAMBAHAN ===");
  K.keluar();
  ok("siswa baru bisa didaftarkan", daftarCepat("siswa-sma", "Rina Amelia", "rina@mail.com", "rina12"));
  goto("#/pilih");
  ok("siswa awal hanya 1 jenjang", K.jenjangSaya(sesi()).length === 1, K.jenjangSaya(sesi()).join(","));
  ok("kartu tinggi terkunci", $$('.pick-card[data-ruang="tinggi"][disabled]').length === 1);
  isi("#undInput", "KA-SALAH-99");
  click($("#undTukar"));
  ok("kode salah ditolak", K.jenjangSaya(sesi()).length === 1);
  isi("#undInput", kodeBaru.kode);
  click($("#undTukar"));
  ok("kode sah diterima", K.jenjangSaya(sesi()).indexOf("tinggi") > -1, K.jenjangSaya(sesi()).join(","));
  ok("kartu tinggi terbuka", $$('.pick-card[data-ruang="tinggi"]:not([disabled])').length === 1);
  ok("akses tersimpan di akun", (JSON.parse(w.localStorage.getItem("kuradapt_users")).find(u => u.email === "rina@mail.com").undangan || []).indexOf("tinggi") > -1);
  goto("#/r/tinggi");
  ok("peserta masuk ruang tinggi via kode", $(".space").getAttribute("data-j") === "tinggi");

  console.log("=== 21. TRANSCRIP SISWA BARU = SEMUA NOL ===");
  K.keluar();
  ok("siswa baru bisa didaftarkan", daftarCepat("siswa-sma", "Dina Permata", "dina@mail.com", "dina12"));
  goto("#/r/mahir");
  ok("masuk ruang mahir", $(".space").getAttribute("data-j") === "mahir");
  click($('#spaceTabs [data-tab="transkrip"]'));
  const barisDina = $$("#tabelTrans tbody tr");
  ok("baris transkrip = jumlah mapel", barisDina.length >= 10, String(barisDina.length));
  const rowsDina = K.semuaMapel("mahir").map(m => K.nilaiMapel("mahir", m));
  ok("BELUM dikerjakan → akhir 0 semua", rowsDina.every(r => r.ada === false && r.akhir === 0));
  ok("Tugas/UH/UAS tampil 0 di tabel", barisDina.every(tr => {
    const td = [...tr.querySelectorAll("td")];
    return td[2].textContent === "0" && td[3].textContent === "0" && td[4].textContent === "0" && td[6].textContent === "0";
  }));
  ok("predikat '—' untuk semua baris", $$("#tabelTrans .predikat.kosong").length === barisDina.length,
    String($$("#tabelTrans .predikat.kosong").length) + "/" + barisDina.length);
  ok("status 'Belum dikerjakan' semua baris", $$("#tabelTrans .status-t.kosong").length === barisDina.length &&
    $("#tabelTrans").textContent.includes("Belum dikerjakan"));
  ok("ringkasan rata-rata menampilkan — (belum ada nilai)", $(".trans-sum").textContent.includes("—"));
  ok("catatan aturan nilai0 tampil", $(".trans-sum").textContent.includes("Sudah Dinilai"));

  console.log("=== 22. GURU: PANTAU PROGRES + INPUT NILAI ===");
  K.keluar();
  ok("guru baru bisa didaftarkan", daftarCepat("guru", "Pak Bima Saputra", "bima@mail.com", "bima12"));
  goto("#/r/mahir");
  ok("guru punya tab Pantau", !!$('#spaceTabs [data-tab="pantau"]'));
  click($('#spaceTabs [data-tab="pantau"]'));
  ok("tab pantau aktif", $('#spaceTabs [data-tab="pantau"]').classList.contains("on"));
  ok("tabel pantau tampil", !!$("#tabelPantau"));
  ok("peserta Dina terpantau", $("#tabelPantau").textContent.includes("Dina Permata"));
  ok("status awal peserta = belum dikerjakan", $("#tabelPantau").textContent.includes("Belum dikerjakan"));
  ok("tombol input nilai per peserta", $$("[data-input-nilai]").length >= 1, String($$("[data-input-nilai]").length));
  ok("form tambah pelajaran ada", !!$("#mxTambah"));
  const tombolDina = $('[data-input-nilai="dina@mail.com"]');
  ok("baris Dina punya tombol input nilai", !!tombolDina, $$("[data-input-nilai]").map(b => b.dataset.inputNilai).join(","));
  click(tombolDina);
  ok("modal input nilai terbuka", $("#modal").classList.contains("open") && !!$("#nkMapel"));
  ok("nilai awal modal = 0 semua", $("#nkTugas").value === "0" && $("#nkUh").value === "0" && $("#nkUas").value === "0");
  isi("#nkTugas", "80"); isi("#nkUh", "70"); isi("#nkUas", "90");
  click($("#nkSimpan"));
  ok("modal tertutup setelah simpan", !$("#modal").classList.contains("open"));
  const m1 = K.semuaMapel("mahir")[0];
  const g1 = K.ambilNilaiGuru("mahir", "dina@mail.com", m1.id);
  ok("nilai tersimpan 80/70/90", g1 && g1.tugas === 80 && g1.uh === 70 && g1.uas === 90, JSON.stringify(g1));
  ok("nilai dicatat oleh penginput", g1 && g1.oleh === "Pak Bima Saputra", g1 ? g1.oleh : "-");
  ok("baris peserta kini '1 mapel dinilai'", $("#tabelPantau").textContent.includes("1 mapel dinilai"));
  ok("rata nilai peserta = 81 (bobot 30/30/40)", K.ringkasPeserta("mahir", { email: "dina@mail.com" }).rataNilai === 81,
    String(K.ringkasPeserta("mahir", { email: "dina@mail.com" }).rataNilai));

  console.log("=== 23. TRANSCRIP SISWA TERISI SETELAH DIINPUT GURU ===");
  K.keluar();
  ok("Dina bisa masuk kembali", K.masuk("dina@mail.com", "dina12"));
  goto("#/r/mahir");
  click($('#spaceTabs [data-tab="transkrip"]'));
  const baris1 = $$("#tabelTrans tbody tr")[0];
  const td1 = [...baris1.querySelectorAll("td")];
  ok("baris mapel dinilai guru", td1[2].textContent === "80" && td1[3].textContent === "70" && td1[4].textContent === "90",
    [td1[1].textContent, td1[2].textContent, td1[3].textContent, td1[4].textContent].join("/"));
  ok("nilai akhir 81 dihitung benar", td1[6].textContent === "81", td1[6].textContent);
  ok("predikat B & status Tuntas", baris1.querySelector(".predikat").textContent === "B" && baris1.textContent.includes("Tuntas"));
  ok("mapel lain tetap 0", $$("#tabelTrans tbody tr").slice(1).every(tr => [...tr.querySelectorAll("td")][6].textContent === "0"));
  ok("ringkasan rata-rata kini 81", $(".trans-sum").textContent.includes("81"));

  console.log("=== 24. CRUD PENGUMUMAN (TERBIT / UBAH / HAPUS) ===");
  K.keluar();
  ok("guru Bima masuk lagi", K.masuk("bima@mail.com", "bima12"));
  goto("#/r/mahir");
  click($('#spaceTabs [data-tab="pengumuman"]'));
  ok("komposer muncul utk guru", !!$("#annKirim"));
  isi("#annJudul", "Jadwal Asesmen SMA Semester Genap");
  isi("#annIsi", "Asesmen semester genap dilaksanakan awal bulan depan. Persiapkan latihan adaptif di ruang Kuradapt Mahir.");
  click($("#annKirim"));
  const annBaru = K.semuaPengumuman().find(p => p.judul === "Jadwal Asesmen SMA Semester Genap");
  ok("pengumuman baru tersimpan", !!annBaru);
  ok("kartu punya tombol Ubah & Hapus",
    !!$('[data-ann="' + annBaru.id + '"] [data-ann-edit]') && !!$('[data-ann="' + annBaru.id + '"] [data-ann-hapus]'));
  click($('[data-ann="' + annBaru.id + '"] [data-ann-edit]'));
  ok("mode ubah: form terisi otomatis", $("#annJudul").value === "Jadwal Asesmen SMA Semester Genap");
  ok("tombol Simpan Perubahan & Batal", $("#annKirim").textContent.includes("Simpan") && !!$("#annBatal"));
  isi("#annJudul", "Jadwal Asesmen SMA Semester Genap (DIPERBARUI)");
  click($("#annKirim"));
  const annUbah = K.semuaPengumuman().find(p => p.id === annBaru.id);
  ok("judul berhasil diperbarui", annUbah && annUbah.judul.includes("DIPERBARUI"), annUbah ? annUbah.judul : "-");
  ok("tidak dobel (merge by id)", K.semuaPengumuman().filter(p => p.id === annBaru.id).length === 1);
  click($('[data-ann="' + annBaru.id + '"] [data-ann-hapus]'));
  ok("modal konfirmasi hapus muncul", $("#modal").classList.contains("open") && !!$("#okHapusAnn"));
  click($("#okHapusAnn"));
  ok("pengumuman buatan terhapus", !K.semuaPengumuman().some(p => p.id === annBaru.id));
  goto("#/r/mini");
  click($('#spaceTabs [data-tab="pengumuman"]'));
  ok("seed p1 tampil di ruang mini", !!$('[data-ann="p1"]'));
  click($('[data-ann="p1"] [data-ann-hapus]'));
  click($("#okHapusAnn"));
  ok("seed p1 bisa dihapus (pola merge dihapus)", !K.semuaPengumuman().some(p => p.id === "p1"));
  ok("hilang dari papan ruang", !$('[data-ann="p1"]'));

  console.log("=== 25. TAMBAH PELAJARAN + SOAL INPUT GURU ===");
  goto("#/r/mahir");
  click($('#spaceTabs [data-tab="pantau"]'));
  isi("#mxNama", "Sejarah Lokal Nusantara");
  isi("#mxRingkas", "Pelajaran tambahan karya pengajar");
  click($("#mxTambah"));
  const mx = K.mapelCustom("mahir").find(m => m.nama === "Sejarah Lokal Nusantara");
  ok("pelajaran tambahan tersimpan", !!mx);
  ok("tampil di daftar pelajaran tambahan", $("#spaceBody").textContent.includes("Sejarah Lokal Nusantara"));
  ok("ikut masuk semuaMapel ruang", K.semuaMapel("mahir").some(m => m.id === mx.id));
  click($('#spaceTabs [data-tab="materi"]'));
  click($('[data-mapel="' + mx.id + '"]'));
  ok("form tambah bab muncul utk pengajar", !!$("#babTambah"));
  isi("#babJudul", "Pengantar Sejarah Nusantara");
  isi("#babIsi", "<p>Materi pengantar sejarah Nusantara: kronologi, sumber, dan metode penelitian sejarah lokal.</p>");
  click($("#babTambah"));
  const mxSetelah = K.cariMapelCustom("mahir", mx.id);
  ok("bab pelajaran tersimpan", mxSetelah && mxSetelah.bab.length === 1, mxSetelah ? String(mxSetelah.bab.length) : "-");
  ok("bab tampil di daftar", $("#spaceBody").textContent.includes("Pengantar Sejarah Nusantara"));
  click($('#spaceTabs [data-tab="latihan"]'));
  ok("komposer buat soal muncul utk guru", !!$("#pkTambah"));
  isi("#pkJudul", "Latihan Sejarah Pengantar");
  isi("#pkMapel", mx.id);
  isi("#pkSoal", "Siapa yang dikenal sebagai mahapatih Kerajaan Majapahit?");
  isi("#pkO1", "Gajah Mada"); isi("#pkO2", "Ken Arok"); isi("#pkO3", "Mpu Sindok"); isi("#pkO4", "Hayam Wuruk");
  isi("#pkKunci", "A");
  isi("#pkBahas", "Gajah Mada adalah mahapatih Majapahit yang terkenal dengan Sumpah Palapa.");
  click($("#pkTambah"));
  ok("soal masuk draf", K.ruang().draftSoal && K.ruang().draftSoal.soal.length === 1,
    K.ruang().draftSoal ? String(K.ruang().draftSoal.soal.length) : "-");
  ok("tombol terbitkan paket muncul", !!$("#pkTerbit"));
  click($("#pkTerbit"));
  const paket = K.semuaPaket("mahir").find(p => p.judul === "Latihan Sejarah Pengantar");
  ok("paket soal terbit & tersimpan", !!paket && paket.soal.length === 1, paket ? String(paket.soal.length) : "-");
  ok("paket tampil di daftar", $("#spaceBody").textContent.includes("Latihan Sejarah Pengantar"));

  K.keluar();
  ok("Dina masuk untuk mengerjakan soal guru", K.masuk("dina@mail.com", "dina12"));
  goto("#/r/mahir");
  click($('#spaceTabs [data-tab="latihan"]'));
  ok("paket tampil utk siswa", $("#spaceBody").textContent.includes("Latihan Sejarah Pengantar"));
  ok("siswa TIDAK punya komposer buat soal", !$("#pkTambah"));
  click($("[data-paket]"));
  const qPaket = K.kuis();
  ok("kuis paket dimulai (sumber=paket)", !!qPaket && qPaket.sumber === "paket", qPaket ? qPaket.sumber : "-");
  click(d.querySelector('.q-opt[data-jwb="' + qPaket.soal[qPaket.idx].a + '"]'));
  click($("#qNext"));
  ok("nilai paket 100", $(".q-result .ring b").textContent.trim() === "100");
  click($("#qSelesai"));
  ok("nilai latihan tersimpan ke progres (mapel custom)", st().mahir.latihan[mx.id] && st().mahir.latihan[mx.id].terbaik === 100,
    JSON.stringify(st().mahir.latihan[mx.id] || {}));
  click($('#spaceTabs [data-tab="transkrip"]'));
  const barisMx = $$("#tabelTrans tbody tr").find(tr => tr.textContent.includes("Sejarah Lokal Nusantara"));
  ok("pelajaran tambahan muncul di transkrip", !!barisMx);
  ok("nilainya 100 & Tuntas (dari soal guru)", barisMx && barisMx.textContent.includes("100") && barisMx.textContent.includes("Tuntas"));

  K.keluar();
  ok("guru masuk untuk mengelola paket", K.masuk("bima@mail.com", "bima12"));
  goto("#/r/mahir");
  click($('#spaceTabs [data-tab="latihan"]'));
  ok("guru punya tombol hapus paket", !!$("[data-hapus-paket]"));
  click($("[data-hapus-paket]"));
  ok("modal konfirmasi hapus paket", !!$("#okHapusPaket"));
  click($("#okHapusPaket"));
  ok("paket soal terhapus", K.semuaPaket("mahir").length === 0, String(K.semuaPaket("mahir").length));

  console.log("=== 26. PENGELOLA: PENDAFTARAN WAJIB KODE UNDANGAN ===");
  K.keluar();
  goto("#/daftar");
  ok("10 opsi pendaftaran tetap", $$("#roleGrid .role-opt").length === 10, String($$("#roleGrid .role-opt").length));
  const optAdmin = $$("#roleGrid .role-opt").find(b => b.dataset.op === "admin");
  click(optAdmin);
  click($("#wNext1"));
  isi("#namaD", "Admin Baru"); isi("#emailD", "admin2@mail.com");
  click($("#wNext2"));
  isi("#passD", "admin2x"); isi("#passD2", "admin2x");
  ok("field kode undangan tampil utk Admin", $("#fKodePeng").style.display !== "none");
  ok("catatan kewajiban kode tampil", $("#catatanPeng").textContent.includes("kode undangan"));
  submit("#formDaftar");
  ok("tanpa kode → pendaftaran ditolak", !sesi() && $("#fKodePeng").classList.contains("err"));
  isi("#kodePeng", "KA-SALAH-00");
  submit("#formDaftar");
  ok("kode salah tetap ditolak", !sesi());
  isi("#kodePeng", kodeBaru.kode);
  submit("#formDaftar");
  ok("kode sah → akun pengelola dibuat", sesi() && sesi().peran === "admin", sesi() ? sesi().peran : "-");
  const undList2 = JSON.parse(w.localStorage.getItem("kuradapt_undangan"));
  const undBaru = undList2.find(u => u.kode === kodeBaru.kode);
  ok("kode tercatat dipakai pendaftar baru", undBaru && undBaru.dipakai.indexOf("admin2@mail.com") > -1);

  console.log("=== 27. SUPER ADMIN: PENDAFTAR PERTAMA + KODE MASTER ===");
  K.keluar();
  goto("#/daftar");
  ok("belum ada Super Admin → tawaran pendaftaran pertama", !!$("#daftarSuper") && $("#catatanSuper").textContent.includes("Super Admin"));
  click($("#daftarSuper"));
  ok("mode Super Admin aktif", $("#catatanSuper").classList.contains("brand") && $("#catatanSuper").textContent.includes("Mode"));
  click($("#wNext1"));
  ok("tanpa memilih kartu pun boleh lanjut (mode super)", $('.wiz-step[data-step="2"]').classList.contains("on"));
  isi("#namaD", "Bos Kuradapt"); isi("#emailD", "super1@mail.com");
  click($("#wNext2"));
  isi("#passD", "super1x"); isi("#passD2", "super1x");
  submit("#formDaftar");
  ok("akun Super Admin pertama dibuat", sesi() && sesi().peran === "super", sesi() ? sesi().peran : "-");
  ok("tersimpan di daftar pengguna", JSON.parse(w.localStorage.getItem("kuradapt_users")).some(u => u.peran === "super"));
  ok("diarahkan ke layar pilih ruang", w.location.hash === "#/pilih", w.location.hash);

  goto("#/admin");
  ok("panel admin terbuka utk super", !!$(".admin-page"));
  ok("kontrak: tepat 4 kartu statistik", $$(".admin-page .stat-card").length === 4, String($$(".admin-page .stat-card").length));
  ok("bagian Kewenangan Pengelola tampil", $(".admin-page").textContent.includes("Kewenangan Pengelola"));
  ok("tombol Buat Kode Master ada", !!$("#buatMaster"));
  ok("kewenangan admin2 terlihat", $(".admin-page").textContent.includes("admin2@mail.com"));
  click($("#buatMaster"));
  const master = K.semuaUndangan().find(u => u.jenjang === "super");
  ok("kode MASTER diterbitkan", !!master && master.peran === "super", master ? master.kode : "-");
  ok("penerbitan kode tercatat di audit log", K.semuaLog().some(l => l.pesan.includes("MASTER")));

  K.keluar();
  goto("#/daftar");
  ok("setelah super ada → tawaran pertama hilang", !$("#daftarSuper") && $("#catatanSuper").textContent.includes("kode undangan MASTER"));
  click($('#roleGrid .role-opt[data-op="admin"]'));
  click($("#wNext1"));
  isi("#namaD", "Bos Kedua"); isi("#emailD", "super2@mail.com");
  click($("#wNext2"));
  ok("field kode undangan tampil utk Admin", $("#fKodePeng").style.display !== "none");
  isi("#kodePeng", master.kode);
  isi("#passD", "super2x"); isi("#passD2", "super2x");
  submit("#formDaftar");
  ok("pemegang kode MASTER → Super Admin", sesi() && sesi().peran === "super", sesi() ? sesi().peran : "-");
  ok("kode MASTER tercatat dipakai", K.semuaUndangan().find(u => u.kode === master.kode).dipakai.indexOf("super2@mail.com") > -1);

  console.log("=== 28. VERIFIKASI LEMBAGA: PILIH LEMBAGA → MENUNGGU → DISETUJUI ===");
  K.keluar();
  goto("#/daftar");
  click($('#roleGrid .role-opt[data-op="siswa-sma"]'));
  click($("#wNext1"));
  isi("#namaD", "Siswa Lembaga"); isi("#emailD", "lem@mail.com");
  const ubahSel = (sel, val) => { const el = $(sel); if (!el) return false; el.value = val; el.dispatchEvent(new w.Event("change", { bubbles: true })); return true; };
  ok("dropdown provinsi terisi (38 provinsi)", $$("#fProv option").length >= 30, String($$("#fProv option").length));
  ubahSel("#fProv", "Jakarta");
  ok("kabupaten menyusul terisi & aktif", $$("#fKab option").length > 1 && !$("#fKab").disabled, String($$("#fKab option").length));
  ubahSel("#fKab", "Jakarta Pusat");
  ok("lembaga tersedia untuk kota tersebut", $$("#fLembaga option").some(o => o.value === "NPSN-20101001"));
  isi("#fLembaga", "NPSN-20101001");
  isi("#fNisn", "0098765432");
  click($("#wNext2"));
  isi("#passD", "lem123"); isi("#passD2", "lem123");
  submit("#formDaftar");
  const uLem = JSON.parse(w.localStorage.getItem("kuradapt_users")).find(u => u.email === "lem@mail.com");
  ok("pendaftar ber-lembaga → menunggu verifikasi", uLem && uLem.verif === "menunggu", uLem ? String(uLem.verif) : "-");
  ok("data lembaga & NISN tersimpan", uLem && uLem.lembaga && uLem.lembaga.id === "NPSN-20101001" && uLem.nisn === "0098765432");
  ok("tidak langsung masuk (diarahkan ke halaman masuk)", !sesi() && w.location.hash === "#/masuk", w.location.hash);
  goto("#/masuk");
  isi("#emailM", "lem@mail.com"); isi("#passM", "lem123");
  submit("#formMasuk");
  ok("masuk ditolak selama menunggu verifikasi", !sesi());
  ok("form masuk tetap tampil", !!$("#formMasuk"));

  K.masuk("super2@mail.com", "super2x");
  goto("#/admin");
  ok("antrean verifikasi tampil (1)", $(".admin-page").textContent.includes("Pendaftaran Menunggu Verifikasi Lembaga (1)"));
  ok("tombol setujui ada", !!$('[data-verif-ok="lem@mail.com"]'));
  click($('[data-verif-ok="lem@mail.com"]'));
  const uLem2 = JSON.parse(w.localStorage.getItem("kuradapt_users")).find(u => u.email === "lem@mail.com");
  ok("verifikasi disetujui", uLem2 && !uLem2.verif, uLem2 ? String(uLem2.verif) : "-");
  ok("antrean kosong (0)", $(".admin-page").textContent.includes("Pendaftaran Menunggu Verifikasi Lembaga (0)"));
  ok("persetujuan tercatat di audit log", K.semuaLog().some(l => l.tipe === "verifikasi" && l.pesan.includes("Lembaga disetujui: lem@mail.com")));
  K.keluar();
  goto("#/masuk");
  isi("#emailM", "lem@mail.com"); isi("#passM", "lem123");
  submit("#formMasuk");
  ok("setelah disetujui → masuk berhasil", sesi() && sesi().email === "lem@mail.com", sesi() ? sesi().email : "-");
  K.keluar();

  console.log("=== 29. PERPUSTAKAAN DIGITAL: TAMBAH / BACA LANGSUNG / HAPUS ===");
  K.masuk("super2@mail.com", "super2x");
  goto("#/perpustakaan");
  ok("rute perpustakaan terbuka", $(".pick-head").textContent.includes("Perpustakaan Digital"));
  const nBuku0 = K.semuaBuku().length;
  ok("judul awal tersedia (seed)", nBuku0 > 0, String(nBuku0));
  ok("form tambah tampil utk super", !!$("#bkTambah"));
  isi("#bkJudul", "Modul Uji Tahap 2"); isi("#bkPenulis", "DAFFTECH");
  isi("#bkRingkas", "Modul uji otomatis skrip pengujian.");
  isi("#bkIsi", "Isi modul uji tahap dua untuk pengujian alur perpustakaan digital.");
  click($("#bkTambah"));
  ok("buku bertambah", K.semuaBuku().length === nBuku0 + 1, String(K.semuaBuku().length));
  const bukuBaru = K.semuaBuku().find(b => b.judul === "Modul Uji Tahap 2");
  ok("buku tampil di daftar", !!bukuBaru && $("#view").textContent.includes("Modul Uji Tahap 2"));
  ok("penambahan tercatat di audit log", K.semuaLog().some(l => l.pesan.includes("Buku ditambahkan: Modul Uji Tahap 2")));

  const nDl0 = (w.__dl || []).length;
  ok("tombol Unduh .txt sudah dihapus", !$("[data-unduh-buku]") && !$("#unduhBukuModal"));
  const tbBaca = $$("[data-baca]").find(b => bukuBaru && b.dataset.baca === bukuBaru.id);
  ok("tombol Baca ada", !!tbBaca);
  if (tbBaca) click(tbBaca);
  ok("Baca → mode baca langsung di halaman (bukan modal)",
    !$("#modal").classList.contains("open") && !!$(".material .bk-isi"));
  ok("isi buku tampil penuh", $("#view").textContent.includes("Isi modul uji tahap dua"));
  ok("tidak ada unduh .txt yang tercatat", (w.__dl || []).length === nDl0, JSON.stringify(w.__dl));
  ok("tombol kembali ke daftar ada", !!$("#bkKembali"));
  if ($("#bkKembali")) click($("#bkKembali"));
  ok("kembali → daftar judul lagi", !!$(".pick-head") && $$("[data-baca]").length === nBuku0 + 1,
    String($$("[data-baca]").length));
  const tbHapus = $$("[data-hapus-buku]").find(b => bukuBaru && b.dataset.hapusBuku === bukuBaru.id);
  ok("tombol Hapus ada utk super", !!tbHapus);
  if (tbHapus) click(tbHapus);
  ok("konfirmasi hapus muncul", $("#modalBox").textContent.includes("Hapus judul buku?"));
  click($("#okHapusBuku"));
  ok("buku terhapus dari daftar", !K.semuaBuku().some(b => bukuBaru && b.id === bukuBaru.id));
  ok("jumlah kembali seperti awal", K.semuaBuku().length === nBuku0, String(K.semuaBuku().length));
  ok("penghapusan tercatat di audit log", K.semuaLog().some(l => l.pesan.includes("Buku dihapus")));

  console.log("=== 30. SISTEM KURIKULUM: VERSI BARU → BERLAKU, RIWAYAT UTUH ===");
  goto("#/kurikulum");
  ok("rute kurikulum terbuka", $(".pick-head h1").textContent.includes("Kurikulum"));
  ok("filter jenjang tersedia", $$("#kurFilter [data-kur-j]").length >= 4, String($$("#kurFilter [data-kur-j]").length));
  ok("form versi baru tampil utk super", !!$("#kurTambah"));
  const mini0 = K.kurikulumJenjang("mini");
  ok("kurikulum mini awal: 2 versi (riwayat v1 + berlaku v2)", mini0.length === 2, String(mini0.length));
  isi("#kurJudul", "Kurikulum Merdeka"); isi("#kurVersi", "v3.0");
  isi("#kurPeriode", "2026/2027"); isi("#kurCatatan", "Pembaruan tahap uji.");
  isi("#kurJenjang", "mini");
  click($("#kurTambah"));
  const mini1 = K.kurikulumJenjang("mini");
  ok("versi baru tersimpan", mini1.length === 3, String(mini1.length));
  ok("tepat SATU versi berlaku", mini1.filter(k => k.status === "berlaku").length === 1, String(mini1.filter(k => k.status === "berlaku").length));
  ok("versi berlaku = v3.0 baru", mini1.find(k => k.status === "berlaku").versi === "v3.0");
  ok("riwayat v1 & v2 tetap tersimpan", mini1.some(k => k.versi === "v1.0") && mini1.some(k => k.versi === "v2.0"));
  ok("tampilan menandai 'Berlaku saat ini'", $("#kurIsi").textContent.includes("Berlaku saat ini"));
  const idV2 = mini1.find(k => k.versi === "v2.0").id;
  ok("versi lama bisa dijadikan berlaku lagi", !!$('#kurIsi [data-berlaku="' + idV2 + '"]'));
  click($('#kurIsi [data-berlaku="' + idV2 + '"]'));
  const mini2 = K.kurikulumJenjang("mini");
  ok("v2.0 kembali berlaku", mini2.find(k => k.versi === "v2.0").status === "berlaku");
  ok("v3.0 otomatis jadi riwayat (diganti)", mini2.find(k => k.versi === "v3.0").status === "diganti");
  ok("riwayat tetap utuh 3 versi", mini2.length === 3 && mini2.filter(k => k.status === "berlaku").length === 1, String(mini2.length));
  ok("audit log kurikulum terisi", K.semuaLog().some(l => l.tipe === "kurikulum"));

  console.log("=== 31. JADWAL PERTEMUAN ONLINE (TAB KEGIATAN) ===");
  w.open = () => null; /* jsdom tidak memiliki window.open asli */
  goto("#/r/mahir");
  ok("super masuk ruang mahir", $(".space").getAttribute("data-j") === "mahir");
  click($('#spaceTabs [data-tab="kegiatan"]'));
  ok("tab Kegiatan aktif", $('#spaceTabs [data-tab="kegiatan"]').classList.contains("on"));
  ok("form jadwal pertemuan tampil", !!$("#jdBuat") && !!$("#jdGrid"));
  const nJd0 = K.semuaJadwal().length;
  isi("#jdJudul", "Rapat Uji Tahap 2");
  isi("#jdTautan", "https://meet.google.com/abc-defg-hij");
  click($("#jdBuat"));
  ok("jadwal tersimpan", K.semuaJadwal().length === nJd0 + 1, String(K.semuaJadwal().length));
  const jdBaru = K.semuaJadwal().slice(-1)[0];
  ok("kode undangan otomatis RAPAT-XXXX", jdBaru.kode.indexOf("RAPAT-") === 0, jdBaru.kode);
  ok("kartu jadwal tampil di grid", !!$('[data-jd="' + jdBaru.id + '"]'));
  click($('[data-gabung-jd="' + jdBaru.id + '"]'));
  ok("gabung tercatat di audit log", K.semuaLog().some(l => l.pesan.includes("Bergabung ke pertemuan")));
  click($('[data-hapus-jd="' + jdBaru.id + '"]'));
  ok("konfirmasi hapus jadwal muncul", $("#modalBox").textContent.includes("Hapus jadwal pertemuan?"));
  click($("#okHapusJd"));
  ok("jadwal terhapus dari daftar aktif", !K.semuaJadwal().some(j => j.id === jdBaru.id));
  ok("kartu hilang dari grid", !$('[data-jd="' + jdBaru.id + '"]'));

  console.log("=== 32. KONEKSI DUNIA INDUSTRI: TERBIT → AJUKAN IZIN → IZINKAN ===");
  goto("#/industri");
  ok("rute industri terbuka", $(".pick-head").textContent.includes("Koneksi Dunia Industri"));
  ok("form terbit tampil utk super", !!$("#inTambah"));
  const nIn0 = K.semuaPosting().length;
  isi("#inJudul", "Magang Uji Tahap 2");
  isi("#inPerusahaan", "PT Uji Terpadu");
  isi("#inIsi", "Program magang uji otomatis untuk pengujian alur koneksi industri.");
  click($("#inTambah"));
  ok("posting terbit", K.semuaPosting().length === nIn0 + 1, String(K.semuaPosting().length));
  const inBaru = K.semuaPosting().find(p => p.judul === "Magang Uji Tahap 2");
  ok("kartu posting tampil", !!inBaru && $("#view").textContent.includes("Magang Uji Tahap 2"));
  ok("penerbitan tercatat di audit log", K.semuaLog().some(l => l.pesan.includes("Magang Uji Tahap 2")));

  K.keluar();
  ok("peserta pertama terdaftar", daftarCepat("siswa-sma", "Peserta Industri", "indu@mail.com", "indu12"));
  goto("#/industri");
  const tombolAjukan = $$("[data-ajukan]").find(b => inBaru && b.dataset.ajukan === inBaru.id);
  ok("tombol Ajukan Izin tampil untuk peserta", !!tombolAjukan);
  if (tombolAjukan) click(tombolAjukan);
  const p1 = K.semuaPosting().find(p => inBaru && p.id === inBaru.id);
  ok("pengajuan tersimpan (menunggu)", p1 && p1.pendaftar.length === 1 && p1.pendaftar[0].status === "menunggu");
  ok("chip Menunggu tampil di kartu", $("#view").textContent.includes("Menunggu"));

  K.keluar();
  K.masuk("super2@mail.com", "super2x");
  goto("#/industri");
  const tombolKelola = $$("[data-pendaftar]").find(b => inBaru && b.dataset.pendaftar === inBaru.id);
  ok("tombol Kelola Pendaftar tampil", !!tombolKelola);
  if (tombolKelola) click(tombolKelola);
  ok("modal pendaftar terbuka", $("#modalBox").textContent.includes("Pendaftar"));
  const tbIzin = $('[data-izin][data-pe="indu@mail.com"]');
  ok("tombol Izinkan ada", !!tbIzin);
  if (tbIzin) click(tbIzin);
  const p2 = K.semuaPosting().find(p => inBaru && p.id === inBaru.id);
  ok("izin diberikan", p2 && p2.pendaftar[0].status === "diizinkan", p2 ? p2.pendaftar[0].status : "-");
  ok("pemberian izin tercatat di audit log", K.semuaLog().some(l => l.pesan.includes("Izin akses diberikan")));

  K.keluar();
  ok("peserta kedua terdaftar", daftarCepat("siswa-sma", "Peserta Tolak", "tolak@mail.com", "tolak12"));
  goto("#/industri");
  const tbAjukan2 = $$("[data-ajukan]").find(b => inBaru && b.dataset.ajukan === inBaru.id);
  if (tbAjukan2) click(tbAjukan2);
  K.keluar();
  K.masuk("super2@mail.com", "super2x");
  goto("#/industri");
  const tbKelola2 = $$("[data-pendaftar]").find(b => inBaru && b.dataset.pendaftar === inBaru.id);
  if (tbKelola2) click(tbKelola2);
  const tbTolak = $('[data-tolak][data-pe="tolak@mail.com"]');
  ok("tombol Tolak ada", !!tbTolak);
  if (tbTolak) click(tbTolak);
  const p3 = K.semuaPosting().find(p => inBaru && p.id === inBaru.id);
  ok("pengajuan kedua ditolak", p3 && p3.pendaftar.find(x => x.email === "tolak@mail.com") && p3.pendaftar.find(x => x.email === "tolak@mail.com").status === "ditolak");

  console.log("=== 33. AUDIT LOG & INSIDEN KEAMANAN ===");
  goto("#/admin");
  ok("kontrak: tepat 4 kartu statistik", $$(".admin-page .stat-card").length === 4, String($$(".admin-page .stat-card").length));
  ok("stack audit log tampil", !!$("#logStack"));
  ok("riwayat berisi aksi sebelumnya", $("#logStack").textContent.includes("Magang Uji Tahap 2") || $("#logStack").textContent.includes("Izin akses"));
  isi("#insJudul", "Uji insiden tahap 2"); isi("#insDetail", "dicatat otomatis oleh skrip pengujian");
  isi("#insTingkat", "tinggi");
  click($("#insSimpan"));
  ok("insiden masuk log", K.semuaLog().some(l => l.tipe === "insiden" && l.pesan.includes("Uji insiden tahap 2")));
  ok("chip merah insiden tampil", !!$("#logStack .chip.red"));
  click($("#logBersih"));
  ok("log bisa dibersihkan", K.semuaLog().length === 0, String(K.semuaLog().length));
  ok("stack kosong menampilkan pesan ramah", $("#logStack").textContent.includes("Belum ada aktivitas"));

  console.log("=== 34. BATAS 5 PERCOBAAN MASUK (ANTI BRUTE-FORCE) ===");
  K.keluar();
  ok("akun uji kunci terdaftar", daftarCepat("siswa-sma", "Uji Kunci", "kunci@mail.com", "kunci12"));
  K.keluar();
  goto("#/masuk");
  for (let i = 1; i <= 5; i++) {
    isi("#emailM", "kunci@mail.com"); isi("#passM", "salah-" + i);
    submit("#formMasuk");
  }
  const stGagal = K.statusGagal("kunci@mail.com");
  ok("5 percobaan gagal tercatat", stGagal.n === 5, String(stGagal.n));
  ok("akun terkunci 5 menit", stGagal.terkunci === true);
  ok("insiden keamanan tercatat", K.semuaLog().some(l => l.tipe === "insiden" && l.pesan.includes("Percobaan masuk berulang")));
  isi("#emailM", "kunci@mail.com"); isi("#passM", "kunci12");
  submit("#formMasuk");
  ok("sandi benar pun tetap ditolak saat terkunci", !sesi());
  K.hapusGagal("kunci@mail.com");
  ok("kunci bisa direset pengelola", K.statusGagal("kunci@mail.com").n === 0);

  console.log("=== 35. MFA OPSIONAL: TAHAP KEDUA SAAT MASUK ===");
  K.masuk("super2@mail.com", "super2x");
  goto("#/admin");
  ok("MFA awal nonaktif", K.pengaturanMfa().aktif === false);
  click($("#mfaToggle"));
  const setMfa = K.pengaturanMfa();
  ok("MFA diaktifkan", setMfa.aktif === true);
  ok("kode 6 digit dibuat", /^\d{6}$/.test(String(setMfa.kode)), String(setMfa.kode));
  ok("panel menampilkan kode demo", $(".admin-page").textContent.includes("Kode demo"));
  K.keluar();
  goto("#/masuk");
  isi("#emailM", "super2@mail.com"); isi("#passM", "super2x");
  submit("#formMasuk");
  ok("masuk ditahan di tahap MFA", !sesi() && $("#fMfa").style.display !== "none");
  ok("kode demo ditampilkan di form", $("#mfaCatatan").textContent.includes(String(setMfa.kode)));
  isi("#mfaM", "000000");
  submit("#formMasuk");
  ok("kode salah ditolak", !sesi() && $("#fMfa").classList.contains("err"));
  isi("#mfaM", String(setMfa.kode));
  submit("#formMasuk");
  ok("kode benar → masuk berhasil", sesi() && sesi().peran === "super", sesi() ? sesi().peran : "-");
  goto("#/admin");
  click($("#mfaToggle"));
  ok("MFA dinonaktifkan kembali (rapikan)", K.pengaturanMfa().aktif === false);

  console.log("=== 36. KEAMANAN: HASH SANDI v2, INTEGRITAS SESI & CSP ===");
  /* ---- a. format hash sandi v2 + salt unik per akun ---- */
  K.keluar();
  const daftarS1 = K.daftar({ opsi: "siswa-sma", nama: "Uji Sandi A", email: "sandi@mail.com", pass: "rahasia99" });
  const daftarS2 = K.daftar({ opsi: "siswa-sma", nama: "Uji Sandi B", email: "sandi2@mail.com", pass: "rahasia99" });
  const bacaUsers = () => JSON.parse(w.localStorage.getItem("kuradapt_users"));
  const recS1 = bacaUsers().find(u => u.email === "sandi@mail.com");
  const recS2 = bacaUsers().find(u => u.email === "sandi2@mail.com");
  ok("pendaftar uji sandi tersimpan", daftarS1 && daftarS2 && !!recS1 && !!recS2);
  ok("format hash v2: k2$iterasi$salt$hash", /^k2\$3000\$[0-9a-f]{16}\$[0-9a-f]{64}$/.test(recS1.pass), recS1.pass);
  ok("salt acak → sandi sama, hash berbeda", recS1.pass !== recS2.pass);
  ok("setiap catatan bertanda integritas (_sig)", /^[0-9a-f]{64}$/.test(recS1._sig || ""));
  ok("kunci HMAC per instalasi tersimpan", /^[0-9a-f]{64}$/.test(w.localStorage.getItem("kuradapt_key") || ""));
  ok("masuk dengan sandi benar", K.masuk("sandi@mail.com", "rahasia99") && K.sesi() && K.sesi().email === "sandi@mail.com");
  K.keluar();
  ok("masuk dengan sandi salah ditolak", !K.masuk("sandi@mail.com", "salah-salah") && K.sesi() === null);

  /* ---- b. akun lama (djb2) → verifikasi lalu naik versi otomatis ---- */
  const djb2 = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h; };
  const usersLama = bacaUsers();
  usersLama.push({ nama: "Akun Lawas", email: "lawas@mail.com", pass: "k$" + djb2("lawas123").toString(36), peran: "siswa", jenjang: "mahir", tgl: new Date().toISOString() });
  w.localStorage.setItem("kuradapt_users", JSON.stringify(usersLama));
  w.localStorage.removeItem("kuradapt_v2"); /* biarkan migrasi satu kali berjalan */
  ok("akun format lama (djb2) tetap bisa masuk", K.masuk("lawas@mail.com", "lawas123"));
  const recLawas = bacaUsers().find(u => u.email === "lawas@mail.com");
  ok("sandinya otomatis dinaikkan ke k2$", /^k2\$3000\$/.test(recLawas.pass), recLawas.pass);
  ok("record lama ikut ditandai integritas", /^[0-9a-f]{64}$/.test(recLawas._sig || ""));
  K.keluar();

  /* ---- c. injeksi HTML/XSS jadi teks biasa ---- */
  K.daftar({ opsi: "siswa-sma", nama: '<img src=x onerror="alert(1)">', email: "xss@mail.com", pass: "xss1234" });
  K.masuk("xss@mail.com", "xss1234");
  goto("#/pilih");
  ok("nama berisi markup dirender sebagai teks", $("#view h1") && $("#view h1").textContent.indexOf("<img") > -1, $("#view h1") ? $("#view h1").textContent : "-");
  ok("tidak ada elemen beracun di DOM", d.querySelectorAll("img[onerror]").length === 0 && d.querySelectorAll("#view img").length === 0);
  K.keluar();

  /* ---- d. sesi dimodifikasi (naik hak paksa) → ditolak + insiden ---- */
  K.masuk("sandi@mail.com", "rahasia99");
  ok("sesi aktif sebelum dimodifikasi", K.sesi() && K.sesi().peran === "siswa");
  const sesiUji = JSON.parse(w.localStorage.getItem("kuradapt_sesi"));
  sesiUji.d.peran = "super";
  w.localStorage.setItem("kuradapt_sesi", JSON.stringify(sesiUji));
  ok("sesi hasil suntingan ditolak sistem", K.sesi() === null);
  ok("insiden perubahan sesi tercatat", K.semuaLog().some(l => l.tipe === "insiden" && l.pesan.includes("tanda integritas")));
  ok("sisa sesi bersih dari penyimpanan", w.localStorage.getItem("kuradapt_sesi") === "null");

  /* ---- e. sesi kedaluwarsa 8 jam → otomatis keluar ---- */
  K.masuk("sandi@mail.com", "rahasia99");
  ok("masuk lagi untuk uji kedaluwarsa", K.sesi() !== null);
  const jamAsli = w.Date.now;
  w.Date.now = () => jamAsli() + 9 * 3600000; /* majukan jam 9 jam */
  const sesiHabis = K.sesi();
  w.Date.now = jamAsli;
  ok("sesi lewat 8 jam → keluar otomatis", sesiHabis === null && K.sesi() === null);
  ok("kedaluwarsa tercatat di audit log", K.semuaLog().some(l => l.pesan.includes("kedaluwarsa")));

  /* ---- f. catatan pengguna diedit (paksa naik peran) → dibuang + insiden ---- */
  K.daftar({ opsi: "siswa-sma", nama: "Korban Ubah", email: "ubah@mail.com", pass: "ubah123" });
  const usersUji = bacaUsers();
  usersUji.find(u => u.email === "ubah@mail.com").peran = "super";
  w.localStorage.setItem("kuradapt_users", JSON.stringify(usersUji));
  ok("record yang diedit tidak dipercaya", K.masuk("ubah@mail.com", "ubah123") === false);
  ok("insiden perubahan data tercatat", K.semuaLog().some(l => l.tipe === "insiden" && l.pesan.includes("Catatan pengguna dimodifikasi")));
  ok("record rusak terbuang dari daftar", !bacaUsers().some(u => u.email === "ubah@mail.com"));

  /* ---- g. kunci berjenjang: 5 gagal → 5 menit, 10 → 15, 15 → 30 ---- */
  const sisaMenit = email => {
    const g = (JSON.parse(w.localStorage.getItem("kuradapt_gagal") || "{}"))[email];
    return g && g.sampai ? Math.round((g.sampai - w.Date.now()) / 60000) : 0;
  };
  K.hapusGagal("jenjang@mail.com");
  for (let i = 0; i < 5; i++) K.catatGagal("jenjang@mail.com");
  ok("5 gagal → kunci 5 menit", K.statusGagal("jenjang@mail.com").terkunci && sisaMenit("jenjang@mail.com") === 5, String(sisaMenit("jenjang@mail.com")));
  for (let i = 0; i < 5; i++) K.catatGagal("jenjang@mail.com");
  ok("10 gagal → kunci 15 menit", K.statusGagal("jenjang@mail.com").terkunci && sisaMenit("jenjang@mail.com") === 15, String(sisaMenit("jenjang@mail.com")));
  for (let i = 0; i < 5; i++) K.catatGagal("jenjang@mail.com");
  ok("15 gagal → kunci 30 menit", K.statusGagal("jenjang@mail.com").terkunci && sisaMenit("jenjang@mail.com") === 30, String(sisaMenit("jenjang@mail.com")));
  K.hapusGagal("jenjang@mail.com");
  ok("kunci bisa direset pengelola", K.statusGagal("jenjang@mail.com").n === 0);

  /* ---- h. tautan berbahaya (javascript:) ditolak saat disimpan ---- */
  const nJdUji = K.semuaJadwal().length;
  K.buatJadwal({ id: "jd-uji-xss", judul: "Rapat Berbahaya", tautan: "javascript:alert(1)", kode: "X", platform: "Zoom", waktu: new Date().toISOString(), durasi: 60, jenjang: "mahir", pembuat: "Uji", peran: "guru", tgl: new Date().toISOString() });
  ok("tautan javascript: ditolak disimpan", K.semuaJadwal().length === nJdUji, String(K.semuaJadwal().length));
  ok("penolakan tautan tercatat di audit", K.semuaLog().some(l => l.pesan.includes("Tautan ditolak")));
  K.buatJadwal({ id: "jd-uji-ok", judul: "Rapat Sah", tautan: "https://meet.google.com/xxx-yyyy-zzz", kode: "X", platform: "Meet", waktu: new Date().toISOString(), durasi: 60, jenjang: "mahir", pembuat: "Uji", peran: "guru", tgl: new Date().toISOString() });
  ok("tautan https diterima", K.semuaJadwal().length === nJdUji + 1, String(K.semuaJadwal().length));
  K.hapusJadwal("jd-uji-ok");

  /* ---- i. CSP tanpa 'unsafe-inline' + berkas keamanan pendukung ---- */
  const cspMeta = (html.match(/Content-Security-Policy"\s+content="([^"]+)"/) || [])[1] || "";
  const scriptSrc = (cspMeta.match(/script-src [^;]+/) || [""])[0].trim();
  ok("CSP aktif di meta index.html", !!cspMeta);
  ok("script-src hanya 'self' (tanpa unsafe-inline)", scriptSrc === "script-src 'self'", scriptSrc);
  ok("tidak ada skrip inline di index.html", !/<script(?![^>]*\ssrc=)/i.test(html));
  ok("anti-kedip tema di boot.js eksternal", /<script src="boot\.js"><\/script>/.test(html) && fs.readFileSync(DIR + "\\boot.js", "utf8").includes("kuradapt_theme"));
  ok("anti-kedip rute di boot-route.js eksternal", /<script src="boot-route\.js"><\/script>/.test(html) && bootRoute.includes("dikenal"));
  const berkasHeader = fs.existsSync(DIR + "\\_headers") ? fs.readFileSync(DIR + "\\_headers", "utf8") : "";
  ok("_headers memuat HSTS + nosniff + anti-frame", /Strict-Transport-Security/.test(berkasHeader) && /X-Content-Type-Options/.test(berkasHeader) && /X-Frame-Options/.test(berkasHeader));
  ok("_headers memuat salinan CSP", /Content-Security-Policy/.test(berkasHeader));
  ok("penjaga window.open hanya izinkan http(s)",
    appSrc.indexOf('window.open(j.tautan, "_blank", "noopener")') > -1 &&
    appSrc.indexOf('/^https?:\\/\\//i.test(j.tautan)') > -1);

  console.log("=== 37. PUSAT PEMBERITAHUAN & PROFIL PENGGUNA ===");
  /* ---- a. modul notif: saringan jenjang, alamat, peran luas ---- */
  K.keluar();
  ok("guru bisa didaftarkan", daftarCepat("guru", "Pak Notif", "gnot@mail.com", "guru1234"));
  const nt37a = K.kirimNotif({ tipe: "soal", judul: "Soal Baru Matematika", pesan: "Pak Notif mengirim 10 soal latihan.", ke: "*", jenjang: ["mahir"], dari: "Pak Notif", rujuk: "#/r/mahir" });
  ok("kirimNotif menghasilkan id nt…", /^nt/.test(nt37a || ""), String(nt37a));
  ok("catatan tersimpan di penyimpanan", K.semuaNotif().some(n => n.id === nt37a));
  ok("tenaga pendidik menerima notif ruang (penyaring luas)", K.notifSaya().some(n => n.id === nt37a));
  ok("jumlah belum dibaca > 0", K.belumDibaca() > 0, String(K.belumDibaca()));

  K.keluar();
  ok("siswa jenjang mahir bisa didaftarkan", daftarCepat("siswa-sma", "Siswa Notif", "snot@mail.com", "siswa123"));
  ok("siswa menerima notif ruangnya", K.notifSaya().some(n => n.id === nt37a));
  const nt37mini = K.kirimNotif({ tipe: "soal", judul: "Soal Khusus SD", pesan: "hanya ruang mini", ke: "*", jenjang: ["mini"] });
  ok("notif ruang lain TIDAK masuk daftar siswa", !K.notifSaya().some(n => n.id === nt37mini));
  const nt37org = K.kirimNotif({ tipe: "nilai", judul: "Nilai Orang Lain", pesan: "uji alamat", ke: "bukan-saya@mail.com" });
  ok("notif ber-alamat orang lain TIDAK masuk", !K.notifSaya().some(n => n.id === nt37org));
  const nt37saya = K.kirimNotif({ tipe: "nilai", judul: "Nilai Anda", pesan: "UAS 90 — sangat baik.", ke: "snot@mail.com", rujuk: "#/r/mahir" });
  ok("notif ber-alamat sendiri MASUK", K.notifSaya().some(n => n.id === nt37saya));

  /* ---- b. penandaan dibaca ---- */
  const blm37 = K.belumDibaca();
  K.bacaNotif(nt37saya);
  ok("satu notif ditandai dibaca", K.belumDibaca() === blm37 - 1, K.belumDibaca() + "/" + (blm37 - 1));
  K.bacaSemuaNotif();
  ok("tandai semua → nol belum dibaca", K.belumDibaca() === 0, String(K.belumDibaca()));
  ok("status dibaca tercatat per pengguna", (K.semuaNotif().find(n => n.id === nt37saya) || { dibaca: [] }).dibaca.indexOf("snot@mail.com") > -1);

  /* ---- c. kapasitas penyimpanan dibatasi 200 ---- */
  for (let i = 0; i < 205; i++) K.kirimNotif({ tipe: "kegiatan", judul: "Banjir " + i, pesan: "uji kapasitas" });
  ok("penyimpanan notif dibatasi 200 entri", K.semuaNotif().length === 200, String(K.semuaNotif().length));
  w.localStorage.setItem("kuradapt_notif", "[]");
  K.perbaruiBadgeNotif();
  ok("riwayat bisa dikosongkan untuk uji lanjutan", K.semuaNotif().length === 0);

  /* ---- d. lapis notifikasi browser (Notification API) ---- */
  w.__pop37 = [];
  w.Notification = function (title, opts) {
    this.title = title; this.body = opts && opts.body;
    w.__pop37.push({ title: title, body: this.body });
  };
  w.Notification.permission = "granted";
  w.Notification.requestPermission = () => Promise.resolve("granted");
  K.kirimNotif({ tipe: "dokumen", judul: "Dokumen untuk Anda", pesan: "jurnal-praktikum.pdf siap diunduh.", ke: "snot@mail.com" });
  ok("notifikasi sistem terpicu saat izin granted", w.__pop37.length === 1 && w.__pop37[0].title.indexOf("Kuradapt · Dokumen untuk Anda") === 0,
    JSON.stringify(w.__pop37.map(x => x.title)));
  K.kirimNotif({ tipe: "dokumen", judul: "Dokumen Orang Lain", pesan: "bukan milik Anda", ke: "bukan@mail.com" });
  ok("notif orang lain tidak muncul di perangkat ini", w.__pop37.length === 1, String(w.__pop37.length));
  let izin37 = null;
  K.mintaNotifBrowser(x => { izin37 = x; });
  ok("permintaan izin browser dikabulkan", izin37 === "ya", String(izin37));

  /* ---- e. lapis jembatan email Google (Web App Apps Script) ---- */
  w.KURADAPT_CONFIG.NOTIF_WEBHOOK = "https://script.google.com/macros/s/AKfycb3VzdC9leGVj";
  w.__kirim37 = [];
  w.fetch = (url, opts) => { w.__kirim37.push({ url: url, opts: opts }); return Promise.resolve({ ok: true }); };
  K.kirimNotif({ tipe: "pengumuman", judul: "Ujian Umum", pesan: "Besok pukul 07.00 di aula.", ke: "*", jenjang: ["mahir"], dari: "Pak Notif" });
  ok("webhook Google dipanggil", w.__kirim37.length === 1 && w.__kirim37[0].url === w.KURADAPT_CONFIG.NOTIF_WEBHOOK,
    JSON.stringify(w.__kirim37[0] || {}));
  const body37 = w.__kirim37.length ? JSON.parse(w.__kirim37[0].opts.body) : {};
  ok("body memuat daftar email tujuan", Array.isArray(body37.ke) && body37.ke.indexOf("snot@mail.com") > -1, JSON.stringify(body37.ke));
  ok("subjek & pengirim terisi", String(body37.subjek || "").indexOf("Kuradapt · Ujian Umum") === 0 && !!body37.dari);
  ok("mode no-cors + Content-Type text/plain", w.__kirim37[0].opts.mode === "no-cors" &&
    String(w.__kirim37[0].opts.headers["Content-Type"]).indexOf("text/plain") === 0);
  K.kirimNotif({ tipe: "keamanan", judul: "Uji Tujuan Terbatas", pesan: "kepada pengguna lain", ke: "bukan@mail.com" });
  ok("email hanya dikirim ke tujuan yang cocok", w.__kirim37.length === 1, String(w.__kirim37.length));

  /* ---- f. UI lonceng topbar + panel ---- */
  goto("#/pilih");
  ok("tombol lonceng tampil saat masuk", $("#btnNotif").style.display !== "none");
  ok("badge menampilkan angka belum dibaca", $("#notifJml").hidden === false && Number($("#notifJml").textContent) >= 1,
    $("#notifJml").textContent);
  click($("#btnNotif"));
  ok("panel pemberitahuan terbuka", !$("#notifPanel").hidden);
  ok("panel memuat daftar item", $$("#notifPanel .np-item").length >= 1, String($$("#notifPanel .np-item").length));
  ok("item baru ditandai", $$("#notifPanel .np-item.baru").length >= 1);
  ok("panel punya pintasan profil & izin browser", !!$("#npProfil") && !!$("#npBrowser"));
  click($("#npBacaAll"));
  ok("tandai semua dari panel → badge hilang", $("#notifJml").hidden === true);
  click($("#btnNotif"));
  ok("klik lonceng sekali lagi menutup panel", $("#notifPanel").hidden === true);
  click($("#btnNotif"));
  d.body.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  ok("klik di luar panel menutupnya", $("#notifPanel").hidden === true);
  click($("#btnNotif"));
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  ok("Escape menutup panel", $("#notifPanel").hidden === true);

  /* ---- g. halaman profil & bio ---- */
  goto("#/profil");
  ok("rute #/profil terender", !!$(".profil-page"));
  ok("nama profil sesuai akun aktif", $(".nama-profil").textContent === "Siswa Notif", $(".nama-profil").textContent);
  ok("email & peran tampil", $(".profil-page").textContent.includes("snot@mail.com") && $(".profil-page").textContent.includes("Siswa"));
  ok("tepat 4 kartu statistik profil (bukan .stat-card)", $$(".profil-page .pf-stat").length === 4, String($$(".profil-page .pf-stat").length));
  ok("riwayat pemberitahuan tampil", $$(".pf-notif .list-item").length >= 1, String($$(".pf-notif .list-item").length));
  ok("status jembatan email Google ditampilkan", $(".profil-page").textContent.includes("Email Google"));
  ok("ruang jenjang saya tercantum", !!$('.profil-page [data-ruang="mahir"]'));
  goto("#/pilih");
  click($("#userChip"));
  ok("chip topbar membuka #/profil", w.location.hash === "#/profil" && !!$(".profil-page"), w.location.hash);
  click($("#pfGanti"));
  ok("modal bio terbuka", $("#modal").classList.contains("open") && !!$("#bioInput"));
  isi("#bioInput", "Siswa kelas 12, gemar matematika dan karya ilmiah.");
  click($("#bioSimpan"));
  const recBio = JSON.parse(w.localStorage.getItem("kuradapt_users")).find(u => u.email === "snot@mail.com");
  ok("bio tersimpan di catatan akun", String(recBio.bio).includes("gemar matematika"), recBio.bio);
  ok("bio tampil kembali di halaman", $("#pfBioTeks").textContent.includes("gemar matematika"));
  ok("modal tertutup setelah disimpan", !$("#modal").classList.contains("open"));

  /* ---- h. tombol profil: anggota ruang, kartu pengumuman ---- */
  goto("#/r/mahir");
  ok("tombol anggota ruang tersedia", !!$("#shAnggota"));
  ok("jumlah anggota terhitung", Number($("#shAnggota b").textContent) >= 1, $("#shAnggota b").textContent);
  click($("#shAnggota"));
  ok("modal daftar anggota terbuka", $("#modal").classList.contains("open") && $("#modalBox").textContent.includes("Anggota"));
  ok("anggota tercantum", $$("#modalBox .list-item").length >= 1, String($$("#modalBox .list-item").length));
  click($("#modalBox [data-profil]"));
  ok("klik anggota → modal profil orang itu", $("#modalBox").textContent.includes("Profil pengguna") && !!$("#modalBox .nama-profil"),
    $("#modalBox .nama-profil") ? $("#modalBox .nama-profil").textContent : "-");
  click($("[data-tutup]"));
  K.pengumumanBaru({ id: "p-uji-prof", judul: "Pengumuman Profil", isi: "Uji tombol profil penulis pada kartu pengumuman.", penulis: "Pak Notif", peran: "guru", email: "gnot@mail.com", jenjang: "mahir", tgl: new Date().toISOString() });
  goto("#/r/mahir/pengumuman");
  ok("tombol profil penulis menempel di kartu", !!$('[data-profil="gnot@mail.com"]'));
  click($('[data-profil="gnot@mail.com"]'));
  ok("klik penulis → modal profil penulis", $("#modalBox").textContent.includes("Pak Notif") && !!$("#modalBox .nama-profil"));
  click($("[data-tutup]"));

  /* ---- i. kontrak berkas rilis v3.4.1 ---- */
  ok('boot-route mengenali rute "profil"', bootRoute.indexOf('"profil"') > -1);
  const csp37 = (html.match(/Content-Security-Policy"\s+content="([^"]+)"/) || [])[1] || "";
  ok("CSP connect-src mengizinkan script.google.com", /connect-src[^;]*script\.google\.com/.test(csp37));
  const hdr37 = fs.existsSync(DIR + "\\_headers") ? fs.readFileSync(DIR + "\\_headers", "utf8") : "";
  ok("_headers ikut mengizinkan script.google.com", /script\.google\.com/.test(hdr37));
  ok("config.js menyediakan kunci NOTIF_WEBHOOK", fs.readFileSync(DIR + "\\config.js", "utf8").indexOf("NOTIF_WEBHOOK") > -1);
  ok("service worker memakai cache rilis v3.4.1", fs.readFileSync(DIR + "\\sw.js", "utf8").indexOf("kuradapt-v3.4.1") > -1);
  ok("styles.css memuat gaya panel & profil", /notif-panel/.test(css) && /profil-page/.test(css));

  /* ---- j. halaman #/admin: daftar pengguna, tombol profil & hapus ---- */
  K.keluar();
  ok("akun sementara untuk uji hapus terdaftar",
    K.daftar({ opsi: "siswa-mini", nama: "Hapus Saya", email: "hapusme@mail.com", pass: "hapus123" }));
  ok("admin masuk kembali", K.masuk("admin@mail.com", "admin12"));
  goto("#/admin");
  ok("seksi Daftar Pengguna tampil", $("#view").textContent.includes("Daftar Pengguna Terdaftar"));
  ok("tiap pengguna punya tombol Profil & Hapus",
    $$("#view [data-profil]").length >= 5 && $$("#view [data-hapus-akun]").length >= 5,
    $$("#view [data-profil]").length + "/" + $$("#view [data-hapus-akun]").length);
  ok("seksi baru tidak menambah .stat-card", $$("#view .stat-card").length === 4 && $$(".admin-page .stat-card").length === 4,
    $$("#view .stat-card").length + "/" + $$(".admin-page .stat-card").length);
  click($("#view [data-profil]"));
  ok("tombol Profil di panel kelola membuka modal", $("#modalBox").textContent.includes("Profil pengguna"));
  click($("[data-tutup]"));
  click($('#view [data-hapus-akun="hapusme@mail.com"]'));
  ok("konfirmasi hapus akun muncul", $("#modalBox").textContent.includes("Hapus akun") && !!$("#okHapusAkun"));
  click($("#okHapusAkun"));
  ok("akun terhapus dari penyimpanan", !JSON.parse(w.localStorage.getItem("kuradapt_users")).some(u => u.email === "hapusme@mail.com"));
  ok("email langsung bisa dipakai daftar ulang",
    K.daftar({ opsi: "siswa-mini", nama: "Hapus Saya", email: "hapusme@mail.com", pass: "hapus123" }));

  /* ---- k. hapus akun sendiri → sesi berakhir ---- */
  K.keluar();
  ok("akun diri terdaftar", K.daftar({ opsi: "siswa-mini", nama: "Diri Sendiri", email: "diri@mail.com", pass: "diri1234" }));
  ok("masuk dengan akun diri", K.masuk("diri@mail.com", "diri1234"));
  ok("hapusAkun diri sendiri berhasil", K.hapusAkun("diri@mail.com"));
  ok("sesi otomatis diakhiri", K.sesi() === null);
  ok("catatan akun hilang", !JSON.parse(w.localStorage.getItem("kuradapt_users")).some(u => u.email === "diri@mail.com"));
  ok("bisa daftar ulang setelah penghapusan diri",
    K.daftar({ opsi: "siswa-mini", nama: "Diri Baru", email: "diri@mail.com", pass: "diri1234" }));
  K.hapusAkun("diri@mail.com"); K.hapusAkun("hapusme@mail.com"); /* bersih-bersih */
  w.KURADAPT_CONFIG.NOTIF_WEBHOOK = ""; /* kembalikan konfigurasi normal */
  K.keluar();

  console.log("=== 38. HALAMAN MATERI SEMUA JENJANG (dibaca langsung, tanpa unduh .txt) ===");
  /* --- a. pintasan di panel admin (sekaligus cek kontrak .stat-card) --- */
  ok("admin masuk untuk uji pintasan", K.masuk("admin@mail.com", "admin12"));
  goto("#/admin");
  ok("pintasan Materi ada di panel admin", !!$('#view [data-go="materi"]'));
  ok("pintasan baru tidak menambah .stat-card kelola", $$(".admin-page .stat-card").length === 4,
    String($$(".admin-page .stat-card").length));
  K.keluar();

  /* --- b. siswa membuka halaman materi --- */
  ok("akun uji materi terdaftar",
    K.daftar({ opsi: "siswa-sma", nama: "Siswa Materi", email: "materi1@mail.com", pass: "materi123" }));
  ok("masuk sebagai siswa SMA", K.masuk("materi1@mail.com", "materi123"));
  goto("#/materi");
  ok("rute materi terbuka", $("#view").textContent.includes("Materi Semua Jenjang"));
  ok("filter: Semua + 5 jenjang", $$("#view [data-mx-jen]").length === 6, String($$("#view [data-mx-jen]").length));
  ok("5 kelompok jenjang tampil (SD, SMP, SMA, SMK, Kuliah)",
    $$("#mxHasil .mx-grup").length === 5 &&
    ["SD / MI", "SMP / MTs", "SMA", "SMK", "Perguruan Tinggi"].every(l => $("#mxHasil").textContent.includes(l)),
    String($$("#mxHasil .mx-grup").length));
  const nMapelMateri = $$("#mxHasil [data-mx-mapel]").length;
  ok("seluruh mapel terdaftar (≥ 31 seed)", nMapelMateri >= 31, String(nMapelMateri));
  ok("ringkasan jumlah bab terisi", /\d+ bab siap dibaca langsung/.test($(".mx-ringkas").textContent),
    $(".mx-ringkas").textContent);
  ok("tanpa tombol unduh .txt di halaman materi", !$("[data-unduh-buku]") && !$("[download]"));
  ok("halaman materi tidak memakai .stat-card", $$("#view .stat-card").length === 0);
  ok("menu mobile tetap tepat 8 link (kontrak)", $$("#mobileMenu .mm-links a").length === 8,
    String($$("#mobileMenu .mm-links a").length));

  /* --- c. filter jenjang & pencarian --- */
  click($('#view [data-mx-jen="sma"]'));
  ok("filter SMA → 1 kelompok", $$("#mxHasil .mx-grup").length === 1, String($$("#mxHasil .mx-grup").length));
  ok("chip SMA bertanda aktif", $('#view [data-mx-jen="sma"]').classList.contains("on"));
  click($('#view [data-mx-jen="semua"]'));
  ok("kembali 'Semua' → 5 kelompok", $$("#mxHasil .mx-grup").length === 5, String($$("#mxHasil .mx-grup").length));
  const cariKetik = v => {
    const el = $("#mxCari");
    el.focus(); el.value = v;
    el.dispatchEvent(new w.Event("input", { bubbles: true }));
  };
  cariKetik("PPKn");
  const nCari = $$("#mxHasil [data-mx-mapel]").length;
  ok("pencarian menyaring mapel", nCari > 0 && nCari < nMapelMateri, nCari + " dari " + nMapelMateri);
  ok("fokus input tidak hilang saat mengetik", d.activeElement === $("#mxCari"));
  cariKetik("qqq-tidak-ada");
  ok("tak ada hasil → pesan kosong", !!$("#mxHasil .empty"));
  cariKetik("");
  ok("pencarian dikosongkan → daftar penuh", $$("#mxHasil [data-mx-mapel]").length >= 31,
    String($$("#mxHasil [data-mx-mapel]").length));

  /* --- d. buka mapel → bab → baca isi bab --- */
  click($("#mxHasil [data-mx-mapel]"));
  const nBabList = $$("#view [data-mx-bab]").length;
  ok("daftar bab terbuka", nBabList > 0, String(nBabList));
  ok("tombol kembali ke semua mapel", !!$("#mxKeMapel"));
  click($("#view [data-mx-bab]"));
  ok("isi bab tampil sebagai artikel", !!$("#view .material .m-body"));
  ok("isi bab panjang (bukan ringkasan saja)", $("#view .material .m-body").textContent.length > 300,
    String($("#view .material .m-body").textContent.length));
  ok("materi dibuka tanpa tautan unduh", !$("[data-unduh-buku]") && !$("[download]"));
  ok("tombol kembali ke daftar bab", !!$("#mxKembali"));
  click($("#mxKembali"));
  ok("kembali → daftar bab lagi", $$("#view [data-mx-bab]").length === nBabList, String($$("#view [data-mx-bab]").length));
  click($("#mxKeMapel"));
  ok("kembali → daftar mapel lagi", $$("#view [data-mx-mapel]").length >= 31,
    String($$("#view [data-mx-mapel]").length));

  /* --- e. pintasan dari layar pilih ruang + reset state saat masuk ulang --- */
  cariKetik("qqq-tidak-ada");
  ok("pencarian aktif sebelum pindah halaman", !!$("#mxHasil .empty"));
  goto("#/pilih");
  ok("pintasan Materi ada di layar pilih ruang", !!$('#view [data-go="materi"]'));
  click($('#view [data-go="materi"]'));
  ok("pintasan membuka #/materi", w.location.hash === "#/materi" &&
    $("#view").textContent.includes("Materi Semua Jenjang"), w.location.hash);
  ok("masuk ulang → filter & pencarian direset", $$("#mxHasil .mx-grup").length === 5 &&
    ($("#mxCari").value || "") === "", String($$("#mxHasil .mx-grup").length) + "/" + $("#mxCari").value);

  /* --- f. tanpa sesi --- */
  K.keluar();
  goto("#/materi");
  ok("rute materi tanpa sesi → halaman masuk", w.location.hash === "#/masuk", w.location.hash);

  console.log("=== 39. RUANG LIVE KEGIATAN (gabung → ruangan, tuan rumah, chat, tautan video) ===");
  /* --- a. tuan rumah (guru) membuka ruang kegiatannya sendiri --- */
  ok("guru tuan rumah bisa didaftarkan", daftarCepat("guru", "Bu Live Guru", "liveguru@mail.com", "live1234"));
  goto("#/r/mini");
  click($('#spaceTabs [data-tab="kegiatan"]'));
  isi("#kgJudul", "Kelas Live Ruang Baru");
  click($("#kgBuat"));
  const kgBaru = K.semuaKegiatan().find(k => k.judul === "Kelas Live Ruang Baru");
  ok("kegiatan uji terbuat & langsung berjalan", !!kgBaru && kgBaru.status === "berlangsung",
    kgBaru ? kgBaru.status : "-");
  ok("kartu pembuat memakai tombol Masuk Ruang",
    !!$('[data-kg="' + (kgBaru || {}).id + '"] [data-masuk-kg]'));
  click($('[data-kg="' + kgBaru.id + '"] [data-masuk-kg]'));
  ok("ruang live terbuka (overlay di atas halaman)", !!$("#liveRoom"));
  ok("state ruang tercatat", K.ruangLive() === kgBaru.id, String(K.ruangLive()));
  ok("tuan rumah hadir → panggung TERBUKA", $("#liveRoom .lr-panggung").classList.contains("buka"));
  ok("tanpa .stat-card di dalam ruang (kontrak kelola)", $$("#liveRoom .stat-card").length === 0);
  ok("punya daftar kehadiran + chat", !!$("#liveRoom .lr-hadir") && !!$("#liveRoom .lr-chat"));
  let kini = K.semuaKegiatan().find(k => k.id === kgBaru.id);
  ok("kehadiran tuan rumah tercatat", (kini.hadir || []).indexOf("Bu Live Guru") > -1,
    (kini.hadir || []).join(","));
  ok("kartu di belakang menampilkan jumlah di ruang live",
    ($('[data-kg="' + kgBaru.id + '"] .kg-hadir') || { textContent: "" }).textContent.indexOf("1 sedang di ruang") > -1);

  /* --- b. tautan video wajib http/https --- */
  isi("#lrTautan", "javascript:alert(1)");
  click($("#lrPasang"));
  kini = K.semuaKegiatan().find(k => k.id === kgBaru.id);
  ok("tautan berbahaya ditolak", !kini.tautan, String(kini.tautan));
  isi("#lrTautan", "https://zoom.us/j/1234567890");
  isi("#lrPlatform", "Google Meet");
  click($("#lrPasang"));
  kini = K.semuaKegiatan().find(k => k.id === kgBaru.id);
  ok("tautan video tersimpan", kini.tautan === "https://zoom.us/j/1234567890", String(kini.tautan));
  ok("platform video tersimpan", kini.platform === "Google Meet", String(kini.platform));
  ok("tombol Gabung Video muncul utk peserta", !!$("#lrVideo"));

  /* --- c. chat ruangan --- */
  isi("#lrPesan", "Selamat datang peserta.");
  submit("#lrForm");
  kini = K.semuaKegiatan().find(k => k.id === kgBaru.id);
  ok("pesan chat tersimpan pada kegiatan",
    !!kini.chat && kini.chat.length === 1 && kini.chat[0].pesan === "Selamat datang peserta.",
    JSON.stringify(kini.chat || []));
  ok("pesan ditulis oleh tuan rumah", kini.chat[0].dari === "Bu Live Guru", kini.chat[0].dari);
  ok("pesan tampil di kotak chat", $("#lrChat").textContent.includes("Selamat datang peserta."));
  ok("kolom pesan dikosongkan setelah kirim", $("#lrPesan").value === "");

  /* --- d. angkat tangan --- */
  click($("#lrTangan"));
  kini = K.semuaKegiatan().find(k => k.id === kgBaru.id);
  ok("angkat tangan tercatat", (kini.tangan || []).indexOf("Bu Live Guru") > -1, (kini.tangan || []).join(","));
  ok("header ruang menampilkan jumlah angkat tangan",
    $("#liveRoom .lr-info").textContent.includes("angkat tangan"));

  /* --- e. buka tautan video tercatat --- */
  click($("#lrVideo"));
  ok("gabung video tercatat di audit log",
    K.semuaLog().some(l => l.pesan.includes("Bergabung ke video ruangan")));

  /* --- f. keluar ruangan --- */
  click($("#lrKeluar"));
  ok("ruang tertutup setelah keluar", !$("#liveRoom") && K.ruangLive() === null, String(K.ruangLive()));
  kini = K.semuaKegiatan().find(k => k.id === kgBaru.id);
  ok("kehadiran tuan rumah dibersihkan", (kini.hadir || []).length === 0, (kini.hadir || []).join(","));
  ok("peserta tetap tercatat pada kegiatan", (kini.peserta || []).indexOf("Bu Live Guru") > -1);

  /* --- g. peserta (siswa) masuk saat tuan rumah BELUM hadir --- */
  K.keluar();
  ok("peserta siswa bisa didaftarkan", daftarCepat("siswa-mini", "Siswa Live", "siswalive@mail.com", "live1234"));
  goto("#/r/mini");
  click($('#spaceTabs [data-tab="kegiatan"]'));
  const kartuPeserta = $('[data-kg="' + kgBaru.id + '"]');
  ok("peserta melihat kartu + tombol Gabung Kegiatan", !!kartuPeserta && !!kartuPeserta.querySelector("[data-gabung]"));
  click(kartuPeserta.querySelector("[data-gabung]"));
  ok("peserta benar-benar masuk ruang", K.ruangLive() === kgBaru.id && !!$("#liveRoom"));
  kini = K.semuaKegiatan().find(k => k.id === kgBaru.id);
  ok("kehadiran peserta tercatat", (kini.hadir || []).indexOf("Siswa Live") > -1, (kini.hadir || []).join(","));
  ok("ATURAN HOST: tuan rumah belum hadir → layar tunggu",
    $("#liveRoom .lr-panggung").classList.contains("tunggu"));
  ok("pesan 'menunggu tuan rumah' tampil", $("#liveRoom").textContent.includes("Menunggu tuan rumah"));
  ok("peserta TIDAK dapat alat tuan rumah", !$("#lrPasang") && !$("#lrPlatform"));
  ok("chat tetap terbuka untuk peserta", !!$("#lrForm"));
  isi("#lrPesan", "Sudah masuk, menunggu Bu Guru.");
  submit("#lrForm");
  kini = K.semuaKegiatan().find(k => k.id === kgBaru.id);
  ok("chat peserta tersimpan", kini.chat.slice(-1)[0].pesan === "Sudah masuk, menunggu Bu Guru.",
    JSON.stringify(kini.chat.slice(-1)));
  ok("chat peserta tampil di ruang", $("#lrChat").textContent.includes("Sudah masuk, menunggu Bu Guru."));

  /* --- h. pindah halaman → ruang ditutup otomatis --- */
  goto("#/pilih");
  ok("pindah halaman menutup ruang live", !$("#liveRoom") && K.ruangLive() === null, String(K.ruangLive()));
  kini = K.semuaKegiatan().find(k => k.id === kgBaru.id);
  ok("kehadiran peserta ikut dibersihkan", (kini.hadir || []).length === 0, (kini.hadir || []).join(","));
  ok("menu mobile tetap tepat 8 link (kontrak)", $$("#mobileMenu .mm-links a").length === 8,
    String($$("#mobileMenu .mm-links a").length));
  K.keluar();

  console.log("=== 40. ERROR KONSOL ===");
  ok("tidak ada error JavaScript", errors.length === 0, errors.slice(0, 3).join(" || "));

  console.log("\n========== HASIL FASE UTAMA: " + pass + " LULUS / " + fail + " GAGAL ==========");

  /* fase asinkron: unduh dokumen (IndexedDB fallback janji) — dijalankan setelah
     fase utama selesai supaya waktu hash v2 tidak memotong pengujian */
  setTimeout(() => {
    if (K) {
      K.simpanDok({ id: "dokx", nama: "jurnal-praktikum.jpg", ukuran: 512, tipe: "image/jpeg", tgl: new Date().toISOString(), data: "data:image/jpeg;base64,eA==", ruang: "mahir" });
      K.unduhDok("dokx");
    }
    setTimeout(() => {
      const ada = (w.__dl || []).includes("jurnal-praktikum.jpg");
      console.log((ada ? "  PASS" : "  FAIL") + "  unduh dokumen (async)" + (ada ? "" : " -> " + JSON.stringify(w.__dl)));
      if (ada) pass++; else fail++;
      console.log("\n========== HASIL AKHIR: " + pass + " LULUS / " + fail + " GAGAL ==========");
      process.exit(fail ? 1 : 0);
    }, 150);
  }, 50);
}, 60);
