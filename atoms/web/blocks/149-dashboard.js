

/* ---------- Workspace organisms (lane: dashboard) ---------- */
{
// segmented control on the edges atom: leading edge moves first, trailing edge lags
const segCtl = (root, onPick, start = 0) => {
  const ind = $(root,'.ind'), btns = $$(root,'button'), e = edges(0,0); let cur = start;
  const geo = b => [b.offsetLeft, b.offsetLeft + b.offsetWidth];
  const fit = () => { const [l,r] = geo(btns[cur]); e.jump(l,r); };
  btns.forEach((b,j) => b.setAttribute('aria-pressed', j === start));
  btns.forEach((b,i) => b.onclick = () => { if (i === cur) return; cur = i; btns.forEach((x,j) => x.setAttribute('aria-pressed', j === i)); const [l,r] = geo(b); e.go(l,r); onPick(i); });
  document.fonts.ready.then(fit); requestAnimationFrame(fit);
  return t => { const l = e.A.at(t), r = e.B.at(t); Object.assign(ind.style,{ transform:`translate(${px(l)},3px)`, width:px(r-l), height:'calc(100% - 6px)' }); };
};
const MAIL = '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>';
const BELL = '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10.3 21a1.94 1.94 0 0 0 3.4 0"/>';
const SRCSS = '.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';

/* ================================================================ dashboard */
const rng = s => () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const DAYS = [7, 30, 90], NP = 30, SRCN = ['All','Search','Social','Email'], RNGN = ['7 days','30 days','90 days'];
// daily visitors for one range and source; deterministic so the demo never changes between runs
const series = (ri, si) => {
  const r = rng(101 + ri*17 + si*131), n = DAYS[ri], base = [4700,2150,1250,820][si], vol = [.1,.08,.26,.16][si], tr = [.1,.16,.3][ri]*[1,1.2,.5,.8][si];
  return [...Array(n)].map((_,i) => { let k = 1 + tr*(i/n - .5) + .09*Math.sin((i + si)/7*2*Math.PI) + (r() - .5)*vol*2;
    if (si === 3 && i % 11 === 3) k += .9; if (si === 2 && i % 9 === 5) k += .45; return Math.round(base*k); });
};
const chartPts = (ri, si) => {
  const s = series(ri, si); let a = s;
  if (ri === 2) a = [...Array(NP)].map((_,k) => (s[3*k] + s[3*k+1] + s[3*k+2])/3);
  return [...Array(NP)].map((_,k) => { const x = k*(a.length - 1)/(NP - 1), i = Math.floor(x), f = x - i; return Math.round(lerp(a[i], a[Math.min(i+1, a.length-1)], f)); });
};
// per range, per source: conversion %, session seconds, then deltas vs the previous period (visitors, conversion, session)
const FIG = [
  [[3.42,162,12.4,4.1,-3.1],[4.10,184,8.2,9.0,2.4],[1.85,96,-6.7,-3.3,-9.0],[5.60,205,21.3,12.2,4.6]],
  [[3.18,151,4.6,-2.2,1.8],[3.95,176,10.1,5.4,3.2],[1.62,88,-12.4,-6.1,-4.5],[5.20,198,-2.3,8.8,7.0]],
  [[3.05,148,18.9,3.3,2.2],[3.72,171,14.6,7.1,.9],[1.70,91,3.8,-4.0,-1.2],[4.90,190,-5.4,-9.1,-2.8]]];
const PAGES = [ // path, share of visitors by source, factor by range
  ['/pricing',[.17,.12,.08,.34],[.9,1,1.05]], ['/blog/spring-launch',[.14,.1,.3,.2],[1.5,1,.7]],
  ['/guides/custom-domains',[.12,.26,.04,.05],[.8,1,1.2]], ['/',[.2,.15,.18,.14],[1,1,1]],
  ['/about',[.07,.05,.1,.04],[1,1,1]], ['/templates',[.1,.18,.12,.06],[.9,1,1.15]], ['/changelog',[.06,.03,.09,.17],[1.1,1,.9]]];
const STEPS = [100,150,200,250,300,400,500,600,800,1000,1200,1500,1800,2000,2200,2500,3000];
const kfmt = v => v >= 1000 ? (v/1000).toFixed(v % 1000 ? 1 : 0).replace('.0','') + 'k' : String(v);
const END = Date.UTC(2026, 9, 2);
const xTicks = ri => {
  const idx = ri === 0 ? [0,1,2,3,4,5,6] : [0,6,12,18,24,29], n = ri === 0 ? 7 : 30;
  return idx.map(i => { const d = new Date(END - (DAYS[ri] - 1 - i*(ri === 2 ? 3 : 1))*864e5);
    return [i/(n-1), ri === 0 ? d.toLocaleDateString('en-US',{ weekday:'short', timeZone:'UTC' }) : d.toLocaleDateString('en-US',{ month:'short', day:'numeric', timeZone:'UTC' })]; });
};
const dsign = d => (d >= 0 ? '+' : '−') + Math.abs(d).toFixed(1) + '%';

atom({ id:'dashboard', cat:'Workspace', name:'Analytics dashboard', block:'analytics dashboard, stat tiles, chart, table', fam:['M','S','T','E'], wide:true, tall:true,
  html:`<style>
.dsh{position:absolute;inset:0;overflow:auto;padding:10px 14px 12px;container-type:inline-size;display:flex;flex-direction:column;gap:8px;text-align:left}
.dsh .bar{display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:space-between;align-items:center}
.dsh .seg{flex-wrap:nowrap}
.dsh .stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.dsh .stat{background:var(--card);border-radius:12px;box-shadow:var(--shadow);padding:9px 12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1px 8px;min-width:0}
.dsh .stat .l{flex:1 0 100%;font-size:12.5px;color:var(--muted)}
.dsh .stat .n{font-size:22px;line-height:28px;font-weight:600;letter-spacing:-.03em;white-space:nowrap}
.dsh .chip{display:inline-grid;border-radius:999px;padding:1px 8px 1px 6px;font-size:12px;font-weight:500;line-height:18px}
.dsh .chip>span{grid-area:1/1;display:flex;align-items:center;gap:3px;justify-content:center;white-space:nowrap}
.dsh .two{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
@container (min-width:640px){.dsh .two{grid-template-columns:minmax(0,3fr) minmax(0,2fr)}}
.dsh .pane{position:relative;height:186px;overflow:hidden;flex:none}
.dsh .ph{display:flex;justify-content:space-between;align-items:center;padding:10px 14px 0;font-size:12.5px;color:var(--muted)}
.dsh .ph b{font-size:13px;font-weight:600;color:var(--ink)}
.dsh .plot{position:absolute;left:42px;right:16px;top:38px;bottom:26px}
.dsh .plot svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.dsh .lg{position:absolute;inset:0;font-size:11px;color:var(--faint);font-variant-numeric:tabular-nums}
.dsh .lg .y{position:absolute;right:calc(100% + 8px);transform:translateY(-50%);line-height:1}
.dsh .lg .x{position:absolute;top:calc(100% + 8px);line-height:1;white-space:nowrap}
.dsh .rows{position:absolute;left:0;right:0;top:36px;height:145px;overflow:hidden}
.dsh .r{position:absolute;left:0;right:0;top:0;height:29px;padding:0 14px;display:flex;align-items:center;gap:10px;font-size:13px}
.dsh .r .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}
.dsh .r .bt{flex:none;width:54px;height:4px;border-radius:2px;background:var(--raised);overflow:hidden}
.dsh .r .bt i{display:block;height:100%;border-radius:2px;background:var(--ink)}
.dsh .r .v{flex:none;min-width:44px;display:flex;justify-content:flex-end}
${SRCSS}
</style>
<div class="dsh">
  <div class="bar">
    <div class="seg rg" role="group" aria-label="Date range"><div class="ind"></div>${RNGN.map(l => `<button type="button">${l.replace(' days','d')}</button>`).join('')}</div>
    <div class="seg sg" role="group" aria-label="Traffic source"><div class="ind"></div>${SRCN.map(l => `<button type="button">${l}</button>`).join('')}</div>
  </div>
  <div class="stats">${['Visitors','Conversion rate','Avg. session'].map(l => `<div class="stat"><span class="l">${l}</span><b class="n num"></b><span class="chip"><span></span><span></span></span></div>`).join('')}</div>
  <div class="two">
    <div class="card pane ch"><div class="ph"><b>Visitors per day</b><span class="sub"></span></div>
      <div class="plot" role="img"><svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">${[0,100,200,300].map(y => `<line x1="0" x2="1000" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>`).join('')}<path class="ar" fill="var(--ink)" fill-opacity=".06"/><path class="ln" fill="none" stroke="var(--ink)" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>
        ${[0,1].map(() => `<div class="lg" aria-hidden="true">${[0,1,2,3].map(k => `<span class="y" style="top:${(k/3*100).toFixed(2)}%"></span>`).join('')}${[0,1,2,3,4,5,6].map(() => '<span class="x"></span>').join('')}</div>`).join('')}</div></div>
    <div class="card pane tb"><div class="ph"><b>Top pages</b><span>Views</span></div><div class="rows" role="list" aria-label="Top pages by views"></div></div>
  </div>
  <span class="sr" role="status"></span>
</div>`,
  desc:'Change the range or the source and three regions answer in order, 80ms apart. First the stat numbers spring and each delta chip blurs over to its new sign and color. Then the line morphs point by point, left to right, onto a rescaled axis whose labels swap. Last the table rows spring to their new ranks while the view counts roll.',
  api:'stats.set(v, S.soft, t)   point[i].set(v, S.base, t + .08 + i·.006)   row.y.set(rank·29, S.base, t + .16 + rank·.02)',
  init(st){
    const $r = s => $(st, s), RH = 29, SHOW = 5;
    const stats = $$(st,'.stat').map((el,j) => ({ n:$(el,'.n'), chip:$(el,'.chip'), L:$$(el,'.chip>span'), sw:new Swap(0), k:new Track(1), v:new Track(0, S.soft),
      fmt:[v => Math.round(v).toLocaleString('en-US'), v => v.toFixed(2) + '%', v => `${Math.floor(v/60)}m ${String(Math.round(v) % 60).padStart(2,'0')}s`][j] }));
    const ln = $r('.ln'), ar = $r('.ar'), plot = $r('.plot'), sub = $r('.sub'), sr = $r('.sr');
    const P = [...Array(NP)].map(() => new Track(0)), Y = new Track(3000);
    const LG = $$(st,'.lg').map(el => ({ el, y:$$(el,'.y'), x:$$(el,'.x') })), lab = new Swap(0);
    const fillLabels = (g, step, ri) => { g.y.forEach((s,k) => s.textContent = kfmt(step*(3-k)));
      const xs = xTicks(ri); g.x.forEach((s,i) => { const o = xs[i]; s.style.display = o ? '' : 'none'; if (!o) return; s.textContent = o[1]; s.style.left = (o[0]*100).toFixed(2) + '%';
        s.style.transform = i === 0 ? 'none' : i === xs.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)'; }); };
    const rows = PAGES.map(([name], i) => { const el = document.createElement('div'); el.className = 'r'; el.setAttribute('role','listitem');
      el.innerHTML = '<span class="nm"></span><span class="bt" aria-hidden="true"><i></i></span><span class="v"><span class="dg" aria-hidden="true"></span><span class="sr"></span></span>';
      $(el,'.nm').textContent = name; $r('.rows').appendChild(el);
      const dg = new Digits($(el,'.dg'), 5); dg.set('0', true);
      return { el, dg, fill:$(el,'i'), sr:$(el,'.sr'), y:new Track(i*RH), o:new Track(1), w:new Track(0), val:0, until:Infinity, init:false }; });
    let ri = 1, si = 0, q = [];
    const rgR = segCtl($r('.rg'), i => { ri = i; apply(false); }, ri), sgR = segCtl($r('.sg'), i => { si = i; apply(false); }, si);
    const apply = inst => {
      const t0 = now(), tS = t0, tC = t0 + .08, tT = t0 + .16, s = series(ri, si), total = s.reduce((a,b) => a + b, 0), f = FIG[ri][si];
      const tv = [total, f[0], f[1]], dl = [f[2], f[3], f[4]];
      // 1. stat tiles
      stats.forEach((x,j) => { const tj = tS + j*.03, up = dl[j] >= 0, nx = 1 - x.sw.cur;
        x.L[nx].innerHTML = ic(up ? '<path d="M12 19V5M6 11l6-6 6 6"/>' : '<path d="M12 5v14M6 13l6 6 6-6"/>', 12, 2.5) + '<span>' + dsign(dl[j]) + '</span>';
        if (inst){ x.v.jump(tv[j]); x.sw.cur = nx; x.sw.prev = null; x.sw.t = -9; x.k.jump(up ? 1 : 0); }
        else { x.v.set(tv[j], S.soft, tj); x.sw.to(nx, tj + .05); x.k.set(up ? 1 : 0, S.base, tj + .05); } });
      // 2. chart: every point retargets, 6ms apart; the scale and its labels follow
      const pts = chartPts(ri, si), step = STEPS.find(v => v*3 >= Math.max(...pts)*1.06) || 3000, nxL = 1 - lab.cur;
      pts.forEach((v,i) => inst ? P[i].jump(v) : P[i].set(v, S.base, tC + i*.006));
      inst ? Y.jump(step*3) : Y.set(step*3, S.base, tC);
      fillLabels(LG[nxL], step, ri);
      if (inst){ lab.cur = nxL; lab.prev = null; lab.t = -9; } else lab.to(nxL, tC);
      sub.textContent = `Last ${RNGN[ri]} · ${SRCN[si]}`;
      plot.setAttribute('aria-label', `Visitors per day, last ${RNGN[ri]}, ${SRCN[si].toLowerCase()} sources, from ${pts[0].toLocaleString('en-US')} to ${pts[NP-1].toLocaleString('en-US')}`);
      // 3. table: rank by views; rows spring to their slot, values roll
      const views = PAGES.map(([,w,rf]) => Math.min(99999, Math.round(total*w[si]*rf[ri]))), order = views.map((v,i) => i).sort((a,b) => views[b] - views[a]), mx = views[order[0]];
      order.forEach((pi,rank) => { const r = rows[pi], tr = tT + rank*.02, shown = rank < SHOW, v = views[pi];
        r.sr.textContent = v.toLocaleString('en-US') + ' views';
        if (inst){ r.y.jump(rank*RH); r.o.jump(shown ? 1 : 0); r.w.jump(v/mx); r.dg.set(String(v), true); r.val = v; r.init = false; r.until = Infinity; }
        else { r.y.set(rank*RH, S.base, tr); r.o.set(shown ? 1 : 0, shown ? S.base : S.snap, tr); r.w.set(v/mx, S.base, tr);
          q.push([tr, () => { r.dg.dir = v >= r.val ? 1 : -1; r.val = v; r.dg.set(String(v)); r.until = now() + 1.3; }]); } });
      q.sort((a,b) => a[0] - b[0]);
      order.forEach(pi => $r('.rows').appendChild(rows[pi].el)); // reading order follows rank
      sr.textContent = `${RNGN[ri]}, ${SRCN[si]} sources. Visitors ${total.toLocaleString('en-US')}, ${dsign(dl[0])}. Conversion rate ${f[0].toFixed(2)} percent, ${dsign(dl[1])}. Top page ${PAGES[order[0]][0]}.`;
    };
    apply(true);
    return t => {
      while (q.length && q[0][0] <= t) q.shift()[1]();
      rgR(t); sgR(t);
      stats.forEach(x => { const k = clamp(x.k.at(t)); x.n.textContent = x.fmt(x.v.at(t));
        x.chip.style.background = mix(k,'var(--success-tint)','var(--danger-tint)'); x.chip.style.color = mix(k,'var(--success)','var(--danger)'); x.L.forEach((e,j) => x.sw.apply(e, j, t, 3)); });
      const ym = Y.at(t), xy = P.map((p,i) => [i*1000/(NP-1), 300*(1 - p.at(t)/ym)]);
      let d = `M${xy[0][0].toFixed(1)} ${xy[0][1].toFixed(1)}`;
      for (let i = 0; i < NP-1; i++){ const a = xy[Math.max(0,i-1)], b = xy[i], c = xy[i+1], e = xy[Math.min(NP-1,i+2)];
        d += `C${(b[0]+(c[0]-a[0])/6).toFixed(1)} ${(b[1]+(c[1]-a[1])/6).toFixed(1)} ${(c[0]-(e[0]-b[0])/6).toFixed(1)} ${(c[1]-(e[1]-b[1])/6).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`; }
      ln.setAttribute('d', d); ar.setAttribute('d', d + 'L1000 300L0 300Z');
      LG.forEach((g,k) => lab.apply(g.el, k, t, 4));
      rows.forEach(r => { const o = r.o.at(t); r.el.style.transform = `translateY(${px(r.y.at(t))})`; fade(r.el, o, null); r.el.style.visibility = o < .01 ? 'hidden' : 'visible';
        r.fill.style.width = (clamp(r.w.at(t))*100).toFixed(1) + '%';
        if (!r.init || t < r.until){ r.dg.render(t); r.init = true; if (r.until === Infinity) r.until = 0; } });
    };
  }});

/* ================================================================ notification center */
const TONE = { n:['var(--raised)','var(--muted)'], s:['var(--success-tint)','var(--success)'], w:['var(--warning-tint)','var(--warning)'], d:['var(--danger-tint)','var(--danger)'] };
const NI = { user:I.user, mail:MAIL, link:I.link, file:I.file, up:I.up, alert:I.alert, check:I.check };
const N_INIT = [
  ['t','user','n','Maya Chen commented on Pricing page',120,1], ['t','link','s','studio.example.com is live with a valid certificate',1080,1],
  ['t','file','n','Theo Alvarez published “Spring launch”',5400,1], ['t','up','n','Visitors are up 12% on last week',14400,0],
  ['e','mail','n','3 new replies in your Contact form',100000,1], ['e','alert','w','Your Studio plan renews on October 12',190000,0], ['e','check','s','Backup finished: 214 MB stored',260000,0]];
const N_POOL = [
  ['user','n','Priya Nair invited you to edit “About us”'], ['mail','n','New reply on Contact from Sam Ortiz'], ['alert','w','Your SSL certificate renews in 5 days'],
  ['check','s','Theo Alvarez resolved a comment on Home'], ['up','s','Your site loaded in 1.2 seconds on the last check'], ['alert','d','Backup failed for studio.example.com'],
  ['user','n','Lena Park joined the workspace as an editor'], ['file','n','Maya Chen scheduled “Fall pricing” for Monday']];
const ago = s => s < 45 ? 'Just now' : s < 3600 ? Math.max(1, Math.round(s/60)) + 'm ago' : s < 86400 ? Math.round(s/3600) + 'h ago' : s < 172800 ? 'Yesterday' : Math.floor(s/86400) + ' days ago';

atom({ id:'notifcenter', cat:'Workspace', name:'Notification center', block:'notification center, bell, badge, list', fam:['X','M','S','T'], wide:true, tall:true,
  html:`<style>
.ntf{position:absolute;inset:0}
.ntf .bar{position:absolute;left:0;right:0;top:0;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;border-bottom:1px solid var(--line)}
.ntf .bar b{font-size:15px;font-weight:600;letter-spacing:-.01em}
.ntf .bell{position:relative;width:36px;height:36px;border:1px solid var(--line);background:var(--card);border-radius:10px;display:grid;place-items:center;cursor:pointer;padding:0}
.ntf .bd{position:absolute;left:19px;top:-8px;height:20px;min-width:20px;padding:0 6px;border-radius:10px;background:var(--danger);color:#fff;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;line-height:1}
.ntf .sk{position:absolute;left:14px;top:72px;display:flex;flex-direction:column;gap:12px;width:min(260px,50%)}
.ntf .sk i{display:block;height:10px;border-radius:5px;background:var(--raised)}
.ntf .pn{position:absolute;right:12px;top:52px;width:min(360px,calc(100% - 24px));max-height:calc(100% - 62px);display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--line-soft);transform-origin:calc(100% - 30px) -10px}
.ntf .ph{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line-soft)}
.ntf .ph b{font-size:14px;font-weight:600}
.ntf .ls{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain}
.ntf .gh{padding:10px 14px 4px;font-size:12px;font-weight:600;color:var(--muted)}
.ntf .rw{display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;border:0;background:none;text-align:left;cursor:pointer;color:inherit}
.ntf .ic{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center}
.ntf .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.ntf .t{font-size:13px;line-height:1.35;font-weight:500}
.ntf .tm{font-size:12px;color:var(--faint)}
.ntf .dtw{flex:none;width:8px;height:8px}
.ntf .dt{display:block;width:8px;height:8px;border-radius:50%;background:var(--accent)}
${SRCSS}
</style>
<div class="ntf">
  <div class="bar"><b>Overview</b><button type="button" class="bell" aria-haspopup="dialog" aria-expanded="false" aria-label="Notifications">${ic(BELL,20,1.75)}<span class="bd" aria-hidden="true"><span class="d"></span></span></button></div>
  <div class="sk" aria-hidden="true"><i style="width:70%"></i><i style="width:100%"></i><i style="width:88%"></i><i style="width:46%"></i></div>
  <div class="pn card" role="dialog" aria-label="Notifications">
    <div class="ph"><b>Notifications</b><button type="button" class="btn ma">Mark all read</button></div>
    <div class="ls"><div class="gh ht">Today</div><div class="gt"></div><div class="gh he">Earlier</div><div class="ge"></div></div>
  </div>
  <span class="sr" role="status"></span>
</div>`,
  desc:'The bell opens a panel that pops out of its own corner. Clicking a row shrinks its dot, mixes its text to muted and rolls the badge down. Mark all read clears the dots top to bottom 40ms apart, rolls the badge to 0, then the badge exits. Every 5 seconds on the clock a notification arrives: the badge rolls up and, if the panel is open, the row enters at the top on a height spring that pushes the rest down.',
  api:'dot[i].set(0, S.base, t + i·.04)   badge.set(0) → badge.o.set(0, S.snap, t + .3)   row.h.set(1) · row.o.set(1, S.base, t + .06)',
  init(st){
    const bell = $(st,'.bell'), bd = $(st,'.bd'), panel = $(st,'.pn'), ls = $(st,'.ls'), gT = $(st,'.gt'), gE = $(st,'.ge'), hT = $(st,'.ht'), hE = $(st,'.he'), ma = $(st,'.ma'), live = $(st,'.sr');
    const dg = new Digits($(bd,'.d'), 2), bo = new Track(1), o = new Track(0), mo = new Track(1), rows = []; let q = [], pi = 0, nextAt = now() + 5;
    const CAP = 10;
    const unread = () => rows.filter(r => r.unread && !r.gone).length;
    const sync = () => { const n = unread(); bell.setAttribute('aria-label', n ? `Notifications, ${n} unread` : 'Notifications'); mo.set(n ? 1 : 0, S.base); ma.disabled = !n; };
    const setBadge = (n, t = now()) => { if (n > 0){ dg.set(String(Math.min(n, 99))); bo.set(1, S.base, t); } else { dg.set('0'); bo.set(0, S.snap, t + .3); } };
    const build = (g, [ic_, tone, text], born, age, isUnread, instant) => {
      const w = document.createElement('div'), tn = TONE[tone];
      w.innerHTML = `<button type="button" class="rw"><span class="ic" style="background:${tn[0]};color:${tn[1]}">${ic(NI[ic_], 15, 2)}</span><span class="tx"><span class="t"><span class="sr">Unread: </span><span class="s"></span></span><span class="tm num"></span></span><span class="dtw"><i class="dt"></i></span></button>`;
      $(w,'.s').textContent = text;
      const r = { w, g, btn:$(w,'.rw'), t:$(w,'.t'), tm:$(w,'.tm'), dt:$(w,'.dt'), un:$(w,'.t .sr'), k:new Track(isUnread ? 1 : 0), hv:new Track(0), h:new Track(instant ? 1 : 0), o:new Track(instant ? 1 : 0), unread:isUnread, gone:false, born, age, lbl:'' };
      if (!isUnread) r.un.hidden = true;
      r.btn.onclick = () => { if (!r.unread) return; r.unread = false; r.un.hidden = true; r.k.set(0); const n = unread(); dg.dir = -1; setBadge(n); sync(); };
      r.btn.onpointerenter = () => r.hv.set(1, S.snap); r.btn.onpointerleave = () => r.hv.set(0, S.snap);
      rows.push(r); return r;
    };
    N_INIT.forEach(([g,i,tone,text,age,u]) => { const r = build(g === 't' ? gT : gE, [i,tone,text], 0, age, !!u, true); r.g.appendChild(r.w); });
    dg.set(String(unread()), true); sync(); mo.jump(1);
    const order = () => $$(ls,'.rwrap').map(e => e._r);
    rows.forEach(r => { r.w.className = 'rwrap'; r.w._r = r; });
    const arrive = t => {
      const [i,tone,text] = N_POOL[pi++ % N_POOL.length], open = o.target > 0, r = build(gT, [i,tone,text], t, 0, true, !open);
      r.w.className = 'rwrap'; r.w._r = r; gT.insertBefore(r.w, gT.firstChild);
      if (open){ r.h.set(1, S.base, t); r.o.set(1, S.base, t + .06); }
      live.textContent = 'New notification: ' + text;
      const alive = rows.filter(x => !x.gone);
      if (alive.length > CAP){ const v = order().filter(x => !x.gone).pop(); v.gone = true; if (open){ v.h.set(0, S.base, t); v.o.set(0, S.snap, t); } else { v.h.jump(0); v.o.jump(0); } }
      dg.dir = 1; setBadge(unread(), t); sync();
    };
    const setOpen = v => { openSet(o, v); bell.setAttribute('aria-expanded', v); };
    bell.onclick = () => setOpen(!o.target);
    outside(st, [bell, panel], () => { if (o.target) setOpen(false); });
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && o.target){ setOpen(false); bell.focus(); } });
    ma.onclick = () => { const t0 = now(), un = order().filter(r => r.unread && !r.gone); if (!un.length) return;
      un.forEach((r,i) => { r.unread = false; r.un.hidden = true; r.k.set(0, S.base, t0 + i*.04); });
      q.push([t0 + (un.length - 1)*.04 + .12, () => { dg.dir = -1; setBadge(0); }]); sync(); };
    return t => {
      if (t >= nextAt){ arrive(t); nextAt = t - nextAt > 5 ? t + 5 : nextAt + 5; }
      while (q.length && q[0][0] <= t) q.shift()[1]();
      pop(panel, o.at(t), -6);
      const bp = clamp(bo.at(t)); bd.style.opacity = bp.toFixed(3); bd.style.transform = `scale(${(.6 + .4*bp).toFixed(4)})`; bd.style.visibility = bp < .01 ? 'hidden' : 'visible'; dg.render(t);
      ma.style.opacity = (.45 + .55*clamp(mo.at(t))).toFixed(3);
      for (let i = rows.length - 1; i >= 0; i--){ const r = rows[i], hp = r.h.at(t);
        if (r.gone && hp < .001){ r.w.remove(); rows.splice(i,1); continue; }
        r.w.style.display = hp < .001 ? 'none' : '';
        if (Math.abs(hp - 1) < .0005){ r.w.style.height = ''; r.w.style.overflow = ''; } else { r.w.style.overflow = 'hidden'; r.w.style.height = px(Math.max(0,hp)*r.btn.offsetHeight); }
        const op = r.o.at(t); fade(r.btn, op, (1 - clamp(op))*-6);
        const k = clamp(r.k.at(t)), hv = clamp(r.hv.at(t));
        r.btn.style.background = mix(k,'var(--accent-tint)', mix(hv*.7,'var(--raised)','transparent'));
        r.t.style.color = mix(k,'var(--ink)','var(--muted)'); r.dt.style.transform = `scale(${k.toFixed(3)})`;
        const l = ago(r.age + Math.max(0, t - r.born)); if (l !== r.lbl){ r.lbl = l; r.tm.textContent = l; } }
      hT.style.display = rows.some(r => r.g === gT && !r.gone) ? '' : 'none'; hE.style.display = rows.some(r => r.g === gE && !r.gone) ? '' : 'none';
    };
  }});

/* ================================================================ onboarding */
const TASKS = [
  ['Connect domain','Point studio.example.com at your site with one CNAME record. Certificates are issued for you.'],
  ['Pick theme','Choose a starting palette and typefaces. You can change both at any time.'],
  ['Write first post','Drafts save as you type. Publish when you are ready, or schedule it for later.'],
  ['Invite a teammate','Editors can write and publish. Viewers can read and comment.']];

atom({ id:'onboarding', cat:'Workspace', name:'Onboarding checklist', block:'onboarding, checklist, progress ring', fam:['M','S','T'], wide:true, tall:true,
  html:`<style>
.onb{position:absolute;left:50%;top:0;width:min(420px,calc(100% - 24px));overflow:hidden;border:1px solid var(--line-soft)}
.onb .L{position:absolute;left:0;right:0;top:0;padding:16px 18px}
.onb h4{margin:0;font-size:20px;line-height:1.2;letter-spacing:-.02em;font-weight:600}
.onb p{margin:0}
.onb .th{display:flex;align-items:center;gap:10px;width:100%;padding:6px 0;border:0;background:none;cursor:pointer;text-align:left;font-size:14px;color:inherit}
.onb .bx{position:relative;flex:none;width:18px;height:18px;border-radius:5px;border:1.5px solid var(--line);display:grid;place-items:center}
.onb .bx svg{position:static;transform:translate(.5px,-.5px)}
.onb .tl[data-nd] .in p{display:none}
.onb .tx{position:relative}
.onb .tx i{position:absolute;left:0;top:52%;height:1.5px;background:var(--muted)}
.onb .tk+.tk{border-top:1px solid var(--line-soft)}
.onb .bd{overflow:hidden;height:0}
.onb .bd .in{padding:0 0 10px 28px}
.onb .md{padding:4px 10px}
.onb .btn:disabled{cursor:default}
${SRCSS}
</style>
<button type="button" class="btn rs" style="position:absolute;top:10px;right:12px;z-index:2">Reset</button>
<div class="onb card">
  <section class="L lw" aria-label="Welcome">
    <h4>Welcome to Studio</h4>
    <p class="small muted" style="margin:8px 0 14px">Four short steps get your site live. Most people finish in about five minutes.</p>
    <div class="row" style="gap:12px"><button type="button" class="btn ink go">Start setup</button><span class="small muted">4 steps</span></div>
  </section>
  <section class="L lc" aria-label="Setup checklist">
    <div class="row" style="gap:12px;margin-bottom:6px">
      <svg class="rg" width="36" height="36" viewBox="0 0 40 40" role="progressbar" aria-label="Setup progress" aria-valuemin="0" aria-valuemax="4" aria-valuenow="0"><circle cx="20" cy="20" r="16" fill="none" stroke="var(--line)" stroke-width="4"/><circle class="pr" cx="20" cy="20" r="16" fill="none" stroke="var(--ink)" stroke-width="4" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 20 20)"/></svg>
      <div><b style="font-weight:600">Set up your site</b><div class="small muted"><span class="dn" aria-hidden="true"></span><span class="sr">0</span> of 4 done</div></div>
    </div>
    <label class="row small muted" style="gap:6px;cursor:pointer"><input type="checkbox" class="dt-on" checked> Details</label>
    <div class="tl"></div>
  </section>
  <section class="L ld" aria-label="Setup complete" style="text-align:center">
    <div class="col" style="align-items:center;gap:0">
      <svg class="ok" width="24" height="24" viewBox="0 0 44 44" aria-hidden="true"><circle class="dc" cx="22" cy="22" r="20" fill="var(--success-tint)" fill-opacity="0"/><circle class="rg2" cx="22" cy="22" r="20" fill="none" stroke="var(--success)" stroke-width="2" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 22 22)"/><path class="ck" d="M13.5 22.5 19.5 28.5 30.5 16" fill="none" stroke="var(--success)" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>
      <h4 class="dt" style="margin-top:12px">Your site is ready</h4>
      <p class="small muted dm" style="margin:6px 0 14px;max-width:34ch">Domain connected, theme chosen, first post drafted and a teammate invited. Everything stays editable in Settings.</p>
      <button type="button" class="btn ink cont">Continue</button>
    </div>
  </section>
</div>`,
  desc:'Start setup swaps the welcome card for the checklist while the card height springs to fit. Opening a task slides its body out in place. Mark done runs in order: box fills, check draws, strike runs through, then 40ms later the ring fills and the count rolls, then the task closes and the next one opens. When the fourth lands the checklist fades, the card shrinks around the finished state, and the success circle draws, then its check, then the message, then Continue. No confetti.',
  api:'box.set(1)   check.set(1, S.base, t + .04)   strike.set(1, S.base, t + .08)   ring.set(n/4, S.base, t + .12)   if (n === 4) swap.to("done"); H.set(h, S.base, t + EXIT)',
  init(st){
    const card = $(st,'.onb'), LY = { w:$(st,'.lw'), c:$(st,'.lc'), d:$(st,'.ld') }, tl = $(st,'.tl'), pr = $(st,'.pr'), rg = $(st,'.rg'), dn = new Digits($(st,'.dn'), 1), dsr = $(st,'.lc .sr');
    const dc = $(st,'.dc'), rg2 = $(st,'.rg2'), ck = $(st,'.ck'), dt = $(st,'.dt'), dm = $(st,'.dm'), cont = $(st,'.cont'), go = $(st,'.go');
    const sw = new Swap('w'), H = new Track(0), ring = new Track(0), c1 = new Track(0), c2 = new Track(0), tt = new Track(0), tm = new Track(0), tb = new Track(0);
    let q = [], steadyAt = -1, nDone = 0;
    dn.set('0', true);
    const tasks = TASKS.map(([name, desc], i) => { const el = document.createElement('div'); el.className = 'tk'; const id = 'onboarding-task-' + i;
      el.innerHTML = `<button type="button" class="th" aria-expanded="false" aria-controls="${id}"><span class="bx" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--card)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg></span><span class="tx"><span class="nm"></span><i></i></span><svg class="cv" style="margin-left:auto;flex:none;color:var(--muted)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="bd" id="${id}" role="region" aria-label="${name}"><div class="in"><p class="small muted" style="margin-bottom:8px"></p><button type="button" class="btn ink md">Mark done</button></div></div>`;
      $(el,'.nm').textContent = name; $(el,'.in p').textContent = desc; tl.appendChild(el);
      return { el, th:$(el,'.th'), bx:$(el,'.bx'), ck:$(el,'.bx path'), tx:$(el,'.tx'), ln:$(el,'i'), cv:$(el,'.cv'), bd:$(el,'.bd'), inn:$(el,'.in'), md:$(el,'.md'), on:0,
        f:new Track(0), c:new Track(0), s:new Track(0), open:new Track(0) }; });
    const setOpen = (r, v, t = now()) => { r.open.set(v ? 1 : 0, S.base, t); r.th.setAttribute('aria-expanded', !!v); };
    $(st,'.dt-on').onchange = ev => tl.toggleAttribute('data-nd', !ev.target.checked);
    const nat = k => Math.min(LY[k].scrollHeight, st.clientHeight - (st.clientWidth < 520 ? 44 : 14) - 10);
    const showHeight = (k, t0) => H.set(nat(k), S.base, t0 + EXIT);
    const toState = (k, t0) => { sw.to(k, t0); showHeight(k, t0); steadyAt = t0 + EXIT + .55; };
    const refocus = (el, d) => setTimeout(() => { if (card.contains(document.activeElement) || document.activeElement === document.body) el.focus(); }, d);
    tasks.forEach((r,i) => {
      r.th.onclick = () => tasks.forEach((x,j) => { const v = j === i && !x.open.target; if (j === i || x.open.target) setOpen(x, v); });
      r.md.onclick = () => { if (r.on) return; r.on = 1; r.md.disabled = true; r.md.textContent = 'Done'; nDone++;
        const t0 = now(); r.f.set(1); r.c.set(1, S.base, t0 + .04); r.s.set(1, S.base, t0 + .08);
        ring.set(nDone/4, S.base, t0 + .12); rg.setAttribute('aria-valuenow', nDone);
        q.push([t0 + .12, () => { dn.dir = 1; dn.set(String(nDone)); dsr.textContent = nDone; }]);
        setOpen(r, false, t0 + .2);
        const nx = tasks.find(x => !x.on); if (nx) setOpen(nx, true, t0 + .3);
        else { q.push([t0 + .7, () => { const tf = now(); toState('d', tf);
          const b = tf + EXIT; c1.set(1, S.base, b + .1); c2.set(1, S.base, b + .24); tt.set(1, S.base, b + .34); tm.set(1, S.base, b + .42); tb.set(1, S.base, b + .5);
          refocus(cont, 900); }]); } };
    });
    go.onclick = () => { toState('c', now()); refocus(tasks[0].th, 260); };
    cont.onclick = () => {}; // host wires navigation; the demo holds the finished state
    $(st,'.rs').onclick = () => { q = []; const t0 = now(); nDone = 0;
      tasks.forEach(r => { r.on = 0; r.md.disabled = false; r.md.textContent = 'Mark done'; r.f.set(0); r.c.set(0); r.s.set(0); r.open.set(0); r.th.setAttribute('aria-expanded', false); });
      ring.set(0); rg.setAttribute('aria-valuenow', 0); dn.dir = -1; dn.set('0'); dsr.textContent = '0';
      if (sw.cur !== 'w'){ toState('w', t0); q.push([t0 + EXIT + .05, () => { [c1,c2,tt,tm,tb].forEach(x => x.jump(0)); }]); refocus(go, 300); } };
    return t => {
      while (q.length && q[0][0] <= t) q.shift()[1]();
      const steady = t > steadyAt, narrow = st.clientWidth < 520, top = narrow ? 44 : 14;
      let hh; if (steady){ hh = nat(sw.cur); H.jump(hh); } else hh = H.at(t);
      card.style.height = px(Math.max(0, hh)); card.style.transform = `translate(-50%,${px(top)})`; card.style.pointerEvents = steady ? '' : 'none';
      LY.c.style.maxHeight = steady ? px(hh) : 'none'; LY.c.style.overflowY = steady && LY.c.scrollHeight > hh + 1 ? 'auto' : 'hidden';
      const amp = sw.cur === 'd' || sw.prev === 'd' ? 14 : 5; Object.keys(LY).forEach(k => sw.apply(LY[k], k, t, amp));
      const p = clamp(ring.at(t)), fin = clamp((p - .75)*4);
      pr.setAttribute('stroke-dasharray', `${(p*100).toFixed(2)} 100`); pr.style.stroke = mix(fin,'var(--success)','var(--ink)'); dn.render(t);
      tasks.forEach(r => { const f = clamp(r.f.at(t)), c = clamp(r.c.at(t)), s = clamp(r.s.at(t)), o = clamp(r.open.at(t));
        r.bx.style.background = mix(f,'var(--ink)','transparent'); r.bx.style.borderColor = mix(f,'var(--ink)','var(--line)'); r.ck.style.strokeDashoffset = (1 - c).toFixed(3);
        r.ln.style.width = (s*100).toFixed(1) + '%'; r.tx.style.color = mix(s,'var(--muted)','var(--ink)');
        r.cv.style.transform = `rotate(${(o*180).toFixed(1)}deg)`;
        if (o < .0005){ r.bd.style.height = '0px'; r.bd.style.visibility = 'hidden'; }
        else { r.bd.style.visibility = 'visible'; r.bd.style.height = o > .9995 ? 'auto' : px(o*r.inn.offsetHeight); fade(r.inn, o, (1 - o)*-4); } });
      const k1 = clamp(c1.at(t)), k2 = clamp(c2.at(t));
      dc.setAttribute('fill-opacity', k1.toFixed(3)); rg2.style.strokeDashoffset = (1 - k1).toFixed(3); ck.style.strokeDashoffset = (1 - k2).toFixed(3);
      fade(dt, tt.at(t), (1 - clamp(tt.at(t)))*6); fade(dm, tm.at(t), (1 - clamp(tm.at(t)))*6); fade(cont, tb.at(t), (1 - clamp(tb.at(t)))*6);
    };
  }});
}