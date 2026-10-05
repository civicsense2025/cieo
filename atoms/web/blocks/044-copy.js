

/* ---------- Added from the block manifest ---------- */
atom({ id:'copy', cat:'Content', name:'Copy button', block:'code', fam:['S','M'],
  html:`<div class="card" style="position:relative;width:min(340px,88%);padding:14px 56px 14px 16px;font:13px/1.5 var(--mono);overflow-x:auto;white-space:nowrap"><span class="muted">$</span> npm create lamina@latest<button class="cp" aria-label="Copy command" style="position:absolute;right:8px;top:8px;height:30px;border-radius:8px;border:1px solid var(--line);background:var(--card);cursor:pointer;overflow:hidden;font:500 12px var(--sans)"></button></div>`,
  desc:'The icon button widens to fit “Copied”, turns success-colored and swaps its content, then returns after 1.6 seconds.',
  api:'w.set(measure("Copied")); ok.set(1); after(1.6, reset)',
  init(st){
    const cp = $(st,'.cp'), L = ['<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>','<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg>Copied'].map(h => { const e = document.createElement('span'); e.className = 'layer'; e.style.gap = '5px'; e.innerHTML = h; cp.appendChild(e); return e; });
    const sw = new Swap(0), w = new Track(30), ok = new Track(0); let back = 0;
    cp.onclick = () => { try { navigator.clipboard.writeText('npm create lamina@latest').catch(() => {}); } catch {} sw.to(1); w.set(84); ok.set(1); back = now() + 1.6; };
    return t => { if (back && t >= back){ back = 0; sw.to(0); w.set(30); ok.set(0); }
      const g = clamp(ok.at(t)); cp.style.width = px(w.at(t)); cp.style.color = mix(g,'var(--success)','var(--ink)'); cp.style.borderColor = mix(g,'var(--success)','var(--line)'); cp.style.background = mix(g,'var(--success-tint)','var(--card)');
      L.forEach((e,i) => sw.apply(e,i,t,3)); };
  }});