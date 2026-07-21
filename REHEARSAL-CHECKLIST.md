# REHEARSAL-CHECKLIST.md — cek 10 menit sebelum pertemuan

Ceklis singkat agar demo berjalan mulus. Lakukan **10 menit sebelum** presentasi.

---

## 1 · Jalankan demo (2 menit)
Pilih salah satu — keduanya **tanpa internet**:

**Cara A — server lokal (disarankan):**
```bash
cd SapuBersih
bash serve.sh            # lalu buka http://localhost:8080
# atau: python3 -m http.server 8080
```

**Cara B — buka langsung (paling sederhana):**
Klik dua kali `index.html`, atau seret ke jendela peramban. Berjalan via `file://` tanpa server.
> Catatan: Cara A lebih andal untuk berbagi-layar. Cara B adalah cadangan bila terminal bermasalah.

Peramban yang disarankan: **Chrome/Edge/Chromium** terbaru, layar penuh (F11).

## 2 · Reset ke keadaan bersih (1 menit)
Agar setiap latihan/demo mulai dari data yang sama:
- Buka **Pengaturan** (`#/pengaturan`) → **"Reset Data Demo"** → konfirmasi. **Atau**
- Kosongkan storage peramban: buka DevTools (F12) → Application → Local Storage → hapus
  kunci `sapubersih.state.v1` → refresh. **Atau**
- Buka di **jendela Incognito/penyamaran** (selalu mulai bersih).

Pastikan setelah reset: peran = **Analis (Dewi Anggraini)**, tema = **KODE Command**,
badge **MODE DEMO — DATA SINTETIS** terlihat, jam menunjukkan **~09:14 WIB**.

## 3 · Verifikasi offline (1 menit)
- **Matikan Wi-Fi laptop.** Refresh halaman. Semua harus tetap muncul: teks, font, gambar bukti,
  grafik, peta jaringan. Tidak ada ikon gambar rusak.
- Bila ada gambar yang tidak muncul, placeholder bergaya akan tampil otomatis (tetap rapi) — aman.

## 4 · Uji jalur narasi cepat (3 menit)
Klik cepat menembus alur utama untuk memastikan semuanya responsif:
1. **Beranda** — grafik & ticker tampil.
2. **Penemuan** → **Jalankan Penemuan** — progres jalan, kandidat baru muncul (~7 detik).
3. **Ingestion** → **Gunakan Berkas Contoh** → pratinjau muncul → **Impor**.
4. **Review** → **Tinjau** satu kandidat → drawer bukti terbuka → **Terkonfirmasi** → angka
   "sampel berlabel" naik.
5. **Peta Jaringan** — grafik cluster muncul; klik node; **Perluas Cluster** menambah node.
6. **Laporan** → **Cetak / Simpan PDF** — pratinjau cetak rapi (dokumen putih). Tekan Esc/Batal.
7. **Audit Log** & **Pengaturan** — tampil; coba **ganti peran ke Pimpinan** lalu buka Review
   (tombol keputusan nonaktif), lalu kembalikan ke **Analis**.
8. **Reset lagi** (langkah 2) sebelum demo sungguhan.

> Setelah latihan, **RESET SEKALI LAGI** agar demo mulai bersih.

## 5 · Laptop & proyektor (2 menit)
- **Resolusi**: 1440×900 atau lebih; UI dioptimalkan untuk lebar laptop & terbaca saat diproyeksikan.
- **Zoom peramban**: mulai di **100%**. Bila proyektor kecil/jauh, naikkan ke **110–125%**
  (Ctrl/Cmd +) — tata letak tetap rapi.
- **Kontras**: tema **KODE Command (gelap)** paling tajam di proyektor; bila ruangan sangat terang,
  pertimbangkan **Komdigi Netral (terang)** — sekaligus mendemokan white-label.
- **Mode jangan-ganggu**: matikan notifikasi OS, email, chat. Tutup tab lain.
- **Daya**: colok charger. Nonaktifkan screensaver/sleep.
- **Kursor**: perbesar kursor OS bila perlu agar mudah diikuti audiens.
- Siapkan **satu file CSV kecil asli** (opsional) untuk didemokan di layar Ingestion, bila ingin.

## 6 · Rencana cadangan bila ada yang macet
- **Peramban aneh/lambat** → refresh (F5). Bila perlu, buka ulang di **Incognito**.
- **Animasi penemuan tidak jalan** → cukup ceritakan langkahnya; kandidat baru tetap ada di antrean.
- **Gambar bukti tak muncul** → placeholder otomatis tampil; sebut "artefak bukti sintetis".
- **Cetak/PDF bermasalah** → jelaskan bahwa dosir dirancang untuk dicetak; lanjut ke ekspor CSV/JSON.
- **Server tidak mau jalan** → beralih ke **Cara B** (buka `index.html` langsung).
- **Panik total** → tutup dan buka ulang `index.html`; data demo ter-seed otomatis.

---

### Kartu contekan urutan demo (tempel di pojok layar)
`Beranda → Penemuan (Jalankan) → Ingestion (Impor) → Review (alasan AI) → Peta Jaringan (Perluas) →`
`Review (Konfirmasi langsung) → Laporan (Cetak PDF) → Audit + Pengaturan (tata kelola).`

Ingat: tunjuk **badge DEMO** di awal · sebut **CT log** sebagai unggulan · tekankan **konfirmasi manusia**
· **jangan** sebut angka akurasi.
