
atom({ id:'branchfold', cat:'Email', name:'Branch fold', block:'email, thread, quotes', fam:['M','S'],
  html:`<div class="col" style="gap:8px;width:min(300px,92%)"><div class="card" style="padding:14px 16px;line-height:1.5"><div class="row" style="gap:10px"><span style="width:34px;height:34px;flex:none;border-radius:50%;background:var(--raised);display:grid;place-items:center;font-size:12px;font-weight:600;padding:0;transform:translateY(.5px)">JK</span><b style="font-size:15px;font-weight:600">Re: Budget v2</b></div><div style="font-size:13.5px;margin-top:6px">Agreed — shipping the v2 scope.</div><button class="btn qbtn" style="min-height:32px;margin-top:8px"><span class="chev" style="padding:0;display:inline-grid;place-items:center;transform:translateY(.5px)">▾</span> <span class="qlab" style="position:relative"></span></button><div class="qq" style="overflow:hidden"></div></div><label class="row small muted" style="gap:6px;font-size:12px;cursor:pointer"><input type="checkbox"> fold signatures too</label></div><div class="hint">Fold the quoted ancestry</div>`,
  desc:'Quoted ancestry collapses into an indented tree. Connectors draw on lazy while the chevron turns on base, and the count swaps between show and hide.',
  api:'fold.set(0/1, base); conn lazy stagger .03   chev rotate 90deg   end: folded, hold',
  init(st){
    const box = $(st,'.qq'), chev = $(st,'.chev'), qbtn = $(st,'.qbtn');
    const qlab = $(st,'.qlab');
    ['Maya · Tue', 'Jon · Mon', 'Pri · Fri'].forEach((s, i) => {
      const r = document.createElement('div');
      r.style.cssText = `display:flex;gap:8px;align-items:center;min-height:52px;margin-left:${12*(i+1)}px;padding-left:10px;border-left:2px solid var(--line)` + (i ? ';border-top:1px solid var(--line-soft)' : ';margin-top:8px');
      const av = document.createElement('span');
      av.style.cssText = 'width:32px;height:32px;flex:none;border-radius:50%;background:var(--raised);display:grid;place-items:center;font-size:11.5px;font-weight:600;padding:0;transform:translateY(.5px)';
      av.textContent = s[0] + s[3];
      const tx = document.createElement('span'); tx.style.fontSize = '13px'; tx.style.lineHeight = '1.5'; tx.textContent = s;
      r.appendChild(av); r.appendChild(tx); box.appendChild(r);
    });
    const ql = ['Hide 3 quoted', 'Show 3 quoted'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.style.position = 'relative'; e.style.inset = 'auto'; e.style.fontSize = '13px'; e.textContent = s; qlab.appendChild(e); return e; });
    const fold = new Track(1), sw = new Swap(0), cn = [0,1,2].map(() => new Track(1, S.lazy));
    let full = 0; requestAnimationFrame(() => { full = box.scrollHeight; });
    let open = true;
    qbtn.onclick = () => { open = !open; const t = now(); if (!full) full = box.scrollHeight;
      fold.set(open ? 1 : 0, S.base, t); sw.to(open ? 0 : 1, t); cn.forEach((c, i) => c.set(open ? 1 : 0, S.lazy, t + i*.03)); };
    return t => { const p = clamp(fold.at(t));
      if (full) box.style.height = px(p*full); box.style.opacity = (.45 + .55*p).toFixed(3);
      box.style.visibility = p < .02 ? 'hidden' : 'visible';
      chev.style.transform = `translateY(.5px) rotate(${((1-p)*-90).toFixed(1)}deg)`;
      [...box.children].forEach((r, i) => { r.style.borderLeftColor = i ? 'var(--line)' : 'var(--line)'; r.style.opacity = clamp(cn[i].at(t)).toFixed(3); });
      ql.forEach((e, k) => sw.apply(e, k, t)); };
  }});
