/* ╔══════════════════════════════════════════════════════╗
   ║  NYC PANACHE — GALLERY JS (Redesigned)               ║
   ║  Smooth interactions, filter indicator, lightbox nav  ║
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
  function debounce(fn, ms = 150) {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
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
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const siblings = $$('.reveal', e.target.parentElement);
          const idx = siblings.indexOf(e.target);
          setTimeout(() => e.target.classList.add('visible'), idx * 90);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  }

  /* ── GALLERY TILE REVEAL ────────────────────────── */
  function initTileReveal() {
    const tiles = $$('[data-grev]');
    if (!tiles.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const visible = tiles.filter(t => !t.classList.contains('is-hidden'));
          const idx = visible.indexOf(e.target);
          setTimeout(() => e.target.classList.add('is-revealed'), Math.max(0, idx % 3) * 120);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -50px 0px' });
    tiles.forEach(t => obs.observe(t));
  }

  /* ── STATS COUNTER ───────────────────────────────── */
  function initCounters() {
    const nums = $$('[data-count]');
    if (!nums.length || reduced) { nums.forEach(n => n.textContent = n.dataset.count); return; }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count, dur = 1800;
        let start = null;
        const step = ts => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(ease * target);
          if (p < 1) raf(step);
        };
        raf(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(n => obs.observe(n));
  }

  /* ── BEFORE & AFTER SLIDERS ─────────────────────── */
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

      new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setTimeout(() => {
              if (reduced) { setPos(50); return; }
              let start = null;
              const from = 20, to = 50, dur = 1200;
              const anim = ts => {
                if (!start) start = ts;
                const p = Math.min((ts - start) / dur, 1);
                setPos(from + (to - from) * (1 - Math.pow(1 - p, 4)));
                if (p < 1) raf(anim);
              };
              raf(anim);
            }, 350 + ci * 200);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.2 }).observe(frame);
    });
  }

  /* ── GALLERY FILTER (with sliding indicator) ─────── */
  function initFilter() {
    const filters = $$('.gp-filt');
    const tiles = $$('.gp-tile');
    const indicator = $('.gp-filt__indicator');
    if (!filters.length || !tiles.length) return;
    let active = 'all';

    function moveIndicator(btn) {
      if (!indicator || !btn) return;
      const parent = indicator.parentElement;
      const pr = parent.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      indicator.style.left = `${br.left - pr.left}px`;
      indicator.style.width = `${br.width}px`;
    }

    // Initial position
    const firstActive = filters.find(f => f.classList.contains('is-active'));
    if (firstActive) requestAnimationFrame(() => moveIndicator(firstActive));

    filters.forEach(f => f.addEventListener('click', () => {
      const cat = f.dataset.filter;
      if (cat === active) return;
      active = cat;
      filters.forEach(b => b.classList.toggle('is-active', b === f));
      moveIndicator(f);

      let delay = 0;
      tiles.forEach(tile => {
        const show = cat === 'all' || tile.dataset.cat === cat;
        if (!show) {
          tile.style.transition = 'opacity .3s ease, transform .3s ease';
          tile.style.opacity = '0';
          tile.style.transform = 'scale(.94)';
          setTimeout(() => tile.classList.add('is-hidden'), 300);
        } else {
          tile.classList.remove('is-hidden');
          tile.style.opacity = '0';
          tile.style.transform = 'translateY(28px) scale(.97)';
          setTimeout(() => {
            tile.style.transition = 'opacity .6s var(--ease-out), transform .6s var(--ease-out)';
            tile.style.opacity = '1';
            tile.style.transform = 'translateY(0) scale(1)';
          }, 40 + delay);
          delay += 60;
        }
      });
    }));

    window.addEventListener('resize', debounce(() => {
      const cur = filters.find(f => f.classList.contains('is-active'));
      if (cur) moveIndicator(cur);
    }));
  }

  /* ── LIGHTBOX (with prev/next navigation) ────────── */
  function initLightbox() {
    const lb = $('#gpLightbox'); if (!lb) return;
    const img   = $('.gp-lb__img', lb);
    const title = $('.gp-lb__title', lb);
    const desc  = $('.gp-lb__desc', lb);
    const close = $('.gp-lb__close', lb);
    const back  = $('.gp-lb__backdrop', lb);
    const prev  = $('.gp-lb__prev', lb);
    const next  = $('.gp-lb__next', lb);

    let currentIdx = -1;

    function getVisibleTiles() {
      return $$('.gp-tile').filter(t => !t.classList.contains('is-hidden'));
    }

    function showTile(idx) {
      const visible = getVisibleTiles();
      if (idx < 0 || idx >= visible.length) return;
      currentIdx = idx;
      const tile = visible[idx];
      const src = $('.gp-tile__img', tile);
      if (src && img) {
        img.style.opacity = '0';
        img.style.transform = 'scale(.96)';
        setTimeout(() => {
          img.src = src.src;
          img.style.transition = 'opacity .35s ease, transform .35s ease';
          img.style.opacity = '1';
          img.style.transform = 'scale(1)';
        }, 150);
      }
      if (title) title.textContent = tile.dataset.title || '';
      if (desc) desc.textContent = tile.dataset.desc || '';
    }

    function open(tile) {
      const visible = getVisibleTiles();
      currentIdx = visible.indexOf(tile);
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
      currentIdx = -1;
    }

    function goPrev() {
      const visible = getVisibleTiles();
      if (currentIdx > 0) showTile(currentIdx - 1);
      else showTile(visible.length - 1);
    }
    function goNext() {
      const visible = getVisibleTiles();
      if (currentIdx < visible.length - 1) showTile(currentIdx + 1);
      else showTile(0);
    }

    $$('.gp-tile__zoom').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const tile = btn.closest('.gp-tile');
        if (tile) open(tile);
      });
    });

    $$('.gp-tile').forEach(tile => {
      tile.addEventListener('click', e => {
        if (e.target.closest('.gp-tile__zoom')) return;
        open(tile);
      });
    });

    if (close) close.addEventListener('click', closeBox);
    if (back) back.addEventListener('click', closeBox);
    if (prev) prev.addEventListener('click', goPrev);
    if (next) next.addEventListener('click', goNext);

    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeBox();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    });
  }

  /* ── HERO PARTICLES ──────────────────────────────── */
  function initParticles() {
    if (reduced) return;
    const container = $('#heroParticles');
    if (!container) return;

    function spawn() {
      const p = document.createElement('div');
      const size = Math.random() * 4 + 2;
      const x = Math.random() * 100;
      const dur = Math.random() * 8 + 6;
      Object.assign(p.style, {
        position: 'absolute',
        bottom: '-10px',
        left: `${x}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: `rgba(203, 155, 81, ${Math.random() * 0.25 + 0.05})`,
        animation: `gpParticle ${dur}s ease-out forwards`,
        pointerEvents: 'none',
      });
      container.appendChild(p);
      setTimeout(() => p.remove(), dur * 1000);
    }

    setInterval(spawn, 600);
    // Initial burst
    for (let i = 0; i < 6; i++) setTimeout(spawn, i * 200);
  }

  /* ── SPOTLIGHT TILT (desktop) ────────────────────── */
  function initTilt() {
    if (window.innerWidth <= 1024 || reduced) return;
    $$('.gp-spot__media').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform .6s var(--ease-out)';
        card.style.transform = '';
        setTimeout(() => card.style.transition = '', 600);
      });
    });
  }

  /* ── PARALLAX STATS ──────────────────────────────── */
  function initStatsParallax() {
    if (reduced) return;
    const stats = $$('[data-stat]');
    if (!stats.length) return;

    window.addEventListener('scroll', throttleRAF(() => {
      stats.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const viewCenter = window.innerHeight / 2;
        const dist = (center - viewCenter) / window.innerHeight;
        const offset = dist * 12 * (i % 2 === 0 ? 1 : -1);
        s.style.transform = `translateY(${offset}px)`;
      });
    }), { passive: true });
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
    initTileReveal();
    initBA();
    initFilter();
    initLightbox();
    initParticles();
    initTilt();
    initStatsParallax();
    initBTT();
    initFooter();

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => initCounters(), { timeout: 2000 });
    } else {
      setTimeout(initCounters, 1500);
    }

    console.log('%c✦ Gallery — NYC Panache (Redesigned)', 'color:#CB9B51;font-size:13px;font-weight:bold;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
