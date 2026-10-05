/* ---- agent rig: the shared character rig for Meridian agents (Wave 6) ----
   One soft square (agents are square, people are round) drawn in the Meridian hand: paper fill, one
   pale wash, an ink line with round caps. A face made of a small parameter set (lids, squint, eye size,
   brows, mouth curve/width/open/roundness/wave/skew) blended by critically damped springs, so any two
   moods morph. A meridian-globe antenna (axis, turning meridian, tilted equator) is the identity and the
   follow-through appendage. Physics: lean into horizontal speed, squash and stretch from vertical speed
   and contact, gravity when thrown, landing absorbed by a squash that recovers without rebounding.
   Idle life (breath, blinks, glances, a small fidget) is a pure function of the clock and a seed.

   Public API (global, reused by later lanes):
     const ch = AgentRig.create(svgParent, { size, wash, x, y, seed, expression, prop, follow, droop })
     ch.set(expr) ch.react(expr, sec) ch.say(state) ch.lookAt(x, y | null) ch.watch(otherCh, sec) ch.look(x, y, sec)
     ch.moveTo(x, y?, instant?) ch.setBounds(x0, x1, y0) ch.setSize(px) ch.throw(vx, vy) ch.hop(h) ch.poke() ch.impulse(lean, squash)
     ch.grab(x, y) ch.drag(x, y) ch.release(vx, vy) ch.hit(x, y) ch.box() ch.facePos() ch.render(t) ch.setProp(prop) ch.destroy()
     AgentRig.svg(expr, { size, wash, id })  → standalone layered SVG string (same geometry as the live rig)
     AgentRig.EXPRESSIONS, AgentRig.STATES, AgentRig.WASH, AgentRig.ANCHORS, AgentRig.FACE, AgentRig.reduced */
globalThis.AgentRig = (() => {
const NS = 'http://www.w3.org/2000/svg', TAU = Math.PI*2;
const cl = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lp = (a, b, p) => a + (b - a)*p;
const n2 = v => String(Math.round(v*100)/100);
const RM = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const hash = n => { const x = Math.sin(n*127.1 + 311.7)*43758.5453; return x - Math.floor(x); };
// critically damped spring, exact for a constant target over dt: never overshoots from rest
const cd = (x, v, to, w, dt) => { const x0 = x - to, e = Math.exp(-w*dt), k = v + w*x0; return [to + e*(x0 + k*dt), e*(v - w*k*dt)]; };
const sp = (s, to, w, dt) => { const r = cd(s[0], s[1], to, w, dt); s[0] = r[0]; s[1] = r[1]; };

const INK = '#1d1d1b', PAPER = '#fffaf2';
const WASH = { blue:'#dce8fb', lavender:'#ede4fb', green:'#e3eedc', warm:'#f1e6d4', rose:'#f6e0da', velo:'#f1e4ff', mint:'#e2f1ea', peach:'#fee8e0' };
// body: 54-unit soft square, origin at bottom centre, y up is negative
const U = 54, HW = 27, RAD = 16;
const F = { y:-26, ex:10.6, ey:-3, rw:3.6, rh:5.0, my:8.6, mw:5.2, bx:10.8 };
// the wash: the body's lower hemisphere below a tilted equator (the same -10° tilt as the Meridian mark)
const EQL = -9, EQR = -17.5;
const GRAV = 2600, REST = .66;

/* ---------- expressions: a small parameter set ----------
   eyes  eo open · es size · sq squint (lower lid up, 1 = ^ arch) · lt lid tilt (+ inner corner up) · ea one eye narrower
   brows bv shown · by height · ba angle (+ inner up) · bb asymmetry (+ left up)
   mouth mc curve (+ smile) · mw width · mo open · mr round · mv wave · mk skew (+ right corner up) · mx shift
   gaze  gx gy bias · gw how strongly the mood holds the gaze (0 follows you, 1 ignores you)
   body  fx fy face shift · ft face tilt (deg) · bs stretch · bl puff · lean · ad antenna droop · ap antenna perk
   life  spin meridian turning · sway · br breath depth · bk blink rate · gl glance rate */
const D = { eo:1, es:1, sq:0, lt:0, ea:0, bv:0, by:0, ba:0, bb:0, mc:.14, mw:.62, mo:0, mr:0, mv:0, mk:0, mx:0,
  gx:0, gy:0, gw:0, fx:0, fy:0, ft:0, bs:0, bl:0, lean:0, ad:0, ap:0, spin:0, sway:0, br:1, bk:1, gl:1 };
const KEYS = Object.keys(D);
// choreography: brows lead, lids follow, mouth after, the body settles last
const GROUPS = [{ d:0, w:19, k:['bv','by','ba','bb'] }, { d:.035, w:21, k:['eo','es','sq','lt','ea','gx','gy','gw'] },
  { d:.07, w:17, k:['mc','mw','mo','mr','mv','mk','mx'] }, { d:.1, w:10, k:['fx','fy','ft','bs','bl','lean','ad','ap','spin','sway','br','bk','gl'] }];
const EXPRESSIONS = [
  { k:'neutral', name:'Neutral', note:'At rest and ready when you are.', p:{} },
  { k:'happy', name:'Happy', note:'Something went well.', beat:'pop',
    p:{ eo:.92, sq:.48, mc:.95, mw:.92, mo:.16, bv:.55, by:.5, fy:-.8, bs:.02, ap:.3 } },
  { k:'delighted', name:'Delighted', note:'A result worth celebrating.', beat:'hop',
    p:{ eo:1, sq:1, mc:1, mw:1.08, mo:.9, bv:.85, by:1.2, fy:-1.3, bs:.06, bl:.4, ap:.8, gl:.4 } },
  { k:'focused', name:'Focused', note:'Heads down on a task. The meridian turns slowly while it works.',
    p:{ eo:.8, es:.92, lt:-.12, bv:.9, by:-.65, ba:-.3, mc:.02, mw:.38, mk:.2, gy:.6, gx:.15, gw:.75, fy:1, lean:.03, spin:.35, bk:.45, gl:.15 } },
  { k:'curious', name:'Curious', note:'Noticed something and wants a closer look.', beat:'pop',
    p:{ eo:1.12, es:1.08, bv:1, by:.55, bb:1, mc:.1, mw:.38, mo:.42, mr:1, ft:9, gx:.3, gw:.15, lean:.06, ap:.6, gl:1.5 } },
  { k:'thinking', name:'Thinking', note:'Working out an answer. The meridian turns on its axis.',
    p:{ eo:.88, bv:1, by:.35, bb:-.9, ba:.1, mc:-.18, mw:.4, mk:.55, mx:2.6, gx:.72, gy:-.85, gw:.9, ft:-5, fy:-.7, spin:1, gl:0 } },
  { k:'surprised', name:'Surprised', note:'Something unexpected just happened.', beat:'pop',
    p:{ eo:1.3, es:1.1, bv:1, by:1.8, ba:.2, mc:0, mw:.56, mo:1, mr:1, fy:-1.4, bs:.08, ap:1, gl:.2 } },
  { k:'confused', name:'Confused', note:'The input does not add up.',
    p:{ eo:1, ea:.6, bv:1, by:.45, bb:1.2, ba:-.2, mc:-.08, mw:.72, mv:1, ft:-9, gx:-.25, gw:.3, lean:-.04, ad:.25, spin:.15 } },
  { k:'worried', name:'Worried', note:'Something might go wrong. It keeps checking.', beat:'dip',
    p:{ eo:1.04, es:.95, lt:.6, bv:1, by:.5, ba:1.05, mc:-.55, mw:.6, mv:.4, bs:-.04, ad:.35, gl:2.2 } },
  { k:'apologetic', name:'Apologetic', note:'It made a mistake and owns it.', beat:'dip',
    p:{ eo:.62, sq:.95, bv:1, by:.45, ba:1.1, mc:.4, mw:.55, mv:.45, gy:.5, gw:.6, ft:-6, fy:1.8, bs:-.05, ad:.75, gl:.3 } },
  { k:'proud', name:'Proud', note:'Finished, and the work is good.', beat:'pop',
    p:{ eo:.52, sq:.2, bv:.8, by:.55, ba:-.1, mc:.88, mw:.86, mk:.35, gy:-.35, gw:.6, fy:-2.6, bs:.08, bl:.6, ap:.75, gl:.2 } },
  { k:'sleepy', name:'Sleepy', note:'Paused for a while. Breathing slow and deep.',
    p:{ eo:.36, lt:.3, mc:0, mw:.28, mo:.3, mr:1, gy:.45, gw:.9, fy:1.4, bs:-.07, bl:.5, ad:1, br:1.9, bk:0, gl:0 } },
  { k:'determined', name:'Determined', note:'Taking on something hard.', beat:'pop',
    p:{ eo:.8, lt:-.7, bv:1, by:-.75, ba:-1.15, mc:-.12, mw:.58, gw:.5, bs:.04, lean:.05, ap:.6, gl:.3 } },
  { k:'waiting', name:'Waiting', note:'Needs your answer and is happy to wait.',
    p:{ eo:.92, sq:.3, bv:.75, by:.6, ba:.3, mc:.5, mw:.52, gw:0, ft:4, sway:1, br:1.1, gl:.5 } }
];
const EX = Object.fromEntries(EXPRESSIONS.map(e => [e.k, e]));
// agent states → expression (+ a beat), so product code can say what is happening, not how to look
const STATES = { idle:'neutral', ready:'neutral', listening:'curious', reading:'focused', working:'focused', reviewing:'focused',
  browsing:'curious', thinking:'thinking', waiting:'waiting', 'needs-input':'waiting', done:'proud', success:'happy',
  celebrate:'delighted', starting:'determined', warning:'worried', blocked:'confused', error:'apologetic', paused:'sleepy',
  offline:'sleepy', surprised:'surprised' };
// prop anchors in body units (origin bottom centre). side lags behind the body like the antenna does
const ANCHORS = { top:[9, -U], side:[HW + 8, -17], front:[0, -9], face:[0, 0] };

/* ---------- geometry: one pure function feeds the live rig and the standalone SVG ---------- */
const antRest = (P, sx, sy, sh, side) => {
  const n = Math.hypot(sh*sy, sy), up = [sh*sy/n, -sy/n], L = 8 + 3.2*P.ap - 1.2*P.ad, a = side*(.16 + P.ad*1.1 - P.ap*.12);
  const c = Math.cos(a), s = Math.sin(a), d2 = [up[0]*c - up[1]*s, up[0]*s + up[1]*c];
  const ctl = [up[0]*L*.5, up[1]*L*.5];
  return { ctl, tip:[ctl[0] + d2[0]*L*.55, ctl[1] + d2[1]*L*.55] };
};
const geom = (pz, X, Y, u, sw, lift, washOn = true) => {
  const { P, sx, sy, sh } = pz, spx = u*U;
  const W = (lx, ly) => [X + u*(lx*sx - sh*ly*sy), Y + u*ly*sy];
  const pt = (lx, ly) => { const p = W(lx, ly); return n2(p[0]) + ' ' + n2(p[1]); };
  // soft square: corner arcs plus edges that bow out when it squashes or puffs; bottom flattens on contact
  const h = HW, H = U, r = RAD, k = r*.56, e = (2*h - 2*r)/3, ev = (H - 2*r)/3, bS = pz.bS/.75, bT = pz.bT/.75, bB = pz.bB/.75;
  // soft body: a little narrower at the top at rest, spreading at the base when it squashes
  const tp = .035 + Math.max(0, 1 - sy)*.7, bp = (lx, ly) => pt(lx*(1 + tp*ly/H), ly);
  const body = `M${bp(-h + r, -H)}C${bp(-h + r + e, -H - bT)} ${bp(h - r - e, -H - bT)} ${bp(h - r, -H)}C${bp(h - r + k, -H)} ${bp(h, -H + r - k)} ${bp(h, -H + r)}`
    + `C${bp(h + bS, -H + r + ev)} ${bp(h + bS, -r - ev)} ${bp(h, -r)}C${bp(h, -r + k)} ${bp(h - r + k, 0)} ${bp(h - r, 0)}`
    + `C${bp(h - r - e, bB)} ${bp(-h + r + e, bB)} ${bp(-h + r, 0)}C${bp(-h + r - k, 0)} ${bp(-h, -r + k)} ${bp(-h, -r)}`
    + `C${bp(-h - bS, -r - ev)} ${bp(-h - bS, -H + r + ev)} ${bp(-h, -H + r)}C${bp(-h, -H + r - k)} ${bp(-h + r - k, -H)} ${bp(-h + r, -H)}Z`;
  // the wash pools in the lower hemisphere under a softly curved, tilted equator; clipped to the body
  const wash = washOn ? `M${pt(-h - 8, EQL)}Q${pt(0, (EQL + EQR)/2 + 3.5)} ${pt(h + 8, EQR)}L${pt(h + 8, 8)}L${pt(-h - 8, 8)}Z` : '';
  // face plane: shifts with the slow gaze (head turn) and lags behind fast motion, tilts with ft
  const fcx = P.fx + pz.g2[0]*2.6 + pz.fl[0], fcy = F.y + P.fy + pz.g2[1]*1.7 + pz.fl[1];
  const fa = P.ft*Math.PI/180, ca = Math.cos(fa), sa = Math.sin(fa);
  const fp = (x, y) => pt(fcx + x*ca - y*sa, fcy + x*sa + y*ca);
  const g1x = pz.g1[0], g1y = pz.g1[1], oz = 1 + cl((72 - spx)/48)*.22;
  const eye = side => {
    const as = side > 0 ? P.ea : 0, es = P.es*(1 - as*.1)*(1 + (oz - 1)*.5), w = F.rw*es, hh = F.rh*es;
    const open = Math.max(0, P.eo*(1 - as*.5))*(1 - pz.blink), lt = P.lt, sq = cl(P.sq, 0, 1.2);
    const cx = side*(F.ex - Math.abs(g1x)*1.2) + g1x*2.4, cy = F.ey + g1y*2;
    const yc = cy - hh*.14*sq, oy = yc + lt*hh*.24, iy = yc - lt*hh*.24, ox = cx + side*w, ix = cx - side*w;
    const bb = hh*(1 - 1.75*sq)*1.333, tb = lp(bb, -hh*1.333, open), ot = lt*hh*.42*Math.min(open, 1);
    return `M${fp(ox, oy)}C${fp(ox, yc + bb)} ${fp(ix, yc + bb)} ${fp(ix, iy)}C${fp(ix, yc + tb - ot)} ${fp(ox, yc + tb + ot)} ${fp(ox, oy)}Z`;
  };
  const brow = side => {
    const v = cl(P.bv); if (v < .02) return null;
    const asy = side < 0 ? P.bb : -P.bb*.4, cx = side*(F.bx - Math.abs(g1x)*1) + g1x*2.2;
    const y = F.ey + g1y*1.6 - F.rh*Math.max(P.es, .9)*cl(P.eo, .7, 1.3) - 3.5 - P.by*2.1 - asy*2;
    const hl = 3.2*(.45 + .55*v), ix = cx - side*hl, ox = cx + side*hl, iy = y - P.ba*1.6, oy = y + P.ba*.8;
    return { d:`M${fp(ix, iy)}Q${fp(cx, (iy + oy)/2 - 1.2)} ${fp(ox, oy)}`, o:v };
  };
  const mouth = () => {
    const cx = P.mx + g1x*1.3, cy = F.my + g1y*.8, hw = F.mw*P.mw*oz, lift = P.mc*2.3*oz, oh = P.mo*6.4*oz;
    const L = [cx - hw, cy - lift + P.mk*.7], R = [cx + hw, cy - lift - P.mk*1.7];
    const s = hw*(.42 + .62*P.mr), sl = hw*(.42 + .62*P.mr + .4*P.mo*(1 - P.mr)), mid = cy + P.mc*1.9, wv = P.mv*1.5, yU = mid - oh*P.mr*.5, yD = mid + oh*(1 - P.mr*.5)*(1 - .18*P.mo*(1 - P.mr));
    return `M${fp(L[0], L[1])}C${fp(cx - s, yU + wv)} ${fp(cx + s, yU - wv)} ${fp(R[0], R[1])}C${fp(cx + sl, yD - wv)} ${fp(cx - sl, yD + wv)} ${fp(L[0], L[1])}Z`;
  };
  // antenna: stalk from the top edge, globe at the (lagging) tip, meridian turning on the globe's axis
  const B = W(0, -H), ar = antRest(P, sx, sy, sh, pz.side), C = [B[0] + ar.ctl[0]*u, B[1] + ar.ctl[1]*u], T = [B[0] + pz.tipO[0]*u, B[1] + pz.tipO[1]*u];
  let dx = T[0] - C[0], dy = T[1] - C[1]; const dn = Math.hypot(dx, dy) || 1; dx /= dn; dy /= dn;
  const rg = 7*u, G = [T[0] + dx*rg*.94, T[1] + dy*rg*.94], phi = Math.atan2(dx, -dy), pc = Math.cos(phi), ps = Math.sin(phi);
  const gp = (x, y) => n2(G[0] + x*pc - y*ps) + ' ' + n2(G[1] + x*ps + y*pc);
  const ay = rg*.8, ma = rg*1.05*Math.sin(pz.th);
  const globe = { cx:n2(G[0]), cy:n2(G[1]), r:n2(rg),
    axis:spx >= 64 ? `M${gp(0, -ay)}L${gp(0, ay)}` : '',
    arc:`M${gp(0, -ay)}C${gp(ma, -ay*.6)} ${gp(ma, ay*.6)} ${gp(0, ay)}`, arcO:1 - .55*cl(-Math.cos(pz.th)*3),
    eq:`M${gp(-rg*.84, rg*.16)}L${gp(rg*.84, -rg*.16)}` };
  const kk = cl(lift/90), floorY = Y + lift*u;
  return { body, wash, eyes:[eye(-1), eye(1)], brows:[brow(-1), brow(1)], mouth:mouth(),
    stalk:`M${n2(B[0])} ${n2(B[1])}Q${n2(C[0])} ${n2(C[1])} ${n2(T[0])} ${n2(T[1])}`, globe,
    shadow:{ cx:n2(X), cy:n2(floorY), rx:n2(u*HW*(1 - kk*.45)*sx), ry:n2(u*2.3*(1 - kk*.35)), o:n2(1 - kk*.7) },
    sw, W, fp };
};
const swFor = px => cl(1 + px*.0068, 1.15, 2.5);
const restPose = (P, side) => {
  const sy = 1 + P.bs, sx = Math.pow(1/sy, .75), sh = P.lean, ar = antRest(P, sx, sy, sh, side);
  return { P, sx, sy, sh, bS:Math.max(0, 1 - sy)*14 + P.bl*1.3, bT:P.bl, bB:0, fl:[0, 0], g1:[P.gx*P.gw, P.gy*P.gw], g2:[P.gx*P.gw, P.gy*P.gw],
    blink:0, tipO:ar.tip, th:P.spin > .5 ? 1.25 : REST, side };
};

/* ---------- styles: light paper and ink, dark plate with light ink; wash stays as a tint ---------- */
// dark mode keeps the paper character (an inverted dark body with light eyes reads as a robot screen);
// the stalk is drawn in paper so it still shows against a dark page
const DARK = '--arg-paper:#ece6db;--arg-stalk:#ece6db;--arg-shc:#000;--arg-so:.42';
const CSS = `.arg-svg{--arg-paper:${PAPER};--arg-ink:${INK};--arg-stalk:${INK};--arg-wo:.85;--arg-shc:${INK};--arg-so:.09}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .arg-svg{${DARK}}}
:root[data-theme="dark"] .arg-svg{${DARK}}
.arg-svg .arg-sk{fill:none;stroke:var(--arg-stalk);stroke-linecap:round}
.arg-svg .arg-k{fill:none;stroke:var(--arg-ink);stroke-linecap:round;stroke-linejoin:round}
.arg-svg .arg-p{fill:var(--arg-paper)}
.arg-svg .arg-f{fill:var(--arg-ink);stroke:var(--arg-ink);stroke-linecap:round;stroke-linejoin:round}
.arg-svg .arg-w{opacity:var(--arg-wo)}
.arg-svg .arg-sh{fill:var(--arg-shc);opacity:var(--arg-so)}`;
let cssOn = false;
const injectCss = () => { if (cssOn || typeof document === 'undefined') return; cssOn = true; const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); };
const mk = (tag, a, parent) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };

/* ---------- the live character ---------- */
let seedN = 0, clipN = 0;
const blinkShape = d => d < 0 || d > .2 ? 0 : d < .06 ? d/.06 : d < .09 ? 1 : 1 - (d - .09)/.11;
class Character {
  constructor(parent, o = {}){
    injectCss();
    this.o = o; this.seed = o.seed ?? (++seedN*2.399) % 9; this.side = o.droop ?? (hash(this.seed*9.1) > .5 ? 1 : -1);
    this.follow = o.follow || null; this.washC = WASH[o.wash] || o.wash || WASH.blue;
    this.t = 0; this.lt = null; this.q = [];
    this.x = o.x ?? 0; this.y = o.y ?? 0; this.floor = this.y; this.hx = this.x; this.bounds = null;
    this.mode = 'ground'; this.vx = 0; this.vy = 0; this.slideW = 7; this.thrown = false;
    this.P = { ...D }; this.T = { ...D }; this.V = {}; KEYS.forEach(k => this.V[k] = 0); this.pend = [];
    this.base = 'neutral'; this.cur = 'neutral'; this.tr = null;
    this.S = { sy:[1, 0], hs:[1, 0], sh:[0, 0], bB:[0, 0], flx:[0, 0], fly:[0, 0], g1x:[0, 0], g1y:[0, 0], g2x:[0, 0], g2y:[0, 0] };
    this.tip = null; this.th = REST; this.thv = 0; this.thR = REST; this.blinkT = -9; this.fidK = null; this.lk = null; this.forced = null;
    this.onLand = null; this.pz = null;
    this.build(parent); this.setSize(o.size || 96);
    if (o.expression) this.set(o.expression, true);
    if (o.prop) this.setProp(o.prop);
  }
  build(parent){
    const svg = parent.ownerSVGElement || parent; svg.classList.add('arg-svg');
    const g = this.el = mk('g', { class:'arg-chr' }, parent), gl = mk('g', {});
    this.e = { sh:mk('ellipse', { class:'arg-sh' }, g), st:mk('path', { class:'arg-sk' }, g), gl };
    g.appendChild(gl);
    Object.assign(this.e, { gc:mk('circle', { class:'arg-p arg-k' }, gl), ga:mk('path', { class:'arg-k' }, gl), gm:mk('path', { class:'arg-k' }, gl), ge:mk('path', { class:'arg-k' }, gl),
      bf:mk('path', { class:'arg-p' }, g) });
    const cid = 'arg-clip' + (++clipN), cp = mk('clipPath', { id:cid }, g); this.e.cb = mk('path', {}, cp);
    this.e.wa = mk('path', { class:'arg-w', fill:this.washC, 'clip-path':`url(#${cid})` }, g); this.e.bo = mk('path', { class:'arg-k' }, g);
    const fc = mk('g', {}, g);
    Object.assign(this.e, { br:[mk('path', { class:'arg-k' }, fc), mk('path', { class:'arg-k' }, fc)], ey:[mk('path', { class:'arg-f' }, fc), mk('path', { class:'arg-f' }, fc)],
      mo:mk('path', { class:'arg-f' }, fc), pr:mk('g', { class:'arg-pr' }, g) });
  }
  setSize(px){ this.size = px; this.u = px/U; this.sw = swFor(px); const s = this.sw, e = this.e;
    [e.st, e.bo, e.gc].forEach(x => x.setAttribute('stroke-width', n2(s))); [e.ga, e.gm, e.ge].forEach(x => x.setAttribute('stroke-width', n2(s*.82)));
    e.br.forEach(x => x.setAttribute('stroke-width', n2(s*1.05))); e.ey.forEach(x => x.setAttribute('stroke-width', n2(s*.9))); e.mo.setAttribute('stroke-width', n2(s*.95));
    this.tip = null; return this; }
  setBounds(x0, x1, y0 = -1e9){ this.bounds = [x0, x1, y0]; return this; }
  // ---- expression ----
  apply(k, instant){
    const ex = EX[k] || EX.neutral, v = { ...D, ...ex.p }, t = this.t; this.cur = ex.k;
    if (instant || RM){ Object.assign(this.T, v); Object.assign(this.P, v); KEYS.forEach(q => this.V[q] = 0); this.pend = []; return; }
    this.pend = this.pend.filter(p => p.at > t + 1);
    for (const gr of GROUPS){ const o = {}; gr.k.forEach(q => o[q] = v[q]); this.pend.push({ at:t + gr.d, v:o }); }
    this.blinkT = t + .03;
    if (this.mode === 'ground'){ if (ex.beat === 'pop') this.S.sy[1] += 2.2; else if (ex.beat === 'dip') this.S.sy[1] -= 2; else if (ex.beat === 'hop') this.hop(.1); }
  }
  set(k, instant){ this.base = EX[k] ? k : 'neutral'; this.tr = null; this.apply(this.base, instant); return this; }
  react(k, dur = 1){ this.tr = { k, until:this.t + dur }; if (this.cur !== k) this.apply(k); return this; }
  say(state){ return this.set(STATES[state] || state); }
  // ---- attention ----
  lookAt(x, y, hold){ this.lk = x == null ? null : { pt:[x, y], t:this.t, hold:!!hold }; return this; }
  look(x, y, dur = 1.2){ this.forced = { pt:[x, y], until:this.t + dur }; return this; }
  watch(ch, dur = 1.5){ this.forced = { ch, until:this.t + dur }; return this; }
  get watching(){ return this.forced && this.t < this.forced.until ? this.forced.ch || null : null; }
  facePos(){ const sy = this.S.sy[0], sh = this.S.sh[0]; return [this.x - this.u*sh*F.y*sy, this.y + this.u*(F.y - 2)*sy]; }
  // ---- motion ----
  moveTo(x, y, instant){ const b = this.bounds, w = HW*this.u*1.14 + 4; if (b) x = cl(x, b[0] + w, b[1] - w); this.hx = x; if (y != null) this.floor = y;
    if (instant || RM){ this.x = x; this.y = this.floor; this.vx = this.vy = 0; this.mode = 'ground'; this.tip = null; } else if (this.mode === 'ground') this.y = this.floor; return this; }
  impulse(lean = 0, squash = 0){ if (RM) return this; this.S.sh[1] += lean; this.S.sy[1] -= squash; return this; }
  throw(vx, vy){ if (RM){ this.vx = this.vy = 0; this.y = this.floor; this.mode = 'ground'; this.hx = this.x; return this; }
    this.mode = 'air'; this.vx = cl(vx, -2800, 2800); this.vy = cl(vy, -2800, 2800); this.thrown = true; this.react('surprised', 9); return this; }
  hop(h = .12){ if (RM || this.mode !== 'ground') return this; this.S.sy[1] -= 3.2;
    this.q.push([this.t + .085, () => { if (this.mode !== 'ground') return; this.mode = 'air'; this.vx = 0; this.vy = -Math.sqrt(2*GRAV*h*this.size); }]); return this; }
  poke(){ const t = this.t; this.pokes = (this.pokes || []).filter(p => t - p < 2.2); this.pokes.push(t); const n = this.pokes.length;
    if (RM){ this.react(n >= 3 ? 'delighted' : 'happy', 1.3); return this; }
    this.blinkT = t; this.S.sy[1] -= 4.5; this.react('surprised', .32);
    this.q.push([t + .1, () => this.hop(n >= 3 ? .2 : .1)], [t + .3, () => this.react(n >= 3 ? 'delighted' : 'happy', 1.4)]);
    if (n >= 3) this.q.push([t + .75, () => this.impulse(1.1)], [t + .95, () => this.impulse(-1.3)], [t + 1.15, () => this.impulse(.6)]);
    return this; }
  grab(x, y){ this.mode = 'drag'; this.off = [x - this.x, y - this.y]; this.dp = [this.x, this.y]; this.dragMoved = false; return this; }
  drag(x, y){ if (this.mode !== 'drag') return this; let nx = x - this.off[0], ny = Math.min(this.floor, y - this.off[1]); const b = this.bounds, w = HW*this.u*1.14 + 4;
    if (b){ nx = cl(nx, b[0] + w, b[1] - w); ny = Math.max(ny, b[2] + 6 + (U + 26)*this.u); }
    if (!this.dragMoved && Math.hypot(nx - this.x, ny - this.y) > 4){ this.dragMoved = true; this.react('surprised', .45); this.q.push([this.t + .45, () => this.mode === 'drag' && this.react('happy', 30)]); }
    this.dp = [nx, ny]; if (RM){ this.x = nx; this.y = ny; } return this; }
  release(vx = 0, vy = 0){ if (this.mode !== 'drag') return this; const moved = this.dragMoved;
    if (RM){ this.mode = 'ground'; this.y = this.floor; this.hx = this.x; if (moved) this.react(this.base, .01); return this; }
    if (this.floor - this.y > 2 || Math.abs(vx) + Math.abs(vy) > 160){ this.mode = 'air'; this.vx = cl(vx, -2800, 2800); this.vy = cl(vy, -2800, 2800); this.thrown = true; this.react('surprised', 9); }
    else { this.mode = 'ground'; this.vx = this.vy = 0; this.hx = this.x; if (moved) this.react('happy', .6); }
    return this; }
  hit(x, y){ const b = this.box(); return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; }
  box(){ const u = this.u, w = HW*u*1.12, sh = this.S.sh[0]; return { x:this.x - w + Math.min(0, sh)*U*u, y:this.y - (U*this.S.sy[0] + 27)*u, w:2*w + Math.abs(sh)*U*u, h:(U*this.S.sy[0] + 27)*u + 3 }; }
  setProp(prop){ this.e.pr.replaceChildren(); this.prop = prop || null; if (prop){ this.propS = prop.build ? prop.build(this.e.pr, this) : null; this.pa = null; } return this; }
  destroy(){ this.el.remove(); }
  // ---- per frame ----
  land(vy){ this.y = this.floor; this.mode = 'ground'; this.vy = 0; this.hx = this.x + this.vx/this.slideW;
    const b = this.bounds, w = HW*this.u*1.14 + 4; if (b) this.hx = cl(this.hx, b[0] + w, b[1] - w);
    this.S.sy[1] -= 13*cl(vy/1800, 0, 1.15); this.S.fly[1] += cl(vy/1800, 0, 1)*14;
    if (this.thrown){ this.thrown = false; this.react(vy > 1500 ? 'confused' : vy > 650 ? 'surprised' : 'happy', vy > 1500 ? 1.3 : .8); }
    if (this.onLand) this.onLand(this, vy); }
  phys(dt){
    const b = this.bounds, w = HW*this.u*1.14 + 4;
    if (this.mode === 'drag'){ if (dt > 0){ this.vx = lp(this.vx, (this.dp[0] - this.x)/dt, .4); this.vy = lp(this.vy, (this.dp[1] - this.y)/dt, .4); } this.x = this.dp[0]; this.y = this.dp[1]; return; }
    if (this.mode === 'air'){
      const n = Math.max(1, Math.ceil(dt*240)), h = dt/n;
      for (let i = 0; i < n; i++){
        this.vy += GRAV*h; this.x += this.vx*h; this.y += this.vy*h;
        if (b){ if (this.x < b[0] + w || this.x > b[1] - w){ this.x = cl(this.x, b[0] + w, b[1] - w); this.S.hs[1] -= cl(Math.abs(this.vx)/2000)*7; this.vx = 0; }
          const top = b[2] + 6 + (U + 26)*this.u; if (this.y < top){ this.y = top; this.vy = Math.max(0, this.vy); } }
        if (this.y >= this.floor){ this.land(this.vy); break; } }
      return; }
    const r = cd(this.x, this.vx, this.hx, this.slideW, dt); this.x = r[0]; this.vx = r[1]; this.y = this.floor; this.vy = 0;
    if (b && (this.x < b[0] + w || this.x > b[1] - w)){ this.x = cl(this.x, b[0] + w, b[1] - w); this.vx = 0; this.hx = this.x; }
  }
  render(t){
    if (this.lt === null) this.lt = t; const dt = cl(t - this.lt, 0, .05); this.lt = t; this.t = t;
    if (this.q.length){ const due = this.q.filter(e => e[0] <= t); if (due.length){ this.q = this.q.filter(e => e[0] > t); due.forEach(e => e[1]()); } }
    if (this.follow){ const pz = this.follow.pz; if (pz) this.draw(pz, 0); return; }
    if (this.tr && t >= this.tr.until){ this.tr = null; this.apply(this.base); }
    if (this.pend.length){ this.pend.forEach(p => { if (p.at <= t){ Object.assign(this.T, p.v); p.done = 1; } }); this.pend = this.pend.filter(p => !p.done); }
    const P = this.P, S = this.S, u = this.u;
    for (const gr of GROUPS) for (const k of gr.k){ if (RM){ P[k] = this.T[k]; this.V[k] = 0; } else { const r = cd(P[k], this.V[k], this.T[k], gr.w, dt); P[k] = r[0]; this.V[k] = r[1]; } }
    // idle life, all from the clock and the seed
    const sd = this.seed, live = !RM;
    const brP = 3.6*(1 + (P.br - 1)*.75), breath = live ? Math.sin(t*TAU/brP + sd*2)*.012*P.br : 0;
    const sway = live ? P.sway*.05*Math.sin(t*TAU/3.4 + sd) : 0;
    let blink = 0;
    if (live){ const BP = 4.1, k = Math.floor((t + sd*1.7)/BP), t0 = k*BP - sd*1.7 + .3 + hash(k + sd*13)*2.6;
      if (hash(k*7.7 + sd) < P.bk) blink = Math.max(blinkShape(t - t0), hash(k*3.1 + sd) > .72 ? blinkShape(t - t0 - .27) : 0);
      blink = Math.max(blink, blinkShape(t - this.blinkT)); }
    if (live && this.mode === 'ground' && !this.tr){
      const FS = 9.5, k = Math.floor((t + sd*4.3)/FS);
      if (this.fidK === null) this.fidK = k;
      if (k !== this.fidK){ this.fidK = k; const kind = P.gl < .05 ? 3 : Math.floor(hash(k*2.3 + sd*7)*4);
        if (kind === 0) this.thR = (this.thR ?? this.th) + TAU;
        else if (kind === 1 && P.spin < .5) this.hop(.05);
        else if (kind === 2){ const s = hash(k + sd) > .5 ? 1 : -1; this.impulse(.7*s); this.q.push([t + .22, () => this.impulse(-.8*s)]); }
        else { this.impulse(0, 1.6); this.blinkT = t + .05; } } }
    this.phys(dt);
    // deformation: stretch along vertical speed, lean into horizontal speed, flatten on contact
    const air = this.mode !== 'ground', vy = air ? this.vy : 0, vx = this.vx;
    const gaze = this.gaze(t, P);
    const tg = { sy:1 + P.bs + breath + (air ? cl(Math.abs(vy)/2600)*.2 : 0), hs:1, sh:P.lean + sway + cl(vx/2400, -.3, .3) + S.g2x[0]*.035,
      bB:air ? 1.6 : 0, flx:cl(-vx*.0015, -2.5, 2.5), fly:cl(-vy*.0017, -2.5, 2.5) };
    if (RM){ for (const k in tg) S[k] = [tg[k], 0]; S.g1x = [gaze[0], 0]; S.g1y = [gaze[1], 0]; S.g2x = [gaze[0], 0]; S.g2y = [gaze[1], 0]; }
    else { sp(S.sy, tg.sy, 17, dt); sp(S.hs, 1, 15, dt); sp(S.sh, tg.sh, 12, dt); sp(S.bB, tg.bB, 20, dt); sp(S.flx, tg.flx, 14, dt); sp(S.fly, tg.fly, 14, dt);
      sp(S.g1x, gaze[0], 26, dt); sp(S.g1y, gaze[1], 26, dt); sp(S.g2x, gaze[0], 8, dt); sp(S.g2y, gaze[1], 8, dt); }
    const sy = cl(S.sy[0], .62, 1.4), sx = Math.pow(1/sy, .75)*cl(S.hs[0], .7, 1.2), sh = S.sh[0];
    // antenna: the tip is a world-space spring, so it trails behind any motion and catches up without swinging past
    const ar = antRest(P, sx, sy, sh, this.side), bx = this.x + u*sh*U*sy, by = this.y - u*U*sy, rest = [bx + ar.tip[0]*u, by + ar.tip[1]*u];
    if (!this.tip || RM) this.tip = [rest[0], 0, rest[1], 0];
    else { const a = cd(this.tip[0], this.tip[1], rest[0], 13, dt), c = cd(this.tip[2], this.tip[3], rest[1], 13, dt); this.tip = [a[0], a[1], c[0], c[1]];
      // the stalk keeps its length: the tip swings around the stalk's midpoint, at most 65° off its rest angle
      const C = [bx + ar.ctl[0]*u, by + ar.ctl[1]*u], ra = Math.atan2(rest[1] - C[1], rest[0] - C[0]), Ls = Math.hypot(rest[0] - C[0], rest[1] - C[1]);
      let da = Math.atan2(this.tip[2] - C[1], this.tip[0] - C[0]) - ra; da = Math.atan2(Math.sin(da), Math.cos(da)); da = cl(da, -1.13, 1.13);
      this.tip[0] = C[0] + Math.cos(ra + da)*Ls; this.tip[2] = C[1] + Math.sin(ra + da)*Ls; }
    // the meridian: turns while spin > 0, otherwise eases forward to its resting angle
    if (P.spin > .04 && live){ this.thv = P.spin*2.8; this.th += dt*this.thv; this.thR = null; }
    else { if (this.thR === null){ let d = ((REST - this.th) % TAU + TAU) % TAU; if (d > 5.4) d -= TAU; this.thR = this.th + d; }
      if (live){ const r = cd(this.th, this.thv, this.thR, 4.5, dt); this.th = r[0]; this.thv = r[1]; } else this.th = this.thR; }
    this.pz = { P, sx, sy, sh, bS:Math.max(0, 1 - sy)*14 + P.bl*1.3, bT:P.bl, bB:S.bB[0], fl:[S.flx[0], S.fly[0]], g1:[S.g1x[0], S.g1y[0]], g2:[S.g2x[0], S.g2y[0]],
      blink, tipO:[(this.tip[0] - bx)/u, (this.tip[2] - by)/u], th:this.th, side:this.side };
    this.draw(this.pz, (this.floor - this.y)/u);
  }
  gaze(t, P){
    let tg = null;
    if (this.forced && t < this.forced.until){ const f = this.forced; tg = f.ch ? f.ch.facePos() : f.pt; } else this.forced = null;
    if (!tg && this.lk && (this.lk.hold || t - this.lk.t < 2.6)) tg = this.lk.pt;
    let gx = 0, gy = 0;
    if (tg){ const fp = this.facePos(), dx = tg[0] - fp[0], dy = tg[1] - fp[1], R0 = this.size*1.3; gx = dx/Math.hypot(dx, R0); gy = cl(dy/Math.hypot(dy, R0)*1.15, -1, 1); }
    else if (!RM){ const GS = 2.6/Math.max(1, P.gl), k = Math.floor((t + this.seed*3.7)/GS);
      if (hash(k*7.3 + this.seed*11.1) < .55*Math.min(P.gl, 1.4)){ gx = (hash(k*3.1 + this.seed)*2 - 1)*.75; gy = (hash(k*5.7 + this.seed)*2 - 1)*.35 - .05; } }
    const w = cl(P.gw); return [lp(gx, P.gx, w), lp(gy, P.gy, w)];
  }
  draw(pz, lift){
    const G = geom(pz, this.x, this.y, this.u, this.sw, lift), e = this.e;
    e.sh.setAttribute('cx', G.shadow.cx); e.sh.setAttribute('cy', G.shadow.cy); e.sh.setAttribute('rx', G.shadow.rx); e.sh.setAttribute('ry', G.shadow.ry); e.sh.style.fillOpacity = G.shadow.o;
    e.st.setAttribute('d', G.stalk);
    e.gc.setAttribute('cx', G.globe.cx); e.gc.setAttribute('cy', G.globe.cy); e.gc.setAttribute('r', G.globe.r);
    e.ga.setAttribute('d', G.globe.axis || 'M0 0'); e.ga.style.display = G.globe.axis ? '' : 'none';
    e.gm.setAttribute('d', G.globe.arc); e.gm.style.opacity = n2(G.globe.arcO); e.ge.setAttribute('d', G.globe.eq);
    e.bf.setAttribute('d', G.body); e.bo.setAttribute('d', G.body); e.cb.setAttribute('d', G.body); e.wa.setAttribute('d', G.wash);
    G.eyes.forEach((d, i) => e.ey[i].setAttribute('d', d));
    G.brows.forEach((b, i) => { const el = e.br[i]; if (b){ el.setAttribute('d', b.d); el.style.opacity = n2(b.o); el.style.display = ''; } else el.style.display = 'none'; });
    e.mo.setAttribute('d', G.mouth);
    if (this.prop) this.drawProp(pz);
  }
  drawProp(pz){
    const pr = this.prop, an = ANCHORS[pr.anchor] || ANCHORS.side, u = this.u, { sx, sy, sh, P } = pz;
    let a = u*sx, b = 0, c = -u*sh*sy, d = u*sy, ex = this.x + u*(an[0]*sx - sh*an[1]*sy), fy = this.y + u*an[1]*sy;
    if (pr.anchor === 'face'){ const fa = P.ft*Math.PI/180, ca = Math.cos(fa), s = Math.sin(fa), lx = P.fx + pz.g2[0]*2.6 + pz.fl[0], ly = F.y + P.fy + pz.g2[1]*1.7 + pz.fl[1];
      ex = this.x + u*(lx*sx - sh*ly*sy); fy = this.y + u*ly*sy; [a, b, c, d] = [a*ca + c*s, d*s, -a*s + c*ca, d*ca]; }
    if (pr.anchor === 'side' && !RM){ if (!this.pa) this.pa = [ex, 0, fy, 0]; const dt = cl(this.t - (this.paT ?? this.t), 0, .05); this.paT = this.t;
      const r1 = cd(this.pa[0], this.pa[1], ex, 15, dt), r2 = cd(this.pa[2], this.pa[3], fy, 15, dt); this.pa = [r1[0], r1[1], r2[0], r2[1]]; ex = this.pa[0]; fy = this.pa[2]; }
    this.e.pr.setAttribute('transform', `matrix(${n2(a)} ${n2(b)} ${n2(c)} ${n2(d)} ${n2(ex)} ${n2(fy)})`);
    if (pr.draw) pr.draw(this.propS, { t:this.t, P, expr:this.cur, mode:this.mode, think:P.spin, sw:this.sw/u, u, ch:this });
  }
}
const create = (parent, o) => new Character(parent, o);

/* ---------- standalone SVG: layered groups, static pose, same geometry ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const svgString = (k, o = {}) => {
  const ex = EX[k] || EX.neutral, size = o.size || 160, wash = WASH[o.wash] || o.wash || WASH.blue, P = { ...D, ...ex.p };
  const Wd = Math.round(size*1.5), Hd = Math.round(size*1.72), u = size/U, sw = swFor(size), X = Wd/2, Y = Hd - size*.1;
  const G = geom(restPose(P, o.side ?? 1), X, Y, u, sw, 0), id = o.id || 'agent-' + ex.k;
  const s = v => n2(v);
  const brows = G.brows.filter(Boolean).map((b, i) => `<path id="brow-${i ? 'right' : 'left'}" class="arg-k" d="${b.d}" fill="none" stroke="${INK}" stroke-width="${s(sw*1.05)}" stroke-linecap="round"${b.o < .99 ? ` opacity="${s(b.o)}"` : ''}/>`).join('');
  const css = `@media (prefers-color-scheme:dark){.arg-p{fill:#ece6db}.arg-sk{stroke:#ece6db}.arg-sh{fill:#000;opacity:.42}}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${Hd}" width="${Wd}" height="${Hd}" fill="none" role="img" aria-labelledby="${id}-title ${id}-desc">
<title id="${id}-title">Agent, ${esc(ex.name.toLowerCase())}</title>
<desc id="${id}-desc">${esc(`A square paper agent with a small meridian globe on its antenna. ${ex.note}`)}</desc>
<style>${css}</style>
<g id="shadow"><ellipse class="arg-sh" cx="${G.shadow.cx}" cy="${G.shadow.cy}" rx="${G.shadow.rx}" ry="${G.shadow.ry}" fill="${INK}" opacity=".09"/></g>
<g id="antenna" fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
<path id="stalk" class="arg-sk" d="${G.stalk}" stroke-width="${s(sw)}"/>
<g id="globe"><circle id="globe-outline" class="arg-p arg-k" cx="${G.globe.cx}" cy="${G.globe.cy}" r="${G.globe.r}" fill="${PAPER}" stroke-width="${s(sw)}"/>
<path id="axis" class="arg-k" d="${G.globe.axis}" stroke-width="${s(sw*.82)}"/><path id="meridian" class="arg-k" d="${G.globe.arc}" stroke-width="${s(sw*.82)}"${G.globe.arcO < .99 ? ` opacity="${s(G.globe.arcO)}"` : ''}/><path id="equator" class="arg-k" d="${G.globe.eq}" stroke-width="${s(sw*.82)}"/></g></g>
<defs><clipPath id="${id}-clip"><path d="${G.body}"/></clipPath></defs>
<g id="body"><path id="body-fill" class="arg-p" d="${G.body}" fill="${PAPER}"/><path id="wash" class="arg-w" d="${G.wash}" fill="${wash}" opacity=".85" clip-path="url(#${id}-clip)"/><path id="outline" class="arg-k" d="${G.body}" fill="none" stroke="${INK}" stroke-width="${s(sw)}" stroke-linejoin="round"/></g>
<g id="face">${brows ? `<g id="brows">${brows}</g>` : ''}<g id="eyes">${G.eyes.map((d, i) => `<path id="eye-${i ? 'right' : 'left'}" class="arg-f" d="${d}" fill="${INK}" stroke="${INK}" stroke-width="${s(sw*.9)}" stroke-linejoin="round"/>`).join('')}</g>
<path id="mouth" class="arg-f" d="${G.mouth}" fill="${INK}" stroke="${INK}" stroke-width="${s(sw*.95)}" stroke-linejoin="round" stroke-linecap="round"/></g>
</svg>
`;
};

return { create, svg:svgString, EXPRESSIONS, STATES, WASH, ANCHORS, FACE:{ ...F }, UNITS:U, reduced:RM };
})();

/* ---- atoms: one agent on a stage, and a crowd ---- */
(() => {
const R = globalThis.AgentRig;
const nm = k => R.EXPRESSIONS.find(e => e.k === k).name;
// transparent buttons over each character: the hit area, the keyboard path and the drag/throw/poke wiring
const handles = (layer, svgEl, chars, label) => chars.map((ch, i) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'arg-hit'; layer.appendChild(b);
  const loc = e => { const r = svgEl.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  let s0 = null, smp = [];
  b.addEventListener('pointerdown', e => { if (e.button) return; e.preventDefault(); b.setPointerCapture(e.pointerId); const p = loc(e);
    s0 = { x:p[0], y:p[1], t:now(), moved:false }; smp = [{ t:now(), x:p[0], y:p[1] }]; ch.grab(p[0], p[1]); });
  b.addEventListener('pointermove', e => { if (!s0) return; const p = loc(e); if (Math.hypot(p[0] - s0.x, p[1] - s0.y) > 5) s0.moved = true;
    smp.push({ t:now(), x:p[0], y:p[1] }); smp = smp.filter(q => now() - q.t < .1); ch.drag(p[0], p[1]); });
  const end = () => { if (!s0) return; const a = smp[0] || s0, z = smp[smp.length - 1] || s0, dt = Math.max(.016, z.t - a.t);
    if (!s0.moved){ ch.release(0, 0); if (now() - s0.t < .5) ch.poke(); } else ch.release(now() - z.t > .08 ? 0 : (z.x - a.x)/dt, now() - z.t > .08 ? 0 : (z.y - a.y)/dt); s0 = null; };
  b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
  b.addEventListener('click', e => { if (e.detail === 0) ch.poke(); });
  b.addEventListener('keydown', e => { const k = e.key, f = ch.size*7;
    if (k === 'ArrowLeft' || k === 'ArrowRight'){ e.preventDefault(); ch.throw((k === 'ArrowLeft' ? -1 : 1)*f*.9, -f*1.1); }
    else if (k === 'ArrowUp'){ e.preventDefault(); ch.throw(0, -f*1.4); } else if (k === 'ArrowDown'){ e.preventDefault(); ch.impulse(0, 3); } });
  b.setAttribute('aria-label', label(i)); return b; });
const place = (b, ch) => { const r = ch.box(); b.style.left = px(r.x); b.style.top = px(r.y); b.style.width = px(r.w); b.style.height = px(r.h); };
// the pointer anywhere on the page: characters look at it while it moves, then return to their own glances
const pointer = { x:0, y:0, t:-9 };
addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = now(); }, { passive:true });
const RESET = '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>';

atom({ id:'agentcharacter', cat:'Agent identity', name:'Agent character', block:'AgentCharacter (proposed)', fam:['M','S','D','T'], wide:true, tall:true,
  html:`<style>
.arg-wr{position:absolute;inset:0;container-type:inline-size}
.arg-a{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1fr) 300px;text-align:left}
.arg-pl{position:relative;min-width:0;min-height:0;overflow:hidden}
.arg-pl>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.arg-fl{fill:none;stroke:var(--faint);stroke-width:1.2;stroke-linecap:round;opacity:.7}
.arg-hit{position:absolute;border:0;background:none;padding:0;margin:0;border-radius:14px;cursor:grab;touch-action:none;z-index:2;-webkit-tap-highlight-color:transparent}
.arg-hit:active{cursor:grabbing}
.arg-hit:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.arg-rd{position:absolute;left:18px;top:14px;right:190px;pointer-events:none}
.arg-l{position:relative;height:30px}.arg-l>span{position:absolute;left:0;top:0;font-size:22px;font-weight:600;letter-spacing:-.02em;white-space:nowrap}
.arg-n{position:relative;height:42px;margin-top:2px;max-width:34ch}.arg-n>span{position:absolute;inset:0;font-size:13px;line-height:1.45;color:var(--muted)}
.arg-tb{position:absolute;top:10px;right:12px;display:flex;gap:6px;z-index:3}
.arg-tb .btn{display:inline-flex;align-items:center;gap:6px;height:32px}
.arg-tb .btn[aria-pressed=true]{background:var(--ink);color:var(--card);border-color:var(--ink)}
.arg-ht{position:absolute;left:0;right:0;bottom:12px;text-align:center;font-size:12px;color:var(--faint);pointer-events:none}
.arg-sd{display:flex;flex-direction:column;gap:18px;padding:16px;border-left:1px solid var(--line);min-height:0;overflow-y:auto}
.arg-h{margin:0 0 8px;font-size:12px;font-weight:600;color:var(--muted)}
.arg-pk{display:flex;flex-wrap:wrap;gap:6px}
.arg-pk button{border:1px solid var(--line);background:var(--card);border-radius:8px;padding:5px 10px;font-size:13px;font-weight:500;color:var(--muted);cursor:pointer}
.arg-pk button[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:var(--card)}
.arg-sz{display:flex;align-items:flex-end;gap:8px}
.arg-sz figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:4px}
.arg-sz svg{display:block;overflow:visible}
.arg-sz figcaption{font-size:11.5px;color:var(--faint);font-variant-numeric:tabular-nums}
@container (max-width:780px){.arg-a{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto}
  .arg-sd{border-left:0;border-top:1px solid var(--line);display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:14px 24px;overflow:visible}}
@container (max-width:540px){.arg-sd{grid-template-columns:minmax(0,1fr);gap:10px;padding:10px 0 12px}.arg-sd>div{min-width:0}.arg-h{padding:0 14px}
  .arg-pk{flex-wrap:nowrap;overflow-x:auto;padding:2px 14px 4px;scrollbar-width:none;scroll-padding-inline:14px}.arg-pk::-webkit-scrollbar{display:none}.arg-pk button{flex:none}
  .arg-rd{top:50px;right:16px}.arg-ht{display:none}.arg-sz{justify-content:center}}
</style><div class="arg-wr"><div class="arg-a"><div class="arg-pl"><svg aria-hidden="true"><path class="arg-fl"/></svg>
<div class="arg-rd"><div class="arg-l" aria-live="polite"></div><div class="arg-n"></div></div>
<div class="arg-tb"><button type="button" class="btn arg-tour" aria-pressed="false">Mood tour</button><button type="button" class="btn arg-rs" aria-label="Reset">${ic(RESET, 15)}Reset</button></div>
<p class="arg-ht">Drag it and let go to throw. Click to poke. Arrow keys work too.</p></div>
<div class="arg-sd"><div><p class="arg-h" id="agentcharacter-pk">Expression</p><div class="arg-pk" role="group" aria-labelledby="agentcharacter-pk"></div></div>
<div><p class="arg-h">Same agent at 24, 48 and 96px</p><div class="arg-sz"></div></div></div></div></div>`,
  desc:'One agent on a floor. Its eyes follow your pointer anywhere on the page, with the face sliding a beat later like a head turning. Pick an expression and the brows move first, then the lids, then the mouth, then the body settles. Click it and it squeezes, hops and smiles; drag it 1:1 and let go to throw it, and it leans into the throw, stretches as it flies, the antenna trails behind, and the landing squash recovers without bouncing. Idle, it breathes, blinks, glances and now and then fidgets. The 24, 48 and 96px copies mirror it frame for frame.',
  api:'ch = AgentRig.create(svg, { size, wash })  ch.set(mood)  ch.lookAt(x, y)  ch.grab/drag/release(vx, vy)  ch.poke()  ch.render(t)',
  init(st){
    const pl = $(st,'.arg-pl'), svg = $(pl,'svg'), fl = $(svg,'.arg-fl'), pk = $(st,'.arg-pk'), lab = $(st,'.arg-l'), note = $(st,'.arg-n'), tourB = $(st,'.arg-tour');
    const big = R.create(svg, { size:140, wash:'blue', seed:3.2, expression:'neutral' });
    const strip = [24, 48, 96].map(s => { const f = document.createElement('figure'), w = Math.round(s*1.45), h = Math.round(s*1.62);
      f.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"></svg><figcaption>${s}px</figcaption>`; $(st,'.arg-sz').appendChild(f);
      const c = R.create($(f,'svg'), { size:s, wash:'blue', follow:big }); c.moveTo(w/2, h - 3, true); return c; });
    const sw = new Swap(0), layers = R.EXPRESSIONS.map((e, i) => { const a = document.createElement('span'); a.textContent = e.name; lab.appendChild(a);
      const b = document.createElement('span'); b.textContent = e.note; note.appendChild(b); return [a, b]; });
    let cur = 0, tour = false, nextAt = 0, W = 0, H = 0;
    let btns = [];
    const pick = (i, fromTour) => { cur = i; sw.to(i); big.set(R.EXPRESSIONS[i].k); btns.forEach((b, j) => b.setAttribute('aria-pressed', i === j)); const pb = btns[i], pr = pk.getBoundingClientRect(), br = pb.getBoundingClientRect(); if (br.left < pr.left || br.right > pr.right) pk.scrollLeft += br.left - pr.left - 14;
      if (!fromTour && tour){ tour = false; tourB.setAttribute('aria-pressed', 'false'); } };
    btns = R.EXPRESSIONS.map((e, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = e.name; b.setAttribute('aria-pressed', i === 0); b.onclick = () => pick(i); pk.appendChild(b); return b; });
    pk.addEventListener('keydown', e => { const d = { ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1 }[e.key]; if (!d) return; e.preventDefault(); const n = (cur + d + btns.length) % btns.length; pick(n); btns[n].focus(); });
    tourB.onclick = () => { tour = !tour; tourB.setAttribute('aria-pressed', tour); if (tour){ nextAt = now(); } };
    const hits = handles(pl, svg, [big], () => 'Agent. Press Enter to poke it, arrow keys to toss it.');
    const layout = () => { W = pl.clientWidth; H = pl.clientHeight; svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const narrow = st.clientWidth <= 540, floor = H - (narrow ? 30 : Math.max(48, H*.14)), size = Math.round(clamp(Math.min(W*.3, H*.34), 84, 160));
      fl.setAttribute('d', `M16 ${floor}H${W - 16}`); const was = big.size; big.setSize(size); big.setBounds(0, W, 0);
      big.moveTo(big.mode === 'ground' && was !== size ? W/2 : (big.x || W/2), floor, big.mode === 'ground'); };
    new ResizeObserver(layout).observe(pl); layout(); big.moveTo(W/2, big.floor, true);
    $(st,'.arg-rs').onclick = () => { tour = false; tourB.setAttribute('aria-pressed', 'false'); pick(0); big.moveTo(W/2, big.floor, true); big.lookAt(null); };
    let lastP = -9;
    return t => {
      if (tour && t >= nextAt){ pick((cur + 1) % R.EXPRESSIONS.length, true); nextAt = t + 1.9; }
      if (pointer.t !== lastP && t - pointer.t < 2.6){ lastP = pointer.t; const r = svg.getBoundingClientRect(); big.lookAt(pointer.x - r.left, pointer.y - r.top); }
      big.render(t); strip.forEach(c => c.render(t)); place(hits[0], big);
      layers.forEach(([a, b], i) => { sw.apply(a, i, t, 6); sw.apply(b, i, t, 4); });
    };
  }
});

const CROWD = [{ wash:'blue', e:'neutral', s:1, n:'Review agent' }, { wash:'lavender', e:'thinking', s:.92, n:'Research agent' },
  { wash:'green', e:'waiting', s:1.06, n:'Scheduling agent' }, { wash:'warm', e:'happy', s:.96, n:'Copy editor agent' }, { wash:'rose', e:'sleepy', s:.88, n:'Accessibility agent' }];
atom({ id:'agentcrowd', cat:'Agent identity', name:'Agent crowd', block:'AgentCharacter (proposed)', fam:['M','D','T'], wide:true, tall:true,
  html:`<style>
.arg-cr{position:absolute;inset:0;container-type:inline-size;text-align:left}
.arg-cr>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.arg-cp{position:absolute;left:18px;top:14px;right:120px;margin:0;font-size:13px;line-height:1.45;color:var(--muted);max-width:46ch;pointer-events:none}
.arg-cr>.btn{position:absolute;top:10px;right:12px;display:inline-flex;align-items:center;gap:6px;height:32px;z-index:3}
.arg-st{position:absolute;left:18px;bottom:12px;right:18px;margin:0;font-size:12.5px;color:var(--faint);pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
</style><div class="arg-cr"><svg aria-hidden="true"><path class="arg-fl"/></svg>
<p class="arg-cp">Five agents share a floor. They glance at each other and at your pointer. Throw one near the others.</p>
<button type="button" class="btn arg-rs">${ic(RESET, 15)}Reset</button><p class="arg-st" aria-live="polite"></p></div>`,
  desc:'Five agents with different washes idle on one floor: each breathes, blinks and fidgets on its own clock, and every few seconds one glances at a neighbour; when two catch each other’s eye they both smile. The research agent is thinking, so its meridian keeps turning. They look at your pointer while it moves. Throw one and every agent it passes turns to watch it, looks surprised, leans away, then goes back to what it was doing; the sleepy one wakes up for a while. Landing on someone makes them shuffle aside.',
  api:'crowd.forEach(ch.render)  near(thrown, ch) → ch.watch(thrown).react(surprised).impulse(lean away)  glance(i → j) · mutual → react(happy)',
  init(st){
    const svg = $(st,'svg'), fl = $(svg,'.arg-fl'), stat = $(st,'.arg-st'), root = $(st,'.arg-cr');
    const ag = CROWD.map((c, i) => Object.assign(R.create(svg, { size:80*c.s, wash:c.wash, seed:i*1.9 + .7, expression:c.e }), { def:c, home:0, wake:0, rt:-9, smile:-9 }));
    let W = 0, H = 0, floor = 0;
    const statusOf = ch => `${ch.def.n}: ${nm(ch.base).toLowerCase()}`;
    const hits = handles(root, svg, ag, i => `${CROWD[i].n}. Press Enter to poke it, arrow keys to toss it.`);
    const layout = () => { W = st.clientWidth; H = st.clientHeight; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); floor = H - Math.max(52, H*.2);
      fl.setAttribute('d', `M16 ${floor}H${W - 16}`); const base = clamp((W - 60)/(5*1.75), 40, 96);
      ag.forEach((ch, i) => { const was = ch.size; ch.setSize(base*ch.def.s); ch.setBounds(0, W, 0); ch.home = W/2 + (i - 2)*Math.min((W - 60)/5, base*2.1);
        ch.moveTo(was !== ch.size || ch.mode !== 'ground' ? ch.home : ch.x, floor, true); }); };
    new ResizeObserver(layout).observe(st); layout(); ag.forEach(ch => ch.moveTo(ch.home, floor, true));
    // after a landing nobody should overlap: neighbours shuffle aside, the thrown one keeps its spot
    const settle = keep => { const w = c => c.size*.5 + 6; for (let pass = 0; pass < 4; pass++){ const s = [...ag].sort((a, b) => a.hx - b.hx);
      for (let i = 0; i < s.length - 1; i++){ const a = s[i], b = s[i + 1], need = w(a) + w(b) - (b.hx - a.hx); if (need <= 0) continue;
        if (b === keep) a.moveTo(a.hx - need); else if (a === keep) b.moveTo(b.hx + need); else { a.moveTo(a.hx - need/2); b.moveTo(b.hx + need/2); }
        if (a.hx - a.size*.5 < 2 || b.hx + b.size*.5 > W - 2){ const sh = a.hx - a.size*.5 < 2 ? 1 : -1; s.forEach(c => c !== keep && c.moveTo(c.hx + sh*need*.5)); } } } };
    const wake = (ch, t) => { if (ch.def.e === 'sleepy' && ch.base === 'sleepy'){ ch.set('neutral'); ch.wake = t + 6; } };
    const startle = (ch, other, t, dur) => { ch.rt = t; ch.watch(other, dur); wake(ch, t); ch.react('surprised', .75); ch.impulse(other.x < ch.x ? .9 : -.9, 1.2);
      stat.textContent = `${ch.def.n} looks over at the ${other.def.n.toLowerCase()}`; };
    ag.forEach(ch => ch.onLand = (a, vy) => { const t = a.t; settle(a);
      ag.forEach(b => { if (b !== a && Math.abs(b.x - a.x) < a.size*2.6 && t - b.rt > .7) startle(b, a, t, 1.4); });
      stat.textContent = vy > 1500 ? `${a.def.n} landed hard and is a little dizzy` : `${a.def.n} landed`; });
    $(st,'.arg-rs').onclick = () => { ag.forEach(ch => { ch.set(ch.def.e); ch.moveTo(ch.home, floor); ch.lookAt(null); }); stat.textContent = 'Everyone is back in place'; };
    let lastP = -9, gk = ag.map(() => null);
    return t => {
      const r = svg.getBoundingClientRect(), pActive = t - pointer.t < 2.2;
      if (pointer.t !== lastP && pActive){ lastP = pointer.t; ag.forEach(ch => ch.lookAt(pointer.x - r.left, pointer.y - r.top)); }
      ag.forEach((a, i) => {
        // a thrown or dragged agent startles anyone it passes
        if (a.mode !== 'ground' && Math.hypot(a.vx, a.vy) > 380) ag.forEach(b => { if (b !== a && b.mode === 'ground' && t - b.rt > 1.6 && Math.hypot(b.x - a.x, (b.y - b.size*.5) - (a.y - a.size*.5)) < a.size*2.4) startle(b, a, t, 1.8); });
        if (a.wake && t > a.wake){ a.wake = 0; a.set(a.def.e); }
        // social glances: deterministic slots per agent; quieter while your pointer is moving
        const k = Math.floor((t + i*1.37)/3.3);
        if (gk[i] !== k){ gk[i] = k; const h = Math.sin(k*91.7 + i*13.1)*43758.5; const q = h - Math.floor(h);
          if (!pActive && a.mode === 'ground' && a.base !== 'sleepy' && q < .62){ const nb = ag.filter(b => b !== a).sort((x, y) => Math.abs(x.x - a.x) - Math.abs(y.x - a.x)); a.watch(nb[q < .3 ? 0 : 1], 1.7); } }
        const o = a.watching;
        if (o && o.watching === a && t - a.smile > 6 && t - o.smile > 6 && a.mode === 'ground' && o.mode === 'ground' && ['neutral','waiting','happy'].includes(a.base) && ['neutral','waiting','happy','thinking'].includes(o.base)){
          a.smile = o.smile = t; a.react('happy', 1.1); if (o.base !== 'thinking') o.react('happy', 1.1); stat.textContent = `${a.def.n} and ${o.def.n.toLowerCase()} catch each other’s eye`; }
      });
      ag.forEach((ch, i) => { ch.render(t); place(hits[i], ch); const l = `${statusOf(ch)}. Press Enter to poke it, arrow keys to toss it.`; if (hits[i].getAttribute('aria-label') !== l) hits[i].setAttribute('aria-label', l); });
    };
  }
});
})();
