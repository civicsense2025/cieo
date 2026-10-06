

/* ---------- Admin ---------- */
atom({ id:'switch', cat:'Admin', name:'Switch', block:'Switch / Toggle primitive', fam:['E','M'],
  html:`<div class="l-switch-row" style="width:min(320px,88%);padding:24px;background:var(--card);box-shadow:var(--shadow);border-radius:24px;display:flex;align-items:center;gap:16px"><div class="l-switch-copy" style="flex:1;font-size:14px;font-weight:600">Keep me in the loop<small style="display:block;color:var(--muted);font-size:12px;font-weight:400;margin-top:4px">Email notifications</small></div><button type="button" class="tg" role="switch" aria-checked="false" aria-label="Email notifications" style="position:relative;width:72px;height:48px;flex:none;border-radius:24px;border:0;padding:0;cursor:pointer;background:var(--raised)"><span class="kn" style="position:absolute;top:8px;left:0;height:32px;border-radius:16px;background:var(--card);box-shadow:var(--shadow)"></span></button></div><div class="hint">Click, press Space, or hold and release</div>`,
  desc:'The knob leads with one edge and trails with the other. While pressed it widens toward where it will go. The track inks in on the same spring.',
  api:'knob.go(l, r)   press.set(down ? 1 : 0, S.snap)',
  init(st){
    const tg = $(st,'.tg'), kn = $(st,'.kn'), OFF = [8,40], ON = [32,64], e = edges(...OFF), pr = new Track(0, S.snap), fl = new Track(0); let on = false;
    const flip = () => { on = !on; e.go(...(on ? ON : OFF)); fl.set(on ? 1 : 0); tg.setAttribute('aria-checked', on); };
    tg.onpointerdown=()=>pr.set(1);tg.onpointerup=()=>pr.set(0);tg.onpointercancel=()=>pr.set(0);tg.onpointerleave=()=>pr.set(0);tg.onclick=flip;tg.onkeydown=ev=>{if(ev.key===' ')pr.set(1)};tg.onkeyup=()=>pr.set(0);
    return t => { const p = pr.at(t), l = e.A.at(t) - (on ? 6*p : 0), r = e.B.at(t) + (on ? 0 : 6*p);
      kn.style.transform = `translateX(${px(l)})`; kn.style.width = px(r - l); tg.style.background = mix(fl.at(t), 'var(--accent)', 'var(--raised)'); };
  }});