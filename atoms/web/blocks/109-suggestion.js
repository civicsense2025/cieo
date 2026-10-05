

atom({ id:'suggestion', cat:'Writing', name:'Suggested edit', block:'richtext editor (review)', fam:['M','S'],
  html:`<div class="col" style="width:min(340px,88%);gap:12px"><p style="margin:0;font-size:15px;line-height:1.7">Our members get <span class="del" style="display:inline-block;overflow:hidden;vertical-align:bottom;white-space:nowrap;text-decoration:line-through;text-decoration-color:var(--danger);color:var(--danger)">early</span> <span class="ins" style="display:inline-block;overflow:hidden;vertical-align:bottom;white-space:nowrap;text-decoration:underline;text-decoration-color:var(--success);color:var(--success)">first-day</span> access to every drop.</p><div class="row"><button class="btn ink ac">Accept</button><button class="btn rj">Reject</button><button class="btn rs" style="margin-left:auto">Reset</button></div></div>`,
  desc:'Accepting fades the struck word and closes its gap, while the inserted word loses its suggestion color. Rejecting does the reverse. The sentence reflows on springs, not jumps.',
  api:'accept: del.o→0, del.w→0 at t + 0.1; ins.tint→0   reject: mirror',
  init(st){
    const del = $(st,'.del'), ins = $(st,'.ins'); let Wd = 0, Wi = 0;
    const T = { dw:new Track(1), do:new Track(1), dt:new Track(1), iw:new Track(1), io:new Track(1), it:new Track(1) };
    const measure = () => { del.style.width = ins.style.width = 'auto'; Wd = del.offsetWidth; Wi = ins.offsetWidth; }; document.fonts.ready.then(measure); measure();
    const go = (keepIns) => { const t0 = now(), [gone, kept] = keepIns ? ['d','i'] : ['i','d']; T[gone + 'o'].set(0, S.snap); T[gone + 'w'].set(0, S.base, t0 + EXIT); T[kept + 't'].set(0); };
    $(st,'.ac').onclick = () => go(true); $(st,'.rj').onclick = () => go(false); $(st,'.rs').onclick = () => { for (const k in T) T[k].set(1); };
    return t => { const dt = clamp(T.dt.at(t)), it = clamp(T.it.at(t));
      del.style.width = px(Wd*clamp(T.dw.at(t))); del.style.opacity = clamp(T.do.at(t)).toFixed(3); del.style.color = mix(dt,'var(--danger)','var(--ink)'); del.style.textDecorationColor = `color-mix(in oklab, var(--danger) ${(dt*100).toFixed(0)}%, transparent)`;
      ins.style.width = px(Wi*clamp(T.iw.at(t))); ins.style.opacity = clamp(T.io.at(t)).toFixed(3); ins.style.color = mix(it,'var(--success)','var(--ink)'); ins.style.textDecorationColor = `color-mix(in oklab, var(--success) ${(it*100).toFixed(0)}%, transparent)`; };
  }});