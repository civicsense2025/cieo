atom({ id:'shipradio', cat:'Commerce', name:'Shipping method', block:'checkout, radio, delivery', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Shipping</b><div class="ops col" role="radiogroup" aria-label="Shipping method" style="gap:8px"></div><div class="row small" style="justify-content:space-between;font-size:12.5px"><span class="eta muted" style="position:relative;display:block;min-height:19px"></span><span class="dl num muted" style="font-variant-numeric:tabular-nums"></span></div><label class="row small muted" style="gap:6px;font-size:12.5px"><input type="checkbox" class="th" checked> Free over $75</label></div><div class="hint">Pick a speed</div>`,
  desc:'The dot scales in on the base spring while the card lifts and its border inks. The price delta rolls and the ETA swaps. The cheapest option carries the free-over threshold pill.',
  api:'dot[i].set(picked); lift[i].set(picked)   delta.set(p-min); eta.to(i)',
  init(st){
    const ops = $(st,'.ops'), O = [['Standard',4.9,'3–5 days'],['Express',12,'1–2 days'],['Overnight',24,'Tomorrow']];
    const eta = new Swap(0), it = O.map(([n,p,e],i) => { const b = document.createElement('button'); b.setAttribute('role','radio');
      b.style.cssText = 'display:flex;align-items:center;gap:10px;border-radius:9px;background:var(--raised);cursor:pointer;padding:10px 12px;font-size:14px;text-align:left;min-height:52px';
      b.innerHTML = `<span class="ring" style="position:relative;width:20px;height:20px;border-radius:50%;border:2px solid var(--line);flex:none;display:grid;place-items:center;padding:0"><i style="width:10px;height:10px;border-radius:50%;background:var(--ink);transform:scale(0) translateY(.5px)"></i></span><span class="col" style="gap:2px"><b style="font-size:13px;font-weight:600;line-height:1.5">${n}${i === 0 ? ' <em class="pill" style="font-style:normal;font-size:12px;font-weight:600;background:var(--raised);border-radius:10px;padding:1px 8px;margin-left:6px">Free $75+</em>' : ''}</b><span class="small muted" style="font-size:12.5px">${e}</span></span><span class="pr num" style="margin-left:auto;font-size:15px;font-weight:600;font-variant-numeric:tabular-nums"></span>`;
      ops.appendChild(b); const d = { b, p:new Track(i === 0 ? 1 : 0), lift:new Track(0), price:p }; return d; });
    const delta = new Track(0), dl = $(st,'.dl');
    const EL = O.map(o => { const e = document.createElement('span'); e.className = 'layer'; e.style.fontSize = '12.5px'; e.style.justifyContent = 'flex-start'; e.textContent = 'Arrives ' + o[2]; $(st,'.eta').appendChild(e); return e; });
    let cur = 0; delta.jump(0);
    const pick = i => { cur = i; it.forEach((x,j) => { x.p.set(j === i ? 1 : 0); x.lift.set(j === i ? 1 : 0); x.b.setAttribute('aria-checked', j === i); }); eta.to(i); delta.set(O[i][1] - O[0][1]); };
    it.forEach((x,i) => { x.b.onclick = () => pick(i); x.pr = $(x.b,'.pr'); });
    const paint = () => it.forEach(x => x.pr.textContent = ($(st,'.th').checked && x.price === O[0][1] ? 'Free*' : money(x.price)));
    $(st,'.th').onchange = paint; paint();
    it.forEach(x => x.b.setAttribute('aria-checked', x === it[0]));
    return t => { it.forEach(x => { const p = clamp(x.p.at(t)), l = clamp(x.lift.at(t));
        $(x.b,'.ring').style.borderColor = mix(p,'var(--ink)','var(--line)');
        $(x.b,'i').style.transform = `scale(${p.toFixed(4)}) translateY(.5px)`;
        x.b.style.transform = `translateY(${(-l*2).toFixed(2)}px)`; x.b.style.boxShadow = l > .02 ? 'var(--shadow)' : 'none';
        x.b.style.borderColor = mix(p,'var(--ink)','var(--line)'); });
      EL.forEach((e,k) => eta.apply(e,k,t));
      const d = delta.at(t); dl.textContent = d < .005 ? 'lowest fare' : '+' + money(d) + ' over Standard'; };
  }});
