atom({id:'switch',cat:'Admin',name:'Switch',block:'Switch / Toggle primitive',fam:['E','M'],
  html:`<div class="ui-setting-row"><div><strong>Stay in the loop</strong><small>Email notifications</small></div><button class="cieo-switch" type="button" role="switch" aria-checked="false" aria-label="Email notifications" style="position:relative;flex:none;width:80px;height:48px;border-radius:24px;border:0;padding:0;background:var(--raised);cursor:pointer"><span class="cieo-switch-knob" style="position:absolute;top:8px;left:0;height:32px;border-radius:50%;background:var(--card);box-shadow:0 2px 6px #0002;pointer-events:none"></span></button></div><div class="hint">A gentle press. A little stretch.</div>`,
  desc:'The knob keeps the original lagging-edge spring and pressure stretch. A real button supports pointer, keyboard and assistive activation without double toggles.',
  api:'knob.go(left, right)   press.set(down ? 1 : 0, S.snap)',
  init(st){
    const tg=$(st,'.cieo-switch'),kn=$(st,'.cieo-switch-knob'),OFF=[8,40],ON=[40,72],e=edges(...OFF),press=new Track(0,S.snap),fill=new Track(0);let on=false;
    tg.onclick=()=>{on=!on;press.set(0);e.go(...(on?ON:OFF));fill.set(on?1:0);tg.setAttribute('aria-checked',String(on))};
    tg.onpointerdown=ev=>{if(ev.button===0)press.set(1)};tg.onpointerup=tg.onpointercancel=tg.onpointerleave=()=>press.set(0);
    tg.onkeydown=ev=>{if(ev.key===' '&&!ev.repeat)press.set(1)};tg.onkeyup=tg.onblur=()=>press.set(0);
    return t=>{const p=press.at(t),l=e.A.at(t)-(on?4*p:0),r=e.B.at(t)+(on?0:4*p);kn.style.transform=`translateX(${px(l)})`;kn.style.width=px(r-l);tg.style.background=mix(fill.at(t),'var(--accent)','var(--raised)')};
  }
});
