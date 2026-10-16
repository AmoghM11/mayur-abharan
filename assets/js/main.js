/* ============================================================
   SRI MANJUNATHA JEWELLERS — interactions (all pages)
   Vanilla JS. No dependencies. Every module checks that its
   elements exist, so one file serves every page.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 1. Year ---------- */
  var yr = $('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- 2. Nav: stuck state ---------- */
  var nav = $('nav');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      if (nav) nav.classList.toggle('is-stuck', window.scrollY > 24);
      sweep();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 3. Mobile menu ---------- */
  var burger = $('burger');
  var menu = $('mobileMenu');
  var lastFocus = null;

  function openMenu() {
    lastFocus = document.activeElement;
    menu.hidden = false;
    requestAnimationFrame(function () { menu.classList.add('is-open'); });
    // the header sits over the ivory menu, so it takes its dark-on-light colours
    nav.classList.add('is-open', 'is-stuck');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    var first = menu.querySelector('a');
    if (first) first.focus();
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    nav.classList.remove('is-open');
    nav.classList.toggle('is-stuck', window.scrollY > 24);
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    window.setTimeout(function () { menu.hidden = true; }, reduced ? 0 : 280);
    if (lastFocus) lastFocus.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      menu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
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

  /* ---------- 6. Signature animation: peacock plumes (Mayur Abharan) ---------- */
  var plumeHost = $('plumes');
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

  /* ---------- 7. Filterable gallery ----------
     Photo sets live in galleries.js as window.GALLERY_SETS.
     A photo path "smj/new-front" resolves to assets/img/smj/new-front.jpg
     with its thumbnail at assets/img/smj/thumb/new-front.jpg.            */
  function fullSrc(p) { return 'assets/img/' + p + '.jpg'; }
  function thumbSrc(p) {
    var i = p.lastIndexOf('/');
    return 'assets/img/' + p.slice(0, i + 1) + 'thumb/' + p.slice(i + 1) + '.jpg';
  }

  var galEl = $('gal');
  var moreBtn = $('galMore');
  if (galEl && window.GALLERY_SETS) {
    var set = window.GALLERY_SETS[galEl.dataset.set] || [];
    var labels = window.GALLERY_LABELS || {};
    var INITIAL = parseInt(galEl.dataset.initial || '16', 10);
    var activeFilter = 'all';
    var shown = INITIAL;

    var gfrag = document.createDocumentFragment();
    set.forEach(function (p) {
      var fig = document.createElement('figure');
      fig.className = 'lb-item';
      fig.dataset.cat = p.c;
      fig.dataset.full = fullSrc(p.f);
      fig.setAttribute('role', 'button');
      fig.setAttribute('tabindex', '0');
      fig.setAttribute('aria-label', 'Open photograph: ' + p.a);

      var img = document.createElement('img');
      img.src = thumbSrc(p.f);
      img.alt = p.a;
      img.loading = 'lazy';
      img.setAttribute('fetchpriority', 'low');
      img.decoding = 'async';

      var cap = document.createElement('figcaption');
      cap.textContent = labels[p.c] || p.c;

      fig.appendChild(img);
      fig.appendChild(cap);
      gfrag.appendChild(fig);
    });
    galEl.appendChild(gfrag);

    var apply = function () {
      var count = 0, total = 0;
      galEl.querySelectorAll('figure').forEach(function (fig) {
        var match = activeFilter === 'all' || fig.dataset.cat === activeFilter;
        if (match) {
          count++; total++;
          fig.classList.toggle('hide', count > shown);
        } else {
          fig.classList.add('hide');
        }
      });
      if (moreBtn) moreBtn.style.display = shown >= total ? 'none' : '';
      sweep();
    };

    // chip counts
    document.querySelectorAll('.chip[data-filter]').forEach(function (chip) {
      var f = chip.dataset.filter;
      var n = chip.querySelector('.n');
      if (n) n.textContent = f === 'all' ? set.length : set.filter(function (p) { return p.c === f; }).length;
      chip.addEventListener('click', function () {
        document.querySelectorAll('.chip[data-filter]').forEach(function (c) {
          c.setAttribute('aria-pressed', String(c === chip));
        });
        activeFilter = f;
        shown = INITIAL;
        apply();
        // on phones the chips are one swipeable row: bring the chosen one into view
        var bar = chip.parentNode;
        if (bar.scrollWidth > bar.clientWidth) {
          bar.scrollTo({
            left: chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2,
            behavior: reduced ? 'auto' : 'smooth'
          });
        }
      });
    });

    // deep link: gallery.html#heritage opens that filter
    var hash = window.location.hash.replace('#', '');
    var hashChip = hash && document.querySelector('.chip[data-filter="' + hash + '"]');
    if (hashChip) hashChip.click(); else apply();

    if (moreBtn) {
      moreBtn.addEventListener('click', function () {
        shown = set.length;
        apply();
      });
    }
  }

  /* ---------- 8. Lightbox (any .lb-item inside a [data-lb-group]) ---------- */
  var lb = $('lb');
  if (lb) {
    var lbImg = $('lbImg');
    var lbCount = $('lbCount');
    var lbTrigger = null;
    var order = [];
    var pos = 0;

    var render = function (fade) {
      var it = order[pos];
      var img = it.querySelector('img');
      var show = function () {
        lbImg.src = it.dataset.full || img.src;
        lbImg.alt = img ? img.alt : '';
        lbCount.textContent = (pos + 1) + ' / ' + order.length;
      };
      if (!fade || reduced) { show(); return; }
      // cross-fade between photos: out 160ms, swap, back in once decoded
      lbImg.classList.add('swapping');
      window.setTimeout(function () {
        show();
        var done = function () { lbImg.classList.remove('swapping'); };
        if (lbImg.decode) lbImg.decode().then(done, done); else done();
      }, 160);
    };
    var openLb = function (item) {
      var group = item.closest('[data-lb-group]') || document;
      order = Array.prototype.filter.call(group.querySelectorAll('.lb-item'), function (el) {
        return !el.classList.contains('hide');
      });
      pos = Math.max(0, order.indexOf(item));
      lbTrigger = item;
      lb.hidden = false;
      requestAnimationFrame(function () { lb.classList.add('is-open'); });
      document.body.style.overflow = 'hidden';
      render();
      $('lbClose').focus();
    };
    var closeLb = function () {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
      window.setTimeout(function () { lb.hidden = true; lbImg.removeAttribute('src'); }, reduced ? 0 : 280);
      if (lbTrigger) lbTrigger.focus();
    };
    var step = function (n) {
      pos = (pos + n + order.length) % order.length;
      render(true);
    };

    document.addEventListener('click', function (e) {
      var item = e.target.closest('.lb-item');
      if (item) openLb(item);
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.hidden) {
        if (e.key === 'Escape') closeLb();
        if (e.key === 'ArrowLeft') step(-1);
        if (e.key === 'ArrowRight') step(1);
        return;
      }
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('lb-item')) {
        e.preventDefault();
        openLb(e.target);
      }
    });

    $('lbClose').addEventListener('click', closeLb);
    $('lbPrev').addEventListener('click', function () { step(-1); });
    $('lbNext').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

    var tx = 0;
    lb.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 55) step(dx > 0 ? -1 : 1);
    }, { passive: true });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) closeMenu();
  });

  // first sweep once layout is settled, then on every scroll/resize
  onScroll();
  sweep();
  window.addEventListener('resize', sweep, { passive: true });
  window.addEventListener('load', sweep);
})();
