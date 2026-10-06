atom({ id:'streak', cat:'Writing', name:'Streak ring', block:'streak ring, habit dots, writing stats', fam:['M','S'],
  html:`<div class="col" style="align-items:center;gap:12px"><div class="row" style="gap:14px;align-items:center"><svg class="rg" width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="30" fill="none" stroke="var(--line)" stroke-width="9"/><circle class="arc" cx="42" cy="42" r="30" fill="none" stroke="var(--ink)" stroke-width="9" stroke-linecap="round" transform="rotate(-90 42 42)"/></svg><div class="col" style="gap:4px"><b class="ct" style="font-size:30px;letter-spacing:-.02em"></b><span class="lb small muted" style="position:relative;height:18px;display:block;overflow:hidden"></span></div></div><div class="dots row" style="gap:8px"></div><div class="seg pt"><button class="wk">Week</button><button class="mo">Month</button></div></div><div class="hint">Tap Week / Month</div>`,
  desc:'The ring fills to its new share. The week dots ink one after another. The day count rolls over. Flipping weeks and months swaps the caption while the ring and dots replay.',
  api:'ring.set(share, soft)   dot[i].set(1, base, t0+i*.04)   count.set(days)   cap.to(mode)',
  init(st){
    const arc = $(st,'.arc'), C = 2*Math.PI*30; arc.style.strokeDasharray = C.toFixed(1);
    const dots = Array.from({length:7}, () => { const d = document.createElement('span'); Object.assign(d.style,{width:'14px',height:'14px',borderRadius:'50%',border:'2px solid var(--ink)'}); $(st,'.dots').appendChild(d); return d; });
    const dg = new Digits($(st,'.ct'), 2), lb = $(st,'.lb');
    const L = ['5 days this week','18 days this month'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; lb.appendChild(e); return e; });
    const ring = new Track(0, S.soft), dk = dots.map(() => new Track(0)), cap = new Swap(0);
    const D = [[1,1,1,1,1,0,0,'12'],[1,1,1,1,1,1,0,'18']], SH = [.71,.6]; let m = 0;
    const go = k => { m = k; const t0 = now(); ring.set(SH[k], S.soft); dg.set(D[k][7]); cap.to(k);
      D[k].slice(0,7).forEach((v,i) => dk[i].set(v, S.base, t0 + i*.04)); };
    $(st,'.wk').onclick = () => go(0); $(st,'.mo').onclick = () => go(1);
    dg.set('12', true); go(0);
    return t => { arc.style.strokeDashoffset = (C*(1-clamp(ring.at(t)))).toFixed(1);
      dk.forEach((d,i) => { const o = clamp(d.at(t)); dots[i].style.background = mix(o,'var(--ink)','transparent'); dots[i].style.transform = `scale(${(0.7+0.3*o).toFixed(3)})`; });
      dg.render(t); L.forEach((e,k) => cap.apply(e,k,t)); };
  }});
