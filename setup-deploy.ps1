# ============================================================
# Kuradapt — Skrip Siap Deploy (GitHub Pages + Netlify)
# Jalankan: klik kanan file ini → "Run with PowerShell"
# ============================================================
$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $projectDir

Write-Host "=== Kuradapt Setup Deploy ===" -ForegroundColor Cyan

# 1. Cek git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "GIT TIDAK DITEMUKAN. Pasang Git dari https://git-scm.com dulu." -ForegroundColor Red
    exit 1
}

# 2. Inisialisasi repo jika belum ada
if (-not (Test-Path ".git")) {
    Write-Host "Menginisialisasi git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
    Write-Host "Repo siap." -ForegroundColor Green
} else {
    Write-Host "Repo sudah ada, lewati inisialisasi." -ForegroundColor Green
}

# 3. Tambahkan semua file
Write-Host "Menambahkan semua file..." -ForegroundColor Yellow
git add .

# 4. Commit (jika ada perubahan)
$status = git status --porcelain
if ($status) {
    git commit -m "Kuradapt v1.4.0 — siap deploy hosting + Supabase"
    Write-Host "Commit berhasil." -ForegroundColor Green
} else {
    Write-Host "Tidak ada perubahan baru." -ForegroundColor Gray
}

# 5. Tunjukkan langkah selanjutnya
Write-Host ""
Write-Host "=== LANJUTKAN MANUAL (5 MENIT) ===" -ForegroundColor Cyan
Write-Host "1. Buat repositori baru di github.com (nama bebas, jangan inisialisasi README)."
Write-Host "2. Jalankan perintah berikut (ganti USERNAME dan REPO):"
Write-Host "   git remote add origin https://github.com/USERNAME/REPO.git"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "3. Di GitHub: Settings → Pages → Source: main → Save."
Write-Host "4. Tunggu ~1 menit. App akan live di https://USERNAME.github.io/REPO/"
Write-Host ""
Write-Host "=== SUPABASE (opsional, untuk akun online) ===" -ForegroundColor Cyan
Write-Host "1. Daftar di supabase.com → Create new project (region: Singapore)"
Write-Host "2. SQL Editor → jalankan isi file supabase-schema.sql"
Write-Host "3. Settings → API → salin Project URL + anon public key"
Write-Host "4. Buka config.js, isi SUPABASE_URL dan SUPABASE_ANON_KEY, simpan."
Write-Host "5. Buka aplikasi → Masuk sekarang pakai akun sungguhan, sinkron antar perangkat."
Write-Host ""
Write-Host "Selesai. Aplikasi gratis, tanpa bayaran, aman dari peretas." -ForegroundColor Green
