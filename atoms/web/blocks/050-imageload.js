

atom({ id:'imageload', cat:'Media', name:'Image blur-up', block:'image, featured-image', fam:['S','T'],
  html:`<div class="im" style="position:relative;width:min(320px,86%);aspect-ratio:16/10;max-width:100%;border-radius:12px;overflow:hidden;background:var(--raised)"><div class="pic" style="position:absolute;inset:0"></div></div><button class="btn" style="position:absolute;top:10px;right:12px">Reload</button>`,
  desc:'A tiny blurred placeholder holds the space. When the image decodes, blur and a 4% overscale settle together on the lazy spring, so the sharpening reads as focus, not a pop.',
  api:'blur = 14·(1 − p)   scale = 1 + 0.04·(1 − p)   p = load.at(t)',
  init(st){
    const pic = $(st,'.pic'); pic.innerHTML = scene(true); const ld = new Track(0, S.lazy); let at = 0;
    const go = () => { ld.jump(0); at = now() + .9; }; $(st,'.btn').onclick = go; go();
    return t => { if (at && t >= at){ at = 0; ld.set(1); } const p = clamp(ld.at(t));
      pic.style.filter = p < .995 ? `blur(${(14*(1-p)).toFixed(2)}px)` : 'none'; pic.style.transform = `scale(${(1 + .04*(1-p)).toFixed(4)})`; pic.style.opacity = (.55 + .45*p).toFixed(3); };
  }});