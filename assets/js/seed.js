/* ==========================================================================
   seed.js — Fully fictional, synthetic, internally-consistent demo data.
   Deterministic (fixed anchor + seeded PRNG) so "Reset Demo" restores an
   identical clean state. Exposes: window.Seed.build()
   ALL domains/clusters/evidence are INVENTED. No real sites/brands/people.
   ========================================================================== */
(function () {
  'use strict';
  const U = window.U;

  // Fixed demo anchor (WIB). All relative timestamps derive from this.
  const NOW = new Date('2026-07-21T09:14:00+07:00').getTime();
  const HOUR = 3600e3, DAY = 24 * HOUR, MIN = 60e3;

  // ---------------- People (roles) ----------------
  const USERS = [
    { id: 'u_super', name: 'Andini Kusuma',      role: 'super_admin', title: 'Super Admin Sistem' },
    { id: 'u_admin', name: 'Bayu Prasetyo',      role: 'admin',       title: 'Administrator Platform' },
    { id: 'u_an1',   name: 'Dewi Anggraini',     role: 'analis',      title: 'Analis Verifikasi' },
    { id: 'u_an2',   name: 'Rizky Ramadhan',     role: 'analis',      title: 'Analis Verifikasi' },
    { id: 'u_an3',   name: 'Siti Nurhaliza',     role: 'analis',      title: 'Analis Verifikasi' },
    { id: 'u_pimp',  name: 'Dr. Hendra Wijaya',  role: 'pimpinan',    title: 'Pimpinan (Hanya-Baca)' }
  ];
  const ROLE_LABEL = { super_admin: 'Super Admin', admin: 'Admin', analis: 'Analis', pimpinan: 'Pimpinan' };

  // ---------------- Discovery sources ----------------
  const SOURCES = [
    {
      id: 'cert_transparency', name: 'Certificate Transparency', short: 'CT Log', icon: 'cert', headline: true,
      desc: 'Pemantauan log Certificate Transparency publik. Setiap sertifikat SSL/TLS baru yang diterbitkan untuk domain yang cocok dengan leksikon dimunculkan dalam hitungan jam.',
      how: [
        'Berlangganan aliran log CT publik (Argon, Xenon, Nessie, dll.) secara real-time.',
        'Setiap entri sertifikat baru diperiksa terhadap leksikon & pola permutasi judi online.',
        'Domain & seluruh Subject Alternative Name (SAN) yang cocok masuk antrean kandidat.',
        'Karena situs judi berganti domain harian namun tetap wajib memasang SSL, sumber ini menangkap domain baru lebih awal.'
      ]
    },
    {
      id: 'newly_registered', name: 'Domain Baru Terdaftar', short: 'NRD', icon: 'globe', headline: false,
      desc: 'Aliran domain yang baru didaftarkan (newly-registered domain feed) disaring terhadap leksikon dan pola nama.',
      how: [
        'Menyerap feed pendaftaran domain harian per zona/TLD.',
        'Menyaring nama domain yang mengandung token leksikon (slot, gacor, toto, dst.).',
        'Kandidat dengan skor kemiripan tinggi diteruskan ke pemeriksaan teknis.'
      ]
    },
    {
      id: 'keyword_permutation', name: 'Mesin Permutasi Kata Kunci', short: 'Permutasi', icon: 'hash', headline: false,
      desc: 'Menghasilkan kombinasi kata kunci Indonesia + angka + TLD, lalu memeriksa domain yang benar-benar aktif.',
      how: [
        'Mengombinasikan token leksikon (mis. gacor + zeus + 88) menjadi kandidat domain.',
        'Melakukan resolusi DNS & pemeriksaan keaktifan untuk menyaring yang benar-benar hidup.',
        'Yang aktif diteruskan untuk penangkapan bukti & klasifikasi.'
      ]
    },
    {
      id: 'ingest_komdigi', name: 'Ingestion Data Komdigi', short: 'Ingest', icon: 'upload2', headline: false,
      desc: 'Daftar domain/URL/aduan yang diunggah mitra (mis. Komdigi) melalui CSV/Excel atau antarmuka API.',
      how: [
        'Menerima berkas CSV/Excel atau panggilan API berisi domain/URL/aduan.',
        'Validasi & pemetaan kolom, lalu domain masuk pipeline yang sama.',
        'Setiap baris diberi jejak asal-usul (provenance) untuk audit.'
      ]
    },
    {
      id: 'manual_seed', name: 'Seed Manual Analis', short: 'Manual', icon: 'user', headline: false,
      desc: 'Analis memasukkan domain secara manual dari investigasi, laporan masyarakat, atau ekspansi cluster.',
      how: [
        'Analis menambahkan domain tunggal atau daftar dari temuan investigasi.',
        'Sering dipakai untuk memperluas cluster mirror dari satu situs terkonfirmasi.'
      ]
    }
  ];

  // ---------------- Lexicon ----------------
  const LEXICON = [
    { term: 'slot', cat: 'permainan' }, { term: 'gacor', cat: 'slang' }, { term: 'maxwin', cat: 'slang' },
    { term: 'toto', cat: 'permainan' }, { term: 'togel', cat: 'permainan' }, { term: 'jp', cat: 'slang' },
    { term: '4d', cat: 'permainan' }, { term: 'zeus', cat: 'provider' }, { term: 'olympus', cat: 'provider' },
    { term: 'gates', cat: 'provider' }, { term: 'bonanza', cat: 'provider' }, { term: 'scatter', cat: 'permainan' },
    { term: 'rtp', cat: 'slang' }, { term: 'cuan', cat: 'slang' }, { term: 'hoki', cat: 'slang' },
    { term: 'sultan', cat: 'slang' }, { term: 'wd', cat: 'transaksi' }, { term: 'depo', cat: 'transaksi' },
    { term: 'rungkad', cat: 'slang' }, { term: 'sabung', cat: 'permainan' }, { term: 'tangkas', cat: 'permainan' },
    { term: 'jitu', cat: 'slang' }, { term: 'sport', cat: 'permainan' }, { term: 'bola', cat: 'permainan' }
  ];
  const LEX_PERMUTATIONS = ['gacor + zeus + 88 → gacorzeus88', 'maxwin + olympus → maxwinolympus', 'slot + gacor + 303 → slotgacor303', 'toto + 4d + ku → toto4dku', 'jp + sultan + vip → jpsultanvip'];

  // ---------------- Building blocks ----------------
  const TLDS = ['.xyz', '.top', '.click', '.live', '.vip', '.icu', '.cc', '.win', '.bet', '.fun', '.site', '.online', '.club', '.pro'];
  const ASN_ORGS = [
    { asn: 'AS138201', org: 'PT Awan Data Nusantara (fiktif)', country: 'ID' },
    { asn: 'AS45102',  org: 'SEA-Cloud Holdings Ltd (fiktif)',  country: 'SG' },
    { asn: 'AS131099', org: 'RapidHost Offshore Inc (fiktif)',   country: 'KH' },
    { asn: 'AS209242', org: 'NimbusVeil Networks (fiktif)',      country: 'NL' },
    { asn: 'AS398012', org: 'Dataledge Anonim LLC (fiktif)',     country: 'US' }
  ];
  const CA_ISSUERS = ["Let's Encrypt (R3)", "Let's Encrypt (E1)", 'ZeroSSL RSA', 'GTS CA 1P5'];
  const SNIPPETS_JUDI = [
    'Bonus New Member 100% di awal', 'RTP Live hari ini 97,8%', 'Min. Depo 10rb, Proses Kilat',
    'WD Tanpa Potongan 24 Jam', 'Link Alternatif Anti Blokir', 'Daftar → Login → Main',
    'Gates of Olympus · Sweet Bonanza · Zeus', 'Deposit Pulsa & E-Wallet', 'Livechat CS 24 Jam Online',
    'Jackpot Maxwin Pecah Malam Ini', 'Scatter Hitam Gampang Menang', 'Pola Gacor Terbaru'
  ];
  const SNIPPETS_BUKAN = [
    'Artikel: tips keuangan keluarga', 'Katalog produk kerajinan lokal', 'Blog perjalanan Nusantara',
    'Halaman parkir domain', 'Situs berita komunitas', 'Portofolio desain grafis'
  ];
  const TITLE_JUDI = [
    'Situs Slot Online Terpercaya', 'Agen Resmi Slot Gacor', 'Bandar Togel Online',
    'Live Casino & Slot', 'Slot Maxwin Gampang JP', 'Toto 4D Hadiah Terbesar'
  ];

  function hex(r, n) { let s = ''; const c = '0123456789abcdef'; for (let i = 0; i < n; i++) s += c[Math.floor(r() * 16)]; return s; }
  function ipv4(r) { return U.pick(r, ['103.147.88.', '45.87.219.', '156.240.104.', '193.203.7.', '107.174.55.']) + U.rint(r, 2, 250); }

  // Build the AI reasons/indicators for a judi domain given intensity
  function judiReasons(r, ind) {
    const rs = [];
    if (ind.provider || ind.game) rs.push({ k: 'hit', t: 'Nama provider/permainan judi terdeteksi', d: 'Zeus, Olympus, Gates, Bonanza' });
    if (ind.bonus || ind.rtp) rs.push({ k: 'hit', t: 'Klaim bonus / RTP / jackpot pada halaman', d: '“Bonus New Member 100%”, “RTP 97,8%”' });
    if (ind.deposit) rs.push({ k: 'hit', t: 'Bahasa transaksi deposit–withdraw', d: '“Min Depo”, “WD tanpa potongan”' });
    if (ind.payment) rs.push({ k: 'hit', t: 'Kanal pembayaran (e-wallet/transfer/pulsa) terindikasi', d: 'ikon saluran pembayaran pada footer' });
    if (ind.chat) rs.push({ k: 'soft', t: 'Pola live-chat / agen 24 jam', d: 'widget “Livechat CS 24 Jam”' });
    rs.push({ k: 'hit', t: 'Struktur URL & kata kunci cocok leksikon judi online', d: 'skor kemiripan tinggi' });
    return rs;
  }

  function makeEvidence(r, i, verdict) {
    const asn = U.pick(r, ASN_ORGS);
    const nRedir = U.rint(r, 1, 3);
    const redir = [];
    for (let k = 0; k < nRedir; k++) redir.push((verdict === 'judi' ? 'r' + (k + 1) + '-cdn' : 'www') + '.hop' + hex(r, 3) + U.pick(r, TLDS) + ' (301)');
    return {
      screenshot: 'evidence-0' + (1 + (i % 6)) + '.jpg',
      pageTitle: (verdict === 'judi' ? (U.pick(r, TITLE_JUDI) + ' #' + U.rint(r, 1, 9)) : U.pick(r, ['Halaman Utama', 'Selamat Datang', 'Beranda', 'Domain Parkir'])),
      snippets: verdict === 'judi'
        ? shuffle(r, SNIPPETS_JUDI).slice(0, U.rint(r, 3, 5))
        : shuffle(r, SNIPPETS_BUKAN).slice(0, 2),
      ip: ipv4(r), asn: asn.asn, asnOrg: asn.org, country: asn.country,
      hosting: asn.org.replace(' (fiktif)', ''),
      certIssuer: U.pick(r, CA_ISSUERS),
      certIssuedAt: NOW - U.rint(r, 2, 60) * HOUR,
      redirectChain: redir,
      contentHash: 'sha256:' + hex(r, 40),
      htmlFingerprint: 'simhash:' + hex(r, 16),
      faviconHash: 'mmh3:' + (U.rint(r, -2100000000, 2100000000)),
      captureAt: NOW - U.rint(r, 1, 48) * HOUR,
      tlsSan: []
    };
  }
  function shuffle(r, arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------------- Cluster definitions (the "wow") ----------------
  const CLUSTERS_DEF = [
    {
      id: 'CLS-ZEUS-01', name: 'Jaringan Gacor-Zeus', seed: 'gacor-zeus.top',
      signals: { ip: '103.147.88.47', asn: 'AS138201', asnOrg: 'PT Awan Data Nusantara (fiktif)', faviconHash: 'mmh3:-1583920145', htmlFingerprint: 'simhash:9f2c71a80b4e6d13', hostingCountry: 'ID' },
      members: [
        'gacor-zeus.top', 'gacorzeus.click', 'zeus-gacor.xyz', 'gacorzeus88.top', 'gacor-zeus2.vip',
        'zeusgacor.live', 'gacorzeus.win', 'gzeus-alt.top', 'gacor-zeus.icu', 'zeus88gacor.cc',
        'gacorzeus-vip.top', 'gacorzeus99.top', 'zeus-gacor.online', 'gacorzeus.fun', 'gacor-zeus-ofc.top',
        'zeusgacor303.top', 'gacor-zeus.site', 'gzeus.club', 'gacorzeuswin.top', 'zeus-gacor.pro',
        'gacorzeus77.top', 'gacor-zeus-max.top'
      ]
    },
    {
      id: 'CLS-OLY-01', name: 'Jaringan Maxwin-Olympus', seed: 'maxwin-olympus.vip',
      signals: { ip: '45.87.219.132', asn: 'AS45102', asnOrg: 'SEA-Cloud Holdings Ltd (fiktif)', faviconHash: 'mmh3:772014588', htmlFingerprint: 'simhash:3ad9016cf7712e05', hostingCountry: 'SG' },
      members: [
        'maxwin-olympus.vip', 'olympusmaxwin.top', 'maxwinolympus.click', 'olympus-maxwin.live',
        'maxwinolympus88.xyz', 'olympusgates.vip', 'maxwin-gates.top', 'olympusmaxwin.win',
        'gates-olympus.icu', 'maxwinolympus.fun', 'olympus-maxwin303.top', 'maxwinolympus.online',
        'olympusmaxwinvip.top', 'maxwin-olympus.cc'
      ]
    },
    {
      id: 'CLS-TOTO-01', name: 'Jaringan Toto-4D', seed: 'toto4dku.top',
      signals: { ip: '156.240.104.19', asn: 'AS131099', asnOrg: 'RapidHost Offshore Inc (fiktif)', faviconHash: 'mmh3:1904772310', htmlFingerprint: 'simhash:c1e4482a90ff7b62', hostingCountry: 'KH' },
      members: ['toto4dku.top', 'toto-4d.live', 'togel4dku.xyz', 'toto4d88.click', 'togeltotojitu.top', 'toto4dku.vip', '4dtotoku.win', 'toto-togel-4d.top', 'toto4dku.fun']
    }
  ];

  // Standalone (unclustered or singleton) judi + a few bukan/investigasi
  const STANDALONE = [
    { domain: 'sultanslot77.icu', verdict: 'judi' },
    { domain: 'cuan-bonanza.live', verdict: 'judi' },
    { domain: 'hokijp99.top', verdict: 'judi' },
    { domain: 'scatterhitam.vip', verdict: 'judi' },
    { domain: 'rungkad-max.click', verdict: 'judi' },
    { domain: 'depo10k-wd.top', verdict: 'judi' },
    { domain: 'beritalokal-sehat.xyz', verdict: 'bukan' },
    { domain: 'kerajinan-nusantara.site', verdict: 'bukan' },
    { domain: 'promo-diskon-gadgets.online', verdict: 'tidak_yakin' },
    { domain: 'forum-komunitas99.club', verdict: 'tidak_yakin' }
  ];

  // ---------------- Assemble domains ----------------
  function build() {
    const r = U.rng(20260721);
    const domains = [];
    let seq = 1;
    const clusters = [];

    function nextId() { return 'TMN-2026-' + String(seq++).padStart(4, '0'); }

    // status/lifecycle assignment helpers (deterministic distributions)
    function assignJudiStatus(idx, isSeed) {
      // seeds & most cluster members confirmed; some still in queue/review
      const roll = r();
      if (isSeed) return 'terkonfirmasi';
      if (roll < 0.55) return 'terkonfirmasi';
      if (roll < 0.78) return 'baru';
      if (roll < 0.9) return 'review';
      return 'investigasi';
    }

    function lifecycleFor() {
      const roll = r();
      if (roll < 0.5) return 'aktif';
      if (roll < 0.68) return 'dilaporkan';
      if (roll < 0.82) return 'diblokir';
      return 'tidak_aktif';
    }

    function analyst() { return U.pick(r, [USERS[2], USERS[3], USERS[4]]); }

    function makeDomain(domain, verdict, clusterId, sharedSignals, isSeed) {
      const ind = verdict === 'judi'
        ? { provider: true, game: true, bonus: r() > 0.1, rtp: r() > 0.2, deposit: true, payment: r() > 0.15, chat: r() > 0.3 }
        : verdict === 'tidak_yakin'
          ? { provider: false, game: r() > 0.5, bonus: r() > 0.6, rtp: false, deposit: r() > 0.7, payment: false, chat: r() > 0.5 }
          : { provider: false, game: false, bonus: false, rtp: false, deposit: false, payment: false, chat: false };

      let confidence, reasons;
      if (verdict === 'judi') {
        confidence = U.rint(r, 84, 98);
        reasons = judiReasons(r, ind);
      } else if (verdict === 'tidak_yakin') {
        confidence = U.rint(r, 42, 63);
        reasons = [
          { k: 'soft', t: 'Sebagian indikator terdeteksi namun lemah', d: 'kata kunci ambigu' },
          { k: 'soft', t: 'Sebagian konten di balik login / teredaksi', d: 'perlu verifikasi manual' },
          { k: 'neg', t: 'Tidak ada kanal pembayaran/transaksi yang jelas', d: '' }
        ];
      } else {
        confidence = U.rint(r, 6, 22);
        reasons = [
          { k: 'neg', t: 'Tidak ditemukan indikator transaksi judi', d: '' },
          { k: 'neg', t: 'Konten menyerupai blog/berita/katalog umum', d: '' }
        ];
      }

      const source = isSeed ? 'manual_seed'
        : U.pick(r, ['cert_transparency', 'cert_transparency', 'cert_transparency', 'newly_registered', 'keyword_permutation', 'ingest_komdigi']);

      const status = verdict === 'bukan'
        ? (r() > 0.4 ? 'bukan' : 'review')
        : verdict === 'tidak_yakin'
          ? (r() > 0.5 ? 'investigasi' : 'review')
          : assignJudiStatus(seq, isSeed);
      // ~40% of findings surfaced "today" so the command dashboard opens with a live volume.
      let discoveredAt;
      if (r() < 0.4) discoveredAt = NOW - U.rint(r, 0, 22) * HOUR - U.rint(r, 0, 59) * MIN;
      else discoveredAt = NOW - U.rint(r, 1, 29) * DAY - U.rint(r, 0, 23) * HOUR - U.rint(r, 0, 59) * MIN;

      const ev = makeEvidence(r, seq, verdict);
      const dObj = {
        id: nextId(), domain: domain, discoveredAt: discoveredAt, source: source,
        status: status, priority: verdict === 'judi' ? (confidence > 92 ? 'tinggi' : 'sedang') : (verdict === 'tidak_yakin' ? 'sedang' : 'rendah'),
        category: 'judi_online', clusterId: clusterId || null,
        sharedSignals: sharedSignals || [],
        ai: { verdict: verdict, confidence: confidence, reasons: reasons, indicators: ind },
        evidence: ev,
        lifecycle: null, decision: null
      };
      function decideAt(hoursLo, hoursHi) {
        let t = discoveredAt + U.rint(r, hoursLo, hoursHi) * HOUR;
        if (t > NOW - 2 * MIN) t = discoveredAt + Math.max(20 * MIN, Math.floor((NOW - discoveredAt) * (0.4 + r() * 0.4)));
        return t;
      }
      if (status === 'terkonfirmasi') {
        const a = analyst();
        dObj.decision = { by: a.name, userId: a.id, role: 'analis', at: decideAt(1, 40), action: 'terkonfirmasi', note: 'Indikator judi online terpenuhi; bukti tertangkap lengkap.' };
        dObj.lifecycle = lifecycleFor();
      } else if (status === 'bukan') {
        const a = analyst();
        dObj.decision = { by: a.name, userId: a.id, role: 'analis', at: decideAt(1, 30), action: 'bukan', note: 'Tidak memenuhi kategori judi online.' };
      }
      domains.push(dObj);
      return dObj;
    }

    // Build clusters + members
    CLUSTERS_DEF.forEach(function (cd) {
      const memberIds = [];
      cd.members.forEach(function (dom, mi) {
        const isSeed = (dom === cd.seed);
        // shared-signal variety: seed shares all; most share ip+favicon+fingerprint; a subset on same favicon/fingerprint but different IP (sub-group)
        let shared;
        const roll = r();
        if (isSeed) shared = ['ip', 'asn', 'favicon', 'fingerprint'];
        else if (roll < 0.62) shared = ['ip', 'asn', 'favicon', 'fingerprint'];
        else if (roll < 0.85) shared = ['favicon', 'fingerprint'];
        else shared = ['favicon', 'redirect'];
        const d = makeDomain(dom, 'judi', cd.id, shared, isSeed);
        memberIds.push(d.id);
      });
      clusters.push({
        id: cd.id, name: cd.name, seed: cd.seed, signals: cd.signals,
        memberIds: memberIds, size: memberIds.length,
        note: 'Cluster mirror teridentifikasi dari kesamaan sinyal teknis (IP/ASN, favicon hash, HTML fingerprint, rantai redirect).'
      });
    });

    // Standalone domains
    STANDALONE.forEach(function (s) { makeDomain(s.domain, s.verdict, null, [], false); });

    // ---------------- Derived: trend series (30 hari) ----------------
    const trend = [];
    for (let d = 29; d >= 0; d--) {
      const day = NOW - d * DAY;
      const rr = U.rng(1000 + d);
      const base = 18 + Math.round(10 * Math.sin((29 - d) / 4)) + U.rint(rr, 0, 14);
      const temuan = Math.max(6, base);
      const konfirmasi = Math.max(2, Math.round(temuan * (0.34 + rr() * 0.14)));
      trend.push({ t: day, temuan: temuan, terkonfirmasi: konfirmasi });
    }
    // Make the chart's final point match the real "today" counts (coherence with the dashboard stat).
    const baruHariIni = domains.filter(d => d.discoveredAt >= NOW - DAY).length;
    const konfHariIni = domains.filter(d => d.decision && d.decision.at >= NOW - DAY).length;
    trend[29].temuan = Math.max(trend[29].temuan, baruHariIni);
    trend[29].terkonfirmasi = Math.max(4, konfHariIni);

    // ---------------- Ingestion import history ----------------
    const imports = [
      { id: 'IMP-0007', filename: 'aduan_masyarakat_juli_w3.csv', rows: 512, valid: 498, invalid: 14, at: NOW - 2 * DAY - 3 * HOUR, by: 'Bayu Prasetyo', status: 'selesai', source: 'ingest_komdigi', mapping: { domain: 'url', catatan: 'keterangan' } },
      { id: 'IMP-0006', filename: 'temuan_patroli_siber_batch12.xlsx', rows: 1240, valid: 1211, invalid: 29, at: NOW - 5 * DAY - 6 * HOUR, by: 'Bayu Prasetyo', status: 'selesai', source: 'ingest_komdigi', mapping: { domain: 'domain', catatan: 'sumber' } },
      { id: 'IMP-0005', filename: 'list_domain_pengaduan.csv', rows: 88, valid: 88, invalid: 0, at: NOW - 9 * DAY, by: 'Andini Kusuma', status: 'selesai', source: 'ingest_komdigi', mapping: { domain: 'alamat_situs' } }
    ];

    // ---------------- Audit log (seed) ----------------
    const audit = [];
    let aid = 1;
    function push(at, user, action, target, detail, kind) {
      audit.push({ id: 'LOG-' + String(aid++).padStart(5, '0'), at: at, actor: user.name, userId: user.id, role: user.role, action: action, target: target || '', detail: detail || '', kind: kind || 'aksi' });
    }
    // seed confirmations into audit
    domains.filter(d => d.decision).sort((a, b) => a.decision.at - b.decision.at).forEach(function (d) {
      const u = USERS.find(x => x.id === d.decision.userId) || USERS[2];
      push(d.decision.at, u, d.decision.action === 'terkonfirmasi' ? 'Konfirmasi temuan' : 'Tandai bukan judi',
        d.domain, 'Status → ' + (d.decision.action === 'terkonfirmasi' ? 'Terkonfirmasi' : 'Bukan') + ' · ' + d.id, 'keputusan');
    });
    // config + system events
    push(NOW - 12 * DAY, USERS[0], 'Ubah leksikon', 'leksikon', 'Menambah token: “rungkad”, “scatter”', 'konfigurasi');
    push(NOW - 8 * DAY, USERS[1], 'Ubah ambang keyakinan', 'pengaturan', 'Ambang auto-antrean review dinaikkan 55% → 60%', 'konfigurasi');
    push(NOW - 5 * DAY - 6 * HOUR, USERS[1], 'Impor data', 'IMP-0006', '1.240 baris · 1.211 valid', 'ingestion');
    push(NOW - 2 * DAY - 3 * HOUR, USERS[1], 'Impor data', 'IMP-0007', '512 baris · 498 valid', 'ingestion');
    push(NOW - 30 * HOUR, USERS[0], 'Perluas cluster', 'CLS-ZEUS-01', 'Menambah 4 mirror hasil investigasi manual', 'analisis');
    push(NOW - 20 * HOUR, USERS[2], 'Jalankan penemuan', 'Certificate Transparency', 'Putaran penemuan: 23 kandidat baru', 'sistem');
    audit.sort((a, b) => b.at - a.at);

    // ---------------- Source stats (derived) ----------------
    const bySource = {};
    SOURCES.forEach(s => bySource[s.id] = { total: 0, confirmed: 0, today: 0 });
    domains.forEach(function (d) {
      const b = bySource[d.source]; if (!b) return;
      b.total++;
      if (d.status === 'terkonfirmasi') b.confirmed++;
      if (d.discoveredAt >= NOW - DAY) b.today++;
    });

    return {
      version: 'v1',
      now: NOW,
      users: USERS, roleLabel: ROLE_LABEL,
      sources: SOURCES, sourceStats: bySource,
      lexicon: LEXICON, lexPermutations: LEX_PERMUTATIONS,
      domains: domains, clusters: clusters,
      trend: trend, imports: imports, audit: audit,
      settings: {
        theme: 'kode',
        activeUserId: 'u_an1',            // presenter starts as an analyst
        confReviewThreshold: 60,          // below → auto review priority
        confAutoQueue: 85,                // above → high-confidence recommendation
        recheckCadenceHours: 6,
        scopeCategory: 'judi_online',
        brandName: 'SapuBersih', vendor: 'KODE',
        lexiconLocked: false
      },
      labeledSamplesBase: domains.filter(d => d.decision).length
    };
  }

  window.Seed = { build: build, NOW: NOW };
})();
