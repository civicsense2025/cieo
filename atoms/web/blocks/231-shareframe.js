atom({ id:'shareframe', cat:'Video calls', name:'Screen-share frame', block:'video call (screen share, present)', fam:['M','S'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:stretch"><b style="font-size:15px;font-weight:600;line-height:1.5">Screen-share frame</b><span class="small muted" style="font-size:12px;line-height:1.5;margin-top:-4px">The frame eases in lazy; the strip trails behind.</span><div class="card col" style="padding:14px 16px;gap:10px"><div class="fr" style="position:relative;height:150px;border-radius:12px;background:#0C1016;overflow:hidden;display:grid;place-items:center"><span class="fl" style="position:relative;display:inline-block;min-width:170px;height:22px;text-align:center;font-size:13px;line-height:22px;color:#fff"></span></div><div class="strip" style="position:relative;display:flex;gap:8px"></div><div class="row" style="gap:8px;align-items:center"><button class="btn s0" style="min-height:32px;border-radius:8px">Share Ava</button><button class="btn s1" style="min-height:32px;border-radius:8px">Theo</button><button class="btn st" style="min-height:32px;border-radius:8px">Stop</button></div><div class="fin" style="position:relative;height:30px"></div><label class="row small muted" style="gap:6px;font-size:12px;border-top:1px solid var(--line-soft);padding-top:8px"><input type="checkbox" class="ge" checked> gentle ease</label></div></div><div class="hint">Share, switch presenter, then stop</div>`,
  desc:'The share frame scales in on a lazy ease while the filmstrip highlight trails its edges 60ms behind. The presenter label swaps; stopping lands on an empty terminal.',
  api:'frame.set(1, S.lazy)   edge.go(x, w) trails .06   label.to(i)   stop: fin.to(1)',
  init(st){
    const P = [["Ava's screen",'Figma'],["Theo's deck",'Slides']];
    const fr = $(st,'.fr'), fl = $(st,'.fl'), strip = $(st,'.strip'), ge = $(st,'.ge');
    const L = ['No one is sharing', ...P.map(p => `${p[0]} — ${p[1]}`)].map(s => { const e = document.createElement('span');
      e.className = 'layer'; e.style.cssText = 'font-size:13px;line-height:22px;color:#fff;white-space:nowrap'; e.textContent = s; fl.appendChild(e); return e; });
    const lsw = new Swap(0);
    const thumbs = P.map((p,i) => { const d = document.createElement('button'); d.className = 'btn';
      d.style.cssText = 'width:88px;height:52px;border-radius:8px;font-size:12px;min-height:32px';
      d.textContent = p[0].split("'")[0]; d.onclick = () => share(i); strip.appendChild(d); return d; });
    const hl = document.createElement('i');
    hl.style.cssText = 'position:absolute;top:0;height:52px;border-radius:8px;border:2.5px solid var(--success);opacity:0;pointer-events:none';
    strip.appendChild(hl);
    const edge = edges(0, 88); edge.jump(-99, 88);
    const F = ['', 'Share ended'].map((s,k) => { const e = document.createElement('span'); e.className = 'layer';
      e.style.cssText = k ? 'font-size:12.5px;color:var(--muted)' : ''; e.textContent = k ? '∅ ' + s : s;
      $(st,'.fin').appendChild(e); return e; });
    const fsw = new Swap(0);
    const m = new Track(0), vis = new Track(0);
    let cur = -1, ever = false;
    const ease = () => ge.checked ? S.lazy : S.soft;
    const share = i => { const t0 = now(); cur = i; ever = true;
      m.set(1, ease(), t0); vis.set(1, S.base, t0); lsw.to(i + 1, t0); fsw.to(0, t0);
      edge.go(i*96, 88, t0);
      thumbs.forEach((b,j) => b.setAttribute('aria-pressed', j === i)); };
    const stop = () => { if (cur < 0) return; const t0 = now(); cur = -1;
      m.set(0, S.base, t0); vis.set(0, S.snap, t0); lsw.to(0, t0); fsw.to(1, t0);
      thumbs.forEach(b => b.setAttribute('aria-pressed', 'false')); };
    $(st,'.s0').onclick = () => share(0); $(st,'.s1').onclick = () => share(1); $(st,'.st').onclick = stop;
    return t => { const p = clamp(m.at(t));
      fr.style.opacity = p.toFixed(3);
      fr.style.transform = `scale(${(0.96 + 0.04*p).toFixed(4)})`;
      L.forEach((e,k) => lsw.apply(e,k,t)); F.forEach((e,k) => fsw.apply(e,k,t));
      const v = clamp(vis.at(t));
      Object.assign(hl.style, { left:px(edge.A.at(t)), width:px(edge.B.at(t)), opacity:v.toFixed(3) }); };
  }});
