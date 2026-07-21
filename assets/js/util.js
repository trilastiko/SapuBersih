/* ==========================================================================
   util.js — DOM helpers, formatting (Bahasa Indonesia), PRNG, icons
   Exposes: window.U
   ========================================================================== */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Build an element from HTML string (first node)
  function fromHTML(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  // Deterministic PRNG (mulberry32) — stable demo data across resets
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const rint = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

  // Numbers — Indonesian grouping (thousands with ".")
  function fmtNum(n) {
    if (n === null || n === undefined || isNaN(n)) return '–';
    const s = Math.round(n).toString();
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function fmtPct(n, d) { return (n).toFixed(d === undefined ? 0 : d).replace('.', ',') + '%'; }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function toDate(x) { return (x instanceof Date) ? x : new Date(x); }
  // Force Western Indonesia Time (WIB, UTC+7) regardless of the host machine's timezone,
  // so displayed clocks/timestamps are always coherent with the "WIB" label on any laptop.
  function wib(x) { return new Date(toDate(x).getTime() + 7 * 3600e3); }

  function fmtDate(x) { const d = wib(x); return pad(d.getUTCDate()) + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
  function fmtDateFull(x) { const d = wib(x); return DAYS[d.getUTCDay()] + ', ' + d.getUTCDate() + ' ' + MONTHS_FULL[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
  function fmtTime(x) { const d = wib(x); return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()); }
  function fmtTimeS(x) { const d = wib(x); return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()); }
  function fmtDateTime(x) { return fmtDate(x) + ' · ' + fmtTime(x); }
  function fmtStamp(x) { const d = wib(x); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' ' + fmtTimeS(x) + ' WIB'; }

  function timeAgo(x, now) {
    const d = toDate(x).getTime();
    const t = (now ? toDate(now).getTime() : Date.now());
    const s = Math.max(0, Math.floor((t - d) / 1000));
    if (s < 60) return s + ' dtk lalu';
    const m = Math.floor(s / 60); if (m < 60) return m + ' mnt lalu';
    const h = Math.floor(m / 60); if (h < 24) return h + ' jam lalu';
    const dd = Math.floor(h / 24); if (dd < 30) return dd + ' hari lalu';
    const mo = Math.floor(dd / 30); if (mo < 12) return mo + ' bln lalu';
    return Math.floor(mo / 12) + ' thn lalu';
  }

  // Consistent avatar color from a string
  function avatarColor(s) {
    const palette = ['#2E7CD6', '#D23B4E', '#3FA981', '#D99A2B', '#B36AD9', '#4B93E8', '#0EA5A5'];
    let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return palette[h % palette.length];
  }
  function initials(name) {
    const p = name.trim().split(/\s+/);
    return ((p[0] || '')[0] || '') + ((p[1] || '')[0] || (p[0] || '')[1] || '');
  }

  function debounce(fn, ms) { let t; return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(() => fn.apply(c, a), ms || 200); }; }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  // -------- Icons (inline SVG, stroke = currentColor) --------
  const P = {
    beranda: '<path d="M3 12l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    penemuan: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="8"/>',
    ingestion: '<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 20h16"/>',
    klasifikasi: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6M9 13h6M9 17h3"/><circle cx="16.5" cy="7.5" r="1"/>',
    jaringan: '<circle cx="12" cy="5" r="2.4"/><circle cx="5" cy="18" r="2.4"/><circle cx="19" cy="18" r="2.4"/><path d="M12 7.4V13M10.2 14.4L6.6 16.4M13.8 14.4l3.6 2"/><circle cx="12" cy="13" r="1.4"/>',
    review: '<path d="M4 5h16v11H8l-4 3z"/><path d="M8 9h8M8 12h5"/>',
    monitoring: '<path d="M3 12h4l2 6 4-12 2 6h6"/>',
    laporan: '<path d="M7 3h7l4 4v14H7z" transform="translate(-1 0)"/><path d="M13 3v4h4"/><path d="M8 12h6M8 16h6"/>',
    audit: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9.5 12l1.8 1.8 3.4-3.6"/>',
    pengaturan: '<path d="M4 7h10M18 7h2M4 12h2M10 12h10M4 17h6M14 17h6"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="12" cy="17" r="2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 6.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    alert: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17.5v.5"/>',
    caret: '<path d="M6 9l6 6 6-6"/>',
    chevronR: '<path d="M9 6l6 6-6 6"/>',
    chevronL: '<path d="M15 6l-6 6 6 6"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
    database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    cert: '<circle cx="12" cy="9" r="5"/><path d="M9 13l-1.5 7L12 18l4.5 2L15 13"/><path d="M10 9l1.5 1.5L14.5 7"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17"/>',
    hash: '<path d="M9 4L7 20M17 4l-2 16M4 9h16M3 15h16"/>',
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/>',
    external: '<path d="M14 4h6v6M20 4l-8 8"/><path d="M18 14v5H5V6h5"/>',
    download: '<path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 20h14"/>',
    printer: '<path d="M7 9V4h10v5"/><path d="M5 9h14a2 2 0 012 2v6h-4v-4H7v4H3v-6a2 2 0 012-2z"/><path d="M7 17h10v3H7z"/>',
    play: '<path d="M7 5l12 7-12 7z"/>',
    refresh: '<path d="M4 12a8 8 0 0113.7-5.6L20 8M20 4v4h-4"/><path d="M20 12a8 8 0 01-13.7 5.6L4 16M4 20v-4h4"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    eye: '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    filter: '<path d="M3 5h18l-7 8v5l-4 2v-7z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    pin: '<path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/>',
    up: '<path d="M4 17l6-6 4 4 6-8"/><path d="M16 7h4v4"/>',
    down: '<path d="M4 7l6 6 4-4 6 8"/><path d="M16 17h4v-4"/>',
    zap: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
    fingerprint: '<path d="M12 11a2 2 0 012 2c0 2.5-.5 4.5-1 6"/><path d="M8.5 8.5A5 5 0 0117 13c0 1-.1 2-.3 3"/><path d="M6 13a6 6 0 019-5.2"/><path d="M12 13c0 3-.6 5.5-1.5 7.5"/>',
    server: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h.01M8 16.5h.01"/>',
    link: '<path d="M9 15l6-6"/><path d="M11 6l1-1a4 4 0 015.7 5.7l-2 2"/><path d="M13 18l-1 1A4 4 0 016.3 13.3l2-2"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.5"/>',
    arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/>',
    flag: '<path d="M6 21V4h11l-2 4 2 4H6"/>',
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    star: '<path d="M12 4l2.4 5 5.6.6-4.2 3.8 1.2 5.6L12 16.9 6.9 19l1.2-5.6L4 9.6 9.6 9z"/>',
    branch: '<circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="8" r="2.4"/><path d="M6 8.4v7.2M6 12h6a4 4 0 004-4"/>',
    upload2: '<path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/><path d="M12 4v12M7 9l5-5 5 5"/>',
    sliders: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="var(--surface)"/><circle cx="15" cy="12" r="2" fill="var(--surface)"/><circle cx="8" cy="18" r="2" fill="var(--surface)"/>',
    key: '<circle cx="8" cy="14" r="4"/><path d="M11 11l8-8M17 5l2 2M14 8l2 2"/>',
    dot: '<circle cx="12" cy="12" r="4"/>',
    warnTri: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17.5v.5"/>'
  };

  function icon(name, cls) {
    const p = P[name] || P.dot;
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }

  window.U = {
    $, $$, esc, fromHTML, rng, pick, rint, fmtNum, fmtPct,
    fmtDate, fmtDateFull, fmtTime, fmtTimeS, fmtDateTime, fmtStamp, timeAgo, wib,
    avatarColor, initials, debounce, clamp, icon, pad,
    MONTHS, MONTHS_FULL, DAYS
  };
})();
