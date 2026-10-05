/* ---- agent behaviours: the agent character acting out its work inside a small web page (Wave 6) ----
   Built on the shared rig (lanes/agentrig.js, global AgentRig). This lane adds a thin acting layer:
   - Actor: a rig character plus a pose layer (body and gaze overrides blended by the rig's own springs),
     ballistic leaps that land exactly where they aim (the rig's landing slide is part of the aim), hop-walks.
   - Prop: things the armless agent carries (cursor, lens, pin, pencil, card, document, photo). Held props
     trail the body on a critically damped spring and tilt against the motion; free props fly to a point.
   - Human: a round person (people are round, agents are square), faceless, leaning into their own motion.
   Every page change is a Track or Swap from the clock; every scene is a loop that ends where it began. */
(() => {
const NS = 'http://www.w3.org/2000/svg', GRAV = 2600;
const RMQ = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const n2 = v => String(Math.round(v*100)/100);
const mk = (tag, a, p) => { const e = document.createElementNS(NS, tag); if (a) for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
// critically damped spring, exact over dt (same law as the rig): never passes its target from rest
const cdv = (x, v, to, w, dt) => { const x0 = x - to, e = Math.exp(-w*dt), k = v + w*x0; return [to + e*(x0 + k*dt), e*(v - w*k*dt)]; };
const D0 = { eo:1, es:1, sq:0, lt:0, ea:0, bv:0, by:0, ba:0, bb:0, mc:.14, mw:.62, mo:0, mr:0, mv:0, mk:0, mx:0, gx:0, gy:0, gw:0, fx:0, fy:0, ft:0, bs:0, bl:0, lean:0, ad:0, ap:0, spin:0, sway:0, br:1, bk:1, gl:1 };
const exv = (k, q) => { const e = globalThis.AgentRig.EXPRESSIONS.find(x => x.k === k); return e && q in e.p ? e.p[q] : D0[q]; };
const WC = k => globalThis.AgentRig.WASH[k];
let uid = 0;

/* ---------- drawing vocabulary: the house hand (paper, one ink line, pale washes) ---------- */
const Rr = (g, x, y, w, h, rx = 8, cls = 'abh-kp') => mk('rect', { x:n2(x), y:n2(y), width:n2(Math.max(0, w)), height:n2(Math.max(0, h)), rx, class:cls }, g);
const Pa = (g, d, cls = 'abh-k') => mk('path', { d, class:cls }, g);
const Tx = (g, x, y, s, cls = 'abh-tx', anchor) => { const e = mk('text', { x:n2(x), y:n2(y), class:cls }, g); if (anchor) e.setAttribute('text-anchor', anchor); e.textContent = s; return e; };
const Ln = (g, x, y, ws, gap = 12) => Pa(g, ws.map((w, i) => `M${n2(x)} ${n2(y + i*gap)}H${n2(x + Math.max(2, w))}`).join(''), 'abh-ln');
const Wa = (g, x, y, w, h, rx, c) => { const e = Rr(g, x, y, w, h, rx, 'abh-wa'); e.setAttribute('fill', c); return e; };
const tw = (e, fb) => { try { const w = e.getComputedTextLength(); if (w > 0) return w; } catch (_){ } return fb; };
const ctr = (g, x, y) => { const o = mk('g', { transform:`translate(${n2(x)} ${n2(y)})` }, g); return [o, mk('g', {}, o)]; };
const scl = (e, sx, sy = sx, dy = 0) => e.setAttribute('transform', `translate(0 ${n2(dy)}) scale(${n2(sx)} ${n2(sy)})`);
const CHK = (x, y, k) => `M${n2(x)} ${n2(y)}l${n2(3.6*k)} ${n2(3.6*k)}l${n2(7.4*k)} ${n2(-7.6*k)}`;

// a button drawn around its centre so it can squash in place
const button = (g, cx, cy, w, h, label, ink) => { const [o, i] = ctr(g, cx, cy);
  const r = Rr(i, -w/2, -h/2, w, h, Math.min(10, h/2.6), ink ? 'abh-bi' : 'abh-kp'); const t = Tx(i, 0, 4.5, label, ink ? 'abh-tx abh-b abh-inv' : 'abh-tx abh-b', 'middle');
  return { o, i, r, t, cx, cy, w, h, x0:cx - w/2, y0:cy - h/2, p:new Track(0) }; };
const field = (g, x, y, w, h, text) => { const r = Rr(g, x, y, w, h, 8, 'abh-kp'), t = Tx(g, x + 12, y + h/2 + 5, text, 'abh-tx abh-mono');
  return { r, t, x, y, w, h, cy:y + h/2 }; };
const summary = (g, x, y, w, o = {}) => { const rh = o.rh || 24, h = 46 + rh*3 + 14, cg = mk('g', {}, g);
  Rr(cg, x, y, w, h, 12, 'abh-kp'); Tx(cg, x + 14, y + 26, 'Order summary', 'abh-tx abh-b');
  [['Spring notebook × 2', '$36.00'], ['Pencil set', '$12.00']].forEach(([a, b], i) => { Tx(cg, x + 14, y + 50 + i*rh, a, 'abh-tx abh-sm abh-mu'); Tx(cg, x + w - 14, y + 50 + i*rh, b, 'abh-tx abh-sm abh-mu', 'end'); });
  const ry = y + 50 + rh*2 - 9; Pa(cg, `M${n2(x + 14)} ${n2(ry)}H${n2(x + w - 14)}`, 'abh-ln');
  const ty = ry + rh, lab = Tx(cg, x + 14, ty, 'Total', 'abh-tx abh-b'), amts = (o.amts || ['$48.00']).map(s => Tx(cg, x + w - 14, ty + (o.drop || 0), s, 'abh-tx abh-b', 'end'));
  return { g:cg, x, y, w, h, ty, lab, amts, ax:x + w - 14 }; };

/* ---------- the acting layer over the rig ---------- */
class Actor {
  constructor(layer, o){ this.ch = globalThis.AgentRig.create(layer, o); this.ov = {}; this.quiet = true; this.op = new Track(1); }
  get s(){ return this.ch.size; }
  get u(){ return this.ch.u; }
  // pose: hold some expression parameters at a value on top of whatever mood is playing (null releases)
  pose(o){ for (const k in o){ if (o[k] == null){ if (k in this.ov){ delete this.ov[k]; this.ch.T[k] = exv(this.ch.cur, k); } } else this.ov[k] = o[k]; } return this; }
  unpose(){ for (const k in this.ov) this.ch.T[k] = exv(this.ch.cur, k); this.ov = {}; return this; }
  // eyes on the viewer: gaze straight out of the page, face centred
  viewer(on){ if (on){ this.ch.forced = null; this.ch.lookAt(null); return this.pose({ gx:0, gy:0, gw:1, fx:0 }); } return this.pose({ gx:null, gy:null, gw:null, fx:null }); }
  render(t){ const c = this.ch; Object.assign(c.T, this.ov); if (this.quiet) c.fidK = Math.floor((t + c.seed*4.3)/9.5);
    c.render(t); const o = this.op.at(t); c.el.style.opacity = o > .995 ? '' : clamp(o).toFixed(3); }
  // a point on the body in body units (origin bottom centre, y up negative), following squash, stretch and lean
  pt(lx, ly){ const c = this.ch, S = c.S, sy = clamp(S.sy[0], .62, 1.4), sx = Math.pow(1/sy, .75)*clamp(S.hs[0], .7, 1.2), sh = S.sh[0]; return [c.x + c.u*(lx*sx - sh*ly*sy), c.y + c.u*ly*sy]; }
  top(){ return this.pt(0, -54)[1]; }
  face(){ return this.ch.facePos(); }
}
const queue = () => { let q = []; return { at(t, fn){ q.push([t, fn]); q.sort((a, b) => a[0] - b[0]); }, clear(){ q = []; },
  drain(t){ while (q.length && q[0][0] <= t){ const [tt, fn] = q.shift(); fn(tt); } } }; };
// a ballistic leap that lands exactly on (x1, y1): the rig slides vx/slideW after landing, so the aim includes it.
// Going up, the new floor only takes effect at the apex, so it never snaps onto a ledge from below.
const launch = (Q, a, x1, y1, h, tt) => { const c = a.ch; if (c.mode !== 'ground'){ Q.at(tt + .03, t2 => launch(Q, a, x1, y1, h, t2)); return; }
  const y0 = c.y, top = Math.min(y0, y1) - Math.max(3, h), vy = -Math.sqrt(2*GRAV*(y0 - top)), ta = -vy/GRAV, T = ta + Math.sqrt(2*Math.max(0, y1 - top)/GRAV);
  c.mode = 'air'; c.thrown = false; c.vy = vy; c.vx = (x1 - c.x)/(T + 1/c.slideW);
  if (y1 >= y0) c.floor = y1; else Q.at(tt + ta*.85, () => { c.floor = y1; }); };
const leap = (Q, a, x1, y1, h, tt) => { const c = a.ch;
  if (RMQ){ Q.at(tt, () => c.moveTo(x1, y1, true)); return; }
  Q.at(tt, () => { if (c.mode === 'ground') c.S.sy[1] -= 2.2 + Math.min(4, h/c.size*6); });   // anticipation: a quick crouch
  Q.at(tt + .09, t2 => launch(Q, a, x1, y1, h, t2)); };
const HOP = .37, steps = (a, dx) => Math.ceil(Math.abs(dx)/(.92*a.s) - 1e-6), walkDur = (a, dx) => { const n = steps(a, dx); return n ? n*HOP + .2 : 0; };
const walk = (Q, a, x0, x1, tt, h) => { const n = steps(a, x1 - x0), y = a.ch.floor; for (let i = 1; i <= n; i++) leap(Q, a, x0 + (x1 - x0)*i/n, y, h ?? .15*a.s, tt + (i - 1)*HOP); return walkDur(a, x1 - x0); };

/* ---------- props: drawn in body units around their grip point, scaled with the character ---------- */
const PROP = {
  cursor:g => Pa(g, 'M0 0V17.5L4.4 13.4L7.3 19.8L10.4 18.5L7.6 12.3H13.6Z', 'abh-pkp'),
  lens:g => { mk('circle', { r:8.5, class:'abh-pkw', fill:WC('blue') }, g); Pa(g, 'M6.3 6.3L13.6 13.6', 'abh-pk abh-thk'); },
  pin:g => { Pa(g, 'M0 0V-8', 'abh-pk'); mk('circle', { cy:-13.5, r:6.2, class:'abh-pkf' }, g); Tx(g, 0, -10.6, '1', 'abh-pnum', 'middle'); Pa(g, 'M-2.8 -13.4l1.9 1.9 3.8 -4', 'abh-pkc'); },
  pencil:g => { const A = k => [.7071*k, -.7071*k], N = (p, s) => [p[0] + .7071*s, p[1] + .7071*s], q = p => n2(p[0]) + ' ' + n2(p[1]);
    Pa(g, `M0 0L${q(N(A(7), -3.2))}L${q(N(A(25), -3.2))}L${q(N(A(25), 3.2))}L${q(N(A(7), 3.2))}Z`, 'abh-pkp'); Pa(g, `M${q(N(A(7), -3.2))}L${q(N(A(7), 3.2))}M${q(N(A(20), -3.2))}L${q(N(A(20), 3.2))}`, 'abh-pk'); },
  card:g => { Pa(g, 'M0 -9V0', 'abh-pk'); Rr(g, -12, -29, 24, 20, 3.5, 'abh-pkp'); Tx(g, 0, -14.2, '?', 'abh-pq', 'middle'); },
  doc:g => { Pa(g, 'M-9 -12H4.5L9 -7.5V12H-9Z', 'abh-pkp'); Pa(g, 'M4.5 -12V-7.5H9M-5 -4H5M-5 0H5M-5 4H2', 'abh-pk'); },
  photo:g => { Rr(g, -12, -14, 24, 29, 2, 'abh-pkp'); const w = Rr(g, -9, -11, 18, 16, 1, 'abh-pkw'); w.setAttribute('fill', WC('warm')); w.classList.add('abh-dev'); Pa(g, 'M-9 2L-3 -4L1 0L4 -3L9 2', 'abh-pk abh-dev'); Pa(g, 'M-8 10H3', 'abh-pk'); }
};
class Prop {
  constructor(layer, a, kind){ this.a = a; this.kind = kind; this.g = mk('g', { class:'abh-pr' }, layer); this.i = mk('g', {}, this.g); PROP[kind](this.i);
    this.m = 'hold'; this.off = [37, -22]; this.r0 = 0; this.tg = [0, 0]; this.w = 15; this.st = null; this.o = new Track(1); this.sc = new Track(1); }
  hold(off = [37, -22], r = 0, w = 15){ this.m = 'hold'; this.off = off; this.r0 = r; this.w = w; return this; }
  to(x, y, r = 0, w = 9){ this.m = 'at'; this.tg = [x, y]; this.r0 = r; this.w = w; return this; }
  fix(){ this.m = 'fix'; return this; }
  pos(){ return this.st ? [this.st[0], this.st[2]] : this.a.pt(this.off[0], this.off[1]); }
  update(t, dt){
    const tg = this.m === 'hold' ? this.a.pt(this.off[0], this.off[1]) : this.tg;
    if (!this.st || (RMQ && this.m !== 'fix')) this.st = [tg[0], 0, tg[1], 0, this.r0, 0];
    else if (this.m !== 'fix'){ const x = cdv(this.st[0], this.st[1], tg[0], this.w, dt), y = cdv(this.st[2], this.st[3], tg[1], this.w, dt);
      // a carried thing tilts against its own motion and catches up without swinging past
      const r = cdv(this.st[4], this.st[5], this.r0 + clamp(-this.st[1]*.035, -22, 22), 13, dt); this.st = [x[0], x[1], y[0], y[1], r[0], r[1]]; }
    const u = this.a.u*this.sc.at(t), o = clamp(this.o.at(t));
    this.g.setAttribute('transform', `translate(${n2(this.st[0])} ${n2(this.st[2])}) rotate(${n2(this.st[4])}) scale(${n2(u)})`);
    this.i.style.strokeWidth = n2(this.a.ch.sw/this.a.u); this.g.style.opacity = o > .995 ? '' : o.toFixed(3); this.g.style.visibility = o < .01 ? 'hidden' : '';
  }
  remove(){ this.g.remove(); }
}
/* ---------- a person: round head, rounded shoulders, no face; leans into its own motion ---------- */
class Human {
  constructor(layer, s, wash = 'warm'){ this.s = s; this.g = mk('g', { class:'abh-hu' }, layer);
    const w = .92*s, h = .74*s, r = .29*s; this.sh = mk('ellipse', { class:'abh-hsh', rx:n2(w*.55), ry:n2(2.4) }, this.g); this.b = mk('g', {}, this.g);
    const body = `M${n2(-w/2)} 0V${n2(-h*.52)}Q${n2(-w/2)} ${n2(-h)} ${n2(-w*.18)} ${n2(-h)}H${n2(w*.18)}Q${n2(w/2)} ${n2(-h)} ${n2(w/2)} ${n2(-h*.52)}V0Z`;
    const bf = Pa(this.b, body, 'abh-hw'); bf.setAttribute('fill', WC(wash)); Pa(this.b, body, 'abh-k');
    this.hd = mk('g', {}, this.b); mk('circle', { cy:n2(-h - .1*s - r), r:n2(r), class:'abh-kp' }, this.hd);
    this.x = [0, 0]; this.hx = 0; this.y = 0; this.nod = new Track(0); this.tilt = new Track(0); this.o = new Track(1); this.w = 6; }
  place(x, y){ this.x = [x, 0]; this.hx = x; this.y = y; return this; }
  go(x, w = 6){ this.hx = x; this.w = w; return this; }
  head(){ return [this.x[0] + this.tilt.at()*.01*this.s, this.y - .74*this.s - .4*this.s]; }
  update(t, dt){ this.x = RMQ ? [this.hx, 0] : cdv(this.x[0], this.x[1], this.hx, this.w, dt);
    const lean = clamp(this.x[1]*.02, -8, 8) + this.tilt.at(t), o = clamp(this.o.at(t));
    this.g.setAttribute('transform', `translate(${n2(this.x[0])} ${n2(this.y)})`); this.b.setAttribute('transform', `rotate(${n2(lean)})`);
    this.hd.setAttribute('transform', `translate(0 ${n2(this.nod.at(t))})`); this.g.style.opacity = o > .995 ? '' : o.toFixed(3); this.g.style.visibility = o < .01 ? 'hidden' : ''; }
}
// an element outline that snaps from one box to the next, leading edge first (core edges())
const outline = (g, label0) => { const o = mk('g', { class:'abh-ol' }, g), r = Rr(o, 0, 0, 0, 0, 4, 'abh-sel'), hs = [0, 1, 2, 3].map(() => Rr(o, 0, 0, 5, 5, 1, 'abh-hd'));
  const tag = mk('g', {}, o), tb = Rr(tag, 0, -18, 10, 16, 4, 'abh-tag'), tt = Tx(tag, 6, -6.5, label0, 'abh-tagt');
  const ex = edges(0, 0), ey = edges(0, 0), op = new Track(0);
  return { op, ex, ey, tt, label(s){ tt.textContent = s; tb.setAttribute('width', n2(tw(tt, s.length*6.2) + 12)); },
    jump(x0, y0, x1, y1){ ex.jump(x0, x1); ey.jump(y0, y1); }, go(x0, y0, x1, y1, t){ ex.go(x0, x1, t); ey.go(y0, y1, t); },
    render(t){ const a = op.at(t), x0 = ex.A.at(t), x1 = ex.B.at(t), y0 = ey.A.at(t), y1 = ey.B.at(t);
      o.style.opacity = clamp(a).toFixed(3); o.style.visibility = a < .01 ? 'hidden' : '';
      r.setAttribute('x', n2(x0)); r.setAttribute('y', n2(y0)); r.setAttribute('width', n2(Math.max(0, x1 - x0))); r.setAttribute('height', n2(Math.max(0, y1 - y0)));
      [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach((p, i) => { hs[i].setAttribute('x', n2(p[0] - 2.5)); hs[i].setAttribute('y', n2(p[1] - 2.5)); });
      tag.setAttribute('transform', `translate(${n2(x0)} ${n2(y0 - 4)})`); } }; };
const popEl = (e, p, dy = 4) => { p = clamp(p); e.style.opacity = p > .995 ? '' : p.toFixed(3); e.style.visibility = p < .01 ? 'hidden' : '';
  e.setAttribute('transform', `translate(0 ${n2((1 - p)*dy)})`); };
const swapIn = (els, sw, t) => els.forEach((e, i) => sw.apply(e, i, t, 3));
// html popover: fade, rise and un-blur together; pointer events only once it is mostly in
const popH = (e, p, dy = 6) => { p = clamp(p); e.style.opacity = p.toFixed(3); e.style.visibility = p < .01 ? 'hidden' : 'visible'; e.style.transform = `translateY(${px((1 - p)*dy)})`;
  e.style.filter = p < .98 ? `blur(${((1 - p)*BLUR).toFixed(2)}px)` : 'none'; e.style.pointerEvents = p > .5 ? 'auto' : 'none'; };

/* ---------- page chrome: frame, address bar, the site's own header ---------- */
const chrome = (g, L) => { g.replaceChildren(); const { P, C, n } = L;
  Rr(g, P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0, 14, 'abh-fr');
  Pa(g, `M${n2(P.x0)} ${n2(P.y0 + 32)}H${n2(P.x1)}`, 'abh-k abh-hair');
  Rr(g, P.x0 + 12, P.y0 + 8, P.x1 - P.x0 - 24, 16, 8, 'abh-pill');
  mk('circle', { cx:n2(C.x0 + 5), cy:n2(C.y0 + 7), r:5, class:'abh-k' }, g); Pa(g, `M${n2(C.x0 + 5)} ${n2(C.y0 + 2)}V${n2(C.y0 + 12)}`, 'abh-k abh-hair');
  Tx(g, C.x0 + 16, C.y0 + 11.5, 'Field Notes', 'abh-tx abh-sm abh-b');
  const ws = n ? [22, 26] : [30, 26, 34]; let x = C.x1; Pa(g, ws.map(w => { x -= w; const d = `M${n2(x)} ${n2(C.y0 + 7)}H${n2(x + w - 10)}`; x -= 6; return d; }).join(''), 'abh-ln'); };
const LAYOUT = (W, H) => { const n = W < 460, P = { x0:n ? 10 : 14, y0:2, x1:W - (n ? 10 : 14), y1:H - 12 };
  const C = { x0:P.x0 + (n ? 12 : 20), y0:P.y0 + 44, x1:P.x1 - (n ? 12 : 20) }; C.w = C.x1 - C.x0; const F = P.y1 - 12, top = C.y0 + 30;
  return { W, H, P, C, F, top, n, s:Math.round(clamp(Math.min(C.w*.21, (F - top)*.215), 46, 90)) }; };

/* ---------- the scenes: each is a loop that starts and ends in the same state ---------- */
const SC = [];
const scene = o => SC.push(o);

scene({ k:'browsing', n:'Browsing', c:'Browsing', g:0, url:'fieldnotes.co/shop/notebooks',
  note:'Hops along the shelf and peers up at each notebook in turn, then glances back at you.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g, gap = n ? 10 : 24, cw = Math.min(n ? 999 : 168, (C.w - gap*2)/3), cy1 = F - 1.74*s;
    const chh = clamp(cy1 - top - 30, 96, n ? 150 : 190), cy0 = cy1 - chh, x0 = C.x0 + (C.w - 3*cw - 2*gap)/2;
    Tx(g, x0, cy0 - 14, 'Spring notebooks', 'abh-tx abh-h');
    X.e.cards = [['Ruled', '$18', 'blue'], ['Dot grid', '$18', 'warm'], ['Plain', '$16', 'green']].map(([nm, pr, w], i) => { const x = x0 + i*(cw + gap);
      const fr = Rr(g, x, cy0, cw, chh, 10, 'abh-kp'), wa = Wa(g, x + 7, cy0 + 7, cw - 14, chh*.5, 6, WC(w));
      Tx(g, x + 10, cy0 + chh*.5 + 27, nm, 'abh-tx abh-sm abh-b'); Tx(g, x + 10, cy0 + chh*.5 + 45, pr, 'abh-tx abh-sm abh-mu');
      return { x, cx:x + cw/2, cy:cy0 + chh*.36, fr, wa, hl:new Track(0) }; }); },
  start(X){ return [X.e.cards[0].cx, X.L.F]; },
  script(X){ const a = X.a, c = X.e.cards, F = X.L.F; let T = .15;
    const peer = (i, d, tilt) => { X.at(T, tt => { a.ch.set('curious'); a.ch.look(c[i].cx, c[i].cy, d - .1); a.pose({ bs:.09, ft:tilt }); c[i].hl.set(1, S.base, tt); });
      X.at(T + d - .15, tt => { c[i].hl.set(0, S.soft, tt); a.pose({ bs:null, ft:null }); }); T += d; };
    const go = (i, j) => { X.at(T, () => { a.ch.set('neutral'); a.ch.look(c[j].cx + Math.sign(c[j].cx - c[i].cx)*a.s, F - .7*a.s, .9); }); T += X.walk(c[i].cx, c[j].cx, T) + .05; };
    peer(0, 1.3, -5); go(0, 1); peer(1, 1.3, 5); go(1, 2); peer(2, 1.6, -7);
    X.at(T - .7, () => a.ch.react('happy', .9));
    X.at(T, () => { a.viewer(true); a.ch.react('happy', 1); }); T += 1.1;
    X.at(T, () => a.viewer(false));
    go(2, 0); return T + .5; },
  frame(X, t){ X.e.cards.forEach(c => { const h = c.hl.at(t); c.fr.style.strokeWidth = n2(1.5 + h*1.1); c.wa.style.opacity = `calc(var(--abh-wo) * ${n2(.55 + .45*h)})`; }); } });

scene({ k:'scrolling', n:'Scrolling', c:'Scrolling', g:0, url:'fieldnotes.co/journal',
  note:'Crouches, then pushes the page up with its whole body. The page keeps gliding after it lets go.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g, V = { x0:C.x0, y0:top - 8, x1:C.x1 - 16, y1:F + 6 }, vw = V.x1 - V.x0;
    const id = 'abh-vc' + (++uid), cp = mk('clipPath', { id }, g); Rr(cp, V.x0 - 6, V.y0, vw + 12, V.y1 - V.y0, 0, '');
    const cg = mk('g', {}, mk('g', { 'clip-path':`url(#${id})` }, g)), colX = V.x0 + (n ? 0 : vw*.16), colW = n ? vw : vw*.68;
    let y = V.y0 + 22; const lines = (k, f = 1) => { Ln(cg, colX, y, [.94, .98, .86, .9, .62].slice(0, k).map(q => q*colW*f), 12); y += k*12 + 12; };
    for (let r = 0; r < 2; r++){
      Tx(cg, colX, y, r ? 'Paper weights, explained' : 'Field journal', 'abh-tx abh-h'); y += 14; Ln(cg, colX, y, [colW*.26]); y += 20;
      Wa(cg, colX, y, colW, 1.35*s, 8, WC(r ? 'green' : 'blue')); y += 1.35*s + 16; lines(5);
      Tx(cg, colX, y + 4, r ? 'Why 90 gsm' : 'Notes from the studio', 'abh-tx abh-b'); y += 18; lines(4);
      Wa(cg, colX + colW*.1, y, colW*.8, .9*s, 8, WC(r ? 'lavender' : 'warm')); y += .9*s + 16; lines(5); y += 8; }
    X.e.cg = cg; X.e.V = V; X.e.minOff = -(y - V.y1 + 10); X.e.hook = V.y0 + 22 + 34 + .6*s; X.T.off = new Track(0);
    Pa(g, `M${n2(C.x1 - 4)} ${n2(V.y0 + 4)}V${n2(F - 4)}`, 'abh-ln'); X.e.th = Pa(g, '', 'abh-k abh-thumb');
    X.e.ax = n ? C.x0 + C.w*.34 : colX + colW*.3; },
  start(X){ return [X.e.ax, X.L.F]; },
  script(X){ const a = X.a, e = X.e; let T = .2;
    X.at(0, () => a.ch.set('focused'));
    const push = () => { X.at(T, () => a.ch.look(e.ax + 4, e.V.y0 + 20, .9));
      X.at(T + .2, () => a.pose({ bs:-.24, lean:-.02 }));                                       // gather: crouch low
      X.at(T + .68, tt => { a.pose({ bs:.38, lean:null }); a.ch.S.sy[1] += 6; e.push = { t1:tt + .17, h0:null }; }); // shove: stretch up, page rides the head
      X.at(T + .92, () => { a.pose({ bs:null }); e.follow = true; });
      X.at(T + 2.1, () => { e.follow = false; }); T += 2.35; };
    push(); push();
    X.at(T, () => { a.viewer(true); a.ch.react('happy', 1.1); }); T += 1.25;
    X.at(T, tt => { a.viewer(false); X.T.off.set(0, S.soft, tt); e.follow = true; }); T += 1.3;
    X.at(T, () => { e.follow = false; }); return T + .2; },
  frame(X, t, dt){ const e = X.e, off = X.T.off;
    if (e.push){ const p = e.push, top = X.a.top(); if (p.h0 == null){ p.h0 = top; p.o0 = off.at(t); p.v = 0; p.lo = p.o0; }
      const o = Math.max(e.minOff, p.o0 + Math.min(0, top - p.h0)); if (dt > 0) p.v = lerp(p.v, (o - p.lo)/dt, .5); p.lo = o; off.jump(o);
      if (t >= p.t1){ const v = clamp(p.v*2.7, -1400, 0), w = 2.1; off.release(o, v, Math.max(e.minOff, o + v/w), { w }, t); e.push = null; } }
    const o = off.at(t), V = e.V, vh = V.y1 - V.y0, ch = vh - e.minOff, tl = Math.max(26, (vh - 12)*vh/ch), ty = V.y0 + 4 + (-o/-e.minOff)*(vh - 18 - tl);
    e.cg.setAttribute('transform', `translate(0 ${n2(o)})`); e.th.setAttribute('d', `M${n2(X.L.C.x1 - 4)} ${n2(ty)}V${n2(ty + tl)}`);
    if (e.follow) X.a.ch.look(e.ax + 6, clamp(e.hook + o, V.y0 - 30, X.L.F), .15); } });

scene({ k:'clicking', n:'Clicking', c:'Clicking', g:0, url:'fieldnotes.co/checkout',
  note:'Leans in, steers its cursor onto Apply and presses. The button squashes and the total drops.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g, bh = Math.max(30, .46*s), bw = Math.max(74, s), rowY = F - 1.98*s, fw = n ? C.w - bw - 10 : Math.min(220, C.w*.34);
    const sw = n ? C.w : Math.min(300, C.w*.4); X.e.sum = summary(g, n ? C.x0 : C.x1 - sw, top - 4, sw, { amts:['$48.00', '$43.20'] });
    Tx(g, C.x0, rowY - bh/2 - 9, 'Promo code', 'abh-tx abh-sm abh-mu'); field(g, C.x0, rowY - bh/2, fw, bh, 'SPRING10');
    X.e.btn = button(g, C.x0 + fw + 10 + bw/2, rowY, bw, bh, 'Apply', true);
    const ok = mk('g', {}, g), ny = rowY + bh/2 + 20; Pa(ok, CHK(C.x0 + 1, ny - 6, 1), 'abh-k abh-okc'); Tx(ok, C.x0 + 18, ny, 'SPRING10 applied, −$4.80', 'abh-tx abh-sm abh-okt');
    X.e.ok = ok; X.T.ok = new Track(0); X.e.sw = new Swap(0); X.e.cur = X.prop('cursor'); },
  start(X){ return [X.e.btn.cx - .62*X.a.s, X.L.F]; },
  script(X){ const a = X.a, e = X.e, b = e.btn, cur = e.cur; let T = .1;
    X.at(0, tt => { a.ch.set('focused'); cur.hold([36, -24], 0); e.sw.to(0, tt); X.T.ok.set(0, S.snap, tt); });
    X.at(T, () => a.ch.look(b.cx, b.cy, 1)); T += .45;
    X.at(T, () => { a.pose({ lean:.08, bs:.06 }); cur.to(b.cx + 4, b.cy + 2, -8, 8); }); T += .85;                  // lean in, cursor travels
    X.at(T, tt => { b.p.set(1, S.snap, tt); cur.sc.set(.86, S.snap, tt); a.ch.impulse(.4, 2.8); a.ch.blinkT = tt; });      // press: button and body squash together
    X.at(T + .14, tt => { b.p.set(0, S.base, tt); cur.sc.set(1, S.base, tt); }); T += .32;
    X.at(T, tt => { X.T.ok.set(1, S.base, tt); e.sw.to(1, tt); a.ch.look(e.sum.ax - 20, e.sum.ty - 5, 1.1); a.ch.react('happy', 1.5); a.pose({ lean:null, bs:null }); }); T += 1.25;
    X.at(T, () => cur.hold([36, -24], 0)); T += .5;
    X.at(T, () => { a.viewer(true); a.ch.set('proud'); }); T += 1.1;
    X.at(T, tt => { a.viewer(false); a.ch.set('neutral'); X.T.ok.set(0, S.snap, tt); e.sw.to(0, tt); }); return T + .6; },
  frame(X, t){ const b = X.e.btn, p = b.p.at(t); scl(b.i, 1 - .05*p, 1 - .12*p, p*1.5); b.r.style.fillOpacity = n2(1 - .25*p);
    popEl(X.e.ok, X.T.ok.at(t)); swapIn(X.e.sum.amts, X.e.sw, t); } });

scene({ k:'typing', n:'Typing', c:'Typing', g:0, url:'fieldnotes.co/checkout',
  note:'Taps across the keys one hop at a time. Each landing types a letter, then it admires the result.',
  build(X){ const { C, F, s, n } = X.L, g = X.g, code = 'SPRING10', kg = n ? 3 : 5, kw = Math.min(.56*s, (C.w - 8 - kg*7)/8), kh = Math.max(16, .3*s);
    const kx0 = C.x0 + (n ? (C.w - 8*kw - 7*kg)/2 : 24), fh = Math.max(32, .48*s), fy = F - kh - 2.05*s, fw = Math.min(n ? C.w : 260, C.w);
    Tx(g, C.x0, fy - 9, 'Promo code', 'abh-tx abh-sm abh-mu'); X.e.f = field(g, C.x0, fy, fw, fh, ''); X.e.f.t.classList.add('abh-big');
    X.e.sel = Wa(g, C.x0 + 8, fy + 6, 0, fh - 12, 3, WC('blue')); g.insertBefore(X.e.sel, X.e.f.t); X.e.car = Pa(g, '', 'abh-k abh-car'); X.T.sel = new Track(0);
    if (!n){ const sw = Math.min(300, C.w*.4); summary(g, C.x1 - sw, X.L.top - 4, sw); }
    X.e.keys = [...code].map((ch, i) => { const x = kx0 + i*(kw + kg), [o, k] = ctr(g, x + kw/2, F - kh/2); Rr(k, -kw/2, -kh/2, kw, kh, 5, 'abh-kp'); Tx(k, 0, 4, ch, 'abh-tx abh-sm abh-b', 'middle');
      return { cx:x + kw/2, k, d:new Track(0) }; });
    X.e.kh = kh; X.e.code = code; X.e.n = 0; X.e.shown = -1; },
  start(X){ return [X.e.keys[0].cx, X.L.F - X.e.kh]; },
  script(X){ const a = X.a, e = X.e, K = e.keys, y = X.L.F - e.kh; let T = .2;
    a.ch.onLand = c => { if (!e.on) return; let j = 0; K.forEach((k, i) => { if (Math.abs(k.cx - c.hx) < Math.abs(K[j].cx - c.hx)) j = i; });
      K[j].d.set(1, S.snap, c.t); X.Q.at(c.t + .11, tt => K[j].d.set(0, S.base, tt)); if (j === e.n) e.n++; a.ch.impulse(0, .6); };
    X.at(0, tt => { e.on = true; e.n = 0; X.T.sel.set(0, S.snap, tt); a.ch.set('focused'); a.ch.look(e.f.x + e.f.w/2, e.f.cy, 3.6); });
    leap(X.Q, a, K[0].cx, y, .16*a.s, X.t0 + T); for (let i = 1; i < 8; i++) leap(X.Q, a, K[i].cx, y, .16*a.s, X.t0 + T + i*.36); T += 8*.36 + .25;
    X.at(T, () => { a.ch.look(e.f.x + e.f.w*.4, e.f.cy, 1.4); a.ch.react('happy', 1.4); a.pose({ bs:.05 }); }); T += 1.4;
    X.at(T, () => { a.pose({ bs:null }); a.viewer(true); a.ch.set('proud'); }); T += 1;
    X.at(T, tt => { a.viewer(false); a.ch.set('neutral'); X.T.sel.set(1, S.base, tt); }); T += .55;
    X.at(T, tt => { e.on = false; e.n = 0; X.T.sel.set(0, S.snap, tt); a.ch.look(K[0].cx, y - a.s, .8); });
    leap(X.Q, a, K[0].cx, y, .6*a.s, X.t0 + T + .1); return T + 1.1; },
  frame(X, t){ const e = X.e, f = e.f; e.keys.forEach(k => k.k.setAttribute('transform', `translate(0 ${n2(k.d.at(t)*3)})`));
    if (e.shown !== e.n){ e.shown = e.n; f.t.textContent = e.code.slice(0, e.n); e.tw = e.n ? tw(f.t, e.n*8.4) : 0; }
    const sl = clamp(X.T.sel.at(t)); e.sel.setAttribute('width', n2(e.tw ? (e.tw + 8)*sl : 0)); e.sel.style.opacity = `calc(var(--abh-wo) * ${n2(sl)})`;
    const x = f.x + 12 + e.tw + 2, on = e.on && ((t*1.7) % 1) < .58; e.car.setAttribute('d', on ? `M${n2(x)} ${n2(f.y + 8)}V${n2(f.y + f.h - 8)}` : ''); } });

scene({ k:'inspecting', n:'Inspecting', c:'Inspecting', g:0, url:'fieldnotes.co/checkout',
  note:'Holds its lens up to the heading, then the Pay button. The selection outline snaps to each one.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g, hy = top + 34, hd = Tx(g, C.x0, hy, 'Checkout', 'abh-tx abh-h abh-xl'), hw = tw(hd, 92);
    X.e.hd = { x0:C.x0 - 5, y0:hy - 20, x1:C.x0 + hw + 5, y1:hy + 7 };
    Ln(g, C.x0, hy + 26, n ? [C.w*.8, C.w*.66] : [C.w*.36, C.w*.3], 13);
    const bw = n ? C.w*.6 : Math.min(220, C.w*.26), bh = Math.max(34, .5*s), bx = n ? C.x1 - bw/2 : C.x0 + C.w*.5, by = F - 1.32*s;
    if (!n){ const w = C.w*.3; Rr(g, C.x1 - w, top - 4, w, F - 1.9*s - top, 12, 'abh-kp'); Tx(g, C.x1 - w + 14, top + 22, 'Delivery', 'abh-tx abh-b'); Ln(g, C.x1 - w + 14, top + 44, [w*.7, w*.56, w*.62], 13); }
    X.e.btn = button(g, bx, by, bw, bh, 'Pay $48.00', true); X.e.bb = { x0:bx - bw/2 - 5, y0:by - bh/2 - 5, x1:bx + bw/2 + 5, y1:by + bh/2 + 5 };
    X.e.ol = outline(g, 'h1 · 20px'); X.e.lens = X.prop('lens'); X.e.ax0 = C.x0 + (n ? .62 : .8)*s; X.e.ax1 = n ? X.e.bb.x0 - .1*s : X.e.bb.x0 - .55*s; },
  start(X){ return [X.e.ax0, X.L.F]; },
  script(X){ const a = X.a, e = X.e, L = e.lens, ol = e.ol, H = e.hd, B = e.bb; let T = .1;
    X.at(0, tt => { a.ch.set('focused'); L.hold([38, -24], 0); ol.op.set(0, S.snap, tt); });
    X.at(T, () => { a.pose({ bs:.12 }); L.to((H.x0 + H.x1)/2, (H.y0 + H.y1)/2 + 2, 0, 9); a.ch.look((H.x0 + H.x1)/2, H.y0, 1.6); }); T += .7;
    X.at(T, tt => { const c = L.pos(); ol.label('h1 · 20px'); ol.jump(c[0], c[1], c[0], c[1]); ol.go(H.x0, H.y0, H.x1, H.y1, tt); ol.op.set(1, S.base, tt); a.ch.impulse(0, 1.2); }); T += 1.2;
    X.at(T, tt => { a.pose({ bs:null }); L.hold([38, -26], 0); a.ch.look(B.x0, (B.y0 + B.y1)/2, 1.2); }); T += .15;
    T += X.walk(e.ax0, e.ax1, T);
    X.at(T, () => { a.pose({ bs:.06, lean:.05 }); L.to((B.x0 + B.x1)/2, (B.y0 + B.y1)/2, 0, 9); a.ch.look((B.x0 + B.x1)/2, (B.y0 + B.y1)/2, 1.6); }); T += .45;
    X.at(T, tt => { ol.label('button · 48 tall'); ol.go(B.x0, B.y0, B.x1, B.y1, tt); }); T += .7;
    X.at(T, tt => { L.sc.set(1.25, S.base, tt); a.ch.react('curious', 1); }); T += 1.1;
    X.at(T, tt => { L.sc.set(1, S.base, tt); ol.op.set(0, S.base, tt + .3); L.hold([38, -24], 0); a.unpose(); a.ch.react('happy', 1); a.ch.impulse(0, 2); }); T += 1;
    T += X.walk(e.ax1, e.ax0, T); return T + .4; },
  frame(X, t){ X.e.ol.render(t); } });

scene({ k:'pinning', n:'Pinning', c:'Pinning', g:0, url:'fieldnotes.co/checkout',
  note:'Carries a pin over, hops and plants it where the total sits low, then steps back, proud.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g, sw = n ? C.w : Math.min(320, C.w*.44), sx = n ? C.x0 : C.x0 + C.w*.5 - sw*.15;
    const sm = summary(g, sx, Math.max(top - 4, F - 1.95*s - 136), sw, { drop:4 }); X.e.sm = sm;
    X.e.tgt = [sm.ax - 22, sm.ty - 9]; const tg = mk('g', {}, g), tx = X.e.tgt[0] - (n ? 150 : 158), ty = X.e.tgt[1] - 40;
    Rr(tg, tx, ty, n ? 128 : 136, 24, 6, 'abh-kp'); Tx(tg, tx + 10, ty + 16, 'Total sits 4px low', 'abh-tx abh-sm'); X.e.tag = tg; X.T.tag = new Track(0);
    X.e.ring = mk('ellipse', { class:'abh-k', cx:n2(X.e.tgt[0]), cy:n2(X.e.tgt[1]) }, g); X.T.ring = new Track(0);
    X.e.pin = X.prop('pin'); X.e.ax1 = clamp(X.e.tgt[0] - .25*s, C.x0 + .7*s, C.x1 - .7*s); X.e.ax0 = n ? C.x0 + .7*s : Math.max(C.x0 + .7*s, X.e.ax1 - 2.8*s); },
  start(X){ return [X.e.ax0, X.L.F]; },
  script(X){ const a = X.a, e = X.e, P = e.pin, F = X.L.F, [px, py] = e.tgt; let T = .15;
    X.at(0, tt => { P.hold([36, -20], 0); P.o.set(1, S.base, tt); a.ch.set('determined'); a.ch.look(px, py, 1.4); });
    T += X.walk(e.ax0, e.ax1, T) + .1;
    X.at(T, () => { a.ch.set('focused'); a.ch.look(px, py, 1.4); a.pose({ bs:-.18 }); }); T += .35;
    const h = Math.max(.25*a.s, F - .55*a.s - py - 2*a.u);
    X.at(T, () => a.pose({ bs:null })); leap(X.Q, a, e.ax1, F, h, X.t0 + T);
    X.at(T + .2, () => P.to(px, py - 8, 0, 14)); T += .2 + Math.sqrt(2*h/GRAV);
    X.at(T, tt => { P.to(px, py, 0, 30); P.sc.set(.84, S.snap, tt); X.T.ring.set(1, S.lazy, tt); a.ch.impulse(0, 2.4); });          // plant: pin pressed in at the apex
    X.at(T + .12, tt => { P.fix(); P.sc.set(1, S.base, tt); }); T += .65;
    X.at(T, tt => { a.ch.moveTo(e.ax1 - (X.L.n ? .9 : 1.5)*a.s); a.ch.look(px, py, 2.2); X.T.tag.set(1, S.base, tt + .25); }); T += .7;
    X.at(T, () => a.ch.set('proud')); T += 1.6;
    X.at(T, tt => { P.o.set(0, S.snap, tt); X.T.tag.set(0, S.snap, tt); a.ch.set('neutral'); }); T += .3;
    X.at(T, tt => { X.T.ring.jump(0); P.hold([36, -20], 0); P.st = null; P.o.set(1, S.base, tt + .35); a.ch.moveTo(e.ax0); }); return T + 1.1; },
  frame(X, t){ const r = X.T.ring.at(t), k = X.a.u; X.e.ring.setAttribute('rx', n2(r*12*k)); X.e.ring.setAttribute('ry', n2(r*4*k)); X.e.ring.style.opacity = n2(r < .02 ? 0 : 1 - r);
    popEl(X.e.tag, X.T.tag.at(t)); } });

scene({ k:'capturing', n:'Capturing screenshot', c:'Screenshot', g:0, url:'fieldnotes.co/shop/ruled',
  note:'Stretches tall, then wide, so its corners frame the product card. Flash, and a photo slides out.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g, cw = n ? C.w*.62 : Math.min(250, C.w*.32), ch = Math.min(n ? 150 : 176, F - 1.9*s - top), cx0 = C.x1 - cw - (n ? 0 : C.w*.08), cy0 = F - 1.8*s - ch;
    Tx(g, C.x0, top + 14, 'Ruled notebook', 'abh-tx abh-h'); Ln(g, C.x0, top + 38, n ? [C.w*.5, C.w*.4] : [C.w*.3, C.w*.26, C.w*.2], 13);
    Rr(g, cx0, cy0, cw, ch, 12, 'abh-kp'); Wa(g, cx0 + 8, cy0 + 8, cw - 16, ch*.56, 8, WC('warm')); Tx(g, cx0 + 12, cy0 + ch*.56 + 30, 'A5 · 120 pages', 'abh-tx abh-sm abh-b'); Tx(g, cx0 + 12, cy0 + ch*.56 + 48, '$18', 'abh-tx abh-sm abh-mu');
    X.e.box = { x0:cx0 - 7, y0:cy0 - 7, x1:cx0 + cw + 7, y1:cy0 + ch + 7 }; X.e.fl = Rr(g, cx0, cy0, cw, ch, 12, 'abh-flash'); X.T.fl = new Track(0);
    X.e.br = [0, 1, 2, 3].map(() => ({ p:Pa(X.front, '', 'abh-k abh-brk'), st:null, tg:null, d:0 })); X.T.br = new Track(0); X.e.mode = 'off';
    X.e.ph = X.prop('photo', X.behind); X.T.dev = new Track(0); X.e.ax = n ? C.x0 + C.w*.3 : C.x0 + C.w*.34; },
  start(X){ return [X.e.ax, X.L.F]; },
  script(X){ const a = X.a, e = X.e, B = e.box, ph = e.ph; let T = .1;
    X.at(0, tt => { a.ch.set('focused'); e.mode = 'body'; X.T.br.set(0, S.snap, tt); X.T.dev.jump(0); ph.o.jump(0); ph.hold([0, -30], 0, 30); a.ch.look((B.x0 + B.x1)/2, (B.y0 + B.y1)/2, 1.6); }); T += .3;
    X.at(T, tt => { X.T.br.set(1, S.base, tt); a.pose({ bs:.34 }); }); T += .75;                                        // tall frame
    X.at(T, () => a.pose({ bs:-.24, bl:.6 })); T += .7;                                                                  // wide frame
    X.at(T, tt => { e.mode = 'frame'; e.br.forEach((b, i) => b.d = tt + [0, 1, 3, 2][i]*.05); a.pose({ bs:.02, bl:null }); a.ch.look((B.x0 + B.x1)/2, (B.y0 + B.y1)/2, 1); }); T += .7;
    X.at(T, tt => { X.T.fl.jump(1); X.T.fl.set(0, S.soft, tt); a.ch.blinkT = tt; a.ch.impulse(0, 3.4); a.pose({ bs:null }); }); T += .35;    // shutter
    X.at(T, tt => { e.mode = 'home'; X.T.br.set(0, S.base, tt + .2); ph.o.jump(1); X.T.dev.set(1, { w:2.2 }, tt + .3); ph.hold([0, -84], -4, 7); a.ch.look(a.ch.x, a.top() - 2*a.s, 1.3); }); T += 1;
    X.at(T, tt => { const fx = a.ch.x - (X.L.n ? 0 : 1.2)*a.s, fy = X.L.F - (X.L.n ? 2.3 : 1.35)*a.s; ph.to(fx, fy, -6, 7); ph.sc.set(1.45, S.soft, tt); a.ch.react('happy', 1.6); a.ch.look(fx, fy, 1.6); }); T += 1.9;
    X.at(T, tt => { ph.o.set(0, S.snap, tt); e.mode = 'off'; a.ch.set('neutral'); }); X.at(T + .3, () => ph.sc.jump(1)); return T + .7; },
  frame(X, t, dt){ const e = X.e, a = X.a, B = e.box, o = clamp(X.T.br.at(t)), k = a.u;
    X.e.fl.style.opacity = n2(clamp(X.T.fl.at(t))*.92);
    const dv = n2(clamp(X.T.dev.at(t))); $$(e.ph.g, '.abh-dev').forEach(d => d.style.opacity = dv);
    const corners = e.mode === 'frame' ? [[B.x0, B.y0], [B.x1, B.y0], [B.x1, B.y1], [B.x0, B.y1]] : [a.pt(-31, -58), a.pt(31, -58), a.pt(31, 4), a.pt(-31, 4)];
    const arm = e.mode === 'frame' ? Math.min(20, (B.x1 - B.x0)*.16) : 9*k, sg = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
    e.br.forEach((b, i) => { const tg = corners[i]; if (!b.st || e.mode !== 'frame' && e.mode !== 'home') b.st = [tg[0], 0, tg[1], 0];
      else if (t >= b.d){ const w = e.mode === 'frame' ? 16 : 20, x = cdv(b.st[0], b.st[1], tg[0], w, dt), y = cdv(b.st[2], b.st[3], tg[1], w, dt); b.st = [x[0], x[1], y[0], y[1]]; }
      const [x, y] = [b.st[0], b.st[2]], [sx, sy] = sg[i];
      b.p.setAttribute('d', o < .01 ? '' : `M${n2(x)} ${n2(y + sy*arm)}V${n2(y)}H${n2(x + sx*arm)}`); b.p.style.opacity = n2(o); }); } });

scene({ k:'comparing', n:'Comparing versions', c:'Comparing', g:0, url:'fieldnotes.co/checkout · v12 and v13',
  note:'Looks from v12 to v13 and back, does a double take, and marks the one row that moved.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g, gap = n ? 12 : Math.max(40, C.w*.12), cw = Math.min(250, (C.w - gap)/2), ch = Math.min(170, F - 1.85*s - top - 6), y0 = F - 1.8*s - ch, x0 = C.x0 + (C.w - 2*cw - gap)/2;
    X.e.cards = ['v12', 'v13'].map((v, i) => { const x = x0 + i*(cw + gap), cg = mk('g', {}, g); Tx(cg, x, y0 - 10, v, 'abh-tx abh-sm abh-b');
      Rr(cg, x, y0, cw, ch, 10, 'abh-kp'); Ln(cg, x + 12, y0 + 22, [cw*.5, cw*.7, cw*.6], 14);
      const ty = y0 + ch - 26 + (i ? 9 : -2), mk_ = Wa(cg, x + 6, ty - 13, cw - 12, 20, 5, WC('rose')); Tx(cg, x + 12, ty + 1, 'Total', 'abh-tx abh-sm abh-b'); Tx(cg, x + cw - 12, ty + 1, i ? '$43.20' : '$48.00', 'abh-tx abh-sm abh-b', 'end');
      return { x, cx:x + cw/2, cy:y0 + ch*.45, mk:mk_, ty, ex:i ? x + 6 : x + cw - 6 }; });
    const [A, B] = X.e.cards, my = Math.min(A.ty, B.ty) - (n ? 34 : 42); X.e.link = Pa(g, `M${n2(A.ex)} ${n2(A.ty - 4)}C${n2(A.ex + 20)} ${n2(my)} ${n2(B.ex - 20)} ${n2(my)} ${n2(B.ex)} ${n2(B.ty - 4)}`, 'abh-k abh-dash');
    X.T.mk = new Track(0); X.T.ln = new Track(0); X.e.ax = (A.x + cw + B.x)/2; },
  start(X){ return [X.e.ax, X.L.F]; },
  script(X){ const a = X.a, [A, B] = X.e.cards; let T = .15;
    const lk = (c, d, ft) => { X.at(T, () => { a.ch.look(c.cx, c.cy, d); a.pose({ ft, lean:ft*.008 }); }); T += d; };
    X.at(0, () => a.ch.set('focused')); lk(A, .9, -5); lk(B, .9, 5); lk(A, .42, -6); lk(B, .5, 6);
    X.at(T, tt => { a.ch.react('curious', .9); a.pose({ ft:null, lean:null }); X.T.mk.set(1, S.base, tt); X.T.ln.set(1, S.lazy, tt + .15); }); T += .8;
    X.at(T, () => { a.ch.set('thinking'); a.ch.look(X.e.ax, A.ty - 40, 1.1); }); T += 1.1;
    X.at(T, () => { a.ch.impulse(0, 2.2); a.viewer(true); a.ch.set('happy'); }); T += 1.1;
    X.at(T, tt => { a.viewer(false); a.ch.set('neutral'); X.T.mk.set(0, S.base, tt); X.T.ln.set(0, S.base, tt); }); return T + .7; },
  frame(X, t){ const m = clamp(X.T.mk.at(t)), l = clamp(X.T.ln.at(t)); X.e.cards.forEach(c => c.mk.style.opacity = `calc(var(--abh-wo) * ${n2(m)})`);
    X.e.link.style.strokeDashoffset = n2((1 - l)*400); X.e.link.style.opacity = n2(l > .01 ? 1 : 0); } });

scene({ k:'thinking', n:'Thinking', c:'Thinking', g:0, url:'fieldnotes.co/checkout',
  note:'The arc on its antenna turns while it glances between three ideas and settles on one.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g, opts = ['Nudge the total up', 'Match the v12 spacing', 'Ask Maya first'];
    const ow = n ? C.w*.78 : Math.min(200, (C.w - 40)/3), oh = 40, y0 = n ? top : Math.max(top, F - 2.05*s - oh - 30);
    X.e.opts = opts.map((s_, i) => { const x = n ? C.x0 + (i % 2 ? C.w - ow : 0) : C.x0 + i*(ow + 20) + (C.w - 3*ow - 40)/2, y = n ? y0 + i*(oh + 14) : y0 + (i === 1 ? -16 : 0);
      const fr = Rr(g, x, y, ow, oh, 10, 'abh-kp abh-opt'), t = Tx(g, x + 14, y + 25, s_, 'abh-tx abh-sm'), ck = Pa(g, CHK(x + ow - 26, y + 18, 1), 'abh-k abh-okc');
      return { x, y, cx:x + ow/2, cy:y + oh/2, fr, ck, hl:new Track(0) }; });
    X.T.pick = new Track(0); X.e.ax = n ? C.x0 + C.w*.5 : C.x0 + C.w*.5; },
  start(X){ return [X.e.ax, X.L.F]; },
  script(X){ const a = X.a, o = X.e.opts; let T = .1;
    X.at(0, tt => { a.ch.set('thinking'); X.T.pick.set(0, S.snap, tt); });
    [[0, 1.1], [2, 1.1], [1, .9]].forEach(([i, d]) => { X.at(T, tt => { a.ch.look(o[i].cx, o[i].cy, d); o[i].hl.set(1, S.base, tt); }); X.at(T + d - .1, tt => o[i].hl.set(0, S.soft, tt)); T += d; });
    X.at(T, () => { a.pose({ ft:-9 }); a.ch.look(a.ch.x + a.s, a.top() - 1.2*a.s, .9); }); T += .9;
    X.at(T, tt => { a.pose({ ft:null }); a.ch.react('curious', .7); a.ch.look(o[1].cx, o[1].cy, 1.6); o[1].hl.set(1, S.base, tt); X.T.pick.set(1, S.base, tt + .2); }); T += .8;
    X.at(T, () => a.ch.react('happy', 1)); T += 1.2;
    X.at(T, tt => { o[1].hl.set(0, S.base, tt); X.T.pick.set(0, S.base, tt); a.ch.set('thinking'); }); return T + .5; },
  frame(X, t){ const p = clamp(X.T.pick.at(t)); X.e.opts.forEach((o, i) => { const h = o.hl.at(t); o.fr.style.strokeOpacity = n2(.35 + .65*h); o.fr.style.strokeWidth = n2(1.3 + h*.6 + (i === 1 ? p*.6 : 0));
    o.ck.style.opacity = n2(i === 1 ? p : 0); o.ck.style.strokeDashoffset = n2((1 - p)*24); }); } });

scene({ k:'suggesting', n:'Suggesting edit', c:'Suggesting', g:1, url:'fieldnotes.co/shipping',
  note:'Its pencil strikes through one word and writes the new one above it, as a suggestion.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g; Tx(g, C.x0, top + 14, 'Shipping', 'abh-tx abh-h abh-xl'); Ln(g, C.x0, top + 40, n ? [C.w*.84, C.w*.7] : [C.w*.5, C.w*.44], 13);
    const y = F - 1.9*s, a = Tx(g, C.x0, y, 'Free shipping on orders over ', 'abh-tx abh-para'), aw = tw(a, 200), w = Tx(g, C.x0 + aw, y, '$50', 'abh-tx abh-para'), ww = tw(w, 26);
    Tx(g, C.x0 + aw + ww, y, '.', 'abh-tx abh-para'); Ln(g, C.x0, y + 24, n ? [C.w*.9, C.w*.5] : [C.w*.46, C.w*.3], 14);
    X.e.w = { x0:C.x0 + aw - 1, x1:C.x0 + aw + ww + 1, y };
    X.e.st = Pa(g, `M${n2(X.e.w.x0)} ${n2(y - 5)}H${n2(X.e.w.x1)}`, 'abh-k abh-strike');
    const id = 'abh-wc' + (++uid), cp = mk('clipPath', { id }, g); X.e.cr = Rr(cp, X.e.w.x0, y - 40, 0, 30, 0, '');
    const ng = mk('g', { 'clip-path':`url(#${id})` }, g); Tx(ng, X.e.w.x0 + 1, y - 19, '$40', 'abh-tx abh-para abh-sug'); Pa(ng, `M${n2(X.e.w.x0)} ${n2(y - 14)}H${n2(X.e.w.x0 + ww + 4)}`, 'abh-k abh-sugl');
    X.e.nw = ww + 6; X.T.st = new Track(0); X.T.nw = new Track(0); X.T.op = new Track(1); X.e.ng = ng; X.e.pen = X.prop('pencil'); X.e.ax0 = C.x0 + .8*s; X.e.ax1 = clamp((X.e.w.x0 + X.e.w.x1)/2 - .9*s, C.x0 + .8*s, C.x1 - .8*s); },
  start(X){ return [X.e.ax0, X.L.F]; },
  script(X){ const a = X.a, e = X.e, W = e.w, pen = e.pen; let T = .1;
    X.at(0, tt => { a.ch.set('focused'); pen.hold([36, -20], 0); X.T.st.jump(0); X.T.nw.jump(0); X.T.op.jump(1); a.ch.look(X.L.C.x0 + 20, W.y - 8, .8); });
    X.at(.8, () => a.ch.look(W.x0, W.y - 8, 1.2)); T = .8;
    if (Math.abs(e.ax1 - e.ax0) > 4) X.at(T, () => a.ch.moveTo(e.ax1)); T += 1;
    X.at(T, () => { pen.to(W.x0, W.y - 5, 0, 12); a.pose({ lean:.05 }); }); T += .45;
    X.at(T, tt => { e.mode = 'strike'; X.T.st.set(1, S.soft, tt); a.ch.look(W.x1, W.y, .8); }); T += .7;
    X.at(T, () => { e.mode = null; pen.to(W.x0 + 2, W.y - 22, 0, 12); }); T += .4;
    X.at(T, tt => { e.mode = 'write'; X.T.nw.set(1, S.lazy, tt); a.ch.look(W.x1, W.y - 22, 1.2); }); T += 1.15;
    X.at(T, () => { e.mode = null; pen.hold([36, -20], 0); a.pose({ lean:null }); a.ch.moveTo(e.ax1 - .5*a.s); a.ch.look(W.x0 + 10, W.y - 22, 1.4); a.ch.set('proud'); }); T += 1.7;
    X.at(T, tt => { X.T.op.set(0, S.base, tt); a.ch.set('neutral'); }); T += .45;
    X.at(T, tt => { X.T.st.jump(0); X.T.nw.jump(0); X.T.op.set(1, S.snap, tt); a.ch.moveTo(e.ax0); }); return T + .9; },
  frame(X, t){ const e = X.e, W = e.w, st = clamp(X.T.st.at(t)), nw = clamp(X.T.nw.at(t)), op = clamp(X.T.op.at(t));
    e.st.style.strokeDashoffset = n2((1 - st)*60); e.st.style.opacity = n2(st > .01 ? op : 0); e.cr.setAttribute('width', n2(e.nw*nw)); e.ng.style.opacity = n2(op);
    if (e.mode === 'strike') e.pen.to(W.x0 + (W.x1 - W.x0)*st, W.y - 5, 0, 30);
    if (e.mode === 'write') e.pen.to(W.x0 + 2 + e.nw*nw, W.y - 22 + Math.sin(t*38)*2.2*(1 - nw), 0, 30); } });

scene({ k:'asking', n:'Asking permission', c:'Asking', g:1, url:'fieldnotes.co/shipping',
  note:'Turns to you and holds up a question. It waits, calmly, until you allow or deny the edit.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g; Tx(g, C.x0, top + 14, 'Shipping', 'abh-tx abh-h abh-xl'); Ln(g, C.x0, top + 40, n ? [C.w*.84, C.w*.7] : [C.w*.5, C.w*.44], 13);
    const y = n ? top + 104 : top + 92, a = Tx(g, C.x0, y, 'Free shipping on orders over ', 'abh-tx abh-para'), aw = tw(a, 200);
    const oldG = mk('g', {}, g), ow = tw(Tx(oldG, C.x0 + aw, y, '$50', 'abh-tx abh-para'), 26); X.e.stk = Pa(g, `M${n2(C.x0 + aw - 1)} ${n2(y - 5)}H${n2(C.x0 + aw + ow + 1)}`, 'abh-k abh-strike');
    const newG = mk('g', {}, g), nt = Tx(newG, C.x0 + aw, y - 19, '$40', 'abh-tx abh-para abh-sug'); Pa(newG, `M${n2(C.x0 + aw - 1)} ${n2(y - 14)}H${n2(C.x0 + aw + ow + 5)}`, 'abh-k abh-sugl');
    const dot = Tx(g, C.x0 + aw + ow, y, '.', 'abh-tx abh-para'); X.e.old = oldG; X.e.nw = newG; X.e.nt = nt; X.e.dot = dot; X.e.y = y; X.e.aw = C.x0 + aw;
    Ln(g, C.x0, y + 24, n ? [C.w*.9, C.w*.5] : [C.w*.46, C.w*.3], 14);
    X.T.res = new Track(0); X.e.card = X.prop('card'); X.e.ax = n ? C.x0 + C.w*.3 : C.x0 + C.w*.3; X.e.ans = null; },
  start(X){ return [X.e.ax, X.L.F]; },
  script(X){ const a = X.a, e = X.e, cd_ = e.card; let T = .1; e.ans = null; e.wait = false;
    X.at(0, tt => { a.ch.set('focused'); cd_.hold([34, -18], 0); X.T.res.set(0, S.snap, tt); X.ask(0, tt); a.ch.look(e.aw + 10, e.y - 20, 1); }); T += 1.1;
    X.at(T, tt => { a.viewer(true); a.ch.impulse(0, 1.4); a.ch.set('waiting'); a.quiet = false; cd_.hold([30, -84], -5, 11); }); T += .6;
    X.at(T, tt => { e.wait = true; X.ask(1, tt); }); return T + 1e6; },
  answer(X, yes, tt){ const a = X.a, e = X.e; if (!e.wait) return; e.wait = false; X.ask(0, tt); a.quiet = true;
    X.Q.clear();
    if (yes){ a.ch.set('delighted'); X.T.res.set(1, S.base, tt + .25); X.later(tt + .3, () => { a.viewer(false); e.card.hold([34, -18], 0); a.ch.look(e.aw + 10, e.y - 10, 1.2); }); X.later(tt + 1.6, () => a.ch.set('proud')); }
    else { a.ch.set('apologetic'); a.ch.impulse(0, 1.6); X.T.res.set(-1, S.base, tt + .3); X.later(tt + .5, () => { a.viewer(false); e.card.hold([34, -18], 0); }); X.later(tt + 1.8, () => a.ch.set('neutral')); }
    X.later(tt + 3.2, t2 => X.restart(t2)); },
  frame(X, t){ const e = X.e, r = X.T.res.at(t), y = clamp(r), n = clamp(-r);
    e.old.style.opacity = n2(1 - y); e.stk.style.opacity = n2((1 - y)*(1 - n)); e.nw.style.opacity = n2(1 - n); e.nt.classList.toggle('abh-sugk', y > .5);
    e.nw.setAttribute('transform', `translate(0 ${n2(19*y)})`); $$(e.nw, 'path').forEach(p => p.style.opacity = n2(1 - y)); } });

scene({ k:'handing', n:'Handing off', c:'Handing off', g:1, url:'fieldnotes.co/review',
  note:'Carries the finished review to Maya, holds it out, lets go once she has it, and steps back.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g; Tx(g, C.x0, top + 14, 'Review: checkout', 'abh-tx abh-h'); Ln(g, C.x0, top + 40, n ? [C.w*.8, C.w*.6, C.w*.7] : [C.w*.4, C.w*.34, C.w*.38], 13);
    X.e.hu = X.human(1.12*s, 'warm'); X.e.hx = C.x1 - (n ? .55 : 1.4)*s; X.e.hu.place(X.e.hx, F); X.e.doc = X.prop('doc');
    X.e.ax0 = n ? C.x0 + .7*s : C.x0 + C.w*.2; X.e.ax1 = X.e.hx - (n ? 1.45 : 1.65)*s; },
  start(X){ return [X.e.ax0, X.L.F]; },
  script(X){ const a = X.a, e = X.e, H = e.hu, D = e.doc; let T = .15;
    X.at(0, tt => { D.hold([36, -20], 0); D.o.set(1, S.base, tt); a.ch.set('happy'); a.ch.look(...H.head(), 1.4); H.tilt.set(0, S.base, tt); H.nod.set(0, S.base, tt); });
    T += X.walk(e.ax0, e.ax1, T) + .15;
    X.at(T, () => { a.pose({ lean:.09, bs:.05 }); D.to((a.ch.x + H.x[0])/2 + .1*a.s, X.L.F - .75*a.s, 8, 8); a.ch.look(...H.head(), 1.4); }); T += .6;
    X.at(T, tt => H.tilt.set(-5, S.base, tt)); T += .35;
    X.at(T, tt => { D.to(H.x[0] - .05*a.s, X.L.F - .62*H.s, -4, 10); H.nod.set(3, S.base, tt); a.pose({ lean:null, bs:null }); a.ch.react('delighted', .9); }); T += .6;   // let go
    X.at(T, tt => { H.tilt.set(0, S.base, tt); H.nod.set(0, S.base, tt); a.ch.moveTo(e.ax1 - .6*a.s); }); T += .7;
    X.at(T, tt => { a.viewer(true); a.ch.set('proud'); H.nod.set(4, S.lazy, tt); }); T += 1.2;
    X.at(T, tt => { a.viewer(false); a.ch.set('neutral'); D.o.set(0, S.base, tt); H.nod.set(0, S.base, tt); }); T += .4;
    X.at(T, tt => { D.st = null; D.hold([36, -20], 0); D.o.set(1, S.base, tt + .2); }); T += .2;
    T += X.walk(e.ax1 - .6*a.s, e.ax0, T); return T + .4; } });

scene({ k:'taking', n:'Taking over', c:'Taking over', g:1, url:'fieldnotes.co/checkout',
  note:'Maya steps in. The agent notices, makes room with a small bow and watches her finish.',
  build(X){ const { C, F, s, n } = X.L, g = X.g, fh = Math.max(32, .48*s), fy = F - 2.05*s - fh, fw = n ? C.w : Math.min(320, C.w*.46);
    Tx(g, C.x0, fy - 9, 'Delivery note', 'abh-tx abh-sm abh-mu'); X.e.f = field(g, C.x0, fy, fw, fh, ''); X.e.txt = ['Leave at the side door', 'Ring twice, please'];
    if (!n){ const sw = Math.min(300, C.w*.4); summary(g, C.x1 - sw, X.L.top - 4, sw); }
    X.e.hu = X.human(1.12*s, 'peach'); X.e.out = X.L.P.x1 + .8*s; X.e.hu.place(X.e.out, F); X.e.ax = n ? C.x0 + C.w*.55 : C.x0 + fw*.62; X.e.aside = n ? C.x0 + .65*s : C.x0 + .7*s; X.e.k = 0; X.e.who = 0; },
  start(X){ return [X.e.ax, X.L.F]; },
  script(X){ const a = X.a, e = X.e, H = e.hu, f = e.f; let T = .2;
    X.at(0, tt => { a.ch.set('focused'); e.k = 0; e.who = 0; e.on = 1; H.go(e.out, 30); a.ch.look(f.x + f.w*.4, f.cy, 2); });
    for (let i = 0; i < 5; i++) X.at(T + i*.24, () => { e.k++; a.ch.impulse(0, .9); }); T += 1.3;
    X.at(T, tt => { H.go(e.ax + 1.3*a.s, 6); }); T += .45;
    X.at(T, () => { a.ch.react('surprised', .35); a.ch.look(...H.head(), 1.4); }); T += .55;
    X.at(T, tt => { a.ch.set('happy'); a.pose({ gy:.6, gw:.8, fy:1.6 }); a.ch.impulse(0, 2.2); }); T += .5;             // a small bow
    X.at(T, tt => { a.pose({ gy:null, gw:null, fy:null }); leap(X.Q, a, e.aside, X.L.F, .16*a.s, tt); }); T += .7;
    X.at(T - .45, () => H.go(e.ax + .1*a.s, 6)); X.at(T, tt => { a.ch.set('waiting'); e.who = 1; e.k = 0; a.op.set(.62, S.lazy, tt); }); T += .6;
    for (let i = 0; i < 6; i++) X.at(T + i*.2, tt => { e.k++; H.nod.set(i % 2 ? 0 : 2, S.snap, tt); });
    X.at(T, () => a.ch.look(...H.head(), 1.6)); T += 1.6;
    X.at(T, tt => { H.nod.set(0, S.base, tt); H.tilt.set(-6, S.base, tt); a.ch.look(f.x + f.w*.5, f.cy, 1); }); T += .9;
    X.at(T, tt => { H.tilt.set(0, S.base, tt); H.go(e.out, 5); a.op.set(1, S.base, tt); a.ch.set('neutral'); a.ch.look(e.out, X.L.F - a.s, 1.2); }); T += 1.3;
    X.at(T, tt => { e.on = 0; e.k = 0; }); leap(X.Q, a, e.ax, X.L.F, .2*a.s, X.t0 + T + .05); return T + .9; },
  frame(X, t){ const e = X.e, s = e.on ? e.txt[e.who].slice(0, Math.round(e.k*(e.who ? 3.6 : 2.4))) : ''; if (e.f.t.textContent !== s) e.f.t.textContent = s; } });

scene({ k:'retrying', n:'Retrying', c:'Retrying', g:2, url:'fieldnotes.co/preview',
  note:'Jumps for the Reload button and falls short, worried. Gathers itself, determined, and makes it.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g, lw = n ? 1.5*s : 1.9*s, lh = .95*s, lx = C.x1 - lw;
    const pw = n ? C.w : C.w*.62, ph = Math.min(n ? 150 : 200, F - lh - 1.9*s - top), px = n ? C.x0 : C.x1 - pw, py = n ? top : top;
    Rr(g, px, py, pw, ph, 12, 'abh-kp abh-dashr'); X.e.pc = mk('g', {}, g); Wa(X.e.pc, px + 10, py + 10, pw*.42, ph - 20, 8, WC('blue')); Ln(X.e.pc, px + pw*.42 + 24, py + 26, [pw*.4, pw*.3, pw*.36, pw*.2], 14);
    X.e.msg = Tx(g, px + pw/2, py + ph/2 + 4, 'Preview could not load', 'abh-tx abh-sm abh-mu', 'middle'); X.T.ld = new Track(0); X.e.pv = [px + pw/2, py + ph/2];
    X.e.btn = button(g, lx + lw/2, F - lh/2, lw, lh, 'Reload', true); X.e.lx = lx; X.e.lw = lw; X.e.lh = lh;
    X.e.ax0 = lx - (n ? 1.75 : 2.6)*s; },
  start(X){ return [X.e.ax0, X.L.F]; },
  script(X){ const a = X.a, e = X.e, F = X.L.F, b = e.btn, top = F - e.lh, s = a.s; let T = .2;
    X.at(0, tt => { a.ch.set('focused'); X.T.ld.set(0, S.snap, tt); e.on = false; a.ch.look(b.cx, top - 10, 1.4);
      a.ch.onLand = c => { if (e.on && c.floor < F - 2){ b.p.set(1, S.snap, c.t); X.Q.at(c.t + .16, tt => b.p.set(0, S.base, tt)); X.T.ld.set(1, S.lazy, c.t + .25); } }; });
    X.at(T, () => a.pose({ bs:-.1 })); T += .3;
    const fx = e.lx - .62*s; X.at(T, () => a.pose({ bs:null })); leap(X.Q, a, fx, F, .62*e.lh, X.t0 + T); T += .09 + 2*Math.sqrt(2*.62*e.lh/GRAV);
    X.at(T - .12, () => { a.ch.S.hs[1] -= 4; a.ch.react('surprised', .3); });                          // brushes the edge
    X.at(T, () => { a.ch.impulse(-1.4, 1.5); a.ch.set('worried'); a.ch.look(b.cx, top - 6, 1.2); }); T += 1.05;                // stumble, worried
    X.at(T, () => { a.ch.moveTo(fx - .9*s); }); T += .75;
    X.at(T, () => { a.ch.set('determined'); a.ch.look(b.cx, top - 8, 2); a.pose({ bs:-.24 }); }); T += .65;                       // gather
    X.at(T, () => { a.pose({ bs:null }); e.on = true; }); leap(X.Q, a, b.cx, top, .5*s, X.t0 + T); T += 1;
    X.at(T, () => { a.ch.react('delighted', .8); }); T += .9;
    X.at(T, () => { a.ch.set('happy'); a.ch.look(e.pv[0], e.pv[1], 1.2); }); T += 1.1;
    X.at(T, tt => { e.on = false; a.ch.set('neutral'); X.T.ld.set(0, S.base, tt); }); leap(X.Q, a, e.ax0, F, .4*s, X.t0 + T + .1); return T + 1.1; },
  frame(X, t){ const b = X.e.btn, p = b.p.at(t), l = clamp(X.T.ld.at(t)); scl(b.i, 1 + .03*p, 1 - .1*p, p*b.h*.05); X.e.pc.style.opacity = n2(l); X.e.msg.style.opacity = n2(1 - l); } });

scene({ k:'done', n:'Done', c:'Done', g:2, url:'fieldnotes.co/review',
  note:'Watches the last check land on the list, then does a delighted little hop.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g, items = ['Layout matches v12', 'Promo code works', 'Total is correct'];
    const w = n ? C.w : Math.min(300, C.w*.42), x = n ? C.x0 : C.x1 - w - C.w*.04, rh = 34, h = 44 + rh*3, y = Math.max(top, F - (n ? 2.1 : 1.6)*s - h);
    Rr(g, x, y, w, h, 12, 'abh-kp'); Tx(g, x + 14, y + 26, 'Checkout review', 'abh-tx abh-b');
    X.e.it = items.map((s_, i) => { const yy = y + 44 + i*rh; Rr(g, x + 14, yy, 18, 18, 4, 'abh-kp'); Tx(g, x + 42, yy + 13.5, s_, 'abh-tx abh-sm');
      const c = Pa(g, CHK(x + 17.5, yy + 9, .95), 'abh-k abh-okc abh-ck'); return { c, x:x + 23, y:yy + 9, t:new Track(0) }; });
    const ty = Math.max(X.L.top - 6, y - 50); X.e.toast = mk('g', {}, g); const tw_ = 150; Rr(X.e.toast, x + w - tw_, ty, tw_, 30, 15, 'abh-bi');
    Pa(X.e.toast, CHK(x + w - tw_ + 14, ty + 14, .8), 'abh-k abh-inv-k'); Tx(X.e.toast, x + w - tw_ + 32, ty + 19.5, 'Review finished', 'abh-tx abh-sm abh-b abh-inv'); X.T.toast = new Track(0);
    X.e.ax = n ? C.x0 + C.w*.3 : x - 1.2*s; },
  start(X){ return [X.e.ax, X.L.F]; },
  script(X){ const a = X.a, e = X.e; let T = .2;
    X.at(0, tt => { a.ch.set('focused'); e.it.forEach(i => i.t.set(0, S.snap, tt)); X.T.toast.set(0, S.snap, tt); });
    e.it.forEach((it, i) => { X.at(T, tt => { a.ch.look(it.x + 60, it.y, .8); it.t.set(1, S.soft, tt + .25); a.ch.impulse(0, .8); }); T += .8; });
    X.at(T, tt => { a.ch.set('delighted'); X.T.toast.set(1, S.base, tt + .15); a.viewer(true); }); T += 1.3;
    X.at(T, () => a.ch.set('proud')); T += 1.3;
    X.at(T, tt => { a.viewer(false); a.ch.set('neutral'); X.T.toast.set(0, S.base, tt); e.it.forEach((i, k) => i.t.set(0, S.base, tt + k*.06)); }); return T + .8; },
  frame(X, t){ X.e.it.forEach(i => { const p = clamp(i.t.at(t)); i.c.style.strokeDashoffset = n2((1 - p)*22); i.c.style.opacity = n2(p > .01 ? 1 : 0); }); popEl(X.e.toast, X.T.toast.at(t), -4); } });

scene({ k:'failed', n:'Failed', c:'Failed', g:2, url:'fieldnotes.co/preview',
  note:'Watches the preview stall and fail, then turns to you, apologetic, its antenna drooping.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g, pw = n ? C.w : Math.min(420, C.w*.56), ph = Math.min(170, F - 1.95*s - top), px = n ? C.x0 : C.x1 - pw - C.w*.04, py = F - 1.85*s - ph;
    Rr(g, px, py, pw, ph, 12, 'abh-kp'); X.e.ld = mk('g', {}, g); Tx(X.e.ld, px + 16, py + 30, 'Loading preview', 'abh-tx abh-sm abh-mu');
    Pa(X.e.ld, `M${n2(px + 16)} ${n2(py + ph/2 + 4)}H${n2(px + pw - 16)}`, 'abh-ln'); X.e.bar = Pa(X.e.ld, '', 'abh-k abh-thumb'); X.e.bx = [px + 16, px + pw - 16]; X.e.by = py + ph/2 + 4;
    X.e.err = mk('g', {}, g); Pa(X.e.err, `M${n2(px + pw/2 - 8)} ${n2(py + ph/2 - 26)}l16 16m0 -16l-16 16`, 'abh-k abh-errk'); Tx(X.e.err, px + pw/2, py + ph/2 + 16, 'Preview did not load', 'abh-tx abh-b abh-errt', 'middle');
    Tx(X.e.err, px + pw/2, py + ph/2 + 36, 'The server stopped answering', 'abh-tx abh-sm abh-mu', 'middle');
    X.T.p = new Track(0); X.T.err = new Track(0); X.e.ax = n ? C.x0 + C.w*.32 : px - 1.1*s; },
  start(X){ return [X.e.ax, X.L.F]; },
  script(X){ const a = X.a, e = X.e; let T = .2;
    X.at(0, tt => { a.ch.set('focused'); X.T.p.set(0, S.snap, tt); X.T.err.set(0, S.snap, tt); a.ch.look(e.bx[0] + 30, e.by, 1); });
    X.at(T, tt => { X.T.p.set(.72, S.lazy, tt); }); X.at(T + .4, () => a.ch.look(e.bx[0] + (e.bx[1] - e.bx[0])*.7, e.by, 1.6)); T += 1.9;
    X.at(T, () => a.ch.set('worried')); T += .8;
    X.at(T, tt => { X.T.err.set(1, S.base, tt); a.ch.react('surprised', .35); }); T += .7;
    X.at(T, () => { a.viewer(true); a.ch.set('apologetic'); }); T += .9;
    X.at(T, () => { a.pose({ gx:-.4, gy:.7, gw:.95, ft:-6 }); a.ch.impulse(0, 1); }); T += 1;
    X.at(T, () => a.pose({ gx:0, gy:0, gw:1, ft:null })); T += .9;
    X.at(T, tt => { a.viewer(false); a.ch.set('neutral'); X.T.err.set(0, S.base, tt); X.T.p.set(0, S.base, tt); }); return T + .7; },
  frame(X, t){ const e = X.e, p = clamp(X.T.p.at(t)), r = clamp(X.T.err.at(t)); e.bar.setAttribute('d', p > .01 ? `M${n2(e.bx[0])} ${n2(e.by)}H${n2(e.bx[0] + (e.bx[1] - e.bx[0])*p)}` : '');
    e.ld.style.opacity = n2(1 - r); popEl(e.err, r); } });

scene({ k:'offline', n:'Offline', c:'Offline', g:2, url:'fieldnotes.co/review',
  note:'The connection drops. It grows sleepy and dims, calmly, until the page is back.',
  build(X){ const { C, F, s, n, top, P } = X.L, g = X.g; X.e.pg = mk('g', {}, g);
    Tx(X.e.pg, C.x0, top + 14, 'Review: checkout', 'abh-tx abh-h'); Ln(X.e.pg, C.x0, top + 40, n ? [C.w*.8, C.w*.6, C.w*.7] : [C.w*.4, C.w*.34, C.w*.38], 13);
    if (!n){ const w = Math.min(300, C.w*.4); Rr(X.e.pg, C.x1 - w, top, w, F - 1.9*s - top, 12, 'abh-kp'); Wa(X.e.pg, C.x1 - w + 10, top + 10, w - 20, (F - 1.9*s - top)*.5, 8, WC('lavender')); }
    const cx = P.x1 - 24; X.e.chip = [['Offline', 'abh-dot'], ['Back online', 'abh-dot abh-dotok']].map(([s_, c]) => { const cg = mk('g', {}, g), tx = Tx(cg, cx, P.y0 + 20, s_, 'abh-tx abh-xs abh-b', 'end'), w = tw(tx, s_.length*6);
      mk('circle', { cx:n2(cx - w - 9), cy:n2(P.y0 + 16), r:3.2, class:c }, cg); return cg; });
    X.T.dim = new Track(0); X.e.sw = new Swap(-1); X.e.ax = n ? C.x0 + C.w*.4 : C.x0 + C.w*.3; },
  start(X){ return [X.e.ax, X.L.F]; },
  script(X){ const a = X.a, e = X.e; let T = .6;
    X.at(0, tt => { a.ch.set('neutral'); e.sw.to(-1, tt); X.T.dim.set(0, S.snap, tt); });
    X.at(T, tt => { e.sw.to(0, tt); X.T.dim.set(1, S.lazy, tt); a.ch.react('confused', .9); a.ch.look(X.L.P.x1 - 60, X.L.P.y0 + 16, .9); }); T += 1.1;
    X.at(T, tt => { a.ch.set('sleepy'); a.op.set(.5, S.lazy, tt); a.viewer(true); }); T += 3.4;
    X.at(T, tt => { e.sw.to(1, tt); X.T.dim.set(0, S.base, tt); a.op.set(1, S.base, tt); a.viewer(false); a.ch.blinkT = tt; a.ch.react('surprised', .3); }); T += .5;
    X.at(T, () => a.ch.set('happy')); T += 1.3;
    X.at(T, tt => { e.sw.to(-1, tt); a.ch.set('neutral'); }); return T + .6; },
  frame(X, t){ const d = X.T.dim.at(t); X.e.pg.style.opacity = n2(1 - .62*d); X.e.chip.forEach((c, i) => X.e.sw.apply(c, i, t, 3)); } });

scene({ k:'blocked', n:'Blocked', c:'Blocked', g:2, url:'fieldnotes.co/settings/billing',
  note:'Pushes against the locked door, twice. Gives up, steps back and looks to you for help.',
  build(X){ const { C, F, s, n, top } = X.L, g = X.g, dw = n ? 1.2*s : 1.3*s, dh = Math.min(2.25*s, F - top - 34), dx = n ? C.x1 - dw - 2 : C.x0 + C.w*.62;
    Tx(g, C.x0, top + 14, 'Settings', 'abh-tx abh-h abh-xl'); Ln(g, C.x0, top + 40, n ? [C.w*.6, C.w*.5] : [C.w*.32, C.w*.26], 13);
    Tx(g, dx + dw/2, F - dh - 12, 'Billing', 'abh-tx abh-sm abh-b', 'middle');
    Pa(g, `M${n2(dx - 8)} ${n2(F)}V${n2(F - dh - 2)}Q${n2(dx - 8)} ${n2(F - dh - 2)} ${n2(dx - 6)} ${n2(F - dh - 2)}H${n2(dx + dw + 6)}V${n2(F)}`, 'abh-k abh-hair');
    const [o, d] = ctr(g, dx + dw/2, F); X.e.dd = d; const r = Math.min(14, dw*.2);
    Pa(d, `M${n2(-dw/2)} 0V${n2(-dh + r)}Q${n2(-dw/2)} ${n2(-dh)} ${n2(-dw/2 + r)} ${n2(-dh)}H${n2(dw/2 - r)}Q${n2(dw/2)} ${n2(-dh)} ${n2(dw/2)} ${n2(-dh + r)}V0Z`, 'abh-kp');
    Rr(d, -dw/2 + 9, -dh + 10, dw - 18, dh*.36, 5, 'abh-k abh-hair'); Rr(d, -dw/2 + 9, -dh*.5 + 4, dw - 18, dh*.5 - 14, 5, 'abh-k abh-hair');
    const lk = mk('g', { transform:`translate(${n2(-dw/2 + 18)} ${n2(-dh*.5)}) scale(1.25)` }, d); X.e.sk = Pa(lk, 'M-5 -2V-7C-5 -13 5 -13 5 -7V-2', 'abh-k abh-wrn'); Rr(lk, -8, -2, 16, 13, 3, 'abh-kp abh-wrn'); mk('circle', { cy:4.5, r:1.6, class:'abh-wrnf' }, lk);
    const tg = mk('g', {}, g), tx = n ? C.x0 : dx - 186, ty = n ? top + 74 : F - dh + 6; Rr(tg, tx, ty, 170, 26, 6, 'abh-kp'); Tx(tg, tx + 10, ty + 17, 'Needs the owner’s approval', 'abh-tx abh-xs'); X.e.tag = tg;
    X.T.tag = new Track(0); X.T.sk = new Track(0); X.T.give = new Track(0); X.e.dx = dx; X.e.ax0 = n ? C.x0 + .8*s : C.x0 + C.w*.3; X.e.ax1 = dx - .66*s; },
  start(X){ return [X.e.ax0, X.L.F]; },
  script(X){ const a = X.a, e = X.e, s = a.s, back = e.ax1 - (X.L.n ? .55 : 1.1)*s; let T = .15;
    X.at(0, tt => { a.ch.set('determined'); X.T.tag.set(0, S.snap, tt); a.ch.look(e.dx + 10, X.L.F - s, 1.4); });
    T += X.walk(e.ax0, e.ax1, T) + .1;
    const shove = k => { X.at(T, () => { a.pose({ lean:-.05, bs:-.1 }); a.ch.moveTo(e.ax1 - .06*s); }); T += .3;                    // wind up
      X.at(T, tt => { a.pose({ lean:.24*k, bs:-.07, bl:.4 }); a.ch.moveTo(e.ax1 + .1*s*k); a.ch.impulse(.8*k, 1.4*k); X.T.give.set(2.4*k, S.snap, tt + .1); X.T.sk.set(1, S.snap, tt + .12); });
      X.at(T + .26, tt => { X.T.sk.set(0, S.snap, tt); }); X.at(T + .55, tt => { X.T.give.set(0, S.base, tt); a.ch.moveTo(e.ax1); a.pose({ lean:.1, bl:.2 }); }); T += .85; };
    shove(1); X.at(T - .25, () => a.ch.react('confused', .4)); shove(1.3);
    X.at(T, () => { a.pose({ lean:null, bs:-.08, bl:null }); a.ch.set('worried'); }); T += .75;                                     // gives up: deflates
    X.at(T, tt => { a.pose({ bs:null }); a.ch.moveTo(back); X.T.tag.set(1, S.base, tt + .3); a.ch.look(e.dx, X.L.F - s, .8); }); T += 1;
    X.at(T, () => { a.viewer(true); a.ch.set('waiting'); }); T += 2;
    X.at(T, tt => { a.viewer(false); a.ch.set('neutral'); X.T.tag.set(0, S.base, tt); }); T += .3;
    T += X.walk(back, e.ax0, T); return T + .4; },
  frame(X, t){ const e = X.e; e.dd.setAttribute('transform', `translate(${n2(X.T.give.at(t))} 0)`); e.sk.setAttribute('transform', `translate(0 ${n2(-3*X.T.sk.at(t))})`); popEl(e.tag, X.T.tag.at(t)); } });

const GROUPS = ['Doing', 'With people', 'How it ends'];
// picker order: doing, then the people beats, then outcomes
const ORDER = ['browsing', 'scrolling', 'clicking', 'typing', 'inspecting', 'pinning', 'capturing', 'comparing', 'thinking', 'suggesting', 'asking', 'handing', 'taking', 'retrying', 'done', 'failed', 'offline', 'blocked'];
SC.sort((a, b) => ORDER.indexOf(a.k) - ORDER.indexOf(b.k));

const CSS = `
.abh-svg{--abh-paper:#fffaf2;--abh-ink:#1d1d1b;--abh-wo:.85;--abh-fl:#ffffff}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .abh-svg{--abh-paper:#1c2026;--abh-ink:#e4e0d6;--abh-wo:.16;--abh-fl:#e4e0d6}}
:root[data-theme="dark"] .abh-svg{--abh-paper:#1c2026;--abh-ink:#e4e0d6;--abh-wo:.16;--abh-fl:#e4e0d6}
.abh-svg .abh-fr{fill:var(--abh-paper);stroke:var(--abh-ink);stroke-width:1.5}
.abh-svg .abh-k{fill:none;stroke:var(--abh-ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.abh-svg .abh-kp{fill:var(--abh-paper);stroke:var(--abh-ink);stroke-width:1.5;stroke-linejoin:round}
.abh-svg .abh-hair{stroke-width:1;opacity:.35}
.abh-svg .abh-pill{fill:none;stroke:var(--abh-ink);stroke-width:1;opacity:.28}
.abh-svg .abh-ln{fill:none;stroke:var(--abh-ink);stroke-width:1.6;stroke-linecap:round;opacity:.24}
.abh-svg .abh-wa{opacity:var(--abh-wo)}
.abh-svg .abh-tx{fill:var(--abh-ink);font-family:var(--sans);font-size:13px}
.abh-svg .abh-sm{font-size:12px}.abh-svg .abh-xs{font-size:11px}
.abh-svg .abh-b{font-weight:600}
.abh-svg .abh-h{font-size:16px;font-weight:600;letter-spacing:-.01em}
.abh-svg .abh-xl{font-size:20px}
.abh-svg .abh-para{font-size:14px}
.abh-svg .abh-mu{opacity:.62}
.abh-svg .abh-url{font-family:var(--mono);font-size:10.5px;fill:var(--abh-ink);opacity:.55}
.abh-svg .abh-mono{font-family:var(--mono);font-size:13px}.abh-svg .abh-big{font-size:14px}
.abh-svg .abh-bi{fill:var(--abh-ink);stroke:var(--abh-ink);stroke-width:1.5}
.abh-svg .abh-inv{fill:var(--abh-paper)}.abh-svg .abh-inv-k{stroke:var(--abh-paper)}
.abh-svg .abh-okc{stroke:var(--success);stroke-width:2;stroke-dasharray:22}.abh-svg .abh-okt{fill:var(--success)}
.abh-svg .abh-errk{stroke:var(--danger);stroke-width:2}.abh-svg .abh-errt{fill:var(--danger)}
.abh-svg .abh-wrn{stroke:var(--warning)}.abh-svg .abh-wrnf{fill:var(--warning)}
.abh-svg .abh-thumb{stroke-width:3.4}
.abh-svg .abh-car{stroke-width:1.5}
.abh-svg .abh-sel{fill:none;stroke:var(--abh-ink);stroke-width:1.3;stroke-dasharray:4 3}
.abh-svg .abh-hd{fill:var(--abh-paper);stroke:var(--abh-ink);stroke-width:1.2}
.abh-svg .abh-tag{fill:var(--abh-ink)}.abh-svg .abh-tagt{fill:var(--abh-paper);font-family:var(--mono);font-size:10.5px}
.abh-svg .abh-strike{stroke-width:1.8;stroke-dasharray:60}
.abh-svg .abh-sug{fill:var(--accent);font-weight:600}.abh-svg .abh-sugk{fill:var(--abh-ink)}
.abh-svg .abh-sugl{stroke:var(--accent);stroke-width:1.3;stroke-dasharray:3 3}
.abh-svg .abh-dash{stroke-dasharray:400;stroke-width:1.4}
.abh-svg .abh-dashr{stroke-dasharray:5 4}
.abh-svg .abh-flash{fill:var(--abh-fl);stroke:none;opacity:0}
.abh-svg .abh-brk{stroke-width:2.2}
.abh-svg .abh-dot{fill:var(--abh-ink);opacity:.55}.abh-svg .abh-dotok{fill:var(--success);opacity:1}
.abh-svg .abh-pk{fill:none;stroke:var(--abh-ink);stroke-linecap:round;stroke-linejoin:round}
.abh-svg .abh-pkp{fill:var(--abh-paper);stroke:var(--abh-ink);stroke-linecap:round;stroke-linejoin:round}
.abh-svg .abh-pkf{fill:var(--abh-ink);stroke:var(--abh-ink)}
.abh-svg .abh-pkw{stroke:var(--abh-ink);fill-opacity:.7}
.abh-svg .abh-thk{stroke-width:2.6}
.abh-svg .abh-pnum{fill:var(--abh-paper);font-family:var(--sans);font-size:8.5px;font-weight:700;stroke:none}
.abh-svg .abh-pq{fill:var(--abh-ink);font-family:var(--sans);font-size:14px;font-weight:700;stroke:none}
.abh-svg .abh-hw{opacity:var(--abh-wo);stroke:none}
.abh-svg .abh-hsh{fill:var(--abh-ink);opacity:.09}
.abh-svg .abh-opt{stroke-opacity:.35}
.abh-svg .abh-cur{fill:var(--abh-paper);stroke:var(--abh-ink);stroke-width:1.5;stroke-linejoin:round}
.abh-svg .abh-cpill{fill:var(--abh-ink)}.abh-svg .abh-cname{fill:var(--abh-paper);font-family:var(--sans);font-size:11px;font-weight:600}
.abh-svg .abh-pkc{display:none;fill:none;stroke:var(--abh-paper);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.abh-svg .abh-res .abh-pkf{fill:var(--accent);stroke:var(--accent)}.abh-svg .abh-res .abh-pnum{display:none}.abh-svg .abh-res .abh-pkc{display:inline}
.abh-wr{position:absolute;inset:0;container-type:inline-size;text-align:left}
.abh-a{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1fr) 272px}
.abh-sc{position:relative;min-width:0;min-height:0;display:flex;flex-direction:column}
.abh-cap{flex:none;padding:12px 16px 8px}
.abh-l{position:relative;height:28px;margin-right:170px}.abh-l>span{position:absolute;left:0;top:0;font-size:20px;font-weight:600;letter-spacing:-.02em;white-space:nowrap}
.abh-n{position:relative;height:38px;max-width:60ch}.abh-n>span{position:absolute;inset:0;font-size:13px;line-height:1.45;color:var(--muted)}
.abh-tb{position:absolute;top:10px;right:12px;display:flex;gap:6px;z-index:3}
.abh-tb .btn{display:inline-flex;align-items:center;gap:6px;height:32px}
.abh-tb .btn[aria-pressed=true]{background:var(--ink);color:var(--card);border-color:var(--ink)}
.abh-vw{position:relative;flex:1;min-height:0}
.abh-vw>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.abh-ask{position:absolute;left:0;top:0;display:flex;gap:6px;visibility:hidden}
.abh-ask .btn{height:32px}
.abh-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;margin:0}
.abh-pk{display:flex;flex-direction:column;gap:14px;padding:14px 14px 16px;border-left:1px solid var(--line);overflow-y:auto;min-height:0}
.abh-gh{margin:0 0 7px;font-size:12px;font-weight:600;color:var(--muted)}
.abh-gr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}
.abh-pk button{display:flex;align-items:center;gap:7px;min-width:0;height:32px;border:1px solid var(--line);background:var(--card);border-radius:8px;padding:0 8px;font-size:12.5px;font-weight:500;color:var(--muted);cursor:pointer;text-align:left}
.abh-pk button span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.abh-pk button svg{flex:none;display:block}
.abh-pk button[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:var(--card)}
@container (max-width:880px){.abh-a{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto}
  .abh-pk{flex-direction:row;gap:6px;padding:10px 12px;border-left:0;border-top:1px solid var(--line);overflow-x:auto;overflow-y:hidden;scrollbar-width:none;scroll-padding-inline:12px}
  .abh-pk::-webkit-scrollbar{display:none}.abh-gp,.abh-gr{display:contents}.abh-gh{display:none}.abh-pk button{flex:none}}
@container (max-width:520px){.abh-l{margin-right:84px}.abh-n{height:58px}.abh-l>span{font-size:17px}.abh-tb span{display:none}.abh-tb .btn{width:34px;padding:0;justify-content:center}}
.abh-du{position:absolute;inset:0;container-type:inline-size;text-align:left;display:flex;flex-direction:column}
.abh-du .abh-cap{padding:12px 16px 6px}
.abh-du .abh-st{position:relative;height:40px;margin:2px 140px 0 0}.abh-du .abh-st>span{position:absolute;inset:0;font-size:13px;line-height:1.45;color:var(--muted)}
.abh-hit{position:absolute;border:0;background:none;padding:0;margin:0;border-radius:14px;cursor:grab;touch-action:none;z-index:2;-webkit-tap-highlight-color:transparent}
.abh-hit:active{cursor:grabbing}.abh-hit:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
@container (max-width:520px){.abh-du .abh-st{height:58px;margin-right:0}}`;
let cssOn = false;
const injectCss = () => { if (cssOn) return; cssOn = true; const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); };
const RESET = '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>', TOUR = '<path d="M6 5v14l11-7z"/>';

/* ---------- a stage: svg layers, page chrome, an actor, and the scene runner ---------- */
const stage = (vw, svg, o) => {
  const g = n => mk('g', { class:n }, svg), chromeG = g('abh-chr'), cid = 'abh-pc' + (++uid), cp = mk('clipPath', { id:cid }, svg), clipR = Rr(cp, 0, 0, 0, 0, 0, '');
  const contentL = mk('g', { 'clip-path':`url(#${cid})` }, svg), behind = g('abh-bh'), agentL = g('abh-ag'), front = g('abh-fn');
  return { chromeG, clipR, contentL, behind, agentL, front };
};

atom({ id:'agentbehaviours', cat:'Agent identity', name:'Agent behaviours', block:'AgentCharacter, AgentActivity (proposed)', fam:['M','S','T'], wide:true, tall:true,
  html:`<div class="abh-wr"><div class="abh-a"><div class="abh-sc"><div class="abh-cap"><div class="abh-l" aria-hidden="true"></div><div class="abh-n" aria-hidden="true"></div><p class="abh-sr" aria-live="polite"></p></div>
<div class="abh-tb"><button type="button" class="btn abh-tour" aria-pressed="false" aria-label="Tour all behaviours">${ic(TOUR, 15)}<span>Tour</span></button><button type="button" class="btn abh-rp" aria-label="Replay">${ic(RESET, 15)}<span>Replay</span></button></div>
<div class="abh-vw"><svg class="abh-svg" aria-hidden="true"></svg><div class="abh-ask" role="group" aria-label="The agent asks: apply the suggested edit?"><button type="button" class="btn ink abh-yes">Allow</button><button type="button" class="btn abh-no">Deny</button></div></div></div>
<div class="abh-pk" role="group" aria-label="Behaviour"></div></div></div>`,
  desc:'One agent performs eighteen behaviours inside a small web page, each a short loop that ends where it began. It hops to get around and every landing squashes and recovers without bouncing. What it carries trails its body and tilts against the motion. It leans into whatever it pushes, and its face changes mood brows first, then lids, then mouth. The page answers on the same clock: a button squashes, an outline snaps leading edge first, a pin goes in, text is struck through. Asking permission waits for your real Allow or Deny.',
  api:'actor.leap(x, floor) → crouch, ballistic arc aimed through the landing slide, squash  ·  prop.hold(side) | prop.to(x, y)  ·  scene: cues [t, fn] → Track/Swap on the page',
  init(st){
    if (!globalThis.AgentRig) return () => {};
    injectCss();
    const vw = $(st,'.abh-vw'), svg = $(vw,'svg'), lab = $(st,'.abh-l'), note = $(st,'.abh-n'), live = $(st,'.abh-sr'), pk = $(st,'.abh-pk'), tourB = $(st,'.abh-tour'), ask = $(st,'.abh-ask');
    const Lr = stage(vw, svg), Q = queue(), actor = new Actor(Lr.agentL, { size:72, wash:'blue', seed:5.3, expression:'neutral' });
    const AI = globalThis.AgentActionIcons, ICON = { capturing:'capturing', comparing:'comparing', suggesting:'suggesting', asking:'asking', handing:'handing', taking:'taking' };
    const capSw = new Swap(0), caps = SC.map(sc => { const a = document.createElement('span'); a.textContent = sc.n; lab.appendChild(a); const b = document.createElement('span'); b.textContent = sc.note; note.appendChild(b); return [a, b]; });
    const urlG = mk('g', {}, svg); svg.insertBefore(urlG, Lr.contentL); const urlSw = new Swap(0); let urls = [];
    // picker: grouped, with each behaviour's own action icon (from the action icon lane when it is on the page)
    const btns = [];
    GROUPS.forEach((gn, gi) => { const gp = document.createElement('div'), h = document.createElement('p'), gr = document.createElement('div'); gp.className = 'abh-gp'; h.className = 'abh-gh'; h.textContent = gn; gr.className = 'abh-gr'; gp.append(h, gr); pk.appendChild(gp);
      SC.forEach((sc, i) => { if (sc.g !== gi) return; const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', sc.n);
        const d = AI && AI.list.find(x => x.k === (ICON[sc.k] || sc.k)); if (d){ b.insertAdjacentHTML('beforeend', `<svg width="16" height="16" viewBox="0 0 64 64" aria-hidden="true">${AI.inline(d, { size:16, u:0 })}</svg>`); b.ad = d; }
        const sp = document.createElement('span'); sp.textContent = sc.c; b.appendChild(sp); b.onclick = () => pick(i); gr.appendChild(b); btns[i] = b; }); });
    pk.addEventListener('keydown', e => { const d = { ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1 }[e.key]; if (!d) return; e.preventDefault(); const k = (cur + d + SC.length) % SC.length; pick(k); btns[k].focus(); });
    let L = null, cur = 0, X = null, old = [], loopEnd = 0, tour = false, lastT = 0, iconT = 0;
    const askT = new Track(0);
    const mkX = (sc, t) => { const x = { sc, L, a:actor, Q, e:{}, T:{}, props:[], humans:[], g:mk('g', { class:'abh-cg' }, Lr.contentL), front:mk('g', {}, Lr.front), behind:Lr.behind, op:new Track(0), t0:t };
      x.at = (dt, fn) => Q.at(x.t0 + dt, fn); x.later = (tt, fn) => Q.at(tt, fn); x.walk = (x0, x1, dt) => walk(Q, actor, x0, x1, x.t0 + dt);
      x.prop = (k, layer) => { const p = new Prop(layer || Lr.front, actor, k); x.props.push(p); return p; };
      x.human = (s, w) => { const h = new Human(x.g, s, w); x.humans.push(h); return h; };
      x.ask = (v, tt) => askT.set(v, v ? S.base : S.snap, tt); x.restart = tt => loop(tt, true); return x; };
    const drop = x => { x.g.remove(); x.front.remove(); x.props.forEach(p => p.remove()); };
    const retire = (x, t) => { if (!x) return; x.out = t; x.op.set(0, { w:60 }, t); x.props.forEach(p => p.o.set(0, S.snap, t)); old.push(x); };
    const begin = (i, t, fresh) => {
      Q.clear(); retire(X, t); cur = i; const sc = SC[i];
      actor.unpose(); actor.quiet = true; actor.ch.onLand = null; actor.ch.forced = null; actor.ch.lookAt(null); actor.op.set(1, S.base, t); actor.ch.set('neutral');
      X = mkX(sc, t); sc.build(X); X.props.forEach(p => { p.o.jump(0); p.o.set(1, S.base, t + .15); });
      const [x0, y0] = sc.start(X), c = actor.ch; let d = .25;
      if (fresh || RMQ) c.moveTo(x0, y0, true);
      else if (Math.abs(c.x - x0) > 3 || Math.abs(c.y - y0) > 2 || c.mode !== 'ground'){ leap(Q, actor, x0, y0, Math.max(.3*actor.s, c.y - y0 + .25*actor.s), t + .05); d = .8; }
      X.op.jump(fresh ? 1 : 0); if (!fresh) X.op.set(1, S.base, t + EXIT);
      askT.set(0, S.snap, t); X.t0 = t + d; X.len = sc.script(X); loopEnd = X.t0 + Math.min(X.len, tour ? 7 : 1e9);
      capSw.to(i, t); urlSw.to(i, t); live.textContent = `${sc.n}. ${sc.note}`; iconT = t;
      btns.forEach((b, j) => b.setAttribute('aria-pressed', j === i)); const b = btns[i], pr = pk.getBoundingClientRect(), br = b.getBoundingClientRect();
      if (br.left < pr.left || br.right > pr.right) pk.scrollLeft += br.left - pr.left - 12; };
    const loop = (t, again) => { if (tour && !again){ begin((cur + 1) % SC.length, t); return; }
      Q.clear(); actor.unpose(); actor.quiet = true; X.t0 = t; X.len = X.sc.script(X); loopEnd = X.t0 + X.len; };
    const pick = i => { if (tour){ tour = false; tourB.setAttribute('aria-pressed', 'false'); } begin(i, now()); };
    tourB.onclick = () => { tour = !tour; tourB.setAttribute('aria-pressed', tour); if (tour) begin((cur + 1) % SC.length, now()); };
    $(st,'.abh-rp').onclick = () => begin(cur, now());
    $(ask,'.abh-yes').onclick = () => X.sc.answer && X.sc.answer(X, true, now());
    $(ask,'.abh-no').onclick = () => X.sc.answer && X.sc.answer(X, false, now());
    const layout = () => { const W = vw.clientWidth, H = vw.clientHeight; if (!W || !H || (L && L.W === W && L.H === H)) return;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); L = LAYOUT(W, H); chrome(Lr.chromeG, L);
      const P = L.P; Lr.clipR.setAttribute('x', P.x0 + 1); Lr.clipR.setAttribute('y', P.y0 + 33); Lr.clipR.setAttribute('width', P.x1 - P.x0 - 2); Lr.clipR.setAttribute('height', P.y1 - P.y0 - 34);
      urlG.replaceChildren(); urls = SC.map(sc => Tx(urlG, P.x0 + 24, P.y0 + 19.5, sc.url, 'abh-url'));
      actor.ch.setSize(L.s); actor.ch.setBounds(P.x0, P.x1, -1e4);
      old.forEach(drop); old = []; if (X){ drop(X); X = null; }
      begin(cur, now(), true); };
    new ResizeObserver(layout).observe(vw); layout(); if (document.fonts) document.fonts.ready.then(() => { L = null; layout(); });
    let lp = -9; const ptr = { x:0, y:0, t:-9 };
    vw.addEventListener('pointermove', e => { const r = svg.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.t = now(); });
    return t => {
      if (!X) return;
      // the tile was off screen while the clock ran on: start the scene over rather than fire every overdue cue at once
      if (lastT && t - lastT > .3){ lastT = t; begin(cur, t, true); }
      const dt = clamp(t - lastT, 0, .05); lastT = t;
      Q.drain(t); if (t >= loopEnd) loop(t);
      if (ptr.t !== lp && t - ptr.t < 2){ lp = ptr.t; actor.ch.lookAt(ptr.x, ptr.y); }
      actor.render(t);
      for (const x of [...old, X]){ x.props.forEach(p => p.update(t, dt)); x.humans.forEach(h => h.update(t, dt)); const o = clamp(x.op.at(t)), os = o > .995 ? '' : o.toFixed(3); x.g.style.opacity = os; x.front.style.opacity = os; }
      X.sc.frame && X.sc.frame(X, t, dt);
      old = old.filter(x => { if (t - x.out > .4){ drop(x); return false; } return true; });
      caps.forEach(([a, b], i) => { capSw.apply(a, i, t, 6); capSw.apply(b, i, t, 4); }); urls.forEach((u, i) => urlSw.apply(u, i, t, 3));
      const ak = askT.at(t); popH(ask, ak, 6);
      if (ak > .01 && X.sc.k === 'asking'){ const c = X.e.card.pos(), u = actor.u, w = ask.offsetWidth, x0 = clamp(c[0] + 18*u, L.P.x0 + 8, L.P.x1 - w - 8); ask.style.left = px(x0); ask.style.top = px(c[1] - 22*u); }
      ask.style.zIndex = 4; $$(ask, 'button').forEach(b => b.tabIndex = ak > .5 ? 0 : -1);
      const b = btns[cur]; if (b && b.ad){ const u = ((t - iconT) % b.ad.L + b.ad.L) % b.ad.L, sv = b.firstChild; if (sv && sv.tagName === 'svg') sv.innerHTML = AI.inline(b.ad, { size:16, u }); }
    };
  } });

/* ---------- the duet: two agents and a person's cursor on one page ---------- */
const DUET_ST = ['Review agent is reading the checkout page.', 'Review agent spotted the total sitting 6px low.', 'Review agent pinned it.', 'Review agent hands the pin over to Fix agent.',
  'Fix agent is moving the total back into line.', 'Fixed. Review agent looks pleased.', 'Maya checks the fix and resolves the pin.', 'Both agents are delighted.', 'Starting the next pass.',
  'Review agent was picked up. Fix agent stops to watch.', 'Fix agent was picked up. Review agent stops to watch.', 'Back to work, from where they left off.'];
const cursorG = (layer, name) => { const g = mk('g', { class:'abh-cu' }, layer), i = mk('g', {}, g); Pa(i, 'M0 0V17.5L4.4 13.4L7.3 19.8L10.4 18.5L7.6 12.3H13.6Z', 'abh-cur');
  const pl = mk('g', { transform:'translate(12 20)' }, i), t = Tx(pl, 22, 15, name, 'abh-cname'), w = tw(t, 30) + 30; Rr(pl, 0, 0, w, 22, 11, 'abh-cpill'); pl.appendChild(t);
  mk('circle', { cx:11, cy:11, r:6.5, class:'abh-kp' }, pl); Tx(pl, 11, 14.5, name[0], 'abh-tx abh-xs abh-b', 'middle');
  return { g, i, st:null, tg:[0, 0], sc:new Track(1), o:new Track(0), w:5,
    to(x, y, w = 5){ this.tg = [x, y]; this.w = w; }, put(x, y){ this.st = [x, 0, y, 0]; this.tg = [x, y]; }, pos(){ return [this.st[0], this.st[2]]; },
    update(t, dt){ if (!this.st) this.put(...this.tg); else if (!RMQ){ const a = cdv(this.st[0], this.st[1], this.tg[0], this.w, dt), b = cdv(this.st[2], this.st[3], this.tg[1], this.w, dt); this.st = [a[0], a[1], b[0], b[1]]; } else this.put(...this.tg);
      const o = clamp(this.o.at(t)); g.setAttribute('transform', `translate(${n2(this.st[0])} ${n2(this.st[2])}) scale(${n2(this.sc.at(t))})`); g.style.opacity = o > .995 ? '' : o.toFixed(3); g.style.visibility = o < .01 ? 'hidden' : ''; } }; };

atom({ id:'agentduet', cat:'Agent identity', name:'Agent duet', block:'AgentCharacter, AgentActivity, Presence (proposed)', fam:['M','D','S','T'], wide:true, tall:true,
  html:`<div class="abh-du"><div class="abh-cap"><div class="abh-l"><span>Review, fix, resolve</span></div><div class="abh-st" aria-live="polite"></div></div>
<div class="abh-tb"><button type="button" class="btn abh-rp">${ic(RESET, 15)}Replay</button></div><div class="abh-vw"><svg class="abh-svg" aria-hidden="true"></svg></div></div>`,
  desc:'Two agents and Maya’s cursor work one checkout page. The review agent lifts its lens to the total, the outline snaps around it, and it plants a pin. It turns to the fix agent, they catch each other’s eye, and the note flies across on a spring. The fix agent hops over, its pencil nudges the total back into line, and the reviewer watches and smiles. Maya’s cursor comes in, both agents look up at it, and her click resolves the pin. They hop, staggered. Drag either agent to interrupt: the other stops to watch, and once it lands they pick up the beat they were on.',
  api:'beats[i] = { enter: state(i), run(tt) }  ·  grab → Q.clear(), other.watch(dragged)  ·  landed + .8s → ensure(state(i)), run beat i again',
  init(st){
    if (!globalThis.AgentRig) return () => {};
    injectCss();
    const vw = $(st,'.abh-vw'), svg = $(vw,'svg'), stEl = $(st,'.abh-st'), Lr = stage(vw, svg), Q = queue();
    const R1 = new Actor(Lr.agentL, { size:64, wash:'blue', seed:2.2, expression:'neutral', droop:-1 }), F1 = new Actor(Lr.agentL, { size:60, wash:'green', seed:7.7, expression:'neutral', droop:1 });
    R1.name = 'Review agent'; F1.name = 'Fix agent'; const AG = [R1, F1];
    const stSw = new Swap(0), stLy = DUET_ST.map(s_ => { const e = document.createElement('span'); e.textContent = s_; stEl.appendChild(e); return e; });
    const say = (i, t) => stSw.to(i, t);
    let L = null, D = null, beat = 0, beatEnd = 0, intr = null, lastT = 0;
    const urlT = mk('g', {}, svg); svg.insertBefore(urlT, Lr.contentL);
    const hits = AG.map(a => { const b = document.createElement('button'); b.type = 'button'; b.className = 'abh-hit'; vw.appendChild(b);
      b.setAttribute('aria-label', `${a.name}. Drag it to interrupt. Enter pokes it, arrow keys toss it.`);
      const loc = e => { const r = svg.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      let s0 = null, smp = [];
      b.addEventListener('pointerdown', e => { if (e.button) return; e.preventDefault(); b.setPointerCapture(e.pointerId); const p = loc(e); s0 = { x:p[0], y:p[1], t:now(), moved:false }; smp = [{ t:now(), x:p[0], y:p[1] }]; a.ch.grab(p[0], p[1]); });
      b.addEventListener('pointermove', e => { if (!s0) return; const p = loc(e); if (Math.hypot(p[0] - s0.x, p[1] - s0.y) > 5) s0.moved = true; smp.push({ t:now(), x:p[0], y:p[1] }); smp = smp.filter(q => now() - q.t < .1); a.ch.drag(p[0], p[1]); });
      const end = () => { if (!s0) return; const q0 = smp[0] || s0, z = smp[smp.length - 1] || s0, dt = Math.max(.016, z.t - q0.t);
        if (!s0.moved){ a.ch.release(0, 0); if (now() - s0.t < .5) a.ch.poke(); } else a.ch.release(now() - z.t > .08 ? 0 : (z.x - q0.x)/dt, now() - z.t > .08 ? 0 : (z.y - q0.y)/dt); s0 = null; };
      b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end); b.addEventListener('click', e => { if (e.detail === 0) a.ch.poke(); });
      b.addEventListener('keydown', e => { const k = e.key, f = a.ch.size*7; if (k === 'ArrowLeft' || k === 'ArrowRight'){ e.preventDefault(); a.ch.throw((k === 'ArrowLeft' ? -1 : 1)*f*.9, -f*1.1); }
        else if (k === 'ArrowUp'){ e.preventDefault(); a.ch.throw(0, -f*1.4); } });
      return b; });
    // the page and everything on it; rebuilt on resize
    const build = t => {
      if (D){ D.g.remove(); D.props.forEach(p => p.remove()); D.cur.g.remove(); }
      const { C, F, n, top } = L, g = mk('g', {}, Lr.contentL), s2 = Math.round(clamp(Math.min(L.s*.92, C.w*.19), 44, 80));
      R1.ch.setSize(s2); F1.ch.setSize(Math.round(s2*.94)); AG.forEach(a => a.ch.setBounds(L.P.x0, L.P.x1, -1e4));
      const sw = n ? C.w : Math.min(330, C.w*.42), sy = Math.max(top - 4, F - (n ? 2.3 : 2.05)*s2 - 128), sm = summary(g, n ? C.x0 : C.x0 + (C.w - sw)/2, sy, sw, { drop:0 });
      const amt = sm.amts[0], aw = tw(amt, 46), tg = [sm.ax - aw - 8, sm.ty - 5], box = { x0:sm.x + 8, y0:sm.ty - 18, x1:sm.x + sw - 8, y1:sm.ty + 10 };
      const head = [sm.x + 70, sm.y + 22], ring = mk('ellipse', { class:'abh-k', cx:n2(tg[0]), cy:n2(tg[1]) }, g);
      const D_ = { g, sm, amt, aw, tg, box, head, ring, ringT:new Track(0), drop:new Track(6), op:new Track(1), ol:outline(g, 'total · 6px low'), props:[], res:false, watchCur:false,
        R0:n ? C.x0 + .62*s2 : Math.max(C.x0 + .7*s2, sm.x - .1*s2), F0:n ? C.x1 - .62*s2 : Math.min(C.x1 - .7*s2, sm.x + sw + .5*s2) }; D_.ol.label('total · 6px low');
      D_.R1 = clamp(tg[0] - .45*s2, D_.R0, D_.F0 - 1.7*s2); D_.F1 = clamp(tg[0] + .6*s2, D_.R1 + 1.4*s2, D_.F0);
      const P = k => { const p = new Prop(Lr.front, k === 'pencil' ? F1 : R1, k); D_.props.push(p); return p; };
      D_.lens = P('lens'); D_.pin = P('pin'); D_.note = P('doc'); D_.pen = P('pencil'); D_.cur = cursorG(Lr.front, 'Maya');
      D_.offC = [L.P.x1 + 30, L.P.y0 + 50]; D_.cur.put(...D_.offC);
      D = D_; R1.ch.moveTo(D.R0, F, true); F1.ch.moveTo(D.F0, F, true); ensure(0, t, true); };
    // the state of the page at the start of each beat, so an interrupted beat can be picked up again
    const ensure = (i, t, instant) => { const d = D, F = L.F; let travel = 0;
      [[R1, d.R0], [F1, i >= 5 && i <= 7 ? d.F1 : d.F0]].forEach(([a, x]) => { const c = a.ch;
        if (instant) c.moveTo(x, F, true); else if (Math.abs(c.x - x) > 3 || Math.abs(c.y - F) > 2){
          if (Math.abs(c.x - x) > 1.6*a.s){ travel = Math.max(travel, walk(Q, a, c.x, x, t)); } else { leap(Q, a, x, F, .25*a.s, t); travel = Math.max(travel, .6); } } });
      const show = (p, v) => p.o.set(v ? 1 : 0, v ? S.base : S.snap, t);
      d.lens.a = R1; d.lens.hold([38, -24], 0); show(d.lens, i <= 1);
      // the pin: carried by the reviewer up to its planting beat, in the page from the hand-over to the end, put away on reset
      d.pin.a = R1; if (i >= 3 && i <= 7){ d.pin.st = [d.tg[0], 0, d.tg[1], 0, 0, 0]; d.pin.fix(); } else { if (d.pin.m === 'fix') d.pin.st = null; d.pin.hold([38, -20], 0); }
      show(d.pin, i >= 2 && i <= 7); d.res = i === 7; d.pin.g.classList.toggle('abh-res', d.res); d.op.set(1, S.base, t);
      d.note.a = R1; d.note.hold([38, -22], 0); d.note.o.jump(0); d.pen.a = F1; d.pen.hold([-36, -20], 0); show(d.pen, i >= 4 && i <= 7);
      const B = d.box; if (i >= 1 && i <= 4){ if (d.ol.op.target < .5){ d.ol.jump(B.x0, B.y0, B.x1, B.y1); } d.ol.label('total · 6px low'); d.ol.op.set(1, S.base, t); } else d.ol.op.set(0, S.base, t);
      d.drop.set(i >= 5 && i <= 7 ? 0 : 6, S.base, t); d.watchCur = i === 6 || i === 7; if (i < 6){ d.cur.o.set(0, S.snap, t); d.cur.to(...d.offC); }
      AG.forEach(a => { a.unpose(); a.quiet = true; }); return travel; };
    const BEATS = [
      [1.5, (d, tt) => { R1.ch.set('focused'); d.lens.to(d.head[0], d.head[1] + 4, 0, 8); R1.ch.look(...d.head, 1.4); F1.ch.set('neutral'); F1.ch.watch(R1.ch, 1.1); }],
      [1.6, (d, tt) => { const c = d.lens.pos(), B = d.box; d.lens.to(d.tg[0] + 8, d.tg[1], 0, 9); R1.ch.look(...d.tg, 1.5);
        Q.at(tt + .35, t2 => { d.ol.jump(c[0], c[1], c[0], c[1]); d.ol.go(B.x0, B.y0, B.x1, B.y1, t2); d.ol.op.set(1, S.base, t2); R1.ch.react('curious', 1); F1.ch.look(...d.tg, 1); }); }],
      [2.4, (d, tt) => { const lo = d.R0; d.lens.o.set(0, S.snap, tt); d.pin.o.set(1, S.base, tt + .1); R1.ch.set('determined'); R1.ch.look(...d.tg, 2);
        let T = tt + .15; T += walk(Q, R1, lo, d.R1, T);
        Q.at(T, t2 => { R1.pose({ bs:-.16 }); }); Q.at(T + .25, t2 => { R1.pose({ bs:null }); d.pin.to(d.tg[0], d.tg[1] - 6, 0, 12); }); leap(Q, R1, d.R1, L.F, .3*R1.s, T + .25);
        Q.at(T + .62, t2 => { d.pin.to(d.tg[0], d.tg[1], 0, 30); d.pin.sc.set(.84, S.snap, t2); d.ringT.jump(0); d.ringT.set(1, S.lazy, t2); R1.ch.impulse(0, 2); say(2, t2); });
        Q.at(T + .75, t2 => { d.pin.fix(); d.pin.sc.set(1, S.base, t2); R1.ch.set('proud'); }); Q.at(T + 1.05, t2 => walk(Q, R1, d.R1, lo, t2)); return T + 1.05 - tt + walkDur(R1, d.R1 - lo) + .15; }],
      [2, (d, tt) => { R1.ch.watch(F1.ch, 1.6); F1.ch.watch(R1.ch, 1.6); R1.ch.set('happy'); d.note.a = R1; d.note.st = null; d.note.hold([38, -22], 0); d.note.o.set(1, S.base, tt);
        Q.at(tt + .45, t2 => { d.note.a = F1; d.note.hold([-38, -24], 0, 5); R1.ch.impulse(.6, 1); });
        Q.at(tt + 1.2, t2 => { F1.ch.react('happy', .6); F1.ch.impulse(0, 1.6); }); Q.at(tt + 1.5, t2 => { d.note.o.set(0, S.base, t2); F1.ch.set('determined'); }); }],
      [2.9, (d, tt) => { const P = d.pen, a0 = d.tg[0] - d.aw*.5; P.o.set(1, S.base, tt); F1.ch.look(...d.tg, 2.6); R1.ch.watch(F1.ch, 2.8); R1.ch.set('neutral');
        let T = tt + .1; T += walk(Q, F1, d.F0, d.F1, T);
        Q.at(T, t2 => { F1.ch.set('focused'); F1.pose({ lean:-.06 }); P.to(a0 - 6, d.tg[1] + 6, 0, 10); }); 
        Q.at(T + .5, t2 => { P.to(a0 - 6, d.tg[1] - 2, 0, 14); d.drop.set(0, S.base, t2); F1.ch.impulse(0, 1.2); });
        Q.at(T + .95, t2 => { F1.pose({ lean:null }); P.hold([-36, -20], 0); F1.ch.set('proud'); }); return T + 1.4 - tt; }],
      [1.3, (d, tt) => { d.ol.op.set(0, S.base, tt); R1.ch.react('happy', 1.2); R1.ch.watch(F1.ch, 1); F1.ch.watch(R1.ch, 1); }],
      [2.7, (d, tt) => { const c = d.cur; c.o.set(1, S.base, tt); c.put(...d.offC); c.to(d.tg[0] + 70, d.tg[1] - 60, 4); d.watchCur = true; R1.ch.set('curious'); F1.ch.set('curious');
        Q.at(tt + 1.1, () => c.to(d.tg[0] + 2, d.tg[1] - 12, 6)); Q.at(tt + 1.85, t2 => { c.sc.set(.85, S.snap, t2); }); 
        Q.at(tt + 1.97, t2 => { c.sc.set(1, S.base, t2); d.res = true; d.pin.g.classList.add('abh-res'); d.pin.sc.jump(.9); d.pin.sc.set(1, S.base, t2); R1.ch.react('surprised', .3); F1.ch.react('surprised', .3); }); }],
      [1.9, (d, tt) => { R1.ch.set('delighted'); Q.at(tt + .14, () => F1.ch.set('delighted')); d.cur.to(...d.offC, 4); d.cur.o.set(0, S.lazy, tt + .4);
        Q.at(tt + .7, () => { d.watchCur = false; R1.ch.watch(F1.ch, 1.2); F1.ch.watch(R1.ch, 1.2); }); }],
      [1.2, (d, tt) => { d.op.set(0, { w:60 }, tt); AG.forEach(a => a.ch.set('neutral')); Q.at(tt + .14, t2 => { d.drop.jump(6); d.res = false; d.pin.g.classList.remove('abh-res'); d.op.set(1, S.base, t2); }); ensure(0, tt + .1); }]
    ];
    const statusOf = i => i === 0 ? 0 : i === 1 ? 1 : i === 2 ? 1 : i;
    const run = (i, t) => { beat = i; const [d, fn] = BEATS[i]; say(statusOf(i), t); beatEnd = t + Math.max(d, fn(D, t) || 0); };
    const layout = () => { const W = vw.clientWidth, H = vw.clientHeight; if (!W || !H || (L && L.W === W && L.H === H)) return;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); L = LAYOUT(W, H); chrome(Lr.chromeG, L); const P = L.P;
      Lr.clipR.setAttribute('x', P.x0 + 1); Lr.clipR.setAttribute('y', P.y0 + 33); Lr.clipR.setAttribute('width', P.x1 - P.x0 - 2); Lr.clipR.setAttribute('height', P.y1 - P.y0 - 34);
      urlT.replaceChildren(); Tx(urlT, P.x0 + 24, P.y0 + 19.5, 'fieldnotes.co/checkout', 'abh-url'); Q.clear(); intr = null; build(now()); run(0, now() + .3); };
    new ResizeObserver(layout).observe(vw); layout(); if (document.fonts) document.fonts.ready.then(() => { L = null; layout(); });
    $(st,'.abh-rp').onclick = () => { const t = now(); Q.clear(); intr = null; AG.forEach(a => { a.ch.set('neutral'); a.ch.forced = null; }); ensure(0, t); D.drop.set(6, S.base, t); D.res = false; D.pin.g.classList.remove('abh-res'); run(0, t + .5); };
    const ptr = { x:0, y:0, t:-9 }; let lp = -9;
    vw.addEventListener('pointermove', e => { const r = svg.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.t = now(); });
    const place = (b, ch) => { const r = ch.box(); b.style.left = px(r.x); b.style.top = px(r.y); b.style.width = px(r.w); b.style.height = px(r.h); };
    return t => {
      if (!D) return;
      if (lastT && t - lastT > .3){ Q.clear(); intr = null; AG.forEach(a => { a.ch.forced = null; if (a.ch.mode === 'drag') a.ch.release(0, 0); }); ensure(beat, t, true); run(beat, t); }
      const dt = clamp(t - lastT, 0, .05); lastT = t; 
      // interruption: a drag that moved, or a toss, stops the script; the other agent turns to watch
      const moved = AG.find(a => (a.ch.mode === 'drag' && a.ch.dragMoved) || a.ch.thrown);
      if (moved && (!intr || intr.a !== moved)){ Q.clear(); const o = moved === R1 ? F1 : R1; intr = { a:moved, calm:-1 }; moved.unpose(); o.unpose(); o.ch.react('surprised', .5); o.ch.watch(moved.ch, 60); say(moved === R1 ? 9 : 10, t); D.watchCur = false; }
      if (intr){ const a = intr.a, c = a.ch; if (c.mode === 'ground' && !c.thrown){ if (intr.calm < 0) intr.calm = t; if (t - intr.calm > .8){ const o = a === R1 ? F1 : R1; o.ch.forced = null; intr = null; say(11, t); const tr = ensure(beat, t); Q.at(t + Math.max(.7, tr + .25), t2 => run(beat, t2)); beatEnd = 1e9; } } else intr.calm = -1; }
      else { Q.drain(t); if (t >= beatEnd) run((beat + 1) % BEATS.length, t); }
      if (ptr.t !== lp && t - ptr.t < 2){ lp = ptr.t; AG.forEach(a => a.ch.lookAt(ptr.x, ptr.y)); }
      if (D.watchCur){ const c = D.cur.pos(); AG.forEach(a => a.ch.look(c[0], c[1], .15)); }
      AG.forEach(a => a.render(t)); D.props.forEach(p => p.update(t, dt)); D.cur.update(t, dt); D.ol.render(t);
      const r = D.ringT.at(t), k = R1.u; D.ring.setAttribute('rx', n2(r*12*k)); D.ring.setAttribute('ry', n2(r*4*k)); D.ring.style.opacity = n2(r < .02 || r > .98 ? 0 : 1 - r);
      D.amt.setAttribute('transform', `translate(0 ${n2(D.drop.at(t))})`); const o = clamp(D.op.at(t)); D.g.style.opacity = o > .995 ? '' : o.toFixed(3);
      stLy.forEach((e, i) => stSw.apply(e, i, t, 4)); hits.forEach((b, i) => place(b, AG[i].ch));
    };
  } });
})();
