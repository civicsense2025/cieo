

atom({ id:'flip', cat:'Content', name:'Flip card', block:'flip-card', fam:['M'],
  html:`<div class="fc" style="width:220px;height:140px;perspective:800px;cursor:pointer" tabindex="0" role="button" aria-label="Flip card"><div class="in" style="position:relative;width:100%;height:100%;transform-style:preserve-3d"><div class="card" style="position:absolute;inset:0;backface-visibility:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:16px"><span class="small muted">Plan</span><b style="font-size:22px;letter-spacing:-.02em">Studio</b></div><div class="card" style="position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);background:var(--ink);color:var(--card);padding:16px;font-size:13px;line-height:1.5">Unlimited pages, custom domains, member areas and priority support.</div></div></div><div class="hint">Click or press Enter</div>`,
  desc:'One rotation track on the soft spring. The card sinks 3% at the midpoint so the flip has depth without a bounce.',
  api:'rot.set(front ? 0 : 180, S.soft)',
  init(st){
    const fc = $(st,'.fc'), inn = $(st,'.in'), r = new Track(0, S.soft);
    const flip = () => r.set(r.target ? 0 : 180); fc.onclick = flip; fc.onkeydown = e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flip(); } };
    return t => { const a = r.at(t); inn.style.transform = `rotateY(${a.toFixed(2)}deg) scale(${(1 - .03*Math.sin(Math.PI*clamp(a/180))).toFixed(4)})`; };
  }});