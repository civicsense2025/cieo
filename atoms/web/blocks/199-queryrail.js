atom({ id:'queryrail', cat:'Writing', name:'Query rail', block:'search rail', fam:['M','X'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="gap:8px;margin:0 auto;width:min(360px,92%);padding:12px"><button class="btn ink aq">Add query</button><div class="rail card" style="overflow:hidden;padding:14px"><div class="chips col" style="gap:8px"></div></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Slide rail in</span></label><div class="hint">Click a chip to resolve it</div></div>`,
  desc:'The rail slides in on a calm spring. New query chips swap in one after another. Resolving one shrinks it away, then the gap closes on the same spring.',
  api:'rail.set(1)   chip.sw.to(1) @t+i*.04   resolve: w→0, h→0',
  init(st){
    const Q = ['who voted for the hike', 'when does it start', 'what streets flood first', 'who pays the fee'];
    const chips = $(st,'.chips'), rail = $(st,'.rail');
    const rx = new Track(0); let n = 0; const items = [];
    const add = () => { if (n >= Q.length) return; const k = n++;
      const d = document.createElement('button'); d.className = 'chipb small card';
      d.style.cssText += 'position:relative;overflow:hidden;text-align:left;cursor:pointer;padding:8px 10px;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:9px;width:100%';
      d.innerHTML = `<span class="c layer">${Q[k]}</span><span class="r layer" style="color:var(--success)">Resolved ✓</span>`;
      chips.appendChild(d);
      const it = { d, c:d.querySelector('.c'), r:d.querySelector('.r'), sw:new Swap(0), w:new Track(0), h:new Track(0), gone:false };
      const t0 = now() + k * .04;
      it.w.set(1, S.base, t0); it.h.set(1, S.base, t0); it.sw.to(0, t0);
      d.style.width = ''; items.push(it);
      d.onclick = () => { if (it.gone) return; it.gone = true; const t1 = now();
        it.sw.to(1, t1); it.w.set(0, S.base, t1 + EXIT); it.h.set(0, S.base, t1 + EXIT);
        setTimeout(() => d.remove(), REDUCE ? 0 : 700); };
    };
    $(st,'.aq').onclick = () => { if (!rx.target) rx.set(1); add(); };
    rx.set(1); add(); add();
    return t => { const p = clamp(rx.at(t));
      rail.style.opacity = p.toFixed(3); rail.style.transform = `translateX(${px((1-p)*-16)})`;
      items.forEach(it => { const w = clamp(it.w.at(t)), h = clamp(it.h.at(t));
        it.d.style.opacity = w.toFixed(3);
        it.d.style.maxHeight = px(h * 40); it.d.style.paddingTop = it.d.style.paddingBottom = px(h * 8);
        it.d.style.marginBottom = px(-6 * (1 - h)); it.d.style.overflow = 'hidden';
        it.d.style.visibility = w < .02 && h < .02 ? 'hidden' : 'visible';
        it.sw.apply(it.c, 0, t); it.sw.apply(it.r, 1, t); }); };
  }});
