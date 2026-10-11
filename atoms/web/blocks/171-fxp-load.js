

/* ================================================================ Photo effects (lane fx-photos, prefix fxp-)
   Twelve photo effects for product UI. Pixels run through ONE shared offscreen WebGL context (no per-atom
   contexts, so the page never hits the browser's context cap); each atom blits the result into its own 2D
   canvas and only re-renders when its inputs change. Canvas 2D fallbacks keep every atom usable without WebGL. */
(() => {
const PK = () => globalThis.PhotoKit;
const DPR = () => Math.min(2, globalThis.devicePixelRatio || 1);
const sm = p => (p = clamp(p), p*p*(3 - 2*p));
const smr = p => (p = clamp(p), p*p*p*(p*(p*6 - 15) + 10));
const txt = (el, s) => { if (el._t !== s){ el._t = s; el.textContent = s; } };
const att = (el, k, v) => { v = String(v); if (el.getAttribute(k) !== v) el.setAttribute(k, v); };
const f2 = (...a) => a.map(x => typeof x === 'number' ? x.toFixed(4) : String(x)).join('|');

// content timeline: eased, interruptible from its current value, duration scales with distance
class Tw {
  constructor(v = 0){ this.a = v; this.b = v; this.t0 = -9; this.d = 0; }
  at(t = now()){ if (this.d <= 0) return this.b; return lerp(this.a, this.b, smr((t - this.t0)/this.d)); }
  to(b, dur, t = now()){ this.a = this.at(t); this.t0 = t; this.d = REDUCE ? Math.min(dur, .2) : dur*Math.max(.3, Math.abs(b - this.a)); this.b = b; return this; }
  jump(v){ this.a = this.b = v; this.d = 0; return this; }
  busy(t = now()){ return this.d > 0 && t < this.t0 + this.d; }
}

// theme tokens as linear-ish 0..1 triples for shaders; refreshed when the theme flips
let themeV = 0;
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => themeV++);
  new MutationObserver(() => themeV++).observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] }); } catch (e) {}
const tok = (el, n) => { const s = getComputedStyle(el).getPropertyValue(n).trim(), m = /^#([0-9a-f]{6})$/i.exec(s);
  if (!m) return [.5, .5, .5]; const v = parseInt(m[1], 16); return [(v >> 16 & 255)/255, (v >> 8 & 255)/255, (v & 255)/255]; };
const L3 = c => .2126*c[0] + .7152*c[1] + .0722*c[2];
const hex = c => '#' + c.map(v => Math.round(clamp(v)*255).toString(16).padStart(2, '0')).join('');
const relL = c => { const f = v => v <= .04045 ? v/12.92 : ((v + .055)/1.055)**2.4; return .2126*f(c[0]) + .7152*f(c[1]) + .0722*f(c[2]); };
const ratio = (a, b) => { const x = Math.max(a, b), y = Math.min(a, b); return (x + .05)/(y + .05); };

/* ---------- one shared WebGL context ---------- */
const GLX = (() => {
  let cv = null, gl = null, st = 0; const progs = new Map(); let tx = new WeakMap();
  const VS = 'attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}';
  const HEAD = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v;uniform vec2 uRes;
float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
`;
  function boot(){
    if (st) return st > 0;
    cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const o = { alpha:false, antialias:false, depth:false, stencil:false, premultipliedAlpha:false, preserveDrawingBuffer:false, powerPreference:'low-power' };
    try { gl = cv.getContext('webgl', o) || cv.getContext('experimental-webgl', o); } catch (e) { gl = null; }
    if (!gl){ st = -1; return false; }
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); st = -1; });   // atoms fall back to 2D from here on
    st = 1; return true;
  }
  function program(fs){
    if (progs.has(fs)) return progs.get(fs);
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ console.error('fx-photos shader', gl.getShaderInfoLog(s)); return null; } return s; };
    const v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, HEAD + fs); let p = null;
    if (v && f){ const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.bindAttribLocation(pr, 0, 'a'); gl.linkProgram(pr);
      if (gl.getProgramParameter(pr, gl.LINK_STATUS)) p = { pr, loc:{} }; else console.error('fx-photos link', gl.getProgramInfoLog(pr)); }
    progs.set(fs, p); return p;
  }
  const loc = (p, k) => k in p.loc ? p.loc[k] : (p.loc[k] = gl.getUniformLocation(p.pr, k));
  function texture(src, ver){
    let e = tx.get(src);
    if (!e){ e = { t:gl.createTexture(), ver:-1 }; tx.set(src, e); gl.bindTexture(gl.TEXTURE_2D, e.t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); }
    else gl.bindTexture(gl.TEXTURE_2D, e.t);
    if (e.ver !== ver){
      if (src.data) gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, src.w, src.h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, src.data);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      e.ver = ver; }
  }
  function drop(src){ const e = tx.get(src); if (e && gl && st > 0) gl.deleteTexture(e.t); tx.delete(src); }
  // draw fragment shader `fs` into 2D canvas `dst`; U = uniforms, T = textures (canvas or {w,h,data,ver})
  function run(dst, fs, U = {}, T = {}){
    if (!boot()) return false; const p = program(fs); if (!p) return false;
    const w = dst.width, h = dst.height;
    if (cv.width < w || cv.height < h){ cv.width = Math.max(cv.width, w); cv.height = Math.max(cv.height, h); }
    gl.useProgram(p.pr); gl.viewport(0, 0, w, h);
    let u = 0; for (const k in T){ const s = T[k]; gl.activeTexture(gl.TEXTURE0 + u); texture(s, s.ver || 0); gl.uniform1i(loc(p, k), u); u++; }
    U.uRes = [w, h];
    for (const k in U){ const l = loc(p, k); if (!l) continue; const x = U[k];
      if (typeof x === 'number') gl.uniform1f(l, x); else if (x.length === 2) gl.uniform2fv(l, x); else if (x.length === 3) gl.uniform3fv(l, x); else gl.uniform4fv(l, x); }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    dst.getContext('2d').drawImage(cv, 0, cv.height - h, w, h, 0, 0, w, h); return true;
  }
  return { run, drop, ok:() => boot() };
})();

/* ---------- shared helpers ---------- */
// canvas sized to its frame at device resolution (capped at 1600 px wide); s.v bumps on every resize
function surface(fr, cv){
  const o = { cw:1, ch:1, W:1, H:1, v:0 };
  const fit = () => { const cw = fr.clientWidth, ch = fr.clientHeight; if (!cw || !ch) return;
    const k = Math.min(DPR(), 1600/cw), W = Math.max(1, Math.round(cw*k)), H = Math.max(1, Math.round(ch*k));
    if (cv.width !== W || cv.height !== H){ cv.width = W; cv.height = H; } o.cw = cw; o.ch = ch; o.W = W; o.H = H; o.v++; };
  new ResizeObserver(fit).observe(fr); fit(); return o;
}
// PhotoKit renders take 20-60 ms, so at most one new photo is generated per frame across this lane
let lastGen = -1e9; const made = new Set();
function photo(name, w, h, tod = 0){
  const pk = PK(); if (!pk) return null; const key = `${name}|${w}|${h}|${tod}`;
  if (!made.has(key)){ const n = performance.now(); if (n - lastGen < 12) return null; made.add(key); const c = pk.get(name, w, h, { tod }); lastGen = performance.now(); return c; }
  return pk.get(name, w, h, { tod });
}
// source size for a photo that will cover a frame: bucketed so small resizes never regenerate
const srcSize = (cw, ch, aspect = 1.5) => { const need = Math.max(cw, ch*aspect)*DPR(), W = Math.min(1600, Math.max(480, Math.ceil(need/320)*320)); return [W, Math.round(W/aspect)]; };
// a lazily-made photo that grows (never shrinks) with its frame
function lazyPhoto(name, aspect = 1.5, tod = 0){
  const o = { img:null, W:0, H:0, v:0 };
  o.need = (cw, ch) => { const [W, H] = srcSize(cw, ch, aspect); if (o.img && W <= o.W) return o.img;
    const c = photo(name, W, H, tod); if (c){ if (o.img) GLX.drop(o.img); o.img = c; o.W = W; o.H = H; o.v++; } return o.img; };
  return o;
}
// cover mapping: frame uv → source uv = uv*xy + zw; f = focal point, z = extra zoom
// default focal x sits right of centre: every PhotoKit landscape has its sun at x ≈ .68, so narrow (phone)
// crops keep the sun whole instead of slicing it at the frame edge
const cover = (fw, fh, sw, sh, fx = .78, fy = .5, z = 1) => { const af = fw/fh, as = sw/sh; let sx = 1, sy = 1;
  if (af > as) sy = as/af; else sx = af/as; sx /= z; sy /= z; return [sx, sy, (1 - sx)*fx, (1 - sy)*fy]; };
const drawCover = (x, img, cov, W, H) => x.drawImage(img, cov[2]*img.width, cov[3]*img.height, cov[0]*img.width, cov[1]*img.height, 0, 0, W, H);
const scaled = (img, w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently:true });
  x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h); return { c, x, d:() => x.getImageData(0, 0, w, h).data }; };
function boxBlur(a, w, h, r){
  const o = new Float32Array(a.length), n = 2*r + 1;
  for (let y = 0; y < h; y++){ let s = 0; for (let k = -r; k <= r; k++) s += a[y*w + clamp(k, 0, w - 1)];
    for (let x = 0; x < w; x++){ o[y*w + x] = s/n; s += a[y*w + Math.min(w - 1, x + r + 1)] - a[y*w + Math.max(0, x - r)]; } }
  const q = new Float32Array(a.length);
  for (let x = 0; x < w; x++){ let s = 0; for (let k = -r; k <= r; k++) s += o[clamp(k, 0, h - 1)*w + x];
    for (let y = 0; y < h; y++){ q[y*w + x] = s/n; s += o[Math.min(h - 1, y + r + 1)*w + x] - o[Math.max(0, y - r)*w + x]; } }
  return q;
}
/* depth from aerial perspective: in these landscapes every ridge or tree row is a flat colour and farther
   planes are lighter. Luminance peaks become planes (brightest = farthest); every pixel snaps to its nearest
   plane, so anti-aliased edges never invent an in-between plane. Nearer planes are dilated by two texels. */
function depthOf(img){
  const w = Math.max(16, Math.round(img.width/2)), h = Math.max(16, Math.round(img.height/2)), d = scaled(img, w, h).d();
  let L = new Float32Array(w*h); for (let i = 0; i < w*h; i++) L[i] = .2126*d[i*4] + .7152*d[i*4 + 1] + .0722*d[i*4 + 2];
  let H = new Float32Array(64); for (const l of L) H[Math.min(63, l/4 | 0)]++;
  for (let p = 0; p < 2; p++){ const g = H.slice(); for (let i = 0; i < 64; i++) H[i] = (g[Math.max(0, i - 1)] + 2*g[i] + g[Math.min(63, i + 1)])/4; }
  let pk = []; for (let i = 0; i < 64; i++) if (H[i] > w*h*.012 && H[i] >= (H[i - 1] || 0) && H[i] > (H[i + 1] || 0)) pk.push(i);
  // merge neighbours unless a real valley separates them (a sky gradient is one plateau, tree rows are not)
  pk = pk.reduce((a, i) => { const j = a[a.length - 1]; let vmin = Infinity; if (j !== undefined) for (let q = j; q <= i; q++) vmin = Math.min(vmin, H[q]);
    if (j !== undefined && (i - j < 3 || vmin > .45*Math.min(H[i], H[j]))){ if (H[i] > H[j]) a[a.length - 1] = i; } else a.push(i); return a; }, []);
  const lv = pk.map(i => i*4 + 2).sort((a, b) => b - a), n = lv.length;
  const lut = new Float32Array(256);
  for (let l = 0; l < 256; l++){ if (n < 2){ lut[l] = 1 - l/255; continue; } if (l >= lv[0]){ lut[l] = 0; continue; } if (l <= lv[n - 1]){ lut[l] = 1; continue; }
    for (let k = 0; k < n - 1; k++) if (l <= lv[k] && l >= lv[k + 1]){ lut[l] = (k + ((lv[k] - l)/(lv[k] - lv[k + 1]) > .5 ? 1 : 0))/(n - 1); break; } }
  const data = new Uint8Array(w*h), cx = new Float32Array(n), cy = new Float32Array(n), cn = new Float32Array(n);
  for (let i = 0; i < w*h; i++){ const z = lut[Math.max(0, Math.min(255, L[i] | 0))]; data[i] = Math.round(z*255);
    const k = Math.round(z*(n - 1)); if (Math.abs(z*(n - 1) - k) < .15){ cx[k] += i % w; cy[k] += i/w | 0; cn[k]++; } }
  const dl = data.slice(); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){ let m = 0; for (let b = -2; b <= 2; b++) for (let a = -2; a <= 2; a++){ const v = dl[clamp(y + b, 0, h - 1)*w + clamp(x + a, 0, w - 1)]; if (v > m) m = v; } data[y*w + x] = m; }
  // a representative point per plane: the pixel of that plane closest to its centroid
  const pts = [...Array(n)].map((_, k) => { const mx = cx[k]/Math.max(1, cn[k]), my = cy[k]/Math.max(1, cn[k]); let best = [mx/w, my/h], bd = 1e9;
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2){ const z = data[y*w + x]/255*(n - 1); if (Math.abs(z - k) < .1){ const dd = (x - mx)**2 + (y - my)**2; if (dd < bd){ bd = dd; best = [x/w, y/h]; } } }
    return best; });
  return { w, h, data, ver:1, n, pts, at:(u, v) => data[clamp(Math.round(v*(h - 1)), 0, h - 1)*w + clamp(Math.round(u*(w - 1)), 0, w - 1)]/255 };
}
// segmented control on the page's .seg/.ind styles; edges() indicator, arrow keys move the choice
function mkSeg(root, onPick, start = 0){
  const ind = $(root, '.ind'), bs = $$(root, 'button'), e = edges(0, 0); let cur = start, x0 = 0, top = 0, hh = 0, ready = false;
  const place = inst => { const b = bs[cur]; if (!b.offsetWidth) return; top = b.offsetTop; hh = b.offsetHeight; e[inst || !ready ? 'jump' : 'go'](b.offsetLeft, b.offsetLeft + b.offsetWidth); ready = true; };
  const pick = (i, quiet) => { cur = i; bs.forEach((b, j) => b.setAttribute('aria-pressed', i === j)); place(); if (!quiet) onPick(i); };
  bs.forEach((b, i) => { b.type = 'button'; b.onclick = () => pick(i); });
  root.addEventListener('keydown', ev => { const d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0; if (!d) return; ev.preventDefault(); const i = (cur + d + bs.length) % bs.length; pick(i); bs[i].focus(); });
  new ResizeObserver(() => place(true)).observe(root); pick(start, true);
  return { pick, get cur(){ return cur; }, render(t){ if (!ready) place(true); const a = e.A.at(t), b = e.B.at(t); ind.style.transform = `translate(${px(a)},${px(top)})`; ind.style.width = px(b - a); ind.style.height = px(hh); } };
}
// run fn once, the first time the stage is actually on screen (every tile renders on the page's first frame)
const onView = (el, fn) => { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)){ io.disconnect(); fn(); } }, { threshold:.35 }); io.observe(el); };
const toggle = (b, on) => { b.setAttribute('aria-pressed', on); b.classList.toggle('ink', on); };

const CSS = `<style>
.fxp-w{position:absolute;inset:0;display:flex;flex-direction:column;gap:10px;padding:14px 16px 12px;container-type:inline-size;text-align:left;white-space:normal}
.fxp-fr{position:relative;flex:1 1 auto;min-height:0;border-radius:12px;overflow:hidden;background:#0C1016;outline:none;touch-action:none}
.fxp-fr:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.fxp-cv{position:absolute;inset:0;width:100%;height:100%;display:block}
.fxp-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;flex:none}
.fxp-gap{flex:1 1 0;min-width:0}
.fxp-tx{font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.fxp-chip{position:absolute;left:10px;top:10px;padding:4px 9px;border-radius:8px;background:rgba(12,16,22,.68);color:#EFF2F6;font-size:12px;line-height:1.35;pointer-events:none;white-space:nowrap;font-variant-numeric:tabular-nums;z-index:2}
.fxp-rg{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--muted);white-space:nowrap}
.fxp-rg input[type=range]{accent-color:var(--ink);width:112px;margin:0}
.fxp-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.fxp-w .btn{white-space:nowrap}
</style>`;

/* =============================================================== 1. progressive load */
const FS_LOAD = `uniform sampler2D uImg,uPh;uniform vec4 uCov;uniform float uDev,uX;
void main(){vec2 s=v*uCov.xy+uCov.zw;vec3 c=texture2D(uImg,s).rgb,p=texture2D(uPh,s).rgb;
float thr=lum(c)*.85+hash(floor(s*640.))*.15;
float a=uX>.5?uDev:smoothstep(0.,.3,uDev*1.32-thr);
gl_FragColor=vec4(mix(p,c,a),1.);}`;
atom({ id:'fxp-load', cat:'Photo effects', name:'Progressive photo load', block:'image, gallery, hero (lazy image with placeholder)', fam:['S','T'], wide:true, tall:true,
  html:`${CSS}<style>
.fxp-lg{flex:1 1 auto;min-height:0;display:grid;gap:10px;grid-template-columns:2fr 1fr;grid-template-rows:1fr 1fr}
.fxp-lg>.fxp-fr:first-child{grid-row:1/3}
.fxp-lg .fxp-chip{top:auto;bottom:8px;left:8px}
@container (max-width:620px){.fxp-lg{grid-template-columns:1fr 1fr;grid-template-rows:1.6fr 1fr}.fxp-lg>.fxp-fr:first-child{grid-row:auto;grid-column:1/3}}
</style><div class="fxp-w"><div class="fxp-lg">${[0, 1, 2].map(() => `<div class="fxp-fr" role="img"><canvas class="fxp-cv" aria-hidden="true"></canvas><span class="fxp-chip"></span></div>`).join('')}</div>
<div class="fxp-bar"><div class="seg" role="group" aria-label="Simulated network"><div class="ind"></div><button>Fast 4G</button><button>Slow 3G</button><button>Cached</button></div><button type="button" class="btn fxp-rl">Reload photos</button><span class="fxp-gap"></span><span class="fxp-tx" aria-live="polite"></span></div></div>`,
  desc:'A blurred 0.6 KB placeholder holds the layout from the first frame. When the real file lands it develops like a print in the tray: shadows come up first, then midtones, highlights last, over one second. Cached photos skip the reveal entirely, because animating something already there reads as lag. Use when: a feed, gallery or hero loads large photos over slow networks and the layout must not jump.',
  api:'a(px) = smoothstep(0, .3, dev·1.32 − (0.85·lum + 0.15·grain))   dev = (t − arrival)/1.1s; cached ⇒ dev = 1',
  init(st){
    const P = [{ n:'coast', kb:312 }, { n:'forest', kb:188 }, { n:'city', kb:164 }], ARR = [[.6, .3, .45], [3.6, 1.8, 2.6], [0, 0, 0]];
    const out = $(st, '.fxp-tx'), seg = mkSeg($(st, '.seg'), () => reload());
    const tiles = $$(st, '.fxp-fr').map((fr, i) => { fr.setAttribute('aria-label', PK() ? PK().CAPTIONS[P[i].n] : P[i].n);
      return { fr, cv:$(fr, 'canvas'), chip:$(fr, '.fxp-chip'), s:surface(fr, $(fr, 'canvas')), ph:lazyPhoto(P[i].n), pl:null, pv:-1, sig:'' }; });
    let t0 = null, mode = 0;
    const reload = () => { t0 = now() + .15; mode = seg.cur; tiles.forEach(T => T.sig = ''); };
    $(st, '.fxp-rl').onclick = reload; onView(st, reload);
    // LQIP: 20 px wide average, scaled up through a blur (what a server would inline as a data URL)
    const lqip = img => { const a = scaled(img, 20, Math.round(20*img.height/img.width)).c, c = document.createElement('canvas'); c.width = 200; c.height = Math.round(200*img.height/img.width);
      const x = c.getContext('2d'); x.filter = 'blur(6px)'; x.drawImage(a, -10, -10, c.width + 20, c.height + 20); x.filter = 'none'; return c; };
    return t => {
      seg.render(t);
      let done = 0;
      tiles.forEach((T, i) => {
        const img = T.ph.need(T.s.cw, T.s.ch); if (!img) return;
        if (T.pv !== T.ph.v){ T.pl = lqip(img); T.pv = T.ph.v; T.sig = ''; }
        const arr = ARR[mode][i], dt = t0 === null ? -1 : t - (t0 + arr), cached = mode === 2 && t0 !== null;
        const dev = cached ? 1 : dt <= 0 ? 0 : clamp(dt/(REDUCE ? .25 : 1.1));
        if (cached || dt >= 0) done++;
        txt(T.chip, cached ? 'From cache · 0 ms' : dt < 0 ? `Loading · ${P[i].kb} KB` : `Loaded in ${arr.toFixed(1)} s`);
        const sig = f2(dev, T.s.v, T.pv); if (sig === T.sig) return; T.sig = sig;
        const cov = cover(T.s.W, T.s.H, img.width, img.height);
        if (!GLX.run(T.cv, FS_LOAD, { uCov:cov, uDev:dev, uX:REDUCE ? 1 : 0 }, { uImg:img, uPh:T.pl })){
          const x = T.cv.getContext('2d'); x.globalAlpha = 1; drawCover(x, T.pl, cov, T.s.W, T.s.H); x.globalAlpha = sm(dev); drawCover(x, img, cov, T.s.W, T.s.H); x.globalAlpha = 1; }
      });
      txt(out, `${done} of 3 photos loaded`);
    };
  }});

/* =============================================================== 2. rack focus */
const FS_RACK = `uniform sampler2D uImg,uDep;uniform vec4 uCov;uniform float uF,uAp,uMax;uniform vec2 uPx;
float coc(float d){return clamp(abs(d-uF)*uAp,0.,1.)*uMax;}
void main(){vec2 s=v*uCov.xy+uCov.zw;float d=texture2D(uDep,s).r;
float R=coc(d);for(int k=0;k<4;k++){vec2 o=vec2(k==0?1.:k==1?-1.:0.,k==2?1.:k==3?-1.:0.)*uMax*.7*uPx;float dn=texture2D(uDep,s+o).r;if(dn>d+.04)R=max(R,coc(dn)*.6);}
vec3 acc=texture2D(uImg,s).rgb;float ws=1.;
if(R>.6){float j=hash(gl_FragCoord.xy)*6.2832;
for(int i=1;i<36;i++){float fi=float(i);float r=sqrt(fi/35.)*R;float a=fi*2.39996+j;vec2 q=s+vec2(cos(a),sin(a))*r*uPx;
float dq=texture2D(uDep,q).r;float w=clamp((dq<d-.02?min(coc(dq),coc(d)):coc(dq))-r+1.,0.,1.);acc+=texture2D(uImg,q).rgb*w;ws+=w;}}
gl_FragColor=vec4(acc/ws,1.);}`;
atom({ id:'fxp-rack', cat:'Photo effects', name:'Hover rack focus', block:'hero, image (depth of field)', fam:['M','D'], wide:true, tall:true,
  html:`${CSS}<style>
.fxp-ret{position:absolute;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;pointer-events:none;z-index:2}
</style><div class="fxp-w"><div class="fxp-fr" tabindex="0" role="slider" aria-label="Focus distance" aria-valuemin="0" aria-valuemax="100"><canvas class="fxp-cv" aria-hidden="true"></canvas>
<svg class="fxp-ret" viewBox="0 0 44 44" fill="none" stroke-linecap="round" aria-hidden="true"><path d="M3 13V3h10M31 3h10v10M41 31v10H31M13 41H3V31" stroke="rgba(12,16,22,.45)" stroke-width="4"/><path d="M3 13V3h10M31 3h10v10M41 31v10H31M13 41H3V31" stroke="#fff" stroke-width="2"/></svg><span class="fxp-chip"></span></div>
<div class="fxp-bar"><span class="fxp-tx">Aperture</span><div class="seg" role="group" aria-label="Aperture"><div class="ind"></div><button>f/1.8</button><button>f/4</button><button>f/11</button></div><span class="fxp-gap"></span><span class="fxp-tx">Point at the photo to pull focus. Arrow keys step through the planes.</span></div></div>`,
  desc:'Depth comes from the photo itself: each tree row is a flat tone and farther rows are hazier, so luminance sorts into planes. Point anywhere and focus pulls to that plane on a slow critically damped spring while the reticle tightens; blur everywhere else scales with distance from the focal plane and the aperture. Use when: a hero or product shot should guide the eye to what the pointer or the copy is talking about.',
  api:'focus.set(depth(pointer), S.lazy)   blur(px) = |depth − focus| · aperture · maxR   (36-tap gather, occlusion-aware)',
  init(st){
    const fr = $(st, '.fxp-fr'), cv = $(fr, 'canvas'), ret = $(st, '.fxp-ret'), chip = $(st, '.fxp-chip'), s = surface(fr, cv), ph = lazyPhoto('forest');
    const AP = [4, 1.9, .55]; let ap = AP[0]; const seg = mkSeg($(st, '.seg'), i => ap = AP[i]);
    const F = new Track(.85, S.lazy), lock = new Track(1, S.base), rx = new Track(0, S.snap), ry = new Track(0, S.snap), ro = new Track(0, S.base);
    let dep = null, dv = -1, sig = '', plane = 0, inside = false;
    const NEAR = ['Near spruce', 'Middle stand', 'Tree line', 'Far hills', 'Distant ridge'];   // named from the nearest plane outward
    const nameOf = d => { if (!dep) return ''; const k = Math.round(d*(dep.n - 1)); return k === 0 ? 'Sky' : NEAR[Math.min(NEAR.length - 1, dep.n - 1 - k)]; };
    const metres = d => d < .08 ? '∞' : `${Math.round(6*Math.pow(2, (1 - d)*6.5))} m`;
    const toSrc = (x, y) => { const c = cover(s.cw, s.ch, ph.W || 3, ph.H || 2); return [x/s.cw*c[0] + c[2], y/s.ch*c[1] + c[3]]; };
    const toFr = (u, v) => { const c = cover(s.cw, s.ch, ph.W || 3, ph.H || 2); return [(u - c[2])/c[0]*s.cw, (v - c[3])/c[1]*s.ch]; };
    const focusAt = (x, y) => { if (!dep) return; const [u, v] = toSrc(x, y); const vals = [];
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) vals.push(dep.at(u + a*.004, v + b*.004)); vals.sort((p, q) => p - q);
      const d = vals[4]; if (Math.abs(d - F.target) > .02){ F.set(d); lock.jump(1.25); lock.set(1); } plane = Math.round(d*(dep.n - 1)); };
    const point = (x, y, inst) => { rx[inst ? 'jump' : 'set'](x); ry[inst ? 'jump' : 'set'](y); ro.set(1); focusAt(x, y); };
    fr.addEventListener('pointermove', e => { const r = fr.getBoundingClientRect(); point(e.clientX - r.left, e.clientY - r.top, !inside); inside = true; });
    fr.addEventListener('pointerdown', e => { const r = fr.getBoundingClientRect(); point(e.clientX - r.left, e.clientY - r.top, !inside); inside = true; });
    fr.addEventListener('pointerleave', () => { inside = false; ro.set(0); });
    fr.addEventListener('keydown', e => { if (!dep) return; const k = e.key, n = dep.n;
      let p = k === 'ArrowUp' || k === 'ArrowRight' ? plane - 1 : k === 'ArrowDown' || k === 'ArrowLeft' ? plane + 1 : k === 'Home' ? n - 1 : k === 'End' ? 0 : null;
      if (p === null) return; e.preventDefault(); plane = clamp(p, 0, n - 1); const [fx, fy] = toFr(...dep.pts[plane]);
      rx.set(clamp(fx, 24, s.cw - 24)); ry.set(clamp(fy, 24, s.ch - 24)); ro.set(1); F.set(plane/(n - 1)); lock.jump(1.25); lock.set(1); });
    fr.addEventListener('blur', () => { if (!inside) ro.set(0); });
    return t => {
      seg.render(t); const img = ph.need(s.cw, s.ch); if (!img) return;
      if (dv !== ph.v){ if (dep) GLX.drop(dep); dep = depthOf(img); dv = ph.v; F.jump((dep.n - 2)/(dep.n - 1)); plane = dep.n - 2; sig = ''; }
      const f = F.at(t), L = lock.at(t), o = clamp(ro.at(t));
      ret.style.transform = `translate(${px(rx.at(t))},${px(ry.at(t))}) scale(${L.toFixed(4)})`; ret.style.opacity = o.toFixed(3);
      const nm = nameOf(F.target); txt(chip, `Focus · ${nm} · ${metres(F.target)}`);
      att(fr, 'aria-valuenow', Math.round(F.target*100)); att(fr, 'aria-valuetext', `${nm}, ${metres(F.target)}`);
      const k = f2(f, ap, s.v, dv); if (k === sig) return; sig = k;
      const cov = cover(s.W, s.H, img.width, img.height);
      if (!GLX.run(cv, FS_RACK, { uCov:cov, uF:f, uAp:ap, uMax:img.width*.0075*(REDUCE ? .7 : 1), uPx:[1/img.width, 1/img.height] }, { uImg:img, uDep:dep }))
        drawCover(cv.getContext('2d'), img, cov, s.W, s.H);
    };
  }});

/* =============================================================== 3. brand duotone */
atom({ id:'fxp-duo', cat:'Photo effects', name:'Brand tint to colour', block:'card grid, team, articles (image)', fam:['M'], wide:true, tall:true,
  html:`${CSS}<style>
.fxp-dh{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex:none}
.fxp-dh b{font-size:18px;letter-spacing:-.02em;font-weight:600}
.fxp-dg{flex:1 1 auto;min-height:0;display:grid;gap:12px;grid-template-columns:repeat(4,minmax(0,1fr))}
@container (max-width:900px){.fxp-dg{grid-template-columns:repeat(2,minmax(0,1fr))}}
.fxp-dc{display:flex;flex-direction:column;gap:8px;min-height:0;padding:0;border:0;background:none;text-align:left;cursor:pointer;color:var(--ink);border-radius:12px}
.fxp-dc:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.fxp-di{position:relative;flex:1 1 auto;min-height:0;border-radius:12px;overflow:hidden;background:var(--raised)}
.fxp-di canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.fxp-dt{display:block;font-size:14px;font-weight:600;line-height:1.3;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fxp-dm{display:block;font-size:12.5px;color:var(--muted);margin-top:2px}
@container (max-width:520px){.fxp-dg{gap:10px}.fxp-dt{font-size:13px}.fxp-dm{font-size:12px}}
</style><div class="fxp-w"><div class="fxp-dh"><b>From the field</b><span class="fxp-tx">4 new stories this week</span></div><div class="fxp-dg"></div>
<div class="fxp-bar"><span class="fxp-tx">Tint</span><div class="seg" role="group" aria-label="Tint"><div class="ind"></div><button>Ink</button><button>Moss</button><button>Ember</button></div><span class="fxp-gap"></span><span class="fxp-tx">Hover or Tab to a story</span></div></div>`,
  desc:'Every photo is gradient-mapped through three tokens (darkest neutral, a tint, lightest neutral), so mixed sources read as one set in both themes. The story under the pointer or keyboard focus cross-fades back to full colour on a soft spring; switching the tint dissolves old map into new. Use when: a grid mixes photos from many sources and needs one calm brand look, with colour reserved for the item you are on.',
  api:'duo = gradientMap(lum, [dark, tint, light])   card.colour.set(hover || focus ? 1 : 0, S.soft)',
  init(st){
    // focal x per photo: keep the sun whole or leave it out, never cut in half at the card edge
    const D = [['ridge', 'What the ridge keeps', 'Field notes · 6 min', .8], ['harbor', 'Low tide, six a.m.', 'Dispatch · 4 min', .2], ['meadow', 'A meadow in August', 'Essay · 9 min', .15], ['canyon', 'Inside the canyon wall', 'Field notes · 7 min', .85]];
    const grid = $(st, '.fxp-dg'); let tint = 0, tv = 0, theme = -1;
    const cards = D.map(([n, title, meta, fx]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'fxp-dc';
      b.innerHTML = `<span class="fxp-di" style="display:block"><canvas aria-hidden="true"></canvas><canvas aria-hidden="true"></canvas><canvas aria-hidden="true"></canvas></span><span><span class="fxp-dt"></span><span class="fxp-dm"></span></span>`;
      $(b, '.fxp-dt').textContent = title; $(b, '.fxp-dm').textContent = meta; b.setAttribute('aria-label', `${title}. ${meta}. Photo: ${PK() ? PK().CAPTIONS[n] : n}`); grid.appendChild(b);
      const cvs = $$(b, 'canvas'), wrap = $(b, '.fxp-di'), c = { b, n, fx, wrap, duo:[cvs[0], cvs[1]], col:cvs[2], s:{ cw:1, ch:1, v:0 }, front:0, fade:new Track(1, S.base), p:new Track(0, S.soft), sv:-1, tv:-1, img:null, small:null };
      new ResizeObserver(() => { c.s.cw = wrap.clientWidth; c.s.ch = wrap.clientHeight; c.s.v++; }).observe(wrap);
      const on = v => c.p.set(v ? 1 : 0); b.onpointerenter = () => on(1); b.onpointerleave = () => on(document.activeElement === b); b.onfocus = () => on(1); b.onblur = () => on(0);
      return c; });
    const seg = mkSeg($(st, '.seg'), i => { tint = i; tv++; });
    const ramp = () => { const ink = tok(st, '--ink'), card = tok(st, '--card'), dark = L3(ink) < L3(card) ? ink : card, light = dark === ink ? card : ink;
      const mid = tint === 0 ? dark.map((v, i) => lerp(v, light[i], .5)) : tint === 1 ? tok(st, '--accent') : tok(st, '--warning'); return [dark, mid, light]; };
    const paint = (c, cvs) => { const W = c.col.width, H = c.col.height, src = c.small.x.getImageData(0, 0, W, H), d = src.data, [a, m, b] = ramp();
      for (let i = 0; i < d.length; i += 4){ let l = (.2126*d[i] + .7152*d[i + 1] + .0722*d[i + 2])/255; l = lerp(l, l*l*(3 - 2*l), .5);
        const lo = l < .5, k = lo ? l*2 : (l - .5)*2, p = lo ? a : m, q = lo ? m : b; d[i] = (p[0] + (q[0] - p[0])*k)*255; d[i + 1] = (p[1] + (q[1] - p[1])*k)*255; d[i + 2] = (p[2] + (q[2] - p[2])*k)*255; }
      cvs.width = W; cvs.height = H; cvs.getContext('2d').putImageData(src, 0, 0); };
    return t => {
      seg.render(t); if (theme !== themeV){ theme = themeV; tv++; }
      for (const c of cards){
        if (c.sv !== c.s.v && c.s.cw > 4){ const k = Math.min(DPR(), 800/c.s.cw), W = Math.round(c.s.cw*k), H = Math.round(c.s.ch*k), [sw, sh] = srcSize(c.s.cw, c.s.ch);
          const img = photo(c.n, sw, sh); if (!img) continue; c.sv = c.s.v;
          c.small = scaled(img, W, H); const cov = cover(W, H, img.width, img.height, c.fx); c.small.x.clearRect(0, 0, W, H); drawCover(c.small.x, img, cov, W, H);
          c.col.width = W; c.col.height = H; c.col.getContext('2d').drawImage(c.small.c, 0, 0); paint(c, c.duo[c.front]); c.tv = tv; }
        else if (c.small && c.tv !== tv){ c.tv = tv; c.front ^= 1; paint(c, c.duo[c.front]); c.fade.jump(0).set(1); }
        const p = clamp(c.p.at(t)), f = clamp(c.fade.at(t));
        c.duo[c.front].style.opacity = f.toFixed(3); c.duo[c.front ^ 1].style.opacity = '1'; c.duo[c.front].style.zIndex = 1; c.duo[c.front ^ 1].style.zIndex = 0;
        c.col.style.zIndex = 2; c.col.style.opacity = p.toFixed(3);
      }
    };
  }});

/* =============================================================== 4. relight with the sun */
/* The sun path below matches PhotoKit's (x = .68 − .1·tod, y = .18 + .3·tod, r = .05 + .02·tod of the short side),
   so the drawn sun lands exactly on the baked one at midday and at golden hour. Both baked discs are painted
   out from the surrounding sky, so only one sun is ever on screen. */
const FS_SUN = `uniform sampler2D uDay,uGold,uSky;uniform vec4 uCov;uniform vec2 uSrc,uSun,uD,uGp;uniform float uG,uR,uRD,uRG;uniform vec3 uSD,uSG;
void main(){vec2 s=v*uCov.xy+uCov.zw;vec2 p=s*uSrc;float sky=texture2D(uSky,s).r;
vec3 a=texture2D(uDay,s).rgb,b=texture2D(uGold,s).rgb;float n=(hash(p)-.5)*.035;
if(sky>.5){vec2 d=p-uD;float L=length(d);if(L<uRD){vec2 r=L>.01?d/L:vec2(0.,-1.);r.y=-abs(r.y);a=texture2D(uDay,(uD+r*uRD*1.1)/uSrc).rgb+n;}
d=p-uGp;L=length(d);if(L<uRG){vec2 r=L>.01?d/L:vec2(0.,-1.);r.y=-abs(r.y);b=texture2D(uGold,(uGp+r*uRG*1.1)/uSrc).rgb+n;}}
vec2 q=p-uSun;float pool=exp(-dot(q,q)/(uSrc.x*uSrc.x*.2));
float m=clamp(uG+(pool-.45)*.7*sin(3.14159*uG),0.,1.);
vec3 c=mix(a,b,m),sc=mix(uSD,uSG,uG);float L2=length(q);
float h=clamp(1.-L2/(uR*6.),0.,1.);c=mix(c,sc,h*h*.5*4.*uG*(1.-uG)*sky);
c=mix(c,sc,(1.-smoothstep(uR-1.2,uR+1.2,L2))*sky);
gl_FragColor=vec4(c,1.);}`;
atom({ id:'fxp-relight', cat:'Photo effects', name:'Relight with the sun', block:'hero, cover image (time of day)', fam:['D','M'], wide:true, tall:true,
  html:`${CSS}<style>
.fxp-sun{position:absolute;left:0;top:0;width:48px;height:48px;margin:-24px 0 0 -24px;border:0;padding:0;background:none;border-radius:50%;cursor:grab;z-index:3;touch-action:none}
.fxp-sun:active{cursor:grabbing}
.fxp-sun:focus-visible{outline:none}
.fxp-sun svg{position:absolute;inset:0}
.fxp-path{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}
</style><div class="fxp-w"><div class="fxp-fr" role="group" aria-label="Ridge line photo, relit by time of day"><canvas class="fxp-cv" aria-hidden="true"></canvas>
<svg class="fxp-path" aria-hidden="true"><path fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="2 6" stroke-linecap="round"/></svg>
<button type="button" class="fxp-sun" role="slider" aria-label="Sun position" aria-valuemin="0" aria-valuemax="100"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="rgba(12,16,22,.4)" stroke-width="3.5"/><circle cx="24" cy="24" r="20" fill="none" stroke="#fff" stroke-width="1.5"/></svg></button><span class="fxp-chip"></span></div>
<div class="fxp-bar"><button type="button" class="btn" data-g="0">Midday</button><button type="button" class="btn" data-g=".82">Golden hour</button><button type="button" class="btn fxp-now">Match my time</button><span class="fxp-gap"></span><span class="fxp-tx" aria-live="polite"></span></div></div>`,
  desc:'Two pixel-aligned exposures of the same ridge, midday and golden hour, blend through a soft light mask centred on the sun: light near the sun warms first, the far side last. Drag the sun along its path (1:1, then it coasts on release velocity) and it sets behind the real ridge line. Use when: a hero photo should follow the visitor’s local time or the mood of a page, without shipping a second photo set.',
  api:'mask = g + (pool(sun) − .45)·.7·sin(πg)   colour = mix(day, golden, mask)   sun drawn on sky only; g.release(g, v·dg/dpx)',
  init(st){
    const fr = $(st, '.fxp-fr'), cv = $(fr, 'canvas'), sun = $(st, '.fxp-sun'), ring = $$(sun, 'circle'), path = $(st, '.fxp-path path'), chip = $(st, '.fxp-chip'), out = $(st, '.fxp-tx'), s = surface(fr, cv);
    const G = new Track(.62, S.soft), hov = new Track(0, S.base); let day = null, gold = null, sky = null, W = 0, H = 0, sig = '', held = false, pv = '', now0 = null;
    const FX = .63, FY = .34;
    const sunAt = g => [W*(.68 - .1*g) + W*.03*Math.sin(Math.PI*g), H*(.18 + .3*g)], rad = g => Math.min(W, H)*(.05 + .02*g);
    const cov = () => cover(s.cw, s.ch, W || 3, H || 2, FX, FY);
    const toFr = ([x, y]) => { const c = cov(); return [(x/W - c[2])/c[0]*s.cw, (y/H - c[3])/c[1]*s.ch]; };
    const nearest = (x, y) => { let best = 0, bd = 1e9; for (let i = 0; i <= 100; i++){ const [a, b] = toFr(sunAt(i/100)), d = (a - x)**2 + (b - y)**2; if (d < bd){ bd = d; best = i/100; } } return best; };
    const clock12 = g => { const m = Math.round(12.5*60 + g*(19.67 - 12.5)*60), h = Math.floor(m/60), mm = m % 60; return `${h > 12 ? h - 12 : h}:${String(mm).padStart(2, '0')} pm`; };
    const mood = g => g < .2 ? 'High sun, cool shadows' : g < .55 ? 'Afternoon, warming' : g < .86 ? 'Golden hour, raking light' : 'Sun setting behind the ridge';
    let samples = [];
    drag(fr, { down:p => { if (!W) return; held = true; samples = []; G.jump(nearest(p.x, p.y)); hov.set(1); now0 = null; },
      move:p => { if (!held) return; G.jump(nearest(p.x, p.y)); samples.push([now(), G.target]); if (samples.length > 5) samples.shift(); },
      up:() => { if (!held) return; held = false; hov.set(document.activeElement === sun ? 1 : 0);
        const a = samples[0], b = samples[samples.length - 1]; const vg = a && b && b[0] > a[0] ? (b[1] - a[1])/(b[0] - a[0]) : 0;
        G.release(G.target, vg, clamp(G.target + vg*.12)); } });
    sun.onfocus = () => hov.set(1); sun.onblur = () => hov.set(0); sun.onpointerenter = () => hov.set(1); sun.onpointerleave = () => { if (!held && document.activeElement !== sun) hov.set(0); };
    sun.onkeydown = e => { const k = e.key, d = { ArrowUp:-.04, ArrowLeft:-.04, ArrowDown:.04, ArrowRight:.04, PageUp:-.2, PageDown:.2 }[k];
      if (d !== undefined){ e.preventDefault(); G.set(clamp(G.target + d)); now0 = null; } else if (k === 'Home' || k === 'End'){ e.preventDefault(); G.set(k === 'Home' ? 0 : 1); now0 = null; } };
    $$(st, '[data-g]').forEach(b => b.onclick = () => { G.set(+b.dataset.g); now0 = null; });
    $(st, '.fxp-now').onclick = () => { const d = new Date(), h = d.getHours() + d.getMinutes()/60; G.set(clamp(Math.abs(h - 12.5)/7.17)); now0 = d; };
    return t => {
      if (!day){ const [w, h] = srcSize(s.cw, s.ch); day = photo('ridge', w, h, 0); if (!day) return; }
      if (!gold){ gold = photo('ridge', day.width, day.height, 1); if (!gold) return; W = day.width; H = day.height;
        // sky mask: everything above the first ridge in each column (half resolution)
        const w = W >> 1, h = H >> 1, d = scaled(day, w, h).d(), m = new Uint8Array(w*h);
        for (let x = 0; x < w; x++) for (let y = 0; y < h; y++){ const i = (y*w + x)*4; if (.2126*d[i] + .7152*d[i + 1] + .0722*d[i + 2] < 168) break; m[y*w + x] = 255; }
        sky = { w, h, data:m, ver:1 }; }
      const g = clamp(G.at(t)), o = clamp(hov.at(t)), [sx, sy] = toFr(sunAt(g));
      sun.style.transform = `translate(${px(sx)},${px(sy)})`; ring.forEach(c => c.style.opacity = (.35 + .65*o).toFixed(3));
      const pk = f2(s.v, W); if (pk !== pv){ pv = pk; let d = ''; for (let i = 0; i <= 24; i++){ const [a, b] = toFr(sunAt(i/24)); d += (i ? 'L' : 'M') + a.toFixed(1) + ' ' + b.toFixed(1); } path.setAttribute('d', d); }
      path.style.opacity = (.25 + .45*o).toFixed(3);
      txt(chip, now0 ? `Your time · ${clock12(g)}` : clock12(g)); txt(out, mood(G.target));
      att(sun, 'aria-valuenow', Math.round(G.target*100)); att(sun, 'aria-valuetext', `${clock12(G.target)}, ${mood(G.target)}`);
      const k = f2(g, s.v); if (k === sig) return; sig = k;
      const c = cover(s.W, s.H, W, H, FX, FY), sp = sunAt(g);
      const ok = GLX.run(cv, FS_SUN, { uCov:c, uSrc:[W, H], uSun:sp, uD:sunAt(0), uGp:sunAt(1), uG:g, uR:rad(g), uRD:rad(0) + 2.5, uRG:rad(1) + 2.5, uSD:[1, .98, .92], uSG:[1, .84, .59] }, { uDay:day, uGold:gold, uSky:sky });
      if (!ok){ const x = cv.getContext('2d'); x.globalAlpha = 1; drawCover(x, day, c, s.W, s.H); x.globalAlpha = g; drawCover(x, gold, c, s.W, s.H); x.globalAlpha = 1; }
    };
  }});

/* =============================================================== 5. depth parallax */
const FS_PAR = `uniform sampler2D uImg,uDep;uniform vec4 uCov;uniform vec2 uOff;uniform float uShow,uN;uniform vec3 uA,uB;
void main(){vec2 s=v*uCov.xy+uCov.zw;vec2 q=s;
for(int i=0;i<4;i++){float d=texture2D(uDep,q).r;q=s+uOff*(d-.4);}
vec3 c=texture2D(uImg,q).rgb;
if(uShow>.001){float d=texture2D(uDep,q).r;float k=floor(d*(uN-1.)+.5)/max(1.,uN-1.);c=mix(c,mix(uA,uB,k),.55*uShow);}
gl_FragColor=vec4(c,1.);}`;
atom({ id:'fxp-depth', cat:'Photo effects', name:'Depth parallax', block:'hero, landing header (image)', fam:['D','E'], wide:true, tall:true,
  html:`${CSS}<div class="fxp-w"><div class="fxp-fr" tabindex="0" role="img" aria-label="Ridge line, Sierra Nevada. Move the pointer or use arrow keys to look around."><canvas class="fxp-cv" aria-hidden="true"></canvas><span class="fxp-chip">Ridge line, Sierra Nevada</span></div>
<div class="fxp-bar"><button type="button" class="btn fxp-dpl" aria-pressed="false">Show planes</button><label class="fxp-rg">Depth <input id="fxp-depth-amt" type="range" min="0" max="100" value="60"></label><span class="fxp-gap"></span><span class="fxp-tx"></span></div></div>`,
  desc:'The photo is split into planes by aerial perspective (farther ridges are lighter). The pointer offsets each plane by its depth around a pivot at the middle ridge: sky and far ridge drift against the pointer, the foreground follows it, at most about 1% of the width. Planes ride a lazy spring and drift home when the pointer leaves. Use when: a landing hero needs a sense of place without video, and the photo must stay fully readable.',
  api:'q = s + off·(depth(q) − .4)  (4 fixed-point steps)   off.{x,y}.set(pointer·amt, S.lazy)',
  init(st){
    const fr = $(st, '.fxp-fr'), cv = $(fr, 'canvas'), out = $(st, '.fxp-tx'), amt = $(st, '#fxp-depth-amt'), btn = $(st, '.fxp-dpl'), s = surface(fr, cv), ph = lazyPhoto('ridge');
    const ox = new Track(0, S.lazy), oy = new Track(0, S.lazy), show = new Track(0, S.base); let dep = null, dv = -1, sig = '', theme = -1, A = [0, 0, 0], B = [1, 1, 1];
    const aim = (x, y) => { const k = amt.value/100*.016; ox.set(-x*k); oy.set(-y*k*.6); };
    fr.addEventListener('pointermove', e => { const r = fr.getBoundingClientRect(); aim((e.clientX - r.left)/r.width*2 - 1, (e.clientY - r.top)/r.height*2 - 1); });
    fr.addEventListener('pointerleave', () => aim(0, 0));
    let kx = 0, ky = 0;
    fr.addEventListener('keydown', e => { const d = { ArrowLeft:[-1, 0], ArrowRight:[1, 0], ArrowUp:[0, -1], ArrowDown:[0, 1] }[e.key];
      if (e.key === 'Escape' || e.key === '0'){ kx = ky = 0; aim(0, 0); return; } if (!d) return; e.preventDefault(); kx = clamp(kx + d[0]*.5, -1, 1); ky = clamp(ky + d[1]*.5, -1, 1); aim(kx, ky); });
    fr.addEventListener('blur', () => { kx = ky = 0; aim(0, 0); });
    btn.onclick = () => { const on = btn.getAttribute('aria-pressed') !== 'true'; toggle(btn, on); show.set(on ? 1 : 0); };
    return t => {
      const img = ph.need(s.cw*1.05, s.ch*1.05); if (!img) return;
      if (dv !== ph.v){ if (dep) GLX.drop(dep); dep = depthOf(img); dv = ph.v; sig = ''; }
      if (theme !== themeV){ theme = themeV; A = tok(st, '--accent'); B = tok(st, '--card'); sig = ''; }
      txt(out, REDUCE ? 'Reduced motion: parallax is off' : `${dep.n} planes from haze`);
      const x = REDUCE ? 0 : ox.at(t), y = REDUCE ? 0 : oy.at(t), sh = clamp(show.at(t));
      const k = f2(x, y, sh, s.v, dv); if (k === sig) return; sig = k;
      const cov = cover(s.W, s.H, img.width, img.height, .5, .5, 1.035);
      if (!GLX.run(cv, FS_PAR, { uCov:cov, uOff:[x, y], uShow:sh, uN:dep.n, uA:A, uB:B }, { uImg:img, uDep:dep })) drawCover(cv.getContext('2d'), img, cov, s.W, s.H);
    };
  }});

/* =============================================================== 6. halftone to photo */
const FS_HT = `uniform sampler2D uImg;uniform vec4 uCov;uniform float uP,uMode,uCell;uniform vec3 uInk,uPaper;
void main(){vec2 fp=v*uRes;float p=uP;float cell=uCell*pow(1.4/uCell,smoothstep(0.,.9,p));
float an=uMode<.5?.7854:.2618;float cs=cos(an),sn=sin(an);
vec2 g=vec2(cs*fp.x+sn*fp.y,-sn*fp.x+cs*fp.y)/cell;vec2 id=floor(g)+.5,f=fract(g)-.5;
if(uMode>.5)id.x=g.x;
vec2 cg=id*cell;vec2 cp=vec2(cs*cg.x-sn*cg.y,sn*cg.x+cs*cg.y)/uRes;
vec3 cc=texture2D(uImg,clamp(cp,0.,1.)*uCov.xy+uCov.zw).rgb,ph=texture2D(uImg,v*uCov.xy+uCov.zw).rgb;
float Lp=lum(uPaper),Li=lum(uInk);float cov=clamp((Lp-lum(cc))/(Lp-Li+(Lp>Li?1e-4:-1e-4)),0.,1.);
float aa=.9/cell,ink;
if(uMode<.5){float r=sqrt(cov/3.14159);ink=1.-smoothstep(r-aa,r+aa,length(f));}
else{float th=cov*.5;ink=1.-smoothstep(th-aa,th+aa,abs(f.y));}
float col=smoothstep(.2,.65,p);vec3 inkC=mix(uInk,cc,col),pap=mix(uPaper,mix(uPaper,cc,.35),col);
vec3 o=mix(pap,inkC,ink);
gl_FragColor=vec4(mix(o,ph,smoothstep(.62,1.,p)),1.);}`;
atom({ id:'fxp-screen', cat:'Photo effects', name:'Halftone to photo', block:'editorial hero, article header (image)', fam:['S','T'], wide:true, tall:true,
  html:`${CSS}<style>
.fxp-ed{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(220px,.75fr) 1.5fr;gap:20px;align-items:stretch}
.fxp-et{display:flex;flex-direction:column;justify-content:flex-end;gap:10px;padding:4px 0 6px;min-width:0}
.fxp-ek{font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.fxp-eh{margin:0;font-size:30px;line-height:1.08;letter-spacing:-.03em;font-weight:600;text-wrap:balance}
.fxp-es{margin:0;color:var(--muted);font-size:14.5px;line-height:1.5;text-wrap:pretty}
.fxp-eb{font-size:12.5px;color:var(--muted)}
@container (max-width:700px){.fxp-ed{grid-template-columns:1fr;grid-template-rows:1fr auto;gap:12px}.fxp-et{order:2;padding:0;gap:6px}.fxp-eh{font-size:22px}.fxp-es{font-size:13.5px}}
@container (max-width:420px){.fxp-es{display:none}}
</style><div class="fxp-w"><div class="fxp-ed"><div class="fxp-et"><span class="fxp-ek">Field notes · Issue 14</span><h4 class="fxp-eh">Where the coast road ends</h4><p class="fxp-es">Forty miles of switchbacks, one diner, and the light that makes the drive worth it.</p><span class="fxp-eb">Words by Ines Alvarez · Photographs by Theo Marsh</span></div>
<div class="fxp-fr" role="img" aria-label="Coast road at midday"><canvas class="fxp-cv" aria-hidden="true"></canvas></div></div>
<div class="fxp-bar"><div class="seg" role="group" aria-label="Screen"><div class="ind"></div><button>Dots</button><button>Lines</button></div><label class="fxp-rg">Resolve <input id="fxp-screen-p" type="range" min="0" max="100" value="0"></label><button type="button" class="btn fxp-rp">Replay</button></div></div>`,
  desc:'The hero arrives as print: an ink screen whose dot sizes carry the photo’s tones in the page’s own ink and paper colours. It then resolves over 2.2 s: the screen gets finer, the dots take on the photo’s colour, and the last stretch dissolves into the full photograph. Scrub it, or pick dots or a 15° line screen. Use when: an editorial or campaign hero wants a printed, considered entrance that still ends on the real photo.',
  api:'cell = c0·(1.4/c0)^smoothstep(0,.9,p)   dot r = √(coverage/π)   out = mix(screen, photo, smoothstep(.62,1,p))',
  init(st){
    const fr = $(st, '.fxp-fr'), cv = $(fr, 'canvas'), rg = $(st, '#fxp-screen-p'), s = surface(fr, cv), ph = lazyPhoto('coast');
    let mode = 0, sig = '', theme = -1, ink = [0, 0, 0], paper = [1, 1, 1]; const P = new Tw(0);
    const play = () => { P.jump(0).to(1, 2.2); }; $(st, '.fxp-rp').onclick = play;
    // picking a screen (even the one already on) replays the resolve, so every click shows the change
    const seg = mkSeg($(st, '.seg'), i => { mode = i; play(); });
    rg.oninput = () => P.jump(rg.value/100); onView(st, () => P.jump(0).to(1, 2.2, now() + .4));
    return t => {
      seg.render(t); const img = ph.need(s.cw, s.ch); if (!img) return;
      if (theme !== themeV){ theme = themeV; ink = tok(st, '--ink'); paper = tok(st, '--card'); sig = ''; }
      const p = P.at(t); if (P.busy(t) || P.d) { const v = String(Math.round(p*100)); if (document.activeElement !== rg && rg.value !== v) rg.value = v; }
      const k = f2(p, mode, s.v, theme); if (k === sig) return; sig = k;
      const cov = cover(s.W, s.H, img.width, img.height);
      if (!GLX.run(cv, FS_HT, { uCov:cov, uP:p, uMode:mode, uCell:9*(s.W/s.cw), uInk:ink, uPaper:paper }, { uImg:img })){
        const x = cv.getContext('2d'); x.filter = `grayscale(${(1 - p).toFixed(3)}) contrast(${(1.25 - .25*p).toFixed(3)})`; drawCover(x, img, cov, s.W, s.H); x.filter = 'none'; }
    };
  }});

/* =============================================================== 7. colour grade + histogram */
const FS_GRADE = `uniform sampler2D uImg;uniform vec4 uCov;uniform float uEV,uT,uClip;uniform vec3 uHi,uLo;
void main(){vec2 s=v*uCov.xy+uCov.zw;vec3 c=texture2D(uImg,s).rgb;vec3 l=pow(c,vec3(2.2));
vec3 m=vec3(1.+.28*uT,1.+.04*uT,1.-.30*uT);m/=dot(m,vec3(.2126,.7152,.0722));l*=m*exp2(uEV);
vec3 o=pow(clamp(l,0.,1.),vec3(1./2.2));float mx=max(l.r,max(l.g,l.b));
o=mix(o,uHi,step(.999,mx)*.85*uClip);o=mix(o,uLo,step(mx,.0015)*.85*uClip);
gl_FragColor=vec4(o,1.);}`;
atom({ id:'fxp-grade', cat:'Photo effects', name:'Grade with live histogram', block:'image editor, media library (adjust)', fam:['D','M'], wide:true, tall:true,
  html:`${CSS}<style>
.fxp-gl{flex:1 1 auto;min-height:0;display:flex;gap:14px}
.fxp-gp{flex:none;width:250px;display:flex;flex-direction:column;gap:10px;min-height:0}
.fxp-hc{position:relative;height:96px;border-radius:10px;background:var(--raised);overflow:hidden}
.fxp-hc canvas{position:absolute;inset:0;width:100%;height:100%}
.fxp-cl{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
.fxp-sl{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;align-items:center;font-size:12.5px;color:var(--muted)}
.fxp-sl label{display:flex;justify-content:space-between;grid-column:1/3;font-variant-numeric:tabular-nums}
.fxp-sl label b{font-weight:500;color:var(--ink)}
.fxp-sl input{grid-column:1/3;width:100%;accent-color:var(--ink);margin:0}
.fxp-gb{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
@container (max-width:700px){.fxp-gl{flex-direction:column;gap:10px}.fxp-gp{width:auto;display:grid;grid-template-columns:1fr 1fr;gap:8px 14px}.fxp-hc{height:64px;grid-column:1/3}.fxp-cl{grid-column:1/3}.fxp-gb{grid-column:1/3}}
@container (max-width:420px){.fxp-gp{grid-template-columns:1fr}.fxp-hc,.fxp-cl,.fxp-gb{grid-column:auto}}
</style><div class="fxp-w"><div class="fxp-gl"><div class="fxp-fr" role="img" aria-label="Still lake at dawn. Drag sideways on the photo to change exposure."><canvas class="fxp-cv" aria-hidden="true"></canvas><span class="fxp-chip"></span></div>
<div class="fxp-gp"><div class="fxp-hc" role="img" aria-label="Luminance histogram"><canvas aria-hidden="true"></canvas></div><div class="fxp-cl"><span data-k="lo"></span><span data-k="hi"></span></div>
<div class="fxp-sl"><label for="fxp-grade-ev">Exposure <b data-k="ev"></b></label><input id="fxp-grade-ev" type="range" min="-2" max="2" step=".05" value="0"></div>
<div class="fxp-sl"><label for="fxp-grade-t">Temperature <b data-k="t"></b></label><input id="fxp-grade-t" type="range" min="-1" max="1" step=".02" value="0"></div>
<div class="fxp-gb"><button type="button" class="btn fxp-au">Auto</button><button type="button" class="btn fxp-rs">Reset</button><button type="button" class="btn fxp-ck" aria-pressed="false">Show clipping</button></div></div></div></div>`,
  desc:'Exposure and white balance are applied in linear light, and the same curve runs on a 1/8-size copy to draw the histogram, so the graph slides with the photo as you scrub. Drag sideways on the photo for exposure, or use the sliders. Auto exposes to the right (the 98th percentile lands just under white) with half a grey-world balance; Auto and Reset glide there on a soft spring. Clipped highlights and crushed shadows can be painted in danger and accent. Use when: people adjust uploads in a media library or editor and need to see what they are losing.',
  api:'lin = srgb^2.2 · wb(T) · 2^EV   hist = Σ LUT(px)   ev.set(auto, S.soft) | ev.jump(slider)',
  init(st){
    const fr = $(st, '.fxp-fr'), cv = $(fr, 'canvas'), chip = $(st, '.fxp-chip'), hcv = $(st, '.fxp-hc canvas'), s = surface(fr, cv), ph = lazyPhoto('lake');
    const evI = $(st, '#fxp-grade-ev'), tI = $(st, '#fxp-grade-t'), K = k => $(st, `[data-k="${k}"]`), ck = $(st, '.fxp-ck');
    const EV = new Track(0, S.soft), T = new Track(0, S.soft), hud = new Track(0, S.base), clip = new Track(0, S.base);
    let small = null, pv = -1, sig = '', hsig = '', theme = -1, HI = [1, 0, 0], LO = [0, 0, 1], hw = 0, hh = 0, auto = [0, 0];
    new ResizeObserver(() => { hw = hcv.clientWidth; hh = hcv.clientHeight; hsig = ''; }).observe(hcv);
    evI.oninput = () => EV.jump(+evI.value); tI.oninput = () => T.jump(+tI.value);
    $(st, '.fxp-au').onclick = () => { EV.set(auto[0]); T.set(auto[1]); };
    $(st, '.fxp-rs').onclick = () => { EV.set(0); T.set(0); };
    ck.onclick = () => { const on = ck.getAttribute('aria-pressed') !== 'true'; toggle(ck, on); clip.set(on ? 1 : 0); };
    let x0 = 0, e0 = 0;
    drag(fr, { down:p => { x0 = p.x; e0 = EV.at(); hud.set(1); }, move:p => EV.jump(clamp(e0 + (p.x - x0)/p.w*3, -2, 2)), up:() => hud.set(0) });
    const lut = (ev, tt) => { const m = [1 + .28*tt, 1 + .04*tt, 1 - .30*tt], n = .2126*m[0] + .7152*m[1] + .0722*m[2], k = 2**ev;
      return m.map(mc => { const a = new Uint8Array(256), clipAt = new Uint8Array(256); for (let i = 0; i < 256; i++){ const l = (i/255)**2.2*mc/n*k; a[i] = Math.round(Math.min(1, l)**(1/2.2)*255); clipAt[i] = l >= .999 ? 1 : l <= .0015 ? 2 : 0; } return [a, clipAt]; }); };
    return t => {
      const img = ph.need(s.cw, s.ch); if (!img) return;
      if (pv !== ph.v){ pv = ph.v; small = scaled(img, 200, Math.round(200*img.height/img.width)).d(); let r = 0, b = 0; const ls = [];
        for (let i = 0; i < small.length; i += 4){ const R = (small[i]/255)**2.2, G2 = (small[i + 1]/255)**2.2, B = (small[i + 2]/255)**2.2; r += R; b += B; ls.push(Math.max(R, G2, B)); }
        // auto: expose to the right (98th percentile lands at .92, so a small sun disc may clip) and half a grey-world white balance
        ls.sort((p, q) => p - q); const p98 = ls[Math.floor(ls.length*.98)] || 1;
        auto = [clamp(Math.round(Math.log2(.92/p98)*20)/20, -2, 2), clamp(Math.round((b - r)/(r + b)*1.5*50)/50, -.6, .6)]; }
      if (theme !== themeV){ theme = themeV; HI = tok(st, '--danger'); LO = tok(st, '--accent'); sig = hsig = ''; }
      const ev = EV.at(t), tt = T.at(t), cl = clamp(clip.at(t)), hu = clamp(hud.at(t));
      if (document.activeElement !== evI) evI.value = ev.toFixed(2); if (document.activeElement !== tI) tI.value = tt.toFixed(2);
      const evs = `${ev >= 0 ? '+' : '−'}${Math.abs(ev).toFixed(2)} EV`; txt(K('ev'), evs); txt(K('t'), `${Math.round((5500 + tt*2500)/50)*50} K`);
      txt(chip, `Exposure ${evs}`); chip.style.opacity = hu.toFixed(3);
      const hk = f2(ev, tt, hw, hh, theme);
      if (hk !== hsig && small && hw){ hsig = hk; const L = lut(ev, tt), bins = new Float32Array(128); let hiC = 0, loC = 0;
        for (let i = 0; i < small.length; i += 4){ const r = L[0][0][small[i]], g = L[1][0][small[i + 1]], b = L[2][0][small[i + 2]];
          bins[Math.min(127, (.2126*r + .7152*g + .0722*b)/2 | 0)]++; if (L[0][1][small[i]] === 1 || L[1][1][small[i + 1]] === 1 || L[2][1][small[i + 2]] === 1) hiC++; else if (L[0][1][small[i]] === 2 && L[1][1][small[i + 1]] === 2 && L[2][1][small[i + 2]] === 2) loC++; }
        const n = small.length/4, d = DPR(), HW = Math.round(hw*d), HH = Math.round(hh*d); if (hcv.width !== HW || hcv.height !== HH){ hcv.width = HW; hcv.height = HH; } const x = hcv.getContext('2d'), W = hcv.width, H = hcv.height;
        const sb = bins.map((v, i) => (bins[Math.max(0, i - 1)] + 2*v + bins[Math.min(127, i + 1)])/4), mx = Math.max(...sb.slice(1, 127)) || 1;
        const ink = hex(tok(st, '--ink')); x.clearRect(0, 0, W, H); x.beginPath(); x.moveTo(0, H);
        sb.forEach((v, i) => x.lineTo(i/127*W, H - Math.min(1, v/mx)*(H - 8*d))); x.lineTo(W, H); x.closePath();
        x.globalAlpha = .16; x.fillStyle = ink; x.fill(); x.globalAlpha = .8; x.strokeStyle = ink; x.lineWidth = 1.25*d; x.stroke(); x.globalAlpha = 1;
        const tri = (right, on) => { x.fillStyle = on ? hex(tok(st, '--warning')) : hex(tok(st, '--faint')); x.beginPath(); const y = 6*d, q = 5*d, X = right ? W - 6*d : 6*d;
          x.moveTo(X, y); x.lineTo(X + (right ? -q : q), y - q*.8); x.lineTo(X + (right ? -q : q), y + q*.8); x.fill(); };
        tri(false, loC/n > .001); tri(true, hiC/n > .001);
        txt(K('lo'), `Shadows clipped ${(loC/n*100).toFixed(1)}%`); txt(K('hi'), `Highlights ${(hiC/n*100).toFixed(1)}%`); }
      const k = f2(ev, tt, cl, s.v, theme); if (k === sig) return; sig = k;
      const cov = cover(s.W, s.H, img.width, img.height);
      if (!GLX.run(cv, FS_GRADE, { uCov:cov, uEV:ev, uT:tt, uClip:cl, uHi:HI, uLo:LO }, { uImg:img })){
        const x = cv.getContext('2d'); x.filter = `brightness(${(2**ev).toFixed(3)}) sepia(${clamp(tt*.4).toFixed(3)})`; drawCover(x, img, cov, s.W, s.H); x.filter = 'none'; }
    };
  }});

/* =============================================================== 8. paint to reveal colour */
const FS_PAINT = `uniform sampler2D uImg,uMask;uniform vec4 uCov;
void main(){vec2 s=v*uCov.xy+uCov.zw;vec3 c=texture2D(uImg,s).rgb;float m=smoothstep(.08,.6,texture2D(uMask,v).r);
float g=lum(c);g=mix(g,g*g*(3.-2.*g),.4);gl_FragColor=vec4(mix(vec3(g),c,m),1.);}`;
atom({ id:'fxp-paint', cat:'Photo effects', name:'Paint in colour', block:'hero, before/after story (image)', fam:['D','T'], wide:true, tall:true,
  html:`${CSS}<style>
.fxp-br{position:absolute;left:0;top:0;border-radius:50%;pointer-events:none;z-index:2;box-shadow:0 0 0 1.5px #fff,0 0 0 3px rgba(12,16,22,.35)}
</style><div class="fxp-w"><div class="fxp-fr" tabindex="0" role="img" aria-label="Late summer field in black and white. Drag, or use arrow keys with Space, to paint colour back in."><canvas class="fxp-cv" aria-hidden="true"></canvas><i class="fxp-br"></i><span class="fxp-chip">Drag to paint colour</span></div>
<div class="fxp-bar"><div class="seg" role="group" aria-label="After painting"><div class="ind"></div><button>Heals back</button><button>Stays</button></div><button type="button" class="btn fxp-all">Reveal all</button><span class="fxp-gap"></span><span class="fxp-tx">Keys: arrows move, Space paints</span></div></div>`,
  desc:'A soft brush paints the colour photo through a black-and-white print. Every cell of the mask stores when it was painted, so the heal is a pure function of time: it holds for 1.4 s, then the colour drains back over 2.6 s, and painting again resets the hold. Reveal all opens from the centre outward. Use when: a story or campaign hero invites people to explore, or to show what a restoration or colourisation changed.',
  api:'cell = { a0, ts, tp }   m(t) = a0 · ramp(t − ts) · heal(t − tp − 1.4s)   colour = mix(mono, photo, smoothstep(.08,.6,m))',
  init(st){
    const fr = $(st, '.fxp-fr'), cv = $(fr, 'canvas'), br = $(st, '.fxp-br'), chip = $(st, '.fxp-chip'), s = surface(fr, cv), ph = lazyPhoto('field');
    let keep = false; const seg = mkSeg($(st, '.seg'), i => { const t = now(); if (a0) for (let k = 0; k < a0.length; k++){ if (a0[k] > 0){ a0[k] = str(k, t); ts[k] = t - 1; tp[k] = t; } } keep = i === 1; last = t; });
    const C = 128; let a0 = null, tp = null, ts = null, mask = null, sig = '', last = -9, painted = false;
    const bx = new Track(0, S.snap), by = new Track(0, S.snap), bo = new Track(0, S.base); let spaceDown = false, prev = null;
    const grid = () => { const rows = Math.max(8, Math.round(C*s.ch/s.cw)); if (!mask || mask.h !== rows){ a0 = new Float32Array(C*rows); tp = new Float32Array(C*rows).fill(-99); ts = new Float32Array(C*rows).fill(-99); mask = { w:C, h:rows, data:new Uint8Array(C*rows), ver:0 }; } };
    // per cell: a0 strength, ts when its fade-in started, tp when it was last painted (the hold and heal run from tp)
    const heal = dt => keep ? 1 : 1 - sm((dt - 1.4)/2.6), str = (k, t) => a0[k]*sm((t - ts[k])/.12)*heal(t - tp[k]);
    const dab = (x, y, t = now()) => { grid(); const cs = s.cw/C, rad = Math.min(s.cw, s.ch)*.085;
      for (let j = Math.max(0, Math.floor((y - rad)/cs)); j <= Math.min(mask.h - 1, Math.ceil((y + rad)/cs)); j++)
        for (let i = Math.max(0, Math.floor((x - rad)/cs)); i <= Math.min(C - 1, Math.ceil((x + rad)/cs)); i++){
          const d = Math.hypot((i + .5)*cs - x, (j + .5)*cs - y), f = 1 - sm((d - rad*.62)/(rad*.4)); if (f <= 0) continue;
          const k = j*C + i, cur = str(k, t); if (cur < .02){ a0[k] = f; ts[k] = tp[k] = t; } else { a0[k] = Math.max(f, a0[k]*heal(t - tp[k])); tp[k] = t; } }
      last = t; painted = true; };
    const stroke = (x, y) => { if (prev){ const d = Math.hypot(x - prev[0], y - prev[1]), n = Math.ceil(d/(s.cw/C*1.5)); for (let i = 1; i <= n; i++) dab(lerp(prev[0], x, i/n), lerp(prev[1], y, i/n)); } else dab(x, y); prev = [x, y]; };
    let down = false;
    fr.addEventListener('pointermove', e => { const r = fr.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; bx.jump(x); by.jump(y); bo.set(1); if (down) stroke(x, y); });
    fr.addEventListener('pointerleave', () => { if (!down) bo.set(0); });
    drag(fr, { down:p => { down = true; prev = null; bx.jump(p.x); by.jump(p.y); bo.set(1); stroke(p.x, p.y); }, move:() => {}, up:() => { down = false; prev = null; } });
    fr.addEventListener('focus', () => { if (!bo.target){ bx.jump(s.cw/2); by.jump(s.ch/2); } bo.set(1); });
    fr.addEventListener('blur', () => { bo.set(0); spaceDown = false; });
    fr.addEventListener('keydown', e => { const st2 = Math.max(12, s.cw*.04), d = { ArrowLeft:[-1, 0], ArrowRight:[1, 0], ArrowUp:[0, -1], ArrowDown:[0, 1] }[e.key];
      if (d){ e.preventDefault(); bx.set(clamp(bx.target + d[0]*st2, 0, s.cw)); by.set(clamp(by.target + d[1]*st2, 0, s.ch)); bo.set(1); }
      if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); spaceDown = true; } });
    fr.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') spaceDown = false; });
    $(st, '.fxp-all').onclick = () => { grid(); const t = now(), rows = mask.h; for (let j = 0; j < rows; j++) for (let i = 0; i < C; i++){ const k = j*C + i, d = Math.hypot((i - C/2)/C*s.cw, (j - rows/2)/rows*s.ch)/Math.hypot(s.cw/2, s.ch/2);
      a0[k] = 1; ts[k] = tp[k] = t + (REDUCE ? 0 : d*.7); } last = t + .7; painted = true; };
    return t => {
      seg.render(t); const img = ph.need(s.cw, s.ch); if (!img) return; grid();
      if (spaceDown) dab(bx.at(t), by.at(t), t);
      const o = clamp(bo.at(t)), rad = Math.min(s.cw, s.ch)*.085;
      br.style.width = br.style.height = px(rad*2); br.style.transform = `translate(${px(bx.at(t) - rad)},${px(by.at(t) - rad)})`; br.style.opacity = o.toFixed(3);
      chip.style.opacity = painted ? '0' : '1';
      if (t < last + (keep ? .4 : 4.2) || !mask.ver){ for (let k = 0; k < a0.length; k++) mask.data[k] = Math.round(255*clamp(str(k, t))); mask.ver++; }
      const k = f2(mask.ver, s.v, ph.v); if (k === sig) return; sig = k;
      const cov = cover(s.W, s.H, img.width, img.height);
      if (!GLX.run(cv, FS_PAINT, { uCov:cov }, { uImg:img, uMask:mask })){ const x = cv.getContext('2d'); x.filter = 'grayscale(1)'; drawCover(x, img, cov, s.W, s.H); x.filter = 'none'; }
    };
  }});

/* =============================================================== 9. face-safe Ken Burns */
atom({ id:'fxp-burns', cat:'Photo effects', name:'Face-safe Ken Burns', block:'hero slideshow, story cover (image)', fam:['T','S'], wide:true, tall:true,
  html:`${CSS}<style>
.fxp-ks{position:absolute;left:0;top:0;border:1.5px dashed rgba(255,255,255,.9);border-radius:8px;pointer-events:none;z-index:2}
.fxp-ks span{position:absolute;left:6px;top:4px;font-size:11px;color:#fff}
.fxp-km{position:absolute;right:10px;bottom:10px;width:112px;border-radius:8px;overflow:hidden;background:#0C1016;box-shadow:0 0 0 1px rgba(255,255,255,.25);pointer-events:none;z-index:2}
.fxp-km canvas{display:block;width:100%}
.fxp-km i{position:absolute;left:0;top:0;border:1.5px solid #fff;border-radius:2px}
.fxp-km b{position:absolute;left:0;top:0;border:1px dashed #fff;opacity:.8}
.fxp-kb .fxp-chip{top:auto;bottom:10px}
</style><div class="fxp-w"><div class="fxp-fr fxp-kb" role="region" aria-roledescription="slideshow" aria-label="Photo stories"><canvas class="fxp-cv" aria-hidden="true"></canvas><div class="fxp-ks"><span>Face kept in frame</span></div><div class="fxp-km"><canvas aria-hidden="true"></canvas><b></b><i></i></div><span class="fxp-chip" aria-live="off"></span></div>
<div class="fxp-bar"><button type="button" class="btn fxp-pv" aria-label="Previous photo">Previous</button><button type="button" class="btn fxp-pp" aria-pressed="false">Pause</button><button type="button" class="btn fxp-nx" aria-label="Next photo">Next</button><span class="fxp-tx fxp-ct"></span><span class="fxp-gap"></span><button type="button" class="btn fxp-sa" aria-pressed="false">Show safe area</button></div></div>`,
  desc:'Each photo carries a focal box (the face, or the subject). The planner works out the largest zoom that still contains the box at this frame’s aspect ratio, then pans and zooms between two valid framings over seven seconds, clamping every frame so the face is never cut. If the frame is too wide even at full size, it zooms out over a blurred extension of the same photo instead of cropping the head. Slides cross-fade for 1.2 s while still moving. Use when: a hero slideshow or story cover animates portraits that must survive phone, tablet and desktop crops.',
  api:'zMax = min(1.16, cropW/boxW, cropH/boxH)   centre = clamp(lerp(a0,a1,ease(u)), box ∩ image)   Pause meets WCAG 2.2.2',
  init(st){
    const fr = $(st, '.fxp-fr'), cv = $(fr, 'canvas'), safe = $(st, '.fxp-ks'), map = $(st, '.fxp-km'), mcv = $(map, 'canvas'), mcrop = $(map, 'i'), mbox = $(map, 'b'), chip = $(st, '.fxp-chip'), ct = $(st, '.fxp-ct'), s = surface(fr, cv);
    const SL = [{ n:'portrait', a:.8, box:[.33, .24, .67, .58], alt:'Portrait, window light' }, { n:'studio', a:1.5, box:[.24, .36, .76, .66], alt:'Still life, three pears' }, { n:'harbor', a:1.5, box:[.08, .5, .92, .84], alt:'Harbor, low tide' }];
    SL.forEach(x => { x.img = null; x.bg = null; });
    const D = 7, F = 1.2, N = SL.length; let ph0 = 0, tp0 = null, onScreen = false, ksig = '', playing = true, cut = null, showS = false, mapFor = -1;
    const sa = new Track(0, S.base), pp = $(st, '.fxp-pp'), sab = $(st, '.fxp-sa');
    const head = t => playing && onScreen ? ph0 + (t - tp0) : ph0;
    // the slideshow only advances while on screen: leaving freezes the playhead, returning resumes it
    new IntersectionObserver(es => { const v = es.some(e => e.isIntersecting), t = now(); if (v === onScreen) return; ph0 = head(t); tp0 = t; onScreen = v; }, { threshold:.2 }).observe(st);
    const jumpTo = (k, t = now()) => { const old = head(t); cut = { ph:old, t }; ph0 = k*D; tp0 = t; };
    $(st, '.fxp-nx').onclick = () => { const t = now(); jumpTo(Math.floor(head(t)/D) + 1, t); };
    $(st, '.fxp-pv').onclick = () => { const t = now(); jumpTo(Math.floor(head(t)/D) - 1 + N, t); };
    pp.onclick = () => { const t = now(); ph0 = head(t); tp0 = t; playing = !playing; pp.textContent = playing ? 'Pause' : 'Play'; pp.setAttribute('aria-pressed', !playing); };
    sab.onclick = () => { showS = !showS; toggle(sab, showS); sa.set(showS ? 1 : 0); };
    // framing for slide k at motion progress u ∈ [0,1]
    const frame = (k, u) => { const sl = SL[((k % N) + N) % N], af = s.cw/s.ch, ai = sl.a; let cw = 1, ch = 1; if (af > ai) ch = ai/af; else cw = af/ai;
      const m = .035, b = [clamp(sl.box[0] - m), clamp(sl.box[1] - m), clamp(sl.box[2] + m), clamp(sl.box[3] + m)], bw = b[2] - b[0], bh = b[3] - b[1];
      const zfit = Math.min(cw/bw, ch/bh), zmax = Math.min(1.16, zfit), zmin = zfit < 1 ? zfit*.92 : 1, e = REDUCE ? 1 : sm(u);
      const z = REDUCE ? zmin : (k % 2 ? lerp(zmax, zmin, e) : lerp(zmin, zmax, e)), W = cw/z, H = ch/z;
      const ax = k % 2 ? lerp(.75, .3, e) : lerp(.3, .7, e), ay = k % 2 ? lerp(.35, .6, e) : lerp(.65, .4, e);
      const axis = (size, lo, hi, a) => { if (size >= 1) return .5; const L = Math.max(size/2, hi - size/2), Hh = Math.min(1 - size/2, lo + size/2); return REDUCE ? (L + Hh)/2 : lerp(L, Hh, a); };
      return { sl, W, H, cx:axis(W, b[0], b[2], ax), cy:axis(H, b[1], b[3], ay) }; };
    const drawSlide = (x, k, ph, alpha) => { const f = frame(k, clamp((ph - (k*D - F))/(D + F))), sl = f.sl; if (!sl.img) return f; const Wp = s.W, Hp = s.H;
      x.globalAlpha = alpha; if (sl.bg){ const c = cover(Wp, Hp, sl.bg.width, sl.bg.height); drawCover(x, sl.bg, c, Wp, Hp); x.fillStyle = 'rgba(12,16,22,.06)'; x.fillRect(0, 0, Wp, Hp); }
      const dw = Wp/f.W, dh = Hp/f.H; x.drawImage(sl.img, -(f.cx - f.W/2)*dw, -(f.cy - f.H/2)*dh, dw, dh); x.globalAlpha = 1; return f; };
    const scene = (x, ph, am = 1) => { const k = Math.floor(ph/D), local = ph - k*D; let f = drawSlide(x, k, ph, am), top = k;
      if (local > D - F){ const a = sm((local - (D - F))/F); drawSlide(x, k + 1, ph, a*am); if (a > .5){ f = frame(k + 1, clamp((ph - ((k + 1)*D - F))/(D + F))); top = k + 1; } } return [f, top]; };
    return t => {
      for (const sl of SL) if (!sl.img){ const W = Math.min(1600, Math.ceil(Math.max(s.cw, s.ch*sl.a)*DPR()/320)*320); const c = photo(sl.n, W, Math.round(W/sl.a)); if (!c) return; sl.img = c;
        const b = document.createElement('canvas'); b.width = 48; b.height = Math.round(48/sl.a); const bx = b.getContext('2d'); bx.filter = 'blur(4px)'; bx.drawImage(c, -6, -6, 60, b.height + 12); sl.bg = b; }
      const ph = head(t), o0 = clamp(sa.at(t)), ks = f2(ph, s.v, cut ? t : 0, o0, mapFor); if (ks === ksig) return; ksig = ks;   // nothing moves while paused
      const x = cv.getContext('2d'); x.globalAlpha = 1; x.fillStyle = '#0C1016'; x.fillRect(0, 0, s.W, s.H);
      let [f, top] = scene(x, ph);
      if (cut){ const a = 1 - sm((t - cut.t)/(REDUCE ? .2 : .45)); if (a <= 0) cut = null; else { const tmp = scene(x, cut.ph + (playing ? t - cut.t : 0), a); if (a > .5){ f = tmp[0]; top = tmp[1]; } } }
      const k = ((top % N) + N) % N, sl = SL[k]; txt(chip, sl.alt); txt(ct, `${k + 1} / ${N}`);
      const o = clamp(sa.at(t)), bx0 = (sl.box[0] - (f.cx - f.W/2))/f.W*s.cw, by0 = (sl.box[1] - (f.cy - f.H/2))/f.H*s.ch, bw = (sl.box[2] - sl.box[0])/f.W*s.cw, bh = (sl.box[3] - sl.box[1])/f.H*s.ch;
      safe.style.transform = `translate(${px(bx0)},${px(by0)})`; safe.style.width = px(bw); safe.style.height = px(bh);
      [safe, map].forEach(el => { el.style.opacity = o.toFixed(3); el.style.visibility = o < .01 ? 'hidden' : 'visible'; });
      if (o > .01){ if (mapFor !== k && sl.img){ mapFor = k; mcv.width = 224; mcv.height = Math.round(224/sl.a); mcv.getContext('2d').drawImage(sl.img, 0, 0, mcv.width, mcv.height); }
        const mw = 112, mh = 112/sl.a; mcrop.style.transform = `translate(${px((f.cx - f.W/2)*mw)},${px((f.cy - f.H/2)*mh)})`; mcrop.style.width = px(f.W*mw); mcrop.style.height = px(f.H*mh);
        mbox.style.transform = `translate(${px(sl.box[0]*mw)},${px(sl.box[1]*mh)})`; mbox.style.width = px((sl.box[2] - sl.box[0])*mw); mbox.style.height = px((sl.box[3] - sl.box[1])*mh); }
    };
  }});

/* =============================================================== 10. flicker compare */
const FS_FLICK = `uniform sampler2D uImg;uniform vec4 uCov;uniform float uA,uDiff;uniform vec3 uDk,uHi;
vec3 edit(vec3 c,vec2 uv){vec3 l=pow(c,vec3(2.2))*vec3(1.12,1.,.84)*1.22;l=l/(1.+l*.22)+.006;vec2 d=uv-.5;l*=1.-.42*dot(d,d)*1.6;return pow(clamp(l,0.,1.),vec3(1./2.2));}
void main(){vec2 s=v*uCov.xy+uCov.zw;vec3 a=texture2D(uImg,s).rgb,b=edit(a,s);
vec3 o=pow(mix(pow(a,vec3(2.2)),pow(b,vec3(2.2)),uA),vec3(1./2.2));
vec3 df=abs(b-a)*4.;float dl=clamp(max(df.r,max(df.g,df.b)),0.,1.);
gl_FragColor=vec4(mix(o,mix(uDk,uHi,dl),uDiff),1.);}`;
atom({ id:'fxp-flick', cat:'Photo effects', name:'Fade flicker compare', block:'image editor, review, versions (compare)', fam:['S','T'], wide:true, tall:true,
  html:`${CSS}<style>.fxp-fl{position:absolute;left:10px;top:10px;height:26px;z-index:2;pointer-events:none}.fxp-fl .fxp-chip{left:0;top:0}</style>
<div class="fxp-w"><div class="fxp-fr" tabindex="0" role="img" aria-label="Downtown, east side. Hold Space or press on the photo to see the other version."><canvas class="fxp-cv" aria-hidden="true"></canvas><div class="fxp-fl" aria-hidden="true"><span class="fxp-chip">Before</span><span class="fxp-chip">After</span></div></div>
<div class="fxp-bar"><div class="seg" role="group" aria-label="Version"><div class="ind"></div><button>Before</button><button>After</button></div><button type="button" class="btn fxp-fk" aria-pressed="false">Flicker</button><button type="button" class="btn fxp-df" aria-pressed="false">Difference</button><span class="fxp-gap"></span><span class="fxp-tx" aria-live="polite">Hold Space on the photo to peek</span></div></div>`,
  desc:'Blink comparison without the flash: versions dissolve in linear light over about 200 ms, so brightness never dips mid-fade and the eye still catches what moved. Hold Space or press on the photo to peek at the other version; Flicker alternates every 1.2 s until stopped; Difference paints only what changed. The version label swaps (exit, then enter) in step. Use when: reviewers approve an edit, a re-export or a new version and the change is subtle.',
  api:'a.set(version, S.base)   out = (mix(before^2.2, after^2.2, a))^(1/2.2)   flicker: a.set(⌊(t−t0)/1.2⌋ mod 2)',
  init(st){
    const fr = $(st, '.fxp-fr'), cv = $(fr, 'canvas'), labs = $$(st, '.fxp-fl .fxp-chip'), out = $(st, '.fxp-tx'), fk = $(st, '.fxp-fk'), dfb = $(st, '.fxp-df'), s = surface(fr, cv), ph = lazyPhoto('city', 1.5, .35);
    const A = new Track(1, S.base), Dd = new Track(0, S.base), sw = new Swap(1); let base = 1, peek = false, flick = false, tf = 0, lastK = -1, sig = '', theme = -1, DK = [0, 0, 0], HI = [1, 1, 1];
    const show = v => { A.set(v); sw.to(v); };
    const seg = mkSeg($(st, '.seg'), i => { base = i; stopFlick(); show(i); }, 1);
    const stopFlick = () => { if (!flick) return; flick = false; toggle(fk, false); txt(out, 'Flicker stopped'); };
    fk.onclick = () => { flick = !flick; toggle(fk, flick); tf = now(); lastK = -1; txt(out, flick ? 'Flickering every 1.2 s' : 'Flicker stopped'); if (!flick) show(base); };
    dfb.onclick = () => { const on = dfb.getAttribute('aria-pressed') !== 'true'; toggle(dfb, on); Dd.set(on ? 1 : 0); };
    const hold = on => { if (flick || peek === on) return; peek = on; show(on ? 1 - base : base); };
    fr.addEventListener('keydown', e => { if (e.key === ' '){ e.preventDefault(); hold(true); } });
    fr.addEventListener('keyup', e => { if (e.key === ' ') hold(false); });
    fr.addEventListener('pointerdown', () => hold(true)); fr.addEventListener('pointerup', () => hold(false)); fr.addEventListener('pointercancel', () => hold(false)); fr.addEventListener('blur', () => hold(false));
    return t => {
      seg.render(t); const img = ph.need(s.cw, s.ch); if (!img) return;
      if (theme !== themeV){ theme = themeV; DK = [12/255, 16/255, 22/255]; HI = tok(st, '--warning'); sig = ''; }
      if (flick){ const k = Math.floor((t - tf)/1.2) % 2; if (k !== lastK){ lastK = k; show(k ? 1 - base : base); } }
      labs.forEach((el, i) => sw.apply(el, i, t, 3));
      const a = clamp(A.at(t)), d = clamp(Dd.at(t)), k = f2(a, d, s.v, theme); if (k === sig) return; sig = k;
      const cov = cover(s.W, s.H, img.width, img.height);
      if (!GLX.run(cv, FS_FLICK, { uCov:cov, uA:a, uDiff:d, uDk:DK, uHi:HI }, { uImg:img })){ const x = cv.getContext('2d'); drawCover(x, img, cov, s.W, s.H); x.globalAlpha = a*.35; x.fillStyle = 'rgb(255,170,90)'; x.fillRect(0, 0, s.W, s.H); x.globalAlpha = 1; }
    };
  }});

/* =============================================================== 11. frosted caption */
const FS_FROST = `uniform sampler2D uImg,uMask;uniform vec4 uCov,uBox;uniform float uP,uR,uK,uAsp;uniform vec3 uTone;uniform vec2 uPx;
void main(){vec2 s=v*uCov.xy+uCov.zw;vec3 c=texture2D(uImg,s).rgb;
vec2 e=max(vec2(0.),max(uBox.xy-v,v-uBox.zw))*vec2(uAsp,1.);float fall=.38*(1.-clamp(length(e)/1.1,0.,1.));
float f=max(texture2D(uMask,v).r,fall);float th=-.3+.72*uP;float fr=smoothstep(th,th+.25,f);
vec3 o=c;if(fr>.002){vec3 acc=vec3(0.);float j=hash(gl_FragCoord.xy)*6.2832;
for(int i=0;i<28;i++){float fi=float(i);float r=sqrt((fi+.5)/28.)*uR;float a=fi*2.39996+j;acc+=texture2D(uImg,s+vec2(cos(a),sin(a))*r*uPx).rgb;}
vec3 b=mix(acc/28.,uTone,uK*smoothstep(.3,.6,f));o=mix(c,b,fr);}
gl_FragColor=vec4(o,1.);}`;
atom({ id:'fxp-frost', cat:'Photo effects', name:'Frost behind captions', block:'hero, card, story (caption on photo)', fam:['S','M'], wide:true, tall:true,
  html:`${CSS}<style>
.fxp-fc{position:absolute;left:20px;bottom:20px;max-width:min(440px,calc(100% - 40px));display:flex;flex-direction:column;gap:6px;z-index:2;pointer-events:none}
.fxp-fc>*{align-self:flex-start;margin:0}
.fxp-fk1{font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
.fxp-fh{font-size:28px;line-height:1.1;letter-spacing:-.025em;font-weight:600;text-wrap:balance}
.fxp-fb{font-size:14px;line-height:1.45}
@container (max-width:560px){.fxp-fc{left:14px;bottom:14px;max-width:calc(100% - 28px)}.fxp-fh{font-size:22px}.fxp-fb{font-size:13px}}
.fxp-cr{display:inline-flex;align-items:center;gap:6px}
</style><div class="fxp-w"><div class="fxp-fr"><canvas class="fxp-cv" aria-hidden="true"></canvas><div class="fxp-fc"><span class="fxp-fk1">Harbor, low tide</span><span class="fxp-fh">The boats come in at six</span><span class="fxp-fb">Crews unload before the light goes. Photographs by Theo Marsh.</span></div></div>
<div class="fxp-bar"><div class="seg" role="group" aria-label="Caption colour"><div class="ind"></div><button>Light text</button><button>Dark text</button></div><label class="fxp-rg">Frost <input id="fxp-frost-r" type="range" min="4" max="28" value="16"></label><label class="fxp-rg">Headline <input id="fxp-frost-cap" type="text" value="The boats come in at six" maxlength="60" style="width:180px;font:13px var(--sans);color:var(--ink);background:var(--card);border:1.5px solid var(--muted);border-radius:8px;padding:4px 8px"></label><button type="button" class="btn fxp-rp">Replay</button><span class="fxp-gap"></span><span class="fxp-tx fxp-cr" aria-live="polite"></span></div></div>`,
  desc:'The whole photo starts frosted, then clears in a wave that runs from the far corners toward the caption, leaving frost hugging only the actual lines of text (measured from the live DOM, so it follows wrapping and edits). The frost is blurred, grain-dithered, and toned just enough to reach 6:1 contrast under its worst patch, and the readout shows the ratio with and without it. Use when: captions or headlines sit on busy photos and must pass contrast without a heavy box or gradient.',
  api:'field = max(blur(lineRects), .4·falloff(box))   frost = smoothstep(th, th+.25, field), th = −.3 + .72·p   tone k solves contrast ≥ 6:1',
  init(st){
    const fr = $(st, '.fxp-fr'), cv = $(fr, 'canvas'), cap = $(st, '.fxp-fc'), head = $(st, '.fxp-fh'), out = $(st, '.fxp-tx'), rI = $(st, '#fxp-frost-r'), cI = $(st, '#fxp-frost-cap'), s = surface(fr, cv), ph = lazyPhoto('harbor');
    let dark = false, mask = null, box = [0, 0, 1, 1], need = true, sig = '', small = null, sv = -1, K = .5, tone = [12/255, 16/255, 22/255], rep = ''; const P = new Tw(0);
    const seg = mkSeg($(st, '.seg'), i => { dark = i === 1; cap.style.color = dark ? '#0C1016' : '#FFFFFF'; need = true; });
    cap.style.color = '#FFFFFF';
    new ResizeObserver(() => need = true).observe(cap); new ResizeObserver(() => need = true).observe(fr);
    cI.oninput = () => { head.textContent = cI.value.trim() || 'Untitled'; need = true; };
    $(st, '.fxp-rp').onclick = () => { P.jump(0).to(1, 1.8); }; onView(st, () => P.jump(0).to(1, 1.8, now() + .4));
    const rebuild = () => {
      need = false; const fb = fr.getBoundingClientRect(); if (!fb.width) return; const w = Math.max(16, Math.round(fb.width/3)), h = Math.max(16, Math.round(fb.height/3));
      const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.fillStyle = '#fff'; const rects = []; const rg = document.createRange();
      $$(cap, ':scope>*').forEach(el => { rg.selectNodeContents(el); for (const r of rg.getClientRects()){ const q = [(r.left - fb.left - 8)/3, (r.top - fb.top - 4)/3, (r.width + 16)/3, (r.height + 8)/3]; rects.push(q); x.beginPath(); x.roundRect ? x.roundRect(...q, 3) : x.rect(...q); x.fill(); } });
      const d = x.getImageData(0, 0, w, h).data; let a = new Float32Array(w*h); for (let i = 0; i < w*h; i++) a[i] = d[i*4]/255;
      a = boxBlur(boxBlur(a, w, h, 3), w, h, 3); const m = new Uint8Array(w*h); for (let i = 0; i < w*h; i++) m[i] = Math.round(clamp(a[i]*1.6)*255);
      mask = { w, h, data:m, ver:(mask ? mask.ver : 0) + 1 };
      const cb = cap.getBoundingClientRect(); box = [(cb.left - fb.left)/fb.width, (cb.top - fb.top)/fb.height, (cb.right - fb.left)/fb.width, (cb.bottom - fb.top)/fb.height];
      // contrast: sample the photo under the text rects (as the frost will average it)
      if (!small) return; let n = 0, sr = 0, sg = 0, sb = 0, ls = [], hiL = 0;
      for (const [rx, ry, rw, rh] of rects) for (let yy = ry; yy < ry + rh; yy += 1) for (let xx = rx; xx < rx + rw; xx += 1){ const X = Math.round(xx/w*(small.w - 1)), Y = Math.round(yy/h*(small.h - 1)); if (X < 0 || Y < 0 || X >= small.w || Y >= small.h) continue;
        const i = (Y*small.w + X)*4, col = [small.d[i]/255, small.d[i + 1]/255, small.d[i + 2]/255]; sr += col[0]; sg += col[1]; sb += col[2]; n++; const l = relL(col); ls.push(l); hiL = dark ? Math.min(hiL || 1, l) : Math.max(hiL, l); }
      if (!n) return; const mean = [sr/n, sg/n, sb/n], ml = ls.reduce((p, q) => p + q, 0)/n, sd = Math.sqrt(ls.reduce((p, q) => p + (q - ml)**2, 0)/n);
      const textL = dark ? relL([12/255, 16/255, 22/255]) : 1; tone = dark ? [1, 1, 1] : [12/255, 16/255, 22/255];
      const bgAt = k => clamp(relL(mean.map((v, i) => lerp(v, tone[i], k))) + (dark ? -1 : 1)*sd*.8*(1 - k));
      let lo = 0, hi = 1; for (let i = 0; i < 18; i++){ const mid = (lo + hi)/2; if (ratio(textL, bgAt(mid)) >= 6) hi = mid; else lo = mid; } K = hi;
      const before = ratio(textL, hiL), after = ratio(textL, bgAt(K));
      rep = `${after.toFixed(1)}:1 behind text · ${before.toFixed(1)}:1 without frost`; sig = ''; };
    return t => {
      seg.render(t); const img = ph.need(s.cw, s.ch); if (!img) return;
      if (sv !== s.v || !small){ sv = s.v; const w = 240, h = Math.max(8, Math.round(240*s.ch/s.cw)), sc = scaled(img, w, h); sc.x.clearRect(0, 0, w, h); drawCover(sc.x, img, cover(w, h, img.width, img.height), w, h); small = { w, h, d:sc.d() }; need = true; }
      if (need) rebuild(); if (!mask) return;
      const p = P.at(t); txt(out, (p > .98 ? '' : 'Clearing… ') + rep);
      const k = f2(p, rI.value, mask.ver, s.v, K, dark); if (k === sig) return; sig = k;
      const cov = cover(s.W, s.H, img.width, img.height);
      if (!GLX.run(cv, FS_FROST, { uCov:cov, uBox:box, uP:p, uR:+rI.value*img.width/1600*1.6, uK:K, uAsp:s.cw/s.ch, uTone:tone, uPx:[1/img.width, 1/img.height] }, { uImg:img, uMask:mask })){
        const x = cv.getContext('2d'); drawCover(x, img, cov, s.W, s.H); x.save(); x.beginPath(); x.rect(box[0]*s.W - 12, box[1]*s.H - 8, (box[2] - box[0])*s.W + 24, (box[3] - box[1])*s.H + 16); x.clip();
        x.filter = `blur(${rI.value/2}px)`; drawCover(x, img, cov, s.W, s.H); x.filter = 'none'; x.globalAlpha = K; x.fillStyle = hex(tone); x.fillRect(0, 0, s.W, s.H); x.restore(); x.globalAlpha = 1; }
    };
  }});

/* =============================================================== 12. theme from photo (original) */
const FS_PAL = `uniform sampler2D uImg,uImg2;uniform vec4 uCov,uCov2;uniform vec3 uSel;uniform float uA,uMix;
vec3 okl(vec3 c){vec3 l=pow(max(c,0.),vec3(2.2));float L=pow(.4122*l.r+.5363*l.g+.0514*l.b,1./3.),M=pow(.2119*l.r+.6807*l.g+.1074*l.b,1./3.),S=pow(.0883*l.r+.2817*l.g+.63*l.b,1./3.);
return vec3(.2105*L+.7936*M-.0041*S,1.978*L-2.4286*M+.4506*S,.0259*L+.7828*M-.8087*S);}
void main(){vec3 c=mix(texture2D(uImg2,v*uCov2.xy+uCov2.zw).rgb,texture2D(uImg,v*uCov.xy+uCov.zw).rgb,uMix);
vec3 d=(okl(c)-uSel)*vec3(.7,2.4,2.4);float w=exp(-dot(d,d)/.03);
vec3 dim=vec3(lum(c))*.62+.06;gl_FragColor=vec4(mix(c,dim,uA*(1.-w)),1.);}`;
const toLin = v => v <= .04045 ? v/12.92 : ((v + .055)/1.055)**2.4;
const oklab = c => { const [r, g, b] = c.map(toLin), l = Math.cbrt(.4122*r + .5363*g + .0514*b), m = Math.cbrt(.2119*r + .6807*g + .1074*b), s = Math.cbrt(.0883*r + .2817*g + .63*b);
  return [.2105*l + .7936*m - .0041*s, 1.978*l - 2.4286*m + .4506*s, .0259*l + .7828*m - .8087*s]; };
function palette(img, k = 5){
  const w = 64, h = Math.round(64*img.height/img.width), d = scaled(img, w, h).d(), px2 = [];
  for (let i = 0; i < d.length; i += 4){ const c = [d[i]/255, d[i + 1]/255, d[i + 2]/255]; px2.push({ c, o:oklab(c) }); }
  const dist = (a, b) => (a[0] - b[0])**2*.5 + (a[1] - b[1])**2*2 + (a[2] - b[2])**2*2;
  const mean = px2.reduce((s, p) => s.map((v, i) => v + p.o[i]/px2.length), [0, 0, 0]), cs = [];
  let far = px2[0]; for (const p of px2) if (dist(p.o, mean) > dist(far.o, mean)) far = p; cs.push(far.o.slice());
  while (cs.length < k){ let best = px2[0], bd = -1; for (const p of px2){ const dd = Math.min(...cs.map(c => dist(p.o, c))); if (dd > bd){ bd = dd; best = p; } } cs.push(best.o.slice()); }
  let as = new Array(px2.length).fill(0);
  for (let it = 0; it < 12; it++){ as = px2.map(p => { let bi = 0, bd = 1e9; cs.forEach((c, i) => { const dd = dist(p.o, c); if (dd < bd){ bd = dd; bi = i; } }); return bi; });
    cs.forEach((c, i) => { let n = 0, s = [0, 0, 0]; px2.forEach((p, j) => { if (as[j] === i){ n++; s = s.map((v, q) => v + p.o[q]); } }); if (n) cs[i] = s.map(v => v/n); }); }
  return cs.map((o, i) => { let n = 0, s = [0, 0, 0]; px2.forEach((p, j) => { if (as[j] === i){ n++; s = s.map((v, q) => v + p.c[q]); } }); return { rgb:n ? s.map(v => v/n) : [0, 0, 0], ok:o, share:n/px2.length }; })
    .filter(x => x.share > .01).sort((a, b) => b.share - a.share);
}
atom({ id:'fxp-palette', cat:'Photo effects', name:'Theme from photo', block:'site builder, theme settings (cover image)', fam:['M','S'], wide:true, tall:true,
  html:`${CSS}<style>
.fxp-pl{flex:1 1 auto;min-height:0;display:flex;gap:16px}
.fxp-pc{flex:none;width:270px;display:flex;flex-direction:column;gap:12px;min-height:0}
.fxp-sw{display:flex;flex-direction:column;gap:4px}
.fxp-sw button{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:10px;padding:5px 8px 5px 5px;border:1px solid transparent;background:none;border-radius:9px;cursor:pointer;text-align:left;font-size:13px;color:var(--ink)}
.fxp-sw button[aria-checked="true"]{border-color:var(--line);background:var(--card)}
.fxp-sw i{width:28px;height:28px;border-radius:7px;box-shadow:inset 0 0 0 1px rgba(127,127,127,.25)}
.fxp-sw code{font:12px var(--mono);color:var(--muted)}
.fxp-sw span{font-variant-numeric:tabular-nums;color:var(--muted);font-size:12px}
.fxp-pvw{border:0;border-radius:12px;background:var(--card);padding:14px;display:flex;flex-direction:column;gap:8px}
.fxp-pvw b{font-size:16px;letter-spacing:-.01em}
.fxp-pvw p{margin:0;color:var(--muted);font-size:13px;line-height:1.45}
.fxp-cta{align-self:flex-start;border:0;border-radius:9px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer}
@container (max-width:720px){.fxp-pl{flex-direction:column;gap:10px}.fxp-pc{width:auto;flex-direction:column;gap:10px}.fxp-sw{flex-direction:row;gap:6px}.fxp-sw button{grid-template-columns:1fr;justify-items:center;padding:4px;gap:3px;flex:1;min-width:0}.fxp-sw code{display:none}.fxp-sw i{width:100%;height:22px}.fxp-pvw{padding:10px 12px;gap:6px}.fxp-pvw p{display:none}}
</style><div class="fxp-w"><div class="fxp-pl"><div class="fxp-fr" role="img"><canvas class="fxp-cv" aria-hidden="true"></canvas><span class="fxp-chip"></span></div>
<div class="fxp-pc"><div class="fxp-sw" role="radiogroup" aria-label="Colours in this photo"></div><div class="fxp-pvw"><b class="fxp-ph"></b><p>Guided walks every Saturday, April to October. Small groups, early starts.</p><button type="button" class="fxp-cta">Book a walk</button><span class="fxp-tx fxp-cc"></span></div></div></div>
<div class="fxp-bar"><div class="seg" role="group" aria-label="Cover photo"><div class="ind"></div><button>Canyon</button><button>Coast</button><button>Meadow</button></div><span class="fxp-gap"></span><span class="fxp-tx">Hover a colour to find it, Enter to use it</span></div></div>`,
  desc:'Original: the cover photo proposes the site’s accent. Five colours are clustered in OKLab and listed by share. Hovering or arrowing to one spotlights where it lives in the photo (everything else dims to grey), and choosing it morphs the preview button to that colour, with text flipped to whichever of white or ink passes contrast. Changing the cover cross-fades photo and palette together. Use when: a site builder or profile lets people pick theme colours that actually belong to their imagery.',
  api:'palette = kmeans(oklab(px), 5)   spot = mix(px, grey, a·(1 − e^(−|Δoklab|²/σ²)))   accent.set(swatch, S.base)',
  init(st){
    const fr = $(st, '.fxp-fr'), cv = $(fr, 'canvas'), chip = $(st, '.fxp-chip'), swb = $(st, '.fxp-sw'), cta = $(st, '.fxp-cta'), cc = $(st, '.fxp-cc'), title = $(st, '.fxp-ph'), s = surface(fr, cv);
    const SC = [['canyon', 'Canyon trail days'], ['coast', 'Coast road walks'], ['meadow', 'High meadow mornings']], photos = SC.map(([n]) => lazyPhoto(n)), pals = [null, null, null];
    let cur = 0, prevScene = 0, sel = 0, hover = -1, applied = null, from = null, sig = '', btns = []; const A = new Track(0, S.soft), MX = new Track(1, S.base), AC = new Track(1, S.base), sw = new Swap(0);
    const textOn = c => { const L = relL(c), w = ratio(1, L), k = ratio(relL([12/255, 16/255, 22/255]), L); return w >= k ? ['#FFFFFF', w] : ['#0C1016', k]; };
    const build = () => { const P = pals[cur]; swb.innerHTML = ''; btns = P.map((p, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', i === sel); b.tabIndex = i === sel ? 0 : -1;
        b.innerHTML = `<i style="background:${hex(p.rgb)}"></i><code>${hex(p.rgb).toUpperCase()}</code><span>${Math.round(p.share*100)}%</span>`; b.setAttribute('aria-label', `${hex(p.rgb).toUpperCase()}, ${Math.round(p.share*100)} percent of the photo`);
        b.onpointerenter = () => { hover = i; A.set(1); }; b.onpointerleave = () => { hover = -1; if (!swb.contains(document.activeElement)) A.set(0); };
        b.onfocus = () => { hover = i; A.set(1); }; b.onblur = () => setTimeout(() => { if (!swb.contains(document.activeElement)){ hover = -1; A.set(0); } }, 0);
        b.onclick = () => choose(i); swb.appendChild(b); return b; }); };
    const choose = i => { sel = i; btns.forEach((b, j) => { b.setAttribute('aria-checked', j === i); b.tabIndex = j === i ? 0 : -1; }); const c = pals[cur][i].rgb; from = applied ? lerpC(from, applied, clamp(AC.at())) : c; applied = c; AC.jump(0).set(1); };
    const lerpC = (a, b, p) => a.map((v, i) => lerp(v, b[i], p));
    swb.addEventListener('keydown', e => { const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault();
      const i = (btns.indexOf(document.activeElement) + d + btns.length) % btns.length; btns.forEach((b, j) => b.tabIndex = j === i ? 0 : -1); btns[i].focus(); choose(i); });
    cta.onclick = () => { cta.textContent = 'Walk booked for Saturday'; };
    let pend = false;
    const seg = mkSeg($(st, '.seg'), i => { if (i === cur) return; prevScene = cur; cur = i; MX.jump(0).set(1); sw.to(i); sel = 0; hover = -1; A.set(0); pend = true; });
    return t => {
      seg.render(t); const img = photos[cur].need(s.cw, s.ch); if (!img) return; const img2 = photos[prevScene].need(s.cw, s.ch) || img;
      if (!pals[cur]){ pals[cur] = palette(img); if (!applied){ build(); choose(0); AC.jump(1); } }
      if (pend && t >= sw.t + EXIT){ pend = false; build(); choose(0); }
      const P = pals[cur], i = hover >= 0 ? hover : sel, a = clamp(A.at(t)), m = clamp(MX.at(t)), ac = clamp(AC.at(t));
      sw.apply(swb, pend ? prevScene : cur, t, 4); txt(title, SC[cur][1]); att(fr, 'aria-label', PK() ? PK().CAPTIONS[SC[cur][0]] : SC[cur][0]);
      const col = lerpC(from || applied, applied, ac), [tc, cr] = textOn(applied); cta.style.background = hex(col); cta.style.color = tc;
      txt(cc, `Button text ${cr.toFixed(1)}:1 · ${cr >= 4.5 ? 'passes AA' : 'large text only'}`);
      txt(chip, hover >= 0 ? `${hex(P[i].rgb).toUpperCase()} · ${Math.round(P[i].share*100)}% of the photo` : PK() ? PK().CAPTIONS[SC[cur][0]] : '');
      const k = f2(i, a, m, s.v, cur); if (k === sig) return; sig = k;
      const cov = cover(s.W, s.H, img.width, img.height), cov2 = cover(s.W, s.H, img2.width, img2.height);
      if (!GLX.run(cv, FS_PAL, { uCov:cov, uCov2:cov2, uSel:P[i].ok, uA:a, uMix:m }, { uImg:img, uImg2:img2 })){ const x = cv.getContext('2d'); x.globalAlpha = 1; drawCover(x, img2, cov2, s.W, s.H); x.globalAlpha = m; drawCover(x, img, cov, s.W, s.H); x.globalAlpha = 1; }
    };
  }});
})();

