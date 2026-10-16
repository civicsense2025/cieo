

/* ---------- Workspace: funnel report, settings shell ---------- */
(() => {

/* ======================================================================== funnel report */
const FN_STAGES = ['Visited', 'Started signup', 'Verified email', 'Paid'];
const FN_RANGES = [
  { k:'7 days',  full:'Last 7 days',  period:'Sep 26 to Oct 2', v:[4820, 1930, 1210, 386] },
  { k:'30 days', full:'Last 30 days', period:'Sep 3 to Oct 2',  v:[21400, 8990, 5610, 1860] },
  { k:'90 days', full:'Last 90 days', period:'Jul 5 to Oct 2',  v:[58300, 22150, 14380, 4720] }
];
const fnDrop = (v, i) => i ? 100*(1 - v[i]/v[i-1]) : 0;
const fnNum = n => Math.round(n).toLocaleString('en-US');

atom({ id:'funnel', cat:'Workspace', name:'Funnel report', block:'FunnelReportScreen (analytics)', fam:['M','T','S'], wide:true, tall:true,
  html:`<style>
.fn{position:relative;width:min(1000px,96%);align-self:start;margin-top:10px;background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:14px 16px 10px;text-align:left;font-size:13px;display:flex;flex-direction:column;gap:10px;--ah:120px}
.fn[data-n]{--ah:96px;padding:12px 10px 8px;margin-top:6px}
.fn-hd{display:flex;justify-content:space-between;align-items:flex-start;gap:8px 16px;flex-wrap:wrap}
.fn-t{margin:0;font-size:16px;line-height:1.25;letter-spacing:-.01em;font-weight:600}
.fn-meta{display:flex;flex-wrap:wrap;gap:0 6px;margin-top:2px;font-size:12.5px;color:var(--muted)}
.fn-per{display:inline-grid}
.fn-per>span{grid-area:1/1}
.fn-ctl{display:flex;align-items:center;gap:8px}
.fn-seg .ind{height:calc(100% - 6px);top:3px}
.fn-ch{position:relative;list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}
.fn-st{position:relative;min-width:0}
.fn-b{display:grid;grid-template-rows:32px 22px var(--ah) auto;row-gap:4px;width:100%;padding:4px 2px;background:none;border:0;border-radius:10px;text-align:center;cursor:default}
.fn-l{display:flex;align-items:flex-end;justify-content:center;font-size:12px;line-height:1.3;color:var(--muted)}
.fn-n{font-size:18px;line-height:22px;font-weight:600;letter-spacing:-.02em}
.fn-ba{display:flex;align-items:flex-end;justify-content:center;border-bottom:1px solid var(--line)}
.fn-bar{display:block;width:min(46%,110px);border-radius:8px 8px 0 0;background:var(--ink);height:0}
.fn-st:last-child .fn-bar{background:var(--accent)}
.fn-c{font-size:11.5px;line-height:1.3;color:var(--muted);min-height:15px}
.fn-chip{position:absolute;left:0;top:calc(66px + var(--ah)/2);z-index:2;transform:translate(-50%,-50%);padding:2px 6px;border-radius:999px;background:var(--card);color:var(--danger);font:500 11px/1.4 var(--mono);white-space:nowrap;pointer-events:none}
.fn[data-n] .fn-long,.fn:not([data-n]) .fn-short{display:none}
.fn[data-n] .fn-l{font-size:11px}
.fn-tip{position:absolute;left:0;top:0;width:196px;display:grid;background:var(--ink);color:var(--card);border-radius:10px;padding:8px 10px;font-size:12.5px;line-height:1.4;pointer-events:none;transform-origin:50% 100%}
.fn-tip>div{grid-area:1/1;display:flex;flex-direction:column}
.fn-tip b{font-weight:600}
.fn-tip span{opacity:.78}
</style><div class="fn">
<div class="fn-hd">
  <div><h4 class="fn-t">Movement, stage by stage</h4>
  <div class="fn-meta"><span class="fn-per" aria-live="polite">${FN_RANGES.map(r => `<span>${r.period}</span>`).join('')}</span><span aria-hidden="true">·</span><span><span class="num fn-in">0</span> sessions entering</span></div></div>
  <div class="fn-ctl"><button type="button" class="btn fn-rp">Replay</button>
    <div class="seg fn-seg" role="group" aria-label="Date range"><div class="ind"></div>${FN_RANGES.map(r => `<button type="button" aria-label="${r.full}">${r.k}</button>`).join('')}</div></div>
</div>
<ol class="fn-ch" aria-label="Signup funnel">${FN_STAGES.map((s, i) => `<li class="fn-st"><button type="button" class="fn-b" aria-describedby="fn-tip"><span class="fn-l">${String(i+1).padStart(2,'0')} · ${s}</span><strong class="fn-n num">0</strong><span class="fn-ba" aria-hidden="true"><span class="fn-bar"></span></span><small class="fn-c"><span class="fn-long"></span><span class="fn-short"></span></small></button>${i ? '<span class="fn-chip" aria-hidden="true">−0%</span>' : ''}</li>`).join('')}</ol>
<div class="fn-tip" id="fn-tip" role="tooltip">${FN_STAGES.map(() => '<div><b></b><span></span><span></span></div>').join('')}</div>
</div>`,
  desc:'Four bars grow from the baseline left to right, 120ms apart, and each stage count rolls up as its bar rises. The drop-off chip between two stages counts up just after the bar it follows. Changing the date range morphs every bar to its new height in the same stage order while the numbers roll, and the period text swaps. Hovering a stage dims the others and raises a tooltip that glides between bar tops and swaps its text.',
  api:'bar[i].set(v[i]/v[0], soft, t + i·.12)   count[i].set(v[i], soft, same)   drop[i].set(d, soft, t + i·.12 + .1)   dim[j].set(j === hot ? 1 : .4, snap)',
  init(st){
    const fn = $(st,'.fn'), ol = $(st,'.fn-ch'), lis = $$(st,'.fn-st'), seg = $(st,'.fn-seg'), ind = $(seg,'.ind'), btns = $$(seg,'button'), tip = $(st,'.fn-tip');
    const bars = $$(st,'.fn-bar'), nums = $$(st,'.fn-n'), ba = $(st,'.fn-ba'), chips = $$(st,'.fn-chip'), longs = $$(st,'.fn-long'), shorts = $$(st,'.fn-short'), bs = $$(st,'.fn-b');
    const cs_ = $$(st,'.fn-c'), per = $$(st,'.fn-per>span'), inNum = $(st,'.fn-in'), tl = $$(tip,':scope>div');
    const N = FN_STAGES.length, TS = [.12, .08];
    const frac = FN_STAGES.map(() => new Track(0, S.soft)), cnt = FN_STAGES.map(() => new Track(0, S.soft));
    const drop = FN_STAGES.map(() => new Track(0, S.soft)), chipA = FN_STAGES.map(() => new Track(0));
    const dim = FN_STAGES.map(() => new Track(1, S.snap)), chipD = FN_STAGES.map(() => new Track(1, S.snap));
    const e = edges(0,0), psw = new Swap(0), o = new Track(0), cx = new Track(0), cy = new Track(0), tsw = new Swap(0);
    let r = 0, hot = -1, last = -1, lastX = 0, lastY = 0, started = false, narrow = false;
    const cache = { in:'', n:[], c:[], l:[], s:[], t:[] };
    const dropOf = i => Math.round(drop[i].at(now()));

    const labels = () => bs.forEach((b, i) => { const v = FN_RANGES[r].v;
      b.setAttribute('aria-label', `${FN_STAGES[i]}, ${fnNum(v[i])} sessions` + (i ? `, ${100 - Math.round(fnDrop(v, i))}% from previous stage` : ', starting stage')); });
    const play = (from0, t0 = now()) => {
      const v = FN_RANGES[r].v, step = from0 ? TS[0] : TS[1];
      for (let i = 0; i < N; i++){
        if (from0){ frac[i].jump(0); cnt[i].jump(0); drop[i].jump(0); chipA[i].jump(0); }
        const ti = t0 + i*step;
        frac[i].set(v[i]/v[0], S.soft, ti); cnt[i].set(v[i], S.soft, ti);
        if (i){ drop[i].set(fnDrop(v, i), S.soft, ti + .1); if (from0) chipA[i].set(1, S.base, ti + .1); else chipA[i].set(1); }
      }
      chipA[0].jump(1); labels();
    };
    const pick = (i, inst) => { r = i; btns.forEach((b, j) => b.setAttribute('aria-pressed', i === j));
      const b = btns[i]; inst ? e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth);
      if (inst){ psw.cur = i; psw.prev = null; psw.t = -9; } else { psw.to(i); }
      if (started && !inst) play(false); };
    btns.forEach((b, i) => b.onclick = () => { if (i !== r) pick(i); });
    $(st,'.fn-rp').onclick = () => { started = true; play(true); };
    const hover = i => {
      if (i === hot) return;
      if (i >= 0){
        if (o.target < .5 || last < 0){ tsw.cur = i; tsw.prev = null; tsw.t = -9; cx.jump(0); cy.jump(0); }
        else if (i !== tsw.cur){ tsw.to(i); cx.jump(lastX - tipPos(i)[0]); cx.set(0); cy.jump(lastY - tipPos(i)[1]); cy.set(0); }
        last = i;
      }
      hot = i; openSet(o, i >= 0);
      const t0 = now();
      dim.forEach((d, j) => d.set(i < 0 || i === j ? 1 : .4, S.snap, t0));
      chipD.forEach((d, j) => d.set(i < 0 || i === j || i === j - 1 ? 1 : .4, S.snap, t0));
    };
    const tipPos = (i, t = now()) => {
      const li = lis[i], ah = frameLayout(ba).ch, ty = frameLayout(ol).ot + 66, bh = clamp(frac[i].at(t))*ah;
      const x = clamp(frameLayout(ol).ol + frameLayout(li).ol + frameLayout(li).w/2 - frameLayout(tip).w/2, 8, Math.max(8, frameLayout(fn).cw - frameLayout(tip).w - 8));
      const y = Math.max(ty + 2, ty + ah - bh - size(tip).h - 6);
      return [x, y];
    };
    lis.forEach((li, i) => { li.onpointerenter = () => hover(i); bs[i].onfocus = () => hover(i); bs[i].onblur = () => hover(-1); });
    ol.onpointerleave = () => hover(-1);
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape' && hot >= 0){ hover(-1); } });

    const init = () => { pick(r, true); };
    document.fonts.ready.then(init); init();
    addEventListener('resize', () => { const b = btns[r]; e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth); });
    new IntersectionObserver((es, ob) => { if (es.some(x => x.isIntersecting) && !started){ started = true; play(true); ob.disconnect(); } }).observe(st);

    return t => {
      const n = size(st).cw < 520;
      if (n !== narrow){ narrow = n; fn.toggleAttribute('data-n', n); init(); }
      const a = e.A.at(t), b = e.B.at(t); ind.style.transform = `translateX(${px(a)})`; ind.style.width = px(b - a);
      per.forEach((el, k) => psw.apply(el, k, t, 4));
      const ah = size(ba).ch, v = FN_RANGES[r].v;
      for (let i = 0; i < N; i++){
        bars[i].style.height = px(Math.max(0, frac[i].at(t))*ah);
        const c = fnNum(cnt[i].at(t)); if (c !== cache.n[i]){ cache.n[i] = c; nums[i].textContent = c; }
        bs[i].style.opacity = clamp(dim[i].at(t)).toFixed(3);
        if (i){
          const d = Math.round(drop[i].at(t)), ds = '−' + d + '%';
          if (ds !== cache.c[i]){ cache.c[i] = ds; chips[i-1].textContent = ds; }
          const cl = `${100 - d}% from previous stage`, cs = `${100 - d}% of previous`;
          if (cl !== cache.l[i]){ cache.l[i] = cl; longs[i].textContent = cl; shorts[i].textContent = cs; }
          const ca = clamp(chipA[i].at(t))*clamp(chipD[i].at(t)); chips[i-1].style.opacity = ca.toFixed(3);
          chips[i-1].style.visibility = ca < .01 ? 'hidden' : 'visible';
          cs_[i].style.opacity = clamp(chipA[i].at(t)).toFixed(3);
        } else { cs_[0].style.opacity = clamp(Math.min(1, frac[0].at(t)*4)).toFixed(3); if (cache.l[0] !== 1){ cache.l[0] = 1; longs[0].textContent = shorts[0].textContent = 'Starting stage'; } }
        const tx = i === 0 ? '' : `${100 - Math.round(drop[i].at(t))}% from previous stage · ${Math.round(cnt[i].at(t)/Math.max(1, cnt[0].at(t))*100)}% of visitors`;
        const ts = [FN_STAGES[i], `${fnNum(cnt[i].at(t))} sessions`, i === 0 ? 'Starting stage' : tx];
        const key = ts.join('|'); if (key !== cache.t[i]){ cache.t[i] = key; const el = $$(tl[i], 'b, span'); el.forEach((x, k) => x.textContent = ts[k]); }
      }
      const total = fnNum(cnt[0].at(t)); if (total !== cache.in){ cache.in = total; inNum.textContent = total; }
      // tooltip: raw anchor above the hot bar, plus a carried offset that decays after a hover change
      tl.forEach((el, k) => tsw.apply(el, k, t, 3));
      if (last >= 0){
        const [x, y] = tipPos(last, t); lastX = x + cx.at(t); lastY = y + cy.at(t);
        tip.style.left = px(lastX); tip.style.top = px(lastY);
      }
      pop(tip, o.at(t), 4);
    };
  }});

/* ======================================================================== settings shell */
atom({ id:'settingsshell', cat:'Workspace', name:'Settings shell', block:'SettingsShell, SaveFlash', fam:['E','S','M'], wide:true, tall:true,
  html:`<style>
.sst{position:relative;width:min(900px,96%);align-self:start;margin-top:12px;display:grid;grid-template-columns:168px minmax(0,1fr);background:var(--card);border-radius:14px;box-shadow:var(--shadow);text-align:left;font-size:13px;overflow:hidden}
.ss-nav{position:relative;display:flex;flex-direction:column;gap:2px;padding:10px;border-right:1px solid var(--line-soft);align-self:stretch}
.ss-pl{position:absolute;left:0;top:0;border-radius:8px;pointer-events:none}
.ss-tab{position:relative;display:flex;align-items:center;gap:8px;padding:7px 10px;border:0;border-radius:8px;background:none;font-weight:500;color:var(--ink);text-align:left;cursor:pointer;white-space:nowrap}
.ss-tab.dg{color:var(--danger)}
.ss-body{position:relative;overflow:hidden;min-width:0}
.ss-pane{position:absolute;left:0;top:0;right:0;padding:16px 20px 18px;display:flex;flex-direction:column;gap:14px}
.sst-hd{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.sst-hd h4{margin:0;font-size:15px;letter-spacing:-.01em}
.ss-sub{margin:2px 0 0;color:var(--muted);font-size:12.5px}
.sst-st{position:relative;flex:none;height:20px;min-width:68px;font-size:12.5px}
.sst-st>span{position:absolute;right:0;top:0;display:flex;align-items:center;gap:4px;white-space:nowrap}
.ss-sg{color:var(--muted)}
.ss-sd{color:var(--success)}
.ss-f{display:flex;flex-direction:column;gap:5px;min-width:0}
.ss-f label{font-size:12px;font-weight:500;color:var(--muted)}
.ss-in{width:100%;max-width:360px;border:1.5px solid var(--muted);border-radius:8px;background:var(--bg);color:var(--ink);font:13px/1.45 var(--sans);padding:7px 9px;user-select:text;-webkit-user-select:text}
.ss-sr{display:flex;justify-content:space-between;align-items:center;gap:14px}
.ss-sr b{font-weight:500;display:block}
.ss-sr small{display:block;color:var(--muted);font-size:12px;line-height:1.4}
.ss-sw{position:relative;flex:none;width:36px;height:20px;border-radius:999px;border:1.5px solid var(--muted);padding:0;cursor:pointer}
.ss-sw i{position:absolute;left:1px;top:1px;width:16px;height:16px;border-radius:50%;background:var(--card);box-shadow:0 1px 2px rgba(16,20,26,.25)}
.ss-dz{background:var(--danger-tint);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:10px}
.ss-dz p{margin:0;color:var(--ink)}
.ss-btn{align-self:flex-start;border-radius:9px;padding:6px 12px;font-size:13px;font-weight:500;cursor:pointer;border:0;background:var(--raised);color:var(--danger)}
.ss-btn[aria-disabled="true"]{cursor:not-allowed}
.ss-rev{position:relative;overflow:hidden;height:0}
.ss-rev>div{position:absolute;left:0;top:0;right:0;display:flex;flex-direction:column;gap:6px}
.ss-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.ss-row .ss-in{flex:1 1 150px;width:auto}
.ss-solid{border-color:var(--danger);background:var(--raised);color:var(--muted)}
.ss-ghost{border-color:var(--line);color:var(--ink)}
.sst[data-n]{grid-template-columns:minmax(0,1fr);margin-top:8px}
.sst[data-n] .ss-nav{flex-direction:row;gap:0;padding:3px;margin:10px 10px 0;border-right:0;background:var(--raised);border-radius:10px;overflow-x:auto;align-self:auto}
.sst[data-n] .ss-pl{box-shadow:var(--shadow);border-radius:7px}
.sst[data-n] .ss-tab{padding:5px 9px;font-size:12.5px;border-radius:7px}
.sst[data-n] .ss-pane{padding:12px 14px 14px;gap:12px}
.sst[data-n] .ss-sub,.sst[data-n] .ss-hdz{display:none}
.sst[data-n] .ss-dz{padding:12px;gap:8px}
.sst[data-n] .ss-dz p{font-size:12.5px;line-height:1.4}
</style><div class="sst">
<div class="ss-nav" role="tablist" aria-label="Settings" aria-orientation="vertical"><i class="ss-pl"></i>
${['General','Domains','Members','Billing','Danger zone'].map((n, i) => `<button type="button" class="ss-tab${i === 4 ? ' dg' : ''}" role="tab" id="ss-tab-${i}" aria-controls="ss-pane-${i}">${n}</button>`).join('')}</div>
<div class="ss-body">
<section class="ss-pane" role="tabpanel" id="ss-pane-0" aria-labelledby="ss-tab-0">
  <div class="sst-hd"><div><h4>General</h4><p class="ss-sub">The basics visitors and search engines see.</p></div><span class="sst-st" role="status" aria-live="polite"><span class="ss-sg">Saving…</span><span class="ss-sd">${ic(I.check,14,2.5)}Saved</span></span></div>
  <div class="ss-f"><label for="ss-name">Site name</label><input id="ss-name" class="ss-in" value="Northlight Studio" autocomplete="off" spellcheck="false"></div>
  <div class="ss-sr"><div><b id="ss-idx-l">Let search engines index this site</b><small>Turn this off while you are still building.</small></div><button type="button" class="ss-sw" role="switch" aria-checked="true" aria-labelledby="ss-idx-l"><i></i></button></div>
</section>
<section class="ss-pane" role="tabpanel" id="ss-pane-1" aria-labelledby="ss-tab-1">
  <div class="sst-hd"><div><h4>Domains</h4><p class="ss-sub">Where your site lives on the web.</p></div><span class="sst-st" role="status" aria-live="polite"><span class="ss-sg">Saving…</span><span class="ss-sd">${ic(I.check,14,2.5)}Saved</span></span></div>
  <div class="ss-f"><label for="ss-dom">Primary domain</label><select id="ss-dom" class="ss-in"><option>northlight.studio</option><option>www.northlight.studio</option><option>northlight.example.site</option></select></div>
  <div class="ss-sr"><div><b id="ss-redir-l">Redirect other domains to the primary</b><small>Visitors on a secondary domain land on the primary one.</small></div><button type="button" class="ss-sw" role="switch" aria-checked="true" aria-labelledby="ss-redir-l"><i></i></button></div>
</section>
<section class="ss-pane" role="tabpanel" id="ss-pane-2" aria-labelledby="ss-tab-2">
  <div class="sst-hd"><div><h4>Members</h4><p class="ss-sub">Six members and two invitations waiting.</p></div><span class="sst-st" role="status" aria-live="polite"><span class="ss-sg">Saving…</span><span class="ss-sd">${ic(I.check,14,2.5)}Saved</span></span></div>
  <div class="ss-f"><label for="ss-role">Role for new invitations</label><select id="ss-role" class="ss-in"><option>Viewer</option><option selected>Editor</option><option>Admin</option></select></div>
  <div class="ss-sr"><div><b id="ss-inv-l">Editors can invite people</b><small>Admins can always invite.</small></div><button type="button" class="ss-sw" role="switch" aria-checked="false" aria-labelledby="ss-inv-l"><i></i></button></div>
</section>
<section class="ss-pane" role="tabpanel" id="ss-pane-3" aria-labelledby="ss-tab-3">
  <div class="sst-hd"><div><h4>Billing</h4><p class="ss-sub">Studio plan, $24 per month. Next invoice on October 12.</p></div><span class="sst-st" role="status" aria-live="polite"><span class="ss-sg">Saving…</span><span class="ss-sd">${ic(I.check,14,2.5)}Saved</span></span></div>
  <div class="ss-f"><label for="ss-mail">Billing email</label><input id="ss-mail" class="ss-in" type="email" value="accounts@northlight.studio" autocomplete="off" spellcheck="false"></div>
  <div class="ss-f"><label for="ss-cycle">Billing cycle</label><select id="ss-cycle" class="ss-in"><option>Monthly, $24</option><option>Yearly, $240</option></select></div>
</section>
<section class="ss-pane" role="tabpanel" id="ss-pane-4" aria-labelledby="ss-tab-4">
  <div class="sst-hd ss-hdz"><div><h4 style="color:var(--danger)">Danger zone</h4><p class="ss-sub">Actions here affect everyone on the site.</p></div></div>
  <div class="ss-dz">
    <p>Deletes pages, media, members and domains. You can restore the site for 7 days.</p>
    <button type="button" class="ss-btn ss-del0" aria-expanded="false">Delete this site…</button>
    <div class="ss-rev">
      <div class="ss-ask"><label for="ss-confirm">Type <b>northlight</b> to confirm</label><div class="ss-row"><input id="ss-confirm" class="ss-in" autocomplete="off" spellcheck="false"><button type="button" class="ss-btn ss-ghost ss-cancel">Cancel</button><button type="button" class="ss-btn ss-solid ss-del1" aria-disabled="true">Delete site</button></div></div>
      <div class="ss-done"><p role="status">Deletion is scheduled for October 10. The site is offline now and can be restored until then.</p><button type="button" class="ss-btn ss-ghost ss-undo">Undo</button></div>
    </div>
  </div>
</section>
</div></div>`,
  desc:'The nav plate edges between items, leading edge first, and tints to danger on Danger zone. Panes swap by nav order: going down they leave upward and the next arrives from below, going up the reverse, never overlapping, while the content area height springs to the next pane. Changing any control starts that pane’s own Saving… then Saved flash inline, then fades. Danger zone reveals a typed confirmation that grows the pane, arms the button only once the site name matches, and replaces itself with a scheduled message and Undo. Narrow: the nav becomes a top segmented row.',
  api:'plate.go(l, r) + go(t, b)   dir = next > cur ? 1 : -1   pane.swap(dir·10)   height.set(measure(pane))   saved: saving → (due) → saved → (due) → idle',
  init(st){
    const sst = $(st,'.sst'), pl = $(st,'.ss-pl'), tabs = $$(st,'.ss-tab'), body = $(st,'.ss-body'), panes = $$(st,'.ss-pane');
    const ex = edges(0,0), ey = edges(0,0), dg = new Track(0), hT = new Track(0), sw = new Swap(0);
    let cur = 0, dir = 1, narrow = false, hReady = false;
    const P = panes.map(p => ({ sw:new Swap('idle'), saving:$(p,'.ss-sg'), saved:$(p,'.ss-sd'), due:0, next:'' }));
    const place = inst => { const b = tabs[cur], f = inst ? 'jump' : 'go'; ex[f](b.offsetLeft, b.offsetLeft + b.offsetWidth); ey[f](b.offsetTop, b.offsetTop + b.offsetHeight); };
    const select = (i, focus) => {
      if (i === cur) return;
      dir = i > cur ? 1 : -1; cur = i;
      tabs.forEach((b, j) => { b.setAttribute('aria-selected', i === j); b.tabIndex = i === j ? 0 : -1; });
      place(); dg.set(i === tabs.length - 1 ? 1 : 0); sw.to(i); panes.forEach((p, j) => { p.inert = j !== i; });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((b, i) => { b.onclick = () => select(i); b.tabIndex = i ? -1 : 0; b.setAttribute('aria-selected', i === 0); });
    panes.forEach((p, j) => { p.inert = j !== 0; });
    $(st,'.ss-nav').addEventListener('keydown', ev => {
      const n = tabs.length, k = ev.key, fwd = k === 'ArrowDown' || k === 'ArrowRight', back = k === 'ArrowUp' || k === 'ArrowLeft';
      if (!fwd && !back && k !== 'Home' && k !== 'End') return;
      ev.preventDefault(); select(k === 'Home' ? 0 : k === 'End' ? n - 1 : (cur + (fwd ? 1 : n - 1)) % n, true);
    });

    // per-pane saved state
    const bump = (i, d) => { const p = P[i]; p.sw.to('saving'); p.due = now() + d; p.next = 'saved'; };
    panes.slice(0, 4).forEach((p, i) => {
      $$(p,'input').forEach(x => x.addEventListener('input', () => bump(i, .9)));
      $$(p,'select').forEach(x => x.addEventListener('change', () => bump(i, .6)));
    });
    const sws = $$(st,'.ss-sw').map(btn => { const i = panes.findIndex(p => p.contains(btn)), on = btn.getAttribute('aria-checked') === 'true', x = { btn, i, on, p:new Track(on ? 1 : 0, S.snap) };
      btn.onclick = () => { x.on = !x.on; btn.setAttribute('aria-checked', x.on); x.p.set(x.on ? 1 : 0); bump(i, .6); }; return x; });

    // danger zone: typed confirmation
    const d0 = $(st,'.ss-del0'), rev = $(st,'.ss-rev'), ask = $(st,'.ss-ask'), done = $(st,'.ss-done'), inp = $(st,'#ss-confirm'), d1 = $(st,'.ss-del1');
    const rh = new Track(0), ro = new Track(0), en = new Track(0), dd = new Track(1), rsw = new Swap('ask');
    let open = false, gone = false; rev.inert = true;
    const armed = () => inp.value.trim().toLowerCase() === 'northlight';
    const sync = () => { const a = armed(); en.set(a ? 1 : 0, S.snap); d1.setAttribute('aria-disabled', !a); };
    const setOpen = v => { open = v; openSet(ro, v); rev.inert = !v; d0.setAttribute('aria-expanded', v); if (v) setTimeout(() => inp.focus(), 0); };
    d0.onclick = () => { if (!gone) setOpen(!open); };
    $(st,'.ss-cancel').onclick = () => { setOpen(false); inp.value = ''; sync(); d0.focus(); };
    inp.oninput = sync;
    inp.onkeydown = ev => { if (ev.key === 'Enter' && armed()) d1.click(); if (ev.key === 'Escape'){ ev.stopPropagation(); $(st,'.ss-cancel').click(); } };
    d1.onclick = () => { if (!armed()) return; gone = true; rsw.to('done'); dd.set(.45); d0.setAttribute('aria-disabled', true); setTimeout(() => $(st,'.ss-undo').focus(), 0); };
    $(st,'.ss-undo').onclick = () => { gone = false; setOpen(false); inp.value = ''; sync(); dd.set(1); d0.setAttribute('aria-disabled', false); rsw.to('ask', now() + .25); d0.focus(); };

    const init = () => { place(true); hReady = false; };
    document.fonts.ready.then(init); init();
    addEventListener('resize', () => place(true));

    return t => {
      const n = st.clientWidth < 560;
      if (n !== narrow){ narrow = n; sst.toggleAttribute('data-n', n); place(true); hReady = false; }
      // nav plate
      const l = ex.A.at(t), r = ex.B.at(t), tp = ey.A.at(t), bt = ey.B.at(t);
      pl.style.transform = `translate(${px(l)},${px(tp)})`; pl.style.width = px(r - l); pl.style.height = px(bt - tp);
      pl.style.background = mix(clamp(dg.at(t)), 'var(--danger-tint)', narrow ? 'var(--card)' : 'var(--raised)');
      // panes swap by nav order
      panes.forEach((el, k) => sw.apply(el, k, t, 10*dir));
      // saved flashes: saving → saved → idle, each on its own due time
      P.forEach(p => {
        if (p.due && t >= p.due){
          if (p.next === 'saved'){ p.sw.to('saved', p.due); p.due += 1.8; p.next = 'idle'; } else { p.sw.to('idle', p.due); p.due = 0; p.next = ''; }
        }
        if (p.saving){ p.sw.apply(p.saving, 'saving', t, 3); p.sw.apply(p.saved, 'saved', t, 3); }
      });
      sws.forEach(x => { const p = clamp(x.p.at(t)); x.btn.style.background = mix(p, 'var(--accent)', 'var(--raised)'); x.btn.firstElementChild.style.transform = `translateX(${px(p*16)})`; });
      // danger reveal
      const want = !open ? 0 : (gone ? done : ask).offsetHeight;
      if (want !== rh.target) rh.set(want);
      rev.style.height = px(Math.max(0, rh.at(t)));
      fade(rev, ro.at(t), null);
      rsw.apply(ask, 'ask', t, 3); rsw.apply(done, 'done', t, 3);
      const a = clamp(en.at(t));
      d1.style.background = mix(a, 'var(--danger)', 'var(--raised)'); d1.style.color = mix(a, 'var(--card)', 'var(--faint)');
      d0.style.opacity = clamp(dd.at(t)).toFixed(3);
      // content area height follows the pane's final height
      let fin = panes[cur].offsetHeight; if (cur === 4) fin += rh.target - rev.offsetHeight;
      if (!hReady){ hT.jump(fin); hReady = true; } else if (Math.abs(fin - hT.target) > .5) hT.set(fin);
      body.style.height = px(hT.at(t));
    };
  }});

})();