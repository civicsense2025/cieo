

atom({ id:'threadstack', cat:'Email', name:'Collapsed thread', block:'entry-list (thread), comments', fam:['M'], tall:true,
  html:`<div class="col th" style="width:min(340px,90%);gap:6px"></div>`,
  desc:'Earlier messages wait as a short stack of card edges. Opening the thread unfolds each message to full height, 50ms apart from the top, and the stack edges fold away.',
  api:'msg[i].h.set(open ? full : 0, S.base, t + i·0.05)   edges.o.set(!open)',
  init(st){
    const th = $(st,'.th'), M = [['Maya','Draft attached for the spring launch.'],['Theo','Pricing table needs the new tiers.'],['Maya','Updated. Can you check the yearly toggle?'],['Theo','Looks great. Ship it Thursday.']];
    const stack = document.createElement('button'); stack.style.cssText = 'position:relative;height:28px;border:0;background:none;cursor:pointer;padding:0'; stack.setAttribute('aria-expanded','false');
    stack.innerHTML = `<i style="position:absolute;left:12px;right:12px;top:0;height:10px;border-radius:8px 8px 0 0;background:var(--raised)"></i><i style="position:absolute;left:6px;right:6px;top:6px;height:10px;border-radius:8px 8px 0 0;background:var(--line)"></i><span class="small muted" style="position:absolute;left:0;right:0;top:12px;text-align:center;background:var(--card);border-radius:10px;padding:2px;box-shadow:var(--shadow)">3 earlier messages</span>`;
    th.appendChild(stack);
    const msgs = M.map(([a,b],i) => { const d = document.createElement('div'); d.style.overflow = 'hidden'; d.innerHTML = `<div class="card" style="padding:10px 12px"><b class="small">${a}</b><div class="small">${b}</div></div>`; th.appendChild(d); return { d, h:new Track(i === 3 ? 1 : 0) }; });
    const so = new Track(1); let open = false;
    stack.onclick = () => { open = !open; stack.setAttribute('aria-expanded', open); const t0 = now(); msgs.slice(0,3).forEach((m,i) => m.h.set(open ? 1 : 0, S.base, t0 + (open ? i*.05 : (2 - i)*.03))); so.set(open ? 0 : 1, S.snap); };
    const less = document.createElement('button'); less.className = 'btn'; less.textContent = 'Collapse earlier'; less.style.alignSelf = 'center'; th.appendChild(less); less.onclick = () => stack.onclick();
    return t => { const s = clamp(so.at(t)); stack.style.height = px(28*s + (1 - s)*0); stack.style.opacity = s.toFixed(3); stack.style.pointerEvents = s > .5 ? 'auto' : 'none'; less.style.opacity = (1 - s).toFixed(3); less.style.pointerEvents = s < .5 ? 'auto' : 'none';
      msgs.forEach(m => { const h = clamp(m.h.at(t)); m.d.style.height = px(h*size(m.d.firstChild).h); m.d.style.marginBottom = px(-6*(1 - h)); m.d.firstChild.style.opacity = h.toFixed(3); }); };
  }});