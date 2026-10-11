/* Admin: real settings context and a 44px hit area without changing the spring geometry. */
atom({
  id:'switch',cat:'Admin',name:'Switch',block:'Switch / Toggle primitive',fam:['E','M'],
  html:`<div class="card lib-switch-specimen" style="width:min(336px,88%);padding:24px;border-radius:24px">
    <div class="row" style="justify-content:space-between;gap:24px">
      <div class="col" style="gap:8px"><strong style="font-size:15px">A little heads-up.</strong><span class="muted" style="font-size:13px">Email notifications</span></div>
      <button type="button" class="tg" role="switch" aria-checked="false" aria-label="Email notifications" style="position:relative;flex:none;width:64px;height:44px;border:0;padding:0;background:transparent;cursor:pointer;border-radius:24px">
        <span class="rail" aria-hidden="true" style="position:absolute;inset:4px 0;border-radius:24px;background:var(--raised);box-shadow:inset 0 0 0 1.5px var(--muted)"><span class="kn" style="position:absolute;top:4px;left:0;height:28px;border-radius:24px;background:var(--card);box-shadow:inset 0 0 0 1.5px var(--muted), var(--shadow)"></span></span>
      </button>
    </div><div class="small muted" style="margin-top:24px">Notifications <span class="switch-state">off</span></div>
  </div><div class="hint">A soft stretch. A clear state.</div>`,
  desc:'The knob leads with one edge and trails with the other. A native button supplies click and keyboard activation; cancelled presses never toggle the value.',
  api:'knob.go(l, r)   press.set(down ? 1 : 0, S.snap)',
  init(st){
    const tg=$(st,'.tg'),kn=$(st,'.kn'),rail=$(st,'.rail'),label=$(st,'.switch-state');
    const OFF=[4,32],ON=[32,60],e=edges(...OFF),pr=new Track(0,S.snap),fl=new Track(0);let on=false;
    tg.onclick=()=>{on=!on;e.go(...(on?ON:OFF));fl.set(on?1:0);tg.setAttribute('aria-checked',String(on));label.textContent=on?'on':'off';};
    tg.onpointerdown=event=>{if(event.button===0)pr.set(1);};
    tg.onpointerup=tg.onpointerleave=tg.onpointercancel=tg.onblur=()=>pr.set(0);
    tg.onkeydown=event=>{if((event.key===' '||event.key==='Enter')&&!event.repeat)pr.set(1);};
    tg.onkeyup=()=>pr.set(0);
    return t=>{
      const p=pr.at(t),l=e.A.at(t)-(on?6*p:0),r=e.B.at(t)+(on?0:6*p);
      kn.style.transform=`translateX(${px(l)})`;kn.style.width=px(r-l);
      const f=fl.at(t);rail.style.background=mix(f,'var(--accent)','var(--raised)');rail.style.boxShadow=`inset 0 0 0 1.5px ${mix(f,'var(--accent)','var(--muted)')}`;
    };
  },
});
