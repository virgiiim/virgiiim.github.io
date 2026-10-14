/* =========================================================================
   Page behaviour: news, research glyphs, publication filters, nav, theme.
   Content lives in data.js.
   ========================================================================= */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var THEMES = window.THEMES || [], NEWS = window.NEWS || [], PUBS = window.PUBLICATIONS || [];
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var themeByKey = {};
  THEMES.forEach(function (t) { t.name = t.hub.replace(/\n/g, " "); themeByKey[t.key] = t; });

  /* ---------- theme toggle ---------- */
  var toggle = $(".theme-toggle");
  if (toggle) toggle.addEventListener("click", function () {
    var cur = root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    if (window.__netRecolor) window.__netRecolor();
  });

  /* ---------- nav: border on scroll + active section ---------- */
  var nav = $(".nav");
  var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 10); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if ("IntersectionObserver" in window) {
    var links = {};
    $$(".nav__links a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          $$(".nav__links a").forEach(function (a) { a.classList.remove("is-active"); });
          links[en.target.id].classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { io.observe(s); });
  }

  /* ---------- news ---------- */
  var newsList = $("#news-list"), SHOW = 5;
  if (newsList) {
    newsList.innerHTML = NEWS.map(function (n, i) {
      return '<li' + (i >= SHOW ? ' class="is-extra"' : "") + "><time>" + n.date + "</time>" + n.text + "</li>";
    }).join("");
    var more = $("#news-more");
    if (NEWS.length > SHOW) {
      more.hidden = false;
      more.addEventListener("click", function () {
        var box = more.closest(".news"); var open = box.classList.toggle("is-open");
        more.textContent = open ? "show less" : "show all";
      });
    }
  }

  /* ---------- research glyphs: a tiny seeded network per theme ---------- */
  function glyph(key) {
    var s = 0; for (var i = 0; i < key.length; i++) s = (s * 31 + key.charCodeAt(i)) % 2147483647;
    var rnd = function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    var w = 150, h = 84, hub = { x: 44 + rnd() * 20, y: 42 }, pts = [hub], lines = [];
    var n = 8 + Math.floor(rnd() * 4);
    for (var k = 1; k < n; k++) {
      // first ring around the hub, then a few second-degree neighbours
      var parent = k < 6 ? 0 : 1 + Math.floor(rnd() * 5);
      var pp = pts[parent], ang = rnd() * Math.PI * 2, rad = parent === 0 ? 20 + rnd() * 14 : 14 + rnd() * 8;
      var p = { x: Math.max(4, Math.min(w - 4, pp.x + Math.cos(ang) * rad * 1.5)), y: Math.max(4, Math.min(h - 4, pp.y + Math.sin(ang) * rad)) };
      pts.push(p);
      lines.push([parent, k]);
      if (k > 1 && rnd() < 0.3) lines.push([1 + Math.floor(rnd() * (k - 1)), k]);
    }
    // a weak tie leaving the community
    pts.push({ x: w - 6, y: 10 + rnd() * (h - 20), out: true }); lines.push([n - 1, n]);
    var svg = '<svg viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '">';
    lines.forEach(function (l) { var a = pts[l[0]], b = pts[l[1]]; svg += '<line' + (b.out ? ' class="out"' : "") + '  x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '"/>'; });
    pts.forEach(function (p, i) { svg += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + (i === 0 ? 5.5 : p.out ? 2 : (2 + rnd() * 1.8)).toFixed(1) + '"' + (i === 0 ? ' class="hub"' : p.out ? ' class="out"' : "") + "/>"; });
    return svg + "</svg>";
  }
  function coreGlyph() {
    // the header graph in miniature: a centre with one spoke per research line
    var cx = 50, cy = 42, svg = '<svg viewBox="0 0 150 84" width="150" height="84">';
    for (var i = 0; i < THEMES.length; i++) {
      var a = -Math.PI / 2 + i / THEMES.length * Math.PI * 2, x = cx + Math.cos(a) * 40, y = cy + Math.sin(a) * 34;
      svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '"/><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.5"/>';
    }
    return svg + '<circle class="ring" cx="' + cx + '" cy="' + cy + '" r="12"/><circle class="hub" cx="' + cx + '" cy="' + cy + '" r="6"/></svg>';
  }
  $$(".theme").forEach(function (el) {
    var key = el.getAttribute("data-theme");
    var g = $(".theme__glyph", el); if (g) g.innerHTML = key === "core" ? coreGlyph() : glyph(key);
    var c = $(".count", el);
    if (c) c.textContent = "(" + (key === "core" ? PUBS.length : PUBS.filter(function (p) { return p.themes.indexOf(key) > -1; }).length) + ")";
  });

  /* ---------- publications ---------- */
  var TYPES = [
    { key: "journal", label: "journal" },
    { key: "conference", label: "conference" },
    { key: "book", label: "book chapter" },
    { key: "preprint", label: "preprint" },
    { key: "thesis", label: "PhD thesis" }
  ];
  var typeLabel = {}; TYPES.forEach(function (t) { typeLabel[t.key] = t.label; });
  var state = { theme: "all", type: "all" };
  var pubsEl = $("#pubs"), statusEl = $("#pubs-status");

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function chip(group, value, label, count) {
    return '<button type="button" class="chip" data-g="' + group + '" data-v="' + value + '" aria-pressed="false">' +
      esc(label) + (count !== undefined ? "<sup>" + count + "</sup>" : "") + "</button>";
  }
  function buildChips() {
    var tc = $("#theme-chips"), yc = $("#type-chips");
    if (!tc) return;
    tc.innerHTML = chip("theme", "all", "all topics") + THEMES.map(function (t) {
      return chip("theme", t.key, t.name, PUBS.filter(function (p) { return p.themes.indexOf(t.key) > -1; }).length);
    }).join("");
    yc.innerHTML = chip("type", "all", "all types") + TYPES.filter(function (t) {
      return PUBS.some(function (p) { return p.type === t.key; });
    }).map(function (t) {
      return chip("type", t.key, t.label, PUBS.filter(function (p) { return p.type === t.key; }).length);
    }).join("");
    $$(".chip").forEach(function (b) {
      b.addEventListener("click", function () { state[b.dataset.g] = b.dataset.v; render(); });
    });
  }

  function render() {
    if (!pubsEl) return;
    $$(".chip").forEach(function (b) { b.setAttribute("aria-pressed", String(state[b.dataset.g] === b.dataset.v)); });
    var list = PUBS.filter(function (p) {
      return (state.theme === "all" || p.themes.indexOf(state.theme) > -1) &&
             (state.type === "all" || p.type === state.type);
    }).slice().sort(function (a, b) { return b.year - a.year; });

    var lastYear = null;
    pubsEl.innerHTML = list.map(function (p, i) {
      var year = p.year !== lastYear ? p.year : ""; lastYear = p.year;
      var authors = esc(p.authors).replace(/V\. Morini/g, '<span class="me">V. Morini</span>');
      var title = p.url ? '<a href="' + esc(p.url) + '">' + esc(p.title) + "</a>" : esc(p.title);
      var topics = p.themes.map(function (k) { return themeByKey[k] ? themeByKey[k].name : k; }).join(" · ");
      return '<li class="pub" style="animation-delay:' + Math.min(i * 25, 300) + 'ms">' +
        '<span class="pub__year">' + year + "</span>" +
        "<div>" +
          '<h3 class="pub__title">' + title + "</h3>" +
          '<p class="pub__authors">' + authors + "</p>" +
          '<p class="pub__venue">' + esc(p.venue) + "</p>" +
        "</div>" +
        '<div class="pub__meta">' +
          '<span class="pub__type">' + (typeLabel[p.type] || p.type) + "</span>" +
          (p.flag ? '<span class="pub__flag">' + esc(p.flag) + "</span>" : "") +
          '<span class="pub__type" style="text-transform:none;letter-spacing:0">' + esc(topics) + "</span>" +
        "</div>" +
      "</li>";
    }).join("");

    var filtered = state.theme !== "all" || state.type !== "all";
    statusEl.innerHTML = "showing " + list.length + " of " + PUBS.length +
      (filtered ? ' · <button type="button" class="link-btn" id="clear-f">clear filters</button>' : "");
    var clr = $("#clear-f");
    if (clr) clr.addEventListener("click", function () { state.theme = "all"; state.type = "all"; render(); });
  }

  function selectTheme(key) {
    state.theme = key; state.type = "all"; render();
    var sec = $("#publications"); if (sec) sec.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  $$(".theme__go").forEach(function (b) { b.addEventListener("click", function () { selectTheme(b.dataset.filter); }); });
  window.addEventListener("net:select", function (e) { selectTheme(e.detail); });

  buildChips(); render();

  /* ---------- reveal on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var targets = $$(".sh, .about, .path, .themes, .filters, .cards, .rows, .cols, .contact__grid");
    targets.forEach(function (t) { t.classList.add("reveal"); });
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); ro.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (t) { ro.observe(t); });
  }
})();
