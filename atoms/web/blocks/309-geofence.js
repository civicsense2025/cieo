atom({ id:'geofence', cat:'Maps', name:'Geofence ring', block:'geofence, proximity', fam:['M'], wide:true,
  html:`<div class="mp card" style="position:relative;width:min(560px,94%);height:240px;overflow:hidden">${mapBg}<div class="gf" style="position:absolute;left:50%;top:46%;width:150px;height:150px;margin:-75px;pointer-events:none"><i class="pulse" style="position:absolute;inset:0;border-radius:50%;border:2px solid var(--accent)"></i><i class="ring" style="position:absolute;inset:14px;border-radius:50%;border:2px dashed var(--ink);opacity:.7"></i><span class="lb" style="position:absolute;inset:0;display:grid;place-items:center"><b class="st" style="position:relative;font-size:14px;min-width:76px;text-align:center"></b></span></div><i class="dot" style="position:absolute;left:50%;top:46%;width:12px;height:12px;margin:-6px;border-radius:50%;background:var(--ink);border:2px solid var(--card)"></i></div><div class="row small muted" style="display:flex;align-items:center;gap:8px;width:min(560px,94%);padding:6px 2px 0;font-size:12.5px;color:var(--muted)"><span style="flex:1">Exit reverses the breach</span><button type="button" class="btn pg-tg" style="height:32px;border-radius:9px" aria-pressed="false">Wide ring</button></div><div class="hint">Tap the map to enter or leave</div>`,
  desc:'Entering snaps two pulses out from the ring, then the ring settles soft and the label swaps to Inside. Leaving runs the same motion in reverse and rests Outside.',
  api:'breach: pulse.set(1,snap) x2 then ring.set(1,soft)   st.to(inside)   exit reverses',
  init(st){
    const mp = $(st,'.mp'), lb = $(st,'.st'), gf = $(st,'.gf'), pulse = $(st,'.pulse'), dot = $(st,'.dot');
    const L = ['Outside','Inside'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.fontSize = '14px'; e.textContent = s; lb.appendChild(e); return e; });
    const sw = new Swap(0), ring = new Track(0), pl = new Track(0); let inside = false, wide = false, pt = -9;
    const tg = $(st,'.pg-tg');
    tg.onclick = () => { wide = !wide; tg.textContent = wide ? 'Narrow ring' : 'Wide ring'; tg.setAttribute('aria-pressed', wide); const s = wide ? 190 : 150; gf.style.width = px(s); gf.style.height = px(s); gf.style.margin = px(-s/2); };
    mp.onclick = () => { inside = !inside; const t0 = now(); pt = t0;
      if (REDUCE){ ring.jump(inside ? 1 : 0); pl.jump(0); }
      else { pl.jump(0); pl.set(1, S.snap, t0); ring.set(inside ? 1 : 0, inside ? S.soft : S.base, t0 + .12); }
      sw.to(inside ? 1 : 0); };
    return t => { const r = clamp(ring.at(t)), p = clamp(pl.at(t)), age = t - pt;
      const second = clamp((age - .18)/.5);
      pulse.style.transform = `scale(${(.82 + .5*p + .18*r).toFixed(3)})`; pulse.style.opacity = (clamp(1-p*.4)*(0.35+.65*r)).toFixed(3);
      pulse.style.boxShadow = second > 0 && second < 1 && !REDUCE ? `0 0 0 ${(second*22).toFixed(1)}px color-mix(in oklab, var(--accent) ${(60*(1-second)).toFixed(0)}%, transparent)` : 'none';
      dot.style.transform = `translateY(${(-r*6).toFixed(2)}px) scale(${(.9+.2*r).toFixed(3)})`;
      L.forEach((e,k) => sw.apply(e,k,t)); };
  }});
