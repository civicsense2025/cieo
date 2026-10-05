/* ---- agent cast B: twelve role characters built on AgentRig (Wave 6) ----
   Summarizer, Data analyst, Scheduler, Support, Designer, Developer, QA tester, Content migrator,
   Moderator, Onboarding guide, Release manager, Archivist. Every one is the same species: the shared rig,
   the same square body and meridian-globe antenna. What changes is a signature prop, a signature idle
   habit and a default mood. Props are drawn in the Meridian hand (paper, one pale wash, ink line, round
   caps) and carry physics: held things trail the body through a world-space spring (follow-through),
   hanging things swing on a lagging spring, stacks cascade, and everything settles without bouncing.

   Each role's prop is one pure geometry function, so the live character and the standalone SVG share it.
   Registry (global, reused by later lanes):
     AgentCast.roles[slug] = { name, mean, persona, sig, expression, action, wash, prop(), act(ch), svg({ size }) }
     const ch = AgentRig.create(svg, { prop:AgentCast.roles.scheduler.prop(), droop:..., expression:... }) */
(() => {
const R = globalThis.AgentRig; if (!R) return;
const RM = R.reduced, TAU = Math.PI*2, NS = 'http://www.w3.org/2000/svg', INK = '#1d1d1b', PAPER = '#fffaf2', GRAV = 2600;
const cl = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lp = (a, b, p) => a + (b - a)*p;
const n2 = v => String(Math.round(v*100)/100);
const hash = n => { const x = Math.sin(n*127.1 + 311.7)*43758.5453; return x - Math.floor(x); };
// critically damped spring, exact for a constant target over dt (the rig's own integrator)
const cd = (x, v, to, w, dt) => { const x0 = x - to, e = Math.exp(-w*dt), k = v + w*x0; return [to + e*(x0 + k*dt), e*(v - w*k*dt)]; };
const V = (x = 0) => [x, 0];
const sp = (s, to, w, dt) => { if (RM){ s[0] = to; s[1] = 0; } else { const r = cd(s[0], s[1], to, w, dt); s[0] = r[0]; s[1] = r[1]; } return s[0]; };
const inw = (p, a, b) => p >= a && p < b;
const once = (s, k, c, fn) => { if (c && !s.once[k]){ s.once[k] = 1; fn(); } };
const wp = (ch, x, y) => [ch.x + x*ch.u, ch.y + y*ch.u];
const lookP = (ch, x, y, d) => { const p = wp(ch, x, y); ch.look(p[0], p[1], d); };

/* ---------- path helpers, all in body units (origin bottom centre, y up is negative) ---------- */
const pt = (x, y) => n2(x) + ' ' + n2(y);
const poly = (ps, z) => 'M' + ps.map(p => pt(p[0], p[1])).join('L') + (z ? 'Z' : '');
const tf = (ox, oy, a = 0, k = 1) => { const c = Math.cos(a)*k, s = Math.sin(a)*k; return (x, y) => [ox + x*c - y*s, oy + x*s + y*c]; };
const polyT = (ps, f, z) => poly(ps.map(p => f(p[0], p[1])), z);
const circ = (x, y, r) => `M${pt(x - r, y)}A${n2(r)} ${n2(r)} 0 1 0 ${pt(x + r, y)}A${n2(r)} ${n2(r)} 0 1 0 ${pt(x - r, y)}Z`;
const rr = (x, y, w, h, r) => { r = Math.max(0, Math.min(r, w/2, h/2));
  return `M${pt(x + r, y)}H${n2(x + w - r)}A${n2(r)} ${n2(r)} 0 0 1 ${pt(x + w, y + r)}V${n2(y + h - r)}A${n2(r)} ${n2(r)} 0 0 1 ${pt(x + w - r, y + h)}H${n2(x + r)}A${n2(r)} ${n2(r)} 0 0 1 ${pt(x, y + h - r)}V${n2(y + r)}A${n2(r)} ${n2(r)} 0 0 1 ${pt(x + r, y)}Z`; };
// a rounded rectangle under any transform (corners as quadratic curves through the transformed corner)
const rrT = (x, y, w, h, r, f) => { const P = (a, b) => pt(...f(a, b));
  return `M${P(x + r, y)}L${P(x + w - r, y)}Q${P(x + w, y)} ${P(x + w, y + r)}L${P(x + w, y + h - r)}Q${P(x + w, y + h)} ${P(x + w - r, y + h)}L${P(x + r, y + h)}Q${P(x, y + h)} ${P(x, y + h - r)}L${P(x, y + r)}Q${P(x, y)} ${P(x + r, y)}Z`; };
// a little line arm: one quadratic from the body edge to the grip, its elbow sagging under gravity
const arm = (x0, y0, x1, y1, sag = 2) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1; let nx = -dy/L, ny = dx/L;
  if (ny < 0 || (ny === 0 && nx < 0)){ nx = -nx; ny = -ny; } return `M${pt(x0, y0)}Q${pt((x0 + x1)/2 + nx*sag, (y0 + y1)/2 + ny*sag)} ${pt(x1, y1)}`; };
// keep the part of a polygon on the positive side of a line (one Sutherland-Hodgman pass), plus the cut segment
const clipHalf = (ps, c, n) => { const out = [], seg = [];
  for (let i = 0; i < ps.length; i++){ const A = ps[i], B = ps[(i + 1)%ps.length], da = (A[0] - c[0])*n[0] + (A[1] - c[1])*n[1], db = (B[0] - c[0])*n[0] + (B[1] - c[1])*n[1];
    if (da >= 0) out.push(A); if ((da >= 0) !== (db >= 0)){ const k = da/(da - db), P = [A[0] + (B[0] - A[0])*k, A[1] + (B[1] - A[1])*k]; out.push(P); seg.push(P); } }
  return { out, seg }; };

/* ---------- part kinds: the rig's own classes, so light and dark mode match the body ----------
   k ink line · pk paper shape with ink outline · f ink fill · w wash fill · s free line (ink on light, paper on dark,
   like the antenna stalk; for anything drawn off the body) · wk wash fill with ink outline */
const CLS = { k:'arg-k', pk:'arg-p arg-k', f:'arg-f', w:'arg-w', s:'arg-sk', wk:'ckb-wk' };
const WK = { check:'blue', content:'velo', ops:'mint', people:'peach' };
const WC = R.WASH;
let cssOn = false;
const injectCss = () => { if (cssOn || typeof document === 'undefined') return; cssOn = true; const s = document.createElement('style');
  s.textContent = '.arg-svg .ckb-wk{stroke:var(--arg-ink);stroke-linecap:round;stroke-linejoin:round}'; document.head.appendChild(s); };
const mk = (tag, a, parent) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };

/* ---------- the twelve roles ----------
   parts: [id, kind, stroke multiplier, { d:dash-traced, wash:key, back:drawn behind the body }]
   step(s, t, dt, ch) moves springs; geo(s, sw) returns { id: d | { d, o, p } }; idle/play start the timed beats.
   s.ix/s.iy is the prop's lag behind the body in units (a world-space spring), s.at/s.it the act/idle start times.
   The engine owns the names in ENGINE below; role state must use other names (build throws if one is reused). */
const KEYS = [[-11.25, -8.5, 2.8], [-6.75, -8.5, 2.8], [-2.25, -8.5, 2.8], [2.25, -8.5, 2.8], [6.75, -8.5, 2.8], [11.25, -8.5, 2.8],
  [-13.5, -5.1, 2.8], [-9, -5.1, 2.8], [-4.5, -5.1, 2.8], [0, -5.1, 2.8], [4.5, -5.1, 2.8], [9, -5.1, 2.8], [14.8, -5.1, 4]];
const FLASK = [[-1.5, .6], [-1.5, 5.2], [-6.6, 13.4], [-6.1, 14.3], [6.1, 14.3], [6.6, 13.4], [1.5, 5.2], [1.5, .6]];
const ROLES = [
{ k:'summarizer', name:'Summarizer', grp:'content', expr:'proud', act:'happy', ad:2.9, ip:6.6, side:1, ext:[-30, 47], bb:[-36, -84, 48, 3],
  mean:'Condenses long material to the points that matter.', prop:'holding a long page',
  persona:'Terse and a little smug. Says it in fewer words than you would.',
  sig:'Skims its page longest line first, then folds it down to a two-line card.',
  parts:[['arm', 's', 1.1], ['page', 'pk'], ['fold', 'k', .75], ['l0', 'k', 1.15, { d:1 }], ['l1', 'k', 1.15, { d:1 }], ['l2', 'k', 1.15, { d:1 }], ['l3', 'k', 1.15, { d:1 }]],
  init:() => ({ h:V(23), c:V(0), a:V(0), r:[V(1), V(1), V(1), V(1)] }),
  idle(s, ch){ lookP(ch, 38, -18, 1.8); },
  play(s, ch){ lookP(ch, 38, -12, 1.2); },
  step(s, t, dt, ch){
    const pa = t - s.at, pi = t - s.it, act = pa < this.ad, idl = !act && pi < 2.2, c = act && inw(pa, .3, 2.4);
    sp(s.c, c ? 1 : 0, 8, dt); sp(s.h, c ? 11.5 : 23, 9, dt); sp(s.a, cl(s.ix[0]*.05, -.45, .45), 9, dt);
    const b = idl ? pi - .2 : act ? pa : -1;
    [0, 2, 1, 3].forEach((li, j) => { once(s, 'r' + li, b >= j*.17, () => { s.r[li] = V(0); }); sp(s.r[li], 1, 9, dt); });
    if (act) once(s, 'nod', pa > 1.05, () => ch.impulse(0, 1.6));
  },
  geo(s){
    const h = s.h[0], c = s.c[0], f = tf(30.5 + s.ix[0]*.5, -6 - h/2 + s.iy[0]*.4, s.a[0]), top = -h/2, bot = h/2, w = lp(15, 11.5, c), dg = lp(4, .01, c);
    const G = { page:polyT([[0, top], [w - dg, top], [w, top + dg], [w, bot], [0, bot]], f, 1), fold:polyT([[w - dg, top], [w - dg, top + dg], [w, top + dg]], f) };
    const L = [10.5, 8, 9.5, 6], g0 = (h - 8.4)/3;
    L.forEach((len, i) => { const y = top + 4.2 + (i < 2 ? i*lp(g0, 3.3, c) : lp(i*g0, 3.3, c)), o = i < 2 ? 1 : 1 - c;
      G['l' + i] = o < .02 ? null : { d:polyT([[2.5, y], [2.5 + len*lp(1, i === 1 ? .6 : .76, c), y]], f), o, p:s.r[i][0] }; });
    const g = f(0, 0); G.arm = arm(26.4, -21, g[0] + .3, g[1], 2);
    return G;
  } },
{ k:'data-analyst', name:'Data analyst', grp:'ops', expr:'thinking', act:'delighted', ad:3.4, ip:6.1, side:-1, ext:[-30, 53], bb:[-36, -84, 54, 3],
  mean:'Turns tables into answers and charts.', prop:'standing by a small bar chart with a pointer',
  persona:'Thinks in charts. Will not answer until the numbers agree.',
  sig:'Its bars drop and regrow in order, a trend line traces over them, and it taps the tallest.',
  REST:[13, 25, 19], ACT:[11, 18, 27], X:[34, 41.5, 49],
  parts:[['b0', 'pk'], ['b1', 'pk'], ['b2', 'pk'], ['w0', 'w'], ['w1', 'w'], ['w2', 'w'], ['tr', 's', 1, { d:1 }], ['dot', 'pk'], ['arm', 's', 1.1], ['stick', 's', 1]],
  init(){ return { h:this.REST.map(v => V(v)), ht:[...this.REST], nh:null, tr:V(1), tro:V(0), dot:V(0), ang:V(-1.05), rch:V(21) }; },
  idle(s, ch, t){ const k = Math.floor(t*3.7); s.nh = [0, 1, 2].map(i => Math.round(9 + hash(k + i*3.3 + s.seed)*18)); lookP(ch, 41, -16, 1.8); },
  play(s, ch){ lookP(ch, 41, -16, 2.4); s.tr = V(0); },
  step(s, t, dt, ch){
    const pa = t - s.at, pi = t - s.it, act = pa < this.ad, idl = !act && pi < 2;
    for (let i = 0; i < 3; i++){
      if (act) s.ht[i] = pa < .4 ? 1.5 : pa > .45 + i*.2 ? this.ACT[i] : s.ht[i];
      else if (idl && s.nh && pi > .15 + i*.15) s.ht[i] = s.nh[i];
      sp(s.h[i], s.ht[i], 9, dt); }
    const on = act && inw(pa, 1.2, this.ad - .25); sp(s.tro, on ? 1 : 0, 10, dt); if (on) sp(s.tr, 1, 4.5, dt);
    sp(s.dot, act && inw(pa, 1.75, this.ad - .25) ? 1 : 0, 14, dt);
    // the pointer taps the tallest bar after a refresh, the last bar during the act
    let tap = -1; if (act && inw(pa, 1.95, 2.55)) tap = 2; else if (idl && inw(pi, .95, 1.45)) tap = s.ht.indexOf(Math.max(...s.ht));
    const T = tap < 0 ? null : [this.X[tap] + s.ix[0]*.3, -s.h[tap][0] - 1.4 + s.iy[0]*.3];
    sp(s.ang, T ? Math.atan2(T[1] + 26, T[0] - 26.4) : -1.05, 14, dt); sp(s.rch, T ? Math.hypot(T[0] - 26.4, T[1] + 26) : 21, 14, dt);
  },
  geo(s){
    const G = {}, X = this.X, tops = [], bx = s.ix[0]*.3, by = s.iy[0]*.3;
    for (let i = 0; i < 3; i++){ const h = Math.max(1, s.h[i][0]), x = X[i] + bx; tops.push([x, -h - 3.6 + by]);
      G['b' + i] = rr(x - 3, -h + by, 6, h, 1.3); G['w' + i] = h > 3.2 ? rr(x - 1.9, -h + 1.1 + by, 3.8, h - 2.2, .7) : null; }
    G.tr = s.tro[0] < .02 ? null : { d:poly([[tops[0][0] - 3, tops[0][1] + 1.4], ...tops, [tops[2][0] + 3, tops[2][1] - 1.8]]), o:s.tro[0], p:s.tr[0] };
    G.dot = s.dot[0] < .02 ? null : { d:circ(tops[2][0] + 3, tops[2][1] - 1.8, 1.9*s.dot[0]), o:s.dot[0] };
    const d = [Math.cos(s.ang[0]), Math.sin(s.ang[0])], hx = 26.4 + d[0]*10.5 + s.ix[0]*.4, hy = -26 + d[1]*10.5 + s.iy[0]*.4, L = Math.max(7, s.rch[0] - 10.5);
    G.arm = arm(26.4, -26, hx, hy, 1.4); G.stick = poly([[hx - d[0]*1.2, hy - d[1]*1.2], [hx + d[0]*L, hy + d[1]*L]]);
    return G;
  } },
{ k:'scheduler', name:'Scheduler', grp:'ops', expr:'waiting', act:'happy', ad:2.5, ip:7.4, side:1, ext:[-30, 49], bb:[-36, -84, 50, 3],
  mean:'Plans runs and reminders around your calendar.', prop:'holding a ticking pocket watch',
  persona:'Punctual and patient. Checks the time more often than it needs to.',
  sig:'Lifts its watch to look, sweeps the hands round to the next free hour, then nods.',
  parts:[['arm', 's', 1.1], ['stem', 's', 1.4], ['face', 'pk'], ['tick', 'k', .85], ['hr', 'k', 1.15], ['mn', 'k', .95], ['sc', 'k', .55]],
  init:() => ({ gx:V(39), gy:V(-25.5), sw:V(0), sec:null, mn:V(1.9), mnT:1.9, hr:V(-.9), hrT:-.9 }),
  idle(s, ch){ lookP(ch, 35.5, -38, 1.6); },
  play(s, ch){ lookP(ch, 35.5, -38, 2.1); },
  step(s, t, dt, ch){
    const pa = t - s.at, pi = t - s.it, act = pa < this.ad, up = act ? pa < 2.15 : pi < 1.7;
    sp(s.gx, up ? 35.5 : 39, 9, dt); sp(s.gy, up ? -50 : -25.5, 9, dt);
    // the watch hangs from the hand: it swings opposite to how the hand and body move, then settles under it
    sp(s.sw, cl(-s.ix[0]*.09 - s.gx[1]*.012, -.7, .7), 8, dt);
    const sT = Math.floor(t + s.seed)*TAU/60; if (!s.sec) s.sec = V(sT); sp(s.sec, sT, 32, dt);
    if (act){ once(s, 'spin', pa > .45, () => { s.mnT += TAU; s.hrT += TAU/12; }); once(s, 'nod', pa > 1.55, () => ch.impulse(0, 1.5)); }
    sp(s.mn, s.mnT, 4.2, dt); sp(s.hr, s.hrT, 4.2, dt);
  },
  geo(s){
    const hx = s.gx[0] + s.ix[0]*.55, hy = s.gy[0] + s.iy[0]*.55, a = s.sw[0], f = tf(hx, hy, a), C = f(0, 12.4), r = 8.5;
    const hand = (ang, L) => poly([C, [C[0] + Math.sin(ang + a)*L, C[1] - Math.cos(ang + a)*L]]);
    return { arm:arm(26.4, -24, hx, hy, 2.2), stem:poly([f(0, .3), f(0, 3.9)]), face:circ(C[0], C[1], r), tick:poly([f(0, 5.3), f(0, 7)]),
      hr:hand(s.hr[0], 3.9), mn:hand(s.mn[0], 5.8), sc:hand(s.sec ? s.sec[0] : 0, 6.4) };
  } },
{ k:'support', name:'Support', grp:'people', expr:'curious', act:'delighted', ad:2.6, ip:6.3, side:-1, ext:[-38, 33], bb:[-42, -84, 50, 3],
  mean:'Answers customer questions and hands off when it is stuck.', prop:'wearing a headset',
  persona:'A good listener. Nods along, then answers in plain words.',
  sig:'Leans into the mic, a speech bubble fills with three dots, then it nods twice.',
  parts:[['band', 's', 1.1], ['cl', 'pk'], ['cr', 'pk'], ['boom', 'k', .95], ['mic', 'f'], ['w1', 's', .9, { d:1 }], ['w2', 's', .9, { d:1 }], ['bub', 'pk'], ['d1', 'f'], ['d2', 'f'], ['d3', 'f']],
  init:() => ({ lis:V(0), wv:0, bub:V(0), d:[V(0), V(0), V(0)], bt:V(0) }),
  idle(s, ch){ lookP(ch, -70, -30, 2.3); },
  play(s, ch){ lookP(ch, 60, -40, .9); },
  step(s, t, dt, ch){
    const pa = t - s.at, pi = t - s.it, act = pa < this.ad, idl = !act && pi < 2.6;
    sp(s.lis, idl && inw(pi, .1, 2.3) ? 1 : 0, 10, dt); if (idl) s.wv = (pi*1.1)%1;
    if (idl){ once(s, 'n1', pi > .7, () => ch.impulse(0, 1.5)); once(s, 'n2', pi > 1.15, () => ch.impulse(0, 1.5)); once(s, 'n3', pi > 1.6, () => ch.impulse(0, 1.1)); }
    sp(s.bub, act && inw(pa, .12, 2.25) ? 1 : 0, 15, dt); s.d.forEach((d, i) => sp(d, act && inw(pa, .45 + i*.22, 2.25) ? 1 : 0, 18, dt));
    if (act){ once(s, 'a1', pa > 1.3, () => ch.impulse(0, 1.6)); once(s, 'a2', pa > 1.75, () => ch.impulse(0, 1.6)); }
    sp(s.bt, act && inw(pa, .1, 2.2) ? 1 : 0, 12, dt);
  },
  geo(s){
    const iy = s.iy[0]*.3, G = { band:`M${pt(-27.7, -31 + iy)}C${pt(-28.6, -63.5 + iy)} ${pt(28.6, -63.5 + iy)} ${pt(27.7, -31 + iy)}`,
      cl:rr(-31, -34.5 + iy, 5.6, 11, 2.5), cr:rr(25.4, -34.5 + iy, 5.6, 11, 2.5) };
    // the boom is springy: its tip trails the head a little more than the cups do
    const tx = 14 - s.bt[0]*2.2 + s.ix[0]*.6, ty = -15.6 + s.iy[0]*.6;
    G.boom = `M${pt(27.6, -25 + iy)}Q${pt(24.5, -14.2)} ${pt(tx, ty)}`; G.mic = rr(tx - 2.1, ty - 1.25, 3.4, 2.5, 1.2);
    const L = s.lis[0], w = s.wv;
    if (L > .02){ G.w1 = { d:`M${pt(-35, -32.5 + iy)}Q${pt(-37.2, -29 + iy)} ${pt(-35, -25.5 + iy)}`, o:L*(1 - w*.6), p:cl(w*2.2) };
      G.w2 = { d:`M${pt(-38.4, -35 + iy)}Q${pt(-41.6, -29 + iy)} ${pt(-38.4, -23 + iy)}`, o:L*(1 - cl(w - .3)*.8), p:cl(w*2.2 - .45) }; }
    const b = s.bub[0];
    if (b > .02){ const f = tf(33, -46, 0, .7 + .3*b), P = (x, y) => pt(...f(x, y));
      G.bub = { d:`M${P(1.5, -2)}L${P(-.8, 1.6)}L${P(5, -2)}L${P(12.5, -2)}Q${P(16, -2)} ${P(16, -5.5)}L${P(16, -9.5)}Q${P(16, -13)} ${P(12.5, -13)}L${P(1.5, -13)}Q${P(-2, -13)} ${P(-2, -9.5)}L${P(-2, -5.5)}Q${P(-2, -2)} ${P(1.5, -2)}Z`, o:b };
      s.d.forEach((d, i) => { const c = f(3.5 + i*3.5, -7.5); G['d' + (i + 1)] = d[0] < .02 ? null : { d:circ(c[0], c[1], 1.15*(.6 + .4*d[0])), o:b*d[0] }; }); }
    return G;
  } },
{ k:'designer', name:'Designer', grp:'people', expr:'happy', act:'delighted', ad:3.3, ip:6.4, side:-1, ext:[-30, 46], bb:[-36, -84, 47, 3],
  mean:'Drafts layouts and tunes spacing and type.', prop:'holding a pointer cursor',
  persona:'Cheerful, and fussy about two pixels.',
  sig:'Draws a square in the air with its cursor, fills it with colour and clicks.',
  parts:[['fill', 'w'], ['trail', 's'], ['arm', 's'], ['cur', 'pk', .9]],
  init:() => ({ x:V(33.5), y:V(-44), tr:[], tro:V(0), fo:V(0), ck:V(1), d0:null, sq:null }),
  idle(s, ch, t){ s.sq = [31, -66, 10]; s.d0 = t + .35; s.tr = []; s.tro = V(1); },
  play(s, ch, t){ s.sq = [30, -70, 14]; s.d0 = t + .3; s.tr = []; s.tro = V(1); s.fo = V(0); },
  step(s, t, dt, ch){
    const pa = t - s.at, act = pa < this.ad; let tx = 33.5, ty = -44, drawing = false;
    if (s.d0 != null && s.sq){
      const [x0, y0, a] = s.sq, C = [[x0, y0 + a], [x0, y0], [x0 + a, y0], [x0 + a, y0 + a], [x0, y0 + a]], e = t - s.d0, end = s.d0 + 1.85, lin = act ? 1.7 : .8;
      if (e < 0){ tx = C[0][0]; ty = C[0][1]; } else if (e < 1.85){ const k = Math.min(4, Math.floor(e/.3) + 1); tx = C[k][0]; ty = C[k][1]; drawing = true; }
      if (e < 1.85) ch.look(...wp(ch, s.x[0], s.y[0]), .25);
      if (act){ sp(s.fo, inw(t, end + .05, end + lin) ? 1 : 0, 8, dt); once(s, 'ck', t > end + .3, () => { s.ck[1] -= 5; ch.impulse(0, 1.2); }); }
      if (t > end + lin){ sp(s.tro, 0, 7, dt); if (!act) sp(s.fo, 0, 8, dt); if (s.tro[0] < .01){ s.sq = null; s.d0 = null; s.tr = []; } }
    } else sp(s.fo, 0, 8, dt);
    sp(s.x, tx, 15, dt); sp(s.y, ty, 15, dt); sp(s.ck, 1, 16, dt);
    // the trail is the cursor's real path, so the spring rounds the corners like a hand would
    if (drawing){ const L = s.tr[s.tr.length - 1], p = [s.x[0], s.y[0]]; if (!L || Math.hypot(p[0] - L[0], p[1] - L[1]) > .35) s.tr.push(p); if (s.tr.length > 160) s.tr.shift(); }
  },
  geo(s){
    const G = {}, x = s.x[0] + s.ix[0]*.4, y = s.y[0] + s.iy[0]*.4, f = tf(x, y, 0, .43*s.ck[0]);
    G.cur = polyT([[0, 0], [0, 23], [6, 17.5], [10, 26], [14.5, 24], [10.5, 15.5], [19, 15.5]], f, 1);
    const g = f(9.2, 21.5); G.arm = arm(26.4, -25, g[0], g[1], 1.6);
    if (s.tr.length > 1) G.trail = { d:poly(s.tr), o:s.tro[0] };
    else if (s.rest) G.trail = { d:rr(31, -66, 10, 10, 1.6), o:.45 };
    if (s.sq && s.fo[0] > .02) G.fill = { d:rr(s.sq[0] + .4, s.sq[1] + .4, s.sq[2] - .8, s.sq[2] - .8, 1.4), o:s.fo[0] };
    return G;
  } },
{ k:'developer', name:'Developer', grp:'ops', expr:'focused', act:'proud', ad:2.5, ip:4.4, side:1, ext:[-30, 30], bb:[-36, -84, 36, 3],
  mean:'Writes and edits code on its own branch.', prop:'typing on a tiny keyboard',
  persona:'Heads down. Types in bursts and looks up only to think.',
  sig:'Types a fast burst, lifts a hand and lands it on the enter key.',
  parts:[['slab', 'pk'], ...KEYS.map((k, i) => ['k' + i, 'k', 1.5]), ['al', 'k'], ['ar', 'k'], ['hl', 'pk', .85], ['hr', 'pk', .85]],
  init:() => ({ p:KEYS.map(() => V(0)), hlx:V(-8.5), hly:V(-10), hrx:V(8.5), hry:V(-10), slot:-1, key:-1, kt:-9, ent:-9 }),
  idle(){},
  play(){},
  step(s, t, dt, ch){
    const pa = t - s.at, pi = t - s.it, act = pa < this.ad, typing = act ? pa < 1.15 : pi < 2.7 && pi > .15;
    if (typing){ const sl = Math.floor(t*(act ? 13 : 7.5)); if (sl !== s.slot){ s.slot = sl; s.key = Math.floor(hash(sl*1.31 + s.seed*7)*12); s.kt = t; } lookP(ch, 0, -7, .25); }
    if (act) once(s, 'ent', pa > 1.45, () => { s.ent = t; ch.impulse(0, 2); });
    KEYS.forEach((k, i) => sp(s.p[i], (typing && i === s.key && t - s.kt < .075) || (i === 12 && t - s.ent < .13) ? 1 : 0, 40, dt));
    // each hand rides the key it presses and dips with it; the right hand lifts before the enter key
    const kk = KEYS[s.key] || [0, 0], on = typing && t - s.kt < .12, left = kk[0] < 0, dip = s.key >= 0 ? s.p[s.key][0]*.9 : 0;
    const L = on && left ? [kk[0], kk[1] - 1.3 + dip] : [-8.5, -10];
    const Rh = act && inw(pa, 1.2, 1.45) ? [14.8, -15] : t - s.ent < .25 ? [14.8, -6.4] : on && !left ? [kk[0], kk[1] - 1.3 + dip] : [8.5, -10];
    sp(s.hlx, L[0], 24, dt); sp(s.hly, L[1], 24, dt); sp(s.hrx, Rh[0], 24, dt); sp(s.hry, Rh[1], 24, dt);
  },
  geo(s){
    const oy = s.iy[0]*.3, ox = s.ix[0]*.2, P = (x, y) => pt(x + ox, y + oy), G = {};
    G.slab = `M${P(-16.4, -11.8)}L${P(16.4, -11.8)}Q${P(18, -11.8)} ${P(18.6, -10.2)}L${P(20.6, -3.4)}Q${P(21, -1.6)} ${P(19.2, -1.6)}L${P(-19.2, -1.6)}Q${P(-21, -1.6)} ${P(-20.6, -3.4)}L${P(-18.6, -10.2)}Q${P(-18, -11.8)} ${P(-16.4, -11.8)}Z`;
    KEYS.forEach((k, i) => { const p = s.p[i][0], y = k[1] + p*.75 + oy, h = k[2]*(1 - p*.25)/2; G['k' + i] = { d:poly([[k[0] - h + ox, y], [k[0] + h + ox, y]]), o:1 - p*.4 }; });
    const hl = [s.hlx[0] + ox, s.hly[0] + oy], hr = [s.hrx[0] + ox, s.hry[0] + oy];
    G.al = arm(-26.4, -21, hl[0], hl[1], 1.6); G.ar = arm(26.4, -21, hr[0], hr[1], 1.6); G.hl = circ(hl[0], hl[1], 1.9); G.hr = circ(hr[0], hr[1], 1.9);
    return G;
  } },
{ k:'qa-tester', name:'QA tester', grp:'check', expr:'worried', act:'happy', ad:3.6, ip:5.6, side:1, ext:[-30, 50], bb:[-36, -84, 60, 3],
  mean:'Runs through test cases and reports what failed.', prop:'holding a test flask',
  persona:'Assumes something is broken until it proves otherwise.',
  sig:'Holds the flask up to its eye and swirls it; the liquid turns green and a check traces beside it.',
  parts:[['arm', 's', 1.1], ['fl', 'pk'], ['la', 'w', 0, { wash:'blue' }], ['lb', 'w', 0, { wash:'green' }], ['surf', 'k', .85], ['rim', 'k', 1.2], ['ck', 's', 1.25, { d:1 }]],
  init:() => ({ x:V(38), y:V(-36), a:V(.16), L:V(0), col:V(0), ck:V(0), co:V(0) }),
  idle(s, ch){ lookP(ch, 35.5, -40, 1.8); },
  play(s, ch){ lookP(ch, 35.5, -40, 2.2); s.ck = V(0); },
  step(s, t, dt, ch){
    const pa = t - s.at, pi = t - s.it, act = pa < this.ad, ph = act ? pa : pi, on = act ? pa < 2.2 : pi < 1.9, up = on && ph > .1;
    sp(s.x, up ? 35.5 : 38, 9, dt); sp(s.y, up ? -52 : -36, 9, dt);
    const env = on ? Math.sin(Math.PI*cl((ph - .35)/1.4)) : 0;
    sp(s.a, .16 + env*Math.sin((ph - .35)*TAU*1.6)*.32, 14, dt);
    // the liquid stays level with the world and lags the swirl, so it reads as weight
    sp(s.L, cl(-s.a[1]*.3 + s.ix[0]*.06, -.65, .65), 6, dt);
    sp(s.col, act && inw(pa, 1.25, 5) ? 1 : 0, 5, dt);
    if (act && pa > 1.55) sp(s.ck, 1, 7, dt); sp(s.co, act && inw(pa, 1.55, 3.6) ? 1 : 0, 9, dt);
  },
  geo(s){
    const x = s.x[0] + s.ix[0]*.5, y = s.y[0] + s.iy[0]*.5, a = s.a[0], f = tf(x, y, a, 1.45), P = (u, v) => pt(...f(u, v));
    const G = { fl:`M${P(-2.3, 0)}L${P(-2.3, 5)}L${P(-7.5, 13.3)}Q${P(-8.3, 15.1)} ${P(-6.3, 15.1)}L${P(6.3, 15.1)}Q${P(8.3, 15.1)} ${P(7.5, 13.3)}L${P(2.3, 5)}L${P(2.3, 0)}`,
      rim:polyT([[-3.4, 0], [3.4, 0]], f) };
    const q = a + s.L[0], { out, seg } = clipHalf(FLASK, [0, 9.6], [Math.sin(q), Math.cos(q)]);
    if (out.length > 2){ const d = polyT(out, f, 1), c = s.col[0]; G.la = c < .98 ? { d, o:1 - c } : null; G.lb = c > .02 ? { d, o:c } : null; }
    if (seg.length === 2) G.surf = polyT(seg, f);
    const g = f(-2.3, 2.6); G.arm = arm(26.4, -26, g[0], g[1], 2);
    G.ck = s.co[0] < .02 ? null : { d:'M50.5 -54L53.5 -50.8L58.9 -57.4', o:s.co[0], p:s.ck[0] };
    return G;
  } },
{ k:'content-migrator', name:'Content migrator', grp:'ops', expr:'determined', act:'proud', ad:4.2, ip:7.1, side:-1, ext:[-30, 49], bb:[-36, -84, 50, 3],
  mean:'Moves content between systems and keeps its structure.', prop:'carrying a tray of pages',
  persona:'Steady and strong. Never drops a page.',
  sig:'Sends its pages one by one in an arc over its head into a second tray, then brings them back in order.',
  FAN:[-.3, -.02, .26], PX:[-4.6, 0, 4.6],
  parts:[['arm', 's', 1.1], ['p0', 'pk'], ['t0', 'k', .8], ['p1', 'pk'], ['t1', 'k', .8], ['p2', 'pk'], ['t2', 'k', .8], ['tray', 'pk'], ['dst', 'pk']],
  init:() => ({ r:[V(0), V(0), V(0)], lift:[V(0), V(0), V(0)], p:[V(0), V(0), V(0)], dst:V(0), dir:1 }),
  idle(s, ch, t){ s.dir = hash(t) > .5 ? 1 : -1; ch.impulse(.8*s.dir); lookP(ch, 40, -24, 1.6); },
  play(s, ch){ lookP(ch, 20, -86, .7); },
  step(s, t, dt, ch){
    const pa = t - s.at, pi = t - s.it, act = pa < this.ad;
    if (!act && pi < 1.4) once(s, 'rb', pi > .28, () => ch.impulse(-s.dir*.9));
    // idle re-sort: each page hops up a little in turn
    for (let i = 0; i < 3; i++) sp(s.lift[i], !act && inw(pi, .55 + i*.18, .72 + i*.18) ? 3.4 : 0, 18, dt);
    // stacked follow-through: the back page follows the tray, each page in front follows the one behind it, later
    const W = [13, 10.5, 8.5];
    for (let i = 0; i < 3; i++) sp(s.r[i], cl(i ? s.r[i - 1][0]*1.2 : s.ix[0]*.08, -.6, .6), W[i], dt);
    const T0 = [1.1, .75, .4], B0 = [2.7, 3.05, 3.4];
    for (let i = 0; i < 3; i++) sp(s.p[i], act && inw(pa, T0[i], B0[i]) ? 1 : 0, 7.5, dt);
    sp(s.dst, act && pa < 4 ? 1 : 0, 12, dt);
    if (act){ once(s, 'lk1', pa > .5, () => lookP(ch, -40, -8, 1.9)); once(s, 'lk2', pa > 2.7, () => lookP(ch, 40, -20, 1.2)); }
  },
  geo(s){
    const G = {}, hx = 31 + s.ix[0]*.5, hy = -10 + s.iy[0]*.5, tray = (x, y, o) => ({ d:`M${pt(x, y - 6)}L${pt(x, y - .9)}Q${pt(x, y)} ${pt(x + .9, y)}L${pt(x + 16.1, y)}Q${pt(x + 17, y)} ${pt(x + 17, y - .9)}L${pt(x + 17, y - 6)}`, o });
    for (let i = 0; i < 3; i++){
      const p = s.p[i][0], q = 1 - p, A = [hx + 8.5 + this.PX[i], hy - 1.6 - s.lift[i][0]], B = [-38.5 + this.PX[i]*.8, -1.4], C = [(A[0] + B[0])/2, -160];
      const x = q*q*A[0] + 2*q*p*C[0] + p*p*B[0], y = q*q*A[1] + 2*q*p*C[1] + p*p*B[1], rot = this.FAN[i]*(1 - Math.sin(p*Math.PI)) + s.r[i][0]*q - Math.sin(p*Math.PI)*1.1;
      const f = tf(x, y, rot); G['p' + i] = rrT(-4.5, -15, 9, 15, 1, f); G['t' + i] = polyT([[-2.2, -11.6], [2.2, -11.6]], f); }
    G.tray = tray(hx, hy, 1); G.dst = s.dst[0] < .02 ? null : tray(-47, 0, s.dst[0]);
    G.arm = arm(26.4, -22, hx + .3, hy - 5.6, 1.4);
    return G;
  } },
{ k:'moderator', name:'Moderator', grp:'people', expr:'neutral', act:'determined', ad:2.6, ip:8.2, side:-1, ext:[-30, 54], bb:[-36, -84, 55, 3],
  mean:'Flags content that breaks the rules and leaves the decision to a person.', prop:'holding a pennant on a tall pole',
  persona:'Calm and fair. Flags it and lets a person decide.',
  sig:'Lifts its pennant and plants it firmly; the cloth snaps up and settles.',
  parts:[['pole', 's', 1.1], ['arm', 's'], ['flag', 'wk'], ['gr', 's', .85]],
  init:() => ({ lift:V(0), fx:V(0), fy:V(0), hit:V(0), down:1 }),
  idle(s, ch){ lookP(ch, 46, -60, 1.5); },
  play(s, ch){ lookP(ch, 40, -2, 1); },
  step(s, t, dt, ch){
    const pa = t - s.at, pi = t - s.it, act = pa < this.ad;
    const tg = act && inw(pa, .05, .5) ? -7.5 : !act && inw(pi, .5, .9) ? -2.6 : 0, was = s.lift[0];
    sp(s.lift, tg, tg ? 11 : 30, dt);
    if (tg) s.down = 0; else if (!s.down && was < -1.2 && s.lift[0] > -.4){ s.down = 1; s.hit = V(1); ch.impulse(0, act ? 2.6 : 1); }
    sp(s.hit, 0, 7, dt);
    // the cloth trails the pole: it lags the body and flips up when the pole is driven down
    sp(s.fx, cl(s.ix[0]*.5, -5, 5), 9, dt); sp(s.fy, cl(s.iy[0]*.5 - s.lift[1]*.07, -5, 5), 9, dt);
  },
  geo(s){
    const L = s.lift[0], lean = s.ix[0]*.35, top = [40 + lean, -64 + L], foot = [40, L], tt = s.lt || 0;
    const F = (x, y, k) => [x + s.fx[0]*k*.6, y + s.fy[0]*k*.5 + Math.sin(tt*3.1 - k*1.3)*.5*k];
    const hb = [lp(top[0], foot[0], 11/64), top[1] + 11];
    const G = { pole:poly([foot, top]), flag:poly([top, F(top[0] + 12.5, top[1] + .2, 1), F(top[0] + 9, top[1] + 5.6, .75), F(top[0] + 12.5, top[1] + 11, 1), hb], 1) };
    const gp = [lp(foot[0], top[0], 30/64), -30 + L]; G.arm = arm(26.4, -24, gp[0] - .4, gp[1], 2);
    G.gr = s.hit[0] < .03 ? null : { d:`M${pt(36.6, -1.4)}L${pt(34.6, -3.2)}M${pt(43.4, -1.4)}L${pt(45.4, -3.2)}`, o:s.hit[0] };
    return G;
  } },
{ k:'onboarding-guide', name:'Onboarding guide', grp:'people', expr:'happy', act:'delighted', ad:3.5, ip:6.2, side:-1, ext:[-30, 46], bb:[-36, -84, 69, 3],
  mean:'Walks new people through setup one step at a time.', prop:'waving a mitten hand',
  persona:'Friendly from the first hello. Always points the way.',
  sig:'Waves hello, then points along a path that traces from the first step to the next.',
  parts:[['path', 's', 1, { d:1 }], ['m1', 'pk'], ['m2', 'pk'], ['arm', 's', 1.15], ['fing', 's', 1.4], ['thumb', 'pk'], ['hand', 'pk']],
  init:() => ({ th:V(-.42), fo:V(0), pth:V(0), po:V(0), m1:V(0), m2:V(0) }),
  idle(s, ch){ ch.react('delighted', 1.2); },
  play(s){ s.pth = V(0); },
  step(s, t, dt, ch){
    const pa = t - s.at, pi = t - s.it, act = pa < this.ad, wv = act ? pa : pi, waving = act ? pa < 1.2 : pi < 1.5, pointing = act && inw(pa, 1.3, 3.1);
    let th = -.42; if (waving && wv > .1) th = Math.floor((wv - .1)/.22)%2 ? -1.08 : -.5; if (pointing) th = -.12;
    sp(s.th, th, waving ? 20 : 11, dt); sp(s.fo, pointing ? 1 : 0, 14, dt);
    const show = act && inw(pa, 1.35, 3.3);
    if (act && pa > 1.4) sp(s.pth, 1, 4.2, dt); sp(s.po, show ? 1 : 0, 9, dt); sp(s.m1, show ? 1 : 0, 15, dt); sp(s.m2, act && inw(pa, 2.05, 3.3) ? 1 : 0, 15, dt);
    if (act) once(s, 'lk', pa > 1.35, () => lookP(ch, 64, -14, 1.8));
  },
  geo(s){
    const S = [26.2, -28], th = s.th[0], d = [Math.cos(th), Math.sin(th)], Wr = [S[0] + d[0]*12.5 + s.ix[0]*.45, S[1] + d[1]*12.5 + s.iy[0]*.45], fo = s.fo[0];
    // the mitten: palm along the arm, thumb on the side toward the head; it closes to a fist with one finger to point
    const f = tf(Wr[0], Wr[1], th), pl = lp(8, 6.4, fo), tip = f(pl, 0);
    const G = { arm:arm(S[0], S[1], Wr[0], Wr[1], 2.2), hand:rrT(-.6, -3.3, pl + .6, 6.6, 3, f), thumb:rrT(-1.7, -2.4, 3.4, 4.6, 1.7, tf(...f(2.2, -3.4), -.5 + th)) };
    G.fing = fo < .03 ? null : { d:poly([tip, f(pl + 4.6*fo, 0)]), o:fo };
    G.path = s.po[0] < .02 ? null : { d:`M${pt(47.5, -2)}C${pt(54, -2)} ${pt(55, -13)} ${pt(62.5, -13)}`, o:s.po[0], p:s.pth[0] };
    const sq = (x, y, h, k) => k < .02 ? null : { d:rr(x - h*k, y - h*k, 2*h*k, 2*h*k, .7), o:k };
    G.m1 = sq(45.2, -2, 2, s.m1[0]); G.m2 = sq(65, -13, 2.4, s.m2[0]);
    return G;
  } },
{ k:'release-manager', name:'Release manager', grp:'ops', expr:'determined', act:'delighted', ad:3.1, ip:7.3, side:-1, ext:[-30, 39], bb:[-36, -90, 40, 3],
  mean:'Tags versions, writes the notes and checks the release list.', prop:'wearing a version tag, with a furled flag behind it',
  persona:'Methodical. Raises the flag only when the list is done.',
  sig:'Crouches, hops and raises its flag high behind it; the cloth unfurls on launch.',
  parts:[['stick', 's', 1.1, { back:1 }], ['cloth', 'wk', 1, { back:1 }], ['str', 's', .85], ['tag', 'wk', .95], ['hole', 'k', .75]],
  init:() => ({ ta:V(0), hs:V(7), uf:V(0) }),
  idle(s, ch){ lookP(ch, 33, -14, 1.2); ch.impulse(.7); },
  play(s, ch){ ch.impulse(0, 2.6); },
  step(s, t, dt, ch){
    const pa = t - s.at, act = pa < this.ad;
    if (act){ once(s, 'hop', pa > .22, () => ch.hop(.09)); once(s, 'lk', pa > .6, () => lookP(ch, 24, -80, 1.4)); }
    sp(s.hs, act && inw(pa, .3, 2.7) ? 24 : 7, 11, dt); sp(s.uf, act && inw(pa, .55, 2.55) ? 1 : 0, 9, dt);
    // the tag hangs from a string: it swings away from the motion and settles under its own weight
    sp(s.ta, cl(-s.ix[0]*.13 + Math.sin(t*1.25 + s.seed)*.06, -.9, .9), 7, dt);
  },
  geo(s){
    const G = {}, hs = s.hs[0], top = [17.5 + s.ix[0]*.25, -53 - hs], u = s.uf[0], r = Math.sin((s.lt || 0)*5)*.4*u, fy = s.iy[0]*.25;
    G.stick = poly([[17.5, -34], top]);
    const w = lp(2.4, 12, u), h = lp(7, 8, u);
    G.cloth = poly([top, [top[0] + w, top[1] + .3 + r + fy], [top[0] + w, top[1] + h + .3 + r + fy], [top[0], top[1] + h]], 1);
    const A = [26.4, -24], H = [32.6 + s.ix[0]*.45, -21.5 + s.iy[0]*.45], f = tf(H[0], H[1], s.ta[0]);
    G.str = `M${pt(A[0], A[1])}Q${pt((A[0] + H[0])/2 + .4, Math.max(A[1], H[1]) + 1.8)} ${pt(H[0], H[1])}`;
    G.tag = polyT([[0, -3.5], [5.4, 1.9], [5.4, 14.9], [-5.4, 14.9], [-5.4, 1.9]], f, 1);
    const hc = f(0, .9); G.hole = circ(hc[0], hc[1], 1.2);
    return G;
  } },
{ k:'archivist', name:'Archivist', grp:'ops', expr:'sleepy', act:'proud', ad:3.4, ip:7.6, side:1, ext:[-30, 52], bb:[-36, -84, 54, 3],
  mean:'Files finished work and keeps it easy to find.', prop:'carrying an archive box',
  persona:'Quiet and a little sleepy. Knows exactly where everything is.',
  sig:'Lifts the lid, drops a file in, and lets the lid settle shut.',
  parts:[['lid', 'pk'], ['file', 'pk', .9], ['fl', 'k', .75], ['box', 'pk'], ['slot', 'k', .9], ['label', 'k', .85], ['arm', 's', 1.1]],
  init:() => ({ lift:V(0), tilt:V(0), sq:V(1), fp:V(0), fo:V(0) }),
  idle(s, ch){ lookP(ch, 40, -14, 1.3); ch.react('curious', 1.3); },
  play(s, ch){ lookP(ch, 40, -50, .9); s.fp = V(0); },
  step(s, t, dt, ch){
    const pa = t - s.at, pi = t - s.it, act = pa < this.ad, open = act ? inw(pa, .1, 2.25) : inw(pi, .15, 1.25), pl = s.tilt[0];
    sp(s.lift, 0, 15, dt); sp(s.tilt, open ? (act ? .62 : .36) : 0, open ? 10 : 15, dt);
    // closing: the box takes the lid's weight with a small squash that recovers without rebounding
    if (!open && pl > .08 && s.tilt[0] <= .08) s.sq[1] -= 1.1;
    sp(s.sq, 1, 14, dt);
    if (act){ sp(s.fo, inw(pa, .3, 1.75) ? 1 : 0, 12, dt); if (pa > .35) sp(s.fp, 1, 5.5, dt);
      once(s, 'lk', pa > .9, () => lookP(ch, 40, -10, 1)); once(s, 'n', pa > 2.35, () => ch.impulse(0, 1.3)); }
    else sp(s.fo, 0, 12, dt);
  },
  geo(s){
    const ox = s.ix[0]*.45, oy = s.iy[0]*.45, x0 = 29.5 + ox, x1 = 50 + ox, bb = -1.5 + oy, bt = bb - 14*s.sq[0], G = {};
    G.box = rr(x0, bt, x1 - x0, bb - bt, 1.6); G.slot = rr(x0 + 6.5, bt + 2.3, 7.5, 2, 1); G.label = rr(x0 + 5.5, bt + 6.6, 9.5, 4.6, .8);
    // the lid hinges on the far edge and lags the box: it lifts a little on a landing, then settles back onto it
    const lift = s.lift[0] + Math.max(0, -s.iy[0]*.6); G.lid = rrT(-22.8, -4, 22.8, 4, 1.3, tf(x1 + 1.15, bt - lift, s.tilt[0]));
    G.arm = arm(26.4, -21, x0 + .6, bt + 3, 1.2);
    const fo = s.fo[0];
    if (fo > .02){ const p = s.fp[0], f = tf(lp(43, 39.5, p) + ox, lp(-66, -6, p), lp(.35, 0, p));
      G.file = { d:rrT(-5.5, -4, 11, 8, 1, f), o:fo }; G.fl = { d:polyT([[-3.2, -1.2], [2.8, -1.2]], f), o:fo }; }
    return G;
  } }
];
const BY = Object.fromEntries(ROLES.map(r => [r.k, r]));

/* ---------- prop engine: one prop object per role for AgentRig's setProp ---------- */
const ENGINE = ['ix', 'iy', 'lx', 'ly', 'it', 'at', 'ik', 'once', 'seed', 'lt', 'el', 'pr', 'bk', 'quiet', 'rest'];
const washOf = (r, p) => WC[(p[3] && p[3].wash) || WK[r.grp]];
const mkProp = r => ({ anchor:'front',
  build(g, ch){
    injectCss();
    const s0 = r.init(); ENGINE.forEach(k => { if (k in s0) throw new Error(`${r.k}: prop state '${k}' is reserved`); });
    const s = Object.assign(s0, { ix:V(), iy:V(), lx:null, ly:null, it:-99, at:-99, ik:null, once:{}, seed:ch.seed*2.7 + 1, lt:null, el:{}, pr:g });
    const front = mk('g', { transform:'translate(0 9)' }, g); let back = null;
    // parts marked back sit behind the body (the rig draws props in front), sharing the prop transform
    if (r.parts.some(p => p[3] && p[3].back)){ s.bk = mk('g', {}); ch.el.insertBefore(s.bk, ch.e.bf); back = mk('g', { transform:'translate(0 9)' }, s.bk); }
    r.parts.forEach(p => { const o = p[3] || {}, a = { class:CLS[p[1]] }; if (p[1] === 'w' || p[1] === 'wk') a.fill = washOf(r, p); if (o.d) a.pathLength = '1';
      const e = mk('path', a, o.back ? back : front); if (o.d) e.style.strokeDasharray = '1 2'; e._on = true; s.el[p[0]] = e; });
    return s; },
  draw(s, c){
    const t = c.t, ch = c.ch, dt = s.lt == null ? 0 : cl(t - s.lt, 0, .05); s.lt = t;
    // follow-through: the prop is a world-space spring hung on the body, so it trails every move and catches up
    if (s.lx == null){ s.lx = ch.x; s.ly = ch.y; }
    s.ix[0] = cl(s.ix[0] - (ch.x - s.lx)/c.u, -9, 9); s.iy[0] = cl(s.iy[0] - (ch.y - s.ly)/c.u, -9, 9); s.lx = ch.x; s.ly = ch.y;
    sp(s.ix, 0, 10, dt); sp(s.iy, 0, 10, dt);
    // the signature idle habit: one slot per period, offset by the seed so no two characters move together
    const k = Math.floor((t + s.seed*1.7)/r.ip);
    if (s.ik === null) s.ik = k; else if (k !== s.ik){ s.ik = k; if (!RM && !s.quiet && t - s.at > r.ad + .3){ s.it = t; s.once = {}; r.idle(s, ch, t); } }
    r.step(s, t, dt, ch);
    if (s.bk) s.bk.setAttribute('transform', s.pr.getAttribute('transform') || '');
    const G = r.geo(s, c.sw);
    for (const p of r.parts){
      const e = s.el[p[0]], g = G[p[0]], o = g == null ? 0 : typeof g === 'string' ? 1 : (g.o ?? 1), pp = g && g.p != null ? cl(g.p) : 1;
      if (o < .015 || pp < .01){ if (e._on){ e.style.display = 'none'; e._on = false; } continue; }
      if (!e._on){ e.style.display = ''; e._on = true; }
      e.setAttribute('d', typeof g === 'string' ? g : g.d);
      const oo = p[1] === 'w' ? o*.85 : o, os = oo > .995 ? '' : n2(oo); if (e._o !== os){ e.style.opacity = os; e._o = os; }
      if (p[1] !== 'w'){ const w = n2(c.sw*(p[2] ?? 1)); if (e._w !== w){ e.setAttribute('stroke-width', w); e._w = w; } }
      if (p[3] && p[3].d) e.style.strokeDashoffset = n2(1 - pp);
    }
  } });
const play = (r, ch, t = ch.t) => { const s = ch.propS; if (!s) return; s.at = t; s.it = -99; s.once = {}; r.play(s, ch, t); ch.react(r.act, r.ad); };

/* ---------- standalone SVG: the rig's neutral pose plus the prop at rest, layered for Gesso and Figma ---------- */
const swFor = px => cl(1 + px*.0068, 1.15, 2.5);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const partSvg = (r, p, g, sw) => {
  if (g == null) return ''; const o = typeof g === 'string' ? 1 : (g.o ?? 1), pp = typeof g === 'string' || g.p == null ? 1 : g.p; if (o < .015 || pp < .01) return '';
  const kind = p[1], opt = p[3] || {}; let a = `id="${p[0]}" class="${CLS[kind]}" d="${typeof g === 'string' ? g : g.d}"`;
  a += kind === 'k' || kind === 's' ? ` fill="none" stroke="${INK}"` : kind === 'pk' ? ` fill="${PAPER}" stroke="${INK}"` : kind === 'f' ? ` fill="${INK}" stroke="${INK}"` : kind === 'w' ? ` fill="${washOf(r, p)}"` : ` fill="${washOf(r, p)}" stroke="${INK}"`;
  if (kind !== 'w') a += ` stroke-width="${n2(sw*(p[2] ?? 1))}" stroke-linecap="round" stroke-linejoin="round"`;
  if (opt.d && pp < .99) a += ` pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="${n2(1 - pp)}"`;
  const oo = (kind === 'w' ? .85 : 1)*o; if (oo < .995) a += ` opacity="${n2(oo)}"`;
  return `<path ${a}/>`; };
const roleSvg = (r, o = {}) => {
  const size = o.size || 160, u = size/54, sw = swFor(size)/u, id = 'agent-' + r.k;
  let svg = R.svg('neutral', { size, wash:WK[r.grp], side:r.side, id });
  const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/), Wd = +m[1], Hd = +m[2], X = Wd/2, Y = Hd - size*.1;
  const s = Object.assign(r.init(), { ix:V(), iy:V(), rest:true, lt:0, at:-99, it:-99, once:{}, seed:0 }), G = r.geo(s, sw);
  const front = [], back = []; r.parts.forEach(p => (p[3] && p[3].back ? back : front).push(partSvg(r, p, G[p[0]], sw)));
  const pad = 6, x0 = Math.floor(Math.min(0, X + r.bb[0]*u - pad)), x1 = Math.ceil(Math.max(Wd, X + r.bb[2]*u + pad)), y0 = Math.floor(Math.min(0, Y + r.bb[1]*u - pad));
  svg = svg.replace(/viewBox="[^"]*" width="[^"]*" height="[^"]*"/, `viewBox="${x0} ${y0} ${x1 - x0} ${Hd - y0}" width="${x1 - x0}" height="${Hd - y0}"`);
  const grp = (gid, list) => `<g id="${gid}" transform="matrix(${n2(u)} 0 0 ${n2(u)} ${n2(X)} ${n2(Y)})">${list.filter(Boolean).join('\n')}</g>\n`;
  if (back.some(Boolean)) svg = svg.replace('<defs>', grp('prop-back', back) + '<defs>');
  svg = svg.replace('</svg>', grp('prop', front) + '</svg>');
  svg = svg.replace(/(<title id="[^"]*">)[^<]*(<\/title>)/, `$1${esc(r.name)} agent$2`)
    .replace(/(<desc id="[^"]*">)[^<]*(<\/desc>)/, `$1${esc(`A square paper agent with a meridian globe on its antenna, ${r.prop}. ${r.mean}`)}$2`);
  return svg; };

/* ---------- registry for later lanes ---------- */
const AC = globalThis.AgentCast && typeof globalThis.AgentCast === 'object' ? globalThis.AgentCast : (globalThis.AgentCast = {});
AC.roles = AC.roles || {};
ROLES.forEach(r => { AC.roles[r.k] = { name:r.name, mean:r.mean, persona:r.persona, sig:r.sig, expression:r.expr, action:r.act, wash:WK[r.grp], droop:r.side,
  prop:() => mkProp(r), act:ch => play(r, ch), svg:o => roleSvg(r, o) }; });

/* ---------- atom: the lineup ---------- */
if (typeof atom !== 'function') return;
const EXg = Object.fromEntries(R.EXPRESSIONS.map(e => [e.k, e.p.gw ?? 0]));
const REPLAY = '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>';
const START = 4;  // the designer steps forward first
atom({ id:'agentcastb', cat:'Agent identity', name:'Agent cast: operate and people roles', block:'AgentCharacter roles (proposed)', fam:['M', 'S', 'D', 'T'], wide:true, tall:true,
  html:`<style>
.ckb-w{position:absolute;inset:0;container-type:inline-size;text-align:left}
.ckb-sv{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
.ckb-fl{fill:none;stroke:var(--line);stroke-width:1.2;stroke-linecap:round}
.ckb-ln{position:absolute;left:0;right:0;top:0;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain;z-index:2}
.ckb-ln::-webkit-scrollbar{display:none}
.ckb-ln.ckb-free{scroll-snap-type:none}
.ckb-sp{flex:none;height:1px}
.ckb-c{flex:none;scroll-snap-align:center;display:flex;align-items:flex-end;justify-content:center;border:0;background:none;padding:0 2px 8px;margin:0;border-radius:12px;cursor:pointer;color:var(--muted);-webkit-tap-highlight-color:transparent}
.ckb-c span{font-size:11.5px;line-height:1.25;text-align:center;text-wrap:balance}
.ckb-c[aria-pressed=true] span{color:var(--ink);font-weight:600}
.ckb-c:focus-visible{outline:2px solid var(--accent);outline-offset:-3px}
.ckb-hit{position:absolute;border:0;background:none;padding:0;margin:0;border-radius:16px;cursor:pointer;z-index:2;-webkit-tap-highlight-color:transparent}
.ckb-hit:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.ckb-in{position:absolute;z-index:2;display:flex;flex-direction:column;gap:10px;max-width:46ch}
.ckb-ly{display:grid}.ckb-ly>span{grid-area:1/1}
.ckb-nm>span{font-size:24px;font-weight:600;letter-spacing:-.02em;line-height:1.2}
.ckb-jb>span{font-size:15px;line-height:1.45}
.ckb-ps>span{font-size:13.5px;line-height:1.45;color:var(--muted)}
.ckb-sg>span{font-size:12.5px;line-height:1.45;color:var(--faint)}
.ckb-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:2px}
.ckb-pl{display:inline-flex;align-items:center;gap:6px;height:32px}
.ckb-ht{font-size:12px;color:var(--faint)}
.ckb-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@container (max-width:560px){.ckb-nm>span{font-size:21px}.ckb-jb>span{font-size:14px}.ckb-in{gap:8px}}
</style><div class="ckb-w"><svg class="ckb-sv" aria-hidden="true"><g class="ckb-lg"></g><path class="ckb-fl ckb-sf"/></svg>
<div class="ckb-ln" role="group" aria-label="Agent cast. Arrow keys move along the row."></div>
<button type="button" class="ckb-hit"></button>
<div class="ckb-in"><div class="ckb-ly ckb-nm"></div><div class="ckb-ly ckb-jb"></div><div class="ckb-ly ckb-ps"></div><div class="ckb-ly ckb-sg"></div>
<div class="ckb-row"><button type="button" class="btn ckb-pl">${ic(REPLAY, 14)}Play again</button><span class="ckb-ht">Tap an agent in the row.</span></div></div>
<p class="ckb-sr" aria-live="polite"></p></div>`,
  desc:'Twelve role characters on one rig stand in a row, each idling in character: the scheduler checks its ticking watch, support nods while it listens, the designer draws a square in the air that lingers then fades, the developer types on keys that dip, the archivist lifts its box lid and lets it settle. Tap one and the others step back in a ripple from the one you chose while it hops forward and lands with a squash; then its name and job swap in, it switches to its action mood and plays its signature move. Props trail the body on lagging springs, so every hop, lean and landing carries through them. On a phone the row scrolls sideways with snap above the focused stage.',
  api:'ch = AgentRig.create(svg, { prop:AgentCast.roles[k].prop(), droop, expression })  focus(i): others hop(.07) by |j − i|·40ms → ch hops to the stage → land → AgentCast.roles[k].act(ch)',
  init(st){
    injectCss();
    const svg = $(st, '.ckb-sv'), lg = $(st, '.ckb-lg'), sf = $(st, '.ckb-sf'), ln = $(st, '.ckb-ln'), hit = $(st, '.ckb-hit'), info = $(st, '.ckb-in'), sr = $(st, '.ckb-sr');
    const spL = document.createElement('span'), spR = document.createElement('span'); spL.className = spR.className = 'ckb-sp';
    ln.appendChild(spL);
    const cells = ROLES.map((r, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'ckb-c'; b.setAttribute('aria-pressed', 'false'); b.tabIndex = i ? -1 : 0;
      b.setAttribute('aria-label', `${r.name}. ${r.mean}`); b.innerHTML = `<span>${r.name}</span>`; b.onclick = () => focus(i); ln.appendChild(b); return b; });
    ln.appendChild(spR);
    // copy: one layer per role plus an intro layer, swapped exit-then-enter
    const L = [...ROLES.map(r => [r.name, r.mean, r.persona, r.sig]), ['Twelve agents, one species', 'Each role has its own prop, idle habit and mood.', 'They all share the square body and the meridian antenna.', '']];
    const lays = ['.ckb-nm', '.ckb-jb', '.ckb-ps', '.ckb-sg'].map(q => $(st, q));
    const layers = L.map(row => row.map((txt, j) => { const s = document.createElement('span'); s.textContent = txt; lays[j].appendChild(s); return s; }));
    const sw = new Swap(L.length - 1);
    const ag = ROLES.map((r, i) => {
      const ch = R.create(svg, { size:50, wash:WK[r.grp], seed:i*1.37 + .4, expression:r.expr, droop:r.side, prop:mkProp(r) }); ch.setBounds(-1e5, 1e5, -1e5);
      const a = { r, ch, i, line:true, sz:V(50), szT:50, op:V(1), opT:1, fly:false, pf:null, fx:0, pend:false, tf:null, os:null };
      ch.onLand = c => { if (!a.fly) return; a.fly = false; c.hx = a.fx; c.vx *= .2; if (a.pend){ a.pend = false; play(r, c, now()); } };
      return a; });
    let W = 0, H = 0, cw = 90, Ls = 50, Lf = 90, bandH = 120, pad = 12, Bs = 140, Sf = 400, Sx = 200, cur = -1, q = [], scA = null, started = false, lastT = null, lastSc = 0, lastP = -9;
    const ptr = { x:0, y:0, t:-9 };
    addEventListener('pointermove', e => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = now(); }, { passive:true });
    const off = (a, size) => -(a.r.ext[0] + a.r.ext[1])/2*size/54;
    const cellX = i => pad + cw*(i + .5);
    const lineX = (a, size) => cellX(a.i) + off(a, size);
    const stageX = a => Sx + off(a, Bs);
    const setSz = (a, v) => { const tp = a.ch.tip; a.ch.setSize(v); a.ch.tip = tp; };
    // move a character between the row's scrolled frame and the stage frame without a visible jump
    const shiftX = (a, d) => { const ch = a.ch; ch.x += d; ch.hx += d; if (ch.tip) ch.tip[0] += d; const s = ch.propS; if (s && s.lx != null) s.lx += d; ch.forced = null; ch.lk = null; };
    // a ballistic hop that lands exactly on (x, y); going up, the floor is only set once it starts to fall
    const hopTo = (a, x, y, apex) => { const ch = a.ch; a.fly = true; a.fx = x;
      if (RM){ ch.moveTo(x, y, true); ch.onLand(ch, 0); return; }
      const y0 = ch.y, top = Math.min(y0, y) - apex, vy0 = -Math.sqrt(2*GRAV*Math.max(1, y0 - top)), T = -vy0/GRAV + Math.sqrt(2*Math.max(1, y - top)/GRAV);
      ch.mode = 'air'; ch.thrown = false; ch.vx = (x - ch.x)/T; ch.vy = vy0; ch.hx = x;
      if (y < y0){ ch.floor = y0 + 1; a.pf = y; } else { ch.floor = y; a.pf = null; } };
    const reveal = i => { const max = ln.scrollWidth - ln.clientWidth; if (max <= 1) return; const to = clamp(cellX(i) - ln.clientWidth/2, 0, max);
      if (Math.abs(to - ln.scrollLeft) < 2) return; scA = new Track(ln.scrollLeft, S.soft); scA.set(to); ln.classList.add('ckb-free'); };
    const stopScroll = () => { if (scA){ scA = null; ln.classList.remove('ckb-free'); } };
    ['wheel', 'touchstart', 'pointerdown'].forEach(ev => ln.addEventListener(ev, stopScroll, { passive:true }));
    const forward = a => { const ch = a.ch; shiftX(a, -ln.scrollLeft); a.line = false; a.szT = Ls; a.grow = true; a.opT = 1; a.pend = true; ch.set(a.r.expr); svg.appendChild(ch.el); hopTo(a, stageX(a), Sf, 14); };
    const back = a => { const ch = a.ch; shiftX(a, ln.scrollLeft); a.line = true; a.szT = Ls*.9; a.grow = false; a.opT = .86; a.pend = false; if (ch.propS) ch.propS.at = -99; ch.set(a.r.expr); hopTo(a, lineX(a, Ls*.9), Lf, 18); };
    const focus = i => {
      const t = now();
      if (i === cur){ const a = ag[i]; if (!a.line && !a.fly) play(a.r, a.ch, t); return; }
      const prev = cur; cur = i; sw.to(i); reveal(i);
      cells.forEach((b, j) => { b.setAttribute('aria-pressed', i === j); b.tabIndex = i === j ? 0 : -1; });
      sr.textContent = `${ROLES[i].name}. ${ROLES[i].mean} ${ROLES[i].persona}`;
      hit.setAttribute('aria-label', `Play the ${ROLES[i].name.toLowerCase()}’s signature move again`);
      if (prev >= 0 && !ag[prev].line) back(ag[prev]);
      q.push([t + (prev >= 0 ? .12 : 0), () => { if (cur === i && ag[i].line) forward(ag[i]); }]);
      // everyone else steps back in a ripple that spreads out from the one you chose
      ag.forEach((a, j) => { if (j === i || j === prev) return; a.szT = Ls*.9; a.opT = .86; q.push([t + .05 + Math.abs(j - i)*.04, () => a.ch.hop(.07)]); });
    };
    ln.addEventListener('keydown', e => { const n = { ArrowRight:cur + 1, ArrowLeft:cur - 1, Home:0, End:ROLES.length - 1 }[e.key]; if (n == null) return; e.preventDefault();
      const k = clamp(n, 0, ROLES.length - 1); focus(k); cells[k].focus({ preventScroll:true }); });
    const replay = () => { const a = ag[cur]; if (a && !a.line && !a.fly) play(a.r, a.ch, now()); };
    hit.onclick = replay; $(st, '.ckb-pl').onclick = replay;
    const layout = () => {
      W = st.clientWidth; H = st.clientHeight; if (!W || !H) return; svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const ph = W < 560, tab = W < 900;
      cw = ph ? 88 : tab ? 86 : Math.min(98, (W - 24)/12); Ls = Math.round(Math.min(60, cw*.64));
      Lf = Math.round(16 + Ls*1.52); bandH = Lf + 38;
      pad = cw*12 + 24 <= W ? (W - cw*12)/2 : 12;
      ln.style.height = px(bandH); spL.style.width = spR.style.width = px(pad); cells.forEach(b => { b.style.width = px(cw); b.style.height = px(bandH); });
      Bs = ph ? Math.round(clamp(W*.44, 110, 146)) : tab ? 150 : Math.round(clamp((H - bandH - 80)/1.62, 120, 160));
      Sf = ph ? Math.round(bandH + 30 + Bs*1.5) : H - 62; Sx = ph ? W/2 : W*(tab ? .27 : .26);
      Object.assign(info.style, ph ? { left:'16px', right:'16px', top:px(Sf + 22), width:'' } : { left:px(W*(tab ? .53 : .5)), right:'24px', top:px(bandH + 40), width:'' });
      sf.setAttribute('d', ph ? `M16 ${Sf}H${W - 16}` : `M${n2(Sx - Bs*.95)} ${Sf}H${n2(Sx + Bs*1.25)}`);
      lg.innerHTML = ROLES.map((r, i) => `<path class="ckb-fl" d="M${n2(cellX(i) - cw*.3)} ${Lf}H${n2(cellX(i) + cw*.3)}"/>`).join('');
      ag.forEach(a => { const ch = a.ch; a.fly = false; a.pf = null;
        if (a.line){ const s = cur < 0 ? Ls : Ls*.9; a.szT = s; a.sz = V(s); setSz(a, s); ch.moveTo(lineX(a, s), Lf, true); }
        else { a.grow = false; a.szT = Bs; a.sz = V(Bs); setSz(a, Bs); ch.moveTo(stageX(a), Sf, true); if (a.pend){ a.pend = false; play(a.r, ch, now()); } } });
    };
    new ResizeObserver(layout).observe(st); layout();
    return t => {
      const dt = lastT == null ? 0 : clamp(t - lastT, 0, .05); lastT = t;
      if (!started){ started = true; q.push([t + .5, () => focus(START)]); }
      if (q.length){ const due = q.filter(e => e[0] <= t); if (due.length){ q = q.filter(e => e[0] > t); due.forEach(e => e[1]()); } }
      if (scA){ const v = scA.at(t); ln.scrollLeft = v; if (Math.abs(v - scA.target) < .5){ ln.scrollLeft = scA.target; stopScroll(); } }
      const sc = ln.scrollLeft, dS = sc - lastSc; lastSc = sc;
      const lt = `translate(${n2(-sc)} 0)`; if (lg.getAttribute('transform') !== lt) lg.setAttribute('transform', lt);
      const r = svg.getBoundingClientRect(), pA = t - ptr.t < 2.2, pNew = ptr.t !== lastP; if (pNew) lastP = ptr.t;
      const fa = cur >= 0 ? ag[cur] : null;
      ag.forEach(a => {
        const ch = a.ch, o = a.line ? sc : 0, tfm = a.line ? lt : '';
        if (a.tf !== tfm){ a.tf = tfm; if (tfm) ch.el.setAttribute('transform', tfm); else ch.el.removeAttribute('transform'); }
        // scrolling the row is felt: bodies lean and props trail against the scroll
        if (a.line && dS && !RM){ ch.impulse(clamp(-dS*.003, -.35, .35)); if (ch.propS) ch.propS.ix[0] = clamp(ch.propS.ix[0] + dS/ch.u*.25, -9, 9); }
        if (a.pf != null && ch.mode === 'air' && ch.vy >= 0){ ch.floor = a.pf; a.pf = null; }
        // it stays row-sized on the way up and grows into the stage only once it starts to fall, so it never clips the top
        if (a.grow && (ch.mode !== 'air' || ch.vy >= 0)){ a.grow = false; a.szT = Bs; }
        if (pA && pNew) ch.lookAt(ptr.x - r.left + o, ptr.y - r.top);
        if (fa && fa !== a && fa.fly && a.line){ const fp = fa.ch.facePos(); ch.look(fp[0] + (fa.line ? 0 : sc), fp[1], .3); }
        // pointer tracking for every mood: while you move (or it is looking at its prop) the mood's own gaze yields
        const g = EXg[ch.cur] ?? 0, forced = ch.forced && ch.t < ch.forced.until; ch.T.gw = pA || forced ? Math.min(g, .2) : g;
        sp(a.sz, a.szT, 9, dt); if (Math.abs(a.sz[0] - ch.size) > .02) setSz(a, a.sz[0]);
        sp(a.op, a.opT, 10, dt); const os = a.op[0] > .995 ? '' : n2(a.op[0]); if (a.os !== os){ a.os = os; ch.el.style.opacity = os; }
        if (ch.propS) ch.propS.quiet = a.fly;
        ch.render(t);
      });
      if (fa && !fa.line){ const b = fa.ch.box(); hit.hidden = false; hit.style.left = px(b.x); hit.style.top = px(b.y); hit.style.width = px(b.w); hit.style.height = px(b.h); } else hit.hidden = true;
      layers.forEach((row, i) => row.forEach((el, j) => sw.apply(el, i, t, j ? 4 : 6)));
    };
  }
});
})();
