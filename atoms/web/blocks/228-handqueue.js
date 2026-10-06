atom({ id:'handqueue', cat:'Video calls', name:'Hand-raise queue', block:'video call (hand raise, queue)', fam:['M','S'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:stretch"><b style="font-size:15px;font-weight:600;line-height:1.5">Hand-raise queue</b><span class="small muted" style="font-size:12px;line-height:1.5;margin-top:-4px">Hands rise in order; lowering clears the queue.</span><div class="card col" style="padding:14px 16px;gap:10px"><div class="row" style="gap:8px;align-items:center;justify-content:space-between"><span class="qh" style="position:relative;display:inline-block;min-width:120px;height:22px;font-size:13px;font-weight:600;line-height:22px"></span><span class="qn num" style="font-size:12px;font-variant-numeric:tabular-nums"></span></div><div class="ql col" style="gap:6px"></div><div class="ros col" style="border-top:1px solid var(--line-soft);padding-top:4px"></div><label class="row small muted" style="gap:6px;font-size:12px;border-top:1px solid var(--line-soft);padding-top:8px"><input type="checkbox" class="sl"> slow stagger</label></div></div><div class="hint">Lower every hand to clear the queue</div>`,
  desc:'Raised hands rise into the queue staggered 40ms apart on base, each with a rolling order digit. Lowering fades a row out; when the last hand lowers, the header swaps to a clear terminal.',
  api:'row.{y,o}.set(1, S.base, t0 + i*0.04)   badge.set(rank)   last lower: qh.to(1)',
  init(st){
    const N = ['Maya','Theo','Ada','Jonas'];
    const ros = $(st,'.ros'), ql = $(st,'.ql'), qh = $(st,'.qh'), qn = $(st,'.qn'), slow = $(st,'.sl');
    const hsw = new Swap(0);
    ['Up next','Queue clear ✓'].forEach((s,k) => { const e = document.createElement('span'); e.className = 'layer';
      e.style.cssText = 'font-size:13px;font-weight:600;line-height:22px;white-space:nowrap' + (k ? ';color:var(--success)' : ''); e.textContent = s; qh.appendChild(e); });
    const rows = N.map((n,i) => { const r = document.createElement('div'); r.className = 'row';
      r.style.cssText = 'gap:8px;align-items:center;justify-content:space-between;padding:8px 0' + (i ? ';border-top:1px solid var(--line-soft)' : '');
      r.innerHTML = `<span style="font-size:13.5px;line-height:1.5">${n}</span>`;
      const b = document.createElement('button'); b.className = 'btn'; b.style.cssText = 'min-height:32px;border-radius:8px';
      b.onclick = () => order.includes(i) ? lower(i) : raise(i);
      r.appendChild(b); ros.appendChild(r); return { b }; });
    const items = new Map();
    let order = [1];
    const raise = id => { order.push(id); draw(id); };
    const lower = id => { const it = items.get(id); if (!it) return;
      it.o.set(0, S.snap); it.h.set(0, S.base);
      setTimeout(() => { order = order.filter(x => x !== id); draw(); }, 320); };
    const draw = (fresh = -1) => { const t0 = now(), gap = slow.checked ? .09 : .04;
      ql.innerHTML = '';
      order.forEach((id,i) => { let it = items.get(id);
        if (!it){ const w = document.createElement('div'); w.style.cssText = 'overflow:hidden';
          const r = document.createElement('div'); r.className = 'row'; r.style.cssText = 'gap:8px;align-items:center;height:36px';
          const bd = document.createElement('span'); bd.style.cssText = 'font-variant-numeric:tabular-nums;font-size:13px';
          const dg = new Digits(bd, 1); dg.set(String(i + 1), true);
          const nm = document.createElement('span'); nm.style.cssText = 'font-size:13.5px;line-height:1.5;flex:1'; nm.textContent = N[id];
          r.append(bd, nm); w.appendChild(r); ql.appendChild(w);
          it = { w, r, dg, y:new Track(id === fresh ? 14 : 0), o:new Track(id === fresh ? 0 : 1), h:new Track(36) };
          if (id === fresh){ it.y.set(0, S.base, t0 + i*gap); it.o.set(1, S.base, t0 + i*gap); }
          items.set(id, it);
        } else { it.dg.set(String(i + 1)); ql.appendChild(it.w); } });
      for (const [id] of items) if (!order.includes(id)) items.delete(id);
      hsw.to(order.length ? 0 : 1);
      rows.forEach((r,i) => { const up = order.includes(i); r.b.textContent = up ? 'Lower' : 'Raise'; r.b.setAttribute('aria-pressed', up); });
      qn.textContent = order.length ? order.length + ' waiting' : ''; };
    draw();
    return t => { for (const [,it] of items){ it.w.style.height = px(Math.max(0, it.h.at(t)));
        it.r.style.opacity = clamp(it.o.at(t)).toFixed(3);
        it.r.style.transform = `translateY(${it.y.at(t).toFixed(2)}px)`;
        it.dg.render(t); }
      [0,1].forEach(k => hsw.apply(qh.children[k], k, t)); };
  }});
