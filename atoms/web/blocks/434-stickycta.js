atom({ id:'stickycta', cat:'Landing', name:'Sticky CTA reveal', block:'Landing sticky', fam:['M','S'],
  html:`<div class="col" style="gap:0;max-width:380px;margin:0 auto;padding:44px 16px"><p style="margin:0 0 12px;font-size:15px;font-weight:600;line-height:1.45;text-align:center">Scroll the preview</p><div class="pv" style="position:relative;height:300px;overflow:hidden;border:1px solid var(--line-soft);border-radius:10px;background:var(--card)"><div class="box" style="height:100%;overflow:auto"><div class="hero" style="padding:36px 20px;text-align:center"><div style="font-size:30px;font-weight:600;letter-spacing:-.035em;line-height:1.15">Ship the page</div><p class="small muted" style="font-size:13px;line-height:1.5">Scroll past this hero to call in the bar.</p><button class="btn ink" style="min-height:36px;border-radius:10px">Start free</button></div><div style="padding:8px 20px 20px;display:flex;flex-direction:column;gap:8px;font-size:13px;line-height:1.5"><div style="border-top:1px solid var(--line-soft);padding-top:12px">Compose in blocks, preview everywhere, publish in one click.</div><div style="border-top:1px solid var(--line-soft);padding-top:12px">Forms, paywalls and newsletters included.</div><div class="ftr" style="border-top:1px solid var(--line-soft);margin-top:8px;padding:28px 0 20px;font-size:12.5px;color:var(--muted)">Footer — the bar hides near here.</div></div></div><div class="bar" style="position:absolute;left:8px;right:8px;top:8px;display:flex;align-items:center;gap:8px;background:var(--ink);color:var(--card);border-radius:10px;padding:6px 6px 6px 12px;box-shadow:var(--shadow)"><span class="lb" style="position:relative;flex:1;display:grid;font-size:13px;font-weight:600;min-height:20px;align-items:center"></span><button class="btn ct" style="flex:none;min-height:36px;border-radius:9px;background:var(--card);color:var(--ink);border:0">Start free</button></div></div><div class="seg sm" role="group" aria-label="Plan" style="margin-top:12px;align-self:center"><div class="ind"></div><button type="button" class="small muted" style="font-size:12.5px">Starter</button><button type="button" class="small muted" style="font-size:12.5px">Studio</button></div></div><div class="hint">Bar drops after the hero · hides near the footer · label follows the plan</div>`,
  desc:'Scrolling past the hero drops the bar in on a spring; nearing the footer sends it back up. The bar label swaps with the plan picker, so the call to action always names the chosen terminal plan.',
  api:'y.set(pastHero && !nearFoot ? 1 : 0)   label.to(plan)',
  init(st){
    const box = $(st,'.box'), bar = $(st,'.bar'), sm = $(st,'.sm');
    const plans = ['Starter','Studio'];
    const L = plans.map(p => { const e = document.createElement('span'); e.style.cssText = 'grid-area:1/1;white-space:nowrap'; e.textContent = 'Start ' + p + ' free'; $(st,'.lb').appendChild(e); return e; });
    const y = new Track(0, S.base), sw = new Swap(0), e = edges(0,0);
    let plan = 1, want = 0;
    y.jump(0);
    box.addEventListener('scroll', () => {
      const past = box.scrollTop > 150;
      const near = box.scrollTop + box.clientHeight > box.scrollHeight - 130;
      const w = past && !near ? 1 : 0;
      if (w !== want){ want = w; REDUCE ? y.jump(w) : y.set(w); }
    }, { passive:true });
    const place = (i, inst) => { const b = $$(sm,'button')[i]; inst ? e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); };
    $$(sm,'button').forEach((b,i) => b.onclick = () => { plan = i; place(i); sw.to(i); });
    const init = () => { place(plan, true); sw.cur = plan; sw.prev = null; sw.t = -9; };
    document.fonts.ready.then(init); init();
    addEventListener('resize', () => place(plan, true));
    bar.style.transform = 'translateY(-130%)';
    return t => {
      const p = clamp(y.at(t));
      bar.style.transform = `translateY(${(-(1-p)*130).toFixed(1)}%)`;
      bar.style.opacity = p.toFixed(3);
      bar.style.visibility = p < .02 ? 'hidden' : 'visible';
      bar.style.pointerEvents = p < .5 ? 'none' : 'auto';
      L.forEach((el,k) => sw.apply(el,k,t));
      const a = e.A.at(t), b = e.B.at(t), ind = $(sm,'.ind');
      ind.style.transform = `translateX(${px(a)})`; ind.style.width = px(b - a);
    };
  }});
