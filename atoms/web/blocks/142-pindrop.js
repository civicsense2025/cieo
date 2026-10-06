
atom({ id:'pindrop', cat:'Maps', name:'Drop a pin', block:'embed (map), booking (location)', fam:['M','X'], wide:true,
  html:`<div class="mp card" style="position:relative;width:min(600px,94%);height:230px;overflow:hidden;cursor:crosshair">${mapBg}</div><div class="row small muted" style="display:flex;align-items:center;gap:8px;width:min(600px,94%);padding:6px 2px 0;font-size:12.5px;color:var(--muted)"><span style="flex:1">Ring on drop</span><button type="button" class="btn pg-tg" style="height:28px" aria-pressed="true">Ring on</button></div><div class="hint">Click the map</div>`,
  desc:'The pin falls from above onto the spot and lands on a critically damped spring, so it settles without a bounce. Its shadow sharpens as it lands and a single ring fades out from the point.',
  api:'pin.y.set(0) from −40   shadow = prog   ring: r 0→24, o 1→0 over 0.6s',
  init(st){
    const mp = $(st,'.mp'); let pins = [], showRing = true;
    const tg = $(st,'.pg-tg');
    tg.onclick = () => { showRing = !showRing; tg.textContent = showRing ? 'Ring on' : 'Ring off'; tg.setAttribute('aria-pressed', showRing); };
    mp.onclick = e => { const r = mp.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, g = document.createElement('div'); g.style.cssText = `position:absolute;left:${x}px;top:${y}px;pointer-events:none`;
      g.innerHTML = `<i class="rg" style="position:absolute;left:0;top:0;border-radius:50%;border:2px solid var(--ink)"></i><i class="sh" style="position:absolute;left:-7px;top:-3px;width:14px;height:6px;border-radius:50%;background:rgba(0,0,0,.35)"></i><svg class="pn" width="26" height="34" viewBox="0 0 26 34" style="position:absolute;left:-13px;top:-34px"><path d="M13 33s11-12 11-20A11 11 0 0 0 2 13c0 8 11 20 11 20z" fill="var(--ink)"/><circle cx="13" cy="13" r="4" fill="var(--card)"/></svg>`;
      mp.appendChild(g); const p = { g, rg:$(g,'.rg'), sh:$(g,'.sh'), pn:$(g,'.pn'), y:new Track(-40), o:new Track(1), t:now(), leaving:false };
      pins.push(p); if (REDUCE) p.y.jump(0); else p.y.set(0, S.base);
      const live = pins.filter(q => !q.leaving);
      if (live.length > 6){ const old = live[0]; old.leaving = true;
        if (REDUCE){ old.g.remove(); pins.splice(pins.indexOf(old), 1); }
        else { old.o.set(0, S.snap); setTimeout(() => { old.g.remove(); const i = pins.indexOf(old); if (i >= 0) pins.splice(i, 1); }, 350); } } };
    return t => pins.forEach(p => { const y = p.y.at(t), k = clamp(1 + y/40), o = clamp(p.o.at(t));
      p.g.style.opacity = o.toFixed(3); p.g.style.transform = `scale(${(.85 + .15*o).toFixed(3)})`;
      p.pn.style.transform = `translateY(${px(y)})`; p.sh.style.opacity = (k*.9*o).toFixed(3); p.sh.style.transform = `scale(${(.4 + .6*k).toFixed(3)})`;
      const a = clamp((t - p.t - .15)/.6), rr = 24*a; Object.assign(p.rg.style, { width:px(rr*2), height:px(rr*2), marginLeft:px(-rr), marginTop:px(-rr), opacity:((1 - a)*(a > 0 && showRing && !REDUCE ? .7 : 0)*o).toFixed(3) }); });
  }});