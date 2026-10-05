

/* ================================================================ headers lane */
(() => {
/* ---------- shared kit: page, controls, account zone, call to action, menus ----------
   Every header atom is built from the same small kit so that sign-in state, the call to action
   variant, the account menu and the narrow-width menu behave identically everywhere. */
const HI = {
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>', plus:'<path d="M12 5v14M5 12h14"/>',
  grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  out:'<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>',
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 21h4"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
  book:'<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>',
  tag:'<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.4"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'
};
const NAV = ['Product','Pricing','Customers','Docs'];
const SUB = [['Invoicing','Send, track and remind'],['Payroll','Run it in four minutes'],['Reports','Cash flow at a glance']];
const MLINKS = [{ t:'Product', sub:SUB }, { t:'Pricing' }, { t:'Customers' }, { t:'Docs' }];
const LOGO = (name = 'Ledgerly') => `<a href="#" class="hx-lg" aria-label="${name} home"><i class="hx-mk"></i><span>${name}</span></a>`;
const BURGER = id => `<button type="button" class="hx-bg" aria-label="Open menu" aria-expanded="false" aria-controls="${id}"><i></i><i></i><i></i></button>`;
const STATS = `<div class="hx-fg" role="img" aria-label="Outstanding 12,480 dollars, paid this month 41,206 dollars, 3 overdue"><div><span>Outstanding</span><b>$12,480</b></div><div><span>Paid this month</span><b>$41,206</b></div><div><span>Overdue</span><b>3</b></div></div>`;
const PAGE = (top = 0, lead = '') => `<main class="hx-ar" style="padding-top:calc(36px + var(--hx-pt,${top}px))">${lead}<p class="small" style="margin:0 0 8px">Product \u00b7 5 minute read</p><h1>Get paid faster without chasing anyone</h1>
<p>Most small teams lose about nine days a month waiting on invoices. Ledgerly sends the reminder for you, at the right time, in your own words.</p>
<h2>Reminders that sound like you</h2><p>Write the message once. Ledgerly sends it three days before the due date, on the day, and the morning after, and it stops the moment the client pays.</p>${STATS}
<h2>Reconciled before you open the laptop</h2><p>Bank feeds match payments to invoices overnight. Whatever is left over lands in a short list you can clear with your coffee.</p><p>Every match shows the rule that made it, so an accountant can check the work in seconds instead of rebuilding it.</p>
<h2>Payroll that closes in four minutes</h2><p>Hours flow in from timesheets, taxes are filed for you, and everyone is paid on the day they expected to be.</p>${STATS}
<h2>Built for the person who also answers support</h2><p>There is no ledger jargon in the interface. Each screen tells you what needs a decision and what has already been handled.</p><p>Invite your accountant for free and they see exactly what you see, with their own notes.</p></main>`;
const SEG = (key, label, opts, aria) => `<div class="hx-cg" data-k="${key}"><span class="hx-cl">${label}</span><div class="seg" role="group" aria-label="${aria}"><div class="ind"></div>${opts.map(o => `<button type="button">${o}</button>`).join('')}</div></div>`;
const ctl = (c = {}) => `<div class="hx-ct">${SEG('auth','Account',['Signed out','Signed in'],'Account state')}${SEG('cta','Call to action',['Primary','Ghost','Link'],'Call to action style')}${c.align ? SEG('align', c.label || 'Links', c.align, 'Link alignment') : ''}${c.extra || ''}</div>`;
const shell = (pg, c, fr = '') => `<div class="hx"><div class="hx-fr"><div class="hx-pg" tabindex="0" aria-label="Scrollable sample page">${pg}</div>${fr}</div>${ctl(c)}</div>`;

document.head.insertAdjacentHTML('beforeend', `<style id="hx-shared">
.hx{position:absolute;inset:0;display:flex;flex-direction:column;gap:8px;padding:10px 12px;text-align:left;container-type:inline-size;font-size:14px}
.hx-fr{position:relative;flex:1;min-height:0;border:1px solid var(--line);border-radius:14px;background:var(--card);overflow:hidden;isolation:isolate}
.hx-pg{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-width:thin}
.hx-ct{flex:none;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center}
.hx-cg{display:flex;align-items:center;gap:7px}
.hx-cl{font-size:12px;color:var(--faint);white-space:nowrap}
@container (max-width:1000px){.hx-cl{display:none}}
.hx-ct .seg button{padding:4px 10px;font-size:12.5px}
.hx-ct .btn{padding:4px 10px;font-size:12.5px}
@container (max-width:420px){.hx-ct .seg button{padding:4px 8px}}
.hx-hd{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:12px;padding:0 20px;height:64px;background:var(--card)}
.hx-fr[data-n] .hx-hd{padding:0 12px}
.hx-ov{position:absolute;top:0;left:0;right:var(--sbw,0px);z-index:5}
.hx-bd{position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--hx-ln,var(--line));opacity:0;pointer-events:none}
.hx-sd{position:absolute;left:0;right:0;top:0;bottom:-1px;pointer-events:none;box-shadow:var(--shadow);opacity:0;z-index:-1}
.hx-lg{display:flex;align-items:center;gap:8px;flex:none;white-space:nowrap;font-weight:600;font-size:16px;letter-spacing:-.02em;color:var(--hx-fg,var(--ink));text-decoration:none;border-radius:8px}
.hx-mk{position:relative;width:22px;height:22px;border-radius:7px;background:var(--hx-fg,var(--ink));flex:none}
.hx-mk::after{content:"";position:absolute;left:5px;bottom:5px;width:6px;height:6px;border-radius:2px;background:var(--hx-bg,var(--card))}
.hx-l{position:relative;display:flex;align-items:center;height:36px;padding:0 11px;font-size:14px;font-weight:500;color:var(--hx-mu,var(--muted));text-decoration:none;white-space:nowrap;border-radius:8px}
.hx-ac{position:relative;height:var(--hx-h,36px);flex:none}
.hx-ol,.hx-il{position:absolute;right:0;top:0;bottom:0;display:flex;align-items:center;gap:6px;white-space:nowrap}
.hx-fr[data-n] .hx-ol{display:none}
.hx-si{height:36px;padding:0 10px;display:flex;align-items:center;border:0;background:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;color:var(--hx-mu,var(--muted));white-space:nowrap}
.hx-cta{height:var(--hx-h,36px);border-radius:9px;border:1px solid;font:500 14px var(--sans);cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;padding:0 14px;background:none;flex:none}
.hx-cta i{display:inline-flex;overflow:hidden;width:0;opacity:0}
.hx-cta.blk{width:100%;height:44px;padding:0;border-radius:10px}
.hx-av{width:calc(var(--hx-h,36px) - 2px);height:calc(var(--hx-h,36px) - 2px);border-radius:50%;border:1px solid var(--hx-ln,transparent);padding:0;background:var(--accent-tint);color:var(--accent);font:600 12px var(--sans);cursor:pointer;display:grid;place-items:center;flex:none}
.hx-ib{position:relative;width:36px;height:36px;border:0;border-radius:9px;background:none;display:grid;place-items:center;cursor:pointer;color:var(--hx-mu,var(--muted));flex:none}
.hx-ib b{position:absolute;top:7px;right:8px;width:8px;height:8px;border-radius:50%;background:var(--danger);box-shadow:0 0 0 2px var(--hx-bg,var(--card))}
.hx-bg{display:none;position:relative;width:36px;height:36px;border:0;background:none;cursor:pointer;flex:none;padding:0;border-radius:8px}
.hx-bg i{position:absolute;left:9px;top:17px;width:18px;height:2px;border-radius:1px;background:var(--hx-fg,var(--ink))}
.hx-fr[data-n] .hx-bg{display:block}
.hx-mn{position:absolute;width:232px;padding:6px;background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);visibility:hidden;z-index:30}
.hx-mh{display:flex;flex-direction:column;padding:8px 10px 10px;border-bottom:1px solid var(--line-soft);margin-bottom:4px;line-height:1.3}
.hx-mh b{font-size:14px}.hx-mh span{font-size:12.5px;color:var(--muted)}
.hx-mi{display:flex;width:100%;align-items:center;gap:10px;padding:8px 10px;border:0;background:none;border-radius:8px;font-size:14px;text-align:left;cursor:pointer;color:var(--ink)}
.hx-mi svg{color:var(--muted);flex:none}
.hx-sp{height:1px;background:var(--line-soft);margin:4px 2px}
.hx-pn{position:absolute;z-index:4;background:var(--card);visibility:hidden;overflow:hidden}
.hx-pn-drop{left:0;right:var(--sbw,0px);top:0;height:0;border-bottom:1px solid var(--line)}
.hx-pn-left,.hx-pn-right{top:0;bottom:0;z-index:20;border:1px solid var(--line);overflow-y:auto}
.hx-pn-left{left:0;border-width:0 1px 0 0}.hx-pn-right{right:0;border-width:0 0 0 1px}
.hx-sc{position:absolute;inset:0;z-index:19;background:color-mix(in oklab,var(--ink) 38%,transparent);visibility:hidden;opacity:0}
.hx-pi{padding:6px 20px 16px;display:flex;flex-direction:column}
.hx-fr[data-n] .hx-pi{padding-inline:16px}
.hx-ph{display:flex;align-items:center;justify-content:space-between;height:56px;margin-inline:-4px 0}
.hx-x{width:36px;height:36px;border:0;background:none;border-radius:8px;cursor:pointer;display:grid;place-items:center}
.hx-pl{display:flex;flex-direction:column}
.hx-ml{display:flex;align-items:center;justify-content:space-between;width:100%;padding:12px 0;border:0;border-bottom:1px solid var(--line-soft);background:none;font:600 20px/1.2 var(--sans);letter-spacing:-.02em;color:var(--ink);text-decoration:none;text-align:left;cursor:pointer}
.hx-ml i{display:grid;color:var(--muted)}
.hx-gs{overflow:hidden;height:0}
.hx-gi{display:flex;flex-direction:column;padding:4px 0 8px}
.hx-sl{display:flex;flex-direction:column;padding:8px 0;color:var(--ink);text-decoration:none;font-size:15px;line-height:1.3}
.hx-sl span{font-size:13px;color:var(--muted)}
.hx-mf{position:relative;height:64px;margin-top:12px;flex:none}
.hx-fo,.hx-fi{position:absolute;inset:0;display:flex;align-items:center;gap:8px}
.hx-fo>*{flex:1;min-width:0}
.hx-sb{height:44px;border-radius:10px;border:1px solid var(--line);background:var(--card);font:500 14px var(--sans);cursor:pointer;padding:0 14px;color:var(--ink)}
.hx-fi .hx-av{width:40px;height:40px;cursor:default}
.hx-fn{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.3}
.hx-fn b{font-size:14px}.hx-fn span{font-size:12.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hx-ar{max-width:720px;margin:0 auto;padding:36px 24px 90px;line-height:1.6}
.hx-ar h1{font-size:clamp(26px,4cqi,38px);line-height:1.08;letter-spacing:-.035em;margin:0 0 16px;font-weight:600;text-wrap:balance}
.hx-ar h2{font-size:20px;letter-spacing:-.02em;margin:34px 0 8px;font-weight:600}
.hx-ar p{margin:0 0 12px;color:var(--muted)}
.hx-fg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:16px 0}
.hx-fg div{background:var(--raised);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:2px;min-width:0}
.hx-fg span{font-size:12.5px;color:var(--muted)}.hx-fg b{font-size:22px;letter-spacing:-.03em;font-weight:600;font-variant-numeric:tabular-nums}
.hx-ro{position:absolute;right:10px;bottom:8px;z-index:6;font-size:12px;color:var(--faint);pointer-events:none;height:20px;width:230px}
.hx-ro span{position:absolute;right:0;top:0;white-space:nowrap}
</style>`);

const hxSeg = (root, start, onPick) => {
  const ind = $(root,'.ind'), btns = $$(root,'button'), ex = edges(0,0), ey = edges(0,0); let cur = start;
  const geo = inst => { const b = btns[cur], f = inst ? 'jump' : 'go'; ex[f](b.offsetLeft, b.offsetLeft + b.offsetWidth); ey[f](b.offsetTop, b.offsetTop + b.offsetHeight); };
  const pick = (i, inst, quiet) => { cur = i; btns.forEach((b,j) => b.setAttribute('aria-pressed', j === i)); geo(inst); if (!quiet) onPick(i); };
  btns.forEach((b,i) => b.onclick = () => pick(i));
  pick(start, true, true); new ResizeObserver(() => geo(true)).observe(root); document.fonts.ready.then(() => geo(true));
  return { pick:(i, inst) => pick(i, inst, true),
    draw(t){ const a = ex.A.at(t), b = ex.B.at(t), c = ey.A.at(t), d = ey.B.at(t); ind.style.transform = `translate(${px(a)},${px(c)})`; ind.style.width = px(b - a); ind.style.height = px(d - c); } };
};
const VT = [[1,1,1,0],[0,1,1,0],[0,0,0,1]];

function kit(st, o = {}){
  const fr = $(st,'.hx-fr'), pg = $(st,'.hx-pg');
  const K = { st, fr, pg, signed:false, variant:0, align:o.align0 ?? 0, narrow:null, bp:o.bp ?? 640, onNarrow:[], onSigned:[], onAlign:[], escs:[], menuOpen:false, sw:new Swap('out') };
  const au = new Track(0), vt = VT[0].map(v => new Track(v)), sw = K.sw;
  const ctas = [], hovers = [], acts = [], avs = [], panels = [], foots = [], segs = {}, extra = [];
  K.sc = new Track(0, S.snap); K.au = au;
  pg.addEventListener('scroll', () => { const y = pg.scrollTop; if (y > 12) K.sc.set(1); else if (y < 4) K.sc.set(0); });
  K.below = el => el.getBoundingClientRect().bottom - fr.getBoundingClientRect().top - fr.clientTop;
  K.watch = (el, fn) => { new ResizeObserver(fn).observe(el); document.fonts.ready.then(fn); };

  // hover / focus colour as a spring instead of a CSS state
  K.hover = (el, kind = 'color', a = 'var(--hx-fg,var(--ink))', b = 'var(--hx-mu,var(--muted))') => {
    const h = new Track(0, S.snap), cu = new Track(0, S.base), on = () => h.set(1), off = () => h.set(0);
    el.addEventListener('pointerenter', on); el.addEventListener('pointerleave', off); el.addEventListener('focus', on); el.addEventListener('blur', off);
    hovers.push({ el, h, cu, kind, a, b }); return { h, cu };
  };
  K.link = a => { const x = K.hover(a); return { a, h:x.h, cu:x.cu, setCur(v){ x.cu.set(v ? 1 : 0); } }; };

  // call to action: one element that morphs between primary, ghost and link
  K.cta = (label, block) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'hx-cta' + (block ? ' blk' : ''); b.innerHTML = `<span>${label}</span><i>${ic(HI.arrow,14,2)}</i>`;
    const pr = new Track(0, S.snap), hh = new Track(0, S.snap);
    b.addEventListener('pointerdown', () => pr.set(1)); ['pointerup','pointerleave','pointercancel'].forEach(e => b.addEventListener(e, () => pr.set(0)));
    b.addEventListener('pointerenter', () => hh.set(1)); b.addEventListener('pointerleave', () => hh.set(0));
    ctas.push({ b, block, pr, hh, ar:$(b,'i') }); return b;
  };
  K.setVariant = i => { K.variant = i; VT[i].forEach((v,j) => vt[j].set(v)); segs.cta && segs.cta.pick(i); };

  // account zone: signed-out layer and signed-in layer share one container that morphs between their widths
  K.acts = (host, c = {}) => {
    host.innerHTML = `<div class="hx-ol"><button type="button" class="hx-si">Sign in</button></div><div class="hx-il">${c.bell ? `<button type="button" class="hx-ib" aria-label="Notifications, 2 unread">${ic(HI.bell,18,1.8)}<b></b></button>` : ''}<button type="button" class="hx-av" aria-haspopup="menu" aria-expanded="false" aria-label="Account menu, Maya Rios"><span>MR</span></button></div>`;
    const ol = $(host,'.hx-ol'), il = $(host,'.hx-il'), si = $(ol,'.hx-si'); ol.appendChild(K.cta(c.cta || 'Start free'));
    K.hover(si); si.onclick = () => { K.setSigned(true); setTimeout(() => $(il,'.hx-av').focus(), 0); };
    K.bindAvatar($(il,'.hx-av'));
    const bell = $(il,'.hx-ib'); let dot = null; if (bell){ const d = $(bell,'b'), dt = new Track(1, S.snap); dot = { d, dt }; K.hover(bell,'bg','var(--raised)'); bell.onclick = () => { dt.set(dt.target ? 0 : 1); bell.setAttribute('aria-label', dt.target ? 'Notifications, 2 unread' : 'Notifications'); }; extra.push(t => { d.style.transform = `scale(${clamp(dt.at(t)).toFixed(3)})`; }); }
    acts.push({ host, ol, il }); return host;
  };
  K.foot = host => {
    host.innerHTML = `<div class="hx-fo"><button type="button" class="hx-sb">Sign in</button></div><div class="hx-fi"><span class="hx-av" aria-hidden="true"><span>MR</span></span><span class="hx-fn"><b>Maya Rios</b><span>maya@brightleaf.example</span></span><button type="button" class="hx-sb">Sign out</button></div>`;
    const fo = $(host,'.hx-fo'), fi = $(host,'.hx-fi'); fo.appendChild(K.cta('Start free', true));
    $(fo,'.hx-sb').onclick = () => K.setSigned(true); $(fi,'.hx-sb').onclick = () => K.setSigned(false);
    foots.push({ fo, fi });
  };

  K.setSigned = v => { if (K.signed === v) return; K.signed = v; au.set(v ? 1 : 0); sw.to(v ? 'in' : 'out'); segs.auth && segs.auth.pick(v ? 1 : 0); closeMenu(); K.onSigned.forEach(f => f(v)); };

  // account menu popover (shared)
  const mn = document.createElement('div'); mn.className = 'hx-mn'; mn.setAttribute('role','menu'); mn.setAttribute('aria-label','Account');
  const MI = [['Dashboard',HI.grid],['Invoices',HI.receipt],['Account settings',HI.gear],null,['Sign out',HI.out]];
  mn.innerHTML = `<div class="hx-mh"><b>Maya Rios</b><span>maya@brightleaf.example</span></div>` + MI.map(m => m ? `<button type="button" role="menuitem" class="hx-mi" tabindex="-1">${ic(m[1],16,1.8)}<span>${m[0]}</span></button>` : '<div class="hx-sp" role="separator"></div>').join('');
  fr.appendChild(mn);
  const mis = $$(mn,'.hx-mi').map(el => ({ el, o:new Track(0), h:K.hover(el,'bg','var(--raised)','transparent').h }));
  const mo = new Track(0); let mBtn = null;
  const placeMenu = btn => { const r = relRect(fr, btn.getBoundingClientRect()), W = 232, H = mn.offsetHeight, FW = fr.clientWidth, FH = fr.clientHeight;
    const side = typeof o.menuSide === 'function' ? o.menuSide(btn) : o.menuSide; let x = r.x + r.w - W, y = r.y + r.h + 8; if (side){ x = r.x + r.w + 8; y = r.y + r.h - H; }
    mn.style.left = px(clamp(x, 8, Math.max(8, FW - W - 8))); mn.style.top = px(clamp(y, 8, Math.max(8, FH - H - 8))); mn.style.transformOrigin = side ? '0 100%' : '100% 0'; };
  function closeMenu(focus){ if (!K.menuOpen) return; K.menuOpen = false; mo.set(0, S.snap); avs.forEach(a => a.setAttribute('aria-expanded', 'false')); mis.forEach(m => m.o.set(0, S.snap)); if (focus && mBtn) mBtn.focus(); mBtn = null; }
  const openMenu = btn => { if (K.menuOpen && mBtn === btn) return closeMenu(true); mBtn = btn; K.menuOpen = true; placeMenu(btn); mn.style.visibility = 'visible'; mo.set(1); const t0 = now(); avs.forEach(a => a.setAttribute('aria-expanded', a === btn)); mis.forEach((m,i) => m.o.set(1, S.base, t0 + .04 + i*.03)); setTimeout(() => mis[0].el.focus(), 0); };
  K.bindAvatar = btn => { avs.push(btn); btn.addEventListener('click', () => openMenu(btn)); btn.addEventListener('keydown', e => { if (e.key === 'ArrowDown'){ e.preventDefault(); if (!K.menuOpen || mBtn !== btn) openMenu(btn); } }); };
  mn.addEventListener('keydown', e => { const i = mis.findIndex(m => m.el === document.activeElement);
    if (e.key === 'ArrowDown'){ e.preventDefault(); mis[(i + 1) % mis.length].el.focus(); } else if (e.key === 'ArrowUp'){ e.preventDefault(); mis[(i - 1 + mis.length) % mis.length].el.focus(); }
    else if (e.key === 'Home'){ e.preventDefault(); mis[0].el.focus(); } else if (e.key === 'End'){ e.preventDefault(); mis[mis.length - 1].el.focus(); }
    else if (e.key === 'Tab') closeMenu(); });
  mis.forEach((m,i) => m.el.addEventListener('click', () => { if (i === mis.length - 1){ const b = mBtn; K.setSigned(false); setTimeout(() => { const f = K.narrow ? $(st,'.hx-bg') : $(st,'.hx-si'); if (f && f.offsetParent) f.focus(); }, 0); return; } closeMenu(true); }));
  st.addEventListener('pointerdown', e => { if (K.menuOpen && !mn.contains(e.target) && !e.target.closest('[aria-haspopup="menu"]')) closeMenu(); });
  pg.addEventListener('scroll', () => closeMenu());
  K.escs.push(() => { if (!K.menuOpen) return false; closeMenu(true); return true; });
  K.closeMenu = closeMenu;

  // staggered link list with optional accordion groups (used by every narrow-width menu)
  K.items = (host, links) => {
    const items = [], groups = [];
    links.forEach(l => {
      if (!l.sub){ const a = document.createElement('a'); a.href = '#'; a.className = 'hx-ml'; a.textContent = l.t; host.appendChild(a); items.push({ el:a, o:new Track(0) }); return; }
      const g = document.createElement('div'); g.innerHTML = `<button type="button" class="hx-ml" aria-expanded="false"><span>${l.t}</span><i>${ic(I.chev,18)}</i></button><div class="hx-gs"><div class="hx-gi">${l.sub.map(([a,b]) => `<a href="#" class="hx-sl"><b>${a}</b><span>${b}</span></a>`).join('')}</div></div>`;
      host.appendChild(g); const gb = $(g,'button'), gs = $(g,'.hx-gs'), gi = $(g,'.hx-gi'), subs = $$(gi,'a').map(el => ({ el, o:new Track(0) }));
      const grp = { gb, gs, gi, subs, h:new Track(0), r:new Track(0), open:false, chev:$(gb,'i') };
      gb.onclick = () => { grp.open = !grp.open; gb.setAttribute('aria-expanded', grp.open); grp.h.set(grp.open ? 1 : 0); grp.r.set(grp.open ? 1 : 0); const t0 = now();
        subs.forEach((s,j) => grp.open ? s.o.set(1, S.base, t0 + .06 + j*.04) : s.o.set(0, S.snap, t0)); };
      groups.push(grp); items.push({ el:g, o:new Track(0) });
    });
    return { items, groups, host,
      show(v, inst){ const t0 = now(); items.forEach((x,i) => inst ? x.o.jump(v ? 1 : 0) : v ? x.o.set(1, S.base, t0 + .08 + i*.04) : x.o.set(0, S.snap, t0)); if (!v) groups.forEach(g => { g.open = false; g.gb.setAttribute('aria-expanded','false'); g.h.set(0, S.snap); g.r.set(0, S.snap); g.subs.forEach(s => s.o.set(0, S.snap)); }); },
      draw(t){ items.forEach(x => { const p = clamp(x.o.at(t)); fade(x.el, p, (1 - p)*8); });
        groups.forEach(g => { g.gs.style.height = px(clamp(g.h.at(t))*g.gi.offsetHeight); g.chev.style.transform = `rotate(${(180*clamp(g.r.at(t))).toFixed(1)}deg)`; g.subs.forEach(s => { const p = clamp(s.o.at(t)); fade(s.el, p, (1 - p)*4); }); }); } };
  };
  K.burgerDraw = (btn, p) => { const l = $$(btn,'i'); l[0].style.transform = `translateY(${px(-6 + 6*p)}) rotate(${(45*p).toFixed(2)}deg)`; l[1].style.opacity = (1 - p).toFixed(3); l[2].style.transform = `translateY(${px(6 - 6*p)}) rotate(${(-45*p).toFixed(2)}deg)`; };

  // narrow-width menu: drop (height morph under the header), left or right drawer over a scrim
  K.panel = c => {
    const mode = c.mode || 'drop', el = document.createElement('nav'), o2 = new Track(0); let open = false;
    el.id = c.id; el.className = 'hx-pn hx-pn-' + mode; el.setAttribute('aria-label','Menu');
    el.innerHTML = `<div class="hx-pi">${mode !== 'drop' ? `<div class="hx-ph">${LOGO()}<button type="button" class="hx-x" aria-label="Close menu">${ic(I.x,18)}</button></div>` : ''}<div class="hx-pl"></div><div class="hx-mf"></div>${c.extra || ''}</div>`;
    const pi = $(el,'.hx-pi'), L = K.items($(el,'.hx-pl'), c.links), sc = document.createElement('div'); sc.className = 'hx-sc'; fr.appendChild(sc); fr.appendChild(el); K.foot($(el,'.hx-mf'));
    const bg = c.burger; bg && bg.setAttribute('aria-controls', c.id);
    L.items.push({ el:$(el,'.hx-mf'), o:new Track(0) });
    const set = (v, inst, focus) => { if (v === open) return; open = v; if (v) closeMenu(); if (v) el.style.visibility = 'visible'; K.panelOpen = panels.some(p => p.open());
      bg && (bg.setAttribute('aria-expanded', v), bg.setAttribute('aria-label', v ? 'Close menu' : 'Open menu'));
      if (inst) o2.jump(v ? 1 : 0); else v ? o2.set(1) : o2.set(0, S.snap); L.show(v, inst);
      if (v) setTimeout(() => $(el,'.hx-ml').focus(), 0); else if (focus && bg) bg.focus(); c.onToggle && c.onToggle(v); };
    bg && (bg.onclick = () => set(!open, false, true));
    $$(el,'.hx-ml:not(button), .hx-sl').forEach(a => a.onclick = e => { e.preventDefault(); set(false, false, true); });
    const x = $(el,'.hx-x'); x && (x.onclick = () => set(false, false, true)); sc.onclick = () => set(false, false, true);
    K.escs.push(() => { if (!open) return false; set(false, false, true); return true; });
    const P = { el, open:() => open, close:(inst) => set(false, inst), set,
      draw(t){ const p = clamp(o2.at(t)), vis = p > .01 || open; el.style.visibility = vis ? 'visible' : 'hidden'; el.style.pointerEvents = p > .5 ? 'auto' : 'none'; bg && K.burgerDraw(bg, p);
        if (mode === 'drop'){ const top = c.top(), H = Math.max(0, Math.min(pi.offsetHeight, fr.clientHeight - top)); el.style.top = px(top); el.style.height = px(p*H); el.style.overflowY = p > .99 ? 'auto' : 'hidden'; el.style.boxShadow = p > .2 ? 'var(--shadow)' : 'none'; el.style.borderBottomWidth = p > .01 ? '1px' : '0'; }
        else { const W = Math.min(320, fr.clientWidth*.86); el.style.width = px(W); el.style.transform = `translateX(${px((mode === 'right' ? 1 : -1)*(1 - p)*W)})`; sc.style.opacity = p.toFixed(3); sc.style.visibility = vis ? 'visible' : 'hidden'; sc.style.pointerEvents = p > .5 ? 'auto' : 'none'; }
        L.draw(t); } };
    panels.push(P); return P;
  };

  // links that slide inside their box when the alignment option changes
  K.slider = (box, g, vals = [0, .5, 1]) => { const a = new Track(vals[K.align] ?? 0); K.onAlign.push(i => a.set(vals[i])); return () => g.style.transform = `translateX(${px(a.at(now()) * Math.max(0, box.clientWidth - g.offsetWidth))})`; };

  // controls
  $$(st,'.hx-cg').forEach(g => { const k = g.dataset.k, i0 = k === 'align' ? K.align : 0;
    segs[k] = hxSeg($(g,'.seg'), i0, i => { if (k === 'auth') K.setSigned(i === 1); else if (k === 'cta') K.setVariant(i); else if (k === 'align'){ K.align = i; K.onAlign.forEach(f => f(i)); } else if (o.onExtra) o.onExtra(k, i); }); });
  st.addEventListener('keydown', e => { if (e.key === 'Escape') for (const f of K.escs) if (f()){ e.stopPropagation(); break; } });

  K.measure = () => { fr.toggleAttribute('data-m', fr.clientWidth < (o.mid || 0)); const n = fr.clientWidth < K.bp; if (n !== K.narrow){ const was = K.narrow; K.narrow = n; fr.toggleAttribute('data-n', n); closeMenu(); if (!n) panels.forEach(p => p.close(true)); K.onNarrow.forEach(f => f(n, was)); } };
  K.measure();
  K.draw = t => {
    K.measure(); const s = pg.offsetWidth - pg.clientWidth; if (s !== K._s){ K._s = s; fr.style.setProperty('--sbw', s + 'px'); }
    for (const k in segs) segs[k].draw(t);
    for (const x of hovers){ const p = Math.max(clamp(x.h.at(t)), clamp(x.cu.at(t))); if (x.kind === 'color') x.el.style.color = mix(p, x.a, x.b); else x.el.style.background = mix(p, x.a, 'transparent'); }
    const f = clamp(vt[0].at(t)), bo = clamp(vt[1].at(t)), pd = clamp(vt[2].at(t)), ar = clamp(vt[3].at(t));
    for (const c of ctas){ const s2 = c.b.style, hh = clamp(c.hh.at(t)); s2.background = `color-mix(in oklab, var(--hx-fg,var(--ink)) ${(f*100).toFixed(1)}%, transparent)`; s2.color = mix(f, 'var(--hx-bg,var(--card))', 'var(--hx-fg,var(--ink))');
      s2.borderColor = `color-mix(in oklab, var(--hx-fg,var(--ink)) ${(f*100).toFixed(1)}%, color-mix(in oklab, var(--hx-ln,var(--line)) ${(bo*100).toFixed(1)}%, transparent))`;
      if (!c.block) s2.paddingInline = px(lerp(2, 14, pd)); c.ar.style.width = px(14*ar); c.ar.style.opacity = ar.toFixed(3); c.ar.style.marginLeft = px(6*ar); c.ar.style.transform = `translateX(${px(3*hh*ar)})`; s2.transform = `scale(${(1 - .03*clamp(c.pr.at(t))).toFixed(4)})`; }
    const k = clamp(au.at(t));
    for (const a of acts){ a.host.style.width = px(lerp(a.ol.offsetWidth, a.il.offsetWidth, k)*(1 - (K.accFold || 0))); a.host.style.overflow = K.accFold > 0 ? 'hidden' : ''; sw.apply(a.ol, 'out', t, 6); sw.apply(a.il, 'in', t, 6); }
    for (const x of foots){ sw.apply(x.fo, 'out', t, 6); sw.apply(x.fi, 'in', t, 6); }
    extra.forEach(f2 => f2(t));
    for (const p of panels) p.draw(t);
    const mp = clamp(mo.at(t)); pop(mn, mp, -6); mn.style.visibility = mp < .01 && !K.menuOpen ? 'hidden' : 'visible'; mis.forEach(m => { const q = clamp(m.o.at(t)); fade(m.el, q, (1 - q)*4); });
  };
  return K;
}

/* ================================================================ 1. spread */
atom({ id:'header-spread', cat:'Headers', name:'Header: logo, links, call to action', block:'site-header (layout spread), nav-menu, cta-button', fam:['E','M','S','X'], wide:true, tall:true,
  html:`<style>
.hd1-hd{gap:16px}
.hd1-nv{position:relative;flex:1;min-width:0;height:36px}
.hd1-ls{position:absolute;left:0;top:0;display:flex;gap:2px;height:36px}
.hd1-ul{position:absolute;left:0;bottom:2px;height:2px;border-radius:1px;background:var(--ink)}
.hx-fr[data-n] .hd1-nv{display:none}
.hx-fr[data-n] .hd1-hd .hx-ac{margin-left:auto}
</style>` + shell(`<header class="hx-hd hd1-hd"><i class="hx-bd"></i>${LOGO()}<nav class="hd1-nv" aria-label="Main"><div class="hd1-ls"><i class="hd1-ul"></i></div></nav><div class="hx-ac"></div>${BURGER('hd1-menu')}</header>${PAGE()}`, { align:['Left','Center','Right'] }),
  desc:'Click a link and the underline slides to it, the leading edge first and the trailing edge 60ms behind. Change the alignment and the link group glides across the free space between logo and actions. Sign in morphs the account zone: the width springs to the avatar while the buttons blur out and the avatar blurs in. Narrow: the burger becomes a cross, a drawer slides in from the right over a dimmed page, then each link enters 40ms after the last and Product opens as an accordion.',
  api:'underline.go(l, r)   links.x.set(align \u00d7 freeSpace)   acts.w.set(signed ? avatar : buttons)   drawer.x.set(0)   link[i].o.set(1, S.base, t + .08 + i\u00b7.04)',
  init(st){
    const K = kit(st, { bp:640, align0:1 }), nv = $(st,'.hd1-nv'), ls = $(st,'.hd1-ls'), ul = $(st,'.hd1-ul'), bd = $(st,'.hx-bd');
    K.acts($(st,'.hx-ac'));
    const links = NAV.map(n => { const a = document.createElement('a'); a.href = '#'; a.className = 'hx-l'; a.textContent = n; ls.appendChild(a); return K.link(a); });
    const u = edges(0,0); let cur = 1; const g = a => [a.offsetLeft + 11, a.offsetLeft + a.offsetWidth - 11];
    const setCur = (i, inst) => { cur = i; links.forEach((l,j) => { l.setCur(j === i); j === i ? l.a.setAttribute('aria-current','page') : l.a.removeAttribute('aria-current'); }); const [l,r] = g(links[i].a); inst ? u.jump(l, r) : u.go(l, r); };
    links.forEach((l,i) => l.a.onclick = e => { e.preventDefault(); setCur(i); }); setCur(1, true); K.watch(ls, () => setCur(cur, true));
    const slide = K.slider(nv, ls);
    K.panel({ id:'hd1-menu', mode:'right', burger:$(st,'.hx-bg'), links:MLINKS });
    return t => { bd.style.opacity = clamp(K.sc.at(t)).toFixed(3); const a = u.A.at(t), b = u.B.at(t); ul.style.transform = `translateX(${px(a)})`; ul.style.width = px(b - a); slide(); K.draw(t); };
  }});

/* ================================================================ 2. centered logo, split links */
atom({ id:'header-split', cat:'Headers', name:'Header: logo centered, links split', block:'site-header (layout split), nav-menu (slice first-half, second-half)', fam:['M','E','S'], wide:true, tall:true,
  html:`<style>
.hd2-hd{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:16px}
.hd2-l,.hd2-r{display:flex;align-items:center;min-width:0;gap:10px}
.hd2-r{justify-content:flex-end}
.hd2-n{position:relative;flex:1;min-width:0;height:36px}
.hd2-g{position:absolute;left:0;top:0;display:flex;gap:2px;height:36px}
.hd2-u{position:absolute;left:11px;right:11px;bottom:3px;height:2px;border-radius:1px;background:var(--ink);transform:scaleX(0)}
.hx-fr[data-n] .hd2-n{display:none}
.hx-fr[data-n] .hd2-hd{padding:0 8px;gap:8px}
</style>` + shell(`<header class="hx-hd hd2-hd"><i class="hx-bd"></i><div class="hd2-l">${BURGER('hd2-menu')}<nav class="hd2-n" aria-label="Main, first half"><div class="hd2-g"></div></nav></div>${LOGO()}<div class="hd2-r"><nav class="hd2-n" aria-label="Main, second half"><div class="hd2-g"></div></nav><div class="hx-ac"></div></div></header>${PAGE()}`, { align:['Hug logo','Edges'], label:'Links', extra:'' }),
  desc:'The logo stays optically centered while the links split around it. Hover grows a short underline from each link\u2019s center; click widens it to a full underline on the same spring. The alignment option slides each half toward the logo or toward the edges, using whatever room is left after the account zone morphs. Narrow: burger on the left, logo centered, and the menu opens as a dropdown whose height morphs open under the header with links entering in order.',
  api:'half.x.set(align \u00d7 (box \u2212 links))   underline.scaleX = max(current, .4 \u00d7 hover)   panel.h.set(natural)',
  init(st){
    const K = kit(st, { bp:790, align0:0 }), [nl, nr] = $$(st,'.hd2-n'), [gl, gr] = $$(st,'.hd2-g'), hd = $(st,'.hd2-hd'), bd = $(st,'.hx-bd');
    K.acts($(st,'.hx-ac')); const items = [];
    const mk = (g, names, off) => names.forEach((n, i) => { const a = document.createElement('a'); a.href = '#'; a.className = 'hx-l'; a.innerHTML = `${n}<i class="hd2-u"></i>`; g.appendChild(a); const l = K.link(a); items.push({ ...l, u:$(a,'.hd2-u'), i:off + i }); });
    mk(gl, ['Product','Pricing'], 0); mk(gr, ['Customers','Docs'], 2);
    let cur = 1; const setCur = i => { cur = i; items.forEach(l => { l.setCur(l.i === i); l.i === i ? l.a.setAttribute('aria-current','page') : l.a.removeAttribute('aria-current'); }); };
    items.forEach(l => l.a.onclick = e => { e.preventDefault(); setCur(l.i); }); setCur(1);
    const sl = K.slider(nl, gl, [1, 0]), sr = K.slider(nr, gr, [0, 1]);
    K.panel({ id:'hd2-menu', mode:'drop', burger:$(st,'.hx-bg'), top:() => K.below(hd), links:MLINKS });
    return t => { bd.style.opacity = clamp(K.sc.at(t)).toFixed(3); sl(); sr(); items.forEach(l => l.u.style.transform = `scaleX(${Math.max(clamp(l.cu.at(t)), .4*clamp(l.h.at(t))).toFixed(3)})`); K.draw(t); };
  }});

/* ================================================================ 3. links left, logo center, actions right */
atom({ id:'header-three', cat:'Headers', name:'Header: links, logo centered, actions', block:'site-header (layout split), nav-menu, cta-button, account menu', fam:['M','S','X'], wide:true, tall:true,
  html:`<style>
.hd3-hd{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:16px}
.hd3-l,.hd3-r{display:flex;align-items:center;min-width:0;gap:6px}
.hd3-r{justify-content:flex-end}
.hd3-n{position:relative;flex:1;min-width:0;height:36px}
.hd3-g{position:absolute;left:0;top:0;display:flex;gap:2px;height:36px}
.hx-fr[data-n] .hd3-n{display:none}
.hx-fr[data-n] .hd3-hd{padding:0 8px;gap:8px}
</style>` + shell(`<header class="hx-hd hd3-hd"><i class="hx-bd"></i><div class="hd3-l">${BURGER('hd3-menu')}<nav class="hd3-n" aria-label="Main"><div class="hd3-g"></div></nav></div>${LOGO()}<div class="hd3-r"><div class="hx-ac"></div></div></header>${PAGE()}`, { align:['Left','Center','Right'] }),
  desc:'Each link fills with a soft plate on its own spring when hovered or focused, so moving across the row leaves a short trail. Signing in swaps Sign in and the button for a notifications bell and the avatar; the bell\u2019s unread dot scales away when clicked. The avatar opens a menu whose rows enter 30ms apart. Narrow: the burger opens a drawer from the left edge over a dimmed page, and the account zone stays in the bar.',
  api:'link.plate.set(hover)   acts.w.set(signed ? bell + avatar : buttons)   menu.rows[i].o.set(1, S.base, t + i\u00b7.03)   drawer.x.set(0)',
  init(st){
    const K = kit(st, { bp:760, align0:0 }), nv = $(st,'.hd3-n'), g = $(st,'.hd3-g'), hd = $(st,'.hd3-hd'), bd = $(st,'.hx-bd');
    K.acts($(st,'.hx-ac'), { bell:true });
    const links = NAV.map((n,i) => { const a = document.createElement('a'); a.href = '#'; a.className = 'hx-l'; a.textContent = n; g.appendChild(a); const h = K.hover(a,'bg','var(--raised)','transparent'); const l = K.link(a); return { ...l, hb:h }; });
    let cur = 0; links.forEach((l,i) => { l.a.onclick = e => { e.preventDefault(); links.forEach((m,j) => { m.setCur(j === i); j === i ? m.a.setAttribute('aria-current','page') : m.a.removeAttribute('aria-current'); }); }; });
    links[0].setCur(true); links[0].a.setAttribute('aria-current','page'); cur = 0;
    const sl = K.slider(nv, g);
    K.panel({ id:'hd3-menu', mode:'left', burger:$(st,'.hx-bg'), links:MLINKS });
    return t => { bd.style.opacity = clamp(K.sc.at(t)).toFixed(3); sl(); K.draw(t); };
  }});

/* ================================================================ 4. two rows */
atom({ id:'header-stacked', cat:'Headers', name:'Header: utility bar and main row', block:'site-header (twoTier), nav-menu, cta-button', fam:['M','S','E'], wide:true, tall:true,
  html:`<style>
.hd4-hd{display:block;height:auto;padding:0;background:var(--card)}
.hd4-ut{position:relative;overflow:hidden;background:var(--raised);font-size:12.5px;color:var(--muted)}
.hd4-ui{display:flex;align-items:center;gap:16px;height:34px;padding:0 20px;white-space:nowrap}
.hd4-st{display:flex;align-items:center;gap:7px;margin-right:auto}
.hd4-st i{width:8px;height:8px;border-radius:50%;background:var(--success);flex:none}
.hd4-ui button{border:0;background:none;padding:4px 0;font-size:12.5px;cursor:pointer;color:var(--muted);display:flex;align-items:center;gap:5px}
.hd4-mn{position:relative;display:flex;align-items:center;gap:16px;height:64px;padding:0 20px}
.hd4-nv{position:relative;flex:1;min-width:0;height:36px}
.hd4-g{position:absolute;left:0;top:0;display:flex;gap:2px;height:36px}
.hd4-ul{position:absolute;left:0;bottom:2px;height:2px;border-radius:1px;background:var(--ink)}
.hx-fr[data-n] .hd4-ut{display:none}
.hx-fr[data-n] .hd4-hd{padding:0}
.hx-fr[data-n]{--hx-pt:64px}
.hx-fr[data-n] .hd4-mn{padding:0 12px}
.hx-fr[data-n] .hd4-nv{display:none}
.hx-fr[data-n] .hd4-mn .hx-ac{margin-left:auto}
.hd4-xt{display:flex;gap:18px;padding-top:10px;font-size:14px;color:var(--muted)}
.hd4-xt a{color:inherit;text-decoration:none}
</style>` + shell(`${PAGE(98)}`, { align:['Left','Center','Right'] }, `<header class="hx-hd hx-ov hd4-hd"><i class="hx-sd"></i><div class="hd4-ut"><div class="hd4-ui"><span class="hd4-st"><i></i>All systems operational</span><button type="button">Help center</button><button type="button">Contact sales</button><button type="button" aria-label="Language: English">${ic(HI.globe,14,1.8)}EN</button></div></div><div class="hd4-mn"><i class="hx-bd"></i>${LOGO()}<nav class="hd4-nv" aria-label="Main"><div class="hd4-g"><i class="hd4-ul"></i></div></nav><div class="hx-ac"></div>${BURGER('hd4-menu')}</div></header>`),
  desc:'Scroll past 40px and the utility row collapses in two beats: its text fades first, then its height springs to zero 60ms later, so the main row rides up to the top edge and the shadow fades in. Scrolling back to the top reverses it: height opens first, the text follows 100ms behind. The page never shifts because the header floats over it. Narrow: the utility row disappears and its links move to the bottom of the dropdown menu.',
  api:'util.o.set(0); util.h.set(0, S.base, t + .06)   expand: util.h.set(1); util.o.set(1, S.base, t + .1)   shadow.o.set(scrolled)',
  init(st){
    const K = kit(st, { bp:640, align0:0 }), hd = $(st,'.hd4-hd'), ut = $(st,'.hd4-ut'), ui = $(st,'.hd4-ui'), sd = $(st,'.hx-sd'), mn = $(st,'.hd4-mn'), nv = $(st,'.hd4-nv'), g = $(st,'.hd4-g'), ul = $(st,'.hd4-ul'), bd = $(mn,'.hx-bd');
    K.acts($(st,'.hx-ac'));
    const links = NAV.map(n => { const a = document.createElement('a'); a.href = '#'; a.className = 'hx-l'; a.textContent = n; g.appendChild(a); return K.link(a); });
    const u = edges(0,0); let cur = 0; const gg = a => [a.offsetLeft + 11, a.offsetLeft + a.offsetWidth - 11];
    const setCur = (i, inst) => { cur = i; links.forEach((l,j) => { l.setCur(j === i); j === i ? l.a.setAttribute('aria-current','page') : l.a.removeAttribute('aria-current'); }); const [l,r] = gg(links[i].a); inst ? u.jump(l, r) : u.go(l, r); };
    links.forEach((l,i) => l.a.onclick = e => { e.preventDefault(); setCur(i); }); setCur(0, true); K.watch(g, () => setCur(cur, true));
    const sl = K.slider(nv, g);
    const uh = new Track(1), uo = new Track(1); let collapsed = false;
    $(st,'.hx-pg').addEventListener('scroll', () => { const y = $(st,'.hx-pg').scrollTop, c = collapsed ? y > 10 : y > 40; if (c === collapsed) return; collapsed = c; const t0 = now();
      if (c){ uo.set(0, S.snap, t0); uh.set(0, S.base, t0 + .06); } else { uh.set(1, S.base, t0); uo.set(1, S.base, t0 + .1); } });
    K.panel({ id:'hd4-menu', mode:'drop', burger:$(st,'.hx-bg'), top:() => K.below(hd), links:MLINKS, extra:`<div class="hd4-xt"><a href="#">Help center</a><a href="#">Contact sales</a><a href="#">English</a></div>` });
    return t => { ut.style.height = px(clamp(uh.at(t))*34); ui.style.opacity = clamp(uo.at(t)).toFixed(3); sd.style.opacity = clamp(K.sc.at(t)).toFixed(3); bd.style.opacity = '0';
      const a = u.A.at(t), b = u.B.at(t); ul.style.transform = `translateX(${px(a)})`; ul.style.width = px(b - a); sl(); K.draw(t); };
  }});

/* ================================================================ 5. sticky shrink */
atom({ id:'header-shrink', cat:'Headers', name:'Header: shrinks on scroll', block:'site-header (sticky), cta-button, logo', fam:['M','E'], wide:true, tall:true,
  html:`<style>
.hd5-hd{height:auto;display:block;padding:0}
.hd5-in{position:relative;display:flex;align-items:center;gap:16px;padding:0 20px}
.hd5-lw{display:flex;flex-direction:column;justify-content:center;flex:none;transform-origin:0 50%}
.hd5-tg{display:block;overflow:hidden;font-size:12px;line-height:16px;color:var(--muted);white-space:nowrap;padding-left:30px}
.hd5-nv{position:relative;flex:1;min-width:0;height:36px;margin-left:20px}
.hd5-g{position:absolute;left:0;top:0;display:flex;gap:2px;height:36px}
.hx-fr[data-n] .hd5-nv,.hx-fr[data-n] .hd5-tg,.hx-fr[data-m] .hd5-tg{display:none}
.hx-fr[data-n] .hd5-hd{padding:0}
.hx-fr[data-n]{--hx-pt:64px}
.hx-fr[data-n] .hd5-in{padding:0 12px}
.hx-fr[data-n] .hd5-in .hx-ac{margin-left:auto}
</style>` + shell(PAGE(88), { align:['Left','Center','Right'] }, `<header class="hx-hd hx-ov hd5-hd"><i class="hx-sd"></i><div class="hd5-in"><i class="hx-bd"></i><div class="hd5-lw">${LOGO()}<span class="hd5-tg">Bookkeeping for small teams</span></div><nav class="hd5-nv" aria-label="Main"><div class="hd5-g"></div></nav><div class="hx-ac"></div>${BURGER('hd5-menu')}</div></header>`),
  desc:'Past 16px of scroll the header compacts on a single spring: the bar goes from 88px to 56px, the logo scales from 1.18 to 1, the tagline folds away, the button height eases down, and the border and shadow fade in together. Back at the top it reverses on the same spring. Narrow: starts at 64px and shrinks to 52px, and the menu drops from beneath whichever height it is at.',
  api:'k.set(scrollTop > 16)   h = lerp(88, 56, k)   logo.scale = lerp(1.18, 1, k)   tagline.h = (1 \u2212 k)\u00b716   shadow.o = k',
  init(st){
    const K = kit(st, { bp:650, mid:800, align0:0 }), hd = $(st,'.hd5-hd'), inn = $(st,'.hd5-in'), lw = $(st,'.hd5-lw'), tg = $(st,'.hd5-tg'), sd = $(st,'.hx-sd'), bd = $(st,'.hx-bd'), nv = $(st,'.hd5-nv'), g = $(st,'.hd5-g'), pg = K.pg;
    K.acts($(st,'.hx-ac'));
    const links = NAV.map(n => { const a = document.createElement('a'); a.href = '#'; a.className = 'hx-l'; a.textContent = n; g.appendChild(a); return K.link(a); });
    links.forEach((l,i) => l.a.onclick = e => { e.preventDefault(); links.forEach((m,j) => { m.setCur(j === i); j === i ? m.a.setAttribute('aria-current','page') : m.a.removeAttribute('aria-current'); }); }); links[0].setCur(true); links[0].a.setAttribute('aria-current','page');
    const sl = K.slider(nv, g), c = new Track(0); let on = false;
    pg.addEventListener('scroll', () => { const y = pg.scrollTop, v = on ? y > 6 : y > 16; if (v !== on){ on = v; c.set(v ? 1 : 0); } });
    K.panel({ id:'hd5-menu', mode:'drop', burger:$(st,'.hx-bg'), top:() => K.below(hd), links:MLINKS });
    return t => { const k = clamp(c.at(t)), n = K.narrow, H = lerp(n ? 64 : 88, n ? 52 : 56, k);
      inn.style.height = px(H); lw.style.transform = `scale(${lerp(n ? 1.08 : 1.18, 1, k).toFixed(4)})`; lw.style.marginRight = px(lerp(18, 0, k)); tg.style.height = px(lerp(16, 0, k)); tg.style.opacity = (1 - k).toFixed(3);
      hd.style.setProperty('--hx-h', px(lerp(n ? 38 : 42, 34, k))); sd.style.opacity = k.toFixed(3); bd.style.opacity = k.toFixed(3); sl(); K.draw(t); };
  }});

/* ================================================================ 6. hide on scroll down */
atom({ id:'header-autohide', cat:'Headers', name:'Header: hides on scroll down', block:'site-header (sticky), reading-progress', fam:['E','X'], wide:true, tall:true,
  html:`<style>
.hd6-hd{height:64px;gap:16px}
.hd6-nv{position:relative;flex:1;min-width:0;height:36px}
.hd6-g{position:absolute;left:0;top:0;display:flex;gap:2px;height:36px}
.hx-fr[data-n] .hd6-nv{display:none}
.hx-fr[data-n] .hd6-hd .hx-ac{margin-left:auto}
</style>` + shell(PAGE(64), { align:['Left','Center','Right'] }, `<header class="hx-hd hx-ov hd6-hd"><i class="hx-sd"></i><i class="hx-bd"></i>${LOGO()}<nav class="hd6-nv" aria-label="Main"><div class="hd6-g"></div></nav><div class="hx-ac"></div>${BURGER('hd6-menu')}</header><div class="hx-ro" aria-live="off"></div>`),
  desc:'Scroll down past 80px and the header slides up out of the frame on a fast spring, leading with its bottom edge. The first upward scroll of 4px brings it back on a softer spring, so it leaves quickly and arrives gently. It also returns whenever focus moves into it, when a menu is open, and at the very top. The label below reads the current state.',
  api:'dy = scrollTop \u2212 last   hide.set(dy > 4 && y > 80, S.snap)   show.set(dy < \u22124 || focusin || menuOpen, S.base)   header.y = \u2212hide \u00d7 (h + 2)',
  init(st){
    const K = kit(st, { bp:640, align0:0 }), hd = $(st,'.hd6-hd'), sd = $(st,'.hx-sd'), bd = $(st,'.hx-bd'), nv = $(st,'.hd6-nv'), g = $(st,'.hd6-g'), pg = K.pg, ro = $(st,'.hx-ro');
    K.acts($(st,'.hx-ac'));
    const links = NAV.map(n => { const a = document.createElement('a'); a.href = '#'; a.className = 'hx-l'; a.textContent = n; g.appendChild(a); return K.link(a); });
    links.forEach((l,i) => l.a.onclick = e => { e.preventDefault(); links.forEach((m,j) => { m.setCur(j === i); j === i ? m.a.setAttribute('aria-current','page') : m.a.removeAttribute('aria-current'); }); }); links[0].setCur(true); links[0].a.setAttribute('aria-current','page');
    const sl = K.slider(nv, g), hide = new Track(0, S.snap), msg = {}, rsw = new Swap('top'); let last = 0, state = 'top';
    [['top','At the top: header shown'],['down','Scrolling down: header hidden'],['up','Scrolling up: header shown']].forEach(([k, s]) => { const e = document.createElement('span'); e.textContent = s; ro.appendChild(e); msg[k] = e; });
    const go = s => { if (s === state) return; state = s; rsw.to(s); };
    const reveal = () => { hide.set(0, S.base); };
    const pnl = K.panel({ id:'hd6-menu', mode:'drop', burger:$(st,'.hx-bg'), top:() => K.below(hd), links:MLINKS, onToggle:v => { if (v) reveal(); } });
    pg.addEventListener('scroll', () => { const y = pg.scrollTop, dy = y - last; if (y < 8){ reveal(); go('top'); } else if (dy > 4 && y > 80 && !K.menuOpen && !pnl.open() && !hd.contains(document.activeElement)){ hide.set(1, S.snap); go('down'); } else if (dy < -4){ reveal(); go('up'); } if (Math.abs(dy) > 4 || y < 8) last = y; });
    hd.addEventListener('focusin', reveal);
    return t => { const k = clamp(hide.at(t)); hd.style.transform = `translateY(${px(-k*(hd.offsetHeight + 2))})`; sd.style.opacity = clamp(K.sc.at(t)).toFixed(3); bd.style.opacity = '0'; sl();
      for (const k2 in msg) rsw.apply(msg[k2], k2, t, 4); K.draw(t); };
  }});

/* ================================================================ 7. transparent over hero */
atom({ id:'header-overlay', cat:'Headers', name:'Header: transparent over hero', block:'site-header (transparentOnHero), hero, cta-button', fam:['M','S','E'], wide:true, tall:true,
  html:`<style>
.hd7-hd{height:64px;gap:16px;background:transparent}
.hd7-nv{position:relative;flex:1;min-width:0;height:36px}
.hd7-g{position:absolute;left:0;top:0;display:flex;gap:2px;height:36px}
.hx-fr[data-n] .hd7-nv{display:none}
.hx-fr[data-n] .hd7-hd .hx-ac{margin-left:auto}
.hd7-hr{background:#0C1016;color:#EFF2F6;padding:132px 24px 56px;position:relative;overflow:hidden}
.hd7-hi{max-width:720px;margin:0 auto;position:relative;z-index:1}
.hd7-hr h1{margin:10px 0 12px;font-size:clamp(30px,6cqi,52px);line-height:1.04;letter-spacing:-.04em;font-weight:600;text-wrap:balance}
.hd7-hr p{margin:0;color:#ABAEB3;max-width:46ch;font-size:16px}
.hd7-ey{font-size:13px;font-weight:500;color:#A3A76E}
.hd7-bt{display:flex;gap:8px;flex-wrap:wrap;margin-top:22px}
.hd7-bt span{padding:10px 16px;border-radius:10px;font-size:14px;font-weight:500;background:#EFF2F6;color:#0C1016}
.hd7-bt span+span{background:none;border:1px solid #2A2F36;color:#EFF2F6}
.hd7-sh{position:absolute;right:-60px;top:-30px;width:300px;height:300px;border-radius:50%;background:#171B21}
.hd7-s2{position:absolute;right:120px;top:150px;width:120px;height:120px;border-radius:24px;background:#23261A}
.hx-fr[data-n] .hd7-s2{display:none}
.hx-fr[data-n] .hd7-sh{right:-140px}
</style>` + shell(`<section class="hd7-hr"><i class="hd7-sh"></i><i class="hd7-s2"></i><div class="hd7-hi"><span class="hd7-ey">New: payroll for teams of one to fifty</span><h1>Bookkeeping that closes itself</h1><p>Invoices, bank feeds and payroll in one quiet place, so month end stops being an event.</p><div class="hd7-bt"><span>Start free</span><span>Watch the 2 minute tour</span></div></div></section>${PAGE()}`, { align:['Left','Center','Right'] }, `<header class="hx-hd hx-ov hd7-hd"><i class="hx-sd"></i><i class="hx-bd"></i>${LOGO()}<nav class="hd7-nv" aria-label="Main"><div class="hd7-g"></div></nav><div class="hx-ac"></div>${BURGER('hd7-menu')}</header>`),
  desc:'Over the dark hero the header has no background, no border, and light ink. Scrolling 24px fills the background, fades in the border and shadow, and turns the logo, links and button ink from light to dark, all as one blend on one spring. Opening the narrow menu forces the solid state first so the panel never opens against a transparent bar. The button\u2019s fill and text colors invert with the same blend.',
  api:'k.set(scrollTop > 24 || menuOpen)   bg = card \u00d7 k   ink = lerp(#EFF2F6, ink, k)   button.fill = lerp(#EFF2F6, ink, k)',
  init(st){
    const K = kit(st, { bp:640, align0:0 }), hd = $(st,'.hd7-hd'), sd = $(st,'.hx-sd'), bd = $(st,'.hx-bd'), nv = $(st,'.hd7-nv'), g = $(st,'.hd7-g'), pg = K.pg;
    K.acts($(st,'.hx-ac'));
    const links = NAV.map(n => { const a = document.createElement('a'); a.href = '#'; a.className = 'hx-l'; a.textContent = n; g.appendChild(a); return K.link(a); });
    links.forEach((l,i) => l.a.onclick = e => { e.preventDefault(); links.forEach((m,j) => { m.setCur(j === i); j === i ? m.a.setAttribute('aria-current','page') : m.a.removeAttribute('aria-current'); }); }); links[0].setCur(true); links[0].a.setAttribute('aria-current','page');
    const sl = K.slider(nv, g), c = new Track(0); let on = false, forced = false;
    const upd = () => { const y = pg.scrollTop; on = on ? y > 8 : y > 24; c.set(forced || on ? 1 : 0); };
    pg.addEventListener('scroll', upd);
    const pnl = K.panel({ id:'hd7-menu', mode:'drop', burger:$(st,'.hx-bg'), top:() => K.below(hd), links:MLINKS, onToggle:v => { forced = v; upd(); } });
    return t => { const k = clamp(c.at(t)), s = hd.style;
      s.setProperty('--hx-fg', `color-mix(in oklab, var(--ink) ${(k*100).toFixed(1)}%, #EFF2F6)`); s.setProperty('--hx-bg', `color-mix(in oklab, var(--card) ${(k*100).toFixed(1)}%, #0C1016)`);
      s.setProperty('--hx-mu', `color-mix(in oklab, var(--muted) ${(k*100).toFixed(1)}%, #ABAEB3)`); s.setProperty('--hx-ln', `color-mix(in oklab, var(--line) ${(k*100).toFixed(1)}%, #2A2F36)`);
      s.background = `color-mix(in oklab, var(--card) ${(k*100).toFixed(1)}%, transparent)`; sd.style.opacity = k.toFixed(3); bd.style.opacity = k.toFixed(3); sl(); K.draw(t); };
  }});

/* ================================================================ 8. floating pill */
atom({ id:'header-pill', cat:'Headers', name:'Header: floating pill with plate', block:'site-header (floating), nav-menu (variant pill)', fam:['E','M','S'], wide:true, tall:true,
  html:`<style>
.hd8-wr{position:absolute;top:14px;left:0;right:var(--sbw,0px);z-index:5;display:flex;justify-content:center;pointer-events:none}
.hd8-pl{pointer-events:auto;position:relative;height:52px;border-radius:26px;background:var(--card);border:1px solid var(--line);overflow:hidden;max-width:calc(100% - 24px)}
.hd8-in{position:absolute;left:0;top:0;right:0;height:50px;display:flex;align-items:center;gap:6px;padding:0 8px 0 14px}
.hd8-lw{overflow:hidden;flex:none}
.hd8-ls{position:relative;flex:1;min-width:0;display:flex;justify-content:center}
.hd8-g{position:relative;display:flex;gap:2px;flex:none}
.hd8-pt{position:absolute;left:0;top:0;height:36px;border-radius:18px;background:var(--raised)}
.hd8-g .hx-l{z-index:1;border-radius:18px}
.hd8-pp{position:absolute;left:0;right:0;top:50px;padding:0 16px 14px}
.hd8-pp .hx-mf{margin-top:8px}
.hx-fr[data-n] .hd8-ls{display:none}
.hx-fr[data-n] .hd8-in{padding:0 8px 0 14px}
.hx-fr[data-n] .hd8-in .hx-ac{margin-left:auto}
.hd8-pp .hx-ml{font-size:18px;padding:10px 0}
</style>` + shell(PAGE(64), { align:['Fit','Full'], label:'Pill' }, `<div class="hd8-wr"><div class="hd8-pl"><div class="hd8-in"><div class="hd8-lw">${LOGO()}</div><nav class="hd8-ls" aria-label="Main"><div class="hd8-g"><i class="hd8-pt"></i></div></nav><div class="hx-ac"></div>${BURGER('hd8-pp')}</div><div class="hd8-pp" id="hd8-pp"><div class="hd8-pl-l"></div><div class="hx-mf"></div></div></div></div>`),
  desc:'One plate slides between links with lagging edges: it follows the pointer or keyboard focus, then returns to the current page when you leave. Scrolling lifts the pill\u2019s shadow, tucks it 6px closer to the top, and folds the wordmark away so the pill narrows. The Pill option morphs the width between fit-to-content and full. Narrow: the same pill is a bar; the burger morphs it taller in place, its corner radius easing from 26px to 22px, and the links appear inside it one after another.',
  api:'plate.go(l, r) on hover / focus, back to current on leave   pill.w.set(fit | full)   wordmark.w.set(scrolled ? 0 : natural)   pill.h.set(52 + panel)   links[i].o.set(1, S.base, t + .08 + i\u00b7.04)',
  init(st){
    const K = kit(st, { bp:660, align0:0 }), wr = $(st,'.hd8-wr'), pl = $(st,'.hd8-pl'), inn = $(st,'.hd8-in'), lw = $(st,'.hd8-lw'), ls = $(st,'.hd8-ls'), g = $(st,'.hd8-g'), pt = $(st,'.hd8-pt'), pp = $(st,'.hd8-pp'), bg = $(st,'.hx-bg'), pg = K.pg, lgs = $(lw,'.hx-lg');
    K.acts($(st,'.hx-ac'));
    const links = NAV.map(n => { const a = document.createElement('a'); a.href = '#'; a.className = 'hx-l'; a.textContent = n; g.appendChild(a); return K.link(a); });
    const e = edges(0,0), po = new Track(1, S.snap); let cur = 0, shown = true;
    const gg = a => [a.offsetLeft, a.offsetLeft + a.offsetWidth], rest = inst => { const [l,r] = gg(links[cur].a); inst ? e.jump(l, r) : e.go(l, r); };
    const setCur = i => { cur = i; links.forEach((l,j) => { l.setCur(j === i); j === i ? l.a.setAttribute('aria-current','page') : l.a.removeAttribute('aria-current'); }); };
    links.forEach((l,i) => { const on = () => { const [a,b] = gg(l.a); e.go(a, b); }; l.a.addEventListener('pointerenter', on); l.a.addEventListener('focus', on); l.a.onclick = ev => { ev.preventDefault(); setCur(i); on(); }; });
    g.addEventListener('pointerleave', () => rest()); g.addEventListener('focusout', ev => { if (!g.contains(ev.relatedTarget)) rest(); });
    setCur(0); rest(true); K.watch(g, () => rest(true));
    const L = K.items($(st,'.hd8-pl-l'), MLINKS.map(l => ({ t:l.t }))); K.foot($(pp,'.hx-mf')); L.items.push({ el:$(pp,'.hx-mf'), o:new Track(0) });
    const mo = new Track(0), fw = new Track(0), sc = new Track(0), wm = new Track(1); let open = false, natW = lgs.querySelector('span').offsetWidth;
    K.watch(lgs, () => { natW = $(lgs,'span').offsetWidth; });
    const setOpen = (v, inst, focus) => { if (v === open) return; open = v; if (v) K.closeMenu(); bg.setAttribute('aria-expanded', v); bg.setAttribute('aria-label', v ? 'Close menu' : 'Open menu'); pp.style.visibility = 'visible'; inst ? mo.jump(v ? 1 : 0) : (v ? mo.set(1) : mo.set(0, S.snap)); L.show(v, inst); if (v) setTimeout(() => $(pp,'.hx-ml').focus(), 0); else if (focus) bg.focus(); };
    bg.onclick = () => setOpen(!open, false, true); $$(pp,'.hx-ml').forEach(a => a.onclick = ev => { ev.preventDefault(); setOpen(false, false, true); });
    K.escs.push(() => { if (!open) return false; setOpen(false, false, true); return true; });
    K.onNarrow.push(n => { if (!n && open) setOpen(false, true); });
    K.onAlign.push(i => fw.set(i)); fw.jump(K.align);
    let on = false; pg.addEventListener('scroll', () => { const y = pg.scrollTop, v = on ? y > 6 : y > 24; if (v !== on){ on = v; sc.set(v ? 1 : 0); wm.set(v ? 0 : 1); } });
    return t => {
      const n = K.narrow, k = clamp(sc.at(t)), f = clamp(fw.at(t)), p = clamp(mo.at(t)), w = clamp(wm.at(t));
      wr.style.top = px(lerp(14, 8, k)); lw.style.width = n ? '' : px(22 + w*(natW + 8)); $(lgs,'span').style.opacity = n ? '1' : w.toFixed(3);
      const natural = 14 + 8 + 12 + lw.offsetWidth + (g.offsetWidth) + $(st,'.hx-ac').offsetWidth, full = Math.min(920, fr(st) - 24);
      const W = n ? fr(st) - 24 : lerp(Math.min(natural, fr(st) - 24), full, f); pl.style.width = px(W);
      const ph = pp.offsetHeight; pl.style.height = px(52 + p*ph); pl.style.borderRadius = px(lerp(26, 22, p)); pl.style.boxShadow = `0 1px 2px rgba(16,20,26,${(.05 + .04*k).toFixed(3)}), 0 ${px(6*k)} ${px(18*k)} rgba(16,20,26,${(.06*k).toFixed(3)})`;
      pp.style.visibility = p > .01 || open ? 'visible' : 'hidden'; pp.style.opacity = p.toFixed(3); K.burgerDraw(bg, p); L.draw(t);
      const a = e.A.at(t), b = e.B.at(t); pt.style.transform = `translateX(${px(a)})`; pt.style.width = px(b - a);
      K.draw(t); };
    function fr(s){ return $(s,'.hx-fr').clientWidth - (K._s || 0); }
  }});

/* ================================================================ 9. rail */
atom({ id:'header-rail', cat:'Headers', name:'Header: side rail', block:'site-header (layout sidebar), nav-menu (variant vertical)', fam:['M','E','S','X'], wide:true, tall:true,
  html:`<style>
.hd9-rl{position:absolute;left:0;top:0;bottom:0;z-index:6;width:64px;background:var(--card);border-right:1px solid var(--line);overflow:hidden;display:flex;flex-direction:column;padding:12px 8px}
.hd9-lg{display:flex;align-items:center;gap:10px;height:40px;padding:0 13px;flex:none;font-weight:600;font-size:16px;letter-spacing:-.02em;color:var(--ink);text-decoration:none;white-space:nowrap;border-radius:8px}
.hd9-nv{position:relative;display:flex;flex-direction:column;gap:2px;margin-top:14px}
.hd9-pt{position:absolute;left:0;right:0;top:0;border-radius:9px;background:var(--raised)}
.hd9-it{position:relative;display:flex;align-items:center;gap:12px;height:40px;padding:0 14px;border:0;background:none;border-radius:9px;font:500 14px var(--sans);color:var(--muted);text-decoration:none;cursor:pointer;white-space:nowrap;width:100%;text-align:left}
.hd9-it svg{flex:none}
.hd9-lb{display:block;overflow:hidden;white-space:nowrap}
.hd9-lb.hx-fn{display:flex}
.hd9-sd{position:absolute;left:0;top:0;bottom:0;z-index:5;box-shadow:var(--shadow);pointer-events:none;opacity:0}
.hd9-ft{position:relative;margin-top:auto;height:96px;flex:none}
.hd9-fo,.hd9-fi{position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;gap:6px;justify-content:flex-end}
.hd9-cta{height:40px;padding:0;gap:0;display:flex;align-items:center;justify-content:center;width:100%;border-radius:9px;overflow:hidden}
.hd9-av{display:flex;align-items:center;gap:10px;height:48px;padding:0 6px;border:0;background:none;border-radius:9px;cursor:pointer;width:100%;text-align:left;color:var(--ink)}
.hd9-av .hx-av{width:34px;height:34px;pointer-events:none}
.hd9-bar{position:sticky;top:0;z-index:4;display:none;align-items:center;gap:12px;height:56px;padding:0 12px;background:var(--card);border-bottom:1px solid var(--line-soft)}
.hx-fr[data-n] .hd9-bar{display:flex}
.hd9-bar .hx-ac{margin-left:auto}
.hd9-x{display:none;position:absolute;right:8px;top:14px;width:36px;height:36px;border:0;background:none;border-radius:8px;cursor:pointer;place-items:center;z-index:2}
.hx-fr[data-n] .hd9-x{display:grid}
.hd9-sc{position:absolute;inset:0;z-index:5;background:color-mix(in oklab,var(--ink) 38%,transparent);visibility:hidden;opacity:0}
.hd9-ft .hx-cta{height:40px}
</style>` + shell(`<div class="hd9-bar"><a href="#" class="hx-lg" aria-label="Ledgerly home"><i class="hx-mk"></i><span>Ledgerly</span></a><div class="hx-ac"></div>${BURGER('hd9-rail')}</div><div class="hd9-ct">${PAGE()}</div>`, { extra:SEG('mode','Rail',['On hover','Pinned'],'Rail behaviour') }, `<div class="hd9-sc"></div><i class="hd9-sd"></i><aside class="hd9-rl" id="hd9-rail" aria-label="Site"><button type="button" class="hd9-x" aria-label="Close menu">${ic(I.x,18)}</button><a href="#" class="hd9-lg" aria-label="Ledgerly home"><i class="hx-mk"></i><span class="hd9-lb">Ledgerly</span></a><nav class="hd9-nv" aria-label="Main"><i class="hd9-pt"></i></nav><div class="hd9-ft"><div class="hd9-fo"></div><div class="hd9-fi"><button type="button" class="hd9-av" aria-haspopup="menu" aria-expanded="false" aria-label="Account menu, Maya Rios"><span class="hx-av"><span>MR</span></span><span class="hx-fn hd9-lb"><b>Maya Rios</b><span>maya@brightleaf.example</span></span></button></div></div></aside>`),
  desc:'Hover or focus the rail and it widens from 64px to 232px first; the labels fade in 60ms later, each 20ms after the last, so text never spills out of a half-open rail. Leaving reverses it: labels go first, then the width closes. The active plate slides between rows with lagging edges. Pinned keeps it open and the page slides over to make room. Narrow: the rail becomes a drawer opened from a top bar, with labels already showing.',
  api:'rail.w.set(hover ? 232 : 64)   label[i].o.set(1, S.base, t + .06 + i\u00b7.02)   exit: labels.o.set(0); rail.w.set(64, S.base, t + .05)   page.pad.set(pinned ? 232 : 64)',
  init(st){
    const K = kit(st, { bp:520, align0:0, menuSide:btn => !!btn.closest('.hd9-rl'), onExtra:(k,i) => { if (k === 'mode') setPin(i === 1); } }), rl = $(st,'.hd9-rl'), nv = $(st,'.hd9-nv'), pt = $(st,'.hd9-pt'), ft = $(st,'.hd9-ft'), fo = $(st,'.hd9-fo'), fi = $(st,'.hd9-fi'), sc = $(st,'.hd9-sc'), sdw = $(st,'.hd9-sd'), ct = $(st,'.hd9-ct'), bg = $(st,'.hx-bg'), xb = $(st,'.hd9-x'), pg = K.pg;
    K.acts($(st,'.hd9-bar .hx-ac'));
    const av = $(fi,'.hd9-av'); K.bindAvatar(av);
    const NI = [['Home',I.home],['Product',HI.layers],['Pricing',HI.tag],['Customers',HI.users],['Docs',HI.book]];
    const items = NI.map(([n,d],i) => { const a = document.createElement('a'); a.href = '#'; a.className = 'hd9-it'; a.innerHTML = `${ic(d,20,1.8)}<span class="hd9-lb">${n}</span>`; nv.appendChild(a); return { a, lb:$(a,'.hd9-lb'), o:new Track(0), l:K.link(a) }; });
    const lbs = [...items.map(x => x), { lb:$(rl,'.hd9-lg .hd9-lb'), o:new Track(0) }, { lb:$(av,'.hd9-lb'), o:new Track(0) }];
    // footer: signed out = sign in row + button that keeps its icon; signed in = avatar row
    const si = document.createElement('button'); si.type = 'button'; si.className = 'hd9-it'; si.innerHTML = `${ic(HI.out,20,1.8)}<span class="hd9-lb">Sign in</span>`; fo.appendChild(si); lbs.push({ lb:$(si,'.hd9-lb'), o:new Track(0) });
    K.hover(si,'color'); si.onclick = () => { K.setSigned(true); setTimeout(() => av.focus(), 0); };
    const cta = K.cta('Start free', true); cta.className += ' hd9-cta'; cta.insertAdjacentHTML('afterbegin', ic(HI.plus,18,2)); fo.appendChild(cta); const cl = $(cta,'span'); cl.style.cssText = 'display:block;overflow:hidden;white-space:nowrap'; const clw = { el:cl, o:new Track(0), nat:0 };
    K.watch(cl, () => {}); setTimeout(() => { clw.el.style.width = 'auto'; clw.nat = clw.el.offsetWidth; }, 0); document.fonts.ready.then(() => { clw.el.style.width = 'auto'; clw.nat = clw.el.offsetWidth; });
    let cur = 0, pinned = false, hov = false, narrow = null, drawerOpen = false;
    const e = edges(0,0), w = new Track(64), pad = new Track(64), dr = new Track(0);
    const g = a => [a.offsetTop, a.offsetTop + a.offsetHeight];
    const setCur = (i, inst) => { cur = i; items.forEach((x,j) => { x.l.setCur(j === i); j === i ? x.a.setAttribute('aria-current','page') : x.a.removeAttribute('aria-current'); }); const [a,b] = g(items[i].a); inst ? e.jump(a, b) : e.go(a, b); };
    items.forEach((x,i) => x.a.onclick = ev => { ev.preventDefault(); setCur(i); if (K.narrow) setDrawer(false, true); }); setCur(0, true); K.watch(nv, () => setCur(cur, true));
    const expanded = () => pinned || hov || K.narrow;
    const apply = inst => { const ex = pinned || hov, t0 = now();
      if (K.narrow) return;
      if (inst){ w.jump(ex ? 232 : 64); lbs.forEach(l => l.o.jump(ex ? 1 : 0)); clw.o.jump(ex ? 1 : 0); return; }
      if (ex){ w.set(232, S.base, t0); lbs.forEach((l,i) => l.o.set(1, S.base, t0 + .06 + i*.02)); clw.o.set(1, S.base, t0 + .06); }
      else { lbs.forEach(l => l.o.set(0, S.snap, t0)); clw.o.set(0, S.snap, t0); w.set(64, S.base, t0 + .05); } };
    const setPin = v => { pinned = v; pad.set(v ? 232 : 64); apply(); };
    rl.addEventListener('pointerenter', () => { if (K.narrow) return; hov = true; apply(); }); rl.addEventListener('pointerleave', () => { if (K.narrow) return; hov = false; if (!K.menuOpen) apply(); });
    rl.addEventListener('focusin', () => { if (K.narrow) return; hov = true; apply(); }); rl.addEventListener('focusout', ev => { if (K.narrow || rl.contains(ev.relatedTarget)) return; hov = false; apply(); });
    const setDrawer = (v, focus) => { if (v === drawerOpen) return; drawerOpen = v; bg.setAttribute('aria-expanded', v); bg.setAttribute('aria-label', v ? 'Close menu' : 'Open menu'); v ? dr.set(1) : dr.set(0, S.snap); if (v) setTimeout(() => items[0].a.focus(), 0); else if (focus) bg.focus(); };
    bg.onclick = () => setDrawer(!drawerOpen, true); xb.onclick = () => setDrawer(false, true); sc.onclick = () => setDrawer(false, true);
    K.escs.push(() => { if (!drawerOpen) return false; setDrawer(false, true); return true; });
    K.onNarrow.push(n => { if (n){ lbs.forEach(l => l.o.jump(1)); clw.o.jump(1); w.jump(280); drawerOpen = false; dr.jump(0); hov = false; } else { apply(true); drawerOpen = false; dr.jump(0); bg.setAttribute('aria-expanded','false'); } });
    if (K.narrow){ lbs.forEach(l => l.o.jump(1)); clw.o.jump(1); } else apply(true);
    return t => { const n = K.narrow, d = clamp(dr.at(t)); let W;
      if (n){ W = Math.min(300, K.fr.clientWidth*.86); rl.style.width = px(W); rl.style.transform = `translateX(${px(-(1 - d)*(W + 2))})`; sc.style.opacity = d.toFixed(3); sc.style.visibility = d > .01 ? 'visible' : 'hidden'; sc.style.pointerEvents = d > .5 ? 'auto' : 'none'; rl.style.visibility = d > .01 || drawerOpen ? 'visible' : 'hidden'; ct.style.paddingLeft = '0px'; sdw.style.opacity = '0'; K.burgerDraw(bg, d); }
      else { W = w.at(t); rl.style.width = px(W); rl.style.transform = 'none'; rl.style.visibility = 'visible'; sdw.style.width = px(W); sdw.style.opacity = clamp((W - 70)/160).toFixed(3); sc.style.visibility = 'hidden'; sc.style.opacity = '0'; ct.style.paddingLeft = px(pad.at(t)); }
      lbs.forEach(l => { const o = clamp(l.o.at(t)); l.lb.style.opacity = o.toFixed(3); }); clw.el.style.width = px(clamp(clw.o.at(t))*clw.nat); clw.el.style.opacity = clamp(clw.o.at(t)).toFixed(3);
      const a = e.A.at(t), b = e.B.at(t); pt.style.transform = `translateY(${px(a)})`; pt.style.height = px(b - a);
      const k = clamp(K.au.at(t)); fo.style.visibility = ''; K.sw.apply(fo, 'out', t, 6); K.sw.apply(fi, 'in', t, 6);
      K.draw(t); };
  }});

/* ================================================================ 10. search expands */
atom({ id:'header-search', cat:'Headers', name:'Header: search expands in place', block:'site-header, search-trigger, nav-menu', fam:['M','S','X','E'], wide:true, tall:true,
  html:`<style>
.hd10-hd{gap:12px}
.hd10-lw{flex:none;overflow:hidden}
.hd10-nv{position:relative;flex:1;min-width:0;height:36px;overflow:hidden}
.hd10-g{position:absolute;left:0;top:0;display:flex;gap:2px;height:36px}
.hd10-sx{position:relative;height:36px;border-radius:18px;background:var(--raised);overflow:hidden;flex:0 0 36px}
.hd10-sb{position:absolute;left:0;top:0;width:36px;height:36px;border:0;background:none;cursor:pointer;display:grid;place-items:center;color:var(--ink);z-index:1}
.hd10-sx input{position:absolute;left:36px;right:40px;top:0;height:36px;border:0;background:none;color:var(--ink);font:14px var(--sans);outline:none;user-select:text;-webkit-user-select:text;min-width:0;width:calc(100% - 76px)}
.hd10-sx input::-webkit-search-cancel-button{display:none}
.hd10-kb{position:absolute;right:10px;top:8px;height:20px;padding:0 6px;border-radius:5px;border:1px solid var(--line);font:500 11.5px/18px var(--mono);color:var(--faint)}
.hd10-cn{display:none;border:0;background:none;font:500 14px var(--sans);cursor:pointer;color:var(--ink);padding:0;white-space:nowrap;flex:none;overflow:hidden;text-align:right}
.hd10-rs{position:absolute;z-index:4;background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);overflow:hidden;visibility:hidden}
.hd10-rh{height:30px;padding:10px 14px 0;font-size:12px;color:var(--faint)}
.hd10-ri{position:relative;display:flex;align-items:center;gap:10px;width:calc(100% - 12px);margin:0 6px;height:0;overflow:hidden;border:0;background:none;border-radius:8px;padding:0 8px;cursor:pointer;text-align:left;color:var(--ink);font:14px var(--sans);flex:none}
.hd10-ri svg{color:var(--muted);flex:none}.hd10-ri small{margin-left:auto;font-size:12px;color:var(--faint)}
.hd10-em{overflow:hidden;height:0;padding:0 14px;color:var(--muted);font-size:14px;line-height:44px}
.hx-fr[data-n] .hd10-nv,.hx-fr[data-n] .hd10-kb{display:none}
.hx-fr[data-n] .hd10-hd{gap:0}
.hx-fr[data-n] .hd10-hd>*+*{margin-left:4px}
.hx-fr[data-n] .hd10-hd .hd10-sx{margin-left:auto}
</style>` + shell(`<header class="hx-hd hd10-hd"><i class="hx-bd"></i><div class="hd10-lw">${LOGO()}</div><nav class="hd10-nv" aria-label="Main"><div class="hd10-g"></div></nav><div class="hd10-sx" role="search"><button type="button" class="hd10-sb" aria-label="Search" aria-expanded="false" aria-controls="hd10-rs">${ic(I.search,17,1.9)}</button><input id="hd10-q" type="search" placeholder="Search docs and pages" aria-label="Search docs and pages" autocomplete="off"><span class="hd10-kb" aria-hidden="true">/</span></div><button type="button" class="hd10-cn">Cancel</button><div class="hx-ac"></div>${BURGER('hd10-menu')}</header>${PAGE()}`, { align:['Left','Center','Right'] }, `<div class="hd10-rs" id="hd10-rs" role="listbox" aria-label="Search results"><div class="hd10-rh"></div></div>`),
  desc:'Press the search icon (or \u201c/\u201d) and the pill widens in place to 320px while the links, centered in the room left over, are pushed toward the logo; when they no longer fit they blur out instead of wrapping. The results panel drops from the field with its height following the number of matches; typing collapses non-matching rows and keeps the rest. Narrow: the field takes the whole bar, the logo and menu button fold away together, and Cancel slides in.',
  api:'search.w.set(open ? 320 : 36)   links.x.set(align \u00d7 (room \u2212 links)); links.o.set(fits)   rows[i].h.set(match ? 40 : 0)   panel.h.set(30 + \u03a3 rows)   narrow: chrome.w.set(0); field.grow = open',
  init(st){
    const K = kit(st, { bp:660, align0:1 }), hd = $(st,'.hd10-hd'), nv = $(st,'.hd10-nv'), g = $(st,'.hd10-g'), sx = $(st,'.hd10-sx'), sb = $(st,'.hd10-sb'), inp = $(sx,'input'), kb = $(sx,'.hd10-kb'), cn = $(st,'.hd10-cn'), rs = $(st,'.hd10-rs'), rh = $(rs,'.hd10-rh'), lw = $(st,'.hd10-lw'), bd = $(st,'.hx-bd'), ac = $(st,'.hx-ac'), bg = $(st,'.hx-bg'), fr = K.fr;
    K.acts(ac); const CN = 58; bg.style.overflow = 'hidden';
    const links = NAV.map(n => { const a = document.createElement('a'); a.href = '#'; a.className = 'hx-l'; a.textContent = n; g.appendChild(a); return K.link(a); });
    links.forEach((l,i) => l.a.onclick = e => { e.preventDefault(); links.forEach((m,j) => { m.setCur(j === i); j === i ? m.a.setAttribute('aria-current','page') : m.a.removeAttribute('aria-current'); }); }); links[1].setCur(true); links[1].a.setAttribute('aria-current','page');
    const sl = K.slider(nv, g);
    const IDX = [['Late payment reminders','Guide'],['Export to QuickBooks','Guide'],['Invite an accountant','Guide'],['Set up bank feeds','Guide'],['Payroll tax calendar','Guide'],['Pricing and plans','Page'],['Customer stories','Page']];
    const rows = IDX.map(([t, k], i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role','option'); b.className = 'hd10-ri'; b.innerHTML = `${ic(k === 'Guide' ? HI.book : I.file,16,1.8)}<span>${t}</span><small>${k}</small>`; rs.appendChild(b); K.hover(b,'bg','var(--raised)','transparent'); return { b, t, h:new Track(0), o:new Track(0), match:false }; });
    const em = document.createElement('div'); em.className = 'hd10-em'; em.textContent = 'Nothing matches that yet. Try \u201cinvoice\u201d.'; rs.appendChild(em);
    const emo = new Track(0), sxw = new Track(36), sio = new Track(0), lv = new Track(1), ro = new Track(0), ph = new Track(0), nar = new Track(0); let open = false;
    const filter = () => { const q = inp.value.trim().toLowerCase(), t0 = now(); let n = 0; const list = q ? rows.filter(r => r.t.toLowerCase().includes(q)) : rows.slice(0, 4);
      rows.forEach(r => { const m = list.includes(r); r.match = m; if (m){ r.h.set(40); r.o.set(1, S.base, t0 + .03*n); n++; } else { r.o.set(0, S.snap, t0); r.h.set(0, S.base, t0 + .04); } r.b.tabIndex = m ? 0 : -1; });
      rh.textContent = q ? `${n ? n : 'No'} result${n === 1 ? '' : 's'} for \u201c${inp.value.trim()}\u201d` : 'Suggested'; emo.set(n ? 0 : 1, n ? S.snap : S.base); ph.set(30 + (n ? n*40 + 8 : 44 + 8), S.base); };
    const setOpen = v => { if (v === open) return; open = v; sb.setAttribute('aria-expanded', v); hd.classList.toggle('hd10-op', v); const t0 = now(), n = K.narrow;
      if (v){ K.closeMenu(); filter(); sxw.set(320); sio.set(1, S.base, t0 + .1); ro.set(1, S.base, t0 + .05); nar.set(n ? 1 : 0); inp.style.visibility = 'visible'; setTimeout(() => inp.focus(), 0); }
      else { sxw.set(36); sio.set(0, S.snap, t0); ro.set(0, S.snap, t0); nar.set(0); ph.set(0, S.snap); rows.forEach(r => r.o.set(0, S.snap)); inp.value = ''; } };
    sb.onclick = () => { if (open){ if (inp.value){ inp.value = ''; filter(); inp.focus(); } else setOpen(false); } else setOpen(true); };
    cn.onclick = () => { setOpen(false); sb.focus(); };
    inp.addEventListener('input', filter);
    inp.addEventListener('keydown', e => { if (e.key === 'ArrowDown'){ e.preventDefault(); const r = rows.find(x => x.match); r && r.b.focus(); } if (e.key === 'Enter'){ const r = rows.find(x => x.match); if (r){ e.preventDefault(); r.b.click(); } } });
    rs.addEventListener('keydown', e => { const vis = rows.filter(x => x.match), i = vis.findIndex(x => x.b === document.activeElement);
      if (e.key === 'ArrowDown'){ e.preventDefault(); vis[Math.min(vis.length - 1, i + 1)].b.focus(); } else if (e.key === 'ArrowUp'){ e.preventDefault(); i <= 0 ? inp.focus() : vis[i - 1].b.focus(); } });
    rows.forEach(r => r.b.onclick = () => { setOpen(false); sb.focus(); });
    K.escs.push(() => { if (!open) return false; setOpen(false); sb.focus(); return true; });
    st.addEventListener('keydown', e => { if (e.key === '/' && !open && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && st.contains(document.activeElement)){ e.preventDefault(); setOpen(true); } });
    st.addEventListener('pointerdown', e => { if (open && !sx.contains(e.target) && !rs.contains(e.target) && !cn.contains(e.target)) setOpen(false); });
    K.onNarrow.push(() => { if (open) setOpen(false); });
    filter(); rows.forEach(r => { r.h.jump(r.h.target); r.o.jump(0); }); ph.jump(0); emo.jump(0);
    K.panel({ id:'hd10-menu', mode:'drop', burger:bg, top:() => K.below(hd), links:MLINKS });
    let lwNat = 0;
    return t => {
      const n = K.narrow, o = n ? clamp(nar.at(t)) : 0, io = clamp(sio.at(t));
      if (!lwNat || !n){ lw.style.width = 'auto'; lwNat = lw.scrollWidth; }
      lw.style.width = n ? px((1 - o)*lwNat) : 'auto'; lw.style.opacity = (1 - o).toFixed(3);
      K.accFold = o; bg.style.width = px(36*(1 - o)); bg.style.opacity = (1 - o).toFixed(3); ac.style.opacity = (1 - o).toFixed(3);
      if (n){ sx.style.flex = `${o.toFixed(4)} 0 36px`; sx.style.width = ''; cn.style.display = 'block'; cn.style.width = px(CN*o); cn.style.opacity = o.toFixed(3); }
      else { sx.style.flex = '0 0 auto'; sx.style.width = px(sxw.at(t)); cn.style.display = 'none'; }
      fade(inp, io, null); inp.style.visibility = io < .01 && !open ? 'hidden' : 'visible'; kb.style.opacity = (io*(inp.value ? 0 : 1)).toFixed(3);
      const fits = nv.clientWidth >= g.offsetWidth - 1; lv.set(fits ? 1 : 0, S.base); const lo = clamp(lv.at(t)); g.style.opacity = lo.toFixed(3); g.style.filter = lo < .98 ? `blur(${((1 - lo)*BLUR).toFixed(2)}px)` : 'none'; g.style.visibility = lo < .01 ? 'hidden' : 'visible'; sl();
      const p = clamp(ro.at(t)), r = relRect(fr, sx.getBoundingClientRect()), FW = fr.clientWidth - (K._s || 0), rw = n ? FW - 24 : 360, rx = n ? 12 : clamp(r.x + r.w - 360, 12, FW - 360 - 12);
      rs.style.left = px(rx); rs.style.width = px(rw); rs.style.top = px(r.y + r.h + 8); rs.style.height = px(Math.max(0, ph.at(t))); rs.style.transformOrigin = '100% 0'; pop(rs, p, -6); rs.style.visibility = p < .01 ? 'hidden' : 'visible';
      rows.forEach(x => { x.b.style.height = px(Math.max(0, x.h.at(t))); x.b.style.opacity = clamp(x.o.at(t)).toFixed(3); });
      const eo = clamp(emo.at(t)); em.style.opacity = eo.toFixed(3); em.style.height = px(eo*44);
      bd.style.opacity = clamp(K.sc.at(t)).toFixed(3); K.draw(t); };
  }});

/* ================================================================ 11. announcement */
atom({ id:'header-announce', cat:'Headers', name:'Header: announcement bar', block:'announcement, site-header, cta-button', fam:['S','M','E'], wide:true, tall:true,
  html:`<style>
.hd11-an{position:relative;overflow:hidden;background:var(--ink);color:var(--card)}
.hd11-ai{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;padding:10px 52px;font-size:13.5px;line-height:1.35;text-align:center}
.hd11-ai a{color:inherit;font-weight:600;text-decoration:underline;text-underline-offset:3px;white-space:nowrap}
.hd11-x{position:absolute;right:10px;top:50%;margin-top:-16px;width:32px;height:32px;border:0;border-radius:8px;background:none;color:var(--card);display:grid;place-items:center;cursor:pointer}
.hd11-hd{gap:16px}
.hd11-s{display:none}
.hx-fr[data-n] .hd11-w{display:none}
.hx-fr[data-n] .hd11-s{display:inline}
.hd11-nv{position:relative;flex:1;min-width:0;height:36px}
.hd11-g{position:absolute;left:0;top:0;display:flex;gap:2px;height:36px}
.hx-fr[data-n] .hd11-nv{display:none}
.hx-fr[data-n] .hd11-hd .hx-ac{margin-left:auto}
.hx-fr[data-n] .hd11-ai{padding:10px 46px 10px 14px;justify-content:flex-start;text-align:left;flex-wrap:wrap;gap:0 8px}
</style>` + shell(`<div class="hd11-an" role="region" aria-label="Announcement"><div class="hd11-ai"><span class="hd11-w">Ledgerly Payroll is now open to everyone. Run it in four minutes.</span><span class="hd11-s">Payroll is open to everyone.</span><a href="#">See what\u2019s new</a></div><button type="button" class="hd11-x" aria-label="Dismiss announcement">${ic(I.x,16,2)}</button></div><header class="hx-hd hd11-hd"><i class="hx-bd"></i>${LOGO()}<nav class="hd11-nv" aria-label="Main"><div class="hd11-g"></div></nav><div class="hx-ac"></div>${BURGER('hd11-menu')}</header>${PAGE()}`, { align:['Left','Center','Right'], extra:`<button type="button" class="btn hd11-rs" aria-label="Show the announcement again">Show again</button>` }),
  desc:'Dismiss the bar and its text blurs out first (100ms), then the slot\u2019s height springs to zero 60ms later, so the header and the whole page ride up into the freed space rather than leaving a gap. Show again opens the slot first and brings the text in 100ms behind. It lives above a sticky header, so once you scroll it leaves with the page and the header stays pinned. Narrow: the message left-aligns and wraps to two lines, and the slot measures itself.',
  api:'dismiss: text.o.set(0, S.snap); slot.h.set(0, S.base, t + .06)   restore: slot.h.set(natural); text.o.set(1, S.base, t + .1)   focus \u2192 logo',
  init(st){
    const K = kit(st, { bp:640, align0:0 }), an = $(st,'.hd11-an'), ai = $(st,'.hd11-ai'), x = $(st,'.hd11-x'), hd = $(st,'.hd11-hd'), nv = $(st,'.hd11-nv'), g = $(st,'.hd11-g'), bd = $(st,'.hx-bd'), rs = $(st,'.hd11-rs');
    K.acts($(st,'.hx-ac'));
    const links = NAV.map(n => { const a = document.createElement('a'); a.href = '#'; a.className = 'hx-l'; a.textContent = n; g.appendChild(a); return K.link(a); });
    links.forEach((l,i) => l.a.onclick = e => { e.preventDefault(); links.forEach((m,j) => { m.setCur(j === i); j === i ? m.a.setAttribute('aria-current','page') : m.a.removeAttribute('aria-current'); }); }); links[0].setCur(true); links[0].a.setAttribute('aria-current','page');
    const sl = K.slider(nv, g), h = new Track(1), o = new Track(1); let shown = true;
    K.hover(x,'bg','color-mix(in oklab, var(--card) 16%, transparent)','transparent');
    const set = (v, focus) => { if (v === shown) return; shown = v; const t0 = now(); an.setAttribute('aria-hidden', !v); x.tabIndex = v ? 0 : -1; ai.querySelector('a').tabIndex = v ? 0 : -1; rs.disabled = v;
      if (!v){ o.set(0, S.snap, t0); h.set(0, S.base, t0 + .06); if (focus) setTimeout(() => $(st,'.hx-lg').focus(), 0); } else { h.set(1, S.base, t0); o.set(1, S.base, t0 + .1); if (focus) setTimeout(() => x.focus(), 0); } };
    x.onclick = () => set(false, true); rs.onclick = () => set(true, true); rs.disabled = true;
    K.panel({ id:'hd11-menu', mode:'drop', burger:$(st,'.hx-bg'), top:() => K.below(hd), links:MLINKS });
    return t => { const p = clamp(h.at(t)), nat = ai.offsetHeight; an.style.height = p > .999 && shown ? 'auto' : px(p*nat); an.style.visibility = p < .005 ? 'hidden' : 'visible'; fade(ai, clamp(o.at(t)), 0, false); ai.style.opacity = clamp(o.at(t)).toFixed(3); x.style.opacity = clamp(o.at(t)).toFixed(3);
      bd.style.opacity = clamp(K.sc.at(t)).toFixed(3); sl(); K.draw(t); };
  }});

/* ================================================================ 12. minimal + fullscreen menu */
atom({ id:'header-minimal', cat:'Headers', name:'Header: minimal with fullscreen menu', block:'site-header, nav-menu (mobileStyle fullscreen), cta-button', fam:['M','X','S'], wide:true, tall:true,
  html:`<style>
.hd12-hd{gap:12px;justify-content:space-between}
.hd12-rt{display:flex;align-items:center;gap:8px}
.hd12-mb{display:flex;align-items:center;gap:10px;height:36px;padding:0 12px 0 14px;border:1px solid var(--hx-ln,var(--line));border-radius:18px;background:none;cursor:pointer;color:var(--hx-fg,var(--ink));font:500 14px var(--sans);flex:none}
.hd12-ml{position:relative;display:block;width:48px;height:20px}
.hd12-ml span{position:absolute;left:0;top:0;line-height:20px}
.hd12-bs{position:relative;width:16px;height:16px}
.hd12-bs i{position:absolute;left:0;top:7px;width:16px;height:2px;border-radius:1px;background:var(--hx-fg,var(--ink))}
.hd12-ov{position:absolute;inset:0;z-index:4;background:var(--ink);color:var(--card);visibility:hidden;overflow:hidden;--hx-fg:var(--card);--hx-bg:var(--ink);--hx-ln:color-mix(in oklab,var(--card) 35%,transparent)}
.hd12-bd{position:absolute;inset:0;overflow:auto;padding:96px 28px 28px;display:flex;gap:40px;justify-content:space-between}
.hd12-lw{position:relative;flex:1;min-width:0;align-self:flex-start}
.hd12-ls{display:flex;flex-direction:column;gap:2px;width:max-content;max-width:100%}
.hd12-lk{display:flex;align-items:baseline;gap:14px;padding:4px 0;color:var(--card);text-decoration:none;font-size:clamp(34px,7.4cqi,60px);line-height:1.08;letter-spacing:-.04em;font-weight:600}
.hd12-lk small{font:500 12px var(--mono);letter-spacing:0;color:var(--card);opacity:.6;min-width:20px}
.hd12-ct{width:240px;flex:none;display:flex;flex-direction:column;gap:18px;font-size:14px;line-height:1.5;padding-top:12px}
.hd12-ct span{display:block;font-size:12.5px;opacity:.6}
.hd12-ct a{color:var(--card)}
.hd12-ov .hx-mf{margin-top:0;display:none}
.hx-fr[data-n] .hd12-bd{flex-direction:column;padding:88px 20px 20px;gap:22px}
.hx-fr[data-n] .hd12-ct{width:auto;padding-top:0;flex-direction:row;flex-wrap:wrap;gap:12px 28px}
.hx-fr[data-n] .hd12-ov .hx-mf{display:block;margin-top:10px;flex:0 0 100%;width:100%}
.hx-fr[data-n] .hd12-ov .hx-sb{background:none;color:var(--card);border-color:color-mix(in oklab,var(--card) 35%,transparent)}
.hx-fr[data-n] .hd12-ov .hx-fn span{color:var(--card);opacity:.65}
</style>` + shell(PAGE(64), { align:['Left','Center'], label:'Menu links' }, `<div class="hd12-ov" id="hd12-menu" role="dialog" aria-label="Site menu"><div class="hd12-bd"><div class="hd12-lw"><nav aria-label="Main"><div class="hd12-ls"></div></nav></div><div class="hd12-ct"><div><span>Studio</span>Marlow Studio, Leeds<br>Open Tuesday to Saturday</div><div><span>Say hello</span><a href="#">hello@marlow.example</a></div><div class="hx-mf"></div></div></div></div><header class="hx-hd hx-ov hd12-hd"><i class="hx-bd"></i>${LOGO('Marlow Studio')}<div class="hd12-rt"><div class="hx-ac"></div><button type="button" class="hd12-mb" aria-expanded="false" aria-controls="hd12-menu" aria-label="Open menu"><span class="hd12-ml"><span>Menu</span><span>Close</span></span><span class="hd12-bs"><i></i><i></i></span></button></div></header>`),
  desc:'The page header is only a wordmark, the account zone and a Menu button, at every width. Opening swaps the label Menu to Close, folds the two lines into a cross, and expands a dark layer as a circle growing out from the button until it covers the page. The header recolors to light ink at the same moment, then each link enters 60ms after the last, and hovering one dims the others. Escape closes it and focus returns to the button.',
  api:'overlay.r = open \u00d7 reach(button \u2192 far corner)   header.ink = lerp(ink, card, open)   link[i].o.set(1, S.base, t + .14 + i\u00b7.06)   hover: others.o.set(.4)',
  init(st){
    const K = kit(st, { bp:560, align0:0 }), hd = $(st,'.hd12-hd'), mb = $(st,'.hd12-mb'), ml = $$(mb,'.hd12-ml span'), bs = $$(mb,'.hd12-bs i'), ov = $(st,'.hd12-ov'), bdy = $(st,'.hd12-bd'), ls = $(st,'.hd12-ls'), lwr = $(st,'.hd12-lw'), ct = $(st,'.hd12-ct'), bd = $(st,'.hx-bd'), fr = K.fr;
    K.acts($(st,'.hx-ac'), { cta:'Start a project' }); K.foot($(ov,'.hx-mf'));
    const LK = [['01','Work'],['02','Studio'],['03','Journal'],['04','Contact']];
    const links = LK.map(([n,t]) => { const a = document.createElement('a'); a.href = '#'; a.className = 'hd12-lk'; a.innerHTML = `<small>${n}</small>${t}`; ls.appendChild(a); return { a, o:new Track(0), dim:new Track(0, S.snap) }; });
    const cts = [...ct.children].map(el => ({ el, o:new Track(0) })); const sl = K.slider(lwr, ls, [0, .5]);
    const mo = new Track(0), msw = new Swap('Menu'); let open = false;
    const set = (v, inst, focus) => { if (v === open) return; open = v; K.closeMenu(); mb.setAttribute('aria-expanded', v); mb.setAttribute('aria-label', v ? 'Close menu' : 'Open menu'); msw.to(v ? 'Close' : 'Menu'); const t0 = now();
      ov.style.visibility = 'visible'; if (inst){ mo.jump(v ? 1 : 0); links.concat(cts).forEach(x => x.o.jump(v ? 1 : 0)); return; }
      v ? mo.set(1, S.soft) : mo.set(0, S.base, t0 + .08); links.forEach((x,i) => v ? x.o.set(1, S.base, t0 + .14 + i*.06) : x.o.set(0, S.snap, t0)); cts.forEach((x,i) => v ? x.o.set(1, S.base, t0 + .3 + i*.05) : x.o.set(0, S.snap, t0));
      if (v) setTimeout(() => links[0].a.focus(), 60); else if (focus) mb.focus(); };
    mb.onclick = () => set(!open, false, true); links.forEach(l => { l.a.onclick = e => { e.preventDefault(); set(false, false, true); }; });
    ls.addEventListener('pointerover', e => { const a = e.target.closest('.hd12-lk'); links.forEach(l => l.dim.set(a && l.a !== a ? 1 : 0)); }); ls.addEventListener('pointerleave', () => links.forEach(l => l.dim.set(0)));
    ls.addEventListener('focusin', e => { if (e.target.matches(':focus-visible')) links.forEach(l => l.dim.set(l.a !== e.target ? 1 : 0)); }); ls.addEventListener('focusout', () => links.forEach(l => l.dim.set(0)));
    K.escs.push(() => { if (!open) return false; set(false, false, true); return true; });
    K.onNarrow.push(() => { if (open) set(false, true); });
    return t => { const p = clamp(mo.at(t)); bd.style.opacity = clamp(K.sc.at(t)).toFixed(3) * (1 - p);
      const W = fr.clientWidth, H = fr.clientHeight, br = mb.getBoundingClientRect(), fb = fr.getBoundingClientRect(), cx = br.left + br.width/2 - fb.left, cy = br.top + br.height/2 - fb.top, R = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));
      ov.style.clipPath = `circle(${(p*R).toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`; ov.style.visibility = p > .001 || open ? 'visible' : 'hidden'; ov.style.pointerEvents = p > .5 ? 'auto' : 'none';
      hd.style.background = mix(1 - p, 'var(--card)', 'transparent'); hd.style.setProperty('--hx-fg', mix(p, 'var(--card)', 'var(--ink)')); hd.style.setProperty('--hx-bg', mix(p, 'var(--ink)', 'var(--card)')); hd.style.setProperty('--hx-ln', mix(p, 'color-mix(in oklab, var(--card) 35%, transparent)', 'var(--line)'));
      bs[0].style.transform = `translateY(${px(-3 + 3*p)}) rotate(${(45*p).toFixed(2)}deg)`; bs[1].style.transform = `translateY(${px(3 - 3*p)}) rotate(${(-45*p).toFixed(2)}deg)`;
      ml.forEach(s => msw.apply(s, s.textContent, t, 6)); links.forEach(l => { const o = clamp(l.o.at(t)); fade(l.a, o, (1 - o)*18); l.a.style.opacity = (o*(1 - .6*clamp(l.dim.at(t)))).toFixed(3); }); cts.forEach(c => { const o = clamp(c.o.at(t)); fade(c.el, o, (1 - o)*10); });
      sl(); K.draw(t); };
  }});

})();