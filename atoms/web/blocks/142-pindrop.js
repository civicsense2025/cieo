
atom({ id:'pindrop', cat:'Maps', name:'Drop a pin', block:'embed (map), booking (location)', fam:['M','X'], wide:true,
  html:`<div class="mp card" style="position:relative;width:min(600px,94%);height:230px;overflow:hidden;cursor:crosshair">${mapBg}</div><div class="hint">Click the map</div>`,
  desc:'The pin falls from above onto the spot and lands on a critically damped spring, so it settles without a bounce. Its shadow sharpens as it lands and a single ring fades out from the point.',
  api:'pin.y.set(0) from −40   shadow = prog   ring: r 0→24, o 1→0 over 0.6s',
  init(st){
    const mp = $(st,'.mp'); let pins = [];
    mp.onclick = e => { const r = mp.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, g = document.createElement('div'); g.style.cssText = `position:absolute;left:${x}px;top:${y}px;pointer-events:none`;
      g.innerHTML = `<i class="rg" style="position:absolute;left:0;top:0;border-radius:50%;border:2px solid var(--ink)"></i><i class="sh" style="position:absolute;left:-7px;top:-3px;width:14px;height:6px;border-radius:50%;background:rgba(0,0,0,.35)"></i><svg class="pn" width="26" height="34" viewBox="0 0 26 34" style="position:absolute;left:-13px;top:-34px"><path d="M13 33s11-12 11-20A11 11 0 0 0 2 13c0 8 11 20 11 20z" fill="var(--ink)"/><circle cx="13" cy="13" r="4" fill="var(--card)"/></svg>`;
      mp.appendChild(g); pins.push({ g, rg:$(g,'.rg'), sh:$(g,'.sh'), pn:$(g,'.pn'), y:new Track(-40), t:now() }); pins[pins.length - 1].y.set(0); if (pins.length > 6) pins.shift().g.remove(); };
    return t => pins.forEach(p => { const y = p.y.at(t), k = clamp(1 + y/40); p.pn.style.transform = `translateY(${px(y)})`; p.sh.style.opacity = (k*.9).toFixed(3); p.sh.style.transform = `scale(${(.4 + .6*k).toFixed(3)})`;
      const a = clamp((t - p.t - .15)/.6), rr = 24*a; Object.assign(p.rg.style, { width:px(rr*2), height:px(rr*2), marginLeft:px(-rr), marginTop:px(-rr), opacity:((1 - a)*(a > 0 ? .7 : 0)).toFixed(3) }); });
  }});