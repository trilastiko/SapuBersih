# SapuBersih

**Platform Penemuan & Bukti Judi Online** — demo interaktif yang disiapkan oleh **KODE**
(PT Kreasi Otomasi Digital Ekosistem) untuk **Kementerian Komunikasi dan Digital (Komdigi)**.

> ⚠️ **MODE DEMO — DATA SINTETIS.** Seluruh domain, cluster, dan bukti di aplikasi ini **fiktif** dan
> dibuat untuk demonstrasi. Tidak ada situs nyata yang ditampilkan sebagai terbukti ilegal.

SapuBersih **menemukan, mengklasifikasikan, dan mendokumentasikan** kandidat situs judi online.
Ia **tidak memblokir dan tidak menindak** — setiap klasifikasi AI adalah **rekomendasi** yang wajib
**dikonfirmasi analis manusia**, dan setiap aksi tercatat dalam **audit log**. Prinsipnya: **bukti,
bukan penindakan.**

---

## Cara menjalankan (offline, tanpa API key, tanpa internet)

**Opsi 1 — server lokal (disarankan untuk berbagi-layar):**
```bash
bash serve.sh                 # buka http://localhost:8080
# atau
python3 -m http.server 8080   # buka http://localhost:8080
```

**Opsi 2 — buka langsung:** klik dua kali **`index.html`** (berjalan via `file://`, tanpa server).

Tidak ada langkah build, tidak ada dependency, tidak ada koneksi jaringan yang dibutuhkan saat demo.
Semua data ter-*seed* secara lokal; font dan gambar dibundel. Diuji berjalan penuh dengan **jaringan
dimatikan**.

> Peramban: Chrome/Edge/Chromium terbaru. Untuk presentasi, lihat `REHEARSAL-CHECKLIST.md`.

---

## Sembilan layar demo

| # | Layar | Rute | Inti |
|---|-------|------|------|
| 1 | Beranda / Command Dashboard | `#/beranda` | Ikhtisar operasional: temuan hari ini, antrean, terkonfirmasi, cluster, tren 30 hari, efektivitas sumber, ticker temuan. |
| 2 | Penemuan / Discovery | `#/penemuan` | Penemuan multi-sumber (CT log unggulan, NRD, permutasi, manual) + tombol **Jalankan Penemuan** tersimulasi. |
| 3 | Ingestion Data | `#/ingestion` | Unggah CSV/Excel (parsing lokal), template, pemetaan kolom, validasi, riwayat, slot API & Fase 2. |
| 4 | Klasifikasi AI | `#/klasifikasi` | Panel bukti + putusan (judi/bukan/tidak yakin) + keyakinan + alasan + indikator. |
| 5 | Peta Jaringan / Cluster Mirror | `#/jaringan` | Visualisasi jaringan mirror interaktif, dikelompokkan sinyal teknis bersama. |
| 6 | Antrean Review Analis | `#/review` | Human-in-the-loop: konfirmasi langsung; penghitung "sampel berlabel". |
| 7 | Monitoring & Siklus Hidup | `#/monitoring` | Status domain terkonfirmasi (aktif/dilaporkan/diblokir/tidak aktif) + peringatan mirror baru. |
| 8 | Laporan & Dosir | `#/laporan` | Dosir bukti siap cetak/PDF, ekspor CSV/JSON, ringkasan pimpinan. |
| 9 | Audit Log & Pengaturan | `#/audit`, `#/pengaturan` | Jejak audit terfilter; leksikon, ambang, sumber, cakupan, peran, white-label, reset. |

---

## Kapabilitas yang ditonjolkan
- **Certificate Transparency** sebagai sumber unggulan (menangkap domain baru dalam hitungan jam).
- **Pemetaan cluster mirror** — "kami tidak menangkap satu domain, kami memetakan jaringannya."
- **Konfirmasi manusia wajib** + penghitung sampel berlabel (dataset untuk fine-tuning masa depan).
- **Audit trail penuh** untuk pertahanan hukum.
- **Disiplin cakupan** — hanya kategori *judi online*, dapat diubah admin dengan audit.
- **White-label** — tema **KODE Command** (gelap) & **Komdigi Netral** (terang), dapat diganti live.
- **Peran** — super admin / admin / analis / pimpinan (hanya-baca), dengan switcher mode demo.

## Opsional: AI live
Demo berjalan penuh dari data ter-seed **tanpa** kunci apa pun. Bila `ANTHROPIC_API_KEY` tersedia di
lingkungan produksi, panel klasifikasi yang sama dapat memanggil model live — **namun demo tidak
bergantung padanya**.

---

## Struktur proyek
```
index.html               # shell aplikasi (memuat semua skrip via <script>, tanpa modul/fetch)
serve.sh                 # helper server lokal (opsional)
assets/
  css/  theme.css        # token desain + dua tema white-label
        app.css          # tata letak & komponen
        components.css    # grafik, viz cluster, komponen per-layar
        print.css        # isolasi cetak untuk dosir/ringkasan
  fonts/                 # IBM Plex Sans/Mono/Serif (woff2, lokal — offline)
  img/                   # 8 gambar (nano-banana) + prompt + fallback CSS
  js/   util · seed · store · charts · cluster · components · app · views-*.js
docs/                    # (ruang dokumen tambahan)
DEMO-SCRIPT.md           # panduan walkthrough pertemuan
REHEARSAL-CHECKLIST.md   # cek 10 menit pra-demo
IMAGES-LOG.md · REGENERATE-IMAGES.md · SUMMARY.md
```

## Teknologi
Vanilla HTML/CSS/JavaScript — **tanpa framework, tanpa build, tanpa dependency runtime**. State
disimpan di `localStorage` (dengan tombol reset). Grafik dan visualisasi jaringan digambar sebagai
SVG buatan sendiri. Dipilih demi keandalan maksimum di laptop ruang rapat yang offline.

### Deploy sebagai tautan tinggalan (opsional)
Karena murni statis, folder ini dapat langsung di-deploy ke hosting statis mana pun (mis. Cloudflare
Pages: `npx wrangler pages deploy .`, atau GitHub Pages, Netlify, dst.) sebagai tautan tinggalan
pasca-pertemuan. Tidak ada backend yang diperlukan.
