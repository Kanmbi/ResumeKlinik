/* RésuméKlinik — main script. Settings live in config.js. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduceEarly = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceEarly || !window.gsap) document.documentElement.classList.add('no-motion');

  var C = window.RK_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MEDIA = '/assets/media/';
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  function wa(text) {
    return 'https://wa.me/' + (C.whatsapp || '') + '?text=' + encodeURIComponent(text || 'Hello RésuméKlinik, I would like to enquire about your services.');
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function fileExists(url) {
    return fetch(url, { method: 'HEAD', cache: 'no-store' })
      .then(function (r) { return r.ok && !/text\/html/.test(r.headers.get('content-type') || ''); })
      .catch(function () { return false; });
  }

  function ready(fn) { document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  window.RK = { wa: wa, esc: esc, reduce: reduce };
  ready(function () {

    /* ---------- Contact details from config ---------- */
    $$('[data-wa]').forEach(function (a) { a.href = wa(a.getAttribute('data-wa')); a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-email]').forEach(function (a) { a.href = 'mailto:' + C.email; if (a.hasAttribute('data-fill')) a.textContent = C.email; });
    $$('[data-cvform]').forEach(function (a) { a.href = C.cvFormUrl; a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-social]').forEach(function (a) {
      var url = C.socials && C.socials[a.getAttribute('data-social')];
      if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; } else { a.hidden = true; }
    });
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    /* ---------- Header + mobile menu ---------- */
    var header = $('.header'), bar = $('.scroll-progress'), top = $('.to-top'), ring = $('.to-top .ring circle'), lastY = 0;
    var RC = 2 * Math.PI * 21; if (ring) { ring.style.strokeDasharray = RC; }
    var onScroll = function () {
      var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? y / max : 0;
      if (header) {
        header.classList.toggle('scrolled', y > 8);
        var drawerOpen = document.body.style.overflow === 'hidden';
        header.classList.toggle('hide', !drawerOpen && y > 400 && y > lastY);
      }
      if (bar) bar.style.setProperty('--p', p.toFixed(4));
      if (top) { top.classList.toggle('show', y > 800); if (ring) ring.style.strokeDashoffset = RC * (1 - p); }
      lastY = y;
    };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    if (top) top.addEventListener('click', function () { if (window.__lenis) window.__lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

    /* ---------- Founder details ---------- */
    var F = C.founder || {};
    $$('[data-founder-name]').forEach(function (el) { el.textContent = F.name || ''; });
    $$('[data-founder-title]').forEach(function (el) { el.textContent = F.title || ''; });
    $$('[data-founder-linkedin]').forEach(function (a) { if (F.linkedin) { a.href = F.linkedin; a.target = '_blank'; a.rel = 'noopener'; } else a.hidden = true; });

    var burger = $('.burger'), drawer = $('#drawer');
    if (burger && drawer) {
      var setOpen = function (open) {
        burger.setAttribute('aria-expanded', String(open));
        drawer.classList.toggle('open', open);
        if (open) drawer.removeAttribute('inert'); else drawer.setAttribute('inert', '');
        document.body.style.overflow = open ? 'hidden' : '';
      };
      burger.addEventListener('click', function () { setOpen(burger.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
      $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    }

    /* ---------- Optional media: hide or fall back when a file is missing ---------- */
    $$('img[data-optional]').forEach(function (img) {
      var fail = function () {
        var target = img.getAttribute('data-hide') ? img.closest(img.getAttribute('data-hide')) : img;
        if (target) target.hidden = true;
        var fb = img.getAttribute('data-fallback') && document.getElementById(img.getAttribute('data-fallback'));
        if (fb) fb.hidden = false;
      };
      if (img.complete && img.naturalWidth === 0) fail(); else img.addEventListener('error', fail);
    });
    $$('video[data-src]').forEach(function (v) {
      var src = v.getAttribute('data-src');
      fileExists(src).then(function (ok) {
        if (!ok) return;
        v.src = src; v.hidden = false;
        var hide = v.getAttribute('data-replaces') && document.getElementById(v.getAttribute('data-replaces'));
        if (hide) hide.hidden = true;
        var box = v.closest('[data-video-box]'); if (box) box.hidden = false;
        if (v.autoplay && !reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      });
    });

    /* ---------- Stats ---------- */
    var statsEl = $('#stats');
    if (statsEl && C.stats) {
      statsEl.innerHTML = C.stats.map(function (s) {
        return '<div class="stat"><b data-count="' + (s.count ? s.value : '') + '" data-suffix="' + esc(s.suffix || '') + '">' + esc(s.value) + esc(s.suffix || '') + '</b><span>' + esc(s.label) + '</span></div>';
      }).join('');
    }

    /* ---------- Pricing ---------- */
    if (C.packages) {
      $$('[data-pricing]').forEach(function (priceEl) {
        priceEl.innerHTML = C.packages.map(function (p) {
          var price = p.price ? '<div class="price">' + esc(C.currency || '') + esc(p.price) + (p.unit ? ' <small>' + esc(p.unit) + '</small>' : '') + '</div>' : '<div class="price quote">Request a quote' + (p.unit ? ' <small>· priced ' + esc(p.unit) + '</small>' : '') + '</div>';
          return '<article class="plan' + (p.featured ? ' featured' : '') + ' reveal">' +
            (p.featured ? '<span class="ribbon">Most popular</span>' : '') +
            '<h3>' + esc(p.name) + '</h3><p class="desc">' + esc(p.description) + '</p>' + price +
            '<ul>' + p.features.map(function (f) { return '<li>' + CHECK + '<span>' + esc(f) + '</span></li>'; }).join('') + '</ul>' +
            '<a class="btn ' + (p.featured ? 'btn-primary' : 'btn-outline') + ' btn-block" href="/contact?service=' + encodeURIComponent(p.id) + '">Choose ' + esc(p.name) + '</a></article>';
        }).join('');
      });
    }

    /* ---------- Testimonials ---------- */
    var tEl = $('#testimonials');
    if (tEl && C.testimonials) {
      var many = C.testimonials.length >= 3 && !reduce;
      var cardsHtml = C.testimonials.map(function (t) {
        var initials = (t.name || '?').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
        var av = t.photo ? '<img src="' + MEDIA + 'testimonials/' + encodeURI(t.photo) + '" alt="" loading="lazy">' : initials;
        return '<figure class="quote-card reveal" style="margin:0"><div class="qmark" aria-hidden="true">“</div>' +
          '<blockquote>' + esc(t.quote) + '</blockquote>' +
          '<figcaption class="person"><span class="avatar">' + av + '</span><span><b>' + esc(t.name) + '</b><small>' + esc(t.role) + '</small></span></figcaption></figure>';
      }).join('');
      if (many) { tEl.className = 't-marquee'; tEl.innerHTML = '<div class="t-track">' + cardsHtml + cardsHtml.replace(/ reveal/g, '') + '</div>'; }
      else { tEl.classList.toggle('single', C.testimonials.length === 1); tEl.innerHTML = cardsHtml; }
    }

    /* ---------- Client logos ---------- */
    var logoBox = $('#logos');
    if (logoBox) {
      var list = (C.clientLogos || []);
      if (!list.length) { logoBox.hidden = true; }
      else {
        var imgs = list.map(function (f) { return '<img src="' + MEDIA + 'clients/' + encodeURI(f) + '" alt="" loading="lazy">'; }).join('');
        $('.marquee-track', logoBox).innerHTML = imgs + imgs;
      }
    }

    /* ---------- Downloads (only files that exist) ---------- */
    var dls = $$('[data-downloads-list]');
    if (dls.length) {
      Promise.all((C.downloads || []).map(function (d) {
        var url = MEDIA + 'docs/' + d.file;
        return fileExists(url).then(function (ok) { return ok ? '<a class="download" href="' + url + '" download><span class="ico">PDF</span><span><b>' + esc(d.title) + '</b><small>' + esc(d.note) + '</small></span></a>' : ''; });
      })).then(function (items) {
        var ext = (C.externalResources || []).map(function (r) { return '<a class="download" href="' + esc(r.url) + '" target="_blank" rel="noopener"><span class="ico" style="background:var(--lime-50);color:var(--lime-600)">GET</span><span><b>' + esc(r.title) + '</b><small>' + esc(r.note) + '</small></span></a>'; });
        var html = items.concat(ext).join('');
        if (html) dls.forEach(function (dl) { dl.innerHTML = html; var sec = dl.closest('[data-downloads]'); if (sec) sec.hidden = false; });
      });
    }

    /* ---------- Simple Netlify forms (newsletter, employer interest) ---------- */
    $$('form[data-ajax]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!f.checkValidity()) { f.reportValidity(); return; }
        var btn = $('button[type="submit"]', f), msg = $('[data-msg]', f.parentNode);
        btn.disabled = true;
        fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(f)).toString() })
          .then(function (r) { if (!r.ok) throw 0; f.hidden = true; if (msg) { msg.hidden = false; msg.textContent = f.getAttribute('data-ok') || 'Thank you.'; } })
          .catch(function () { btn.disabled = false; if (msg) { msg.hidden = false; msg.textContent = 'That did not go through. Please try again.'; } });
      });
    });

    /* ---------- Reveal on scroll ---------- */
    var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
        var ev = e.target.getAttribute('data-on-view');
        if (ev && handlers[ev]) handlers[ev](e.target);
      });
    }, { threshold: 0.18 }) : null;

    var handlers = {
      counters: function (root) {
        $$('[data-count]', root).forEach(function (el) {
          var end = parseFloat(el.getAttribute('data-count')); if (!end) return;
          var suf = el.getAttribute('data-suffix') || '';
          if (reduce) { el.textContent = end + suf; return; }
          var t0 = null, dur = 1600;
          var step = function (t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); var v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = v + suf; if (p < 1) requestAnimationFrame(step); };
          requestAnimationFrame(step);
        });
      },
      steps: function (root) {
        var items = $$('li', root), i = 0;
        var tick = function () { if (i >= items.length) return; items[i].classList.add('done'); i++; root.style.setProperty('--progress', Math.min(100, (i - 1) / (items.length - 1) * 100) + '%'); setTimeout(tick, reduce ? 0 : 450); };
        tick();
      },
      compare: function (root) {
        if (reduce) return;
        var input = $('input', root), frames = [50, 30, 70, 50], k = 0;
        var go = function () { if (k >= frames.length) return; animateTo(frames[k++], go); };
        var animateTo = function (to, done) {
          var from = parseFloat(input.value), t0 = null;
          var st = function (t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 600, 1); var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; input.value = from + (to - from) * e; root.style.setProperty('--pos', input.value + '%'); if (p < 1) requestAnimationFrame(st); else done(); };
          requestAnimationFrame(st);
        };
        setTimeout(go, 300);
      }
    };

    $$('.reveal, [data-on-view]').forEach(function (el) {
      if (io) io.observe(el); else { el.classList.add('in'); }
    });

    /* ---------- Hero score card ---------- */
    var score = $('#hero-score');
    if (score) {
      var ring = $('#hero-ring'), end = 91, start = 42, C2 = 2 * Math.PI * 26;
      ring.style.strokeDasharray = C2;
      var paint = function (v) { score.textContent = v; ring.style.strokeDashoffset = C2 * (1 - v / 100); };
      paint(reduce ? end : start);
      setTimeout(function () {
        $$('.bar i').forEach(function (b) { b.style.width = b.getAttribute('data-w'); });
        if (reduce) return;
        var t0 = null;
        var st = function (t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1600, 1); paint(Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(st); };
        requestAnimationFrame(st);
      }, 700);
    }

    /* ---------- Before / after slider ---------- */
    $$('.compare').forEach(function (box) {
      var input = $('input', box);
      var set = function () { box.style.setProperty('--pos', input.value + '%'); };
      input.addEventListener('input', set); set();
    });

    /* ---------- CV check-up ---------- */
    var quiz = $('#checkup-form');
    if (quiz) {
      var advice = {
        q1: 'Open with a 3–4 line summary written for the exact role you want.',
        q2: 'Add a number to most bullet points: revenue, percentage, team size or time saved.',
        q3: 'Remove tables, columns, text boxes and graphics so ATS software can read your CV.',
        q4: 'Keep it to two pages. Detail the last 10 years and summarise the rest.',
        q5: 'Tailor your CV for each type of role you apply for.',
        q6: 'Rewrite your LinkedIn headline to show what you do and the value you bring.',
        q7: 'Few interviews usually means your CV is not passing the first 10-second scan.',
        q8: 'Put your biggest achievement near the top so it is seen immediately.'
      };
      var total = 8, card = $('#result-card'), arc = $('#arc'), num = $('#score'), prog = $('#answered');
      var circ = 2 * Math.PI * 70; arc.style.strokeDasharray = circ; arc.style.strokeDashoffset = circ;
      var calc = function () {
        var sum = 0, n = 0, weak = [];
        for (var i = 1; i <= total; i++) {
          var v = quiz.querySelector('input[name="q' + i + '"]:checked');
          if (v) { n++; sum += +v.value; if (+v.value < 2) weak.push('q' + i); }
        }
        var s = n ? Math.round(sum / (n * 2) * 100) : 0;
        num.textContent = n ? s : '–';
        arc.style.strokeDashoffset = circ * (1 - s / 100);
        arc.style.stroke = s >= 80 ? '#5E9423' : s >= 50 ? '#8DC63F' : '#F79009';
        prog.textContent = n + ' of ' + total + ' answered';
        if (n === total) {
          var title = s >= 80 ? 'Strong CV, ready to sharpen' : s >= 50 ? 'Good start, needs a tune-up' : 'Your CV needs attention';
          $('#r-title').textContent = title;
          $('#r-list').innerHTML = weak.slice(0, 4).map(function (k) { return '<li>' + esc(advice[k]) + '</li>'; }).join('') || '<li>Keep tailoring your CV to each application.</li>';
          $('#r-wa').href = wa('Hello RésuméKlinik, I scored ' + s + '/100 on your CV check-up. I would like a professional review.');
          card.classList.add('done');
        } else card.classList.remove('done');
      };
      quiz.addEventListener('change', calc); calc();
    }

    /* ---------- Contact: two-step enquiry form (Netlify Forms) ---------- */
    var form = $('#enquiry-form');
    if (form) {
      var steps = $$('[data-step]', form), bars = $$('.form-steps span');
      var show = function (n) {
        steps.forEach(function (s) { s.hidden = +s.getAttribute('data-step') !== n; });
        bars.forEach(function (b, i) { b.classList.toggle('on', i < n); });
      };
      var qs = new URLSearchParams(location.search).get('service');
      if (qs) { var pre = form.querySelector('input[name="service"][data-id="' + qs + '"]'); if (pre) pre.checked = true; }
      show(1);
      $('[data-next]', form).addEventListener('click', function () {
        var picked = form.querySelector('input[name="service"]:checked');
        $('#service-err').hidden = !!picked;
        if (picked) { show(2); var f = $('#f-name'); if (f) f.focus(); }
      });
      $('[data-back]', form).addEventListener('click', function () { show(1); });

      var validate = function () {
        var ok = true;
        $$('[data-step="2"] [required]', form).forEach(function (inp) {
          var field = inp.closest('.field'); var bad = !inp.checkValidity();
          field.classList.toggle('invalid', bad); if (bad && ok) { inp.focus(); ok = false; }
        });
        return ok;
      };
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate()) return;
        var btn = $('button[type="submit"]', form), err = $('#form-error');
        btn.disabled = true; btn.textContent = 'Sending…'; err.hidden = true;
        var data = new FormData(form);
        fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() })
          .then(function (r) { if (!r.ok) throw new Error(r.status); })
          .then(function () {
            $('#done-wa').href = wa('Hello RésuméKlinik, I have just sent an enquiry on your website. Name: ' + data.get('name') + '. Service: ' + data.get('service') + '.');
            form.hidden = true; $('#form-success').hidden = false; $('#form-success h2').focus();
          })
          .catch(function () { btn.disabled = false; btn.textContent = 'Send enquiry'; err.hidden = false; });
      });
    }
  });
})();
