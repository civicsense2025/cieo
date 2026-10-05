

atom({ id:'savebar', cat:'Editor', name:'Unsaved changes bar', block:'Settings form, doc-meta, Switch', fam:['X','M','S','E'], wide:true, tall:true,
  html:`<style>
.sb{position:absolute;inset:0;isolation:isolate;display:flex;justify-content:center;padding:12px 12px 0;text-align:left}
.sb-cd{width:min(440px,100%);align-self:flex-start;padding:12px 16px 4px;display:flex;flex-direction:column}
.sb-r{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 12px;padding:10px 0;border-top:1px solid var(--line-soft)}
.sb-r.sb-c{flex-direction:column;align-items:stretch;gap:6px;border-top:0;padding-top:8px}
.sb-l{display:flex;align-items:baseline;gap:8px;font-size:13px;font-weight:500}
.sb-l small{display:block;font-size:12px;font-weight:400;color:var(--muted)}
.sb-mk{display:inline-block;font-size:12px;font-weight:500;color:var(--accent);opacity:0}
.sb-iw{border:1.5px solid var(--line);border-radius:9px;background:var(--card)}
.sb-iw input{display:block;width:100%;height:34px;border:0;background:none;color:var(--ink);font:14px var(--sans);padding:0 11px;user-select:text;-webkit-user-select:text}
.sb-seg{flex-wrap:nowrap}
.sb-seg button{padding:5px 10px}
.sb-sw{position:relative;flex:none;width:48px;height:28px;border-radius:14px;border:0;padding:0;cursor:pointer;background:var(--raised)}
.sb-kn{position:absolute;top:3px;left:0;height:22px;border-radius:11px;background:var(--card);box-shadow:var(--shadow)}
.sb-bar{position:absolute;left:0;right:0;bottom:12px;margin:0 auto;width:min(440px,calc(100% - 24px));height:52px;border-radius:14px;background:var(--ink);color:var(--card);box-shadow:var(--shadow);visibility:hidden;opacity:0}
.sb-ly{position:absolute;inset:0;display:flex;align-items:center;gap:6px;padding:0 10px 0 16px;font-size:13px;font-weight:500}
.sb-msg{position:relative;flex:1;min-width:0;height:20px;overflow:hidden}
.sb-msg .layer{justify-content:flex-start}
.sb-dc{flex:none;height:32px;padding:0;border:0;border-radius:8px;background:none;color:inherit;font-weight:500;cursor:pointer;overflow:hidden;white-space:nowrap}
.sb-sv{position:relative;flex:none;height:32px;border:0;padding:0;background:var(--card);color:var(--ink);font-weight:600;cursor:pointer;overflow:hidden}
.sb-ok{width:24px;height:24px;border-radius:50%;background:var(--success-tint);color:var(--success);display:grid;place-items:center;flex:none}
</style><div class="sb">
<div class="card sb-cd"><b style="font-size:15px;letter-spacing:-.01em;padding-bottom:2px">Site settings</b>
<div class="sb-r sb-c"><div class="sb-l"><label for="savebar-name">Site name</label><span class="sb-mk" aria-hidden="true">Edited</span></div><div class="sb-iw"><input id="savebar-name" maxlength="40" autocomplete="off"></div></div>
<div class="sb-r"><div class="sb-l"><span id="savebar-lang-l">Language</span><span class="sb-mk" aria-hidden="true">Edited</span></div><div class="seg sb-seg" role="radiogroup" aria-labelledby="savebar-lang-l"><div class="ind"></div></div></div>
<div class="sb-r"><div class="sb-l"><div><span id="savebar-show-l">Show in search results</span><small>Let search engines list your site.</small></div><span class="sb-mk" aria-hidden="true">Edited</span></div><button type="button" class="sb-sw" role="switch" aria-checked="true" aria-labelledby="savebar-show-l"><span class="sb-kn"></span></button></div>
</div>
<div class="sb-bar" role="region" aria-label="Unsaved changes">
<div class="sb-ly sb-d"><span class="sb-msg" role="status"><span class="layer">You have unsaved changes</span><span class="layer">Add a site name to save</span></span><button type="button" class="sb-dc">Discard</button><button type="button" class="sb-sv" aria-label="Save changes"><span class="layer">Save</span><span class="layer">${ic('<path d="M12 3a9 9 0 0 1 9 9"/>',16,3).replace('<svg ','<svg class="spn" ')}</span><span class="layer" style="color:var(--success)">${ic(I.check,16,3)}</span></button></div>
<div class="sb-ly sb-s" style="gap:10px"><span class="sb-ok">${ic(I.check,14,3)}</span><span role="status">Saved</span></div>
</div></div>`,
  desc:'The first edit raises the bar from below and a small “Edited” marker fades in beside that field. Editing a field back to its saved value drops the marker and lowers the bar. Discard springs the language indicator and switch knob back and blur-swaps the name text at the same moment, then the bar leaves. Save morphs the button into a spinner, then a success check, the markers clear, the bar swaps to “Saved”, and leaves 1.1 seconds later.',
  api:'dirty = fields ≠ saved   bar.o.set(dirty)   save: btn.to(spin) → +0.9 check, markers 0 → +1.3 bar.to(saved) → +2.4 bar.o.set(0)',
  init(st){
    const nameI = $(st,'#savebar-name'), iw = $(st,'.sb-iw'), seg = $(st,'.sb-seg'), sind = $(seg,'.ind'), sw = $(st,'.sb-sw'), kn = $(st,'.sb-kn'), bar = $(st,'.sb-bar'), dly = $(st,'.sb-d'), sly = $(st,'.sb-s'),
      dc = $(st,'.sb-dc'), sv = $(st,'.sb-sv'), msgs = $$(st,'.sb-msg .layer'), svl = $$(sv,'.layer'), spn = $(sv,'.spn'), mks = $$(st,'.sb-mk');
    const LANGS = ['English','Español','Français'];
    const lbtns = LANGS.map((n,i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role','radio'); b.textContent = n; seg.appendChild(b); return b; });
    let saved = { name:'Harbor & Pine', lang:0, show:true }, cur = { ...saved }, phase = 'idle'; const q = [];
    nameI.value = saved.name;
    const OFF = [3,25], ON = [23,45];
    const mk = [new Track(0), new Track(0), new Track(0)], nameO = new Track(1), fo = new Track(0), le = edges(0,0), se = edges(...ON), sf = new Track(1), sp = new Track(0, S.snap),
      bo = new Track(0), ls = new Swap('d'), msgSw = new Swap('ok'), btnSw = new Swap('save'), bw = new Track(64), dw = new Track(62), dO = new Track(1), en = new Track(1);
    const lg = i => [lbtns[i].offsetLeft, lbtns[i].offsetLeft + lbtns[i].offsetWidth];
    const paintLang = (inst) => { lbtns.forEach((b,i) => { b.setAttribute('aria-checked', i === cur.lang); b.tabIndex = i === cur.lang ? 0 : -1; }); const [l,r] = lg(cur.lang); inst ? le.jump(l, r) : le.go(l, r); };
    const paintShow = (inst) => { sw.setAttribute('aria-checked', cur.show); const e = cur.show ? ON : OFF; inst ? (se.jump(...e), sf.jump(cur.show ? 1 : 0)) : (se.go(...e), sf.set(cur.show ? 1 : 0)); };
    const dirty = () => cur.name !== saved.name || cur.lang !== saved.lang || cur.show !== saved.show;
    const markers = () => [cur.name !== saved.name, cur.lang !== saved.lang, cur.show !== saved.show].forEach((d,i) => mk[i].set(d ? 1 : 0, d ? S.base : S.snap));
    const resetBar = inst => { if (inst){ ls.cur = 'd'; ls.prev = null; ls.t = -9; } else ls.to('d'); btnSw.cur = 'save'; btnSw.prev = null; btnSw.t = -9; bw.jump(64); dw.jump(62); dO.jump(1); dc.disabled = false; };
    const refresh = () => { markers(); if (phase === 'saving') return; const d = dirty();
      if (phase !== 'idle'){ if (!d) return; q.length = 0; phase = 'idle'; resetBar(false); }
      const ok = cur.name.trim().length > 0; msgSw.to(ok ? 'ok' : 'bad'); en.set(ok ? 1 : .35); sv.setAttribute('aria-disabled', !ok); openSet(bo, d); };
    const save = () => { if (phase !== 'idle' || !dirty() || !cur.name.trim()) return; const t0 = now(), snap = { ...cur }; phase = 'saving'; q.length = 0;
      btnSw.to('spin'); bw.set(34); dw.set(0); dO.set(0, S.snap); dc.disabled = true;
      q.push([t0 + .9, () => { btnSw.to('check'); saved = snap; markers(); }],
        [t0 + 1.3, () => { if (dirty()){ phase = 'idle'; resetBar(false); refresh(); return; } ls.to('s'); phase = 'saved'; }],
        [t0 + 2.4, () => { phase = 'leaving'; openSet(bo, false); }],
        [t0 + 2.75, () => { phase = 'idle'; resetBar(true); }]); };
    const discard = () => { if (phase !== 'idle') return; q.length = 0; const t0 = now(), oldName = cur.name, was = saved.name;
      if (oldName !== was){ nameO.set(0, S.snap, t0); q.push([t0 + EXIT, () => { if (cur.name === was || cur.name === oldName){ nameI.value = was; cur.name = was; } nameO.set(1, S.base); refresh(); }]); }
      cur.lang = saved.lang; cur.show = saved.show; paintLang(false); paintShow(false); cur.name = was; refresh(); };
    nameI.oninput = () => { cur.name = nameI.value; refresh(); };
    nameI.onfocus = () => fo.set(1); nameI.onblur = () => fo.set(0);
    lbtns.forEach((b,i) => { b.onclick = () => { cur.lang = i; paintLang(false); refresh(); };
      b.onkeydown = e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault(); const j = (i + d + lbtns.length) % lbtns.length; lbtns[j].focus(); lbtns[j].click(); }; });
    sw.onclick = () => { cur.show = !cur.show; paintShow(false); refresh(); };
    sw.onpointerdown = () => sp.set(1); sw.onpointerup = sw.onpointerleave = () => sp.set(0);
    dc.onclick = discard; sv.onclick = save;
    st.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's'){ e.preventDefault(); save(); } });
    const init = () => { paintLang(true); paintShow(true); }; document.fonts.ready.then(init); requestAnimationFrame(init);
    return t => {
      while (q.length && t >= q[0][0]) q.shift()[1]();
      mks.forEach((m,i) => { const o = clamp(mk[i].at(t)); fade(m, o, (1-o)*-3); });
      fade(nameI, nameO.at(t), null); iw.style.borderColor = mix(clamp(fo.at(t)), 'var(--ink)', 'var(--line)');
      const l = le.A.at(t), r = le.B.at(t); sind.style.transform = `translate(${px(l)},3px)`; sind.style.width = px(r - l); sind.style.height = 'calc(100% - 6px)';
      const pr = sp.at(t), a = se.A.at(t) - (cur.show ? 5*pr : 0), b = se.B.at(t) + (cur.show ? 0 : 5*pr); kn.style.transform = `translateX(${px(a)})`; kn.style.width = px(b - a); sw.style.background = mix(clamp(sf.at(t)), 'var(--ink)', 'var(--raised)');
      pop(bar, bo.at(t), 20);
      ls.apply(dly, 'd', t, 4); ls.apply(sly, 's', t, 4); msgSw.apply(msgs[0], 'ok', t, 3); msgSw.apply(msgs[1], 'bad', t, 3);
      ['save','spin','check'].forEach((k,i) => btnSw.apply(svl[i], k, t, 3));
      const w = bw.at(t), dv = dw.at(t); sv.style.width = px(w); sv.style.borderRadius = px(lerp(8, 17, clamp((64 - w)/30))); sv.style.opacity = clamp(en.at(t)).toFixed(3);
      dc.style.width = px(Math.max(0, dv)); dc.style.marginRight = px(-6*(1 - clamp(dv/62))); dc.style.opacity = clamp(dO.at(t)).toFixed(3);
      spn.style.transform = `rotate(${(t*420 % 360).toFixed(1)}deg)`;
    };
  }});