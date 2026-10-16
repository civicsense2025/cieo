

/* ---------- Footers, set two (organisms): wordmark, CTA band, sitemap, live widgets, app and trust, disclosure, contact and hours, full ---------- */
(() => {
const E = (tag, css, text) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; };
const queue = () => { const q = []; return { at(t, fn){ q.push([t, fn]); q.sort((a, b) => a[0] - b[0]); }, run(t){ while (q.length && q[0][0] <= t) q.shift()[1](); }, clear(){ q.length = 0; } }; };
const noNav = st => st.addEventListener('click', e => { if (e.target.closest('a[href="#"]')) e.preventDefault(); });
// where an element sits inside the scrolling page, independent of offsetParent
const topIn = (el, pg) => frameLayout(el).rect.top - frameLayout(pg).rect.top + frameLayout(pg).st;
// one value followed by several springs, each starting a little later than the one before
const follow = (trs, v, t, gap = .035) => trs.forEach((x, i) => x.set(v, S.soft, t + i*gap));
const DK = p => `.${p}dk{--ink:#EFF2F6;--muted:#ABAEB3;--faint:#82868A;--line:#2A2F36;--line-soft:#1E2228;--card:#171B21;--raised:#23272C;--accent:#939668;--accent-tint:#23261A;--success:#A3A76E;--success-tint:#23261A;--danger:#D0584F;--danger-tint:#2E1A19;--warning:#D6822F;--warning-tint:#2D2114;background:#0C1016;color:var(--ink)}`;

// the scrolling faux page every footer sits under
const faux = (p, o) => `<div class="${p}xf"><div class="${p}xh"><b class="${p}xm"></b><span class="${p}xn">${o.brand}</span><span class="${p}xl">${o.nav.map(n => `<span>${n}</span>`).join('')}</span></div><small class="${p}xk">${o.kicker}</small><h2 class="${p}xq">${o.title}</h2><p>${o.a}</p><p>${o.b}</p></div>`;
const fauxCss = p => `
.${p}pg{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;container-type:inline-size;background:var(--tile);overscroll-behavior:contain;scrollbar-width:thin}
.${p}xf{padding:16px clamp(16px,4cqw,36px) 30px;display:flex;flex-direction:column;gap:10px;text-align:left}
.${p}xh{display:flex;align-items:center;gap:9px;height:30px;margin-bottom:14px}
.${p}xm{width:18px;height:18px;border-radius:5px;background:var(--ink)}
.${p}xn{font-size:14px;font-weight:600;letter-spacing:-.01em}
.${p}xl{display:none;gap:16px;margin-left:14px;font-size:13px;color:var(--muted)}
.${p}xk{font-size:12px;color:var(--muted);font-weight:500}
.${p}xq{margin:0;font-size:clamp(22px,5cqw,30px);line-height:1.15;letter-spacing:-.025em;font-weight:600;max-width:24ch;text-wrap:balance}
.${p}xf p{margin:0;max-width:62ch;font-size:14px;line-height:1.55;color:var(--muted)}
@container (min-width:520px){.${p}xl{display:inline-flex}}`;

// link columns shared by most footers
const cols = (p, data) => data.map(([h, ls]) => `<div class="${p}c"><h4 class="${p}h">${h}</h4><ul class="${p}u">${ls.map(l => `<li><a class="${p}lk" href="#"${Array.isArray(l) ? ` data-k="${l[1]}"` : ''}><span>${Array.isArray(l) ? l[0] : l}</span><i></i></a></li>`).join('')}</ul></div>`).join('');
const colCss = p => `
.${p}h{margin:0 0 8px;font-size:12px;font-weight:500;color:var(--muted);letter-spacing:.01em}
.${p}u{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:1px}
.${p}lk{position:relative;display:inline-block;color:var(--muted);text-decoration:none;font-size:14px;line-height:1.35;padding:3px 0}
.${p}lk i{position:absolute;left:0;right:0;bottom:2px;height:1px;background:currentColor;pointer-events:none}`;

// link hover: the underline's leading edge moves first and the trailing edge follows after LAG, and the text color follows the leading edge.
// extra tracks on a link (a._tr) keep it awake until they settle.
const links = (root, sel) => {
  const act = new Set(), all = $$(root, sel);
  const draw = (a, t) => {
    const e = a._e, l = clamp(e.A.at(t)), r = clamp(e.B.at(t)), m = a._m ? clamp(a._m.at(t)) : 0;
    const L = Math.min(l, m > .01 ? 0 : 1), R = Math.max(r, m);
    a._u.style.clipPath = `inset(0 ${((1 - R)*100).toFixed(1)}% 0 ${(L*100).toFixed(1)}%)`;
    a.style.color = mix(Math.max(clamp(r - l), m), 'var(--ink)', 'var(--muted)');
    if (a._o){ const o = clamp(a._o.at(t)); a.style.opacity = o.toFixed(3); a.style.filter = o < .98 ? `blur(${((1 - o) * BLUR * .5).toFixed(2)}px)` : 'none'; }
  };
  all.forEach(a => {
    const u = $(a, 'i'); if (!u) return;
    a._e = edges(0, 0); a._u = u; u.style.clipPath = 'inset(0 100% 0 0)';
    const on = () => { if (a._e.A.target === 1){ a._e.jump(0, 0); } a._e.go(0, 1); act.add(a); };
    const off = () => { a._e.go(1, 1); act.add(a); };
    a.addEventListener('pointerenter', on); a.addEventListener('pointerleave', off); a.addEventListener('focus', on); a.addEventListener('blur', off);
  });
  const render = t => act.forEach(a => {
    draw(a, t);
    const busy = [a._e.A, a._e.B, ...(a._tr || [])].some(x => x.prune(t));
    if (!busy) act.delete(a);
  });
  render.wake = a => act.add(a);
  render.all = all;
  return render;
};

// scroll the faux page on a critically damped spring; any wheel, touch, key or press cancels it
const smooth = pg => {
  const y = new Track(0, S.soft); let on = false;
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(n => pg.addEventListener(n, () => { on = false; }, { passive:true }));
  return {
    to(v){ y.jump(pg.scrollTop); y.set(v); on = true; },
    render(t){ if (!on) return; const v = y.at(t); pg.scrollTop = v; if (Math.abs(v - y.target) < .5){ pg.scrollTop = y.target; on = false; } }
  };
};

// a button that presses down on the snap spring; returns its 0..1 hover and press tracks
const hoverTr = (el, over = S.base) => {
  const h = new Track(0, over), d = new Track(0, S.snap);
  const on = () => h.set(1), off = () => { h.set(0); d.set(0); };
  el.addEventListener('pointerenter', on); el.addEventListener('pointerleave', off); el.addEventListener('focus', on); el.addEventListener('blur', off);
  el.addEventListener('pointerdown', () => d.set(1)); el.addEventListener('pointerup', () => d.set(0));
  return { h, d };
};

// a text field that blur-swaps between two stacked layers
const swapText = (host, css = '') => {
  const s = [0, 1].map(() => { const e = E('span', 'position:absolute;left:0;top:0;white-space:nowrap;' + css); host.appendChild(e); return e; });
  const sw = new Swap(0); let k = 0, cur = null;
  return { put(text, instant){ if (text === cur) return; cur = text;
      if (instant){ s[k].textContent = text; sw.cur = k; sw.prev = null; sw.t = -9; return; }
      k ^= 1; s[k].textContent = text; sw.to(k); },
    el(){ return s[k]; },
    render(t){ s.forEach((e, i) => sw.apply(e, i, t, 4)); } };
};

// a position that advances at a constant velocity, where velocity changes ease on a critically damped spring.
// closed form: P(t) = P0 + v·(t − t0) + Σ ∫ spring, with ∫0..d x0(1 + wτ)e^(−wτ) dτ = x0/w · (2 − e^(−wd)(2 + wd))
class Cruise {
  constructor(v){ this.v = v; this.P = 0; this.t0 = 0; this.ev = []; }
  set(v, cfg = S.soft, t = now()){ if (v === this.v) return this; this.P += this.v * (t - this.t0); this.t0 = t; this.ev.push({ t, x0:this.v - v, w:cfg.w }); this.v = v; return this; }
  at(t){ let p = this.P + this.v * (t - this.t0);
    for (const e of this.ev){ const d = t - e.t; if (d <= 0) continue; const w = REDUCE ? e.w * 1.8 : e.w, E = Math.exp(-w * d); p += e.x0 / w * (2 - E * (2 + w * d)); }
    return p; }
  prune(t){ this.ev = this.ev.filter(e => { if (t - e.t < 2) return true; this.P += e.x0 / (REDUCE ? e.w * 1.8 : e.w) * 2; return false; }); }
}

const ARROW = ic('<path d="M5 12h14M13 6l6 6-6 6"/>', 16, 2);
const UPR = ic('<path d="M7 17 17 7M8 7h9v9"/>', 13, 2);
const SHIELD = '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>';


/* ================================================================ 1. Giant wordmark footer */
atom({ id:'fz1-wordmark', cat:'Footers', name:'Giant wordmark footer', block:'SiteFooter (brand wordmark variant)', fam:['E','S','T'], wide:true, tall:true,
  html:`<style>
${fauxCss('fz1-')}${DK('fz1-')}${colCss('fz1-')}
.fz1-ft{padding:clamp(28px,6cqw,56px) clamp(16px,4cqw,36px) 0;display:flex;flex-direction:column;gap:clamp(28px,5cqw,48px);text-align:left}
.fz1-top{display:grid;gap:28px}
.fz1-tag{margin:0;font-size:clamp(20px,3.4cqw,28px);line-height:1.2;letter-spacing:-.02em;font-weight:500;max-width:19ch;text-wrap:balance}
.fz1-sub{margin:10px 0 0;font-size:14px;color:var(--muted);max-width:36ch;line-height:1.5}
.fz1-cs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:26px 16px}
.fz1-mid{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid var(--line);padding-top:16px}
.fz1-st{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)}
.fz1-st b{width:8px;height:8px;border-radius:50%;background:var(--success)}
.fz1-up{display:inline-flex;align-items:center;gap:8px;border:0;background:var(--raised);border-radius:999px;padding:7px 13px 7px 15px;font-size:13px;font-weight:500;cursor:pointer}
.fz1-wm{overflow:hidden}
.fz1-wt{display:inline-block;white-space:nowrap;font-weight:600;letter-spacing:-.045em;margin-left:-.025em;line-height:.9;color:var(--ink);font-size:100px;padding-bottom:.04em}
.fz1-wt span{display:inline-block}
.fz1-bot{display:flex;flex-wrap:wrap;gap:6px 18px;padding:14px 0 18px;font-size:12.5px;color:var(--muted)}
.fz1-bot a{color:inherit;text-decoration:none}
.fz1-bot a:hover{color:var(--ink)}
@container (min-width:560px){.fz1-cs{grid-template-columns:repeat(4,minmax(0,1fr))}}
@container (min-width:900px){.fz1-top{grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:48px}}
</style>
<div class="fz1-pg" tabindex="0" role="region" aria-label="Sample page, scroll to reach the footer">
${faux('fz1-', { brand:'Parcel', nav:['Product', 'Pricing', 'Docs'], kicker:'Changelog · October 2026', title:'Label rules now run before the carrier call', a:'Rate shopping used to happen after a label was purchased, which is why a rule that preferred ground over air still paid for air. The rule engine now runs first, so the cheaper service is the one you are billed for.', b:'Existing rules keep working without changes. Open Settings, then Shipping rules, to see which of them would have picked a different carrier last month.' })}
<div class="fz1-ft fz1-dk" role="contentinfo">
  <div class="fz1-top">
    <div><p class="fz1-tag">Shipping software for stores that ship every day.</p><p class="fz1-sub">Labels, returns and tracking pages in one place. Built in Lisbon and Austin since 2019.</p></div>
    <nav class="fz1-cs" aria-label="Footer">${cols('fz1-', [['Product', ['Tracking pages', 'Returns portal', 'Rate shopping', 'Label API', 'Analytics']], ['Company', ['About', 'Careers', 'Press kit', 'Contact']], ['Resources', ['Documentation', 'Guides', 'Changelog', 'Carrier status']], ['Legal', ['Privacy', 'Terms', 'Data processing', 'Security']]])}</nav>
  </div>
  <div class="fz1-mid"><span class="fz1-st" role="status"><b></b>All systems normal</span><button type="button" class="fz1-up">Back to top ${ic('<path d="M12 19V5M6 11l6-6 6 6"/>', 14, 2)}</button></div>
  <div class="fz1-wm" aria-hidden="true"><span class="fz1-wt">${[...'parcel'].map(c => `<span>${c}</span>`).join('')}</span></div>
  <div class="fz1-bot"><span>© 2026 Parcel Labs, Inc.</span><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookie settings</a></div>
</div></div>`,
  desc:'The wordmark is sized to the width of the footer and rises letter by letter as the page scrolls it into view. Each letter follows the scroll position on the soft spring, starting 35ms after the one before it, so p leads and l trails, and scrolling back up lowers them again. Link underlines wipe in from the left and leave to the right, and Back to top scrolls on a spring that any wheel or touch cancels.',
  api:'v = clamp((scrollTop + H − wordmarkTop) / wordmarkH)   letter[i].set(v, S.soft, t + i·0.035)   top.set(0)',
  init(st){
    noNav(st);
    const pg = $(st, '.fz1-pg'), wm = $(st, '.fz1-wm'), wt = $(st, '.fz1-wt'), L = $$(wt, 'span'), lk = links(st, '.fz1-lk'), sm = smooth(pg);
    const ts = L.map(() => new Track(0, S.soft)); let tgt = -1, fitW = 0, w100 = 0;
    $(st, '.fz1-up').onclick = () => sm.to(0);
    // size the wordmark so its natural width equals the footer width
    const fit = () => { const W = wm.clientWidth; if (!W) return;
      wt.style.fontSize = '100px'; w100 = wt.offsetWidth; wt.style.fontSize = (W * 100 / w100).toFixed(2) + 'px'; fitW = wm.clientWidth; };
    document.fonts.ready.then(() => { fitW = 0; });
    return t => {
      sm.render(t); lk(t);
      if (wm.clientWidth !== fitW) fit();
      const H = pg.clientHeight, top = topIn(wm, pg), h = wm.offsetHeight || 1;
      const v = Math.round(clamp((pg.scrollTop + H - top) / (h * 1.05)) * 50) / 50;
      if (v !== tgt){ tgt = v; follow(ts, v, t); }
      L.forEach((l, i) => { l.style.transform = `translateY(${((1 - clamp(ts[i].at(t))) * 108).toFixed(2)}%)`; });
    };
  }});


/* ================================================================ 2. CTA band footer */
atom({ id:'fz2-ctaband', cat:'Footers', name:'Call-to-action band footer', block:'SiteFooter (CTA band variant), Button', fam:['M','E','S'], wide:true, tall:true,
  html:`<style>
${fauxCss('fz2-')}${DK('fz2-')}${colCss('fz2-')}
.fz2-ft{padding:6px clamp(12px,3cqw,24px) 0;text-align:left}
.fz2-band{border-radius:22px;padding:clamp(24px,5cqw,52px);display:grid;gap:26px 40px}
.fz2-hl{margin:0;font-size:clamp(30px,5.6cqw,60px);line-height:1.04;letter-spacing:-.035em;font-weight:600;max-width:15ch}
.fz2-wd{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.14em;margin-bottom:-.14em}
.fz2-wd span{display:inline-block}
.fz2-eb{display:block;font-size:13px;color:var(--muted);margin-bottom:14px}
.fz2-r{display:flex;flex-direction:column;gap:22px;justify-content:flex-end;min-width:0}
.fz2-ba{display:flex;flex-wrap:wrap;align-items:center;gap:14px 24px}
.fz2-btn{display:inline-flex;align-items:center;height:54px;padding:0 24px;border:0;background:var(--ink);color:#0C1016;font-size:16px;font-weight:600;letter-spacing:-.01em;cursor:pointer;border-radius:14px;white-space:nowrap}
.fz2-ar{display:inline-flex;width:0;overflow:hidden;opacity:0}
.fz2-ar svg{flex:none}
.fz2-sec.fz2-lk{font-size:15px;font-weight:500}
.fz2-pf{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;font-size:13.5px;color:var(--muted)}
.fz2-pf li{display:flex;gap:9px;align-items:center}
.fz2-pf svg{flex:none;color:var(--success)}
.fz2-cs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:26px 16px;padding:clamp(28px,5cqw,48px) clamp(4px,1cqw,12px) 8px}
.fz2-bot{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;border-top:1px solid var(--line);padding:16px 4px 20px;font-size:12.5px;color:var(--muted)}
.fz2-bot b{display:inline-flex;align-items:center;gap:8px;color:var(--ink);font-size:14px;font-weight:600}
.fz2-bot b i{width:16px;height:16px;border-radius:5px;background:var(--ink)}
@container (min-width:520px){.fz2-cs{grid-template-columns:repeat(3,minmax(0,1fr))}}
@container (min-width:760px){.fz2-band{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)}}
@container (min-width:900px){.fz2-cs{grid-template-columns:repeat(5,minmax(0,1fr))}}
</style>
<div class="fz2-pg" tabindex="0" role="region" aria-label="Sample page, scroll to reach the footer">
${faux('fz2-', { brand:'Tidewell', nav:['Features', 'Pricing', 'Customers'], kicker:'Guide · Getting paid', title:'How to chase a late invoice without losing the client', a:'Most late payments are not refusals. They are invoices that went to the wrong inbox, or sat in an approval queue nobody told you about. Start with a short, specific reminder that restates the amount, the due date and a link to pay.', b:'If a second reminder goes unanswered after seven days, switch channel. A two-line phone call settles more invoices than a third email.' })}
<div class="fz2-ft" role="contentinfo">
  <section class="fz2-band fz2-dk" aria-labelledby="fz2-hd">
    <div><span class="fz2-eb">Free for 30 days. No card needed.</span><h2 class="fz2-hl" id="fz2-hd">Send your first invoice in under five minutes.</h2></div>
    <div class="fz2-r">
      <div class="fz2-ba"><button type="button" class="fz2-btn"><span class="fz2-bl">Start free trial</span><span class="fz2-ar">${ARROW}</span></button><a class="fz2-lk fz2-sec" href="#"><span>Book a demo</span><i></i></a></div>
      <ul class="fz2-pf"><li>${ic(I.check, 15, 2.5)}Import clients from a spreadsheet</li><li>${ic(I.check, 15, 2.5)}Bank transfer, card and direct debit</li><li>${ic(I.check, 15, 2.5)}Cancel any time from Settings</li></ul>
    </div>
  </section>
  <nav class="fz2-cs" aria-label="Footer">${cols('fz2-', [['Product', ['Invoicing', 'Quotes', 'Expenses', 'Payment links', 'Reports']], ['Solutions', ['Freelancers', 'Agencies', 'Consultants', 'Accountants']], ['Learn', ['Guides', 'Templates', 'Tax calendar', 'Help centre']], ['Company', ['About', 'Customers', 'Careers', 'Contact']], ['Legal', ['Privacy', 'Terms', 'Security', 'Cookies']]])}</nav>
  <div class="fz2-bot"><b><i></i>Tidewell</b><span>© 2026 Tidewell Software Ltd.</span><span>Registered in England and Wales, no. 11874390</span></div>
</div></div>`,
  desc:'Once 96px of the band is on screen, the eyebrow fades up first, then the headline words rise out of their masks 45ms apart, then the actions and reassurances follow in the same order. The button is one element that morphs on hover: it widens to make room for the arrow, its corners round from 14 to a full pill, its fill turns from light to the accent, and it presses in 3% on the snap spring. Link underlines wipe in from the left and leave to the right.',
  api:'v = scrollTop + H − bandTop > 96 ? 1 : 0   item[i].set(v, S.soft, t + i·0.045)   btn: w, r, fill = hover.set(1)   press: d.set(1, S.snap)',
  init(st){
    noNav(st);
    const pg = $(st, '.fz2-pg'), band = $(st, '.fz2-band'), hl = $(st, '.fz2-hl'), btn = $(st, '.fz2-btn'), ar = $(st, '.fz2-ar'), lk = links(st, '.fz2-lk');
    hl.innerHTML = hl.textContent.split(' ').map(w => `<span class="fz2-wd"><span>${w}</span></span>`).join(' ');
    const eb = $(st, '.fz2-eb'), words = $$(hl, '.fz2-wd span'), rest = [$(st, '.fz2-ba'), ...$$(st, '.fz2-pf li')];
    const trs = [eb, ...words, ...rest].map(() => new Track(0, S.soft)); let tgt = -1;
    const hv = hoverTr(btn);
    return t => {
      lk(t);
      const H = pg.clientHeight, top = topIn(band, pg);
      const v = pg.scrollTop + H - top > 96 ? 1 : 0;
      if (v !== tgt){ tgt = v; follow(trs, v, t, .045); }
      { const p = clamp(trs[0].at(t)); fade(eb, p, (1 - p) * 8); }
      words.forEach((w, i) => { w.style.transform = `translateY(${((1 - clamp(trs[i + 1].at(t))) * 110).toFixed(2)}%)`; });
      rest.forEach((e, i) => { const p = clamp(trs[words.length + 1 + i].at(t)); fade(e, p, (1 - p) * 12); });
      const h1 = clamp(hv.h.at(t)), d = clamp(hv.d.at(t));
      ar.style.width = px(h1 * 20); ar.style.opacity = h1.toFixed(3); ar.style.transform = `translateX(${px((1 - h1) * -8)})`;
      ar.style.marginLeft = px(h1 * 8);
      btn.style.borderRadius = px(lerp(14, 27, h1));
      btn.style.background = mix(h1, 'var(--accent)', 'var(--ink)');
      btn.style.transform = `scale(${(1 - .03 * d).toFixed(4)})`;
    };
  }});


/* ================================================================ 3. Mega footer with sitemap search */
atom({ id:'fz3-sitemap', cat:'Footers', name:'Mega footer with sitemap search', block:'SiteFooter (mega variant), SearchField', fam:['E','S','T'], wide:true, tall:true,
  html:`<style>
${fauxCss('fz3-')}${colCss('fz3-')}
.fz3-ft{background:var(--raised);padding:clamp(24px,4.5cqw,44px) clamp(16px,4cqw,36px) 0;text-align:left;display:flex;flex-direction:column;gap:clamp(20px,3cqw,32px)}
.fz3-hd{display:flex;flex-direction:column;gap:16px}
.fz3-tt{margin:0;font-size:clamp(20px,3cqw,26px);letter-spacing:-.02em;font-weight:600;line-height:1.15}
.fz3-sub{margin:4px 0 0;font-size:14px;color:var(--muted)}
.fz3-sl{display:block;font-size:12px;font-weight:500;color:var(--muted);margin-bottom:6px}
.fz3-fd{position:relative;display:flex;align-items:center;height:44px;border:1.5px solid var(--muted);background:var(--card);border-radius:12px;padding:0 10px 0 12px;gap:8px;max-width:420px}
.fz3-fd:focus-within{border-color:var(--ink)}
.fz3-fd>svg{flex:none;color:var(--muted)}
.fz3-q{flex:1;min-width:0;border:0;background:none;color:var(--ink);font:15px var(--sans);outline:none;height:100%}
.fz3-q:focus-visible{outline:none}
.fz3-ky{position:relative;flex:none;width:28px;height:24px}
.fz3-kb,.fz3-x{position:absolute;inset:0;display:grid;place-items:center}
.fz3-kb{background:var(--raised);border-radius:6px;font:12px var(--mono);color:var(--muted);pointer-events:none}
.fz3-x{border:0;background:var(--raised);border-radius:6px;color:var(--muted);cursor:pointer;padding:0}
.fz3-rd{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:13px;color:var(--muted);height:20px}
.fz3-dg{font-weight:600;color:var(--ink);font-size:13px;display:inline-flex}
.fz3-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.fz3-em{height:0;overflow:hidden;font-size:13.5px;color:var(--muted);margin-top:-12px}
.fz3-cs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 16px}
.fz3-lk{font-size:13.5px}
.fz3-bot{display:flex;flex-wrap:wrap;gap:6px 18px;border-top:1px solid var(--line);padding:14px 0 18px;font-size:12.5px;color:var(--muted)}
.fz3-bot b{color:var(--ink);font-weight:600}
@container (min-width:520px){.fz3-cs{grid-template-columns:repeat(4,minmax(0,1fr))}}
@container (min-width:700px){.fz3-hd{flex-direction:row;justify-content:space-between;align-items:flex-end}.fz3-fd{width:380px}}
@container (min-width:900px){.fz3-cs{grid-template-columns:repeat(7,minmax(0,1fr))}}
</style>
<div class="fz3-pg" tabindex="0" role="region" aria-label="Sample page, scroll to reach the footer">
${faux('fz3-', { brand:'Northgate Cloud', nav:['Platform', 'Pricing', 'Docs'], kicker:'Engineering · Regions', title:'Frankfurt joins the network with two availability zones', a:'Workloads in the new region can attach to the same private networks as Amsterdam and Paris. Latency between zones is under two milliseconds, which is low enough to run a primary and a synchronous replica across them.', b:'Managed Postgres, object storage and queues are available today. Compute reservations open to all plans from the first of the month.' })}
<div class="fz3-ft" role="contentinfo">
  <div class="fz3-hd">
    <div><h2 class="fz3-tt">Every page on Northgate</h2><p class="fz3-sub">Type a topic and the rest of the map steps back.</p></div>
    <div><label class="fz3-sl" for="fz3-q">Search the sitemap</label>
      <div class="fz3-fd">${ic(I.search, 16, 2)}<input id="fz3-q" class="fz3-q" type="text" autocomplete="off" spellcheck="false" placeholder="Try billing, api or jobs" aria-controls="fz3-map"><span class="fz3-ky"><span class="fz3-kb" aria-hidden="true">/</span><button type="button" class="fz3-x" aria-label="Clear search">${ic(I.x, 14, 2)}</button></span></div>
      <div class="fz3-rd" role="status"><span aria-hidden="true" style="display:inline-flex;gap:6px"><span class="fz3-dg"></span><span>of 42 pages</span></span><span class="fz3-vh">42 of 42 pages</span></div></div>
  </div>
  <div class="fz3-em" aria-hidden="true"><span class="fz3-emt"></span></div>
  <nav class="fz3-cs" id="fz3-map" aria-label="Sitemap">${cols('fz3-', [
    ['Platform', [['Compute', 'servers vm instances runtime'], ['Managed Postgres', 'database sql db'], ['Object storage', 'files buckets blobs'], ['Edge network', 'cdn latency regions'], ['Queues and cron', 'jobs background schedule'], ['Observability', 'logs metrics traces monitoring']]],
    ['Solutions', [['Startups', 'early stage credits'], ['E-commerce', 'retail checkout storefront'], ['Fintech', 'payments compliance banking'], ['Media streaming', 'video audio'], ['Public sector', 'government fedramp'], ['Gaming', 'multiplayer realtime']]],
    ['Developers', [['Documentation', 'docs guides'], ['API reference', 'rest openapi endpoints'], ['Command line', 'cli terminal shell'], ['SDKs', 'libraries node python go api'], ['Terraform provider', 'infrastructure as code iac'], ['Incident history', 'status outage uptime']]],
    ['Pricing', [['Plans', 'compare tiers'], ['Cost calculator', 'estimate price'], ['Startup credits', 'program discount'], ['Invoices', 'billing payments receipts'], ['Reserved capacity', 'commit savings'], ['Education', 'students discounts']]],
    ['Resources', [['Blog', 'articles posts'], ['Case studies', 'customers stories'], ['Webinars', 'events video'], ['Architecture center', 'reference diagrams'], ['Whitepapers', 'reports research'], ['Community forum', 'help questions']]],
    ['Company', [['About', 'team mission'], ['Careers', 'jobs hiring openings'], ['Press', 'media news'], ['Partners', 'resellers integrators'], ['Investors', 'funding'], ['Contact sales', 'talk pricing']]],
    ['Support', [['Help centre', 'faq articles'], ['Open a ticket', 'contact issue billing'], ['Trust centre', 'security compliance soc iso'], ['Report abuse', 'spam'], ['Accessibility', 'a11y wcag'], ['Privacy and terms', 'legal gdpr policies']]]])}</nav>
  <div class="fz3-bot"><b>Northgate Cloud</b><span>© 2026 Northgate Systems GmbH</span><a class="fz3-lk" href="#" style="padding:0;font-size:12.5px"><span>Imprint</span><i></i></a></div>
</div></div>`,
  desc:'Typing filters the whole map at once. Every link that does not match steps back to 16% opacity with a slight blur, 5ms apart in reading order, while matches stay full and underline from the left. A column with no match dims its heading, the count rolls its digits, and no results opens a one-line hint below the field. Enter or the down arrow moves focus to the first match, Escape clears, and the slash key focuses the field from anywhere in the footer.',
  api:'link.o.set(hit ? 1 : .16, S.base, t + i·0.005)   link.m.set(hit ? 1 : 0)   heading.o.set(any ? 1 : .35)   count.set(n)',
  init(st){
    noNav(st);
    const inp = $(st, '.fz3-q'), clr = $(st, '.fz3-x'), kb = $(st, '.fz3-kb'), em = $(st, '.fz3-em'), emt = $(st, '.fz3-emt'), vh = $(st, '.fz3-vh');
    const lk = links(st, '.fz3-lk'), dg = new Digits($(st, '.fz3-dg'), 2);
    const items = lk.all.filter(a => a.dataset.k).map(a => ({ a, txt:(a.textContent + ' ' + a.dataset.k).toLowerCase(), o:new Track(1, S.base), m:new Track(0, S.soft), hit:true }));
    items.forEach(it => { it.a._o = it.o; it.a._m = it.m; it.a._tr = [it.o, it.m]; });
    const heads = $$(st, '.fz3-c').map(c => ({ c, h:$(c, '.fz3-h'), items:items.filter(it => c.contains(it.a)), o:new Track(1, S.base) }));
    const eh = new Track(0), eo = new Track(0), ksw = new Swap(0);
    dg.set('42', true);
    const apply = () => {
      const toks = inp.value.toLowerCase().split(/\s+/).filter(Boolean), t0 = now(); let n = 0;
      items.forEach((it, k) => {
        it.hit = toks.every(tk => it.txt.includes(tk)); if (it.hit) n++;
        it.o.set(it.hit ? 1 : .16, S.base, t0 + k * .005); it.m.set(toks.length && it.hit ? 1 : 0, S.soft, t0 + k * .005); lk.wake(it.a);
      });
      heads.forEach(c => c.o.set(c.items.some(it => it.hit) ? 1 : .35));
      dg.set(String(n)); vh.textContent = `${n} of 42 pages`;
      if (!n){ emt.textContent = `No pages match “${inp.value.trim()}”. Try “api” or “billing”.`; }
      eh.set(n ? 0 : 1); eo.set(n ? 0 : 1, n ? S.snap : S.base, n ? t0 : t0 + .08);
      ksw.to(inp.value ? 1 : 0);
    };
    inp.addEventListener('input', apply);
    clr.onclick = () => { inp.value = ''; apply(); inp.focus(); };
    inp.addEventListener('keydown', e => {
      if (e.key === 'Escape' && inp.value){ e.preventDefault(); inp.value = ''; apply(); }
      if (e.key === 'ArrowDown' || e.key === 'Enter'){ const f = items.find(it => it.hit); if (f){ e.preventDefault(); f.a.focus(); } }
    });
    st.addEventListener('keydown', e => { if (e.key === '/' && e.target !== inp && !e.metaKey && !e.ctrlKey){ e.preventDefault(); inp.focus(); inp.scrollIntoView({ block:'nearest' }); } });
    return t => {
      lk(t); dg.render(t);
      heads.forEach(c => { c.h.style.opacity = clamp(c.o.at(t)).toFixed(3); });
      em.style.height = px(clamp(eh.at(t)) * 22); fade(emt, eo.at(t), null);
      ksw.apply(kb, 0, t, 0); ksw.apply(clr, 1, t, 0);
    };
  }});


/* ================================================================ 4. Footer with live widgets */
atom({ id:'fz4-live', cat:'Footers', name:'Footer with live widgets', block:'SiteFooter (live status variant), Marquee', fam:['T','S','E'], wide:true, tall:true,
  html:`<style>
${fauxCss('fz4-')}${DK('fz4-')}${colCss('fz4-')}
.fz4-ft{padding:clamp(24px,4.5cqw,44px) 0 0;text-align:left;display:flex;flex-direction:column;gap:clamp(22px,3.5cqw,34px)}
.fz4-top{display:grid;gap:26px;padding-inline:clamp(16px,4cqw,36px)}
.fz4-nm{margin:0;font-size:clamp(20px,3cqw,26px);letter-spacing:-.02em;font-weight:600}
.fz4-ds{margin:8px 0 0;font-size:14px;line-height:1.5;color:var(--muted);max-width:34ch}
.fz4-tb{position:relative;display:inline-flex;background:var(--card);border-radius:10px;padding:3px;align-self:flex-start}
.fz4-tb .ind{position:absolute;left:0;top:0;background:var(--raised);border-radius:7px}
.fz4-tb button{position:relative;background:none;border:0;border-radius:7px;padding:5px 12px;font-size:13px;font-weight:500;color:var(--muted);cursor:pointer}
.fz4-tb button[aria-pressed="true"]{color:var(--ink)}
.fz4-lv{display:flex;flex-direction:column;gap:18px;min-width:0}
.fz4-gr{display:grid;gap:18px 32px}
.fz4-lb{font-size:12px;color:var(--muted);font-weight:500;margin-bottom:6px;display:flex;gap:8px;align-items:baseline}
.fz4-tm{display:flex;align-items:center;font-size:clamp(38px,6cqw,52px);font-weight:500;letter-spacing:-.03em;line-height:1.1;font-variant-numeric:tabular-nums}
.fz4-tm .digits{display:inline-flex}
.fz4-tm i{font-style:normal;color:var(--muted);padding:0 .04em;position:relative;top:-.06em}
.fz4-tz{position:relative;display:inline-block;height:1.3em;min-width:9ch;font-size:12px;color:var(--muted);font-weight:400;letter-spacing:0;margin-left:10px}
.fz4-wx{display:flex;align-items:center;gap:14px}
.fz4-wi{position:relative;flex:none;width:40px;height:40px;color:var(--ink)}
.fz4-wi span{position:absolute;inset:0;display:grid;place-items:center}
.fz4-tp{display:flex;align-items:center;font-size:clamp(38px,6cqw,52px);font-weight:500;letter-spacing:-.03em;line-height:1.1}
.fz4-tp .digits{display:inline-flex}
.fz4-tp span.u{font-size:.5em;color:var(--muted);margin-left:2px}
.fz4-cd{position:relative;height:40px;flex:1;min-width:0;font-size:14px}
.fz4-cd>span{position:absolute;left:0;right:0;top:0;line-height:1.35}
.fz4-cd small{display:block;font-size:12.5px;color:var(--muted)}
.fz4-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.fz4-cs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 16px;padding-inline:clamp(16px,4cqw,36px)}
.fz4-np{display:flex;align-items:center;border-block:1px solid var(--line);height:56px}
.fz4-nl{flex:none;display:flex;align-items:center;gap:9px;padding-inline:clamp(16px,4cqw,36px) 16px;font-size:12.5px;font-weight:500;color:var(--muted);white-space:nowrap;height:100%;border-right:1px solid var(--line)}
.fz4-nw{display:none}
.fz4-nl b{width:7px;height:7px;border-radius:50%;background:var(--success)}
.fz4-mq{position:relative;flex:1;min-width:0;height:100%;overflow:hidden}
.fz4-tk{position:absolute;left:0;top:0;height:100%;display:flex;align-items:center;white-space:nowrap}
.fz4-sq{display:flex;align-items:center}
.fz4-mi{display:inline-flex;align-items:baseline;gap:8px;font-size:14px;padding-right:34px;color:var(--muted)}
.fz4-mi b{color:var(--ink);font-weight:500}
.fz4-pz{flex:none;margin-inline:12px clamp(16px,4cqw,36px);width:32px;height:32px;border-radius:50%;border:1.5px solid var(--muted);background:none;color:var(--ink);display:grid;place-items:center;cursor:pointer;padding:0}
.fz4-bot{display:flex;flex-wrap:wrap;gap:6px 18px;padding:0 clamp(16px,4cqw,36px) 18px;font-size:12.5px;color:var(--muted)}
.fz4-bot a{color:inherit;text-decoration:none}
@container (min-width:520px){.fz4-nw{display:inline}.fz4-cs{grid-template-columns:repeat(4,minmax(0,1fr))}.fz4-gr{grid-template-columns:auto 1fr}}
@container (min-width:900px){.fz4-top{grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:48px}}
</style>
<div class="fz4-pg" tabindex="0" role="region" aria-label="Sample page, scroll to reach the footer">
${faux('fz4-', { brand:'Kiln Studio', nav:['Work', 'Studio', 'Journal'], kicker:'Journal · Process', title:'Why we keep one calendar across three offices', a:'Lisbon, Austin and Osaka share about two working hours a day. We stopped trying to widen that window and instead made the handover between offices a written, scheduled thing.', b:'Every project has a morning note from the office that is finishing and a first question from the office that is starting.' })}
<div class="fz4-ft fz4-dk" role="contentinfo">
  <div class="fz4-top">
    <div><h2 class="fz4-nm">Kiln Studio</h2><p class="fz4-ds">Brand and product design for teams that ship. Three offices, one calendar, no handover gaps.</p></div>
    <div class="fz4-lv">
      <div class="fz4-tb" role="group" aria-label="Choose an office"><i class="ind"></i><button type="button">Lisbon</button><button type="button">Austin</button><button type="button">Osaka</button></div>
      <div class="fz4-gr">
        <div><div class="fz4-lb"><span>Local time</span></div><div class="fz4-tm" aria-hidden="true"><span class="fz4-hr"></span><i>:</i><span class="fz4-mn"></span><i>:</i><span class="fz4-sc"></span><span class="fz4-tz"></span></div><span class="fz4-vh" role="timer" aria-live="off"></span></div>
        <div><div class="fz4-lb"><span>Conditions</span></div><div class="fz4-wx"><div class="fz4-wi" aria-hidden="true"></div><div class="fz4-tp" aria-hidden="true"><span class="fz4-tn"></span><span class="u">°C</span></div><div class="fz4-cd"></div></div></div>
      </div>
    </div>
  </div>
  <nav class="fz4-cs" aria-label="Footer">${cols('fz4-', [['Studio', ['Work', 'Services', 'Process', 'Journal']], ['Offices', ['Lisbon', 'Austin', 'Osaka', 'Visit us']], ['Company', ['About', 'Careers', 'Press', 'Contact']], ['Legal', ['Privacy', 'Terms', 'Accessibility', 'Cookies']]])}</nav>
  <div class="fz4-np" role="region" aria-label="Now playing in the studio"><span class="fz4-nl"><b></b><span class="fz4-nw">Now playing</span></span><div class="fz4-mq"><div class="fz4-tk"></div></div><button type="button" class="fz4-pz" aria-pressed="false" aria-label="Pause scrolling"></button></div>
  <div class="fz4-bot"><span>© 2026 Kiln Studio, Lda.</span><a href="#">Privacy</a><a href="#">Terms</a></div>
</div></div>`,
  desc:'Time, conditions and the ticker are all computed from the clock. Picking an office rolls the hours, minutes and seconds digit by digit, rolls the temperature, and blur-swaps the icon and the condition text, 100ms out then in. Seconds roll once a second. The now-playing ticker moves at constant speed on a velocity track: hovering, focusing or pressing pause eases the speed to zero on a critically damped spring and resumes the same way, with no jump. Titles fade at the two ends by position, not with a gradient.',
  api:'digits.set(hhmmss(tz, t))   cruise.set(playing && !hover ? 26 : 0, S.soft)   x = −(P(t) mod L)   item.o = min(clamp((x + 96) / 96), clamp((VW − x) / 96))',
  init(st){
    noNav(st);
    const OFF = [
      { n:'Lisbon', tz:'Europe/Lisbon', c:19, w:'Clear skies', d:'Wind 14 km/h from the north', ic:0 },
      { n:'Austin', tz:'America/Chicago', c:28, w:'Partly cloudy', d:'Wind 9 km/h from the south', ic:1 },
      { n:'Osaka', tz:'Asia/Tokyo', c:17, w:'Light rain', d:'Wind 11 km/h from the east', ic:2 } ];
    const ICS = ['<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>', '<path d="M7 18a4 4 0 0 1-.6-7.96A6 6 0 0 1 18 9.5 4.25 4.25 0 0 1 17.5 18z"/>', '<path d="M7 14.5a4 4 0 0 1-.6-7.96A6 6 0 0 1 18 6 4.25 4.25 0 0 1 17.5 14.5z"/><path d="M8 18l-.8 2.4M12.5 18l-.8 2.4M17 18l-.8 2.4"/>'];
    const SONGS = [['Khruangbin', 'Maria También'], ['Bonobo', 'Kerala'], ['Four Tet', 'Baby'], ['Floating Points', 'Silhouettes'], ['Nils Frahm', 'Says'], ['Caribou', 'Can’t Do Without You'], ['Jon Hopkins', 'Open Eye Signal'], ['Little Dragon', 'Twice']];
    OFF.forEach(o => { o.f = new Intl.DateTimeFormat('en-GB', { timeZone:o.tz, hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23', timeZoneName:'shortOffset' }); });
    const tb = $(st, '.fz4-tb'), ind = $(tb, '.ind'), btns = $$(tb, 'button'), vh = $(st, '.fz4-vh');
    const dH = new Digits($(st, '.fz4-hr'), 2), dM = new Digits($(st, '.fz4-mn'), 2), dS = new Digits($(st, '.fz4-sc'), 2), dT = new Digits($(st, '.fz4-tn'), 2);
    const tz = swapText($(st, '.fz4-tz'), 'top:0'), cd = $(st, '.fz4-cd');
    const cdl = [0, 1].map(() => { const e = E('span'); e.innerHTML = '<span></span><small></small>'; cd.appendChild(e); return e; });
    const cdw = new Swap(0); let cdk = 0;
    const wi = $(st, '.fz4-wi'), wil = ICS.map(d => { const s = E('span'); s.innerHTML = ic(d, 32, 1.6); wi.appendChild(s); return s; }), wis = new Swap(0);
    const lk = links(st, '.fz4-lk'), e = edges(0, 0), pg = $(st, '.fz4-pg');
    const T0 = Date.now(); let cur = 0, lastSec = -1, lastW = 0, first = true;
    const geo = b => [b.offsetLeft, b.offsetLeft + b.offsetWidth];
    const showOffice = (i, inst) => {
      cur = i; const o = OFF[i]; btns.forEach((b, j) => b.setAttribute('aria-pressed', j === i));
      inst ? e.jump(...geo(btns[i])) : e.go(...geo(btns[i]));
      dT.set(String(o.c), inst);
      const k = inst ? cdk : cdk ^ 1; cdl[k].firstChild.textContent = o.w; cdl[k].lastChild.textContent = o.d;
      if (inst){ cdw.cur = k; cdw.prev = null; cdw.t = -9; wis.cur = o.ic; wis.prev = null; wis.t = -9; } else { cdw.to(k); wis.to(o.ic); } cdk = k;
      tz.put(o.f.formatToParts(new Date(T0)).find(p => p.type === 'timeZoneName').value.replace('GMT', 'UTC').replace(/^UTC$/, 'UTC+0'), inst);
      lastSec = -1; first = inst;
    };
    btns.forEach((b, i) => b.onclick = () => { if (i !== cur) showOffice(i); });
    // marquee
    const tk = $(st, '.fz4-tk'), mq = $(st, '.fz4-mq'), pz = $(st, '.fz4-pz');
    const seq = () => { const s = E('span'); s.className = 'fz4-sq'; s.innerHTML = SONGS.map(([a, b]) => `<span class="fz4-mi"><b>${a}</b>${b}</span>`).join(''); return s; };
    const sA = seq(), sB = seq(); sB.setAttribute('aria-hidden', 'true'); tk.append(sA, sB);
    const items = [...$$(sA, '.fz4-mi'), ...$$(sB, '.fz4-mi')], cr = new Cruise(REDUCE ? 0 : 26);
    let playing = !REDUCE, hov = false, geoW = 0, offs = [], Lw = 1;
    const PLAY = ic('<path d="M8 5.5v13l10-6.5z"/>', 14, 2), PAUSE = ic('<path d="M8 5.5v13M16 5.5v13"/>', 14, 2.4);
    const setV = () => cr.set(playing && !hov ? 26 : 0, S.soft);
    const paint = () => { pz.innerHTML = playing ? PAUSE : PLAY; pz.setAttribute('aria-pressed', !playing); pz.setAttribute('aria-label', playing ? 'Pause scrolling' : 'Resume scrolling'); };
    pz.onclick = () => { playing = !playing; paint(); setV(); };
    mq.addEventListener('pointerenter', () => { hov = true; setV(); }); mq.addEventListener('pointerleave', () => { hov = false; setV(); });
    pz.addEventListener('focus', () => { hov = true; setV(); }); pz.addEventListener('blur', () => { hov = false; setV(); });
    paint();
    const fitMq = () => { Lw = sA.offsetWidth || 1; offs = items.map(i => [i.offsetLeft, i.offsetWidth]); geoW = Lw + mq.clientWidth; };
    const sel0 = () => showOffice(cur, true);
    document.fonts.ready.then(() => { sel0(); geoW = 0; }); requestAnimationFrame(sel0);
    return t => {
      lk(t); dH.render(t); dM.render(t); dS.render(t); dT.render(t); tz.render(t);
      const ms = T0 + t * 1000, sec = Math.floor(ms / 1000);
      if (sec !== lastSec){ lastSec = sec; const p = OFF[cur].f.formatToParts(new Date(ms)), g = k => p.find(x => x.type === k).value;
        dH.set(g('hour'), first); dM.set(g('minute'), first); dS.set(g('second'), first); first = false;
        if (g('second') === '00' || !vh.textContent) vh.textContent = `${OFF[cur].n} local time ${g('hour')}:${g('minute')}`; }
      cdl.forEach((el, i) => cdw.apply(el, i, t, 4)); wil.forEach((el, i) => wis.apply(el, i, t, 4));
      const a = e.A.at(t), b = e.B.at(t); ind.style.transform = `translate(${px(a)},3px)`; ind.style.width = px(b - a); ind.style.height = 'calc(100% - 6px)';
      if (geoW !== Lw + mq.clientWidth || !offs.length) fitMq();
      cr.prune(t); const P = ((cr.at(t) % Lw) + Lw) % Lw, VW = mq.clientWidth;
      tk.style.transform = `translateX(${px(-P)})`;
      for (let i = 0; i < items.length; i++){ const x = offs[i][0] - P, o = Math.min(clamp((x + 96) / 96), clamp((VW - x) / 96)); items[i].style.opacity = o.toFixed(3); }
    };
  }});


/* ================================================================ 5. App download, QR, social and trust footer */
atom({ id:'fz5-app', cat:'Footers', name:'App download and trust footer', block:'SiteFooter (app variant), TrustBadge, StoreButton', fam:['M','X','S','T'], wide:true, tall:true,
  html:`<style>
${fauxCss('fz5-')}${colCss('fz5-')}
.fz5-ft{background:var(--accent-tint);padding:clamp(26px,5cqw,48px) clamp(16px,4cqw,36px) 0;text-align:left;display:flex;flex-direction:column;gap:clamp(24px,4cqw,38px)}
.fz5-app{display:grid;gap:24px 40px;align-items:center}
.fz5-hl{margin:0;font-size:clamp(28px,4.6cqw,46px);line-height:1.06;letter-spacing:-.03em;font-weight:600;max-width:15ch;text-wrap:balance}
.fz5-tx{margin:12px 0 0;font-size:14.5px;line-height:1.5;color:var(--muted);max-width:44ch}
.fz5-sts{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
.fz5-sb{display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 18px 0 14px;background:#0C1016;color:#EFF2F6;text-decoration:none;border-radius:12px;min-width:166px}
.fz5-sb small{display:block;font-size:10.5px;line-height:1.1;color:#ABAEB3}
.fz5-sb b{display:block;font-size:17px;line-height:1.15;font-weight:600;letter-spacing:-.01em}
.fz5-qr{display:none;margin:0;justify-self:end;background:var(--card);border-radius:18px;padding:14px;gap:10px;box-shadow:var(--shadow);flex-direction:column;align-items:center;width:max-content}
.fz5-qr svg.fz5-q{display:block;width:clamp(124px,16cqw,156px);height:auto;color:var(--ink)}
.fz5-qr figcaption{font-size:12.5px;line-height:1.35;color:var(--muted);text-align:center;max-width:22ch}
.fz5-cp{position:relative;border:0;background:var(--raised);border-radius:8px;height:30px;width:100%;font-size:12.5px;font-weight:500;cursor:pointer;overflow:hidden;padding:0}
.fz5-cp span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:6px}
.fz5-tr{display:flex;flex-wrap:wrap;gap:8px;position:relative}
.fz5-bd{display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 12px 0 10px;border:0;border-radius:999px;background:var(--card);font-size:13px;font-weight:500;cursor:default;box-shadow:var(--shadow)}
.fz5-bd svg{color:var(--success)}
.fz5-tp{position:absolute;bottom:calc(100% + 8px);left:0;width:min(232px,100%);background:var(--ink);color:var(--card);font-size:12.5px;line-height:1.4;padding:9px 11px;border-radius:10px;pointer-events:none;transform-origin:50% 100%}
.fz5-tp b{display:block;font-size:12.5px;margin-bottom:2px}
.fz5-cs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 16px;border-top:1px solid var(--line);padding-top:clamp(22px,3.5cqw,32px)}
.fz5-so{grid-column:1/-1;display:flex;flex-direction:column}
.fz5-sl{display:flex;flex-wrap:wrap;gap:6px}
.fz5-pl{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 11px 0 13px;border-radius:999px;background:var(--raised);font-size:13px;font-weight:500;color:var(--ink);text-decoration:none}
.fz5-pl svg{flex:none}
.fz5-bot{display:flex;flex-wrap:wrap;gap:6px 18px;padding:16px 0 20px;font-size:12.5px;color:var(--muted)}
.fz5-bot a{color:inherit;text-decoration:none}
@container (min-width:520px){.fz5-cs{grid-template-columns:repeat(3,minmax(0,1fr))}.fz5-qr{display:flex}.fz5-app{grid-template-columns:minmax(0,1fr) auto}}
@container (min-width:900px){.fz5-cs{grid-template-columns:repeat(3,minmax(0,1fr)) minmax(0,1.3fr)}.fz5-so{grid-column:auto}}
</style>
<div class="fz5-pg" tabindex="0" role="region" aria-label="Sample page, scroll to reach the footer">
${faux('fz5-', { brand:'Trove', nav:['Features', 'Pricing', 'Security'], kicker:'Release notes · 4.12', title:'Scan a receipt and the category fills itself in', a:'The camera now reads the merchant, the total and the tax line, then matches the merchant against the categories you have already used. A grocery receipt lands in Groceries without a tap.', b:'Receipts stay on your device until you sync. If a total looks wrong, tap it to correct it and Trove remembers the fix.' })}
<div class="fz5-ft" role="contentinfo">
  <div class="fz5-app">
    <div><h2 class="fz5-hl">Your budget, in your pocket.</h2><p class="fz5-tx">Trove for iPhone and Android syncs with the web app in seconds. Add expenses offline, scan receipts and unlock with Face ID or a fingerprint.</p>
      <div class="fz5-sts"><a class="fz5-sb" href="#">${ic('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>', 24, 1.6)}<span><small>Download on the</small><b>App Store</b></span></a><a class="fz5-sb" href="#">${ic('<path d="M6.5 4.5v15l13-7.5z"/>', 24, 1.6)}<span><small>Get it on</small><b>Google Play</b></span></a></div></div>
    <figure class="fz5-qr"><svg class="fz5-q" viewBox="-1 -1 27 27" role="img" aria-label="Placeholder QR code for the download page" shape-rendering="crispEdges"></svg><figcaption>Point your camera here to open trove.example/app</figcaption><button type="button" class="fz5-cp" aria-label="Copy download link"></button></figure>
  </div>
  <div class="fz5-tr" role="list" aria-label="Security and reliability">${[
    ['SOC 2 Type II', 'Audited every year', 'The latest report is available to customers under NDA.'],
    ['ISO 27001', 'Certified since 2024', 'Scope covers the apps, the API and support tooling.'],
    ['GDPR ready', 'EU data stays in the EU', 'Accounts created in Europe are stored in Frankfurt.'],
    ['99.95% uptime', 'Last 12 months', 'Service credits apply below 99.9% in any month.']].map(([n, h, d], i) => `<span role="listitem" style="display:inline-flex"><button type="button" class="fz5-bd" aria-describedby="fz5-tp${i}">${ic(SHIELD, 16, 2)}${n}</button><span class="fz5-tp" id="fz5-tp${i}" role="tooltip"><b>${h}</b>${d}</span></span>`).join('')}</div>
  <nav class="fz5-cs" aria-label="Footer">${cols('fz5-', [['Product', ['Budgets', 'Receipts', 'Shared accounts', 'Bank sync', 'Pricing']], ['Company', ['About', 'Careers', 'Press', 'Contact']], ['Help', ['Help centre', 'Security', 'System status', 'Accessibility']]])}
    <div class="fz5-so"><h4 class="fz5-h">Follow</h4><div class="fz5-sl">${['LinkedIn', 'YouTube', 'Instagram', 'Mastodon'].map(n => `<a class="fz5-pl" href="#"><span>${n}</span>${UPR}</a>`).join('')}</div></div></nav>
  <div class="fz5-bot"><span>© 2026 Trove Money, Inc.</span><span>Trove is a budgeting app. It does not hold or move your money.</span><a href="#">Privacy</a><a href="#">Terms</a></div>
</div></div>`,
  desc:'Reaching the app block ripples the QR modules in from the top left corner on the lazy spring, one diagonal at a time. The trust badges rise 60ms apart; hovering or focusing a badge rings it in ink and pops a detail card above it from 97% scale, and Escape closes it. The store buttons morph their corner radius and fill on hover, social pills fill with ink and send the arrow up and right, and Copy link blur-swaps to Copied and back. Below 520px the QR is dropped because the phone is already the device.',
  api:'qr.cell(x, y) = clamp(2p − (x + y)/48)   badge[i].set(1, S.soft, t + i·0.06)   tip.set(hover ? 1 : 0)   copy.swap(1) → t + 1.6 → swap(0)',
  init(st){
    noNav(st);
    const pg = $(st, '.fz5-pg'), lk = links(st, '.fz5-lk'), qrEl = $(st, '.fz5-q'), cp = $(st, '.fz5-cp'), tr = $(st, '.fz5-tr'), app = $(st, '.fz5-app');
    // placeholder QR matrix from a seeded generator, with the three finder squares, timing lines and an alignment square
    const N = 25; let seed = 11; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const M = Array.from({ length:N }, () => Array.from({ length:N }, () => rnd() > .5 ? 1 : 0));
    const finder = (ox, oy) => { for (let dy = -1; dy <= 7; dy++) for (let dx = -1; dx <= 7; dx++){ const x = ox + dx, y = oy + dy; if (x < 0 || y < 0 || x >= N || y >= N) continue;
      const out = dx < 0 || dx > 6 || dy < 0 || dy > 6, d = Math.max(Math.abs(dx - 3), Math.abs(dy - 3)); M[y][x] = out ? 0 : (d === 3 || d <= 1 ? 1 : 0); } };
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    for (let i = 8; i < N - 8; i++){ M[6][i] = i % 2 ? 0 : 1; M[i][6] = i % 2 ? 0 : 1; }
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){ const d = Math.max(Math.abs(dx), Math.abs(dy)); M[N - 7 + dy][N - 7 + dx] = d === 1 ? 0 : 1; }
    const cells = []; let svg = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (M[y][x]){ svg += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="currentColor" opacity="0"/>`; cells.push((x + y) / 48); }
    qrEl.innerHTML = svg; const rects = $$(qrEl, 'rect');
    // copy link swap
    const cl = ['Copy link', 'Copied'].map((s, i) => { const e = E('span'); e.innerHTML = i ? ic(I.check, 13, 2.5) + s : ic(I.link, 13, 2) + s; cp.appendChild(e); return e; }), csw = new Swap(0), q = queue();
    cp.onclick = () => { try { navigator.clipboard && navigator.clipboard.writeText('https://trove.example/app').catch(() => {}); } catch (e) {} csw.to(1); q.clear(); q.at(now() + 1.6, () => csw.to(0)); };
    // trust badges
    const bds = $$(tr, '.fz5-bd'), tps = $$(tr, '.fz5-tp'), tt = bds.map(() => new Track(0)), bt = bds.map(() => new Track(0, S.soft)), hv = bds.map(b => hoverTr(b));
    const show = (i, v) => { tt[i].set(v ? 1 : 0, v ? S.base : S.snap); };
    bds.forEach((b, i) => { b.addEventListener('pointerenter', () => show(i, 1)); b.addEventListener('pointerleave', () => show(i, 0)); b.addEventListener('focus', () => show(i, 1)); b.addEventListener('blur', () => show(i, 0)); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && tt.some(x => x.target)) tt.forEach((x, i) => show(i, 0)); });
    // store buttons and social pills
    const sbs = $$(st, '.fz5-sb').map(a => ({ a, h:hoverTr(a) })), pls = $$(st, '.fz5-pl').map(a => ({ a, h:hoverTr(a), u:$(a, 'svg') }));
    const qp = new Track(0, S.lazy); let qv = -1, lastQ = -9, bv = -1;
    return t => {
      lk(t); q.run(t); csw.apply(cl[0], 0, t, 4); csw.apply(cl[1], 1, t, 4);
      const H = size(pg).ch, v = pg.scrollTop + H - topIn(app, pg) > 120 ? 1 : 0; if (v !== qv){ qv = v; qp.set(v); }
      const p = qp.at(t); if (Math.abs(p - lastQ) > .002){ lastQ = p; for (let i = 0; i < rects.length; i++) rects[i].style.opacity = clamp(p * 2 - cells[i]).toFixed(2); }
      const bvv = pg.scrollTop + H - topIn(tr, pg) > 40 ? 1 : 0; if (bvv !== bv){ bv = bvv; bt.forEach((x, i) => x.set(bvv, S.soft, t + i * .06)); }
      bds.forEach((b, i) => { const r = clamp(bt[i].at(t)), h = clamp(hv[i].h.at(t)); fade(b, r, (1 - r) * 10);
        b.style.boxShadow = `0 0 0 1.5px color-mix(in oklab, var(--ink) ${(h * 100).toFixed(1)}%, transparent), var(--shadow)`; pop(tps[i], tt[i].at(t), 4); tps[i].style.left = px(Math.max(0, Math.min(frameLayout(b.parentNode).ol, frameLayout(tr).cw - frameLayout(tps[i]).w))); });
      sbs.forEach(({ a, h }) => { const x = clamp(h.h.at(t)), d = clamp(h.d.at(t)); a.style.borderRadius = px(lerp(12, 20, x)); a.style.background = mix(x, '#2A2F36', '#0C1016'); a.style.transform = `scale(${(1 - .03 * d).toFixed(4)})`; });
      pls.forEach(({ a, h, u }) => { const x = clamp(h.h.at(t)), d = clamp(h.d.at(t)); a.style.background = mix(x, 'var(--ink)', 'transparent'); a.style.color = mix(x, 'var(--card)', 'var(--ink)'); a.style.borderColor = mix(x, 'var(--ink)', 'var(--faint)');
        u.style.transform = `translate(${px(x * 2)},${px(-x * 2)})`; a.style.transform = `scale(${(1 - .03 * d).toFixed(4)})`; });
    };
  }});


/* ================================================================ 6. Disclosure footer with sticky consent and legal strip */
atom({ id:'fz6-disclosure', cat:'Footers', name:'Footer with more links and sticky strip', block:'SiteFooter (disclosure variant), ConsentBanner, Disclosure', fam:['M','S','E'], wide:true, tall:true,
  html:`<style>
${fauxCss('fz6-')}${colCss('fz6-')}
.fz6-ft{background:var(--card);border-top:1px solid var(--line);padding:clamp(24px,4.5cqw,42px) clamp(16px,4cqw,36px) 0;text-align:left;display:flex;flex-direction:column;gap:clamp(22px,3.5cqw,32px)}
.fz6-top{display:grid;gap:26px}
.fz6-nm{margin:0;font-size:20px;letter-spacing:-.02em;font-weight:600;display:flex;align-items:center;gap:9px}
.fz6-nm i{width:18px;height:18px;border-radius:5px;background:var(--accent)}
.fz6-ds{margin:8px 0 0;font-size:14px;line-height:1.5;color:var(--muted);max-width:30ch}
.fz6-cs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 16px}
.fz6-tg{display:flex;align-items:center;gap:12px;width:100%;border:0;border-block:1px solid var(--line);background:none;padding:12px 0;cursor:pointer;text-align:left;font-size:14px;font-weight:500}
.fz6-tg small{flex:1;min-width:0;font-size:13px;font-weight:400;color:var(--muted)}
.fz6-tl{position:relative;display:inline-block;height:1.4em;width:7.2em;flex:none}
.fz6-tl span{position:absolute;left:0;top:0;white-space:nowrap}
.fz6-ch{flex:none;width:28px;height:28px;border-radius:50%;background:var(--raised);display:grid;place-items:center}
.fz6-mb{overflow:hidden;height:0;margin-top:-1px}
.fz6-in{display:grid;gap:22px 24px;padding:20px 0 6px}
.fz6-g{min-width:0}
.fz6-g ul.fz6-u.two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:16px}
.fz6-lg{display:flex;flex-wrap:wrap;gap:6px 18px;padding:2px 0 22px;font-size:12.5px;color:var(--muted)}
.fz6-ck{position:sticky;bottom:0;z-index:6;padding:0 clamp(8px,2cqw,14px) clamp(8px,2cqw,14px);pointer-events:none}
.fz6-cb{position:relative;overflow:hidden;background:var(--ink);color:var(--card);border-radius:14px;pointer-events:auto;box-shadow:var(--shadow)}
.fz6-cb :focus-visible{outline-color:var(--card)}
.fz6-ly{position:absolute;left:0;right:0;top:0;padding:13px 16px;display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px}
.fz6-ly p{margin:0;flex:1 1 260px;font-size:13px;line-height:1.45}
.fz6-ly p a{color:inherit}
.fz6-bs{display:flex;gap:8px;flex:none}
.fz6-bt{border:0;background:var(--muted);color:var(--card);border-radius:9px;height:34px;padding:0 13px;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap}
.fz6-bt.fill{background:var(--card);color:var(--ink);border-color:var(--card)}
.fz6-sp{flex:1 1 auto;font-size:12.5px;opacity:.78}
.fz6-lj{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12.5px}
.fz6-lj a{color:var(--card);text-decoration:none;opacity:.78}
.fz6-ly.lg{min-height:40px;padding-block:9px}
@container (min-width:520px){.fz6-cs{grid-template-columns:repeat(4,minmax(0,1fr))}.fz6-in{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container (min-width:900px){.fz6-top{grid-template-columns:minmax(0,3fr) minmax(0,9fr);gap:40px}.fz6-in{grid-template-columns:minmax(0,5fr) minmax(0,3.5fr) minmax(0,3.5fr)}}
</style>
<div class="fz6-pg" tabindex="0" role="region" aria-label="Sample page, scroll to reach the footer">
${faux('fz6-', { brand:'Alder', nav:['Product', 'Pricing', 'Customers'], kicker:'Product · Boards', title:'Timelines now draw dependencies between boards', a:'A card on one board can wait on a card from another. When the upstream date moves, the downstream card shows how many days it slipped and who owns the change.', b:'Dependencies are visible to anyone with access to both boards. Everyone else sees a lock icon instead of the card title.' })}
<div class="fz6-ft" role="contentinfo">
  <div class="fz6-top">
    <div><p class="fz6-nm"><i></i>Alder</p><p class="fz6-ds">Planning for teams that work across more than one board.</p></div>
    <nav class="fz6-cs" aria-label="Footer">${cols('fz6-', [['Product', ['Boards', 'Timelines', 'Docs', 'Automations', 'Reports']], ['Solutions', ['Engineering', 'Product', 'Design', 'Marketing', 'Operations']], ['Company', ['About', 'Customers', 'Careers', 'Press', 'Contact']], ['Support', ['Help centre', 'Community', 'API docs', 'System status', 'Security']]])}</nav>
  </div>
  <div><button type="button" class="fz6-tg" aria-expanded="false" aria-controls="fz6-more"><span class="fz6-tl"></span><small>Integrations, comparisons and offices</small><span class="fz6-ch">${ic(I.chev, 16, 2)}</span></button>
    <div class="fz6-mb" id="fz6-more" role="group" aria-label="More links"><div class="fz6-in">
      <div class="fz6-g"><h4 class="fz6-h">Integrations</h4><ul class="fz6-u two">${['Slack', 'Source control', 'GitLab', 'Figma', 'Google Calendar', 'Google Drive', 'Zoom', 'Zapier', 'Notion import', 'Jira import', 'Microsoft Teams', 'Webhooks'].map(l => `<li><a class="fz6-lk" href="#"><span>${l}</span><i></i></a></li>`).join('')}</ul></div>
      <div class="fz6-g"><h4 class="fz6-h">Compare</h4><ul class="fz6-u">${['Alder vs spreadsheets', 'Alder vs Trello', 'Alder vs Asana', 'Alder vs Jira', 'Switching guide', 'Migration service'].map(l => `<li><a class="fz6-lk" href="#"><span>${l}</span><i></i></a></li>`).join('')}</ul></div>
      <div class="fz6-g"><h4 class="fz6-h">Offices</h4><ul class="fz6-u">${['Copenhagen', 'Toronto', 'Singapore', 'Remote handbook', 'Visit the studio', 'Press enquiries'].map(l => `<li><a class="fz6-lk" href="#"><span>${l}</span><i></i></a></li>`).join('')}</ul></div>
    </div></div></div>
  <div class="fz6-lg"><span>© 2026 Alder Software ApS</span><span>CVR 41 82 90 17</span></div>
</div>
<div class="fz6-ck"><div class="fz6-cb" role="region" aria-label="Cookies and legal">
  <div class="fz6-ly ask"><p>We use cookies to measure how the site is used and to fix what is slow. Strictly necessary cookies are always on. <a href="#">Cookie policy</a></p><div class="fz6-bs"><button type="button" class="fz6-bt rej">Reject non-essential</button><button type="button" class="fz6-bt fill acc">Accept all</button></div></div>
  <div class="fz6-ly lg"><span class="fz6-sp">© 2026 Alder Software ApS</span><div class="fz6-lj"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Accessibility</a></div><button type="button" class="fz6-bt cset">Cookie settings</button></div>
</div></div></div>`,
  desc:'More links opens a drawer under the toggle: the drawer height springs to its measured content, the chevron turns on the same spring, the three link groups rise 60ms apart, and the page scrolls just far enough to show the bottom of it. The label blur-swaps between More links and Fewer links. The strip stuck to the bottom of the page is one element that morphs between a cookie prompt and a one-line legal bar: the prompt text leaves in 100ms, the strip springs to the new height, and the legal row enters, with focus handed to Cookie settings so keyboard users keep their place.',
  api:'body.h.set(open ? inner : 0)   group[i].set(open, S.soft, t + i·0.06)   strip.h.set(measure(next), t + (shrink ? EXIT : 0))   swap.to(next)',
  init(st){
    noNav(st);
    const pg = $(st, '.fz6-pg'), tg = $(st, '.fz6-tg'), mb = $(st, '.fz6-mb'), inn = $(st, '.fz6-in'), ch = $(st, '.fz6-ch svg'), lk = links(st, '.fz6-lk'), sm = smooth(pg);
    const gs = $$(inn, '.fz6-g'), gt = gs.map(() => new Track(0, S.soft)), ot = new Track(0), lbl = swapText($(st, '.fz6-tl'));
    let open = false; lbl.put('More links', true);
    const setOpen = v => { open = v; tg.setAttribute('aria-expanded', v); ot.set(v ? 1 : 0, v ? S.base : S.snap); follow(gt, v ? 1 : 0, now() + (v ? .05 : 0), v ? .06 : .02); lbl.put(v ? 'Fewer links' : 'More links'); mb.inert = !v;
      if (v){ const need = topIn(mb, pg) + inn.offsetHeight + 4 - pg.clientHeight + ck.offsetHeight + 10; if (need > pg.scrollTop) sm.to(need); } };
    mb.inert = true; tg.onclick = () => setOpen(!open);
    // sticky strip: one element, two layers
    const cb = $(st, '.fz6-cb'), ckEl = $(st, '.fz6-ck'), ck = ckEl, ly = [$(cb, '.ask'), $(cb, '.lg')], sw = new Swap(0), H = new Track(0), hv = $$(cb, '.fz6-bt').map(b => ({ b, h:hoverTr(b) }));
    let cur = 0, lastNeed = -1, state = false;
    const to = (k, focus) => { if (k === cur) return; cur = k; sw.to(k); state = true; if (focus) setTimeout(() => $(cb, k ? '.cset' : '.acc').focus({ preventScroll:true }), 140); };
    $(cb, '.acc').onclick = () => to(1, true); $(cb, '.rej').onclick = () => to(1, true); $(cb, '.cset').onclick = () => to(0, true);
    cb.addEventListener('keydown', e => { if (e.key === 'Escape' && cur === 0){ e.preventDefault(); to(1, true); } });
    return t => {
      lk(t); sm.render(t); lbl.render(t);
      const p = clamp(ot.at(t)); mb.style.height = px(p * inn.offsetHeight); ch.style.transform = `rotate(${(p * 180).toFixed(1)}deg)`;
      gs.forEach((g, i) => { const q = clamp(gt[i].at(t)); fade(g, q, (1 - q) * 10); });
      const need = ly[cur].offsetHeight; if (need !== lastNeed){ const shrink = lastNeed > 0 && need < lastNeed; if (lastNeed < 0) H.jump(need); else H.set(need, S.base, t + (state && shrink ? EXIT : 0)); lastNeed = need; state = false; }
      cb.style.height = px(H.at(t)); ly.forEach((e, i) => sw.apply(e, i, t, 4));
      hv.forEach(({ b, h }) => { const x = clamp(h.h.at(t)); b.style.background = b.classList.contains('fill') ? mix(x, 'var(--accent-tint)', 'var(--card)') : mix(x * .16, 'var(--card)', 'transparent'); });
    };
  }});


/* ================================================================ 7. Contact card, map and opening hours footer */
atom({ id:'fz7-hours', cat:'Footers', name:'Footer with map, contact and opening hours', block:'SiteFooter (local business variant), StatusChip, MapEmbed', fam:['D','E','M','S','T'], wide:true, tall:true,
  html:`<style>
${fauxCss('fz7-')}${colCss('fz7-')}
.fz7-ft{background:var(--card);border-top:1px solid var(--line);padding:clamp(24px,4.5cqw,40px) clamp(16px,4cqw,36px) 0;text-align:left;display:grid;gap:26px 32px;grid-template-areas:"ct" "hr" "mp" "bt"}
.fz7-ct{grid-area:ct;min-width:0}
.fz7-hr{grid-area:hr;min-width:0}
.fz7-mp{grid-area:mp;min-width:0}
.fz7-bt{grid-area:bt;display:flex;flex-wrap:wrap;gap:6px 18px;border-top:1px solid var(--line);padding:14px 0 18px;font-size:12.5px;color:var(--muted)}
.fz7-nm{margin:0;font-size:clamp(22px,3.4cqw,30px);letter-spacing:-.025em;font-weight:600;line-height:1.1}
.fz7-ad{font-style:normal;margin:12px 0 0;font-size:14.5px;line-height:1.55;color:var(--muted)}
.fz7-ls{list-style:none;margin:14px 0 0;padding:0;display:flex;flex-direction:column;gap:2px}
.fz7-lk{font-size:14.5px}
.fz7-gd{position:relative;display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 18px;border:0;background:var(--raised);border-radius:999px;margin-top:18px;overflow:hidden;color:var(--ink);text-decoration:none;font-size:14px;font-weight:500;isolation:isolate}
.fz7-gd .fl{position:absolute;inset:0;background:var(--ink);z-index:-1;clip-path:inset(0 100% 0 0)}
.fz7-gd svg{flex:none}
.fz7-hh{display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin-bottom:12px}
.fz7-hh h4{margin:0;font-size:12px;font-weight:500;color:var(--muted)}
.fz7-chip{position:relative;display:inline-flex;align-items:center;gap:7px;height:26px;padding:0 11px 0 10px;border-radius:999px;font-size:12.5px;font-weight:500;white-space:nowrap}
.fz7-chip b{flex:none;width:7px;height:7px;border-radius:50%;background:currentColor}
.fz7-ctx{position:relative;display:inline-block;height:1.3em}
.fz7-ctx span{position:absolute;left:0;top:0;white-space:nowrap}
.fz7-tb{list-style:none;margin:0;padding:0;position:relative}
.fz7-pl{position:absolute;left:-8px;right:-8px;top:0;height:0;border-radius:9px;background:var(--accent-tint)}
.fz7-tb li{position:relative;display:flex;justify-content:space-between;gap:12px;height:34px;align-items:center;font-size:14px;font-variant-numeric:tabular-nums}
.fz7-tb li i{font-style:normal;font-size:11.5px;font-weight:500;margin-left:8px;color:var(--accent)}
.fz7-pv{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;align-items:center}
.fz7-pv small{font-size:12px;color:var(--muted);margin-right:2px}
.fz7-pb{border:0;background:var(--raised);border-radius:999px;height:26px;padding:0 10px;font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap}
.fz7-mv{position:relative;height:clamp(190px,32cqw,250px);border-radius:16px;overflow:hidden;background:var(--raised);touch-action:none;cursor:grab;outline-offset:2px}
.fz7-mv:active{cursor:grabbing}
.fz7-sv{position:absolute;left:50%;top:50%;width:760px;height:440px;margin:-220px 0 0 -380px;transform-origin:50% 50%;pointer-events:none}
.fz7-pn{position:absolute;left:0;top:0;height:30px;display:flex;align-items:center;border:0;padding:0;background:var(--ink);color:var(--card);border-radius:15px;font-size:12.5px;font-weight:500;cursor:pointer;overflow:hidden;white-space:nowrap}
.fz7-pn .dot{flex:none;width:30px;height:30px;display:grid;place-items:center}
.fz7-pn .lb{padding-right:12px}
.fz7-zm{position:absolute;right:10px;bottom:10px;display:flex;flex-direction:column;background:var(--card);border-radius:10px;box-shadow:var(--shadow);overflow:hidden}
.fz7-zm button{width:32px;height:32px;border:0;background:none;display:grid;place-items:center;cursor:pointer;padding:0}
.fz7-zm button+button{border-top:1px solid var(--line-soft)}
.fz7-hn{position:absolute;left:10px;bottom:10px;font-size:11.5px;color:var(--muted);background:var(--card);border-radius:7px;padding:3px 8px;box-shadow:var(--shadow);pointer-events:none}
@container (min-width:560px){.fz7-ft{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"ct hr" "mp mp" "bt bt"}}
@container (min-width:900px){.fz7-ft{grid-template-columns:minmax(0,3fr) minmax(0,5fr) minmax(0,3.6fr);grid-template-areas:"ct mp hr" "bt bt bt"}}
</style>
<div class="fz7-pg" tabindex="0" role="region" aria-label="Sample page, scroll to reach the footer">
${faux('fz7-', { brand:'Marrow & Rye', nav:['Bread', 'Pastry', 'Catering'], kicker:'Journal · Seasonal', title:'The October loaf is rye with roasted squash', a:'We fold roasted kabocha into a ninety percent rye dough and bake it dark, so the crust tastes closer to toffee than toast. It keeps well for five days and makes a very good grilled cheese.', b:'Order by Thursday evening for Saturday pickup. We bake about sixty of them each week and they have sold out every time.' })}
<div class="fz7-ft" role="contentinfo">
  <div class="fz7-ct"><p class="fz7-nm">Marrow &amp; Rye Bakery</p>
    <address class="fz7-ad">214 NW Alder Street<br>Portland, OR 97209</address>
    <ul class="fz7-ls"><li><a class="fz7-lk" href="#"><span>(503) 555-0142</span><i></i></a></li><li><a class="fz7-lk" href="#"><span>hello@marrowandrye.example</span><i></i></a></li><li><a class="fz7-lk" href="#"><span>Order ahead for pickup</span><i></i></a></li><li><a class="fz7-lk" href="#"><span>Wholesale and catering</span><i></i></a></li></ul>
    <a class="fz7-gd" href="#"><span class="fl"></span><span class="tx">Get directions</span>${ARROW}</a></div>
  <div class="fz7-hr"><div class="fz7-hh"><h4 id="fz7-ht">Opening hours</h4><span class="fz7-chip" role="status"><b></b><span class="fz7-ctx"></span></span></div>
    <ul class="fz7-tb" aria-labelledby="fz7-ht"><i class="fz7-pl"></i></ul>
    <div class="fz7-pv" role="group" aria-label="Preview the status at another time"><small>Preview</small></div></div>
  <div class="fz7-mp"><div class="fz7-mv" tabindex="0" role="application" aria-label="Map of the bakery. Drag or use the arrow keys to move, plus and minus to zoom."><div class="fz7-sv"></div>
    <button type="button" class="fz7-pn" aria-label="Marrow and Rye Bakery, 214 NW Alder Street"><span class="dot">${ic('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.2"/>', 16, 2)}</span><span class="lb">Marrow &amp; Rye · 214 NW Alder St</span></button>
    <div class="fz7-zm"><button type="button" class="zi" aria-label="Zoom in">${ic('<path d="M12 5v14M5 12h14"/>', 15, 2)}</button><button type="button" class="zo" aria-label="Zoom out">${ic('<path d="M5 12h14"/>', 15, 2)}</button></div><span class="fz7-hn">Placeholder map</span></div></div>
  <div class="fz7-bt"><span>© 2026 Marrow &amp; Rye Bakery LLC</span><a class="fz7-lk" href="#" style="padding:0;font-size:12.5px"><span>Allergen guide</span><i></i></a><a class="fz7-lk" href="#" style="padding:0;font-size:12.5px"><span>Privacy</span><i></i></a></div>
</div></div>`,
  desc:'Today comes from the clock and is marked by a tint plate that slides between rows with its leading edge first. The status chip is one pill that morphs between open (success), closing soon in the last hour (warning) and closed (danger): it blends color, resizes to its new text, and the text blur-swaps. The Preview buttons set another time so you can see each state. The map placeholder drags 1:1 with a rubber band at the edges and glides on release velocity; plus and minus zoom on the soft spring, and the pin widens into its address label on hover or focus. Get directions fills from the left and empties to the right.',
  api:'plate.go(rowTop, rowBottom)   chip: w, color = blend(open, soon, closed)   swap.to(text)   pos.release(p, v, clamp(p + v/ω))   pin.w.set(hover ? label : 30)',
  init(st){
    noNav(st);
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], SH = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const SCH = [[540, 840], null, [420, 1080], [420, 1080], [420, 1080], [420, 1080], [480, 1020]];
    const fm = m => { const h = Math.floor(m / 60), mm = m % 60; return `${h % 12 || 12}${mm ? ':' + String(mm).padStart(2, '0') : ':00'} ${h < 12 ? 'am' : 'pm'}`; };
    const tb = $(st, '.fz7-tb'), plate = $(tb, '.fz7-pl'), pg = $(st, '.fz7-pg');
    const order = [1, 2, 3, 4, 5, 6, 0];
    const rows = order.map(d => { const li = E('li'); li.innerHTML = `<span>${DAYS[d]}<i hidden>Today</i></span><span>${SCH[d] ? fm(SCH[d][0]) + ' to ' + fm(SCH[d][1]) : 'Closed'}</span>`; tb.appendChild(li); return { d, li, tag:$(li, 'i'), today:new Track(0, S.base) }; });
    const lk = links(st, '.fz7-lk'), pe = edges(0, 0);
    // preview times
    const PV = [{ n:'Live' }, { n:'Wed 9:00 am', d:3, m:540 }, { n:'Fri 5:35 pm', d:5, m:1055 }, { n:'Sun 3:15 pm', d:0, m:915 }, { n:'Mon 10:00 am', d:1, m:600 }];
    const pvEl = $(st, '.fz7-pv'), pbs = PV.map((p, i) => { const b = E('button'); b.type = 'button'; b.className = 'fz7-pb'; b.textContent = p.n; b.setAttribute('aria-pressed', i === 0); pvEl.appendChild(b); return { b, sel:new Track(i === 0 ? 1 : 0, S.base), hv:hoverTr(b) }; });
    const T0 = Date.now(); let mode = 0, key = '', todayI = -1;
    pbs.forEach((p, i) => p.b.onclick = () => { if (i === mode) return; mode = i; pbs.forEach((q, j) => { q.sel.set(j === i ? 1 : 0); q.b.setAttribute('aria-pressed', j === i); }); });
    const vnow = t => { if (mode) return PV[mode]; const d = new Date(T0 + t * 1000); return { d:d.getDay(), m:d.getHours() * 60 + d.getMinutes() }; };
    // status chip
    const chip = $(st, '.fz7-chip'), ctx = $(st, '.fz7-ctx'), ctt = swapText(ctx), cw = new Track(0), cs = [new Track(0), new Track(0), new Track(0)];
    const status = ({ d, m }) => { const s = SCH[d];
      if (s && m >= s[0] && m < s[1]){ const left = s[1] - m; return left <= 60 ? [1, `Closes in ${left} min`] : [0, `Open now, until ${fm(s[1])}`]; }
      if (s && m < s[0]) return [2, `Closed, opens at ${fm(s[0])}`];
      for (let i = 1; i <= 7; i++){ const n = (d + i) % 7; if (SCH[n]) return [2, `Closed, opens ${i === 1 ? 'tomorrow' : SH[n]} ${fm(SCH[n][0])}`]; }
      return [2, 'Closed']; };
    const geoRow = i => [rows[i].li.offsetTop, rows[i].li.offsetTop + rows[i].li.offsetHeight];
    const setToday = (d, inst) => { const i = order.indexOf(d); if (i === todayI) return; todayI = i; rows.forEach((r, j) => { r.today.set(j === i ? 1 : 0); r.tag.hidden = j !== i; });
      inst ? pe.jump(...geoRow(i)) : pe.go(...geoRow(i)); };
    const COLS = ['var(--success)', 'var(--warning)', 'var(--danger)'], TINT = ['var(--success-tint)', 'var(--warning-tint)', 'var(--danger-tint)'];
    const blend = cols => { let c = cols[0][1], a = Math.max(cols[0][0], 0); for (let k = 1; k < cols.length; k++){ const w = Math.max(cols[k][0], 0); a += w; if (w > .002) c = `color-mix(in oklab, ${cols[k][1]} ${(w / (a || 1) * 100).toFixed(1)}%, ${c})`; } return c; };
    let first = true, measured = -1;
    // directions button: fill with leading edge first
    const gd = $(st, '.fz7-gd'), gfl = $(gd, '.fl'), ge = edges(0, 0), gh = hoverTr(gd), garr = $(gd, 'svg');
    gd.addEventListener('pointerenter', () => ge.go(0, 1)); gd.addEventListener('focus', () => ge.go(0, 1));
    gd.addEventListener('pointerleave', () => { ge.go(1, 1); }); gd.addEventListener('blur', () => { ge.go(1, 1); });
    gd.addEventListener('pointerenter', () => { if (ge.A.target === 1) ge.jump(0, 0), ge.go(0, 1); });
    // map
    const mv = $(st, '.fz7-mv'), sv = $(st, '.fz7-sv'), pn = $(st, '.fz7-pn'), lb = $(pn, '.lb');
    sv.innerHTML = `<svg width="760" height="440" viewBox="0 0 760 440" aria-hidden="true"><rect width="760" height="440" fill="var(--raised)"/>
      <path d="M70 50h190a18 18 0 0 1 18 18v96a18 18 0 0 1-18 18H70a18 18 0 0 1-18-18V68a18 18 0 0 1 18-18z" fill="var(--accent-tint)"/><path d="M500 262h170a18 18 0 0 1 18 18v84a18 18 0 0 1-18 18H500a18 18 0 0 1-18-18v-84a18 18 0 0 1 18-18z" fill="var(--accent-tint)"/>
      <path d="M-20 346C130 312 250 396 410 356S650 276 780 316" fill="none" stroke="var(--line)" stroke-width="30" stroke-linecap="round"/>
      <g stroke="var(--card)" fill="none" stroke-linecap="round"><path d="M0 200H760" stroke-width="15"/><path d="M380 0V440" stroke-width="15"/><path d="M0 118 760 262" stroke-width="10"/><path d="M190 0V440M570 0V440" stroke-width="7"/><path d="M0 100H760M0 290H760" stroke-width="6"/></g>
      <g font-family="Geist, system-ui, sans-serif" font-size="11" fill="var(--muted)" font-weight="500"><text x="120" y="204">NW Alder St</text><text x="500" y="204">NW Alder St</text><text transform="translate(374 80) rotate(-90)" >NW 21st Ave</text><text transform="translate(184 400) rotate(-90)">NW 19th Ave</text></g>
      <text x="108" y="114" font-family="Geist, system-ui, sans-serif" font-size="11" fill="var(--muted)" font-weight="500">Couch Park</text></svg>`;
    const MW = 760, MH = 440, px0 = new Track(0, S.soft), py0 = new Track(0, S.soft), zs = new Track(1, S.soft), pw = new Track(30, S.base), lo = new Track(0, S.base);
    let held = false, hx = 0, hy = 0, sx = 0, sy = 0, ox = 0, oy = 0, lbW = 0;
    const bounds = z => { const bx = Math.max(0, (MW * z - mv.clientWidth) / 2), by = Math.max(0, (MH * z - mv.clientHeight) / 2); return [bx, by]; };
    const glide = (tr, pos, vel, b) => { const w = S.soft.w, T = clamp(pos + vel / w, -b, b); let v0 = vel; const x0 = pos - T; if (x0 < 0) v0 = Math.min(v0, -w * x0); else if (x0 > 0) v0 = Math.max(v0, -w * x0); tr.release(pos, v0, T); };
    drag(mv, { down:p => { held = true; sx = p.cx; sy = p.cy; ox = px0.at(now()); oy = py0.at(now()); hx = ox; hy = oy; },
      move:p => { const [bx, by] = bounds(zs.at(now())); const nx = ox + p.cx - sx, ny = oy + p.cy - sy; hx = Math.abs(nx) > bx ? Math.sign(nx) * (bx + rb(Math.abs(nx) - bx, 70)) : nx; hy = Math.abs(ny) > by ? Math.sign(ny) * (by + rb(Math.abs(ny) - by, 70)) : ny; },
      up:(p, v) => { held = false; const [bx, by] = bounds(zs.at(now())); glide(px0, hx, v.vx, bx); glide(py0, hy, v.vy, by); } });
    const pan = (dx, dy) => { const [bx, by] = bounds(zs.target); px0.set(clamp(px0.target + dx, -bx, bx)); py0.set(clamp(py0.target + dy, -by, by)); };
    mv.addEventListener('keydown', e => { const k = e.key; if (k === 'ArrowLeft') pan(48, 0); else if (k === 'ArrowRight') pan(-48, 0); else if (k === 'ArrowUp') pan(0, 48); else if (k === 'ArrowDown') pan(0, -48); else if (k === '+' || k === '=') zoom(.3); else if (k === '-') zoom(-.3); else return; e.preventDefault(); });
    const zoom = d => { const z = clamp(zs.target + d, 1, 1.9); zs.set(z); const [bx, by] = bounds(z); px0.set(clamp(px0.target, -bx, bx)); py0.set(clamp(py0.target, -by, by)); };
    $(st, '.zi').onclick = () => zoom(.3); $(st, '.zo').onclick = () => zoom(-.3);
    const pOn = () => { pw.set(30 + lbW); lo.set(1); }, pOff = () => { pw.set(30, S.snap); lo.set(0, S.snap); };
    pn.addEventListener('pointerenter', pOn); pn.addEventListener('pointerleave', pOff); pn.addEventListener('focus', pOn); pn.addEventListener('blur', pOff);
    pn.addEventListener('pointerdown', e => e.stopPropagation());
    const sync = () => { lbW = lb.scrollWidth; };
    const init0 = () => { sync(); const d = vnow(clock.t); setToday(d.d, true); first = true; key = ''; };
    document.fonts.ready.then(init0); requestAnimationFrame(init0);
    return t => {
      lk(t); ctt.render(t);
      const v = vnow(t), k = mode + ':' + v.d + ':' + v.m;
      if (k !== key){ key = k; const [s, text] = status(v); cs.forEach((x, i) => x.set(i === s ? 1 : 0, S.soft)); setToday(v.d, first && false); ctt.put(text, first); first = false; }
      const need = ctt.el().scrollWidth;
      if (need && need !== measured){ if (measured < 0) cw.jump(need); else cw.set(need, S.base); measured = need; }
      ctx.style.width = px(cw.at(t));
      const w3 = cs.map(x => clamp(x.at(t)));
      chip.style.background = blend(w3.map((w, i) => [w, TINT[i]])); chip.style.color = blend(w3.map((w, i) => [w, COLS[i]]));
      rows.forEach(r => { const q = clamp(r.today.at(t)); r.li.style.color = mix(q, 'var(--ink)', 'var(--muted)'); fade(r.tag, q, null, false); });
      const a = pe.A.at(t), b = pe.B.at(t); plate.style.transform = `translateY(${px(a)})`; plate.style.height = px(Math.max(0, b - a));
      pbs.forEach(p => { const s = clamp(p.sel.at(t)); p.b.style.background = mix(s, 'var(--ink)', 'transparent'); p.b.style.color = mix(s, 'var(--card)', 'var(--ink)'); p.b.style.borderColor = mix(s, 'var(--ink)', 'var(--line)'); });
      const ga = clamp(ge.A.at(t)), gb = clamp(ge.B.at(t)), gp = clamp(gh.h.at(t)), gdn = clamp(gh.d.at(t)); gfl.style.clipPath = `inset(0 ${((1 - gb) * 100).toFixed(1)}% 0 ${(ga * 100).toFixed(1)}%)`; gd.style.color = mix(Math.max(0, gb - ga), 'var(--card)', 'var(--ink)'); garr.style.transform = `translateX(${px(gp * 3)})`; gd.style.transform = `scale(${(1 - .03 * gdn).toFixed(4)})`;
      // map
      const z = zs.at(t), x = held ? hx : px0.at(t), y = held ? hy : py0.at(t);
      sv.style.transform = `translate(${px(x)},${px(y)}) scale(${z.toFixed(4)})`;
      const pwv = pw.at(t), lov = clamp(lo.at(t)); pn.style.width = px(pwv); pn.style.left = px(mv.clientWidth / 2 + x - 15); pn.style.top = px(mv.clientHeight / 2 + y - 15 - 0); fade(lb, lov, null, false);
      pn.style.zIndex = 2; if (!lbW) sync();
    };
  }});


/* ================================================================ 8. Everything footer */
atom({ id:'fz8-full', cat:'Footers', name:'Full footer with staggered entrance', block:'SiteFooter (full variant), NewsletterForm, LanguagePicker, StatusIndicator', fam:['E','M','S','X','T'], wide:true, tall:true,
  html:`<style>
${fauxCss('fz8-')}${DK('fz8-')}${colCss('fz8-')}
.fz8-ft{padding:clamp(22px,4cqw,40px) clamp(14px,3.4cqw,32px) 0;text-align:left;display:flex;flex-direction:column;gap:clamp(26px,4cqw,40px)}
.fz8-bd{background:var(--card);box-shadow:var(--shadow);border-radius:22px;padding:clamp(22px,4.6cqw,44px);display:grid;grid-template-columns:minmax(0,1fr);gap:22px 40px}
.fz8-ey{font-size:13px;color:var(--muted);margin-bottom:12px}
.fz8-hl{margin:0;font-size:clamp(28px,5cqw,52px);line-height:1.05;letter-spacing:-.035em;font-weight:600;max-width:17ch;text-wrap:balance}
.fz8-ac{display:flex;flex-wrap:wrap;align-items:center;gap:12px 22px;align-self:end}
.fz8-btn{display:inline-flex;align-items:center;height:52px;padding:0 24px;border:0;background:var(--ink);color:#0C1016;font-size:16px;font-weight:600;letter-spacing:-.01em;cursor:pointer;border-radius:14px;white-space:nowrap}
.fz8-ar{display:inline-flex;width:0;overflow:hidden;opacity:0}
.fz8-sec{font-size:15px;font-weight:500}
.fz8-mn{display:grid;grid-template-columns:minmax(0,1fr);gap:30px 40px}
.fz8-nt{margin:0;font-size:clamp(18px,2.4cqw,22px);letter-spacing:-.02em;font-weight:600}
.fz8-nx{margin:8px 0 14px;font-size:14px;line-height:1.5;color:var(--muted);max-width:40ch}
.fz8-fw{position:relative;max-width:420px}
.fz8-fd{display:flex;align-items:center;gap:6px;height:50px;padding:4px;border-radius:14px;background:var(--card);border:1.5px solid var(--muted)}
.fz8-in{flex:1;min-width:0;height:100%;border:0;background:none;color:var(--ink);font:15px var(--sans);outline:none;padding:0 12px}
.fz8-in:focus-visible{outline:none}
.fz8-fd:focus-within{border-color:var(--muted)}
.fz8-sb{position:relative;flex:none;height:100%;border:0;border-radius:10px;background:var(--ink);color:#0C1016;font-size:14px;font-weight:600;cursor:pointer;overflow:hidden;padding:0}
.fz8-sb .ly{position:absolute;inset:0;display:grid;place-items:center;white-space:nowrap}
.fz8-ok{position:absolute;inset:0;display:flex;align-items:center;gap:10px;padding:0 14px;border-radius:14px;background:var(--success-tint);color:var(--success);font-size:14px;font-weight:500;pointer-events:none}
.fz8-ok button{pointer-events:auto;margin-left:auto;border:0;background:none;color:var(--ink);font-size:13px;text-decoration:underline;text-underline-offset:2px;cursor:pointer;padding:4px}
.fz8-mg{position:relative;height:0;overflow:hidden;font-size:13px;color:var(--danger)}
.fz8-mg span{position:absolute;left:2px;top:8px;white-space:nowrap}
.fz8-cs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 16px}
.fz8-rw{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px 24px;border-top:1px solid var(--line);padding-top:20px}
.fz8-sl{display:flex;flex-wrap:wrap;gap:6px}
.fz8-pl{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 11px 0 13px;border-radius:999px;background:var(--raised);font-size:13px;font-weight:500;color:var(--ink);text-decoration:none}
.fz8-ss{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px}
.fz8-st{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)}
.fz8-st b{width:8px;height:8px;border-radius:50%;background:var(--success)}
.fz8-up{display:flex;align-items:flex-end;gap:2px;height:18px}
.fz8-up i{display:block;width:3px;height:100%;border-radius:1px;background:var(--success);transform-origin:50% 100%}
.fz8-up i.w{background:var(--warning)}
.fz8-lw{position:relative}
.fz8-lg{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 10px 0 12px;border:0;border-radius:10px;background:var(--raised);color:var(--ink);font-size:13px;font-weight:500;cursor:pointer}
.fz8-lb{position:absolute;right:0;bottom:calc(100% + 6px);min-width:100%;width:max-content;margin:0;padding:4px;list-style:none;background:var(--raised);border-radius:12px;box-shadow:var(--shadow);z-index:30;transform-origin:100% 100%}
.fz8-lb li{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:7px 10px;border-radius:8px;font-size:13px;cursor:pointer;color:var(--ink)}
.fz8-lb li svg{color:var(--accent)}
.fz8-wm{overflow:hidden}
.fz8-wt{display:inline-block;white-space:nowrap;font-weight:600;letter-spacing:-.045em;margin-left:-.025em;line-height:.9;color:var(--ink);font-size:100px;padding-bottom:.04em}
.fz8-wt span{display:inline-block}
.fz8-bt{display:flex;flex-wrap:wrap;gap:6px 18px;padding:2px 0 18px;font-size:12.5px;color:var(--muted)}
.fz8-bt a{color:inherit;text-decoration:none}
.fz8-rp{position:absolute;top:10px;right:12px;z-index:8}
.fz8-pg{scrollbar-width:thin;scrollbar-color:var(--muted) transparent}
@container (min-width:520px){.fz8-cs{grid-template-columns:repeat(4,minmax(0,1fr))}}
@container (min-width:760px){.fz8-bd{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)}}
@container (min-width:900px){.fz8-mn{grid-template-columns:minmax(0,4.5fr) minmax(0,7.5fr)}}
</style>
<div class="fz8-pg" tabindex="0" role="region" aria-label="Sample page, scroll to reach the footer">
${faux('fz8-', { brand:'Cairn', nav:['Product', 'Pricing', 'Docs'], kicker:'Research · Funnels', title:'Most drop-off is one confusing step, not the whole funnel', a:'Across four thousand funnels we looked at where people stopped. In nearly two thirds of them, one step accounted for more than half of the loss, and it was rarely the step the team suspected.', b:'The fix was usually copy or a field label. Changing the order of steps almost never moved the number.' })}
<div class="fz8-ft fz8-dk" role="contentinfo">
  <section class="fz8-bd" aria-labelledby="fz8-hd">
    <div><div class="fz8-ey" data-i="eyebrow">Free for 14 days. No card needed.</div><h2 class="fz8-hl" id="fz8-hd" data-i="head">See why users leave, not just that they did.</h2></div>
    <div class="fz8-ac"><button type="button" class="fz8-btn"><span data-i="start">Start free</span><span class="fz8-ar">${ARROW}</span></button><a class="fz8-lk fz8-sec" href="#"><span data-i="talk">Talk to us</span><i></i></a></div>
  </section>
  <div class="fz8-mn">
    <div class="fz8-nl"><h4 class="fz8-nt" data-i="nlt">The Cairn letter</h4><p class="fz8-nx" data-i="nlx">One email a month. What we learned from 4,000 funnels, with no product pitches.</p>
      <form class="fz8-nf" novalidate><div class="fz8-fw"><div class="fz8-fd"><input class="fz8-in" id="fz8-em" type="email" autocomplete="email" aria-label="Email address" placeholder="you@company.com"><button type="submit" class="fz8-sb" aria-label="Subscribe"></button></div>
        <div class="fz8-ok" role="status" aria-live="polite">${ic(I.check, 16, 2.5)}<span data-i="okt">You are on the list.</span><button type="button" class="fz8-un" data-i="again">Use another address</button></div></div>
        <div class="fz8-mg" role="alert"><span></span></div></form></div>
    <nav class="fz8-cs" aria-label="Footer">${[['Product', ['Funnels', 'Session replays', 'Experiments', 'Warehouse sync', 'Pricing']], ['Resources', ['Documentation', 'Guides', 'Changelog', 'Research', 'Community']], ['Company', ['About', 'Careers', 'Press', 'Customers', 'Contact']], ['Legal', ['Privacy', 'Terms', 'Data processing', 'Subprocessors', 'Security']]].map(([h, ls], i) => `<div class="fz8-c"><h4 class="fz8-h" data-i="h${i}">${h}</h4><ul class="fz8-u">${ls.map(l => `<li><a class="fz8-lk" href="#"><span>${l}</span><i></i></a></li>`).join('')}</ul></div>`).join('')}</nav>
  </div>
  <div class="fz8-rw">
    <div class="fz8-sl">${['LinkedIn', 'YouTube', 'Source control', 'Mastodon'].map(n => `<a class="fz8-pl" href="#"><span>${n}</span>${UPR}</a>`).join('')}</div>
    <div class="fz8-ss"><span class="fz8-st"><b></b><span data-i="stt">All systems operational</span></span><span class="fz8-up" role="img" aria-label="Uptime over the last 30 days: 28 days without incidents, 2 days with minor incidents"></span>
      <div class="fz8-lw"><button type="button" class="fz8-lg" aria-haspopup="listbox" aria-expanded="false" aria-controls="fz8-lb" aria-label="Language">${ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>', 15, 1.8)}<span class="lt" data-i="lang">English</span>${ic(I.chev, 14, 2)}</button>
        <ul class="fz8-lb" id="fz8-lb" role="listbox" aria-label="Choose a language" tabindex="-1"></ul></div></div>
  </div>
  <div class="fz8-wm" aria-hidden="true"><span class="fz8-wt">${[...'cairn analytics'].map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</span></div>
  <div class="fz8-bt"><span>© 2026 Cairn Analytics, Inc.</span><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookie settings</a></div>
</div><button type="button" class="btn fz8-rp">Replay</button></div>`,
  desc:'The footer enters in one staggered sequence: eyebrow, headline, actions, newsletter, the four link columns, social, status and language, each 55ms after the one before, then the wordmark letters rise 40ms apart and the thirty uptime bars grow in. Scrolling away and back replays it. The newsletter field rings in danger for a bad address and opens its message; a good one shrinks the button into a spinner, then a success check, then the field gives way to a confirmation. The language picker pops a listbox above the button; choosing a language blur-swaps every labelled string out in 100ms and the new text in, one group after another.',
  api:'item[i].set(1, S.soft, t + i·0.055)   letter[j].set(1, S.soft, t + n·0.055 + j·0.04)   bar[k].set(1, S.soft, …k·0.012)   text.o.set(0, S.snap) → swap copy → o.set(1)',
  init(st){
    noNav(st);
    const pg = $(st, '.fz8-pg'), ft = $(st, '.fz8-ft'), lk = links(st, '.fz8-lk'), sm = smooth(pg), q = queue();
    const LANG = [
      { n:'English', c:'en', eyebrow:'Free for 14 days. No card needed.', head:'See why users leave, not just that they did.', start:'Start free', talk:'Talk to us', nlt:'The Cairn letter', nlx:'One email a month. What we learned from 4,000 funnels, with no product pitches.', sub:'Subscribe', ph:'you@company.com', okt:'You are on the list.', again:'Use another address', err:'Enter an address like name@company.com', h:['Product', 'Resources', 'Company', 'Legal'], stt:'All systems operational' },
      { n:'Español', c:'es', eyebrow:'Gratis durante 14 días. Sin tarjeta.', head:'Descubre por qué se van tus usuarios, no solo que se van.', start:'Empezar gratis', talk:'Hablar con nosotros', nlt:'La carta de Cairn', nlx:'Un correo al mes. Lo que aprendimos de 4.000 embudos, sin publicidad de producto.', sub:'Suscribirme', ph:'tu@empresa.com', okt:'Ya estás en la lista.', again:'Usar otra dirección', err:'Escribe una dirección como nombre@empresa.com', h:['Producto', 'Recursos', 'Empresa', 'Legal'], stt:'Todos los sistemas operativos' },
      { n:'Français', c:'fr', eyebrow:'Gratuit pendant 14 jours. Sans carte bancaire.', head:'Comprenez pourquoi vos utilisateurs partent, pas seulement qu’ils partent.', start:'Commencer gratuitement', talk:'Nous contacter', nlt:'La lettre Cairn', nlx:'Un e-mail par mois. Ce que nous avons appris de 4 000 entonnoirs, sans argumentaire commercial.', sub:'S’abonner', ph:'vous@entreprise.fr', okt:'Vous êtes inscrit.', again:'Utiliser une autre adresse', err:'Saisissez une adresse comme nom@entreprise.fr', h:['Produit', 'Ressources', 'Entreprise', 'Mentions légales'], stt:'Tous les systèmes sont opérationnels' } ];
    let L = 0;
    const txt = $$(st, '[data-i]').map(el => ({ el, k:el.dataset.i, o:new Track(1, S.base), g:{ eyebrow:0, head:0, start:1, talk:1, nlt:2, nlx:2, again:2, okt:2 }[el.dataset.i] ?? 3 }));
    const val = (k, l) => /^h\d$/.test(k) ? LANG[l].h[+k[1]] : k === 'lang' ? LANG[l].n : LANG[l][k];
    // newsletter
    const inp = $(st, '.fz8-in'), sb = $(st, '.fz8-sb'), fd = $(st, '.fz8-fd'), ok = $(st, '.fz8-ok'), nf = $(st, '.fz8-nf'), mg = $(st, '.fz8-mg'), mgt = $(mg, 'span');
    const SP = ic('<path d="M12 3a9 9 0 0 1 9 9"/>', 18, 2.25), CK = ic(I.check, 18, 2.5);
    const sl = [E('span'), E('span'), E('span')].map((e, i) => { e.className = 'ly'; e.innerHTML = i === 1 ? SP : i === 2 ? CK : ''; sb.appendChild(e); return e; }); const spin = $(sl[1], 'svg');
    const ssw = new Swap(0), bw = new Track(100), okT = new Track(0), errT = new Track(0), inO = new Track(1), doneT = new Track(0), mgH = new Track(0);
    let busy = false, baseW = 100, lastL = -1;
    const label = () => { sl[0].textContent = LANG[L].sub; const c = getComputedStyle(sb), cx = (label.cv = label.cv || document.createElement('canvas')).getContext('2d'); cx.font = `${c.fontWeight} ${c.fontSize} ${c.fontFamily}`; baseW = Math.ceil(cx.measureText(LANG[L].sub).width) + 36; };
    const valid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value);
    nf.onsubmit = e => { e.preventDefault(); if (busy) return;
      if (!valid()){ errT.set(1); mgt.textContent = LANG[L].err; mgH.set(1); inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
      errT.set(0); mgH.set(0); inp.removeAttribute('aria-invalid'); busy = true; const t0 = now();
      q.at(t0, () => { ssw.to(1); bw.set(46); }); q.at(t0 + .9, () => { ssw.to(2); okT.set(1); }); q.at(t0 + 1.5, () => { inO.set(0, S.snap); doneT.set(1, S.base, now() + .12); ok.style.pointerEvents = 'auto'; }); };
    inp.addEventListener('input', () => { if (errT.target && valid()){ errT.set(0); mgH.set(0); inp.removeAttribute('aria-invalid'); } });
    $(st, '.fz8-un').onclick = () => { q.clear(); busy = false; doneT.set(0, S.snap); inO.set(1, S.base, now() + .1); ssw.to(0); okT.set(0); bw.set(baseW); inp.value = ''; setTimeout(() => inp.focus({ preventScroll:true }), 120); };
    // language picker
    const lg = $(st, '.fz8-lg'), lb = $(st, '.fz8-lb'), lo = new Track(0); let hi = 0, lopen = false;
    const opts = LANG.map((l, i) => { const li = E('li'); li.setAttribute('role', 'option'); li.id = 'fz8-o' + i; li.innerHTML = `<span>${l.n}</span>${ic(I.check, 14, 2.5)}`; lb.appendChild(li); return { li, ck:$(li, 'svg'), h:new Track(0, S.snap), s:new Track(i === 0 ? 1 : 0) }; });
    const paintSel = () => opts.forEach((o, i) => { o.li.setAttribute('aria-selected', i === L); o.s.set(i === L ? 1 : 0); });
    const setHi = i => { hi = i; opts.forEach((o, j) => o.h.set(j === i ? 1 : 0)); lb.setAttribute('aria-activedescendant', 'fz8-o' + i); };
    const lopenSet = v => { if (v === lopen) return; lopen = v; openSet(lo, v); lg.setAttribute('aria-expanded', v); if (v){ setHi(L); setTimeout(() => lb.focus({ preventScroll:true }), 90); } };
    const choose = i => { lopenSet(false); setTimeout(() => lg.focus({ preventScroll:true }), 0); if (i === L) return; L = i; paintSel();
      const t0 = now(); txt.forEach((x, k) => { const d = t0 + x.g * .06 + (k % 5) * .008; x.o.set(0, S.snap, d); q.at(d + EXIT, () => { x.el.textContent = val(x.k, L); x.o.set(1, S.base); });
        });
      q.at(t0 + .3, () => { inp.placeholder = LANG[L].ph; label(); if (mg.style.height !== '0px' && errT.target) mgt.textContent = LANG[L].err; }); };
    lg.onclick = () => lopenSet(!lopen);
    lb.addEventListener('keydown', e => { const k = e.key;
      if (k === 'ArrowDown'){ e.preventDefault(); setHi((hi + 1) % LANG.length); } else if (k === 'ArrowUp'){ e.preventDefault(); setHi((hi + LANG.length - 1) % LANG.length); }
      else if (k === 'Enter' || k === ' '){ e.preventDefault(); choose(hi); } else if (k === 'Escape'){ e.preventDefault(); lopenSet(false); setTimeout(() => lg.focus({ preventScroll:true }), 0); } else if (k === 'Tab') lopenSet(false); });
    opts.forEach((o, i) => { o.li.onpointermove = () => { if (hi !== i) setHi(i); }; o.li.onclick = () => choose(i); });
    outside(st, [lg, lb], () => lopenSet(false));
    lg.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); lopenSet(true); } });
    // entrance
    const items = [$(st, '.fz8-ey'), $(st, '.fz8-hl'), $(st, '.fz8-ac'), $(st, '.fz8-nt'), $(st, '.fz8-nx'), $(st, '.fz8-nf'), ...$$(st, '.fz8-c'), $(st, '.fz8-sl'), $(st, '.fz8-ss'), $(st, '.fz8-bt')];
    const rv = items.map(() => new Track(0, S.soft)), wt = $(st, '.fz8-wt'), wm = $(st, '.fz8-wm'), L8 = $$(wt, 'span'), wl = L8.map(() => new Track(0, S.soft));
    const up = $(st, '.fz8-up'); up.innerHTML = Array.from({ length:30 }, (_, i) => `<i${i === 11 || i === 22 ? ' class="w"' : ''}></i>`).join(''); const bars = $$(up, 'i'), bt = bars.map(() => new Track(0, S.soft));
    const ib = items.indexOf($(st, '.fz8-ss')); let armed = true, fitW = 0;
    const start = t => { const n = items.length; rv.forEach((x, i) => x.set(1, S.soft, t + i * .055)); wl.forEach((x, i) => x.set(1, S.soft, t + n * .055 + i * .04)); bt.forEach((x, i) => x.set(1, S.soft, t + ib * .055 + .15 + i * .012)); };
    const reset = () => { rv.forEach(x => x.jump(0)); wl.forEach(x => x.jump(0)); bt.forEach(x => x.jump(0)); };
    $(st, '.fz8-rp').onclick = () => { sm.to(0); reset(); armed = false; q.at(now() + .25, () => start(now())); };
    const fit = () => { const W = wm.clientWidth; if (!W) return; wt.style.fontSize = '100px'; const w100 = wt.offsetWidth; wt.style.fontSize = (W * 100 / w100).toFixed(2) + 'px'; fitW = wm.clientWidth; };
    document.fonts.ready.then(() => { fitW = 0; label(); });
    // hover tracks
    const btn = $(st, '.fz8-btn'), ar = $(st, '.fz8-ar'), bh = hoverTr(btn), pls = $$(st, '.fz8-pl').map(a => ({ a, h:hoverTr(a), u:$(a, 'svg') }));
    label(); bw.jump(baseW); sb.style.width = px(baseW);
    return t => {
      q.run(t); sm.render(t); lk(t);
      const H = pg.clientHeight, vis = pg.scrollTop + H - topIn(ft, pg);
      if (armed && vis > 90){ armed = false; start(t); } else if (!armed && vis < -20 && !rv.some(x => x.target === 0)){ armed = true; reset(); }
      items.forEach((e, i) => { const p = clamp(rv[i].at(t)); fade(e, p, (1 - p) * 16); });
      if (wm.clientWidth !== fitW) fit();
      L8.forEach((l, i) => { l.style.transform = `translateY(${((1 - clamp(wl[i].at(t))) * 108).toFixed(2)}%)`; });
      bars.forEach((b, i) => { b.style.transform = `scaleY(${clamp(bt[i].at(t)).toFixed(3)})`; });
      txt.forEach(x => fade(x.el, x.o.at(t), null, true));
      // newsletter
      sl.forEach((e, i) => ssw.apply(e, i, t, 4)); spin.style.transform = `rotate(${(t * 420 % 360).toFixed(1)}deg)`;
      if (!busy && baseW !== lastL){ lastL = baseW; bw.set(baseW); }
      sb.style.width = px(bw.at(t)); const g = clamp(okT.at(t)), k = clamp(errT.at(t)), d = clamp(doneT.at(t));
      sb.style.background = mix(g, 'var(--success)', 'var(--ink)'); sb.style.color = mix(g, '#fff', '#0C1016');
      fd.style.boxShadow = `0 0 0 1.5px color-mix(in oklab, var(--danger) ${(k * 100).toFixed(1)}%, transparent)`;
      fade(fd, inO.at(t), null, false); inp.style.visibility = inO.at(t) < .01 && !inO.target ? 'hidden' : 'visible'; sb.style.visibility = inp.style.visibility;
      fade(ok, d, (1 - d) * 4); ok.style.visibility = d < .01 ? 'hidden' : 'visible'; ok.style.pointerEvents = d > .5 ? 'auto' : 'none';
      mg.style.height = px(clamp(mgH.at(t)) * 28); fade(mgt, mgH.at(t), null, false);
      // language
      pop(lb, lo.at(t), 6); opts.forEach(o => { const h = clamp(o.h.at(t)); o.li.style.background = mix(h, 'var(--card)', 'transparent'); fade(o.ck, o.s.at(t), null, false); });
      // hovers
      const h1 = clamp(bh.h.at(t)), dn = clamp(bh.d.at(t)); ar.style.width = px(h1 * 20); ar.style.opacity = h1.toFixed(3); ar.style.marginLeft = px(h1 * 8); ar.style.transform = `translateX(${px((1 - h1) * -8)})`;
      btn.style.borderRadius = px(lerp(14, 26, h1)); btn.style.background = mix(h1, 'var(--accent)', 'var(--ink)'); btn.style.transform = `scale(${(1 - .03 * dn).toFixed(4)})`;
      pls.forEach(({ a, h, u }) => { const x = clamp(h.h.at(t)), c = clamp(h.d.at(t)); a.style.background = mix(x, 'var(--ink)', 'transparent'); a.style.color = mix(x, '#0C1016', 'var(--ink)'); a.style.borderColor = mix(x, 'var(--ink)', 'var(--line)'); u.style.transform = `translate(${px(x * 2)},${px(-x * 2)})`; a.style.transform = `scale(${(1 - .03 * c).toFixed(4)})`; });
    };
  }});


})();