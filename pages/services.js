/* ╔══════════════════════════════════════════════════╗
   ║  NYC PANACHE — SERVICES PAGE JS                  ║
   ║  NO parallax opacity — mobile scroll safe        ║
   ║  Extends script.js (nav, reveal, footer, etc.)   ║
   ╚══════════════════════════════════════════════════╝ */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const raf = requestAnimationFrame.bind(window);
  const desktop = () => window.innerWidth > 1024;

  function throttleRAF(fn) {
    let busy = false;
    return function (...a) {
      if (busy) return;
      busy = true;
      raf(() => { fn.apply(this, a); busy = false; });
    };
  }

  /* ═══════════════════════════════════
     HERO VIDEO — Force loop + play
     ═══════════════════════════════════ */
  function initHeroVideo() {
    const video = $('.svc-hero__video');
    if (!video) return;

    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });

    video.play().catch(() => {});

    // Pause when off-screen, play when visible
    const hero = $('.svc-hero');
    if (hero) {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      }, { threshold: 0.05 }).observe(hero);
    }
  }

  /* ═══════════════════════════════════
     HERO PARALLAX — Desktop only, NO opacity changes
     Only moves the video slightly — never blocks scroll
     ═══════════════════════════════════ */
  function initHeroParallax() {
    if (!desktop()) return;
    const hero = $('.svc-hero');
    const video = $('.svc-hero__video');
    if (!hero || !video) return;

    let heroH = hero.offsetHeight;

    window.addEventListener('scroll', throttleRAF(() => {
      const y = window.scrollY;
      if (y > heroH) return;
      const p = y / heroH;
      // Only scale the video — never touch opacity or pointer-events
      video.style.transform = `scale(${1 + p * 0.08})`;
    }), { passive: true });

    window.addEventListener('resize', () => { heroH = hero.offsetHeight; });
  }

  /* ═══════════════════════════════════
     STICKY CATEGORY NAV — Scroll spy
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

    function onScroll() {
      const y = window.scrollY;
      const hero = $('.svc-hero');
      if (hero) nav.classList.toggle('is-scrolled', y > hero.offsetHeight - 100);

      const offset = nav.offsetHeight + 80;
      let active = null;
      for (const { el, link } of sections) {
        const top = el.offsetTop - offset;
        if (y >= top && y < top + el.offsetHeight) active = link;
      }

      links.forEach(l => l.classList.toggle('is-active', l === active));

      // Scroll active into view on mobile
      if (active && window.innerWidth <= 768) {
        active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    window.addEventListener('scroll', throttleRAF(onScroll), { passive: true });

    // Smooth scroll click
    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = $(link.getAttribute('href'));
        if (target) {
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 20,
            behavior: 'smooth'
          });
        }
      });
    });

    // Hero "Explore Menu" button
    const heroBtn = $('.svc-hero__btn--primary');
    if (heroBtn) {
      heroBtn.addEventListener('click', e => {
        e.preventDefault();
        const target = $(heroBtn.getAttribute('href'));
        if (target) {
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 20,
            behavior: 'smooth'
          });
        }
      });
    }

    onScroll();
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
          const grid = e.target.closest('.svc-grid');
          if (grid) {
            const siblings = $$('.svc-card.reveal', grid);
            const idx = siblings.indexOf(e.target);
            setTimeout(() => e.target.classList.add('visible'), idx * 50);
          } else {
            e.target.classList.add('visible');
          }
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -20px 0px' });

    cards.forEach(c => obs.observe(c));
  }

  /* ═══════════════════════════════════
     CARD TILT — Desktop only
     ═══════════════════════════════════ */
  function initCardTilt() {
    if (!desktop()) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    $$('.svc-card__inner').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ═══════════════════════════════════
     SCROLL PROGRESS BAR
     ═══════════════════════════════════ */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'svc-progress';
    document.body.appendChild(bar);

    window.addEventListener('scroll', throttleRAF(() => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = h > 0 ? `${(window.scrollY / h) * 100}%` : '0%';
    }), { passive: true });
  }

  /* ═══════════════════════════════════
     HASH SCROLL ON LOAD
     ═══════════════════════════════════ */
  function initHashScroll() {
    const hash = window.location.hash;
    if (!hash) return;
    const target = $(hash);
    if (!target) return;

    // Wait for layout then scroll
    setTimeout(() => {
      const nav = $('#catNav');
      const offset = nav ? nav.offsetHeight + 20 : 100;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    }, 600);
  }

  /* ═══════════════════════════════════
     BOOT
     ═══════════════════════════════════ */
  function boot() {
    document.body.classList.add('loaded');

    initHeroVideo();
    initHeroParallax();
    initCatNav();
    initCardReveal();
    initCardTilt();
    initScrollProgress();
    initHashScroll();

    console.log('%c✦ NYC Panache — Services Page Ready', 'color:#CB9B51;font-size:13px;font-weight:bold;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
