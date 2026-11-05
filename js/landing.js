// Service landing pages: live "open now" line (New York time) + sticky Call/Book bar on phones.
(function () {
  'use strict';
  // Hours: Mon closed · Tue–Sat 10–7 · Sun 10–5   (index = getDay(): 0 Sun … 6 Sat)
  var HOURS = { 0: [10, 17], 1: null, 2: [10, 19], 3: [10, 19], 4: [10, 19], 5: [10, 19], 6: [10, 19] };
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function fmt(h) { return (h % 12 || 12) + (h < 12 ? ' AM' : ' PM'); }

  function nyNow() {
    try {
      var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false })
        .formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { day: DAYS.indexOf(o.weekday), mins: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) { return null; }
  }

  function openLine() {
    var els = document.querySelectorAll('[data-open-status]');
    if (!els.length) return;
    var n = nyNow(); if (!n || n.day < 0) return;
    var today = HOURS[n.day], html, open = false;
    if (today && n.mins >= today[0] * 60 && n.mins < today[1] * 60) {
      open = true;
      html = '<strong>Open now</strong> · until ' + fmt(today[1]) + ' — call for same-day availability';
    } else if (today && n.mins < today[0] * 60) {
      html = '<strong>Opens today at ' + fmt(today[0]) + '</strong> · book online anytime';
    } else {
      for (var i = 1; i <= 7; i++) {
        var d = (n.day + i) % 7;
        if (HOURS[d]) { html = '<strong>Closed now</strong> · opens ' + (i === 1 ? 'tomorrow' : DAYS[d]) + ' at ' + fmt(HOURS[d][0]) + ' · book online anytime'; break; }
      }
    }
    els.forEach(function (el) {
      el.classList.toggle('is-open', open);
      el.innerHTML = '<span class="lp-open__dot" aria-hidden="true"></span><span>' + html + '</span>';
    });
  }

  function stickyBar() {
    var bar = document.querySelector('.lp-sticky');
    var hero = document.querySelector('.lp-hero .lp-ctas');
    var end = document.querySelector('.lp-visit .lp-ctas');
    if (!bar || !hero || !('IntersectionObserver' in window)) return;
    document.body.classList.add('lp-has-sticky');
    var heroGone = false, endSeen = false;
    function upd() { bar.classList.toggle('is-on', heroGone && !endSeen); }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { heroGone = !e.isIntersecting && e.boundingClientRect.top < 0; }); upd();
    }).observe(hero);
    if (end) new IntersectionObserver(function (es) {
      es.forEach(function (e) { endSeen = e.isIntersecting; }); upd();
    }).observe(end);
  }

  openLine();
  setInterval(openLine, 60000);
  stickyBar();
})();
