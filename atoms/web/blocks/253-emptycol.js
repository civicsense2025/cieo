

atom({ id:'emptycol', cat:'Layout', name:'Empty-column collapse', block:'columns, table, inbox', fam:['D'], wide:true,
  html:`<div class="col" style="gap:12px;align-items:center"><div style="max-width:420px;text-align:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Empty-column collapse</b><p class="muted" style="font-size:13px;line-height:1.5;margin:6px 0 0">Hiding the middle column springs its width to zero while the siblings expand to fill. Refill reverses the same path.</p></div><div class="row small muted" style="gap:8px;align-items:center"><span class="el" style="position:relative;display:inline-block;min-width:200px;min-height:20px"></span></div><div class="ec card" style="position:relative;width:min(560px,94%);height:170px;display:flex;gap:8px;padding:14px 16px;overflow:hidden"><div class="c0 card small" style="flex:none;overflow:hidden;font-size:13px;line-height:1.5;padding:12px 14px"><b style="font-size:13px">Files</b><div class="muted" style="font-size:12px">Plan<br>Draft<br>Final</div></div><div class="c1 card small" style="flex:none;overflow:hidden;font-size:13px;line-height:1.5;padding:12px 14px"><b style="font-size:13px">Preview</b><div class="muted" style="font-size:12px">Empty — hide me</div></div><div class="c2 card small" style="flex:none;overflow:hidden;font-size:13px;line-height:1.5;padding:12px 14px"><b style="font-size:13px">Details</b><div class="muted" style="font-size:12px">Size<br>Edited</div></div></div><div class="row" style="gap:8px;align-items:center"><button class="btn bT" style="min-height:32px">Hide preview</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="an" checked> animate</label></div></div><div class="hint">Collapse the empty column, then refill it</div>`,
  desc:'The empty column width springs to zero on a base spring while its siblings expand to fill the freed space. Refilling reverses the motion, and each end state holds settled.',
  api:'w1.set(0 / share, base)   w0/w2.set(fill)   el.to(hidden/open)',
  init(st){
    const box = $(st,'.ec'), cols = [$(st,'.c0'), $(st,'.c1'), $(st,'.c2')], btn = $(st,'.bT'), sw = new Swap(0);
    const L = ['Preview open','Preview hidden · siblings expanded'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; $(st,'.el').appendChild(e); return e; });
    const w = [new Track(150), new Track(170), new Track(150)];
    let hidden = false;
    const lay = inst => { const W = box.clientWidth - 32 - 16, dead = inst || REDUCE || !$(st,'.an').checked;
      const s = hidden ? [W/2, 0, W/2] : [W*.3, W*.4, W*.3];
      w.forEach((t, i) => { if (dead) t.jump(s[i]); else t.set(s[i], S.base); });
      sw.to(hidden ? 1 : 0); btn.textContent = hidden ? 'Refill preview' : 'Hide preview'; };
    btn.onclick = () => { hidden = !hidden; lay(); };
    requestAnimationFrame(() => lay(true)); lay(true);
    return t => { cols.forEach((c, i) => { const v = Math.max(0, w[i].at(t)); c.style.width = px(v);
        c.style.opacity = i === 1 ? clamp(v / 60).toFixed(3) : '1';
        c.style.visibility = i === 1 && v < 8 ? 'hidden' : 'visible'; });
      L.forEach((e,k) => sw.apply(e, k, t)); };
  }});
