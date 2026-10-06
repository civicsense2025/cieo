atom({ id:'backlink', cat:'Writing', name:'Backlink popover', block:'richtext editor, backlinks', fam:['X','S','T','E'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="margin:0 auto;width:min(340px,92%);gap:8px;padding:12px"><p class="small" style="line-height:1.7;margin:0">The launch plan lives in <button class="lk" aria-haspopup="dialog" aria-expanded="false" style="border:0;background:none;padding:0;color:var(--accent);font:inherit;cursor:pointer">[[launch notes]]</button> this quarter.</p><div class="pv card" role="dialog" aria-label="Backlinks" style="position:relative;width:100%;padding:14px;transform-origin:50% 0;visibility:hidden"><div class="seg tabsx" role="tablist" style="margin-bottom:8px"><div class="ind"></div><button role="tab">Linked</button><button role="tab">Unlinked</button></div><div class="pans" style="position:relative;overflow:hidden"><i class="hl" style="position:absolute;left:0;right:0;top:0;border-radius:7px;background:var(--raised)"></i></div></div></div><div class="hint">Open [[launch notes]], then switch tabs</div>`,
  desc:'The popover grows out of the link. Switching tabs swaps the old list out before the new rows rise 30ms apart, and the highlight trails the hovered row by 60ms.',
  api:'pv.o.set(open, open ? S.base : S.snap)   swap.to(tab)   rows: o.set(1, S.base, t+.1+i*.03)   hi.go(top, top+H)',
  init(st){
    const lk = $(st,'.lk'), pv = $(st,'.pv'), pans = $(st,'.pans'), hl = $(st,'.hl');
    const seg = $(st,'.tabsx'), ind = $(seg,'.ind'), btns = $$(seg,'button');
    const D = [[['Spring launch','3 links'],['Pricing table','2 links'],['Member letter','1 link']],[['Old roadmap','no links'],['Press kit','no links']]];
    const o = new Track(0), sw = new Swap(0), ie = edges(0,0), te = edges(0,0), h = new Track(0);
    const layers = D.map(() => { const d = document.createElement('div'); d.className = 'layer';
      Object.assign(d.style,{whiteSpace:'normal',alignItems:'stretch',justifyContent:'flex-start',padding:'2px',bottom:'auto'});
      pans.appendChild(d); return d; });
    const rowss = D.map((list,li) => list.map(([t,m]) => { const d = document.createElement('div');
      d.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 10px;font-size:14px;border-radius:7px;cursor:default';
      d.innerHTML = '<span>' + t + '</span><span class="muted small">' + m + '</span>';
      layers[li].appendChild(d);
      const r = { d, o:new Track(li === 0 ? 1 : 0) };
      d.onpointerenter = () => { if (REDUCE) ie.jump(d.offsetTop, d.offsetTop + d.offsetHeight); else ie.go(d.offsetTop, d.offsetTop + d.offsetHeight); };
      return r; }));
    const geo = b => [b.offsetLeft, b.offsetLeft + b.offsetWidth];
    const sel = (k, inst) => { btns.forEach((b,j) => b.setAttribute('aria-selected', k === j));
      const t0 = now(), inst2 = inst || REDUCE;
      if (inst2){ sw.cur = k; sw.prev = null; sw.t = -9; } else sw.to(k);
      rowss.forEach((rs,li) => rs.forEach((r,i) => {
        if (li === k) inst2 ? r.o.jump(1) : r.o.set(1, S.base, t0 + EXIT + i*.03);
        else inst2 ? r.o.jump(0) : r.o.set(0, S.snap); }));
      const f = rowss[k][0].d, top = f.offsetTop, Hh = f.offsetHeight;
      inst2 ? ie.jump(top, top + Hh) : ie.go(top, top + Hh);
      const [l,r2] = geo(btns[k]); inst ? te.jump(l, r2) : te.go(l, r2);
      inst ? h.jump(layers[k].offsetHeight) : h.set(layers[k].offsetHeight); };
    const set = v => { if (REDUCE) o.jump(v ? 1 : 0); else openSet(o, v); lk.setAttribute('aria-expanded', v); };
    lk.onclick = () => set(!o.target);
    outside(st, [lk, pv], () => set(false));
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape'){ set(false); lk.focus(); } });
    btns.forEach((b,i) => b.onclick = () => sel(i));
    const init2 = () => sel(0, true); document.fonts.ready.then(init2); requestAnimationFrame(init2);
    return t => { pop(pv, o.at(t), -6);
      const l = te.A.at(t), r2 = te.B.at(t);
      Object.assign(ind.style,{transform:'translate(' + px(l) + ',3px)',width:px(r2-l),height:'calc(100% - 6px)'});
      pans.style.height = px(h.at(t));
      layers.forEach((el,k) => sw.apply(el,k,t));
      rowss.forEach(rs => rs.forEach(r => { const v = clamp(r.o.at(t)); fade(r.d, v, (1-v)*8); }));
      plate(hl, ie.A.at(t), ie.B.at(t)); };
  }});
