/* views-monitoring.js — Monitoring & Siklus Hidup */
(function () {
  'use strict';
  const U = window.U, Store = window.Store, C = window.C, Charts = window.Charts;
  const V = (window.Views = window.Views || {});

  let lfilter = 'semua';

  V.monitoring = {
    render: function () {
      const st = Store.get();
      const c = Store.counts();
      const confirmed = st.domains.filter(d => d.status === 'terkonfirmasi');
      let rowsData = confirmed.slice();
      if (lfilter !== 'semua') rowsData = rowsData.filter(d => d.lifecycle === lfilter);
      rowsData.sort((a, b) => (b.decision ? b.decision.at : 0) - (a.decision ? a.decision.at : 0));

      // alerts: clusters that spawned new mirrors + recheck
      const alerts = [];
      st.clusters.forEach(function (cl) {
        const news = Store.clusterMembers(cl.id).filter(m => m.isNew);
        if (news.length) alerts.push({ kind: 'danger', icon: 'jaringan', title: cl.name + ' memunculkan ' + news.length + ' mirror baru', sub: 'Cluster aktif berkembang — perlu penangkapan bukti & review.', cta: '#/jaringan' });
      });
      alerts.push({ kind: 'warn', icon: 'clock', title: c.aktif + ' domain terkonfirmasi masih aktif', sub: 'Pemeriksaan ulang otomatis tiap ' + st.settings.recheckCadenceHours + ' jam.', cta: null });
      alerts.push({ kind: 'info', icon: 'cert', title: 'Pantauan CT log berjalan', sub: 'Domain baru dari operator yang sama akan otomatis dikaitkan ke clusternya.', cta: null });

      return '' +
      '<div class="section-head"><div class="lhs"><div class="eyebrow">Siklus hidup temuan</div>' +
        '<h2>Monitoring &amp; Siklus Hidup</h2>' +
        '<p class="desc">Status domain terkonfirmasi dari waktu ke waktu. Penting: status seperti “Diblokir” <b>dicatat oleh manusia</b> — platform ini mendokumentasikan, tidak pernah memblokir atau menindak sendiri.</p></div></div>' +

      '<div class="callout brand mb-4">' + U.icon('shield') + '<span><b>Bukti, bukan penindakan.</b> SapuBersih tidak memblokir domain apa pun. Kolom status di bawah adalah catatan hasil tindak lanjut pihak berwenang, untuk transparansi &amp; audit.</span></div>' +

      '<div class="grid" style="grid-template-columns:1fr 1.6fr;align-items:start">' +
        // lifecycle donut + counts
        '<div class="card"><div class="card-head"><h3>' + U.icon('monitoring') + 'Status siklus hidup</h3></div>' +
          '<div class="card-body">' + Charts.donut([
            { label: 'Masih aktif', value: c.aktif, color: 'var(--st-judi)' },
            { label: 'Dilaporkan', value: c.dilaporkan, color: 'var(--st-new)' },
            { label: 'Diblokir', value: c.diblokir, color: 'var(--st-bukan)' },
            { label: 'Tidak aktif', value: c.tidakAktif, color: 'var(--st-neutral)' }
          ], { centerLabel: U.fmtNum(c.terkonfirmasi), centerSub: 'terkonfirmasi' }) +
          '<div class="kv mt-4"><dt>Interval pemeriksaan ulang</dt><dd>' + st.settings.recheckCadenceHours + ' jam</dd>' +
          '<dt>Cluster dipantau</dt><dd>' + c.clusterAktif + '</dd></div>' +
          '</div></div>' +

        // alerts
        '<div class="card"><div class="card-head"><h3><span class="live-dot"></span>Peringatan</h3><span class="sub">' + alerts.length + ' aktif</span></div>' +
          '<div class="card-body stack-3">' + alerts.map(function (a) {
            return '<div class="alert-row ' + a.kind + '"><span class="al-ico">' + U.icon(a.icon) + '</span>' +
              '<div class="grow"><div class="b sm">' + U.esc(a.title) + '</div><div class="faint sm">' + U.esc(a.sub) + '</div></div>' +
              (a.cta ? '<a class="btn btn-ghost btn-sm" href="' + a.cta + '">Lihat ' + U.icon('arrowR') + '</a>' : '') + '</div>';
          }).join('') + '</div></div>' +
      '</div>' +

      '<div class="toolbar mt-5"><div class="seg" id="lfilter">' +
        [['semua', 'Semua'], ['aktif', 'Masih aktif'], ['dilaporkan', 'Dilaporkan'], ['diblokir', 'Diblokir'], ['tidak_aktif', 'Tidak aktif']].map(f => '<button class="' + (lfilter === f[0] ? 'on' : '') + '" data-l="' + f[0] + '">' + f[1] + '</button>').join('') +
        '</div><span class="faint sm">' + rowsData.length + ' domain terkonfirmasi</span></div>' +

      '<div class="card"><div class="table-wrap"><table class="tbl"><thead><tr>' +
        '<th>Domain</th><th>Cluster</th><th>Status siklus hidup</th><th>Dikonfirmasi</th><th>Oleh</th><th></th></tr></thead><tbody>' +
        rowsData.slice(0, 80).map(function (d) {
          const cl = d.clusterId ? Store.cluster(d.clusterId) : null;
          return '<tr><td class="domain">' + U.esc(d.domain) + '</td>' +
            '<td class="sm">' + (cl ? U.esc(cl.name) : '<span class="faint">—</span>') + '</td>' +
            '<td>' + C.lifecycleBadge(d.lifecycle) + '</td>' +
            '<td class="sm faint">' + (d.decision ? U.fmtDate(d.decision.at) : '—') + '</td>' +
            '<td class="sm">' + (d.decision ? C.avatar(d.decision.by) + ' ' + U.esc(d.decision.by.split(' ')[0]) : '—') + '</td>' +
            '<td class="row-actions">' + (Store.can('decide') ? '<button class="btn btn-ghost btn-sm" data-life="' + d.id + '">' + U.icon('sliders') + 'Perbarui</button>' : '') + '</td></tr>';
        }).join('') +
        '</tbody></table></div></div>';
    },

    mount: function (root) {
      U.$$('[data-l]', root).forEach(b => b.addEventListener('click', function () { lfilter = b.dataset.l; window.App.refreshView(); }));
      U.$$('[data-life]', root).forEach(b => b.addEventListener('click', function () { openLifecycle(b.getAttribute('data-life')); }));
    }
  };

  function openLifecycle(id) {
    const d = Store.domain(id); if (!d) return;
    const opts = [['aktif', 'Masih Aktif'], ['dilaporkan', 'Dilaporkan ke pihak berwenang'], ['diblokir', 'Diblokir (dicatat)'], ['tidak_aktif', 'Tidak Aktif']];
    C.openModal({
      title: 'Perbarui status siklus hidup',
      message: '<b>' + U.esc(d.domain) + '</b> — catat status tindak lanjut. Ini <b>catatan</b>, bukan tindakan pemblokiran oleh platform.',
      body: '<div class="stack-2" id="life-opts">' + opts.map(o => '<button class="lc-opt' + (d.lifecycle === o[0] ? ' on' : '') + '" data-v="' + o[0] + '">' + C.lifecycleBadge(o[0]) + '<span class="grow"></span>' + (d.lifecycle === o[0] ? U.icon('check') : '') + '</button>').join('') + '</div>',
      footer: '<button class="btn btn-secondary" onclick="C.closeModal()">Tutup</button>',
      onMount: function (m) {
        U.$$('[data-v]', m).forEach(function (b) {
          b.addEventListener('click', function () {
            Store.setLifecycle(d.id, b.getAttribute('data-v'));
            C.closeModal();
            C.toast('Status diperbarui', d.domain + ' · tercatat di Audit Log', 'ok');
          });
        });
      }
    });
  }
})();
