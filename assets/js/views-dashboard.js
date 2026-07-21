/* views-dashboard.js — Beranda / Command Dashboard */
(function () {
  'use strict';
  const U = window.U, Store = window.Store, C = window.C, Charts = window.Charts;
  const V = (window.Views = window.Views || {});

  function statCard(o) {
    return '<div class="stat' + (o.brand ? ' accent-brand' : '') + '">' +
      '<div class="k">' + U.icon(o.icon) + o.k + '</div>' +
      '<div class="v">' + o.v + (o.unit ? '<small>' + o.unit + '</small>' : '') + '</div>' +
      '<div class="foot">' + (o.trend || '') + (o.foot ? '<span class="faint">' + o.foot + '</span>' : '') + '</div>' +
      (o.spark ? '<div class="stat-spark">' + o.spark + '</div>' : '') +
      '</div>';
  }
  function trendPill(delta) {
    if (delta === 0) return '<span class="trend flat">' + U.icon('dot') + '0</span>';
    const up = delta > 0;
    return '<span class="trend ' + (up ? 'up' : 'down') + '">' + U.icon(up ? 'up' : 'down') + (up ? '+' : '') + delta + '</span>';
  }

  V.beranda = {
    render: function () {
      const st = Store.get();
      const c = Store.counts();
      const trend = st.trend;
      const sparkT = Charts.spark(trend.slice(-14).map(d => d.temuan), { color: 'var(--accent)' });
      const sparkK = Charts.spark(trend.slice(-14).map(d => d.terkonfirmasi), { color: 'var(--brand)' });
      const yesterday = trend[trend.length - 2] ? trend[trend.length - 2].temuan : 0;
      const deltaToday = c.baruHariIni - yesterday;

      const eff = Store.sourceEffectiveness();
      const effBars = Charts.hbars(eff.map(function (s) {
        return { label: s.name, value: s.confirmed, icon: s.icon, sub: s.total ? ' · ' + U.fmtPct(s.eff * 100) + ' konfirmasi' : '', color: s.headline ? 'var(--brand)' : 'var(--accent)' };
      }), { max: Math.max.apply(null, eff.map(s => s.confirmed)) });

      const donut = Charts.donut([
        { label: 'Terkonfirmasi', value: c.terkonfirmasi, color: 'var(--st-judi)' },
        { label: 'Antre review', value: c.review, color: 'var(--st-review)' },
        { label: 'Baru', value: c.baru, color: 'var(--st-new)' },
        { label: 'Investigasi', value: c.investigasi, color: 'var(--st-invest)' },
        { label: 'Bukan', value: c.bukan, color: 'var(--st-bukan)' }
      ], { centerLabel: U.fmtNum(c.total), centerSub: 'total domain' });

      return '' +
      // hero band
      '<section class="hero mb-5"><div class="hero-bg">' + C.img('assets/img/hero-cover.jpg', '', '', 'hero') + '</div>' +
        '<div class="hero-inner">' +
          '<span class="eyebrow" style="color:#aebfd8">SapuBersih · Platform Penemuan &amp; Bukti Judi Online</span>' +
          '<h1 class="htitle">Dari data mentah menjadi bukti terverifikasi.</h1>' +
          '<p class="hsub">Mesin yang menemukan, mengklasifikasikan, dan mendokumentasikan situs judi online — setiap putusan dikonfirmasi manusia, setiap langkah tercatat untuk audit.</p>' +
          '<div class="hmeta">' +
            '<span class="hero-badge">' + U.icon('cert') + 'Penemuan multi-sumber (CT log, NRD, permutasi)</span>' +
            '<span class="hero-badge">' + U.icon('shield') + 'Bukti, bukan penindakan</span>' +
            '<span class="hero-badge">' + U.icon('user') + 'Konfirmasi manusia wajib</span>' +
          '</div>' +
        '</div>' +
      '</section>' +

      // stat row
      '<div class="grid grid-4 mb-5">' +
        statCard({ icon: 'penemuan', k: 'Temuan baru hari ini', v: U.fmtNum(c.baruHariIni), trend: trendPill(deltaToday), foot: 'vs kemarin', spark: sparkT }) +
        statCard({ icon: 'review', k: 'Antrean review analis', v: U.fmtNum(c.antrean), foot: c.review + ' review · ' + c.investigasi + ' investigasi' }) +
        statCard({ icon: 'shield', k: 'Domain terkonfirmasi', v: U.fmtNum(c.terkonfirmasi), brand: true, foot: 'oleh analis manusia', spark: sparkK }) +
        statCard({ icon: 'jaringan', k: 'Cluster mirror aktif', v: U.fmtNum(c.clusterAktif), foot: '= ' + U.fmtNum(c.mirrorTotal) + ' domain mirror terpetakan' }) +
      '</div>' +

      // trend + donut
      '<div class="grid mb-5" style="grid-template-columns:1.7fr 1fr">' +
        '<div class="card"><div class="card-head"><h3>' + U.icon('monitoring') + 'Tren 30 hari</h3>' +
          '<div class="row gap-4 sm"><span class="row gap-2"><span class="lg-dot" style="background:var(--accent)"></span>Temuan</span>' +
          '<span class="row gap-2"><span class="lg-dot dash" style="background:var(--brand)"></span>Terkonfirmasi</span></div></div>' +
          '<div class="card-body">' + Charts.trend(trend) + '</div></div>' +
        '<div class="card"><div class="card-head"><h3>' + U.icon('klasifikasi') + 'Distribusi status</h3></div>' +
          '<div class="card-body">' + donut + '</div></div>' +
      '</div>' +

      // source effectiveness + live ticker
      '<div class="grid" style="grid-template-columns:1.2fr 1fr">' +
        '<div class="card"><div class="card-head"><h3>' + U.icon('cert') + 'Efektivitas sumber penemuan</h3><span class="sub">domain terkonfirmasi per sumber</span></div>' +
          '<div class="card-body">' + effBars +
          '<div class="callout mt-4">' + U.icon('zap') + '<span><b>Certificate Transparency</b> adalah sumber paling produktif: situs judi berganti domain harian, tetapi wajib memasang SSL — sertifikat baru memunculkan domain dalam hitungan jam.</span></div>' +
          '</div></div>' +
        '<div class="card"><div class="card-head"><h3><span class="live-dot"></span>Temuan terbaru</h3><span class="sub" id="ticker-live">memantau…</span></div>' +
          '<div class="card-body" style="padding-top:6px"><div class="ticker" id="ticker"></div></div></div>' +
      '</div>';
    },

    mount: function (root) {
      const ticker = U.$('#ticker', root);
      function row(d) {
        const s = Store.source(d.source);
        return '<div class="ticker-item"><span class="ticker-time">' + U.timeAgo(d.discoveredAt, Store.clock()) + '</span>' +
          '<span class="ticker-body"><span class="d">' + U.esc(d.domain) + '</span>' +
          '<span class="m">' + (C.VERDICT[d.ai.verdict] ? C.VERDICT[d.ai.verdict].short : '') + ' · keyakinan ' + d.ai.confidence + '% · ' + C.badge(d.status).replace(/<[^>]+>/g, '').trim() + '</span></span>' +
          '<span class="ticker-src">' + (s ? U.esc(s.short) : '') + '</span></div>';
      }
      const recent = Store.recentFindings(9);
      ticker.innerHTML = recent.map(row).join('');

      // live feel: gently surface a synthetic "just discovered" row periodically (visual only)
      const pool = ['gacor-zeus-alt', 'maxwinolympus', 'slotsultan88', 'toto4dku', 'hokijp99', 'scatter-max', 'zeusgates', 'rungkad303'];
      const tlds = ['.top', '.xyz', '.click', '.vip', '.live', '.icu'];
      let n = 0;
      const iv = setInterval(function () {
        n++;
        const dom = pool[(Math.random() * pool.length) | 0] + (Math.random() > .5 ? (Math.random() * 90 + 10 | 0) : '') + tlds[(Math.random() * tlds.length) | 0];
        const conf = 82 + (Math.random() * 16 | 0);
        const el = document.createElement('div');
        el.className = 'ticker-item';
        el.innerHTML = '<span class="ticker-time">baru saja</span><span class="ticker-body">' +
          '<span class="d">' + dom + '</span><span class="m">Judi · keyakinan ' + conf + '% · Baru</span></span>' +
          '<span class="ticker-src">CT Log</span>';
        ticker.insertBefore(el, ticker.firstChild);
        while (ticker.children.length > 9) ticker.removeChild(ticker.lastChild);
        const live = U.$('#ticker-live', root); if (live) live.textContent = n + ' masuk sesi ini';
      }, 7000);
      window.App.onCleanup(function () { clearInterval(iv); });
    }
  };
})();
