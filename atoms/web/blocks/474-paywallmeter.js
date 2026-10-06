

atom({ id:'paywallmeter', cat:'Newsletter', name:'Paywall meter', block:'newsletter, paywall', fam:['M','S'], tall:true,
  html:`<div class="card col" style="width:min(360px,92%);padding:16px;gap:8px;align-items:center;line-height:1.55"><b style="font-size:15px;font-weight:600">Your reading week</b><svg class="arc" width="140" height="78" viewBox="0 0 140 78"><path d="M10 70 A60 60 0 0 1 130 70" fill="none" stroke="var(--raised)" stroke-width="10" stroke-linecap="round"/><path class="fg" d="M10 70 A60 60 0 0 1 130 70" fill="none" stroke="var(--ink)" stroke-width="10" stroke-linecap="round" stroke-dasharray="189" stroke-dashoffset="0"/></svg><div class="vd" style="position:relative;height:22px;font-size:13.5px;font-weight:600"></div><div class="gate" style="width:100%;border:1px solid var(--line-soft);border-radius:10px;padding:12px 14px;font-size:13px;line-height:1.55">Members read everything. Join before the lock.</div><div class="row" style="gap:8px"><button class="rd" style="height:40px;min-height:36px;border-radius:10px;border:1px solid var(--line);background:var(--card);font-weight:600;font-size:14px;padding:0 16px;cursor:pointer">Read one</button><button class="un" style="height:40px;min-height:36px;border-radius:10px;border:0;background:var(--ink);color:var(--card);font-weight:600;font-size:14px;padding:0 16px;cursor:pointer">Unlock</button></div><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;font-size:12.5px"><input type="checkbox" class="ar" checked> show arc</label></div><button class="btn rs" style="position:absolute;top:10px;right:12px;min-height:36px;border-radius:9px">Reset</button>`,
  desc:'Each read rides the lazy arc down. At one left the verdict swaps to a warning, at zero it locks and the gate lifts top-to-bottom to reveal the offer.',
  api:'left.set(n, S.lazy) · verdict.to(state) · mask.set(1, S.lazy) at locked',
  init(st){
    const fg = $(st,'.fg'), vd = $(st,'.vd'), gate = $(st,'.gate'), ar = $(st,'.ar');
    const V = ['3 free reads left','2 free reads left','1 free read left — last one','Locked — members read on'].map(s => { const x = document.createElement('span'); x.className = 'layer'; x.textContent = s; vd.appendChild(x); return x; });
    const vsw = new Swap(0), left = new Track(3, S.lazy), mask = new Track(0, S.lazy);
    const LEN = 189;
    const paint = () => { const n = Math.round(left.target);
      vsw.to(n <= 0 ? 3 : n === 1 ? 2 : n === 2 ? 1 : 0);
      if (n <= 0){ const t0 = now(); mask.set(1, S.lazy, REDUCE ? t0 : t0 + .3); } };
    $(st,'.rd').onclick = () => { if (left.target <= 0) return;
      if (REDUCE){ left.jump(left.target - 1); } else { left.set(left.target - 1); } paint(); };
    $(st,'.un').onclick = () => { const t0 = now();
      if (REDUCE){ left.jump(3); mask.jump(0); vsw.cur = 0; } else { left.set(3); mask.set(0, S.base); vsw.to(0); } };
    $(st,'.rs').onclick = () => { left.jump(3); mask.jump(0); vsw.cur = 0; vsw.prev = null; };
    left.jump(3);
    return t => { const n = clamp(left.at(t), 0, 3), m = clamp(mask.at(t));
      fg.style.strokeDashoffset = (LEN * (1 - n/3)).toFixed(1);
      fg.style.stroke = n <= 1 ? 'var(--danger)' : 'var(--ink)';
      fg.style.opacity = ar.checked ? '1' : '.25';
      V.forEach((x,i) => vsw.apply(x,i,t));
      vd.style.color = vsw.cur === 2 || vsw.cur === 3 ? 'var(--danger)' : 'var(--ink)';
      gate.style.maskImage = gate.style.webkitMaskImage = m > .99 ? 'none' : `linear-gradient(#000 ${(m*130-30).toFixed(1)}%, transparent ${(m*130).toFixed(1)}%)`;
      gate.style.opacity = (.35+.65*m).toFixed(3); };
  }});
