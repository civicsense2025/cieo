
atom({ id:'deltaarrows', cat:'Dynamic', name:'Delta arrows', block:'metric, chip', fam:['S','M'],
  html:`<div class="col" style="width:min(400px,calc(100% - 24px));margin:0 auto;gap:8px;align-items:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Today vs yesterday</b><button class="chipb" style="position:relative;height:44px;border-radius:22px;background:var(--ink);color:var(--card);border:0;cursor:pointer;font-weight:600;font-size:14px"><span class="in row" style="gap:8px;align-items:center;justify-content:center;padding:0 22px"><span class="ar" style="display:grid;place-items:center;padding:0;width:20px;height:20px;font-size:13px;transform:translateY(.5px)">▲</span><span class="tx num" style="font-variant-numeric:tabular-nums"></span></span></button><div class="cap small muted num" style="font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums">Step 1 of 5 · tap the chip</div><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;font-size:12px"><input type="checkbox" class="lp"> loop</label></div><div class="hint">Arrow turns as the chip swaps sign</div>`,
  desc:'The arrow turns through base as the chip swaps sign, the tint cross-fades success to danger, and the pill width springs to fit. The flat state holds as terminal.',
  api:'arrow.r.set(π·dir)   tint.set(sign)   w.set(measure(next))   end: flat, hold',
  init(st){
    const b = $(st,'.chipb'), tx = $(st,'.tx'), ar = $(st,'.ar'), cap = $(st,'.cap'), lp = $(st,'.lp');
    const T = ['+2.4% today','\u22121.1% today','+0.6% today','\u22123.2% today','Flat · settled'], SG = [1,-1,1,-1,0];
    const sw = new Swap(0), w = new Track(0), sv = new Track(0), r = new Track(0);
    let i = 0;
    const width = k => { const m = document.createElement('span'); m.textContent = T[k];
      Object.assign(m.style,{position:'absolute',visibility:'hidden',whiteSpace:'nowrap',font:'600 14px var(--sans)',padding:'0 22px'}); st.appendChild(m);
      const x = m.offsetWidth + 28; m.remove(); return x; };
    const paint = t => { const s = sv.at(t);
      b.style.background = SG[i] === 0 && s > .9 ? 'var(--ink)' : (s >= 0 ? mix(s,'var(--success)','var(--ink)') : mix(-s,'var(--danger)','var(--ink)'));
      ar.textContent = SG[i] === 0 ? '●' : '▲';
      ar.style.transform = `rotate(${(r.at(t)*180).toFixed(1)}deg) translateY(.5px)`; };
    tx.textContent = T[0];
    const go = k => { const t = now(); i = k; tx.textContent = T[k];
      if (REDUCE){ w.jump(width(k)); sv.jump(SG[k]); r.jump(SG[k] < 0 ? 1 : 0); }
      else { w.set(width(k)); sv.set(SG[k], S.base); r.set(SG[k] < 0 ? 1 : 0, S.base); }
      cap.textContent = k === T.length - 1 ? 'Settled · no drift' : `Step ${k + 1} of ${T.length} · tap the chip`; };
    b.onclick = () => { if (i === T.length - 1 && !lp.checked){ i = 0; go(0); return; } go((i + 1) % T.length); };
    const init = () => w.jump(width(0)); document.fonts.ready.then(init); init();
    return t => { b.style.width = px(w.at(t)); paint(t); };
  }});
