atom({ id:'binder', cat:'Writing', name:'Manuscript binder', block:'writing, binder', fam:['M','E','T'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="row" style="gap:8px;padding:12px;margin:0 auto;max-width:360px"><div class="bl" style="position:relative;width:132px;display:flex;flex-direction:column;gap:8px"><div class="plate" style="position:absolute;left:0;right:0;border-radius:8px;background:var(--wash)"></div></div><div class="art small" style="width:168px;height:148px;overflow:hidden"></div></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Show counts</span></label><div class="hint">Pick a chapter</div>`,
  desc:'A chapter list with a highlight plate that glides from chapter to chapter on a calm spring, its lower edge trailing 60ms behind. Each chapter keeps a live word count that rolls over like digits, and picking a chapter springs the article pane to its heading.',
  api:'pick(i): plate.go(y0,y1); digits[i].set(n); scroll.set(head)',
  init(st){
    const C = [['Draft',1240],['Revision',860],['Polish',320]], H = 36, R = REDUCE;
    const bl = $(st,'.bl'), art = $(st,'.art'), plate = $(st,'.plate');
    const E = edges(2, H-2), sc = new Track(0);
    const rows = C.map(([t,n],i) => {
      const b = document.createElement('button'); b.className = 'row small';
      b.style.cssText = 'height:34px;gap:6px;background:none;border:0;cursor:pointer;z-index:1;text-align:left';
      b.innerHTML = `<span style="width:56px">${t}</span><span class="dg"></span>`; b.onclick = () => pick(i); bl.appendChild(b);
      const dg = new Digits(b.querySelector('.dg'), 4); dg.set(n, true); return { dg, n };
    });
    C.forEach(([t]) => { const h = document.createElement('h4'); h.textContent = t; h.style.margin = '10px 0 2px'; art.appendChild(h);
      const p = document.createElement('p'); p.textContent = 'Words gather here while the draft finds its shape.'; p.style.margin = '0 0 34px'; art.appendChild(p); });
    const pick = i => { const t = now(), y0 = i*H+2, y1 = i*H+H-2;
      if (R){ E.jump(y0,y1); sc.jump(i*96); } else { E.go(y0,y1,t); sc.set(i*96, S.base, t); }
      rows[i].n += 40; rows[i].dg.set(rows[i].n, R); };
    return t => { plate.style.top = px(E.A.at(t)); plate.style.height = px(Math.max(0, E.B.at(t)-E.A.at(t)));
      art.scrollTop = sc.at(t); rows.forEach(r => r.dg.render(t)); };
  }});
