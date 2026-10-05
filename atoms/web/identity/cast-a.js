/* ---- agent cast A: twelve role characters on the shared AgentRig (Wave 6) ----
   Every character is the same species: the AgentRig square body, face and globe antenna.
   What makes each one itself is a signature prop drawn in the house hand (paper fill, ink line,
   one pale wash), a signature action, an idle habit and a default mood.
   Props use the rig's prop contract { anchor, build(g, ch), draw(state, ctx) } on the 'front' anchor,
   so they inherit the body's lean and squash; inside, each one adds its own physics in world space:
   held parts trail behind on lagging critically damped springs, hanging parts swing toward the
   apparent pull and settle without swinging back. Actions are sums of critically damped steps, so a
   pose at any time is a pure function of the clock.
   Global (shared with cast B): AgentCast.roles[slug] = { name, mean, persona, sig, expression, wash, droop, prop(), act(ch), svg({ size }) }
   and AgentCast.a = { CAST, play(ch, t), busy(ch, t), svg(slug, { size }), washOf } */
(() => {
const R = globalThis.AgentRig; if (!R) return;
const F = R.FACE, NS = 'http://www.w3.org/2000/svg', TAU = Math.PI*2, RM = R.reduced, DEG = 180/Math.PI;
const INK = '#1d1d1b', PAPER = '#fffaf2';
const cl = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lp = (a, b, p) => a + (b - a)*p;
const n2 = v => String(Math.round(v*100)/100);
const hash = n => { const x = Math.sin(n*127.1 + 311.7)*43758.5453; return x - Math.floor(x); };
// critically damped spring over dt (same solver as the rig)
const cd = (x, v, to, w, dt) => { const x0 = x - to, e = Math.exp(-w*dt), k = v + w*x0; return [to + e*(x0 + k*dt), e*(v - w*k*dt)]; };
// a critically damped step from 0 to 1 started e seconds ago; keyframes are sums of these steps
const pr = (e, w) => e <= 0 ? 0 : RM ? 1 : 1 - Math.exp(-w*e)*(1 + w*e);
const kf = (e, ks, w = 16) => { let v = ks[0][1]; for (let i = 1; i < ks.length; i++) v += (ks[i][1] - ks[i - 1][1])*pr(e - ks[i][0], ks[i][2] || w); return v; };
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
const swFor = px => cl(1 + px*.0068, 1.15, 2.5);
// neutral face parameters (mirrors the rig's defaults) for the static poses
const D0 = { eo:1, es:1, sq:0, lt:0, ea:0, bv:0, by:0, ba:0, bb:0, mc:.14, mw:.62, mo:0, mr:0, mv:0, mk:0, mx:0,
  gx:0, gy:0, gw:0, fx:0, fy:0, ft:0, bs:0, bl:0, lean:0, ad:0, ap:0, spin:0, sway:0, br:1, bk:1, gl:1 };
const WASHES = { blue:'#dce8fb', violet:'#f1e4ff', mint:'#e2f1ea', peach:'#fee8e0', warm:'#f1e6d4' };

/* ---------- drawing: elements come from DOC, which is the page or a tiny string shim for the files ---------- */
let DOC = typeof document !== 'undefined' ? document : null;
const mk = (tag, a, p) => { const e = DOC.createElementNS(NS, tag); if (a) for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const at = (e, o) => { for (const k in o){ const v = o[k]; e.setAttribute(k, typeof v === 'number' ? n2(v) : v); } };
const show = (e, on) => e.setAttribute('display', on ? 'inline' : 'none');
const P2 = (x, y) => n2(x) + ' ' + n2(y);
const rr = (x, y, w, h, r) => `M${P2(x + r, y)}H${n2(x + w - r)}A${n2(r)} ${n2(r)} 0 0 1 ${P2(x + w, y + r)}V${n2(y + h - r)}A${n2(r)} ${n2(r)} 0 0 1 ${P2(x + w - r, y + h)}H${n2(x + r)}A${n2(r)} ${n2(r)} 0 0 1 ${P2(x, y + h - r)}V${n2(y + r)}A${n2(r)} ${n2(r)} 0 0 1 ${P2(x + r, y)}Z`;
const circ = (x, y, r) => `M${P2(x + r, y)}A${n2(r)} ${n2(r)} 0 1 1 ${P2(x - r, y)}A${n2(r)} ${n2(r)} 0 1 1 ${P2(x + r, y)}Z`;
// a capsule between two points (handles, chain links, swatch strips)
const bar = (x0, y0, x1, y1, hw) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy/L*hw, ny = dx/L*hw, r = n2(hw);
  return `M${P2(x0 + nx, y0 + ny)}L${P2(x1 + nx, y1 + ny)}A${r} ${r} 0 0 0 ${P2(x1 - nx, y1 - ny)}L${P2(x0 - nx, y0 - ny)}A${r} ${r} 0 0 0 ${P2(x0 + nx, y0 + ny)}Z`; };
const link = (x, y, a, hl, hw, hole) => { const ux = Math.cos(a)*(hl - hw), uy = Math.sin(a)*(hl - hw);
  let d = bar(x - ux, y - uy, x + ux, y + uy, hw);
  if (hole){ const k = (hl - hw - .2)/(hl - hw); d += bar(x - ux*k, y - uy*k, x + ux*k, y + uy*k, hw*.42); }
  return d; };

/* ---------- pose: body units (origin bottom centre, y up is negative) to world and back ---------- */
const toW = (c, x, y) => { const z = c.pz; return [c.x + c.u*(x*z.sx - z.sh*y*z.sy), c.y + c.u*y*z.sy]; };
const toL = (c, X, Y) => { const z = c.pz, ly = (Y - c.y)/(c.u*z.sy); return [((X - c.x)/c.u + z.sh*ly*z.sy)/z.sx, ly]; };
const face = c => { const z = c.pz, P = z.P, a = P.ft/DEG; return { x:P.fx + z.g2[0]*2.6 + z.fl[0], y:F.y + P.fy + z.g2[1]*1.7 + z.fl[1], c:Math.cos(a), s:Math.sin(a), a:P.ft }; };
const fpt = (f, x, y) => [f.x + x*f.c - y*f.s, f.y + x*f.s + y*f.c];
const eyeAt = (c, side) => { const g = c.pz.g1; return fpt(face(c), side*(F.ex - Math.abs(g[0])*1.2) + g[0]*2.4, F.ey + g[1]*2); };

/* ---------- physics ---------- */
// follower: a world-space critically damped spring that chases a body-space point; returns the lagged point in body space
const fol = (S, k, c, x, y, w, dt, mx = 9) => {
  const p = toW(c, x, y); let f = S.f[k];
  if (!f || S.snap || RM || Math.hypot(p[0] - f[0], p[1] - f[2]) > c.u*60){ S.f[k] = [p[0], 0, p[1], 0]; return [x, y]; }
  if (dt > 0){ const a = cd(f[0], f[1], p[0], w, dt), b = cd(f[2], f[3], p[1], w, dt); f[0] = a[0]; f[1] = a[1]; f[2] = b[0]; f[3] = b[1]; }
  const q = toL(c, f[0], f[2]); let dx = q[0] - x, dy = q[1] - y; const m = Math.hypot(dx, dy);
  if (m > mx){ dx *= mx/m; dy *= mx/m; const r = toW(c, x + dx, y + dy); f[0] = r[0]; f[2] = r[1]; f[1] *= .6; f[3] *= .6; }
  return [x + dx, y + dy];
};
// scalar spring
const ss = (S, k, to, w, dt) => { const s = S.f[k]; if (!s || S.snap || RM){ S.f[k] = [to, 0]; return to; } if (dt > 0){ const r = cd(s[0], s[1], to, w, dt); s[0] = r[0]; s[1] = r[1]; } return s[0]; };
// hanging part: a bob below the pivot chases its rest spot in world space; the part points at the bob
const dangle = (S, k, c, px, py, rest, L, w, dt) => {
  const q = fol(S, k, c, px + Math.sin(rest)*L, py + Math.cos(rest)*L, w, dt, L*1.4);
  return cl(Math.atan2(q[0] - px, q[1] - py), rest - .95, rest + .95);
};

/* ---------- prop scaffolding ---------- */
let uid = 0;
const base = (g, ch) => { const S = { f:{}, a0:null, cues:[], dur:0, lt:null, snap:!!ch.static, ch, thin:[], seed:ch.seed || 0 };
  S.r = mk('g', { transform:'translate(0 9)', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, g); return S; };
const thin = (S, e, k = .8) => { S.thin.push([e, k]); return e; };
const begin = (S, ctx) => {
  const t = ctx.t, dt = S.lt == null || S.snap ? 0 : cl(t - S.lt, 0, .05); S.lt = t;
  const e = S.a0 == null ? 1e3 : t - S.a0;
  if (!S.snap) for (const q of S.cues) if (!q.d && e >= q[0]){ q.d = 1; q[1](S.ch, S); }
  if (S.sw !== ctx.sw){ S.sw = ctx.sw; S.r.setAttribute('stroke-width', n2(ctx.sw)); S.thin.forEach(([x, k]) => x.setAttribute('stroke-width', n2(ctx.sw*k))); }
  return { t, dt, e, c:ctx.ch, P:ctx.P };
};
const handEl = p => mk('circle', { class:'arg-p arg-k', r:3.2 }, p);
const putHand = (h, x, y, v = 1) => { show(h, v > .04); at(h, { cx:x, cy:y, r:3.2*cl(v) }); };
const washEl = (p, fill, d) => mk('path', { class:'arg-w', fill, d:d || '' }, p);

/* ================= the twelve props ================= */

/* Review: a lens. Raises it to one eye and the eye behind the glass grows. */
const LENS = { dur:3.6,
  cues:[[0, c => c.react('curious', 1.5)], [1.5, c => c.react('surprised', .75)], [2.35, c => { c.react('happy', 1.1); c.impulse(0, 1.2); }]],
  build(g, ch){ const S = base(g, ch), r = S.r;
    S.hd = mk('path', { class:'arg-p arg-k' }, r); S.hn = handEl(r);
    S.rg = mk('circle', { class:'arg-p arg-k', r:8.4 }, r);
    const id = 'cka-lens' + (++uid), cp = mk('clipPath', { id }, r); S.cc = mk('circle', { r:7.7 }, cp);
    S.im = mk('g', { 'clip-path':`url(#${id})` }, r); S.eb = mk('ellipse', { class:'arg-f' }, S.im); S.hl = mk('circle', { class:'arg-p' }, S.im);
    S.gl = thin(S, mk('path', { class:'arg-k' }, r), .75); return S; },
  draw(S, ctx){ const { e, dt, c, P } = begin(S, ctx);
    const b = kf(e, [[0, 0], [.05, 1, 13], [2.45, 0, 11]]), z = kf(e, [[0, 0], [1.5, 1, 22], [2.3, 0, 12]]), sc = kf(e, [[0, 0], [.75, 2.2, 9], [1.15, -1.6, 9], [1.55, 0, 12]]);
    const ey = eyeAt(c, 1), R0 = 8.4;
    const [lx, ly] = fol(S, 'l', c, lp(37.5, ey[0] + sc, b), lp(-28, ey[1] + .4, b), 15, dt, 8);
    const th = lp(1.9, 1.02, b), ux = Math.cos(th), uy = Math.sin(th);
    S.hd.setAttribute('d', bar(lx + ux*(R0 + .4), ly + uy*(R0 + .4), lx + ux*(R0 + 10.5), ly + uy*(R0 + 10.5), 1.9));
    putHand(S.hn, lx + ux*(R0 + 7.8), ly + uy*(R0 + 7.8));
    at(S.rg, { cx:lx, cy:ly, 'stroke-width':ctx.sw*1.3 }); at(S.cc, { cx:lx, cy:ly });
    const m = 1 + .85*b + .5*z;
    show(S.im, b > .02);
    if (b > .02){ const open = Math.max(.05, P.eo*(1 - (c.pz.blink || 0)))*(1 - .35*cl(P.sq)), ex = lx + (ey[0] - lx)*m, eyy = ly + (ey[1] - ly)*m, rx = F.rw*P.es*m, ry = Math.max(.3, F.rh*P.es*m*open);
      at(S.eb, { cx:ex, cy:eyy, rx, ry, 'stroke-width':ctx.sw*.6 }); at(S.hl, { cx:ex - rx*.3, cy:eyy - ry*.38, r:open > .4 ? .6*m : 0 }); }
    const gr = R0*.62, g0 = [lx + Math.cos(3.55)*gr, ly + Math.sin(3.55)*gr], g1 = [lx + Math.cos(4.4)*gr, ly + Math.sin(4.4)*gr];
    S.gl.setAttribute('d', `M${P2(g0[0], g0[1])}A${n2(gr)} ${n2(gr)} 0 0 1 ${P2(g1[0], g1[1])}`);
  } };

/* Accessibility: headphones (one cup dark, one light, the contrast pair). Presses a cup to listen, then a focus ring traces around it. */
const PHONES = { dur:3.9,
  cues:[[0, c => c.react('thinking', 1.45)], [1.5, c => c.react('happy', .7)], [2.15, c => c.react('proud', 1.4)]],
  build(g, ch){ const S = base(g, ch), r = S.r;
    S.fr = thin(S, mk('path', { class:'cka-fr', fill:'none', pathLength:1, d:rr(-41, -63, 82, 69, 19) }, r), 1.1);
    S.bd = mk('path', { class:'arg-p arg-k' }, r);
    S.cl = mk('path', { class:'cka-sol' }, r); S.cr = mk('path', { class:'arg-p arg-k' }, r); S.pd = thin(S, mk('path', { class:'arg-k' }, r), .75);
    S.hn = handEl(r); return S; },
  draw(S, ctx){ const { e, dt, c } = begin(S, ctx);
    const press = kf(e, [[0, 0], [.15, 1.7, 22], [1.45, 0, 14]]), hv = kf(e, [[0, 0], [.02, 1, 18], [1.45, 0, 14]]);
    const L = fol(S, 'l', c, -31, -28, 17, dt, 5), Rr = fol(S, 'r', c, 31 - press, -28, 17, dt, 5), ap = fol(S, 'a', c, 0, -54.6, 11, dt, 4);
    const top = ap[1], ay = -35.5 + (L[1] + Rr[1] + 56)/2, ci = (top - .25*ay)/.75, co = ci - 3.4, xl = L[0], xr = Rr[0], yl = L[1] - 7.5, yr = Rr[1] - 7.5, mx = ap[0]*1.2;
    S.bd.setAttribute('d', `M${P2(xl - 1.3, yl)}C${P2(xl - 1.3 + mx, co)} ${P2(xr + 1.3 + mx, co)} ${P2(xr + 1.3, yr)}L${P2(xr - 1.3, yr)}C${P2(xr - 1.3 + mx, ci)} ${P2(xl + 1.3 + mx, ci)} ${P2(xl + 1.3, yl)}Z`);
    S.cl.setAttribute('d', rr(L[0] - 4, L[1] - 7.5, 8, 15, 3.6)); S.cr.setAttribute('d', rr(Rr[0] - 4, Rr[1] - 7.5, 8, 15, 3.6));
    S.pd.setAttribute('d', `M${P2(Rr[0] + 1.2, Rr[1] - 3.5)}V${n2(Rr[1] + 3.5)}`);
    putHand(S.hn, Rr[0] + 4.4, Rr[1] + 3.2, hv);
    const p = kf(e, [[0, 0], [1.45, 1, 7]]), fo = kf(e, [[0, 1], [2.95, 0, 10]]), on = p > .01 && fo > .02 && e < 99;
    show(S.fr, on); if (on) at(S.fr, { 'stroke-dasharray':`${n2(p)} 2`, opacity:fo });
  } };

/* Copy editor: a pencil. Taps its chin, gets the idea, then writes a proofreader's mark in the air. */
const MARK = (() => { const pts = [], K = 1.7; for (let i = 0; i <= 10; i++) pts.push([i*.9*K, i*.06*K]);
  for (let j = 1; j <= 18; j++){ const a = Math.PI/2 - j/18*1.8*Math.PI; pts.push([K*(9.3 + 2.5*Math.cos(a)), K*(-1.9 + 2.5*Math.sin(a))]); }
  pts.push([K*13.2, K*-5.4]); return pts; })();
const markAt = s => { const f = cl(s)*(MARK.length - 1), i = Math.min(MARK.length - 2, Math.floor(f)), k = f - i; return [lp(MARK[i][0], MARK[i + 1][0], k), lp(MARK[i][1], MARK[i + 1][1], k)]; };
const MS = [33, -47];
const PENCIL = { dur:4.4,
  cues:[[0, c => c.react('thinking', 1.6)], [1.62, c => c.react('surprised', .3)], [1.95, c => c.react('focused', 1)], [2.9, c => c.react('proud', 1.3)]],
  build(g, ch){ const S = base(g, ch), r = S.r;
    S.mk = thin(S, mk('path', { class:'arg-sk' }, r), .9);
    S.bf = mk('path', { class:'arg-p' }, r); S.bw = washEl(r, WASHES.warm); S.bo = mk('path', { class:'arg-k', fill:'none' }, r);
    S.fe = thin(S, mk('path', { class:'arg-k' }, r), .7); S.ld = mk('path', { class:'arg-f' }, r); S.hn = handEl(r); return S; },
  draw(S, ctx){ const { e, dt, c } = begin(S, ctx);
    const aT = .38, uT = [Math.cos(aT), Math.sin(aT)], chin = [5.5, -12.8], gT = [chin[0] + uT[0]*17, chin[1] + uT[1]*17];
    const aW = 2.25, uW = [Math.cos(aW), Math.sin(aW)], gW = [MS[0] - uW[0]*9, MS[1] - uW[1]*9], rest = [33, -17], aR = -1.05;
    const gx = kf(e, [[0, rest[0]], [.05, gT[0], 14], [1.72, gW[0], 15], [2.85, rest[0], 12]]), gy = kf(e, [[0, rest[1]], [.05, gT[1], 14], [1.72, gW[1], 15], [2.85, rest[1], 12]]);
    let a = kf(e, [[0, aR], [.05, aT, 14], [1.68, aW, 15], [2.85, aR, 12]]);
    const tap = kf(e, [[0, 0], [.42, 1.8, 34], [.58, 0, 30], [.76, 1.8, 34], [.92, 0, 30], [1.1, 1.8, 34], [1.26, 0, 30]]);
    const s = cl((e - 1.95)/.78), wt = kf(e, [[0, 0], [1.93, 1, 60], [2.78, 0, 30]]), mp = markAt(s);
    let [hx, hy] = [gx - Math.cos(a)*tap + wt*mp[0], gy - Math.sin(a)*tap + wt*mp[1]];
    const h = fol(S, 'g', c, hx, hy, 18, dt, 7); a += (h[0] - hx)*.035;
    const ux = Math.cos(a)*1.18, uy = Math.sin(a)*1.18, hw = 2.2, Q = (s0, k) => P2(h[0] + ux*s0 - uy*k, h[1] + uy*s0 + ux*k);
    const body = `M${Q(-13, hw)}L${Q(4.6, hw)}L${Q(9, 0)}L${Q(4.6, -hw)}L${Q(-13, -hw)}C${Q(-16, -hw)} ${Q(-16, hw)} ${Q(-13, hw)}Z`;
    S.bf.setAttribute('d', body); S.bo.setAttribute('d', body); S.bw.setAttribute('d', `M${Q(-9.6, hw)}L${Q(4.6, hw)}L${Q(4.6, -hw)}L${Q(-9.6, -hw)}Z`);
    S.fe.setAttribute('d', `M${Q(-9.6, hw)}L${Q(-9.6, -hw)}M${Q(-11.4, hw)}L${Q(-11.4, -hw)}`); S.ld.setAttribute('d', `M${Q(7.4, .75)}L${Q(9, 0)}L${Q(7.4, -.75)}Z`);
    putHand(S.hn, h[0], h[1]);
    const mo = kf(e, [[0, 1], [3.45, 0, 9]]), on = e > 1.95 && mo > .02 && e < 99;
    show(S.mk, on); if (on){ const n = Math.max(1, Math.round(s*(MARK.length - 1))); let d = `M${P2(MS[0], MS[1])}`; for (let i = 1; i <= n; i++) d += `L${P2(MS[0] + MARK[i][0], MS[1] + MARK[i][1])}`; at(S.mk, { d, opacity:mo }); }
  } };

/* Brand checker: a swatch fan in the four role washes. Fans it out and holds one swatch against its own color. */
const SW_C = [WASHES.violet, WASHES.blue, WASHES.mint, WASHES.peach], SW_R = [-16, -4, 8, 20], SW_O = [-46, -16, 14, 44];
const FAN = { dur:3.9,
  cues:[[0, c => c.react('curious', .8)], [.85, c => c.react('focused', 1.1)], [1.95, c => { c.react('happy', 1.2); c.impulse(0, 1.4); }]],
  build(g, ch){ const S = base(g, ch), r = S.r; S.lh = handEl(r);
    S.st = SW_C.map(col => { const gg = mk('g', {}, r); mk('path', { class:'arg-p arg-k', d:rr(-2.8, -23.5, 5.6, 23, 2.2) }, gg); washEl(gg, col, rr(-1.75, -22.2, 3.5, 10.5, 1.2));
      thin(S, mk('path', { class:'arg-k', d:'M-1.7 -9.2H1.7M-1.7 -6.4H.6' }, gg), .7); return gg; });
    S.hn = handEl(r); return S; },
  draw(S, ctx){ const { e, dt, c } = begin(S, ctx);
    const open = kf(e, [[0, 0], [.05, 1, 11], [2.6, 0, 11]]), pull = kf(e, [[0, 0], [.75, 1, 13], [2.35, 0, 13]]);
    const pv = fol(S, 'p', c, 32, -10, 18, dt, 7), tilt = (pv[0] - 32)*-2.2, LH = fol(S, 'lh', c, -32, -11, 16, dt, 7);
    SW_C.forEach((_, i) => { let a = ss(S, 'a' + i, lp(SW_R[i], SW_O[i], open) + tilt, 9 + 2.2*i, dt), x = pv[0], y = pv[1];
      if (i === 0 && pull > .001){ x = lp(x, LH[0], pull); y = lp(y, LH[1] - 1, pull); a = lp(a, 5, pull); }
      if (i === 0) S.p0 = [x, y];
      S.st[i].setAttribute('transform', `translate(${P2(x, y)}) rotate(${n2(a)})`); });
    putHand(S.hn, pv[0] + .4, pv[1] - .6); putHand(S.lh, S.p0[0] - .6, S.p0[1] - .4, cl(pull*1.25 - .25));
  } };

/* SEO: a spyglass. Raises it, extends it segment by segment, scans, finds something. */
const GLASS = { dur:4.0,
  cues:[[0, c => c.react('curious', 2.4)], [2.05, c => { c.react('delighted', .9); c.hop(.05); }], [3.0, c => c.react('proud', 1)]],
  build(g, ch){ const S = base(g, ch), r = S.r; S.sg = [0, 1, 2, 3].map(() => mk('path', { class:'arg-p arg-k' }, r)); S.bn = thin(S, mk('path', { class:'arg-k' }, r), .7); S.hn = handEl(r); return S; },
  draw(S, ctx){ const { e, dt, c } = begin(S, ctx);
    const up = kf(e, [[0, 0], [.05, 1, 13], [2.75, 0, 12]]), ex = kf(e, [[0, .3], [.4, 1, 14], [2.5, .3, 18]]), scan = kf(e, [[0, 0], [.85, -.17, 7], [1.45, .11, 7], [1.95, 0, 9]]);
    const eB = ss(S, 'b', ex, 15, dt), eC = ss(S, 'c', ex, 9, dt), ey = eyeAt(c, 1);
    const B = fol(S, 'B', c, lp(29.5, ey[0] + 2.8, up), lp(-13, ey[1], up), 17, dt, 7), a = lp(-.72, -.05 + scan, up) + (B[0] - lp(29.5, ey[0] + 2.8, up))*.02;
    const ux = Math.cos(a), uy = Math.sin(a), Q = (s0, k) => [B[0] + ux*s0 - uy*k, B[1] + uy*s0 + ux*k];
    const seg = (s0, s1, rad) => { const p = [Q(s0, rad), Q(s1, rad), Q(s1, -rad), Q(s0, -rad)]; return `M${p.map(q => P2(q[0], q[1])).join('L')}Z`; };
    const b0 = lp(2, 6.8, eB), c0 = lp(4.2, 15, eC);
    S.sg[0].setAttribute('d', seg(-.8, 7.5, 2.4)); S.sg[1].setAttribute('d', seg(b0, b0 + 8.8, 3)); S.sg[2].setAttribute('d', seg(c0, c0 + 10, 3.7)); S.sg[3].setAttribute('d', seg(c0 + 8.2, c0 + 10.5, 4.25));
    const k1 = Q(c0 + 2.4, 3.7), k2 = Q(c0 + 2.4, -3.7); S.bn.setAttribute('d', `M${P2(k1[0], k1[1])}L${P2(k2[0], k2[1])}`);
    const hp = Q(3.4, 0); putHand(S.hn, hp[0], hp[1] + 1.6);
  } };

/* Performance: a stopwatch. Checks it, taps its base four times, clicks the crown and starts the clock. */
const WATCH = { dur:3.6,
  cues:[[0, (c, S) => { c.react('waiting', 1.8); c.look(S.ww[0], S.ww[1], 1.5); }], ...[.55, .83, 1.11, 1.39].map(t => [t, c => c.impulse(.16, 1.5)]),
    [1.75, c => c.react('determined', .6)], [2.25, c => c.react('happy', 1.1)]],
  build(g, ch){ const S = base(g, ch), r = S.r; S.ww = [0, 0];
    S.w = mk('g', {}, r); S.bt = mk('path', { class:'arg-p arg-k' }, S.w); S.stem = mk('path', { class:'arg-p arg-k', d:rr(-1.2, -10.4, 2.4, 3.4, .5) }, S.w);
    S.cs = mk('circle', { class:'arg-p arg-k', r:7.6 }, S.w); S.sb = mk('path', { class:'arg-p arg-k', d:bar(4.6, -6.6, 6.2, -8.2, 1) }, S.w);
    S.tk = thin(S, mk('path', { class:'arg-k', d:'M0 -6.2V-4.6M4.9 0h.01M0 4.9h.01M-4.9 0h.01' }, S.w), .9);
    S.nd = thin(S, mk('path', { class:'arg-k' }, S.w), .85); mk('circle', { class:'arg-f', r:.85, 'stroke-width':.4 }, S.w);
    S.hn = handEl(r); return S; },
  draw(S, ctx){ const { t, e, dt, c } = begin(S, ctx);
    const up = kf(e, [[0, 0], [.05, 1, 13], [2.95, 0, 12]]), press = kf(e, [[0, 0], [2.2, 1.4, 40], [2.36, 0, 30]]);
    const W0 = fol(S, 'w', c, lp(36, 31, up), lp(-20, -35, up), 16, dt, 7), tilt = (W0[0] - lp(36, 31, up))*-3.5 + lp(8, -6, up);
    S.ww = toW(c, W0[0], W0[1]);
    S.w.setAttribute('transform', `translate(${P2(W0[0], W0[1])}) rotate(${n2(tilt)}) scale(1.25)`);
    S.bt.setAttribute('d', rr(-2.7, -12.6 + press, 5.4, 2.4, 1));
    const step = TAU/16, n = Math.floor(t*2), idle = S.snap ? 1.2 : step*(n - 1 + pr(t - n/2, 28)), rz = kf(e, [[0, 0], [2.24, 1, 30], [3.5, 0, 8]]), run = Math.max(0, e - 2.32)*TAU/1.4;
    const na = idle + wrapA(run - idle)*rz, L = 5.7;
    S.nd.setAttribute('d', `M0 0L${P2(Math.sin(na)*L, -Math.cos(na)*L)}`);
    putHand(S.hn, W0[0] + 2, W0[1] + 9.6);
  } };

/* Security: a ring of keys. Every key hangs on its own spring, so they jingle with follow-through. */
const KEY = 'M-1.15 5L-1.15 13.4Q-1.15 14.6 0 14.6Q1.15 14.6 1.15 13.4L1.15 13L2.9 13L2.9 11.4L1.15 11.4L1.15 10.6L2.5 10.6L2.5 9.1L1.15 9.1L1.15 5Z';
const BOW = circ(0, 3, 3) + circ(0, 3, 1.15);
const KEYS = { dur:3.4,
  cues:[[0, c => c.react('focused', 1.1)], [.3, (c, S) => c.look(S.kw[0], S.kw[1], 1.3)], [1.0, c => c.react('determined', .7)], [1.85, c => c.react('happy', 1.1)]],
  build(g, ch){ const S = base(g, ch), r = S.r; S.kw = [0, 0];
    S.k = [0, 1, 2].map(() => { const gg = mk('g', {}, r); thin(S, mk('path', { class:'cka-halo', d:KEY + BOW }, gg), 2.2); mk('path', { class:'arg-p arg-k', d:KEY }, gg); mk('path', { class:'arg-p arg-k', d:BOW, 'fill-rule':'evenodd' }, gg); return gg; });
    S.rgo = thin(S, mk('path', { class:'cka-halo', 'fill-rule':'evenodd' }, r), 2.2); S.rg = mk('path', { class:'arg-p arg-k', 'fill-rule':'evenodd' }, r); S.hn = handEl(r); return S; },
  draw(S, ctx){ const { e, dt, c } = begin(S, ctx);
    const lift = kf(e, [[0, 0], [.05, 1, 12], [2.25, 0, 11]]), shake = kf(e, [[0, 0], [1.0, 2.4, 34], [1.14, -2.4, 34], [1.28, 2.4, 34], [1.42, -1.6, 34], [1.56, 0, 26]]);
    const H = fol(S, 'h', c, lp(33, 27.5, lift) + shake, lp(-25, -47, lift), 20, dt, 7), RC = [H[0], H[1] + 5.6];
    S.kw = toW(c, RC[0], RC[1] + 8);
    S.rg.setAttribute('d', circ(RC[0], RC[1], 5.1) + circ(RC[0], RC[1], 3.6)); S.rgo.setAttribute('d', S.rg.getAttribute('d'));
    [-.62, 0, .62].forEach((pa, i) => { const px = RC[0] + Math.sin(pa)*4.35, py = RC[1] + Math.cos(pa)*4.35, a = dangle(S, 'k' + i, c, px, py, pa*.55, 11, 6.5 + 2.6*i, dt);
      S.k[i].setAttribute('transform', `translate(${P2(px, py)}) rotate(${n2(-a*DEG)}) scale(${i === 1 ? 1.02 : 1.2})`); });
    putHand(S.hn, H[0], H[1]);
  } };

/* Link checker: a chain held in both hands. Pulls it taut; a link breaks; it pinches the two ends together. */
const CHAIN = { dur:3.8,
  cues:[[0, c => c.react('determined', .9)], [.95, c => c.react('surprised', .45)], [1.05, (c, S) => c.look(S.mw[0], S.mw[1], 1.2)], [1.4, c => c.react('worried', .75)], [2.35, c => c.react('happy', 1.2)]],
  build(g, ch){ const S = base(g, ch), r = S.r; S.mw = [0, 0];
    S.lo = Array.from({ length:12 }, () => thin(S, mk('path', { class:'cka-halo', 'fill-rule':'evenodd' }, r), 2.6));
    S.ln = Array.from({ length:12 }, () => mk('path', { class:'arg-p arg-k', 'fill-rule':'evenodd' }, r)); S.hl = handEl(r); S.hr = handEl(r); return S; },
  draw(S, ctx){ const { e, dt, c } = begin(S, ctx);
    const jerk = kf(e, [[0, 0], [.3, 1.8, 40], [.42, 0, 30], [.55, 1.8, 40], [.67, 0, 30]]);
    const lx = kf(e, [[0, -31], [.05, -36, 22], [1.95, -9.5, 13], [2.65, -31, 11]]) - jerk, rx = kf(e, [[0, 31], [.05, 36, 22], [1.95, 9.5, 13], [2.65, 31, 11]]) + jerk;
    const hy = kf(e, [[0, -14], [.05, -20, 22], [1.95, -7, 13], [2.65, -14, 11]]), sag = kf(e, [[0, 10], [.05, 1.4, 26], [1.95, 5, 12], [2.65, 10, 10]]), br = kf(e, [[0, 0], [.9, 1, 28], [2.22, 0, 32]]);
    const L = fol(S, 'L', c, lx, hy, 18, dt, 6), Rr = fol(S, 'R', c, rx, hy, 18, dt, 6);
    // intact: one quadratic from hand to hand whose midpoint lags on its own spring
    const C0 = [(L[0] + Rr[0])/2, (L[1] + Rr[1])/2 + 2*sag], M0 = [(L[0] + 2*C0[0] + Rr[0])/4, (L[1] + 2*C0[1] + Rr[1])/4], M = fol(S, 'M', c, M0[0], M0[1], 7, dt, 8);
    const C = [C0[0] + (M[0] - M0[0])*2, C0[1] + (M[1] - M0[1])*2];
    // broken: each half hangs from its hand
    const ML = [lp(M[0], L[0] + 1.6, br), lp(M[1], L[1] + 14, br)], MR = [lp(M[0], Rr[0] - 1.6, br), lp(M[1], Rr[1] + 14, br)];
    const CL = [lp((L[0] + C[0])/2, L[0] + 1, br), lp((L[1] + C[1])/2, L[1] + 7, br)], CR = [lp((C[0] + Rr[0])/2, Rr[0] - 1, br), lp((C[1] + Rr[1])/2, Rr[1] + 7, br)];
    S.mw = toW(c, M[0], M[1]);
    const qp = (A, B, Cc, u) => [(1 - u)*(1 - u)*A[0] + 2*(1 - u)*u*B[0] + u*u*Cc[0], (1 - u)*(1 - u)*A[1] + 2*(1 - u)*u*B[1] + u*u*Cc[1]];
    const qt = (A, B, Cc, u) => Math.atan2(2*(1 - u)*(B[1] - A[1]) + 2*u*(Cc[1] - B[1]), 2*(1 - u)*(B[0] - A[0]) + 2*u*(Cc[0] - B[0]));
    for (let i = 0; i < 12; i++){ const left = i < 6, u = left ? (i + .5)/6 : (i - 5.5)/6, A = left ? L : MR, B = left ? CL : CR, Cc = left ? ML : Rr;
      const p = qp(A, B, Cc, u), a = qt(A, B, Cc, u), flat = i % 2 === 0, tw = (i === 5 ? -1 : i === 6 ? 1 : 0)*br*.5;
      const d = link(p[0], p[1], a + tw, 3.9, flat ? 2.05 : 1, flat); S.ln[i].setAttribute('d', d); S.lo[i].setAttribute('d', d); }
    putHand(S.hl, L[0], L[1]); putHand(S.hr, Rr[0], Rr[1]);
  } };

/* Form tester: a text-cursor staff that blinks like a caret. Types into a field, submits, gets an error, then gets it right. */
const IBEAM = 'M-4.6 -44H4.6V-41.6H1.2V-2.4H4.6V0H-4.6V-2.4H-1.2V-41.6H-4.6Z';
const STAFF = { dur:4.0,
  cues:[[0, c => c.react('curious', 1.4)], [1.5, c => { c.impulse(0, 2.2); c.react('surprised', .4); }], [1.9, c => c.react('determined', .6)], [2.55, c => { c.react('delighted', 1); c.hop(.05); }], [3.3, c => c.react('happy', .8)]],
  build(g, ch){ const S = base(g, ch), r = S.r;
    S.fd = mk('g', {}, r); S.fb = mk('path', { class:'arg-p arg-k', d:rr(-13, -5.5, 26, 11, 3.2) }, S.fd);
    S.dt = [0, 1, 2].map(i => mk('circle', { class:'arg-f', cx:-8 + i*4, cy:0, r:1.15, 'stroke-width':.3 }, S.fd));
    S.cr = thin(S, mk('path', { class:'arg-k' }, S.fd), .8); S.ck = thin(S, mk('path', { class:'arg-k', d:'M-4 .2L-1.2 3L4.4 -3.2', pathLength:1 }, S.fd), 1);
    S.sf = mk('g', {}, r); mk('path', { class:'arg-p arg-k', d:IBEAM }, S.sf); S.on = mk('path', { class:'cka-sol', d:IBEAM }, S.sf);
    S.hn = handEl(r); return S; },
  draw(S, ctx){ const { t, e, dt, c } = begin(S, ctx);
    const lift = kf(e, [[0, 0], [.4, 2.4, 40], [.5, 0, 40], [.7, 2.4, 40], [.8, 0, 40], [1.0, 2.4, 40], [1.1, 0, 40], [1.32, 5.5, 26], [1.48, 0, 44]]);
    const sp = fol(S, 's', c, 36, -24, 18, dt, 5), sx = sp[0], sy = sp[1] + 24 - lift, tl = (sp[0] - 36)*-1.5;
    S.sf.setAttribute('transform', `translate(${P2(sx, sy)}) rotate(${n2(tl)})`);
    // the caret blink: 530ms on, 530ms off, each change a fast critically damped step
    const k = Math.floor(t/.53), on = S.snap ? 1 : k % 2 ? 1 - pr(t - k*.53, 34) : pr(t - k*.53, 34);
    at(S.on, { opacity:on }); putHand(S.hn, sx, sy - 22);
    const fv = kf(e, [[0, 0], [.05, 1, 18], [3.4, 0, 16]]), vis = fv > .02 && e < 99; show(S.fd, vis);
    if (vis){ const shk = kf(e, [[0, 0], [1.55, 2.2, 44], [1.65, -2.2, 44], [1.75, 1.4, 44], [1.85, 0, 32]]), fp = fol(S, 'f', c, -36 + shk, -64, 10, dt, 6), sc = .6 + .4*fv;
      S.fd.setAttribute('transform', `translate(${P2(fp[0], fp[1])}) scale(${n2(sc)})`); at(S.fd, { opacity:fv });
      const err = e > 1.5 && e < 2.3; S.fb.setAttribute('class', err ? 'arg-p arg-k cka-er' : 'arg-p arg-k');
      const typed = e < 1.88 ? (e > .45) + (e > .75) + (e > 1.05) : 0; S.dt.forEach((d, i) => show(d, i < typed));
      const cp = kf(e, [[0, 0], [2.32, 1, 16]]), cOn = e > 2.3; show(S.ck, cOn); if (cOn) at(S.ck, { 'stroke-dasharray':`${n2(cp)} 2` });
      const cx = -10.2 + typed*4, bl = Math.floor(t/.53) % 2 === 0 && !cOn; S.cr.setAttribute('d', `M${n2(cx)} -3V3`); show(S.cr, bl); }
  } };

/* Visual regression: an instant camera. Takes a photo, lays it over yesterday's and circles what moved. */
const CAMERA = { dur:4.3,
  cues:[[0, c => c.react('determined', .8)], [.6, c => c.impulse(0, 1.3)], [1.0, c => c.react('curious', 1.2)], [2.3, c => c.react('surprised', .5)], [2.85, c => c.react('happy', 1.1)]],
  build(g, ch){ const S = base(g, ch), r = S.r; const ph = (sx, sy) => { const gg = mk('g', {}, r);
      mk('path', { class:'arg-p arg-k', d:rr(-6, -7.5, 12, 15, 1) }, gg); thin(S, mk('path', { class:'arg-k', d:`${rr(-4.6, -6, 9.2, 8.6, .6)}M-4.6 .6L-1.6 -2.2L1 0L2.6 -1.4L4.6 .4` }, gg), .7);
      mk('circle', { class:'arg-f', cx:sx, cy:sy, r:1.25, 'stroke-width':.3 }, gg); return gg; };
    S.pb = ph(-2.2, -3.6); S.pa = ph(1.6, -3.9); S.df = thin(S, mk('path', { class:'arg-sk', d:circ(1.6, -3.9, 3.6), pathLength:1 }, S.pa), 1.1);
    S.lh = handEl(r);
    S.cm = mk('g', {}, r); S.vf = mk('path', { class:'arg-p arg-k', d:rr(-7.2, -7.8, 4.8, 3, .9) }, S.cm); S.sb = mk('path', { class:'arg-p arg-k' }, S.cm);
    mk('path', { class:'arg-p arg-k', d:rr(-8.8, -5.6, 17.6, 11.2, 2.6) }, S.cm); washEl(S.cm, WASHES.blue, rr(-8, 1.2, 16, 3.6, 1.2));
    mk('circle', { class:'arg-p arg-k', cx:1.6, cy:0, r:4.1 }, S.cm); S.ir = mk('circle', { class:'arg-f', cx:1.6, cy:0, 'stroke-width':.3 }, S.cm);
    S.hn = handEl(r); return S; },
  draw(S, ctx){ const { e, dt, c } = begin(S, ctx);
    const up = kf(e, [[0, 0], [.05, 1, 14], [1.28, 0, 12]]), press = kf(e, [[0, 0], [.58, 1.1, 44], [.72, 0, 30]]), iris = kf(e, [[0, 1], [.58, .25, 44], [.76, 1, 22]]);
    const ey = eyeAt(c, 1), cp = fol(S, 'c', c, lp(34, ey[0] + 3.6, up), lp(-12, ey[1] + 1, up), 17, dt, 7), tl = (cp[0] - lp(34, ey[0] + 3.6, up))*-2.5 + lp(-6, 0, up);
    S.cm.setAttribute('transform', `translate(${P2(cp[0], cp[1])}) rotate(${n2(tl)})`); S.sb.setAttribute('d', rr(3, -7.4 + press, 3.8, 2.6, .8)); at(S.ir, { r:1.9*iris });
    putHand(S.hn, cp[0] + 8.2, cp[1] + 4.6);
    const LH = fol(S, 'lh', c, -32, -24, 15, dt, 7), vb = kf(e, [[0, 0], [1.35, 1, 16], [3.55, 0, 14]]), va = kf(e, [[0, 0], [.8, 1, 30], [3.55, 0, 14]]);
    const em = kf(e, [[0, 0], [.82, 1, 13]]), mv = kf(e, [[0, 0], [1.32, 1, 11]]), al = kf(e, [[0, 0], [1.85, 1, 10]]);
    const ax = lp(cp[0], lp(LH[0] + 6, LH[0], al), mv), ay = lp(cp[1] + 9.5*em - 2, lp(LH[1] - 5, LH[1] - 4, al), mv);
    show(S.pa, va > .03 && e < 99); show(S.pb, vb > .03 && e < 99); putHand(S.lh, LH[0] - 4.2, LH[1] + 6.2, vb);
    if (va > .03 && e < 99) S.pa.setAttribute('transform', `translate(${P2(ax, ay)}) rotate(${n2(lp(0, 5, mv) - 5*al)}) scale(${n2(cl(va*1.2))})`);
    if (vb > .03 && e < 99) S.pb.setAttribute('transform', `translate(${P2(LH[0], LH[1] - 4)}) rotate(-4) scale(${n2(vb)})`);
    const dp = kf(e, [[0, 0], [2.22, 1, 12]]), don = e > 2.2 && e < 99; show(S.df, don); if (don) at(S.df, { 'stroke-dasharray':`${n2(dp)} 2` });
  } };

/* Translator: a speech bubble that swaps scripts. Talks through four, then settles on one. */
const GLY = ['Aa', 'あ', 'Ж', 'ب', '文', 'ñ', 'अ', 'Ω'];
const swapG = S => { S.k = (S.k + 1) % GLY.length; S.cur = 1 - S.cur; S.tx[S.cur].textContent = GLY[S.k]; S.ts = S.lt; S.nx = S.lt + 2.6; };
const BUBBLE = { dur:3.2,
  cues:[[0, (c, S) => { c.react('happy', 2); swapG(S); S.talk = 1; }], [.42, (c, S) => swapG(S)], [.84, (c, S) => swapG(S)], [1.26, (c, S) => swapG(S)], [1.75, (c, S) => { swapG(S); c.react('proud', 1.2); c.impulse(0, 1); S.nx = S.lt + 3.4; }]],
  build(g, ch){ const S = base(g, ch), r = S.r; S.k = 0; S.cur = 0; S.ts = -9; S.nx = null; S.talk = 0;
    S.bb = mk('path', { class:'arg-p arg-k' }, r);
    S.tx = [0, 1].map(i => { const x = mk('text', { 'text-anchor':'middle', 'dominant-baseline':'central', 'font-size':'9.5', 'font-weight':'600', 'font-family':'ui-sans-serif, system-ui, sans-serif', fill:INK, class:'cka-tx' }, r); x.textContent = i ? '' : GLY[0]; return x; });
    return S; },
  draw(S, ctx){ const { t, e, dt, c } = begin(S, ctx);
    if (!S.snap){ if (S.nx == null) S.nx = t + 1 + hash(S.seed*3.3)*2; if (t >= S.nx && e > 2.2) swapG(S); }
    if (S.talk && !S.snap){ const T = c.T, x = R.EXPRESSIONS.find(q => q.k === c.cur);
      if (e < 1.95) T.mo = .2 + .38*Math.max(0, Math.sin(e*TAU*2.6)); else { T.mo = (x && x.p.mo) || 0; S.talk = 0; } }
    const bp = fol(S, 'b', c, 21, -68.5, 8, dt, 8), puff = .08*(pr(t - S.ts, 30) - pr(t - S.ts - .09, 14)), w = 24*(1 + puff), h = 16.5*(1 + puff), bx = bp[0], by = bp[1];
    const x0 = bx - w/2, x1 = bx + w/2, y0 = by - h/2, y1 = by + h/2, rd = 6, tip = [10.5 + (bx - 21)*.4, -55.5];
    S.bb.setAttribute('d', `M${P2(x0 + rd, y0)}H${n2(x1 - rd)}A${rd} ${rd} 0 0 1 ${P2(x1, y0 + rd)}V${n2(y1 - rd)}A${rd} ${rd} 0 0 1 ${P2(x1 - rd, y1)}H${n2(bx - 2.5)}L${P2(tip[0], tip[1])}L${P2(bx - 7.5, y1)}H${n2(x0 + rd)}A${rd} ${rd} 0 0 1 ${P2(x0, y1 - rd)}V${n2(y0 + rd)}A${rd} ${rd} 0 0 1 ${P2(x0 + rd, y0)}Z`);
    const pin = pr(t - S.ts - .1, 22), q = cl((t - S.ts)/.1), out = 1 - q*q;
    show(S.tx[S.cur], true); at(S.tx[S.cur], { x:bx, y:by + (1 - pin)*2.2, opacity:S.ts < -1 ? 1 : pin });
    at(S.tx[1 - S.cur], { x:bx, y:by - q*q*2.2, opacity:out }); show(S.tx[1 - S.cur], out > .02);
  } };

/* Researcher: glasses that creep down while it reads, and an open book. Looks up over the glasses, then pushes them back. */
const BOOKP = 'M0 0C-3 -1.8 -7 -2.2 -10.4 -1V7.2C-7 6.2 -3 6.6 0 8.2ZM0 0C3 -1.8 7 -2.2 10.4 -1V7.2C7 6.2 3 6.6 0 8.2Z';
const BOOK = { dur:3.9,
  cues:[[0, (c, S) => { c.react('focused', 1.9); c.look(S.bw[0], S.bw[1], 1.8); }], [1.9, c => { c.react('curious', 1.1); c.look(c.x, c.y - c.size*2.4, 1.0); }], [2.85, (c, S) => { S.pt = S.lt; c.react('surprised', .3); }], [3.2, c => c.react('happy', .9)]],
  build(g, ch){ const S = base(g, ch), r = S.r; S.bw = [0, 0]; S.pt = -hash((ch.seed || 0)*5.1)*9;
    S.gl = mk('g', {}, r); S.rims = mk('path', { class:'arg-k', fill:'none' }, S.gl); S.tm = thin(S, mk('path', { class:'arg-k', fill:'none' }, S.gl), .85);
    S.bk = mk('g', {}, r); mk('path', { class:'arg-p arg-k', d:'M-11.2 -.2V8.6C-7 7.6 -3 8 0 9.6C3 8 7 7.6 11.2 8.6V-.2' }, S.bk); mk('path', { class:'arg-p arg-k', d:BOOKP }, S.bk);
    thin(S, mk('path', { class:'arg-k', d:'M-8.2 1.6C-6.6 1.1 -4.4 1.1 -2.6 1.8M-8.2 4.1C-6.6 3.6 -4.4 3.6 -2.6 4.3M2.6 1.8C4.4 1.1 6.6 1.1 8.2 1.6' }, S.bk), .6);
    S.fl = mk('path', { class:'arg-p arg-k' }, S.bk); S.lh = handEl(r); S.hn = handEl(r); return S; },
  draw(S, ctx){ const { t, e, dt, c } = begin(S, ctx);
    const creep = S.snap ? 0 : 4.6*(1 - Math.exp(-Math.max(0, t - S.pt)/6)), gv = fol(S, 'g', c, 0, -26, 16, dt, 3);
    const sl = ss(S, 's', creep, 22, dt) + Math.max(0, gv[1] + 26)*.8, f = face(c), ey = F.ey + sl;
    S.gl.setAttribute('transform', `translate(${P2(f.x, f.y)}) rotate(${n2(f.a)})`);
    S.rims.setAttribute('d', circ(-F.ex, ey, 5.5) + circ(F.ex, ey, 5.5) + `M${P2(-5.2, ey - 1.6)}Q${P2(0, ey - 3.6)} ${P2(5.2, ey - 1.6)}`);
    S.tm.setAttribute('d', `M${P2(-16.1, ey - 1)}L${P2(-25.4, F.ey - 1.8)}M${P2(16.1, ey - 1)}L${P2(25.4, F.ey - 1.8)}`);
    const bk = fol(S, 'b', c, -12.5, -11, 14, dt, 6), fp = kf(e, [[0, 1], [.7, -1, 8]]);
    S.bk.setAttribute('transform', `translate(${P2(bk[0], bk[1])}) rotate(-7)`); S.bw = toW(c, bk[0], bk[1] + 3);
    show(S.fl, Math.abs(fp) < .985 && e < 99); if (Math.abs(fp) < .985){ const x = 10.4*fp, lift = (1 - fp*fp)*3.4; S.fl.setAttribute('d', `M0 0C${P2(x*.3, -1.8 - lift)} ${P2(x*.7, -2.2 - lift)} ${P2(x, -1 - lift*.6)}V${n2(7.2 - lift*.6)}C${P2(x*.7, 6.2 - lift)} ${P2(x*.3, 6.6 - lift)} 0 8.2Z`); }
    putHand(S.lh, bk[0] - 11.6, bk[1] + 5.4);
    const hv = kf(e, [[0, 0], [2.4, 1, 16], [3.2, 0, 14]]), br = fpt(f, 0, ey + 1.2), hp = fol(S, 'h', c, lp(30, br[0] + 1.4, cl(hv*1.4)), lp(-12, br[1] + 3.4, cl(hv*1.4)), 18, dt, 8);
    putHand(S.hn, hp[0], hp[1], hv);
  } };

/* ================= the cast ================= */
const GRP = { check:'Check role', content:'Content role' };
const CAST = [
  { k:'review', name:'Review', grp:'check', mood:'curious', droop:-1, P:LENS, prop:'A magnifying lens',
    job:'Reads a change or a page and leaves pinned comments.', persona:'Thorough and a little skeptical. Notices the thing you hoped nobody would.',
    sig:'Raises its lens to one eye, and the eye behind the glass grows.', idle:'Holds the lens at its side, glancing around.' },
  { k:'accessibility', name:'Accessibility', grp:'check', mood:'happy', droop:1, P:PHONES, prop:'Headphones, one cup dark and one light',
    job:'Checks contrast, focus order and labels against WCAG.', persona:'Patient and kind. Listens to every page the way a screen reader would.',
    sig:'Presses an ear cup to listen, then traces a focus ring around itself.', idle:'The cups trail its every move on their own springs.' },
  { k:'copy-editor', name:'Copy editor', grp:'content', mood:'neutral', droop:-1, P:PENCIL, prop:'A pencil',
    job:'Fixes spelling, tone and clarity without changing what you meant.', persona:'Fussy about commas, gentle about everything else.',
    sig:'Taps its pencil on its chin, gets the idea, then writes a mark in the air.', idle:'Holds its pencil up like it is about to say something.' },
  { k:'brand-checker', name:'Brand checker', grp:'content', mood:'proud', droop:-1, P:FAN, prop:'A swatch fan in the four role washes',
    job:'Compares colors, type and voice against the brand rules.', persona:'Particular about color. Has opinions about your blue.',
    sig:'Fans out its swatches and holds one up against its own color.', idle:'Each swatch sways on its own spring.' },
  { k:'seo', name:'SEO', grp:'content', mood:'waiting', droop:-1, P:GLASS, prop:'A spyglass',
    job:'Audits titles, structure and links for search.', persona:'Always scanning the horizon for what people search next.',
    sig:'Raises its spyglass, extends it one segment at a time and scans until it finds something.', idle:'Sways gently with the spyglass closed.' },
  { k:'performance', name:'Performance', grp:'check', mood:'determined', droop:-1, P:WATCH, prop:'A stopwatch',
    job:'Times page loads and flags the ones that got slower.', persona:'Impatient in the nicest way. Counts every millisecond.',
    sig:'Checks its stopwatch, taps its base four times, then clicks the crown and starts the clock.', idle:'The second hand ticks forward twice a second.' },
  { k:'security', name:'Security', grp:'check', mood:'neutral', droop:-1, P:KEYS, prop:'A ring of keys',
    job:'Scans for exposed keys and unsafe settings.', persona:'Calm and watchful. Checks every lock twice.',
    sig:'Lifts its key ring to eye level, studies it and gives it a shake.', idle:'The keys jingle with follow-through whenever it moves.' },
  { k:'link-checker', name:'Link checker', grp:'check', mood:'worried', droop:1, P:CHAIN, prop:'A chain',
    job:'Follows every link and reports the ones that fail.', persona:'Follows everything to the end. A little nervous about dead ends.',
    sig:'Pulls its chain taut; one link breaks, and it pinches the ends back together.', idle:'The chain swings a beat behind the body.' },
  { k:'form-tester', name:'Form tester', grp:'check', mood:'happy', droop:1, P:STAFF, prop:'A text cursor staff',
    job:'Fills in and submits forms to see what breaks.', persona:'Mischievous. Tries every wrong answer so your customers never have to.',
    sig:'Types into a field, submits, gets an error, then gets it right.', idle:'Its staff blinks like a text cursor.' },
  { k:'visual-regression', name:'Visual regression', grp:'check', mood:'neutral', droop:-1, P:CAMERA, prop:'An instant camera',
    job:'Compares screenshots from before and after a change.', persona:'Remembers exactly how every page looked yesterday.',
    sig:'Takes a photo, lays it over yesterday’s and circles what moved.', idle:'Keeps the camera ready at its side.' },
  { k:'translator', name:'Translator', grp:'content', mood:'happy', droop:-1, P:BUBBLE, prop:'A speech bubble',
    job:'Translates content and keeps your terms consistent.', persona:'Chatty, warm and exact about words.',
    sig:'Talks while its speech bubble runs through four scripts, then settles on one.', idle:'The bubble swaps script every few seconds.' },
  { k:'researcher', name:'Researcher', grp:'content', mood:'neutral', droop:1, P:BOOK, prop:'Glasses and an open book',
    job:'Finds sources for a question and cites them.', persona:'Reads the footnotes and cites everything.',
    sig:'Reads until its glasses slide down, looks up over them, then pushes them back.', idle:'Its glasses creep slowly down its face.' }
];
// every prop rides the body's own frame; the follow-through is the prop's own physics, not the rig's side lag
CAST.forEach(c => { c.P.anchor = 'front'; });
const washOf = c => c.grp === 'check' ? WASHES.blue : WASHES.violet;
const play = (ch, t) => { const S = ch.propS, p = ch.prop; if (!S || !p) return; S.a0 = t; S.cues = p.cues.map(q => [q[0], q[1]]); S.dur = p.dur; };
const busy = (ch, t) => { const S = ch.propS; return !!S && S.a0 != null && t - S.a0 < S.dur; };

/* ---------- standalone SVG: the rig's own static pose plus the prop, drawn through a string shim ---------- */
class SEl { constructor(tag){ this.tag = tag; this.a = {}; this.kids = []; this.text = ''; }
  setAttribute(k, v){ this.a[k] = String(v); } getAttribute(k){ return this.a[k] ?? null; }
  appendChild(c){ this.kids.push(c); return c; } set textContent(v){ this.text = String(v); } get textContent(){ return this.text; } }
const SHIM = { createElementNS:(ns, tag) => new SEl(tag) };
const escA = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const ser = e => {
  if (e.a.display === 'none') return '';
  const a = { ...e.a }, cls = (a.class || '').split(' ');
  if (cls.includes('arg-k') || cls.includes('arg-sk')){ a.stroke = INK; if (!cls.includes('arg-p') && a.fill == null) a.fill = 'none'; }
  if (cls.includes('arg-p')) a.fill = PAPER;
  if (cls.includes('arg-f') || cls.includes('cka-sol')){ a.fill = INK; a.stroke = INK; }
  if (cls.includes('arg-w') && a.opacity == null) a.opacity = '.85';
  if (cls.includes('cka-halo')){ a.fill = 'none'; a.stroke = PAPER; }
  delete a.display;
  const attrs = Object.entries(a).map(([k, v]) => ` ${k}="${escA(v)}"`).join('');
  const inner = e.kids.map(ser).join('') + (e.text ? escA(e.text) : '');
  return inner ? `<${e.tag}${attrs}>${inner}</${e.tag}>` : `<${e.tag}${attrs}/>`;
};
const svgFor = (slug, o = {}) => {
  const c = CAST.find(x => x.k === slug); if (!c) return '';
  const size = o.size || 160, u = size/54, Wd = Math.round(size*1.5), Hd = Math.round(size*1.72), X = Wd/2, Y = Hd - size*.1, id = 'agent-' + c.k;
  let s = R.svg('neutral', { size, wash:washOf(c), id, side:c.droop });
  const prev = DOC; DOC = SHIM; const g = new SEl('g'), P = { ...D0 };
  const fake = { static:true, seed:0, x:X, y:Y, u, size, vx:0, vy:0, cur:'neutral', T:{ ...P }, pz:{ P, sx:1, sy:1, sh:0, g1:[0, 0], g2:[0, 0], fl:[0, 0], blink:0 },
    react(){}, impulse(){}, look(){}, hop(){} };
  try { const S = c.P.build(g, fake); c.P.draw(S, { t:0, P, expr:'neutral', mode:'ground', think:0, sw:swFor(size)/u, u, ch:fake }); } finally { DOC = prev; }
  const tf = `matrix(${n2(u)} 0 0 ${n2(u)} ${n2(X)} ${n2(Y - 9*u)})`, vx = X - 54*u, vy = Y - 86*u, vw = 108*u, vh = 92*u;
  s = s.replace(/viewBox="[^"]*" width="\d+" height="\d+"/, `viewBox="${n2(vx)} ${n2(vy)} ${n2(vw)} ${n2(vh)}" width="${Math.round(vw)}" height="${Math.round(vh)}"`);
  s = s.replace(/<title id="([^"]+)">[^<]*<\/title>/, (m, i) => `<title id="${i}">${escA(c.name)} agent</title>`);
  s = s.replace(/<desc id="([^"]+)">[^<]*<\/desc>/, (m, i) => `<desc id="${i}">${escA(`A square paper agent with a globe on its antenna, holding ${c.prop.toLowerCase()}. ${c.job}`)}</desc>`);
  s = s.replace('.arg-sk{stroke:#ece6db}', '.arg-sk,.cka-sol,.cka-halo{stroke:#ece6db}');
  return s.replace(/<\/svg>\s*$/, `<g id="prop" transform="${tf}">${g.kids.map(ser).join('')}</g>\n</svg>\n`);
};
// shared registry (cast B uses the same object): merge, never replace
const AC = globalThis.AgentCast && typeof globalThis.AgentCast === 'object' ? globalThis.AgentCast : (globalThis.AgentCast = {});
AC.a = { CAST, play, busy, svg:svgFor, washOf };
AC.roles = AC.roles || {};
CAST.forEach(c => { AC.roles[c.k] = { name:c.name, mean:c.job, persona:c.persona, sig:c.sig, expression:c.mood, action:c.sig, wash:c.grp === 'check' ? 'blue' : 'violet', droop:c.droop,
  prop:() => c.P, act:ch => play(ch, ch.t), svg:o => svgFor(c.k, o) }; });

if (typeof atom !== 'function' || typeof document === 'undefined') return;

/* ================= atom: the lineup ================= */
atom({ id:'agentcasta', cat:'Agent identity', name:'Agent cast: checkers and writers', block:'AgentCharacter (proposed)', fam:['M','S','D','T'], wide:true, tall:true,
  html:`<style>
.cka-root{position:absolute;inset:0;container-type:inline-size;text-align:left;overflow:hidden}
.cka-lay{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,46fr) minmax(0,54fr);grid-template-rows:minmax(0,1fr) auto 172px;grid-template-areas:"spot head" "spot ctl" "strip strip"}
.cka-spot{grid-area:spot;min-height:0;min-width:0}
.cka-head{grid-area:head;align-self:end;display:flex;flex-direction:column;gap:8px;padding:24px 28px 16px 4px;min-width:0}
.cka-ctl{grid-area:ctl;display:flex;flex-direction:column;gap:16px;padding:0 28px 22px 4px;min-width:0}
.cka-stk{display:grid}.cka-stk>*{grid-area:1/1;min-width:0}
.cka-n{font-size:26px;font-weight:600;letter-spacing:-.02em;line-height:1.15}
.cka-g{display:flex;align-items:center;gap:6px;margin-top:5px;font-size:12px;color:var(--muted)}
.cka-g i{flex:none;width:10px;height:10px;border-radius:3px;border:1px solid var(--line)}
.cka-job>span{font-size:15px;line-height:1.45;max-width:44ch}
.cka-per>span{font-size:13.5px;line-height:1.45;color:var(--muted);max-width:46ch}
.cka-sg{display:flex;align-items:center;gap:12px}
.cka-sg .btn{flex:none;height:32px}
.cka-sig>span{font-size:12.5px;line-height:1.4;color:var(--muted)}
.cka-h{margin:0 0 7px;font-size:12px;font-weight:600;color:var(--muted)}
.cka-ex{display:flex;flex-wrap:wrap;gap:6px}
.cka-ex button{border:1px solid var(--line);background:var(--card);border-radius:8px;padding:4px 9px;font-size:12.5px;font-weight:500;color:var(--muted);cursor:pointer}
.cka-ex button[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:var(--card)}
.cka-strip{grid-area:strip;position:relative;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;border-top:1px solid var(--line-soft)}
.cka-strip::-webkit-scrollbar{display:none}
.cka-row{position:relative;height:100%;margin:0 auto}
.cka-row>svg{position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible}
.cka-sl{position:absolute;top:0;bottom:0;border:0;background:none;padding:0;margin:0;cursor:pointer;scroll-snap-align:center;border-radius:12px;color:var(--muted)}
.cka-sl span{position:absolute;left:3px;right:3px;bottom:7px;font-size:11.5px;line-height:1.2;text-align:center}
.cka-sl[aria-pressed=true]{color:var(--ink);font-weight:600}
.cka-sl:focus-visible,.cka-hit:focus-visible,.cka-ex button:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.cka-ov{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;display:block}
.cka-fl{fill:none;stroke:var(--faint);stroke-width:1.2;stroke-linecap:round;opacity:.7}
.cka-hit{position:absolute;z-index:3;border:0;background:none;padding:0;border-radius:14px;cursor:pointer}
.cka-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.arg-svg .cka-sol{fill:var(--arg-ink);stroke:var(--arg-stalk)}
.arg-svg .cka-halo{fill:none;stroke:var(--arg-paper)}
.arg-svg .cka-fr{fill:none;stroke:var(--accent)}
.arg-svg .arg-k.cka-er{stroke:var(--danger)}
@container (max-width:900px){.cka-lay{grid-template-columns:minmax(0,44fr) minmax(0,56fr);grid-template-rows:minmax(0,1fr) auto 164px}
  .cka-n{font-size:22px}.cka-head{padding:18px 18px 12px 0}.cka-ctl{padding:0 18px 18px 0;gap:12px}.cka-job>span{font-size:14px}.cka-per>span{font-size:13px}}
@container (max-width:560px){.cka-lay{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto 150px;grid-template-areas:"head" "spot" "ctl" "strip"}
  .cka-head{align-self:start;padding:14px 16px 0;gap:5px}.cka-n{font-size:20px}.cka-job>span{font-size:13.5px}.cka-per>span{font-size:12.5px}
  .cka-ctl{padding:0 0 10px;gap:10px}.cka-sg{padding:0 16px}.cka-h{padding:0 16px;margin-bottom:5px}
  .cka-ex{flex-wrap:nowrap;overflow-x:auto;padding:2px 16px 4px;scrollbar-width:none;scroll-padding-inline:16px}.cka-ex::-webkit-scrollbar{display:none}.cka-ex button{flex:none}}
</style><div class="cka-root"><div class="cka-lay">
<div class="cka-spot"></div>
<div class="cka-head"><div class="cka-stk cka-nm"></div><div class="cka-stk cka-job"></div><div class="cka-stk cka-per"></div></div>
<div class="cka-ctl"><div class="cka-sg"><button type="button" class="btn cka-play">Play signature</button><div class="cka-stk cka-sig"></div></div>
<div><p class="cka-h" id="agentcasta-ex">Expression</p><div class="cka-ex" role="group" aria-labelledby="agentcasta-ex"></div></div></div>
<div class="cka-strip" role="group" aria-label="Agent lineup"><div class="cka-row"><svg aria-hidden="true"><path class="cka-fl"/></svg></div></div>
</div><svg class="cka-ov" aria-hidden="true"><path class="cka-fl"/></svg><button type="button" class="cka-hit"></button><p class="cka-sr" aria-live="polite"></p></div>`,
  desc:'Twelve role agents stand in a lineup, all the same species (one square body, one face, one arc antenna) and each with its own prop, habit and default mood. Each idles in character: the stopwatch ticks, the caret staff blinks, the speech bubble swaps scripts, the glasses creep down, and every few seconds one of them plays its signature action. Tap one and its neighbours lean away and turn to watch, staggered outward from it; the agent on stage hops back to its place first, then the chosen one jumps forward, growing as it flies, lands with a squash, and plays its signature. Its name, job and habit swap in as it takes off. Props trail the body on lagging springs, hanging parts swing a beat late and settle without swinging back, and every eye follows your pointer.',
  api:'ch = AgentRig.create(svg, { prop:AgentCast.roles[k].prop() })   AgentCast.roles[k].act(ch)   choose(i): others.impulse(away).look(i) → old.throw(→slot) → land → new.throw(→stage, size↑) → land → play',
  init(st){
    const root = $(st,'.cka-root'), spotEl = $(st,'.cka-spot'), strip = $(st,'.cka-strip'), row = $(st,'.cka-row'), ssv = $(row,'svg'), sfl = $(ssv,'.cka-fl');
    const ov = $(st,'.cka-ov'), ofl = $(ov,'.cka-fl'), hit = $(st,'.cka-hit'), exG = $(st,'.cka-ex'), sr = $(st,'.cka-sr'), N = CAST.length, G = 2600;
    const mood = k => R.EXPRESSIONS.find(x => x.k === k).name.toLowerCase();
    // text layers swap together: exit 100ms, then enter
    const sw = new Swap(0), box = { nm:$(st,'.cka-nm'), job:$(st,'.cka-job'), per:$(st,'.cka-per'), sig:$(st,'.cka-sig') };
    const span = (p, txt) => { const s = document.createElement('span'); s.textContent = txt; p.appendChild(s); return s; };
    const layers = CAST.map(c => { const n = document.createElement('div'), h = document.createElement('div'), g = document.createElement('div'), i = document.createElement('i');
      h.className = 'cka-n'; h.textContent = `${c.name} agent`; g.className = 'cka-g'; i.style.background = washOf(c); g.append(i, `${GRP[c.grp]} · usually ${mood(c.mood)}`); n.append(h, g); box.nm.appendChild(n);
      return [n, span(box.job, c.job), span(box.per, c.persona), span(box.sig, c.sig)]; });
    // characters: twelve in the lineup, and a stage copy made on first use
    const mkCh = (svg, c, i, size) => R.create(svg, { size, wash:washOf(c), seed:i*1.618 + .37, expression:c.mood, droop:c.droop, prop:c.P });
    const line = CAST.map((c, i) => mkCh(ssv, c, i, 56)), front = [], vis = CAST.map(() => true), fvis = [];
    const getFront = i => { if (!front[i]){ front[i] = mkCh(ov, CAST[i], i, 120); front[i].setBounds(-1e5, 1e5, -1e9); fvis[i] = false; front[i].el.setAttribute('display', 'none'); } return front[i]; };
    const showL = (i, on) => { vis[i] = on; line[i].el.setAttribute('display', on ? 'inline' : 'none'); };
    const showF = (i, on) => { fvis[i] = on; getFront(i).el.setAttribute('display', on ? 'inline' : 'none'); };
    const slots = CAST.map((c, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'cka-sl'; span(b, c.name);
      b.setAttribute('aria-label', `${c.name} agent. ${c.job}`); b.setAttribute('aria-pressed', 'false'); b.tabIndex = -1; b.onclick = () => choose(i); row.appendChild(b); return b; });
    const exB = R.EXPRESSIONS.map(x => { const b = document.createElement('button'); b.type = 'button'; b.textContent = x.name; b.setAttribute('aria-pressed', 'false');
      b.onclick = () => { if (cur == null || phase) return; getFront(cur).set(x.k); setEx(x.k); }; exG.appendChild(b); return b; });
    const setEx = k => { exB.forEach((b, j) => b.setAttribute('aria-pressed', R.EXPRESSIONS[j].k === k)); const b = exB.find(x => x.getAttribute('aria-pressed') === 'true'), g = exG.getBoundingClientRect(), r = b.getBoundingClientRect();
      if (exG.scrollWidth > exG.clientWidth && (r.left < g.left || r.right > g.right)) exG.scrollLeft += r.left - g.left - (g.width - r.width)/2; };
    exG.addEventListener('keydown', e => { const d = { ArrowRight:1, ArrowLeft:-1 }[e.key]; if (!d) return; e.preventDefault(); const f = exB.indexOf(document.activeElement); const n = (f + d + exB.length) % exB.length; exB[n].focus(); exB[n].click(); });

    let W = 0, slotW = 90, fs = 56, sFloor = 0, rowW = 0, spot = { x:0, y:0, s:120 }, cur = 0, want = null, phase = null, flight = null;
    const Q = [], scr = new Track(0, S.base); let scrT = -9, snapOff = false;
    const layout = () => {
      W = root.clientWidth; const H = root.clientHeight; ov.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const sw_ = strip.clientWidth, sh_ = strip.clientHeight, phone = W < 560;
      slotW = W >= 900 ? Math.max(84, (sw_ - 16)/N) : phone ? 92 : 98; fs = phone ? 52 : 56; rowW = Math.round(slotW*N + 16);
      row.style.width = rowW + 'px'; ssv.setAttribute('viewBox', `0 0 ${rowW} ${sh_}`); sFloor = sh_ - (phone ? 40 : 44);
      sfl.setAttribute('d', `M12 ${sFloor}H${rowW - 12}`);
      slots.forEach((b, i) => { b.style.left = px(8 + slotW*i); b.style.width = px(slotW); });
      line.forEach((ch, i) => { ch.setSize(fs); ch.setBounds(-1e5, 1e5, -1e9); ch.moveTo(8 + slotW*(i + .5), sFloor, true); });
      const r = spotEl.getBoundingClientRect(), q = root.getBoundingClientRect();
      spot = { x:r.left - q.left + r.width/2, y:r.bottom - q.top - (phone ? 16 : 30), s:Math.round(clamp(Math.min(r.width*.4, r.height*.48), 84, 150)) };
      ofl.setAttribute('d', `M${spot.x - spot.s*1.2} ${spot.y}H${spot.x + spot.s*1.2}`);
      if (cur != null && !flight){ const b = getFront(cur); b.setSize(spot.s); b.moveTo(spot.x, spot.y, true); }
    };
    // the strip slot's floor point in overlay coordinates; scrollTo predicts where it will be once the strip finishes scrolling
    const slotPos = (i, scrollTo) => { const q = root.getBoundingClientRect(), rr_ = row.getBoundingClientRect(), shift = scrollTo == null ? 0 : strip.scrollLeft - scrollTo;
      return [rr_.left - q.left + 8 + slotW*(i + .5) + shift, rr_.top - q.top + sFloor]; };
    const scrollTarget = i => clamp(8 + slotW*(i + .5) - strip.clientWidth/2, 0, Math.max(0, rowW - strip.clientWidth));
    const scrollTo = i => { const to = scrollTarget(i); if (Math.abs(to - strip.scrollLeft) < 1) return; scr.jump(strip.scrollLeft); scr.set(to); scrT = now(); strip.style.scrollSnapType = 'none'; snapOff = true; };
    const fly = (ch, a, b, s0, s1, T, face, done) => {
      ch.setSize(s0); ch.moveTo(a[0], a[1], true);
      if (R.reduced){ ch.setSize(s1); ch.moveTo(b[0], b[1], true); done(); return; }
      // the floor stays at the lower of the two levels until the arc is above the landing spot and falling
      ch.throw((b[0] - a[0])/T, (b[1] - a[1] - .5*G*T*T)/T); ch.moveTo(b[0], Math.max(a[1], b[1])); ch.y = a[1] - 1; ch.react(face, 9);  // start just off the floor: a first frame has no elapsed time
      flight = { ch, t0:now(), T, s0, s1, b };
      ch.onLand = () => { ch.onLand = null; ch.vx = 0; ch.moveTo(b[0]); ch.setSize(s1); flight = null; done(); };
    };
    const setPressed = i => slots.forEach((b, j) => { b.setAttribute('aria-pressed', j === i); });
    const choose = i => { setPressed(i); slots.forEach((b, j) => b.tabIndex = j === i ? 0 : -1); want = i; if (!phase) step(); };
    const step = () => {
      const i = want; want = null; if (i == null) return;
      if (i === cur){ play(getFront(cur), now() + .05); return; }
      const t = now(), to = scrollTarget(i);
      // everyone else makes way: a lean away and a look at the one stepping out, staggered outward from it
      line.forEach((ch, j) => { if (j === i || j === cur) return; Q.push([t + .035*Math.abs(j - i), () => { ch.impulse(Math.sign(j - i)*.55, 1.2); ch.look(8 + slotW*(i + .5), sFloor - fs*.7, 1.5); }]); });
      scrollTo(i);
      if (cur != null){ const o = cur, fo = getFront(o); phase = 'out'; hit.hidden = true;
        fly(fo, [fo.x, fo.y], slotPos(o, to), fo.size, fs, .5, 'happy', () => { showF(o, false); showL(o, true); line[o].set(CAST[o].mood); line[o].react('happy', .6); enter(i); }); }
      else enter(i);
    };
    const enter = i => {
      cur = i; phase = 'in'; showL(i, false); sw.to(i); sr.textContent = `${CAST[i].name} agent steps forward. ${CAST[i].job}`;
      const b = getFront(i); showF(i, true); b.set(CAST[i].mood, true); setEx(CAST[i].mood);
      hit.setAttribute('aria-label', `Play the ${CAST[i].name.toLowerCase()} agent's signature action`);
      fly(b, slotPos(i), [spot.x, spot.y], fs, spot.s, .62, 'delighted', () => { phase = null; hit.hidden = false; b.react('happy', .6); play(b, now() + .45); nextFront = now() + 13; if (want != null) step(); });
    };
    $(st,'.cka-play').onclick = () => { if (cur != null && !phase) play(getFront(cur), now()); };
    hit.onclick = () => { if (cur != null && !phase) play(getFront(cur), now()); };
    strip.addEventListener('keydown', e => { const d = { ArrowRight:1, ArrowLeft:-1, Home:-99, End:99 }[e.key]; if (!d) return; e.preventDefault();
      const f = slots.indexOf(document.activeElement), n = d === -99 ? 0 : d === 99 ? N - 1 : clamp((f < 0 ? cur : f) + d, 0, N - 1);
      slots.forEach((b, j) => b.tabIndex = j === n ? 0 : -1); slots[n].focus({ preventScroll:true }); scrollTo(n); });
    // the pointer anywhere on the page
    const ptr = { x:0, y:0, t:-9 }; addEventListener('pointermove', e => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = now(); }, { passive:true });

    new ResizeObserver(layout).observe(root); layout();
    // the first agent starts on stage
    showL(0, false); showF(0, true); setPressed(0); slots[0].tabIndex = 0; setEx(CAST[0].mood); getFront(0).setSize(spot.s); getFront(0).moveTo(spot.x, spot.y, true);
    hit.setAttribute('aria-label', `Play the ${CAST[0].name.toLowerCase()} agent's signature action`);
    play(getFront(0), now() + .8);
    const ORDER = [3, 7, 1, 10, 5, 0, 8, 2, 11, 6, 4, 9];
    let nextLine = now() + 1.6, rrI = 0, nextFront = now() + 12, lastP = -9;
    return t => {
      if (Q.length){ const due = Q.filter(q => q[0] <= t); if (due.length){ for (const q of due) Q.splice(Q.indexOf(q), 1); due.forEach(q => q[1]()); } }
      if (t - scrT < 1.1) strip.scrollLeft = scr.at(t); else if (snapOff){ snapOff = false; strip.style.scrollSnapType = ''; }
      // one lineup agent at a time plays its signature, round robin
      if (t >= nextLine){ nextLine = t + 2.7; for (let k = 0; k < N; k++){ const j = ORDER[rrI++ % N]; if (vis[j] && !busy(line[j], t)){ play(line[j], t); break; } } }
      if (cur != null && !phase && t >= nextFront){ nextFront = t + 13; if (!busy(getFront(cur), t)) play(getFront(cur), t); }
      if (ptr.t !== lastP && t - ptr.t < 2.4){ lastP = ptr.t; const a = ssv.getBoundingClientRect(), b = ov.getBoundingClientRect();
        line.forEach(ch => ch.lookAt(ptr.x - a.left, ptr.y - a.top)); front.forEach(ch => ch && ch.lookAt(ptr.x - b.left, ptr.y - b.top)); }
      if (flight){ const f = flight, p = clamp((t - f.t0)/f.T); f.ch.setSize(lerp(f.s0, f.s1, p*p*(3 - 2*p))); if (f.ch.vy > 0 && f.ch.y < f.b[1]) f.ch.floor = f.b[1]; }
      line.forEach((ch, i) => vis[i] && ch.render(t));
      front.forEach((ch, i) => ch && fvis[i] && ch.render(t));
      if (cur != null && !phase){ const r = getFront(cur).box(); hit.style.left = px(r.x); hit.style.top = px(r.y); hit.style.width = px(r.w); hit.style.height = px(r.h); }
      layers.forEach(([n, a, b, c], i) => { sw.apply(n, i, t, 6); sw.apply(a, i, t, 4); sw.apply(b, i, t, 4); sw.apply(c, i, t, 3); });
    };
  }
});
})();
