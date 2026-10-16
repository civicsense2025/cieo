atom({ id:'durationladder', cat:'Foundations', name:'Duration ladder', block:'durations, spring presets, rolling digits', fam:['T'],
  html:`<div class="card col" style="width:min(360px,92%);padding:18px;gap:8px">${[['snap','200'],['base','300'],['soft','440'],['lazy','740']].map(r=>`<div class="row" style="gap:8px;align-items:center"><button class="btn st" style="flex:1;min-height:40px;text-align:left">${r[0]}</button><div class="ln" style="position:relative;flex:1;height:24px"><b style="position:absolute;left:0;top:5px;width:14px;height:14px;border-radius:50%;background:var(--ink)"></b></div><span class="dg" style="font:13px var(--mono);font-variant-numeric:tabular-nums"></span><span class="small muted" style="font-size:12px">ms</span></div>`).join('')}<div class="row small muted" style="gap:8px;align-items:center;margin-top:8px"><button class="btn all" style="min-height:32px">Play all</button><span style="font-size:12px">fires every step at once</span></div></div><div class="hint">Tap each step to feel it</div>`,
  desc:'Four durations from snappy to ambient. Each step runs its own spring; the millisecond labels roll on Digits.',
  api:'steps.forEach(x => x.set(1, S.snap|base|soft|lazy)) · ms.set("300")',
  init(st){
    const btns = $$(st,'.st'), dots = $$(st,'.ln b');
    const CF = [S.snap, S.base, S.soft, S.lazy], MS = ['200', '300', '440', '740'];
    const T = CF.map(c => new Track(0, c));
    const D = $$(st,'.dg').map((el, i) => { const d = new Digits(el, 3); d.set(MS[i], true); return d; });
    btns.forEach((b, i) => b.onclick = () => { const v = T[i].target ? 0 : 1;
      if (REDUCE) T[i].jump(v); else T[i].set(v); });
    $(st,'.all').onclick = () => { const t0 = now();
      T.forEach(x => { if (REDUCE) x.jump(1); else x.set(1, undefined, t0); }); };
    return t => { dots.forEach((d, i) => { const w = Math.max(1, size(d.parentNode).cw - 14);
        d.style.transform = `translateX(${px(clamp(T[i].at(t)) * w)})`; });
      D.forEach(d => d.render(t)); };
  }});
