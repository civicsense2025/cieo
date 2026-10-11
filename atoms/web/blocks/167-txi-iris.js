

/* ---------- Image transitions: twelve photo-to-photo transitions on one shared kit (lane tx-images, prefix txi-) ----------
   Every atom shares: prev/next buttons, Arrow/Home/End keys, swipe that drives the transition 1:1 and settles from release
   velocity, interruption from the current state (reverse or retarget mid-flight), and a Scrub slider that sets progress
   directly, independent of clock speed. Transitions are a stack of reveal layers (or a pair / a strip for three atoms),
   each layer a pure function of its own spring progress and the progress of the layer above it. */
(() => {
const DARK = '#0C1016', TXS = { w:6.2 }, TXL = { w:4.4 };
const ss = (a, b, x) => { const k = clamp((x - a)/(b - a)); return k*k*(3 - 2*k); };
const CL = '<path d="m15 6-6 6 6 6"/>', CR = '<path d="m9 6 6 6-6 6"/>';
const SUN = tod => [.68 - .1*tod, .18 + .3*tod];
const HZ = { ridge:.6, lake:.6, dunes:.6, city:.78, coast:.6, forest:.62, field:.6, canyon:.58, harbor:.6, meadow:.62, studio:.62, portrait:.74 };
const SUBJ = { studio:[.52,.5], portrait:[.5,.4], harbor:[.52,.68], city:[.55,.5] };
const focusOf = it => SUBJ[it.name] || SUN(it.tod || 0);
const capOf = it => it.cap || (globalThis.PhotoKit && PhotoKit.CAPTIONS[it.name]) || it.name;
const pics = (...a) => a.map(x => typeof x === 'string' ? { name:x, tod:0 } : x);
let uid = 0;

if (!document.getElementById('txi-css')){ const s = document.createElement('style'); s.id = 'txi-css'; s.textContent = `
.txi-k{position:absolute;inset:0;display:flex;flex-direction:column;gap:10px;padding:12px;container-type:inline-size}
.txi-f{position:relative;flex:1;min-height:0;border-radius:12px;overflow:hidden;background:${DARK};touch-action:pan-y;cursor:grab;isolation:isolate}
.txi-f.txi-bare{background:none;border-radius:0;cursor:default}
.txi-cv{position:absolute;inset:0;width:100%;height:100%;display:block}
.txi-ls{position:absolute;inset:0;pointer-events:none}
.txi-l{position:absolute;inset:0;overflow:hidden}
.txi-l img,.txi-ho img,.txi-fl img,.txi-th img,.txi-pn img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;-webkit-user-drag:none;user-select:none}
.txi-sh{position:absolute;inset:0;background:${DARK};opacity:0;pointer-events:none}
.txi-bar{display:flex;align-items:center;gap:10px;flex:none}
.txi-nav{display:flex;gap:6px;flex:none}
.txi-b{width:36px;height:36px;display:grid;place-items:center;padding:0;border:1.5px solid var(--muted);background:var(--card);border-radius:10px;cursor:pointer;color:var(--ink)}
.txi-b:hover{background:var(--raised)}
.txi-cap{position:relative;flex:1;min-width:0;height:36px}
.txi-cap>span{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;min-width:0}
.txi-cap b{font-size:13.5px;font-weight:600;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.txi-cap i{font-style:normal;font-size:12px;line-height:1.3;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.txi-live{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.txi-scr{display:flex;align-items:center;gap:8px;flex:none;font-size:12px;color:var(--muted)}
.txi-scr input{width:clamp(96px,24cqi,210px);margin:0;accent-color:var(--ink);cursor:ew-resize}
.txi-scr output{min-width:4ch;text-align:right;color:var(--ink);font-size:12px;font-variant-numeric:tabular-nums}
@container (max-width:470px){.txi-bar{flex-wrap:wrap;row-gap:8px}.txi-cap{order:-1;flex:1 0 100%;height:34px}.txi-scr{flex:1;min-width:0}.txi-scr input{flex:1;width:auto;min-width:0}}
.txi-plate{position:absolute;inset:0;background:var(--card)}
.txi-gcap{position:absolute;left:0;right:0;height:32px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;color:var(--ink);white-space:nowrap;padding:0 12px}
.txi-gcap b{font-weight:600;overflow:hidden;text-overflow:ellipsis}.txi-gcap i{font-style:normal;color:var(--muted);font-variant-numeric:tabular-nums}
.txi-dr{position:absolute;left:0;right:0;overflow:hidden}
.txi-ho{position:absolute;left:0;top:0;width:100%}
.txi-hero{position:absolute;left:0;right:0;top:0;border-radius:12px;background:${DARK};touch-action:pan-y;cursor:grab}
.txi-fl{position:absolute;left:0;top:0;overflow:hidden;background:${DARK}}
.txi-th{position:absolute;padding:0;border:0;border-radius:8px;overflow:hidden;cursor:pointer;background:var(--raised)}
.txi-th[aria-current="true"]{outline:2px solid var(--ink);outline-offset:2px}
.txi-th.txi-out img{visibility:hidden}.txi-th.txi-out{background:none;box-shadow:inset 0 0 0 1.5px var(--line)}
.txi-trk{position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none}
.txi-pn{position:absolute;top:0;overflow:hidden;border-radius:12px;background:${DARK}}
.txi-hit{position:absolute;inset:0;touch-action:pan-y;cursor:grab}
.txi-dots{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);display:flex;padding:3px 5px;border-radius:999px;background:var(--card);box-shadow:var(--shadow)}
.txi-dot{position:relative;width:22px;height:22px;border:0;padding:0;background:none;display:grid;place-items:center;cursor:pointer;border-radius:999px}
.txi-dot i{width:6px;height:6px;border-radius:50%;background:var(--faint)}
.txi-dind{position:absolute;left:0;top:11px;width:16px;height:6px;margin-top:-3px;border-radius:3px;background:var(--ink);pointer-events:none}
`; document.head.appendChild(s); }

const shell = (id, label, inner = '', bare = false) => `<div class="txi-k"><div class="txi-f${bare ? ' txi-bare' : ''}" tabindex="0" role="group" aria-roledescription="slideshow" aria-label="${label}. Arrow keys or swipe to change photo.">${inner}</div><div class="txi-bar"><div class="txi-nav"><button type="button" class="txi-b" data-a="prev" aria-label="Previous photo">${ic(CL, 16)}</button><button type="button" class="txi-b" data-a="next" aria-label="Next photo">${ic(CR, 16)}</button></div><div class="txi-cap" aria-hidden="true"><span><b></b><i></i></span><span><b></b><i></i></span></div><span class="txi-live" aria-live="polite"></span><label class="txi-scr" for="${id}-scrub"><span>Scrub</span><input type="range" id="${id}-scrub" min="0" max="1000" step="1" value="1000" aria-label="Scrub through the last transition"><output class="num" for="${id}-scrub">100%</output></label></div></div>`;

/* ---------------- one shared WebGL2 context for every GL atom (pages cap live contexts) ---------------- */
const GLHEAD = `#version 300 es
precision highp float;
in vec2 v; out vec4 o;
uniform sampler2D T; uniform vec2 res; uniform vec4 cov;
uniform float pIn, pOut, dIn, dOut, asp, hz, seed, same;
uniform vec2 sun, lr;
vec2 Q(){ return vec2(v.x, 1. - v.y); }
vec4 tx(vec2 q){ return texture(T, clamp(q, 0., 1.)*cov.xy + cov.zw); }
vec4 txl(vec2 q, float l){ return textureLod(T, clamp(q, 0., 1.)*cov.xy + cov.zw, l); }
float lum(vec3 c){ return dot(c, vec3(.299, .587, .114)); }
float ss(float a, float b, float x){ float t = clamp((x - a)/(b - a), 0., 1.); return t*t*(3. - 2.*t); }
`;
const GLK = (() => {
  let cv = null, gl = null, ok = null, buf = null; const progs = {}, texs = new Map(), bad = {};
  const VS = '#version 300 es\nin vec2 a; out vec2 v; void main(){ v = a*.5 + .5; gl_Position = vec4(a, 0., 1.); }';
  const init = () => { if (ok !== null) return ok; ok = false;
    try { cv = document.createElement('canvas'); gl = cv.getContext('webgl2', { alpha:true, premultipliedAlpha:true, antialias:false, depth:false, stencil:false, preserveDrawingBuffer:false }); } catch (e){ gl = null; }
    if (!gl) return false;
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); ok = false; });
    buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    return ok = true; };
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = (id, fs) => { if (progs[id]) return progs[id]; const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, GLHEAD + fs));
    gl.bindAttribLocation(p, 0, 'a'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++){ const nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); }
    return progs[id] = { p, u }; };
  const tex = e => { const hit = texs.get(e.key); if (hit){ hit.u = performance.now(); return hit.t; }
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, e.cv); gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    texs.set(e.key, { t, u:performance.now() });
    if (texs.size > 18){ let old = null; texs.forEach((x, k) => { if (!old || x.u < texs.get(old).u) old = k; }); gl.deleteTexture(texs.get(old).t); texs.delete(old); }
    return t; };
  const draw = (id, fs, w, h, passes, out) => { if (!ok || bad[id]) return false;
    try {
      if (cv.width < w || cv.height < h){ cv.width = Math.max(cv.width, w); cv.height = Math.max(cv.height, h); }
      const P = prog(id, fs); gl.useProgram(P.p); gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      for (const ps of passes){ const t = tex(ps.e); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, t); if (P.u.T) gl.uniform1i(P.u.T, 0); if (P.u.res) gl.uniform2f(P.u.res, w, h);
        for (const k in ps.u){ const loc = P.u[k], x = ps.u[k]; if (!loc) continue; if (typeof x === 'number') gl.uniform1f(loc, x); else if (x.length === 2) gl.uniform2fv(loc, x); else gl.uniform4fv(loc, x); }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      out.setTransform(1, 0, 0, 1, 0, 0); out.clearRect(0, 0, w, h); out.drawImage(cv, 0, cv.height - h, w, h, 0, 0, w, h); return true;
    } catch (err){ bad[id] = true; console.error('txi webgl', id, err); return false; } };
  return { init, draw };
})();

/* ---------------- the kit ---------------- */
// stack model: layers[0] is the settled photo; each layer above reveals its photo over the ones below with its own spring.
function stackModel(K){
  const L = K.L = [], N = K.N, sp = K.spring, o = K.o;
  const mk = (i, dir, org) => { const l = { i, dir, p:new Track(0, sp), ox:org ? org[0] : null, oy:org ? org[1] : null, vel:0, id:++uid, el:null, pv:0 }; o.layer && o.layer(K, l); return l; };
  let last = null, c = null, p0 = 0, fresh = false;
  const base = mk(o.start || 0, 1); base.p.jump(1); L.push(base); K.B.add(base);
  const busy = l => l.p.ev.length || (l.aux && l.aux.some(x => x.ev.length));
  const M = {
    logical(){ const top = L[L.length - 1]; return L.length === 1 || top.p.target >= .5 ? top.i : L[L.length - 2].i; },
    go(to, dir, org){ const t = now(), top = L[L.length - 1], below = L[L.length - 2];
      if (to === top.i){ if (L.length > 1) top.p.set(1, sp, t); return; }
      if (below && to === below.i && top.p.at(t) < .999){ top.p.set(0, sp, t); return; }
      const n = mk(to, dir, org); n.p.set(1, sp, t); L.push(n); K.B.add(n); last = { from:top.i, to, dir, org };
      while (L.length > 6){ L[1].p.jump(1); M.prune(t, true); } },
    prune(t, force){ if (K.dragging && !force) return;
      for (let k = L.length - 1; k >= 1; k--){ const l = L[k]; l.p.prune(t); if (l.p.target === 1 && !busy(l)){ L.splice(0, k).forEach(x => K.B.remove(x)); break; } }
      const top = L[L.length - 1]; if (L.length > 1 && top.p.target === 0 && !busy(top)){ L.pop(); K.B.remove(top); } },
    moving(){ return L.some(busy); },
    progress(t){ if (L.length > 1) return clamp(L[L.length - 1].p.at(t)); return !last || L[0].i === last.to ? 1 : 0; },
    scrub(v){
      if (L.length > 2) L.splice(0, L.length - 2).forEach(x => K.B.remove(x));
      if (L.length === 1){ const pr = last || { from:(L[0].i - 1 + N) % N, to:L[0].i, dir:1, org:null }; last = pr;
        if (L[0].i !== pr.from){ K.B.remove(L[0]); L[0] = mk(pr.from, 1); K.B.add(L[0], true); }
        const n = mk(pr.to, pr.dir, pr.org); L.push(n); K.B.add(n); }
      L[0].p.jump(1); L[1].p.jump(v); },
    dragStart(){ const t = now(), top = L[L.length - 1]; c = null; fresh = false;
      if (L.length > 1 && (top.p.ev.length || top.p.target % 1)){ c = top; p0 = top.p.at(t); top.p.jump(p0); } },
    dragMove(dx){
      if (!c){ const dir = dx < 0 ? 1 : -1; M.go((M.logical() + dir + N) % N, dir, K.origin); c = L[L.length - 1]; c.p.jump(0); p0 = 0; fresh = true; }
      let p = p0 - dx*c.dir/K.W;
      if (fresh && p < -.02 && c === L[L.length - 1] && L.length > 1){ L.pop(); K.B.remove(c); const dir = -c.dir; M.go((M.logical() + dir + N) % N, dir, K.origin); c = L[L.length - 1]; c.p.jump(0); p = -p; }
      c.p.jump(clamp(p)); o.onDrag && o.onDrag(K, c); },
    dragEnd(vx){ if (!c) return; const p = c.p.at(now()), pv = clamp(-vx*c.dir/K.W, -8, 8); c.vel = Math.abs(vx)/K.W; o.onRelease && o.onRelease(K, c);
      c.p.release(p, pv, p + pv*.2 > .5 ? 1 : 0, sp); c = null; },
    paint(t){ for (const l of L) l.pv = clamp(l.p.at(t)); K.B.paint(t, L); o.after && o.after(K, L, t); }
  };
  return M;
}
// pair model: one from/to pair whose progress can be reversed, or retargeted while the new photo is not yet showing.
function pairModel(K){
  const N = K.N, sp = K.spring, p = new Track(1, sp), PS = { from:K.o.start || 0, to:K.o.start || 0, dir:1, p }; let last = null, c = false, p0 = 0, fresh = false;
  const M = {
    PS,
    logical(){ return p.target >= .5 ? PS.to : PS.from; },
    go(n, dir){ const t = now(), v = p.at(t);
      if (PS.from !== PS.to && n === PS.to){ p.set(1, sp, t); return; }
      if (PS.from !== PS.to && n === PS.from && v < .999){ p.set(0, sp, t); return; }
      if (n === PS.to) return;
      if (PS.from !== PS.to && v < .5) PS.to = n; else { PS.from = PS.to; PS.to = n; p.jump(1 - v); }
      PS.dir = dir; p.set(1, sp, t); last = { from:PS.from, to:PS.to, dir }; },
    prune(t){ if (K.dragging) return; p.prune(t); if (!p.ev.length){ if (p.target === 1) PS.from = PS.to; else if (p.target === 0){ PS.to = PS.from; p.jump(1); } } },
    moving(){ return p.ev.length > 0; },
    progress(t){ if (PS.from === PS.to) return !last || PS.to === last.to ? 1 : 0; return clamp(p.at(t)); },
    scrub(v){ if (PS.from === PS.to){ const pr = last || { from:(PS.to - 1 + N) % N, to:PS.to, dir:1 }; last = pr; PS.from = pr.from; PS.to = pr.to; PS.dir = pr.dir; } p.jump(v); },
    dragStart(){ c = PS.from !== PS.to; fresh = false; if (c){ p0 = p.at(now()); p.jump(p0); } },
    dragMove(dx){ if (!c){ const dir = dx < 0 ? 1 : -1; M.go((M.logical() + dir + N) % N, dir); p.jump(0); p0 = 0; c = true; fresh = true; }
      let v = p0 - dx*PS.dir/K.W;
      if (fresh && v < -.02){ PS.dir = -PS.dir; PS.to = (PS.from + PS.dir + N) % N; last = { from:PS.from, to:PS.to, dir:PS.dir }; v = -v; }
      p.jump(clamp(v)); },
    dragEnd(vx){ if (!c) return; const v = p.at(now()), pv = clamp(-vx*PS.dir/K.W, -8, 8); p.release(v, pv, v + pv*.2 > .5 ? 1 : 0, sp); c = false; },
    paint(t){ K.o.draw(K, PS, clamp(p.at(t)), t); }
  };
  return M;
}

function kit(st, o){
  const fr = $(st,'.txi-f'), rng = $(st,'.txi-scr input'), out = $(st,'.txi-scr output'), caps = $$(st,'.txi-cap>span'), live = $(st,'.txi-live');
  const items = o.items, N = items.length;
  const K = { st, fr, items, N, o, spring:o.spring || TXS, W:1, H:1, pr:1, dirty:true, origin:null, dragging:false };
  const measure = () => { K.W = Math.max(1, fr.clientWidth); K.H = Math.max(1, fr.clientHeight); K.pr = Math.min(devicePixelRatio || 1, 2, 1600/K.W); o.measure && o.measure(K); };
  measure(); new ResizeObserver(() => { measure(); K.dirty = true; }).observe(fr);

  // photos: generated lazily at display size, one per frame, regenerated only when the frame grows or changes shape
  let gw = 0, gh = 0; const have = new Map(), old = new Map(), queue = [];
  const regen = () => { const d = o.gen ? o.gen(K) : [K.W, K.H], w = Math.max(64, Math.round(Math.min(1600, d[0]*K.pr)/8)*8), h = Math.max(48, Math.round(w*d[1]/d[0]/8)*8);
    if (!gw || w > gw*1.15 || Math.abs(w/h - gw/gh) > .06*gw/gh){ old.clear(); have.forEach((x, k) => old.set(k, x)); have.clear(); queue.length = 0; gw = w; gh = h; } };
  K.src = i => { const e = have.get(i); if (e && (o.backend !== 'dom' || e.url)) return e; if (!queue.includes(i)) queue.push(i); return old.get(i) || null; };
  const pump = () => { for (const e of have.values()) if (o.backend === 'dom' && !e.url){ const it = items[e.i]; e.url = PhotoKit.url(it.name, e.w, e.h, { tod:it.tod || 0 }); K.dirty = true; return; }
    while (queue.length){ const i = queue.shift(); if (have.has(i)) continue; const it = items[i], cv = PhotoKit.get(it.name, gw, gh, { tod:it.tod || 0 });
      const e = { i, cv, w:cv.width, h:cv.height, key:`${it.name}|${it.tod || 0}|${cv.width}x${cv.height}` }; have.set(i, e);
      if (o.backend === 'canvas' && globalThis.createImageBitmap) createImageBitmap(cv).then(b => { e.bmp = b; }).catch(() => {});
      K.dirty = true; return; } };
  K.cov = e => { const sc = Math.max(K.W/e.w, K.H/e.h), sw = K.W/sc, sh = K.H/sc; return [sw/e.w, sh/e.h, (e.w - sw)/2/e.w, (e.h - sh)/2/e.h]; };
  K.blit = (ctx, e, x, y, w, h, dx = x, dy = y, dw = w, dh = h) => { if (w <= .01 || h <= .01 || dw <= .01 || dh <= .01) return;
    const sc = Math.max(K.W/e.w, K.H/e.h), ox = (e.w - K.W/sc)/2, oy = (e.h - K.H/sc)/2; ctx.drawImage(e.bmp || e.cv, ox + x/sc, oy + y/sc, w/sc, h/sc, dx, dy, dw, dh); };
  K.pattern = (ctx, e) => { const s = e.bmp || e.cv; if (e.pat && e.patS === s && e.patW === K.W && e.patH === K.H) return e.pat;
    const sc = Math.max(K.W/e.w, K.H/e.h), ox = (e.w - K.W/sc)/2, oy = (e.h - K.H/sc)/2, pt = ctx.createPattern(s, 'no-repeat'); pt.setTransform(new DOMMatrix([sc, 0, 0, sc, -ox*sc, -oy*sc]));
    e.pat = pt; e.patS = s; e.patW = K.W; e.patH = K.H; return pt; };

  // backends: DOM layers, 2D canvas, or the shared WebGL context copied into a 2D canvas
  if (o.backend === 'dom'){
    const host = o.host ? o.host(K) : (() => { const d = document.createElement('div'); d.className = 'txi-ls'; fr.prepend(d); return d; })();
    K.B = { add(l, bottom){ if (!o.draw) return; l.el = o.make ? o.make(K, l) : Object.assign(document.createElement('div'), { className:'txi-l', innerHTML:'<img alt=""><i class="txi-sh"></i>' }); bottom ? host.prepend(l.el) : host.appendChild(l.el); },
      remove(l){ l.el && l.el.remove(); },
      paint(t, L){ L.forEach((l, k) => { const e = K.src(l.i); if (e && e.url && l.url !== e.url){ $$(l.el,'img').forEach(m => m.src = e.url); l.url = e.url; } if (!e) K.dirty = true;
        if (REDUCE && !o.ownReduce){ l.el.style.opacity = l.pv.toFixed(3); l.el.style.clipPath = 'none'; } else o.draw(K, l, L[k + 1] || null, L[k - 1] || null); }); } };
  } else if (o.backend){
    const cv = document.createElement('canvas'); cv.className = 'txi-cv'; cv.setAttribute('aria-hidden', 'true'); fr.prepend(cv); const ctx = cv.getContext('2d'); K.ctx = ctx;
    const fade = L => L.forEach(l => { const e = K.src(l.i); if (!e){ K.dirty = true; return; } ctx.globalAlpha = l.pv; K.blit(ctx, e, 0, 0, K.W, K.H); ctx.globalAlpha = 1; });
    K.B = { add(){}, remove(){}, paint(t, L){ const w = Math.round(K.W*K.pr), h = Math.round(K.H*K.pr); if (cv.width !== w || cv.height !== h){ cv.width = w; cv.height = h; }
      if (o.backend === 'gl' && !REDUCE && GLK.init()){ const passes = [];
        L.forEach((l, k) => { const e = K.src(l.i); if (!e){ K.dirty = true; return; } const ab = L[k + 1] || null, be = L[k - 1] || null;
          passes.push({ e, u:Object.assign({ cov:K.cov(e), pIn:l.pv, pOut:ab ? ab.pv : 0, dIn:l.dir, dOut:ab ? ab.dir : 1, asp:K.W/K.H, hz:HZ[items[l.i].name] || .6, seed:l.id % 9 }, o.uni ? o.uni(K, l, ab, be, e) : {}) }); });
        if (GLK.draw(o.id, o.frag, w, h, passes, ctx)) return; }
      ctx.setTransform(K.pr, 0, 0, K.pr, 0, 0); ctx.clearRect(0, 0, K.W, K.H);
      if (REDUCE || o.backend === 'gl'){ fade(L); return; }
      L.forEach((l, k) => { const e = K.src(l.i); if (!e){ K.dirty = true; return; } o.draw(ctx, K, l, L[k + 1] || null, L[k - 1] || null, e); }); } };
  }
  const M = K.M = o.model === 'pair' ? pairModel(K) : o.model ? o.model(K) : stackModel(K);
  K.logical = () => M.logical();

  // input: buttons, keys, swipe, tap, scrub
  const nb = d => (M.logical() + d + N) % N;
  K.go = (to, dir, org) => { if (to === M.logical() && !M.moving()) return; K.dirty = true; o.onGo && o.onGo(K); M.go(to, dir || 1, org || null); };
  const fromBtn = (e, d) => { if (!e.detail) return d > 0 ? [1, .5] : [0, .5]; const r = fr.getBoundingClientRect(); return [clamp((e.clientX - r.left)/r.width), clamp((e.clientY - r.top)/r.height)]; };
  $(st,'[data-a="prev"]').onclick = e => K.go(nb(-1), -1, fromBtn(e, -1));
  $(st,'[data-a="next"]').onclick = e => K.go(nb(1), 1, fromBtn(e, 1));
  st.addEventListener('keydown', e => { if (e.target === rng || e.altKey || e.metaKey || e.ctrlKey) return; const lg = M.logical(); let to;
    if (e.key === 'ArrowRight') to = nb(1); else if (e.key === 'ArrowLeft') to = nb(-1); else if (e.key === 'Home') to = 0; else if (e.key === 'End') to = N - 1; else return;
    e.preventDefault(); const d = e.key === 'ArrowRight' || (e.key === 'End') ? 1 : e.key === 'ArrowLeft' || e.key === 'Home' ? -1 : 1; if (to !== lg) K.go(to, d, d > 0 ? [1, .5] : [0, .5]); });
  let x0 = 0, y0 = 0, moved = false, mt = 0;
  drag(o.dragEl ? o.dragEl(K) : fr, {
    down:p => { x0 = p.x; y0 = p.y; moved = false; K.origin = [clamp(p.x/p.w), clamp(p.y/p.h)]; },
    move:p => { const dx = p.x - x0; mt = now(); if (!moved){ if (Math.hypot(dx, p.y - y0) < 6) return; moved = true; K.dragging = true; M.dragStart(); }
      M.dragMove(dx, p); K.dirty = true; },
    up:(p, v) => { if (!moved){ if (o.tap) o.tap(K, p); else { const d = p.x < p.w/3 ? -1 : 1; K.go(nb(d), d, [clamp(p.x/p.w), clamp(p.y/p.h)]); } return; }
      K.dragging = false; M.dragEnd(now() - mt > .08 ? 0 : v.vx); K.dirty = true; } });
  let holding = false;
  rng.addEventListener('pointerdown', () => holding = true); addEventListener('pointerup', () => holding = false); addEventListener('pointercancel', () => holding = false);
  rng.addEventListener('input', () => { M.scrub(rng.value/1000); K.dirty = true; });

  // caption swap (exit then enter), live region, scrub readout
  const cs = new Swap(0); let shown = -1, lastV = -1, was = false;
  const capFor = i => o.capOf ? o.capOf(K, i) : [capOf(items[i]), `${i + 1} of ${N}`];
  const ui = t => {
    const lg = M.logical();
    if (lg !== shown){ const [a, b] = capFor(lg), s = shown < 0 ? 0 : 1 - cs.cur; caps[s].firstChild.textContent = a; caps[s].lastChild.textContent = b; if (shown >= 0) cs.to(s, t); shown = lg; live.textContent = `${a}, ${b}`; }
    caps.forEach((el, k) => cs.apply(el, k, t, 3));
    const v = Math.round(M.progress(t)*1000); if (v !== lastV){ lastV = v; if (!holding) rng.value = v; out.textContent = Math.round(v/10) + '%'; rng.setAttribute('aria-valuetext', `${Math.round(v/10)} percent through the transition`); } };

  K.render = t => { regen(); pump(); M.prune(t); const mv = M.moving(t);
    if (mv || was || K.dirty){ K.dirty = false; M.paint(t); } was = mv; ui(t);
    const lg = M.logical(); K.src(lg); K.src(nb(1)); K.src(nb(-1)); };
  return K;
}

/* ================================================================ 1. Focal iris */
atom({ id:'txi-iris', cat:'Image transitions', name:'Focal iris', block:'gallery, hero slideshow, portfolio', fam:['M','D'], tall:true,
  html:shell('txi-iris', 'Focal iris slideshow'),
  desc:'The next photo opens in a circle centred on its own subject, starting 10% large and settling, while the current photo pushes in 5% toward that same point and dims; reversing closes the iris into the subject. Use it when the subject matters more than the place, like portraits, products or a featured story.',
  api:'next.clip = circle(R·p at focus(next)); next.scale = 1.1 − .1p; prev.scale = 1 + .05·pNext about focus(next)',
  init(st){
    const items = pics('portrait', 'studio', 'harbor', 'ridge', 'city', 'coast');
    return kit(st, { id:'txi-iris', items, backend:'dom',
      draw(K, l, above){ const W = K.W, H = K.H, img = l.el.firstChild, sh = l.el.lastChild, F = focusOf(K.items[l.i]), fx = F[0]*W, fy = F[1]*H, p = l.pv;
        if (p >= 1) l.el.style.clipPath = 'none';
        else { const R = Math.max(Math.hypot(fx, fy), Math.hypot(W - fx, fy), Math.hypot(fx, H - fy), Math.hypot(W - fx, H - fy)) + 2; l.el.style.clipPath = `circle(${px(R*p)} at ${px(fx)} ${px(fy)})`; }
        const si = 1 + .1*(1 - p); let so = 1, ax = fx, ay = fy;
        if (above){ const Fa = focusOf(K.items[above.i]); ax = Fa[0]*W; ay = Fa[1]*H; so = 1 + .05*above.pv; }
        const s = si*so, tx = so*fx*(1 - si) + ax*(1 - so), ty = so*fy*(1 - si) + ay*(1 - so);
        img.style.transformOrigin = '0 0'; img.style.transform = `translate(${px(tx)},${px(ty)}) scale(${s.toFixed(4)})`;
        sh.style.opacity = above ? (.32*above.pv).toFixed(3) : '0'; } }).render;
  }});

/* ================================================================ 2. Depth wipe (truck shot) */
atom({ id:'txi-depth', cat:'Image transitions', name:'Depth wipe', block:'hero slideshow, travel story, property tour', fam:['D','E'], wide:true, tall:true,
  html:shell('txi-depth', 'Depth wipe slideshow'),
  desc:'The current photo slides off like a sheet and uncovers the next one behind it. The new photo travels less than the sheet’s edge, and its ground travels further than its sky, the parallax of a camera trucking sideways; a soft shadow from the sheet’s edge falls on it. Use it for places seen in order, like a travel story or a property tour, where direction means moving on.',
  api:'edge = p; next.x = dir·(.2 + .3·nearness(y))·(1 − p); prev.x = −dir·(.12 + .2·nearness)·p',
  init(st){
    const items = pics('ridge', 'lake', 'forest', 'canyon', 'coast', 'field');
    return kit(st, { id:'txi-depth', items, backend:'gl', frag:`
void main(){ vec2 q = Q(); float s = dIn > 0. ? 1. - q.x : q.x;
  float a = pIn >= .9999 ? 1. : clamp((pIn - s)*res.x, 0., 1.);
  if (a <= 0.){ o = vec4(0.); return; }
  float g = max(0., q.y - hz)/(1. - hz);
  float x = q.x + (dIn > 0. ? -1. : 1.)*(.2 + .3*g)*(1. - pIn);
  x += (dOut > 0. ? 1. : -1.)*(.12 + .2*g)*pOut;
  vec3 c = tx(vec2(x, q.y)).rgb*(1. - .28*pOut);
  float e = (pIn - s)*asp;
  c *= 1. - .3*(1. - ss(0., .07, e))*sin(3.14159*clamp(pIn, 0., 1.));
  o = vec4(c*a, a); }` }).render;
  }});

/* ================================================================ 3. Blinds */
atom({ id:'txi-blinds', cat:'Image transitions', name:'Blinds', block:'lookbook, product gallery', fam:['D','E'], tall:true,
  html:shell('txi-blinds', 'Blinds slideshow'),
  desc:'Vertical slats turn one after another, starting on the side you swiped from: each face narrows and darkens as it turns away while the new face widens. A fast flick turns the slats almost together; a slow drag spreads the wave out. Use it when photos are browsed by hand, like a lookbook, and the gesture should be felt in the change.',
  api:'slat j: lp = (p − order(j, dir)·σ)/(1 − σ); σ = .52 − .05·|release velocity|; face width = lp',
  init(st){
    const items = pics('city', 'dunes', 'meadow', 'harbor', 'forest', 'canyon');
    const sigOf = v => clamp(.52 - .05*v, .14, .52);
    const lpOf = (L, j, n, t) => { if (!L) return 0; if (L.pv >= 1 && !L.sg.ev.length) return 1; const s = L.sg.at(t), od = L.dir > 0 ? (n - 1 - j)/(n - 1) : j/(n - 1); return clamp((L.pv - od*s)/(1 - s)); };
    return kit(st, { id:'txi-blinds', items, backend:'canvas',
      layer(K, l){ l.sg = new Track(.46, S.base); l.aux = [l.sg]; },
      onRelease(K, l){ l.sg.set(sigOf(l.vel)); },
      draw(ctx, K, l, above, below, e){ const W = K.W, H = K.H, t = now();
        if (l.pv >= 1 && !above){ K.blit(ctx, e, 0, 0, W, H); return; }
        const n = Math.max(7, Math.min(22, Math.round(W/46))), sw = W/n;
        for (let j = 0; j < n; j++){ const x0 = j*sw, x1 = x0 + sw, r = below ? lpOf(l, j, n, t) : 1, c = lpOf(above, j, n, t);
          let a = l.dir > 0 ? x1 - r*sw : x0, b = l.dir > 0 ? x1 : x0 + r*sw;
          if (above){ if (above.dir > 0) b = Math.min(b, x1 - c*sw); else a = Math.max(a, x0 + c*sw); }
          const vw = b - a; if (vw <= .3) continue;
          K.blit(ctx, e, x0, 0, sw, H, a, 0, vw + .35, H);
          const f = vw/sw; if (f < .999){ ctx.fillStyle = `rgba(12,16,22,${(.52*(1 - f)).toFixed(3)})`; ctx.fillRect(a, 0, vw, H); } } } }).render;
  }});

/* ================================================================ 4. Develop (luminance dissolve, WebGL) */
atom({ id:'txi-develop', cat:'Image transitions', name:'Develop', block:'before and after, time-lapse, story', fam:['T','S'], tall:true,
  html:shell('txi-develop', 'Develop slideshow'),
  desc:'The new photo arrives by brightness, highlights first and shadows last, the way a print comes up in the developer tray: undeveloped areas pale toward paper, and each area gains its colour after its tone. Use it when the frame stays in the same place and only the moment changes, like before and after or a time-lapse.',
  api:'arrive(px) = (p − .55·(1 − blurredLum(px)))/.45; colour = mix(grey, rgb, arrive − .3); veil = .58·sin πp·(1 − arrive)',
  init(st){
    const items = pics({ name:'lake', tod:1 }, 'studio', { name:'city', tod:1 }, 'forest', { name:'coast', tod:1 }, 'dunes');
    const range = cv => { const c = document.createElement('canvas'); c.width = 32; c.height = 20; const x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(cv, 0, 0, 32, 20);
      const d = x.getImageData(0, 0, 32, 20).data, a = []; for (let i = 0; i < d.length; i += 4) a.push((.299*d[i] + .587*d[i + 1] + .114*d[i + 2])/255); a.sort((p, q) => p - q); return [a[Math.floor(a.length*.04)], a[Math.floor(a.length*.96)]]; };
    return kit(st, { id:'txi-develop', items, backend:'gl', spring:{ w:4.8 }, uni:(K, l, ab, be, e) => ({ lr:e.lr || (e.lr = range(e.cv)) }), frag:`
void main(){ vec2 q = Q(); vec3 c = tx(q).rgb;
  if (pIn >= .9999){ o = vec4(c, 1.); return; }
  float n = clamp((lum(txl(q, 3.5).rgb) - lr.x)/max(.06, lr.y - lr.x), 0., 1.);
  float lp = clamp((pIn - (1. - n)*.55)/.45, 0., 1.), a = ss(0., 1., lp);
  c = mix(vec3(lum(c)), c, ss(.3, 1., lp));
  float vl = .58*sin(3.14159*pIn)*(1. - a);
  o = vec4(c*a + vec3(.93, .915, .885)*vl, a + vl); }` }).render;
  }});

/* ================================================================ 5. Rack focus (depth-aware defocus, WebGL) */
atom({ id:'txi-rack', cat:'Image transitions', name:'Rack focus', block:'gallery, product detail, story', fam:['S','D'], tall:true,
  html:shell('txi-rack', 'Rack focus slideshow'),
  desc:'Focus pulls off the current photo, which softens and breathes 4% larger like a real lens, while the next photo sharpens from its foreground back to its horizon. Use it to move attention between related shots, like a detail and the wide view, without implying a direction.',
  api:'blur = R·(1 − ss(d(y), d(y) + .72, p)) + R·ss(0, .65, pNext); scale = (1 + .05(1 − p))(1 + .045·pNext)',
  init(st){
    const items = pics('field', 'studio', 'meadow', 'portrait', 'lake', 'forest');
    return kit(st, { id:'txi-rack', items, backend:'gl', frag:`
const vec2 DK[8] = vec2[8](vec2(1,0), vec2(.707,.707), vec2(0,1), vec2(-.707,.707), vec2(-1,0), vec2(-.707,-.707), vec2(0,-1), vec2(.707,-.707));
void main(){ vec2 q = Q(); float pin = clamp(pIn, 0., 1.), near = ss(hz, 1., q.y), d0 = .22*(1. - near);
  float r = ((1. - ss(d0, d0 + .72, pin)) + ss(0., .65, pOut))*.02*res.y;
  float z = (1. + .05*(1. - pin))*(1. + .045*pOut); vec2 qq = (q - .5)/z + .5;
  float l = max(0., log2(max(r, .001)) - 1.2); vec2 k = vec2(r/res.x, r/res.y)*.75; vec3 c = txl(qq, l).rgb;
  for (int i = 0; i < 8; i++) c += txl(qq + DK[i]*k, l).rgb; c /= 9.;
  float a = pIn >= .9999 ? 1. : ss(.1, .7, pin);
  o = vec4(c*a, a); }` }).render;
  }});

/* ================================================================ 6. Split at the horizon */
atom({ id:'txi-split', cat:'Image transitions', name:'Horizon split', block:'chaptered story, case study', fam:['S','D'], tall:true,
  html:shell('txi-split', 'Horizon split slideshow', `<div class="txi-plate"><div class="txi-gcap"><b></b><i></i></div></div>${[0, 1].map(() => `<div class="txi-dr"><div class="txi-ho"><img alt=""></div><div class="txi-ho"><img alt=""></div><i class="txi-sh"></i></div>`).join('')}`),
  desc:'The photo parts along its own horizon, the next caption shows in the seam, the seam slides to the new photo’s horizon, then the halves close on the new photo, which drifts in from the side of travel. Exit, then enter, never overlapping. Use it for chaptered stories, where each photo opens a new section.',
  api:'open = tri(p); seam = lerp(horizon(from), horizon(to), ss(.3,.7,p)); content = from → to at p = .5',
  init(st){
    const items = pics('coast', 'ridge', 'dunes', 'harbor', 'canyon', 'lake');
    const doors = $$(st,'.txi-dr'), gcap = $(st,'.txi-gcap'), hold = doors.map(d => $$(d,'.txi-ho')), shades = doors.map(d => $(d,'.txi-sh')); let capTo = -1;
    return kit(st, { id:'txi-split', items, backend:'dom', model:'pair', ownReduce:true,
      measure(K){ hold.flat().forEach(h => h.style.height = px(K.H)); },
      draw(K, PS, p){ const W = K.W, H = K.H, a = K.items[PS.from], b = K.items[PS.to], same = PS.from === PS.to, d = PS.dir;
        const ea = K.src(PS.from), eb = K.src(PS.to); if (!ea || !eb) K.dirty = true;
        hold.forEach(hs => { [ea, eb].forEach((e, k) => { const im = hs[k].firstChild; if (e && e.url && hs[k].u !== e.url){ im.src = e.url; hs[k].u = e.url; } }); });
        const u = same ? 0 : 1 - Math.abs(2*p - 1), g = REDUCE ? 0 : u*u*(3 - 2*u), G = Math.min(H*.17, 64);
        const seam = Math.round(H*lerp(HZ[a.name], HZ[b.name], same ? 0 : ss(.3, .7, p))), w = same ? 1 : REDUCE ? p : ss(.42, .58, p);
        doors[0].style.top = '0px'; doors[0].style.height = px(seam); doors[0].style.transform = `translateY(${px(-g*G)})`;
        doors[1].style.top = px(seam); doors[1].style.height = px(H - seam); doors[1].style.transform = `translateY(${px(g*G)})`;
        const xa = same || REDUCE ? 0 : -d*.03*W*ss(0, .5, p), xb = same || REDUCE ? 0 : d*.03*W*(1 - ss(.5, 1, p)), sc = (1 + .08*g).toFixed(4);
        hold.forEach((hs, k) => { const top = k ? px(-seam) : '0px'; hs[0].style.top = hs[1].style.top = top;
          hs[0].style.transformOrigin = hs[1].style.transformOrigin = `50% ${px(H/2)}`;
          hs[0].style.transform = `translateX(${px(xa)}) scale(${sc})`; hs[1].style.transform = `translateX(${px(xb)}) scale(${sc})`; hs[1].style.opacity = w.toFixed(3); });
        shades.forEach(s => s.style.opacity = (.3*g).toFixed(3));
        if (capTo !== PS.to){ capTo = PS.to; gcap.firstChild.textContent = capOf(b); gcap.lastChild.textContent = `${PS.to + 1} of ${K.N}`; }
        gcap.style.top = px(seam - 16); pop(gcap, ss(.5, .95, g), 3); gcap.style.zIndex = 0; } }).render;
  }});

/* ================================================================ 7. Tile wave from the pointer */
atom({ id:'txi-tiles', cat:'Image transitions', name:'Tile wave', block:'gallery, map or hotspot picker', fam:['E','D'], tall:true,
  html:shell('txi-tiles', 'Tile wave slideshow'),
  desc:'The next photo grows in as dots that open into squares, in a wave that starts exactly where you clicked, tapped or started your swipe; keys start it from the side you are heading to. Use it when the change comes from a place the person pointed at, like choosing a hotspot or a map region.',
  api:'tile: lp = (p − .56·dist(tile, pointer)/maxDist)/.44; square = ss(lp)·cell, radius = (1 − ss)·cell/2',
  init(st){
    const items = pics('city', 'forest', 'studio', 'meadow', 'harbor', 'dunes');
    return kit(st, { id:'txi-tiles', items, backend:'canvas',
      draw(ctx, K, l, above, below, e){ const W = K.W, H = K.H;
        if (l.pv >= 1 || !below){ K.blit(ctx, e, 0, 0, W, H); return; }
        const cols = Math.max(6, Math.round(W/52)), rows = Math.max(4, Math.round(H/52)), cw = W/cols, ch = H/rows;
        const ox = (l.ox ?? (l.dir > 0 ? 1 : 0))*W, oy = (l.oy ?? .5)*H, md = Math.max(Math.hypot(ox, oy), Math.hypot(W - ox, oy), Math.hypot(ox, H - oy), Math.hypot(W - ox, H - oy));
        ctx.beginPath(); let any = false;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++){ const cx = (c + .5)*cw, cy = (r + .5)*ch, lp = clamp((l.pv - .56*Math.hypot(cx - ox, cy - oy)/md)/.44); if (lp <= 0) continue;
          const s = lp*lp*(3 - 2*lp); any = true;
          if (s >= .999){ ctx.rect(c*cw - .3, r*ch - .3, cw + .6, ch + .6); continue; }
          const w = cw*s, h = ch*s, rr = (1 - s)*Math.min(w, h)/2; ctx.roundRect ? ctx.roundRect(cx - w/2, cy - h/2, w, h, rr) : ctx.rect(cx - w/2, cy - h/2, w, h); }
        if (any){ ctx.fillStyle = K.pattern(ctx, e); ctx.fill(); } } }).render;
  }});

/* ================================================================ 8. Page turn */
atom({ id:'txi-page', cat:'Image transitions', name:'Page turn', block:'lookbook, catalogue, printed story', fam:['D','M'], wide:true, tall:true,
  html:shell('txi-page', 'Page turn slideshow'),
  desc:'The photo lifts from its right edge along a softly bowed fold: its back shows through, mirrored and washed like thin paper, and a shadow runs along the fold onto the next page. Going back lays the page down again. Use it for sequences people read in order, like a lookbook, a catalogue or a printed story.',
  api:'fold.x = W(1 − q); tilt = .1·sin πq; flap = mirror(page right of fold)·scaleX(.58) + paper wash; shadow along fold',
  init(st){
    const items = pics('studio', 'portrait', 'ridge', 'harbor', 'field', 'city'); let paper = 'var(--card)', pt = -9;
    // the back of a print is light paper in both themes: use whichever of --card and --ink is lighter
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently:true });
    const lighter = el => { const cs = getComputedStyle(el), c = [cs.getPropertyValue('--card').trim(), cs.getPropertyValue('--ink').trim()].map(v => { probe.fillStyle = '#000'; probe.fillStyle = v; probe.fillRect(0, 0, 1, 1); const d = probe.getImageData(0, 0, 1, 1).data; return [probe.fillStyle, d[0] + d[1] + d[2]]; }); return c[0][1] >= c[1][1] ? c[0][0] : c[1][0]; };
    return kit(st, { id:'txi-page', items, backend:'canvas',
      draw(ctx, K, l, above, below, e){ const W = K.W, H = K.H, eb = below && K.src(below.i);
        if (Math.abs(now() - pt) > 1){ pt = now(); paper = lighter(K.st); }
        if (l.pv >= 1 || !below || !eb){ K.blit(ctx, e, 0, 0, W, H); return; }
        const fwd = l.dir > 0, q = fwd ? l.pv : 1 - l.pv, page = fwd ? eb : e, s = Math.sin(Math.PI*q), th = .1*s, k = .58, xf = W*(1 - q);
        const tn = Math.tan(th)*H/2, bow = .03*W*s, T = [xf + tn, -2], Bt = [xf - tn, H + 2], C = [xf + 2*bow*Math.cos(th), H/2 + 2*bow*Math.sin(th)];
        const side = sgn => { ctx.beginPath(); ctx.moveTo(T[0], T[1]); ctx.quadraticCurveTo(C[0], C[1], Bt[0], Bt[1]); ctx.lineTo(sgn*W*4, H + 2); ctx.lineTo(sgn*W*4, -2); ctx.closePath(); };
        ctx.save();
        if (fwd){ side(1); ctx.clip(); K.blit(ctx, e, 0, 0, W, H); }
        else { side(-1); ctx.clip(); K.blit(ctx, e, 0, 0, W, H); ctx.restore(); ctx.save(); side(1); ctx.clip(); }
        const nx = Math.cos(th), ny = Math.sin(th), g = ctx.createLinearGradient(xf, H/2, xf + nx*44, H/2 + ny*44);
        g.addColorStop(0, `rgba(12,16,22,${(.4*Math.sqrt(s)).toFixed(3)})`); g.addColorStop(1, 'rgba(12,16,22,0)'); ctx.fillStyle = g; ctx.fillRect(-W, -H, W*3, H*3);
        ctx.restore();
        ctx.save(); side(-1); ctx.clip();
        ctx.translate(xf, H/2); ctx.rotate(th); ctx.scale(-k, 1); ctx.rotate(-th); ctx.translate(-xf, -H/2);
        side(1); ctx.clip(); K.blit(ctx, page, 0, 0, W, H);
        ctx.globalAlpha = .76; ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
        const g2 = ctx.createLinearGradient(xf, H/2, xf + nx*(W - xf + 1), H/2 + ny*(W - xf + 1));
        g2.addColorStop(0, 'rgba(12,16,22,.24)'); g2.addColorStop(.3, 'rgba(12,16,22,.03)'); g2.addColorStop(1, 'rgba(12,16,22,.1)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
        ctx.restore(); } }).render;
  }});

/* ================================================================ 9. Relight (aligned PhotoKit pairs, WebGL) */
atom({ id:'txi-relight', cat:'Image transitions', name:'Relight', block:'hero, lighting or time-of-day preview', fam:['T','E'], wide:true, tall:true,
  html:shell('txi-relight', 'Relight slideshow'),
  desc:'The same scene moves from midday to afternoon to golden hour along a light front that spreads out from the sun’s path, sky before ground; stepping to another place falls back to a plain dissolve so the light front only ever means “same place, new light”. Use it when only the time or the conditions change, like a lighting preview or a day-to-evening product shot.',
  api:'arrive(px) = (p − .62·dist(px, sun) − .14·ground(px))/.24; other scene: alpha = ss(0, 1, p)',
  init(st){
    const RL = ['ridge', 'lake', 'harbor', 'canyon'], TODS = [[0, 'Midday', '12:40'], [.55, 'Afternoon', '16:15'], [1, 'Golden hour', '18:52']];
    const items = RL.flatMap(n => TODS.map(([tod]) => ({ name:n, tod })));
    return kit(st, { id:'txi-relight', items, backend:'gl', spring:TXL,
      capOf:(K, i) => { const k = i % 3; return [capOf(K.items[i]), `${TODS[k][1]}, ${TODS[k][2]} · scene ${Math.floor(i/3) + 1} of ${RL.length}`]; },
      uni:(K, l, ab, be) => ({ sun:be ? SUN((K.items[l.i].tod + K.items[be.i].tod)/2) : SUN(K.items[l.i].tod), same:be && K.items[be.i].name === K.items[l.i].name ? 1 : 0 }), frag:`
void main(){ vec2 q = Q(); vec3 c = tx(q).rgb; float a;
  if (pIn >= .9999) a = 1.;
  else if (same < .5) a = ss(0., 1., pIn);
  else { vec2 k = vec2(asp, 1.); float d = length((q - sun)*k)/length(k);
    float tau = .62*d + .14*ss(hz - .05, 1., q.y); a = ss(0., 1., clamp((pIn - tau)/.24, 0., 1.)); }
  o = vec4(c*a, a); }` }).render;
  }});

/* ================================================================ 10. Shared element: thumbnail to hero */
atom({ id:'txi-flip', cat:'Image transitions', name:'Thumbnail to hero', block:'gallery with thumbnail strip, product images', fam:['M','D'], wide:true, tall:true,
  html:shell('txi-flip', 'Thumbnail to hero gallery', `<div class="txi-hero"></div>${'<button type="button" class="txi-th" aria-label="Show photo"><img alt=""></button>'.repeat(6)}<div class="txi-ls"></div>`, true),
  desc:'The thumbnail you choose lifts out of the strip and grows into the hero along a curved path: it rises first, then widens as it lands, while its slot stays outlined until it arrives and the old hero dims beneath. Use it for galleries with a visible strip or grid, so people see where the big photo came from.',
  api:'rect = { cx: lerp(th, hero, p), cy: lerp(th, hero, 1 − (1 − p)^1.8), size: lerp(th, hero, p^1.25) }',
  init(st){
    const items = pics('ridge', 'lake', 'dunes', 'coast', 'forest', 'canyon'), hero = $(st,'.txi-hero'), ths = $$(st,'.txi-th');
    ths.forEach((b, k) => { b.setAttribute('aria-label', `Show photo ${k + 1}: ${capOf(items[k])}`); });
    const K = kit(st, { id:'txi-flip', items, backend:'dom', ownReduce:true, host:K => $(K.fr,'.txi-ls'), dragEl:() => hero,
      gen:K => [K.W, K.R ? K.R.hero.h : K.H],
      measure(K){ const W = K.W, H = K.H, n = items.length, gp = 8, s = Math.round(Math.min(Math.max(40, W*.075), 68, (W - (n - 1)*gp)/n)), x0 = (W - (n*s + (n - 1)*gp))/2, hh = H - s - 14;
        K.R = { hero:{ w:W, h:hh, cx:W/2, cy:hh/2 }, th:[] }; hero.style.height = px(hh);
        ths.forEach((b, k) => { const x = x0 + k*(s + gp); Object.assign(b.style, { left:px(x), top:px(H - s), width:px(s), height:px(s) }); K.R.th.push({ w:s, h:s, cx:x + s/2, cy:H - s/2 }); }); },
      make(){ return Object.assign(document.createElement('div'), { className:'txi-fl', innerHTML:'<img alt=""><i class="txi-sh"></i>' }); },
      draw(K, l, above){ const a = K.R.th[l.i], b = K.R.hero, p = REDUCE ? 1 : l.pv, el = l.el;
        const es = Math.pow(p, 1.25), ey = 1 - Math.pow(1 - p, 1.8), w = lerp(a.w, b.w, es), h = lerp(a.h, b.h, es), cx = lerp(a.cx, b.cx, p), cy = lerp(a.cy, b.cy, ey);
        el.style.transform = `translate(${px(cx - w/2)},${px(cy - h/2)})`; el.style.width = px(w); el.style.height = px(h); el.style.borderRadius = px(lerp(8, 12, p));
        el.style.opacity = REDUCE ? l.pv.toFixed(3) : '1';
        el.lastChild.style.opacity = above ? (.35*above.pv).toFixed(3) : '0'; el.style.boxShadow = p > .001 && p < .999 ? 'var(--shadow)' : 'none'; },
      after(K, L){ const lg = K.logical(), fly = new Set(L.slice(1).filter(l => l.pv < .999).map(l => l.i));
        ths.forEach((b, k) => { const e = K.src(k); if (e && e.url && b._u !== e.url){ b.firstChild.src = e.url; b._u = e.url; }
          const f = fly.has(k); if (b._f !== f){ b._f = f; b.classList.toggle('txi-out', f); }
          const c = k === lg; if (b._c !== c){ b._c = c; b.setAttribute('aria-current', c ? 'true' : 'false'); } }); } });
    ths.forEach((b, k) => b.onclick = () => { const lg = K.logical(); if (k !== lg) K.go(k, k > lg ? 1 : -1); });
    return K.render;
  }});

/* ================================================================ 11. Ink edge (smoothed noise contour, WebGL) */
atom({ id:'txi-ink', cat:'Image transitions', name:'Ink edge', block:'editorial story, slow slideshow', fam:['E','D'], tall:true,
  html:shell('txi-ink', 'Ink edge slideshow'),
  desc:'The next photo spreads in from the side of travel behind a calm, low-frequency ink contour that drifts slowly as it advances, with a faint darker rim like wash drying on paper. Use it for slower editorial pacing, where a hard wipe would feel mechanical.',
  api:'contour = .74·travel(x) + .42·(fbm(x·1.8 + drift(p)) − .5); reveal where contour < mix(−.16, 1.1, p); rim darkens 16%',
  init(st){
    const items = pics('lake', 'harbor', 'coast', 'meadow', 'dunes', 'forest');
    return kit(st, { id:'txi-ink', items, backend:'gl', spring:{ w:5 }, frag:`
float h2(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3. - 2.*f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ return .55*vn(p) + .3*vn(p*2.03 + 7.1) + .15*vn(p*4.1 + 3.7); }
void main(){ vec2 q = Q(); vec3 c = tx(q).rgb;
  if (pIn >= .9999){ o = vec4(c, 1.); return; }
  float s = dIn > 0. ? 1. - q.x : q.x;
  vec2 np = vec2(q.x*asp, q.y)*1.8 + seed*13.7 + vec2(-dIn*pIn*.6, pIn*.25);
  float val = s*.74 + (fbm(np) - .5)*.42 + .13, th = mix(-.16, 1.1, pIn), e = 1.5/res.x;
  float a = 1. - ss(th - e, th + e, val);
  c *= 1. - .16*(1. - ss(0., .035, th - val))*sin(3.14159*pIn);
  o = vec4(c*a, a); }` }).render;
  }});

/* ================================================================ 12. Fly-to strip (zoom out with speed, own invention) */
atom({ id:'txi-flyto', cat:'Image transitions', name:'Fly-to strip', block:'chapters, numbered steps, long galleries', fam:['M','D'], wide:true, tall:true,
  html:shell('txi-flyto', 'Fly-to strip', `<div class="txi-trk" aria-hidden="true">${'<div class="txi-pn"><img alt=""><i class="txi-sh"></i></div>'.repeat(8)}</div><div class="txi-hit"></div><div class="txi-dots" role="group" aria-label="Jump to photo"><i class="txi-dind"></i>${'<button type="button" class="txi-dot" aria-label="Jump to photo"><i></i></button>'.repeat(8)}</div>`),
  desc:'The view pulls back in proportion to how fast it is travelling, slides along the strip and settles back in, so a jump of five photos shows more of the set than a step of one, and dragging lifts it slightly so neighbours peek in. Use it when position in the set matters, like chapters or numbered steps.',
  api:'pos.set(i); zoom = 1 − min(.44, .1·|d pos/dt|^.85); view = translate(center − pos·(W + gap)·zoom) scale(zoom)',
  init(st){
    const items = pics('ridge', 'lake', 'dunes', 'city', 'coast', 'forest', 'field', 'canyon'), trk = $(st,'.txi-trk'), pns = $$(st,'.txi-pn').map(el => ({ el, img:el.firstChild, sh:el.lastChild })),
      dots = $$(st,'.txi-dot'), dind = $(st,'.txi-dind'); let dx = [];
    dots.forEach((b, k) => b.setAttribute('aria-label', `Photo ${k + 1}: ${capOf(items[k])}`));
    const model = K => { const N = K.N, sp = K.spring, pos = new Track(0, sp), zd = new Track(1, S.base); let from = 0, to = 0, c = false, p0 = 0, frozen = false, last = null;
      const lg = () => clamp(Math.round(pos.target), 0, N - 1);
      const M = {
        logical:lg,
        go(n){ const t = now(); frozen = false; if (REDUCE){ from = to = n; pos.jump(n); last = { from:n, to:n }; return; } if (from !== to && n === from){ pos.set(n, sp, t); return; }
          from = clamp(Math.round(pos.at(t)), 0, N - 1); if (from === n) from = lg(); to = n; pos.set(n, sp, t); last = { from, to }; },
        prune(t){ if (K.dragging) return; pos.prune(t); zd.prune(t); if (!pos.ev.length && !frozen) from = to = lg(); },
        moving(){ return pos.ev.length > 0 || zd.ev.length > 0; },
        progress(t){ if (from === to) return !last || lg() === last.to || c ? 1 : 0; return clamp((pos.at(t) - from)/(to - from)); },
        scrub(v){ if (from === to){ const pr = last && last.from !== last.to ? last : { from:Math.max(0, lg() - 1), to:Math.max(1, lg()) }; from = pr.from; to = pr.to; last = pr; } frozen = true; pos.jump(lerp(from, to, v)); },
        vel(t){ if (frozen && from !== to){ const v = clamp((pos.at(t) - from)/(to - from)); return Math.abs(to - from)*sp.w/Math.E*4*v*(1 - v); } return Math.abs(pos.at(t) - pos.at(t - .03))/.03; },
        dragStart(){ frozen = false; p0 = pos.at(now()); pos.jump(p0); zd.set(.9); c = true; },
        dragMove(d){ let v = p0 - d/((K.W + K.G)*(K.z || 1)); if (v < 0) v = rb(v, .3); else if (v > N - 1) v = N - 1 + rb(v - N + 1, .3); pos.jump(v);
          from = clamp(Math.round(p0), 0, N - 1); to = clamp(from + (v < from ? -1 : 1), 0, N - 1); },
        dragEnd(vx){ if (!c) return; c = false; const t = now(), x = pos.at(t), v = clamp(-vx/((K.W + K.G)*(K.z || 1)), -12, 12), n = clamp(Math.round(x + v*.28), 0, N - 1);
          from = clamp(Math.round(p0), 0, N - 1); to = n; last = { from, to }; pos.release(x, v, n, sp); zd.set(1); },
        paint(t){ const W = K.W, H = K.H, G = K.G, x = pos.at(t); let z = REDUCE ? 1 : 1 - Math.min(.44, .1*Math.pow(M.vel(t), .85)); z = Math.min(z, zd.at(t)); K.z = z;
          trk.style.transform = `translate(${px(W/2 - z*(x*(W + G) + W/2))},${px(H/2 - z*H/2)}) scale(${z.toFixed(4)})`;
          pns.forEach((pn, k) => { const e = K.src(k); if (e && e.url && pn.u !== e.url){ pn.img.src = e.url; pn.u = e.url; } if (!e) K.dirty = true; pn.sh.style.opacity = (.5*clamp(Math.abs(k - x))).toFixed(3); });
          const i0 = clamp(Math.floor(x), 0, N - 1), i1 = clamp(i0 + 1, 0, N - 1), f = clamp(x - i0); if (dx.length) dind.style.transform = `translateX(${px(lerp(dx[i0], dx[i1], f))})`;
          dots.forEach((b, k) => { const cu = k === lg(); if (b._c !== cu){ b._c = cu; b.setAttribute('aria-current', cu ? 'true' : 'false'); } }); }
      };
      return M; };
    const K = kit(st, { id:'txi-flyto', items, backend:'dom', model, dragEl:() => $(st,'.txi-hit'), ownReduce:true,
      measure(K){ K.G = Math.max(12, Math.round(K.W*.02)); pns.forEach((pn, k) => Object.assign(pn.el.style, { left:px(k*(K.W + K.G)), width:px(K.W), height:px(K.H) })); dx = dots.map(b => b.offsetLeft + b.offsetWidth/2 - 8); } });
    dots.forEach((b, k) => b.onclick = () => { const lg = K.logical(); if (k !== lg) K.go(k, k > lg ? 1 : -1); });
    return K.render;
  }});
})();