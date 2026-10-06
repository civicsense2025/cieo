

atom({ id:'figbuilder', cat:'Writing', name:'Figure builder', block:'figure list, doc', fam:['M','S','T'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="margin:0 auto;width:min(340px,90%);gap:8px;padding:12px"><div class="row" style="justify-content:space-between;align-items:center"><div class="row small" style="gap:8px;align-items:center"><b>Pages</b><span class="d" style="font-weight:700"></span></div><button class="btn add">Add figure</button></div><div class="list card" style="position:relative;overflow:hidden;min-height:44px;padding:4px"></div></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Number figures</span></label><div class="hint">Figures rank into slots</div>`,
  desc:'Adding a figure drops its caption in and springs every caption to its ranked slot. The page count rolls up with the list.',
  api:'cap.y.set(slot,S.base)   pages.set(n)   add: push + rank   REDUCE: jump',
  init(st){
    const list = $(st,'.list'), d = new Digits($(st,'.d'), 2); const H = 40; let figs = [], n = 0; d.set(0, true);
    const rank = () => { const t0 = now(); figs.forEach((f,i) => { if (REDUCE) f.y.jump(i*H); else f.y.set(i*H, S.base, t0); }); list.style.height = px(figs.length*H + 8); };
    const add = () => { n++; d.set(n, REDUCE); const el = document.createElement('div'); el.style.cssText = 'position:absolute;left:4px;right:4px;top:4px;height:32px;display:flex;align-items:center;gap:8px;padding:0 10px;font-size:13px;background:var(--raised);border-radius:8px'; el.innerHTML = '<b>Fig ' + n + '</b><span class="muted">caption · p.' + n + '</span>'; list.appendChild(el);
      const f = { d:el, y:new Track(figs.length*H) }; f.y.jump((figs.length - .6)*H); figs.push(f); rank(); if (figs.length > 5) { const old = figs.shift(); old.d.remove(); rank(); } };
    $(st,'.add').onclick = add; add(); add();
    return t => { figs.forEach(f => { f.d.style.transform = `translateY(${f.y.at(t).toFixed(2)}px)`; }); d.render(t); };
  }});
