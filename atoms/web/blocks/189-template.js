

atom({ id:'template', cat:'Writing', name:'Template inserter', block:'template picker, doc', fam:['M','X','S'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="margin:0 auto;width:min(340px,90%);gap:8px;padding:12px"><div class="grid row" style="gap:8px"></div><div class="doc card" style="padding:14px;min-height:120px"><div class="ph small muted">Pick a template to insert</div><div class="blk card" style="overflow:hidden;padding:0 12px;background:var(--raised)"></div></div></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Insert with title</span></label><div class="hint">Pick a tile to insert it</div>`,
  desc:'Tiles rise in one after another. Picking one grows the doc block open and swaps its content in. Picking again swaps to the new template.',
  api:'tile.o.set(1,S.base,t+i*0.06)   blk.h.set(H,S.base); body.to(i)   REDUCE: jump',
  init(st){
    const grid = $(st,'.grid'), blk = $(st,'.blk'), ph = $(st,'.ph');
    const TP = [{ n:'Quote', h:58, b:'“Design is the sentence the product speaks.”' }, { n:'List', h:82, b:'☐ Outline — ☐ Draft — ☑ Ship' }, { n:'Table', h:70, b:'Mon 12 · Tue 8 · Wed 15 pages' }];
    const sw = new Swap(-1), h = new Track(0); h.jump(0);
    const bodies = TP.map((p,i) => { const l = document.createElement('div'); l.className = 'layer'; l.style.cssText = 'padding:10px 0;font-size:14px'; l.innerHTML = '<b>' + p.n + '</b><div class="small muted">' + p.b + '</div>'; blk.appendChild(l); return l; });
    const tiles = TP.map((p,i) => { const b = document.createElement('button'); b.className = 'btn'; b.textContent = p.n; b.style.opacity = '0'; grid.appendChild(b);
      const o = new Track(0), y = new Track(10); const t0 = now() + i*.06; if (REDUCE){ o.jump(1); y.jump(0); } else { o.set(1, S.base, t0); y.set(0, S.base, t0); }
      b.onclick = () => { ph.style.display = 'none'; if (REDUCE){ sw.cur = i; sw.prev = null; sw.t = -9; h.jump(p.h); } else { sw.to(i); h.set(p.h, S.base); } }; return { b, o, y }; });
    return t => { tiles.forEach(r => { r.b.style.opacity = clamp(r.o.at(t)).toFixed(3); r.b.style.transform = `translateY(${r.y.at(t).toFixed(2)}px)`; });
      const hh = Math.max(0, h.at(t)); blk.style.height = px(hh); blk.style.opacity = hh > 2 ? '1' : '0'; bodies.forEach((l,k) => sw.apply(l, k, t)); };
  }});
