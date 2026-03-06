/* ╔══════════════════════════════════════════════════╗
   ║  NYC PANACHE SALON — MASTER JS (Clean Rebuild)   ║
   ║  Zero duplicates · Fast boot · Bug-free           ║
   ╚══════════════════════════════════════════════════╝ */
(() => {
  'use strict';

  // ── Helpers ──
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const raf = requestAnimationFrame.bind(window);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = () => window.innerWidth > 1024;
  const mobile = () => window.innerWidth <= 768;

  function throttleRAF(fn) {
    let busy = false;
    return function (...a) {
      if (busy) return;
      busy = true;
      raf(() => { fn.apply(this, a); busy = false; });
    };
  }

  function debounce(fn, ms = 150) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  /* ═══════════════════════════════════
     FLOATING NAV
     ═══════════════════════════════════ */
  function initFloatingNav() {
    const nav = $('#floatNav');
    if (!nav) return;
    const links = $$('.float-nav__link', nav);
    const sections = [];
    let lastY = 0;

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const sec = $(href);
        if (sec) sections.push({ el: sec, link });
      }
    });

    function onScroll() {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 60);
      if (y > 300 && y > lastY + 8) nav.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 100) nav.classList.remove('is-hidden');
      lastY = y;

      const trigger = y + window.innerHeight * 0.35;
      let active = null;
      for (const { el, link } of sections) {
        if (trigger >= el.offsetTop && trigger < el.offsetTop + el.offsetHeight) active = link;
      }
      links.forEach(l => l.classList.toggle('active', l === active));
    }

    window.addEventListener('scroll', throttleRAF(onScroll), { passive: true });

    links.forEach(l => l.addEventListener('click', e => {
  const href = l.getAttribute('href');
  if (!href || href === '#') return;
  if (!href.startsWith('#')) return;
  e.preventDefault();
  const target = $(href);
  if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
   }));

    onScroll();
  }

  /* ═══════════════════════════════════
     MOBILE MENU
     ═══════════════════════════════════ */
  function initMobileMenu() {
    const burger = $('#navBurger');
    const menu = $('#mobMenu');
    const nav = $('#floatNav');
    const closeBtn = $('#mobMenuClose');
    if (!burger || !menu) return;

    const backdrop = $('.mob-menu__backdrop', menu);
    const links = $$('.mob-menu__link', menu);
    let isOpen = false;
    let animating = false;

    function open() {
      if (animating) return;
      isOpen = true; animating = true;
      burger.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      menu.classList.remove('is-closing');
      menu.classList.add('is-open');
      if (nav) nav.classList.add('is-menu-open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => { animating = false; }, 600);
    }

    function close() {
      if (animating) return;
      isOpen = false; animating = true;
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      menu.classList.add('is-closing');
      if (nav) nav.classList.remove('is-menu-open');
      setTimeout(() => {
        menu.classList.remove('is-open', 'is-closing');
        document.body.style.overflow = '';
        animating = false;
      }, 550);
    }

    burger.addEventListener('click', () => isOpen ? close() : open());
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) close(); });

    links.forEach(l => l.addEventListener('click', e => {
  const href = l.getAttribute('href');
  if (!href || href === '#') return;
  if (!href.startsWith('#')) return;
  e.preventDefault();
  const target = $(href);
  if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
   }));
  }

  /* ═══════════════════════════════════
     HERO
     ═══════════════════════════════════ */
  function initHero() {
    const hero = $('#hero');
    if (!hero) return;

    const video = $('.hero-video', hero);
    const container = $('.hero-container', hero);
    const pill = $('[data-hero-anim="pill"]', hero);
    const eyebrow = $('[data-hero-anim="eyebrow"]', hero);
    const words = $$('[data-hero-anim="word"]', hero);
    const sub = $('[data-hero-anim="sub"]', hero);
    const rule = $('[data-hero-anim="rule"]', hero);
    const ctas = $('[data-hero-anim="ctas"]', hero);
    const scroll = $('[data-hero-anim="scroll"]', hero);
    const socials = $('[data-hero-anim="socials"]', hero);
    let heroH = hero.offsetHeight;

    // ── Video: force loop reliably ──
    if (video) {
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('loop', '');
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');

      // Robust loop fallback
      video.addEventListener('ended', () => {
        video.currentTime = 0;
        video.play().catch(() => {});
      });

      // Start playback
      video.play().catch(() => {});

      // Pause/play on visibility
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      }, { threshold: 0.05 }).observe(hero);
    }

    // ── Entrance animation ──
    function play() {
      const show = (el, delay) => { if (el) setTimeout(() => el.classList.add('is-visible'), delay); };
      show(pill, 100);
      show(eyebrow, 300);
      setTimeout(() => {
        words.forEach((w, i) => setTimeout(() => w.classList.add('is-visible'), i * 140));
      }, 450);
      show(sub, 900);
      show(rule, 1200);
      show(ctas, 1500);
      show(scroll, 1800);
      show(socials, 1800);
    }
    setTimeout(play, 200);

    // ── Parallax scroll ──
    window.addEventListener('scroll', throttleRAF(() => {
      const y = window.scrollY;
      if (y > heroH) {
        if (container) { container.style.opacity = '0'; container.style.willChange = 'auto'; }
        return;
      }
      const p = y / heroH;
      if (container) {
        container.style.willChange = 'transform, opacity';
        container.style.transform = `translate3d(0, -${p * 60}px, 0)`;
        container.style.opacity = String(Math.max(1 - p * 1.5, 0));
      }
      if (video) video.style.transform = `scale(${1 + p * 0.06})`;
    }), { passive: true });

    // ── Scroll indicator ──
    if (scroll) {
      let scrollHidden = false;
      scroll.addEventListener('click', () => {
        const next = hero.nextElementSibling;
        if (next) window.scrollTo({ top: next.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
      });
      window.addEventListener('scroll', throttleRAF(() => {
        const y = window.scrollY;
        if (!scrollHidden && y > 80) { scroll.style.opacity = '0'; scroll.style.pointerEvents = 'none'; scrollHidden = true; }
        else if (scrollHidden && y <= 80) { scroll.style.opacity = '1'; scroll.style.pointerEvents = 'auto'; scrollHidden = false; }
      }), { passive: true });
    }

    window.addEventListener('resize', debounce(() => { heroH = hero.offsetHeight; }));
  }

  /* ═══════════════════════════════════
     HERO MAGNETIC BUTTONS (Desktop)
     ═══════════════════════════════════ */
  function initHeroMagnetic() {
    if (!desktop() || reduced) return;
    $$('.hero-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.12;
        const y = (e.clientY - r.top - r.height / 2) * 0.15;
        btn.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ═══════════════════════════════════
     SCROLL REVEALER
     ═══════════════════════════════════ */
  function initScrollRevealer() {
    const els = $$('.reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const siblings = $$('.reveal', e.target.parentElement);
          const idx = siblings.indexOf(e.target);
          setTimeout(() => e.target.classList.add('visible'), idx * 70);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  }

  /* ═══════════════════════════════════
     SMOOTH SCROLL (non-nav anchors)
     ═══════════════════════════════════ */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(a => {
      if (a.closest('.float-nav') || a.closest('.mob-menu')) return;
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = $(href);
        if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - (mobile() ? 80 : 20), behavior: 'smooth' });
      });
    });
  }

  /* ═══════════════════════════════════
     BACK TO TOP
     ═══════════════════════════════════ */
  function initBackToTop() {
    const btn = $('#backToTop');
    if (!btn) return;
    window.addEventListener('scroll', throttleRAF(() => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ═══════════════════════════════════
     FOOTER
     ═══════════════════════════════════ */
  function initFooter() {
    const yr = $('#footerYear');
    if (yr) yr.textContent = new Date().getFullYear();

    $$('.footer__nav-link').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        e.preventDefault();
        const target = $(href);
        if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - (mobile() ? 80 : 20), behavior: 'smooth' });
      });
    });
  }

  /* ═══════════════════════════════════
     GOLD TRAIL CURSOR (Desktop)
     ═══════════════════════════════════ */
  function initGoldTrail() {
    if (!desktop() || reduced) return;
    let mx = 0, my = 0, tx = 0, ty = 0;
    const dot = document.createElement('div');
    Object.assign(dot.style, {
      position: 'fixed', width: '8px', height: '8px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(246,226,122,0.45) 0%, transparent 70%)',
      pointerEvents: 'none', zIndex: '9999', opacity: '0',
      mixBlendMode: 'screen', willChange: 'transform', transition: 'opacity 0.3s ease',
    });
    document.body.appendChild(dot);
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.opacity = '1'; }, { passive: true });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; });
    (function loop() {
      tx += (mx - tx) * 0.15;
      ty += (my - ty) * 0.15;
      dot.style.transform = `translate3d(${tx - 4}px, ${ty - 4}px, 0)`;
      raf(loop);
    })();
  }

  /* ═══════════════════════════════════
     SERVICES SECTION
     ═══════════════════════════════════ */
  function initServices() {
    const section = $('#services');
    if (!section) return;

    const tabs = $$('.svc-tab', section);
    const panels = $$('.svc-panel', section);
    const slider = $('.svc-tab__slider', section);

    function positionSlider() {
      if (!slider) return;
      const active = $('.svc-tab.is-active', section);
      if (!active) return;
      const cRect = slider.parentElement.getBoundingClientRect();
      const tRect = active.getBoundingClientRect();
      slider.style.left = `${tRect.left - cRect.left}px`;
      slider.style.width = `${tRect.width}px`;
    }

    function activate(tab) {
      const target = tab.dataset.tab;
      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('is-active'));
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
      positionSlider();
      if (mobile()) tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    tabs.forEach(tab => tab.addEventListener('click', () => activate(tab)));
    window.addEventListener('resize', debounce(positionSlider));
    positionSlider();

    // Keyboard nav
    const tabContainer = $('.svc-tabs', section);
    if (tabContainer) {
      tabContainer.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const cur = tabs.findIndex(t => t.classList.contains('is-active'));
          const next = e.key === 'ArrowRight' ? (cur + 1) % tabs.length : (cur - 1 + tabs.length) % tabs.length;
          activate(tabs[next]);
          tabs[next].focus();
        }
      });
    }

    // Scroll reveal for service items
    const items = $$('[data-svc-reveal]', section);
    if (items.length) {
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

    // Showcase parallax (desktop)
    if (desktop() && !reduced) {
      $$('.svc-showcase', section).forEach(card => {
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
  }

  /* ═══════════════════════════════════
     BEFORE & AFTER SLIDERS
     ═══════════════════════════════════ */
  function initBeforeAfter() {
    const allSliders = $$('[data-ba-slider]');
    allSliders.forEach((card, cardIdx) => {
      const frame = $('.ba-card__frame', card);
      const after = $('.ba-card__after', card);
      const handle = $('.ba-card__handle', card);
      const glow = $('.ba-card__glow', card);
      if (!frame || !after || !handle) return;

      let dragging = false;

      const setPos = pct => {
        const v = Math.max(2, Math.min(98, pct));
        after.style.clipPath = `inset(0 0 0 ${v}%)`;
        handle.style.left = `${v}%`;
        if (glow) glow.style.left = `${v}%`;
      };

      const getPct = cx => {
        const r = frame.getBoundingClientRect();
        return ((cx - r.left) / r.width) * 100;
      };

      frame.addEventListener('mousedown', e => { e.preventDefault(); dragging = true; frame.classList.add('is-dragging'); setPos(getPct(e.clientX)); });
      window.addEventListener('mousemove', e => { if (dragging) raf(() => setPos(getPct(e.clientX))); });
      window.addEventListener('mouseup', () => { if (dragging) { dragging = false; frame.classList.remove('is-dragging'); } });
      frame.addEventListener('touchstart', e => { dragging = true; frame.classList.add('is-dragging'); setPos(getPct(e.touches[0].clientX)); }, { passive: true });
      frame.addEventListener('touchmove', e => { if (!dragging) return; e.preventDefault(); raf(() => setPos(getPct(e.touches[0].clientX))); }, { passive: false });
      frame.addEventListener('touchend', () => { dragging = false; frame.classList.remove('is-dragging'); });
      frame.addEventListener('click', e => { if (!dragging) setPos(getPct(e.clientX)); });

      // Intro animation
      new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const from = 30, to = 50, dur = 1000;
            setTimeout(() => {
              let start = null;
              const anim = ts => {
                if (!start) start = ts;
                const p = Math.min((ts - start) / dur, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                setPos(from + (to - from) * ease);
                if (p < 1) raf(anim);
              };
              raf(anim);
            }, 300 + cardIdx * 200);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.25 }).observe(frame);
    });
  }

  /* ═══════════════════════════════════
     GALLERY FILTER
     ═══════════════════════════════════ */
  function initGalleryFilter() {
    const filters = $$('.gal-filter');
    const items = $$('.gal-item');
    if (!filters.length || !items.length) return;
    let active = 'all';

    filters.forEach(f => f.addEventListener('click', () => {
      const cat = f.dataset.filter;
      if (cat === active) return;
      active = cat;
      filters.forEach(b => b.classList.toggle('is-active', b === f));
      let delay = 0;
      items.forEach(item => {
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
    }));
  }

  /* ═══════════════════════════════════
     GALLERY REVEAL
     ═══════════════════════════════════ */
  function initGalleryReveal() {
    const items = $$('[data-gal-reveal]');
    if (!items.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = items.indexOf(e.target);
          setTimeout(() => e.target.classList.add('is-revealed'), (idx % 3) * 100);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -50px 0px' });
    items.forEach(el => obs.observe(el));
  }

  /* ═══════════════════════════════════
     GALLERY TILT (Desktop)
     ═══════════════════════════════════ */
  function initGalleryTilt() {
    if (!desktop() || reduced) return;
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

  /* ═══════════════════════════════════
     GALLERY LIGHTBOX
     ═══════════════════════════════════ */
  function initLightbox() {
    const lb = $('#galLightbox');
    if (!lb) return;
    const img = $('.gal-lightbox__img', lb);
    const title = $('.gal-lightbox__title', lb);
    const closeBtn = $('.gal-lightbox__close', lb);
    const backdrop = $('.gal-lightbox__backdrop', lb);

    function open(item) {
      const srcImg = $('.gal-item__img', item);
      const srcTitle = $('.gal-item__title', item);
      if (srcImg) img.src = srcImg.src;
      if (srcTitle && title) title.textContent = srcTitle.textContent;
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    $$('.gal-item').forEach(item => item.addEventListener('click', () => open(item)));
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ═══════════════════════════════════
     FAQ ACCORDION
     ═══════════════════════════════════ */
  function initFAQ() {
    const items = $$('[data-faq]');
    if (!items.length) return;
    items.forEach(item => {
      const btn = $('.faq__question', item);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        items.forEach(i => {
          i.classList.remove('is-open');
          const q = $('.faq__question', i);
          if (q) q.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ═══════════════════════════════════
     WAXING ITEMS REVEAL
     ═══════════════════════════════════ */
  function initWaxingReveal() {
    const items = $$('.waxing__item');
    if (!items.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const siblings = $$('.waxing__item', e.target.parentElement);
          const idx = siblings.indexOf(e.target);
          setTimeout(() => {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateX(0)';
          }, idx * 50);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-15px)';
      item.style.transition = 'opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)';
      obs.observe(item);
    });
  }

  /* ═══════════════════════════════════
     REVIEWS STAGGER
     ═══════════════════════════════════ */
  function initReviewsStagger() {
    const cards = $$('.reviews__card');
    if (!cards.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = cards.indexOf(e.target);
          setTimeout(() => {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
          }, idx * 120);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.8s var(--ease-out), transform 0.8s var(--ease-out)';
      obs.observe(card);
    });
  }

  /* ═══════════════════════════════════
     COUNTER ANIMATION (About badge)
     ═══════════════════════════════════ */
  function initCounter() {
    const badge = $('.about__badge-number');
    if (!badge || reduced) return;
    let animated = false;
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !animated) {
          animated = true;
          const target = 25, dur = 1500;
          let start = null;
          const step = ts => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            badge.innerHTML = `${Math.round(ease * target)}<sup>+</sup>`;
            if (p < 1) raf(step);
          };
          raf(step);
        }
      });
    }, { threshold: 0.5 }).observe(badge);
  }

  /* ═══════════════════════════════════
     ACTIVE HOUR INDICATOR
     ═══════════════════════════════════ */
  function initActiveHours() {
    const rows = $$('.contact-hours__row');
    if (!rows.length) return;
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    rows.forEach(row => {
      const dayEl = $('.contact-hours__day', row);
      const timeEl = $('.contact-hours__time', row);
      if (!dayEl || !timeEl) return;
      const dayText = dayEl.textContent;
      let isToday = false;

      if (dayText.includes('Mon') && day === 1) isToday = true;
      else if (dayText.includes('Tue') && day >= 2 && day <= 6) isToday = true;
      else if (dayText.includes('Sun') && day === 0) isToday = true;

      if (isToday) {
        row.style.fontWeight = '600';
        const closed = timeEl.textContent.toLowerCase().includes('closed');
        if (!closed) {
          const isOpen = (day >= 2 && day <= 6 && hour >= 10 && hour < 19) ||
                         (day === 0 && hour >= 10 && hour < 17);
          if (isOpen) {
            timeEl.insertAdjacentHTML('beforeend', ' <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#4CAF50;margin-left:6px;vertical-align:middle;animation:heroDotPulse 2s ease-in-out infinite"></span>');
          }
        }
      }
    });
  }

  /* ═══════════════════════════════════
     BOOT — Single entry point
     ═══════════════════════════════════ */
  function boot() {
    document.body.classList.add('loaded');

    // Core navigation
    initFloatingNav();
    initMobileMenu();

    // Hero
    initHero();
    initHeroMagnetic();

    // Services
    initServices();

    // Gallery
    initBeforeAfter();
    initGalleryFilter();
    initGalleryReveal();
    initGalleryTilt();
    initLightbox();

    // Sections
    initFAQ();
    initWaxingReveal();
    initReviewsStagger();

    // Page-wide
    initScrollRevealer();
    initSmoothScroll();
    initBackToTop();
    initFooter();
    initGoldTrail();

    // Deferred (non-critical)
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        initCounter();
        initActiveHours();
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        initCounter();
        initActiveHours();
      }, 1500);
    }

    console.log('%c✦ NYC Panache Salon — Ready', 'color:#CB9B51;font-size:13px;font-weight:bold;');
  }

  // ── Start ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
