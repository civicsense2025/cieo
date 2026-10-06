
atom({ id:'tooldisclose', cat:'AI chat', name:'Tool-call disclosure', block:'chat, disclosure', fam:['M','S'], tall:true,
  html:`<div class="card col" style="width:min(340px,calc(100% - 24px));padding:14px 14px 12px;gap:0"><b style="font-size:15px;font-weight:600;line-height:1.5">Find the pricing page</b><div class="trow" style="display:flex;gap:10px;align-items:center;padding:10px 0"><span style="width:32px;height:32px;border-radius:9px;background:var(--raised);display:grid;place-items:center;padding:0;flex:none;transform:translateY(.5px)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></span><span class="col" style="gap:0;flex:1;min-width:0"><b style="font-size:13px;line-height:1.5">Search files</b><span class="st small muted" style="position:relative;display:block;height:18px;font-size:12px"></span></span><button class="btn ink go" style="min-height:32px;border-radius:9px">Run</button></div><div class="pbar" style="height:3px;border-radius:2px;background:var(--raised);overflow:hidden;position:relative"><i class="tr" style="position:absolute;left:0;top:0;bottom:0;background:var(--line)"></i><i class="ld" style="position:absolute;left:0;top:0;bottom:0;background:var(--ink)"></i></div><div class="steps" style="overflow:hidden"></div><label class="row small muted" style="gap:6px;cursor:pointer;font-size:12px;margin-top:10px"><input type="checkbox" class="vb" checked> Verbose steps</label></div><div class="hint">Run, then watch each step check off</div>`,
  desc:'The row expands on a soft spring while each step trails in. Its spinner swaps to a check on done, and the caption settles on a success terminal.',
  api:'steps.h.set(H, S.soft)   step[i].done at t + 0.3 + i·0.45   edge.go(pct) trails 60ms',
  init(st){
    const STEPS = ['Scan 48 files','Open pricing.tsx','Quote the yearly total'];
    const sts = $(st,'.steps'), vb = $(st,'.vb'), go = $(st,'.go'), cap = $(st,'.st'), tr = $(st,'.tr'), ld = $(st,'.ld');
    const rows = STEPS.map((s,i) => { const d = document.createElement('div'); d.style.cssText = 'display:flex;gap:8px;align-items:center;padding:8px 0' + (i ? ';border-top:1px solid var(--line-soft)' : '');
      d.innerHTML = `<span class="sic" style="position:relative;width:20px;height:20px;flex:none"></span><span style="font-size:13px;line-height:1.5">${s}</span>`;
      sts.appendChild(d); return d; });
    const sws = rows.map(r => { const box = $(r,'.sic');
      const sp = document.createElement('span'); sp.className = 'layer'; sp.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 4a8 8 0 0 1 8 8"/></svg>'; box.appendChild(sp);
      const ck = document.createElement('span'); ck.className = 'layer'; ck.style.color = 'var(--success)'; ck.innerHTML = ic(I.check, 14, 3); box.appendChild(ck);
      return { sw:new Swap(0), L:[sp,ck], sp }; });
    const L = ['Idle','Working…','Done in 1.2 s'].map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; if (i === 2) e.style.color = 'var(--success)'; cap.appendChild(e); return e; });
    const csw = new Swap(0), h = new Track(0), e = edges(0, 0); let H = 0, busy = false; const q = [];
    requestAnimationFrame(() => { sts.style.height = 'auto'; H = sts.offsetHeight; sts.style.height = '0px'; h.jump(0); });
    const finish = () => { busy = false; csw.to(2); e.go(120, 120); };
    go.onclick = () => { if (busy) return; busy = true; const t = now(); q.length = 0;
      sws.forEach(s => { s.sw.cur = 0; s.sw.prev = null; s.sw.t = -9; });
      if (REDUCE){ h.jump(vb.checked ? H : 0); e.jump(120, 120); sws.forEach(s => { s.sw.cur = 1; s.sw.t = t; }); csw.cur = 2; csw.prev = 1; csw.t = t; busy = false; return; }
      csw.to(1); h.set(vb.checked ? H : 0, S.soft); e.go(0, 0);
      sws.forEach((s,i) => { q.push([t + .3 + i*.45, () => { s.sw.to(1); csw.to(1); e.go((i + 1)/sws.length*120, (i + 1)/sws.length*120); }]); });
      q.push([t + .3 + sws.length*.45 + .15, finish]); };
    vb.onchange = () => { if (!busy) h.set(vb.checked ? H : 0, REDUCE ? S.snap : S.soft); };
    return t => { while (q.length && q[0][0] <= t) q.shift()[1]();
      sts.style.height = px(Math.max(0, h.at(t)));
      sws.forEach((s,i) => { s.L.forEach((el,k) => s.sw.apply(el,k,t));
        if (s.sw.cur === 0 && busy && !REDUCE) s.sp.style.transform = `rotate(${((t*320) % 360).toFixed(1)}deg)`; });
      L.forEach((el,k) => csw.apply(el,k,t));
      tr.style.width = clamp(e.B.at(t)/120*100) + '%'; ld.style.width = clamp(e.A.at(t)/120*100) + '%'; };
  }});
