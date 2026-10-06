atom({ id:'crowdheat', cat:'Maps', name:'Crowd heat overlay', block:'density, overlay', fam:['M'], wide:true,
  html:`<div class="mp card" style="position:relative;width:min(560px,94%);height:240px;overflow:hidden">${mapBg}<div class="heat" style="position:absolute;inset:12px;display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(3,1fr);gap:8px"></div><div class="pins" style="position:absolute;inset:0;pointer-events:none"></div></div><div class="row small muted" style="display:flex;align-items:center;gap:8px;width:min(560px,94%);padding:6px 2px 0;font-size:12.5px;color:var(--muted)"><span style="flex:1">Dense cells pulse once, then rest</span><button type="button" class="btn pg-tg" style="height:32px;border-radius:9px" aria-pressed="true">Heat on</button></div><div class="hint">Toggle the overlay</div>`,
  desc:'Cells bloom in lazy and cross-fade. Dense cells pulse once and rest. Toggling off fades the heat and brings the pins back on base.',
  api:'cell.o.set(1,lazy,t+i*.04)   dense.pulse once   show.o.set(heat) pins fade back',
  init(st){
    const heat = $(st,'.heat'), pins = $(st,'.pins'), tg = $(st,'.pg-tg');
    const D = [.2,.5,.9,.4,.7,.3,.6,.95,.5,.3,.8,.45,.25,.6,.85,.35,.55,.2];
    const cells = D.map(d => { const c = document.createElement('i'); c.style.cssText = 'border-radius:9px;background:var(--accent)'; heat.appendChild(c); return { c, d, o:new Track(0), p:new Track(0) }; });
    const dots = [[.2,.3],[.5,.6],[.75,.35]].map(([x,y]) => { const p = document.createElement('i'); p.style.cssText = `position:absolute;left:${x*100}%;top:${y*100}%;width:12px;height:12px;margin:-6px;border-radius:50%;background:var(--ink);border:2px solid var(--card)`; pins.appendChild(p); return { p, o:new Track(1) }; });
    let on = true, fired = false;
    const show = t0 => { cells.forEach((c,i) => { if (REDUCE){ c.o.jump(on ? 1 : 0); c.p.jump(0); } else { c.o.set(on ? 1 : 0, S.lazy, t0 + i*.04); if (on && c.d > .8){ c.p.jump(0); c.p.set(1, S.snap, t0 + .3 + i*.04); } } });
      dots.forEach(d => REDUCE ? d.o.jump(on ? 0 : 1) : d.o.set(on ? 0 : 1, S.base, t0 + .1)); };
    tg.onclick = () => { on = !on; tg.textContent = on ? 'Heat on' : 'Heat off'; tg.setAttribute('aria-pressed', on); show(now()); };
    show(now());
    return t => { cells.forEach(c => { const o = clamp(c.o.at(t)), pl = clamp(c.p.at(t));
        const pulse = c.d > .8 ? Math.sin(Math.min(1, pl)*Math.PI)*.25 : 0;
        c.c.style.opacity = (o*(.25+.65*c.d)).toFixed(3); c.c.style.transform = `scale(${(.7+.3*o+pulse).toFixed(3)})`; });
      dots.forEach(d => d.p.style.opacity = clamp(d.o.at(t)).toFixed(3)); };
  }});
