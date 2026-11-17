/* Anti-kedip rute (Kuradapt) — tandai halaman SEBELUM topbar & konten tergambar.
   Tanpa ini, saat refresh browser sempat memperlihatkan nav marketing + isi
   kosong ("halaman di belakang") sebelum app.js selesai memuat.
   File eksternal (bukan inline) agar CSP bisa tanpa 'unsafe-inline'. */
(function () {
  var h = String(location.hash || "").replace(/^#\/?/, "").split("/")[0];
  var dikenal = ["beranda", "pengumuman", "masuk", "daftar", "pilih", "r", "admin", "profil", "materi"];
  /* hash kosong / rute tak dikenal → halaman login (sesuai alur baru) */
  document.body.setAttribute("data-route", dikenal.indexOf(h) > -1 ? h : "masuk");
})();
