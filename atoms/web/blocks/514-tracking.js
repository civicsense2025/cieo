atom({ id:'tracking', cat:'Commerce', name:'Tracking timeline', block:'orders, timeline, delivery', fam:['M','S'],
  html:`<div class="card col" style="width:min(300px,92%);padding:14px;gap:8px"><div class="row" style="justify-content:space-between;align-items:baseline"><b style="font-size:15px;font-weight:600">Trail order</b><span class="small muted" style="font-size:12.5px">ETA <b class="eta num" style="font-variant-numeric:tabular-nums"></b></span></div><div class="tl col" style="gap:0"></div><div class="rc small" style="position:relative;min-height:22px;font-size:13px;line-height:1.5"></div><div class="row" style="gap:8px"><button class="nx" style="height:38px;padding:0 14px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer">Advance</button><label class="row small muted" style="gap:6px;font-size:12.5px"><input type="checkbox" class="nt" checked> Notify me</label></div></div><div class="hint">Advance to Delivered</div>`,
  desc:'The spine fills on the lazy spring to the current stop while each node inks 60ms after arrival. The ETA digits roll down. Delivered draws its check and swaps to the receipt terminal.',
  api:'fill.set(stop/3,lazy); node[i]=prog(t,arrive+.06)   eta.set(days); done: draw+swap.to(receipt)',
  init(st){
    const tl = $(st,'.tl'), stops = ['Ordered','Shipped','Out for delivery','Delivered'];
    const fill = new Track(0), eta = new Digits($(st,'.eta'), 2), ck = new Track(0), rc = new Swap(0);
    const RL = ['','Receipt · review your tote'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; $(st,'.rc').appendChild(e); return e; });
    let cur = 0; const arrive = [now()];
    const ND = stops.map((s,i) => { const r = document.createElement('div'); r.className = 'row'; r.style.cssText = 'gap:10px;position:relative;padding:8px 0';
      r.innerHTML = `<span class="nd" style="width:20px;height:20px;border-radius:50%;border:2px solid var(--line);display:grid;place-items:center;padding:0;flex:none;background:var(--card)"><i style="width:10px;height:10px;border-radius:50%;background:var(--ink);transform:scale(0) translateY(.5px)"></i></span><span style="font-size:13px;line-height:1.5">${s}</span>`;
      if (i === 3) $(r,'span').insertAdjacentHTML('beforeend', ` <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round"><path class="ck" d="M5 12.5 10 17.5 19 7"/></svg>`);
      if (i < 3){ const sp = document.createElement('i'); sp.style.cssText = 'position:absolute;left:9px;top:28px;bottom:-8px;width:2px;background:var(--raised)'; r.appendChild(sp); }
      tl.appendChild(r); return r; });
    eta.set('5d', true);
    const paint = () => { fill.set(cur/3, S.lazy); arrive[cur] = now(); eta.set(cur >= 3 ? '0d' : (5 - cur) + 'd'); if (cur >= 3){ ck.set(1, S.soft); rc.to(1); } };
    $(st,'.nx').onclick = () => { if (cur >= 3){ cur = 0; ck.jump(0); rc.to(0); } else cur++; paint(); };
    paint();
    return t => { const f = clamp(fill.at(t));
      [...tl.querySelectorAll('.tl > div')].forEach(()=>{});
      tl.querySelectorAll('i').forEach(()=>{});
      ND.forEach((r,i) => { const q = i <= cur ? clamp(prog(t, (arrive[i] || t) + .06)) : 0;
        const dot = r.querySelector('.nd'), d = r.querySelector('.nd i');
        dot.style.borderColor = mix(q,'var(--ink)','var(--line)'); d.style.transform = `scale(${q.toFixed(4)}) translateY(.5px)`;
        const sp = r.querySelector('i:not(.nd i)'); });
      eta.render(t); RL.forEach((e,k) => rc.apply(e,k,t));
      const c = $(st,'.ck'); if (c){ const b = clamp(ck.at(t)); c.style.strokeDasharray = 30; c.style.strokeDashoffset = ((1-b)*30).toFixed(1); } };
  }});
