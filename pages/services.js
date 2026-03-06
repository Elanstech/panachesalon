/* ╔══════════════════════════════════════════════════╗
   ║  NYC PANACHE SALON — SERVICES PAGE JS v2         ║
   ║  Cinematic · Apple-level · Warm & Inviting       ║
   ║  Requires: ../script.js (root) loaded first      ║
   ╚══════════════════════════════════════════════════╝ */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const raf = requestAnimationFrame.bind(window);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
     HERO — Cinematic Entrance Animation
     ═══════════════════════════════════ */
  function initHeroEntrance() {
    const hero = $('#spHero');
    if (!hero) return;

    const show = (sel, delay) => {
      const el = $(`[data-sp-anim="${sel}"]`, hero);
      if (el) setTimeout(() => el.classList.add('is-visible'), delay);
    };

    // Staggered reveal sequence
    setTimeout(() => {
      show('pill', 200);
      show('eyebrow', 500);

      // Word-by-word reveal
      $$('[data-sp-anim="word"]', hero).forEach(w => {
        const d = parseInt(w.dataset.delay || 0, 10);
        setTimeout(() => w.classList.add('is-visible'), 700 + d * 180);
      });

      show('sub', 1400);
      show('rule', 1800);
      show('ctas', 2100);
      show('scroll', 2400);

      // Stats stagger
      $$('[data-sp-anim="stat"]', hero).forEach(s => {
        const d = parseInt(s.dataset.delay || 0, 10);
        setTimeout(() => s.classList.add('is-visible'), 2600 + d * 150);
      });
    }, 300);
  }

  /* ═══════════════════════════════════
     HERO — Multi-layer Parallax
     ═══════════════════════════════════ */
  function initHeroParallax() {
    const hero = $('#spHero');
    const parallax = $('#spHeroParallax');
    const content = $('#spHeroContent');
    if (!hero || !parallax) return;

    let heroH = hero.offsetHeight;

    function onScroll() {
      const y = window.scrollY;
      if (y > heroH * 1.2) return;

      const p = y / heroH;

      // Image moves slower (parallax)
      parallax.style.transform = `translate3d(0, ${y * 0.35}px, 0) scale(${1 + p * 0.04})`;

      // Content moves faster + fades
      if (content) {
        content.style.transform = `translate3d(0, ${y * -0.15}px, 0)`;
        content.style.opacity = String(Math.max(1 - p * 1.6, 0));
      }
    }

    window.addEventListener('scroll', throttleRAF(onScroll), { passive: true });
    window.addEventListener('resize', () => { heroH = hero.offsetHeight; });
  }

  /* ═══════════════════════════════════
     HERO — Scroll Indicator Click
     ═══════════════════════════════════ */
  function initHeroScroll() {
    const scroll = $('.sp-hero__scroll');
    if (!scroll) return;

    scroll.addEventListener('click', () => {
      const target = $('.sp-marquee') || $('.sp-catnav');
      if (target) window.scrollTo({ top: target.offsetTop - 20, behavior: 'smooth' });
    });

    // Fade scroll indicator on scroll
    let hidden = false;
    window.addEventListener('scroll', throttleRAF(() => {
      const y = window.scrollY;
      if (!hidden && y > 100) {
        scroll.style.opacity = '0';
        scroll.style.pointerEvents = 'none';
        hidden = true;
      } else if (hidden && y <= 100) {
        scroll.style.opacity = '1';
        scroll.style.pointerEvents = 'auto';
        hidden = false;
      }
    }), { passive: true });
  }

  /* ═══════════════════════════════════
     HERO — Magnetic Buttons (Desktop)
     ═══════════════════════════════════ */
  function initHeroMagnetic() {
    if (!desktop() || reduced) return;
    $$('.sp-hero__btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.1;
        const y = (e.clientY - r.top - r.height / 2) * 0.12;
        btn.style.transform = `translate3d(${x}px, ${y}px, 0) translateY(-3px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════
     HERO — Smooth anchor for "Explore Services"
     ═══════════════════════════════════ */
  function initHeroCTA() {
    $$('.sp-hero__btn[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = $(a.getAttribute('href'));
        if (target) window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
      });
    });
  }

  /* ═══════════════════════════════════
     STICKY CATEGORY NAV — Active Spy
     ═══════════════════════════════════ */
  function initCatNav() {
    const nav = $('#spCatnav');
    if (!nav) return;
    const links = $$('.sp-catnav__link', nav);
    const sections = [];

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const sec = $(href);
        if (sec) sections.push({ el: sec, link });
      }
    });

    function onScroll() {
      const y = window.scrollY + 130;
      let active = null;
      for (const { el, link } of sections) {
        if (y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) active = link;
      }
      links.forEach(l => l.classList.toggle('is-active', l === active));

      if (active && nav) {
        const inner = $('.sp-catnav__inner', nav);
        if (inner) {
          const lr = active.getBoundingClientRect();
          const ir = inner.getBoundingClientRect();
          if (lr.left < ir.left || lr.right > ir.right) {
            active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }
      }
    }

    window.addEventListener('scroll', throttleRAF(onScroll), { passive: true });

    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = $(link.getAttribute('href'));
        if (target) window.scrollTo({ top: target.offsetTop - 65, behavior: 'smooth' });
      });
    });

    onScroll();
  }

  /* ═══════════════════════════════════
     SERVICE CARD MODALS
     ═══════════════════════════════════ */
  function initModals() {
    const modal = $('#spModal');
    if (!modal) return;

    const backdrop = $('.sp-modal__backdrop', modal);
    const closeBtn = $('.sp-modal__close', modal);
    const titleEl = $('#modalTitle');
    const priceEl = $('#modalPrice');
    const descEl = $('#modalDesc');
    const tagEl = $('#modalTag');

    function openModal(card) {
      const name = card.querySelector('.sp-card__name');
      const price = card.querySelector('.sp-card__price');
      const desc = card.querySelector('.sp-card__desc');
      const tag = card.querySelector('.sp-card__tag');

      if (titleEl && name) titleEl.textContent = name.textContent;
      if (priceEl && price) priceEl.textContent = price.textContent;
      if (descEl && desc) descEl.textContent = desc.textContent;
      if (tagEl && tag) tagEl.textContent = tag.textContent;

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    $$('.sp-card[data-modal]').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        openModal(card);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  /* ═══════════════════════════════════
     CARD 3D TILT (Desktop)
     ═══════════════════════════════════ */
  function initCardTilt() {
    if (!desktop() || reduced) return;

    $$('.sp-card:not(.sp-card--cta)').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════
     STAGGERED CARD REVEAL
     ═══════════════════════════════════ */
  function initCardReveal() {
    const cards = $$('.sp-card');
    if (!cards.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const grid = e.target.parentElement;
          const siblings = $$('.sp-card', grid);
          const idx = siblings.indexOf(e.target);
          setTimeout(() => {
            e.target.classList.add('visible');
          }, idx * 70);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    cards.forEach(card => obs.observe(card));
  }

  /* ═══════════════════════════════════
     SECTION HEADER REVEAL
     ═══════════════════════════════════ */
  function initSectionReveal() {
    const headers = $$('.sp-section__header, .sp-subheading');
    if (!headers.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    headers.forEach(h => obs.observe(h));
  }

  /* ═══════════════════════════════════
     WAXING ITEMS STAGGER REVEAL
     ═══════════════════════════════════ */
  function initWaxReveal() {
    const items = $$('.sp-wax-item');
    if (!items.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const siblings = $$('.sp-wax-item', e.target.parentElement);
          const idx = siblings.indexOf(e.target);
          setTimeout(() => {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateX(0)';
          }, idx * 40);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    items.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-15px)';
      item.style.transition = 'opacity .6s var(--ease-out), transform .6s var(--ease-out)';
      obs.observe(item);
    });
  }

  /* ═══════════════════════════════════
     BOTTOM CTA REVEAL
     ═══════════════════════════════════ */
  function initBottomCTA() {
    const cta = $('.sp-bottom-cta');
    if (!cta) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    obs.observe(cta);
  }

  /* ═══════════════════════════════════
     FOOTER YEAR
     ═══════════════════════════════════ */
  function initFooterYear() {
    const yr = $('#footerYear');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ═══════════════════════════════════
     BODY LOADED CLASS
     ═══════════════════════════════════ */
  function markLoaded() {
    document.body.classList.add('loaded');
  }

  /* ═══════════════════════════════════
     BOOT
     ═══════════════════════════════════ */
  function boot() {
    markLoaded();

    // Hero
    initHeroEntrance();
    initHeroParallax();
    initHeroScroll();
    initHeroMagnetic();
    initHeroCTA();

    // Navigation
    initCatNav();

    // Cards & Content
    initModals();
    initCardTilt();
    initCardReveal();
    initSectionReveal();
    initWaxReveal();
    initBottomCTA();

    // Footer
    initFooterYear();

    console.log('%c✦ NYC Panache — Services Page Ready', 'color:#CB9B51;font-size:12px;font-weight:bold;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
