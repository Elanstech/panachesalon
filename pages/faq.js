/* ╔══════════════════════════════════════════════════════╗
   ║  NYC PANACHE — FAQ PAGE JS                           ║
   ╚══════════════════════════════════════════════════════╝ */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const raf = requestAnimationFrame.bind(window);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function throttleRAF(fn) {
    let busy = false;
    return function (...a) {
      if (busy) return; busy = true;
      raf(() => { fn.apply(this, a); busy = false; });
    };
  }

  /* ── NAV ── */
  function initNav() {
    const nav = $('#floatNav'); if (!nav) return;
    window.addEventListener('scroll', throttleRAF(() => {
      nav.classList.toggle('is-scrolled', window.scrollY > 60);
    }), { passive: true });
  }

  /* ── MOBILE MENU ── */
  function initMobileMenu() {
    const burger = $('#navBurger'), menu = $('#mobMenu'),
          nav = $('#floatNav'), closeBtn = $('#mobMenuClose');
    if (!burger || !menu) return;
    const backdrop = $('.mob-menu__backdrop', menu);
    let open = false, anim = false;
    function doOpen() {
      if (anim || open) return; open = true; anim = true;
      burger.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      menu.classList.remove('is-closing'); menu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (nav) nav.classList.add('is-menu-open');
      setTimeout(() => { anim = false; }, 600);
    }
    function doClose() {
      if (anim || !open) return; open = false; anim = true;
      burger.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true'); menu.classList.add('is-closing');
      setTimeout(() => { menu.classList.remove('is-open', 'is-closing'); document.body.style.overflow = ''; if (nav) nav.classList.remove('is-menu-open'); anim = false; }, 550);
    }
    burger.addEventListener('click', e => { e.stopPropagation(); open ? doClose() : doOpen(); });
    if (closeBtn) closeBtn.addEventListener('click', doClose);
    if (backdrop) backdrop.addEventListener('click', doClose);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) doClose(); });
    $$('.mob-menu__link', menu).forEach(l => l.addEventListener('click', doClose));
  }

  /* ── SCROLL REVEAL ── */
  function initReveal() {
    const els = $$('.reveal');
    if (!els.length) return;
    if (reduced) { els.forEach(el => el.classList.add('visible')); return; }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const siblings = $$('.reveal', e.target.parentElement);
          const idx = siblings.indexOf(e.target);
          setTimeout(() => e.target.classList.add('visible'), idx * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  }

  /* ── FAQ ACCORDION ── */
  function initFAQ() {
    const items = $$('[data-faq]');
    if (!items.length) return;

    items.forEach(item => {
      const btn = $('.fq-item__q', item);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close all in the same section
        const section = item.closest('.fq-section');
        if (section) {
          $$('[data-faq]', section).forEach(i => {
            i.classList.remove('is-open');
            const q = $('.fq-item__q', i);
            if (q) q.setAttribute('aria-expanded', 'false');
          });
        }

        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ── CATEGORY JUMP LINKS — smooth scroll + active highlight ── */
  function initJumps() {
    const jumps = $$('.fq-jump');
    const sections = $$('.fq-section');
    const bar = $('.fq-jumps');
    if (!jumps.length || !sections.length) return;

    // Smooth scroll on click
    jumps.forEach(j => {
      j.addEventListener('click', e => {
        e.preventDefault();
        const id = j.getAttribute('href');
        const target = $(id);
        if (!target) return;
        const barH = bar ? bar.offsetHeight : 0;
        const y = target.getBoundingClientRect().top + window.scrollY - barH - 20;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });

    // Active on scroll (intersection observer)
    const barH = bar ? bar.offsetHeight + 30 : 100;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          jumps.forEach(j => {
            j.classList.toggle('is-active', j.dataset.jump === id);
          });
        }
      });
    }, {
      rootMargin: `-${barH}px 0px -60% 0px`,
      threshold: 0
    });
    sections.forEach(s => obs.observe(s));

    // Sticky shadow
    if (bar) {
      window.addEventListener('scroll', throttleRAF(() => {
        bar.classList.toggle('is-stuck', window.scrollY > 300);
      }), { passive: true });
    }
  }

  /* ── OPEN FAQ FROM URL HASH ── */
  function initHashOpen() {
    const hash = window.location.hash;
    if (!hash) return;
    const target = $(hash);
    if (target && target.classList.contains('fq-section')) {
      // Scroll to the section after a brief delay
      setTimeout(() => {
        const bar = $('.fq-jumps');
        const barH = bar ? bar.offsetHeight : 0;
        const y = target.getBoundingClientRect().top + window.scrollY - barH - 20;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 400);
    }
  }

  /* ── BACK TO TOP ── */
  function initBTT() {
    const btn = $('#backToTop'); if (!btn) return;
    window.addEventListener('scroll', throttleRAF(() => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── FOOTER YEAR ── */
  function initFooter() {
    const yr = $('#footerYear');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ── BOOT ── */
  function boot() {
    document.body.classList.add('loaded');
    initNav();
    initMobileMenu();
    initReveal();
    initFAQ();
    initJumps();
    initHashOpen();
    initBTT();
    initFooter();
    console.log('%c✦ FAQ — NYC Panache', 'color:#CB9B51;font-size:13px;font-weight:bold;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
