
atom({ id:'templatevars', cat:'Email', name:'Template variables', block:'email, template, variables', fam:['S','M'],
  html:`<div class="col" style="gap:8px;width:min(320px,94%)"><div class="card" style="padding:14px 16px;line-height:1.5"><div class="row" style="gap:8px;align-items:center"><span class="pillw" style="font-size:12px;font-weight:600;border-radius:999px;padding:4px 10px;background:var(--raised)">Follow-up v2</span><button class="btn ink ins" style="min-height:32px">Insert snippet</button></div><div class="prev" style="font-size:13.5px;margin-top:8px">Hi <span class="v0 vv"></span>, your <span class="v1 vv"></span> trial ends <span class="v2 vv"></span>.</div><div class="row" style="gap:6px;margin-top:8px"><input class="f0" placeholder="first" aria-label="First name" style="flex:1;min-width:0;min-height:32px;border:1.5px solid var(--muted);border-radius:8px;padding:6px 8px;font-size:13px;background:var(--card);color:var(--ink)"><input class="f1" placeholder="plan" aria-label="Plan" style="flex:1;min-width:0;min-height:32px;border:1.5px solid var(--muted);border-radius:8px;padding:6px 8px;font-size:13px;background:var(--card);color:var(--ink)"></div></div><label class="row small muted" style="gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" checked> keep placeholders</label></div><div class="hint">Insert, then fill the blanks</div>`,
  desc:'The snippet pill inks on base while values swap into fixed-width slots, so nothing jumps. The missing date pulses a warning until it is filled.',
  api:'ink.set(1, base)   vals swap fixed 8ch   warn pulse -> resolve   end: filled, hold',
  init(st){
    const pill = $(st,'.pillw'), btn = $(st,'.ins');
    const slots = [$(st,'.v0'), $(st,'.v1'), $(st,'.v2')];
    const vals = [['{{first}}', 'Maya'], ['{{plan}}', 'Pro'], ['{{date}}', 'Friday']];
    slots.forEach(s => { s.style.cssText = 'display:inline-block;min-width:8ch;text-align:center;border-bottom:1px dashed var(--line);font-weight:600;position:relative;'; });
    const sws = slots.map(s => { const sw = new Swap(0);
      const lays = vals[0].map(v => { const e = document.createElement('span'); e.className = 'layer'; e.style.position = 'relative'; e.style.inset = 'auto'; e.style.display = 'inline'; e.textContent = v; s.appendChild(e); return e; });
      return { sw, lays }; });
    slots.forEach((s, i) => { sws[i].lays.forEach((e, k) => { e.textContent = (k ? vals[i][1] : vals[i][0]); if (!k) e.style.color = 'var(--faint)'; }); });
    const ink = new Track(0), warn = new Track(0);
    let on = false;
    const fill = i => { const v = ($(st,'.f' + i).value || '').trim(); if (v){ vals[i][1] = v; sws[i].sw.to(1);
        if (i === 2){ const t = now(); warn.set(0, S.base, t); slots[2].style.borderBottomColor = 'var(--line)'; } } };
    $(st,'.f0').addEventListener('input', () => fill(0));
    $(st,'.f1').addEventListener('input', () => fill(1));
    btn.onclick = () => { if (on) return; on = true; const t = now();
      ink.set(1, S.base, t); sws[0].sw.to(1, t); sws[1].sw.to(1, t + .06);
      warn.set(1, S.base, t + .2); warn.set(0, S.base, t + .55);
      slots[2].style.borderBottomColor = 'var(--warning)'; slots[2].style.color = 'var(--warning)'; };
    const miss = document.createElement('div'); miss.style.cssText = 'font-size:12px;color:var(--warning);margin-top:6px;position:relative;min-height:18px';
    const ml0 = document.createElement('span'); ml0.className = 'layer'; ml0.style.justifyContent = 'flex-start';
    const ml1 = document.createElement('span'); ml1.className = 'layer'; ml1.style.justifyContent = 'flex-start'; ml1.textContent = 'Add the end date below — or type it:';
    miss.appendChild(ml0); miss.appendChild(ml1); $(st,'.card').appendChild(miss);
    const mi = document.createElement('input'); mi.placeholder = 'e.g. Friday'; mi.setAttribute('aria-label', 'End date');
    mi.style.cssText = 'width:100%;min-height:32px;border:1.5px solid var(--muted);border-radius:8px;padding:6px 8px;font-size:13px;margin-top:4px;background:var(--card);color:var(--ink)';
    miss.appendChild(mi); const msw = new Swap(0);
    mi.addEventListener('input', () => { const v = mi.value.trim(); if (v){ vals[2][1] = v; sws[2].sw.to(1, now()); msw.to(0, now());
        slots[2].style.borderBottomColor = 'var(--line)'; slots[2].style.color = 'var(--ink)'; } });
    return t => { const p = clamp(ink.at(t)), w = clamp(warn.at(t));
      pill.style.background = mix(p, 'var(--ink)', 'var(--raised)'); pill.style.color = mix(p, 'var(--card)', 'var(--ink)');
      slots[2].style.background = w > .02 ? `color-mix(in oklab, var(--warning-tint) ${(w*100).toFixed(0)}%, transparent)` : 'none';
      slots[2].style.borderRadius = '6px';
      sws.forEach(o => o.lays.forEach((e, k) => o.sw.apply(e, k, t)));
      msw.to(on && sws[2].sw.cur === 0 ? 1 : 0);
      msw.apply(ml0, 0, t); msw.apply(ml1, 1, t); };
  }});
