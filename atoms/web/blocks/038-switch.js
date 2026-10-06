/* Keep the original elastic edges; use one native click path for pointer and keyboard. */
atom({
  id:'switch',cat:'Admin',name:'Switch',block:'Switch / Toggle primitive',fam:['E','M'],
  html:`<style>
    #switch .switch-card{width:min(352px,calc(100% - 32px));padding:24px;border:1px solid var(--line-soft);border-radius:24px;background:var(--card)}
    #switch .switch-title{font-size:14px;font-weight:600;margin:0 0 16px;letter-spacing:-.02em}
    #switch .switch-row{display:flex;align-items:center;justify-content:space-between;gap:16px}
    #switch .switch-label{font-size:13px;line-height:1.5}
    #switch .switch-label small{display:block;color:var(--muted);font-size:12px;margin-top:8px}
    #switch .tg{position:relative;width:64px;height:48px;flex:none;border:0;background:none;padding:0;cursor:pointer;border-radius:16px;touch-action:manipulation}
    #switch .switch-track{position:absolute;inset:6px 0;border-radius:24px;background:var(--raised)}
    #switch .kn{position:absolute;top:10px;left:0;height:28px;border-radius:16px;background:var(--card);box-shadow:0 2px 4px #0000001f}
    #switch .switch-foot{margin:16px 0 0;padding-top:16px;border-top:1px solid var(--line-soft);color:var(--muted);font-size:12px}
  </style><div class="switch-card"><h4 class="switch-title">Keep me in the loop.</h4><div class="switch-row"><div class="switch-label" id="switch-label">Email notifications<small>Only the important updates.</small></div><button type="button" class="tg" role="switch" aria-checked="false" aria-labelledby="switch-label"><span class="switch-track" aria-hidden="true"></span><span class="kn" aria-hidden="true"></span></button></div><p class="switch-foot">The little things, in your control.</p></div>`,
  desc:'The knob leads with one edge and trails with the other. A 48-pixel control target surrounds the original switch geometry.',
  api:'knob.go(l, r)   press.set(down ? 1 : 0, S.snap)',
  init(st){
    const tg=$(st,'.tg'),kn=$(st,'.kn'),track=$(st,'.switch-track');
    const OFF=[4,32],ON=[32,60],e=edges(...OFF),pr=new Track(0,S.snap),fl=new Track(0);let on=false;
    tg.onclick=()=>{on=!on;e.go(...(on?ON:OFF));fl.set(on?1:0);tg.setAttribute('aria-checked',String(on));};
    tg.onpointerdown=event=>{if(event.button===0)pr.set(1);};
    tg.onpointerup=tg.onpointerleave=tg.onpointercancel=tg.onblur=()=>pr.set(0);
    tg.onkeydown=event=>{if(event.key===' '&&!event.repeat)pr.set(1);};
    tg.onkeyup=()=>pr.set(0);
    return t=>{const p=pr.at(t),l=e.A.at(t)-(on?6*p:0),r=e.B.at(t)+(on?0:6*p);
      kn.style.transform=`translateX(${px(l)})`;kn.style.width=px(r-l);track.style.background=mix(fl.at(t),'var(--accent)','var(--raised)');};
  }
});
