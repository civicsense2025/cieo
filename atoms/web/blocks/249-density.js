

atom({ id:'density', cat:'Layout', name:'Grid density switch', block:'list, table, inbox', fam:['D','T'], wide:true,
  html:`<div class="col" style="gap:12px;align-items:center"><div style="max-width:420px;text-align:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Grid density switch</b><p class="muted" style="font-size:13px;line-height:1.5;margin:6px 0 0">Row height and gap ease on a soft spring while rows glide to their slots. The row measure rolls over.</p></div><div class="row small muted" style="gap:8px;align-items:center"><span>row</span><span class="rh" style="display:inline-flex;min-width:20px;justify-content:flex-end;font-variant-numeric:tabular-nums"></span><span>px</span><span aria-hidden="true">·</span><span class="dn" style="position:relative;display:inline-block;min-width:88px;min-height:20px"></span></div><div class="dy card" style="position:relative;width:min(360px,92%);padding:14px 16px;overflow:hidden"><div class="wl" style="position:relative"></div></div><div class="row" style="gap:8px;align-items:center"><button class="btn bCo" style="min-height:32px">Comfortable</button><button class="btn bCp" style="min-height:32px">Compact</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="st" checked> stagger</label></div></div><div class="hint">Switch density and watch the rows glide</div>`,
  desc:'Row height and gap retarget on a soft spring while every row glides to its recomputed slot with a stagger. The pixel measure rolls its digits and the mode swaps over.',
  api:'h.set(56/40, soft); gap.set(8/4, soft)   rows[i].y.set(i*(h+gap), base, t0+i*.03)   rh.set(h)',
  init(st){
    const wl = $(st,'.wl'), dg = new Digits($(st,'.rh'), 2), sw = new Swap(0);
    const L = ['Comfortable','Compact'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; $(st,'.dn').appendChild(e); return e; });
    const N = [['Invoice','#4821'],['Receipt','#4822'],['Contract','#4823'],['Brief','#4824'],['Memo','#4825']];
    const h = new Track(56), gap = new Track(8), wall = new Track(0);
    const rows = N.map(n => { const r = document.createElement('div'); r.className = 'card row small';
      r.style.cssText += ';position:absolute;top:0;left:0;right:0;padding:0 12px;font-size:13px;line-height:1.5;align-items:center;gap:10px;overflow:hidden;white-space:nowrap';
      r.innerHTML = '<span style="display:grid;place-items:center;width:24px;height:24px;padding:0;flex:none"><span style="width:10px;height:10px;border-radius:3px;background:var(--faint);transform:translateY(0.5px)"></span></span><b style="font-size:13px;flex:1">' + n[0] + '</b><span class="muted" style="font-size:12px;font-variant-numeric:tabular-nums">' + n[1] + '</span>';
      wl.appendChild(r); return { r, y:new Track(0) }; });
    let cozy = true;
    const lay = inst => { const H = cozy ? 56 : 40, G = cozy ? 8 : 4, t0 = now(), dead = inst || REDUCE, stag = $(st,'.st').checked ? .03 : 0;
      if (dead){ h.jump(H); gap.jump(G); } else { h.set(H, S.soft); gap.set(G, S.soft); }
      rows.forEach((r,i) => { const y = i*(H+G); if (dead) r.y.jump(y); else r.y.set(y, S.base, t0+i*stag); });
      if (dead) wall.jump(N.length*H + (N.length-1)*G); else wall.set(N.length*H + (N.length-1)*G, S.soft, t0);
      dg.set(String(H), dead); sw.to(cozy ? 0 : 1); };
    $(st,'.bCo').onclick = () => { cozy = true; lay(); };
    $(st,'.bCp').onclick = () => { cozy = false; lay(); };
    rows.forEach((r,i) => r.y.jump(i*64)); h.jump(56); gap.jump(8); wall.jump(5*56+4*8); dg.set('56', true);
    return t => { const H = h.at(t), G = gap.at(t);
      rows.forEach(r => { r.r.style.transform = `translateY(${px(r.y.at(t))})`; r.r.style.height = px(H); });
      wl.style.height = px(wall.at(t)); dg.render(t); L.forEach((e,k) => sw.apply(e, k, t)); };
  }});
