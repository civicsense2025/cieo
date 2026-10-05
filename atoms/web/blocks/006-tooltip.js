

atom({ id:'tooltip', cat:'Content', name:'Tooltip', block:'tooltip', fam:['X'],
  html:`<p style="max-width:300px;text-align:center;margin:0;line-height:1.7">Prices update on the <span class="tt" tabindex="0" style="position:relative;border-bottom:1.5px dotted var(--faint);cursor:help">billing anchor<span class="tip" role="tooltip" style="position:absolute;z-index:30;left:50%;bottom:calc(100% + 8px);width:190px;margin-left:-95px;background:var(--ink);color:var(--card);font-size:12.5px;line-height:1.4;padding:7px 10px;border-radius:8px;pointer-events:none;transform-origin:50% 100%">The day of the month your first payment went through.</span></span> of each plan.</p><div class="hint">Hover or focus the dotted words</div>`,
  desc:'Enters on the base spring from 97% scale and 4px below. Exits faster on the snap spring so it never lingers. Studio’s current Tooltip has no enter or exit motion; this is the proposed behavior.',
  api:'o.set(open ? 1 : 0, open ? S.base : S.snap)',
  init(st){
    const w = $(st,'.tt'), tip = $(st,'.tip'), o = new Track(0);
    const set = v => o.set(v, v ? S.base : S.snap);
    w.onpointerenter = w.onfocus = () => set(1); w.onpointerleave = w.onblur = () => set(0);
    return t => { const p = clamp(o.at(t)); tip.style.opacity = p.toFixed(3); tip.style.visibility = p < .01 ? 'hidden' : 'visible';
      tip.style.transform = `translateY(${px((1-p)*4)}) scale(${(.97+.03*p).toFixed(4)})`; tip.style.filter = p < .98 ? `blur(${((1-p)*BLUR).toFixed(2)}px)` : 'none'; };
  }});