

atom({ id:'masonry', cat:'Layout', name:'Masonry settle', block:'gallery, board, collection', fam:['D','T'], wide:true, tall:true,
  html:`<div class="col" style="gap:12px;align-items:center"><div style="max-width:420px;text-align:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Masonry settle</b><p class="muted" style="font-size:13px;line-height:1.5;margin:6px 0 0">Each card drops into the shortest column. Newcomers arrive faded and blurred while the wall eases behind them.</p></div><div class="row small muted" style="gap:8px;align-items:center"><span class="mc" style="font-variant-numeric:tabular-nums">4 cards</span><span aria-hidden="true">·</span><span class="ms" style="position:relative;display:inline-block;min-width:110px;min-height:20px"></span></div><div class="mw card" style="position:relative;width:min(380px,92%);padding:14px 16px;overflow:hidden"><div class="wl" style="position:relative"></div></div><div class="row" style="gap:8px;align-items:center"><button class="btn bAdd" style="min-height:32px">Add card</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="tc"> three columns</label></div></div><div class="hint">Add cards until the wall settles</div>`,
  desc:'Cards are dealt to the shortest column on a base spring with a stagger. Newcomers arrive from 45 percent opacity with blur, and the wall height trails on a lazy spring. A full wall holds as the terminal state.',
  api:'slot = shortest(colH)   x/y.set(slot, base, t0+i*.03)   o: .45 -> 1   wall.set(h, lazy)',
  init(st){
    const wl = $(st,'.wl'), btn = $(st,'.bAdd');
    const sw = new Swap(0);
    const L = ['Dealing','Settled'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; $(st,'.ms').appendChild(e); return e; });
    const H = [64, 96, 80, 112, 72, 88, 104, 68, 92], N = ['Photo','Note','Clip','Chart','Quote','Map','Poll','Link','Memo'];
    const wall = new Track(0), cards = []; let n = 0;
    const cnt = $(st,'.mc');
    const cols = () => $(st,'.tc').checked ? 3 : 2;
    const lay = (inst, fresh) => { const C = cols(), W = wl.clientWidth || 320, G = 8, CW = (W - G*(C-1)) / C, colH = new Array(C).fill(0), t0 = now(), dead = inst || REDUCE;
      cards.forEach((c,i) => { let k = 0; for (let j = 1; j < C; j++) if (colH[j] < colH[k]) k = j;
        const x = k*(CW+G), y = colH[k]; colH[k] += c.hh + G;
        c.c.style.width = px(CW);
        if (dead){ c.x.jump(x); c.y.jump(y); if (fresh === c){ c.o.jump(1); } }
        else if (fresh === c){ c.x.jump(x); c.y.jump(y + 12); c.o.jump(.45); c.x.set(x, S.base); c.y.set(y, S.base); c.o.set(1); }
        else { c.x.set(x, S.base, t0+i*.03); c.y.set(y, S.base, t0+i*.03); } });
      const h = Math.max(...colH, 0) - G;
      if (dead) wall.jump(Math.max(0, h)); else wall.set(Math.max(0, h), S.lazy, t0);
      cnt.textContent = n + (n === 1 ? ' card' : ' cards');
      sw.to(n >= H.length ? 1 : 0);
      if (n >= H.length){ btn.disabled = true; btn.textContent = 'Settled'; } };
    const add = inst => { if (n >= H.length) return; const i = n++;
      const c = document.createElement('div'); c.className = 'card small';
      c.style.cssText += ';position:absolute;top:0;left:0;padding:12px 14px;font-size:13px;line-height:1.5';
      c.innerHTML = '<b style="font-size:13px">' + N[i] + '</b><div class="muted" style="font-size:12px">tile ' + (i+1) + '</div>';
      wl.appendChild(c);
      const o = { c, hh:H[i], x:new Track(0), y:new Track(0), o:new Track(1) }; cards.push(o); lay(inst, o); };
    btn.onclick = () => add();
    $(st,'.tc').onchange = () => lay();
    add(true); add(true); add(true); add(true);
    return t => { cards.forEach(c => { c.c.style.transform = `translate(${px(c.x.at(t))},${px(c.y.at(t))})`; fade(c.c, c.o.at(t), null); });
      wl.style.height = px(Math.max(0, wall.at(t))); L.forEach((e,k) => sw.apply(e, k, t)); };
  }});
