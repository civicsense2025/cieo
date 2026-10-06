

atom({ id:'dropdown', cat:'Admin', name:'Dropdown', block:'Select / menu primitive', fam:['X','S'], tall:true,
  html:`<div style="position:absolute;top:64px;left:50%;transform:translateX(-50%)"><button class="btn dd" aria-haspopup="menu" aria-expanded="false" style="position:relative;display:flex;align-items:center;gap:8px;min-width:216px;min-height:48px;padding:8px 16px;justify-content:space-between"><span class="lbw" style="position:relative;height:20px;flex:1;text-align:left"></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></button><div class="mn card" role="menu" style="position:absolute;top:56px;left:0;min-width:232px;padding:8px;transform-origin:20px 0;visibility:hidden"></div></div>`,
  desc:'The menu grows from the trigger at 97% scale while items fade in 30ms apart. Picking one swaps the button label.',
  api:'menu.o.set(open); item[i].o = prog(t, tOpen + i*0.03)',
  init(st){
    const dd = $(st,'.dd'), mn = $(st,'.mn'), lbw = $(st,'.lbw'), O = ['Newest first','Oldest first','Most viewed','Alphabetical'];
    const labels = O.map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = 'Sort: ' + s; lbw.appendChild(e); return e; });
    const items = O.map((s,i) => { const b = document.createElement('button'); b.setAttribute('role','menuitem'); b.textContent = s; b.style.cssText = 'display:block;width:100%;text-align:left;border:0;background:none;padding:8px 16px;min-height:40px;border-radius:8px;font-size:12px;cursor:pointer';
      b.onpointerenter = () => b.style.background = 'var(--raised)'; b.onpointerleave = () => b.style.background = 'none'; b.onclick = () => { sw.to(i); set(false); dd.focus(); }; mn.appendChild(b); return b; });
    const sw = new Swap(0), o = new Track(0); let tOpen = -9;
    const set = v => { o.set(v ? 1 : 0, v ? S.base : S.snap); dd.setAttribute('aria-expanded', v); if (v) tOpen = now(); };
    dd.onclick = e => { e.stopPropagation(); set(!o.target); }; st.addEventListener('pointerdown', e => { if (!mn.contains(e.target) && !dd.contains(e.target)) set(false); });
    dd.onkeydown = e => { if (e.key === 'Escape') set(false); if(e.key==='ArrowDown'){e.preventDefault();set(true);requestAnimationFrame(()=>items[0].focus())} }; mn.addEventListener('keydown',e=>{const i=items.indexOf(document.activeElement);const n={ArrowDown:(i+1)%items.length,ArrowUp:(i+items.length-1)%items.length,Home:0,End:items.length-1}[e.key];if(n!==undefined){e.preventDefault();items[n].focus()}if(e.key==='Escape'){e.preventDefault();set(false);dd.focus()}});
    return t => { const p = clamp(o.at(t)); mn.style.opacity = p.toFixed(3); mn.style.visibility = p < .01 ? 'hidden' : 'visible';
      mn.style.transform = `translateY(${px((1-p)*-4)}) scale(${(.97+.03*p).toFixed(4)})`; mn.style.filter = p < .98 ? `blur(${((1-p)*BLUR).toFixed(2)}px)` : 'none';
      items.forEach((b,i) => { const q = o.target ? clamp(prog(t, tOpen + .04 + i*.03)) : p; b.style.opacity = q.toFixed(3); });
      labels.forEach((e,k) => sw.apply(e,k,t)); };
  }});