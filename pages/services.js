/* ╔══════════════════════════════════════════════════╗
   ║  NYC PANACHE SALON — SERVICES PAGE JS            ║
   ║  Requires: ../script.js (root) loaded first      ║
   ╚══════════════════════════════════════════════════╝ */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ═══════════════════════════════════
     STICKY CATEGORY NAV — Active state
     ═══════════════════════════════════ */
  function initCatNav() {
    const nav = $('#spCatnav');
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
      const y = window.scrollY + 120;
      let active = null;
      for (const { el, link } of sections) {
        if (y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) active = link;
      }
      links.forEach(l => l.classList.toggle('is-active', l === active));

      // Auto-scroll the active link into view within the nav
      if (active && nav) {
        const inner = $('.sp-catnav__inner', nav);
        if (inner) {
          const linkRect = active.getBoundingClientRect();
          const innerRect = inner.getBoundingClientRect();
          if (linkRect.left < innerRect.left || linkRect.right > innerRect.right) {
            active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }
      }
    }

    window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });

    // Smooth scroll on click
    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const target = $(href);
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 60,
            behavior: 'smooth'
          });
        }
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

    // Attach click to all service cards (not CTA cards)
    $$('.sp-card[data-modal]').forEach(card => {
      card.addEventListener('click', e => {
        // Don't open if they clicked a link inside
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
     CARD HOVER TILT (Desktop only)
     ═══════════════════════════════════ */
  function initCardTilt() {
    if (window.innerWidth <= 1024) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    $$('.sp-card:not(.sp-card--cta)').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-5px) perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════
     STAGGERED REVEAL FOR CARDS
     ═══════════════════════════════════ */
  function initCardReveal() {
    const cards = $$('.sp-card');
    if (!cards.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // Find sibling cards in the same grid
          const grid = e.target.parentElement;
          const siblings = $$('.sp-card', grid);
          const idx = siblings.indexOf(e.target);
          setTimeout(() => {
            e.target.classList.add('visible');
          }, idx * 60);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

    cards.forEach(card => obs.observe(card));
  }

  /* ═══════════════════════════════════
     WAXING ITEMS REVEAL
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
      item.style.transform = 'translateX(-12px)';
      item.style.transition = 'opacity .6s var(--ease-out), transform .6s var(--ease-out)';
      obs.observe(item);
    });
  }

  /* ═══════════════════════════════════
     HERO PARALLAX
     ═══════════════════════════════════ */
  function initHeroParallax() {
    const hero = $('.sp-hero');
    const img = $('.sp-hero__img');
    const content = $('.sp-hero__content');
    if (!hero || !img) return;

    let heroH = hero.offsetHeight;

    window.addEventListener('scroll', () => {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > heroH) return;
        const p = y / heroH;
        if (content) {
          content.style.transform = `translateY(${p * 40}px)`;
          content.style.opacity = String(Math.max(1 - p * 1.4, 0));
        }
        img.style.transform = `scale(${1.05 + p * 0.06})`;
      });
    }, { passive: true });

    window.addEventListener('resize', () => { heroH = hero.offsetHeight; });
  }

  /* ═══════════════════════════════════
     FOOTER YEAR
     ═══════════════════════════════════ */
  function initFooterYear() {
    const yr = $('#footerYear');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ═══════════════════════════════════
     BOOT
     ═══════════════════════════════════ */
  function boot() {
    initCatNav();
    initModals();
    initCardTilt();
    initCardReveal();
    initWaxReveal();
    initHeroParallax();
    initFooterYear();

    console.log('%c✦ NYC Panache — Services Page Ready', 'color:#CB9B51;font-size:12px;font-weight:bold;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();    });

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
