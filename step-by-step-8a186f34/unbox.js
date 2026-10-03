/* A private page for one person. No tracking, no external calls. */
(function () {
  'use strict';
  var CONFIG = {
    code: ['step by step'],          // what she types to open it (case and spaces don't matter)
    requireCode: true,               // set false to open without the three words
    campStart: '',                   // e.g. '2026-10-06' shows "Day 3 of 30" on the camp card; leave '' to hide it
    campDays: 30,
    heartsToCatch: 7,
    youtubeId: 'o7FM4ZV-BAQ',          // Lana Del Rey, Young and Beautiful (official video)
    songSeconds: 236,                // 3:56
    whatsapp: '2348081688328',       // where "Tell me you opened it" goes
    replyText: 'I opened it 🤍'
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var screens = { lock: $('#lock'), box: $('#box'), cards: $('#cards'), done: $('#done') };
  function show(name) { Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== name; }); window.scrollTo(0, 0); }

  /* ---------------- Sound (tiny synthesised chimes, nothing to download) ---------------- */
  var audio = { ctx: null, on: false };
  var soundBtn = $('#sound');
  function ensureCtx() { if (!audio.ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) audio.ctx = new AC(); } if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume(); }
  function tone(freq, t0, dur, type, gain) {
    if (!audio.on || !audio.ctx) return;
    var o = audio.ctx.createOscillator(), g = audio.ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain || 0.18, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(audio.ctx.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function chime(kind) {
    if (!audio.on) return; ensureCtx(); if (!audio.ctx) return;
    var t = audio.ctx.currentTime;
    if (kind === 'tap') { tone(660, t, 0.12, 'triangle', 0.12); }
    else if (kind === 'open') { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, t + i * 0.09, 0.5, 'triangle', 0.16); }); }
    else if (kind === 'catch') { tone(880, t, 0.1, 'sine', 0.1); tone(1320, t + 0.05, 0.12, 'sine', 0.08); }
    else if (kind === 'win') { [659, 784, 988, 1319].forEach(function (f, i) { tone(f, t + i * 0.1, 0.4, 'triangle', 0.14); }); }
    else if (kind === 'yes') { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, t + i * 0.12, 0.9, 'sine', 0.16); tone(f / 2, t + i * 0.12, 0.9, 'triangle', 0.06); }); }
  }
  soundBtn.addEventListener('click', function () {
    audio.on = !audio.on; ensureCtx();
    soundBtn.setAttribute('aria-pressed', String(audio.on)); soundBtn.setAttribute('aria-label', audio.on ? 'Turn sound off' : 'Turn sound on');
    if (audio.on) chime('tap');
  });

  /* ---------------- Our song (official YouTube player, starts on her tap) ---------------- */
  var songBtn = $('#song-btn'), songBox = $('#song-player'), songOn = false, songT0 = 0;
  songBtn.addEventListener('click', function () {
    if (!songOn) {
      songOn = true; songT0 = Date.now(); songBox.hidden = false;
      songBox.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + CONFIG.youtubeId + '?autoplay=1&playsinline=1&rel=0&modestbranding=1" title="Young and Beautiful" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
      songBtn.textContent = '♪ Young and Beautiful'; songBtn.classList.add('on');
      (function tick() { var p = Math.min(1, (Date.now() - songT0) / (CONFIG.songSeconds * 1000)); $('#songline i').style.width = (p * 100) + '%'; if (p < 1) setTimeout(tick, 1000); })();
    } else { songBox.classList.toggle('mini'); songBtn.textContent = songBox.classList.contains('mini') ? '♪ Show the song' : '♪ Young and Beautiful'; }
  });

  /* ---------------- Background hearts ---------------- */
  var bg = $('#bg'), bctx = bg.getContext('2d'), hearts = [];
  function heartPath(c, x, y, s) { c.beginPath(); c.moveTo(x, y + s * 0.3); c.bezierCurveTo(x, y, x - s * 0.5, y - s * 0.1, x - s * 0.5, y + s * 0.3); c.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s); c.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3); c.bezierCurveTo(x + s * 0.5, y - s * 0.1, x, y, x, y + s * 0.3); c.closePath(); }
  function sizeCanvas(c) { var d = Math.min(window.devicePixelRatio || 1, 2); c.width = innerWidth * d; c.height = innerHeight * d; c.getContext('2d').setTransform(d, 0, 0, d, 0, 0); }
  function seedHearts() { hearts = []; for (var i = 0; i < (innerWidth < 600 ? 16 : 28); i++) hearts.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, s: 8 + Math.random() * 22, v: 0.15 + Math.random() * 0.35, a: 0.05 + Math.random() * 0.12, w: Math.random() * 6.28 }); }
  function drawBg() {
    bctx.clearRect(0, 0, innerWidth, innerHeight);
    hearts.forEach(function (h) {
      bctx.fillStyle = 'rgba(255,133,181,' + h.a + ')'; heartPath(bctx, h.x + Math.sin(h.w) * 10, h.y, h.s); bctx.fill();
      if (!reduce) { h.y -= h.v; h.w += 0.01; if (h.y < -40) { h.y = innerHeight + 40; h.x = Math.random() * innerWidth; } }
    });
    if (!reduce) requestAnimationFrame(drawBg);
  }
  sizeCanvas(bg); seedHearts(); drawBg();

  /* ---------------- Confetti / heart rain ---------------- */
  var fx = $('#fx'), fctx = fx.getContext('2d'), parts = [], fxRunning = false;
  var COLORS = ['#ff3d8f', '#ff85b5', '#e5243f', '#f5c76b', '#2bb3a8', '#ffffff'];
  function burst(x, y, n, spread) {
    for (var i = 0; i < n; i++) { var a = Math.random() * 6.28, sp = (spread || 9) * (0.4 + Math.random()); parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4, g: 0.22, r: 4 + Math.random() * 7, c: COLORS[i % COLORS.length], heart: Math.random() < 0.5, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, life: 90 + Math.random() * 60 }); }
    runFx();
  }
  function rain(n) { for (var i = 0; i < n; i++) parts.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.5, vx: (Math.random() - 0.5) * 1.5, vy: 1.5 + Math.random() * 2.5, g: 0.01, r: 8 + Math.random() * 12, c: COLORS[i % 4], heart: true, rot: 0, vr: (Math.random() - 0.5) * 0.05, life: 400 }); runFx(); }
  function runFx() {
    if (fxRunning) return; fxRunning = true;
    (function frame() {
      fctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(function (p) { return p.life > 0 && p.y < innerHeight + 40; });
      parts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.vy += p.g; p.rot += p.vr; p.life--;
        fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.rot); fctx.globalAlpha = Math.min(1, p.life / 40); fctx.fillStyle = p.c;
        if (p.heart) { heartPath(fctx, 0, -p.r / 2, p.r); fctx.fill(); } else fctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        fctx.restore();
      });
      if (parts.length) requestAnimationFrame(frame); else { fxRunning = false; fctx.clearRect(0, 0, innerWidth, innerHeight); }
    })();
  }
  sizeCanvas(fx);
  window.addEventListener('resize', function () { sizeCanvas(bg); sizeCanvas(fx); seedHearts(); if (reduce) drawBg(); });

  /* ---------------- 1. The lock ---------------- */
  var tries = 0, hint = $('#hint'), code = $('#code');
  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z]/g, ''); }
  $('#lock-form').addEventListener('submit', function (e) {
    e.preventDefault(); ensureCtx();
    var ok = CONFIG.code.some(function (c) { return norm(c) === norm(code.value); });
    if (ok) { chime('open'); show('box'); return; }
    tries++; code.classList.remove('shake'); void code.offsetWidth; code.classList.add('shake');
    hint.hidden = false;
    hint.textContent = tries === 1 ? 'Not that. Hint: it’s how we said we’d take it.' : 'It’s “step by step”. Type that, and I’ll let you in.';
    code.focus(); code.select();
  });
  if (!CONFIG.requireCode) show('box'); else { show('lock'); setTimeout(function () { code.focus(); }, 400); }

  /* ---------------- 2. The box ---------------- */
  var gift = $('#gift'), taps = 0, tapDots = $$('#taps i'), opened = false;
  function tapBox() {
    if (opened) return; ensureCtx();
    taps++; tapDots.slice(0, taps).forEach(function (d) { d.classList.add('on'); });
    gift.classList.remove('wiggle'); void gift.offsetWidth; gift.classList.add('wiggle');
    var r = gift.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height * 0.35, 10, 5);
    chime('tap');
    $('#box-lead').textContent = taps === 1 ? 'Harder.' : taps === 2 ? 'One more…' : 'There it goes.';
    if (taps >= 3) {
      opened = true; gift.classList.add('open'); gift.setAttribute('aria-label', 'The box is open');
      setTimeout(function () { var r2 = gift.getBoundingClientRect(); burst(r2.left + r2.width / 2, r2.top + r2.height * 0.4, 90, 11); chime('open'); }, 250);
      setTimeout(function () { show('cards'); goTo(0); }, 1500);
    }
  }
  gift.addEventListener('click', tapBox);
  gift.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapBox(); } });

  /* ---------------- 3. The cards ---------------- */
  var cards = $$('.card'), idx = 0, prev = $('#prev'), next = $('#next'), dots = $('#dots');
  var gates = {};  // step index -> true when its little game is done
  cards.forEach(function () { var i = document.createElement('i'); dots.appendChild(i); });
  function gated(i) { var c = cards[i].classList; return c.contains('game') && !gates.game || c.contains('reveal') && !gates.reveal || c.contains('pack') && !gates.pack || c.contains('kit') && !gates.kit; }
  function goTo(i) {
    idx = Math.max(0, Math.min(cards.length - 1, i)); sx = null;
    cards.forEach(function (c, k) { c.classList.toggle('on', k === idx); c.classList.toggle('left', k < idx); });
    $$('i', dots).forEach(function (d, k) { d.classList.toggle('on', k === idx); d.classList.toggle('done', k < idx); });
    prev.disabled = idx === 0; prev.style.visibility = idx === 0 ? 'hidden' : 'visible';
    var last = idx === cards.length - 1;
    next.hidden = last; next.disabled = gated(idx);
    if (cards[idx].classList.contains('game')) startGame();
    if (cards[idx].classList.contains('reveal')) initScratch();
    if (cards[idx].classList.contains('pack')) startPack();
    if (cards[idx].classList.contains('kit')) startKit();
    chime('tap');
  }
  next.addEventListener('click', function () { if (!gated(idx)) goTo(idx + 1); });
  prev.addEventListener('click', function () { goTo(idx - 1); });
  // swipe between cards
  var sx = null, sy = null, st = 0;
  // A swipe only starts on plain card content: never on the game, the scratch canvas, a button,
  // or an element that has already been removed from the page (the last caught heart).
  $('#deck').addEventListener('pointerdown', function (e) { sx = null; if (!e.target.isConnected || e.target.closest('.arena, .frame, canvas, button')) return; sx = e.clientX; sy = e.clientY; st = Date.now(); });
  $('#deck').addEventListener('pointerup', function (e) {
    if (sx == null) return; var dx = e.clientX - sx, dy = e.clientY - sy, quick = Date.now() - st < 800; sx = null;
    if (quick && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { if (dx < 0 && !gated(idx) && idx < cards.length - 1) goTo(idx + 1); else if (dx > 0) goTo(idx - 1); }
  });
  $('#deck').addEventListener('pointercancel', function () { sx = null; });
  document.addEventListener('keydown', function (e) { if (screens.cards.hidden) return; if (e.key === 'ArrowRight' && !gated(idx)) goTo(idx + 1); if (e.key === 'ArrowLeft') goTo(idx - 1); });

  /* ---------------- 3b. Pack the camp bag ---------------- */
  var ITEMS = [
    ['🧹', 'Broom', true, 'Packed. Camp dust has met its match.', 'Leave the broom? Madam, who will sweep the vibes?'],
    ['🗡️', 'Cutlass', true, 'Packed. For grass. Only grass. We agreed.', 'No cutlass? The grass will laugh at you. Try again.', 'cutlass.jpg'],
    ['👠', 'Heels', false, 'Heels? To do what, intimidate the mosquitoes? Leave them.', 'Correct. The camp ground is not a runway.'],
    ['⚒️', 'Hoe', true, 'Packed. Fire Service by day, farmer by weekend.', 'No hoe? Who will clear that camp farm, your prayers?'],
    ['⛏️', 'Shovel', true, 'Packed. Whatever they are digging, you will dig it faster.', 'No shovel? They will hand you a spoon.'],
    ['📺', 'Netflix', false, 'No light, no Wi-Fi, no chill. Leave it.', 'Correct. The only series in camp is “wake up”.'],
    ['🪖', 'Head pan', true, 'Packed. Bricklayer’s head pan: cement today, a personal statement tomorrow.', 'No head pan? You want to carry cement in your handbag?', 'headpan.jpg'],
    ['🍂', 'Rake', true, 'Packed. The leaves will line up and apologise.', 'Leave the rake and the leaves win. Try again.', 'rake.jpg'],
    ['🙋🏾‍♂️', 'Mayowa', false, 'Tried to fit in the bag. Didn’t. Sending texts instead.', 'Correct, I won’t fit. But I’m coming in spirit, daily.'],
    ['🪣', 'Bucket', true, 'Packed. Five-star shower, camp edition.', 'No bucket? Bathing with what, confidence?'],
    ['🔥', 'Cooking gas', true, 'Packed. Camp kitchen upgraded. Chef Sururah.', 'No gas? Firewood and tears, then.'],
    ['🛒', 'Food items & groceries', true, 'Packed. Nobody is losing weight on my watch.', 'Leave the food? Camp food will humble you. Pack it.'],
    ['🛌', 'Duvet', false, 'A duvet? The camp will provide a mat and vibes. Leave it.', 'Correct. Mat and vibes it is.'],
    ['🍲', 'Semovita', true, 'Packed. Swallow secured. Egusi, you are next.', 'No Semovita? The eba people will mock you.', 'semovita.jpg'],
    ['🌽', 'Yellow garri', true, 'Packed. Yellow garri: the official stress drink of camp.', 'No garri? Then what exactly will you “soak”?', 'garri.jpg'],
    ['🔦', 'Torch', true, 'Packed. For finding your slippers at 4am.', 'No torch? 4am will find you first.'],
    ['🍗', 'ChickWizz', true, 'Packed. ChickWizz, for the days camp food tries you.', 'No ChickWizz? Who hurt you?', 'chickwizz.jpg'],
    ['💧', 'Eye drops', true, 'Packed. For the dust, the sun, and when camp makes you cry small.', 'No eye drops? Those drills will have you squinting till November.', 'eyedrops.jpg'],
    ['🦟', 'Mosquito net', true, 'Packed. The mosquitoes have been told about you. They are scared.', 'No net? The mosquitoes have already said thank you.'],
    ['🥾', 'Boots', true, 'Packed. Camp has never seen anybody march like this.', 'No boots? Those drills will humble your slippers.'],
    ['🧴', 'Robb', true, 'Packed. For headache, chest, bites and heartbreak.', 'No Robb? Which Nigerian are you?', 'robb.jpg']
  ];
  var queue = [], cur = null, packed = 0, packOn = false, NEED = ITEMS.filter(function (i) { return i[2]; }).length;
  function dealItem() {
    if (!queue.length) { finishPack(); return; }
    cur = queue.shift();
    var el = $('#item'); el.className = 'item'; void el.offsetWidth;
    var em = $('#item-emoji');
    if (cur[5]) em.innerHTML = '<img src="' + cur[5] + '" alt="">'; else em.textContent = cur[0];
    $('#item-name').textContent = cur[1];
    $('#verdict').textContent = cur[2] === null ? '' : 'Pack it, or leave it?';
  }
  function decide(packIt) {
    if (!cur || !packOn) return; var it = cur, el = $('#item'); cur = null; ensureCtx();
    var right = packIt === it[2];
    $('#verdict').textContent = packIt ? it[3] : it[4];
    if (packIt && it[2]) { packed++; el.classList.add('out-bag'); chime('catch'); var r = $('.bag span').getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 10, 5); }
    else if (packIt) { el.classList.add('bounce'); chime('tap'); queue.push(it); }
    else if (it[2]) { el.classList.add('out-left'); queue.push(it); }
    else { el.classList.add('out-left'); chime('tap'); }
    $('#bagfill').style.width = (packed / NEED * 100) + '%'; $('#bagcount').textContent = packed + ' / ' + NEED + ' packed';
    if (packed >= NEED) { packOn = false; setTimeout(finishPack, 1400); return; }
    setTimeout(dealItem, 1500);
  }
  function startPack() {
    if (gates.pack || packOn) return; packOn = true; packed = 0; queue = ITEMS.slice(); $('#bagcount').textContent = '0 / ' + NEED + ' packed';
    if (CONFIG.campStart) { var day = Math.floor((Date.now() - new Date(CONFIG.campStart).getTime()) / 864e5) + 1; if (day >= 1 && day <= CONFIG.campDays) $('#campline').textContent = 'Day ' + day + ' of ' + CONFIG.campDays + '. Somewhere in that camp there is grass that has no idea what is coming.'; else if (day > CONFIG.campDays) $('#campline').textContent = 'Camp: survived. The grass: humbled.'; }
    dealItem();
  }
  function finishPack() {
    gates.pack = true; packOn = false; next.disabled = false;
    $('#packer').innerHTML = '<div class="won" style="position:static;background:none;padding:10px 0;font-size:1.5rem">Bag packed. That camp is not ready for you.</div><p class="verdict" style="text-align:center">Broom, cutlass, hoe, shovel, head pan, rake, gas, groceries, Semovita, garri, ChickWizz, eye drops, the lot. Half of Abuja market, honestly. And me, in every message.</p>';
    chime('win'); var r = $('#packer').getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 50, 8);
  }
  $('#packit').addEventListener('click', function () { decide(true); });
  $('#leave').addEventListener('click', function () { decide(false); });

  /* ---------------- 3c. Survival kit ---------------- */
  var flipped = 0, kitStarted = false;
  function startKit() { if (kitStarted) return; kitStarted = true; }
  $$('#kit .flip').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.classList.contains('on')) return; b.classList.add('on'); flipped++; chime('tap');
      var left = 4 - flipped; $('#kit-left').textContent = left ? left + ' left to open' : 'That is the whole kit. Plus me.';
      if (!left) { gates.kit = true; next.disabled = false; chime('win'); var r = $('#kit').getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 40, 7); }
    });
  });

  /* ---------------- 4. Catch the hearts ---------------- */
  var arena = $('#arena'), score = $('#score'), caught = 0, spawner = null, gameOn = false, skipTimer = null;
  $('#need').textContent = CONFIG.heartsToCatch; score.textContent = '0 / ' + CONFIG.heartsToCatch;
  function spawn() {
    var h = document.createElement('span'); h.className = 'fall' + (Math.random() < 0.15 ? ' gold' : ''); h.textContent = '♥';
    h.style.left = (6 + Math.random() * 78) + '%'; h.style.animationDuration = (reduce ? 6 : 2.6 + Math.random() * 1.8) + 's';
    h.addEventListener('animationend', function () { if (h.parentNode && !h.classList.contains('caught')) h.remove(); });
    h.addEventListener('pointerdown', function (e) {
      e.preventDefault(); if (h.classList.contains('caught') || !gameOn) return;
      h.classList.add('caught'); setTimeout(function () { h.remove(); }, 350);
      caught += h.classList.contains('gold') ? 2 : 1; caught = Math.min(caught, CONFIG.heartsToCatch);
      score.textContent = caught + ' / ' + CONFIG.heartsToCatch; chime('catch');
      var r = arena.getBoundingClientRect(); burst(r.left + (parseFloat(h.style.left) / 100) * r.width + 22, e.clientY || r.top + 100, 8, 4);
      if (caught >= CONFIG.heartsToCatch) winGame();
    });
    arena.appendChild(h);
  }
  function startGame() {
    if (gates.game || gameOn) return; gameOn = true; caught = 0; score.textContent = '0 / ' + CONFIG.heartsToCatch;
    spawner = setInterval(spawn, 650); spawn();
    skipTimer = setTimeout(function () { $('#skip-game').hidden = false; }, 20000);
  }
  function winGame() {
    gameOn = false; clearInterval(spawner); clearTimeout(skipTimer); gates.game = true;
    setTimeout(function () { $$('.fall', arena).forEach(function (h) { h.remove(); }); }, 0);
    var w = document.createElement('div'); w.className = 'won'; w.textContent = 'Unlocked. Of course you did.'; arena.appendChild(w);
    chime('win'); var r = arena.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 50, 8);
    next.disabled = false; $('#skip-game').hidden = true;
  }
  $('#skip-game').addEventListener('click', winGame);

  /* ---------------- 5. Scratch to reveal ---------------- */
  var scratchReady = false;
  function initScratch() {
    if (scratchReady) return; scratchReady = true;
    var frame = $('#frame'), cv = $('#scratch'), c = cv.getContext('2d');
    var d = Math.min(window.devicePixelRatio || 1, 2), W = frame.clientWidth, H = frame.clientHeight;
    cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0);
    var g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#ff5aa3'); g.addColorStop(1, '#e5243f');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,.22)'; for (var i = 0; i < 40; i++) { heartPath(c, Math.random() * W, Math.random() * H, 10 + Math.random() * 18); c.fill(); }
    c.fillStyle = '#fff'; c.font = '800 15px Nunito, sans-serif'; c.textAlign = 'center';
    c.fillText('scratch with your finger', W / 2, H / 2 - 8); c.font = '600 13px Nunito, sans-serif'; c.fillText('(or your mouse, if you must)', W / 2, H / 2 + 14);
    c.globalCompositeOperation = 'destination-out';
    var down = false, moves = 0, done = false;
    function at(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function rub(x, y) { c.beginPath(); c.arc(x, y, 26, 0, 6.28); c.fill(); }
    function cleared() { var img = c.getImageData(0, 0, cv.width, cv.height).data, n = 0, t = 0; for (var i = 3; i < img.length; i += 4 * 16) { t++; if (img[i] < 40) n++; } return n / t; }
    function finish() { if (done) return; done = true; gates.reveal = true; cv.classList.add('gone'); $('#reveal-text').classList.add('in'); next.disabled = false; chime('win'); var r = frame.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 40, 7); }
    cv.addEventListener('pointerdown', function (e) { down = true; cv.setPointerCapture(e.pointerId); var p = at(e); rub(p[0], p[1]); ensureCtx(); });
    cv.addEventListener('pointermove', function (e) { if (!down) return; var p = at(e); rub(p[0], p[1]); if (++moves % 12 === 0 && cleared() > 0.45) finish(); });
    var up = function () { if (!down) return; down = false; if (cleared() > 0.45) finish(); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', up);
  }

  /* ---------------- 6. Yes ---------------- */
  function yes() {
    ensureCtx(); chime('yes'); show('done'); rain(120); setTimeout(function () { rain(80); }, 1200); setTimeout(function () { rain(60); }, 2600);
    var a = $('#reply'); a.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(CONFIG.replyText);
  }
  $('#yes').addEventListener('click', yes);
  $('#yes2').addEventListener('click', yes);
  var LINES = ['You are doing better than the grass. The grass is finished.', 'Whoever is shouting at you today does not know you survived a year of my begging. Nothing scares you.', 'Broom in one hand, cutlass in the other. Beyoncé could never.', 'If the food is bad, remember: a treat is waiting at the end. From me.', 'Step by step. Even the drills. Especially the drills.', 'The mosquitoes held a meeting about you. They lost.', 'Thirty days is just thirty “good morning” texts from me. Easy.', 'Tired but managing is still managing. I see you.', 'Camp will end. I won’t.', 'Report: the world outside is boring without you. Finish quickly and come back.'];
  var lastLine = -1;
  $('#boost').addEventListener('click', function () { var i; do { i = Math.floor(Math.random() * LINES.length); } while (i === lastLine); lastLine = i; var el = $('#boost-line'); el.textContent = LINES[i]; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; chime('tap'); burst(innerWidth / 2, innerHeight / 2, 16, 6); });
  $('#again').addEventListener('click', function () { location.reload(); });
})();
