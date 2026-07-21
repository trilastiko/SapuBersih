/* views-review.js — Antrean Review Analis (human-in-the-loop, live decisions) */
(function () {
  'use strict';
  const U = window.U, Store = window.Store, C = window.C;
  const V = (window.Views = window.Views || {});

  let qfilter = 'semua';

  function filtered() {
    let q = Store.queue();
    if (qfilter === 'tinggi') q = q.filter(d => d.priority === 'tinggi');
    else if (qfilter === 'tidak_yakin') q = q.filter(d => d.ai.verdict === 'tidak_yakin');
    else if (qfilter === 'ct') q = q.filter(d => d.source === 'cert_transparency');
    return q;
  }

  V.review = {
    render: function () {
      const c = Store.counts();
      const q = filtered();
      const canDecide = Store.can('decide');
      const u = Store.currentUser();

      const rows = q.slice(0, 60).map(function (d) {
        return '<tr class="clickable" data-id="' + U.esc(d.id) + '">' +
          '<td>' + C.priorityBadge(d.priority) + '</td>' +
          '<td class="domain">' + U.esc(d.domain) + (d.isNew ? ' <span class="new-dot" title="baru"></span>' : '') + '</td>' +
          '<td>' + C.verdictBadge(d.ai.verdict) + '</td>' +
          '<td style="min-width:120px"><div class="row gap-2"><span class="mono sm">' + d.ai.confidence + '%</span>' + C.confMeter(d.ai.verdict, d.ai.confidence) + '</div></td>' +
          '<td>' + C.sourceBadge(d.source) + '</td>' +
          '<td class="sm faint">' + U.timeAgo(d.discoveredAt, Store.clock()) + '</td>' +
          '<td class="row-actions"><button class="btn btn-secondary btn-sm" data-open="' + U.esc(d.id) + '">' + U.icon('eye') + 'Tinjau</button></td>' +
        '</tr>';
      }).join('');

      return '' +
      '<div class="section-head"><div class="lhs"><div class="eyebrow">Human-in-the-loop</div>' +
        '<h2>Antrean Review Analis</h2>' +
        '<p class="desc">Analis membuka kandidat, membaca bukti &amp; alasan AI, lalu memutuskan. Tidak ada status “Terkonfirmasi” tanpa keputusan manusia. Perubahan langsung tercermin di dashboard, cluster, dan audit.</p></div>' +
        '<div class="rhs"><div class="sample-counter"><div class="eyebrow">Sampel berlabel terkumpul</div>' +
          '<div class="serif sc-num" id="sample-num">' + U.fmtNum(c.labeled) + '</div></div></div>' +
      '</div>' +

      (!canDecide ? '<div class="callout warn mb-4">' + U.icon('lock') + '<span><b>Mode hanya-baca (' + U.esc(Store.get().roleLabel[u.role]) + ').</b> Anda dapat meninjau bukti, tetapi keputusan hanya dapat dibuat oleh Analis/Admin. Beralih peran di kanan atas untuk mendemokan keputusan langsung.</span></div>' : '') +

      '<div class="callout mb-4">' + U.icon('cpu') + '<span>Setiap keputusan menjadi <b>satu sampel berlabel</b>. Kumpulan data inilah yang akan melatih model yang disetel khusus (<i>fine-tuned</i>) di masa depan — platform makin akurat seiring pemakaian.</span></div>' +

      '<div class="grid grid-4 mb-4">' +
        miniStat('review', 'Total antrean', c.antrean, 'var(--st-review)') +
        miniStat('alert', 'Prioritas tinggi', Store.queue().filter(d => d.priority === 'tinggi').length, 'var(--st-judi)') +
        miniStat('info', 'Tidak yakin', Store.queue().filter(d => d.ai.verdict === 'tidak_yakin').length, 'var(--st-invest)') +
        miniStat('shield', 'Terkonfirmasi total', c.terkonfirmasi, 'var(--st-bukan)') +
      '</div>' +

      '<div class="toolbar"><div class="seg" id="qfilter">' +
        [['semua', 'Semua'], ['tinggi', 'Prioritas tinggi'], ['tidak_yakin', 'Tidak yakin'], ['ct', 'Dari CT log']].map(f => '<button class="' + (qfilter === f[0] ? 'on' : '') + '" data-q="' + f[0] + '">' + f[1] + '</button>').join('') +
        '</div><span class="faint sm">' + q.length + ' menunggu keputusan</span></div>' +

      (q.length ? '<div class="card"><div class="table-wrap"><table class="tbl"><thead><tr>' +
        '<th>Prioritas</th><th>Domain</th><th>Rekomendasi</th><th>Keyakinan</th><th>Sumber</th><th>Ditemukan</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></div>'
        : '<div class="card"><div class="card-body">' + C.empty('Antrean bersih', 'Semua kandidat telah diputuskan. Jalankan penemuan untuk menemukan kandidat baru.') + '</div></div>');
    },

    mount: function (root) {
      U.$$('[data-q]', root).forEach(b => b.addEventListener('click', function () { qfilter = b.dataset.q; window.App.refreshView(); }));
      U.$$('[data-open]', root).forEach(b => b.addEventListener('click', function (e) { e.stopPropagation(); openReview(b.getAttribute('data-open')); }));
      U.$$('tr.clickable', root).forEach(tr => tr.addEventListener('click', function () { openReview(tr.dataset.id); }));
    }
  };

  function miniStat(icon, label, value, color) {
    return '<div class="mini-stat"><span class="ms-ico" style="color:' + color + '">' + U.icon(icon) + '</span>' +
      '<div><div class="serif" style="font-size:24px;line-height:1">' + U.fmtNum(value) + '</div><div class="faint sm">' + U.esc(label) + '</div></div></div>';
  }

  function openReview(id) {
    const d = Store.domain(id); if (!d) return;
    const canDecide = Store.can('decide');
    const footer = canDecide
      ? '<button class="btn btn-danger" data-decide="terkonfirmasi">' + U.icon('shield') + 'Terkonfirmasi Judi</button>' +
        '<button class="btn btn-warn" data-decide="investigasi">' + U.icon('alert') + 'Perlu Investigasi</button>' +
        '<button class="btn btn-ok" data-decide="bukan">' + U.icon('check') + 'Bukan Judi</button>' +
        '<span class="grow"></span><span class="faint sm">Keputusan tercatat di Audit Log</span>'
      : '<span class="faint sm">' + U.icon('lock') + ' Peran hanya-baca — beralih ke Analis untuk memutuskan.</span>';

    C.openDrawer({
      eyebrow: 'Tinjau kandidat · ' + d.id,
      title: d.domain,
      subtitle: C.badge(d.status) + ' ' + C.priorityBadge(d.priority) + ' ' + C.sourceBadge(d.source) + ' <span class="faint sm">ditemukan ' + U.timeAgo(d.discoveredAt, Store.clock()) + '</span>',
      body: C.evidencePanel(d),
      footer: footer,
      onMount: function (dr) {
        U.$$('[data-decide]', dr).forEach(function (btn) {
          btn.addEventListener('click', function () {
            const action = btn.getAttribute('data-decide');
            confirmDecision(d, action);
          });
        });
      }
    });
  }

  function confirmDecision(d, action) {
    const labels = { terkonfirmasi: 'Terkonfirmasi Judi Online', bukan: 'Bukan Judi', investigasi: 'Perlu Investigasi' };
    const kinds = { terkonfirmasi: 'danger', bukan: 'ok', investigasi: 'warn' };
    C.confirm({
      title: 'Konfirmasi keputusan',
      message: 'Tetapkan <b>' + U.esc(d.domain) + '</b> sebagai <b>' + labels[action] + '</b>? Keputusan ini menjadi rekam konfirmasi manusia pada dosir bukti dan tercatat di Audit Log.',
      body: '<label class="field" style="margin-top:6px"><span class="field-label">Catatan analis (opsional)</span>' +
        '<textarea class="textarea" id="dec-note" placeholder="mis. Indikator bonus & deposit terpenuhi, bukti lengkap."></textarea></label>',
      confirmLabel: labels[action],
      cancelLabel: 'Batal',
      kind: kinds[action] === 'ok' ? 'ok' : kinds[action] === 'warn' ? 'warn' : 'danger',
      onConfirm: function () {
        const note = (U.$('#dec-note') || {}).value || '';
        const res = Store.decide(d.id, action, note);
        if (res.ok) {
          C.closeDrawer();
          C.toast('Keputusan tersimpan', d.domain + ' → ' + labels[action] + ' · +1 sampel berlabel', action === 'bukan' ? 'ok' : action === 'investigasi' ? 'warn' : 'danger');
        } else if (res.reason === 'read_only') {
          C.toast('Tidak diizinkan', 'Peran Anda hanya-baca', 'warn');
        }
      }
    });
  }
})();
