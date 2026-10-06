atom({ id:'placerate', cat:'Forms', name:'Place rating', block:'stars, review', fam:['M','S'],
  html:`<div class="card" style="width:min(380px,94%);padding:14px 16px;text-align:center"><p style="font-size:15px;font-weight:600;line-height:1.5;margin:0">Rate Ferry Building</p><div class="rt" role="slider" tabindex="0" aria-label="Stars" aria-valuemin="0" aria-valuemax="5" style="position:relative;display:inline-block;margin-top:8px;cursor:pointer"><div class="row" style="display:flex;gap:4px;color:var(--line)"></div><div class="over" style="position:absolute;inset:0;overflow:hidden"><div class="row" style="display:flex;gap:4px;color:var(--ink);width:max-content"></div></div></div><p style="font-size:13px;line-height:1.55;color:var(--muted);margin:8px 0 0"><span class="chip" style="display:inline-block;padding:4px 12px;border-radius:999px;background:var(--raised);font-size:12.5px;font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums"><span class="cd"></span> · <span class="tx">Tap a star</span></span></p><button class="btn sk" style="height:32px;border-radius:9px;margin-top:10px">Skip</button><div class="row small muted" style="display:flex;align-items:center;gap:8px;padding-top:10px;font-size:12.5px;color:var(--muted)"><span style="flex:1;text-align:left">Left-to-right fill, chip follows</span><button type="button" class="btn pg-tg" style="height:32px;border-radius:9px" aria-pressed="false">Anonymous</button></div></div><div class="hint">Tap stars, or Skip</div>`,
  desc:'Stars ink left-to-right on base. The chip morphs its width and the count rolls its digits. Skip swaps the hint and rests unrated as the terminal.',
  api:'fill.set(v,base)   chip.w.set(measure) + cd.digits.set(v)   skip: hint.to(1)',
  init(st){
    const star = '<svg style="flex:none" width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"/></svg>';
    $$(st,'.row')[0].innerHTML = star.repeat(5); $$(st,'.row')[1].innerHTML = star.repeat(5);
    const rt = $(st,'.rt'), over = $(st,'.over'), chip = $(st,'.chip'), tx = $(st,'.tx');
    const v = new Track(0), w = new Track(120), cd = new Digits($(st,'.cd'), 3); cd.set('0.0', true);
    const L = ['Tap a star','Thanks — rated'].map(s => { const x = document.createElement('span'); x.className = 'layer'; x.style.cssText = 'font-size:12.5px'; x.textContent = s; const h = document.createElement('span'); h.style.cssText = 'position:relative;display:inline-block;min-width:110px;height:18px'; h.appendChild(x); return x; });
    const hintBox = document.createElement('span'); hintBox.style.cssText = 'position:relative;display:inline-block;min-width:110px;height:18px;font-size:12.5px;color:var(--muted)'; L.forEach(x => hintBox.appendChild(x)); tx.replaceWith(hintBox);
    const sw = new Swap(0); let anon = false;
    const tg = $(st,'.pg-tg');
    tg.onclick = () => { anon = !anon; tg.textContent = anon ? 'Named' : 'Anonymous'; tg.setAttribute('aria-pressed', anon); };
    const set = x => { REDUCE ? (v.jump(x), cd.set(x.toFixed(1), true), w.jump(90 + x*14)) : (v.set(x, S.base), cd.set(x.toFixed(1)), w.set(90 + x*14)); if (x > 0) sw.to(1); rt.setAttribute('aria-valuenow', x); };
    rt.onclick = e => { const r = rt.getBoundingClientRect(); set(Math.max(.5, Math.min(5, Math.round((e.clientX - r.left)/r.width*5*2)/2))); };
    rt.onkeydown = e => { if (e.key === 'ArrowRight') set(Math.min(5, v.target + .5)); if (e.key === 'ArrowLeft') set(Math.max(0, v.target - .5)); };
    $(st,'.sk').onclick = () => { set(0); sw.to(0); };
    return t => { over.style.width = (clamp(v.at(t)/5)*100).toFixed(1) + '%'; chip.style.minWidth = px(w.at(t)); cd.render(t); L.forEach((x,k) => sw.apply(x,k,t)); };
  }});
