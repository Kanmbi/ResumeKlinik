/* RésuméKlinik — Insights: renders posts from posts.js */
(function () {
  'use strict';
  var POSTS = (window.RK_POSTS || []).slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  var C = window.RK_CONFIG || {};
  var F = C.founder || {};
  var MEDIA = '/assets/media/';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };

  var AUTH = {
    founder: { name: F.name || 'Founder', img: MEDIA + 'photos/founder.jpg', cls: '', link: F.linkedin },
    company: { name: 'RésuméKlinik', img: MEDIA + 'brand/icon-512.png', cls: 'lg', link: (C.socials || {}).linkedin }
  };
  function fmtDate(d) {
    if (!d) return '';
    var p = d.split('-'); var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+p[1] - 1];
    return (+p[2]) + ' ' + m + ' ' + p[0];
  }
  function readTime(b) { return Math.max(1, Math.round((b || '').split(/\s+/).length / 220)) + ' min read'; }
  function plain(b) { return (b || '').replace(/^#+\s*/gm, '').replace(/^- /gm, '').replace(/\s+/g, ' ').trim(); }
  function format(b) {
    var out = [], list = null;
    (b || '').split('\n').forEach(function (line) {
      var l = line.trim();
      if (/^- /.test(l)) { if (!list) { list = []; } list.push('<li>' + esc(l.slice(2)) + '</li>'); return; }
      if (list) { out.push('<ul>' + list.join('') + '</ul>'); list = null; }
      if (!l) return;
      if (/^##\s/.test(l)) out.push('<h3>' + esc(l.replace(/^##\s*/, '')) + '</h3>');
      else out.push('<p>' + esc(l) + '</p>');
    });
    if (list) out.push('<ul>' + list.join('') + '</ul>');
    // merge consecutive <p> created from single line breaks inside a paragraph block
    return out.join('');
  }
  function card(p) {
    var a = AUTH[p.author] || AUTH.company;
    var thumb = p.image
      ? '<img src="' + MEDIA + 'insights/' + encodeURI(p.image) + '" alt="" loading="lazy">'
      : '<div class="gen"><small>' + esc(p.topic || 'Insight') + '</small><b>' + esc(p.title) + '</b></div>';
    return '<button class="post reveal" type="button" data-slug="' + esc(p.slug) + '">' +
      '<div class="thumb' + (p.author === 'company' && !p.image ? ' company' : '') + '">' + thumb + '</div>' +
      '<div class="body"><div class="meta"><span class="topic">' + esc(p.topic || 'Insight') + '</span><span>' + readTime(p.body) + '</span></div>' +
      '<h3>' + esc(p.title) + '</h3><p>' + esc(plain(p.body).slice(0, 220)) + '</p>' +
      '<div class="byline"><img class="' + a.cls + '" src="' + a.img + '" alt=""><span><b>' + esc(a.name) + '</b><small>' + fmtDate(p.date) + '</small></span></div></div></button>';
  }

  /* ---------- Reader ---------- */
  var reader, current = -1, list = POSTS;
  function buildReader() {
    reader = document.createElement('div');
    reader.className = 'reader';
    reader.setAttribute('role', 'dialog');
    reader.setAttribute('aria-modal', 'true');
    reader.setAttribute('aria-label', 'Article');
    reader.innerHTML = '<div class="scrim" data-close></div><article tabindex="-1"><div class="r-top"><span class="r-author"></span><button class="close" type="button" data-close aria-label="Close">×</button><span class="r-progress"></span></div><div class="r-body"></div></article>';
    document.body.appendChild(reader);
    reader.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); var nav = e.target.closest('[data-go]'); if (nav) open(+nav.getAttribute('data-go')); });
    document.addEventListener('keydown', function (e) { if (reader.classList.contains('open') && e.key === 'Escape') close(); });
    var art = $('article', reader);
    art.addEventListener('scroll', function () { var m = art.scrollHeight - art.clientHeight; $('.r-progress', reader).style.width = (m > 0 ? art.scrollTop / m * 100 : 0) + '%'; });
  }
  var lastFocus;
  function open(i) {
    var p = list[i]; if (!p) return;
    if (!reader) buildReader();
    current = i; lastFocus = lastFocus || document.activeElement;
    var a = AUTH[p.author] || AUTH.company;
    var url = location.origin + '/insights?post=' + encodeURIComponent(p.slug);
    var wa = 'https://wa.me/?text=' + encodeURIComponent(p.title + ' ' + url);
    var li = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
    $('.r-author', reader).innerHTML = '<span class="byline" style="margin:0;padding:0"><img class="' + a.cls + '" src="' + a.img + '" alt=""><span><b>' + esc(a.name) + '</b><small>' + fmtDate(p.date) + ' · ' + readTime(p.body) + '</small></span></span>';
    var hero = p.image ? '<div class="r-hero"><img src="' + MEDIA + 'insights/' + encodeURI(p.image) + '" alt=""></div>' : '';
    var embed = p.embed ? '<div class="embed"><iframe src="' + esc(p.embed) + '" title="LinkedIn post" loading="lazy" allowfullscreen></iframe></div>' : '';
    var prev = list[i + 1] ? '<button class="btn btn-outline btn-sm" type="button" data-go="' + (i + 1) + '">← Older</button>' : '<span></span>';
    var next = list[i - 1] ? '<button class="btn btn-outline btn-sm" type="button" data-go="' + (i - 1) + '">Newer →</button>' : '<span></span>';
    $('.r-body', reader).innerHTML =
      '<span class="tag">' + esc(p.topic || 'Insight') + '</span><h1>' + esc(p.title) + '</h1>' + hero +
      '<div class="content">' + format(p.body) + '</div>' + embed +
      '<div class="share">' +
        (p.linkedin ? '<a class="btn btn-dark btn-sm" href="' + esc(p.linkedin) + '" target="_blank" rel="noopener">View on LinkedIn</a>' : '') +
        '<a class="btn btn-outline btn-sm" href="' + li + '" target="_blank" rel="noopener">Share on LinkedIn</a>' +
        '<a class="btn btn-outline btn-sm" href="' + wa + '" target="_blank" rel="noopener">Share on WhatsApp</a>' +
        '<button class="btn btn-outline btn-sm" type="button" data-copy="' + esc(url) + '">Copy link</button>' +
        (a.link ? '<a class="btn btn-primary btn-sm" href="' + esc(a.link) + '" target="_blank" rel="noopener">Follow ' + esc(a.name) + '</a>' : '') +
      '</div><div class="r-nav">' + prev + next + '</div>';
    var cp = $('[data-copy]', reader);
    cp.addEventListener('click', function () { (navigator.clipboard ? navigator.clipboard.writeText(cp.getAttribute('data-copy')) : Promise.reject()).then(function () { cp.textContent = 'Link copied'; }, function () { cp.textContent = 'Copy failed'; }); });
    reader.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    if (window.__lenis) window.__lenis.stop();
    var art = $('article', reader); art.scrollTop = 0; art.focus();
    if ($('#insight-grid') && history.replaceState) history.replaceState(null, '', '?post=' + encodeURIComponent(p.slug));
  }
  function close() {
    reader.classList.remove('open');
    document.documentElement.style.overflow = '';
    if (window.__lenis) window.__lenis.start();
    if ($('#insight-grid') && history.replaceState) history.replaceState(null, '', location.pathname);
    if (lastFocus && lastFocus.focus) lastFocus.focus(); lastFocus = null;
  }

  function ready(fn) { document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    /* Home: latest posts */
    var latest = $('#latest-posts');
    if (latest) {
      var top3 = POSTS.slice(0, 3);
      if (!top3.length) { var s = latest.closest('section'); if (s) s.hidden = true; }
      latest.innerHTML = top3.map(card).join('');
      latest.addEventListener('click', function (e) { var b = e.target.closest('.post'); if (b) { list = POSTS; open(POSTS.findIndex(function (p) { return p.slug === b.getAttribute('data-slug'); })); } });
    }

    /* Insights page */
    var grid = $('#insight-grid');
    if (!grid) { observe(); return; }
    var state = { author: 'all', topic: 'all', q: '' };
    var topicsBox = $('#topics');
    function topicsFor(author) {
      var seen = {};
      POSTS.forEach(function (p) { if (author === 'all' || p.author === author) seen[p.topic || 'Insight'] = 1; });
      return Object.keys(seen);
    }
    function drawTopics() {
      var ts = topicsFor(state.author);
      if (state.topic !== 'all' && ts.indexOf(state.topic) < 0) state.topic = 'all';
      topicsBox.innerHTML = ['all'].concat(ts).map(function (t) { return '<button type="button" data-topic="' + esc(t) + '" aria-pressed="' + (state.topic === t) + '">' + (t === 'all' ? 'All topics' : esc(t)) + '</button>'; }).join('');
    }
    function draw() {
      var q = state.q.toLowerCase();
      list = POSTS.filter(function (p) {
        return (state.author === 'all' || p.author === state.author) &&
          (state.topic === 'all' || (p.topic || 'Insight') === state.topic) &&
          (!q || (p.title + ' ' + p.body + ' ' + p.topic).toLowerCase().indexOf(q) >= 0);
      });
      if (list.length) grid.innerHTML = list.map(card).join('');
      else if (state.author === 'founder' && !q) grid.innerHTML = '<div class="empty"><h3 style="margin-bottom:8px">' + esc(F.name || 'The founder') + '\u2019s LinkedIn posts will appear here</h3><p style="margin:0 auto 18px;max-width:460px">New posts are added regularly. Follow on LinkedIn to read them as soon as they go live.</p>' + (F.linkedin ? '<a class="btn btn-dark btn-sm" href="' + esc(F.linkedin) + '" target="_blank" rel="noopener">Follow on LinkedIn</a>' : '') + '</div>';
      else grid.innerHTML = '<div class="empty"><h3 style="margin-bottom:8px">No posts match your search</h3><p style="margin:0">Try another word or clear the filters.</p></div>';
      $('#count').textContent = list.length + (list.length === 1 ? ' post' : ' posts');
      observe();
    }
    $$('.tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.author = b.getAttribute('data-author');
        $$('.tabs button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        drawTopics(); draw();
      });
    });
    topicsBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; state.topic = b.getAttribute('data-topic'); drawTopics(); draw(); });
    var t; $('#search').addEventListener('input', function (e) { clearTimeout(t); t = setTimeout(function () { state.q = e.target.value.trim(); draw(); }, 150); });
    grid.addEventListener('click', function (e) { var b = e.target.closest('.post'); if (b) open(list.findIndex(function (p) { return p.slug === b.getAttribute('data-slug'); })); });
    drawTopics(); draw();

    var want = new URLSearchParams(location.search).get('post');
    if (want) { list = POSTS; var i = POSTS.findIndex(function (p) { return p.slug === want; }); if (i >= 0) open(i); }
  });

  function observe() {
    var els = $$('.post.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .1 });
    els.forEach(function (e) { io.observe(e); });
  }
})();
