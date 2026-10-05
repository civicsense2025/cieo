

atom({ id:'taginput', cat:'Inputs', name:'Tag input', block:'form, term-list', fam:['M','X'],
  html:`<label class="tg card" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;width:min(320px,90%);min-height:46px;padding:8px;cursor:text"><input id="tag-in" placeholder="Add a tag" aria-label="Add a tag" style="flex:1;min-width:80px;border:0;background:none;color:var(--ink);font:14px var(--sans);outline:none;padding:4px"></label><div class="hint">Enter or comma adds · Backspace removes</div>`,
  desc:'A new chip opens its own width before its text fades in. Removing reverses it: text out first, then the gap closes, so neighbors slide over instead of jumping.',
  api:'chip.w.set(measured); chip.o.set(1, S.base, t + 0.06)   remove: o→0, then w→0',
  init(st){
    const tg = $(st,'.tg'), inp = $(st,'input'); let chips = [];
    const add = (txt, inst) => { txt = txt.trim().toLowerCase(); if (!txt || chips.some(c => c.txt === txt && !c.gone)) return;
      const c = document.createElement('span'); c.style.cssText = 'display:inline-flex;overflow:hidden;white-space:nowrap;border-radius:999px;background:var(--raised);height:28px';
      c.innerHTML = `<span class="ci" style="display:inline-flex;align-items:center;gap:4px;padding:0 6px 0 10px;font-size:13px;font-weight:500"></span>`; $(c,'.ci').textContent = txt;
      const x = document.createElement('button'); x.setAttribute('aria-label', 'Remove ' + txt); x.innerHTML = ic(I.x,12,2.5); x.style.cssText = 'border:0;background:none;cursor:pointer;color:var(--muted);display:grid;place-items:center;padding:2px'; $(c,'.ci').appendChild(x);
      tg.insertBefore(c, inp); const W = $(c,'.ci').offsetWidth, ch = { c, txt, W, w:new Track(inst ? 1 : 0), o:new Track(inst ? 1 : 0), gone:false };
      if (!inst){ ch.w.set(1); ch.o.set(1, S.base, now() + .06); } x.onclick = e => { e.preventDefault(); rm(ch); }; chips.push(ch); };
    const rm = ch => { if (ch.gone) return; ch.gone = true; ch.o.set(0, S.snap); ch.w.set(0, S.base, now() + EXIT); };
    inp.onkeydown = ev => { if (ev.key === 'Enter' || ev.key === ','){ ev.preventDefault(); add(inp.value); inp.value = ''; } if (ev.key === 'Backspace' && !inp.value){ const l = chips.filter(c => !c.gone).pop(); if (l) rm(l); } };
    ['design','motion','docs'].forEach(s => add(s, true));
    return t => { chips = chips.filter(ch => { if (ch.gone && ch.w.prune(t) === 0 && ch.w.target === 0){ ch.c.remove(); return false; } return true; });
      chips.forEach(ch => { const w = clamp(ch.w.at(t)); ch.c.style.width = px(ch.W*w); ch.c.style.marginRight = px(-6*(1-w)); fade($(ch.c,'.ci'), ch.o.at(t), null); }); };
  }});