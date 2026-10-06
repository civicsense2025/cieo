

atom({ id:'breakpoint', cat:'Layout', name:'Breakpoint morph', block:'columns, page-editor, dashboard', fam:['D','T'], wide:true,
  html:`<div class="col" style="gap:12px;align-items:center"><div style="max-width:420px;text-align:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Breakpoint morph</b><p class="muted" style="font-size:13px;line-height:1.5;margin:6px 0 0">Cards retarget their slots with a stagger when the breakpoint flips. The wall follows the tallest column.</p></div><div class="row small muted" style="gap:8px;align-items:center"><span><span class="nc" style="display:inline-flex;min-width:12px;justify-content:flex-end;font-variant-numeric:tabular-nums"></span>-col</span><span aria-hidden="true">·</span><span class="md" style="position:relative;display:inline-block;min-width:70px;min-height:20px"></span></div><div class="bp card" style="position:relative;width:min(360px,92%);padding:14px;overflow:hidden"><div class="wl" style="position:relative"></div></div><div class="row" style="gap:8px;align-items:center"><button class="btn bN" style="min-height:32px">Narrow</button><button class="btn bW" style="min-height:32px">Wide</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="st" checked> stagger</label></div></div><div class="hint">Flip the breakpoint and watch the slots retarget</div>`,
  desc:'Cards retarget their grid slots with a 30ms stagger when the breakpoint flips, and the wall height springs to fit. The last layout holds settled as the terminal state.',
  api:'cards[i].x/y.set(slot, base, t0+i*.03)   wall.set(h)   nc.set(cols)',
  init(st){
    const wl = $(st,'.wl'), dg = new Digits($(st,'.nc'), 1), sw = new Swap(0), wall = new Track(0);
    const L = ['Stacked','Grid'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; $(st,'.md').appendChild(e); return e; });
    const T = ['Home','About','Journal','Shop'], CW = 104, CH = 64, G = 8;
    const cards = T.map(n => { const c = document.createElement('div'); c.className = 'card small';
      c.style.cssText += ';position:absolute;top:0;left:0;width:104px;height:64px;padding:12px 14px;font-size:13px;line-height:1.5';
      c.innerHTML = '<b style="font-size:13px">' + n + '</b>'; wl.appendChild(c);
      return { c, x:new Track(0), y:new Track(0) }; });
    let wide = true;
    const slots = () => wide ? T.map((_,i) => [(i%2)*(CW+G), Math.floor(i/2)*(CH+G)]) : T.map((_,i) => [0, i*(CH+G)]);
    const lay = inst => { const s = slots(), t0 = now(), stag = $(st,'.st').checked ? .03 : 0, dead = inst || REDUCE;
      cards.forEach((c,i) => { if (dead){ c.x.jump(s[i][0]); c.y.jump(s[i][1]); } else { c.x.set(s[i][0], S.base, t0+i*stag); c.y.set(s[i][1], S.base, t0+i*stag); } });
      const h = s.reduce((m,p) => Math.max(m, p[1]+CH), 0);
      if (dead) wall.jump(h); else wall.set(h, S.base, t0);
      dg.set(wide ? '2' : '1', dead); sw.to(wide ? 1 : 0); };
    $(st,'.bN').onclick = () => { wide = false; lay(); };
    $(st,'.bW').onclick = () => { wide = true; lay(); };
    lay(true);
    return t => { cards.forEach(c => { c.c.style.transform = `translate(${px(c.x.at(t))},${px(c.y.at(t))})`; });
      wl.style.height = px(wall.at(t)); dg.render(t); L.forEach((e,k) => sw.apply(e, k, t)); };
  }});
