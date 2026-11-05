// Google Ads conversion events for nycpanachesalon.com
// Needs the Google tag (AW-17560295562) loaded in <head> of every page.
// 1) "Booking click"   - a click on any Vagaro "Book" link
// 2) "Site call click" - a tap/click on the salon number (718) 575-0532
// 3) "Contact form"    - the contact form on /contact/ was sent successfully
// Each fires once per page view. No personal data is sent: only the Google conversion label.
(function () {
  var BOOK_LABEL = 'AW-17560295562/-bZTCNaLsLIdEIqxs7VB';
  var CALL_LABEL = 'AW-17560295562/BVt0CI-dqLIdEIqxs7VB';
  // Paste the label of the "Contact form" conversion action here once it exists in Google Ads
  // (format: 'AW-17560295562/xxxxxxxxxxxx'). Until then form sends are not reported.
  var FORM_LABEL = '';
  var sent = {};

  function report(label) {
    if (!label || sent[label] || typeof window.gtag !== 'function') return;
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

  // Contact form: the form widget swaps in a "successfully sent" message when a message goes through.
  var box = document.querySelector('[data-contact-form]');
  if (box && 'MutationObserver' in window) {
    var mo = new MutationObserver(function () {
      if (/successfully sent/i.test(box.textContent || '')) { report(FORM_LABEL); mo.disconnect(); }
    });
    mo.observe(box, { childList: true, subtree: true, characterData: true });
  }
})();
