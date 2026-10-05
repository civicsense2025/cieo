

atom({ id:'paywall', cat:'Newsletter', name:'Paywall unlock', block:'paywall', fam:['M','X'], tall:true,
  html:`<div class="card" style="position:relative;width:min(360px,90%);height:290px;overflow:hidden"><div class="ar small" style="padding:16px;line-height:1.65"><b style="display:block;font-size:16px;margin-bottom:6px">What we learned shipping members</b><p style="margin:0 0 10px">We expected sign-ups to come from the pricing page. They came from the end of long posts instead, right where readers had already decided the writing was worth it.</p><div class="rest"><p style="margin:0 0 10px">So we moved the offer. Every post over 1,200 words now ends with a single line and one button, and the pricing page became a reference instead of a pitch.</p><p style="margin:0">Conversion doubled in six weeks. Cancellations stayed flat, which told us nobody felt tricked into paying.</p></div></div><div class="gate" style="position:absolute;left:12px;right:12px;bottom:12px;padding:14px;border-radius:12px;background:var(--card);box-shadow:var(--shadow);display:flex;align-items:center;gap:12px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path class="sh" d="M8 11V8a4 4 0 0 1 8 0v3" style="transform-origin:16px 11px"/></svg><span class="small" style="flex:1"><b>Members only</b><br><span class="muted">Join to read the rest.</span></span><button class="btn ink un">Unlock</button></div></div><button class="btn rs" style="position:absolute;top:10px;right:12px">Reset</button>`,
  desc:'The lock’s shackle swings open first. Then the gate card exits and the fade over the hidden text lifts from top to bottom.',
  api:'shackle.set(1); gate.o.set(0, S.snap, t + 0.25); mask.set(1, S.lazy, t + 0.3)',
  init(st){
    const rest = $(st,'.rest'), gate = $(st,'.gate'), sh = $(st,'.sh'), sk = new Track(0), go = new Track(1), mk = new Track(0, S.lazy);
    $(st,'.un').onclick = () => { const t0 = now(); sk.set(1); go.set(0, S.snap, t0 + .25); mk.set(1, S.lazy, t0 + .3); };
    $(st,'.rs').onclick = () => { sk.set(0); go.set(1); mk.set(0, S.base); };
    return t => { const k = clamp(sk.at(t)), g = clamp(go.at(t)), m = clamp(mk.at(t));
      sh.style.transform = `translateY(${px(-2*k)}) rotate(${(-28*k).toFixed(2)}deg)`;
      fade(gate, g, (1-g)*12); gate.style.pointerEvents = g > .5 ? 'auto' : 'none';
      const a = (m*130).toFixed(1); const mm = `linear-gradient(#000 ${a - 30}%, transparent ${a}%)`; rest.style.maskImage = rest.style.webkitMaskImage = m > .99 ? 'none' : mm; };
  }});