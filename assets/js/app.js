/* ==========================================================================
   app.js — shell, navigation, router, topbar, boot. Exposes: window.App
   ========================================================================== */
(function () {
  'use strict';
  const U = window.U, Store = window.Store, C = window.C;

  const NAV = [
    { group: 'Operasi', items: [
      { id: 'beranda', label: 'Beranda', icon: 'beranda' },
      { id: 'penemuan', label: 'Penemuan', icon: 'penemuan' },
      { id: 'ingestion', label: 'Ingestion Data', icon: 'ingestion' },
      { id: 'klasifikasi', label: 'Klasifikasi AI', icon: 'klasifikasi' },
      { id: 'review', label: 'Antrean Review', icon: 'review', count: 'antrean', alert: true }
    ]},
    { group: 'Analisis', items: [
      { id: 'jaringan', label: 'Peta Jaringan', icon: 'jaringan', count: 'clusterAktif' },
      { id: 'monitoring', label: 'Monitoring', icon: 'monitoring' }
    ]},
    { group: 'Keluaran', items: [
      { id: 'laporan', label: 'Laporan & Dosir', icon: 'laporan' }
    ]},
    { group: 'Tata Kelola', items: [
      { id: 'audit', label: 'Audit Log', icon: 'audit' },
      { id: 'pengaturan', label: 'Pengaturan', icon: 'pengaturan' }
    ]}
  ];
  const META = {
    beranda: { crumb: 'Operasi', title: 'Beranda — Command Dashboard' },
    penemuan: { crumb: 'Operasi', title: 'Penemuan — Discovery Multi-Sumber' },
    ingestion: { crumb: 'Operasi', title: 'Ingestion Data' },
    klasifikasi: { crumb: 'Operasi', title: 'Klasifikasi AI' },
    review: { crumb: 'Operasi', title: 'Antrean Review Analis' },
    jaringan: { crumb: 'Analisis', title: 'Peta Jaringan — Cluster Mirror' },
    monitoring: { crumb: 'Analisis', title: 'Monitoring & Siklus Hidup' },
    laporan: { crumb: 'Keluaran', title: 'Laporan & Dosir Bukti' },
    audit: { crumb: 'Tata Kelola', title: 'Audit Log' },
    pengaturan: { crumb: 'Tata Kelola', title: 'Pengaturan' }
  };

  let current = 'beranda';
  let currentMount = null;

  function routeId() { const h = (location.hash || '').replace(/^#\/?/, ''); return META[h] ? h : 'beranda'; }

  function renderSidebar() {
    const c = Store.counts();
    const sb = document.getElementById('sidebar');
    const st = Store.get();
    let html = '<div class="brand"><div class="brand-logo">' +
      '<svg viewBox="0 0 32 32" fill="none"><path d="M6 21 L16 7 L26 21" stroke="var(--brand)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/><circle cx="16" cy="23.5" r="2.6" fill="var(--accent)"/></svg>' +
      '</div><div><div class="brand-name">' + U.esc(st.settings.brandName) + '</div><div class="brand-sub">oleh ' + U.esc(st.settings.vendor) + ' · Komdigi</div></div></div>';
    html += '<nav class="nav">';
    NAV.forEach(function (grp) {
      html += '<div class="nav-group"><div class="nav-group-label">' + U.esc(grp.group) + '</div>';
      grp.items.forEach(function (it) {
        const active = it.id === current ? ' active' : '';
        let count = '';
        if (it.count && c[it.count] != null) count = '<span class="nav-count' + (it.alert && c[it.count] > 0 ? ' alert' : '') + '">' + U.fmtNum(c[it.count]) + '</span>';
        html += '<a class="nav-item' + active + '" href="#/' + it.id + '">' + U.icon(it.icon) + '<span>' + U.esc(it.label) + '</span>' + count + '</a>';
      });
      html += '</div>';
    });
    html += '</nav>';
    html += '<div class="sidebar-foot"><div class="env-pill"><span class="env-dot"></span><span>Mode Lokal · Offline</span></div>' +
      '<div class="env-pill mt-2 muted"><span class="faint mono" style="font-size:10px">Tanpa API key · Tanpa internet</span></div></div>';
    sb.innerHTML = html;
  }

  function renderTopbar() {
    const tb = document.getElementById('topbar');
    const u = Store.currentUser();
    const st = Store.get();
    const m = META[current];
    tb.innerHTML =
      '<div class="tb-title"><div class="tb-crumb">' + U.esc(m.crumb) + '</div><div class="tb-h">' + U.esc(m.title) + '</div></div>' +
      '<div class="tb-spacer"></div>' +
      '<div class="tb-actions">' +
        '<span class="demo-badge"><span class="dot"></span>MODE DEMO — DATA SINTETIS</span>' +
        '<span class="tb-divider"></span>' +
        '<span class="tb-clock" id="tb-clock">' + U.fmtTimeS(Store.clock()) + ' WIB</span>' +
        '<span class="tb-divider"></span>' +
        '<button class="iconbtn" id="theme-toggle" title="Ganti tampilan (white-label)">' + U.icon(st.settings.theme === 'kode' ? 'globe' : 'shield') + '</button>' +
        '<button class="control" id="role-switch">' +
          '<span class="role-avatar" style="background:' + U.avatarColor(u.name) + '">' + U.esc(U.initials(u.name).toUpperCase()) + '</span>' +
          '<span><small>' + U.esc(st.roleLabel[u.role]) + '</small><span class="role-name">' + U.esc(u.name) + '</span></span>' +
          U.icon('caret', 'caret') +
        '</button>' +
      '</div>';
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('role-switch').addEventListener('click', openRoleMenu);
  }

  function toggleTheme() {
    const st = Store.get();
    Store.setTheme(st.settings.theme === 'kode' ? 'komdigi' : 'kode');
    C.toast('Tampilan diganti', st.settings.theme === 'kode' ? 'Tema: KODE Command (gelap)' : 'Tema: Komdigi Netral (terang)', 'ok');
  }

  function openRoleMenu(e) {
    e.stopPropagation();
    const st = Store.get();
    const btn = document.getElementById('role-switch');
    const rect = btn.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.className = 'dropdown';
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.innerHTML = '<div class="dd-head">Beralih perspektif peran <span class="faint">(mode demo)</span></div>' +
      st.users.map(function (usr) {
        const active = usr.id === st.settings.activeUserId ? ' active' : '';
        return '<button class="dd-item' + active + '" data-uid="' + usr.id + '">' +
          '<span class="role-avatar" style="background:' + U.avatarColor(usr.name) + ';width:26px;height:26px">' + U.esc(U.initials(usr.name).toUpperCase()) + '</span>' +
          '<span class="grow"><span class="b">' + U.esc(usr.name) + '</span><span class="faint sm" style="display:block;line-height:1.2">' + U.esc(st.roleLabel[usr.role]) + ' · ' + U.esc(usr.title) + '</span></span>' +
          (active ? U.icon('check') : '') + '</button>';
      }).join('') +
      '<div class="dd-foot faint">Peran menentukan aksi yang tersedia. “Pimpinan” bersifat hanya-baca.</div>';
    document.body.appendChild(menu);
    function close() { menu.remove(); document.removeEventListener('click', close); }
    U.$$('.dd-item', menu).forEach(function (b) {
      b.addEventListener('click', function () {
        Store.setRole(b.dataset.uid);
        const usr = st.users.find(x => x.id === b.dataset.uid);
        C.toast('Beralih peran', usr.name + ' · ' + st.roleLabel[usr.role], 'ok');
        close();
      });
    });
    setTimeout(() => document.addEventListener('click', close), 0);
  }

  let cleanups = [];
  function runCleanups() { cleanups.forEach(function (fn) { try { fn(); } catch (e) {} }); cleanups = []; }
  function onCleanup(fn) { cleanups.push(fn); }

  function renderView() {
    runCleanups();
    const view = window.Views[current];
    const el = document.getElementById('view');
    if (!view) { el.innerHTML = '<div class="empty">Halaman tidak ditemukan.</div>'; return; }
    el.innerHTML = view.render();
    el.scrollTop = 0;
    document.getElementById('main').scrollTop = 0;
    currentMount = view.mount || null;
    if (currentMount) { try { currentMount(el); } catch (e) { console.error('mount error', e); } }
  }

  function route() {
    // Navigating always dismisses any open overlay (e.g. a dossier drawer whose
    // footer CTA links to another screen) so it can't linger over the new view.
    if (window.C) { C.closeDrawer(); C.closeModal(); }
    current = routeId();
    renderSidebar();
    renderTopbar();
    renderView();
  }

  // Re-render sidebar counts + current view on store mutations
  let rerenderPending = false;
  function onStoreChange() {
    if (rerenderPending) return;
    rerenderPending = true;
    requestAnimationFrame(function () {
      rerenderPending = false;
      renderSidebar();
      renderTopbar();
      renderView();
    });
  }

  function startClock() {
    setInterval(function () {
      const el = document.getElementById('tb-clock');
      if (el) el.textContent = U.fmtTimeS(Store.clock()) + ' WIB';
    }, 1000);
  }

  function boot() {
    Store.load();
    document.documentElement.setAttribute('data-theme', Store.get().settings.theme);
    const boot = document.getElementById('boot');
    const root = document.getElementById('root');
    // brief boot splash for polish
    setTimeout(function () {
      root.hidden = false;
      route();
      Store.subscribe(onStoreChange);
      window.addEventListener('hashchange', route);
      startClock();
      boot.style.transition = 'opacity .4s'; boot.style.opacity = '0';
      setTimeout(() => boot.remove(), 420);
    }, 480);
  }

  function refreshChrome() { renderSidebar(); renderTopbar(); }
  window.App = { boot: boot, go: function (id) { location.hash = '#/' + id; }, onCleanup: onCleanup, refreshChrome: refreshChrome, refreshView: renderView };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
