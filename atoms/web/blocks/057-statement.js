

atom({ id:'statement', cat:'Content', name:'Statement reveal', block:'statement, quote', fam:['S','T'],
  html:`<p class="stm" style="margin:0;max-width:340px;font-size:28px;line-height:1.15;letter-spacing:-.03em;font-weight:600;text-align:center;text-wrap:balance"></p><button class="btn" style="position:absolute;top:10px;right:12px">Replay</button>`,
  desc:'Words enter one by one, 50ms apart, using the same blur-and-rise as a content swap. Nothing moves once the line is complete.',
  api:'word[i] = enter(prog(t, t0 + i·0.05))',
  init(st){
    const p = $(st,'.stm'), W = 'Make each page do one thing, and do it well.'.split(' ');
    p.innerHTML = W.map(w => `<span style="display:inline-block">${w}</span>`).join(' '); const ws = $$(p,'span'); let t0 = 0;
    const go = () => t0 = now(); $(st,'.btn').onclick = go; go();
    return t => ws.forEach((w,i) => fade(w, prog(t, t0 + i*.05), (1 - clamp(prog(t, t0 + i*.05)))*8));
  }});