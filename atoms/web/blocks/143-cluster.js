

atom({ id:'cluster', cat:'Maps', name:'Pin cluster', block:'embed (map), collection (map view)', fam:['M'], wide:true,
  html:`<div class="mp card" style="position:relative;width:min(600px,94%);height:230px;overflow:hidden">${mapBg}<button class="cl" aria-label="Show 6 places" style="position:absolute;width:44px;height:44px;margin:-22px;border-radius:50%;border:3px solid var(--card);background:var(--ink);color:var(--card);font:600 15px/1 var(--sans);cursor:pointer;z-index:2;display:grid;place-items:center;padding:0 0 2px"><span class="cl-n" style="display:block;transform:translateY(-1px)">6</span></button></div><div class="row small muted" style="display:flex;align-items:center;gap:8px;width:min(600px,94%);padding:6px 2px 0;font-size:12.5px;color:var(--muted)"><span style="flex:1">Badge size</span><button type="button" class="btn cl-sz" style="height:28px" aria-pressed="false">Compact</button></div><div class="hint">Click the cluster · click the map to regroup</div>`,
  desc:'Opening the cluster sends each pin out from its center to its own place, 30ms apart, while the count fades. Clicking the map gathers them back in reverse order.',
  api:'pin[i].{x,y}.set(open ? place[i] : center, S.base, t + i·0.03)   cluster.o.set(!open)',
  init(st){
    const mp = $(st,'.mp'), cl = $(st,'.cl'), C = [.5,.48], PL = [[.18,.3],[.32,.62],[.44,.22],[.62,.7],[.74,.34],[.86,.58]];
    const pins = PL.map(() => { const p = document.createElement('i'); p.style.cssText = 'position:absolute;width:14px;height:14px;margin:-7px;border-radius:50%;background:var(--accent);border:2px solid var(--card);box-shadow:var(--shadow)'; mp.appendChild(p); return { p, x:new Track(C[0]), y:new Track(C[1]), o:new Track(0) }; });
    const co = new Track(1); let open = false, compact = false;
    const szB = $(st,'.cl-sz');
    const applySize = () => { const s = compact ? 36 : 44; cl.style.width = px(s); cl.style.height = px(s); cl.style.margin = px(-s/2); cl.style.fontSize = compact ? '13px' : '15px'; szB.textContent = compact ? 'Standard' : 'Compact'; szB.setAttribute('aria-pressed', compact); };
    szB.onclick = () => { compact = !compact; applySize(); };
    const set = o => { open = o; const t0 = now();
      if (REDUCE){ pins.forEach((p,i) => { const [x,y] = o ? PL[i] : C; p.x.jump(x); p.y.jump(y); p.o.jump(o ? 1 : 0); }); co.jump(o ? 0 : 1); return; }
      pins.forEach((p,i) => { const d = (o ? i : PL.length - 1 - i)*.03, [x,y] = o ? PL[i] : C; p.x.set(x, S.base, t0 + d); p.y.set(y, S.base, t0 + d); p.o.set(o ? 1 : 0, o ? S.base : S.snap, t0 + (o ? d : d + .1)); }); co.set(o ? 0 : 1, o ? S.snap : S.base, t0 + (o ? 0 : .25)); };
    cl.onclick = e => { e.stopPropagation(); set(true); }; mp.onclick = () => open && set(false);
    return t => { const W = mp.clientWidth, H = mp.clientHeight; cl.style.left = px(C[0]*W); cl.style.top = px(C[1]*H); const c = clamp(co.at(t)); cl.style.opacity = c.toFixed(3); cl.style.transform = `scale(${(.7 + .3*c).toFixed(3)})`; cl.style.pointerEvents = c > .5 ? 'auto' : 'none';
      pins.forEach(p => { p.p.style.left = px(p.x.at(t)*W); p.p.style.top = px(p.y.at(t)*H); p.p.style.opacity = clamp(p.o.at(t)).toFixed(3); }); };
  }});