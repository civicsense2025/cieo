atom({ id:'auditintake', cat:'SEO', name:'Site-audit intake', block:'seo audit, onboarding', fam:['S','M'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">Free site audit</b><div style="height:6px;border-radius:3px;background:var(--raised);overflow:hidden"><div class="pg" style="height:100%;width:0;border-radius:3px;background:var(--accent)"></div></div><div class="pn card" style="position:relative;overflow:hidden;padding:16px;min-height:150px"></div><div class="row small muted" style="gap:6px;font-size:12.5px"><span>Step <b class="stp num" style="font-variant-numeric:tabular-nums">1</b> of 3</span><span aria-hidden="true">·</span><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="em" checked> email my report</label></div></div>`,
  desc:'One question per panel: the old panel slides out with blur before the next slides in, and the progress bar fills on the same spring. A valid URL earns the success check; the final panel holds the queued terminal state.',
  api:'panel.swap.to(i) pg.set(i/3) url.ok?{ring.success} end: queued.set(1)',
  init(st){
    const pn = $(st,'.pn'), pg = $(st,'.pg'), stp = $(st,'.stp');
    const H = ['What site should we audit?', 'How many pages?', 'Where should we send it?'];
    const sw = new Swap(0), bar = new Track(0); let i = 0;
    const url = { v:'', ok:false }, pages = { v:'100' }, okT = new Track(0);
    const layers = H.map((h,li) => { const d = document.createElement('div'); d.className = 'layer';
      Object.assign(d.style,{flexDirection:'column',alignItems:'stretch',justifyContent:'flex-start',gap:'8px',padding:'0',whiteSpace:'normal'});
      if (li === 0) d.innerHTML = '<b style="font-size:14px;line-height:1.45">' + h + '</b><div class="row" style="gap:8px"><input class="url" value="example.site" aria-label="Site URL" style="flex:1;min-width:0;border:1.5px solid var(--line);border-radius:9px;padding:8px 10px;font:14px/1.45 var(--sans);background:var(--bg);color:var(--ink);outline:none"><span class="ck" style="width:22px;height:22px;padding:0;display:grid;place-items:center;border-radius:50%;background:var(--success);color:#fff;font-size:13px;transform:translateY(1px)">✓</span></div><span class="msg small" style="font-size:12.5px;min-height:18px;line-height:1.5"></span><button class="btn nx ink" style="align-self:flex-end;min-height:32px">Continue</button>';
      if (li === 1) d.innerHTML = '<b style="font-size:14px;line-height:1.45">' + h + '</b><div class="row" style="gap:8px"><button class="btn pp" style="min-height:32px">100</button><button class="btn pp" style="min-height:32px">1k</button><button class="btn pp" style="min-height:32px">10k</button></div><span class="small muted" style="font-size:12.5px;line-height:1.5">Bigger crawls take longer. 100 pages is instant.</span><div class="row" style="justify-content:space-between"><button class="btn bk" style="min-height:32px">Back</button><button class="btn nx ink" style="min-height:32px">Continue</button></div>';
      if (li === 2) d.innerHTML = '<b style="font-size:14px;line-height:1.45">' + h + '</b><input class="ml" value="you@example.com" aria-label="Email" style="border:1.5px solid var(--line);border-radius:9px;padding:8px 10px;font:14px/1.45 var(--sans);background:var(--bg);color:var(--ink);outline:none"><div class="row" style="justify-content:space-between"><button class="btn bk" style="min-height:32px">Back</button><button class="btn nx ink" style="min-height:32px">Queue audit ✓</button></div>';
      pn.appendChild(d); return d; });
    const go = k => { i = clamp(k, 0, 2); stp.textContent = i + 1;
      if (REDUCE){ sw.cur = i; sw.prev = null; sw.t = -9; bar.jump((i+1)/3); } else { sw.to(i); bar.set((i+1)/3); } };
    const u = $(layers[0],'.url'), ck = $(layers[0],'.ck'), msg = $(layers[0],'.msg');
    const valid = v => /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(v.trim());
    const check = () => { url.ok = valid(u.value); u.style.borderColor = !u.value ? 'var(--line)' : url.ok ? 'var(--success)' : 'var(--danger)';
      msg.textContent = !u.value ? '' : url.ok ? 'Looks crawlable.' : 'Enter a domain like example.site.';
      msg.style.color = url.ok ? 'var(--success)' : 'var(--danger)';
      if (REDUCE) okT.jump(url.ok ? 1 : 0); else okT.set(url.ok ? 1 : 0); };
    u.oninput = check; check();
    $(layers[0],'.nx').onclick = () => { check(); if (url.ok) go(1); else u.focus(); };
    $$(layers[1],'.pp').forEach(b => b.onclick = () => { pages.v = b.textContent; $$(layers[1],'.pp').forEach(x => x.classList.toggle('ink', x === b)); });
    $(layers[1],'.pp').classList.add('ink');
    $(layers[1],'.bk').onclick = () => go(0); $(layers[1],'.nx').onclick = () => go(2);
    $(layers[2],'.bk').onclick = () => go(1);
    $(layers[2],'.nx').onclick = () => { layers[2].innerHTML = '<div class="col" style="align-items:center;gap:6px;text-align:center"><span style="width:28px;height:28px;padding:0;display:grid;place-items:center;border-radius:50%;background:var(--success);color:#fff;transform:translateY(1px)">✓</span><b style="font-size:14px">Audit queued</b><span class="small muted" style="font-size:12.5px;line-height:1.5">Crawling ' + pages.v + ' pages of ' + (u.value || 'your site') + '. Report lands in ~2 min.</span></div>'; };
    go(0);
    return t => { layers.forEach((el,k) => sw.apply(el,k,t)); pn.style.height = 'auto';
      pg.style.width = (clamp(bar.at(t))*100).toFixed(2) + '%';
      ck.style.opacity = clamp(okT.at(t)).toFixed(3); ck.style.transform = 'scale(' + (.6+.4*clamp(okT.at(t))).toFixed(3) + ') translateY(1px)'; };
  }});
