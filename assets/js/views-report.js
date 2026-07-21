/* views-report.js — Laporan & Dosir (printable dossier, batch export, exec summary) */
(function () {
  'use strict';
  const U = window.U, Store = window.Store, C = window.C, Charts = window.Charts;
  const V = (window.Views = window.Views || {});

  let mode = 'dosir';
  let selId = null;
  let search = '';

  function pickList() {
    const st = Store.get();
    let ds = st.domains.slice().sort(function (a, b) {
      const rank = s => s === 'terkonfirmasi' ? 0 : 1;
      if (rank(a.status) !== rank(b.status)) return rank(a.status) - rank(b.status);
      return b.ai.confidence - a.ai.confidence;
    });
    if (search) ds = ds.filter(d => d.domain.indexOf(search.toLowerCase()) >= 0 || d.id.toLowerCase().indexOf(search.toLowerCase()) >= 0);
    return ds;
  }

  function exportCSV() {
    const ds = Store.get().domains;
    const head = ['id', 'domain', 'status', 'putusan_ai', 'keyakinan', 'prioritas', 'sumber', 'cluster', 'ip', 'asn', 'ditemukan', 'diputuskan_oleh', 'waktu_keputusan', 'siklus_hidup'];
    const lines = [head.join(',')];
    ds.forEach(function (d) {
      const cl = d.clusterId ? (Store.cluster(d.clusterId) || {}).name : '';
      const row = [d.id, d.domain, d.status, d.ai.verdict, d.ai.confidence, d.priority, d.source, cl || '', d.evidence.ip, d.evidence.asn, U.fmtStamp(d.discoveredAt), d.decision ? d.decision.by : '', d.decision ? U.fmtStamp(d.decision.at) : '', d.lifecycle || ''];
      lines.push(row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','));
    });
    download('sapubersih_temuan_' + stamp() + '.csv', lines.join('\n'), 'text/csv');
  }
  function exportJSON() {
    const ds = Store.get().domains.map(function (d) {
      return { id: d.id, domain: d.domain, status: d.status, ai: d.ai, priority: d.priority, source: d.source, clusterId: d.clusterId, evidence: d.evidence, decision: d.decision, lifecycle: d.lifecycle, category: d.category };
    });
    download('sapubersih_temuan_' + stamp() + '.json', JSON.stringify({ generatedAt: U.fmtStamp(Store.clock()), catatan: 'DATA SINTETIS — DEMO', total: ds.length, temuan: ds }, null, 2), 'application/json');
  }
  function stamp() { const d = new Date(Store.clock()); return d.getFullYear() + U.pad(d.getMonth() + 1) + U.pad(d.getDate()); }
  function download(name, content, type) {
    const blob = new Blob([content], { type: type + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    C.toast('Berkas diekspor', name, 'ok');
  }

  function execSummary() {
    const st = Store.get(), c = Store.counts();
    const eff = Store.sourceEffectiveness();
    const topClusters = st.clusters.slice().sort((a, b) => b.size - a.size);
    return '<article class="dossier exec" id="exec-doc">' +
      '<header class="dsr-head"><div class="dsr-org"><div class="dsr-mark">' + U.icon('shield') + '</div>' +
        '<div><div class="dsr-title">RINGKASAN PIMPINAN — TEMUAN JUDI ONLINE</div>' +
        '<div class="dsr-sub">SapuBersih · disiapkan oleh KODE untuk Komdigi · ' + U.fmtDateFull(Store.clock()) + '</div></div></div>' +
        '<div class="dsr-caseid"><div class="badge badge-review">SPESIMEN · DATA SINTETIS</div></div></header>' +
      '<div class="dsr-banner">' + U.icon('warnTri') + ' Angka di dokumen ini berasal dari <b>data sintetis fiktif</b> untuk keperluan demonstrasi.</div>' +

      '<section class="dsr-sec"><h4>Ikhtisar</h4>' +
        '<div class="exec-grid">' +
          execStat(c.total, 'Total domain diproses') +
          execStat(c.terkonfirmasi, 'Terkonfirmasi judi online') +
          execStat(c.antrean, 'Menunggu review analis') +
          execStat(c.clusterAktif, 'Cluster mirror terpetakan') +
          execStat(c.mirrorTotal, 'Domain mirror dalam jaringan') +
          execStat(c.labeled, 'Sampel berlabel terkumpul') +
        '</div></section>' +

      '<section class="dsr-sec"><h4>Efektivitas Sumber Penemuan</h4>' +
        '<table class="exec-tbl"><thead><tr><th>Sumber</th><th>Diproses</th><th>Terkonfirmasi</th><th>Rasio</th></tr></thead><tbody>' +
        eff.map(s => '<tr><td>' + U.esc(s.name) + (s.headline ? ' ★' : '') + '</td><td>' + U.fmtNum(s.total) + '</td><td>' + U.fmtNum(s.confirmed) + '</td><td>' + (s.total ? U.fmtPct(s.eff * 100) : '—') + '</td></tr>').join('') +
        '</tbody></table>' +
        '<p class="sm muted mt-2">★ Certificate Transparency: sumber paling produktif — menangkap domain baru dalam hitungan jam lewat penerbitan sertifikat SSL.</p></section>' +

      '<section class="dsr-sec"><h4>Cluster Mirror Terbesar</h4>' +
        '<table class="exec-tbl"><thead><tr><th>Cluster</th><th>Seed</th><th>Domain</th><th>Terkonfirmasi</th></tr></thead><tbody>' +
        topClusters.map(function (cl) { const m = Store.clusterMembers(cl.id); return '<tr><td>' + U.esc(cl.name) + '</td><td class="mono">' + U.esc(cl.seed) + '</td><td>' + cl.size + '</td><td>' + m.filter(x => x.status === 'terkonfirmasi').length + '</td></tr>'; }).join('') +
        '</tbody></table></section>' +

      '<section class="dsr-sec"><h4>Tata Kelola</h4>' +
        '<ul class="exec-list"><li>Setiap klasifikasi AI adalah <b>rekomendasi</b>; status final hanya oleh konfirmasi analis manusia.</li>' +
        '<li>Setiap aksi tercatat lengkap di Audit Log (siapa, kapan, bukti, keputusan).</li>' +
        '<li>Deteksi terbatas pada satu kategori hukum: <b>judi online</b> — bukan filter konten umum.</li>' +
        '<li>Platform mendokumentasikan bukti; <b>tidak memblokir atau menindak</b> sendiri.</li></ul></section>' +

      '<footer class="dsr-foot"><span>SapuBersih — dihasilkan ' + U.fmtStamp(Store.clock()) + '</span><span>KODE · PT Kreasi Otomasi Digital Ekosistem</span></footer>' +
    '</article>';
  }
  function execStat(v, k) { return '<div class="exec-stat"><div class="es-v">' + U.fmtNum(v) + '</div><div class="es-k">' + U.esc(k) + '</div></div>'; }

  V.laporan = {
    render: function () {
      const ds = pickList();
      if (mode === 'dosir' && (!selId || !Store.domain(selId))) selId = (ds.find(d => d.status === 'terkonfirmasi') || ds[0] || {}).id || null;
      const sel = selId ? Store.domain(selId) : null;

      const listItems = ds.slice(0, 60).map(function (d) {
        return '<button class="dsr-pick' + (d.id === selId ? ' active' : '') + '" data-id="' + d.id + '">' +
          '<div class="row-between"><span class="mono sm b">' + U.esc(d.domain) + '</span>' + C.badge(d.status) + '</div>' +
          '<div class="faint sm mono">' + U.esc(d.id) + '</div></button>';
      }).join('');

      return '' +
      '<div class="section-head no-print"><div class="lhs"><div class="eyebrow">Keluaran yang dapat diserahkan</div>' +
        '<h2>Laporan &amp; Dosir Bukti</h2>' +
        '<p class="desc">Dokumen bukti per domain yang siap cetak/PDF, ekspor batch, dan ringkasan untuk pimpinan. Dirancang menyerupai berkas yang dapat diserahkan ke pihak berwenang.</p></div>' +
        '<div class="rhs"><button class="btn btn-secondary" id="exp-csv">' + U.icon('download') + 'Ekspor CSV</button>' +
        '<button class="btn btn-secondary" id="exp-json">' + U.icon('download') + 'Ekspor JSON</button></div>' +
      '</div>' +

      '<div class="toolbar no-print"><div class="seg" id="rmode">' +
        '<button class="' + (mode === 'dosir' ? 'on' : '') + '" data-m="dosir">Dosir per Domain</button>' +
        '<button class="' + (mode === 'ringkasan' ? 'on' : '') + '" data-m="ringkasan">Ringkasan Pimpinan</button>' +
        '</div><span class="grow"></span>' +
        '<button class="btn btn-primary" id="print-btn">' + U.icon('printer') + 'Cetak / Simpan PDF</button>' +
      '</div>' +

      (mode === 'dosir' ?
        '<div class="grid" style="grid-template-columns:300px 1fr;align-items:start">' +
          '<div class="card no-print"><div class="card-body" style="padding:10px">' +
            '<div class="search mb-2"><span class="ico">' + U.icon('search') + '</span><input class="input" id="dsr-search" placeholder="Cari domain / ID" value="' + U.esc(search) + '" /></div>' +
            '<div class="dsr-pick-list">' + listItems + '</div>' +
          '</div></div>' +
          '<div id="print-area">' + (sel ? C.dossier(sel) : C.empty('Pilih domain', 'Tidak ada temuan pada pencarian ini.')) + '</div>' +
        '</div>'
        : '<div id="print-area">' + execSummary() + '</div>');
    },

    mount: function (root) {
      U.$('#exp-csv', root).addEventListener('click', exportCSV);
      U.$('#exp-json', root).addEventListener('click', exportJSON);
      U.$('#print-btn', root).addEventListener('click', function () { window.print(); });
      U.$$('[data-m]', root).forEach(b => b.addEventListener('click', function () { mode = b.dataset.m; window.App.refreshView(); }));
      U.$$('[data-id]', root).forEach(b => b.addEventListener('click', function () { selId = b.dataset.id; window.App.refreshView(); }));
      const s = U.$('#dsr-search', root);
      if (s) s.addEventListener('input', U.debounce(function () { search = s.value.trim(); selId = null; window.App.refreshView(); setTimeout(function () { const el = U.$('#dsr-search'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 0); }, 260));
    }
  };
})();
