/* RésuméKlinik — advanced scroll motion.
   Runs only when GSAP is available and the visitor has not asked for reduced motion.
   Everything still works and reads correctly without it. */
(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function init() {
    /* Smooth scrolling */
    if (window.Lenis) {
      var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, anchors: { offset: -90 } });
      window.__lenis = lenis;
      lenis.on('scroll', ST.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    /* Headline: line-by-line reveal */
    $$('.split').forEach(function (el) {
      gsap.from($$('.ln > span', el), { yPercent: 110, duration: 1, ease: 'power4.out', stagger: .12, delay: .1 });
    });

    /* Parallax: elements with data-speed drift as you scroll */
    $$('[data-speed]').forEach(function (el) {
      var s = parseFloat(el.getAttribute('data-speed'));
      gsap.to(el, { y: function () { return s * 120; }, ease: 'none', scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* Hero: content lifts and fades as you leave it */
    var hero = $('.hero');
    if (hero) {
      gsap.to('.hero-copy', { yPercent: -12, opacity: .2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }

    /* Statement: words light up as you scroll */
    $$('.statement p').forEach(function (p) {
      var words = $$('.w', p);
      ST.create({
        trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true,
        onUpdate: function (self) { var n = Math.round(self.progress * words.length); words.forEach(function (w, i) { w.classList.toggle('on', i < n); }); }
      });
    });

    var mm = gsap.matchMedia();

    /* Services: pinned horizontal scroll on large screens */
    mm.add('(min-width: 1024px)', function () {
      var sec = $('.hs'), track = $('.hs-track');
      if (!sec || !track) return;
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top+=60', end: function () { return '+=' + dist(); }, pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 } });
    });

    /* How it works: sticky screen changes with each step */
    mm.add('(min-width: 1025px)', function () {
      var steps = $$('.story-steps li'), scenes = $$('.scene');
      steps.forEach(function (li, i) {
        ST.create({ trigger: li, start: 'top 60%', end: 'bottom 40%',
          onToggle: function (self) { if (!self.isActive) return; steps.forEach(function (s, k) { s.classList.toggle('on', k === i); }); scenes.forEach(function (s, k) { s.classList.toggle('on', k === i); }); } });
      });
    });

    /* About: timeline fills as you read */
    var tl = $('.timeline');
    if (tl) {
      ST.create({ trigger: tl, start: 'top 70%', end: 'bottom 60%', scrub: true, onUpdate: function (self) { tl.style.setProperty('--h', (self.progress * 100).toFixed(1) + '%'); } });
    }

    /* Founder photo: gentle zoom-out on scroll */
    $$('.ft-photo img, .about-hero .portrait img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    window.addEventListener('load', function () { ST.refresh(); });
  }
  document.readyState !== 'loading' ? init() : document.addEventListener('DOMContentLoaded', init);
})();
