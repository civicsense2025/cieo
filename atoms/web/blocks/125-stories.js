

atom({ id:'stories', cat:'Social', name:'Story progress', block:'carousel (stories), gallery', fam:['T','S'], tall:true,
  html:`<div class="sx card" style="position:relative;width:200px;height:300px;overflow:hidden;background:var(--ink);color:var(--card);cursor:pointer;user-select:none"><div class="bars row" style="position:absolute;left:8px;right:8px;top:8px;gap:4px;z-index:2"></div><div class="pn" style="position:absolute;inset:0"></div></div><div class="hint">Tap left or right · hold to pause</div><div class="row small muted" style="gap:8px;justify-content:center"><button class="btn rp" style="padding:2px 10px">Replay</button><span>End card on finish</span></div>`,
  desc:'The current segment fills from the clock over 3 seconds; earlier ones stay full and later ones empty. Tapping a side skips with a blur swap, and holding pauses the clock for this story only. The last story settles into an end card, and replay swaps back to the start.',
  api:'fill[i] = i < cur ? 1 : i > cur ? 0 : (t − t0)/3   hold: t0 += pause',
  init(st){
    const sx = $(st,'.sx'), bars = $(st,'.bars'), pn = $(st,'.pn'), S2 = [['6:12','Fog on the river'],['6:40','First heron'],['7:05','The mill bridge'],['7:30','Bakery stop']];
    const fills = S2.map(() => { const b = document.createElement('i'); b.style.cssText = 'flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.3);overflow:hidden'; b.innerHTML = '<i style="display:block;height:100%;background:#fff;width:0"></i>'; bars.appendChild(b); return b.firstChild; });
    const panes = S2.map(([a,b],i) => { const d = document.createElement('div'); d.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;background:${['#2a3a2a','#3a3424','#26323a','#3a2a2e'][i]}`; d.innerHTML = `<span style="font-size:12px;opacity:.7">${a}</span><b style="font-size:18px">${b}</b>`; pn.appendChild(d); return d; });
    const end = document.createElement('div'); end.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px;background:#1d1d22'; end.innerHTML = '<span style="font-size:12px;opacity:.7">All caught up</span><b style="font-size:18px">End of stories</b>'; pn.appendChild(end); panes.push(end);
    const eb = document.createElement('button'); eb.className = 'btn'; eb.textContent = 'Replay'; eb.style.cssText = 'padding:6px 14px'; end.appendChild(eb);
    const N = S2.length, sw = new Swap(0); let cur = 0, t0 = 0, held = 0, pauseAt = 0, done = false;
    const go = i => { if (i >= N){ done = true; sw.to(N); t0 = now(); return; } if (i < 0) i = 0; done = false; cur = i; sw.to(cur); t0 = now(); };
    const replay = () => go(0);
    eb.onclick = e => { e.stopPropagation(); replay(); };
    $(st,'.rp').onclick = replay;
    sx.onpointerdown = () => { pauseAt = now(); held = 1; };
    sx.onpointerup = e => { const dur = now() - pauseAt; held = 0; t0 += dur; if (e.target && e.target.closest && e.target.closest('button')) return; if (dur < .25){ const r = sx.getBoundingClientRect(), fwd = e.clientX - r.left > r.width/3; if (done) go(fwd ? 0 : N - 1); else go(cur + (fwd ? 1 : -1)); } };
    sx.onpointerleave = () => { if (held){ held = 0; t0 += now() - pauseAt; } };
    return t => { const el = held ? pauseAt - t0 : t - t0; if (!held && !done && el >= 3) go(cur + 1); fills.forEach((f,i) => f.style.width = (done ? 100 : i < cur ? 100 : i > cur ? 0 : clamp(el/3)*100).toFixed(2) + '%'); panes.forEach((p,k) => sw.apply(p, k, t, 0)); };
  }});