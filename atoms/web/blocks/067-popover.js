

atom({ id:'popover', cat:'Overlays', name:'Popover', block:'Popover primitive, social-links', fam:['X','S'], tall:true,
  html:`<div style="position:absolute;top:64px;left:50%;transform:translateX(-50%)"><button class="btn ink tr" aria-haspopup="dialog" aria-expanded="false" style="display:flex;gap:8px;align-items:center">${ic(I.link,14)}Share</button><div class="pv card" role="dialog" aria-label="Share" style="position:absolute;top:56px;left:50%;width:280px;margin-left:-140px;padding:24px;transform-origin:50% 0;visibility:hidden"><i style="position:absolute;top:-5px;left:50%;width:10px;height:10px;margin-left:-5px;background:var(--card);transform:rotate(45deg);border-radius:2px"></i><b class="small" style="display:block">Anyone with the link can view</b><div class="row" style="margin-top:16px;gap:8px"><input id="pv-url" readonly value="example.site/p/spring-launch" aria-label="Link" style="flex:1;min-width:0;border:1.5px solid var(--muted);border-radius:8px;padding:8px 8px;background:var(--bg);color:var(--ink);font:13px var(--sans)"><button class="btn cp" aria-label="Copy share link" style="position:relative;width:80px;height:40px;padding:0"></button></div></div></div>`,
  desc:'The panel and its arrow grow out of the trigger on one spring. Copy swaps in a success check, then reverts. Clicking outside or pressing Escape closes it faster than it opened.',
  api:'pv.o.set(open, open ? S.base : S.snap)   origin = arrow tip',
  init(st){
    const tr = $(st,'.tr'), pv = $(st,'.pv'), cp = $(st,'.cp'), o = new Track(0), sw = new Swap(0), ok = new Track(0); let back = 0;
    const L = ['Copy', ic(I.check,14,2.5) + 'Copied'].map(h => { const e = document.createElement('span'); e.className = 'layer'; e.style.gap = '4px'; e.innerHTML = h; cp.appendChild(e); return e; });
    const set = v => { openSet(o, v); tr.setAttribute('aria-expanded', v); };
    tr.onclick = () => set(!o.target); outside(st, [tr, pv], () => set(false)); st.addEventListener('keydown', ev => { if (ev.key === 'Escape'){ set(false); tr.focus(); } });
    cp.onclick=async()=>{try{await navigator.clipboard.writeText('https://example.site/p/spring-launch');sw.to(1);ok.set(1);back=now()+1.6}catch{const input=$(st,'input');input.focus();input.select();window.CieoCatalogue?.announce('Copy the selected link.')}};
    return t => { if (back && t >= back){ back = 0; sw.to(0); ok.set(0); } pop(pv, o.at(t), -6); L.forEach((e,k) => sw.apply(e,k,t,3)); cp.style.color = mix(ok.at(t),'var(--success)','var(--ink)'); };
  }});