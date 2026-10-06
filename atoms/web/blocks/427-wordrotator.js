atom({ id:'wordrotator', cat:'Landing', name:'Hero word rotator', block:'Landing hero', fam:['S','M','T'],
  html:`<div class="col" style="gap:0;align-items:center;max-width:420px;margin:0 auto;padding:44px 16px;text-align:center"><h3 style="margin:0;font-size:30px;font-weight:600;letter-spacing:-.035em;line-height:1.2">Pages that <span class="pill" style="display:inline-block;background:var(--raised);border-radius:10px;padding:0 10px;overflow:hidden;vertical-align:bottom;cursor:pointer"><span class="slot" style="position:relative;display:inline-block;height:1.2em"></span></span></h3><p class="small muted" style="margin:12px 0 0;font-size:15px;line-height:1.5">Drag blocks, edit text and publish in one click.</p><div class="row" style="gap:8px;margin-top:16px"><button class="btn ink go" style="min-height:36px;border-radius:10px">Start free</button><button class="btn ghost" style="min-height:36px;border-radius:10px">See a demo</button></div><label class="row small muted" style="gap:6px;margin-top:16px;cursor:pointer;font-size:12.5px;line-height:1.5"><input type="checkbox" class="lp" checked> loop keywords</label></div><div class="hint">Keyword swaps every 2.8s · pill width springs to fit</div>`,
  desc:'The keyword slot cycles every 2.8s: the old word blurs up and out, the next rises in, and the pill width springs to fit. With loop off the last word holds as the terminal state.',
  api:'swap.to(next)   w.set(measure(next))   end: hold',
  init(st){
    const W = ['convert','delight','rank','sell'];
    const slot = $(st,'.slot'), pill = $(st,'.pill'), lp = $(st,'.lp');
    const L = W.map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.cssText = 'position:absolute;left:0;top:0;white-space:nowrap'; e.textContent = s; slot.appendChild(e); return e; });
    const sw = new Swap(0), w = new Track(0);
    let i = 0, last = -9, live = false;
    const fit = k => { const m = document.createElement('span'); m.textContent = W[k]; m.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:600 30px var(--sans)'; st.appendChild(m); const x = m.offsetWidth; m.remove(); return x; };
    const go = n => { i = n; sw.to(i); w.set(fit(i)); last = now(); };
    pill.onclick = () => { const nx = lp.checked ? (i+1)%W.length : i+1; if (nx < W.length) go(nx); };
    const init = () => w.jump(fit(0)); document.fonts.ready.then(init); init();
    return t => {
      if (!live){ live = true; last = t; }
      if (!REDUCE){ const nx = lp.checked ? (i+1)%W.length : i+1; if (nx < W.length && t - last > 2.8) go(nx); }
      slot.style.width = px(Math.max(1, w.at(t)));
      L.forEach((e,k) => sw.apply(e,k,t,4));
    };
  }});
