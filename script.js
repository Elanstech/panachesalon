/* ╔══════════════════════════════════════════════════╗
   ║  NYC PANACHE SALON — MASTER JAVASCRIPT           ║
   ║  Sidebar + Curtain + Hero + Services             ║
   ╚══════════════════════════════════════════════════╝ */


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
    this.links.forEach(link => link.addEventListener('click', e => this._onClick(e, link)));
  }
  _bindScroll() {
    let t = false;
    window.addEventListener('scroll', () => {
      if (!t) { t = true; requestAnimationFrame(() => { this._update(); t = false; }); }
    }, { passive: true });
    this._update();
  }
  _update() {
    const y = window.scrollY + window.innerHeight * 0.35;
    let active = null;
    this.sections.forEach(({ el, link }) => {
      if (y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) active = link;
    });
    this.links.forEach(l => l.classList.remove('active'));
    if (active) active.classList.add('active');
  }
  _onClick(e, link) {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    const off = window.innerWidth > 768 ? 20 : 84;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
  }
}


/* ══════════════════════════════════
   MOBILE CURTAIN MENU
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
    this.links.forEach(link => link.addEventListener('click', e => this._onLinkClick(e, link)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && this.isOpen) this._close(); });
    this._bindBarScroll();
  }
  _toggle() { if (this.isAnimating) return; this.isOpen ? this._close() : this._open(); }
  _open() {
    this.isOpen = true; this.isAnimating = true;
    this.toggle.classList.add('is-open');
    this.toggle.setAttribute('aria-expanded', 'true');
    this.curtain.setAttribute('aria-hidden', 'false');
    this.curtain.classList.remove('is-closing');
    this.curtain.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    this.links.forEach(l => { l.style.opacity = '0'; l.style.transform = 'translateX(-40px)'; });
    requestAnimationFrame(() => this.links.forEach(l => { l.style.opacity = ''; l.style.transform = ''; }));
    setTimeout(() => { this.isAnimating = false; }, 800);
  }
  _close() {
    this.isOpen = false; this.isAnimating = true;
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
      const off = this.bar ? this.bar.offsetHeight + 16 : 80;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
    }, 500);
  }
  _bindBarScroll() {
    if (!this.bar) return;
    let lastY = 0;
    this.bar.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1), background 0.4s ease';
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 200 && y > lastY && !this.isOpen) this.bar.style.transform = 'translateY(-100%)';
      else this.bar.style.transform = 'translateY(0)';
      this.bar.style.background = y > 50 ? 'rgba(13,11,9,0.9)' : 'rgba(13,11,9,0.7)';
      lastY = y;
    }, { passive: true });
  }
}


/* ══════════════════════════════════
   CINEMATIC HERO DIRECTOR
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
    const delay = document.getElementById('preloader') ? 2200 : 400;
    setTimeout(() => this._play(), delay);
    this._bindScroll();
    this._bindScrollHide();
    if (this.scroll) {
      this.scroll.addEventListener('click', () => {
        const next = this.hero.nextElementSibling;
        if (next) window.scrollTo({ top: next.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
      });
    }
  }
  _play() {
    if (this.hasPlayed) return;
    this.hasPlayed = true;
    const tl = [
      [0, this.pill, 'is-visible'], [300, this.eyebrow, 'is-visible'],
      [500, null, null, () => this.words.forEach((w, i) => setTimeout(() => w.classList.add('is-visible'), i * 180))],
      [1200, this.sub, 'is-visible'], [1600, this.rule, 'is-visible'],
      [1900, this.ctas, 'is-visible'], [2400, this.scroll, 'is-visible'],
      [2400, this.socials, 'is-visible'],
    ];
    tl.forEach(([d, el, cls, fn]) => setTimeout(() => fn ? fn() : el && el.classList.add(cls), d));
  }
  _bindScroll() {
    let t = false;
    window.addEventListener('scroll', () => {
      if (!t) { t = true; requestAnimationFrame(() => { this._onScroll(); t = false; }); }
    }, { passive: true });
  }
  _onScroll() {
    const y = window.scrollY, vh = window.innerHeight;
    if (y > vh * 1.2) return;
    const p = Math.min(y / vh, 1);
    if (this.container) {
      this.container.style.transform = `translateY(-${p * 80}px) scale(${1 - p * 0.05})`;
      this.container.style.opacity = Math.max(1 - p * 1.3, 0);
    }
    if (this.video) this.video.style.transform = `scale(${1 + p * 0.08})`;
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
   HERO UTILITIES
   ══════════════════════════════════ */
class HeroMagneticButtons {
  constructor() {
    if (window.innerWidth <= 1024 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.hero-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px, ${(e.clientY - r.top - r.height / 2) * 0.2}px)`;
        btn.style.transition = 'transform 0.2s ease';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'all 0.55s cubic-bezier(0.16,1,0.3,1)';
      });
    });
  }
}

class HeroVideoOptimizer {
  constructor() {
    this.video = document.querySelector('.hero-video');
    if (!this.video) return;
    new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? this.video.play().catch(() => {}) : this.video.pause());
    }, { threshold: 0.1 }).observe(this.video.closest('#hero'));
  }
}

class HeroTextShimmer {
  constructor() {
    const el = document.querySelector('.hero-title__word--accent');
    if (!el || window.innerWidth <= 768) return;
    el.addEventListener('mouseenter', () => { el.style.backgroundSize = '200% auto'; el.style.animation = 'heroTitleShimmer 2s ease infinite'; });
    el.addEventListener('mouseleave', () => { el.style.animation = ''; el.style.backgroundSize = ''; });
    if (!document.querySelector('#heroTitleShimmerKF')) {
      const s = document.createElement('style');
      s.id = 'heroTitleShimmerKF';
      s.textContent = `@keyframes heroTitleShimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }`;
      document.head.appendChild(s);
    }
  }
}


/* ══════════════════════════════════
   SCROLL REVEALER (generic .reveal)
   ══════════════════════════════════ */
class ScrollRevealer {
  constructor() {
    this.els = document.querySelectorAll('.reveal');
    if (!this.els.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const siblings = e.target.parentElement.querySelectorAll('.reveal');
          const idx = Array.from(siblings).indexOf(e.target);
          setTimeout(() => e.target.classList.add('visible'), idx * 100);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    this.els.forEach(el => obs.observe(el));
  }
}


/* ══════════════════════════════════
   SMOOTH SCROLL (generic anchors)
   ══════════════════════════════════ */
class SmoothScroll {
  constructor() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      if (a.closest('.sidebar') || a.closest('.curtain')) return;
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;
        const off = window.innerWidth > 768 ? 20 : 80;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
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
    window.addEventListener('scroll', () => this.el.classList.toggle('visible', window.scrollY > 500), { passive: true });
    this.el.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}


/* ══════════════════════════════════
   PARALLAX (Quote Section)
   ══════════════════════════════════ */
class Parallax {
  constructor() {
    this.el = document.querySelector('.parallax-bg');
    if (!this.el || window.innerWidth <= 768) return;
    window.addEventListener('scroll', () => {
      const r = this.el.parentElement.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) this.el.style.transform = `translateY(${-(r.top * 0.25)}px)`;
    }, { passive: true });
  }
}


/* ══════════════════════════════════
   GOLD TRAIL (Cursor)
   ══════════════════════════════════ */
class GoldTrail {
  constructor() {
    if (window.innerWidth <= 1024 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.mx = 0; this.my = 0; this.tx = 0; this.ty = 0;
    this.dot = document.createElement('div');
    Object.assign(this.dot.style, {
      position: 'fixed', width: '8px', height: '8px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(246,226,122,0.5) 0%, transparent 70%)',
      pointerEvents: 'none', zIndex: '9999', opacity: '0',
      mixBlendMode: 'screen', transition: 'opacity 0.4s ease',
    });
    document.body.appendChild(this.dot);
    document.addEventListener('mousemove', e => { this.mx = e.clientX; this.my = e.clientY; this.dot.style.opacity = '1'; });
    document.addEventListener('mouseleave', () => this.dot.style.opacity = '0');
    this._loop();
  }
  _loop() {
    this.tx += (this.mx - this.tx) * 0.12;
    this.ty += (this.my - this.ty) * 0.12;
    this.dot.style.left = `${this.tx - 4}px`;
    this.dot.style.top = `${this.ty - 4}px`;
    requestAnimationFrame(() => this._loop());
  }
}


/* ══════════════════════════════════
   TILT CARDS
   ══════════════════════════════════ */
class TiltCards {
  constructor() {
    if (window.innerWidth <= 1024) return;
    document.querySelectorAll('.why-card, .cta-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-5px)`;
        card.style.transition = 'transform 0.1s ease';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'all 0.5s cubic-bezier(0.16,1,0.3,1)';
      });
    });
  }
}


/* ══════════════════════════════════
   DEVICE PARALLAX (Showcase)
   ══════════════════════════════════ */
class DeviceParallax {
  constructor() {
    this.macbook = document.querySelector('.device-macbook');
    this.iphone = document.querySelector('.device-iphone');
    if (!this.macbook || window.innerWidth <= 768) return;
    window.addEventListener('scroll', () => {
      const section = document.getElementById('showcase');
      if (!section) return;
      const r = section.getBoundingClientRect();
      const p = 1 - (r.top / window.innerHeight);
      if (p > 0 && p < 2) {
        const s = (p - 0.5) * 20;
        this.macbook.style.transform = `translateY(${-s}px)`;
        this.iphone.style.transform = `translateY(${s * 0.6}px)`;
      }
    }, { passive: true });
  }
}


/* ══════════════════════════════════════════════════════
   SERVICES SECTION — Tabs + Reveals + Interactions
   ══════════════════════════════════════════════════════ */
class ServicesSection {
  constructor() {
    this.section = document.getElementById('services');
    if (!this.section) return;

    this.tabs = this.section.querySelectorAll('.svc-tab');
    this.panels = this.section.querySelectorAll('.svc-panel');
    this.slider = this.section.querySelector('.svc-tab__slider');

    if (!this.tabs.length) return;

    this._initTabs();
    this._initScrollReveal();
    this._initShowcaseParallax();
    this._initItemHover();
    this._positionSlider();
  }

  /* ── TABS ── */
  _initTabs() {
    this.tabs.forEach(tab => tab.addEventListener('click', () => this._activate(tab)));

    // Keyboard nav
    const container = this.section.querySelector('.svc-tabs');
    if (container) {
      container.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const cur = Array.from(this.tabs).findIndex(t => t.classList.contains('is-active'));
          const next = e.key === 'ArrowRight'
            ? (cur + 1) % this.tabs.length
            : (cur - 1 + this.tabs.length) % this.tabs.length;
          this._activate(this.tabs[next]);
          this.tabs[next].focus();
        }
      });
    }

    // Recalculate slider on resize
    window.addEventListener('resize', () => this._positionSlider());
  }

  _activate(tab) {
    const target = tab.dataset.tab;

    // Deactivate
    this.tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
    this.panels.forEach(p => p.classList.remove('is-active'));

    // Activate
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');

    const panel = document.getElementById(`panel-${target}`);
    if (!panel) return;

    // Animate panel in
    requestAnimationFrame(() => {
      panel.classList.add('is-active');
      // Re-trigger reveal animations for items
      const items = panel.querySelectorAll('[data-svc-reveal]');
      items.forEach(item => {
        item.classList.remove('is-revealed');
        item.style.opacity = '0';
      });
      // Staggered reveal
      setTimeout(() => {
        items.forEach((item, i) => {
          const d = parseInt(item.dataset.delay || i, 10);
          setTimeout(() => {
            item.classList.add('is-revealed');
            item.style.opacity = '';
          }, d * 100 + 100);
        });
      }, 50);
    });

    // Move slider
    this._positionSlider();

    // Scroll tab into view on mobile
    if (window.innerWidth <= 768) tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  _positionSlider() {
    if (!this.slider) return;
    const active = this.section.querySelector('.svc-tab.is-active');
    if (!active) return;
    const container = this.slider.parentElement;
    const cRect = container.getBoundingClientRect();
    const tRect = active.getBoundingClientRect();
    this.slider.style.left = `${tRect.left - cRect.left}px`;
    this.slider.style.width = `${tRect.width}px`;
  }

  /* ── SCROLL REVEAL ── */
  _initScrollReveal() {
    const items = this.section.querySelectorAll('[data-svc-reveal]');
    if (!items.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const d = parseInt(el.dataset.delay || 0, 10);
          setTimeout(() => el.classList.add('is-revealed'), d * 100 + 50);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

    items.forEach(el => obs.observe(el));
  }

  /* ── SHOWCASE CARD PARALLAX ── */
  _initShowcaseParallax() {
    if (window.innerWidth <= 1024 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.section.querySelectorAll('.svc-showcase').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;

        const img = card.querySelector('.svc-showcase__img');
        if (img) img.style.transform = `scale(1.06) translate(${x * -10}px, ${y * -10}px)`;
        card.style.transform = `perspective(1000px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        const img = card.querySelector('.svc-showcase__img');
        if (img) { img.style.transform = ''; img.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)'; }
        card.style.transform = '';
        card.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
        setTimeout(() => {
          if (img) img.style.transition = '';
          card.style.transition = '';
        }, 800);
      });
    });
  }

  /* ── ITEM HOVER EFFECTS ── */
  _initItemHover() {
    if (window.innerWidth <= 768) return;
    this.section.querySelectorAll('.svc-item').forEach(item => {
      const price = item.querySelector('.svc-item__price');
      item.addEventListener('mouseenter', () => {
        if (price) {
          price.style.transform = 'scale(1.08)';
          price.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        }
      });
      item.addEventListener('mouseleave', () => {
        if (price) {
          price.style.transform = '';
          price.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
        }
      });
    });
  }
}


/* ══════════════════════════════════
   APP — BOOT EVERYTHING
   ══════════════════════════════════ */
class App {
  constructor() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.boot());
    } else {
      this.boot();
    }
  }

  boot() {
    // Ensure body loaded class
    if (!document.body.classList.contains('loaded')) {
      document.body.classList.add('loaded');
    }

    // Core navigation
    new Preloader();
    new SidebarNav();
    new CurtainMenu();

    // Hero
    new HeroDirector();
    new HeroMagneticButtons();
    new HeroVideoOptimizer();
    new HeroTextShimmer();

    // Services
    new ServicesSection();

    // Page interactions
    new ScrollRevealer();
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
