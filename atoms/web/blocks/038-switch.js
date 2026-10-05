

/* ---------- Admin ---------- */
atom({ id:'switch', cat:'Admin', name:'Switch', block:'Switch / Toggle primitive', fam:['E','M'],
  html:`<button class="tg" role="switch" aria-checked="false" aria-label="Email notifications" style="position:relative;width:64px;height:36px;border-radius:18px;border:0;padding:0;cursor:pointer;background:var(--raised)"><span class="kn" style="position:absolute;top:4px;left:0;height:28px;border-radius:14px;background:var(--card);box-shadow:var(--shadow)"></span></button><div class="hint">Press and hold, then release</div>`,
  desc:'The knob leads with one edge and trails with the other. While pressed it widens toward where it will go. The track inks in on the same spring.',
  api:'knob.go(l, r)   press.set(down ? 1 : 0, S.snap)',
  init(st){
    const tg = $(st,'.tg'), kn = $(st,'.kn'), OFF = [4,32], ON = [32,60], e = edges(...OFF), pr = new Track(0, S.snap), fl = new Track(0); let on = false;
    const flip = () => { on = !on; e.go(...(on ? ON : OFF)); fl.set(on ? 1 : 0); tg.setAttribute('aria-checked', on); };
    tg.onpointerdown = () => pr.set(1); tg.onpointerup = () => { pr.set(0); flip(); }; tg.onpointerleave = () => pr.set(0);
    tg.onkeydown = ev => { if (ev.key === ' ' || ev.key === 'Enter'){ ev.preventDefault(); flip(); } };
    return t => { const p = pr.at(t), l = e.A.at(t) - (on ? 6*p : 0), r = e.B.at(t) + (on ? 0 : 6*p);
      kn.style.transform = `translateX(${px(l)})`; kn.style.width = px(r - l); tg.style.background = mix(fl.at(t), 'var(--ink)', 'var(--raised)'); };
  }});