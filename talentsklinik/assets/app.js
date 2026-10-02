/* Talents Klinik — app */
(function () {
  'use strict';
  var C = window.TK_CONFIG || {};
  var BASE = (C.base || '').replace(/\/$/, '');
  var SITE = C.siteUrl || 'https://resumeklinik.com';
  var HAS_DB = !!(C.supabaseUrl && C.supabaseAnonKey && window.supabase);
  var sb = HAS_DB ? window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
  var LS_KEY = 'tk_guest_v2';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };
  var uid = function () { return Math.random().toString(36).slice(2, 10); };
  var asset = function (p) { return BASE + '/assets/' + p; };

  /* ---------------- Icons ---------------- */
  function ic(d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }
  var I = {
    home: ic('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>'),
    user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    doc: ic('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
    brain: ic('<path d="M9 3a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 9.3a3 3 0 0 0 .8 4.8A3 3 0 0 0 8 19a3 3 0 0 0 4 1V5a2 2 0 0 0-3-2zM15 3a3 3 0 0 1 3 3v.5a3 3 0 0 1 2 2.8 3 3 0 0 1-.8 4.8A3 3 0 0 1 16 19a3 3 0 0 1-4 1"/>'),
    target: ic('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
    book: ic('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>'),
    award: ic('<circle cx="12" cy="9" r="6"/><path d="m8.5 14 -1.5 7 5-3 5 3-1.5-7"/>'),
    hand: ic('<path d="m11 17 2 2a2 2 0 0 0 3-3"/><path d="m14 14 2.5 2.5a2 2 0 0 0 3-3l-3.9-3.9a3 3 0 0 0-4.2 0l-.9.9a2 2 0 0 1-3-3l2.8-2.8a5 5 0 0 1 6.4-.5L21 6"/><path d="m21 3-1 10M3 4l1 10 6 6"/>'),
    mail: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    li: ic('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>'),
    chat: ic('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.5A8 8 0 1 1 21 12z"/>'),
    menu: ic('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    check: ic('<path d="M20 6 9 17l-5-5"/>'),
    circlecheck: ic('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),
    upload: ic('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'),
    arrow: ic('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    cog: ic('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15.4H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    spark: ic('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>'
  };

  /* ---------------- State ---------------- */
  var S = { user: null, session: null, guest: false, data: blank(), chat: [], route: 'dashboard', saveTimer: null };
  function blank() { return { profile: { industries: [], skills: [] }, cv: null, persona: null, gaps: null, plan: [], certs: [], match: null, roles: null, letters: [], linkedin: null }; }
  function merge(base, extra) { var o = blank(); for (var k in o) { if (extra && extra[k] != null) o[k] = extra[k]; else if (base && base[k] != null) o[k] = base[k]; } o.profile = Object.assign({ industries: [], skills: [] }, o.profile || {}); return o; }

  function loadLocal() { try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) { return null; } }
  function saveLocal(d) { try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch (e) {} }

  function save(msg) {
    S.data.updated = new Date().toISOString();
    if (!S.user) { saveLocal(S.data); if (msg) toast(msg); return Promise.resolve(); }
    clearTimeout(S.saveTimer);
    return new Promise(function (res) {
      S.saveTimer = setTimeout(function () {
        sb.from('tk_profiles').upsert({ user_id: S.user.id, email: S.user.email, data: S.data, match_opt_in: !!(S.data.match && S.data.match.optIn), updated_at: new Date().toISOString() })
          .then(function (r) { if (r.error) { toast('Could not save. Check your connection.'); console.error(r.error); } else if (msg) toast(msg); res(); });
      }, 250);
    });
  }
  function loadRemote() {
    return sb.from('tk_profiles').select('data').eq('user_id', S.user.id).maybeSingle().then(function (r) {
      if (r.error) { console.error(r.error); return null; }
      return r.data ? r.data.data : null;
    });
  }

  /* ---------------- Helpers ---------------- */
  function toast(t) { var el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('show'); }, 2600); }
  function wa(text) { if (!text && C.whatsappLink) return C.whatsappLink; return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(text || 'Hello Talents Klinik, I need some help with the platform.'); }
  function fmt(d) { if (!d) return ''; var x = new Date(d); return x.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function firstName() { return (S.data.profile.firstName || '').trim() || (S.user && S.user.email ? S.user.email.split('@')[0] : 'there'); }
  function initials() { var p = S.data.profile; var s = ((p.firstName || '')[0] || '') + ((p.lastName || '')[0] || ''); return (s || (S.user ? S.user.email[0] : 'G')).toUpperCase(); }
  function canAI() { return !HAS_DB || !!S.user; }
  function aiGate() {
    return '<div class="panel empty-state"><div class="ic">' + I.spark + '</div><h3>Create a free account to use AI tools</h3><p>AI features are available to registered members so we can keep them fast and free. It takes less than a minute.</p><button class="btn btn-primary" data-action="to-auth">Create free account</button></div>';
  }
  function ai(task, input) {
    var headers = { 'Content-Type': 'application/json' };
    if (S.session) headers.Authorization = 'Bearer ' + S.session.access_token;
    return fetch(BASE + '/api/ai', { method: 'POST', headers: headers, body: JSON.stringify({ task: task, input: input }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || 'Something went wrong. Please try again.'); return j; }); });
  }
  function loading(text) { return '<div class="loading"><span class="spinner"></span><div style="flex:1"><b style="color:var(--navy-700)">' + esc(text) + '</b><div class="skel" style="width:70%;margin-top:10px"></div><div class="skel" style="width:45%"></div></div></div>'; }
  function errorBox(msg) { return '<div class="notice err">' + esc(msg) + '</div>'; }
  function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function readFile(file) {
    var name = (file.name || '').toLowerCase();
    if (file.size > 8 * 1024 * 1024) return Promise.reject(new Error('That file is over 8 MB. Try a smaller file or paste the text.'));
    if (/\.txt$/.test(name)) return file.text();
    if (/\.pdf$/.test(name)) {
      return (window.pdfjsLib ? Promise.resolve() : loadScript(asset('vendor/pdf.min.js'))).then(function () {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = asset('vendor/pdf.worker.min.js');
        return file.arrayBuffer().then(function (buf) { return window.pdfjsLib.getDocument({ data: buf }).promise; });
      }).then(function (pdf) {
        var pages = []; for (var i = 1; i <= Math.min(pdf.numPages, 8); i++) pages.push(pdf.getPage(i).then(function (p) { return p.getTextContent(); }).then(function (tc) { return tc.items.map(function (it) { return it.str + (it.hasEOL ? '\n' : ' '); }).join(''); }));
        return Promise.all(pages).then(function (t) { return t.join('\n\n'); });
      });
    }
    if (/\.docx$/.test(name)) {
      return (window.mammoth ? Promise.resolve() : loadScript(asset('vendor/mammoth.browser.min.js'))).then(function () {
        return file.arrayBuffer().then(function (buf) { return window.mammoth.extractRawText({ arrayBuffer: buf }); }).then(function (r) { return r.value; });
      });
    }
    return Promise.reject(new Error('Please upload a PDF, Word (.docx) or text file.'));
  }
  function ring(score, size) {
    var r = 70, c = 2 * Math.PI * r, col = score >= 75 ? '#5E9423' : score >= 50 ? '#8DC63F' : '#F79009';
    return '<div class="big-ring"' + (size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '') + '><svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="' + r + '" fill="none" stroke="#F2F4F7" stroke-width="12"/><circle cx="80" cy="80" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + c + '" data-to="' + (c * (1 - score / 100)) + '"/></svg><div><div><b>' + score + '</b><small>out of 100</small></div></div></div>';
  }
  function meter(label, v, note) { return '<div class="meter"><div class="lbl">' + esc(label) + '<span>' + (note || (v + '%')) + '</span></div><div class="tr"><i style="width:0" data-w="' + v + '%"></i></div></div>'; }
  function animate(root) {
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      $$('[data-to]', root).forEach(function (c) { c.style.strokeDashoffset = c.getAttribute('data-to'); });
      $$('[data-w]', root).forEach(function (i) { i.style.width = i.getAttribute('data-w'); });
    }); });
  }
  function copy(text, btn) {
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { if (btn) { var o = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = o; }, 1500); } toast('Copied to clipboard'); }, function () { toast('Copy failed. Select the text and copy it manually.'); });
  }
  function download(name, text, type) {
    var b = new Blob([text], { type: type || 'text/plain' }), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------------- Progress ---------------- */
  var PROFILE_REQ = ['firstName', 'lastName', 'location', 'educationLevel', 'course', 'targetRole'];
  function progress() {
    var d = S.data, p = d.profile;
    var pf = PROFILE_REQ.filter(function (k) { return (p[k] || '').toString().trim(); }).length + ((p.skills || []).length >= 3 ? 1 : 0);
    var p1 = Math.round(pf / (PROFILE_REQ.length + 1) * 100);
    var p2 = Math.round(((d.cv ? 1 : 0) + (d.persona ? 1 : 0) + (d.gaps ? 1 : 0)) / 3 * 100);
    var p3 = d.plan.length ? Math.round(d.plan.filter(function (x) { return x.done; }).length / d.plan.length * 100) : 0;
    var p4 = Math.min(100, d.certs.length * 50);
    var p5 = d.match && d.match.optIn ? 100 : (d.roles ? 40 : 0);
    return [p1, p2, p3, p4, p5];
  }
  function nextStep() {
    var d = S.data, pr = progress();
    if (pr[0] < 100) return { route: 'profile', icon: I.user, title: 'Complete your profile', text: 'Tell us about your education and the role you want. Everything else builds on this.' };
    if (!d.cv) return { route: 'cv', icon: I.doc, title: 'Get your CV reviewed', text: 'Upload your CV for an instant score and the fixes that matter most.' };
    if (!d.persona) return { route: 'personality', icon: I.brain, title: 'Take the personality assessment', text: 'Twenty quick questions reveal how you work best.' };
    if (!d.gaps) return { route: 'skills', icon: I.target, title: 'Find your skill gaps', text: 'See what stands between you and ' + (d.profile.targetRole || 'your target role') + '.' };
    if (!d.plan.length || pr[2] < 100) return { route: 'learning', icon: I.book, title: d.plan.length ? 'Keep learning' : 'Build your learning plan', text: d.plan.length ? pr[2] + '% of your plan is done. Keep going.' : 'Turn your skill gaps into a plan you can tick off.' };
    if (!d.certs.length) return { route: 'certificates', icon: I.award, title: 'Add your certificates', text: 'Record certificates you earn so employers can see them.' };
    if (!(d.match && d.match.optIn)) return { route: 'match', icon: I.hand, title: 'Get matched with employers', text: 'Opt in and the Talents Klinik team will match you to suitable roles.' };
    return { route: 'coach', icon: I.chat, title: 'You are ready. Ask the coach anything', text: 'Prepare for interviews, salary talks and your first 90 days.' };
  }

  /* ---------------- Navigation ---------------- */
  var NAV = [
    { group: 'Overview', items: [['dashboard', 'Dashboard', 'home']] },
    { group: 'Phase 1–2 · Profile & assess', items: [['profile', 'My profile', 'user'], ['cv', 'CV review', 'doc'], ['personality', 'Personality', 'brain'], ['skills', 'Skill gap analysis', 'target']] },
    { group: 'Phase 3–4 · Train & certify', items: [['learning', 'Learning plan', 'book'], ['certificates', 'My certificates', 'award']] },
    { group: 'Phase 5 · Get hired', items: [['match', 'Get matched', 'hand'], ['letter', 'Cover letters', 'mail'], ['linkedin', 'LinkedIn optimiser', 'li']] },
    { group: 'Support', items: [['coach', 'AI career coach', 'chat'], ['account', 'Account & data', 'cog']] }
  ];
  var TITLES = { dashboard: ['Dashboard', ''], profile: ['My profile', 'Phase 1'], cv: ['CV review', 'Phase 2'], personality: ['Personality', 'Phase 2'], skills: ['Skill gap analysis', 'Phase 2'], learning: ['Learning plan', 'Phase 3'], certificates: ['My certificates', 'Phase 4'], match: ['Get matched', 'Phase 5'], letter: ['Cover letters', 'Phase 5'], linkedin: ['LinkedIn optimiser', 'Phase 5'], coach: ['AI career coach', 'Support'], account: ['Account & data', 'Support'] };
  function isDone(r) { var d = S.data; return { profile: progress()[0] === 100, cv: !!d.cv, personality: !!d.persona, skills: !!d.gaps, certificates: d.certs.length > 0, match: !!(d.match && d.match.optIn) }[r]; }

  function shell() {
    var nav = NAV.map(function (g) {
      return '<div class="nav-group"><h6>' + g.group + '</h6>' + g.items.map(function (it) {
        return '<a class="nav-item" href="#/' + it[0] + '" data-r="' + it[0] + '">' + I[it[2]] + '<span>' + it[1] + '</span>' + (isDone(it[0]) ? '<span class="done">' + I.circlecheck + '</span>' : '') + '</a>';
      }).join('') + '</div>';
    }).join('');
    var who = S.user ? esc(S.user.email) : 'Guest mode';
    return '<div class="shell">' +
      '<aside class="side" id="side" aria-label="App navigation"><a class="brand" href="#/dashboard"><img src="' + asset('brand/talents-klinik-logo.png') + '" alt="Talents Klinik"></a>' + nav +
      '<div class="side-foot"><div class="me"><span class="av">' + esc(initials()) + '</span><span><b>' + esc((S.data.profile.firstName ? S.data.profile.firstName + ' ' + (S.data.profile.lastName || '') : who)) + '</b><small>' + (S.user ? 'Member' : 'Guest') + '</small></span><button class="menu-btn" type="button" data-action="pop" aria-label="Account menu">⋯</button></div></div></aside>' +
      '<div class="scrim" data-action="close-side"></div>' +
      '<div class="main"><header class="topbar"><button class="m-menu" type="button" data-action="open-side" aria-label="Open menu">' + I.menu + '</button><h1 id="title"></h1><span class="phase" id="phase"></span><span class="spacer"></span>' +
      (S.user ? '' : '<button class="btn btn-dark btn-sm hide-sm" data-action="to-auth">' + (HAS_DB ? 'Sign in' : 'Accounts') + '</button>') +
      '<a class="btn btn-outline btn-sm" href="' + wa() + '" target="_blank" rel="noopener">' + I.wa + '<span class="hide-sm">Support</span></a></header>' +
      (S.user ? '' : '<div class="guest-bar"><span><b>Guest mode.</b> Your work is saved on this device only.</span>' + (HAS_DB ? '<button class="linkbtn" data-action="to-auth">Create a free account to keep it safe</button>' : '') + '</div>') +
      '<main class="view" id="view" tabindex="-1"></main></div>' +
      '<nav class="tabbar" aria-label="Quick navigation">' +
      [['dashboard', 'Home', 'home'], ['cv', 'CV', 'doc'], ['coach', 'Coach', 'chat'], ['match', 'Matched', 'hand']].map(function (t) { return '<a href="#/' + t[0] + '" data-r="' + t[0] + '">' + I[t[2]] + t[1] + '</a>'; }).join('') +
      '<button type="button" data-action="open-side">' + I.menu + 'More</button></nav></div>';
  }

  function go() {
    var r = (location.hash.replace(/^#\/?/, '') || 'dashboard').split('?')[0];
    if (!VIEWS[r]) r = 'dashboard';
    S.route = r;
    $$('[data-r]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-r') === r); if (a.getAttribute('data-r') === r) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $('#title').textContent = TITLES[r][0];
    var ph = $('#phase'); ph.textContent = TITLES[r][1]; ph.hidden = !TITLES[r][1];
    document.title = TITLES[r][0] + ' | Talents Klinik';
    closeSide();
    var v = $('#view'); v.innerHTML = ''; v.style.animation = 'none'; v.offsetHeight; v.style.animation = '';
    VIEWS[r](v);
    animate(v);
    window.scrollTo(0, 0);
  }
  function refreshNav() { $('#app').innerHTML = shell(); go(); }
  function openSide() { $('#side').classList.add('open'); $('.scrim').classList.add('on'); }
  function closeSide() { var s = $('#side'); if (s) s.classList.remove('open'); var sc = $('.scrim'); if (sc) sc.classList.remove('on'); }
  function bindShell() {
    $('#app').addEventListener('click', onClick);
  }
  function onClick(e) {
    var a = e.target.closest('[data-action]'); if (!a) { var p = $('.pop'); if (p && !e.target.closest('.pop')) p.remove(); return; }
    var act = a.getAttribute('data-action');
    if (act === 'open-side') openSide();
    else if (act === 'close-side') closeSide();
    else if (act === 'to-auth') { authScreen(); }
    else if (act === 'pop') {
      var ex = $('.pop'); if (ex) { ex.remove(); return; }
      var pop = document.createElement('div'); pop.className = 'pop';
      pop.innerHTML = '<a href="#/account">Account &amp; data</a><a href="' + SITE + '" target="_blank" rel="noopener">RésuméKlinik website</a>' + (S.user ? '<button data-action="signout" class="danger">Sign out</button>' : (HAS_DB ? '<button data-action="to-auth">Sign in or create account</button>' : ''));
      $('#side').appendChild(pop);
    }
    else if (act === 'signout') { sb.auth.signOut().then(function () { S.user = null; S.session = null; S.data = blank(); authScreen(); }); }
  }

  /* ================= VIEWS ================= */
  var VIEWS = {};

  /* ---------- Dashboard ---------- */
  VIEWS.dashboard = function (v) {
    var d = S.data, pr = progress(), n = nextStep();
    var names = ['Profile', 'Assess', 'Train', 'Certify', 'Get hired'], routes = ['profile', 'cv', 'learning', 'certificates', 'match'];
    var overall = Math.round(pr.reduce(function (a, b) { return a + b; }, 0) / 5);
    v.innerHTML =
      '<section class="journey"><h2>Welcome' + (d.profile.firstName ? ', ' + esc(d.profile.firstName) : '') + '</h2><p>Your career journey is <b style="color:#fff">' + overall + '% complete</b>. ' + (overall === 0 ? 'Start with your profile below.' : 'Keep going, one step at a time.') + '</p>' +
      '<div class="phases-bar">' + names.map(function (nm, i) { return '<a class="ph" href="#/' + routes[i] + '"><div class="track"><i style="width:0" data-w="' + pr[i] + '%"></i></div><b>' + (i + 1) + '. ' + nm + '</b><small>' + pr[i] + '%</small></a>'; }).join('') + '</div></section>' +
      '<div class="next"><span class="ic">' + n.icon + '</span><div><b>Next step: ' + esc(n.title) + '</b><span>' + esc(n.text) + '</span></div><a class="btn btn-primary btn-sm" href="#/' + n.route + '">Start ' + I.arrow + '</a></div>' +
      '<div class="g4" style="margin-bottom:20px">' +
        tile('cv', I.doc, d.cv ? d.cv.result.score + '<small style="font-size:1rem;color:var(--gray-400)">/100</small>' : null, 'CV health score', 'Not reviewed yet') +
        tile('personality', I.brain, d.persona ? esc(d.persona.label.replace('The ', '')) : null, 'Work personality', 'Not taken yet', true) +
        tile('skills', I.target, d.gaps ? (d.gaps.result.gaps || []).length : null, 'Skills to build', 'Not analysed yet') +
        tile('certificates', I.award, d.certs.length || null, 'Certificates', 'None added yet') +
      '</div>' +
      '<div class="g2">' +
        '<div class="panel"><h3>Your target</h3><p class="hint">What everything on Talents Klinik is tuned towards.</p>' + (d.profile.targetRole ? '<p style="font-size:1.3rem;font-weight:800;color:var(--navy-700);margin:0 0 10px">' + esc(d.profile.targetRole) + '</p><div class="tags">' + (d.profile.industries || []).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '<p style="color:var(--gray-600)">No target role yet.</p><a class="btn btn-outline btn-sm" href="#/profile">Set your target role</a>') + '</div>' +
        '<div class="panel"><h3>Recent activity</h3><p class="hint">Your latest progress.</p>' + activity() + '</div>' +
      '</div>' +
      '<div class="panel" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:240px"><h3>Want an expert to rewrite your CV?</h3><p class="hint" style="margin:0">RésuméKlinik writes achievement-led, ATS-friendly CVs and LinkedIn profiles.</p></div><a class="btn btn-dark btn-sm" href="' + SITE + '/contact?service=cv-writing" target="_blank" rel="noopener">Talk to RésuméKlinik</a></div>';
  };
  function tile(r, icon, val, label, empty, small) {
    return '<a class="tile" href="#/' + r + '"><span class="ic">' + icon + '</span>' + (val != null ? '<b' + (small ? ' style="font-size:1.15rem"' : '') + '>' + val + '</b>' : '<b class="muted">' + empty + '</b>') + '<span>' + label + '</span></a>';
  }
  function activity() {
    var d = S.data, items = [];
    if (d.cv) items.push([d.cv.at, 'CV reviewed: scored ' + d.cv.result.score + '/100']);
    if (d.persona) items.push([d.persona.at, 'Personality assessment: ' + d.persona.label]);
    if (d.gaps) items.push([d.gaps.at, 'Skill gaps analysed for ' + d.gaps.targetRole]);
    if (d.match && d.match.optIn) items.push([d.match.at, 'Opted in to employer matching']);
    (d.letters || []).slice(0, 2).forEach(function (l) { items.push([l.at, 'Cover letter: ' + l.role + ' at ' + l.company]); });
    items.sort(function (a, b) { return (b[0] || '').localeCompare(a[0] || ''); });
    if (!items.length) return '<p style="color:var(--gray-600);margin:0">Nothing yet. Your progress will appear here.</p>';
    return '<ul class="list-check">' + items.slice(0, 5).map(function (x) { return '<li>' + I.check + '<span>' + esc(x[1]) + '<br><small style="color:var(--gray-400)">' + fmt(x[0]) + '</small></span></li>'; }).join('') + '</ul>';
  }

  /* ---------- Profile ---------- */
  var OPTS = {
    educationLevel: ['SSCE / O-Level', 'OND / NCE', 'HND', 'Bachelor’s degree', 'Master’s degree', 'MBA', 'PhD', 'Other'],
    degreeClass: ['First Class / Distinction', 'Second Class Upper', 'Second Class Lower', 'Third Class', 'Pass', 'Upper Credit', 'Lower Credit', 'Not applicable'],
    nysc: ['Not yet eligible', 'Prospective corps member', 'Currently serving', 'Completed', 'Exempted', 'Not applicable'],
    experience: ['Student / graduate', 'Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years'],
    industries: ['Banking & Finance', 'FinTech', 'Consulting', 'Technology', 'Telecoms', 'Oil & Gas / Energy', 'FMCG', 'Manufacturing', 'Healthcare', 'Education', 'Public sector', 'NGO / Development', 'Media & Creative', 'Real Estate', 'Agriculture', 'Logistics']
  };
  function sel(name, label, opts, val, opt) { return '<div class="field"><label for="p-' + name + '">' + label + (opt ? ' <em>(optional)</em>' : '') + '</label><select id="p-' + name + '" name="' + name + '"><option value="">Select</option>' + opts.map(function (o) { return '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select></div>'; }
  function inp(name, label, val, opt, type, ph) { return '<div class="field"><label for="p-' + name + '">' + label + (opt ? ' <em>(optional)</em>' : '') + '</label><input id="p-' + name + '" name="' + name + '" type="' + (type || 'text') + '" value="' + esc(val || '') + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '></div>'; }
  VIEWS.profile = function (v) {
    var p = S.data.profile;
    v.innerHTML = '<div class="view-head"><h2>My profile</h2><p>This powers your CV review, skill gap analysis, cover letters and employer matching. The more accurate it is, the better your results.</p></div>' +
      '<form id="profile-form" novalidate>' +
      '<div class="panel"><h3>About you</h3><p class="hint">How employers and our team will know you.</p>' +
        '<div class="g2">' + inp('firstName', 'First name', p.firstName) + inp('lastName', 'Last name', p.lastName) + '</div>' +
        '<div class="g2">' + inp('phone', 'Phone (WhatsApp)', p.phone, true, 'tel', '+234') + inp('location', 'State / city', p.location, false, 'text', 'e.g. Lagos') + '</div>' +
        inp('linkedinUrl', 'LinkedIn profile link', p.linkedinUrl, true, 'url', 'https://linkedin.com/in/...') + '</div>' +
      '<div class="panel"><h3>Education</h3><p class="hint">Used to match you to roles by qualification, course and class of degree.</p>' +
        '<div class="g2">' + sel('educationLevel', 'Highest qualification', OPTS.educationLevel, p.educationLevel) + inp('course', 'Course of study', p.course, false, 'text', 'e.g. Accounting') + '</div>' +
        '<div class="g2">' + sel('degreeClass', 'Class of degree / grade', OPTS.degreeClass, p.degreeClass, true) + inp('institution', 'Institution', p.institution, true) + '</div>' +
        '<div class="g2">' + inp('gradYear', 'Year of graduation', p.gradYear, true, 'number') + sel('nysc', 'NYSC status', OPTS.nysc, p.nysc, true) + '</div>' +
        inp('qualifications', 'Professional qualifications', p.qualifications, true, 'text', 'e.g. ICAN (in view), CIPM, PMP') + '</div>' +
      '<div class="panel"><h3>Career direction</h3><p class="hint">Where you are now and where you want to go.</p>' +
        '<div class="g2">' + sel('experience', 'Work experience', OPTS.experience, p.experience, true) + inp('currentRole', 'Current or most recent role', p.currentRole, true) + '</div>' +
        inp('targetRole', 'Target role', p.targetRole, false, 'text', 'e.g. Graduate Trainee, Data Analyst, HR Officer') +
        '<div class="field"><label>Industries of interest <em>(choose up to 4)</em></label><div class="tags" id="ind">' + OPTS.industries.map(function (o) { var on = (p.industries || []).indexOf(o) >= 0; return '<button type="button" class="btn btn-sm ' + (on ? 'btn-dark' : 'btn-outline') + '" data-ind="' + esc(o) + '" aria-pressed="' + on + '">' + esc(o) + '</button>'; }).join('') + '</div></div>' +
        '<div class="field"><label for="skill-in">Skills <em>(press Enter after each, at least 3)</em></label><div class="chip-input" id="skills"><input id="skill-in" placeholder="e.g. Excel, customer service, Python"></div></div>' +
      '</div>' +
      '<div class="actions"><button class="btn btn-primary" type="submit">Save profile</button><span class="saved" id="saved" hidden>Saved</span></div></form>';
    var skills = (p.skills || []).slice(), box = $('#skills'), sin = $('#skill-in');
    function drawSkills() { $$('span', box).forEach(function (s) { s.remove(); }); skills.forEach(function (s, i) { var el = document.createElement('span'); el.innerHTML = esc(s) + '<button type="button" aria-label="Remove ' + esc(s) + '">×</button>'; el.querySelector('button').onclick = function () { skills.splice(i, 1); drawSkills(); }; box.insertBefore(el, sin); }); }
    drawSkills();
    sin.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ',') && sin.value.trim()) { e.preventDefault(); sin.value.split(',').forEach(function (x) { x = x.trim(); if (x && skills.indexOf(x) < 0 && skills.length < 30) skills.push(x); }); sin.value = ''; drawSkills(); } else if (e.key === 'Backspace' && !sin.value && skills.length) { skills.pop(); drawSkills(); } });
    var inds = (p.industries || []).slice();
    $('#ind').addEventListener('click', function (e) { var b = e.target.closest('[data-ind]'); if (!b) return; var k = b.getAttribute('data-ind'), i = inds.indexOf(k); if (i >= 0) inds.splice(i, 1); else if (inds.length < 4) inds.push(k); else { toast('Choose up to 4 industries'); return; } b.setAttribute('aria-pressed', String(i < 0)); b.className = 'btn btn-sm ' + (i < 0 ? 'btn-dark' : 'btn-outline'); });
    $('#profile-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (sin.value.trim()) { skills.push(sin.value.trim()); sin.value = ''; }
      var f = new FormData(e.target), np = {};
      f.forEach(function (val, k) { np[k] = String(val).trim(); });
      np.skills = skills; np.industries = inds;
      S.data.profile = np;
      save('Profile saved').then(function () { refreshNav(); });
    });
  };

  /* ---------- CV review ---------- */
  VIEWS.cv = function (v) {
    var d = S.data;
    v.innerHTML = '<div class="view-head"><h2>CV review</h2><p>Get an instant, recruiter-style review: an overall score, what is working, what to fix first and example rewrites.</p></div><div id="cv-result"></div><div id="cv-input"></div>';
    if (d.cv) renderCV(d.cv);
    renderCVInput(!!d.cv);
  };
  function renderCVInput(collapsed) {
    var box = $('#cv-input');
    if (!canAI()) { box.innerHTML = aiGate(); return; }
    box.innerHTML = '<div class="panel"><h3>' + (collapsed ? 'Review a new version' : 'Add your CV') + '</h3><p class="hint">Upload a PDF or Word file, or paste the text. Your CV is only used to generate your review.</p>' +
      '<label class="dropzone" id="drop"><input type="file" id="cv-file" accept=".pdf,.docx,.txt" hidden>' + I.upload + '<b>Upload your CV</b><small>PDF, DOCX or TXT, up to 8 MB</small></label>' +
      '<div class="divider">or paste it</div>' +
      '<div class="field"><label for="cv-text">CV text <span class="count" id="cv-count">0 characters</span></label><textarea id="cv-text" style="min-height:200px" placeholder="Paste your full CV here"></textarea></div>' +
      '<div class="field"><label for="cv-role">Target role</label><input id="cv-role" value="' + esc(S.data.profile.targetRole || '') + '" placeholder="e.g. Graduate Trainee"></div>' +
      '<div class="actions"><button class="btn btn-primary" id="cv-go" type="button">' + I.spark + ' Review my CV</button></div><div id="cv-err" style="margin-top:14px"></div></div>';
    var ta = $('#cv-text'), cnt = $('#cv-count');
    ta.addEventListener('input', function () { cnt.textContent = ta.value.length + ' characters'; });
    var drop = $('#drop'), fi = $('#cv-file');
    function take(file) { if (!file) return; $('#cv-err').innerHTML = loading('Reading ' + file.name + '…'); readFile(file).then(function (t) { ta.value = t.trim(); cnt.textContent = ta.value.length + ' characters'; $('#cv-err').innerHTML = '<div class="notice ok">' + esc(file.name) + ' loaded. Check the text below, then review.</div>'; }).catch(function (err) { $('#cv-err').innerHTML = errorBox(err.message || 'Could not read that file. Try pasting the text instead.'); }); }
    fi.addEventListener('change', function () { take(fi.files[0]); });
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); }); });
    drop.addEventListener('drop', function (e) { take(e.dataTransfer.files[0]); });
    $('#cv-go').addEventListener('click', function () {
      var cv = ta.value.trim(), role = $('#cv-role').value.trim();
      if (cv.length < 200) { $('#cv-err').innerHTML = errorBox('Please add your full CV (at least a few paragraphs).'); return; }
      var btn = this; btn.disabled = true; $('#cv-err').innerHTML = loading('Reviewing your CV like a recruiter would. This takes about 20 seconds…');
      ai('cv_review', { cv: cv, targetRole: role }).then(function (j) {
        S.data.cv = { result: j.result, targetRole: role, at: new Date().toISOString(), excerpt: cv.slice(0, 5000) };
        if (role && !S.data.profile.targetRole) S.data.profile.targetRole = role;
        save('CV review saved'); refreshNav();
      }).catch(function (err) { btn.disabled = false; $('#cv-err').innerHTML = errorBox(err.message); });
    });
  }
  function renderCV(c) {
    var r = c.result || {}, s = r.scores || {};
    $('#cv-result').innerHTML =
      '<div class="panel"><div class="copy-row"><h3 style="margin:0">Your CV health report</h3><small style="color:var(--gray-600)">' + fmt(c.at) + (c.targetRole ? ' · for ' + esc(c.targetRole) : '') + '</small></div>' +
      '<div class="score-wrap" style="margin-top:16px">' + ring(r.score || 0) + '<div><p style="color:var(--gray-700);font-size:1.02rem">' + esc(r.summary) + '</p>' +
      meter('ATS readability', s.ats || 0) + meter('Impact and results', s.impact || 0) + meter('Keywords for the role', s.keywords || 0) + meter('Structure and clarity', s.structure || 0) + '</div></div></div>' +
      '<div class="g2"><div class="panel"><h3>What is working</h3><ul class="list-check" style="margin-top:12px">' + (r.strengths || []).map(function (x) { return '<li>' + I.check + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div>' +
      '<div class="panel"><h3>Fix these first</h3><div style="margin-top:12px">' + (r.fixes || []).map(function (f, i) { return '<details class="fix"' + (i === 0 ? ' open' : '') + '><summary><span class="n">' + (i + 1) + '</span>' + esc(f.issue) + '</summary><div class="b"><p><b>Why:</b> ' + esc(f.why) + '</p><p><b>How:</b> ' + esc(f.how) + '</p></div></details>'; }).join('') + '</div></div></div>' +
      ((r.rewrites || []).length ? '<div class="panel"><h3>Example rewrites</h3><p class="hint">Replace anything in [brackets] with your real numbers.</p>' + r.rewrites.map(function (w) { return '<div class="rw"><div class="old">' + esc(w.before) + '</div><div class="new">' + esc(w.after) + '</div></div>'; }).join('') + '</div>' : '') +
      '<div class="next"><span class="ic">' + I.doc + '</span><div><b>Want this done for you?</b><span>RésuméKlinik can rewrite your CV around measurable results.</span></div><a class="btn btn-dark btn-sm" href="' + SITE + '/contact?service=cv-writing" target="_blank" rel="noopener">Get a professional rewrite</a></div>';
  }

  /* ---------- Personality (Mini-IPIP, public domain) ---------- */
  var ITEMS = [
    ['Am the life of the party.', 'E', 0], ['Sympathise with others’ feelings.', 'A', 0], ['Get chores done right away.', 'C', 0], ['Have frequent mood swings.', 'S', 1], ['Have a vivid imagination.', 'O', 0],
    ['Don’t talk a lot.', 'E', 1], ['Am not interested in other people’s problems.', 'A', 1], ['Often forget to put things back in their proper place.', 'C', 1], ['Am relaxed most of the time.', 'S', 0], ['Am not interested in abstract ideas.', 'O', 1],
    ['Talk to a lot of different people at parties.', 'E', 0], ['Feel others’ emotions.', 'A', 0], ['Like order.', 'C', 0], ['Get upset easily.', 'S', 1], ['Have difficulty understanding abstract ideas.', 'O', 1],
    ['Keep in the background.', 'E', 1], ['Am not really interested in others.', 'A', 1], ['Make a mess of things.', 'C', 1], ['Seldom feel blue.', 'S', 0], ['Do not have a good imagination.', 'O', 1]
  ];
  var TRAITS = {
    O: { name: 'Openness', label: 'The Explorer', hi: 'Curious and imaginative. You enjoy new ideas, change and solving unfamiliar problems.', lo: 'Practical and grounded. You prefer proven methods and concrete, clearly defined work.', roles: ['Strategy and research', 'Product and design', 'Consulting', 'Marketing and content'] },
    C: { name: 'Conscientiousness', label: 'The Organiser', hi: 'Organised, reliable and detail-focused. You plan ahead and finish what you start.', lo: 'Flexible and spontaneous. You adapt quickly but may need systems to stay on track.', roles: ['Audit and compliance', 'Finance and accounting', 'Operations and supply chain', 'Project management'] },
    E: { name: 'Extraversion', label: 'The Connector', hi: 'Energised by people. You build relationships easily and enjoy visible, social work.', lo: 'Reflective and focused. You do your best work with time to think and fewer interruptions.', roles: ['Sales and business development', 'Relationship management', 'Public relations', 'Training and facilitation'] },
    A: { name: 'Agreeableness', label: 'The Collaborator', hi: 'Supportive and cooperative. You build trust and bring teams together.', lo: 'Direct and objective. You challenge ideas and are comfortable with tough decisions.', roles: ['Human resources', 'Customer success', 'Healthcare and education', 'NGO and development'] },
    S: { name: 'Emotional stability', label: 'The Steady Hand', hi: 'Calm under pressure. You stay composed when deadlines and stakes are high.', lo: 'Sensitive to pressure. You notice risks early and do best with clear expectations and support.', roles: ['Banking and front-line finance', 'Operations leadership', 'Crisis and incident management', 'Team leadership'] }
  };
  var SCALE = ['Very inaccurate', 'Moderately inaccurate', 'Neither', 'Moderately accurate', 'Very accurate'];
  VIEWS.personality = function (v) {
    var d = S.data;
    if (d.persona && !VIEWS.personality.retake) { renderPersona(v); return; }
    VIEWS.personality.retake = false;
    var ans = {};
    v.innerHTML = '<div class="view-head"><h2>Personality assessment</h2><p>Describe yourself as you generally are now, not as you wish to be. There are no right or wrong answers. It takes about three minutes.</p></div>' +
      '<div class="quiz-progress"><div class="tr"><i id="qbar" style="width:0"></i></div><small id="qtext">0 of 20 answered</small></div>' +
      '<form id="quiz">' + ITEMS.map(function (it, i) { return '<fieldset class="likert" style="border:1px solid var(--gray-200)"><legend class="sr-only">Statement ' + (i + 1) + '</legend><p>' + (i + 1) + '. I ' + esc(it[0].charAt(0).toLowerCase() + it[0].slice(1)) + '</p><div class="scale">' + SCALE.map(function (s, k) { return '<label><input type="radio" name="q' + i + '" value="' + (k + 1) + '"><span>' + s + '</span></label>'; }).join('') + '</div></fieldset>'; }).join('') +
      '<div class="actions"><button class="btn btn-primary" type="submit" id="qsub" disabled>See my results</button></div></form>' +
      '<p class="fine" style="text-align:left">Uses 20 public-domain items from the International Personality Item Pool (IPIP). It is a guide to how you prefer to work, not a diagnosis.</p>';
    var f = $('#quiz');
    f.addEventListener('change', function (e) {
      var n = e.target.name; if (!n) return; ans[n] = +e.target.value;
      var c = Object.keys(ans).length; $('#qbar').style.width = (c / 20 * 100) + '%'; $('#qtext').textContent = c + ' of 20 answered'; $('#qsub').disabled = c < 20;
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); if (Object.keys(ans).length < 20) return;
      var sums = { O: 0, C: 0, E: 0, A: 0, S: 0 };
      ITEMS.forEach(function (it, i) { var val = ans['q' + i]; sums[it[1]] += it[2] ? 6 - val : val; });
      var scores = {}; Object.keys(sums).forEach(function (k) { scores[k] = Math.round((sums[k] - 4) / 16 * 100); });
      var order = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
      S.data.persona = { scores: scores, top: order.slice(0, 2), label: TRAITS[order[0]].label, at: new Date().toISOString(), narrative: '' };
      save('Results saved').then(function () { refreshNav(); });
    });
  };
  function renderPersona(v) {
    var p = S.data.persona, t1 = TRAITS[p.top[0]], t2 = TRAITS[p.top[1]];
    var roles = t1.roles.slice(0, 3).concat(t2.roles.slice(0, 2));
    v.innerHTML = '<div class="view-head"><h2>Your work personality</h2><p>Taken ' + fmt(p.at) + '. Your strongest traits shape the environments where you are likely to thrive.</p></div>' +
      '<div class="persona-hero"><span class="badge2">' + I.brain + '</span><div><h3>' + esc(p.label) + '</h3><p>Your strongest traits are <b style="color:#fff">' + t1.name + '</b> and <b style="color:#fff">' + t2.name + '</b>. ' + esc(t1.hi) + '</p></div></div>' +
      '<div class="g2"><div class="panel"><h3>Your Big Five profile</h3><p class="hint">0 is low and 100 is high. Neither end is better; each suits different work.</p>' +
      ['O', 'C', 'E', 'A', 'S'].map(function (k) { return meter(TRAITS[k].name, p.scores[k], p.scores[k] + '/100'); }).join('') + '</div>' +
      '<div class="panel"><h3>What this means at work</h3>' + ['O', 'C', 'E', 'A', 'S'].map(function (k) { return '<p style="margin:0 0 10px"><b style="color:var(--navy-700)">' + TRAITS[k].name + ':</b> <span style="color:var(--gray-600)">' + esc(p.scores[k] >= 55 ? TRAITS[k].hi : p.scores[k] <= 45 ? TRAITS[k].lo : 'Balanced. You can flex between both styles depending on the situation.') + '</span></p>'; }).join('') + '</div></div>' +
      '<div class="panel"><h3>Role families that often suit you</h3><div class="tags" style="margin-top:12px">' + roles.map(function (r) { return '<span class="lime">' + esc(r) + '</span>'; }).join('') + '</div>' +
      '<div id="narr" style="margin-top:18px">' + (p.narrative ? '<div class="output">' + esc(p.narrative) + '</div>' : (canAI() ? '<button class="btn btn-outline btn-sm" id="narr-go">' + I.spark + ' Get a personalised interpretation</button>' : '')) + '</div></div>' +
      '<div class="actions"><a class="btn btn-primary" href="#/skills">Next: skill gap analysis ' + I.arrow + '</a><button class="btn btn-outline" id="retake">Retake assessment</button></div>';
    $('#retake').onclick = function () { VIEWS.personality.retake = true; go(); };
    var ng = $('#narr-go');
    if (ng) ng.onclick = function () {
      $('#narr').innerHTML = loading('Interpreting your results…');
      ai('persona', { traits: p.scores, targetRole: S.data.profile.targetRole }).then(function (j) { p.narrative = j.text; save(); $('#narr').innerHTML = '<div class="output">' + esc(j.text) + '</div>'; }).catch(function (e) { $('#narr').innerHTML = errorBox(e.message); });
    };
  }

  /* ---------- Skill gap ---------- */
  VIEWS.skills = function (v) {
    var d = S.data;
    v.innerHTML = '<div class="view-head"><h2>Skill gap analysis</h2><p>Compare your skills with what employers expect for your target role, then turn the gaps into a learning plan.</p></div><div id="sg-res"></div><div id="sg-in"></div>';
    if (d.gaps) renderGaps();
    if (!canAI()) { $('#sg-in').innerHTML = aiGate(); return; }
    $('#sg-in').innerHTML = '<div class="panel"><h3>' + (d.gaps ? 'Run a new analysis' : 'Analyse your gaps') + '</h3><p class="hint">We use your profile. Update your skills here if needed.</p>' +
      '<div class="field"><label for="sg-role">Target role</label><input id="sg-role" value="' + esc(d.profile.targetRole || '') + '"></div>' +
      '<div class="field"><label for="sg-skills">Your current skills</label><textarea id="sg-skills" placeholder="e.g. Excel, report writing, customer service">' + esc((d.profile.skills || []).join(', ')) + '</textarea></div>' +
      '<div class="actions"><button class="btn btn-primary" id="sg-go">' + I.spark + ' Analyse my gaps</button></div><div id="sg-err" style="margin-top:14px"></div></div>';
    $('#sg-go').onclick = function () {
      var role = $('#sg-role').value.trim(); if (!role) { $('#sg-err').innerHTML = errorBox('Add a target role first.'); return; }
      var btn = this; btn.disabled = true; $('#sg-err').innerHTML = loading('Mapping your skills against ' + role + '…');
      ai('skill_gap', { targetRole: role, skills: $('#sg-skills').value, profile: d.profile }).then(function (j) {
        S.data.gaps = { result: j.result, targetRole: role, at: new Date().toISOString() };
        save('Analysis saved'); refreshNav();
      }).catch(function (e) { btn.disabled = false; $('#sg-err').innerHTML = errorBox(e.message); });
    };
  };
  function renderGaps() {
    var g = S.data.gaps, r = g.result || {};
    $('#sg-res').innerHTML = '<div class="panel"><div class="copy-row"><h3 style="margin:0">Readiness for ' + esc(g.targetRole) + '</h3><small style="color:var(--gray-600)">' + fmt(g.at) + '</small></div>' +
      '<div class="score-wrap" style="margin-top:16px">' + ring(r.readiness || 0) + '<div><p style="font-size:1.02rem">' + esc(r.summary) + '</p><p style="font-weight:700;color:var(--navy-700);margin:14px 0 8px">Strengths you already have</p><div class="tags">' + (r.have || []).map(function (x) { return '<span class="lime">' + esc(x) + '</span>'; }).join('') + '</div></div></div></div>' +
      '<div class="g2"><div class="panel"><h3>Gaps to close</h3>' + (r.gaps || []).map(function (x) { return '<div class="gap"><b>' + esc(x.skill) + '</b><span class="pill ' + esc(x.priority) + '">' + esc(x.priority) + '</span><p>' + esc(x.why) + '</p><p><b style="color:var(--navy-700)">How:</b> ' + esc(x.how) + '</p></div>'; }).join('') + '</div>' +
      '<div class="panel"><h3>Suggested learning plan</h3><p class="hint">Add these to your plan and tick them off as you go.</p>' + (r.plan || []).map(function (x) { return '<div class="plan-item"><span class="pill good" style="margin-top:2px">' + esc(x.type) + '</span><div><b>' + esc(x.title) + '</b><small>' + esc(x.provider || '') + '</small></div></div>'; }).join('') +
      '<div class="actions" style="margin-top:14px"><button class="btn btn-primary btn-sm" id="to-plan">Add all to my learning plan</button></div></div></div>';
    $('#to-plan').onclick = function () {
      var have = S.data.plan.map(function (x) { return x.title; }), added = 0;
      (r.plan || []).forEach(function (x) { if (have.indexOf(x.title) < 0) { S.data.plan.push({ id: uid(), title: x.title, type: x.type, provider: x.provider, done: false }); added++; } });
      save(added ? added + ' items added to your plan' : 'Already in your plan'); location.hash = '#/learning';
    };
  }

  /* ---------- Learning plan ---------- */
  var PROVIDERS = {
    'Coursera': ['https://www.coursera.org/search?query=', 'Free to audit many courses'],
    'edX': ['https://www.edx.org/search?q=', 'University courses, free audit'],
    'Alison': ['https://alison.com/courses?query=', 'Free certificate courses'],
    'freeCodeCamp': ['https://www.freecodecamp.org/learn', 'Free coding certifications'],
    'Khan Academy': ['https://www.khanacademy.org', 'Free foundations'],
    'Microsoft Learn': ['https://learn.microsoft.com/training/', 'Free Microsoft skills'],
    'Cisco Networking Academy': ['https://www.netacad.com', 'Networking and cybersecurity'],
    'HubSpot Academy': ['https://academy.hubspot.com', 'Free marketing and sales'],
    'LinkedIn Learning': ['https://www.linkedin.com/learning/search?keywords=', 'Business and tech courses'],
    'Google Career Certificates': ['https://grow.google/certificates/', 'Job-ready certificates']
  };
  function provLink(name, q) { var p = PROVIDERS[name]; if (!p) return ''; return /=$/.test(p[0]) ? p[0] + encodeURIComponent(q) : p[0]; }
  VIEWS.learning = function (v) {
    var plan = S.data.plan, done = plan.filter(function (x) { return x.done; }).length;
    v.innerHTML = '<div class="view-head"><h2>Learning plan</h2><p>Close your skill gaps one step at a time. Tick items off as you complete them.</p></div>' +
      '<div class="panel"><div class="copy-row"><h3 style="margin:0">Your plan</h3><b style="color:var(--navy-700)">' + done + ' of ' + plan.length + ' done</b></div>' +
      (plan.length ? meter('Progress', plan.length ? Math.round(done / plan.length * 100) : 0) : '') +
      '<div id="plan-list">' + (plan.length ? plan.map(function (x) {
        var link = provLink(x.provider, x.title);
        return '<div class="plan-item' + (x.done ? ' done' : '') + '"><input type="checkbox" data-id="' + x.id + '"' + (x.done ? ' checked' : '') + ' aria-label="Mark done"><div><b>' + esc(x.title) + '</b><small>' + esc([x.type, x.provider].filter(Boolean).join(' · ')) + (link ? ' · <a href="' + link + '" target="_blank" rel="noopener">Find courses</a>' : '') + '</small></div><button class="x" data-del="' + x.id + '" aria-label="Remove">×</button></div>';
      }).join('') : '<div class="empty-state"><div class="ic">' + I.book + '</div><h3>No plan yet</h3><p>Run a skill gap analysis to generate one, or add your own items below.</p><a class="btn btn-primary btn-sm" href="#/skills">Analyse my skill gaps</a></div>') + '</div>' +
      '<form id="add-item" class="actions" style="margin-top:16px"><input class="field" style="flex:1;min-width:220px;font:inherit;border:1.5px solid var(--gray-200);border-radius:12px;padding:12px 14px" id="new-item" placeholder="Add your own item, e.g. Finish Excel pivot tables course" aria-label="New learning item"><button class="btn btn-dark" type="submit">Add</button></form></div>' +
      '<div class="panel"><h3>Where to learn for free or low cost</h3><p class="hint">Trusted platforms. Many courses are free to audit.</p><div class="providers">' +
      Object.keys(PROVIDERS).map(function (k) { var p = PROVIDERS[k]; return '<a class="provider" href="' + (/=$/.test(p[0]) ? p[0].split('?')[0].replace(/\/search$|\/courses$/, '') : p[0]) + '" target="_blank" rel="noopener"><i>' + esc(k.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2)) + '</i><span><b>' + esc(k) + '</b><small>' + esc(p[1]) + '</small></span></a>'; }).join('') + '</div></div>';
    $('#plan-list').addEventListener('change', function (e) { var id = e.target.getAttribute('data-id'); var it = S.data.plan.filter(function (x) { return x.id === id; })[0]; if (it) { it.done = e.target.checked; save(it.done ? 'Nice work. Item completed' : ''); refreshNav(); } });
    $('#plan-list').addEventListener('click', function (e) { var id = e.target.getAttribute('data-del'); if (!id) return; S.data.plan = S.data.plan.filter(function (x) { return x.id !== id; }); save('Removed'); refreshNav(); });
    $('#add-item').addEventListener('submit', function (e) { e.preventDefault(); var t = $('#new-item').value.trim(); if (!t) return; S.data.plan.push({ id: uid(), title: t, type: 'personal', provider: '', done: false }); save('Added to your plan'); refreshNav(); });
  };

  /* ---------- Certificates ---------- */
  VIEWS.certificates = function (v) {
    var certs = S.data.certs;
    v.innerHTML = '<div class="view-head"><h2>My certificates</h2><p>Keep a record of the certificates you earn, with links employers can check. Verified Talents Klinik certificates are coming soon.</p></div>' +
      '<div class="panel">' + (certs.length ? certs.map(function (c) { return '<div class="plan-item"><span class="tile" style="padding:0;border:0"><span class="ic" style="margin:0">' + I.award + '</span></span><div><b style="text-decoration:none;color:var(--navy-700)">' + esc(c.title) + '</b><small>' + esc([c.issuer, c.date ? fmt(c.date) : ''].filter(Boolean).join(' · ')) + (c.url ? ' · <a href="' + esc(c.url) + '" target="_blank" rel="noopener">View credential</a>' : '') + '</small></div><button class="x" data-del="' + c.id + '" aria-label="Remove">×</button></div>'; }).join('') : '<div class="empty-state"><div class="ic">' + I.award + '</div><h3>No certificates yet</h3><p>Add certificates from courses, professional bodies or training programmes.</p></div>') + '</div>' +
      '<form class="panel" id="cert-form"><h3>Add a certificate</h3><div class="g2" style="margin-top:14px">' + inp('title', 'Certificate title', '', false, 'text', 'e.g. Google Data Analytics') + inp('issuer', 'Issued by', '', false, 'text', 'e.g. Coursera / Google') + '</div><div class="g2">' + inp('date', 'Date earned', '', true, 'date') + inp('url', 'Credential link', '', true, 'url', 'https://') + '</div><button class="btn btn-primary" type="submit">Add certificate</button></form>';
    $('#cert-form').addEventListener('submit', function (e) { e.preventDefault(); var f = new FormData(e.target); var t = String(f.get('title')).trim(), is = String(f.get('issuer')).trim(); if (!t || !is) { toast('Add a title and issuer'); return; } S.data.certs.unshift({ id: uid(), title: t, issuer: is, date: f.get('date'), url: String(f.get('url')).trim() }); save('Certificate added'); refreshNav(); });
    v.addEventListener('click', function (e) { var id = e.target.getAttribute('data-del'); if (!id) return; S.data.certs = S.data.certs.filter(function (x) { return x.id !== id; }); save('Removed'); refreshNav(); });
  };

  /* ---------- Get matched ---------- */
  var BOARDS = [['Jobberman', 'https://www.jobberman.com/jobs?q='], ['MyJobMag', 'https://www.myjobmag.com/search/jobs?q='], ['LinkedIn Jobs', 'https://www.linkedin.com/jobs/search/?location=Nigeria&keywords='], ['Indeed Nigeria', 'https://ng.indeed.com/jobs?q=']];
  VIEWS.match = function (v) {
    var d = S.data, m = d.match || {}, pr = progress();
    var checks = [[pr[0] === 100, 'Profile complete', 'profile'], [!!d.cv, 'CV reviewed', 'cv'], [!!d.persona, 'Personality assessment taken', 'personality'], [!!d.gaps, 'Skill gaps analysed', 'skills']];
    var ready = checks.filter(function (c) { return c[0]; }).length;
    v.innerHTML = '<div class="view-head"><h2>Get matched with employers</h2><p>Opt in and the Talents Klinik team will review your profile and match you to suitable roles and graduate opportunities. It is free for candidates.</p></div>' +
      '<div class="g2"><div class="panel"><h3>Your match readiness</h3><p class="hint">Complete these so we can present you well to employers.</p><ul class="list-check" style="margin-bottom:16px">' +
      checks.map(function (c) { return '<li style="color:' + (c[0] ? 'var(--gray-700)' : 'var(--gray-400)') + '">' + (c[0] ? I.circlecheck : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>') + '<span>' + c[1] + (c[0] ? '' : ' · <a href="#/' + c[2] + '">Do this</a>') + '</span></li>'; }).join('') + '</ul>' + meter('Readiness', Math.round(ready / 4 * 100)) + '</div>' +
      '<div class="panel" id="optin"></div></div>' +
      '<div class="panel"><div class="copy-row"><h3 style="margin:0">Roles that fit you</h3>' + (canAI() ? '<button class="btn btn-outline btn-sm" id="roles-go">' + I.spark + (d.roles ? ' Refresh' : ' Suggest roles') + '</button>' : '') + '</div><div id="roles" style="margin-top:14px">' + rolesHTML() + '</div></div>' +
      (HAS_DB ? '<div class="panel"><div class="copy-row"><h3 style="margin:0">Open roles from employers</h3></div><p class="hint">Roles posted on Talents Klinik by verified employers. Express interest and the employer sees your assessed, anonymised profile.</p><div id="open-jobs">' + loading('Loading roles…') + '</div></div>' : '') +
      '<div class="panel"><h3>Search job boards now</h3><p class="hint">Open live listings for your target role on trusted Nigerian and global boards.</p><div class="actions">' +
      BOARDS.map(function (b) { return '<a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="' + b[1] + encodeURIComponent(d.profile.targetRole || '') + '">' + b[0] + '</a>'; }).join('') + '</div></div>';
    drawOptIn();
    if (HAS_DB) drawOpenJobs();
    var rg = $('#roles-go');
    if (rg) rg.onclick = function () {
      $('#roles').innerHTML = loading('Finding roles that fit your profile…'); rg.disabled = true;
      var p = d.persona ? d.persona.label + ' (' + d.persona.top.map(function (k) { return TRAITS[k].name; }).join(', ') + ')' : '';
      ai('role_fit', { profile: d.profile, persona: p, cvSummary: d.cv ? d.cv.result.summary : '' }).then(function (j) { d.roles = { result: j.result, at: new Date().toISOString() }; save(); $('#roles').innerHTML = rolesHTML(); rg.disabled = false; }).catch(function (e) { $('#roles').innerHTML = errorBox(e.message); rg.disabled = false; });
    };
  };
  function drawOpenJobs() {
    var box = $('#open-jobs'); if (!box) return;
    var mine = {};
    var q = sb.from('tk_open_jobs').select('*').order('created_at', { ascending: false }).limit(50);
    var qi = S.user ? sb.from('tk_interests').select('job_id').eq('candidate_id', S.user.id) : Promise.resolve({ data: [] });
    Promise.all([q, qi]).then(function (r) {
      if (r[0].error) throw r[0].error;
      (r[1].data || []).forEach(function (x) { mine[x.job_id] = true; });
      var jobs = r[0].data || [];
      var pay = function (j) { if (!j.salary_min && !j.salary_max) return ''; var f = function (n) { return '₦' + Number(n).toLocaleString('en-NG'); }; return j.salary_min && j.salary_max ? f(j.salary_min) + ' – ' + f(j.salary_max) + '/month' : f(j.salary_min || j.salary_max) + '/month'; };
      box.innerHTML = jobs.length ? jobs.map(function (j) {
        var on = !!mine[j.id];
        return '<div class="open-job" data-job="' + esc(j.id) + '"><b style="color:var(--navy-700)">' + esc(j.title) + '</b><div class="meta">' + esc([j.company, j.location, j.work_mode, j.level, pay(j)].filter(Boolean).join(' · ')) + '</div><p>' + esc(j.description || '') + (j.requirements ? '\n\nRequirements: ' + esc(j.requirements) : '') + '</p>' +
          (S.user ? '<button class="btn ' + (on ? 'btn-outline' : 'btn-primary') + ' btn-sm" data-interest="' + esc(j.id) + '" aria-pressed="' + on + '">' + (on ? I.circlecheck + ' Interested' : 'I am interested') + '</button>' : '<button class="btn btn-primary btn-sm" data-action="to-auth">Create a free account to express interest</button>') + '</div>';
      }).join('') : '<p style="color:var(--gray-600);margin:0">No open roles right now. Opt in to matching so employers can find you, and check back soon.</p>';
      $$('[data-interest]', box).forEach(function (b) {
        b.onclick = function () {
          var id = b.getAttribute('data-interest'), on = !!mine[id];
          if (!on && !(S.data.match && S.data.match.optIn)) { toast('Opt in to matching first so the employer can see your profile.'); return; }
          b.disabled = true;
          (on ? sb.from('tk_interests').delete().eq('job_id', id).eq('candidate_id', S.user.id) : sb.from('tk_interests').insert({ job_id: id, candidate_id: S.user.id })).then(function (r) {
            b.disabled = false; if (r.error) { toast(r.error.message); return; }
            mine[id] = !on; b.className = 'btn ' + (!on ? 'btn-outline' : 'btn-primary') + ' btn-sm'; b.setAttribute('aria-pressed', String(!on)); b.innerHTML = !on ? I.circlecheck + ' Interested' : 'I am interested';
            toast(!on ? 'The employer can now see your profile for this role' : 'Interest withdrawn');
          });
        };
      });
    }).catch(function (e) { box.innerHTML = errorBox(e.message || 'Could not load roles.'); });
  }
  function rolesHTML() {
    var r = S.data.roles; if (!r) return '<p style="color:var(--gray-600);margin:0">' + (canAI() ? 'Get personalised role suggestions based on your profile and personality.' : 'Create a free account to get personalised role suggestions.') + '</p>';
    return (r.result.roles || []).map(function (x) { return '<div class="gap"><b>' + esc(x.title) + '</b><span class="pill ' + esc(x.fit) + '">' + esc(x.fit) + '</span><p>' + esc(x.why) + ' <a target="_blank" rel="noopener" href="' + BOARDS[0][1] + encodeURIComponent(x.search || x.title) + '">Search jobs</a></p></div>'; }).join('');
  }
  function drawOptIn() {
    var m = S.data.match || {}, box = $('#optin');
    if (m.optIn) {
      box.innerHTML = '<h3>You are in the matching pool</h3><p class="hint">Opted in on ' + fmt(m.at) + '. Our team will contact you on WhatsApp or email when there is a suitable role.</p><ul class="list-check"><li>' + I.check + '<span>Availability: ' + esc(m.availability) + '</span></li><li>' + I.check + '<span>Preferred locations: ' + esc(m.locations || 'Any') + '</span></li><li>' + I.check + '<span>Work mode: ' + esc(m.mode) + '</span></li></ul><div class="actions" style="margin-top:16px"><button class="btn btn-outline btn-sm" id="opt-edit">Edit</button><button class="btn btn-outline btn-sm" id="opt-out">Leave matching pool</button></div>';
      $('#opt-edit').onclick = function () { m.optIn = false; drawOptIn(); m.optIn = true; };
      $('#opt-out').onclick = function () { S.data.match = Object.assign({}, m, { optIn: false }); save('You have left the matching pool'); refreshNav(); };
      return;
    }
    box.innerHTML = '<h3>Opt in to matching</h3><p class="hint">Tell us how you would like to work.</p><form id="opt-form">' +
      sel('availability', 'Availability', ['Immediately', 'Within 1 month', 'After NYSC', 'In 3+ months'], m.availability) +
      inp('locations', 'Preferred locations', m.locations, true, 'text', 'e.g. Lagos, Abuja, remote') +
      sel('mode', 'Work mode', ['On-site', 'Hybrid', 'Remote', 'Any'], m.mode) +
      '<label class="checkline" style="margin:6px 0 18px"><input type="checkbox" name="consent" required' + (m.consent ? ' checked' : '') + '><span>I agree that Talents Klinik may share my profile and CV with employers for roles I am matched to. I can withdraw at any time.</span></label>' +
      '<button class="btn btn-primary btn-block" type="submit">Join the matching pool</button></form>';
    box.querySelector('#p-availability').required = true; box.querySelector('#p-mode').required = true;
    $('#opt-form').addEventListener('submit', function (e) {
      e.preventDefault(); if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
      if (!S.user && HAS_DB) { toast('Create a free account so our team can reach you'); authScreen(); return; }
      var f = new FormData(e.target);
      S.data.match = { optIn: true, consent: true, availability: f.get('availability'), locations: String(f.get('locations')).trim(), mode: f.get('mode'), at: new Date().toISOString() };
      save('You are in the matching pool'); refreshNav();
    });
  }

  /* ---------- Cover letters ---------- */
  VIEWS.letter = function (v) {
    var d = S.data;
    v.innerHTML = '<div class="view-head"><h2>Cover letters</h2><p>Generate a tailored first draft in seconds, using your profile and CV. Always edit it to sound like you.</p></div>' +
      (canAI() ? '<div class="panel"><div class="g2">' + inp('company', 'Company', '', false, 'text', 'e.g. Access Bank') + inp('role', 'Role', d.profile.targetRole, false) + '</div><div class="g2">' + inp('contact', 'Hiring manager name', '', true) + sel('tone', 'Tone', ['Professional', 'Warm and confident', 'Concise and direct'], 'Professional') + '</div>' +
      '<div class="field"><label for="jd">Job description <em>(paste it for the best result)</em></label><textarea id="jd" style="min-height:150px"></textarea></div>' +
      '<div class="actions"><button class="btn btn-primary" id="cl-go">' + I.spark + ' Write my cover letter</button></div><div id="cl-out" style="margin-top:18px"></div></div>' : aiGate()) +
      ((d.letters || []).length ? '<div class="panel"><h3>Saved letters</h3>' + d.letters.map(function (l, i) { return '<details class="fix"><summary><span class="n" style="background:var(--lime-50);color:var(--lime-600)">' + (i + 1) + '</span>' + esc(l.role) + ' · ' + esc(l.company) + ' <small style="margin-left:auto;color:var(--gray-400);font-weight:500">' + fmt(l.at) + '</small></summary><div class="b" style="padding-left:16px"><div class="output">' + esc(l.text) + '</div><div class="actions" style="margin-top:10px"><button class="btn btn-outline btn-sm" data-copy-letter="' + i + '">Copy</button></div></div></details>'; }).join('') + '</div>' : '');
    v.addEventListener('click', function (e) { var b = e.target.closest('[data-copy-letter]'); if (b) copy(d.letters[+b.getAttribute('data-copy-letter')].text, b); });
    var go2 = $('#cl-go'); if (!go2) return;
    go2.onclick = function () {
      var company = $('#p-company').value.trim(), role = $('#p-role').value.trim();
      if (!company || !role) { $('#cl-out').innerHTML = errorBox('Add the company and role.'); return; }
      var btn = this; btn.disabled = true; $('#cl-out').innerHTML = loading('Writing your letter…');
      ai('cover_letter', { company: company, role: role, contact: $('#p-contact').value, tone: $('#p-tone').value, jd: $('#jd').value, profile: d.profile, name: [d.profile.firstName, d.profile.lastName].filter(Boolean).join(' '), cv: d.cv ? d.cv.excerpt : '' }).then(function (j) {
        btn.disabled = false;
        d.letters = [{ company: company, role: role, text: j.text, at: new Date().toISOString() }].concat(d.letters || []).slice(0, 8); save('Letter saved');
        $('#cl-out').innerHTML = '<div class="copy-row"><b style="color:var(--navy-700)">Your draft</b><span class="actions" style="margin:0"><button class="btn btn-outline btn-sm" id="cl-copy">Copy</button><button class="btn btn-outline btn-sm" id="cl-dl">Download</button></span></div><div class="output" contenteditable="true" id="cl-text">' + esc(j.text) + '</div><p class="fine" style="text-align:left">You can edit the text above before copying.</p>';
        $('#cl-copy').onclick = function () { copy($('#cl-text').innerText, this); };
        $('#cl-dl').onclick = function () { download('Cover letter - ' + company + '.txt', $('#cl-text').innerText); };
      }).catch(function (e) { btn.disabled = false; $('#cl-out').innerHTML = errorBox(e.message); });
    };
  };

  /* ---------- LinkedIn ---------- */
  VIEWS.linkedin = function (v) {
    var d = S.data;
    v.innerHTML = '<div class="view-head"><h2>LinkedIn optimiser</h2><p>Get headline options and an About section that help recruiters find you and want to message you.</p></div>' +
      (canAI() ? '<div class="panel">' + inp('headline', 'Current headline', '', true, 'text', 'e.g. Accounting graduate') + '<div class="field"><label for="about">Current About section <em>(optional)</em></label><textarea id="about"></textarea></div><div class="actions"><button class="btn btn-primary" id="li-go">' + I.spark + ' Optimise my profile</button></div><div id="li-err" style="margin-top:14px"></div></div>' : aiGate()) +
      '<div id="li-out"></div>';
    if (d.linkedin) drawLI();
    var b = $('#li-go'); if (!b) return;
    b.onclick = function () {
      var btn = this; btn.disabled = true; $('#li-err').innerHTML = loading('Crafting your LinkedIn copy…');
      ai('linkedin', { headline: $('#p-headline').value, about: $('#about').value, profile: d.profile }).then(function (j) { btn.disabled = false; $('#li-err').innerHTML = ''; d.linkedin = { result: j.result, at: new Date().toISOString() }; save('Saved'); drawLI(); }).catch(function (e) { btn.disabled = false; $('#li-err').innerHTML = errorBox(e.message); });
    };
  };
  function drawLI() {
    var r = S.data.linkedin.result;
    $('#li-out').innerHTML = '<div class="panel"><h3>Headline options</h3>' + (r.headlines || []).map(function (h, i) { return '<div class="rw" style="display:flex;gap:12px;align-items:center"><div style="flex:1;color:var(--navy-700);font-weight:600">' + esc(h) + '</div><button class="btn btn-outline btn-sm" data-cp="h' + i + '">Copy</button></div>'; }).join('') + '</div>' +
      '<div class="panel"><div class="copy-row"><h3 style="margin:0">About section</h3><button class="btn btn-outline btn-sm" data-cp="about">Copy</button></div><div class="output">' + esc(r.about) + '</div></div>' +
      '<div class="panel"><h3>Profile tips</h3><ul class="list-check" style="margin-top:12px">' + (r.tips || []).map(function (t) { return '<li>' + I.check + '<span>' + esc(t) + '</span></li>'; }).join('') + '</ul></div>';
    $('#li-out').onclick = function (e) { var b = e.target.closest('[data-cp]'); if (!b) return; var k = b.getAttribute('data-cp'); copy(k === 'about' ? r.about : r.headlines[+k.slice(1)], b); };
  }

  /* ---------- Coach ---------- */
  var SUGGEST = ['How do I answer “Tell me about yourself”?', 'What should I put on my CV with no experience?', 'How do I negotiate my first salary in Nigeria?', 'Which skills should I learn during NYSC?', 'How do I prepare for an aptitude test?'];
  VIEWS.coach = function (v) {
    if (!canAI()) { v.innerHTML = '<div class="view-head"><h2>AI career coach</h2></div>' + aiGate(); return; }
    v.innerHTML = '<div class="chat"><div class="chat-log" id="log" aria-live="polite"></div>' + (S.chat.length ? '' : '<div class="suggest" id="sug">' + SUGGEST.map(function (s) { return '<button type="button">' + esc(s) + '</button>'; }).join('') + '</div>') +
      '<form class="chat-form" id="cf"><label class="sr-only" for="q">Your question</label><textarea id="q" placeholder="Ask about CVs, interviews, salaries, NYSC, career moves…" rows="1"></textarea><button class="btn btn-primary" type="submit">Send</button></form></div>' +
      '<p class="fine" style="text-align:left">AI answers can be wrong. Check important details, and speak to a professional for legal or financial decisions.</p>';
    var log = $('#log');
    function draw() {
      log.innerHTML = '<div class="msg ai">Hello ' + esc(firstName()) + ', I am your Talents Klinik career coach. Ask me anything about your job search, CV, interviews or career direction.</div>' +
        S.chat.map(function (m) { return '<div class="msg ' + (m.role === 'user' ? 'user' : 'ai') + '">' + esc(m.content) + '</div>'; }).join('');
      log.scrollTop = log.scrollHeight;
    }
    draw();
    function send(text) {
      text = text.trim(); if (!text) return;
      var sug = $('#sug'); if (sug) sug.remove();
      S.chat.push({ role: 'user', content: text }); draw();
      log.insertAdjacentHTML('beforeend', '<div class="msg ai typing" id="typing"><i></i><i></i><i></i></div>'); log.scrollTop = log.scrollHeight;
      ai('coach', { messages: S.chat, profile: S.data.profile }).then(function (j) { S.chat.push({ role: 'assistant', content: j.text }); draw(); })
        .catch(function (e) { var t = $('#typing'); if (t) t.remove(); S.chat.pop(); log.insertAdjacentHTML('beforeend', '<div class="notice err">' + esc(e.message) + '</div>'); });
    }
    var q = $('#q');
    $('#cf').addEventListener('submit', function (e) { e.preventDefault(); var t = q.value; q.value = ''; send(t); });
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#cf').requestSubmit(); } });
    var sg = $('#sug'); if (sg) sg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) send(b.textContent); });
  };

  /* ---------- Account ---------- */
  VIEWS.account = function (v) {
    v.innerHTML = '<div class="view-head"><h2>Account and data</h2><p>Your data belongs to you. Download it or delete it at any time.</p></div>' +
      '<div class="g2"><div class="panel"><h3>' + (S.user ? 'Your account' : 'Guest mode') + '</h3><p class="hint">' + (S.user ? 'Signed in as ' + esc(S.user.email) + '. Your work is saved securely to your account.' : 'Your work is stored in this browser only. Clearing your browser data will remove it.') + '</p>' +
      (S.user ? '<form id="pw"><div class="field"><label for="npw">New password</label><input id="npw" type="password" minlength="8" autocomplete="new-password" required></div><div class="actions"><button class="btn btn-dark btn-sm" type="submit">Change password</button><button class="btn btn-outline btn-sm" type="button" data-action="signout">Sign out</button></div></form>' : (HAS_DB ? '<button class="btn btn-primary" data-action="to-auth">Create a free account</button>' : '<p style="margin:0;color:var(--gray-600)">Accounts are launching soon.</p>')) + '</div>' +
      '<div class="panel"><h3>Your data</h3><p class="hint">Download a copy of everything you have saved, or delete it permanently.</p><div class="actions"><button class="btn btn-outline btn-sm" id="exp">Download my data</button><button class="btn btn-outline btn-sm" id="del" style="color:#B42318;border-color:#FDA29B">Delete my data</button></div>' +
      '<p class="fine" style="text-align:left">See the <a href="' + SITE + '/privacy" target="_blank" rel="noopener">privacy policy</a>. Questions: <a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a></p></div></div>';
    $('#exp').onclick = function () { download('talents-klinik-my-data.json', JSON.stringify(S.data, null, 2), 'application/json'); };
    $('#del').onclick = function () {
      if (!confirm('Delete all your Talents Klinik data? This cannot be undone.')) return;
      S.data = blank(); S.chat = [];
      if (S.user) sb.from('tk_profiles').delete().eq('user_id', S.user.id).then(function (r) { toast(r.error ? 'Could not delete. Try again.' : 'Your data has been deleted'); refreshNav(); });
      else { localStorage.removeItem(LS_KEY); toast('Your data has been deleted'); refreshNav(); }
    };
    var pw = $('#pw');
    if (pw) pw.addEventListener('submit', function (e) { e.preventDefault(); sb.auth.updateUser({ password: $('#npw').value }).then(function (r) { toast(r.error ? r.error.message : 'Password updated'); $('#npw').value = ''; }); });
  };

  /* ================= AUTH ================= */
  function authScreen(mode) {
    mode = mode || 'signup';
    var app = $('#app');
    app.innerHTML = '<div class="auth"><section class="auth-brand"><div><img class="tk-logo" src="' + asset('brand/talents-klinik-logo-white.png') + '" alt="Talents Klinik"><h1>Your career, from assessment to hired</h1><p class="lead">Free tools to review your CV, understand how you work, close your skill gaps and get matched with employers.</p>' +
      '<ul class="auth-phases"><li><span>1</span>Build your profile</li><li><span>2</span>Assess your CV, personality and skills</li><li><span>3</span>Train with a personal learning plan</li><li><span>4</span>Record your certificates</li><li><span>5</span>Get matched with employers</li></ul></div>' +
      '<div class="by">By <img src="' + asset('brand/logo-white.png') + '" alt="RésuméKlinik"></div></section>' +
      '<section class="auth-panel"><div class="auth-card" id="auth-card"></div></section></div>';
    drawAuth(mode);
  }
  function drawAuth(mode) {
    var card = $('#auth-card');
    if (!HAS_DB) {
      card.innerHTML = '<h2>Welcome to Talents Klinik</h2><p class="sub">Member accounts are launching soon. You can use the platform now in guest mode; your work is saved on this device.</p><button class="btn btn-primary btn-block" id="guest">Start now as a guest</button><div class="divider">or</div><a class="btn btn-outline btn-block" href="' + SITE + '/waitlist">Join the waitlist for accounts</a><p class="fine"><a href="' + SITE + '">Back to RésuméKlinik</a></p>';
      $('#guest').onclick = startGuest; return;
    }
    if (mode === 'reset') {
      card.innerHTML = '<h2>Reset your password</h2><p class="sub">We will email you a secure link.</p><div id="msg"></div><form id="rf"><div class="field"><label for="re">Email</label><input id="re" type="email" required autocomplete="email"></div><button class="btn btn-primary btn-block" type="submit">Send reset link</button></form><p class="fine"><button class="linkbtn" id="back">Back to sign in</button></p>';
      $('#back').onclick = function () { drawAuth('signin'); };
      $('#rf').onsubmit = function (e) { e.preventDefault(); sb.auth.resetPasswordForEmail($('#re').value, { redirectTo: C.appUrl }).then(function (r) { $('#msg').innerHTML = r.error ? errorBox(r.error.message) : '<div class="notice ok">Check your email for a reset link.</div>'; }); };
      return;
    }
    if (mode === 'newpw') {
      card.innerHTML = '<h2>Choose a new password</h2><p class="sub">At least 8 characters.</p><div id="msg"></div><form id="nf"><div class="field"><label for="np">New password</label><input id="np" type="password" minlength="8" required autocomplete="new-password"></div><button class="btn btn-primary btn-block" type="submit">Save password</button></form>';
      $('#nf').onsubmit = function (e) { e.preventDefault(); sb.auth.updateUser({ password: $('#np').value }).then(function (r) { if (r.error) $('#msg').innerHTML = errorBox(r.error.message); else { toast('Password updated'); enter(); } }); };
      return;
    }
    var up = mode === 'signup';
    card.innerHTML = '<h2>' + (up ? 'Create your free account' : 'Welcome back') + '</h2><p class="sub">' + (up ? 'Save your progress and unlock AI career tools.' : 'Sign in to continue your journey.') + '</p>' +
      '<div class="seg" role="group"><button type="button" data-m="signup" aria-pressed="' + up + '">Create account</button><button type="button" data-m="signin" aria-pressed="' + !up + '">Sign in</button></div><div id="msg"></div>' +
      '<form id="af" novalidate>' + (up ? '<div class="g2"><div class="field"><label for="fn">First name</label><input id="fn" required autocomplete="given-name"></div><div class="field"><label for="ln">Last name</label><input id="ln" required autocomplete="family-name"></div></div>' : '') +
      '<div class="field"><label for="em">Email</label><input id="em" type="email" required autocomplete="email"></div>' +
      '<div class="field"><label for="pwd">Password' + (up ? ' <em>(at least 8 characters)</em>' : '') + '</label><input id="pwd" type="password" minlength="8" required autocomplete="' + (up ? 'new-password' : 'current-password') + '"></div>' +
      (up ? '<label class="checkline" style="margin-bottom:18px"><input type="checkbox" id="agree" required><span>I agree to the <a href="' + SITE + '/terms" target="_blank" rel="noopener">terms</a> and <a href="' + SITE + '/privacy" target="_blank" rel="noopener">privacy policy</a>.</span></label>' : '<p style="text-align:right;margin:-6px 0 16px"><button type="button" class="linkbtn" id="forgot">Forgot password?</button></p>') +
      '<button class="btn btn-primary btn-block" type="submit">' + (up ? 'Create account' : 'Sign in') + '</button></form>' +
      '<div class="divider">or</div><button class="btn btn-outline btn-block" id="guest">Continue as guest</button><p class="fine">Hiring? <a href="' + BASE + '/employers">Employer sign in</a> · <a href="' + SITE + '">Back to RésuméKlinik</a></p>';
    $$('.seg button', card).forEach(function (b) { b.onclick = function () { drawAuth(b.getAttribute('data-m')); }; });
    $('#guest').onclick = startGuest;
    var fg = $('#forgot'); if (fg) fg.onclick = function () { drawAuth('reset'); };
    $('#af').onsubmit = function (e) {
      e.preventDefault(); var f = e.target; if (!f.checkValidity()) { f.reportValidity(); return; }
      var btn = $('button[type=submit]', f); btn.disabled = true; btn.textContent = 'Please wait…';
      var email = $('#em').value.trim(), pass = $('#pwd').value;
      var p = up ? sb.auth.signUp({ email: email, password: pass, options: { emailRedirectTo: C.appUrl, data: { first_name: $('#fn').value.trim(), last_name: $('#ln').value.trim() } } }) : sb.auth.signInWithPassword({ email: email, password: pass });
      p.then(function (r) {
        btn.disabled = false; btn.textContent = up ? 'Create account' : 'Sign in';
        if (r.error) { $('#msg').innerHTML = errorBox(r.error.message === 'Invalid login credentials' ? 'That email and password do not match. Try again or reset your password.' : r.error.message); return; }
        if (up) {
          var guest = loadLocal() || blank(); guest.profile = Object.assign({}, guest.profile, { firstName: $('#fn').value.trim(), lastName: $('#ln').value.trim() }); saveLocal(guest);
          if (!r.data.session) { $('#msg').innerHTML = '<div class="notice ok">Account created. Check your email to confirm, then sign in.</div>'; return; }
        }
      });
    };
  }
  function startGuest() { S.guest = true; S.user = null; S.session = null; S.data = merge(blank(), loadLocal()); try { sessionStorage.setItem('tk_guest', '1'); } catch (e) {} enter(); }
  function enter() {
    var app = $('#app'); app.innerHTML = shell();
    if (!enter.bound) { bindShell(); enter.bound = true; }
    if (!enter.hash) { window.addEventListener('hashchange', go); enter.hash = true; }
    go();
  }
  function onSession(session) {
    S.session = session; S.user = session ? session.user : null;
    if (!S.user) return Promise.resolve(false);
    return loadRemote().then(function (remote) {
      var local = loadLocal();
      if (!remote && local) { S.data = merge(blank(), local); save(); localStorage.removeItem(LS_KEY); }
      else S.data = merge(blank(), remote);
      var md = S.user.user_metadata || {};
      if (!S.data.profile.firstName && md.first_name) { S.data.profile.firstName = md.first_name; S.data.profile.lastName = md.last_name || ''; save(); }
      return true;
    });
  }

  /* ================= BOOT ================= */
  function boot() {
    var b = $('.boot');
    var done = function () { if (b) { b.style.opacity = 0; setTimeout(function () { b.remove(); }, 300); } };
    if (!HAS_DB) {
      var g = false; try { g = sessionStorage.getItem('tk_guest') === '1' || !!loadLocal(); } catch (e) {}
      if (g) startGuest(); else authScreen();
      done(); return;
    }
    sb.auth.onAuthStateChange(function (ev, session) {
      if (ev === 'PASSWORD_RECOVERY') { authScreen('newpw'); return; }
      if (ev === 'SIGNED_IN' && (!S.user || S.user.id !== session.user.id)) onSession(session).then(enter);
      if (ev === 'TOKEN_REFRESHED') S.session = session;
      if (ev === 'SIGNED_OUT') { S.user = null; S.session = null; }
    });
    sb.auth.getSession().then(function (r) {
      var session = r.data && r.data.session;
      if (session) return onSession(session).then(enter);
      var g = false; try { g = sessionStorage.getItem('tk_guest') === '1'; } catch (e) {}
      if (g) startGuest(); else authScreen();
    }).then(done, done);
  }
  document.readyState !== 'loading' ? boot() : document.addEventListener('DOMContentLoaded', boot);
})();
