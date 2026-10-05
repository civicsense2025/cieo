/* ---- agent spot illustrations: sixteen agent states drawn in the role-icon hand ----
   The role icons at illustration scale: a paper plate, one soft leaf wash in the scene's group
   colour (Check blue, Content lavender, Operate green, People peach), a few confident round-capped
   strokes, objects drawn as simple friendly glyphs (page, lens, pin, pencil, key, envelope, clock)
   and the small tilted equator under the subject. Agents are the square tile mark (the role-icon
   tile: rounded square, leaf wash, meridian); people are round heads. One description per drawing
   feeds both the live atom (JS springs) and the standalone SVG files (CSS keyframes sampled from
   the same springs). */
(() => {
const VW = 280, VH = 440;
const INK = '#1d1d1b', PAPER = '#faf7f2', NODE = '#faf7f2';
// the role-icon group washes, one per scene
const WASH = { check:'#dce8fb', content:'#f1e4ff', ops:'#e2f1ea', people:'#fee8e0' };
const GROUPS = { check:'Check', content:'Content', ops:'Operate', people:'People' };
// plates stay paper in both themes, like the role icons (WASH_DARK kept for reference)
const WASH_DARK = { check:'#27364c', content:'#352e4a', ops:'#243c33', people:'#43322f' };
const wgrp = col => Object.keys(WASH).find(k => WASH[k] === col);
const LW = 3.2, LW2 = 2.6;              // main line and inner-glyph line on the 280 plate
// critically damped (z = 1) presets for the drawings; slower than UI chrome on purpose
const TRACE = { w:4.2 }, SETTLE = { w:6.5 }, STEP = { w:5 };
const ENTER = 2.6;                       // seconds an enter sequence may take before ambient motion starts
const r1 = v => String(Math.round(v*10)/10), r3 = v => String(Math.round(v*1000)/1000);

/* ---------- drawing vocabulary ---------- */
const N = (t, a, o = {}) => ({ t, a, ...o });
const P = (d, k = 'ink', m) => N('path', { d }, { k, m });
const Rc = (x, y, w, h, rx, k = 'ink', m) => N('rect', { x:r1(x), y:r1(y), width:r1(w), height:r1(h), rx:r1(rx) }, { k, m });
const Ci = (cx, cy, r, k = 'ink', m) => N('circle', { cx:r1(cx), cy:r1(cy), r:r1(r) }, { k, m });
const G = (kids, m, id) => N('g', {}, { kids, m, id });
const Gt = (kids, tf) => N('g', { transform:tf }, { kids });     // static placement (rotation only, so strokes keep their weight)
// motions: e = once on enter, a = stepped ambient loop (state per step, spring between steps)
const dr = (d = 0) => ({ e:{ from:{ dr:0 }, d, cfg:TRACE } });
const st = (d = 0, dx = 0, dy = -14, x = {}) => ({ ...x, e:{ from:{ tx:dx, ty:dy, op:0, ...(x.from || {}) }, d, cfg:SETTLE } });
const fd = (d = 0) => ({ e:{ from:{ op:0 }, d, cfg:SETTLE } });
const sig = (lo = .4, lag = 0) => ({ a:{ fn:k => ({ op:k % 2 ? lo : 1 }), n:2, lag } });
const turn = (cx, cy, th0 = .62, lag = 0) => ({ o:[cx, cy], rest:{ th:th0 }, a:{ fn:k => ({ th:th0 + k*Math.PI/2 }), n:4, lag } });
const tick = (cx, cy, deg = 30, lag = 0) => ({ o:[cx, cy], a:{ fn:k => ({ r:k*deg }), n:Math.round(360/deg), lag } });
const bob = (o, key, b, lag = 0) => ({ o, a:{ fn:k => ({ [key]:k % 2 ? b : 0 }), n:2, lag } });
const join = (...ms) => ms.reduce((a, m) => ({ ...a, ...m, rest:{ ...(a.rest || {}), ...(m.rest || {}) } }), {});

const rr = (x, y, w, h, r) => `M${r1(x + r)} ${r1(y)}H${r1(x + w - r)}A${r1(r)} ${r1(r)} 0 0 1 ${r1(x + w)} ${r1(y + r)}V${r1(y + h - r)}A${r1(r)} ${r1(r)} 0 0 1 ${r1(x + w - r)} ${r1(y + h)}H${r1(x + r)}A${r1(r)} ${r1(r)} 0 0 1 ${r1(x)} ${r1(y + h - r)}V${r1(y + r)}A${r1(r)} ${r1(r)} 0 0 1 ${r1(x + r)} ${r1(y)}Z`;

// the leaf wash from the role icons (64 grid: M14 52C19 21 45 12 55 20C49 44 34 55 14 52Z), placed by centre, size and turn
const LEAF = [[14, 52], [19, 21], [45, 12], [55, 20], [49, 44], [34, 55], [14, 52]];
const leafD = (cx, cy, w, h, rot = 0) => { const c = Math.cos(rot*Math.PI/180), s = Math.sin(rot*Math.PI/180);
  const p = LEAF.map(([x, y]) => { const u = (x - 34.5)/41*w, v = (y - 33.5)/43*h; return r1(cx + u*c - v*s) + ' ' + r1(cy + u*s + v*c); });
  return `M${p[0]}C${p[1]} ${p[2]} ${p[3]}C${p[4]} ${p[5]} ${p[6]}Z`; };
// the scene wash: one leaf behind the subject that breathes while the card is active
// (motion sits on a wrapper so the path keeps its own wash opacity in both themes)
const wash = (cx, cy, w, h, rot, col) => G([N('path', { d:leafD(cx, cy, w, h, rot), fill:col }, { k:'wash', cls:'ail-w-' + wgrp(col) })],
  { o:[cx, cy], e:{ from:{ op:0 }, d:0, cfg:SETTLE }, a:{ fn:k => ({ sc:k % 2 ? 1.035 : 1 }), n:2 } }, 'wash');
// the equator cue from the role icons: a short line under the subject at the icon's tilt (5 in 32)
const eqLine = (x, y, len = 128) => P(`M${r1(x)} ${r1(y)}L${r1(x + len)} ${r1(y - len*5/32)}`, 'ink', dr(.15));

// the agent: the role-icon tile at illustration size. Rounded square, leaf wash, meridian (turns about its axis), tilted equator
const tile = (cx, cy, s, col, o = {}) => {
  const u = s/64, x0 = cx - s/2, y0 = cy - s/2, X = v => r1(x0 + v*u), Y = v => r1(y0 + v*u);
  const arc = P(`M${r1(cx)} ${Y(15)}C${r1(cx + 24*u)} ${Y(21.8)} ${r1(cx + 24*u)} ${Y(42.2)} ${r1(cx)} ${Y(49)}`, 'mid');
  const th = o.th ?? .62, mer = G([arc], o.still ? { o:[cx, cy], rest:{ th } } : turn(cx, cy, th, o.lag || 0));
  const glyph = o.glyph ? o.glyph(x0, y0, u) : [P(`M${r1(cx)} ${Y(15)}V${Y(49)}`, 'mid'), mer, P(`M${X(15)} ${Y(35)}L${X(49)} ${Y(29)}`, 'mid')];
  return G([Rc(x0, y0, s, s, s*.25, o.fill ? 'node' : 'ink'), N('path', { d:leafD(x0 + 34.5*u, y0 + 33.5*u, 41*u, 43*u), fill:col }, { k:'wash', cls:'ail-w-' + wgrp(col) }), ...glyph], o.m, o.id || 'agent');
};
// a person: round head, shoulders as one soft arch
const head = (cx, cy, r, m, id = 'person') => G([Ci(cx, cy, r),
  P(`M${r1(cx - 1.9*r)} ${r1(cy + 3.1*r)}C${r1(cx - 1.9*r)} ${r1(cy + 1.8*r)} ${r1(cx - 1.05*r)} ${r1(cy + 1.45*r)} ${r1(cx)} ${r1(cy + 1.45*r)}C${r1(cx + 1.05*r)} ${r1(cy + 1.45*r)} ${r1(cx + 1.9*r)} ${r1(cy + 1.8*r)} ${r1(cx + 1.9*r)} ${r1(cy + 3.1*r)}`)], m, id);
// a page: rounded sheet with a folded corner and a few full-weight lines [x0, y, x1]; traced on enter
const page = (x, y, w, h, lines = [], o = {}) => {
  const f = o.f ?? 26, r = o.r ?? 10, d = o.d ?? 0;
  const out = `M${r1(x + r)} ${r1(y)}H${r1(x + w - f)}L${r1(x + w)} ${r1(y + f)}V${r1(y + h - r)}A${r} ${r} 0 0 1 ${r1(x + w - r)} ${r1(y + h)}H${r1(x + r)}A${r} ${r} 0 0 1 ${r1(x)} ${r1(y + h - r)}V${r1(y + r)}A${r} ${r} 0 0 1 ${r1(x + r)} ${r1(y)}Z`;
  const fold = `M${r1(x + w - f)} ${r1(y)}V${r1(y + f - 6)}Q${r1(x + w - f)} ${r1(y + f)} ${r1(x + w - f + 6)} ${r1(y + f)}H${r1(x + w)}`;
  const kids = [...(o.fill ? [N('path', { d:out }, { k:'fillOnly', m:fd(d) })] : []), P(out, 'ink', o.still ? null : dr(d)), P(fold, 'ink', o.still ? null : dr(d + .3)),
    ...lines.map((L, i) => P(`M${r1(L[0])} ${r1(L[1])}H${r1(L[2])}`, o.lk || 'ink', o.still ? null : dr(d + .45 + i*.09)))];
  return G(o.tf ? [Gt(kids, o.tf)] : kids, o.m, o.id || 'page');
};
// a lens: ring and handle (handle angle in degrees)
const lens = (cx, cy, r, ang = 45) => { const c = Math.cos(ang*Math.PI/180), s = Math.sin(ang*Math.PI/180);
  return [Ci(cx, cy, r), P(`M${r1(cx + r*c)} ${r1(cy + r*s)}L${r1(cx + r*1.85*c)} ${r1(cy + r*1.85*s)}`)]; };
// Velo pin: ink teardrop with a paper eye, tip at (x, y)
const pin = (x, y, d, id) => G([P(`M${x} ${y}C${x - 3} ${y - 7} ${x - 12} ${y - 13} ${x - 12} ${y - 23}A12 12 0 1 1 ${x + 12} ${y - 23}C${x + 12} ${y - 13} ${x + 3} ${y - 7} ${x} ${y}Z`, 'solid'), Ci(x, y - 23, 4.2, 'knockFill')], st(d, 0, -18), id);
// speech bubble with a tail on its bottom edge between ax and bx, pointing to (tx, ty)
const bubble = (x, y, w, h, r, ax, bx, tx, ty, k = 'node') => P(`M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${bx}L${tx} ${ty}L${ax} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`, k);
const check = (x, y, s = 1, k = 'ink', m) => P(`M${r1(x)} ${r1(y)}L${r1(x + 7*s)} ${r1(y + 7*s)}L${r1(x + 20*s)} ${r1(y - 8*s)}`, k, m);

// cubic polyline sampled by arc length, for things that travel along a path
const along = pts => { const S = [[...pts[0]]];
  for (let i = 1; i + 2 < pts.length; i += 3){ const [a, b, c, d] = [pts[i - 1], pts[i], pts[i + 1], pts[i + 2]];
    for (let j = 1; j <= 40; j++){ const t = j/40, m = 1 - t; S.push([0, 1].map(k => m*m*m*a[k] + 3*m*m*t*b[k] + 3*m*t*t*c[k] + t*t*t*d[k])); } }
  const L = [0]; for (let i = 1; i < S.length; i++) L.push(L[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
  const tot = L[L.length - 1], d = 'M' + r1(pts[0][0]) + ' ' + r1(pts[0][1]) + Array.from({ length:(pts.length - 1)/3 }, (_, i) => 'C' + pts.slice(1 + i*3, 4 + i*3).map(p => r1(p[0]) + ' ' + r1(p[1])).join(' ')).join('');
  return { d, at(f){ const s = clamp(f)*tot; let i = 1; while (i < L.length - 1 && L[i] < s) i++; const q = (s - L[i - 1])/((L[i] - L[i - 1]) || 1); return [lerp(S[i - 1][0], S[i][0], q) - S[0][0], lerp(S[i - 1][1], S[i][1], q) - S[0][1]]; } };
};

/* ---------- the sixteen drawings ---------- */
const ART = [
{ slug:'no-agents', grp:'content', title:'No agents yet', cap:'Invite an agent when you want a second look at your site.', P:3.6,
  alt:'A page with a magnifying lens resting against its corner, nobody holding it. Above, a faint empty tile with a plus marks where an agent can join.',
  draw:() => { const C = WASH.content;
    return { wash:[wash(122, 244, 196, 236, -8, C)],
      structure:[page(56, 150, 132, 170, [[78, 210, 146], [78, 236, 164], [78, 262, 124]])],
      agents:[G([Rc(178, 78, 64, 64, 16), P('M210 98V122M198 110H222')], join({ rest:{ op:.42 } }, fd(.9), { a:{ fn:k => ({ op:k % 2 ? .7 : .42 }), n:2 } }), 'empty-slot')],
      accents:[G(lens(184, 296, 30, 50), st(.7, 14, -12, bob([184, 296], 'tx', -8)), 'lens')],
      eq:eqLine(70, 372) }; } },

{ slug:'invite', grp:'people', title:'Invite an agent', cap:'Choose what it can see and do. Nothing starts until you say so.', P:3.4,
  alt:'An open envelope. The agent tile rises out of it like a card being read, while a person watches from the upper left.',
  draw:() => { const C = WASH.people;
    return { wash:[wash(150, 248, 204, 224, 10, C)],
      structure:[G([P(rr(66, 240, 156, 108, 12)), P('M72 244L144 196L216 244')], dr(0), 'envelope')],
      people:[head(70, 112, 16, st(.3, 0, 10))],
      agents:[tile(144, 236, 82, C, { fill:true, m:st(.6, 0, 46) })],
      accents:[N('path', { d:'M66 262L144 310L222 262V336A12 12 0 0 1 210 348H78A12 12 0 0 1 66 336Z' }, { k:'node', m:fd(0), id:'pocket' })],
      eq:eqLine(84, 384) }; } },

{ slug:'reviewing', grp:'check', title:'Reviewing your site', cap:'The agent reads your pages one section at a time.', P:3.2,
  alt:'A tall page and a magnifying lens that moves down it one line at a time. The agent sits at the lower left, its meridian turning.',
  draw:() => { const C = WASH.check, Y = [0, 28, 92, 120], scan = { a:{ fn:k => ({ ty:Y[k % 4] }), n:4 } };
    return { wash:[wash(160, 222, 200, 262, -6, C)],
      structure:[page(98, 86, 142, 228, [[120, 146, 200], [120, 174, 216], [120, 202, 178], [120, 238, 208], [120, 266, 172]])],
      agents:[tile(62, 350, 66, C, { m:st(.5, -12, 0) })],
      accents:[G([G(lens(162, 146, 27, 45), scan)], st(.9, 12, -16), 'lens')],
      eq:eqLine(112, 352, 124) }; } },

{ slug:'comments', grp:'check', title:'Agent left comments', cap:'Each pin marks something to look at. Open one to read the note.', P:3.6,
  alt:'A page with two ink pins settling onto its lines one after another, and a speech bubble above the first pin. The agent sits below the page.',
  draw:() => { const C = WASH.check;
    return { wash:[wash(138, 232, 208, 250, 8, C)],
      structure:[page(58, 104, 152, 210, [[80, 166, 168], [80, 194, 190], [80, 222, 146], [80, 262, 178], [80, 290, 134]])],
      agents:[tile(72, 362, 62, C, { m:st(.4, -8, 8) })],
      accents:[pin(166, 196, 1.0, 'pin-1'), pin(122, 272, 1.25, 'pin-2'),
        G([bubble(168, 74, 86, 58, 16, 184, 200, 176, 152), P('M184 96H236M184 112H214')], st(1.6, 0, 10, bob([210, 103], 'ty', -4)), 'comment')],
      eq:eqLine(118, 350, 118) }; } },

{ slug:'waiting', grp:'people', title:'Waiting for your decision', cap:'The agent has a suggestion and needs your answer to go on.', P:3.4,
  alt:'The agent tile holds still with a speech bubble above it carrying a question mark that tips gently. A person looks on from the lower right.',
  draw:() => { const C = WASH.people, q = (x, y) => r1(180 + x*1.7) + ' ' + r1(152 + y*1.7);
    return { wash:[wash(146, 230, 204, 236, -10, C)],
      structure:[G([bubble(118, 102, 124, 96, 22, 134, 160, 128, 226)], st(.6, 0, 14), 'bubble')],
      people:[head(222, 300, 17, st(.35, 0, 10))],
      agents:[tile(92, 284, 90, C, { still:true, m:st(.15, -6, 6) })],
      accents:[G([P(`M${q(-7, -10)}C${q(-7, -19)} ${q(7, -19)} ${q(7, -10)}C${q(7, -4)} ${q(0, -3)} ${q(0, 3)}`, 'ink', dr(1.0)), Ci(180, 152 + 11*1.7, 2.6, 'solid', fd(1.3))],
        { o:[180, 160], a:{ fn:k => ({ r:k % 2 ? 9 : 0 }), n:2 } }, 'question')],
      eq:eqLine(50, 364, 130) }; } },

{ slug:'handoff', grp:'people', title:'Hand off to a person', cap:'Send this to a teammate with the notes and screenshots so far.', P:3.6,
  alt:'The agent tile at the upper left passes a small page along a soft curve to a person at the lower right.',
  draw:() => { const C = WASH.people, A = along([[126, 156], [192, 150], [230, 206], [198, 258]]);
    return { wash:[wash(142, 236, 204, 252, 20, C)],
      structure:[P(A.d, 'mid', dr(.3))],
      people:[head(202, 306, 18, st(.15, 0, 10))],
      agents:[tile(84, 132, 84, C, { m:st(0, -8, -8) })],
      accents:[G([page(108, 134, 36, 44, [[115, 154, 131], [115, 164, 127]], { f:11, r:5, fill:true, still:true, lk:'mid' })], { e:{ from:{ fl:0, op:0 }, d:.9, cfg:{ w:3.2 } }, path:A, rest:{ fl:1 } }, 'document')],
      eq:eqLine(128, 392, 118) }; } },

{ slug:'took-over', grp:'content', title:'You took over', cap:'The agent paused so you can make this change yourself.', P:3.2,
  alt:'A pencil writes a new line on a page. The agent tile sits set aside at the upper left, still, with a small pause badge on its corner.',
  draw:() => { const C = WASH.content;
    return { wash:[wash(150, 252, 208, 240, -6, C)],
      structure:[page(56, 150, 156, 196, [[78, 210, 170], [78, 236, 188], [78, 262, 140]]), P('M78 290H160', 'ink', dr(1.0))],
      agents:[tile(84, 92, 64, C, { still:true, m:join(st(.35, 0, -8), { o:[84, 92], rest:{ r:-7 } }) }),
        G([Ci(114, 62, 13, 'node'), P('M110 56V68M118 56V68', 'mid')], st(.7, 0, -6), 'pause')],
      accents:[G([Gt([P('M0 0L16 -7H70A4 4 0 0 1 74 -3V3A4 4 0 0 1 70 7H16Z', 'node'), P('M16 -7V7M58 -7V7', 'mid')], 'translate(160 290) rotate(-48)')],
        { e:{ from:{ tx:-82, op:0 }, d:1.0, cfg:TRACE }, ...bob([160, 290], 'ty', -3) }, 'pencil')],
      eq:eqLine(90, 380) }; } },

{ slug:'complete', grp:'check', title:'Review complete', cap:'Every page has been checked. Your report is ready.', P:3.6,
  alt:'A page with three ticked lines. A round ink seal with a check settles on its lower corner, and the agent rests beside it.',
  draw:() => { const C = WASH.check;
    return { wash:[wash(140, 228, 204, 250, 6, C)],
      structure:[page(70, 104, 150, 206, []), ...[0, 1, 2].map(i => G([check(90, 174 + i*38, .9, 'ink', dr(.7 + i*.22)), P(`M124 ${170 + i*38}H${[196, 178, 190][i]}`, 'ink', dr(.75 + i*.22))]))],
      agents:[tile(76, 358, 60, C, { m:st(.3, -8, 8) })],
      accents:[G([Ci(212, 300, 27, 'solid'), check(200, 300, 1, 'knock')], st(1.5, 0, -14, bob([212, 300], 'r', 8)), 'seal')],
      eq:eqLine(116, 362, 124) }; } },

{ slug:'error', grp:'people', title:'Something went wrong', cap:'The agent lost its place on this page. Try again or check the link.', P:3.4,
  alt:'The agent tile tipped at the upper left. Its line loops once and stops short of a page that sits askew, with a small alert badge in the gap.',
  draw:() => { const C = WASH.people;
    return { wash:[wash(152, 244, 204, 250, 14, C)],
      structure:[page(150, 262, 92, 112, [[166, 312, 222], [166, 336, 204]], { f:20, r:8, d:.1, tf:'rotate(8 196 318)' }),
        P('M98 178C96 220 142 220 140 196C138 174 108 186 118 214C124 232 136 238 148 240', 'ink', dr(.45))],
      agents:[tile(88, 132, 80, C, { still:true, th:-.44, m:join(st(0, -6, -6), { o:[88, 132], rest:{ r:-9 } }) })],
      accents:[G([G([Ci(196, 206, 15, 'node'), P('M196 199V209', 'mid'), Ci(196, 215, 1.9, 'solid')], sig(.45))], st(1.4, 0, -10), 'alert')],
      eq:eqLine(96, 404, 136) }; } },

{ slug:'permission', grp:'content', title:'Permission needed', cap:'The agent needs access to this page before it can keep going.', P:3.4,
  alt:'A page with a padlock hanging on its lower corner, its shackle lifting slightly now and then. The agent waits below, still.',
  draw:() => { const C = WASH.content;
    return { wash:[wash(152, 226, 202, 250, -8, C)],
      structure:[page(86, 88, 150, 212, [[108, 148, 196], [108, 176, 212], [108, 204, 168]])],
      agents:[tile(70, 350, 70, C, { still:true, m:st(.5, -10, 0) })],
      accents:[G([G([P('M184 266V250A18 18 0 0 1 220 250V266')], bob([202, 266], 'ty', -6)), P(rr(168, 264, 68, 54, 13), 'node'), Ci(202, 286, 5, 'mid'), P('M202 291V300', 'mid')], st(.9, 0, -14), 'lock')],
      eq:eqLine(112, 352, 126) }; } },

{ slug:'offline', grp:'ops', title:'Reconnecting', cap:'The agent lost its connection and is trying again.', P:3.2,
  alt:'The agent tile at the lower left with a cord running up to a plug. The plug reaches toward a round socket above it, backs off and tries again.',
  draw:() => { const C = WASH.ops;
    return { wash:[wash(136, 236, 206, 248, -12, C)],
      structure:[G([Ci(164, 106, 28), P('M156 100V112M172 100V112', 'mid')], st(.15, 0, -10), 'socket'),
        G([P('M86 316C86 262 164 266 164 222', 'ink'), P(rr(148, 184, 32, 38, 9), 'node'), P('M157 184V168M171 184V168', 'ink')], join(st(.6, 0, 24), bob([164, 200], 'ty', -12)), 'plug')],
      agents:[tile(84, 322, 84, C, { fill:true, still:true, m:fd(0) })],
      eq:eqLine(40, 396, 128) }; } },

{ slug:'together', grp:'ops', title:'Agents working together', cap:'Three agents split the review and share what they find.', P:3.6,
  alt:'Three agent tiles of different sizes gathered along the top of one shared page, each adding a line to it, their meridians turning out of step.',
  draw:() => { const C = WASH.ops;
    return { wash:[wash(142, 240, 222, 236, 4, C)],
      structure:[page(64, 220, 156, 132, [[86, 268, 186], [86, 294, 160], [86, 320, 174]], { d:.4 })],
      agents:[tile(78, 168, 62, C, { m:st(0, 0, -12), id:'agent-1' }), tile(150, 128, 76, C, { lag:.9, m:st(.15, 0, -12), id:'agent-2' }), tile(222, 170, 56, C, { lag:1.8, m:st(.3, 0, -12), id:'agent-3' })],
      eq:eqLine(96, 390) }; } },

{ slug:'path', grp:'content', title:'Following a path', cap:'The agent moves through your pages in the order a visitor would.', P:2.6,
  alt:'Three small pages climb from lower left to upper right along a soft winding line. A small agent tile travels the line, drawing it as it goes.',
  draw:() => { const C = WASH.content, A = along([[48, 376], [48, 318], [150, 322], [150, 262], [150, 200], [222, 160], [222, 86]]), S = [1, 1, 0, .5, 1];
    const fl = k => S[k % 5], op = k => k % 5 === 1 ? 0 : 1, snap = k => k % 5 === 2;
    return { wash:[wash(140, 236, 214, 268, -26, C)],
      structure:[G([P(A.d, 'ink', { a:{ fn:k => ({ dr:fl(k), op:op(k) }), n:5, snap } })], fd(.6), 'trail'),
        ...[[88, 326], [152, 244], [204, 149]].map(([x, y], i) => page(x - 26, y - 32, 52, 64, [[x - 14, y - 2, x + 10], [x - 14, y + 13, x + 4]], { f:14, r:7, fill:true, d:i*.15, lk:'mid', id:'page-' + (i + 1) }))],
      agents:[G([G([tile(48, 376, 48, C, { fill:true })], { path:A, rest:{ fl:1 }, a:{ fn:k => ({ fl:fl(k), op:op(k) }), n:5, snap } })], { e:{ from:{ op:0, ty:-10 }, d:.7, cfg:SETTLE } }, 'agent-track')],
      eq:eqLine(52, 400, 120) }; } },

{ slug:'evidence', grp:'check', title:'Evidence collected', cap:'A screenshot and a note are saved for each finding.', P:3.6,
  alt:'A photo of the page settles onto a note and a paper clip holds the two together. The agent rests below.',
  draw:() => { const C = WASH.check;
    return { wash:[wash(140, 232, 208, 250, 8, C)],
      structure:[page(56, 132, 122, 164, [[76, 186, 150], [76, 212, 158], [76, 238, 120]], { tf:'rotate(-6 117 214)' }),
        G([Gt([P(rr(124, 182, 102, 120, 9), 'node'), P(rr(136, 194, 78, 72, 6), 'mid'), Ci(190, 216, 8, 'mid'), P('M138 262C154 236 170 236 184 252C192 244 202 244 212 254', 'mid')], 'rotate(7 175 242)')],
          { o:[175, 242], e:{ from:{ ty:-26, op:0, r:10 }, d:.6, cfg:SETTLE } }, 'photo')],
      agents:[tile(72, 362, 60, C, { m:st(.9, -10, 0) })],
      accents:[G([Gt([P('M0 0V-34A7 7 0 0 1 14 -34V-6A4 4 0 0 1 6 -6V-28')], 'translate(150 200) rotate(12)')], dr(1.3), 'clip')],
      eq:eqLine(114, 352, 124) }; } },

{ slug:'scheduled', grp:'ops', title:'Scheduled run', cap:'The next review runs on Monday at 9:00.', P:3,
  alt:'A calendar with one day circled and a round clock above it whose minute hand ticks forward. The agent waits at the lower left.',
  draw:() => { const C = WASH.ops;
    return { wash:[wash(140, 230, 210, 248, -6, C)],
      structure:[G([P(rr(58, 172, 152, 132, 16)), P('M58 210H210')], dr(0), 'calendar'), P('M96 158V184', 'ink', dr(.25)), P('M172 158V184', 'ink', dr(.3)),
        Ci(164, 256, 17, 'ink', dr(1.0)), Ci(164, 256, 4.5, 'solid', fd(1.2)),
        G([Ci(212, 108, 38, 'node', fd(.5)), G([P('M212 108V82')], { ...tick(212, 108, 30), e:{ from:{ op:0 }, d:.7, cfg:SETTLE } }, 'hand'), P('M212 108L228 116', 'ink', dr(.8)), Ci(212, 108, 3.4, 'solid', fd(.8))], null, 'clock')],
      agents:[tile(76, 360, 60, C, { m:st(1.1, 0, -12) })],
      eq:eqLine(114, 342, 124) }; } },

{ slug:'revoked', grp:'ops', title:'Access revoked', cap:'This agent can no longer see your site. Its past notes stay.', P:3.4,
  alt:'A page with a sticky note still on it. The key has been set down on the ground line, and the agent sits outside, still.',
  draw:() => { const C = WASH.ops;
    return { wash:[wash(152, 222, 204, 236, 10, C)],
      structure:[page(104, 92, 142, 196, [[126, 152, 204], [126, 178, 222]]),
        G([Gt([P(rr(0, 0, 58, 58, 7), 'node'), P('M12 20H44M12 34H34', 'mid')], 'translate(158 206) rotate(6 29 29)')], st(.6, 0, -10), 'note')],
      agents:[tile(70, 332, 74, C, { still:true, m:st(.3, -10, 0) })],
      accents:[G([Gt([Ci(0, 0, 14), P('M14 0H66M54 0V11M64 0V9')], 'translate(140 354) rotate(-9)')], { o:[140, 354], e:{ from:{ ty:-48, op:0, r:-40 }, d:1.1, cfg:SETTLE } }, 'key')],
      eq:eqLine(124, 384, 126) }; } }
];

/* ---------- serializer: one description, two outputs ---------- */
const RC = { 'stroke-linecap':'round', 'stroke-linejoin':'round' };
const KIND = {
  ink:{ fill:'none', stroke:INK, 'stroke-width':LW, ...RC, c:'ail-k-st' },
  mid:{ fill:'none', stroke:INK, 'stroke-width':LW2, ...RC, c:'ail-k-st' },
  node:{ fill:NODE, stroke:INK, 'stroke-width':LW, ...RC, c:'ail-k-nd ail-k-st' },
  fillOnly:{ fill:NODE, c:'ail-k-nd' },
  solid:{ fill:INK, c:'ail-k-so' },
  knock:{ fill:'none', stroke:NODE, 'stroke-width':LW, ...RC, c:'ail-k-ks' },
  knockFill:{ fill:NODE, c:'ail-k-nd' },
  wash:{ opacity:.65, c:'ail-k-w' }
};
const LAYERS = [['color-wash', 'wash'], ['structure', 'structure'], ['people', 'people'], ['agents', 'agents'], ['accents', 'accents']];
const DEF = { tx:0, ty:0, r:0, sx:1, sc:1, op:1, dr:1 };
const TKEYS = ['tx', 'ty', 'r', 'th', 'sx', 'sc', 'fl'];
// a motion's state at enter time te and ambient time ta (Infinity / 0 = final, at rest)
const ev = (m, te, ta, P) => {
  const v = { ...DEF, ...(m.rest || {}) };
  if (m.e && te !== Infinity){ const p = clamp(prog(te, m.e.d || 0, m.e.cfg || SETTLE)), po = clamp(p*2.2);
    for (const k in m.e.from) v[k] = lerp(m.e.from[k], v[k], k === 'op' && !('dr' in m.e.from) ? po : p); }
  if (m.a && ta > 0){ const tau = ta - (m.a.lag || 0);
    if (tau > 0){ const k = Math.floor(tau/P), A = m.a.fn(k), B = m.a.fn(k + 1), p = clamp(prog(tau - k*P, 0, m.a.cfg || STEP)), sn = m.a.snap && m.a.snap(k + 1);
      for (const key in B) v[key] = (sn && key !== 'op') ? B[key] : lerp(A[key], B[key], p); }
    else { const A = m.a.fn(0); for (const key in A) v[key] = A[key]; } }
  else if (m.a){ const A = m.a.fn(0); for (const key in A) v[key] = A[key]; }
  if ('th' in v) v.sx = Math.sin(v.th);
  if ('fl' in v && m.path){ const q = m.path.at(v.fl); v.tx += q[0]; v.ty += q[1]; }
  if (v.dr < .003) v.op = 0;
  return v;
};
const tfAttr = (v, o = [0, 0]) => { let s = '';
  if (Math.abs(v.tx) > .01 || Math.abs(v.ty) > .01) s += `translate(${r1(v.tx)} ${r1(v.ty)})`;
  if (Math.abs(v.r) > .01) s += ` rotate(${r1(v.r)} ${o[0]} ${o[1]})`;
  if (Math.abs(v.sx - 1) > .001 || Math.abs(v.sc - 1) > .001) s += ` translate(${o[0]} ${o[1]}) scale(${r3((Math.abs(v.sx) < .002 ? .002 : v.sx)*v.sc)} ${r3(v.sc)}) translate(${-o[0]} ${-o[1]})`;
  return s.trim(); };
// origin math written out, so no transform-origin rule leaks onto the static transform attribute
const tfCss = (v, o = [0, 0]) => `translate(${r1(v.tx + o[0])}px,${r1(v.ty + o[1])}px) rotate(${r1(v.r)}deg) scale(${r3((Math.abs(v.sx) < .002 ? .002 : v.sx)*v.sc)},${r3(v.sc)}) translate(${-o[0]}px,${-o[1]}px)`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// walk the drawing: returns { body, specs } where specs[i] is the motion of data-ai="i"
const serial = (def, uid, inline) => {
  const L = def.draw(), specs = [];
  const node = n => {
    const kind = KIND[n.k] || {}, a = {}, cls = [];
    for (const key in kind) if (key !== 'c') a[key] = kind[key];
    if (kind.c) cls.push(kind.c);
    if (n.cls) cls.push(n.cls);
    Object.assign(a, n.a);
    if (n.id) a[inline ? 'data-g' : 'id'] = n.id;
    if (n.m){ const i = specs.length; specs.push(n.m); a['data-ai'] = i; cls.push('ail-m' + i);
      if ('dr' in (n.m.e?.from || {}) || n.m.a?.fn(0).dr !== undefined || n.m.rest?.dr !== undefined) a.pathLength = 1;
      const v = ev(n.m, Infinity, 0, def.P), t = tfAttr(v, n.m.o); if (t) a.transform = t; if (v.op < 1) a.opacity = r3(v.op);
      if (v.dr < 1){ a['stroke-dasharray'] = '1 1'; a['stroke-dashoffset'] = r3(1 - v.dr); } }
    if (cls.length) a.class = cls.join(' ');
    const at = Object.entries(a).map(([k, v]) => `${k}="${esc(typeof v === 'number' ? r1(v) : v)}"`).join(' ');
    return n.kids ? `<g ${at}>${n.kids.map(node).join('')}</g>` : `<${n.t} ${at}/>`;
  };
  const gid = s => inline ? `data-g="${s}"` : `id="${s}"`;
  let body = `<g ${gid('background')}><rect width="${VW}" height="${VH}" fill="${PAPER}" class="ail-k-bg"/></g>`;
  for (const [id, key] of LAYERS) if (L[key]?.length) body += `<g ${gid(id)}>${L[key].map(node).join('')}</g>`;
  if (L.eq) body += `<g ${gid('baseline')}>${node(L.eq)}</g>`;
  return { body, specs };
};

// standalone file: layered groups, motion as CSS keyframes sampled from the same springs
const fileSvg = def => {
  const uid = 'ail-' + def.slug, { body, specs } = serial(def, uid);
  let css = '';
  specs.forEach((m, i) => {
    const sel = `.ail-m${i}`, anims = [], o = m.o || [0, 0];
    const keysOf = st => { const k = new Set(); for (const key in st){ if (TKEYS.includes(key)) k.add('transform'); if (key === 'op') k.add('opacity'); if (key === 'dr'){ k.add('dash'); k.add('opacity'); } } return k; };
    const frame = (v, ks) => [ks.has('transform') ? `transform:${tfCss(v, o)}` : '', ks.has('opacity') ? `opacity:${r3(v.op)}` : '', ks.has('dash') ? `stroke-dasharray:1 1;stroke-dashoffset:${r3(1 - v.dr)}` : ''].filter(Boolean).join(';');
    if (m.e){ const ks = keysOf(m.e.from), D = 2.4, n = 30;
      css += `@keyframes ${uid}-e${i}{` + Array.from({ length:n + 1 }, (_, j) => `${r1(j/n*100)}%{${frame(ev({ ...m, a:null }, (m.e.d || 0) + j/n*D, 0, def.P), ks)}}`).join('') + '}';
      anims.push(`${uid}-e${i} ${D}s linear ${r1(m.e.d || 0)}s backwards`); }
    if (m.a){ const ks = keysOf(m.a.fn(1)), steps = m.a.n, n = steps*14, D = steps*def.P, start = ENTER + (m.a.lag || 0);
      css += `@keyframes ${uid}-a${i}{` + Array.from({ length:n + 1 }, (_, j) => `${r1(j/n*100)}%{${frame(ev({ ...m, e:null }, Infinity, (m.a.lag || 0) + j/n*D + (j === n ? -1e-6 : 0), def.P), ks)}}`).join('') + '}';
      anims.push(`${uid}-a${i} ${r1(D)}s linear ${r1(start)}s infinite backwards`); }
    css += `${sel}{animation:${anims.join(',')}}`;
  });
  css += `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" fill="none" role="img" aria-labelledby="${uid}-title ${uid}-desc">\n<title id="${uid}-title">${esc(def.title)}</title>\n<desc id="${uid}-desc">${esc(def.alt)}</desc>\n<style>${css}</style>\n${body}\n</svg>\n`;
};

if (typeof module !== 'undefined' && module.exports) module.exports = { ART, fileSvg, WASH, GROUPS, LW, LW2, VW, VH, PAPER, INK };

/* ---------- the live atom ---------- */
let uidN = 0;
const instance = def => {
  const uid = 'ail-i' + (++uidN), { body, specs } = serial(def, uid, true);
  const wrap = document.createElement('span'); wrap.innerHTML = `<svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${body}</svg>`;
  const svg = wrap.firstChild, els = [...svg.querySelectorAll('[data-ai]')].map(el => ({ el, m:specs[+el.dataset.ai] }));
  els.forEach(x => { if (x.el.getAttribute('pathLength')) x.el.style.strokeDasharray = '1 1'; });
  const lastD = Math.max(0, ...specs.map(m => m.e ? (m.e.d || 0) : 0));
  return { def, svg, els, le:0, la:0, on:false, vis:false, enterEnd:lastD + 1.7,
    paint(te, ta){ for (const { el, m } of this.els){ const v = ev(m, te, ta, def.P), t = tfAttr(v, m.o);
      if (t) el.setAttribute('transform', t); else el.removeAttribute('transform');
      el.style.opacity = r3(v.op); if (el.style.strokeDasharray) el.style.strokeDashoffset = r3(1 - v.dr); } } };
};

atom({ id:'agentillustrations', cat:'Agent identity', name:'Agent spot illustrations', block:'EmptyState, AgentStatus art (proposed)', fam:['M','S','X','T'], wide:true, tall:true,
  art:{ list:ART, file:fileSvg },
  html:`<style>
.ail-root{position:absolute;inset:0;container-type:inline-size;display:flex;flex-direction:column;text-align:left;
  --ail-bg:#faf7f2;--ail-ink:#1d1d1b;--ail-node:#faf7f2;--ail-wo:.65;--ail-wcheck:#dce8fb;--ail-wcontent:#f1e4ff;--ail-wops:#e2f1ea;--ail-wpeople:#fee8e0}
.ail-root .ail-k-bg{fill:var(--ail-bg)}.ail-root .ail-k-st{stroke:var(--ail-ink)}.ail-root .ail-k-nd{fill:var(--ail-node)}.ail-root .ail-k-so{fill:var(--ail-ink)}.ail-root .ail-k-ks{stroke:var(--ail-node)}.ail-root .ail-k-w{opacity:var(--ail-wo)}.ail-root .ail-w-check{fill:var(--ail-wcheck)}.ail-root .ail-w-content{fill:var(--ail-wcontent)}.ail-root .ail-w-ops{fill:var(--ail-wops)}.ail-root .ail-w-people{fill:var(--ail-wpeople)}
.ail-root svg{display:block;width:100%;height:100%;overflow:hidden}
.ail-gal{flex:1;min-height:0;display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:22px 14px;padding:16px;overflow-y:auto;align-content:safe center;scrollbar-width:thin}
.ail-gal .ail-c{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.ail-card{position:relative;display:flex;flex-direction:column;gap:9px;border:0;background:none;padding:0;text-align:left;cursor:zoom-in;min-width:0;color:inherit;font:inherit;border-radius:10px}
.ail-card:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.ail-pl{display:block;aspect-ratio:280/440;border-radius:10px;overflow:hidden;background:var(--ail-bg);box-shadow:inset 0 0 0 1px var(--line-soft)}
.ail-tx{display:flex;flex-direction:column;gap:2px;padding:0 2px}
.ail-t{font-size:13px;font-weight:600;line-height:1.3;letter-spacing:-.005em}
.ail-c{font-size:12px;line-height:1.4;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ail-nav{display:none;align-items:center;justify-content:space-between;gap:12px;padding:0 16px 16px}
.ail-nav span{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
.ail-nav div{display:flex;gap:8px}
.ail-ib{width:36px;height:36px;display:grid;place-items:center;border:1px solid var(--line);background:var(--card);border-radius:9px;cursor:pointer;color:var(--ink)}
.ail-ib:disabled{opacity:.4;cursor:default}
.ail-lb{position:absolute;inset:0;z-index:30}
.ail-lb[hidden]{display:none}
.ail-scrim{position:absolute;inset:0;background:var(--tile)}
.ail-big{position:absolute;overflow:hidden;background:var(--ail-bg);box-shadow:inset 0 0 0 1px var(--line-soft)}
.ail-big>span{position:absolute;inset:0}
.ail-info{position:absolute;display:flex;flex-direction:column;gap:10px}
.ail-n{margin:0;font-size:12px;color:var(--faint);font-variant-numeric:tabular-nums;letter-spacing:.02em}
.ail-ts{display:grid}
.ail-ts>div{grid-area:1/1;display:flex;flex-direction:column;gap:6px}
.ail-ts h4{margin:0;font-size:22px;line-height:1.2;font-weight:600;letter-spacing:-.02em}
.ail-ts p{margin:0;font-size:14px;line-height:1.5;color:var(--muted);max-width:34ch}
.ail-act{display:flex;align-items:center;gap:8px;margin-top:6px}
.ail-act .btn{display:inline-flex;align-items:center;gap:6px;height:36px}
.ail-x{position:absolute;top:10px;right:12px}
@container (max-width:900px){.ail-gal{grid-template-columns:repeat(4,minmax(0,1fr));gap:24px 16px;align-content:start}.ail-gal .ail-c{position:static;width:auto;height:auto;overflow:visible;clip-path:none;white-space:normal;display:block}}
@container (max-width:560px){.ail-gal{flex:none;margin-top:auto;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;gap:14px;padding:16px;scroll-padding-inline:16px;align-items:flex-start;overscroll-behavior-x:contain}
  .ail-card{flex:none;width:min(78cqw,300px);scroll-snap-align:start}.ail-nav{display:flex;margin-bottom:auto}.ail-ts h4{font-size:19px}.ail-act{margin-top:2px}}
</style><div class="ail-root"><div class="ail-gal" role="list" aria-label="Agent illustrations"></div>
<div class="ail-nav"><span aria-live="polite"></span><div><button type="button" class="ail-ib" data-d="-1" aria-label="Previous illustration">${ic('<path d="M15 6l-6 6 6 6"/>', 16)}</button><button type="button" class="ail-ib" data-d="1" aria-label="Next illustration">${ic('<path d="M9 6l6 6-6 6"/>', 16)}</button></div></div>
<div class="ail-lb" role="dialog" aria-modal="true" aria-labelledby="agentillustrations-h0" hidden><div class="ail-scrim"></div><div class="ail-big"><span></span><span></span></div>
<div class="ail-info"><p class="ail-n num" aria-live="polite"></p><div class="ail-ts"><div><h4 id="agentillustrations-h0"></h4><p></p></div><div aria-hidden="true"><h4></h4><p></p></div></div>
<div class="ail-act"><button type="button" class="btn ail-rp">${ic('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>', 15)}Replay</button><button type="button" class="ail-ib" data-d="-1" aria-label="Previous illustration">${ic('<path d="M15 6l-6 6 6 6"/>', 16)}</button><button type="button" class="ail-ib" data-d="1" aria-label="Next illustration">${ic('<path d="M9 6l6 6-6 6"/>', 16)}</button></div></div>
<button type="button" class="ail-ib ail-x" aria-label="Close">${ic(I.x, 16)}</button></div></div>`,
  desc:'Sixteen spot drawings for agent states, drawn like the role icons at a larger size: a paper plate, one soft leaf wash in the scene\u2019s group colour, a few round-capped strokes, simple glyphs (page, lens, pin, pencil, key, envelope, clock) and the small tilted equator under the subject. Agents are the square role-icon tile and people are round heads. Each card traces its strokes when it first scrolls into view, then pins, seals and tiles settle on a critically damped spring; the wash breathes, the meridian turns in quarter steps and one small part moves (a lens scanning, a plug trying again, a clock ticking) only while you hover, focus or (on a phone) land on that card, and everything holds still off-screen or under reduced motion. Tapping a card grows its plate into a large view, the title and caption follow 80ms later, Previous and Next swap drawings (old one out, new one traces in) and Replay draws it again.',
  api:'card.enter → stroke.draw(spring) → pin.settle(t + d) · meridian.th += π/2 each step while active · plate.{x,y,w,h}.set(open ? frame : cardRect) · art.swap(i)',
  init(st){
    const gal = $(st,'.ail-gal'), nav = $(st,'.ail-nav'), lb = $(st,'.ail-lb'), big = $(st,'.ail-big'), info = $(st,'.ail-info'), scrim = $(st,'.ail-scrim');
    const slots = $$(big,':scope>span'), tsl = $$(st,'.ail-ts>div'), num = $(st,'.ail-n'), counter = $(nav,'span');
    const phone = () => st.clientWidth <= 560;
    let hover = -1, focusI = -1, cur = 0;
    const cards = ART.map((def, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ail-card'; b.setAttribute('role', 'listitem'); b.setAttribute('aria-haspopup', 'dialog');
      b.innerHTML = `<span class="ail-pl"></span><span class="ail-tx"><span class="ail-t"></span><span class="ail-c"></span></span>`;
      $(b,'.ail-t').textContent = def.title; $(b,'.ail-c').textContent = def.cap;
      const inst = instance(def); $(b,'.ail-pl').appendChild(inst.svg); if (!REDUCE) inst.paint(0, 0);
      b.onclick = () => open(i); b.onpointerenter = () => hover = i; b.onpointerleave = () => { if (hover === i) hover = -1; };
      b.onfocus = () => focusI = i; b.onblur = () => { if (focusI === i) focusI = -1; };
      gal.appendChild(b); return { b, inst, pl:$(b,'.ail-pl') }; });
    // visibility inside the gallery's own scroller: motion runs only for cards on screen
    const io = new IntersectionObserver(es => es.forEach(e => { const c = cards.find(x => x.b === e.target); if (!c) return; c.inst.vis = e.isIntersecting;
      if (e.isIntersecting && !c.inst.on){ c.inst.on = true; c.inst.le = 0; } }), { root:gal, threshold:.35 });
    cards.forEach(c => io.observe(c.b));
    // phone: native horizontal scroll, named buttons, counter, current card is the active one
    const setCur = () => { const L = gal.scrollLeft; let best = 0, bd = 1e9; cards.forEach((c, i) => { const d = Math.abs(c.b.offsetLeft - gal.offsetLeft - 16 - L); if (d < bd){ bd = d; best = i; } }); cur = best;
      counter.textContent = `${cur + 1} of ${ART.length}`; $$(nav,'button').forEach(x => x.disabled = (+x.dataset.d < 0 && cur === 0) || (+x.dataset.d > 0 && cur === ART.length - 1)); };
    gal.addEventListener('scroll', setCur, { passive:true }); setCur();
    $$(nav,'button').forEach(x => x.onclick = () => { const n = clamp(cur + +x.dataset.d, 0, ART.length - 1); gal.scrollTo({ left:cards[n].b.offsetLeft - gal.offsetLeft - 16, behavior:REDUCE ? 'auto' : 'smooth' }); });

    /* large view: the plate grows from the card (Morph), text follows, art swaps in place */
    const B = { x:new Track(0), y:new Track(0), w:new Track(0), h:new Track(0), r:new Track(10), o:new Track(0), i:new Track(0) };
    const sw = new Swap(0), tsw = new Swap(0); let isOpen = false, sel = -1, live = [null, null], liveK = 0, closing = false;
    const rectOf = el => { const a = el.getBoundingClientRect(), s = st.getBoundingClientRect(); return [a.left - s.left, a.top - s.top, a.width, a.height]; };
    const frame = () => { const W = st.clientWidth, H = st.clientHeight;
      if (W > 560){ const h = H - 56, w = h*VW/VH, iw = Math.min(330, W - w - 96), x = Math.max(24, (W - w - 40 - iw)/2);
        return { art:[x, 28, w, h], info:{ left:x + w + 40, top:0, width:iw, bottom:0, justify:'center' } }; }
      const w = Math.min(W - 64, (H - 230)*VW/VH), h = w*VH/VW, x = (W - w)/2;
      return { art:[x, 52, w, h], info:{ left:24, top:52 + h + 20, width:W - 48, bottom:null, justify:'flex-start' } }; };
    const setBox = (r, rad, inst) => { const k = inst ? 'jump' : 'set'; B.x[k](r[0]); B.y[k](r[1]); B.w[k](r[2]); B.h[k](r[3]); B.r[k](rad); };
    const layout = (inst) => { const f = frame(); setBox(f.art, 14, inst); Object.assign(info.style, { left:px(f.info.left), width:px(f.info.width), top:px(f.info.top), bottom:f.info.bottom === null ? 'auto' : px(f.info.bottom), justifyContent:f.info.justify }); };
    const fillText = (k, i) => { $(tsl[k],'h4').textContent = ART[i].title; $(tsl[k],'p').textContent = ART[i].cap; };
    const show = (i, fresh) => { sel = i; const k = fresh ? 0 : 1 - liveK, inst = instance(ART[i]); inst.on = true; inst.vis = true; inst.le = fresh ? 99 : -EXIT; inst.la = 0;
      if (!fresh && live[liveK]) live[liveK].vis = false;          // the outgoing drawing holds still while it exits
      slots[k].replaceChildren(inst.svg); live[k] = inst; liveK = k; sw.to(k); if (fresh){ sw.cur = k; sw.prev = null; sw.t = -9; }
      // text swap: the hidden layer takes the new copy; heading id stays on the visible layer
      const tk = fresh ? 0 : 1 - tsw.cur; fillText(tk, i); tsw.to(tk); if (fresh){ tsw.cur = tk; tsw.prev = null; tsw.t = -9; }
      tsl.forEach((d, j) => { d.setAttribute('aria-hidden', j !== tk); $(d,'h4').id = j === tk ? 'agentillustrations-h0' : ''; });
      num.textContent = `${String(i + 1).padStart(2, '0')} / ${ART.length}`;
      $$(info,'.ail-ib').forEach(x => x.disabled = (+x.dataset.d < 0 && i === 0) || (+x.dataset.d > 0 && i === ART.length - 1)); };
    const open = i => { isOpen = true; closing = false; lb.hidden = false; show(i, true);
      setBox(rectOf(cards[i].pl), 10, true); layout(false); B.o.set(1); B.i.set(1, S.base, now() + .08); setTimeout(() => $(lb,'.ail-x').focus(), 0); };
    const close = () => { if (!isOpen) return; isOpen = false; closing = true; const c = cards[sel];
      if (phone()) gal.scrollLeft = c.b.offsetLeft - gal.offsetLeft - 16; else { const gr = gal.getBoundingClientRect(), br = c.b.getBoundingClientRect(); if (br.top < gr.top || br.bottom > gr.bottom) gal.scrollTop += br.top - gr.top - 16; }
      setBox(rectOf(c.pl), 10); B.o.set(0, S.snap); B.i.set(0, S.snap); c.b.focus({ preventScroll:true }); };
    const step = d => { const n = sel + d; if (n < 0 || n >= ART.length || !isOpen) return; show(n, false); };
    $(lb,'.ail-x').onclick = close; $(st,'.ail-rp').onclick = () => { const L = live[liveK]; if (L){ L.le = 0; L.la = 0; } };
    $$(info,'.ail-ib').forEach(x => x.onclick = () => step(+x.dataset.d));
    lb.addEventListener('keydown', e => {
      if (e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){ e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); }
      else if (e.key === 'Tab'){ const f = $$(lb,'button').filter(x => !x.disabled); const a = f.indexOf(document.activeElement);
        if (e.shiftKey && a <= 0){ e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && a === f.length - 1){ e.preventDefault(); f[0].focus(); } } });
    scrim.onclick = close;
    new ResizeObserver(() => { if (isOpen) layout(true); setCur(); }).observe(st);

    let lt = null;
    const tickInst = (inst, dt, active) => {
      if (!inst.on || !inst.vis) return;
      if (REDUCE) return;
      inst.le += dt; if (inst.le < inst.enterEnd) active = false;
      // when inactive, finish the current step so the drawing comes to rest, then hold
      if (active || (inst.la > 0 && (inst.la % inst.def.P) < inst.def.P*.62)) inst.la += dt;
      inst.paint(inst.le, inst.la); };
    return t => {
      const dt = lt === null ? 0 : clamp(t - lt, 0, .05); lt = t;
      const ph = phone();
      cards.forEach((c, i) => tickInst(c.inst, isOpen ? 0 : dt, hover === i || focusI === i || (ph && cur === i)));
      if (!lb.hidden){
        live.forEach(L => L && tickInst(L, dt, true));
        Object.assign(big.style, { left:px(B.x.at(t)), top:px(B.y.at(t)), width:px(B.w.at(t)), height:px(B.h.at(t)), borderRadius:px(B.r.at(t)) });
        slots.forEach((s, k) => sw.apply(s, k, t, 0));
        const o = clamp(B.o.at(t)), ti = clamp(B.i.at(t)); scrim.style.opacity = r3(o); fade(info, ti, (1 - ti)*8); $(lb,'.ail-x').style.opacity = r3(ti);
        tsl.forEach((d, k) => tsw.apply(d, k, t, 4));
        cards.forEach((c, i) => c.pl.style.visibility = i === sel ? 'hidden' : 'visible');
        if (closing && B.x.prune(t) + B.y.prune(t) + B.w.prune(t) + B.h.prune(t) === 0){ closing = false; lb.hidden = true; cards[sel].pl.style.visibility = 'visible'; live.forEach(L => L && (L.vis = false)); }
      }
    };
  }
});
})();
