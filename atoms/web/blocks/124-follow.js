

atom({ id:'follow', cat:'Social', name:'Follow button', block:'profile-header, social-links', fam:['M','S'],
  html:`<div class="row" style="gap:12px"><i style="width:44px;height:44px;border-radius:50%;background:var(--accent)"></i><span class="col" style="gap:0"><b class="small">Field Notes</b><span class="small muted">@fieldnotes</span></span><button class="fb" aria-pressed="false" style="position:relative;height:34px;border-radius:17px;border:1.5px solid var(--ink);cursor:pointer;font:600 13px var(--sans);overflow:hidden;margin-left:8px"></button></div><div class="hint">Follow, then hover the button</div>`,
  desc:'Follow turns into an outlined Following with its width springing to fit. Hovering Following previews Unfollow in the danger color, so the destructive action is never a surprise.',
  api:'w.set(measure(label)); fill.set(!following); hover && following → label.to("unfollow")',
  init(st){
    const fb = $(st,'.fb'), T = { follow:'Follow', following:'Following', unfollow:'Unfollow' }, L = {};
    for (const k in T){ const e = document.createElement('span'); e.className = 'layer'; e.textContent = T[k]; if (k === 'unfollow') e.style.color = 'var(--danger)'; fb.appendChild(e); L[k] = e; }
    const W = { follow:84, following:108, unfollow:100 }, w = new Track(84), fill = new Track(1), dg = new Track(0), sw = new Swap('follow'); let on = false, hov = false;
    const upd = () => { const k = on ? (hov ? 'unfollow' : 'following') : 'follow'; sw.to(k); w.set(W[k]); fill.set(on ? 0 : 1); dg.set(k === 'unfollow' ? 1 : 0); };
    fb.onclick = () => { on = !on; hov = false; fb.setAttribute('aria-pressed', on); upd(); }; fb.onpointerenter = () => { hov = true; on && upd(); }; fb.onpointerleave = () => { hov = false; on && upd(); };
    return t => { const f = clamp(fill.at(t)), g = clamp(dg.at(t)); fb.style.width = px(w.at(t)); fb.style.background = mix(f,'var(--ink)','var(--card)'); fb.style.color = mix(f,'var(--card)','var(--ink)'); fb.style.borderColor = mix(g,'var(--danger)','var(--ink)'); for (const k in L) sw.apply(L[k], k, t); };
  }});