atom({ id:'redline', cat:'Documents', name:'Redline compare', block:'diff, revisions, track changes', fam:['M'],
  html:`<div class="col" style="width:min(400px,94%);gap:8px"><div class="card col" style="padding:14px 16px;gap:10px"><b style="font-size:15px">Services agreement · v2 vs v3</b><div class="row" style="gap:8px"><button class="btn m0" style="min-height:32px;border-radius:8px">Original</button><button class="btn m1" style="min-height:32px;border-radius:8px">Compare</button><button class="btn m2" style="min-height:32px;border-radius:8px">Revised</button></div><div class="pg" style="font-size:13.5px;line-height:1.6;overflow:hidden"></div><div class="row" style="gap:8px;align-items:center"><button class="btn acc" style="min-height:32px;border-radius:8px">Accept all</button><span class="fin small" style="position:relative;height:22px;flex:1;font-size:12.5px"></span></div></div><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="mk" checked> show markup colors</label></div><div class="hint">Open Compare, then Accept all</div>`,
  desc:'Deleted lines fade first and only then does their width close; inserted lines open first and fade in after. The paragraph reflows on a soft spring. Accepting lands a success terminal.',
  api:'del.o→0 then del.w→0   ins.w→full then ins.o→1   reflow soft   acc: fin.to(1)',
  init(st){
    const pg = $(st,'.pg'), fin = $(st,'.fin'), mk = $(st,'.mk');
    const F = ['All changes accepted — clean copy ✓', ''].map(s => { const el = document.createElement('span'); el.className = 'layer'; el.textContent = s; fin.appendChild(el); return el; });
    const delO = new Track(1), delW = new Track(1), insO = new Track(0), insW = new Track(0), rf = new Track(0), acc = new Swap(1);
    const del = document.createElement('span'), ins = document.createElement('span'), keep = document.createElement('span');
    del.textContent = 'Payment is due in 30 days. '; ins.textContent = 'Payment is due in 14 days with a 2% discount. '; keep.textContent = 'Care survives termination.';
    pg.append(keep, document.createTextNode(' '), del, document.createTextNode(' '), ins);
    let mode = 1;
    const show = m => { mode = m; const t0 = now();
      if (m === 0){ delO.set(1, S.base, t0); delW.set(1, S.base, t0); insO.set(0, S.base, t0); insW.set(0, S.base, t0); }
      if (m === 2){ delO.set(0, S.base, t0); delW.set(0, S.base, t0); insO.set(1, S.base, t0); insW.set(1, S.base, t0); }
      if (m === 1){ delO.set(1, S.base, t0); delW.set(1, S.base, t0); insO.set(0, S.base, t0); insW.set(0, S.base, t0);
        const t1 = t0 + 0.12; delO.set(0.35, S.soft, t1); insW.set(1, S.soft, t1); insO.set(1, S.soft, t1 + 0.12); }
      rf.set(m === 1 ? 1 : 0, S.soft); acc.to(1); };
    $(st,'.m0').onclick = () => show(0); $(st,'.m1').onclick = () => show(1); $(st,'.m2').onclick = () => show(2);
    $(st,'.acc').onclick = () => { const t0 = now(); delO.set(0, S.base, t0); delW.set(0, S.base, t0 + 0.12); insW.set(1, S.base, t0); insO.set(1, S.base, t0 + 0.12); acc.to(0); };
    show(1);
    return t => { const dw = clamp(delW.at(t)), iw = clamp(insW.at(t));
      del.style.opacity = clamp(delO.at(t)).toFixed(3); del.style.display = dw < 0.02 && mode !== 0 ? 'none' : '';
      ins.style.opacity = clamp(insO.at(t)).toFixed(3); ins.style.display = iw < 0.02 && mode !== 2 ? 'none' : '';
      if (mk.checked){ del.style.background = 'color-mix(in oklab, var(--danger) 18%, transparent)'; del.style.textDecoration = 'line-through'; ins.style.background = 'color-mix(in oklab, var(--success) 18%, transparent)'; }
      else { del.style.background = 'none'; del.style.textDecoration = 'none'; ins.style.background = 'none'; }
      pg.style.transform = `translateY(${(clamp(rf.at(t)) * 3).toFixed(2)}px)`;
      F.forEach((el,k) => acc.apply(el,k,t)); F[0].style.color = 'var(--success)'; };
  }});
