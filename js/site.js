// NYC Panache Salon — site behavior (one file for every page)
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- Mobile menu ---- */
  var menu = $('#menu'), burger = $('#burger');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('menu-open', open);
    if (open) { var c = $('#menuClose'); if (c) c.focus(); } else { burger.focus(); }
  }
  if (menu && burger) {
    burger.addEventListener('click', function () { setMenu(true); });
    $('#menuClose').addEventListener('click', function () { setMenu(false); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('is-open'); document.body.classList.remove('menu-open'); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* ---- Hours: "Open now" line + today's row (New York time) ---- */
  // Mon closed · Tue–Sat 10–7 · Sun 10–5   (index = day: 0 Sun … 6 Sat)
  var HOURS = { 0: [10, 17], 1: null, 2: [10, 19], 3: [10, 19], 4: [10, 19], 5: [10, 19], 6: [10, 19] };
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function fmt(h) { return (h % 12 || 12) + (h < 12 ? ' AM' : ' PM'); }
  function nyNow() {
    try {
      var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { day: DAYS.indexOf(o.weekday), mins: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) { return null; }
  }
  function openLine() {
    var n = nyNow(); if (!n || n.day < 0) return;
    $$('[data-day]').forEach(function (tr) { tr.classList.toggle('is-today', parseInt(tr.getAttribute('data-day'), 10) === n.day); });
    var els = $$('[data-open-status]'); if (!els.length) return;
    var today = HOURS[n.day], html = '', open = false;
    if (today && n.mins >= today[0] * 60 && n.mins < today[1] * 60) {
      open = true;
      html = '<strong>Open now</strong> until ' + fmt(today[1]) + '. Call for same-day availability.';
    } else if (today && n.mins < today[0] * 60) {
      html = '<strong>Opens today at ' + fmt(today[0]) + '.</strong> Book online anytime.';
    } else {
      for (var i = 1; i <= 7; i++) {
        var d = (n.day + i) % 7;
        if (HOURS[d]) { html = '<strong>Closed now.</strong> Opens ' + (i === 1 ? 'tomorrow' : DAYS[d]) + ' at ' + fmt(HOURS[d][0]) + '. Book online anytime.'; break; }
      }
    }
    els.forEach(function (el) {
      el.classList.toggle('is-open', open);
      el.innerHTML = '<span class="open__dot" aria-hidden="true"></span><span>' + html + '</span>';
    });
  }
  openLine();
  setInterval(openLine, 60000);

  /* ---- Sticky Call / Book bar on phones ---- */
  var bar = $('#bar');
  if (bar && 'IntersectionObserver' in window) {
    var topCtas = $('[data-top-ctas]'), foot = $('.footer');
    var past = false, atFoot = false;
    var upd = function () { bar.classList.toggle('is-on', past && !atFoot); };
    if (topCtas) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { past = !e.isIntersecting && e.boundingClientRect.top < 0; }); upd(); }).observe(topCtas);
    } else {
      window.addEventListener('scroll', function () { past = window.scrollY > 300; upd(); }, { passive: true });
    }
    if (foot) new IntersectionObserver(function (es) { es.forEach(function (e) { atFoot = e.isIntersecting; }); upd(); }, { rootMargin: '0px 0px -80px 0px' }).observe(foot);
  }

  /* ---- Hero video: load after the page is ready, small file on phones ---- */
  var vid = $('#heroVideo');
  if (vid) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var saveData = navigator.connection && navigator.connection.saveData;
    if (!reduce && !saveData) {
      var start = function () {
        vid.src = window.innerWidth <= 760 ? vid.getAttribute('data-src-mobile') : vid.getAttribute('data-src');
        vid.addEventListener('playing', function () { vid.classList.add('is-playing'); }, { once: true });
        var p = vid.play(); if (p && p.catch) p.catch(function () {});
      };
      if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
    }
  }

  /* ---- Before / after sliders ---- */
  $$('.ba').forEach(function (ba) {
    var r = $('input[type="range"]', ba);
    if (r) r.addEventListener('input', function () { ba.style.setProperty('--pos', r.value + '%'); });
  });
  // Home: switch between transformations
  var pick = $('#baPick'), main = $('#baMain');
  if (pick && main) {
    var imgs = $$('img', main), cap = $('#baCap');
    $$('button', pick).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', pick).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        imgs[0].src = b.getAttribute('data-after'); imgs[0].alt = b.getAttribute('data-after-alt');
        imgs[1].src = b.getAttribute('data-before'); imgs[1].alt = b.getAttribute('data-before-alt');
        var r = $('input', main); r.value = 50; main.style.setProperty('--pos', '50%');
        if (cap) cap.textContent = b.getAttribute('data-cap');
      });
    });
  }

  /* ---- Tabs: highlight the section in view ---- */
  var tabLinks = $$('.tabs a[href^="#"]');
  if (tabLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tabLinks.forEach(function (a) { var id = a.getAttribute('href').slice(1); (map[id] = map[id] || []).push(a); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        tabLinks.forEach(function (a) { a.classList.remove('is-active'); });
        (map[e.target.id] || []).forEach(function (a) {
          a.classList.add('is-active');
          var ul = a.closest('ul');
          if (ul && ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: a.offsetLeft - ul.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' });
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---- Gallery lightbox ---- */
  var tiles = $$('[data-full]');
  if (tiles.length) {
    var lb = document.createElement('div');
    lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = '<button class="lb__close" aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<button class="lb__prev" aria-label="Previous photo"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>' +
      '<img alt="" /><p class="lb__cap"></p>' +
      '<button class="lb__next" aria-label="Next photo"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>';
    document.body.appendChild(lb);
    var lbImg = $('img', lb), lbCap = $('.lb__cap', lb), idx = 0, last = null;
    var show = function (i) {
      idx = (i + tiles.length) % tiles.length;
      var t = tiles[idx], im = $('img', t);
      lbImg.src = t.getAttribute('data-full'); lbImg.alt = im ? im.alt : '';
      lbCap.textContent = t.getAttribute('data-cap') || '';
    };
    var close = function () { lb.classList.remove('is-open'); document.body.classList.remove('menu-open'); if (last) last.focus(); };
    tiles.forEach(function (t, i) { t.addEventListener('click', function () { last = t; show(i); lb.classList.add('is-open'); document.body.classList.add('menu-open'); $('.lb__close', lb).focus(); }); });
    $('.lb__close', lb).addEventListener('click', close);
    $('.lb__prev', lb).addEventListener('click', function () { show(idx - 1); });
    $('.lb__next', lb).addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(idx - 1); else if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---- Footer year ---- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
