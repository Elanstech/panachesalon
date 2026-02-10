/* ============================================
   NYC PANACHE SALON — MASTER JAVASCRIPT
   Apple-smooth animations & interactions
   ============================================ */

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

class HeroAnimator {
  constructor() {
    this.els = document.querySelectorAll('.anim-hero');
    if (!this.els.length) return;
    // Trigger after preloader
    setTimeout(() => this.reveal(), 2200);
  }
  reveal() {
    this.els.forEach(el => {
      const d = parseInt(el.dataset.d || 0) * 150;
      setTimeout(() => el.classList.add('visible'), d);
    });
  }
}

class ScrollRevealer {
  constructor() {
    this.els = document.querySelectorAll('.reveal');
    if (!this.els.length) return;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // Stagger siblings
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
    // Re-trigger reveal animations inside panel
    const reveals = panel.querySelectorAll('.reveal');
    reveals.forEach((el, i) => {
      el.classList.remove('visible');
      setTimeout(() => el.classList.add('visible'), 80 * i);
    });
  }
}

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

class HeroScroll {
  constructor() {
    this.el = document.getElementById('heroScroll');
    if (!this.el) return;
    window.addEventListener('scroll', () => {
      const gone = window.scrollY > 200;
      this.el.style.opacity = gone ? '0' : '1';
      this.el.style.pointerEvents = gone ? 'none' : 'auto';
    }, { passive: true });
  }
}

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

/* ============================================
   BOOT
   ============================================ */
class App {
  constructor() {
    document.addEventListener('DOMContentLoaded', () => this.boot());
  }
  boot() {
    new Preloader();
    new Header();
    new MobileMenu();
    new HeroAnimator();
    new ScrollRevealer();
    new ServiceTabs();
    new SmoothScroll();
    new ActiveNav();
    new BackToTop();
    new HeroScroll();
    new Parallax();
    new GoldTrail();
    new TiltCards();
    new DeviceParallax();
    console.log('%c✦ NYC Panache Salon — Loaded', 'color:#CB9B51;font-size:14px;font-weight:bold;');
  }
}

new App();
