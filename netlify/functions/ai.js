/* Talents Klinik — AI endpoint (Netlify function)
   Served at /talentsklinik/api/ai (see _redirects).
   The API key lives ONLY here, as an environment variable on Netlify.
   Required env:  ANTHROPIC_API_KEY
   Recommended:   SUPABASE_URL, SUPABASE_ANON_KEY  (only signed-in users can use AI)
   Optional:      AI_MODEL (default below), REQUIRE_AUTH ("false" to allow guests)
*/

const MODEL = process.env.AI_MODEL || 'claude-haiku-4-5-20251001';
const CONTEXT = 'You work for Talents Klinik, the career intelligence platform by RésuméKlinik in Lagos, Nigeria. Your users are mostly young Nigerian and African graduates, corps members and early-career professionals. Be practical, specific, warm and honest. Prioritise the Nigerian and African job market, then global context. Use British English. Never invent facts about the user. Never include URLs.';

const clip = (s, n) => String(s == null ? '' : s).slice(0, n);
const profileText = (p) => {
  if (!p || typeof p !== 'object') return 'No profile provided.';
  const f = (k, l) => (p[k] ? `${l}: ${clip(Array.isArray(p[k]) ? p[k].join(', ') : p[k], 400)}\n` : '');
  return f('educationLevel', 'Education level') + f('course', 'Course of study') + f('degreeClass', 'Class of degree') +
    f('institution', 'Institution') + f('nysc', 'NYSC status') + f('qualifications', 'Professional qualifications') +
    f('experience', 'Experience level') + f('currentRole', 'Current role') + f('targetRole', 'Target role') +
    f('industries', 'Industries of interest') + f('skills', 'Skills') + f('location', 'Location');
};

const TASKS = {
  cv_review: {
    tokens: 2200,
    system: CONTEXT + ' You are a senior CV reviewer and former recruiter. Assess the CV the way Nigerian and international recruiters and applicant tracking systems do.',
    prompt: (i) => `Review this CV for the target role "${clip(i.targetRole, 120) || 'not specified'}".

Return ONLY valid JSON, no markdown, in exactly this shape:
{"score":0-100,"summary":"2-3 sentence overall verdict","scores":{"ats":0-100,"impact":0-100,"keywords":0-100,"structure":0-100},"strengths":["3 short strengths"],"fixes":[{"issue":"short title","why":"why it matters","how":"exactly how to fix it"}],"rewrites":[{"before":"an actual weak line from the CV","after":"a stronger rewrite that adds results, using placeholders like [X%] where numbers are unknown"}]}
Give 4-6 fixes ordered by impact and 2-3 rewrites. Score honestly; most unreviewed CVs score 40-65.

CV:
"""${clip(i.cv, 18000)}"""`
  },
  skill_gap: {
    tokens: 1800,
    system: CONTEXT + ' You are a career development specialist.',
    prompt: (i) => `Analyse the gap between this person and the target role "${clip(i.targetRole, 120)}".

Profile:
${profileText(i.profile)}
Current skills stated: ${clip(i.skills, 1200) || 'none stated'}

Return ONLY valid JSON in exactly this shape:
{"readiness":0-100,"summary":"2 sentences","have":["skills they already have that matter"],"gaps":[{"skill":"","priority":"high|medium|low","why":"","how":"a concrete way to build it in 4-8 weeks"}],"plan":[{"title":"a specific learning or practice task","type":"course|practice|project|certification","provider":"one of: Coursera, edX, Alison, freeCodeCamp, Khan Academy, Microsoft Learn, Cisco Networking Academy, HubSpot Academy, LinkedIn Learning, Google Career Certificates, Self-directed"}]}
Give 4-7 gaps and 5-8 plan items, ordered by priority.`
  },
  role_fit: {
    tokens: 1400,
    system: CONTEXT + ' You are a careers adviser.',
    prompt: (i) => `Suggest roles that fit this person well in the Nigerian and African job market.

Profile:
${profileText(i.profile)}
Personality summary: ${clip(i.persona, 600) || 'not available'}
CV review summary: ${clip(i.cvSummary, 600) || 'not available'}

Return ONLY valid JSON: {"roles":[{"title":"","fit":"strong|good|stretch","why":"one sentence","search":"2-4 word job-board search phrase"}]}
Give 5-6 roles, mixing entry points they can apply for now and one or two stretch roles.`
  },
  cover_letter: {
    tokens: 1500,
    system: CONTEXT + ' You write concise, specific cover letters that recruiters actually read.',
    prompt: (i) => `Write a cover letter for the role "${clip(i.role, 150)}" at "${clip(i.company, 150)}". Tone: ${clip(i.tone, 40) || 'professional'}.
Use 3-4 short paragraphs, under 330 words. No address block. Start with "Dear Hiring Manager," unless a name is given: ${clip(i.contact, 80) || 'none'}.
Use only facts from the profile and CV below; where a specific achievement is missing, use a clear placeholder in square brackets.

Profile:
${profileText(i.profile)}
Candidate name: ${clip(i.name, 80) || '[Your name]'}
CV highlights:
${clip(i.cv, 5000) || 'not provided'}

Job description:
${clip(i.jd, 6000) || 'not provided'}

Return only the letter text.`
  },
  linkedin: {
    tokens: 1500,
    system: CONTEXT + ' You are a LinkedIn personal branding specialist.',
    prompt: (i) => `Optimise this person's LinkedIn headline and About section.

Profile:
${profileText(i.profile)}
Current headline: ${clip(i.headline, 300) || 'none'}
Current About: ${clip(i.about, 3000) || 'none'}

Return ONLY valid JSON: {"headlines":["3 headline options, each under 220 characters"],"about":"an About section of 150-230 words in first person, with short paragraphs separated by \\n\\n","tips":["4 specific profile tips"]}`
  },
  persona: {
    tokens: 700,
    system: CONTEXT + ' You interpret Big Five personality results for career planning, carefully and without overclaiming.',
    prompt: (i) => `Big Five results (0-100): ${clip(JSON.stringify(i.traits), 400)}. Target role: ${clip(i.targetRole, 120) || 'not specified'}.
Write 2 short paragraphs (under 160 words total) on how this person likely works best and how to use it in their job search. Do not diagnose. Return plain text only.`
  }
};

const hits = new Map();
function limited(key) {
  const now = Date.now(), win = 60 * 60 * 1000, max = 40;
  const arr = (hits.get(key) || []).filter((t) => now - t < win);
  arr.push(now); hits.set(key, arr);
  return arr.length > max;
}

async function verifyUser(req) {
  const url = process.env.SUPABASE_URL, anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return { ok: process.env.REQUIRE_AUTH === 'true' ? false : true, id: null };
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return { ok: process.env.REQUIRE_AUTH === 'false', id: null };
  try {
    const r = await fetch(url.replace(/\/$/, '') + '/auth/v1/user', { headers: { apikey: anon, Authorization: auth } });
    if (!r.ok) return { ok: false, id: null };
    const u = await r.json();
    return { ok: true, id: u.id };
  } catch (e) { return { ok: false, id: null }; }
}

function parseJSON(text) {
  const s = text.indexOf('{'), e = text.lastIndexOf('}');
  if (s < 0 || e < s) throw new Error('no json');
  return JSON.parse(text.slice(s, e + 1));
}

async function handle(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'AI features are not switched on yet.' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const task = body.task, input = body.input || {};
  if (task !== 'coach' && !TASKS[task]) return res.status(400).json({ error: 'Unknown task' });

  const who = await verifyUser(req);
  if (!who.ok) return res.status(401).json({ error: 'Please sign in to use AI features.' });
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon';
  if (limited(who.id || ip)) return res.status(429).json({ error: 'You have reached the hourly limit. Please try again later.' });

  let payload;
  if (task === 'coach') {
    const msgs = (Array.isArray(input.messages) ? input.messages : []).slice(-16)
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: clip(m.content, 4000) }));
    if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return res.status(400).json({ error: 'No question' });
    while (msgs.length && msgs[0].role !== 'user') msgs.shift();
    payload = {
      model: MODEL, max_tokens: 900,
      system: CONTEXT + ' You are the Talents Klinik AI career coach. Answer in under 220 words unless asked for more, using short paragraphs or brief lists. If a question needs a professional (legal, medical, financial), say so. For CV writing or LinkedIn services, you may mention RésuméKlinik.\n\nUser profile:\n' + profileText(input.profile),
      messages: msgs
    };
  } else {
    const t = TASKS[task];
    if (task === 'cv_review' && String(input.cv || '').trim().length < 200) return res.status(400).json({ error: 'Your CV looks too short. Paste the full text or upload the file.' });
    payload = { model: MODEL, max_tokens: t.tokens, system: t.system, messages: [{ role: 'user', content: t.prompt(input) }] };
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) { console.error('AI error', r.status, data && data.error); return res.status(502).json({ error: 'The AI service is busy. Please try again in a moment.' }); }
    const text = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
    if (task === 'coach' || task === 'cover_letter' || task === 'persona') return res.status(200).json({ text });
    try { return res.status(200).json({ result: parseJSON(text) }); }
    catch (e) { return res.status(502).json({ error: 'We could not read the AI response. Please try again.' }); }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// Netlify adapter: gives handle() the same req/res shape it had on Vercel.
exports.handler = async (event) => {
  const headers = {};
  for (const k in event.headers || {}) headers[k.toLowerCase()] = event.headers[k];
  const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '');
  const req = { method: event.httpMethod, headers, body: raw };
  const out = { statusCode: 200, headers: { 'content-type': 'application/json' }, body: '' };
  const res = {
    setHeader(k, v) { out.headers[k.toLowerCase()] = v; return res; },
    status(c) { out.statusCode = c; return res; },
    json(o) { out.body = JSON.stringify(o); return res; }
  };
  try { await handle(req, res); }
  catch (e) { console.error(e); out.statusCode = 400; out.body = JSON.stringify({ error: 'Bad request' }); }
  return out;
};
