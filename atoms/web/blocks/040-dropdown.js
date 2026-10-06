

atom({ id:'dropdown', cat:'Admin', name:'Dropdown', block:'Select / menu primitive', fam:['X','S'], tall:true,
  html:`<div style="position:absolute;top:32px;left:50%;transform:translateX(-50%)"><button type="button" class="btn dd" aria-haspopup="menu" aria-expanded="false" style="position:relative;display:flex;align-items:center;gap:8px;min-width:170px;justify-content:space-between"><span class="lbw" style="position:relative;height:20px;flex:1;text-align:left"></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></button><div class="mn card" role="menu" style="position:absolute;top:56px;left:0;min-width:240px;padding:8px;transform-origin:20px 0;visibility:hidden"></div></div>`,
  desc:'The menu grows from the trigger at 97% scale while items fade in 30ms apart. Picking one swaps the button label.',
  api:'menu.o.set(open); item[i].o = prog(t, tOpen + i*0.03)',
  init(st){
    const dd = $(st,'.dd'), mn = $(st,'.mn'), lbw = $(st,'.lbw'), O = ['Newest first','Oldest first','Most viewed','Alphabetical'];
    const labels = O.map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = 'Sort: ' + s; lbw.appendChild(e); return e; });
    const items = O.map((s,i) => { const b = document.createElement('button'); b.type='button';b.tabIndex=-1;b.setAttribute('role','menuitem'); b.textContent = s; b.style.cssText = 'display:block;width:100%;text-align:left;border:0;background:none;padding:8px 12px;min-height:40px;border-radius:8px;font-size:14px;cursor:pointer';
      b.onpointerenter = () => b.style.background = 'var(--raised)'; b.onpointerleave = () => b.style.background = 'none'; b.onclick = () => { sw.to(i); set(false); dd.focus(); }; mn.appendChild(b); return b; });
    const sw = new Swap(0), o = new Track(0); let tOpen = -9;
    let selected=0;const focusItem=i=>{selected=(i+items.length)%items.length;items[selected].focus()};const set = v => { mn.inert=!v; o.set(v ? 1 : 0, v ? S.base : S.snap); dd.setAttribute('aria-expanded', v); if (v){tOpen=now();mn.style.visibility='visible';} };
    dd.onclick = e => { e.stopPropagation(); set(!o.target); }; st.addEventListener('pointerdown', e => { if (!mn.contains(e.target) && !dd.contains(e.target)) set(false); });
    mn.inert=true;dd.onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();set(true);focusItem(e.key==='ArrowDown'?0:items.length-1)}};mn.onkeydown=e=>{if(e.key==='Escape'){set(false);dd.focus()}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();focusItem(selected+(e.key==='ArrowDown'?1:-1))}else if(e.key==='Home'||e.key==='End'){e.preventDefault();focusItem(e.key==='Home'?0:items.length-1)}else if(e.key==='Tab')set(false)};st.addEventListener('focusout',()=>queueMicrotask(()=>{if(!st.contains(document.activeElement))set(false)}));
    return t => { const p = clamp(o.at(t)); mn.style.opacity = p.toFixed(3); mn.style.visibility = p < .01 ? 'hidden' : 'visible';
      mn.style.transform = `translateY(${px((1-p)*-4)}) scale(${(.97+.03*p).toFixed(4)})`; mn.style.filter = p < .98 ? `blur(${((1-p)*BLUR).toFixed(2)}px)` : 'none';
      items.forEach((b,i) => { const q = o.target ? clamp(prog(t, tOpen + .04 + i*.03)) : p; b.style.opacity = q.toFixed(3); });
      labels.forEach((e,k) => sw.apply(e,k,t)); };
  }});