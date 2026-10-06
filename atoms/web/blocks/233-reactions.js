atom({ id:'reactions', cat:'Video calls', name:'Reactions burst', block:'video call (reactions, emoji)', fam:['M','S'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:stretch"><b style="font-size:15px;font-weight:600;line-height:1.5">Reactions burst</b><span class="small muted" style="font-size:12px;line-height:1.5;margin-top:-4px">Tap to send some love.</span><div class="card col" style="padding:14px 16px;gap:10px"><div class="sky" style="position:relative;height:110px;border-radius:12px;background:#0C1016;overflow:hidden"><div class="pile row" style="position:absolute;left:12px;bottom:8px;gap:6px;align-items:center"></div></div><div class="row" style="gap:8px;align-items:center"><button class="btn e0" style="min-width:40px;min-height:36px;border-radius:10px;font-size:17px">❤</button><button class="btn e1" style="min-width:40px;min-height:36px;border-radius:10px;font-size:17px">👏</button><button class="btn e2" style="min-width:40px;min-height:36px;border-radius:10px;font-size:17px">🎉</button><span class="small muted nc" style="font-size:12px;margin-left:auto"></span><button class="btn cl" style="min-height:32px;border-radius:8px">Clear</button></div><div class="fin" style="position:relative;height:30px"></div><label class="row small muted" style="gap:6px;font-size:12px;border-top:1px solid var(--line-soft);padding-top:8px"><input type="checkbox" class="bg"> big float</label></div></div><div class="hint">Five reactions complete the burst</div>`,
  desc:'Each tap floats an emoji up on soft while it fades, and the pile below staggers in. Reduced motion skips the float. Five reactions pop a burst terminal; clearing empties the sky.',
  api:'float.{y,o}.set(soft)   pile[i].o.set(1, base, t0 + i*0.05)   REDUCE: jump   end: ok.set(n>=5)',
  init(st){
    const E = ['❤','👏','🎉'];
    const sky = $(st,'.sky'), pile = $(st,'.pile'), nc = $(st,'.nc'), bg = $(st,'.bg');
    const F = ['', 'Burst complete'].map((s,k) => { const e = document.createElement('span'); e.className = 'layer';
      e.innerHTML = k ? `<span class="small" style="background:color-mix(in oklab, var(--success) 12%, transparent);color:var(--success);font-weight:600;padding:4px 10px;border-radius:999px;font-size:12.5px">🎉 ${s}</span>` : s;
      $(st,'.fin').appendChild(e); return e; });
    const fsw = new Swap(0), ok = new Track(0);
    let floats = [], items = [], n = 0;
    const rise = () => bg.checked ? 80 : 46;
    const send = e => { const t0 = now(); n++;
      const f = document.createElement('span');
      f.style.cssText = `position:absolute;left:${18 + Math.random()*60}%;bottom:34px;font-size:20px;pointer-events:none`;
      f.textContent = e; sky.appendChild(f);
      const fl = { f, y:new Track(0), o:new Track(1) };
      if (REDUCE){ fl.y.jump(-rise()); fl.o.set(0, S.snap, t0); }
      else { fl.y.set(-rise(), S.soft, t0); fl.o.set(0, S.soft, t0 + .12); }
      floats.push(fl); setTimeout(() => { f.remove(); floats = floats.filter(x => x !== fl); }, REDUCE ? 200 : 950);
      const p = document.createElement('span');
      p.style.cssText = 'display:grid;place-items:center;padding:0;width:30px;height:30px;border-radius:50%;background:var(--raised);font-size:15px';
      p.textContent = e; pile.appendChild(p);
      const it = { p, y:new Track(REDUCE ? 0 : 8), o:new Track(REDUCE ? 1 : 0) };
      if (!REDUCE){ const k = Math.min(items.length, 5); it.y.set(0, S.base, t0 + k*.05); it.o.set(1, S.base, t0 + k*.05); }
      items.push(it);
      while (items.length > 6){ const old = items.shift(); old.p.remove(); }
      nc.textContent = n === 1 ? '1 reaction' : n + ' reactions';
      fsw.to(n >= 5 ? 1 : 0, t0); ok.set(n >= 5 ? 1 : 0, S.snap, t0); };
    E.forEach((e,i) => $(st,'.e' + i).onclick = () => send(e));
    $(st,'.cl').onclick = () => { n = 0; items.forEach(it => it.p.remove()); items = [];
      nc.textContent = ''; fsw.to(0); ok.set(0, S.snap); };
    return t => { floats.forEach(fl => { fl.f.style.transform = `translateY(${fl.y.at(t).toFixed(2)}px)`;
        fl.f.style.opacity = clamp(fl.o.at(t)).toFixed(3); });
      items.forEach(it => { it.p.style.opacity = clamp(it.o.at(t)).toFixed(3);
        it.p.style.transform = `translateY(${it.y.at(t).toFixed(2)}px)`; });
      F.forEach((e,k) => fsw.apply(e,k,t));
      const d = clamp(ok.at(t)), fin = $(st,'.fin');
      fin.style.opacity = d.toFixed(3); fin.style.visibility = d < .02 ? 'hidden' : 'visible'; };
  }});
