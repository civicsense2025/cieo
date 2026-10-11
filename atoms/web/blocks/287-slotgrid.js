atom({ id:'slotgrid', cat:'Scheduling', name:'Slot picker', block:'booking, slot grid', fam:['M','S'],
  html:`<div class="col" style="width:min(340px,90%);margin:0 auto;gap:8px;line-height:1.5"><b style="font-size:15px;font-weight:600">Pick a time</b><div class="card" style="padding:14px 16px;display:flex;flex-direction:column;gap:10px"><div class="rail" style="position:relative;display:flex;gap:4px;background:var(--raised);border-radius:10px;padding:4px" role="tablist"></div><div class="grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"></div><div class="row small muted" style="gap:8px;align-items:center;border-top:1px solid var(--line);padding-top:10px"><span style="font-size:12px">Length</span><button class="d0" style="min-height:32px;border-radius:8px;border:0;background:var(--raised);padding:0 12px;cursor:pointer;font-size:13px">30 min</button><button class="d1" style="min-height:32px;border-radius:8px;border:0;background:var(--raised);padding:0 12px;cursor:pointer;font-size:13px">60 min</button></div></div></div><div class="hint">Pick a day, then a time</div>`,
  desc:'The day plate glides across with its trailing edge lagging behind. Old times blur out while the new day staggers in cell by cell. A picked slot holds its ink border as the terminal.',
  api:'plate.go(l, r) trails .06   cells[i].sw.to(day, t+i*.04)   sel.set(1)',
  init(st){
    const days = ['Tue 6','Wed 7','Thu 8'];
    const D30 = [['9:00','9:30','10:00','10:30','11:00','2:30'],['9:00','9:30','10:15','11:00','1:00','3:00'],['9:30','10:00','10:30','12:00','2:00','4:00']];
    const D60 = [['9:00','10:00','11:00','2:00','',''],['9:00','10:00','1:00','3:00','',''],['9:30','10:30','12:00','2:00','','']];
    const rail = $(st,'.rail'), grid = $(st,'.grid'), pl = edges(0, 0);
    const tabs = days.map((d,i) => { const b = document.createElement('button'); b.setAttribute('role','tab'); b.textContent = d;
      b.style.cssText = 'position:relative;z-index:1;flex:1;min-height:32px;border:0;background:none;border-radius:8px;cursor:pointer;font-size:13px;color:var(--ink)';
      rail.appendChild(b); return b; });
    const plate = document.createElement('div');
    plate.style.cssText = 'position:absolute;top:4px;bottom:4px;border-radius:8px;background:var(--card);box-shadow:0 1px 3px rgba(0,0,0,.15)';
    rail.prepend(plate);
    let dur = 60, day = 0;
    const cells = [];
    for (let i = 0; i < 6; i++){
      const b = document.createElement('button');
      b.style.cssText = 'position:relative;height:38px;border-radius:8px;border:0;background:var(--raised);cursor:pointer;font-size:13px;overflow:hidden;font-variant-numeric:tabular-nums';
      const L = [0,1,2].map(() => { const s = document.createElement('span'); s.className = 'layer';
        s.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center'; b.appendChild(s); return s; });
      const c = { b, L, sw:new Swap(0), sT:new Track(0), vT:new Track(1) };
      b.onclick = () => cells.forEach((x,j) => x.sT.set(j === i ? 1 : 0));
      grid.appendChild(b); cells.push(c);
    }
    const paint = () => { const T = dur === 30 ? D30 : D60;
      cells.forEach((c,i) => { c.L.forEach((l,d) => l.textContent = T[d][i] || '');
        c.vT.set(T[0][i] ? 1 : 0); c.b.style.pointerEvents = T[0][i] ? 'auto' : 'none'; }); };
    const goDay = i => { day = i; const t0 = now();
      cells.forEach((c,k) => c.sw.to(i, t0 + k*.04)); cells.forEach(c => c.sT.set(0));
      pl.go(tabs[i].offsetLeft, tabs[i].offsetLeft + tabs[i].offsetWidth);
      tabs.forEach((x,j) => x.style.fontWeight = j === i ? '600' : '400'); };
    tabs.forEach((b,i) => b.onclick = () => goDay(i));
    const d0 = $(st,'.d0'), d1 = $(st,'.d1');
    const goDur = d => { dur = d; paint(); const t0 = now();
      cells.forEach((c,k) => c.sw.to(day, t0 + k*.03));
      d0.style.boxShadow = d === 30 ? 'inset 0 -2px 0 var(--ink)' : 'none'; d0.setAttribute('aria-pressed', d === 30); d0.style.fontWeight = d === 30 ? '600' : '400';
      d1.style.boxShadow = d === 60 ? 'inset 0 -2px 0 var(--ink)' : 'none'; d1.setAttribute('aria-pressed', d === 60); d1.style.fontWeight = d === 60 ? '600' : '400'; };
    d0.onclick = () => goDur(30); d1.onclick = () => goDur(60);
    paint(); goDur(dur);
    const first = () => pl.jump(tabs[0].offsetLeft, tabs[0].offsetLeft + tabs[0].offsetWidth);
    document.fonts.ready.then(first); first(); tabs[0].style.fontWeight = '600';
    return t => { plate.style.left = px(pl.A.at(t)); plate.style.width = px(Math.max(0, pl.B.at(t) - pl.A.at(t)));
      cells.forEach(c => { c.L.forEach((l,k) => c.sw.apply(l,k,t));
        const s = clamp(c.sT.at(t));         c.b.style.boxShadow = `inset 0 0 0 ${(2*s).toFixed(2)}px var(--ink)`;
        c.b.style.background = mix(s*.14,'var(--ink)','var(--card)');
        c.b.style.opacity = (.3 + .7*clamp(c.vT.at(t))).toFixed(3); }); };
  }});
