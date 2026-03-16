
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
  function debounce(fn, ms = 150) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  /* ── NAV ─────────────────────────────────────────────── */
  function initNav() {
    const nav = $('#floatNav'); if (!nav) return;
    window.addEventListener('scroll', throttleRAF(() => {
      nav.classList.toggle('is-scrolled', window.scrollY > 60);
    }), { passive: true });
  }

  /* ── MOBILE MENU ─────────────────────────────────────── */
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

  /* ── SCROLL REVEAL ───────────────────────────────────── */
  function initReveal() {
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

  /* ── GALLERY TILE REVEAL ────────────────────────────── */
  function initTileReveal() {
    const tiles = $$('[data-grev]');
    if (!tiles.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = tiles.indexOf(e.target);
          setTimeout(() => e.target.classList.add('is-revealed'), (idx % 3) * 100);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -50px 0px' });
    tiles.forEach(t => obs.observe(t));
  }

  /* ── STATS COUNTER ───────────────────────────────────── */
  function initCounters() {
    const nums = $$('[data-count]');
    if (!nums.length || reduced) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count, dur = 1600;
        let start = null;
        const step = ts => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(ease * target);
          if (p < 1) raf(step);
        };
        raf(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(n => obs.observe(n));
  }

  /* ── BEFORE & AFTER SLIDERS ─────────────────────────── */
  function initBA() {
    $$('[data-ba]').forEach((card, ci) => {
      const frame = $('.gp-ba-card__slider', card);
      const after = $('.gp-ba-card__after', card);
      const handle = $('.gp-ba-card__handle', card);
      if (!frame || !after || !handle) return;

      let dragging = false;
      const setPos = pct => {
        const v = Math.max(2, Math.min(98, pct));
        after.style.clipPath = `inset(0 0 0 ${v}%)`;
        handle.style.left = `${v}%`;
      };
      const getPct = cx => {
        const r = frame.getBoundingClientRect();
        return ((cx - r.left) / r.width) * 100;
      };

      frame.addEventListener('mousedown', e => { e.preventDefault(); dragging = true; setPos(getPct(e.clientX)); });
      window.addEventListener('mousemove', e => { if (dragging) raf(() => setPos(getPct(e.clientX))); });
      window.addEventListener('mouseup', () => { dragging = false; });
      frame.addEventListener('touchstart', e => { dragging = true; setPos(getPct(e.touches[0].clientX)); }, { passive: true });
      frame.addEventListener('touchmove', e => { if (!dragging) return; e.preventDefault(); raf(() => setPos(getPct(e.touches[0].clientX))); }, { passive: false });
      frame.addEventListener('touchend', () => { dragging = false; });
      frame.addEventListener('click', e => { if (!dragging) setPos(getPct(e.clientX)); });

      // Animate in when visible
      new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setTimeout(() => {
              if (reduced) { setPos(50); return; }
              let start = null;
              const from = 25, to = 50, dur = 1000;
              const anim = ts => {
                if (!start) start = ts;
                const p = Math.min((ts - start) / dur, 1);
                setPos(from + (to - from) * (1 - Math.pow(1 - p, 3)));
                if (p < 1) raf(anim);
              };
              raf(anim);
            }, 300 + ci * 180);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.25 }).observe(frame);
    });
  }

  /* ── GALLERY FILTER ──────────────────────────────────── */
  function initFilter() {
    const filters = $$('.gp-filt');
    const tiles = $$('.gp-tile');
    if (!filters.length || !tiles.length) return;
    let active = 'all';

    filters.forEach(f => f.addEventListener('click', () => {
      const cat = f.dataset.filter;
      if (cat === active) return;
      active = cat;
      filters.forEach(b => b.classList.toggle('is-active', b === f));

      let delay = 0;
      tiles.forEach(tile => {
        const show = cat === 'all' || tile.dataset.cat === cat;
        if (!show) {
          tile.classList.add('is-hidden');
        } else {
          tile.classList.remove('is-hidden');
          tile.style.opacity = '0';
          tile.style.transform = 'translateY(24px) scale(.97)';
          setTimeout(() => {
            tile.style.transition = 'opacity .5s var(--ease-out), transform .5s var(--ease-out)';
            tile.style.opacity = '1';
            tile.style.transform = 'translateY(0) scale(1)';
          }, 30 + delay);
          delay += 55;
        }
      });
    }));
  }

  /* ── LIGHTBOX ────────────────────────────────────────── */
  function initLightbox() {
    const lb = $('#gpLightbox'); if (!lb) return;
    const img   = $('.gp-lb__img', lb);
    const title = $('.gp-lb__title', lb);
    const desc  = $('.gp-lb__desc', lb);
    const close = $('.gp-lb__close', lb);
    const back  = $('.gp-lb__backdrop', lb);

    function open(tile) {
      const src = $('.gp-tile__img', tile);
      if (src && img) img.src = src.src;
      if (title) title.textContent = tile.dataset.title || '';
      if (desc) desc.textContent = tile.dataset.desc || '';
      lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeBox() {
      lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Trigger from zoom button only (not whole tile)
    $$('.gp-tile__zoom').forEach((btn, i) => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        open($$('.gp-tile')[i]);
      });
    });

    if (close) close.addEventListener('click', closeBox);
    if (back)  back.addEventListener('click', closeBox);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBox(); });
  }

  /* ── BACK TO TOP ─────────────────────────────────────── */
  function initBTT() {
    const btn = $('#backToTop'); if (!btn) return;
    window.addEventListener('scroll', throttleRAF(() => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── FOOTER YEAR ─────────────────────────────────────── */
  function initFooter() {
    const yr = $('#footerYear');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ── SPOTLIGHT TILT (desktop) ────────────────────────── */
  function initTilt() {
    if (window.innerWidth <= 1024 || reduced) return;
    $$('.gp-spot__media').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ── BOOT ────────────────────────────────────────────── */
  function boot() {
    document.body.classList.add('loaded');
    initNav();
    initMobileMenu();
    initReveal();
    initTileReveal();
    initBA();
    initFilter();
    initLightbox();
    initBTT();
    initFooter();
    initTilt();
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => initCounters(), { timeout: 2000 });
    } else {
      setTimeout(initCounters, 1500);
    }
    console.log('%c✦ Gallery — NYC Panache', 'color:#CB9B51;font-size:13px;font-weight:bold;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
