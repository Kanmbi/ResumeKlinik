/* Talents Klinik — employer portal
   Employers search an anonymised candidate pool, post roles and request introductions.
   Every introduction is approved by a Talents Klinik admin, who is the only person who
   can see candidate names and contact details (enforced by the database, see supabase-setup.sql). */
(function () {
  'use strict';
  var C = window.TK_CONFIG || {};
  var BASE = (C.base || '').replace(/\/$/, '');
  var SITE = C.siteUrl || 'https://resumeklinik.com';
  var HAS_DB = !!(C.supabaseUrl && C.supabaseAnonKey && window.supabase);
  var sb = HAS_DB ? window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'tk-employer-auth' } }) : null;
  var PENDING_KEY = 'tk_employer_pending';
  var PORTAL_URL = (C.appUrl || SITE + '/talentsklinik').replace(/\/$/, '') + '/employers';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };
  var asset = function (p) { return BASE + '/assets/' + p; };

  /* ---------------- Icons ---------------- */
  function ic(d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }
  var I = {
    home: ic('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>'),
    users: ic('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5.5 5.5 0 0 1 3.5 6"/>'),
    brief: ic('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>'),
    hand: ic('<path d="m11 17 2 2a2 2 0 0 0 3-3"/><path d="m14 14 2.5 2.5a2 2 0 0 0 3-3l-3.9-3.9a3 3 0 0 0-4.2 0l-.9.9a2 2 0 0 1-3-3l2.8-2.8a5 5 0 0 1 6.4-.5L21 6"/><path d="m21 3-1 10M3 4l1 10 6 6"/>'),
    star: ic('<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>'),
    cog: ic('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15.4H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8"/>'),
    shield: ic('<path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
    menu: ic('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    check: ic('<path d="M20 6 9 17l-5-5"/>'),
    circlecheck: ic('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),
    search: ic('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>'
  };

  /* ---------------- State ---------------- */
  var S = { user: null, employer: null, isAdmin: false, adminOnly: false, route: 'dashboard', candidates: null, shortlist: {}, jobs: null, intros: null };

  /* ---------------- Helpers ---------------- */
  function toast(t) { var el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('show'); }, 2600); }
  function wa(text) { if (!text && C.whatsappLink) return C.whatsappLink; return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(text || 'Hello Talents Klinik, I am an employer and need some help.'); }
  function fmt(d) { if (!d) return ''; return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function errorBox(msg) { return '<div class="notice err">' + esc(msg) + '</div>'; }
  function loading(text) { return '<div class="loading"><span class="spinner"></span><div style="flex:1"><b style="color:var(--navy-700)">' + esc(text) + '</b></div></div>'; }
  function list(v) { return Array.isArray(v) ? v : (v ? String(v).split(',').map(function (s) { return s.trim(); }).filter(Boolean) : []); }
  function sel(name, label, opts, val, opt) { return '<div class="field"><label for="f-' + name + '">' + label + (opt ? ' <em>(optional)</em>' : '') + '</label><select id="f-' + name + '" name="' + name + '"' + (opt ? '' : ' required') + '><option value="">Select</option>' + opts.map(function (o) { return '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select></div>'; }
  function inp(name, label, val, opt, type, ph) { return '<div class="field"><label for="f-' + name + '">' + label + (opt ? ' <em>(optional)</em>' : '') + '</label><input id="f-' + name + '" name="' + name + '" type="' + (type || 'text') + '" value="' + esc(val || '') + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + (opt ? '' : ' required') + '></div>'; }
  function area(name, label, val, opt, ph) { return '<div class="field"><label for="f-' + name + '">' + label + (opt ? ' <em>(optional)</em>' : '') + '</label><textarea id="f-' + name + '" name="' + name + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + (opt ? '' : ' required') + '>' + esc(val || '') + '</textarea></div>'; }
  function fail(r) { if (r && r.error) throw new Error(r.error.message || 'Something went wrong'); return r; }
  function pill(status) { var cls = { pending: 'medium', approved: 'strong', declined: 'high', rejected: 'high', open: 'strong', closed: 'low' }[status] || 'good'; return '<span class="pill ' + cls + '">' + esc(status) + '</span>'; }

  /* Fit score: how well a candidate matches a job, 0–100. Simple and explainable on purpose. */
  function words(s) { return String(s || '').toLowerCase().split(/[^a-z0-9+#]+/).filter(function (w) { return w.length > 2 && !STOP[w]; }); }
  var STOP = { and: 1, the: 1, for: 1, with: 1, you: 1, our: 1, are: 1, will: 1, have: 1, years: 1, role: 1, job: 1, work: 1, skills: 1, experience: 1 };
  function fit(c, job) {
    if (!job) return null;
    var jt = words(job.title), jr = words(job.requirements + ' ' + job.description);
    var ct = words(c.target_role + ' ' + c.current_role), cs = words(list(c.skills).join(' ') + ' ' + c.course + ' ' + c.qualifications);
    var titleHit = jt.length ? jt.filter(function (w) { return ct.indexOf(w) >= 0; }).length / jt.length : 0;
    var reqSet = {}; jr.forEach(function (w) { reqSet[w] = 1; }); var reqN = Object.keys(reqSet).length;
    var reqHit = reqN ? Object.keys(reqSet).filter(function (w) { return cs.indexOf(w) >= 0 || ct.indexOf(w) >= 0; }).length / reqN : 0;
    var loc = !job.location || /remote/i.test(job.work_mode || '') || new RegExp(words(job.location).join('|') || '$^', 'i').test((c.location || '') + ' ' + (c.preferred_locations || '')) ? 1 : 0.4;
    var cv = (c.cv_score || 50) / 100;
    return Math.round(100 * (0.4 * titleHit + 0.3 * Math.min(1, reqHit * 2) + 0.15 * loc + 0.15 * cv));
  }

  /* ---------------- Data ---------------- */
  function loadCandidates() {
    return sb.from('tk_candidates').select('*').order('updated_at', { ascending: false }).limit(300).then(fail).then(function (r) { S.candidates = r.data || []; return S.candidates; });
  }
  function loadShortlist() {
    return sb.from('tk_shortlist').select('candidate_id').eq('employer_id', S.user.id).then(fail).then(function (r) { S.shortlist = {}; (r.data || []).forEach(function (x) { S.shortlist[x.candidate_id] = true; }); });
  }
  function loadJobs() {
    return sb.from('tk_jobs').select('*').eq('employer_id', S.user.id).order('created_at', { ascending: false }).then(fail).then(function (r) {
      S.jobs = r.data || [];
      var ids = S.jobs.map(function (j) { return j.id; });
      if (!ids.length) return S.jobs;
      return sb.from('tk_interests').select('job_id, candidate_id, created_at').in('job_id', ids).then(fail).then(function (ri) {
        S.jobs.forEach(function (j) { j.interests = (ri.data || []).filter(function (x) { return x.job_id === j.id; }); });
        return S.jobs;
      });
    });
  }
  function loadIntros() {
    return sb.from('tk_intro_requests').select('*').eq('employer_id', S.user.id).order('created_at', { ascending: false }).then(fail).then(function (r) { S.intros = r.data || []; return S.intros; });
  }

  /* ---------------- Navigation ---------------- */
  var NAV = [
    { group: 'Overview', items: [['dashboard', 'Dashboard', 'home']] },
    { group: 'Hire', items: [['talent', 'Find talent', 'search'], ['jobs', 'My roles', 'brief'], ['intros', 'Introductions', 'hand'], ['shortlist', 'Shortlist', 'star']] },
    { group: 'Account', items: [['account', 'Company & account', 'cog']] }
  ];
  var TITLES = { dashboard: 'Dashboard', talent: 'Find talent', jobs: 'My roles', intros: 'Introductions', shortlist: 'Shortlist', account: 'Company & account', admin: 'Admin' };

  function shell() {
    var groups = S.adminOnly ? [{ group: 'Talents Klinik', items: [['admin', 'Admin', 'shield']] }, { group: 'Account', items: [['account', 'Account', 'cog']] }] : NAV.slice();
    if (S.isAdmin && !S.adminOnly) groups.push({ group: 'Talents Klinik', items: [['admin', 'Admin', 'shield']] });
    var nav = groups.map(function (g) {
      return '<div class="nav-group"><h6>' + g.group + '</h6>' + g.items.map(function (it) { return '<a class="nav-item" href="#/' + it[0] + '" data-r="' + it[0] + '">' + I[it[2]] + '<span>' + it[1] + '</span></a>'; }).join('') + '</div>';
    }).join('');
    var co = S.employer ? S.employer.company : 'Admin';
    return '<div class="shell">' +
      '<aside class="side" id="side" aria-label="Portal navigation"><a class="brand" href="#/dashboard"><img src="' + asset('brand/talents-klinik-logo.png') + '" alt="Talents Klinik"></a><div class="notice info" style="margin:0 10px 14px;font-size:.8rem">Employer portal · early access</div>' + nav +
      '<div class="side-foot"><div class="me"><span class="av">' + esc((co || 'E')[0].toUpperCase()) + '</span><span><b>' + esc(co) + '</b><small>' + esc(S.user.email) + '</small></span><button class="menu-btn" type="button" data-action="pop" aria-label="Account menu">⋯</button></div></div></aside>' +
      '<div class="scrim" data-action="close-side"></div>' +
      '<div class="main"><header class="topbar"><button class="m-menu" type="button" data-action="open-side" aria-label="Open menu">' + I.menu + '</button><h1 id="title"></h1><span class="spacer"></span>' +
      '<a class="btn btn-outline btn-sm" href="' + wa() + '" target="_blank" rel="noopener">' + I.wa + '<span class="hide-sm">Support</span></a></header>' +
      '<main class="view" id="view" tabindex="-1"></main></div>' +
      '<nav class="tabbar" aria-label="Quick navigation">' +
      (S.adminOnly ? [['admin', 'Admin', 'shield'], ['account', 'Account', 'cog']] : [['dashboard', 'Home', 'home'], ['talent', 'Talent', 'search'], ['jobs', 'Roles', 'brief'], ['intros', 'Intros', 'hand']]).map(function (t) { return '<a href="#/' + t[0] + '" data-r="' + t[0] + '">' + I[t[2]] + t[1] + '</a>'; }).join('') +
      '<button type="button" data-action="open-side">' + I.menu + 'More</button></nav></div>';
  }
  function go() {
    var r = (location.hash.replace(/^#\/?/, '') || 'dashboard').split('?')[0];
    if (!VIEWS[r] || (r === 'admin' && !S.isAdmin)) r = 'dashboard';
    if (S.adminOnly && r !== 'admin' && r !== 'account') r = 'admin';
    S.route = r;
    $$('[data-r]').forEach(function (a) { var on = a.getAttribute('data-r') === r; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $('#title').textContent = TITLES[r];
    document.title = TITLES[r] + ' | Talents Klinik for employers';
    closeSide();
    var v = $('#view'); v.innerHTML = '';
    VIEWS[r](v);
    window.scrollTo(0, 0);
  }
  function openSide() { $('#side').classList.add('open'); $('.scrim').classList.add('on'); }
  function closeSide() { var s = $('#side'); if (s) s.classList.remove('open'); var sc = $('.scrim'); if (sc) sc.classList.remove('on'); }
  function onClick(e) {
    var a = e.target.closest('[data-action]');
    if (!a) { var p = $('.pop'); if (p && !e.target.closest('.pop')) p.remove(); return; }
    var act = a.getAttribute('data-action');
    if (act === 'open-side') openSide();
    else if (act === 'close-side') closeSide();
    else if (act === 'pop') {
      var ex = $('.pop'); if (ex) { ex.remove(); return; }
      var pop = document.createElement('div'); pop.className = 'pop';
      pop.innerHTML = '<a href="#/account">Company &amp; account</a><a href="' + SITE + '/talents-klinik" target="_blank" rel="noopener">About Talents Klinik</a><button data-action="signout" class="danger">Sign out</button>';
      $('#side').appendChild(pop);
    }
    else if (act === 'signout') signOut();
    else if (act === 'shortlist') toggleShortlist(a.getAttribute('data-id'), a);
    else if (act === 'intro') introDialog(a.getAttribute('data-id'), a.getAttribute('data-job'));
    else if (act === 'close-dialog') { var d = $('.tk-dialog'); if (d) d.remove(); }
  }
  function signOut() { sb.auth.signOut().then(function () { S.user = null; S.employer = null; S.isAdmin = false; authScreen('signin'); }); }

  /* ---------------- Candidate card ---------------- */
  function candCard(c, job) {
    var score = fit(c, job);
    var tags = list(c.skills).slice(0, 8).map(function (s) { return '<span class="pill good">' + esc(s) + '</span>'; }).join(' ');
    var facts = [c.education && (c.education + (c.course ? ', ' + c.course : '')), c.degree_class, c.nysc_status && ('NYSC: ' + c.nysc_status), c.experience, c.location, c.availability && ('Available ' + (c.availability === 'Immediately' ? 'immediately' : c.availability.replace(/^Within/, 'within').replace(/^After/, 'after').replace(/^In /, 'in '))), c.work_mode && (c.work_mode + ' work')].filter(Boolean);
    return '<div class="panel cand" data-cid="' + esc(c.candidate_id) + '">' +
      '<div class="copy-row" style="align-items:flex-start"><div><b style="color:var(--navy-700);font-size:1.05rem">' + esc(c.target_role || 'Open to roles') + '</b><div style="color:var(--gray-600);font-size:.88rem;margin-top:2px">Candidate ' + esc(c.ref) + (c.current_role ? ' · currently ' + esc(c.current_role) : '') + '</div></div>' +
      '<div style="text-align:right;flex:none">' + (score != null ? '<span class="pill ' + (score >= 70 ? 'strong' : score >= 45 ? 'good' : 'stretch') + '">' + score + '% fit</span><br>' : '') + (c.cv_score ? '<small style="color:var(--gray-600)">CV score ' + esc(c.cv_score) + '/100</small>' : '') + '</div></div>' +
      '<p style="color:var(--gray-700);font-size:.93rem;margin:10px 0">' + esc(facts.join(' · ')) + '</p>' +
      (c.persona ? '<p style="font-size:.88rem;color:var(--gray-600);margin:0 0 10px">Work personality: ' + esc(c.persona) + (c.certificates ? ' · ' + esc(c.certificates) + ' certificate' + (c.certificates === 1 ? '' : 's') + ' recorded' : '') + '</p>' : '') +
      (tags ? '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">' + tags + '</div>' : '') +
      '<div class="actions"><button class="btn btn-primary btn-sm" data-action="intro" data-id="' + esc(c.candidate_id) + '" data-job="' + esc(job ? job.id : '') + '">Request introduction</button>' +
      '<button class="btn btn-outline btn-sm" data-action="shortlist" data-id="' + esc(c.candidate_id) + '" aria-pressed="' + !!S.shortlist[c.candidate_id] + '">' + I.star + (S.shortlist[c.candidate_id] ? ' Shortlisted' : ' Shortlist') + '</button></div></div>';
  }
  function toggleShortlist(id, btn) {
    var on = !!S.shortlist[id];
    var p = on ? sb.from('tk_shortlist').delete().eq('employer_id', S.user.id).eq('candidate_id', id) : sb.from('tk_shortlist').insert({ employer_id: S.user.id, candidate_id: id });
    p.then(fail).then(function () {
      if (on) delete S.shortlist[id]; else S.shortlist[id] = true;
      $$('[data-action="shortlist"][data-id="' + id + '"]').forEach(function (b) { b.innerHTML = I.star + (S.shortlist[id] ? ' Shortlisted' : ' Shortlist'); b.setAttribute('aria-pressed', String(!!S.shortlist[id])); });
      toast(on ? 'Removed from shortlist' : 'Added to shortlist');
    }).catch(function (e) { toast(e.message); });
  }
  function introDialog(cid, jobId) {
    var c = (S.candidates || []).filter(function (x) { return x.candidate_id === cid; })[0];
    var jobs = (S.jobs || []).filter(function (j) { return j.status === 'open'; });
    var d = document.createElement('div'); d.className = 'tk-dialog';
    d.innerHTML = '<div class="scrim on" data-action="close-dialog"></div><div class="panel dlg" role="dialog" aria-modal="true" aria-label="Request an introduction"><h3>Request an introduction</h3><p class="hint">Talents Klinik reviews every request, then connects you and the candidate by email or WhatsApp. Candidate ' + esc(c ? c.ref : '') + (c && c.target_role ? ' · ' + esc(c.target_role) : '') + '.</p><form id="intro-form">' +
      '<div class="field"><label for="f-job">For which role?</label><select id="f-job" name="job_id"><option value="">General interest</option>' + jobs.map(function (j) { return '<option value="' + esc(j.id) + '"' + (j.id === jobId ? ' selected' : '') + '>' + esc(j.title) + '</option>'; }).join('') + '</select></div>' +
      area('message', 'Message for Talents Klinik', '', true, 'What is the opportunity, and what should we tell the candidate?') +
      '<div class="actions"><button class="btn btn-primary" type="submit">Send request</button><button class="btn btn-outline" type="button" data-action="close-dialog">Cancel</button></div></form></div>';
    document.body.appendChild(d);
    $('#intro-form').onsubmit = function (e) {
      e.preventDefault(); var f = new FormData(e.target); var btn = $('button[type=submit]', e.target); btn.disabled = true;
      sb.from('tk_intro_requests').insert({ employer_id: S.user.id, candidate_id: cid, job_id: f.get('job_id') || null, message: String(f.get('message') || '').trim() || null }).then(fail)
        .then(function () { d.remove(); S.intros = null; toast('Request sent. We will be in touch soon.'); })
        .catch(function (err) { btn.disabled = false; toast(err.message); });
    };
  }

  /* ================= VIEWS ================= */
  var VIEWS = {};

  VIEWS.dashboard = function (v) {
    v.innerHTML = loading('Loading your dashboard…');
    Promise.all([S.jobs ? Promise.resolve(S.jobs) : loadJobs(), S.intros ? Promise.resolve(S.intros) : loadIntros(), loadShortlist(), S.candidates ? Promise.resolve(S.candidates) : loadCandidates()]).then(function () {
      var open = S.jobs.filter(function (j) { return j.status === 'open'; });
      var interested = open.reduce(function (n, j) { return n + (j.interests || []).length; }, 0);
      var pending = S.intros.filter(function (i) { return i.status === 'pending'; }).length;
      var tile = function (href, val, label) { return '<a class="tile" href="' + href + '"><b>' + val + '</b><span>' + label + '</span></a>'; };
      v.innerHTML = '<section class="journey"><h2>Welcome, ' + esc(S.employer.contact_name.split(' ')[0]) + '</h2><p>' + esc(S.employer.company) + ' has early access to Talents Klinik. Candidates here have been assessed on their CV, personality and skills before you see them. Introductions are free during early access.</p></section>' +
        '<div class="g3" style="margin-bottom:20px">' + tile('#/talent', S.candidates.length, 'candidates in the pool') + tile('#/jobs', open.length, 'open role' + (open.length === 1 ? '' : 's')) + tile('#/jobs', interested, 'candidate' + (interested === 1 ? '' : 's') + ' interested in your roles') + '</div>' +
        '<div class="g3" style="margin-bottom:20px">' + tile('#/intros', pending, 'introduction' + (pending === 1 ? '' : 's') + ' awaiting review') + tile('#/intros', S.intros.filter(function (i) { return i.status === 'approved'; }).length, 'introductions made') + tile('#/shortlist', Object.keys(S.shortlist).length, 'shortlisted') + '</div>' +
        '<div class="g2"><div class="panel"><h3>How it works</h3><ul class="list-check"><li>' + I.check + '<span><b>Search the pool.</b> Profiles are anonymised: you see education, skills, CV score, personality and availability, not names.</span></li><li>' + I.check + '<span><b>Post a role.</b> Candidates who opted in see it and can express interest; we rank them by fit.</span></li><li>' + I.check + '<span><b>Request an introduction.</b> Talents Klinik checks the fit and connects you both, usually within two working days.</span></li></ul></div>' +
        '<div class="panel"><h3>Start here</h3><p class="hint">Most employers post a role first, then browse.</p><div class="actions"><a class="btn btn-primary" href="#/jobs?new=1">' + I.plus + ' Post a role</a><a class="btn btn-outline" href="#/talent">' + I.search + ' Browse candidates</a></div></div></div>';
    }).catch(function (e) { v.innerHTML = errorBox(e.message); });
  };

  VIEWS.talent = function (v) {
    v.innerHTML = '<div class="view-head"><h2>Find talent</h2><p>Every candidate has opted in to employer matching. Names and contact details are shared only after Talents Klinik approves an introduction.</p></div>' +
      '<div class="panel"><form id="filters" class="g3" style="gap:14px 20px">' + inp('q', 'Role or skill', '', true, 'search', 'e.g. accountant, SQL, sales') + inp('loc', 'Location', '', true, 'text', 'e.g. Lagos, remote') + sel('edu', 'Education', ['SSCE', 'OND', 'HND', 'BSc', 'MSc', 'PhD'], '', true) + sel('avail', 'Availability', ['Immediately', 'Within 1 month', 'After NYSC', 'In 3+ months'], '', true) + sel('mode', 'Work mode', ['On-site', 'Hybrid', 'Remote', 'Any'], '', true) + inp('score', 'Minimum CV score', '', true, 'number', '0–100') + '</form><div class="actions"><button class="btn btn-dark btn-sm" id="apply">Apply filters</button><button class="btn btn-outline btn-sm" id="clear">Clear</button><span id="count" style="color:var(--gray-600);font-size:.9rem"></span></div></div>' +
      '<div id="results">' + loading('Loading candidates…') + '</div>';
    var draw = function () {
      var f = new FormData($('#filters')), q = words(f.get('q')), loc = String(f.get('loc') || '').trim().toLowerCase();
      var rows = S.candidates.filter(function (c) {
        if (q.length) { var hay = words([c.target_role, c.current_role, c.course, c.qualifications, list(c.skills).join(' '), list(c.industries).join(' ')].join(' ')); if (!q.every(function (w) { return hay.some(function (h) { return h.indexOf(w) >= 0; }); })) return false; }
        if (loc && ((c.location || '') + ' ' + (c.preferred_locations || '') + ' ' + (c.work_mode || '')).toLowerCase().indexOf(loc) < 0) return false;
        if (f.get('edu') && c.education !== f.get('edu')) return false;
        if (f.get('avail') && c.availability !== f.get('avail')) return false;
        if (f.get('mode') && f.get('mode') !== 'Any' && c.work_mode !== f.get('mode') && c.work_mode !== 'Any') return false;
        if (f.get('score') && (c.cv_score || 0) < +f.get('score')) return false;
        return true;
      });
      $('#count').textContent = rows.length + ' of ' + S.candidates.length + ' candidates';
      $('#results').innerHTML = rows.length ? rows.map(function (c) { return candCard(c, null); }).join('') : '<div class="panel empty-state"><h3>No candidates match those filters</h3><p>Try fewer filters. New candidates join every week.</p></div>';
    };
    Promise.all([S.candidates ? Promise.resolve() : loadCandidates(), loadShortlist()]).then(draw).catch(function (e) { $('#results').innerHTML = errorBox(e.message); });
    $('#apply').onclick = draw;
    $('#clear').onclick = function () { $('#filters').reset(); draw(); };
    $('#filters').onsubmit = function (e) { e.preventDefault(); draw(); };
  };

  VIEWS.shortlist = function (v) {
    v.innerHTML = '<div class="view-head"><h2>Shortlist</h2><p>Candidates you have saved. Request an introduction when you are ready to talk.</p></div><div id="results">' + loading('Loading…') + '</div>';
    Promise.all([S.candidates ? Promise.resolve() : loadCandidates(), loadShortlist()]).then(function () {
      var rows = S.candidates.filter(function (c) { return S.shortlist[c.candidate_id]; });
      $('#results').innerHTML = rows.length ? rows.map(function (c) { return candCard(c, null); }).join('') : '<div class="panel empty-state"><h3>Nothing shortlisted yet</h3><p>Use the star on any candidate to save them here.</p><a class="btn btn-primary" href="#/talent">Browse candidates</a></div>';
    }).catch(function (e) { $('#results').innerHTML = errorBox(e.message); });
  };

  VIEWS.jobs = function (v) {
    var wantNew = /new=1/.test(location.hash), openId = (location.hash.match(/job=([^&]+)/) || [])[1];
    v.innerHTML = '<div class="view-head"><h2>My roles</h2><p>Open roles are shown to candidates who opted in to matching. They can express interest, and you see them ranked by fit.</p></div><div id="jobs">' + loading('Loading roles…') + '</div>';
    var drawForm = function (j) {
      j = j || {};
      return '<div class="panel" id="job-form-box"><h3>' + (j.id ? 'Edit role' : 'Post a role') + '</h3><form id="job-form"><div class="g2">' + inp('title', 'Job title', j.title, false, 'text', 'e.g. Graduate Trainee, Finance') + inp('location', 'Location', j.location, false, 'text', 'e.g. Lagos') + sel('work_mode', 'Work mode', ['On-site', 'Hybrid', 'Remote'], j.work_mode) + sel('level', 'Level', ['Internship / NYSC', 'Graduate / entry', '1–3 years', '3–5 years', 'Senior'], j.level) + inp('salary_min', 'Salary from (₦/month)', j.salary_min, true, 'number') + inp('salary_max', 'Salary to (₦/month)', j.salary_max, true, 'number') + '</div>' +
        area('description', 'About the role', j.description, false, 'What the person will do, the team, and what makes it a good opportunity.') + area('requirements', 'Requirements', j.requirements, false, 'Degree, skills, tools, certifications. Be specific: this drives the fit ranking.') +
        '<div class="actions"><button class="btn btn-primary" type="submit">' + (j.id ? 'Save changes' : 'Publish role') + '</button><button class="btn btn-outline" type="button" id="job-cancel">Cancel</button></div></form></div>';
    };
    var bindForm = function (j) {
      $('#job-cancel').onclick = function () { location.hash = '#/jobs'; draw(); };
      $('#job-form').onsubmit = function (e) {
        e.preventDefault(); var f = e.target; if (!f.checkValidity()) { f.reportValidity(); return; }
        var d = new FormData(f), row = { employer_id: S.user.id, title: d.get('title').trim(), location: d.get('location').trim(), work_mode: d.get('work_mode'), level: d.get('level'), salary_min: d.get('salary_min') ? +d.get('salary_min') : null, salary_max: d.get('salary_max') ? +d.get('salary_max') : null, description: d.get('description').trim(), requirements: d.get('requirements').trim() };
        var btn = $('button[type=submit]', f); btn.disabled = true;
        (j && j.id ? sb.from('tk_jobs').update(row).eq('id', j.id) : sb.from('tk_jobs').insert(row)).then(fail).then(function () { toast(j && j.id ? 'Role updated' : 'Role published'); location.hash = '#/jobs'; return loadJobs(); }).then(draw).catch(function (err) { btn.disabled = false; toast(err.message); });
      };
    };
    var draw = function () {
      var box = $('#jobs'); if (!box) return;
      if (wantNew) { box.innerHTML = drawForm(); bindForm(null); wantNew = false; return; }
      var editing = S.jobs.filter(function (j) { return j.id === openId; })[0];
      if (editing && /edit=1/.test(location.hash)) { box.innerHTML = drawForm(editing); bindForm(editing); return; }
      if (!S.jobs.length) { box.innerHTML = '<div class="panel empty-state"><h3>You have not posted a role yet</h3><p>Post your first role and candidates who fit will start expressing interest.</p><button class="btn btn-primary" id="new-job">' + I.plus + ' Post a role</button></div>'; $('#new-job').onclick = function () { wantNew = true; draw(); }; return; }
      box.innerHTML = '<div class="actions" style="margin:0 0 16px"><button class="btn btn-primary btn-sm" id="new-job">' + I.plus + ' Post a role</button></div>' + S.jobs.map(function (j) {
        var n = (j.interests || []).length;
        return '<div class="panel"><div class="copy-row" style="align-items:flex-start"><div><b style="color:var(--navy-700);font-size:1.05rem">' + esc(j.title) + '</b><div style="color:var(--gray-600);font-size:.88rem;margin-top:2px">' + esc([j.location, j.work_mode, j.level].filter(Boolean).join(' · ')) + ' · posted ' + fmt(j.created_at) + '</div></div>' + pill(j.status) + '</div>' +
          '<div class="actions"><a class="btn btn-dark btn-sm" href="#/jobs?job=' + esc(j.id) + '" data-show="' + esc(j.id) + '">' + n + ' interested</a><a class="btn btn-outline btn-sm" href="#/jobs?job=' + esc(j.id) + '&edit=1">Edit</a><button class="btn btn-outline btn-sm" data-toggle="' + esc(j.id) + '">' + (j.status === 'open' ? 'Close role' : 'Reopen') + '</button></div>' +
          (openId === j.id ? '<div style="margin-top:18px" id="interested">' + (n ? '<h4 style="margin:0 0 10px;color:var(--navy-700)">Interested candidates, ranked by fit</h4>' + loading('Loading candidates…') : '<p class="hint" style="margin:0">No one has expressed interest yet. You can still search the pool and request introductions for this role.</p>') + '</div>' : '') + '</div>';
      }).join('');
      $('#new-job').onclick = function () { wantNew = true; draw(); };
      $$('[data-toggle]').forEach(function (b) { b.onclick = function () { var j = S.jobs.filter(function (x) { return x.id === b.getAttribute('data-toggle'); })[0]; sb.from('tk_jobs').update({ status: j.status === 'open' ? 'closed' : 'open' }).eq('id', j.id).then(fail).then(loadJobs).then(draw).catch(function (e) { toast(e.message); }); }; });
      $$('[data-show]').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); openId = a.getAttribute('data-show'); history.replaceState(null, '', '#/jobs?job=' + openId); draw(); }; });
      var job = S.jobs.filter(function (j) { return j.id === openId; })[0];
      if (job && (job.interests || []).length) {
        Promise.all([S.candidates ? Promise.resolve() : loadCandidates(), loadShortlist()]).then(function () {
          var ids = {}; job.interests.forEach(function (x) { ids[x.candidate_id] = 1; });
          var rows = S.candidates.filter(function (c) { return ids[c.candidate_id]; }).map(function (c) { return { c: c, s: fit(c, job) }; }).sort(function (a, b) { return b.s - a.s; });
          var el = $('#interested'); if (el) el.innerHTML = '<h4 style="margin:0 0 10px;color:var(--navy-700)">Interested candidates, ranked by fit</h4>' + (rows.length ? rows.map(function (r) { return candCard(r.c, job); }).join('') : '<p class="hint">These candidates have since left the matching pool.</p>');
        }).catch(function (e) { var el = $('#interested'); if (el) el.innerHTML = errorBox(e.message); });
      }
    };
    loadJobs().then(draw).catch(function (e) { $('#jobs').innerHTML = errorBox(e.message); });
  };

  VIEWS.intros = function (v) {
    v.innerHTML = '<div class="view-head"><h2>Introductions</h2><p>Each request is reviewed by Talents Klinik. When approved, we connect you and the candidate by email or WhatsApp.</p></div><div id="list">' + loading('Loading…') + '</div>';
    Promise.all([loadIntros(), S.candidates ? Promise.resolve() : loadCandidates(), S.jobs ? Promise.resolve() : loadJobs()]).then(function () {
      var byId = {}; S.candidates.forEach(function (c) { byId[c.candidate_id] = c; });
      var jobs = {}; S.jobs.forEach(function (j) { jobs[j.id] = j; });
      $('#list').innerHTML = S.intros.length ? S.intros.map(function (i) {
        var c = byId[i.candidate_id], j = jobs[i.job_id];
        return '<div class="panel"><div class="copy-row"><div><b style="color:var(--navy-700)">Candidate ' + esc(c ? c.ref : i.candidate_id.slice(0, 6).toUpperCase()) + (c && c.target_role ? ' · ' + esc(c.target_role) : '') + '</b><div style="color:var(--gray-600);font-size:.88rem;margin-top:2px">' + (j ? 'For ' + esc(j.title) + ' · ' : 'General interest · ') + 'requested ' + fmt(i.created_at) + '</div></div>' + pill(i.status) + '</div>' +
          (i.message ? '<p style="font-size:.93rem;color:var(--gray-700);margin:10px 0 0">“' + esc(i.message) + '”</p>' : '') +
          (i.status === 'approved' ? '<div class="notice ok" style="margin:12px 0 0">Approved. Check your email and WhatsApp for the introduction from Talents Klinik.</div>' : i.status === 'declined' ? '<div class="notice info" style="margin:12px 0 0">' + esc(i.admin_note || 'Not taken forward this time. Our team will share why by email.') + '</div>' : '') + '</div>';
      }).join('') : '<div class="panel empty-state"><h3>No introduction requests yet</h3><p>Find a candidate you like and click “Request introduction”.</p><a class="btn btn-primary" href="#/talent">Browse candidates</a></div>';
    }).catch(function (e) { $('#list').innerHTML = errorBox(e.message); });
  };

  VIEWS.account = function (v) {
    var e = S.employer;
    v.innerHTML = '<div class="view-head"><h2>Company and account</h2><p>Keep your details current; Talents Klinik uses them when making introductions.</p></div>' +
      '<div class="g2">' + (S.adminOnly ? '<div class="panel"><h3>Admin account</h3><p class="hint" style="margin:0">This login is a Talents Klinik admin. It has no company profile; use the Admin page to manage employers and introductions.</p></div>' : '<div class="panel"><h3>Company details</h3><form id="co-form">' + companyFields(e) + '<button class="btn btn-dark btn-sm" type="submit">Save details</button></form></div>') +
      '<div><div class="panel"><h3>Access</h3><p class="hint">Signed in as ' + esc(S.user.email) + '. Status: ' + pill(e.status) + '</p><form id="pw"><div class="field"><label for="npw">New password</label><input id="npw" type="password" minlength="8" autocomplete="new-password" required></div><div class="actions"><button class="btn btn-dark btn-sm" type="submit">Change password</button><button class="btn btn-outline btn-sm" type="button" data-action="signout">Sign out</button></div></form></div>' +
      '<div class="panel"><h3>Early access terms</h3><p class="hint" style="margin:0">Introductions are free during early access. Candidate data is shared only after an approved introduction and only for the purpose of that opportunity. See the <a href="' + SITE + '/privacy" target="_blank" rel="noopener">privacy policy</a> and <a href="' + SITE + '/terms" target="_blank" rel="noopener">terms</a>.</p></div></div></div>';
    if ($('#co-form')) $('#co-form').onsubmit = function (ev) {
      ev.preventDefault(); var f = ev.target; if (!f.checkValidity()) { f.reportValidity(); return; }
      var row = readCompany(new FormData(f));
      sb.from('tk_employers').update(row).eq('user_id', S.user.id).then(fail).then(function () { Object.assign(S.employer, row); toast('Details saved'); }).catch(function (err) { toast(err.message); });
    };
    $('#pw').onsubmit = function (ev) { ev.preventDefault(); sb.auth.updateUser({ password: $('#npw').value }).then(function (r) { toast(r.error ? r.error.message : 'Password updated'); $('#npw').value = ''; }); };
  };
  function companyFields(e) {
    e = e || {};
    return '<div class="g2">' + inp('company', 'Company name', e.company) + inp('website', 'Website or LinkedIn page', e.website, true, 'url', 'https://') + inp('contact_name', 'Your name', e.contact_name) + inp('phone', 'Phone or WhatsApp', e.phone, true, 'tel') +
      sel('industry', 'Industry', ['Banking & finance', 'Consulting', 'Technology', 'FMCG', 'Energy', 'Telecoms', 'Healthcare', 'Education', 'Public sector', 'NGO / development', 'Retail', 'Real estate', 'Other'], e.industry) + sel('size', 'Company size', ['1–10', '11–50', '51–200', '201–1000', '1000+'], e.size) + '</div>' +
      area('roles_hiring', 'Roles you typically hire for', e.roles_hiring, true, 'e.g. graduate trainees, analysts, sales executives');
  }
  function readCompany(d) {
    return { company: d.get('company').trim(), website: String(d.get('website') || '').trim() || null, contact_name: d.get('contact_name').trim(), phone: String(d.get('phone') || '').trim() || null, industry: d.get('industry') || null, size: d.get('size') || null, roles_hiring: String(d.get('roles_hiring') || '').trim() || null };
  }

  /* ---------- Admin: approve employers and introductions ---------- */
  VIEWS.admin = function (v) {
    v.innerHTML = '<div class="view-head"><h2>Admin</h2><p>Approve employer accounts and broker introductions. Only admins can see this page or candidate contact details.</p></div><div class="seg" role="group" style="max-width:420px"><button type="button" data-tab="employers" aria-pressed="true">Employers</button><button type="button" data-tab="intros" aria-pressed="false">Introductions</button></div><div id="admin-body">' + loading('Loading…') + '</div>';
    var tab = 'employers';
    var draw = function () {
      var box = $('#admin-body'); box.innerHTML = loading('Loading…');
      if (tab === 'employers') {
        sb.from('tk_employers').select('*').order('created_at', { ascending: false }).then(fail).then(function (r) {
          var rows = r.data || [];
          box.innerHTML = rows.length ? rows.map(function (e) {
            return '<div class="panel"><div class="copy-row" style="align-items:flex-start"><div><b style="color:var(--navy-700);font-size:1.05rem">' + esc(e.company) + '</b><div style="color:var(--gray-600);font-size:.88rem;margin-top:2px">' + esc(e.contact_name) + ' · <a href="mailto:' + esc(e.email) + '">' + esc(e.email) + '</a>' + (e.phone ? ' · ' + esc(e.phone) : '') + (e.website ? ' · <a href="' + esc(e.website) + '" target="_blank" rel="noopener">website</a>' : '') + '</div><div style="color:var(--gray-600);font-size:.88rem">' + esc([e.industry, e.size && e.size + ' staff', 'applied ' + fmt(e.created_at)].filter(Boolean).join(' · ')) + '</div>' + (e.roles_hiring ? '<p style="font-size:.9rem;margin:8px 0 0">Hires for: ' + esc(e.roles_hiring) + '</p>' : '') + '</div>' + pill(e.status) + '</div>' +
              '<div class="actions">' + (e.status !== 'approved' ? '<button class="btn btn-primary btn-sm" data-set="approved" data-id="' + esc(e.user_id) + '">Approve</button>' : '') + (e.status !== 'rejected' ? '<button class="btn btn-outline btn-sm" data-set="rejected" data-id="' + esc(e.user_id) + '">Reject</button>' : '') + (e.status !== 'pending' ? '<button class="btn btn-outline btn-sm" data-set="pending" data-id="' + esc(e.user_id) + '">Set pending</button>' : '') + '</div></div>';
          }).join('') : '<div class="panel empty-state"><h3>No employer sign-ups yet</h3></div>';
          $$('[data-set]', box).forEach(function (b) { b.onclick = function () { sb.from('tk_employers').update({ status: b.getAttribute('data-set') }).eq('user_id', b.getAttribute('data-id')).then(fail).then(function () { toast('Updated'); draw(); }).catch(function (e) { toast(e.message); }); }; });
        }).catch(function (e) { box.innerHTML = errorBox(e.message); });
      } else {
        sb.from('tk_intro_requests').select('*').order('created_at', { ascending: false }).then(fail).then(function (r) {
          var rows = r.data || [];
          if (!rows.length) { box.innerHTML = '<div class="panel empty-state"><h3>No introduction requests yet</h3></div>'; return; }
          var cids = rows.map(function (x) { return x.candidate_id; }), eids = rows.map(function (x) { return x.employer_id; }), jids = rows.map(function (x) { return x.job_id; }).filter(Boolean);
          return Promise.all([
            sb.from('tk_candidate_contacts').select('*').in('candidate_id', cids).then(fail),
            sb.from('tk_candidates').select('candidate_id, ref, target_role, location, cv_score').in('candidate_id', cids).then(fail),
            sb.from('tk_employers').select('user_id, company, contact_name, email, phone').in('user_id', eids).then(fail),
            jids.length ? sb.from('tk_jobs').select('id, title').in('id', jids).then(fail) : Promise.resolve({ data: [] })
          ]).then(function (all) {
            var contact = {}, cand = {}, emp = {}, job = {};
            (all[0].data || []).forEach(function (x) { contact[x.candidate_id] = x; }); (all[1].data || []).forEach(function (x) { cand[x.candidate_id] = x; }); (all[2].data || []).forEach(function (x) { emp[x.user_id] = x; }); (all[3].data || []).forEach(function (x) { job[x.id] = x; });
            box.innerHTML = rows.map(function (i) {
              var c = contact[i.candidate_id] || {}, p = cand[i.candidate_id] || {}, e = emp[i.employer_id] || {}, j = job[i.job_id];
              var name = [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Candidate ' + (p.ref || '');
              return '<div class="panel"><div class="copy-row" style="align-items:flex-start"><div><b style="color:var(--navy-700);font-size:1.05rem">' + esc(e.company || 'Employer') + ' → ' + esc(name) + '</b><div style="color:var(--gray-600);font-size:.88rem;margin-top:2px">' + (j ? 'For ' + esc(j.title) + ' · ' : 'General interest · ') + 'requested ' + fmt(i.created_at) + '</div></div>' + pill(i.status) + '</div>' +
                '<div class="g2" style="margin-top:12px;font-size:.9rem"><div><b>Employer</b><br>' + esc(e.contact_name || '') + '<br><a href="mailto:' + esc(e.email || '') + '">' + esc(e.email || '') + '</a>' + (e.phone ? '<br>' + esc(e.phone) : '') + '</div><div><b>Candidate</b><br>' + esc(p.target_role || '') + (p.location ? ' · ' + esc(p.location) : '') + (p.cv_score ? ' · CV ' + esc(p.cv_score) : '') + '<br><a href="mailto:' + esc(c.email || '') + '">' + esc(c.email || '') + '</a>' + (c.phone ? '<br>' + esc(c.phone) : '') + '</div></div>' +
                (i.message ? '<p style="font-size:.93rem;color:var(--gray-700);margin:12px 0 0">“' + esc(i.message) + '”</p>' : '') +
                (i.status === 'pending' ? '<div class="actions"><button class="btn btn-primary btn-sm" data-set="approved" data-id="' + esc(i.id) + '">Approve</button><button class="btn btn-outline btn-sm" data-set="declined" data-id="' + esc(i.id) + '">Decline</button></div>' : '') + '</div>';
            }).join('');
            $$('[data-set]', box).forEach(function (b) { b.onclick = function () { var st = b.getAttribute('data-set'); var note = st === 'declined' ? (prompt('Reason to show the employer (optional):') || null) : null; sb.from('tk_intro_requests').update({ status: st, admin_note: note }).eq('id', b.getAttribute('data-id')).then(fail).then(function () { toast('Updated. Now connect them by email or WhatsApp.'); draw(); }).catch(function (e) { toast(e.message); }); }; });
          });
        }).catch(function (e) { box.innerHTML = errorBox(e.message); });
      }
    };
    $$('[data-tab]', v).forEach(function (b) { b.onclick = function () { tab = b.getAttribute('data-tab'); $$('[data-tab]', v).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); draw(); }; });
    draw();
  };

  /* ================= AUTH & ONBOARDING ================= */
  function brandPanel() {
    return '<section class="auth-brand"><div><img class="tk-logo" src="' + asset('brand/talents-klinik-logo-white.png') + '" alt="Talents Klinik"><h1>Hire talent that arrives assessed</h1><p class="lead">Graduates and early-career professionals who have been through CV review, personality profiling and skill-gap training before you meet them.</p>' +
      '<ul class="auth-phases"><li><span>1</span>Create an employer account</li><li><span>2</span>Talents Klinik verifies your company</li><li><span>3</span>Search anonymised candidates or post a role</li><li><span>4</span>Request introductions; we connect you</li></ul></div>' +
      '<div class="by">By <img src="' + asset('brand/logo-white.png') + '" alt="RésuméKlinik"></div></section>';
  }
  function authScreen(mode) {
    $('#app').innerHTML = '<div class="auth">' + brandPanel() + '<section class="auth-panel"><div class="auth-card" id="auth-card"></div></section></div>';
    drawAuth(mode || 'signup');
  }
  function drawAuth(mode) {
    var card = $('#auth-card');
    if (!HAS_DB) {
      card.innerHTML = '<h2>Employer access is opening soon</h2><p class="sub">Employer accounts switch on with member accounts. Register your interest and we will email you the day it opens.</p><a class="btn btn-primary btn-block" href="' + SITE + '/talents-klinik#employers">Register interest</a><p class="fine"><a href="' + SITE + '">Back to RésuméKlinik</a></p>';
      return;
    }
    if (mode === 'reset') {
      card.innerHTML = '<h2>Reset your password</h2><p class="sub">We will email you a secure link.</p><div id="msg"></div><form id="rf"><div class="field"><label for="re">Work email</label><input id="re" type="email" required autocomplete="email"></div><button class="btn btn-primary btn-block" type="submit">Send reset link</button></form><p class="fine"><button class="linkbtn" id="back">Back to sign in</button></p>';
      $('#back').onclick = function () { drawAuth('signin'); };
      $('#rf').onsubmit = function (e) { e.preventDefault(); sb.auth.resetPasswordForEmail($('#re').value, { redirectTo: PORTAL_URL }).then(function (r) { $('#msg').innerHTML = r.error ? errorBox(r.error.message) : '<div class="notice ok">Check your email for a reset link.</div>'; }); };
      return;
    }
    if (mode === 'newpw') {
      card.innerHTML = '<h2>Choose a new password</h2><p class="sub">At least 8 characters.</p><div id="msg"></div><form id="nf"><div class="field"><label for="np">New password</label><input id="np" type="password" minlength="8" required autocomplete="new-password"></div><button class="btn btn-primary btn-block" type="submit">Save password</button></form>';
      $('#nf').onsubmit = function (e) { e.preventDefault(); sb.auth.updateUser({ password: $('#np').value }).then(function (r) { if (r.error) $('#msg').innerHTML = errorBox(r.error.message); else { toast('Password updated'); enter(); } }); };
      return;
    }
    var up = mode === 'signup';
    card.innerHTML = '<h2>' + (up ? 'Create an employer account' : 'Employer sign in') + '</h2><p class="sub">' + (up ? 'Free during early access. We verify every company before access is granted.' : 'Welcome back.') + '</p>' +
      '<div class="seg" role="group"><button type="button" data-m="signup" aria-pressed="' + up + '">Create account</button><button type="button" data-m="signin" aria-pressed="' + !up + '">Sign in</button></div><div id="msg"></div>' +
      '<form id="af" novalidate>' + (up ? companyFields() : '') +
      '<div class="field"><label for="em">Work email</label><input id="em" type="email" required autocomplete="email"></div>' +
      '<div class="field"><label for="pwd">Password' + (up ? ' <em>(at least 8 characters)</em>' : '') + '</label><input id="pwd" type="password" minlength="8" required autocomplete="' + (up ? 'new-password' : 'current-password') + '"></div>' +
      (up ? '<label class="checkline" style="margin-bottom:18px"><input type="checkbox" id="agree" required><span>I agree to the <a href="' + SITE + '/terms" target="_blank" rel="noopener">terms</a> and <a href="' + SITE + '/privacy" target="_blank" rel="noopener">privacy policy</a>, and to use candidate information only for genuine hiring.</span></label>' : '<p style="text-align:right;margin:-6px 0 16px"><button type="button" class="linkbtn" id="forgot">Forgot password?</button></p>') +
      '<button class="btn btn-primary btn-block" type="submit">' + (up ? 'Create account' : 'Sign in') + '</button></form>' +
      '<p class="fine">Looking for the candidate app? <a href="' + (C.appUrl || BASE) + '">Go to Talents Klinik</a></p>';
    $$('.seg button', card).forEach(function (b) { b.onclick = function () { drawAuth(b.getAttribute('data-m')); }; });
    var fg = $('#forgot'); if (fg) fg.onclick = function () { drawAuth('reset'); };
    $('#af').onsubmit = function (e) {
      e.preventDefault(); var f = e.target; if (!f.checkValidity()) { f.reportValidity(); return; }
      var btn = $('button[type=submit]', f); btn.disabled = true; btn.textContent = 'Please wait…';
      var email = $('#em').value.trim(), pass = $('#pwd').value;
      if (up) { var co = readCompany(new FormData(f)); co.email = email; try { localStorage.setItem(PENDING_KEY, JSON.stringify(co)); } catch (err) {} }
      var p = up ? sb.auth.signUp({ email: email, password: pass, options: { emailRedirectTo: PORTAL_URL, data: { role: 'employer' } } }) : sb.auth.signInWithPassword({ email: email, password: pass });
      p.then(function (r) {
        btn.disabled = false; btn.textContent = up ? 'Create account' : 'Sign in';
        if (r.error) { $('#msg').innerHTML = errorBox(r.error.message === 'Invalid login credentials' ? 'That email and password do not match. Try again or reset your password.' : r.error.message); return; }
        if (up && !r.data.session) $('#msg').innerHTML = '<div class="notice ok">Account created. Check your email to confirm it, then sign in to finish.</div>';
      });
    };
  }

  /* A signed-in user without an employer record: finish the company profile. */
  function onboardScreen(prefill) {
    $('#app').innerHTML = '<div class="auth">' + brandPanel() + '<section class="auth-panel"><div class="auth-card"><h2>Tell us about your company</h2><p class="sub">Signed in as ' + esc(S.user.email) + '. We review every employer before granting access.</p><div id="msg"></div><form id="ob">' + companyFields(prefill) + '<button class="btn btn-primary btn-block" type="submit">Submit for review</button></form><p class="fine"><button class="linkbtn" data-action="signout">Sign out</button></p></div></section></div>';
    $('#ob').onsubmit = function (e) {
      e.preventDefault(); var f = e.target; if (!f.checkValidity()) { f.reportValidity(); return; }
      var row = readCompany(new FormData(f)); row.user_id = S.user.id; row.email = S.user.email;
      sb.from('tk_employers').insert(row).then(fail).then(function () { try { localStorage.removeItem(PENDING_KEY); } catch (err) {} return loadMe(); }).then(enter).catch(function (err) { $('#msg').innerHTML = errorBox(err.message); });
    };
  }
  function pendingScreen() {
    var e = S.employer, rejected = e.status === 'rejected';
    $('#app').innerHTML = '<div class="auth">' + brandPanel() + '<section class="auth-panel"><div class="auth-card"><h2>' + (rejected ? 'We could not approve this account' : 'Your account is under review') + '</h2><p class="sub">' + (rejected ? esc(e.admin_note || 'We were unable to verify the company details provided. If you think this is a mistake, message us and we will take another look.') : 'Thank you, ' + esc(e.contact_name.split(' ')[0]) + '. We verify every employer by hand, usually within two working days, and will email ' + esc(e.email) + ' as soon as ' + esc(e.company) + ' is approved.') + '</p>' +
      '<ul class="list-check" style="margin:0 0 20px"><li>' + I.check + '<span>Company: ' + esc(e.company) + '</span></li><li>' + I.check + '<span>Contact: ' + esc(e.contact_name) + (e.phone ? ', ' + esc(e.phone) : '') + '</span></li><li>' + I.check + '<span>Applied: ' + fmt(e.created_at) + '</span></li></ul>' +
      '<a class="btn btn-primary btn-block" href="' + wa('Hello Talents Klinik, I registered ' + e.company + ' on the employer portal and have a question about my application.') + '" target="_blank" rel="noopener">' + I.wa + ' Message us on WhatsApp</a><p class="fine"><button class="linkbtn" id="recheck">Check again</button> · <button class="linkbtn" data-action="signout">Sign out</button></p></div></section></div>';
    $('#recheck').onclick = function () { loadMe().then(enter); };
  }

  function loadMe() {
    return Promise.all([
      sb.from('tk_employers').select('*').eq('user_id', S.user.id).maybeSingle().then(fail),
      sb.from('tk_admins').select('user_id').eq('user_id', S.user.id).maybeSingle().then(fail)
    ]).then(function (r) { S.employer = r[0].data || null; S.isAdmin = !!r[1].data; });
  }
  function enter() {
    if (!S.employer && !S.isAdmin) { var pre = null; try { pre = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null'); } catch (e) {} onboardScreen(pre); return; }
    if (S.employer && S.employer.status !== 'approved' && !S.isAdmin) { pendingScreen(); return; }
    S.adminOnly = S.isAdmin && !S.employer;
    if (S.adminOnly) { S.employer = { company: 'Talents Klinik', contact_name: 'Admin', status: 'approved' }; if (!/^#\/(admin|account)/.test(location.hash)) history.replaceState(null, '', '#/admin'); }
    $('#app').innerHTML = shell();
    if (!enter.hash) { window.addEventListener('hashchange', go); enter.hash = true; }
    go();
  }

  /* ================= BOOT ================= */
  function boot() {
    document.addEventListener('click', onClick); // one delegated handler for every screen, including sign-out on the review screen
    var b = $('.boot');
    var done = function () { if (b) { b.style.opacity = 0; setTimeout(function () { b.remove(); }, 300); } };
    if (!HAS_DB) { authScreen(); done(); return; }
    sb.auth.onAuthStateChange(function (ev, session) {
      if (ev === 'PASSWORD_RECOVERY') { S.user = session.user; authScreen('newpw'); return; }
      if (ev === 'SIGNED_IN' && (!S.user || S.user.id !== session.user.id)) { S.user = session.user; loadMe().then(enter); }
      if (ev === 'SIGNED_OUT') { S.user = null; }
    });
    sb.auth.getSession().then(function (r) {
      var session = r.data && r.data.session;
      if (session) { S.user = session.user; return loadMe().then(enter); }
      authScreen('signin');
    }).then(done, function (e) { done(); $('#app').innerHTML = '<div class="auth"><section class="auth-panel"><div class="auth-card">' + errorBox(e.message) + '</div></section></div>'; });
  }
  document.readyState !== 'loading' ? boot() : document.addEventListener('DOMContentLoaded', boot);
})();
