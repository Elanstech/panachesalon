// Google Ads conversion events for nycpanachesalon.com
// Needs the Google tag (AW-17560295562) loaded in <head> of every page.
// 1) "Booking click"   - a click on any Vagaro "Book" link
// 2) "Site call click" - a tap/click on the salon number (718) 575-0532
// Each fires once per page view. No personal data is sent: only the Google conversion label.
(function () {
  var BOOK_LABEL = 'AW-17560295562/-bZTCNaLsLIdEIqxs7VB';
  var CALL_LABEL = 'AW-17560295562/BVt0CI-dqLIdEIqxs7VB';
  var sent = {};

  function report(label) {
    if (sent[label] || typeof window.gtag !== 'function') return;
    sent[label] = true;
    try { window.gtag('event', 'conversion', { send_to: label, transport_type: 'beacon' }); } catch (e) {}
  }

  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^tel:/i.test(href) && /7185750532/.test(href.replace(/\D/g, ''))) report(CALL_LABEL);
    else if (/vagaro\.com\/nycpanache/i.test(href)) report(BOOK_LABEL);
  }, true);
})();
