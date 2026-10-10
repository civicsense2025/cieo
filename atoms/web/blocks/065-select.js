

atom({ id:'select', cat:'Inputs', name:'Select', block:'form, Select primitive', fam:['X','E','S'], tall:true,
  html:`<div style="position:absolute;top:56px;left:50%;transform:translateX(-50%);width:min(264px,calc(100% - 48px))"><button class="btn tr" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-label="Status" style="width:100%;display:flex;align-items:center;gap:8px;height:48px;border:1.5px solid var(--muted)"><span class="lw" style="position:relative;flex:1;height:20px"></span>${ic(I.chev,14)}</button><div class="lb card" role="listbox" style="position:absolute;top:56px;left:0;right:0;padding:8px;transform-origin:50% 0;visibility:hidden"><i class="hl" style="position:absolute;left:8px;right:8px;top:0;border-radius:7px;background:var(--raised)"></i></div></div>`,
  desc:'The list grows from the trigger. A highlight plate follows hover and arrow keys with lagging edges. Choosing moves the check, closes the list and swaps the trigger label.',
  api:'list.o.set(open)   hl.go(top, bottom)   label.to(i)   check[i].set(1)',
  init(st){
    const tr = $(st,'.tr'), lb = $(st,'.lb'), hl = $(st,'.hl'), lw = $(st,'.lw');
    const O = [['Draft','var(--faint)'],['In review','var(--warning)'],['Scheduled','var(--accent)'],['Published','var(--success)'],['Archived','var(--muted)']];
    const dot = c => `<i style="width:8px;height:8px;border-radius:50%;background:${c};flex:none"></i>`;
    const labels = O.map(([n,c]) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.innerHTML = dot(c) + n; lw.appendChild(e); return e; });
    const opts = O.map(([n,c],i) => { const b = document.createElement('div'); b.setAttribute('role','option'); b.style.cssText = 'position:relative;display:flex;align-items:center;gap:8px;padding:8px 16px;min-height:40px;font-size:12px;cursor:pointer;border-radius:7px';
      b.innerHTML = dot(c) + `<span style="flex:1">${n}</span><span class="ck">${ic(I.check,14,2.5)}</span>`; lb.appendChild(b); return { b, ck:$(b,'.ck'), t:new Track(i === 3 ? 1 : 0) }; });
    const o = new Track(0), e = edges(0,0), sw = new Swap(3); let open = false, sel = 3, hi = 3;
    const geo = i => [opts[i].b.offsetTop, opts[i].b.offsetTop + opts[i].b.offsetHeight];
    lb.id='select-options';tr.setAttribute('aria-controls','select-options');opts.forEach((x,i)=>{x.b.id=`select-option-${i}`;x.b.setAttribute('aria-selected',String(i===sel))});const setOpen = v => { open = v; openSet(o, v); tr.setAttribute('aria-expanded', v); if (v){ hi = sel; e.jump(...geo(hi)); } };
    const move = i => { hi = (i + O.length) % O.length;tr.setAttribute("aria-activedescendant",opts[hi].b.id); e.go(...geo(hi)); };
    const choose = i => { sel = i; sw.to(i); opts.forEach((x,j) => { x.t.set(j === i ? 1 : 0); x.b.setAttribute('aria-selected', j === i); }); setOpen(false); tr.focus(); };
    tr.onclick = () => setOpen(!open);
    tr.onkeydown = ev => { const k = ev.key;
      if (k === 'ArrowDown' || k === 'ArrowUp'){ ev.preventDefault(); open ? move(hi + (k === 'ArrowDown' ? 1 : -1)) : setOpen(true); }
      else if ((k === 'Enter' || k === ' ') && open){ ev.preventDefault(); choose(hi); } else if (k === 'Escape') setOpen(false); };
    opts.forEach((x,i) => { x.b.onpointerenter = () => { if (i !== hi) move(i); }; x.b.onclick = () => choose(i); });
    outside(st, [tr, lb], () => open && setOpen(false));
    return t => { pop(lb, o.at(t)); plate(hl, e.A.at(t), e.B.at(t)); labels.forEach((l,k) => sw.apply(l,k,t));
      opts.forEach(x => { const p = clamp(x.t.at(t)); x.ck.style.opacity = p.toFixed(3); x.ck.style.transform = `scale(${(.6+.4*p).toFixed(3)})`; }); };
  }});