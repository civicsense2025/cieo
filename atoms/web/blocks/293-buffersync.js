atom({ id:'buffersync', cat:'Scheduling', name:'Buffer editor', block:'buffer, sync status', fam:['M','S'], tall:true,
  html:`<div class="col" style="width:min(340px,90%);margin:0 auto;gap:8px;line-height:1.5"><b style="font-size:15px;font-weight:600">Protect focus time</b><div class="card" style="padding:14px 16px;display:flex;flex-direction:column;gap:10px"><div class="bl" style="font-size:13px;display:flex;justify-content:space-between"><span>Design review</span><b class="bm" style="font-variant-numeric:tabular-nums">30 min buffer</b></div><div class="bar" style="position:relative;height:56px;border-radius:10px;background:var(--raised)"></div><p class="cap" style="font-size:12px;color:var(--ink);opacity:.6;margin:0">Drag the right handle — the buffer edge trails 60ms behind.</p><div class="srow" style="position:relative;display:flex;align-items:center;gap:8px;min-height:36px"><i class="dot" style="width:10px;height:10px;border-radius:50%;background:var(--ink);opacity:.35"></i><span class="sl" style="position:relative;flex:1;height:20px;font-size:13px;overflow:hidden"></span><button class="sy" style="min-height:32px;border-radius:8px;border:1px solid var(--line);background:var(--card);padding:0 14px;cursor:pointer;font-size:13px">Sync</button></div><div class="row small muted" style="gap:6px;align-items:center;border-top:1px solid var(--line);padding-top:10px"><input type="checkbox" class="au" checked style="width:16px;height:16px"><span style="font-size:12px">Auto-sync on release</span></div></div></div><div class="hint">Short buffers flag a conflict</div>`,
  desc:'The right handle drags the event edge one to one while the buffer edge trails sixty milliseconds behind. Syncing pulses the dot, then swaps Scheduled to Synced — or Conflict when the buffer runs under fifteen minutes.',
  api:'trail.set(v, base, t+.06) 60ms lag   sync: pulse then sw.to(1|2)',
  init(st){
    const bar = $(st,'.bar'), W = () => bar.clientWidth || 280;
    const ev = document.createElement('div');
    ev.style.cssText = 'position:absolute;top:8px;bottom:8px;left:20%;border-radius:8px;background:var(--accent);opacity:.85';
    const buf = document.createElement('div');
    buf.style.cssText = 'position:absolute;top:8px;bottom:8px;border-radius:8px;border:1px dashed var(--ink);opacity:.5';
    const edge = document.createElement('i');
    edge.style.cssText = 'position:absolute;top:4px;bottom:4px;width:2px;background:var(--ink);opacity:0';
    const hd = document.createElement('div');
    hd.style.cssText = 'position:absolute;top:0;bottom:0;width:20px;cursor:ew-resize;touch-action:none;display:grid;place-items:center;padding:0';
    hd.innerHTML = '<i style="width:4px;height:24px;border-radius:2px;background:var(--card);box-shadow:0 0 0 1px var(--line)"></i>';
    bar.appendChild(buf); bar.appendChild(ev); bar.appendChild(edge); bar.appendChild(hd);
    const rLead = new Track(.45), rTrail = new Track(.45);
    let held = false, hv = .45;
    const mins = f => Math.round(f*240);
    const bm = $(st,'.bm');
    drag(hd, { down:() => { held = true; hv = rLead.target; edge.style.opacity = '1'; },
      move:p => { hv = clamp((p.x - W()*.2)/W(), .3, .9); rLead.set(hv); rTrail.set(hv, S.base, now() + .06); },
      up:() => { held = false; edge.style.opacity = '0';
        if ($(st,'.au').checked) sync(); } });
    const sl = $(st,'.sl');
    const L = ['Scheduled','Synced','Conflict'].map(s => { const e = document.createElement('span');
      e.className = 'layer'; e.textContent = s;
      e.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center'; sl.appendChild(e); return e; });
    const sw = new Swap(0), pu = new Track(0), tone = new Track(0);
    const dot = $(st,'.dot');
    let syncT = -9, syncing = false;
    const sync = () => { if (syncing) return; syncing = true; syncT = now();
      pu.set(1, S.snap); pu.set(0, S.soft, syncT + .3); };
    $(st,'.sy').onclick = sync;
    return t => { const lead = held ? hv : rLead.at(t), trail = rTrail.at(t);
      ev.style.right = px(W()*(1 - lead)); buf.style.left = px(W()*lead); buf.style.width = px(Math.max(8, W()*(trail - lead) + W()*.12));
      edge.style.left = px(W()*trail + W()*.12 - 1);
      hd.style.left = px(W()*lead - 10);
      bm.textContent = mins(trail - lead + .12) + ' min buffer';
      if (syncing && t - syncT > .55){ syncing = false;
        const ok = mins(trail - lead + .12) >= 15;
        sw.to(ok ? 1 : 2); tone.set(ok ? 1 : -1); }
      L.forEach((e,k) => sw.apply(e,k,t));
      const p = clamp(pu.at(t)), tn = tone.at(t);
      dot.style.transform = 'scale(' + (1 + p*.8).toFixed(3) + ')';
      dot.style.opacity = (.35 + .65*p).toFixed(3);
      dot.style.background = tn >= 0 ? mix(clamp(tn),'var(--success)','var(--ink)') : 'var(--danger,#c9403b)';
      sl.style.color = tn >= 0 ? mix(clamp(tn),'var(--success)','var(--ink)') : 'var(--danger,#c9403b)'; };
  }});
