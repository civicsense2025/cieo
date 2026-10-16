

/* ---------- Agent activity (organisms): an agent browses a site while a human watches ---------- */
/* Grounded in the review tool's local review workspace: scoped agents with their own browsers, "Follow screen" / "My view",
   Browse and Comment modes, inspect_elements, masked private regions, subagents, and presence awareness
   (activity: selecting / commenting / idle, element-relative cursors, route + viewport). */
(() => {
const gEl = (tag, css, text) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; };
const SR = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
// timed queue; holds and long gaps (tile off screen) shift pending items instead of firing them all at once
const gQ = () => { const q = []; let last = null, held = null;
  return { at(t, fn){ q.push([t, fn]); q.sort((a, b) => a[0] - b[0]); },
    run(t){ if (held !== null) return; if (last !== null && t - last > .3){ const g = t - last - .05; q.forEach(e => e[0] += g); } last = t; while (q.length && q[0][0] <= t) q.shift()[1](); },
    hold(v, t = now()){ if (v){ if (held === null) held = t; } else if (held !== null){ const g = t - held; q.forEach(e => e[0] += g); held = null; last = t; } },
    get held(){ return held !== null; }, clear(){ q.length = 0; } }; };
const STAR = '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 6.8v10.4M12 6.8c4.6 1.9 4.6 8.5 0 10.4M7.4 13.3l9.2-2"/></g>';
const starSvg = s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${STAR}</svg>`;
const ARROW = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 3.5v15.2l3.9-3.6 2.7 5.9 2.6-1.2-2.7-5.8 5.3-.3z" fill="currentColor" stroke="var(--card)" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const G = { back:'<path d="M15 5l-7 7 7 7"/>', fwd:'<path d="M9 5l7 7-7 7"/>', lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', up:'<path d="M12 19V6M6 11l6-6 6 6"/>', down:'<path d="M12 5v13M6 13l6 6 6-6"/>', pin:'<path d="M12 21s-6-5.4-6-10a6 6 0 0 1 12 0c0 4.6-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>', dash:'<path d="M6 12h12"/>', ban:'<circle cx="12" cy="12" r="8"/><path d="M6.5 6.5l11 11"/>', doc:'<path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/><path d="M14 3v4h4"/>', eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.6"/>' };

// two stacked text layers that Swap, so a label can change without layout jumps
const gTx = (host, css = '') => {
  const s = [0, 1].map(() => { const e = gEl('span', 'position:absolute;left:0;top:0;white-space:nowrap;' + css); host.appendChild(e); return e; });
  const sw = new Swap(0); let k = 0, cur = null;
  return { s, get k(){ return k; }, get text(){ return cur; },
    put(text, inst){ if (text === cur) return; cur = text;
      if (inst){ s[k].textContent = text; sw.cur = k; sw.prev = null; sw.t = -9; return; }
      k ^= 1; s[k].textContent = text; sw.to(k); },
    render(t){ s.forEach((e, i) => sw.apply(e, i, t, 3)); } };
};
// text swap whose host width morphs to the new text (extra = fixed width added to the text)
const gFit = (host, css = '', extra = 0) => {
  const tx = gTx(host, css), w = new Track(0); let ready = false;
  const nat = () => (tx.s[tx.k].offsetWidth || String(tx.text).length * 6.8) + extra;
  return { tx, put(text, inst){ tx.put(text, inst); if (ready) inst ? w.jump(nat()) : w.set(nat()); },
    render(t){ if (!ready && host.isConnected && host.offsetParent){ w.jump(nat()); ready = true; }
      host.style.width = px(w.at(t)); tx.render(t); } };
};
// direction-aware swap: leaves toward -dir, enters from +dir
class DSw {
  constructor(cur){ this.cur = cur; this.prev = null; this.t = -9; this.dir = 1; }
  to(k, dir = 1, t = now()){ if (k === this.cur) return false; this.prev = this.cur; this.cur = k; this.t = t; this.dir = dir; return true; }
  apply(el, k, t, amp = 18){
    let o = 0, b = 0, x = 0;
    if (k === this.cur){ const p = clamp(prog(t, this.t + EXIT)); o = p; b = (1 - p)*BLUR; x = (1 - p)*amp*this.dir; }
    else if (k === this.prev){ const p = clamp((t - this.t)/EXIT), e = p*p; o = 1 - e; b = e*BLUR; x = -e*amp*this.dir; }
    el.style.opacity = o.toFixed(3); el.style.visibility = o < .01 ? 'hidden' : 'visible';
    el.style.filter = b > .05 ? `blur(${b.toFixed(2)}px)` : 'none'; el.style.transform = `translateX(${x.toFixed(2)}px)`;
  }
}
const gSwitch = (label, on, onChange) => {
  const b = gEl('button', 'flex:none;position:relative;width:36px;height:22px;border-radius:11px;border:0;padding:0;cursor:pointer');
  b.type = 'button'; b.setAttribute('role', 'switch'); b.setAttribute('aria-label', label); b.setAttribute('aria-checked', !!on);
  const k = gEl('i', 'position:absolute;left:3px;top:3px;width:16px;height:16px;border-radius:50%;background:var(--card);box-shadow:0 1px 2px rgba(16,20,26,.25)'); b.appendChild(k);
  const o = { el:b, tr:new Track(on ? 1 : 0), on:!!on,
    set(v, inst, t = now()){ o.on = !!v; b.setAttribute('aria-checked', o.on); inst ? o.tr.jump(v ? 1 : 0) : o.tr.set(v ? 1 : 0, S.base, t); },
    render(t){ const p = clamp(o.tr.at(t)); b.style.background = mix(p, 'var(--accent)', 'var(--line)'); k.style.transform = `translateX(${px(p*14)})`; } };
  b.onclick = () => onChange(!o.on, o);
  return o;
};
// segmented control on the shared edge indicator
const gSeg = (root, onPick, start = 0) => {
  const ind = $(root, '.ind'), btns = $$(root, 'button'), ex = edges(0, 0), ey = edges(0, 0); let cur = start, lw = -1, ready = false;
  const pick = (i, inst, silent) => { cur = i; const b = btns[i]; btns.forEach((x, j) => x.setAttribute('aria-pressed', i === j));
    const f = inst ? 'jump' : 'go'; ex[f](b.offsetLeft, b.offsetLeft + b.offsetWidth); ey[f](b.offsetTop, b.offsetTop + b.offsetHeight); if (!silent) onPick(i); };
  btns.forEach((b, i) => b.onclick = () => { if (i !== cur) pick(i); });
  btns.forEach((b, i) => b.setAttribute('aria-pressed', i === start));
  return { get cur(){ return cur; }, set(i){ pick(i, false, true); },
    render(t){ if ((!ready || root.offsetWidth !== lw) && root.offsetParent){ lw = root.offsetWidth; ready = true; pick(cur, true, true); }
      const a = ex.A.at(t), b = ex.B.at(t), c = ey.A.at(t), d = ey.B.at(t); ind.style.transform = `translate(${px(a)},${px(c)})`; ind.style.width = px(b - a); ind.style.height = px(d - c); } };
};
// a pointer: agents carry a squarish chip with a star, people carry a round chip
const gCur = (kind, name) => {
  const ag = kind === 'agent';
  const el = gEl('div', 'position:absolute;left:0;top:0;pointer-events:none;z-index:40;opacity:0');
  const ar = gEl('span', `position:absolute;left:-5px;top:-3px;width:22px;height:22px;display:block;color:${ag ? 'var(--accent)' : 'var(--ink)'};transform-origin:5px 3px`); ar.innerHTML = ARROW;
  const ch = gEl('span', `position:absolute;left:0;top:0;display:flex;align-items:center;gap:5px;height:22px;padding:0 9px 0 ${ag ? 7 : 10}px;border-radius:${ag ? 6 : 11}px;font-size:12px;font-weight:600;white-space:nowrap;background:${ag ? 'var(--accent)' : 'var(--ink)'};color:var(--card)`);
  ch.innerHTML = (ag ? starSvg(11) : '') + `<span></span>`; ch.lastChild.textContent = name;
  el.append(ar, ch); let cw = 0;
  return { el, name, chip:ch, setName(n){ ch.lastChild.textContent = n; cw = 0; },
    draw(x, y, W, H, press = 0, o = 1){
      if (!cw) cw = ch.offsetWidth || 90;
      el.style.opacity = clamp(o).toFixed(3); el.style.visibility = o < .01 ? 'hidden' : 'visible';
      el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`; ar.style.transform = `scale(${(1 - .16*press).toFixed(3)})`;
      let dx = 12, dy = 17; if (x + dx + cw > W - 4) dx = Math.max(4 - x, W - 4 - cw - x); if (y + dy + 22 > H - 4) dy = -26;
      ch.style.transform = `translate(${dx.toFixed(1)}px,${dy}px)`; } };
};

/* ---- the demo site every atom here reviews (copy mirrors the review tool's own demo-site: Demo Shop, Pricing, Notes) ---- */
const pgCss = p => `
.${p}pg{position:absolute;inset:0;overflow:hidden;background:var(--card);color:var(--ink);font-size:13px;line-height:1.45;container-type:inline-size;display:flex;flex-direction:column}
.${p}nv{flex:none;display:flex;align-items:center;gap:2px;height:44px;padding:0 10px 0 16px;border-bottom:1px solid var(--line-soft)}
.${p}lg{display:flex;align-items:center;gap:7px;font-weight:600;font-size:14px;margin-right:auto;letter-spacing:-.01em}
.${p}lg i{width:16px;height:16px;border-radius:5px;background:var(--ink)}
.${p}nl{padding:5px 10px;border-radius:8px;font-weight:500;color:var(--muted)}
.${p}nl.on{color:var(--ink)}
.${p}ct{width:100%;max-width:840px;margin:0 auto}
.${p}hr{padding:30px 16px 14px}
.${p}ey{font-size:12px;font-weight:600;color:var(--accent);margin-bottom:8px}
.${p}h1{font-size:32px;line-height:1.06;letter-spacing:-.03em;font-weight:600;margin:0 0 10px;max-width:16ch;text-wrap:balance;width:fit-content}
.${p}sub{color:var(--muted);font-size:14px;margin:0 0 16px;max-width:44ch}
.${p}cta{display:flex;flex-wrap:wrap;gap:8px}
.${p}b1,.${p}b2{display:inline-block;padding:8px 14px;border-radius:9px;font-weight:600;font-size:13px}
.${p}b1{background:var(--ink);color:var(--card)}
.${p}b2{background:var(--raised);font-weight:500}
.${p}g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:8px 16px 14px}
.${p}cd{border-radius:12px;padding:12px 14px;background:var(--tile)}
.${p}cd b{display:block;font-size:13.5px}
.${p}cd span{display:block;color:var(--muted);font-size:12.5px;margin-top:2px}
.${p}cd em{display:block;font-style:normal;font-size:22px;font-weight:600;letter-spacing:-.02em;margin:4px 0 2px}
.${p}cd em small{font-size:12px;color:var(--muted);font-weight:400}
.${p}sh{padding:24px 16px 4px;font-size:20px;line-height:1.2;font-weight:600;letter-spacing:-.02em}
.${p}ss{padding:0 16px 8px;color:var(--muted);font-size:13.5px}
.${p}fq{padding:10px 16px;border-top:1px solid var(--line-soft)}
.${p}fq b{display:block;font-size:13.5px}
.${p}fq span{color:var(--muted)}
.${p}ps{display:flex;justify-content:space-between;gap:12px;padding:11px 16px;border-top:1px solid var(--line-soft)}
.${p}ps b{font-size:14px;font-weight:600}
.${p}ps span{color:var(--muted);white-space:nowrap}
.${p}ft{margin-top:auto;display:flex;gap:14px;flex-wrap:wrap;padding:12px 16px;border-top:1px solid var(--line-soft);color:var(--muted);font-size:12.5px}
@container (max-width:560px){.${p}g3{grid-template-columns:1fr;gap:8px}.${p}h1{font-size:25px}.${p}hr{padding:20px 14px 8px}.${p}op{display:none}.${p}sub{margin-bottom:12px}.${p}sh{padding-top:18px}}
`;
const pgNav = (p, on) => `<div class="${p}nv"><span class="${p}lg"><i></i>Demo Shop</span><span class="${p}nl${on === 'pricing' ? ' on' : ''}" data-t="pricing" data-n="Pricing link">Pricing</span><span class="${p}nl${on === 'blog' ? ' on' : ''}" data-t="blog" data-n="Blog link">Blog</span><span class="${p}nl ${p}op" data-t="signin" data-n="Sign in link">Sign in</span></div>`;
const pgHead = (p, ey, h, sub, extra = '') => `<section class="${p}hr" data-s="Overview">${ey ? `<div class="${p}ey">${ey}</div>` : ''}<div class="${p}h1" data-t="h1" data-n="Heading">${h}</div><p class="${p}sub">${sub}</p>${extra}</section>`;
const pgCards = (p, items) => `<div class="${p}g3">${items.map(([a, b, k, em]) => `<div class="${p}cd" data-t="${k}" data-n="${a} card"><b>${a}</b>${em ? `<em>${em}</em>` : ''}<span>${b}</span></div>`).join('')}</div>`;
const pgFoot = p => `<div class="${p}ft"><span data-t="terms" data-n="Terms link">Terms</span><span data-t="privacy" data-n="Privacy link">Privacy</span><span>© 2026 Demo Shop</span></div>`;
const FEAT = [['Pins', 'Comment on any element and it keeps its place.', 'pins'], ['Screens', 'Compare a page before and after a change.', 'screens'], ['Evidence', 'Every finding keeps its screenshot.', 'evidence']];
const STEPS = [['Open the link', 'Share one release link with your team.', 'step1'], ['The agent browses', 'It reads each page and leaves findings.', 'step2'], ['You approve', 'Resolve findings, then ship.', 'step3']];
const PLANS = [['Starter', '1 site, 3 reviewers', 'plan1', '$9<small> /month</small>'], ['Team', '10 sites, unlimited reviewers', 'plan2', '$29<small> /month</small>'], ['Studio', 'Unlimited sites, agent reviews', 'plan3', '$79<small> /month</small>']];
const FAQ = [['Can I cancel any time?', 'Yes. Cancel in one click, keep your files.'], ['Do agents count as seats?', 'No. Agents review without taking a seat.'], ['Where do screenshots live?', 'In your project, next to each finding.']];
const POSTS = [['Each change gets a review link', 'Oct 1'], ['Pins keep their place after a redraw', 'Sep 24'], ['Reading a screen the way an agent does', 'Sep 17']];
const pgPosts = p => POSTS.map(([a, d], i) => `<div class="${p}ps" data-t="post${i}" data-n="Post link"><b>${a}</b><span>${d}</span></div>`).join('');
const PAGE = {
  home:p => pgNav(p, '') + `<div class="${p}ct">` + pgHead(p, 'Review links for every change', 'Demo shop, built for review', 'Every change gets a link your team can open, comment on, and approve.', `<div class="${p}cta"><span class="${p}b1" data-t="start" data-n="Get started button">Get started</span><span class="${p}b2" data-t="seepricing" data-n="See pricing button">See pricing</span></div>`) + pgCards(p, FEAT) + `</div>` + pgFoot(p),
  pricing:p => pgNav(p, 'pricing') + `<div class="${p}ct">` + pgHead(p, '', 'Simple pricing', 'Nine dollars a month, cancel any time.') + pgCards(p, PLANS) + FAQ.slice(0, 2).map(([a, b]) => `<div class="${p}fq"><b>${a}</b><span>${b}</span></div>`).join('') + `</div>` + pgFoot(p),
  blog:p => pgNav(p, 'blog') + `<div class="${p}ct">` + pgHead(p, '', 'Notes', 'We ship small changes every week.') + pgPosts(p) + `</div>` + pgFoot(p),
  signup:p => pgNav(p, '') + `<div class="${p}ct">` + pgHead(p, '', 'Start your review', 'Create a workspace and invite your team.', `<div style="display:grid;gap:8px;max-width:300px"><div style="border:1.5px solid var(--muted);border-radius:9px;padding:9px 11px;color:var(--muted)">Work email</div><div class="${p}b1" style="text-align:center" data-t="create" data-n="Create workspace button">Create workspace</div></div>`) + `</div>` + pgFoot(p) };
const ROUTE = { home:'/', pricing:'/pricing', blog:'/blog', signup:'/signup' };
const TITLE = { home:'Home', pricing:'Pricing', blog:'Blog', signup:'Sign up' };
// one tall page: overview, how it works, pricing, questions, notes
const pgLong = p => pgNav(p, '') + `<div class="${p}ct">` + pgHead(p, 'Review links for every change', 'Demo shop, built for review', 'Every change gets a link your team can open, comment on, and approve.', `<div class="${p}cta"><span class="${p}b1">Get started</span><span class="${p}b2">See pricing</span></div>`) + pgCards(p, FEAT)
  + `<section data-s="How reviews work" style="min-height:230px"><div class="${p}sh">How reviews work</div><div class="${p}ss">Three steps from a local build to an approved release.</div>${pgCards(p, STEPS)}</section>`
  + `<section data-s="Pricing" style="min-height:250px"><div class="${p}sh">Simple pricing</div><div class="${p}ss">Nine dollars a month, cancel any time.</div>${pgCards(p, PLANS)}</section>`
  + `<section data-s="Questions" style="min-height:220px"><div class="${p}sh">Questions</div><div class="${p}ss">Short answers to the ones we hear most.</div>${FAQ.map(([a, b]) => `<div class="${p}fq"><b>${a}</b><span>${b}</span></div>`).join('')}</section>`
  + `<section data-s="Notes" style="min-height:240px"><div class="${p}sh">Notes</div><div class="${p}ss">We ship small changes every week.</div>${pgPosts(p)}</section></div>` + `<div data-s="Footer" style="margin-top:auto">${pgFoot(p)}</div>`;
// quiet press feedback on a faux page element
const pressEl = (el, p) => { el.style.transform = p > .002 ? `scale(${(1 - .035*p).toFixed(4)})` : ''; el.style.opacity = p > .002 ? (1 - .18*p).toFixed(3) : ''; };
const AG = 'Review agent';

/* ================================================================ 1. Agent cursor */
const AC_ORD = ['pricing', 'start', 'pins', 'seepricing', 'privacy'];
const AC_FIND = { pricing:'Current page is not marked with aria-current.', start:'Button has no visible focus ring.', pins:'Card text is 12.5px, smaller than body text.', seepricing:'Two buttons sit 8px apart; target gap is tight.', privacy:'Footer links are 12.5px with a 14px gap.' };
atom({ id:'agentcursor', cat:'Agent activity', name:'Agent cursor', block:'Review agent browser · live agent view (cursor, Browse / Comment)', fam:['M','E','T'], wide:true, tall:true,
  html:`<style>${pgCss('agc-')}
.agc-root{position:absolute;inset:0;padding:12px;display:flex;flex-direction:column;gap:8px;container-type:inline-size}
.agc-bar{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.agc-hn{flex:1;min-width:0;text-align:right;font-size:12.5px;color:var(--muted)}
@container (max-width:640px){.agc-hn{display:none}}
.agc-win{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.agc-chrome{flex:none;display:flex;align-items:center;gap:8px;height:38px;padding:0 10px;border-bottom:1px solid var(--line-soft);font-size:12.5px;color:var(--muted)}
.agc-url{flex:1;min-width:0;background:var(--raised);border-radius:8px;height:26px;display:flex;align-items:center;gap:6px;padding:0 10px;white-space:nowrap}
.agc-view{position:relative;flex:1;min-height:0;cursor:none;overflow:hidden}
.agc-ov{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.agc-foot{flex:none;display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--muted);min-height:20px;padding:0 2px}
</style>
<div class="agc-root">
  <div class="agc-bar"><div class="seg agc-seg" role="group" aria-label="Agent mode"><div class="ind"></div><button type="button">Browse</button><button type="button">Comment</button></div><button type="button" class="btn agc-pause" aria-pressed="false">Pause</button><button type="button" class="btn agc-reset">Reset</button><span class="agc-hn">Click the page to send the agent there</span></div>
  <div class="card agc-win" role="group" aria-label="Demo Shop home page, with a review agent and your pointer">
    <div class="agc-chrome"><span class="agc-url">${ic(G.lock, 12, 2)}<span>demo-shop.local/</span></span></div>
    <div class="agc-view"><div class="agc-pg" aria-hidden="true">${PAGE.home('agc-')}</div><div class="agc-ov"></div></div>
  </div>
  <div class="agc-foot"><span class="agc-st" style="position:relative;flex:1;min-width:0;height:18px"></span><span class="num" style="white-space:nowrap;display:inline-flex;align-items:center;gap:5px"><span class="agc-d" style="line-height:1.25"></span><span>of 200 actions</span></span></div>
  <div class="agc-live" role="status" aria-live="polite" style="${SR}"></div>
</div>`,
  desc:'The agent pointer glides to each target on a critically damped spring, an outline appears when it lands, and a quiet press-scale marks the click. In Browse mode the target presses; in Comment mode the click is blocked and a square agent pin drops instead, as in the review tool. Your own pointer is the round chip, 1:1 while you move it. Click the page to send the agent there.',
  api:'agent.x/y.set(target)  w:11   land → outline.set(1)   press.set(1) → set(0) after 90ms   comment: pin.o.set(1)   you: jump(pointer)',
  init(st){
    const q = gQ(), q2 = gQ(), view = $(st, '.agc-view'), pg = $(st, '.agc-pg'), ov = $(st, '.agc-ov'), live = $(st, '.agc-live');
    const els = {}; $$(pg, '[data-t]').forEach(e => { if (!els[e.dataset.t]) els[e.dataset.t] = e; });
    const ag = gCur('agent', AG), me = gCur('human', 'You');
    const ho = gEl('div', 'position:absolute;left:0;top:0;border:2px solid var(--accent);border-radius:10px;opacity:0;pointer-events:none;z-index:20');
    ov.append(ho, me.el, ag.el);
    const D = { w:11 }, ax = new Track(0, D), ay = new Track(0, D), pr = new Track(0, S.snap), hov = new Track(0, S.snap);
    const mx = new Track(0, { w:6 }), my = new Track(0, { w:6 }), hp = new Track(0, S.snap), tp = {};
    const seg = gSeg($(st, '.agc-seg'), i => { mode = i; say(i ? 'Comment mode. Agent clicks leave pins instead of activating the page.' : 'Browse mode. Agent clicks activate the page.'); }), pauseB = $(st, '.agc-pause'), resetB = $(st, '.agc-reset');
    const stT = gFit($(st, '.agc-st'), 'line-height:18px'), dg = new Digits($(st, '.agc-d'), 3);
    let W = 0, H = 0, rects = {}, mode = 0, paused = false, idx = 0, acts = 0, curKey = null, ptr = false, px_ = 0, py_ = 0, lastLay = -9, pins = [];
    const lab = k => els[k].dataset.n;
    const say = s => { live.textContent = s; };
    const status = (s, inst) => { stT.put(s, inst); };
    const layout = () => {
      W = view.clientWidth; H = view.clientHeight; const vr = view.getBoundingClientRect();
      for (const k in els){ const r = els[k].getBoundingClientRect(); rects[k] = { x:r.left - vr.left, y:r.top - vr.top, w:r.width, h:r.height }; }
    };
    const pointOf = k => { const r = rects[k]; return { x:r.x + Math.min(r.w*.5, 70), y:r.y + r.h*.5 + 2 }; };
    const rest = i => [[.2, .8], [.66, .78], [.42, .6]][i % 3];
    const wander = (i = 0) => { if (!ptr){ const r = rest(i); mx.set(W*r[0]); my.set(H*r[1]); } q2.at(now() + 3.2, () => wander(i + 1)); };
    const dropPin = k => {
      const el = gEl('div', 'position:absolute;left:0;top:0;width:22px;height:22px;border-radius:7px;background:var(--accent);color:var(--card);display:grid;place-items:center;font-size:11.5px;font-weight:600;z-index:30;opacity:0;pointer-events:none');
      el.textContent = pins.length + 1; ov.appendChild(el); const p = { el, k, o:new Track(0, S.base) }; p.o.set(1); pins.push(p);
    };
    const arrive = k => {
      curKey = k; hov.set(1); status('Hovering ' + lab(k)); say('Hovering ' + lab(k));
      q.at(now() + .55, () => click(k));
    };
    const click = k => {
      pr.set(1); q.at(now() + .1, () => pr.set(0, S.base)); acts++; dg.set(String(acts));
      if (mode === 0){ (tp[k] = tp[k] || new Track(0, S.snap)).set(1); q.at(now() + .16, () => tp[k].set(0, S.base)); status('Clicked ' + lab(k)); say('Clicked ' + lab(k)); }
      else { dropPin(k); status('Pinned ' + lab(k) + ': ' + AC_FIND[k] || ''); say('Pinned ' + lab(k) + '. ' + (AC_FIND[k] || '')); }
      q.at(now() + .95, step);
    };
    const go = k => {
      curKey = null; hov.set(0); const a = pointOf(k), d = .62 + Math.hypot(a.x - ax.target, a.y - ay.target)/1300;
      ax.set(a.x); ay.set(a.y); status('Moving to ' + lab(k)); q.at(now() + d, () => arrive(k));
    };
    const step = () => { go(AC_ORD[idx % AC_ORD.length]); idx++; };
    const reset = () => {
      q.clear(); pins.forEach(p => { p.o.set(0, S.snap); const q_ = p; q.at(now() + .4, () => q_.el.remove()); }); pins = []; acts = 0; dg.set('0'); idx = 0; curKey = null; hov.set(0);
      const a = { x:W*.55, y:H*.34 }; ax.set(a.x); ay.set(a.y); status('Starting a review of demo-shop.local'); q.at(now() + .9, step);
    };
    pauseB.onclick = () => { paused = !paused; pauseB.setAttribute('aria-pressed', paused); pauseB.textContent = paused ? 'Resume' : 'Pause'; q.hold(paused); status(paused ? 'Paused. The agent holds its place.' : 'Resumed'); say(paused ? 'Agent paused' : 'Agent resumed'); };
    resetB.onclick = reset;
    view.addEventListener('pointermove', e => { const r = view.getBoundingClientRect(); ptr = true; px_ = e.clientX - r.left; py_ = e.clientY - r.top; });
    view.addEventListener('pointerleave', () => { if (ptr){ ptr = false; mx.jump(px_); my.jump(py_); q2.at(now() + .5, () => wander(0)); } });
    view.addEventListener('pointerdown', () => hp.set(1)); addEventListener('pointerup', () => hp.set(0, S.base));
    view.addEventListener('click', e => { const el = e.target.closest('[data-t]'); if (!el || paused || !els[el.dataset.t]) return; q.clear(); go(el.dataset.t); });
    layout(); { const a = { x:W*.55, y:H*.34 }; ax.jump(a.x); ay.jump(a.y); const r = rest(0); mx.jump(W*r[0]); my.jump(H*r[1]); }
    status('Starting a review of demo-shop.local', true); q.at(now() + .6, step); q2.at(now() + 3.2, () => wander(1));
    return t => {
      q.run(t); q2.run(t);
      const anyP = Object.values(tp).some(v => v.at(t) > .01);
      if (view.clientWidth !== W || view.clientHeight !== H || (!anyP && t - lastLay > .5)){ const ow = W, oh = H; lastLay = t; layout(); if (ow !== W || oh !== H){ if (curKey){ const a = pointOf(curKey); ax.jump(a.x); ay.jump(a.y); } else { ax.jump(clamp(ax.target, 0, W)); ay.jump(clamp(ay.target, 0, H)); } mx.jump(clamp(mx.target, 0, W)); my.jump(clamp(my.target, 0, H)); } }
      seg.render(t); stT.render(t); dg.render(t);
      if (curKey && rects[curKey]){ const r = rects[curKey]; Object.assign(ho.style, { left:px(r.x - 4), top:px(r.y - 4), width:px(r.w + 8), height:px(r.h + 8) }); }
      ho.style.opacity = clamp(hov.at(t)).toFixed(3);
      for (const k in tp) pressEl(els[k], clamp(tp[k].at(t)));
      for (const p of pins){ const r = rects[p.k]; if (!r) continue; const o = clamp(p.o.at(t)); p.el.style.left = px(r.x + r.w - 11); p.el.style.top = px(r.y - 11 - (1 - o)*10); p.el.style.opacity = o.toFixed(3); }
      ag.draw(ax.at(t), ay.at(t), W, H, clamp(pr.at(t)));
      me.draw(ptr ? px_ : mx.at(t), ptr ? py_ : my.at(t), W, H, clamp(hp.at(t)));
    };
  }});

/* ================================================================ 2. Agent navigation */
const AN_SCRIPT = [['go', 'pricing'], ['go', 'signup'], ['back'], ['go', 'blog'], ['go', 'home'], ['back'], ['fwd']];
atom({ id:'agentnav', cat:'Agent activity', name:'Agent navigation', block:'Review agent browser · navigate action, history, navigation revision', fam:['S','E','M','T'], wide:true, tall:true,
  html:`<style>${pgCss('agn-')}
.agn-root{position:absolute;inset:0;padding:12px;container-type:inline-size}
.agn-win{height:100%;display:flex;flex-direction:column;overflow:hidden}
.agn-chrome{flex:none;display:flex;align-items:center;gap:6px;height:46px;padding:0 10px;border-bottom:1px solid var(--line-soft)}
.agn-nb{flex:none;width:30px;height:30px;border-radius:8px;border:1.5px solid var(--muted);background:var(--card);display:grid;place-items:center;padding:0;cursor:pointer;color:var(--ink)}
.agn-url{flex:1;min-width:0;display:flex;align-items:center;gap:6px;height:30px;background:var(--raised);border-radius:8px;padding:0 10px;font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden}
.agn-host{flex:none}
.agn-path{position:relative;flex:1;height:18px;color:var(--ink);font-weight:500}
.agn-who{display:grid;flex:none;height:26px}
.agn-who>span{grid-area:1/1;justify-self:end;display:flex;align-items:center;gap:5px;height:26px;font-size:12px;font-weight:600;color:var(--card);white-space:nowrap}
.agn-wa{border-radius:7px;padding:0 9px 0 7px;background:var(--accent)}
.agn-wy{border-radius:13px;padding:0 11px;background:var(--ink)}
.agn-trail{flex:none;display:flex;align-items:center;gap:8px;height:40px;padding:0 10px 0 14px;border-bottom:1px solid var(--line-soft);font-size:12px;color:var(--muted)}
.agn-tv{position:relative;flex:1;min-width:0;height:28px;overflow:hidden}
.agn-ti{position:absolute;left:0;top:0;display:flex;align-items:center;height:28px;white-space:nowrap}
.agn-cp{display:flex;align-items:center;flex:none;height:28px;overflow:hidden}
.agn-ci{display:flex;align-items:center;gap:4px;flex:none;padding-left:4px}
.agn-ch{height:24px;border-radius:12px;padding:0 10px;font-size:12.5px;font-weight:500;cursor:pointer;border:1px dashed transparent;white-space:nowrap}
.agn-cv{color:var(--muted);display:grid;place-items:center}
.agn-view{position:relative;flex:1;min-height:0;overflow:hidden}
.agn-ld{position:absolute;left:0;top:0;right:0;height:2px;background:var(--accent);transform-origin:0 50%;z-index:5;opacity:0}
.agn-log{flex:none;display:flex;align-items:center;gap:10px;height:42px;padding:0 10px 0 14px;border-top:1px solid var(--line-soft);font:12px var(--mono);color:var(--muted)}
@container (max-width:520px){.agn-host{display:none}.agn-an{display:none}.agn-wa{padding:0 6px}.agn-tl{display:none}.agn-trail{padding-left:10px}}
</style>
<div class="agn-root"><div class="card agn-win" role="group" aria-label="Review agent browser history for demo-shop.local">
  <div class="agn-chrome"><button type="button" class="agn-nb agn-bk" aria-label="Back">${ic(G.back, 16)}</button><button type="button" class="agn-nb agn-fw" aria-label="Forward">${ic(G.fwd, 16)}</button>
    <div class="agn-url">${ic(G.lock, 12, 2)}<span class="agn-host">demo-shop.local</span><span class="agn-path"></span></div>
    <div class="agn-who" title="Who navigated last"><span class="agn-wa">${starSvg(12)}<span class="agn-an">${AG}</span></span><span class="agn-wy">You</span></div></div>
  <div class="agn-trail"><span class="agn-tl">Visited</span><div class="agn-tv"><div class="agn-ti" role="list" aria-label="Pages visited"></div></div></div>
  <div class="agn-view"><i class="agn-ld"></i>${Object.keys(PAGE).map(k => `<div class="agn-pg" data-r="${k}" aria-hidden="true">${PAGE[k]('agn-')}</div>`).join('')}</div>
  <div class="agn-log"><span class="agn-lt" style="position:relative;flex:1;min-width:0;height:18px"></span><button type="button" class="btn agn-rep" style="font:500 13px var(--sans)">Replay</button></div>
  <div class="agn-live" role="status" aria-live="polite" style="${SR}"></div></div></div>`,
  desc:'When a page is requested, a thin load bar runs, the old page slides out toward where you came from and the new one slides in from the other side. Back reverses the direction. The URL path swaps with it, a chip joins the visited trail (leading edge first), and navigating after going back drops the forward pages. The badge says who drove it: the agent, or you with Back, Forward or a chip.',
  api:'sw.to(route, dir)   path.put(url, dir)   chip.e.set(1) → trail.off.set(end)   truncate: forward chips e.set(0)   ld: 0 → .75 → 1',
  init(st){
    const q = gQ(), layers = $$(st, '.agn-pg'), L = {}; layers.forEach(l => L[l.dataset.r] = l);
    const bk = $(st, '.agn-bk'), fw = $(st, '.agn-fw'), pathH = $(st, '.agn-path'), ti = $(st, '.agn-ti'), tv = $(st, '.agn-tv'), ld = $(st, '.agn-ld'), live = $(st, '.agn-live');
    const whoEl = [$(st, '.agn-wa'), $(st, '.agn-wy')], whoSw = new Swap(0);
    const pl = [gEl('span', 'position:absolute;left:0;top:0;white-space:nowrap'), gEl('span', 'position:absolute;left:0;top:0;white-space:nowrap')]; pl.forEach(e => pathH.appendChild(e));
    const psw = new DSw(0); let pk = 0; const swapPath = (txt, dir, inst) => { pk ^= 1; pl[pk].textContent = txt; if (inst){ psw.cur = pk; psw.prev = null; psw.t = -9; } else psw.to(pk, dir); };
    const logT = gFit($(st, '.agn-lt'), 'line-height:18px'); $(st, '.agn-lt').style.overflow = 'hidden', rep = $(st, '.agn-rep');
    const sw = new DSw('home'), lp = new Track(0, { w:5 }), lo = new Track(0, S.base), sx = new Track(0), bkT = new Track(0), fwT = new Track(0);
    let hist = [], all = [], idx = 0, rev = 0, hold = -9, si = 0;
    const say = s => { live.textContent = s; };
    const mkEntry = (route, inst) => {
      const el = gEl('span', ''); el.className = 'agn-cp'; el.setAttribute('role', 'listitem');
      const first = hist.length === 0;
      el.innerHTML = `<span class="agn-ci">${first ? '' : `<span class="agn-cv">${ic(G.fwd, 12, 2)}</span>`}<button type="button" class="agn-ch">${TITLE[route]}</button></span>`;
      ti.appendChild(el); const h = { route, el, ci:$(el, '.agn-ci'), btn:$(el, '.agn-ch'), e:new Track(0), on:new Track(0, S.snap), fut:new Track(0, S.snap) };
      h.nat = h.ci.offsetWidth || 90; inst ? h.e.jump(1) : h.e.set(1);
      h.btn.onclick = () => { hold = now() + 4; move(hist.indexOf(h), 'you'); };
      all.push(h); return h;
    };
    const sync = () => {
      hist.forEach((h, i) => { h.on.set(i === idx ? 1 : 0); h.fut.set(i > idx ? 1 : 0); h.btn.setAttribute('aria-current', i === idx ? 'page' : 'false'); h.btn.setAttribute('aria-label', TITLE[h.route] + (i === idx ? ', current page' : i > idx ? ', forward page' : '')); });
      bkT.set(idx > 0 ? 1 : 0); fwT.set(idx < hist.length - 1 ? 1 : 0); bk.disabled = idx <= 0; fw.disabled = idx >= hist.length - 1;
      let end = 0; for (let i = 0; i <= idx; i++) end += hist[i].nat; sx.set(Math.max(0, end - tv.clientWidth + 8));
    };
    const show = (route, dir, who, inst) => {
      sw.to(route, dir); swapPath(ROUTE[route], dir, inst); whoSw.to(who === 'agent' ? 0 : 1);
      rev++; logT.put((who === 'agent' ? 'navigate ' : 'history ') + ROUTE[route] + ' · rev ' + rev, inst);
      if (!inst){ lp.jump(0); lo.jump(1); lp.set(.75); q.at(now() + .32, () => lp.set(1, S.snap)); q.at(now() + .5, () => lo.set(0, S.base)); }
      say((who === 'agent' ? AG + ' opened ' : 'You opened ') + TITLE[route]);
    };
    const move = (to, who) => { if (to === idx || to < 0 || to >= hist.length) return; const dir = to > idx ? 1 : -1; idx = to; show(hist[idx].route, dir, who); sync(); };
    const nav = (route, who, inst) => {
      while (hist.length - 1 > idx){ const h = hist.pop(); h.e.set(0, S.base); q.at(now() + .6, () => { h.el.remove(); all.splice(all.indexOf(h), 1); }); }
      hist.push(mkEntry(route, inst)); idx = hist.length - 1; show(route, 1, who, inst); sync(); if (inst){ hist.forEach(h => { h.on.jump(h === hist[idx] ? 1 : 0); }); sx.jump(sx.target); }
    };
    const restart = () => {
      q.clear(); hist.slice().forEach(h => { h.e.set(0, S.base); q.at(now() + .6, () => { h.el.remove(); all.splice(all.indexOf(h), 1); }); }); hist = []; rev = 0;
      hist.push(mkEntry('home', false)); idx = 0; show('home', -1, 'agent'); sync(); si = 0; q.at(now() + 1.8, step);
    };
    const step = () => {
      if (now() < hold){ q.at(hold + .3, step); return; }
      const s = AN_SCRIPT[si++];
      if (s[0] === 'go') nav(s[1], 'agent'); else if (s[0] === 'back') move(idx - 1, 'agent'); else move(idx + 1, 'agent');
      q.at(now() + 2.1, si < AN_SCRIPT.length ? step : () => q.at(now() + 1.6, restart));
    };
    bk.onclick = () => { hold = now() + 4; move(idx - 1, 'you'); }; fw.onclick = () => { hold = now() + 4; move(idx + 1, 'you'); };
    rep.onclick = () => restart();
    mkEntry('home', true); hist.push(all[0]); idx = 0; hist[0].on.jump(1); sw.cur = 'home'; psw.cur = pk; pl[pk].textContent = '/'; swapPath('/', 1, true); show('home', 1, 'agent', true); rev = 1; logT.put('navigate / · rev 1', true); sync(); sx.jump(0);
    q.at(now() + 1.6, step);
    return t => {
      q.run(t);
      for (const k in L) sw.apply(L[k], k, t, 22);
      pl.forEach((e, i) => psw.apply(e, i, t, 10)); whoEl.forEach((e, i) => whoSw.apply(e, i, t, 3));
      ld.style.transform = `scaleX(${clamp(lp.at(t)).toFixed(3)})`; ld.style.opacity = clamp(lo.at(t)).toFixed(3);
      logT.render(t);
      bk.style.opacity = (.35 + .65*clamp(bkT.at(t))).toFixed(3); fw.style.opacity = (.35 + .65*clamp(fwT.at(t))).toFixed(3);
      for (const h of all){
        const e = clamp(h.e.at(t)), on = clamp(h.on.at(t)), fu = clamp(h.fut.at(t));
        h.el.style.width = px(e*(h.nat + 0)); h.el.style.opacity = e.toFixed(3);
        h.btn.style.background = mix(on, 'var(--ink)', mix(fu, 'transparent', 'var(--raised)'));
        h.btn.style.color = mix(on, 'var(--card)', mix(fu, 'var(--faint)', 'var(--ink)'));
        h.btn.style.borderColor = mix(fu*(1 - on), 'var(--faint)', 'transparent');
      }
      ti.style.transform = `translateX(${px(-sx.at(t))})`;
    };
  }});

/* ================================================================ 3. Follow mode */
atom({ id:'followmode', cat:'Agent activity', name:'Follow the agent', block:'Review workspace · Agents view (Follow screen, My view)', fam:['M','E','X','T'], wide:true, tall:true,
  html:`<style>${pgCss('agf-')}
.agf-root{position:absolute;inset:0;padding:12px;display:flex;flex-direction:column;gap:8px;container-type:inline-size}
.agf-bar{flex:none;display:flex;align-items:center;gap:12px;min-height:30px}
.agf-st{position:relative;flex:1;min-width:0;height:20px;overflow:hidden;font-size:13px;font-weight:500}
.agf-sw{flex:none;display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;cursor:pointer;background:none;border:0;padding:0;color:var(--ink)}
.agf-win{flex:1;min-height:0;position:relative;overflow:hidden;border:1.5px solid var(--line)}
.agf-sc{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-width:thin}
.agf-sc .agf-pg{position:relative;inset:auto;min-height:100%;overflow:visible}
.agf-ov{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.agf-rw{position:absolute;left:0;right:0;bottom:14px;display:flex;justify-content:center;pointer-events:none;z-index:30}
.agf-rs{display:flex;align-items:center;gap:8px;height:38px;padding:0 16px 0 12px;border-radius:19px;border:0;background:var(--ink);color:var(--card);font-size:13px;font-weight:600;cursor:pointer;box-shadow:var(--shadow);white-space:nowrap;max-width:calc(100% - 24px)}
.agf-ar{position:relative;width:16px;height:16px;flex:none}
.agf-ar>span{position:absolute;inset:0;display:grid;place-items:center}
.agf-rsub{position:relative;height:18px;font-weight:400;opacity:.78;overflow:hidden}
@container (max-width:520px){.agf-rsub{display:none}}
</style>
<div class="agf-root">
  <div class="agf-bar"><span class="agf-st" aria-hidden="true"></span><span class="agf-sw"><span class="agf-swh"></span><span class="agf-swl">Follow agent</span></span></div>
  <div class="card agf-win"><div class="agf-sc" tabindex="0" role="region" aria-label="Demo Shop page, scrollable"><div class="agf-pg">${pgLong('agf-')}</div></div>
    <div class="agf-ov"><div class="agf-rw"><button type="button" class="agf-rs" aria-label="Resume following Review agent"><span class="agf-ar"></span><span>Resume following</span><span class="agf-rsub"></span></button></div></div></div>
  <div class="agf-live" role="status" aria-live="polite" style="${SR}"></div>
</div>`,
  desc:'With Follow on, your viewport is a second, softer spring chasing the agent’s scroll, so it trails by a beat and never jerks. The moment you scroll yourself (wheel, touch, keys or scrollbar) follow breaks: the toggle turns off, the frame loses its accent edge and a Resume chip springs in, pointing up or down toward the agent. Resume glides from where you are to where the agent is.',
  api:'agent.scroll.set(stop)  w:6   view.scroll = follow ? F.set(stop) w:4.6 : native   userScroll → follow=false, chip.set(1)   resume → F.jump(you); F.set(agent)',
  init(st){
    const q = gQ(), sc = $(st, '.agf-sc'), pg = $(st, '.agf-pg'), ov = $(st, '.agf-ov'), win = $(st, '.agf-win'), rs = $(st, '.agf-rs'), live = $(st, '.agf-live');
    const swBtn = $(st, '.agf-sw'), stT = gFit($(st, '.agf-st'), 'line-height:20px'), subT = gFit($(st, '.agf-rsub'), 'line-height:18px');
    const sw = gSwitch('Follow agent', true, v => setFollow(v)); $(st, '.agf-swh').appendChild(sw.el); $(st, '.agf-swl').onclick = () => setFollow(!sw.on);
    const arH = $(st, '.agf-ar'), arL = [G.eye, G.up, G.down].map((d, i) => { const s = gEl('span', ''); s.innerHTML = i ? ic(d, 16, 2.2) : starSvg(15); arH.appendChild(s); return s; }), arS = new Swap(0);
    const ag = gCur('agent', AG); ov.appendChild(ag.el);
    const A = new Track(0, { w:6 }), F = new Track(0, { w:4.6 }), cx = new Track(0, { w:9 }), cy = new Track(0, { w:9 }), pr = new Track(0, S.snap), rp = new Track(0, S.base), fo = new Track(1, S.base);
    let follow = true, stops = [], si = 0, W = 0, H = 0, lastSet = 0, grace = 0, sec = 'Overview', narrow = null, arK = 0;
    const say = s => { live.textContent = s; };
    const label = () => { const w = st.clientWidth >= 520; return follow ? (w ? `Following ${AG} · ${sec}` : 'Following the agent') : (w ? `Your view · ${AG} is on ${sec}` : 'Your view'); };
    const refresh = inst => { stT.put(label(), inst); subT.put(`${AG} is on ${sec}`, inst); };
    const layout = () => {
      W = sc.clientWidth; H = sc.clientHeight; const pr_ = pg.getBoundingClientRect(), top0 = pr_.top, left0 = pr_.left, max = Math.max(0, sc.scrollHeight - H);
      stops = $$(pg, '[data-s]').map(s => { const h = $(s, '.agf-sh,.agf-h1') || $(s, 'span') || s, r = h.getBoundingClientRect(), sr = s.getBoundingClientRect();
        return { name:s.dataset.s, y:clamp(sr.top - top0 - (s.dataset.s === 'Overview' ? 0 : 52), 0, max), cx:r.left - left0 + Math.min(70, r.width*.4), cy:r.top - top0 + r.height*.5 }; });
      if (!stops.length) return;
      const k = Math.max(0, si - 1), s = stops[k % stops.length]; if (narrow !== null){ A.jump(s.y); cx.jump(s.cx); cy.jump(s.cy); if (follow) F.jump(s.y); }
      grace = now() + .35;
    };
    const next = () => {
      const s = stops[si % stops.length]; si++; sec = s.name; A.set(s.y); cx.set(s.cx); cy.set(s.cy); if (follow) F.set(s.y);
      q.at(now() + .9, () => { pr.set(1); q.at(now() + .1, () => pr.set(0, S.base)); }); refresh(); q.at(now() + 3.1, next);
    };
    const setFollow = (v, quiet) => {
      if (v === follow) return; follow = v; sw.set(v); fo.set(v ? 1 : 0); rp.set(v ? 0 : 1);
      if (v){ F.jump(sc.scrollTop); F.set(A.target); } else F.jump(sc.scrollTop);
      refresh(); if (!quiet) say(v ? `Following ${AG}` : 'Follow stopped. Your view.');
    };
    const brk = () => { if (follow) setFollow(false); };
    sc.addEventListener('wheel', brk, { passive:true }); sc.addEventListener('touchmove', brk, { passive:true });
    sc.addEventListener('keydown', e => { if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) brk(); });
    sc.addEventListener('pointerdown', e => { if (e.target === sc && e.offsetX > sc.clientWidth) brk(); });
    sc.addEventListener('scroll', () => { if (follow && now() > grace && Math.abs(sc.scrollTop - lastSet) > 2.5) brk(); });
    rs.onclick = () => { setFollow(true); sc.focus({ preventScroll:true }); };
    layout(); narrow = st.clientWidth < 520; { const s = stops[0]; A.jump(s.y); F.jump(s.y); cx.jump(s.cx); cy.jump(s.cy); si = 1; sec = s.name; }
    rp.jump(0); sw.set(true, true); refresh(true); q.at(now() + 2.4, next);
    return t => {
      q.run(t);
      if (sc.clientWidth !== W || sc.clientHeight !== H){ layout(); }
      if (follow){ sc.scrollTop = F.at(t); lastSet = sc.scrollTop; }
      const top = sc.scrollTop, vy = cy.at(t) - top, o = clamp((vy + 14)/18)*clamp((H + 4 - vy)/18);
      ag.draw(cx.at(t), vy, W, H, clamp(pr.at(t)), o);
      const dk = vy < 4 ? 1 : vy > H - 4 ? 2 : 0; if (dk !== arK){ arK = dk; arS.to(dk); }
      arL.forEach((e, i) => arS.apply(e, i, t, 3));
      const p = clamp(rp.at(t)); pop(rs, p, 14); rs.tabIndex = p > .5 ? 0 : -1;
      win.style.borderColor = mix(clamp(fo.at(t)), 'var(--accent)', 'var(--line)');
      sw.render(t); stT.render(t); subT.render(t);
      const nw = st.clientWidth < 520; if (nw !== narrow){ narrow = nw; refresh(true); }
    };
  }});

/* ================================================================ 4. Agent inspect */
const AI_EL = [
  { k:'img', role:'img', name:'Dashboard preview', sel:'main figure.preview img', rad:12, checks:[['f', 'Alternative text', 'No alt attribute'], ['w', 'Decorative?', 'Add alt="" if it carries no meaning'], ['p', 'Intrinsic size', 'Larger than its display size']] },
  { k:'h1', role:'heading 1', name:'Start your review', sel:'main h1', rad:4, checks:[['p', 'Accessible name', 'Start your review'], ['p', 'Text contrast', 'Passes the 4.5:1 minimum'], ['p', 'Heading order', 'Only h1 on the page'], ['p', 'Text size', '26px, scales with zoom']] },
  { k:'email', role:'textbox', name:'Work email', sel:'form input#email', rad:9, checks:[['p', 'Label', 'Visible label, linked by for/id'], ['p', 'Autocomplete', 'autocomplete="email"'], ['p', 'Target size', 'Meets the 24 × 24 px minimum'], ['p', 'Focus ring', '2px ring, visible']] },
  { k:'pw', role:'textbox', name:'Password', priv:true, sel:'form input[type=password]', rad:9, checks:[['w', 'Private region', 'Masked in screenshots and text'], ['p', 'Label', 'Visible label, linked by for/id'], ['p', 'Autocomplete', 'autocomplete="new-password"']] },
  { k:'btn', role:'button', name:'Create workspace', sel:'form button[type=submit]', rad:9, checks:[['p', 'Accessible name', 'Create workspace'], ['w', 'Text contrast', 'Below the 4.5:1 minimum'], ['f', 'Focus ring', 'No visible focus style'], ['p', 'Target size', 'Meets the 24 × 24 px minimum']] },
  { k:'lnk', role:'link', name:'Read more', sel:'form a.more', rad:3, checks:[['w', 'Link text', '“Read more” says little out of context'], ['p', 'Contrast', 'Passes the 4.5:1 minimum'], ['w', 'Target size', 'Under the 24 px minimum height']] } ];
const AI_IC = { p:['check', 'var(--success)'], w:['alert', 'var(--warning)'], f:['x', 'var(--danger)'] };
atom({ id:'agentinspect', cat:'Agent activity', name:'Agent inspect element', block:'Review agent browser · inspect_elements (selector, rect, accessibility)', fam:['E','S','M','T'], wide:true, tall:true,
  html:`<style>
.agi-root{position:absolute;inset:0;container-type:inline-size}
.agi-in{position:absolute;inset:0;padding:12px;display:flex;gap:12px}
.agi-main{flex:1;min-width:0;position:relative;overflow:hidden}
.agi-pg{position:absolute;inset:0;overflow:hidden;background:var(--card);padding:14px 16px;display:flex;flex-direction:column;align-items:center;container-type:inline-size;font-size:13.5px;line-height:1.45}
.agi-col{width:100%;max-width:440px;display:flex;flex-direction:column;gap:10px}
.agi-nv{display:flex;align-items:center;gap:7px;font-weight:600;font-size:14px;margin-bottom:2px}
.agi-nv i{width:16px;height:16px;border-radius:5px;background:var(--ink)}
.agi-fig{height:92px;border-radius:12px;background:var(--raised);overflow:hidden;position:relative}
.agi-h1{font-size:26px;line-height:1.1;font-weight:600;letter-spacing:-.03em;width:fit-content}
.agi-sb{color:var(--muted);margin-top:-4px}
.agi-fl{display:flex;flex-direction:column;gap:4px;font-size:12.5px;font-weight:500}
.agi-box{height:38px;border:1.5px solid var(--muted);border-radius:9px;padding:0 11px;display:flex;align-items:center;color:var(--muted);font-size:13.5px;font-weight:400}
.agi-rw{display:flex;align-items:center;gap:16px;margin-top:2px}
.agi-bt{height:38px;padding:0 16px;border-radius:9px;background:var(--faint);color:var(--card);font-weight:600;display:flex;align-items:center}
.agi-lk{font-size:13px;line-height:18px;text-decoration:underline;text-underline-offset:2px;color:var(--ink)}
.agi-pg [data-k]{cursor:pointer}
.agi-ov{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.agi-ol{position:absolute;left:0;top:0;border:2px solid var(--accent);background:color-mix(in oklab,var(--accent) 9%,transparent);opacity:0}
.agi-lb{position:absolute;left:0;top:0;display:flex;align-items:center;height:22px;padding:0 9px;color:var(--card);background:var(--ink);font-size:12px;font-weight:600;white-space:nowrap;z-index:5}
.agi-sz{position:absolute;left:0;top:0;height:20px;padding:0 6px;border-radius:5px;background:var(--raised);color:var(--muted);font:500 11px/20px var(--mono);white-space:nowrap;font-variant-numeric:tabular-nums;z-index:4}
.agi-mk{position:absolute;left:0;top:0;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:var(--card);box-shadow:var(--shadow);z-index:3}
.agi-pn{flex:none;width:300px;display:flex;flex-direction:column;overflow:hidden}
.agi-hd{flex:none;display:flex;align-items:center;gap:8px;min-height:44px;padding:0 12px 0 14px;border-bottom:1px solid var(--line-soft)}
.agi-by{display:grid;margin-left:auto}
.agi-by>span{grid-area:1/1;justify-self:end;display:flex;align-items:center;gap:5px;height:22px;font-size:12px;font-weight:600;color:var(--card);white-space:nowrap}
.agi-bs{border-radius:6px;padding:0 9px 0 7px;background:var(--accent)}
.agi-bu{border-radius:11px;padding:0 10px;background:var(--ink)}
.agi-dv{flex:none;display:flex;align-items:center;gap:8px;padding:8px 14px;font-size:12.5px;color:var(--muted);border-bottom:1px solid var(--line-soft)}
.agi-bd{flex:1;min-height:0;overflow:auto;display:grid;align-content:start;padding:0}
.agi-ly{grid-area:1/1;padding:10px 14px}
.agi-rl{font-size:11.5px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
.agi-nm{font-size:15px;font-weight:600;line-height:1.3;margin-top:1px;display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.agi-tg{font-size:11.5px;font-weight:600;border-radius:5px;padding:1px 6px;background:var(--warning-tint);color:var(--warning)}
.agi-sl{font:12px/1.5 var(--mono);color:var(--muted);margin:4px 0 8px;overflow-wrap:anywhere}
.agi-ck{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.agi-cr{display:grid;grid-template-columns:18px minmax(0,1fr);gap:0 8px;padding:6px 0;border-top:1px solid var(--line-soft);font-size:13px;line-height:1.4}
.agi-cr:first-child{border-top:0}
.agi-cr:last-child{border-bottom:0}
.agi-compact .agi-cr{padding:2px 0}
.agi-cr b{font-weight:600}
.agi-cr span{color:var(--muted);grid-column:2;font-size:12.5px}
.agi-ft{flex:none;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:9px 14px;border-top:1px solid var(--line-soft);font-size:12.5px;color:var(--muted)}
.agi-ct{display:inline-flex;align-items:center;gap:4px;font-variant-numeric:tabular-nums;color:var(--ink);font-weight:600;line-height:1.25}
.agi-ct .dslot{height:1.25em}
@container (max-width:640px){
  .agi-in{flex-direction:column}
  .agi-main{flex:1;min-height:236px}
  .agi-pn{width:auto;flex:none}
  .agi-hd{min-height:38px}
  .agi-sl{display:none}
  .agi-ly{padding:8px 14px}
  .agi-cr{padding:4px 0}
  .agi-pg{padding:10px 14px}
  .agi-sb,.agi-nv{display:none}
  .agi-fig{height:56px}
  .agi-col{gap:7px}
  .agi-h1{font-size:22px}
  .agi-box,.agi-bt{height:34px}
}
</style>
<div class="agi-root"><div class="agi-in">
  <div class="card agi-main"><div class="agi-pg" aria-label="Demo Shop sign-up page being inspected"><div class="agi-col">
    <div class="agi-nv"><i></i>Demo Shop</div>
    <div class="agi-fig" data-k="img" role="button" tabindex="0" aria-label="Inspect image, dashboard preview"><svg viewBox="0 0 400 92" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect x="28" y="52" width="38" height="40" rx="4" fill="var(--line)"/><rect x="78" y="34" width="38" height="58" rx="4" fill="var(--line)"/><rect x="128" y="44" width="38" height="48" rx="4" fill="var(--line)"/><rect x="178" y="18" width="38" height="74" rx="4" fill="var(--accent)"/><rect x="238" y="22" width="130" height="8" rx="4" fill="var(--faint)"/><rect x="238" y="40" width="96" height="8" rx="4" fill="var(--line)"/><rect x="238" y="58" width="112" height="8" rx="4" fill="var(--line)"/></svg></div>
    <div class="agi-h1" data-k="h1" role="button" tabindex="0" aria-label="Inspect heading, Start your review">Start your review</div>
    <div class="agi-sb">Create a workspace and invite your team.</div>
    <div class="agi-fl">Work email<div class="agi-box" data-k="email" role="button" tabindex="0" aria-label="Inspect text field, Work email">name@company.com</div></div>
    <div class="agi-fl">Password<div class="agi-box" data-k="pw" role="button" tabindex="0" aria-label="Inspect text field, Password">••••••••••</div></div>
    <div class="agi-rw"><div class="agi-bt" data-k="btn" role="button" tabindex="0" aria-label="Inspect button, Create workspace">Create workspace</div><div class="agi-lk" data-k="lnk" role="button" tabindex="0" aria-label="Inspect link, Read more">Read more</div></div>
  </div></div><div class="agi-ov"><div class="agi-ol"></div><div class="agi-sz"></div><div class="agi-lb"><span class="agi-lbs" style="display:grid;place-items:center;overflow:hidden;width:0;margin-right:0">${starSvg(11)}</span><span class="agi-lt" style="position:relative;display:block;height:20px;overflow:hidden"></span></div></div></div>
  <aside class="card agi-pn" aria-label="Inspector">
    <div class="agi-hd"><b style="font-size:14px">Inspector</b><div class="agi-by" title="Who selected this element"><span class="agi-bs">${starSvg(11)}<span>${AG}</span></span><span class="agi-bu">You</span></div></div>
    <div class="agi-dv"><span class="agi-sw"></span><span>Agent drives</span><span style="flex:1"></span><span class="num" style="display:inline-flex;align-items:center;gap:4px">Inspected <span class="agi-ct"><span class="agi-n1"></span></span> of <span class="agi-ct"><span class="agi-n2"></span></span></span></div>
    <div class="agi-bd"></div>
    <div class="agi-ft"><span class="agi-ct" style="color:var(--success)">${ic(I.check, 14, 2.4)}<span class="agi-c1"></span></span><span class="agi-ct" style="color:var(--warning)">${ic(I.alert, 14, 2.2)}<span class="agi-c2"></span></span><span class="agi-ct" style="color:var(--danger)">${ic(I.x, 14, 2.4)}<span class="agi-c3"></span></span><span class="row small muted" style="display:inline-flex;align-items:center;gap:6px;margin-left:auto">Density<button type="button" class="btn agi-den" style="height:24px;padding:0 8px" aria-pressed="false">Compact</button></span><span style="flex:1;min-width:0;text-align:right">for this element</span></div>
  </aside>
  <div class="agi-live" role="status" aria-live="polite" style="${SR}"></div>
</div></div>`,
  desc:'The outline snaps to the element’s box with its leading edge first and the trailing edge a beat behind, so the box visibly stretches between elements while the size readout counts to the new values. The label chip follows the top-left corner, then the inspector swaps and its accessibility checks arrive 45ms apart with the failing ones marked by shape (check, bang, cross). Inspected elements keep a result badge. Click any element, or switch Agent drives off, to take over.',
  api:'ol.x = edges(l, r).go()   ol.y = edges(t, b).go()   label.put(role · name)   rows[i]: prog(t, t0 + EXIT + i·0.045)   badge.set(1)',
  init(st){
    const q = gQ(), main = $(st, '.agi-main'), ov = $(st, '.agi-ov'), ol = $(st, '.agi-ol'), lb = $(st, '.agi-lb'), lbs = $(st, '.agi-lbs'), sz = $(st, '.agi-sz'), body = $(st, '.agi-bd'), live = $(st, '.agi-live');
    const els = {}; $$(st, '[data-k]').forEach(e => els[e.dataset.k] = e);
    const lt = gFit($(st, '.agi-lt'), 'line-height:20px'), byEl = [$(st, '.agi-bs'), $(st, '.agi-bu')], bySw = new Swap(0);
    const sw = gSwitch('Agent drives', true, v => setDrive(v, true)); $(st, '.agi-sw').appendChild(sw.el);
    const denB = $(st, '.agi-den');
    if (denB) denB.onclick = () => { const on = st.classList.toggle('agi-compact'); denB.textContent = on ? 'Cozy' : 'Compact'; denB.setAttribute('aria-pressed', on); };
    const n1 = new Digits($(st, '.agi-n1'), 1), n2 = new Digits($(st, '.agi-n2'), 1), c = [1, 2, 3].map(i => new Digits($(st, '.agi-c' + i), 1));
    n2.set(String(AI_EL.length), true);
    const ex = edges(0, 0), ey = edges(0, 0), vis = new Track(0, S.snap), rd = new Track(9), lr = new Track(6), ls = new Track(1), mkt = {};
    // inspector layers, one per element
    const L = AI_EL.map(d => {
      const w = gEl('div', ''); w.className = 'agi-ly';
      w.innerHTML = `<div class="agi-rl"></div><div class="agi-nm"><span class="agi-nt"></span>${d.priv ? '<span class="agi-tg">Private region</span>' : ''}</div><div class="agi-sl"></div><ul class="agi-ck">${d.checks.map(([s, a, b]) => `<li class="agi-cr"><span style="grid-column:1;grid-row:1;color:${AI_IC[s][1]};display:grid;place-items:center;height:20px">${ic(I[AI_IC[s][0]], 15, 2.4)}</span><b>${a}</b><span>${b}</span></li>`).join('')}</ul>`;
      $(w, '.agi-rl').textContent = d.role; $(w, '.agi-nt').textContent = d.name; $(w, '.agi-sl').textContent = d.sel; body.appendChild(w);
      const sev = d.checks.some(x => x[0] === 'f') ? 'f' : d.checks.some(x => x[0] === 'w') ? 'w' : 'p';
      return { d, el:w, rows:$$(w, '.agi-cr'), sw:null, sev, cnt:{ p:d.checks.filter(x => x[0] === 'p').length, w:d.checks.filter(x => x[0] === 'w').length, f:d.checks.filter(x => x[0] === 'f').length } };
    });
    const lsw = new Swap(-1);
    AI_EL.forEach((d, i) => {
      const m = gEl('div', ''); m.className = 'agi-mk'; m.style.color = AI_IC[L[i].sev][1]; m.innerHTML = ic(I[AI_IC[L[i].sev][0]], 12, 2.6); m.style.opacity = 0; ov.appendChild(m); mkt[d.k] = { el:m, o:new Track(0, S.base) };
    });
    let W = 0, H = 0, R = {}, idx = -1, by = 'agent', drive = true, tSel = -9, seen = new Set(), lastLay = -9, lastSz = '', pend = 0;
    const say = s => { live.textContent = s; };
    const layout = () => { W = ov.clientWidth; H = ov.clientHeight; const o = ov.getBoundingClientRect(); for (const k in els){ const r = els[k].getBoundingClientRect(); R[k] = { l:r.left - o.left - 3, t:r.top - o.top - 3, r:r.right - o.left + 3, b:r.bottom - o.top + 3 }; } };
    const select = (i, who, inst) => {
      const d = AI_EL[i], r = R[d.k]; if (!r) return; const first = idx < 0;
      idx = i; by = who; tSel = now(); bySw.to(who === 'agent' ? 0 : 1); seen.add(d.k);
      if (first || inst){ ex.jump(r.l, r.r); ey.jump(r.t, r.b); rd.jump(d.rad); } else { ex.go(r.l, r.r); ey.go(r.t, r.b); rd.set(d.rad); }
      vis.set(1); lt.put(`${d.role} · ${d.name}`, first); lr.set(who === 'agent' ? 6 : 11); ls.set(who === 'agent' ? 1 : 0);
      lsw.to(i); const cn = L[i].cnt; c[0].set(String(cn.p)); c[1].set(String(cn.w)); c[2].set(String(cn.f)); n1.set(String(seen.size));
      mkt[d.k].o.set(1); sw.el.setAttribute('aria-label', 'Agent drives');
      say(`${who === 'agent' ? AG : 'You'} selected ${d.role}, ${d.name}. ${cn.p} pass, ${cn.w} warning, ${cn.f} fail.`);
    };
    const next = () => { if (!drive) return; const i = (idx + 1) % AI_EL.length;
      if (i === 0 && idx >= 0){ AI_EL.forEach(d => mkt[d.k].o.set(0, S.snap)); seen.clear(); n1.set('0'); }
      select(i, 'agent'); q.at(now() + 2.7, next); };
    const setDrive = (v, byUser) => { drive = v; sw.set(v); q.clear(); if (v) q.at(now() + .5, next); };
    Object.entries(els).forEach(([k, e]) => { const go = () => { const i = AI_EL.findIndex(d => d.k === k); if (drive) setDrive(false); select(i, 'you'); };
      e.addEventListener('click', go); e.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); go(); } }); });
    layout(); n1.set('0', true); c.forEach(x => x.set('0', true)); q.at(now() + .5, next);
    return t => {
      q.run(t);
      if (ov.clientWidth !== W || ov.clientHeight !== H || t - lastLay > .5){ const ow = W, oh = H; lastLay = t; layout(); if ((ow !== W || oh !== H) && idx >= 0){ const r = R[AI_EL[idx].k]; ex.jump(r.l, r.r); ey.jump(r.t, r.b); } }
      const ax = ex.A.at(t), bx = ex.B.at(t), ay = ey.A.at(t), bb = ey.B.at(t), o = clamp(vis.at(t));
      Object.assign(ol.style, { left:px(ax), top:px(ay), width:px(Math.max(0, bx - ax)), height:px(Math.max(0, bb - ay)), borderRadius:px(rd.at(t) + 3), opacity:o.toFixed(3) });
      const s = clamp(ls.at(t)); lbs.style.width = px(11*s); lbs.style.marginRight = px(5*s); lbs.style.opacity = s.toFixed(3); lb.style.borderRadius = px(lr.at(t));
      lt.render(t); const lw = lb.offsetWidth; lb.style.transform = `translate(${px(clamp(ax - 2, 2, Math.max(2, W - lw - 2)))},${px(Math.max(2, ay - 26))})`; lb.style.opacity = o.toFixed(3);
      const txt = `${Math.max(0, Math.round(bx - ax - 6))} × ${Math.max(0, Math.round(bb - ay - 6))}`; if (txt !== lastSz){ lastSz = txt; sz.textContent = txt; }
      const zw = sz.offsetWidth, zt = bb + 6 + 20 > H ? bb - 26 : bb + 6; sz.style.transform = `translate(${px(clamp(bx - zw, 2, Math.max(2, W - zw - 2)))},${px(zt)})`; sz.style.opacity = o.toFixed(3);
      L.forEach((l, i) => { lsw.apply(l.el, i, t, 4); if (i === idx) l.rows.forEach((r, j) => { const p = clamp(prog(t, tSel + EXIT + j*.045, S.base)); r.style.opacity = p.toFixed(3); r.style.transform = `translateY(${px((1 - p)*6)})`; }); });
      byEl.forEach((e, i) => bySw.apply(e, i, t, 3));
      for (const d of AI_EL){ const m = mkt[d.k], p = clamp(m.o.at(t)), r = R[d.k]; if (!r) continue; m.el.style.opacity = p.toFixed(3); m.el.style.transform = `translate(${px(r.r - 12)},${px(r.t - 6 - (1 - p)*6)}) scale(${(.9 + .1*p).toFixed(3)})`; }
      n1.render(t); n2.render(t); c.forEach(x => x.render(t)); sw.render(t);
    };
  }});

/* ================================================================ 5. Presence bar */
const AP = [
  { id:'maya', name:'Maya Singh', kind:'human', tag:'Owner', ini:'MS' },
  { id:'rev', name:AG, kind:'agent', tag:'Agent' },
  { id:'dev', name:'Dev Patel', kind:'human', tag:'Reviewer', ini:'DP' },
  { id:'lay', name:'Layout agent', kind:'agent', tag:'Subagent' } ];
const AP_ACT = {
  maya:[['Viewing /', 'home'], ['Typing a comment', 'home', 1], ['Selecting an element', 'pricing'], ['Viewing /pricing', 'pricing']],
  rev:[['Reviewing /pricing', 'pricing'], ['Inspecting a button', 'pricing'], ['Reading /blog', 'blog'], ['Saved a finding', 'blog']],
  dev:[['Viewing /blog', 'blog'], ['Placing a pin', 'blog'], ['Typing a comment', 'blog', 1], ['Viewing /', 'home']],
  lay:[['Checking layout at 330px', 'pricing'], ['Checking layout at 700px', 'pricing'], ['Checking /blog', 'blog']] };
const AP_SPOT = { home:[[.3, .36], [.22, .62], [.62, .64], [.46, .8]], pricing:[[.3, .56], [.52, .5], [.74, .56], [.4, .82]], blog:[[.42, .5], [.34, .68], [.52, .38]] };
const AP_ORDER = ['home', 'pricing', 'blog'];
atom({ id:'presencebar', cat:'Agent activity', name:'Presence bar', block:'Review workspace · realtime awareness (activity, route, cursor) and Agents list', fam:['X','S','E','T'], wide:true, tall:true,
  html:`<style>${pgCss('agp-')}
.agp-root{position:absolute;inset:0;container-type:inline-size}
.agp-in{position:absolute;inset:0;padding:12px;display:flex;flex-direction:column;gap:8px}
.agp-hd{flex:none;display:flex;align-items:center;gap:12px;padding:6px 14px;min-height:62px}
.agp-ti{flex:none;min-width:0}
.agp-ti b{display:block;font-size:14px;line-height:1.3}
.agp-ti span{font-size:12px;color:var(--muted)}
.agp-pr{flex:1;min-width:0;display:flex;align-items:center;justify-content:flex-start;gap:2px}
.agp-wr{flex:none;overflow:hidden}
.agp-cl{display:flex;align-items:center;gap:9px;padding:6px 12px 6px 7px;border-radius:12px;border:1.5px solid transparent;background:none;cursor:pointer;text-align:left;color:var(--ink);white-space:nowrap;flex:none}
.agp-av{flex:none;width:32px;height:32px;display:grid;place-items:center;font-size:12px;font-weight:600}
.agp-av.h{border-radius:50%;background:var(--raised);color:var(--ink)}
.agp-av.a{border-radius:10px;background:var(--accent-tint);color:var(--accent);border:1.5px solid var(--accent)}
.agp-tx{display:flex;flex-direction:column;gap:3px;min-width:0}
.agp-nm{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;line-height:16px}
.agp-tg{font-size:11px;font-weight:600;line-height:14px;padding:0 5px;color:var(--muted);background:var(--raised)}
.agp-tg.h{border-radius:7px}
.agp-tg.a{border-radius:3px}
.agp-ac{display:flex;align-items:center;height:20px;padding:0 8px;font-size:12px;font-weight:500;overflow:hidden}
.agp-ac.h{border-radius:10px;background:var(--raised);color:var(--muted)}
.agp-ac.a{border-radius:5px;background:var(--accent-tint);color:var(--accent)}
.agp-ac>i{flex:none;margin-right:6px;display:block}
.agp-ac.h>i{width:6px;height:6px;border-radius:50%;background:currentColor}
.agp-cn{margin-left:auto;flex:none;display:flex;align-items:center;gap:5px;font-size:13px;color:var(--muted);line-height:1.25}
.agp-fb{flex:none;display:flex;align-items:center;gap:10px;min-height:36px;padding:0 2px 0 6px;font-size:13px}
.agp-fl{position:relative;flex:1;min-width:0;height:20px;overflow:hidden;color:var(--muted)}
.agp-vw{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.agp-chrome{flex:none;display:flex;align-items:center;gap:8px;height:38px;padding:0 10px;border-bottom:1px solid var(--line-soft);font-size:12.5px;color:var(--muted)}
.agp-url{flex:1;min-width:0;background:var(--raised);border-radius:8px;height:26px;display:flex;align-items:center;gap:6px;padding:0 10px;white-space:nowrap;overflow:hidden}
.agp-pa{position:relative;flex:1;height:18px;color:var(--ink);font-weight:500}
.agp-who{position:relative;flex:none;height:20px;overflow:hidden;font-weight:600;color:var(--ink);font-size:12.5px}
.agp-pw{position:relative;flex:1;min-height:0}
.agp-ov{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.agp-cb{flex:none;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.agp-dt{display:inline-flex;gap:3px;align-items:center;overflow:hidden;flex:none}
.agp-dt i{width:4px;height:4px;border-radius:50%;background:currentColor;flex:none}
@container (max-width:819px){
  .agp-hd{flex-wrap:wrap;gap:2px 10px;padding:8px 10px}
  .agp-ti{flex:1}
  .agp-cn{order:1;margin-left:0}
  .agp-pr{order:2;flex:none;width:100%;display:grid;grid-template-columns:1fr 1fr;column-gap:8px;align-items:start}
  .agp-cl{width:100%}
}
@container (max-width:459px){.agp-pr{grid-template-columns:1fr}.agp-ho{display:none}.agp-pa{min-width:0}}
</style>
<div class="agp-root"><div class="agp-in">
  <header class="card agp-hd" aria-label="People and agents in this review"><div class="agp-ti"><b>Release 14 review</b><span>demo-shop.local</span></div><div class="agp-pr" role="group" aria-label="Participants"></div><div class="agp-cn"><span class="agp-n"></span><span>here</span></div></header>
  <div class="agp-fb"><span class="agp-fl"></span><button type="button" class="btn agp-my">My view</button></div>
  <div class="card agp-vw" role="group" aria-label="Page view"><div class="agp-chrome"><span class="agp-url">${ic(G.lock, 12, 2)}<span class="agp-ho">demo-shop.local</span><span class="agp-pa"></span></span><span class="agp-who"></span></div>
    <div class="agp-pw">${AP_ORDER.map(k => `<div class="agp-pg" data-r="${k}" aria-hidden="true">${PAGE[k]('agp-')}</div>`).join('')}<div class="agp-ov"></div></div></div>
  <div class="agp-cb"><button type="button" class="btn agp-jn">Someone joins</button><button type="button" class="btn agp-lv">Someone leaves</button></div>
  <div class="agp-live" role="status" aria-live="polite" style="${SR}"></div>
</div></div>`,
  desc:'Each participant is a button: people are round, agents are rounded squares with a star and a square “Agent” tag, so nothing relies on color. Joining grows the slot first, then the avatar arrives; leaving fades first, then the slot closes. Activity chips swap text and morph width. Tap anyone to jump to the page they are on (the view slides toward their route and their cursor appears); it keeps following as they move. “My view” returns.',
  api:'join: slot.e.set(1) → cell.a.set(1) +80ms   leave: cell.a.set(0) → slot.e.set(0) +EXIT   tap: view.to(route, dir)   activity.put(text) · width morph',
  init(st){
    const q = gQ(), prEl = $(st, '.agp-pr'), ov = $(st, '.agp-ov'), live = $(st, '.agp-live'), pw = $(st, '.agp-pw'), layers = $$(st, '.agp-pg'), L = {}; layers.forEach(l => L[l.dataset.r] = l);
    const cnt = new Digits($(st, '.agp-n'), 1), my = $(st, '.agp-my'), jn = $(st, '.agp-jn'), lv = $(st, '.agp-lv');
    $(st, '.agp-n').style.lineHeight = '1.25';
    const fb = gFit($(st, '.agp-fl'), 'line-height:20px'), who = gFit($(st, '.agp-who'), 'line-height:20px');
    const pa = $(st, '.agp-pa'), pl = [gEl('span', 'position:absolute;left:0;top:0;white-space:nowrap'), gEl('span', 'position:absolute;left:0;top:0;white-space:nowrap')]; pl.forEach(e => pa.appendChild(e));
    const psw = new DSw(0); let pk = 0; const putPath = (txt, dir) => { pk ^= 1; pl[pk].textContent = txt; psw.to(pk, dir); };
    const vsw = new DSw('home'), myT = new Track(0, S.base); let route = 'home', follow = null, compact = null, nar = null, W = 0, H = 0;
    const P = AP.map((d, i) => {
      const wr = gEl('div', ''); wr.className = 'agp-wr'; const h = d.kind === 'human' ? 'h' : 'a';
      wr.innerHTML = `<button type="button" class="agp-cl" aria-pressed="false"><span class="agp-av ${h}">${d.kind === 'agent' ? starSvg(15) : d.ini}</span><span class="agp-tx"><span class="agp-nm"><span class="agp-nn"></span><span class="agp-tg ${h}">${d.tag}</span></span><span class="agp-ac ${h}"><i>${d.kind === 'agent' ? starSvg(10) : ''}</i><span class="agp-at" style="position:relative;display:block;height:20px;overflow:hidden"></span><span class="agp-dt" aria-hidden="true"><i></i><i></i><i></i></span></span></span></button>`;
      $(wr, '.agp-nn').textContent = d.name; prEl.appendChild(wr);
      const cur = gCur(d.kind, d.name); ov.appendChild(cur.el);
      const p = { d, wr, cl:$(wr, '.agp-cl'), at:gFit($(wr, '.agp-at'), 'line-height:20px'), dt:$(wr, '.agp-dt'), dw:new Track(0), e:new Track(0), a:new Track(0, S.base), sel:new Track(0, S.snap), pv:new Track(0, S.snap), fx:new Track(.5, { w:7 }), fy:new Track(.5, { w:7 }), cur, present:false, ai:0, act:'', route:'home', typing:false, gen:0, nat:0 };
      p.cl.onclick = () => jump(p); return p;
    });
    const say = s => { live.textContent = s; };
    const find = id => P.find(p => p.d.id === id);
    const nPresent = () => P.filter(p => p.present).length;
    const syncVis = () => P.forEach(p => p.pv.set(p.present && p.route === route ? 1 : 0));
    const setRoute = (r, inst) => { if (r === route) return; const dir = AP_ORDER.indexOf(r) >= AP_ORDER.indexOf(route) ? 1 : -1; route = r; vsw.to(r, dir); putPath(ROUTE[r], dir); syncVis(); };
    const refresh = inst => {
      const f = follow && find(follow);
      fb.put(f ? (compact ? `${f.d.name} · ${f.act}` : `Following ${f.d.name} · ${f.act}`) : 'Tap anyone to jump to where they are.', inst);
      who.put(f ? (size(st).cw < 460 ? 'Their view' : `${f.d.name}’s view`) : 'Your view', inst); myT.set(f ? 1 : 0);
      P.forEach(p => { const on = follow === p.d.id; p.sel.set(on ? 1 : 0); p.cl.setAttribute('aria-pressed', on); p.cl.setAttribute('aria-label', `${on ? 'Following' : 'Jump to'} ${p.d.name}, ${p.d.tag}. ${p.act}`); });
    };
    const jump = p => { if (!p.present) return; follow = follow === p.d.id ? null : p.d.id; if (follow){ setRoute(p.route); say(`Following ${p.d.name}`); } else { setRoute('home'); say('Back to your view'); } refresh(); };
    const mine = () => { if (follow){ follow = null; setRoute('home'); refresh(); say('Back to your view'); } };
    const tick = p => {
      const g = p.gen, A = AP_ACT[p.d.id], a = A[p.ai % A.length]; p.ai++;
      p.act = a[0]; p.route = a[1]; p.typing = !!a[2]; p.at.put(a[0], !p.present || p.a.at(now()) < .05);
      const sp = AP_SPOT[p.route], s = sp[(p.ai + P.indexOf(p)) % sp.length]; p.fx.set(s[0]); p.fy.set(s[1]); p.dw.set(p.typing ? 1 : 0);
      syncVis(); if (follow === p.d.id){ setRoute(p.route); } refresh();
      q.at(now() + 3.4 + P.indexOf(p)*.45, () => { if (p.present && p.gen === g) tick(p); });
    };
    const join = (p, quiet) => {
      if (p.present) return; p.present = true; p.gen++; const t = now();
      p.e.set(1, S.base, t); p.a.set(1, S.base, t + .08); 
      const A = AP_ACT[p.d.id], a = A[0]; p.act = a[0]; p.route = a[1]; p.at.put(a[0], true); const s = AP_SPOT[p.route][0]; p.fx.jump(s[0]); p.fy.jump(s[1]); p.dw.jump(0);
      p.ai = 1; cnt.set(String(nPresent())); syncVis(); refresh(); if (!quiet) say(`${p.d.name} joined`);
      q.at(now() + 3.2, () => { const g = p.gen; if (p.present && p.gen === g) tick(p); });
    };
    const leave = (p, quiet) => {
      if (!p.present) return; p.present = false; p.gen++; const t = now();
      p.a.set(0, S.snap, t); p.e.set(0, S.base, t + EXIT); cnt.set(String(nPresent())); syncVis();
      if (follow === p.d.id){ follow = null; setRoute('home'); if (!quiet) say(`${p.d.name} left. Back to your view.`); } else if (!quiet) say(`${p.d.name} left`);
      refresh(); if (follow === null && !quiet){ fb.put(`${p.d.name} left.`); q.at(now() + 2.2, () => refresh()); }
    };
    jn.onclick = () => { const p = P.find(x => !x.present); if (p) join(p); };
    lv.onclick = () => { const p = P.slice().reverse().find(x => x.present && x !== find('rev') && x !== find('maya')) || P.slice().reverse().find(x => x.present && x !== find('maya')); if (p) leave(p); };
    my.onclick = mine;
    // scripted room: two join, later one leaves and comes back
    const SCRIPT = [[1.4, () => join(find('dev'))], [1.8, () => join(find('lay'))], [7.5, () => leave(find('dev'))], [3.2, () => join(find('dev'))], [4.2, () => leave(find('lay'))], [3.5, () => join(find('lay'))]];
    let si = 0; const runS = () => { const s = SCRIPT[si % SCRIPT.length]; si++; q.at(now() + s[0] + (si > SCRIPT.length && si % SCRIPT.length === 1 ? 5 : 0), () => { s[1](); runS(); }); };
    join(find('maya'), true); join(find('rev'), true); P.forEach(p => { p.e.jump(p.present ? 1 : 0); p.a.jump(p.present ? 1 : 0); }); cnt.set(String(nPresent()), true); putPath('/', 1); pl[pk].textContent = '/'; psw.cur = pk; psw.prev = null; psw.t = -9; refresh(true); runS();
    return t => {
      q.run(t);
      const cw = size(st).cw < 820; if (cw !== compact || (size(st).cw < 460) !== nar){ compact = cw; nar = size(st).cw < 460; refresh(true); }
      if (size(pw).cw !== W || size(pw).ch !== H){ W = size(pw).cw; H = size(pw).ch; }
      for (const k in L) vsw.apply(L[k], k, t, 20); pl.forEach((e, i) => psw.apply(e, i, t, 10));
      // measure first, then write
      for (const p of P) p.nat = compact ? size(p.cl).h : size(p.cl).w;
      for (const p of P){
        const e = clamp(p.e.at(t)), a = clamp(p.a.at(t)), s = clamp(p.sel.at(t));
        if (compact){ p.wr.style.width = ''; p.wr.style.height = e > .999 ? '' : px(e*p.nat); } else { p.wr.style.height = ''; p.wr.style.width = e > .999 ? '' : px(e*p.nat); }
        fade(p.cl, a, (1 - a)*-4, true); p.cl.style.pointerEvents = p.present ? 'auto' : 'none'; p.cl.tabIndex = p.present ? 0 : -1; p.wr.style.visibility = e < .004 ? 'hidden' : 'visible';
        p.cl.style.borderColor = mix(s, 'var(--accent)', 'transparent'); p.cl.style.background = mix(s*.9, 'var(--accent-tint)', 'transparent');
        p.at.render(t); const dw = clamp(p.dw.at(t)); p.dt.style.width = px(dw*(14 + 0)); p.dt.style.marginLeft = px(dw*6); p.dt.style.opacity = dw.toFixed(3);
        if (dw > .02) $$(p.dt, 'i').forEach((d, i) => d.style.opacity = (.3 + .7*(.5 + .5*Math.sin(6.283*(t*1.1 - i*.2)))).toFixed(3));
        p.cur.draw(p.fx.at(t)*W, p.fy.at(t)*H, W, H, 0, clamp(p.pv.at(t)));
      }
      fb.render(t); who.render(t); cnt.render(t);
      pop(my, clamp(myT.at(t)), -4); my.tabIndex = myT.at(t) > .5 ? 0 : -1;
    };
  }});

/* ================================================================ 6. Site coverage */
const SC = [
  { id:'/', d:0, kids:['/pricing', '/blog', '/signup', '/docs', '/account'] },
  { id:'/pricing', d:1, kids:['/pricing/compare'], f:1 },
  { id:'/pricing/compare', d:2, f:1 },
  { id:'/blog', d:1, kids:['/blog/each-change-gets-a-review-link', '/blog/pins-keep-their-place', '/blog/changelog.pdf'], f:0 },
  { id:'/blog/each-change-gets-a-review-link', d:2, f:0 },
  { id:'/blog/pins-keep-their-place', d:2, f:1 },
  { id:'/blog/changelog.pdf', d:2, skip:'Download blocked' },
  { id:'/signup', d:1, f:2 },
  { id:'/docs', d:1, kids:['/docs/agents', '/docs/pins'], f:0 },
  { id:'/docs/agents', d:2, f:0 },
  { id:'/docs/pins', d:2, f:1 },
  { id:'/account', d:1, skip:'Needs sign-in' } ];
const scLast = i => { for (let j = i + 1; j < SC.length; j++){ if (SC[j].d < SC[i].d) return false; if (SC[j].d === SC[i].d) return true; } return false; };
const scAnc = (i, k) => { for (let j = i; j >= 0; j--) if (SC[j].d === k) return j; return -1; };
const scName = n => n.d < 2 ? n.id : '/' + n.id.split('/').pop();
const scFrom = n => { const i = SC.indexOf(n); return SC[scAnc(i, n.d - 1)].id; };
atom({ id:'sitecoverage', cat:'Agent activity', name:'Site coverage', block:'Review agent browser · review run (pages visited, findings, blocked origins)', fam:['M','S','T','E'], wide:true, tall:true,
  html:`<style>
.agv-root{position:absolute;inset:0;container-type:inline-size}
.agv-in{position:absolute;inset:0;padding:12px;display:flex;gap:12px}
.agv-tr{flex:1.35;min-width:0;display:flex;flex-direction:column;overflow:hidden}
.agv-hd{flex:none;display:flex;align-items:center;gap:10px;min-height:44px;padding:0 10px 0 14px;border-bottom:1px solid var(--line-soft)}
.agv-hd b{font-size:14px}
.agv-ss{position:relative;flex:1;min-width:0;height:20px;overflow:hidden;font-size:12.5px;color:var(--muted)}
.agv-tl{flex:1;min-height:0;overflow:auto;margin:0;padding:6px 6px 8px;list-style:none;scrollbar-width:thin}
.agv-li{overflow:hidden}
.agv-rw{position:relative;display:flex;align-items:center;gap:8px;height:28px;padding-right:8px;border-radius:8px}
.agv-ln{position:absolute;background:var(--line)}
.agv-dt{position:relative;flex:none;width:16px;height:16px;border-radius:50%;border:1.5px solid var(--faint);z-index:1}
.agv-dt>span{position:absolute;inset:-1.5px;display:grid;place-items:center}
.agv-lb{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px}
.agv-rt{flex:none;font-size:12px;font-weight:500;white-space:nowrap;display:flex;align-items:center;gap:4px}
.agv-sd{flex:1;min-width:0;display:flex;flex-direction:column;gap:12px}
.agv-st{flex:none;padding:12px 14px;display:flex;flex-direction:column;gap:10px}
.agv-sg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.agv-sc{min-width:0}
.agv-sc>span{display:block;font-size:12px;color:var(--muted)}
.agv-v{display:flex;align-items:baseline;gap:4px;font-size:22px;font-weight:600;letter-spacing:-.02em;line-height:1.25;font-variant-numeric:tabular-nums;white-space:nowrap}
.agv-v small{font-size:13px;font-weight:500;color:var(--muted);letter-spacing:0}
.agv-v .digits{align-items:baseline}
.agv-bar{position:relative;height:8px;border-radius:4px;background:var(--raised);overflow:hidden}
.agv-bar i{position:absolute;left:0;top:0;bottom:0;right:0;border-radius:4px;background:var(--accent);transform-origin:0 50%}
.agv-bl{display:flex;justify-content:space-between;font-size:12px;color:var(--muted)}
.agv-q{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.agv-qh{flex:none;display:flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;border-bottom:1px solid var(--line-soft);font-size:14px;font-weight:600}
.agv-qh .agv-qn{margin-left:auto;font-weight:500;font-size:12.5px;color:var(--muted);display:flex;align-items:center;gap:4px;line-height:1.25}
.agv-qb{position:relative;flex:1;min-height:0;overflow:auto;scrollbar-width:thin}
.agv-qi{position:relative}
.agv-qr{position:absolute;left:6px;right:6px;top:0;display:flex;align-items:center;gap:10px;text-align:left;border:0;background:none;border-radius:9px;padding:0 8px;cursor:pointer;color:var(--ink)}
.agv-qr:hover{background:var(--raised)}
.agv-qt{flex:1;min-width:0}
.agv-qt b{display:block;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.35}
.agv-qt span{display:block;font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.35}
.agv-qg{flex:none;color:var(--muted);display:grid;place-items:center}
.agv-qe{position:absolute;left:14px;right:14px;top:14px;font-size:13px;color:var(--muted);margin:0}
@container (max-width:639px){
  .agv-in{flex-direction:column;gap:8px}
  .agv-sd{display:contents}
  .agv-st{order:0;padding:10px 12px;gap:8px}
  .agv-tr{order:1}
  .agv-q{order:2;flex:none;height:136px}
  .agv-v{font-size:19px}
  .agv-qh{min-height:36px}
}
</style>
<div class="agv-root"><div class="agv-in">
  <section class="card agv-tr" aria-label="Sitemap"><div class="agv-hd"><b>Sitemap</b><span class="agv-ss" aria-hidden="true"></span><button type="button" class="btn agv-rp" style="padding:4px 10px">Replay</button></div><ul class="agv-tl" aria-label="Pages found on demo-shop.local"></ul></section>
  <div class="agv-sd">
    <section class="card agv-st" aria-label="Coverage"><div class="agv-sg"><div class="agv-sc"><span>Visited</span><div class="agv-v"><span class="agv-n1"></span><small>of</small><span class="agv-n2"></span></div></div><div class="agv-sc"><span>Findings</span><div class="agv-v"><span class="agv-n3"></span></div></div><div class="agv-sc"><span>Skipped</span><div class="agv-v"><span class="agv-n4"></span></div></div></div>
      <div><div class="agv-bar" aria-hidden="true"><i></i></div><div class="agv-bl" style="margin-top:5px"><span>Explored</span><span class="num" style="display:inline-flex;align-items:baseline;line-height:1.25"><span class="agv-n5"></span>%</span></div></div></section>
    <section class="card agv-q" aria-label="Pages queued"><div class="agv-qh">Up next<span class="agv-qn"><span class="agv-n6"></span>queued</span></div><div class="agv-qb"><div class="agv-qi"></div><p class="agv-qe">Queue is empty. Every reachable page has been visited.</p></div></section>
  </div>
  <div class="agv-live" role="status" aria-live="polite" style="${SR}"></div>
</div></div>`,
  desc:'The agent crawls one page at a time. The current row lights and spins; on arrival its links are discovered, so new rows open under it and join the queue 120ms apart. When the visit ends the dot morphs to a check, findings roll into the counters and the bar fills. Blocked pages (sign-in, downloads) end in a skipped state with the reason. Click a queued page to move it to the front.',
  api:'visit(n): row.c.set(1) → kids.open(+.12·i) → row.v.set(1), digits.set(n)   bar.set(done/found)   queue[i].y.set(i·ROW)   click → queue.unshift(item)',
  init(st){
    const q = gQ(), tl = $(st, '.agv-tl'), qi = $(st, '.agv-qi'), qb = $(st, '.agv-qb'), qe = $(st, '.agv-qe'), live = $(st, '.agv-live'), bar = $(st, '.agv-bar i'), rp = $(st, '.agv-rp');
    const ss = gFit($(st, '.agv-ss'), 'line-height:20px');
    const dg = k => { const d = new Digits($(st, '.agv-n' + k), k === 5 ? 3 : 2); $(st, '.agv-n' + k).style.lineHeight = '1.25'; return d; };
    const N = { vis:dg(1), found:dg(2), fnd:dg(3), skip:dg(4), pct:dg(5), qn:dg(6) };
    const ROW = 28, barT = new Track(0, S.soft); let ROWQ = 44;
    const cols = ['var(--faint)', 'var(--accent)', 'var(--success)', 'var(--warning)'];
    const tints = ['transparent', 'var(--accent-tint)', 'var(--success)', 'var(--warning-tint)'];
    const blend = (ws, cs) => { let c = cs[0], a = Math.max(ws[0], 0); for (let k = 1; k < cs.length; k++){ const w = Math.max(ws[k], 0); a += w; if (w > .002) c = `color-mix(in oklab, ${cs[k]} ${(w/a*100).toFixed(1)}%, ${c})`; } return c; };
    const rows = SC.map((n, i) => {
      const li = gEl('li', ''); li.className = 'agv-li'; li.setAttribute('role', 'listitem');
      const lines = []; for (let k = 1; k <= n.d; k++){ const x = 10 + (k - 1)*18 + 7;
        if (k === n.d) lines.push(`<i class="agv-ln" style="left:${x}px;top:0;width:1px;height:${scLast(i) ? 14 : 28}px"></i><i class="agv-ln" style="left:${x}px;top:14px;width:11px;height:1px"></i>`);
        else if (scLast(scAnc(i, k))) lines.push(`<i class="agv-ln" style="left:${x}px;top:0;width:1px;height:28px"></i>`); }
      li.innerHTML = `<div class="agv-rw" style="padding-left:${10 + n.d*18}px">${lines.join('')}<span class="agv-dt"><span class="g1" style="color:var(--card)">${ic(I.check, 11, 3)}</span><span class="g2" style="color:var(--warning)">${ic(G.dash, 11, 3)}</span><span class="g3" style="color:var(--accent)">${ic('<path d="M12 3a9 9 0 0 1 9 9"/>', 16, 2.5)}</span></span><span class="agv-lb"></span><span class="agv-rt"></span></div>`;
      $(li, '.agv-lb').textContent = scName(n);
      const rt = $(li, '.agv-rt'); if (n.skip){ rt.style.color = 'var(--warning)'; rt.textContent = n.skip; } else if (n.f){ rt.style.color = 'var(--warning)'; rt.innerHTML = `${ic(I.alert, 12, 2.4)}<span>${n.f} finding${n.f > 1 ? 's' : ''}</span>`; }
      tl.appendChild(li);
      return { n, i, li, rw:$(li, '.agv-rw'), dt:$(li, '.agv-dt'), g:[$(li, '.g1'), $(li, '.g2'), $(li, '.g3')], lb:$(li, '.agv-lb'), rt, h:new Track(0), a:new Track(0, S.base), W:[new Track(1), new Track(0), new Track(0), new Track(0)], cur:new Track(0, S.snap), fr:new Track(0, S.base), state:'hidden' };
    });
    const byId = {}; rows.forEach(r => byId[r.n.id] = r);
    let queue = [], all = [], seen = 0, vis = 0, found = 0, fnd = 0, skp = 0, busy = false, wide = null, gen = 0;
    const say = s => { live.textContent = s; };
    const setW = (r, k, inst) => r.W.forEach((w, j) => inst ? w.jump(j === k ? 1 : 0) : w.set(j === k ? 1 : 0, S.base));
    const open = (r, lag = 0, inst) => { r.state = 'found'; if (inst){ r.h.jump(1); r.a.jump(1); } else { r.h.set(1, S.base, now() + lag); r.a.set(1, S.base, now() + lag + .08); } };
    const counts = () => { N.vis.set(String(vis)); N.found.set(String(found)); N.fnd.set(String(fnd)); N.skip.set(String(skp)); N.pct.set(String(found ? Math.round((vis + skp)/found*100) : 0)); N.qn.set(String(queue.length)); barT.set(found ? (vis + skp)/found : 0); };
    const layoutQ = inst => queue.forEach((it, i) => inst ? it.y.jump(i*ROWQ) : it.y.set(i*ROWQ));
    const mkQ = (r, lag) => {
      const b = gEl('button', ''); b.type = 'button'; b.className = 'agv-qr'; b.style.height = (ROWQ - 4) + 'px';
      b.innerHTML = `<span class="agv-qt"><b></b><span></span></span><span class="agv-qg">${ic(G.up, 14, 2)}</span>`; $(b, 'b').textContent = r.n.id; $(b, 'span span').textContent = 'found on ' + scFrom(r.n);
      b.setAttribute('aria-label', `Visit ${r.n.id} next`); qi.appendChild(b);
      const it = { r, b, y:new Track(0), e:new Track(0) }; it.y.jump(queue.length*ROWQ); it.e.set(1, S.base, now() + lag); queue.push(it); all.push(it);
      b.onclick = () => { const k = queue.indexOf(it); if (k > 0){ queue.splice(k, 1); queue.unshift(it); layoutQ(); say(`${r.n.id} moves to the front of the queue`); } };
    };
    const dropQ = it => { const k = queue.indexOf(it); if (k < 0) return; queue.splice(k, 1); it.e.set(0, S.snap); q.at(now() + EXIT + .02, () => layoutQ()); q.at(now() + .6, () => { it.b.remove(); all.splice(all.indexOf(it), 1); }); };
    const finish = () => {
      busy = false; ss.put(`Done · ${vis} visited, ${skp} skipped`); say(`Coverage complete. ${vis} pages visited, ${skp} skipped, ${fnd} findings.`);
      q.at(now() + 4.5, restart);
    };
    const visit = r => {
      r.state = 'current'; setW(r, 1); r.cur.set(1); ss.put(`Visiting ${r.n.id}`); say(`Visiting ${r.n.id}`);
      const it = queue.find(x => x.r === r); if (it) dropQ(it);
      if (r.n.skip){ q.at(now() + .7, () => { setW(r, 3); r.cur.set(0); r.fr.set(1); r.state = 'skipped'; skp++; counts(); say(`${r.n.id} skipped: ${r.n.skip}`); q.at(now() + .5, next); }); return; }
      q.at(now() + .5, () => { (r.n.kids || []).forEach((k, j) => { const c = byId[k]; if (c.state === 'hidden'){ open(c, j*.12); found++; mkQ(c, j*.12 + .1); } }); counts(); });
      q.at(now() + 1.2, () => { if (r.n.f){ fnd += r.n.f; r.fr.set(1); } counts(); });
      q.at(now() + 1.6, () => { setW(r, 2); r.cur.set(0); r.state = 'visited'; vis++; counts(); q.at(now() + .35, next); });
    };
    const next = () => { if (!queue.length){ finish(); return; } visit(queue[0].r); };
    function restart(){
      q.clear(); queue.slice().forEach(dropQ); queue = [];
      rows.forEach(r => { if (r.state !== 'hidden'){ r.a.set(0, S.snap); r.h.set(0, S.base, now() + EXIT); r.fr.set(0, S.snap); setW(r, 0); r.cur.set(0); r.state = 'hidden'; } });
      vis = 0; found = 0; fnd = 0; skp = 0; counts(); ss.put('Starting a new crawl');
      q.at(now() + .9, () => { const r0 = rows[0]; open(r0); found = 1; counts(); q.at(now() + .5, () => visit(r0)); });
    }
    rp.onclick = restart;
    const lay = () => { const w = st.clientWidth >= 640; ROWQ = w ? 44 : 36; if (w !== wide){ wide = w; qb.style.overflowY = 'auto'; } all.forEach(it => it.b.style.height = (ROWQ - 4) + 'px'); layoutQ(true); };
    lay(); counts(); N.vis.set('0', true); N.found.set('0', true); N.fnd.set('0', true); N.skip.set('0', true); N.pct.set('0', true); N.qn.set('0', true);
    ss.put('Starting a review of demo-shop.local', true); const r0 = rows[0]; open(r0, 0, true); found = 1; counts(); q.at(now() + .8, () => visit(r0));
    let lastW = 0;
    return t => {
      q.run(t);
      if (st.clientWidth !== lastW){ lastW = st.clientWidth; lay(); }
      for (const r of rows){
        const h = clamp(r.h.at(t)), a = clamp(r.a.at(t)), ws = r.W.map(w => w.at(t)), c = clamp(r.cur.at(t));
        r.li.style.height = h > .9995 && r.h.target === 1 ? '' : px(h*ROW); r.li.style.visibility = h < .004 ? 'hidden' : 'visible'; fade(r.rw, a, null, false);
        r.dt.style.borderColor = blend(ws, cols); r.dt.style.background = blend(ws, tints);
        r.g[0].style.opacity = clamp(ws[2]).toFixed(3); r.g[1].style.opacity = clamp(ws[3]).toFixed(3); r.g[2].style.opacity = clamp(ws[1]).toFixed(3); r.g[2].style.transform = `rotate(${((t*540) % 360).toFixed(1)}deg)`;
        r.rw.style.background = mix(c*.85, 'var(--raised)', 'transparent'); r.lb.style.color = blend(ws, ['var(--muted)', 'var(--ink)', 'var(--ink)', 'var(--faint)']); r.lb.style.fontWeight = c > .5 ? 600 : 400;
        r.rt.style.opacity = clamp(r.fr.at(t)).toFixed(3);
      }
            for (const it of all){ const e = clamp(it.e.at(t)); it.b.style.opacity = e.toFixed(3); it.b.style.filter = e < .98 ? `blur(${((1 - e)*BLUR).toFixed(2)}px)` : 'none'; it.b.style.transform = `translate(${px((1 - e)*10)},${px(it.y.at(t))})`; it.b.style.visibility = e < .01 ? 'hidden' : 'visible'; it.b.tabIndex = queue.includes(it) ? 0 : -1; }
      qi.style.height = px(Math.max(queue.length*ROWQ, 0) + 6);
      qe.style.opacity = queue.length ? '0' : '1'; qe.style.visibility = queue.length ? 'hidden' : 'visible';
      bar.style.transform = `scaleX(${clamp(barT.at(t)).toFixed(4)})`;
      ss.render(t); Object.values(N).forEach(d => d.render(t));
    };
  }});

/* ================================================================ 7. Agent scroll map */
const AM_SECS = ['Overview', 'How reviews work', 'Pricing', 'Questions', 'Notes', 'Footer'];
const AM_STOPS = [0, .24, .5, .76, 1, .42];
const AM_FIND = ['Get started has no visible focus ring.', 'Team plan card text is 12.5px, smaller than body text.', 'FAQ answers fall below the 4.5:1 contrast minimum.'];
atom({ id:'agentscroll-map', cat:'Agent activity', name:'Agent scroll map', block:'Review agent browser · scroll action, coverage minimap', fam:['E','D','T','M'], wide:true, tall:true,
  html:`<style>${pgCss('agm-')}
.agm-root{position:absolute;inset:0;container-type:inline-size}
.agm-in{position:absolute;inset:0;padding:12px;display:flex;flex-direction:column;gap:8px}
.agm-bar{flex:none;display:flex;align-items:center;gap:14px;min-height:32px;font-size:13px}
.agm-st{position:relative;flex:1;min-width:0;height:20px;overflow:hidden;font-weight:500}
.agm-sx{display:flex;align-items:center;gap:5px;color:var(--muted);white-space:nowrap;line-height:1.25}
.agm-sx b{color:var(--ink);font-weight:600;display:inline-flex;align-items:center;gap:1px}
.agm-win{flex:1;min-height:0;position:relative;overflow:hidden;display:flex}
.agm-sc{position:relative;flex:1;min-width:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-width:thin}
.agm-sc .agm-pg{position:relative;inset:auto;min-height:100%;overflow:visible}
.agm-mp{position:relative;flex:none;width:132px;background:var(--tile);touch-action:none}
.agm-dv{position:absolute;left:0;top:0;bottom:0;width:1px;background:var(--line)}
.agm-mi{position:absolute;left:6px;top:6px}
.agm-bd{position:absolute;left:0;width:100%;transform-origin:0 50%;background:color-mix(in oklab,var(--accent) 24%,transparent)}
.agm-br{position:absolute;border-radius:1.5px;background:var(--line)}
.agm-br.h{background:var(--faint)}
.agm-wa{position:absolute;left:-2px;right:-2px;border:1.5px solid var(--accent);border-radius:4px;background:color-mix(in oklab,var(--accent) 14%,transparent)}
.agm-wu{position:absolute;left:-4px;right:-4px;border:1.5px solid var(--ink);border-radius:4px;cursor:grab;touch-action:none}
.agm-wu:active{cursor:grabbing}
.agm-tk{position:absolute;width:9px;height:9px;border-radius:3px;background:var(--accent);right:-1px}
.agm-ag{position:absolute;top:0;display:flex;align-items:center;gap:5px;height:22px;padding:0 9px 0 7px;border-radius:6px;background:var(--accent);color:var(--card);font-size:12px;font-weight:600;white-space:nowrap;z-index:6;pointer-events:none}
.agm-pn{position:absolute;width:22px;height:22px;border-radius:7px;background:var(--accent);color:var(--card);display:grid;place-items:center;font-size:11.5px;font-weight:600;z-index:3;pointer-events:none}
.agm-cp{flex:none;display:flex;flex-wrap:wrap;gap:6px}
.agm-ch{position:relative;overflow:hidden;height:28px;padding:0 11px;border-radius:14px;border:1px dashed var(--line);background:none;font-size:12.5px;font-weight:500;color:var(--muted);cursor:pointer;display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.agm-ch>i{position:absolute;left:0;top:0;bottom:0;right:0;transform-origin:0 50%;background:var(--accent-tint)}
.agm-ch>span,.agm-ch>b{position:relative}
.agm-ch>b{display:inline-flex;width:0;overflow:hidden;color:var(--success)}
@container (max-width:559px){.agm-st{display:none}.agm-mp{width:76px}.agm-bar{gap:10px}.agm-bar .agm-sp{flex:1}}
</style>
<div class="agm-root"><div class="agm-in">
  <div class="agm-bar"><span class="agm-st" aria-hidden="true"></span><span class="agm-sp" style="flex:1"></span><span class="agm-sx">Seen <b><span class="agm-n1"></span>%</b></span><span class="agm-sx">Findings <b><span class="agm-n2"></span><span style="font-weight:400;color:var(--muted)">&nbsp;of ${AM_FIND.length}</span></b></span><button type="button" class="btn agm-rp" style="padding:4px 10px">Replay</button></div>
  <div class="card agm-win"><div class="agm-sc" tabindex="0" role="region" aria-label="Demo Shop page, scrollable"><div class="agm-pg">${pgLong('agm-')}</div></div>
    <div class="agm-mp"><i class="agm-dv"></i><div class="agm-mi"></div></div><div class="agm-ag"><span style="display:flex">${starSvg(11)}</span>${AG}</div></div>
  <div class="agm-cp" role="group" aria-label="Page sections, tap to scroll there"></div>
  <div class="agm-live" role="status" aria-live="polite" style="${SR}"></div>
</div></div>`,
  desc:'The map is the whole page squeezed into a strip. The agent’s window (tinted) stretches with its leading edge first as it scrolls; every band it covers fills from the left, the Seen counter rolls, and findings drop a square pin on both the map and the page. Your own window is outlined: drag it 1:1 and it settles from your release velocity, or click the map or a section chip to glide there.',
  api:'agent.win = edges(top, bottom).go(scroll·k)   band[i].fill.set(1) when covered   seen = Σ fill / N   you.win: drag() → scroll = y/k · release(v)',
  init(st){
    const q = gQ(), sc = $(st, '.agm-sc'), pg = $(st, '.agm-pg'), win = $(st, '.agm-win'), mp = $(st, '.agm-mp'), mi = $(st, '.agm-mi'), agL = $(st, '.agm-ag'), live = $(st, '.agm-live'), chipH = $(st, '.agm-cp'), rp = $(st, '.agm-rp');
    const ss = gFit($(st, '.agm-st'), 'line-height:20px'), n1 = new Digits($(st, '.agm-n1'), 3), n2 = new Digits($(st, '.agm-n2'), 1);
    const NB = 30, A = new Track(0, { w:5 }), ea = edges(0, 0), u = new Track(0, S.base), pr = new Track(0, S.snap);
    const wa = gEl('div', ''); wa.className = 'agm-wa'; const wu = gEl('div', ''); wu.className = 'agm-wu'; wu.tabIndex = 0; wu.setAttribute('role', 'slider'); wu.setAttribute('aria-label', 'Your view on the page map'); wu.setAttribute('aria-orientation', 'vertical'); wu.setAttribute('aria-valuemin', 0); wu.setAttribute('aria-valuemax', 100);
    const bands = [], bars = [], pins = []; let anim = false;
    const chips = AM_SECS.map(n => { const b = gEl('button', ''); b.type = 'button'; b.className = 'agm-ch'; b.innerHTML = `<i></i><span></span><b>${ic(I.check, 13, 2.6)}</b>`; $(b, 'span').textContent = n; chipH.appendChild(b); return { n, b, fill:$(b, 'i'), ck:$(b, 'b'), lo:0, hi:0, fr:0, full:new Track(0, S.base) }; });
    const finds = []; let W = 0, H = 0, ph = 0, vh = 0, kx = 0, ky = 0, mw = 0, mh = 0, lastLay = -9, lastKey = '', si = 0, seenN = 0, fndN = 0, curSec = '', lastSec = '';
    const say = s => { live.textContent = s; };
    const maxS = () => Math.max(0, sc.scrollHeight - size(sc).ch);
    const secOf = y => { const r = chips.find(c => y >= c.lo && y < c.hi) || chips[chips.length - 1]; return r.n; };
    const build = () => {
      pw_ = sc.clientWidth; ph = sc.scrollHeight; vh = sc.clientHeight; const mpr = mp.getBoundingClientRect(); mw = Math.max(20, mp.clientWidth - 12); mh = Math.max(40, mp.clientHeight - 12);
      kx = mw/pw_; ky = mh/ph; Object.assign(mi.style, { width:px(mw), height:px(mh) });
      const pr_ = pg.getBoundingClientRect(), top0 = pr_.top, left0 = pr_.left;
      bars.forEach(b => b.remove()); bars.length = 0;
      $$(pg, '.agm-nv,.agm-ey,.agm-h1,.agm-sub,.agm-b1,.agm-b2,.agm-cd,.agm-sh,.agm-ss,.agm-fq,.agm-ps,.agm-ft').forEach(e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
        const b = gEl('i', ''); b.className = 'agm-br' + (/(nv|h1|sh)$/.test(e.className.split(' ')[0]) ? ' h' : ''); b.style.cssText = `left:${((r.left - left0)*kx).toFixed(1)}px;top:${((r.top - top0)*ky).toFixed(1)}px;width:${Math.max(2, r.width*kx).toFixed(1)}px;height:${Math.max(2, Math.min(r.height*ky, r.height*ky)).toFixed(1)}px`; mi.appendChild(b); bars.push(b); });
      // bands go under the bars
      if (!bands.length) for (let i = 0; i < NB; i++){ const d = gEl('i', ''); d.className = 'agm-bd'; mi.insertBefore(d, mi.firstChild); bands.push({ el:d, on:false, f:new Track(0, S.soft) }); }
      bands.forEach((b, i) => { b.el.style.top = (i*mh/NB).toFixed(1) + 'px'; b.el.style.height = (mh/NB + .5).toFixed(1) + 'px'; });
      if (!wa.parentNode){ mi.append(wa, wu); }
      chips.forEach((c, i) => { const s = $$(pg, '[data-s]').filter(x => x.dataset.s === c.n)[0]; if (!s) return; const r = s.getBoundingClientRect(); c.lo = r.top - top0; c.hi = r.bottom - top0; if (i === 0) c.lo = 0; if (i === chips.length - 1) c.hi = ph; });
      // findings: pins on the page and ticks on the map
      const src = [$(pg, '.agm-b1'), $$(pg, '.agm-cd')[7] || $$(pg, '.agm-cd')[3], $$(pg, '.agm-fq')[1]];
      pins.forEach(p => p.remove()); pins.length = 0; finds.forEach(f => f.tk && f.tk.remove());
      src.forEach((e, i) => { const r = e.getBoundingClientRect(), y = r.top - top0, x = r.right - left0;
        const pn = gEl('div', ''); pn.className = 'agm-pn'; pn.textContent = i + 1; pn.style.left = px(Math.min(x - 11, pw_ - 26)); pn.style.top = px(y - 11); pn.style.opacity = 0; pg.appendChild(pn); pins.push(pn);
        const tk = gEl('i', ''); tk.className = 'agm-tk'; tk.style.top = px(y*ky - 4); tk.style.opacity = 0; mi.appendChild(tk);
        finds[i] = Object.assign(finds[i] || { on:false, o:new Track(0, S.base) }, { y, tk }); });
      wa.style.zIndex = 2; wu.style.zIndex = 3; lastKey = pw_ + ':' + ph + ':' + vh + ':' + mh;
      const a = clamp(A.target, 0, maxS()); ea.jump(a*ky, (a + vh)*ky);
    };
    let pw_ = 0;
    const startAnim = (to, inst) => { to = clamp(to, 0, maxS()); anim = true; u.jump(sc.scrollTop); if (inst){ u.jump(to); sc.scrollTop = to; } else u.set(to); };
    const stop = () => { anim = false; };
    sc.addEventListener('wheel', stop, { passive:true }); sc.addEventListener('touchstart', stop, { passive:true }); sc.addEventListener('keydown', stop);
    sc.addEventListener('pointerdown', e => { if (e.target === sc && e.offsetX > sc.clientWidth) stop(); });
    // your window: drag 1:1, settle from release velocity
    let off = 0;
    drag(wu, {
      down:(p, e) => { anim = true; const r = wu.getBoundingClientRect(); off = p.cy - r.top; u.jump(sc.scrollTop); },
      move:(p) => { const mr = mi.getBoundingClientRect(), v = clamp((p.cy - mr.top - off)/ky, 0, maxS()); u.jump(v); sc.scrollTop = v; },
      up:(p, v) => { const cur = sc.scrollTop, to = clamp(cur + (v.vy/ky)*.12, 0, maxS()); u.release(cur, clamp(v.vy/ky, -4000, 4000), to); anim = true; }
    });
    wu.addEventListener('keydown', e => { const m = { ArrowUp:-70, ArrowDown:70, PageUp:-vh*.8, PageDown:vh*.8 }[e.key]; if (m !== undefined){ e.preventDefault(); startAnim(sc.scrollTop + m); } else if (e.key === 'Home'){ e.preventDefault(); startAnim(0); } else if (e.key === 'End'){ e.preventDefault(); startAnim(maxS()); } });
    mp.addEventListener('pointerdown', e => { if (e.target.closest('.agm-wu')) return; const mr = mi.getBoundingClientRect(); startAnim((e.clientY - mr.top)/ky - vh/2); });
    chips.forEach(c => c.b.onclick = () => startAnim(c.lo - 8));
    // agent route
    const step = () => {
      const a = AM_STOPS[si % AM_STOPS.length]*maxS(); si++; A.set(a); ea.go(a*ky, (a + vh)*ky); q.at(now() + 1.9, si < AM_STOPS.length + 0 ? step : () => q.at(now() + 3, restart));
    };
    const restart = () => {
      q.clear(); bands.forEach(b => { b.on = false; b.f.set(0, S.base); }); finds.forEach((f, i) => { f.on = false; f.o.set(0, S.snap); }); seenN = 0; fndN = 0; si = 0; n1.set('0'); n2.set('0'); curSec = ''; A.set(0); ea.go(0, vh*ky); say('Starting the page review again');
      q.at(now() + 1, step);
    };
    rp.onclick = restart;
    sc.scrollTop = 0; build(); n1.set('0', true); n2.set('0', true); ss.put('Review agent is at the top of the page', true); ea.jump(0, vh*ky); q.at(now() + .8, step);
    return t => {
      q.run(t);
      if (t - lastLay > .25){ lastLay = t; const key = size(sc).cw + ':' + sc.scrollHeight + ':' + size(sc).ch + ':' + (size(mp).ch - 12); if (key !== lastKey) build(); }
      if (anim){ const v = u.at(t); sc.scrollTop = v; if (Math.abs(v - u.target) < .4 && !u.ev.length) anim = false; }
      const a = A.at(t);
      // which bands has the agent covered?
      const bh = ph/NB;
      for (let i = 0; i < NB; i++){ const b = bands[i], c = (i + .5)*bh; if (!b.on && c >= a && c <= a + vh){ b.on = true; b.f.set(1); seenN++; n1.set(String(Math.round(seenN/NB*100))); } b.el.style.transform = `scaleX(${clamp(b.f.at(t)).toFixed(3)})`; }
      finds.forEach((f, i) => { if (!f.on && f.y >= a + 24 && f.y <= a + vh - 24){ f.on = true; q.at(now() + .55, () => { f.o.set(1); fndN++; n2.set(String(fndN)); say(`${AG} saved finding ${i + 1}: ${AM_FIND[i]}`); }); }
        const o = clamp(f.o.at(t)); pins[i].style.opacity = o.toFixed(3); pins[i].style.transform = `translateY(${px((1 - o)*-8)})`; f.tk.style.opacity = o.toFixed(3); });
      const sec = secOf(a + vh*.35); if (sec !== curSec){ curSec = sec; ss.put(`${AG} is reading ${sec}`); }
      // windows on the map
      const t1 = ea.A.at(t), b1 = ea.B.at(t); wa.style.top = px(t1); wa.style.height = px(Math.max(4, b1 - t1));
      const su = sc.scrollTop; wu.style.top = px(su*ky); wu.style.height = px(Math.max(6, vh*ky)); wu.setAttribute('aria-valuenow', Math.round(su/Math.max(1, maxS())*100)); wu.setAttribute('aria-valuetext', `${Math.round(su/Math.max(1, maxS())*100)} percent down the page`);
      const chipY = clamp(t1 + 6, 6, Math.max(6, mh - 16)); agL.style.transform = `translate(${px(-(size(mp).w + 6))},${px(chipY)})`; agL.style.left = 'auto'; agL.style.right = '0px';
      // section chips
      chips.forEach(c => { let s = 0, n = 0; for (let i = 0; i < NB; i++){ const cy = (i + .5)*bh; if (cy >= c.lo && cy < c.hi){ s += clamp(bands[i].f.at(t)); n++; } } const fr = n ? s/n : 0; c.fr = fr; c.fill.style.transform = `scaleX(${fr.toFixed(3)})`;
        const full = fr > .985; if (full !== (c.full.target === 1)) c.full.set(full ? 1 : 0); const fp = clamp(c.full.at(t)); c.ck.style.width = px(fp*13); c.ck.style.opacity = fp.toFixed(3); c.b.style.borderStyle = fr > .02 ? 'solid' : 'dashed'; c.b.style.borderColor = mix(clamp(fr*3), 'var(--line)', 'var(--line)'); c.b.style.color = mix(clamp(fr*2), 'var(--ink)', 'var(--muted)'); });
      ss.render(t); n1.render(t); n2.render(t);
    };
  }});

})();