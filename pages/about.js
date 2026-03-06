/* ╔══════════════════════════════════════════════════╗
   ║  NYC PANACHE SALON — ABOUT PAGE JS               ║
   ║  Animations, nav, timeline, counters              ║
   ╚══════════════════════════════════════════════════╝ */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const raf = requestAnimationFrame.bind(window);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = () => window.innerWidth > 1024;
  const mobile = () => window.innerWidth <= 768;

  function throttleRAF(fn) {
    let busy = false;
    return function (...a) {
      if (busy) return;
      busy = true;
      raf(() => { fn.apply(this, a); busy = false; });
    };
  }

  function debounce(fn, ms = 150) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  /* ═══════════════════════════════════
     FLOATING NAV (same as main site)
     ═══════════════════════════════════ */
  function initFloatingNav() {
    const nav = $('#floatNav');
    if (!nav) return;
    let lastY = 0;

    function onScroll() {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 60);
      if (y > 300 && y > lastY + 8) nav.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 100) nav.classList.remove('is-hidden');
      lastY = y;
    }

    window.addEventListener('scroll', throttleRAF(onScroll), { passive: true });
    onScroll();
  }

  /* ═══════════════════════════════════
     MOBILE MENU
     ═══════════════════════════════════ */
  function initMobileMenu() {
    const burger = $('#navBurger');
    const menu = $('#mobMenu');
    const nav = $('#floatNav');
    const closeBtn = $('#mobMenuClose');
    if (!burger || !menu) return;

    const backdrop = $('.mob-menu__backdrop', menu);
    const links = $$('.mob-menu__link', menu);
    let isOpen = false;
    let animating = false;

    function open() {
      if (animating) return;
      isOpen = true; animating = true;
      burger.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      menu.classList.remove('is-closing');
      menu.classList.add('is-open');
      if (nav) nav.classList.add('is-menu-open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => { animating = false; }, 600);
    }

    function close() {
      if (animating) return;
      isOpen = false; animating = true;
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      menu.classList.add('is-closing');
      if (nav) nav.classList.remove('is-menu-open');
      setTimeout(() => {
        menu.classList.remove('is-open', 'is-closing');
        document.body.style.overflow = '';
        animating = false;
      }, 550);
    }

    burger.addEventListener('click', () => isOpen ? close() : open());
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) close(); });
  }

  /* ═══════════════════════════════════
     HERO ENTRANCE
     ═══════════════════════════════════ */
  function initAboutHero() {
    const hero = $('[data-abt-anim="hero"]');
    const scroll = $('[data-abt-anim="scroll"]');

    setTimeout(() => {
      if (hero) hero.classList.add('is-visible');
      if (scroll) scroll.classList.add('is-visible');
    }, 300);

    // Parallax on hero
    const heroSection = $('.abt-hero');
    if (heroSection && !reduced) {
      const bgImg = $('.abt-hero__bg-img');
      window.addEventListener('scroll', throttleRAF(() => {
        const y = window.scrollY;
        const h = heroSection.offsetHeight;
        if (y > h) return;
        const p = y / h;
        if (hero) {
          hero.style.transform = `translateY(${p * 50}px)`;
          hero.style.opacity = String(Math.max(1 - p * 1.4, 0));
        }
      }), { passive: true });
    }

    // Scroll indicator click
    if (scroll) {
      scroll.addEventListener('click', () => {
        const next = heroSection?.nextElementSibling;
        if (next) window.scrollTo({ top: next.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
      });

      let scrollHidden = false;
      window.addEventListener('scroll', throttleRAF(() => {
        if (!scrollHidden && window.scrollY > 100) {
          scroll.style.opacity = '0';
          scroll.style.pointerEvents = 'none';
          scrollHidden = true;
        } else if (scrollHidden && window.scrollY <= 100) {
          scroll.style.opacity = '';
          scroll.style.pointerEvents = '';
          scrollHidden = false;
        }
      }), { passive: true });
    }
  }

  /* ═══════════════════════════════════
     SCROLL REVEALER
     ═══════════════════════════════════ */
  function initScrollRevealer() {
    const els = $$('.reveal');
    if (!els.length) return;
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

  /* ═══════════════════════════════════
     TIMELINE SCROLL FILL
     ═══════════════════════════════════ */
  function initTimelineFill() {
    const fill = $('#timelineFill');
    const timeline = $('.abt-timeline');
    if (!fill || !timeline) return;

    function update() {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalH = timeline.offsetHeight;

      if (rect.top >= vh) {
        fill.style.height = '0%';
      } else if (rect.bottom <= 0) {
        fill.style.height = '100%';
      } else {
        const scrolled = vh - rect.top;
        const pct = Math.min(Math.max((scrolled / (totalH + vh * 0.3)) * 100, 0), 100);
        fill.style.height = pct + '%';
      }
    }

    window.addEventListener('scroll', throttleRAF(update), { passive: true });
    update();
  }

  /* ═══════════════════════════════════
     STAT COUNTERS
     ═══════════════════════════════════ */
  function initCounters() {
    const items = $$('.abt-stats__num[data-target]');
    if (!items.length || reduced) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          const target = parseInt(el.dataset.target, 10);
          const dur = target > 100 ? 2000 : 1500;
          let start = null;

          const step = ts => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            const val = Math.round(ease * target);
            el.textContent = val >= 1000 ? val.toLocaleString() : val;
            if (p < 1) raf(step);
          };
          raf(step);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    items.forEach(el => obs.observe(el));
  }

  /* ═══════════════════════════════════
     CARD TILT (Desktop)
     ═══════════════════════════════════ */
  function initCardTilt() {
    if (!desktop() || reduced) return;
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════
     GOLD TRAIL CURSOR (Desktop)
     ═══════════════════════════════════ */
  function initGoldTrail() {
    if (!desktop() || reduced) return;
    let mx = 0, my = 0, tx = 0, ty = 0;
    const dot = document.createElement('div');
    Object.assign(dot.style, {
      position: 'fixed', width: '8px', height: '8px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(246,226,122,0.45) 0%, transparent 70%)',
      pointerEvents: 'none', zIndex: '9999', opacity: '0',
      mixBlendMode: 'screen', willChange: 'transform', transition: 'opacity 0.3s ease',
    });
    document.body.appendChild(dot);
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.opacity = '1'; }, { passive: true });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; });
    (function loop() {
      tx += (mx - tx) * 0.15;
      ty += (my - ty) * 0.15;
      dot.style.transform = `translate3d(${tx - 4}px, ${ty - 4}px, 0)`;
      raf(loop);
    })();
  }

  /* ═══════════════════════════════════
     BACK TO TOP
     ═══════════════════════════════════ */
  function initBackToTop() {
    const btn = $('#backToTop');
    if (!btn) return;
    window.addEventListener('scroll', throttleRAF(() => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ═══════════════════════════════════
     FOOTER
     ═══════════════════════════════════ */
  function initFooter() {
    const yr = $('#footerYear');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ═══════════════════════════════════
     SMOOTH SCROLL (anchor links)
     ═══════════════════════════════════ */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(a => {
      if (a.closest('.float-nav') || a.closest('.mob-menu')) return;
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = $(href);
        if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - (mobile() ? 80 : 20), behavior: 'smooth' });
      });
    });
  }

  /* ═══════════════════════════════════
     BOOT
     ═══════════════════════════════════ */
  function boot() {
    document.body.classList.add('loaded');

    initFloatingNav();
    initMobileMenu();
    initAboutHero();
    initScrollRevealer();
    initTimelineFill();
    initCounters();
    initCardTilt();
    initSmoothScroll();
    initBackToTop();
    initFooter();
    initGoldTrail();

    console.log('%c✦ NYC Panache Salon — About Page Ready', 'color:#CB9B51;font-size:13px;font-weight:bold;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
