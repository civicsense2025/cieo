

atom({ id:'rank', cat:'Forms', name:'Click to rank', block:'form (ranking)', fam:['M','S'], tall:true,
  html:`<div class="col" style="width:min(300px,88%);gap:8px"><div class="row small" style="justify-content:space-between"><b>Rank by importance</b><button class="btn rs" style="padding:3px 9px">Reset</button></div><div class="rk" style="position:relative;height:226px"></div></div>`,
  desc:'Clicking an item gives it the next rank: a numbered badge grows in and the item springs up into ranked order. Clicking a ranked item removes it and closes the gap.',
  api:'item.y.set(slot(order))   badge.o.set(ranked)   badge.digits.set(rank)',
  init(st){
    const rk = $(st,'.rk'), N = ['Price','Speed','Design','Support','Integrations'], R = 46;
    const it = N.map((n,i) => { const b = document.createElement('button'); b.className = 'card row'; b.style.cssText += 'position:absolute;left:0;right:0;top:0;height:40px;padding:0 12px;gap:10px;border:0;cursor:pointer;text-align:left';
      b.innerHTML = `<span class="bg" style="width:22px;height:22px;border-radius:50%;background:var(--ink);color:var(--card);font:600 12px var(--sans);display:grid;place-items:center"><span class="d"></span></span><span class="small" style="font-weight:500">${n}</span>`; rk.appendChild(b);
      const x = { b, bg:$(b,'.bg'), d:new Digits($(b,'.d'), 1), y:new Track(i*R), o:new Track(0), rank:0 }; x.d.set('1', true); return x; });
    let ranked = [];
    const lay = () => { const rest = it.filter(x => !ranked.includes(x)); [...ranked, ...rest].forEach((x,i) => x.y.set(i*R, S.base, now() + i*.02)); it.forEach(x => { const r = ranked.indexOf(x); x.o.set(r >= 0 ? 1 : 0); if (r >= 0) x.d.set(String(r + 1)); x.b.setAttribute('aria-label', `${x.b.textContent.trim()}${r >= 0 ? ', ranked ' + (r + 1) : ', not ranked'}`); }); };
    it.forEach(x => x.b.onclick = () => { ranked.includes(x) ? ranked.splice(ranked.indexOf(x), 1) : ranked.push(x); lay(); });
    $(st,'.rs').onclick = () => { ranked = []; lay(); };
    return t => it.forEach(x => { x.b.style.transform = `translateY(${px(x.y.at(t))})`; const o = clamp(x.o.at(t)); x.bg.style.transform = `scale(${o.toFixed(3)})`; x.bg.style.width = x.bg.style.height = px(22); x.bg.style.marginRight = px(-32*(1-o)); x.d.render(t); });
  }});