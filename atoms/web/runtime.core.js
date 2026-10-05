/* ================================================================ core */
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
// critically damped presets (Lamina: calm, no overshoot)
const S = { snap:{w:34}, base:{w:22}, soft:{w:15}, lazy:{w:9} };
const EXIT = .1, LAG = .06, BLUR = 4;
const clock = { t:0, scale:1, last:performance.now() };
const now = () => clock.t;
const clamp = (v,a=0,b=1) => Math.min(b, Math.max(a, v));
const lerp = (a,b,p) => a + (b-a)*p;
const px = v => v.toFixed(2) + 'px';
const $ = (r,s) => r.querySelector(s), $$ = (r,s) => [...r.querySelectorAll(s)];

function resp(dt, x0, v0, cfg){
  if (dt <= 0) return x0;
  let w = cfg.w, z = cfg.z ?? 1;
  if (REDUCE){ w *= 1.8; z = 1; }
  if (z < 1){
    const wd = w*Math.sqrt(1-z*z), e = Math.exp(-z*w*dt);
    return e*(x0*Math.cos(wd*dt) + ((v0 + z*w*x0)/wd)*Math.sin(wd*dt));
  }
  return Math.exp(-w*dt)*(x0 + (v0 + w*x0)*dt);
}
const prog = (t, t0, cfg = S.base) => 1 - resp(t - t0, 1, 0, cfg);

class Track {
  constructor(v, cfg = S.base){ this.target = v; this.ev = []; this.cfg = cfg; }
  set(to, cfg = this.cfg, t = now()){
    if (to === this.target) return this;
    this.ev.push({ t, x0: this.target - to, v0: 0, cfg }); this.target = to; if (this.ev.length > 12) this.prune(t); return this;
  }
  release(from, v0, to, cfg = this.cfg, t = now()){ this.ev = [{ t, x0: from - to, v0, cfg }]; this.target = to; return this; }
  jump(v){ this.ev = []; this.target = v; return this; }
  at(t = now()){ let v = this.target; for (const e of this.ev) v += resp(t - e.t, e.x0, e.v0, e.cfg); return v; }
  prune(t = now()){
    this.ev = this.ev.filter(e => t < e.t || Math.exp(-e.cfg.w*(t-e.t))*(1 + e.cfg.w*(t-e.t))*(Math.abs(e.x0) + Math.abs(e.v0)/e.cfg.w) > 1e-3);
    return this.ev.length;
  }
}
// two edges: leading moves now, trailing follows after LAG
function edges(a, b){
  const A = new Track(a), B = new Track(b);
  return { A, B, go(na, nb, t = now()){
    if (na >= A.target){ B.set(nb, S.base, t); A.set(na, S.base, t + LAG); }
    else { A.set(na, S.base, t); B.set(nb, S.base, t + LAG); }
  }, jump(na, nb){ A.jump(na); B.jump(nb); } };
}
// content swap: exit (100ms ease-in), then enter spring, never overlapping
class Swap {
  constructor(cur){ this.cur = cur; this.prev = null; this.t = -9; }
  to(k, t = now()){ if (k === this.cur) return false; this.prev = this.cur; this.cur = k; this.t = t; return true; }
  apply(el, k, t, amp = 4){
    let o = 0, b = 0, y = 0;
    if (k === this.cur){ const p = clamp(prog(t, this.t + EXIT)); o = p; b = (1-p)*BLUR; y = (1-p)*amp; }
    else if (k === this.prev){ const p = clamp((t - this.t)/EXIT), e = p*p; o = 1-e; b = e*BLUR; y = -e*amp; }
    el.style.opacity = o.toFixed(3);
    el.style.visibility = o < .01 ? 'hidden' : 'visible';
    el.style.filter = b > .05 ? `blur(${b.toFixed(2)}px)` : 'none';
    el.style.transform = `translateY(${y.toFixed(2)}px)`;
  }
}
// rolling digits: one Swap per slot
class Digits {
  constructor(el, slots){
    el.classList.add('digits'); this.slots = [];
    for (let i = 0; i < slots; i++){
      const s = document.createElement('span'); s.className = 'dslot'; const layers = {};
      for (const c of '0123456789 '){ const l = document.createElement('span'); l.className = 'dl'; l.textContent = c; s.appendChild(l); layers[c] = l; }
      el.appendChild(s); this.slots.push({ s, layers, sw:new Swap(' '), w:new Track(0) });
    }
  }
  set(str, instant){
    const n = this.slots.length, pad = String(str).padStart(n, ' ').slice(-n);
    this.slots.forEach((sl, i) => {
      const c = pad[i];
      if (instant){ sl.sw.cur = c; sl.sw.prev = null; sl.sw.t = -9; sl.w.jump(c === ' ' ? 0 : 1); }
      else { sl.sw.to(c); sl.w.set(c === ' ' ? 0 : 1); }
    });
  }
  render(t){ for (const sl of this.slots){ sl.s.style.width = (sl.w.at(t)*.62).toFixed(3) + 'em'; for (const c in sl.layers) sl.sw.apply(sl.layers[c], c, t, 12*(this.dir || 1)); } }
}
// pointer drag with release velocity (px per clock-second)
function drag(el, { down, move, up }){
  let on = false, samples = [];
  const pt = e => { const r = el.getBoundingClientRect(); return { x:e.clientX - r.left, y:e.clientY - r.top, cx:e.clientX, cy:e.clientY, w:r.width, h:r.height }; };
  el.addEventListener('pointerdown', e => { if (e.button) return; on = true; el.setPointerCapture(e.pointerId); const p = pt(e); samples = [{ t:now(), ...p }]; down && down(p, e); });
  el.addEventListener('pointermove', e => { if (!on) return; const p = pt(e); samples.push({ t:now(), ...p }); if (samples.length > 6) samples.shift(); move && move(p, e); });
  const end = e => { if (!on) return; on = false; const a = samples[0], b = samples[samples.length-1], dt = Math.max(1e-3, b.t - a.t); up && up(pt(e), { vx:(b.cx - a.cx)/dt, vy:(b.cy - a.cy)/dt }); };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
}
const rb = (x, d) => d*(1 - 1/(Math.abs(x)*.55/d + 1))*Math.sign(x);
const mix = (p, a = 'var(--ink)', b = 'var(--card)') => `color-mix(in oklab, ${a} ${(clamp(p)*100).toFixed(1)}%, ${b})`;
const fade = (el, o, y = 0, blur = true) => {
  el.style.opacity = clamp(o).toFixed(3);
  el.style.filter = blur && o < .98 ? `blur(${((1-clamp(o))*BLUR).toFixed(2)}px)` : 'none';
  if (y !== null) el.style.transform = `translateY(${y.toFixed(2)}px)`;
};
const money = v => '$' + v.toFixed(2);
// measure an element's natural width by rendering a hidden clone
function measureW(el, text){
  const m = el.cloneNode(false); m.textContent = text;
  Object.assign(m.style, { position:'absolute', visibility:'hidden', width:'auto', whiteSpace:'nowrap' });
  el.parentNode.appendChild(m); const w = m.offsetWidth; m.remove(); return w;
}

