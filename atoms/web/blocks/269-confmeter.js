
atom({ id:'confmeter', cat:'AI chat', name:'Confidence meter', block:'chat, meter', fam:['M','S'],
  html:`<div class="card col" style="width:min(340px,calc(100% - 24px));padding:14px;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.5">Is this answer solid?</b><div style="align-self:flex-start;max-width:75%;background:var(--raised);border-radius:12px;padding:8px 12px;font-size:13.5px;line-height:1.5">Yearly saves about 17% versus monthly.</div><div class="row" style="gap:8px;margin-top:2px"><div class="mtr" style="position:relative;height:4px;border-radius:2px;background:var(--raised);flex:1;overflow:hidden"><i class="fl" style="position:absolute;left:0;top:0;bottom:0;border-radius:2px;background:var(--warning)"></i></div><span class="pc num" style="font-size:13px"></span><span class="num" style="font-size:13px;color:var(--muted)">%</span></div><span class="bd small" style="position:relative;display:block;height:20px;font-size:12px"></span><div class="row" style="gap:6px"><button class="btn lv" style="min-height:32px;border-radius:9px">Low</button><button class="btn md" style="min-height:32px;border-radius:9px">Mid</button><button class="btn hi" style="min-height:32px;border-radius:9px">High</button><button class="btn ink vf" style="min-height:32px;border-radius:9px;margin-left:auto">Verify</button></div><label class="row small muted" style="gap:6px;cursor:pointer;font-size:12px"><input type="checkbox" class="sl" checked> Slow ink</label></div><div class="hint">Verify, then try Low / Mid / High</div>`,
  desc:'The thin meter inks on a lazy spring while digits roll the percent. The band caption swaps between danger, warning and success terminals.',
  api:'v.set(target, S.lazy)   digits.set(pct)   band = v<55 ? danger : v<80 ? warning : success',
  init(st){
    const fl = $(st,'.fl'), bd = $(st,'.bd'), sl = $(st,'.sl');
    const dg = new Digits($(st,'.pc'), 2); dg.set(' 0', true);
    const BANDS = [['Low — double-check sources','var(--danger)'],['Mixed — partly sourced','var(--warning)'],['High — well sourced','var(--success)']];
    const L = ['Tap Verify to check this answer', ...BANDS.map(b => b[0])].map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; e.style.color = i ? BANDS[i-1][1] : 'var(--muted)'; bd.appendChild(e); return e; });
    const v = new Track(0), sw = new Swap(0);
    const VALS = { lv:32, md:68, hi:92 };
    const band = n => n < 55 ? 0 : n < 80 ? 1 : 2;
    const set = n => { const cfg = (sl.checked && !REDUCE) ? S.lazy : S.base;
      if (REDUCE){ v.jump(n); dg.set(String(n), true); sw.cur = band(n) + 1; sw.prev = null; sw.t = -9; }
      else { v.set(n, cfg); dg.set(String(n)); sw.to(band(n) + 1); }
      fl.style.background = BANDS[band(n)][1]; };
    let k = 0; const SEQ = [68, 92, 32];
    $(st,'.vf').onclick = () => set(SEQ[k++ % SEQ.length]);
    $(st,'.lv').onclick = () => set(VALS.lv); $(st,'.md').onclick = () => set(VALS.md); $(st,'.hi').onclick = () => set(VALS.hi);
    return t => { fl.style.width = (clamp(v.at(t), 0, 100)).toFixed(2) + '%'; dg.render(t);
      L.forEach((e,i) => sw.apply(e,i,t)); };
  }});
