atom({ id:'snippeted', cat:'SEO', name:'Snippet preview editor', block:'seo snippet, serp preview', fam:['M','S','E'],
  html:`<div class="col" style="width:min(400px,94%);gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">Snippet preview</b><div class="seg tabsx" role="tablist" style="align-self:flex-start"><div class="ind"></div><button role="tab">Desktop</button><button role="tab">Mobile</button></div><div class="col" style="gap:8px"><label class="small" for="sn-t" style="font-weight:500;font-size:13px">Title</label><input id="sn-t" value="Spring launch: new member tiers and yearly pricing" style="border:1.5px solid var(--line);border-radius:9px;padding:8px 10px;background:var(--card);color:var(--ink);font:14px/1.45 var(--sans);outline:none"><label class="small" for="sn-d" style="font-weight:500;font-size:13px">Description</label><textarea id="sn-d" rows="2" style="resize:none;border:1.5px solid var(--line);border-radius:9px;padding:8px 10px;background:var(--card);color:var(--ink);font:13px/1.55 var(--sans);outline:none">Members get first-day access to every drop, and yearly plans save 20% over monthly billing.</textarea></div><div class="card pv" style="padding:14px 16px;position:relative;overflow:hidden"><div style="position:relative;height:22px"><div class="layer t1" style="justify-content:flex-start;font-size:13px;color:var(--accent);font-weight:500"></div><div class="layer t2" style="justify-content:flex-start;font-size:13px;color:var(--accent);font-weight:500"></div></div><div style="position:relative;height:40px"><div class="layer d1" style="justify-content:flex-start;align-items:flex-start;white-space:normal;font-size:13px;line-height:1.5;color:var(--muted)"></div><div class="layer d2" style="justify-content:flex-start;align-items:flex-start;white-space:normal;font-size:13px;line-height:1.5;color:var(--muted)"></div></div><div class="xt" style="overflow:hidden"><div class="small" style="display:flex;gap:6px;align-items:center;font-size:12.5px;color:var(--muted)">★ 4.8 · 212 reviews · Updated Mar 2026</div></div></div><div class="row small muted" style="gap:6px;font-size:12.5px"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="rich" checked> rich result extras</label></div></div>`,
  desc:'Desktop and mobile tabs morph the preview height on base while the title and description swap with blur as you type. The rich-result row fades in and out, and the truncated preview holds as the terminal state.',
  api:'pv.h.set(measure(next)) title.swap.to(text) desc.swap.to(text) rich.o.set(on)',
  init(st){
    const pv = $(st,'.pv'), rich = $(st,'.rich'), xt = $(st,'.xt');
    const seg = $(st,'.tabsx'), ind = $(seg,'.ind'), btns = $$(seg,'button');
    const ti = $(st,'#sn-t'), de = $(st,'#sn-d');
    const cut = (s,l) => s.length > l ? s.slice(0, l-1).replace(/\s+\S*$/, '') + ' …' : s;
    const t1 = $(st,'.t1'), t2 = $(st,'.t2'), d1 = $(st,'.d1'), d2 = $(st,'.d2');
    const swT = new Swap(0), swD = new Swap(0), h = new Track(0), e = edges(0,0), ro = new Track(0);
    const XH = { full:0, slim:0 };
    const paint = () => { t1.textContent = cut(ti.value, 60); d1.textContent = cut(de.value, 155);
      t2.textContent = cut(ti.value, 45); d2.textContent = cut(de.value, 120); };
    const full = el => { const v = el.style.display; el.style.display = ''; el.style.height = 'auto'; const x = el.offsetHeight; el.style.display = v; return x; };
    const measure = k => { const mob = k === 1; pv.style.maxWidth = mob ? '280px' : 'none'; paint();
      const x = pv.scrollHeight; return x; };
    const sel = (k, inst) => { btns.forEach((b,j) => b.setAttribute('aria-selected', k === j));
      const b = btns[k];
      if (inst){ e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth); h.jump(measure(k)); swT.cur = k; swT.prev = null; swT.t = -9; swD.cur = k; swD.prev = null; swD.t = -9; }
      else { e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); h.set(measure(k)); swT.to(k); swD.to(k); } };
    btns.forEach((b,i) => b.onclick = () => sel(i));
    let deb = 0;
    const onType = () => { paint(); clearTimeout(deb); deb = setTimeout(() => { if (!REDUCE) h.set(pv.scrollHeight); else h.jump(pv.scrollHeight); }, 120); };
    ti.oninput = onType; de.oninput = onType;
    const syncRich = inst => { XH.full = XH.full || 22; const to = rich.checked ? 1 : 0;
      if (inst || REDUCE) ro.jump(to); else ro.set(to); };
    rich.onchange = () => syncRich(); syncRich(true);
    paint();
    const init = () => { sel(0, true); }; document.fonts.ready.then(init); requestAnimationFrame(init);
    return t => { const l = e.A.at(t), r = e.B.at(t);
      Object.assign(ind.style,{transform:'translate(' + px(l) + ',3px)',width:px(r-l),height:'calc(100% - 6px)'});
      pv.style.height = px(h.at(t)); pv.style.maxWidth = swT.cur === 1 ? '300px' : 'none';
      swT.apply(t1,0,t); swT.apply(t2,1,t); swD.apply(d1,0,t); swD.apply(d2,1,t);
      const k = clamp(ro.at(t)); xt.style.height = px(k*XH.full); xt.style.opacity = k.toFixed(3); xt.style.visibility = k < .02 ? 'hidden' : 'visible'; };
  }});
