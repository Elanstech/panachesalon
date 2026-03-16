/* ╔══════════════════════════════════════════════════════╗
   ║  NYC PANACHE — CONTACT PAGE JS                       ║
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

  /* ── NAV ─────────────────────────────────────────── */
  function initNav() {
    const nav = $('#floatNav'); if (!nav) return;
    window.addEventListener('scroll', throttleRAF(() => {
      nav.classList.toggle('is-scrolled', window.scrollY > 60);
    }), { passive: true });
  }

  /* ── MOBILE MENU ─────────────────────────────────── */
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
      menu.setAttribute('aria-hidden', 'true');
      menu.classList.add('is-closing');
      setTimeout(() => {
        menu.classList.remove('is-open', 'is-closing');
        document.body.style.overflow = '';
        if (nav) nav.classList.remove('is-menu-open');
        anim = false;
      }, 550);
    }

    burger.addEventListener('click', e => { e.stopPropagation(); open ? doClose() : doOpen(); });
    if (closeBtn) closeBtn.addEventListener('click', doClose);
    if (backdrop) backdrop.addEventListener('click', doClose);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) doClose(); });
    $$('.mob-menu__link', menu).forEach(l => l.addEventListener('click', doClose));
  }

  /* ── SCROLL REVEAL ───────────────────────────────── */
  function initReveal() {
    const els = $$('.reveal');
    if (!els.length) return;
    if (reduced) { els.forEach(el => el.classList.add('visible')); return; }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const siblings = $$('.reveal', e.target.parentElement);
          const idx = siblings.indexOf(e.target);
          setTimeout(() => e.target.classList.add('visible'), idx * 100);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  }

  /* ── ACTIVE HOURS INDICATOR ──────────────────────── */
  function initActiveHours() {
    const now = new Date();
    const day = now.getDay();   // 0=Sun
    const hour = now.getHours();

    const tueSat = $('#cpTueSat');
    const sun = $('#cpSun');

    // Green dot helper
    function addDot(el) {
      if (!el) return;
      el.insertAdjacentHTML('beforeend',
        ' <span style="display:inline-block;width:7px;height:7px;border-radius:50%;' +
        'background:#4CAF50;margin-left:6px;vertical-align:middle;' +
        'box-shadow:0 0 6px rgba(76,175,80,.5);' +
        'animation:heroDotPulse 2s ease-in-out infinite"></span>');
    }

    // Tue (2) – Sat (6): 10–19
    if (day >= 2 && day <= 6 && hour >= 10 && hour < 19) {
      addDot(tueSat);
    }
    // Sun (0): 10–17
    if (day === 0 && hour >= 10 && hour < 17) {
      addDot(sun);
    }

    // Bold current day row
    $$('.cp-hours__row').forEach(row => {
      const dayEl = $('.cp-hours__day', row);
      if (!dayEl) return;
      const txt = dayEl.textContent;
      let isToday = false;
      if (txt.includes('Mon') && day === 1) isToday = true;
      else if (txt.includes('Tue') && day >= 2 && day <= 6) isToday = true;
      else if (txt.includes('Sun') && day === 0) isToday = true;
      if (isToday) row.style.fontWeight = '600';
    });
  }

  /* ── INFO CARD TILT (desktop) ────────────────────── */
  function initTilt() {
    if (window.innerWidth <= 1024 || reduced) return;
    $$('.cp-info-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform .5s var(--ease-out)';
        card.style.transform = '';
        setTimeout(() => card.style.transition = '', 500);
      });
    });
  }

  /* ── BACK TO TOP ─────────────────────────────────── */
  function initBTT() {
    const btn = $('#backToTop'); if (!btn) return;
    window.addEventListener('scroll', throttleRAF(() => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── FOOTER YEAR ─────────────────────────────────── */
  function initFooter() {
    const yr = $('#footerYear');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ── BOOT ────────────────────────────────────────── */
  function boot() {
    document.body.classList.add('loaded');
    initNav();
    initMobileMenu();
    initReveal();
    initActiveHours();
    initTilt();
    initBTT();
    initFooter();
    console.log('%c✦ Contact — NYC Panache', 'color:#CB9B51;font-size:13px;font-weight:bold;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
