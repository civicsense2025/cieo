/* ---------- Agent identity: 24 action and state icons in the agent system ----------
   Same grammar as the agent mark: the square tile is the agent, the filled square is the agent's hand,
   and the world it works in is drawn with a arc arc and a tilted equator. Brand form = 64 grid,
   paper tile, one pale wash, 1.7 ink. Product form = square outline in currentColor, weight tuned per size.
   Every icon is a pure function of (u, size, form): u is seconds into its own loop and u = 0 is the resting
   drawing, so a loop always starts and ends at rest and playing never needs a blend. */
(() => {
const INK = '#1d1d1b', PAPER = '#faf7f2', WASHP = 'M14 52C19 21 45 12 55 20C49 44 34 55 14 52Z';
const WASH = { m:'#dce8fb', v:'#f1e4ff', ok:'#e4e9d3', bad:'#f6dcd9', warn:'#fbe6cc', n:'#ece9e2' };
// light-theme values of --success / --danger / --warning; the brand tile is paper in both themes
const STC = { success:'#595D17', danger:'#B0342F', warning:'#B45309' };
const GROUPS = [['Doing', 'On the page and in its own head'], ['Talking', 'With you and with other agents'], ['Waiting', 'Not moving, on purpose'], ['Outcome', 'How it ended']];
const r1 = v => String(Math.round(v*10)/10);
const P = d => `<path d="${d}"/>`;
const C = (x, y, r) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}"/>`;
const R = (x, y, w, h, rx = 0) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${rx}"/>`;
// the agent's hand: a filled rounded square
const SQ = (x, y, s, c, k = 1) => { const z = s*k; return z < .5 ? '' : `<rect x="${r1(x - z/2)}" y="${r1(y - z/2)}" width="${r1(z)}" height="${r1(z)}" rx="${r1(Math.min(2.5, z/3.4))}" fill="${c}" stroke="none"/>`; };
const OP = (s, o) => o >= .995 ? s : o <= .01 ? '' : `<g opacity="${o.toFixed(2)}">${s}</g>`;
const TR = (s, x, y) => `<g transform="translate(${r1(x)} ${r1(y)})">${s}</g>`;
const RT = (s, a) => Math.abs(a) < .05 ? s : `<g transform="rotate(${r1(a)} 32 32)">${s}</g>`;
// keyframes of critically damped steps: sq(u, rest, [[time, value, cfg?], ...]) returns to rest when the last key says so
const sq = (u, v0, ks, cfg = S.base) => { let v = v0, p = v0; for (const [t, x, c] of ks){ v += (x - p)*prog(u, t, c || cfg); p = x; } return v; };
const pt = a => `${r1(a[0])} ${r1(a[1])}`;
const mixP = (a, b, t) => [a[0] + (b[0] - a[0])*t, a[1] + (b[1] - a[1])*t];
const EQY = x => 35 - (x - 15)*6/34;
const arcD = (x, y0, y1, a) => { const h = y1 - y0; return `M${x} ${y0}C${r1(x + a)} ${r1(y0 + h*.2)} ${r1(x + a)} ${r1(y1 - h*.2)} ${x} ${y1}`; };
// partial cubic chain: s in [0, segs.length]
const cutC = (p0, p1, p2, p3, t) => { const a = mixP(p0, p1, t), b = mixP(p1, p2, t), c = mixP(p2, p3, t), d = mixP(a, b, t), e = mixP(b, c, t); return [p0, a, d, mixP(d, e, t)]; };
const cubD = (s, segs) => { let d = '', tip = segs[0][0];
  for (let i = 0; i < segs.length; i++){ const k = clamp(s - i); if (k <= .001) break; const q = k >= .999 ? segs[i] : cutC(...segs[i], k);
    if (!d) d = 'M' + pt(q[0]); d += 'C' + pt(q[1]) + ' ' + pt(q[2]) + ' ' + pt(q[3]); tip = q[3]; }
  return { d, tip }; };
// partial polyline between arc-lengths a and b
const polyLen = pts => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const polySlice = (pts, a, b) => { let d = '', tip = pts[0], at = 0;
  for (let i = 1; i < pts.length; i++){ const p = pts[i - 1], q = pts[i], L = Math.hypot(q[0] - p[0], q[1] - p[1]), s = Math.max(a, at), e = Math.min(b, at + L);
    if (e > s + .01){ const A = mixP(p, q, (s - at)/L), B = mixP(p, q, (e - at)/L); if (!d) d = 'M' + pt(A); d += 'L' + pt(B); tip = B; } else if (at + L <= a) tip = q; at += L; }
  return { d, tip }; };
const pencil = (tx, ty, l) => { const dd = .7071, A = k => [tx + dd*k, ty - dd*k], O = (p, s) => [p[0] + dd*s, p[1] + dd*s], hw = l ? 6 : 4.5, E = A(l ? 26 : 22), S1 = A(l ? 9 : 7);
  let s = P('M' + [[tx, ty], O(S1, -hw), O(E, -hw), O(E, hw), O(S1, hw)].map(pt).join('L') + 'Z'); if (!l){ const F = A(17); s += P(`M${pt(O(F, -hw))}L${pt(O(F, hw))}`); } return s; };

const DEFS = [];
const def = (k, n, g, w, L, st, d, draw) => DEFS.push({ k, n, g, w, L, st, d, draw });

/* ---- Doing ---- */
def('browsing', 'Browsing', 'Doing', 'm', 2.6, null, 'The square pupil looks from stop to stop along the equator, one page at a time, then settles in the centre.', m => {
  const l = m.lod, x = sq(m.u, 32, [[.3, 22], [.95, 41], [1.55, 26], [2.1, 32]]), y = 32 - (x - 32)*.18;
  return [['arcs', P(l ? 'M13 32C22 16 42 16 51 32C42 48 22 48 13 32Z' : 'M12 32C21 14 43 14 52 32C43 50 21 50 12 32Z')], ['agent', SQ(x, y, l ? 10 : 11, m.c)]]; });

const NV = [[[16, 46], [16, 40], [16, 35], [16, 30]], [[16, 30], [16, 22], [22, 22], [30, 22]], [[30, 22], [36, 22], [41, 22], [47, 22]]];
const NVL = NV.map(sg => sg.map(q => [32 + (q[0] - 32)*.84, 32 + (q[1] - 32)*.84]));
def('navigating', 'Navigating', 'Doing', 'm', 3, null, 'The trail pulls back to its start, then the square draws it again as it travels to the next page.', m => {
  const l = m.lod, s = sq(m.u, 3, [[.15, .1], [.75, 3]], S.soft), h = cubD(s, l ? NVL : NV), a0 = (l ? NVL : NV)[0][0];
  return [['trail', h.d ? P(h.d) : ''], ['nodes', l ? `<circle cx="${r1(a0[0])}" cy="${r1(a0[1])}" r="4" fill="${m.c}" stroke="none"/>` : C(16, 46, 3)], ['agent', SQ(h.tip[0], h.tip[1], l ? 12 : 9, m.c)]]; });

def('clicking', 'Clicking', 'Doing', 'm', 1.9, null, 'The pointer dips toward its target, the click marks pull in, then burst back out as it lands.', m => {
  const p = sq(m.u, 0, [[.3, 1], [.62, 0]], S.snap), ro = sq(m.u, 1, [[.04, 0], [.4, 1]]), rd = sq(m.u, 0, [[.04, -3.5], [.4, 0]]);
  const rays = m.lod ? '' : OP([['M14 17H19', -1, 0], ['M24 7V12', 0, -1], ['M16.5 9.5L20 13', -.7, -.7]].map(([d, x, y]) => TR(P(d), x*rd, y*rd)).join(''), ro);
  return [['click-marks', rays], ['pointer', TR(P('M24 16V45L31 38L36 49L41 47L36 36H45Z'), 1.8*p, 2.8*p)]]; });

def('typing', 'Typing', 'Doing', 'm', 2.4, null, 'The caret steps right one letter at a time and the line grows behind it, then clears for the next pass.', m => {
  const l = m.lod, y2 = l ? 39 : 38, w = sq(m.u, 13, [[.2, 0], [.55, 6], [.75, 11], [.95, 16], [1.15, 21], [1.35, 24], [2, 13]]);
  return [['text', (l ? P('M15 25H49') : P('M14 24H34M39 24H50')) + (w > .5 ? P(`M14 ${y2}H${r1(14 + w)}`) : '')], ['caret', P(`M${r1(14 + w + 6)} ${y2 - 7}V${y2 + 7}`)]]; });

def('scrolling', 'Scrolling', 'Doing', 'm', 2.6, null, 'The page lines slide up behind the tile edge while the scroll thumb travels down, then both settle back at the top.', m => {
  const l = m.lod, sp = l ? 14 : 12, y0 = l ? 20 : 21, k = sq(m.u, 0, [[.2, 1], [.8, 2.2], [1.5, 0]]), LN = l ? [20, 13, 20, 10] : [22, 15, 22, 12], tl = l ? 15 : 11;
  let s = ''; for (let j = -1; j <= 5; j++){ const y = y0 + j*sp - k*sp, o = clamp((y - 11)/3)*clamp((53 - y)/3); if (o > .01) s += OP(P(`M14 ${r1(y)}H${14 + LN[(j + 4)%4]}`), o); }
  const top = 19 + (k/2.2)*(28 - tl), th = l ? P(`M47 ${r1(top)}V${r1(top + tl)}`) : `<path d="M47 ${r1(top)}V${r1(top + tl)}" stroke-width="3.4"/>`;
  return [['page', s], ['track', l ? '' : OP(P('M47 17V47'), .35)], ['thumb', th]]; });

def('inspecting', 'Inspecting element', 'Doing', 'v', 2.4, null, 'The lens drifts over the page while the arc inside it swings, scanning for the element it wants.', m => {
  const l = m.lod, dx = sq(m.u, 0, [[.25, 2], [1, -2], [1.7, 0]]), dy = sq(m.u, 0, [[.25, -2], [1, 2], [1.7, 0]]), a = sq(m.u, 8, [[.3, -5], [1.1, 12], [1.8, 8]]);
  return [['lens', TR(R(12, 12, 28, 28, 8) + P(l ? 'M41 41L49 49' : 'M40 40L51 51') + (l ? '' : P('M26 19V33') + P(arcD(26, 19, 33, a))), dx, dy)]]; });

def('capturing', 'Capturing screenshot', 'Doing', 'v', 1.9, null, 'The four corners close in on the frame and the square narrows, a shutter, then everything lets go.', m => {
  const l = m.lod, c = sq(m.u, 0, [[.3, 4], [.8, 0]], S.snap), b = (l ? 18 : 14) + c, e = 64 - b, g = l ? 9 : 12;
  return [['frame', P(`M${b} ${b + g}V${b}H${b + g}M${e - g} ${b}H${e}V${b + g}M${e} ${e - g}V${e}H${e - g}M${b + g} ${e}H${b}V${e - g}`)], ['agent', SQ(32, 32, l ? 12 : 10, m.c, 1 - .3*c/4)]]; });

def('comparing', 'Comparing versions', 'Doing', 'v', 2.4, null, 'The newer frame slides onto the older one so the two overlap, holds, then slides back to where it was.', m => {
  const f = sq(m.u, 0, [[.3, -9], [1.2, 0]]), l = m.lod;
  return [['before', l ? R(14, 15, 20, 17, 3) : R(14, 16, 22, 18, 3)], ['after', l ? R(30 + f, 32 + f, 20, 17, 3) : R(28 + f, 30 + f, 22, 18, 3)]]; });

def('pinning', 'Pinning', 'Doing', 'v', 2.2, null, 'The pin lifts clear, drops back onto the page and a ring spreads out from where it lands.', m => {
  const l = m.lod, dy = sq(m.u, 0, [[.05, -9], [.55, 0]]), o = sq(m.u, 1, [[.05, .25], [.45, 1]]), rs = sq(m.u, 7, [[.1, 0], [.6, 7]]);
  const ring = rs < .8 ? '' : l ? P(`M${r1(40 - rs*1.2)} 48H${r1(40 + rs*1.2)}`) : `<ellipse cx="40" cy="47.5" rx="${r1(rs)}" ry="${r1(rs*.35)}"/>`;
  return [['ripple', ring], ['pin', OP(TR(P('M32 34L40 46') + C(32, 26, l ? 7.5 : 8) + (l ? '' : P('M28 26H36M32 22V30')), 0, dy), o)]]; });

def('thinking', 'Thinking', 'Doing', 'm', 2.2, null, 'The arc turns on its axis at a steady, unhurried speed: edge-on, full, edge-on again.', m => {
  const l = m.lod, ry = l ? 15 : 17, th0 = Math.asin((l ? 7.5 : 9)/ry), rx = Math.max(.01, ry*Math.abs(Math.sin(th0 + Math.PI*m.u/2.2)));
  return [['axis', l ? '' : P(`M32 ${32 - ry}V${32 + ry}`)], ['arc', `<ellipse cx="32" cy="32" rx="${r1(rx)}" ry="${ry}"/>`]]; });

const PL = [[15, 47], [25, 47], [25, 37], [35, 37], [35, 27], [46, 27]], PT = polyLen(PL);
def('planning', 'Planning', 'Doing', 'm', 3, null, 'The square steps back to the first stair, then climbs, turning each dotted stair into a solid one.', m => {
  const r0 = m.lod ? PT : .55*PT, p = sq(m.u, r0, [[.2, 0], [1.1, PT], [2, r0]], S.soft), a = polySlice(PL, 0, p), b = polySlice(PL, p, PT);
  return [['next', m.lod || !b.d ? '' : `<path d="${b.d}" stroke-dasharray="1.6 3.4"/>`], ['done', a.d ? P(a.d) : ''], ['agent', SQ(a.tip[0], a.tip[1], m.lod ? 12 : 9, m.c)]]; });

/* ---- Talking ---- */
def('commenting', 'Commenting', 'Talking', 'v', 2.2, null, 'The comment is written line by line inside the bubble, the second line trailing the first.', m => {
  const l = m.lod, q1 = sq(m.u, 1, [[.1, 0], [.45, 1]]), q2 = sq(m.u, 1, [[.1, 0], [.9, 1]]);
  const ln = l ? (q1 > .1 ? P(`M21 26H${r1(21 + 22*q1)}`) : '') : (q1 > .1 ? P(`M21 22H${r1(21 + 22*q1)}`) : '') + (q2 > .1 ? P(`M21 30H${r1(21 + 14*q2)}`) : '');
  return [['bubble', P(l ? 'M14 15H50V37H30L22 46V37H14Z' : 'M14 14H50V38H29L21 46V38H14Z')], ['text', ln]]; });

def('suggesting', 'Suggesting edit', 'Talking', 'v', 2.6, null, 'The pencil slides back, then writes a dashed line forward. Dashed means it is a proposal, not a change.', m => {
  const q = sq(m.u, 1, [[.1, 0], [1, 1]], S.soft), l = m.lod, tx = 14 + (l ? 14 : 17)*q;
  return [['proposal', tx > 19 ? `<path d="M14 ${l ? 45 : 44}H${r1(tx - (l ? 4 : 3))}" stroke-dasharray="${l ? '0.1 9.5' : '4.5 4'}"/>` : ''], ['pencil', pencil(tx, l ? 45 : 44, l)]]; });

const H1 = [[25, 24], [25, 17], [39, 17], [39, 25]], H2 = [[39, 25], [39, 31], [32, 31], [32, 38]];
def('asking', 'Asking permission', 'Talking', 'm', 2.6, null, 'The question mark is drawn and then its dot drops in, the agent’s own square, waiting to be answered.', m => {
  const q = sq(m.u, 2, [[.1, 0], [.9, 2]], S.soft), h = cubD(q, [H1, H2]), o = clamp((q - 1.4)/.6);
  return [['hook', h.d ? P(h.d) : ''], ['agent', SQ(32, 48 - 8*(1 - o), m.lod ? 11 : 8, m.c, o)]]; });

def('handing', 'Handing off', 'Talking', 'm', 2.6, null, 'The square travels the line into the gate, then fades out and returns to the start, ready to hand over again.', m => {
  const l = m.lod, x = sq(m.u, 19, [[.2, 43.5], [1.75, 19, S.snap]]), o = sq(m.u, 1, [[1.5, 0], [2, 1]]), y = 36 - .2*(Math.min(x, 33) - 13);
  return [['equator', P('M13 36L33 32') + (l ? '' : P('M28.5 28.6L33 32L28.6 35.6'))], ['gate', P(l ? 'M37 17H50V47H37' : 'M39 18H49V46H39')], ['agent', OP(SQ(x, y, l ? 11 : 9, m.c), o)]]; });

def('taking', 'Taking over (human)', 'Talking', 'm', 2.8, null, 'The round person slides in and the square steps aside and dims. People are round, agents are square.', m => {
  const l = m.lod, s = sq(m.u, 1, [[.2, 0], [1.3, 1]], S.soft), cx = 39 + (1 - s)*14;
  const head = l ? `<circle cx="${r1(cx)}" cy="25" r="5.5" fill="${m.c}" stroke="none"/>` : C(cx, 25, 6);
  return [['agent', OP(SQ(16 + (1 - s)*13, 40 - (1 - s)*6, l ? 11 : 10, m.c), l ? 1 - s : 1 - .5*s)], ['person', OP(head + P(`M${r1(cx - 11)} 49V46Q${r1(cx - 11)} 38 ${r1(cx - 3)} 38H${r1(cx + 3)}Q${r1(cx + 11)} 38 ${r1(cx + 11)} 46V49`), s)]]; });

/* ---- Waiting ---- */
def('waiting', 'Waiting for you', 'Waiting', 'm', 2.8, null, 'The sand runs down slowly through the waist, then the glass turns over and starts again.', m => {
  const l = m.lod, f = sq(m.u, 0, [[.2, 1]], S.lazy), a = sq(m.u, 0, [[1.9, 180]], S.soft), hw = y => y < 20 ? 8 : y > 44 ? 8 : 8*Math.abs(y - 32)/12;
  const glass = l ? P('M22 17H42M22 47H42M25 17L32 32L25 47M39 17L32 32L39 47') : P('M21 15H43M21 49H43M24 15V20L32 32L24 44V49M40 15V20L32 32L40 44V49');
  let sand = ''; if (!l){ const yt = 21 + 10*f, yb = 48 - 6*f, wt = hw(yt) - 1.5, wb = hw(yb) - 1.5;
    if (wt > .8) sand += P(`M${r1(32 - wt)} ${r1(yt)}H${r1(32 + wt)}`); if (wb > .8) sand += P(`M${r1(32 - wb)} ${r1(yb)}H${r1(32 + wb)}`);
    sand += OP(P(`M32 32V${r1(yb)}`), clamp(f*10)*clamp((1 - f)*10)); }
  return [['glass', RT(glass, a)], ['sand', RT(sand, a)]]; });

def('paused', 'Paused', 'Waiting', 'n', 2.4, null, 'The two bars stand still and the equator under them settles level, the world coming to a stop, then tilts back.', m => {
  const t = sq(m.u, 3, [[.3, 0], [1.5, 3]]), l = m.sm;
  return [['pause', P(l ? 'M24 17V47M40 17V47' : 'M24 16V38M40 16V38')], ['equator', l ? '' : P(`M16 ${r1(47 + t)}L48 ${r1(47 - t)}`)]]; });

def('scheduled', 'Scheduled', 'Waiting', 'm', 2.4, null, 'The minute hand ticks round a full turn in four quarter steps while the arc hand holds at twelve.', m => {
  const a = sq(m.u, 120, [[.25, 210], [.7, 300], [1.15, 390], [1.6, 480]])*Math.PI/180, r = m.lod ? 15 : 16, ml = m.lod ? 9 : 11;
  return [['face', C(32, 32, r)], ['hands', P(`M32 32V${m.lod ? 23 : 21}`) + P(`M32 32L${r1(32 + ml*Math.sin(a))} ${r1(32 - ml*Math.cos(a))}`)]]; });

def('offline', 'Offline', 'Waiting', 'n', 2.8, null, 'The slash is drawn across the signal and the arcs go quiet from the outside in, then they come back one by one.', m => {
  const l = m.lod, Rs = l || m.sm ? [10, 21] : [8, 16, 24], n = Rs.length, cy = 45, sn = .669, cs = .743, q = sq(m.u, 1, [[.05, 0], [.55, 1]]), s0 = l ? [18, 17, 28, 30] : [16, 15, 30, 34];
  const arcs = Rs.map((r, i) => { const f = sq(m.u, 0, [[.2 + (n - 1 - i)*.22, 1], [1.7 + i*.15, 0]]);
    return OP(P(`M${r1(32 - r*sn)} ${r1(cy - r*cs)}A${r} ${r} 0 0 1 ${r1(32 + r*sn)} ${r1(cy - r*cs)}`), 1 - .8*f); }).join('');
  return [['signal', arcs], ['agent', l ? '' : SQ(32, cy, 7, m.c)], ['slash', q > .02 ? P(`M${s0[0]} ${s0[1]}L${r1(s0[0] + s0[2]*q)} ${r1(s0[1] + s0[3]*q)}`) : '']]; });

/* ---- Outcome ---- */
def('retrying', 'Retrying', 'Outcome', 'm', 2.6, null, 'The arc withdraws almost to nothing and is drawn again, arrowhead leading, around the same circle.', m => {
  const r = 15, a0 = 70, f = sq(m.u, 290, [[.2, 12], [1.2, 290]], S.soft), P_ = a => [32 + r*Math.sin(a*Math.PI/180), 32 - r*Math.cos(a*Math.PI/180)], A = P_(a0), B = P_(a0 + f), al = (a0 + f)*Math.PI/180, tg = [Math.cos(al), Math.sin(al)];
  const arm = s => { const c = Math.cos(s), n = Math.sin(s); return [B[0] + 7*(-tg[0]*c + tg[1]*n), B[1] + 7*(-tg[0]*n - tg[1]*c)]; };
  return [['arc', P(`M${pt(A)}A${r} ${r} 0 ${f > 180 ? 1 : 0} 1 ${pt(B)}`)], ['head', P(`M${pt(arm(.7))}L${pt(B)}L${pt(arm(-.7))}`)]]; });

const CK = [[19, 33], [27, 41], [46, 22]], CKL = polyLen(CK);
def('done', 'Done', 'Outcome', 'm', 2, 'success', 'The check is drawn in two strokes, short arm first, in the success colour.', m => {
  const a = polySlice(CK, 0, sq(m.u, 1, [[.1, 0], [.7, 1]], S.soft)*CKL); return [['check', a.d ? P(a.d) : '']]; });

def('failed', 'Failed', 'Outcome', 'm', 2, 'danger', 'The two strokes cross one after the other, in the danger colour. Nothing shakes.', m => {
  const q1 = sq(m.u, 1, [[.1, 0], [.5, 1]]), q2 = sq(m.u, 1, [[.1, 0], [.75, 1]]);
  return [['stroke-a', q1 > .02 ? P(`M22 22L${r1(22 + 20*q1)} ${r1(22 + 20*q1)}`) : ''], ['stroke-b', q2 > .02 ? P(`M42 22L${r1(42 - 20*q2)} ${r1(22 + 20*q2)}`) : '']]; });

def('blocked', 'Blocked by permission', 'Outcome', 'm', 2.2, 'warning', 'The shackle tries to lift, can’t, and drops back. The lock stays shut, in the warning colour.', m => {
  const l = m.lod, y = sq(m.u, 0, [[.25, -3.5], [.6, 0, S.snap]]);
  return [['shackle', TR(P(l ? 'M26 31V26C26 17 38 17 38 26V31' : 'M25 31V25C25 14 39 14 39 25V31'), 0, y)], ['body', R(19, l ? 32 : 31, 26, l ? 16 : 19, l ? 3 : 4)], ['keyhole', l ? '' : SQ(32, 40.5, 6, m.c)]]; });

DEFS.forEach(d => { d.wash = d.st ? { success:'ok', danger:'bad', warning:'warn' }[d.st] : d.w; d.slug = d.n.toLowerCase().replace(/\s*\(.*\)/, '').replace(/[^a-z0-9]+/g, '-'); });
// product stroke weight per pixel size: 1.55px of stroke at any size, never lighter than the 1.7 brand line
const swFor = (brand, size) => brand ? 1.7 : Math.max(1.7, 1.55*64/size);
// returns the pieces of one frame; both the live atom and the standalone files build from this
function frame(d, o){
  const brand = !!o.brand, size = o.size || (brand ? 64 : 24), sw = swFor(brand, size), c = brand ? (d.st ? STC[d.st] : INK) : 'currentColor';
  const parts = d.draw({ u:o.u || 0, lod:size <= 20, sm:size <= 24, sw, c, brand });
  const tile = brand ? `<rect width="64" height="64" rx="16" fill="${PAPER}"/>` : `<rect x="${r1(sw/2 + 3)}" y="${r1(sw/2 + 3)}" width="${r1(58 - sw)}" height="${r1(58 - sw)}" rx="15" fill="none" stroke="currentColor" stroke-width="${r1(sw)}"/>`;
  const wash = brand ? `<path d="${WASHP}" fill="${WASH[d.wash]}" opacity=".65"/>` : '';
  return { brand, size, sw, c, tile, wash, parts };
}
const gAttr = f => `fill="none" stroke="${f.c}" stroke-width="${r1(f.sw)}" stroke-linecap="round" stroke-linejoin="round"`;
const inline = (d, o) => { const f = frame(d, o); return f.tile + f.wash + `<g ${gAttr(f)}>${f.parts.map(p => p[1]).join('')}</g>`; };
// standalone file: no script, layered named groups, readable in Gesso or Figma
function standalone(d, o){
  const f = frame(d, { ...o, u:0 }), label = d.n + (f.brand ? ' (brand)' : ' (product)'), px = f.brand ? 64 : 24;
  const layers = f.parts.filter(p => p[1]).map(p => `  <g id="${p[0]}">${p[1]}</g>`).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${px}" height="${px}" role="img" aria-label="${label}">\n<title>${label}</title>\n` +
    (f.brand ? `<g id="tile">${f.tile}</g>\n<g id="wash">${f.wash}</g>\n` : `<g id="outline">${f.tile}</g>\n`) +
    `<g id="glyph" ${gAttr(f)}>\n${layers}\n</g>\n</svg>\n`;
}
globalThis.AgentActionIcons = { list:DEFS, groups:GROUPS, frame, inline, standalone, swFor, STC, WASH, PAPER, INK };

atom({ id:'agentactions', cat:'Agent identity', name:'Agent action and state icons', block:'AgentActionIcon, ActivityFeed (proposed)', fam:['M','T','S'], wide:true, tall:true,
  html:`<style>
.aax-root{position:absolute;inset:0;container-type:inline-size}
.aax-main{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;padding:14px;text-align:left;overflow:hidden}
.aax-left,.aax-right{display:flex;flex-direction:column;gap:12px;min-width:0;min-height:0}
.aax-bar{flex:none;display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center}
.aax-sg{display:inline-flex;background:var(--raised);border-radius:9px;padding:3px;gap:2px}
.aax-sg button{border:0;background:none;border-radius:7px;padding:5px 10px;font-size:12.5px;font-weight:500;color:var(--muted);cursor:pointer}
.aax-sg button[aria-pressed=true]{background:var(--card);color:var(--ink);box-shadow:var(--shadow)}
.aax-all{margin-left:auto}
.aax-all[aria-pressed=true]{background:var(--ink);color:var(--card);border-color:var(--ink)}
.aax-sheet{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:14px;scrollbar-width:thin}
.aax-gh{display:flex;align-items:baseline;gap:8px;margin:0 0 4px 4px;font-size:12px;font-weight:600;letter-spacing:.02em;color:var(--muted)}
.aax-gh span{font-weight:400;color:var(--faint)}
.aax-gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:2px}
.aax-i{display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 4px 7px;border:0;background:none;border-radius:10px;cursor:pointer;min-width:0}
.aax-i:hover{background:var(--raised)}
.aax-i[aria-pressed=true]{box-shadow:0 0 0 1.5px var(--ink)}
.aax-i:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.aax-ib{display:grid;place-items:center;color:var(--ink)}
.aax-ib svg,.aax-ri svg,.aax-det svg{display:block;overflow:visible}
.aax-l{font-size:11.5px;line-height:1.25;color:var(--muted);text-align:center;text-wrap:balance}
.aax-i[aria-pressed=true] .aax-l{color:var(--ink)}
#agentactions [data-st=success]{--aax-c:var(--success)}#agentactions [data-st=danger]{--aax-c:var(--danger)}#agentactions [data-st=warning]{--aax-c:var(--warning)}
#agentactions .aax-ib[data-st],#agentactions .aax-ri[data-st],#agentactions .aax-df[data-st]{color:var(--aax-c)}
.aax-det{flex:none;display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px;padding:12px;border:1px solid var(--line);border-radius:14px;background:var(--card)}
.aax-dbig{grid-row:1/3;display:grid;place-items:center}
.aax-dn{font-size:15px;font-weight:600;letter-spacing:-.01em;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}
.aax-dn span{font-size:12px;font-weight:500;color:var(--faint)}
.aax-dd{margin:0;font-size:12.5px;line-height:1.45;color:var(--muted)}
.aax-ds{grid-column:1/-1;display:flex;align-items:flex-end;gap:16px;margin-top:6px;padding-top:10px;border-top:1px solid var(--line-soft);color:var(--ink)}
.aax-df{margin:0;display:flex;flex-direction:column;align-items:center;gap:5px;color:var(--ink)}
.aax-df figcaption{font-size:11px;color:var(--faint);font-variant-numeric:tabular-nums}
.aax-feed{flex:1;min-height:0;display:flex;flex-direction:column;border:1px solid var(--line);border-radius:14px;background:var(--card);overflow:hidden}
.aax-fh{flex:none;display:flex;align-items:center;gap:10px;padding:10px 12px 6px}
.aax-fh h4{margin:0;font-size:12px;font-weight:600;letter-spacing:.02em;color:var(--muted);white-space:nowrap}
.aax-now{position:relative;flex:1;height:18px;font-size:12px;color:var(--faint);min-width:0}
.aax-now span{position:absolute;left:0;top:0;white-space:nowrap}
.aax-fl{position:relative;flex:1;min-height:0;margin:0;padding:0;list-style:none;overflow:hidden}
.aax-r{position:absolute;left:8px;right:8px;top:0;height:46px;display:flex;align-items:center;gap:10px;padding:0 10px;border-radius:10px;will-change:transform}
.aax-r[data-live]{background:var(--raised)}
.aax-ri{flex:none;display:grid;place-items:center;color:var(--muted)}
.aax-r[data-live] .aax-ri{color:var(--ink)}
.aax-rt{display:flex;flex-direction:column;min-width:0;flex:1}
.aax-rt b{font-weight:500;font-size:13px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.aax-rt i{font-style:normal;font-size:11.5px;line-height:1.3;color:var(--faint);font-variant-numeric:tabular-nums}
.aax-ch{flex:none;font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:var(--raised);color:var(--muted)}
.aax-r[data-live] .aax-ch:not([data-st]){background:var(--card)}
.aax-ch[data-st=success]{background:var(--success-tint);color:var(--success)}
.aax-ch[data-st=danger]{background:var(--danger-tint);color:var(--danger)}
.aax-ch[data-st=warning]{background:var(--warning-tint);color:var(--warning)}
@container (max-width:880px){.aax-main{grid-template-columns:minmax(0,1fr) 280px;gap:12px}.aax-det{grid-template-columns:minmax(0,1fr)}.aax-dbig{grid-row:auto;justify-items:start}}
@container (max-width:640px){.aax-main{display:flex;flex-direction:column;overflow-y:auto;gap:14px}.aax-left,.aax-right{display:contents}
.aax-bar{order:1}.aax-det{order:2;grid-template-columns:auto minmax(0,1fr)}.aax-dbig{grid-row:1/3}.aax-sheet{order:3;flex:none;overflow:visible}.aax-feed{order:4;flex:none;height:400px}
.aax-gr{grid-template-columns:repeat(4,minmax(0,1fr))}.aax-all{margin-left:0}}
</style><div class="aax-root"><div class="aax-main"><div class="aax-left"><div class="aax-bar"><div class="aax-sg aax-fm" role="group" aria-label="Icon form"><button type="button" data-f="product" aria-pressed="true">Product</button><button type="button" data-f="brand" aria-pressed="false">Brand</button></div><div class="aax-sg aax-sz" role="group" aria-label="Icon size in pixels"></div><button type="button" class="btn aax-all" aria-pressed="false">Play all</button></div><div class="aax-sheet" role="group" aria-label="Agent action and state icons"></div></div>
<div class="aax-right"><div class="aax-det" aria-live="polite"><div class="aax-dbig"></div><div><div class="aax-dn"></div><p class="aax-dd"></p></div><div class="aax-ds"></div></div>
<section class="aax-feed" aria-label="Feed preview"><div class="aax-fh"><h4>Feed preview</h4><div class="aax-now" aria-hidden="true"></div><button type="button" class="btn aax-rp">Replay</button></div><ul class="aax-fl"></ul></section></div></div></div>`,
  desc:'Twenty-four things an agent does or is, in the agent system: the square tile is the agent and a filled square is its hand. Hover or focus an icon to play its own motion: the caret steps, the page slides, the arc is drawn again. Every loop starts and ends at the resting drawing, so leaving an icon just finishes the turn. In the feed, each new row slides in at the top and pushes the rest down, and its icon plays until the next row arrives. Done, Failed and Blocked take the success, danger and warning colour through the icon and a chip, never a stripe.',
  api:'frame(def, { brand, size, u })   u = (t − playStart) % loop   leave: u += 2.4·dt until the loop ends   row.y.set(i·pitch)',
  init(st){
    const SZ = { product:[16, 20, 24, 32], brand:[32, 40, 48, 64] }, size = { product:24, brand:40 }, byK = {};
    DEFS.forEach(d => byK[d.k] = d);
    let form = 'product', sel = 0, all = false;
    const sheet = $(st,'.aax-sheet'), sizes = $(st,'.aax-sz'), allBtn = $(st,'.aax-all'), NS = 'http://www.w3.org/2000/svg';
    // an icon instance: svg + run state. u = 0 is rest; leaving a loop plays the remainder faster
    const mk = (d, brand, px, host, st0) => {
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 64 64'); svg.setAttribute('width', px); svg.setAttribute('height', px); svg.setAttribute('aria-hidden', 'true');
      host.appendChild(svg); const i = { d, brand, px, svg, ts:null, te:null, ue:0, lu:-1 }; if (st0) i.ts = st0; paint(i, 0, true); return i; };
    const uOf = (i, t) => { if (i.ts === null || t < i.ts) return 0; if (i.te === null) return (t - i.ts) % i.d.L;
      const u = i.ue + 2.4*(t - i.te); if (u >= i.d.L){ i.ts = null; i.te = null; return 0; } return u; };
    const play = (i, t) => { if (i.ts === null) i.ts = t; else if (i.te !== null){ i.ts = t - (i.ue + 2.4*(t - i.te)); i.te = null; } };
    const stop = (i, t) => { if (i.ts === null || i.te !== null) return; if (t < i.ts) i.ts = null; else { i.ue = (t - i.ts) % i.d.L; i.te = t; } };
    function paint(i, t, force){ const u = uOf(i, t); if (u === i.lu && !force) return; i.lu = u; i.svg.innerHTML = inline(i.d, { brand:i.brand, size:i.px, u }); }

    /* ---- the sheet ---- */
    let cells = [];
    const build = () => {
      const px = size[form], brand = form === 'brand'; sheet.replaceChildren(); cells = [];
      GROUPS.forEach(([g, hint]) => { const sec = document.createElement('section'), h = document.createElement('h4'), gr = document.createElement('div'); h.className = 'aax-gh'; gr.className = 'aax-gr';
        const ds = DEFS.filter(d => d.g === g); h.append(g); const sp = document.createElement('span'); sp.textContent = `${ds.length} · ${hint}`; h.appendChild(sp); sec.append(h, gr); sheet.appendChild(sec);
        ds.forEach(d => { const b = document.createElement('button'), ib = document.createElement('span'), lb = document.createElement('span'); b.type = 'button'; b.className = 'aax-i'; b.dataset.k = d.k; b.setAttribute('aria-pressed', 'false'); b.tabIndex = -1;
          ib.className = 'aax-ib'; ib.style.height = px + 'px'; if (d.st && !brand) ib.dataset.st = d.st; lb.className = 'aax-l'; lb.textContent = d.n; b.append(ib, lb); gr.appendChild(b);
          const c = { d, b, ib, i:mk(d, brand, px, ib) }; cells.push(c); const idx = cells.length - 1;
          b.addEventListener('pointerenter', () => !all && play(c.i, now())); b.addEventListener('pointerleave', () => !all && stop(c.i, now()));
          b.addEventListener('focus', () => { pick(idx); !all && play(c.i, now()); }); b.addEventListener('blur', () => !all && stop(c.i, now()));
          b.addEventListener('click', () => pick(idx)); }); });
      if (all) cells.forEach((c, k) => play(c.i, now() + k*.07));
      pick(sel); };
    const pick = k => { sel = k; cells.forEach((c, j) => { c.b.setAttribute('aria-pressed', j === k); c.b.tabIndex = j === k ? 0 : -1; }); detail(cells[k].d); };
    // arrow keys move to the nearest cell in that direction
    sheet.addEventListener('keydown', e => { const dir = { ArrowRight:[1, 0], ArrowLeft:[-1, 0], ArrowDown:[0, 1], ArrowUp:[0, -1] }[e.key]; if (!dir && e.key !== 'Home' && e.key !== 'End') return; e.preventDefault();
      let n = sel; if (e.key === 'Home') n = 0; else if (e.key === 'End') n = cells.length - 1; else {
        const a = cells[sel].b.getBoundingClientRect(), ax = a.left + a.width/2, ay = a.top + a.height/2; let best = 1e9;
        cells.forEach((c, j) => { if (j === sel) return; const r = c.b.getBoundingClientRect(), dx = r.left + r.width/2 - ax, dy = r.top + r.height/2 - ay, along = dx*dir[0] + dy*dir[1], across = Math.abs(dx*dir[1]) + Math.abs(dy*dir[0]);
          if (along > 4 && along*.6 > across*.3){ const s = along + across*2.2; if (s < best){ best = s; n = j; } } }); }
      cells[n].b.focus(); cells[n].b.scrollIntoView({ block:'nearest' }); });

    /* ---- controls ---- */
    const sizeBtns = () => { sizes.replaceChildren(); SZ[form].forEach(s => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s + 'px'; b.setAttribute('aria-pressed', s === size[form]);
      b.onclick = () => { size[form] = s; sizeBtns(); build(); }; sizes.appendChild(b); }); };
    $$(st,'.aax-fm button').forEach(b => b.onclick = () => { form = b.dataset.f; $$(st,'.aax-fm button').forEach(x => x.setAttribute('aria-pressed', x === b)); sizeBtns(); build(); feedForm(); });
    allBtn.onclick = () => { all = !all; allBtn.setAttribute('aria-pressed', all); allBtn.textContent = all ? 'Stop all' : 'Play all'; const t = now(); cells.forEach((c, k) => all ? play(c.i, t + k*.07) : stop(c.i, t)); };

    /* ---- detail: brand at 64 and product at the four sizes, always playing ---- */
    const dBig = $(st,'.aax-dbig'), dN = $(st,'.aax-dn'), dD = $(st,'.aax-dd'), dS = $(st,'.aax-ds'); let dIcons = [];
    const detail = d => { dBig.replaceChildren(); dS.replaceChildren(); dIcons = [];
      const big = mk(d, true, 64, dBig, now()); big.svg.removeAttribute('aria-hidden'); big.svg.setAttribute('role', 'img'); big.svg.setAttribute('aria-label', d.n + ', brand form'); dIcons.push(big);
      [32, 24, 20, 16].forEach(s => { const f = document.createElement('figure'), cap = document.createElement('figcaption'); f.className = 'aax-df'; if (d.st) f.dataset.st = d.st; cap.textContent = s; dIcons.push(mk(d, false, s, f, now())); f.appendChild(cap); dS.appendChild(f); });
      dN.textContent = d.n; const sp = document.createElement('span'); sp.textContent = d.g + (d.st ? ` · ${d.st} colour` : ''); dN.appendChild(sp); dD.textContent = d.d; };

    /* ---- feed preview ---- */
    const FEED = [['thinking', 'Read the brief: check the checkout page'], ['planning', 'Planned four checks'], ['navigating', 'Went to /checkout'], ['browsing', 'Read the order summary'], ['scrolling', 'Scrolled to the payment form'],
      ['inspecting', 'Inspected the Pay button'], ['clicking', 'Clicked Apply code'], ['typing', 'Typed SPRING10 in the code field'], ['capturing', 'Captured the cart at 1440 wide'], ['comparing', 'Compared with the approved v12'],
      ['pinning', 'Pinned the total, 2px lower than v12'], ['commenting', 'Commented on the pin'], ['suggesting', 'Suggested a 16px bottom margin'], ['asking', 'Asked to apply the edit', 1.5], ['waiting', 'Waiting for Maya to approve', 1.7],
      ['paused', 'Maya paused the run'], ['taking', 'Maya took over'], ['handing', 'Maya handed back to Review agent'], ['offline', 'Lost connection to the preview'], ['retrying', 'Reconnecting, attempt 2'], ['failed', 'The preview did not come back'],
      ['scheduled', 'Scheduled a recheck for 9:00'], ['blocked', 'Publish needs owner approval'], ['done', 'Review finished: 1 pin, 1 suggestion', 4]];
    const list = $(st,'.aax-fl'), now_ = $(st,'.aax-now'), PITCH = 50, CHIP = { success:'Done', danger:'Failed', warning:'Blocked' }, q = []; let rows = [], gen = 0;
    const nowSw = new Swap(-1), nowEls = DEFS.map(d => { const s = document.createElement('span'); s.textContent = d.n; now_.appendChild(s); return s; });
    const pad = n => String(n).padStart(2, '0');
    const push = (t, fn) => { q.push([t, fn]); q.sort((a, b) => a[0] - b[0]); };
    const addRow = (k, title, t, vt, g) => { if (g !== gen) return; const d = byK[k], li = document.createElement('li'), ri = document.createElement('span'), tx = document.createElement('span'), b = document.createElement('b'), i = document.createElement('i'), brand = form === 'brand';
      li.className = 'aax-r'; ri.className = 'aax-ri'; if (d.st && !brand) ri.dataset.st = d.st; tx.className = 'aax-rt'; b.textContent = title; i.textContent = `${d.n} · ${Math.floor(vt/60)}:${pad(vt%60)}`; tx.append(b, i); li.append(ri, tx);
      const chip = CHIP[d.st] || (k === 'waiting' || k === 'asking' ? 'Needs you' : ''); if (chip){ const c = document.createElement('span'); c.className = 'aax-ch'; c.textContent = chip; if (d.st) c.dataset.st = d.st; li.appendChild(c); }
      rows.forEach(r => { r.y.set(r.y.target + PITCH, S.base, t); stop(r.i, t); r.el.removeAttribute('data-live'); });
      li.dataset.live = ''; list.appendChild(li); const r = { el:li, d, y:new Track(0), o:new Track(0), i:mk(d, brand, brand ? 32 : 22, ri), dead:0 }; r.o.set(1, S.base, t); play(r.i, t); rows.unshift(r);
      nowSw.to(DEFS.indexOf(d), t); };
    const clear = t => { gen++; rows.forEach((r, j) => { r.o.set(0, S.snap, t + j*.04); r.dead = t + j*.04 + .5; }); };
    const start = t => { clear(t); const g = gen; let at = t + .45, vt = 2; q.length = 0; FEED.forEach(([k, title, dw = 1.05]) => { const a = at, v = vt; push(a, tt => addRow(k, title, tt, v, g)); at += dw; vt += Math.round(dw*3); });
      push(at + 1.2, tt => start(tt)); };
    const feedForm = () => { const t = now(); gen++; rows.forEach(r => r.el.remove()); rows = []; start(t); };
    $(st,'.aax-rp').onclick = () => start(now());
    start(now());
    sizeBtns(); build();

    return t => {
      while (q.length && q[0][0] <= t){ const [tt, fn] = q.shift(); if (t - tt > 6){ start(t); break; } fn(tt); }
      for (const c of cells) paint(c.i, t); for (const i of dIcons) paint(i, t);
      const H = list.clientHeight; rows = rows.filter(r => { if ((r.dead && t > r.dead) || (r.y.target > H + PITCH && r.y.at(t) > H + 8)){ r.el.remove(); return false; } return true; });
      for (const r of rows){ const y = r.y.at(t), o = clamp(r.o.at(t)), tail = clamp((H - y - 16)/PITCH); r.el.style.opacity = (o*tail).toFixed(3); r.el.style.visibility = o*tail < .01 ? 'hidden' : 'visible';
        r.el.style.transform = `translateY(${px(y + (1 - o)*-8)})`; r.el.style.filter = o < .98 ? `blur(${((1 - o)*BLUR).toFixed(2)}px)` : 'none'; paint(r.i, t); }
      nowEls.forEach((e, j) => nowSw.apply(e, j, t, 4));
    };
  } });
})();
