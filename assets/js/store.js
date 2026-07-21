/* ==========================================================================
   store.js — State, localStorage persistence, mutations, role gating, pub/sub
   Exposes: window.Store
   ========================================================================== */
(function () {
  'use strict';
  const U = window.U;
  const KEY = 'sapubersih.state.v1';

  const PERMS = {
    decide:   ['analis', 'admin', 'super_admin'],
    discover: ['analis', 'admin', 'super_admin'],
    import:   ['analis', 'admin', 'super_admin'],
    seed:     ['analis', 'admin', 'super_admin'],
    settings: ['admin', 'super_admin'],
    lexicon:  ['admin', 'super_admin'],
    roles:    ['super_admin'],
    scope:    ['super_admin'],
    reset:    ['analis', 'admin', 'super_admin', 'pimpinan']
  };

  let state = null;
  const subs = [];
  let bootReal = Date.now();

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 'v1') { state = parsed; return; }
      } catch (e) { /* fallthrough to rebuild */ }
    }
    state = window.Seed.build();
    persist();
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage may be blocked; app still works in-memory */ }
  }
  function notify() { persist(); subs.forEach(fn => { try { fn(state); } catch (e) { console.error(e); } }); }
  function subscribe(fn) { subs.push(fn); return () => { const i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); }; }

  // Demo clock: starts at anchor NOW, advances in real time from boot.
  function clock() { return state.now + (Date.now() - bootReal); }

  // ---------- selectors ----------
  function get() { return state; }
  function currentUser() { return state.users.find(u => u.id === state.settings.activeUserId) || state.users[2]; }
  function can(action) { const role = currentUser().role; return (PERMS[action] || []).indexOf(role) >= 0; }
  function domain(id) { return state.domains.find(d => d.id === id); }
  function cluster(id) { return state.clusters.find(c => c.id === id); }
  function source(id) { return state.sources.find(s => s.id === id); }
  function clusterMembers(id) { const c = cluster(id); return c ? c.memberIds.map(domain).filter(Boolean) : []; }

  function counts() {
    const now = state.now;
    const DAY = 86400e3;
    const d = state.domains;
    return {
      total: d.length,
      baruHariIni: d.filter(x => x.discoveredAt >= now - DAY).length,
      antrean: d.filter(x => x.status === 'baru' || x.status === 'review' || x.status === 'investigasi').length,
      review: d.filter(x => x.status === 'review').length,
      baru: d.filter(x => x.status === 'baru').length,
      investigasi: d.filter(x => x.status === 'investigasi').length,
      terkonfirmasi: d.filter(x => x.status === 'terkonfirmasi').length,
      bukan: d.filter(x => x.status === 'bukan').length,
      clusterAktif: state.clusters.length,
      mirrorTotal: state.clusters.reduce((a, c) => a + c.size, 0),
      labeled: d.filter(x => x.decision).length,
      aktif: d.filter(x => x.lifecycle === 'aktif').length,
      diblokir: d.filter(x => x.lifecycle === 'diblokir').length,
      dilaporkan: d.filter(x => x.lifecycle === 'dilaporkan').length,
      tidakAktif: d.filter(x => x.lifecycle === 'tidak_aktif').length
    };
  }

  function sourceEffectiveness() {
    return state.sources.map(function (s) {
      const st = state.sourceStats[s.id] || { total: 0, confirmed: 0, today: 0 };
      const eff = st.total ? (st.confirmed / st.total) : 0;
      return { id: s.id, name: s.name, short: s.short, icon: s.icon, headline: s.headline, total: st.total, confirmed: st.confirmed, today: st.today, eff: eff };
    }).sort((a, b) => b.confirmed - a.confirmed);
  }

  function queue() {
    // items awaiting human decision, priority-ordered
    const order = { tinggi: 0, sedang: 1, rendah: 2 };
    return state.domains
      .filter(d => d.status === 'baru' || d.status === 'review' || d.status === 'investigasi')
      .sort((a, b) => {
        const pv = order[a.priority] - order[b.priority];
        if (pv !== 0) return pv;
        return b.ai.confidence - a.ai.confidence;
      });
  }

  function recentFindings(n) {
    return state.domains.slice().sort((a, b) => b.discoveredAt - a.discoveredAt).slice(0, n || 12);
  }

  // ---------- audit ----------
  function logAudit(action, target, detail, kind) {
    const u = currentUser();
    const id = 'LOG-' + String(state.audit.length + 1).padStart(5, '0');
    state.audit.unshift({ id: id, at: clock(), actor: u.name, userId: u.id, role: u.role, action: action, target: target || '', detail: detail || '', kind: kind || 'aksi' });
  }

  // ---------- mutations ----------
  function decide(domainId, action, note) {
    if (!can('decide')) return { ok: false, reason: 'read_only' };
    const d = domain(domainId); if (!d) return { ok: false };
    const u = currentUser();
    const map = { terkonfirmasi: 'terkonfirmasi', bukan: 'bukan', investigasi: 'investigasi' };
    const st = map[action]; if (!st) return { ok: false };
    d.status = st;
    d.decision = { by: u.name, userId: u.id, role: u.role, at: clock(), action: action, note: note || '' };
    if (st === 'terkonfirmasi' && !d.lifecycle) d.lifecycle = 'aktif';
    if (st !== 'terkonfirmasi') d.lifecycle = null;
    const label = st === 'terkonfirmasi' ? 'Terkonfirmasi' : (st === 'bukan' ? 'Bukan' : 'Perlu Investigasi');
    logAudit(
      st === 'terkonfirmasi' ? 'Konfirmasi temuan' : (st === 'bukan' ? 'Tandai bukan judi' : 'Tandai perlu investigasi'),
      d.domain, 'Status → ' + label + ' · ' + d.id + (note ? ' · “' + note + '”' : ''),
      'keputusan'
    );
    // update source stats
    const b = state.sourceStats[d.source]; if (b) { b.confirmed = state.domains.filter(x => x.source === d.source && x.status === 'terkonfirmasi').length; }
    notify();
    return { ok: true, domain: d };
  }

  const LEX_TOKENS = ['gacor', 'maxwin', 'zeus', 'olympus', 'slot', 'toto', 'togel', 'jp', 'hoki', 'cuan', 'sultan', 'gates', 'bonanza', 'scatter', 'rungkad', 'depo', 'wd'];
  const NUMS = ['88', '77', '99', '303', '4d', '77', '888', 'vip', 'max', 'ku'];
  const TLDS = ['.xyz', '.top', '.click', '.live', '.vip', '.icu', '.cc', '.win', '.fun', '.site'];
  let discoverRun = 0;

  function genCandidate(seq) {
    const a = LEX_TOKENS[(Math.random() * LEX_TOKENS.length) | 0];
    let b = LEX_TOKENS[(Math.random() * LEX_TOKENS.length) | 0];
    if (b === a) b = NUMS[(Math.random() * NUMS.length) | 0];
    const tail = Math.random() > 0.5 ? NUMS[(Math.random() * NUMS.length) | 0] : '';
    const sep = Math.random() > 0.6 ? '-' : '';
    const dom = (a + sep + b + tail + TLDS[(Math.random() * TLDS.length) | 0]).toLowerCase();
    const isUnsure = Math.random() < 0.18;
    const verdict = isUnsure ? 'tidak_yakin' : 'judi';
    const conf = isUnsure ? (44 + (Math.random() * 18 | 0)) : (82 + (Math.random() * 16 | 0));
    const id = 'TMN-2026-' + String(1000 + state.domains.length + seq).padStart(4, '0');
    const asnPool = [['AS138201', 'PT Awan Data Nusantara (fiktif)', 'ID'], ['AS45102', 'SEA-Cloud Holdings Ltd (fiktif)', 'SG'], ['AS131099', 'RapidHost Offshore Inc (fiktif)', 'KH']];
    const asn = asnPool[(Math.random() * asnPool.length) | 0];
    function hex(n) { let s = ''; for (let i = 0; i < n; i++) s += '0123456789abcdef'[(Math.random() * 16) | 0]; return s; }
    const now = clock();
    return {
      id: id, domain: dom, discoveredAt: now - (Math.random() * 8 | 0) * 60000, source: 'cert_transparency',
      status: verdict === 'judi' ? (conf >= state.settings.confReviewThreshold ? 'baru' : 'review') : 'review',
      priority: verdict === 'judi' ? (conf > 92 ? 'tinggi' : 'sedang') : 'sedang',
      category: 'judi_online', clusterId: null, sharedSignals: [],
      ai: {
        verdict: verdict, confidence: conf,
        reasons: verdict === 'judi'
          ? [{ k: 'hit', t: 'Sertifikat SSL baru cocok leksikon judi online', d: 'terbit ' + Math.max(1, (Math.random() * 6 | 0)) + ' jam lalu' },
             { k: 'hit', t: 'Token nama domain cocok pola permutasi', d: dom.replace(/\..*$/, '') },
             { k: 'soft', t: 'Halaman memuat klaim bonus/jackpot', d: 'perlu penangkapan bukti penuh' }]
          : [{ k: 'soft', t: 'Sebagian indikator terdeteksi, keyakinan rendah', d: 'perlu verifikasi manual' },
             { k: 'neg', t: 'Kanal transaksi belum terkonfirmasi', d: '' }],
        indicators: verdict === 'judi'
          ? { provider: true, game: true, bonus: true, rtp: Math.random() > .4, deposit: true, payment: Math.random() > .4, chat: Math.random() > .5 }
          : { provider: false, game: Math.random() > .5, bonus: Math.random() > .6, rtp: false, deposit: false, payment: false, chat: Math.random() > .5 }
      },
      evidence: {
        screenshot: 'evidence-0' + (1 + (state.domains.length + seq) % 6) + '.jpg',
        pageTitle: verdict === 'judi' ? 'Situs Slot Online (kandidat baru)' : 'Halaman belum terverifikasi',
        snippets: verdict === 'judi' ? ['Bonus New Member', 'RTP Live', 'Min Depo 10rb'] : ['Konten ambigu'],
        ip: (asn[2] === 'ID' ? '103.147.88.' : asn[2] === 'SG' ? '45.87.219.' : '156.240.104.') + (2 + (Math.random() * 250 | 0)),
        asn: asn[0], asnOrg: asn[1], country: asn[2], hosting: asn[1].replace(' (fiktif)', ''),
        certIssuer: "Let's Encrypt (R3)", certIssuedAt: now - (Math.random() * 6 | 0) * 3600e3,
        redirectChain: ['r1-cdn.hop' + hex(3) + '.top (301)'],
        contentHash: 'sha256:' + hex(40), htmlFingerprint: 'simhash:' + hex(16),
        faviconHash: 'mmh3:' + ((Math.random() * 4e9 | 0) - 2e9), captureAt: now, tlsSan: []
      },
      lifecycle: null, decision: null, isNew: true
    };
  }

  function runDiscovery(nCandidates, silent) {
    if (!can('discover')) return { ok: false, reason: 'read_only' };
    discoverRun++;
    const n = nCandidates || (18 + (Math.random() * 10 | 0));
    const added = [];
    for (let i = 0; i < n; i++) { const c = genCandidate(i); state.domains.push(c); added.push(c); }
    // update source stats for cert_transparency
    const b = state.sourceStats['cert_transparency'];
    if (b) { b.total += n; b.today += n; }
    logAudit('Jalankan penemuan', 'Certificate Transparency', 'Putaran penemuan #' + discoverRun + ': ' + n + ' kandidat baru masuk antrean', 'sistem');
    if (silent) { persist(); } else { notify(); }
    return { ok: true, added: added, n: n };
  }

  function addImport(meta) {
    if (!can('import')) return { ok: false, reason: 'read_only' };
    const id = 'IMP-' + String(8 + state.imports.length).padStart(4, '0');
    const rec = Object.assign({ id: id, at: clock(), by: currentUser().name, status: 'selesai', source: 'ingest_komdigi' }, meta);
    state.imports.unshift(rec);
    // optionally push a handful of candidate domains from the import into the queue
    const toAdd = Math.min(6, meta.valid || 0);
    for (let i = 0; i < toAdd; i++) { const c = genCandidate(1000 + i); c.source = 'ingest_komdigi'; state.domains.push(c); }
    const bs = state.sourceStats['ingest_komdigi']; if (bs) { bs.total += toAdd; bs.today += toAdd; }
    logAudit('Impor data', id, (meta.rows || 0) + ' baris · ' + (meta.valid || 0) + ' valid → ' + toAdd + ' masuk antrean', 'ingestion');
    notify();
    return { ok: true, rec: rec, queued: toAdd };
  }

  function expandCluster(clusterId, extra) {
    if (!can('seed')) return { ok: false, reason: 'read_only' };
    const c = cluster(clusterId); if (!c) return { ok: false };
    const n = extra || 3;
    const added = [];
    function hex(k) { let s = ''; for (let i = 0; i < k; i++) s += '0123456789abcdef'[(Math.random() * 16) | 0]; return s; }
    const base = c.seed.replace(/\..*$/, '');
    for (let i = 0; i < n; i++) {
      const dom = (base + '-m' + (c.size + i + 1) + TLDS[(Math.random() * TLDS.length) | 0]).toLowerCase();
      const id = 'TMN-2026-' + String(2000 + state.domains.length + i).padStart(4, '0');
      const d = {
        id: id, domain: dom, discoveredAt: clock() - (Math.random() * 30 | 0) * 60000, source: 'manual_seed',
        status: 'baru', priority: 'tinggi', category: 'judi_online', clusterId: clusterId, sharedSignals: ['favicon', 'fingerprint'],
        ai: { verdict: 'judi', confidence: 90 + (Math.random() * 8 | 0), reasons: [{ k: 'hit', t: 'Sinyal identik dengan cluster ' + c.name, d: 'favicon & HTML fingerprint sama' }], indicators: { provider: true, game: true, bonus: true, rtp: true, deposit: true, payment: true, chat: true } },
        evidence: { screenshot: 'evidence-0' + (1 + i % 6) + '.jpg', pageTitle: 'Mirror ' + c.name, snippets: ['Bonus New Member', 'RTP Live'], ip: c.signals.ip, asn: c.signals.asn, asnOrg: c.signals.asnOrg, country: c.signals.hostingCountry, hosting: c.signals.asnOrg.replace(' (fiktif)', ''), certIssuer: "Let's Encrypt (R3)", certIssuedAt: clock() - 3600e3, redirectChain: [c.seed + ' (302)'], contentHash: 'sha256:' + hex(40), htmlFingerprint: c.signals.htmlFingerprint, faviconHash: c.signals.faviconHash, captureAt: clock(), tlsSan: [] },
        lifecycle: null, decision: null, isNew: true
      };
      state.domains.push(d); c.memberIds.push(id); added.push(d);
    }
    c.size = c.memberIds.length;
    logAudit('Perluas cluster', clusterId, 'Menambah ' + n + ' mirror baru (' + c.name + ')', 'analisis');
    notify();
    return { ok: true, added: added };
  }

  function setLifecycle(domainId, life, note) {
    if (!can('decide')) return { ok: false, reason: 'read_only' };
    const d = domain(domainId); if (!d || d.status !== 'terkonfirmasi') return { ok: false };
    d.lifecycle = life;
    const L = { aktif: 'Masih Aktif', tidak_aktif: 'Tidak Aktif', dilaporkan: 'Dilaporkan', diblokir: 'Diblokir' };
    logAudit('Perbarui status siklus hidup', d.domain, 'Status dicatat → ' + (L[life] || life) + (note ? ' · “' + note + '”' : '') + ' (dicatat, tidak dieksekusi platform)', 'monitoring');
    notify();
    return { ok: true };
  }

  function setRole(userId) { state.settings.activeUserId = userId; const u = state.users.find(x => x.id === userId); logAudit('Ganti perspektif peran', u ? u.name : userId, 'Mode demo: beralih ke peran ' + (u ? state.roleLabel[u.role] : ''), 'sistem'); notify(); }
  function setTheme(theme) { state.settings.theme = theme; document.documentElement.setAttribute('data-theme', theme); logAudit('Ubah tampilan (white-label)', 'tema', 'Tema antarmuka → ' + (theme === 'kode' ? 'KODE Command (gelap)' : 'Komdigi Netral (terang)'), 'konfigurasi'); notify(); }

  function setSetting(key, val, auditMsg) {
    if (!can('settings')) return { ok: false, reason: 'read_only' };
    state.settings[key] = val;
    if (auditMsg) logAudit('Ubah pengaturan', key, auditMsg, 'konfigurasi');
    notify();
    return { ok: true };
  }
  function addLexicon(term, cat) {
    if (!can('lexicon')) return { ok: false, reason: 'read_only' };
    term = (term || '').trim().toLowerCase(); if (!term) return { ok: false };
    if (state.lexicon.some(x => x.term === term)) return { ok: false, reason: 'dup' };
    state.lexicon.push({ term: term, cat: cat || 'slang' });
    logAudit('Ubah leksikon', 'leksikon', 'Menambah token: “' + term + '”', 'konfigurasi');
    notify(); return { ok: true };
  }
  function removeLexicon(term) {
    if (!can('lexicon')) return { ok: false, reason: 'read_only' };
    state.lexicon = state.lexicon.filter(x => x.term !== term);
    logAudit('Ubah leksikon', 'leksikon', 'Menghapus token: “' + term + '”', 'konfigurasi');
    notify(); return { ok: true };
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    state = window.Seed.build();
    bootReal = Date.now();
    persist();
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    notify();
  }

  window.Store = {
    load, subscribe, notify, get, clock,
    currentUser, can, domain, cluster, source, clusterMembers,
    counts, sourceEffectiveness, queue, recentFindings,
    decide, runDiscovery, addImport, expandCluster, setLifecycle,
    setRole, setTheme, setSetting, addLexicon, removeLexicon, reset, logAudit
  };
})();
