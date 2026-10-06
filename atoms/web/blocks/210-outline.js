atom({ id:'outline', cat:'Writing', name:'Outline zoom', block:'outline, document map, breadcrumbs', fam:['M','X'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="margin:0 auto;width:min(320px,90%);gap:8px;padding:12px"><div class="cr small muted" style="position:relative;height:20px"></div><div class="card col br" style="padding:14px 16px;gap:8px;transform-origin:top left"><b class="ft" style="font-size:15px">Spring essay</b><div class="kids col" style="gap:8px"></div></div><div class="sib small muted">Winter notes · Reading list · Drafts</div><div class="row" style="gap:8px"><button class="btn bk">Back</button><span style="flex:1"></span><button class="btn d1">1</button><button class="btn d2">2</button></div></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Zoom to child</span></label><div class="hint">Pick a child to zoom in</div>`,
  desc:'Zooming swaps the breadcrumb trail. The opened branch grows from almost full size. Its children land one after another while the old siblings wash out. Back walks the same path in reverse.',
  api:'crumb.to(depth)   br.sc.set(1, base) from .97   kid[i].o.set(1, base, t0+i*.03)   sib.o.set(0)   back: reverse',
  init(st){
    const cr = $(st,'.cr'), br = $(st,'.br'), ft = $(st,'.ft'), kids = $(st,'.kids'), sib = $(st,'.sib');
    const tree = { t:'Spring essay', k:['Opening image','Cold open','Thesis'], c:{ 'Opening image':['Market at dawn','The bell'],'Cold open':['A name','A debt'],'Thesis':['Attention','Care'] } };
    let path = [];
    const crumbs = [[`Spring essay`],[`Spring essay / Opening image`]].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; cr.appendChild(e); return e; });
    const sw = new Swap(0), sc = new Track(1), so = new Track(1); let kidT = [];
    const draw = () => { kids.innerHTML = ''; const list = path.length ? tree.c[path[0]] : tree.k; const t0 = now();
      kidT = list.map(() => new Track(0));
      list.forEach((k,i) => { const b = document.createElement('button'); b.className = 'btn'; b.textContent = k; b.style.textAlign = 'left';
        b.onclick = () => { if (!path.length && tree.c[k]){ path = [k]; ft.textContent = k; sw.to(1); sc.release(.97, 0, 1, S.base); so.set(0); draw(); } };
        kids.appendChild(b); kidT[i].set(1, S.base, t0 + i*.03); });
      if (!path.length) so.set(1);
    };
    const back = () => { if (!path.length) return; path = []; ft.textContent = tree.t; sw.to(0); sc.release(.97, 0, 1, S.base); draw(); };
    $(st,'.bk').onclick = back; $(st,'.d1').onclick = back;
    $(st,'.d2').onclick = () => { if (!path.length){ path = ['Opening image']; ft.textContent = path[0]; sw.to(1); sc.release(.97, 0, 1, S.base); so.set(0); draw(); } };
    draw();
    return t => { crumbs.forEach((e,k) => sw.apply(e,k,t));
      const s = .97 + .03*clamp(sc.at(t)); br.style.transform = `scale(${s.toFixed(4)})`;
      [...kids.children].forEach((b,i) => { const o = kidT[i] ? clamp(kidT[i].at(t)) : 1;
        b.style.opacity = o.toFixed(3); b.style.transform = `translateY(${((1-o)*8).toFixed(2)}px)`; });
      fade(sib, so.at(t), 0, false); };
  }});
