

/* ---------- Content ---------- */
atom({ id:'tabs', cat:'Content', name:'Tabs with panel', block:'tabs', fam:['E','S','M'], tall:true,
  html:`<div class="col" style="width:min(380px,90%);gap:16px"><div class="seg tabsx" role="tablist" aria-label="Workspace sections"><div class="ind"></div><button type="button" role="tab">Overview</button><button type="button" role="tab">Activity</button><button type="button" role="tab">Billing</button></div><div class="card panel" style="position:relative;overflow:hidden"></div></div>`,
  desc:'Indicator edges lag each other. The panel text swaps with blur while the panel height morphs to fit.',
  api:'ind.go(l, r)   panel.h.set(measure(next))   swap.to(i)',
  init(st){
    const seg = $(st,'.tabsx'), ind = $(seg,'.ind'), btns = $$(seg,'button'), panel = $(st,'.panel');
    const TXT = ['Three pages published this week. Traffic is up 18% on the pricing page since the new hero shipped.',
      'Maya edited “Spring launch”. Theo commented on the pricing table. Two new subscribers joined.',
      'Studio plan, $24 per month. Next invoice on October 12. Visa ending 4242.'];
    const layers = TXT.map(s => { const d = document.createElement('div'); d.className = 'layer'; Object.assign(d.style,{whiteSpace:'normal',alignItems:'flex-start',justifyContent:'flex-start',padding:'24px',bottom:'auto'}); d.textContent = s; panel.appendChild(d); return d; });
    const e = edges(0,0), h = new Track(0), sw = new Swap(0);
    const geo = b => [b.offsetLeft, b.offsetLeft + b.offsetWidth];
    const sel = (i, inst) => { const [l,r] = geo(btns[i]); btns.forEach((b,j)=>{b.setAttribute('aria-selected', i===j);b.tabIndex=i===j?0:-1;}); layers.forEach((el,j)=>el.setAttribute('aria-hidden',j!==i)); panel.setAttribute('aria-labelledby',btns[i].id);
      inst ? (e.jump(l,r), h.jump(layers[i].offsetHeight)) : (e.go(l,r), h.set(layers[i].offsetHeight), sw.to(i)); };
    btns.forEach((b,i) => {b.id='cieo-tab-'+i;b.setAttribute('aria-controls','cieo-tab-panel');b.onclick=()=>sel(i);b.onkeydown=ev=>{let n=i;if(ev.key==='ArrowRight')n=(i+1)%btns.length;else if(ev.key==='ArrowLeft')n=(i+btns.length-1)%btns.length;else if(ev.key==='Home')n=0;else if(ev.key==='End')n=btns.length-1;else return;ev.preventDefault();sel(n);btns[n].focus();};}); panel.id='cieo-tab-panel';panel.setAttribute('role','tabpanel');
    const init = () => sel(sw.cur, true); document.fonts.ready.then(init); requestAnimationFrame(init); new ResizeObserver(init).observe(seg);
    return t => { const l = e.A.at(t), r = e.B.at(t); Object.assign(ind.style,{transform:`translate(${px(l)},4px)`,width:px(r-l),height:'calc(100% - 8px)'});
      panel.style.height = px(h.at(t)); layers.forEach((el,k) => sw.apply(el,k,t)); };
  }});