

(() => {
/* ---------- Admin kit: ten small admin primitives, each mirroring a real component ---------- */
const CAT = 'Admin kit';
const tx = (el, s) => { el.textContent = s; return el; };
const ELI = 'font-style:normal';
const TONE = { good:'var(--success)', warn:'var(--warning)', bad:'var(--danger)', idle:'var(--muted)' };
// icons that the shared I table does not carry
const J = {
  play:'<path d="M8 5v14l11-7z"/>', stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',
  monitor:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  tablet:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M11 18h2"/>',
  phone:'<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  left:'<path d="m15 6-6 6 6 6"/>', right:'<path d="m9 6 6 6-6 6"/>'
};
// timed events: [time, fn(time)] sorted, drained at the top of render
const drain = (q, t) => { while (q.length && q[0][0] <= t){ const [tt, fn] = q.shift(); fn(tt); } };
const later = (q, tt, fn) => { q.push([tt, fn]); q.sort((a, b) => a[0] - b[0]); };

/* ================================================================ 1. Side detail sheet */
atom({ id:'sidesheet', cat:CAT, name:'Side detail sheet', block:'DetailSheet', fam:['X','D','S'], wide:true, tall:true,
  html:`<style>
.ss{position:absolute;inset:0;overflow:hidden;isolation:isolate;container-type:inline-size;text-align:left;font-size:13px}
.ss-ls{position:absolute;left:12px;right:12px;top:10px}
.ss-hd,.ss-rw{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1.3fr) minmax(0,1fr) 98px;gap:12px;align-items:center;padding:0 12px}
.ss-hd{height:26px;font-size:12px;font-weight:500;color:var(--faint)}
.ss-rw{position:relative;width:100%;height:40px;border:0;border-radius:10px;background:none;color:var(--ink);font:inherit;text-align:left;cursor:pointer}
.ss-rw>*{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ss-rw b{font-weight:500}
.ss-st{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500}
.ss-st i{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
.ss-sc{position:absolute;inset:0;background:#0C1016;opacity:0;pointer-events:none;z-index:4}
.ss-sh{position:absolute;top:0;right:0;bottom:0;width:min(380px,100%);z-index:5;display:flex;background:var(--card);border-left:1px solid var(--line);box-shadow:var(--shadow);visibility:hidden;touch-action:pan-y}
.ss-gr{flex:none;width:18px;display:grid;place-items:center;cursor:grab}
.ss-gr i{width:4px;height:36px;border-radius:2px;background:var(--line)}
.ss-mn{flex:1;min-width:0;display:flex;flex-direction:column}
.ss-tb{flex:none;display:flex;align-items:center;justify-content:space-between;height:44px;padding-right:10px;color:var(--faint);font-size:12px;font-weight:500}
.ss-x{width:28px;height:28px;border:0;border-radius:8px;background:none;display:grid;place-items:center;cursor:pointer;color:var(--muted)}
.ss-x:hover{background:var(--raised);color:var(--ink)}
.ss-lw{position:relative;flex:1;min-height:0}
.ss-ly{position:absolute;inset:0;padding:0 16px 14px 0;display:flex;flex-direction:column;gap:8px;overflow:hidden}
.ss-ly h4{margin:0;font-size:17px;line-height:22px;letter-spacing:-.015em;font-weight:600}
.ss-ly p{margin:0}
.ss-nt{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ss-dl{display:grid;grid-template-columns:70px minmax(0,1fr);gap:4px 10px;margin:4px 0 0}
.ss-dl dt{color:var(--faint)}
.ss-dl dd{margin:0}
.ss-ft{display:flex;gap:8px;margin-top:auto}
@container (max-width:560px){.ss-hd,.ss-rw{grid-template-columns:minmax(0,1fr) 98px}.ss-c2,.ss-c3{display:none}}
</style><div class="ss"><div class="ss-ls"><div class="ss-hd" aria-hidden="true"><span>Guest</span><span class="ss-c2">Service</span><span class="ss-c3">When</span><span>Status</span></div></div><div class="ss-sc"></div>
<div class="ss-sh" role="dialog" aria-label="Booking details"><div class="ss-gr" aria-hidden="true"><i></i></div><div class="ss-mn"><div class="ss-tb"><span>Booking details</span><button type="button" class="ss-x" aria-label="Close details">${ic(I.x,16)}</button></div><div class="ss-lw"></div></div></div>
<div class="hint">Click a row, then another. Drag the sheet right to dismiss.</div></div>`,
  desc:'A row click dims the list and slides the sheet in from the right on the base spring. The rows behind stay live, so picking another row swaps the sheet content (exit, then enter) without sliding again. Drag the sheet right 1:1 with a rubber band on the left; release past 35% or with a fast flick and it leaves from that velocity, otherwise it settles back. Escape, the close button or an outside click close it and focus returns to the row.',
  api:'x.set(0, S.base)   swap.to(row)   release: x.release(x, vx/W, x > .35 || vx > 500 ? 1 : 0)   focus(opener)',
  init(st){
    const B = [
      { n:'Maya Okafor', s:'Brand strategy call', w:'Mon 12 Oct · 10:30', len:'60 min', loc:'Video call', pr:'$180.00', st:'Confirmed', tn:'good', note:'Wants to review the new pricing page before launch. Sent the brand guide on Friday.' },
      { n:'Theo Lindqvist', s:'Site audit', w:'Tue 13 Oct · 14:00', len:'90 min', loc:'Studio, Lisbon', pr:'$320.00', st:'Pending', tn:'warn', note:'Deposit not yet received. Hold the slot until Wednesday noon, then release it.' },
      { n:'Priya Raman', s:'Onboarding workshop', w:'Wed 14 Oct · 09:00', len:'2 hr', loc:'Video call', pr:'$450.00', st:'Confirmed', tn:'good', note:'Six people from the events team attend. Needs the shared workspace set up beforehand.' },
      { n:'Jonas Weber', s:'Content review', w:'Thu 15 Oct · 16:15', len:'45 min', loc:'Phone', pr:'$95.00', st:'Cancelled', tn:'bad', note:'Cancelled on Monday because of a travel clash. Offered two new times by email.' },
      { n:'Amara Nwosu', s:'Follow-up session', w:'Fri 16 Oct · 11:00', len:'30 min', loc:'Video call', pr:'$60.00', st:'Confirmed', tn:'good', note:'Second session after the launch. Bring the analytics export from the first month.' }
    ];
    const root = $(st,'.ss'), list = $(st,'.ss-ls'), sheet = $(st,'.ss-sh'), scrim = $(st,'.ss-sc'), xb = $(st,'.ss-x'), lw = $(st,'.ss-lw');
    const rows = B.map((b, i) => { const r = document.createElement('button'); r.type = 'button'; r.className = 'ss-rw'; r.setAttribute('aria-haspopup', 'dialog');
      r.innerHTML = `<b></b><span class="ss-c2 muted"></span><span class="ss-c3 muted num"></span><span class="ss-st"><i></i><em style="${ELI}"></em></span>`;
      tx(r.children[0], b.n); tx(r.children[1], b.s); tx(r.children[2], b.w); r.children[3].style.color = TONE[b.tn]; tx(r.children[3].lastChild, b.st);
      list.appendChild(r); return r; });
    const layers = B.map(b => { const d = document.createElement('div'); d.className = 'ss-ly';
      d.innerHTML = `<h4></h4><p class="muted"></p><dl class="ss-dl"><dt>When</dt><dd></dd><dt>Length</dt><dd></dd><dt>Where</dt><dd></dd><dt>Price</dt><dd class="num"></dd></dl><p class="small ss-nt"></p><div class="ss-ft"><button type="button" class="btn ink">View full booking</button><button type="button" class="btn">Reschedule</button></div>`;
      tx($(d,'h4'), b.n); tx($(d,'p'), b.s); const dd = $$(d,'dd'); tx(dd[0], b.w); tx(dd[1], b.len); tx(dd[2], b.loc); tx(dd[3], b.pr); tx($(d,'.ss-nt'), b.note);
      lw.appendChild(d); return d; });
    const x = new Track(1), sw = new Swap(-1), tr = rows.map(() => ({ sel:new Track(0), hov:new Track(0) }));
    let open = false, cur = -1, opener = null, held = false, hx = 1, dg = null, samples = [], sup = false;
    const W = () => sheet.offsetWidth || 1;
    rows.forEach((r, i) => { r.onpointerenter = () => tr[i].hov.set(1, S.snap); r.onpointerleave = () => tr[i].hov.set(0, S.snap);
      r.onclick = () => show(i, r); });
    const mark = i => { rows.forEach((r, j) => { tr[j].sel.set(j === i ? 1 : 0); j === i ? r.setAttribute('aria-current', 'true') : r.removeAttribute('aria-current'); }); };
    function show(i, el){
      opener = el;
      if (!open){ open = true; cur = i; sw.cur = i; sw.prev = null; sw.t = -9; x.set(0, S.base); sheet.style.visibility = 'visible'; xb.focus({ preventScroll:true }); }
      else if (i !== cur){ cur = i; sw.to(i); }
      sheet.setAttribute('aria-label', 'Booking details for ' + B[i].n); mark(i);
    }
    function close(fromDrag){
      if (!open) return; open = false; if (!fromDrag) x.set(1, S.snap); mark(-1);
      if (opener) opener.focus({ preventScroll:true });
    }
    xb.onclick = () => close();
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && open){ e.preventDefault(); close(); } });
    root.addEventListener('pointerdown', e => { sup = false; if (open && !e.target.closest('.ss-rw,.ss-sh')) close(); });
    // drag the sheet itself, but only once the pointer has really moved sideways, so buttons inside still click
    sheet.addEventListener('pointerdown', e => { if (e.button || !open || e.target.closest('button,input,select,textarea,a')) return; dg = { id:e.pointerId, x0:e.clientX, y0:e.clientY, on:false, base:0 }; samples = [{ t:now(), cx:e.clientX }]; });
    sheet.addEventListener('pointermove', e => { if (!dg || e.pointerId !== dg.id) return; const dx = e.clientX - dg.x0, dy = e.clientY - dg.y0;
      if (!dg.on){ if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return; dg.on = true; dg.x0 = e.clientX; dg.base = x.at() * W(); sheet.setPointerCapture(e.pointerId); held = true; samples = [{ t:now(), cx:e.clientX }]; hx = x.at(); return; }
      samples.push({ t:now(), cx:e.clientX }); if (samples.length > 6) samples.shift();
      const v = dg.base + (e.clientX - dg.x0); hx = (v < 0 ? rb(v, 28) : v) / W(); });
    const end = e => { if (!dg || e.pointerId !== dg.id) return; const was = dg.on; dg = null; if (!was) return;
      held = false; sup = true; const a = samples[0], b = samples[samples.length - 1], v = (b.cx - a.cx)/Math.max(1e-3, b.t - a.t), w = W();
      const away = hx > .35 || (v > 500 && hx > .02);
      x.release(hx, v/w, away ? 1 : 0, S.base); if (away) close(true); };
    sheet.addEventListener('pointerup', end); sheet.addEventListener('pointercancel', end);
    sheet.addEventListener('click', e => { if (sup){ e.stopPropagation(); e.preventDefault(); sup = false; } }, true);
    return t => {
      const v = held ? hx : x.at(t), w = W();
      sheet.style.visibility = open || held || v < .995 ? 'visible' : 'hidden';
      sheet.style.transform = `translateX(${px(v*w)})`;
      scrim.style.opacity = (clamp(1 - v)*.32).toFixed(3);
      layers.forEach((l, k) => sw.apply(l, k, t, 4));
      rows.forEach((r, i) => { r.style.background = mix(tr[i].sel.at(t), 'var(--accent-tint)', mix(tr[i].hov.at(t), 'var(--raised)', 'transparent')); });
    };
  }});

/* ================================================================ 2. Segmented control */
atom({ id:'seg', cat:CAT, name:'Segmented control', block:'Seg · useEdgeIndicator', fam:['E','M'],
  html:`<style>
.sg-w{width:min(360px,92%);display:flex;flex-direction:column;gap:16px}
.sg-l{display:flex;flex-direction:column;gap:6px}
.sg{position:relative;isolation:isolate;display:flex;gap:2px;background:var(--raised);border:1px solid transparent;border-radius:999px;padding:3px}
.sg.sm{display:inline-flex;align-self:flex-start;padding:2px}
.sg button{position:relative;z-index:1;flex:1;border:0;background:none;border-radius:999px;padding:6px 14px;font-size:13px;font-weight:500;text-align:center;cursor:pointer;white-space:nowrap;color:var(--muted)}
.sg.sm button{padding:3px 10px;font-size:12px}
.sg-i{position:absolute;z-index:0;left:var(--ind-left,0);right:var(--ind-right,100%);top:var(--ind-top,0);height:var(--ind-height,0);border-radius:999px;background:var(--card);box-shadow:var(--shadow);opacity:0;pointer-events:none}
.sg[data-ind="ready"] .sg-i{opacity:1}
.sg-ro{font:11.5px/1.4 var(--mono);color:var(--faint);min-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
</style><div class="sg-w">
<div class="sg-l"><span class="small muted" id="sg-a">File source</span><div class="sg" role="group" aria-labelledby="sg-a"><div class="sg-i"></div><button type="button">Upload</button><button type="button">Link</button><button type="button">Media library</button></div></div>
<div class="sg-l"><span class="small muted" id="sg-b">Range</span><div class="sg sm" role="group" aria-labelledby="sg-b"><div class="sg-i"></div><button type="button">Day</button><button type="button">Week</button><button type="button">Month</button><button type="button">Year</button></div></div>
<div class="sg-l"><span class="small muted" id="sg-c">Show grid</span><div class="sg sm" role="group" aria-labelledby="sg-c"><div class="sg-i"></div><button type="button">Off</button><button type="button">On</button></div></div>
<div class="sg-ro" aria-hidden="true"></div></div>`,
  desc:'A measured two-edge indicator, same rules as Studio’s useEdgeIndicator: the active button’s box becomes left and right-inset variables, and data-ind-dir records which way it moved. The leading edge goes now, the trailing edge follows 60ms later, so it stretches then settles. Label colour morphs, arrow keys, Home and End move the selection, and there are two sizes.',
  api:'left = btn.offsetLeft; right = W − left − btn.offsetWidth   dir = left > last ? "fwd" : "back"   lead.set(v); trail.set(v, t + LAG)',
  init(st){
    const kit = (el, start) => {
      const ind = $(el,'.sg-i'), btns = $$(el,'button'), N = btns.length; let cur = start, last = null, ready = false, top = 0, ht = 0;
      const L = new Track(0), R = new Track(0), c = btns.map((_, i) => new Track(i === cur ? 1 : 0));
      const tab = () => btns.forEach((b, i) => { b.setAttribute('aria-pressed', i === cur); b.tabIndex = i === cur ? 0 : -1; });
      // the hook's measure(): write the active box, flag direction, then let the edges chase it
      const measure = inst => {
        const b = btns[cur]; if (!el.clientWidth) return;
        const left = b.offsetLeft, right = el.clientWidth - left - b.offsetWidth; top = b.offsetTop; ht = b.offsetHeight;
        if (last !== null && left !== last) el.setAttribute('data-ind-dir', left > last ? 'fwd' : 'back');
        last = left;
        if (inst || !ready){ L.jump(left); R.jump(right); } else {
          const fwd = el.getAttribute('data-ind-dir') === 'fwd', t0 = now();
          (fwd ? R : L).set(fwd ? right : left, S.base, t0); (fwd ? L : R).set(fwd ? left : right, S.base, t0 + LAG);
        }
        if (!ready){ ready = true; el.setAttribute('data-ind', 'ready'); }
      };
      const pick = i => { if (i === cur) return; cur = i; tab(); c.forEach((x, j) => x.set(j === i ? 1 : 0)); measure(false); };
      btns.forEach((b, i) => b.onclick = () => pick(i));
      el.addEventListener('keydown', e => { const k = e.key; let n = cur;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = (cur + 1) % N; else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (cur + N - 1) % N; else if (k === 'Home') n = 0; else if (k === 'End') n = N - 1; else return;
        e.preventDefault(); pick(n); btns[n].focus(); });
      tab(); new ResizeObserver(() => measure(true)).observe(el); document.fonts.ready.then(() => measure(true)); measure(true);
      return { el, render(t){
        const l = L.at(t), r = R.at(t);
        el.style.setProperty('--ind-left', px(l)); el.style.setProperty('--ind-right', px(r)); el.style.setProperty('--ind-top', px(top)); el.style.setProperty('--ind-height', px(ht));
        c.forEach((x, i) => btns[i].style.color = mix(x.at(t), 'var(--ink)', 'var(--muted)')); return [l, r]; } };
    };
    const ks = $$(st,'.sg').map((e, i) => kit(e, [0, 1, 0][i])), ro = $(st,'.sg-ro'); let prev = '';
    return t => { ks.forEach((k, i) => { const v = k.render(t); if (i === 0){ const s = `data-ind-dir="${k.el.getAttribute('data-ind-dir') || '-'}"  --ind-left ${v[0].toFixed(0)}px  --ind-right ${v[1].toFixed(0)}px`; if (s !== prev){ ro.textContent = s; prev = s; } } }); };
  }});

/* ================================================================ 3. Status chip */
atom({ id:'statuschip', cat:CAT, name:'Status chip', block:'StatusChip', fam:['M','S'],
  html:`<style>
.sc-c{width:min(440px,92%);padding:2px 14px}
.sc-r{display:flex;align-items:center;justify-content:space-between;gap:12px;height:52px}
.sc-r+.sc-r{border-top:1px solid var(--line-soft)}
.sc-nm{min-width:0;display:flex;flex-direction:column;line-height:1.3}
.sc-nm b{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sc-cl{flex:none;display:flex;align-items:center}
.sc-rw{overflow:hidden;flex:none}
.sc-rt{display:block;width:max-content;margin-right:8px;white-space:nowrap}
.sc-ch{position:relative;flex:none;height:26px;border:0;border-radius:999px;padding:0;overflow:hidden;cursor:pointer;font-size:12px;font-weight:500}
.sc-ch>i{position:absolute;left:10px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%}
.sc-l{position:absolute;left:22px;top:0;bottom:0;display:flex;align-items:center;white-space:nowrap}
.sc-ms{position:absolute;visibility:hidden;white-space:nowrap;font-size:12px;font-weight:500}
.sc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
</style><div class="card sc-c"></div><div class="hint">Click a chip to cycle. On Error, Retry goes back through Scheduled to Live.</div>`,
  desc:'One chip morphs through Draft, Scheduled, Live and Error: the background and dot colours cross-fade through weighted state colours, the label swaps (exit, then enter) and the chip width springs to the measured new label. Error grows a Retry button to its left, so the chip itself never moves; Retry goes to Scheduled and, a moment later, Live.',
  api:'w[i].set(i === next ? 1 : 0)   width.set(measure(label))   label.to(next)   retry.set(next === error)',
  init(st){
    const ST = [
      { l:'Draft', fg:'var(--muted)', bg:'var(--raised)' }, { l:'Scheduled', fg:'var(--warning)', bg:'var(--warning-tint)' },
      { l:'Live', fg:'var(--success)', bg:'var(--success-tint)' }, { l:'Error', fg:'var(--danger)', bg:'var(--danger-tint)' }
    ];
    const blend = (w, key) => { let acc = null, tot = 0;
      w.forEach((v, i) => { if (v <= .001) return; if (acc === null){ acc = ST[i][key]; tot = v; } else { tot += v; acc = `color-mix(in oklab, ${ST[i][key]} ${(v/tot*100).toFixed(1)}%, ${acc})`; } });
      return acc || ST[0][key]; };
    const host = $(st,'.sc-c'), probe = document.createElement('span'); probe.className = 'sc-ms'; st.appendChild(probe);
    const nat = ST.map(s => { tx(probe, s.l); return probe.offsetWidth; });
    const re = () => { ST.forEach((s, i) => { tx(probe, s.l); nat[i] = probe.offsetWidth; }); };
    const rows = [['Spring launch', 'Page · edited 2 min ago', 2], ['About us', 'Page · edited yesterday', 1], ['Pricing v2', 'Page · publish failed at 09:14', 3]].map(([n, sub, s0]) => {
      const r = document.createElement('div'); r.className = 'sc-r';
      r.innerHTML = `<div class="sc-nm"><b></b><span class="small muted"></span></div><div class="sc-cl"><div class="sc-rw"><button type="button" class="btn sc-rt">Retry</button></div><button type="button" class="sc-ch"><i></i></button></div><span class="sc-sr" role="status"></span>`;
      tx($(r,'b'), n); tx($(r,'.small'), sub); host.appendChild(r);
      const chip = $(r,'.sc-ch'), dot = $(chip,'i'), rw = $(r,'.sc-rw'), rt = $(r,'.sc-rt'), live = $(r,'.sc-sr');
      const layers = ST.map(s => { const l = document.createElement('span'); l.className = 'sc-l'; l.textContent = s.l; chip.appendChild(l); return l; });
      const o = { n, r, chip, dot, rw, rt, live, layers, cur:s0, tok:0, q:[], w:ST.map((_, i) => new Track(i === s0 ? 1 : 0)), wd:new Track(0), rs:new Track(s0 === 3 ? 1 : 0), sw:new Swap(s0), rn:0 };
      return o; });
    const say = o => { const a = `${o.n} status: ${ST[o.cur].l}`; o.chip.setAttribute('aria-label', `${ST[o.cur].l}. Change status`); o.live.textContent = a; };
    const go = (o, i, t = now()) => { o.cur = i; o.w.forEach((x, j) => x.set(j === i ? 1 : 0, S.base, t)); o.wd.set(32 + nat[i], S.base, t); o.sw.to(i, t); o.rs.set(i === 3 ? 1 : 0, S.base, t); say(o); };
    const fit = () => rows.forEach(o => { o.wd.jump(32 + nat[o.cur]); o.rn = o.rt.offsetWidth + 8; });
    rows.forEach(o => { o.chip.onclick = () => { o.tok++; go(o, (o.cur + 1) % 4); };
      o.rt.onclick = () => { const k = ++o.tok; go(o, 1); later(o.q, now() + 1.4, tt => { if (o.tok === k && o.cur === 1) go(o, 2, tt); }); }; o.live.textContent = ''; o.chip.setAttribute('aria-label', `${ST[o.cur].l}. Change status`); });
    const measure = () => { re(); fit(); }; document.fonts.ready.then(measure); measure();
    return t => rows.forEach(o => {
      drain(o.q, t);
      const w = o.w.map(x => clamp(x.at(t)));
      o.chip.style.width = px(o.wd.at(t)); o.chip.style.background = blend(w, 'bg'); o.dot.style.background = blend(w, 'fg'); o.chip.style.color = blend(w, 'fg');
      o.layers.forEach((l, k) => o.sw.apply(l, k, t, 4));
      const p = clamp(o.rs.at(t)); o.rw.style.width = px(p*o.rn); o.rt.style.opacity = p.toFixed(3); o.rt.style.filter = p < .98 ? `blur(${((1 - p)*BLUR).toFixed(2)}px)` : 'none'; o.rw.style.visibility = p < .01 ? 'hidden' : 'visible';
    });
  }});

/* ================================================================ 4. Scroll-fade row */
atom({ id:'scrollfade', cat:CAT, name:'Scroll-fade row', block:'ScrollFadeRow', fam:['E','X'],
  html:`<style>
.sf-w{width:min(460px,94%);display:flex;flex-direction:column;gap:12px}
.sf-row{display:flex;overflow-x:auto;scrollbar-width:none;min-width:0;padding:4px 3px;--fade-start:0px;--fade-end:0px;-webkit-mask-image:linear-gradient(to right,transparent,#000 var(--fade-start),#000 calc(100% - var(--fade-end)),transparent);mask-image:linear-gradient(to right,transparent,#000 var(--fade-start),#000 calc(100% - var(--fade-end)),transparent)}
.sf-row::-webkit-scrollbar{display:none}
.sf-c1{flex:none;padding-right:6px}
.sf-c{display:block;width:max-content;border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;background:var(--card);color:var(--ink)}
.sf-c:focus-visible{outline-offset:1px}
.sf-ar{width:30px;height:30px;padding:0;display:grid;place-items:center}
.sf-ar:disabled{opacity:.4;cursor:default}
.sf-ro{font:11.5px/1.4 var(--mono);display:flex;gap:14px}
</style><div class="sf-w"><div class="sf-row" role="group" aria-label="Page filters"></div>
<div class="row" style="justify-content:space-between"><div class="seg sf-sg" role="group" aria-label="Number of chips"><div class="ind"></div><button type="button">4 chips</button><button type="button">11 chips</button></div><div class="row" style="gap:6px"><button type="button" class="btn sf-ar sf-pv" aria-label="Scroll filters left">${ic(J.left,16)}</button><button type="button" class="btn sf-ar sf-nx" aria-label="Scroll filters right">${ic(J.right,16)}</button></div></div>
<div class="sf-ro" aria-hidden="true"><span class="sf-a">data-fade-start</span><span class="sf-b">data-fade-end</span></div></div>`,
  desc:'The row keeps real scroll position, and each frame it asks whether there is content beyond either edge. Only then does that edge’s fade mask grow in, on a spring, and it shrinks away as you reach the end. With four chips nothing overflows, so no mask exists; switch to eleven and the end mask arrives, then the start mask once you scroll. The arrows scroll on the same spring.',
  api:'start = scrollable && scrollLeft > 0   end = scrollable && scrollLeft + W < scrollWidth − 1   --fade-start.set(start ? 28 : 0)',
  init(st){
    const row = $(st,'.sf-row'), pv = $(st,'.sf-pv'), nx = $(st,'.sf-nx'), ta = $(st,'.sf-a'), tb = $(st,'.sf-b');
    const L = ['All', 'Published', 'Drafts', 'Mine', 'Scheduled', 'Needs review', 'Archived', 'Shared with me', 'Has comments', 'Last 30 days', 'Flagged'];
    const chips = L.map((l, i) => { const w = document.createElement('span'); w.className = 'sf-c1'; const b = document.createElement('button'); b.type = 'button'; b.className = 'sf-c'; b.textContent = l; w.appendChild(b); row.appendChild(w);
      const o = { w, b, on:new Track(i === 0 ? 1 : 0), vis:new Track(i < 4 ? 1 : 0) }; b.setAttribute('aria-pressed', i === 0); b.onclick = () => { chips.forEach((x, j) => { x.on.set(j === i ? 1 : 0); x.b.setAttribute('aria-pressed', j === i); }); }; return o; });
    const fs = new Track(0), fe = new Track(0), sc = new Track(0); let ws = false, we = false, auto = false, tgt = 0, many = false;
    const cancel = () => { auto = false; }; ['wheel', 'pointerdown', 'touchstart', 'keydown'].forEach(n => row.addEventListener(n, cancel, { passive:true }));
    const by = d => { const max = row.scrollWidth - row.clientWidth; tgt = clamp((auto ? tgt : row.scrollLeft) + d, 0, Math.max(0, max)); sc.jump(row.scrollLeft); sc.set(tgt); auto = true; };
    pv.onclick = () => by(-150); nx.onclick = () => by(150);
    const segEl = $(st,'.sf-sg'), segI = $(segEl,'.ind'), sb = $$(segEl,'button'), e = edges(0, 0);
    const place = inst => { const b = sb[many ? 1 : 0]; sb.forEach(x => x.setAttribute('aria-pressed', x === b)); const l = b.offsetLeft, r = l + b.offsetWidth; inst ? e.jump(l, r) : e.go(l, r); };
    sb.forEach((b, i) => b.onclick = () => { many = i === 1; place(false); chips.forEach((c, k) => c.vis.set(many || k < 4 ? 1 : 0, S.base, now() + (many ? Math.max(0, k - 4) : Math.max(0, 10 - k))*.03)); });
    document.fonts.ready.then(() => place(true)); place(true);
    return t => {
      const scr = row.scrollWidth > row.clientWidth + 1, s = scr && row.scrollLeft > 0, en = scr && row.scrollLeft + row.clientWidth < row.scrollWidth - 1;
      if (s !== ws){ ws = s; fs.set(s ? 28 : 0); row.toggleAttribute('data-fade-start', s); }
      if (en !== we){ we = en; fe.set(en ? 28 : 0); row.toggleAttribute('data-fade-end', en); }
      if (auto){ row.scrollLeft = sc.at(t); if (Math.abs(sc.at(t) - tgt) < .5 && Math.abs(row.scrollLeft - tgt) < 1) auto = false; }
      row.style.setProperty('--fade-start', px(Math.max(0, fs.at(t)))); row.style.setProperty('--fade-end', px(Math.max(0, fe.at(t))));
      pv.disabled = !(row.scrollLeft > 0); nx.disabled = !(en);
      ta.style.opacity = (.35 + .65*clamp(fs.at(t)/28)).toFixed(3); tb.style.opacity = (.35 + .65*clamp(fe.at(t)/28)).toFixed(3); ta.style.color = s ? 'var(--ink)' : 'var(--faint)'; tb.style.color = en ? 'var(--ink)' : 'var(--faint)';
      chips.forEach(c => { const p = clamp(c.vis.at(t)), k = clamp(c.on.at(t));
        c.w.style.width = p > .999 ? 'auto' : px(p*(c.b.offsetWidth + 6)); c.w.style.overflow = p > .999 ? 'visible' : 'hidden'; c.w.style.visibility = p < .01 ? 'hidden' : 'visible'; c.w.style.opacity = p.toFixed(3);
        c.b.style.background = mix(k, 'var(--ink)', 'var(--card)'); c.b.style.color = mix(k, 'var(--card)', 'var(--ink)'); c.b.style.borderColor = mix(k, 'var(--ink)', 'var(--line)'); });
      const a = e.A.at(t), b = e.B.at(t); Object.assign(segI.style, { transform:`translate(${px(a)},3px)`, width:px(b - a), height:'calc(100% - 6px)' });
    };
  }});

/* ================================================================ 5. Inline editable field */
atom({ id:'inlineedit', cat:CAT, name:'Inline editable field', block:'InlineEditableField', fam:['M','S'],
  html:`<style>
.ie-w{width:min(380px,92%);display:flex;flex-direction:column;gap:12px}
.ie-lb{display:block;font-size:12px;color:var(--muted);margin-bottom:3px}
.ie-bx{position:relative;height:40px;border:1px solid transparent;border-radius:10px}
.ie-dp,.ie-in{position:absolute;left:0;top:0;bottom:0;right:0;padding:0 72px 0 11px;border:0;background:none;color:var(--ink);font:14px/38px var(--sans);text-align:left;min-width:0}
.ie-dp{cursor:text;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.ie-dp:focus-visible{outline:2px solid var(--accent);outline-offset:1px;border-radius:10px}
.ie-in:focus-visible{outline:2px solid var(--accent);outline-offset:1px;border-radius:10px}
.ie-in{width:100%;line-height:normal;user-select:text;-webkit-user-select:text}
.ie-tl{position:absolute;right:6px;top:0;bottom:0;width:62px;pointer-events:none}
.ie-ly{position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-end;gap:2px;font-size:12px;font-weight:500}
.ie-ib{pointer-events:auto;width:28px;height:28px;border:0;border-radius:8px;background:none;display:grid;place-items:center;cursor:pointer;color:var(--muted)}
.ie-ib:hover{background:var(--raised);color:var(--ink)}
.ie-hp{position:relative;height:18px;margin-top:4px;font-size:12px}
.ie-hp>span{position:absolute;left:0;top:0;white-space:nowrap}
.ie-hp>.ie-ct{left:auto;right:2px;font-size:12px;color:var(--faint);font-variant-numeric:tabular-nums}
</style><div class="ie-w"></div><div class="hint">Click a value. Enter saves, Escape cancels. Try empty, or “admin”.</div>`,
  desc:'The value and the input are the same box: same padding and type, so nothing shifts. Click and the border and fill morph in while the text swaps to the input and the trailing check and cancel buttons arrive. Enter saves behind a short spinner, then the new value swaps in with a Saved check. Escape swaps the typed text out and the original back in. Invalid input turns the border danger and swaps in the message.',
  api:'box.edit.set(1)   text.to("edit")   trail.to("act")   Enter: trail.to("spin") → text.to("disp"); trail.to("ok")   Esc: text.to("disp")',
  init(st){
    const host = $(st,'.ie-w'), Q = [];
    const mk = ({ label, value, max, id }) => {
      const f = document.createElement('div');
      f.innerHTML = `<span class="ie-lb" id="${id}-l"></span><div class="ie-bx"><button type="button" class="ie-dp"></button><input class="ie-in" id="${id}" maxlength="${max}" autocomplete="off" aria-labelledby="${id}-l" aria-describedby="${id}-h" aria-invalid="false">
<div class="ie-tl"><div class="ie-ly" data-k="pen" aria-hidden="true">${ic(I.pen, 15)}</div><div class="ie-ly" data-k="act"><button type="button" class="ie-ib ie-sv" aria-label="Save changes">${ic(I.check, 16)}</button><button type="button" class="ie-ib ie-cn" aria-label="Cancel editing">${ic(I.x, 16)}</button></div><div class="ie-ly" data-k="spin" aria-hidden="true"><svg class="ie-sp" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"><path d="M12 3a9 9 0 0 1 9 9"/></svg></div><div class="ie-ly" data-k="ok" aria-hidden="true" style="color:var(--success);gap:5px">${ic(I.check, 15, 2.5)}<span>Saved</span></div></div></div>
<div class="ie-hp" id="${id}-h" aria-live="polite"><span data-k="hint" class="muted">Enter to save · Escape to cancel</span><span data-k="err" style="color:var(--danger)"></span><span data-k="saved" style="color:var(--success)">Saved just now</span><span data-k="none"></span><span class="ie-ct"></span></div>`;
      tx($(f,'.ie-lb'), label); host.appendChild(f);
      const bx = $(f,'.ie-bx'), dp = $(f,'.ie-dp'), inp = $(f,'.ie-in'), ct = $(f,'.ie-ct'), sp = $(f,'.ie-sp');
      const tl = $$(f,'.ie-tl .ie-ly'), hl = $$(f,'.ie-hp>span:not(.ie-ct)'), err = $(f,'[data-k="err"]');
      const o = { mode:'disp', value, tok:0, e:new Track(0), d:new Track(0), hv:new Track(0), ctr:new Track(0), sw:new Swap('disp'), tr:new Swap('pen'), hp:new Swap('none') };
      const paint = () => { dp.textContent = o.value; dp.setAttribute('aria-label', `Edit ${label}: ${o.value}`); };
      const key = (arr, k) => arr.find(x => x.dataset.k === k);
      const valid = v => { const s = v.trim(); if (!s) return `${label} can’t be empty`; if (s.length < 2) return 'Use at least 2 characters'; return null; };
      const fail = (m, t = now()) => { err.textContent = m; o.d.set(1, S.base, t); o.hp.to('err', t); inp.setAttribute('aria-invalid', 'true'); };
      const hush = () => { if (o.d.target){ o.d.set(0); inp.setAttribute('aria-invalid', 'false'); o.hp.to('hint'); } };
      const edit = () => { if (o.mode !== 'disp' && o.mode !== 'ok') return; o.tok++; o.mode = 'edit'; inp.value = o.value; inp.readOnly = false; ct.textContent = `${inp.value.length}/${max}`;
        o.e.set(1); o.sw.to('edit'); o.tr.to('act'); o.hp.to('hint'); o.ctr.set(1); inp.style.visibility = 'visible'; inp.focus(); inp.select(); };
      const cancel = () => { if (o.mode !== 'edit') return; o.mode = 'disp'; o.tok++; o.e.set(0); o.d.set(0); inp.setAttribute('aria-invalid', 'false'); o.sw.to('disp'); o.tr.to('pen'); o.hp.to('none'); o.ctr.set(0); dp.style.visibility = 'visible'; dp.focus(); };
      const save = () => { if (o.mode !== 'edit') return; const v = inp.value.trim(), m = valid(v); if (m){ fail(m); return; }
        if (v === o.value.trim()){ cancel(); return; }
        o.mode = 'saving'; inp.readOnly = true; o.tr.to('spin'); o.hp.to('none'); const k = ++o.tok;
        later(Q, now() + .7, tt => { if (o.tok !== k) return;
          if (/^admin$/i.test(v)){ o.mode = 'edit'; inp.readOnly = false; o.tr.to('act', tt); fail('That name is reserved.', tt); return; }
          o.value = v; paint(); const had = document.activeElement === inp; o.mode = 'ok'; o.e.set(0, S.base, tt); o.d.set(0, S.base, tt); o.ctr.set(0, S.base, tt); o.sw.to('disp', tt); o.tr.to('ok', tt); o.hp.to('saved', tt);
          if (had){ dp.style.visibility = 'visible'; dp.focus(); }
          later(Q, tt + 1.6, t2 => { if (o.tok === k && o.mode === 'ok'){ o.mode = 'disp'; o.tr.to('pen', t2); o.hp.to('none', t2); } }); }); };
      dp.onclick = edit; $(f,'.ie-sv').onclick = save; $(f,'.ie-cn').onclick = cancel;
      inp.onkeydown = e => { if (e.key === 'Enter'){ e.preventDefault(); save(); } else if (e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); cancel(); } };
      inp.oninput = () => { ct.textContent = `${inp.value.length}/${max}`; if (o.d.target && !valid(inp.value)) hush(); };
      dp.onpointerenter = () => o.hv.set(1, S.snap); dp.onpointerleave = () => o.hv.set(0, S.snap);
      paint(); inp.style.visibility = 'hidden'; inp.value = value;
      return t => {
        const e = clamp(o.e.at(t)), d = clamp(o.d.at(t)), hv = clamp(o.hv.at(t));
        bx.style.background = mix(e, 'var(--card)', mix(hv, 'var(--raised)', 'transparent'));
        bx.style.borderColor = mix(d, 'var(--danger)', mix(e, 'var(--line)', 'transparent'));
        o.sw.apply(dp, 'disp', t, 3); o.sw.apply(inp, 'edit', t, 3); if (o.sw.cur === 'edit') inp.style.visibility = 'visible'; if (o.sw.cur === 'disp') dp.style.visibility = 'visible';
        tl.forEach(l => o.tr.apply(l, l.dataset.k, t, 3)); hl.forEach(l => o.hp.apply(l, l.dataset.k, t, 3));
        ct.style.opacity = clamp(o.ctr.at(t)).toFixed(3); sp.style.transform = `rotate(${(t*420 % 360).toFixed(1)}deg)`;
      };
    };
    const fields = [mk({ label:'Display name', value:'Tan Ho', max:28, id:'ie-name' }), mk({ label:'Headline', value:'Civics teacher in Austin', max:40, id:'ie-head' })];
    return t => { drain(Q, t); fields.forEach(f => f(t)); };
  }});

/* ================================================================ 6. Theme toggle */
atom({ id:'themetoggle', cat:CAT, name:'Theme toggle', block:'ThemeToggle', fam:['M','S'], tall:true,
  html:`<style>
.tt-w{width:min(360px,92%);display:flex;flex-direction:column;gap:12px}
.tt-b{position:relative;flex:none;width:30px;height:30px;border:0;border-radius:999px;background:none;color:var(--muted);display:grid;place-items:center;cursor:pointer}
.tt-b:hover{background:var(--raised);color:var(--ink)}
.tt-s{position:relative;flex:1;height:20px;font-size:12px;color:var(--muted)}
.tt-s>span{position:absolute;left:0;top:0;white-space:nowrap;line-height:20px}
.tt-pv{border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;background:var(--p-bg);color:var(--p-ink);border:1px solid var(--p-line)}
.tt-hd{display:flex;align-items:center;justify-content:space-between;font-size:13px}
.tt-hd b{font-weight:600}
.tt-ch{font-size:11.5px;font-weight:600;border-radius:999px;padding:2px 8px;background:var(--p-tint);color:var(--p-accent)}
.tt-bars{display:flex;align-items:flex-end;gap:6px;height:42px;padding:8px;border-radius:10px;background:var(--p-card)}
.tt-bars i{flex:1;border-radius:3px;background:var(--p-accent)}
.tt-pv p{margin:0;font-size:12.5px;line-height:1.45;color:var(--p-muted)}
.tt-bt{display:flex;gap:8px;font-size:12.5px;font-weight:500}
.tt-bt span{padding:5px 12px;border-radius:9px}
.tt-p1{background:var(--p-ink);color:var(--p-card)}
.tt-p2{color:var(--p-ink);box-shadow:inset 0 0 0 1px var(--p-line)}
</style><div class="tt-w"><div class="row"><button type="button" class="tt-b" aria-label="Switch to dark mode" title="Switch to dark mode"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="tt-bd"/><g class="tt-rg"></g></svg></button><div class="tt-s" aria-live="polite"><span data-k="sl">Following system · light</span><span data-k="sd">Following system · dark</span><span data-k="pl">Pinned to light</span><span data-k="pd">Pinned to dark</span></div></div>
<div class="tt-pv"><div class="tt-hd"><b>Weekly traffic</b><span class="tt-ch">+18%</span></div><div class="tt-bars" aria-hidden="true"><i style="height:45%"></i><i style="height:60%"></i><i style="height:38%"></i><i style="height:72%"></i><i style="height:64%"></i><i style="height:88%"></i><i style="height:100%"></i></div><p>Pricing page visits grew after the new hero shipped on Tuesday.</p><div class="tt-bt" aria-hidden="true"><span class="tt-p1">View report</span><span class="tt-p2">Share</span></div></div>
<div class="small muted">Preview card only. This page keeps its own theme.</div></div>`,
  desc:'One button, and the glyph shows the destination, as in Gesso: the sun’s circle and the moon’s crescent are the same 48 path points interpolated, while the eight rays shrink into the body and fade. At the same moment a local preview card cross-fades every colour between its light and dark palettes. Like Gesso, the choice is stored as a pin only while it disagrees with the system, and the status line swaps to say which.',
  api:'pts[i] = lerp(sun[i], moon[i], p)   ray.r = lerp(R0, 4, p)   card.color = mix(dark, light, theme.at(t))   pref = next === system ? "system" : next',
  init(st){
    // 48 shared points: first 36 trace the outer arc, last 12 the inner arc. The sun is a circle sampled at the same angles.
    const N = 48, sun = [], moon = [];
    for (let i = 0; i < N; i++){
      const ang = i < 36 ? 270*i/36 : 270 + 90*(i - 36)/12, a = ang*Math.PI/180; sun.push([12 + 4.4*Math.cos(a), 12 + 4.4*Math.sin(a)]);
      if (i < 36) moon.push([12 + 9*Math.cos(a), 12 + 9*Math.sin(a)]);
      else { const f = (225 - 180*(i - 36)/12)*Math.PI/180; moon.push([16.5 + 6.364*Math.cos(f), 7.5 + 6.364*Math.sin(f)]); }
    }
    const btn = $(st,'.tt-b'), body = $(st,'.tt-bd'), rg = $(st,'.tt-rg'), pv = $(st,'.tt-pv');
    const rays = [...Array(8)].map(() => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); rg.appendChild(p); return p; });
    const LIGHT = { bg:'#F3F5F7', card:'#FFFFFF', ink:'#10141A', muted:'#5B5E63', line:'#DCDEE0', accent:'#595D17', tint:'#EAECE7' };
    const DARK = { bg:'#0C1016', card:'#171B21', ink:'#EFF2F6', muted:'#ABAEB3', line:'#2A2F36', accent:'#939668', tint:'#23261A' };
    const mq = matchMedia('(prefers-color-scheme: dark)'), sys = () => mq.matches ? 'dark' : 'light';
    let pref = 'system'; const eff = () => pref === 'system' ? sys() : pref;
    const th = new Track(eff() === 'dark' ? 1 : 0), icn = new Track(eff() === 'dark' ? 0 : 1), sw = new Swap('sl'), L = $$(st,'.tt-s>span');
    const key = () => (pref === 'system' ? 's' : 'p') + (eff() === 'dark' ? 'd' : 'l');
    const apply = inst => { const dark = eff() === 'dark'; th.set(dark ? 1 : 0); icn.set(dark ? 0 : 1); sw.to(key());
      const l = dark ? 'Switch to light mode' : 'Switch to dark mode'; btn.setAttribute('aria-label', l); btn.title = l; };
    sw.cur = key(); sw.prev = null; sw.t = -9;
    btn.onclick = () => { const next = eff() === 'dark' ? 'light' : 'dark'; pref = next === sys() ? 'system' : next; apply(); };
    mq.addEventListener('change', () => { if (pref === 'system') apply(); });
    apply(); th.jump(eff() === 'dark' ? 1 : 0); icn.jump(eff() === 'dark' ? 0 : 1);
    return t => {
      const p = clamp(icn.at(t)), d = clamp(th.at(t));
      let s = ''; for (let i = 0; i < N; i++) s += (i ? 'L' : 'M') + lerp(sun[i][0], moon[i][0], p).toFixed(2) + ' ' + lerp(sun[i][1], moon[i][1], p).toFixed(2); body.setAttribute('d', s + 'Z');
      const r0 = lerp(7.4, 4, p), r1 = lerp(9.8, 4, p), rot = p*45;
      rays.forEach((r, k) => { const a = (k*45 + rot)*Math.PI/180, c = Math.cos(a), n = Math.sin(a); r.setAttribute('d', `M${(12 + r0*c).toFixed(2)} ${(12 + r0*n).toFixed(2)}L${(12 + r1*c).toFixed(2)} ${(12 + r1*n).toFixed(2)}`); r.style.opacity = clamp(1 - p*1.6).toFixed(3); });
      for (const k in LIGHT) pv.style.setProperty('--p-' + k, `color-mix(in oklab, ${DARK[k]} ${(d*100).toFixed(1)}%, ${LIGHT[k]})`);
      L.forEach(l => sw.apply(l, l.dataset.k, t, 3));
    };
  }});

/* ================================================================ 7. Device toggle */
atom({ id:'devicetoggle', cat:CAT, name:'Device toggle', block:'DeviceToggle', fam:['E','M'], wide:true, tall:true,
  html:`<style>
.dv{position:absolute;inset:0;overflow:hidden}
.dv-sg{position:absolute;top:10px;left:50%;transform:translateX(-50%);display:flex;background:var(--raised);border-radius:10px;padding:3px;z-index:2}
.dv-sg .ind{position:absolute;left:0;top:0;background:var(--card);border-radius:7px;box-shadow:var(--shadow)}
.dv-sg button{position:relative;width:38px;height:28px;border:0;border-radius:7px;background:none;display:grid;place-items:center;cursor:pointer}
.dv-fr{position:absolute;top:54px;bottom:14px;display:flex;flex-direction:column;overflow:hidden;container-type:inline-size;background:var(--card);box-shadow:var(--shadow);border-style:solid;border-width:1px}
.dv-cr{flex:none;display:flex;align-items:center;gap:6px;padding:0 10px;background:var(--raised);overflow:hidden}
.dv-dt{display:flex;gap:4px;flex:none}
.dv-dt i{width:7px;height:7px;border-radius:50%;background:var(--line)}
.dv-ur{flex:1;min-width:0;height:16px;border-radius:8px;background:var(--card);display:flex;justify-content:space-between;gap:8px;align-items:center;padding:0 8px;font-size:10px;color:var(--faint);white-space:nowrap;overflow:hidden}
.dv-pg{flex:1;min-height:0;overflow:hidden;padding:12px 16px;display:flex;flex-direction:column;gap:12px;font-size:12px;text-align:left}
.dv-nv{display:flex;align-items:center;gap:14px}
.dv-lk{display:flex;gap:12px;margin-left:auto;color:var(--muted)}
.dv-cta{padding:4px 10px;border-radius:999px;background:var(--ink);color:var(--card);font-weight:500;white-space:nowrap}
.dv-bg{display:none;margin-left:auto}
.dv-hr{display:grid;grid-template-columns:1.3fr 1fr;gap:16px;align-items:center}
.dv-hr h4{margin:0 0 4px;font-size:clamp(14px,3.2cqw,24px);line-height:1.15;letter-spacing:-.02em;font-weight:600}
.dv-hr p{margin:0 0 8px;color:var(--muted);line-height:1.4}
.dv-im{height:92px;border-radius:10px;background:var(--accent-tint)}
.dv-gr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.dv-cd{height:54px;border-radius:10px;background:var(--raised);padding:8px 10px;font-size:11px;color:var(--muted)}
.dv-cd b{display:block;color:var(--ink);font-weight:500;margin-bottom:2px}
@container (max-width:900px){.dv-gr{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container (max-width:560px){.dv-hr{grid-template-columns:minmax(0,1fr)}.dv-im{height:50px}.dv-gr{grid-template-columns:minmax(0,1fr)}.dv-pg{padding:10px 12px;gap:10px}}
@container (max-width:520px){.dv-lk,.dv-cta{display:none}.dv-bg{display:block}}
@container (max-width:300px){.dv-dt{display:none}}
</style><div class="dv"><div class="dv-sg" role="group" aria-label="Preview width"><div class="ind"></div>
<button type="button" aria-label="Desktop" title="Desktop">${ic(J.monitor, 17)}</button><button type="button" aria-label="Tablet · 820" title="Tablet · 820">${ic(J.tablet, 17)}</button><button type="button" aria-label="Phone · 390" title="Phone · 390">${ic(J.phone, 17)}</button></div>
<div class="dv-fr" role="img" aria-label="Preview of the site at the chosen width"><div class="dv-cr"><span class="dv-dt"><i></i><i></i><i></i></span><span class="dv-ur"><span>northlight.studio</span><span class="dv-wd num">0 px</span></span></div>
<div class="dv-pg"><div class="dv-nv"><b>Northlight</b><span class="dv-lk"><span>Work</span><span>Studio</span><span>Journal</span></span><span class="dv-cta">Book a call</span><span class="dv-bg">${ic(I.menu, 16)}</span></div>
<div class="dv-hr"><div><h4>Calm websites for small studios</h4><p>Design, build and launch in six weeks, with one person to talk to.</p><span class="dv-cta" style="display:inline-block">Start a project</span></div><div class="dv-im"></div></div>
<div class="dv-gr"><div class="dv-cd"><b>Strategy</b>Positioning and page map</div><div class="dv-cd"><b>Design</b>Type, colour and layout</div><div class="dv-cd"><b>Build</b>Fast, accessible pages</div></div></div></div></div>`,
  desc:'The three icon buttons share one indicator whose edges lag: leading edge first, trailing 60ms later. The preview frame is a single element whose width, corner radius, bezel and chrome height spring together from one device value, so going Desktop to Phone passes through tablet like a real resize. The page inside is container-queried: columns collapse, the nav folds to a menu and cards stack as the width crosses each breakpoint.',
  api:'u.set(device)   width = piece([avail, min(820, .72·avail), min(390, .4·avail)], u)   radius = piece([10, 18, 30], u)   ind.go(l, r)',
  init(st){
    const root = $(st,'.dv'), grp = $(st,'.dv-sg'), ind = $(grp,'.ind'), btns = $$(grp,'button'), fr = $(st,'.dv-fr'), cr = $(st,'.dv-cr'), wd = $(st,'.dv-wd');
    const e = edges(0, 0), u = new Track(0); let cur = 0, last = '';
    const NAME = ['Desktop', 'Tablet', 'Phone'];
    const geo = b => [b.offsetLeft, b.offsetLeft + b.offsetWidth];
    const place = inst => { const [l, r] = geo(btns[cur]); inst ? e.jump(l, r) : e.go(l, r); btns.forEach((b, i) => { b.setAttribute('aria-pressed', i === cur); b.tabIndex = i === cur ? 0 : -1; }); };
    const pick = (i, inst) => { cur = i; place(inst); inst ? u.jump(i) : u.set(i); };
    btns.forEach((b, i) => b.onclick = () => pick(i));
    grp.addEventListener('keydown', ev => { const k = ev.key; let n = cur; if (k === 'ArrowRight' || k === 'ArrowDown') n = Math.min(2, cur + 1); else if (k === 'ArrowLeft' || k === 'ArrowUp') n = Math.max(0, cur - 1); else if (k === 'Home') n = 0; else if (k === 'End') n = 2; else return;
      ev.preventDefault(); pick(n); btns[n].focus(); });
    document.fonts.ready.then(() => place(true)); pick(0, true);
    const piece = (a, v) => { const c = clamp(v, 0, 2), i = Math.min(1, Math.floor(c)); return lerp(a[i], a[i + 1], c - i); };
    return t => {
      const avail = Math.max(120, root.clientWidth - 28), ph = clamp(avail*.4, 140, 390), tb = clamp(avail*.72, ph + 60, 820), v = u.at(t);
      const w = Math.min(avail, piece([avail, Math.min(avail, tb), ph], v));
      Object.assign(fr.style, { width:px(w), left:px(14 + (avail - w)/2), borderRadius:px(piece([10, 18, 30], v)) });
      fr.style.borderWidth = px(piece([1, 1, 6], v)); fr.style.borderColor = mix(clamp(piece([0, 0, 1], v)), '#0C1016', 'var(--line)');
      cr.style.height = px(piece([26, 26, 18], v));
      const s = Math.round(w) + ' px'; if (s !== last){ wd.textContent = s; last = s; }
      const a = e.A.at(t), b = e.B.at(t); Object.assign(ind.style, { transform:`translate(${px(a)},3px)`, width:px(b - a), height:'calc(100% - 6px)' });
      btns.forEach((x, i) => x.style.color = mix(clamp(1 - Math.abs(v - i)), 'var(--ink)', 'var(--muted)'));
    };
  }});

/* ================================================================ 8. Running timer */
atom({ id:'timer', cat:CAT, name:'Running timer', block:'ActiveTimer', fam:['T','M','S','X'], tall:true,
  html:`<style>
.tm-w{width:min(400px,92%);display:flex;flex-direction:column;gap:10px;text-align:left}
.tm-c{padding:14px;display:flex;flex-direction:column;gap:10px}
.tm-t{position:relative;height:20px;font-size:12px;font-weight:500;color:var(--faint)}
.tm-t>*{position:absolute;right:0;top:0}
.tm-t>span:first-child{left:0;right:auto}
.tm-tk{position:relative;height:36px}
.tm-tk>*{position:absolute;left:0;right:0;top:0;height:36px}
.tm-sel{width:100%;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);font:14px var(--sans);padding:0 10px}
.tm-tt{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;padding:0 10px}
.tm-tt i{width:8px;height:8px;border-radius:50%;background:var(--danger);flex:none}
.tm-bm{display:flex;align-items:center;justify-content:space-between;height:44px}
.tm-el{display:inline-flex;align-items:flex-start;font-size:32px;line-height:1.25;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.tm-el>b{font-weight:600;display:inline-block;height:1.25em;line-height:1.25em;width:.3em;text-align:center}
.tm-bt{position:relative;height:40px;border:0;border-radius:20px;overflow:hidden;cursor:pointer;font-weight:500;font-size:14px;flex:none}
.tm-bl{position:absolute;left:0;top:0;height:100%;display:flex;align-items:center;gap:7px;padding:0 16px;white-space:nowrap}
.tm-sk{width:max-content;padding:4px 10px;font-size:12px}
.tm-lh{font-size:12px;font-weight:500;color:var(--faint)}
.tm-lg{position:relative;height:104px;overflow:hidden;border-radius:12px;background:var(--card);box-shadow:var(--shadow)}
.tm-rw{position:absolute;left:0;right:0;top:0;height:32px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 14px;font-size:13px}
.tm-rw span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:8px}
.tm-rw span:first-child::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--faint);flex:none}
.tm-rw .num{color:var(--muted);flex:none}
</style><div class="tm-w"><div class="card tm-c"><div class="tm-t"><span>Time tracking</span><span data-k="idle">Not running</span><button type="button" class="btn tm-sk" data-k="run">Skip 10 min</button></div>
<div class="tm-tk"><select class="tm-sel" aria-label="Task" data-k="idle"><option>Homepage redesign · Arc</option><option>Quarterly report · Finch and Co</option><option>Client onboarding call · Orchard</option></select><div class="tm-tt" data-k="run"><i></i><span class="tm-ta"></span></div></div>
<div class="tm-bm"><output class="tm-el" role="timer" aria-label="Elapsed 0:00:00"><span class="tm-h"></span><b>:</b><span class="tm-m"></span><b>:</b><span class="tm-s"></span></output><button type="button" class="tm-bt"><span class="tm-bl" data-k="start">${ic(J.play, 15)}Start</span><span class="tm-bl" data-k="stop">${ic(J.stop, 15)}Stop</span></button></div></div>
<div class="tm-lh">Today</div><div class="tm-lg" role="list" aria-label="Time entries today"></div></div>`,
  desc:'Start morphs one button: the width springs to the new label, the fill goes from ink to danger, and Start and Stop swap by the blur rule while the task select swaps to its title. The h:mm:ss readout is read from the clock, and each digit that changes rolls in as its own swap. Stop rolls the digits down to zero, and the entry enters at the top of the log while the older rows spring down a slot and the last one fades out.',
  api:'secs = floor(now() − start + skip)   digit.set(char)   btn.w.set(measure(label))   rows.forEach(r => r.y.set(r.y + 32))   new.o.set(1)',
  init(st){
    const el = $(st,'.tm-el'), dh = new Digits($(el,'.tm-h'), 1), dm = new Digits($(el,'.tm-m'), 2), ds = new Digits($(el,'.tm-s'), 2);
    const bt = $(st,'.tm-bt'), bl = $$(bt,'.tm-bl'), sel = $(st,'.tm-sel'), tt = $(st,'.tm-tt'), ta = $(st,'.tm-ta'), top = $$(st,'.tm-t>[data-k]'), tk = [sel, tt], skip = $(st,'.tm-sk'), lg = $(st,'.tm-lg');
    dh.set('0', true); dm.set('00', true); ds.set('00', true);
    const run = new Track(0), bgc = new Track(0), bw = new Track(0), tsw = new Swap('idle'), bsw = new Swap('start'); let running = false, t0 = 0, skipS = 0, lastS = -1, W = { start:100, stop:100 };
    const fmt = s => { const h = Math.floor(s/3600), m = Math.floor(s%3600/60); if (s < 60) return `${s} sec`; if (!h) return `${m} min`; return m ? `${h} hr ${m} min` : `${h} hr`; };
    const logs = [];
    const add = (name, secs, inst) => { const r = document.createElement('div'); r.className = 'tm-rw'; r.setAttribute('role', 'listitem'); r.innerHTML = '<span></span><span class="num"></span>'; tx(r.children[0], name); tx(r.children[1], fmt(secs)); lg.appendChild(r);
      logs.forEach(l => l.y.set(l.y.target + 32)); const o = { r, y:new Track(0), o:new Track(inst ? 1 : 0) }; if (!inst) o.o.set(1, S.base, now() + .06); logs.unshift(o); logs.forEach((l, i) => { if (i >= 3) l.o.set(0, S.snap); }); };
    [['Quarterly report', 4320], ['Client onboarding call', 2100]].forEach(([n, d]) => add(n, d, true));
    logs.forEach((l, i) => l.y.jump(i*32));
    const measure = () => { bl.forEach(l => W[l.dataset.k] = l.offsetWidth); bw.jump(W[running ? 'stop' : 'start']); }; document.fonts.ready.then(measure); measure();
    const proj = () => sel.value.split(' · ')[0];
    const toggle = () => {
      const t = now();
      if (!running){ running = true; t0 = t; skipS = 0; lastS = -1; ta.textContent = proj(); tsw.to('run', t); bsw.to('stop', t); run.set(1, S.base, t); bgc.set(1, S.base, t); bw.set(W.stop, S.base, t); dh.dir = dm.dir = ds.dir = 1; }
      else { running = false; const secs = Math.floor(t - t0 + skipS); add(proj(), secs); tsw.to('idle', t); bsw.to('start', t); run.set(0, S.base, t); bgc.set(0, S.base, t); bw.set(W.start, S.base, t); dh.dir = dm.dir = ds.dir = -1; dh.set('0'); dm.set('00'); ds.set('00'); el.setAttribute('aria-label', 'Elapsed 0:00:00'); lastS = -1; }
      bt.setAttribute('aria-label', running ? 'Stop timer' : 'Start timer');
    };
    bt.onclick = toggle; skip.onclick = () => { if (running) skipS += 600; }; bt.setAttribute('aria-label', 'Start timer');
    return t => {
      if (running){ const s = Math.floor(t - t0 + skipS); if (s !== lastS){ lastS = s; const h = Math.floor(s/3600), m = Math.floor(s%3600/60), c = s%60;
        dh.set(String(h % 10)); dm.set(String(m).padStart(2, '0')); ds.set(String(c).padStart(2, '0')); el.setAttribute('aria-label', `Elapsed ${h}:${String(m).padStart(2, '0')}:${String(c).padStart(2, '0')}`); } }
      dh.render(t); dm.render(t); ds.render(t); el.style.color = mix(clamp(run.at(t)), 'var(--ink)', 'var(--faint)');
      const g = clamp(bgc.at(t)); Object.assign(bt.style, { width:px(bw.at(t)), background:mix(g, 'var(--danger)', 'var(--ink)'), color:mix(g, '#fff', 'var(--card)') });
      bl.forEach(l => bsw.apply(l, l.dataset.k, t, 4)); tk.forEach(x => tsw.apply(x, x.dataset.k, t, 4)); top.forEach(x => tsw.apply(x, x.dataset.k, t, 3));
      for (let i = logs.length - 1; i >= 0; i--){ const l = logs[i], o = clamp(l.o.at(t)); if (l.o.target === 0 && o < .01){ l.r.remove(); logs.splice(i, 1); continue; }
        fade(l.r, o, null); l.r.style.transform = `translateY(${px(l.y.at(t) + (1 - o)*-8)})`; }
    };
  }});

/* ================================================================ 9. Disclosure group */
atom({ id:'disclosure', cat:CAT, name:'Disclosure group', block:'EditorDisclosureGroup', fam:['M'], tall:true,
  html:`<style>
.dg-p{width:min(330px,94%);height:306px;display:flex;flex-direction:column;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:hidden;text-align:left}
.dg-tt{flex:none;display:flex;align-items:center;justify-content:space-between;height:38px;padding:0 14px;font-size:13px;font-weight:600;border-bottom:1px solid var(--line-soft)}
.dg-tt span{font-size:12px;font-weight:400;color:var(--faint)}
.dg-sc{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain}
.dg-sc>.dg-g{border-bottom:1px solid var(--line-soft)}
.dg-h{display:flex;align-items:center;gap:6px;width:100%;height:30px;padding:0 12px;border:0;background:none;color:var(--ink);font-size:12.5px;font-weight:500;text-align:left;cursor:pointer}
.dg-h svg{flex:none;color:var(--faint)}
.dg-n{margin-left:auto;font-size:11.5px;font-weight:400;color:var(--faint)}
.dg .dg-g .dg-g .dg-h{height:28px;color:var(--muted);padding-left:6px}
.dg-b{overflow:hidden}
.dg-i{padding:2px 12px 8px 30px}
.dg-i>.dg-g{margin-left:-18px;margin-right:-12px}
.dg-rw{display:flex;align-items:center;justify-content:space-between;gap:10px;height:28px;font-size:12px;color:var(--muted)}
.dg-rw input,.dg-rw select{width:104px;height:22px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--ink);font:12px var(--sans);padding:0 6px}
.dg-ft{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;height:34px;padding:0 10px 0 14px;border-top:1px solid var(--line-soft);font:11px var(--mono);color:var(--faint)}
.dg-fm{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style><div class="dg-p dg"><div class="dg-tt">Heading<span>Inspector</span></div><div class="dg-sc"></div><div class="dg-ft"><span class="dg-fm"></span><button type="button" class="btn dg-rs" style="padding:2px 8px;font-size:12px">Reset</button></div></div>`,
  desc:'Each group is its own spring, never tied to a sibling: the body height follows the measured content, the chevron turns a quarter on the same spring and the content fades in with the height. Spacing holds two nested groups that open and close independently, and the parent’s height follows whatever they are doing. Like the editor’s preference store, only your toggles are remembered; Reset returns every group to its default.',
  api:'g.h.set(open ? 1 : 0)   body.h = h·inner.offsetHeight   chev = rotate((h − 1)·90)   collapsed[key] = !open',
  init(st){
    const G = [
      { key:'layout', title:'Layout', open:true, rows:[['Width', 's', ['Fill', 'Fixed', 'Hug']], ['Gap', 'n', 16], ['Align', 's', ['Start', 'Center', 'End']]] },
      { key:'type', title:'Typography', open:true, rows:[['Font', 't', 'Geist'], ['Size', 'n', 32], ['Weight', 's', ['Regular', 'Medium', 'Semibold']], ['Tracking', 'n', -0.03]] },
      { key:'space', title:'Spacing', open:false, groups:[
        { key:'space.margin', title:'Margin', open:false, rows:[['Top', 'n', 0], ['Bottom', 'n', 24]] },
        { key:'space.padding', title:'Padding', open:true, rows:[['Block', 'n', 16], ['Inline', 'n', 20]] } ] },
      { key:'fill', title:'Fill and stroke', open:false, rows:[['Background', 't', '#FFFFFF'], ['Border', 'n', 1], ['Radius', 'n', 12]] },
      { key:'fx', title:'Effects', open:false, rows:[['Shadow', 's', ['None', 'Soft', 'Lifted']], ['Opacity', 'n', 100]] }
    ];
    const sc = $(st,'.dg-sc'), fm = $(st,'.dg-fm'), rs = $(st,'.dg-rs'), saved = {}, groups = [];
    const isOpen = g => saved[g.key] === undefined ? g.open : !saved[g.key];
    const count = g => (g.rows ? g.rows.length : 0) + (g.groups ? g.groups.reduce((n, x) => n + count(x), 0) : 0);
    const rowEl = ([l, k, v]) => { const r = document.createElement('label'); r.className = 'dg-rw'; const s = document.createElement('span'); s.textContent = l; r.appendChild(s);
      let c; if (k === 's'){ c = document.createElement('select'); v.forEach(o => c.appendChild(new Option(o))); } else { c = document.createElement('input'); c.type = k === 'n' ? 'number' : 'text'; c.value = v; if (k === 'n') c.step = 'any'; }
      r.appendChild(c); return r; };
    const build = (g, host) => {
      const id = 'dg-' + g.key.replace(/\./g, '-'), sec = document.createElement('section'); sec.className = 'dg-g';
      sec.innerHTML = `<button type="button" class="dg-h" aria-expanded="false" aria-controls="${id}">${ic(I.chev, 14)}<span></span><span class="dg-n"></span></button><div class="dg-b" id="${id}" role="group"><div class="dg-i"></div></div>`;
      const btn = $(sec,'.dg-h'), inner = $(sec,'.dg-i'); tx(btn.children[1], g.title); tx($(btn,'.dg-n'), String(count(g))); $(sec,'.dg-b').setAttribute('aria-label', g.title);
      host.appendChild(sec);
      const o = { g, btn, chev:btn.firstChild, body:$(sec,'.dg-b'), inner, h:new Track(isOpen(g) ? 1 : 0) }; groups.push(o);
      (g.rows || []).forEach(r => inner.appendChild(rowEl(r))); (g.groups || []).forEach(s => build(s, inner));
      btn.setAttribute('aria-expanded', isOpen(g)); btn.onclick = () => { const op = !isOpen(g); saved[g.key] = !op; sync(); };
    };
    const sync = () => { groups.forEach(o => { const op = isOpen(o.g); o.h.set(op ? 1 : 0); o.btn.setAttribute('aria-expanded', op); }); fm.textContent = 'collapsedGroups ' + JSON.stringify(saved); fm.title = fm.textContent; };
    G.forEach(g => build(g, sc)); sync();
    rs.onclick = () => { Object.keys(saved).forEach(k => delete saved[k]); sync(); };
    groups.forEach(o => { o.h.jump(isOpen(o.g) ? 1 : 0); });
    return t => { for (let i = groups.length - 1; i >= 0; i--){ const o = groups[i], p = clamp(o.h.at(t));
      o.body.style.height = p > .9995 ? 'auto' : px(p*o.inner.offsetHeight); o.body.style.visibility = p < .01 ? 'hidden' : 'visible';
      o.chev.style.transform = `rotate(${((p - 1)*90).toFixed(1)}deg)`; fade(o.inner, p, (1 - p)*-4); } };
  }});

/* ================================================================ 10. Delayed spinner */
atom({ id:'delayspinner', cat:CAT, name:'Delayed spinner', block:'Spinner', fam:['X','T'], tall:true,
  html:`<style>
.ds-w{width:min(400px,92%);display:flex;flex-direction:column;gap:12px;text-align:left}
.ds-c{padding:12px 14px}
.ds-h{display:flex;align-items:center;justify-content:space-between;height:26px}
.ds-h b{font-size:14px;font-weight:600}
.ds-up{position:relative;height:18px;width:150px;margin-left:10px;font-size:12px;color:var(--faint)}
.ds-up>span{position:absolute;left:0;top:0;white-space:nowrap}
.ds-sp{flex:none;width:18px;height:18px;color:var(--muted);display:grid;place-items:center}
.ds-ls{position:relative;height:102px;margin-top:6px}
.ds-ly{position:absolute;inset:0}
.ds-r{display:flex;align-items:center;justify-content:space-between;gap:10px;height:34px;font-size:13px}
.ds-r span:first-child{color:var(--muted);font-variant-numeric:tabular-nums}
.ds-tl{position:relative;height:6px;border-radius:3px;background:var(--raised);margin-top:6px}
.ds-tl>i{position:absolute;top:0;height:100%;border-radius:3px}
.ds-mk{position:absolute;top:-4px;width:1px;height:14px;background:var(--faint);left:15%}
.ds-lb{position:relative;height:16px;font-size:11px;color:var(--faint);font-variant-numeric:tabular-nums}
.ds-lb>span{position:absolute;top:0}
.ds-ph{position:relative;height:36px;font-size:13px;color:var(--muted)}
.ds-ph>span{position:absolute;left:0;top:0;right:0}
</style><div class="ds-w"><div class="card ds-c"><div class="ds-h"><div class="row" style="gap:0"><b>Invoices</b><div class="ds-up"><span data-k="o">Updated 2 min ago</span><span data-k="n">Updated just now</span></div></div><span class="ds-sp" role="status" aria-label="Loading"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 0 1 9 9"/></svg></span></div><div class="ds-ls" aria-live="polite"></div></div>
<div class="row"><button type="button" class="btn ds-f">Load fast · 180 ms</button><button type="button" class="btn ds-s">Load slow · 1.6 s</button></div>
<div><div class="ds-tl" aria-hidden="true"><i class="ds-el" style="left:0;background:var(--ink)"></i><i class="ds-sv" style="background:var(--accent)"></i><b class="ds-mk"></b></div><div class="ds-lb" aria-hidden="true"><span style="left:0">0</span><span style="left:15%;transform:translateX(-50%)">300 ms</span><span class="ds-tm" style="right:0"></span></div></div>
<div class="ds-ph" aria-live="polite"><span data-k="idle">Pick a speed. The spinner only appears if the wait passes 300 ms.</span><span data-k="wait">Waiting. Still under 300 ms, so no spinner yet.</span><span data-k="spin">Past 300 ms, so the spinner fades in.</span><span data-k="hold">Result is in. The spinner stays until it has shown for 500 ms.</span><span data-k="fast">Done before 300 ms. No spinner ever appeared.</span><span data-k="slow">Done. The spinner showed from 300 ms, and for at least 500 ms.</span></div></div>`,
  desc:'The load starts a 300ms timer. If the result lands first, nothing shows: the list swaps and that is all. If not, the spinner fades in and blurs up on the base spring at 300ms, then stays at least 500ms so it never flashes, fading out on the snap spring once the result has swapped in. The strip below draws the same clock: the tick is the 300ms threshold and the accent span is how long the spinner was visible.',
  api:'showAt = start + .3   if (end > showAt) o.set(1, S.base, showAt); o.set(0, S.snap, max(end, showAt + .5))   list.to(next) at end',
  init(st){
    const sp = $(st,'.ds-sp'), svg = $(sp,'svg'), ls = $(st,'.ds-ls'), fast = $(st,'.ds-f'), slow = $(st,'.ds-s'), el = $(st,'.ds-el'), sv = $(st,'.ds-sv'), tm = $(st,'.ds-tm'), ups = $$(st,'.ds-up>span'), phs = $$(st,'.ds-ph>span');
    const D = [[['INV-1042', 'Orchard Dental', '$1,240.00'], ['INV-1043', 'Finch and Co', '$860.00'], ['INV-1044', 'Northlight Studio', '$2,400.00']],
      [['INV-1045', 'Harbor Bakery', '$540.00'], ['INV-1046', 'Harbor Labs', '$3,150.00'], ['INV-1047', 'Alder Street Clinic', '$720.00']]];
    const layers = D.map(set => { const l = document.createElement('div'); l.className = 'ds-ly'; set.forEach(([a, b, c]) => { const r = document.createElement('div'); r.className = 'ds-r'; r.innerHTML = '<span></span><span></span><b class="num" style="font-weight:500"></b>'; tx(r.children[0], a); tx(r.children[1], b); r.children[1].style.cssText = 'flex:1;color:var(--ink)'; tx(r.children[2], c); l.appendChild(r); }); ls.appendChild(l); return l; });
    const AX = 2, Q = [], o = new Track(0), lsw = new Swap(0), usw = new Swap('o'), psw = new Swap('idle');
    let runI = null, busy = false, ds = 0, vis = false; sp.setAttribute('aria-hidden', 'true');
    const go = dur => { if (busy) return; const t0 = now(), end = t0 + dur, showAt = t0 + .3, would = end > showAt, hideAt = would ? Math.max(end, showAt + .5) : end;
      runI = { start:t0, end, showAt, hideAt, would }; busy = true; fast.disabled = slow.disabled = true; ls.setAttribute('aria-busy', 'true');
      later(Q, end, tt => { ds ^= 1; lsw.to(ds, tt); usw.to('n', tt); });
      if (would){ later(Q, showAt, tt => o.set(1, S.base, tt)); later(Q, hideAt, tt => o.set(0, S.snap, tt)); }
      later(Q, hideAt + .001, () => { busy = false; fast.disabled = slow.disabled = false; ls.setAttribute('aria-busy', 'false'); }); };
    fast.onclick = () => go(.18); slow.onclick = () => go(1.6);
    return t => {
      drain(Q, t);
      const p = clamp(o.at(t)); sp.style.opacity = p.toFixed(3); sp.style.visibility = p < .01 ? 'hidden' : 'visible'; sp.style.filter = p < .98 ? `blur(${((1 - p)*BLUR).toFixed(2)}px)` : 'none'; sp.style.transform = `scale(${(.9 + .1*p).toFixed(3)})`;
      if ((p > .5) !== vis){ vis = p > .5; sp.setAttribute('aria-hidden', !vis); }
      svg.style.transform = `rotate(${(t*420 % 360).toFixed(1)}deg)`;
      layers.forEach((l, k) => lsw.apply(l, k, t, 4)); ups.forEach(u => usw.apply(u, u.dataset.k, t, 3));
      let ph = 'idle';
      if (runI){ if (t < runI.end) ph = runI.would && t >= runI.showAt ? 'spin' : 'wait'; else if (runI.would && t < runI.hideAt) ph = 'hold'; else ph = runI.would ? 'slow' : 'fast'; }
      psw.to(ph, t); phs.forEach(s => psw.apply(s, s.dataset.k, t, 3));
      if (runI){ const e = clamp((Math.min(t, runI.end) - runI.start)/AX), a = runI.would ? clamp((runI.showAt - runI.start)/AX) : 0, b = runI.would ? clamp((Math.min(t, runI.hideAt) - runI.start)/AX) : 0;
        el.style.width = (e*100).toFixed(2) + '%'; sv.style.left = (a*100).toFixed(2) + '%'; sv.style.width = (t >= runI.showAt && runI.would ? Math.max(0, b - a)*100 : 0).toFixed(2) + '%'; tm.textContent = clamp(Math.min(t, runI.end) - runI.start, 0, 9).toFixed(2) + ' s'; }
      else { el.style.width = '0%'; sv.style.width = '0%'; tm.textContent = '0.00 s'; }
    };
  }});
})();