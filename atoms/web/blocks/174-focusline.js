atom({ id:'focusline', cat:'Writing', name:'Focus sentence', block:'writing, focus', fam:['M','X'], tall:true,
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="pg small" style="display:flex;flex-direction:column;gap:8px;max-width:300px"></div><div class="row" style="gap:8px;margin-top:8px;padding:12px"><button class="pv">Prev</button><button class="nx">Next</button></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Dim rest</span></label><div class="hint">Move the caret</div>`,
  desc:'One sentence at a time carries full ink while the rest sink to a dim grey on the same soft spring. Moving the caret simply retargets that spring, so focus bends mid-flight instead of restarting.',
  api:'caret.set(i): op.set(k==i?1:.35, S.soft)',
  init(st){
    const L = ['The house had been empty for years.', 'Mara pushed the door and it sang.', 'Dust stood up in the light.', 'Somewhere upstairs, a floorboard answered.'];
    const R = REDUCE, pg = $(st,'.pg'), ops = L.map(() => new Track(.35, S.soft));
    const els = L.map((s,i) => { const p = document.createElement('p'); p.textContent = s;
      p.style.cssText = 'margin:0;cursor:pointer'; p.onclick = () => go(i); pg.appendChild(p); return p; });
    let cur = 1; ops[1].jump(1);
    const go = i => { cur = (i + L.length) % L.length;
      ops.forEach((o,k) => R ? o.jump(k === cur ? 1 : .35) : o.set(k === cur ? 1 : .35, S.soft)); };
    $(st,'.pv').onclick = () => go(cur-1); $(st,'.nx').onclick = () => go(cur+1);
    return t => els.forEach((e,k) => { const o = ops[k].at(t); e.style.opacity = o.toFixed(3);
      e.style.filter = o < .98 ? `blur(${((1-o)*2).toFixed(2)}px)` : 'none'; });
  }});
