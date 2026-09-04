/* 31.10 Art Hotel — Grand interactions */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var hdr = document.querySelector(".hdr");
  var onScroll = function () { if (hdr) hdr.classList.toggle("slim", window.scrollY > 30); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", document.body.classList.contains("nav-open"));
    });
    document.querySelectorAll(".nav__menu a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
    });
  }

  var rev = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && rev.length) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .14, rootMargin: "0px 0px -8% 0px" });
    rev.forEach(function (el) { io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add("in"); }); }

  var px = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  if (px.length && !reduced) {
    var t = false;
    var run = function () {
      var vh = innerHeight;
      px.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var sp = parseFloat(el.dataset.parallax) || 0.12;
        el.style.transform = "translate3d(0," + (-(((r.top + r.height / 2) - vh / 2) * sp)).toFixed(1) + "px,0) scale(1.12)";
      });
      t = false;
    };
    var req = function () { if (!t) { t = true; requestAnimationFrame(run); } };
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req, { passive: true }); run();
  }

  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { if (b.dataset.lang === "en") alert("Versione inglese in preparazione."); });
  });

  // Booking bar: apre il motore (demo)
  var bookBtn = document.querySelector(".booking__box .btn");
  if (bookBtn) bookBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.open("https://3110arthotelfirenze.beddy.io/#/(beddy:home)?lang=it", "_blank", "noopener");
  });

  // Filtro gallery
  var fbtns = document.querySelectorAll(".filter button");
  var items = document.querySelectorAll(".masonry__item");
  fbtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      fbtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var cat = btn.dataset.filter;
      items.forEach(function (it) { it.classList.toggle("is-hidden", !(cat === "all" || it.dataset.cat === cat)); });
    });
  });

  // Lightbox
  var lbItems = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (lbItems.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = '<button class="lightbox__x" aria-label="Chiudi">×</button><button class="lightbox__nav lightbox__nav--p" aria-label="Precedente">‹</button><button class="lightbox__nav lightbox__nav--n" aria-label="Successiva">›</button><img alt=""><div class="lightbox__cap"></div>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector(".lightbox__cap"), cur = 0;
    var vis = function () { return lbItems.filter(function (i) { return !i.classList.contains("is-hidden"); }); };
    var show = function (arr, i) { cur = (i + arr.length) % arr.length; var n = arr[cur]; lbImg.src = n.getAttribute("data-lightbox") || n.querySelector("img").src; lbCap.textContent = n.getAttribute("data-caption") || ""; };
    var open = function (n) { var a = vis(); show(a, a.indexOf(n)); lb.classList.add("open"); document.body.style.overflow = "hidden"; };
    var close = function () { lb.classList.remove("open"); document.body.style.overflow = ""; };
    lbItems.forEach(function (n) { n.addEventListener("click", function () { open(n); }); });
    lb.querySelector(".lightbox__x").addEventListener("click", close);
    lb.querySelector(".lightbox__nav--n").addEventListener("click", function () { show(vis(), cur + 1); });
    lb.querySelector(".lightbox__nav--p").addEventListener("click", function () { show(vis(), cur - 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close(); if (e.key === "ArrowRight") show(vis(), cur + 1); if (e.key === "ArrowLeft") show(vis(), cur - 1);
    });
  }

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* WOW · Intro "Vernissage" ---------------------------------------------- */
  var intro = document.querySelector(".intro");
  if (intro) {
    var endIntro = function () {
      intro.classList.add("done");
      document.body.classList.remove("intro-lock");
      try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
    };
    var seen = false;
    try { seen = sessionStorage.getItem("introSeen"); } catch (e) {}
    if (reduced || seen) {
      intro.remove(); document.body.classList.remove("intro-lock");
    } else {
      requestAnimationFrame(function () { intro.classList.add("reveal-logo"); });
      setTimeout(function () { intro.classList.add("open"); }, 1600);
      setTimeout(endIntro, 2700);
    }
  }

  /* WOW · Spotlight da museo ---------------------------------------------- */
  if (fine && !reduced) {
    document.querySelectorAll(".section--navy").forEach(function (sec) {
      sec.addEventListener("mouseenter", function () { sec.classList.add("spot-on"); });
      sec.addEventListener("mouseleave", function () { sec.classList.remove("spot-on"); });
      sec.addEventListener("mousemove", function (e) {
        var r = sec.getBoundingClientRect();
        sec.style.setProperty("--mx", (e.clientX - r.left) + "px");
        sec.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* WOW · Parete del museo (scroll orizzontale) --------------------------- */
  var wall = document.querySelector(".wall");
  if (wall && !reduced) {
    var track = wall.querySelector(".wall__track");
    var wTick = false;
    var isWallMobile = function () { return window.matchMedia("(max-width: 760px)").matches; };
    var wallRender = function () {
      if (isWallMobile()) { track.style.transform = ""; wTick = false; return; }
      var vh = window.innerHeight;
      var travel = wall.offsetHeight - vh;
      var top = wall.getBoundingClientRect().top;
      var prog = Math.min(Math.max(-top / travel, 0), 1);
      var maxX = track.scrollWidth - window.innerWidth;
      if (maxX < 0) maxX = 0;
      track.style.transform = "translate3d(" + (-(prog * maxX)).toFixed(1) + "px,0,0)";
      wTick = false;
    };
    var wallReq = function () { if (!wTick) { wTick = true; requestAnimationFrame(wallRender); } };
    window.addEventListener("scroll", wallReq, { passive: true });
    window.addEventListener("resize", wallReq, { passive: true });
    wallRender();
  }

  /* Hero video: toggle audio + fallback poster ---------------------------- */
  var hVid = document.querySelector(".hero__video"), hMute = document.querySelector(".hero__mute");
  if (hVid && hMute) {
    var mOff = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>';
    var mOn = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
    hMute.innerHTML = mOff;
    hMute.addEventListener("click", function () {
      hVid.muted = !hVid.muted;
      hMute.innerHTML = hVid.muted ? mOff : mOn;
      if (!hVid.muted) { var p = hVid.play(); if (p && p.catch) p.catch(function () {}); }
    });
    hVid.addEventListener("error", function () { hMute.style.display = "none"; });
  }

  /* WOW+ · "Il Restauro" (hero interattivo) ------------------------------- */
  var restore = document.querySelector(".restore");
  if (restore) {
    var rHero = restore.closest(".hero");
    if (reduced) {
      restore.classList.add("no-restore");
    } else {
      var mx = 50, my = 44, tx = 50, ty = 44, rIdle = true, rLast = 0, rRaf;
      var rLoop = function (t) {
        if (rIdle) { var s = t / 2600; tx = 50 + Math.cos(s) * 26; ty = 44 + Math.sin(s * 1.3) * 20; }
        mx += (tx - mx) * 0.09; my += (ty - my) * 0.09;
        restore.style.setProperty("--mx", mx.toFixed(2) + "%");
        restore.style.setProperty("--my", my.toFixed(2) + "%");
        rRaf = requestAnimationFrame(rLoop);
      };
      var onMove = function (e) {
        var p = e.touches ? e.touches[0] : e;
        var r = rHero.getBoundingClientRect();
        tx = Math.min(Math.max(((p.clientX - r.left) / r.width) * 100, 0), 100);
        ty = Math.min(Math.max(((p.clientY - r.top) / r.height) * 100, 0), 100);
        rIdle = false; rLast = performance.now();
        if (rHero) rHero.classList.add("touched");
      };
      rHero.addEventListener("pointermove", onMove, { passive: true });
      rHero.addEventListener("touchmove", onMove, { passive: true });
      setInterval(function () { if (performance.now() - rLast > 2400) rIdle = true; }, 700);
      rRaf = requestAnimationFrame(rLoop);
    }
  }

  /* WOW+ · "La Galleria 3D" (corridoio museo) ----------------------------- */
  var g3d = document.querySelector(".g3d");
  if (g3d && !reduced) {
    var scene = g3d.querySelector(".g3d__scene");
    var gIntro = g3d.querySelector(".g3d__intro");
    var CAM = 3900;
    var gTick = false;
    var gMobile = function () { return window.matchMedia("(max-width: 760px)").matches; };
    var gRender = function () {
      if (gMobile()) { if (scene) scene.style.transform = ""; gTick = false; return; }
      var vh = window.innerHeight;
      var travel = g3d.offsetHeight - vh;
      var prog = Math.min(Math.max(-g3d.getBoundingClientRect().top / travel, 0), 1);
      scene.style.setProperty("--cam", (prog * CAM).toFixed(1) + "px");
      if (gIntro) gIntro.style.opacity = Math.max(1 - prog * 7, 0);
      g3d.classList.toggle("show-cta", prog > 0.9);
      gTick = false;
    };
    var gReq = function () { if (!gTick) { gTick = true; requestAnimationFrame(gRender); } };
    window.addEventListener("scroll", gReq, { passive: true });
    window.addEventListener("resize", gReq, { passive: true });
    gRender();
  }
})();
