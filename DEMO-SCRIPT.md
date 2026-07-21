# DEMO-SCRIPT.md — SapuBersih untuk Komdigi

Panduan walkthrough langsung untuk pertemuan. Target durasi **15–20 menit**, dipandu di laptop
via screen-share, lalu diserahkan agar mereka mengklik sendiri.

Presenter: **KODE** (PT Kreasi Otomasi Digital Ekosistem).
Audiens: **Kementerian Komunikasi dan Digital (Komdigi)**.

> **Prinsip nada:** jujur, tenang, operasional. Ini demo dengan **data sintetis** — tunjuk badge
> "MODE DEMO — DATA SINTETIS" di awal. Kita menjual **kemampuan menangani masalah mereka**, bukan
> mengklaim sudah menyelesaikannya. Jangan mengarang angka akurasi.

Pengaturan sebelum mulai: buka `#/beranda`, peran = **Analis (Dewi Anggraini)**, tema = **KODE Command**.
Lihat `REHEARSAL-CHECKLIST.md` untuk reset & pengecekan 10 menit.

---

## Alur & talking point (per layar)

### 0 · Pembukaan (30 detik)
> "Terima kasih atas waktunya. Saya dari KODE. Yang akan kami tunjukkan adalah **mesin** untuk
> menemukan, mengklasifikasikan, dan **mendokumentasikan bukti** situs judi online. Satu hal yang
> perlu ditegaskan di depan — badge ini: **seluruh data di layar adalah sintetis/fiktif**. Domainnya
> kami karang. Tujuannya menunjukkan cara kerjanya, bukan menyajikan temuan nyata."

Tunjuk: badge kuning "MODE DEMO — DATA SINTETIS" di kanan atas.

### 1 · Beranda — Command Dashboard (~2 menit)  `#/beranda`
Buka pada dashboard. Biarkan mereka menyerap gambaran operasionalnya.
> "Ini pandangan yang bisa dibaca seorang Dirjen dalam sekali lihat: **temuan baru hari ini**,
> **antrean yang menunggu keputusan analis**, **domain yang sudah terkonfirmasi manusia**, dan
> **jumlah cluster mirror aktif**. Grafik 30 hari menunjukkan tren, dan di kiri bawah — **sumber mana
> yang paling produktif**. Perhatikan daftar 'Temuan terbaru' yang terus berdenyut: sistem ini hidup."

Poin kunci untuk ditanam: *"Certificate Transparency adalah sumber paling produktif."* (mengarah ke layar berikutnya)

**❓ Tanyakan ke Komdigi:** "Hari ini, dari mana daftar situs judi Bapak/Ibu berasal? Aduan
masyarakat, patroli manual, atau feed otomatis? Berapa banyak per hari?"

### 2 · Penemuan — Discovery (~3 menit)  `#/penemuan`
Ini diferensiator teknis. Jelaskan keempat sumber, tekankan CT log (kartu merah "Kapabilitas utama").
> "Situs judi berganti domain **setiap hari** untuk menghindari blokir. Tapi ada satu hal yang tak bisa
> mereka hindari: untuk bisa diakses, mereka **wajib memasang sertifikat SSL**. Setiap sertifikat baru
> tercatat publik di **Certificate Transparency log**. Kami memantaunya real-time — jadi domain baru
> muncul di radar kami dalam **hitungan jam**, sering sebelum ada satu pun aduan."

**Aksi langsung:** klik **"Jalankan Penemuan"**. Biarkan progres berjalan (memindai sertifikat →
mencocokkan leksikon → resolusi DNS → penangkapan bukti).
> "Satu pass penemuan: memindai sertifikat baru, mencocokkan dengan leksikon Indonesia — slot, gacor,
> maxwin, zeus — menyaring yang benar-benar aktif, lalu **menangkap buktinya**. Hasilnya, sekian
> kandidat baru masuk antrean. Semua ini simulasi lokal, tapi begini persis mekanismenya."

**❓ Tanyakan:** "Selain nama umum ini, ada istilah/pola khas yang Bapak/Ibu ingin kami pantau?"

### 3 · Ingestion Data (~2 menit)  `#/ingestion`
Ini menjawab langsung pertanyaan Komdigi. Buat prominen.
> "Pertanyaan yang paling sering: 'Data kami bagaimana?' Jawabannya — **di sini**. Apa pun daftar yang
> Bapak/Ibu punya hari ini: CSV, Excel, hasil patroli, aduan — cukup diunggah."

**Aksi:** klik **"Gunakan Berkas Contoh"** (atau seret CSV asli). Tunjukkan deteksi kolom otomatis,
pratinjau validasi (valid vs perlu-ditinjau), lalu **"Impor"**.
> "Sistem mendeteksi kolom domain, memvalidasi, dan memasukkannya ke pipeline yang sama — langsung ke
> antrean review. Diproses **lokal**, tidak dikirim ke mana-mana. Ada juga slot terdokumentasi untuk
> **API/feed** dan — sebagai Fase 2 — **data media sosial berlisensi**."

Kalimat penutup layar: *"Daftar apa pun yang Bapak/Ibu miliki hari ini bisa masuk dan diproses seketika."*

**❓ Tanyakan:** "Kalau kami sediakan template ini, tim Bapak/Ibu bisa mengekspor daftar dalam format itu?"

### 4 · Klasifikasi AI — alasan sebuah kandidat (~2 menit)  `#/review` → klik **Tinjau**
Buka satu kandidat berkeyakinan tinggi. Fokus ke **panel bukti + alasan**.
> "Untuk setiap kandidat, mesin menyusun berkas: **tangkapan layar**, judul & cuplikan teks,
> **metadata teknis** — IP, ASN, penerbit & waktu sertifikat, rantai redirect — dan **hash konten**
> dengan cap waktu, sebagai rantai penyimpanan bukti."
> "Lalu putusannya: **judi / bukan / tidak yakin**, dengan **keyakinan** dan **alasan yang bisa dibaca
> manusia** — nama provider terdeteksi, klaim bonus/RTP, bahasa deposit-withdraw, kanal pembayaran.
> Penting: ini **rekomendasi**, bukan keputusan. Dan **'Tidak Yakin' adalah hasil yang sah** — justru
> menaikkan prioritas untuk diperiksa orang."

**❓ Tanyakan:** "Indikator mana yang paling penting secara hukum bagi Bapak/Ibu untuk didokumentasikan?"

### 5 · Peta Jaringan — Cluster Mirror (~2,5 menit)  `#/jaringan`  ★ MOMEN "WOW"
> "Ini bagian yang membedakan. Satu situs jarang berdiri sendiri. Dari satu domain terkonfirmasi, kami
> **memetakan seluruh jaringan mirror-nya** — dikelompokkan berdasarkan sinyal teknis yang sama: IP/ASN,
> **favicon hash**, **HTML fingerprint**, rantai redirect."

Klik-tarik grafik, klik sebuah node → panel detail. Lalu klik **"Perluas Cluster"**.
> "Kalimat kuncinya: **kami tidak menangkap satu domain — kami memetakan jaringannya.** Ketika operator
> yang sama memunculkan mirror baru, sistem otomatis mengaitkannya ke cluster ini."

**❓ Tanyakan:** "Apakah pemetaan jaringan seperti ini yang selama ini sulit dilakukan secara manual?"

### 6 · Antrean Review — konfirmasi manusia LANGSUNG (~2 menit)  `#/review`
Ini bukti "human-in-the-loop". Lakukan langsung, atau **serahkan laptop** ke mereka.
> "Tidak ada yang berstatus 'Terkonfirmasi' tanpa keputusan manusia. Analis membuka kandidat, membaca
> bukti, lalu memilih: **Terkonfirmasi / Perlu Investigasi / Bukan**."

**Aksi:** buka satu kandidat → **Terkonfirmasi Judi** → isi catatan → konfirmasi. Tunjuk:
> "Perhatikan dua hal. Satu, angka **'sampel berlabel terkumpul'** naik — setiap keputusan menjadi
> data pelatihan; **model kami makin pintar seiring pemakaian**. Dua, keputusan ini langsung tercermin
> di dashboard dan tercatat di audit."

**Serahkan laptop:** *"Silakan Bapak/Ibu coba sendiri — buka satu, dan putuskan."*

### 7 · Laporan & Dosir — keluaran yang bisa diserahkan (~1,5 menit)  `#/laporan`
> "Pada akhirnya, yang Bapak/Ibu butuhkan adalah **berkas bukti**. Untuk setiap domain, kami hasilkan
> **dosir** ini: tangkapan bukti, metadata, hash, alasan AI, dan **rekam konfirmasi manusia** —
> siapa, kapan, dengan tanda tangan sistem."

**Aksi:** klik **"Cetak / Simpan PDF"** (tunjukkan tata letak cetak). Lalu **"Ekspor CSV/JSON"** dan
tab **"Ringkasan Pimpinan"**.
> "Ini bisa dicetak jadi PDF dan diserahkan ke pihak berwenang. Ada juga ekspor batch dan ringkasan
> untuk pimpinan."

### 8 · Audit & Tata Kelola — penutup (~1,5 menit)  `#/audit` lalu `#/pengaturan`
> "Sebagai penutup, tata kelola — karena ini yang penting bagi sebuah regulator. **Setiap aksi tercatat**:
> siapa, kapan, terhadap apa, keputusan apa. Ini yang membuat temuan **dapat dipertahankan secara hukum**."

Buka `#/pengaturan`, tunjuk **Cakupan Deteksi** dan **matriks peran**.
> "Dua penjaga penting. Satu, **cakupan** dikunci pada satu kategori — **judi online** — dan hanya bisa
> diubah Super Admin dengan catatan audit; ini **bukan alat sensor serbaguna**. Dua, **peran**: analis
> memutuskan, pimpinan hanya-baca."

**Aksi opsional:** ganti peran ke **Pimpinan** (kanan atas) → buka `#/review` → tunjukkan tombol
keputusan **nonaktif** (hanya-baca). Lalu tunjukkan **white-label**: ganti tema ke **Komdigi Netral**.
> "Dan tampilannya bisa di-white-label — ini versi netral bernuansa pemerintahan untuk Komdigi."

### Penutup (30 detik)
> "Ringkasnya: Komdigi menyediakan data; kami menyediakan **mesin yang mengubah data itu menjadi temuan
> terverifikasi dan berkas bukti** — dengan manusia di setiap keputusan dan jejak audit di setiap langkah.
> Kami siap memulai dari daftar yang sudah Bapak/Ibu miliki hari ini."

---

## Jawaban jujur untuk pertanyaan yang mungkin muncul

**"Berapa akurasinya?"**
> "Kami sengaja **tidak** memasang angka akurasi di demo ini, karena akurasi nyata hanya bermakna diukur
> pada **data Bapak/Ibu**. Yang kami tawarkan: keyakinan **per item dengan alasan yang transparan**,
> 'tidak yakin' sebagai keluaran sah, dan **manusia mengonfirmasi** sebelum apa pun final. Kami usulkan
> uji coba terbatas dengan data nyata untuk mengukur akurasi sebenarnya, bukan menjanjikan angka di muka."

**"Bagaimana cakupan media sosial?"**
> "Ada di peta jalan sebagai **Fase 2**, dan Anda melihat slot-nya sudah terdokumentasi di layar Ingestion.
> Syaratnya **data berlisensi/resmi** dan perjanjian kepatuhan — kami tidak melakukan scraping ilegal.
> Untuk Fase 1, fokus kami adalah domain/web tempat sinyal SSL sangat kuat."

**"Bagaimana data kami diamankan?"**
> "Untuk demo, semuanya berjalan **lokal di laptop ini** — tanpa internet, tanpa kirim ke server. Untuk
> produksi, arsitektur bisa **on-premise atau di lingkungan pemerintah**, dengan kontrol akses berbasis
> peran, enkripsi, dan **audit log** yang tadi Anda lihat. Data Komdigi tetap milik dan kendali Komdigi."

**"Berapa lama implementasinya?"**
> "Karena ingestion menerima CSV/Excel, kita bisa mulai **memproses daftar yang ada dalam hitungan hari**
> untuk pilot terbatas. Integrasi penuh (feed otomatis, penempatan on-prem, penyetelan leksikon &
> ambang) bertahap — kami usulkan pilot dulu, baru menyepakati lini masa berdasarkan hasilnya. Kami tidak
> ingin menjanjikan tanggal sebelum melihat data dan lingkungan Bapak/Ibu."

**"Apakah sistem ini yang memblokir situsnya?"**
> "**Tidak.** Ini penting. SapuBersih **menemukan dan mendokumentasikan** — ia tidak pernah memblokir atau
> mengirim apa pun secara otomatis. Kolom status seperti 'Diblokir' adalah **catatan** hasil tindak lanjut
> pihak berwenang, untuk transparansi. Penindakan tetap kewenangan Komdigi dan aparat."

---

## Yang TIDAK boleh di-overclaim
- ❌ Jangan sebut angka akurasi/persentase deteksi apa pun. (Tidak ada di UI, jangan diucapkan.)
- ❌ Jangan mengklaim otomatis memblokir, melapor, atau menindak. Platform **hanya bukti**.
- ❌ Jangan menampilkan domain nyata sebagai "terbukti ilegal". Semua data **fiktif** — katakan begitu.
- ❌ Jangan menjanjikan cakupan media sosial penuh sekarang — itu Fase 2, butuh lisensi data.
- ❌ Jangan menjanjikan tanggal go-live pasti sebelum pilot dengan data nyata.
- ✅ Boleh ditekankan: multi-sumber (CT log sebagai unggulan), pemetaan cluster, konfirmasi manusia,
  audit penuh, disiplin cakupan, kesiapan white-label & on-prem, ingestion data mereka seketika.
