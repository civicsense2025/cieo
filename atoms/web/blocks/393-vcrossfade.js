
atom({ id:'vcrossfade', cat:'Views', name:'View crossfade', block:'crossfade, transition, views', fam:['S','M'],
  html:`<div class="col" style="gap:0;width:min(360px,94%)"><div class="card" style="padding:0;overflow:hidden"><div style="padding:12px 16px;border-bottom:1px solid var(--line)"><b style="font-size:15px;font-weight:600;line-height:1.5">The County Line</b><div class="small muted" style="font-size:12px">Independent · member-funded</div></div><div class="bd" style="position:relative;height:150px"><div class="layer v0" style="position:absolute;inset:0;padding:14px 16px"></div><div class="layer v1" style="position:absolute;inset:0;padding:14px 16px"></div><div class="layer v2" style="position:absolute;inset:0;padding:14px 16px"></div></div><div class="row" style="gap:8px;padding:10px 16px;border-top:1px solid var(--line)"><button class="btn g0">Stories</button><button class="btn g1">Method</button><button class="btn g2">About</button></div></div><label class="row small muted" style="gap:6px;margin-top:8px"><input type="checkbox" class="sb" checked> soft blur</label></div><div class="hint">The header never moves; views fade through each other</div>`,
  desc:'The header stays pinned while the old and new views overlap and fade through each other with a soft blur. Body text swaps on the way through. Nothing travels, so the frame never shifts.',
  api:'o_new=prog, o_old=1-prog, blur soft   text Swap   header static, no travel',
  init(st){
    const copy = [
      ['Stories from the county line', 'Eleven reporters cover one county. This week: the water board vote.'],
      ['How we check a claim', 'Every number links to its source and every quote is recorded.'],
      ['Eleven people, one county', 'Paid for by 4,200 members and no ads. Above the hardware store.']];
    const layers = [$$(st,'.v0')[0], $$(st,'.v1')[0], $$(st,'.v2')[0]];
    layers.forEach((l, i) => l.innerHTML = `<b class="hh" style="display:block;position:relative;height:24px"><span class="layer" style="font-size:15px;font-weight:600;line-height:1.5">${copy[i][0]}</span></b><div class="tt" style="position:relative;height:44px;margin-top:4px"><span class="layer" style="font-size:13px;line-height:1.6;color:var(--ink)">${copy[i][1]}</span></div>`);
    const swH = new Swap(0), swT = new Swap(0);
    const fadeT = new Track(0); let cur = 0, t0 = -9; const sb = $(st,'.sb');
    const go = i => { if (i === cur) return; const prev = cur; cur = i; t0 = now();
      swH.to(i); swT.to(i, now() + .04); fadeT.jump(0); fadeT.set(1, S.base);
      layers[prev].style.visibility = 'visible'; };
    [$$(st,'.g0')[0], $$(st,'.g1')[0], $$(st,'.g2')[0]].forEach((b, i) => b.onclick = () => go(i));
    return t => { const p = clamp(fadeT.at(t)), blur = sb.checked ? 4 : 0;
      layers.forEach((l, k) => { let o;
        if (k === cur){ o = p; } else { o = 0; }
        if (k !== cur && p < 1 && l.style.visibility !== 'hidden' && k === swH.prev) o = 1 - p;
        l.style.opacity = o.toFixed(3); l.style.visibility = o < .01 ? 'hidden' : 'visible';
        l.style.filter = o < .98 && o > .02 && blur ? `blur(${((1 - Math.abs(o - .5) * 2) * blur).toFixed(2)}px)` : 'none'; });
      layers.forEach((l, k) => { const h = l.querySelector('.hh').firstElementChild, x = l.querySelector('.tt').firstElementChild;
        swH.apply(h, k, t, 0); swT.apply(x, k, t, 0); }); };
  }});
