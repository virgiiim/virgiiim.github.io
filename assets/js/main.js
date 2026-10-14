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

  /* ---------- news (how many are shown is decided by the page fitting below) ---------- */
  var newsList = $("#news-list");
  if (newsList) {
    newsList.innerHTML = NEWS.map(function (n) { return "<li><time>" + n.date + "</time>" + n.text + "</li>"; }).join("");
    newsList.setAttribute("data-limit", "3");
  }
  var oldMore = $("#news-more"); if (oldMore) oldMore.parentNode.removeChild(oldMore);

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

  var PUB_DEFAULT = 4, PUB_LIMIT = PUB_DEFAULT;   // publications shown before "show all"
  var fTheme = $("#f-theme"), fType = $("#f-type"), moreBtn = $("#pubs-more");
  state.all = false;

  function countBy(fn) { return PUBS.filter(fn).length; }
  function buildFilters() {
    if (!fTheme) return;
    fTheme.innerHTML = '<option value="all">All topics (' + PUBS.length + ')</option>' + THEMES.map(function (t) {
      return '<option value="' + t.key + '">' + esc(t.name.charAt(0).toUpperCase() + t.name.slice(1)) + " (" + countBy(function (p) { return p.themes.indexOf(t.key) > -1; }) + ")</option>";
    }).join("");
    fType.innerHTML = '<option value="all">All types</option>' + TYPES.filter(function (t) {
      return PUBS.some(function (p) { return p.type === t.key; });
    }).map(function (t) {
      return '<option value="' + t.key + '">' + esc(t.label.charAt(0).toUpperCase() + t.label.slice(1)) + " (" + countBy(function (p) { return p.type === t.key; }) + ")</option>";
    }).join("");
    fTheme.addEventListener("change", function () { state.theme = fTheme.value; state.all = false; render(); fitPages(); });
    fType.addEventListener("change", function () { state.type = fType.value; state.all = false; render(); fitPages(); });
    if (moreBtn) moreBtn.addEventListener("click", function () {
      state.all = !state.all; render();
      if (!state.all) { fitPages(); var sec = $("#publications"); if (sec) sec.scrollIntoView(); }
    });
  }

  function render() {
    if (!pubsEl) return;
    if (fTheme) { fTheme.value = state.theme; fType.value = state.type; }
    var list = PUBS.filter(function (p) {
      return (state.theme === "all" || p.themes.indexOf(state.theme) > -1) &&
             (state.type === "all" || p.type === state.type);
    }).slice().sort(function (a, b) { return b.year - a.year; });

    var total = list.length, cut = !state.all && total > PUB_LIMIT;
    if (cut) list = list.slice(0, PUB_LIMIT);
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
    statusEl.innerHTML = total + (total === 1 ? " paper" : " papers") +
      (filtered ? ' · <button type="button" class="link-btn" id="clear-f">clear</button>' : "");
    var clr = $("#clear-f");
    if (clr) clr.addEventListener("click", function () { state.theme = "all"; state.type = "all"; state.all = false; render(); });
    if (moreBtn) {
      moreBtn.hidden = !(cut || state.all) || total <= PUB_LIMIT;
      moreBtn.textContent = state.all ? "Show fewer" : "Show all " + total + " papers";
    }
  }

  function selectTheme(key) {
    state.theme = key; state.type = "all"; state.all = false; render(); fitPages();
    var sec = $("#publications"); if (sec) sec.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  $$(".theme__go").forEach(function (b) { b.addEventListener("click", function () { selectTheme(b.dataset.filter); }); });
  window.addEventListener("net:select", function (e) { selectTheme(e.detail); });

  buildFilters(); render();

  /* ---------- long lists: first N items, then "show all" ---------- */
  var LISTS = [];
  $$("[data-limit]").forEach(function (list) {
    var L = { list: list, items: Array.prototype.slice.call(list.children), max: parseInt(list.getAttribute("data-limit"), 10), min: parseInt(list.getAttribute("data-min") || "1", 10), open: false };
    L.n = L.max;
    L.btn = document.createElement("button");
    L.btn.type = "button"; L.btn.className = "more-btn"; L.btn.setAttribute("aria-expanded", "false");
    L.btn.addEventListener("click", function () {
      L.open = !L.open; applyList(L);
      if (!L.open) { fitPages(); var sec = list.closest("section"); if (sec) sec.scrollIntoView(); }
    });
    list.parentNode.insertBefore(L.btn, list.nextSibling);
    LISTS.push(L); applyList(L);
  });
  function applyList(L) {
    L.items.forEach(function (li, i) { li.hidden = !L.open && i >= L.n; });
    L.btn.hidden = L.items.length <= L.n;
    L.btn.setAttribute("aria-expanded", String(L.open));
    L.btn.textContent = L.open ? "Show less" : "Show all " + L.items.length;
  }

  /* ---------- one section = one screen ----------
     On computers every section is exactly one screen tall (CSS). Here we make sure the
     content also fits: if a section is too tall, its lists show fewer items (never fewer
     than one); the rest stays behind "Show all". Phones scroll normally. */
  var pageMode = window.matchMedia("(min-width: 900px) and (min-height: 600px)");
  function contentHeight(sec) {
    var h = 0, kids = sec.children;
    for (var i = 0; i < kids.length; i++) if (!kids[i].hidden) h = Math.max(h, kids[i].offsetTop + kids[i].offsetHeight);
    return h + parseFloat(getComputedStyle(sec).paddingBottom);
  }
  function fitPages() {
    LISTS.forEach(function (L) { if (!L.open) { L.n = L.max; applyList(L); } });
    if (!state.all && PUB_LIMIT !== PUB_DEFAULT) { PUB_LIMIT = PUB_DEFAULT; render(); }
    if (!pageMode.matches) return;
    var H = window.innerHeight;
    $$("main > section").forEach(function (sec) {
      var ls = LISTS.filter(function (L) { return !L.open && sec.contains(L.list); });
      var pubs = sec.id === "publications" && !state.all;
      for (var guard = 0; guard < 60 && contentHeight(sec) > H; guard++) {
        // shrink whichever list currently shows the most items
        var best = null;
        ls.forEach(function (L) { if (L.n > L.min && (!best || L.n > best.n)) best = L; });
        if (pubs && PUB_LIMIT > 1 && (!best || PUB_LIMIT >= best.n)) { PUB_LIMIT--; render(); continue; }
        if (!best) break;
        best.n--; applyList(best);
      }
    });
  }
  var ft; window.addEventListener("resize", function () { clearTimeout(ft); ft = setTimeout(fitPages, 150); });
  fitPages();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPages);
  window.addEventListener("load", fitPages);

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
