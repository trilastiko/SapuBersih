/* ==========================================================================
   charts.js — Dependency-free inline-SVG charts. Exposes: window.Charts
   ========================================================================== */
(function () {
  'use strict';
  const U = window.U;
  let _uid = 0;
  const uid = () => 'c' + (++_uid);

  function niceMax(v) {
    if (v <= 5) return 5;
    const pow = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / pow;
    const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return step * pow;
  }
  function path(points) { return points.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' '); }

  // Trend area chart: data = [{t, temuan, terkonfirmasi}]
  function trend(data, opts) {
    opts = opts || {};
    const W = 720, H = 240, pl = 38, pr = 14, pt = 16, pb = 26;
    const iw = W - pl - pr, ih = H - pt - pb;
    const maxV = niceMax(Math.max.apply(null, data.map(d => d.temuan)) * 1.05);
    const n = data.length;
    const x = i => pl + (iw * i) / (n - 1);
    const y = v => pt + ih - (ih * v) / maxV;
    const id = uid();

    const pT = data.map((d, i) => [x(i), y(d.temuan)]);
    const pK = data.map((d, i) => [x(i), y(d.terkonfirmasi)]);
    const areaT = path(pT) + ' L' + x(n - 1).toFixed(1) + ' ' + (pt + ih) + ' L' + x(0).toFixed(1) + ' ' + (pt + ih) + ' Z';

    // gridlines + y labels
    let grid = '';
    const steps = 4;
    for (let s = 0; s <= steps; s++) {
      const val = (maxV / steps) * s; const yy = y(val);
      grid += '<line x1="' + pl + '" y1="' + yy.toFixed(1) + '" x2="' + (W - pr) + '" y2="' + yy.toFixed(1) + '" stroke="var(--chart-grid)" stroke-width="1"/>';
      grid += '<text x="' + (pl - 8) + '" y="' + (yy + 3).toFixed(1) + '" text-anchor="end" class="cx-axis">' + U.fmtNum(val) + '</text>';
    }
    // x labels (every ~6th)
    let xl = '';
    for (let i = 0; i < n; i += 6) {
      const dt = U.wib(data[i].t);
      xl += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" class="cx-axis">' + U.pad(dt.getUTCDate()) + ' ' + U.MONTHS[dt.getUTCMonth()] + '</text>';
    }
    const lastT = pT[n - 1], lastK = pK[n - 1];

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart" preserveAspectRatio="none" role="img" aria-label="Tren 30 hari">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.28"/>' +
      '<stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>' +
      grid + xl +
      '<path d="' + areaT + '" fill="url(#' + id + ')"/>' +
      '<path d="' + path(pT) + '" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<path d="' + path(pK) + '" fill="none" stroke="var(--brand)" stroke-width="2.2" stroke-dasharray="1 5" stroke-linecap="round"/>' +
      '<circle cx="' + lastT[0].toFixed(1) + '" cy="' + lastT[1].toFixed(1) + '" r="3.5" fill="var(--accent)"/>' +
      '<circle cx="' + lastK[0].toFixed(1) + '" cy="' + lastK[1].toFixed(1) + '" r="3.5" fill="var(--brand)"/>' +
      '</svg>';
  }

  // Horizontal bars: items = [{label, value, max, color, sub, pct}]
  function hbars(items, opts) {
    opts = opts || {};
    const max = opts.max || Math.max.apply(null, items.map(i => i.value)) || 1;
    return '<div class="hbars">' + items.map(function (it) {
      const w = Math.max(2, (it.value / max) * 100);
      const color = it.color || 'var(--accent)';
      return '<div class="hbar-row">' +
        '<div class="hbar-label">' + (it.icon ? U.icon(it.icon) : '') + '<span>' + U.esc(it.label) + '</span></div>' +
        '<div class="hbar-track"><span style="width:' + w.toFixed(1) + '%;background:' + color + '"></span></div>' +
        '<div class="hbar-val">' + U.fmtNum(it.value) + (it.sub ? '<em>' + U.esc(it.sub) + '</em>' : '') + '</div>' +
        '</div>';
    }).join('') + '</div>';
  }

  // Donut: segments = [{label, value, color}]
  function donut(segments, opts) {
    opts = opts || {};
    const total = segments.reduce((a, s) => a + s.value, 0) || 1;
    const R = 54, C = 2 * Math.PI * R, cx = 70, cy = 70;
    let acc = 0;
    const arcs = segments.map(function (s) {
      const frac = s.value / total;
      const dash = frac * C;
      const seg = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="' + s.color + '" stroke-width="16" ' +
        'stroke-dasharray="' + dash.toFixed(2) + ' ' + (C - dash).toFixed(2) + '" stroke-dashoffset="' + (-acc).toFixed(2) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')" stroke-linecap="butt"/>';
      acc += dash; return seg;
    }).join('');
    const center = opts.centerLabel || '';
    const centerSub = opts.centerSub || '';
    return '<div class="donut-wrap"><svg viewBox="0 0 140 140" class="donut" role="img" aria-label="Distribusi status">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="var(--surface-3)" stroke-width="16"/>' +
      arcs +
      '<text x="70" y="66" text-anchor="middle" class="donut-c">' + U.esc(center) + '</text>' +
      '<text x="70" y="84" text-anchor="middle" class="donut-s">' + U.esc(centerSub) + '</text>' +
      '</svg>' +
      '<div class="donut-legend">' + segments.map(s => '<div class="dl"><span class="dot" style="background:' + s.color + '"></span>' + U.esc(s.label) + '<b>' + U.fmtNum(s.value) + '</b></div>').join('') + '</div>' +
      '</div>';
  }

  // Sparkline: values = [n,...]
  function spark(values, opts) {
    opts = opts || {};
    const W = 120, H = 34, p = 2;
    const max = Math.max.apply(null, values), min = Math.min.apply(null, values);
    const rng = (max - min) || 1;
    const x = i => p + ((W - 2 * p) * i) / (values.length - 1);
    const y = v => p + (H - 2 * p) * (1 - (v - min) / rng);
    const pts = values.map((v, i) => [x(i), y(v)]);
    const color = opts.color || 'var(--accent)';
    const area = path(pts) + ' L' + x(values.length - 1).toFixed(1) + ' ' + (H - p) + ' L' + p + ' ' + (H - p) + ' Z';
    const id = uid();
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="spark" preserveAspectRatio="none">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + color + '" stop-opacity="0.25"/><stop offset="100%" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#' + id + ')"/>' +
      '<path d="' + path(pts) + '" fill="none" stroke="' + color + '" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  }

  // Segmented stacked bar: segments = [{label,value,color}]
  function segbar(segments) {
    const total = segments.reduce((a, s) => a + s.value, 0) || 1;
    const bar = segments.map(s => '<span style="width:' + ((s.value / total) * 100).toFixed(2) + '%;background:' + s.color + '" title="' + U.esc(s.label) + ': ' + s.value + '"></span>').join('');
    const legend = segments.map(s => '<div class="dl"><span class="dot" style="background:' + s.color + '"></span>' + U.esc(s.label) + '<b>' + U.fmtNum(s.value) + '</b></div>').join('');
    return '<div class="segbar">' + bar + '</div><div class="segbar-legend">' + legend + '</div>';
  }

  window.Charts = { trend, hbars, donut, spark, segbar };
})();
