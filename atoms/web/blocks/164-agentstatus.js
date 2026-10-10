

/* ---------- Agent activity (organisms): supervising an agent that is doing things ---------- */
(() => {
const gEl = (tag, css, text) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; };
const gPush = (q, t, fn) => { q.push([t, fn]); q.sort((a, b) => a[0] - b[0]); };
const gDrain = (q, t) => { while (q.length && q[0][0] <= t) q.shift()[1](); };
const gBlend = (ws, cols) => { let c = cols[0], a = Math.max(ws[0], 0); for (let k = 1; k < cols.length; k++){ const w = Math.max(ws[k], 0); a += w; if (w > .002) c = `color-mix(in oklab, ${cols[k]} ${(w/a*100).toFixed(1)}%, ${c})`; } return c; };
const wsum = (ws, vals) => ws.reduce((a, w, i) => a + Math.max(w, 0)*vals[i], 0) / Math.max(1e-6, ws.reduce((a, w) => a + Math.max(w, 0), 0));
const SPIN = d => ic('<path d="M12 3a9 9 0 0 1 9 9"/>', d, 2.5);
const SR = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
const gfmt = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s/60) + ':' + String(s%60).padStart(2, '0'); };
const G = {
  send:'<path d="M4 12 20 4l-4 16-4-7z"/><path d="m12 13 8-9"/>',
  check:I.check, x:I.x, chev:I.chev,
  nav:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  click:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  type:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>',
  comment:'<path d="M4 5h16v11H9l-5 4z"/>',
  shot:'<path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3"/><circle cx="12" cy="12" r="3"/>',
  pause:'<path d="M8 5v14M16 5v14"/>', play:'<path d="M7 4.5v15l12-7.5z"/>',
  tri:'<path d="M12 4 3 20h18z"/><path d="M12 10v4M12 17h.01"/>',
  ask:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5M12 17h.01"/>',
  ring:'<circle cx="12" cy="12" r="6.5"/>', dot:'<circle cx="12" cy="12" r="3" fill="currentColor"/>',
  dots:'<circle cx="6" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="18" cy="12" r="1.8" fill="currentColor"/>',
  cursor:'<path d="M5 3l14 7-6 2-2.2 6.5z" fill="currentColor"/>',
  hand:'<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10M12 10V4.5a1.5 1.5 0 0 1 3 0V10M15 10V6a1.5 1.5 0 0 1 3 0v7.5c0 4-2.5 7-6.5 7-3 0-4.5-1.5-6-4l-1.8-3.2a1.5 1.5 0 0 1 2.6-1.5L9 14z"/>',
  retry:'<path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5"/>', skip:'<path d="M5 5.5v13l9-6.5zM18 5v14"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', dash:'<path d="M7 12h10"/>', lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>', trash:'<path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13"/>',
  bolt:'<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>', speed:'<path d="M5 6l7 6-7 6zM13 6l7 6-7 6z"/>', back:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
};
const gi = (k, s = 16, w = 2) => ic(G[k], s, w);
const KIND = { nav:{ ic:'nav', l:'Navigation' }, click:{ ic:'click', l:'Clicks' }, type:{ ic:'type', l:'Typing' }, comment:{ ic:'comment', l:'Comments' }, shot:{ ic:'shot', l:'Screenshots' } };
// two stacked text layers that Swap
const gText = (host, css = '') => {
  const s = [0, 1].map(() => { const e = gEl('span', 'position:absolute;left:0;top:0;white-space:nowrap;' + css); host.appendChild(e); return e; });
  const sw = new Swap(0); let k = 0, cur = null;
  return { s, get k(){ return k; }, get text(){ return cur; }, put(text, instant){ if (text === cur) return; cur = text;
      if (instant){ s[k].textContent = text; sw.cur = k; sw.prev = null; sw.t = -9; return; }
      k ^= 1; s[k].textContent = text; sw.to(k); },
    render(t){ s.forEach((e, i) => sw.apply(e, i, t)); } };
};
// a label that swaps text and springs its own width to the measured text
const gLabel = (host, css = '') => {
  host.style.cssText += ';position:relative;display:block;overflow:hidden;white-space:nowrap;flex:none;height:20px';
  const tx = gText(host, 'line-height:20px;' + css), w = new Track(0); let cur = null, dirty = true;
  const meas = text => measureW(tx.s[tx.k], text);
  const o = { host, tx, w, get w0(){ return w.target; },
    put(text, inst){ cur = text; tx.put(text, inst); if (!text){ inst ? w.jump(0) : w.set(0); dirty = false; return; } const m = meas(text); if (!m) dirty = true; const v = m || text.length*6.6; inst ? w.jump(v) : w.set(v); },
    render(t){ if (dirty && cur && host.offsetParent){ const m = meas(cur); if (m){ w.jump(m); dirty = false; } }
      host.style.width = px(Math.max(0, w.at(t))); tx.render(t); } };
  return o;
};
// a collapsing slot: content fades first, then the height closes; opening grows the height, then the content arrives
const gSlot = (host, inner, open = 0) => {
  host.style.overflow = 'hidden';
  const o = { h:new Track(open), a:new Track(open),
    open(v, t = now(), lag = 0){ if (v){ o.h.set(1, S.base, t + lag); o.a.set(1, S.base, t + lag + .08); } else { o.a.set(0, S.snap, t); o.h.set(0, S.base, t + EXIT); } },
    jump(v){ o.h.jump(v ? 1 : 0); o.a.jump(v ? 1 : 0); },
    get on(){ return o.h.target === 1; },
    render(t){ const h = clamp(o.h.at(t)), a = clamp(o.a.at(t));
      host.style.height = h > .9995 && o.h.target === 1 ? 'auto' : px(h*inner.offsetHeight);
      const hid = h < .004 && a < .004; host.style.visibility = hid ? 'hidden' : 'visible'; host.inert = o.h.target === 0;
      fade(inner, a, null); } };
  return o;
};
// follow an element's natural height, easing from the previous height when the element changes
const gFollow = host => {
  const f = { cur:null, off:new Track(0), h:0,
    to(el, inst){ const old = f.h; f.cur = el; if (!inst){ f.off.jump(old - el.offsetHeight); f.off.set(0, S.base); } },
    render(t){ if (!f.cur) return; f.h = Math.max(0, f.cur.offsetHeight + f.off.at(t)); host.style.height = px(f.h); } };
  return f;
};
const gBtn = (txt, cls = '', css = '') => { const b = gEl('button', css, txt); b.type = 'button'; b.className = 'btn ' + cls; return b; };
// the agent cursor and the human cursor (tone: ink or accent)
const gCursor = (host, label, tone) => {
  const bg = tone === 'accent' ? 'var(--accent)' : 'var(--ink)';
  const el = gEl('div', 'position:absolute;left:0;top:0;pointer-events:none;z-index:8;visibility:hidden');
  el.innerHTML = `<svg width="18" height="20" viewBox="0 0 18 20" style="display:block"><path d="M2 1.5 15.5 9l-6 1.8L6.8 17z" fill="${bg}" stroke="var(--card)" stroke-width="1.5" stroke-linejoin="round"/></svg><span style="position:absolute;left:13px;top:15px;white-space:nowrap;padding:0 7px;height:18px;line-height:18px;border-radius:9px;font-size:11px;font-weight:600;background:${bg};color:var(--card)">${label}</span>`;
  host.appendChild(el);
  const o = { el, X:new Track(0, S.soft), Y:new Track(0, S.soft), W:new Track(0),
    go(x, y, inst, cfg = S.soft){ if (inst){ o.X.jump(x); o.Y.jump(y); } else { o.X.set(x, cfg); o.Y.set(y, cfg); } return o; },
    show(v, inst){ inst ? o.W.jump(v ? 1 : 0) : o.W.set(v ? 1 : 0, S.base); return o; },
    pos(t = now()){ return { x:o.X.at(t), y:o.Y.at(t) }; },
    set label(s){ el.lastChild.textContent = s; },
    render(t){ const w = clamp(o.W.at(t)); el.style.transform = `translate(${px(o.X.at(t) - 2)},${px(o.Y.at(t) - 1.5)}) scale(${(.9 + .1*w).toFixed(3)})`; el.style.opacity = w.toFixed(3); el.style.visibility = w < .01 ? 'hidden' : 'visible'; } };
  return o;
};
// a highlight ring: leading edge first, trailing edge lags
const gRing = (host, pad = 4) => {
  const el = gEl('div', 'position:absolute;left:0;top:0;pointer-events:none;border:2px solid var(--accent);border-radius:8px;z-index:6;visibility:hidden');
  host.appendChild(el);
  const ex = edges(0, 0), ey = edges(0, 0), W = new Track(0);
  const o = { el, W,
    to(r, inst){ const a = r.x - pad, b = r.x + r.w + pad, c = r.y - pad, d = r.y + r.h + pad; const jump = inst || W.target === 0;
      if (jump){ ex.jump(a, b); ey.jump(c, d); } else { ex.go(a, b); ey.go(c, d); } W.set(1, S.base); },
    hide(){ W.set(0, S.snap); },
    render(t){ const w = clamp(W.at(t)); const a = ex.A.at(t), b = ex.B.at(t), c = ey.A.at(t), d = ey.B.at(t);
      el.style.transform = `translate(${px(a)},${px(c)})`; el.style.width = px(Math.max(0, b - a)); el.style.height = px(Math.max(0, d - c));
      el.style.opacity = w.toFixed(3); el.style.visibility = w < .01 ? 'hidden' : 'visible'; } };
  return o;
};

/* ================================================================ faux page (shared by feed, takeover, replay, inline approval) */
const gPageCSS = k => `
.${k}-fr{position:relative;display:flex;flex-direction:column;width:100%;max-width:600px;border-radius:12px;background:var(--card);overflow:hidden;box-shadow:var(--shadow);flex:none}
.${k}-bar{flex:none;height:32px;display:flex;align-items:center;gap:9px;padding:0 10px;background:var(--raised);border-bottom:1px solid var(--line)}
.${k}-dots{display:flex;gap:5px;flex:none}.${k}-dots i{width:8px;height:8px;border-radius:50%;background:var(--faint);opacity:.5}
.${k}-url{flex:1;min-width:0;height:22px;border-radius:11px;background:var(--card);display:flex;align-items:center;gap:6px;padding:0 10px;color:var(--muted);font:11.5px/22px var(--mono);overflow:hidden;white-space:nowrap}
.${k}-url>svg{flex:none;opacity:.7}.${k}-up{position:relative;display:block;height:22px;flex:1;min-width:0;overflow:hidden}
.${k}-bnw{flex:none;overflow:hidden;height:0}
.${k}-vp{position:relative;flex:1;min-height:0;overflow:hidden;background:var(--card)}
.${k}-in{position:absolute;left:0;top:0;width:360px;height:250px;transform-origin:0 0;font:12px/1.35 var(--sans);color:var(--ink)}
.${k}-v{position:absolute;inset:0}
.${k}-nav{height:34px;display:flex;align-items:center;gap:14px;padding:0 14px;border-bottom:1px solid var(--line-soft);color:var(--muted);font-size:11.5px}
.${k}-nav b{display:flex;align-items:center;gap:6px;color:var(--ink);font-size:12.5px;margin-right:auto}.${k}-nav b i{width:14px;height:14px;border-radius:4px;background:var(--ink);display:block}
.${k}-bd{padding:12px 14px}
.${k}-h{margin:0;font-size:17px;line-height:22px;letter-spacing:-.015em;font-weight:600}
.${k}-p{margin:2px 0 0;color:var(--muted);font-size:12px;line-height:17px}
.${k}-tg{position:relative;display:inline-flex;margin-top:9px;background:var(--raised);border-radius:8px;padding:2px}
.${k}-tg span{position:relative;width:62px;text-align:center;font-size:11.5px;line-height:20px;font-weight:500}
.${k}-tg i{position:absolute;left:2px;top:2px;width:62px;height:20px;border-radius:6px;background:var(--card);box-shadow:var(--shadow)}
.${k}-plans{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
.${k}-pl{background:var(--raised);border-radius:9px;padding:8px 10px;display:flex;flex-direction:column;gap:2px;font-size:11px;color:var(--muted)}
.${k}-pl b{font-size:12px;color:var(--ink)}
.${k}-pr{font-size:17px;line-height:22px;font-weight:600;color:var(--ink);letter-spacing:-.02em}.${k}-pr small{font-size:10.5px;font-weight:400;color:var(--muted);letter-spacing:0}
.${k}-bt{margin-top:5px;height:24px;border-radius:7px;background:var(--raised);color:var(--ink);display:grid;place-items:center;font-size:11.5px;font-weight:600;border:0;font-family:inherit;padding:0;width:100%}
.${k}-bt.pri{background:var(--ink);color:var(--card);height:28px;font-size:12px;margin-top:10px}
.${k}-bt.dg{background:var(--danger);color:#fff;width:auto;padding:0 12px;height:26px;margin-top:0}
.${k}-fl{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}
.${k}-fl label{display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:500;color:var(--muted)}.${k}-fl label.w{grid-column:1/-1}
.${k}-fl input{height:26px;border:1.5px solid var(--muted);border-radius:6px;background:var(--card);padding:0 8px;font:12px var(--sans);color:var(--ink);width:100%;min-width:0;pointer-events:none}
.${k}-fl input::placeholder{color:var(--muted)}
.${k}-edit .${k}-fl input{pointer-events:auto}
.${k}-dn{display:flex;flex-direction:column;align-items:center;text-align:center;padding:34px 20px 0}
.${k}-ok{width:40px;height:40px;border-radius:50%;background:var(--success-tint);color:var(--success);display:grid;place-items:center;margin-bottom:8px}
.${k}-rw{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--line-soft);font-size:12px;color:var(--muted)}.${k}-rw b{font-weight:500;color:var(--ink)}
.${k}-dz{margin-top:10px;background:var(--danger-tint);border-radius:9px;padding:10px 11px;display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:11.5px;line-height:16px;color:var(--muted)}.${k}-dz b{display:block;color:var(--danger);font-size:12px}
.${k}-ov{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.${k}-pin{position:absolute;left:0;top:0;width:20px;height:20px;border-radius:10px;background:var(--accent);color:var(--card);display:grid;place-items:center;z-index:7;visibility:hidden}
.${k}-fs{position:absolute;inset:0;background:var(--card);opacity:0;z-index:9}.${k}-fv{position:absolute;inset:6px;border:2px solid var(--ink);border-radius:8px;opacity:0;z-index:9}`;
const gPageHTML = (k, opt = {}) => `<div class="${k}-fr" role="group" aria-label="${opt.label || 'Page the agent is working on'}"><div class="${k}-bar"><span class="${k}-dots"><i></i><i></i><i></i></span><div class="${k}-url" data-s="url">${gi('lock', 11, 2)}<span>northwind.app</span><span class="${k}-up"></span></div></div><div class="${k}-bnw"></div><div class="${k}-vp"><div class="${k}-in">
<div class="${k}-v" data-v="pricing"><div class="${k}-nav"><b><i></i>Northwind</b><span>Docs</span><span>Pricing</span><span>Sign in</span></div><div class="${k}-bd"><h5 class="${k}-h">Simple pricing for small teams</h5><p class="${k}-p">Invoices, payments and reports. Cancel any time.</p><div class="${k}-tg" data-s="toggle"><i></i><span>Monthly</span><span>Yearly</span></div>
<div class="${k}-plans"><div class="${k}-pl"><b>Free</b><span class="${k}-pr">$0</span>1 workspace<span class="${k}-bt" data-s="start">Start free</span></div><div class="${k}-pl"><b>Team</b><span class="${k}-pr"><i style="font-style:normal" data-p="team">$24</i><small>/user</small></span>Unlimited use<span class="${k}-bt">Start trial</span></div><div class="${k}-pl"><b>Business</b><span class="${k}-pr"><i style="font-style:normal" data-p="biz">$48</i><small>/user</small></span>Audit log, SSO<span class="${k}-bt">Contact sales</span></div></div></div></div>
<div class="${k}-v" data-v="signup"><div class="${k}-nav"><b><i></i>Northwind</b><span>Docs</span><span>Pricing</span><span>Sign in</span></div><div class="${k}-bd"><h5 class="${k}-h">Create your account</h5><p class="${k}-p">14 days free. No card needed.</p><div class="${k}-fl"><label class="w">Work email<input data-s="email" readonly tabindex="-1" aria-label="Work email" placeholder="you@company.com" autocomplete="off"></label><label>Company<input data-s="company" readonly tabindex="-1" aria-label="Company" placeholder="Company name" autocomplete="off"></label><label>Team size<input data-s="size" readonly tabindex="-1" aria-label="Team size" placeholder="Select size" autocomplete="off"></label></div><button type="button" tabindex="-1" class="${k}-bt pri" data-s="create">Create account</button></div></div>
<div class="${k}-v" data-v="done"><div class="${k}-nav"><b><i></i>Northwind</b><span>Docs</span><span>Pricing</span><span>Sign in</span></div><div class="${k}-dn"><span class="${k}-ok">${gi('check', 20, 2.4)}</span><h5 class="${k}-h">Check your inbox</h5><p class="${k}-p">We sent a confirmation link to <span data-m="email">maya@northwind.com</span>.</p></div></div>
<div class="${k}-v" data-v="settings"><div class="${k}-nav"><b><i></i>Northwind</b><span>Billing</span><span>Members</span><span>Settings</span></div><div class="${k}-bd"><h5 class="${k}-h">Workspace settings</h5><div style="margin-top:8px"><div class="${k}-rw">Workspace<b>Northwind Studio</b></div><div class="${k}-rw">Billing email<b>maya@northwind.com</b></div></div><div class="${k}-dz"><span><b>Delete workspace</b>Removes 214 invoices and 18 clients for everyone.</span><button type="button" tabindex="-1" class="${k}-bt dg" data-s="delete">Delete</button></div></div></div>
<div class="${k}-v" data-v="gone"><div class="${k}-nav"><b><i></i>Northwind</b><span>Billing</span><span>Members</span><span>Settings</span></div><div class="${k}-dn"><span class="${k}-ok" style="background:var(--danger-tint);color:var(--danger)">${gi('trash', 19, 2)}</span><h5 class="${k}-h">Workspace deleted</h5><p class="${k}-p">Northwind Studio and its data were removed.</p></div></div>
</div></div><div class="${k}-ov"><div class="${k}-fs"></div><div class="${k}-fv"></div></div></div>`;
const gPage = (root, k) => {
  const fr = $(root, `.${k}-fr`), vp = $(fr, `.${k}-vp`), inn = $(fr, `.${k}-in`), ov = $(fr, `.${k}-ov`), urlEl = $(fr, `.${k}-url`), bnw = $(fr, `.${k}-bnw`), barEl = $(fr, `.${k}-bar`);
  const V = {}; $$(fr, `.${k}-v`).forEach(e => V[e.dataset.v] = e);
  const sw = new Swap('pricing'), up = gText($(fr, `.${k}-up`), 'font:11.5px/22px var(--mono)'); up.put('/pricing', true);
  const tgEl = $(fr, `.${k}-tg`), tgI = $(tgEl, 'i'), tg = new Track(0), fs = $(fr, `.${k}-fs`), fv = $(fr, `.${k}-fv`);
  const fl = {}; $$(fr, 'input[data-s]').forEach(e => fl[e.dataset.s] = { e, full:'', t0:-9, mode:'set', shown:null });
  const pins = {}; let scale = 1, flashT = -9, flashV = null, frameH = 0, curView = 'pricing';
  const spot = n => n === 'url' ? urlEl : n === 'page' ? vp : $(fr, `[data-s="${n}"]`);
  const o = { fr, ov, vp, bnw, bar:barEl, get scale(){ return scale; }, get view(){ return curView; },
    rect(n){ const el = spot(n); if (!el) return { x:0, y:0, w:0, h:0 }; const r = el.getBoundingClientRect(), f = fr.getBoundingClientRect(); return { x:r.left - f.left - fr.clientLeft, y:r.top - f.top - fr.clientTop, w:r.width, h:r.height }; },
    center(n){ const r = o.rect(n); return { x:r.x + r.w*.5, y:r.y + r.h*.5 }; },
    view(v, inst){ curView = v; if (inst){ sw.cur = v; sw.prev = null; sw.t = -9; } else sw.to(v); },
    url(path, inst){ up.put(path, inst); },
    type(n, text, t0 = now(), rate = 15){ const f = fl[n]; f.full = text; f.t0 = t0; f.mode = 'type'; f.rate = rate; },
    freeze(n){ const f = fl[n]; if (f.mode === 'type'){ f.full = f.shown; f.mode = 'set'; } },
    typed(n){ return fl[n].shown || ''; },
    set(n, text){ const f = fl[n]; f.full = text; f.mode = 'set'; },
    text(n){ return fl[n].shown || ''; },
    clear(){ for (const n in fl){ fl[n].full = ''; fl[n].mode = 'set'; } tg.jump(0); o.price(false); Object.values(pins).forEach(p => p.W.set(0, S.snap)); },
    toggle(v, inst){ inst ? tg.jump(v ? 1 : 0) : tg.set(v ? 1 : 0, S.base); o.price(v); },
    price(y){ $(fr, '[data-p="team"]').textContent = y ? '$20' : '$24'; $(fr, '[data-p="biz"]').textContent = y ? '$40' : '$48'; },
    pin(key, name, on, inst){ let p = pins[key]; if (!p){ const e = gEl('span'); e.className = `${k}-pin`; e.innerHTML = gi('comment', 11, 2.4); ov.appendChild(e); p = pins[key] = { e, W:new Track(0), name }; } p.name = name; inst ? p.W.jump(on ? 1 : 0) : p.W.set(on ? 1 : 0, on ? S.base : S.snap); },
    flash(t = now()){ flashT = t; },
    flashSet(v){ flashV = v; },
    editable(v){ fr.classList.toggle(`${k}-edit`, v); for (const n in fl){ fl[n].e.readOnly = !v; fl[n].e.tabIndex = v ? 0 : -1; } },
    mirror(){ $$(fr, '[data-m="email"]').forEach(e => e.textContent = fl.email.shown || 'maya@northwind.com'); },
    render(t){
      const w = vp.clientWidth; if (w > 10){ const s = Math.min(w/360, 1.7); if (Math.abs(s - scale) > .001){ scale = s; inn.style.transform = `scale(${s.toFixed(4)})`; } }
      const need = Math.round(32 + 1 + 250*scale + 2); if (need !== frameH){ frameH = need; fr.style.height = need + 'px'; }
      for (const n in V) sw.apply(V[n], n, t, 4);
      for (const n in V) V[n].style.pointerEvents = n === sw.cur ? 'auto' : 'none';
      up.render(t);
      for (const n in fl){ const f = fl[n]; let s = f.full; if (f.mode === 'type') s = f.full.slice(0, Math.max(0, Math.floor((t - f.t0)*f.rate))); if (s !== f.shown){ f.shown = s; f.e.value = s; } }
      tgI.style.transform = `translateX(${px(clamp(tg.at(t))*62)})`;
      for (const key in pins){ const p = pins[key], wv = clamp(p.W.at(t)); const r = o.rect(p.name); p.e.style.transform = `translate(${px(r.x + r.w - 17)},${px(r.y - 8)}) scale(${(.8 + .2*wv).toFixed(3)})`; p.e.style.opacity = wv.toFixed(3); p.e.style.visibility = wv < .01 ? 'hidden' : 'visible'; }
      const fp = clamp((t - flashT)/.7), fo = flashV != null ? flashV : (fp > 0 && fp < 1 ? 1 - fp : 0); fs.style.opacity = (fo*.55).toFixed(3); fv.style.opacity = Math.min(1, fo*3).toFixed(3);
    } };
  o.editable(false); return o;
};

/* ================================================================ 1. Agent status */
atom({ id:'agentstatus', cat:'Agent activity', name:'Agent status pill', block:'Agent run status · header', fam:['M','S','T'], wide:true, tall:true,
  html:`<style>
.as1-root{position:absolute;inset:0;container-type:inline-size;padding:12px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.as1-card{flex:none;background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:14px}
.as1-hd{display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px}
.as1-id{display:flex;align-items:center;gap:10px;min-width:0;flex:1 1 230px}
.as1-av{flex:none;width:36px;height:36px;border-radius:10px;background:var(--ink);color:var(--card);display:grid;place-items:center}
.as1-id h4{margin:0;font-size:14px;line-height:20px;font-weight:600}
.as1-sb{position:relative;height:18px;font-size:12.5px;color:var(--muted);min-width:0}
.as1-rt{display:flex;align-items:center;gap:10px;flex:none;max-width:100%}
.as1-pill{display:inline-flex;align-items:center;height:34px;padding:0 12px 0 8px;max-width:100%;overflow:hidden;white-space:nowrap;border-style:solid;font-size:13px;font-weight:600;flex:none}
.as1-ico{position:relative;flex:none;width:20px;height:20px;margin-right:7px}
.as1-tmw{overflow:hidden;flex:none;opacity:.85;font-weight:500}.as1-tmi{display:inline-flex;padding-left:10px}
.as1-bt{position:relative;height:34px;padding:0;flex:none;overflow:hidden}
.as1-a2{display:none;overflow:hidden;height:0}.as1-a2i{display:flex;align-items:center;gap:8px;height:30px;padding-top:12px;font-size:12.5px;color:var(--muted)}.as1-a2i svg{flex:none}
.as1-a2t{position:relative;flex:1;height:18px}
.as1-pk{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:14px}
.as1-pk button{display:flex;align-items:center;gap:7px;min-width:0;padding:6px 8px;border:0;border-radius:10px;background:var(--raised);cursor:pointer;font-size:12.5px;font-weight:500;text-align:left}
.as1-gl{flex:none;width:24px;height:24px;display:grid;place-items:center}
.as1-pk span.as1-pn{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;min-width:0}
.as1-cap{margin:12px 0 0;font-size:12.5px;line-height:18px;color:var(--muted)}
.as1-hh{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px}.as1-hh h4{margin:0;font-size:13px;font-weight:600}.as1-hh span{font-size:12px;color:var(--muted)}
.as1-ls{list-style:none;margin:0;padding:0}
.as1-li{border-top:1px solid var(--line-soft)}.as1-li:first-child{border-top:0}
.as1-rw{display:grid;grid-template-columns:24px 112px minmax(0,1fr) auto;align-items:center;gap:0 10px;padding:7px 0;font-size:13px;line-height:20px}
.as1-rw .as1-ac{color:var(--muted);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;min-width:0}.as1-rw .as1-dr{color:var(--muted);font-size:12.5px}
@container (max-width:600px){.as1-pk{grid-template-columns:repeat(3,minmax(0,1fr))}.as1-pill .as1-ac2{display:none!important}.as1-a2{display:block}.as1-rt{flex:1 1 100%;justify-content:space-between}.as1-rw{grid-template-columns:24px minmax(0,1fr) auto}.as1-rw .as1-ac{display:none}}
@container (max-width:420px){.as1-pk{grid-template-columns:repeat(2,minmax(0,1fr))}.as1-pk button{font-size:12px;gap:6px;padding:6px 5px}.as1-pk .as1-gl{width:22px!important;height:22px!important}}
</style>
<div class="as1-root"><div class="as1-card"><div class="as1-hd"><div class="as1-id"><span class="as1-av">${ic('<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9.5 13h.01M14.5 13h.01"/>', 19, 1.9)}</span><div style="min-width:0;flex:1"><h4>Northwind agent</h4><div class="as1-sb"></div></div></div>
<div class="as1-rt"><div class="as1-pill"><span class="as1-ico"></span><span class="as1-lb"></span><span class="as1-ac2"></span><span class="as1-tmw"><span class="as1-tmi"><span class="as1-m"></span>:<span class="as1-s"></span></span></span></div><button type="button" class="btn as1-bt"></button></div></div>
<div class="as1-a2"><div class="as1-a2i">${ic(G.cursor, 14, 2)}<span class="as1-a2t"></span></div></div>
<div class="as1-pk" role="group" aria-label="Preview an agent state"></div><p class="as1-cap">Pick a state to preview it, or let the sample run play. The pill changes shape and icon as well as color.</p></div>
<div class="as1-card"><div class="as1-hh"><h4>Recent states</h4><span>Newest first</span></div><ul class="as1-ls" aria-label="Recent agent states, newest first"></ul></div>
<div class="as1-live" role="status" aria-live="polite" style="${SR}"></div></div>`,
  desc:'One pill carries the whole run. On every change the shape morphs first (pill, rounded box, square, notched), the icon swaps, the label swaps and its width springs, and the action text grows out of the pill when there is one. Border weight and color blend with it, so state never relies on color alone. The elapsed timer restarts with rolling digits, and the button beside it swaps to the next sensible action.',
  api:'pill.r = Σ wᵢ·rᵢ   label.swap(state) → width.set(measure)   action.w.set(text ? measure : 0)   timer.digits.set(m:ss)   button.swap(Start | Pause | Review | Resume | Retry)',
  init(st){
    const ST = [
      { k:'idle', l:'Idle', ic:'ring', r:17, bw:1, bg:'var(--raised)', fg:'var(--muted)', bd:'var(--line)', sub:'Nothing is running', btn:'Start task', canned:'' },
      { k:'think', l:'Thinking', ic:'dots', r:17, bw:1, bg:'var(--accent-tint)', fg:'var(--accent)', bd:'var(--accent-tint)', sub:'Planning the next step', btn:'Pause', canned:'' },
      { k:'act', l:'Acting', ic:'cursor', r:17, bw:1, bg:'var(--ink)', fg:'var(--card)', bd:'var(--ink)', sub:'Working on the page', btn:'Pause', canned:'Clicking “Start free”' },
      { k:'wait', l:'Waiting for you', ic:'ask', r:9, bw:1.5, bg:'var(--warning-tint)', fg:'var(--warning)', bd:'var(--warning)', sub:'Needs your approval to go on', btn:'Review', canned:'Submit the signup form?' },
      { k:'pause', l:'Paused', ic:'pause', r:5, bw:1.5, bg:'var(--card)', fg:'var(--ink)', bd:'var(--ink)', sub:'You paused this run', btn:'Resume', canned:'' },
      { k:'err', l:'Error', ic:'tri', r:2, bw:1.5, bg:'var(--danger-tint)', fg:'var(--danger)', bd:'var(--danger)', sub:'Stopped. Retry or take over', btn:'Retry', canned:'Page did not respond (504)' } ];
    const SCRIPT = [
      { s:1, a:'Planning the signup', d:1.8 }, { s:2, a:'Opening northwind.app/pricing', d:1.7 }, { s:2, a:'Typing in the email field', d:1.9 },
      { s:3, a:'Submit the signup form?', d:0 }, { s:2, a:'Submitting the form', d:1.6 }, { s:5, a:'Page did not respond (504)', d:0, once:true },
      { s:2, a:'Reading the confirmation email', d:1.9 }, { s:0, a:'', d:0 } ];
    const pill = $(st,'.as1-pill'), icoH = $(st,'.as1-ico'), live = $(st,'.as1-live'), btn = $(st,'.as1-bt'), pk = $(st,'.as1-pk'), ls = $(st,'.as1-ls'), a2 = $(st,'.as1-a2');
    const lb = gLabel($(st,'.as1-lb')), ac = gLabel($(st,'.as1-ac2')), sb = gText($(st,'.as1-sb'), 'line-height:18px'), a2t = gText($(st,'.as1-a2t'), 'line-height:18px');
    const bt = gLabel(gEl('span','top:0;height:32px;line-height:32px'), 'line-height:32px;top:0;left:0;right:0;text-align:center'); btn.appendChild(bt.host); bt.host.style.margin = '0 14px'; bt.host.style.height = '32px';
    const tmw = $(st,'.as1-tmw'), tmi = $(st,'.as1-tmi'), dm = new Digits($(st,'.as1-m'), 1), ds = new Digits($(st,'.as1-s'), 2);
    const W = ST.map(() => new Track(0)), tmF = new Track(0), a2F = new Track(0), isw = new Swap(0);
    const layers = ST.map(s => { const e = gEl('span', 'position:absolute;inset:0;display:grid;place-items:center');
      e.innerHTML = s.k === 'think' ? `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">${[6,12,18].map(x => `<circle class="as1-d" cx="${x}" cy="12" r="2" fill="currentColor"/>`).join('')}</svg>` : gi(s.ic, 18, 2); icoH.appendChild(e); return e; });
    const dots = $$(layers[1], '.as1-d');
    const glyph = (s, sz = 24) => `<span class="as1-gl" style="width:${sz}px;height:${sz}px;border-radius:${Math.min(sz/2, s.r*sz/34).toFixed(1)}px;background:${s.bg};color:${s.fg};box-shadow:inset 0 0 0 ${s.bw}px ${s.bd}">${gi(s.ic, sz*.62, 2.2)}</span>`;
    const pks = ST.map((s, i) => { const b = gEl('button'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.innerHTML = `${glyph(s)}<span class="as1-pn">${s.l}</span>`; pk.appendChild(b); b.onclick = () => pick(i); return { b, w:new Track(0) }; });
    let rt = 0, last = null, cur = -1, action = '', since = 0, tsec = -1, script = -1, sc = 0, errOnce = false, saved = null;
    const rows = [], q = [];
    const say = s => { live.textContent = s; };
    const addRow = (n, a) => {
      const li = gEl('li'); li.className = 'as1-li'; li.innerHTML = `<div class="as1-rwi"><div class="as1-rw">${glyph(ST[n])}<b style="font-weight:600">${ST[n].l}</b><span class="as1-ac"></span><span class="as1-dr num"></span></div></div>`;
      $(li,'.as1-ac').textContent = a || '—'; const r = { li, dr:$(li,'.as1-dr'), slot:gSlot(li, $(li,'.as1-rwi'), 0), t0:rt, n, txt:'' };
      ls.insertBefore(li, ls.firstChild); r.slot.open(true); rows.unshift(r);
      while (rows.length > 6){ const o = rows.pop(); o.slot.open(false); o.dead = true; gPush(q, now() + .5, () => { o.li.remove(); const k = rows.indexOf(o); if (k >= 0) rows.splice(k, 1); }); }
    };
    const setState = (n, a = '', inst) => {
      if (n === cur && a === action) return;
      const first = cur < 0; cur = n; action = a; const s = ST[n];
      W.forEach((w, i) => inst || first ? w.jump(i === n ? 1 : 0) : w.set(i === n ? 1 : 0, S.base));
      isw.to(n); if (inst || first){ isw.cur = n; isw.prev = null; isw.t = -9; }
      lb.put(s.l, inst || first); sb.put(s.sub, inst || first);
      const txt = a && n !== 1 ? ' · ' + a : ''; ac.put(txt, inst || first); a2t.put(a && n !== 1 ? a : '', inst || first);
      const hasA = !!(a && n !== 1), idle = n === 0; (inst || first ? a2F.jump(hasA ? 1 : 0) : a2F.set(hasA ? 1 : 0, S.base));
      (inst || first ? tmF.jump(idle ? 0 : 1) : tmF.set(idle ? 0 : 1, S.base)); bt.put(s.btn, inst || first);
      since = rt; tsec = -1; if (!first){ if (rows[0]) rows[0].dr.textContent = gfmt(rt - rows[0].t0); }
      addRow(n, a);
      pks.forEach((p, i) => { p.b.setAttribute('aria-pressed', i === n); inst || first ? p.w.jump(i === n ? 1 : 0) : p.w.set(i === n ? 1 : 0, S.base); });
      say(`Agent ${s.l.toLowerCase()}${a && n !== 1 ? ': ' + a : ''}`);
    };
    const go = i => { // enter script step i
      while (SCRIPT[i] && SCRIPT[i].once && errOnce) i++;
      script = i; sc = 0; const s = SCRIPT[i]; if (SCRIPT[i].once) errOnce = true; setState(s.s, s.a);
    };
    const pick = n => { script = -1; saved = null; setState(n, n === 4 ? (action || ST[2].canned) : ST[n].canned); };
    btn.onclick = () => {
      if (cur === 0){ errOnce = false; go(0); }
      else if (cur === 1 || cur === 2){ saved = { n:cur, a:action, script, sc }; setState(4, action || 'Clicking “Start free”'); }
      else if (cur === 3){ script >= 0 ? go(script + 1) : setState(2, 'Submitting the form'); }
      else if (cur === 4){ if (saved){ const sv = saved; saved = null; script = sv.script; sc = sv.sc; setState(sv.n, sv.a); } else setState(2, 'Resuming the run'); }
      else if (cur === 5){ script >= 0 ? go(script - 1) : setState(2, 'Retrying the request'); }
    };
    setState(0, '', true); lb.put('Idle', true);
    gPush(q, .5, () => { if (script < 0 && cur === 0 && !rows[1]) go(0); });
    dm.set('0', true); ds.set('00', true);
    return t => {
      gDrain(q, t);
      const dt = last == null ? 0 : Math.min(.1, Math.max(0, t - last)); last = t; rt += dt;
      if (script >= 0 && (cur === 1 || cur === 2)){ sc += dt; const s = SCRIPT[script]; if (s.d && sc >= s.d) go(script + 1); }
      const secs = Math.floor(rt - since); if (secs !== tsec){ tsec = secs; dm.set(String(Math.floor(secs/60))); ds.set(String(secs % 60).padStart(2, '0')); }
      const ws = W.map(w => w.at(t));
      pill.style.background = gBlend(ws, ST.map(s => s.bg)); pill.style.color = gBlend(ws, ST.map(s => s.fg)); pill.style.borderColor = gBlend(ws, ST.map(s => s.bd));
      pill.style.borderRadius = px(wsum(ws, ST.map(s => s.r))); pill.style.borderWidth = px(wsum(ws, ST.map(s => s.bw)));
      layers.forEach((e, i) => isw.apply(e, i, t, 0));
      dots.forEach((d, i) => d.style.opacity = (.3 + .7*(.5 + .5*Math.sin(Math.PI*2*(t*1.15 - i*.17)))).toFixed(3));
      lb.render(t); ac.render(t); sb.render(t); a2t.render(t); bt.render(t);
      btn.style.width = px(bt.w.at(t) + 28);
      tmw.style.width = px(clamp(tmF.at(t))*tmi.offsetWidth); tmw.style.opacity = (.85*clamp(tmF.at(t))).toFixed(3); dm.render(t); ds.render(t);
      a2.style.height = px(clamp(a2F.at(t))*30); a2.style.opacity = clamp(a2F.at(t)).toFixed(3);
      pks.forEach(p => { const w = clamp(p.w.at(t)); p.b.style.background = mix(w, 'var(--raised)', 'var(--card)'); p.b.style.borderColor = mix(w, 'var(--ink)', 'var(--line)'); });
      rows.forEach((r, i) => { r.slot.render(t); if (!r.dead){ const s = gfmt(i === 0 ? rt - r.t0 : (rows[i - 1].t0 - r.t0)); if (s !== r.txt){ r.txt = s; r.dr.textContent = s; } } });
    };
  }});

/* ================================================================ 2. Activity feed */
atom({ id:'activityfeed', cat:'Agent activity', name:'Agent activity feed', block:'Agent activity log · live feed', fam:['M','S','E','T'], wide:true, tall:true,
  html:`<style>
${gPageCSS('afp')}
.afd-root{position:absolute;inset:0;container-type:inline-size;padding:12px;display:flex;flex-direction:column;gap:10px}
.afd-top{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.afd-chs{display:flex;flex-wrap:wrap;gap:6px;flex:1 1 auto;min-width:0}
.afd-chs button{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 11px;border:0;border-radius:15px;background:var(--raised);cursor:pointer;font-size:12.5px;font-weight:500;white-space:nowrap}
.afd-chs button svg{flex:none}.afd-cn{opacity:.75;font-size:12px}
.afd-body{flex:1;min-height:0;display:flex;flex-direction:column;gap:10px}
.afd-fd{flex:1;min-height:0;min-width:0;display:flex;flex-direction:column;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:hidden}
.afd-fh{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line-soft);font-size:13px;font-weight:600}
.afd-fh span{font-size:12px;font-weight:400;color:var(--muted)}
.afd-ls{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;margin:0;padding:0;list-style:none;scrollbar-width:thin;position:relative}
.afd-g{border-bottom:1px solid var(--line-soft)}
.afd-hd,.afd-cr{display:flex;align-items:center;gap:10px;width:100%;border:0;background:none;text-align:left;cursor:pointer;color:inherit}
.afd-hd{padding:8px 12px;min-height:50px}
.afd-ic{flex:none;width:26px;height:26px;border-radius:13px;display:grid;place-items:center}
.afd-tx{flex:1;min-width:0}
.afd-t{position:relative;display:block;height:20px;font-size:13px;font-weight:600;overflow:hidden}
.afd-s{display:block;font-size:12px;line-height:17px;color:var(--muted);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.afd-nw{flex:none;overflow:hidden}.afd-n{display:inline-flex;align-items:center;justify-content:center;height:20px;min-width:22px;padding:0 6px;border-radius:10px;background:var(--raised);font-size:12px;font-weight:600}
.afd-tm{flex:none;font-size:12px;color:var(--muted)}
.afd-cv{flex:none;color:var(--muted);display:flex}
.afd-ch{overflow:hidden}.afd-cl{list-style:none;margin:0;padding:0 0 6px}
.afd-cr{padding:6px 12px 6px 48px;min-height:40px;font-size:12.5px}
.afd-cr svg{flex:none;color:var(--muted)}.afd-ct{flex:1;min-width:0}.afd-ct b{display:block;font-weight:500;line-height:18px}.afd-ct span{display:block;font-size:12px;line-height:16px;color:var(--muted);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.afd-em{padding:26px 14px;text-align:center;font-size:13px;color:var(--muted)}
.afd-pg{flex:none;display:flex;flex-direction:column;gap:8px;min-width:0}
.afd-ps{display:flex;align-items:center;gap:8px;min-height:30px;font-size:12.5px;color:var(--muted)}
.afd-ps .btn{height:28px;padding:0 10px;font-size:12.5px}
.afd-pst{position:relative;height:20px;flex:1;min-width:0}
@container (min-width:640px){.afd-body{flex-direction:row}.afd-fd{flex:0 0 44%}.afd-pg{flex:1}.afp-fr{max-width:620px}}
</style>
<div class="afd-root"><div class="afd-top"><div class="afd-chs" role="group" aria-label="Filter actions by type"></div></div>
<div class="afd-body"><section class="afd-fd" aria-label="Agent actions"><div class="afd-fh">Actions<span>Newest first</span></div><ul class="afd-ls" aria-label="Agent actions, newest first"></ul><p class="afd-em" hidden>No actions of this type yet.</p></section>
<section class="afd-pg"><div class="afd-ps"><span class="afd-pst"></span><button type="button" class="btn afd-lv" hidden>Back to live</button><button type="button" class="btn afd-re">Replay</button></div>${gPageHTML('afp', { label:'Page the agent is working on' })}</section></div>
<div class="afd-live" role="status" aria-live="polite" style="${SR}"></div></div>`,
  desc:'Each action lands at the top: its row grows from zero height, then the content fades up, while the agent cursor glides to the matching spot on the page. Consecutive actions of one kind fold into a single group whose title swaps and whose count rolls. Filter chips close non-matching groups instead of removing them. Click any row and the ring moves to that spot, leading edge first, and the page shows that moment; Back to live returns to following the newest action.',
  api:'event → group = head.kind === kind ? merge(head) : insert(top, slot.open)   cursor.go(spot)   chip.count.roll()   row.click → ring.go(spot), page.view(row.view)',
  init(st){
    const EV = [
      { at:.6, k:'nav', t:'Navigated to /pricing', sub:'northwind.app/pricing', sh:'/pricing', spot:'url', sv:'pricing', v:'pricing', u:'/pricing' },
      { at:2.0, k:'click', t:'Clicked “Yearly”', sub:'Billing toggle on the pricing page', sh:'Yearly', spot:'toggle', sv:'pricing', v:'pricing', u:'/pricing', fx:p => p.toggle(true) },
      { at:3.3, k:'click', t:'Clicked “Start free”', sub:'Free plan card', sh:'Start free', spot:'start', sv:'pricing', v:'pricing', u:'/pricing' },
      { at:4.6, k:'nav', t:'Navigated to /signup', sub:'northwind.app/signup', sh:'/signup', spot:'url', sv:'signup', v:'signup', u:'/signup' },
      { at:6.0, k:'type', t:'Typed in Work email', sub:'maya@northwind.com', sh:'Work email', spot:'email', sv:'signup', v:'signup', u:'/signup', fx:(p, t) => p.type('email', 'maya@northwind.com', t) },
      { at:7.5, k:'type', t:'Typed in Company', sub:'Northwind Studio', sh:'Company', spot:'company', sv:'signup', v:'signup', u:'/signup', fx:(p, t) => p.type('company', 'Northwind Studio', t) },
      { at:8.8, k:'type', t:'Typed in Team size', sub:'11 to 50', sh:'Team size', spot:'size', sv:'signup', v:'signup', u:'/signup', fx:(p, t) => p.type('size', '11 to 50', t) },
      { at:10.2, k:'shot', t:'Took screenshot', sub:'signup-form.png, 1280 by 800', sh:'signup-form.png', spot:'page', sv:'signup', v:'signup', u:'/signup', fx:(p, t) => p.flash(t) },
      { at:11.5, k:'comment', t:'Left comment', sub:'There is no “Just me” option for team size.', sh:'Team size', spot:'size', sv:'signup', v:'signup', u:'/signup', fx:p => p.pin('c1', 'size', true) },
      { at:12.6, k:'comment', t:'Left comment', sub:'Create account sits below the fold at 360 pixels.', sh:'Create account', spot:'create', sv:'signup', v:'signup', u:'/signup', fx:p => p.pin('c2', 'create', true) },
      { at:14.0, k:'click', t:'Clicked “Create account”', sub:'Submitted the signup form', sh:'Create account', spot:'create', sv:'signup', v:'done', u:'/signup/done' },
      { at:15.4, k:'shot', t:'Took screenshot', sub:'confirmation.png, 1280 by 800', sh:'confirmation.png', spot:'page', sv:'done', v:'done', u:'/signup/done', fx:(p, t) => p.flash(t) } ];
    const PL = { nav:n => `Navigated to ${n} pages`, click:n => `Clicked ${n} elements`, type:n => `Typed in ${n} fields`, shot:n => `Took ${n} screenshots`, comment:n => `Left ${n} comments` };
    const chs = $(st,'.afd-chs'), ls = $(st,'.afd-ls'), em = $(st,'.afd-em'), live = $(st,'.afd-live'), re = $(st,'.afd-re'), lv = $(st,'.afd-lv');
    const pg = gPage(st, 'afp'), cursor = gCursor(pg.ov, 'Assistant', 'ink'), ring = gRing(pg.ov);
    const pst = gText($(st,'.afd-pst'), 'line-height:20px');
    const chipDefs = [{ k:'all', l:'All', i:null }, ...Object.keys(KIND).map(k => ({ k, l:KIND[k].l, i:KIND[k].ic }))];
    const chips = chipDefs.map(d => { const b = gEl('button'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.innerHTML = (d.i ? gi(d.i, 14, 2) : '') + `<span>${d.l}</span><span class="afd-cn"></span>`; chs.appendChild(b);
      const dg = new Digits($(b,'.afd-cn'), 2); dg.set('0', true); const c = { d, b, dg, w:new Track(d.k === 'all' ? 1 : 0), n:0 }; b.onclick = () => setFilter(d.k); return c; });
    let rt = 0, last = null, idx = 0, filter = 'all', sel = null, newest = null, liveView = 'pricing', liveUrl = '/pricing', lastW = 0, cursorSpot = null;
    const groups = [], q = []; let items = [];
    const say = s => { live.textContent = s; };
    const spotNow = it => { const r = pg.rect(it.ev.spot); return it.ev.spot === 'page' ? { x:r.x + 8, y:r.y + 8, w:r.w - 16, h:r.h - 16 } : r; };
    const shown = () => sel || newest;
    const aim = inst => { const it = shown(); if (!it) return; ring.to(spotNow(it), inst); };
    const setFilter = k => { filter = k; chips.forEach(c => { c.w.set(c.d.k === k ? 1 : 0, S.base); c.b.setAttribute('aria-pressed', c.d.k === k); });
      let vis = 0; groups.forEach(g => { const on = k === 'all' || g.kind === k; g.slot.open(on); if (on) vis++; }); em.hidden = vis > 0; em.textContent = `No ${KIND[k] ? KIND[k].l.toLowerCase() : ''} actions yet.`; };
    const kindIcon = k => gi(KIND[k].ic, 14, 2);
    const refresh = g => { const n = g.items.length, top = g.items[0];
      g.tt.put(n > 1 ? PL[g.kind](n) : top.ev.t); g.sub.textContent = n > 1 ? g.items.slice().reverse().map(i => i.ev.sh).join(', ') : top.ev.sub;
      g.tm.textContent = gfmt(top.rt); g.dg.set(String(n)); g.bn.set(n > 1 ? 1 : 0); g.cv.style.visibility = n > 1 ? 'visible' : 'hidden';
      g.hd.setAttribute('aria-expanded', n > 1 ? String(g.open) : null); if (n < 2) g.hd.removeAttribute('aria-expanded'); };
    const toggleG = (g, v) => { g.open = v; g.ch.open(v); g.hd.setAttribute('aria-expanded', v); };
    const choose = it => { sel = it; lv.hidden = false; pst.put('Pinned'); pg.view(it.ev.sv); pg.url(it.ev.u); aim(); };
    const goLive = () => { sel = null; lv.hidden = true; pst.put('Following live'); if (newest){ pg.view(liveView); pg.url(liveUrl); } aim(); };
    lv.onclick = goLive;
    const addChild = (g, it) => { const li = gEl('li'); li.innerHTML = `<div class="afd-cri"><button type="button" class="afd-cr">${kindIcon(it.ev.k)}<span class="afd-ct"><b></b><span></span></span><span class="afd-tm"></span></button></div>`;
      $(li,'b').textContent = it.ev.t; $(li,'.afd-ct span').textContent = it.ev.sub; $(li,'.afd-tm').textContent = gfmt(it.rt);
      it.cr = $(li,'.afd-cr'); it.cw = new Track(0); it.slot = gSlot(li, $(li,'.afd-cri'), 0); it.slot.open(true); g.cl.insertBefore(li, g.cl.firstChild); it.cr.onclick = () => choose(it); };
    const addGroup = it => {
      const li = gEl('li'); li.className = 'afd-g';
      li.innerHTML = `<div class="afd-gi"><button type="button" class="afd-hd"><span class="afd-ic">${kindIcon(it.ev.k)}</span><span class="afd-tx"><span class="afd-t"></span><span class="afd-s"></span></span><span class="afd-nw"><span class="afd-n"><span class="afd-nd"></span></span></span><span class="afd-tm"></span><span class="afd-cv">${gi('chev', 14, 2)}</span></button><div class="afd-ch"><ul class="afd-cl"></ul></div></div>`;
      const g = { kind:it.ev.k, items:[], li, hd:$(li,'.afd-hd'), ic:$(li,'.afd-ic'), tt:gText($(li,'.afd-t'), 'line-height:20px'), sub:$(li,'.afd-s'), tm:$(li,'.afd-tm'), cv:$(li,'.afd-cv'), nw:$(li,'.afd-nw'), cl:$(li,'.afd-cl'),
        dg:new Digits($(li,'.afd-nd'), 2), bnT:new Track(0), ch:gSlot($(li,'.afd-ch'), $(li,'.afd-cl'), 0), slot:gSlot(li, $(li,'.afd-gi'), 0), open:false, hw:new Track(0) };
      g.dg.set('1', true); g.bn = { set(v){ g.bnT.set(v, S.base); } };
      ls.insertBefore(li, ls.firstChild); groups.unshift(g); g.slot.open(filter === 'all' || filter === g.kind);
      g.hd.onclick = () => { if (g.items.length > 1){ toggleG(g, !g.open); if (!g.items.includes(sel)) choose(g.items[0]); } else choose(g.items[0]); };
      return g; };
    const fire = ev => {
      const it = { ev, rt, hw:new Track(0) }; items.unshift(it); newest = it; liveView = ev.v; liveUrl = ev.u;
      if (ev.fx) ev.fx(pg, now()); const c = pg.center(ev.spot); cursor.go(c.x, c.y, !cursor.W.target); cursor.show(true);
      let g = groups[0]; if (!g || g.kind !== ev.k) g = addGroup(it); g.items.unshift(it); it.g = g; addChild(g, it); refresh(g);
      const c1 = chips[0], ck = chips.find(x => x.d.k === ev.k); c1.n++; ck.n++; c1.dg.set(String(c1.n)); ck.dg.set(String(ck.n));
      if (!sel){ pg.view(ev.v, false); pg.url(ev.u); }
      aim(); say(`${ev.t}. ${ev.sub}`); };
    const reset = () => { groups.splice(0).forEach(g => g.li.remove()); items = []; newest = null; sel = null; idx = 0; rt = 0; lv.hidden = true; pst.put('Following live'); em.hidden = true;
      pg.clear(); pg.view('pricing'); pg.url('/pricing'); cursor.show(false); ring.hide(); chips.forEach(c => { c.n = 0; c.dg.set('0'); }); q.length = 0; liveView = 'pricing'; liveUrl = '/pricing'; };
    re.onclick = reset;
    pst.put('Following live', true); pg.view('pricing', true); pg.url('/pricing', true); chips.forEach(c => c.w.jump(c.d.k === 'all' ? 1 : 0)); chips[0].b.setAttribute('aria-pressed', 'true'); cursor.go(300, 20, true);
    return t => {
      gDrain(q, t);
      const dt = last == null ? 0 : Math.min(.1, Math.max(0, t - last)); last = t; rt += dt;
      while (idx < EV.length && EV[idx].at <= rt) fire(EV[idx++]);
      const w = pg.fr.clientWidth; if (w !== lastW){ lastW = w; aim(true); const it = newest; if (it){ const c = pg.center(it.ev.spot); cursor.go(c.x, c.y, true); } }
      pg.render(t); cursor.render(t); ring.render(t); pst.render(t);
      chips.forEach(c => { const wv = clamp(c.w.at(t)); c.b.style.background = mix(wv, 'var(--ink)', 'var(--card)'); c.b.style.color = mix(wv, 'var(--card)', 'var(--ink)'); c.b.style.borderColor = mix(wv, 'var(--ink)', 'var(--line)'); c.dg.render(t); });
      const sh = shown();
      groups.forEach(g => { g.slot.render(t); g.ch.render(t); g.tt.render(t); g.dg.render(t);
        const bw = clamp(g.bnT.at(t)); g.nw.style.width = px(bw*(g.dg.slots[0].s.offsetWidth + g.dg.slots[1].s.offsetWidth + 12 + 10)); g.nw.style.opacity = bw.toFixed(3); g.nw.style.marginLeft = '0';
        g.cv.style.transform = `rotate(${(clamp(g.ch.h.at(t))*180).toFixed(1)}deg)`;
        const inG = sh && sh.g === g, hw = inG && !g.open ? 1 : 0; g.hw.set(hw, S.base); const hv = clamp(g.hw.at(t));
        g.hd.style.background = mix(hv, 'var(--accent-tint)', 'transparent'); g.ic.style.background = mix(hv, 'var(--accent)', 'var(--raised)'); g.ic.style.color = mix(hv, 'var(--card)', 'var(--muted)');
        g.items.forEach(it => { it.slot.render(t); it.cw.set(sh === it ? 1 : 0, S.base); it.cr.style.background = mix(clamp(it.cw.at(t)), 'var(--accent-tint)', 'transparent'); }); });
    };
  }});

/* ================================================================ 3. Take over */
atom({ id:'takeover', cat:'Agent activity', name:'Take over from the agent', block:'Agent control · pause and take over', fam:['M','S','E','X'], wide:true, tall:true,
  html:`<style>
${gPageCSS('tkp')}
.tko-root{position:absolute;inset:0;container-type:inline-size;padding:12px;display:flex;flex-direction:column;gap:10px}
.tko-bar{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px}
.tko-chip{display:inline-flex;align-items:center;height:34px;padding:0 13px 0 9px;border:1.5px solid;font-size:13px;font-weight:600;flex:none;white-space:nowrap}
.tko-ico{position:relative;flex:none;width:18px;height:18px;margin-right:7px}
.tko-grp{display:flex;gap:8px;margin-left:auto;overflow:hidden;flex:none}
.tko-grp .btn{position:relative;display:flex;justify-content:center;height:34px;padding:0;overflow:hidden;flex:none;font-size:13px}
.tko-body{flex:1;min-height:0;display:flex;flex-direction:column;gap:10px}
.tko-main{flex:none;min-width:0;display:flex;justify-content:center}
.tko-q{flex:none;overflow:hidden;min-width:0}
.tko-qi{background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:12px 14px 14px}
.tko-qh{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;font-size:13px;font-weight:600}.tko-qh span{font-size:12px;font-weight:400;color:var(--muted)}
.tko-ql{list-style:none;margin:0;padding:0}
.tko-qr{display:flex;align-items:center;gap:10px;padding:6px 0;border-top:1px solid var(--line-soft);font-size:13px;line-height:20px}.tko-qr:first-child{border-top:0}
.tko-qs{position:relative;flex:none;width:22px;height:22px;border-radius:11px}.tko-qs>span{position:absolute;inset:0;display:grid;place-items:center}
.tko-qt{flex:1;min-width:0}.tko-qt small{display:block;font-size:12px;line-height:16px;color:var(--muted)}
.tko-qn{margin:8px 0 0;position:relative;height:36px;font-size:12.5px;line-height:18px;color:var(--muted)}
.tko-bn{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--accent-tint);border-bottom:1px solid var(--line);color:var(--ink);font-size:12.5px;line-height:18px}
.tko-bn svg{flex:none;color:var(--accent)}.tko-bn b{display:block;font-weight:600}.tko-bn span{display:block;color:var(--muted)}
.tko-bn .btn{margin-left:auto;flex:none;height:30px;padding:0 12px;font-size:12.5px;white-space:nowrap}
.tko-hum .tkp-vp{cursor:none;overflow-y:auto;scrollbar-width:none}.tko-hum .tkp-vp::-webkit-scrollbar{display:none}
@container (min-width:640px){.tko-body{flex-direction:row}.tko-main{flex:1 1 0}.tko-qi{width:264px}.tkp-fr{max-width:600px}}
@container (max-width:639px){.tko-grp{margin-left:0;flex:1 1 100%}.tko-grp .btn{flex:1}}
</style>
<div class="tko-root"><div class="tko-bar"><span class="tko-chip"><span class="tko-ico"></span><span class="tko-cl"></span></span><div class="tko-grp"><button type="button" class="btn tko-a"></button><button type="button" class="btn tko-b"></button></div></div>
<div class="tko-body"><div class="tko-main">${gPageHTML('tkp', { label:'Page the assistant is working on. You can type in it while you are in control.' })}</div>
<aside class="tko-q" aria-label="Queued agent actions"><div class="tko-qi"><div class="tko-qh">Queued actions<span class="tko-qc"></span></div><ul class="tko-ql"></ul><p class="tko-qn"></p></div></aside></div>
<div class="tko-live" role="status" aria-live="polite" style="${SR}"></div></div>`,
  desc:'Take over freezes the assistant where it stands. Its ink cursor fades and your accent cursor appears at the same point, then springs to the pointer, while a banner grows between the address bar and the page and pushes the page down, the buttons fold away and the queued actions slide open. Hand back runs it in reverse: your cursor travels to the assistant’s next target, turns into the assistant’s, the banner closes, and the queue starts ticking again.',
  api:'takeOver: agent.fade, human.at(agent.pos) → human.follow(pointer); banner.h.set(1) · queue.open · page.editable(true)   handBack: human.go(next.spot) → agent.at(human.pos); banner.h.set(0)',
  init(st){
    const STEPS = [
      { k:'type', t:'Type work email', sub:'maya@northwind.com', f:'email', v:'maya@northwind.com', at:.7, d:1.8 },
      { k:'type', t:'Type company', sub:'Northwind Studio', f:'company', v:'Northwind Studio', at:.7, d:1.6 },
      { k:'type', t:'Choose team size', sub:'11 to 50', f:'size', v:'11 to 50', at:.7, d:1.4 },
      { k:'click', t:'Click “Create account”', sub:'Submit the form', f:'create', at:.7, d:1.2 },
      { k:'shot', t:'Take screenshot', sub:'confirmation.png', f:'page', at:.5, d:1.0 } ];
    const pg = gPage(st, 'tkp'), ag = gCursor(pg.ov, 'Assistant', 'ink'), hu = gCursor(pg.ov, 'You', 'accent');
    const chip = $(st,'.tko-chip'), ico = $(st,'.tko-ico'), grp = $(st,'.tko-grp'), A = $(st,'.tko-a'), B = $(st,'.tko-b'), live = $(st,'.tko-live'), q = $(st,'.tko-q'), qi = $(st,'.tko-qi'), ql = $(st,'.tko-ql'), qc = $(st,'.tko-qc'), root = $(st,'.tko-root');
    const cl = gLabel($(st,'.tko-cl')), qn = gText($(st,'.tko-qn'), 'line-height:18px;white-space:normal;right:0');
    const lA = gLabel(gEl('span'), 'line-height:32px'), lB = gLabel(gEl('span'), 'line-height:32px');
    [[A, lA], [B, lB]].forEach(([b, l]) => { b.appendChild(l.host); l.host.style.margin = '0 auto'; l.host.style.height = '32px'; l.host.style.lineHeight = '32px'; });
    B.classList.add('ink'); lB.put('Take over', true);
    const CH = [ { l:'Assistant working', ic:'spin', bg:'var(--raised)', fg:'var(--ink)', bd:'var(--line)', r:17 }, { l:'Assistant paused', ic:'pause', bg:'var(--card)', fg:'var(--ink)', bd:'var(--ink)', r:6 },
      { l:'You’re driving', ic:'hand', bg:'var(--accent-tint)', fg:'var(--accent)', bd:'var(--accent)', r:17 }, { l:'Run finished', ic:'check', bg:'var(--success-tint)', fg:'var(--success)', bd:'var(--success)', r:17 } ];
    const cly = CH.map(c => { const e = gEl('span', 'position:absolute;inset:0;display:grid;place-items:center'); e.innerHTML = c.ic === 'spin' ? SPIN(17) : gi(c.ic, 17, 2); ico.appendChild(e); return e; });
    const spinEl = cly[0].firstChild, csw = new Swap(0), cW = CH.map(() => new Track(0));
    const bnh = gEl('div'); bnh.className = 'tko-bn'; bnh.innerHTML = `${gi('hand', 20, 1.9)}<div><b>You’re in control</b><span class="tko-bs"></span></div><button type="button" class="btn ink tko-hb">Hand back</button>`; pg.bnw.appendChild(bnh);
    const hb = $(bnh,'.tko-hb'), bs = $(bnh,'.tko-bs'); const bslot = gSlot(pg.bnw, bnh, 0);
    const rows = STEPS.map(s => { const li = gEl('li'); li.className = 'tko-qr'; li.innerHTML = `<span class="tko-qs"><span class="tko-s0">${gi('ring', 14, 2)}</span><span class="tko-s1">${SPIN(14)}</span><span class="tko-s2">${gi('check', 13, 3)}</span><span class="tko-s3">${gi('pause', 12, 2.6)}</span></span><span class="tko-qt"><span class="tko-n"></span><small class="tko-m"></small></span>`;
      $(li,'.tko-n').textContent = s.t; $(li,'.tko-m').textContent = s.sub; ql.appendChild(li);
      return { li, L:[0,1,2,3].map(i => $(li, '.tko-s' + i)), sw:new Swap(0), bg:$(li,'.tko-qs'), W:[1,0,0,0].map(v => new Track(v)), cur:0 }; });
    // modes: run | pause | human | done ; ui follows the mode, the script follows `go`
    let mode = 'run', si = 0, sc = 0, started = false, handing = false, rt = 0, last = null, lastW = 0, ptr = null, ctx = null;
    const Q = [], qT = new Track(0), bT = new Track(0), gF = new Track(1), bF = new Track(1);
    const say = s => { live.textContent = s; };
    const left = () => Math.max(0, STEPS.length - si);
    const setRow = (i, n) => { const r = rows[i]; if (r.cur === n) return; r.cur = n; r.sw.to(n); r.W.forEach((w, k) => w.set(k === n ? 1 : 0, S.base)); };
    const syncRows = () => rows.forEach((r, i) => setRow(i, i < si ? 2 : mode === 'run' && i === si && !handing ? 1 : (mode === 'run' && !handing) || mode === 'done' ? 0 : 3));
    const note = () => qn.put(mode === 'pause' ? 'Held. Nothing runs until you resume or take over.' : mode === 'human' ? 'Held while you are in control. Hand back to continue from the next one.' : mode === 'done' ? 'Every queued action has run.' : 'Assistant runs these in order.');
    const sub = () => { bs.textContent = left() ? `Assistant is paused. ${left()} queued.` : 'Assistant has no actions left.'; qc.textContent = `${left()} left`; };
    const chipTo = (n, inst) => { cl.put(CH[n].l, inst); csw.to(n); if (inst){ csw.cur = n; csw.prev = null; csw.t = -9; } cW.forEach((w, i) => inst ? w.jump(i === n ? 1 : 0) : w.set(i === n ? 1 : 0, S.base)); };
    const labels = (inst) => { lA.put(mode === 'pause' ? 'Resume' : mode === 'done' ? 'Replay' : 'Pause', inst); };
    const ui = () => { const h = mode === 'human'; chipTo(h ? 2 : mode === 'pause' ? 1 : mode === 'done' ? 3 : 0); labels(); bslot.open(h); bT.set(h ? 1 : 0, S.base); qT.set(mode === 'pause' || h ? 1 : 0, S.base); gF.set(h ? 0 : 1, S.base); bF.set(mode === 'done' || h ? 0 : 1, S.base);
      grp.inert = h; syncRows(); note(); sub(); root.classList.toggle('tko-hum', h); };
    const spotC = i => pg.center(STEPS[i].f);
    const aimAgent = inst => { if (si < STEPS.length){ const c = spotC(si); ag.go(c.x, c.y, inst); } };
    const begin = () => { started = false; sc = 0; };
    const freezeTyping = () => { const s = STEPS[si]; if (s && s.k === 'type' && started) pg.freeze(s.f); };
    const pause = () => { if (mode !== 'run') return; freezeTyping(); mode = 'pause'; ag.show(true); ag.W.set(.55, S.base); ui(); say('Assistant paused'); };
    const resume = () => { if (mode !== 'pause') return; mode = 'run'; ag.W.set(1, S.base); const s = STEPS[si]; if (s && s.k === 'type' && started){ const L = pg.typed(s.f).length; pg.type(s.f, s.v, now() - L/14, 14); } ui(); say('Assistant resumed'); };
    const takeOver = () => { if (mode !== 'run' && mode !== 'pause') return; freezeTyping(); const p = ag.pos(now()); mode = 'human'; handing = false;
      hu.go(p.x, p.y, true); hu.show(true); ag.show(false); pg.editable(true); ptr = null; ui(); say(`You are in control. ${left()} actions are queued.`);
      gPush(Q, now() + .25, () => { if (mode === 'human') hb.focus({ preventScroll:true }); }); };
    const handBack = () => { if (mode !== 'human') return; pg.editable(false); pg.vp.scrollTop = 0; const t = now(); handing = true; mode = 'run'; ui();
      const c = si < STEPS.length ? spotC(si) : hu.pos(t); hu.go(c.x, c.y, false, S.base);
      gPush(Q, t + .45, () => { const p = hu.pos(now()); ag.go(p.x, p.y, true); ag.W.jump(0); ag.show(true); hu.show(false); handing = false; const s = STEPS[si]; if (s && s.k === 'type' && started){ const L = pg.typed(s.f).length; pg.type(s.f, s.v, now() - L/14, 14); } syncRows(); say('Assistant resumed from the queue'); }); };
    const restart = () => { pg.clear(); pg.view('signup'); pg.url('/signup'); si = 0; sc = 0; started = false; mode = 'run'; handing = false; ag.show(false, true); ag.go(pg.rect('page').w*.8, 50, true); ag.W.jump(0); ag.show(true); rows.forEach(r => { r.cur = -1; }); ui(); say('Replaying the run'); };
    A.onclick = () => mode === 'run' ? pause() : mode === 'pause' ? resume() : mode === 'done' ? restart() : 0;
    B.onclick = takeOver; hb.onclick = handBack;
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && mode === 'human') handBack(); });
    pg.vp.addEventListener('scroll', () => { if (mode !== 'human'){ pg.vp.scrollTop = 0; } });
    pg.fr.addEventListener('pointermove', e => { if (mode !== 'human') return; const r = pg.fr.getBoundingClientRect(); const x = e.clientX - r.left - pg.fr.clientLeft, y = e.clientY - r.top - pg.fr.clientTop; if (!ptr || Math.abs(ptr.x - x) + Math.abs(ptr.y - y) > 1.5){ ptr = { x, y }; hu.go(x, y, false, S.snap); } });
    pg.view('signup', true); pg.url('/signup', true); ui(); csw.cur = 0; csw.prev = null; csw.t = -9; cW.forEach((w, i) => w.jump(i === 0 ? 1 : 0)); cl.put(CH[0].l, true); lA.put('Pause', true);
    rows.forEach(r => { r.sw.cur = 0; r.sw.prev = null; r.sw.t = -9; }); qT.jump(0); gF.jump(1); bF.jump(1); bT.jump(0); ag.go(300, 40, true); ag.show(false, true);
    return t => {
      gDrain(Q, t);
      const dt = last == null ? 0 : Math.min(.1, Math.max(0, t - last)); last = t; rt += dt;
      if (mode === 'run' && !handing && si < STEPS.length){
        if (rt > .4){ ag.show(true); }
        sc += dt; const s = STEPS[si];
        if (!started && sc >= (si === 0 ? s.at + .3 : s.at)){ started = true; if (s.k === 'type') pg.type(s.f, s.v, now(), 14); if (s.k === 'shot') pg.flash(now()); }
        if (sc === dt || (!started && sc <= dt + 1e-6)) aimAgent();
        if (sc >= s.d + (si === 0 ? .3 : 0)){ if (s.f === 'create'){ pg.view('done'); pg.url('/signup/done'); pg.mirror(); } si++; sc = 0; started = false; if (si >= STEPS.length){ mode = 'done'; ag.show(false); } else aimAgent(); ui(); }
      }
      const w = pg.fr.clientWidth; if (w !== lastW){ lastW = w; if (mode === 'run' || mode === 'pause') aimAgent(true); }
      pg.render(t); ag.render(t); hu.render(t);
      const ws = cW.map(v => v.at(t));
      chip.style.background = gBlend(ws, CH.map(c => c.bg)); chip.style.color = gBlend(ws, CH.map(c => c.fg)); chip.style.borderColor = gBlend(ws, CH.map(c => c.bd)); chip.style.borderRadius = px(wsum(ws, CH.map(c => c.r)));
      cly.forEach((e, i) => csw.apply(e, i, t, 0)); spinEl.style.transform = `rotate(${((t*540)%360).toFixed(1)}deg)`; cl.render(t);
      lA.render(t); lB.render(t); A.style.width = px(lA.w.at(t) + 26); B.style.width = px(lB.w.at(t) + 26);
      const gf = clamp(gF.at(t)); grp.style.height = px(gf*34); grp.style.opacity = gf.toFixed(3); grp.style.visibility = gf < .01 ? 'hidden' : 'visible';
      const bf = clamp(bF.at(t)); B.style.opacity = bf.toFixed(3); B.style.marginLeft = px((bf - 1)*(lB.w.at(t) + 26 + 8)); B.style.visibility = bf < .01 ? 'hidden' : 'visible';
      bslot.render(t); qn.render(t);
      const wide = root.clientWidth >= 640, qf = clamp(qT.at(t));
      if (wide){ q.style.width = px(qf*264); q.style.height = 'auto'; q.style.marginLeft = px((qf - 1)*10); } else { q.style.width = 'auto'; q.style.marginLeft = '0'; q.style.height = px(qf*qi.offsetHeight); }
      q.style.opacity = Math.min(1, qf*1.6).toFixed(3); q.style.visibility = qf < .004 ? 'hidden' : 'visible'; q.inert = qT.target === 0;
      rows.forEach((r, i) => { r.L.forEach((e, k) => r.sw.apply(e, k, t, 0)); r.L[1].firstChild.style.transform = `rotate(${((t*540)%360).toFixed(1)}deg)`; const ws2 = r.W.map(v => v.at(t));
        r.bg.style.background = gBlend(ws2, ['var(--raised)', 'var(--raised)', 'var(--success-tint)', 'var(--raised)']); r.L[0].style.color = 'var(--faint)'; r.L[1].style.color = 'var(--ink)'; r.L[2].style.color = 'var(--success)'; r.L[3].style.color = 'var(--muted)'; });
    };
  }});

/* ================================================================ 4. Plan progress */
// a status mark: layers swap, background, color and corner radius blend between kinds
const gStatus = (size, defs, k0 = 0) => {
  const el = gEl('span', `position:relative;display:block;flex:none;width:${size}px;height:${size}px`);
  const ly = defs.map(d => { const e = gEl('span', 'position:absolute;inset:0;display:grid;place-items:center'); e.innerHTML = d.h; el.appendChild(e); return e; });
  const sw = new Swap(k0), W = defs.map((d, i) => new Track(i === k0 ? 1 : 0)); let k = k0;
  const o = { el, get k(){ return k; },
    set(n, inst){ if (n === k) return; k = n; W.forEach((w, i) => inst ? w.jump(i === n ? 1 : 0) : w.set(i === n ? 1 : 0, S.base)); sw.to(n); if (inst){ sw.cur = n; sw.prev = null; sw.t = -9; } },
    render(t){ const ws = W.map(w => w.at(t)); el.style.background = gBlend(ws, defs.map(d => d.bg)); el.style.color = gBlend(ws, defs.map(d => d.fg)); el.style.borderRadius = px(wsum(ws, defs.map(d => d.r)));
      ly.forEach((e, i) => { sw.apply(e, i, t, 0); if (defs[i].spin) e.firstChild.style.transform = `rotate(${((t*540)%360).toFixed(1)}deg)`; }); } };
  return o;
};
const gRowDefs = [ { h:gi('ring', 14, 1.8), bg:'transparent', fg:'var(--faint)', r:11 }, { h:SPIN(14), bg:'var(--raised)', fg:'var(--ink)', r:11, spin:1 }, { h:gi('check', 13, 3), bg:'var(--success)', fg:'var(--card)', r:11 },
  { h:gi('x', 12, 3), bg:'var(--danger)', fg:'var(--card)', r:6 }, { h:gi('dash', 14, 2.6), bg:'var(--raised)', fg:'var(--muted)', r:11 } ];
const gSubDefs = [ { h:gi('ring', 12, 1.8), bg:'transparent', fg:'var(--faint)', r:8 }, { h:SPIN(12), bg:'transparent', fg:'var(--ink)', r:8, spin:1 }, { h:gi('check', 12, 3), bg:'transparent', fg:'var(--success)', r:8 }, { h:gi('x', 11, 3), bg:'transparent', fg:'var(--danger)', r:8 } ];

atom({ id:'planprogress', cat:'Agent activity', name:'Agent plan progress', block:'Agent run · plan checklist', fam:['M','S','E','T'], wide:true, tall:true,
  html:`<style>
.ppr-root{position:absolute;inset:0;container-type:inline-size;padding:12px;display:flex;gap:10px;align-items:flex-start;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.ppr-card{flex:1;min-width:0;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:hidden}
.ppr-hd{padding:14px 14px 12px;border-bottom:1px solid var(--line-soft)}
.ppr-h1{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.ppr-h1 h4{margin:0;font-size:14px;line-height:20px;font-weight:600}
.ppr-goal{margin:2px 0 0;font-size:12.5px;line-height:18px;color:var(--muted)}
.ppr-pc{display:flex;align-items:baseline;font-size:26px;line-height:30px;font-weight:600;letter-spacing:-.02em;flex:none}.ppr-pc small{font-size:15px;font-weight:500;color:var(--muted);margin-left:1px}
.ppr-bar{height:8px;border-radius:4px;background:var(--raised);margin-top:12px;overflow:hidden}.ppr-fill{height:100%;border-radius:4px;background:var(--accent);transform-origin:0 0}
.ppr-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;font-size:12.5px;line-height:18px;color:var(--muted)}.ppr-ms{position:relative;height:18px;flex:1;min-width:0}
.ppr-meta .btn{height:28px;padding:0 10px;font-size:12.5px;flex:none}
.ppr-ls{list-style:none;margin:0;padding:0}
.ppr-li{border-bottom:1px solid var(--line-soft)}
.ppr-rw{display:flex;align-items:center;gap:10px;padding:9px 12px 9px 14px;min-height:50px}
.ppr-hb{flex:1;min-width:0;display:flex;flex-direction:column;border:0;background:none;padding:0;text-align:left;cursor:pointer;color:inherit}
.ppr-t{display:block;font-size:13.5px;line-height:20px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ppr-ss{position:relative;display:block;height:17px;font-size:12px;color:var(--muted)}
.ppr-du{flex:none;font-size:12px;color:var(--muted);min-width:30px;text-align:right}
.ppr-rw .btn{flex:none;height:28px;padding:0 10px;font-size:12.5px}
.ppr-dt{overflow:hidden}.ppr-di{padding:0 14px 12px 46px}
.ppr-sl{list-style:none;margin:0;padding:0;display:grid;gap:2px}
.ppr-sr{display:flex;align-items:center;gap:8px;font-size:12.5px;line-height:22px;color:var(--ink)}
.ppr-fb{margin-top:8px;padding:9px 11px;border-radius:9px;background:var(--danger-tint);color:var(--danger);font-size:12.5px;line-height:18px}
.ppr-fb b{display:block;font-weight:600}.ppr-fa{display:flex;gap:8px;margin-top:8px}.ppr-fa .btn{height:28px;padding:0 11px;font-size:12.5px}
.ppr-ad{padding:10px 14px}.ppr-ad>.btn{height:30px;padding:0 12px;font-size:12.5px;display:inline-flex;align-items:center;gap:6px}
.ppr-af{overflow:hidden}.ppr-afi{display:flex;gap:8px;padding:2px 14px 12px}
.ppr-afi input{flex:1;min-width:0;height:32px;border:1.5px solid var(--muted);border-radius:8px;background:var(--card);color:var(--ink);padding:0 10px;font:13px var(--sans)}
.ppr-afi .btn{height:32px;padding:0 12px;font-size:13px}
.ppr-side{flex:none;width:236px;background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:14px}
.ppr-side h4{margin:0 0 6px;font-size:13px;font-weight:600}
.ppr-kv{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:7px 0;border-top:1px solid var(--line-soft);font-size:12.5px;color:var(--muted)}.ppr-kv:first-of-type{border-top:0}.ppr-kv b{font-weight:600;color:var(--ink);font-size:13px;display:inline-flex}
.ppr-nw{position:relative;height:18px;flex:1;min-width:0;text-align:right}
@container (max-width:759px){.ppr-side{display:none}}
</style>
<div class="ppr-root"><section class="ppr-card" aria-label="Agent plan"><div class="ppr-hd"><div class="ppr-h1"><div style="min-width:0"><h4>Plan</h4><p class="ppr-goal">Sign up for the Team trial on northwind.app</p></div><div class="ppr-pc" aria-hidden="true"><span class="ppr-pd"></span><small>%</small></div></div>
<div class="ppr-bar" role="progressbar" aria-label="Plan progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="ppr-fill"></div></div><div class="ppr-meta"><span class="ppr-ms"></span><button type="button" class="btn ppr-re">Replay</button></div></div>
<ul class="ppr-ls" aria-label="Plan steps"></ul>
<div class="ppr-af"><div class="ppr-afi"><input class="ppr-in" id="ppr-in" aria-label="New step" maxlength="60" placeholder="e.g. Check the welcome email" autocomplete="off"><button type="button" class="btn ink ppr-ok">Add</button><button type="button" class="btn ppr-no">Cancel</button></div></div>
<div class="ppr-ad"><button type="button" class="btn ppr-add" aria-expanded="false">${gi('plus', 14, 2.2)}Add step</button></div></section>
<aside class="ppr-side" aria-label="Run summary"><h4>Run</h4><div class="ppr-kv">Now<span class="ppr-nw ppr-now"></span></div><div class="ppr-kv">Up next<span class="ppr-nw ppr-nx"></span></div><div class="ppr-kv">Elapsed<b><span class="ppr-e1"></span>:<span class="ppr-e2"></span></b></div><div class="ppr-kv">Retries<b class="ppr-rt"></b></div><div class="ppr-kv">Skipped<b class="ppr-sk"></b></div></aside>
<div class="ppr-live" role="status" aria-live="polite" style="${SR}"></div></div>`,
  desc:'Steps tick on a spring: the mark swaps from ring to spinner to check, and the row’s substeps tick one by one under the current step, which is the only one open. When a step fails it stops the run, opens on the error and offers Retry or Skip; retrying runs only that step. Add step grows an input row, and the new step slides in after the current one while the bar fill and the rolling percent move to the new total.',
  api:'sub.tick → sd++   step.done → mark.set(check), detail.close, next.mark.set(spin), next.detail.open   fail → halt, error.open   total = rows.length → fill.set(done/total), digits.set(pct)',
  init(st){
    const PLAN = [
      { t:'Open the pricing page', subs:['Load northwind.app/pricing', 'Dismiss the cookie banner', 'Find “Start free”'] },
      { t:'Fill in the signup form', subs:['Type the work email', 'Type the company name', 'Choose a team size'] },
      { t:'Submit the form', subs:['Check every field', 'Send the request'], fail:{ sub:1, msg:'Request timed out after 10 seconds (504). The form was not submitted.' } },
      { t:'Confirm the email address', subs:['Open the inbox', 'Click the confirmation link'] },
      { t:'Invite two teammates', subs:['Open Members', 'Add priya@ and dev@', 'Send the invitations'] },
      { t:'Take a screenshot of the dashboard', subs:['Wait for the page to settle', 'Capture 1280 by 800'] } ];
    const ls = $(st,'.ppr-ls'), fill = $(st,'.ppr-fill'), bar = $(st,'.ppr-bar'), live = $(st,'.ppr-live'), re = $(st,'.ppr-re'), add = $(st,'.ppr-add'), inp = $(st,'.ppr-in'), ok = $(st,'.ppr-ok'), no = $(st,'.ppr-no'), af = $(st,'.ppr-af'), afi = $(st,'.ppr-afi');
    const pd = new Digits($(st,'.ppr-pd'), 3), ms = gText($(st,'.ppr-ms'), 'line-height:18px'), now_ = gText($(st,'.ppr-now'), 'line-height:18px;right:0;left:auto'), nx = gText($(st,'.ppr-nx'), 'line-height:18px;right:0;left:auto');
    const e1 = new Digits($(st,'.ppr-e1'), 2), e2 = new Digits($(st,'.ppr-e2'), 2), rtD = new Digits($(st,'.ppr-rt'), 2), skD = new Digits($(st,'.ppr-sk'), 2);
    const afs = gSlot(af, afi, 0), fT = new Track(0), SUBT = .85, NO = 'Queued';
    let rows = [], cur = 0, acc = 0, rt = 0, last = null, retries = 0, skipped = 0, halted = false, complete = false, esec = -1, addOpen = false, seq = 0;
    const Q = [], say = s => { live.textContent = s; };
    const ROWST = ['pend', 'run', 'done', 'fail', 'skip'];
    const pct = () => rows.length ? Math.round(rows.filter(r => r.st === 'done' || r.st === 'skip').length/rows.length*100) : 0;
    const refresh = () => { const p = pct(), n = rows.filter(r => r.st === 'done' || r.st === 'skip').length; fT.set(p/100, S.soft); pd.set(String(p)); bar.setAttribute('aria-valuenow', p);
      const head = complete ? 'All steps finished' : halted ? `Stopped at step ${cur + 1} of ${rows.length}` : `Step ${Math.min(cur + 1, rows.length)} of ${rows.length}`; ms.put(`${head}  ·  ${n} done`);
      const r = rows[cur]; now_.put(complete ? 'Finished' : r ? (r.st === 'fail' ? 'Waiting for you' : r.subs[r.sd] || r.t) : '—'); const nxr = rows.slice(cur + 1).find(x => x.st === 'pend'); nx.put(nxr ? nxr.t : '—'); };
    const setSt = (r, s) => { if (r.st === s) return; r.st = s; r.userOpen = null; r.mark.set(ROWST.indexOf(s)); r.ssT = null; };
    const mkRow = (def, at) => {
      const li = gEl('li'); li.className = 'ppr-li';
      li.innerHTML = `<div class="ppr-lin"><div class="ppr-rw"><span class="ppr-mk"></span><button type="button" class="ppr-hb"><span class="ppr-t"></span><span class="ppr-ss"></span></button><span class="ppr-du num"></span><button type="button" class="btn ppr-skip">Skip</button></div><div class="ppr-dt"><div class="ppr-di"><ul class="ppr-sl"></ul><div class="ppr-fb" hidden><b>Step failed</b><span class="ppr-fm"></span><div class="ppr-fa"><button type="button" class="btn ink ppr-rty">Retry</button><button type="button" class="btn ppr-sk2">Skip step</button></div></div></div></div></div>`;
      const r = { id:++seq, t:def.t, subs:def.subs || [], fail:def.fail || null, retried:false, st:'pend', sd:0, userOpen:null, li, t0:0, tEnd:null, mark:gStatus(22, gRowDefs, 0), ss:gText($(li,'.ppr-ss'), 'line-height:17px'), du:$(li,'.ppr-du'), hb:$(li,'.ppr-hb'), tt:$(li,'.ppr-t'), skip:$(li,'.ppr-skip'), fb:$(li,'.ppr-fb'),
        dt:gSlot($(li,'.ppr-dt'), $(li,'.ppr-di'), 0), slot:gSlot(li, $(li,'.ppr-lin'), 0), subEls:[], lastOpen:false, dim:new Track(1), txt:'' };
      $(li,'.ppr-mk').appendChild(r.mark.el); r.tt.textContent = def.t; r.skip.setAttribute('aria-label', `Skip step: ${def.t}`);
      r.subs.forEach(s => { const sl = gEl('li'); sl.className = 'ppr-sr'; const m = gStatus(16, gSubDefs, 0); sl.appendChild(m.el); sl.append(gEl('span', '', s)); $(li,'.ppr-sl').appendChild(sl); r.subEls.push(m); });
      r.ss.put(NO, true);
      rows.splice(at, 0, r); const nxt = rows[at + 1]; ls.insertBefore(li, nxt ? nxt.li : null);
      r.hb.onclick = () => { if (!r.subs.length && r.st !== 'fail') return; const open = r.userOpen != null ? r.userOpen : (r.st === 'run' || r.st === 'fail'); r.userOpen = !open; r.hb.setAttribute('aria-expanded', !open); };
      r.skip.onclick = () => skipRow(r); $(li,'.ppr-sk2').onclick = () => skipRow(r); $(li,'.ppr-rty').onclick = () => retry(r);
      r.slot.open(true); return r; };
    const startNext = () => { while (cur < rows.length && (rows[cur].st === 'done' || rows[cur].st === 'skip')) cur++;
      complete = cur >= rows.length; halted = false; if (!complete){ const r = rows[cur]; if (r.st === 'pend'){ setSt(r, 'run'); r.t0 = rt; r.sd = 0; acc = 0; say(`Starting ${r.t}`); } else if (r.st === 'fail') halted = true; } else say('Plan finished'); refresh(); };
    const skipRow = r => { if (r.st === 'done' || r.st === 'skip') return; const was = rows.indexOf(r) === cur; setSt(r, 'skip'); r.tEnd = rt; skipped++; skD.set(String(skipped)); r.dim.set(.55, S.base); say(`Skipped ${r.t}`); if (was) startNext(); else refresh(); };
    const retry = r => { if (r.st !== 'fail') return; r.retried = true; retries++; rtD.set(String(retries)); setSt(r, 'run'); acc = 0; halted = false; say(`Retrying ${r.t}`); refresh(); };
    const finishRow = r => { setSt(r, 'done'); r.tEnd = rt; say(`${r.t} done`); startNext(); };
    const openAdd = v => { addOpen = v; afs.open(v); add.setAttribute('aria-expanded', v); if (v) setTimeout(() => inp.focus({ preventScroll:true }), 120); else add.focus({ preventScroll:true }); };
    const submit = () => { const t = inp.value.trim(); if (!t){ inp.focus(); return; } const at = complete ? rows.length : Math.min(rows.length, cur + 1); mkRow({ t, subs:[] }, at); inp.value = ''; openAdd(false); say(`Added step ${t}`); if (complete){ complete = false; cur = at; startNext(); } else refresh(); };
    add.onclick = () => openAdd(!addOpen); no.onclick = () => openAdd(false); ok.onclick = submit;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); submit(); } else if (e.key === 'Escape'){ e.stopPropagation(); openAdd(false); } });
    const reset = () => { rows.forEach(r => r.li.remove()); rows = []; PLAN.forEach(d => mkRow(d, rows.length)); cur = 0; acc = 0; rt = 0; retries = 0; skipped = 0; complete = false; halted = false; rtD.set('0'); skD.set('0'); fT.jump(0); pd.set('0', true); startNext(); };
    re.onclick = reset;
    PLAN.forEach(d => mkRow(d, rows.length)); fT.jump(0); pd.set('0', true); rtD.set('0', true); skD.set('0', true); e1.set('0', true); e2.set('00', true); afs.jump(0); startNext(); ms.s.forEach(e => e.style.opacity = 1);
    return t => {
      gDrain(Q, t);
      const dt = last == null ? 0 : Math.min(.1, Math.max(0, t - last)); last = t;
      const r = rows[cur];
      if (r && r.st === 'run' && !complete){ rt += dt; acc += dt;
        if (r.subs.length){ while (acc >= SUBT && r.st === 'run'){ acc -= SUBT; if (r.fail && r.sd === r.fail.sub && !r.retried){ setSt(r, 'fail'); halted = true; $(r.li,'.ppr-fm').textContent = r.fail.msg; r.fb.hidden = false; say(`${r.t} failed. ${r.fail.msg}`); refresh(); break; } r.sd++; if (r.sd >= r.subs.length){ finishRow(r); break; } refresh(); } }
        else if (acc >= 1.4) finishRow(r); }
      const secs = Math.floor(rt); if (secs !== esec){ esec = secs; e1.set(String(Math.floor(secs/60))); e2.set(String(secs % 60).padStart(2, '0')); }
      fill.style.transform = `scaleX(${clamp(fT.at(t)).toFixed(4)})`; fill.style.width = '100%';
      pd.render(t); e1.render(t); e2.render(t); rtD.render(t); skD.render(t); ms.render(t); now_.render(t); nx.render(t); afs.render(t);
      rows.forEach((r, i) => { r.slot.render(t); r.mark.render(t);
        const want = r.userOpen != null ? r.userOpen : (r.st === 'run' || r.st === 'fail') && (r.subs.length > 0 || r.st === 'fail'); if (want !== r.lastOpen){ r.lastOpen = want; r.dt.open(want); r.hb.setAttribute('aria-expanded', want); }
        r.dt.render(t); r.ss.render(t);
        const sdone = r.st === 'done' ? r.subs.length : r.sd; r.subEls.forEach((m, k) => m.set(r.st === 'skip' && k >= sdone ? 0 : k < sdone ? 2 : k === sdone ? (r.st === 'fail' ? 3 : r.st === 'run' ? 1 : 0) : 0)); r.subEls.forEach(m => m.render(t));
        const txt = r.st === 'pend' ? NO : r.st === 'run' ? (r.subs[r.sd] ? r.subs[r.sd] + '…' : 'Working…') : r.st === 'done' ? 'Done' : r.st === 'fail' ? `Failed at “${r.subs[r.fail.sub]}”` : 'Skipped'; if (txt !== r.txt){ r.txt = txt; r.ss.put(txt); }
        const d = r.st === 'pend' ? '' : ((r.tEnd == null ? rt : r.tEnd) - r.t0).toFixed(1) + 's'; if (r.st === 'skip') r.du.textContent = ''; else if (d !== r.du.textContent) r.du.textContent = d;
        const dm = clamp(r.dim.at(t)); r.hb.style.opacity = (r.st === 'pend' ? .75 : dm).toFixed(3); r.tt.style.textDecoration = r.st === 'skip' ? 'line-through' : 'none'; r.skip.style.visibility = r.st === 'done' || r.st === 'skip' ? 'hidden' : 'visible'; r.skip.style.display = r.st === 'fail' ? 'none' : ''; r.fb.hidden = r.st !== 'fail'; });
    };
  }});

/* ================================================================ 5. Inline approval */
atom({ id:'approvalinline', cat:'Agent activity', name:'Approval on the page', block:'Agent approvals · inline ask', fam:['M','S','X','E'], wide:true, tall:true,
  html:`<style>
${gPageCSS('aip')}
.aia-root{position:absolute;inset:0;container-type:inline-size;padding:12px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.aia-top{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.aia-sc{display:flex;gap:6px;flex:1 1 auto;flex-wrap:wrap}
.aia-sc button{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border:0;border-radius:15px;background:var(--raised);cursor:pointer;font-size:12.5px;font-weight:500;white-space:nowrap}
.aia-top>.btn{height:30px;padding:0 12px;font-size:12.5px}
.aia-body{flex:none;display:flex;flex-direction:column;gap:10px;align-items:stretch}
.aia-main{min-width:0;display:flex;justify-content:center}.aip-fr{max-width:480px}
.aia-ru{flex:none;background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:12px 14px}
.aia-ru h4{margin:0;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:600}.aia-ru h4 span{font-weight:400;font-size:12px;color:var(--muted)}
.aia-rl{list-style:none;margin:0;padding:0}.aia-rr{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line-soft);font-size:13px;line-height:20px}
.aia-rr .aia-ri{flex:none;width:24px;height:24px;border-radius:12px;background:var(--success-tint);color:var(--success);display:grid;place-items:center}.aia-rr span.aia-rt{flex:1;min-width:0}.aia-rr small{display:block;font-size:12px;line-height:16px;color:var(--muted)}
.aia-rr .btn{height:28px;padding:0 10px;font-size:12.5px;flex:none}
.aia-em{margin:8px 0 0;font-size:12.5px;line-height:18px;color:var(--muted)}
.aia-pp{position:absolute;left:0;top:0;z-index:30;border-radius:14px;box-shadow:var(--shadow);background:var(--card);visibility:hidden}
.aia-ar{position:absolute;width:12px;height:12px;background:var(--card);transform:rotate(45deg)}
.aia-pb{position:relative;overflow:hidden;border-radius:13px}
.aia-l{position:absolute;left:0;right:0;top:0;padding:14px}
.aia-hd{display:flex;align-items:flex-start;gap:10px}.aia-hi{flex:none;width:30px;height:30px;border-radius:15px;background:var(--raised);display:grid;place-items:center}
.aia-hd h5{margin:0;font-size:14px;line-height:20px;font-weight:600}.aia-hd p{margin:0;font-size:12px;line-height:17px;color:var(--muted)}
.aia-sm{margin:10px 0 0;font-size:11.5px;line-height:16px;font-weight:600;color:var(--muted)}
.aia-dl{margin:4px 0 0;border-radius:9px;background:var(--bg);padding:7px 10px;font-size:12px;line-height:19px}
.aia-dl div{display:flex;gap:10px;justify-content:space-between}.aia-dl dt{color:var(--muted);flex:none}.aia-dl dd{margin:0;font-family:var(--mono);font-size:11.5px;text-align:right;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.aia-dl .aia-rq{display:block;font:500 11.5px/18px var(--mono);color:var(--ink);margin-bottom:2px}
.aia-ef{margin:8px 0 0;padding:0;list-style:none;font-size:12.5px;line-height:19px;color:var(--ink)}.aia-ef li{display:flex;gap:7px}.aia-ef svg{flex:none;margin-top:2px;color:var(--danger)}
.aia-cf{margin-top:10px;font-size:12px;line-height:17px;color:var(--muted)}.aia-cf label{display:block;margin-bottom:4px}.aia-cf code{font:500 12px var(--mono);color:var(--ink)}
.aia-ci{position:relative}.aia-ci input{width:100%;height:34px;border:1.5px solid var(--muted);border-radius:8px;background:var(--card);color:var(--ink);padding:0 32px 0 10px;font:13px var(--mono)}
.aia-ck{position:absolute;right:9px;top:50%;margin-top:-8px;color:var(--success);display:flex}
.aia-bt{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.aia-bt .btn{flex:1 1 auto;height:34px;padding:0 12px;font-size:13px;white-space:nowrap}
.aia-bt .btn:disabled{cursor:default}
.aia-nt{margin:8px 0 0;font-size:11.5px;line-height:16px;color:var(--muted)}
.aia-rs{display:flex;align-items:flex-start;gap:10px}.aia-rs b{display:block;font-size:13.5px;line-height:20px}.aia-rs span.aia-rd{display:block;font-size:12.5px;line-height:18px;color:var(--muted)}
@container (min-width:760px){.aia-body{flex-direction:row;align-items:flex-start}.aia-main{flex:1 1 0}.aia-ru{width:260px}}
</style>
<div class="aia-root"><div class="aia-top"><div class="aia-sc" role="group" aria-label="Choose what the assistant asks about"><button type="button" data-sc="submit">${gi('send', 14, 2)}<span>Submit a form</span></button><button type="button" data-sc="delete">${gi('trash', 14, 2)}<span>Delete a workspace</span></button></div><button type="button" class="btn aia-again">Ask again</button></div>
<div class="aia-body"><div class="aia-main">${gPageHTML('aip', { label:'Page the assistant is working on' })}</div><aside class="aia-ru" aria-label="Always allowed actions"><h4>Always allowed<span class="aia-rc"></span></h4><ul class="aia-rl"></ul><p class="aia-em">Nothing yet. Choosing Always allow adds a rule here.</p></aside></div>
<div class="aia-pp" role="dialog" aria-labelledby="aia-ttl" aria-label="Assistant is asking for approval"><i class="aia-ar"></i><div class="aia-pb"><div class="aia-l aia-ask"></div><div class="aia-l aia-res"></div></div></div>
<div class="aia-live" role="status" aria-live="polite" style="${SR}"></div></div>`,
  desc:'Assistant’s cursor walks to the button and stops, the page dims, a ring closes on the button (leading edge first) and the popover grows out of it, above or below depending on room. The popover lists exactly what will be sent. Risky actions add a typed confirmation: the Allow once button stays off until the name matches and a check swaps into the field. A choice swaps the ask for its result and the popover height eases to fit; Always allow also slides a rule into the list.',
  api:'cursor.go(spot) → scrim.set(1), ring.go(spot), pop(el, p, ±6)   ask.swap(result) + follow(height)   risky ? allow.enabled = (input === phrase) : true   always → rules.insert(slot.open)',
  init(st){
    const SC = {
      submit:{ spot:'create', view:'signup', ok:'Allowed once', title:'Submit this form?', sub:'Assistant · northwind.app/signup', ic:'send', risky:false,
        req:'POST northwind.app/signup', rows:[['Work email', 'maya@northwind.com'], ['Company', 'Northwind Studio'], ['Team size', '11 to 50'], ['Plan', 'Team trial, 14 days']],
        done:{ once:['Allowed once', 'Assistant submitted the form. The account was created.'], always:['Always allowed on northwind.app', 'Assistant submitted the form and will not ask again for form submits here.'], deny:['Denied', 'Assistant did not submit. It will skip this step and say so in the run summary.'] }, rule:'Submit forms on northwind.app' },
      delete:{ spot:'delete', view:'settings', title:'Delete this workspace?', sub:'Assistant · northwind.app/settings', ic:'trash', risky:true, phrase:'northwind-studio',
        effects:['Deletes Northwind Studio for all 4 members', 'Removes 214 invoices and 18 clients', 'This cannot be undone'],
        done:{ once:['Allowed once', 'Assistant deleted the workspace. Nothing else was changed.'], deny:['Denied', 'Assistant did not delete anything. The workspace is unchanged.'] } } };
    const root = $(st,'.aia-root'), pp = $(st,'.aia-pp'), ar = $(st,'.aia-ar'), pb = $(st,'.aia-pb'), askL = $(st,'.aia-ask'), resL = $(st,'.aia-res'), live = $(st,'.aia-live'), again = $(st,'.aia-again'), scs = $$(st,'.aia-sc button');
    const rl = $(st,'.aia-rl'), em = $(st,'.aia-em'), rc = $(st,'.aia-rc');
    const pg = gPage(st, 'aip'), ag = gCursor(pg.ov, 'Assistant', 'ink'), ring = gRing(pg.ov, 5);
    const scrim = gEl('div', 'position:absolute;inset:0;background:var(--ink);opacity:0;pointer-events:none;z-index:5'); pg.ov.appendChild(scrim);
    const fol = gFollow(pb), sw = new Swap(0), pT = new Track(0), scrimT = new Track(0), scW = scs.map(() => new Track(0)), ctr = gEl('div');
    let sc = 'submit', phase = 'idle', side = 'above', rules = [], inputOk = new Track(0), okT = 0, input = null, ckEl = null, allowBtn = null, lastW = 0, closeAt = 0;
    const Q = [], say = s => { live.textContent = s; };
    const rowsHtml = a => a.map(r => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('');
    const build = () => { const c = SC[sc];
      askL.innerHTML = `<div class="aia-hd"><span class="aia-hi" style="${c.risky ? 'background:var(--danger-tint);color:var(--danger)' : ''}">${gi(c.ic, 16, 2)}</span><div><h5 id="aia-ttl">${c.title}</h5><p>${c.sub}</p></div></div>`
        + (c.risky ? `<ul class="aia-ef">${c.effects.map(e => `<li>${gi('tri', 14, 2)}<span>${e}</span></li>`).join('')}</ul><div class="aia-cf"><label for="aia-confirm">Type <code>${c.phrase}</code> to confirm</label><div class="aia-ci"><input id="aia-confirm" autocomplete="off" spellcheck="false"><span class="aia-ck">${gi('check', 16, 2.6)}</span></div></div>`
          : `<p class="aia-sm">What will be sent</p><dl class="aia-dl"><span class="aia-rq">${c.req}</span>${rowsHtml(c.rows)}</dl>`)
        + `<div class="aia-bt"><button type="button" class="btn aia-no">Deny</button><button type="button" class="btn ink aia-once">Allow once</button>${c.risky ? '' : '<button type="button" class="btn aia-alw">Always allow</button>'}</div><p class="aia-nt">${c.risky ? 'Risky actions always ask. Always allow is not offered.' : 'Always allow applies to form submits on northwind.app.'}</p>`;
      input = $(askL,'#aia-confirm'); ckEl = $(askL,'.aia-ck'); allowBtn = $(askL,'.aia-once');
      $(askL,'.aia-no').onclick = () => decide('deny'); allowBtn.onclick = () => decide('once'); const a = $(askL,'.aia-alw'); if (a) a.onclick = () => decide('always');
      inputOk.jump(c.risky ? 0 : 1); if (c.risky){ allowBtn.disabled = true; input.addEventListener('input', () => { const m = input.value.trim() === c.phrase; allowBtn.disabled = !m; inputOk.set(m ? 1 : 0, S.base); }); input.addEventListener('keydown', e => { if (e.key === 'Enter' && !allowBtn.disabled) decide('once'); }); }
      pp.setAttribute('aria-labelledby', 'aia-ttl'); };
    const result = (d) => { const c = SC[sc], r = c.done[d], bad = d === 'deny', warn = d !== 'deny' && c.risky;
      resL.innerHTML = `<div class="aia-rs"><span class="aia-hi" style="background:${bad ? 'var(--raised)' : warn ? 'var(--danger-tint)' : 'var(--success-tint)'};color:${bad ? 'var(--muted)' : warn ? 'var(--danger)' : 'var(--success)'}">${gi(bad ? 'x' : 'check', 15, 2.6)}</span><div><b>${r[0]}</b><span class="aia-rd">${r[1]}</span></div></div>`; };
    const place = () => { const rr = root.getBoundingClientRect(), fr = pg.fr.getBoundingClientRect(), a = pg.rect(SC[sc].spot); const ax = fr.left - rr.left + pg.fr.clientLeft + a.x, ay = fr.top - rr.top + pg.fr.clientTop + a.y;
      const W = Math.min(340, root.clientWidth - 24), H = pp.offsetHeight, x = clamp(ax + a.w/2 - W/2, 12, root.clientWidth - W - 12);
      if (phase === 'ask' && side === 'x') side = 'above';
      const above = side === 'above'; let y = above ? ay - H - 14 : ay + a.h + 14;
      pp.style.width = W + 'px'; pp.style.left = px(x); pp.style.top = px(y); pp.style.transformOrigin = `${(ax + a.w/2 - x).toFixed(0)}px ${above ? '100%' : '0'}`;
      const axc = clamp(ax + a.w/2 - x, 20, W - 20); ar.style.left = px(axc - 6); ar.style.top = above ? 'auto' : '-7px'; ar.style.bottom = above ? '-7px' : 'auto';
      ar.style.borderWidth = above ? '0 1px 1px 0' : '1px 0 0 1px'; return { ax, ay, a, H }; };
    const chooseSide = () => { const rr = root.getBoundingClientRect(), fr = pg.fr.getBoundingClientRect(), a = pg.rect(SC[sc].spot); const ay = fr.top - rr.top + a.y; const H = (sw.cur === 1 ? resL : askL).offsetHeight + 2; side = ay - H - 14 >= 8 ? 'above' : 'below'; };
    const setRules = () => { rc.textContent = rules.length ? `${rules.length}` : ''; em.hidden = rules.length > 0; };
    const addRule = text => { if (rules.some(r => r.text === text)) return; const li = gEl('li'); li.innerHTML = `<div class="aia-rin"><div class="aia-rr"><span class="aia-ri">${gi('shield', 14, 2)}</span><span class="aia-rt">${text}<small>Added just now</small></span><button type="button" class="btn">Revoke</button></div></div>`;
      const r = { text, li, slot:gSlot(li, $(li,'.aia-rin'), 0) }; $(li,'.btn').setAttribute('aria-label', `Revoke: ${text}`); $(li,'.btn').onclick = () => { r.slot.open(false); gPush(Q, now() + .5, () => { li.remove(); rules = rules.filter(x => x !== r); setRules(); }); say(`Revoked ${text}`); };
      rl.appendChild(li); r.slot.open(true); rules.push(r); setRules(); };
    const openAsk = () => { build(); phase = 'ask'; sw.cur = 0; sw.prev = null; sw.t = -9; sw.prev = null; sw.t = -9; fol.to(askL, true); chooseSide(); pT.set(1, S.base); scrimT.set(1, S.base);
      const sp = pg.rect(SC[sc].spot); ring.to(sp); say(`${SC[sc].title} Assistant is waiting for your answer.`); gPush(Q, now() + .2, () => { if (phase === 'ask') (input || allowBtn).focus({ preventScroll:true }); }); };
    const close = () => { pT.set(0, S.snap); scrimT.set(0, S.base); ring.hide(); };
    const decide = d => { if (phase !== 'ask') return; phase = 'result'; result(d); sw.to(1); fol.to(resL); const t = now(); say(`${SC[sc].done[d][0]}. ${SC[sc].done[d][1]}`);
      if (d === 'always') addRule(SC.submit.rule);
      if (d === 'deny'){ gPush(Q, t + .5, () => { const w = pg.rect('page'); ag.go(w.w*.78, w.h*.3 + 30, false); }); }
      else { gPush(Q, t + .5, () => { ring.hide(); pg.view(sc === 'submit' ? 'done' : 'gone'); pg.url(sc === 'submit' ? '/signup/done' : '/settings/deleted'); pg.mirror(); }); }
      gPush(Q, t + 2.8, () => { if (phase === 'result'){ phase = 'done'; close(); } });
      scs[sc === 'submit' ? 0 : 1].focus({ preventScroll:true }); };
    const start = key => { sc = key; phase = 'move'; Q.length = 0; pT.jump(0); scrimT.jump(0); ring.W.jump(0); pg.clear(); const c = SC[key]; pg.view(c.view, true); pg.url(c.view === 'signup' ? '/signup' : '/settings', true);
      if (key === 'submit'){ pg.set('email', 'maya@northwind.com'); pg.set('company', 'Northwind Studio'); pg.set('size', '11 to 50'); }
      scW.forEach((w, i) => w.set(i === (key === 'submit' ? 0 : 1) ? 1 : 0, S.base)); scs.forEach((b, i) => b.setAttribute('aria-pressed', i === (key === 'submit' ? 0 : 1)));
      const fw = pg.rect('page'); ag.go(fw.w*.85, 40, true); ag.W.jump(0); ag.show(true); const t = now();
      gPush(Q, t + .5, () => { const p = pg.center(c.spot); ag.go(p.x, p.y, false); });
      gPush(Q, t + 1.7, () => { if (key === 'submit' && rules.length){ phase = 'result'; resL.innerHTML = `<div class="aia-rs"><span class="aia-hi" style="background:var(--success-tint);color:var(--success)">${gi('shield', 15, 2)}</span><div><b>Allowed by your rule</b><span class="aia-rd">${SC.submit.rule}. Assistant did not need to ask.</span></div></div>`; sw.cur = 1; sw.prev = null; sw.t = -9; fol.to(resL, true); chooseSide(); pT.set(1, S.base); say('Allowed by your rule. Assistant submitted the form.');
          gPush(Q, now() + .6, () => { pg.view('done'); pg.url('/signup/done'); pg.mirror(); }); gPush(Q, now() + 2.4, () => { phase = 'done'; close(); }); } else openAsk(); }); };
    scs.forEach((b, i) => b.onclick = () => start(i === 0 ? 'submit' : 'delete')); again.onclick = () => start(sc);
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && phase === 'ask'){ e.stopPropagation(); decide('deny'); } });
    pg.render(0); start('submit'); setRules(); resL.innerHTML = ''; fol.cur = askL;
    return t => {
      gDrain(Q, t);
      const w = pg.fr.clientWidth; if (w !== lastW){ lastW = w; if (phase === 'ask' || phase === 'result'){ chooseSide(); ring.W.target && ring.to(pg.rect(SC[sc].spot), true); } if (phase === 'move'){ const p = pg.center(SC[sc].spot); ag.go(p.x, p.y, true); } }
      pg.render(t); ag.render(t); ring.render(t);
      const p = clamp(pT.at(t)); sw.apply(askL, 0, t, 0); sw.apply(resL, 1, t, 0); askL.style.pointerEvents = sw.cur === 0 ? 'auto' : 'none'; resL.style.pointerEvents = sw.cur === 1 ? 'auto' : 'none'; askL.inert = sw.cur !== 0; resL.inert = sw.cur !== 1;
      fol.render(t); place(); pop(pp, p, side === 'above' ? 6 : -6); ar.style.opacity = '1';
      scrim.style.opacity = (clamp(scrimT.at(t))*.1).toFixed(3);
      scW.forEach((wv, i) => { const v = clamp(wv.at(t)); scs[i].style.background = mix(v, 'var(--ink)', 'var(--card)'); scs[i].style.color = mix(v, 'var(--card)', 'var(--ink)'); scs[i].style.borderColor = mix(v, 'var(--ink)', 'var(--line)'); });
      slots(t);
      if (allowBtn){ const ok = clamp(inputOk.at(t)); const risky = SC[sc].risky; allowBtn.style.background = risky ? mixc(ok) : 'var(--ink)'; allowBtn.style.borderColor = risky ? mixc(ok) : 'var(--ink)'; allowBtn.style.opacity = (.45 + .55*ok).toFixed(3); if (ckEl){ ckEl.style.opacity = ok.toFixed(3); ckEl.style.transform = `scale(${(.8 + .2*ok).toFixed(3)})`; } }
    };
    function slots(t){ rules.forEach(r => r.slot.render(t)); }
    function mixc(ok){ return `color-mix(in oklab, var(--danger) ${(ok*100).toFixed(1)}%, var(--muted))`; }
  }});

/* ================================================================ 6. Run replay */
atom({ id:'runreplay', cat:'Agent activity', name:'Agent run replay', block:'Agent run · replay scrubber', fam:['D','T','E','S'], wide:true, tall:true,
  html:`<style>
${gPageCSS('rpg')}
.rrp-root{position:absolute;inset:0;container-type:inline-size;padding:12px;display:flex;flex-direction:column;gap:10px}
.rrp-body{flex:1;min-height:0;display:flex;flex-direction:column;gap:10px}
.rrp-main{flex:none;min-width:0;display:flex;justify-content:center}
.rrp-ev{flex:1;min-height:0;min-width:0;display:flex;flex-direction:column;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:hidden}
.rrp-eh{flex:none;display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--line-soft);font-size:13px;font-weight:600}.rrp-eh span{font-size:12px;font-weight:400;color:var(--muted)}
.rrp-ls{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;list-style:none;margin:0;padding:0;scrollbar-width:thin;position:relative}
.rrp-r{display:flex;align-items:center;gap:10px;width:100%;border:0;border-bottom:1px solid var(--line-soft);background:none;padding:7px 12px;min-height:46px;text-align:left;cursor:pointer;color:inherit}
.rrp-tm{flex:none;width:34px;font-size:12px;color:var(--muted)}
.rrp-ic{flex:none;width:24px;height:24px;border-radius:12px;display:grid;place-items:center}
.rrp-tx{flex:1;min-width:0}.rrp-tx b{display:block;font-size:13px;line-height:19px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rrp-tx span{display:block;font-size:12px;line-height:16px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rrp-tp{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:10px 12px}
.rrp-pl{position:relative;flex:none;width:38px;height:38px;border-radius:19px;border:0;background:var(--ink);color:var(--card);cursor:pointer;padding:0}
.rrp-pl>span{position:absolute;inset:0;display:grid;place-items:center}
.rrp-ck{flex:none;font-size:13px;font-weight:500;min-width:86px}.rrp-ck span{color:var(--muted);font-weight:400}
.rrp-sp{display:flex;gap:4px;flex:none;margin-left:auto;order:2}.rrp-sp button{height:30px;min-width:40px;padding:0 10px;border:0;border-radius:15px;background:var(--raised);cursor:pointer;font-size:12.5px;font-weight:600}
.rrp-sb{position:relative;flex:1 1 220px;order:3;min-width:0;height:52px;touch-action:none;cursor:pointer;border-radius:8px}
.rrp-tr{position:absolute;left:8px;right:8px;top:38px;height:4px;border-radius:2px;background:var(--raised)}
.rrp-pf{position:absolute;left:8px;right:8px;top:38px;height:4px;border-radius:2px;background:var(--ink);transform-origin:0 0}
.rrp-tks i{position:absolute;top:22px;width:2px;height:12px;margin-left:-1px;border-radius:1px;background:var(--faint)}
.rrp-ph{position:absolute;left:0;top:0;width:0;height:52px;pointer-events:none}
.rrp-ph .rrp-ln{position:absolute;left:-1px;top:20px;width:2px;height:22px;background:var(--ink)}
.rrp-ph .rrp-hd{position:absolute;left:-8px;top:32px;width:16px;height:16px;border-radius:8px;background:var(--card);border:2px solid var(--ink);box-shadow:var(--shadow)}
.rrp-ph .rrp-bb{position:absolute;left:0;top:0;transform:translateX(-50%);height:20px;padding:0 7px;border-radius:10px;background:var(--ink);color:var(--card);font-size:11.5px;font-weight:600;line-height:20px;white-space:nowrap}
@container (min-width:700px){.rrp-body{flex-direction:row}.rrp-main{flex:1 1 0}.rpg-fr{max-width:500px}.rrp-ev{flex:0 0 300px}.rrp-tp{flex-wrap:nowrap}.rrp-sb{order:0}.rrp-sp{order:0;margin-left:0}}
@container (max-width:699px){.rrp-ev{flex:1}.rrp-pl{order:0}}
</style>
<div class="rrp-root"><div class="rrp-body"><div class="rrp-main">${gPageHTML('rpg', { label:'Replay of the page at the playhead' })}</div>
<section class="rrp-ev" aria-label="Run events"><div class="rrp-eh">Events<span class="rrp-ec"></span></div><ul class="rrp-ls"></ul></section></div>
<div class="rrp-tp"><button type="button" class="rrp-pl" aria-label="Play"><span>${gi('play', 16, 2)}</span><span>${gi('pause', 16, 2.4)}</span></button><div class="rrp-ck num"></div>
<div class="rrp-sp" role="group" aria-label="Playback speed"><button type="button" data-s="1" aria-pressed="true">1×</button><button type="button" data-s="2" aria-pressed="false">2×</button></div>
<div class="rrp-sb" role="slider" tabindex="0" aria-label="Run position" aria-valuemin="0" aria-valuemax="24" aria-valuenow="0"><div class="rrp-tr"></div><div class="rrp-pf"></div><div class="rrp-tks"></div><div class="rrp-ph"><i class="rrp-ln"></i><i class="rrp-hd"></i><span class="rrp-bb">0:00</span></div></div></div>
<div class="rrp-live" role="status" aria-live="polite" style="${SR}"></div></div>`,
  desc:'The playhead is the only state: the page, the cursor, the typed text, the pins and the highlighted event are all pure functions of its position. Dragging it moves 1:1 and the page jumps to that moment; on release it coasts a few pixels from your release velocity. Play advances it at 1× or 2×, the event row at the playhead lifts and the list scrolls to keep it centred, and clicking a row glides the playhead there on a spring.',
  api:'ph = drag ? pointer.x : coast(release.v) | play ? ph + dt·speed : ph   state = derive(ph)   page.view/url/fields/pins = state   cursor.at(ph) = lerp(spotᵢ, spotᵢ₊₁, ease)   row.now = last(at ≤ ph)',
  init(st){
    const END = 24;
    const E = [
      { at:1.4, k:'nav', t:'Navigated to /pricing', sub:'northwind.app/pricing', spot:'url', v:'pricing', u:'/pricing' },
      { at:3.0, k:'click', t:'Clicked “Yearly”', sub:'Billing toggle', spot:'toggle', tog:true },
      { at:5.0, k:'click', t:'Clicked “Start free”', sub:'Free plan card', spot:'start' },
      { at:6.6, k:'nav', t:'Navigated to /signup', sub:'northwind.app/signup', spot:'url', v:'signup', u:'/signup' },
      { at:8.0, k:'type', t:'Typed in Work email', sub:'maya@northwind.com', spot:'email', f:'email', val:'maya@northwind.com', dur:1.8 },
      { at:11.0, k:'type', t:'Typed in Company', sub:'Northwind Studio', spot:'company', f:'company', val:'Northwind Studio', dur:1.6 },
      { at:13.5, k:'type', t:'Typed in Team size', sub:'11 to 50', spot:'size', f:'size', val:'11 to 50', dur:1 },
      { at:15.6, k:'shot', t:'Took screenshot', sub:'signup-form.png', spot:'page' },
      { at:17.2, k:'comment', t:'Left comment', sub:'No “Just me” option for team size', spot:'size', pin:'c1' },
      { at:19.2, k:'click', t:'Clicked “Create account”', sub:'Submitted the form', spot:'create' },
      { at:20.6, k:'nav', t:'Navigated to /signup/done', sub:'northwind.app/signup/done', spot:'url', v:'done', u:'/signup/done' },
      { at:22.4, k:'shot', t:'Took screenshot', sub:'confirmation.png', spot:'page' } ];
    const pg = gPage(st, 'rpg'), ag = gCursor(pg.ov, 'Assistant', 'ink'), ring = gRing(pg.ov);
    const sb = $(st,'.rrp-sb'), pf = $(st,'.rrp-pf'), tks = $(st,'.rrp-tks'), phE = $(st,'.rrp-ph'), bb = $(st,'.rrp-bb'), ls = $(st,'.rrp-ls'), ck = $(st,'.rrp-ck'), play = $(st,'.rrp-pl'), live = $(st,'.rrp-live'), ec = $(st,'.rrp-ec');
    const spds = $$(st,'.rrp-sp button'), pls = $$(play, ':scope>span'), psw = new Swap(0), bT = new Track(0), sT = spds.map((b, i) => new Track(i ? 0 : 1));
    ec.textContent = `${E.length} events`;
    const ticks = E.map(e => { const i = gEl('i'); tks.appendChild(i); return i; });
    const rows = E.map((e, i) => { const li = gEl('li'); li.innerHTML = `<button type="button" class="rrp-r"><span class="rrp-tm num">${gfmt(e.at)}</span><span class="rrp-ic">${gi(KIND[e.k].ic, 14, 2)}</span><span class="rrp-tx"><b></b><span></span></span></button>`;
      $(li,'b').textContent = e.t; $(li,'.rrp-tx span').textContent = e.sub; ls.appendChild(li); const b = $(li,'.rrp-r'); b.onclick = () => seek(e.at + .05); return { li, b, ic:$(li,'.rrp-ic'), cw:new Track(0), pw:new Track(0) }; });
    const pt = new Track(0, S.base), scT = new Track(0, S.soft); let playing = true, dragging = false, was = false, spd = 1, last = null, curI = -1, lastW = 0, hover = false, txt = '', lastView = null, lastTog = null, ringI = -2, pinSt = {};
    const startPos = () => { const w = pg.rect('page'); return { x:w.w*.74, y:52 }; };
    const trackW = () => Math.max(40, sb.clientWidth - 16);
    const xOf = s => 8 + clamp(s/END)*trackW();
    const say = s => { live.textContent = s; };
    const setPlaying = v => { playing = v; psw.to(v ? 1 : 0); play.setAttribute('aria-label', v ? 'Pause' : 'Play'); };
    const seek = s => { pt.set(clamp(s, 0, END), S.base); };
    const curIdx = ph => { let c = -1; E.forEach((e, i) => { if (e.at <= ph) c = i; }); return c; };
    const center = i => pg.center(E[i].spot);
    const arr = i => E[i].at - .1;
    const cursorAt = ph => { if (ph < arr(0) - .8) return null; const p0 = startPos();
      if (ph < arr(0)){ const c = center(0), u = ease((ph - (arr(0) - .8))/.8); return { x:lerp(p0.x, c.x, u), y:lerp(p0.y, c.y, u) }; }
      let i = 0; for (let k = 0; k < E.length; k++) if (arr(k) <= ph) i = k;
      const c = center(i); if (i === E.length - 1) return c; const gap = arr(i + 1) - arr(i), dep = arr(i + 1) - Math.min(.7, gap);
      if (ph < dep) return c; const n = center(i + 1), u = ease((ph - dep)/(arr(i + 1) - dep)); return { x:lerp(c.x, n.x, u), y:lerp(c.y, n.y, u) }; };
    const ease = u => { u = clamp(u); return u*u*(3 - 2*u); };
    const apply = (ph, t) => { let view = 'pricing', url = '/pricing', tog = false; const pins = {};
      E.forEach(e => { if (e.at <= ph){ if (e.v){ view = e.v; url = e.u; } if (e.tog) tog = true; if (e.pin) pins[e.pin] = e.spot; } });
      if (view !== lastView){ pg.view(view); pg.url(url); lastView = view; }
      if (tog !== lastTog){ pg.toggle(tog); lastTog = tog; }
      E.forEach(e => { if (e.f){ const n = ph < e.at ? 0 : Math.floor(clamp((ph - e.at)/e.dur)*e.val.length + (ph >= e.at + e.dur ? 1 : 0)); pg.set(e.f, e.val.slice(0, Math.min(n, e.val.length))); } if (e.pin){ const on = !!pins[e.pin]; if (pinSt[e.pin] !== on){ pinSt[e.pin] = on; pg.pin(e.pin, e.spot, on); } } });
      pg.mirror(); let fl = 0; E.forEach(e => { if (e.k === 'shot' && ph >= e.at && ph - e.at < .7) fl = Math.max(fl, 1 - (ph - e.at)/.7); }); pg.flashSet(fl); };
    let drag_ = false;
    drag(sb, { down:(p, e) => { dragging = true; was = playing; drag_ = true; bT.set(1, S.snap); pt.jump(clamp((p.x - 8)/trackW())*END); }, move:p => { pt.jump(clamp((p.x - 8)/trackW())*END); },
      up:(p, o) => { dragging = false; bT.set(0, S.base); const cur = pt.at(now()); if (was){ setPlaying(true); } else { const v = o.vx/trackW()*END; pt.release(cur, v, clamp(cur + v/S.base.w, 0, END), S.base); } } });
    sb.addEventListener('pointerdown', () => { if (playing){ was = true; } sb.focus({ preventScroll:true }); });
    sb.addEventListener('keydown', e => { const cur = pt.at(now()), step = e.shiftKey ? 5 : 1; let h = true;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') seek(cur + step); else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') seek(cur - step);
      else if (e.key === 'Home') seek(0); else if (e.key === 'End') seek(END);
      else if (e.key === 'PageDown'){ const n = E.find(x => x.at > cur + .05); if (n) seek(n.at + .05); } else if (e.key === 'PageUp'){ const p = [...E].reverse().find(x => x.at < cur - .3); seek(p ? p.at + .05 : 0); }
      else if (e.key === ' '){ play.click(); } else h = false;
      if (h) e.preventDefault(); if (h && e.key !== ' ' && playing) setPlaying(false); });
    play.onclick = () => { if (!playing && pt.at(now()) >= END - .05) pt.jump(0); setPlaying(!playing); say(playing ? 'Playing' : 'Paused'); };
    spds.forEach((b, i) => b.onclick = () => { spd = i ? 2 : 1; spds.forEach((x, j) => { x.setAttribute('aria-pressed', i === j); sT[j].set(i === j ? 1 : 0, S.base); }); say(`${spd} times speed`); });
    ls.addEventListener('pointerenter', () => hover = true); ls.addEventListener('pointerleave', () => hover = false);
    psw.cur = 1; psw.prev = null; psw.t = -9; setPlaying(true); pg.view('pricing', true); pg.url('/pricing', true); ag.show(false, true);
    return t => {
      const dt = last == null ? 0 : Math.min(.1, Math.max(0, t - last)); last = t;
      let ph = pt.at(t);
      if (playing && !dragging){ ph = Math.min(END, ph + dt*spd); pt.jump(ph); if (ph >= END){ setPlaying(false); say('Replay finished'); } }
      ph = clamp(ph, 0, END); if (!dragging && !playing && (pt.at(t) < 0 || pt.at(t) > END)) pt.jump(ph);
      const w = pg.fr.clientWidth; if (w !== lastW){ lastW = w; ringI = -2; }
      pg.render(t); apply(ph, t);
      const ci = curIdx(ph);
      if (ci !== curI){ curI = ci; rows.forEach((r, i) => { r.cw.set(i === ci ? 1 : 0, S.base); r.pw.set(i <= ci ? 1 : 0, S.base); });
        if (!hover && ci >= 0){ const r = rows[ci].li; scT.set(clamp(r.offsetTop - (ls.clientHeight - r.offsetHeight)/2, 0, Math.max(0, ls.scrollHeight - ls.clientHeight))); } else if (!hover) scT.set(0);
        sb.setAttribute('aria-valuetext', `${gfmt(ph)} of ${gfmt(END)}${ci >= 0 ? ', ' + E[ci].t : ''}`); if (playing) say(ci >= 0 ? E[ci].t : ''); }
      if (!hover) ls.scrollTop = scT.at(t);
      const c = cursorAt(ph); if (c){ ag.go(c.x, c.y, true); ag.show(true, true); } else ag.show(false, true);
      if (ci !== ringI){ ringI = ci; if (ci >= 0) ring.to(pg.rect(E[ci].spot), ci < 0); else ring.hide(); } else if (ci >= 0 && w !== lastW) ring.to(pg.rect(E[ci].spot), true);
      ag.render(t); ring.render(t);
      const bw = trackW(); ticks.forEach((i, k) => { i.style.left = px(8 + E[k].at/END*bw); i.style.background = k === ci ? 'var(--accent)' : E[k].at <= ph ? 'var(--ink)' : 'var(--faint)'; i.style.height = k === ci ? '16px' : '12px'; i.style.top = k === ci ? '20px' : '22px'; });
      const x = xOf(ph); phE.style.transform = `translateX(${px(x)})`; pf.style.transform = `scaleX(${(clamp(ph/END)*bw/Math.max(1, sb.clientWidth - 16)).toFixed(4)})`;
      const bv = clamp(bT.at(t)); bb.style.opacity = bv.toFixed(3); bb.style.visibility = bv < .01 ? 'hidden' : 'visible'; bb.style.transform = `translateX(-50%) translateY(${px((1 - bv)*4)})`;
      const s = gfmt(ph); if (s !== txt){ txt = s; bb.textContent = s; ck.innerHTML = `${s} <span>/ ${gfmt(END)}</span>`; sb.setAttribute('aria-valuenow', Math.round(ph)); }
      pls.forEach((e, i) => psw.apply(e, i, t, 0));
      sT.forEach((v, i) => { const wv = clamp(v.at(t)); spds[i].style.background = mix(wv, 'var(--ink)', 'var(--card)'); spds[i].style.color = mix(wv, 'var(--card)', 'var(--ink)'); spds[i].style.borderColor = mix(wv, 'var(--ink)', 'var(--line)'); });
      rows.forEach((r, i) => { const cv = clamp(r.cw.at(t)), pv = clamp(r.pw.at(t)); r.b.style.background = mix(cv, 'var(--accent-tint)', 'transparent'); r.b.style.opacity = (.55 + .45*pv).toFixed(3); r.ic.style.background = mix(cv, 'var(--accent)', 'var(--raised)'); r.ic.style.color = mix(cv, 'var(--card)', 'var(--muted)'); });
    };
  }});

/* ================================================================ 7. Agent lanes */
atom({ id:'agentlanes', cat:'Agent activity', name:'Multi-agent lanes', block:'Agent run · parallel agents', fam:['E','M','T','S'], wide:true, tall:true,
  html:`<style>
.agl-root{position:absolute;inset:0;container-type:inline-size;padding:12px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.agl-top{flex:none;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 12px}
.agl-top h4{margin:0;font-size:14px;line-height:20px;font-weight:600}.agl-sub{font-size:12.5px;line-height:18px;color:var(--muted)}
.agl-bs{display:flex;align-items:center;gap:8px}.agl-bs .btn{height:30px;padding:0 12px;font-size:12.5px}.agl-clk{font-size:13px;font-weight:500;min-width:84px;text-align:right}.agl-clk span{color:var(--muted);font-weight:400}
.agl-card{flex:none;background:var(--card);border-radius:14px;box-shadow:var(--shadow);overflow:hidden}
.agl-lns{position:relative;padding-top:24px}
.agl-ls{list-style:none;margin:0;padding:0}
.agl-ln{position:relative;border-top:1px solid var(--line-soft);display:grid;grid-template-columns:184px minmax(0,1fr)}
.agl-hd{display:flex;align-items:center;gap:10px;min-width:0;border:0;background:none;padding:0 8px 0 12px;text-align:left;cursor:pointer;color:inherit;border-radius:0}
.agl-av{flex:none;width:30px;height:30px;border-radius:10px;background:var(--raised);display:grid;place-items:center}
.agl-nm{min-width:0;flex:1}.agl-nm b{display:block;font-size:13px;line-height:18px;font-weight:600;white-space:nowrap}.agl-st{position:relative;display:block;height:17px;font-size:12px;color:var(--muted)}
.agl-sm{flex:none;display:block;border-radius:50%;background:var(--card)}
.agl-ov{position:absolute;left:0;right:0;top:0;bottom:0;pointer-events:none}
.agl-rt{position:absolute;top:4px;font-size:11.5px;color:var(--muted);transform:translateX(-50%)}
.agl-gl{position:absolute;top:24px;width:1px;background:var(--line-soft)}
.agl-b{position:absolute;display:flex;align-items:center;gap:6px;padding:0 8px;border:0;border-radius:8px;overflow:hidden;white-space:nowrap;font-size:12px;font-weight:500;pointer-events:auto;cursor:pointer;z-index:3}
.agl-b .agl-bt{min-width:0;overflow:hidden;text-overflow:ellipsis}.agl-b .agl-bi{flex:none}
.agl-cg{position:absolute;border:1.5px solid var(--warning);border-radius:10px;background:var(--warning-tint);z-index:1}
.agl-mk{position:absolute;z-index:4;width:26px;height:26px;margin:-13px 0 0 -13px;border:2px solid var(--card);border-radius:7px;background:var(--warning);color:var(--card);display:grid;place-items:center;cursor:pointer;padding:0;pointer-events:auto}
.agl-ph{position:absolute;top:2px;bottom:0;width:0;z-index:5}.agl-ph i{position:absolute;left:-1px;top:20px;bottom:0;width:2px;background:var(--ink);opacity:.75}
.agl-ph span{position:absolute;left:0;top:0;transform:translateX(-50%);height:18px;padding:0 6px;line-height:18px;border-radius:9px;background:var(--ink);color:var(--card);font-size:11px;font-weight:600}
.agl-ho{position:absolute;z-index:2;height:22px;padding:0 8px;border-radius:11px;background:var(--card);font-size:11.5px;line-height:20px;color:var(--muted);white-space:nowrap;transform:translate(10px,-11px)}
.agl-cf{flex:none;overflow:hidden}.agl-cfi{position:relative}
.agl-cb{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:11px 14px;border-radius:12px;background:var(--warning-tint);font-size:12.5px;line-height:18px;color:var(--ink)}
.agl-cb svg{flex:none;color:var(--warning)}.agl-cb .agl-ct{flex:1 1 220px;min-width:0}.agl-cb b{display:block;font-weight:600}.agl-cb .btn{height:30px;padding:0 12px;font-size:12.5px;flex:none;background:var(--card)}
.agl-cl{position:absolute;left:0;right:0;top:0}
.agl-dt{flex:none;background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:12px 14px}
.agl-dh{display:flex;align-items:center;gap:10px}.agl-dh .agl-av{width:32px;height:32px}.agl-dh h5{margin:0;font-size:13.5px;line-height:19px}.agl-dh p{margin:0;font-size:12px;line-height:16px;color:var(--muted)}
.agl-ac{margin-left:auto;text-align:right;font-size:12px;color:var(--muted);line-height:16px}.agl-ac b{display:inline-flex;font-size:18px;line-height:22px;color:var(--ink);font-weight:600}
.agl-kv{display:flex;gap:10px;align-items:baseline;padding:7px 0 0;margin-top:8px;border-top:1px solid var(--line-soft);font-size:12.5px;line-height:18px;color:var(--muted)}.agl-kv>span:first-child{flex:none;width:62px}
.agl-nw{position:relative;flex:1;height:18px;min-width:0;color:var(--ink)}
.agl-pg{display:flex;flex-wrap:wrap;gap:4px 6px;flex:1;min-width:0}.agl-pg span{height:20px;padding:0 8px;border-radius:10px;background:var(--raised);color:var(--ink);font:11.5px/20px var(--mono)}
.agl-lg{flex:1;min-width:0;display:grid;gap:2px}.agl-lr{display:flex;gap:8px;align-items:baseline;color:var(--ink)}.agl-lr .agl-lt{position:relative;flex:1;height:18px;min-width:0}.agl-lr small{flex:none;font-size:11.5px;color:var(--muted)}
@container (max-width:639px){.agl-ln{grid-template-columns:46px minmax(0,1fr)}.agl-hd{padding:0 0 0 10px;gap:0;position:relative}.agl-nm{display:none}.agl-sm{position:absolute;left:28px;bottom:9px}.agl-ho{display:none}.agl-kv>span:first-child{width:52px}.agl-rt{font-size:11px}}
</style>
<div class="agl-root"><div class="agl-top"><div><h4>Run lanes</h4><div class="agl-sub">3 agents reviewing northwind.app</div></div><div class="agl-bs"><span class="agl-clk num"></span><button type="button" class="btn agl-pa" aria-pressed="false">Pause</button><button type="button" class="btn agl-re">Replay</button></div></div>
<div class="agl-card"><div class="agl-lns"><ol class="agl-ls" aria-label="Agents"></ol><div class="agl-ov"></div></div></div>
<div class="agl-cf" aria-live="polite"><div class="agl-cfi"><div class="agl-cl"></div></div></div>
<section class="agl-dt" aria-label="Focused agent"><div class="agl-dh"><span class="agl-av agl-di"></span><div style="min-width:0"><h5 class="agl-dn"></h5><p class="agl-dr"></p></div><div class="agl-ac">Actions<br><b class="agl-an"></b></div></div>
<div class="agl-kv"><span>Now</span><span class="agl-nw agl-now"></span></div><div class="agl-kv"><span>Pages</span><span class="agl-pg"></span></div><div class="agl-kv"><span>Recent</span><div class="agl-lg"></div></div></section>
<div class="agl-live" role="status" aria-live="polite" style="${SR}"></div></div>`,
  desc:'Bars grow on the run clock, so a running task is a bar whose right edge is the playhead. When a task finishes, a handoff arrow draws from its end to the start of the next agent’s task, and that bar starts growing as the arrow lands. When two agents touch /signup at once, a warning band opens across both lanes with a marker; Queue Reviewer after slides the Reviewer’s bars later on a spring until the band closes. Clicking a lane grows it and swaps the detail panel to that agent.',
  api:'bar.w = clamp((rt − a)/(b − a))·(b − a)·pps   arrow.p = prog(rt − b)   conflict = overlap(formₐ, reviewerₐ) → band.set(1)   resolve → shift.set(2.8s)   lane.click → h.set(focused), detail.swap(lane)',
  init(st){
    const END = 24, SH = 2.8;
    const LANES = [
      { id:'crawl', name:'Crawler', role:'Maps every page', ic:'nav', tasks:[
        { t:'Map /pricing', a:.5, b:4.5, page:'/pricing', acts:['Opened /pricing', 'Read 6 headings', 'Listed 3 plan cards', 'Checked 4 links'] },
        { t:'Map /signup', a:4.5, b:8, page:'/signup', acts:['Opened /signup', 'Found 3 form fields', 'Found Create account'] },
        { t:'Map /settings', a:8, b:11.5, page:'/settings', acts:['Opened /settings', 'Found Delete workspace', 'Saved the page map'] } ] },
      { id:'form', name:'Form tester', role:'Fills and submits forms', ic:'type', tasks:[
        { t:'Fill signup form', a:8.8, b:13.8, page:'/signup', acts:['Typed in Work email', 'Typed in Company', 'Chose a team size'] },
        { t:'Submit and verify', a:13.8, b:16.4, page:'/signup/done', acts:['Clicked Create account', 'Waited for /signup/done', 'Took screenshot'] } ] },
      { id:'rev', name:'Reviewer', role:'Checks copy and files comments', ic:'comment', tasks:[
        { t:'Check copy on /pricing', a:2, b:7, page:'/pricing', acts:['Read the headline', 'Compared plan names', 'Flagged “Contact sales”'] },
        { t:'Review /signup copy', a:11, b:15, page:'/signup', sh:1, acts:['Read the form labels', 'Checked helper text', 'Flagged the missing “Just me”'] },
        { t:'File 4 comments', a:17, b:20.2, page:'/signup', sh:1, acts:['Left comment on /pricing', 'Left comment on /signup', 'Left comment on /signup', 'Left comment on /signup'] } ] } ];
    const HAND = [ { f:[0, 1], t:[1, 0], l:'Handoff: /signup map' }, { f:[1, 1], t:[2, 2], l:'Handoff: findings' } ];
    const root = $(st,'.agl-root'), ls = $(st,'.agl-ls'), ov = $(st,'.agl-ov'), lns = $(st,'.agl-lns'), live = $(st,'.agl-live'), pa = $(st,'.agl-pa'), re = $(st,'.agl-re'), clk = $(st,'.agl-clk'), cf = $(st,'.agl-cf'), cl = $(st,'.agl-cl');
    const cfs = gSlot(cf, $(st,'.agl-cfi'), 0), cfol = gFollow($(st,'.agl-cfi')), cSw = new Swap(0);
    const dI = $(st,'.agl-di'), dN = $(st,'.agl-dn'), dR = $(st,'.agl-dr'), an = new Digits($(st,'.agl-an'), 2), nowT = gText($(st,'.agl-now'), 'line-height:18px'), pgs = $(st,'.agl-pg'), lg = $(st,'.agl-lg');
    const logs = [0, 1, 2].map(() => { const r = gEl('div'); r.className = 'agl-lr'; r.innerHTML = '<span class="agl-lt"></span><small></small>'; lg.appendChild(r); return { r, tx:gText($(r,'.agl-lt'), 'line-height:18px'), tm:$(r,'small'), cur:null }; });
    const shT = new Track(0, S.soft), cW = new Track(0), fT = LANES.map((l, i) => new Track(i === 0 ? 1 : 0)), arrP = HAND.map(() => 0);
    const stDefs = [ { h:gi('ring', 14, 1.8), bg:'transparent', fg:'var(--faint)', r:9 }, { h:SPIN(14), bg:'transparent', fg:'var(--ink)', r:9, spin:1 }, { h:gi('check', 14, 2.8), bg:'transparent', fg:'var(--success)', r:9 }, { h:gi('tri', 14, 2.2), bg:'transparent', fg:'var(--warning)', r:9 } ];
    const barDefs = [ { h:SPIN(14), bg:'transparent', fg:'var(--ink)', r:8, spin:1 }, { h:gi('check', 14, 2.8), bg:'transparent', fg:'var(--muted)', r:8 }, { h:gi('tri', 14, 2.2), bg:'transparent', fg:'var(--warning)', r:8 } ];
    let rt = 0, last = null, paused = false, focus = 0, resolved = false, resolvedAt = null, sec = -1, cur = null, W = 0, wide = true, conflictSeen = false;
    const Q = [], say = s => { live.textContent = s; };
    const lanes = LANES.map((L, i) => { const li = gEl('li'); li.className = 'agl-ln';
      li.innerHTML = `<button type="button" class="agl-hd" aria-pressed="${i === 0}"><span class="agl-av">${gi(L.ic, 16, 2)}</span><span class="agl-nm"><b>${L.name}</b><span class="agl-st"></span></span><span class="agl-sm"></span></button><div class="agl-tk"></div>`;
      ls.appendChild(li); const o = { L, li, hd:$(li,'.agl-hd'), stt:gText($(li,'.agl-st'), 'line-height:17px'), mark:gStatus(18, stDefs, 0), k:0, txt:'', H:0, top:0, fw:new Track(i === 0 ? 1 : 0), i };
      $(li,'.agl-sm').appendChild(o.mark.el); o.stt.put('Waiting to start', true); o.hd.onclick = () => setFocus(i);
      o.tasks = L.tasks.map((tk, j) => { const b = gEl('div'); b.className = 'agl-b'; b.setAttribute('aria-hidden', 'true'); b.title = tk.t; b.innerHTML = '<span class="agl-bi"></span><span class="agl-bt"></span>'; ov.appendChild(b); $(b,'.agl-bt').textContent = tk.t; const m = gStatus(16, barDefs, 0); $(b,'.agl-bi').appendChild(m.el); b.onclick = () => setFocus(i);
        return { tk, b, m, W:[new Track(0), new Track(0), new Track(0)], k:-1 }; });
      return o; });
    const rulers = []; for (let s = 0; s <= END; s += 4){ const r = gEl('span'); r.className = 'agl-rt num'; r.textContent = gfmt(s); ov.appendChild(r); const g = gEl('i'); g.className = 'agl-gl'; ov.appendChild(g); rulers.push({ s, r, g }); }
    const cg = gEl('div'); cg.className = 'agl-cg'; ov.appendChild(cg); const mk = gEl('button'); mk.type = 'button'; mk.className = 'agl-mk'; mk.innerHTML = gi('tri', 15, 2.2); mk.setAttribute('aria-label', 'Conflict on /signup. Show details'); ov.appendChild(mk);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('aria-hidden', 'true'); svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;z-index:2'; ov.appendChild(svg);
    const arr = HAND.map(h => { const p = document.createElementNS(svg.namespaceURI, 'path'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'var(--ink)'); p.setAttribute('stroke-width', '1.6'); p.setAttribute('stroke-linecap', 'round'); svg.appendChild(p);
      const hd = document.createElementNS(svg.namespaceURI, 'path'); hd.setAttribute('d', 'M-5 -7 L0 0 L5 -7'); hd.setAttribute('fill', 'none'); hd.setAttribute('stroke', 'var(--ink)'); hd.setAttribute('stroke-width', '1.8'); hd.setAttribute('stroke-linecap', 'round'); hd.setAttribute('stroke-linejoin', 'round'); svg.appendChild(hd);
      const lb = gEl('div', '', h.l); lb.className = 'agl-ho'; ov.appendChild(lb); return { p, hd, lb, done:null }; });
    const ph = gEl('div'); ph.className = 'agl-ph'; ph.innerHTML = '<i></i><span></span>'; ov.appendChild(ph);
    // conflict banner layers
    cl.innerHTML = `<div class="agl-cb agl-c0">${gi('tri', 18, 2)}<div class="agl-ct"><b>Conflict on /signup</b>Form tester is typing in the form while Reviewer is checking its copy.</div><button type="button" class="btn agl-q">Queue Reviewer after Form tester</button></div><div class="agl-cb agl-c1" style="background:var(--success-tint);border-color:var(--success)">${gi('check', 18, 2.6)}<div class="agl-ct"><b>Resolved</b>Reviewer now starts /signup at 0:14, after Form tester finishes the form.</div></div>`;
    const cb = [$(cl,'.agl-c0'), $(cl,'.agl-c1')]; cb[1].querySelector('svg').style.color = 'var(--success)';
    const setFocus = i => { focus = i; lanes.forEach((l, k) => { l.fw.set(k === i ? 1 : 0, S.base); l.hd.setAttribute('aria-pressed', k === i); }); LANE_TXT.force = true; say(`${LANES[i].name} focused`); };
    $(cl,'.agl-q').onclick = () => { if (resolved) return; resolved = true; shT.set(SH); cSw.to(1); cfol.to(cb[1]); say('Reviewer will start after Form tester finishes. Conflict resolved.'); resolvedAt = rt; };
    mk.onclick = () => { if (!cfs.on) return; $(cl,'.agl-q').focus({ preventScroll:true }); cf.scrollIntoView({ block:'nearest', behavior:'smooth' }); };
    pa.onclick = () => { paused = !paused; pa.textContent = paused ? 'Resume' : 'Pause'; pa.setAttribute('aria-pressed', paused); };
    re.onclick = () => { rt = 0; resolved = false; resolvedAt = null; shT.jump(0); cSw.cur = 0; cSw.prev = null; cSw.t = -9; cW.jump(0); cfs.jump(0); conflictSeen = false; arrP.fill(0); paused = false; pa.textContent = 'Pause'; pa.setAttribute('aria-pressed', false); sec = -1; LANE_TXT.force = true; lanes.forEach(l => { l.k = 0; l.mark.set(0, true); l.stt.put('Waiting to start', true); }); };
    const LANE_TXT = { force:true };
    const eff = (tk, t) => { const s = tk.sh ? shT.at(t) : 0; return [tk.a + s, tk.b + s]; };
    const frac = (tk, t) => { const [a, b] = eff(tk, t); return clamp((rt - a)/(b - a)); };
    cSw.cur = 0; cfol.to(cb[0], true);
    return t => {
      gDrain(Q, t);
      const dt = last == null ? 0 : Math.min(.1, Math.max(0, t - last)); last = t; if (!paused && rt < END) rt = Math.min(END, rt + dt);
      W = lns.clientWidth; wide = root.clientWidth >= 640; const x0 = wide ? 184 : 46, tw = Math.max(40, W - x0 - 12), pps = tw/END, rulerH = 24;
      // lane heights and tops
      let top = rulerH; lanes.forEach((l, i) => { const fw = clamp(l.fw.at(t)); l.H = wide ? 58 + 14*fw : 56 + 12*fw; l.li.style.height = px(l.H); l.top = top; top += l.H; l.fwv = fw; });
      const total = top; ov.style.height = px(total);
      const bh = l => 28 + 10*l.fwv, by = l => l.top + (l.H - bh(l))/2;
      rulers.forEach(o => { const x = x0 + o.s*pps; o.r.style.left = px(Math.min(Math.max(x, 12), W - 14)); o.g.style.left = px(x); o.g.style.height = px(total - 24); });
      // bars
      let nAct = [0, 0, 0], logAll = [[], [], []], pages = [[], [], []], working = [null, null, null], doneAll = [true, true, true];
      const conflictTask = [lanes[1].tasks[0], lanes[2].tasks[1]];
      const [fa, fb] = eff(conflictTask[0].tk, t), [ra, rb] = eff(conflictTask[1].tk, t); const os = Math.max(fa, ra), oe = Math.min(fb, rb), hasOv = oe - os > .05, conflictNow = hasOv && rt > os && !(resolved && shT.at(t) > SH*.97 && oe - os <= .05);
      if (hasOv && rt > os) conflictSeen = true; cW.set(hasOv && rt > os ? 1 : 0, S.base);
      lanes.forEach(l => l.tasks.forEach((o, j) => { const [a, b] = eff(o.tk, t), f = clamp((rt - a)/(b - a)); const x = x0 + a*pps, w = f*(b - a)*pps;
        const inC = (l.i === 1 && j === 0 || l.i === 2 && j === 1) && hasOv && rt > os && rt < oe + .0 && f > 0 && f < 1.001 && clamp(cW.at(t)) > .3;
        const k = f >= 1 ? 1 : inC ? 2 : 0; if (k !== o.k){ o.k = k; o.m.set(k); o.W.forEach((v, n) => v.set(n === k ? 1 : 0, S.base)); }
        const ws = o.W.map(v => v.at(t)); const vis = f > .0005;
        o.b.style.left = px(x); o.b.style.top = px(by(l)); o.b.style.height = px(bh(l)); o.b.style.width = px(Math.max(0, w)); o.b.style.visibility = vis ? 'visible' : 'hidden';
        o.b.style.opacity = (.72 + .28*l.fwv).toFixed(3); o.b.style.background = gBlend(ws, ['var(--accent-tint)', 'var(--raised)', 'var(--warning-tint)']); o.b.style.borderColor = gBlend(ws, ['var(--accent)', 'var(--line)', 'var(--warning)']); o.b.style.color = gBlend(ws, ['var(--ink)', 'var(--muted)', 'var(--ink)']);
        o.b.style.padding = w < 28 ? '0' : '0 8px'; o.m.render(t);
        if (f > 0){ pages[l.i].includes(o.tk.page) || pages[l.i].push(o.tk.page); const n = o.tk.acts.length; o.tk.acts.forEach((a2, q) => { const at = a + (q + .6)/n*(b - a); if (at <= rt){ nAct[l.i]++; logAll[l.i].push([at, a2]); } }); }
        if (f > 0 && f < 1) working[l.i] = o.tk; if (f < 1) doneAll[l.i] = false; }));
      // arrows
      HAND.forEach((h, n) => { const src = lanes[h.f[0]], dst = lanes[h.t[0]], so = src.tasks[h.f[1]], dsto = dst.tasks[h.t[1]]; const [, sb] = eff(so.tk, t), [da] = eff(dsto.tk, t);
        const p = prog(rt, sb, S.base) * (rt >= sb ? 1 : 0); const xs = x0 + sb*pps, ys = by(src) + bh(src), xt = x0 + da*pps, yt = by(dst), dy = (yt - ys)*.5;
        arr[n].p.setAttribute('d', `M${xs.toFixed(1)} ${ys.toFixed(1)} C${xs.toFixed(1)} ${(ys + dy).toFixed(1)} ${xt.toFixed(1)} ${(yt - dy).toFixed(1)} ${xt.toFixed(1)} ${yt.toFixed(1)}`);
        const L = arr[n].p.getTotalLength ? arr[n].p.getTotalLength() : 100; arr[n].p.setAttribute('stroke-dasharray', `${(L*clamp(p)).toFixed(1)} ${L.toFixed(1)}`); arr[n].p.style.opacity = p > .001 ? '1' : '0';
        arr[n].hd.setAttribute('transform', `translate(${xt.toFixed(1)} ${yt.toFixed(1)})`); arr[n].hd.style.opacity = clamp((p - .9)*10).toFixed(3);
        arr[n].lb.style.left = px((xs + xt)/2); arr[n].lb.style.top = px((ys + yt)/2); arr[n].lb.style.opacity = clamp((p - .6)*2.5).toFixed(3); arr[n].lb.style.visibility = p > .65 && wide ? 'visible' : 'hidden'; });
      // conflict band and marker
      const cw = clamp(cW.at(t)); const l1 = lanes[1], l2 = lanes[2]; const bx = x0 + os*pps, ex = x0 + Math.min(Math.max(oe, os), Math.max(rt, os))*pps, y1 = by(l1) - 5, y2 = by(l2) + bh(l2) + 5;
      cg.style.left = px(bx - 3); cg.style.top = px(y1); cg.style.width = px(Math.max(0, ex - bx + 6)); cg.style.height = px(y2 - y1); cg.style.opacity = cw.toFixed(3); cg.style.visibility = cw < .01 ? 'hidden' : 'visible';
      mk.style.left = px(bx); mk.style.top = px((by(l1) + bh(l1) + by(l2))/2); mk.style.opacity = cw.toFixed(3); mk.style.transform = `scale(${(.8 + .2*cw).toFixed(3)})`; mk.style.visibility = cw < .01 ? 'hidden' : 'visible';
      // banner
      const wantBanner = conflictSeen && (!resolved || rt < (resolvedAt || 0) + 3.2); if (wantBanner !== cfs.on){ cfs.open(wantBanner); if (wantBanner) say('Conflict on /signup. Form tester and Reviewer are both working on it.'); }
      cb.forEach((e, k) => cSw.apply(e, k, t, 4)); cb.forEach((e, k) => e.style.pointerEvents = k === cSw.cur ? 'auto' : 'none'); cfol.render(t); cfs.render(t);
      // playhead
      const px_ = x0 + Math.min(rt, END)*pps; ph.style.left = px(px_); ph.style.height = px(total - 2); $(ph,'span').textContent = gfmt(rt); ph.style.opacity = rt >= END ? '.5' : '1';
      // lane headers
      lanes.forEach(l => { const wk = working[l.i], inC = conflictNow && (l.i === 1 || l.i === 2) && wk && (wk === l.tasks[l.i === 1 ? 0 : 1].tk) && clamp(cW.at(t)) > .3;
        const k = inC ? 3 : wk ? 1 : doneAll[l.i] ? 2 : 0, txt = inC ? 'Conflict on /signup' : wk ? wk.t : doneAll[l.i] ? 'Done' : rt < l.tasks[0].a ? (l.i === 1 ? 'Waiting for handoff' : 'Waiting to start') : 'Waiting for handoff';
        if (k !== l.k){ l.k = k; l.mark.set(k); } if (txt !== l.txt){ l.txt = txt; l.stt.put(txt); l.hd.setAttribute('aria-label', `${l.L.name}: ${txt}`); } l.mark.render(t); l.stt.render(t); l.hd.style.background = mix(l.fwv, 'var(--accent-tint)', 'transparent'); l.li.style.background = 'transparent'; l.av = $(l.hd,'.agl-av'); l.av.style.background = mix(l.fwv, 'var(--accent)', 'var(--raised)'); l.av.style.color = mix(l.fwv, 'var(--card)', 'var(--ink)'); });
      // detail
      const f = lanes[focus], L = f.L; if (LANE_TXT.force || cur !== focus){ cur = focus; LANE_TXT.force = false; dI.innerHTML = gi(L.ic, 17, 2); dN.textContent = L.name; dR.textContent = L.role; nowT.put('', true); logs.forEach(g => g.cur = null); f.pgsKey = null; }
      const wk = working[focus], nowTxt = wk ? wk.t : doneAll[focus] ? 'Finished its tasks' : 'Waiting for handoff'; if (nowT.text !== nowTxt) nowT.put(nowTxt);
      const pk = pages[focus].join(','); if (pgs.dataset.k !== focus + ':' + pk){ pgs.dataset.k = focus + ':' + pk; pgs.innerHTML = pages[focus].length ? pages[focus].map(p => `<span>${p}</span>`).join('') : '<span style="background:none;color:var(--muted);font-family:var(--sans)">None yet</span>'; }
      const ac = String(nAct[focus]); if (an.slots && an._v !== ac){ an._v = ac; an.set(ac); }
      const lgs = logAll[focus].sort((a2, b2) => b2[0] - a2[0]).slice(0, 3); logs.forEach((g, i) => { const e = lgs[i], txt2 = e ? e[1] : (i === 0 ? 'No actions yet' : ''); if (g.cur !== txt2){ g.cur = txt2; g.tx.put(txt2, !g.tx.text); g.tm.textContent = e ? gfmt(e[0]) : ''; } g.tx.render(t); });
      an.render(t); nowT.render(t);
      const s = gfmt(rt); if (s !== clk.dataset.s){ clk.dataset.s = s; clk.innerHTML = `${s} <span>/ ${gfmt(END)}</span>`; }
    };
  }});

})();