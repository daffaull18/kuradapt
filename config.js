/* =====================================================
   Kuradapt — KONFIGURASI DATABASE ONLINE (Supabase)
   -----------------------------------------------------
   Kosongkan kedua nilai di bawah = aplikasi jalan MODE LOKAL
   (data tersimpan di perangkat, tanpa server — tetap berfungsi).

   Cara mengaktifkan mode online (10 menit, gratis):
   1. Daftar https://supabase.com → Create new project (pilih region Singapore).
   2. Menu Settings → API → salin "Project URL" dan "anon public" key.
   3. Tempel di bawah, simpan file, lalu jalankan supabase-schema.sql
      di menu SQL Editor Supabase.
   4. Buka aplikasi → tombol MASUK akan memakai akun sungguhan
      (guru/siswa/industri) dan data tersinkron antar perangkat.
   ===================================================== */
window.KURADAPT_CONFIG = {
  SUPABASE_URL: "",        // contoh: "https://abcdefghijklmnop.supabase.co"
  SUPABASE_ANON_KEY: "",   // contoh: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  /* ---- JEMBATAN EMAIL GOOGLE (notifikasi, opsional) -----------------
     Kosongkan = notifikasi jalan in-app + browser saja.
     Isi dengan URL "Web App" Google Apps Script (akun Google Anda)
     supaya tiap pemberitahuan ikut terkirim sebagai email Google:
     1. Buka script.google.com → New project.
     2. Tempel kode berikut, ganti teks "Kuradapt" bila perlu:
          function kirim(e) {
            var d = JSON.parse(e.postData.contents);
            MailApp.sendEmail({ to: d.ke.join(","), subject: d.subjek,
                                body: d.pesan + "\n\n— " + d.dari +
                                      " (" + d.tgl + ")" });
          }
     3. Deploy → New deployment → type "Web app" → Execute as "Me",
        Access "Anyone" → salin URL /exec ke bawah.
     Kuota gratis Gmail: 100 email/jam. */
  NOTIF_WEBHOOK: "",       // contoh: "https://script.google.com/macros/s/AKfy.../exec"
};
