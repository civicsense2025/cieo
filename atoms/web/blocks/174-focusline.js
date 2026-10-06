atom({ id:'focusline', cat:'Writing', name:'Focus sentence', block:'writing, focus', fam:['M','X'], tall:true,
  html:`<div class="pg small" style="display:flex;flex-direction:column;gap:8px;width:min(320px,90%);padding:24px;background:var(--card);border-radius:24px;box-shadow:var(--shadow)"></div><div class="row" style="gap:8px;margin-top:8px"><button type="button" class="btn pv" aria-label="Previous sentence">Previous</button><button type="button" class="btn nx" aria-label="Next sentence">Next</button></div><div class="hint">Move the caret</div>`,
  desc:'One sentence at a time carries full ink while the rest sink to a dim grey on the same soft spring. Moving the caret simply retargets that spring, so focus bends mid-flight instead of restarting.',
  api:'caret.set(i): op.set(k==i?1:.35, S.soft)',
  init(st){
    const L = ['The house had been empty for years.', 'Mara pushed the door and it sang.', 'Dust stood up in the light.', 'Somewhere upstairs, a floorboard answered.'];
    const R = REDUCE, pg = $(st,'.pg'), ops = L.map(() => new Track(.35, S.soft));
    const els = L.map((s,i) => { const p = document.createElement('p'); p.textContent = s;
      p.style.cssText='margin:0;cursor:pointer;line-height:1.7';p.tabIndex=0;p.setAttribute('role','button');p.setAttribute('aria-label','Focus sentence: '+s);p.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go(i)}}; p.onclick = () => go(i); pg.appendChild(p); return p; });
    let cur = 1; ops[1].jump(1);
    const go = i => { cur = (i + L.length) % L.length;
      els.forEach((e,k)=>e.setAttribute('aria-pressed',String(k===cur)));ops.forEach((o,k) => R ? o.jump(k === cur ? 1 : .35) : o.set(k === cur ? 1 : .35, S.soft)); };
    els.forEach((e,k)=>e.setAttribute('aria-pressed',String(k===cur)));$(st,'.pv').onclick = () => go(cur-1); $(st,'.nx').onclick = () => go(cur+1);
    return t => els.forEach((e,k) => { const o = ops[k].at(t); e.style.opacity = o.toFixed(3);
      e.style.filter = o < .98 ? `blur(${((1-o)*2).toFixed(2)}px)` : 'none'; });
  }});
