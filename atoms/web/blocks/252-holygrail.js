

atom({ id:'holygrail', cat:'Layout', name:'Holy-grail reorder', block:'page-editor, dashboard, article', fam:['D','T'], wide:true,
  html:`<div class="col" style="gap:12px;align-items:center"><div style="max-width:420px;text-align:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Holy-grail reorder</b><p class="muted" style="font-size:13px;line-height:1.5;margin:6px 0 0">Going narrow stacks both sidebars below the article with slot springs. Focus follows the visual order.</p></div><div class="row small muted" style="gap:8px;align-items:center"><span class="hl" style="position:relative;display:inline-block;min-width:170px;min-height:20px"></span></div><div class="hg card" style="position:relative;width:min(560px,94%);padding:14px 16px;overflow:hidden"><div class="wl" style="position:relative"></div></div><div class="row" style="gap:8px;align-items:center"><button class="btn bN" style="min-height:32px">Narrow</button><button class="btn bW" style="min-height:32px">Wide</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="ff" checked> move focus</label></div></div><div class="hint">Go narrow, then tab through in visual order</div>`,
  desc:'Narrow stacks both sidebars below the article on slot springs with a stagger, and focus moves into the article so tab order matches the visual order. Wide restores the three columns.',
  api:'panes[i].y.set(slot, base, t0+i*.03)   narrow: focus(article)   hl.to(stacked/columns)',
  init(st){
    const wl = $(st,'.wl'), sw = new Swap(0);
    const L = ['Three columns','Stacked · focus in article'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; $(st,'.hl').appendChild(e); return e; });
    const P = [['Index', 120, 64, 'Chapters<br>Notes<br>Links'], ['Article', 0, 128, 'The layout reorders itself and focus follows, so keyboard order always matches what you see.'], ['Aside', 104, 64, 'About<br>Share']];
    const wall = new Track(0);
    const panes = P.map((p, i) => { const d = document.createElement('div'); d.className = 'card small';
      d.style.cssText += ';position:absolute;top:0;left:0;padding:12px 14px;font-size:13px;line-height:1.5;overflow:hidden';
      d.tabIndex = -1;
      d.innerHTML = '<b style="font-size:13px">' + p[0] + '</b><div class="muted" style="font-size:12px;margin-top:4px">' + p[2] + '</div>';
      wl.appendChild(d); return { d, x:new Track(0), y:new Track(0), o:new Track(1) }; });
    panes[1].d.querySelector('b').tabIndex = -1; panes[1].d.querySelector('b').setAttribute('tabindex', '-1');
    let narrow = false;
    const lay = inst => { const W = wl.clientWidth || 520, G = 8, t0 = now(), dead = inst || REDUCE;
      const s = narrow ? [[0, 136, W, 64], [0, 0, W, 128], [0, 208, W, 64]] : [[0, 0, 120, 200], [128, 0, W-240, 200], [W-104, 0, 104, 200]];
      panes.forEach((c, i) => { c.d.style.width = px(s[i][2]); c.d.style.height = px(s[i][3]);
        if (dead){ c.x.jump(s[i][0]); c.y.jump(s[i][1]); c.o.jump(1); }
        else { c.x.set(s[i][0], S.base, t0+i*.03); c.y.set(s[i][1], S.base, t0+i*.03); c.o.jump(.45); c.o.set(1, S.base, t0+i*.03); } });
      const h = narrow ? 272 : 200;
      if (dead) wall.jump(h); else wall.set(h, S.base, t0);
      sw.to(narrow ? 1 : 0);
      if (narrow && !dead && $(st,'.ff').checked) setTimeout(() => panes[1].d.focus({ preventScroll:true }), 320); };
    $(st,'.bN').onclick = () => { narrow = true; lay(); };
    $(st,'.bW').onclick = () => { narrow = false; lay(); };
    requestAnimationFrame(() => lay(true)); lay(true);
    return t => { panes.forEach(c => { c.d.style.transform = `translate(${px(c.x.at(t))},${px(c.y.at(t))})`; fade(c.d, c.o.at(t), null); });
      wl.style.height = px(wall.at(t)); L.forEach((e,k) => sw.apply(e, k, t)); };
  }});
