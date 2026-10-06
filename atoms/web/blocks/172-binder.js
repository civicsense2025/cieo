atom({ id:'binder', cat:'Writing', name:'Manuscript binder', block:'writing, binder', fam:['M','E','T'],
  html:`<div class="row card" style="gap:16px;padding:16px;width:min(336px,94%)"><div class="bl" style="position:relative;width:128px;flex:none;display:flex;flex-direction:column;gap:0"><div class="plate" style="position:absolute;left:0;right:0;border-radius:8px;background:var(--wash)"></div></div><div class="art small" style="flex:1;min-width:0;height:160px;overflow:hidden"></div></div><div class="hint">Pick a chapter</div>`,
  desc:'A chapter list with a highlight plate that glides from chapter to chapter on a calm spring, its lower edge trailing 60ms behind. Each chapter keeps a live word count that rolls over like digits, and picking a chapter springs the article pane to its heading.',
  api:'pick(i): plate.go(y0,y1); digits[i].set(n); scroll.set(head)',
  init(st){
    const C = [['Draft',1240],['Revision',860],['Polish',320]], H = 40, R = REDUCE;
    const bl = $(st,'.bl'), art = $(st,'.art'), plate = $(st,'.plate');
    const E = edges(2, H-2), sc = new Track(0);
    const rows = C.map(([t,n],i) => {
      const b = document.createElement('button'); b.className='row small';b.type='button';b.setAttribute('aria-pressed',String(i===0));
      b.style.cssText = 'height:40px;gap:8px;background:none;border:0;cursor:pointer;z-index:1;text-align:left';
      b.innerHTML = `<span style="width:56px">${t}</span><span class="dg"></span>`; b.onclick = () => pick(i); bl.appendChild(b);
      const dg = new Digits(b.querySelector('.dg'), 4); dg.set(n, true); return { dg, n };
    });
    C.forEach(([t]) => { const h = document.createElement('h4'); h.textContent = t; h.style.margin = '8px 0 8px'; art.appendChild(h);
      const p = document.createElement('p'); p.textContent = 'Words gather here while the draft finds its shape.'; p.style.margin = '0 0 32px'; art.appendChild(p); });
    const pick = i => {bl.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j))); const t = now(), y0 = i*H+2, y1 = i*H+H-2;
      if (R){ E.jump(y0,y1); sc.jump(art.querySelectorAll('h4')[i].offsetTop-art.querySelector('h4').offsetTop); } else { E.go(y0,y1,t); sc.set(art.querySelectorAll('h4')[i].offsetTop-art.querySelector('h4').offsetTop,S.base,t); }
      rows[i].n += 40; rows[i].dg.set(rows[i].n, R); };
    return t => { plate.style.top = px(E.A.at(t)); plate.style.height = px(Math.max(0, E.B.at(t)-E.A.at(t)));
      art.scrollTop = sc.at(t); rows.forEach(r => r.dg.render(t)); };
  }});
