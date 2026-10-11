
atom({ id:'sliderhist', cat:'Dynamic', name:'Slider with histogram', block:'slider, chart', fam:['S','M'], tall:true,
  html:`<div class="card col" style="width:min(420px,calc(100% - 24px));margin:0 auto;padding:15px 16px;gap:8px"><div class="row" style="justify-content:space-between;align-items:baseline"><b style="font-size:15px;font-weight:600;line-height:1.45">Team size</b><span class="v num" style="font-size:14px;font-weight:600;line-height:1.5;font-variant-numeric:tabular-nums"></span></div><div class="bars row" style="gap:4px;align-items:flex-end;height:84px"></div><div class="trk" role="slider" tabindex="0" aria-label="Team size" aria-valuemin="0" aria-valuemax="500" style="position:relative;height:32px;touch-action:none;cursor:pointer"><i class="ln" style="position:absolute;left:0;right:0;top:15px;height:2px;border-radius:1px;background:var(--line)"></i><i class="th" style="position:absolute;top:4px;width:24px;height:24px;border-radius:50%;background:var(--ink);display:grid;place-items:center;padding:0;transform:translateY(0)"><i style="display:block;width:8px;height:8px;border-radius:50%;background:var(--card);transform:translateY(.5px)"></i></i></div><div class="cap small muted num" style="font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums">Set · 264 of 500</div><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;font-size:12px"><input type="checkbox" class="sn" checked> snap to 25</label></div><div class="hint">Drag the thumb · bars ink as they enter range</div>`,
  desc:'The thumb follows the pointer exactly. Bars at or under the value snap to ink, the rest fade, and the number rolls. Release settles on a set terminal.',
  api:'thumb.x.jump(px) dragging   bar[i].o.set(in ? 1 : .25, S.snap)   end: set, hold',
  init(st){
    const bars = $(st,'.bars'), trk = $(st,'.trk'), th = $(st,'.th'), cap = $(st,'.cap'), sn = $(st,'.sn'), vv = $(st,'.v');
    const H = [22,38,30,52,44,64,58,74,66,80,72,60], MAX = 500;
    let v = 264;
    const d = new Digits(vv, 3); d.set(String(v), true);
    const B = H.map(h => { const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Set team size to ${Math.round(h/80*MAX)}`);
      b.style.cssText = `flex:1;height:${h}px;border:0;padding:0;border-radius:4px;background:var(--ink);cursor:pointer;min-width:0;appearance:none;-webkit-appearance:none;font:inherit;color:inherit`;
      b.addEventListener('click', () => { measure(); setV(h/80*MAX, now()); x.jump(v/MAX*W); });
      bars.appendChild(b); return { b, o:new Track(h/80*MAX <= v ? 1 : .25) }; });
    const x = new Track(0); let W = 0, dragOn = false;
    const measure = () => { W = trk.clientWidth - 24; x.jump(v/MAX*W); };
    addEventListener('resize', measure); setTimeout(measure, 30); measure();
    const setV = (nv, t) => { nv = clamp(Math.round(nv), 0, MAX); if (sn.checked) nv = Math.round(nv/25)*25;
      if (nv === v) return; d.dir = nv > v ? 1 : -1; v = nv; d.set(String(v), REDUCE);
      trk.setAttribute('aria-valuenow', v);
      B.forEach((b,i) => { const inn = H[i]/80*MAX <= v;
        if (REDUCE) b.o.jump(inn ? 1 : .25); else b.o.set(inn ? 1 : .25, S.snap, t); });
      cap.textContent = `Set · ${v} of 500`; };
    drag(trk, { down:p => { dragOn = true; trk.focus(); measure(); setV((p.x - 12)/(W || 1)*MAX, now()); },
      move:p => { if (dragOn) setV((p.x - 12)/(W || 1)*MAX, now()); },
      up:(p,vel) => { dragOn = false; const to = v/MAX*W; x.release(x.at(now()), 0, to); } });
    trk.addEventListener('keydown', e => { const s = e.key === 'ArrowRight' ? 10 : e.key === 'ArrowLeft' ? -10 : 0;
      if (s){ e.preventDefault(); measure(); setV(v + s, now()); x.jump(v/MAX*W); } });
    return t => { if (!W) measure(); if (dragOn){ x.jump(v/MAX*W); }
      d.render(t); th.style.left = px(x.at(t));
      B.forEach(b => { const o = clamp(b.o.at(t), 0, 1);
        b.b.style.opacity = (.25 + .75*o).toFixed(3); }); };
  }});
