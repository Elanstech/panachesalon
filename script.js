/* ============================================
   NYC PANACHE SALON — MASTER JAVASCRIPT
   Sidebar Nav + Curtain Menu + Cinematic Hero
   ============================================ */

/* ══════════════════════════════════
   PRELOADER
   ══════════════════════════════════ */
class Preloader {
  constructor() {
    this.el = document.getElementById('preloader');
    if (!this.el) return;
    window.addEventListener('load', () => setTimeout(() => this.hide(), 2000));
    setTimeout(() => this.hide(), 4000);
  }
  hide() {
    this.el.classList.add('loaded');
    document.body.classList.add('loaded');
  }
}

/* ══════════════════════════════════
   DESKTOP SIDEBAR NAV
   Active section tracking + smooth scroll
   ══════════════════════════════════ */
class SidebarNav {
  constructor() {
    this.sidebar = document.getElementById('sidebar');
    if (!this.sidebar) return;

    this.links = this.sidebar.querySelectorAll('.sidebar__link');
    this.sections = [];

    this.links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const section = document.querySelector(href);
        if (section) this.sections.push({ el: section, link });
      }
    });

    if (!this.sections.length) return;
    this._bindScroll();
    this.links.forEach(link => {
      link.addEventListener('click', (e) => this._onClick(e, link));
    });
  }

  _bindScroll() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { this._update(); ticking = false; });
      }
    }, { passive: true });
    this._update();
  }

  _update() {
    const scrollY = window.scrollY + window.innerHeight * 0.35;
    let activeLink = null;

    this.sections.forEach(({ el, link }) => {
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (scrollY >= top && scrollY < bottom) activeLink = link;
    });

    this.links.forEach(l => l.classList.remove('active'));
    if (activeLink) activeLink.classList.add('active');
  }

  _onClick(e, link) {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    const offset = window.innerWidth > 768 ? 20 : 84;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

/* ══════════════════════════════════
   MOBILE CURTAIN MENU
   Two-panel curtain reveal + staggered links
   ══════════════════════════════════ */
class CurtainMenu {
  constructor() {
    this.toggle = document.getElementById('menuToggle');
    this.curtain = document.getElementById('curtainMenu');
    this.bar = document.getElementById('mobileBar');
    if (!this.toggle || !this.curtain) return;

    this.links = this.curtain.querySelectorAll('.curtain__link');
    this.isOpen = false;
    this.isAnimating = false;

    this.toggle.addEventListener('click', () => this._toggle());

    this.links.forEach(link => {
      link.addEventListener('click', (e) => this._onLinkClick(e, link));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this._close();
    });

    this._bindBarScroll();
  }

  _toggle() {
    if (this.isAnimating) return;
    this.isOpen ? this._close() : this._open();
  }

  _open() {
    this.isOpen = true;
    this.isAnimating = true;

    this.toggle.classList.add('is-open');
    this.toggle.setAttribute('aria-expanded', 'true');
    this.curtain.setAttribute('aria-hidden', 'false');
    this.curtain.classList.remove('is-closing');
    this.curtain.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Reset link animations for re-trigger
    this.links.forEach(link => {
      link.style.opacity = '0';
      link.style.transform = 'translateX(-40px)';
    });
    requestAnimationFrame(() => {
      this.links.forEach(link => { link.style.opacity = ''; link.style.transform = ''; });
    });

    setTimeout(() => { this.isAnimating = false; }, 800);
  }

  _close() {
    this.isOpen = false;
    this.isAnimating = true;

    this.toggle.classList.remove('is-open');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.curtain.setAttribute('aria-hidden', 'true');
    this.curtain.classList.add('is-closing');

    setTimeout(() => {
      this.curtain.classList.remove('is-open', 'is-closing');
      document.body.style.overflow = '';
      this.isAnimating = false;
    }, 700);
  }

  _onLinkClick(e, link) {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    this._close();

    setTimeout(() => {
      const target = document.querySelector(href);
      if (!target) return;
      const offset = this.bar ? this.bar.offsetHeight + 16 : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 500);
  }

  _bindBarScroll() {
    if (!this.bar) return;
    let lastY = 0;
    this.bar.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s ease';

    window.addEventListener('scroll', () => {
      const y = window.scrollY;

      // Auto-hide on down, show on up
      if (y > 200 && y > lastY && !this.isOpen) {
        this.bar.style.transform = 'translateY(-100%)';
      } else {
        this.bar.style.transform = 'translateY(0)';
      }

      this.bar.style.background = y > 50
        ? 'rgba(13, 11, 9, 0.9)'
        : 'rgba(13, 11, 9, 0.7)';

      lastY = y;
    }, { passive: true });
  }
}

/* ══════════════════════════════════
   CINEMATIC HERO DIRECTOR
   Choreographed entrance + scroll parallax
   ══════════════════════════════════ */
class HeroDirector {
  constructor() {
    this.hero = document.getElementById('hero');
    if (!this.hero) return;

    this.video = this.hero.querySelector('.hero-video');
    this.container = this.hero.querySelector('.hero-container');
    this.pill = this.hero.querySelector('[data-hero-anim="pill"]');
    this.eyebrow = this.hero.querySelector('[data-hero-anim="eyebrow"]');
    this.words = this.hero.querySelectorAll('[data-hero-anim="word"]');
    this.sub = this.hero.querySelector('[data-hero-anim="sub"]');
    this.rule = this.hero.querySelector('[data-hero-anim="rule"]');
    this.ctas = this.hero.querySelector('[data-hero-anim="ctas"]');
    this.scroll = this.hero.querySelector('[data-hero-anim="scroll"]');
    this.socials = this.hero.querySelector('[data-hero-anim="socials"]');

    this.hasPlayed = false;
    this._init();
  }

  _init() {
    const startDelay = document.getElementById('preloader') ? 2200 : 400;
    setTimeout(() => this._playEntrance(), startDelay);
    this._bindScroll();
    this._bindScrollHide();

    if (this.scroll) {
      this.scroll.addEventListener('click', () => {
        const next = this.hero.nextElementSibling;
        if (next) {
          const offset = 20;
          const top = next.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    }
  }

  _playEntrance() {
    if (this.hasPlayed) return;
    this.hasPlayed = true;

    const timeline = [
      [0,    this.pill,    'is-visible'],
      [300,  this.eyebrow, 'is-visible'],
      [500,  null,         null,         () => this._revealWords()],
      [1200, this.sub,     'is-visible'],
      [1600, this.rule,    'is-visible'],
      [1900, this.ctas,    'is-visible'],
      [2400, this.scroll,  'is-visible'],
      [2400, this.socials, 'is-visible'],
    ];

    timeline.forEach(([delay, el, cls, fn]) => {
      setTimeout(() => { if (fn) return fn(); if (el) el.classList.add(cls); }, delay);
    });
  }

  _revealWords() {
    this.words.forEach((word) => {
      const d = parseInt(word.dataset.delay || 0, 10);
      setTimeout(() => word.classList.add('is-visible'), d * 180);
    });
  }

  _bindScroll() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { this._onScroll(); ticking = false; });
      }
    }, { passive: true });
  }

  _onScroll() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    if (scrollY > vh * 1.2) return;
    const progress = Math.min(scrollY / vh, 1);

    if (this.container) {
      const yShift = progress * 80;
      const opacity = 1 - progress * 1.3;
      const scale = 1 - progress * 0.05;
      this.container.style.transform = `translateY(-${yShift}px) scale(${scale})`;
      this.container.style.opacity = Math.max(opacity, 0);
    }

    if (this.video) {
      this.video.style.transform = `scale(${1 + progress * 0.08})`;
    }
  }

  _bindScrollHide() {
    if (!this.scroll) return;
    let hidden = false;
    window.addEventListener('scroll', () => {
      if (!hidden && window.scrollY > 80) {
        this.scroll.style.opacity = '0';
        this.scroll.style.transition = 'opacity 0.6s ease';
        this.scroll.style.pointerEvents = 'none';
        hidden = true;
      } else if (hidden && window.scrollY <= 80) {
        this.scroll.style.opacity = '1';
        this.scroll.style.pointerEvents = 'auto';
        hidden = false;
      }
    }, { passive: true });
  }
}

/* ══════════════════════════════════
   HERO MAGNETIC BUTTONS
   ══════════════════════════════════ */
class HeroMagneticButtons {
  constructor() {
    if (window.innerWidth <= 1024) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.btns = document.querySelectorAll('.hero-btn');
    if (!this.btns.length) return;

    this.btns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => this._attract(e, btn));
      btn.addEventListener('mouseleave', () => this._release(btn));
    });
  }
  _attract(e, btn) {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.2}px)`;
    btn.style.transition = 'transform 0.2s ease';
  }
  _release(btn) {
    btn.style.transform = '';
    btn.style.transition = 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
  }
}

/* ══════════════════════════════════
   HERO VIDEO OPTIMIZER
   ══════════════════════════════════ */
class HeroVideoOptimizer {
  constructor() {
    this.video = document.querySelector('.hero-video');
    if (!this.video) return;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.isIntersecting ? this.video.play().catch(() => {}) : this.video.pause();
      });
    }, { threshold: 0.1 });
    this.observer.observe(this.video.closest('#hero'));
  }
}

/* ══════════════════════════════════
   HERO TEXT SHIMMER
   ══════════════════════════════════ */
class HeroTextShimmer {
  constructor() {
    this.accent = document.querySelector('.hero-title__word--accent');
    if (!this.accent || window.innerWidth <= 768) return;

    this.accent.addEventListener('mouseenter', () => {
      this.accent.style.backgroundSize = '200% auto';
      this.accent.style.animation = 'heroTitleShimmer 2s ease infinite';
    });
    this.accent.addEventListener('mouseleave', () => {
      this.accent.style.animation = '';
      this.accent.style.backgroundSize = '';
    });

    if (!document.querySelector('#heroTitleShimmerKF')) {
      const s = document.createElement('style');
      s.id = 'heroTitleShimmerKF';
      s.textContent = `@keyframes heroTitleShimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }`;
      document.head.appendChild(s);
    }
  }
}

/* ══════════════════════════════════
   SCROLL REVEALER
   ══════════════════════════════════ */
class ScrollRevealer {
  constructor() {
    this.els = document.querySelectorAll('.reveal');
    if (!this.els.length) return;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const parent = e.target.parentElement;
          const siblings = parent.querySelectorAll('.reveal');
          let idx = Array.from(siblings).indexOf(e.target);
          setTimeout(() => e.target.classList.add('visible'), idx * 100);
          this.observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    this.els.forEach(el => this.observer.observe(el));
  }
}

/* ══════════════════════════════════
   SERVICE TABS
   ══════════════════════════════════ */
class ServiceTabs {
  constructor() {
    this.tabs = document.querySelectorAll('.tab');
    this.panels = document.querySelectorAll('.panel');
    if (!this.tabs.length) return;
    this.tabs.forEach(t => t.addEventListener('click', () => this.activate(t)));
  }
  activate(tab) {
    const target = tab.dataset.tab;
    this.tabs.forEach(t => t.classList.remove('active'));
    this.panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(`panel-${target}`);
    if (!panel) return;
    panel.classList.add('active');
    const reveals = panel.querySelectorAll('.reveal');
    reveals.forEach((el, i) => {
      el.classList.remove('visible');
      setTimeout(() => el.classList.add('visible'), 80 * i);
    });
  }
}

/* ══════════════════════════════════
   SMOOTH SCROLL (generic anchors)
   ══════════════════════════════════ */
class SmoothScroll {
  constructor() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      // Skip if handled by Sidebar or Curtain
      if (a.closest('.sidebar') || a.closest('.curtain')) return;

      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;
        const offset = window.innerWidth > 768 ? 20 : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }
}

/* ══════════════════════════════════
   BACK TO TOP
   ══════════════════════════════════ */
class BackToTop {
  constructor() {
    this.el = document.getElementById('backToTop');
    if (!this.el) return;
    window.addEventListener('scroll', () => this.toggle(), { passive: true });
    this.el.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
  toggle() {
    this.el.classList.toggle('visible', window.scrollY > 500);
  }
}

/* ══════════════════════════════════
   PARALLAX (Quote Section)
   ══════════════════════════════════ */
class Parallax {
  constructor() {
    this.el = document.querySelector('.parallax-bg');
    if (!this.el || window.innerWidth <= 768) return;
    window.addEventListener('scroll', () => this.update(), { passive: true });
  }
  update() {
    const section = this.el.parentElement;
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      this.el.style.transform = `translateY(${-(rect.top * 0.25)}px)`;
    }
  }
}

/* ══════════════════════════════════
   GOLD TRAIL (Cursor)
   ══════════════════════════════════ */
class GoldTrail {
  constructor() {
    if (window.innerWidth <= 1024) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.mx = 0; this.my = 0; this.tx = 0; this.ty = 0;
    this.dot = document.createElement('div');
    Object.assign(this.dot.style, {
      position: 'fixed', width: '8px', height: '8px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(246,226,122,0.5) 0%, transparent 70%)',
      pointerEvents: 'none', zIndex: '9999', opacity: '0',
      mixBlendMode: 'screen', transition: 'opacity 0.4s ease',
    });
    document.body.appendChild(this.dot);
    document.addEventListener('mousemove', e => {
      this.mx = e.clientX; this.my = e.clientY; this.dot.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => this.dot.style.opacity = '0');
    this.loop();
  }
  loop() {
    this.tx += (this.mx - this.tx) * 0.12;
    this.ty += (this.my - this.ty) * 0.12;
    this.dot.style.left = `${this.tx - 4}px`;
    this.dot.style.top = `${this.ty - 4}px`;
    requestAnimationFrame(() => this.loop());
  }
}

/* ══════════════════════════════════
   TILT CARDS
   ══════════════════════════════════ */
class TiltCards {
  constructor() {
    if (window.innerWidth <= 1024) return;
    document.querySelectorAll('.why-card, .cta-card').forEach(card => {
      card.addEventListener('mousemove', (e) => this.tilt(e, card));
      card.addEventListener('mouseleave', () => this.reset(card));
    });
  }
  tilt(e, card) {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-5px)`;
    card.style.transition = 'transform 0.1s ease';
  }
  reset(card) {
    card.style.transform = '';
    card.style.transition = 'all 0.5s cubic-bezier(0.16,1,0.3,1)';
  }
}

/* ══════════════════════════════════
   DEVICE PARALLAX (Showcase Section)
   ══════════════════════════════════ */
class DeviceParallax {
  constructor() {
    this.macbook = document.querySelector('.device-macbook');
    this.iphone = document.querySelector('.device-iphone');
    if (!this.macbook || window.innerWidth <= 768) return;
    window.addEventListener('scroll', () => this.update(), { passive: true });
  }
  update() {
    const section = document.getElementById('showcase');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const progress = 1 - (rect.top / window.innerHeight);
    if (progress > 0 && progress < 2) {
      const shift = (progress - 0.5) * 20;
      this.macbook.style.transform = `translateY(${-shift}px)`;
      this.iphone.style.transform = `translateY(${shift * 0.6}px)`;
    }
  }
}

/* ══════════════════════════════════════════════
   NYC PANACHE SALON — SERVICES SECTION JS
   Tabs, cinematic reveals, hover interactions
   ══════════════════════════════════════════════ */

class ServicesSection {
  constructor() {
    this.section = document.getElementById('services');
    if (!this.section) return;

    this.tabs = this.section.querySelectorAll('.services__tab');
    this.panels = this.section.querySelectorAll('.services__panel');
    this.tabContainer = this.section.querySelector('.services__tabs');

    if (!this.tabs.length) return;

    this._bindTabs();
    this._bindScrollReveal();
    this._bindHeroCardParallax();
    this._bindItemHoverEffects();
  }

  /* ── TAB SWITCHING ── */

  _bindTabs() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this._activateTab(tab));
    });

    // Keyboard nav
    this.tabContainer.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentIdx = Array.from(this.tabs).findIndex(t => t.classList.contains('is-active'));
        let nextIdx;
        if (e.key === 'ArrowRight') {
          nextIdx = (currentIdx + 1) % this.tabs.length;
        } else {
          nextIdx = (currentIdx - 1 + this.tabs.length) % this.tabs.length;
        }
        this._activateTab(this.tabs[nextIdx]);
        this.tabs[nextIdx].focus();
      }
    });
  }

  _activateTab(tab) {
    const target = tab.dataset.svcTab;

    // Deactivate all
    this.tabs.forEach(t => {
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
    });
    this.panels.forEach(p => {
      p.classList.remove('is-active');
    });

    // Activate selected
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');

    const panel = document.getElementById(`svc-panel-${target}`);
    if (!panel) return;

    // Slight delay for transition effect
    requestAnimationFrame(() => {
      panel.classList.add('is-active');

      // Re-trigger staggered item animations
      const items = panel.querySelectorAll('.svc-reveal');
      items.forEach(item => {
        item.style.animation = 'none';
        item.offsetHeight; // force reflow
        item.style.animation = '';
      });
    });

    // Scroll tab into view on mobile
    if (window.innerWidth <= 768) {
      tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  /* ── SCROLL REVEAL FOR SECTION ── */

  _bindScrollReveal() {
    const reveals = this.section.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = entry.target.parentElement.querySelectorAll('.reveal');
          const idx = Array.from(siblings).indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('visible'), idx * 120);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  /* ── HERO CARD SUBTLE PARALLAX ON MOUSE ── */

  _bindHeroCardParallax() {
    if (window.innerWidth <= 1024) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = this.section.querySelectorAll('.services__hero-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const img = card.querySelector('.services__hero-card-img');
        if (img) {
          img.style.transform = `scale(1.06) translate(${x * -8}px, ${y * -8}px)`;
        }

        // Subtle 3D tilt
        card.style.transform = `perspective(1000px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        const img = card.querySelector('.services__hero-card-img');
        if (img) {
          img.style.transform = '';
          img.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        }
        card.style.transform = '';
        card.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

        setTimeout(() => {
          if (img) img.style.transition = '';
          card.style.transition = '';
        }, 800);
      });
    });
  }

  /* ── ITEM HOVER — MAGNETIC PRICE ── */

  _bindItemHoverEffects() {
    if (window.innerWidth <= 768) return;

    const items = this.section.querySelectorAll('.services__item');
    items.forEach(item => {
      const price = item.querySelector('.services__item-price');
      const line = item.querySelector('.services__item-line');

      item.addEventListener('mouseenter', () => {
        if (price) {
          price.style.transform = 'scale(1.08)';
          price.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }
      });

      item.addEventListener('mouseleave', () => {
        if (price) {
          price.style.transform = '';
          price.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        }
      });
    });
  }
}


/* ── INIT ── */
// Integrates with existing App boot, or standalone
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ServicesSection());
} else {
  new ServicesSection();
}

/* ══════════════════════════════════
   APP — BOOT EVERYTHING
   ══════════════════════════════════ */
class App {
  constructor() {
    document.addEventListener('DOMContentLoaded', () => this.boot());
  }
  boot() {
    // Core
    new Preloader();

    // Navigation (replaces old Header, MobileMenu, ActiveNav)
    new SidebarNav();
    new CurtainMenu();

    // Hero (cinematic)
    new HeroDirector();
    new HeroMagneticButtons();
    new HeroVideoOptimizer();
    new HeroTextShimmer();

    // Page interactions
    new ScrollRevealer();
    new ServiceTabs();
    new SmoothScroll();
    new BackToTop();
    new Parallax();
    new GoldTrail();
    new TiltCards();
    new DeviceParallax();

    console.log('%c✦ NYC Panache Salon — Loaded', 'color:#CB9B51;font-size:14px;font-weight:bold;');
  }
}

new App();
