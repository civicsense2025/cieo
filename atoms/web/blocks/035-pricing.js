

/* ---------- Commerce ---------- */
atom({ id:'pricing', cat:'Commerce', name:'Pricing toggle', block:'pricing, toggle', fam:['E','S','X'], tall:true,
  html:`<div class="col" style="align-items:center;gap:18px"><div class="seg pt"><div class="ind"></div><button>Monthly</button><button>Yearly</button></div><div class="card col" style="width:220px;padding:18px;gap:6px"><div class="row" style="justify-content:space-between"><span class="small muted">Studio</span><span class="sv small" style="background:var(--accent-tint);color:var(--accent);font-weight:600;padding:2px 8px;border-radius:999px">Save 20%</span></div><div class="row" style="align-items:baseline;gap:2px"><b style="font-size:40px;letter-spacing:-.03em">$</b><b class="pr" style="font-size:40px;letter-spacing:-.03em"></b><span class="small muted">/mo</span></div><div class="bl small muted" style="position:relative;height:20px"></div></div></div>`,
  desc:'The segment indicator uses lagging edges. Only the digits that change roll. The billing note swaps and the savings pill enters.',
  api:'digits.set(price)   note.to(mode)   save.o.set(yearly)',
  init(st){
    const seg = $(st,'.pt'), ind = $(seg,'.ind'), btns = $$(seg,'button'), d = new Digits($(st,'.pr'), 2), sv = $(st,'.sv'), bl = $(st,'.bl');
    const N = ['Billed monthly','Billed $228 yearly'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; bl.appendChild(e); return e; });
    const e = edges(0,0), so = new Track(0), sw = new Swap(0); let k = 0; d.set('24', true);
    const sel = (i, inst) => { k = i; const b = btns[i]; inst ? e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); if (!inst){ d.set(i ? '19' : '24'); sw.to(i); so.set(i); } };
    btns.forEach((b,i) => b.onclick = () => sel(i)); const init = () => sel(k, true); document.fonts.ready.then(init); requestAnimationFrame(init);
    return t => { const a = e.A.at(t), b = e.B.at(t); Object.assign(ind.style,{transform:`translate(${px(a)},3px)`,width:px(b-a),height:'calc(100% - 6px)'});
      d.render(t); N.forEach((el,j) => sw.apply(el,j,t)); const o = clamp(so.at(t)); sv.style.opacity = o.toFixed(3); sv.style.transform = `scale(${(.85+.15*o).toFixed(4)})`; };
  }});