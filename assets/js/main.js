/* ============================================================
   MAYUR ABHARAN — interactions
   Vanilla JS. No dependencies.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- 2. Nav: stuck state ---------- */
  var nav = document.getElementById('nav');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      nav.classList.toggle('is-stuck', window.scrollY > 24);
      sweep();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. Mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  var lastFocus = null;

  function openMenu() {
    lastFocus = document.activeElement;
    menu.hidden = false;
    requestAnimationFrame(function () { menu.classList.add('is-open'); });
    nav.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    var first = menu.querySelector('a');
    if (first) first.focus();
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    window.setTimeout(function () { menu.hidden = true; }, reduced ? 0 : 280);
    if (lastFocus) lastFocus.focus();
  }
  if (burger) {
    burger.addEventListener('click', function () {
      menu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });
  }

  /* ---------- 4. Reveal on scroll ----------
     A rAF-swept rect check rather than IntersectionObserver: IO drops
     callbacks when the page is scrolled faster than it delivers them
     (anchor jumps, End key, scripted scrolling), which left whole
     sections stuck at opacity 0. This never misses.                    */
  var pending = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var pendingCounters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  function sweep() {
    if (!pending || !pendingCounters) return;
    var vh = window.innerHeight || document.documentElement.clientHeight;

    pending = pending.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) { el.classList.add('in'); return false; }
      return true;
    });

    pendingCounters = pendingCounters.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.85 && r.bottom > 0) { runCount(el); return false; }
      return true;
    });
  }

  if (reduced) {
    pending.forEach(function (el) { el.classList.add('in'); });
    pending = [];
  }

  /* ---------- 5. Counters ---------- */
  function runCount(el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || '0', 10);
    var suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = target.toFixed(dec) + suffix; return; }
    var dur = 1500, t0 = null;
    function tick(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  // first sweep once layout is settled, then on every scroll/resize
  sweep();
  window.addEventListener('resize', sweep, { passive: true });
  window.addEventListener('load', sweep);

  /* ---------- 6. Signature animation: peacock plumes ---------- */
  var plumeHost = document.getElementById('plumes');
  if (plumeHost && !reduced) {
    var PLUME = '<svg viewBox="0 0 24 60" fill="none" aria-hidden="true">' +
      '<path d="M12 60V26" stroke="currentColor" stroke-width="1" opacity=".55"/>' +
      '<ellipse cx="12" cy="15" rx="9.5" ry="14" fill="currentColor" opacity=".16"/>' +
      '<ellipse cx="12" cy="14" rx="5.6" ry="8.4" fill="currentColor" opacity=".34"/>' +
      '<circle cx="12" cy="13" r="3.4" fill="currentColor" opacity=".8"/>' +
      '<circle cx="12" cy="13" r="1.5" fill="#FFF3D2"/>' +
      '</svg>';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 16; i++) {
      var d = document.createElement('div');
      d.className = 'plume';
      d.innerHTML = PLUME;
      d.style.left = (Math.random() * 96) + '%';
      d.style.setProperty('--w', (11 + Math.random() * 17).toFixed(0) + 'px');
      d.style.setProperty('--dur', (11 + Math.random() * 12).toFixed(1) + 's');
      d.style.setProperty('--delay', (Math.random() * 14).toFixed(1) + 's');
      d.style.setProperty('--drift', ((Math.random() * 90) - 45).toFixed(0) + 'px');
      frag.appendChild(d);
    }
    plumeHost.appendChild(frag);
  }

  /* ---------- 8. Gallery ---------- */
  var PHOTOS = [
    // ---- showroom ----
    { f: 'ma-34', c: 'store', a: 'Mayur Abharan shopfront on 16th Cross, Malleswaram, lit at dusk' },
    { f: 'ma-24', c: 'store', a: 'Illuminated Mayur Abharan signboard in Kannada and English, marked BIS Hallmark Showroom, Since 1951' },
    { f: 'ma-10', c: 'store', a: 'Inside the showroom — glass counters of gold, with silver vessels on the shelves behind' },
    { f: 'ma-21', c: 'store', a: 'The length of the showroom, display cases along both walls' },
    { f: 'ma-23', c: 'store', a: 'Showroom interior looking towards the rear display wall' },
    { f: 'ma-29', c: 'store', a: 'Necklace busts arranged in lit wall niches above the counter' },
    { f: 'ma-31', c: 'store', a: 'Seating at the counter with jewellery laid out in the case' },
    { f: 'ma-38', c: 'store', a: 'Wall display of gold chains and necklaces in the showroom' },
    { f: 'ma-15', c: 'store', a: 'Lit niches holding necklace sets on maroon velvet busts' },

    // ---- gold ----
    { f: 'ma-01', c: 'gold', a: 'A full tray of antique gold pendants, Lakshmi motifs, kasu strings and diamond-finish sets' },
    { f: 'ma-02', c: 'gold', a: 'Tray of antique gold pendants and Lakshmi ear studs' },
    { f: 'ma-03', c: 'gold', a: 'Antique gold Lakshmi haram with ruby and emerald stones on a velvet bust' },
    { f: 'ma-04', c: 'gold', a: 'Long kasu malai of gold coins with matching ear studs' },
    { f: 'ma-05', c: 'gold', a: 'Stone-set coin necklace displayed on a maroon bust' },
    { f: 'ma-06', c: 'gold', a: 'Pearl-drop jhumkas and matching ear studs on a velvet tray' },
    { f: 'ma-07', c: 'gold', a: 'Turquoise bead haram with antique gold Lakshmi pendants' },
    { f: 'ma-08', c: 'gold', a: 'Antique gold necklace with a stone-set pendant and matching studs' },
    { f: 'ma-09', c: 'gold', a: 'Green bead haram with a Lakshmi pendant and pearl drops' },
    { f: 'ma-11', c: 'gold', a: 'Antique Lakshmi pendant haram strung on green beads' },
    { f: 'ma-12', c: 'gold', a: 'Emerald-green stone choker with a chandbali-style centre' },
    { f: 'ma-13', c: 'gold', a: 'Three-strand green bead haram with a Lakshmi pendant, worn with a ruby choker' },
    { f: 'ma-14', c: 'gold', a: 'Antique necklace with peacock detailing and pearl drops' },
    { f: 'ma-16', c: 'gold', a: 'Gold temple mantap casket with fine engraved work' },
    { f: 'ma-17', c: 'gold', a: 'Bangles above a finely worked silver casket on display' },
    { f: 'ma-18', c: 'gold', a: 'Tray of gold ear studs and jhumkas in assorted designs' },
    { f: 'ma-19', c: 'gold', a: 'Short kasu coin necklace with coloured stones on a velvet bust' },
    { f: 'ma-20', c: 'gold', a: 'A diamond-finish set and an antique gold set displayed side by side' },
    { f: 'ma-26', c: 'gold', a: 'Ear studs, jhumkas and chandbalis arranged on a navy tray' },
    { f: 'ma-35', c: 'gold', a: 'Stone-set bangles on a maroon velvet stand' },
    { f: 'ma-36', c: 'gold', a: 'Antique gold vaddanam waist belt with Lakshmi centrepiece' },
    { f: 'ma-37', c: 'gold', a: 'Ceremonial elephant figurine in silver with gold-finish howdah' },
    { f: 'ma-39', c: 'gold', a: 'Gold vaddanam waist belt with filigree work' },
    { f: 'ma-40', c: 'gold', a: 'Sets of stone bangles displayed on a velvet stand' },
    { f: 'ma-43', c: 'gold', a: 'Antique gold necklace set with rubies and white stones' },
    { f: 'ma-44', c: 'gold', a: 'Antique gold necklace with a Lakshmi centrepiece and fine granulation' },

    // ---- silver ----
    { f: 'ma-22', c: 'silver', a: 'Silver kalash with embossed deity faces around the body' },
    { f: 'ma-25', c: 'silver', a: 'Silver mantap throne for a household deity' },
    { f: 'ma-27', c: 'silver', a: 'Silver pooja mantap with pierced canopy work' },
    { f: 'ma-28', c: 'silver', a: 'Enamelled 92.5 silver Radha-Krishna idol in colour' },
    { f: 'ma-30', c: 'silver', a: 'Silver Radha-Krishna vigraha with a peacock feather crown' },
    { f: 'ma-32', c: 'silver', a: 'Silver and gold-finish casket with a peacock handle' },
    { f: 'ma-33', c: 'silver', a: 'Framed silver relief panels of deities' },
    { f: 'ma-41', c: 'silver', a: 'Three silver deity masks in graduated sizes' },
    { f: 'ma-42', c: 'silver', a: 'Set of silver deity masks for pooja use' },
    { f: 'ma-45', c: 'silver', a: 'Silver and gold ceremonial pen with engraved figures' }
  ];

  var galEl = document.getElementById('gal');
  var INITIAL = 16;
  var activeFilter = 'all';
  var shown = INITIAL;

  function build() {
    var frag = document.createDocumentFragment();
    PHOTOS.forEach(function (p, i) {
      var fig = document.createElement('figure');
      fig.dataset.cat = p.c;
      fig.dataset.idx = String(i);
      fig.setAttribute('role', 'button');
      fig.setAttribute('tabindex', '0');
      fig.setAttribute('aria-label', 'Open photograph: ' + p.a);

      var img = document.createElement('img');
      img.src = 'assets/img/thumb/' + p.f + '.jpg';
      img.alt = p.a;
      // the gallery sits well below the fold, so nothing here is eager
      img.loading = 'lazy';
      img.setAttribute('fetchpriority', 'low');
      img.decoding = 'async';

      var cap = document.createElement('figcaption');
      cap.textContent = p.c === 'store' ? 'Showroom' : (p.c === 'silver' ? '92.5 Silver' : 'Gold');

      fig.appendChild(img);
      fig.appendChild(cap);
      frag.appendChild(fig);
    });
    galEl.appendChild(frag);
  }

  function visibleList() {
    return PHOTOS.filter(function (p) {
      return activeFilter === 'all' || p.c === activeFilter;
    });
  }

  function apply() {
    var count = 0;
    var figs = galEl.querySelectorAll('figure');
    figs.forEach(function (fig) {
      var match = activeFilter === 'all' || fig.dataset.cat === activeFilter;
      if (match) {
        count++;
        fig.classList.toggle('hide', count > shown);
      } else {
        fig.classList.add('hide');
      }
    });
    var total = visibleList().length;
    moreBtn.style.display = shown >= total ? 'none' : '';
  }

  var moreBtn = document.getElementById('galMore');

  build();

  // chip counts
  var counts = { all: PHOTOS.length, gold: 0, silver: 0, store: 0 };
  PHOTOS.forEach(function (p) { counts[p.c]++; });
  document.getElementById('cAll').textContent = counts.all;
  document.getElementById('cGold').textContent = counts.gold;
  document.getElementById('cSilver').textContent = counts.silver;
  document.getElementById('cStore').textContent = counts.store;

  apply();

  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.chip').forEach(function (c) {
        c.setAttribute('aria-pressed', String(c === chip));
      });
      activeFilter = chip.dataset.filter;
      shown = INITIAL;
      apply();
    });
  });

  moreBtn.addEventListener('click', function () {
    shown = PHOTOS.length;
    apply();
    moreBtn.style.display = 'none';
  });

  /* ---------- 9. Lightbox ---------- */
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var lbCount = document.getElementById('lbCount');
  var lbTrigger = null;
  var order = [];
  var pos = 0;

  function rebuildOrder() {
    order = [];
    galEl.querySelectorAll('figure').forEach(function (fig) {
      if (!fig.classList.contains('hide')) order.push(parseInt(fig.dataset.idx, 10));
    });
  }

  function render() {
    var p = PHOTOS[order[pos]];
    lbImg.src = 'assets/img/' + p.f + '.jpg';
    lbImg.alt = p.a;
    lbCount.textContent = (pos + 1) + ' / ' + order.length;
  }

  function openLb(idx, trigger) {
    rebuildOrder();
    pos = order.indexOf(idx);
    if (pos < 0) pos = 0;
    lbTrigger = trigger;
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    render();
    document.getElementById('lbClose').focus();
  }
  function closeLb() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    window.setTimeout(function () { lb.hidden = true; lbImg.removeAttribute('src'); }, reduced ? 0 : 280);
    if (lbTrigger) lbTrigger.focus();
  }
  function step(n) {
    pos = (pos + n + order.length) % order.length;
    render();
  }

  galEl.addEventListener('click', function (e) {
    var fig = e.target.closest('figure');
    if (fig) openLb(parseInt(fig.dataset.idx, 10), fig);
  });
  galEl.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var fig = e.target.closest('figure');
    if (fig) { e.preventDefault(); openLb(parseInt(fig.dataset.idx, 10), fig); }
  });

  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', function () { step(-1); });
  document.getElementById('lbNext').addEventListener('click', function () { step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

  // swipe
  var tx = 0;
  lb.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var d = e.changedTouches[0].clientX - tx;
    if (Math.abs(d) > 55) step(d > 0 ? -1 : 1);
  }, { passive: true });

  document.addEventListener('keydown', function (e) {
    if (!lb.hidden) {
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
      return;
    }
    if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) closeMenu();
  });

  /* ---------- 10. Scrollspy ---------- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + en.target.id));
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ---------- 11. Enquiry form ---------- */
  var form = document.getElementById('form');
  var status = document.getElementById('status');
  var submit = document.getElementById('submit');

  function setError(id, on) {
    var field = document.getElementById(id).closest('.field');
    field.classList.toggle('invalid', on);
    document.getElementById(id).setAttribute('aria-invalid', String(on));
  }

  function checkName() {
    var ok = document.getElementById('f-name').value.trim().length >= 2;
    setError('f-name', !ok);
    return ok;
  }
  function checkPhone() {
    var v = document.getElementById('f-phone').value.replace(/[^0-9]/g, '');
    var ok = v.length >= 10 && v.length <= 13;
    setError('f-phone', !ok);
    return ok;
  }
  function checkEmail() {
    var v = document.getElementById('f-email').value.trim();
    var ok = v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    setError('f-email', !ok);
    return ok;
  }

  // validate on blur, not on keystroke
  document.getElementById('f-name').addEventListener('blur', checkName);
  document.getElementById('f-phone').addEventListener('blur', checkPhone);
  document.getElementById('f-email').addEventListener('blur', checkEmail);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var a = checkName(), b = checkPhone(), c = checkEmail();
    if (!(a && b && c)) {
      var firstBad = form.querySelector('.field.invalid input');
      if (firstBad) {
        // focus without the browser's automatic scroll: showing the error
        // messages already reflows the form, and a scroll on top of that
        // slides the submit button out from under the pointer, so the
        // user's next click lands on nothing.
        firstBad.focus({ preventScroll: true });
        var fr = firstBad.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (fr.top < 80 || fr.bottom > vh - 80) {
          firstBad.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
        }
      }
      return;
    }

    var label = submit.querySelector('.btn-label');
    var arrow = submit.querySelector('.btn-arrow');
    submit.setAttribute('aria-disabled', 'true');
    label.textContent = 'Sending';
    arrow.outerHTML = '<span class="spinner" aria-hidden="true"></span>';

    window.setTimeout(function () {
      form.reset();
      status.classList.add('show');
      submit.removeAttribute('aria-disabled');
      label.textContent = 'Send enquiry';
      var sp = submit.querySelector('.spinner');
      if (sp) {
        sp.outerHTML = '<svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>';
      }
      status.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    }, 1100);
  });

})();
