

/* ---------- Mega menus: ten header menus, one shared kit ---------- */
(() => {
const mx = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const MGI = {
  pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  blocks:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  theme:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  form:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.800M18.500 14.200A6.500 6.500 0 0 1 21.500 20"/>',
  bag:'<path d="M5 7h14l-1 13H6z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  chart:'<path d="M5 20v-7M12 20V5M19 20V9"/>',
  flow:'<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11v1a3 3 0 0 1-3 3H9a3 3 0 0 0-3 3"/>',
  shield:'<path d="M12 3 4 6v6c0 5 3.500 8 8 9 4.500-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  plug:'<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  book:'<path d="M4 4.500A1.500 1.500 0 0 1 5.500 3H20v15H5.500A1.500 1.500 0 0 0 4 19.500z"/><path d="M4 19.500A1.500 1.500 0 0 0 5.500 21H20v-3"/>',
  braces:'<path d="M8 4c-2 0-3 1-3 3v2c0 1.500-1 2.500-2 3 1 .5 2 1.500 2 3v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1.500 1 2.500 2 3-1 .5-2 1.500-2 3v2c0 2-1 3-3 3"/>',
  term:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  zap:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  pulse:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  news:'<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.600"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
  heart:'<path d="M12 20s-8-4.700-8-10.500A4.500 4.500 0 0 1 12 7a4.500 4.500 0 0 1 8 2.500C20 15.300 12 20 12 20z"/>',
  cap:'<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11.500V16c0 1.500 3 3 6 3s6-1.500 6-3v-4.500"/>',
  star:'<path d="m12 3 2.700 5.600 6.100.8-4.500 4.200 1.100 6.100L12 16.800 6.600 19.700l1.100-6.100L3.200 9.400l6.100-.8z"/>',
  play:'<path d="M7 4v16l13-8z"/>',
  code:'<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  cog:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.900 4.900 7 7M17 17l2.100 2.100M4.900 19.100 7 17M17 7l2.100-2.100"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  arr:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  chR:'<path d="m9 6 6 6-6 6"/>', chL:'<path d="m15 6-6 6 6 6"/>',
  cmd:'<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.500-3.500"/>',
  file:'<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/>',
  send:'<path d="m21 3-9 18-2.500-7.500L2 11z"/><path d="m21 3-11.500 10.500"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  moon:'<path d="M20 14.500A8 8 0 0 1 9.500 4 8 8 0 1 0 20 14.500z"/>',
  tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.500" cy="8.500" r="1.200"/>',
  chev:'<path d="m6 9 6 6 6-6"/>'
};
const mi = (k, s = 18, w = 1.8) => ic(MGI[k] || MGI.file, s, w);
const mgVis = el => !el.closest('[inert]') && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
const mgFoc = root => $$(root, 'a[href],button:not([disabled]),input:not([disabled]),[tabindex="0"]').filter(mgVis);
const mgLogo = `<a class="mg-lg" href="#" aria-label="Studio home"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="7" fill="var(--ink)"/><path d="m5.500 9.500 6.500-3.200 6.500 3.200-6.500 3.200zM5.500 14l6.500 3.200 6.500-3.200" fill="none" stroke="var(--card)" stroke-width="1.700" stroke-linejoin="round" stroke-linecap="round"/></svg><span>Studio</span></a>`;
const mgBurger = `<button type="button" class="mg-bg" aria-label="Open menu" aria-expanded="false"><i></i><i></i><i></i></button>`;
const mgPageHTML = `<div class="mg-pg" aria-hidden="true"><div class="mg-ey">Now viewing</div><div class="mg-hd"><span>Home</span><span></span></div><p class="mg-ln">Choose anything from the menu. The page behind it follows your choice, so you can see what a selection does.</p><div class="mg-cds"><i></i><i></i><i></i></div></div>`;
const MGCSS = `<style>
.mg-w{position:absolute;inset:0;isolation:isolate;overflow:hidden;text-align:left;font-size:14px;line-height:1.4;color:var(--ink)}
.mg-w *{box-sizing:border-box}
.mg-w a{color:inherit;text-decoration:none}
.mg-w ul{list-style:none;margin:0;padding:0}
.mg-w button,.mg-w a{-webkit-tap-highlight-color:transparent}
.mg-w .hint{z-index:1}
.mg-pg{position:absolute;inset:0;padding:100px 28px 0;pointer-events:none}
.mg-ey{font-size:12px;font-weight:500;color:var(--muted)}
.mg-hd{position:relative;height:40px;margin:4px 0 6px;font-size:30px;font-weight:600;letter-spacing:-.03em;line-height:40px}
.mg-hd span{position:absolute;left:0;top:0;white-space:nowrap}
.mg-ln{margin:0;max-width:46ch;color:var(--muted)}
.mg-cds{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:22px;max-width:640px}
.mg-cds i{display:block;height:84px;border-radius:12px;background:var(--raised)}
.mg-w[data-n] .mg-pg{padding:92px 20px 0}
.mg-w[data-n] .mg-hd{font-size:26px}
.mg-sc{position:absolute;inset:0;z-index:20;background:#0C1016;opacity:0;visibility:hidden}
.mg-bar{position:absolute;z-index:40;top:12px;left:12px;right:12px;height:56px;display:flex;align-items:center;gap:2px;padding:0 10px 0 14px;background:var(--card);border-radius:14px;box-shadow:var(--shadow)}
.mg-lg{display:flex;align-items:center;gap:9px;flex:none;margin-right:10px;font-size:15px;font-weight:600;letter-spacing:-.02em;border-radius:8px}
.mg-lg svg{flex:none}
.mg-t{position:relative;display:inline-flex;align-items:center;gap:5px;flex:none;height:36px;padding:0 11px;border:0;border-radius:9px;background:none;font:500 14px var(--sans);color:var(--ink);cursor:pointer;white-space:nowrap}
.mg-t svg{flex:none;color:var(--muted)}
.mg-it{position:absolute;left:11px;right:11px;bottom:3px;height:2px;border-radius:2px;background:var(--faint);transform-origin:0 50%;transform:scaleX(0);pointer-events:none}
.mg-sp{flex:1;min-width:0}
.mg-cta{display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:9px;white-space:nowrap;margin-left:6px}
.mg-bg{display:none;position:relative;flex:none;width:40px;height:40px;border:0;border-radius:10px;background:none;cursor:pointer}
.mg-bg i{position:absolute;left:11px;top:19px;width:18px;height:2px;border-radius:2px;background:var(--ink)}
.mg-bg i:first-of-type{top:13px}
.mg-bg i:last-of-type{top:25px}
.mg-ic{flex:none;width:34px;height:34px;border-radius:9px;background:var(--accent-tint);color:var(--accent);display:grid;place-items:center}
.mg-lk{position:relative;z-index:1;display:flex;gap:11px;align-items:flex-start;padding:9px 10px;border-radius:10px}
.mg-lk b{display:block;font-size:14px;font-weight:500;letter-spacing:-.005em}
.mg-lk small{display:block;margin-top:1px;font-size:12.5px;line-height:1.35;color:var(--muted)}
.mg-pl{position:absolute;left:0;top:0;z-index:0;border-radius:10px;background:var(--raised);opacity:0;pointer-events:none}
.mg-w[data-n] .mg-dt{display:none!important}
.mg-w:not([data-n]) .mg-mb{display:none!important}
.mg-w[data-n] .mg-bg.mg-mb{display:block!important}
.mg-w[data-m] .mg-lo{display:none}
.mg-w[data-s] .mg-bar .mg-cta.ink.mg-dt{display:none}
.mg-w[data-m] .mg-t{padding:0 8px}
.mg-w[data-m] .mg-lg{margin-right:4px}
.mg-w[data-m] .mg-cta{padding:0 12px;margin-left:2px}
.mg-sh{position:absolute;z-index:30;left:12px;right:12px;top:76px;bottom:12px;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:auto;overscroll-behavior:contain;visibility:hidden;transform-origin:50% 0}
.mg-ac{border-bottom:1px solid var(--line-soft)}
.mg-ah{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:50px;padding:0 16px;border:0;background:none;font:500 15px var(--sans);color:var(--ink);cursor:pointer;text-align:left}
.mg-ah svg{flex:none;color:var(--muted)}
.mg-ab{height:0;overflow:hidden}
.mg-ai{padding:0 8px 12px}
.mg-gh{margin:8px 0 2px;padding:0 8px;font-size:12px;font-weight:500;color:var(--muted)}
.mg-mr{display:flex;gap:11px;align-items:flex-start;padding:8px;border-radius:10px}
.mg-mr:active{background:var(--raised)}
.mg-mr b{display:block;font-size:14px;font-weight:500}
.mg-mr small{display:block;font-size:12.5px;line-height:1.35;color:var(--muted)}
.mg-lkm{display:flex;align-items:center;min-height:50px;padding:0 16px;font:500 15px var(--sans);border-bottom:1px solid var(--line-soft)}
.mg-nx .mg-ac{border-bottom:0}
.mg-nx .mg-ah{min-height:44px;padding:0 8px;font-size:14px;color:var(--muted)}
.mg-nx .mg-ah[aria-expanded="true"]{color:var(--ink)}
.mg-nx .mg-ai{padding:0 0 8px 8px}
.mg-nl{display:block;padding:11px 8px;border-radius:8px;font-size:14px}
.mg-nl:active{background:var(--raised)}
.mg-cb{display:flex;gap:8px;padding:14px 16px 16px}
.mg-cb a{flex:1;justify-content:center;margin:0}
.mg-t:hover,.mg-ah:hover{background:var(--raised)}
@media (hover:none){.mg-t:hover,.mg-ah:hover{background:none}}
</style>`;

// accordion rows with a height spring; nested accordions work because inner height is measured live, deepest first
const mgAc = (title, inner) => `<div class="mg-ac"><button type="button" class="mg-ah"><span>${title}</span>${ic(MGI.chev,16)}</button><div class="mg-ab"><div class="mg-ai">${inner}</div></div></div>`;
function mgAcc(root){
  const acs = $$(root, '.mg-ac').map(el => {
    const b = $(el, ':scope > .mg-ah'), body = $(el, ':scope > .mg-ab'), inner = $(body, ':scope > .mg-ai'), ch = $(b, 'svg');
    const x = { el, b, body, inner, ch, p:new Track(0), open:false, ex:el.parentElement.hasAttribute('data-ex') };
    b.setAttribute('aria-expanded', 'false'); body.inert = true;
    x.set = v => { x.open = v; x.p.set(v ? 1 : 0, v ? S.base : S.snap); b.setAttribute('aria-expanded', v); body.inert = !v;
      if (v && x.ex) acs.forEach(y => { if (y !== x && y.el.parentElement === el.parentElement && y.open) y.set(false); }); };
    b.onclick = () => x.set(!x.open);
    return x; });
  return { acs, closeAll(){ acs.forEach(x => { x.open = false; x.p.jump(0); x.b.setAttribute('aria-expanded', 'false'); x.body.inert = true; }); },
    render(t){ for (let i = acs.length - 1; i >= 0; i--){ const x = acs[i], p = clamp(x.p.at(t));
      x.body.style.height = p < .002 && !x.open ? '0px' : px(p * x.inner.offsetHeight);
      x.inner.style.opacity = clamp((p - .05)/.6).toFixed(3); x.ch.style.transform = `rotate(${(p*180).toFixed(1)}deg)`; } } };
}
// responsive flags from the stage width, never the viewport
function mgFit(st, w, fn){
  let n0, m0; const f = () => { const W = st.clientWidth; if (!W) return; const n = W < 640, m = W < 900; w.toggleAttribute('data-n', n); w.toggleAttribute('data-m', m); w.toggleAttribute('data-s', W < 692);
    if (n !== n0 || m !== m0){ const ch = n !== n0; n0 = n; m0 = m; fn(n, ch); } };
  new ResizeObserver(f).observe(st); f(); return f;
}
// the page behind the menu follows the selection: headline swaps
function mgPage(w){
  const sp = $$(w, '.mg-hd span'), sw = new Swap(0); let k = 0;
  return { go(txt){ k = 1 - k; sp[k].textContent = txt; sw.to(k); }, render(t){ sp.forEach((s, j) => sw.apply(s, j, t, 6)); } };
}
// arrow-key walk through whatever is visible inside a panel
function mgArrows(panel, back){
  panel.addEventListener('keydown', e => {
    if (e.defaultPrevented || !/^(Arrow(Up|Down|Left|Right)|Home|End)$/.test(e.key)) return;
    if (e.target.tagName === 'INPUT' && /^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) return;
    const f = mgFoc(panel), i = f.indexOf(e.target); if (i < 0) return;
    e.preventDefault();
    if (e.key === 'Home') return f[0].focus();
    if (e.key === 'End') return f[f.length - 1].focus();
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
    if (i + d < 0){ back && back(); return; }
    f[clamp(i + d, 0, f.length - 1)].focus();
  });
}
// hover plate that glides between items with lagging edges; follows focus too
function mgPlate(box, items){
  const pl = mx('i', 'mg-pl'); box.insertBefore(pl, box.firstChild);
  const ex = edges(0, 0), ey = edges(0, 0), op = new Track(0, S.snap); let on = false;
  const go = (el, inst) => { const a = el.getBoundingClientRect(), b = box.getBoundingClientRect(), s = b.width / box.offsetWidth || 1;
    const l = (a.left - b.left)/s + box.scrollLeft, r = l + a.width/s, tp = (a.top - b.top)/s + box.scrollTop, bt = tp + a.height/s;
    if (!on || inst){ ex.jump(l, r); ey.jump(tp, bt); } else { ex.go(l, r); ey.go(tp, bt); } on = true; op.set(1); };
  const hide = () => { on = false; op.set(0); };
  items.forEach(el => { el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') go(el); }); el.addEventListener('focus', () => { if (el.matches(':focus-visible')) go(el); }); });
  box.addEventListener('pointerleave', hide); box.addEventListener('focusout', e => { if (!box.contains(e.relatedTarget)) hide(); });
  return { go, hide, render(t){ const l = ex.A.at(t), r = ex.B.at(t), tp = ey.A.at(t), bt = ey.B.at(t);
    pl.style.transform = `translate(${px(l)},${px(tp)})`; pl.style.width = px(Math.max(0, r - l)); pl.style.height = px(Math.max(0, bt - tp)); pl.style.opacity = clamp(op.at(t)).toFixed(3); } };
}
// stagger: each item rises on its own spring a few ms after the one before
const mgStag = (items, t, t0, step = .025, y = 6) => items.forEach((el, i) => { const p = clamp(prog(t, t0 + i*step)); el.style.opacity = p.toFixed(3); el.style.transform = p > .995 ? 'none' : `translateY(${px((1 - p)*y)})`; });
const mgSwapPanes = (sw, panes, t, dir, amp = 16) => panes.forEach((p, k) => { sw.apply(p, k, t, 0); const q = parseFloat(p.style.opacity) || 0; p.style.transform = `translateX(${px((1 - q)*amp*(k === sw.cur ? dir : -dir))})`; p.style.pointerEvents = k === sw.cur ? 'auto' : 'none'; });
const mgReset = (sw, k) => { sw.cur = k; sw.prev = null; sw.t = -9; };

// filtered list: leaving rows fade first, the rest slide up after, entering rows arrive last
function mgFlow(host, els, hs){
  const E = els.map((el, i) => ({ el, h:hs[i], y:new Track(0), o:new Track(0, S.snap), shown:false })), hh = new Track(0); let target = 0;
  return { E, get target(){ return target; },
    place(pos, hT, inst){ const t = now();
      E.forEach((e, i) => { const y = pos[i];
        if (y == null){ if (e.shown){ if (inst) e.o.jump(0); else e.o.set(0, S.snap, t); e.shown = false; } return; }
        if (!e.shown){ e.y.jump(y); if (inst) e.o.jump(1); else e.o.set(1, S.base, t + EXIT + .05); e.shown = true; } else if (inst) e.y.jump(y); else e.y.set(y, S.base, t + EXIT*.7); });
      target = hT; if (inst) hh.jump(hT); else hh.set(hT, S.base, t + EXIT*.5); },
    render(t){ E.forEach(e => { const o = clamp(e.o.at(t)); e.el.style.transform = `translateY(${px(e.y.at(t))})`; e.el.style.opacity = o.toFixed(3); e.el.style.visibility = o < .01 ? 'hidden' : 'visible';
        e.el.style.filter = o < .98 ? `blur(${((1 - o)*BLUR).toFixed(2)}px)` : 'none'; e.el.style.pointerEvents = e.shown ? 'auto' : 'none'; });
      host.style.height = px(Math.max(0, hh.at(t))); } };
}
// hover intent + open/close controller for a row of disclosure triggers (hover waits, switching is instant, leaving has a grace period)
const MG = { open:.12, close:.22 };
function mgCtl(o){
  const T = o.trig, has = o.has; let cur = -1, pend = null, closeAt = 0, pinned = false, foc = null;
  const tp = T.map(() => new Track(0, S.snap)), zones = [o.bar, ...o.zones];
  const state = i => { cur = i; T.forEach((b, j) => { if (has[j]) b.setAttribute('aria-expanded', j === i); tp[j].set(j === i ? 1 : 0); }); };
  const ctl = { get cur(){ return cur; }, get pinned(){ return pinned; },
    open(i, how){ pend = null; closeAt = 0; if (how !== 'hover') pinned = true; if (i === cur) return; const prev = cur; state(i); o.onOpen(i, prev, how); },
    close(refocus){ pend = null; closeAt = 0; pinned = false; if (cur < 0) return; const j = cur; state(-1); o.onClose(j); if (refocus) T[j].focus(); },
    focusEl(el){ foc = { el, at:now() + .05 }; },
    tick(t){
      if (pend && t >= pend.at){ const i = pend.i; pend = null; ctl.open(i, 'hover'); }
      if (closeAt && t >= closeAt){ closeAt = 0; ctl.close(false); }
      if (foc && t >= foc.at){ const f = foc; foc = null; const el = f.el || (o.first ? o.first(f.i) : mgFoc(o.panel(f.i))[0]); el && el.focus(); }
      T.forEach((b, j) => { const p = clamp(tp[j].at(t)); b.style.background = p > .01 ? mix(p, 'var(--raised)', 'transparent') : ''; const c = b.hasAttribute('data-nr') ? null : $(b, 'svg'); if (c) c.style.transform = `rotate(${(p*180).toFixed(1)}deg)`;
        const h = $(b, '.mg-it'); if (h) h.style.transform = `scaleX(${pend && pend.i === j ? clamp((t - pend.t0)/(pend.at - pend.t0)).toFixed(3) : 0})`; });
    } };
  T.forEach((b, i) => {
    b.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse' || (o.skipHover && o.skipHover())) return;
      if (!has[i]){ pend = null; if (cur >= 0 && !pinned) ctl.close(false); return; }
      closeAt = 0; if (cur >= 0){ if (cur !== i) ctl.open(i, 'hover'); return; } if (o.hover && o.hover[i] === false) return; if (!pend || pend.i !== i) pend = { i, at:now() + MG.open, t0:now() }; });
    b.addEventListener('pointerleave', () => { if (pend && pend.i === i) pend = null; });
    if (!has[i]) return;
    b.addEventListener('click', e => { if (cur === i){ if (!pinned && e.detail > 0){ pinned = true; closeAt = 0; } else ctl.close(false); } else { ctl.open(i, 'click'); if (e.detail === 0) foc = { i, at:now() + .05 }; } });
    b.addEventListener('keydown', e => { if (e.key === 'ArrowDown'){ e.preventDefault(); ctl.open(i, 'key'); foc = { i, at:now() + .05 }; } });
  });
  T.forEach((b, i) => b.addEventListener('keydown', e => {
    const k = e.key; if (k !== 'ArrowRight' && k !== 'ArrowLeft' && k !== 'Home' && k !== 'End') return;
    e.preventDefault(); const j = k === 'Home' ? 0 : k === 'End' ? T.length - 1 : (i + (k === 'ArrowRight' ? 1 : -1) + T.length) % T.length;
    T[j].focus(); if (cur >= 0){ if (has[j]) ctl.open(j, 'key'); else ctl.close(false); } }));
  zones.forEach(z => { z.addEventListener('pointerenter', () => { closeAt = 0; }); z.addEventListener('pointerleave', () => { pend = null; if (cur >= 0 && !pinned) closeAt = now() + (o.grace || MG.close); }); });
  o.zones.forEach(z => z.addEventListener('pointerdown', () => { if (cur >= 0){ pinned = true; closeAt = 0; } }));
  o.w.addEventListener('keydown', e => { if (e.key === 'Escape' && cur >= 0){ e.preventDefault(); e.stopPropagation(); ctl.close(true); } });
  o.w.addEventListener('focusout', e => { if (cur >= 0 && e.relatedTarget && !zones.some(z => z.contains(e.relatedTarget))) ctl.close(false); });
  o.st.addEventListener('pointerdown', e => { if (cur >= 0 && !zones.some(z => z.contains(e.target))) ctl.close(false); });
  return ctl;
}
// mobile: burger opens one sheet; the three bars morph into a cross
function mgSheet(o){
  const p = new Track(0); let open = false, t0 = -9; const bars = $$(o.burger, 'i');
  const api = { get open(){ return open; }, p,
    set(v, refocus, inst){ if (v === open && !inst) return; open = v; o.burger.setAttribute('aria-expanded', v); o.burger.setAttribute('aria-label', v ? 'Close menu' : 'Open menu'); o.sheet.inert = !v;
      if (inst) p.jump(v ? 1 : 0); else openSet(p, v); if (v) t0 = now(); if (!v && refocus) o.burger.focus(); o.onSet && o.onSet(v); },
    render(t){ const q = clamp(p.at(t));
      if (o.pop) o.pop(q); else pop(o.sheet, q, -8);
      bars[0].style.transform = `translateY(${px(6*q)}) rotate(${(45*q).toFixed(1)}deg)`; bars[1].style.opacity = (1 - q).toFixed(3); bars[1].style.transform = `scaleX(${(1 - q).toFixed(3)})`; bars[2].style.transform = `translateY(${px(-6*q)}) rotate(${(-45*q).toFixed(1)}deg)`;
      o.sc.style.opacity = (.2*q).toFixed(3); o.sc.style.visibility = q < .01 ? 'hidden' : 'visible'; o.sc.style.pointerEvents = q > .5 ? 'auto' : 'none';
      if (open && o.items) mgStag(o.items(), t, t0 + .05, .03, 8); else if (o.items && q < .02) o.items().forEach(el => { el.style.opacity = ''; el.style.transform = ''; }); } };
  o.burger.addEventListener('click', () => api.set(!open, true));
  o.sheet.addEventListener('keydown', e => { if (e.key === 'Escape' && open){ e.preventDefault(); e.stopPropagation(); api.set(false, true); } });
  o.burger.addEventListener('keydown', e => { if (e.key === 'Escape' && open){ e.preventDefault(); e.stopPropagation(); api.set(false, true); } });
  o.sc.addEventListener('pointerdown', () => { if (open) api.set(false, false); });
  return api;
}
// links in a menu close it and move the page behind
const mgPick = (w, fn) => w.addEventListener('click', e => { const a = e.target.closest('a[href]'); if (!a || !w.contains(a)) return; e.preventDefault(); const nm = a.dataset.go; if (nm) fn(nm, a); });
const mgLk = ([t, d, i0]) => `<a class="mg-lk" href="#" data-go="${t}"><span class="mg-ic">${mi(i0, 17)}</span><span><b>${t}</b><small>${d}</small></span></a>`;
const mgRow = ([t, d, ic0]) => `<a class="mg-mr" href="#" data-go="${t}"><span class="mg-ic">${mi(ic0, 17)}</span><span><b>${t}</b><small>${d}</small></span></a>`;

const MGD = {
  product:[{ h:'Build', it:[['Editor','Write and lay out pages visually','pen'],['Blocks','Forty layout and content blocks','blocks'],['Themes','Tokens, type and spacing in one place','theme'],['Forms','Collect responses without a plugin','form']] },
    { h:'Grow', it:[['Members','Paid and free tiers with gated pages','users'],['Commerce','Sell products, bookings and downloads','bag'],['Newsletters','Send to segments from the editor','mail'],['Analytics','Private, cookie-free funnels and reports','chart']] },
    { h:'Operate', it:[['Workflows','Review, approve and schedule changes','flow'],['Roles','Per-section permissions for editors','shield'],['MCP access','Let agents edit, with your approval','plug'],['Audit log','Every change, who made it and when','list']] }],
  solutions:[{ h:'By team', it:[['Marketing','Launch campaigns without a ticket','send'],['Editorial','Draft, review and publish on a schedule','news'],['Agencies','Hand clients a site they can edit safely','brief'],['Education','Course pages, rosters and sign-ups','cap']] },
    { h:'By site', it:[['Online stores','Catalogs, checkout and tax in one flow','bag'],['Member sites','Gated content and recurring billing','lock'],['Nonprofits','Donations, events and volunteer forms','heart'],['Event sites','Schedules, tickets and speaker pages','cal']] }],
  dev:[{ h:'Build', it:[['API reference','REST and webhooks, with examples','braces'],['Custom blocks','Register your own components','code'],['CLI','Pull, diff and push content from a terminal','term'],['MCP server','Connect an agent to your workspace','plug']] },
    { h:'Operate', it:[['Webhooks','Subscribe to publish and order events','zap'],['Status','Live uptime and incident history','pulse'],['Changelog','What shipped this month','list'],['Guides','Migration and performance walkthroughs','book']] }],
  company:[{ h:'Studio', it:[['About us','Who builds Studio and why','info'],['Customers','Teams that publish with us','star'],['Press kit','Logos, screenshots and facts','image'],['Contact','Sales, support and security reports','chat']] },
    { h:'Work with us', it:[['Careers','Two open roles on the platform team','brief'],['Partners','Agencies and technology partners','users'],['Security','Practices, audits and disclosure','shield'],['Brand','Guidelines for using our name','pen']] }]
};

/* ================================================================ 1. Link groups with descriptions */
atom({ id:'mega-columns', cat:'Mega menus', name:'Link groups with descriptions', block:'Mega menu, site-header, nav-menu', fam:['X','S','M','E'], wide:true, tall:true,
  html:`${MGCSS}<style>
.mg1-pn{position:absolute;z-index:30;top:76px;left:12px;right:12px;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:hidden;visibility:hidden;transform-origin:50% 0}
.mg1-pw{position:relative}
.mg1-pa{position:absolute;left:0;right:0;top:0}
.mg1-gr{position:relative;display:grid;gap:4px 18px;padding:16px 14px 10px}
.mg1-h{margin:0 0 4px;padding:0 10px;font-size:12px;font-weight:500;color:var(--muted)}
.mg1-lk{position:relative;z-index:1;display:flex;gap:11px;align-items:flex-start;padding:9px 10px;border-radius:10px}
.mg1-lk b{display:block;font-size:14px;font-weight:500;letter-spacing:-.005em}
.mg1-lk small{display:block;margin-top:1px;font-size:12.5px;line-height:1.35;color:var(--muted)}
.mg1-ft{position:relative;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 24px;background:var(--raised);font-size:13px;color:var(--muted)}
.mg1-ft b{color:var(--ink);font-weight:500}
.mg1-ft a{display:inline-flex;align-items:center;gap:6px;font-weight:500;color:var(--ink);white-space:nowrap;border-radius:6px}
.mg1-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--success);margin-right:8px}
.mg-w[data-n] .mg1-pn{display:none}
</style><div class="mg-w">${mgPageHTML}<div class="mg-sc"></div>
<nav class="mg-bar" aria-label="Main"><span class="mg-lgw">${mgLogo}</span><div class="mg-dt mg1-tr" style="display:flex;gap:2px"></div><span class="mg-sp"></span><a class="btn mg-cta mg-dt mg-lo" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta mg-dt" href="#" data-go="Start free">Start free</a>${mgBurger.replace('mg-bg','mg-bg mg-mb')}</nav>
<div class="mg1-pn card" id="mega-columns-pn"><div class="mg1-pw"></div></div>
<div class="mg-sh" id="mega-columns-sh" role="region" aria-label="Menu"></div>
<div class="hint"><span class="mg-dt">Hover a menu item. Arrow keys, Enter and Escape work too.</span><span class="mg-mb">Tap the menu button. Escape closes it.</span></div></div>`,
  desc:'Hovering a top item waits 120 ms before the panel opens, with a hairline filling the wait. The panel grows from the bar, then its links rise one after another. Moving to another item keeps the panel open: its height morphs at once, the old links leave in 100 ms, then the new ones enter. At phone width the same groups become accordions in one sheet.',
  api:'ctl.hover(i) → wait 120ms → panel.o.set(1) → links.stagger(+25ms)   ctl.hover(j) → H.set(h) → swap(j)',
  init(st){
    const w = $(st, '.mg-w'), bar = $(w, '.mg-bar'), pn = $(w, '.mg1-pn'), pw = $(w, '.mg1-pw'), sc = $(w, '.mg-sc'), sh = $(w, '.mg-sh'), burger = $(w, '.mg-bg'), tr = $(w, '.mg1-tr');
    const defs = [['Product', 'product'], ['Solutions', 'solutions'], ['Developers', 'dev'], ['Pricing', null], ['Company', 'company']];
    const FT = { product:['New in 3.2', 'Scheduled blocks go live on their own.', 'Read the changelog'], solutions:['Not sure where to start?', 'Tell us what you publish.', 'Talk to our team'],
      dev:['', 'All systems operational · 99.98% over 90 days', 'View status'], company:['We are hiring', 'Two open roles on the platform team.', 'See open roles'] };
    const trig = [], has = [], pk = [], panes = [], plates = [];
    defs.forEach(([n, key]) => {
      if (!key){ const a = mx('a', 'mg-t', n + '<i class="mg-it"></i>'); a.href = '#'; a.dataset.go = n; tr.appendChild(a); trig.push(a); has.push(false); pk.push(-1); return; }
      const b = mx('button', 'mg-t', n + ic(MGI.chev, 13) + '<i class="mg-it"></i>'); b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'mega-columns-pn'); tr.appendChild(b); trig.push(b); has.push(true); pk.push(panes.length);
      const g = MGD[key], f = FT[key];
      const pa = mx('div', 'mg1-pa', `<div class="mg1-gr" style="grid-template-columns:repeat(${g.length},minmax(0,1fr))">${g.map(c => `<div><p class="mg1-h">${c.h}</p><ul>${c.it.map(([t, d, i2]) => `<li><a class="mg1-lk" href="#" data-go="${t}"><span class="mg-ic">${mi(i2, 17)}</span><span><b>${t}</b><small>${d}</small></span></a></li>`).join('')}</ul></div>`).join('')}</div>
        <div class="mg1-ft"><span>${key === 'dev' ? '<span class="mg1-dot" aria-hidden="true"></span>' : ''}${f[0] ? `<b>${f[0]}</b> · ` : ''}${f[1]}</span><a href="#" data-go="${f[2]}">${f[2]}${ic(MGI.arr, 14)}</a></div>`);
      pw.appendChild(pa); panes.push(pa); plates.push(mgPlate($(pa, '.mg1-gr'), $$(pa, '.mg1-lk')));
    });
    // mobile: the same groups as accordions in one sheet
    sh.innerHTML = `<div class="mg-ex" data-ex>${defs.map(([n, key]) => key ? mgAc(n, MGD[key].map(g => `<p class="mg-gh">${g.h}</p>${g.it.map(mgRow).join('')}`).join('')) : `<a class="mg-lkm" href="#" data-go="${n}">${n}</a>`).join('')}</div><div class="mg-cb"><a class="btn mg-cta" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta" href="#" data-go="Start free">Start free</a></div>`;
    const acc = mgAcc(sh), page = mgPage(w);
    const o = new Track(0), Ht = new Track(0), sw = new Swap(0); let dir = 1, tEnter = 0, narrow = false;
    const ctl = mgCtl({ st, w, bar, trig, has, zones:[pn], panel:i => panes[pk[i]],
      onOpen:(i, prev) => { const k = pk[i], h = panes[k].offsetHeight;
        if (prev < 0){ mgReset(sw, k); Ht.jump(h); tEnter = now() + .05; } else { dir = i > prev ? 1 : -1; sw.to(k); Ht.set(h); tEnter = now() + EXIT + .04; } o.set(1); plates.forEach(p => p.hide()); },
      onClose:() => { o.set(0, S.snap); } });
    const sheet = mgSheet({ burger, sheet:sh, sc, items:() => [...$(sh, '.mg-ex').children, $(sh, '.mg-cb')] });
    mgPick(w, nm => { page.go(nm); if (narrow) sheet.set(false, true); else ctl.close(true); });
    mgArrows(pn, () => trig[ctl.cur] && trig[ctl.cur].focus());
    mgFit(st, w, (n, ch) => { narrow = n; if (ch){ ctl.close(false); o.jump(0); sheet.set(false, false, true); acc.closeAll(); } if (ctl.cur >= 0) Ht.jump(panes[pk[ctl.cur]].offsetHeight); });
    document.fonts.ready.then(() => { if (ctl.cur >= 0) Ht.jump(panes[pk[ctl.cur]].offsetHeight); });
    return t => {
      page.render(t);
      if (narrow){ sheet.render(t); acc.render(t); return; }
      ctl.tick(t); const q = clamp(o.at(t));
      pop(pn, q); sc.style.opacity = (.2*q).toFixed(3); sc.style.visibility = q < .01 ? 'hidden' : 'visible';
      pw.style.height = px(Math.max(0, Ht.at(t)));
      mgSwapPanes(sw, panes, t, dir, 14);
      panes.forEach((p, k) => { p.inert = k !== sw.cur; if (k === sw.cur) mgStag($$(p, '.mg1-lk, .mg1-ft'), t, tEnter, .022, 6); });
      plates.forEach(p => p.render(t));
    };
  }});

/* ================================================================ 2. Featured card with links */
atom({ id:'mega-featured', cat:'Mega menus', name:'Featured card with links', block:'Mega menu, site-header, promo card', fam:['X','S','E'], wide:true, tall:true,
  html:`${MGCSS}<style>
.mg2-pn{position:absolute;z-index:30;top:76px;left:12px;right:12px;margin:0 auto;max-width:840px;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:hidden;visibility:hidden;transform-origin:50% 0}
.mg2-pw{position:relative}
.mg2-pa{position:absolute;left:0;right:0;top:0;display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:8px;padding:10px}
.mg2-fc{display:flex;flex-direction:column;gap:6px;padding:14px;border-radius:10px;background:var(--accent-tint)}
.mg2-ey{font-size:12px;font-weight:500;color:var(--accent)}
.mg2-fc h4{margin:0;font-size:17px;line-height:1.25;font-weight:600;letter-spacing:-.02em}
.mg2-fc p{margin:0;font-size:13px;line-height:1.45;color:var(--muted)}
.mg2-art{display:flex;flex-direction:column;gap:7px;height:84px;margin-bottom:4px;padding:12px;border-radius:8px;background:var(--card)}
.mg2-art i{display:block;height:8px;border-radius:4px;background:var(--raised)}
.mg2-art i.a{background:var(--accent)}
.mg2-go{margin-top:auto;display:inline-flex;align-items:center;gap:6px;align-self:flex-start;padding:4px 0;font-size:13.5px;font-weight:500;border-radius:6px}
.mg2-ls{position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 6px;align-content:start}
.mg-w[data-n] .mg2-pn{display:none}
.mg2-fm{display:flex;gap:12px;align-items:center;margin:12px 8px 4px;padding:12px;border-radius:10px;background:var(--accent-tint)}
.mg2-fm .mg2-art{flex:none;width:72px;height:72px;margin:0;padding:10px;gap:6px}
.mg2-fm h4{margin:0;font-size:14px;font-weight:600}
.mg2-fm p{margin:2px 0 0;font-size:12.5px;line-height:1.4;color:var(--muted)}
</style><div class="mg-w">${mgPageHTML}<div class="mg-sc"></div>
<nav class="mg-bar" aria-label="Main (featured card)"><span class="mg-lgw">${mgLogo}</span><div class="mg-dt mg2-tr" style="display:flex;gap:2px"></div><span class="mg-sp"></span><a class="btn mg-cta mg-dt mg-lo" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta mg-dt" href="#" data-go="Start free">Start free</a>${mgBurger.replace('mg-bg', 'mg-bg mg-mb')}</nav>
<div class="mg2-pn card" id="mega-featured-pn"><div class="mg2-pw"></div></div>
<div class="mg-sh" id="mega-featured-sh" role="region" aria-label="Menu"></div>
<div class="hint"><span class="mg-dt">The promo card arrives first, then the links. Try arrow keys and Escape.</span><span class="mg-mb">Tap the menu button. Escape closes it.</span></div></div>`,
  desc:'Hover waits 120 ms, then the panel grows from the bar. The promo card rises first, the links follow in a 30 ms stagger. Switching top items keeps the panel: its height morphs, the old content leaves in 100 ms, the new promo and links enter in the same order. At phone width the links become accordions and the promo moves to the bottom of the sheet.',
  api:'panel.o.set(1) → promo.rise(t0) → links.rise(t0 + 60ms + i·30ms)   swap(j): H.set(h), exit 100ms, enter',
  init(st){
    const w = $(st, '.mg-w'), bar = $(w, '.mg-bar'), pn = $(w, '.mg2-pn'), pw = $(w, '.mg2-pw'), sc = $(w, '.mg-sc'), sh = $(w, '.mg-sh'), burger = $(w, '.mg-bg'), tr = $(w, '.mg2-tr');
    const P = MGD.product.flatMap(g => g.it), pick = (...n) => n.map(x => P.find(r => r[0] === x)), S2 = MGD.solutions.flatMap(g => g.it), D = MGD.dev.flatMap(g => g.it);
    const defs = [
      { n:'Platform', ey:'New release', h:'Block library 3.0', p:'Forty new blocks, scheduled publishing and per-block approvals. Ship a page in an afternoon.', go:'See what is new', art:[['a', 44], ['', 86], ['', 62]],
        ls:pick('Editor', 'Blocks', 'Members', 'Commerce', 'Newsletters', 'Analytics') },
      { n:'Solutions', ey:'Customer story', h:'Northlight Yoga, four studios, one site', p:'Booking no-shows fell 31% after the studios moved their schedule onto Studio.', go:'Read the story', art:[['', 70], ['a', 38], ['', 82]],
        ls:[S2[0], S2[1], S2[2], S2[4], S2[5], S2[3]] },
      { n:'Learn', ey:'Webinar, Oct 16', h:'Approval flows for a ten-person newsroom', p:'A live walkthrough of roles, review queues and scheduled publishing.', go:'Save your seat', art:[['', 58], ['', 90], ['a', 34]],
        ls:[D[7], D[6], D[0], D[2], D[4], D[5]] },
      { n:'Pricing', link:true }];
    const trig = [], has = [], pk = [], panes = [], plates = [];
    defs.forEach(d => {
      if (d.link){ const a = mx('a', 'mg-t', d.n + '<i class="mg-it"></i>'); a.href = '#'; a.dataset.go = d.n; tr.appendChild(a); trig.push(a); has.push(false); pk.push(-1); return; }
      const b = mx('button', 'mg-t', d.n + ic(MGI.chev, 13) + '<i class="mg-it"></i>'); b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'mega-featured-pn'); tr.appendChild(b); trig.push(b); has.push(true); pk.push(panes.length);
      const pa = mx('div', 'mg2-pa', `<div class="mg2-fc"><div class="mg2-art" aria-hidden="true">${d.art.map(([c, wd]) => `<i class="${c}" style="width:${wd}%"></i>`).join('')}</div><span class="mg2-ey">${d.ey}</span><h4>${d.h}</h4><p>${d.p}</p><a class="mg2-go" href="#" data-go="${d.go}">${d.go}${ic(MGI.arr, 14)}</a></div><div class="mg2-ls">${d.ls.map(mgLk).join('')}</div>`);
      pw.appendChild(pa); panes.push(pa); plates.push(mgPlate($(pa, '.mg2-ls'), $$(pa, '.mg-lk')));
    });
    const f0 = defs[0];
    sh.innerHTML = `<div class="mg-ex" data-ex>${defs.map(d => d.link ? `<a class="mg-lkm" href="#" data-go="${d.n}">${d.n}</a>` : mgAc(d.n, d.ls.map(mgRow).join(''))).join('')}</div>
      <div class="mg2-fm"><div class="mg2-art" aria-hidden="true">${f0.art.map(([c, wd]) => `<i class="${c}" style="width:${wd}%"></i>`).join('')}</div><div><span class="mg2-ey">${f0.ey}</span><h4>${f0.h}</h4><p><a href="#" data-go="${f0.go}" style="font-weight:500;color:var(--ink)">${f0.go}</a></p></div></div>
      <div class="mg-cb"><a class="btn mg-cta" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta" href="#" data-go="Start free">Start free</a></div>`;
    const acc = mgAcc(sh), page = mgPage(w);
    const o = new Track(0), Ht = new Track(0), sw = new Swap(0); let dir = 1, tEnter = 0, narrow = false;
    const ctl = mgCtl({ st, w, bar, trig, has, zones:[pn], panel:i => panes[pk[i]],
      onOpen:(i, prev) => { const k = pk[i], h = panes[k].offsetHeight;
        if (prev < 0){ mgReset(sw, k); Ht.jump(h); tEnter = now() + .05; } else { dir = i > prev ? 1 : -1; sw.to(k); Ht.set(h); tEnter = now() + EXIT + .04; } o.set(1); plates.forEach(p => p.hide()); },
      onClose:() => { o.set(0, S.snap); } });
    const sheet = mgSheet({ burger, sheet:sh, sc, items:() => [...$(sh, '.mg-ex').children, $(sh, '.mg2-fm'), $(sh, '.mg-cb')] });
    mgPick(w, nm => { page.go(nm); if (narrow) sheet.set(false, true); else ctl.close(true); });
    mgArrows(pn, () => trig[ctl.cur] && trig[ctl.cur].focus());
    const remeasure = () => { if (ctl.cur >= 0) Ht.jump(panes[pk[ctl.cur]].offsetHeight); };
    mgFit(st, w, (n, ch) => { narrow = n; if (ch){ ctl.close(false); o.jump(0); sheet.set(false, false, true); acc.closeAll(); } remeasure(); });
    document.fonts.ready.then(remeasure);
    return t => {
      page.render(t);
      if (narrow){ sheet.render(t); acc.render(t); return; }
      ctl.tick(t); const q = clamp(o.at(t));
      pop(pn, q); sc.style.opacity = (.2*q).toFixed(3); sc.style.visibility = q < .01 ? 'hidden' : 'visible';
      pw.style.height = px(Math.max(0, Ht.at(t)));
      mgSwapPanes(sw, panes, t, dir, 14);
      panes.forEach((p, k) => { p.inert = k !== sw.cur; if (k === sw.cur){ mgStag([$(p, '.mg2-fc')], t, tEnter, .03, 8); mgStag($$(p, '.mg-lk'), t, tEnter + .06, .03, 6); } });
      plates.forEach(p => p.render(t));
    };
  }});

/* ================================================================ 3. Vertical tabs */
atom({ id:'mega-tabs', cat:'Mega menus', name:'Vertical tabs, hover to swap', block:'Mega menu, site-header, Tabs', fam:['E','S','X'], wide:true, tall:true,
  html:`${MGCSS}<style>
.mg3-pn{position:absolute;z-index:30;top:76px;left:12px;right:12px;margin:0 auto;max-width:900px;height:306px;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:hidden;visibility:hidden;transform-origin:50% 0}
.mg3-m{position:absolute;inset:0;display:grid;grid-template-columns:232px minmax(0,1fr)}
.mg-w[data-m] .mg3-m{grid-template-columns:196px minmax(0,1fr)}
.mg3-rl{position:relative;padding:12px 8px;background:var(--bg);border-right:1px solid var(--line-soft)}
.mg3-pl{position:absolute;left:8px;right:8px;top:0;height:0;border-radius:10px;background:var(--card);box-shadow:var(--shadow);pointer-events:none}
.mg3-tb{position:relative;z-index:1;display:flex;align-items:center;gap:10px;width:100%;height:44px;margin:0 0 2px;padding:0 10px;border:0;border-radius:10px;background:none;font:500 14px var(--sans);color:var(--muted);text-align:left;cursor:pointer}
.mg3-tb[aria-selected="true"]{color:var(--ink)}
.mg3-tb span:nth-child(2){flex:1}
.mg3-tb>svg:last-child{color:var(--muted);opacity:0}
.mg3-tb[aria-selected="true"]>svg:last-child{opacity:1}
.mg3-dw{position:relative}
.mg3-dt{position:absolute;inset:0;padding:20px 22px;overflow:hidden}
.mg3-dt h4{margin:0;font-size:17px;font-weight:600;letter-spacing:-.02em}
.mg3-dt p{margin:3px 0 10px;max-width:46ch;font-size:13px;color:var(--muted)}
.mg3-ls{position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 8px}
.mg3-l{position:relative;z-index:1;display:block;padding:9px 10px;border-radius:10px}
.mg3-l b{display:block;font-size:14px;font-weight:500}
.mg3-l small{display:block;font-size:12.5px;line-height:1.35;color:var(--muted)}
.mg3-bt{position:absolute;left:22px;right:22px;bottom:16px;display:flex;align-items:center;gap:14px}
.mg3-ft{flex:1;min-width:0;padding:10px 12px;border-radius:10px;background:var(--raised);font-size:13px;color:var(--muted)}
.mg3-ft b{color:var(--ink);font-weight:500}
.mg3-all{display:inline-flex;align-items:center;gap:6px;flex:none;font-size:13.5px;font-weight:500;border-radius:6px;white-space:nowrap}
.mg-w[data-n] .mg3-pn{display:none}
</style><div class="mg-w">${mgPageHTML}<div class="mg-sc"></div>
<nav class="mg-bar" aria-label="Main (vertical tabs)"><span class="mg-lgw">${mgLogo}</span><div class="mg-dt mg3-tr" style="display:flex;gap:2px"></div><span class="mg-sp"></span><a class="btn mg-cta mg-dt mg-lo" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta mg-dt" href="#" data-go="Start free">Start free</a>${mgBurger.replace('mg-bg', 'mg-bg mg-mb')}</nav>
<div class="mg3-pn card" id="mega-tabs-pn"></div>
<div class="mg-sh" id="mega-tabs-sh" role="region" aria-label="Menu"></div>
<div class="hint"><span class="mg-dt">Hover or arrow through the list on the left. Right arrow enters the panel.</span><span class="mg-mb">Tap the menu button. Escape closes it.</span></div></div>`,
  desc:'Hovering a row on the left waits 70 ms so a quick pass across the list changes nothing. The selection plate then moves with lagging edges, leading edge first, and the right pane swaps: old content out in 100 ms, new content in from the direction of travel. Arrow keys follow the same path. At phone width each category becomes a nested accordion.',
  api:'rail.hover(k) → wait 70ms → plate.go(top, bottom) → detail.to(k, dir)   ArrowRight → focus first link',
  init(st){
    const w = $(st, '.mg-w'), bar = $(w, '.mg-bar'), pn = $(w, '.mg3-pn'), sc = $(w, '.mg-sc'), sh = $(w, '.mg-sh'), burger = $(w, '.mg-bg'), tr = $(w, '.mg3-tr');
    const L = (...a) => a.map(x => Array.isArray(x) ? x : [x, '']);
    const defs = [
      { n:'Products', tabs:[
        ['Websites', 'pen', 'Design and publish pages without a developer in the loop.', [['Editor', 'Write and lay out pages visually'], ['Blocks', 'Forty layout and content blocks'], ['Themes', 'Tokens, type and spacing in one place'], ['Page speed', 'Images and fonts tuned for you']], ['New in 3.2','Scheduled blocks go live on their own.']],
        ['Commerce', 'bag', 'Sell products, bookings and downloads from any page.', [['Catalog', 'Variants, stock and collections'], ['Checkout', 'One page, saved cards, local tax'], ['Subscriptions', 'Recurring plans and dunning'], ['Shipping and tax', 'Rates by region, set once']], ['Updated','Local tax rates for 42 countries.']],
        ['Members', 'users', 'Paid and free tiers with gated pages and a billing portal.', [['Tiers', 'Free, paid and invite-only'], ['Gated pages', 'Lock a page, a block or a post'], ['Billing portal', 'Members manage their own plan'], ['Directory', 'Opt-in profiles for your community']], ['Popular','Annual plans with a built-in discount.']],
        ['Newsletters', 'mail', 'Write once, publish to the site and the inbox.', [['Composer', 'The same editor you use for pages'], ['Segments', 'Send to tiers, tags or behavior'], ['Deliverability', 'Authentication and warm-up checks'], ['Archive', 'Every issue as a public page']], ['New in 3.2','Send-time optimization is on by default.']],
        ['Forms', 'form', 'Collect responses and route them to the right person.', [['Form builder', 'Fields, steps and validation'], ['Conditional logic', 'Show fields based on answers'], ['File uploads', 'Scanned and stored privately'], ['Submissions inbox', 'Triage, assign and export']], ['New in 3.2','Spam filtering with no CAPTCHA.']],
        ['Developers', 'code', 'An API and an agent interface for everything in the editor.', [['API reference', 'REST and webhooks, with examples'], ['CLI', 'Pull, diff and push content'], ['Custom blocks', 'Register your own components'], ['MCP server', 'Let agents edit, with approval']], ['New in 3.2','The MCP server now supports approvals.']]] },
      { n:'Resources', tabs:[
        ['Learn', 'book', 'Guides written by the people who build the product.', [['Docs', 'Concepts, tasks and reference'], ['Guides', 'Migration and performance walkthroughs'], ['Video library', 'Twelve short product tours'], ['Webinars', 'Live sessions, recordings after']], ['New guide','Move a Squarespace site in one day.']],
        ['Community', 'users', 'Ask questions, share sites, meet other publishers.', [['Forum', 'Answers from staff and members'], ['Events', 'Meetups in nine cities'], ['Showcase', 'Sites built on Studio'], ['Partners', 'Agencies who know the platform']], ['Next meetup','Portland, October 24.']],
        ['Support', 'chat', 'Real people, with a median first reply under two hours.', [['Help center', 'Searchable articles'], ['Contact support', 'Email or chat, weekdays'], ['Status', 'Uptime and incident history'], ['Security', 'Practices and disclosure']], ['This week','Median first reply: 1 hour 40 minutes.']],
        ['Changelog', 'list', 'What shipped, and what is next.', [['This month', 'Release notes for 3.2'], ['Roadmap', 'What we are building next'], ['Deprecations', 'Dates and migration paths'], ['API versions', 'Compatibility by release']], ['Latest','Release 3.2 shipped on October 1.']]] },
      { n:'Pricing', link:true }, { n:'Customers', link:true }];
    const trig = [], has = [], pk = [], menus = [];
    const hov = [];
    defs.forEach((d, idx) => {
      if (d.link){ const a = mx('a', 'mg-t', d.n + '<i class="mg-it"></i>'); a.href = '#'; a.dataset.go = d.n; tr.appendChild(a); trig.push(a); has.push(false); pk.push(-1); return; }
      const b = mx('button', 'mg-t', d.n + ic(MGI.chev, 13) + '<i class="mg-it"></i>'); b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'mega-tabs-pn'); tr.appendChild(b); trig.push(b); has.push(true); pk.push(menus.length);
      const m = mx('div', 'mg3-m'), rail = mx('div', 'mg3-rl'), dw = mx('div', 'mg3-dw'), pl = mx('i', 'mg3-pl');
      rail.setAttribute('role', 'tablist'); rail.setAttribute('aria-orientation', 'vertical'); rail.setAttribute('aria-label', d.n); rail.appendChild(pl);
      const tabs = d.tabs.map((tb, k) => { const bt = mx('button', 'mg3-tb', `<span class="mg-ic" style="background:var(--raised);color:var(--muted)">${mi(tb[1], 16)}</span><span>${tb[0]}</span>${ic(MGI.chR, 14)}`); bt.type = 'button'; bt.setAttribute('role', 'tab');
        bt.id = `mega-tabs-${idx}-t${k}`; bt.setAttribute('aria-controls', `mega-tabs-${idx}-d${k}`); bt.setAttribute('aria-selected', 'false'); bt.tabIndex = -1; rail.appendChild(bt); return bt; });
      const dts = d.tabs.map((tb, k) => { const dt = mx('div', 'mg3-dt', `<h4>${tb[0]}</h4><p>${tb[2]}</p><div class="mg3-ls">${tb[3].map(([t, ds]) => `<a class="mg3-l" href="#" data-go="${t}"><b>${t}</b><small>${ds}</small></a>`).join('')}</div><div class="mg3-bt"><div class="mg3-ft"><b>${tb[4][0]}</b> · ${tb[4][1]}</div><a class="mg3-all" href="#" data-go="All ${tb[0].toLowerCase()}">Explore${ic(MGI.arr, 14)}</a></div>`);
        dt.id = `mega-tabs-${idx}-d${k}`; dt.setAttribute('role', 'tabpanel'); dt.setAttribute('aria-labelledby', `mega-tabs-${idx}-t${k}`); dw.appendChild(dt); return dt; });
      m.append(rail, dw); pn.appendChild(m);
      const M = { el:m, tabs, dts, cur:0, ey:edges(0, 0), sw:new Swap(0), dir:1, t0:0, want:null, plates:dts.map(dt => mgPlate($(dt, '.mg3-ls'), $$(dt, '.mg3-l'))) };
      M.sel = (k, how) => { const inst = how === 'inst'; if (!inst && k === M.cur) return; const b = tabs[k];
        if (inst){ M.ey.jump(b.offsetTop, b.offsetTop + b.offsetHeight); mgReset(M.sw, k); } else { M.dir = k > M.cur ? 1 : -1; M.ey.go(b.offsetTop, b.offsetTop + b.offsetHeight); M.sw.to(k); }
        M.cur = k; M.plates.forEach(p => p.hide()); tabs.forEach((x, j) => { x.setAttribute('aria-selected', j === k); x.tabIndex = j === k ? 0 : -1; }); };
      tabs.forEach((b, k) => {
        b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && k !== M.cur) M.want = { k, at:now() + .07 }; else M.want = null; });
        b.addEventListener('pointerleave', () => { M.want = null; });
        b.addEventListener('click', () => { M.want = null; M.sel(k); });
        b.addEventListener('keydown', e => { const n = tabs.length; let j = -1;
          if (e.key === 'ArrowDown') j = Math.min(n - 1, k + 1); else if (e.key === 'ArrowUp') j = Math.max(0, k - 1); else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
          if (j >= 0){ e.preventDefault(); M.want = null; M.sel(j); tabs[j].focus(); }
          else if (e.key === 'ArrowRight'){ e.preventDefault(); const f = mgFoc(dts[M.cur])[0]; f && f.focus(); } });
      });
      dts.forEach((dt, k) => { dt.addEventListener('keydown', e => { if (e.key === 'ArrowLeft'){ e.preventDefault(); tabs[M.cur].focus(); } }); mgArrows(dt, () => tabs[M.cur].focus()); });
      menus.push(M);
    });
    sh.innerHTML = `<div class="mg-ex" data-ex>${defs.map(d => d.link ? `<a class="mg-lkm" href="#" data-go="${d.n}">${d.n}</a>` : mgAc(d.n, `<div class="mg-nx" data-ex>${d.tabs.map(tb => mgAc(tb[0], tb[3].map(([t, ds]) => `<a class="mg-mr" href="#" data-go="${t}"><span><b>${t}</b><small>${ds}</small></span></a>`).join(''))).join('')}</div>`)).join('')}</div><div class="mg-cb"><a class="btn mg-cta" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta" href="#" data-go="Start free">Start free</a></div>`;
    const acc = mgAcc(sh), page = mgPage(w);
    const o = new Track(0), sw0 = new Swap(0); let dir0 = 1, narrow = false;
    const ctl = mgCtl({ st, w, bar, trig, has, zones:[pn], first:i => { const M = menus[pk[i]]; return M.tabs[M.cur]; },
      onOpen:(i, prev) => { const k = pk[i], M = menus[k];
        if (prev < 0){ mgReset(sw0, k); M.t0 = now() + .05; } else { dir0 = i > prev ? 1 : -1; sw0.to(k); M.t0 = now() + EXIT + .04; }
        M.sel(M.cur, 'inst'); o.set(1); },
      onClose:() => { o.set(0, S.snap); } });
    const sheet = mgSheet({ burger, sheet:sh, sc, items:() => [...$(sh, '.mg-ex').children, $(sh, '.mg-cb')] });
    mgPick(w, nm => { page.go(nm); if (narrow) sheet.set(false, true); else ctl.close(true); });
    const relayout = () => menus.forEach(M => { const b = M.tabs[M.cur]; M.ey.jump(b.offsetTop, b.offsetTop + b.offsetHeight); });
    mgFit(st, w, (n, ch) => { narrow = n; if (ch){ ctl.close(false); o.jump(0); sheet.set(false, false, true); acc.closeAll(); } relayout(); });
    document.fonts.ready.then(relayout);
    menus.forEach(M => M.sel(0, 'inst'));
    return t => {
      page.render(t);
      if (narrow){ sheet.render(t); acc.render(t); return; }
      ctl.tick(t); const q = clamp(o.at(t));
      pop(pn, q); sc.style.opacity = (.2*q).toFixed(3); sc.style.visibility = q < .01 ? 'hidden' : 'visible';
      mgSwapPanes(sw0, menus.map(M => M.el), t, dir0, 14);
      menus.forEach((M, k) => {
        M.el.inert = k !== sw0.cur;
        if (M.want && t >= M.want.at){ const j = M.want.k; M.want = null; M.sel(j); }
        const a = M.ey.A.at(t), b = M.ey.B.at(t), pl = $(M.el, '.mg3-pl'); pl.style.transform = `translateY(${px(a)})`; pl.style.height = px(Math.max(0, b - a));
        M.dts.forEach((dt, j) => { M.sw.apply(dt, j, t, 10*M.dir); dt.style.pointerEvents = j === M.cur ? 'auto' : 'none'; dt.inert = j !== M.cur; });
        M.plates.forEach(p => p.render(t));
        if (k === sw0.cur) mgStag(M.tabs, t, M.t0, .025, 6);
      });
    };
  }});

/* ================================================================ 4. Icon grid */
atom({ id:'mega-icons', cat:'Mega menus', name:'Icon grid of products', block:'Mega menu, site-header, product grid', fam:['X','S','M','E'], wide:true, tall:true,
  html:`${MGCSS}<style>
.mg4-pn{position:absolute;z-index:30;top:76px;left:12px;right:12px;margin:0 auto;max-width:860px;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:hidden;visibility:hidden;transform-origin:50% 0}
.mg4-pw{position:relative}
.mg4-pa{position:absolute;left:0;right:0;top:0}
.mg4-gr{position:relative;display:grid;gap:4px;padding:12px}
.mg4-t{position:relative;z-index:1;display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:12px;border-radius:12px}
.mg4-i{width:40px;height:40px;margin-bottom:8px;border-radius:11px;background:var(--accent-tint);color:var(--accent);display:grid;place-items:center;font-size:16px;font-weight:600}
.mg4-t b{font-size:14px;font-weight:500}
.mg4-t small{font-size:12.5px;line-height:1.35;color:var(--muted)}
.mg4-b{position:absolute;right:10px;top:10px;padding:1px 7px;border-radius:99px;background:var(--accent-tint);color:var(--accent);font-size:11.5px;font-weight:500;font-style:normal}
.mg4-s .mg4-t{padding:10px}
.mg4-s .mg4-i{width:34px;height:34px;margin-bottom:6px;border-radius:9px}
.mg4-ft{display:flex;gap:18px;align-items:center;padding:12px 24px;background:var(--raised);font-size:13px}
.mg4-ft a{display:inline-flex;align-items:center;gap:6px;font-weight:500;border-radius:6px}
.mg4-ft span{color:var(--muted);margin-right:auto}
.mg-w[data-n] .mg4-pn{display:none}
.mg4-mg{display:grid;gap:4px}
.mg4-mg a{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:10px;border-radius:10px;font-size:13.5px;font-weight:500}
.mg4-mg a:active{background:var(--raised)}
.mg4-mg .mg4-i{margin:0;width:34px;height:34px;border-radius:9px}
</style><div class="mg-w">${mgPageHTML}<div class="mg-sc"></div>
<nav class="mg-bar" aria-label="Main (icon grid)"><span class="mg-lgw">${mgLogo}</span><div class="mg-dt mg4-tr" style="display:flex;gap:2px"></div><span class="mg-sp"></span><a class="btn mg-cta mg-dt mg-lo" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta mg-dt" href="#" data-go="Start free">Start free</a>${mgBurger.replace('mg-bg', 'mg-bg mg-mb')}</nav>
<div class="mg4-pn card" id="mega-icons-pn"><div class="mg4-pw"></div></div>
<div class="mg-sh" id="mega-icons-sh" role="region" aria-label="Menu"></div>
<div class="hint"><span class="mg-dt">One plate follows the pointer across the grid. Arrow keys move in two directions.</span><span class="mg-mb">Tap the menu button. Escape closes it.</span></div></div>`,
  desc:'Tiles arrive on a diagonal: top-left first, each neighbor 30 ms later. One plate glides between tiles with lagging edges, and the hovered icon fills with the accent on the same spring. Switching from Products to Integrations morphs the panel height and swaps the grid. At phone width the grids sit inside accordions as compact tiles.',
  api:'tile[r,c].rise(t0 + 30ms·(r + c))   plate.go(rect)   icon.fill.set(hover)   H.set(h)',
  init(st){
    const w = $(st, '.mg-w'), bar = $(w, '.mg-bar'), pn = $(w, '.mg4-pn'), pw = $(w, '.mg4-pw'), sc = $(w, '.mg-sc'), sh = $(w, '.mg-sh'), burger = $(w, '.mg-bg'), tr = $(w, '.mg4-tr');
    const PR = [['Editor', 'Pages and layouts', 'pen'], ['Commerce', 'Catalog and checkout', 'bag'], ['Members', 'Tiers and gated pages', 'users'], ['Newsletters', 'Write once, send anywhere', 'mail'], ['Forms', 'Responses to the right inbox', 'form'], ['Analytics', 'Private, cookie-free reports', 'chart'], ['Workflows', 'Review and scheduling', 'flow', 'New'], ['Agents', 'Connect through MCP', 'plug', 'Beta']];
    const IN = [['Stripe', 'Payments'], ['Slack', 'Messaging'], ['Zapier', 'Automation'], ['Mailchimp', 'Email'], ['Plausible', 'Analytics'], ['Notion', 'Docs'], ['Source control', 'Code'], ['HubSpot', 'CRM'], ['Figma', 'Design'], ['Airtable', 'Data'], ['Calendly', 'Scheduling'], ['Zoom', 'Meetings']];
    const defs = [{ n:'Products', cols:4, items:PR, ft:['14 products, one workspace', 'All products', 'Compare plans'] }, { n:'Integrations', cols:6, items:IN, small:true, ft:['Plus 140 more through Zapier', 'Browse integrations', 'Build your own'] }, { n:'Pricing', link:true }, { n:'Docs', link:true }];
    const trig = [], has = [], pk = [], panes = [];
    defs.forEach(d => {
      if (d.link){ const a = mx('a', 'mg-t', d.n + '<i class="mg-it"></i>'); a.href = '#'; a.dataset.go = d.n; tr.appendChild(a); trig.push(a); has.push(false); pk.push(-1); return; }
      const b = mx('button', 'mg-t', d.n + ic(MGI.chev, 13) + '<i class="mg-it"></i>'); b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'mega-icons-pn'); tr.appendChild(b); trig.push(b); has.push(true); pk.push(panes.length);
      const tile = it => `<a class="mg4-t" href="#" data-go="${it[0]}"><span class="mg4-i">${it[2] ? mi(it[2], 20) : it[0][0]}</span><b>${it[0]}</b><small>${it[1]}</small>${it[3] ? `<em class="mg4-b">${it[3]}</em>` : ''}</a>`;
      const pa = mx('div', 'mg4-pa' + (d.small ? ' mg4-s' : ''), `<div class="mg4-gr" style="grid-template-columns:repeat(${d.cols},minmax(0,1fr))">${d.items.map(tile).join('')}</div><div class="mg4-ft"><span>${d.ft[0]}</span><a href="#" data-go="${d.ft[1]}">${d.ft[1]}${ic(MGI.arr, 14)}</a><a href="#" data-go="${d.ft[2]}">${d.ft[2]}</a></div>`);
      pw.appendChild(pa);
      const grid = $(pa, '.mg4-gr'), tiles = $$(pa, '.mg4-t');
      const P = { el:pa, grid, tiles, d, cols:d.cols, plate:mgPlate(grid, tiles), hv:tiles.map(() => new Track(0, S.snap)) };
      tiles.forEach((el, k) => { const on = () => P.hv[k].set(1), off = () => P.hv[k].set(0); el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') on(); }); el.addEventListener('pointerleave', off); el.addEventListener('focus', () => { if (el.matches(':focus-visible')) on(); }); el.addEventListener('blur', off); });
      pa.addEventListener('keydown', e => { const k = tiles.indexOf(e.target); if (k < 0) return; const n = tiles.length; let j = -1;
        if (e.key === 'ArrowRight') j = Math.min(n - 1, k + 1); else if (e.key === 'ArrowLeft') j = Math.max(0, k - 1); else if (e.key === 'ArrowDown'){ j = k + P.cols; if (j >= n){ e.preventDefault(); const f = $$(pa, '.mg4-ft a')[0]; f && f.focus(); return; } }
        else if (e.key === 'ArrowUp'){ j = k - P.cols; if (j < 0){ e.preventDefault(); const t0 = trig[ctl.cur]; t0 && t0.focus(); return; } }
        if (j >= 0){ e.preventDefault(); tiles[j].focus(); } });
      mgArrows(pa, () => { const k = P.tiles[P.tiles.length - 1]; k && k.focus(); });
      panes.push(P);
    });
    sh.innerHTML = `<div class="mg-ex" data-ex>${defs.map(d => d.link ? `<a class="mg-lkm" href="#" data-go="${d.n}">${d.n}</a>` : mgAc(d.n, `<div class="mg4-mg" style="grid-template-columns:repeat(${d.small ? 3 : 2},minmax(0,1fr))">${d.items.map(it => `<a href="#" data-go="${it[0]}"><span class="mg4-i">${it[2] ? mi(it[2], 18) : it[0][0]}</span>${it[0]}</a>`).join('')}</div>`)).join('')}</div><div class="mg-cb"><a class="btn mg-cta" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta" href="#" data-go="Start free">Start free</a></div>`;
    const acc = mgAcc(sh), page = mgPage(w);
    const o = new Track(0), Ht = new Track(0), sw = new Swap(0); let dir = 1, tEnter = 0, narrow = false;
    const ctl = mgCtl({ st, w, bar, trig, has, zones:[pn], first:i => panes[pk[i]].tiles[0],
      onOpen:(i, prev) => { const k = pk[i], h = panes[k].el.offsetHeight;
        if (prev < 0){ mgReset(sw, k); Ht.jump(h); tEnter = now() + .05; } else { dir = i > prev ? 1 : -1; sw.to(k); Ht.set(h); tEnter = now() + EXIT + .04; } o.set(1); panes.forEach(P => P.plate.hide()); },
      onClose:() => { o.set(0, S.snap); } });
    const sheet = mgSheet({ burger, sheet:sh, sc, items:() => [...$(sh, '.mg-ex').children, $(sh, '.mg-cb')] });
    mgPick(w, nm => { page.go(nm); if (narrow) sheet.set(false, true); else ctl.close(true); });
    const remeasure = () => { if (ctl.cur >= 0) Ht.jump(panes[pk[ctl.cur]].el.offsetHeight); };
    mgFit(st, w, (n, ch) => { narrow = n; if (ch){ ctl.close(false); o.jump(0); sheet.set(false, false, true); acc.closeAll(); } remeasure(); });
    document.fonts.ready.then(remeasure);
    return t => {
      page.render(t);
      if (narrow){ sheet.render(t); acc.render(t); return; }
      ctl.tick(t); const q = clamp(o.at(t));
      pop(pn, q); sc.style.opacity = (.2*q).toFixed(3); sc.style.visibility = q < .01 ? 'hidden' : 'visible';
      pw.style.height = px(Math.max(0, Ht.at(t)));
      mgSwapPanes(sw, panes.map(P => P.el), t, dir, 14);
      panes.forEach((P, k) => {
        P.el.inert = k !== sw.cur;
        P.tiles.forEach((el, j) => { const h = clamp(P.hv[j].at(t)), i = el.firstElementChild;
          i.style.background = mix(h, 'var(--accent)', 'var(--accent-tint)'); i.style.color = mix(h, 'var(--card)', 'var(--accent)');
          if (k === sw.cur){ const r = Math.floor(j / P.cols), c = j % P.cols, p = clamp(prog(t, tEnter + .03*(r + c))); el.style.opacity = p.toFixed(3); el.style.transform = p > .995 ? 'none' : `translateY(${px((1 - p)*8)})`; } });
        P.plate.render(t);
      });
    };
  }});

/* ================================================================ 5. Search inside the menu */
const MGS = [
  ['Block API reference', 'Register, configure and nest blocks', 'Docs', 1], ['Webhooks', 'Subscribe to publish and order events', 'Docs', 1], ['Roles and permissions', 'Per-section access for editors', 'Docs'],
  ['Custom domains', 'Connect a domain and manage DNS', 'Docs'], ['Redirects', 'Bulk import and wildcard rules', 'Docs'], ['Forms API', 'Submit and read responses', 'Docs'],
  ['MCP server setup', 'Connect an agent to your workspace', 'Docs', 1], ['Page speed budget', 'Image, font and script limits', 'Docs'],
  ['Migrate from WordPress', 'Posts, media and redirects in a day', 'Guide', 1], ['Set up paid memberships', 'Tiers, gated pages and billing', 'Guide'],
  ['Design tokens for a brand refresh', 'Change type and color in one place', 'Guide'], ['Run a newsletter from the editor', 'Segments, send times and archives', 'Guide', 1],
  ['Launch checklist', 'Twenty checks before you go live', 'Guide'], ['Build a multi-language site', 'Translations, hreflang and fallbacks', 'Guide'],
  ['Scheduled blocks', 'Release 3.2, October 1', 'Changelog'], ['Approval flows for agents', 'Release 3.1, September 9', 'Changelog'], ['Send-time optimization', 'Release 3.1, September 9', 'Changelog'],
  ['Faster image pipeline', 'Release 3.0, August 12', 'Changelog'], ['Per-block comments', 'Release 3.0, August 12', 'Changelog'], ['Forms spam filtering', 'Release 2.9, July 15', 'Changelog']];
const MGSI = { Docs:'book', Guide:'cap', Changelog:'list' };
const mgEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// one search surface: input, scope chips, live-filtered list. Used in the desktop panel and in the phone's full-screen search.
function mgSearchUI(host, uid, o){
  const RH = 52, MAX = 6;
  host.innerHTML = `<div class="mg5-in"><span class="mg5-si">${mi('search', 18)}</span><input id="${uid}-q" class="mg5-q" type="text" role="combobox" aria-expanded="true" aria-controls="${uid}-lb" aria-autocomplete="list" aria-label="Search Studio" placeholder="Search docs, guides and changelog" autocomplete="off" spellcheck="false"><button type="button" class="mg5-cl" aria-label="Clear search">${ic(I.x, 14)}</button><kbd class="mg5-k">esc</kbd>${o.cancel ? '<button type="button" class="mg5-cn">Cancel</button>' : ''}</div>
    <div class="mg5-sg" role="group" aria-label="Search in"><i class="mg5-sp"></i><button type="button" aria-pressed="true">All</button><button type="button" aria-pressed="false">Docs</button><button type="button" aria-pressed="false">Guides</button><button type="button" aria-pressed="false">Changelog</button></div>
    <div class="mg5-st" role="status" aria-live="polite"></div>
    <div class="mg5-lw"><div class="mg5-lb" role="listbox" id="${uid}-lb" aria-label="Results"><i class="mg5-pl"></i></div><div class="mg5-em"><b>No results for “<span></span>”</b><span>Try “blocks”, “forms” or “webhooks”.</span></div></div>
    <div class="mg5-fo"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>`;
  const input = $(host, '.mg5-q'), cl = $(host, '.mg5-cl'), lb = $(host, '.mg5-lb'), pl = $(host, '.mg5-pl'), st = $(host, '.mg5-st'), em = $(host, '.mg5-em'), sg = $(host, '.mg5-sg'), sp = $(host, '.mg5-sp'), chips = $$(sg, 'button');
  const rows = MGS.map((d, i) => { const r = mx('div', 'mg5-r', `<span class="mg-ic">${mi(MGSI[d[2]], 16)}</span><span class="mg5-tx"><b></b><small></small></span><span class="mg5-kd">${d[2]}</span>`); r.setAttribute('role', 'option'); r.id = `${uid}-o${i}`; r.setAttribute('aria-selected', 'false'); lb.appendChild(r); return r; });
  const flow = mgFlow(lb, rows, rows.map(() => 48)), ey = edges(0, 0), sx = edges(0, 0), emT = new Track(0, S.snap);
  let act = 0, shown = [], scope = 0, emQ = null;
  const hl = (txt, toks) => toks.length ? txt.replace(new RegExp('(' + toks.map(mgEsc).join('|') + ')', 'gi'), '<mark>$1</mark>') : txt;
  const setAct = (r, inst) => { act = r; const n = shown.length; rows.forEach(x => x.setAttribute('aria-selected', 'false'));
    if (!n){ input.removeAttribute('aria-activedescendant'); return; } const el = rows[shown[r]]; el.setAttribute('aria-selected', 'true'); input.setAttribute('aria-activedescendant', el.id);
    if (inst || !pl.dataset.on){ ey.jump(r*RH, r*RH + 48); pl.dataset.on = '1'; } else ey.go(r*RH, r*RH + 48); };
  const refilter = inst => {
    const q = input.value.trim().toLowerCase(), toks = q.split(/\s+/).filter(Boolean), kind = [null, 'Docs', 'Guide', 'Changelog'][scope];
    let list = MGS.map((d, i) => ({ d, i, s:toks.every(k => (d[0] + ' ' + d[1] + ' ' + d[2]).toLowerCase().includes(k)) ? toks.reduce((a, k) => a + (d[0].toLowerCase().startsWith(k) ? 3 : d[0].toLowerCase().includes(k) ? 2 : 1), 0) : -1 })).filter(x => x.s >= 0 && (!kind || x.d[2] === kind));
    if (!toks.length) list = list.filter(x => x.d[3]); else list.sort((a, b) => b.s - a.s || a.i - b.i);
    shown = list.slice(0, MAX).map(x => x.i);
    const pos = MGS.map(() => null); shown.forEach((i, r) => { pos[i] = r*RH; const b = $(rows[i], 'b'), s = $(rows[i], 'small'); b.innerHTML = hl(MGS[i][0], toks); s.innerHTML = hl(MGS[i][1], toks); });
    st.textContent = !toks.length ? 'Suggested for you' : !list.length ? 'No matches' : `${list.length} result${list.length > 1 ? 's' : ''}${list.length > MAX ? `, showing the top ${MAX}` : ''}`;
    flow.place(pos, shown.length ? shown.length*RH - 4 : 104, inst); cl.style.visibility = input.value ? 'visible' : 'hidden';
    if (!shown.length){ emQ = input.value.trim(); $(em, 'span').textContent = emQ; emT.set(1, S.base, now() + EXIT + .05); } else emT.set(0, S.snap);
    setAct(clamp(act, 0, Math.max(0, shown.length - 1)), inst); };
  const pick = r => { if (shown[r] != null) o.onPick(MGS[shown[r]][0]); };
  const setScope = k => { scope = k; chips.forEach((b, j) => b.setAttribute('aria-pressed', j === k)); const b = chips[k]; sx.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); act = 0; refilter(false); };
  chips.forEach((b, k) => b.addEventListener('click', () => setScope(k)));
  input.addEventListener('input', () => { act = 0; refilter(false); });
  cl.addEventListener('click', () => { input.value = ''; act = 0; refilter(false); input.focus(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown'){ e.preventDefault(); e.stopPropagation(); if (shown.length) setAct(Math.min(shown.length - 1, act + 1)); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); e.stopPropagation(); if (shown.length) setAct(Math.max(0, act - 1)); }
    else if (e.key === 'Enter'){ e.preventDefault(); pick(act); }
    else if (e.key === 'Escape' && input.value){ e.preventDefault(); e.stopPropagation(); input.value = ''; act = 0; refilter(false); } });
  rows.forEach(r => { r.addEventListener('pointermove', () => { const k = shown.indexOf(rows.indexOf(r)); if (k >= 0 && k !== act) setAct(k); }); r.addEventListener('click', () => { const k = shown.indexOf(rows.indexOf(r)); if (k >= 0) pick(k); }); });
  if (o.cancel) $(host, '.mg5-cn').addEventListener('click', () => o.onCancel());
  const layout = () => { const b = chips[scope]; sx.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth); };
  refilter(true); layout();
  return { input, flow, el:host, layout, reset(){ input.value = ''; scope = 0; chips.forEach((b, j) => b.setAttribute('aria-pressed', j === 0)); act = 0; refilter(true); layout(); }, get hTarget(){ return flow.target; },
    base(){ return host.offsetHeight - lb.parentElement.offsetHeight; },
    render(t){ flow.render(t); const a = ey.A.at(t), b = ey.B.at(t); pl.style.transform = `translateY(${px(a)})`; pl.style.height = px(Math.max(0, b - a)); pl.style.opacity = shown.length ? '1' : '0';
      const l = sx.A.at(t), r = sx.B.at(t); sp.style.transform = `translateX(${px(l)})`; sp.style.width = px(Math.max(0, r - l));
      const q = clamp(emT.at(t)); fade(em, q, 0); em.style.visibility = q < .01 ? 'hidden' : 'visible'; } };
}

atom({ id:'mega-search', cat:'Mega menus', name:'Search inside the menu', block:'Mega menu, site-header, search-trigger, Combobox', fam:['X','S','M'], wide:true, tall:true,
  html:`${MGCSS}<style>
.mg5-pn{position:absolute;z-index:30;top:76px;left:12px;right:12px;margin:0 auto;max-width:640px;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:hidden;visibility:hidden;transform-origin:50% 0}
.mg5-pw{position:relative}
.mg5-pa{position:absolute;left:0;right:0;top:0}
.mg5-dg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 8px;padding:10px;position:relative}
.mg5-dg>.mg-lk{padding:9px 10px}
.mg5-ft2{display:flex;justify-content:space-between;gap:12px;padding:12px 22px;background:var(--raised);font-size:13px;color:var(--muted)}
.mg5-ft2 a{font-weight:500;color:var(--ink);display:inline-flex;gap:6px;align-items:center;border-radius:6px;white-space:nowrap}
.mg5-in{display:flex;align-items:center;gap:10px;height:56px;padding:0 14px 0 18px;border-bottom:1px solid var(--line-soft)}
.mg5-si{flex:none;color:var(--muted);display:flex}
.mg5-q{flex:1;min-width:0;height:40px;border:0;background:none;color:var(--ink);font:16px var(--sans);outline:none;user-select:text;-webkit-user-select:text}
.mg5-q::placeholder{color:var(--muted)}
.mg5-q:focus-visible{outline:none}
.mg5-in:focus-within{box-shadow:inset 0 -2px 0 var(--ink)}
.mg5-cl{flex:none;width:28px;height:28px;border:0;border-radius:50%;background:var(--raised);color:var(--muted);display:grid;place-items:center;cursor:pointer;visibility:hidden}
.mg5-k,.mg5-fo kbd{font:500 11.5px var(--mono);padding:2px 7px;border-radius:6px;color:var(--muted);background:var(--card)}
.mg5-cn{display:none;flex:none;border:0;background:none;padding:8px 2px;font:500 15px var(--sans);color:var(--ink);cursor:pointer}
.mg5-sg{position:relative;display:flex;gap:2px;margin:10px 14px 0;padding:3px;border-radius:10px;background:var(--raised);width:max-content;max-width:calc(100% - 28px)}
.mg5-sp{position:absolute;left:0;top:3px;bottom:3px;border-radius:7px;background:var(--card);box-shadow:var(--shadow)}
.mg5-sg button{position:relative;border:0;background:none;padding:5px 12px;border-radius:7px;font:500 13px var(--sans);color:var(--muted);cursor:pointer}
.mg5-sg button[aria-pressed="true"]{color:var(--ink)}
.mg5-st{padding:12px 20px 6px;font-size:12px;font-weight:500;color:var(--muted)}
.mg5-lw{position:relative;padding:0 8px}
.mg5-lb{position:relative}
.mg5-pl{position:absolute;left:0;right:0;top:0;height:48px;border-radius:10px;background:var(--raised);pointer-events:none}
.mg5-r{position:absolute;left:0;right:0;top:0;height:48px;display:flex;align-items:center;gap:12px;padding:0 10px;border-radius:10px;cursor:pointer}
.mg5-tx{flex:1;min-width:0}
.mg5-tx b{display:block;font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mg5-tx small{display:block;font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mg5-tx mark{background:var(--accent-tint);color:var(--accent);border-radius:3px;padding:0 1px;font-weight:600}
.mg5-kd{flex:none;font-size:12px;color:var(--muted)}
.mg5-em{position:absolute;left:0;right:0;top:0;height:104px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-align:center;visibility:hidden;pointer-events:none;padding:0 16px}
.mg5-em b{font-size:14px;font-weight:500}
.mg5-em span{font-size:13px;color:var(--muted)}
.mg5-fo{display:flex;gap:18px;padding:10px 20px;margin-top:6px;background:var(--raised);font-size:12.5px;color:var(--muted)}
.mg5-fo span{display:inline-flex;gap:4px;align-items:center}
.mg5-sb{flex:0 1 220px;margin-left:8px;height:36px;border:0;padding:1px 7px;background:var(--raised);color:var(--muted)}
.mg5-sb span{flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis}
.mg5-sb kbd{font:500 11.5px var(--mono);padding:1px 6px;border-radius:6px;background:var(--raised);color:var(--muted)}
.mg5-sbtn{display:none}
.mg-w[data-n] .mg5-sbtn.mg-mb{display:grid!important;place-items:center}
.mg-w[data-n] .mg5-pn{display:none}
.mg5-ms{position:absolute;z-index:50;inset:0;display:none;background:var(--card);visibility:hidden;overflow:auto}
.mg-w[data-n] .mg5-ms{display:block}
.mg5-ms .mg5-k{display:none}
.mg5-ms .mg5-cn{display:block}
.mg5-ms .mg5-fo{display:none}
.mg5-ms .mg5-in{height:64px}
</style><div class="mg-w">${mgPageHTML}<div class="mg-sc"></div>
<nav class="mg-bar" aria-label="Main (search)"><span class="mg-lgw">${mgLogo}</span><div class="mg-dt mg5-tr" style="display:flex;gap:2px"></div><span class="mg-sp"></span><button type="button" class="mg-t mg5-sb mg-dt" data-nr aria-expanded="false" aria-controls="mega-search-pn" aria-keyshortcuts="/">${mi('search', 16)}<span>Search</span><kbd>/</kbd><i class="mg-it"></i></button><a class="btn ink mg-cta mg-dt" href="#" data-go="Start free">Start free</a><button type="button" class="mg-bg mg-mb mg5-sbtn" aria-label="Search" aria-haspopup="dialog">${mi('search', 20)}</button>${mgBurger.replace('mg-bg', 'mg-bg mg-mb')}</nav>
<div class="mg5-pn card" id="mega-search-pn"><div class="mg5-pw"></div></div>
<div class="mg-sh" id="mega-search-sh" role="region" aria-label="Menu"></div>
<div class="mg5-ms" role="dialog" aria-label="Search" aria-modal="true"></div>
<div class="hint"><span class="mg-dt">Click Search or press /. Type to filter, arrows to move, Enter to open, Escape clears then closes.</span><span class="mg-mb">Tap the magnifier to search. Escape closes it.</span></div></div>`,
  desc:'Opening search grows the panel from the bar and puts the caret in the field. Each keystroke filters at once: rows that no longer match blur out in 100 ms, the survivors slide up into the gap, and rows that now match arrive last. The panel height follows the list. The highlight plate trails the arrow keys. On a phone, search takes over the whole screen instead.',
  api:'q → filter → leaving.o.set(0) → stay.y.set(rank·52) → entering.o.set(1)   panel.H.set(base + n·52)',
  init(st){
    const w = $(st, '.mg-w'), bar = $(w, '.mg-bar'), pn = $(w, '.mg5-pn'), pw = $(w, '.mg5-pw'), sc = $(w, '.mg-sc'), sh = $(w, '.mg-sh'), burger = $(w, '.mg-bg:not(.mg5-sbtn)'), tr = $(w, '.mg5-tr'), sbd = $(w, '.mg5-sb'), sbm = $(w, '.mg5-sbtn'), ms = $(w, '.mg5-ms');
    const page = mgPage(w);
    // bar: Product (link), Docs (panel), Pricing (link), Search (panel, click or slash only)
    const mk = (n, link) => { if (link){ const a = mx('a', 'mg-t', n + '<i class="mg-it"></i>'); a.href = '#'; a.dataset.go = n; tr.appendChild(a); return a; }
      const b = mx('button', 'mg-t', n + ic(MGI.chev, 13) + '<i class="mg-it"></i>'); b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'mega-search-pn'); tr.appendChild(b); return b; };
    const trig = [mk('Product', true), mk('Docs'), mk('Pricing', true), sbd], has = [false, true, false, true], pk = [-1, 0, -1, 1];
    const docs = mx('div', 'mg5-pa', `<div class="mg5-dg">${[['Quickstart', 'Publish a first page in ten minutes', 'zap'], ['Concepts', 'Workspaces, blocks and content types', 'book'], ['Migration guides', 'Move from WordPress or Webflow', 'file'], ['Block API', 'Register and configure custom blocks', 'code'], ['REST API', 'Read and write content from code', 'braces'], ['Webhooks', 'Subscribe to publish and order events', 'send']].map(mgLk).join('')}</div><div class="mg5-ft2"><span>Can’t find it? Press the search button, then type.</span><a href="#" data-go="All documentation">All documentation${ic(MGI.arr, 14)}</a></div>`);
    const sp1 = mx('div', 'mg5-pa'); pw.append(docs, sp1);
    const S1 = mgSearchUI(sp1, 'mega-search-d', { onPick:nm => { page.go(nm); ctl.close(true); } });
    const dPlate = mgPlate($(docs, '.mg5-dg'), $$(docs, '.mg-lk'));
    const panes = [docs, sp1];
    // phone: nav sheet plus a full-screen search
    sh.innerHTML = `<div class="mg-ex" data-ex><a class="mg-lkm" href="#" data-go="Product">Product</a>${mgAc('Docs', [['Quickstart', 'Publish a first page in ten minutes', 'zap'], ['Concepts', 'Workspaces, blocks and content types', 'book'], ['Migration guides', 'Move from WordPress or Webflow', 'file'], ['Block API', 'Register and configure custom blocks', 'code'], ['REST API', 'Read and write content from code', 'braces'], ['Webhooks', 'Subscribe to publish and order events', 'send']].map(mgRow).join(''))}<a class="mg-lkm" href="#" data-go="Pricing">Pricing</a></div><div class="mg-cb"><a class="btn mg-cta" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta" href="#" data-go="Start free">Start free</a></div>`;
    const acc = mgAcc(sh), mo = new Track(0); let narrow = false, mOpen = false, mFoc = 0;
    const SM = mgSearchUI(ms, 'mega-search-m', { cancel:true, onPick:nm => { page.go(nm); setM(false, true); }, onCancel:() => setM(false, true) });
    const setM = (v, refocus, inst) => { if (v === mOpen && !inst) return; mOpen = v; sbm.setAttribute('aria-expanded', v); if (inst) mo.jump(v ? 1 : 0); else openSet(mo, v); ms.inert = !v;
      if (v){ SM.reset(); mFoc = now() + .06; } else if (refocus) sbm.focus(); };
    sbm.setAttribute('aria-expanded', 'false'); ms.inert = true; sbm.addEventListener('click', () => setM(true));
    ms.addEventListener('keydown', e => { if (e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); setM(false, true); } });
    const o = new Track(0), Ht = new Track(0), sw = new Swap(0); let dir = 1, tEnter = 0, wantH = 0;
    const heightOf = k => k === 1 ? S1.base() + S1.hTarget : docs.offsetHeight;
    const ctl = mgCtl({ st, w, bar, trig, has, hover:[true, true, true, false], zones:[pn], first:i => i === 3 ? S1.input : mgFoc(docs)[0],
      onOpen:(i, prev, how) => { const k = pk[i];
        if (k === 1 && prev < 0) S1.reset();
        const h = heightOf(k); wantH = h;
        if (prev < 0){ mgReset(sw, k); Ht.jump(h); tEnter = now() + .05; } else { dir = i > prev ? 1 : -1; sw.to(k); Ht.set(h); tEnter = now() + EXIT + .04; } o.set(1); dPlate.hide();
        if (k === 1 && how !== 'hover') ctl.focusEl(S1.input); },
      onClose:() => { o.set(0, S.snap); } });
    const sheet = mgSheet({ burger, sheet:sh, sc, items:() => [...$(sh, '.mg-ex').children, $(sh, '.mg-cb')] });
    mgPick(w, nm => { page.go(nm); if (narrow) sheet.set(false, true); else ctl.close(true); });
    mgArrows(docs, () => trig[ctl.cur] && trig[ctl.cur].focus());
    w.addEventListener('keydown', e => { if (e.key !== '/' || e.target.tagName === 'INPUT') return; e.preventDefault(); if (narrow) setM(true); else { ctl.open(3, 'key'); ctl.focusEl(S1.input); } });
    const relayout = () => { S1.layout(); SM.layout(); if (ctl.cur >= 0){ wantH = heightOf(pk[ctl.cur]); Ht.jump(wantH); } };
    mgFit(st, w, (n, ch) => { narrow = n; if (ch){ ctl.close(false); o.jump(0); sheet.set(false, false, true); acc.closeAll(); setM(false, false, true); } relayout(); });
    document.fonts.ready.then(relayout);
    return t => {
      page.render(t);
      if (narrow){
        sheet.render(t); acc.render(t); SM.render(t);
        const q = clamp(mo.at(t)); ms.style.opacity = q.toFixed(3); ms.style.visibility = q < .01 ? 'hidden' : 'visible'; ms.style.transform = `translateY(${px((1 - q)*28)})`; ms.style.filter = q < .98 ? `blur(${((1 - q)*BLUR).toFixed(2)}px)` : 'none'; ms.style.pointerEvents = q > .5 ? 'auto' : 'none';
        if (mFoc && t >= mFoc){ mFoc = 0; SM.input.focus(); }
        return; }
      ctl.tick(t); const q = clamp(o.at(t));
      pop(pn, q); sc.style.opacity = (.2*q).toFixed(3); sc.style.visibility = q < .01 ? 'hidden' : 'visible';
      if (q > .01 && ctl.cur >= 0){ const k = pk[ctl.cur]; if (k === 1){ const h = heightOf(1); if (Math.abs(h - wantH) > .5){ wantH = h; Ht.set(h); } } }
      pw.style.height = px(Math.max(0, Ht.at(t)));
      mgSwapPanes(sw, panes, t, dir, 14);
      panes.forEach((p, k) => { p.inert = k !== sw.cur; });
      if (sw.cur === 0) mgStag($$(docs, '.mg-lk'), t, tEnter, .025, 6);
      dPlate.render(t); S1.render(t);
    };
  }});

/* ================================================================ 6. Full-width card panel */
const MGK = { c:'var(--card)', r:'var(--raised)', a:'var(--accent)', l:'var(--line)', t:'var(--accent-tint)' };
const MGART = {
  site:[[8, 12, 84, 76, 'c', 6], [8, 12, 84, 11, 'l', 6], [14, 32, 40, 9, 'a'], [14, 46, 56, 5, 'r'], [14, 55, 48, 5, 'r'], [60, 32, 26, 40, 't', 4]],
  list:[[10, 14, 46, 8, 'a'], [10, 30, 80, 5, 'c'], [10, 40, 70, 5, 'c'], [10, 50, 76, 5, 'c'], [10, 60, 52, 5, 'c'], [10, 74, 26, 9, 'c', 4]],
  chart:[[14, 58, 11, 28, 'c'], [30, 42, 11, 44, 'c'], [46, 50, 11, 36, 'c'], [62, 26, 11, 60, 'a'], [78, 36, 11, 50, 'c']],
  grid:[[8, 12, 26, 34, 'c', 5], [37, 12, 26, 34, 'c', 5], [66, 12, 26, 34, 'a', 5], [8, 54, 26, 34, 'c', 5], [37, 54, 26, 34, 'c', 5], [66, 54, 26, 34, 'c', 5]],
  quote:[[12, 16, 18, 28, 'a', 99], [36, 20, 50, 7, 'c'], [36, 34, 36, 7, 'c'], [12, 58, 76, 7, 'c'], [12, 72, 58, 7, 'c']],
  cal:[[10, 12, 80, 76, 'c', 6], [10, 12, 80, 18, 'a', 6], [18, 42, 9, 11, 'r', 2], [32, 42, 9, 11, 'r', 2], [46, 42, 9, 11, 'a', 2], [60, 42, 9, 11, 'r', 2], [74, 42, 9, 11, 'r', 2], [18, 62, 9, 11, 'r', 2], [32, 62, 9, 11, 'r', 2], [46, 62, 9, 11, 'r', 2]] };
const mgArt = (k, bg) => `<div class="mg6-ar" style="background:${bg}">${MGART[k].map(([x, y, w, h, c, r = 3]) => `<i style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;background:${MGK[c]};border-radius:${r}px"></i>`).join('')}</div>`;

atom({ id:'mega-cards', cat:'Mega menus', name:'Full-width image cards', block:'Mega menu, site-header, card grid', fam:['X','S','M'], wide:true, tall:true,
  html:`${MGCSS}<style>
.mg6-bar{top:0;left:0;right:0;height:60px;border-radius:0;box-shadow:none;border-bottom:1px solid var(--line);padding:0 16px 0 18px}
.mg6-pn{position:absolute;z-index:30;top:60px;left:0;right:0;background:var(--card);border-bottom:1px solid var(--line);box-shadow:var(--shadow);overflow:hidden;visibility:hidden}
.mg6-pw{position:relative}
.mg6-pa{position:absolute;left:0;right:0;top:0;padding:14px 16px 16px}
.mg6-hd{display:flex;align-items:baseline;gap:10px;padding:0 10px 10px;font-size:13px;color:var(--muted)}
.mg6-hd b{font-size:15px;font-weight:600;color:var(--ink);letter-spacing:-.01em}
.mg6-hd a{margin-left:auto;display:inline-flex;gap:6px;align-items:center;font-weight:500;color:var(--ink);border-radius:6px;white-space:nowrap}
.mg6-gr{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.mg-w[data-m] .mg6-gr{grid-template-columns:repeat(3,minmax(0,1fr))}
.mg-w[data-m] .mg6-gr .mg6-c:nth-child(5){display:none}
.mg6-c{position:relative;z-index:1;display:block;padding:10px;border-radius:12px}
.mg6-th{display:block;position:relative;aspect-ratio:16/10;border-radius:9px;overflow:hidden;background:var(--raised)}
.mg6-ar{position:absolute;inset:0}
.mg6-ar i{position:absolute;display:block}
.mg6-bd{display:block;padding:10px 2px 2px}
.mg6-bd em{display:block;font-style:normal;font-size:12px;font-weight:500;color:var(--accent)}
.mg6-bd b{display:block;margin:2px 0 3px;font-size:14px;line-height:1.3;font-weight:500;letter-spacing:-.005em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.mg6-bd small{font-size:12.5px;color:var(--muted)}
.mg6-sh{top:60px;left:0;right:0;bottom:0;border-radius:0}
.mg6-cr{display:flex;gap:10px;overflow-x:auto;padding:2px 8px 10px;scroll-snap-type:x mandatory;scrollbar-width:none}
.mg6-cr::-webkit-scrollbar{display:none}
.mg6-cr .mg6-c{flex:0 0 190px;scroll-snap-align:start;padding:8px}
.mg6-all{display:flex;align-items:center;gap:6px;padding:0 8px 6px;font-size:13.5px;font-weight:500}
.mg-w[data-n] .mg6-pn{display:none}
</style><div class="mg-w">${mgPageHTML}<div class="mg-sc"></div>
<nav class="mg-bar mg6-bar" aria-label="Main (card panel)"><span class="mg-lgw">${mgLogo}</span><div class="mg-dt mg6-tr" style="display:flex;gap:2px"></div><span class="mg-sp"></span><a class="btn mg-cta mg-dt mg-lo" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta mg-dt" href="#" data-go="Start free">Start free</a>${mgBurger.replace('mg-bg', 'mg-bg mg-mb')}</nav>
<div class="mg6-pn" id="mega-cards-pn"><div class="mg6-pw"></div></div>
<div class="mg-sh mg6-sh" id="mega-cards-sh" role="region" aria-label="Menu"></div>
<div class="hint"><span class="mg-dt">Cards arrive left to right, picture first, then words.</span><span class="mg-mb">Tap the menu button. Cards scroll sideways.</span></div></div>`,
  desc:'The panel unrolls from the header edge on one spring. Cards then arrive left to right: each picture rises first, its words follow 60 ms later. One plate trails the pointer between cards, and the picture under it eases up. Moving to another top item swaps the cards in place. At phone width the cards become a swipeable row inside each accordion.',
  api:'panel.reveal.set(1) → thumb[i].rise(t0 + 40ms·i) → body[i].rise(t0 + 60ms + 40ms·i)   plate.go(card)',
  init(st){
    const w = $(st, '.mg-w'), bar = $(w, '.mg-bar'), pn = $(w, '.mg6-pn'), pw = $(w, '.mg6-pw'), sc = $(w, '.mg-sc'), sh = $(w, '.mg-sh'), burger = $(w, '.mg-bg'), tr = $(w, '.mg6-tr');
    const T = 'var(--accent-tint)', R = 'var(--raised)';
    const defs = [
      { n:'Customers', sub:'Teams that publish with Studio', all:'See all customers', cards:[['Case study', 'Northlight Yoga books 31% more classes', '6 min read', 'site', T], ['Case study', 'The Ledger Quarterly moves 2,400 articles in a weekend', '8 min read', 'list', R], ['Case study', 'Harbor Co-op sells out in three minutes', '5 min read', 'chart', T], ['Customer wall', 'Browse 120 sites built on Studio', 'Updated weekly', 'grid', R]] },
      { n:'Resources', sub:'Guides, events and reports', all:'Browse resources', cards:[['Guide', 'Migrate from WordPress in a day', '12 min read', 'list', R], ['Webinar', 'Approval flows for a ten-person newsroom', 'Oct 16, live', 'cal', T], ['Report', 'State of site performance, 2026', 'PDF, 24 pages', 'chart', R], ['Changelog', 'Release 3.2: scheduled blocks', 'October 1', 'grid', T]] },
      { n:'Templates', sub:'Starting points, all editable', all:'All templates', cards:[['Template', 'Studio, for classes and bookings', 'Free', 'site', T], ['Template', 'Gazette, for newsrooms and blogs', 'Free', 'list', R], ['Template', 'Counter, for small shops', 'From $19', 'grid', T], ['Template', 'Atlas, for nonprofits', 'Free', 'quote', R]] },
      { n:'Pricing', link:true }];
    const card = c => `<a class="mg6-c" href="#" data-go="${c[1]}"><span class="mg6-th">${mgArt(c[3], c[4])}</span><span class="mg6-bd"><em>${c[0]}</em><b>${c[1]}</b><small>${c[2]}</small></span></a>`;
    const trig = [], has = [], pk = [], panes = [];
    defs.forEach(d => {
      if (d.link){ const a = mx('a', 'mg-t', d.n + '<i class="mg-it"></i>'); a.href = '#'; a.dataset.go = d.n; tr.appendChild(a); trig.push(a); has.push(false); pk.push(-1); return; }
      const b = mx('button', 'mg-t', d.n + ic(MGI.chev, 13) + '<i class="mg-it"></i>'); b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'mega-cards-pn'); tr.appendChild(b); trig.push(b); has.push(true); pk.push(panes.length);
      const pa = mx('div', 'mg6-pa', `<div class="mg6-hd"><b>${d.n}</b><span>${d.sub}</span><a href="#" data-go="${d.all}">${d.all}${ic(MGI.arr, 14)}</a></div><div class="mg6-gr">${d.cards.map(card).join('')}</div>`);
      pw.appendChild(pa);
      const cs = $$(pa, '.mg6-c'), P = { el:pa, cs, plate:mgPlate($(pa, '.mg6-gr'), cs), hv:cs.map(() => new Track(0, S.base)) };
      cs.forEach((el, k) => { const on = () => P.hv[k].set(1), off = () => P.hv[k].set(0); el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') on(); }); el.addEventListener('pointerleave', off); el.addEventListener('focus', () => { if (el.matches(':focus-visible')) on(); }); el.addEventListener('blur', off); });
      panes.push(P);
    });
    sh.innerHTML = `<div class="mg-ex" data-ex>${defs.map(d => d.link ? `<a class="mg-lkm" href="#" data-go="${d.n}">${d.n}</a>` : mgAc(d.n, `<div class="mg6-cr">${d.cards.map(card).join('')}</div><a class="mg6-all" href="#" data-go="${d.all}">${d.all}${ic(MGI.arr, 14)}</a>`)).join('')}</div><div class="mg-cb"><a class="btn mg-cta" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta" href="#" data-go="Start free">Start free</a></div>`;
    const acc = mgAcc(sh), page = mgPage(w);
    const o = new Track(0), Ht = new Track(0), sw = new Swap(0); let dir = 1, tEnter = 0, narrow = false;
    const ctl = mgCtl({ st, w, bar, trig, has, zones:[pn], first:i => mgFoc(panes[pk[i]].el).find(e => e.classList.contains('mg6-c')),
      onOpen:(i, prev) => { const k = pk[i], h = panes[k].el.offsetHeight;
        if (prev < 0){ mgReset(sw, k); Ht.jump(h); tEnter = now() + .12; } else { dir = i > prev ? 1 : -1; sw.to(k); Ht.set(h); tEnter = now() + EXIT + .04; } o.set(1); panes.forEach(P => P.plate.hide()); },
      onClose:() => { o.set(0, S.snap); } });
    const sheet = mgSheet({ burger, sheet:sh, sc, pop:q => { sh.style.zIndex = 30; sh.style.opacity = q.toFixed(3); sh.style.visibility = q < .01 ? 'hidden' : 'visible'; sh.style.clipPath = `inset(0 0 ${((1 - q)*100).toFixed(2)}% 0)`; sh.style.pointerEvents = q > .5 ? 'auto' : 'none'; },
      items:() => [...$(sh, '.mg-ex').children, $(sh, '.mg-cb')] });
    mgPick(w, nm => { page.go(nm); if (narrow) sheet.set(false, true); else ctl.close(true); });
    mgArrows(pn, () => trig[ctl.cur] && trig[ctl.cur].focus());
    const remeasure = () => { if (ctl.cur >= 0) Ht.jump(panes[pk[ctl.cur]].el.offsetHeight); };
    mgFit(st, w, (n, ch) => { narrow = n; if (ch){ ctl.close(false); o.jump(0); sheet.set(false, false, true); acc.closeAll(); } remeasure(); });
    document.fonts.ready.then(remeasure);
    return t => {
      page.render(t);
      if (narrow){ sheet.render(t); acc.render(t); return; }
      ctl.tick(t); const q = clamp(o.at(t));
      pn.style.zIndex = 30; pn.style.opacity = Math.min(1, q*2).toFixed(3); pn.style.visibility = q < .01 ? 'hidden' : 'visible'; pn.style.clipPath = `inset(0 0 ${((1 - q)*100).toFixed(2)}% 0)`; pn.style.pointerEvents = q > .5 ? 'auto' : 'none';
      sc.style.opacity = (.2*q).toFixed(3); sc.style.visibility = q < .01 ? 'hidden' : 'visible';
      pw.style.height = px(Math.max(0, Ht.at(t)));
      mgSwapPanes(sw, panes.map(P => P.el), t, dir, 14);
      panes.forEach((P, k) => {
        P.el.inert = k !== sw.cur;
        if (k === sw.cur){ mgStag(P.cs.map(c => $(c, '.mg6-th')), t, tEnter, .04, 12); mgStag(P.cs.map(c => $(c, '.mg6-bd')), t, tEnter + .06, .04, 8); }
        P.cs.forEach((c, j) => { const h = clamp(P.hv[j].at(t)); $(c, '.mg6-ar').style.transform = `translateY(${px(-4*h)}) scale(${(1 + .03*h).toFixed(4)})`; });
        P.plate.render(t);
      });
    };
  }});

/* ================================================================ 7. Nested flyout with a safe triangle */
const mgTri = (p, a, b, c) => { const s = (p1, p2, p3) => (p1.x - p3.x)*(p2.y - p3.y) - (p2.x - p3.x)*(p1.y - p3.y); const d1 = s(p, a, b), d2 = s(p, b, c), d3 = s(p, c, a); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
const mgIn = (p, r) => p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
const mgPopX = (el, p, dx = -8) => { p = clamp(p); el.style.zIndex = 30; el.style.opacity = p.toFixed(3); el.style.visibility = p < .01 ? 'hidden' : 'visible'; el.style.transform = `translateX(${px((1 - p)*dx)}) scale(${(.97 + .03*p).toFixed(4)})`; el.style.filter = p < .98 ? `blur(${((1 - p)*BLUR).toFixed(2)}px)` : 'none'; el.style.pointerEvents = p > .5 ? 'auto' : 'none'; };

atom({ id:'mega-flyout', cat:'Mega menus', name:'Nested flyout, three levels', block:'Mega menu, site-header, Menu with submenus', fam:['X','E','S'], wide:true, tall:true,
  html:`${MGCSS}<style>
.mg7-mn{position:absolute;z-index:30;width:var(--mg7-w,220px);padding:6px;background:var(--card);border-radius:12px;box-shadow:var(--shadow);visibility:hidden;transform-origin:0 0}
.mg7-1{top:76px}
.mg7-sub{left:calc(100% + 12px);top:-6px}
.mg7-rw{position:relative}
.mg7-it{position:relative;z-index:1;display:flex;align-items:center;gap:10px;width:100%;height:40px;padding:0 10px;border:0;border-radius:8px;background:none;font:500 14px var(--sans);color:var(--ink);text-align:left;cursor:pointer}
.mg7-it .mg7-ci{flex:none;display:flex;color:var(--muted)}
.mg7-it .mg7-ch{margin-left:auto;flex:none;display:flex;color:var(--muted)}
.mg7-tv{position:absolute;inset:0;width:100%;height:100%;z-index:45;pointer-events:none;opacity:0}
.mg7-tv polygon{fill:var(--accent);fill-opacity:.16;stroke:var(--accent);stroke-width:1;stroke-dasharray:4 4}
.mg-w[data-n] .mg7-mn,.mg-w[data-n] .mg7-tv{display:none}
</style><div class="mg-w">${mgPageHTML}<div class="mg-sc"></div>
<nav class="mg-bar" aria-label="Main (nested flyout)"><span class="mg-lgw">${mgLogo}</span><div class="mg-dt mg7-tr" style="display:flex;gap:2px"></div><span class="mg-sp"></span><a class="btn mg-cta mg-dt mg-lo" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta mg-dt" href="#" data-go="Start free">Start free</a>${mgBurger.replace('mg-bg', 'mg-bg mg-mb')}</nav>
<svg class="mg7-tv" aria-hidden="true"><polygon points="0,0 0,0 0,0"/></svg>
<div class="mg-sh" id="mega-flyout-sh" role="region" aria-label="Menu"></div>
<div class="hint"><span class="mg-dt">Move toward a submenu: the dashed triangle is the path that will not switch rows.</span><span class="mg-mb">Tap the menu button. Groups open in place.</span></div></div>`,
  desc:'Hover waits 120 ms before the first level opens. Each row waits 100 ms before its submenu flies out to the right. While you travel toward an open submenu the pointer is inside a safe triangle between where you left the row and the submenu’s edge: rows you cross on the way do not switch for 350 ms. Leave the triangle and the switch comes in 50 ms. Arrow keys follow the menu pattern; Escape closes one level at a time.',
  api:'row.hover → wait 100ms → sub.o.set(1)   in triangle(aim, sub.top, sub.bottom) → hold 350ms   Esc → close level, focus parent row',
  init(st){
    const w = $(st, '.mg-w'), bar = $(w, '.mg-bar'), sc = $(w, '.mg-sc'), sh = $(w, '.mg-sh'), burger = $(w, '.mg-bg'), tr = $(w, '.mg7-tr'), tv = $(w, '.mg7-tv'), poly = $(tv, 'polygon');
    const N = (t, kids, icon) => ({ t, kids, icon }), Lf = t => ({ t });
    const TREE = [
      { n:'Product', items:[N('Websites', [Lf('Editor'), N('Blocks', [Lf('Text and media'), Lf('Layout'), Lf('Commerce'), Lf('Forms')]), Lf('Themes'), Lf('Page speed')], 'pen'),
        N('Commerce', [N('Catalog', [Lf('Products'), Lf('Variants'), Lf('Collections')]), Lf('Checkout'), Lf('Subscriptions'), Lf('Shipping and tax')], 'bag'),
        N('Audience', [Lf('Members'), N('Newsletters', [Lf('Composer'), Lf('Segments'), Lf('Archive')]), Lf('Forms'), Lf('Analytics')], 'users'),
        N('Operations', [N('Workflows', [Lf('Approvals'), Lf('Scheduling'), Lf('Comments')]), Lf('Roles'), Lf('Audit log')], 'flow')] },
      { n:'Resources', items:[N('Learn', [N('Docs', [Lf('Quickstart'), Lf('Concepts'), Lf('Block API')]), Lf('Guides'), Lf('Video library'), Lf('Webinars')], 'book'),
        N('Developers', [Lf('API reference'), N('CLI', [Lf('Install'), Lf('Commands'), Lf('Recipes')]), Lf('Webhooks'), Lf('MCP server')], 'code'),
        N('Support', [Lf('Help center'), Lf('Contact support'), Lf('Status')], 'chat')] },
      { n:'Pricing', link:true }];
    const all = [], page = mgPage(w);
    let ctl = null;
    // a menu: its rows, a hover plate, and one submenu per row that has kids
    const mk = (items, level, parent, name) => {
      const el = mx('div', 'mg7-mn' + (level === 1 ? ' mg7-1' : ' mg7-sub')); el.setAttribute('role', 'menu'); el.setAttribute('aria-label', name);
      const m = { el, level, parent, rows:[], kids:[], children:[], open:-1, o:new Track(0), pend:null, aim:null, t0:0 }; all.push(m);
      items.forEach((it, i) => {
        const rw = mx('div', 'mg7-rw'); el.appendChild(rw);
        const b = it.kids ? mx('button', 'mg7-it', `${it.icon ? `<span class="mg7-ci">${mi(it.icon, 17)}</span>` : ''}<span>${it.t}</span><span class="mg7-ch">${ic(MGI.chR, 14)}</span>`) : mx('a', 'mg7-it', `<span>${it.t}</span>`);
        if (it.kids){ b.type = 'button'; b.setAttribute('aria-haspopup', 'menu'); b.setAttribute('aria-expanded', 'false'); } else { b.href = '#'; b.dataset.go = it.t; }
        b.setAttribute('role', 'menuitem'); b.tabIndex = -1; rw.appendChild(b);
        m.rows.push({ rw, it:b }); m.kids.push(!!it.kids);
        m.children.push(it.kids ? (() => { const c = mk(it.kids, level + 1, m, it.t); rw.appendChild(c.el); return c; })() : null);
      });
      m.plate = mgPlate(el, m.rows.map(r => r.it));
      return m;
    };
    const setOpen = (m, i, instant) => {
      if (m.open === i) return;
      if (m.open >= 0) closeSub(m, m.open);
      m.open = i;
      if (i >= 0){ const c = m.children[i]; c.o.set(1, S.base); c.t0 = now(); m.rows[i].it.setAttribute('aria-expanded', 'true'); m.plate.go(m.rows[i].it); }
    };
    const closeSub = (m, i) => { const c = m.children[i]; if (!c) return; c.o.set(0, S.snap); m.rows[i].it.setAttribute('aria-expanded', 'false'); closeAll(c); };
    const closeAll = m => { if (m.open >= 0){ closeSub(m, m.open); m.open = -1; } m.pend = null; m.aim = null; };
    const enterRow = (m, i, e) => {
      const want = m.kids[i] ? i : -1;
      if (want === m.open){ m.pend = null; return; }
      let tri = false;
      if (m.open >= 0 && m.aim){ const sr = m.children[m.open].el.getBoundingClientRect(); tri = mgTri({ x:e.clientX, y:e.clientY }, m.aim, { x:sr.left, y:sr.top - 6 }, { x:sr.left, y:sr.bottom + 6 }); }
      m.pend = { want, at:now() + (tri ? .35 : m.open >= 0 ? .05 : .1), tri };
    };
    const wire = m => {
      m.rows.forEach((r, i) => {
        r.it.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') enterRow(m, i, e); });
        r.it.addEventListener('keydown', e => { const n = m.rows.length; let j = -1;
          if (e.key === 'ArrowDown') j = (i + 1) % n; else if (e.key === 'ArrowUp') j = (i - 1 + n) % n; else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
          if (j >= 0){ e.preventDefault(); e.stopPropagation(); m.pend = null; r.it.tabIndex = -1; m.rows[j].it.tabIndex = 0; m.rows[j].it.focus(); if (m.open >= 0) setOpen(m, -1); return; }
          if (m.kids[i] && (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); e.stopPropagation(); m.pend = null; setOpen(m, i); ctl.focusEl(m.children[i].rows[0].it); }
          else if ((e.key === 'ArrowLeft' || e.key === 'Escape') && m.parent){ e.preventDefault(); e.stopPropagation(); const p = m.parent, k = p.open; setOpen(p, -1); p.rows[k].it.focus(); } });
        r.it.addEventListener('click', () => { if (m.kids[i]){ m.pend = null; setOpen(m, i); } });
      });
      m.el.addEventListener('pointerleave', () => { m.pend = null; });
      if (m.parent) m.el.addEventListener('pointerenter', () => { m.parent.pend = null; });
      m.children.forEach(c => c && wire(c));
    };
    const trig = [], has = [], pk = [], L1 = [];
    TREE.forEach(d => {
      if (d.link){ const a = mx('a', 'mg-t', d.n + '<i class="mg-it"></i>'); a.href = '#'; a.dataset.go = d.n; tr.appendChild(a); trig.push(a); has.push(false); pk.push(-1); return; }
      const b = mx('button', 'mg-t', d.n + ic(MGI.chev, 13) + '<i class="mg-it"></i>'); b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-haspopup', 'menu'); tr.appendChild(b); trig.push(b); has.push(true); pk.push(L1.length);
      const m = mk(d.items, 1, null, d.n); w.insertBefore(m.el, tv); wire(m); L1.push(m); m.trig = b;
    });
    L1.forEach(m => m.rows[0].it.tabIndex = 0);
    const treeAcc = (items, lv) => items.map(it => it.kids ? mgAc(it.t, `<div class="mg-nx" data-ex>${treeAcc(it.kids, lv + 1)}</div>`) : `<a class="mg-nl" href="#" data-go="${it.t}">${it.t}</a>`).join('');
    sh.innerHTML = `<div class="mg-ex" data-ex>${TREE.map(d => d.link ? `<a class="mg-lkm" href="#" data-go="${d.n}">${d.n}</a>` : mgAc(d.n, `<div class="mg-nx" data-ex>${treeAcc(d.items, 1)}</div>`)).join('')}</div><div class="mg-cb"><a class="btn mg-cta" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta" href="#" data-go="Start free">Start free</a></div>`;
    const acc = mgAcc(sh); let narrow = false;
    ctl = mgCtl({ st, w, bar, trig, has, grace:.3, zones:L1.map(m => m.el), first:i => L1[pk[i]].rows[0].it,
      onOpen:(i, prev) => { if (prev >= 0){ const pm = L1[pk[prev]]; closeAll(pm); pm.o.set(0, S.snap); } const m = L1[pk[i]]; closeAll(m); m.o.set(1, S.base, now() + (prev >= 0 ? EXIT*.7 : 0)); m.t0 = now() + (prev >= 0 ? EXIT*.7 : 0); place(); },
      onClose:j => { const m = L1[pk[j]]; closeAll(m); m.o.set(0, S.snap); } });
    const sheet = mgSheet({ burger, sheet:sh, sc, items:() => [...$(sh, '.mg-ex').children, $(sh, '.mg-cb')] });
    mgPick(w, nm => { page.go(nm); if (narrow) sheet.set(false, true); else ctl.close(true); });
    // three levels must fit: width follows the stage, first level sits under its trigger
    const place = () => { const W = st.clientWidth, mw = clamp((W - 24 - 12)/3, 176, 226); w.style.setProperty('--mg7-w', mw + 'px'); const sr = st.getBoundingClientRect();
      L1.forEach(m => { const r = m.trig.getBoundingClientRect(); m.el.style.left = px(clamp(r.left - sr.left - 6, 12, Math.max(12, W - 12 - (3*mw + 24)))); }); };
    mgFit(st, w, (n, ch) => { narrow = n; if (ch){ ctl.close(false); L1.forEach(m => { closeAll(m); m.o.jump(0); }); sheet.set(false, false, true); acc.closeAll(); } place(); });
    document.fonts.ready.then(place);
    // the safe triangle: remember where the pointer was inside the open row, aim it at the submenu's near edge
    const tvo = new Track(0, S.snap); let tri = null;
    w.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || narrow) return; const pt = { x:e.clientX, y:e.clientY }; let aim = null;
      all.forEach(m => { if (m.open < 0 || m.o.target < .5) return;
        const rr = m.rows[m.open].rw.getBoundingClientRect(), sr = m.children[m.open].el.getBoundingClientRect(), inSub = mgIn(pt, sr), inMenu = mgIn(pt, m.el.getBoundingClientRect());
        if (mgIn(pt, rr)) m.aim = pt;
        if (m.pend && m.pend.tri){ if (inSub) m.pend = null; else if (!mgTri(pt, m.aim, { x:sr.left, y:sr.top - 6 }, { x:sr.left, y:sr.bottom + 6 })){ m.pend.at = Math.min(m.pend.at, now() + .05); m.pend.tri = false; } }
        if (!inSub && inMenu && m.aim) aim = { a:m.aim, sr }; });
      if (aim){ const s = st.getBoundingClientRect(), a = aim.a, sr = aim.sr; tri = [[a.x - s.left, a.y - s.top], [sr.left - s.left, sr.top - 6 - s.top], [sr.left - s.left, sr.bottom + 6 - s.top]]; tvo.set(1); } else tvo.set(0); });
    w.addEventListener('pointerleave', () => tvo.set(0));
    return t => {
      page.render(t);
      if (narrow){ sheet.render(t); acc.render(t); return; }
      ctl.tick(t); let anyOpen = 0;
      L1.forEach(m => { const q = clamp(m.o.at(t)); anyOpen = Math.max(anyOpen, q); pop(m.el, q, -4);
        mgStag(m.rows.map(r => r.rw), t, m.t0 + .02, .02, 4); });
      all.forEach(m => {
        if (m.pend && t >= m.pend.at){ const p = m.pend; m.pend = null; if (m.o.target > .5) setOpen(m, p.want); }
        if (m.level > 1) mgPopX(m.el, m.o.at(t));
        m.plate.render(t); });
      sc.style.opacity = (.2*anyOpen).toFixed(3); sc.style.visibility = anyOpen < .01 ? 'hidden' : 'visible';
      if (tri) poly.setAttribute('points', tri.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')); tv.style.opacity = clamp(tvo.at(t)).toFixed(3);
    };
  }});

/* ================================================================ 8. One panel that morphs between items */
atom({ id:'mega-morph', cat:'Mega menus', name:'Morphing dropdown with caret', block:'Mega menu, site-header, nav-menu', fam:['M','E','S','X'], wide:true, tall:true,
  html:`${MGCSS}<style>
.mg8-pn{position:absolute;z-index:30;top:82px;left:0;width:0;height:0;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:hidden;visibility:hidden}
.mg8-cr{position:absolute;z-index:31;top:76px;left:0;width:12px;height:12px;margin-left:-6px;border-radius:3px 0 0 0;background:var(--card);transform:rotate(45deg);visibility:hidden;pointer-events:none}
.mg8-pa{position:absolute;left:0;top:0}
.mg8-co{position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 10px;padding:10px 10px 8px}
.mg8-ft{padding:12px 20px;background:var(--raised);font-size:13px;color:var(--muted);display:flex;justify-content:space-between;gap:10px}
.mg8-ft a{display:inline-flex;gap:6px;align-items:center;font-weight:500;color:var(--ink);border-radius:6px;white-space:nowrap}
.mg8-ls{position:relative;padding:10px}
.mg8-code{margin:2px 10px 10px;padding:10px 12px;border-radius:10px;background:var(--raised);font:12.5px var(--mono);color:var(--muted);user-select:text}
.mg8-code b{color:var(--ink);font-weight:500}
.mg8-fc{display:flex;flex-direction:column;gap:4px;margin:10px 10px 10px 0;padding:14px;border-radius:10px;background:var(--accent-tint)}
.mg8-fc em{font-style:normal;font-size:12px;font-weight:500;color:var(--accent)}
.mg8-fc b{font-size:15px;line-height:1.3;font-weight:600;letter-spacing:-.01em}
.mg8-fc p{margin:0;font-size:12.5px;line-height:1.45;color:var(--muted)}
.mg8-fc a{margin-top:auto;display:inline-flex;gap:6px;align-items:center;font-size:13.5px;font-weight:500;border-radius:6px}
.mg8-sl{position:relative;z-index:1;display:block;padding:9px 12px;border-radius:9px;font-size:14px;font-weight:500}
.mg-w[data-n] .mg8-pn,.mg-w[data-n] .mg8-cr{display:none}
</style><div class="mg-w">${mgPageHTML}<div class="mg-sc"></div>
<nav class="mg-bar" aria-label="Main (morphing dropdown)"><span class="mg-lgw">${mgLogo}</span><div class="mg-dt mg8-tr" style="display:flex;gap:2px"></div><span class="mg-sp"></span><a class="btn mg-cta mg-dt mg-lo" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta mg-dt" href="#" data-go="Start free">Start free</a>${mgBurger.replace('mg-bg', 'mg-bg mg-mb')}</nav>
<div class="mg8-cr" aria-hidden="true"></div><div class="mg8-pn" id="mega-morph-pn"></div>
<div class="mg-sh" id="mega-morph-sh" role="region" aria-label="Menu"></div>
<div class="hint"><span class="mg-dt">Slide across the top items: one panel glides and resizes, the caret leads.</span><span class="mg-mb">Tap the menu button. Escape closes it.</span></div></div>`,
  desc:'There is one panel. Hover waits 120 ms, then it fades in with its caret under the item. Moving to another item never closes it: the caret slides first, the panel follows with lagging edges, width and height morph together, the old content leaves in 100 ms and the new content enters from the direction of travel. Leaving the bar closes it after 220 ms.',
  api:'caret.x.set(trigger.cx)   panel.{x, w, h}.set(pane)   content.to(k, dir)   open: one fade, never a second panel',
  init(st){
    const w = $(st, '.mg-w'), bar = $(w, '.mg-bar'), pn = $(w, '.mg8-pn'), cr = $(w, '.mg8-cr'), sc = $(w, '.mg-sc'), sh = $(w, '.mg-sh'), burger = $(w, '.mg-bg'), tr = $(w, '.mg8-tr');
    const P = MGD.product.flatMap(g => g.it), pick = (a, ...n) => n.map(x => a.find(r => r[0] === x)), D = MGD.dev.flatMap(g => g.it);
    const defs = [
      { n:'Products', w:600, html:() => `<div class="mg8-co"><div><p class="mg-gh">Build and publish</p>${pick(P, 'Editor', 'Blocks', 'Themes', 'Forms').map(mgLk).join('')}</div><div><p class="mg-gh">Grow your audience</p>${pick(P, 'Members', 'Commerce', 'Newsletters', 'Analytics').map(mgLk).join('')}</div></div><div class="mg8-ft"><span>Every product shares one editor and one login.</span><a href="#" data-go="Compare products">Compare products${ic(MGI.arr, 14)}</a></div>`, rows:[...pick(P, 'Editor', 'Blocks', 'Themes', 'Forms', 'Members', 'Commerce', 'Newsletters', 'Analytics')] },
      { n:'Developers', w:420, html:() => `<div class="mg8-ls">${pick(D, 'API reference', 'CLI', 'Webhooks', 'MCP server').map(mgLk).join('')}</div><div class="mg8-code"><b>$</b> npx studio pull --site northlight</div>`, rows:pick(D, 'API reference', 'CLI', 'Webhooks', 'MCP server') },
      { n:'Resources', w:520, html:() => `<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr)"><div class="mg8-ls">${pick(D, 'Guides', 'Changelog', 'Status').map(mgLk).join('')}${mgLk(['Docs', 'Concepts, tasks and reference', 'book'])}</div><div class="mg8-fc"><em>Webinar, Oct 16</em><b>Approval flows for a ten-person newsroom</b><p>A live walkthrough of roles, review queues and scheduled publishing.</p><a href="#" data-go="Save your seat">Save your seat${ic(MGI.arr, 14)}</a></div></div>`, rows:[...pick(D, 'Guides', 'Changelog', 'Status'), ['Docs', 'Concepts, tasks and reference', 'book']] },
      { n:'Company', w:280, html:() => `<div class="mg8-ls" style="padding:8px">${['About us', 'Customers', 'Careers', 'Contact'].map(t => `<a class="mg8-sl" href="#" data-go="${t}">${t}</a>`).join('')}</div>`, rows:[['About us', '', 'info'], ['Customers', '', 'star'], ['Careers', '', 'brief'], ['Contact', '', 'chat']] },
      { n:'Pricing', link:true }];
    const trig = [], has = [], pk = [], panes = [];
    defs.forEach(d => {
      if (d.link){ const a = mx('a', 'mg-t', d.n + '<i class="mg-it"></i>'); a.href = '#'; a.dataset.go = d.n; tr.appendChild(a); trig.push(a); has.push(false); pk.push(-1); return; }
      const b = mx('button', 'mg-t', d.n + ic(MGI.chev, 13) + '<i class="mg-it"></i>'); b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'mega-morph-pn'); tr.appendChild(b); trig.push(b); has.push(true); pk.push(panes.length);
      const el = mx('div', 'mg8-pa', d.html()); pn.appendChild(el);
      panes.push({ el, d, trig:b, W:d.w, H:0, plate:mgPlate(el, $$(el, '.mg-lk, .mg8-sl')) });
    });
    sh.innerHTML = `<div class="mg-ex" data-ex>${defs.map(d => d.link ? `<a class="mg-lkm" href="#" data-go="${d.n}">${d.n}</a>` : mgAc(d.n, d.rows.map(r => r[1] ? mgRow(r) : `<a class="mg-nl" href="#" data-go="${r[0]}">${r[0]}</a>`).join(''))).join('')}</div><div class="mg-cb"><a class="btn mg-cta" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta" href="#" data-go="Start free">Start free</a></div>`;
    const acc = mgAcc(sh), page = mgPage(w);
    const o = new Track(0), X = new Track(0), Wt = new Track(0), Ht = new Track(0), Cx = new Track(0, S.snap), sw = new Swap(0); let dir = 1, tEnter = 0, narrow = false, cur = -1;
    // size each pane for the current stage, then read where the panel and its caret should sit under a trigger
    const geom = k => { const p = panes[k], SW = st.clientWidth, sr = st.getBoundingClientRect(), r = p.trig.getBoundingClientRect(); const cx = r.left - sr.left + r.width/2, pw = Math.min(p.W, SW - 24);
      p.el.style.width = pw + 'px'; return { x:clamp(cx - pw/2, 12, SW - 12 - pw), w:pw, h:p.el.offsetHeight, cx }; };
    const ctl = mgCtl({ st, w, bar, trig, has, zones:[pn, cr], panel:i => panes[pk[i]].el,
      onOpen:(i, prev) => { const k = pk[i], g = geom(k); cur = k;
        if (prev < 0){ mgReset(sw, k); X.jump(g.x); Wt.jump(g.w); Ht.jump(g.h); Cx.jump(g.cx); tEnter = now() + .06; } else { dir = i > prev ? 1 : -1; sw.to(k); X.set(g.x); Wt.set(g.w); Ht.set(g.h); Cx.set(g.cx); tEnter = now() + EXIT + .04; }
        o.set(1); panes.forEach(p => p.plate.hide()); },
      onClose:() => { o.set(0, S.snap); } });
    const sheet = mgSheet({ burger, sheet:sh, sc, items:() => [...$(sh, '.mg-ex').children, $(sh, '.mg-cb')] });
    mgPick(w, nm => { page.go(nm); if (narrow) sheet.set(false, true); else ctl.close(true); });
    panes.forEach(p => mgArrows(p.el, () => trig[ctl.cur] && trig[ctl.cur].focus()));
    const remeasure = () => { panes.forEach((p, k) => geom(k)); if (ctl.cur >= 0){ const g = geom(pk[ctl.cur]); X.jump(g.x); Wt.jump(g.w); Ht.jump(g.h); Cx.jump(g.cx); } };
    mgFit(st, w, (n, ch) => { narrow = n; if (ch){ ctl.close(false); o.jump(0); sheet.set(false, false, true); acc.closeAll(); } remeasure(); });
    document.fonts.ready.then(remeasure);
    return t => {
      page.render(t);
      if (narrow){ sheet.render(t); acc.render(t); return; }
      ctl.tick(t); const q = clamp(o.at(t)), x = X.at(t), cx = Cx.at(t);
      pn.style.left = px(x); pn.style.width = px(Math.max(0, Wt.at(t))); pn.style.height = px(Math.max(0, Ht.at(t))); pn.style.transformOrigin = `${px(cx - x)} 0`;
      pop(pn, q, -6);
      cr.style.left = px(cx); cr.style.opacity = q.toFixed(3); cr.style.visibility = q < .01 ? 'hidden' : 'visible'; cr.style.transform = `translateY(${px((1 - q)*-6)}) rotate(45deg)`;
      sc.style.opacity = (.2*q).toFixed(3); sc.style.visibility = q < .01 ? 'hidden' : 'visible';
      mgSwapPanes(sw, panes.map(p => p.el), t, dir, 18);
      panes.forEach((p, k) => { p.el.inert = k !== sw.cur; if (k === sw.cur) mgStag($$(p.el, '.mg-lk, .mg8-sl, .mg8-fc, .mg8-code'), t, tEnter, .02, 5); p.plate.render(t); });
    };
  }});

/* ================================================================ 9. Command menu */
const MGC = [
  ['Go to', [['Editor', 'pen', ['G', 'E']], ['Members', 'users', ['G', 'M']], ['Commerce', 'bag', ['G', 'C']], ['Newsletters', 'mail', ['G', 'N']], ['Analytics', 'chart', ['G', 'A']]]],
  ['Create', [['New page', 'file', ['N', 'P']], ['New blog post', 'pen', ['N', 'B']], ['Invite a teammate', 'users', ['N', 'I']], ['New form', 'form', ['N', 'F']]]],
  ['Account', [['Switch workspace', 'globe', ['⌘', 'J']], ['Turn on dark mode', 'moon', ['⌘', '⇧', 'L']], ['Keyboard shortcuts', 'cmd', ['?']], ['Sign out', 'lock', ['⌘', '⇧', 'Q']]]]];

// command list: grouped rows with shortcuts, scope chips, live filter; shared by the desktop panel and the phone sheet
function mgCmdUI(host, uid, o){
  const GH = 30, RH = 44;
  host.innerHTML = `<div class="mg9-in"><span class="mg9-si">${mi('cmd', 18)}</span><input id="${uid}-q" class="mg9-q" type="text" role="combobox" aria-expanded="true" aria-controls="${uid}-lb" aria-autocomplete="list" aria-label="Command" placeholder="Type a command or search" autocomplete="off" spellcheck="false"><kbd class="mg9-k">esc</kbd></div>
    <div class="mg9-sg" role="group" aria-label="Show"><i class="mg9-sp"></i><button type="button" aria-pressed="true">All</button><button type="button" aria-pressed="false">Go to</button><button type="button" aria-pressed="false">Create</button><button type="button" aria-pressed="false">Account</button></div>
    <div class="mg9-lw"><div class="mg9-lb" role="listbox" id="${uid}-lb" aria-label="Commands"><i class="mg9-pl"></i></div><div class="mg9-em">No command matches “<span></span>”</div></div>
    <div class="mg9-fo"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> run</span><span><kbd>esc</kbd> close</span></div>`;
  const input = $(host, '.mg9-q'), lw = $(host, '.mg9-lw'), lb = $(host, '.mg9-lb'), pl = $(host, '.mg9-pl'), em = $(host, '.mg9-em'), sg = $(host, '.mg9-sg'), sp = $(host, '.mg9-sp'), chips = $$(sg, 'button');
  const ents = []; // { kind:'g'|'r', g, label, el }
  MGC.forEach(([gn, rows], g) => { const h = mx('div', 'mg9-g', gn); h.setAttribute('role', 'presentation'); lb.appendChild(h); ents.push({ kind:'g', g, label:gn, el:h });
    rows.forEach(([n, i0, ks]) => { const r = mx('div', 'mg9-r', `<span class="mg-ic">${mi(i0, 16)}</span><span class="mg9-lb2">${n}</span><span class="mg9-kk">${ks.map(k => `<kbd>${k}</kbd>`).join('')}</span>`); r.setAttribute('role', 'option'); r.id = `${uid}-o${ents.length}`; r.setAttribute('aria-selected', 'false'); lb.appendChild(r); ents.push({ kind:'r', g, label:n, el:r }); }); });
  const flow = mgFlow(lb, ents.map(e => e.el), ents.map(e => e.kind === 'g' ? GH : RH - 4)), ey = edges(0, 0), sx = edges(0, 0), emT = new Track(0, S.snap);
  let act = 0, scope = 0, vis = [], ys = [];
  const refilter = inst => {
    const toks = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean), pos = ents.map(() => null); vis = []; ys = []; let y = 0;
    MGC.forEach((_, g) => {
      const rows = ents.map((e, i) => ({ e, i })).filter(x => x.e.kind === 'r' && x.e.g === g && (!scope || scope === g + 1) && toks.every(k => (x.e.label + ' ' + MGC[g][0]).toLowerCase().includes(k)));
      if (!rows.length) return; const hi = ents.findIndex(e => e.kind === 'g' && e.g === g); if (y) y += 8; pos[hi] = y; y += GH;
      rows.forEach(x => { pos[x.i] = y; vis.push(x.i); ys.push(y); y += RH; }); });
    flow.place(pos, vis.length ? y : 88, inst);
    if (!vis.length){ $(em, 'span').textContent = input.value.trim(); emT.set(1, S.base, now() + EXIT + .05); } else emT.set(0, S.snap);
    setAct(clamp(act, 0, Math.max(0, vis.length - 1)), inst); };
  const setAct = (r, inst) => { act = r; ents.forEach(e => e.el.setAttribute('aria-selected', 'false'));
    if (!vis.length){ input.removeAttribute('aria-activedescendant'); pl.dataset.on = ''; return; } const el = ents[vis[r]].el; el.setAttribute('aria-selected', 'true'); input.setAttribute('aria-activedescendant', el.id);
    if (inst || !pl.dataset.on){ ey.jump(ys[r], ys[r] + RH - 4); pl.dataset.on = '1'; } else ey.go(ys[r], ys[r] + RH - 4);
    const top = ys[r], bot = ys[r] + RH; if (top - lw.scrollTop < 0) lw.scrollTop = Math.max(0, top - (r === 0 || ys[r - 1] < top - RH ? GH : 4)); else if (bot - lw.scrollTop > lw.clientHeight) lw.scrollTop = bot - lw.clientHeight + 4; };
  const run = r => { if (vis[r] != null) o.onRun(ents[vis[r]].label); };
  const setScope = (k, inst) => { scope = k; chips.forEach((b, j) => b.setAttribute('aria-pressed', j === k)); const b = chips[k]; if (inst) sx.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth); else sx.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); act = 0; lw.scrollTop = 0; refilter(inst); };
  chips.forEach((b, k) => b.addEventListener('click', () => setScope(k)));
  input.addEventListener('input', () => { act = 0; lw.scrollTop = 0; refilter(false); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown'){ e.preventDefault(); e.stopPropagation(); if (vis.length) setAct(Math.min(vis.length - 1, act + 1)); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); e.stopPropagation(); if (vis.length) setAct(Math.max(0, act - 1)); }
    else if (e.key === 'Enter'){ e.preventDefault(); run(act); }
    else if (e.key === 'Escape' && input.value){ e.preventDefault(); e.stopPropagation(); input.value = ''; act = 0; refilter(false); } });
  ents.forEach((e, i) => { if (e.kind !== 'r') return; e.el.addEventListener('pointermove', () => { const k = vis.indexOf(i); if (k >= 0 && k !== act) setAct(k); }); e.el.addEventListener('click', () => { const k = vis.indexOf(i); if (k >= 0) run(k); }); });
  const layout = () => { const b = chips[scope]; sx.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth); };
  refilter(true); layout();
  return { input, layout, setScope, get scope(){ return scope; }, reset(k = 0){ input.value = ''; act = 0; lw.scrollTop = 0; setScope(k, true); },
    render(t){ flow.render(t); const a = ey.A.at(t), b = ey.B.at(t); pl.style.transform = `translateY(${px(a)})`; pl.style.height = px(Math.max(0, b - a)); pl.style.opacity = vis.length ? '1' : '0';
      const l = sx.A.at(t), r = sx.B.at(t); sp.style.transform = `translateX(${px(l)})`; sp.style.width = px(Math.max(0, r - l));
      const q = clamp(emT.at(t)); fade(em, q, 0); em.style.visibility = q < .01 ? 'hidden' : 'visible'; } };
}

atom({ id:'mega-command', cat:'Mega menus', name:'Command menu', block:'Mega menu, site-header, Command palette', fam:['X','S','E'], wide:true, tall:true,
  html:`${MGCSS}<style>
.mg9-pn{position:absolute;z-index:30;top:76px;left:12px;right:12px;margin:0 auto;max-width:580px;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:hidden;visibility:hidden;transform-origin:50% 0}
.mg9-in{display:flex;align-items:center;gap:10px;height:54px;padding:0 16px 0 18px;border-bottom:1px solid var(--line-soft)}
.mg9-si{flex:none;display:flex;color:var(--muted)}
.mg9-q{flex:1;min-width:0;height:40px;border:0;background:none;color:var(--ink);font:16px var(--sans);outline:none;user-select:text;-webkit-user-select:text}
.mg9-q:focus-visible{outline:none}
.mg9-q::placeholder{color:var(--muted)}
.mg9-in:focus-within{box-shadow:inset 0 -2px 0 var(--ink)}
.mg9-pn kbd,.mg9-ms kbd,.mg9-cb2 kbd{font:500 11.5px var(--mono);padding:2px 7px;border-radius:6px;color:var(--muted);background:var(--card)}
.mg9-sg{position:relative;display:flex;gap:2px;margin:10px 14px 0;padding:3px;border-radius:10px;background:var(--raised);width:max-content;max-width:calc(100% - 28px)}
.mg9-sp{position:absolute;left:0;top:3px;bottom:3px;border-radius:7px;background:var(--card);box-shadow:var(--shadow)}
.mg9-sg button{position:relative;border:0;background:none;padding:5px 12px;border-radius:7px;font:500 13px var(--sans);color:var(--muted);cursor:pointer}
.mg9-sg button[aria-pressed="true"]{color:var(--ink)}
.mg9-lw{position:relative;max-height:316px;overflow-y:auto;overscroll-behavior:contain;margin-top:8px;padding:0 8px;scrollbar-width:thin}
.mg9-lb{position:relative}
.mg9-pl{position:absolute;left:0;right:0;top:0;height:40px;border-radius:10px;background:var(--raised);pointer-events:none}
.mg9-g{position:absolute;left:0;right:0;top:0;height:30px;padding:10px 10px 0;font-size:12px;font-weight:500;color:var(--muted)}
.mg9-r{position:absolute;left:0;right:0;top:0;height:40px;display:flex;align-items:center;gap:12px;padding:0 10px;border-radius:10px;cursor:pointer}
.mg9-r .mg-ic{width:30px;height:30px;border-radius:8px}
.mg9-lb2{flex:1;min-width:0;font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mg9-kk{flex:none;display:flex;gap:4px}
.mg9-em{position:absolute;left:0;right:0;top:0;height:88px;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--muted);visibility:hidden;pointer-events:none;padding:0 16px;text-align:center}
.mg9-em span{color:var(--ink);margin:0 4px 0 0}
.mg9-fo{display:flex;gap:18px;padding:10px 20px;margin-top:8px;background:var(--raised);font-size:12.5px;color:var(--muted)}
.mg9-fo span{display:inline-flex;gap:4px;align-items:center}
.mg9-cb2{flex:0 1 190px;margin-left:8px;height:36px;border:0;padding:1px 7px;background:var(--raised);color:var(--muted)}
.mg9-cb2 span{flex:1;text-align:left}
.mg9-mbtn{display:none}
.mg-w[data-n] .mg9-mbtn.mg-mb{display:inline-flex!important;align-items:center;gap:8px;height:40px;padding:0 15px;border:0;border-radius:10px;background:var(--raised);font:500 14px var(--sans);color:var(--ink);cursor:pointer}
.mg-w[data-n] .mg9-pn{display:none}
.mg9-ms{position:absolute;z-index:50;left:0;right:0;bottom:0;display:none;background:var(--card);border-radius:18px 18px 0 0;box-shadow:var(--shadow);visibility:hidden}
.mg-w[data-n] .mg9-ms{display:block}
.mg9-ms .mg9-k,.mg9-ms .mg9-kk,.mg9-ms .mg9-fo{display:none}
.mg9-ms .mg9-lw{max-height:360px}
.mg9-ms .mg9-fo2{display:flex;padding:8px 14px 14px}
.mg9-ms .mg9-fo2 button{flex:1}
.mg9-ms .mg9-r{height:40px}
.mg9-gp{width:36px;height:4px;border-radius:2px;background:var(--line);margin:8px auto 0}
</style><div class="mg-w">${mgPageHTML}<div class="mg-sc"></div>
<nav class="mg-bar" aria-label="Main (command menu)"><span class="mg-lgw">${mgLogo}</span><div class="mg-dt mg9-tr" style="display:flex;gap:2px"></div><span class="mg-sp"></span><button type="button" class="mg-t mg9-cb2 mg-dt" data-nr aria-expanded="false" aria-controls="mega-command-pn" aria-keyshortcuts="Meta+K Control+K">${mi('cmd', 15)}<span>Commands</span><kbd>⌘K</kbd><i class="mg-it"></i></button><a class="btn ink mg-cta mg-dt" href="#" data-go="Start free">Start free</a><button type="button" class="mg9-mbtn mg-mb" aria-haspopup="dialog" aria-expanded="false">${mi('cmd', 16)}Commands</button></nav>
<div class="mg9-pn card" id="mega-command-pn"></div>
<div class="mg9-ms" role="dialog" aria-label="Commands" aria-modal="true"><div class="mg9-gp" aria-hidden="true"></div><div class="mg9-mi"></div></div>
<div class="hint"><span class="mg-dt">Press ⌘K or Ctrl+K, or hover Go to, Create, Account. Type, arrow, Enter.</span><span class="mg-mb">Tap Commands. Escape closes the sheet.</span></div></div>`,
  desc:'Hover Go to, Create or Account waits 120 ms, then the palette opens already scoped to that group. Moving to another group keeps it open: rows that leave blur out in 100 ms, the rest slide into the gap, the group’s own rows arrive last. ⌘K or Ctrl+K opens it with the keyboard; the plate follows the arrow keys and Enter runs the command. On a phone it is a bottom sheet with touch-sized rows.',
  api:'scope.set(g) → rows.leave(o→0) → rows.stay(y→rank) → rows.enter(o→1)   ⌘K → open, focus input   Enter → run, close, focus trigger',
  init(st){
    const w = $(st, '.mg-w'), bar = $(w, '.mg-bar'), pn = $(w, '.mg9-pn'), sc = $(w, '.mg-sc'), tr = $(w, '.mg9-tr'), cb = $(w, '.mg9-cb2'), mbtn = $(w, '.mg9-mbtn'), ms = $(w, '.mg9-ms'), mi2 = $(w, '.mg9-mi');
    const page = mgPage(w); let ctl = null, narrow = false;
    const mk = n => { const b = mx('button', 'mg-t', n + ic(MGI.chev, 13) + '<i class="mg-it"></i>'); b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'mega-command-pn'); tr.appendChild(b); return b; };
    const trig = [mk('Go to'), mk('Create'), mk('Account'), cb], has = [true, true, true, true];
    const U = mgCmdUI(pn, 'mega-command-d', { onRun:nm => { page.go(nm); ctl.close(true); } });
    const M = mgCmdUI(mi2, 'mega-command-m', { onRun:nm => { page.go(nm); setM(false, true); } });
    const mo = new Track(0); let mOpen = false, mFoc = 0;
    const setM = (v, refocus, inst) => { if (v === mOpen && !inst) return; mOpen = v; mbtn.setAttribute('aria-expanded', v); ms.inert = !v; if (inst) mo.jump(v ? 1 : 0); else openSet(mo, v); if (v){ M.reset(0); mFoc = now() + .08; } else if (refocus) mbtn.focus(); };
    ms.inert = true; mbtn.addEventListener('click', () => setM(true));
    ms.addEventListener('keydown', e => { if (e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); setM(false, true); } });
    $(w, '.mg-sc').addEventListener('pointerdown', () => { if (mOpen) setM(false, false); });
    const o = new Track(0); let tEnter = 0;
    ctl = mgCtl({ st, w, bar, trig, has, hover:[true, true, true, false], zones:[pn], first:() => U.input,
      onOpen:(i, prev, how) => { const k = i < 3 ? i + 1 : 0; if (prev < 0){ U.reset(k); o.set(1); } else U.setScope(k); if (how !== 'hover') ctl.focusEl(U.input); },
      onClose:() => { o.set(0, S.snap); } });
    const toggle = e => { if (!((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) return; if (!(w.matches(':hover') || w.contains(document.activeElement))) return; e.preventDefault();
      if (narrow){ setM(!mOpen, true); return; } if (ctl.cur >= 0) ctl.close(true); else { ctl.open(3, 'key'); ctl.focusEl(U.input); } };
    document.addEventListener('keydown', toggle);
    mgPick(w, nm => { page.go(nm); });
    mgFit(st, w, (n, ch) => { narrow = n; if (ch){ ctl.close(false); o.jump(0); setM(false, false, true); } U.layout(); M.layout(); });
    document.fonts.ready.then(() => { U.layout(); M.layout(); });
    return t => {
      page.render(t);
      if (narrow){
        M.render(t); const q = clamp(mo.at(t)); ms.style.opacity = q.toFixed(3); ms.style.visibility = q < .01 ? 'hidden' : 'visible'; ms.style.transform = `translateY(${px((1 - q)*40)})`; ms.style.filter = q < .98 ? `blur(${((1 - q)*BLUR).toFixed(2)}px)` : 'none'; ms.style.pointerEvents = q > .5 ? 'auto' : 'none';
        sc.style.opacity = (.2*q).toFixed(3); sc.style.visibility = q < .01 ? 'hidden' : 'visible'; sc.style.pointerEvents = q > .5 ? 'auto' : 'none';
        if (mFoc && t >= mFoc){ mFoc = 0; M.input.focus(); }
        return; }
      ctl.tick(t); const q = clamp(o.at(t)); pop(pn, q, -6); sc.style.opacity = (.2*q).toFixed(3); sc.style.visibility = q < .01 ? 'hidden' : 'visible'; sc.style.pointerEvents = q > .5 ? 'auto' : 'none';
      U.render(t);
    };
  }});

/* ================================================================ 10. Drill-down menu */
atom({ id:'mega-drill', cat:'Mega menus', name:'Drill-down menu with back', block:'Mega menu, site-header (mobile), Navigation drawer', fam:['E','D','S','X'], wide:true, tall:true,
  html:`${MGCSS}<style>
.mg10-pn{position:absolute;z-index:30;top:76px;bottom:12px;right:12px;width:min(400px,calc(100% - 24px));display:flex;flex-direction:column;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:hidden;visibility:hidden;transform-origin:100% 0}
.mg-w[data-n] .mg10-pn{width:auto;left:12px}
.mg10-hd{position:relative;flex:none;height:52px;border-bottom:1px solid var(--line-soft)}
.mg10-bk{position:absolute;left:6px;top:6px;height:40px;display:flex;align-items:center;gap:2px;padding:0 10px 0 6px;border:0;border-radius:10px;background:none;font:500 14px var(--sans);color:var(--ink);cursor:pointer;z-index:2}
.mg10-bk span{position:relative;display:block;width:96px;height:20px;line-height:20px;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mg10-bk span i{position:absolute;left:0;top:0;font-style:normal}
.mg10-tt{position:absolute;left:112px;right:112px;top:0;height:52px}
.mg10-tt i{position:absolute;left:0;right:0;top:15px;font-style:normal;text-align:center;font-size:15px;font-weight:600;letter-spacing:-.01em;white-space:nowrap}
.mg10-st{position:relative;flex:1;min-height:0;overflow:hidden}
.mg10-lv{position:absolute;inset:0;overflow-y:auto;overscroll-behavior:contain;padding:8px 8px 14px;background:var(--card);will-change:transform}
.mg10-rw{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:52px;padding:8px 12px;border:0;border-radius:10px;background:none;font:500 16px var(--sans);color:var(--ink);text-align:left;cursor:pointer}
.mg10-rw:active{background:var(--raised)}
.mg10-rw svg{flex:none;color:var(--muted)}
.mg10-rt b{display:block;font-size:15px;font-weight:500}
.mg10-rt small{display:block;margin-top:1px;font-size:12.5px;line-height:1.35;color:var(--muted)}
.mg10-r0 .mg10-rw{font-size:17px;font-weight:600;letter-spacing:-.015em}
.mg10-all{color:var(--muted)}
.mg10-cb{display:flex;gap:8px;padding:14px 4px 0}
.mg10-cb a{flex:1;justify-content:center;margin:0}
.mg10-bl{margin:6px 12px 4px;font-size:12.5px;color:var(--muted)}
.mg-w[data-n] .mg10-tt{left:64px;right:64px}
.mg-w[data-n] .mg10-bk span{width:34px}
</style><div class="mg-w">${mgPageHTML}<div class="mg-sc"></div>
<nav class="mg-bar" aria-label="Main (drill-down)"><span class="mg-lgw">${mgLogo}</span><span class="mg-sp"></span><a class="btn ink mg-cta mg-dt" href="#" data-go="Start free">Start free</a><button type="button" class="mg-bg mg10-bg" style="display:block" aria-label="Open menu" aria-expanded="false" aria-controls="mega-drill-pn"><i></i><i></i><i></i><b class="mg-it" style="left:8px;right:8px;bottom:1px"></b></button></nav>
<div class="mg10-pn" id="mega-drill-pn" role="dialog" aria-label="Menu"><div class="mg10-hd"><button type="button" class="mg10-bk" aria-label="Back">${ic(MGI.chL, 18)}<span><i></i><i></i></span></button><div class="mg10-tt" aria-live="polite"><i>Menu</i><i></i></div></div><div class="mg10-st"></div></div>
<div class="hint"><span class="mg-dt">Hover the menu button for 120 ms, or click it. Drag from the left edge to go back.</span><span class="mg-mb">Tap a row to go in, Back to come out. Drag from the left edge to go back.</span></div></div>`,
  desc:'The menu button opens one panel (on hover after 120 ms, or on click). A row with a chevron pushes the next level in from the right while the current one slides back 30% and fades. The header title swaps in the direction of travel and the Back button fades in with the parent’s name. Back, Escape and a drag from the left edge all pop a level: the drag follows the finger 1:1 and settles from its release velocity.',
  api:'push: next.x.set(0), cur.x.set(−1)   header.to(title, dir)   back: reverse   drag: x.jump(dx/W) → release(v)',
  init(st){
    const w = $(st, '.mg-w'), bar = $(w, '.mg-bar'), pn = $(w, '.mg10-pn'), sc = $(w, '.mg-sc'), burger = $(w, '.mg10-bg'), stack = $(pn, '.mg10-st'), bk = $(pn, '.mg10-bk'), bkl = $$(bk, 'span i'), ttl = $$(pn, '.mg10-tt i');
    const page = mgPage(w), bars = $$(burger, 'i'); let narrow = false;
    const DESC = {}; Object.values(MGD).forEach(gs => gs.forEach(g => g.it.forEach(([t, d]) => { DESC[t] = d; })));
    const TREE = [
      { t:'Product', kids:[{ t:'Websites', kids:['Editor', 'Blocks', 'Themes', 'Forms'] }, { t:'Audience', kids:['Members', 'Commerce', 'Newsletters', 'Analytics'] }, { t:'Operations', kids:['Workflows', 'Roles', 'MCP access', 'Audit log'] }] },
      { t:'Solutions', kids:[{ t:'By team', kids:['Marketing', 'Editorial', 'Agencies', 'Education'] }, { t:'By site', kids:['Online stores', 'Member sites', 'Nonprofits', 'Event sites'] }] },
      { t:'Resources', kids:[{ t:'Learn', kids:['Guides', 'Changelog', 'Status'] }, { t:'Developers', kids:['API reference', 'Custom blocks', 'CLI', 'Webhooks'] }] },
      { t:'Pricing' },
      { t:'Company', kids:['About us', 'Customers', 'Press kit', 'Contact'] }];
    // one level per node that has children; level 0 is the root
    const levels = [];
    const build = (title, items, parent, depth) => {
      const L = { id:levels.length, title, parent, depth, el:mx('div', 'mg10-lv' + (depth === 0 ? ' mg10-r0' : '')), p:new Track(depth === 0 ? 0 : 1), t0:-9, from:null, rows:[] }; levels.push(L); stack.appendChild(L.el);
      let html = depth === 1 ? `<a class="mg10-rw mg10-all" href="#" data-go="Everything in ${title}"><span class="mg10-rt"><b>Everything in ${title}</b></span></a>` : '';
      const kidsOf = [];
      items.forEach(it => { const o = typeof it === 'string' ? { t:it } : it;
        if (o.kids){ html += `<button type="button" class="mg10-rw" aria-haspopup="true" data-k="${kidsOf.length}"><span class="mg10-rt"><b>${o.t}</b></span>${ic(MGI.chR, 18)}</button>`; kidsOf.push(o); }
        else html += `<a class="mg10-rw" href="#" data-go="${o.t}"><span class="mg10-rt"><b>${o.t}</b>${DESC[o.t] && depth > 1 ? `<small>${DESC[o.t]}</small>` : ''}</span></a>`; });
      if (depth === 0) html += `<div class="mg10-cb"><a class="btn mg-cta" href="#" data-go="Sign in">Sign in</a><a class="btn ink mg-cta" href="#" data-go="Start free">Start free</a></div>`;
      L.el.innerHTML = html; L.rows = $$(L.el, '.mg10-rw, .mg10-cb a');
      L.kids = kidsOf.map(o => build(o.t, o.kids, L, depth + 1));
      $$(L.el, 'button.mg10-rw').forEach(b => { const child = L.kids[+b.dataset.k]; b.addEventListener('click', e => { push(child, b, e.detail === 0); }); });
      return L; };
    build('Menu', TREE, null, 0);
    let path = [levels[0]], dir = 1, slot = 0, ctl = null; const sw = new Swap(0), bkO = new Track(0), o = new Track(0); ttl[0].textContent = 'Menu';
    const cur = () => path[path.length - 1];
    const sync = () => levels.forEach(L => { L.el.inert = L !== cur(); });
    const head = (title, back) => { slot = 1 - slot; ttl[slot].textContent = title; bkl[slot].textContent = narrow ? 'Back' : back; bk.setAttribute('aria-label', back ? 'Back to ' + back : 'Back'); sw.to(slot); };
    const push = (L, row, kb) => { const from = cur(); dir = 1; L.from = row; L.p.jump(1); L.p.set(0); from.p.set(-1); path.push(L); L.t0 = now() + .06; head(L.title, from.title === 'Menu' ? 'Menu' : from.title); bkO.set(1); sync(); ctl.focusEl(L.rows[0]); };
    const back = kb => { if (path.length < 2) return; const L = cur(), P = path[path.length - 2]; dir = -1; L.p.set(1); P.p.set(0); path.pop(); head(P.title, path.length > 1 ? path[path.length - 2].title : ''); bkO.set(path.length > 1 ? 1 : 0); sync(); if (L.from) setTimeout(() => L.from.focus(), 0); };
    bk.addEventListener('click', e => back(e.detail === 0));
    pn.addEventListener('keydown', e => { if (e.key === 'Escape' && path.length > 1){ e.preventDefault(); e.stopPropagation(); back(true); } });
    mgArrows(stack, () => { const b = bk; if (path.length > 1) b.focus(); });
    const reset = () => { levels.forEach((L, i) => L.p.jump(i === 0 ? 0 : 1)); path = [levels[0]]; mgReset(sw, 0); slot = 0; ttl[0].textContent = 'Menu'; ttl[1].textContent = ''; bkO.jump(0); sync(); };
    ctl = mgCtl({ st, w, bar, trig:[burger], has:[true], zones:[pn], skipHover:() => narrow, first:() => cur().rows[0],
      onOpen:() => { reset(); o.set(1); burger.setAttribute('aria-label', 'Close menu'); },
      onClose:() => { o.set(0, S.snap); burger.setAttribute('aria-label', 'Open menu'); } });
    mgPick(w, nm => { page.go(nm); ctl.close(true); });
    // drag from the left edge to go back: 1:1 while held, then settle from the release velocity
    let D = null; const W = () => stack.clientWidth || 1;
    stack.addEventListener('pointerdown', e => { if (e.button || path.length < 2) return; const r = stack.getBoundingClientRect(); if (e.clientX - r.left > 28) return; D = { x0:e.clientX, id:e.pointerId, on:false, s:[{ t:now(), x:e.clientX }] }; });
    stack.addEventListener('pointermove', e => { if (!D || e.pointerId !== D.id) return; const dx = e.clientX - D.x0; if (!D.on && dx > 6){ D.on = true; stack.setPointerCapture(e.pointerId); }
      if (D.on){ const f = clamp(dx / W()), L = cur(), P = path[path.length - 2]; L.p.jump(f); P.p.jump(f - 1); D.s.push({ t:now(), x:e.clientX }); if (D.s.length > 6) D.s.shift(); } });
    const end = e => { if (!D || e.pointerId !== D.id) return; const d = D; D = null; if (!d.on) return; const a = d.s[0], b = d.s[d.s.length - 1], v = (b.x - a.x) / Math.max(1e-3, b.t - a.t) / W(), L = cur(), P = path[path.length - 2], f = L.p.at();
      if (f > .35 || v > 1.2){ dir = -1; L.p.release(f, v, 1, S.base); P.p.release(f - 1, v, 0, S.base); path.pop(); head(P.title, path.length > 1 ? path[path.length - 2].title : ''); bkO.set(path.length > 1 ? 1 : 0); sync(); if (L.from) setTimeout(() => L.from.focus(), 0); }
      else { L.p.release(f, v, 0, S.base); P.p.release(f - 1, v, -1, S.base); } };
    stack.addEventListener('pointerup', end); stack.addEventListener('pointercancel', end);
    mgFit(st, w, (n, ch) => { narrow = n; if (ch){ ctl.close(false); o.jump(0); reset(); } });
    sync();
    return t => {
      page.render(t); ctl.tick(t); const q = clamp(o.at(t));
      if (narrow) pop(pn, q, -8); else mgPopX(pn, q, 10);
      sc.style.opacity = (.2*q).toFixed(3); sc.style.visibility = q < .01 ? 'hidden' : 'visible'; sc.style.pointerEvents = q > .5 ? 'auto' : 'none';
      bars[0].style.transform = `translateY(${px(6*q)}) rotate(${(45*q).toFixed(1)}deg)`; bars[1].style.opacity = (1 - q).toFixed(3); bars[1].style.transform = `scaleX(${(1 - q).toFixed(3)})`; bars[2].style.transform = `translateY(${px(-6*q)}) rotate(${(-45*q).toFixed(1)}deg)`;
      levels.forEach(L => { const p = L.p.at(t); L.el.style.transform = `translateX(${(p >= 0 ? p*100 : p*30).toFixed(2)}%)`; L.el.style.opacity = (p >= 0 ? 1 : clamp(1 + p*.7)).toFixed(3); L.el.style.visibility = Math.abs(p) > 1.001 || (p >= .999 && !D) ? 'hidden' : 'visible';
        if (L === cur() && L.t0 > -9) mgStag(L.rows, t, L.t0, .02, 6); });
      mgSwapPanes(sw, ttl, t, dir, 14); mgSwapPanes(sw, bkl, t, dir, 10);
      const b = clamp(bkO.at(t)); bk.style.opacity = b.toFixed(3); bk.style.visibility = b < .01 ? 'hidden' : 'visible'; bk.style.pointerEvents = b > .5 ? 'auto' : 'none'; bk.inert = b < .5;
    };
  }});

})();