
atom({ id:'attachstrip', cat:'Email', name:'Attachment strip', block:'email, attachments, strip', fam:['M','S','T'],
  html:`<div class="col" style="gap:8px;width:min(300px,92%)"><div class="card" style="padding:14px 16px;line-height:1.5"><b style="font-size:15px;font-weight:600">Launch assets</b><div class="small muted" style="font-size:12px">4 files · tap to preview</div><div class="pv" style="margin-top:8px;min-height:52px;display:flex;align-items:center;gap:10px;background:var(--raised);overflow:hidden"><span class="pic" style="width:36px;height:36px;flex:none;display:grid;place-items:center;font-size:12px;font-weight:600;background:var(--card);padding:0;transform:translateY(.5px)">PDF</span><span class="pn" style="position:relative;flex:1;min-height:20px"></span></div><div class="rail" style="display:flex;gap:8px;margin-top:8px;align-items:center"></div></div><label class="row small muted" style="gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" checked> compress images</label></div><div class="hint">Tap a thumb to preview</div>`,
  desc:'Rail thumbs fan in with a 30ms stagger on base. Tapping one grows the preview radius on a spring, and the overflow count rolls as the set drains.',
  api:'thumbs enter stagger .03 base   rad.set(10+i*4, base)   ov.set(n)   end: previewing, hold',
  init(st){
    const rail = $(st,'.rail'), pv = $(st,'.pv'), pn = $(st,'.pn'), pic = $(st,'.pic');
    const files = [['Deck', 'PDF', 'var(--accent-tint)'], ['Shot 1', 'JPG', 'var(--warning-tint)'], ['Shot 2', 'JPG', 'var(--success-tint)'], ['Board', 'PDF', 'var(--danger-tint)']];
    const th = files.map((f, i) => { const b = document.createElement('button');
      b.style.cssText = `width:44px;height:44px;flex:none;border-radius:10px;border:1.5px solid var(--muted);background:${f[2]};font-size:11px;font-weight:600;cursor:pointer;padding:0;display:grid;place-items:center;min-height:44px`;
      b.textContent = f[1]; b.setAttribute('aria-label', 'Preview ' + f[0]); rail.appendChild(b); return b; });
    const ov = document.createElement('button');
    ov.style.cssText = 'height:44px;min-width:44px;flex:none;border-radius:10px;border:1px dashed var(--line);background:none;font-size:12px;cursor:pointer;padding:0 6px';
    rail.appendChild(ov);
    const names = files.map(f => f[0] + ' · ' + f[1]).map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.style.fontSize = '13px'; e.textContent = s; pn.appendChild(e); return e; });
    const en = th.map(() => new Track(0)), sw = new Swap(0), rad = new Track(10), ovd = new Digits(ov, 1);
    let left = 2; ovd.set('2', true); sw.to(0, now());
    const t0 = now() + .2; th.forEach((b, i) => en[i].set(1, S.base, t0 + i*.03));
    const sel = i => { const t = now(); sw.to(i, t); rad.set(10 + i*4, S.base, t); pic.textContent = files[i][1]; };
    th.forEach((b, i) => b.onclick = () => sel(i));
    sel(0);
    ov.onclick = () => { if (!left) return; left--; ovd.set(String(left)); if (!left) ov.style.visibility = 'hidden'; };
    return t => { th.forEach((b, i) => { const p = clamp(en[i].at(t)); b.style.opacity = (.45 + .55*p).toFixed(3); b.style.transform = `translateY(${((1-p)*10).toFixed(2)}px)`; });
      pv.style.borderRadius = px(rad.at(t)); pic.style.borderRadius = px(Math.max(4, rad.at(t) - 6));
      names.forEach((e, k) => sw.apply(e, k, t)); ovd.render(t); };
  }});
