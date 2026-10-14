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
      bg: cs.getPropertyValue("--hero-bg").trim() || cs.getPropertyValue("--bg").trim(),
      accent: cs.getPropertyValue("--coral").trim(),
      coralText: cs.getPropertyValue("--coral-text").trim(),
      peach: cs.getPropertyValue("--peach").trim(),
      peri: cs.getPropertyValue("--peri").trim(),
      onAccent: cs.getPropertyValue("--on-accent").trim() || "#fff"
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
    var side = mobile ? 74 : 150, low = mobile ? 76 : 180;
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
        var strength = (a.type === "core" || b.type === "core") ? 1300 : (a.type === "hub" || b.type === "hub") ? 260 : 110;
        f = strength * s / d2; d = Math.sqrt(d2); dx /= d; dy /= d;
        if (a.type === "paper") { a.vx += dx * f; a.vy += dy * f; }
        if (b.type === "paper") { b.vx -= dx * f; b.vy -= dy * f; }
      }
    }
    edges.forEach(function (e) {
      if (e.kind !== "leaf") return;
      var p = e.b, h = e.a;
      dx = h.x - p.x; dy = h.y - p.y; d = Math.sqrt(dx * dx + dy * dy) || 1;
      f = (d - 58 * s) * 0.02;
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
    if (n.type === "core") { y0 = n.y + (mobile ? 30 : 36); }
    else {
      var an = anchors[n.t], ux = an.ux, uy = an.uy, block = ls.length * lh;
      var off = mobile ? 20 : 26;
      x = n.x + ux * off;
      if (mobile) { x = n.x; ux = 0; uy = uy < -0.35 ? -1 : 1; } // phones: stack labels above/below
      if (ux > 0.35) align = "left"; else if (ux < -0.35) align = "right";
      if (uy < -0.35) y0 = n.y + uy * off - block;         // above
      else if (uy > 0.35) y0 = n.y + uy * off;              // below
      else y0 = n.y - block / 2;                            // beside
      if (align === "center") x = n.x;
    }
    ls = ls.map(function (l) { return l.toUpperCase(); });
    ctx.font = (weight || 600) + " " + (mobile ? 10 : 11.5) + "px Poppins, ui-sans-serif, sans-serif";
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
    var coreFocus = focus && focus.type === "core";
    var dim = any && !coreFocus ? 0.45 : 1;

    var rH = mobile ? 14 : 19, rC = mobile ? 18 : 24;

    // platform ripples around the core (the shared ground)
    if (!reduce) {
      for (var r = 0; r < 2; r++) {
        var ph = ((T * 0.00025) + r * 0.5) % 1;
        ctx.globalAlpha = (1 - ph) * 0.45;
        ctx.strokeStyle = C.accent; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(core.x, core.y, rC + 4 + ph * 64, 0, 6.2832); ctx.stroke();
      }
    }

    // edges: dashed grey links, like the network diagrams in the slides
    edges.forEach(function (e) {
      var g = Math.min(e.a.g, e.b.g);
      ctx.globalAlpha = (e.kind === "spine" ? 0.9 : 0.75) * dim;
      ctx.strokeStyle = C.ink3; ctx.lineWidth = e.kind === "spine" ? 1.4 : 1;
      ctx.setLineDash(e.kind === "spine" ? [5, 4] : [3, 3]);
      ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
      if (g > 0.02) {
        ctx.setLineDash([]);
        ctx.globalAlpha = g; ctx.strokeStyle = C.accent; ctx.lineWidth = e.kind === "spine" ? 2.2 : 1.5;
        ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
      }
    });
    ctx.setLineDash([]);

    // papers: peach dots (coral when highlighted)
    papers.forEach(function (n) {
      var rad = (mobile ? 5 : 6.5) + n.g * 1.2 + (hover === n ? 2 : 0);
      ctx.globalAlpha = dim + (1 - dim) * n.g;
      ctx.fillStyle = n.g > 0.5 && !coreFocus ? C.accent : C.peach;
      ctx.beginPath(); ctx.arc(n.x, n.y, rad, 0, 6.2832); ctx.fill();
      if (n.ts.length > 1) { // papers bridging two lines get a periwinkle ring
        ctx.strokeStyle = C.peri; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(n.x, n.y, rad + 3.5, 0, 6.2832); ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;

    // hubs: periwinkle person nodes
    hubs.forEach(function (h) {
      var on = h.g > 0.5 && !coreFocus, rr = rH + (coreFocus ? 0 : h.g * 2);
      ctx.fillStyle = on ? C.accent : C.peri;
      ctx.beginPath(); ctx.arc(h.x, h.y, rr, 0, 6.2832); ctx.fill();
      if (!icon(h.key, h.x, h.y, rr)) person(h.x, h.y, rr);
    });

    // core: coral node with a small network inside
    ctx.fillStyle = C.accent;
    ctx.beginPath(); ctx.arc(core.x, core.y, rC + core.g * 2, 0, 6.2832); ctx.fill();
    if (!icon("core", core.x, core.y, rC)) {
    ctx.strokeStyle = C.onAccent; ctx.fillStyle = C.onAccent; ctx.lineWidth = 1.6;
    var q = rC * 0.42, pts = [[0, -q], [q * 0.95, q * 0.6], [-q * 0.95, q * 0.6]];
    ctx.beginPath(); ctx.moveTo(core.x + pts[0][0], core.y + pts[0][1]);
    ctx.lineTo(core.x + pts[1][0], core.y + pts[1][1]); ctx.lineTo(core.x + pts[2][0], core.y + pts[2][1]); ctx.closePath(); ctx.stroke();
    pts.forEach(function (p) { ctx.beginPath(); ctx.arc(core.x + p[0], core.y + p[1], rC * 0.17, 0, 6.2832); ctx.fill(); });
    }

    // labels on top
    hubs.forEach(function (h) {
      ctx.globalAlpha = any && !coreFocus && h.g < 0.5 ? 0.55 : 1;
      label(h, h.label, h.g > 0.5 && !coreFocus ? C.coralText : C.ink, 600);
    });
    ctx.globalAlpha = 1;
    label(core, CORE.label, C.coralText, 700);
  }

  /* Theme icons (Font Awesome Free 6.5.1 solid, CC BY 4.0, fontawesome.com) — same as the Research cards */
  var ICONS = {"mh":{"w":576,"h":512,"d":"M163.9 136.9c-29.4-29.8-29.4-78.2 0-108s77-29.8 106.4 0l17.7 18 17.7-18c29.4-29.8 77-29.8 106.4 0s29.4 78.2 0 108L310.5 240.1c-6.2 6.3-14.3 9.4-22.5 9.4s-16.3-3.1-22.5-9.4L163.9 136.9zM568.2 336.3c13.1 17.8 9.3 42.8-8.5 55.9L433.1 485.5c-23.4 17.2-51.6 26.5-80.7 26.5H192 32c-17.7 0-32-14.3-32-32V416c0-17.7 14.3-32 32-32H68.8l44.9-36c22.7-18.2 50.9-28 80-28H272h16 64c17.7 0 32 14.3 32 32s-14.3 32-32 32H288 272c-8.8 0-16 7.2-16 16s7.2 16 16 16H392.6l119.7-88.2c17.8-13.1 42.8-9.3 55.9 8.5zM193.6 384l0 0-.9 0c.3 0 .6 0 .9 0z"},"polar":{"w":640,"h":512,"d":"M64 64a64 64 0 1 1 128 0A64 64 0 1 1 64 64zM25.9 233.4C29.3 191.9 64 160 105.6 160h44.8c27 0 51 13.4 65.5 34.1c-2.7 1.9-5.2 4-7.5 6.3l-64 64c-21.9 21.9-21.9 57.3 0 79.2L192 391.2V464c0 26.5-21.5 48-48 48H112c-26.5 0-48-21.5-48-48V348.3c-26.5-9.5-44.7-35.8-42.2-65.6l4.1-49.3zM448 64a64 64 0 1 1 128 0A64 64 0 1 1 448 64zM431.6 200.4c-2.3-2.3-4.9-4.4-7.5-6.3c14.5-20.7 38.6-34.1 65.5-34.1h44.8c41.6 0 76.3 31.9 79.7 73.4l4.1 49.3c2.5 29.8-15.7 56.1-42.2 65.6V464c0 26.5-21.5 48-48 48H496c-26.5 0-48-21.5-48-48V391.2l47.6-47.6c21.9-21.9 21.9-57.3 0-79.2l-64-64zM272 240v32h96V240c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2l64 64c9.4 9.4 9.4 24.6 0 33.9l-64 64c-6.9 6.9-17.2 8.9-26.2 5.2s-14.8-12.5-14.8-22.2V336H272v32c0 9.7-5.8 18.5-14.8 22.2s-19.3 1.7-26.2-5.2l-64-64c-9.4-9.4-9.4-24.6 0-33.9l64-64c6.9-6.9 17.2-8.9 26.2-5.2s14.8 12.5 14.8 22.2z"},"recsys":{"w":640,"h":512,"d":"M353.8 54.1L330.2 6.3c-3.9-8.3-16.1-8.6-20.4 0L286.2 54.1l-52.3 7.5c-9.3 1.4-13.3 12.9-6.4 19.8l38 37-9 52.1c-1.4 9.3 8.2 16.5 16.8 12.2l46.9-24.8 46.6 24.4c8.6 4.3 18.3-2.9 16.8-12.2l-9-52.1 38-36.6c6.8-6.8 2.9-18.3-6.4-19.8l-52.3-7.5zM256 256c-17.7 0-32 14.3-32 32V480c0 17.7 14.3 32 32 32H384c17.7 0 32-14.3 32-32V288c0-17.7-14.3-32-32-32H256zM32 320c-17.7 0-32 14.3-32 32V480c0 17.7 14.3 32 32 32H160c17.7 0 32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zm416 96v64c0 17.7 14.3 32 32 32H608c17.7 0 32-14.3 32-32V416c0-17.7-14.3-32-32-32H480c-17.7 0-32 14.3-32 32z"},"abm":{"w":640,"h":512,"d":"M320 0c17.7 0 32 14.3 32 32V96H472c39.8 0 72 32.2 72 72V440c0 39.8-32.2 72-72 72H168c-39.8 0-72-32.2-72-72V168c0-39.8 32.2-72 72-72H288V32c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H208zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H304zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H400zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224H64V416H48c-26.5 0-48-21.5-48-48V272c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H576V224h16z"},"rai":{"w":640,"h":512,"d":"M384 32H512c17.7 0 32 14.3 32 32s-14.3 32-32 32H398.4c-5.2 25.8-22.9 47.1-46.4 57.3V448H512c17.7 0 32 14.3 32 32s-14.3 32-32 32H320 128c-17.7 0-32-14.3-32-32s14.3-32 32-32H288V153.3c-23.5-10.3-41.2-31.6-46.4-57.3H128c-17.7 0-32-14.3-32-32s14.3-32 32-32H256c14.6-19.4 37.8-32 64-32s49.4 12.6 64 32zm55.6 288H584.4L512 195.8 439.6 320zM512 416c-62.9 0-115.2-34-126-78.9c-2.6-11 1-22.3 6.7-32.1l95.2-163.2c5-8.6 14.2-13.8 24.1-13.8s19.1 5.3 24.1 13.8l95.2 163.2c5.7 9.8 9.3 21.1 6.7 32.1C627.2 382 574.9 416 512 416zM126.8 195.8L54.4 320H199.3L126.8 195.8zM.9 337.1c-2.6-11 1-22.3 6.7-32.1l95.2-163.2c5-8.6 14.2-13.8 24.1-13.8s19.1 5.3 24.1 13.8l95.2 163.2c5.7 9.8 9.3 21.1 6.7 32.1C242 382 189.7 416 126.8 416S11.7 382 .9 337.1z"},"core":{"w":512,"h":512,"d":"M418.4 157.9c35.3-8.3 61.6-40 61.6-77.9c0-44.2-35.8-80-80-80c-43.4 0-78.7 34.5-80 77.5L136.2 151.1C121.7 136.8 101.9 128 80 128c-44.2 0-80 35.8-80 80s35.8 80 80 80c12.2 0 23.8-2.7 34.1-7.6L259.7 407.8c-2.4 7.6-3.7 15.8-3.7 24.2c0 44.2 35.8 80 80 80s80-35.8 80-80c0-27.7-14-52.1-35.4-66.4l37.8-207.7zM156.3 232.2c2.2-6.9 3.5-14.2 3.7-21.7l183.8-73.5c3.6 3.5 7.4 6.7 11.6 9.5L317.6 354.1c-5.5 1.3-10.8 3.1-15.8 5.5L156.3 232.2z"}};
  var PATHS = {};
  Object.keys(ICONS).forEach(function (k) { try { PATHS[k] = new Path2D(ICONS[k].d); } catch (e) {} });
  function icon(key, x, y, r) {
    var ic = ICONS[key], path = PATHS[key];
    if (!ic || !path) return false;
    var size = r * 1.05, sc = size / Math.max(ic.w, ic.h);
    ctx.save();
    ctx.translate(x - ic.w * sc / 2, y - ic.h * sc / 2);
    ctx.scale(sc, sc);
    ctx.fillStyle = C.onAccent;
    ctx.fill(path);
    ctx.restore();
    return true;
  }

  // fallback glyph (head + shoulders) if Path2D is not available
  function person(x, y, r) {
    ctx.fillStyle = C.onAccent;
    ctx.beginPath(); ctx.arc(x, y - r * 0.2, r * 0.27, 0, 6.2832); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - r * 0.48, y + r * 0.52);
    ctx.quadraticCurveTo(x - r * 0.48, y + r * 0.1, x, y + r * 0.1);
    ctx.quadraticCurveTo(x + r * 0.48, y + r * 0.1, x + r * 0.48, y + r * 0.52);
    ctx.closePath(); ctx.fill();
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
      var lim = n.type === "core" ? 30 : n.type === "hub" ? 24 : 12;
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
