/* views-discovery.js — Penemuan / Discovery (multi-source + simulated run) */
(function () {
  'use strict';
  const U = window.U, Store = window.Store, C = window.C;
  const V = (window.Views = window.Views || {});

  function sourceCard(s, stat) {
    return '<div class="src-card' + (s.headline ? ' headline' : '') + '">' +
      '<div class="src-top"><span class="src-ico">' + U.icon(s.icon) + '</span>' +
        '<div class="grow"><div class="row gap-2"><span class="b">' + U.esc(s.name) + '</span>' + (s.headline ? '<span class="badge badge-judi" style="font-size:10px">Kapabilitas utama</span>' : '') + '</div>' +
        '<div class="faint sm mono">' + U.esc(s.short) + '</div></div>' +
        '<div class="src-count"><div class="serif" style="font-size:22px">' + U.fmtNum(stat.today) + '</div><div class="eyebrow">hari ini</div></div>' +
      '</div>' +
      '<p class="muted sm mt-3">' + U.esc(s.desc) + '</p>' +
      '<ol class="src-how">' + s.how.map(h => '<li>' + U.esc(h) + '</li>').join('') + '</ol>' +
    '</div>';
  }

  V.penemuan = {
    render: function () {
      const st = Store.get();
      const stats = st.sourceStats;
      const lex = st.lexicon;
      const catColor = { provider: 'var(--st-invest)', permainan: 'var(--st-new)', slang: 'var(--st-review)', transaksi: 'var(--st-judi)' };
      const chips = lex.map(function (l) {
        return '<span class="chip" data-term="' + U.esc(l.term) + '"><span class="idot" style="width:7px;height:7px;border-radius:50%;background:' + (catColor[l.cat] || 'var(--accent)') + '"></span>' + U.esc(l.term) +
          (Store.can('lexicon') ? '<span class="x" data-remove="' + U.esc(l.term) + '">' + U.icon('x') + '</span>' : '') + '</span>';
      }).join('');

      return '' +
      '<div class="section-head"><div class="lhs"><div class="eyebrow">Diferensiator teknis</div>' +
        '<h2>Penemuan Multi-Sumber</h2>' +
        '<p class="desc">Empat sumber penemuan bekerja paralel. Karena situs judi berganti domain harian, kami tidak menunggu laporan — kami memantau sinyal yang tak bisa mereka hindari, terutama <b>sertifikat SSL baru</b>.</p></div>' +
        '<div class="rhs">' + C.gate('discover', '<button class="btn btn-primary btn-lg" id="run-btn">' + U.icon('play') + 'Jalankan Penemuan</button>', 'Peran Anda tidak dapat menjalankan penemuan') + '</div>' +
      '</div>' +

      // run panel (hidden until triggered)
      '<div class="card mb-5 hidden" id="run-panel"><div class="card-head"><h3><span class="live-dot"></span>Putaran Penemuan Berjalan</h3><span class="sub" id="run-stage">memulai…</span></div>' +
        '<div class="card-body"><div class="progressbar mb-4"><span id="run-bar" style="width:0%"></span></div>' +
        '<div class="run-log" id="run-log"></div>' +
        '<div id="run-result" class="hidden"></div></div></div>' +

      // source cards
      '<div class="grid grid-2 mb-5">' +
        st.sources.filter(s => s.id !== 'manual_seed').map(s => sourceCard(s, stats[s.id] || { today: 0 })).join('') +
      '</div>' +

      // lexicon + permutation engine
      '<div class="grid" style="grid-template-columns:1.3fr 1fr">' +
        '<div class="card"><div class="card-head"><h3>' + U.icon('hash') + 'Leksikon Bahasa Indonesia</h3>' +
          '<span class="sub">' + lex.length + ' token · ' + (Store.can('lexicon') ? 'dapat diedit' : 'hanya-baca') + '</span></div>' +
          '<div class="card-body"><div class="chips" id="lex-chips">' + chips + '</div>' +
          (Store.can('lexicon') ?
            '<div class="row gap-2 mt-4"><input class="input" id="lex-input" placeholder="Tambah token, mis. “pragmatic”" style="max-width:260px" />' +
            '<button class="btn btn-secondary" id="lex-add">' + U.icon('plus') + 'Tambah</button></div>' +
            '<div class="help">Perubahan leksikon tercatat di Audit Log. Cakupan tetap terbatas pada kategori judi online.</div>'
            : '<div class="help mt-3">Leksikon hanya dapat diubah oleh Admin/Super Admin, dengan jejak audit.</div>') +
          '</div></div>' +
        '<div class="card"><div class="card-head"><h3>' + U.icon('cpu') + 'Mesin Permutasi</h3></div>' +
          '<div class="card-body"><p class="muted sm">Menggabungkan token menjadi kandidat domain, lalu memeriksa mana yang benar-benar aktif:</p>' +
          '<div class="perm-list mt-3">' + st.lexPermutations.map(p => '<div class="perm-row">' + U.icon('arrowR') + '<span class="mono sm">' + U.esc(p) + '</span></div>').join('') + '</div>' +
          '<div class="scope-note mt-4">' + U.icon('shield') + '<span><b>Disiplin cakupan:</b> deteksi hanya menargetkan satu kategori — <b>judi online</b>. Bukan filter konten umum. Perubahan cakupan hanya oleh admin dan tercatat audit.</span></div>' +
          '</div></div>' +
      '</div>';
    },

    mount: function (root) {
      const runBtn = U.$('#run-btn', root);
      if (runBtn && !runBtn.disabled) runBtn.addEventListener('click', function () { runPass(root); });

      // lexicon add/remove
      const addBtn = U.$('#lex-add', root), input = U.$('#lex-input', root);
      if (addBtn) addBtn.addEventListener('click', function () {
        const v = (input.value || '').trim();
        if (!v) return;
        const res = Store.addLexicon(v, 'slang');
        if (res.ok) { C.toast('Token ditambahkan', '“' + v + '” masuk leksikon · tercatat audit', 'ok'); }
        else if (res.reason === 'dup') C.toast('Sudah ada', 'Token sudah ada di leksikon', 'warn');
      });
      if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && addBtn) addBtn.click(); });
      U.$$('[data-remove]', root).forEach(function (x) {
        x.addEventListener('click', function () { Store.removeLexicon(x.getAttribute('data-remove')); C.toast('Token dihapus', 'tercatat di Audit Log', 'ok'); });
      });
    }
  };

  function runPass(root) {
    const panel = U.$('#run-panel', root);
    const bar = U.$('#run-bar', root);
    const log = U.$('#run-log', root);
    const stageEl = U.$('#run-stage', root);
    const resultEl = U.$('#run-result', root);
    const btn = U.$('#run-btn', root);
    panel.classList.remove('hidden');
    log.innerHTML = ''; resultEl.classList.add('hidden'); resultEl.innerHTML = '';
    bar.style.width = '0%';
    if (btn) { btn.disabled = true; btn.innerHTML = U.icon('refresh') + 'Berjalan…'; }
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const nCerts = 180 + (Math.random() * 240 | 0);
    const stages = [
      { p: 12, s: 'Menghubungkan aliran CT log', l: ['Berlangganan log CT publik (Argon, Xenon, Nessie)…', 'Koneksi aman terbentuk.'], k: ['info2', 'ok'] },
      { p: 32, s: 'Memindai sertifikat SSL baru', l: ['Menerima ' + nCerts + ' sertifikat baru dalam jendela pantau.', 'Mengekstrak domain + Subject Alternative Name (SAN)…'], k: ['info2', 'info2'] },
      { p: 55, s: 'Mencocokkan leksikon & permutasi', l: ['Mencocokkan token: slot, gacor, maxwin, zeus, olympus, toto…', 'Kandidat cocok pola ditemukan.'], k: ['info2', 'hit'] },
      { p: 74, s: 'Resolusi DNS & keaktifan', l: ['Memeriksa resolusi DNS & status hidup…', 'Menyaring domain parkir / tidak aktif.'], k: ['info2', 'info2'] },
      { p: 90, s: 'Penangkapan bukti', l: ['Menangkap screenshot, metadata teknis, hash konten…', 'Rantai penyimpanan bukti (chain of custody) dicatat.'], k: ['info2', 'ok'] }
    ];
    let si = 0;
    const timers = [];
    function schedule(fn, ms) { const t = setTimeout(fn, ms); timers.push(t); return t; }
    window.App.onCleanup(function () { timers.forEach(clearTimeout); });

    function addLine(text, k) {
      const t = U.fmtTimeS(Store.clock());
      const el = document.createElement('div');
      el.className = 'ln';
      el.innerHTML = '<span class="t">' + t + '</span><span class="' + (k || 'info2') + '">' + U.esc(text) + '</span>';
      log.appendChild(el); log.scrollTop = log.scrollHeight;
    }
    // Silent discovery: mutate + persist WITHOUT a full view re-render, so the streamed
    // result panel stays intact. Sidebar counts refreshed via App.refreshChrome().
    function finishLocal() {
      bar.style.width = '100%';
      stageEl.textContent = 'Selesai';
      const res = Store.runDiscovery(undefined, true);
      if (btn) { btn.disabled = false; btn.innerHTML = U.icon('play') + 'Jalankan Lagi'; }
      if (!res.ok) return;
      stageEl.textContent = 'Selesai · ' + res.n + ' kandidat baru';
      addLine(res.n + ' kandidat baru masuk antrean review.', 'hit');
      resultEl.classList.remove('hidden');
      const rows = res.added.slice(0, 6).map(function (d) {
        return '<tr><td class="domain">' + U.esc(d.domain) + '</td><td>' + C.verdictBadge(d.ai.verdict) + '</td><td class="num mono">' + d.ai.confidence + '%</td><td>' + C.sourceBadge(d.source) + '</td></tr>';
      }).join('');
      resultEl.innerHTML = '<div class="result-banner mt-4">' + U.icon('check') + '<span><b>' + res.n + ' kandidat baru</b> ditemukan &amp; ditangkap buktinya. Kini menunggu keputusan analis di Antrean Review.</span>' +
        '<a class="btn btn-primary btn-sm" href="#/review">Buka Antrean Review ' + U.icon('arrowR') + '</a></div>' +
        '<div class="table-wrap mt-3"><table class="tbl"><thead><tr><th>Domain</th><th>Rekomendasi</th><th class="num">Keyakinan</th><th>Sumber</th></tr></thead><tbody>' + rows +
        '</tbody></table></div><div class="help">Menampilkan 6 dari ' + res.n + ' · seluruhnya masuk antrean.</div>';
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      window.App.refreshChrome();   // update sidebar nav counts without wiping this panel
    }

    // drive the sequence, then finishLocal
    function driver() {
      if (si >= stages.length) { finishLocal(); return; }
      const stg = stages[si];
      stageEl.textContent = stg.s;
      bar.style.width = stg.p + '%';
      stg.l.forEach((line, idx) => schedule(() => addLine(line, stg.k[idx]), idx * 340));
      si++;
      schedule(driver, 980);
    }
    schedule(driver, 200);
  }
})();
