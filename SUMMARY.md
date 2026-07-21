# SUMMARY.md — SapuBersih (demo Komdigi oleh KODE)

Ringkasan apa yang dibangun, bagaimana memenuhi brief, dan status verifikasi.

## Apa ini
Demo interaktif, sepenuhnya ter-*seed*, dari **SapuBersih** — platform **penemuan & bukti** situs
judi online — untuk dipresentasikan ke **Komdigi** oleh **KODE**. Dioptimalkan untuk walkthrough
langsung 15–20 menit di laptop, lalu diserahkan agar audiens mengklik sendiri.

Pesan inti yang diperagakan **di dalam UI** (bukan hanya di dokumen): **bukti, bukan penindakan** —
menemukan, mengklasifikasikan, mendokumentasikan; **tidak pernah** memblokir atau mengirim otomatis;
setiap putusan AI adalah **rekomendasi** yang wajib **dikonfirmasi manusia**; **audit penuh**;
**disiplin cakupan** pada satu kategori hukum (judi online).

## Cara menjalankan (30 detik)
```bash
bash serve.sh      # → http://localhost:8080   (atau: python3 -m http.server 8080)
```
Atau buka `index.html` langsung. **Tanpa API key, tanpa internet, tanpa build.** Detail di `README.md`.

## Sembilan layar (semua ter-seed, semua bisa diklik)
1. **Beranda / Command Dashboard** — ikhtisar operasional, tren 30 hari, efektivitas sumber, ticker hidup.
2. **Penemuan** — penemuan multi-sumber (CT log unggulan, NRD, permutasi, manual) + **Jalankan Penemuan** tersimulasi (progres → kandidat baru).
3. **Ingestion Data** — unggah CSV/Excel **diparse lokal di peramban**, template, pemetaan kolom, validasi, riwayat, slot API + Fase 2 (media sosial berlisensi).
4. **Klasifikasi AI** — panel bukti (tangkapan, cuplikan, metadata, hash, cap waktu) + putusan judi/bukan/**tidak yakin** + keyakinan + alasan + indikator.
5. **Peta Jaringan / Cluster Mirror** — visualisasi jaringan force-directed interaktif (pan/zoom/klik/perluas), dikelompokkan sinyal teknis bersama. **Momen "wow".**
6. **Antrean Review Analis** — human-in-the-loop, keputusan langsung, penghitung **sampel berlabel**.
7. **Monitoring & Siklus Hidup** — status aktif/dilaporkan/diblokir/tidak aktif (dicatat manusia) + peringatan mirror baru.
8. **Laporan & Dosir** — dosir bukti siap **cetak/PDF** (print-CSS), ekspor **CSV/JSON**, ringkasan pimpinan.
9. **Audit Log & Pengaturan** — audit terfilter; leksikon, ambang, sumber, **cakupan terkunci**, **matriks peran** + switcher, **white-label** (KODE ↔ Komdigi), reset demo.

## Kepatuhan pada aturan brief
- ✅ **Data fiktif/sintetis** sepenuhnya (mis. `slotmaxwin88.xyz`, `gacor-zeus.top`). Tidak ada domain nyata sebagai "terbukti ilegal".
- ✅ **Badge "MODE DEMO — DATA SINTETIS"** persisten di UI; dosir & ringkasan juga berlabel sintetis.
- ✅ **Tanpa klaim akurasi karangan** — keyakinan per item dengan alasan; "tidak yakin" adalah keluaran sah.
- ✅ **Evidence-not-enforcement & konfirmasi manusia terlihat di UI** (verdict = rekomendasi, tombol konfirmasi analis, status "Terkonfirmasi" hanya oleh manusia).
- ✅ **Audit trail di layar** (siapa/kapan/apa/keputusan) — argumen pertahanan hukum.
- ✅ **Disiplin cakupan eksplisit** — hanya *judi online*, terkunci, dapat diubah admin dengan audit.
- ✅ **UI Bahasa Indonesia** (register formal-pemerintahan); kode & dokumen dalam Bahasa Inggris.
- ✅ **Berjalan penuh offline, tanpa kunci** — diverifikasi dengan jaringan dimatikan.
- ✅ **Waktu WIB** dipaksa konsisten di semua timestamp, apa pun zona waktu laptop.

## Set gambar (nano-banana, cap 8 — dipakai 8/8)
1 hero jaringan (16:9, 2K) · 1 empty-state · 6 "tangkapan bukti" forensik teredaksi (3:2). Semua fiktif,
tanpa merek/logo/wajah nyata, beraura artefak berkas perkara. Baris logo pembayaran pada `evidence-06`
**diredaksi** agar bebas merek. Setiap slot punya **fallback CSS**, jadi UI tetap rapi bahkan tanpa
gambar. Rincian di `IMAGES-LOG.md`; cara regenerasi + gotcha aspect-ratio di `REGENERATE-IMAGES.md`.

## Verifikasi (dilakukan)
- ✅ Ke-10 rute render tanpa error (0 console/page error).
- ✅ Uji **offline penuh** via `file://` dengan **jaringan diblokir** → 0 permintaan eksternal, 0 error, penemuan tetap jalan, app termuat.
- ✅ Alur end-to-end diuji: jalankan penemuan → kandidat baru; tinjau → **konfirmasi** (sampel berlabel naik); pilih node cluster + **perluas**; ekspor & **cetak** dosir; **white-label** & **ganti peran** (Pimpinan → hanya-baca).
- ✅ Tidak ada URL eksternal/`fetch`/modul di jalur runtime; font & gambar dibundel lokal.
- ✅ Semua JS lolos `node --check` (syntax).

## Teknologi & ukuran
Vanilla HTML/CSS/JS — tanpa framework, tanpa build, tanpa dependency runtime. State di `localStorage`
dengan reset. Grafik & viz jaringan digambar sendiri sebagai SVG. Tema: IBM Plex Sans/Mono/Serif
(dibundel). ~3.900 baris kode aplikasi; total aset runtime ~8 MB (gambar ~7 MB). Murni statis →
dapat langsung di-deploy sebagai tautan tinggalan (Cloudflare Pages/Netlify/GitHub Pages).

## Dokumen pendamping
- `DEMO-SCRIPT.md` — walkthrough per-layar, talking point Bahasa Indonesia, pertanyaan penggali untuk Komdigi, jawaban jujur (akurasi/media sosial/keamanan data/lini masa), dan daftar "jangan di-overclaim".
- `REHEARSAL-CHECKLIST.md` — cek 10 menit: reset ke bersih, verifikasi offline, setelan laptop/proyektor, rencana cadangan.
- `README.md` — cara jalan, peta layar, struktur, catatan deploy.
- `IMAGES-LOG.md`, `REGENERATE-IMAGES.md` — asal & regenerasi gambar.

## Catatan asumsi (diambil tanpa bertanya, sesuai instruksi run tanpa pengawasan)
- **Stack statis vanilla** dipilih ketimbang Cloudflare Workers+D1 demi jaminan offline maksimum di
  ruang rapat (Workers/D1 tetap disebut sebagai opsi produksi di README).
- **Tema default = KODE Command (gelap)** karena paling berdampak sebagai "pusat komando" di proyektor;
  **Komdigi Netral (terang)** tersedia sebagai white-label dan didemokan langsung.
- **Waktu demo di-anchor** ke 21 Jul 2026, ~09:14 WIB, lalu berjalan real-time — agar timestamp koheren.
- **Nama orang & organisasi hosting** (mis. "PT Awan Data Nusantara (fiktif)") sengaja ditandai *fiktif*.
- Peran awal presenter = **Analis**, agar keputusan langsung bisa diperagakan; switcher tersedia.
