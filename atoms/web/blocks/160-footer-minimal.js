

/* ---------- Footers (organisms, set 1) ---------- */
(() => {
const CAT = 'Footers';

/* ---- shared kit (private to this file) ---- */
const K = {
  arR:'<path d="M5 12h14M13 6l6 6-6 6"/>', arUR:'<path d="M7 17 17 7M8 7h9v9"/>', up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  mon:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  gh:'<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  li:'<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  yt:'<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
  rss:'<path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>',
  tw:'<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>',
};
const logo = (bg = 'var(--card)') => `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style="flex:none"><rect width="24" height="24" rx="7" fill="currentColor"/><path d="M8 17V7l8 10V7" fill="none" stroke="${bg}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// animated link: underline draw + optional arrow nudge. Motion is driven by fx().
const lk = (p, label, o = {}) => `<a href="#" class="${p}l" data-fx="${o.kind || ''}"><span class="${p}t">${label}${o.kind ? '' : `<i class="${p}u" data-u></i>`}</span>${o.after || ''}${o.ar ? `<i class="${p}ar" data-ar="${o.ar}">${ic(o.ar === 'ur' ? K.arUR : K.arR, 12, 2)}</i>` : ''}</a>`;
const btt = (p, label = 'Back to top') => `<button type="button" class="${p}btt" data-fx="btn" data-top${label ? '' : ' aria-label="Back to top"'}>${label ? `<span class="${p}t">${label}</span>` : ''}<i class="${p}ar" data-ar="up">${ic(K.up, 14, 2)}</i></button>`;

const PAL = { hi:'var(--ink)', lo:'var(--muted)', bgHi:'var(--raised)', bgLo:'var(--card)', lnHi:'var(--ink)', lnLo:'var(--line)' };
const fx = (st, pal = PAL) => {
  const L = $$(st, '[data-fx]').map(a => ({ a, kind:a.dataset.fx, u:$(a, '[data-u]'), ar:$(a, '[data-ar]'), p:new Track(0), on:false, k:-1 }));
  L.forEach(x => {
    const on = () => { x.on = true; x.p.set(1, S.snap); }, off = () => { x.on = false; x.p.set(0, S.snap); };
    x.a.addEventListener('pointerenter', on);
    x.a.addEventListener('pointerleave', () => { if (!x.a.matches(':focus-visible')) off(); });
    x.a.addEventListener('focus', () => { if (x.a.matches(':focus-visible')) on(); });
    x.a.addEventListener('blur', off);
    if (x.a.getAttribute('href') === '#') x.a.addEventListener('click', e => e.preventDefault());
  });
  return t => { for (const x of L){
    const p = clamp(x.p.at(t)); if (Math.abs(p - x.k) < 5e-4) continue; x.k = p;
    if (x.kind !== 'arrow') x.a.style.color = mix(p, pal.hi, pal.lo);
    if (x.kind === 'btn'){ x.a.style.background = mix(p, pal.bgHi, pal.bgLo); x.a.style.borderColor = mix(p, pal.lnHi, pal.lnLo); }
    if (x.u){ x.u.style.transformOrigin = x.on ? 'left' : 'right'; x.u.style.transform = `scaleX(${p.toFixed(4)})`; }
    if (x.ar){ const d = p*3, a = x.ar.dataset.ar; x.ar.style.transform = `translate(${px(a === 'up' ? 0 : a === 'ur' ? d*.8 : d)},${px(a === 'up' ? -d : a === 'ur' ? -d*.8 : 0)})`; x.ar.style.opacity = (.62 + .38*p).toFixed(3); }
  } };
};

// scroll helper: spring scroll, replay, optional pin to bottom while content grows
const kit = (st, p, o = {}) => {
  const sc = $(st, '.' + p + 'sc'), ft = $(st, '.' + p + 'ft'), h1 = $(st, '.' + p + 'h1'), w = $(st, '.' + p + 'w');
  const sp = new Track(0, S.soft); let auto = false, goal = 0, done = null, touched = false, pinTo = 0;
  const max = () => Math.max(0, sc.scrollHeight - sc.clientHeight);
  const stop = () => { auto = false; touched = true; pinTo = 0; };
  ['wheel', 'touchstart', 'pointerdown', 'mousedown', 'keydown'].forEach(e => sc.addEventListener(e, stop, { passive:true }));
  const go = (y, fn) => { sp.jump(sc.scrollTop).set(y); goal = y; auto = true; done = fn || null; };
  const top = () => go(0, () => h1 && h1.focus({ preventScroll:true }));
  const replay = () => { const m = max(); sc.scrollTop = clamp(o.start ? o.start() : Math.min(ft.offsetTop - sc.clientHeight, m - 360), 0, m); go(m); };
  const toEnd = () => { if (!touched) sc.scrollTop = max(); };
  toEnd(); document.fonts.ready.then(toEnd); requestAnimationFrame(toEnd);
  $$(st, '[data-top]').forEach(b => b.addEventListener('click', top));
  $(st, '.' + p + 'rp').addEventListener('click', replay);
  const f = fx(st, o.pal);
  return { sc, w, ft, go, top, replay, max, pin(d = 1.3){ pinTo = now() + d; },
    tick(t){ if (auto){ sc.scrollTop = sp.at(t); if (!sp.prune(t)){ sc.scrollTop = goal; auto = false; done && done(); done = null; } } else if (pinTo && t < pinTo) sc.scrollTop = max(); f(t); } };
};

// columns rise as the footer scrolls into view, 45ms apart, and reset when it leaves
const reveal = (sc, els) => {
  const R = els.map((el, i) => ({ el, i, p:new Track(0, S.soft), on:false })); let first = true;
  return () => { const base = sc.getBoundingClientRect().top, H = sc.clientHeight, t = now();
    for (const r of R){
      const y = r.el.getBoundingClientRect().top - base, want = r.on ? y < H + 6 : y < H - 24;
      if (first){ r.on = want; r.p.jump(want ? 1 : 0); }
      else if (want !== r.on){ r.on = want; r.p.set(want ? 1 : 0, want ? S.soft : S.snap, want ? t + r.i*.045 : t); }
      const o = clamp(r.p.at(t)); r.el.style.opacity = o.toFixed(3); r.el.style.transform = o > .999 ? 'none' : `translateY(${px((1 - o)*10)})`;
    }
    first = false; };
};

// two stacked text layers that swap, so a label changes without layout jumps
const tx = host => {
  const s = [0, 1].map(() => { const e = document.createElement('span'); e.style.cssText = 'position:absolute;left:0;top:0;white-space:nowrap'; host.appendChild(e); return e; });
  const sw = new Swap(0); let k = 0, cur = null;
  return { put(text, instant){ if (text === cur) return; cur = text;
      if (instant){ s[k].textContent = text; sw.cur = k; sw.prev = null; sw.t = -9; return; }
      k ^= 1; s[k].textContent = text; sw.to(k); },
    render(t){ s.forEach((e, i) => sw.apply(e, i, t, 3)); } };
};

/* ---- shared markup + css ---- */
const pageTop = p => `<div class="${p}pgw"><header class="${p}ph"><span class="${p}lg">${logo()}Northlight</span><span class="${p}pn"><span>Product</span><span>Pricing</span><span>Docs</span></span></header><article class="${p}pgi"><p class="${p}kk">Customer story</p><h1 class="${p}h1" tabindex="-1">How the Harbor Ledger moved 400 pages in a weekend</h1><p class="${p}by">Priya Raman · 6 min read</p>
<p>The Harbor Ledger covers a port city of 90,000 people with eleven staff. Its old site ran on a patchwork of plugins, and every election night the homepage slowed to a crawl.</p>
<p>In March the paper moved its archive, comment forms and newsletter to Northlight in a single weekend. Editor Marcus Bell kept a checklist taped to his monitor and crossed off 412 pages by Sunday evening.</p>
<blockquote class="${p}q">“We stopped asking which plugin broke the homepage. We just publish.”<cite>Marcus Bell, editor</cite></blockquote>
<p>Reporters now draft in the same editor that renders the live page, so there is no preview step to forget. The first story under the new setup, a council budget explainer, loaded in 0.9 seconds on a phone.</p>
<p>Readers noticed too. Newsletter signups doubled in the first month, and the sports desk has retired two freelancers’ worth of copy and paste.</p></article></div>`;

const base = p => `
.${p}r{position:absolute;inset:0;display:flex;flex-direction:column;gap:8px;padding:8px 12px 12px;min-width:0;text-align:left}
.${p}bar{flex:none;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 10px;min-height:30px}
.${p}cap{font-size:12px;color:var(--muted)}
.${p}bs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-width:0}
.${p}bar .btn{padding:4px 10px;font-size:12.5px}
.${p}w{position:relative;flex:1;min-height:0;border:0;border-radius:12px;background:var(--card);color:var(--ink);overflow:hidden;container-type:inline-size}
.${p}sc{position:absolute;inset:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--line) transparent}
.${p}pgw{min-height:660px;display:flex;flex-direction:column}
.${p}ph{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 24px;border-bottom:1px solid var(--line-soft)}
.${p}lg{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;letter-spacing:-.01em}
.${p}pn{display:flex;gap:18px;font-size:13px;color:var(--muted)}
.${p}pgi{width:100%;max-width:720px;margin:0 auto;padding:28px 24px 36px}
.${p}pgi p{margin:0 0 14px;font-size:15px;line-height:1.6;color:var(--muted)}
.${p}pgi .${p}kk{margin:0 0 10px;color:var(--accent);font-weight:600;font-size:13px}
.${p}h1{margin:0 0 10px;font-size:30px;line-height:1.1;letter-spacing:-.03em;font-weight:600;text-wrap:balance;outline:none}
.${p}pgi .${p}by{font-size:13px;color:var(--muted);margin-bottom:18px}
.${p}q{margin:18px 0;padding:0;font-size:20px;line-height:1.35;letter-spacing:-.015em;font-weight:500;color:var(--ink)}
.${p}q cite{display:block;margin-top:8px;font-size:13px;font-weight:400;font-style:normal;color:var(--muted)}
.${p}l{position:relative;display:inline-flex;align-items:center;gap:4px;color:var(--muted);text-decoration:none;font-size:13px;line-height:20px;border-radius:4px}
.${p}t{position:relative;display:inline-block}
.${p}u{position:absolute;left:0;right:0;bottom:0;height:1px;background:currentColor;transform:scaleX(0);transform-origin:left;pointer-events:none}
.${p}ar{display:inline-flex}
.${p}btt{flex:none;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px 0 14px;border:0;border-radius:999px;background:var(--raised);color:var(--muted);font-size:13px;font-weight:500;cursor:pointer}
.${p}btt:not(:has(.${p}t)){width:32px;padding:0}
.${p}ls,.${p}g ul{list-style:none;margin:0;padding:0}
@container (max-width:520px){.${p}h1{font-size:24px}.${p}ph,.${p}pgi{padding-left:18px;padding-right:18px}}
`;

const shell = (p, o) => `<style>${base(p)}${o.css || ''}</style><div class="${p}r"><div class="${p}bar"><div class="${p}bs">${o.bs || `<span class="${p}cap">${o.cap || ''}</span>`}</div><button type="button" class="btn ${p}rp">Replay scroll</button></div><div class="${p}w"><div class="${p}sc" tabindex="0" role="region" aria-label="Sample article page, scrollable">${o.top || pageTop(p)}${o.ft}</div>${o.extra || ''}</div></div>`;

const L = (p, label, o) => lk(p, label, o);
const lis = (p, items) => items.map(it => Array.isArray(it) ? `<li>${L(p, it[0], it[1])}</li>` : `<li>${L(p, it)}</li>`).join('');
const COLS = {
  Product:['Editor', 'Commerce', 'Members', 'Analytics', 'Integrations'],
  Resources:['Documentation', 'Guides', 'Templates', ['Changelog', { after:'__new__' }], ['Status', { ar:'ur' }]],
  Company:['About', 'Customers', ['Careers', { after:'__hire__' }], 'Press kit', 'Contact'],
  Legal:['Privacy', 'Terms', 'Security', 'Accessibility', 'Cookie settings'],
};
const col = (p, name, items = COLS[name], tag = 'h3') => `<div class="${p}g"><${tag}>${name}</${tag}><ul>${lis(p, items.map(it => Array.isArray(it) && it[1].after ? [it[0], { ...it[1], after:it[1].after === '__new__' ? `<span class="${p}pill">New</span>` : `<span class="${p}pill">3 open</span>` }] : it))}</ul></div>`;

const COLCSS = p => `
.${p}g{min-width:0}
.${p}g h3{margin:0 0 10px;font-size:13px;font-weight:600;color:var(--ink)}
.${p}g ul{display:flex;flex-direction:column;gap:8px}
.${p}pill{margin-left:6px;font-size:11px;line-height:16px;font-weight:600;padding:0 6px;border-radius:999px;background:var(--accent-tint);color:var(--accent)}
.${p}br{display:flex;flex-direction:column;align-items:flex-start;gap:10px;min-width:0}
.${p}brn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:16px;letter-spacing:-.01em;color:var(--ink)}
.${p}tag{margin:0;font-size:13.5px;line-height:1.5;color:var(--muted);max-width:30ch}
.${p}ad{margin:2px 0 0;font-style:normal;font-size:12.5px;line-height:1.55;color:var(--muted)}
.${p}bm{display:flex;flex-wrap:wrap;align-items:center;gap:10px 22px}
.${p}bm p{margin:0;font-size:12.5px;color:var(--muted);margin-right:auto}
.${p}bm .${p}ls{display:flex;flex-wrap:wrap;gap:4px 18px}
`;

/* ================================================================ 1. Minimal footer */
const P1 = 'ft1-';
atom({ id:'footer-minimal', cat:CAT, name:'Minimal footer', block:'site-footer (split layout), cta-button', fam:['E', 'M'], wide:true, tall:true,
  html:shell(P1, { cap:'Hover or tab to a link. Back to top springs the page home.',
    css:`.${P1}ft{border-top:1px solid var(--line);background:var(--bg)}
.${P1}in{max-width:1080px;margin:0 auto;padding:18px 24px;display:grid;grid-template-columns:1fr auto auto;grid-template-areas:"cp ls bt";align-items:center;gap:12px 28px}
.${P1}cp{grid-area:cp;margin:0;font-size:13px;color:var(--muted)}
.${P1}in>nav{grid-area:ls}
.${P1}ls{display:flex;gap:4px 22px}
.${P1}btt{grid-area:bt}
@container (max-width:520px){.${P1}in{grid-template-columns:1fr auto;grid-template-areas:"ls ls" "cp bt";padding:16px 18px}.${P1}cp{font-size:12.5px;color:var(--muted)}}`,
    ft:`<div class="${P1}ft" role="contentinfo"><div class="${P1}in"><p class="${P1}cp">© 2026 Northlight Studio, Inc.</p><nav aria-label="Footer"><ul class="${P1}ls">${lis(P1, ['Privacy', 'Terms', 'Contact'])}</ul></nav>${btt(P1)}</div></div>` }),
  desc:'Hovering or tabbing to a link draws its underline left to right on a snap spring while the text darkens; leaving wipes the line out toward the right. Back to top nudges its arrow up, then the page scrolls home on a soft spring and focus lands on the page heading. Wheel, touch or any key cancels the scroll mid-flight.',
  api:'link.p.set(hover ? 1 : 0, S.snap)   underline.scaleX = p, origin = hover ? left : right   scroll.jump(y).set(0, S.soft)',
  init(st){ const k = kit(st, P1); return t => k.tick(t); } });

/* ================================================================ 2. Centered footer */
const P2 = 'ft2-';
atom({ id:'footer-centered', cat:CAT, name:'Centered footer with social icons', block:'site-footer (centered layout), logo, social-links', fam:['E', 'M'], wide:true, tall:true,
  html:shell(P2, { cap:'Move across the social icons: one plate follows with lagging edges.',
    css:`.${P2}ft{border-top:1px solid var(--line);background:var(--bg)}
.${P2}in{max-width:760px;margin:0 auto;padding:36px 24px 20px;display:flex;flex-direction:column;align-items:center;gap:18px;text-align:center}
.${P2}brand{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:16px;letter-spacing:-.01em;color:var(--ink);text-decoration:none}
.${P2}tag{margin:-6px 0 0;color:var(--muted);font-size:14px;max-width:36ch;line-height:1.5}
.${P2}ls{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 22px}
.${P2}so{position:relative;list-style:none;margin:0;padding:0;display:flex;gap:2px}
.${P2}pl{position:absolute;top:0;bottom:0;left:0;border-radius:10px;background:var(--raised);pointer-events:none}
.${P2}so a{position:relative;width:38px;height:38px;display:grid;place-items:center;border-radius:10px;color:var(--muted);text-decoration:none}
.${P2}bm{width:100%;border-top:1px solid var(--line);padding-top:16px;margin-top:2px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 18px}
.${P2}bm p{margin:0;font-size:12.5px;color:var(--muted)}`,
    ft:`<div class="${P2}ft" role="contentinfo"><div class="${P2}in"><a href="#" class="${P2}brand" aria-label="Northlight home">${logo()}Northlight</a><p class="${P2}tag">Publishing tools for small newsrooms and the people who read them.</p>
<nav aria-label="Footer"><ul class="${P2}ls">${lis(P2, ['Product', 'Pricing', 'Docs', 'Changelog', 'About', 'Contact'])}</ul></nav>
<ul class="${P2}so" aria-label="Northlight on social media"><i class="${P2}pl"></i>${[['Source control', K.gh], ['LinkedIn', K.li], ['YouTube', K.yt], ['RSS feed', K.rss]].map(([n, d]) => `<li><a href="#" aria-label="${n}">${ic(d, 18, 1.8)}</a></li>`).join('')}</ul>
<div class="${P2}bm"><p>© 2026 Northlight Studio, Inc. · Portland, Oregon</p>${btt(P2)}</div></div></div>` }),
  desc:'Links draw their underline on hover. The social icons share one plate: entering the row fades it in under the nearest icon, moving along the row stretches it with the leading edge first and the trailing edge 60ms behind, and each glyph inks up as the plate passes under it. Back to top springs the page home.',
  api:'plate.go(l, r)   plate.o.set(hovering ? 1 : 0)   icon.color = mix(overlap(plate, icon))',
  init(st){ const k = kit(st, P2), so = $(st, '.' + P2 + 'so'), pl = $(so, '.' + P2 + 'pl'), as = $$(so, 'a'), e = edges(0, 0), o = new Track(0, S.snap); let shown = false;
    const geo = a => [a.offsetLeft, a.offsetLeft + a.offsetWidth];
    const hit = a => { const [l, r] = geo(a); shown ? e.go(l, r) : e.jump(l, r); shown = true; o.set(1, S.base); };
    const leave = () => { shown = false; o.set(0, S.snap); };
    as.forEach(a => { a.addEventListener('pointerenter', () => hit(a)); a.addEventListener('focus', () => a.matches(':focus-visible') && hit(a));
      a.addEventListener('focusout', ev => { if (!so.contains(ev.relatedTarget)) leave(); }); a.addEventListener('click', ev => ev.preventDefault()); });
    so.addEventListener('pointerleave', () => { if (!so.contains(document.activeElement) || !document.activeElement.matches(':focus-visible')) leave(); });
    return t => { k.tick(t); const a = e.A.at(t), b = e.B.at(t), v = clamp(o.at(t));
      pl.style.transform = `translateX(${px(a)})`; pl.style.width = px(b - a); pl.style.opacity = v.toFixed(3);
      as.forEach(x => { const c = clamp(1 - Math.abs((a + b)/2 - (x.offsetLeft + x.offsetWidth/2))/38)*v; x.style.color = mix(c, 'var(--ink)', 'var(--muted)'); }); }; } });

/* ================================================================ 3. Four-column footer */
const P3 = 'ft3-';
atom({ id:'footer-columns', cat:CAT, name:'Four-column footer', block:'site-footer (columns layout), footer-column', fam:['E', 'S'], wide:true, tall:true,
  html:shell(P3, { cap:'Scroll up and back down: columns rise in one at a time.',
    css:COLCSS(P3) + `.${P3}ft{border-top:1px solid var(--line);background:var(--bg)}
.${P3}in{max-width:1080px;margin:0 auto;padding:36px 24px 0}
.${P3}gr{display:grid;grid-template-columns:1.6fr repeat(4,minmax(0,1fr));gap:28px 24px}
.${P3}bm{margin-top:28px;padding:16px 0 18px;border-top:1px solid var(--line)}
@container (max-width:760px){.${P3}gr{grid-template-columns:repeat(4,minmax(0,1fr))}.${P3}br{grid-column:1/-1}}
@container (max-width:520px){.${P3}gr{grid-template-columns:repeat(2,minmax(0,1fr));gap:22px 16px}.${P3}ad,.${P3}tag{display:none}.${P3}g ul{gap:6px}.${P3}in{padding:26px 18px 0}}`,
    ft:`<div class="${P3}ft" role="contentinfo"><div class="${P3}in"><div class="${P3}gr"><div class="${P3}br"><span class="${P3}brn">${logo()}Northlight</span><p class="${P3}tag">Publishing tools for small newsrooms and the people who read them.</p><address class="${P3}ad">Northlight Studio, Inc.<br>412 SE Alder St<br>Portland, OR 97214</address></div>
${col(P3, 'Product')}${col(P3, 'Resources')}${col(P3, 'Company')}${col(P3, 'Legal')}</div>
<div class="${P3}bm"><p>© 2026 Northlight Studio, Inc. All rights reserved.</p>${btt(P3)}</div></div></div>` }),
  desc:'Brand block and four link groups. As the footer scrolls into view each block fades up 10px, left to right, 45ms apart; scrolling back out resets them so the entrance replays. Links draw underlines, and Changelog, Status and Careers carry a pill or an arrow that nudges on hover. Layout is container-driven: five columns, then brand over four columns, then two by two.',
  api:'block[i].set(top < viewBottom − 24 ? 1 : 0, S.soft, now + i·45ms)   link.underline.scaleX = hover',
  init(st){ const k = kit(st, P3), rv = reveal(k.sc, $$(st, '.' + P3 + 'gr>*')); return t => { rv(); k.tick(t); }; } });

/* ================================================================ 4. Columns + newsletter */
const P4 = 'ft4-';
atom({ id:'footer-newsletter', cat:CAT, name:'Footer with newsletter signup', block:'site-footer, footer-column, newsletter', fam:['M', 'S', 'E'], wide:true, tall:true,
  html:shell(P4, { bs:`<span class="${P4}cap">Try:</span><button type="button" class="btn ${P4}ch" data-v="priya@harborledger">Invalid</button><button type="button" class="btn ${P4}ch" data-v="bounce@harborledger.org">Server error</button><button type="button" class="btn ${P4}ch" data-v="member@harborledger.org">Already in</button>`,
    css:COLCSS(P4) + `.${P4}ft{border-top:1px solid var(--line);background:var(--bg)}
.${P4}in{max-width:1080px;margin:0 auto;padding:36px 24px 0}
.${P4}gr{display:grid;grid-template-columns:minmax(0,2fr) repeat(3,minmax(0,1fr));gap:28px 24px}
.${P4}bm{margin-top:28px;padding:16px 0 18px;border-top:1px solid var(--line)}
.${P4}nl h3{margin:6px 0 0;font-size:16px;font-weight:600;letter-spacing:-.01em;color:var(--ink)}
.${P4}nl p.${P4}sub{margin:0;font-size:13.5px;line-height:1.5;color:var(--muted);max-width:42ch}
.${P4}nl{display:flex;flex-direction:column;align-items:stretch;gap:8px;min-width:0}
.${P4}nf{margin:0;max-width:420px}
.${P4}fd{position:relative;display:flex;align-items:center;gap:6px;height:46px;padding:4px;border-radius:12px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line)}
.${P4}fd:focus-within{outline:2px solid var(--accent);outline-offset:2px}
.${P4}fd input{flex:1;min-width:0;height:100%;border:0;background:none;padding:0 10px;font:inherit;font-size:14px;color:var(--ink);outline:none!important;user-select:text;-webkit-user-select:text}
.${P4}sb{position:relative;flex:none;height:100%;width:96px;border:0;border-radius:9px;background:var(--ink);color:var(--card);font-size:13.5px;font-weight:500;cursor:pointer;overflow:hidden;white-space:nowrap}
.${P4}sl{position:absolute;inset:0;display:grid;place-items:center}
.${P4}dn{position:absolute;inset:0;display:flex;align-items:center;gap:8px;padding:0 14px;font-size:13.5px;font-weight:500;color:var(--success);pointer-events:none;white-space:nowrap}
.${P4}ms{overflow:hidden;height:0}
.${P4}m{grid-area:1/1;align-self:start;display:flex;gap:8px;align-items:flex-start;padding-top:8px;font-size:12.5px;line-height:17px;min-width:0}
.${P4}m>span:first-child{flex:none;display:flex;margin-top:1px}.${P4}m>span+span{min-width:0}
.${P4}m[data-s="err"]{color:var(--danger)}.${P4}m[data-s="warn"]{color:var(--warning)}.${P4}m[data-s="ok"]{color:var(--success)}
.${P4}mi{display:grid}
.${P4}lkb{border:0;background:none;padding:0;font:inherit;color:inherit;text-decoration:underline;text-underline-offset:2px;cursor:pointer}
@container (max-width:760px){.${P4}gr{grid-template-columns:repeat(3,minmax(0,1fr))}.${P4}nl{grid-column:1/-1}}
@container (max-width:520px){.${P4}gr{gap:22px 14px}.${P4}g ul{gap:6px}.${P4}in{padding:26px 18px 0}.${P4}pill{display:none}}`,
    ft:`<div class="${P4}ft" role="contentinfo"><div class="${P4}in"><div class="${P4}gr"><section class="${P4}nl" aria-labelledby="${P4}nh"><span class="${P4}brn">${logo()}Northlight</span><h3 id="${P4}nh">Field notes, monthly</h3><p class="${P4}sub">One email a month on what we shipped and why. 4,200 editors read it. Unsubscribe anytime.</p>
<form class="${P4}nf" novalidate><div class="${P4}fd"><input id="${P4}email" type="email" name="email" autocomplete="email" inputmode="email" placeholder="you@newsroom.org" aria-label="Email address" aria-describedby="${P4}msg"><button type="submit" class="${P4}sb" aria-label="Subscribe"></button><div class="${P4}dn" aria-hidden="true">${ic(I.check, 16, 2.5)}<span>You’re on the list</span></div></div><div class="${P4}ms" id="${P4}msg" role="status" aria-live="polite"><div class="${P4}mi"></div></div></form></section>
${col(P4, 'Product', ['Editor', 'Commerce', 'Members', 'Pricing'])}${col(P4, 'Resources', ['Guides', 'Docs', ['Changelog', { after:'__new__' }], ['Status', { ar:'ur' }]])}${col(P4, 'Company', ['About', 'Customers', ['Careers', { after:'__hire__' }], 'Contact'])}</div>
<div class="${P4}bm"><p>© 2026 Northlight Studio, Inc.</p><ul class="${P4}ls">${lis(P4, ['Privacy', 'Terms'])}</ul>${btt(P4)}</div></div></div>` }),
  desc:'Submit an invalid address and the field rings danger red while a message opens beneath. A valid one shrinks the button to a spinner, then resolves one of three ways: success turns the button green with a check, then the whole field morphs into a tinted confirmation; a server failure turns the button red with Try again; an address already on the list rings the field amber. Columns rise into view in order as the footer scrolls in.',
  api:'plan(busy → ok | err | warn)   ring = mix(ok, warning, danger)   button.w.set(44)   field.bg → success-tint   msg.to(i)',
  init(st){
    const k = kit(st, P4), rv = reveal(k.sc, $$(st, '.' + P4 + 'gr>*')), nf = $(st, 'form'), fd = $(st, '.' + P4 + 'fd'), inp = $(fd, 'input'), sb = $(fd, '.' + P4 + 'sb'), dn = $(fd, '.' + P4 + 'dn'), ms = $(st, '.' + P4 + 'ms'), mi = $(ms, '.' + P4 + 'mi');
    const spin = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 0 1 9 9"/></svg>';
    const LB = ['Subscribe', spin, ic(I.check, 18, 2.5), 'Try again'].map(c => { const e = document.createElement('span'); e.className = P4 + 'sl'; e.innerHTML = c; sb.appendChild(e); return e; });
    const sp = $(LB[1], 'svg');
    const MS = [['', ''], ['err', `<span>${ic(I.alert, 14)}</span><span>Enter an address like name@example.com.</span>`], ['err', `<span>${ic(I.alert, 14)}</span><span>We couldn’t reach the mail service, so nothing was saved. Try again in a minute.</span>`],
      ['warn', `<span>${ic(I.alert, 14)}</span><span>That address is already subscribed. <button type="button" class="${P4}lkb" data-pref>Manage preferences</button></span>`],
      ['ok', `<span>${ic(I.check, 14, 2.5)}</span><span>We sent a confirmation link to <b data-em></b>. Wrong address? <button type="button" class="${P4}lkb" data-chg>Change it</button></span>`]]
      .map(([s, h]) => { const e = document.createElement('div'); e.className = P4 + 'm'; if (s) e.dataset.s = s; e.innerHTML = h; mi.appendChild(e); return e; });
    const dg = new Track(0), wr = new Track(0), okr = new Track(0), bsu = new Track(0), bdg = new Track(0), dnT = new Track(0), bo = new Track(1), inO = new Track(1), bw = new Track(96), mh = new Track(0);
    const lsw = new Swap(0), msw = new Swap(0); let q = [], cur = 'idle';
    const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const put = o => { if (k.max() - k.sc.scrollTop < 8) k.pin(1.2); cur = o.s; dg.set(o.dg || 0); wr.set(o.wr || 0); okr.set(o.ok || 0); bsu.set(o.bsu || 0); bdg.set(o.bdg || 0); dnT.set(o.dn || 0); bo.set(o.dn ? 0 : 1, S.snap); inO.set(o.dn ? 0 : 1, S.snap); bw.set(o.bw || 96);
      lsw.to(o.lb || 0); msw.to(o.ms || 0); inp.readOnly = !!o.ro; if (o.inv) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid'); sb.disabled = !!o.ro; };
    const idle = () => { q = []; put({ s:'idle' }); };
    nf.addEventListener('submit', ev => { ev.preventDefault(); if (cur === 'busy' || cur === 'ok') return; const v = inp.value.trim();
      if (!EMAIL.test(v)){ put({ s:'inv', dg:1, ms:1, inv:true }); inp.focus(); return; }
      put({ s:'busy', lb:1, bw:44, ro:true }); const t0 = now(), out = /^bounce@/.test(v) ? 'err' : /^member@/.test(v) ? 'warn' : 'ok';
      q = [[t0 + .9, () => {
        if (out === 'err') put({ s:'err', dg:1, bdg:1, lb:3, bw:104, ms:2 });
        else if (out === 'warn') put({ s:'warn', wr:1, ms:3 });
        else { put({ s:'ok1', lb:2, bsu:1, bw:44, ro:true }); $(mi, '[data-em]').textContent = v;
          q.push([now() + .6, () => put({ s:'ok', lb:2, bsu:1, bw:44, ok:1, dn:1, ms:4 })]); } }]]; });
    inp.addEventListener('input', () => { if (cur === 'inv' || cur === 'err' || cur === 'warn') idle(); });
    $(mi, '[data-chg]').onclick = () => { idle(); inp.value = ''; inp.style.visibility = 'visible'; inp.focus(); };
    $(mi, '[data-pref]').onclick = () => idle();
    $$(st, '.' + P4 + 'ch').forEach(b => b.onclick = () => { const go = () => { inp.value = b.dataset.v; nf.requestSubmit(); };
      if (cur === 'ok' || cur === 'ok1'){ idle(); q.push([now() + .5, go]); } else go(); });
    put({ s:'idle' }); [dg, wr, okr, bsu, bdg, dnT, bo, inO, bw, mh].forEach(x => x.jump(x.target)); lsw.cur = 0; lsw.prev = null; lsw.t = -9; msw.cur = 0; msw.prev = null; msw.t = -9;
    return t => { while (q.length && q[0][0] <= t) q.shift()[1]();
      const D = clamp(dg.at(t)), W = clamp(wr.at(t)), O = clamp(okr.at(t)), N = clamp(dnT.at(t));
      fd.style.boxShadow = `inset 0 0 0 1.5px ${mix(O, 'var(--success)', mix(W, 'var(--warning)', mix(D, 'var(--danger)', 'var(--line)')))}`;
      fd.style.background = mix(N, 'var(--success-tint)', 'var(--card)');
      const su = clamp(bsu.at(t)), bd = clamp(bdg.at(t)); sb.style.width = px(Math.max(0, bw.at(t))); sb.style.background = mix(su, 'var(--success)', mix(bd, 'var(--danger)', 'var(--ink)')); sb.style.color = mix(clamp(su + bd), '#fff', 'var(--card)');
      sb.style.opacity = clamp(bo.at(t)).toFixed(3); sb.style.pointerEvents = bo.target ? 'auto' : 'none';
      fade(inp, inO.at(t), null); inp.style.visibility = inO.target || inO.at(t) > .01 ? 'visible' : 'hidden';
      fade(dn, N, (1 - N)*4);
      LB.forEach((e, i) => lsw.apply(e, i, t, 4)); sp.style.transform = `rotate(${(t*420 % 360).toFixed(1)}deg)`;
      MS.forEach((e, i) => msw.apply(e, i, t, 3));
      const mh_ = msw.cur ? MS[msw.cur].offsetHeight : 0; if (Math.abs(mh_ - mh.target) > .5) mh.set(mh_); ms.style.height = px(Math.max(0, mh.at(t)));
      rv(); k.tick(t); }; } });

/* ================================================================ 5. Accordion on mobile, columns on desktop */
const P5 = 'ft5-';
const g5 = (p, name, i) => `<section class="${p}g"><h3 class="${p}hw">${name}</h3><h3 class="${p}hn"><button type="button" class="${p}gh">${name}<i class="${p}cv">${ic(I.chev, 16, 2)}</i></button></h3><div class="${p}gp"><div class="${p}gi"><ul>${lis(p, COLS[name].map(it => Array.isArray(it) && it[1].after ? [it[0], { ...it[1], after:it[1].after === '__new__' ? `<span class="${p}pill">New</span>` : `<span class="${p}pill">3 open</span>` }] : it))}</ul></div></div></section>`;
atom({ id:'footer-accordion', cat:CAT, name:'Accordion footer on mobile', block:'site-footer, footer-column (accordion at narrow widths)', fam:['M', 'E'], wide:true, tall:true,
  html:shell(P5, { bs:`<span class="${P5}cap">Below 520px the columns fold. Tap a heading.</span><button type="button" class="btn ${P5}dv" aria-pressed="true">Dividers on</button>`,
    css:COLCSS(P5) + `.${P5}ft{border-top:1px solid var(--line);background:var(--bg)}
.${P5}in{max-width:1080px;margin:0 auto;padding:36px 24px 0}
.${P5}gr{display:grid;grid-template-columns:1.6fr repeat(4,minmax(0,1fr));gap:28px 24px}
.${P5}bm{margin-top:28px;padding:16px 0 18px;border-top:1px solid var(--line)}
.${P5}hn{display:none}
.${P5}gp{display:block}
.${P5}w[data-n] .${P5}hw{display:none}
.${P5}w[data-n] .${P5}hn{display:block;margin:0}
.${P5}w[data-n] .${P5}gr{display:flex;flex-direction:column;gap:0}
.${P5}w[data-n] .${P5}gr>:not(:last-child){border-bottom:1px solid var(--line)}
.${P5}w[data-n][data-dd] .${P5}gr>:not(:last-child){border-bottom-color:transparent}
.${P5}w[data-n] .${P5}br{padding-bottom:20px}
.${P5}w[data-n] .${P5}gp{overflow:hidden}
.${P5}w[data-n] .${P5}gi{padding:0 0 14px}
.${P5}w[data-n] .${P5}g li{min-height:30px;display:flex;align-items:center}
.${P5}w[data-n] .${P5}in{padding:26px 18px 0}
.${P5}w[data-n] .${P5}ad{display:none}
.${P5}gh{width:100%;height:48px;display:flex;align-items:center;justify-content:space-between;border:0;background:none;padding:0;font:inherit;font-size:14px;font-weight:600;color:var(--ink);cursor:pointer;text-align:left}
.${P5}cv{display:flex;color:var(--muted)}
.${P5}w[data-n] .${P5}bm{margin-top:0;border-top:1px solid var(--line)}
@container (max-width:760px){.${P5}gr{grid-template-columns:repeat(4,minmax(0,1fr))}.${P5}br{grid-column:1/-1}}`,
    ft:`<div class="${P5}ft" role="contentinfo"><div class="${P5}in"><div class="${P5}gr"><div class="${P5}br"><span class="${P5}brn">${logo()}Northlight</span><p class="${P5}tag">Publishing tools for small newsrooms and the people who read them.</p><address class="${P5}ad">Northlight Studio, Inc.<br>412 SE Alder St<br>Portland, OR 97214</address></div>
${['Product', 'Resources', 'Company', 'Legal'].map((n, i) => g5(P5, n, i)).join('')}</div>
<div class="${P5}bm"><p>© 2026 Northlight Studio, Inc.</p>${btt(P5)}</div></div></div>` }),
  desc:'Below 520px each column becomes a disclosure: the chevron rotates 180° and the panel’s height springs open while its links rise in one after another, 70ms apart. Other sections keep their own state. If the footer was at the bottom of the page the scroll stays pinned there, so the opening list is never pushed off screen. At wider widths the same markup is plain columns and the buttons disappear.',
  api:'o[i].set(open ? 1 : 0)   panel.h = o·content.h   chevron.rotate = o·180°   li[j].a = clamp((o − j·0.07)/0.5)',
  init(st){
    const k = kit(st, P5), w = k.w, sc = k.sc;
    const dv = $(st, '.' + P5 + 'dv'); let dd = false;
    dv.onclick = () => { dd = !dd; w.toggleAttribute('data-dd', dd); dv.setAttribute('aria-pressed', String(!dd)); dv.textContent = dd ? 'Dividers off' : 'Dividers on'; };
    const G = $$(st, '.' + P5 + 'g').map((g, i) => ({ g, b:$(g, 'button'), pn:$(g, '.' + P5 + 'gp'), gi:$(g, '.' + P5 + 'gi'), cv:$(g, '.' + P5 + 'cv'), li:$$(g, '.' + P5 + 'gi li'), o:new Track(0), open:false })); let narrow = null;
    const mode = n => { narrow = n; w.toggleAttribute('data-n', n);
      G.forEach(x => { x.o.jump(x.open ? 1 : 0);
        if (n){ x.b.setAttribute('aria-expanded', String(x.open)); x.pn.inert = !x.open; }
        else { x.pn.inert = false; x.pn.style.cssText = ''; x.cv.style.transform = ''; x.li.forEach(l => l.style.cssText = ''); } }); };
    G.forEach((x, i) => { x.b.id = P5 + 'h' + i; x.pn.id = P5 + 'p' + i; x.b.setAttribute('aria-controls', x.pn.id); x.pn.setAttribute('role', 'region'); x.pn.setAttribute('aria-labelledby', x.b.id);
      x.b.addEventListener('click', () => { x.open = !x.open; x.o.set(x.open ? 1 : 0, x.open ? S.base : S.snap); x.b.setAttribute('aria-expanded', String(x.open)); x.pn.inert = !x.open; if (k.max() - sc.scrollTop < 8) k.pin(); });
      x.b.addEventListener('keydown', ev => { const key = ev.key, n = G.length; let j = -1;
        if (key === 'ArrowDown') j = (i + 1) % n; else if (key === 'ArrowUp') j = (i - 1 + n) % n; else if (key === 'Home') j = 0; else if (key === 'End') j = n - 1;
        if (j >= 0){ ev.preventDefault(); G[j].b.focus(); } }); });
    return t => { const n = w.clientWidth < 520; if (n !== narrow) mode(n);
      if (narrow) G.forEach(x => { const o = clamp(x.o.at(t));
        x.pn.style.height = px(o*x.gi.offsetHeight); x.pn.style.visibility = o < .005 ? 'hidden' : 'visible'; x.cv.style.transform = `rotate(${(o*180).toFixed(2)}deg)`;
        x.li.forEach((l, j) => { const a = clamp((o - j*.07)/.5); l.style.opacity = a.toFixed(3); l.style.transform = a > .999 ? 'none' : `translateY(${px((1 - a)*-6)})`; }); });
      k.tick(t); }; } });

/* ================================================================ 6. Language / region picker + theme toggle */
const P6 = 'ft6-';
const LOC = [
  ['English (United States)', 'English (US)', { tag:'Publishing tools for small newsrooms.', h1:'Product', h2:'Resources', h3:'Company', a1:'Editor', a2:'Commerce', a3:'Pricing', b1:'Guides', b2:'Changelog', b3:'Help', c1:'About', c2:'Careers', c3:'Contact', l1:'Privacy', l2:'Terms', l3:'Cookies' }],
  ['English (United Kingdom)', 'English (UK)', { tag:'Publishing tools for small newsrooms.', h1:'Product', h2:'Resources', h3:'Company', a1:'Editor', a2:'Commerce', a3:'Pricing', b1:'Guides', b2:'Changelog', b3:'Help', c1:'About', c2:'Careers', c3:'Contact', l1:'Privacy', l2:'Terms', l3:'Cookies' }],
  ['Español (México)', 'Español (MX)', { tag:'Herramientas de publicación para redacciones pequeñas.', h1:'Producto', h2:'Recursos', h3:'Empresa', a1:'Editor', a2:'Tienda', a3:'Precios', b1:'Guías', b2:'Novedades', b3:'Ayuda', c1:'Nosotros', c2:'Empleo', c3:'Contacto', l1:'Privacidad', l2:'Términos', l3:'Cookies' }],
  ['Français (France)', 'Français (FR)', { tag:'Des outils de publication pour les petites rédactions.', h1:'Produit', h2:'Ressources', h3:'Entreprise', a1:'Éditeur', a2:'Boutique', a3:'Tarifs', b1:'Guides', b2:'Nouveautés', b3:'Aide', c1:'À propos', c2:'Carrières', c3:'Contact', l1:'Confidentialité', l2:'Conditions', l3:'Cookies' }],
  ['Deutsch (Deutschland)', 'Deutsch (DE)', { tag:'Publishing-Werkzeuge für kleine Redaktionen.', h1:'Produkt', h2:'Ressourcen', h3:'Unternehmen', a1:'Editor', a2:'Shop', a3:'Preise', b1:'Anleitungen', b2:'Neuigkeiten', b3:'Hilfe', c1:'Über uns', c2:'Karriere', c3:'Kontakt', l1:'Datenschutz', l2:'AGB', l3:'Cookies' }],
  ['Português (Brasil)', 'Português (BR)', { tag:'Ferramentas de publicação para redações pequenas.', h1:'Produto', h2:'Recursos', h3:'Empresa', a1:'Editor', a2:'Loja', a3:'Preços', b1:'Guias', b2:'Novidades', b3:'Ajuda', c1:'Sobre', c2:'Carreiras', c3:'Contato', l1:'Privacidade', l2:'Termos', l3:'Cookies' }],
].map(([name, short, d]) => ({ name, d:{ ...d, cur:short } }));
const k6 = (key, cls) => `<span data-k="${key}"${cls ? ` class="${cls}"` : ''}></span>`;
const TH = { light:{ bg:'#F3F5F7', tile:'#FAFCFE', card:'#FFFFFF', raised:'#ECEEF0', ink:'#10141A', muted:'#5B5E63', faint:'#85888C', line:'#DCDEE0', 'line-soft':'#EBEDEF', accent:'#595D17', 'accent-tint':'#EAECE7' },
  dark:{ bg:'#0C1016', tile:'#11161C', card:'#171B21', raised:'#23272C', ink:'#EFF2F6', muted:'#ABAEB3', faint:'#82868A', line:'#2A2F36', 'line-soft':'#1E2228', accent:'#939668', 'accent-tint':'#23261A' } };
atom({ id:'footer-region-theme', cat:CAT, name:'Footer with language picker and theme toggle', block:'site-footer, locale switcher, ThemeToggle', fam:['X', 'S', 'M', 'E'], wide:true, tall:true,
  html:shell(P6, { cap:'Pick a language: the footer copy swaps. Try the theme toggle.',
    css:COLCSS(P6) + `.${P6}ft{border-top:1px solid var(--line);background:var(--bg)}
.${P6}in{max-width:1080px;margin:0 auto;padding:36px 24px 0}
.${P6}gr{display:grid;grid-template-columns:1.6fr repeat(3,minmax(0,1fr));gap:28px 24px}
.${P6}bm{margin-top:28px;padding:16px 0 18px;border-top:1px solid var(--line);gap:12px 18px}
.${P6}bm .${P6}ls{margin-right:auto}
.${P6}ct{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-left:auto}
.${P6}lg6{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 10px;border:0;border-radius:9px;background:var(--raised);color:var(--ink);font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap}
.${P6}lg6 svg{flex:none;color:var(--muted)}
.${P6}tg{position:relative;display:flex;padding:3px;border-radius:10px;background:var(--raised)}
.${P6}tg button{position:relative;width:32px;height:28px;display:grid;place-items:center;border:0;background:none;border-radius:7px;color:var(--muted);cursor:pointer}
.${P6}tp{position:absolute;top:3px;bottom:3px;left:0;background:var(--card);border-radius:7px;box-shadow:var(--shadow);pointer-events:none}
.${P6}btt{border:1.5px solid var(--muted)}.${P6}pp{position:absolute;left:0;top:0;width:min(264px,calc(100% - 16px));background:var(--card);border:0;border-radius:12px;box-shadow:var(--shadow);visibility:hidden;opacity:0}
.${P6}hd{padding:10px 14px 4px;font-size:12px;color:var(--muted)}
.${P6}lb{position:relative;padding:4px 6px 6px;outline:none!important}
.${P6}hl{position:absolute;left:6px;right:6px;top:0;height:0;border-radius:7px;background:var(--raised);pointer-events:none}
.${P6}op{position:relative;display:flex;align-items:center;justify-content:space-between;gap:8px;height:34px;padding:0 10px;border-radius:7px;font-size:13.5px;cursor:pointer}
.${P6}ck{display:flex;color:var(--accent)}
.${P6}btt:not(:has(.${P6}t)){width:32px;height:32px}
.${P6}ft [data-k]{display:inline-block}
@container (max-width:760px){.${P6}gr{grid-template-columns:repeat(3,minmax(0,1fr))}.${P6}br{grid-column:1/-1}}
@container (max-width:520px){.${P6}gr{gap:22px 14px}.${P6}in{padding:26px 18px 0}.${P6}bm .${P6}ls{order:1;flex:1;margin-right:0}.${P6}btt{order:2}.${P6}ct{order:3;width:100%;margin-left:0}.${P6}bm p{width:100%}}`,
    ft:`<div class="${P6}ft" role="contentinfo"><div class="${P6}in"><div class="${P6}gr"><div class="${P6}br"><span class="${P6}brn">${logo()}Northlight</span><p class="${P6}tag">${k6('tag')}</p></div>
<div class="${P6}g"><h3>${k6('h1')}</h3><ul><li>${lk(P6, k6('a1'))}</li><li>${lk(P6, k6('a2'))}</li><li>${lk(P6, k6('a3'))}</li></ul></div>
<div class="${P6}g"><h3>${k6('h2')}</h3><ul><li>${lk(P6, k6('b1'))}</li><li>${lk(P6, k6('b2'))}</li><li>${lk(P6, k6('b3'))}</li></ul></div>
<div class="${P6}g"><h3>${k6('h3')}</h3><ul><li>${lk(P6, k6('c1'))}</li><li>${lk(P6, k6('c2'))}</li><li>${lk(P6, k6('c3'))}</li></ul></div></div>
<div class="${P6}bm"><p>© 2026 Northlight Studio, Inc.</p><ul class="${P6}ls"><li>${lk(P6, k6('l1'))}</li><li>${lk(P6, k6('l2'))}</li><li>${lk(P6, k6('l3'))}</li></ul>
<div class="${P6}ct"><button type="button" class="${P6}lg6" aria-haspopup="listbox" aria-expanded="false" aria-label="Language and region">${ic(K.globe, 16, 1.8)}${k6('cur')}${ic(I.chev, 14, 2)}</button>
<div class="${P6}tg" role="radiogroup" aria-label="Theme"><i class="${P6}tp"></i>${[['system', 'System', K.mon], ['light', 'Light', K.sun], ['dark', 'Dark', K.moon]].map(([m, n, d]) => `<button type="button" role="radio" aria-checked="false" aria-label="${n}" title="${n}" data-m="${m}">${ic(d, 16, 1.8)}</button>`).join('')}</div></div>${btt(P6, '')}</div></div></div>`,
    extra:`<div class="${P6}pp" aria-hidden="true"><div class="${P6}hd">Language and region</div><div class="${P6}lb" role="listbox" tabindex="-1" aria-label="Language and region"><i class="${P6}hl"></i></div></div>` }),
  desc:'The language button opens a list above itself (below if there is no room) that grows from the button; one highlight plate follows hover and arrow keys with lagging edges. Choosing a language moves the check, closes the list, and every footer string swaps: out in 100ms, back in, staggered 12ms apart down the page. The theme toggle slides one plate between System, Light and Dark while every colour in the page below cross-fades on one spring; System keeps following the real page theme.',
  api:'pop.o.set(open)   hl.go(top, bottom)   strings[i].swap(at = now + i·12ms)   page.color = mix(dark, light, theme.at(t))',
  init(st){
    const k = kit(st, P6), w = k.w, tr = $(st, '.' + P6 + 'lg6'), pp = $(st, '.' + P6 + 'pp'), lb = $(pp, '.' + P6 + 'lb'), hl = $(pp, '.' + P6 + 'hl');
    // language list
    const opts = LOC.map((l, i) => { const b = document.createElement('div'); b.id = P6 + 'o' + i; b.className = P6 + 'op'; b.setAttribute('role', 'option'); b.setAttribute('aria-selected', String(i === 0)); b.innerHTML = `<span>${l.name}</span><span class="${P6}ck">${ic(I.check, 14, 2.5)}</span>`; lb.appendChild(b); return { b, ck:$(b, '.' + P6 + 'ck'), t:new Track(i === 0 ? 1 : 0, S.snap) }; });
    const o = new Track(0), e = edges(0, 0), hlo = new Track(0, S.snap); let open = false, sel = 0, hi = 0, up = true;
    const geo = i => [opts[i].b.offsetTop, opts[i].b.offsetTop + opts[i].b.offsetHeight];
    const setHi = (i, inst) => { hi = i; inst ? e.jump(...geo(i)) : e.go(...geo(i)); lb.setAttribute('aria-activedescendant', opts[i].b.id); };
    const setOpen = (v, back) => { if (v === open) return; open = v; openSet(o, v); tr.setAttribute('aria-expanded', String(v)); pp.setAttribute('aria-hidden', String(!v)); pp.inert = !v;
      if (v){ pp.style.visibility = 'visible'; place(); setHi(sel, true); hlo.set(1, S.snap); lb.focus({ preventScroll:true }); } else { hlo.set(0, S.snap); if (back) tr.focus(); } };
    // translatable strings
    const T = $$(st, '[data-k]').map((el, i) => ({ el, k:el.dataset.k, at:0, pend:null, inn:null }));
    let cur = LOC[0].d; T.forEach(x => x.el.textContent = cur[x.k]);
    const choose = i => { sel = i; opts.forEach((x, j) => { x.t.set(j === i ? 1 : 0); x.b.setAttribute('aria-selected', String(j === i)); }); cur = LOC[i].d; const t0 = now();
      T.forEach((x, j) => { if (cur[x.k] !== (x.pend ?? x.el.textContent)){ x.pend = cur[x.k]; x.at = Math.max(t0 + j*.012, 0); } });
      if (k.max() - k.sc.scrollTop < 8) k.pin(1.2); w.setAttribute('lang', ['en-US', 'en-GB', 'es-MX', 'fr-FR', 'de-DE', 'pt-BR'][i]); setOpen(false, true); };
    const move = j => setHi((j + opts.length) % opts.length);
    tr.addEventListener('click', () => setOpen(!open));
    tr.addEventListener('keydown', ev => { if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp'){ ev.preventDefault(); setOpen(true); } });
    lb.addEventListener('keydown', ev => { const key = ev.key;
      if (key === 'ArrowDown'){ ev.preventDefault(); move(hi + 1); } else if (key === 'ArrowUp'){ ev.preventDefault(); move(hi - 1); }
      else if (key === 'Home'){ ev.preventDefault(); move(0); } else if (key === 'End'){ ev.preventDefault(); move(opts.length - 1); }
      else if (key === 'Enter' || key === ' '){ ev.preventDefault(); choose(hi); }
      else if (key === 'Escape'){ ev.preventDefault(); ev.stopPropagation(); setOpen(false, true); } else if (key === 'Tab') setOpen(false); });
    opts.forEach((x, i) => { x.b.addEventListener('pointerenter', () => { if (i !== hi) setHi(i); }); x.b.addEventListener('click', () => choose(i)); });
    outside(st, [pp, tr], () => open && setOpen(false));
    const place = () => { const wr = w.getBoundingClientRect(), tb = tr.getBoundingClientRect(), h = pp.offsetHeight, wd = pp.offsetWidth;
      up = tb.top - wr.top > h + 12; pp.style.transformOrigin = up ? '0 100%' : '0 0';
      pp.style.left = px(clamp(tb.left - wr.left, 8, w.clientWidth - wd - 8)); pp.style.top = px(up ? tb.top - wr.top - h - 8 : tb.bottom - wr.top + 8); };
    // theme toggle
    const tg = $(st, '.' + P6 + 'tg'), tp = $(tg, '.' + P6 + 'tp'), tbs = $$(tg, 'button'), te = edges(0, 0), MODES = ['system', 'light', 'dark'], mq = matchMedia('(prefers-color-scheme: dark)');
    const pageDark = () => { const a = document.documentElement.dataset.theme; return a ? a === 'dark' : mq.matches; };
    const th = new Track(pageDark() ? 1 : 0, S.base); let mode = 'system', applied = false;
    const tgeo = b => [b.offsetLeft, b.offsetLeft + b.offsetWidth];
    const pick = (i, inst) => { mode = MODES[i]; tbs.forEach((b, j) => { b.setAttribute('aria-checked', String(j === i)); b.tabIndex = j === i ? 0 : -1; }); inst ? te.jump(...tgeo(tbs[i])) : te.go(...tgeo(tbs[i])); };
    tbs.forEach((b, i) => { b.addEventListener('click', () => pick(i)); b.addEventListener('keydown', ev => { const key = ev.key, d = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 0; if (d){ ev.preventDefault(); const j = (i + d + 3) % 3; pick(j); tbs[j].focus(); } }); });
    const initTg = () => pick(0, true); document.fonts.ready.then(initTg); initTg();
    return t => {
      // strings: exit 100ms, swap text, enter on the spring
      for (const x of T){
        if (x.pend !== null && t >= x.at + EXIT){ x.el.textContent = x.pend; x.pend = null; x.inn = x.at + EXIT; }
        let a = 1, y = 0, b = 0;
        if (x.pend !== null){ if (t >= x.at){ const q = clamp((t - x.at)/EXIT), qq = q*q; a = 1 - qq; b = qq*BLUR; y = -qq*3; } }
        else if (x.inn !== null){ const q = clamp(prog(t, x.inn)); a = q; b = (1 - q)*BLUR; y = (1 - q)*3; if (q > .999) x.inn = null; }
        x.el.style.opacity = a.toFixed(3); x.el.style.transform = a > .999 ? 'none' : `translateY(${px(y)})`; x.el.style.filter = b > .05 ? `blur(${b.toFixed(2)}px)` : 'none';
      }
      // language popover
      const po = o.at(t); if (po > .002 || open) place(); pop(pp, po, up ? 6 : -6); if (po < .01 && !open) pp.style.visibility = 'hidden';
      { const a = e.A.at(t), b = e.B.at(t); plate(hl, a, b); hl.style.opacity = clamp(hlo.at(t)).toFixed(3); }
      opts.forEach(x => { x.ck.style.opacity = clamp(x.t.at(t)).toFixed(3); });
      // theme: effective dark target, morph tokens on the page frame only
      th.set(mode === 'dark' || (mode === 'system' && pageDark()) ? 1 : 0);
      const d = clamp(th.at(t)), settled = !th.prune(t);
      if (mode === 'system' && settled){ if (applied){ for (const kk in TH.light) w.style.removeProperty('--' + kk); applied = false; } }
      else { for (const kk in TH.light) w.style.setProperty('--' + kk, `color-mix(in oklab, ${TH.dark[kk]} ${(d*100).toFixed(1)}%, ${TH.light[kk]})`); applied = true; }
      { const a = te.A.at(t), b = te.B.at(t); tp.style.transform = `translateX(${px(a)})`; tp.style.width = px(b - a);
        tbs.forEach(x => { const c = clamp(1 - Math.abs((a + b)/2 - (x.offsetLeft + x.offsetWidth/2))/32); x.style.color = mix(c, 'var(--ink)', 'var(--muted)'); }); }
      k.tick(t); }; } });

/* ================================================================ 7. Status footer */
const P7 = 'ft7-';
const COMP = ['Editor', 'Publishing', 'Media delivery', 'Public API', 'Billing'];
const WORD = ['Operational', 'Degraded', 'Outage'];
atom({ id:'footer-status', cat:CAT, name:'Footer with live status', block:'site-footer, StatusBadge, legal links', fam:['M', 'S', 'X'], wide:true, tall:true,
  html:shell(P7, { bs:`<span class="${P7}cap">Simulate:</span><button type="button" class="btn ${P7}sb" data-s="ok" aria-pressed="true">Operational</button><button type="button" class="btn ${P7}sb" data-s="deg" aria-pressed="false">Degraded</button><button type="button" class="btn ${P7}sb" data-s="out" aria-pressed="false">Outage</button>`,
    css:`.${P7}ft{border-top:1px solid var(--line);background:var(--bg)}
.${P7}in{max-width:1080px;margin:0 auto;padding:28px 24px 0}
.${P7}top{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:16px}
.${P7}brand{display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.${P7}brn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:16px;letter-spacing:-.01em}
.${P7}tag{margin:0;font-size:13.5px;line-height:1.5;color:var(--muted);max-width:32ch}
.${P7}pl{position:relative;display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 10px 0 12px;border:0;border-radius:999px;background:var(--success-tint);color:var(--ink);font-size:13.5px;font-weight:500;cursor:pointer;white-space:nowrap}
.${P7}dt{flex:none;width:8px;height:8px;border-radius:50%;background:var(--success)}
.${P7}pt{position:relative;display:block;height:20px;line-height:20px}
.${P7}pm{position:absolute;visibility:hidden;pointer-events:none;white-space:nowrap}
.${P7}cv{display:flex;color:var(--muted)}
.${P7}inc{overflow:hidden;height:0}
.${P7}ii{padding-top:14px;display:grid}
.${P7}ib{grid-area:1/1;align-self:start;display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:10px;background:var(--warning-tint)}
.${P7}ib[data-i="out"]{background:var(--danger-tint)}
.${P7}ib>span{flex:none;display:flex;margin-top:1px}
.${P7}ib[data-i="deg"]>span{color:var(--warning)}.${P7}ib[data-i="out"]>span{color:var(--danger)}
.${P7}ib b{display:block;font-size:13.5px;font-weight:600;color:var(--ink)}
.${P7}ib p{margin:2px 0 6px;font-size:13px;line-height:1.5;color:var(--muted)}
.${P7}det{overflow:hidden;height:0;visibility:hidden}
.${P7}di{padding-top:14px}
.${P7}cg{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:0 28px;list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.${P7}cr{display:flex;align-items:center;gap:10px;height:38px;border-bottom:1px solid var(--line-soft);font-size:13px}
.${P7}rd{flex:none;width:8px;height:8px;border-radius:50%;background:var(--success)}
.${P7}rn{flex:1;color:var(--ink)}
.${P7}rs{position:relative;flex:none;width:76px;height:18px;line-height:18px;font-size:12.5px;color:var(--muted)}
.${P7}up{margin:10px 0 0;font-size:12.5px;color:var(--muted)}
.${P7}bm{display:flex;flex-wrap:wrap;align-items:center;gap:10px 22px;margin-top:24px;padding:16px 0 18px;border-top:1px solid var(--line)}
.${P7}bm p{margin:0 auto 0 0;font-size:12.5px;color:var(--muted)}
.${P7}bm .${P7}ls{display:flex;flex-wrap:wrap;gap:4px 18px}
@container (max-width:520px){.${P7}in{padding:22px 18px 0}.${P7}bm p{width:100%}}`,
    ft:`<div class="${P7}ft" role="contentinfo"><div class="${P7}in"><div class="${P7}top"><div class="${P7}brand"><span class="${P7}brn">${logo()}Northlight</span><p class="${P7}tag">Publishing tools for small newsrooms and the people who read them.</p></div>
<button type="button" class="${P7}pl" aria-label="Show details" aria-expanded="false" aria-controls="${P7}det"><i class="${P7}dt"></i><span class="${P7}pt" aria-live="polite"></span><span class="${P7}pm" aria-hidden="true"></span><i class="${P7}cv">${ic(I.chev, 14, 2)}</i></button></div>
<div class="${P7}inc"><div class="${P7}ii" role="status"><div class="${P7}ib" data-i="deg"><span>${ic(I.alert, 16)}</span><div><b>Publishing is slower than usual</b><p>Some pages take up to a minute to go live. The editor and drafts are not affected. Next update by 14:30 UTC.</p>${lk(P7, 'View incident', { ar:'ur' })}</div></div>
<div class="${P7}ib" data-i="out"><span>${ic(I.alert, 16)}</span><div><b>Publishing and the public API are down</b><p>We are working on a fix. Published sites keep serving from cache. Next update by 14:30 UTC.</p>${lk(P7, 'View incident', { ar:'ur' })}</div></div></div></div>
<div class="${P7}det" id="${P7}det"><div class="${P7}di"><ul class="${P7}cg">${COMP.map(c => `<li class="${P7}cr"><i class="${P7}rd"></i><span class="${P7}rn">${c}</span><span class="${P7}rs"></span></li>`).join('')}</ul><p class="${P7}up">99.98% uptime over the last 90 days</p></div></div>
<div class="${P7}bm"><p>© 2026 Northlight Studio, Inc.</p><ul class="${P7}ls">${lis(P7, ['Privacy', 'Terms', 'Security', 'Cookie settings'])}</ul>${btt(P7)}</div></div></div>` }),
  desc:'The pill is one element. Switching state morphs its dot and tint along green, amber, red on a single value; the label swaps out then in while the pill springs to the new text width. Next, the incident note opens beneath it (height first, then content) and, if the details list is open, each affected service dot changes colour 45ms after the last. Clicking the pill opens the per-service list; if the page was at the bottom it stays pinned there as the list opens.',
  api:'g.set(0 | 1 | 2)   dot, tint = mix(g)   label.to(i)   pill.w.set(measure(label))   row[i].c.set(v, now + i·45ms)',
  init(st){
    const k = kit(st, P7), pill = $(st, '.' + P7 + 'pl'), dot = $(pill, '.' + P7 + 'dt'), pt = $(pill, '.' + P7 + 'pt'), pm = $(pill, '.' + P7 + 'pm'), cv = $(pill, '.' + P7 + 'cv'), det = $(st, '.' + P7 + 'det'), di = $(det, '.' + P7 + 'di'), inc = $(st, '.' + P7 + 'inc'), ii = $(inc, '.' + P7 + 'ii');
    const ST = { ok:{ i:0, label:'All systems operational', c:[0, 0, 0, 0, 0] }, deg:{ i:1, label:'Degraded performance', c:[0, 1, 0, 0, 0] }, out:{ i:2, label:'Partial outage', c:[0, 2, 0, 2, 0] } };
    const rows = $$(st, '.' + P7 + 'cr').map(r => ({ dot:$(r, '.' + P7 + 'rd'), tx:tx($(r, '.' + P7 + 'rs')), c:new Track(0, S.base), v:0 }));
    const lab = tx(pt), g = new Track(0, S.base), lw = new Track(150, S.base), dO = new Track(0), iO = new Track(0), ih = new Track(0), isw = new Swap('deg'), ib = $$(st, '.' + P7 + 'ib'), btns = $$(st, '.' + P7 + 'sb'); let q = [], cur = 'ok', open = false, LW = {};
    const meas = () => { for (const kk in ST) LW[kk] = Math.ceil(measureW(pm, ST[kk].label)) + 2; lw.jump(LW[cur]); }; document.fonts.ready.then(meas); meas();
    rows.forEach(r => r.tx.put(WORD[0], true)); lab.put(ST.ok.label, true);
    const setS = kk => { if (kk === cur) return; const s = ST[kk], t0 = now(); cur = kk; if (k.max() - k.sc.scrollTop < 8) k.pin(1.4);
      btns.forEach(b => { const on = b.dataset.s === kk; b.setAttribute('aria-pressed', String(on)); b.classList.toggle('ink', on); });
      g.set(s.i); lab.put(s.label); lw.set(LW[kk]); if (kk !== 'ok') isw.to(kk); iO.set(kk === 'ok' ? 0 : 1, kk === 'ok' ? S.snap : S.base, kk === 'ok' ? t0 : t0 + .08);
      rows.forEach((r, i) => { const v = s.c[i]; if (v === r.v) return; r.v = v; const at = t0 + .1 + i*.045; r.c.set(v, S.base, at); q.push([at, () => r.tx.put(WORD[v])]); }); q.sort((a, b) => a[0] - b[0]); };
    btns.forEach(b => { b.addEventListener('click', () => setS(b.dataset.s)); }); btns[0].classList.add('ink');
    isw.cur = 'deg'; isw.prev = null; isw.t = -9;
    pill.addEventListener('click', () => { open = !open; dO.set(open ? 1 : 0, open ? S.base : S.snap); pill.setAttribute('aria-expanded', String(open)); det.style.visibility = 'visible'; if (k.max() - k.sc.scrollTop < 8) k.pin(); });
    const col = c => c <= 1 ? mix(c, 'var(--warning)', 'var(--success)') : mix(c - 1, 'var(--danger)', 'var(--warning)');
    const tint = c => c <= 1 ? mix(c, 'var(--warning-tint)', 'var(--success-tint)') : mix(c - 1, 'var(--danger-tint)', 'var(--warning-tint)');
    return t => { while (q.length && q[0][0] <= t) q.shift()[1]();
      const G = clamp(g.at(t), 0, 2); pill.style.background = tint(G); pill.style.boxShadow = `inset 0 0 0 1px color-mix(in oklab, ${col(G)} 38%, transparent)`; dot.style.background = col(G);
      pt.style.width = px(lw.at(t)); lab.render(t);
      rows.forEach(r => { r.dot.style.background = col(clamp(r.c.at(t), 0, 2)); r.tx.render(t); });
      const d = clamp(dO.at(t)); cv.style.transform = `rotate(${(d*180).toFixed(2)}deg)`; det.style.height = px(d*di.offsetHeight); fade(di, d, (1 - d)*-4, false); if (d < .005 && !open) det.style.visibility = 'hidden';
      const act = ib.find(e => e.dataset.i === isw.cur), want = act.offsetHeight + 14; if (Math.abs(want - ih.target) > .5) ih.set(want, S.base);
      const i = clamp(iO.at(t)); inc.style.height = px(i*ih.at(t)); fade(ii, i, (1 - i)*-4, false);
      ib.forEach(e => isw.apply(e, e.dataset.i, t, 3)); ib.forEach(e => { e.style.pointerEvents = e.dataset.i === isw.cur ? 'auto' : 'none'; });
      k.tick(t); }; } });

/* ================================================================ 8. Sticky reveal footer */
const P8 = 'ft8-';
atom({ id:'footer-reveal', cat:CAT, name:'Sticky reveal footer', block:'site-footer (reveal), cta-button', fam:['M', 'E', 'D'], wide:true, tall:true,
  html:shell(P8, { cap:'Scroll the page: it slides up and the footer is uncovered beneath.',
    css:`.${P8}main{position:relative;z-index:1;background:var(--card);box-shadow:var(--shadow);border-radius:0 0 0 0}
.${P8}pgw{min-height:640px}
.${P8}ft{position:sticky;bottom:0;z-index:0;background:#0C1016;color:#EFF2F6;--fi:#EFF2F6;--fm:#ABAEB3;--fl:#2A2F36;--fr:#23272C}
.${P8}ft a:focus-visible,.${P8}ft button:focus-visible{outline-color:#EFF2F6}
.${P8}fi{max-width:1080px;margin:0 auto;padding:36px 24px 0;will-change:transform}
.${P8}gr{display:grid;grid-template-columns:1.5fr repeat(3,minmax(0,1fr));gap:28px 24px}
.${P8}brn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:16px;letter-spacing:-.01em;color:var(--fi);margin-bottom:22px}
.${P8}cta h2{margin:0;font-size:30px;line-height:1.08;letter-spacing:-.03em;font-weight:600;color:var(--fi);text-wrap:balance;max-width:16ch}
.${P8}cta p{margin:10px 0 18px;font-size:13.5px;line-height:1.5;color:var(--fm);max-width:34ch}
.${P8}go{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 14px 0 16px;border-radius:10px;background:#EFF2F6;color:#0C1016;font-size:14px;font-weight:500;text-decoration:none}
.${P8}go .${P8}ar{display:inline-flex}
.${P8}g h3{margin:0 0 10px;font-size:13px;font-weight:600;color:var(--fi)}
.${P8}g ul{display:flex;flex-direction:column;gap:8px}
.${P8}ft .${P8}l{color:var(--fm)}
.${P8}bm{display:flex;flex-wrap:wrap;align-items:center;gap:10px 22px;margin-top:30px;padding:16px 0 18px;border-top:1px solid var(--fl)}
.${P8}bm p{margin:0 auto 0 0;font-size:12.5px;color:var(--fm)}
.${P8}bm .${P8}ls{display:flex;flex-wrap:wrap;gap:4px 18px}
.${P8}ft .${P8}btt{background:#0C1016;border-color:var(--fl);color:var(--fm)}
@container (max-width:760px){.${P8}gr{grid-template-columns:minmax(0,1.25fr) repeat(3,minmax(0,1fr));gap:22px 18px}.${P8}cta h2{font-size:24px}.${P8}cta p{display:none}.${P8}cta .${P8}go{margin-top:16px}.${P8}bm{margin-top:22px}}
@container (max-width:520px){.${P8}fi{padding:24px 18px 0}.${P8}gr{grid-template-columns:repeat(3,minmax(0,1fr));gap:20px 12px}.${P8}cta{grid-column:1/-1}.${P8}brn{margin-bottom:14px}.${P8}bm p{width:100%}}`,
    top:`<div class="${P8}main">${pageTop(P8)}</div>`,
    ft:`<div class="${P8}ft" role="contentinfo"><div class="${P8}fi"><div class="${P8}gr"><div class="${P8}cta"><span class="${P8}brn">${logo('#0C1016')}Northlight</span><h2>Publish something worth reading</h2><p>Free for newsrooms under five people. No card, no plugin hunt.</p><a href="#" class="${P8}go" data-fx="arrow"><span>Start publishing</span><i class="${P8}ar" data-ar="r">${ic(K.arR, 16, 2)}</i></a></div>
<div class="${P8}g"><h3>Product</h3><ul>${lis(P8, ['Editor', 'Commerce', 'Members', 'Pricing'])}</ul></div>
<div class="${P8}g"><h3>Resources</h3><ul>${lis(P8, ['Guides', 'Docs', 'Changelog', ['Status', { ar:'ur' }]])}</ul></div>
<div class="${P8}g"><h3>Company</h3><ul>${lis(P8, ['About', 'Customers', 'Careers', 'Contact'])}</ul></div></div>
<div class="${P8}bm"><p>© 2026 Northlight Studio, Inc.</p><ul class="${P8}ls">${lis(P8, ['Privacy', 'Terms'])}</ul>${btt(P8)}</div></div></div>` }),
  desc:'The page is one layer sitting above a footer that is pinned to the bottom of the viewport. Scrolling is the only input: once the page’s bottom edge reaches the viewport bottom, reveal progress is (scroll + view − page) ÷ footer height. The page’s bottom corners round in over the first tenth, and the footer content drifts down 40px and brightens as it is uncovered. Until it shows, the footer is inert so Tab cannot land under the page.',
  api:'r = clamp((scrollTop + viewH − main.h) / footer.h)   main.radius = 18·clamp(10r)   content.y = (r − 1)·40   footer.inert = r < .02',
  init(st){
    const p = P8, sc0 = $(st, '.' + p + 'sc'), main = $(sc0, '.' + p + 'main'), ft = $(sc0, '.' + p + 'ft'), fi = $(ft, '.' + p + 'fi');
    const k = kit(st, p, { start:() => main.offsetHeight - sc0.clientHeight, pal:{ hi:'#EFF2F6', lo:'#ABAEB3', bgHi:'#23272C', bgLo:'#0C1016', lnHi:'#ABAEB3', lnLo:'#2A2F36' } }); let inert = null;
    return t => { const r = clamp((sc0.scrollTop + sc0.clientHeight - main.offsetHeight)/Math.max(1, ft.offsetHeight)), rad = 18*clamp(r*10);
      main.style.borderRadius = `0 0 ${rad.toFixed(2)}px ${rad.toFixed(2)}px`; fi.style.transform = `translateY(${px((r - 1)*40)})`; fi.style.opacity = (.35 + .65*clamp(r*1.6)).toFixed(3);
      const i = r < .02; if (i !== inert){ inert = i; ft.inert = i; }
      k.tick(t); }; } });

})();