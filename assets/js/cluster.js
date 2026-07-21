/* ==========================================================================
   cluster.js — Interactive mirror-network visualization (force-directed, SVG).
   Zero dependencies. Groups mirror domains around shared technical signals.
   Exposes: window.ClusterViz
   ========================================================================== */
(function () {
  'use strict';
  const U = window.U;
  const SVGNS = 'http://www.w3.org/2000/svg';

  const SIGNAL_META = {
    ip:          { label: 'IP / ASN bersama', color: '#4B93E8', short: 'IP' },
    asn:         { label: 'ASN bersama', color: '#4B93E8', short: 'ASN' },
    favicon:     { label: 'Favicon hash sama', color: '#D99A2B', short: 'Favicon' },
    fingerprint: { label: 'HTML fingerprint sama', color: '#B36AD9', short: 'Fingerprint' },
    redirect:    { label: 'Rantai redirect sama', color: '#3FA981', short: 'Redirect' }
  };

  function verdictColor(d) {
    if (d.status === 'terkonfirmasi') return '#D23B4E';
    if (d.status === 'bukan') return '#3FA981';
    if (d.status === 'investigasi') return '#B36AD9';
    if (d.ai.verdict === 'tidak_yakin') return '#D99A2B';
    return '#4B93E8';
  }

  // Build graph (seed + members + present signal hubs)
  function buildGraph(cluster, members) {
    const nodes = [];
    const edges = [];
    const byId = {};

    const seedDom = members.find(m => m.domain === cluster.seed) || members[0];
    const seedNode = { id: 'seed', type: 'seed', label: cluster.seed, dom: seedDom, r: 22, fx: 0, fy: 0, charge: 2.8 };
    nodes.push(seedNode); byId[seedNode.id] = seedNode;

    // signal hubs present in this cluster's membership
    const present = {};
    members.forEach(m => (m.sharedSignals || []).forEach(s => { present[s === 'asn' ? 'ip' : s] = true; }));
    Object.keys(present).forEach(function (key, i) {
      const hub = { id: 'hub_' + key, type: 'signal', key: key, label: SIGNAL_META[key].short, r: 13, charge: 1.6 };
      nodes.push(hub); byId[hub.id] = hub;
      edges.push({ a: 'seed', b: hub.id, kind: 'struct', color: 'var(--line-strong)', len: 155 });
    });

    members.forEach(function (m, i) {
      if (m === seedDom) return;
      const node = { id: m.id, type: 'mirror', label: m.domain, dom: m, r: 6 + (m.ai.confidence / 100) * 5 };
      nodes.push(node); byId[node.id] = node;
      const sigs = (m.sharedSignals || []).map(s => s === 'asn' ? 'ip' : s);
      const uniq = sigs.filter((v, idx) => sigs.indexOf(v) === idx);
      if (uniq.length === 0) { edges.push({ a: 'seed', b: node.id, kind: 'weak', color: 'var(--line-2)', len: 185 }); }
      uniq.forEach(function (s) {
        if (byId['hub_' + s]) edges.push({ a: 'hub_' + s, b: node.id, kind: 'signal', color: SIGNAL_META[s].color, len: 82 });
      });
    });
    return { nodes: nodes, edges: edges, byId: byId };
  }

  // Deterministic force layout
  function layout(graph, seedStr) {
    const nodes = graph.nodes, edges = graph.edges;
    let s = 0; for (let i = 0; i < seedStr.length; i++) s = (s * 31 + seedStr.charCodeAt(i)) >>> 0;
    const rnd = U.rng(s || 7);
    nodes.forEach(function (n, i) {
      if (n.fx !== undefined) { n.x = n.fx; n.y = n.fy; }
      else {
        const ang = (i / nodes.length) * Math.PI * 2 + rnd() * 0.5;
        const rad = n.type === 'signal' ? 90 : 150 + rnd() * 90;
        n.x = Math.cos(ang) * rad; n.y = Math.sin(ang) * rad;
      }
      n.vx = 0; n.vy = 0;
    });
    const K_REP = 3600, K_SPR = 0.036, GRAV = 0.009, DAMP = 0.86;
    for (let iter = 0; iter < 320; iter++) {
      // repulsion
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          let dx = a.x - b.x, dy = a.y - b.y; let d2 = dx * dx + dy * dy; if (d2 < 0.01) { d2 = 0.01; dx = (rnd() - 0.5); dy = (rnd() - 0.5); }
          const d = Math.sqrt(d2); const f = K_REP * (a.charge || 1) * (b.charge || 1) / d2;
          const fx = (dx / d) * f, fy = (dy / d) * f;
          a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
        }
      }
      // springs
      edges.forEach(function (e) {
        const a = graph.byId[e.a], b = graph.byId[e.b];
        let dx = b.x - a.x, dy = b.y - a.y; const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const f = (d - e.len) * K_SPR; const fx = (dx / d) * f, fy = (dy / d) * f;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      });
      // gravity + integrate
      nodes.forEach(function (n) {
        if (n.fx !== undefined) { n.x = n.fx; n.y = n.fy; n.vx = 0; n.vy = 0; return; }
        n.vx -= n.x * GRAV; n.vy -= n.y * GRAV;
        n.vx *= DAMP; n.vy *= DAMP;
        n.x += n.vx * 0.18; n.y += n.vy * 0.18;
      });
    }
  }

  function render(container, cluster, members, handlers) {
    handlers = handlers || {};
    const graph = buildGraph(cluster, members);
    layout(graph, cluster.id);

    // bounds
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    graph.nodes.forEach(n => { minX = Math.min(minX, n.x - n.r); minY = Math.min(minY, n.y - n.r); maxX = Math.max(maxX, n.x + n.r); maxY = Math.max(maxY, n.y + n.r); });
    const pad = 60;
    const vb = { x: minX - pad, y: minY - pad, w: (maxX - minX) + 2 * pad, h: (maxY - minY) + 2 * pad };

    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'cluster-svg');
    svg.setAttribute('viewBox', vb.x + ' ' + vb.y + ' ' + vb.w + ' ' + vb.h);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const root = document.createElementNS(SVGNS, 'g');
    svg.appendChild(root);

    // edges
    const edgeEls = {};
    graph.edges.forEach(function (e, i) {
      const a = graph.byId[e.a], b = graph.byId[e.b];
      const ln = document.createElementNS(SVGNS, 'line');
      ln.setAttribute('x1', a.x); ln.setAttribute('y1', a.y); ln.setAttribute('x2', b.x); ln.setAttribute('y2', b.y);
      ln.setAttribute('stroke', e.color);
      ln.setAttribute('stroke-width', e.kind === 'signal' ? 1.1 : e.kind === 'struct' ? 1.6 : 0.8);
      ln.setAttribute('stroke-opacity', e.kind === 'weak' ? 0.5 : 0.7);
      if (e.kind === 'weak') ln.setAttribute('stroke-dasharray', '2 4');
      ln.setAttribute('class', 'cl-edge');
      ln.dataset.a = e.a; ln.dataset.b = e.b;
      root.appendChild(ln);
      edgeEls[e.a + '|' + e.b] = ln;
    });

    // nodes
    const nodeEls = {};
    graph.nodes.forEach(function (n) {
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'cl-node cl-' + n.type);
      g.setAttribute('transform', 'translate(' + n.x + ',' + n.y + ')');
      g.dataset.id = n.id;

      if (n.type === 'signal') {
        const rect = document.createElementNS(SVGNS, 'rect');
        const sz = n.r * 1.5;
        rect.setAttribute('x', -sz / 2); rect.setAttribute('y', -sz / 2); rect.setAttribute('width', sz); rect.setAttribute('height', sz);
        rect.setAttribute('rx', 3); rect.setAttribute('transform', 'rotate(45)');
        rect.setAttribute('fill', 'var(--surface)'); rect.setAttribute('stroke', SIGNAL_META[n.key].color); rect.setAttribute('stroke-width', 1.8);
        g.appendChild(rect);
        const t = document.createElementNS(SVGNS, 'text');
        t.setAttribute('y', n.r + 13); t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'cl-hub-label');
        t.textContent = n.label; g.appendChild(t);
      } else {
        const c = document.createElementNS(SVGNS, 'circle');
        c.setAttribute('r', n.r);
        c.setAttribute('fill', n.type === 'seed' ? '#D23B4E' : verdictColor(n.dom));
        c.setAttribute('stroke', n.type === 'seed' ? '#fff' : 'rgba(255,255,255,.35)');
        c.setAttribute('stroke-width', n.type === 'seed' ? 2 : 1);
        c.setAttribute('class', 'cl-dot');
        g.appendChild(c);
        if (n.type === 'seed') {
          const t = document.createElementNS(SVGNS, 'text');
          t.setAttribute('y', n.r + 15); t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'cl-seed-label');
          t.textContent = n.label; g.appendChild(t);
        }
        g.style.cursor = 'pointer';
        g.addEventListener('click', function (ev) { ev.stopPropagation(); select(n.id); if (handlers.onSelect) handlers.onSelect(n.dom); });
        g.addEventListener('mouseenter', function () { showTip(n); });
        g.addEventListener('mouseleave', hideTip);
      }
      root.appendChild(g);
      nodeEls[n.id] = g;
    });

    // tooltip
    const tip = document.createElement('div'); tip.className = 'cl-tip'; tip.style.display = 'none';
    container.style.position = 'relative';

    function showTip(n) {
      const d = n.dom;
      tip.innerHTML = '<div class="d">' + U.esc(d.domain) + '</div>' +
        '<div class="m">' + U.esc(d.id) + ' · keyakinan ' + d.ai.confidence + '%</div>' +
        '<div class="m">' + statusLabel(d.status) + (d.evidence ? ' · ' + U.esc(d.evidence.ip) : '') + '</div>';
      tip.style.display = 'block';
    }
    function hideTip() { tip.style.display = 'none'; }
    svg.addEventListener('mousemove', function (e) {
      const rect = container.getBoundingClientRect();
      tip.style.left = (e.clientX - rect.left + 12) + 'px';
      tip.style.top = (e.clientY - rect.top + 12) + 'px';
    });

    // selection highlighting
    let selected = null;
    function select(id) {
      selected = id;
      const neigh = {};
      graph.edges.forEach(e => { if (e.a === id) neigh[e.b] = 1; if (e.b === id) neigh[e.a] = 1; });
      Object.keys(nodeEls).forEach(nid => {
        const g = nodeEls[nid];
        g.classList.toggle('sel', nid === id);
        g.classList.toggle('dim', id && nid !== id && !neigh[nid] && nid !== 'seed');
      });
      graph.edges.forEach(e => {
        const ln = edgeEls[e.a + '|' + e.b];
        const on = (e.a === id || e.b === id);
        ln.classList.toggle('hl', on);
        ln.classList.toggle('dim', !!id && !on);
      });
    }
    svg.addEventListener('click', function () { select(null); if (handlers.onClear) handlers.onClear(); });

    // pan & zoom
    let scale = 1, tx = 0, ty = 0, dragging = false, sx = 0, sy = 0;
    function apply() { root.setAttribute('transform', 'translate(' + tx + ' ' + ty + ') scale(' + scale + ')'); }
    svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      scale = U.clamp(scale * factor, 0.4, 3.2);
      apply();
    }, { passive: false });
    svg.addEventListener('mousedown', function (e) { dragging = true; sx = e.clientX - tx; sy = e.clientY - ty; svg.classList.add('grabbing'); });
    function onMove(e) { if (!dragging) return; tx = e.clientX - sx; ty = e.clientY - sy; apply(); }
    function onUp() { dragging = false; svg.classList.remove('grabbing'); }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    container.innerHTML = '';
    container.appendChild(svg);
    container.appendChild(tip);

    return {
      select: select,
      reset: function () { scale = 1; tx = 0; ty = 0; apply(); select(null); },
      // remove window-level pan listeners so re-renders/navigation don't leak them
      destroy: function () { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); }
    };
  }

  function statusLabel(s) {
    return ({ terkonfirmasi: 'Terkonfirmasi', baru: 'Baru', review: 'Antre review', investigasi: 'Perlu investigasi', bukan: 'Bukan' })[s] || s;
  }

  window.ClusterViz = { render: render, SIGNAL_META: SIGNAL_META, verdictColor: verdictColor };
})();
