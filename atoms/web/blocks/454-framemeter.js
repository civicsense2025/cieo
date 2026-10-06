atom({ id:'framemeter', cat:'Foundations', name:'Frame meter', block:'performance, spring presets, rolling digits', fam:['T'],
  html:`<div class="card col" style="width:min(360px,92%);padding:18px;gap:16px"><div class="lane" style="position:relative;height:40px;border-radius:10px;background:var(--raised)"><div class="dt" style="position:absolute;left:8px;top:8px;width:24px;height:24px;border-radius:50%;background:var(--accent)"></div></div><div class="row" style="gap:16px;align-items:center"><div class="row" style="gap:8px;align-items:baseline"><span class="small muted" style="font-size:12px">frame</span><span class="fd" style="font:13px var(--mono);font-variant-numeric:tabular-nums"></span><span class="small muted" style="font-size:12px">ms</span></div><div class="row" style="gap:8px;align-items:baseline"><span class="small muted" style="font-size:12px">dropped</span><span class="dd" style="font:13px var(--mono);font-variant-numeric:tabular-nums"></span></div></div><div class="row" style="gap:8px"><button class="btn bgo" style="flex:1;min-height:36px">Start</button><button class="btn bstop" style="flex:1;min-height:36px">Stop</button></div><div class="row small muted" style="gap:8px;align-items:center"><span style="font-size:12px">drop &gt; 25ms</span><button class="btn brs" style="min-height:32px">Reset count</button></div></div><div class="hint">Frame time and dropped frames while the spring runs</div>`,
  desc:'Start the spring and watch real frame times roll in. Anything over 25ms counts as dropped.',
  api:'dt = performance.now() − last · dropped += dt > 25',
  init(st){
    const lane = $(st,'.lane'), dot = $(st,'.dt');
    const fd = new Digits($(st,'.fd'), 3), dd = new Digits($(st,'.dd'), 4);
    fd.set('0', true); dd.set('0', true);
    const mv = new Track(0, S.soft);
    let run = false, last = performance.now(), drop = 0;
    $(st,'.bgo').onclick = () => { run = true; last = performance.now();
      if (REDUCE) mv.jump(1); else mv.set(1, S.soft); };
    $(st,'.bstop').onclick = () => { run = false; mv.jump(mv.target); };
    $(st,'.brs').onclick = () => { drop = 0; dd.set('0', true); };
    return t => { const ms = performance.now() - last; last = performance.now();
      if (run && !REDUCE){ fd.set(String(Math.min(999, Math.round(ms))));
        if (ms > 25){ drop = Math.min(9999, drop + 1); dd.set(String(drop)); }
        if (Math.abs(mv.target - mv.at(t)) < .005) mv.set(mv.target ? 0 : 1, S.soft, t); }
      fd.render(t); dd.render(t);
      const W = Math.max(1, lane.clientWidth - 40);
      dot.style.transform = `translateX(${px(clamp(mv.at(t)) * W)})`; };
  }});
