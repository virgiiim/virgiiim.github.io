/* =========================================================================
   Header graph — one connected network of the research.
   · centre: online social platforms, the thread through everything
   · ring:   the research lines (THEMES in data.js)
   · dots:   every publication (PUBLICATIONS in data.js), linked to each of
             its themes, so papers that span two lines sit between them.
   Hover to highlight, click a theme to filter, click a paper to open it.
   Vanilla JS, no dependencies.
   ========================================================================= */
(function () {
  "use strict";
  var canvas = document.getElementById("net");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var hero = canvas.parentElement;
  var box = hero.querySelector(".hero__graph");  // the area reserved for the graph
  var area = { x: 0, y: 0, w: 0, h: 0 };
  var caption = document.querySelector("#net-caption span");
  var THEMES = window.THEMES || [], PUBS = window.PUBLICATIONS || [];
  var CORE = window.CORE || { label: "online social\nplatforms", title: "online social platforms" };
  var K = THEMES.length;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DEFAULT_CAPTION = "each dot is a paper · hover to explore";

  var W = 0, H = 0, dpr = 1, mobile = false;
  var core, hubs = [], papers = [], nodes = [], edges = [];
  var center = { x: 0, y: 0 }, anchors = [];
  var mouse = { x: -1e4, y: -1e4 };
  var hover = null, focus = null, autoStep = 0, lastAuto = -1e5;
  var visible = true, raf = 0, C = {}, T = 0;

  var seed = 4242;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    C = {
      ink: cs.getPropertyValue("--ink").trim(),
      ink2: cs.getPropertyValue("--ink-2").trim(),
      ink3: cs.getPropertyValue("--ink-3").trim(),
      bg: cs.getPropertyValue("--bg").trim(),
      accent: cs.getPropertyValue("--accent").trim()
    };
  }
  function countFor(key) { return PUBS.filter(function (p) { return p.themes.indexOf(key) > -1; }).length; }

  /* ---------- graph ---------- */
  function build() {
    nodes = []; edges = []; hubs = []; papers = [];
    core = { type: "core", g: 0, x: 0, y: 0, vx: 0, vy: 0 };
    nodes.push(core);
    THEMES.forEach(function (t, i) {
      var h = { type: "hub", t: i, key: t.key, label: t.hub, g: 0, vx: 0, vy: 0 };
      hubs.push(h); nodes.push(h);
      edges.push({ a: core, b: h, kind: "spine" });
    });
    var idx = {}; THEMES.forEach(function (t, i) { idx[t.key] = i; });
    PUBS.forEach(function (p) {
      var ts = p.themes.map(function (k) { return idx[k]; }).filter(function (i) { return i !== undefined; });
      if (!ts.length) return;
      var n = { type: "paper", pub: p, ts: ts, g: 0, vx: 0, vy: 0, phase: rnd() * 6.28 };
      papers.push(n); nodes.push(n);
      ts.forEach(function (i) { edges.push({ a: hubs[i], b: n, kind: "leaf" }); });
    });
  }

  function layout() {
    // fit the graph inside the reserved box, leaving room for the labels
    var hr = hero.getBoundingClientRect(), R;
    if (box) {
      var br = box.getBoundingClientRect();
      area = { x: br.left - hr.left, y: br.top - hr.top, w: br.width, h: br.height - 28 }; // 28px: caption row
    } else area = { x: W * 0.5, y: 0, w: W * 0.5, h: H };
    center.x = area.x + area.w / 2; center.y = area.y + area.h / 2 + 6;
    // horizontal room the labels need: side hubs (beside) and bottom hubs (below, running outward)
    var side = mobile ? 70 : 124, low = mobile ? 72 : 160;
    R = Math.min((area.w / 2 - side) / 1.03, (area.w / 2 - low) / 0.64, (area.h / 2 - 62) / 0.92, 220);
    R = Math.max(R, 80);
    anchors = [];
    for (var i = 0; i < K; i++) {
      var a = -Math.PI / 2 + (i / K) * Math.PI * 2;
      var an = { x: center.x + Math.cos(a) * R * 1.08, y: center.y + Math.sin(a) * R * 0.92, ux: Math.cos(a), uy: Math.sin(a) };
      an.lx = mobile ? an.x : an.x + an.ux * 40; an.ly = mobile ? an.y + (an.uy < -0.35 ? -30 : 32) : an.y + an.uy * 34; // where the label sits (papers keep clear)
      anchors.push(an);
    }
  }

  function place() {
    core.x = center.x; core.y = center.y;
    hubs.forEach(function (h, i) { h.x = anchors[i].x; h.y = anchors[i].y; });
    papers.forEach(function (n) {
      var x = 0, y = 0;
      n.ts.forEach(function (i) { x += anchors[i].x; y += anchors[i].y; });
      x /= n.ts.length; y /= n.ts.length;
      // start a little outside the ring so papers fan out around their theme
      n.x = x + (x - center.x) * 0.35 + (rnd() - 0.5) * 40;
      n.y = y + (y - center.y) * 0.35 + (rnd() - 0.5) * 40;
      n.vx = n.vy = 0;
    });
  }

  function resize() {
    var r = hero.getBoundingClientRect();
    var wasMobile = mobile, oldW = W, oldH = H;
    W = r.width; H = r.height;
    var bw = box ? box.getBoundingClientRect().width : W / 2;
    mobile = bw < 560;                     // compact labels (stacked above/below hubs)
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
    if (!nodes.length || wasMobile !== mobile) { seed = 4242; build(); place(); for (var i = 0; i < 260; i++) step(); }
    else if (oldW && oldH) {
      nodes.forEach(function (n) {
        if (n.type !== "paper") return;
        n.x += (center.x - (n._cx || center.x)); n.y += (center.y - (n._cy || center.y));
      });
    }
    nodes.forEach(function (n) { n._cx = center.x; n._cy = center.y; });
    if (reduce) draw();
  }

  /* ---------- physics ---------- */
  function step(t) {
    var s = mobile ? 0.8 : 1, i, j, a, b, dx, dy, d2, d, f;
    // core and hubs are pinned (with a soft spring, so the cursor can nudge them)
    core.vx += (center.x - core.x) * 0.08; core.vy += (center.y - core.y) * 0.08;
    hubs.forEach(function (h, k) { h.vx += (anchors[k].x - h.x) * 0.05; h.vy += (anchors[k].y - h.y) * 0.05; });

    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        b = nodes[j];
        if (a.type !== "paper" && b.type !== "paper") continue;
        dx = a.x - b.x; dy = a.y - b.y; d2 = dx * dx + dy * dy;
        if (d2 > 6400 || d2 === 0) continue;
        if (d2 < 25) d2 = 25;
        var strength = (a.type === "core" || b.type === "core") ? 900 : (a.type === "hub" || b.type === "hub") ? 160 : 70;
        f = strength * s / d2; d = Math.sqrt(d2); dx /= d; dy /= d;
        if (a.type === "paper") { a.vx += dx * f; a.vy += dy * f; }
        if (b.type === "paper") { b.vx -= dx * f; b.vy -= dy * f; }
      }
    }
    edges.forEach(function (e) {
      if (e.kind !== "leaf") return;
      var p = e.b, h = e.a;
      dx = h.x - p.x; dy = h.y - p.y; d = Math.sqrt(dx * dx + dy * dy) || 1;
      f = (d - 50 * s) * 0.02;
      p.vx += dx / d * f; p.vy += dy / d * f;
    });
    papers.forEach(function (p) {
      anchors.forEach(function (an) {
        var lx = p.x - an.lx, ly = p.y - an.ly, l2 = lx * lx + ly * ly;
        if (l2 < 3600 && l2 > 1) { var lf = (1 - Math.sqrt(l2) / 60) * 1.1, ld = Math.sqrt(l2); p.vx += lx / ld * lf; p.vy += ly / ld * lf; }
      });
    });
    var left = area.x - 10, right = area.x + area.w + 10, top = area.y - 10, bottom = area.y + area.h + 10;
    for (i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.type === "paper") {
        if (n.x < left) n.vx += (left - n.x) * 0.03;
        if (n.x > right) n.vx -= (n.x - right) * 0.03;
        if (n.y < top) n.vy += (top - n.y) * 0.03;
        if (n.y > bottom) n.vy -= (n.y - bottom) * 0.03;
        if (t !== undefined) {
          n.vx += Math.sin(t * 0.0006 + n.phase) * 0.01;
          n.vy += Math.cos(t * 0.0005 + n.phase * 1.3) * 0.01;
        }
      }
      dx = n.x - mouse.x; dy = n.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
      if (n.type === "paper" && d < 70 && d > 8) { f = (1 - d / 70) * 0.35; n.vx += dx / d * f; n.vy += dy / d * f; }
      n.vx *= 0.82; n.vy *= 0.82;
      n.vx = Math.max(-4, Math.min(4, n.vx)); n.vy = Math.max(-4, Math.min(4, n.vy));
      n.x += n.vx; n.y += n.vy;
    }
  }

  /* ---------- focus ---------- */
  function inFocus(n) {
    if (!focus) return false;
    if (focus.type === "core") return n.type !== "paper";
    if (focus.type === "hub") return n === focus || n === core || (n.type === "paper" && n.ts.indexOf(focus.t) > -1);
    if (focus.type === "paper") return n === focus || n === core || (n.type === "hub" && focus.ts.indexOf(n.t) > -1);
    return false;
  }

  /* ---------- drawing ---------- */
  function lines(text) { return String(text).split("\n"); }
  function label(n, text, color, weight) {
    var ls = lines(text), lh = mobile ? 13 : 15, x = n.x, y0, align = "center";
    if (n.type === "core") { y0 = n.y + 30; }
    else {
      var an = anchors[n.t], ux = an.ux, uy = an.uy, block = ls.length * lh;
      x = n.x + ux * 16;
      if (mobile) { x = n.x; ux = 0; uy = uy < -0.35 ? -1 : 1; } // phones: stack labels above/below
      if (ux > 0.35) align = "left"; else if (ux < -0.35) align = "right";
      if (uy < -0.35) y0 = n.y + uy * 16 - block;          // above
      else if (uy > 0.35) y0 = n.y + uy * 16;               // below
      else y0 = n.y - block / 2;                            // beside
      if (align === "center") x = n.x;
    }
    ctx.font = (weight || 500) + " " + (mobile ? 10.5 : 12) + "px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textAlign = align; ctx.textBaseline = "top";
    ctx.lineJoin = "round"; ctx.lineWidth = 5; ctx.strokeStyle = C.bg;
    ls.forEach(function (l, k) { ctx.strokeText(l, x, y0 + k * lh); });
    ctx.fillStyle = color;
    ls.forEach(function (l, k) { ctx.fillText(l, x, y0 + k * lh); });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var any = !!focus;
    nodes.forEach(function (n) {
      var tgt = inFocus(n) ? 1 : 0;
      n.g = reduce ? tgt : n.g + (tgt - n.g) * 0.1;
    });
    var dim = any ? 0.45 : 1;

    // platform ripples around the core (the shared ground)
    if (!reduce) {
      for (var r = 0; r < 2; r++) {
        var ph = ((T * 0.00025) + r * 0.5) % 1;
        ctx.globalAlpha = (1 - ph) * 0.35;
        ctx.strokeStyle = C.accent; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(core.x, core.y, 16 + ph * 70, 0, 6.2832); ctx.stroke();
      }
    }

    // edges
    edges.forEach(function (e) {
      var g = Math.min(e.a.g, e.b.g);
      ctx.globalAlpha = (e.kind === "spine" ? 0.7 : 0.5) * dim;
      ctx.strokeStyle = C.ink3; ctx.lineWidth = e.kind === "spine" ? 1.4 : 1;
      ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
      if (g > 0.02) {
        ctx.globalAlpha = g; ctx.strokeStyle = C.accent; ctx.lineWidth = e.kind === "spine" ? 2 : 1.3;
        ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
      }
    });

    // papers
    papers.forEach(function (n) {
      var rad = (mobile ? 3.6 : 4.5) + n.g * 1.2 + (hover === n ? 1.5 : 0);
      ctx.globalAlpha = dim + (1 - dim) * n.g;
      ctx.fillStyle = n.g > 0.5 ? C.accent : C.ink;
      ctx.beginPath(); ctx.arc(n.x, n.y, rad, 0, 6.2832); ctx.fill();
      if (n.ts.length > 1) { // papers bridging two lines get a ring
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(n.x, n.y, rad + 3, 0, 6.2832); ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;

    // hubs
    hubs.forEach(function (h) {
      var on = h.g > 0.5, col = on ? C.accent : C.ink;
      ctx.fillStyle = C.bg; ctx.strokeStyle = col; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(h.x, h.y, 8 + h.g * 2, 0, 6.2832); ctx.fill(); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(h.x, h.y, 3 + h.g, 0, 6.2832); ctx.fill();
    });

    // core
    ctx.fillStyle = C.bg; ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(core.x, core.y, 15, 0, 6.2832); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(core.x, core.y, 7 + core.g * 2, 0, 6.2832); ctx.fill();

    // labels on top
    hubs.forEach(function (h) {
      ctx.globalAlpha = any && h.g < 0.5 ? 0.6 : 1;
      label(h, h.label, h.g > 0.5 ? C.accent : C.ink, 500);
    });
    ctx.globalAlpha = 1;
    label(core, CORE.label, C.accent, 600);
  }

  function setCaption() {
    if (!caption) return;
    var f = hover || focus;
    if (!f) { caption.textContent = DEFAULT_CAPTION; return; }
    if (f.type === "core") { caption.textContent = "the common thread: " + CORE.title + " · " + PUBS.length + " papers"; return; }
    if (f.type === "hub") {
      var t = THEMES[f.t], k = countFor(t.key);
      caption.textContent = t.title.toLowerCase() + " · " + k + " paper" + (k === 1 ? "" : "s") + (hover ? " · click to filter" : "");
      return;
    }
    var p = f.pub, title = p.title.length > 72 ? p.title.slice(0, 70) + "…" : p.title;
    caption.textContent = p.year + " · " + title + (p.url ? " · click to open" : "");
  }

  function loop(t) {
    raf = 0; if (!visible) return;
    T = t;
    if (!hover && t - lastAuto > 3200) {
      lastAuto = t;
      focus = autoStep % (K + 1) === 0 ? core : hubs[(autoStep % (K + 1)) - 1];
      autoStep++; setCaption();
    }
    step(t); draw();
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }

  /* ---------- interaction ---------- */
  function pick(x, y) {
    var best = null, bd = Infinity;
    nodes.forEach(function (n) {
      var lim = n.type === "core" ? 26 : n.type === "hub" ? 20 : 10;
      var dx = n.x - x, dy = n.y - y, d2 = dx * dx + dy * dy;
      if (d2 < lim * lim && d2 < bd) { best = n; bd = d2; }
    });
    return best;
  }
  function pos(ev) { var r = canvas.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }
  hero.addEventListener("pointermove", function (ev) {
    var p = pos(ev); mouse.x = p.x; mouse.y = p.y;
    var h = pick(p.x, p.y);
    if (h !== hover) {
      hover = h; if (h) focus = h;
      lastAuto = performance.now();
      hero.style.cursor = h ? "pointer" : "";
      setCaption(); if (reduce) draw();
    }
  });
  hero.addEventListener("pointerleave", function () {
    mouse.x = mouse.y = -1e4; hover = null; hero.style.cursor = "";
    if (reduce) { focus = null; draw(); }
    setCaption();
  });
  hero.addEventListener("click", function (ev) {
    if (ev.target.closest && ev.target.closest("a, button")) return;
    var p = pos(ev), h = pick(p.x, p.y);
    if (!h) return;
    if (h.type === "hub") window.dispatchEvent(new CustomEvent("net:select", { detail: h.key }));
    else if (h.type === "core") { var r = document.getElementById("research"); if (r) r.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }
    else if (h.pub.url) window.open(h.pub.url, "_blank", "noopener");
    else window.dispatchEvent(new CustomEvent("net:select", { detail: h.pub.themes[0] }));
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }).observe(hero);
  }
  document.addEventListener("visibilitychange", function () { visible = !document.hidden; if (visible) start(); });
  window.__netRecolor = function () { readColors(); draw(); };
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", window.__netRecolor);
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 120); });

  readColors(); resize();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  setCaption(); start();
})();
