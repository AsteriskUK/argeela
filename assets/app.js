/* ARGEELA LONDON LTD — interactions */
(function () {
  "use strict";

  /* ---- Sticky header state ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".menu-toggle");
  var mnav = document.querySelector(".mobile-nav");
  var mclose = document.querySelector(".mn-close");
  function closeNav() { if (mnav) { mnav.classList.remove("open"); document.body.style.overflow = ""; } }
  function openNav() { if (mnav) { mnav.classList.add("open"); document.body.style.overflow = "hidden"; } }
  if (toggle) toggle.addEventListener("click", openNav);
  if (mclose) mclose.addEventListener("click", closeNav);
  if (mnav) mnav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---- Scroll reveal (position-based; works in every browser) ---- */
  var reveal = [].slice.call(document.querySelectorAll("[data-reveal]"));
  var steps = [].slice.call(document.querySelectorAll(".step"));
  var stats = [].slice.call(document.querySelectorAll("[data-count]"));

  function fmt(n, dec) { return n.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function runCounter(el) {
    if (el._counted) return; el._counted = true;
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dec = (target % 1 !== 0) ? 1 : 0;
    var start = performance.now(), dur = 1400;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    // rAF-independent guarantee: land on the final value even if frames are starved.
    setTimeout(function () { el.textContent = fmt(target, dec) + suffix; }, dur + 250);
  }

  function inView(el, margin) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh - (margin || 0) && r.bottom > 0;
  }

  var ticking = false;
  function check() {
    ticking = false;
    for (var i = reveal.length - 1; i >= 0; i--) {
      if (inView(reveal[i], 60)) { reveal[i].classList.add("in"); reveal.splice(i, 1); }
    }
    for (var j = steps.length - 1; j >= 0; j--) {
      if (inView(steps[j], 80)) { steps[j].classList.add("in"); steps.splice(j, 1); }
    }
    for (var k = stats.length - 1; k >= 0; k--) {
      if (inView(stats[k], 40)) { runCounter(stats[k]); stats.splice(k, 1); }
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(check); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("load", check);
  check();
  // Safety net: guarantee everything is visible even if timing/APIs misbehave.
  setTimeout(check, 400);
  setTimeout(function () {
    reveal.forEach(function (el) { el.classList.add("in"); });
    steps.forEach(function (el) { el.classList.add("in"); });
    stats.forEach(runCounter);
  }, 2500);

  /* ---- Catalogue filter ---- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  var prods = document.querySelectorAll(".prod[data-tags]");
  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        var f = chip.getAttribute("data-filter");
        prods.forEach(function (p) {
          var show = f === "all" || (p.getAttribute("data-tags") || "").indexOf(f) > -1;
          p.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ---- Contact form → Netlify Forms (AJAX submit, keeps toast UX) ---- */
  var form = document.querySelector("#contact-form");
  var toast = document.querySelector("#toast");
  function showToast(msg, ok) {
    if (!toast) return;
    if (msg) toast.lastChild.textContent = " " + msg;
    toast.style.background = ok === false ? "#b23a2f" : "";
    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, 4600);
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn._html = btn.innerHTML; btn.textContent = "Sending…"; btn.style.opacity = ".7"; }
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        showToast("Thanks — your enquiry's in. We'll reply the same working day.", true);
        form.reset();
      }).catch(function () {
        showToast("Sorry, that didn't send. Please call 07985 322849 or email us.", false);
      }).then(function () {
        if (btn) { btn.disabled = false; btn.style.opacity = ""; if (btn._html) btn.innerHTML = btn._html; }
      });
    });
  }

  /* ---- Footer year ---- */
  var yr = document.querySelector("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
