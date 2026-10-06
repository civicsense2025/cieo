atom({ id:'logomarquee', cat:'Landing', name:'Logo marquee', block:'Landing logos', fam:['T','M'],
  html:`<div class="col" style="gap:0;max-width:460px;margin:0 auto;padding:44px 0;text-align:center"><p style="margin:0 0 16px;font-size:15px;font-weight:600;line-height:1.45">Loved by teams everywhere</p><div class="mq" style="width:100%;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)"><div class="mr" style="display:flex;width:max-content;align-items:center"></div></div><label class="row small muted" style="gap:6px;margin-top:16px;cursor:pointer;font-size:12.5px;line-height:1.5;justify-content:center"><input type="checkbox" class="pz"> pause strip</label></div><div class="hint">Hover slows to a stop · pauses offscreen</div>`,
  desc:'The strip loops seamlessly with faded edges. Hovering eases the speed to a full stop on a soft spring and leaving restores it; scrolling it offscreen freezes the offset entirely.',
  api:'v.set(hover ? 0 : 1, soft)   x += v·dt while visible',
  init(st){
    const mq = $(st,'.mq'), mr = $(st,'.mr'), pz = $(st,'.pz');
    const N = ['Field Notes','North Studio','The Ledger','Loop Press','Common Room','Paper Trail'];
    const one = N.map(w => `<span style="font-size:15px;font-weight:600;letter-spacing:-.01em;padding:0 22px;color:var(--muted);white-space:nowrap">${w}</span><span style="color:var(--line);font-size:15px">·</span>`).join('');
    mr.innerHTML = one + one;
    const v = new Track(1, S.soft); v.jump(REDUCE ? 0 : 1);
    let x = 0, last = -1, vis = true, hover = false;
    const sync = () => v.set(pz.checked || hover || REDUCE ? 0 : 1);
    mq.onpointerenter = () => { hover = true; sync(); };
    mq.onpointerleave = () => { hover = false; sync(); };
    pz.onchange = sync;
    new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(st);
    return t => {
      if (last < 0) last = t;
      const dt = Math.min(.05, t - last); last = t;
      if (vis) x += v.at(t)*dt*60;
      const half = mr.scrollWidth/2 || 1;
      mr.style.transform = `translateX(${px(-(x % half))})`;
    };
  }});
