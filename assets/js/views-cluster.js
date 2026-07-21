/* views-cluster.js — Peta Jaringan / Mirror Cluster (interactive viz) */
(function () {
  'use strict';
  const U = window.U, Store = window.Store, C = window.C, CV = window.ClusterViz;
  const V = (window.Views = window.Views || {});

  let selectedCluster = null;
  let vizApi = null;

  function signalRow(icon, label, value, color) {
    return '<div class="sig-row"><span class="sig-ico" style="color:' + color + '">' + U.icon(icon) + '</span>' +
      '<div class="grow"><div class="sm b">' + U.esc(label) + '</div><div class="mono sm faint" style="word-break:break-all">' + U.esc(value) + '</div></div></div>';
  }

  V.jaringan = {
    render: function () {
      const st = Store.get();
      const clusters = st.clusters;
      if (!selectedCluster || !Store.cluster(selectedCluster)) selectedCluster = (clusters[0] || {}).id;
      const cl = Store.cluster(selectedCluster);
      const members = Store.clusterMembers(selectedCluster);
      const conf = members.filter(m => m.status === 'terkonfirmasi').length;
      const queue = members.filter(m => m.status === 'baru' || m.status === 'review' || m.status === 'investigasi').length;

      const tabs = clusters.map(function (c) {
        const on = c.id === selectedCluster ? ' active' : '';
        return '<button class="cl-tab' + on + '" data-cl="' + c.id + '">' +
          '<div class="row-between"><span class="b sm">' + U.esc(c.name) + '</span><span class="badge badge-plain">' + c.size + '</span></div>' +
          '<div class="mono faint" style="font-size:11px">' + U.esc(c.seed) + '</div></button>';
      }).join('');

      const sm = CV.SIGNAL_META;
      const signals =
        signalRow('server', 'IP / ASN bersama', cl.signals.ip + ' · ' + cl.signals.asn + ' (' + cl.signals.asnOrg + ')', sm.ip.color) +
        signalRow('star', 'Favicon hash sama', cl.signals.faviconHash, sm.favicon.color) +
        signalRow('fingerprint', 'HTML fingerprint sama', cl.signals.htmlFingerprint, sm.fingerprint.color) +
        signalRow('pin', 'Negara hosting', cl.signals.hostingCountry, 'var(--text-2)');

      return '' +
      '<div class="section-head"><div class="lhs"><div class="eyebrow">Momen kunci</div>' +
        '<h2>Peta Jaringan — Cluster Mirror</h2>' +
        '<p class="desc">Satu situs terkonfirmasi mengembang menjadi jaringan mirror-nya, dikelompokkan berdasarkan sinyal teknis bersama. <b>Kami tidak menangkap satu domain — kami memetakan jaringannya.</b></p></div></div>' +

      '<div class="cl-tabs mb-4">' + tabs + '</div>' +

      '<div class="grid" style="grid-template-columns:1fr 360px;align-items:start">' +
        '<div class="card"><div class="card-head"><h3>' + U.icon('jaringan') + U.esc(cl.name) + '</h3>' +
          '<div class="row gap-2"><span class="faint sm">seret untuk geser · gulir untuk zoom</span>' +
          '<button class="iconbtn" id="viz-reset" title="Atur ulang tampilan">' + U.icon('refresh') + '</button></div></div>' +
          '<div class="cluster-canvas" id="cluster-canvas"></div>' +
          '<div class="card-foot"><div class="cl-legend">' +
            '<span class="lg"><span class="lg-node seed"></span>Situs induk (seed)</span>' +
            '<span class="lg"><span class="lg-node" style="background:var(--st-judi)"></span>Mirror terkonfirmasi</span>' +
            '<span class="lg"><span class="lg-node" style="background:var(--st-review)"></span>Antre review</span>' +
            '<span class="lg"><span class="lg-hub"></span>Sinyal bersama</span>' +
          '</div></div>' +
        '</div>' +

        '<div class="stack-4">' +
          '<div class="card"><div class="card-body">' +
            '<div class="row-between"><div><div class="eyebrow">Cluster</div><div class="b">' + U.esc(cl.id) + '</div></div>' +
            '<div class="serif" style="font-size:34px;line-height:1">' + cl.size + '</div></div>' +
            '<div class="faint sm mt-1">domain dalam jaringan</div>' +
            '<div class="segbar-wrap mt-4">' + window.Charts.segbar([
              { label: 'Terkonfirmasi', value: conf, color: 'var(--st-judi)' },
              { label: 'Antre review', value: queue, color: 'var(--st-review)' }
            ]) + '</div>' +
            '<div class="mt-4">' + C.gate('seed', '<button class="btn btn-secondary btn-block" id="expand-btn">' + U.icon('plus') + 'Perluas Cluster (cari mirror baru)</button>', 'Peran Anda tidak dapat memperluas cluster') + '</div>' +
          '</div></div>' +

          '<div class="card"><div class="card-head"><h3>' + U.icon('link') + 'Sinyal Bersama</h3></div>' +
            '<div class="card-body stack-2">' + signals +
            '<div class="scope-note mt-2">' + U.icon('info') + '<span>Pengelompokan otomatis dari kesamaan sinyal — dasar teknis bahwa domain-domain ini satu operator.</span></div>' +
            '</div></div>' +

          '<div class="card" id="node-card"><div class="card-head"><h3>' + U.icon('eye') + 'Detail Node</h3></div>' +
            '<div class="card-body" id="node-detail"><div class="faint sm center" style="padding:12px 0">Klik sebuah node untuk melihat detail domain &amp; membuka dosir buktinya.</div></div></div>' +
        '</div>' +
      '</div>';
    },

    mount: function (root) {
      const canvas = U.$('#cluster-canvas', root);
      const cl = Store.cluster(selectedCluster);
      const members = Store.clusterMembers(selectedCluster);

      vizApi = CV.render(canvas, cl, members, {
        onSelect: function (d) { showNode(root, d); },
        onClear: function () { clearNode(root); }
      });
      window.App.onCleanup(function () { if (vizApi && vizApi.destroy) vizApi.destroy(); });

      U.$$('.cl-tab', root).forEach(b => b.addEventListener('click', function () { selectedCluster = b.dataset.cl; window.App.refreshView(); }));
      const reset = U.$('#viz-reset', root); if (reset) reset.addEventListener('click', function () { if (vizApi) vizApi.reset(); clearNode(root); });
      const exp = U.$('#expand-btn', root);
      if (exp && !exp.disabled) exp.addEventListener('click', function () {
        const res = Store.expandCluster(selectedCluster, 3);
        if (res.ok) C.toast('Cluster diperluas', res.added.length + ' mirror baru ditemukan & ditambahkan ke jaringan', 'ok');
      });
    }
  };

  function showNode(root, d) {
    const el = U.$('#node-detail', root); if (!el) return;
    el.innerHTML =
      '<div class="row-between mb-2"><span class="mono b">' + U.esc(d.domain) + '</span>' + C.badge(d.status) + '</div>' +
      '<div class="kv mb-3">' +
        '<dt>ID</dt><dd class="mono">' + U.esc(d.id) + '</dd>' +
        '<dt>Putusan AI</dt><dd>' + C.VERDICT[d.ai.verdict].label + '</dd>' +
        '<dt>Keyakinan</dt><dd class="mono">' + d.ai.confidence + '%</dd>' +
        '<dt>IP</dt><dd class="mono">' + U.esc(d.evidence.ip) + '</dd>' +
      '</div>' +
      '<div class="mb-3">' + C.confMeter(d.ai.verdict, d.ai.confidence) + '</div>' +
      '<button class="btn btn-primary btn-sm btn-block" data-dossier="' + d.id + '">' + U.icon('doc') + 'Buka Dosir Bukti</button>';
    const b = U.$('[data-dossier]', el);
    if (b) b.addEventListener('click', function () { openDossierDrawer(d.id); });
  }
  function clearNode(root) {
    const el = U.$('#node-detail', root); if (!el) return;
    el.innerHTML = '<div class="faint sm center" style="padding:12px 0">Klik sebuah node untuk melihat detail domain &amp; membuka dosir buktinya.</div>';
  }

  function openDossierDrawer(id) {
    const d = Store.domain(id); if (!d) return;
    C.openDrawer({
      eyebrow: 'Dosir Bukti · ' + d.id,
      title: d.domain,
      subtitle: C.badge(d.status) + ' ' + C.priorityBadge(d.priority) + ' ' + C.sourceBadge(d.source),
      body: C.evidencePanel(d),
      footer: '<a class="btn btn-secondary" href="#/laporan">' + U.icon('printer') + 'Lihat versi cetak/PDF</a>' +
        '<a class="btn btn-ghost" href="#/review">' + U.icon('review') + 'Ke Antrean Review</a>'
    });
  }

  window.__openDossierDrawer = openDossierDrawer;
})();
