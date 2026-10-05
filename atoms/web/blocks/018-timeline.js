

atom({ id:'timeline', cat:'Data', name:'Timeline', block:'timeline, experience-list', fam:['M','E'], tall:true,
  html:`<div class="tl" style="position:relative;width:min(340px,88%);padding-left:28px"><div style="position:absolute;left:7px;top:6px;bottom:6px;width:2px;background:var(--line)"></div><div class="tf" style="position:absolute;left:7px;top:6px;width:2px;background:var(--ink)"></div></div><button class="btn" style="position:absolute;top:10px;right:12px">Next milestone</button>`,
  desc:'The spine fills to the current milestone first. The node inks in after the lag, then its row brightens.',
  api:'spine.set(y[i]); node[i].set(1, S.base, t + LAG)',
  init(st){
    const tl = $(st,'.tl'), tf = $(st,'.tf');
    const M = [['Jan 2026','Private beta with 40 studios'],['Mar 2026','Custom domains and SSL'],['May 2026','Member areas and paywalls'],['Jul 2026','Commerce blocks'],['Sep 2026','Public launch']];
    const rows = M.map(([d,s]) => { const r = document.createElement('div'); r.style.cssText = 'position:relative;padding:4px 0 14px';
      r.innerHTML = `<i style="position:absolute;left:-27px;top:7px;width:14px;height:14px;border-radius:50%;border:2px solid var(--line);background:var(--tile)"></i><div class="small muted"></div><div style="font-weight:500"></div>`;
      $$(r,'div')[0].textContent = d; $$(r,'div')[1].textContent = s; tl.appendChild(r); return { r, dot:$(r,'i'), o:new Track(.4), k:new Track(0) }; });
    let cur = 0; const sp = new Track(0);
    const go = (i, inst) => { cur = i; const y = rows[i].r.offsetTop + 14, t0 = now(); inst ? sp.jump(y) : sp.set(y);
      rows.forEach((x,j) => { const on = j <= i ? 1 : 0; inst ? (x.k.jump(on), x.o.jump(on ? 1 : .4)) : (x.k.set(on, S.base, t0 + LAG*2), x.o.set(on ? 1 : .4, S.base, t0 + LAG*3)); }); };
    $(st,'.btn').onclick = () => go((cur + 1) % rows.length); requestAnimationFrame(() => go(0, true));
    return t => { tf.style.height = px(Math.max(0, sp.at(t) - 6)); rows.forEach(x => { const k = clamp(x.k.at(t)); x.dot.style.background = mix(k,'var(--ink)','var(--tile)'); x.dot.style.borderColor = mix(k,'var(--ink)','var(--line)'); x.r.style.opacity = x.o.at(t).toFixed(3); }); };
  }});