

/* ---------- Status and records (organisms) ---------- */
(() => {
const xEl = (tag, css, text) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; };
const xPush = (q, t, fn) => { q.push([t, fn]); q.sort((a, b) => a[0] - b[0]); };
const xDrain = (q, t) => { while (q.length && q[0][0] <= t) q.shift()[1](); };
// weighted color chain: ws are 0..1 tracks, cols the matching colors
const xBlend = (ws, cols) => { let c = cols[0], a = Math.max(ws[0], 0); for (let k = 1; k < cols.length; k++){ const w = Math.max(ws[k], 0); a += w; if (w > .002) c = `color-mix(in oklab, ${cols[k]} ${(w/a*100).toFixed(1)}%, ${c})`; } return c; };
// two stacked text layers that Swap, so a label can change without layout jumps
const xText = (host, css = '') => {
  const s = [0, 1].map(() => { const e = xEl('span', 'position:absolute;left:0;top:0;white-space:nowrap;' + css); host.appendChild(e); return e; });
  const sw = new Swap(0); let k = 0, cur = null;
  return { put(text, instant){ if (text === cur) return; cur = text;
      if (instant){ s[k].textContent = text; sw.cur = k; sw.prev = null; sw.t = -9; return; }
      k ^= 1; s[k].textContent = text; sw.to(k); },
    render(t){ s.forEach((e, i) => sw.apply(e, i, t)); } };
};
const xGeo = b => [b.offsetLeft, b.offsetLeft + b.offsetWidth];

/* ================================================================ 1. Notice banner */
atom({ id:'noticebanner', cat:'Status and records', name:'Notice banner', block:'NoticeBanner', fam:['X','M','S'], wide:true,
  html:`<style>
.nnb{position:absolute;left:12px;right:12px;top:12px;bottom:12px;overflow:hidden;display:flex;flex-direction:column}
.nb-top{flex:none;height:40px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 8px 0 14px;border-bottom:1px solid var(--line-soft)}
.nb-slot{flex:none;position:relative;height:0;overflow:hidden}
.nb-in{position:absolute;left:0;right:0;top:0;padding:10px 12px 0}
.nb-ban{display:flex;align-items:flex-start;gap:12px;border-radius:10px;padding:11px 13px}
.nb-ls{flex:1;min-width:0;display:grid}
.nb-n{grid-area:1/1;display:flex;gap:10px;align-items:flex-start;min-width:0}
.nb-n>span{flex:none;display:flex;margin-top:1px}
.nb-n b{display:block;font-size:13px;line-height:18px;font-weight:600}
.nb-n p{margin:2px 0 0;font-size:12.5px;line-height:17px;color:var(--muted)}
.nb-lk{border:0;background:none;padding:0;margin-top:4px;font-size:12.5px;font-weight:500;cursor:pointer;text-decoration:underline;text-underline-offset:2px;text-decoration-thickness:1px}
.nb-x{flex:none;border:0;background:none;color:var(--muted);font-size:12.5px;cursor:pointer;padding:2px 6px;border-radius:6px}
.nb-body{padding:12px 14px;display:flex;flex-direction:column}
.nb-r{display:flex;justify-content:space-between;align-items:center;height:30px;font-size:13px;border-bottom:1px solid var(--line-soft)}
.nb-r:last-child{border-bottom:0}
</style>
<div class="nnb card"><div class="nb-top"><b style="font-size:14px">Dashboard</b><button type="button" class="btn nb-next">Next notice</button></div>
<div class="nb-slot"><div class="nb-in"><div class="nb-ban" role="status"><div class="nb-ls"></div><button type="button" class="nb-x" aria-label="Dismiss notice">Dismiss</button></div></div></div>
<div class="nb-body"><div class="nb-r"><span class="muted">Pages published</span><b class="num">24</b></div><div class="nb-r"><span class="muted">Form submissions this week</span><b class="num">118</b></div><div class="nb-r"><span class="muted">Storage used</span><b class="num">9.2 of 10 GB</b></div></div></div>`,
  desc:'The notice slides down inside a slot whose height springs open, so the dashboard rows are pushed down rather than covered. Next notice cross-morphs the banner fill and border between info, warning and danger while the old copy exits and the new copy enters, never overlapping. Dismiss fades the copy out first, then collapses the slot height after 100ms, and the rows rise to fill it.',
  api:'slot.h = H·natural   sev[k].set(k === next)   swap.to(next)   dismiss: text.set(0); H.set(0, t + EXIT)',
  init(st){
    const slot = $(st,'.nb-slot'), inner = $(st,'.nb-in'), ban = $(st,'.nb-ban'), ls = $(st,'.nb-ls'), nx = $(st,'.nb-next'), dis = $(st,'.nb-x');
    const SEV = [
      { c:'var(--accent)', t:'var(--accent-tint)', ic:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5h.01"/>' },
      { c:'var(--warning)', t:'var(--warning-tint)', ic:'<path d="M12 4 3 20h18z"/><path d="M12 10v4.5M12 17.5h.01"/>' },
      { c:'var(--danger)', t:'var(--danger-tint)', ic:I.alert }
    ];
    const N = [
      { sev:0, title:'Scheduled maintenance on Saturday', body:'The admin panel will be read-only from 02:00 to 02:30 UTC while the database is upgraded.', link:'Learn more' },
      { sev:1, title:'Your license renews in 6 days', body:'Update the payment method on file before October 9 to avoid an interruption.', link:'Billing settings' },
      { sev:2, title:'Last night’s backup did not finish', body:'Storage was full at 03:12 UTC. Free up space, then run a backup now.', link:'View backup log' }
    ];
    const layers = N.map(n => { const s = SEV[n.sev], d = xEl('div'); d.className = 'nb-n';
      d.innerHTML = `<span style="color:${s.c}">${ic(s.ic, 16, 2.25)}</span><div style="min-width:0"><b style="color:${s.c}"></b><p></p><button type="button" class="nb-lk" style="color:${s.c}"></button></div>`;
      $(d,'b').textContent = n.title; $(d,'p').textContent = n.body; $(d,'.nb-lk').textContent = n.link; ls.appendChild(d); return d; });
    const W = N.map((n, i) => new Track(i === 0 ? 1 : 0)), H = new Track(1), TO = new Track(1), sw = new Swap(0);
    let cur = 0, open = true;
    const show = k => { const t = now();
      if (open){ if (k === cur) return; cur = k; W.forEach((w, i) => w.set(i === k ? 1 : 0, S.soft)); sw.to(k); }
      else { cur = k; W.forEach((w, i) => w.jump(i === k ? 1 : 0)); sw.cur = k; sw.prev = null; sw.t = -9; open = true; H.set(1, S.base); TO.set(1, S.base, t + .14); } };
    nx.onclick = () => show((cur + 1) % N.length);
    dis.onclick = () => { if (!open) return; open = false; TO.set(0, S.snap); H.set(0, S.base, now() + EXIT); nx.focus({ preventScroll:true }); };
    return t => {
      const h = clamp(H.at(t)), nat = inner.offsetHeight;
      slot.style.height = px(h*nat); inner.style.transform = `translateY(${px((h - 1)*nat)})`;
      slot.style.visibility = h < .004 ? 'hidden' : 'visible'; slot.inert = !open;
      const ws = W.map(w => w.at(t));
      ban.style.background = xBlend(ws, SEV.map(s => s.t));
      ban.style.borderColor = `color-mix(in oklab, ${xBlend(ws, SEV.map(s => s.c))} 55%, transparent)`;
      layers.forEach((l, k) => sw.apply(l, k, t));
      fade(ls, TO.at(t), null);
    };
  }});

/* ================================================================ 2. Consent banner */
atom({ id:'consent', cat:'Status and records', name:'Consent banner', block:'ConsentBanner', fam:['X','M','S'], wide:true, tall:true,
  html:`<style>
.cn-site{position:absolute;inset:0;background:var(--card);overflow:hidden}
.cn-nav{height:44px;display:flex;align-items:center;gap:18px;padding:0 120px 0 18px;border-bottom:1px solid var(--line-soft);font-size:13px;white-space:nowrap;overflow:hidden}
.cn-nav b{font-size:14px;letter-spacing:-.01em;margin-right:6px}
.cn-hero{padding:22px 20px;max-width:560px}
.cn-hero h4{margin:0 0 8px;font-size:24px;line-height:1.15;letter-spacing:-.025em;text-wrap:balance}
.cn-hero p{margin:0 0 10px;font-size:13.5px;color:var(--muted);line-height:1.55}
.cn-bx{position:absolute;bottom:12px;left:0;overflow:hidden;z-index:5;background:var(--card);box-shadow:var(--shadow)}
.cn-ct{position:absolute;left:0;top:0;overflow-y:auto;overscroll-behavior:contain;padding:14px 16px;display:flex;flex-direction:column;scrollbar-width:thin}
.cn-k{font-size:11.5px;line-height:14px;font-weight:600;color:var(--accent);margin-bottom:2px}
.cn-tt{display:grid}
.cn-tt h2{grid-area:1/1;margin:0;font-size:17px;line-height:24px;font-weight:600;letter-spacing:-.01em}
.cn-in{overflow:hidden;flex:none}
.cn-in>div{padding-top:6px}
.cn-in p{margin:0;font-size:13px;line-height:1.5;color:var(--muted);max-width:62ch}
.cn-lks{display:flex;gap:14px;margin-top:6px}
.cn-lk{border:0;background:none;padding:0;font-size:12.5px;font-weight:500;color:var(--ink);cursor:pointer;text-decoration:underline;text-underline-offset:2px;text-decoration-thickness:1px}
.cn-lk[aria-expanded="true"]{text-decoration-thickness:2px}
.cn-pd{margin-top:8px;padding:9px 11px;border-radius:9px;background:var(--raised);font-size:12.5px;line-height:1.5;color:var(--ink);max-width:62ch}
.cn-pd[hidden]{display:none}
.cn-cats{overflow:hidden;flex:none;height:0}
.cn-cin{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:6px;padding-top:8px}
.cn-op{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--line-soft);border-radius:10px;padding:7px 10px;cursor:pointer}
.cn-op strong{display:block;font-size:13px;line-height:16px;font-weight:600}
.cn-op small{display:block;font-size:12px;line-height:15px;color:var(--muted)}
.cn-sw{flex:none;position:relative;width:36px;height:22px;border-radius:11px;border:0;padding:0;cursor:pointer}
.cn-sw i{position:absolute;left:3px;top:3px;width:16px;height:16px;border-radius:50%;background:var(--card);box-shadow:0 1px 2px rgba(16,20,26,.25)}
.cn-sw[aria-disabled="true"]{cursor:default;opacity:.6}
.cn-act{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;justify-content:flex-end}
.cn-nr .cn-act .btn{flex:1 1 auto}
.cn-mid{display:grid}.cn-mid span{grid-area:1/1;text-align:center}
.cn-tab{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:7px;border:0;background:none;border-radius:inherit;font-size:12.5px;font-weight:500;white-space:nowrap;cursor:pointer;color:var(--ink)}
</style>
<div class="cn-site"><div class="cn-nav"><b>Meadowlark Journal</b><span>Essays</span><span>Archive</span><span>About</span></div>
<div class="cn-hero"><h4>How a county budget gets written</h4><p>Most of the decisions are made in the spring, in meetings that few residents attend. This guide follows one budget line from request to vote.</p><p>Start with the department requests, then read the finance office’s revisions before the public hearing.</p></div></div>
<button type="button" class="btn cn-re" style="position:absolute;top:7px;right:12px;z-index:6">Replay</button><div class="ro cn-ro" style="top:auto;bottom:18px;right:16px" aria-live="polite">No choice yet</div>
<div class="cn-bx"><div class="cn-ct" role="dialog" aria-label="Privacy choices" aria-describedby="consent-copy"><span class="cn-k">Privacy choices</span>
<div class="cn-tt"><h2>Your visit, your choice.</h2><h2>Choose what this site may use.</h2></div>
<div class="cn-in"><div><p id="consent-copy">Necessary storage keeps this site working. Analytics, personalization and marketing stay off unless you choose them.</p><div class="cn-lks"><button type="button" class="cn-lk" aria-expanded="false" aria-controls="consent-pd">Cookie policy</button><button type="button" class="cn-lk" aria-expanded="false" aria-controls="consent-pd">Privacy policy</button></div><div class="cn-pd" id="consent-pd" role="region" aria-live="polite" hidden></div></div></div>
<div class="cn-cats"><div class="cn-cin"></div></div>
<div class="cn-act"><button type="button" class="btn cn-no">Necessary only</button><button type="button" class="btn cn-mid" aria-expanded="false"><span>Choose preferences</span><span>Save preferences</span></button><button type="button" class="btn cn-all">Accept all</button></div></div>
<button type="button" class="cn-tab" aria-label="Reopen privacy choices">${ic('<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.500 7-10V6z"/><path d="m9 12 2.200 2.200L15.500 10"/>', 15)}<span>Privacy choices</span></button></div>`,
  desc:'The banner rises from the bottom edge. Customize does not open a dialog: the intro fades and its height collapses while the four categories grow in place and the title swaps, and the middle button swaps to Save preferences. Every optional switch starts off, the three buttons carry equal weight, and focus lands on Necessary only. After a choice the copy exits first, then the same surface morphs its size, radius and position into a small tab in the corner; the tab label enters last. Clicking the tab reverses it. Cookie policy and Privacy policy open a short note in place; the same link again closes it.',
  api:'rise: y.set(0)   customize: intro.h.set(0), cats.h.set(measure), title.swap()   choose: copy.set(0); box.{w,h,x,r}.set(tab, t + EXIT); label.set(1, t + EXIT + .1)',
  init(st){
    const bx = $(st,'.cn-bx'), ct = $(st,'.cn-ct'), tab = $(st,'.cn-tab'), tts = $$(st,'.cn-tt h2'), intro = $(st,'.cn-in'), introI = intro.firstElementChild, cats = $(st,'.cn-cats'), cin = $(st,'.cn-cin');
    const btnNo = $(st,'.cn-no'), btnMid = $(st,'.cn-mid'), btnAll = $(st,'.cn-all'), midL = $$(btnMid,'span'), ro = $(st,'.cn-ro'), re = $(st,'.cn-re');
    const pd = $(st,'#consent-pd'), pdBtns = $$(st,'.cn-lk'), PD = ['Your choices are stored on this device. Necessary cookies keep checkout and saved choices working. Every other category stays off until you switch it on.', 'Analytics counts page views without identifying you. Personalization and marketing stay off unless you turn them on. Change any of this from the privacy choices tab.'];
    let pdOpen = -1;
    const setPd = i => { pdOpen = i; pdBtns.forEach((b, j) => b.setAttribute('aria-expanded', j === i)); pd.hidden = i < 0; if (i >= 0) pd.textContent = PD[i]; };
    pdBtns.forEach((b, i) => b.onclick = () => setPd(pdOpen === i ? -1 : i));
    const OPT = [['Necessary','Required for security, checkout and saved privacy choices.'],['Analytics','Helps the site owner understand useful pages and drop-off.'],['Personalization','Remembers optional display and content preferences.'],['Marketing','Measures campaigns and relevant promotions.']];
    const sws = OPT.map(([n, d], i) => { const l = xEl('label'); l.className = 'cn-op';
      l.innerHTML = `<span><strong></strong><small></small></span><button type="button" role="switch" class="cn-sw" aria-checked="${i === 0}"><i></i></button>`;
      $(l,'strong').textContent = n; $(l,'small').textContent = d; const b = $(l,'button'); b.setAttribute('aria-label', n);
      if (i === 0) b.setAttribute('aria-disabled', 'true'); cin.appendChild(l); return b; });
    const SW = OPT.map((o, i) => new Track(i === 0 ? 1 : 0)), draft = [true, false, false, false], saved = [true, false, false, false];
    const E = new Track(0), M = new Track(0), CO = new Track(1), R = new Track(0), TO = new Track(0), tsw = new Swap(0), msw = new Swap(0), q = [];
    let state = 'open', expanded = false, started = false, lastOw = -1;
    const syncSwitches = inst => draft.forEach((v, i) => { sws[i].setAttribute('aria-checked', v); inst ? SW[i].jump(v ? 1 : 0) : SW[i].set(v ? 1 : 0); });
    const summary = () => { const on = OPT.slice(1).filter((o, i) => saved[i + 1]).map(o => o[0].toLowerCase());
      return on.length === 0 ? 'Saved: necessary only' : on.length === 3 ? 'Saved: all categories' : 'Saved: ' + on.join(', '); };
    const setExpanded = v => { expanded = v; E.set(v ? 1 : 0, v ? S.base : S.snap); tsw.to(v ? 1 : 0); msw.to(v ? 1 : 0); btnMid.setAttribute('aria-expanded', v); };
    const choose = vals => { if (state !== 'open') return; const t = now(); vals.forEach((v, i) => { draft[i] = v; saved[i] = v; });
      syncSwitches(false); ro.textContent = summary(); state = 'tab';
      CO.set(0, S.snap, t); expanded = false; E.set(0, S.snap, t + EXIT); M.set(1, S.base, t + EXIT); TO.set(1, S.base, t + EXIT + .1);
      xPush(q, t + EXIT + .22, () => { tsw.cur = 0; tsw.prev = null; tsw.t = -9; msw.cur = 0; msw.prev = null; msw.t = -9; btnMid.setAttribute('aria-expanded', 'false'); if (state === 'tab') tab.focus({ preventScroll:true }); }); };
    const reopen = () => { if (state !== 'tab') return; const t = now(); state = 'open'; saved.forEach((v, i) => draft[i] = v); syncSwitches(true);
      TO.set(0, S.snap, t); M.set(0, S.base, t + EXIT); CO.set(1, S.base, t + EXIT + .1);
      xPush(q, t + EXIT + .22, () => { if (state === 'open') btnNo.focus({ preventScroll:true }); }); };
    const replay = () => { const t = now(); state = 'open'; expanded = false; setPd(-1); q.length = 0; draft.splice(0, 4, true, false, false, false); saved.splice(0, 4, true, false, false, false); syncSwitches(true);
      E.jump(0); M.jump(0); CO.jump(1); TO.jump(0); R.jump(0); R.set(1, S.soft, t + .12); tsw.cur = 0; tsw.prev = null; tsw.t = -9; msw.cur = 0; msw.prev = null; msw.t = -9;
      btnMid.setAttribute('aria-expanded', 'false'); ro.textContent = 'No choice yet'; xPush(q, t + .45, () => { if (state === 'open') btnNo.focus({ preventScroll:true }); }); };
    btnNo.onclick = () => choose([true, false, false, false]);
    btnAll.onclick = () => choose([true, true, true, true]);
    btnMid.onclick = () => { if (!expanded){ setExpanded(true); xPush(q, now() + .12, () => { if (expanded) sws[1].focus({ preventScroll:true }); }); } else choose(draft.slice()); };
    sws.forEach((b, i) => { if (i === 0) return; b.onclick = () => { draft[i] = !draft[i]; b.setAttribute('aria-checked', draft[i]); SW[i].set(draft[i] ? 1 : 0); }; });
    tab.onclick = reopen; re.onclick = replay;
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && state === 'open' && expanded){ e.preventDefault(); setExpanded(false); draft.splice(0, 4, ...saved); syncSwitches(false); btnMid.focus({ preventScroll:true }); } });
    syncSwitches(true);
    return t => {
      if (!started){ started = true; R.set(1, S.soft, t); }
      xDrain(q, t);
      const W = size(st).cw, Hh = size(st).ch, ow = Math.min(W - 24, 640);
      if (ow !== lastOw){ lastOw = ow; ct.style.width = px(ow); ct.classList.toggle('cn-nr', ow < 460); }
      ct.style.maxHeight = px(Hh - 26);
      const e = clamp(E.at(t)), m = clamp(M.at(t)), co = clamp(CO.at(t)), r = clamp(R.at(t));
      intro.style.height = px((1 - e)*size(introI).h); fade(intro, 1 - e, null);
      cats.style.height = px(e*size(cin).h); fade(cats, e, null);
      tts.forEach((h, k) => tsw.apply(h, k, t)); midL.forEach((s, k) => msw.apply(s, k, t));
      SW.forEach((tr, i) => { const p = clamp(tr.at(t)); sws[i].style.background = mix(p, 'var(--accent)', 'var(--line)'); sws[i].firstChild.style.transform = `translateX(${px(p*14)})`; });
      const oh = size(ct).h, tabW = 148, tabH = 34, w = lerp(ow, tabW, m), h = lerp(oh, tabH, m);
      Object.assign(bx.style, { width:px(w), height:px(h), left:px(lerp((W - ow)/2, 12, m)), borderRadius:px(lerp(14, 17, m)), transform:`translateY(${px((1 - r)*(h + 26))})` });
      fade(ct, co, null); ct.style.visibility = co < .01 ? 'hidden' : 'visible'; ct.inert = state !== 'open';
      const to = clamp(TO.at(t)); fade(tab, to, null); tab.style.visibility = to < .01 ? 'hidden' : 'visible'; tab.inert = state !== 'tab';
    };
  }});

/* ================================================================ 3. Bulk selection bar */
atom({ id:'bulkbar', cat:'Status and records', name:'Bulk selection bar', block:'EntityList, EntityListBulkBar', fam:['X','T','M'], wide:true, tall:true,
  html:`<style>
.bk{position:absolute;left:12px;right:12px;top:10px;overflow:hidden}
.bk-top{height:34px;display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 14px}
.bk-slot{position:relative;height:0;overflow:hidden}
.bk-bar{position:absolute;left:8px;right:8px;top:2px;height:40px;display:flex;align-items:center;gap:8px;padding:0 10px 0 12px;background:var(--accent-tint);border-radius:8px}
.bk-bar .btn{padding:4px 10px;font-size:12.5px}
.bk-hd,.bk-r{display:grid;grid-template-columns:34px minmax(0,1fr) 96px 64px;align-items:center;height:32px;padding:0 8px 0 4px;column-gap:8px}
.bk-nd .bk-hd,.bk-nd .bk-r{grid-template-columns:34px minmax(0,1fr) 96px}.bk-nd .bk-d{display:none}
.bk-nd .bk-bar{gap:5px;padding:0 8px}.bk-nd .bk-bar .btn{padding:4px 8px}.bk-nd .bk-bar .bk-sp{display:none}
.bk-hd{font-size:12px;color:var(--muted);border-top:1px solid var(--line-soft);border-bottom:1px solid var(--line-soft)}
.bk-r{font-size:13px;border-bottom:1px solid var(--line-soft)}
.bk-t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}
.bk-d{font-size:12px;color:var(--muted);text-align:right}
.bk-ck{width:28px;height:28px;display:grid;place-items:center;border:0;background:none;cursor:pointer;padding:0;justify-self:center}
.bk-ck i{width:18px;height:18px;border-radius:5px;border:1.5px solid;display:block}
.bk-ck svg{width:100%;height:100%;display:block}
.bk-chip{position:relative;display:block;width:84px;height:22px;border-radius:11px;font-size:12px;font-weight:500}
.bk-em{position:absolute;left:0;right:0;top:140px;text-align:center;font-size:13px;color:var(--muted);pointer-events:none}
</style>
<div class="bk card"><div class="bk-top"><span class="row" style="gap:8px"><b style="font-size:14px">Pages</b><span class="small muted num bk-n6">6</span></span><button type="button" class="btn bk-reset">Reset</button></div>
<div class="bk-slot"><div class="bk-bar" role="region" aria-label="Bulk actions"><span role="status" aria-live="polite" aria-label="0 selected" class="row small" style="gap:5px"><b class="bk-cn" aria-hidden="true" style="font-size:13px"></b><span aria-hidden="true">selected</span></span><span class="bk-sp" style="flex:1"></span><button type="button" class="btn bk-ar" style="margin-left:auto">Archive</button><button type="button" class="btn bk-dl" style="color:var(--danger);border-color:var(--danger)">Delete</button><button type="button" class="btn bk-cl">Clear</button></div></div>
<div class="bk-hd"><span class="bk-hc"></span><span>Title</span><span>Status</span><span class="bk-d">Updated</span></div><div class="bk-rows"></div><div class="row small muted bk-tw" style="gap:6px;padding:8px 12px 10px"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="bk-dv" checked> Row dividers</label></div><div class="bk-em" aria-live="polite">No pages left. Reset brings them back.</div></div>`,
  desc:'Selecting the first row opens a slot above the table: its height springs open and pushes the rows down, then the bar rises into it 50ms later with the count in rolling digits. The header checkbox morphs between empty, check and a dash for mixed. Delete removes the selected rows top-down, 100ms apart: each row fades, then its height collapses, and the count rolls down; the bar leaves only after the last row has gone. Archive swaps each status chip and Clear releases the rows the same way.',
  api:'bar.h.set(n > 0); bar.o.set(n > 0, t + .05); count.set(n)   delete: rows[k].o.set(0, t + k·.1); .h.set(0, t + k·.1 + EXIT); bar.leave(after last)   last live row drops its divider',
  init(st){
    const root = $(st,'.bk'), slot = $(st,'.bk-slot'), bar = $(st,'.bk-bar'), cnt = new Digits($(st,'.bk-cn'), 2), status = $(st,'[role=status]'), rowsEl = $(st,'.bk-rows'), em = $(st,'.bk-em'), n6 = $(st,'.bk-n6'), dvT = $(st,'.bk-dv');
    const bAr = $(st,'.bk-ar'), bDl = $(st,'.bk-dl'), bCl = $(st,'.bk-cl'), bRs = $(st,'.bk-reset');
    const mkCheck = label => {
      const b = xEl('button'); b.type = 'button'; b.className = 'bk-ck'; b.setAttribute('role', 'checkbox'); b.setAttribute('aria-checked', 'false'); b.setAttribute('aria-label', label);
      b.innerHTML = '<i><svg viewBox="0 0 18 18" fill="none" stroke="var(--card)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="ck" d="M4.5 9.500l3 3 6-6.500" pathLength="1" stroke-dasharray="1 1"/><path class="ds" d="M5 9h8" pathLength="1" stroke-dasharray="1 1"/></svg></i>';
      const bx = $(b,'i'), ck = $(b,'.ck'), ds = $(b,'.ds'), f = new Track(0), c = new Track(0), d = new Track(0);
      return { el:b, set(s, t = now()){ b.setAttribute('aria-checked', s === 'mix' ? 'mixed' : String(s === 'on')); f.set(s === 'off' ? 0 : 1, S.base, t); c.set(s === 'on' ? 1 : 0, S.base, t); d.set(s === 'mix' ? 1 : 0, S.base, t); },
        render(t){ const p = clamp(f.at(t)), cv = clamp(c.at(t)), dv = clamp(d.at(t)); bx.style.background = mix(p, 'var(--ink)', 'var(--card)'); bx.style.borderColor = mix(p, 'var(--ink)', 'var(--faint)');
          ck.style.strokeDashoffset = (1 - cv).toFixed(3); ck.style.opacity = cv > .01 ? 1 : 0; ds.style.strokeDashoffset = (1 - dv).toFixed(3); ds.style.opacity = dv > .01 ? 1 : 0; } };
    };
    const DATA = [['Spring launch','Published','Oct 2'],['Pricing','Published','Sep 30'],['Team','Draft','Sep 28'],['Journal: October notes','Draft','Sep 26'],['Contact','Published','Sep 21'],['Press kit','Scheduled','Sep 19']];
    const TONE = { Published:['var(--success)','var(--success-tint)'], Draft:['var(--muted)','var(--raised)'], Scheduled:['var(--warning)','var(--warning-tint)'] };
    const hdr = mkCheck('Select all pages'); $(st,'.bk-hc').appendChild(hdr.el);
    const rows = DATA.map(([title, status, date]) => {
      const w = xEl('div', 'position:relative;overflow:hidden;height:32px'), row = xEl('div'); row.className = 'bk-r';
      row.innerHTML = `<span class="bk-c"></span><span class="bk-t"></span><span><span class="bk-chip"><span class="layer"></span><span class="layer"></span></span></span><span class="bk-d num"></span>`;
      $(row,'.bk-t').textContent = title; $(row,'.bk-d').textContent = date;
      const box = mkCheck('Select ' + title); $(row,'.bk-c').appendChild(box.el);
      const L = $$(row,'.layer'); L[0].textContent = status; L[1].textContent = 'Archived'; w.appendChild(row); rowsEl.appendChild(w);
      const r = { title, w, row, box, chip:$(row,'.bk-chip'), L, csw:new Swap(0), col:TONE[status][0], tint:TONE[status][1], h:new Track(1), o:new Track(1), s:new Track(0), a:new Track(0), selected:false, dead:false, archived:false };
      box.el.onclick = () => { if (busy) return; setSel(r, !r.selected); hdrSync(); barSync(); }; return r; });
    const bh = new Track(0), bo = new Track(0), ET = new Track(0), q = []; let barOpen = false, shown = 0, busy = false, nar = null;
    const live = () => rows.filter(r => !r.dead), sel = () => live().filter(r => r.selected);
    const setSel = (r, v, t = now()) => { r.selected = v; r.s.set(v ? 1 : 0, S.base, t); r.box.set(v ? 'on' : 'off', t); };
    const hdrSync = () => { const n = sel().length, L = live().length; hdr.set(n === 0 ? 'off' : n === L ? 'on' : 'mix'); hdr.el.disabled = L === 0; n6.textContent = L; };
    const label = n => status.setAttribute('aria-label', n + ' selected');
    const closeBar = (t = now()) => { barOpen = false; bo.set(0, S.snap, t); bh.set(0, S.base, t + EXIT); };
    const barSync = (t = now()) => { const n = sel().length;
      if (n > 0){ if (!barOpen){ barOpen = true; bh.set(1, S.base, t); bo.set(1, S.base, t + .05); cnt.dir = 1; cnt.set(String(n), true); }
        else if (n !== shown){ cnt.dir = n > shown ? 1 : -1; cnt.set(String(n)); } shown = n; label(n); }
      else if (barOpen){ closeBar(t); shown = 0; label(0); } };
    hdr.el.onclick = () => { if (busy) return; const L = live(), all = L.length > 0 && sel().length === L.length; const t = now(); L.forEach((r, k) => setSel(r, !all, t + k*.03)); hdrSync(); barSync(); };
    const run = kind => { const list = sel(); if (!list.length || busy) return; busy = true; const t0 = now(), gap = kind === 'delete' ? .1 : .06; let n = list.length;
      [bAr, bDl, bCl].forEach(b => b.disabled = true);
      list.forEach((r, k) => { const ts = t0 + k*gap;
        xPush(q, ts, () => { n--; r.selected = false; r.s.set(0, S.base, ts); r.box.set('off', ts);
          if (kind === 'delete'){ r.dead = true; r.o.set(0, S.snap, ts); r.h.set(0, S.base, ts + EXIT); }
          if (kind === 'archive'){ r.archived = true; r.a.set(1, S.base, ts); r.csw.to(1, ts); }
          cnt.dir = -1; cnt.set(String(n)); label(n); hdrSync(); }); });
      xPush(q, t0 + (list.length - 1)*gap + (kind === 'delete' ? EXIT : 0) + .14, () => { closeBar(); shown = 0; busy = false; [bAr, bDl, bCl].forEach(b => b.disabled = false);
        if (!live().length) ET.set(1, S.base); hdrSync(); if (!hdr.el.disabled) hdr.el.focus({ preventScroll:true }); else bRs.focus({ preventScroll:true }); }); };
    bAr.onclick = () => run('archive'); bDl.onclick = () => run('delete'); bCl.onclick = () => run('clear');
    bRs.onclick = () => { if (busy) return; const t0 = now(); let k = 0;
      rows.forEach(r => { const was = r.dead; r.selected = false; r.s.set(0); r.box.set('off'); if (r.archived){ r.archived = false; r.a.set(0); r.csw.to(0); }
        if (was){ r.dead = false; r.h.set(1, S.base, t0 + k*.05); r.o.set(1, S.base, t0 + k*.05 + .06); k++; } });
      ET.set(0, S.snap); hdrSync(); if (barOpen){ closeBar(); shown = 0; label(0); } };
    hdrSync();
    return t => {
      xDrain(q, t);
      const isN = st.clientWidth < 520; if (isN !== nar){ nar = isN; root.classList.toggle('bk-nd', isN); }
      const h = clamp(bh.at(t)); slot.style.height = px(h*44); slot.style.visibility = h < .004 ? 'hidden' : 'visible'; slot.inert = !barOpen;
      const o = clamp(bo.at(t)); fade(bar, o, (1 - o)*16);
      cnt.render(t); hdr.render(t);
      const lastLive = live().pop(), showDv = dvT.checked;
      rows.forEach(r => { const hh = clamp(r.h.at(t)); r.w.style.height = px(hh*32); r.w.style.visibility = hh < .01 ? 'hidden' : 'visible'; r.w.inert = r.dead;
        r.row.style.borderBottom = (!showDv || r === lastLive) ? '1px solid transparent' : '1px solid var(--line-soft)';
        fade(r.row, r.o.at(t), null); r.row.style.background = `color-mix(in oklab, var(--accent-tint) ${(clamp(r.s.at(t))*100).toFixed(1)}%, transparent)`;
        r.box.render(t); const a = clamp(r.a.at(t)); r.chip.style.background = mix(a, 'var(--raised)', r.tint); r.chip.style.color = mix(a, 'var(--muted)', r.col);
        r.L.forEach((l, k) => r.csw.apply(l, k, t)); });
      const e = clamp(ET.at(t)); fade(em, e, null); em.style.visibility = e < .01 ? 'hidden' : 'visible'; em.style.top = px(slot.offsetHeight + 34 + 32 + 60);
    };
  }});

/* ================================================================ 4. Snackbar with action */
atom({ id:'snackbar', cat:'Status and records', name:'Snackbar with action', block:'ExportSnackbar', fam:['X','T','S'],
  html:`<style>
.sn-bg{position:absolute;left:12px;right:12px;top:12px;bottom:12px;overflow:hidden;padding:12px 14px}
.sn-w{position:absolute;left:12px;right:12px;bottom:18px;display:flex;justify-content:center;pointer-events:none}
.sn-sb{position:relative;overflow:hidden;width:100%;max-width:400px;display:flex;align-items:center;gap:12px;padding:10px 9px 12px 14px;pointer-events:auto}
.sn-tb{position:absolute;left:0;bottom:0;height:2px;width:100%;background:var(--success);transform-origin:0 50%}
.sn-ac{position:relative;display:grid;border:0;border-radius:8px;padding:6px 10px;font-size:12.5px;font-weight:600;cursor:pointer;flex:none}
.sn-ac>span{grid-area:1/1;display:flex;align-items:center;gap:6px;justify-content:center}
.sn-x{flex:none;width:24px;height:24px;border:0;background:none;color:var(--muted);border-radius:6px;cursor:pointer;display:grid;place-items:center;padding:0}
</style>
<div class="sn-bg card"><div class="row" style="justify-content:space-between"><b style="font-size:14px">Pages</b><button type="button" class="btn ink sn-go">Export pages</button></div><div class="col small muted" style="gap:6px;margin-top:12px"><div class="row" style="justify-content:space-between"><span>Spring launch</span><span>Published</span></div><div class="row" style="justify-content:space-between"><span>Pricing</span><span>Published</span></div><div class="row" style="justify-content:space-between"><span>Team</span><span>Draft</span></div></div></div>
<div class="sn-w"><div class="sn-sb card" role="status">${ic('<circle cx="12" cy="12" r="9"/><path d="m8 12.200 2.800 2.800L16 9.500"/>', 18, 2.25).replace('stroke="currentColor"', 'stroke="var(--success)" style="flex:none"')}<span style="flex:1;min-width:0"><b style="display:block;font-size:13.5px;font-weight:500">Export ready</b><span class="small muted" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">pages-2026-10.zip, 4.2 MB</span></span><button type="button" class="sn-ac"><span>${ic(I.file, 14)}Open</span><span>${ic(I.check, 14, 2.25)}Done</span></button><button type="button" class="sn-x" aria-label="Dismiss">${ic(I.x, 12, 2.25)}</button><i class="sn-tb" aria-hidden="true"></i></div></div>`,
  desc:'The snackbar rises from the bottom edge while a thin bar under it drains over six seconds. Hovering or focusing the snackbar pauses the countdown and resuming pushes the deadline back by exactly the paused time. Open swaps its label to Done with a tint morph, the countdown freezes, and the snackbar leaves 0.9s later. Dismiss and the timeout use the same exit.',
  api:'o.set(1); remaining = deadline − t   hover: pausedAt = t; leave: deadline += t − pausedAt   action: swap.to(1); out at t + .9',
  init(st){
    const sb = $(st,'.sn-sb'), tb = $(st,'.sn-tb'), ac = $(st,'.sn-ac'), acL = $$(ac,'span'), go = $(st,'.sn-go'), xb = $(st,'.sn-x'), DUR = 6;
    const O = new Track(0), D = new Track(0), asw = new Swap(0), q = [];
    let shown = false, done = false, hold = 0, pausedAt = 0, deadline = 0, frozen = 0, started = false;
    const show = () => { const t = now(); if (shown && !done){ deadline = t + DUR; return; } if (done) return; shown = true; done = false; deadline = t + DUR; hold = 0; asw.cur = 0; asw.prev = null; asw.t = -9; D.jump(0); O.set(1, S.base, t); };
    const dismiss = () => { if (!shown) return; shown = false; O.set(0, S.snap); xPush(q, now() + .4, () => { done = false; }); };
    const rem = t => done ? frozen : hold ? deadline - pausedAt : deadline - t;
    const holdSet = v => { if (done || !shown) return; const was = hold; hold = Math.max(0, hold + v); if (!was && hold) pausedAt = now(); if (was && !hold) deadline += now() - pausedAt; };
    sb.addEventListener('pointerenter', () => holdSet(1)); sb.addEventListener('pointerleave', () => holdSet(-1));
    sb.addEventListener('focusin', () => holdSet(1)); sb.addEventListener('focusout', () => holdSet(-1));
    ac.onclick = () => { if (!shown || done) return; const t = now(); frozen = rem(t); done = true; asw.to(1); D.set(1, S.base); xPush(q, t + .9, dismiss); };
    xb.onclick = dismiss; go.onclick = show;
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && shown) dismiss(); });
    return t => {
      if (!started){ started = true; show(); }
      xDrain(q, t);
      const o = clamp(O.at(t)); pop(sb, o, 18); sb.inert = !shown;
      if (shown && !done && rem(t) <= 0) dismiss();
      tb.style.transform = `scaleX(${clamp(rem(t)/DUR).toFixed(4)})`;
      const d = clamp(D.at(t)); ac.style.background = mix(d, 'var(--success-tint)', 'var(--raised)'); ac.style.color = mix(d, 'var(--success)', 'var(--ink)');
      acL.forEach((l, k) => asw.apply(l, k, t));
    };
  }});

/* ================================================================ 5. Avatar picker */
atom({ id:'avatarpicker', tall:true, cat:'Status and records', name:'Avatar picker', block:'AvatarPicker', fam:['S','X','E'],
  html:`<style>
.avp{width:min(360px,92%);padding:16px;display:flex;flex-direction:column;gap:12px}
.av-ph{position:relative;flex:none;width:88px;height:88px}
.av-ph svg.rg{position:absolute;inset:0;width:100%;height:100%}
.av-im{position:absolute;left:8px;top:8px;width:72px;height:72px;border-radius:50%;overflow:hidden;background:var(--raised)}
.av-im>div{position:absolute;inset:0}
.av-im svg{display:block;width:100%;height:100%}
.avp .btn{white-space:nowrap}
.av-pr{position:relative;display:flex;gap:8px;padding:3px}
.av-p{flex:none;width:36px;height:36px;border-radius:50%;border:0;padding:0;overflow:hidden;cursor:pointer;position:relative;z-index:1;background:var(--raised)}
.av-p svg{display:block;width:100%;height:100%}
.av-rg{position:absolute;top:0;height:42px;border-radius:21px;border:2px solid var(--accent);left:0;pointer-events:none}
</style>
<div class="avp card"><div class="row" style="gap:16px"><div class="av-ph" role="img" aria-label="Current avatar: initials MO"><svg class="rg" viewBox="0 0 88 88" aria-hidden="true"><circle cx="44" cy="44" r="40" fill="none" stroke="var(--line)" stroke-width="3"/><circle class="arc" cx="44" cy="44" r="40" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" transform="rotate(-90 44 44)"/></svg><div class="av-im"></div></div>
<div class="col" style="gap:8px;min-width:0"><div><b style="display:block;line-height:1.3">Maya Okafor</b><span class="small muted">Editor</span></div><div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn av-up">Upload photo</button><button type="button" class="btn av-cl" disabled>Clear</button></div></div></div>
<div><div class="small muted" style="margin-bottom:6px">Or choose a preset</div><div class="av-pr" role="group" aria-label="Preset avatars"><i class="av-rg"></i></div></div>
<div class="small muted av-st" role="status" style="position:relative;height:18px"></div></div>`,
  desc:'Choosing a preset cross-fades the picture: the new image fades in over the old one, which stays opaque underneath until the new one is whole, so the circle is never blank. The selection ring moves between presets with lagging edges. Upload draws a progress ring around the avatar while the picture dims, then the ring fades, the photo cross-fades in, and the status line swaps its message.',
  api:'new.o.set(1) over old (old held until new ≥ .995)   ring.go(l, r)   upload: ring.p.set(.18 → .52 → .83 → 1); photo.o.set(1); status.swap()',
  init(st){
    const im = $(st,'.av-im'), ph = $(st,'.av-ph'), arc = $(st,'.arc'), up = $(st,'.av-up'), cl = $(st,'.av-cl'), pr = $(st,'.av-pr'), rg = $(st,'.av-rg');
    const C = 2*Math.PI*40; arc.style.strokeDasharray = C.toFixed(2);
    const NAMES = ['Olive','Slate','Amber','Brick','Sage'], COL = [['var(--accent-tint)','var(--accent)'],['var(--raised)','var(--ink)'],['var(--warning-tint)','var(--warning)'],['var(--danger-tint)','var(--danger)'],['var(--success-tint)','var(--muted)']];
    const art = k => { const [bg, fg] = COL[k]; const extra = k === 1 ? `<circle cx="32" cy="32" r="29" fill="none" stroke="${fg}" stroke-width="1.5" opacity=".35"/>` : k === 3 ? `<path d="M0 12 L52 64 H64 V52 L12 0Z" fill="${fg}" opacity=".14"/>` : k === 4 ? `<circle cx="12" cy="12" r="6" fill="${fg}" opacity=".25"/><circle cx="54" cy="18" r="4" fill="${fg}" opacity=".25"/>` : '';
      return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="${bg}"/>${extra}<circle cx="32" cy="26" r="11" fill="${fg}"/><path d="M10 64C10 47 22 40 32 40S54 47 54 64Z" fill="${fg}"/></svg>`; };
    const ART = [`<div style="display:grid;place-items:center;background:var(--accent-tint);color:var(--accent);font-size:26px;font-weight:600;letter-spacing:-.02em">MO</div>`, ...NAMES.map((n, k) => `<div>${art(k)}</div>`), `<div>${scene(true)}</div>`];
    im.innerHTML = ART.join(''); const layers = [...im.children], O = ART.map((a, i) => new Track(i === 0 ? 1 : 0));
    const LAB = ['initials MO', ...NAMES.map(n => n.toLowerCase() + ' preset'), 'uploaded photo'];
    const btns = NAMES.map((n, k) => { const b = xEl('button'); b.type = 'button'; b.className = 'av-p'; b.setAttribute('aria-label', n + ' preset avatar'); b.setAttribute('aria-pressed', 'false'); b.innerHTML = art(k); pr.insertBefore(b, rg); return b; });
    const ed = edges(0, 0), RV = new Track(0), RP = new Track(0), RO = new Track(0), DM = new Track(0), q = [];
    const stt = $(st,'.av-st'), tx = xText(stt); tx.put('Choose a preset or upload a photo', true);
    let top = 0, below = -1, busy = false, ringOn = false;
    const setImg = i => { if (i === top) return; below = top; top = i; O[i].jump(0); O[i].set(1, S.soft); cl.disabled = i === 0; ph.setAttribute('aria-label', 'Current avatar: ' + LAB[i]); };
    const geo = b => [b.offsetLeft - 3, b.offsetLeft + b.offsetWidth + 3];
    btns.forEach((b, k) => b.onclick = () => { if (busy) return; setImg(k + 1); btns.forEach((x, j) => x.setAttribute('aria-pressed', j === k));
      if (!ringOn){ ed.jump(...geo(b)); ringOn = true; RV.set(1, S.base); } else ed.go(...geo(b)); tx.put('Preset applied'); });
    const ringOff = () => { ringOn = false; RV.set(0, S.snap); btns.forEach(x => x.setAttribute('aria-pressed', 'false')); };
    cl.onclick = () => { if (busy || top === 0) return; setImg(0); ringOff(); tx.put('Photo removed'); };
    up.onclick = () => { if (busy) return; busy = true; up.disabled = true; cl.disabled = true; const t = now(); ringOff(); tx.put('Uploading photo');
      ph.setAttribute('aria-busy', 'true'); RO.set(1, S.base, t); DM.set(1, S.base, t); RP.jump(0);
      [[0, .12], [.35, .52], [.8, .83], [1.25, 1]].forEach(([dt, v]) => xPush(q, t + dt, () => RP.set(v, S.soft)));
      xPush(q, t + 1.6, () => { RO.set(0, S.snap); DM.set(0, S.base); setImg(6); tx.put('Photo uploaded'); up.disabled = false; busy = false; cl.disabled = false; ph.removeAttribute('aria-busy'); }); };
    return t => {
      xDrain(q, t);
      const tO = clamp(O[top].at(t));
      layers.forEach((l, i) => { let v = 0; if (i === top) v = tO; else if (i === below) v = tO > .995 ? 0 : 1; l.style.opacity = v.toFixed(3); l.style.visibility = v < .01 ? 'hidden' : 'visible'; l.style.zIndex = i === top ? 2 : 1; });
      im.style.opacity = (1 - .5*clamp(DM.at(t))).toFixed(3);
      const rp = clamp(RP.at(t)), ro = clamp(RO.at(t)); arc.style.strokeDashoffset = (C*(1 - rp)).toFixed(2); arc.parentNode.style.opacity = ro.toFixed(3);
      const a = ed.A.at(t), b = ed.B.at(t); rg.style.transform = `translateX(${px(a)})`; rg.style.width = px(b - a); rg.style.opacity = clamp(RV.at(t)).toFixed(3);
      tx.render(t);
    };
  }});

/* ================================================================ 6. Date range selector */
atom({ id:'daterange', cat:'Status and records', name:'Date range selector', block:'DateRangeSelector', fam:['E','M','S'], tall:true,
  html:`<style>
.dr{width:min(322px,92%);display:flex;flex-direction:column;gap:8px}
.dr-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));position:relative;z-index:1}
.dr-wk{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));height:22px;align-items:center;text-align:center;font-size:11.5px;color:var(--muted)}
.dr-rows{position:relative}
.dr-pl{position:absolute;inset:0;z-index:0;pointer-events:none}
.dr-pl i{position:absolute;left:0;height:26px;background:var(--accent-tint)}
.dr-d{position:relative;height:32px;border:0;background:none;padding:0;cursor:pointer;font-size:13px;font-variant-numeric:tabular-nums}
.dr-d:disabled{cursor:default;color:var(--muted)}
.dr-c{position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:var(--accent)}
.dr-n{position:relative}
.dr-t{position:absolute;left:50%;bottom:3px;width:4px;height:4px;margin-left:-2px;border-radius:50%}
</style>
<div class="dr"><div class="seg dr-sg" role="group" aria-label="Range presets"><div class="ind"></div><button type="button">Last 7 days</button><button type="button">This month</button><button type="button">Custom</button></div>
<div><div class="small" style="font-weight:600;padding:2px 2px 4px">October 2026</div><div class="dr-wk" aria-hidden="true"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div><div class="dr-rows"><div class="dr-pl"></div><div class="dr-days" role="group" aria-label="October 2026"></div></div></div>
<div class="row small" style="justify-content:space-between;height:22px;padding:0 2px"><span class="dr-lb" style="position:relative;flex:1;height:20px;line-height:20px" role="status"></span><span class="dr-ct num" style="font-weight:600;white-space:nowrap"><span class="dr-n2"></span> <span class="dr-u muted" style="font-weight:400">days</span></span></div></div>`,
  desc:'The range is one tint plate per week row. When the end day moves, each row’s plate retargets with two edges: the leading edge goes first and the trailing edge lags 60ms, and rows farther from the start row begin 30ms later, so the highlight pours along the weeks. Hovering after the first click previews the range. Preset buttons animate the same plates, the endpoint discs scale in, the count rolls, and the label swaps.',
  api:'rows[r].edges.go(left, right, t + |r − startRow|·.03)   end discs: s.set(isEnd)   count.set(days)   label.swap()',
  init(st){
    const Y = 2026, MO = 9, TODAY = 20, OFF = new Date(Y, MO, 1).getDay(), ND = new Date(Y, MO + 1, 0).getDate(), NR = Math.ceil((OFF + ND)/7);
    const days = $(st,'.dr-days'), pl = $(st,'.dr-pl'), rowsEl = $(st,'.dr-rows'), sg = $(st,'.dr-sg'), ind = $(sg,'.ind'), pb = $$(sg,'button'), lbH = $(st,'.dr-lb'), ctW = $(st,'.dr-ct'), unit = $(st,'.dr-u');
    const lb = xText(lbH), cnt = new Digits($(st,'.dr-n2'), 2), cv = new Track(0), ed2 = edges(0, 0);
    const rowOf = d => Math.floor((OFF + d - 1)/7), colOf = d => (OFF + d - 1)%7, fmt = d => 'Oct ' + d;
    days.style.gridAutoRows = '32px'; rowsEl.style.height = NR*32 + 'px';
    const plates = Array.from({ length:NR }, (_, r) => { const e = xEl('i'); e.style.top = (r*32 + 3) + 'px'; pl.appendChild(e); return { e, ed:edges(0, 0) }; });
    const D = []; let fd = TODAY;
    for (let d = 1; d <= ND; d++){
      const b = xEl('button'); b.type = 'button'; b.className = 'dr-d'; b.tabIndex = d === fd ? 0 : -1; if (d === 1) b.style.gridColumnStart = OFF + 1;
      b.setAttribute('aria-label', `October ${d}, 2026`); b.setAttribute('aria-pressed', 'false'); b.innerHTML = `<i class="dr-c"></i><span class="dr-n">${d}</span>${d === TODAY ? '<b class="dr-t"></b>' : ''}`;
      if (d > TODAY) b.disabled = true; days.appendChild(b); D[d] = { b, n:$(b,'.dr-n'), c:$(b,'.dr-c'), t:$(b,'.dr-t'), s:new Track(0) };
    }
    let a = null, e = null, hv = null, phase = 'idle', preset = 2, cw = 0, lastN = 0;
    const range = () => { if (a == null) return null; const o = e != null ? e : hv != null ? hv : a; return [Math.min(a, o), Math.max(a, o)]; };
    const retarget = inst => { const W = rowsEl.clientWidth; cw = W/7; const rg = range(), ar = a != null ? rowOf(a) : 0, t0 = now();
      plates.forEach((p, r) => { let l = 0, rt = 0;
        if (rg){ const [s, en] = rg, rs = rowOf(s), re = rowOf(en); if (r < rs){ l = rt = W; } else if (r > re){ l = rt = 0; } else { l = r === rs ? (colOf(s) + .5)*cw : 0; rt = r === re ? (colOf(en) + .5)*cw : W; } }
        inst ? p.ed.jump(l, rt) : p.ed.go(l, rt, t0 + Math.abs(r - ar)*.03); });
      D.forEach((x, d) => { if (!x) return; const on = rg && (d === rg[0] || d === rg[1]); x.s.set(on ? 1 : 0); x.b.setAttribute('aria-pressed', !!(rg && d >= rg[0] && d <= rg[1] && (e != null || a === d))); });
      const nn = rg ? rg[1] - rg[0] + 1 : 0; cv.set(rg ? 1 : 0); if (rg){ cnt.dir = nn >= lastN ? 1 : -1; cnt.set(String(nn), inst); lastN = nn; unit.textContent = nn === 1 ? 'day' : 'days'; } };
    const label = inst => { const rg = range(); lb.put(!rg ? 'Pick a start day, then an end day' : phase === 'picking' ? `Starting ${fmt(a)}` : `${fmt(rg[0])} to ${fmt(rg[1])}`, inst); };
    const setPreset = i => { preset = i; pb.forEach((b, k) => b.setAttribute('aria-pressed', k === i)); ed2.go(...xGeo(pb[i])); };
    const apply = i => { setPreset(i); hv = null;
      if (i === 0){ a = TODAY - 6; e = TODAY; phase = 'done'; } else if (i === 1){ a = 1; e = TODAY; phase = 'done'; } else { a = null; e = null; phase = 'idle'; }
      retarget(false); label(); };
    const pick = d => { if (a == null || e != null){ a = d; e = null; hv = null; phase = 'picking'; } else { e = d; if (e < a){ e = a; a = d; } hv = null; phase = 'done'; }
      if (preset !== 2) setPreset(2); retarget(false); label(); };
    const focusDay = d => { if (!D[d] || D[d].b.disabled) return; fd = d; D.forEach((x, k) => x && (x.b.tabIndex = k === d ? 0 : -1)); D[d].b.focus({ preventScroll:true }); };
    D.forEach((x, d) => { if (!x) return; x.b.onclick = () => pick(d);
      x.b.onpointerenter = () => { if (phase === 'picking' && !x.b.disabled && hv !== d){ hv = d; retarget(false); } };
      x.b.onfocus = () => { fd = d; D.forEach((y, k) => y && (y.b.tabIndex = k === d ? 0 : -1)); if (phase === 'picking' && hv !== d){ hv = d; retarget(false); } }; });
    rowsEl.addEventListener('pointerleave', () => { if (hv != null){ hv = null; retarget(false); } });
    days.addEventListener('keydown', ev => { const mv = { ArrowLeft:-1, ArrowRight:1, ArrowUp:-7, ArrowDown:7 }[ev.key]; if (mv){ ev.preventDefault(); const n = fd + mv; if (n >= 1 && n <= TODAY) focusDay(n); } });
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape' && phase === 'picking'){ a = null; e = null; hv = null; phase = 'idle'; retarget(false); label(); } });
    pb.forEach((b, i) => b.onclick = () => apply(i));
    const init = () => { if (!rowsEl.clientWidth) return; ed2.jump(...xGeo(pb[preset])); retarget(true); };
    pb.forEach((b, k) => b.setAttribute('aria-pressed', k === preset)); label(true); cnt.set('', true);
    document.fonts.ready.then(init); requestAnimationFrame(init);
    let started = false;
    return t => {
      if (!started && rowsEl.clientWidth){ started = true; init(); apply(0); }
      if (rowsEl.clientWidth && Math.abs(rowsEl.clientWidth/7 - cw) > .5 && started){ const W = rowsEl.clientWidth; cw = W/7; retarget(true); ed2.jump(...xGeo(pb[preset])); }
      const A = ed2.A.at(t), B = ed2.B.at(t); ind.style.transform = `translate(${px(A)},3px)`; ind.style.width = px(B - A); ind.style.height = 'calc(100% - 6px)';
      plates.forEach(p => { const l = p.ed.A.at(t), r = p.ed.B.at(t); p.e.style.left = px(l); p.e.style.width = px(Math.max(0, r - l)); });
      D.forEach(x => { if (!x) return; const s = clamp(x.s.at(t)); x.c.style.opacity = s.toFixed(3); x.c.style.transform = `scale(${(.6 + .4*s).toFixed(3)})`; x.n.style.color = x.b.disabled ? 'var(--faint)' : mix(s, 'var(--card)', 'var(--ink)'); if (x.t) x.t.style.background = mix(s, 'var(--card)', 'var(--accent)'); });
      lb.render(t); cnt.render(t); fade(ctW, cv.at(t), null);
    };
  }});

/* ================================================================ 7. Timeline scrubber */
atom({ id:'scrubber', cat:'Status and records', name:'Timeline scrubber', block:'TimelineScrubber', fam:['D','T','S'], wide:true,
  html:`<style>
.sc{position:absolute;left:12px;right:12px;top:12px;bottom:10px;display:flex;flex-direction:column;gap:10px}
.sc-pn{flex:none;height:134px;padding:12px 14px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px}
.sc-as{font:12px var(--mono);color:var(--muted);height:16px}
.sc-sw{position:relative;height:88px;margin-top:4px}
.sc-nr .sc-chip{display:none}
.sc-sw>div{position:absolute;inset:0}
.sc-sw p{margin:3px 0 0;font-size:13px;line-height:19px;color:var(--muted);max-width:60ch;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.sc-chip{display:inline-block;font-size:11.5px;font-weight:600;padding:0 8px;border-radius:999px;line-height:20px;margin-right:8px;vertical-align:1px}
.sc-sw b{font-size:16px;letter-spacing:-.01em;line-height:24px}
.sc-st{display:flex;flex-direction:column;gap:8px;min-width:96px}
.sc-st span{display:block;font-size:11.5px;line-height:14px;color:var(--muted)}
.sc-st .digits{font-size:24px;font-weight:600;letter-spacing:-.02em;line-height:30px}
.sc-tr{position:relative;flex:none;height:66px;margin:0 14px;touch-action:pan-y;cursor:grab;user-select:none;-webkit-user-select:none}
.sc-rl{position:absolute;left:0;right:0;top:34px;height:2px;background:var(--line);border-radius:1px}
.sc-pg{position:absolute;left:0;top:34px;height:2px;width:100%;background:var(--accent);border-radius:1px;transform-origin:0 50%}
.sc-dot{position:absolute;top:30px;width:10px;height:10px;margin-left:-5px;border-radius:50%;border:2px solid}
.sc-th{position:absolute;top:25px;left:0;width:20px;height:20px;margin-left:-10px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--tile),var(--shadow)}
.sc-ml{position:absolute;top:8px;font-size:11px;transform:translateX(-50%);white-space:nowrap}
.sc-mo{position:absolute;top:48px;font-size:11px;color:var(--muted);padding-left:4px;white-space:nowrap}
.sc-mk{position:absolute;top:40px;width:1px;height:6px;background:var(--line)}
</style>
<div class="sc"><div class="sc-pn card"><div style="min-width:0"><div class="sc-as"></div><div class="sc-sw"></div></div><div class="sc-st"><div><span>Co-sponsors</span><b class="sc-c1"></b></div><div><span>Days since filing</span><b class="sc-c2"></b></div></div></div>
<div class="sc-tr" role="slider" tabindex="0" aria-label="Date on the record of bill H-218" aria-valuemin="0" aria-valuemax="7" aria-valuenow="4"><div class="sc-rl"></div><div class="sc-pg"></div></div></div>
<div class="hint">Drag the playhead. It snaps on release.</div>`,
  desc:'The playhead follows the pointer 1:1. The record panel above always shows the latest step on or before the playhead date: when the playhead passes a step, the panel copy swaps (exit, then enter) and the two counters roll. Release projects the throw forward by the release velocity and springs to the nearest dated step. Arrow keys step between dates.',
  api:'u = held ? p.x / w : pos.at(t)   state = last(step ≤ u)   release: pos.release(u, v/w, nearest(u + v·.15), S.soft)',
  init(st){
    const doy = (m, d) => (Date.UTC(2026, m, d) - Date.UTC(2026, 0, 1))/864e5, SPAN = 180, uOf = (m, d) => doy(m, d)/SPAN;
    const MN = ['Jan','Feb','Mar','Apr','May','Jun'], dateOf = u => { const dt = new Date(Date.UTC(2026, 0, 1) + Math.round(clamp(u)*SPAN)*864e5); return `${MN[dt.getUTCMonth()]} ${dt.getUTCDate()}, 2026`; };
    const STEPS = [
      { m:0, d:1, short:'', chip:'Not filed', tone:['var(--muted)','var(--raised)'], title:'Nothing on record yet', text:'H-218 has not been filed. Drag the playhead forward to follow it.', co:0 },
      { m:0, d:12, short:'Introduced', chip:'Introduced', tone:['var(--accent)','var(--accent-tint)'], title:'Introduced', text:'Rep. Delgado files H-218. It is referred to the House Education Committee.', co:11 },
      { m:1, d:9, short:'Hearing', chip:'In committee', tone:['var(--accent)','var(--accent-tint)'], title:'Committee hearing', text:'Forty-one people testify. The committee advances the bill 9 to 4.', co:14 },
      { m:2, d:3, short:'Amended', chip:'Amended', tone:['var(--warning)','var(--warning-tint)'], title:'Amended', text:'The formula moves from per-pupil to tiered by district size. Two co-sponsors join.', co:16 },
      { m:2, d:28, short:'House', chip:'Passed House', tone:['var(--accent)','var(--accent-tint)'], title:'Passed the House', text:'The House passes it 62 to 38 after a four-hour floor debate.', co:19 },
      { m:3, d:22, short:'Senate', chip:'Passed Senate', tone:['var(--accent)','var(--accent-tint)'], title:'Passed the Senate', text:'The Senate approves the House version 24 to 16, with no changes.', co:19 },
      { m:4, d:6, short:'Signed', chip:'Law', tone:['var(--success)','var(--success-tint)'], title:'Signed into law', text:'The governor signs H-218. Funding changes take effect July 1.', co:19 },
      { m:5, d:18, short:'Rules', chip:'Rulemaking', tone:['var(--warning)','var(--warning-tint)'], title:'Rules open for comment', text:'The department posts draft rules. Public comment closes July 18.', co:19 }
    ];
    const U = STEPS.map(s => uOf(s.m, s.d)), N = STEPS.length, EPS = .004, day0 = doy(STEPS[1].m, STEPS[1].d);
    const root = $(st,'.sc'), tr = $(st,'.sc-tr'), asOf = $(st,'.sc-as'), swH = $(st,'.sc-sw'), pg = $(st,'.sc-pg');
    const c1 = new Digits($(st,'.sc-c1'), 2), c2 = new Digits($(st,'.sc-c2'), 3);
    const layers = STEPS.map(s => { const d = xEl('div'); d.innerHTML = `<span class="sc-chip" style="color:${s.tone[0]};background:${s.tone[1]}"></span><b></b><p></p>`;
      $(d,'.sc-chip').textContent = s.chip; $(d,'b').textContent = s.title; $(d,'p').textContent = s.text; swH.appendChild(d); return d; });
    const dots = STEPS.map((s, i) => { if (!i) return null; const e = xEl('i'); e.className = 'sc-dot'; e.style.left = (U[i]*100) + '%'; tr.appendChild(e); return { e, p:new Track(0), on:false }; });
    const mls = STEPS.map((s, i) => { if (!i) return null; const e = xEl('span'); e.className = 'sc-ml'; e.style.left = (U[i]*100) + '%'; e.textContent = s.short; tr.appendChild(e); return { e, a:new Track(0) }; });
    MN.forEach((n, m) => { const u = uOf(m, 1), k = xEl('i'); k.className = 'sc-mk'; k.style.left = (u*100) + '%'; const l = xEl('span'); l.className = 'sc-mo'; l.style.left = (u*100) + '%'; l.textContent = n; tr.appendChild(k); tr.appendChild(l); });
    const th = xEl('div'); th.className = 'sc-th'; tr.appendChild(th);
    const pos = new Track(U[4], S.soft), HS = new Track(0), sw = new Swap(4);
    let held = false, hu = U[4], idx = -1, lastDate = '', w0 = 0;
    const stateAt = u => { let k = 0; for (let i = 1; i < N; i++) if (u >= U[i] - EPS) k = i; return k; };
    const near = x => { let b = 1; for (let i = 2; i < N; i++) if (Math.abs(U[i] - x) < Math.abs(U[b] - x)) b = i; return b; };
    const setState = (k, inst) => { const s = STEPS[k], dir = idx < 0 || k >= idx ? 1 : -1; c1.dir = c2.dir = dir; sw.to(k);
      if (inst){ sw.cur = k; sw.prev = null; sw.t = -9; }
      c1.set(String(s.co), inst); c2.set(String(Math.max(0, doy(s.m, s.d) - day0)), inst);
      tr.setAttribute('aria-valuenow', k); tr.setAttribute('aria-valuetext', `${dateOf(U[k])}, ${s.title}`); idx = k; };
    setState(stateAt(U[4]), true);
    drag(tr, { down:p => { held = true; hu = clamp(p.x/p.w); HS.set(1, S.snap); }, move:p => { hu = clamp(p.x/p.w); },
      up:(p, v) => { held = false; HS.set(0, S.base); const vu = v.vx/p.w, k = near(clamp(hu + vu*.15)); pos.release(hu, vu, U[k], S.soft); } });
    tr.addEventListener('keydown', ev => { const d = { ArrowRight:1, ArrowUp:1, ArrowLeft:-1, ArrowDown:-1 }[ev.key]; let k = null;
      if (d) k = clamp(idx + d, 1, N - 1); else if (ev.key === 'Home') k = 1; else if (ev.key === 'End') k = N - 1; if (k == null) return; ev.preventDefault(); pos.set(U[k], S.soft); });
    return t => {
      const W = tr.clientWidth, u = clamp(held ? hu : pos.at(t)), k = stateAt(u); if (k !== idx) setState(k, false);
      root.classList.toggle('sc-nr', st.clientWidth < 520);
      th.style.transform = `translateX(${px(u*W)}) scale(${(1 + .15*clamp(HS.at(t))).toFixed(3)})`; pg.style.transform = `scaleX(${u.toFixed(4)})`;
      const ds = dateOf(u); if (ds !== lastDate){ lastDate = ds; asOf.textContent = 'As of ' + ds; }
      dots.forEach((d, i) => { if (!d) return; const on = u >= U[i] - EPS; if (on !== d.on){ d.on = on; d.p.set(on ? 1 : 0, S.snap); } const p = clamp(d.p.at(t)); d.e.style.background = mix(p, 'var(--ink)', 'var(--card)'); d.e.style.borderColor = mix(p, 'var(--ink)', 'var(--faint)'); });
      const lab = W >= 600; mls.forEach((m, i) => { if (!m) return; m.a.set(i === idx ? 1 : 0); m.e.style.opacity = lab ? 1 : 0; m.e.style.color = mix(clamp(m.a.at(t)), 'var(--ink)', 'var(--faint)'); });
      layers.forEach((l, i) => sw.apply(l, i, t)); c1.render(t); c2.render(t);
    };
  }});

})();