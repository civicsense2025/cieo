

atom({ id:'multiselect', cat:'Forms', name:'Multi-select', block:'form (multi-select)', fam:['X','M'], tall:true,
  html:`<div style="position:absolute;top:36px;left:50%;transform:translateX(-50%);width:min(280px,86vw)"><button class="tr card" aria-haspopup="listbox" aria-expanded="false" style="width:100%;min-height:42px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:6px 32px 6px 8px;border:1.5px solid var(--line);cursor:pointer;text-align:left;position:relative"><span class="ph small muted" style="padding-left:4px">Pick teams</span><span style="position:absolute;right:10px;top:13px">${ic(I.chev,14)}</span></button><div class="lb card" role="listbox" aria-multiselectable="true" style="position:absolute;top:calc(100% + 6px);left:0;right:0;padding:6px;transform-origin:50% 0;visibility:hidden"></div></div>`,
  desc:'Ticking an option adds a chip to the trigger, which opens its width before its text appears. Unticking reverses it. The list stays open so you can pick several.',
  api:'chip.w.set(1); chip.o.set(1, t + 0.06)   box.fill.set(on)',
  init(st){
    const tr = $(st,'.tr'), lb = $(st,'.lb'), ph = $(st,'.ph'), O = ['Design','Engineering','Marketing','Sales','Support'], o = new Track(0);
    const opts = O.map(n => { const b = document.createElement('div'); b.setAttribute('role','option'); b.setAttribute('aria-selected','false'); b.style.cssText = 'display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:7px;font-size:14px;cursor:pointer';
      b.innerHTML = `<span class="bx" style="width:16px;height:16px;border-radius:4px;border:1.5px solid var(--line);display:grid;place-items:center;color:var(--card)">${ic(I.check,11,3.5)}</span>${n}`; lb.appendChild(b);
      b.onpointerenter = () => b.style.background = 'var(--raised)'; b.onpointerleave = () => b.style.background = 'none';
      const chip = document.createElement('span'); chip.style.cssText = 'display:inline-flex;overflow:hidden;white-space:nowrap;border-radius:999px;background:var(--raised);height:26px'; chip.innerHTML = `<span class="ci" style="display:inline-flex;align-items:center;padding:0 10px;font-size:12.5px;font-weight:500">${n}</span>`; tr.insertBefore(chip, ph);
      const x = { b, bx:$(b,'.bx'), chip, ci:$(chip,'.ci'), on:false, f:new Track(0), w:new Track(0), co:new Track(0), W:0 }; chip.style.width = '0px'; return x; });
        opts.forEach(x => x.b.onclick = e => { e.stopPropagation(); x.on = !x.on; x.b.setAttribute('aria-selected', x.on); x.f.set(x.on ? 1 : 0); const t0 = now();
      if (x.on){ x.chip.style.display = 'inline-flex'; x.W = x.ci.scrollWidth; x.w.set(1); x.co.set(1, S.base, t0 + .06); } else { x.co.set(0, S.snap); x.w.set(0, S.base, t0 + EXIT); } });
    tr.onclick = () => { openSet(o, !o.target); tr.setAttribute('aria-expanded', !!o.target); }; outside(st, [tr, lb], () => { openSet(o, false); tr.setAttribute('aria-expanded', false); });
    return t => { pop(lb, o.at(t)); let any = 0;
      opts.forEach(x => { const f = clamp(x.f.at(t)), w = clamp(x.w.at(t)); any = Math.max(any, w); x.bx.style.background = mix(f,'var(--ink)','transparent'); x.bx.style.borderColor = mix(f,'var(--ink)','var(--line)');
        x.chip.style.width = px(x.W*w); x.chip.style.marginRight = px(-6*(1-w)); x.chip.style.display = w < .005 && !x.on ? 'none' : 'inline-flex'; fade(x.ci, x.co.at(t), null); });
      ph.style.opacity = (1 - any).toFixed(3); ph.style.display = any > .98 ? 'none' : ''; };
  }});