

atom({ id:'fieldset', cat:'Layout', name:'Fieldset grouping', block:'form, settings, filter-panel', fam:['D','M'],
  html:`<div class="col" style="gap:12px;align-items:center"><div style="max-width:420px;text-align:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Fieldset grouping</b><p class="muted" style="font-size:13px;line-height:1.5;margin:6px 0 0">The group height springs open with a turning chevron. An invalid group snaps its ring on.</p></div><div class="row small muted" style="gap:8px;align-items:center"><span class="fs" style="position:relative;display:inline-block;min-width:150px;min-height:20px"></span></div><div class="fg card" style="width:min(340px,92%);padding:14px 16px"><button class="fh row" style="width:100%;gap:10px;align-items:center;background:none;border:0;cursor:pointer;padding:0;min-height:32px" aria-expanded="true"><span style="display:grid;place-items:center;width:24px;height:24px;padding:0;flex:none;border-radius:8px;background:var(--line)"><svg class="ch" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="transform:translateY(0.5px)"><path d="M3 4.5 6 7.5 9 4.5"/></svg></span><b style="font-size:15px;font-weight:600;flex:1;text-align:left;line-height:1.45">Notifications</b></button><div class="fb" style="overflow:hidden"><label class="row small" style="gap:8px;align-items:center;padding:10px 0;font-size:13px;line-height:1.5;cursor:pointer"><input type="checkbox" class="r1" checked> Mentions</label><label class="row small" style="gap:8px;align-items:center;padding:10px 0;border-top:1px solid var(--line);font-size:13px;line-height:1.5;cursor:pointer"><input type="checkbox" class="r2"> Weekly digest</label><p class="fe muted" style="font-size:12px;line-height:1.5;margin:2px 0 0">Pick at least one channel to continue.</p></div></div><div class="row" style="gap:8px;align-items:center"><button class="btn bV" style="min-height:32px">Validate</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="so"> soft height</label></div></div><div class="hint">Collapse the group, then validate it empty</div>`,
  desc:'Toggling the group springs its height with the chevron turning alongside. Validating an empty group snaps an invalid ring on; a checked group settles a success ring as its terminal.',
  api:'h.set(open ? full : 0, soft/base); chev.turn   invalid.ring.set(1, snap)   valid: ring success, hold',
  init(st){
    const box = $(st,'.fg'), body = $(st,'.fb'), head = $(st,'.fh'), ch = $(st,'.ch'), btn = $(st,'.bV'), sw = new Swap(0);
    const L = ['Open','Collapsed','Needs a channel','Group valid'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; $(st,'.fs').appendChild(e); return e; });
    const h = new Track(0), turn = new Track(1, S.snap), ring = new Track(0, S.snap), ok = new Track(0);
    let open = true;
    const full = () => body.scrollHeight;
    const lay = inst => { const dead = inst || REDUCE, cfg = $(st,'.so').checked ? S.soft : S.base, to = open ? full() : 0;
      if (dead){ h.jump(to); turn.jump(open ? 1 : 0); } else { h.set(to, cfg); turn.set(open ? 1 : 0); }
      head.setAttribute('aria-expanded', String(open));
      if (open && sw.cur < 2) sw.to(0); else if (!open && sw.cur < 2) sw.to(1); };
    head.onclick = () => { open = !open; lay(); };
    btn.onclick = () => { const any = $(st,'.r1').checked || $(st,'.r2').checked;
      if (!open){ open = true; lay(); }
      if (REDUCE){ ring.jump(any ? 0 : 1); ok.jump(any ? 1 : 0); }
      else { ring.set(any ? 0 : 1, S.snap); ok.set(any ? 1 : 0, S.base); }
      sw.to(any ? 3 : 2);
      if (any){ btn.disabled = true; btn.textContent = 'Valid'; } };
    requestAnimationFrame(() => lay(true)); lay(true);
    return t => { body.style.height = px(Math.max(0, h.at(t)));
      ch.style.transform = `rotate(${((1 - clamp(turn.at(t))) * -90).toFixed(1)}deg) translateY(0.5px)`;
      const r = clamp(ring.at(t)), s = clamp(ok.at(t));
      box.style.outline = (r > .02 || s > .02) ? `2px solid ${r > s ? 'var(--danger)' : 'var(--success)'}` : 'none';
      box.style.outlineOffset = '2px';
      L.forEach((e,k) => sw.apply(e, k, t)); };
  }});
