/* ============================================
   NYC PANACHE SALON — MASTER JAVASCRIPT
   ES6 Class Architecture
   ============================================ */

class Preloader {
  constructor(el) {
    this.el = el;
    this.init();
  }

  init() {
    window.addEventListener('load', () => {
      setTimeout(() => this.hide(), 1800);
    });
    // Fallback
    setTimeout(() => this.hide(), 3500);
  }

  hide() {
    this.el.classList.add('loaded');
  }
}


class Header {
  constructor(el) {
    this.el = el;
    this.lastScroll = 0;
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.onScroll();
  }

  onScroll() {
    const y = window.scrollY;
    this.el.classList.toggle('scrolled', y > 60);
    this.lastScroll = y;
  }
}


class MobileMenu {
  constructor(hamburgerEl, menuEl) {
    this.hamburger = hamburgerEl;
    this.menu = menuEl;
    this.links = menuEl.querySelectorAll('.mobile-nav-link, .mobile-cta-btn');
    this.isOpen = false;
    this.init();
  }

  init() {
    this.hamburger.addEventListener('click', () => this.toggle());
    this.links.forEach(link => {
      link.addEventListener('click', () => this.close());
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.hamburger.classList.toggle('active', this.isOpen);
    this.menu.classList.toggle('open', this.isOpen);
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }

  close() {
    this.isOpen = false;
    this.hamburger.classList.remove('active');
    this.menu.classList.remove('open');
    document.body.style.overflow = '';
  }
}


class ServiceTabs {
  constructor(containerSelector) {
    this.tabs = document.querySelectorAll(`${containerSelector} .service-tab`);
    this.panels = document.querySelectorAll('.service-panel');
    this.init();
  }

  init() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.activate(tab));
    });
  }

  activate(tab) {
    const target = tab.dataset.tab;

    this.tabs.forEach(t => t.classList.remove('active'));
    this.panels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const panel = document.getElementById(`panel-${target}`);
    if (!panel) return;

    panel.classList.add('active');
    this.revealPanelChildren(panel);
  }

  revealPanelChildren(panel) {
    const els = panel.querySelectorAll('.reveal-el');
    els.forEach((el, i) => {
      el.classList.remove('revealed');
      setTimeout(() => el.classList.add('revealed'), 80 * i);
    });
  }
}


class ScrollRevealer {
  constructor(selector, options = {}) {
    this.elements = document.querySelectorAll(selector);
    this.options = {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px 0px -60px 0px',
    };
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, this.options);

    this.elements.forEach(el => observer.observe(el));
  }
}


class SmoothScroll {
  constructor(headerEl) {
    this.headerEl = headerEl;
    this.init();
  }

  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => this.handleClick(e, anchor));
    });
  }

  handleClick(e, anchor) {
    const href = anchor.getAttribute('href');
    if (href === '#') return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;

    const offset = this.headerEl.offsetHeight + 20;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}


class ActiveNavHighlight {
  constructor(sectionSelector, linkSelector) {
    this.sections = document.querySelectorAll(sectionSelector);
    this.links = document.querySelectorAll(linkSelector);
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
  }

  update() {
    const scrollPos = window.scrollY + 150;

    this.sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        this.links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }
}


class BackToTop {
  constructor(el) {
    this.el = el;
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.toggle(), { passive: true });
    this.el.addEventListener('click', () => this.scrollTop());
  }

  toggle() {
    this.el.classList.toggle('visible', window.scrollY > 600);
  }

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}


class HeroVideo {
  constructor(videoEl) {
    this.video = videoEl;
    if (this.video) this.init();
  }

  init() {
    this.video.addEventListener('error', () => this.fallbackToPoster());
  }

  fallbackToPoster() {
    this.video.style.display = 'none';
    const wrap = this.video.closest('.hero-video-wrap');
    if (!wrap) return;

    const poster = this.video.getAttribute('poster')
      || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80';

    Object.assign(wrap.style, {
      backgroundImage: `url(${poster})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    });
  }
}


class ScrollIndicator {
  constructor(el) {
    this.el = el;
    if (this.el) this.init();
  }

  init() {
    window.addEventListener('scroll', () => {
      const hidden = window.scrollY > 200;
      this.el.style.opacity = hidden ? '0' : '1';
      this.el.style.pointerEvents = hidden ? 'none' : 'auto';
    }, { passive: true });
  }
}


class Parallax {
  constructor(el) {
    this.el = el;
    this.speed = 0.3;
    if (this.el && window.innerWidth > 768) this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
  }

  update() {
    const section = this.el.parentElement;
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      this.el.style.transform = `translateY(${-(rect.top * this.speed)}px)`;
    }
  }
}


class GoldCursorTrail {
  constructor() {
    this.mouseX = 0;
    this.mouseY = 0;
    this.trailX = 0;
    this.trailY = 0;
    this.trail = null;

    const isDesktop = window.innerWidth > 1024;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isDesktop && !prefersReducedMotion) this.init();
  }

  init() {
    this.trail = document.createElement('div');
    this.trail.style.cssText = `
      position: fixed;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(246,226,122,0.6) 0%, transparent 70%);
      pointer-events: none;
      z-index: 9999;
      transition: transform 0.15s ease-out, opacity 0.3s ease;
      opacity: 0;
      mix-blend-mode: screen;
    `;
    document.body.appendChild(this.trail);

    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.trail.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
      this.trail.style.opacity = '0';
    });

    this.animate();
  }

  animate() {
    this.trailX += (this.mouseX - this.trailX) * 0.15;
    this.trailY += (this.mouseY - this.trailY) * 0.15;
    this.trail.style.left = `${this.trailX - 4}px`;
    this.trail.style.top = `${this.trailY - 4}px`;
    requestAnimationFrame(() => this.animate());
  }
}


/* ============================================
   MAIN APP — Bootstraps Everything
   ============================================ */

class App {
  constructor() {
    this.modules = {};
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => this.boot());
  }

  boot() {
    // Core UI
    this.modules.preloader       = new Preloader(document.getElementById('preloader'));
    this.modules.header          = new Header(document.getElementById('header'));
    this.modules.mobileMenu      = new MobileMenu(
      document.getElementById('hamburger'),
      document.getElementById('mobileMenu')
    );
    this.modules.backToTop       = new BackToTop(document.getElementById('backToTop'));

    // Hero
    this.modules.heroVideo       = new HeroVideo(document.getElementById('heroVideo'));
    this.modules.scrollIndicator = new ScrollIndicator(document.getElementById('scrollIndicator'));

    // Content
    this.modules.serviceTabs     = new ServiceTabs('#serviceTabs');
    this.modules.scrollRevealer  = new ScrollRevealer('.reveal-el');
    this.modules.parallax        = new Parallax(document.querySelector('.parallax-img'));

    // Navigation
    this.modules.smoothScroll    = new SmoothScroll(document.getElementById('header'));
    this.modules.activeNav       = new ActiveNavHighlight('section[id]', '.nav-link');

    // Effects
    this.modules.cursorTrail     = new GoldCursorTrail();

    console.log('%c✦ NYC Panache Salon — Loaded', 'color:#CB9B51; font-size:14px; font-weight:bold;');
  }
}

// Launch
const app = new App();
