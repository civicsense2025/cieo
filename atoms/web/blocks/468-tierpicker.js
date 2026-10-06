

atom({ id:'tierpicker', cat:'Newsletter', name:'Tier picker', block:'newsletter, pricing', fam:['M','S'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:center;line-height:1.55"><div class="seg pt" style="display:flex;position:relative"><div class="ind" style="position:absolute;left:0;top:0"></div><button style="min-height:36px;border-radius:9px">Monthly</button><button style="min-height:36px;border-radius:9px">Yearly</button></div><div class="card col" style="width:100%;padding:16px;gap:8px"><div class="row" style="justify-content:space-between;align-items:center"><b style="font-size:15px;font-weight:600">Plus</b><span class="sv" style="font-size:12px;font-weight:600;background:var(--accent-tint);color:var(--accent);padding:2px 8px;border-radius:999px">Save 20%</span></div><div class="row" style="align-items:baseline;gap:2px"><b style="font-size:15px;font-weight:600">$</b><b class="pr num" style="font-size:28px;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.45"></b><span class="muted" style="font-size:12.5px">/mo</span></div><div class="bl" style="position:relative;height:22px;font-size:13px;line-height:1.55"></div><button class="go" style="height:40px;min-height:36px;border-radius:10px;border:0;background:var(--ink);color:var(--card);font-weight:600;font-size:14px;cursor:pointer">Choose Plus</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;font-size:12.5px"><input type="checkbox" class="an" checked> annual savings note</label></div></div>`,
  desc:'The plate glides with a trailing edge. Only changed price digits roll, benefits blur-swap and the savings pill pops in on the soft spring. Yearly holds as the terminal.',
  api:'e.go(l, r) · digits.set(price) · ben.to(i) · save.set(yearly, S.soft)',
  init(st){
    const seg = $(st,'.pt'), ind = $(seg,'.ind'), btns = $$(seg,'button'), sv = $(st,'.sv'), bl = $(st,'.bl'), an = $(st,'.an');
    const e = edges(0,0), d = new Digits($(st,'.pr'), 2), sw = new Swap(0), so = new Track(0);
    const B = ['Full archive + comments','Everything, billed $96 yearly'].map(s => { const x = document.createElement('span'); x.className = 'layer'; x.style.justifyContent = 'flex-start'; x.textContent = s; bl.appendChild(x); return x; });
    let k = 0; d.set('12', true);
    const sel = (i, inst) => { k = i; const b = btns[i];
      if (inst){ e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth); d.set(i ? '96' : '12', true); sw.cur = i; sw.prev = null; so.jump(i); }
      else { e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); d.set(i ? '96' : '12'); sw.to(i); so.set(i, S.soft); } };
    btns.forEach((b,i) => b.onclick = () => sel(i));
    const init = () => sel(k, true); document.fonts.ready.then(init); requestAnimationFrame(init);
    return t => { const a = e.A.at(t), b = e.B.at(t);
      Object.assign(ind.style,{transform:`translate(${px(a)},3px)`,width:px(b-a),height:'calc(100% - 6px)',background:'var(--raised)',borderRadius:'7px'});
      d.render(t); B.forEach((x,j) => sw.apply(x,j,t));
      const o = clamp(so.at(t)); sv.style.opacity = (an.checked ? o : 0).toFixed(3);
      sv.style.transform = `scale(${(.8+.2*o).toFixed(4)})`; sv.style.visibility = o < .02 ? 'hidden' : 'visible'; };
  }});
