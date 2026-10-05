

atom({ id:'linkpreview', cat:'Files and browsing', name:'Link preview', block:'richtext (links), sources', fam:['X','M'], tall:true,
  html:`<p class="tx" style="max-width:320px;margin:0;line-height:1.8;font-size:15px">We moved the offer to the end of long posts, borrowing from <a href="#" data-i="0">Stratechery</a>, a pattern <a href="#" data-i="1">Craig Mod</a> describes well, and the pricing advice in <a href="#" data-i="2">Patio11’s essay</a>.</p><div class="pv card" style="position:absolute;left:0;top:0;width:250px;overflow:hidden;visibility:hidden"><div class="th" style="height:70px;background:var(--raised)"></div><div class="bd" style="position:relative;height:66px"></div></div>`,
  desc:'Resting on a link opens a preview after 300ms. Moving to another link keeps the card open and glides it to the new link while the content swaps, so scanning several links stays calm.',
  api:'open at t + 0.3   card.{x,y}.set(link rect)   content.to(i)',
  init(st){
    const links = $$(st,'.tx a'), pv = $(st,'.pv'), th = $(st,'.th'), bd = $(st,'.bd'), D = [['stratechery.com','Aggregation theory and the end of long posts','var(--accent)'],['craigmod.com','Membership, slowly: notes from a small press','var(--muted)'],['kalzumeus.com','Charge more: pricing for small software','var(--ink)']];
    const L = D.map(([u,h]) => { const e = document.createElement('div'); e.className = 'layer'; e.style.cssText += 'flex-direction:column;align-items:flex-start;padding:10px 12px;white-space:normal;gap:2px'; e.innerHTML = `<span class="small muted">${u}</span><b class="small" style="line-height:1.35">${h}</b>`; bd.appendChild(e); return e; });
    const o = new Track(0), x = new Track(0), y = new Track(0), sw = new Swap(-1); let openAt = 0, closeAt = 0, want = -1;
    const place = i => { const r = relRect(st, links[i].getBoundingClientRect()); return [clamp(r.x + r.w/2 - 125, 8, st.clientWidth - 258), r.y + r.h + 8]; };
    links.forEach((a,i) => { a.style.cssText = 'color:var(--ink);font-weight:600;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px'; a.onclick = e => e.preventDefault();
      a.onpointerenter = a.onfocus = () => { closeAt = 0; want = i; if (o.target){ const [px2,py] = place(i); x.set(px2); y.set(py); sw.to(i); th.style.background = D[i][2]; } else openAt = now() + .3; };
      a.onpointerleave = a.onblur = () => { openAt = 0; closeAt = now() + .2; }; });
    pv.onpointerenter = () => closeAt = 0; pv.onpointerleave = () => closeAt = now() + .2;
    return t => { if (openAt && t >= openAt){ openAt = 0; const [px2,py] = place(want); x.jump(px2); y.jump(py); sw.cur = want; sw.prev = null; sw.t = -9; th.style.background = D[want][2]; o.set(1); } if (closeAt && t >= closeAt){ closeAt = 0; o.set(0, S.snap); }
      pv.style.left = px(x.at(t)); pv.style.top = px(y.at(t)); pop(pv, o.at(t), -6); L.forEach((e,k) => sw.apply(e,k,t)); };
  }});