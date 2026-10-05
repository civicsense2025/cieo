

/* ---- film tools: device tests for a Web Animations film (iris A/B, interruptible scrub) ----
   These two atoms drive real Web Animations instead of the page clock, because what they
   measure is how the browser's own animation engine behaves on a real device. */
(() => {
const PH = (n, o) => `url(${PhotoKit.url(n, 960, 600, o)})`;
const mk = (tag, cls, css = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) e.style.cssText = css; return e; };
// between two keyframes a→b, scale·counter-scale peaks mid-way at (r−1)²/(4r), r = b/a: drift depends only on the step ratio
const driftOf = ss => { let w = 0; for (let i = 1; i < ss.length; i++){ const r = Math.max(ss[i]/ss[i - 1], ss[i - 1]/ss[i]); w = Math.max(w, (r - 1)**2/(4*r)); } return w; };
const inOut = t => (t < .5 ? 4*t*t*t : 1 - (-2*t + 2)**3/2);
const kf = list => ({ mask:list.map(([o, s]) => ({ offset:o, transform:`scale(${s.toFixed(5)})` })), media:list.map(([o, s]) => ({ offset:o, transform:`scale(${(1/s).toFixed(5)})` })), ss:list.map(x => x[1]) });
// evenly spaced samples (what maskFrames does today)
const frames = (from, to, steps, curve = inOut) => kf(Array.from({ length:steps + 1 }, (_, i) => [i/steps, from + (to - from)*curve(i/steps)]));
// ratio-bounded samples: emit a keyframe whenever scale has changed by rmax since the last one
const adaptive = (from, to, curve = inOut, rmax = 1.06) => { const L = [[0, from]]; let last = from;
  for (let i = 1; i <= 800; i++){ const o = i/800, s = from + (to - from)*curve(o); if (Math.max(s/last, last/s) >= rmax || i === 800){ L.push([o, s]); last = s; } } return kf(L); };

atom({ id:'irisab', cat:'Image transitions', name:'Iris A/B: counter-scale vs clip-path', block:'film-timeline iris (device test)', fam:['M','T'], wide:true, tall:true,
  html:`<style>
.fia-w{position:absolute;inset:0;container-type:inline-size}
.fia{position:absolute;inset:0;display:flex;flex-direction:column;gap:10px;padding:12px;text-align:left;font-size:13px}
.fia-ct{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}
.fia-ct label{display:inline-flex;align-items:center;gap:6px;color:var(--muted)}
.fia-sg{display:inline-flex;background:var(--raised);border-radius:8px;padding:2px}
.fia-sg button{border:0;background:none;border-radius:6px;padding:4px 9px;font-size:12.5px;color:var(--muted);cursor:pointer}
.fia-sg button[aria-pressed=true]{background:var(--card);color:var(--ink);box-shadow:var(--shadow)}
.fia-pn{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fia-p{display:flex;flex-direction:column;gap:6px;min-width:0;min-height:0}
.fia-p b{font-size:13px}
.fia-bx{position:relative;flex:1;min-height:120px;border-radius:10px;overflow:hidden;background:#0c1016 center/cover;isolation:isolate}
.fia-ir{position:absolute;border-radius:50%;overflow:hidden;will-change:transform}
.fia-md{position:absolute;background:center/cover;will-change:transform}
.fia-cp{position:absolute;inset:0;background:center/cover;will-change:clip-path}
.fia-rd{font:12px/1.5 var(--mono);color:var(--muted);font-variant-numeric:tabular-nums}
.fia-rd em{font-style:normal;color:var(--ink)}
.fia-note{font-size:12.5px;color:var(--muted);line-height:1.45}
@container (max-width:620px){.fia-pn{grid-template-columns:1fr}.fia-bx{min-height:150px}}
</style><div class="fia-w"><div class="fia">
<div class="fia-ct"><button type="button" class="btn ink fia-go">Play both</button>
<span class="fia-sg" data-k="steps" role="group" aria-label="Keyframe samples"><button type="button" data-v="16" aria-pressed="true">16 samples</button><button type="button" data-v="48" aria-pressed="false">48</button><button type="button" data-v="adapt" aria-pressed="false">Ratio-bounded</button></span>
<span class="fia-sg" data-k="from" role="group" aria-label="Start size"><button type="button" data-v=".04" aria-pressed="true">Start 4%</button><button type="button" data-v=".12" aria-pressed="false">12%</button></span>
<label><input type="checkbox" class="fia-busy"> Busy main thread (12ms/frame)</label></div>
<div class="fia-pn"><div class="fia-p"><b>Counter-scaled circle (transform only)</b><div class="fia-bx" data-k="cs"></div><div class="fia-rd" data-k="cs"></div></div>
<div class="fia-p"><b>clip-path: circle()</b><div class="fia-bx" data-k="cp"></div><div class="fia-rd" data-k="cp"></div></div></div>
<div class="fia-note"></div></div></div>`,
  desc:'A device test for an iris that opens from a ballot oval. The left pane scales a round window up while scaling the photo inside it down by the inverse (two Web Animations, transform only, so the compositor runs them). The right pane animates clip-path: circle(), which Safari and most browsers repaint on the main thread. Turn on Busy main thread to burn 12ms of every frame: the transform iris keeps its pace while the clip-path iris stutters. The drift readout shows how far the photo inside the counter-scaled window wanders between keyframe samples, and Ratio-bounded places keyframes so no two neighbours differ by more than 6% in scale, which keeps drift under a tenth of a percent. Open this on the real phone; the frame gaps shown are main-thread gaps.',
  api:'mask: scale(s)  media: scale(1/s) about the focal point · keyframe whenever s changes 6% · drift = (r−1)²/4r · clip-path: circle(r at fx fy) for comparison',
  init(st){
    const go = $(st,'.fia-go'), busy = $(st,'.fia-busy'), note = $(st,'.fia-note'); const opt = { steps:'16', from:.04 };
    $$(st,'.fia-sg').forEach(g => $$(g,'button').forEach(b => b.onclick = () => { $$(g,'button').forEach(x => x.setAttribute('aria-pressed', x === b)); opt[g.dataset.k] = g.dataset.k === 'from' ? +b.dataset.v : b.dataset.v; build(); }));
    const P = { cs:{ bx:$(st,'.fia-bx[data-k=cs]'), rd:$(st,'.fia-rd[data-k=cs]'), anims:[] }, cp:{ bx:$(st,'.fia-bx[data-k=cp]'), rd:$(st,'.fia-rd[data-k=cp]'), anims:[] } };
    const A = PH('city'), B = PH('harbor', { tod:1 }); let meter = null;
    const build = () => {
      Object.values(P).forEach(p => { p.anims.forEach(a => a.cancel()); p.anims = []; p.bx.replaceChildren(); p.bx.style.backgroundImage = A; });
      const W = P.cs.bx.clientWidth, H = P.cs.bx.clientHeight; if (!W || !H) return;
      const fx = W*.38, fy = H*.56, R = Math.hypot(Math.max(fx, W - fx), Math.max(fy, H - fy)), D = R*2, steps = opt.steps === '48' ? 48 : 16, log = opt.steps === 'log';
      const ir = mk('div', 'fia-ir', `width:${D}px;height:${D}px;left:${fx - R}px;top:${fy - R}px`), md = mk('div', 'fia-md', `left:${R - fx}px;top:${R - fy}px;width:${W}px;height:${H}px;transform-origin:${fx}px ${fy}px`);
      md.style.backgroundImage = B; ir.appendChild(md); P.cs.bx.appendChild(ir); P.cs.ir = ir; P.cs.md = md;
      const cp = mk('div', 'fia-cp'); cp.style.backgroundImage = B; cp.style.clipPath = `circle(${(R*opt.from).toFixed(1)}px at ${fx}px ${fy}px)`; P.cp.bx.appendChild(cp); P.cp.el = cp;
      const f = opt.steps === 'adapt' ? adaptive(opt.from, 1) : frames(opt.from, 1, steps), dur = 1400, o = { duration:dur, easing:'linear', fill:'both' };
      P.cs.anims = [ir.animate(f.mask, o), md.animate(f.media, o)];
      P.cp.anims = [cp.animate(f.mask.map(k => ({ offset:k.offset, clipPath:`circle(${(R*parseFloat(k.transform.slice(6))).toFixed(1)}px at ${fx}px ${fy}px)` })), o)];
      Object.values(P).forEach(p => p.anims.forEach(a => { a.pause(); a.currentTime = 0; }));
      const pct = v => (100*v).toFixed(v < .01 ? 2 : 1) + '%', ad = adaptive(opt.from, 1);
      note.textContent = `Photo drift inside the counter-scaled window: ${pct(driftOf(f.ss))} with ${f.ss.length} keyframes. Between two keyframes the drift peaks at (r−1)²/4r, where r is the scale ratio between them, so it only depends on that ratio. Even 16 gives ${pct(driftOf(frames(opt.from, 1, 16).ss))}, even 48 gives ${pct(driftOf(frames(opt.from, 1, 48).ss))}, ratio-bounded (a keyframe every 6% of scale) gives ${pct(driftOf(ad.ss))} with ${ad.ss.length} keyframes. The counter layer starts at ${(1/opt.from).toFixed(0)}x; past about 10x iOS may draw it soft for the first frames, so starting at 12% and hiding the window below that is safer.`;
      P.cs.rd.textContent = P.cp.rd.textContent = 'Press Play both.';
    };
    go.onclick = () => { Object.values(P).forEach(p => p.anims.forEach(a => { a.currentTime = 0; a.play(); })); meter = { t0:performance.now(), last:null, n:0, worst:0, gaps:0, done:false }; };
    new ResizeObserver(() => build()).observe(P.cs.bx); requestAnimationFrame(build);
    return () => {
      if (busy.checked && meter && !meter.done){ const s = performance.now(); while (performance.now() - s < 12); }
      if (!meter || meter.done) return; const t = performance.now();
      if (meter.last !== null){ const d = t - meter.last; meter.n++; meter.worst = Math.max(meter.worst, d); if (d > 20) meter.gaps++; } meter.last = t;
      const fin = P.cs.anims.every(a => a.playState === 'finished');
      const msg = `main-thread frames <em>${meter.n}</em> · worst gap <em>${meter.worst.toFixed(0)}ms</em> · gaps over 20ms <em>${meter.gaps}</em>`;
      P.cs.rd.innerHTML = msg + ' · runs on the compositor'; P.cp.rd.innerHTML = msg + ' · repaints on the main thread';
      if (fin) meter.done = true;
    };
  }
});

atom({ id:'filmscrub', cat:'Image transitions', name:'Interruptible film scrub', block:'history-film chapter rail (device test)', fam:['D','T'], wide:true, tall:true,
  html:`<style>
.fsc-w{position:absolute;inset:0;container-type:inline-size}
.fsc{position:absolute;inset:0;display:flex;flex-direction:column;gap:10px;padding:12px;text-align:left;font-size:13px}
.fsc-st{position:relative;flex:1;min-height:0;border-radius:10px;overflow:hidden;background:#0c1016;isolation:isolate}
.fsc-sc{position:absolute;inset:0;background:center/cover;will-change:transform}
.fsc-ir{position:absolute;border-radius:50%;overflow:hidden;will-change:transform}
.fsc-md{position:absolute;background:center/cover;will-change:transform}
.fsc-ink{position:absolute;border-radius:50%;background:#10141a;will-change:transform}
.fsc-cap{position:absolute;left:14px;bottom:12px;color:#fff;font-weight:600;font-size:15px;text-shadow:0 1px 8px rgba(0,0,0,.45)}
.fsc-rl{position:relative;height:44px;touch-action:none;cursor:pointer;outline:none}
.fsc-rl:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:8px}
.fsc-ch{position:absolute;top:18px;height:3px;border-radius:2px;background:var(--line)}
.fsc-fl{position:absolute;left:0;top:0;bottom:0;border-radius:2px;background:var(--ink)}
.fsc-lb{position:absolute;top:26px;font-size:11.5px;color:var(--muted);white-space:nowrap}
.fsc-hd{position:absolute;top:10px;width:3px;height:19px;margin-left:-1.5px;border-radius:2px;background:var(--ink)}
.fsc-ct{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}
.fsc-sg{display:inline-flex;background:var(--raised);border-radius:8px;padding:2px}
.fsc-sg button{border:0;background:none;border-radius:6px;padding:4px 9px;font-size:12.5px;color:var(--muted);cursor:pointer}
.fsc-sg button[aria-pressed=true]{background:var(--card);color:var(--ink);box-shadow:var(--shadow)}
.fsc-rd{font:12px/1.5 var(--mono);color:var(--muted);font-variant-numeric:tabular-nums}
@container (max-width:520px){.fsc-lb{display:none}}
</style><div class="fsc-w"><div class="fsc"><div class="fsc-st"></div>
<div class="fsc-rl" role="slider" tabindex="0" aria-label="Film position" aria-valuemin="0" aria-valuemax="8000"></div>
<div class="fsc-ct"><button type="button" class="btn ink fsc-pp">Pause</button><span class="fsc-sg" role="group" aria-label="Chapter click"><button type="button" data-v="glide" aria-pressed="true">Chapter click glides</button><button type="button" data-v="cut" aria-pressed="false">Cuts</button></span><span class="fsc-rd"></span></div></div></div>`,
  desc:'A four-chapter film on one Web Animations clock (push, iris, ink flood) with a chapter rail you can drag. Pressing the rail pauses every animation and hands the playhead to a critically damped follower, so dragging feels smooth even when the pointer jitters, and a fast flick coasts a little further. Releasing resumes playback only if the film was playing. Only animations whose scene overlaps the playhead get currentTime written each frame, which keeps a long film cheap to scrub. Chapter clicks can glide or cut; arrow keys step a second, Home and End jump to the ends.',
  api:'down: pause all, target = x→ms · frame: cur += (target − cur)(1 − e^(−18dt)); a.currentTime = cur for live scenes · up: target += v·0.15, resume if was playing',
  init(st){
    const stg = $(st,'.fsc-st'), rl = $(st,'.fsc-rl'), pp = $(st,'.fsc-pp'), rd = $(st,'.fsc-rd'), DUR = 8000;
    const CH = [{ s:0, l:'1 · The ballot' }, { s:2000, l:'2 · Counted' }, { s:4000, l:'3 · Certified' }, { s:6000, l:'4 · Seated' }];
    let anims = [], cur = 0, target = 0, held = false, was = true, playing = true, mode = 'glide', lastT = null, lastX = 0, lastXt = 0, vx = 0, resumeAt = null;
    const fill = []; CH.forEach((c, i) => { const ch = mk('div', 'fsc-ch'), f = mk('div', 'fsc-fl'), lb = mk('div', 'fsc-lb'); lb.textContent = c.l; ch.appendChild(f); rl.append(ch, lb); fill.push({ ch, f, lb, s:c.s, e:CH[i + 1]?.s ?? DUR }); });
    const head = mk('div', 'fsc-hd'); rl.appendChild(head);
    const cap = mk('div', 'fsc-cap');
    const build = () => {
      anims.forEach(x => x.a.cancel()); anims = []; stg.replaceChildren();
      const W = stg.clientWidth, H = stg.clientHeight; if (!W) return;
      const sc = ['ridge', 'city', 'harbor', 'field'].map((n, i) => { const e = mk('div', 'fsc-sc'); e.style.backgroundImage = PH(n, { tod:i === 3 ? 1 : 0 }); return e; });
      stg.append(sc[0], sc[1]); const fx = W*.62, fy = H*.45, R = Math.hypot(Math.max(fx, W - fx), Math.max(fy, H - fy));
      const ir = mk('div', 'fsc-ir', `width:${2*R}px;height:${2*R}px;left:${fx - R}px;top:${fy - R}px`), md = mk('div', 'fsc-md', `left:${R - fx}px;top:${R - fy}px;width:${W}px;height:${H}px;transform-origin:${fx}px ${fy}px`);
      md.style.backgroundImage = sc[2].style.backgroundImage; ir.appendChild(md); stg.appendChild(ir); stg.appendChild(sc[3]);
      const ink = mk('div', 'fsc-ink', `width:${2.4*R}px;height:${2.4*R}px;left:${W*.2 - 1.2*R}px;top:${H*.8 - 1.2*R}px`); stg.append(ink, cap);
      // a second animation on the same element must not fill backwards, or its first frame covers the earlier one
      const add = (el, kf, start, dur, easing = 'cubic-bezier(.65,0,.35,1)', scene, fill = 'both') => { const a = el.animate(kf, { duration:dur, delay:start, easing, fill }); a.pause(); anims.push({ a, s:start, e:start + dur, scene }); };
      add(sc[1], [{ transform:'translateX(100%)' }, { transform:'translateX(0)' }], 2000, 700, undefined, 1);
      add(sc[0], [{ transform:'translateX(0)' }, { transform:'translateX(-30%)' }], 2000, 700, undefined, 0);
      const f = adaptive(.12, 1); add(ir, f.mask, 4000, 900, 'linear', 2); add(md, f.media, 4000, 900, 'linear', 2);
      add(ink, [{ transform:'scale(0)' }, { transform:'scale(1)' }], 6000, 600, 'cubic-bezier(.4,0,.2,1)', 3);
      add(sc[3], [{ opacity:0 }, { opacity:1 }], 6590, 20, 'linear', 3);
      add(ink, [{ transform:'scale(1)' }, { transform:'scale(0)' }], 6600, 600, 'cubic-bezier(.4,0,.2,1)', 3, 'forwards');
      seekAll(cur, true); if (playing && !held) anims.forEach(x => x.a.play());
    };
    // write currentTime only to animations whose window is near the playhead (all on a hard seek)
    const seekAll = (ms, all) => { let n = 0; for (const x of anims){ if (all || (ms > x.s - 400 && ms < x.e + 400) || x.a.currentTime === null){ x.a.currentTime = ms; n++; } } return n; };
    const at = e => { const r = rl.getBoundingClientRect(); return clamp((e.clientX - r.left)/r.width)*DUR; };
    const label = ms => { const i = CH.findLastIndex(c => ms >= c.s); return `${CH[i].l}, ${(ms/1000).toFixed(1)} of 8 seconds`; };
    const setPlay = p => { playing = p; pp.textContent = p ? 'Pause' : 'Play'; if (p){ if (cur >= DUR - 5){ cur = target = 0; seekAll(0, true); } anims.forEach(x => { x.a.currentTime = cur; x.a.play(); }); } else anims.forEach(x => x.a.pause()); };
    pp.onclick = () => setPlay(!playing);
    $$(st,'.fsc-sg button').forEach(b => b.onclick = () => { $$(st,'.fsc-sg button').forEach(x => x.setAttribute('aria-pressed', x === b)); mode = b.dataset.v; });
    rl.addEventListener('pointerdown', e => { rl.setPointerCapture(e.pointerId); held = true; was = playing; resumeAt = null; anims.forEach(x => x.a.pause()); playing = false; cur = anims[0]?.a.currentTime ?? cur;
      const ms = at(e), r = rl.getBoundingClientRect(), near = CH.find(c => Math.abs(c.s/DUR*r.width - (e.clientX - r.left)) < 10);
      target = near ? near.s + 1400 : ms; if (near && mode === 'cut'){ cur = target; seekAll(cur, true); } lastX = e.clientX; lastXt = performance.now(); vx = 0; });
    rl.addEventListener('pointermove', e => { if (!held) return; const t = performance.now(), dt = Math.max(1, t - lastXt); vx = .7*vx + .3*((e.clientX - lastX)/dt); lastX = e.clientX; lastXt = t; target = at(e); });
    const up = () => { if (!held) return; held = false; const w = rl.getBoundingClientRect().width; target = clamp(target + vx*1000*.15/w*DUR, 0, DUR); resumeAt = was ? 'settle' : null; pp.textContent = was ? 'Pause' : 'Play'; };
    rl.addEventListener('pointerup', up); rl.addEventListener('pointercancel', up);
    rl.addEventListener('keydown', e => { const k = { ArrowRight:1000, ArrowLeft:-1000, PageUp:2000, PageDown:-2000 }[e.key]; if (k === undefined && e.key !== 'Home' && e.key !== 'End') return; e.preventDefault();
      was = playing; anims.forEach(x => x.a.pause()); playing = false; target = e.key === 'Home' ? 0 : e.key === 'End' ? DUR : clamp(target + k, 0, DUR); resumeAt = was ? 'settle' : null; });
    new ResizeObserver(() => build()).observe(stg); requestAnimationFrame(build);
    return () => {
      const t = performance.now(), dt = lastT === null ? 0 : Math.min(.05, (t - lastT)/1000); lastT = t; let n = 0;
      if (playing){ cur = anims[0]?.a.currentTime ?? cur; target = cur; if (cur >= DUR){ playing = false; pp.textContent = 'Replay'; } }
      else if (Math.abs(target - cur) > .5){ cur += (target - cur)*(1 - Math.exp(-18*dt)); n = seekAll(cur); }
      else if (cur !== target){ cur = target; n = seekAll(cur); }
      else if (resumeAt === 'settle' && !held){ resumeAt = null; setPlay(true); }
      const p = cur/DUR, w = rl.clientWidth; head.style.left = px(p*w);
      fill.forEach(c => { c.ch.style.left = px(c.s/DUR*w + 2); c.ch.style.width = px((c.e - c.s)/DUR*w - 4); c.lb.style.left = px(c.s/DUR*w + 2); c.f.style.width = (clamp((cur - c.s)/(c.e - c.s))*100).toFixed(1) + '%'; });
      rl.setAttribute('aria-valuenow', Math.round(cur)); rl.setAttribute('aria-valuetext', label(cur)); cap.textContent = CH[CH.findLastIndex(c => cur >= c.s)].l.slice(4);
      rd.textContent = held || n ? `following · ${n} of ${anims.length} animations written this frame` : playing ? 'playing on the Web Animations clock' : 'paused';
    };
  }
});
})();