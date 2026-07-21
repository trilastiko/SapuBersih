/* views-audit.js — Audit Log (filterable trail) */
(function () {
  'use strict';
  const U = window.U, Store = window.Store, C = window.C;
  const V = (window.Views = window.Views || {});

  let kind = 'semua', q = '';
  const KINDS = [['semua', 'Semua'], ['keputusan', 'Keputusan'], ['konfigurasi', 'Konfigurasi'], ['ingestion', 'Ingestion'], ['analisis', 'Analisis'], ['monitoring', 'Monitoring'], ['sistem', 'Sistem']];
  const KIND_BADGE = { keputusan: 'badge-judi', konfigurasi: 'badge-invest', ingestion: 'badge-new', analisis: 'badge-review', monitoring: 'badge-bukan', sistem: 'badge-plain', aksi: 'badge-plain' };

  V.audit = {
    render: function () {
      const st = Store.get();
      let rows = st.audit.slice();
      if (kind !== 'semua') rows = rows.filter(r => r.kind === kind);
      if (q) { const ql = q.toLowerCase(); rows = rows.filter(r => (r.actor + r.action + r.target + r.detail).toLowerCase().indexOf(ql) >= 0); }

      return '' +
      '<div class="section-head"><div class="lhs"><div class="eyebrow">Dapat dipertanggungjawabkan secara hukum</div>' +
        '<h2>Audit Log</h2>' +
        '<p class="desc">Jejak lengkap setiap aksi — siapa, kapan, terhadap apa, bukti dan keputusan apa. Dirancang agar setiap temuan dapat dipertahankan secara hukum di hadapan regulator.</p></div>' +
        '<div class="rhs"><span class="badge badge-plain">' + U.icon('lock') + U.fmtNum(st.audit.length) + ' entri · tak dapat diubah</span></div>' +
      '</div>' +

      '<div class="toolbar"><div class="seg" id="akind">' +
        KINDS.map(k => '<button class="' + (kind === k[0] ? 'on' : '') + '" data-k="' + k[0] + '">' + k[1] + '</button>').join('') +
        '</div><span class="grow"></span>' +
        '<div class="search"><span class="ico">' + U.icon('search') + '</span><input class="input" id="asearch" placeholder="Cari aktor / aksi / domain" value="' + U.esc(q) + '" /></div>' +
      '</div>' +

      '<div class="card"><div class="card-body" style="padding:6px 18px">' +
        (rows.length ? rows.slice(0, 200).map(function (r) {
          return '<div class="audit-row">' +
            '<span class="audit-time">' + U.fmtDate(r.at) + '<br>' + U.fmtTimeS(r.at) + '</span>' +
            '<span class="audit-actor"><span class="av" style="background:' + U.avatarColor(r.actor) + '">' + U.esc(U.initials(r.actor).toUpperCase()) + '</span>' +
              '<span><span class="b sm">' + U.esc(r.actor) + '</span><br><span class="faint" style="font-size:11px">' + U.esc(st.roleLabel[r.role] || r.role) + '</span></span></span>' +
            '<span class="audit-detail"><span class="a sm">' + U.esc(r.action) + '</span> ' +
              (r.target ? '<span class="mono sm" style="color:var(--accent)">' + U.esc(r.target) + '</span>' : '') +
              '<br><span class="m sm">' + U.esc(r.detail) + '</span></span>' +
            '<span class="badge ' + (KIND_BADGE[r.kind] || 'badge-plain') + '">' + U.esc(r.kind) + '</span>' +
          '</div>';
        }).join('') : C.empty('Tidak ada entri', 'Tidak ada catatan audit pada filter ini.')) +
        (rows.length > 200 ? '<div class="help center" style="padding:12px">Menampilkan 200 dari ' + rows.length + ' entri.</div>' : '') +
      '</div></div>';
    },

    mount: function (root) {
      U.$$('[data-k]', root).forEach(b => b.addEventListener('click', function () { kind = b.dataset.k; window.App.refreshView(); }));
      const s = U.$('#asearch', root);
      if (s) s.addEventListener('input', U.debounce(function () { q = s.value.trim(); window.App.refreshView(); setTimeout(function () { const el = U.$('#asearch'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 0); }, 260));
    }
  };
})();
