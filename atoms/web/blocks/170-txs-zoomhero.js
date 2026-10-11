

/* ---------- Scroll stories (lane: tx-scroll) ----------
   Every atom is a faux page with its own native scroll. Nothing listens to the wheel:
   sticky sections pin natively, and their effects read a critically damped follower of
   scrollTop, so trackpad jitter is smoothed without ever taking the scroll away. */
(() => {
const CAT = 'Scroll stories';
const DPR = () => Math.min(2, devicePixelRatio || 1);
const ease = p => { p = clamp(p); return p*p*(3 - 2*p); };
const sine = p => .5 - .5*Math.cos(Math.PI*clamp(p));
const pct = p => Math.round(clamp(p)*100) + '%';
const CAP = n => PhotoKit.CAPTIONS[n];

const BASE = `<style>
.txs-f{--txs-h:538px;position:absolute;inset:10px 12px;border-radius:14px;background:var(--card);overflow:hidden;text-align:left;isolation:isolate}
.txs-sc{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior-x:contain;scrollbar-width:thin;-webkit-overflow-scrolling:touch}
.txs-sc:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.txs-ro{position:absolute;top:10px;right:10px;z-index:8;pointer-events:none;font:500 11.5px/1 var(--mono);color:var(--ink);background:var(--raised);border-radius:999px;padding:5px 9px;font-variant-numeric:tabular-nums;white-space:nowrap}
.txs-pin{position:sticky;top:0;height:var(--txs-h);overflow:hidden}
.txs-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.txs-body{max-width:600px;margin:0 auto;padding:40px 22px 56px;line-height:1.6;color:var(--muted);font-size:14.5px}
.txs-body h4{margin:0 0 10px;color:var(--ink);font-size:20px;line-height:1.2;letter-spacing:-.02em;font-weight:600;text-wrap:balance}
.txs-body p{margin:0 0 12px}
.txs-k{display:block;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:6px}
.txs-tag{background:#0C1016;color:#EFF2F6;border-radius:8px;padding:6px 10px;font-size:12.5px;line-height:1.35}
.txs-tag b{font-weight:600}
</style>`;
const frame = (label, inner, after = '') => `${BASE}<div class="txs-f"><div class="txs-sc" tabindex="0" role="region" aria-label="${label}. Scroll, or press Space or Page Down">${inner}</div>${after}<div class="txs-ro" aria-hidden="true"></div></div>`;

// shared rig: native scroll in, damped follower out, cached layout, lazy photo jobs
function story(st, onMeasure){
  const f = $(st,'.txs-f'), sc = $(st,'.txs-sc'), ro = $(st,'.txs-ro');
  const s = { f, sc, raw:0, y:0, v:0, H:0, W:0, lt:null, ok:false, vis:false, txt:'', jobs:new Map(), dirty:true, lastY:-1 };
  sc.addEventListener('scroll', () => { s.raw = sc.scrollTop; }, { passive:true });
  s.top = el => el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
  s.measure = () => { const W = sc.clientWidth, H = sc.clientHeight; if (!H || !W) return;
    s.W = W; s.H = H; f.style.setProperty('--txs-h', H + 'px'); s.raw = sc.scrollTop; onMeasure(s); s.ok = true; s.dirty = true; };
  new ResizeObserver(() => s.measure()).observe(sc); document.fonts.ready.then(() => s.measure()); requestAnimationFrame(() => s.measure());
  // critically damped follower (w = 20) of a piecewise-constant target: no overshoot, interruptible
  s.step = t => { const dt = s.lt === null ? 1 : t - s.lt; s.lt = t;
    if (REDUCE || dt > .5 || dt < 0){ s.y = s.raw; s.v = 0; }
    else { const w = 20, x0 = s.y - s.raw, v0 = s.v, e = Math.exp(-w*dt); const x = e*(x0 + (v0 + w*x0)*dt); s.v = e*(v0 - w*(v0 + w*x0)*dt); s.y = s.raw + x;
      if (Math.abs(x) < .05 && Math.abs(s.v) < 2){ s.y = s.raw; s.v = 0; } }
    const ch = s.dirty || Math.abs(s.y - s.lastY) > .01; s.lastY = s.y; s.dirty = false; return ch; };
  s.read = x => { if (x !== s.txt){ s.txt = x; ro.textContent = x; } };
  s.job = (k, fn) => s.jobs.set(k, fn);
  // photos develop only once the stage is really on screen (the page renders every tile once before its own observer runs)
  new IntersectionObserver(es => { s.vis = es[es.length - 1].isIntersecting; }).observe(st);
  s.work = () => { if (!s.vis) return; const t0 = performance.now(); for (const [k, fn] of s.jobs){ s.jobs.delete(k); fn(); s.dirty = true; if (performance.now() - t0 > 8) break; } };
  s.prog = (top, len) => clamp((s.y - top)/Math.max(1, len));
  return s;
}
// paint a PhotoKit scene into our own canvas at display size × dpr (PhotoKit caches, we copy)
function paint(cv, name, w, h, o = {}){
  const d = DPR(); let W = Math.round(w*d*(o.over || 1)), H = Math.round(h*d*(o.over || 1)); const cap = o.cap || 1600; if (W > cap){ H = Math.round(H*cap/W); W = cap; }
  const k = `${name}|${W}|${H}|${o.tod || 0}`; if (cv._k === k) return; cv._k = k;
  cv.width = W; cv.height = H; cv.getContext('2d').drawImage(PhotoKit.get(name, W, H, { tod:o.tod || 0 }), 0, 0);
}
const size = (el, w, h) => { el.style.width = px(w); el.style.height = px(h); };

/* ================================================================ 1. Pinned hero zoom-out */
atom({ id:'txs-zoomhero', cat:CAT, name:'Pinned hero zoom-out', block:'hero, media-hero, section-pin', fam:['M','T'], wide:true, tall:true,
  html: frame('Story: begin at one ridge', `<style>
.txs1-sec{position:relative;height:calc(var(--txs-h)*3)}
.txs1-win{position:absolute;inset:0;overflow:hidden;will-change:clip-path}
.txs1-cv{position:absolute;left:0;top:0;transform-origin:0 0;background:var(--raised);will-change:transform}
.txs1-tx{position:absolute;display:flex;flex-direction:column;gap:14px}
.txs1-hl{margin:0;font-size:34px;line-height:1.06;letter-spacing:-.035em;font-weight:600;color:var(--ink)}
.txs1-ln{display:block;overflow:hidden;padding-bottom:.08em}
.txs1-ln>span{display:block}
.txs1-cap{margin:0;font-size:13px;color:var(--muted);max-width:36ch}
.txs1-cue{position:absolute;left:50%;bottom:20px;margin:0;white-space:nowrap}
</style><section class="txs1-sec"><div class="txs-pin">
<div class="txs1-win"><canvas class="txs1-cv" role="img" aria-label="Photograph: ridge line in the Sierra Nevada in late light"></canvas></div>
<div class="txs1-tx"><h3 class="txs1-hl"><span class="txs1-ln"><span>Begin at one ridge.</span></span><span class="txs1-ln"><span>Then step back</span></span><span class="txs1-ln"><span>until the range fits.</span></span></h3>
<p class="txs1-cap">Ridge line, Sierra Nevada. Shot at 5:40 pm from the Tioga Pass road, 200 mm, then pulled back to the whole range.</p></div>
<p class="txs1-cue txs-tag">Scroll to step back</p></div></section>
<div class="txs-body"><span class="txs-k">Why it opens on a detail</span><h4>The first thing you see is the reason to keep looking</h4>
<p>Product pages open on the material, the stitch or the screen edge, then pull back to the whole object. A landscape works the same way: one lit ridge, then the range it belongs to.</p>
<p>The zoom is tied to how far you have scrolled, not to a timer. Stop halfway and the photograph waits halfway. Scroll back up and the detail returns.</p>
<p>The headline arrives line by line only after the frame has settled, so you never read and zoom at once.</p></div>`),
  desc:'Use when a landing page should open on one striking detail and then reveal the whole image. The photo starts zoomed to the lit ridge and full bleed; scrolling pulls the camera back (log-scale zoom) while the window shrinks into a framed print with rounded corners. Only after the zoom settles do the three headline lines rise out of their masks, 8% of scroll apart, then the caption. Reduced motion shows the framed end state and fades the lines in.',
  api:'p = (y − top)/(3H − H)   e = sine(p/.78)   s = s0^(1−e)   clip = lerp(viewport, frameRect, e)   line[i].y = (1 − (p − .5 − .08i)/.18)·110%',
  init(st){
    const cv = $(st,'.txs1-cv'), win = $(st,'.txs1-win'), sec = $(st,'.txs1-sec'), tx = $(st,'.txs1-tx'), hl = $(st,'.txs1-hl'), lines = $$(st,'.txs1-ln>span'), cap = $(st,'.txs1-cap'), cue = $(st,'.txs1-cue');
    const D = { x:.64, y:.33 }; let L = {}, top = 0;
    const s = story(st, s => {
      const { W, H } = s, wide = W >= 640;
      L = wide ? { l:Math.round(W*(W < 900 ? .47 : .44)), t:24, r:W - 24, b:H - 24 } : { l:16, t:16, r:W - 16, b:Math.round(H*.54) };
      L.w = L.r - L.l; L.h = L.b - L.t; L.s0 = Math.max(W/L.w, H/L.h)*2.2; size(cv, L.w, L.h);
      Object.assign(tx.style, wide ? { left:'28px', top:'auto', bottom:'40px', width:px(L.l - 60) } : { left:'20px', top:px(L.b + 18), bottom:'auto', width:px(W - 40) });
      hl.style.fontSize = W >= 900 ? '38px' : wide ? '25px' : '25px';
      top = s.top(sec); s.len = sec.offsetHeight - H;
      s.job('photo', () => paint(cv, 'ridge', L.w, L.h, { tod:.45, over:1.5 }));
    });
    return t => {
      s.work(); if (!s.step(t) || !s.ok) return;
      const { W, H } = s, p = s.prog(top, s.len), e = REDUCE ? 1 : sine(p/.78);
      let sc = Math.pow(L.s0, 1 - e);
      const cl = lerp(0, L.l, e), ct = lerp(0, L.t, e), cr = lerp(W, L.r, e), cb = lerp(H, L.b, e);
      sc = Math.max(sc, (cr - cl)/L.w, (cb - ct)/L.h);
      const fx = lerp(W/2, L.l + D.x*L.w, e), fy = lerp(H/2, L.t + D.y*L.h, e);
      const x0 = clamp(fx - sc*D.x*L.w, cr - sc*L.w, cl), y0 = clamp(fy - sc*D.y*L.h, cb - sc*L.h, ct);
      cv.style.transform = `translate(${px(x0)},${px(y0)}) scale(${sc.toFixed(4)})`;
      win.style.clipPath = `inset(${px(ct)} ${px(W - cr)} ${px(H - cb)} ${px(cl)} round ${px(14*e)})`;
      lines.forEach((l, i) => { const q = clamp((p - .5 - .08*i)/.18); if (REDUCE){ l.style.opacity = q.toFixed(3); l.style.transform = 'none'; } else l.style.transform = `translateY(${((1 - ease(q))*110).toFixed(2)}%)`; });
      cap.style.opacity = clamp((p - .78)/.14).toFixed(3);
      const c = REDUCE ? 0 : 1 - clamp(p/.08); cue.style.opacity = c.toFixed(3); cue.style.transform = `translate(-50%,${px((1 - c)*8)})`; cue.style.visibility = c < .01 ? 'hidden' : 'visible';
      s.read(`Zoom ${sc.toFixed(1)}× · ${pct(p)}`);
    };
  }});

/* ================================================================ 2. Horizontal gallery pinned in vertical scroll */
const HG = ['coast','dunes','harbor','meadow','canyon','forest'];
atom({ id:'txs-hgallery', cat:CAT, name:'Pinned horizontal gallery', block:'gallery, carousel, section-pin', fam:['D','T'], wide:true, tall:true,
  html: frame('Story: field notes, spring', `<style>
.txs2-sec{position:relative}
.txs2-hd{position:absolute;left:22px;right:22px;top:22px;display:flex;flex-direction:column;gap:2px}
.txs2-hd h3{margin:0;font-size:24px;line-height:1.15;letter-spacing:-.03em;font-weight:600;color:var(--ink)}
.txs2-hd p{margin:0;font-size:13px;color:var(--muted)}
.txs2-tr{position:absolute;left:0;display:flex;gap:20px;padding:0 22px;will-change:transform}
.txs2-cd{margin:0;flex:none;display:flex;flex-direction:column;gap:8px}
.txs2-ph{position:relative;overflow:hidden;border-radius:10px;background:var(--raised)}
.txs2-ph canvas{position:absolute;top:0;left:0;height:100%;will-change:transform}
.txs2-cd figcaption{display:flex;justify-content:space-between;gap:10px;font-size:13px;color:var(--muted)}
.txs2-cd figcaption b{color:var(--ink);font-weight:500}
.txs2-bar{position:absolute;left:22px;right:22px;bottom:22px;height:2px;background:var(--line-soft);border-radius:1px}
.txs2-bar i{position:absolute;inset:0;background:var(--ink);transform-origin:0 50%;border-radius:1px}
</style><section class="txs2-sec"><div class="txs-pin">
<div class="txs2-hd"><h3>Field notes, spring</h3><p>Six frames from one week on the coast road. Keep scrolling down; the row travels sideways.</p></div>
<div class="txs2-tr">${HG.map((n, i) => `<figure class="txs2-cd"><div class="txs2-ph"><canvas role="img" aria-label="Photograph: ${CAP(n)}"></canvas></div><figcaption><b>${CAP(n)}</b><span class="num">0${i + 1}</span></figcaption></figure>`).join('')}</div>
<div class="txs2-bar" aria-hidden="true"><i></i></div></div></section>
<div class="txs-body"><span class="txs-k">After the row</span><h4>Vertical scroll in, sideways travel out</h4><p>The wheel and the keyboard still scroll down. The row is pinned while it has distance left to cover, one pixel across for every pixel down, then the page lets go and carries on.</p><p>Inside each frame the photo drifts against the travel, so near frames feel closer than the row behind them.</p></div>`),
  desc:'Use when a short run of related photos sits inside a long page and a carousel would hide them behind buttons. The section pins while the row has travel left: each pixel scrolled down moves the row one pixel left, smoothed by the follower. Inside every card the photo drifts against the travel by up to 10% of its width (depth), the progress line fills, and the counter changes as a card crosses the centre. Reduced motion keeps the 1:1 travel and drops the inner drift.',
  api:'x = −p·(trackW − W)   img[i].x = −(cx[i] − W/2)/W·.18·cardW   bar.scaleX = p   section.h = H + travel',
  init(st){
    const sec = $(st,'.txs2-sec'), hd = $(st,'.txs2-hd'), tr = $(st,'.txs2-tr'), cards = $$(st,'.txs2-cd'), phs = $$(st,'.txs2-ph'), cvs = $$(st,'.txs2-ph canvas'), bar = $(st,'.txs2-bar i');
    let top = 0, travel = 0, cw = 0, gap = 20, pad = 22, cur = -1;
    const s = story(st, s => {
      const { W, H } = s; cw = Math.round(W >= 900 ? 300 : W >= 640 ? 260 : Math.min(250, W*.78)); const ih = Math.round(Math.min(H - 190, cw*1.22));
      phs.forEach(p => size(p, cw, ih)); cvs.forEach(c => size(c, cw*1.2, ih));
      const trackW = HG.length*cw + (HG.length - 1)*gap + pad*2; travel = Math.max(0, trackW - W);
      const ht = W < 640 ? 46 : 22; hd.style.top = px(ht); tr.style.top = px(Math.max(ht + 78, (H - ih - 28)/2 + 24));
      sec.style.height = px(H + travel); top = s.top(sec);
      HG.forEach((n, i) => s.job('p' + i, () => paint(cvs[i], n, cw*1.2, ih, { tod:[.2,.5,.1,.35,.7,.25][i] })));
    });
    return t => {
      s.work(); if (!s.step(t) || !s.ok) return;
      const p = s.prog(top, travel), x = -p*travel; tr.style.transform = `translate3d(${px(x)},0,0)`; bar.style.transform = `scaleX(${p.toFixed(4)})`;
      cards.forEach((c, i) => { const cx = pad + i*(cw + gap) + cw/2 + x, off = (cx - s.W/2)/s.W;
        cvs[i].style.transform = `translate3d(${px(-cw*.1 - (REDUCE ? 0 : clamp(off, -1, 1)*cw*.1))},0,0)`; });
      cur = Math.round(p*(HG.length - 1));
      s.read(`Frame ${cur + 1} of ${HG.length} · ${pct(p)}`);
    };
  }});

/* ================================================================ 3. Stacking cards */
const STK = [
  { n:'field', k:'01 · Ingest', h:'Copy the card before you look at it', b:'Two copies, two drives, then format. Nothing gets culled on the camera, where the screen lies about focus.' },
  { n:'portrait', k:'02 · Cull', h:'One pass for focus, one for feeling', b:'The first pass removes what is soft. The second keeps what you would hang. Most shoots end with eleven frames out of four hundred.' },
  { n:'studio', k:'03 · Grade', h:'Fix the light, then stop', b:'White balance from the grey card, exposure from the highlights, and a single curve. Anything more starts to show.' },
  { n:'lake', k:'04 · Print', h:'The print is the final edit', b:'A 40 by 50 centimetre proof on matte paper shows what the screen hid: the shadows were two stops too heavy.' }];
atom({ id:'txs-stackcards', cat:CAT, name:'Stacking cards', block:'feature-cards, process-steps', fam:['M','T'], wide:true, tall:true,
  html: frame('Story: from card to print', `<style>
.txs3-in{padding:26px 22px 8px}
.txs3-in h3{margin:0;font-size:24px;line-height:1.15;letter-spacing:-.03em;font-weight:600;color:var(--ink)}
.txs3-in p{margin:4px 0 0;font-size:13.5px;color:var(--muted)}
.txs3-ls{padding:16px 16px 0}
.txs3-cd{position:sticky;display:flex;gap:0;background:var(--card);border-radius:14px;overflow:hidden;transform-origin:50% 0;box-shadow:var(--shadow);will-change:transform}
.txs3-cd canvas{display:block;flex:none;background:var(--raised)}
.txs3-tx{display:flex;flex-direction:column;justify-content:center;gap:8px;padding:22px 24px;min-width:0}
.txs3-tx h4{margin:0;font-size:22px;line-height:1.15;letter-spacing:-.025em;font-weight:600;color:var(--ink);text-wrap:balance}
.txs3-tx p{margin:0;font-size:14px;line-height:1.55;color:var(--muted)}
.txs3-dim{position:absolute;inset:0;background:#0C1016;opacity:0;pointer-events:none}
.txs3-cd[data-n]{flex-direction:column}
.txs3-cd[data-n] .txs3-tx{padding:14px 16px;gap:6px}
.txs3-cd[data-n] .txs3-tx h4{font-size:18px}
.txs3-cd[data-n] .txs3-tx p{font-size:13px}
</style><div class="txs3-in"><span class="txs-k">Workflow</span><h3>From card to print, in four steps</h3><p>Each step slides over the last and tucks it underneath.</p></div>
<div class="txs3-ls">${STK.map(c => `<article class="txs3-cd"><canvas role="img" aria-label="Photograph: ${CAP(c.n)}"></canvas><div class="txs3-tx"><span class="txs-k" style="margin:0">${c.k}</span><h4>${c.h}</h4><p>${c.b}</p></div><i class="txs3-dim"></i></article>`).join('')}</div>
<div class="txs-body"><span class="txs-k">After the stack</span><h4>The stack lets go together</h4><p>Once the last card lands, all four scroll away as one block, so the steps stay in order on the way out.</p></div>`),
  desc:'Use when an ordered process of three to five steps should replace one step with the next while the earlier ones stay visible. Cards pin 12px apart; as the next card rises over one, that card scales down from its top edge (5% per card above it) and dims, so the stack recedes in depth while its edges stay readable. Coverage is computed from the next card’s distance to its own pin, so scrolling back lifts them out in reverse. Reduced motion keeps the dimming and drops the scale.',
  api:'cover[i] = 1 − ((top[i+1] − y) − pin[i+1])/(cardH + gap − 12)   depth[i] = Σ cover[j≥i]   card.scale = 1 − .05·depth   dim = .14·depth',
  init(st){
    const ls = $(st,'.txs3-ls'), cds = $$(st,'.txs3-cd'), cvs = $$(st,'.txs3-cd canvas'), dims = $$(st,'.txs3-dim');
    const N = STK.length, GAP = 28, OFF = 12; let ch = 0, base = 0, pins = [];
    const s = story(st, s => {
      const { W, H } = s, narrow = W < 640; ch = Math.round(H - 32 - (N - 1)*OFF - 8);
      cds.forEach((c, i) => { c.toggleAttribute('data-n', narrow); c.style.height = px(ch); c.style.top = px(16 + i*OFF); c.style.marginBottom = i < N - 1 ? px(GAP) : '0'; });
      const iw = narrow ? W - 34 : Math.round((W - 34)*.52), ih = narrow ? Math.round(ch*.48) : ch - 2;
      cvs.forEach(c => size(c, iw, ih)); pins = cds.map((c, i) => 16 + i*OFF); base = s.top(ls) + 16;
      STK.forEach((c, i) => s.job('p' + i, () => paint(cvs[i], c.n, iw, ih, { tod:[.15,.3,.5,.85][i] })));
    });
    return t => {
      s.work(); if (!s.step(t) || !s.ok) return;
      const cover = cds.map((c, i) => i === N - 1 ? 0 : clamp(1 - ((base + (i + 1)*(ch + GAP) - s.y) - pins[i + 1])/(ch + GAP - OFF)));
      let depth = 0, stuck = 1;
      for (let i = N - 1; i >= 0; i--){ depth += cover[i]; const d = depth;
        cds[i].style.transform = REDUCE ? 'none' : `scale(${(1 - .05*d).toFixed(4)})`; dims[i].style.opacity = Math.min(.42, .14*d).toFixed(3); }
      cover.forEach(c => { if (c > .5) stuck++; });
      s.read(`Card ${Math.min(N, stuck)} of ${N} · ${pct(s.y/Math.max(1, s.sc.scrollHeight - s.H))}`);
    };
  }});

/* ================================================================ 4. Clip-path window */
atom({ id:'txs-clipwindow', cat:CAT, name:'Clip window to full bleed', block:'hero, media-reveal, section-pin', fam:['M','E','T'], wide:true, tall:true,
  html: frame('Story: a window onto the spruce stand', `<style>
.txs4-sec{position:relative;height:calc(var(--txs-h)*2.7)}
.txs4-ph{position:absolute;inset:0;overflow:hidden;will-change:clip-path}
.txs4-ph canvas{position:absolute;inset:0;width:100%;height:100%;will-change:transform;background:var(--raised)}
.txs4-hl{position:absolute;left:22px;right:22px;margin:0;text-align:center;font-size:30px;line-height:1.08;letter-spacing:-.035em;font-weight:600;color:var(--ink);text-wrap:balance}
.txs4-lo{position:absolute;left:50%;width:min(420px,calc(100% - 44px));margin:0;text-align:center;font-size:13.5px;color:var(--muted)}
.txs4-cap{position:absolute;left:16px;bottom:16px;margin:0}
</style><section class="txs4-sec"><div class="txs-pin">
<h3 class="txs4-hl">The forest starts as a window</h3>
<div class="txs4-ph"><canvas role="img" aria-label="Photograph: spruce stand in morning light"></canvas></div>
<p class="txs4-lo">Keep scrolling and the frame opens until you are standing in it.</p>
<p class="txs4-cap txs-tag"><b>Spruce stand</b> · 7:10 am, after the fog lifted</p></div></section>
<div class="txs-body"><span class="txs-k">How the window opens</span><h4>Top and bottom lead, the sides follow</h4><p>The frame opens vertically first, like a door swinging toward you, and the sides catch up a beat later. The photograph inside eases from a slight push-in to its true size, so you feel you have stepped through rather than zoomed.</p></div>`),
  desc:'Use when a page should move from editorial text into an immersive photo without a hard cut. The photo sits behind a small rounded window; scrolling opens the clip-path toward full bleed with the top and bottom edges leading and the sides lagging 8% of scroll behind, while the photo eases from 1.18× to 1×. The headline rides the top edge out, the note rides the bottom edge, and the caption tag fades in last. Reduced motion cuts from window to full bleed at the midpoint.',
  api:'ev = ease(p/.6)  eh = ease((p − .08)/.6)   clip = inset(lerp(t0,0,ev) lerp(l0,0,eh) … round lerp(14,0,eh))   img.scale = lerp(1.18, 1, ev)',
  init(st){
    const sec = $(st,'.txs4-sec'), ph = $(st,'.txs4-ph'), cv = $(st,'.txs4-ph canvas'), hl = $(st,'.txs4-hl'), lo = $(st,'.txs4-lo'), cap = $(st,'.txs4-cap');
    let top = 0, R = {}, hh = 0;
    const s = story(st, s => {
      const { W, H } = s, narrow = W < 640; const w = Math.round(narrow ? W*.62 : Math.min(320, W*.3)), h = Math.round(narrow ? H*.34 : H*.42);
      R = { l:(W - w)/2, t:(H - h)/2 + (narrow ? 10 : 6), w, h }; hl.style.fontSize = narrow ? '24px' : W >= 900 ? '34px' : '28px'; hh = hl.offsetHeight;
      top = s.top(sec); s.len = sec.offsetHeight - H; s.job('photo', () => paint(cv, 'forest', W, H, { tod:.15 }));
    });
    return t => {
      s.work(); if (!s.step(t) || !s.ok) return;
      const { W, H } = s, p = s.prog(top, s.len); let ev = ease(p/.6), eh = ease((p - .08)/.6); if (REDUCE) ev = eh = p < .5 ? 0 : 1;
      const ct = lerp(R.t, 0, ev), cb = lerp(H - R.t - R.h, 0, ev), cl = lerp(R.l, 0, eh), cr = lerp(W - R.l - R.w, 0, eh);
      ph.style.clipPath = `inset(${px(ct)} ${px(cr)} ${px(cb)} ${px(cl)} round ${px(14*(1 - eh))})`;
      cv.style.transform = `scale(${lerp(1.18, 1, REDUCE ? 1 : ev).toFixed(4)})`;
      hl.style.top = px(ct - hh - 18); hl.style.opacity = clamp(1 - ev*1.6).toFixed(3);
      lo.style.top = px(H - cb + 16); lo.style.transform = 'translateX(-50%)'; lo.style.opacity = clamp(1 - ev*1.6).toFixed(3);
      const c = clamp((p - .74)/.14); cap.style.opacity = c.toFixed(3); cap.style.transform = `translateY(${px((1 - ease(c))*8)})`;
      s.read(`Window ${pct((W - cl - cr)*(H - ct - cb)/(W*H))} · ${pct(p)}`);
    };
  }});

/* ================================================================ 5. Chapter scrollytelling */
const CH = [
  { n:'lake', tod:.05, k:'Chapter 1 · 6:40 am', h:'Still water first', b:'We left the car at the trailhead before sunrise. The lake held the sky so flat that the shoreline was the only proof there was water at all.' },
  { n:'forest', tod:.3, k:'Chapter 2 · 9:15 am', h:'Into the spruce', b:'The trail climbs through a stand that has not burned in ninety years. Light comes down in columns, and every frame wants a slower shutter.' },
  { n:'ridge', tod:.6, k:'Chapter 3 · 2:30 pm', h:'Above the trees', b:'At the saddle the range opens up. Haze softens each ridge behind the last, which is the whole reason to carry the long lens this far.' },
  { n:'coast', tod:.95, k:'Chapter 4 · 7:05 pm', h:'Down to the coast road', b:'We came down the west side as the light went orange. The road follows the water for nine miles, and we stopped at four of them.' }];
atom({ id:'txs-chapters', cat:CAT, name:'Chapter scrollytelling', block:'scrollytelling, feature-split, story-steps', fam:['S','T'], wide:true, tall:true,
  html: frame('Story: one day, four places', `<style>
.txs5-w{position:relative;display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1fr);gap:0 28px;padding:0 20px 0 26px}
.txs5-fg{position:sticky;top:16px;grid-column:2;grid-row:1;height:calc(var(--txs-h) - 32px);margin:16px 0;display:flex;flex-direction:column;gap:10px}
.txs5-im{position:relative;flex:1;border-radius:12px;overflow:hidden;background:var(--raised)}
.txs5-im canvas{position:absolute;inset:0;width:100%;height:100%;will-change:transform,clip-path}
.txs5-cp{position:relative;height:20px;font-size:13px;color:var(--muted)}
.txs5-cp .layer{justify-content:flex-start}
.txs5-dt{position:absolute;z-index:3;right:12px;bottom:12px;display:flex;gap:6px;padding:7px 8px;border-radius:999px;background:#0C1016}
.txs5-dt i{width:6px;height:6px;border-radius:3px;background:#EFF2F6;opacity:.35}
.txs5-st{grid-column:1;grid-row:1}
.txs5-s{display:flex;flex-direction:column;justify-content:center;gap:8px}
.txs5-s h4{margin:0;font-size:24px;line-height:1.12;letter-spacing:-.03em;font-weight:600;color:var(--ink);text-wrap:balance}
.txs5-s p{margin:0;font-size:14.5px;line-height:1.6;color:var(--muted)}
.txs5-s .txs-k{margin:0}
.txs5-w[data-n]{display:block;padding:0}
.txs5-w[data-n] .txs5-fg{top:0;margin:0;height:var(--txs-h);gap:0}
.txs5-w[data-n] .txs5-im{border-radius:0}
.txs5-w[data-n] .txs5-cp{display:none}
.txs5-w[data-n] .txs5-st{position:relative;z-index:2;margin-top:calc(var(--txs-h)*-1);padding:0 14px}
.txs5-w[data-n] .txs5-s>div{background:var(--card);border-radius:12px;padding:16px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:6px}
.txs5-w[data-n] .txs5-s h4{font-size:19px}
.txs5-w[data-n] .txs5-s p{font-size:13.5px}
</style><div class="txs5-w"><div class="txs5-fg"><div class="txs5-im">${CH.map(c => `<canvas role="img" aria-label="Photograph: ${CAP(c.n)}"></canvas>`).join('')}<div class="txs5-dt" aria-hidden="true">${CH.map(() => '<i></i>').join('')}</div></div><div class="txs5-cp">${CH.map(c => `<span class="layer">${CAP(c.n)}</span>`).join('')}</div></div>
<div class="txs5-st">${CH.map(c => `<section class="txs5-s"><div><span class="txs-k">${c.k}</span><h4>${c.h}</h4><p>${c.b}</p></div></section>`).join('')}</div></div>
<div class="txs-body"><span class="txs-k">End of the day</span><h4>Four places, one roll</h4><p>The photo changes in the gap between two chapters, never while you are reading one. Scroll back and the earlier light slides back down.</p></div><p class="txs-sr" aria-live="polite"></p>`),
  desc:'Use when each block of a narrative has its own picture: a case study, a trip, a product tour. Text steps scroll on the left while the photo pins on the right (on phones the photo pins full height and the steps scroll over it as cards). The photo holds while a step is centred, then in the gap between steps the next photo rises from below through a mask while the old one drifts up 18%, both tied to scroll so it reverses exactly. The caption swaps (exit, then enter) at the midpoint and the active step brightens. Reduced motion cross-fades.',
  api:'f = i + (focus − c[i])/(c[i+1] − c[i])   q = ease((frac(f) − .3)/.4)   next.clip = inset((1−q)·80% 0 0 0)   next.y = (1−q)·20%   prev.y = −q·18%',
  init(st){
    const w = $(st,'.txs5-w'), im = $(st,'.txs5-im'), cvs = $$(st,'.txs5-im canvas'), dots = $$(st,'.txs5-dt i'), caps = $$(st,'.txs5-cp .layer'), steps = $$(st,'.txs5-s'), live = $(st,'.txs-sr');
    const sw = new Swap(0); let cs = [], cur = -1, narrow = false;
    const s = story(st, s => {
      const { W, H } = s; narrow = W < 640; w.toggleAttribute('data-n', narrow);
      steps.forEach((el, i) => { el.style.minHeight = px(narrow ? H*.95 : H*.8); el.style.paddingTop = i === 0 ? px(narrow ? H*.55 : H*.1) : '0'; });
      const iw = im.clientWidth, ih = im.clientHeight; cs = steps.map(el => { const d = el.firstElementChild; return s.top(d) + d.offsetHeight/2; });
      CH.forEach((c, i) => s.job('p' + i, () => paint(cvs[i], c.n, iw, ih, { tod:c.tod })));
    });
    return t => {
      s.work(); const ch = s.step(t); caps.forEach((e, k) => sw.apply(e, k, t)); if (!ch || !s.ok){ return; }
      const focus = s.y + s.H*(narrow ? .62 : .5); let f = 0;
      for (let i = 0; i < CH.length - 1; i++) if (focus >= cs[i]) f = i + clamp((focus - cs[i])/(cs[i + 1] - cs[i]));
      const k = Math.min(CH.length - 1, Math.floor(f)), q = ease((f - k - .3)/.4), n = Math.min(CH.length - 1, k + 1);
      cvs.forEach((c, i) => { if (i < k || i > n){ c.style.visibility = 'hidden'; return; } c.style.visibility = 'visible';
        if (i === k){ c.style.clipPath = 'none'; c.style.opacity = '1'; c.style.transform = REDUCE || n === k ? 'none' : `translateY(${(-q*18).toFixed(2)}%)`; c.style.zIndex = 1; }
        else { c.style.zIndex = 2; if (REDUCE){ c.style.clipPath = 'none'; c.style.opacity = q.toFixed(3); c.style.transform = 'none'; }
          else { c.style.opacity = '1'; c.style.clipPath = `inset(${((1 - q)*80).toFixed(2)}% 0 0 0)`; c.style.transform = `translateY(${((1 - q)*20).toFixed(2)}%)`; } } });
      const act = q > .5 ? n : k; if (act !== cur){ cur = act; sw.to(act); live.textContent = `${CH[act].k}: ${CH[act].h}`; }
      dots.forEach((d, i) => d.style.opacity = (i === act ? 1 : .35).toFixed(2));
      steps.forEach((el, i) => { const dd = Math.abs(f - i); el.firstElementChild.style.opacity = (narrow ? 1 : lerp(1, .38, clamp(dd*1.4))).toFixed(3); });
      s.read(`Chapter ${act + 1} of ${CH.length} · ${pct(f/(CH.length - 1))}`);
    };
  }});

/* ================================================================ 6. Parallax depth planes */
// split one PhotoKit scene into planes. Each ridge is a flat fill plus grain: per column we walk up
// from the bottom through flat runs (no drift), cluster their colours across the image, then classify
// every pixel bottom-up, only ever stepping to a farther tone, and stop at the sky.
function splitPlanes(src){
  const W = src.width, H = src.height, d = src.getContext('2d').getImageData(0, 0, W, H).data, cls = new Int8Array(W*H).fill(-1);
  const at = (x, y) => { const o = (y*W + x)*4; return [d[o], d[o + 1], d[o + 2]]; };
  const avg = (x, y0, y1) => { const s = [0,0,0]; let n = 0; for (let y = y0; y >= y1 && y >= 0; y--){ const c = at(x, y); s[0] += c[0]; s[1] += c[1]; s[2] += c[2]; n++; } return s.map(v => v/Math.max(1, n)); };
  const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  const pal = [], step = Math.max(1, Math.round(W/240)); let cols = 0;
  for (let x = 0; x < W; x += step){ cols++; let y = H - 1;
    while (y > 3){ const y0 = y, c0 = avg(x, y, y - 2); while (y > 0 && dist(at(x, y), c0) < 40) y--;
      const len = y0 - y; if (len >= 8 && dist(avg(x, y0, y0 - 3), avg(x, y + 4, y + 1)) < 10){ const c = avg(x, y0, y + 1); let m = pal.find(p => dist(p.c, c) < 18); if (!m){ m = { c, w:0, ys:0 }; pal.push(m); } m.w += len; m.ys += (y0 + y)/2*len; }
      if (len < 1) y--; } }
  const land = pal.filter(p => p.w > cols*H*.025).sort((a, b) => b.w - a.w).slice(0, 5); land.forEach(p => p.my = p.ys/p.w); land.sort((a, b) => a.my - b.my);
  const match = (c, cur) => { let b = -1, bd = 40; for (let i = 0; i <= cur; i++){ const dd = dist(land[i].c, c); if (dd < bd){ bd = dd; b = i; } } return b; };
  const sky = new Int32Array(W);
  for (let x = 0; x < W; x++){ let y = H - 1, cur = land.length - 1;
    while (y >= 0){ let li = match(at(x, y), cur);
      if (li >= 0){ cls[y*W + x] = li; cur = li; y--; continue; }
      let k = 1; for (; k <= 4 && y - k >= 0; k++){ li = match(at(x, y - k), cur); if (li >= 0) break; }
      if (li < 0 || y - k < 0) break; for (let j = 0; j <= k; j++) cls[(y - j)*W + x] = li; cur = li; y -= k + 1; }
    sky[x] = y + 1; }
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const skyC = mk(), sx = skyC.getContext('2d'), sd = sx.createImageData(W, H);
  // behind the ridges the sky continues: each column's colour just above its ridge, plus seeded grain
  const fill = []; for (let x = 0; x < W; x++){ const y0 = Math.max(0, sky[x] - 7); fill.push(avg(x, y0, Math.max(0, y0 - 8))); }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ const o = (y*W + x)*4;
    if (y < sky[x] - 7){ sd.data[o] = d[o]; sd.data[o + 1] = d[o + 1]; sd.data[o + 2] = d[o + 2]; }
    else { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); const n = ((h >>> 0) % 11) - 5, f = fill[x]; sd.data[o] = f[0] + n; sd.data[o + 1] = f[1] + n; sd.data[o + 2] = f[2] + n; }
    sd.data[o + 3] = 255; }
  sx.putImageData(sd, 0, 0); const planes = [skyC];
  land.forEach((p, li) => { const c = mk(), x2 = c.getContext('2d'), id = x2.createImageData(W, H);
    for (let i = 0; i < W*H; i++){ const k = cls[i]; if (k < li) continue; const o = i*4;
      if (k === li && Math.abs(d[o] - p.c[0]) + Math.abs(d[o + 1] - p.c[1]) + Math.abs(d[o + 2] - p.c[2]) < 22){ id.data[o] = d[o]; id.data[o + 1] = d[o + 1]; id.data[o + 2] = d[o + 2]; }
      else if (k === li){ id.data[o] = p.c[0]; id.data[o + 1] = p.c[1]; id.data[o + 2] = p.c[2]; }
      else { const q = land[k].c; id.data[o] = d[o] - q[0] + p.c[0]; id.data[o + 1] = d[o + 1] - q[1] + p.c[1]; id.data[o + 2] = d[o + 2] - q[2] + p.c[2]; }
      id.data[o + 3] = 255; }
    x2.putImageData(id, 0, 0); planes.push(c); });
  return planes;
}
atom({ id:'txs-depthplanes', cat:CAT, name:'Parallax depth planes', block:'hero, media-hero, section-pin', fam:['T'], wide:true, tall:true,
  html: frame('Story: one photograph, five planes', `<style>
.txs6-sec{position:relative;height:calc(var(--txs-h)*2.6)}
.txs6-st{position:absolute;inset:0;background:var(--raised)}
.txs6-st canvas{position:absolute;left:0;width:100%;will-change:transform}
.txs6-hl{position:absolute;left:0;right:0;margin:0;text-align:center;color:#0C1016;font-size:40px;line-height:1.02;letter-spacing:-.04em;font-weight:600;will-change:transform;text-wrap:balance;padding:0 20px}
.txs6-hl small{display:block;font-size:13px;letter-spacing:0;font-weight:500;margin-top:10px;color:#0C1016;opacity:.7}
.txs6-ld{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);margin:0}
</style><section class="txs6-sec"><div class="txs-pin"><div class="txs6-st" role="img" aria-label="Photograph: ridge line in the Sierra Nevada, split into depth planes"></div><p class="txs6-ld txs-tag">Separating planes…</p></div></section>
<div class="txs-body"><span class="txs-k">How the planes were made</span><h4>One photograph, cut along its ridgelines</h4><p>Each ridge in this photograph is a flat tone. Walking up every column from the bottom, the page finds where one tone gives way to the next, groups the tones across the whole image, and cuts a plane for each. The sky becomes the back plane.</p><p>The far ridge moves least and the near slope most, so scrolling reads as walking forward, and the headline rises from behind the hills it belongs to.</p></div>`),
  desc:'Use when a hero should feel spatial without 3D assets. One PhotoKit scene is cut into planes in the page: per column, flat runs are found from the bottom up and clustered into ridge tones; the sky is the back plane. Scrolling moves each plane by its depth (sky 8%, far ridge 25%, near slope 100% of a 16% range), and the headline sits between the far and middle ridges, so it rises from behind the hills. Reduced motion holds the planes still and fades the headline in.',
  api:'planes = split(PhotoKit.get(ridge))   plane[k].y = (.5 − p)·.16H·depth[k]   headline: z between plane 1 and 2, y = lerp(.62H, .2H, ease(p/.6))',
  init(st){
    const sec = $(st,'.txs6-sec'), stg = $(st,'.txs6-st'), ld = $(st,'.txs6-ld');
    const hl = document.createElement('h3'); hl.className = 'txs6-hl'; hl.innerHTML = 'Walk into the range<small>Five planes from one photograph</small>';
    let top = 0, planes = [], depth = [], OV = .1;
    const s = story(st, s => {
      const { W, H } = s; hl.style.fontSize = W < 640 ? '28px' : W < 900 ? '34px' : '42px'; top = s.top(sec); s.len = sec.offsetHeight - H;
      s.job('planes', () => { const d = DPR(), cw = Math.min(1400, Math.round(W*d)), chh = Math.round(cw*H*(1 + 2*OV)/W);
        const src = PhotoKit.get('ridge', cw, chh, { tod:.35 }); const ps = splitPlanes(src);
        stg.replaceChildren(); planes = ps.map(c => { c.style.height = px(H*(1 + 2*OV)); c.style.top = px(-H*OV); stg.appendChild(c); return c; });
        stg.insertBefore(hl, planes[Math.min(2, planes.length - 1)]); $(hl,'small').textContent = `${planes.length} planes from one photograph`; depth = planes.map((_, i) => i === 0 ? .08 : lerp(.25, 1, (i - 1)/Math.max(1, planes.length - 2)));
        ld.style.display = 'none'; });
    });
    return t => {
      s.work(); if (!s.step(t) || !s.ok || !planes.length) return;
      const { H } = s, p = s.prog(top, s.len);
      planes.forEach((c, i) => c.style.transform = `translate3d(0,${px(REDUCE ? 0 : (.5 - p)*H*.16*depth[i])},0)`);
      const e = ease(p/.6); hl.style.top = px(lerp(H*.62, H*.18, REDUCE ? 1 : e)); hl.style.opacity = REDUCE ? e.toFixed(3) : '1';
      s.read(`Depth ${pct(p)} · ${planes.length} planes`);
    };
  }});

/* ================================================================ 7. Relight on scroll */
const RL = [
  { t:'12:10 pm', h:'Noon on Ferris Street', b:'At noon the east side has no shadows to hide in. The towers read as flat cutouts against a pale sky, and every window is just glass.' },
  { t:'2:45 pm', h:'The light starts to lean', b:'By mid afternoon the sun swings west and the street canyons fill with shade from the left. The skyline gets edges again.' },
  { t:'5:20 pm', h:'Warm on the west faces', b:'The sky drops toward orange from the top down. The west faces of the towers pick it up first, then the haze over the river.' },
  { t:'7:35 pm', h:'Windows come on', b:'Golden hour. Offices empty and the windows light from inside, so the city starts to glow as the sky stops doing it for them.' }];
atom({ id:'txs-relight', cat:CAT, name:'Relight as you read', block:'article, feature-split, media-story', fam:['M','T'], wide:true, tall:true,
  html: frame('Story: a day on the east side', `<style>
.txs7-w{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1fr);gap:0 28px;padding:0 20px 0 26px}
.txs7-fg{position:sticky;top:16px;grid-column:2;grid-row:1;height:calc(var(--txs-h) - 32px);margin:16px 0;border-radius:12px;overflow:hidden;background:var(--raised)}
.txs7-fg canvas{position:absolute;inset:0;width:100%;height:100%}
.txs7-gd{-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
.txs7-tm{position:absolute;left:12px;bottom:12px;margin:0;font-variant-numeric:tabular-nums}
.txs7-ar{grid-column:1;grid-row:1;padding:30px 0 50px}
.txs7-ar h3{margin:0 0 6px;font-size:28px;line-height:1.08;letter-spacing:-.035em;font-weight:600;color:var(--ink);text-wrap:balance}
.txs7-p{padding:22px 0;min-height:calc(var(--txs-h)*.62)}
.txs7-p h4{margin:0 0 6px;font-size:18px;line-height:1.2;letter-spacing:-.02em;font-weight:600;color:var(--ink)}
.txs7-p p{margin:0;font-size:14.5px;line-height:1.6;color:var(--muted)}
.txs7-w[data-n]{display:block;padding:0}
.txs7-w[data-n] .txs7-fg{top:0;margin:0;height:calc(var(--txs-h)*.42);border-radius:0;z-index:2}
.txs7-w[data-n] .txs7-ar{padding:22px 18px 40px}
.txs7-w[data-n] .txs7-ar h3{font-size:23px}
</style><div class="txs7-w"><div class="txs7-fg" role="img" aria-label="Photograph: downtown east side, relit from noon to golden hour as you read"><canvas></canvas><canvas class="txs7-gd"></canvas><p class="txs7-tm txs-tag">12:10 pm</p></div>
<article class="txs7-ar"><span class="txs-k">Photo essay</span><h3>A day on the east side</h3>${RL.map(r => `<section class="txs7-p"><span class="txs-k">${r.t}</span><h4>${r.h}</h4><p>${r.b}</p></section>`).join('')}</article></div>`),
  desc:'Use when the photo should keep pace with long-form reading: an essay, a case study, a place. As you read, the city relights from noon to golden hour. The warm exposure arrives as a soft band sweeping from the sun’s corner (top right) toward the bottom left, so light visibly travels across the scene; the time tag counts with it and the paragraph being read brightens. Reduced motion replaces the sweep with an even cross-fade.',
  api:'p = y/(scrollH − H)   golden.mask = linear-gradient(225deg, #000 (p·150 − 35)%, transparent (+35)%)   clock = lerp(12:10, 19:35, p)',
  init(st){
    const w = $(st,'.txs7-w'), fg = $(st,'.txs7-fg'), [day, gold] = $$(st,'.txs7-fg canvas'), tm = $(st,'.txs7-tm'), paras = $$(st,'.txs7-p');
    let narrow = false, cs = [];
    const s = story(st, s => {
      const { W } = s; narrow = W < 640; w.toggleAttribute('data-n', narrow);
      const fw = fg.clientWidth, fh = fg.clientHeight; cs = paras.map(el => s.top(el) + el.offsetHeight/2);
      s.job('day', () => paint(day, 'city', fw, fh, { tod:0 })); s.job('gold', () => paint(gold, 'city', fw, fh, { tod:1 }));
    });
    const fmt = m => { const h = Math.floor(m/60), mm = Math.round(m % 60); return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`; };
    return t => {
      s.work(); if (!s.step(t) || !s.ok) return;
      const max = Math.max(1, s.sc.scrollHeight - s.H), p = clamp(s.y/max);
      if (REDUCE){ gold.style.webkitMaskImage = gold.style.maskImage = 'none'; gold.style.opacity = p.toFixed(3); }
      else { const a = p*150 - 35, m = `linear-gradient(225deg, #000 ${a.toFixed(2)}%, transparent ${(a + 35).toFixed(2)}%)`; gold.style.webkitMaskImage = m; gold.style.maskImage = m; gold.style.opacity = '1'; }
      tm.textContent = fmt(lerp(12*60 + 10, 19*60 + 35, p));
      const focus = s.y + s.H*(narrow ? .7 : .5);
      paras.forEach((el, i) => el.style.opacity = lerp(1, .4, clamp(Math.abs(focus - cs[i])/(s.H*.45) - .3)).toFixed(3));
      s.read(`Light ${pct(p)} · ${tm.textContent}`);
    };
  }});

/* ================================================================ 8. Scroll-scrubbed image sequence */
const SEQ = 24;
atom({ id:'txs-sequence', cat:CAT, name:'Scroll-scrubbed sequence', block:'media-hero, product-reveal, section-pin', fam:['T'], wide:true, tall:true,
  html: frame('Story: six hours over the lake', `<style>
.txs8-sec{position:relative;height:calc(var(--txs-h)*3.4)}
.txs8-cv{position:absolute;inset:0;width:100%;height:100%;background:var(--raised)}
.txs8-hd{position:absolute;left:16px;top:16px;margin:0;max-width:min(380px,calc(100% - 140px))}
.txs8-hd b{display:block;font-size:15px}
.txs8-ft{position:absolute;left:16px;right:16px;bottom:16px;display:flex;align-items:center;gap:12px;padding:8px 12px}
.txs8-ft .num{flex:none;font:500 12px var(--mono)}
.txs8-tk{position:relative;flex:1;height:14px;display:flex;align-items:center;justify-content:space-between}
.txs8-tk i{width:2px;height:8px;border-radius:1px;background:#EFF2F6;opacity:.35}
.txs8-pl{position:absolute;top:0;width:2px;height:14px;border-radius:1px;background:#EFF2F6;margin-left:-1px}
</style><section class="txs8-sec"><div class="txs-pin"><canvas class="txs8-cv" role="img" aria-label="Time-lapse of a still lake from noon to golden hour, scrubbed by scroll"></canvas>
<p class="txs8-hd txs-tag"><b>Six hours over the lake</b>24 frames, one every fifteen minutes. Scroll to scrub.</p>
<div class="txs8-ft txs-tag" aria-hidden="true"><span class="num txs8-fn">01 / 24</span><span class="txs8-tk">${'<i></i>'.repeat(SEQ)}<b class="txs8-pl"></b></span><span class="num txs8-tm">12:00</span></div></div></section>
<div class="txs-body"><span class="txs-k">How the sequence plays</span><h4>Scroll is the playhead</h4><p>Each frame is a separate exposure with the sun a little lower. Scroll position picks the frame, and between two frames the page blends them by the fraction you are between, so slow scrolling stays smooth rather than stepping.</p><p>Frames are developed lazily, nearest to the playhead first.</p></div>`),
  desc:'Use when a product or place reveal should feel like video but stay under the reader’s control. 24 frames are generated from one PhotoKit scene with the sun sinking (tod 0 → 1), lazily and nearest-to-the-playhead first. Scroll position is the playhead: the follower-smoothed index picks two neighbouring frames and blends them by the fraction between, so slow scrolling never steps. The tick rail and clock follow the same index. Reduced motion shows the nearest frame without blending.',
  api:'i = p·(N − 1)   draw(frame[floor i]); alpha = frac(i); draw(frame[ceil i])   frames generated one per render, nearest first',
  init(st){
    const sec = $(st,'.txs8-sec'), hd = $(st,'.txs8-hd'), cv = $(st,'.txs8-cv'), fn = $(st,'.txs8-fn'), tm = $(st,'.txs8-tm'), pl = $(st,'.txs8-pl'), cx = cv.getContext('2d');
    let top = 0, fw = 0, fh = 0, frames = [], idx = 0, drawn = '';
    const s = story(st, s => {
      const { W, H } = s, d = DPR(); hd.style.top = W < 640 ? '46px' : '16px'; top = s.top(sec); s.len = sec.offsetHeight - H;
      cv.width = Math.round(W*d); cv.height = Math.round(H*d); drawn = '';
      const nw = Math.min(1100, Math.round(W*Math.min(d, 1.5))), nh = Math.round(nw*H/W);
      if (nw !== fw || nh !== fh){ fw = nw; fh = nh; frames = new Array(SEQ).fill(null); }
    });
    const develop = () => { if (!fw) return; let best = -1, bd = 1e9; for (let i = 0; i < SEQ; i++) if (!frames[i]){ const dd = Math.abs(i - idx) - (i === 0 || i === SEQ - 1 ? 3 : 0); if (dd < bd){ bd = dd; best = i; } }
      if (best >= 0){ frames[best] = PhotoKit.get('lake', fw, fh, { tod:best/(SEQ - 1) }); drawn = ''; } };
    const near = i => { if (frames[i]) return frames[i]; for (let k = 1; k < SEQ; k++){ if (frames[i - k]) return frames[i - k]; if (frames[i + k]) return frames[i + k]; } return null; };
    return t => {
      s.work(); const ch = s.step(t); if (!s.ok) return; develop();
      const p = s.prog(top, s.len), f = p*(SEQ - 1), i0 = Math.floor(f), i1 = Math.min(SEQ - 1, i0 + 1), a = REDUCE ? 0 : f - i0; idx = Math.round(f);
      const key = `${(REDUCE ? idx : f).toFixed(3)}|${frames.filter(Boolean).length}|${cv.width}`; if (!ch && key === drawn) return;
      if (key !== drawn){ drawn = key; const A0 = near(REDUCE ? idx : i0), A1 = frames[i1];
        if (A0){ cx.globalAlpha = 1; cx.drawImage(A0, 0, 0, cv.width, cv.height); if (A1 && a > .002){ cx.globalAlpha = a; cx.drawImage(A1, 0, 0, cv.width, cv.height); cx.globalAlpha = 1; } } }
      const done = frames.filter(Boolean).length, mins = 12*60 + f*15;
      fn.textContent = `${String(idx + 1).padStart(2, '0')} / ${SEQ}`; tm.textContent = `${Math.floor(mins/60) % 24}:${String(Math.round(mins % 60) % 60).padStart(2, '0')}`;
      pl.style.left = (f/(SEQ - 1)*100).toFixed(2) + '%';
      s.read(done < SEQ ? `Developing ${done}/${SEQ} · ${pct(p)}` : `Frame ${idx + 1}/${SEQ} · ${pct(p)}`);
    };
  }});

/* ================================================================ 9. Progress rail with optional snap */
const RC = [
  { n:'coast', h:'Horizon', b:['Put the horizon on a third, never through the middle, unless the reflection is the subject.', 'A tilted horizon reads as a mistake before it reads as a choice. Level it first, then decide.'] },
  { n:'meadow', h:'Light', b:['Side light shows texture; back light shows shape. Front light shows neither, which is why noon is hard.', 'Expose for the brightest thing you care about and let the rest fall where it falls.'] },
  { n:'field', h:'Foreground', b:['A near subject gives the eye a step into the frame. Grass, a rock or a fence post is enough.', 'Stop down to f/11 and focus a third of the way in, so the step and the distance are both sharp.'] },
  { n:'harbor', h:'Weather', b:['The best skies are the ones forecasts call bad: clearing storms, low cloud, haze after rain.', 'Stay twenty minutes after you think the light is gone. It usually comes back once, briefly.'] },
  { n:'canyon', h:'Print', b:['A print shows what a screen forgives. Shadows block up and colour shifts warm under room light.', 'Proof small, look at it in daylight for a day, then print it large.'] }];
atom({ id:'txs-chapterrail', cat:CAT, name:'Chapter rail with gentle snap', block:'article, table-of-contents, reading-progress', fam:['E','T'], wide:true, tall:true,
  html: frame('Guide: reading a landscape photograph', `<style>
.txs9-ar{padding:24px 24px 60px 214px;max-width:820px}
.txs9-ar>h3{margin:0 0 4px;font-size:28px;line-height:1.08;letter-spacing:-.035em;font-weight:600;color:var(--ink);text-wrap:balance}
.txs9-ar>p{margin:0 0 8px;color:var(--muted);font-size:14px}
.txs9-c{padding-top:18px}
.txs9-c h4{margin:0 0 8px;font-size:21px;line-height:1.15;letter-spacing:-.025em;font-weight:600;color:var(--ink)}
.txs9-c p{margin:0 0 10px;font-size:14.5px;line-height:1.6;color:var(--muted)}
.txs9-c canvas{display:block;width:100%;border-radius:10px;margin:4px 0 12px;background:var(--raised)}
.txs9-rl{position:absolute;left:0;top:0;bottom:0;width:190px;z-index:3;padding:58px 0 0 18px;display:flex;flex-direction:column;gap:4px;background:var(--card);border-right:1px solid var(--line-soft)}
.txs9-rb{all:unset;box-sizing:border-box;position:relative;display:flex;align-items:center;gap:12px;padding:6px 10px 6px 0;cursor:pointer;font-size:13.5px;color:var(--muted);border-radius:8px}
.txs9-rb:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.txs9-rb[aria-current="true"]{color:var(--ink);font-weight:500}
.txs9-tr{position:relative;flex:none;width:3px;border-radius:2px;background:var(--line);overflow:hidden}
.txs9-tr i{position:absolute;left:0;right:0;top:0;height:100%;background:var(--ink);transform-origin:50% 0;transform:scaleY(0)}
.txs9-rb .num{margin-left:auto;font-size:12px;color:var(--muted)}
.txs9-sn{position:absolute;left:12px;bottom:12px;z-index:8;display:flex;align-items:center;gap:8px;font-size:12.5px;background:var(--card)}
.txs9-f[data-n] .txs9-sn{left:auto;bottom:auto;top:8px;right:10px;padding:5px 9px}
.txs9-f[data-n] .txs-ro{top:auto;bottom:10px}
.txs9-st{display:none}
.txs9-f[data-n] .txs9-st{display:inline}
.txs9-f[data-n] .txs9-lg{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.txs9-sw{position:relative;width:28px;height:16px;border-radius:8px;background:var(--line);flex:none}
.txs9-sw i{position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:6px;background:var(--card);box-shadow:var(--shadow)}
.txs9-f[data-n] .txs9-ar{padding:58px 16px 60px}
.txs9-f[data-n] .txs9-rl{left:0;right:0;bottom:auto;width:auto;height:48px;padding:0 120px 0 12px;flex-direction:row;align-items:center;gap:4px;border-right:0;border-bottom:1px solid var(--line-soft)}
.txs9-f[data-n] .txs9-rb{flex:1;flex-direction:column;align-items:stretch;padding:8px 0;gap:0}
.txs9-f[data-n] .txs9-rb span{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.txs9-f[data-n] .txs9-tr{width:auto;height:3px!important}
.txs9-f[data-n] .txs9-tr i{transform-origin:0 50%}
.txs9-f[data-n] .txs9-ar>h3{font-size:23px}
</style><article class="txs9-ar"><span class="txs-k">Field guide</span><h3>Reading a landscape photograph</h3><p>Five things to look at, in the order your eye finds them.</p>
${RC.map((c, i) => `<section class="txs9-c"><span class="txs-k">0${i + 1}</span><h4>${c.h}</h4><canvas role="img" aria-label="Photograph: ${CAP(c.n)}"></canvas>${c.b.map(x => `<p>${x}</p>`).join('')}</section>`).join('')}</article>`,
  `<nav class="txs9-rl" aria-label="Chapters">${RC.map((c, i) => `<button type="button" class="txs9-rb" aria-current="${i === 0}"><b class="txs9-tr"><i></i></b><span>${c.h}</span><span class="num">0${i + 1}</span></button>`).join('')}</nav>
<button type="button" class="btn txs9-sn" aria-pressed="false"><span class="txs9-sw" aria-hidden="true"><i></i></span><span class="txs9-lg">Snap to chapters</span><span class="txs9-st" aria-hidden="true">Snap</span></button><p class="txs-sr" aria-live="polite"></p>`),
  desc:'Use when readers of a long guide or documentation page jump between sections. The rail shows every chapter with a bar that fills as you read it (one bar per chapter, sized to its length); clicking a chapter glides there on a soft spring. Snap is off by default; when on, it waits until you have stopped scrolling for 180ms and only pulls if a chapter start is within 22% of the view, so it settles rather than grabs, and any wheel, touch or key cancels it. Narrow, the rail becomes a segmented bar across the top. Reduced motion jumps.',
  api:'fill[i] = clamp((y + .3H − c[i])/(c[i+1] − c[i]))   idle > 180ms && |c[k] − y| < .22H ⇒ glide.set(c[k], S.soft)   input ⇒ glide.cancel()',
  init(st){
    const f = $(st,'.txs-f'), sc = $(st,'.txs-sc'), secs = $$(st,'.txs9-c'), cvs = $$(st,'.txs9-c canvas'), btns = $$(st,'.txs9-rb'), trs = $$(st,'.txs9-tr'), fills = $$(st,'.txs9-tr i'), sn = $(st,'.txs9-sn'), sw = $(st,'.txs9-sw'), knob = $(st,'.txs9-sw i'), live = $(st,'.txs-sr');
    f.classList.add('txs9-f'); const ar = $(st,'.txs9-ar');
    let cs = [], ends = [], narrow = false, snap = false, glide = null, gTo = 0, lastIn = performance.now(), down = false, cur = 0;
    const kn = new Track(0, S.snap);
    const s = story(st, s => {
      const { W, H } = s; narrow = W < 640; f.toggleAttribute('data-n', narrow);
      const iw = ar.clientWidth - (narrow ? 32 : 238), ih = Math.round(iw*.42); cvs.forEach(c => c.style.height = px(ih));
      cs = secs.map(el => s.top(el)); const max = sc.scrollHeight - H; ends = cs.map((c, i) => i < cs.length - 1 ? cs[i + 1] : max + H*.9);
      if (!narrow){ const tot = ends[ends.length - 1] - cs[0]; trs.forEach((tr, i) => tr.style.height = px(Math.max(18, 150*(ends[i] - cs[i])/tot))); }
      RC.forEach((c, i) => s.job('p' + i, () => paint(cvs[i], c.n, Math.min(560, iw), Math.min(560, iw)*.42, { tod:[.3,.6,.85,.2,.7][i] })));
    });
    const stop = () => { glide = null; };
    const go = y => { const max = sc.scrollHeight - s.H; y = clamp(y, 0, max); if (REDUCE){ sc.scrollTop = y; return; } glide = new Track(sc.scrollTop, S.soft); glide.set(y); gTo = y; };
    ['wheel','touchstart','keydown'].forEach(ev => sc.addEventListener(ev, () => { lastIn = performance.now(); stop(); }, { passive:true }));
    sc.addEventListener('pointerdown', () => { down = true; stop(); }); addEventListener('pointerup', () => { down = false; lastIn = performance.now(); });
    sc.addEventListener('scroll', () => { if (!glide) lastIn = performance.now(); }, { passive:true });
    btns.forEach((b, i) => b.onclick = () => { go(cs[i] - 8); });
    sn.onclick = () => { snap = !snap; sn.setAttribute('aria-pressed', snap); kn.set(snap ? 1 : 0); live.textContent = snap ? 'Snap to chapters on' : 'Snap to chapters off'; };
    return t => {
      s.work();
      if (glide){ const v = glide.at(t); sc.scrollTop = v; s.raw = sc.scrollTop; if (Math.abs(v - gTo) < .5){ sc.scrollTop = gTo; glide = null; } }
      else if (snap && !down && s.ok && performance.now() - lastIn > 180){ let best = null, bd = 1e9; cs.forEach(c => { const d = Math.abs(c - 8 - s.raw); if (d < bd){ bd = d; best = c - 8; } });
        if (best !== null && bd > 1 && bd < s.H*.22 && best <= sc.scrollHeight - s.H) go(best); else lastIn = Infinity; }
      const k = clamp(kn.at(t)); knob.style.transform = `translateX(${px(12*k)})`; sw.style.background = mix(k, 'var(--ink)', 'var(--line)');
      if (!s.step(t) || !s.ok) return;
      const max = Math.max(1, sc.scrollHeight - s.H), r = s.y + s.H*(.3 + .6*clamp((s.y - max + s.H)/s.H)); let act = 0;
      fills.forEach((fl, i) => { const q = clamp((r - cs[i])/(ends[i] - cs[i])); if (r >= cs[i]) act = i; fl.style.transform = narrow ? `scaleX(${q.toFixed(4)})` : `scaleY(${q.toFixed(4)})`; });
      if (act !== cur){ btns[cur].setAttribute('aria-current', 'false'); btns[act].setAttribute('aria-current', 'true'); cur = act; }
      const q = clamp((r - cs[act])/(ends[act] - cs[act]));
      s.read(`${RC[act].h} · ${act + 1} of ${RC.length} · ${pct(q)}`);
    };
  }});

/* ================================================================ 10. Contact sheet to print */
const SHEET = ['ridge','lake','dunes','city','field','coast','forest','meadow','canyon','harbor','studio','portrait'], PICK = 5;
atom({ id:'txs-contactsheet', cat:CAT, name:'Contact sheet to print', block:'gallery, case-study, media-story', fam:['M','X','T'], wide:true, tall:true,
  html: frame('Story: choosing one frame from a contact sheet', `<style>
.txs10-sec{position:relative;height:calc(var(--txs-h)*3.2)}
.txs10-pn{background:#0C1016}
.txs10-sh{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform,opacity}
.txs10-lb{position:absolute;font:500 10.5px/1 var(--mono);color:#EFF2F6;opacity:.55;white-space:nowrap}
.txs10-mk{position:absolute;overflow:visible;pointer-events:none}
.txs10-mk path{fill:none;stroke:var(--danger);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.txs10-lp{position:absolute;left:0;top:0;border-radius:50%;overflow:hidden;box-shadow:0 0 0 2px #EFF2F6,var(--shadow);will-change:transform,opacity}
.txs10-lp canvas{display:block;width:100%;height:100%}
.txs10-pr{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform;visibility:hidden}
.txs10-hd{position:absolute;z-index:2;left:16px;top:14px;margin:0;color:#EFF2F6;font-size:13px;opacity:.8}
.txs10-cap{position:absolute;left:16px;bottom:16px;margin:0}
</style><section class="txs10-sec"><div class="txs-pin txs10-pn">
<p class="txs10-hd">Roll 14 · 12 frames · Scroll to choose one</p>
<div class="txs10-sh"><canvas class="txs10-sc" role="img" aria-label="Contact sheet of twelve frames from roll 14"></canvas><svg class="txs10-mk" aria-hidden="true"><path/></svg></div>
<div class="txs10-lp" aria-hidden="true"><canvas></canvas></div>
<canvas class="txs10-pr" role="img" aria-label="Photograph: ${CAP(SHEET[PICK])}, printed"></canvas>
<p class="txs10-cap txs-tag"><b>Frame 6A · ${CAP(SHEET[PICK])}</b><br>Printed 40 × 50 cm on matte paper</p></div></section>
<div class="txs-body"><span class="txs-k">Where the print came from</span><h4>The print grows out of its own frame</h4><p>The loupe reads the sheet in order, the way an editor does, and stops on the keeper. A grease pencil marks it. Then the sheet moves toward you around that frame while the frame itself grows into the print, so you never lose track of which picture it was.</p></div>`),
  desc:'Use when a case study or portfolio piece should show the edit, not just the result. Three acts on one pinned sheet: a loupe travels the contact sheet frame by frame in reading order and settles on the keeper (0–32%); a grease-pencil box draws around it (32–46%); then the sheet pushes in around that frame and fades while the frame itself grows into the full-bleed print, so the print visibly comes from its cell (46–92%), and the caption arrives last. All of it is scrubbed by scroll. Reduced motion cuts between the three states.',
  api:'loupe = path(cells[0..PICK], ease(p/.32))   mark.dash = (p − .32)/.14   e = sine((p − .46)/.46)   print = lerp(cellRect, viewport, e)   sheet.scale = lerp(1, 1.6, e) about cell[PICK]',
  init(st){
    const sec = $(st,'.txs10-sec'), sh = $(st,'.txs10-sh'), scv = $(st,'.txs10-sc'), mk = $(st,'.txs10-mk'), mp = $(st,'.txs10-mk path'), lp = $(st,'.txs10-lp'), lcv = $(st,'.txs10-lp canvas'), pr = $(st,'.txs10-pr'), hd = $(st,'.txs10-hd'), cap = $(st,'.txs10-cap');
    const lx = lcv.getContext('2d'); let top = 0, cells = [], G = {}, labels = [], plen = 0, LP = 0, ready = false;
    const s = story(st, s => {
      const { W, H } = s, d = DPR(), cols = 4, rows = 3, gx = W < 640 ? 8 : 14, lab = 16, padX = 16, padT = 44, padB = 20;
      let cw = (W - padX*2 - gx*(cols - 1))/cols, ch = cw*H/W; const maxH = (H - padT - padB - rows*lab - gx*(rows - 1))/rows; if (ch > maxH){ ch = maxH; cw = ch*W/H; }
      const sw = cols*cw + (cols - 1)*gx, ox = (W - sw)/2, shh = rows*(ch + lab) + (rows - 1)*gx, oy = padT + Math.max(0, (H - padT - padB - shh)/2);
      G = { cw, ch, W, H }; cells = SHEET.map((_, i) => ({ x:ox + (i % cols)*(cw + gx), y:oy + Math.floor(i/cols)*(ch + lab + gx) }));
      size(scv, W, H); scv.width = Math.round(W*d); scv.height = Math.round(H*d); ready = false;
      labels.forEach(l => l.remove()); labels = cells.map((c, i) => { const l = document.createElement('span'); l.className = 'txs10-lb'; l.textContent = `${i + 1}A${i === PICK && W >= 640 ? ' · keeper' : ''}`; l.style.left = px(c.x); l.style.top = px(c.y + ch + 4); sh.appendChild(l); return l; });
      const c = cells[PICK], m = 5; mk.setAttribute('width', W); mk.setAttribute('height', H); mk.style.left = '0'; mk.style.top = '0';
      mp.setAttribute('d', `M${c.x - m + 6},${c.y - m} L${c.x + cw + m},${c.y - m + 1} L${c.x + cw + m - 1},${c.y + ch + m} L${c.x - m},${c.y + ch + m - 1} L${c.x - m + 1},${c.y - m - 4}`); plen = mp.getTotalLength();
      mp.style.strokeDasharray = plen; LP = Math.round(Math.min(120, Math.max(72, cw*.9))); size(lp, LP, LP); lcv.width = Math.round(LP*d); lcv.height = Math.round(LP*d);
      size(pr, W, H); top = s.top(sec); s.len = sec.offsetHeight - H;
      // the sheet is one canvas (so the loupe can sample it); thumbnails develop one per frame
      let left = SHEET.length; const x = scv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); x.fillStyle = '#0C1016'; x.fillRect(0, 0, W, H);
      const TOD = [.3,.1,.6,.9,.4,.5,.2,.7,.8,.35,.5,.6], k = Math.min(2, 1.5*d);
      SHEET.forEach((n, i) => s.job('t' + i, () => { x.drawImage(PhotoKit.get(n, Math.round(cw*k), Math.round(ch*k), { tod:TOD[i] }), cells[i].x, cells[i].y, cw, ch); if (--left === 0) ready = true; }));
      s.job('print', () => paint(pr, SHEET[PICK], W, H, { tod:.5 }));
    });
    return t => {
      s.work(); if (!s.step(t) || !s.ok) return;
      const { W, H } = s, p = s.prog(top, s.len), cw = G.cw, ch = G.ch;
      // act 1: loupe reads the sheet in order and lands on the keeper
      const a1 = REDUCE ? (p < .32 ? 0 : 1) : ease(p/.32), path = a1*PICK, i0 = Math.floor(path), fr = sine(path - i0), c0 = cells[i0], c1 = cells[Math.min(PICK, i0 + 1)];
      const lxp = lerp(c0.x, c1.x, fr) + cw/2, lyp = lerp(c0.y, c1.y, fr) + ch/2;
      // act 3: the keeper grows into the print, the sheet pushes in around it
      const e = REDUCE ? (p < .69 ? 0 : 1) : sine((p - .46)/.46), c = cells[PICK], k = lerp(1, 1.6, e), ax = c.x + cw/2, ay = c.y + ch/2;
      sh.style.transform = `translate(${px(ax - ax*k)},${px(ay - ay*k)}) scale(${k.toFixed(4)})`; sh.style.opacity = (1 - clamp((e - .15)/.6)).toFixed(3);
      const lo = (1 - clamp((p - .3)/.05))*(ready ? 1 : 0); lp.style.opacity = lo.toFixed(3); lp.style.visibility = lo < .01 ? 'hidden' : 'visible';
      lp.style.transform = `translate(${px(lxp - LP/2)},${px(lyp - LP/2)})`;
      if (lo > .01){ const d = DPR(), z = 2.2, sw = LP/z; lx.clearRect(0, 0, lcv.width, lcv.height); lx.drawImage(scv, (lxp - sw/2)*d, (lyp - sw/2)*d, sw*d, sw*d, 0, 0, lcv.width, lcv.height); }
      // act 2: grease pencil
      const a2 = REDUCE ? (p < .39 ? 0 : 1) : clamp((p - .32)/.14); mp.style.strokeDashoffset = (plen*(1 - a2)).toFixed(2); mk.style.opacity = a2 > 0 ? (1 - clamp(e/.3)).toFixed(3) : '0';
      const rx = lerp(c.x*k + ax - ax*k, 0, e), ry = lerp(c.y*k + ay - ay*k, 0, e), rs = lerp(cw*k/W, 1, e);
      pr.style.visibility = e > .001 ? 'visible' : 'hidden'; pr.style.transform = `translate(${px(rx)},${px(ry)}) scale(${rs.toFixed(4)})`; pr.style.borderRadius = px(lerp(3, 0, e)/rs);
      hd.style.opacity = (.8*(1 - clamp(e/.4))).toFixed(3);
      const cp = clamp((p - .88)/.1); cap.style.opacity = cp.toFixed(3); cap.style.transform = `translateY(${px((1 - ease(cp))*8)})`;
      s.read(p < .32 ? `Reading frame ${Math.min(PICK, Math.round(path)) + 1}A · ${pct(p)}` : p < .46 ? `Marking 6A · ${pct(p)}` : `Printing ${pct(e)} · ${pct(p)}`);
    };
  }});
})();