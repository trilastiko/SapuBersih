/* views-classify.js — Klasifikasi AI (evidence panel + reasoning) */
(function () {
  'use strict';
  const U = window.U, Store = window.Store, C = window.C;
  const V = (window.Views = window.Views || {});

  let selectedId = null;
  let filter = 'semua';

  function list() {
    let ds = Store.get().domains.slice();
    if (filter === 'judi') ds = ds.filter(d => d.ai.verdict === 'judi');
    else if (filter === 'tidak_yakin') ds = ds.filter(d => d.ai.verdict === 'tidak_yakin');
    else if (filter === 'bukan') ds = ds.filter(d => d.ai.verdict === 'bukan');
    return ds.sort((a, b) => b.ai.confidence - a.ai.confidence);
  }

  V.klasifikasi = {
    render: function () {
      const ds = list();
      if (!selectedId || !Store.domain(selectedId)) selectedId = (ds[0] || {}).id || null;
      const sel = selectedId ? Store.domain(selectedId) : null;

      const items = ds.slice(0, 40).map(function (d) {
        const active = d.id === selectedId ? ' active' : '';
        return '<button class="cand-item' + active + '" data-id="' + d.id + '">' +
          '<div class="row-between"><span class="domain mono">' + U.esc(d.domain) + '</span>' + C.verdictBadge(d.ai.verdict) + '</div>' +
          '<div class="row-between mt-2"><span class="faint sm mono">' + U.esc(d.id) + '</span>' +
          '<span class="conf"><span class="num">' + d.ai.confidence + '</span><span class="pct">%</span></span></div>' +
          '<div class="mt-2">' + C.confMeter(d.ai.verdict, d.ai.confidence) + '</div>' +
        '</button>';
      }).join('');

      const detail = sel ? candDetail(sel) : C.empty('Pilih kandidat', 'Tidak ada kandidat pada filter ini.');

      return '' +
      '<div class="section-head"><div class="lhs"><div class="eyebrow">Rekomendasi, bukan keputusan</div>' +
        '<h2>Klasifikasi AI</h2>' +
        '<p class="desc">Untuk setiap kandidat, mesin menyusun panel bukti dan menjelaskan alasannya. Putusan “Tidak Yakin” adalah hasil yang sah dan justru menaikkan prioritas review.</p></div></div>' +

      '<div class="toolbar"><div class="seg" id="verdict-filter">' +
        ['semua', 'judi', 'tidak_yakin', 'bukan'].map(f => '<button class="' + (filter === f ? 'on' : '') + '" data-f="' + f + '">' + ({ semua: 'Semua', judi: 'Judi', tidak_yakin: 'Tidak Yakin', bukan: 'Bukan' }[f]) + '</button>').join('') +
        '</div><span class="faint sm">' + ds.length + ' kandidat</span>' +
        '<span class="grow"></span>' +
        '<span class="badge badge-plain">' + U.icon('cpu') + 'Sumber: data contoh (mode demo)</span>' +
      '</div>' +

      '<div class="grid" style="grid-template-columns:340px 1fr;align-items:start">' +
        '<div class="card cand-list"><div class="card-body" style="padding:10px">' + items + '</div></div>' +
        '<div id="cand-detail">' + detail + '</div>' +
      '</div>';
    },

    mount: function (root) {
      U.$$('[data-f]', root).forEach(b => b.addEventListener('click', function () { filter = b.dataset.f; selectedId = null; window.App.refreshView(); }));
      U.$$('.cand-item', root).forEach(b => b.addEventListener('click', function () { selectedId = b.dataset.id; window.App.refreshView(); }));
      const rc = U.$('#reclass', root);
      if (rc) rc.addEventListener('click', function () { simulateReclass(root); });
    }
  };

  function candDetail(d) {
    const extra = '<div class="card card-pad" style="padding:14px 16px">' +
      '<div class="row-between mb-2"><span class="eyebrow">Kapabilitas live (opsional)</span></div>' +
      '<p class="muted sm">Panel ini berjalan dari data contoh yang telah dimuat sehingga <b>tidak membutuhkan koneksi maupun API key</b>. Bila variabel <span class="mono">ANTHROPIC_API_KEY</span> tersedia, panel yang sama dapat memanggil model secara langsung untuk klasifikasi baru — namun demo tidak bergantung padanya.</p>' +
      '<button class="btn btn-secondary btn-sm mt-3" id="reclass">' + U.icon('refresh') + 'Klasifikasi Ulang (simulasi)</button>' +
    '</div>';

    return '<div class="card"><div class="card-head">' +
      '<h3 class="mono">' + U.esc(d.domain) + '</h3>' +
      '<div class="row gap-2">' + C.badge(d.status) + C.priorityBadge(d.priority) + C.sourceBadge(d.source) +
        '<a class="btn btn-ghost btn-sm" href="#/review">' + U.icon('review') + 'Ke Antrean Review</a>' +
      '</div></div>' +
      '<div class="card-body">' +
      (d.ai.verdict === 'tidak_yakin' ? '<div class="callout warn mb-4">' + U.icon('alert') + '<span><b>Tidak Yakin</b> — sebagian indikator lemah/ambigu. Kandidat ini otomatis dinaikkan prioritasnya untuk verifikasi manual analis.</span></div>' : '') +
      C.evidencePanel(d, { extra: extra }) +
      '</div></div>';
  }

  function simulateReclass(root) {
    const btn = U.$('#reclass', root);
    if (!btn) return;
    btn.disabled = true; btn.innerHTML = U.icon('refresh') + 'Menganalisis…';
    setTimeout(function () {
      C.toast('Klasifikasi ulang selesai', 'Hasil konsisten dengan penilaian sebelumnya (mode demo).', 'ok');
      btn.disabled = false; btn.innerHTML = U.icon('refresh') + 'Klasifikasi Ulang (simulasi)';
    }, 1100);
  }
})();
