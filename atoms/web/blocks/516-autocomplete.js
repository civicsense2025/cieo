atom({ id:'autocomplete', cat:'Commerce', name:'Address autocomplete', block:'checkout, combobox, address', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Delivery address</b><input class="q" placeholder="Start typing…" aria-label="Address search" role="combobox" aria-expanded="true" style="height:38px;border-radius:9px;border:1.5px solid var(--muted);padding:0 10px;font-size:14px"><div class="ls col" role="listbox" style="gap:4px;overflow:hidden"></div><label class="row small muted" style="gap:6px;font-size:12.5px"><input type="checkbox" class="us" checked> US only</label></div><div class="hint">Type “ma”, pick a row</div>`,
  desc:'Suggestions stay hidden until two characters are typed. Rows filter in place: matches spring into their slots while misses blur out. Picking swaps in the full address and collapses the list height to a receipt terminal.',
  api:'vis[i].set(match?1:0) springs slots   pick: full.to(1); listH.set(0)',
  init(st){
    const q = $(st,'.q'), ls = $(st,'.ls');
    const A = [['14 Maple St, Portland ME','04101'],['9 Marsh Ave, Oakland CA','94610'],['102 Main St, Austin TX','78701'],['77 Market St, Toronto ON','M5B 1M1']];
    const listH = new Track(1), full = new Swap(0);
    const R = A.map(([a,z]) => { const b = document.createElement('button'); b.setAttribute('role','option');
      b.style.cssText = 'display:flex;gap:8px;align-items:baseline;border:0;border-radius:9px;background:var(--raised);cursor:pointer;padding:9px 11px;font-size:13px;line-height:1.5;text-align:left;min-height:38px';
      b.innerHTML = `<span>${a}</span><span class="small muted" style="margin-left:auto;font-size:12.5px;flex:none">${z}</span>`;
      ls.appendChild(b); const it = { b, a, z, v:new Track(1) }; return it; });
    const F = document.createElement('div'); F.className = 'small'; F.style.cssText = 'position:relative;min-height:22px;font-size:13px;line-height:1.5';
    const FL = ['','Picked — edit to search again'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; F.appendChild(e); return e; });
    ls.after(F);
    function filt(){ const s = q.value.trim().toLowerCase(), us = $(st,'.us').checked; let n = 0;
      R.forEach(r => { const m = (!s || r.a.toLowerCase().includes(s)) && (!us || !/Toronto/.test(r.a)); r.v.set(m ? 1 : 0); if (m) n++; });
      listH.set(s.length < 2 || n === 0 ? 0 : 1); full.to(0); }
    R.forEach(r => r.b.onclick = () => { q.value = r.a + ' ' + r.z; R.forEach(x => x.v.set(x === r ? 1 : 0)); listH.set(0); full.to(1); });
    q.oninput = filt; $(st,'.us').onchange = filt; filt();
    return t => { const p = clamp(listH.at(t)); ls.style.maxHeight = (p*220).toFixed(0) + 'px'; ls.style.opacity = p.toFixed(3);
      R.forEach(r => { const v = clamp(r.v.at(t)); r.b.style.opacity = v.toFixed(3);
        r.b.style.filter = `blur(${((1-v)*3).toFixed(2)}px)`; r.b.style.transform = `scale(${(0.96+0.04*v).toFixed(4)})`;
        r.b.style.display = v < .02 && listH.target === 0 && full.target === 1 && r.b.textContent !== q.value ? 'none' : 'flex'; });
      FL.forEach((e,k) => full.apply(e,k,t)); };
  }});
