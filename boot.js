/* Anti-kedip tema (Kuradapt) — dijalankan SEBELUM paint pertama.
   Pakai tema tersimpan dari localStorage supaya pengguna night tidak
   melihat kilatan terang saat refresh. File eksternal (bukan inline)
   agar Content-Security-Policy bisa tanpa 'unsafe-inline'. */
try {
  var _t = JSON.parse(localStorage.getItem("kuradapt_theme") || "null");
  if (_t === "dark" || _t === "light") document.documentElement.setAttribute("data-theme", _t);
} catch (e) { }
