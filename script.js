/* ╔══════════════════════════════════════════════════╗
   ║  NYC PANACHE SALON — OPTIMIZED MASTER JS         ║
   ║  Snappy · Fluid · Composed                       ║
   ╚══════════════════════════════════════════════════╝ */

(() => {
  'use strict';

  /* ── Shared Utilities ── */
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => Array.from((p || document).querySelectorAll(s));
  const raf = requestAnimationFrame.bind(window);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => window.innerWidth > 1024;
  const isMobile = () => window.innerWidth <= 768;

  // Throttle helper — ensures func fires at most once per rAF
  function rafThrottle(fn) {
    let ticking = false;
    return function (...args) {
      if (ticking) return;
      ticking = true;
      raf(() => { fn.apply(this, args); ticking = false; });
    };
  }

  // Debounce for resize
  function debounce(fn, ms = 150) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }


  /* ══════════════════════════════════
     PRELOADER
     ══════════════════════════════════ */
  class Preloader {
    constructor() {
      this.el = $('#preloader');
      if (!this.el) { document.body.classList.add('loaded'); return; }
      this.done = false;

      // Hide once page is loaded + animation finishes
      const hide = () => {
        if (this.done) return;
        this.done = true;
        // Let the bar fill to 100% before fading
        setTimeout(() => {
          this.el.classList.add('loaded');
          document.body.classList.add('loaded');
          // Remove from DOM after transition
          setTimeout(() => { this.el.remove(); }, 700);
        }, 300);
      };

      // Trigger: whichever comes first
      // 1. window load + min display time (2.6s for the bar to fill)
      window.addEventListener('load', () => setTimeout(hide, 2600));
      // 2. Safety timeout — never block longer than 4s
      setTimeout(hide, 4000);
    }
  }


  /* ══════════════════════════════════
     DESKTOP SIDEBAR NAV
     ══════════════════════════════════ */
  class SidebarNav {
    constructor() {
      this.sidebar = $('#sidebar');
      if (!this.sidebar) return;
      this.links = $$('.sidebar__link', this.sidebar);
      this.sections = [];
      this.links.forEach(link => {
        const href = link.getAttribute('href');
        if (href?.startsWith('#')) {
          const sec = $(href);
          if (sec) this.sections.push({ el: sec, link });
        }
      });
      if (!this.sections.length) return;

      this._update = rafThrottle(() => this._onScroll());
      window.addEventListener('scroll', this._update, { passive: true });
      this.links.forEach(l => l.addEventListener('click', e => this._click(e, l)));
      this._onScroll();
    }

    _onScroll() {
      const y = window.scrollY + window.innerHeight * 0.35;
      let active = null;
      for (const { el, link } of this.sections) {
        if (y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) active = link;
      }
      this.links.forEach(l => l.classList.toggle('active', l === active));
    }

    _click(e, link) {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const target = $(href);
      if (!target) return;
      const off = isMobile() ? 84 : 20;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
    }
  }


  /* ══════════════════════════════════
     MOBILE CURTAIN MENU
     ══════════════════════════════════ */
  class CurtainMenu {
    constructor() {
      this.toggle = $('#menuToggle');
      this.curtain = $('#curtainMenu');
      this.bar = $('#mobileBar');
      if (!this.toggle || !this.curtain) return;
      this.links = $$('.curtain__link', this.curtain);
      this.isOpen = false;
      this.animating = false;

      this.toggle.addEventListener('click', () => this._toggle());
      this.links.forEach(l => l.addEventListener('click', e => this._linkClick(e, l)));
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && this.isOpen) this._close(); });
      this._barScroll();
    }

    _toggle() { if (!this.animating) this.isOpen ? this._close() : this._open(); }

    _open() {
      this.isOpen = true;
      this.animating = true;
      this.toggle.classList.add('is-open');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.curtain.setAttribute('aria-hidden', 'false');
      this.curtain.classList.remove('is-closing');
      this.curtain.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => { this.animating = false; }, 700);
    }

    _close() {
      this.isOpen = false;
      this.animating = true;
      this.toggle.classList.remove('is-open');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.curtain.setAttribute('aria-hidden', 'true');
      this.curtain.classList.add('is-closing');
      setTimeout(() => {
        this.curtain.classList.remove('is-open', 'is-closing');
        document.body.style.overflow = '';
        this.animating = false;
      }, 650);
    }

    _linkClick(e, link) {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      this._close();
      setTimeout(() => {
        const target = $(href);
        if (!target) return;
        const off = this.bar ? this.bar.offsetHeight + 16 : 80;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
      }, 450);
    }

    _barScroll() {
      if (!this.bar) return;
      let lastY = 0;
      window.addEventListener('scroll', rafThrottle(() => {
        const y = window.scrollY;
        if (y > 200 && y > lastY && !this.isOpen) {
          this.bar.style.transform = 'translateY(-100%)';
        } else {
          this.bar.style.transform = 'translateY(0)';
        }
        this.bar.style.background = y > 50 ? 'rgba(13,11,9,0.9)' : 'rgba(13,11,9,0.7)';
        lastY = y;
      }), { passive: true });
    }
  }


  /* ══════════════════════════════════
     HERO DIRECTOR — FIXED & SNAPPY
     ══════════════════════════════════ */
  class HeroDirector {
    constructor() {
      this.hero = $('#hero');
      if (!this.hero) return;

      this.video = $('.hero-video', this.hero);
      this.container = $('.hero-container', this.hero);
      this.pill = $('[data-hero-anim="pill"]', this.hero);
      this.eyebrow = $('[data-hero-anim="eyebrow"]', this.hero);
      this.words = $$('[data-hero-anim="word"]', this.hero);
      this.sub = $('[data-hero-anim="sub"]', this.hero);
      this.rule = $('[data-hero-anim="rule"]', this.hero);
      this.ctas = $('[data-hero-anim="ctas"]', this.hero);
      this.scroll = $('[data-hero-anim="scroll"]', this.hero);
      this.socials = $('[data-hero-anim="socials"]', this.hero);
      this.played = false;
      this.heroH = 0;

      this._init();
    }

    _init() {
      // Cache hero height
      this.heroH = this.hero.offsetHeight;

      // Fix: video plays ONCE, no loop
      if (this.video) {
        this.video.loop = false;
        this.video.removeAttribute('loop');
        // When video ends, hold on last frame (poster stays via CSS)
        this.video.addEventListener('ended', () => {
          this.video.pause();
          // Keep last frame visible — no action needed
        }, { once: true });
      }

      // Entrance animation — syncs with preloader exit
      const delay = $('#preloader') ? 2900 : 200;
      setTimeout(() => this._play(), delay);

      // Parallax scroll — ONLY when hero is in view
      this._scrollHandler = rafThrottle(() => this._onScroll());
      window.addEventListener('scroll', this._scrollHandler, { passive: true });

      // Scroll indicator click
      if (this.scroll) {
        this.scroll.addEventListener('click', () => {
          const next = this.hero.nextElementSibling;
          if (next) window.scrollTo({ top: next.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
        });
      }

      // Video visibility optimization
      this._initVideoObserver();

      // Scroll indicator hide
      this._initScrollHide();
    }

    _play() {
      if (this.played) return;
      this.played = true;

      const show = (el, delay) => {
        if (el) setTimeout(() => el.classList.add('is-visible'), delay);
      };

      show(this.pill, 0);
      show(this.eyebrow, 200);

      // Words — staggered
      setTimeout(() => {
        this.words.forEach((w, i) => setTimeout(() => w.classList.add('is-visible'), i * 150));
      }, 400);

      show(this.sub, 900);
      show(this.rule, 1200);
      show(this.ctas, 1500);
      show(this.scroll, 1800);
      show(this.socials, 1800);
    }

    _onScroll() {
      const y = window.scrollY;
      // CRITICAL FIX: Only apply parallax within hero bounds
      // Stop all transforms once scrolled past hero
      if (y > this.heroH) {
        if (this.container) {
          this.container.style.opacity = '0';
          this.container.style.willChange = 'auto';
        }
        return;
      }

      const p = y / this.heroH;

      if (this.container) {
        this.container.style.willChange = 'transform, opacity';
        this.container.style.transform = `translate3d(0, -${p * 60}px, 0)`;
        this.container.style.opacity = Math.max(1 - p * 1.5, 0);
      }
      if (this.video) {
        this.video.style.transform = `scale(${1 + p * 0.06})`;
      }
    }

    _initVideoObserver() {
      if (!this.video) return;
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            if (this.video.paused && !this.video.ended) this.video.play().catch(() => {});
          } else {
            this.video.pause();
          }
        });
      }, { threshold: 0.05 }).observe(this.hero);
    }

    _initScrollHide() {
      if (!this.scroll) return;
      let hidden = false;
      window.addEventListener('scroll', rafThrottle(() => {
        const y = window.scrollY;
        if (!hidden && y > 80) {
          this.scroll.style.opacity = '0';
          this.scroll.style.pointerEvents = 'none';
          hidden = true;
        } else if (hidden && y <= 80) {
          this.scroll.style.opacity = '1';
          this.scroll.style.pointerEvents = 'auto';
          hidden = false;
        }
      }), { passive: true });
    }
  }


  /* ══════════════════════════════════
     HERO TEXT SHIMMER — FIXED (no glitch)
     ══════════════════════════════════ */
  class HeroTextShimmer {
    constructor() {
      this.el = $('.hero-title__word--accent');
      if (!this.el || isMobile()) return;

      // Inject keyframes once
      if (!$('#heroTitleShimmerKF')) {
        const s = document.createElement('style');
        s.id = 'heroTitleShimmerKF';
        s.textContent = `@keyframes heroTitleShimmer{0%{background-position:200% center}100%{background-position:-200% center}}`;
        document.head.appendChild(s);
      }

      // FIX: Use a stable hover that doesn't affect layout or cause re-flow
      // Only animate background-position, never transform or size on the text itself
      this.el.addEventListener('mouseenter', () => {
        this.el.style.backgroundSize = '200% auto';
        this.el.style.animation = 'heroTitleShimmer 2.5s ease infinite';
      });
      this.el.addEventListener('mouseleave', () => {
        // Gracefully remove without layout shift
        this.el.style.animation = 'none';
        // Force reflow then clear so next hover works
        void this.el.offsetHeight;
        this.el.style.animation = '';
        this.el.style.backgroundSize = '';
      });
    }
  }


  /* ══════════════════════════════════
     HERO MAGNETIC BUTTONS
     ══════════════════════════════════ */
  class HeroMagneticButtons {
    constructor() {
      if (!isDesktop() || prefersReduced) return;
      $$('.hero-btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
          const r = btn.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width / 2) * 0.12;
          const y = (e.clientY - r.top - r.height / 2) * 0.15;
          btn.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
        });
      });
    }
  }


  /* ══════════════════════════════════
     SCROLL REVEALER (generic .reveal)
     ══════════════════════════════════ */
  class ScrollRevealer {
    constructor() {
      const els = $$('.reveal');
      if (!els.length) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            // Stagger siblings
            const siblings = $$('.reveal', e.target.parentElement);
            const idx = siblings.indexOf(e.target);
            setTimeout(() => e.target.classList.add('visible'), idx * 80);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
      els.forEach(el => obs.observe(el));
    }
  }


  /* ══════════════════════════════════
     SMOOTH SCROLL (generic anchors)
     ══════════════════════════════════ */
  class SmoothScroll {
    constructor() {
      $$('a[href^="#"]').forEach(a => {
        if (a.closest('.sidebar') || a.closest('.curtain')) return;
        a.addEventListener('click', e => {
          const href = a.getAttribute('href');
          if (href === '#') return;
          e.preventDefault();
          const target = $(href);
          if (!target) return;
          const off = isMobile() ? 80 : 20;
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
      this.el = $('#backToTop');
      if (!this.el) return;
      window.addEventListener('scroll', rafThrottle(() => {
        this.el.classList.toggle('visible', window.scrollY > 500);
      }), { passive: true });
      this.el.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }


  /* ══════════════════════════════════
     FOOTER — Year + Link Scroll
     ══════════════════════════════════ */
  class Footer {
    constructor() {
      // Dynamic year
      const yearEl = $('#footerYear');
      if (yearEl) yearEl.textContent = new Date().getFullYear();

      // Smooth scroll for footer nav links
      $('.footer__nav-link').forEach(a => {
        a.addEventListener('click', e => {
          const href = a.getAttribute('href');
          if (!href || !href.startsWith('#')) return;
          e.preventDefault();
          const target = $(href);
          if (!target) return;
          const off = isMobile() ? 80 : 20;
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
        });
      });
    }
  }


  /* ══════════════════════════════════
     PARALLAX (Quote Section)
     ══════════════════════════════════ */
  class Parallax {
    constructor() {
      this.el = $('.parallax-bg');
      if (!this.el || isMobile()) return;
      window.addEventListener('scroll', rafThrottle(() => {
        const r = this.el.parentElement.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          this.el.style.transform = `translate3d(0, ${-(r.top * 0.2)}px, 0)`;
        }
      }), { passive: true });
    }
  }


  /* ══════════════════════════════════
     GOLD TRAIL (Cursor)
     ══════════════════════════════════ */
  class GoldTrail {
    constructor() {
      if (!isDesktop() || prefersReduced) return;
      this.mx = 0; this.my = 0; this.tx = 0; this.ty = 0;
      this.dot = document.createElement('div');
      Object.assign(this.dot.style, {
        position: 'fixed', width: '8px', height: '8px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(246,226,122,0.45) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: '9999', opacity: '0',
        mixBlendMode: 'screen', willChange: 'transform',
        transition: 'opacity 0.3s ease',
      });
      document.body.appendChild(this.dot);

      document.addEventListener('mousemove', e => {
        this.mx = e.clientX; this.my = e.clientY;
        this.dot.style.opacity = '1';
      }, { passive: true });
      document.addEventListener('mouseleave', () => { this.dot.style.opacity = '0'; });
      this._loop();
    }

    _loop() {
      this.tx += (this.mx - this.tx) * 0.15;
      this.ty += (this.my - this.ty) * 0.15;
      this.dot.style.transform = `translate3d(${this.tx - 4}px, ${this.ty - 4}px, 0)`;
      raf(() => this._loop());
    }
  }


  /* ══════════════════════════════════
     TILT CARDS
     ══════════════════════════════════ */
  class TiltCards {
    constructor() {
      if (!isDesktop()) return;
      $$('.why-card, .cta-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
      });
    }
  }


  /* ══════════════════════════════════
     DEVICE PARALLAX (Showcase)
     ══════════════════════════════════ */
  class DeviceParallax {
    constructor() {
      this.macbook = $('.device-macbook');
      this.iphone = $('.device-iphone');
      if (!this.macbook || isMobile()) return;
      const section = $('#showcase');
      if (!section) return;

      window.addEventListener('scroll', rafThrottle(() => {
        const r = section.getBoundingClientRect();
        const p = 1 - (r.top / window.innerHeight);
        if (p > 0 && p < 2) {
          const s = (p - 0.5) * 18;
          this.macbook.style.transform = `translate3d(0, ${-s}px, 0)`;
          if (this.iphone) this.iphone.style.transform = `translate3d(0, ${s * 0.5}px, 0)`;
        }
      }), { passive: true });
    }
  }


  /* ══════════════════════════════════════════════════════
     SERVICES SECTION — Tabs + Reveals + Interactions
     ══════════════════════════════════════════════════════ */
  class ServicesSection {
    constructor() {
      this.section = $('#services');
      if (!this.section) return;

      this.tabs = $$('.svc-tab', this.section);
      this.panels = $$('.svc-panel', this.section);
      this.slider = $('.svc-tab__slider', this.section);

      if (!this.tabs.length) return;

      this._initTabs();
      this._initScrollReveal();
      this._initShowcaseParallax();
      this._initItemHover();
      this._positionSlider();
    }

    _initTabs() {
      this.tabs.forEach(tab => tab.addEventListener('click', () => this._activate(tab)));

      const container = $('.svc-tabs', this.section);
      if (container) {
        container.addEventListener('keydown', e => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const cur = this.tabs.findIndex(t => t.classList.contains('is-active'));
            const next = e.key === 'ArrowRight'
              ? (cur + 1) % this.tabs.length
              : (cur - 1 + this.tabs.length) % this.tabs.length;
            this._activate(this.tabs[next]);
            this.tabs[next].focus();
          }
        });
      }

      window.addEventListener('resize', debounce(() => this._positionSlider()));
    }

    _activate(tab) {
      const target = tab.dataset.tab;

      this.tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      this.panels.forEach(p => p.classList.remove('is-active'));

      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const panel = $(`#panel-${target}`);
      if (!panel) return;

      raf(() => {
        panel.classList.add('is-active');
        const items = $$('[data-svc-reveal]', panel);
        items.forEach(item => { item.classList.remove('is-revealed'); item.style.opacity = '0'; });
        setTimeout(() => {
          items.forEach((item, i) => {
            const d = parseInt(item.dataset.delay || i, 10);
            setTimeout(() => { item.classList.add('is-revealed'); item.style.opacity = ''; }, d * 80 + 60);
          });
        }, 30);
      });

      this._positionSlider();

      if (isMobile()) tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    _positionSlider() {
      if (!this.slider) return;
      const active = $('.svc-tab.is-active', this.section);
      if (!active) return;
      const cRect = this.slider.parentElement.getBoundingClientRect();
      const tRect = active.getBoundingClientRect();
      this.slider.style.left = `${tRect.left - cRect.left}px`;
      this.slider.style.width = `${tRect.width}px`;
    }

    _initScrollReveal() {
      const items = $$('[data-svc-reveal]', this.section);
      if (!items.length) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const d = parseInt(e.target.dataset.delay || 0, 10);
            setTimeout(() => e.target.classList.add('is-revealed'), d * 80 + 30);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
      items.forEach(el => obs.observe(el));
    }

    _initShowcaseParallax() {
      if (!isDesktop() || prefersReduced) return;
      $$('.svc-showcase', this.section).forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          const img = $('.svc-showcase__img', card);
          if (img) img.style.transform = `scale(1.05) translate3d(${x * -8}px, ${y * -8}px, 0)`;
          card.style.transform = `perspective(1000px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg)`;
        });
        card.addEventListener('mouseleave', () => {
          const img = $('.svc-showcase__img', card);
          if (img) img.style.transform = '';
          card.style.transform = '';
        });
      });
    }

    _initItemHover() {
      if (isMobile()) return;
      $$('.svc-item', this.section).forEach(item => {
        const price = $('.svc-item__price', item);
        if (!price) return;
        item.addEventListener('mouseenter', () => { price.style.transform = 'scale(1.06)'; });
        item.addEventListener('mouseleave', () => { price.style.transform = ''; });
      });
    }
  }


  /* ══════════════════════════════════════════════════════
     BEFORE & AFTER SLIDERS
     ══════════════════════════════════════════════════════ */
  class BeforeAfterSliders {
    constructor() {
      const sliders = $$('[data-ba-slider]');
      if (!sliders.length) return;
      sliders.forEach(s => this._init(s));
    }

    _init(card) {
      const frame = $('.ba-card__frame', card);
      const after = $('.ba-card__after', card);
      const handle = $('.ba-card__handle', card);
      const glow = $('.ba-card__glow', card);
      if (!frame || !after || !handle) return;

      let dragging = false;

      const setPos = (pct) => {
        const v = Math.max(2, Math.min(98, pct));
        after.style.clipPath = `inset(0 0 0 ${v}%)`;
        handle.style.left = `${v}%`;
        if (glow) glow.style.left = `${v}%`;
      };

      const getPct = (cx) => {
        const r = frame.getBoundingClientRect();
        return ((cx - r.left) / r.width) * 100;
      };

      // Mouse
      frame.addEventListener('mousedown', e => {
        e.preventDefault();
        dragging = true;
        frame.classList.add('is-dragging');
        setPos(getPct(e.clientX));
      });
      window.addEventListener('mousemove', e => {
        if (!dragging) return;
        raf(() => setPos(getPct(e.clientX)));
      });
      window.addEventListener('mouseup', () => {
        if (dragging) { dragging = false; frame.classList.remove('is-dragging'); }
      });

      // Touch
      frame.addEventListener('touchstart', e => {
        dragging = true;
        frame.classList.add('is-dragging');
        setPos(getPct(e.touches[0].clientX));
      }, { passive: true });
      frame.addEventListener('touchmove', e => {
        if (!dragging) return;
        e.preventDefault();
        raf(() => setPos(getPct(e.touches[0].clientX)));
      }, { passive: false });
      frame.addEventListener('touchend', () => {
        dragging = false;
        frame.classList.remove('is-dragging');
      });

      // Click
      frame.addEventListener('click', e => { if (!dragging) setPos(getPct(e.clientX)); });

      // Idle intro wiggle
      this._introWiggle(card, after, handle, glow);
    }

    _introWiggle(card, after, handle, glow) {
      const frame = $('.ba-card__frame', card);
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const allSliders = $$('[data-ba-slider]');
            const idx = allSliders.indexOf(card);
            const from = 30, to = 50, dur = 1000;

            setTimeout(() => {
              after.style.clipPath = `inset(0 0 0 ${from}%)`;
              handle.style.left = `${from}%`;
              let start = null;
              const anim = (ts) => {
                if (!start) start = ts;
                const p = Math.min((ts - start) / dur, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                const v = from + (to - from) * ease;
                after.style.clipPath = `inset(0 0 0 ${v}%)`;
                handle.style.left = `${v}%`;
                if (glow) glow.style.left = `${v}%`;
                if (p < 1) raf(anim);
              };
              raf(anim);
            }, 300 + idx * 200);

            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.25 });
      obs.observe(frame);
    }
  }


  /* ══════════════════════════════════════════════════════
     GALLERY FILTER & MOSAIC
     ══════════════════════════════════════════════════════ */
  class GalleryFilter {
    constructor() {
      this.filters = $$('.gal-filter');
      this.items = $$('.gal-item');
      if (!this.filters.length || !this.items.length) return;
      this.active = 'all';
      this.filters.forEach(f => f.addEventListener('click', () => this._filter(f)));
    }

    _filter(btn) {
      const cat = btn.dataset.filter;
      if (cat === this.active) return;
      this.active = cat;

      this.filters.forEach(f => f.classList.toggle('is-active', f === btn));

      let delay = 0;
      this.items.forEach(item => {
        const show = cat === 'all' || item.dataset.category === cat;
        if (!show) {
          item.classList.add('is-hidden');
          item.style.position = 'absolute';
          item.style.visibility = 'hidden';
        } else {
          item.classList.remove('is-hidden');
          item.style.position = '';
          item.style.visibility = '';
          item.style.opacity = '0';
          item.style.transform = 'translateY(24px) scale(0.96)';
          setTimeout(() => {
            item.style.transition = 'opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out)';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
          }, 40 + delay);
          delay += 60;
        }
      });
    }
  }


  /* ══════════════════════════════════════════════════════
     GALLERY SCROLL REVEAL
     ══════════════════════════════════════════════════════ */
  class GalleryReveal {
    constructor() {
      const items = $$('[data-gal-reveal]');
      if (!items.length) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = $$('[data-gal-reveal]').indexOf(e.target);
            setTimeout(() => e.target.classList.add('is-revealed'), (idx % 3) * 100);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -50px 0px' });
      items.forEach(el => obs.observe(el));
    }
  }


  /* ══════════════════════════════════════════════════════
     GALLERY 3D TILT
     ══════════════════════════════════════════════════════ */
  class GalleryTilt {
    constructor() {
      if (!isDesktop() || prefersReduced) return;
      $$('.gal-item__inner').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
      });
    }
  }


  /* ══════════════════════════════════════════════════════
     GALLERY LIGHTBOX
     ══════════════════════════════════════════════════════ */
  class GalleryLightbox {
    constructor() {
      this.lb = $('#galLightbox');
      if (!this.lb) return;
      this.img = $('.gal-lightbox__img', this.lb);
      this.title = $('.gal-lightbox__title', this.lb);
      this.sub = $('.gal-lightbox__sub', this.lb);

      $$('.gal-item').forEach(item => item.addEventListener('click', () => this._open(item)));

      const closeBtn = $('.gal-lightbox__close', this.lb);
      const backdrop = $('.gal-lightbox__backdrop', this.lb);
      if (closeBtn) closeBtn.addEventListener('click', () => this._close());
      if (backdrop) backdrop.addEventListener('click', () => this._close());
      document.addEventListener('keydown', e => { if (e.key === 'Escape') this._close(); });
    }

    _open(item) {
      const img = $('.gal-item__img', item);
      const t = $('.gal-item__title', item);
      const s = $('.gal-item__sub', item);
      if (img) this.img.src = img.src;
      if (t && this.title) this.title.textContent = t.textContent;
      if (s && this.sub) this.sub.textContent = s.textContent;
      this.lb.classList.add('is-open');
      this.lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    _close() {
      this.lb.classList.remove('is-open');
      this.lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }


  /* ══════════════════════════════════════════════════════
     GALLERY FLOATING PARTICLES
     ══════════════════════════════════════════════════════ */
  class GalleryParticles {
    constructor() {
      const c = $('#galParticles');
      if (!c || isMobile() || prefersReduced) return;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 10; i++) {
        const p = document.createElement('div');
        const sz = Math.random() * 3 + 1;
        const op = Math.random() * 0.25 + 0.1;
        Object.assign(p.style, {
          position: 'absolute', width: `${sz}px`, height: `${sz}px`, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(138,105,20,${op}) 0%, transparent 70%)`,
          left: `${Math.random() * 100}%`, bottom: '-5%',
          animation: `galParticleFloat ${Math.random() * 20 + 18}s linear ${Math.random() * 15}s infinite`,
          pointerEvents: 'none', willChange: 'transform',
        });
        frag.appendChild(p);
      }
      c.appendChild(frag);
    }
  }


  /* ══════════════════════════════════════════════════════
     GALLERY SCROLL PARALLAX (Before/After cards)
     ══════════════════════════════════════════════════════ */
  class GalleryScrollParallax {
    constructor() {
      if (!isDesktop()) return;
      this.cards = $$('.ba-card');
      if (!this.cards.length) return;

      // ONLY run when gallery section is visible
      const section = $('#showcase');
      if (!section) return;

      this.active = false;
      new IntersectionObserver(entries => {
        this.active = entries[0].isIntersecting;
      }, { threshold: 0, rootMargin: '100px 0px' }).observe(section);

      window.addEventListener('scroll', rafThrottle(() => {
        if (!this.active) return;
        const vc = window.innerHeight / 2;
        this.cards.forEach((card, i) => {
          const r = card.getBoundingClientRect();
          const off = (r.top + r.height / 2 - vc) / window.innerHeight;
          card.style.transform = `translate3d(0, ${off * (i % 2 === 0 ? -12 : 12)}px, 0)`;
        });
      }), { passive: true });
    }
  }


  /* ══════════════════════════════════
     APP — BOOT EVERYTHING
     ══════════════════════════════════ */
  function boot() {
    if (!document.body.classList.contains('loaded')) {
      document.body.classList.add('loaded');
    }

    // Core
    new Preloader();
    new SidebarNav();
    new CurtainMenu();

    // Hero
    new HeroDirector();
    new HeroMagneticButtons();
    new HeroTextShimmer();

    // Services
    new ServicesSection();

    // Gallery
    new BeforeAfterSliders();
    new GalleryFilter();
    new GalleryReveal();
    new GalleryTilt();
    new GalleryLightbox();
    new GalleryParticles();
    new GalleryScrollParallax();

    // Page
    new ScrollRevealer();
    new SmoothScroll();
    new BackToTop();
    new Footer();
    new Parallax();
    new GoldTrail();
    new TiltCards();
    new DeviceParallax();

    console.log('%c✦ NYC Panache Salon — Ready', 'color:#CB9B51;font-size:13px;font-weight:bold;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
