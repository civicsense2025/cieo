atom({ id:'sketchtext', cat:'Writing', name:'Sketch to text', block:'handwriting input, transcription', fam:['S','T'], tall:true,
  html:`<div class="col" style="width:min(320px,90%);gap:10px"><div class="card" style="padding:16px;position:relative;min-height:120px"><svg class="ink" width="100%" height="60" viewBox="0 0 280 60"><path d="M12 40 C 60 8, 90 52, 140 28 S 230 12, 268 34" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/></svg><p class="ty" style="margin:0;font-size:15px;line-height:1.7;position:absolute;inset:16px"></p></div><div class="ln small" style="color:var(--ink)">Tomorrow: outline the spring essay.</div><div class="ln small muted">Reminder set for 8 in the morning.</div><div class="row"><button class="btn cv">Convert</button><button class="btn rt" style="margin-left:auto">Retake</button></div></div><div class="hint">Convert swaps ink for text</div>`,
  desc:'The ink settles and trades places with typed text. The lines below slide down to make room. Words the reader might doubt blush a warning tint. Retake brings the ink back.',
  api:'ink.o.set(0, snap); text.to(1) after .1   below.y.set(H, base)   doubt.tint→1   retake: all back',
  init(st){
    const ink = $(st,'.ink'), ty = $(st,'.ty'), lns = [$$(st,'.ln')[0], $$(st,'.ln')[1]];
    const words = 'Tomorrow: outline the spring essay.'.split(' ').map(w => { const e = document.createElement('span'); e.textContent = w; Object.assign(e.style,{display:'inline-block',marginRight:'.3em'}); ty.appendChild(e); return e; });
    const io = new Track(1), to = new Track(0), y = new Track(0), tint = new Track(0), sw = new Swap(0); let done = false, H = 44;
    const go = () => { if (done) return; done = true; const t0 = now();
      io.set(0, S.snap); sw.to(1, t0); to.set(1, S.base, t0 + EXIT); y.set(H, S.base, t0 + EXIT); tint.set(1, S.base, t0 + .3); };
    const back = () => { done = false; io.set(1); to.set(0); y.set(0); tint.set(0); sw.to(0); };
    $(st,'.cv').onclick = go; $(st,'.rt').onclick = back; ink.addEventListener('click', go);
    return t => { const a = clamp(io.at(t)), b = clamp(to.at(t)), k = clamp(tint.at(t));
      ink.style.opacity = a.toFixed(3); ink.style.transform = `translateY(${((1-a)*6).toFixed(2)}px)`;
      ty.style.opacity = b.toFixed(3); ty.style.filter = b < .98 ? `blur(${((1-b)*BLUR).toFixed(2)}px)` : 'none';
      lns.forEach(el => el.style.transform = `translateY(${px(y.at(t))})`);
      words.forEach((w,i) => { if (i >= 2 && i <= 3) w.style.color = mix(k,'var(--warning)','var(--ink)'); });
      sw.apply(ty, 1, t); };
  }});
