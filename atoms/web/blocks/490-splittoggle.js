atom({ id:'splittoggle', cat:'Chrome', name:'Split-view toggle', block:'chrome, splitview, divider', fam:['S','M'],
  html:`<div class="col" style="gap:8px;max-width:460px;margin:0 auto;width:100%"><div style="font-size:15px;font-weight:600;line-height:1.5">Split view</div><div class="small muted" style="font-size:12.5px;line-height:1.5;font-variant-numeric:tabular-nums">Drag the divider 1:1 &middot; release springs &middot; &#8592;&#8594; nudges</div><div style="border:1px solid color-mix(in oklab, var(--ink) 14%, transparent);border-radius:12px;padding:15px;background:var(--card)"><div class="seg" role="group" aria-label="Split presets" style="position:relative;display:flex;gap:0;border:1px solid color-mix(in oklab, var(--ink) 14%, transparent);border-radius:9px;padding:2px"><div class="pill" style="position:absolute;top:2px;bottom:2px;border-radius:7px;background:color-mix(in oklab, var(--ink) 9%, transparent)"></div><button class="p50" style="flex:1;position:relative;min-height:32px;border:0;border-radius:7px;background:transparent;font-size:13px;line-height:1.5;cursor:pointer">50 / 50</button><button class="p70" style="flex:1;position:relative;min-height:32px;border:0;border-radius:7px;background:transparent;font-size:13px;line-height:1.5;cursor:pointer">70 / 30</button></div><div class="view" style="position:relative;display:flex;height:120px;margin-top:8px;border-radius:10px;overflow:hidden;border:1px solid color-mix(in oklab, var(--ink) 12%, transparent)"><div class="pa" style="display:grid;place-items:center;padding:0;font-size:13px;line-height:1.5;background:color-mix(in oklab, var(--ink) 5%, transparent)"><span>A</span></div><div class="dv" tabindex="0" role="separator" aria-label="Divider" style="width:14px;display:grid;place-items:center;padding:0;cursor:ew-resize;background:transparent;touch-action:none"><span style="display:grid;place-items:center;padding:0;width:4px;height:44px;border-radius:2px;background:color-mix(in oklab, var(--ink) 28%, transparent);transform:translateY(.5px)"></span></div><div class="pb" style="display:grid;place-items:center;padding:0;font-size:13px;line-height:1.5;background:color-mix(in oklab, var(--ink) 9%, transparent)"><span>B</span></div></div><div class="foot small muted" style="font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums;margin-top:8px"><span class="msg">50 / 50</span></div></div><label class="row small muted" style="gap:6px;font-size:12px;line-height:1.5"><input type="checkbox" class="sn" checked> snap to presets</label></div><div class="hint">Drag divider &middot; arrows nudge &middot; Enter snaps</div>`,
  desc:'Divider tracks the pointer 1:1 while dragging. On release panes spring aside with velocity and the preset pill slides with trailing edges. A preset holds the terminal. Reduced motion jumps instantly.',
  api:'drag: pos.jump(px); release: pos.release(from,v,to); pill.go(a,b)   end: preset, hold',
  init(st){
    const view = $(st,'.view'), pa = $(st,'.pa'), pb = $(st,'.pb'), dv = $(st,'.dv'),
          pill = $(st,'.pill'), p50 = $(st,'.p50'), p70 = $(st,'.p70'), msg = $(st,'.msg'), sn = $(st,'.sn');
    const pos = new Track(0.5, S.base), pe = edges(0, 100);
    const put = (tr,v,c) => { if (REDUCE) tr.jump(v); else tr.set(v,c); };
    const snapTo = v => { put(pos, v, S.base); const w = p50.offsetWidth; const a = v < 0.6 ? 2 : w+2; const go = REDUCE ? pe.jump.bind(pe) : pe.go.bind(pe); go(a, a+w); msg.textContent = v < 0.6 ? '50 / 50 \u2713' : '70 / 30 \u2713'; };
    p50.onclick = () => snapTo(0.5);
    p70.onclick = () => snapTo(0.7);
    requestAnimationFrame(() => { const w = p50.offsetWidth || 100; pe.jump(2, 2+w); });
    drag(dv, {
      move: p => { const r = view.getBoundingClientRect(); pos.jump(clamp((p.cx - r.left) / r.width, 0.2, 0.85)); },
      up: (p, v) => {
        const wpx = view.getBoundingClientRect().width || 300;
        const from = pos.at(now());
        let to = from;
        if (sn.checked) to = Math.abs(from-0.5) < Math.abs(from-0.7) ? 0.5 : 0.7;
        if (REDUCE) pos.jump(to); else pos.release(from, (v.vx||0)/wpx, to, S.base);
        const w = p50.offsetWidth || 100; const a = to < 0.6 ? 2 : w+2;
        if (REDUCE) pe.jump(a, a+w); else pe.go(a, a+w);
        msg.textContent = Math.round(to*100) + ' / ' + Math.round((1-to)*100) + (sn.checked ? ' \u2713' : '');
      }
    });
    dv.addEventListener('keydown', e => {
      const cur = pos.target;
      if (e.key === 'ArrowLeft'){ put(pos, clamp(cur-0.05,0.2,0.85), S.base); e.preventDefault(); }
      else if (e.key === 'ArrowRight'){ put(pos, clamp(cur+0.05,0.2,0.85), S.base); e.preventDefault(); }
      else if (e.key === 'Enter'){ snapTo(cur < 0.6 ? 0.5 : 0.7); e.preventDefault(); }
      else if (e.key === 'Escape'){ snapTo(0.5); dv.blur(); e.preventDefault(); }
    });
    return t => {
      const p = clamp(pos.at(t), 0.05, 0.95);
      pa.style.width = (p*100).toFixed(2)+'%'; pb.style.width = ((1-p)*100).toFixed(2)+'%';
      dv.style.width = '14px';
      pill.style.left = px(pe.A.at(t)); pill.style.width = px(Math.max(10, pe.B.at(t)-pe.A.at(t)));
    };
  }});
