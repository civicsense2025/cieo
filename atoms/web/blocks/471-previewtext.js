

atom({ id:'previewtext', cat:'Newsletter', name:'Preview-text editor', block:'newsletter, editor', fam:['M','S'],
  html:`<div class="card col" style="width:min(380px,92%);padding:16px;gap:8px;line-height:1.55"><b style="font-size:15px;font-weight:600;line-height:1.5">Preview text</b><span class="muted" style="font-size:12.5px;line-height:1.5">Kept inside what clients show.</span><div class="seg vw" style="display:flex;position:relative;align-self:flex-start"><div class="ind" style="position:absolute;left:0;top:0"></div><button style="min-height:36px;border-radius:9px">Phone</button><button style="min-height:36px;border-radius:9px">Desktop</button></div><input class="ed" type="text" value="Rivers, routes and five slow mornings inside" aria-label="Preview text" style="height:44px;border:1px solid var(--line);border-radius:10px;padding:0 12px;font-size:14px;line-height:1.5;background:var(--bg);color:var(--ink);outline:none"><div class="lb" style="height:6px;border-radius:99px;background:var(--raised);overflow:hidden"><i style="display:block;height:100%;border-radius:99px"></i></div><div class="pv" style="position:relative;border:1px solid var(--line-soft);border-radius:10px;padding:12px 14px;font-size:13.5px;line-height:1.55;min-height:44px"></div><div class="row" style="justify-content:space-between"><span class="ct num muted" style="font-size:12px;font-variant-numeric:tabular-nums"></span><span class="cut muted" style="font-size:12px">cut at 78</span></div><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;font-size:12.5px"><input type="checkbox" class="cl" checked> show cut marker</label></div>`,
  desc:'Typing past the client cut truncates the preview where phones and desktops stop. The length bar snaps between success, warning and danger. Switching device swaps the frame.',
  api:'len.set(n, S.snap) · color = ok/warn/danger · view.to(phone|desktop)',
  init(st){
    const ed = $(st,'.ed'), fill = $(st,'.lb i'), pv = $(st,'.pv'), ct = $(st,'.ct'), cut = $(st,'.cut'), cl = $(st,'.cl');
    const seg = $(st,'.vw'), ind = $(seg,'.ind'), btns = $$(seg,'button'), e = edges(0,0);
    const lim = () => k ? 140 : 78; let k = 0;
    const P = ['',''].map(() => { const x = document.createElement('div'); x.className = 'layer'; x.style.justifyContent = 'flex-start'; pv.appendChild(x); return x; });
    const vsw = new Swap(0), len = new Track(ed.value.length, S.snap);
    const sel = (i, inst) => { k = i; const b = btns[i]; inst ? e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); vsw.to(i); sync(); };
    btns.forEach((b,i) => b.onclick = () => sel(i));
    const sync = () => { const L = lim(), n = ed.value.length, over = n > L, warn = !over && n > L*.8;
      len.set(n, S.snap); ct.textContent = n + ' / ' + L; cut.textContent = 'cut at ' + L;
      const col = over ? 'var(--danger)' : warn ? 'var(--warning, var(--accent))' : 'var(--success)';
      fill.style.background = col; pv.style.borderColor = over ? 'var(--danger)' : 'var(--line-soft)';
      const vis = ed.value.slice(0, L), hid = ed.value.slice(L);
      P[0].innerHTML = ''; P[1].innerHTML = '';
      P.forEach(el => { el.innerHTML = ''; const a = document.createElement('span'); a.textContent = vis;
        el.appendChild(a); if (hid && cl.checked){ const c = document.createElement('span'); c.textContent = ' ▍' + hid; c.style.opacity = '.35'; el.appendChild(c); } });
      pv.style.maxWidth = k ? '100%' : '240px'; };
    ed.oninput = sync;
    const init = () => sel(0, true); document.fonts.ready.then(init); requestAnimationFrame(init); sync();
    return t => { const a = e.A.at(t), b = e.B.at(t);
      Object.assign(ind.style,{transform:`translate(${px(a)},3px)`,width:px(b-a),height:'calc(100% - 6px)',background:'var(--raised)',borderRadius:'7px'});
      P.forEach((x,j) => vsw.apply(x,j,t)); fill.style.width = clamp(len.at(t)/lim())*100 + '%'; };
  }});
