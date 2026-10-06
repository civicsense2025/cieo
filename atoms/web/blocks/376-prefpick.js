

atom({ id:'prefpick', cat:'Forms', name:'Preference picker', block:'preferences, interests', fam:['M','S'],
  html:`<div class="col" style="gap:8px;align-items:center;width:100%"><div class="bc card" style="width:min(330px,94%);padding:14px 16px"><b style="font-size:15px;font-weight:600;line-height:1.5">Morning digest</b><div class="small muted" style="line-height:1.5">Pick topics — the preview follows along.</div><div class="chips" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px"></div><div class="row" style="justify-content:space-between;margin-top:10px"><span class="num" style="font-size:12px;color:var(--muted);line-height:1.5"><span class="dn"></span> of 5 picked</span></div><div class="pv card" style="position:relative;min-height:96px;margin-top:8px;padding:12px 14px;background:var(--bg);box-shadow:none;border:1px solid var(--line-soft)"></div></div><div class="tw row small muted" style="gap:6px"><span style="font-size:12px">Preset:</span></div></div><div class="hint">Chips fill as you tap · the preview swaps live</div>`,
  desc:'Chips fill-toggle on a calm base spring while the picked count rolls. The digest preview swaps live between empty, light and full — full holds as the success terminal.',
  api:'chip.f.set(on, base)   count.set(n)   preview.to(band(n)) · REDUCE: jump',
  init(st){
    const box = $(st,'.chips'), pv = $(st,'.pv'), tw = $(st,'.tw');
    const TOPICS = ['Markets','Design','Climate','Courts','Culture'];
    const dg = new Digits($(st,'.dn'), 1), sw = new Swap(0);
    const chips = TOPICS.map(n => { const b = document.createElement('button'); b.textContent = n; b.setAttribute('aria-pressed','false');
      b.style.cssText = 'border:1.5px solid var(--line);background:var(--card);border-radius:999px;padding:6px 14px;min-height:32px;font-size:13px;font-weight:500;cursor:pointer;line-height:1.5';
      const c = { b, on:0, f:new Track(0) };
      b.onclick = () => { c.on = c.on ? 0 : 1; b.setAttribute('aria-pressed', !!c.on); REDUCE ? c.f.jump(c.on) : c.f.set(c.on); sync(); };
      box.appendChild(b); return c; });
    const band = n => n === 0 ? 0 : (n < 3 ? 1 : 2);
    const PV = [
      `<b style="font-size:13px;line-height:1.5">Nothing yet</b><div class="small muted" style="line-height:1.5">Tap a topic to preview your digest.</div>`,
      `<b style="font-size:13px;line-height:1.5">Light digest</b><div class="small muted pv-sub" style="line-height:1.5"></div>`,
      `<b style="font-size:13px;color:var(--success);line-height:1.5">Full digest ✓</b><div class="small muted pv-sub" style="line-height:1.5"></div>`];
    const L = PV.map(html => { const e = document.createElement('div'); e.className = 'layer'; e.style.cssText += 'flex-direction:column;align-items:flex-start;justify-content:center;white-space:normal;gap:2px;text-align:left'; e.innerHTML = html; pv.appendChild(e); return e; });
    const sync = () => { const on = chips.filter(c => c.on).map(c => c.b.textContent), n = on.length;
      dg.set(String(n), REDUCE);
      L[1].querySelector('.pv-sub').textContent = `${on.join(' · ')} — one short read.`;
      L[2].querySelector('.pv-sub').textContent = `${on.join(' · ')} — the full five-minute mix.`;
      const v = band(n); if (REDUCE){ sw.cur = v; sw.prev = null; sw.t = -9; } else sw.to(v); };
    [['None',0],['All',1]].forEach(([label,v]) => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText += 'min-height:32px;padding:6px 10px;font-size:12px'; b.textContent = label;
      b.onclick = () => chips.forEach(c => { c.on = v; c.b.setAttribute('aria-pressed', !!v); REDUCE ? c.f.jump(v) : c.f.set(v); sync(); }); tw.appendChild(b); });
    dg.set('0', true);
    return t => { chips.forEach(c => { const f = clamp(c.f.at(t)); c.b.style.background = mix(f,'var(--ink)','var(--card)'); c.b.style.color = mix(f,'var(--card)','var(--ink)'); c.b.style.borderColor = mix(f,'var(--ink)','var(--line)'); c.b.style.transform = `scale(${(1 + .05*f).toFixed(3)})`; });
      dg.render(t); L.forEach((el,k) => sw.apply(el,k,t)); };
  }});
