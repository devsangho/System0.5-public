/* System 0.5 project page: interactions, stages and charts.
   Data: window.SYSTEM05_DATA (static/data/system05_data.js, generated from the result files by scripts/make_site_data.py)
   and window.SYSTEM05_CLIPS (static/videos/manifest.js). Design: x2Real design.paper.md v2.1 (rule IDs in comments). */
(() => {
"use strict";
const D = window.SYSTEM05_DATA, CLIPS = window.SYSTEM05_CLIPS || [];
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
// C-01..C-05 role colours; night variants for the night section
const C = {ink: "#10141b", body: "#3b434e", muted: "#69717c", faint: "#8b939e",
  ours: "#3f5876", oursLight: "#778daa", oursPale: "#c3d1e4", change: "#e68670", changeText: "#c9644d", peach: "#f7d8ca",
  base: "#8b939e", base2: "#b9bfc6", baseFill: "#c3c9d1", grid: "#e6e8eb",
  nOurs: "#97aecc", nChange: "#f09a82", nInk: "#f2f4f7", nBody: "#c9d1dc", nMuted: "#9aa6b5", nLine: "#263140", nRaised: "#18202b"};
const DASH = {change: [4, 4], ref: [3, 4], aux: [2, 3]};                                   // G-10
const LW = {ours: 2.2, hero: 2.4, change: 1.6, base: 1.5, ref: 1.2};                      // G-01..G-05
const FONT = '"Geist","Pretendard Variable","Pretendard",system-ui,sans-serif';           // CV-04
const MONO = '"Geist Mono",ui-monospace,Menlo,monospace';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 4);       // close to --ease-out-brand
const ease3 = t => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const fnt = (weight, size, mono) => `${weight} ${size}px ${mono ? MONO : FONT}`;

/* ---------- canvas stage: DPR (CV-01), visibility-gated rAF (CV-02), plays once then holds (M-13) ---------- */
function stage(cv, aspect, draw, {dur = 0, persist = false} = {}) {
  const ctx = cv.getContext("2d"); let w = 0, h = 0, vis = false, raf = 0, last = 0;
  const st = {ctx, get w() { return w; }, get h() { return h; }, t: RM ? 1e6 : 0, dur, draw};
  function size() {
    const r = cv.getBoundingClientRect(); w = r.width; h = Math.round(w / (typeof aspect === "function" ? aspect(w) : aspect));
    cv.style.height = h + "px"; const k = devicePixelRatio || 1; cv.width = Math.round(w * k); cv.height = Math.round(h * k);
    ctx.setTransform(k, 0, 0, k, 0, 0); frame(0);
  }
  function frame(dt) { ctx.clearRect(0, 0, w, h); st.draw(st, dt); }
  const active = () => !RM && vis && !document.hidden && (persist || st.t < st.dur);
  function loop(ts) { const dt = last ? Math.min(.05, (ts - last) / 1000) : 0; last = ts; st.t += dt; frame(dt); raf = active() ? requestAnimationFrame(loop) : 0; }
  st.kick = () => { if (!raf && active()) { last = 0; raf = requestAnimationFrame(loop); } else frame(0); };
  st.replay = () => { if (!RM) st.t = 0; st.kick(); };
  st.redraw = () => frame(0);
  let lastW = -1;
  new ResizeObserver(es => { const nw = Math.round(es[0].contentRect.width); if (nw !== lastW) { lastW = nw; requestAnimationFrame(size); } }).observe(cv);
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) st.kick(); }, {rootMargin: "80px"}).observe(cv);
  document.addEventListener("visibilitychange", () => st.kick());
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
// .seg toggles with aria-pressed (I-02, AX-05)
function seg(group, cb) {
  if (!group) return;
  const bs = $$("button", group);
  const set = b => bs.forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
  bs.forEach(b => b.addEventListener("click", () => { set(b); cb(b.dataset.k ?? b.dataset.s ?? b.dataset.f, b); }));
  return set;
}
function onReplay(id, cb) { const b = document.getElementById(id); if (b) b.addEventListener("click", cb); }
function txt(ctx, s, x, y, {size = 12, color = C.muted, mono = false, weight = 500, align = "left", base = "alphabetic", track = 0} = {}) {
  ctx.font = fnt(weight, size, mono); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  if ("letterSpacing" in ctx) ctx.letterSpacing = track ? `${track}em` : "0px";
  ctx.fillText(s, x, y);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
}
const cap = (ctx, s, x, y, o = {}) => txt(ctx, s.toUpperCase(), x, y, {size: 10, mono: true, color: C.muted, track: .08, ...o}); // G-24
function txtBg(ctx, s, x, y, o = {}, bg = "#fff") {
  ctx.font = fnt(o.weight || 500, o.size || 12, o.mono); const tw = ctx.measureText(s).width, sz = o.size || 12;
  const x0 = o.align === "right" ? x - tw : o.align === "center" ? x - tw / 2 : x;
  ctx.fillStyle = bg; ctx.fillRect(x0 - 3, y - sz, tw + 6, sz + 5); txt(ctx, s, x, y, o);
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function ring(ctx, x, y, r, col, a = 1, lw = 1.5) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.globalAlpha = a; ctx.stroke(); ctx.globalAlpha = 1; }
function dot(ctx, x, y, r, col) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = col; ctx.fill(); }
function node(ctx, x, y, col, bg = "#fff") { dot(ctx, x, y, 5, bg); ring(ctx, x, y, 5, col, 1, 2); }   // G-08
function arrow(ctx, x0, y0, x1, y1, col, {dash = null, lw = 1.2, head = 6} = {}) {                    // G-09
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
const NS = "http://www.w3.org/2000/svg";
const mk = svg => (n, a, p = svg) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };

/* ================= page: reveal (M-06, M-11), progress (S-14), nav, counters (M-07), title fit ================= */
const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } }), {rootMargin: "0px 0px -8% 0px", threshold: .08});
$$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 2 ? 120 : 0) + "ms"; rv.observe(el); });
const prog = $(".progress");
if (prog) { const upd = () => { const m = document.documentElement.scrollHeight - innerHeight; prog.style.transform = `scaleX(${m > 0 ? clamp(scrollY / m, 0, 1) : 0})`; }; addEventListener("scroll", upd, {passive: true}); addEventListener("resize", upd); upd(); }
const navLinks = $$(".site-nav a");
const navIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id)); }), {rootMargin: "-45% 0px -50% 0px"});
$$("section[id]").forEach(s => navIO.observe(s));
$$("[data-count]").forEach(el => onReveal(el.closest(".stat"), () => {
  const to = +el.dataset.count, from = el.dataset.from ? +el.dataset.from : 0, dec = +el.dataset.dec || 0;
  tween(1200, t => { el.textContent = lerp(from, to, ease(t)).toFixed(dec); });
}));
// "System 0.5" is wider than a one-word name: keep the wordmark inside its column for any font that loads
(() => {
  const el = $(".brand-hero"); if (!el) return;
  const fit = () => {
    el.style.fontSize = ""; const avail = el.parentElement.getBoundingClientRect().width;
    let fs = parseFloat(getComputedStyle(el).fontSize);
    for (let k = 0; k < 40 && el.scrollWidth > avail + 1 && fs > 36; k++) { fs *= .97; el.style.fontSize = fs + "px"; }
  };
  let lastW = -1;
  fit(); document.fonts && document.fonts.ready.then(fit); addEventListener("load", fit);
  new ResizeObserver(es => { const w = Math.round(es[0].contentRect.width); if (w !== lastW) { lastW = w; requestAnimationFrame(fit); } }).observe(el.parentElement);
})();
// stat band backdrop: the UR5e clips as a muted footage mosaic (ST-06)
(() => {
  const box = $("#mosaic"); if (!box || !CLIPS.length) return;
  const io = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); }), {rootMargin: "200px"});
  for (let i = 0; i < 48; i++) {
    const c = CLIPS[(i * 7) % CLIPS.length], v = document.createElement("video");
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none"; v.dataset.src = c.video; v.poster = c.poster;
    box.appendChild(v); if (!RM) io.observe(v);
  }
})();

/* ================= hero art: chunk -> System 0.5 -> System 0 (HA-01, HA-03) ================= */
(() => {
  const cv = $("#hero-cv"); if (!cv) return;
  const N = 10, END = 6.0;
  const raw = [.0, .5, .9, 1.0, .75, .3, -.15, -.5, -.6, -.4];    // chunk as commanded (schematic)
  const fix = [.0, .25, .45, .55, .5, .35, .2, .1, .05, .05];     // corrected chunk
  stage(cv, 560 / 500, (s) => {
    const {ctx, w, h} = s, t = Math.min(s.t, 1e5);
    const X0 = w * .07, X1 = w * .93, bw = X1 - X0, xs = i => X0 + bw * (.1 + .8 * i / (N - 1));
    const B = [{y: h * .06, hh: h * .17, name: "VLA", sub: "frozen π0.5", ours: false},
               {y: h * .34, hh: h * .17, name: "System 0.5", sub: "identify · correct", ours: true},
               {y: h * .62, hh: h * .33, name: "System 0", sub: "controller + robot · changed", ours: false}];
    ctx.strokeStyle = C.baseFill; ctx.lineWidth = LW.ref; ctx.setLineDash(DASH.aux);
    ctx.beginPath(); ctx.moveTo(X0 + bw / 2, B[0].y + B[0].hh); ctx.lineTo(X0 + bw / 2, B[2].y); ctx.stroke(); ctx.setLineDash([]);
    B.forEach(b => {
      rr(ctx, X0, b.y, bw, b.hh, 16); ctx.fillStyle = "rgba(255,255,255,.62)"; ctx.fill();
      ctx.lineWidth = b.ours ? 1.5 : 1.2; ctx.strokeStyle = b.ours ? C.ours : C.baseFill; ctx.stroke();
      txt(ctx, b.name, X0 + 14, b.y + 22, {size: 13, weight: 600, color: b.ours ? C.ours : C.ink});
      cap(ctx, b.sub, X1 - 14, b.y + 21, {align: "right", size: 9.5});
    });
    const cy0 = B[0].y + B[0].hh * .62, cy1 = B[1].y + B[1].hh * .62, amp1 = B[0].hh * .2;
    const plotY = B[2].y + B[2].hh * .6, amp = B[2].hh * .26;
    const oursPts = fix.map((v, i) => [xs(i), plotY - v * amp]);
    const chPts = raw.map((v, i) => [xs(i), plotY - (fix[i] + (raw[i] - fix[i]) * 1.0 + (i > 3 ? i * .05 : 0)) * amp * 1.2]);
    const pIn = ease3((t - .5) / 1.4), p1 = ease3((t - 1.9) / .7), p2 = ease3((t - 2.6) / 1.0), p3 = ease3((t - 3.6) / 1.0), pd = ease((t - 4.6) / 1.35);
    if (pd > 0) {
      polyline(ctx, chPts, pd * (N - 1), C.change, LW.change, DASH.change);
      polyline(ctx, oursPts, pd * (N - 1), C.ours, LW.hero);
      if (pd >= 1) {
        const [ex, ey] = chPts[N - 1], [nx, ny] = oursPts[N - 1], up = ny <= ey;
        txtBg(ctx, "no layer", ex - 8, up ? ey + 18 : ey - 10, {size: 10.5, mono: true, color: C.changeText, align: "right"}, "rgba(247,248,246,.94)");
        txtBg(ctx, "System 0.5", nx - 8, up ? ny - 10 : ny + 18, {size: 10.5, mono: true, color: C.ours, align: "right"}, "rgba(247,248,246,.94)");
      }
      cap(ctx, "hand path", X0 + 14, B[2].y + B[2].hh - 10, {size: 9.5});
    }
    for (let i = 0; i < N; i++) {
      const st0 = .5 + i * .05; if (t < st0) continue;
      const a = ease3((t - st0) / .5), corrected = t > 2.6 + i * .08;
      let y = lerp(B[0].y + B[0].hh * .25, cy0 - raw[i] * amp1, a);
      if (p1 > 0) y = lerp(cy0 - raw[i] * amp1, cy1 - raw[i] * amp1, p1);
      if (p2 > 0) y = lerp(cy1 - raw[i] * amp1, cy1 - fix[i] * amp1, p2);
      if (p3 > 0) y = lerp(cy1 - fix[i] * amp1, oursPts[i][1], p3);
      const x = xs(i);
      if (p3 >= 1) { node(ctx, x, y, C.ours); continue; }
      dot(ctx, x, y, 4.5, corrected ? C.ours : C.base);
      if (p2 > 0 && p3 === 0) { ctx.strokeStyle = C.baseFill; ctx.lineWidth = 1; ctx.setLineDash(DASH.aux); ctx.beginPath(); ctx.moveTo(x, cy1 - raw[i] * amp1); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]); }
    }
    if (t > .5 && p1 < 1) cap(ctx, "chunk · 10 actions", xs(0), B[0].y + B[0].hh - 8, {size: 9.5});
    if (p2 > 0 && p3 < .5) cap(ctx, "Δu per command", xs(0), B[1].y + B[1].hh - 8, {size: 9.5, color: C.ours});
    // ring pulse on the restored path's last node (HA-03: 4.4 s period, 1.4 s apart)
    if (t > END) for (let k = 0; k < 2; k++) {
      const ph = ((t - END - k * 1.4) % 4.4 + 4.4) % 4.4 / 4.4; if (t - END < k * 1.4) continue;
      ring(ctx, ...oursPts[N - 1], 5 + 16 * ease(ph), C.ours, .55 * (1 - ph));
    }
  }, {dur: END, persist: true});
})();

/* ================= 01 problem: recorded replay ================= */
(() => {
  const cv = $("#replay-cv"), gv = $("#gap-cv"); if (!cv) return;
  const P = D.problem, keys = ["kp", "delay", "load", "worn"], NT = P.nominal.length, TICK = .15;
  const all = [P.nominal, ...keys.map(k => P[k])];
  const varOf = j => { const v = all.flat().map(p => p[j]); const m = v.reduce((a, b) => a + b) / v.length; return v.reduce((a, b) => a + (b - m) ** 2, 0); };
  const ax = [0, 1, 2].sort((a, b) => varOf(b) - varOf(a)).slice(0, 2).sort();
  const gap = k => P[k].map((p, i) => Math.hypot(...p.map((v, j) => v - P.nominal[i][j])));
  const G = Object.fromEntries(keys.map(k => [k, gap(k)])), gmax = Math.max(...keys.flatMap(k => G[k]));
  let sel = "kp", gs = null;
  const st = stage(cv, 1.18, (s) => {
    const {ctx, w, h} = s; const u = clamp((s.t - .4) / TICK, 0, NT - 1);
    const pts = all.flat(); const xv = pts.map(p => p[ax[0]]), yv = pts.map(p => p[ax[1]]);
    const x0 = Math.min(...xv), x1 = Math.max(...xv), y0 = Math.min(...yv), y1 = Math.max(...yv);
    const pad = 46, sc = Math.min((w - 2 * pad) / (x1 - x0), (h - 2 * pad) / (y1 - y0));
    const ox = (w - (x1 - x0) * sc) / 2, oy = (h - (y1 - y0) * sc) / 2;
    const M = p => [ox + (p[ax[0]] - x0) * sc, h - (oy + (p[ax[1]] - y0) * sc)];
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(16, h - 16); ctx.lineTo(16 + 50 * sc, h - 16); ctx.stroke();
    cap(ctx, "50 mm", 16, h - 22); cap(ctx, "top view · LIBERO-Spatial · π0.5", 16, 22);
    const nom = P.nominal.map(M), chg = P[sel].map(M);
    keys.filter(k => k !== sel).forEach(k => polyline(ctx, P[k].map(M), NT - 1, C.grid, 1));
    polyline(ctx, chg, u, C.change, LW.change, DASH.change);
    polyline(ctx, nom, u, C.ours, LW.ours);
    for (let i = P.n_exec; i <= Math.floor(u); i += P.n_exec) node(ctx, ...nom[i], C.ours);
    const a = at(nom, u), b = at(chg, u);
    ctx.strokeStyle = C.change; ctx.lineWidth = LW.change; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
    dot(ctx, ...b, 4, C.change); dot(ctx, ...a, 4.5, C.ours);
    dot(ctx, ...nom[0], 4.5, C.ink); txt(ctx, "start", nom[0][0] - 10, nom[0][1] + 4, {size: 11, mono: true, color: C.muted, align: "right"});
    const i0 = Math.floor(u), g = lerp(G[sel][i0], G[sel][Math.min(i0 + 1, NT - 1)], u - i0);
    $("#rp-tick").textContent = Math.round(u); $("#rp-time").textContent = (u * P.dt).toFixed(2) + " s";
    $("#rp-gap").textContent = g.toFixed(1) + " mm"; $("#rp-chunk").textContent = Math.min(Math.floor(u / P.n_exec) + 1, 6);
    if (gs) { gs.u = u; gs.redraw(); }
  }, {dur: .4 + (NT - 1) * TICK + .2});
  const NAMES = {kp: "gain ×2", delay: "delay 3", load: "payload", worn: "worn"};
  gs = stage(gv, 1.18, (s) => {
    const {ctx, w, h} = s, u = s.u ?? 0, L = 48, R = w - 72, T = 34, B = h - 40;
    const X = i => L + (R - L) * i / (NT - 1), Y = v => B - (B - T) * v / (gmax * 1.08);
    ctx.lineWidth = 1;
    for (let v = 0; v <= gmax; v += 20) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(R, Y(v)); ctx.stroke(); txt(ctx, v + "", L - 8, Y(v) + 4, {size: 10, color: C.muted, align: "right"}); }
    for (let i = 0; i < NT; i += P.n_exec) { ctx.strokeStyle = C.baseFill; ctx.lineWidth = LW.ref; ctx.setLineDash(DASH.aux); ctx.beginPath(); ctx.moveTo(X(i), T); ctx.lineTo(X(i), B); ctx.stroke(); ctx.setLineDash([]); }
    cap(ctx, "gap from nominal (mm)", L, 20);
    [0, .5, 1, 1.5].forEach(s_ => txt(ctx, s_ + " s", X(s_ / P.dt), B + 18, {size: 10, color: C.muted, align: "center"}));
    cap(ctx, "new chunk every 5 ticks", R, B + 34, {align: "right"});
    keys.forEach(k => {
      const pts = G[k].map((v, i) => [X(i), Y(v)]);
      if (k === sel) polyline(ctx, pts, u, C.change, LW.change, DASH.change); else polyline(ctx, pts, NT - 1, C.baseFill, LW.base);
      const end = k === sel ? at(pts, u) : pts[NT - 1];
      if (k === sel) dot(ctx, ...end, 4, C.change);
      txt(ctx, NAMES[k], R + 8, end[1] + 4, {size: 10.5, mono: true, color: k === sel ? C.changeText : C.muted, weight: k === sel ? 600 : 400});
    });
  });
  seg($("#replay-chips"), k => { sel = k; st.replay(); });
  onReplay("replay-btn", () => st.replay());
})();

/* ================= 02 key idea: command vs nominal ================= */
(() => {
  const cv = $("#cmd-cv"); if (!cv) return;
  const N = 10, RATIO = .22, PER = .55;
  const ang = i => -.75 + .13 * i;
  const st = stage(cv, 1.55, (s) => {
    const {ctx, w, h} = s, k = clamp(s.t / PER, 0, N);
    const L = (w * .8) / N * .98, sx = w * .1, sy = h * .78;
    const cmd = [[sx, sy]], nom = [[sx, sy]];
    for (let i = 0; i < N; i++) { const dx = Math.cos(ang(i)) * L, dy = Math.sin(ang(i)) * L; cmd.push([cmd[i][0] + dx, cmd[i][1] + dy]); nom.push([nom[i][0] + dx * RATIO, nom[i][1] + dy * RATIO]); }
    const g = ctx.createRadialGradient(nom[5][0], nom[5][1], 4, nom[5][0], nom[5][1], L * 2.4);
    g.addColorStop(0, "rgba(247,216,202,.75)"); g.addColorStop(1, "rgba(247,216,202,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nom[5][0], nom[5][1], L * 2.4, 0, 7); ctx.fill();
    cap(ctx, "states in the demonstrations", 14, nom[5][1] + L * 1.7, {color: C.body});
    const i = Math.min(Math.floor(k), N - 1);
    for (let j = 0; j < Math.floor(k) && j < N; j++) { const dx = Math.cos(ang(j)) * L, dy = Math.sin(ang(j)) * L; ctx.globalAlpha = .25; arrow(ctx, nom[j][0], nom[j][1], nom[j][0] + dx, nom[j][1] + dy, C.muted, {dash: DASH.ref, head: 4}); ctx.globalAlpha = 1; }
    if (k < N) { const p = at(nom, k), dx = Math.cos(ang(i)) * L, dy = Math.sin(ang(i)) * L; arrow(ctx, p[0], p[1], p[0] + dx, p[1] + dy, C.muted, {dash: DASH.ref, lw: LW.ref}); if (w >= 500) txt(ctx, "commanded step", p[0] + dx + 6, p[1] + dy - 6, {size: 10.5, mono: true, color: C.muted}); }
    polyline(ctx, cmd, k, C.change, LW.change, DASH.change);
    polyline(ctx, nom, k, C.ours, LW.ours);
    const pc = at(cmd, k), pn = at(nom, k);
    dot(ctx, ...pc, 4.5, C.change); node(ctx, ...pn, C.ours);
    txt(ctx, "follow the command", pc[0] - 4, pc[1] + 22, {size: 11, color: C.changeText, weight: 600, align: "right"});
    txt(ctx, "nominal", pn[0] + 12, pn[1] + 18, {size: 11, color: C.ours, weight: 600});
    cap(ctx, `tick ${Math.min(Math.floor(k), N)} / ${N}`, 16, 22);
    cap(ctx, `per tick: nominal ${RATIO.toFixed(2)} · command 1.00 of the step`, 16, 38);
    if (k >= N) txt(ctx, `${(1 / RATIO).toFixed(1)}× farther per tick`, pc[0] - 4, pc[1] + 40, {size: 12, mono: true, color: C.ink, weight: 600, align: "right"});
  }, {dur: N * PER + .2});
  onReplay("cmd-replay", () => st.replay());
})();
function hbars(el, rows, {max = 100, marker = null, replayId = null} = {}) {
  if (!el) return;
  el.innerHTML = rows.map(r => `<div class="row ${r.cls || ""}"><span class="nm">${r.name}${r.sub ? `<small>${r.sub}</small>` : ""}</span><span class="tr">${marker != null ? `<span class="mark-line" style="left:${marker / max * 100}%"></span>` : ""}<i></i></span><span class="val">0.0%</span></div>`).join("");
  const grow = () => $$(".row", el).forEach((row, i) => {
    const v = rows[i].v, bar = $("i", row), o = $(".val", row);
    bar.style.transition = "none"; bar.style.width = "0"; void bar.offsetWidth; bar.style.transition = "";
    setTimeout(() => { bar.style.width = (v / max * 100) + "%"; tween(1200, t => { o.textContent = (v * ease(t)).toFixed(1) + "%"; }); }, RM ? 0 : i * 120);
  });
  onReveal(el, grow, .3); if (replayId) onReplay(replayId, grow);
}
(() => {
  const A = Object.fromEntries(D.ablation.map(r => [r.key, r]));
  hbars($("#target-bars"), [
    {name: "Target: nominal execution", sub: "System 0.5", v: A["L13-L13v3"].out, cls: "ours"},
    {name: "Pass-through", sub: "no layer", v: A.PASS.out},
    {name: "Target: one-tick nominal", sub: "next tick only", v: A["L13-L13v3-one"].out},
    {name: "Target: command", sub: "follow the command", v: A["L13-L13v3-cmd"].out},
  ], {marker: A.PASS.out, replayId: "target-replay"});
})();

/* ================= 02 key idea: restart at every chunk ================= */
(() => {
  const cv = $("#restart-cv"); if (!cv) return;
  const N = 30, CH = 5, PER = .2; let mode = "chunk";
  const G = 1.35, PHI = .3, dir = i => -.35 + .5 * Math.sin(i / 7);
  const st = stage(cv, 1.5, (s) => {
    const {ctx, w, h} = s, k = clamp(s.t / PER, 0, N);
    const L = w * .022, sx = w * .06, sy = h * .55;
    const d = [...Array(N)].map((_, i) => [Math.cos(dir(i)) * L, Math.sin(dir(i)) * L]);
    const act = [[sx, sy]]; d.forEach(([x, y], i) => act.push([act[i][0] + G * (x * Math.cos(PHI) - y * Math.sin(PHI)), act[i][1] + G * (x * Math.sin(PHI) + y * Math.cos(PHI))]));
    const refs = [];
    if (mode === "chunk") for (let c = 0; c < N; c += CH) { const r = [act[c].slice()]; for (let j = 0; j < CH; j++) r.push([r[j][0] + d[c + j][0], r[j][1] + d[c + j][1]]); refs.push({s: c, pts: r}); }
    else { const r = [act[0].slice()]; d.forEach(([x, y], i) => r.push([r[i][0] + x, r[i][1] + y])); refs.push({s: 0, pts: r}); }
    let emax = 0;
    polyline(ctx, act, k, C.change, LW.change, DASH.change);
    refs.forEach(r => {
      if (k < r.s) return; const u = Math.min(k - r.s, r.pts.length - 1);
      polyline(ctx, r.pts, u, C.ours, LW.ours);
      const age = k - r.s; if (mode === "chunk" && age < 1.2) ring(ctx, ...r.pts[0], 5 + 12 * age, C.ours, 1 - age / 1.2);
      node(ctx, ...r.pts[0], C.ours);
      for (let j = 1; j <= Math.floor(u); j++) emax = Math.max(emax, Math.hypot(act[r.s + j][0] - r.pts[j][0], act[r.s + j][1] - r.pts[j][1]) / L);
    });
    const cur = refs.filter(r => k >= r.s).pop(); const uu = Math.min(k - cur.s, cur.pts.length - 1);
    const a = at(act, k), b = at(cur.pts, uu), err = Math.hypot(a[0] - b[0], a[1] - b[1]) / L;
    ctx.strokeStyle = C.change; ctx.lineWidth = LW.change; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
    dot(ctx, ...a, 4, C.change); dot(ctx, ...b, 4.5, C.ours);
    cap(ctx, mode === "chunk" ? "reference restarts from the actual state at every chunk" : "one reference from the episode start", 16, 22);
    cap(ctx, "schematic · changed System 0: gain 1.35, rotated 17°", 16, h - 14, {size: 9.5});
    $("#rs-err").textContent = err.toFixed(1) + " steps"; $("#rs-max").textContent = emax.toFixed(1) + " steps";
  }, {dur: N * PER + .2});
  seg($("#restart-chips"), k => { mode = k; st.replay(); });
  onReplay("restart-replay", () => st.replay());
})();

/* ================= 03 method: deployment pipeline (night SVG) ================= */
(() => {
  const svg = $("#pipe"); if (!svg) return;
  const el = mk(svg);
  const nodes = {
    vla: {x: 24, y: 24, w: 130, h: 64, t: "VLA", s: "π0.5 · frozen"},
    hist: {x: 190, y: 146, w: 150, h: 76, t: "History", s: "last 48 ticks · 2.4 s"},
    rls: {x: 190, y: 238, w: 150, h: 62, t: "RLS statistics", s: "maps M0…M4"},
    enc: {x: 380, y: 178, w: 100, h: 94, t: "Encoder", s: "→ z ∈ R64"},
    head: {x: 520, y: 166, w: 120, h: 118, t: "Action head", s: "α · δK · δk · r"},
    s0: {x: 520, y: 336, w: 210, h: 66, t: "System 0", s: "controller + robot · unknown"},
  };
  // MF-02 on night: our method's region as a dashed box with a pale fill
  el("rect", {x: 170, y: 120, width: 488, height: 196, rx: 16, fill: "rgba(151,174,204,.06)", stroke: C.nOurs, "stroke-width": 1.5, "stroke-dasharray": "3 4"});
  el("text", {x: 186, y: 140, fill: C.nOurs, "font-size": 13, "font-weight": 600, "font-family": FONT}).textContent = "System 0.5";
  const paths = {chunk: "M154 56 L 580 56 L 580 166", meas: "M 625 402 L 625 418 L 120 418 L 120 181 L 190 181", h2r: "M 265 222 L 265 238",
    h2e: "M 340 181 L 380 205", r2e: "M 340 269 L 380 245", e2h: "M 480 225 L 520 225", u: "M 600 284 L 600 336"};
  const P = {}; for (const k in paths) P[k] = el("path", {d: paths[k], fill: "none", stroke: C.nLine, "stroke-width": 1.5, "stroke-dasharray": k === "meas" ? "2 3" : ""});
  const lab = (x, y, s) => { el("text", {x, y, fill: C.nMuted, "font-size": 10.5, "font-family": MONO}).textContent = s; };
  lab(300, 48, "chunk A(n): 10 actions"); lab(612, 330, "u = clip(a + Δu)"); lab(130, 410, "measured: hand motion · wrist force · joint velocity");
  const N = {};
  for (const k in nodes) {
    const n = nodes[k], g = el("g", {});
    const shape = k === "enc" ? el("path", {d: `M${n.x} ${n.y} L${n.x + n.w} ${n.y + 18} L${n.x + n.w} ${n.y + n.h - 18} L${n.x} ${n.y + n.h} Z`, fill: C.nRaised, stroke: C.nLine, "stroke-width": 1.2}, g)
      : el("rect", {x: n.x, y: n.y, width: n.w, height: n.h, rx: 3, fill: C.nRaised, stroke: C.nLine, "stroke-width": 1.2}, g);
    el("text", {x: n.x + 12, y: n.y + 24, fill: C.nInk, "font-size": 13, "font-weight": 600, "font-family": FONT}, g).textContent = n.t;
    el("text", {x: n.x + 12, y: n.y + 43, fill: C.nMuted, "font-size": 10.5, "font-family": MONO}, g).textContent = n.s;
    N[k] = {g, shape};
  }
  const hg = el("g", {}); for (let j = 0; j < 3; j++) { let d = ""; for (let x = 0; x <= 126; x += 6) d += (x ? "L" : "M") + (nodes.hist.x + 12 + x) + " " + (nodes.hist.y + 64 - j * 4 + 3 * Math.sin(x / 11 + j * 2)); el("path", {d, stroke: C.nMuted, "stroke-opacity": .35 + .2 * j, fill: "none", "stroke-width": 1}, hg); }
  const rlsBars = [0, 1, 2, 3, 4].map(d => el("rect", {x: nodes.rls.x + 92 + d * 10, y: nodes.rls.y + 40, width: 7, height: 12, rx: 1.5, fill: C.nLine}));
  const zc = [...Array(8)].map((_, i) => el("rect", {x: 490, y: 192 + i * 9, width: 18, height: 6, rx: 1.5, fill: C.nLine}));
  el("text", {x: 492, y: 186, fill: C.nBody, "font-size": 12, "font-family": FONT}).textContent = "z";
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
  const DUR = 3.6, btns = $$("#pipe-steps button");
  let step = 0, tStep = 0, last = 0, auto = true, raf = 0, vis = false;
  function setStep(s) {
    step = s; tStep = 0;
    btns.forEach((b, i) => { b.classList.toggle("on", i === s); b.setAttribute("aria-pressed", i === s ? "true" : "false"); });
    $("#pipe-cap").innerHTML = CAP[s];
    for (const k in N) { const on = ACT[s].includes(k); N[k].shape.setAttribute("stroke", on ? C.nOurs : C.nLine); N[k].shape.setAttribute("stroke-width", on ? 1.5 : 1.2); N[k].g.style.opacity = on ? 1 : .55; }
    for (const k in P) P[k].setAttribute("stroke", SEQ[s].some(q => q[0] === k) ? C.nMuted : C.nLine);
    rlsBars.forEach((b, d) => { b.setAttribute("height", s >= 1 ? (d === 2 ? 14 : 4 + d) : 4); b.setAttribute("fill", s >= 1 && d === 2 ? C.nOurs : C.nLine); });
    zc.forEach((c, i) => c.setAttribute("fill", s >= 2 ? `rgba(151,174,204,${.35 + .08 * (i % 5)})` : C.nLine));
  }
  function draw() {
    pulses.innerHTML = "";
    SEQ[step].forEach(([k, n], qi) => {
      const p = P[k], L = p.getTotalLength();
      for (let i = 0; i < n; i++) {
        const u = (tStep / (DUR * .8)) * 1.25 - i * (k === "chunk" ? .06 : .14) - qi * .1; if (u < 0 || u > 1) continue;
        const pt = p.getPointAtLength(ease3(u) * L);
        el("circle", {cx: pt.x, cy: pt.y, r: 3.2, fill: k === "chunk" ? C.nMuted : C.nOurs}, pulses);
      }
    });
  }
  function loop(ts) {
    const dt = last ? Math.min(.05, (ts - last) / 1000) : 0; last = ts; tStep += dt;
    if (tStep > DUR) { if (auto && step < 4) setStep(step + 1); else { tStep = DUR; draw(); raf = 0; return; } }
    draw(); raf = vis && !document.hidden ? requestAnimationFrame(loop) : 0; if (!raf) last = 0;
  }
  const play = () => { if (RM) { draw(); return; } if (!raf && vis) { last = 0; raf = requestAnimationFrame(loop); } };
  btns.forEach((b, i) => b.addEventListener("click", () => { auto = false; setStep(i); play(); }));
  onReplay("pipe-replay", () => { auto = true; setStep(0); play(); });
  setStep(RM ? 4 : 0);
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) play(); }, {threshold: .2}).observe(svg);
})();

/* ================= 03 method: live RLS lag identification (schematic · live toy) ================= */
(() => {
  const cv = $("#rls-cv"); if (!cv) return;
  const LAG = 5, LAM = .97, HIST = 48, NOISE = .12, RUN = 10;
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
  for (let i = 0; i < (RM ? 300 : 60); i++) tick();
  let acc = 0;
  const st = stage(cv, 1.05, (s, dt) => {
    const {ctx, w, h} = s; acc += dt; while (acc > .05) { tick(); acc -= .05; }
    for (let d = 0; d < LAG; d++) shown[d] = RM || s.t >= RUN ? th[d] : lerp(shown[d], th[d], 1 - Math.exp(-dt * 8));
    const top = 30, L = 40, R = w - 20;
    cap(ctx, "last 48 ticks", L, 20, {color: C.nMuted});
    const n = Math.min(HIST, U.length), X = i => L + (R - L) * i / (HIST - 1);
    const row = (arr, y0, col, lw) => { ctx.beginPath(); for (let i = 0; i < n; i++) { const v = arr[arr.length - n + i]; const x = X(i), y = y0 - clamp(v, -1.25, 1.25) * 20; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash([]); ctx.stroke(); };
    const y1 = top + 46, y2 = y1 + 84;
    ctx.strokeStyle = C.nLine; ctx.lineWidth = 1; [y1, y2].forEach(y => { ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke(); });
    row(U, y1, C.nMuted, LW.base); row(M, y2, C.nBody, LW.base);
    txt(ctx, "command sent", L, y1 - 30, {size: 10.5, mono: true, color: C.nMuted}); txt(ctx, "measured motion", L, y2 - 32, {size: 10.5, mono: true, color: C.nMuted});
    const bt = y2 + 66, bb = h - 34, bw = (R - L) / LAG * .56, mx = 2.2;
    let best = 0; for (let d = 1; d < LAG; d++) if (Math.abs(shown[d]) > Math.abs(shown[best])) best = d;
    cap(ctx, "RLS map size |M_d| per lag", L, y2 + 42, {color: C.nMuted});
    for (let d = 0; d < LAG; d++) {
      const cx = L + (R - L) * (d + .5) / LAG, v = Math.abs(shown[d]), hh = (bb - bt) * clamp(v / mx, 0, 1);
      ctx.fillStyle = "rgba(255,255,255,.04)"; rr(ctx, cx - bw / 2, bt, bw, bb - bt, 3); ctx.fill();
      ctx.fillStyle = d === best ? C.nOurs : C.nLine; rr(ctx, cx - bw / 2, bb - hh, bw, Math.max(hh, 1), 3); ctx.fill();
      txt(ctx, v.toFixed(2), cx, bb - hh - 8, {size: 11, mono: true, color: d === best ? C.nInk : C.nMuted, align: "center", weight: d === best ? 600 : 400});
      txt(ctx, "d = " + d, cx, bb + 18, {size: 10.5, mono: true, color: d === best ? C.nOurs : C.nMuted, align: "center"});
    }
    $("#rls-dh").textContent = best + (best === 1 ? " tick" : " ticks"); $("#rls-gh").textContent = "×" + Math.abs(shown[best]).toFixed(2);
  }, {dur: RUN});
  const sd = $("#rls-d"), sg = $("#rls-g");
  const upd = () => { dly = +sd.value; gain = +sg.value; $("#rls-d-o").textContent = dly + (dly === 1 ? " tick" : " ticks"); $("#rls-g-o").textContent = "×" + gain.toFixed(1); if (RM) { for (let i = 0; i < 300; i++) tick(); st.redraw(); } else st.replay(); };
  sd.addEventListener("input", upd); sg.addEventListener("input", upd);
  $("#rls-d-o").textContent = dly + " ticks"; $("#rls-g-o").textContent = "×" + gain.toFixed(1);
  onReplay("rls-replay", () => st.replay());
})();

/* ================= 04 action head terms ================= */
(() => {
  const cv = $("#head-cv"); if (!cv) return;
  const N = 10; let term = "lead";
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
    const {ctx, w, h} = s, m = ease3(s.t / 1.4);
    const L = 30, R = w - 20, cy = h * .5, sc = Math.min((R - L) / N * 1.05, h * .34);
    cap(ctx, "translation command per tick of one chunk", L, 22);
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L, cy); ctx.lineTo(R, cy); ctx.stroke();
    for (let i = 0; i < N; i++) {
      const x = L + (R - L) * (i + .5) / N; dot(ctx, x, cy, 2, C.faint);
      const [ax, ay] = a[i]; arrow(ctx, x, cy, x + ax * sc, cy - ay * sc, C.base, {lw: LW.base, head: 6});
      const [ux, uy] = corrected(i, m); arrow(ctx, x, cy, x + ux * sc, cy - uy * sc, C.ours, {lw: LW.ours, head: 7});
      txt(ctx, "t" + i, x, h - 14, {size: 10, color: C.muted, align: "center"});
    }
  }, {dur: 1.6});
  const capEl = $("#head-cap"); capEl.innerHTML = CAP.lead;
  seg($("#head-chips"), k => { term = k; capEl.innerHTML = CAP[k]; st.replay(); });
  onReplay("head-replay", () => st.replay());
})();

/* ================= 05 training loop ================= */
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
  let stp = 0, ts = 0, auto = true;
  const capEl = $("#train-cap"), setSeg = seg($("#train-steps"), k => { auto = false; stp = +k; ts = 0; capEl.innerHTML = CAP[stp]; st.replay(); });
  const show = s => { stp = s; ts = 0; capEl.innerHTML = CAP[s]; setSeg && setSeg($$("#train-steps button")[s]); };
  const total = DUR.reduce((a, b) => a + b);
  const st = stage(cv, w => w < 640 ? .72 : 2.3, (s, dt) => {
    const {ctx, w, h} = s;
    if (RM) { if (stp !== 4 && auto) show(4); ts = 99; } else { ts += dt; if (auto && ts > DUR[stp] && stp < 4) show(stp + 1); }
    const p = clamp(ts / (DUR[stp] * .7), 0, 1), narrow = w < 640;
    const PW = narrow ? w : w * .6, L = 40, R = PW - 30, cy = h * (narrow ? .27 : .55), span = R - L;
    const ref = [...Array(H + 1)].map((_, j) => [L + span * j / H, cy - Math.sin(j / H * 2.2) * h * .16]);
    const act = ref.map(([x, y], j) => [x, y + Math.pow(j / H, 1.5) * h * .2]);
    const cf = act.map(([x, y], j) => [x, lerp(y, ref[j][1], .78 * (stp >= 3 ? (stp === 3 ? ease3(p) : 1) : 0))]);
    cap(ctx, "one chunk · 8 ticks", L, 22);
    dot(ctx, ...ref[0], 4.5, C.ink);
    if (stp === 0) { const o = ease3(p) * 18; ring(ctx, ref[0][0], ref[0][1] - o, 9, C.ours, .9); ring(ctx, ref[0][0], ref[0][1] + o, 9, C.change, .9); txt(ctx, "simulator state s(τn)", ref[0][0] + 14, ref[0][1] - 26, {size: 11, color: C.body}); txt(ctx, "copy", ref[0][0] + 16, ref[0][1] + 4, {size: 11, mono: true, color: C.ours}); }
    if (stp >= 1) { polyline(ctx, ref, (stp === 1 ? p : 1) * H, C.ours, LW.ours); txt(ctx, "nominal execution (copy, nominal System 0)", L + span * .12, Math.min(...ref.map(q => q[1])) - 16, {size: 11, color: C.ours, weight: 600}); }
    if (stp >= 2) {
      const u = (stp === 2 ? p : 1) * H; polyline(ctx, act, u, C.change, LW.change, DASH.change);
      for (let j = 1; j <= Math.floor(u); j++) { ctx.strokeStyle = C.change; ctx.globalAlpha = stp === 2 ? .8 : .25; ctx.lineWidth = LW.ref; ctx.beginPath(); ctx.moveTo(act[j][0], act[j][1]); ctx.lineTo(...ref[j]); ctx.stroke(); ctx.globalAlpha = 1; }
      txt(ctx, "changed System 0 + layer", act[H][0] - 4, act[H][1] + 20, {size: 11, color: C.changeText, align: "right"});
      if (u >= H && stp === 2) txt(ctx, "e", act[H][0] + 8, (act[H][1] + ref[H][1]) / 2 + 4, {size: 14, color: C.changeText, weight: 600});
    }
    if (stp >= 3) {
      polyline(ctx, cf, H, C.oursLight, LW.base);
      for (let j = 1; j <= H; j++) { ctx.strokeStyle = C.changeText; ctx.lineWidth = LW.change; ctx.beginPath(); ctx.moveTo(cf[j][0], cf[j][1]); ctx.lineTo(...ref[j]); ctx.stroke(); }
      txtBg(ctx, "e′ (counterfactual)", cf[H][0] - 8, cf[H][1] + 20, {size: 11, color: C.changeText, weight: 600, align: "right"});
    }
    const px = narrow ? 30 : PW + 10, py = narrow ? h * .56 : 40, cs = narrow ? Math.min(14, (w - 60) / 20) : Math.min(15, (w - PW - 40) / 12);
    if (stp >= 3) {
      cap(ctx, "J (8 × 8 blocks, lower triangular)", px, py - 10);
      for (let k = 0; k < H; k++) for (let i = 0; i <= k; i++) {
        if (!(stp > 3 || ease3(p) * 2 * H > k + i)) continue;
        ctx.fillStyle = `rgba(63,88,118,${.12 + .7 * Math.exp(-(k - i) / 2.5)})`; ctx.fillRect(px + i * cs, py + k * cs, cs - 1.5, cs - 1.5);
      }
      const bx = px + H * cs + 18; txt(ctx, "× (u′ − u)", bx, py + H * cs / 2, {size: 12, mono: true, color: C.body});
      txt(ctx, "= change of motion", bx, py + H * cs / 2 + 18, {size: 11, mono: true, color: C.muted});
    }
    if (stp >= 4) {
      const bw1 = narrow ? 130 : 170, bw2 = narrow ? 118 : 130, gap = narrow ? 28 : 40, ly = py + H * cs + 30;
      rr(ctx, px, ly, bw1, 40, 3); ctx.fillStyle = C.ink; ctx.fill();
      txt(ctx, "∇ loss(e′)", px + 14, ly + 25, {size: 13, mono: true, color: "#fff", weight: 600});
      const hx = px + bw1 + gap, hy = ly + 20; rr(ctx, hx, ly, bw2, 40, 3); ctx.strokeStyle = C.ours; ctx.lineWidth = 1.5; ctx.stroke();
      txt(ctx, "head + encoder", hx + 14, ly + 25, {size: 12, color: C.ours, weight: 600});
      const u = Math.min(ts, DUR[4]) * 1.3 % 1; for (let i = 0; i < 3; i++) { const v = (u + i / 3) % 1; dot(ctx, lerp(px + bw1 + 2, hx - 4, v), hy, 3.4, C.ours); }
      cap(ctx, "forward model frozen", px, ly + 62);
    }
  }, {dur: total + .2});
  show(0);
  onReplay("train-replay", () => { auto = true; show(0); st.replay(); });
})();

/* ================= 06 results: joint-fault benchmarks (horizontal bars, CH-02/CH-03) ================= */
(() => {
  const svg = $("#ext-chart"); if (!svg) return;
  const el = mk(svg), BEST = {rs: "SC-VLA", jp: "J-PARC"};
  let cur = "rs", shown = false;
  const BH = 9, GAP = 3, GG = 20, L = 190, R = 940, T = 30;
  function draw(b) {
    svg.innerHTML = "";
    const E = D.external[b], rows = [...E.rows, {name: "Mean", base: E.mean.base, rep_best: E.mean.rep_best, ours: E.mean.ours, mean: true}];
    const gh = 3 * BH + 2 * GAP, H = T + rows.length * (gh + GG) + 30;
    svg.setAttribute("viewBox", `0 0 1000 ${H}`);
    const X = v => L + (R - L) * v / 100;
    [0, 25, 50, 75, 100].forEach(v => { el("line", {x1: X(v), x2: X(v), y1: T - 8, y2: H - 30, class: "gl"}); el("text", {x: X(v), y: T - 14, "text-anchor": "middle"}).textContent = v; });
    rows.forEach((r, i) => {
      const y0 = T + i * (gh + GG);
      if (r.mean) el("rect", {x: 0, y: y0 - 8, width: 1000, height: gh + 16, rx: 8, fill: "rgba(247,216,202,.35)"});
      el("text", {x: L - 14, y: y0 + gh / 2 + 4, "text-anchor": "end", fill: r.mean ? C.ink : C.body, "font-weight": r.mean ? 600 : 400}).textContent = r.name;
      [["base", C.baseFill], ["rep_best", C.base], ["ours", C.ours]].forEach(([k, f], j) => {   // ours always last in the group
        const y = y0 + j * (BH + GAP), v = r[k];
        el("rect", {x: L, y, height: BH, width: 0, rx: 2, fill: f, "data-v": v});
        if (k === "ours") el("text", {x: X(0) + 6, y: y + BH - 1, class: "v", "data-v": v, "data-x": X(v) + 6}).textContent = "";
      });
    });
    el("line", {x1: L, x2: L, y1: T - 8, y2: H - 30, class: "ax"});
    el("text", {x: (L + R) / 2, y: H - 6, "text-anchor": "middle"}).textContent = "success (%)";
    $("#ext-best-name").textContent = BEST[b];
    $("#ext-kpis").innerHTML = `<div class="kpi ours"><div class="k">System 0.5 · mean</div><div class="v">${E.mean.ours.toFixed(1)}<small>%</small></div><div class="s">${b === "rs" ? "7 RoboStress scenarios" : "6 J-PARC settings"}</div></div>
      <div class="kpi"><div class="k">${BEST[b]} · as reported</div><div class="v">${E.mean.rep_best.toFixed(1)}<small>%</small></div><div class="s">best reported method</div></div>
      <div class="kpi"><div class="k">Gain over base</div><div class="v">+${E.gain.toFixed(1)}<small> pts</small></div><div class="s">vs +${E.gain_best.toFixed(1)} pts for ${BEST[b]}</div></div>`;
    if (shown) grow();
  }
  function grow() {
    const bars = $$("rect[data-v]", svg), labels = $$("text[data-v]", svg), X = v => L + (R - L) * v / 100;
    tween(1300, t => {
      bars.forEach((r, i) => { const k = ease(clamp(t * 1.4 - i * .012, 0, 1)); r.setAttribute("width", Math.max(0, X(+r.dataset.v * k) - L)); });
      labels.forEach(l => { const k = ease(t); l.textContent = (+l.dataset.v * k).toFixed(1); l.setAttribute("x", lerp(X(0) + 6, +l.dataset.x, k)); });
    });
  }
  draw(cur);
  onReveal(svg, () => { shown = true; grow(); }, .2);
  seg($("#ext-chips"), k => { cur = k; draw(k); });
  onReplay("ext-replay", () => { shown = true; draw(cur); });
})();

/* ================= 06 results: outside the training distribution ================= */
(() => {
  const ours = D.q2.find(r => r.key === "L13-L13v3"), others = D.q2.filter(r => r.key !== "L13-L13v3").sort((a, b) => b.out - a.out);
  hbars($("#q2-bars"), [ours, ...others].map(r => ({name: r.name, v: r.out, sub: `in-family ${r.in.toFixed(1)} · nominal ${r.nom.toFixed(1)}`, cls: r === ours ? "ours" : ""})), {replayId: "q2-replay"});
})();

/* ================= 06 results: tracking error vs success ================= */
(() => {
  const svg = $("#scatter"); if (!svg) return;
  const el = mk(svg), pts = D.scatter.points, L = 56, R = 540, T = 20, B = 350;
  const xmin = 5.5, xmax = Math.ceil(Math.max(...pts.map(p => p.track)) + .5), ymin = 20, ymax = 95;
  const X = v => L + (R - L) * (v - xmin) / (xmax - xmin), Y = v => B - (B - T) * (v - ymin) / (ymax - ymin);
  for (let v = 30; v <= 90; v += 10) { el("line", {x1: L, x2: R, y1: Y(v), y2: Y(v), class: "gl"}); el("text", {x: L - 10, y: Y(v) + 4, "text-anchor": "end"}).textContent = v + "%"; }
  for (let v = 6; v <= xmax; v += 2) el("text", {x: X(v), y: B + 20, "text-anchor": "middle"}).textContent = v;
  el("line", {x1: L, x2: R, y1: B, y2: B, class: "ax"});
  el("text", {x: (L + R) / 2, y: B + 42, "text-anchor": "middle"}).textContent = "mean tracking error against the nominal execution (mm)";
  el("text", {x: R, y: T + 4, "text-anchor": "end", class: "v", style: "font-size:13px"}).textContent = `Spearman ρ = ${D.scatter.rho.toFixed(2).replace("-", "−")}`;
  const LBL = {"L13-L13v3": "System 0.5", PASS: "pass-through", "L13-L13v3-cmd": "reference: command", "SAC-SACv3": "Residual SAC"};
  const PASS = pts.find(p => p.key === "PASS"), lx = X(PASS.track + .95), lyy = Y(PASS.success + 5);
  const leader = el("line", {x1: X(PASS.track) + 4, y1: Y(PASS.success) - 3, x2: lx - 3, y2: lyy + 2, stroke: C.base, "stroke-width": .8, opacity: 0});
  const nodes = [...pts].sort((a, b) => a.track - b.track).map(p => {
    const ours = p.key === "L13-L13v3", variant = !ours && p.key.startsWith("L13"), g = el("g", {});
    const c = el("circle", {cx: X(p.track), cy: Y(ymin), r: ours ? 7 : 5, fill: ours ? C.ours : variant ? C.oursLight : C.base, opacity: 0}, g);
    el("title", {}, c).textContent = `${p.name}: ${p.track.toFixed(2)} mm, ${p.success.toFixed(1)}%`;
    const dy = p.key === "L13-L13v3-cmd" ? -14 : 0;
    const tl = el("text", {x: p.key === "PASS" ? lx : X(p.track) + (p.track > 15 ? -12 : 12), y: p.key === "PASS" ? lyy + 4 : Y(p.success) + 4 + dy, "text-anchor": p.track > 15 ? "end" : "start", opacity: 0, fill: ours ? C.ink : C.muted, "font-weight": ours ? 600 : 400}, g);
    tl.textContent = LBL[p.key] || p.name;
    const always = !!LBL[p.key];
    g.addEventListener("mouseenter", () => tl.setAttribute("opacity", 1)); g.addEventListener("mouseleave", () => tl.setAttribute("opacity", always ? 1 : 0));
    g.addEventListener("click", () => tl.setAttribute("opacity", 1));
    return {p, c, tl, always};
  });
  const play = () => nodes.forEach((n, i) => { n.c.setAttribute("cy", Y(ymin)); n.c.setAttribute("opacity", 0); setTimeout(() => tween(900, t => {
    const k = ease(t); n.c.setAttribute("cy", lerp(Y(ymin) + 10, Y(n.p.success), k)); n.c.setAttribute("opacity", Math.min(1, t * 2));
    if (n.always) n.tl.setAttribute("opacity", k); if (n.p.key === "PASS") leader.setAttribute("opacity", k);
  }), RM ? 0 : i * 110); });
  onReveal(svg, play, .3); onReplay("scatter-replay", play);
})();

/* ================= 06 results: other policies ================= */
(() => {
  const rows = [];
  D.policies.filter(p => p.key !== "pi05").forEach(p => {
    rows.push({name: p.name, sub: "pass-through", v: p.pass});
    rows.push({name: p.name + " + System 0.5", sub: `nominal ${p.nom_pass.toFixed(1)} → ${p.nom_ours.toFixed(1)}`, v: p.ours, cls: "ours"});
  });
  hbars($("#pol-bars"), rows, {replayId: "pol-replay"});
})();

/* ================= 06 results: strength sweep, change of error vs change of success ================= */
(() => {
  const svg = $("#sweep"); if (!svg) return;
  const el = mk(svg), pts = D.sweep.points, L = 56, R = 540, T = 20, B = 350;
  const xmin = -80, xmax = 60, ymin = -20, ymax = 70;
  const X = v => L + (R - L) * (clamp(v, xmin, xmax) - xmin) / (xmax - xmin), Y = v => B - (B - T) * (v - ymin) / (ymax - ymin);
  for (let v = -10; v <= 60; v += 10) { el("line", {x1: L, x2: R, y1: Y(v), y2: Y(v), class: "gl"}); el("text", {x: L - 10, y: Y(v) + 4, "text-anchor": "end"}).textContent = (v > 0 ? "+" : "") + v; }
  for (let v = -80; v <= 60; v += 20) el("text", {x: X(v), y: B + 20, "text-anchor": "middle"}).textContent = (v > 0 ? "+" : "") + v + "%";
  el("line", {x1: L, x2: R, y1: Y(0), y2: Y(0), class: "ax"});
  el("line", {x1: X(0), x2: X(0), y1: T, y2: B, stroke: C.base, "stroke-width": 1, "stroke-dasharray": "4 4"});
  el("text", {x: (L + R) / 2, y: B + 42, "text-anchor": "middle"}).textContent = "change of tracking error, System 0.5 vs pass-through";
  el("text", {x: L - 44, y: T - 6}).textContent = "Δ success (pts)";
  el("text", {x: R, y: T + 4, "text-anchor": "end", class: "v", style: "font-size:13px"}).textContent = `Spearman ρ = ${D.sweep.rho.toFixed(2).replace("-", "−")}`;
  const LV = {weak: "weak", main: "main", strong: "strong"};
  const nodes = pts.map(p => {
    const g = el("g", {}), out = p.d_err > xmax;
    const c = el("circle", {cx: X(p.d_err), cy: Y(0), r: 5, fill: p.d_err < 0 ? C.ours : C.base, opacity: 0}, g);
    el("title", {}, c).textContent = `${p.family} (${LV[p.level]}): error ${p.d_err > 0 ? "+" : ""}${p.d_err.toFixed(1)}%, success ${p.pass_succ.toFixed(1)} → ${p.ours_succ.toFixed(1)}%`;
    const tl = out ? el("text", {x: X(p.d_err) - 8, y: Y(p.d_succ) - 8, "text-anchor": "end", fill: C.muted, opacity: 0}, g) : null;
    if (tl) tl.textContent = `+${Math.round(p.d_err)}%`;
    return {p, c, tl};
  });
  const play = () => nodes.forEach((n, i) => { n.c.setAttribute("cy", Y(0)); n.c.setAttribute("opacity", 0); setTimeout(() => tween(900, t => {
    const k = ease(t); n.c.setAttribute("cy", lerp(Y(0), Y(n.p.d_succ), k)); n.c.setAttribute("opacity", Math.min(1, t * 2)); if (n.tl) n.tl.setAttribute("opacity", k);
  }), RM ? 0 : i * 60); });
  onReveal(svg, play, .3); onReplay("sweep-replay", play);
})();

/* ================= 07 hardware: UR5e ================= */
(() => {
  const H = D.ur5e, A = H.per_arm, NAMES = {gain1: "Pass-through", s05: "Online calibrator", layer: "System 0.5"};
  const box = $("#hw-kpis");
  if (box) box.innerHTML = ["gain1", "s05", "layer"].map(k => `<div class="kpi ${k === "layer" ? "ours" : ""}"><div class="k">${NAMES[k]}</div><div class="v">${A[k].err.toFixed(1)}<small> mm</small></div><div class="s">${A[k].success}/30 completed · median ${A[k].median_time.toFixed(0)} s</div></div>`).join("");
  const by = {}; H.trials.forEach(t => (by[t.pair] ||= {})[t.arm] = t);
  const pairs = Object.keys(by).map(Number).sort((a, b) => by[b].gain1.err - by[a].gain1.err);
  const sv = $("#hw-dumb");
  if (sv) {
    const el = mk(sv), L = 50, R = 540, T = 20, B = 470, X = v => L + (R - L) * v / 12, rowH = (B - T) / pairs.length;
    sv.setAttribute("viewBox", "0 0 560 540");
    for (let v = 0; v <= 12; v += 2) { el("line", {x1: X(v), x2: X(v), y1: T - 6, y2: B, class: "gl"}); el("text", {x: X(v), y: B + 18, "text-anchor": "middle"}).textContent = v; }
    el("text", {x: (L + R) / 2, y: B + 36, "text-anchor": "middle"}).textContent = "tracking error (mm), placements sorted by pass-through error";
    const items = pairs.map((p, i) => {
      const y = T + rowH * (i + .5), r = by[p];
      el("text", {x: L - 10, y: y + 3.5, "text-anchor": "end", style: "font-size:9.5px;font-family:var(--font-mono)"}).textContent = "P" + String(p).padStart(2, "0");
      const ln = el("line", {x1: X(r.gain1.err), x2: X(r.gain1.err), y1: y, y2: y, stroke: C.baseFill, "stroke-width": 1.2});
      el("circle", {cx: X(r.gain1.err), cy: y, r: 4, fill: C.change});
      const cal = el("circle", {cx: X(r.gain1.err), cy: y, r: 3.6, fill: "#fff", stroke: C.base, "stroke-width": 1.5, opacity: 0});
      const our = el("circle", {cx: X(r.gain1.err), cy: y, r: 4.4, fill: C.ours});
      return {r, ln, cal, our};
    });
    [[C.change, null, "pass-through"], ["#fff", C.base, "calibrator"], [C.ours, null, "System 0.5"]].forEach(([f, s, t], i) => { el("circle", {cx: L + i * 140, cy: 520, r: 4, fill: f, stroke: s || "none", "stroke-width": 1.5}); el("text", {x: L + i * 140 + 10, y: 524}).textContent = t; });
    const play = () => items.forEach((it, i) => setTimeout(() => tween(1100, t => {
      const k = ease(t), xo = X(lerp(it.r.gain1.err, it.r.layer.err, k));
      it.our.setAttribute("cx", xo); it.ln.setAttribute("x2", xo);
      it.cal.setAttribute("cx", X(lerp(it.r.gain1.err, it.r.s05.err, k))); it.cal.setAttribute("opacity", k);
    }), RM ? 0 : 200 + i * 35));
    onReveal(sv, play, .25); onReplay("dumb-replay", play);
  }
  const sc = $("#hw-cdf");
  if (sc) {
    const el = mk(sc), L = 46, R = 530, T = 20, B = 440, X = v => L + (R - L) * v / 120, Y = v => B - (B - T) * v / 30;
    const defs = el("defs", {}), clip = el("clipPath", {id: "cclip"}, defs), cr = el("rect", {x: L - 2, y: 0, width: 0, height: B + 4}, clip);
    for (let v = 0; v <= 30; v += 5) { el("line", {x1: L, x2: R, y1: Y(v), y2: Y(v), class: "gl"}); el("text", {x: L - 10, y: Y(v) + 4, "text-anchor": "end"}).textContent = v; }
    for (let v = 0; v <= 120; v += 30) el("text", {x: X(v), y: B + 20, "text-anchor": "middle"}).textContent = v + " s";
    el("line", {x1: L, x2: R, y1: B, y2: B, class: "ax"});
    el("line", {x1: X(60), x2: X(60), y1: T, y2: B, stroke: C.muted, "stroke-width": LW.ref, "stroke-dasharray": "3 4"});
    el("text", {x: X(60) + 6, y: T + 12}).textContent = "60 s";
    const STY = {gain1: [C.change, LW.change, "4 4"], s05: [C.base, LW.base, ""], layer: [C.ours, LW.ours, ""]};
    const gr = el("g", {"clip-path": "url(#cclip)"}), ends = [];
    ["gain1", "s05", "layer"].forEach(k => {
      const ts = H.trials.filter(t => t.arm === k && t.success).map(t => t.time).sort((a, b) => a - b);
      let d = `M${X(0)} ${Y(0)}`, c = 0; ts.forEach(t => { d += ` L${X(t)} ${Y(c)} L${X(t)} ${Y(++c)}`; }); d += ` L${X(120)} ${Y(c)}`;
      el("path", {d, fill: "none", stroke: STY[k][0], "stroke-width": STY[k][1], "stroke-dasharray": STY[k][2], "stroke-linejoin": "round"}, gr);
      ends.push([k, c, ts.filter(t => t <= 60).length]);
    });
    const lab = el("g", {opacity: 0}), yo = {gain1: 14, s05: -2, layer: 0}, col = {gain1: C.changeText, s05: C.body, layer: C.ours};
    ends.forEach(([k, c, a60]) => {
      el("text", {x: R + 4, y: Y(c) + 4 + yo[k], class: "v", fill: col[k]}, lab).textContent = c;
      el("circle", {cx: X(60), cy: Y(a60), r: 3.5, fill: k === "s05" ? C.base : k === "layer" ? C.ours : C.change}, lab);
      el("text", {x: X(60) - 8, y: Y(a60) + 4 + (k === "s05" ? 10 : k === "layer" ? -4 : 0), "text-anchor": "end", style: "font-size:11px;font-family:var(--font-mono)"}, lab).textContent = a60;
    });
    [[C.change, "4 4", "pass-through"], [C.base, "", "calibrator"], [C.ours, "", "System 0.5"]].forEach(([s, da, t], i) => { el("line", {x1: L + i * 140, x2: L + i * 140 + 22, y1: B + 52, y2: B + 52, stroke: s, "stroke-width": 2, "stroke-dasharray": da}); el("text", {x: L + i * 140 + 30, y: B + 56}).textContent = t; });
    el("text", {x: L, y: T - 4, style: "font-size:10px;font-family:var(--font-mono);letter-spacing:.08em"}).textContent = "COMPLETED TRIALS (OF 30)";
    const play = () => { lab.setAttribute("opacity", 0); cr.setAttribute("width", 0); tween(2600, t => { cr.setAttribute("width", (R - L + 30) * t); if (t >= 1) tween(500, u => lab.setAttribute("opacity", u)); }); };
    onReveal(sc, play, .3); onReplay("cdf-replay", play);
  }
})();

/* ================= 07 hardware: video wall (V-02..V-06) + lightbox ================= */
(() => {
  const wall = $("#wall"); if (!wall || !CLIPS.length) return;
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); }), {rootMargin: "120px"});
  const ok = (c, k, p) => c[k].success ? `<span class="okmark success p${p}">✓ ${c[k].time_s.toFixed(0)} s</span>` : `<span class="okmark fail p${p}">× fail</span>`;
  const out = (c, k) => c[k].success ? `${c[k].time_s.toFixed(0)} s` : "fail";
  wall.innerHTML = CLIPS.map(c => `<div class="tile" data-p="${c.pair}" tabindex="0" role="button" aria-label="Placement ${c.pair}: pass-through on the left, the online calibrator in the middle and System 0.5 on the right">`
    + `<video muted loop playsinline preload="none" poster="${c.poster}" data-src="${c.video}" aria-label="Placement ${c.pair}: pass-through on the left, the online calibrator in the middle and System 0.5 on the right"></video>`
    + `<span class="half-tag l">pass-through</span><span class="half-tag m">calibrator</span><span class="half-tag r">System 0.5</span>`
    + ok(c, "gain1", 0) + ok(c, "s05", 1) + ok(c, "layer", 2) + `<span class="pl">P${String(c.pair).padStart(2, "0")}</span></div>`).join("");
  $$("video", wall).forEach(v => { if (!RM) vio.observe(v); });
  const F = {all: () => true, three: c => c.gain1.success && c.s05.success && c.layer.success, gain: c => c.layer.success && !c.gain1.success, fail: c => !c.layer.success};
  seg($("#wall-filter"), f => { const byP = Object.fromEntries(CLIPS.map(c => [c.pair, c])); $$(".tile", wall).forEach(t => t.style.display = F[f](byP[t.dataset.p]) ? "" : "none"); });
  const more = $("#wall-more");
  more.addEventListener("click", () => { const col = wall.classList.toggle("collapsed"); more.textContent = col ? "Show all 30 placements" : "Show fewer"; if (col) wall.scrollIntoView({block: "start", behavior: "smooth"}); });
  const lb = $("#lb"), lv = $("#lb-v");
  const open = t => { const c = CLIPS.find(x => x.pair == t.dataset.p); lv.src = c.video; $("#lb-t").textContent = `Placement ${c.pair} · pass-through ${out(c, "gain1")} · calibrator ${out(c, "s05")} · System 0.5 ${out(c, "layer")} · 4× real time`; lb.classList.add("open"); lv.play().catch(() => {}); };
  wall.addEventListener("click", e => { const t = e.target.closest(".tile"); if (t) open(t); });
  wall.addEventListener("keydown", e => { const t = e.target.closest(".tile"); if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(t); } });
  const close = () => { lb.classList.remove("open"); lv.pause(); };
  $("#lb-x").addEventListener("click", close); lb.addEventListener("click", e => { if (e.target === lb) close(); });
  addEventListener("keydown", e => { if (e.key === "Escape") close(); });
})();

/* ================= BibTeX copy (BT-03) ================= */
$("#copy-bib")?.addEventListener("click", e => { navigator.clipboard?.writeText($("#bib-text").textContent); e.target.textContent = "Copied"; setTimeout(() => e.target.textContent = "Copy", 1600); });
})();
