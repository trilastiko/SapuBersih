/* views-settings.js — Pengaturan (white-label, thresholds, lexicon, sources, roles, scope, reset) */
(function () {
  'use strict';
  const U = window.U, Store = window.Store, C = window.C;
  const V = (window.Views = window.Views || {});

  const PERM_MATRIX = [
    ['Meninjau bukti', ['pimpinan', 'analis', 'admin', 'super_admin']],
    ['Memutuskan (konfirmasi)', ['analis', 'admin', 'super_admin']],
    ['Menjalankan penemuan', ['analis', 'admin', 'super_admin']],
    ['Impor / ingestion data', ['analis', 'admin', 'super_admin']],
    ['Ubah leksikon', ['admin', 'super_admin']],
    ['Ubah pengaturan / ambang', ['admin', 'super_admin']],
    ['Ubah cakupan deteksi', ['super_admin']],
    ['Kelola peran', ['super_admin']]
  ];
  const ROLES = ['pimpinan', 'analis', 'admin', 'super_admin'];

  V.pengaturan = {
    render: function () {
      const st = Store.get();
      const canSet = Store.can('settings');
      const canLex = Store.can('lexicon');
      const canScope = Store.can('scope');

      return '' +
      '<div class="section-head"><div class="lhs"><div class="eyebrow">Tata kelola &amp; konfigurasi</div>' +
        '<h2>Pengaturan</h2>' +
        '<p class="desc">Kendali platform: tampilan white-label, ambang keyakinan, leksikon, sumber, cakupan deteksi, dan peran. Setiap perubahan tercatat di Audit Log.</p></div>' +
        '<div class="rhs">' + C.gate('reset', '<button class="btn btn-secondary" id="reset-btn">' + U.icon('refresh') + 'Reset Data Demo</button>', '') + '</div>' +
      '</div>' +

      '<div class="grid grid-2" style="align-items:start">' +

        // white-label
        '<div class="card"><div class="card-head"><h3>' + U.icon('eye') + 'Tampilan &amp; White-label</h3></div><div class="card-body">' +
          '<p class="muted sm mb-3">Platform dapat diberi merek sesuai penyelenggara. Untuk Komdigi tersedia tema netral pemerintahan.</p>' +
          '<div class="theme-picker">' +
            themeCard('kode', 'KODE Command', 'Gelap · pusat komando', st.settings.theme === 'kode') +
            themeCard('komdigi', 'Komdigi Netral', 'Terang · dokumen resmi', st.settings.theme === 'komdigi') +
          '</div>' +
          '<div class="stack-3 mt-4">' +
            field('Nama produk', 'brandName', st.settings.brandName, canSet) +
            field('Penyelenggara / vendor', 'vendor', st.settings.vendor, canSet) +
          '</div>' +
        '</div></div>' +

        // thresholds
        '<div class="card"><div class="card-head"><h3>' + U.icon('sliders') + 'Ambang Keyakinan &amp; Interval</h3></div><div class="card-body">' +
          slider('confReviewThreshold', 'Ambang auto-antrean review', st.settings.confReviewThreshold, 0, 100, '%', 'Di bawah nilai ini, kandidat otomatis diprioritaskan untuk verifikasi manual.', canSet) +
          slider('confAutoQueue', 'Ambang rekomendasi keyakinan-tinggi', st.settings.confAutoQueue, 0, 100, '%', 'Di atas nilai ini, ditandai sebagai rekomendasi keyakinan tinggi (tetap butuh konfirmasi manusia).', canSet) +
          slider('recheckCadenceHours', 'Interval pemeriksaan ulang', st.settings.recheckCadenceHours, 1, 24, ' jam', 'Seberapa sering domain terkonfirmasi diperiksa ulang keaktifannya.', canSet) +
        '</div></div>' +

        // scope
        '<div class="card"><div class="card-head"><h3>' + U.icon('shield') + 'Cakupan Deteksi</h3><span class="badge badge-plain">' + U.icon('lock') + 'Terkunci</span></div><div class="card-body">' +
          '<div class="scope-box">' + U.icon('shield') + '<div><div class="b">Judi Online</div><div class="faint sm">Satu kategori terdefinisi hukum. Bukan filter konten umum.</div></div>' +
          '<span class="badge badge-judi">Aktif</span></div>' +
          '<p class="muted sm mt-3">Cakupan hanya dapat diubah oleh <b>Super Admin</b> dan setiap perubahan tercatat di Audit Log — menjaga agar sistem tidak menjadi alat sensor serbaguna.</p>' +
          (canScope ? '<button class="btn btn-secondary btn-sm mt-2" id="scope-btn">' + U.icon('key') + 'Ajukan perubahan cakupan (tercatat audit)</button>'
            : '<div class="help">Peran Anda tidak dapat mengubah cakupan.</div>') +
        '</div></div>' +

        // sources
        '<div class="card"><div class="card-head"><h3>' + U.icon('cert') + 'Sumber Penemuan</h3></div><div class="card-body stack-2">' +
          st.sources.map(function (s) {
            return '<div class="src-toggle"><span class="src-ico sm">' + U.icon(s.icon) + '</span>' +
              '<div class="grow"><div class="b sm">' + U.esc(s.name) + (s.headline ? ' <span class="badge badge-judi" style="font-size:9px">Utama</span>' : '') + '</div>' +
              '<div class="faint" style="font-size:11px">' + U.esc(s.short) + '</div></div>' +
              '<label class="switch"><input type="checkbox" checked ' + (canSet ? '' : 'disabled') + ' /><span class="slider"></span></label></div>';
          }).join('') +
        '</div></div>' +

      '</div>' +

      // roles
      '<div class="card mt-4"><div class="card-head"><h3>' + U.icon('user') + 'Peran &amp; Akses</h3><span class="sub">matriks izin · switcher di kanan atas untuk mendemokan tiap perspektif</span></div>' +
        '<div class="card-body" style="padding:0"><div class="table-wrap"><table class="tbl perm-tbl"><thead><tr><th>Kapabilitas</th>' +
        ROLES.map(r => '<th class="center">' + U.esc(st.roleLabel[r]) + '</th>').join('') + '</tr></thead><tbody>' +
        PERM_MATRIX.map(function (row) {
          return '<tr><td class="sm">' + U.esc(row[0]) + '</td>' + ROLES.map(function (r) {
            const on = row[1].indexOf(r) >= 0;
            return '<td class="center">' + (on ? '<span class="perm-yes">' + U.icon('check') + '</span>' : '<span class="perm-no">' + U.icon('x') + '</span>') + '</td>';
          }).join('') + '</tr>';
        }).join('') +
        '</tbody></table></div>' +
        '<div class="role-list">' + st.users.map(function (u) {
          const active = u.id === st.settings.activeUserId;
          return '<div class="role-chip' + (active ? ' active' : '') + '"><span class="role-avatar" style="background:' + U.avatarColor(u.name) + ';width:28px;height:28px">' + U.esc(U.initials(u.name).toUpperCase()) + '</span>' +
            '<div class="grow"><div class="b sm">' + U.esc(u.name) + (active ? ' <span class="badge badge-new" style="font-size:9px">aktif</span>' : '') + '</div><div class="faint" style="font-size:11px">' + U.esc(st.roleLabel[u.role]) + ' · ' + U.esc(u.title) + '</div></div>' +
            '<button class="btn btn-ghost btn-sm" data-role="' + u.id + '">Lihat sebagai ini</button></div>';
        }).join('') + '</div>' +
      '</div></div>' +

      '<div class="callout mt-4">' + U.icon('info') + '<span>Perubahan pengaturan yang butuh izin Admin/Super Admin akan ditolak dari peran lain — mekanisme yang sama melindungi konfigurasi produksi. Beralih ke <b>Super Admin</b> untuk mencoba seluruh kontrol.</span></div>';
    },

    mount: function (root) {
      // theme cards
      U.$$('[data-theme-pick]', root).forEach(b => b.addEventListener('click', function () {
        Store.setTheme(b.getAttribute('data-theme-pick'));
        C.toast('Tampilan diganti', b.getAttribute('data-theme-pick') === 'kode' ? 'KODE Command (gelap)' : 'Komdigi Netral (terang)', 'ok');
      }));
      // fields
      U.$$('[data-setting]', root).forEach(function (inp) {
        if (inp.disabled) return;
        inp.addEventListener('change', function () {
          const key = inp.getAttribute('data-setting');
          const val = inp.type === 'range' || inp.type === 'number' ? parseInt(inp.value, 10) : inp.value;
          Store.setSetting(key, val, 'Nilai “' + key + '” → ' + val);
          if (key === 'brandName' || key === 'vendor') window.App.refreshChrome();
          C.toast('Pengaturan disimpan', key + ' diperbarui · tercatat audit', 'ok');
        });
        if (inp.type === 'range') inp.addEventListener('input', function () { const o = U.$('#out-' + inp.getAttribute('data-setting')); if (o) o.textContent = inp.value + (inp.getAttribute('data-suffix') || ''); });
      });
      // role switch
      U.$$('[data-role]', root).forEach(b => b.addEventListener('click', function () {
        Store.setRole(b.getAttribute('data-role'));
        const u = Store.get().users.find(x => x.id === b.getAttribute('data-role'));
        C.toast('Beralih peran', u.name + ' · ' + Store.get().roleLabel[u.role], 'ok');
      }));
      // scope
      const scope = U.$('#scope-btn', root);
      if (scope) scope.addEventListener('click', function () { Store.logAudit('Tinjau cakupan deteksi', 'cakupan', 'Permintaan tinjauan cakupan diajukan (tetap: judi online)', 'konfigurasi'); Store.notify(); C.toast('Tercatat', 'Permintaan tinjauan cakupan masuk Audit Log', 'ok'); });
      // reset
      const reset = U.$('#reset-btn', root);
      if (reset && !reset.disabled) reset.addEventListener('click', function () {
        C.confirm({
          title: 'Reset data demo?',
          message: 'Semua keputusan, penemuan, impor, dan perubahan sesi ini akan dikembalikan ke keadaan awal yang bersih. Berguna sebelum memulai demo baru.',
          confirmLabel: 'Reset ke keadaan awal', kind: 'danger',
          onConfirm: function () { Store.reset(); window.App.go('beranda'); C.toast('Demo direset', 'Data dikembalikan ke keadaan awal', 'ok'); }
        });
      });
    }
  };

  function themeCard(id, name, sub, active) {
    return '<button class="theme-card ' + id + (active ? ' active' : '') + '" data-theme-pick="' + id + '">' +
      '<div class="tc-swatch tc-' + id + '"><span></span><span></span><span></span></div>' +
      '<div class="tc-meta"><div class="b sm">' + U.esc(name) + '</div><div class="faint" style="font-size:11px">' + U.esc(sub) + '</div></div>' +
      (active ? '<span class="tc-check">' + U.icon('check') + '</span>' : '') + '</button>';
  }
  function field(label, key, val, can) {
    return '<label class="field"><span class="field-label">' + U.esc(label) + '</span>' +
      '<input class="input" data-setting="' + key + '" value="' + U.esc(val) + '" ' + (can ? '' : 'disabled') + ' /></label>';
  }
  function slider(key, label, val, min, max, suffix, help, can) {
    return '<div class="field"><div class="row-between"><span class="field-label">' + U.esc(label) + '</span>' +
      '<span class="mono b" id="out-' + key + '">' + val + suffix + '</span></div>' +
      '<input type="range" class="range" data-setting="' + key + '" data-suffix="' + suffix + '" min="' + min + '" max="' + max + '" value="' + val + '" ' + (can ? '' : 'disabled') + ' />' +
      '<div class="help">' + U.esc(help) + '</div></div>';
  }
})();
