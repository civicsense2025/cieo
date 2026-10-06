atom({ id:'spotlight', cat:'Video calls', name:'Stage spotlight', block:'video call (spotlight, speaker)', fam:['M','S'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:stretch"><b style="font-size:15px;font-weight:600;line-height:1.5">Stage spotlight</b><span class="small muted" style="font-size:12px;line-height:1.5;margin-top:-4px">The speaker grows; the rest make room.</span><div class="card col" style="padding:14px 16px;gap:10px"><div class="stg" style="position:relative;height:150px;border-radius:12px;background:#0C1016;overflow:hidden"></div><div class="row" style="gap:8px;align-items:center;justify-content:space-between"><span class="lb" style="position:relative;display:inline-block;min-width:150px;height:20px;font-size:13px;line-height:20px"></span><button class="btn nx" style="min-height:32px;border-radius:8px">Next speaker</button></div><div class="fin" style="position:relative;height:30px"></div><label class="row small muted" style="gap:6px;font-size:12px;border-top:1px solid var(--line-soft);padding-top:8px"><input type="checkbox" class="au"> auto-advance</label></div></div><div class="hint">Everyone speaks once to finish</div>`,
  desc:'The active tile widens on a soft spring while the previous one shrinks on base. A ring follows the speaker and the label swaps. Once everyone has spoken, a success terminal holds.',
  api:'tile.g.set(active, grow?S.soft:S.base)   label.to(i)   end: fin.to(1) + success.set(1)',
  init(st){
    const N = ['You','Maya','Theo'], CC = ['#3a4a3a','#4a4030','#30404a'];
    const stage = $(st,'.stg'), lb = $(st,'.lb'), nx = $(st,'.nx'), au = $(st,'.au'), fin = $(st,'.fin');
    const tiles = N.map((n,i) => { const d = document.createElement('div');
      d.style.cssText = `position:absolute;top:8px;bottom:8px;border-radius:10px;background:${CC[i]};color:#fff;overflow:hidden`;
      d.innerHTML = `<span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) translateY(-.5px);width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.16);display:grid;place-items:center;padding:0;font:600 15px var(--sans)">${n[0]}</span><span style="position:absolute;left:12px;bottom:8px;font-size:12px;line-height:1.45">${n}</span><i class="rg" style="position:absolute;inset:0;border-radius:10px;border:2.5px solid var(--success);opacity:0"></i>`;
      stage.appendChild(d);
      return { d, rg:d.querySelector('.rg'), g:new Track(i === 0 ? 1 : 0) }; });
    const L = N.map(n => { const e = document.createElement('span'); e.className = 'layer'; e.style.cssText = 'font-size:13px;line-height:20px;white-space:nowrap'; e.textContent = n + ' is speaking'; lb.appendChild(e); return e; });
    const sw = new Swap(0);
    const F = ['', 'Everyone spoke — nice round'].map((s,k) => { const e = document.createElement('span'); e.className = 'layer';
      e.innerHTML = k ? `<span class="small" style="background:color-mix(in oklab, var(--success) 12%, transparent);color:var(--success);font-weight:600;padding:4px 10px;border-radius:999px;font-size:12.5px">✓ ${s}</span>` : s;
      fin.appendChild(e); return e; });
    const fsw = new Swap(0), ok = new Track(0);
    let spk = 0, spoken = new Set([0]), lastA = 0;
    const go = k => { const t0 = now();
      tiles.forEach((tl,i) => tl.g.set(i === k ? 1 : 0, i === k ? S.soft : S.base, t0));
      sw.to(k, t0); spk = k; spoken.add(k);
      const done = spoken.size === N.length;
      fsw.to(done ? 1 : 0, t0); ok.set(done ? 1 : 0, S.snap, t0);
      nx.textContent = done ? 'Start over' : 'Next speaker'; };
    nx.onclick = () => { if (spoken.size === N.length){ spoken = new Set(); tiles.forEach(tl => tl.g.jump(0)); go(0); } else go((spk + 1) % N.length); };
    return t => { if (au.checked && spoken.size < N.length && t - lastA > 2.2){ lastA = t; go((spk + 1) % N.length); }
      const W = stage.clientWidth || 300, g = 6, pad = 8;
      const ws = tiles.map(tl => 1 + 1.3*clamp(tl.g.at(t)));
      const uw = (W - pad*2 - g*(N.length - 1)) / ws.reduce((a,b) => a + b, 0);
      let x = pad;
      tiles.forEach((tl,i) => { const w = ws[i]*uw;
        Object.assign(tl.d.style, { left:px(x), width:px(w) }); x += w + g;
        tl.rg.style.opacity = clamp(tl.g.at(t)).toFixed(3); });
      L.forEach((e,k) => sw.apply(e,k,t)); F.forEach((e,k) => fsw.apply(e,k,t));
      const d = clamp(ok.at(t)); fin.style.opacity = d.toFixed(3); fin.style.visibility = d < .02 ? 'hidden' : 'visible'; };
  }});
