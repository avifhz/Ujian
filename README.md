# CBT Enterprise - Versi Google Apps Script + Siap GitHub Pages

Paket 9 file ini sudah **terhubung langsung** ke Google Spreadsheet & akun Google Anda:
- **Google Spreadsheet ID**: `15hhPU3rRpCgodxhmqgDdc0STJigGnu1vRZH25clvh3w`
- **Link Spreadsheet**: https://docs.google.com/spreadsheets/d/15hhPU3rRpCgodxhmqgDdc0STJigGnu1vRZH25clvh3w/edit?hl=id&gid=2098441566#gid=2098441566
- **Akun Google Pemilik / Deployer**: `avifzein@gmail.com`

---

## Isi 9 File di Dalam ZIP
1. `Code.gs` — Backend Google Apps Script sudah terhubung ke Spreadsheet `15hhPU3rRpCgodxhmqgDdc0STJigGnu1vRZH25clvh3w` (`SPREADSHEET_ID`) + API `doGet` & `doPost`.
2. `appsscript.json` — Manifes izin OAuth lengkap (`spreadsheets`, `drive`, `forms`, `documents`, `send_mail`, `external_request`).
3. `index.html` — Halaman **CBT Siswa** (huruf kecil untuk halaman utama GitHub Pages).
4. `Index.html` — Halaman **CBT Siswa** (untuk ditempel ke editor Apps Script).
5. `Admin.html` — Panel Admin CBT (Bank Soal, Data Siswa, Link Google Form per mapel, Pengaturan).
6. `Proktor.html` — Panel Proktor / Pengawas ujian.
7. `gas-config.js` — Konfigurasi URL Web App Apps Script (`/exec`) + ID Spreadsheet.
8. `gas-bridge.js` — Penghubung otomatis `google.script.run` agar berjalan di GitHub Pages.
9. `README.md` — Panduan ini.

---

## Langkah Memasang (Akun `avifzein@gmail.com`)

### Langkah 1 — Pasang & Deploy di Google Apps Script (Akun `avifzein@gmail.com`)
1. Login ke browser menggunakan akun Google **`avifzein@gmail.com`**.
2. Buka Google Spreadsheet: https://docs.google.com/spreadsheets/d/15hhPU3rRpCgodxhmqgDdc0STJigGnu1vRZH25clvh3w/edit?hl=id&gid=2098441566#gid=2098441566
3. Klik menu **Ekstensi > Apps Script**.
4. Salin & ganti isi **`Code.gs`**, **`Index.html`**, **`Admin.html`**, **`Proktor.html`**, dan **`appsscript.json`** (centang *Setelan Proyek > Tampilkan file manifes appsscript.json*) dengan isi dari ZIP ini.
5. Klik **Deploy > Kelola Deployment** (atau *Deployment baru*) &rarr; **Versi Baru** &rarr; pastikan:
   - **Jalankan sebagai**: *Saya (`avifzein@gmail.com`)*
   - **Yang memiliki akses**: *Siapa saja (Anyone)*
6. Klik **Terapkan** & setujui izin akses (Authorize). Bila URL `/exec` baru berbeda, perbarui `gas-config.js`.

### Langkah 2 — Upload ke GitHub & Aktifkan GitHub Pages
1. Ekstrak seluruh 9 file dari `CBT-Apps-Script-GitHub.zip` ke satu folder.
2. Buka repository GitHub Anda (`avifzein-ship-it/Cbtnesaka`).
3. Klik **Add file > Upload files**, unggah **semua 9 file** ke branch `main`, lalu klik **Commit changes**.
4. Buka **Settings > Pages** &rarr; Source: **Deploy from a branch** (`main / root`) &rarr; klik **Save**.
5. Buka link GitHub Pages Anda:
   - **CBT Siswa**: `https://avifzein-ship-it.github.io/Cbtnesaka/`
   - **Admin**: `https://avifzein-ship-it.github.io/Cbtnesaka/Admin.html`
   - **Proktor**: `https://avifzein-ship-it.github.io/Cbtnesaka/Proktor.html`
