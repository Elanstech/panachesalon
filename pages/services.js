/* ╔══════════════════════════════════════════════════╗
   ║  NYC PANACHE — SERVICES PAGE JS                  ║
   ║  Extends script.js (nav, reveal, footer, etc.)   ║
   ╚══════════════════════════════════════════════════╝ */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function throttleRAF(fn) {
    let busy = false;
    return function (...a) {
      if (busy) return;
      busy = true;
      requestAnimationFrame(() => { fn.apply(this, a); busy = false; });
    };
  }

  /* ═══════════════════════════════════
     STICKY CATEGORY NAV — Active tracking
     ═══════════════════════════════════ */
  function initCatNav() {
    const nav = $('#catNav');
    if (!nav) return;

    const links = $$('.cat-nav__link', nav);
    const sections = [];

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const sec = $(href);
        if (sec) sections.push({ el: sec, link });
      }
    });

    // Scroll spy
    function onScroll() {
      const y = window.scrollY;
      const offset = 160; // nav + cat-nav height

      // Add shadow when scrolled
      const hero = $('.svc-hero');
      if (hero) {
        nav.classList.toggle('is-scrolled', y > hero.offsetHeight - 100);
      }

      // Active section tracking
      let active = null;
      for (const { el, link } of sections) {
        const top = el.offsetTop - offset;
        const bottom = top + el.offsetHeight;
        if (y >= top && y < bottom) {
          active = link;
        }
      }

      links.forEach(l => l.classList.toggle('is-active', l === active));

      // Scroll active link into view on mobile
      if (active && window.innerWidth <= 768) {
        active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    window.addEventListener('scroll', throttleRAF(onScroll), { passive: true });

    // Smooth scroll on click
    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const target = $(href);
        if (target) {
          const offset = nav.offsetHeight + 20;
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - offset,
            behavior: 'smooth'
          });
        }
      });
    });

    onScroll();
  }

  /* ═══════════════════════════════════
     HERO PARALLAX (subtle)
     ═══════════════════════════════════ */
  function initHeroParallax() {
    const hero = $('.svc-hero');
    const img = $('.svc-hero__img');
    const content = $('.svc-hero__content');
    if (!hero || !img) return;

    const heroH = hero.offsetHeight;

    window.addEventListener('scroll', throttleRAF(() => {
      const y = window.scrollY;
      if (y > heroH) return;
      const p = y / heroH;
      if (content) {
        content.style.transform = `translate3d(0, -${p * 40}px, 0)`;
        content.style.opacity = String(Math.max(1 - p * 1.8, 0));
      }
    }), { passive: true });
  }

  /* ═══════════════════════════════════
     STAGGERED CARD REVEAL
     ═══════════════════════════════════ */
  function initCardReveal() {
    const cards = $$('.svc-card.reveal');
    if (!cards.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // Find siblings in same grid
          const grid = e.target.closest('.svc-grid');
          if (grid) {
            const siblings = $$('.svc-card.reveal', grid);
            const idx = siblings.indexOf(e.target);
            setTimeout(() => {
              e.target.classList.add('visible');
            }, idx * 60);
          } else {
            e.target.classList.add('visible');
          }
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

    cards.forEach(c => obs.observe(c));
  }

  /* ═══════════════════════════════════
     CARD HOVER TILT (Desktop)
     ═══════════════════════════════════ */
  function initCardTilt() {
    if (window.innerWidth <= 1024) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    $$('.svc-card__inner').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════
     SCROLL PROGRESS BAR (top of page)
     ═══════════════════════════════════ */
  function initScrollProgress() {
    const bar = document.createElement('div');
    Object.assign(bar.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      height: '3px',
      width: '0%',
      background: 'linear-gradient(90deg, #8B6914, #F6E27A, #CB9B51)',
      zIndex: '999999',
      transition: 'width 0.1s ease-out',
      borderRadius: '0 2px 2px 0',
      boxShadow: '0 0 10px rgba(203,155,81,.3)',
      pointerEvents: 'none'
    });
    document.body.appendChild(bar);

    window.addEventListener('scroll', throttleRAF(() => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = `${pct}%`;
    }), { passive: true });
  }

  /* ═══════════════════════════════════
     BOOT
     ═══════════════════════════════════ */
  function boot() {
    // Mark loaded for shared styles
    document.body.classList.add('loaded');

    initCatNav();
    initHeroParallax();
    initCardReveal();
    initCardTilt();
    initScrollProgress();

    console.log('%c✦ NYC Panache — Services Page Ready', 'color:#CB9B51;font-size:13px;font-weight:bold;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
