/* ==========================================================================
   components.js — shared UI building blocks. Exposes: window.C
   ========================================================================== */
(function () {
  'use strict';
  const U = window.U;

  // ---------- status / verdict / labels ----------
  const STATUS = {
    baru:          { label: 'Baru', cls: 'badge-new', dot: true },
    review:        { label: 'Antrean Review', cls: 'badge-review', dot: true },
    investigasi:   { label: 'Perlu Investigasi', cls: 'badge-invest', dot: true },
    terkonfirmasi: { label: 'Terkonfirmasi', cls: 'badge-judi', dot: true },
    bukan:         { label: 'Bukan', cls: 'badge-bukan', dot: true }
  };
  const VERDICT = {
    judi:        { label: 'Judi Online', cls: 'j', short: 'Judi' },
    tidak_yakin: { label: 'Tidak Yakin', cls: 'u', short: 'Tidak Yakin' },
    bukan:       { label: 'Bukan Judi', cls: 'b', short: 'Bukan' }
  };
  const LIFECYCLE = {
    aktif:       { label: 'Masih Aktif', cls: 'badge-judi' },
    tidak_aktif: { label: 'Tidak Aktif', cls: 'badge-neutral' },
    dilaporkan:  { label: 'Dilaporkan', cls: 'badge-new' },
    diblokir:    { label: 'Diblokir', cls: 'badge-bukan' }
  };
  const PRIORITY = { tinggi: { label: 'Tinggi', cls: 'badge-judi' }, sedang: { label: 'Sedang', cls: 'badge-review' }, rendah: { label: 'Rendah', cls: 'badge-neutral' } };
  const INDICATOR_LABEL = {
    provider: 'Nama provider/permainan', game: 'Jenis permainan judi', bonus: 'Klaim bonus',
    rtp: 'Klaim RTP / jackpot', deposit: 'Bahasa deposit–withdraw', payment: 'Kanal pembayaran', chat: 'Live-chat / agen'
  };

  function badge(status) { const s = STATUS[status]; if (!s) return ''; return '<span class="badge ' + s.cls + '">' + (s.dot ? '<span class="bdot"></span>' : '') + U.esc(s.label) + '</span>'; }
  function verdictBadge(v) { const s = VERDICT[v]; if (!s) return ''; return '<span class="badge badge-' + (v === 'judi' ? 'judi' : v === 'bukan' ? 'bukan' : 'review') + '"><span class="bdot"></span>' + U.esc(s.label) + '</span>'; }
  function lifecycleBadge(l) { const s = LIFECYCLE[l]; if (!s) return ''; return '<span class="badge ' + s.cls + '"><span class="bdot"></span>' + U.esc(s.label) + '</span>'; }
  function priorityBadge(p) { const s = PRIORITY[p]; if (!s) return ''; return '<span class="badge ' + s.cls + '">' + U.esc(s.label) + '</span>'; }
  function sourceBadge(id) { const s = window.Store.source(id); if (!s) return ''; return '<span class="badge badge-plain">' + U.icon(s.icon) + U.esc(s.short) + '</span>'; }

  function avatar(name, size) {
    const sz = size || 24;
    return '<span class="av" style="width:' + sz + 'px;height:' + sz + 'px;background:' + U.avatarColor(name) + '">' + U.esc(U.initials(name).toUpperCase()) + '</span>';
  }

  // ---------- image with CSS fallback ----------
  const FB = {
    capture: { icon: 'camera', label: 'Tangkapan bukti (sintetis)' },
    hero: { icon: 'jaringan', label: '' },
    empty: { icon: 'search', label: '' }
  };
  function img(src, alt, cls, kind) {
    kind = kind || 'capture';
    return '<img src="' + U.esc(src) + '" alt="' + U.esc(alt || '') + '" class="' + (cls || '') + '" data-kind="' + kind + '" ' +
      'onerror="C.imgError(this)" loading="lazy" />';
  }
  function imgError(el) {
    const kind = el.getAttribute('data-kind') || 'capture';
    const meta = FB[kind] || FB.capture;
    const div = document.createElement('div');
    div.className = 'img-fallback ' + (el.className || '') + ' fb-' + kind;
    div.innerHTML = U.icon(meta.icon) + (meta.label ? '<span>' + U.esc(meta.label) + '</span>' : '');
    if (el.parentNode) el.parentNode.replaceChild(div, el);
  }

  // ---------- confidence ----------
  function confMeter(verdict, conf) {
    const k = verdict === 'judi' ? 'j' : verdict === 'bukan' ? 'b' : 'u';
    return '<div class="meter ' + k + '"><span style="width:' + conf + '%"></span></div>';
  }

  // ---------- evidence sub-blocks ----------
  function reasonsList(reasons) {
    return '<div class="reasons">' + reasons.map(function (r) {
      const cls = r.k === 'hit' ? 'hit' : r.k === 'neg' ? 'neg' : 'soft';
      const ic = r.k === 'hit' ? 'check' : r.k === 'neg' ? 'x' : 'info';
      return '<div class="reason"><span class="rico ' + cls + '">' + U.icon(ic) + '</span>' +
        '<span class="rtext">' + U.esc(r.t) + (r.d ? ' <em>— ' + U.esc(r.d) + '</em>' : '') + '</span></div>';
    }).join('') + '</div>';
  }
  function indicatorChips(ind) {
    return '<div class="indicators">' + Object.keys(INDICATOR_LABEL).map(function (k) {
      const on = !!ind[k];
      return '<span class="indicator ' + (on ? 'on' : 'off') + '"><span class="idot"></span>' + U.esc(INDICATOR_LABEL[k]) + '</span>';
    }).join('') + '</div>';
  }
  function metaRow(label, value, ic, mono) {
    return '<div class="meta-row"><span class="mk">' + (ic ? U.icon(ic) : '') + U.esc(label) + '</span>' +
      '<span class="mv"' + (mono === false ? ' style="font-family:var(--font-sans)"' : '') + '>' + value + '</span></div>';
  }
  function metaList(ev) {
    return '<div class="meta-list">' +
      metaRow('Alamat IP', U.esc(ev.ip), 'server') +
      metaRow('ASN / Jaringan', U.esc(ev.asn) + ' · ' + U.esc(ev.asnOrg), 'globe') +
      metaRow('Negara hosting', U.esc(ev.country), 'pin') +
      metaRow('Penerbit sertifikat', U.esc(ev.certIssuer), 'cert') +
      metaRow('Terbit sertifikat', U.fmtStamp(ev.certIssuedAt), 'clock') +
      metaRow('Rantai redirect', ev.redirectChain.map(U.esc).join(' → ') || '—', 'link') +
      metaRow('Hash konten', '<span class="hash">' + U.esc(ev.contentHash) + '</span>', 'hash') +
      metaRow('HTML fingerprint', '<span class="hash">' + U.esc(ev.htmlFingerprint) + '</span>', 'fingerprint') +
      metaRow('Favicon hash', '<span class="hash">' + U.esc(ev.faviconHash) + '</span>', 'star') +
      metaRow('Waktu tangkap', U.fmtStamp(ev.captureAt), 'camera') +
      '</div>';
  }

  // Full evidence + verdict panel (reused across screens)
  function evidencePanel(d, opts) {
    opts = opts || {};
    const v = d.ai.verdict; const vc = VERDICT[v].cls;
    const cap = 'assets/img/' + d.evidence.screenshot;
    return '<div class="evidence-grid">' +
      // left: capture + snippets
      '<div class="stack-4">' +
        '<div class="capture">' + img(cap, 'Tangkapan bukti ' + d.domain, '', 'capture') +
          '<span class="cap-tag">Spesimen · Sintetis</span>' +
          '<div class="cap-bar"><span>' + U.esc(d.domain) + '</span><span>' + U.fmtStamp(d.evidence.captureAt) + '</span></div>' +
        '</div>' +
        '<div><div class="eyebrow mb-2">Judul & cuplikan terekstraksi</div>' +
          '<div class="card card-pad" style="padding:14px 16px">' +
            '<div class="b mb-2 mono" style="font-size:13px">' + U.esc(d.evidence.pageTitle) + '</div>' +
            '<div class="snips">' + d.evidence.snippets.map(s => '<span class="snip">“' + U.esc(s) + '”</span>').join('') + '</div>' +
          '</div>' +
        '</div>' +
        '<div><div class="eyebrow mb-2">Metadata teknis · rantai penyimpanan bukti (chain of custody)</div>' + metaList(d.evidence) + '</div>' +
      '</div>' +
      // right: verdict + reasons + indicators
      '<div class="stack-4">' +
        '<div class="verdict ' + vc + '">' +
          '<div class="vhead"><div class="vlabel">' + U.icon('cpu') +
            '<div><div class="eyebrow">Rekomendasi AI</div><div class="vt ' + vc + '">' + U.esc(VERDICT[v].label) + '</div></div></div>' +
            '<div class="vconf"><div class="eyebrow">Keyakinan</div><div class="big serif">' + d.ai.confidence + '%</div></div>' +
          '</div>' +
          '<div class="mt-3">' + confMeter(v, d.ai.confidence) + '</div>' +
          '<div class="rec-note">' + U.icon('info') + '<span>Rekomendasi mesin — <b>bukan keputusan final</b>. Wajib dikonfirmasi analis sebelum berstatus “Terkonfirmasi”.</span></div>' +
        '</div>' +
        '<div><div class="eyebrow mb-2">Alasan & indikator terdeteksi</div>' + reasonsList(d.ai.reasons) + '</div>' +
        '<div><div class="eyebrow mb-2">Indikator judi online</div>' + indicatorChips(d.ai.indicators) + '</div>' +
        (opts.extra || '') +
      '</div>' +
    '</div>';
  }

  // ---------- drawer ----------
  let drawerCleanup = null;
  function openDrawer(o) {
    closeDrawer();
    const root = document.getElementById('drawer-root');
    const scrim = document.createElement('div'); scrim.className = 'scrim';
    const dr = document.createElement('div'); dr.className = 'drawer'; dr.setAttribute('role', 'dialog'); dr.setAttribute('aria-modal', 'true');
    dr.innerHTML =
      '<div class="drawer-head"><div><div class="dh-eyebrow">' + U.esc(o.eyebrow || '') + '</div><h2>' + U.esc(o.title || '') + '</h2>' + (o.subtitle ? '<div class="muted sm mt-2">' + o.subtitle + '</div>' : '') + '</div>' +
      '<button class="iconbtn" data-close aria-label="Tutup">' + U.icon('x') + '</button></div>' +
      '<div class="drawer-body">' + (o.body || '') + '</div>' +
      (o.footer ? '<div class="drawer-foot">' + o.footer + '</div>' : '');
    root.appendChild(scrim); root.appendChild(dr);
    function esc(e) { if (e.key === 'Escape') closeDrawer(); }
    scrim.addEventListener('click', closeDrawer);
    dr.querySelector('[data-close]').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', esc);
    drawerCleanup = function () { document.removeEventListener('keydown', esc); root.innerHTML = ''; drawerCleanup = null; };
    if (o.onMount) setTimeout(() => o.onMount(dr), 0);
    return dr;
  }
  function closeDrawer() { if (drawerCleanup) drawerCleanup(); }

  // ---------- modal / confirm ----------
  let modalCleanup = null;
  function openModal(o) {
    closeModal();
    const root = document.getElementById('modal-root');
    const scrim = document.createElement('div'); scrim.className = 'scrim';
    const m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog');
    m.innerHTML =
      '<div class="modal-head"><h3>' + U.esc(o.title || '') + '</h3>' + (o.message ? '<p>' + o.message + '</p>' : '') + '</div>' +
      (o.body ? '<div class="modal-body">' + o.body + '</div>' : '') +
      '<div class="modal-foot">' + (o.footer || '') + '</div>';
    root.appendChild(scrim); root.appendChild(m);
    function esc(e) { if (e.key === 'Escape') closeModal(); }
    scrim.addEventListener('click', closeModal);
    document.addEventListener('keydown', esc);
    modalCleanup = function () { document.removeEventListener('keydown', esc); root.innerHTML = ''; modalCleanup = null; };
    if (o.onMount) setTimeout(() => o.onMount(m), 0);
    return m;
  }
  function closeModal() { if (modalCleanup) modalCleanup(); }

  function confirm(o) {
    const kind = o.kind || 'primary';
    openModal({
      title: o.title, message: o.message, body: o.body,
      footer: '<button class="btn btn-secondary" data-cancel>' + U.esc(o.cancelLabel || 'Batal') + '</button>' +
        '<button class="btn btn-' + kind + '" data-ok>' + U.esc(o.confirmLabel || 'Lanjutkan') + '</button>',
      onMount: function (m) {
        m.querySelector('[data-cancel]').addEventListener('click', function () { closeModal(); if (o.onCancel) o.onCancel(); });
        m.querySelector('[data-ok]').addEventListener('click', function () { closeModal(); if (o.onConfirm) o.onConfirm(); });
      }
    });
  }

  // ---------- toast ----------
  function toast(title, sub, kind, ms) {
    const root = document.getElementById('toast-root');
    const t = document.createElement('div'); t.className = 'toast ' + (kind || '');
    const ic = kind === 'ok' ? 'check' : kind === 'warn' ? 'alert' : kind === 'danger' ? 'alert' : 'info';
    t.innerHTML = '<span class="ti">' + U.icon(ic) + '</span><div class="tbody"><div class="tt">' + U.esc(title) + '</div>' + (sub ? '<div class="ts">' + U.esc(sub) + '</div>' : '') + '</div>';
    root.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .3s, transform .3s'; t.style.opacity = '0'; t.style.transform = 'translateY(6px)'; setTimeout(() => t.remove(), 300); }, ms || 3200);
  }

  // ---------- empty state ----------
  function empty(title, sub) {
    return '<div class="empty">' + img('assets/img/empty-state.png', '', '', 'empty') +
      '<div class="et">' + U.esc(title) + '</div>' + (sub ? '<div class="es">' + U.esc(sub) + '</div>' : '') + '</div>';
  }

  // ---------- role gate for action buttons ----------
  function gate(action, html, reason) {
    if (window.Store.can(action)) return html;
    // disabled variant with tooltip
    return '<span class="gate-wrap" title="' + U.esc(reason || 'Peran Anda hanya-baca untuk aksi ini') + '">' +
      html.replace('<button', '<button aria-disabled="true" disabled data-gated="1"') + '</span>';
  }

  // ---------- printable dossier ----------
  function dossier(d) {
    const st = window.Store.get();
    const dec = d.decision;
    const cluster = d.clusterId ? window.Store.cluster(d.clusterId) : null;
    return '<article class="dossier" id="dossier-' + d.id + '">' +
      '<header class="dsr-head">' +
        '<div class="dsr-org"><div class="dsr-mark">' + U.icon('shield') + '</div><div>' +
          '<div class="dsr-title">DOSIR BUKTI — TEMUAN JUDI ONLINE</div>' +
          '<div class="dsr-sub">SapuBersih · Platform Penemuan &amp; Bukti · disiapkan oleh KODE untuk Komdigi</div>' +
        '</div></div>' +
        '<div class="dsr-caseid"><div class="eyebrow">No. Dosir</div><div class="mono b">' + U.esc(d.id) + '</div>' +
          '<div class="badge badge-review" style="margin-top:6px">SPESIMEN · DATA SINTETIS</div></div>' +
      '</header>' +
      '<div class="dsr-banner">' + U.icon('warnTri') + ' Dokumen demonstrasi berisi <b>data sintetis fiktif</b>. Bukan temuan nyata; tidak untuk diedarkan sebagai bukti resmi.</div>' +

      '<section class="dsr-sec"><h4>1 · Identitas Temuan</h4>' +
        '<div class="dsr-kv">' +
          kv('Domain', '<span class="mono b">' + U.esc(d.domain) + '</span>') +
          kv('Kategori', 'Judi Online (kategori terdefinisi hukum)') +
          kv('Status', badge(d.status)) +
          kv('Prioritas', priorityBadge(d.priority)) +
          kv('Sumber penemuan', (window.Store.source(d.source) || {}).name || d.source) +
          kv('Waktu ditemukan', U.fmtStamp(d.discoveredAt)) +
          (cluster ? kv('Cluster mirror', U.esc(cluster.name) + ' (' + cluster.size + ' domain)') : '') +
        '</div>' +
      '</section>' +

      '<section class="dsr-sec"><h4>2 · Tangkapan Bukti (Chain of Custody)</h4>' +
        '<div class="dsr-cap">' + img('assets/img/' + d.evidence.screenshot, 'bukti', '', 'capture') +
          '<div class="dsr-cap-meta mono">Ditangkap: ' + U.fmtStamp(d.evidence.captureAt) + ' · Hash: ' + U.esc(d.evidence.contentHash) + '</div></div>' +
        '<div class="mono sm mt-3"><b>Judul halaman:</b> ' + U.esc(d.evidence.pageTitle) + '</div>' +
        '<div class="sm mt-2"><b>Cuplikan terekstraksi:</b> ' + d.evidence.snippets.map(s => '“' + U.esc(s) + '”').join(' · ') + '</div>' +
      '</section>' +

      '<section class="dsr-sec"><h4>3 · Metadata Teknis</h4>' + metaList(d.evidence) + '</section>' +

      '<section class="dsr-sec"><h4>4 · Penilaian AI (Rekomendasi)</h4>' +
        '<div class="dsr-kv">' + kv('Putusan mesin', VERDICT[d.ai.verdict].label) + kv('Keyakinan', d.ai.confidence + '%') + '</div>' +
        '<div class="mt-3">' + reasonsList(d.ai.reasons) + '</div>' +
        '<div class="mt-3">' + indicatorChips(d.ai.indicators) + '</div>' +
        '<div class="dsr-note">' + U.icon('info') + ' Penilaian AI bersifat rekomendasi. Keputusan final ada pada analis manusia (lihat bagian 5).</div>' +
      '</section>' +

      '<section class="dsr-sec"><h4>5 · Rekam Konfirmasi Manusia</h4>' +
        (dec ?
          '<div class="dsr-kv">' +
            kv('Keputusan', badge(d.status)) +
            kv('Oleh analis', U.esc(dec.by) + ' · ' + (st.roleLabel[dec.role] || dec.role)) +
            kv('Waktu keputusan', U.fmtStamp(dec.at)) +
            (dec.note ? kv('Catatan', U.esc(dec.note)) : '') +
          '</div>' +
          '<div class="dsr-sign"><div class="dsr-sign-box"><div class="eyebrow">Diverifikasi oleh</div><div class="b mt-2">' + U.esc(dec.by) + '</div><div class="sm muted">' + (st.roleLabel[dec.role] || dec.role) + ' · SapuBersih</div></div>' +
          '<div class="dsr-sign-box"><div class="eyebrow">Cap waktu sistem</div><div class="mono mt-2">' + U.fmtStamp(dec.at) + '</div></div></div>'
          : '<div class="dsr-note">' + U.icon('clock') + ' Belum ada konfirmasi manusia. Temuan masih dalam antrean review — status belum final.</div>') +
      '</section>' +

      '<footer class="dsr-foot"><span>SapuBersih — dihasilkan ' + U.fmtStamp(window.Store.clock()) + '</span><span>KODE · PT Kreasi Otomasi Digital Ekosistem</span></footer>' +
    '</article>';
  }
  function kv(k, v) { return '<div class="dkv"><dt>' + U.esc(k) + '</dt><dd>' + v + '</dd></div>'; }

  window.C = {
    STATUS, VERDICT, LIFECYCLE, PRIORITY, INDICATOR_LABEL,
    badge, verdictBadge, lifecycleBadge, priorityBadge, sourceBadge, avatar,
    img, imgError, confMeter, reasonsList, indicatorChips, metaList, evidencePanel,
    openDrawer, closeDrawer, openModal, closeModal, confirm, toast, empty, gate, dossier, kv
  };
})();
