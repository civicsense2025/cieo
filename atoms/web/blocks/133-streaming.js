

/* ---------- Jobs: AI chat, scheduling, calls, guidance, maps ---------- */
atom({ id:'streaming', cat:'AI chat', name:'Streaming answer', block:'richtext, chat', fam:['S','T'], tall:true,
  html:`<div class="col" style="width:min(360px,92%);gap:10px"><div class="row" style="gap:6px"><input id="ai-q" value="How should I price a yearly plan?" aria-label="Question" style="flex:1;min-width:0;border:1.5px solid var(--muted);border-radius:9px;padding:8px 10px;background:var(--card);color:var(--ink);font:14px var(--sans)"><button class="btn ink go" aria-label="Start or stop answer" style="position:relative;width:64px;height:36px;padding:0"></button></div><div class="card ans small" style="padding:12px 14px;line-height:1.65;min-height:150px"></div><div class="fa" style="position:relative;min-height:30px"></div><label class="row small muted" style="gap:6px;justify-content:center;cursor:pointer"><input type="checkbox" class="fu" checked> Follow-up actions</label></div>`,
  desc:'Words arrive on a schedule and each one fades up out of a slight blur, so the text feels written rather than printed. A soft caret rides the last word. Stop freezes the answer where it is. On settle, follow-up actions swap in.',
  api:'word[i] visible at t0 + i·0.045   o = prog(t, tᵢ, S.snap)   stop: t0 frozen',
  init(st){
    const go = $(st,'.go'), ans = $(st,'.ans'), fa = $(st,'.fa'), fu = $(st,'.fu'), TXT = 'Start from your monthly price and offer two months free, about 17% off. Show the yearly total and the monthly equivalent side by side. Default the toggle to yearly only if most readers already pay monthly for over three months. Keep the saving visible on the button itself.';
    const L = ['Ask','Stop'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; go.appendChild(e); return e; });
    let ws = [], t0 = 0, stopAt = 0, running = false; const sw = new Swap(0), fsw = new Swap('hide'), caret = document.createElement('i'); caret.style.cssText = 'display:inline-block;width:7px;height:14px;margin-left:2px;vertical-align:-2px;border-radius:2px;background:var(--ink)';
    const show = document.createElement('div'); show.className = 'layer'; show.style.cssText = 'display:flex;gap:6px';
    const cp = document.createElement('button'); cp.className = 'btn'; cp.textContent = 'Copy'; cp.style.padding = '4px 12px';
    const rt = document.createElement('button'); rt.className = 'btn'; rt.textContent = 'Retry'; rt.style.padding = '4px 12px';
    show.append(cp, rt); fa.appendChild(show);
    const hide = document.createElement('span'); hide.className = 'layer'; fa.appendChild(hide);
    const settle = () => { if (fu.checked) fsw.to('show'); };
    cp.onclick = () => { try { if (navigator.clipboard) navigator.clipboard.writeText(TXT); } catch(e){} cp.textContent = 'Copied'; setTimeout(() => cp.textContent = 'Copy', 1200); };
    rt.onclick = () => start();
    const start = () => { ans.innerHTML = ''; ws = TXT.split(' ').map(w => { const s = document.createElement('span'); s.textContent = w + ' '; s.style.opacity = 0; ans.appendChild(s); return s; }); ans.appendChild(caret); t0 = now(); stopAt = 0; running = true; sw.to(1); fsw.to('hide'); cp.textContent = 'Copy'; };
    go.onclick = () => { if (running){ running = false; stopAt = now(); sw.to(0); settle(); } else start(); };
    fu.onchange = () => { if (!fu.checked) fsw.to('hide'); else if (!running && ws.length) settle(); };
    return t => { const tt = stopAt || t; ws.forEach((w,i) => { const ti = t0 + i*.045; if (tt < ti){ w.style.opacity = 0; return; } const p = clamp(prog(t, ti, S.snap)); w.style.opacity = p.toFixed(3); w.style.filter = p < .98 ? `blur(${((1 - p)*3).toFixed(2)}px)` : 'none'; });
      const shown = ws.filter((w,i) => tt >= t0 + i*.045).length; if (running && shown >= ws.length){ running = false; sw.to(0); settle(); }
      caret.style.opacity = running ? (.55 + .35*Math.cos(t*6)).toFixed(3) : Math.max(0, parseFloat(caret.style.opacity || 0) - .08).toFixed(3); L.forEach((e,k) => sw.apply(e,k,t)); fsw.apply(show, 'show', t); fsw.apply(hide, 'hide', t); };
  }});