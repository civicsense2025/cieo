

/* ---------- Workflow (molecules): step-up, conflict, approval, field diff, invite, reference picker ---------- */
(() => {
const wfEl = (tag, css, html) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; };
// timed events drained at the top of render (clock time, so the speed control scales them)
const wfQ = () => { const q = []; return {
  after:(d, fn) => q.push([now() + d, fn]),
  run:t => { q.sort((a, b) => a[0] - b[0]); while (q.length && q[0][0] <= t) q.shift()[1](t); },
  clear:() => { q.length = 0; } }; };
const wfLayer = (host, html, css) => { const e = wfEl('span', css || '', html); e.className = 'layer'; host.appendChild(e); return e; };
const wfReset = (sw, k) => { sw.cur = k; sw.prev = null; sw.t = -9; };
const wfClock = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
const wfArrow = '<path d="M5 12h14M13 6l6 6-6 6"/>';
const wfSr = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';

/* ================================================================ 1. Step-up re-authentication */
atom({ id:'stepup', cat:'Workflow', name:'Step-up re-authentication', block:'StepUpForm, Dialog, Input OTP', fam:['X','S','M'], tall:true,
  html:`<style>
.wfsu-pg{position:absolute;left:0;right:0;top:46px;margin:0 auto;width:min(390px,92%);text-align:left}
.wfsu-hd{font-size:12px;font-weight:600;color:var(--muted);padding:0 2px 8px}
.wfsu-cd{overflow:hidden}
.wfsu-r1{overflow:hidden}
.wfsu-ri{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px}
.wfsu-r1 .wfsu-ri{border-bottom:1px solid var(--line-soft)}
.wfsu-ri b{display:block;font-size:14px;font-weight:600;letter-spacing:-.01em}
.wfsu-ri small{display:block;font-size:12.5px;line-height:1.4;color:var(--muted)}
.wfsu-bt{position:relative;flex:none;width:104px;height:32px;padding:0;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;overflow:hidden;background:var(--card);color:var(--danger);border:1px solid var(--danger)}
.wfsu-st{position:relative;height:36px;margin-top:10px;font-size:12.5px}
.wfsu-scr{position:absolute;inset:0;background:#0C1016;opacity:0;pointer-events:none;z-index:20}
.wfsu-ov{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;z-index:30}
.wfsu-dl{width:min(336px,94%);padding:16px;text-align:left;visibility:hidden}
.wfsu-ey{margin:0;font-size:12px;font-weight:500;color:var(--faint)}
.wfsu-tt{margin:2px 0 4px;font-size:16px;font-weight:600;letter-spacing:-.02em}
.wfsu-cp{margin:0 0 12px;font-size:12.5px;line-height:1.45;color:var(--muted)}
.wfsu-ob{position:relative;display:flex;gap:7px}
.wfsu-bx{position:relative;flex:1;min-width:0;height:46px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);font:600 22px var(--sans);display:block}
.wfsu-rg{position:absolute;top:-3px;height:52px;border-radius:12px;border:2px solid var(--ink);pointer-events:none;opacity:0}
.wfsu-in{position:absolute;inset:0;width:100%;opacity:0;font-size:16px;cursor:text;border:0;background:none}
.wfsu-m{position:relative;height:18px;margin:10px 0}
.wfsu-vb{position:relative;display:block;width:100%;height:38px;border:0;border-radius:10px;font-size:13.5px;font-weight:500;cursor:pointer;overflow:hidden;padding:0}
.wfsu-lk{display:flex;justify-content:space-between;align-items:center;margin-top:8px}
.wfsu-lk button{border:0;background:none;padding:4px 2px;font-size:12.5px;font-weight:500;color:var(--muted);cursor:pointer}
</style>
<button class="btn wfsu-rs" style="position:absolute;top:10px;right:12px">Reset</button>
<div class="wfsu-pg"><div class="wfsu-hd">Danger zone</div>
<div class="card wfsu-cd">
 <div class="wfsu-r1"><div class="wfsu-ri"><div><b>Delete this site</b><small>Removes harbor-studio.example.site, its pages and media.</small></div><button class="wfsu-bt" type="button"></button></div></div>
 <div class="wfsu-ri"><div><b>Export content</b><small>Download every page as JSON.</small></div><span class="small muted">Available</span></div>
</div>
<div class="wfsu-st" role="status" aria-live="polite"></div></div>
<div class="wfsu-scr"></div>
<div class="wfsu-ov"><div class="card wfsu-dl" role="dialog" aria-modal="true" aria-labelledby="wfsu-t">
 <p class="wfsu-ey">Owner access</p><h4 class="wfsu-tt" id="wfsu-t">Confirm it’s you</h4>
 <p class="wfsu-cp">Deleting a site needs a fresh check. Enter the 6-digit code from your authenticator app.</p>
 <div class="wfsu-ob"><i class="wfsu-rg"></i><input class="wfsu-in" id="wfsu-in" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="Six digit authenticator code"></div>
 <div class="wfsu-m" role="status" aria-live="polite"></div>
 <button class="wfsu-vb" type="button" aria-disabled="true"></button>
 <div class="wfsu-lk"><button class="wfsu-pk" type="button">Use a passkey instead</button><button class="wfsu-cn" type="button">Cancel</button></div>
</div></div>`,
  desc:'Delete site is blocked until you prove it is you. A scrim fades in while the dialog rises 8px from 97% scale, with focus in the code row and the ring sliding box to box. A wrong code turns the boxes danger, says why, then clears itself. A right code turns the boxes and button success, the dialog leaves, and only then does the blocked action resume: the button reads Deleting…, the row fades out and its space collapses, and a status line swaps in.',
  api:'dialog.o.set(1)   code → verify → ok | bad   ok: dialog.o.set(0, snap); t+.45 resume: row.o→0, row.h→0 (t+EXIT), status.to(done)',
  init(st){
    const q = wfQ(), $s = s => $(st, s);
    const scr = $s('.wfsu-scr'), dl = $s('.wfsu-dl'), ob = $s('.wfsu-ob'), inp = $s('.wfsu-in'), ring = $s('.wfsu-rg'), mbox = $s('.wfsu-m'), vb = $s('.wfsu-vb'), pk = $s('.wfsu-pk'), cn = $s('.wfsu-cn'), rs = $s('.wfsu-rs'), del = $s('.wfsu-bt'), rowW = $s('.wfsu-r1'), rowI = $s('.wfsu-r1 .wfsu-ri'), stat = $s('.wfsu-st');
    const CODE = '482913';
    const boxes = [...Array(6)].map(() => { const b = wfEl('span'); b.className = 'wfsu-bx'; ob.insertBefore(b, inp); return { b, sw:new Swap(''), L:{} }; });
    boxes.forEach(x => x.b.setAttribute('aria-hidden', 'true')); ob.insertBefore(ring, boxes[0].b);
    const dL = { idle:wfLayer(del, 'Delete site'), busy:wfLayer(del, 'Deleting…') };
    const vL = { idle:wfLayer(vb, 'Verify owner access'), busy:wfLayer(vb, 'Verifying…'), ok:wfLayer(vb, ic(I.check,16,2.5) + 'Verified') };
    const mL = { hint:wfLayer(mbox, 'Demo code: ' + CODE, 'color:var(--faint);font-size:12.5px'), bad:wfLayer(mbox, 'That code didn’t match. Try again.', 'color:var(--danger);font-size:12.5px'), ok:wfLayer(mbox, 'Verified. Resuming your request…', 'color:var(--success);font-size:12.5px') };
    const sL = { done:wfLayer(stat, ic(I.check,16,2.5) + '<span>Site deleted. Restore it from Trash for 30 days.</span>', 'justify-content:flex-start;align-items:flex-start;white-space:normal;color:var(--success);font-weight:500;gap:6px;padding:0 2px') };
    const dsw = new Swap('idle'), vsw = new Swap('idle'), msw = new Swap('hint'), ssw = new Swap('none');
    const e = edges(0,40), o = new Track(0), ok = new Track(0), bad = new Track(0), en = new Track(0), fo = new Track(0), rowH = new Track(1), rowO = new Track(1);
    let state = 'closed', clearAt = 0, ringKey = '';
    const place = inst => { const v = inp.value, i = Math.min(v.length, 5), b = boxes[i].b, k = i + ':' + b.offsetLeft + ':' + b.offsetWidth; if (k === ringKey) return; ringKey = k; const a = b.offsetLeft - 3, z = b.offsetLeft + b.offsetWidth + 3; inst ? e.jump(a, z) : e.go(a, z); };
    const show = () => { const v = inp.value;
      boxes.forEach((x,i) => { const c = v[i] || ''; if (!(c in x.L)){ const s = document.createElement('span'); s.className = 'layer'; s.textContent = c; x.b.appendChild(s); x.L[c] = s; } x.sw.to(c); });
      if (state === 'entry'){ en.set(v.length === 6 ? 1 : 0); vb.setAttribute('aria-disabled', v.length === 6 ? 'false' : 'true'); if (v.length && v.length < 6 && msw.cur === 'bad'){ msw.to('hint'); bad.set(0); } }
      place(); };
    const clearCode = () => { inp.value = ''; bad.set(0); msw.to('hint'); show(); };
    const open = () => { if (state !== 'closed') return; state = 'entry'; inp.value = ''; inp.readOnly = false; show(); openSet(o, true); setTimeout(() => inp.focus(), 30); };
    const close = () => { if (state !== 'entry') return; state = 'closed'; openSet(o, false); setTimeout(() => del.focus(), 0); };
    const submit = kind => { if (state !== 'entry') return; state = 'busy'; inp.readOnly = true; vsw.to('busy'); en.set(1); vb.setAttribute('aria-disabled', 'true');
      q.after(.7, tt => { const good = kind === 'pk' || inp.value === CODE;
        if (good){ state = 'ok'; ok.set(1); vsw.to('ok'); msw.to('ok');
          q.after(.8, () => { openSet(o, false); state = 'resume';
            q.after(.45, () => { dsw.to('busy'); del.disabled = true;
              q.after(1.1, () => { rowO.set(0, S.snap); rowH.set(0, S.base, now() + EXIT); q.after(.2, () => { ssw.to('done'); state = 'deleted'; }); }); }); }); }
        else { state = 'entry'; inp.readOnly = false; bad.set(1); msw.to('bad'); vsw.to('idle'); en.set(0); vb.setAttribute('aria-disabled', 'true'); clearAt = now() + 1.1; inp.focus(); } }); };
    inp.oninput = () => { inp.value = inp.value.replace(/\D/g,'').slice(0,6); if (clearAt){ clearAt = 0; } show(); if (inp.value.length === 6) submit('code'); };
    inp.onfocus = () => fo.set(1); inp.onblur = () => fo.set(0);
    vb.onclick = () => { if (state === 'entry' && inp.value.length === 6) submit('code'); };
    pk.onclick = () => { if (state === 'entry') submit('pk'); };
    cn.onclick = close; scr.onclick = () => close();
    del.onclick = open; del.type = 'button';
    st.addEventListener('keydown', ev => {
      if (ev.key === 'Escape'){ close(); return; }
      if (ev.key === 'Tab' && clamp(o.at()) > .5){ const f = [inp, vb, pk, cn], i = f.indexOf(document.activeElement); const n = ev.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i < 0 || i === f.length - 1 ? 0 : i + 1); ev.preventDefault(); f[n].focus(); } });
    rs.onclick = () => { q.clear(); clearAt = 0; state = 'closed'; inp.value = ''; inp.readOnly = false; del.disabled = false;
      o.jump(0); ok.jump(0); bad.jump(0); en.jump(0); wfReset(vsw, 'idle'); wfReset(msw, 'hint'); show(); dsw.to('idle'); ssw.to('none'); rowH.set(1); rowO.set(1, S.base, now() + .12); };
    dsw.to('idle'); show(); const b0 = boxes[0].b; e.jump(b0.offsetLeft - 3, b0.offsetLeft + b0.offsetWidth + 3);
    return t => { q.run(t);
      if (clearAt && t >= clearAt){ clearAt = 0; clearCode(); }
      const p = clamp(o.at(t)); scr.style.opacity = (p*.4).toFixed(3); scr.style.pointerEvents = p > .5 ? 'auto' : 'none'; pop(dl, p, 8);
      place();
      const g = clamp(ok.at(t)), k = clamp(bad.at(t)), a = e.A.at(t), z = e.B.at(t);
      ring.style.left = px(a); ring.style.width = px(z - a); ring.style.opacity = (clamp(fo.at(t))*(1 - Math.max(g,k))).toFixed(3);
      const bc = `color-mix(in oklab, var(--danger) ${(k*100).toFixed(1)}%, ${mix(g,'var(--success)','var(--line)')})`;
      boxes.forEach(x => { x.b.style.borderColor = bc; for (const c in x.L) x.sw.apply(x.L[c], c, t, 10); });
      for (const c in mL) msw.apply(mL[c], c, t, 3);
      const enb = clamp(en.at(t)); vb.style.background = mix(g,'var(--success)', mix(enb,'var(--ink)','var(--raised)')); vb.style.color = mix(g,'var(--card)', mix(enb,'var(--card)','var(--faint)'));
      for (const c in vL) vsw.apply(vL[c], c, t, 3);
      for (const c in dL) dsw.apply(dL[c], c, t, 3); for (const c in sL) ssw.apply(sL[c], c, t, 3);
      const h = clamp(rowH.at(t)); rowW.style.height = px(h*rowI.offsetHeight); rowW.style.visibility = h < .01 ? 'hidden' : 'visible'; fade(rowI, rowO.at(t), null);
    };
  }});

/* ================================================================ 2. Conflict recovery */
atom({ id:'conflict', cat:'Workflow', name:'Conflict recovery', block:'ConflictRecoveryPanel, NoticeBanner', fam:['X','S','M','E'], wide:true, tall:true,
  html:`<style>
.wfcf-cd{position:absolute;left:0;right:0;top:28px;margin:0 auto;width:min(660px,94%);max-height:calc(100% - 44px);overflow:hidden;text-align:left;display:flex;flex-direction:column}
.wfcf-tb{flex:none;display:flex;align-items:center;gap:6px;height:42px;padding:0 10px 0 16px;border-bottom:1px solid var(--line-soft)}
.wfcf-tb b{font-size:14px;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.wfcf-tb svg{flex:none}
.wfcf-cp{position:relative;flex:none;width:68px;height:24px;border-radius:999px;font-size:12px;font-weight:500;overflow:hidden;margin-left:auto}
.wfcf-bw{flex:none;overflow:hidden;height:0}
.wfcf-bn{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:8px 14px;background:var(--warning-tint);font-size:12.5px;line-height:1.35}
.wfcf-bt{flex:1 1 190px;min-width:0;text-wrap:balance}
.wfcf-ba{display:grid;margin-left:auto}
.wfcf-ba>div{grid-area:1/1;display:flex;gap:6px;justify-content:flex-end}
.wfcf-bd{position:relative;flex:0 1 auto;min-height:0;overflow:hidden;outline:none}
.wfcf-ly{position:absolute;left:0;right:0;top:0}
.wfcf-ed{padding:14px 16px 16px}
.wfcf-ed h4{margin:0 0 8px;font-size:16px;letter-spacing:-.02em}
.wfcf-ed p{margin:0 0 6px;font-size:13.5px;line-height:1.55}
.wfcf-lw{display:grid}
.wfcf-lw>span{grid-area:1/1}
.wfcf-cm{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;padding:10px 12px}
.wfcf-cl{min-width:0;display:flex;flex-direction:column;gap:2px}
.wfcf-ch{font-size:12px;color:var(--muted);padding:0 8px 2px}
.wfcf-ch b{color:var(--ink)}
.wfcf-ln{font-size:12.5px;line-height:1.4;padding:2px 8px;border-radius:6px}
.wfcf-sm{padding:4px 8px;font-size:12.5px;flex:none}
.wfcf-ba .btn{padding:5px 10px;font-size:12.5px;white-space:nowrap}
</style>
<div class="card wfcf-cd">
 <div class="wfcf-tb"><b>Spring launch</b><span class="wfcf-cp" role="status"></span><button class="btn wfcf-sm wfcf-rs" type="button">Reset</button></div>
 <div class="wfcf-bw" role="status" aria-live="polite"><div class="wfcf-bn"><span style="flex:none;color:var(--warning);display:grid">${ic(I.alert,18)}</span><span class="wfcf-bt"></span><div class="wfcf-ba"></div></div></div>
 <div class="wfcf-bd" tabindex="-1"></div>
</div>`,
  desc:'While you edit, a newer version arrives: the banner’s height springs open first, pushing the draft down, then its content fades in 70ms later. Compare swaps the draft for mine and theirs side by side, and the changed lines light up one after another. Keep mine or Use theirs swaps back to the draft (theirs blur-swaps the two changed lines), then the banner fades out, its space collapses and the chip turns Saved.',
  api:'banner.h.set(1); banner.o.set(1, t+.07)   compare: body.to("cmp"); hl[i].set(1, t+.25+i·.07)   resolve: body.to("edit"); line[i].to("t"); banner.o→0; banner.h→0 (t+EXIT)',
  init(st){
    const q = wfQ(), $s = s => $(st, s);
    const cd = $s('.wfcf-cd'), cp = $s('.wfcf-cp'), bw = $s('.wfcf-bw'), bn = $s('.wfcf-bn'), bt = $s('.wfcf-bt'), ba = $s('.wfcf-ba'), bd = $s('.wfcf-bd'), rs = $s('.wfcf-rs');
    const D = [['Opens April 12 at Harbor Hall.'], ['Tickets $18, under 12 free.', 'Tickets $20, under 14 free.'], ['Doors at 6 pm, talk at 7.'], ['Walk or ride, parking is tight.', 'Bike racks are by the east door.'], ['Seats are first come, first served.'], ['The accessible entrance is on Pine Street.'], ['Questions go to hello@harbor.studio.']];
    const changed = D.map((d,i) => d.length > 1 ? i : -1).filter(i => i >= 0);
    // body layers: draft, compare
    const ed = wfEl('div', '', `<h4>Spring launch</h4>` + D.map(d => d.length > 1 ? `<p><span class="wfcf-lw"><span class="m">${d[0]}</span><span class="t">${d[1]}</span></span></p>` : `<p>${d[0]}</p>`).join('')); ed.className = 'wfcf-ly wfcf-ed';
    const cm = wfEl('div', '', ['Mine','Theirs'].map((n,s) => `<div class="wfcf-cl"><div class="wfcf-ch"><b>${n}</b> · ${s ? 'Theo, 2 min ago' : 'unsaved'}</div>` + D.map((d,i) => `<div class="wfcf-ln" data-i="${i}">${d[s] ?? d[0]}</div>`).join('') + '</div>').join('')); cm.className = 'wfcf-ly wfcf-cm';
    bd.append(ed, cm); const ly = [ed, cm];
    const lw = $$(ed, '.wfcf-lw'), lsw = lw.map(() => new Swap('m')), hl = changed.map(() => new Track(0)), lines = $$(cm, '.wfcf-ln');
    // banner actions: idle group, compare group
    const g1 = wfEl('div', '', ''), g2 = wfEl('div', '', '');
    const mkb = (host, label, cls, fn) => { const b = wfEl('button', '', label); b.type = 'button'; b.className = 'btn' + (cls ? ' ' + cls : ''); b.onclick = fn; host.appendChild(b); return b; };
    mkb(g1, 'Compare', 'ink', () => setView('cmp'));
    mkb(g2, 'Back', '', () => setView('edit')); mkb(g2, 'Keep mine', '', () => resolve('mine')); mkb(g2, 'Use theirs', 'ink', () => resolve('theirs'));
    ba.append(g1, g2); const G = { idle:g1, cmp:g2 };
    const CH = { editing:wfLayer(cp, 'Editing'), conflict:wfLayer(cp, 'Conflict'), saved:wfLayer(cp, ic(I.check,12,3) + 'Saved', 'gap:4px') };
    const csw = new Swap('editing'), bsw = new Swap('edit'), asw = new Swap('idle');
    const bh = new Track(0), bo = new Track(0), H = new Track(0), warn = new Track(0), done = new Track(0);
    let view = 'edit', shown = false, armed = false, inited = false;
    const chip = (k, t) => { csw.to(k, t); warn.set(k === 'conflict' ? 1 : 0, S.base, t); done.set(k === 'saved' ? 1 : 0, S.base, t); };
    const showBanner = tt => { bt.innerHTML = '<b>A newer version was saved by Theo</b> <span class="muted">2 min ago</span>'; shown = true; bh.set(1, S.base, tt); bo.set(1, S.base, tt + .07); chip('conflict', tt); };
    const setView = v => { if (!shown || v === view) return; view = v; const t0 = now(); bsw.to(v, t0); asw.to(v === 'cmp' ? 'cmp' : 'idle', t0);
      if (v === 'cmp') hl.forEach((h,k) => h.set(1, S.base, t0 + .25 + k*.07)); else q.after(.15, () => hl.forEach(h => h.jump(0)));
      setTimeout(() => (v === 'cmp' ? G.cmp : G.idle).querySelector('button').focus({ preventScroll:true }), 0); };
    const resolve = w => { if (!shown) return; const t0 = now(); view = 'edit'; bsw.to('edit', t0); asw.to('idle', t0);
      if (w === 'theirs') lsw.forEach((s,i) => s.to('t', t0 + EXIT + .1 + i*.07));
      q.after(.15, () => hl.forEach(h => h.jump(0)));
      shown = false; bo.set(0, S.snap, t0 + .3); bh.set(0, S.base, t0 + .3 + EXIT); chip('saved', t0 + .3); bd.focus({ preventScroll:true }); };
    rs.onclick = () => { q.clear(); view = 'edit'; shown = false; lsw.forEach(s => wfReset(s, 'm')); wfReset(bsw, 'edit'); wfReset(asw, 'idle'); wfReset(csw, 'editing');
      bo.jump(0); bh.jump(0); warn.jump(0); done.jump(0); hl.forEach(h => h.jump(0)); bt.textContent = ''; q.after(.9, showBanner); };
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape' && view === 'cmp') setView('edit'); });
    return t => { if (!armed){ armed = true; q.after(1.3, showBanner); } q.run(t);
      const need = ly[view === 'cmp' ? 1 : 0].offsetHeight; if (!inited){ inited = true; H.jump(need); } else if (Math.abs(need - H.target) > 1) H.set(need);
      bd.style.height = px(H.at(t)); bsw.apply(ed, 'edit', t, 4); bsw.apply(cm, 'cmp', t, 4);
      bw.style.height = px(clamp(bh.at(t))*bn.offsetHeight); fade(bn, bo.at(t), -(1 - clamp(bo.at(t)))*8);
      for (const k in G) asw.apply(G[k], k, t, 3);
      const w = clamp(warn.at(t)), d = clamp(done.at(t)); cp.style.background = mix(w,'var(--warning-tint)', mix(d,'var(--success-tint)','var(--raised)')); cp.style.color = mix(w,'var(--warning)', mix(d,'var(--success)','var(--muted)'));
      for (const k in CH) csw.apply(CH[k], k, t, 3);
      lw.forEach((el,i) => { lsw[i].apply($(el,'.m'), 'm', t, 4); lsw[i].apply($(el,'.t'), 't', t, 4); });
      changed.forEach((ci,k) => { const v = clamp(hl[k].at(t)), bg = mix(v,'var(--warning-tint)','transparent'); $$(cm, `.wfcf-ln[data-i="${ci}"]`).forEach(l => l.style.background = bg); });
    };
  }});

/* ================================================================ 3. Approval card */
atom({ id:'approval', cat:'Workflow', name:'Approval card', block:'ApprovalDetail', fam:['M','S','X'], tall:true,
  html:`<style>
.wfap-cd{position:absolute;left:0;right:0;top:46px;margin:0 auto;width:min(390px,92%);padding:14px;text-align:left}
.wfap-t{margin:0 0 10px;font-size:15px;font-weight:600;letter-spacing:-.01em}
.wfap-sa{position:relative;overflow:hidden;border-radius:10px;border:1.5px solid transparent;height:38px;outline:none}
.wfap-sl{position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;gap:8px;padding:0 11px}
.wfap-sl>div{min-width:0}
.wfap-sl b{display:block;font-size:13px;line-height:1.3}
.wfap-sl small{display:block;font-size:12.5px;line-height:1.3;opacity:.85}
.wfap-dl{display:grid;grid-template-columns:92px minmax(0,1fr);gap:5px 10px;margin:12px 0 0;font-size:13px}
.wfap-dl dt{color:var(--faint)}
.wfap-dl dd{margin:0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wfap-ac{overflow:hidden}
.wfap-ai{display:flex;gap:8px;padding-top:12px}
.wfap-ai .btn{flex:1;padding:8px 12px}
</style>
<button class="btn wfap-rs" type="button" style="position:absolute;top:10px;right:12px">Reset</button>
<div class="card wfap-cd"><h4 class="wfap-t">the assistant app wants to publish a page</h4>
 <div class="wfap-sa" tabindex="-1" role="group" aria-label="Request status"></div>
 <dl class="wfap-dl"><dt>Client</dt><dd>the assistant app</dd><dt>Authorized by</dt><dd>Maya Okafor</dd><dt>Capability</dt><dd style="font:12.5px var(--mono)">pages.publish</dd><dt>Target</dt><dd>Spring launch · /spring</dd></dl>
 <div class="wfap-ac"><div class="wfap-ai"><button class="btn ink wfap-yes" type="button">Approve</button><button class="btn wfap-no" type="button">Deny</button></div></div>
 <span class="wfap-sr" role="status" aria-live="polite" style="${wfSr}"></span>
</div>`,
  desc:'Deciding does two things in order. The status strip springs taller and its tint and outline morph from warning to success or danger while the label swaps. Then the Approve and Deny row fades out and its space collapses 100ms later, so the card ends as a stamp, not a form. Reset reverses it.',
  api:'strip.{h,tint,ring}.set(decision); label.to(k)   actions.o.set(0, snap); actions.h.set(0, base, t + EXIT)',
  init(st){
    const $s = s => $(st, s), sa = $s('.wfap-sa'), ac = $s('.wfap-ac'), ai = $s('.wfap-ai'), sr = $s('.wfap-sr'), rs = $s('.wfap-rs');
    const L = { p:wfLayer(sa, ic(wfClock,16) + '<div><b>Pending</b></div><span style="margin-left:auto;font-size:12.5px;white-space:nowrap">expires in <span class="num wfap-cnt">14:52</span></span>', 'justify-content:flex-start'),
      ok:wfLayer(sa, ic(I.check,18,2.5) + '<div><b>Approved</b><small>the assistant app can publish it now.</small></div>', 'justify-content:flex-start'),
      no:wfLayer(sa, ic(I.x,18,2.5) + '<div><b>Denied</b><small>Nothing was published.</small></div>', 'justify-content:flex-start') };
    for (const k in L) L[k].classList.add('wfap-sl');
    const cnt = $(L.p, '.wfap-cnt'), sw = new Swap('p'), sh = new Track(38), ok = new Track(0), no = new Track(0), ring = new Track(0), ah = new Track(1), ao = new Track(1);
    let state = 'p', t0c = null, last = '';
    const decide = k => { if (state !== 'p') return; state = k; const t0 = now(); sw.to(k, t0); sh.set(60, S.base, t0); ok.set(k === 'ok' ? 1 : 0, S.base, t0); no.set(k === 'no' ? 1 : 0, S.base, t0); ring.set(1, S.base, t0);
      ao.set(0, S.snap, t0); ah.set(0, S.base, t0 + EXIT); ai.inert = true; sr.textContent = k === 'ok' ? 'Approved. the assistant app can publish it now.' : 'Denied. Nothing was published.'; sa.focus({ preventScroll:true }); };
    $s('.wfap-yes').onclick = () => decide('ok'); $s('.wfap-no').onclick = () => decide('no');
    rs.onclick = () => { if (state === 'p') return; state = 'p'; const t0 = now(); t0c = t0; sw.to('p', t0); sh.set(38, S.base, t0); ok.set(0, S.base, t0); no.set(0, S.base, t0); ring.set(0, S.base, t0);
      ah.set(1, S.base, t0); ao.set(1, S.base, t0 + .15); ai.inert = false; sr.textContent = ''; };
    return t => {
      if (t0c === null) t0c = t;
      if (state === 'p'){ const rem = Math.max(0, 892 - Math.floor(t - t0c)), s = Math.floor(rem/60) + ':' + String(rem % 60).padStart(2,'0'); if (s !== last){ last = s; cnt.textContent = s; } }
      const g = clamp(ok.at(t)), d = clamp(no.at(t)), r = clamp(ring.at(t)), tint = mix(g,'var(--success-tint)', mix(d,'var(--danger-tint)','var(--warning-tint)')), col = mix(g,'var(--success)', mix(d,'var(--danger)','var(--warning)'));
      sa.style.height = px(sh.at(t)); sa.style.background = tint; sa.style.color = col; sa.style.borderColor = `color-mix(in oklab, ${col} ${(r*100).toFixed(1)}%, transparent)`;
      for (const k in L) sw.apply(L[k], k, t, 4);
      const h = clamp(ah.at(t)); ac.style.height = px(h*ai.offsetHeight); ac.style.visibility = h < .01 ? 'hidden' : 'visible'; fade(ai, ao.at(t), null);
    };
  }});

/* ================================================================ 4. Field diff rows */
atom({ id:'fielddiff', cat:'Workflow', name:'Field diff rows', block:'WorkflowFieldDiffRow, ConflictReview', fam:['S','M'], tall:true,
  html:`<style>
.wffd-cd{position:absolute;left:0;right:0;top:12px;margin:0 auto;width:min(430px,94%);text-align:left;overflow:hidden}
.wffd-hd{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px 10px 14px}
.wffd-hd>div:first-child{white-space:nowrap}
.wffd-hd b{display:block;font-size:13.5px;letter-spacing:-.01em}
.wffd-hd small{display:block;font-size:12.5px;color:var(--muted)}
.wffd-bs{display:flex;gap:4px}
.wffd-b{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:9px;padding:4px 7px;font-size:12px;white-space:nowrap;font-weight:500;cursor:pointer}
.wffd-r{padding:8px 14px 9px;border-top:1px solid var(--line-soft)}
.wffd-l{display:flex;align-items:center;justify-content:space-between;height:18px;margin-bottom:5px}
.wffd-l code{font:12px var(--mono);color:var(--muted)}
.wffd-bg{position:relative;width:72px;height:16px;font-size:12px;font-weight:500}
.wffd-v{display:flex;align-items:center;gap:8px;flex-wrap:wrap;color:var(--faint)}
.wffd-p{position:relative;border:1px solid var(--line);border-radius:8px;background:transparent;padding:4px 9px;font-size:13px;cursor:pointer;color:var(--ink);overflow:hidden;text-align:left}
.wffd-p i{position:absolute;left:8px;right:8px;top:50%;height:1.5px;margin-top:-.75px;background:currentColor;transform-origin:0 50%;transform:scaleX(0);pointer-events:none}
.wffd-ft{padding:6px 14px 8px;border-top:1px solid var(--line-soft);font-size:12px;color:var(--muted)}
</style>
<div class="card wffd-cd">
 <div class="wffd-hd"><div><b>Changed by Theo</b><small><span class="wffd-dg"></span> of 3 decided</small></div><div class="wffd-bs" role="group" aria-label="Decide all fields"><button class="wffd-b wffd-rv" type="button" aria-pressed="false">Revert all</button><button class="wffd-b wffd-ac" type="button" aria-pressed="false">Accept all</button></div></div>
 <div class="wffd-rows"></div>
 <div class="wffd-ft">Click a value to choose it or undo.</div>
</div>`,
  desc:'Each row shows the old value and Theo’s new one. Choosing a value draws a strike across the other and fades it, then the chosen one’s plate fills success 60ms later and the badge swaps. Accept all and Revert all run the same change down the list 70ms apart, the decided count rolls, and a header button turns ink once every row agrees.',
  api:'rejected.strike.set(1); rejected.o.set(.55)   chosen.plate.set(1, t + LAG)   rows.forEach((r, i) => decide(r, d, t + i·.07))',
  init(st){
    const $s = s => $(st, s), host = $s('.wffd-rows'), bA = $s('.wffd-ac'), bR = $s('.wffd-rv'), dg = new Digits($s('.wffd-dg'), 1);
    const F = [['title','Spring launch','Spring season'],['price','$18','$20'],['status','Draft','Published']];
    const BADGE = { p:['Pending','var(--faint)'], a:['Accepted','var(--success)'], r:['Reverted','var(--muted)'] };
    const rows = F.map(([k,a,b]) => { const r = wfEl('div', '', `<div class="wffd-l"><code>${k}</code><span class="wffd-bg"></span></div><div class="wffd-v"><button class="wffd-p wffd-o" type="button" aria-pressed="false" aria-label="Keep old ${k}: ${a}"><span>${a}</span><i></i></button><span style="display:grid;flex:none">${ic(wfArrow,14)}</span><button class="wffd-p wffd-n" type="button" aria-pressed="false" aria-label="Use new ${k}: ${b}"><span>${b}</span><i></i></button></div>`); r.className = 'wffd-r'; host.appendChild(r);
      const L = {}; for (const c in BADGE) L[c] = wfLayer($(r,'.wffd-bg'), BADGE[c][0], `justify-content:flex-end;color:${BADGE[c][1]}`);
      return { r, d:'p', L, sw:new Swap('p'), o:$(r,'.wffd-o'), n:$(r,'.wffd-n'), so:new Track(0), po:new Track(0), sn:new Track(0), pn:new Track(0) }; });
    const pa = new Track(0), pr = new Track(0);
    const sync = () => { const a = rows.every(x => x.d === 'a'), r = rows.every(x => x.d === 'r'); pa.set(a ? 1 : 0); pr.set(r ? 1 : 0); bA.setAttribute('aria-pressed', a); bR.setAttribute('aria-pressed', r);
      rows.forEach(x => { x.o.setAttribute('aria-pressed', x.d === 'r'); x.n.setAttribute('aria-pressed', x.d === 'a'); }); const n = rows.filter(x => x.d !== 'p').length; dg.dir = n >= (dg.n || 0) ? 1 : -1; dg.n = n; dg.set(String(n)); };
    const decide = (x, d, t) => { x.d = d; x.sw.to(d, t);
      if (d === 'a'){ x.so.set(1, S.base, t); x.sn.set(0, S.base, t); x.po.set(0, S.base, t); x.pn.set(1, S.base, t + LAG); }
      else if (d === 'r'){ x.sn.set(1, S.base, t); x.so.set(0, S.base, t); x.pn.set(0, S.base, t); x.po.set(1, S.base, t + LAG); }
      else { [x.so, x.sn, x.po, x.pn].forEach(tr => tr.set(0, S.base, t)); } };
    rows.forEach(x => { x.o.onclick = () => { decide(x, x.d === 'r' ? 'p' : 'r', now()); sync(); }; x.n.onclick = () => { decide(x, x.d === 'a' ? 'p' : 'a', now()); sync(); }; });
    const all = d => { const t0 = now(), tgt = rows.every(x => x.d === d) ? 'p' : d; rows.forEach((x,i) => decide(x, tgt, t0 + i*.07)); sync(); };
    bA.onclick = () => all('a'); bR.onclick = () => all('r');
    dg.set('0', true); dg.n = 0; sync();
    return t => { dg.render(t);
      rows.forEach(x => { for (const c in BADGE) x.sw.apply(x.L[c], c, t, 3);
        [[x.o, x.so, x.po, 1], [x.n, x.sn, x.pn, .6]].forEach(([el, S_, P_, base]) => { const s = clamp(S_.at(t)), p = clamp(P_.at(t));
          el.style.opacity = (lerp(base, 1, p)*(1 - .45*s)).toFixed(3); el.style.color = mix(s,'var(--faint)','var(--ink)');
          el.style.background = mix(p,'var(--success-tint)','transparent'); el.style.borderColor = mix(s,'transparent', mix(p,'var(--success)','var(--line)'));
          $(el,'i').style.transform = `scaleX(${s.toFixed(3)})`; }); });
      [[bA, pa], [bR, pr]].forEach(([b, tr]) => { const p = clamp(tr.at(t)); b.style.background = mix(p,'var(--ink)','var(--card)'); b.style.color = mix(p,'var(--card)','var(--ink)'); b.style.borderColor = mix(p,'var(--ink)','var(--line)'); });
    };
  }});

/* ================================================================ 5. Invite member */
atom({ id:'invite', cat:'Workflow', name:'Invite member', block:'InviteButton, member list', fam:['M','S','X'], tall:true,
  html:`<style>
.wfiv-cd{position:absolute;left:0;right:0;top:12px;margin:0 auto;width:min(430px,94%);text-align:left;overflow:hidden}
.wfiv-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 14px;height:52px}
.wfiv-hd b{display:block;font-size:14px;letter-spacing:-.01em}
.wfiv-hd small{display:block;font-size:12.5px;color:var(--muted)}
.wfiv-bt{position:relative;flex:none;width:78px;height:32px;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;border:1px solid var(--ink);background:var(--ink);color:var(--card);overflow:hidden;padding:0}
.wfiv-sl{position:relative;overflow:hidden;height:0}
.wfiv-ly{position:absolute;left:0;right:0;top:0}
.wfiv-fm{margin:0;padding:10px 14px 6px;display:flex;flex-direction:column;gap:6px}
.wfiv-fr{display:flex;flex-wrap:wrap;gap:8px}
.wfiv-in{flex:1 1 150px;min-width:0;height:34px;border:1.5px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);font:14px var(--sans);padding:0 11px;user-select:text;-webkit-user-select:text}
.wfiv-se{flex:none;height:34px;border:1.5px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);font:13px var(--sans);padding:0 6px}
.wfiv-hp{position:relative;height:18px;font-size:12.5px}
.wfiv-mb{display:flex;align-items:center;gap:10px;padding:8px 14px}
.wfiv-av{flex:none;width:28px;height:28px;border-radius:50%;background:var(--raised);display:grid;place-items:center;font-size:12px;font-weight:600}
.wfiv-tx{flex:1;min-width:0}
.wfiv-em{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wfiv-l2{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted)}
.wfiv-cp{position:relative;flex:none;height:20px;border-radius:999px;font-size:12px;font-weight:500;overflow:hidden}
.wfiv-ab{display:flex;gap:2px;flex:none}
.wfiv-ab .btn{border-color:transparent;background:none;padding:4px 8px;font-size:12.5px}
.wfiv-rw{display:flex;align-items:center;gap:10px;height:46px;padding:0 14px;font-size:13px}
.wfiv-rw:not(:last-child){border-bottom:1px solid var(--line-soft)}
.wfiv-rw.nolines{border-bottom-color:transparent}
.wfiv-rw b{flex:1;font-weight:500}
.wfiv-cf{display:flex;align-items:center;gap:6px;padding:6px 14px 10px;font-size:12px;color:var(--muted)}
</style>
<div class="card wfiv-cd">
 <div class="wfiv-hd"><div><b>Members</b><small>3 active</small></div><button class="wfiv-bt" type="button" aria-expanded="false"></button></div>
 <div class="wfiv-sl"><form class="wfiv-ly wfiv-fm" novalidate><div class="wfiv-fr"><input class="wfiv-in" id="wfiv-em" type="email" placeholder="name@work.com" aria-label="Email address" autocomplete="off"><select class="wfiv-se" aria-label="Role"><option>Editor</option><option>Viewer</option><option>Admin</option></select><button class="btn ink" type="submit">Send invite</button></div><div class="wfiv-hp"></div></form>
  <div class="wfiv-ly wfiv-mb"><span class="wfiv-av"></span><div class="wfiv-tx"><div class="wfiv-em"></div><div class="wfiv-l2"><span class="wfiv-cp"></span><span class="wfiv-ro"></span></div></div><div class="wfiv-ab"><button class="btn wfiv-rsd" type="button">Resend</button><button class="btn wfiv-rvk" type="button" style="color:var(--danger)">Revoke</button></div></div></div>
  <div class="wfiv-rw"><span class="wfiv-av">M</span><b>Maya Okafor</b><span class="muted">Owner</span></div>
  <div class="wfiv-rw"><span class="wfiv-av">T</span><b>Theo Lindqvist</b><span class="muted">Editor</span></div>
  <div class="wfiv-rw"><span class="wfiv-av">P</span><b>Priya Raman</b><span class="muted">Viewer</span></div>
  <div class="wfiv-cf"><span>Lines</span><button class="btn wfiv-tg" type="button" aria-pressed="true" style="padding:3px 10px;font-size:12px">On</button></div>
  <span class="wfiv-sr" role="status" aria-live="polite" style="${wfSr}"></span>
</div>`,
  desc:'Invite opens a form row at the top of the list and its height springs open. Send keeps that same row: the form swaps out for the member, the height morphs to fit and the chip reads Pending. Resend turns the chip success and Sent for 1.6 seconds, widening it on the same spring. Revoke fades the row out first, then its space collapses 100ms later. Dividers live between rows, never on the collapsing slot, so no hairline drags.',
  desc:'Invite opens a form row at the top of the list and its height springs open. Send keeps that same row: the form swaps out for the member, the height morphs to fit and the chip reads Pending. Resend turns the chip success and Sent for 1.6 seconds, widening it on the same spring. Revoke fades the row out first, then its space collapses.',
  api:'slot.h.set(form); send: slot.to("member"); slot.h.set(row)   resend: chip.to("sent"); w.set(44); after(1.6) back   revoke: slot.to("none"); slot.h.set(0, t + EXIT)',
  init(st){
    const q = wfQ(), $s = s => $(st, s);
    const bt = $s('.wfiv-bt'), sl = $s('.wfiv-sl'), form = $s('.wfiv-fm'), mb = $s('.wfiv-mb'), email = $s('.wfiv-in'), role = $s('.wfiv-se'), hp = $s('.wfiv-hp'), cp = $s('.wfiv-cp'), sr = $s('.wfiv-sr'), rsd = $s('.wfiv-rsd'), rvk = $s('.wfiv-rvk'), sub = $s('.wfiv-hd small'), tg = $s('.wfiv-tg');
    const bL = { invite:wfLayer(bt, 'Invite'), cancel:wfLayer(bt, 'Cancel') };
    const hL = { hint:wfLayer(hp, 'They get an email link that expires in 7 days.', 'justify-content:flex-start;color:var(--muted)'), bad:wfLayer(hp, 'Enter a full email address.', 'justify-content:flex-start;color:var(--danger)') };
    const cL = { p:wfLayer(cp, 'Pending'), s:wfLayer(cp, ic(I.check,12,3) + 'Sent', 'gap:3px') };
    const bsw = new Swap('invite'), hsw = new Swap('hint'), ssw = new Swap('n'), csw = new Swap('p');
    const sh = new Track(0), fm = new Track(0), dis = new Track(0), bad = new Track(0), cg = new Track(0), cw = new Track(64);
    const LY = { f:form, m:mb }; let state = 'closed', sending = false;
    const say = s => sr.textContent = s;
    const openForm = () => { state = 'form'; ssw.to('f'); fm.set(1); bsw.to('cancel'); bt.setAttribute('aria-expanded', 'true'); setTimeout(() => email.focus(), 40); };
    const closeForm = () => { state = 'closed'; ssw.to('n'); sh.set(0, S.base, now() + EXIT); fm.set(0); bsw.to('invite'); bt.setAttribute('aria-expanded', 'false'); email.value = ''; hsw.to('hint'); bad.set(0); email.removeAttribute('aria-invalid'); };
    bt.onclick = () => { if (state === 'closed') openForm(); else if (state === 'form') closeForm(); };
    email.oninput = () => { if (hsw.cur === 'bad'){ hsw.to('hint'); bad.set(0); email.removeAttribute('aria-invalid'); } };
    form.onsubmit = ev => { ev.preventDefault(); const v = email.value.trim();
      if (!/^\S+@\S+\.\S+$/.test(v)){ hsw.to('bad'); bad.set(1); email.setAttribute('aria-invalid', 'true'); email.focus(); return; }
      $s('.wfiv-mb .wfiv-av').textContent = v[0].toUpperCase(); $s('.wfiv-em').textContent = v; $s('.wfiv-ro').textContent = role.value; state = 'member'; const t0 = now();
      ssw.to('m', t0); fm.set(0); dis.set(1); bsw.to('invite'); bt.setAttribute('aria-expanded', 'false'); bt.setAttribute('aria-disabled', 'true'); sub.textContent = '3 active, 1 pending';
      wfReset(csw, 'p'); cg.jump(0); cw.jump(64); say('Invite sent to ' + v + '.'); setTimeout(() => rsd.focus({ preventScroll:true }), 40); };
    rsd.onclick = () => { if (state !== 'member' || sending) return; sending = true; const t0 = now(); csw.to('s', t0); cg.set(1, S.base, t0); cw.set(46, S.base, t0); say('Invite resent.');
      q.after(1.6, tt => { csw.to('p', tt); cg.set(0, S.base, tt); cw.set(64, S.base, tt); sending = false; }); };
    rvk.onclick = () => { if (state !== 'member') return; state = 'closed'; sending = false; q.clear(); const t0 = now(); ssw.to('n', t0); sh.set(0, S.base, t0 + EXIT); dis.set(0, S.base, t0 + EXIT); email.value = ''; bt.removeAttribute('aria-disabled'); sub.textContent = '3 active'; say('Invite revoked.'); setTimeout(() => bt.focus(), 40); };
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape' && state === 'form'){ closeForm(); bt.focus(); } });
    let lines = true; tg.onclick = () => { lines = !lines; tg.textContent = lines ? 'On' : 'Off'; tg.setAttribute('aria-pressed', lines); $$(st,'.wfiv-rw').forEach(r => r.classList.toggle('nolines', !lines)); };
    wfReset(ssw, 'n'); let first = true;
    return t => { q.run(t);
      const need = state === 'form' ? form.offsetHeight : state === 'member' ? mb.offsetHeight : 0;
      if (state !== 'closed' && Math.abs(need - sh.target) > 1) sh.set(need, S.base, now());
      sl.style.height = px(Math.max(0, sh.at(t)));
      const f = clamp(fm.at(t)); sl.style.background = mix(f,'var(--raised)','transparent');
      for (const k in LY) ssw.apply(LY[k], k, t, 4);
      for (const k in bL) bsw.apply(bL[k], k, t, 3); for (const k in hL) hsw.apply(hL[k], k, t, 3);
      email.style.borderColor = mix(clamp(bad.at(t)),'var(--danger)','var(--line)');
      const d = clamp(dis.at(t)); bt.style.opacity = (1 - .55*d).toFixed(3); bt.style.cursor = d > .5 ? 'default' : 'pointer';
      const g = clamp(cg.at(t)); cp.style.width = px(cw.at(t)); cp.style.background = mix(g,'var(--success-tint)','var(--warning-tint)'); cp.style.color = mix(g,'var(--success)','var(--warning)');
      for (const k in cL) csw.apply(cL[k], k, t, 3);
    };
  }});

/* ================================================================ 6. Reference row picker */
atom({ id:'refpicker', cat:'Workflow', name:'Reference row picker', block:'ReferenceRowPicker', fam:['X','M','E'], tall:true,
  html:`<style>
.wfrp-w{position:absolute;left:0;right:0;top:14px;margin:0 auto;width:min(390px,92%);text-align:left}
.wfrp-lb{display:block;font-size:13px;font-weight:500;margin-bottom:6px}
.wfrp-fw{position:relative;height:44px}
.wfrp-f{position:absolute;inset:0;z-index:31;border:1.5px solid var(--line);border-radius:10px;background:var(--card)}
.wfrp-tg{position:absolute;inset:0;width:100%;border:0;background:none;border-radius:9px;text-align:left;padding:0 34px 0 12px;cursor:pointer;color:var(--faint);font:14px var(--sans)}
.wfrp-ph{position:absolute;left:12px;top:0;bottom:0;display:flex;align-items:center;pointer-events:none;color:var(--faint);font-size:14px}
.wfrp-cv{position:absolute;right:11px;top:13px;color:var(--muted);pointer-events:none}
.wfrp-pop{position:absolute;left:0;right:0;top:calc(100% + 6px);padding:8px 4px 4px;visibility:hidden}
.wfrp-s{display:block;width:calc(100% - 8px);margin:0 4px 6px;height:34px;border:1.5px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);font:13.5px var(--sans);padding:0 10px;user-select:text;-webkit-user-select:text}
.wfrp-ls{position:relative;overflow-y:auto;overscroll-behavior:contain}
.wfrp-in{position:relative}
.wfrp-em{position:absolute;left:0;right:0;top:4px;height:40px;display:grid;place-items:center;font-size:13px;color:var(--muted);pointer-events:none}
.wfrp-pl{position:absolute;left:4px;right:4px;top:0;border-radius:8px;background:var(--raised);pointer-events:none;opacity:0}
.wfrp-c{position:absolute;left:0;top:0;border-radius:8px;background:var(--raised);overflow:hidden;white-space:nowrap;pointer-events:none}
.wfrp-x{border:0;background:none;color:var(--muted);cursor:pointer;display:grid;place-items:center;padding:2px;pointer-events:auto}
</style>
<div class="wfrp-w"><span class="wfrp-lb" id="wfrp-lb">Authors</span>
 <div class="wfrp-fw"><div class="wfrp-f"><button class="wfrp-tg" type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="wfrp-ls" aria-labelledby="wfrp-lb"></button><span class="wfrp-ph">Choose records</span><span class="wfrp-cv">${ic(I.chev,16)}</span></div>
  <div class="card wfrp-pop"><input class="wfrp-s" id="wfrp-s" type="search" placeholder="Search records" aria-label="Search authors" autocomplete="off"><div class="wfrp-ls" id="wfrp-ls" role="listbox" aria-label="Matching records" aria-multiselectable="true"><div class="wfrp-in"><i class="wfrp-pl"></i><div class="wfrp-em">No matching records.</div></div></div></div></div>
 <span class="wfrp-sr" role="status" aria-live="polite" style="${wfSr}"></span>
</div>`,
  desc:'The list rises from the field with a plate that follows hover and arrow keys on lagging edges. Picking a row measures its rect and the chip starts there at the row’s size and radius, then x, y, width, height and radius spring to the chip’s slot in the field while the row’s text swaps for the chip’s. The row fades out and the rows below slide up; the field grows to wrap the next chip. Removing a chip fades it, then the others slide over and the row returns to the list.',
  api:'chip.{x,y,w,h,r}.jump(rowRect).set(slot, S.soft)   face.to(chip)   row.o.set(0); rows.y.set(i·40)   field.h.set(rows)',
  init(st){
    const $s = s => $(st, s), fw = $s('.wfrp-fw'), fld = $s('.wfrp-f'), tg = $s('.wfrp-tg'), ph = $s('.wfrp-ph'), cv = $s('.wfrp-cv'), pp = $s('.wfrp-pop'), srch = $s('.wfrp-s'), ls = $s('.wfrp-ls'), inn = $s('.wfrp-in'), em = $s('.wfrp-em'), pl = $s('.wfrp-pl'), sr = $s('.wfrp-sr');
    const REC = [['Maya Okafor','/people/maya-okafor'],['Theo Lindqvist','/people/theo-lindqvist'],['Priya Raman','/people/priya-raman'],['Ben Alvarez','/people/ben-alvarez'],['Sofia Marin','/people/sofia-marin']];
    const PITCH = 40, MAXV = 4, CH = 28, GAP = 6;
    const po = new Track(0), op = new Track(0), fh = new Track(44), lh = new Track(PITCH*MAXV + 8), ih = new Track(PITCH*REC.length + 8), emo = new Track(0), pho = new Track(1), plo = new Track(0), ple = edges(0,0);
    let isOpen = false, chips = [], lastW = 0;
    const recs = REC.map(([n,p],i) => { const b = wfEl('button', 'position:absolute;left:4px;right:4px;top:0;height:36px;border:0;border-radius:8px;background:none;text-align:left;padding:3px 10px;cursor:pointer;display:flex;flex-direction:column;justify-content:center;min-width:0;color:var(--ink)');
      b.type = 'button'; b.setAttribute('role', 'option'); b.setAttribute('aria-selected', 'false'); b.tabIndex = -1;
      b.innerHTML = '<span style="font-size:13px;font-weight:500;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></span><span style="font-size:11.5px;line-height:14px;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></span>';
      b.firstChild.textContent = n; b.lastChild.textContent = p; inn.appendChild(b);
      const r = { n, p, b, y:new Track(4 + i*PITCH), o:new Track(1), vis:true, sel:false };
      b.onclick = () => pick(r); b.onpointerenter = b.onfocus = () => { const y = r.y.target; ple.go(y, y + 36); plo.set(1); };
      b.onkeydown = ev => { const v = vrows(), i = v.indexOf(r); let n_ = -2;
        if (ev.key === 'ArrowDown') n_ = Math.min(i + 1, v.length - 1); else if (ev.key === 'ArrowUp') n_ = i - 1; else if (ev.key === 'Home') n_ = 0; else if (ev.key === 'End') n_ = v.length - 1; else return;
        ev.preventDefault(); if (n_ < 0) srch.focus(); else v[n_].b.focus(); };
      return r; });
    const vrows = () => recs.filter(r => r.vis);
    ls.addEventListener('pointerleave', () => plo.set(0));
    const relist = (t = now()) => { const qy = srch.value.trim().toLowerCase(); let idx = 0;
      recs.forEach(r => { const show = !r.sel && (!qy || (r.n + ' ' + r.p).toLowerCase().includes(qy));
        if (show){ const y = 4 + idx*PITCH; if (!r.vis){ r.y.jump(y); r.o.set(1, S.base, t + .08); } else r.y.set(y); idx++; }
        else if (r.vis) r.o.set(0, S.snap, t);
        r.vis = show; r.b.setAttribute('aria-selected', 'false'); });
      vrows().forEach((r,i) => r.b.tabIndex = i === 0 ? 0 : -1);
      lh.set(Math.max(1, Math.min(idx, MAXV))*PITCH + 8); ih.set(Math.max(1, idx)*PITCH + 8); emo.set(idx ? 0 : 1); };
    const setOpen = v => { if (v === isOpen) return; isOpen = v; openSet(po, v); openSet(op, v); tg.setAttribute('aria-expanded', v);
      if (v){ srch.value = ''; relist(); setTimeout(() => srch.focus(), 30); } else plo.set(0); };
    tg.onclick = () => setOpen(!isOpen);
    outside(st, [fw], () => setOpen(false));
    fw.addEventListener('focusout', ev => { if (isOpen && ev.relatedTarget && !fw.contains(ev.relatedTarget)) setOpen(false); });
    srch.oninput = () => relist();
    srch.onkeydown = ev => { const v = vrows(); if (ev.key === 'ArrowDown' && v.length){ ev.preventDefault(); v[0].b.focus(); } else if (ev.key === 'Enter' && v.length){ ev.preventDefault(); pick(v[0]); } };
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape' && isOpen){ ev.preventDefault(); setOpen(false); tg.focus(); } });
    // chips: absolute, so each one springs between slots
    const layout = (t = now()) => { const live = chips.filter(c => !c.gone), inner = fld.clientWidth - 34; let x = 8, row = 0;
      live.forEach(c => { if (x > 8 && x + c.W > inner){ x = 8; row++; } c.sx = x; c.sy = 6.5 + row*(CH + GAP); x += c.W + 6; });
      fh.set(44 + (live.length ? row : 0)*(CH + GAP), S.base, t); pho.set(live.length ? 0 : 1, live.length ? S.snap : S.base, t);
      live.forEach(c => { c.x.set(c.sx, S.soft, t); c.y.set(c.sy, S.soft, t); c.w.set(c.W, S.soft, t); c.h.set(CH, S.soft, t); c.r.set(14, S.soft, t); }); };
    const pick = rec => { if (rec.sel) return; const t0 = now(), fr = fld.getBoundingClientRect(), rr = rec.b.getBoundingClientRect(), v = vrows(), idx = v.indexOf(rec);
      const start = { x:rr.left - fr.left - 1.5, y:rr.top - fr.top - 1.5, w:rr.width, h:rr.height };
      rec.sel = true; plo.set(0); relist(t0);
      const c = wfEl('span', '', ''); c.className = 'wfrp-c';
      c.innerHTML = '<span class="rf" style="position:absolute;left:10px;top:3px;right:6px;display:flex;flex-direction:column"><span style="font-size:13px;font-weight:500;line-height:16px;color:var(--ink)"></span><span style="font-size:11.5px;line-height:14px;color:var(--faint)"></span></span><span class="ci" style="position:absolute;left:0;top:0;height:100%;display:flex;align-items:center;gap:4px;padding:0 5px 0 10px;font-size:13px;font-weight:500;color:var(--ink)"><span></span><button class="wfrp-x" type="button" tabindex="-1"></button></span>';
      $(c,'.rf').firstChild.textContent = rec.n; $(c,'.rf').lastChild.textContent = rec.p; $(c,'.ci').firstChild.textContent = rec.n; const xb = $(c,'.wfrp-x'); xb.innerHTML = ic(I.x,12,2.5); xb.setAttribute('aria-label', 'Remove ' + rec.n);
      fld.appendChild(c);
      const ch = { rec, c, rf:$(c,'.rf'), ci:$(c,'.ci'), xb, W:$(c,'.ci').offsetWidth, gone:false, x:new Track(start.x), y:new Track(start.y), w:new Track(start.w), h:new Track(start.h), r:new Track(8), cp:new Track(0), o:new Track(1) };
      ch.x.jump(start.x); ch.y.jump(start.y); ch.w.jump(start.w); ch.h.jump(start.h); ch.r.jump(8); ch.cp.set(1, S.base, t0 + .04);
      xb.onclick = ev => { ev.stopPropagation(); unpick(ch); }; chips.push(ch); layout(t0);
      sr.textContent = rec.n + ' added.';
      const nv = vrows(), nx = nv[Math.min(idx, nv.length - 1)]; if (nx) nx.b.focus({ preventScroll:true }); else srch.focus(); };
    const unpick = ch => { if (ch.gone) return; ch.gone = true; const t0 = now(); ch.gotAt = t0; ch.o.set(0, S.snap, t0); ch.rec.sel = false; layout(t0 + EXIT); relist(t0 + EXIT); sr.textContent = ch.rec.n + ' removed.'; tg.focus(); };
    layout(); relist(); lh.jump(lh.target); ih.jump(ih.target);
    return t => {
      const w = fld.clientWidth; if (w !== lastW){ if (lastW) layout(); lastW = w; }
      const p = clamp(po.at(t)); pop(pp, p, -4); const o = clamp(op.at(t)); fld.style.borderColor = mix(o,'var(--ink)','var(--line)'); cv.style.transform = `rotate(${(o*180).toFixed(1)}deg)`;
      fw.style.height = px(fh.at(t)); ls.style.height = px(lh.at(t)); inn.style.height = px(ih.at(t)); fade(em, emo.at(t), null); fade(ph, pho.at(t), null);
      recs.forEach(r => { const q = clamp(r.o.at(t)); r.b.style.transform = `translateY(${px(r.y.at(t))})`; r.b.style.opacity = q.toFixed(3); r.b.style.visibility = q < .01 ? 'hidden' : 'visible'; r.b.style.pointerEvents = r.vis && q > .5 ? 'auto' : 'none'; });
      const a = ple.A.at(t), b = ple.B.at(t); plate(pl, a, b); pl.style.opacity = clamp(plo.at(t)).toFixed(3);
      chips = chips.filter(c => { if (c.gone && t - c.gotAt > .5 && c.o.at(t) < .01){ c.c.remove(); return false; } return true; });
      chips.forEach(c => { const cp_ = clamp(c.cp.at(t));
        c.c.style.transform = `translate(${px(c.x.at(t))},${px(c.y.at(t))})`; c.c.style.width = px(Math.max(0, c.w.at(t))); c.c.style.height = px(Math.max(0, c.h.at(t))); c.c.style.borderRadius = px(c.r.at(t)); c.c.style.opacity = clamp(c.o.at(t)).toFixed(3);
        fade(c.rf, 1 - cp_*2, null); c.rf.style.visibility = cp_ > .5 ? 'hidden' : 'visible'; fade(c.ci, cp_*2 - 1, null); c.ci.style.visibility = cp_ < .5 ? 'hidden' : 'visible'; c.xb.style.pointerEvents = cp_ > .9 && !c.gone ? 'auto' : 'none'; });
    };
  }});
})();