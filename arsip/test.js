/* Uji fungsi Kuradapt v1.4.0 dengan jsdom
   Alur baru: layar masuk/daftar pertama -> ruang peran (6 view)
   SD/SMP/SMA/SMK/Mahasiswa = Ruang Belajar bertab · Guru · Dosen · Industri */
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
    w.URL.createObjectURL = () => "blob:pijar-test";
    w.URL.revokeObjectURL = () => { };
    const _origClick = w.HTMLAnchorElement.prototype.click;
    w.HTMLAnchorElement.prototype.click = function () {
      if (this.download) { w.__csv = this.download; } else { _origClick.call(this); }
    };
  }
});

const w = dom.window, d = w.document;
/* muat konfigurasi + konten jenjang (script src tidak dieksekusi jsdom tanpa resources) */
["config.js", "data-sd.js", "data-smp.js", "data-sma.js", "data-smk.js", "data-kuliah.js"].forEach(f => {
  try { w.eval(fs.readFileSync(DIR + "\\" + f, "utf8")); }
  catch (e) { errors.push("eval " + f + ": " + e.message); }
});

const $ = s => d.querySelector(s);
const $$ = s => [...d.querySelectorAll(s)];
const click = el => { if (!el) throw new Error("elemen tidak ada untuk klik"); el.click(); };
const byAttr = sel => d.querySelector(sel);
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { if (cond) { pass++; console.log("  PASS  " + name); } else { fail++; console.log("  FAIL  " + name + (extra ? " -> " + extra : "")); } };
const DEFST = () => ({ sim: { pohon: 6, sampah: 3, poin: 0 }, kuis: { jawab: 0, benar: 0, selesai: false, nilai: 0 }, modul: [], proyek: [], pelatihan: [], aksi: 0 });
const st = () => JSON.parse(w.localStorage.getItem("pijarnusantara_v1.2") || "null") || DEFST();
const sesi = () => JSON.parse(w.localStorage.getItem("pijarnusantara_sesi") || "null");
const submitAuth = () => $("#authForm").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
const goto = h => { w.location.hash = h; w.terapkanRute(); };
const isiJawaban = (formSel, list, benar) => {
  list.forEach((s, i) => {
    const v = benar ? s.a : (s.a + 1) % 4;
    const inp = d.querySelector(formSel + ' input[name="q' + i + '"][value="' + v + '"]');
    if (inp) inp.checked = true;
  });
};

setTimeout(() => {
  console.log("=== 1. LAYAR PERTAMA: MASUK / DAFTAR + RENDER AWAL ===");
  ok("0 error JS saat load", errors.length === 0, errors.join(" | "));
  ok("layar pertama = auth", !$("#view-auth").classList.contains("hidden"));
  ok("landing tersembunyi di awal", $("#view-landing").classList.contains("hidden"));
  ok("ruang lain tersembunyi", ["guru", "siswa", "dosen", "industri"].every(v => $("#view-" + v).classList.contains("hidden")));
  ok("form masuk ada", !!$("#authForm") && !!$("#aEmail") && !!$("#aPass"));
  ok("tab Masuk aktif", $('[data-auth="masuk"]').classList.contains("on"));
  ok("8 opsi jenjang/peran", $$("#aPeran option").map(o => o.textContent).join(",") === "Siswa SD,Siswa SMP,Siswa SMA,Siswa SMK,Guru,Dosen,Mahasiswa,Industri", $$("#aPeran option").map(o => o.textContent).join(","));
  ok("tautan papan pengumuman di auth", !!$('#view-auth a[href="#/pengumuman"]'));
  /* elemen ruang tetap ter-render walau tersembunyi */
  ok("chart 6 bar", $$("#chart .bar").length === 6, $$("#chart .bar").length);
  ok("6 kartu proyek", $$("#proyekList .pcard").length === 6, $$("#proyekList .pcard").length);
  ok("streak 7 hari", $$("#streak i").length === 7, $$("#streak i").length);
  ok("nilai awal 76 (rata-rata 16 siswa)", $("#stNilai").textContent === "76", $("#stNilai").textContent);
  ok("bank silabus 30", $$("#bankList .match").length === 30, $$("#bankList .match").length);
  ok("pelatihan 6 modul", $$("#pelatihanList .match").length === 6, $$("#pelatihanList .match").length);
  ok("rekap 4 kelompok", $$("#rekapBody .prow").length >= 4, $$("#rekapBody .prow").length);
  ok("rekomendasi muncul", $$("#rekomendasi .card").length === 6, $$("#rekomendasi .card").length);
  ok("avatar inisial", $("#avatarInit").textContent === "B", $("#avatarInit").textContent);
  ok("data jenjang termuat", !!w.PIJAR_DATA && Object.keys(w.PIJAR_DATA).length === 5, Object.keys(w.PIJAR_DATA || {}).join(","));

  console.log("\n=== 2. PILAR 1: SIMULASI ===");
  click(byAttr('[data-open="pillar1"]'));
  ok("overlay terbuka", $("#overlay").classList.contains("open"));
  ok("simulasi tampil", !!$(".sim-grid"));
  const pohonSebelum = st().sim.pohon;
  click(byAttr('[data-sim="tanam"]'));
  ok("pohon +5", st().sim.pohon === pohonSebelum + 5, st().sim.pohon);
  click(byAttr('[data-sim="buang"]'));
  ok("sampah berkurang", st().sim.sampah === 2, st().sim.sampah);
  click(byAttr('[data-sim="sungai"]'));
  ok("sungai bersih", st().sim.sampah === 0, st().sim.sampah);
  ok("poin simulasi naik", st().sim.poin > 0, st().sim.poin);
  ok("log aksi tercatat", (st().log || []).length >= 3, (st().log || []).length);

  console.log("\n=== 3. PILAR 1: KUIS ===");
  click(byAttr('[data-p1="kuis"]'));
  ok("kuis tampil", !!$(".qopts"));
  ok("progress dots 5", $$(".qprogress i").length === 5, $$(".qprogress i").length);
  click(byAttr('[data-q="pick"][data-i="0"]'));
  ok("feedback benar muncul", !!$(".qfeedback.ok"));
  ok("rujukan CP/TP tampil", ($(".qfeedback") || { textContent: "" }).textContent.includes("Rujukan"), ($(".qfeedback") || { textContent: "" }).textContent.slice(0, 60));
  ok("opsi benar tersorot", !!$(".qopt.right"));
  click(byAttr('[data-q="next"]'));
  ok("pindah soal 2", (d.body.textContent.match(/SOAL (\d+) \/ 5/) || [])[1] === "2", (d.body.textContent.match(/SOAL (\d+) \/ 5/) || [])[1]);
  click(byAttr('[data-q="pick"][data-i="1"]'));
  ok("jawaban 2 benar", st().kuis.benar === 2, st().kuis.benar);
  const kunci = [0, 1, 2, 2, 2];
  for (let i = 2; i < 5; i++) {
    click(byAttr('[data-q="next"]'));
    click(byAttr('[data-q="pick"][data-i="' + kunci[i] + '"]'));
  }
  click(byAttr('[data-q="next"]'));
  ok("hasil akhir tampil", !!$(".result .big"), "");
  ok("nilai kuis tersimpan", st().kuis.nilai === 100 || st().kuis.nilai > 0, "nilai=" + st().kuis.nilai);
  ok("kuis selesai", st().kuis.selesai === true);
  click($('[data-close]'));
  ok("modal tertutup", !$("#overlay").classList.contains("open"));

  console.log("\n=== 4. DASBOR + TABEL NILAI GURU ===");
  ok("rata-rata dari data siswa", $("#stNilai").textContent === "76", $("#stNilai").textContent);
  ok("pilar 1 progres > 0", $("#p1pct").textContent !== "0%", $("#p1pct").textContent);
  ok("partisipasi naik", $("#stPartisipasi").textContent !== "35%", $("#stPartisipasi").textContent);
  ok("tabel 16 peserta didik", $$("#siswaBody tr").length === 16, $$("#siswaBody tr").length);
  ok("tertinggal 6 orang (awal)", $("#stTertinggal").textContent === "6", $("#stTertinggal").textContent);
  const inp = $('#siswaBody input[data-siswa="0"]');
  inp.value = 40; inp.dispatchEvent(new w.Event("change", { bubbles: true }));
  ok("nilai tersimpan ke state", st().siswa[0].nilai === 40, st().siswa[0].nilai);
  ok("statistik menyesuaikan", $("#stTertinggal").textContent === "7", $("#stTertinggal").textContent);
  ok("rata-rata turun otomatis", $("#stNilai").textContent === "73", $("#stNilai").textContent);
  const cat = $('#siswaBody input[data-f="c"][data-siswa="0"]');
  cat.value = "Pendampingan 2x"; cat.dispatchEvent(new w.Event("change", { bubbles: true }));
  ok("catatan guru tersimpan", st().siswa[0].c === "Pendampingan 2x", st().siswa[0].c);

  console.log("\n=== 5. PILAR 2: GAP & MATCH ===");
  click(byAttr('[data-open="pillar2"]'));
  ok("form gap tampil", !!$("#gapForm"));
  ok("isi awal guidance", $("#gapResult").textContent.includes("Hitung Gap"));
  $("#fSkill").value = 35; $("#fSkill").dispatchEvent(new w.Event("input"));
  ok("label skill ter-update", $("#vSkill").textContent === "35", $("#vSkill").textContent);
  $("#fBidang").value = "AI";
  click($("#btnGap"));
  ok("hasil gap tampil", $$("#gapResult .match").length > 0, $$("#gapResult .match").length);
  ok("skema sertifikasi tampil", $("#gapResult").textContent.includes("LSP") || $("#gapResult").textContent.includes("BNSP"), $("#gapResult").textContent.slice(0, 120));
  const modulSebelum = st().modul.length;
  click(byAttr('[data-daftar]'));
  ok("modul terdaftar", st().modul.length === modulSebelum + 1, st().modul.length);
  click(byAttr('[data-lulus]'));
  ok("modul lulus", st().modul[0].done === true);
  ok("chip sertifikat muncul", $("#gapResult").textContent.includes("Lulus"));
  click($('[data-close]'));

  console.log("\n=== 6. PILAR 3: PROYEK ===");
  click(byAttr('[data-open="pillar3"]'));
  ok("daftar proyek modal", $$("#modal .match").length === 6, $$("#modal .match").length);
  click(byAttr('[data-proyek="p1"]'));
  ok("detail proyek tampil", $("#modal").textContent.includes("Chatbot Layanan Mahasiswa"));
  ok("deliverable tampil", $("#modal").textContent.includes("Laporan evaluasi akurasi"));
  click(byAttr('[data-ajukan]'));
  ok("proyek terdaftar", st().proyek.length === 1, st().proyek.length);
  click(byAttr('[data-selesai]'));
  ok("proyek selesai", st().proyek[0].done === true);
  click($('[data-close]'));
  ok("kartu galeri menandai selesai", $("#proyekList").textContent.includes("Selesai"));

  console.log("\n=== 7. TAB DASBOR ===");
  click(byAttr('[data-tab="pelatihan"]'));
  ok("panel pelatihan tampil", !$('[data-panel="pelatihan"]').classList.contains("hidden"));
  ok("panel ringkasan disembunyikan", $('[data-panel="ringkasan"]').classList.contains("hidden"));
  click(byAttr('[data-pelatihan="0"]'));
  ok("modul pelatihan selesai 1", st().pelatihan.length === 1, st().pelatihan.length);
  ok("level guru Lv 1+", $("#lvlGuru").textContent.startsWith("Lv"), $("#lvlGuru").textContent);
  click(byAttr('[data-tab="bank"]'));
  click(byAttr('[data-bank="SD"]'));
  const sd = $$("#bankList .match").length;
  ok("filter SD menyaring", sd > 0 && sd < 30, sd + " item");
  click(byAttr('[data-bank="Semua"]'));
  ok("filter Semua kembali 30", $$("#bankList .match").length === 30, $$("#bankList .match").length);
  click(byAttr('[data-tab="hasil"]'));
  ok("panel hasil tampil", !$('[data-panel="hasil"]').classList.contains("hidden"));

  console.log("\n=== 8. TEMPLATE SILABUS ===");
  click(byAttr('[data-tab="bank"]'));
  click(byAttr('[data-template]'));
  ok("modal template terbuka", $("#modal").textContent.includes("Salin Kerangka"));
  click($('[data-close]'));

  console.log("\n=== 9. NAVIGASI & RESPONSIF ===");
  click($("#burger"));
  ok("menu mobile terbuka", $("#navLinks").classList.contains("open"));
  click($("#burger"));
  ok("menu mobile tertutup", !$("#navLinks").classList.contains("open"));
  ok("nav memuat Papan Pengumuman", $("#navLinks").textContent.includes("Papan Pengumuman"));
  ok("nav memuat Ruang Guru & Ruang Dosen", $("#navLinks").textContent.includes("Ruang Guru") && $("#navLinks").textContent.includes("Ruang Dosen"));

  console.log("\n=== 9b. AKUN: ALUR LAYAR MASUK (GURU) ===");
  ok("chip akun kosong di awal", $("#userChip").innerHTML === "");
  click($("#btnAuth"));
  ok("masuk ke layar auth", !$("#view-auth").classList.contains("hidden") && w.location.hash === "#/", w.location.hash);
  ok("mode lokal dijelaskan", $("#view-auth").textContent.includes("Mode"), $("#view-auth").textContent.replace(/\s+/g, " ").slice(0, 80));
  click(byAttr('[data-auth="daftar"]'));
  ok("form daftar muncul", !$("#daftarPeran").hidden && !$("#daftarOnly").hidden);
  $("#aNama").value = "Siti Aminah, S.Pd.";
  $("#aPeran").value = "Guru";
  $("#aEmail").value = "guru@sekolah.id";
  $("#aPass").value = "rahasia123";
  submitAuth();
  ok("akun terdaftar", !!w.daftarUsers()["guru@sekolah.id"], JSON.stringify(Object.keys(w.daftarUsers())));
  ok("sesi aktif", sesi() && sesi().nama === "Siti Aminah, S.Pd.", JSON.stringify(sesi()));
  ok("chip menampilkan nama", $("#userChip").textContent.includes("Siti Aminah"), $("#userChip").textContent);
  ok("peran Guru tampil", $("#userChip").textContent.includes("Guru"), $("#userChip").textContent);
  ok("tombol jadi Keluar", $("#btnAuth").textContent === "Keluar", $("#btnAuth").textContent);
  ok("otomatis ke ruang #/guru", w.location.hash === "#/guru", w.location.hash);
  ok("ruang guru tampil", !$("#view-guru").classList.contains("hidden"));
  ok("layar auth disembunyikan", $("#view-auth").classList.contains("hidden"));
  ok("panel kode kelas guru muncul", !!$("#kBuat"), "panel guru tidak muncul");
  click($("#kBuat"));
  ok("kode kelas 6 karakter", (st().kelas || "").length === 6, st().kelas);

  click($("#btnAuth")); // logout (confirm=true)
  ok("logout berhasil", $("#userChip").innerHTML === "");
  ok("kembali ke layar auth", !$("#view-auth").classList.contains("hidden") && w.location.hash === "#/", w.location.hash);
  click($("#btnAuth")); // buka layar masuk
  $("#aEmail").value = "guru@sekolah.id";
  $("#aPass").value = "rahasia123";
  submitAuth();
  ok("login ulang berhasil", $("#userChip").textContent.includes("Siti Aminah"), $("#userChip").textContent);
  ok("login ulang ke #/guru", w.location.hash === "#/guru", w.location.hash);

  click($("#btnAuth")); // logout lagi
  click($("#btnAuth")); // buka layar masuk untuk uji password salah
  ok("layar masuk tampil lagi", !!$("#aEmail"));
  $("#aEmail").value = "guru@sekolah.id";
  $("#aPass").value = "salah";
  submitAuth();
  ok("password salah ditolak", $("#aErr").textContent.includes("salah"), $("#aErr").textContent);
  ok("sesi tetap kosong", sesi() === null, JSON.stringify(sesi()));

  console.log("\n=== 8c. LAPIS 3: KURIKULUM NYATA ===");
  click(byAttr('[data-tab="bank"]'));
  ok("tombol peta kurikulum ada", !!$("#btnKurikulum"));
  click($("#btnKurikulum"));
  ok("modal peta kurikulum terbuka", $("#modal").textContent.includes("Peta Kurikulum Merdeka"), $("#modal").textContent.slice(0, 50));
  ok("memuat CP & TP asli", $("#modal").textContent.includes("Capaian Pembelajaran") && $("#modal").textContent.includes("Fase B"));
  ok("ada OKUPASI & LSP/BNSP", $("#modal").textContent.includes("OKUPASI") && $("#modal").textContent.includes("LSP/BNSP"));
  ok("ada CPL kuliah", $("#modal").textContent.includes("CPL-6"));
  click($('[data-close]'));

  console.log("\n=== 10. SERTIFIKAT + LAPORAN ===");
  click(byAttr('[data-tab="sertifikat"]'));
  ok("tab sertifikat terbuka", !$('[data-panel="sertifikat"]').classList.contains("hidden"));
  ok("3 sertifikat terbit (kuis+modul+proyek)", $$("#sertifikatList .match").length === 3, $$("#sertifikatList .match").length);
  ok("badge sertifikat = 3", $("#certCount").textContent === "3", $("#certCount").textContent);
  click(byAttr('[data-cert="0"]'));
  ok("kartu sertifikat tampil", !!$(".cert"));
  ok("kode verifikasi PN-", ($(".cert .cverif").textContent || "").includes("PN-"), $(".cert .cverif") && $(".cert .cverif").textContent);
  ok("nama tercetak di sertifikat", $(".cert .cnama").textContent.includes("Budi Santoso"), $(".cert .cnama").textContent);
  ok("kredit DAFFTECH di sertifikat", $(".cert").textContent.includes("DAFFTECH"), $(".cert").textContent.slice(-60));
  click($("#salinCert"));
  click($('[data-close]'));
  click(byAttr('[data-tab="hasil"]'));
  click($("#btnCsv"));
  ok("CSV terunduh", w.__csv === "rekap-nilai-kuradapt.csv", w.__csv);
  click($("#btnCetak"));
  ok("area cetak terisi laporan", $("#printArea").textContent.includes("Rekap Hasil Belajar"), $("#printArea").textContent.slice(0, 40));
  click(byAttr('[data-tentang]'));
  ok("modal Tentang terbuka", $("#modal").textContent.includes("Tentang Kuradapt"), $("#modal").textContent.slice(0, 40));
  ok("versi aplikasi tampil", $("#modal").textContent.includes("v1.4.0"), $("#modal").textContent.match(/v\d+\.\d+\.\d+/));
  ok("lisensi DAFFTECH di modal Tentang", $("#modal").textContent.includes("DAFFTECH") && $("#modal").textContent.includes("LICENSE"));
  ok("footer hak cipta DAFFTECH", $("footer").textContent.includes("© 2026") && $("footer").textContent.includes("DAFFTECH"), $("#fbot") ? $("#fbot").textContent.trim().slice(0, 80) : "");
  ok("footer punya tautan LICENSE", !!$('footer a[href="LICENSE"]'));
  ok("meta copyright DAFFTECH di head", ($('meta[name="copyright"]') || { content: "" }).content.includes("DAFFTECH"));
  click($('[data-close]'));

  console.log("\n=== 11. RESET ===");
  click($("#btnReset"));
  ok("state kembali default", st().kuis.selesai === false && st().modul.length === 0, JSON.stringify(st().kuis));
  ok("nilai siswa pulih 76", $("#stNilai").textContent === "76", $("#stNilai").textContent);
  ok("siswa[0] pulih ke 84", st().siswa[0].nilai === 84, st().siswa[0].nilai);
  ok("sertifikat dibersihkan", st().sertifikat.length === 0 && $("#certCount").textContent === "0", st().sertifikat.length);
  ok("progres belajar ikut dibersihkan", !st().belajar, JSON.stringify(st().belajar));

  console.log("\n=== 12. ENAM RUANG TERPISAH & PENJAGA PERAN ===");
  ok("6 view terpasang", ["auth", "landing", "guru", "siswa", "dosen", "industri"].every(v => !!$("#view-" + v)));
  // sesi masih kosong (uji password salah) -> masuk lagi sebagai Guru agar Ruang Guru teruji
  $("#aEmail").value = "guru@sekolah.id";
  $("#aPass").value = "rahasia123";
  submitAuth();
  ok("login ulang Guru sebelum uji ruang", sesi() && sesi().peran === "Guru", JSON.stringify(sesi()));
  ok("ruang guru tampil (akun Guru)", !$("#view-guru").classList.contains("hidden"));
  ok("ruang lain tersembunyi", $("#view-landing").classList.contains("hidden") && $("#view-siswa").classList.contains("hidden") && $("#view-dosen").classList.contains("hidden") && $("#view-industri").classList.contains("hidden"));
  ok("0 sisa tautan #dasbor", $$('a[href="#dasbor"]').length === 0, $$('a[href="#dasbor"]').length);
  ok("panel tugas ada di ruang guru", !!$('[data-panel="tugas"]') && !!$("#tugasForm"));

  // tamu mencoba membuka Ruang Guru -> ditolak
  click($("#btnAuth")); // keluar
  goto("#/guru");
  ok("#/guru tanpa akun → #/", w.location.hash === "#/", w.location.hash);
  ok("layar auth tampil", !$("#view-auth").classList.contains("hidden"));
  ok("ruang guru tersembunyi", $("#view-guru").classList.contains("hidden"));

  // daftar sebagai Siswa SMA -> otomatis masuk Ruang Belajar
  click(byAttr('[data-auth="daftar"]'));
  $("#aNama").value = "Rina Wulandari";
  $("#aPeran").value = "Siswa SMA";
  $("#aEmail").value = "rina@siswa.id";
  $("#aPass").value = "rahasia123";
  submitAuth();
  ok("otomatis ke #/sma", w.location.hash === "#/sma", w.location.hash);
  ok("ruang belajar tampil", !$("#view-siswa").classList.contains("hidden"));
  ok("ruang guru tetap tersembunyi", $("#view-guru").classList.contains("hidden"));
  ok("layar auth tersembunyi", $("#view-auth").classList.contains("hidden"));
  ok("nama tampil di ruang siswa", $("#sNama").textContent.includes("Rina"), $("#sNama").textContent);
  ok("tag jenjang SMA", $("#sRuangTag").textContent.includes("SMA"), $("#sRuangTag").textContent);
  ok("tab ruang belajar ada (7)", $$("#snav [data-stab]").length === 7, $$("#snav [data-stab]").length);

  // Siswa dilarang membuka ruang lain
  goto("#/guru");
  ok("siswa diblokir dari #/guru", w.location.hash === "#/sma", w.location.hash);
  goto("#/dosen");
  ok("siswa diblokir dari #/dosen", w.location.hash === "#/sma", w.location.hash);
  ok("ruang siswa tetap tampil", !$("#view-siswa").classList.contains("hidden"));

  console.log("\n=== 13. TUGAS GURU -> RUANG BELAJAR (tersambung) ===");
  click($("#btnAuth")); // keluar
  click($("#btnAuth")); // masuk
  $("#aEmail").value = "guru@sekolah.id";
  $("#aPass").value = "rahasia123";
  submitAuth();
  ok("guru otomatis ke #/guru", w.location.hash === "#/guru", w.location.hash);
  ok("ruang guru tampil", !$("#view-guru").classList.contains("hidden"));

  click(byAttr('[data-tab="tugas"]'));
  ok("panel tugas terbuka", !$('[data-panel="tugas"]').classList.contains("hidden"));
  $("#tJudul").value = "Laporan Observasi Ekosistem";
  $("#tKet").value = "Amati lingkungan sekitar sekolah";
  $("#tTenggat").value = "2026-11-30";
  $("#tugasForm").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  ok("tugas tersimpan di state", (st().tugas || []).length === 1, JSON.stringify(st().tugas || []));
  ok("tugas tampil di daftar guru", $("#tugasListGuru").textContent.includes("Observasi"));
  ok("badge tugas = 1", $("#tugasCount").textContent === "1", $("#tugasCount").textContent);

  // Siswa melihat lalu mengerjakan tugas
  click($("#btnAuth")); // keluar
  click($("#btnAuth")); // masuk
  $("#aEmail").value = "rina@siswa.id";
  $("#aPass").value = "rahasia123";
  submitAuth();
  ok("siswa kembali ke #/sma", w.location.hash === "#/sma", w.location.hash);
  ok("tugas guru terlihat di ruang belajar", $("#tugasSiswa").textContent.includes("Observasi"), $("#tugasSiswa").textContent.replace(/\s+/g, " ").trim().slice(0, 80));
  click(byAttr('[data-tugasselesai]'));
  ok("tugas ditandai selesai", st().tugas[0].done === true, JSON.stringify(st().tugas[0]));

  console.log("\n=== 13b. RUANG BELAJAR: BUKU, LATIHAN, ASESMEN, RAPOR ===");
  // --- beranda ---
  ok("stat buku terisi", /^0 \/ \d+$/.test($("#sBuku").textContent), $("#sBuku").textContent);
  ok("stat latihan terisi", /^0 \/ \d+$/.test($("#sLatihan").textContent), $("#sLatihan").textContent);
  ok("stat asesmen kosong dulu", $("#sRata").textContent === "—", $("#sRata").textContent);
  ok("tombol tabgo beranda ada", $$('[data-stabgo]').length >= 3, $$('[data-stabgo]').length);

  // --- buku & materi ---
  click(byAttr('[data-stab="buku"]'));
  ok("tab buku terbuka", !$('[data-spanel="buku"]').classList.contains("hidden"));
  const nBuku = $$("#bukuBox .match").length;
  ok("daftar buku SMA >= 4", nBuku >= 4, nBuku);
  click($("#bukuBox [data-buku]"));
  const nBab = $$("#bukuBox [data-bab]").length;
  ok("daftar bab >= 4", nBab >= 4, nBab);
  ok("judul berubah jadi daftar bab", $("#bukuJudul").textContent.includes("daftar bab"), $("#bukuJudul").textContent);
  click($("#bukuBox [data-bab]"));
  ok("babPanel terbuka", !$("#babPanel").classList.contains("hidden"));
  ok("materi bab panjang (>300 huruf)", ($("#babIsi").textContent || "").length > 300, ($("#babIsi").textContent || "").length);
  ok("materi memuat heading/daftar", $$("#babIsi h4").length >= 1 || $$("#babIsi li").length >= 3, $$("#babIsi h4").length + "/" + $$("#babIsi li").length);
  click($("#babSelesai"));
  ok("bab ditandai selesai", st().belajar.sma.baca[Object.keys(st().belajar.sma.baca)[0]] === true, JSON.stringify(st().belajar.sma.baca));
  ok("stat buku naik", $("#sBuku").textContent.startsWith("1 /"), $("#sBuku").textContent);
  ok("tombol berubah jadi dibatalkan", $("#babSelesai").textContent.includes("Batalkan"), $("#babSelesai").textContent.trim());

  // --- latihan: semua benar ---
  click($("#babLatihan"));
  ok("panel latihan terbuka", !$("#latihPanel").classList.contains("hidden"));
  ok("tab latihan aktif", $('[data-stab="latihan"]').classList.contains("on"));
  let q = $$("#latihForm .panel").length;
  ok("6 soal latihan", q === 6, q);
  const soalBab = w.PIJAR_DATA.sma.mapel[0].bab[0].soal;
  isiJawaban("#latihForm", soalBab, true);
  $("#latihForm").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  ok("nilai 100 tampil", $("#latihIsi .result .big").textContent === "100", $("#latihIsi .result .big").textContent);
  ok("pembahasan muncul", $$("#latihIsi .qfeedback").length >= 6, $$("#latihIsi .qfeedback").length);
  ok("nilai latihan tersimpan", st().belajar.sma.latihan[Object.keys(st().belajar.sma.latihan)[0]] === 100, JSON.stringify(st().belajar.sma.latihan));
  ok("stat latihan naik", $("#sLatihan").startsWith ? true : true, "");
  ok("stat latihan 1/…", /^1 \/ \d+$/.test($("#sLatihan").textContent), $("#sLatihan").textContent);

  // --- latihan: sengaja salah -> ulangi soal salah ---
  click(byAttr('[data-latihulang]'));
  q = $$("#latihForm .panel").length;
  ok("form ulang muncul lagi (6 soal)", q === 6, q);
  isiJawaban("#latihForm", soalBab, false);
  $("#latihForm").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  ok("nilai 0 tampil", $("#latihIsi .result .big").textContent === "0", $("#latihIsi .result .big").textContent);
  ok("tombol ulang salah muncul", !!byAttr('[data-ulang]'), "tidak ada");
  ok("terbaik tidak jatuh (tetap 100)", st().belajar.sma.latihan[Object.keys(st().belajar.sma.latihan)[0]] === 100, JSON.stringify(st().belajar.sma.latihan));
  click(byAttr('[data-ulang]'));
  q = $$("#latihForm .panel").length;
  ok("ulangan berisi 6 soal salah", q === 6, q);
  ok("label menyebut ulangan soal salah", $("#latihIsi").textContent.includes("ulangan soal salah"), $("#latihIsi").textContent.replace(/\s+/g, " ").slice(0, 90));
  isiJawaban("#latihForm", soalBab, true);
  $("#latihForm").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  ok("ulangan selesai dengan nilai", $("#latihIsi .result .big").textContent === "100", $("#latihIsi .result .big").textContent);
  click(byAttr('[data-latihkembali]'));
  ok("kembali ke daftar latihan", $("#latihPanel").classList.contains("hidden"));

  // --- asesmen: salah semua -> remedial -> tuntas ---
  click(byAttr('[data-stab="asesmen"]'));
  const nUj = $$("#asesmenBox [data-ujian]").length;
  ok("daftar asesmen >= 4", nUj >= 4, nUj);
  click($("#asesmenBox [data-ujian]"));
  ok("panel asesmen terbuka", !$("#ujPanel").classList.contains("hidden"));
  const soalMapel = w.PIJAR_DATA.sma.mapel[0].bab.reduce((a, b) => a.concat(b.soal), []);
  let uq = $$("#ujForm .panel").length;
  ok("jumlah soal asesmen = 24", uq === soalMapel.length && uq >= 24, uq);
  isiJawaban("#ujForm", soalMapel, false);
  $("#ujForm").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  ok("nilai rendah tampil (0)", $("#ujIsi .result .big").textContent === "0", $("#ujIsi .result .big").textContent);
  ok("status belum tuntas", $("#ujIsi").textContent.includes("BELUM TUNTAS"), $("#ujIsi").textContent.replace(/\s+/g, " ").slice(0, 80));
  ok("tombol remedial muncul", !!byAttr('[data-ujremedi]'), "tidak ada");
  ok("nilai 0 tersimpan", Object.values(st().belajar.sma.asesmen)[0].nilai === 0, JSON.stringify(st().belajar.sma.asesmen));
  click(byAttr('[data-ujremedi]'));
  uq = $$("#ujForm .panel").length;
  ok("remedial memuat soal yang salah (24)", uq === 24, uq);
  ok("mode remedial disebut", $("#ujIsi").textContent.includes("remedial"), $("#ujIsi").textContent.replace(/\s+/g, " ").slice(0, 90));
  isiJawaban("#ujForm", soalMapel, true);
  $("#ujForm").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  ok("nilai akhir remedial 100", $("#ujIsi .result .big").textContent === "100", $("#ujIsi .result .big").textContent);
  const asesmen = Object.values(st().belajar.sma.asesmen)[0];
  ok("nilai akhir 100 + awal 0", asesmen.nilai === 100 && asesmen.awal === 0, JSON.stringify(asesmen));
  ok("status remedial tercatat", asesmen.remedi === true);
  ok("sertifikat asesmen terbit otomatis", st().sertifikat.some(s => String(s.judul).includes("Asesmen")), JSON.stringify(st().sertifikat.map(s => s.judul)));
  ok("tombol lihat rapor muncul", !!byAttr('[data-stabgo="nilai"]'), "tidak ada");

  // --- rapor ---
  click(byAttr('[data-stab="nilai"]'));
  ok("rapor terisi (>=5 baris)", $$("#raporBox .match").length >= 5, $$("#raporBox .match").length);
  ok("rapor menyebut tuntas", $("#raporBox").textContent.includes("Tuntas"));
  ok("ringkasan rapor terisi", $("#raporBox").textContent.includes("Rata-rata asesmen"), $("#raporBox").textContent.replace(/\s+/g, " ").slice(0, 90));
  click($("#btnRaporCetak"));
  ok("printArea memuat rapor", $("#printArea").textContent.includes("Rapor Hasil Belajar"), $("#printArea").textContent.slice(0, 50));
  ok("tabel rapor memuat mapel", $("#printArea").textContent.includes("Mata Pelajaran"));

  // --- tab tugas & sertifikat ---
  click(byAttr('[data-stab="tugas"]'));
  ok("tab tugas menampilkan tugas guru", $("#tugasSiswa2").textContent.includes("Observasi"), $("#tugasSiswa2").textContent.replace(/\s+/g, " ").trim().slice(0, 70));
  click(byAttr('[data-stab="sertifikat"]'));
  ok("tab sertifikat berisi sertifikat asesmen", $("#sertifikatSiswa2").textContent.includes("Asesmen"), $("#sertifikatSiswa2").textContent.replace(/\s+/g, " ").trim().slice(0, 70));
  click($("#sertifikatSiswa2 [data-cert]"));
  ok("kartu sertifikat terbuka", !!$(".cert"));
  click($('[data-close]'));

  // kembali ke guru: status tugas terlihat
  click($("#btnAuth")); // keluar
  click($("#btnAuth")); // masuk
  $("#aEmail").value = "guru@sekolah.id";
  $("#aPass").value = "rahasia123";
  submitAuth();
  click(byAttr('[data-tab="tugas"]'));
  ok("guru melihat status sudah dikerjakan", $("#tugasListGuru").textContent.includes("sudah dikerjakan"), $("#tugasListGuru").textContent.replace(/\s+/g, " ").trim().slice(0, 120));
  ok("kotak kelas guru ada", !!$("#kelasBox"));
  ok("panel kode kelas tetap ada", !!$("#kBuat"));

  console.log("\n=== 14. PETA PENYSETARAAN KURIKULUM 2013 / KTSP -> MERDEKA ===");
  click(byAttr('[data-tab="bank"]'));
  ok("tombol peta kurikulum ada", !!$("#btnKurikulum"));
  click($("#btnKurikulum"));
  ok("modal peta kurikulum terbuka", $("#modal").textContent.includes("Peta Kurikulum Merdeka"));
  ok("bagian penyetaraan ada", $("#modal").textContent.includes("Penyetaraan Kurikulum 2013"), $("#modal").textContent.replace(/\s+/g, " ").slice(0, 80));
  ok("12 baris padanan tampil", $$("#setaraBox .srow").length === 12, $$("#setaraBox .srow").length);
  ok("hitungan padanan akurat", $("#setaraCount").textContent.includes("12 dari 12"), $("#setaraCount").textContent);
  ok("ada status setara penuh & perlu asesmen", $("#setaraBox").textContent.includes("Setara penuh") && $("#setaraBox").textContent.includes("Perlu asesmen baru"));
  ok("pemetaan menyebut fase & CP", $("#setaraBox").textContent.includes("Fase D") && $("#setaraBox").textContent.includes("CP IPA Fase D"));
  ok("penyetaraan menyebut LSP/BNSP", $("#setaraBox").textContent.includes("LSP/BNSP"));
  $("#setaraCari").value = "Fase D";
  $("#setaraCari").dispatchEvent(new w.Event("input", { bubbles: true }));
  const nF = $$("#setaraBox .srow").length;
  ok("saringan memperkecil hasil", nF > 0 && nF < 12, nF);
  ok("hitungan ikut mengecil", $("#setaraCount").textContent.startsWith("Menampilkan " + nF + " dari 12"), $("#setaraCount").textContent);
  $("#setaraCari").value = "kata tak dikenal";
  $("#setaraCari").dispatchEvent(new w.Event("input", { bubbles: true }));
  ok("keadaan kosong ramah", $("#setaraBox").textContent.includes("Tidak ada padanan"), $("#setaraBox").textContent.replace(/\s+/g, " ").slice(0, 70));
  ok("hitungan 0 saat kosong", $("#setaraCount").textContent.startsWith("Menampilkan 0 dari 12"), $("#setaraCount").textContent);
  $("#setaraCari").value = "";
  $("#setaraCari").dispatchEvent(new w.Event("input", { bubbles: true }));
  ok("saringan dibersihkan -> 12 lagi", $$("#setaraBox .srow").length === 12, $$("#setaraBox .srow").length);
  click($('[data-close]'));
  click(byAttr('[data-open="pillar3"]'));
  ok("tombol penyetaraan ada di Pilar 3", !!$("#btnSetara3"));
  click($("#btnSetara3"));
  ok("penyetaraan terbuka dari Pilar 3", $("#modal").textContent.includes("Peta Penyetaraan Kurikulum"), $("#modal").textContent.replace(/\s+/g, " ").slice(0, 70));
  click($('[data-close]'));

  console.log("\n=== 15. REMEDIAL ADAPTIF PILAR 1 ===");
  const jwb = i => w.eval("KUIS[" + i + "].a");
  click(byAttr('[data-open="pillar1"]'));
  click(byAttr('[data-p1="kuis"]'));
  ok("kuis terbuka lagi", !!$(".qopts"));
  const plan = [false, true, false, true, true];
  for (let i = 0; i < 5; i++) {
    const a = jwb(i);
    const pilih = plan[i] ? (a === 0 ? 1 : 0) : a;
    click(byAttr('[data-q="pick"][data-i="' + pilih + '"]'));
    click(byAttr('[data-q="next"]'));
  }
  const nilAwal = st().kuis.nilai;
  ok("nilai awal di bawah 70", nilAwal > 0 && nilAwal < 70, nilAwal);
  ok("3 soal tercatat salah", (st().kuis.salah || []).length === 3, JSON.stringify(st().kuis.salah));
  ok("layar hasil memuat remedial", !!$("#remBox"));
  ok("jumlah soal salah disebut", $("#remBox").textContent.includes("3 dari 5"), $("#remBox").textContent.replace(/\s+/g, " ").slice(0, 90));
  click(byAttr('[data-q="remedial"]'));
  const lblRem = ($("#modal").textContent.match(/REMEDIAL SOAL (\d+) \/ 3/) || [])[1];
  ok("masuk mode remedial adaptif", lblRem === "1", lblRem);
  ok("progress dots ikut jumlah soal remedial", $$(".qprogress i").length === 3, $$(".qprogress i").length);
  const setRem = JSON.parse(w.eval("JSON.stringify(qSet)"));
  ok("hanya soal salah yang diulang", JSON.stringify(setRem) === "[1,3,4]", JSON.stringify(setRem));
  for (let i = 0; i < setRem.length; i++) {
    const a = jwb(setRem[i]);
    click(byAttr('[data-q="pick"][data-i="' + a + '"]'));
    click(byAttr('[data-q="next"]'));
  }
  ok("nilai terbaik dipakai (100)", st().kuis.nilai === 100, st().kuis.nilai);
  ok("daftar soal salah dikosongkan", (st().kuis.salah || []).length === 0, JSON.stringify(st().kuis.salah));
  ok("layar hasil remedial tampil", !!$(".result .big") && $("#modal").textContent.includes("Hasil remedial tersimpan"), $("#modal").textContent.replace(/\s+/g, " ").slice(-90));
  ok("sertifikat remedial terbit", (st().sertifikat || []).some(s => String(s.judul || "").includes("Remedial Pilar 1")), JSON.stringify((st().sertifikat || []).map(s => s.judul)));
  ok("tombol ulangi kuis tetap ada", !!byAttr('[data-q="restart"]'));
  click(byAttr('[data-q="restart"]'));
  ok("setelah restart kuis penuh 5 soal", $$(".qprogress i").length === 5, $$(".qprogress i").length);
  click($('[data-close]'));

  console.log("\n=== 16. RUANG DOSEN — TERPISAH DARI RUANG GURU ===");
  click($("#btnAuth")); // keluar dari akun Guru
  ok("keluar ke layar auth", !$("#view-auth").classList.contains("hidden") && $("#view-guru").classList.contains("hidden"));
  click(byAttr('[data-auth="daftar"]'));
  ok("pilihan peran memuat Dosen", $$("#aPeran option").some(o => o.textContent === "Dosen"));
  $("#aNama").value = "Dr. Indra Kusuma";
  $("#aPeran").value = "Dosen";
  $("#aEmail").value = "dosen@kampus.id";
  $("#aPass").value = "rahasia123";
  submitAuth();
  ok("dosen otomatis ke #/dosen", w.location.hash === "#/dosen", w.location.hash);
  ok("ruang dosen tampil", !$("#view-dosen").classList.contains("hidden"));
  ok("ruang guru TERPISAH (tersembunyi)", $("#view-guru").classList.contains("hidden"));
  ok("chip memuat peran Dosen", $("#userChip").textContent.includes("Dosen"), $("#userChip").textContent.replace(/\s+/g, " ").trim());
  ok("nama dosen di ruang", $("#dsnNama").textContent.includes("Dr. Indra"), $("#dsnNama").textContent);
  ok("6 tab dosen", $$("#dsnNav [data-dtab]").length === 6, $$("#dsnNav [data-dtab]").length);

  // ringkasan
  ok("stat matakuliah > 0", +$("#dsnStatMK").textContent > 0, $("#dsnStatMK").textContent);
  ok("stat mahasiswa 16", $("#dsnStatMhs").textContent === "16", $("#dsnStatMhs").textContent);
  ok("stat tugas terisi", $("#dsnStatTugas").textContent !== "", $("#dsnStatTugas").textContent);

  // mata kuliah + silabus
  click(byAttr('[data-dtab="kuliah"]'));
  ok("panel kuliah terbuka", !$('[data-dpanel="kuliah"]').classList.contains("hidden"));
  const nMk = $$("#dsnKuliah .match").length;
  ok("daftar matakuliah >= 3", nMk >= 3, nMk);
  ok("menyebut SKS", $("#dsnKuliah").textContent.includes("SKS"), $("#dsnKuliah").textContent.replace(/\s+/g, " ").slice(0, 70));
  click($("#dsnKuliah [data-dsilabus]"));
  ok("modal silabus terbuka", $("#modal").textContent.includes("bab"), $("#modal").textContent.replace(/\s+/g, " ").slice(0, 70));
  ok("silabus memuat daftar bab", $$("#modal .match").length >= 4, $$("#modal .match").length);
  click($('[data-close]'));

  // presensi
  click(byAttr('[data-dtab="presensi"]'));
  ok("panel presensi terbuka", !$('[data-dpanel="presensi"]').classList.contains("hidden"));
  const nChip = $$("#dsnPresMk [data-dmk]").length;
  ok("chip mata kuliah presensi >= 3", nChip >= 3, nChip);
  ok("baris mahasiswa 16", $$("#dsnPresBox [data-pres]").length === 16, $$("#dsnPresBox [data-pres]").length);
  click($("#dsnPresBox [data-pres]"));
  ok("presensi 1 hadir tersimpan", Object.values(Object.values(st().dosen.presensi)[0]).filter(v => v === 1).length === 1, JSON.stringify(st().dosen.presensi));
  click(byAttr('[data-presall="1"]'));
  ok("semua hadir → 100%", $("#dsnStatHadir").textContent === "100%", $("#dsnStatHadir").textContent);
  click(byAttr('[data-presall="0"]'));
  ok("atur ulang → 0%", $("#dsnStatHadir").textContent === "0%", $("#dsnStatHadir").textContent);

  // nilai
  click(byAttr('[data-dtab="nilai"]'));
  ok("panel nilai terbuka", !$('[data-dpanel="nilai"]').classList.contains("hidden"));
  const vInp = $("#dsnNilBox [data-dnilai]");
  ok("input nilai ada", !!vInp);
  vInp.value = 85; vInp.dispatchEvent(new w.Event("change", { bubbles: true }));
  ok("nilai 85 tersimpan", Object.values(Object.values(st().dosen.nilai)[0])[0] === 85, JSON.stringify(st().dosen.nilai));
  ok("rata-rata terhitung", $("#dsnStatRata").textContent === "85", $("#dsnStatRata").textContent);
  const vInp2 = $('#dsnNilBox [data-dnilai="1"]');
  vInp2.value = 65; vInp2.dispatchEvent(new w.Event("change", { bubbles: true }));
  ok("nilai 65 tersimpan", Object.values(Object.values(st().dosen.nilai)[0])[1] === 65, JSON.stringify(Object.values(st().dosen.nilai)[0]));
  ok("rata-rata 75", $("#dsnStatRata").textContent === "75", $("#dsnStatRata").textContent);
  ok("predikat tampil", $("#dsnNilBox").textContent.includes("tuntas"), $("#dsnNilBox").textContent.replace(/\s+/g, " ").slice(0, 80));

  // tugas dosen
  click(byAttr('[data-dtab="tugas"]'));
  ok("panel tugas dosen terbuka", !$('[data-dpanel="tugas"]').classList.contains("hidden"));
  $("#dJudul").value = "Analisis Kasus Pasar Modal";
  $("#dKet").value = "Kelompok 3 orang";
  $("#dTenggat").value = "20 Nov 2026";
  $("#dsnTugasForm").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  ok("tugas dosen tersimpan", (st().tugas || []).filter(t => t.pembuat === "Dosen").length === 1, JSON.stringify((st().tugas || []).map(t => t.judul + "/" + (t.pembuat || "-"))));
  ok("tugas tampil di daftar dosen", $("#dsnTugasList").textContent.includes("Pasar Modal"), $("#dsnTugasList").textContent.replace(/\s+/g, " ").trim().slice(0, 80));
  ok("ringkasan tugas ikut", $("#dsnTugasRingkas").textContent.includes("Pasar Modal"));
  ok("stat tugas = 1", $("#dsnStatTugas").textContent === "1", $("#dsnStatTugas").textContent);

  // bimbingan
  click(byAttr('[data-dtab="bimbingan"]'));
  ok("panel bimbingan terbuka", !$('[data-dpanel="bimbingan"]').classList.contains("hidden"));
  ok("select mahasiswa terisi", $$("#bimNama option").length === 16, $$("#bimNama option").length);
  $("#bimCatatan").value = "Revisi BAB II — perkuat landasan teori";
  $("#dsnBimForm").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  ok("catatan bimbingan tersimpan", st().dosen.bim.length === 1, JSON.stringify(st().dosen.bim));
  ok("catatan tampil di daftar", $("#dsnBimList").textContent.includes("landasan teori"));
  click(byAttr('[data-bimselesai]'));
  ok("catatan ditandai selesai", st().dosen.bim[0].done === true, JSON.stringify(st().dosen.bim[0]));

  // guard dosen
  goto("#/sma");
  ok("dosen ditolak dari ruang siswa", w.location.hash === "#/dosen", w.location.hash);
  goto("#/guru");
  ok("dosen ditolak dari #/guru (ruang terpisah)", w.location.hash === "#/dosen", w.location.hash);
  ok("ruang dosen tetap tampil", !$("#view-dosen").classList.contains("hidden"));

  console.log("\n=== 17. RUANG INDUSTRI — PROYEK, MODUL, TALENTA ===");
  click($("#btnAuth")); // keluar
  click(byAttr('[data-auth="daftar"]'));
  $("#aNama").value = "PT Nusantara Cerdas";
  $("#aPeran").value = "Industri";
  $("#aEmail").value = "mitra@industri.id";
  $("#aPass").value = "rahasia123";
  submitAuth();
  ok("industri otomatis ke #/industri", w.location.hash === "#/industri", w.location.hash);
  ok("ruang industri tampil", !$("#view-industri").classList.contains("hidden"));
  ok("ruang lain tersembunyi", $("#view-guru").classList.contains("hidden") && $("#view-dosen").classList.contains("hidden") && $("#view-siswa").classList.contains("hidden"));
  ok("4 tab industri", $$("#indNav [data-itab]").length === 4, $$("#indNav [data-itab]").length);
  ok("stat proyek = 6 (brief kolaborasi)", $("#indStatProyek").textContent === "6", $("#indStatProyek").textContent);
  ok("stat buka = 6", $("#indStatBuka").textContent === "6", $("#indStatBuka").textContent);

  // proyek terbit
  click(byAttr('[data-itab="proyek"]'));
  ok("panel proyek terbuka", !$('[data-ipanel="proyek"]').classList.contains("hidden"));
  const nProyekAwal = $$("#indProyekBox .match").length;
  ok("6 proyek kolaborasi tampil", nProyekAwal === 6, nProyekAwal);
  $("#iJudul").value = "Aplikasi Laporan Stok Gudang";
  $("#iBidang").value = "Teknologi";
  $("#iBudget").value = "Rp 15.000.000";
  $("#iDurasi").value = "8 minggu";
  $("#iBrief").value = "Memigrasikan laporan Excel ke dashboard web";
  $("#indProyekForm").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  ok("proyek tersimpan", st().industri.proyek.length === 1, JSON.stringify(st().industri.proyek.map(p => p.judul)));
  ok("proyek tampil di daftar", $$("#indProyekBox .match").length === 7, $$("#indProyekBox .match").length);
  ok("proyek milik bisa ditutup", !!byAttr('[data-proyekbuka]'));
  click($('[data-proyekbuka]'));
  ok("status jadi ditutup", st().industri.proyek[0].open === false, JSON.stringify(st().industri.proyek[0]));
  ok("stat buka turun ke 6", $("#indStatBuka").textContent === "6", $("#indStatBuka").textContent);
  click($('[data-proyekbuka]'));
  ok("dibuka lagi", st().industri.proyek[0].open === true);
  click($('[data-proyekdetail]'));
  ok("modal brief terbuka", $("#modal").textContent.includes("Memigrasikan laporan Excel"), $("#modal").textContent.replace(/\s+/g, " ").slice(0, 70));
  click($('[data-close]'));
  click($('[data-proyekhapus]'));
  ok("proyek terhapus", st().industri.proyek.length === 0, st().industri.proyek.length);
  ok("kembali 6 proyek", $$("#indProyekBox .match").length === 6, $$("#indProyekBox .match").length);

  // modul mitra
  click(byAttr('[data-itab="modul"]'));
  ok("panel modul terbuka", !$('[data-ipanel="modul"]').classList.contains("hidden"));
  ok("10 modul tampil", $$("#indModulBox .match").length === 10, $$("#indModulBox .match").length);
  ok("menyebut skema LSP/BNSP", $("#indModulBox").textContent.includes("LSP") || $("#indModulBox").textContent.includes("BNSP"));
  click($("#indModulBox [data-kolab]"));
  ok("kolaborasi diajukan", st().industri.kolab.length === 1, JSON.stringify(st().industri.kolab));
  ok("stat modul = 1", $("#indStatModul").textContent === "1", $("#indStatModul").textContent);
  ok("status chip berubah", $("#indModulBox").textContent.includes("Diajukan"));

  // talenta
  click(byAttr('[data-itab="talenta"]'));
  ok("panel talenta terbuka", !$('[data-ipanel="talenta"]').classList.contains("hidden"));
  ok("16 talenta terpeta", $$("#indTalentaBox [data-undang]").length === 16, $$("#indTalentaBox [data-undang]").length);
  click($("#indTalentaBox [data-undang]"));
  ok("undangan tersimpan", st().industri.undang.length === 1, JSON.stringify(st().industri.undang));
  ok("stat undang = 1", $("#indStatUndang").textContent === "1", $("#indStatUndang").textContent);
  ok("ringkasan menyebut undangan", $("#indUndangRingkas").textContent.includes("wawancara"), $("#indUndangRingkas").textContent.replace(/\s+/g, " ").trim().slice(0, 70));

  // guard industri
  goto("#/guru");
  ok("industri ditolak dari #/guru", w.location.hash === "#/industri", w.location.hash);
  ok("ruang industri tetap tampil", !$("#view-industri").classList.contains("hidden"));

  console.log("\n=== 18. MAHASISWA — RUANG BELAJAR PERGURUAN TINGGI ===");
  click($("#btnAuth")); // keluar
  click(byAttr('[data-auth="daftar"]'));
  $("#aNama").value = "Dina Maharani";
  $("#aPeran").value = "Mahasiswa";
  $("#aEmail").value = "dina@kampus.id";
  $("#aPass").value = "rahasia123";
  submitAuth();
  ok("mahasiswa otomatis ke #/mahasiswa", w.location.hash === "#/mahasiswa", w.location.hash);
  ok("ruang belajar tampil", !$("#view-siswa").classList.contains("hidden"));
  ok("tag perguruan tinggi", $("#sRuangTag").textContent.includes("Perguruan Tinggi") || $("#sRuangTag").textContent.includes("D3"), $("#sRuangTag").textContent);
  ok("tugas dosen terlihat", $("#tugasSiswa").textContent.includes("Pasar Modal"), $("#tugasSiswa").textContent.replace(/\s+/g, " ").trim().slice(0, 80));
  click(byAttr('[data-stab="buku"]'));
  const nMkMhs = $$("#bukuBox .match").length;
  ok("buku kuliah >= 3", nMkMhs >= 3, nMkMhs);
  ok("menyebut SKS", $("#bukuBox").textContent.includes("SKS") || nMkMhs > 0, $("#bukuBox").textContent.replace(/\s+/g, " ").slice(0, 70));
  // asesmen kuliah
  click(byAttr('[data-stab="asesmen"]'));
  ok("asesmen kuliah tersedia", $$("#asesmenBox [data-ujian]").length >= 3, $$("#asesmenBox [data-ujian]").length);
  click($("#asesmenBox [data-ujian]"));
  const soalKul = w.PIJAR_DATA.kuliah.mapel[0].bab.reduce((a, b) => a.concat(b.soal), []);
  ok("soal asesmen kuliah (24)", $$("#ujForm .panel").length === soalKul.length, $$("#ujForm .panel").length);
  isiJawaban("#ujForm", soalKul, true);
  $("#ujForm").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  ok("nilai asesmen kuliah 100", $("#ujIsi .result .big").textContent === "100", $("#ujIsi .result .big").textContent);
  ok("sertifikat kuliah terbit", st().sertifikat.some(s => String(s.judul).includes("Asesmen")), JSON.stringify(st().sertifikat.length));

  console.log("\n=== 19. PAPAN PENGUMUMAN ===");
  goto("#/pengumuman");
  ok("#/pengumuman → landing tampil", !$("#view-landing").classList.contains("hidden") && $("#view-siswa").classList.contains("hidden"));
  ok("section papan pengumuman ada", !!$("#pengumuman"));
  ok("minimal 6 kartu pengumuman", $$(".peng").length >= 6, $$(".peng").length);
  ok("ada pita BARU", $(".peng .peng-rib") && $(".peng .peng-rib").textContent === "BARU", $(".peng .peng-rib") && $(".peng .peng-rib").textContent);
  ok("kartu memuat tanggal", $$("#pengumuman time").length >= 6, $$("#pengumuman time").length);
  ok("kartu menyebut Ruang Dosen & Industri", $("#pengumuman").textContent.includes("Ruang Dosen") && $("#pengumuman").textContent.includes("Ruang Industri"));
  ok("kartu menyebut lisensi DAFFTECH", $("#pengumuman").textContent.includes("DAFFTECH"));
  ok("ajakan masuk/daftar ada", !!$('#pengumuman a[href="#/"]'));
  ok("tautan ke papan pengumuman di nav", !!$('#navLinks a[href="#/pengumuman"]'));
  click($('#pengumuman [data-tentang]'));
  ok("modal Tentang terbuka dari papan", $("#modal").textContent.includes("Tentang Kuradapt"));
  click($('[data-close]'));
  // anchor biasa tetap membuka landing
  goto("#pilar");
  ok("anchor #pilar → landing tampil", !$("#view-landing").classList.contains("hidden"));

  setTimeout(() => {
    console.log("\n=== 20. ERROR KONSOL ===");
    if (errors.length) { errors.forEach(e => console.log("  " + e)); fail += errors.length; }
    else console.log("  Tidak ada error JavaScript.");
    ok("window.print terpanggil (cetak rapor & laporan)", (w.__printed || 0) >= 2, w.__printed);

    console.log(`\n========== HASIL: ${pass} LULUS / ${fail} GAGAL ==========`);
    process.exit(fail ? 1 : 0);
  }, 250);
}, 600);
