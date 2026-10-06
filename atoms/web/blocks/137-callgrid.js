

atom({ id:'callgrid', cat:'Video calls', name:'Call grid', block:'embed (video call)', fam:['M','T','X'], wide:true, tall:true,
  html:`<div class="col" style="width:min(600px,94%);gap:8px"><div class="gd" style="position:relative;height:240px;border-radius:14px;background:#0C1016;overflow:hidden"><div class="ov" style="position:absolute;inset:0;display:grid;place-items:center;pointer-events:none"><div class="col" style="gap:8px;align-items:center"><span class="ot small" style="color:#fff;opacity:.75"></span><button class="btn rj" style="pointer-events:auto;display:none">Rejoin</button></div></div></div><div class="row" style="gap:6px;justify-content:center"><button class="btn mu" aria-pressed="false" style="display:flex;gap:6px;align-items:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/><path class="sl" d="M4 4l16 16" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg><span class="ml">Mute</span></button><button class="btn ad">Add person</button><button class="btn rm">Remove</button></div></div>`,
  desc:'When someone joins or leaves, every tile springs to its new grid slot and the newcomer scales in. A ring follows whoever is speaking, fading between people. Muting draws a slash through your mic and tints it danger. Down to one tile you are alone; emptying the grid ends the call with a Rejoin step.',
  api:'tile.{x,y,w,h}.set(slot(i, n))   ring.o.set(speaker === i)   slash.set(muted)   alone.set(n==1); ended.set(n==0)',
  init(st){
    const gd = $(st,'.gd'), mu = $(st,'.mu'), sl = $(st,'.sl'), ml = $(st,'.ml'), ov = $(st,'.ov'), ot = $(st,'.ot'), rj = $(st,'.rj'), P = ['You','Maya','Theo','Ada','Jonas','Priya','Sam'], CC = ['#3a4a3a','#4a4030','#30404a','#4a3036','#3a3a4a','#4a4a30','#304a44'];
    let tiles = []; const muted = new Track(0), alo = new Track(0), end = new Track(0);
    const add = inst => { if (tiles.length >= P.length) return; const i = tiles.length, d = document.createElement('div'); d.style.cssText = `position:absolute;left:0;top:0;border-radius:10px;background:${CC[i]};color:#fff;overflow:hidden`;
      d.innerHTML = `<span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.15);display:grid;place-items:center;font:600 15px var(--sans)">${P[i][0]}</span><span style="position:absolute;left:8px;bottom:6px;font:500 11.5px var(--sans)">${P[i]}</span><i class="rg" style="position:absolute;inset:0;border-radius:10px;border:2.5px solid var(--success);opacity:0"></i>`;
      gd.appendChild(d); const tl = { d, rg:$(d,'.rg'), x:new Track(0), y:new Track(0), w:new Track(0), h:new Track(0), o:new Track(inst ? 1 : 0), sp:new Track(0) }; tiles.push(tl); if (!inst) tl.o.set(1); lay(inst, tl); };
    const lay = (inst, fresh) => { const n = tiles.length; if (!n) return; const W = gd.clientWidth, H = gd.clientHeight, cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n/cols), g = 6, cw = (W - g*(cols + 1))/cols, ch = (H - g*(rows + 1))/rows;
      tiles.forEach((tl,i) => { const r = Math.floor(i/cols), inRow = r === rows - 1 ? n - r*cols : cols, off = (W - inRow*cw - (inRow + 1)*g)/2, x = off + g + (i % cols)*(cw + g), y = g + r*(ch + g);
        const k = inst || tl === fresh ? 'jump' : 'set'; tl.x[k](x); tl.y[k](y); tl.w[k](cw); tl.h[k](ch); }); };
    $(st,'.ad').onclick = () => add(false); $(st,'.rm').onclick = () => { if (!tiles.length) return; const tl = tiles.pop(); tl.o.set(0, S.snap); tl.gone = now(); lay(false); setTimeout(() => tl.d.remove(), 400/clock.scale); ghosts.push(tl); };
    rj.onclick = () => { if (tiles.length) return; add(false); setTimeout(() => add(false), 120); setTimeout(() => add(false), 240); };
    mu.onclick = () => { const m = !muted.target; muted.set(m ? 1 : 0); mu.setAttribute('aria-pressed', m); ml.textContent = m ? 'Unmute' : 'Mute'; };
    let ghosts = [], spk = -1; requestAnimationFrame(() => { add(true); add(true); add(true); });
    let wantA = -1, wantE = -1;
    return t => { const s = tiles.length > 1 ? 1 + Math.floor(t/2.2) % (tiles.length - 1) : -1; if (s !== spk){ spk = s; tiles.forEach((tl,i) => tl.sp.set(i === s ? 1 : 0)); }
      const wa = tiles.length === 1 ? 1 : 0, we = tiles.length === 0 ? 1 : 0;
      if (wa !== wantA || we !== wantE){ wantA = wa; wantE = we; alo.set(wa, S.base); end.set(we, S.base);
        ot.textContent = we ? 'Call ended' : wa ? 'Alone in this call' : ''; rj.style.display = we ? '' : 'none'; }
      ghosts = ghosts.filter(g => g.d.isConnected); [...tiles, ...ghosts].forEach(tl => { const o = clamp(tl.o.at(t)); Object.assign(tl.d.style, { left:px(tl.x.at(t)), top:px(tl.y.at(t)), width:px(tl.w.at(t)), height:px(tl.h.at(t)), opacity:o.toFixed(3), transform:`scale(${(.9 + .1*o).toFixed(4)})` }); tl.rg.style.opacity = clamp(tl.sp.at(t)).toFixed(3); });
      const vo = Math.max(clamp(alo.at(t)), clamp(end.at(t))); ov.style.opacity = vo.toFixed(3); ov.style.visibility = vo < .02 ? 'hidden' : 'visible';
      const m = clamp(muted.at(t)); sl.style.strokeDashoffset = (1 - m).toFixed(3); mu.style.color = mix(m,'var(--danger)','var(--ink)'); mu.style.borderColor = mix(m,'var(--danger)','var(--line)'); };
  }});