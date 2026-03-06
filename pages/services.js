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
})();
