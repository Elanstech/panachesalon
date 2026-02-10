/* ============================================
   NYC PANACHE SALON — MASTER JAVASCRIPT
   Apple-smooth animations & interactions
   ============================================ */

/* ══════════════════════════════════
   PRELOADER
   ══════════════════════════════════ */
class Preloader {
  constructor() {
    this.el = document.getElementById('preloader');
    if (!this.el) return;
    window.addEventListener('load', () => setTimeout(() => this.hide(), 2000));
    setTimeout(() => this.hide(), 4000); // fallback
  }
  hide() {
    this.el.classList.add('loaded');
    document.body.classList.add('loaded');
  }
}

/* ══════════════════════════════════
   HEADER
   ══════════════════════════════════ */
class Header {
  constructor() {
    this.el = document.getElementById('header');
    if (!this.el) return;
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.onScroll();
  }
  onScroll() {
    this.el.classList.toggle('scrolled', window.scrollY > 50);
  }
}

/* ══════════════════════════════════
   MOBILE MENU
   ══════════════════════════════════ */
class MobileMenu {
  constructor() {
    this.btn = document.getElementById('hamburger');
    this.menu = document.getElementById('mobileMenu');
    if (!this.btn || !this.menu) return;
    this.links = this.menu.querySelectorAll('.mm-link, .mm-cta');
    this.isOpen = false;
    this.btn.addEventListener('click', () => this.toggle());
    this.links.forEach(l => l.addEventListener('click', () => this.close()));
  }
  toggle() {
    this.isOpen = !this.isOpen;
    this.btn.classList.toggle('active', this.isOpen);
    this.menu.classList.toggle('open', this.isOpen);
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }
  close() {
    this.isOpen = false;
    this.btn.classList.remove('active');
    this.menu.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ══════════════════════════════════
   CINEMATIC HERO DIRECTOR
   Replaces old HeroAnimator —
   Choreographed entrance + parallax
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
    this.rafId = null;

    this._init();
  }

  _init() {
    // Start after preloader finishes
    const startDelay = document.getElementById('preloader') ? 2200 : 400;
    setTimeout(() => this._playEntrance(), startDelay);

    this._bindScroll();
    this._bindScrollHide();

    // Scroll indicator click → next section
    if (this.scroll) {
      this.scroll.addEventListener('click', () => {
        const next = this.hero.nextElementSibling;
        if (next) {
          const header = document.getElementById('header');
          const offset = header ? header.offsetHeight + 20 : 80;
          const top = next.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    }
  }

  /* Staggered cinematic reveal — Apple keynote style */
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
      setTimeout(() => {
        if (fn) return fn();
        if (el) el.classList.add(cls);
      }, delay);
    });
  }

  _revealWords() {
    this.words.forEach((word) => {
      const d = parseInt(word.dataset.delay || 0, 10);
      setTimeout(() => word.classList.add('is-visible'), d * 180);
    });
  }

  /* Scroll-driven parallax depth */
  _bindScroll() {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        this.rafId = requestAnimationFrame(() => {
          this._onScroll();
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
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
      const zoom = 1 + progress * 0.08;
      this.video.style.transform = `scale(${zoom})`;
    }
  }

  /* Fade out scroll indicator */
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
   Buttons subtly follow cursor
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
   Pauses video when out of view
   ══════════════════════════════════ */
class HeroVideoOptimizer {
  constructor() {
    this.video = document.querySelector('.hero-video');
    if (!this.video) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.video.play().catch(() => {});
        } else {
          this.video.pause();
        }
      });
    }, { threshold: 0.1 });

    this.observer.observe(this.video.closest('#hero'));
  }
}

/* ══════════════════════════════════
   HERO TEXT SHIMMER
   Gold shimmer on accent word hover
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
      s.textContent = `
        @keyframes heroTitleShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `;
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
   SMOOTH SCROLL
   ══════════════════════════════════ */
class SmoothScroll {
  constructor() {
    const header = document.getElementById('header');
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;
        const offset = header ? header.offsetHeight + 20 : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }
}

/* ══════════════════════════════════
   ACTIVE NAV
   ══════════════════════════════════ */
class ActiveNav {
  constructor() {
    this.sections = document.querySelectorAll('section[id]');
    this.links = document.querySelectorAll('.nav-link');
    if (!this.sections.length || !this.links.length) return;
    window.addEventListener('scroll', () => this.update(), { passive: true });
  }
  update() {
    const scrollPos = window.scrollY + 150;
    this.sections.forEach(s => {
      const top = s.offsetTop, height = s.offsetHeight, id = s.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        this.links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
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
    new Header();
    new MobileMenu();

    // Hero (cinematic)
    new HeroDirector();
    new HeroMagneticButtons();
    new HeroVideoOptimizer();
    new HeroTextShimmer();

    // Page
    new ScrollRevealer();
    new ServiceTabs();
    new SmoothScroll();
    new ActiveNav();
    new BackToTop();
    new Parallax();
    new GoldTrail();
    new TiltCards();
    new DeviceParallax();

    console.log('%c✦ NYC Panache Salon — Loaded', 'color:#CB9B51;font-size:14px;font-weight:bold;');
  }
}

new App();
