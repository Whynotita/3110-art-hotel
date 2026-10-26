/* Intro "31.10 dipinto": la scritta si dipinge con il pennello mentre si scorre (rotella, touch, tastiera).
   Mostrata una volta per sessione. Fallback: avanza da sola dopo qualche secondo; "Salta" sempre disponibile. */
(function () {
  var doc = document.documentElement, el = document.getElementById("paintIntro");
  if (!el || !doc.classList.contains("pi-on")) return;

  var cv = document.getElementById("piCanvas"), ctx = cv.getContext("2d");
  var cta = el.querySelector(".pi__cta"), hint = el.querySelector(".pi__hint"), skip = el.querySelector(".pi__skip"), enter = el.querySelector(".pi__btn");
  var clamp = function (x, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return Math.min(b, Math.max(a, x)); };
  var sm = function (a, b, x) { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
  var seed = 11, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  var mk = function () { return document.createElement("canvas"); };
  var W, H, dpr, lines, textC = mk(), maskC = mk(), tmpC = mk(), noisePat, tctx, mctx, xctx, S1;
  var target = 0, shown = 0, lastInput = Date.now(), opened = false, dirty = true;

  /* inert sul resto della pagina mentre l'intro e' aperta */
  var inerted = [];
  Array.prototype.forEach.call(document.body.children, function (n) {
    if (n !== el && n.tagName !== "SCRIPT" && !n.hasAttribute("inert")) { n.setAttribute("inert", ""); inerted.push(n); }
  });

  function build() {
    dpr = Math.min(2, window.devicePixelRatio || 1); W = el.clientWidth; H = el.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    [textC, maskC, tmpC].forEach(function (c) { c.width = W * dpr; c.height = H * dpr; });
    tctx = textC.getContext("2d"); mctx = maskC.getContext("2d"); xctx = tmpC.getContext("2d");
    [ctx, tctx, mctx, xctx].forEach(function (c) { c.setTransform(dpr, 0, 0, dpr, 0, 0); });
    var disp = "'Playfair Display',Georgia,serif", sans = "'Montserrat',system-ui,sans-serif";
    S1 = Math.min(W * .3, H * .34);
    tctx.font = "500 " + S1 + "px " + disp; var w1 = tctx.measureText("31.10").width;
    if (w1 > W * .86) { S1 *= W * .86 / w1; tctx.font = "500 " + S1 + "px " + disp; w1 = tctx.measureText("31.10").width; }
    var S2 = S1 * .2, sp2 = S2 * .34, S3 = S1 * .1, sp3 = S3 * .6, t2 = "ART HOTEL", t3 = "FIRENZE";
    var wSp = function (t, font, sp) { tctx.font = font; var w = 0; for (var i = 0; i < t.length; i++) w += tctx.measureText(t[i]).width + sp; return w - sp; };
    var f2 = "600 " + S2 + "px " + disp, f3 = "500 " + S3 + "px " + sans;
    var w2 = wSp(t2, f2, sp2), w3 = wSp(t3, f3, sp3);
    var gap1 = S1 * .16, gap2 = S2 * .9, blockH = S1 * .72 + gap1 + S2 * .7 + gap2 + S3 * .7;
    var y = H * .5 - blockH / 2 - H * .03 + S1 * .72, L = [];
    L.push({ t: "31.10", font: "500 " + S1 + "px " + disp, sp: 0, w: w1, x: (W - w1) / 2, base: y, color: "#16202E", h: S1 * .72, bw: S1 * .028, big: true });
    y += gap1 + S2 * .7;
    L.push({ t: t2, font: f2, sp: sp2, w: w2, x: (W - w2) / 2, base: y, color: "#9C7C3A", h: S2 * .7, bw: S2 * .1 });
    y += gap2 + S3 * .7;
    L.push({ t: t3, font: f3, sp: sp3, w: w3, x: (W - w3) / 2, base: y, color: "#4a4538", h: S3 * .7, bw: S3 * .13 });
    lines = L;
    tctx.clearRect(0, 0, W, H); tctx.textBaseline = "alphabetic";
    L.forEach(function (l) { tctx.font = l.font; tctx.fillStyle = l.color; var x = l.x; for (var i = 0; i < l.t.length; i++) { var ch = l.t[i]; tctx.fillText(ch, x, l.base); x += tctx.measureText(ch).width + l.sp; } });
    seed = 11;
    L.forEach(function (l) {
      l.top = l.base - l.h; l.strokes = []; var x = l.x; tctx.font = l.font;
      for (var ci = 0; ci < l.t.length; ci++) {
        var ch = l.t[ci], cw = tctx.measureText(ch).width;
        if (ch !== " ") {
          var cols = ch === "." ? 1 : Math.max(1, Math.round(cw / (l.h * (l.big ? .36 : .9))));
          for (var c = 0; c < cols; c++) {
            var colW = cw / cols, cx = x + (c + .5) * colW, dir = (ci + c) % 2 ? -1 : 1, ext = l.h * .12, tilt = (rnd() - .5) * l.h * .12;
            var p0 = [cx - tilt, l.top - ext], p1 = [cx + tilt, l.base + ext];
            var th = Math.min(colW * (l.big ? 1.35 : 1.5), l.h * .9) * (ch === "." ? 1.5 : 1);
            var n = Math.max(6, Math.round(th / (l.bw * .55))), bs = [];
            for (var b = 0; b < n; b++) bs.push({ off: ((b + .5) / n - .5) * th + (rnd() - .5) * l.bw * .4, w: l.bw * (.8 + rnd() * .8), a: .72 + rnd() * .28, s: rnd() * l.h * .1, e: rnd() * l.h * .1, ph: rnd() * 6, amp: (rnd() * .5 + .2) * l.bw * .45, lag: rnd() * .06 });
            l.strokes.push({ p0: dir > 0 ? p0 : p1, p1: dir > 0 ? p1 : p0, th: th, bs: bs, col: l.color });
          }
        }
        x += cw + l.sp;
      }
    });
    var nc = mk(); nc.width = nc.height = 256; var nx = nc.getContext("2d"), id = nx.createImageData(256, 256);
    for (var i = 0; i < id.data.length; i += 4) { var v = rnd(), dk = v < .5; id.data[i] = dk ? 0 : 255; id.data[i + 1] = dk ? 0 : 245; id.data[i + 2] = dk ? 0 : 220; id.data[i + 3] = Math.abs(v - .5) * 2 * 44; }
    nx.putImageData(id, 0, 0); noisePat = ctx.createPattern(nc, "repeat");
    dirty = true;
  }

  function drawMask(p) {
    mctx.clearRect(0, 0, W, H); mctx.lineCap = "round"; mctx.lineJoin = "round";
    var ranges = [[.03, .52], [.52, .76], [.76, .85]], head = null;
    lines.forEach(function (l, li) {
      var lp = clamp((p - ranges[li][0]) / (ranges[li][1] - ranges[li][0])), N = l.strokes.length;
      l.strokes.forEach(function (s, k) {
        var u = clamp(lp * N - k); if (u <= 0) return;
        var e = u * u * (3 - 2 * u) * .3 + u * .7, dx = s.p1[0] - s.p0[0], dy = s.p1[1] - s.p0[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
        s.bs.forEach(function (bs) {
          var ue = clamp(e * (1 + bs.lag) - bs.lag * .5), t0 = bs.s / len, t1 = 1 - bs.e / len, steps = Math.max(2, Math.ceil(len * ue / 16));
          mctx.globalAlpha = bs.a; mctx.lineWidth = bs.w; mctx.beginPath();
          for (var i = 0; i <= steps; i++) { var t = t0 + (t1 - t0) * (i / steps) * ue, w = Math.sin(t * len * .02 + bs.ph) * bs.amp, x = s.p0[0] + dx * t + nx * (bs.off + w), y = s.p0[1] + dy * t + ny * (bs.off + w); i ? mctx.lineTo(x, y) : mctx.moveTo(x, y); }
          mctx.stroke();
        });
        if (u < 1) head = { x: s.p0[0] + dx * e, y: s.p0[1] + dy * e, th: Math.max(s.th * 1.2, l.h * .35), col: s.col };
      });
    });
    mctx.globalAlpha = 1; return head;
  }
  function brush(h) {
    var bw = Math.max(10, h.th * .22), len = Math.max(90, h.th * 1.6);
    ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(-.62); ctx.shadowColor = "rgba(0,0,0,.28)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 6;
    ctx.fillStyle = h.col; ctx.beginPath(); ctx.moveTo(-bw * .5, 0); ctx.lineTo(bw * .5, 0); ctx.lineTo(bw * .38, -bw * 1.25); ctx.lineTo(-bw * .38, -bw * 1.25); ctx.closePath(); ctx.fill(); ctx.shadowColor = "transparent";
    var g = ctx.createLinearGradient(-bw * .5, 0, bw * .5, 0); g.addColorStop(0, "#8d8a84"); g.addColorStop(.5, "#e8e6e0"); g.addColorStop(1, "#8d8a84");
    ctx.fillStyle = g; ctx.fillRect(-bw * .4, -bw * 2.6, bw * .8, bw * 1.4);
    var m = ctx.createLinearGradient(-bw * .3, 0, bw * .3, 0); m.addColorStop(0, "#5a3b1e"); m.addColorStop(.5, "#9c6a38"); m.addColorStop(1, "#4a2f17");
    ctx.fillStyle = m; ctx.beginPath(); ctx.moveTo(-bw * .34, -bw * 2.6); ctx.lineTo(bw * .34, -bw * 2.6); ctx.lineTo(bw * .2, -bw * 2.6 - len); ctx.lineTo(-bw * .2, -bw * 2.6 - len); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function render(p) {
    var head = drawMask(p);
    xctx.setTransform(1, 0, 0, 1, 0, 0); xctx.clearRect(0, 0, tmpC.width, tmpC.height);
    xctx.globalCompositeOperation = "source-over"; xctx.drawImage(textC, 0, 0);
    xctx.globalCompositeOperation = "destination-in"; xctx.drawImage(maskC, 0, 0);
    xctx.globalCompositeOperation = "source-atop"; xctx.fillStyle = noisePat; xctx.fillRect(0, 0, tmpC.width, tmpC.height);
    xctx.globalCompositeOperation = "source-over"; xctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.save(); ctx.shadowColor = "rgba(40,28,10,.28)"; ctx.shadowBlur = 3; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 2; ctx.drawImage(tmpC, 0, 0, W, H); ctx.restore();
    var f = sm(.86, .95, p); if (f > 0) { ctx.globalAlpha = f; ctx.drawImage(textC, 0, 0, W, H); ctx.globalAlpha = 1; }
    if (head && p < .84) brush(head);
    cta.classList.toggle("on", p > .93); hint.style.opacity = p > .03 ? 0 : 1;
  }

  function open() {
    if (opened) return; opened = true;
    try { sessionStorage.setItem("paintIntroSeen", "1"); } catch (e) {}
    el.classList.add("is-open");
    inerted.forEach(function (n) { n.removeAttribute("inert"); });
    window.scrollTo(0, 0);
    setTimeout(function () { doc.classList.remove("pi-on"); el.style.display = "none"; el.remove(); removeEventListener("keydown", onKey); }, 1050);
  }
  function push(d) { if (opened) return; lastInput = Date.now(); target = clamp(target + d); if (d > 0 && target >= 1 && shown > .97) schedule(); }
  var autoOpen = null;
  function schedule() { if (autoOpen) return; autoOpen = setTimeout(open, 2600); }
  function onKey(e) {
    var k = e.key;
    if (k === "Escape") { open(); return; }
    if (k === "ArrowDown" || k === "PageDown" || k === " ") { e.preventDefault(); push(.12); }
    else if (k === "ArrowUp" || k === "PageUp") { e.preventDefault(); push(-.12); }
    else if (k === "End") { e.preventDefault(); push(1); }
  }
  el.addEventListener("wheel", function (e) { e.preventDefault(); if (target >= 1 && e.deltaY > 30 && shown > .97) { open(); return; } push(e.deltaY / 1800); }, { passive: false });
  var ty = null;
  el.addEventListener("touchstart", function (e) { ty = e.touches[0].clientY; }, { passive: true });
  el.addEventListener("touchmove", function (e) { e.preventDefault(); if (ty == null) return; var y = e.touches[0].clientY; push((ty - y) / (H * 1.5)); ty = y; }, { passive: false });
  addEventListener("keydown", onKey);
  skip.addEventListener("click", open); enter.addEventListener("click", open);
  var rt; addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 150); });

  function loop() {
    if (opened) return;
    /* senza input per 4s l'intro avanza da sola, cosi' nessuno resta bloccato */
    if (Date.now() - lastInput > 4000 && target < 1) target = clamp(target + .0035);
    if (Math.abs(target - shown) > 1e-4) { shown += (target - shown) * .12; dirty = true; } else if (shown !== target) { shown = target; dirty = true; }
    if (dirty && lines) { render(shown); dirty = false; }
    if (shown > .985 && target >= 1) schedule();
    requestAnimationFrame(loop);
  }
  var started = false;
  function start() { if (started) return; started = true; build(); el.focus({ preventScroll: true }); loop(); }
  var fonts = document.fonts && document.fonts.load ? Promise.all([document.fonts.load("500 100px 'Playfair Display'"), document.fonts.load("600 20px 'Playfair Display'"), document.fonts.load("500 20px 'Montserrat'")]) : Promise.resolve();
  Promise.race([fonts, new Promise(function (r) { setTimeout(r, 2500); })]).catch(function () {}).then(start);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (started && !opened) build(); });
})();
