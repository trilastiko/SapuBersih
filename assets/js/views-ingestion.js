/* views-ingestion.js — Ingestion Data (CSV/Excel upload, mapping, validation, history) */
(function () {
  'use strict';
  const U = window.U, Store = window.Store, C = window.C;
  const V = (window.Views = window.Views || {});

  let parsed = null; // { headers, rows, filename }
  let domainCol = null;

  function parseCSV(text) {
    const rows = [];
    let cur = [], field = '', inQ = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQ) {
        if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
        else field += ch;
      } else {
        if (ch === '"') inQ = true;
        else if (ch === ',') { cur.push(field); field = ''; }
        else if (ch === '\n') { cur.push(field); rows.push(cur); cur = []; field = ''; }
        else if (ch === '\r') { /* skip */ }
        else field += ch;
      }
    }
    if (field.length || cur.length) { cur.push(field); rows.push(cur); }
    return rows.filter(r => r.length && r.some(c => c.trim() !== ''));
  }

  const DOMRE = /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  function cleanDomain(s) {
    return (s || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[\/?#].*$/, '').replace(/:\d+$/, '');
  }
  function guessDomainCol(headers, rows) {
    const names = ['domain', 'url', 'situs', 'alamat', 'link', 'website'];
    for (let i = 0; i < headers.length; i++) if (names.some(n => headers[i].toLowerCase().indexOf(n) >= 0)) return i;
    // fallback: column with most domain-like values
    let best = 0, bestScore = -1;
    for (let c = 0; c < headers.length; c++) {
      let s = 0; for (let r = 0; r < Math.min(rows.length, 20); r++) if (DOMRE.test(cleanDomain((rows[r] || [])[c]))) s++;
      if (s > bestScore) { bestScore = s; best = c; }
    }
    return best;
  }

  function ingestFrom(headers, dataRows, filename) {
    parsed = { headers: headers, rows: dataRows, filename: filename };
    domainCol = guessDomainCol(headers, dataRows);
    rerenderPreview();
  }

  function rerenderPreview() {
    const el = U.$('#ingest-preview');
    if (!el || !parsed) return;
    const headers = parsed.headers, rows = parsed.rows;
    let valid = 0, invalid = 0;
    const flags = rows.map(function (r) { const ok = DOMRE.test(cleanDomain(r[domainCol])); if (ok) valid++; else invalid++; return ok; });

    const mapping = headers.map((h, i) => '<option value="' + i + '"' + (i === domainCol ? ' selected' : '') + '>' + U.esc(h || ('kolom ' + (i + 1))) + '</option>').join('');
    const previewRows = rows.slice(0, 8).map(function (r, ri) {
      return '<tr>' + headers.map((h, ci) => '<td class="' + (ci === domainCol ? 'domain' : 'mono sm') + '">' + U.esc(r[ci] || '') + '</td>').join('') +
        '<td>' + (flags[ri] ? '<span class="badge badge-bukan"><span class="bdot"></span>valid</span>' : '<span class="badge badge-review"><span class="bdot"></span>tinjau</span>') + '</td></tr>';
    }).join('');

    el.innerHTML =
      '<div class="card"><div class="card-head"><h3>' + U.icon('check') + 'Pratinjau &amp; Validasi</h3><span class="sub">' + U.esc(parsed.filename) + ' · ' + rows.length + ' baris</span></div>' +
      '<div class="card-body">' +
        '<div class="row wrap gap-4 mb-4">' +
          '<div class="mapping"><span class="field-label">Kolom domain</span><select class="select" id="map-domain" style="min-width:200px">' + mapping + '</select></div>' +
          '<div class="valstat"><div class="vs ok"><b>' + U.fmtNum(valid) + '</b> valid</div><div class="vs warn"><b>' + U.fmtNum(invalid) + '</b> perlu ditinjau</div></div>' +
        '</div>' +
        '<div class="table-wrap"><table class="tbl"><thead><tr>' + headers.map(h => '<th>' + U.esc(h || '—') + '</th>').join('') + '<th>Status</th></tr></thead><tbody>' + previewRows + '</tbody></table></div>' +
        '<div class="help">Menampilkan 8 dari ' + rows.length + ' baris. Baris tak valid tidak dibuang — ditandai untuk ditinjau analis.</div>' +
        '<div class="row gap-2 mt-4">' +
          C.gate('import', '<button class="btn btn-primary" id="do-import">' + U.icon('upload2') + 'Impor ' + U.fmtNum(valid) + ' baris valid</button>', 'Peran Anda tidak dapat mengimpor data') +
          '<button class="btn btn-ghost" id="cancel-import">Batal</button>' +
        '</div>' +
      '</div></div>';

    const sel = U.$('#map-domain');
    if (sel) sel.addEventListener('change', function () { domainCol = parseInt(sel.value, 10); rerenderPreview(); });
    const doBtn = U.$('#do-import');
    if (doBtn && !doBtn.disabled) doBtn.addEventListener('click', function () {
      const map = {}; map.domain = headers[domainCol] || 'kolom ' + (domainCol + 1);
      const res = Store.addImport({ filename: parsed.filename, rows: rows.length, valid: valid, invalid: invalid, mapping: map });
      if (res.ok) { parsed = null; C.toast('Impor selesai', valid + ' baris masuk · ' + res.queued + ' kandidat ke antrean review', 'ok'); }
    });
    const cancel = U.$('#cancel-import');
    if (cancel) cancel.addEventListener('click', function () { parsed = null; U.$('#ingest-preview').innerHTML = ''; });
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function downloadTemplate() {
    const csv = 'domain,keterangan,sumber_aduan,tanggal\n' +
      'contohslotgacor88.xyz,dilaporkan warga,aduan_masyarakat,2026-07-18\n' +
      'maxwin-example.top,patroli siber,patroli_internal,2026-07-19\n' +
      'toto-contoh4d.live,temuan mitra,mitra_kominfo,2026-07-20\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'template_ingestion_sapubersih.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    C.toast('Template diunduh', 'template_ingestion_sapubersih.csv', 'ok');
  }

  function loadSample() {
    const headers = ['url', 'keterangan', 'sumber_aduan', 'tanggal'];
    const bases = ['slotgacor', 'maxwin', 'zeus', 'olympus', 'toto4d', 'togel', 'hokijp', 'sultanslot', 'cuanbet', 'rungkad'];
    const tlds = ['.xyz', '.top', '.live', '.vip', '.click', '.icu'];
    const rows = [];
    for (let i = 0; i < 24; i++) {
      const bad = (i % 9 === 0);
      const dom = bad ? ('bukan domain #' + i) : (bases[i % bases.length] + (10 + i) + tlds[i % tlds.length]);
      rows.push([(Math.random() > .5 ? 'https://' : '') + dom, 'aduan warga', 'aduan_masyarakat', '2026-07-' + (10 + (i % 12))]);
    }
    ingestFrom(headers, rows, 'aduan_masyarakat_contoh.csv');
  }

  V.ingestion = {
    render: function () {
      const st = Store.get();
      const imports = st.imports;
      const totalRows = imports.reduce((a, i) => a + i.rows, 0);

      return '' +
      '<div class="section-head"><div class="lhs"><div class="eyebrow">Menjawab kebutuhan langsung Komdigi</div>' +
        '<h2>Ingestion Data</h2>' +
        '<p class="desc">Apa pun daftar yang Bapak/Ibu miliki hari ini — domain, URL, atau aduan — dapat masuk dan langsung diproses melalui pipeline yang sama. Tidak perlu format khusus.</p></div>' +
        '<div class="rhs"><button class="btn btn-secondary" id="tpl-btn">' + U.icon('download') + 'Unduh Template CSV</button></div>' +
      '</div>' +

      '<div class="callout brand mb-5">' + U.icon('info') + '<span><b>Pesan kunci:</b> daftar domain Komdigi cukup diunggah sebagai CSV/Excel — sistem memvalidasi, memetakan kolom, menangkap bukti, lalu memasukkannya ke antrean review analis. Berlaku efektif seketika.</span></div>' +

      // uploader
      '<div class="card mb-4"><div class="card-body">' +
        '<div class="dropzone" id="dropzone">' +
          '<div class="dz-ico">' + U.icon('upload2') + '</div>' +
          '<div class="dz-title">Seret berkas CSV/Excel ke sini, atau klik untuk memilih</div>' +
          '<div class="dz-sub faint">Kolom bebas — sistem mendeteksi kolom domain otomatis. Diproses lokal di peramban, tanpa unggah ke server.</div>' +
          '<div class="row gap-2 mt-4"><button class="btn btn-primary" id="pick-btn">' + U.icon('upload2') + 'Pilih Berkas</button>' +
          '<button class="btn btn-secondary" id="sample-btn">' + U.icon('database') + 'Gunakan Berkas Contoh</button></div>' +
          '<input type="file" id="file-input" accept=".csv,.txt,.tsv" hidden />' +
        '</div>' +
      '</div></div>' +

      '<div id="ingest-preview" class="mb-5"></div>' +

      // history + phase 2
      '<div class="grid" style="grid-template-columns:1.4fr 1fr">' +
        '<div class="card"><div class="card-head"><h3>' + U.icon('clock') + 'Riwayat Impor</h3><span class="sub">' + imports.length + ' impor · ' + U.fmtNum(totalRows) + ' baris total</span></div>' +
          '<div class="card-body" style="padding:0">' +
          '<div class="table-wrap"><table class="tbl"><thead><tr><th>ID</th><th>Berkas</th><th class="num">Baris</th><th class="num">Valid</th><th>Waktu</th><th>Oleh</th></tr></thead><tbody>' +
          imports.map(function (im) {
            return '<tr><td class="mono sm">' + U.esc(im.id) + '</td><td class="sm">' + U.esc(im.filename) + '</td>' +
              '<td class="num mono">' + U.fmtNum(im.rows) + '</td><td class="num mono">' + U.fmtNum(im.valid) + '</td>' +
              '<td class="sm faint">' + U.fmtDateTime(im.at) + '</td><td class="sm">' + C.avatar(im.by) + ' ' + U.esc(im.by.split(' ')[0]) + '</td></tr>';
          }).join('') +
          '</tbody></table></div></div></div>' +

        '<div class="card"><div class="card-head"><h3>' + U.icon('link') + 'Antarmuka Lain</h3><span class="sub">terdokumentasi</span></div>' +
          '<div class="card-body stack-3">' +
          '<div class="slot"><div class="slot-h">' + U.icon('server') + '<span class="b">API / Feed Otomatis</span><span class="badge badge-plain">Tersedia</span></div>' +
            '<p class="muted sm">Endpoint ingest untuk aliran domain/URL terus-menerus dari sistem mitra (mis. patroli siber). Format JSON, autentikasi token.</p>' +
            '<code class="endpoint">POST /api/v1/ingest · {domain, sumber, catatan}</code></div>' +
          '<div class="slot phase2"><div class="slot-h">' + U.icon('globe') + '<span class="b">Data Media Sosial Berlisensi</span><span class="badge badge-review">Fase 2</span></div>' +
            '<p class="muted sm">Slot terdokumentasi untuk data media sosial berlisensi/resmi (mis. promosi judi di platform) — diaktifkan setelah perjanjian data & kepatuhan.</p></div>' +
          '<div class="slot phase2"><div class="slot-h">' + U.icon('flag') + '<span class="b">Portal Aduan Masyarakat</span><span class="badge badge-review">Fase 2</span></div>' +
            '<p class="muted sm">Kanal aduan publik yang otomatis masuk sebagai kandidat untuk diverifikasi analis.</p></div>' +
          '</div></div>' +
      '</div>';
    },

    mount: function (root) {
      U.$('#tpl-btn', root).addEventListener('click', downloadTemplate);
      U.$('#sample-btn', root).addEventListener('click', loadSample);
      const fileInput = U.$('#file-input', root);
      const pick = U.$('#pick-btn', root);
      const dz = U.$('#dropzone', root);
      pick.addEventListener('click', function () { fileInput.click(); });
      dz.addEventListener('click', function (e) { if (e.target === dz || e.target.classList.contains('dz-title') || e.target.classList.contains('dz-sub') || e.target.classList.contains('dz-ico')) fileInput.click(); });
      fileInput.addEventListener('change', function () { if (fileInput.files[0]) readFile(fileInput.files[0]); });
      ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('drag'); }));
      ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('drag'); }));
      dz.addEventListener('drop', function (e) { const f = e.dataTransfer.files[0]; if (f) readFile(f); });

      function readFile(f) {
        const reader = new FileReader();
        reader.onload = function () {
          const rows = parseCSV(String(reader.result));
          if (rows.length < 2) { C.toast('Berkas kosong', 'Tidak ada baris data terbaca', 'warn'); return; }
          ingestFrom(rows[0], rows.slice(1), f.name);
        };
        reader.readAsText(f);
      }

      if (parsed) rerenderPreview();
    }
  };
})();
