

atom({ id:'facets', cat:'Dynamic', name:'Filtered collection', block:'collection-browser, collection, entry-list', fam:['M','E','X'], wide:true, tall:true,
  html:`<div class="col" style="width:min(620px,94%);gap:12px"><div class="seg fc" style="align-self:flex-start"><div class="ind"></div><button>All</button><button>Essays</button><button>Notes</button><button>Photos</button></div><div class="cg" style="position:relative"></div></div>`,
  desc:'Cards that leave the filter blur out in place. Cards that stay spring to their new grid slot, staggered by slot, and the grid height follows.',
  api:'card.{x,y}.set(slot(i), S.base, t + i·0.03)   card.o.set(match)',
  init(st){
    const seg = $(st,'.fc'), ind = $(seg,'.ind'), btns = $$(seg,'button'), cg = $(st,'.cg');
    const C = [['Essays','A smaller homepage'],['Photos','Harbor, 6am'],['Notes','Fixing the font flash'],['Essays','On member pricing'],['Photos','Fog bank'],['Notes','Three CSS habits'],['Essays','Why we sunset comments'],['Photos','Concrete stair']];
    const cards = C.map(([k,h]) => { const c = document.createElement('div'); c.className = 'card'; c.style.cssText += 'position:absolute;left:0;top:0;height:78px;padding:12px;display:flex;flex-direction:column;justify-content:space-between';
      c.innerHTML = `<span class="small muted">${k}</span><b class="small" style="font-size:14px">${h}</b>`; cg.appendChild(c); return { c, k, x:new Track(0), y:new Track(0), o:new Track(1) }; });
    const e = edges(0,0), H = new Track(0); let f = 'All';
    const lay = inst => { const W = cg.clientWidth, cols = W > 480 ? 4 : 2, cw = (W - (cols-1)*10)/cols, t0 = now(); let n = 0;
      cards.forEach(c => { c.c.style.width = px(cw); const on = f === 'All' || c.k === f;
        if (on){ const x = (n % cols)*(cw + 10), y = Math.floor(n/cols)*88; inst || c.o.target === 0 ? (c.x.jump(x), c.y.jump(y)) : (c.x.set(x, S.base, t0 + n*.03), c.y.set(y, S.base, t0 + n*.03)); n++; }
        c.o.set(on ? 1 : 0, on ? S.base : S.snap, on ? t0 + EXIT : t0); c.c.style.pointerEvents = on ? 'auto' : 'none'; });
      const h = Math.ceil(n/cols)*88 - 10; inst ? H.jump(h) : H.set(h); };
    const sel = (i, inst) => { f = btns[i].textContent; const b = btns[i]; inst ? e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); lay(inst); };
    btns.forEach((b,i) => b.onclick = () => sel(i)); const init = () => sel(btns.findIndex(b => b.textContent === f), true); document.fonts.ready.then(init); requestAnimationFrame(init); addEventListener('resize', () => lay(true));
    return t => { const a = e.A.at(t), b = e.B.at(t); Object.assign(ind.style,{transform:`translate(${px(a)},3px)`,width:px(b-a),height:'calc(100% - 6px)'});
      cg.style.height = px(H.at(t)); cards.forEach(c => { c.c.style.left = px(c.x.at(t)); c.c.style.top = px(c.y.at(t)); fade(c.c, c.o.at(t), null); c.c.style.visibility = c.o.at(t) < .01 ? 'hidden' : 'visible'; }); };
  }});