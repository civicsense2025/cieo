atom({ id:'reducemotion', cat:'Foundations', name:'Reduced-motion simulator', block:'reduced motion, swap, accessibility', fam:['S','T'],
  html:`<div class="card col" style="width:min(360px,92%);padding:18px;gap:16px"><div class="lane" style="position:relative;height:40px;border-radius:10px;background:var(--raised)"><div class="dt" style="position:absolute;left:8px;top:8px;width:24px;height:24px;border-radius:50%;background:var(--ink)"></div></div><div class="lb" style="position:relative;height:28px;overflow:hidden"></div><div class="ro" style="font:13px var(--mono);font-variant-numeric:tabular-nums;color:var(--muted)">motion: full spring + blur swap</div><div class="row" style="gap:8px"><button class="btn run" style="flex:1;min-height:36px">Run</button></div><div class="row small muted" style="gap:8px;align-items:center"><label class="row" style="gap:8px;cursor:pointer;font-size:12px;align-items:center"><input type="checkbox" class="sim" style="width:20px;height:20px">Simulate reduced motion</label></div></div><div class="hint">Simulated reduce flips the demo to instant — Swap keeps state, blur removed</div>`,
  desc:'Flip the switch and the same demo goes instant: the dot jumps, the label swaps with no blur. State is kept, motion is not.',
  api:'REDUCE ? x.jump(to) : x.set(to) · Swap renders settled, filter none',
  init(st){
    const lane = $(st,'.lane'), dot = $(st,'.dt'), lb = $(st,'.lb'), ro = $(st,'.ro'), sim = $(st,'.sim');
    const L = ['Uploading 3 files', 'Shared with 4 people'].map(s => { const e = document.createElement('span');
      e.className = 'layer'; e.textContent = s; lb.appendChild(e); return e; });
    const mv = new Track(0), sw = new Swap(0);
    let k = 0;
    const instant = () => REDUCE || sim.checked;
    const paint = () => ro.textContent = instant() ? 'motion: instant · no blur' : 'motion: full spring + blur swap';
    sim.onchange = paint; paint();
    $(st,'.run').onclick = () => { k ^= 1;
      if (instant()){ mv.jump(k); sw.to(k); } else { mv.set(k); sw.to(k); } paint(); };
    return t => { const W = Math.max(1, size(lane).cw - 40);
      dot.style.transform = `translateX(${px(clamp(mv.at(t)) * W)})`;
      const tt = instant() ? sw.t + 9 : t;
      L.forEach((el, i) => sw.apply(el, i, tt)); };
  }});
