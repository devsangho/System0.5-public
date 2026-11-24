/* System 0.5 project page: motion graphics and data charts.
   Data: window.S05 (static/data.js, generated from the result files) and window.S05_CLIPS (static/ur5e/manifest.js). */
(() => {
"use strict";
const D = window.S05, CLIPS = window.S05_CLIPS || [];
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const C = {ink:"#10141b", body:"#3b434e", muted:"#69717c", faint:"#8b939e", blue:"#3f5876", blue2:"#5c7699", bl:"#778daa",
  coral:"#e68670", coral2:"#c9644d", peach:"#f7d8ca", slate:"#8b939e", line:"rgba(16,20,27,.09)", night:"#111720",
  nink:"#f2f4f7", nbody:"#c9d1dc", nmuted:"#9aa6b5", nline:"#263140"};
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 4);          // close to cubic-bezier(.16,1,.3,1)
const ease3 = t => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const FONT = '"Pretendard Variable","Geist",system-ui,sans-serif', MONO = '"Geist Mono",ui-monospace,monospace';
// signal colour along the brand gradient (blue -> coral), t in [0,1]
const STOPS = [[0, [63, 88, 118]], [.3, [92, 118, 153]], [.7, [217, 118, 95]], [1, [201, 100, 77]]];
function sig(t, a = 1) {
  t = clamp(t, 0, 1); let i = 0; while (i < STOPS.length - 2 && t > STOPS[i + 1][0]) i++;
  const [t0, c0] = STOPS[i], [t1, c1] = STOPS[i + 1], u = (t - t0) / (t1 - t0);
  return `rgba(${c0.map((c, k) => Math.round(lerp(c, c1[k], u))).join(",")},${a})`;
}
function gradH(ctx, x0, x1) { const g = ctx.createLinearGradient(x0, 0, x1, 0); STOPS.forEach(([t]) => g.addColorStop(t, sig(t))); return g; }

/* ---------- canvas helper: DPR, resize, visibility-gated rAF ---------- */
function stage(cv, aspect, draw, opts = {}) {
  const ctx = cv.getContext("2d"); let w = 0, h = 0, vis = false, raf = 0, last = 0;
  const st = {ctx, get w() { return w; }, get h() { return h; }, t: 0, draw, running: !RM && !opts.static};
  function size() {
    const r = cv.getBoundingClientRect(); w = r.width; h = Math.round(w / (typeof aspect === "function" ? aspect(w) : aspect));
    cv.style.height = h + "px"; const k = devicePixelRatio || 1; cv.width = Math.round(w * k); cv.height = Math.round(h * k);
    ctx.setTransform(k, 0, 0, k, 0, 0); frame(0);
  }
  function frame(dt) { ctx.clearRect(0, 0, w, h); st.draw(st, dt); }
  function loop(ts) { const dt = last ? Math.min(.05, (ts - last) / 1000) : 0; last = ts; st.t += dt; frame(dt); raf = vis && st.running ? requestAnimationFrame(loop) : 0; }
  st.kick = () => { if (!raf && vis && st.running) { last = 0; raf = requestAnimationFrame(loop); } else if (!st.running) frame(0); };
  st.redraw = () => frame(0);
  let lastW = -1;  // resize only when the width changes; setting the height must not re-trigger the observer
  new ResizeObserver(es => { const nw = Math.round(es[0].contentRect.width); if (nw !== lastW) { lastW = nw; requestAnimationFrame(size); } }).observe(cv);
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) st.kick(); }, {rootMargin: "80px"}).observe(cv);
  size(); return st;
}
function onReveal(el, cb, th = .25) {
  if (!el) return;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.disconnect(); cb(); } }), {threshold: th});
  io.observe(el);
}
function tween(dur, fn, done) {
  if (RM) { fn(1); done && done(); return; }
  const t0 = performance.now(); const step = now => { const t = clamp((now - t0) / dur, 0, 1); fn(t); if (t < 1) requestAnimationFrame(step); else done && done(); };
  requestAnimationFrame(step);
}
function chips(group, cb) {
  $$("button.chip", group).forEach(b => b.addEventListener("click", () => {
    $$("button.chip", group).forEach(x => x.classList.toggle("on", x === b)); cb(b.dataset.k ?? b.dataset.s ?? b.dataset.f, b);
  }));
}
function txt(ctx, s, x, y, {size = 12, color = C.muted, font = FONT, weight = 500, align = "left", base = "alphabetic"} = {}) {
  ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y);
}
function txtBg(ctx, s, x, y, o = {}, bg = "#fff") {
  ctx.font = `${o.weight || 500} ${o.size || 12}px ${o.font || FONT}`; const tw = ctx.measureText(s).width, sz = o.size || 12;
  const x0 = o.align === "right" ? x - tw : o.align === "center" ? x - tw / 2 : x;
  ctx.fillStyle = bg; ctx.fillRect(x0 - 3, y - sz, tw + 6, sz + 5); txt(ctx, s, x, y, o);
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function ring(ctx, x, y, r, col, a = 1) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.stroke(); ctx.globalAlpha = 1; }
function dot(ctx, x, y, r, col) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = col; ctx.fill(); }
function arrow(ctx, x0, y0, x1, y1, col, {dash = null, lw = 1.4, head = 6} = {}) {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
  const a = Math.atan2(y1 - y0, x1 - x0); if (Math.hypot(x1 - x0, y1 - y0) < 2) return;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - head * Math.cos(a - .45), y1 - head * Math.sin(a - .45));
  ctx.lineTo(x1 - head * Math.cos(a + .45), y1 - head * Math.sin(a + .45)); ctx.closePath(); ctx.fill();
}
function polyline(ctx, pts, upto, stroke, lw = 2, dash = null) {
  if (upto <= 0 || pts.length < 2) return; const n = Math.floor(upto), f = upto - n;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= Math.min(n, pts.length - 1); i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (n < pts.length - 1 && f > 0) ctx.lineTo(lerp(pts[n][0], pts[n + 1][0], f), lerp(pts[n][1], pts[n + 1][1], f));
  ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
}
function at(pts, u) { const n = clamp(Math.floor(u), 0, pts.length - 1), m = Math.min(n + 1, pts.length - 1), f = u - n; return [lerp(pts[n][0], pts[m][0], f), lerp(pts[n][1], pts[m][1], f)]; }

/* ================= reveal, nav, counters ================= */
const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } }), {threshold: .12, rootMargin: "0px 0px -6% 0px"});
$$(".rv, .stat").forEach(el => ro.observe(el));
const wm = $(".wordmark");
if (wm && !RM) { wm.innerHTML = [..."System"].map((x, i) => `<span class="ch" style="--i:${i}">${x}</span>`).join("") + ' <span class="num num-in">0.5</span>'; }  // gradient text: opacity only (clip-path/transform/filter on background-clip:text renders doubled in Safari)
// hero title never wider than its column, whatever font the browser ends up using
(() => {
  const el = $(".brand-hero"); if (!el) return;
  const fit = () => {
    el.style.fontSize = ""; const avail = el.parentElement.getBoundingClientRect().width;
    let fs = parseFloat(getComputedStyle(el).fontSize);
    for (let k = 0; k < 40 && el.scrollWidth > avail + 1 && fs > 36; k++) { fs *= .97; el.style.fontSize = fs + "px"; }
  };
  let lastW = -1;  // refit on width changes only; the font size itself changes the column's height
  const onResize = es => { const w = Math.round(es[0].contentRect.width); if (w !== lastW) { lastW = w; requestAnimationFrame(fit); } };
  fit(); document.fonts && document.fonts.ready.then(fit); addEventListener("load", fit); new ResizeObserver(onResize).observe(el.parentElement);
})();
const navLinks = $$(".site-nav a");
// stat band backdrop: the UR5e placement clips as a muted footage mosaic (as on the GROOVE page)
(() => {
  const box = $("#mosaic"); if (!box || !CLIPS.length) return;
  const io = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); }), {rootMargin: "200px"});
  for (let i = 0; i < 48; i++) {
    const c = CLIPS[(i * 7) % CLIPS.length], v = document.createElement("video");
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none"; v.dataset.src = c.video; v.poster = c.poster;
    box.appendChild(v); if (!RM) io.observe(v);
  }
})();
const navIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id)); }), {rootMargin: "-45% 0px -50% 0px"});
$$("section[id]").forEach(s => navIO.observe(s));
$$("[data-count]").forEach(el => onReveal(el.closest(".stat"), () => {
  const to = +el.dataset.count, from = el.dataset.from ? +el.dataset.from : 0, dec = +el.dataset.dec || 0;
  tween(1400, t => { el.textContent = lerp(from, to, ease(t)).toFixed(dec); });
}));

/* ================= 0. HERO: chunk -> System 0.5 -> System 0 ================= */
(() => {
  const cv = $("#hero-cv"); if (!cv) return;
  const N = 10, T = 8;
  const raw = [.0, .5, .9, 1.0, .75, .3, -.15, -.5, -.6, -.4];            // command pattern (schematic)
  const fix = [.0, .25, .45, .55, .5, .35, .2, .1, .05, .05];             // corrected pattern
  stage(cv, w => w < 420 ? .82 : .98, (s) => {
    const {ctx, w, h} = s, t = RM ? 7.0 : s.t % T;
    const X0 = w * .08, X1 = w * .92, bw = X1 - X0, xs = i => X0 + bw * (.1 + .8 * i / (N - 1));
    const B = [{y: h * .04, hh: h * .17, name: "VLA", sub: "System 2 / 1 · frozen π0.5"},
               {y: h * .33, hh: h * .17, name: "System 0.5", sub: "identify · correct · 1 ms per tick"},
               {y: h * .62, hh: h * .34, name: "System 0", sub: "controller + robot body · changed"}];
    // signal spine
    const sx = X0 + bw * .5; ctx.strokeStyle = "rgba(119,141,170,.35)"; ctx.lineWidth = 1; ctx.setLineDash([2, 5]);
    ctx.beginPath(); ctx.moveTo(sx, B[0].y + B[0].hh); ctx.lineTo(sx, B[2].y); ctx.stroke(); ctx.setLineDash([]);
    B.forEach((b, k) => {
      rr(ctx, X0, b.y, bw, b.hh, 16); ctx.fillStyle = k === 1 ? "rgba(255,255,255,.78)" : "rgba(255,255,255,.5)"; ctx.fill();
      ctx.lineWidth = k === 1 ? 1.6 : 1; ctx.strokeStyle = k === 1 ? gradH(ctx, X0, X1) : "rgba(16,20,27,.12)"; ctx.stroke();
      txt(ctx, b.name, X0 + 16, b.y + 24, {size: 15, color: C.ink, weight: 650, font: '"Geist",' + FONT});
      ctx.font = `650 15px "Geist",${FONT}`; const nw = ctx.measureText(b.name).width; ctx.font = `500 9.5px ${MONO}`; const sw = ctx.measureText(b.sub.toUpperCase()).width;
      const fits = 16 + nw + 18 + sw + 14 <= bw;
      txt(ctx, b.sub.toUpperCase(), X1 - 14, fits ? b.y + 22 : b.y + b.hh - 10, {size: fits ? 9.5 : 8.5, color: C.faint, font: MONO, align: "right"});
    });
    // beam scanning System 0.5 while correcting
    const cy = [B[0].y + B[0].hh * .62, B[1].y + B[1].hh * .62];
    const plotY = B[2].y + B[2].hh * .58, amp = B[2].hh * .26, amp1 = B[0].hh * .2;
    const p1 = ease3((t - .5) / 1.4), p2 = ease3((t - 2.0) / 1.1), p3 = ease3((t - 3.3) / 1.2), pd = ease3((t - 4.6) / 1.8);
    const fade = t > 7.4 ? 1 - (t - 7.4) / .6 : 1;
    if (t > 1.9 && t < 3.3) {
      const u = (t - 1.9) / 1.4, bx = lerp(X0, X1, u); const g = ctx.createLinearGradient(bx - 60, 0, bx + 10, 0);
      g.addColorStop(0, "rgba(230,134,112,0)"); g.addColorStop(1, "rgba(230,134,112,.22)"); ctx.fillStyle = g;
      ctx.save(); rr(ctx, X0, B[1].y, bw, B[1].hh, 16); ctx.clip(); ctx.fillRect(bx - 60, B[1].y, 70, B[1].hh); ctx.restore();
    }
    // the changed System 0 without a layer: path of the raw chunk with gain 1.7 (ghost)
    const nomPts = fix.map((v, i) => [xs(i), plotY - v * amp]);
    const rawPts = []; { let y = 0; for (let i = 0; i < N; i++) { y += (i ? (raw[i] - raw[i - 1]) : 0) * 1.0; rawPts.push([xs(i), plotY - (fix[i] + (raw[i] - fix[i]) * 1.0 + i * .03 * 1.7 * (i > 3 ? 1 : 0)) * amp * 1.25]); } }
    ctx.globalAlpha = fade;
    if (pd > 0) {
      polyline(ctx, nomPts, (N - 1), "rgba(63,88,118,.28)", 1.2, [3, 4]);
      polyline(ctx, rawPts, pd * (N - 1), "rgba(139,147,158,.9)", 1.6, [5, 4]);
      polyline(ctx, nomPts, pd * (N - 1), gradH(ctx, X0, X1), 2.6);
      if (pd > .98) {
        const [ex, ey] = rawPts[N - 1], [nx, ny] = nomPts[N - 1], up = ny <= ey;
        txtBg(ctx, "nominal", nx, up ? ny - 10 : ny + 18, {size: 10.5, color: C.coral2, font: MONO, align: "right"}, "rgba(247,248,246,.94)");
        txtBg(ctx, "no layer", ex, up ? ey + 18 : ey - 10, {size: 10.5, color: C.muted, font: MONO, align: "right"}, "rgba(247,248,246,.94)");
      }
      txt(ctx, "hand path", X0 + 16, B[2].y + B[2].hh - 12, {size: 10, color: C.faint, font: MONO});
    }
    // chunk dots
    for (let i = 0; i < N; i++) {
      const st = .5 + i * .05, a = ease3((t - st) / .5); if (t < st) continue;
      const yRaw = cy[0] - raw[i] * amp1, yFix = cy[1] - fix[i] * amp1;
      let x = xs(i), y = lerp(B[0].y + B[0].hh * .2, yRaw, a);
      if (p1 > 0) y = lerp(yRaw, cy[1] - raw[i] * amp1, p1);
      if (p2 > 0) y = lerp(cy[1] - raw[i] * amp1, yFix, p2);
      if (p3 > 0) y = lerp(yFix, nomPts[i][1], p3);
      const corrected = t > 1.9 + i * .14;
      const col = corrected ? sig(i / (N - 1)) : C.slate;
      if (p3 >= 1) { dot(ctx, x, y, 3.2, col); continue; }
      dot(ctx, x, y, 4.2, col);
      if (corrected && p2 > 0 && p2 < 1) ring(ctx, x, y, 4 + 10 * p2, sig(i / 9), 1 - p2);
      if (p2 > 0 && p3 === 0) { ctx.strokeStyle = "rgba(139,147,158,.45)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, cy[1] - raw[i] * amp1); ctx.lineTo(x, y); ctx.stroke(); }
    }
    if (t > .5 && p1 < 1) txt(ctx, "chunk · 10 actions", xs(0), B[0].y + B[0].hh - 8, {size: 10, color: C.faint, font: MONO});
    if (p2 > 0 && p3 < .5) txt(ctx, "Δu per command", xs(0), B[1].y + B[1].hh - 8, {size: 10, color: C.coral2, font: MONO});
    ctx.globalAlpha = 1;
  });
})();

/* ================= 1. PROBLEM: recorded replay ================= */
(() => {
  const cv = $("#replay-cv"), gv = $("#gap-cv"); if (!cv) return;
  const P = D.problem, keys = ["kp", "delay", "load", "worn"], NT = P.nominal.length, TICK = .15; // 1/3 of real speed
  // two horizontal axes with the largest spread
  const all = [P.nominal, ...keys.map(k => P[k])];
  const varOf = j => { const v = all.flat().map(p => p[j]); const m = v.reduce((a, b) => a + b) / v.length; return v.reduce((a, b) => a + (b - m) ** 2, 0); };
  const ax = [0, 1, 2].sort((a, b) => varOf(b) - varOf(a)).slice(0, 2).sort();
  const gap = k => P[k].map((p, i) => Math.hypot(...p.map((v, j) => v - P.nominal[i][j])));
  const G = Object.fromEntries(keys.map(k => [k, gap(k)])), gmax = Math.max(...keys.flatMap(k => G[k]));
  let sel = "kp", t0 = 0, gs = null;
  const st = stage(cv, 1.18, (s) => {
    const {ctx, w, h} = s; const u = RM ? NT - 1 : clamp((s.t - t0 - .4) / TICK, 0, NT - 1);
    const pts = all.flat(); const xs = pts.map(p => p[ax[0]]), ys = pts.map(p => p[ax[1]]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const pad = 46, sc = Math.min((w - 2 * pad) / (x1 - x0), (h - 2 * pad) / (y1 - y0));
    const ox = (w - (x1 - x0) * sc) / 2, oy = (h - (y1 - y0) * sc) / 2;
    const M = p => [ox + (p[ax[0]] - x0) * sc, h - (oy + (p[ax[1]] - y0) * sc)];
    // scale bar 50 mm
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(16, h - 16); ctx.lineTo(16 + 50 * sc, h - 16); ctx.stroke();
    txt(ctx, "50 mm", 16, h - 22, {size: 10, font: MONO, color: C.faint});
    txt(ctx, "TOP VIEW · LIBERO-SPATIAL · π0.5", 16, 22, {size: 10, font: MONO, color: C.faint});
    const nom = P.nominal.map(M), chg = P[sel].map(M);
    keys.filter(k => k !== sel).forEach(k => polyline(ctx, P[k].map(M), NT - 1, "rgba(139,147,158,.16)", 1));
    polyline(ctx, nom, NT - 1, "rgba(63,88,118,.12)", 1);
    polyline(ctx, chg, u, C.slate, 2, [6, 4]);
    polyline(ctx, nom, u, gradH(ctx, Math.min(...nom.map(p => p[0])), Math.max(...nom.map(p => p[0]))), 2.8);
    for (let i = 0; i <= Math.floor(u); i += P.n_exec) { ring(ctx, ...nom[i], 5, C.blue, .7); dot(ctx, ...chg[i], 2.2, C.slate); }
    const a = at(nom, u), b = at(chg, u);
    ctx.strokeStyle = C.coral; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
    dot(ctx, ...a, 5, sig(u / (NT - 1))); dot(ctx, ...b, 4.5, C.slate); ring(ctx, ...b, 9, C.coral, .5);
    txt(ctx, "start", nom[0][0] - 10, nom[0][1] + 4, {size: 11, color: C.muted, font: MONO, align: "right"});
    const i0 = Math.floor(u), g = lerp(G[sel][i0], G[sel][Math.min(i0 + 1, NT - 1)], u - i0);
    $("#rp-tick").textContent = Math.round(u); $("#rp-time").textContent = (u * P.dt).toFixed(2) + " s";
    $("#rp-gap").textContent = g.toFixed(1) + " mm"; $("#rp-chunk").textContent = Math.min(Math.floor(u / P.n_exec) + 1, 6);
    if (gs) { gs.u = u; gs.redraw(); }
  });
  const NAMES = {kp: "gain ×2", delay: "delay 3", load: "payload", worn: "worn"};
  gs = stage(gv, 1.18, (s) => {
    const {ctx, w, h} = s, u = s.u ?? 0, L = 48, R = w - 72, T = 34, B = h - 40;
    const X = i => L + (R - L) * i / (NT - 1), Y = v => B - (B - T) * v / (gmax * 1.08);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    for (let v = 0; v <= gmax; v += 20) { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(R, Y(v)); ctx.stroke(); txt(ctx, v + "", L - 8, Y(v) + 4, {size: 10, font: MONO, color: C.faint, align: "right"}); }
    for (let i = 0; i < NT; i += P.n_exec) { ctx.strokeStyle = "rgba(63,88,118,.12)"; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(X(i), T); ctx.lineTo(X(i), B); ctx.stroke(); ctx.setLineDash([]); }
    txt(ctx, "GAP FROM NOMINAL (mm)", L, 20, {size: 10, font: MONO, color: C.faint});
    [0, .5, 1, 1.5].forEach(s_ => txt(ctx, s_ + " s", X(s_ / P.dt), B + 18, {size: 10, font: MONO, color: C.faint, align: "center"}));
    txt(ctx, "new chunk every 5 ticks", R, B + 34, {size: 10, font: MONO, color: C.faint, align: "right"});
    keys.forEach(k => {
      const pts = G[k].map((v, i) => [X(i), Y(v)]);
      if (k === sel) polyline(ctx, pts, u, C.coral, 2.4); else polyline(ctx, pts, NT - 1, "rgba(139,147,158,.4)", 1.2);
      const end = k === sel ? at(pts, u) : pts[NT - 1];
      if (k === sel) dot(ctx, ...end, 4, C.coral);
      txt(ctx, NAMES[k], R + 8, (k === sel ? end : pts[NT - 1])[1] + 4, {size: 10.5, font: MONO, color: k === sel ? C.coral2 : C.faint, weight: k === sel ? 600 : 400});
    });
  }, {static: true});
  const restart = () => { t0 = st.t; st.kick(); };
  chips($("#replay-chips"), k => { sel = k; restart(); });
  $("#replay-btn").addEventListener("click", restart);
  onReveal(cv, restart, .4);
})();

/* ================= 2a. TARGET: command vs nominal ================= */
(() => {
  const cv = $("#cmd-cv"); if (!cv) return;
  const N = 10, RATIO = .22, PER = .55, T = N * PER + 2.6;
  const ang = i => -.75 + .13 * i;
  stage(cv, 1.55, (s) => {
    const {ctx, w, h} = s, t = RM ? T - 1 : s.t % T, k = clamp(t / PER, 0, N);
    const L = (w * .8) / N * .98, sx = w * .1, sy = h * .78;
    const cmd = [[sx, sy]], nom = [[sx, sy]];
    for (let i = 0; i < N; i++) {
      const dx = Math.cos(ang(i)) * L, dy = Math.sin(ang(i)) * L;
      cmd.push([cmd[i][0] + dx, cmd[i][1] + dy]); nom.push([nom[i][0] + dx * RATIO, nom[i][1] + dy * RATIO]);
    }
    // the region of states the demonstrations cover, around the nominal path
    const g = ctx.createRadialGradient(nom[5][0], nom[5][1], 4, nom[5][0], nom[5][1], L * 2.4);
    g.addColorStop(0, "rgba(247,216,202,.75)"); g.addColorStop(1, "rgba(247,216,202,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nom[5][0], nom[5][1], L * 2.4, 0, 7); ctx.fill();
    txt(ctx, "STATES IN THE DEMONSTRATIONS", 14, nom[5][1] + L * 1.7, {size: 9.5, font: MONO, color: C.coral2});
    // current commanded step from the nominal hand: the target it asks for
    const i = Math.min(Math.floor(k), N - 1), f = k - Math.floor(k);
    if (k < N) {
      const p = at(nom, k), dx = Math.cos(ang(i)) * L, dy = Math.sin(ang(i)) * L;
      arrow(ctx, p[0], p[1], p[0] + dx, p[1] + dy, C.blue, {dash: [4, 3], lw: 1.3});
      txt(ctx, "commanded step", p[0] + dx + 6, p[1] + dy - 6, {size: 10.5, font: MONO, color: C.blue});
    }
    for (let j = 0; j < Math.floor(k) && j < N; j++) { const dx = Math.cos(ang(j)) * L, dy = Math.sin(ang(j)) * L; ctx.globalAlpha = .18; arrow(ctx, nom[j][0], nom[j][1], nom[j][0] + dx, nom[j][1] + dy, C.blue, {dash: [3, 3], lw: 1, head: 4}); ctx.globalAlpha = 1; }
    polyline(ctx, cmd, k, C.slate, 2.2);
    polyline(ctx, nom, k, gradH(ctx, sx, nom[N][0] + 10), 3.2);
    const pc = at(cmd, k), pn = at(nom, k);
    dot(ctx, ...pc, 6, C.slate); dot(ctx, ...pn, 6, sig(.85)); ring(ctx, ...pn, 11, C.coral, .45);
    txt(ctx, "follow the command", pc[0] - 4, pc[1] + 22, {size: 11, color: C.body, weight: 600, align: "right"});
    txt(ctx, "nominal", pn[0] + 12, pn[1] + 18, {size: 11, color: C.coral2, weight: 600});
    txt(ctx, `TICK ${Math.min(Math.floor(k), N)} / ${N}`, 16, 22, {size: 10, font: MONO, color: C.faint});
    txt(ctx, `per tick: nominal ${RATIO.toFixed(2)} · command 1.00 of the step`, 16, 38, {size: 10, font: MONO, color: C.faint});
    if (k >= N) txt(ctx, `${(1 / RATIO).toFixed(1)}× farther per tick`, pc[0] - 4, pc[1] + 40, {size: 12, font: MONO, color: C.ink, weight: 600, align: "right"});
  });
})();
function hbars(el, rows, {max = 100, marker = null, markerLabel = ""} = {}) {
  el.innerHTML = rows.map(r => `<div class="row ${r.cls || ""}"><span class="nm">${r.name}${r.sub ? `<span class="sub">${r.sub}</span>` : ""}</span><span class="tr">${marker != null ? `<span class="mark-line" style="left:${marker / max * 100}%" title="${markerLabel}"></span>` : ""}<i></i></span><span class="val" data-v="${r.v}">0.0</span></div>`).join("");
  onReveal(el, () => {
    $$(".row", el).forEach((row, i) => setTimeout(() => {
      const v = rows[i].v; $("i", row).style.width = (v / max * 100) + "%";
      const o = $(".val", row); tween(1200, t => { o.textContent = (v * ease(t)).toFixed(1) + (rows[i].unit || "%"); });
    }, RM ? 0 : i * 120));
  }, .3);
}
(() => {
  const A = Object.fromEntries(D.ablation.map(r => [r.key, r]));
  hbars($("#target-bars"), [
    {name: "Target: nominal execution", sub: "System 0.5", v: A["L13-L13v3"].out, cls: "ours"},
    {name: "Pass-through", sub: "no layer", v: A.PASS.out},
    {name: "Target: one-tick nominal", sub: "next tick only", v: A["L13-L13v3-one"].out},
    {name: "Target: command", sub: "follow the command", v: A["L13-L13v3-cmd"].out, cls: "warn"},
  ], {marker: A.PASS.out, markerLabel: "pass-through"});
})();

/* ================= 2b. TARGET: restart at every chunk ================= */
(() => {
  const cv = $("#restart-cv"); if (!cv) return;
  const N = 30, CH = 5, PER = .2, T = N * PER + 2.2; let mode = "chunk", t0 = 0;
  const G = 1.35, PHI = .3;
  const dir = i => -.35 + .5 * Math.sin(i / 7);
  const st = stage(cv, 1.5, (s) => {
    const {ctx, w, h} = s, t = RM ? T - .5 : (s.t - t0) % T, k = clamp(t / PER, 0, N);
    const L = w * .022, sx = w * .06, sy = h * .55;
    const d = [...Array(N)].map((_, i) => [Math.cos(dir(i)) * L, Math.sin(dir(i)) * L]);
    const act = [[sx, sy]]; d.forEach(([x, y], i) => act.push([act[i][0] + G * (x * Math.cos(PHI) - y * Math.sin(PHI)), act[i][1] + G * (x * Math.sin(PHI) + y * Math.cos(PHI))]));
    const refs = [];
    if (mode === "chunk") for (let c = 0; c < N; c += CH) { const r = [act[c].slice()]; for (let j = 0; j < CH; j++) r.push([r[j][0] + d[c + j][0], r[j][1] + d[c + j][1]]); refs.push({s: c, pts: r}); }
    else { const r = [act[0].slice()]; d.forEach(([x, y], i) => r.push([r[i][0] + x, r[i][1] + y])); refs.push({s: 0, pts: r}); }
    let err = 0, emax = 0;
    refs.forEach(r => {
      if (k < r.s) return; const u = Math.min(k - r.s, r.pts.length - 1);
      polyline(ctx, r.pts, u, gradH(ctx, r.pts[0][0], r.pts[r.pts.length - 1][0] + 1), 2.2, [5, 4]);
      const age = k - r.s; if (mode === "chunk" && age < 1.2) ring(ctx, ...r.pts[0], 5 + 12 * age, C.coral, 1 - age / 1.2);
      ring(ctx, ...r.pts[0], 4.5, C.blue, .8);
      for (let j = 1; j <= Math.floor(u); j++) { const e = Math.hypot(act[r.s + j][0] - r.pts[j][0], act[r.s + j][1] - r.pts[j][1]) / L; emax = Math.max(emax, e); }
    });
    polyline(ctx, act, k, C.slate, 2.2);
    const cur = refs.filter(r => k >= r.s).pop(); const uu = Math.min(k - cur.s, cur.pts.length - 1);
    const a = at(act, k), b = at(cur.pts, uu); err = Math.hypot(a[0] - b[0], a[1] - b[1]) / L;
    ctx.strokeStyle = C.coral; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
    dot(ctx, ...a, 5, C.slate); dot(ctx, ...b, 4.5, sig(.8));
    txt(ctx, mode === "chunk" ? "REFERENCE RESTARTS FROM THE ACTUAL STATE AT EVERY CHUNK" : "ONE REFERENCE FROM THE EPISODE START", 16, 22, {size: 10, font: MONO, color: C.faint});
    txt(ctx, "schematic · changed System 0: gain 1.35, rotated 17°", 16, h - 14, {size: 10, font: MONO, color: C.faint});
    $("#rs-err").textContent = err.toFixed(1) + " steps"; $("#rs-max").textContent = emax.toFixed(1) + " steps";
  });
  chips($("#restart-chips"), k => { mode = k; t0 = st.t; st.kick(); });
})();

/* ================= 3. METHOD: deployment pipeline (SVG) ================= */
(() => {
  const svg = $("#pipe"); if (!svg) return;
  const NS = "http://www.w3.org/2000/svg", el = (n, a, p = svg) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  const defs = el("defs", {}), lg = el("linearGradient", {id: "pg", x1: 0, x2: 1, y1: 0, y2: 0}, defs);
  [["0", "#c3d1e4"], [".3", "#97aecc"], [".7", "#f09a82"], ["1", "#f7d8ca"]].forEach(([o, c]) => el("stop", {offset: o, "stop-color": c}, lg));
  const nodes = {
    vla: {x: 24, y: 24, w: 130, h: 64, t: "VLA", s: "π0.5 · frozen"},
    hist: {x: 190, y: 146, w: 150, h: 76, t: "History", s: "last 48 ticks · 2.4 s"},
    rls: {x: 190, y: 238, w: 150, h: 62, t: "RLS statistics", s: "maps M0…M4"},
    enc: {x: 380, y: 178, w: 100, h: 94, t: "Encoder", s: "→ z ∈ R64"},
    head: {x: 520, y: 166, w: 120, h: 118, t: "Action head", s: "α · δK · δk · r"},
    s0: {x: 520, y: 336, w: 210, h: 66, t: "System 0", s: "controller + robot · unknown"},
  };
  const frame = el("rect", {x: 170, y: 120, width: 488, height: 196, rx: 16, fill: "rgba(255,255,255,.02)", stroke: "url(#pg)", "stroke-width": 1.2, "stroke-dasharray": "5 5"});
  el("text", {x: 186, y: 140, fill: "#f2f4f7", "font-size": 13, "font-weight": 650, "font-family": "Geist,sans-serif"}).textContent = "System 0.5";
  const paths = {
    chunk: "M154 56 L 580 56 L 580 166",
    meas: "M 625 402 L 625 418 L 120 418 L 120 181 L 190 181",
    h2r: "M 265 222 L 265 238",
    h2e: "M 340 181 L 380 205", r2e: "M 340 269 L 380 245",
    e2h: "M 480 225 L 520 225",
    u: "M 600 284 L 600 336",
  };
  const P = {}; for (const k in paths) P[k] = el("path", {d: paths[k], fill: "none", stroke: "#2b3646", "stroke-width": 1.4, "stroke-dasharray": k === "meas" ? "4 4" : ""});
  el("text", {x: 300, y: 48, fill: "#9aa6b5", "font-size": 11, "font-family": "Geist Mono,monospace"}).textContent = "chunk A(n): 10 actions";
  el("text", {x: 612, y: 330, fill: "#9aa6b5", "font-size": 11, "font-family": "Geist Mono,monospace"}).textContent = "u = clip(a + Δu)";
  el("text", {x: 130, y: 410, fill: "#9aa6b5", "font-size": 11, "font-family": "Geist Mono,monospace"}).textContent = "measured: hand motion · wrist force · joint velocity";
  const N = {};
  for (const k in nodes) {
    const n = nodes[k], g = el("g", {});
    const shape = k === "enc" ? el("path", {d: `M${n.x} ${n.y} L${n.x + n.w} ${n.y + 18} L${n.x + n.w} ${n.y + n.h - 18} L${n.x} ${n.y + n.h} Z`, fill: "#18202b", stroke: "#263140", "stroke-width": 1.2}, g)
      : el("rect", {x: n.x, y: n.y, width: n.w, height: n.h, rx: 10, fill: "#18202b", stroke: "#263140", "stroke-width": 1.2}, g);
    el("text", {x: n.x + 12, y: n.y + 24, fill: "#f2f4f7", "font-size": 13.5, "font-weight": 600, "font-family": "Geist,sans-serif"}, g).textContent = n.t;
    el("text", {x: n.x + 12, y: n.y + 43, fill: "#9aa6b5", "font-size": 10.5, "font-family": "Geist Mono,monospace"}, g).textContent = n.s;
    N[k] = {g, shape};
  }
  // little glyphs: history traces, RLS bars, z vector, head bars
  const hg = el("g", {}); for (let j = 0; j < 3; j++) { let d = ""; for (let x = 0; x <= 126; x += 6) d += (x ? "L" : "M") + (nodes.hist.x + 12 + x) + " " + (nodes.hist.y + 64 - j * 4 + 3 * Math.sin(x / 11 + j * 2)); el("path", {d, stroke: "#5c7699", "stroke-opacity": .35 + .2 * j, fill: "none", "stroke-width": 1}, hg); }
  const rlsBars = [0, 1, 2, 3, 4].map(d => el("rect", {x: nodes.rls.x + 92 + d * 10, y: nodes.rls.y + 40, width: 7, height: 12, rx: 1.5, fill: d === 2 ? "url(#pg)" : "#3a4658"}));
  const zc = [...Array(8)].map((_, i) => el("rect", {x: 490, y: 192 + i * 9, width: 18, height: 6, rx: 1.5, fill: "#3a4658"}));
  el("text", {x: 492, y: 186, fill: "#c9d1dc", "font-size": 12, "font-style": "italic", "font-family": "Geist,sans-serif"}).textContent = "z";
  const pulses = el("g", {});
  const CAP = [
    "<b>The VLA emits a chunk</b> of ten actions (end-effector translation, rotation and gripper). The VLA stays frozen; the gripper command passes through unchanged.",
    "<b>After every tick</b> the layer appends one entry: hand motion over the tick, wrist force, joint velocities, the command sent, the action the VLA had planned and the gripper command. RLS fits a map per lag d = 0…4 with a forgetting time of 20 s.",
    "<b>The encoder</b> turns the 48-entry window and the RLS statistics into z ∈ R<sup>64</sup>, a summary of the current System 0. Nothing about System 0's parameters is given.",
    "<b>The action head</b> reads z, the statistics, the last three entries and the current chunk, and outputs the lead mix α, the matrix δK, the factors δk and a residual r.",
    "<b>It sends</b> u = clip(a + Δu, −1, 1). System 0 moves the arm; the measured motion becomes the next history entry, closing the loop at 20 Hz.",
  ];
  const SEQ = [[["chunk", 10]], [["meas", 4], ["h2r", 2]], [["h2e", 3], ["r2e", 3]], [["e2h", 4]], [["u", 3], ["meas", 3]]];
  const ACT = [["vla", "head"], ["hist", "rls"], ["hist", "rls", "enc"], ["enc", "head"], ["head", "s0"]];
  let step = 0, tStep = 0, last = 0; const DUR = 3.6;
  const btns = $$("#pipe-steps button");
  function setStep(s) {
    step = s; tStep = 0;
    btns.forEach((b, i) => { b.classList.toggle("on", i === s); b.style.setProperty("--dur", DUR + "s"); b.classList.remove("on"); void b.offsetWidth; b.classList.toggle("on", i === s); });
    $("#pipe-cap").innerHTML = CAP[s];
    for (const k in N) { const on = ACT[s].includes(k); N[k].shape.setAttribute("stroke", on ? "url(#pg)" : "#263140"); N[k].shape.setAttribute("stroke-width", on ? 1.8 : 1.2); N[k].g.style.opacity = on ? 1 : .55; }
    for (const k in P) P[k].setAttribute("stroke", SEQ[s].some(q => q[0] === k) ? "#56637a" : "#2b3646");
    rlsBars.forEach((b, d) => b.setAttribute("height", s >= 1 ? (d === 2 ? 14 : 4 + d) : 4));
    zc.forEach((c, i) => c.setAttribute("fill", s >= 2 ? `rgba(${[195 - i * 3, 160 + i * 4, 150 - i * 6]},.${7 + (i % 3)})` : "#3a4658"));
  }
  btns.forEach((b, i) => b.addEventListener("click", () => setStep(i)));
  setStep(0);
  let vis = false;
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis && !RM) requestAnimationFrame(loop); }, {threshold: .2}).observe(svg);
  function loop(ts) {
    const dt = last ? Math.min(.05, (ts - last) / 1000) : 0; last = ts; tStep += dt;
    if (tStep > DUR) setStep((step + 1) % 5);
    pulses.innerHTML = "";
    SEQ[step].forEach(([k, n], qi) => {
      const p = P[k], L = p.getTotalLength();
      for (let i = 0; i < n; i++) {
        const u = (tStep / (DUR * .8)) * 1.25 - i * (k === "chunk" ? .06 : .14) - qi * .1; if (u < 0 || u > 1) continue;
        const pt = p.getPointAtLength(ease3(u) * L);
        el("circle", {cx: pt.x, cy: pt.y, r: k === "chunk" ? 3.6 : 3.2, fill: k === "chunk" ? "#9aa6b5" : `url(#pg)`}, pulses);
        if (k !== "chunk") el("circle", {cx: pt.x, cy: pt.y, r: 3.2, fill: "#f09a82", opacity: .8}, pulses);
      }
    });
    if (vis) requestAnimationFrame(loop); else last = 0;
  }
})();

/* ================= 3b. live RLS lag identification ================= */
(() => {
  const cv = $("#rls-cv"); if (!cv) return;
  const LAG = 5, LAM = .97, HIST = 48, NOISE = .12;
  let dly = 2, gain = 1.5; const U = [], M = [];
  const th = Array(LAG).fill(0), Pm = Array(LAG).fill(10), shown = Array(LAG).fill(0);
  let rng = 7; const rand = () => { rng = (rng * 16807) % 2147483647; return rng / 2147483647; };
  const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());
  function tick() {
    const u = clamp(gauss() * .55, -1, 1); U.push(u);
    const m = (U.length > dly ? gain * U[U.length - 1 - dly] : 0) + NOISE * gauss(); M.push(m);
    for (let d = 0; d < LAG; d++) {
      const x = U.length > d ? U[U.length - 1 - d] : 0, k = Pm[d] * x / (LAM + x * Pm[d] * x);
      th[d] += k * (m - th[d] * x); Pm[d] = (Pm[d] - k * x * Pm[d]) / LAM;
    }
    if (U.length > 400) { U.splice(0, 200); M.splice(0, 200); }
  }
  for (let i = 0; i < 60; i++) tick();
  let acc = 0;
  const st = stage(cv, 1.05, (s, dt) => {
    const {ctx, w, h} = s; acc += dt; while (acc > .05) { tick(); acc -= .05; }
    for (let d = 0; d < LAG; d++) shown[d] = RM ? th[d] : lerp(shown[d], th[d], 1 - Math.exp(-dt * 8));
    const top = 30, mid = h * .48, L = 40, R = w - 20;
    txt(ctx, "LAST 48 TICKS", L, 20, {size: 10, font: MONO, color: C.nmuted});
    const n = Math.min(HIST, U.length), X = i => L + (R - L) * i / (HIST - 1);
    const row = (arr, y0, col, lw) => { ctx.beginPath(); for (let i = 0; i < n; i++) { const v = arr[arr.length - n + i]; const x = X(i), y = y0 - clamp(v, -1.25, 1.25) * 20; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); };
    const y1 = top + 46, y2 = y1 + 84;
    ctx.strokeStyle = "rgba(255,255,255,.06)"; [y1, y2].forEach(y => { ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke(); });
    row(U, y1, "#778daa", 1.4); const g = ctx.createLinearGradient(L, 0, R, 0); g.addColorStop(0, "#97aecc"); g.addColorStop(1, "#f09a82"); row(M, y2, g, 1.8);
    txt(ctx, "command sent", L, y1 - 30, {size: 10.5, color: C.nmuted, font: MONO}); txt(ctx, "measured motion", L, y2 - 32, {size: 10.5, color: C.nmuted, font: MONO});
    // lag bars
    const bt = y2 + 66, bb = h - 34, bw = (R - L) / LAG * .56, mx = 2.2;
    let best = 0; for (let d = 1; d < LAG; d++) if (Math.abs(shown[d]) > Math.abs(shown[best])) best = d;
    txt(ctx, "RLS MAP SIZE |M_d| PER LAG", L, y2 + 42, {size: 10, font: MONO, color: C.nmuted});
    for (let d = 0; d < LAG; d++) {
      const cx = L + (R - L) * (d + .5) / LAG, v = Math.abs(shown[d]), hh = (bb - bt) * clamp(v / mx, 0, 1);
      ctx.fillStyle = "rgba(255,255,255,.04)"; rr(ctx, cx - bw / 2, bt, bw, bb - bt, 4); ctx.fill();
      if (d === best) { const gg = ctx.createLinearGradient(0, bb, 0, bb - hh); gg.addColorStop(0, "#97aecc"); gg.addColorStop(1, "#f09a82"); ctx.fillStyle = gg; } else ctx.fillStyle = "#3a4658";
      rr(ctx, cx - bw / 2, bb - hh, bw, Math.max(hh, 1), 4); ctx.fill();
      txt(ctx, v.toFixed(2), cx, bb - hh - 8, {size: 11, font: MONO, color: d === best ? C.nink : C.nmuted, align: "center", weight: d === best ? 600 : 400});
      txt(ctx, "d = " + d, cx, bb + 18, {size: 10.5, font: MONO, color: d === best ? "#f09a82" : C.nmuted, align: "center"});
    }
    $("#rls-dh").textContent = best + (best === 1 ? " tick" : " ticks"); $("#rls-gh").textContent = "×" + Math.abs(shown[best]).toFixed(2);
  });
    const sd = $("#rls-d"), sg = $("#rls-g");
  const upd = () => { dly = +sd.value; gain = +sg.value; $("#rls-d-o").textContent = dly + (dly === 1 ? " tick" : " ticks"); $("#rls-g-o").textContent = "×" + gain.toFixed(1); if (RM) { for (let i = 0; i < 300; i++) tick(); st.redraw(); } };
  sd.addEventListener("input", upd); sg.addEventListener("input", upd); upd();
})();

/* ================= 4. ACTION HEAD terms ================= */
(() => {
  const cv = $("#head-cv"); if (!cv) return;
  const N = 10; let term = "lead", t0 = 0;
  const a = [...Array(N)].map((_, i) => { const th = -.9 + 1.6 * Math.sin(i / 3.2), r = .7 + .25 * Math.cos(i / 2); return [r * Math.cos(th), r * Math.sin(th)]; });
  const plan = i => a[Math.min(i, N - 1)];
  function corrected(i, s) {
    if (term === "lead") { const f = 1.5 * s, j = Math.floor(f), u = f - j; const p0 = plan(i + j), p1 = plan(i + j + 1); return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)]; }
    if (term === "dk") { const sc = 1 + .45 * s, r = -.3 * s, [x, y] = a[i]; return [sc * (x * Math.cos(r) - y * Math.sin(r)), sc * (x * Math.sin(r) + y * Math.cos(r))]; }
    const r = [.22 * Math.sin(i * 1.7), .18 * Math.cos(i * 1.1)]; return [a[i][0] + r[0] * s, a[i][1] + r[1] * s];
  }
  const CAP = {lead: "<b>Lead mix α.</b> Under a command delay, the head blends in actions the chunk plans for later ticks, so each command arrives when the plan needs it. Shown: the plan advanced by 1.5 ticks.",
               dk: "<b>δK and δk.</b> A 3×3 matrix rescales and rotates the translation commands; three factors rescale the rotation commands. Shown: a gain of 1.45 and a rotation of −17°, as for a stronger, rotated controller.",
               r: "<b>Residual r.</b> Whatever the structured terms leave is added directly, per tick, from the same inputs."};
  const st = stage(cv, 1.6, (s) => {
    const {ctx, w, h} = s, T = 4.4, tt = RM ? 1.6 : (s.t - t0) % T, m = tt < 1.6 ? ease3(tt / 1.4) : tt < 3.2 ? 1 : 1 - ease3((tt - 3.2) / 1.0);
    const L = 30, R = w - 20, cy = h * .5, sc = Math.min((R - L) / N * 1.05, h * .34);
    txt(ctx, "TRANSLATION COMMAND PER TICK OF ONE CHUNK", L, 22, {size: 10, font: MONO, color: C.faint});
    ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(L, cy); ctx.lineTo(R, cy); ctx.stroke();
    for (let i = 0; i < N; i++) {
      const x = L + (R - L) * (i + .5) / N; dot(ctx, x, cy, 2, C.faint);
      const [ax, ay] = a[i]; arrow(ctx, x, cy, x + ax * sc, cy - ay * sc, "rgba(139,147,158,.75)", {lw: 1.6, head: 5});
      const [ux, uy] = corrected(i, m); ctx.globalAlpha = .25 + .75 * Math.min(1, m * 2); arrow(ctx, x, cy, x + ux * sc, cy - uy * sc, sig(i / (N - 1)), {lw: 2.4, head: 6}); ctx.globalAlpha = 1;
      txt(ctx, "t" + i, x, h - 14, {size: 10, font: MONO, color: C.faint, align: "center"});
    }
  });
  const cap = $("#head-cap"); cap.innerHTML = CAP.lead;
  chips($("#head-chips"), k => { term = k; cap.innerHTML = CAP[k]; t0 = st.t; st.kick(); });
})();

/* ================= 5. TRAINING loop ================= */
(() => {
  const cv = $("#train-cv"); if (!cv) return;
  const DUR = [2.6, 2.8, 2.8, 3.6, 2.8], H = 8;
  const CAP = [
    "<b>1 · Copy.</b> At the start of every chunk, training copies the full simulator state. A System 0 is sampled per episode from the controller, body and joint families (70% of episodes changed).",
    "<b>2 · Nominal run.</b> The copy runs the chunk under the nominal System 0. Its trajectory is the chunk's nominal execution, the training target. A robot under a changed System 0 never shows this motion, so the copy is the only place to record it.",
    "<b>3 · Changed run.</b> The simulator is restored to the copy and the chunk runs under the changed System 0 with the current layer. The tracking error e is the gap from the nominal execution in position, orientation and contact force.",
    "<b>4 · Counterfactual through J.</b> Without running the simulator again, the head proposes the command u′ it would send now. The frozen forward model's sensitivity J turns u′ − u into the change of motion it would cause, summed from the chunk's first tick: e′ = e + Σ J (u′ − u).",
    "<b>5 · Gradient step.</b> The loss on e′ is differentiable in u′, so gradients flow through J into the action head and the encoder. No reward, no value function, no policy-gradient estimate.",
  ];
  let stp = 0, ts = 0, manual = false;
  const btns = $$("#train-steps .chip"), cap = $("#train-cap");
  const set = s => { stp = s; ts = 0; btns.forEach((b, i) => b.classList.toggle("on", i === s)); cap.innerHTML = CAP[s]; };
  btns.forEach((b, i) => b.addEventListener("click", () => { set(i); st.kick(); }));
  set(0);
  const st = stage(cv, w => w < 640 ? .72 : 2.3, (s, dt) => {
    const {ctx, w, h} = s; ts += dt; if (!RM && ts > DUR[stp]) set((stp + 1) % 5);
    const p = RM ? 1 : clamp(ts / (DUR[stp] * .7), 0, 1), narrow = w < 640;
    const PW = narrow ? w : w * .6, L = 40, R = PW - 30, cy = h * (narrow ? .27 : .55), span = R - L;
    const ref = [...Array(H + 1)].map((_, j) => [L + span * j / H, cy - Math.sin(j / H * 2.2) * h * .16]);
    const act = ref.map(([x, y], j) => [x, y + Math.pow(j / H, 1.5) * h * .2]);
    const cf = act.map(([x, y], j) => [x, lerp(y, ref[j][1], .78 * (stp >= 3 ? (stp === 3 ? ease3(p) : 1) : 0))]);
    txt(ctx, "ONE CHUNK · 8 TICKS", L, 22, {size: 10, font: MONO, color: C.faint});
    // state node + copy
    dot(ctx, ...ref[0], 6, C.ink);
    if (stp === 0) { const o = ease3(p) * 18; ring(ctx, ref[0][0], ref[0][1] - o, 9, C.blue, .9); ring(ctx, ref[0][0], ref[0][1] + o, 9, C.slate, .9); txt(ctx, "simulator state s(τn)", ref[0][0] + 14, ref[0][1] - 26, {size: 11, color: C.body}); txt(ctx, "copy", ref[0][0] + 16, ref[0][1] + 4, {size: 11, font: MONO, color: C.blue}); }
    if (stp >= 1) { polyline(ctx, ref, (stp === 1 ? p : 1) * H, gradH(ctx, L, R), 2.6, [6, 4]); txt(ctx, "nominal execution (copy, nominal System 0)", L + span * .12, Math.min(...ref.map(q => q[1])) - 16, {size: 11, color: C.coral2, weight: 600}); }
    if (stp >= 2) {
      const u = (stp === 2 ? p : 1) * H; polyline(ctx, act, u, C.slate, 2.2);
      for (let j = 1; j <= Math.floor(u); j++) { ctx.strokeStyle = stp === 2 ? "rgba(230,134,112,.7)" : "rgba(230,134,112,.22)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(act[j][0], act[j][1]); ctx.lineTo(...ref[j]); ctx.stroke(); }
      txt(ctx, "changed System 0 + layer", act[H][0] - 4, act[H][1] + 20, {size: 11, color: C.muted, align: "right"});
      if (u >= H && stp === 2) txt(ctx, "e", act[H][0] + 8, (act[H][1] + ref[H][1]) / 2 + 4, {size: 14, color: C.coral2, weight: 600, font: '"Geist",' + FONT});
    }
    if (stp >= 3) {
      polyline(ctx, cf, H, sig(.75), 2.2);
      for (let j = 1; j <= H; j++) { ctx.strokeStyle = "rgba(201,100,77,.9)"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(cf[j][0], cf[j][1]); ctx.lineTo(...ref[j]); ctx.stroke(); }
      txtBg(ctx, "e′ (counterfactual)", cf[H][0] - 8, cf[H][1] + 20, {size: 11, color: C.coral2, weight: 600, align: "right"});
    }
    // right panel: J and loss
    const px = narrow ? 30 : PW + 10, py = narrow ? h * .56 : 40, cs = narrow ? Math.min(14, (w - 60) / 20) : Math.min(15, (w - PW - 40) / 12);
    if (stp >= 3) {
      txt(ctx, "J  (8 × 8 blocks, lower triangular)", px, py - 10, {size: 10.5, font: MONO, color: C.muted});
      for (let k = 0; k < H; k++) for (let i = 0; i <= k; i++) {
        const show = stp > 3 || ease3(p) * 2 * H > k + i; if (!show) continue;
        const v = Math.exp(-(k - i) / 2.5); ctx.fillStyle = `rgba(63,88,118,${.12 + .7 * v})`; ctx.fillRect(px + i * cs, py + k * cs, cs - 1.5, cs - 1.5);
      }
      const bx = px + H * cs + 18; txt(ctx, "× (u′ − u)", bx, py + H * cs / 2, {size: 12, font: MONO, color: C.body});
      txt(ctx, "= change of motion", bx, py + H * cs / 2 + 18, {size: 11, font: MONO, color: C.muted});
    }
    if (stp >= 4) {
      const bw1 = narrow ? 130 : 170, bw2 = narrow ? 118 : 130, gap = narrow ? 28 : 40;
      const ly = py + H * cs + 30; rr(ctx, px, ly, bw1, 40, 8); ctx.fillStyle = C.ink; ctx.fill();
      txt(ctx, "∇ loss(e′)", px + 14, ly + 25, {size: 13, font: MONO, color: "#fff", weight: 600});
      const hx = px + bw1 + gap, hy = ly + 20; rr(ctx, hx, ly, bw2, 40, 8); ctx.strokeStyle = gradH(ctx, hx, hx + bw2); ctx.lineWidth = 1.6; ctx.stroke();
      txt(ctx, "head + encoder", hx + 14, ly + 25, {size: 12, color: C.ink, weight: 600});
      const u = (ts * 1.3) % 1; for (let i = 0; i < 3; i++) { const v = (u + i / 3) % 1; dot(ctx, lerp(px + bw1 + 2, hx - 4, v), hy, 3.4, sig(v)); }
      txt(ctx, "forward model frozen", px, ly + 62, {size: 10.5, font: MONO, color: C.faint});
    }
  });
})();

/* ================= 6. RESULTS: external benchmarks ================= */
(() => {
  const svg = $("#ext-chart"); if (!svg) return;
  const NS = "http://www.w3.org/2000/svg", el = (n, a, p = svg) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  const BEST = {rs: "SC-VLA", jp: "J-PARC"};
  let cur = "rs", shown = false;
  function draw(b) {
    svg.innerHTML = "";
    const defs = el("defs", {}), g = el("linearGradient", {id: "eg", x1: 0, y1: 1, x2: 0, y2: 0}, defs);
    [["0", "#3f5876"], [".35", "#5c7699"], [".75", "#d9765f"], ["1", "#c9644d"]].forEach(([o, c]) => el("stop", {offset: o, "stop-color": c}, g));
    const E = D.external[b], rows = [...E.rows, {name: "Mean", base: E.mean.base, rep_best: E.mean.rep_best, ours: E.mean.ours, mean: true}];
    const L = 44, R = 990, T = 18, B = 318, Y = v => B - (B - T) * v / 100, gw = (R - L) / rows.length, bw = Math.min(26, gw / 4.4);
    [0, 25, 50, 75, 100].forEach(v => { el("line", {x1: L, x2: R, y1: Y(v), y2: Y(v), class: "gl"}); el("text", {x: L - 10, y: Y(v) + 4, "text-anchor": "end"}).textContent = v; });
    rows.forEach((r, i) => {
      const cx = L + gw * (i + .5);
      if (r.mean) el("rect", {x: cx - gw / 2 + 4, y: T - 6, width: gw - 8, height: B - T + 6, rx: 10, fill: "rgba(247,216,202,.35)"});
      [["base", "#c9ced4"], ["rep_best", "#69717c"], ["ours", "url(#eg)"]].forEach(([k, f], j) => {
        const x = cx + (j - 1) * (bw + 4) - bw / 2, rect = el("rect", {x, width: bw, y: B, height: 0, rx: 3, fill: f});
        const v = r[k]; rect.dataset.v = v;
        if (k === "ours") { const t = el("text", {x: x + bw / 2, y: B - 6, "text-anchor": "middle", class: "v"}); t.textContent = ""; t.dataset.v = v; t.dataset.y = Y(v) - 7; }
      });
      const words = r.name.split(/(?<=-)|\s/).filter(Boolean); let line = "", lines = [];
      words.forEach(w_ => { if ((line + w_).length > 12 && line) { lines.push(line); line = w_; } else line += (line && !line.endsWith("-") ? " " : "") + w_; }); lines.push(line);
      lines.forEach((s, k) => { const t = el("text", {x: cx, y: B + 20 + k * 15, "text-anchor": "middle", "font-weight": r.mean ? 700 : 400, fill: r.mean ? "#10141b" : "#69717c"}); t.textContent = s; });
    });
    el("line", {x1: L, x2: R, y1: B, y2: B, class: "ax"});
    $("#ext-best-name").textContent = BEST[b];
    const gain = E.gain, gainBest = E.gain_best;
    $("#ext-kpis").innerHTML = `<div class="kpi ours"><div class="k">System 0.5 · mean</div><div class="v">${E.mean.ours.toFixed(1)}<small>%</small></div></div>
      <div class="kpi"><div class="k">${BEST[b]} · as reported</div><div class="v">${E.mean.rep_best.toFixed(1)}<small>%</small></div></div>
      <div class="kpi"><div class="k">Gain over base</div><div class="v">+${gain.toFixed(1)}<small> vs +${gainBest.toFixed(1)} pts</small></div></div>`;
    if (shown) grow();
  }
  function grow() {
    const rects = $$("rect[data-v]", svg), labels = $$("text[data-v]", svg);
    const T = 18, B = 318, Y = v => B - (B - T) * v / 100;
    tween(1300, t => {
      rects.forEach((r, i) => { const k = ease(clamp(t * 1.4 - i * .012, 0, 1)), v = +r.dataset.v * k; r.setAttribute("y", Y(v)); r.setAttribute("height", B - Y(v)); });
      labels.forEach(l => { const k = ease(t); l.textContent = (+l.dataset.v * k).toFixed(1); l.setAttribute("y", lerp(B - 6, +l.dataset.y, k)); });
    });
  }
  draw(cur);
  onReveal(svg, () => { shown = true; grow(); }, .3);
  chips($("#ext-chips"), k => { cur = k; draw(k); });
})();

/* ================= 7. Q2 bars ================= */
(() => {
  const rows = [...D.q2].sort((a, b) => b.out - a.out).map(r => ({name: r.name, v: r.out, sub: `in-family ${r.in.toFixed(1)} · nominal ${r.nom.toFixed(1)}`, cls: r.key === "L13-L13v3" ? "ours" : ""}));
  hbars($("#q2-bars"), rows);
})();

/* ================= 8. scatter: tracking vs success ================= */
(() => {
  const svg = $("#scatter"); if (!svg) return;
  const NS = "http://www.w3.org/2000/svg", el = (n, a, p = svg) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  const pts = D.scatter.points, L = 56, R = 540, T = 20, B = 350;
  const xmin = 5.5, xmax = Math.ceil(Math.max(...pts.map(p => p.track)) + .5), ymin = 20, ymax = 95;
  const X = v => L + (R - L) * (v - xmin) / (xmax - xmin), Y = v => B - (B - T) * (v - ymin) / (ymax - ymin);
  const defs = el("defs", {}), g = el("linearGradient", {id: "sg", x1: 0, x2: 1}, defs);
  [["0", "#3f5876"], ["1", "#c9644d"]].forEach(([o, c]) => el("stop", {offset: o, "stop-color": c}, g));
  for (let v = 30; v <= 90; v += 10) { el("line", {x1: L, x2: R, y1: Y(v), y2: Y(v), class: "gl"}); el("text", {x: L - 10, y: Y(v) + 4, "text-anchor": "end"}).textContent = v + "%"; }
  for (let v = 6; v <= xmax; v += 2) { el("text", {x: X(v), y: B + 20, "text-anchor": "middle"}).textContent = v; }
  el("line", {x1: L, x2: R, y1: B, y2: B, class: "ax"});
  el("text", {x: (L + R) / 2, y: B + 42, "text-anchor": "middle"}).textContent = "mean tracking error against the nominal execution (mm) →";
  el("text", {x: R, y: T + 4, "text-anchor": "end", class: "v", style: "font-size:13px"}).textContent = `Spearman ρ = ${D.scatter.rho.toFixed(2)}`;
  const LBL = {"L13-L13v3": "System 0.5", PASS: "pass-through", "L13-L13v3-cmd": "target: command", "SAC-SACv3": "Residual SAC"};
  const DY = {"L13-L13v3-cmd": -14};
  const PASS = pts.find(p => p.key === "PASS"), lx = X(PASS.track + .95), lyy = Y(PASS.success + 5);
  const leader = el("line", {x1: X(PASS.track) + 4, y1: Y(PASS.success) - 3, x2: lx - 3, y2: lyy + 2, stroke: "#8b939e", "stroke-width": .8, opacity: 0});
  const order = [...pts].sort((a, b) => a.track - b.track);
  const nodes = order.map(p => {
    const ours = p.key === "L13-L13v3", gg = el("g", {style: "cursor:default"});
    const c = el("circle", {cx: X(p.track), cy: Y(ymin), r: ours ? 8 : 5.5, fill: ours ? "url(#sg)" : (p.key.startsWith("L13") ? "#778daa" : "#8b939e"), opacity: 0}, gg);
    el("title", {}, c).textContent = `${p.name}: ${p.track.toFixed(2)} mm, ${p.success.toFixed(1)}%`;
    const tl = el("text", {x: p.key === "PASS" ? lx : X(p.track) + (p.track > 15 ? -12 : 12), y: p.key === "PASS" ? lyy + 4 : Y(p.success) + 4 + (DY[p.key] || 0), "text-anchor": p.track > 15 ? "end" : "start", opacity: 0, fill: ours ? "#10141b" : "#69717c", "font-weight": ours ? 700 : 400}, gg);
    tl.textContent = LBL[p.key] || p.name;
    const always = !!LBL[p.key];
    gg.addEventListener("mouseenter", () => tl.setAttribute("opacity", 1)); gg.addEventListener("mouseleave", () => tl.setAttribute("opacity", always ? 1 : 0));
    gg.addEventListener("click", () => tl.setAttribute("opacity", 1));
    return {p, c, tl, always};
  });
  onReveal(svg, () => nodes.forEach((n, i) => setTimeout(() => tween(900, t => {
    const k = ease(t); n.c.setAttribute("cy", lerp(Y(ymin) + 10, Y(n.p.success), k)); n.c.setAttribute("opacity", Math.min(1, t * 2));
    if (n.always) n.tl.setAttribute("opacity", k); if (n.p.key === "PASS") leader.setAttribute("opacity", k);
  }), RM ? 0 : i * 110)), .3);
})();

/* ================= 9. UR5e ================= */
(() => {
  const H = D.ur5e, A = H.per_arm, NAMES = {gain1: "Unit gain", s05: "Online calibrator", layer: "System 0.5"};
  const box = $("#hw-kpis");
  if (box) box.innerHTML = ["gain1", "s05", "layer"].map(k => `<div class="kpi ${k === "layer" ? "ours" : ""}"><div class="k">${NAMES[k]}</div><div class="v">${A[k].err.toFixed(1)}<small> mm</small></div><div class="k" style="margin-top:8px;text-transform:none;letter-spacing:0">${A[k].success}/30 completed · median ${A[k].median_time.toFixed(0)} s</div></div>`).join("");
  const NS = "http://www.w3.org/2000/svg", mk = svg => (n, a, p = svg) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  const by = {}; H.trials.forEach(t => (by[t.pair] ||= {})[t.arm] = t);
  const pairs = Object.keys(by).map(Number).sort((a, b) => by[b].gain1.err - by[a].gain1.err);
  // dumbbell
  const sv = $("#hw-dumb");
  if (sv) {
    const el = mk(sv), L = 50, R = 540, T = 20, B = 470, X = v => L + (R - L) * v / 12, rowH = (B - T) / pairs.length;
    const defs = el("defs", {}), g = el("linearGradient", {id: "hg", x1: 1, x2: 0}, defs); [["0", "#3f5876"], ["1", "#c9644d"]].forEach(([o, c]) => el("stop", {offset: o, "stop-color": c}, g));
    for (let v = 0; v <= 12; v += 2) { el("line", {x1: X(v), x2: X(v), y1: T - 6, y2: B, class: "gl"}); el("text", {x: X(v), y: B + 18, "text-anchor": "middle"}).textContent = v; }
    el("text", {x: (L + R) / 2, y: B + 36, "text-anchor": "middle"}).textContent = "tracking error (mm), placements sorted by unit-gain error";
    const items = pairs.map((p, i) => {
      const y = T + rowH * (i + .5), r = by[p];
      el("text", {x: L - 10, y: y + 3.5, "text-anchor": "end", style: "font-size:9.5px;font-family:var(--font-mono)"}).textContent = "P" + String(p).padStart(2, "0");
      const ln = el("line", {x1: X(r.gain1.err), x2: X(r.gain1.err), y1: y, y2: y, stroke: "url(#hg)", "stroke-width": 1.5, opacity: .55});
      el("circle", {cx: X(r.gain1.err), cy: y, r: 4, fill: "#8b939e"});
      const cal = el("circle", {cx: X(r.gain1.err), cy: y, r: 3.6, fill: "#fff", stroke: "#69717c", "stroke-width": 1.2, opacity: 0});
      const our = el("circle", {cx: X(r.gain1.err), cy: y, r: 4.4, fill: "#c9644d"});
      return {r, ln, cal, our};
    });
    onReveal(sv, () => items.forEach((it, i) => setTimeout(() => tween(1100, t => {
      const k = ease(t), xo = X(lerp(it.r.gain1.err, it.r.layer.err, k));
      it.our.setAttribute("cx", xo); it.ln.setAttribute("x2", xo);
      it.cal.setAttribute("cx", X(lerp(it.r.gain1.err, it.r.s05.err, k))); it.cal.setAttribute("opacity", k);
    }), RM ? 0 : 200 + i * 35)), .25);
    const ly = 512; const leg = [["#8b939e", null, "unit gain"], ["#fff", "#69717c", "calibrator"], ["#c9644d", null, "System 0.5"]];
    leg.forEach(([f, s, t], i) => { el("circle", {cx: L + i * 140, cy: ly + 8, r: 4, fill: f, stroke: s || "none", "stroke-width": 1.2}); el("text", {x: L + i * 140 + 10, y: ly + 12}).textContent = t; });
    sv.setAttribute("viewBox", "0 0 560 540");
  }
  // completion over time
  const sc = $("#hw-cdf");
  if (sc) {
    const el = mk(sc), L = 46, R = 530, T = 20, B = 440, X = v => L + (R - L) * v / 120, Y = v => B - (B - T) * v / 30;
    const defs = el("defs", {}), g = el("linearGradient", {id: "cg", x1: 0, x2: 1}, defs); [["0", "#3f5876"], ["1", "#c9644d"]].forEach(([o, c]) => el("stop", {offset: o, "stop-color": c}, g));
    const clip = el("clipPath", {id: "cclip"}, defs), cr = el("rect", {x: L - 2, y: 0, width: 0, height: B + 4}, clip);
    for (let v = 0; v <= 30; v += 5) { el("line", {x1: L, x2: R, y1: Y(v), y2: Y(v), class: "gl"}); el("text", {x: L - 10, y: Y(v) + 4, "text-anchor": "end"}).textContent = v; }
    for (let v = 0; v <= 120; v += 30) el("text", {x: X(v), y: B + 20, "text-anchor": "middle"}).textContent = v + " s";
    el("line", {x1: L, x2: R, y1: B, y2: B, class: "ax"});
    el("line", {x1: X(60), x2: X(60), y1: T, y2: B, stroke: "#778daa", "stroke-dasharray": "4 4"});
    el("text", {x: X(60) + 6, y: T + 12}).textContent = "60 s";
    const STY = {gain1: ["#b9bfc6", 2, ""], s05: ["#69717c", 2, "5 4"], layer: ["url(#cg)", 3, ""]};
    const gr = el("g", {"clip-path": "url(#cclip)"}), ends = [];
    ["gain1", "s05", "layer"].forEach(k => {
      const ts = H.trials.filter(t => t.arm === k && t.success).map(t => t.time).sort((a, b) => a - b);
      let d = `M${X(0)} ${Y(0)}`, c = 0; ts.forEach(t => { d += ` L${X(t)} ${Y(c)} L${X(t)} ${Y(++c)}`; }); d += ` L${X(120)} ${Y(c)}`;
      el("path", {d, fill: "none", stroke: STY[k][0], "stroke-width": STY[k][1], "stroke-dasharray": STY[k][2], "stroke-linejoin": "round"}, gr);
      const at60 = ts.filter(t => t <= 60).length; ends.push([k, c, at60]);
    });
    const lab = el("g", {opacity: 0});
    const yo = {gain1: 14, s05: -2, layer: 0};
    ends.forEach(([k, c, a60]) => {
      el("text", {x: R + 4, y: Y(c) + 4 + yo[k], class: "v", fill: k === "layer" ? "#c9644d" : "#69717c"}, lab).textContent = c;
      el("circle", {cx: X(60), cy: Y(a60), r: 3.5, fill: k === "layer" ? "#c9644d" : k === "s05" ? "#69717c" : "#b9bfc6"}, lab);
      el("text", {x: X(60) - 8, y: Y(a60) + 4 + (k === "s05" ? 10 : k === "layer" ? -4 : 0), "text-anchor": "end", style: "font-size:11px;font-family:var(--font-mono)"}, lab).textContent = a60;
    });
    const leg = [["#b9bfc6", "", "unit gain"], ["#69717c", "5 4", "calibrator"], ["#c9644d", "", "System 0.5"]];
    leg.forEach(([s, da, t], i) => { el("line", {x1: L + i * 140, x2: L + i * 140 + 22, y1: B + 52, y2: B + 52, stroke: s, "stroke-width": 2.4, "stroke-dasharray": da}); el("text", {x: L + i * 140 + 30, y: B + 56}).textContent = t; });
    el("text", {x: L, y: T - 4, style: "font-size:10px;font-family:var(--font-mono)"}).textContent = "COMPLETED TRIALS (OF 30)";
    onReveal(sc, () => tween(2600, t => { cr.setAttribute("width", (R - L + 30) * t); if (t >= 1) tween(500, u => lab.setAttribute("opacity", u)); }), .3);
  }
})();

/* ================= 10. video wall + lightbox ================= */
(() => {
  const wall = $("#wall"); if (!wall || !CLIPS.length) return;
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); }), {rootMargin: "120px"});
  const out = (c, k) => c[k].success ? `${c[k].time_s.toFixed(0)} s` : "fail";
  wall.innerHTML = CLIPS.map(c => `<div class="tile" data-p="${c.pair}" tabindex="0" role="button" aria-label="Placement ${c.pair}"><video muted loop playsinline preload="none" poster="${c.poster}" data-src="${c.video}"></video><span class="pl">P${String(c.pair).padStart(2, "0")} · unit ${out(c, "gain1")} · calib ${out(c, "s05")} · S0.5 ${out(c, "layer")}</span></div>`).join("");
  $$("video", wall).forEach(v => { if (!RM) vio.observe(v); });
  const F = {all: () => true, three: c => c.gain1.success && c.s05.success && c.layer.success, gain: c => c.layer.success && !c.gain1.success, fail: c => !c.layer.success};
  chips($("#wall-filter"), f => { const byP = Object.fromEntries(CLIPS.map(c => [c.pair, c])); $$(".tile", wall).forEach(t => t.style.display = F[f](byP[t.dataset.p]) ? "" : "none"); });
  const more = $("#wall-more"); more.addEventListener("click", () => { wall.classList.toggle("collapsed"); more.textContent = wall.classList.contains("collapsed") ? "show all clips ↓" : "collapse ↑"; });
  const lb = $("#lb"), lv = $("#lb-v");
  const open = t => { const c = CLIPS.find(x => x.pair == t.dataset.p); lv.src = c.video; $("#lb-t").textContent = $(".pl", t).textContent; lb.classList.add("open"); lv.play().catch(() => {}); };
  wall.addEventListener("click", e => { const t = e.target.closest(".tile"); if (t) open(t); });
  wall.addEventListener("keydown", e => { const t = e.target.closest(".tile"); if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(t); } });
  const close = () => { lb.classList.remove("open"); lv.pause(); };
  $("#lb-x").addEventListener("click", close); lb.addEventListener("click", e => { if (e.target === lb) close(); });
  addEventListener("keydown", e => { if (e.key === "Escape") close(); });
})();

/* ================= bibtex ================= */
$("#copy-bib")?.addEventListener("click", e => { navigator.clipboard?.writeText($("#bib-text").textContent); e.target.textContent = "copied"; setTimeout(() => e.target.textContent = "copy", 1400); });
})();
