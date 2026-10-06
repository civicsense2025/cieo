

atom({ id:'lede', cat:'Writing', name:'Lede optimizer', block:'richtext editor, headline', fam:['M','E'],
  html:`<div class="col" style="width:min(360px,90%);gap:10px"><div class="card lv" style="position:relative;height:96px;overflow:hidden"></div><div class="row" style="gap:8px;align-items:center"><button class="btn pv" type="button">Prev</button><button class="btn nx" type="button">Next</button><div style="flex:1;height:6px;border-radius:3px;background:var(--line-soft);overflow:hidden"><i class="gb" style="display:block;height:100%;width:0;background:var(--success);border-radius:3px"></i></div><span class="gs small muted" style="min-width:30px;text-align:right"></span></div></div><div class="hint">Grade bar runs on base</div>`,
  desc:'Variants swap exit-then-enter while the grade bar eases on base and the score rolls with the direction of travel. Prev and Next walk the list.',
  api:'go(k,t): sw.to(k); w.set(score); dg.set(score, dir)   ends clamp, no wrap',
  init(st){
    const V = [['Harbor opens its doors to first-time founders.', 72], ['Twelve founders, one harbor, zero pitch decks.', 86], ['The harbor where first-time founders ship first.', 94]];
    const box = $(st,'.lv'), gb = $(st,'.gb');
    const L = V.map((v,i) => { const e = document.createElement('div'); e.className = 'layer';
      e.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:0 16px;text-align:center';
      e.innerHTML = `<p style="margin:0;font-size:15px;font-weight:600;letter-spacing:-.01em;line-height:1.4">${v[0]}</p><span class="small muted">Variant ${i+1} of ${V.length}</span>`;
      box.appendChild(e); return e; });
    const dg = new Digits($(st,'.gs'), 2), w = new Track(V[0][1]), sw = new Swap(0);
    let i = 0; dg.set(String(V[0][1]), true); w.jump(V[0][1]);
    const go = k => { k = Math.max(0, Math.min(V.length-1, k)); if (k === i) return; const t = now();
      dg.dir = k > i ? 1 : -1; i = k;
      if (REDUCE){ sw.cur = k; sw.prev = null; w.jump(V[k][1]); dg.set(String(V[k][1]), true); }
      else { sw.to(k, t); w.set(V[k][1], S.base, t); dg.set(String(V[k][1]), false); } };
    $(st,'.pv').onclick = () => go(i-1); $(st,'.nx').onclick = () => go(i+1);
    return t => { L.forEach((e,k) => sw.apply(e, k, t, 8)); dg.render(t);
      gb.style.width = w.at(t).toFixed(1) + '%'; };
  }});
