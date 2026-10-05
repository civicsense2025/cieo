

/* ---------- MCP and agents (organisms) ---------- */
(() => {
const mEl = (tag, css, text) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; };
const mPush = (q, t, fn) => { q.push([t, fn]); q.sort((a, b) => a[0] - b[0]); };
const mDrain = (q, t) => { while (q.length && q[0][0] <= t) q.shift()[1](); };
const mBlend = (ws, cols) => { let c = cols[0], a = Math.max(ws[0], 0); for (let k = 1; k < cols.length; k++){ const w = Math.max(ws[k], 0); a += w; if (w > .002) c = `color-mix(in oklab, ${cols[k]} ${(w/a*100).toFixed(1)}%, ${c})`; } return c; };
const SPIN = d => ic('<path d="M12 3a9 9 0 0 1 9 9"/>', d, 2.5);
const SR = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
// two stacked text layers that Swap, so a label can change without layout jumps
const mText = (host, css = '') => {
  const s = [0, 1].map(() => { const e = mEl('span', 'position:absolute;left:0;top:0;white-space:nowrap;' + css); host.appendChild(e); return e; });
  const sw = new Swap(0); let k = 0, cur = null;
  return { s, get k(){ return k; }, put(text, instant){ if (text === cur) return; cur = text;
      if (instant){ s[k].textContent = text; sw.cur = k; sw.prev = null; sw.t = -9; return; }
      k ^= 1; s[k].textContent = text; sw.to(k); },
    render(t){ s.forEach((e, i) => sw.apply(e, i, t)); } };
};
// a collapsing slot: content fades first, then the height closes; opening grows the height, then the content arrives
const mSlot = (host, inner, open = 0) => {
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
const mFollow = host => {
  const f = { cur:null, off:new Track(0), h:0,
    to(el, inst){ const old = f.h; f.cur = el; if (!inst){ f.off.jump(old - el.offsetHeight); f.off.set(0, S.base); } },
    render(t){ if (!f.cur) return; f.h = Math.max(0, f.cur.offsetHeight + f.off.at(t)); host.style.height = px(f.h); } };
  return f;
};
const mSw = (label, on, onChange) => {
  const b = mEl('button', 'flex:none;position:relative;width:36px;height:22px;border-radius:11px;border:0;padding:0;cursor:pointer');
  b.type = 'button'; b.setAttribute('role', 'switch'); b.setAttribute('aria-label', label); b.setAttribute('aria-checked', !!on);
  const k = mEl('i', 'position:absolute;left:3px;top:3px;width:16px;height:16px;border-radius:50%;background:var(--card);box-shadow:0 1px 2px rgba(16,20,26,.25)'); b.appendChild(k);
  const o = { el:b, tr:new Track(on ? 1 : 0), on:!!on,
    set(v, inst, t = now()){ o.on = !!v; b.setAttribute('aria-checked', o.on); inst ? o.tr.jump(v ? 1 : 0) : o.tr.set(v ? 1 : 0, S.base, t); },
    render(t){ const p = clamp(o.tr.at(t)); b.style.background = mix(p, 'var(--accent)', 'var(--line)'); k.style.transform = `translateX(${px(p*14)})`; } };
  b.onclick = () => { if (b.getAttribute('aria-disabled') === 'true') return; onChange(!o.on, o); };
  return o;
};
// status chip: dot or spinner, label swap, width and colors morph between states
const mChip = (defs, k0 = 0) => {
  const el = mEl('span', 'display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px 0 8px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;flex:none');
  const dot = mEl('span', 'position:relative;width:12px;height:12px;flex:none'); dot.innerHTML = `<i style="position:absolute;left:3px;top:3px;width:6px;height:6px;border-radius:50%;background:currentColor"></i><span style="position:absolute;inset:0;display:flex">${SPIN(12)}</span>`;
  const lh = mEl('span', 'position:relative;display:block;height:16px'); el.append(dot, lh);
  const tx = mText(lh, 'line-height:16px'), W = defs.map(() => new Track(0)), lw = new Track(0), idot = dot.firstChild, spin = dot.lastChild; let k = -1, fix = true;
  const o = { el, get k(){ return k; },
    set(n, inst){ if (n === k) return; k = n; W.forEach((w, i) => inst ? w.jump(i === n ? 1 : 0) : w.set(i === n ? 1 : 0, S.base));
      tx.put(defs[n].l, inst); const w = measureW(tx.s[tx.k], defs[n].l) || defs[n].l.length*6.8; inst ? lw.jump(w) : lw.set(w); },
    render(t){ if (fix && el.isConnected && lh.offsetParent){ const w = measureW(tx.s[tx.k], defs[k].l); if (w){ lw.jump(w); fix = false; } }
      const ws = W.map(w => w.at(t));
      el.style.background = mBlend(ws, defs.map(d => d.tint)); el.style.color = mBlend(ws, defs.map(d => d.col));
      const sp = defs.reduce((a, d, i) => a + (d.spin ? clamp(ws[i]) : 0), 0);
      idot.style.opacity = (1 - sp).toFixed(3); spin.style.opacity = sp.toFixed(3); spin.style.transform = `rotate(${((t*540)%360).toFixed(1)}deg)`;
      lh.style.width = px(lw.at(t)); tx.render(t); } };
  o.set(k0, true); return o;
};
const mKey = (cls, text) => { const c = mEl('code', 'font:12px/1.5 var(--mono)'); c.className = cls || ''; c.textContent = text; return c; };

/* ================================================================ 1. Connected servers */
atom({ id:'connectorlist', cat:'MCP and agents', name:'Connected servers', block:'AgentAccessScreen · connections', fam:['M','S','E'], wide:true, tall:true,
  html:`<style>
.cnl-root{position:absolute;inset:0;container-type:inline-size;padding:12px;display:flex;flex-direction:column}
.cnl-card{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;background:var(--card);border-radius:14px;box-shadow:var(--shadow)}
.cnl-hb{display:flex;gap:8px}
.cnl-head{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;padding:12px 14px;border-bottom:1px solid var(--line-soft)}
.cnl-head h4{margin:0;font-size:14px;line-height:20px;font-weight:600}
.cnl-sub{font-size:12.5px;line-height:18px;color:var(--muted);display:flex;gap:4px;align-items:center}
.cnl-list{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;margin:0;padding:0;list-style:none;scrollbar-width:thin;position:relative;overflow-anchor:none}
.cnl-li{border-bottom:1px solid var(--line-soft)}
.cnl-row{display:grid;grid-template-columns:36px minmax(0,1fr) auto auto;grid-template-areas:"ic meta chip act";gap:2px 12px;align-items:center;padding:12px 14px}
.cnl-ic{grid-area:ic;width:36px;height:36px;border-radius:10px;background:var(--raised);display:grid;place-items:center}
.cnl-meta{grid-area:meta;min-width:0}
.cnl-nm{display:block;font-size:14px;line-height:20px;font-weight:600}
.cnl-ds{display:block;font-size:12.5px;line-height:18px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cnl-chip{grid-area:chip}
.cnl-act{grid-area:act;position:relative;width:104px;height:32px;padding:0;overflow:hidden}
.cnl-er{height:0;overflow:hidden}
.cnl-erin{display:flex;flex-wrap:wrap;align-items:center;gap:4px 14px;margin:0 14px 12px 62px;padding:9px 12px;border-radius:10px;background:var(--danger-tint);color:var(--danger);font-size:12.5px;line-height:18px}
.cnl-rm{border:0;background:none;padding:0;color:inherit;font-size:12.5px;font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
.cnl-empty{padding:28px 14px;text-align:center;font-size:13px;color:var(--muted);position:absolute;left:0;right:0;top:0}
@container (max-width:540px){
  .cnl-row{grid-template-columns:36px minmax(0,1fr) auto;grid-template-areas:"ic meta meta" ". chip act";row-gap:8px}
  .cnl-chip{justify-self:start}
  .cnl-erin{margin-left:14px}
}
</style>
<div class="cnl-root"><div class="cnl-card">
<div class="cnl-head"><div style="flex:1 1 150px;min-width:0"><h4>Connected servers</h4><div class="cnl-sub"><span class="cnl-n1"></span><span>of</span><span class="cnl-n2"></span><span>connected</span></div></div>
<div class="cnl-hb"><button type="button" class="btn cnl-add">Add server</button><button type="button" class="btn cnl-re">Replay</button></div></div>
<ul class="cnl-list" aria-label="MCP servers"><li class="cnl-empty" hidden>No servers yet. Add one to give the assistant more tools.</li></ul></div>
<div class="cnl-live" role="status" aria-live="polite" style="${SR}"></div></div>`,
  desc:'Each row is one server. Its chip morphs fill, label and width between connected, connecting, error and disconnected while the action button swaps its label, so Reconnect never pops in. An error opens a message panel under the row. New rows grow in from zero height, then their content fades up; the list stays pinned to the new row as it grows. Replay re-enters the rows 60ms apart.',
  api:'chip.set(state)   act.put(label)   err.h.set(state === error)   row.open(true, t + i·0.06)   connect: busy → queue +1.5s → ok | error',
  init(st){
    const list = $(st,'.cnl-list'), live = $(st,'.cnl-live'), addB = $(st,'.cnl-add'), reB = $(st,'.cnl-re'), empty = $(st,'.cnl-empty');
    const n1 = new Digits($(st,'.cnl-n1'), 2), n2 = new Digits($(st,'.cnl-n2'), 2), q = [], rows = [];
    const G = { fs:'<path d="M3 6a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>', gh:'<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 3-3 4-12 6"/>', db:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>', hash:'<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/>', lst:'<path d="M4 6h10M4 12h10M4 18h6M16 16l2 2 4-4"/>', shield:'<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/>', note:'<path d="M5 4h11l3 3v13H5z"/><path d="M9 10h6M9 14h6"/>', card:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>', frame:'<path d="M5 5h14v14H5zM5 12h14M12 5v14"/>', dots:'<circle cx="12" cy="8" r="3"/><circle cx="7" cy="16" r="3"/><circle cx="17" cy="16" r="3"/>' };
    const SEED = [
      { n:'Filesystem', ds:'Local · stdio · 11 tools', g:'fs', s:0 },
      { n:'Source control', ds:'Remote · HTTP · 24 tools', g:'gh', s:0 },
      { n:'Postgres', ds:'analytics-ro · stdio · 6 tools', g:'db', s:0 },
      { n:'Slack', ds:'Remote · HTTP · 9 tools', g:'hash', s:0 },
      { n:'Linear', ds:'Remote · HTTP · 14 tools', g:'lst', s:3 },
      { n:'Sentry', ds:'Remote · HTTP · 8 tools', g:'shield', s:2, er:'Authorization expired on October 1. Reconnect to sign in again.' } ];
    const CAT = [
      { n:'Notion', ds:'Remote · HTTP · 12 tools', g:'note' },
      { n:'Stripe', ds:'Remote · HTTP · 18 tools', g:'card', once:'No response to initialize after 30 seconds. The server may be down.' },
      { n:'Figma', ds:'Remote · HTTP · 7 tools', g:'frame' },
      { n:'Asana', ds:'Remote · HTTP · 10 tools', g:'dots' } ];
    let ci = 0, pin = -9;
    const DEF = [{ l:'Connected', tint:'var(--success-tint)', col:'var(--success)' }, { l:'Connecting', tint:'var(--raised)', col:'var(--muted)', spin:true }, { l:'Error', tint:'var(--danger-tint)', col:'var(--danger)' }, { l:'Disconnected', tint:'var(--raised)', col:'var(--faint)' }];
    const ACT = ['Disconnect', 'Cancel', 'Reconnect', 'Connect'];
    const count = () => { const live_ = rows.filter(r => !r.dead); n1.set(String(live_.filter(r => r.k === 0).length)); n2.set(String(live_.length)); };
    const say = s => { live.textContent = s; };
    const setState = (r, k, inst) => {
      r.k = k; r.chip.set(k, inst); r.act.put(ACT[k], inst);
      r.er.set(k === 2 ? 1 : 0, k === 2 ? S.base : S.snap); r.btn.disabled = false; r.btn.setAttribute('aria-label', ACT[k] + ' ' + r.d.n); r.ok.set(k === 2 ? 1 : 0, k === 2 ? S.base : S.snap);
      r.dim.set(k === 3 ? 1 : 0, S.base); if (k === 2 && !inst && r === rows[rows.length - 1]) pin = now() + .8; count();
    };
    const start = (r, t0 = now()) => {
      setState(r, 1); const j = ++r.job; say(r.d.n + ' connecting');
      mPush(q, t0 + 1.5, () => { if (r.job !== j || r.dead) return;
        if (r.d.once){ r.msg.textContent = r.d.once; r.d.once = null; setState(r, 2); say(r.d.n + ' failed to connect'); }
        else { setState(r, 0); say(r.d.n + ' connected'); } });
    };
    const remove = r => { r.dead = true; r.job++; r.slot.open(false); count(); say(r.d.n + ' removed'); mPush(q, now() + .6, () => { r.li.remove(); rows.splice(rows.indexOf(r), 1); }); (rows.find(x => !x.dead) ? rows.find(x => !x.dead).btn : addB).focus({ preventScroll:true }); };
    const make = (d, k, enter, lag = 0) => {
      const li = mEl('li'); li.className = 'cnl-li';
      li.innerHTML = `<div class="cnl-in"><div class="cnl-row"><span class="cnl-ic">${ic(G[d.g], 18, 1.75)}</span><div class="cnl-meta"><b class="cnl-nm"></b><span class="cnl-ds"></span></div><span class="cnl-chip"></span><button type="button" class="btn cnl-act"><span style="position:absolute;inset:0"></span></button></div><div class="cnl-er"><div class="cnl-erin"><span class="cnl-msg"></span><button type="button" class="cnl-rm">Remove server</button></div></div></div>`;
      $(li,'.cnl-nm').textContent = d.n; $(li,'.cnl-ds').textContent = d.ds;
      const chip = mChip(DEF, k); $(li,'.cnl-chip').appendChild(chip.el);
      const btn = $(li,'.cnl-act'), act = mText(btn.firstChild, 'left:0;right:0;top:0;text-align:center;line-height:30px');
      const r = { d, li, in:$(li,'.cnl-in'), chip, btn, act, ic:$(li,'.cnl-ic'), nm:$(li,'.cnl-nm'), erHost:$(li,'.cnl-er'), erIn:$(li,'.cnl-erin'), msg:$(li,'.cnl-msg'), er:new Track(0), ok:new Track(0), dim:new Track(0), job:0, k:-1, dead:false, slot:null };
      r.slot = mSlot(li, r.in, enter ? 0 : 1); if (enter) r.slot.open(true, now(), lag);
      r.msg.textContent = d.er || '';
      list.appendChild(li); rows.push(r); setState(r, k, true); r.er.jump(k === 2 ? 1 : 0); r.ok.jump(k === 2 ? 1 : 0); r.dim.jump(k === 3 ? 1 : 0);
      btn.onclick = () => { if (r.k === 0){ r.job++; setState(r, 3); say(d.n + ' disconnected'); } else if (r.k === 1){ r.job++; setState(r, 3); say('Cancelled'); } else start(r); };
      $(li,'.cnl-rm').onclick = () => remove(r);
      return r;
    };
    const fill = enter => { rows.slice().forEach(r => r.li.remove()); rows.length = 0; q.length = 0;
      SEED.forEach((d, i) => make(d, d.s, enter, i*.06)); count(); };
    fill(false);
    addB.onclick = () => { const d = Object.assign({}, CAT[ci++ % CAT.length]); const r = make(d, 1, true); start(r); pin = now() + 1; say(d.n + ' added'); };
    reB.onclick = () => { CAT.forEach(c => { if (c.n === 'Stripe') c.once = 'No response to initialize after 30 seconds. The server may be down.'; }); fill(true); pin = now() + .9; };
    return t => {
      mDrain(q, t);
      for (const r of rows){
        r.slot.render(t); r.chip.render(t); r.act.render(t);
        const e = clamp(r.er.at(t)); r.erHost.style.height = px(e*r.erIn.offsetHeight + (e > 0 ? 0 : 0)); r.erHost.style.visibility = e < .004 ? 'hidden' : 'visible'; fade(r.erIn, e, (1 - e)*-4);
        const p = clamp(r.ok.at(t)); r.btn.style.background = mix(p, 'var(--ink)', 'var(--card)'); r.btn.style.color = mix(p, 'var(--card)', 'var(--ink)'); r.btn.style.borderColor = mix(p, 'var(--ink)', 'var(--line)');
        const d = clamp(r.dim.at(t)); r.nm.style.color = mix(1 - d*.55, 'var(--ink)', 'var(--muted)'); r.ic.style.opacity = (1 - d*.45).toFixed(3);
      }
      if (t < pin) list.scrollTop = list.scrollHeight;
      const none = !rows.some(r => !r.dead); empty.hidden = !none;
      n1.render(t); n2.render(t);
    };
  }});

/* ================================================================ 2. OAuth consent */
atom({ id:'oauthgrant', cat:'MCP and agents', name:'OAuth consent screen', block:'OAuthConsentForm', fam:['M','S','E'], wide:true, tall:true,
  html:`<style>
.oag-root{position:absolute;inset:0;container-type:inline-size;padding:12px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.oag-card{max-width:880px;margin:0 auto;background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:18px;display:grid;gap:16px;grid-template-columns:minmax(0,1fr)}
.oag-id{display:flex;flex-direction:column;gap:12px}
.oag-link{display:flex;align-items:center;gap:0}
.oag-tile{flex:none;width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-weight:600;font-size:17px}
.oag-ln{position:relative;flex:0 1 72px;min-width:28px;height:2px;margin:0 4px;background:var(--line);border-radius:1px}
.oag-ln i{position:absolute;left:0;top:0;bottom:0;border-radius:1px}
.oag-mid{position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px}
.oag-ttl{position:relative}
.oag-ttl h4{position:absolute;left:0;right:0;top:0;margin:0;font-size:19px;line-height:26px;font-weight:600;letter-spacing:-.015em;text-wrap:balance}
.oag-sub{display:grid;margin-top:-4px;font-size:13px;line-height:19px;color:var(--muted)}
.oag-sub span{grid-area:1/1}
.oag-sc{margin:0;padding:0;list-style:none;display:flex;flex-direction:column}
.oag-li{border-bottom:1px solid var(--line-soft)}
.oag-li:first-child{border-top:1px solid var(--line-soft)}
.oag-r{display:flex;align-items:flex-start;gap:12px;padding:11px 0}
.oag-tx{flex:1;min-width:0}
.oag-nm{display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px;font-size:14px;line-height:20px;font-weight:600}
.oag-bd{font-size:11.5px;line-height:16px;font-weight:600;padding:0 7px;border-radius:8px;background:var(--raised);color:var(--muted)}
.oag-bd.w{background:var(--warning-tint);color:var(--warning)}
.oag-ds{display:block;font-size:12.5px;line-height:18px;color:var(--muted)}
.oag-st{position:relative;flex:none;width:36px;height:22px;margin-top:-1px}
.oag-st>*{position:absolute;right:0;top:0}
.oag-ck{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:var(--success-tint);color:var(--success)}
.oag-wn{height:0;overflow:hidden}
.oag-wi{padding:0 0 11px;font-size:12.5px;line-height:18px;color:var(--warning);display:flex;gap:7px}
.oag-sum{height:0;overflow:hidden}
.oag-sin{padding-top:14px;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;justify-content:space-between;font-size:13px;line-height:19px;color:var(--muted)}
.oag-ul{border:0;background:none;padding:0;color:var(--ink);font-size:13px;font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
.oag-ft{display:flex;flex-direction:column;gap:10px}
.oag-hd{overflow:hidden}
.oag-cnt{display:flex;padding-top:10px;gap:4px;align-items:center;font-size:12.5px;line-height:18px;color:var(--muted)}
.oag-act{display:flex;height:40px}
.oag-act .btn{position:relative;flex:1 1 0;min-width:0;height:40px;padding:0;overflow:hidden;font-size:14px}
.oag-act .btn>span{position:absolute;inset:0}
.oag-fine{font-size:12px;line-height:17px;color:var(--faint)}
@container (min-width:620px){
  .oag-card{grid-template-columns:240px minmax(0,1fr);gap:28px;padding:24px}
  .oag-id{padding-top:4px}
}
@container (max-width:420px){
  .oag-card{padding:14px}.oag-tile{width:38px;height:38px}.oag-ttl h4{font-size:17px;line-height:23px}
}
</style>
<div class="oag-root"><section class="oag-card" aria-labelledby="oag-t">
<div class="oag-id"><div class="oag-link"><span class="oag-tile" style="background:var(--ink);color:var(--card)" aria-hidden="true">${ic('<path d="M12 4v16M5 8l14 8M19 8 5 16"/>', 20, 2)}</span><span class="oag-ln" aria-hidden="true"><i></i><span class="oag-mid"><span class="oag-m1" style="position:absolute;display:grid;place-items:center;inset:0;color:var(--success);background:var(--card);border-radius:50%">${ic(I.check, 14, 3)}</span><span class="oag-m2" style="position:absolute;display:grid;place-items:center;inset:0;color:var(--danger);background:var(--card);border-radius:50%">${ic(I.x, 13, 3)}</span></span></span><span class="oag-tile" style="background:var(--accent-tint);color:var(--accent)" aria-hidden="true">N</span></div>
<div class="oag-ttl" id="oag-t" aria-live="polite"><h4>Assistant wants to connect to Northwind</h4><h4>Assistant is connected to Northwind</h4><h4>Request denied</h4></div>
<div class="oag-sub"><span>Signed in as maya@northwind.co</span></div></div>
<div class="oag-main"><ul class="oag-sc" aria-label="Requested permissions"></ul>
<div class="oag-sum"><div class="oag-sin"><span class="oag-sl"></span><button type="button" class="oag-ul"></button></div></div>
<div class="oag-ft"><div class="oag-hd"><div class="oag-cnt"><span class="oag-c1"></span><span>of</span><span class="oag-c2"></span><span>permissions selected</span></div></div>
<div class="oag-act"><button type="button" class="btn oag-no"><span></span></button><button type="button" class="btn oag-yes"><span></span></button></div>
<div class="oag-fine">You can change these permissions at any time in Agent access.</div></div></div></section></div>`,
  desc:'Each scope toggle springs its knob, and the Allow count rolls. Turning on a sensitive scope grows a warning line under it. Allow morphs the button row: Deny shrinks to zero width while Allow grows, fills green and swaps to Connected, then the scopes you left off collapse 40ms apart and the toggles of the kept ones swap to checks. Deny runs the mirror image and fades red. The link between the two tiles fills as the grant lands.',
  api:'switch[i].set(v)   count.set(n)   allow: deny.w.set(0) → off-rows.h.set(0, t + i·0.04) → kept.toggle.swap(check)   line.fill.set(1)',
  init(st){
    const ul = $(st,'.oag-sc'), c1 = new Digits($(st,'.oag-c1'), 1), c2 = new Digits($(st,'.oag-c2'), 1);
    const no = $(st,'.oag-no'), yes = $(st,'.oag-yes'), ttl = $$(st,'.oag-ttl h4'), line = $(st,'.oag-ln i'), m1 = $(st,'.oag-m1'), m2 = $(st,'.oag-m2');
    const sum = $(st,'.oag-sum'), sumIn = $(st,'.oag-sin'), sl = $(st,'.oag-sl'), undo = $(st,'.oag-ul'), hd = $(st,'.oag-hd');
    const SC = [
      { n:'Read pages and posts', d:'See published content, drafts and page structure.', req:true, on:true },
      { n:'Edit drafts', d:'Create and change drafts. Nothing goes live until you publish.', on:true },
      { n:'Publish changes', d:'Make drafts live on northwind.co.', bd:'Sensitive', warn:'Assistant could change the live site without review.' },
      { n:'Read form submissions', d:'See names and emails people send through your forms.', bd:'Personal data', warn:'Submissions include personal details of your visitors.' },
      { n:'Manage members', d:'Invite people, remove them and change their roles.', bd:'Sensitive', warn:'Assistant could remove people or raise their access.' } ];
    const NS = SC.length, tf = mFollow($(st,'.oag-ttl')); tf.to(ttl[0], true);
    const rows = SC.map((s, i) => { const li = mEl('li'); li.className = 'oag-li';
      li.innerHTML = `<div class="oag-in"><div class="oag-r"><div class="oag-tx"><div class="oag-nm"><span></span></div><span class="oag-ds"></span></div><div class="oag-st"><span class="oag-ck">${ic(I.check, 13, 3)}</span></div></div><div class="oag-wn"><div class="oag-wi">${ic('<path d="M12 4 3 20h18z"/><path d="M12 10v4.5M12 17.5h.01"/>', 15, 2.25)}<span></span></div></div></div>`;
      $(li,'.oag-nm span').textContent = s.n; $(li,'.oag-ds').textContent = s.d; $(li,'.oag-wi span').textContent = s.warn || '';
      if (s.bd){ const b = mEl('span', '', s.bd); b.className = 'oag-bd' + (s.warn ? ' w' : ''); $(li,'.oag-nm').appendChild(b); }
      if (s.req){ const b = mEl('span', '', 'Required'); b.className = 'oag-bd'; $(li,'.oag-nm').appendChild(b); }
      const sw = mSw(s.n, !!s.on, v => { if (state) return; set(i, v); });
      if (s.req) sw.el.setAttribute('aria-disabled', 'true');
      $(li,'.oag-st').appendChild(sw.el); ul.appendChild(li);
      return { s, li, sw, sl:mSlot(li, $(li,'.oag-in'), 1), wn:$(li,'.oag-wn'), wi:$(li,'.oag-wi'), w:new Track(0), ck:$(li,'.oag-ck'), cw:new Track(0), sh:new Track(1), on:!!s.on }; });
    const q = [], dg = new Track(0), tsw = new Swap(0), ysw = mText(yes.firstChild, 'left:0;right:0;top:0;text-align:center;line-height:38px'), nsw = mText(no.firstChild, 'left:0;right:0;top:0;text-align:center;line-height:38px');
    const gap = new Track(8), gD = new Track(1), gY = new Track(1.6), cD = new Track(0), cY = new Track(0), lnW = new Track(0), mk = new Track(0), mx = new Track(0), sumS = mSlot(sum, sumIn, 0), cs = mSlot(hd, hd.firstChild, 1);
    let state = 0; // 0 pending, 1 granted, 2 denied
    const nOn = () => rows.filter(r => r.on).length;
    const set = (i, v) => { const r = rows[i]; r.on = v; r.sw.set(v); r.w.set(v && r.s.warn ? 1 : 0, v ? S.base : S.snap); c1.set(String(nOn())); };
    rows.forEach(r => r.sw.set(r.on, true)); c1.set(String(nOn()), true); c2.set(String(NS), true);
    ysw.put('Allow access', true); nsw.put('Deny', true);
    const settle = k => { // k: 1 granted, 2 denied
      const t = now(); state = k; tsw.to(k); tf.to(ttl[k]);
      yes.disabled = no.disabled = true; rows.forEach(r => r.sw.el.tabIndex = -1);
      if (k === 1){ gD.set(0, S.base, t); gap.set(0, S.base, t); gY.set(1, S.base, t); cY.set(1, S.base, t + .05); ysw.put('Connected'); lnW.set(1, S.base, t + .1); mk.set(1, S.base, t + .35); dg.set(0);
        let n = 0; rows.forEach((r, i) => { if (!r.on){ r.sl.open(false, t + .25 + n*.04); n++; } else { r.cw.set(1, S.base, t + .25); } }); }
      else { gY.set(0, S.base, t); gap.set(0, S.base, t); gD.set(1, S.base, t); cD.set(1, S.base, t + .05); nsw.put('Request denied'); lnW.set(.3, S.base, t + .1); mx.set(1, S.base, t + .35); dg.set(1);
        rows.forEach((r, i) => r.sl.open(false, t + .25 + i*.04)); }
      cs.open(false, t);
      const on = nOn(); sl.textContent = k === 1 ? `${on} ${on === 1 ? 'permission' : 'permissions'} granted to the assistant.` : 'No permissions were shared with the assistant.'; undo.textContent = k === 1 ? 'Revoke access' : 'Ask again';
      sumS.open(true, t, .45); mPush(q, t + .6, () => undo.focus({ preventScroll:true }));
    };
    const reset = () => { const t = now(); state = 0; tsw.to(0); tf.to(ttl[0]); yes.disabled = no.disabled = false;
      gD.set(1, S.base, t); gap.set(8, S.base, t); gY.set(1.6, S.base, t); cY.set(0, S.snap, t); cD.set(0, S.snap, t); lnW.set(0, S.base, t); mk.set(0, S.snap, t); mx.set(0, S.snap, t); sumS.open(false, t);
      rows.forEach((r, i) => { r.cw.set(0, S.snap, t); r.sl.open(true, t, .12 + i*.04); r.sw.el.tabIndex = 0; });
      cs.open(true, t, .3); mPush(q, t + .1, () => { ysw.put('Allow access'); nsw.put('Deny'); }); mPush(q, t + .5, () => yes.focus({ preventScroll:true })); };
    yes.onclick = () => { if (!state) settle(1); }; no.onclick = () => { if (!state) settle(2); }; undo.onclick = reset;
    return t => {
      mDrain(q, t);
      rows.forEach(r => { r.sw.render(t); r.sl.render(t);
        const w = clamp(r.w.at(t)); r.wn.style.height = px(w*r.wi.offsetHeight); fade(r.wi, w, (1 - w)*-3);
        const cw = clamp(r.cw.at(t)); r.sw.el.style.opacity = (1 - cw).toFixed(3); r.sw.el.style.pointerEvents = cw > .5 ? 'none' : 'auto'; r.ck.style.opacity = cw.toFixed(3); r.ck.style.transform = `scale(${(.85 + .15*cw).toFixed(3)})`; });
      ttl.forEach((e, k) => tsw.apply(e, k, t, 5)); tf.render(t);
      const d = clamp(gD.at(t), 0, 1.6), y = clamp(gY.at(t), 0, 1.6), cdn = clamp(cD.at(t)), cyn = clamp(cY.at(t));
      no.style.flexGrow = d.toFixed(3); yes.style.flexGrow = y.toFixed(3); yes.style.marginLeft = px(Math.max(0, gap.at(t))); no.style.visibility = d < .01 ? 'hidden' : 'visible'; yes.style.visibility = y < .01 ? 'hidden' : 'visible';
      yes.style.background = mix(cyn, 'var(--success-tint)', 'var(--ink)'); yes.style.color = mix(cyn, 'var(--success)', 'var(--card)'); yes.style.borderColor = mix(cyn, 'var(--success-tint)', 'var(--ink)');
      no.style.background = mix(cdn, 'var(--danger-tint)', 'var(--card)'); no.style.color = mix(cdn, 'var(--danger)', 'var(--ink)'); no.style.borderColor = mix(cdn, 'var(--danger-tint)', 'var(--line)');
      ysw.render(t); nsw.render(t); c1.render(t); c2.render(t); sumS.render(t);
      line.style.width = (clamp(lnW.at(t))*100).toFixed(2) + '%'; line.style.background = mix(clamp(dg.at(t)), 'var(--danger)', 'var(--success)');
      m1.style.opacity = clamp(mk.at(t)).toFixed(3); m2.style.opacity = clamp(mx.at(t)).toFixed(3); cs.render(t);
    };
  }});

/* ================================================================ 3. Tool approval */
atom({ id:'toolapproval', cat:'MCP and agents', name:'Tool call approval', block:'ApprovalDetail', fam:['M','S','E'], wide:true, tall:true,
  html:`<style>
.tap-root{position:absolute;inset:0;container-type:inline-size;padding:12px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.tap-wrap{max-width:600px;margin:0 auto}
.tap-bar .btn{flex:none;white-space:nowrap}
.tap-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 2px 10px}
.tap-bar b{font-size:13px;font-weight:600;color:var(--muted)}
.tap-card{background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:0 16px;position:relative}
.tap-req{position:relative;overflow:hidden}
.tap-blk{position:absolute;left:0;right:0;top:0;padding:16px 0 0}
.tap-top{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;font-size:12.5px;line-height:20px;color:var(--muted)}
.tap-sv{display:inline-flex;align-items:center;gap:6px;color:var(--ink);font-weight:600}
.tap-sv i{width:20px;height:20px;border-radius:6px;background:var(--raised);display:grid;place-items:center;font-style:normal}
.tap-rk{font-size:11.5px;line-height:18px;font-weight:600;padding:0 8px;border-radius:9px}
.tap-tool{display:block;margin:10px 0 2px;font:500 17px/24px var(--mono);letter-spacing:-.01em;word-break:break-all}
.tap-sum{margin:0;font-size:13.5px;line-height:20px;color:var(--muted)}
.tap-ag{margin-top:12px;border:1px solid var(--line-soft);border-radius:10px;overflow:hidden}
.tap-tg{display:flex;align-items:center;gap:8px;width:100%;border:0;background:none;padding:8px 10px;font-size:12.5px;line-height:18px;font-weight:600;cursor:pointer;text-align:left}
.tap-tg .tap-l{position:relative;flex:1;height:18px;min-width:0}
.tap-pw{overflow:hidden;border-top:1px solid var(--line-soft)}
.tap-pre{margin:0;border:0;border-radius:0;background:none;overflow:visible;padding:8px 10px;font:12px/18px var(--mono);white-space:pre-wrap;word-break:break-word;color:var(--muted)}
.tap-pre .tap-k{color:var(--faint)}.tap-pre .tap-s{color:var(--ink)}.tap-pre .tap-n{color:var(--accent)}
.tap-zn{position:relative;overflow:hidden}
.tap-ly{position:absolute;left:0;right:0;top:0;padding:14px 0 16px}
.tap-bt{display:flex;flex-wrap:wrap;gap:8px}
.tap-bt .btn{flex:1 1 auto;height:36px;padding:0 14px;font-size:13.5px}
.tap-bt .btn:disabled{opacity:.45;cursor:default}
.tap-hint{margin:10px 0 0;font-size:12px;line-height:17px;color:var(--faint)}
.tap-run{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:var(--raised);font-size:13px;line-height:20px}
.tap-run code{font:12.5px var(--mono)}
.tap-res{display:flex;gap:10px;align-items:flex-start;padding:11px 12px;border-radius:10px;font-size:13px;line-height:19px}
.tap-res .tap-ic{flex:none;margin-top:1px}
.tap-res b{display:block;font-weight:600}
.tap-res span.tap-d{display:block;color:var(--muted);font-size:12.5px}
.tap-res .tap-m{display:block;margin-top:4px;color:var(--muted);font-size:12px}
@container (max-width:420px){.tap-bt .btn{flex:1 1 100%}.tap-tool{font-size:15px}}
</style>
<div class="tap-root"><div class="tap-wrap"><div class="tap-bar"><b>Assistant is working in Northwind</b><button type="button" class="btn tap-next">Next request</button></div>
<div class="tap-card" role="group" aria-label="Tool call awaiting approval"><div class="tap-req"></div>
<div class="tap-zn"><div class="tap-ly tap-a"><div class="tap-bt"><button type="button" class="btn tap-no">Deny</button><button type="button" class="btn tap-once ink">Allow once</button><button type="button" class="btn tap-alw">Always allow</button></div><p class="tap-hint">Assistant waits for your answer. Always allow applies to this tool in this workspace.</p></div>
<div class="tap-ly tap-r"><div class="tap-run"><span class="tap-sp" style="display:flex;color:var(--muted)">${SPIN(16)}</span><span style="flex:1;min-width:0">Running <code class="tap-rn"></code></span><span class="num tap-el" style="color:var(--muted);font-size:12.5px">0.0s</span></div></div>
<div class="tap-ly tap-d"><div class="tap-res"><span class="tap-ic"></span><div style="flex:1;min-width:0"><b class="tap-rt"></b><span class="tap-d tap-rd"></span><span class="tap-m tap-rm"></span></div></div></div></div></div>
<div class="tap-live" role="status" aria-live="polite" style="${SR}"></div></div></div>`,
  desc:'The card holds one request at a time. Next request swaps the whole request block, and the card height eases from the old height to the new one. Show all arguments grows the preview on the base spring and swaps its label. Allow once or Always allow swaps the buttons for a running line with a live timer, then swaps that for the result; Deny goes straight to the result. The card height follows each swap without a jump.',
  api:'req.to(next)   args.h.set(open ? full : 3 lines)   zone.swap(ask → run, t + EXIT)   queue +dur → zone.swap(result)',
  init(st){
    const reqH = $(st,'.tap-req'), zone = $(st,'.tap-zn'), A = $(st,'.tap-a'), R = $(st,'.tap-r'), D = $(st,'.tap-d'), nextB = $(st,'.tap-next'), live = $(st,'.tap-live');
    const bNo = $(st,'.tap-no'), bOnce = $(st,'.tap-once'), bAlw = $(st,'.tap-alw'), rn = $(st,'.tap-rn'), el = $(st,'.tap-el'), sp = $(st,'.tap-sp');
    const rt = $(st,'.tap-rt'), rd = $(st,'.tap-rd'), rm = $(st,'.tap-rm'), resBox = $(st,'.tap-res'), resIc = $(st,'.tap-res .tap-ic');
    const RISK = { Reads:['var(--raised)','var(--muted)'], Writes:['var(--warning-tint)','var(--warning)'], Destructive:['var(--danger-tint)','var(--danger)'] };
    const REQ = [
      { sv:'Source control', g:'<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 3-3 4-12 6"/>', tool:'create_pull_request', risk:'Writes', sum:'Open a pull request in northwind/api from fix/login-timeout into main.',
        args:[['owner','"northwind"'],['repo','"api"'],['head','"fix/login-timeout"'],['base','"main"'],['title','"Raise login timeout to 30s"'],['body','"Fixes the 504s people see when the SSO redirect is slow."'],['draft','false']],
        run:1.5, rt:'Pull request #482 opened', rd:'northwind/api · fix/login-timeout into main', rm:'Completed in 1.4s' },
      { sv:'Postgres', g:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>', tool:'run_query', risk:'Reads', sum:'Run a read-only query on analytics-ro.',
        args:[['database','"analytics-ro"'],['sql','"SELECT date_trunc(\'day\', created_at) AS day, count(*) FROM signups WHERE created_at > now() - interval \'7 days\' GROUP BY 1 ORDER BY 1"'],['timeout_ms','5000'],['max_rows','1000']],
        run:.8, rt:'7 rows returned', rd:'signups per day, last 7 days', rm:'Completed in 38 ms' },
      { sv:'Slack', g:'<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/>', tool:'post_message', risk:'Writes', sum:'Post a message to #launch as the assistant.',
        args:[['channel','"#launch"'],['text','"Staging is green. Rolling out the new billing page at 3pm."'],['thread_ts','null']],
        run:1.1, rt:'Message posted to #launch', rd:'Visible to 48 members', rm:'Completed in 0.9s' },
      { sv:'Filesystem', g:'<path d="M3 6a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>', tool:'delete_directory', risk:'Destructive', sum:'Delete the build output folder and everything inside it.',
        args:[['path','"~/Projects/northwind/dist"'],['recursive','true'],['force','false']],
        run:1.2, rt:'Deleted 142 files', rd:'~/Projects/northwind/dist', rm:'Completed in 0.4s' } ];
    const fmt = a => a.map(([k, v], i) => { const c = /^"/.test(v) ? 's' : 'n'; const e = v.replace(/&/g,'&amp;').replace(/</g,'&lt;'); return `  <span class="tap-k">"${k}":</span> <span class="tap-${c}">${e}</span>${i < a.length - 1 ? ',' : ''}`; });
    const blocks = REQ.map((r, i) => { const b = mEl('div'); b.className = 'tap-blk'; const lines = fmt(r.args), PV = 3;
      b.innerHTML = `<div class="tap-top"><span class="tap-sv"><i>${ic(r.g, 13, 2)}</i><span></span></span><span class="tap-rk"></span><span>requested just now</span></div><code class="tap-tool"></code><p class="tap-sum"></p>
<div class="tap-ag"><button type="button" class="tap-tg" aria-expanded="false"><span>Arguments</span><span class="tap-l"></span>${ic(I.chev, 14)}</button><div class="tap-pw"><pre class="tap-pre">{\n${lines.join('\n')}\n}</pre></div></div>`;
      $(b,'.tap-sv span').textContent = r.sv; $(b,'.tap-rk').textContent = r.risk; $(b,'.tap-rk').style.cssText = `background:${RISK[r.risk][0]};color:${RISK[r.risk][1]}`;
      $(b,'.tap-tool').textContent = r.tool; $(b,'.tap-sum').textContent = r.sum; reqH.appendChild(b);
      const tg = $(b,'.tap-tg'), pw = $(b,'.tap-pw'), pre = $(b,'.tap-pre'), lab = mText($(b,'.tap-l'), 'line-height:18px;left:auto;right:0;text-align:right;color:var(--muted);font-weight:500');
      lab.put(r.args.length > PV ? `Show all ${r.args.length} arguments` : `${r.args.length} fields`, true);
      if (r.args.length <= PV){ tg.disabled = true; tg.style.cursor = 'default'; tg.lastElementChild.style.display = 'none'; }
      const o = { b, tg, pw, pre, lab, e:new Track(0), r, PV, svg:tg.lastElementChild };
      tg.onclick = () => open(o, !o.open);
      return o; });
    let cur = 0, state = 0, jobId = 0; const q = [];
    const reqSw = new Swap(0), znSw = new Swap(0), follow = mFollow(reqH), zf = mFollow(zone), say = s => { live.textContent = s; };
    const lineH = 18;
    const open = (o, v) => { o.open = v; o.e.set(v ? 1 : 0, v ? S.base : S.snap); o.tg.setAttribute('aria-expanded', v); if (o.r.args.length > o.PV) o.lab.put(v ? 'Hide arguments' : `Show all ${o.r.args.length} arguments`); };
    const showReq = (k, inst) => { cur = k; state = 0; jobId++; q.length = 0; blocks.forEach(o => { if (o.open && o !== blocks[k]){ o.open = false; o.e.jump(0); o.tg.setAttribute('aria-expanded', false); } });
      const r = REQ[k]; bAlw.disabled = r.risk === 'Destructive'; bAlw.title = bAlw.disabled ? 'Destructive tools always ask first' : ''; bNo.disabled = bOnce.disabled = false;
      reqSw.to(k); if (inst){ reqSw.cur = k; reqSw.prev = null; reqSw.t = -9; }
      follow.to(blocks[k].b, inst); znSw.to(0); zf.to(A, inst); say(`${r.sv} wants to run ${r.tool}`); };
    const decide = (kind) => { if (state) return; state = 1; const r = REQ[cur], j = ++jobId; bNo.disabled = bOnce.disabled = bAlw.disabled = true;
      if (kind === 'no'){ finish(j, false); return; }
      rn.textContent = r.tool; el.textContent = '0.0s'; runStart = now(); znSw.to(1); zf.to(R); say(`Running ${r.tool}`);
      mPush(q, now() + r.run, () => finish(j, true, kind)); };
    let runStart = 0;
    const finish = (j, ok, kind) => { if (j !== jobId) return; const r = REQ[cur]; state = 2;
      resIc.innerHTML = ic(ok ? I.check : I.x, 16, 2.5); resBox.style.background = ok ? 'var(--success-tint)' : 'var(--danger-tint)'; resBox.style.color = ok ? 'var(--success)' : 'var(--danger)';
      rt.textContent = ok ? r.rt : `You denied ${r.tool}`; rd.textContent = ok ? r.rd : 'Assistant was told you declined and will choose another approach.';
      rm.textContent = ok ? (kind === 'alw' ? r.rm + ' · Always allowed for this workspace' : r.rm) : '';
      znSw.to(2); zf.to(D); say(ok ? r.rt : `Denied ${r.tool}`); };
    bNo.onclick = () => decide('no'); bOnce.onclick = () => decide('once'); bAlw.onclick = () => decide('alw');
    nextB.onclick = () => showReq((cur + 1) % REQ.length);
    showReq(0, true);
    return t => {
      mDrain(q, t);
      blocks.forEach((o, k) => { reqSw.apply(o.b, k, t, 4); const e = clamp(o.e.at(t)), full = o.pre.offsetHeight, pvH = o.r.args.length > o.PV ? (o.PV + 1)*lineH + 16 : full; // braces + three lines + padding
        o.pw.style.height = px(lerp(Math.min(full, pvH), full, e)); if (o.svg) o.svg.style.transform = `rotate(${(e*180).toFixed(1)}deg)`; o.lab.render(t); o.b.style.pointerEvents = k === reqSw.cur ? 'auto' : 'none'; });
      [A, R, D].forEach((e, k) => { znSw.apply(e, k, t, 4); e.style.pointerEvents = k === znSw.cur ? 'auto' : 'none'; });
      sp.style.transform = `rotate(${((t*540)%360).toFixed(1)}deg)`;
      if (state === 1){ const s = (t - runStart).toFixed(1) + 's'; if (el.textContent !== s) el.textContent = s; }
      follow.render(t); zf.render(t);
    };
  }});

/* ================================================================ 4. Tool call log */
atom({ id:'toolcalllog', cat:'MCP and agents', name:'Tool call log', block:'Agent activity log', fam:['M','S','T'], wide:true, tall:true,
  html:`<style>
.tcl-root{position:absolute;inset:0;container-type:inline-size;padding:12px;display:flex;flex-direction:column}
.tcl-card{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;background:var(--card);border-radius:14px;box-shadow:var(--shadow)}
.tcl-head{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:12px 14px;border-bottom:1px solid var(--line-soft)}
.tcl-st{flex:1 1 180px;min-width:0}
.tcl-st h4{margin:0;font-size:14px;line-height:20px;font-weight:600;display:flex;align-items:center;gap:8px}
.tcl-sub{display:flex;flex-wrap:wrap;gap:0 4px;align-items:center;font-size:12.5px;line-height:18px;color:var(--muted)}
.tcl-sub b{font-weight:600;color:var(--ink)}
.tcl-bt{display:flex;gap:8px}
.tcl-bt .btn{position:relative;height:32px;padding:0;min-width:84px;overflow:hidden}
.tcl-list{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;margin:0;padding:0;list-style:none;scrollbar-width:thin;position:relative}
.tcl-li{border-bottom:1px solid var(--line-soft)}
.tcl-hd{display:grid;grid-template-columns:22px minmax(0,auto) minmax(0,1fr) auto 14px;align-items:center;gap:0 10px;width:100%;border:0;background:none;padding:10px 14px;text-align:left;cursor:pointer;min-height:44px}
.tcl-ic{position:relative;width:22px;height:22px;border-radius:50%;display:block}
.tcl-ic>span{position:absolute;inset:0;display:grid;place-items:center}
.tcl-nm{font:500 13px/20px var(--mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tcl-nm em{font:400 12px var(--sans);font-style:normal;color:var(--faint);margin-left:8px}
.tcl-ar{font:12px/18px var(--mono);color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.tcl-du{font-size:12.5px;line-height:18px;color:var(--muted);min-width:34px;text-align:right}
.tcl-dt{height:0;overflow:hidden}
.tcl-di{margin:0 14px 12px 46px;display:grid;gap:8px}
.tcl-bl{border-radius:8px;background:var(--bg);padding:8px 10px}
.tcl-bl small{display:block;font-size:11.5px;line-height:16px;font-weight:600;color:var(--faint);margin-bottom:2px}
.tcl-bl pre{margin:0;background:none;border:0;border-radius:0;padding:0;overflow:visible;font:12px/18px var(--mono);white-space:pre-wrap;word-break:break-word}
.tcl-bl.tcl-er{background:var(--danger-tint);color:var(--danger)}.tcl-bl.tcl-er small{color:var(--danger)}
.tcl-empty{padding:30px 14px;text-align:center;font-size:13px;color:var(--muted)}
@container (max-width:560px){.tcl-hd{grid-template-columns:22px minmax(0,1fr) auto 14px}.tcl-ar{display:none}.tcl-nm em{display:none}.tcl-di{margin-left:14px}}
</style>
<div class="tcl-root"><div class="tcl-card"><div class="tcl-head"><div class="tcl-st"><h4><span class="tcl-hs" style="position:relative;display:block;height:20px"></span></h4><div class="tcl-sub"><b class="tcl-n1"></b><span>calls</span><span>·</span><b class="tcl-n2" style="color:var(--danger)"></b><span>failed</span></div></div>
<div class="tcl-bt"><button type="button" class="btn tcl-pa"><span style="position:absolute;inset:0"></span></button><button type="button" class="btn tcl-re">Replay</button></div></div>
<ul class="tcl-list" aria-label="Tool calls, newest first"></ul></div><div class="tcl-live" role="status" aria-live="polite" style="${SR}"></div></div>`,
  desc:'Calls stream in on a run clock, newest at the top. Each row grows from zero height and its content fades up; the spinner turns on that clock, then swaps to a check or an error as the call finishes, and the duration stops counting. Several calls overlap, so more than one spinner can run. Pause freezes the run clock without losing the queue. Click a row to grow its arguments and result; failed rows open on the error.',
  api:'rt += dt (unless paused)   at ≥ call.at → row.open(true)   at ≥ call.at + dur → icon.swap(check | error)   expand: detail.h.set(open)',
  init(st){
    const list = $(st,'.tcl-list'), live = $(st,'.tcl-live'), pa = $(st,'.tcl-pa'), re = $(st,'.tcl-re');
    const n1 = new Digits($(st,'.tcl-n1'), 2), n2 = new Digits($(st,'.tcl-n2'), 1), hs = mText($(st,'.tcl-hs'), 'line-height:20px'), pt = mText(pa.firstChild, 'left:0;right:0;top:0;text-align:center;line-height:30px');
    const J = (o) => JSON.stringify(o, null, 2);
    const CALLS = [
      { at:.4, dur:.5, tool:'list_files', sv:'Filesystem', args:{ path:'~/Projects/northwind/src' }, res:'42 entries in src/' },
      { at:1.2, dur:.4, tool:'read_file', sv:'Filesystem', args:{ path:'src/auth/session.ts' }, res:'118 lines read' },
      { at:1.9, dur:1.3, tool:'search_code', sv:'Source control', args:{ query:'sessionTimeout repo:northwind/api', per_page:10 }, res:'6 matches in 3 files' },
      { at:2.5, dur:.9, tool:'run_query', sv:'Postgres', args:{ sql:'SELECT count(*) FROM sessions WHERE expired_at < now()' }, res:'1 row: 12,408' },
      { at:4.0, dur:1.0, tool:'post_message', sv:'Slack', args:{ channel:'#eng', text:'Found the login timeout bug in session.ts.' }, err:'429 rate_limited. Slack asked to retry after 2 seconds.' },
      { at:5.5, dur:.8, tool:'post_message', sv:'Slack', args:{ channel:'#eng', text:'Found the login timeout bug in session.ts.' }, res:'Message posted to #eng' },
      { at:6.3, dur:1.7, tool:'create_pull_request', sv:'Source control', args:{ repo:'northwind/api', head:'fix/login-timeout', base:'main' }, res:'Pull request #482 opened' },
      { at:8.4, dur:1.1, tool:'get_check_runs', sv:'Source control', args:{ repo:'northwind/api', ref:'fix/login-timeout' }, res:'3 passed, 0 failed' } ];
    const END = 9.7;
    let rt = 0, last = null, paused = false, next = 0, done = false, nFail = 0, started = 0;
    const rows = [], q = [];
    const say = s => { live.textContent = s; };
    const header = (k, inst) => { hs.put(k === 0 ? 'Run in progress' : 'Run finished', inst); };
    hs.put('Run in progress', true); pt.put('Pause', true); n1.set('0', true); n2.set('0', true);
    const add = c => {
      const li = mEl('li'); li.className = 'tcl-li';
      li.innerHTML = `<div class="tcl-in"><button type="button" class="tcl-hd" aria-expanded="false"><span class="tcl-ic"><span class="tcl-a" style="color:var(--muted)">${SPIN(15)}</span><span class="tcl-b">${ic(I.check, 13, 3)}</span><span class="tcl-c">${ic(I.x, 12, 3)}</span></span><span class="tcl-nm"><span class="tcl-t"></span><em></em></span><span class="tcl-ar"></span><span class="tcl-du num">0.0s</span>${ic(I.chev, 14)}</button><div class="tcl-dt"><div class="tcl-di"><div class="tcl-bl"><small>Arguments</small><pre class="tcl-ap"></pre></div><div class="tcl-bl tcl-rb"><small class="tcl-rs"></small><pre class="tcl-rp"></pre></div></div></div></div>`;
      $(li,'.tcl-t').textContent = c.tool; $(li,'em').textContent = c.sv; $(li,'.tcl-ar').textContent = JSON.stringify(c.args); $(li,'.tcl-ap').textContent = J(c.args);
      const r = { c, li, hd:$(li,'.tcl-hd'), du:$(li,'.tcl-du'), dt:$(li,'.tcl-dt'), di:$(li,'.tcl-di'), chev:$(li,'.tcl-hd').lastElementChild, ic:$(li,'.tcl-ic'), L:[$(li,'.tcl-a'), $(li,'.tcl-b'), $(li,'.tcl-c')], sw:new Swap(0), W:[new Track(1), new Track(0), new Track(0)], e:new Track(0), start:rt, end:null, open:false, txt:'0.0s',
        slot:mSlot(li, $(li,'.tcl-in'), 0) };
      r.slot.open(true); list.insertBefore(li, list.firstChild); rows.unshift(r);
      r.hd.onclick = () => tog(r, !r.open); started++; n1.set(String(started)); say(`${c.tool} started`);
      r.hd.setAttribute('aria-label', `${c.tool}, ${c.sv}, running`);
    };
    const tog = (r, v) => { r.open = v; r.e.set(v ? 1 : 0, v ? S.base : S.snap); r.hd.setAttribute('aria-expanded', v); };
    const finish = r => { const c = r.c, bad = !!c.err; r.end = r.start + c.dur; r.sw.to(bad ? 2 : 1); r.W.forEach((w, i) => w.set(i === (bad ? 2 : 1) ? 1 : 0, S.base));
      r.du.textContent = c.dur.toFixed(1) + 's'; $(r.li,'.tcl-rs').textContent = bad ? 'Error' : 'Result'; $(r.li,'.tcl-rp').textContent = bad ? c.err : c.res; $(r.li,'.tcl-rb').classList.toggle('tcl-er', bad);
      r.hd.setAttribute('aria-label', `${c.tool}, ${c.sv}, ${bad ? 'failed' : 'finished in ' + c.dur.toFixed(1) + ' seconds'}`);
      if (bad){ nFail++; n2.set(String(nFail)); say(`${c.tool} failed. ${c.err}`); mPush(q, now() + .5, () => { if (rows.includes(r) && !r.open) tog(r, true); }); } else say(`${c.tool} finished`); };
    const clear = () => { rows.splice(0).forEach(r => r.li.remove()); next = 0; rt = 0; done = false; nFail = 0; started = 0; q.length = 0; n1.set('0'); n2.set('0'); header(0); };
    pa.onclick = () => { paused = !paused; pt.put(paused ? 'Resume' : 'Pause'); pa.setAttribute('aria-pressed', paused); };
    re.onclick = () => { clear(); paused = false; pt.put('Pause'); pa.setAttribute('aria-pressed', false); pa.disabled = false; };
    pa.setAttribute('aria-pressed', false);
    return t => {
      mDrain(q, t);
      const dt = last == null ? 0 : Math.min(.1, Math.max(0, t - last)); last = t;
      if (!paused && !done){ rt += dt;
        while (next < CALLS.length && CALLS[next].at <= rt) add(CALLS[next++]);
        rows.forEach(r => { if (r.end == null && rt >= r.start + r.c.dur) finish(r); });
        if (next >= CALLS.length && rt >= END && rows.every(r => r.end != null)){ done = true; header(1); say(`Run finished. ${CALLS.length} calls, ${nFail} failed.`); pa.disabled = true; } }
      for (const r of rows){
        r.slot.render(t);
        const ws = r.W.map(w => w.at(t)); r.ic.style.background = mBlend(ws, ['var(--raised)', 'var(--success-tint)', 'var(--danger-tint)']);
        r.L[0].style.transform = `rotate(${((rt*540)%360).toFixed(1)}deg)`; r.L[0].style.color = 'var(--muted)'; r.L[1].style.color = 'var(--success)'; r.L[2].style.color = 'var(--danger)';
        r.L.forEach((e, k) => r.sw.apply(e, k, t, 0)); r.L[0].style.transform = `rotate(${((rt*540)%360).toFixed(1)}deg)`;
        if (r.end == null){ const s = Math.max(0, rt - r.start).toFixed(1) + 's'; if (s !== r.txt){ r.txt = s; r.du.textContent = s; } }
        const e = clamp(r.e.at(t)); r.dt.style.height = px(e*r.di.offsetHeight); r.dt.style.visibility = e < .004 ? 'hidden' : 'visible'; fade(r.di, e, (1 - e)*-4); r.chev.style.transform = `rotate(${(e*180).toFixed(1)}deg)`;
        r.du.style.color = r.end != null && r.c.err ? 'var(--danger)' : 'var(--muted)';
      }
      n1.render(t); n2.render(t); hs.render(t); pt.render(t);
    };
  }});

/* ================================================================ 5. Tool permissions */
atom({ id:'toolpermissions', cat:'MCP and agents', name:'Server tool permissions', block:'Agent access · tools', fam:['M','S','E'], wide:true, tall:true,
  html:`<style>
.tpm-root{position:absolute;inset:0;container-type:inline-size;padding:12px;display:flex;flex-direction:column}
.tpm-card{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;background:var(--card);border-radius:14px;box-shadow:var(--shadow)}
.tpm-head{flex:none;display:flex;align-items:center;gap:12px;padding:12px 14px 10px}
.tpm-ic{flex:none;width:36px;height:36px;border-radius:10px;background:var(--raised);display:grid;place-items:center}
.tpm-head h4{margin:0;font-size:14px;line-height:20px;font-weight:600}
.tpm-sub{display:flex;gap:4px;align-items:center;font-size:12.5px;line-height:18px;color:var(--muted)}
.tpm-tb{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;padding:0 14px 12px;border-bottom:1px solid var(--line-soft)}
.tpm-tb .seg button{padding:5px 10px}
.tpm-bulk{position:relative;height:32px;padding:0 12px}
.tpm-bh{position:relative;display:block;height:20px;margin-top:-1px}
.tpm-sp{flex:1 1 0}
.tpm-list{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;margin:0;padding:0;list-style:none;scrollbar-width:thin}
.tpm-li{border-bottom:1px solid var(--line-soft)}
.tpm-li:last-child{border-bottom:0}
.tpm-r{display:flex;align-items:flex-start;gap:12px;padding:11px 14px}
.tpm-tx{flex:1;min-width:0}
.tpm-nm{display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px}
.tpm-nm code{font:500 13px/20px var(--mono)}
.tpm-bd{font-size:11.5px;line-height:16px;font-weight:600;padding:0 7px;border-radius:8px}
.tpm-ds{display:block;font-size:12.5px;line-height:18px;color:var(--muted)}
.tpm-wn{height:0;overflow:hidden}
.tpm-wi{margin:0 14px 11px;padding:7px 10px;border-radius:8px;background:var(--danger-tint);color:var(--danger);font-size:12.5px;line-height:18px;display:flex;gap:8px}
.tpm-wi svg{flex:none;margin-top:1px}
@container (max-width:520px){.tpm-tb .tpm-sp{display:none}.tpm-tb .seg{order:-1;flex:1 1 100%}.tpm-tb .seg button{flex:1}}
</style>
<div class="tpm-root"><div class="tpm-card"><div class="tpm-head"><span class="tpm-ic">${ic('<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 3-3 4-12 6"/>', 18, 1.75)}</span><div><h4>Source control tools</h4><div class="tpm-sub"><span class="tpm-n1"></span><span>of</span><span class="tpm-n2"></span><span>enabled for the assistant</span></div></div></div>
<div class="tpm-tb"><div class="seg tpm-fs" role="group" aria-label="Filter tools"><div class="ind"></div><button type="button" data-f="all">All</button><button type="button" data-f="read">Read</button><button type="button" data-f="write">Write</button></div><span class="tpm-sp"></span>
<button type="button" class="btn tpm-bulk"><span class="tpm-bh"></span></button><button type="button" class="btn tpm-off" style="height:32px">Disable all</button></div>
<ul class="tpm-list" aria-label="Source control tools"></ul></div><div class="tpm-live" role="status" aria-live="polite" style="${SR}"></div></div>`,
  desc:'Switches spring one by one. Enable all read-only turns on every read tool still off, 60ms apart from the top, and the button swaps to a Read-only tools enabled label once none are left; flipping any read tool off brings the original label back. The filter indicator edges lag each other, and tools outside the filter collapse in height rather than disappearing. Enabling a destructive tool grows a warning line under it.',
  api:'tool[i].sw.set(1, t + i·0.06)   bulk.swap(allRead ? done : enable)   filter: ind.go(l, r), row.open(match)   destructive: warn.h.set(on)',
  init(st){
    const list = $(st,'.tpm-list'), live = $(st,'.tpm-live'), bulk = $(st,'.tpm-bulk'), off = $(st,'.tpm-off'), fs = $(st,'.tpm-fs'), ind = $(fs,'.ind'), fb = $$(fs,'button'), bh = $(st,'.tpm-bh');
    const n1 = new Digits($(st,'.tpm-n1'), 2), n2 = new Digits($(st,'.tpm-n2'), 2), bl = mText(bh, 'left:0;top:0;line-height:20px;font-size:13px;font-weight:500'), bw = new Track(0);
    const T = [
      { n:'list_issues', k:'read', d:'List issues in a repository with labels, assignees and state.', on:true },
      { n:'get_pull_request', k:'read', d:'Read a pull request, its diff and review comments.' },
      { n:'search_code', k:'read', d:'Search code across repositories you can access.' },
      { n:'get_file_contents', k:'read', d:'Read a file or list a directory at any ref.' },
      { n:'create_issue', k:'write', d:'Open an issue with a title, body and labels.', on:true },
      { n:'add_issue_comment', k:'write', d:'Comment on an issue or pull request as the assistant.' },
      { n:'create_pull_request', k:'write', d:'Open a pull request from an existing branch.' },
      { n:'merge_pull_request', k:'write', d:'Merge a pull request using the repository default.' },
      { n:'delete_branch', k:'danger', d:'Delete a branch from the remote repository.', warn:'Deleting a branch cannot be undone from here. Leave this off unless a task needs it.' } ];
    const BD = { read:['Read', 'var(--raised)', 'var(--muted)'], write:['Write', 'var(--warning-tint)', 'var(--warning)'], danger:['Destructive', 'var(--danger-tint)', 'var(--danger)'] };
    const rows = T.map((s, i) => { const li = mEl('li'); li.className = 'tpm-li';
      li.innerHTML = `<div class="tpm-in"><div class="tpm-r"><div class="tpm-tx"><div class="tpm-nm"><code></code><span class="tpm-bd"></span></div><span class="tpm-ds"></span></div><span class="tpm-sw"></span></div><div class="tpm-wn"><div class="tpm-wi">${ic('<path d="M12 4 3 20h18z"/><path d="M12 10v4.5M12 17.5h.01"/>', 15, 2.25)}<span></span></div></div></div>`;
      $(li,'code').textContent = s.n; $(li,'.tpm-ds').textContent = s.d; $(li,'.tpm-wi span').textContent = s.warn || '';
      const b = $(li,'.tpm-bd'); b.textContent = BD[s.k][0]; b.style.cssText = `background:${BD[s.k][1]};color:${BD[s.k][2]}`;
      const sw = mSw(s.n, !!s.on, v => toggle(i, v)); $(li,'.tpm-sw').appendChild(sw.el); list.appendChild(li);
      return { s, li, sw, on:!!s.on, sl:mSlot(li, $(li,'.tpm-in'), 1), wn:$(li,'.tpm-wn'), wi:$(li,'.tpm-wi'), w:new Track(0), shown:true }; });
    const say = s => { live.textContent = s; };
    const nOn = () => rows.filter(r => r.on).length, readOff = () => rows.filter(r => r.s.k === 'read' && !r.on);
    let lastLbl = null;
    const sync = inst => { n1.set(String(nOn()), inst); const all = readOff().length === 0, lbl = all ? 'Read-only tools enabled' : 'Enable all read-only';
      if (lbl !== lastLbl){ lastLbl = lbl; bl.put(lbl, inst); const w = measureW(bl.s[bl.k], lbl); if (w){ inst ? bw.jump(w) : bw.set(w); } }
      bulk.setAttribute('aria-disabled', all); bulk.style.opacity = all ? .6 : 1; bulk.style.cursor = all ? 'default' : 'pointer'; off.disabled = nOn() === 0; off.style.opacity = nOn() === 0 ? .5 : 1; };
    const toggle = (i, v, lag = 0) => { const r = rows[i]; r.on = v; r.sw.set(v, false, now() + lag); r.w.set(v && r.s.warn ? 1 : 0, v ? S.base : S.snap, now() + lag); sync(); };
    n2.set(String(T.length), true); rows.forEach(r => r.sw.set(r.on, true)); sync(true);
    document.fonts.ready.then(() => { lastLbl = null; sync(true); });
    bulk.onclick = () => { const todo = readOff(); if (!todo.length) return; todo.forEach((r, j) => toggle(rows.indexOf(r), true, j*.06)); say(`${todo.length} read-only tools enabled`); };
    off.onclick = () => { rows.forEach((r, i) => { if (r.on) toggle(i, false); }); say('All tools disabled'); };
    const e = edges(0, 0), ey = edges(0, 0); let filt = 'all';
    const pick = (f, inst) => { filt = f; const b = fb.find(x => x.dataset.f === f); fb.forEach(x => x.setAttribute('aria-pressed', x === b)); const fn = inst ? 'jump' : 'go';
      e[fn](b.offsetLeft, b.offsetLeft + b.offsetWidth); ey[fn](b.offsetTop, b.offsetTop + b.offsetHeight);
      let j = 0; rows.forEach(r => { const m = f === 'all' || (f === 'read' ? r.s.k === 'read' : r.s.k !== 'read'); if (m !== r.shown){ r.shown = m; inst ? r.sl.jump(m) : r.sl.open(m, now(), m ? .12 + (j++)*.03 : 0); } }); };
    fb.forEach(b => b.onclick = () => { pick(b.dataset.f); say(`Showing ${b.textContent.toLowerCase()} tools`); });
    const init = () => pick(filt, true); document.fonts.ready.then(init); requestAnimationFrame(init);
    new ResizeObserver(() => { const b = fb.find(x => x.dataset.f === filt); e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth); ey.jump(b.offsetTop, b.offsetTop + b.offsetHeight); }).observe(fs);
    return t => {
      rows.forEach(r => { r.sw.render(t); r.sl.render(t); const w = clamp(r.w.at(t)); r.wn.style.height = px(w*r.wi.offsetHeight); fade(r.wi, w, (1 - w)*-3); });
      const a = e.A.at(t), b = e.B.at(t), c = ey.A.at(t), d = ey.B.at(t); ind.style.transform = `translate(${px(a)},${px(c)})`; ind.style.width = px(b - a); ind.style.height = px(d - c);
      bl.render(t); bh.style.width = px(bw.at(t)); n1.render(t); n2.render(t);
    };
  }});

/* ================================================================ 6. API key reveal */
atom({ id:'apikeyreveal', cat:'MCP and agents', name:'API key reveal and rotate', block:'Agent access · API keys', fam:['M','S','X'], wide:true, tall:true,
  html:`<style>
.akr-root{position:absolute;inset:0;container-type:inline-size;padding:12px;display:flex;flex-direction:column}
.akr-card{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;background:var(--card);border-radius:14px;box-shadow:var(--shadow)}
.akr-head{flex:none;display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line-soft)}
.akr-head h4{margin:0;font-size:14px;line-height:20px;font-weight:600}
.akr-sub{display:flex;gap:4px;align-items:center;font-size:12.5px;line-height:18px;color:var(--muted)}
.akr-mk{position:relative;width:96px;height:32px;padding:0;overflow:hidden;flex:none}
.akr-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.akr-fm{padding:14px;display:grid;gap:12px;border-bottom:1px solid var(--line-soft);background:var(--tile)}
.akr-fm label,.akr-fm legend{display:block;font-size:12.5px;line-height:18px;font-weight:600;margin-bottom:4px;padding:0}
.akr-fm fieldset{border:0;margin:0;padding:0;min-width:0}
.akr-fm input{width:100%;height:36px;border:1px solid var(--line);background:var(--card);border-radius:9px;padding:0 10px;font:inherit;font-size:14px;color:var(--ink)}
.akr-fm .seg{display:inline-flex}
.akr-fb{display:flex;gap:8px;justify-content:flex-end}
.akr-rv{padding:14px;border-bottom:1px solid var(--line-soft);background:var(--warning-tint)}
.akr-rv h5{margin:0;font-size:14px;line-height:20px;font-weight:600;display:flex;align-items:center;gap:8px;color:var(--warning)}
.akr-rv p{margin:2px 0 10px;font-size:12.5px;line-height:18px;color:var(--ink)}
.akr-kb{display:flex;gap:8px;align-items:stretch}
.akr-kc{flex:1;min-width:0;background:var(--card);border:1px solid var(--line);border-radius:9px;padding:8px 10px;font:12.5px/20px var(--mono);word-break:break-all;-webkit-user-select:all;user-select:all}
.akr-cp{position:relative;width:84px;padding:0;overflow:hidden;flex:none}
.akr-rn{margin-top:8px;font-size:12.5px;line-height:18px;color:var(--muted)}
.akr-rb{display:flex;justify-content:flex-end;margin-top:12px}
.akr-list{margin:0;padding:0;list-style:none}
.akr-li{border-bottom:1px solid var(--line-soft)}
.akr-r{display:flex;align-items:center;gap:12px;padding:12px 14px}
.akr-m{flex:1;min-width:0}
.akr-nm{display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px;font-size:14px;line-height:20px}
.akr-tg{font-size:11.5px;line-height:16px;font-weight:600;padding:0 7px;border-radius:8px;background:var(--raised);color:var(--muted)}
.akr-nw{font-size:11.5px;line-height:16px;font-weight:600;padding:0 7px;border-radius:8px;background:var(--accent-tint);color:var(--accent);overflow:hidden;white-space:nowrap}
.akr-px{position:relative;display:block;height:20px;margin-top:2px;font:12.5px/20px var(--mono);color:var(--muted)}
.akr-mt{position:relative;display:block;height:18px;font-size:12.5px;line-height:18px;color:var(--faint)}
.akr-ab{display:flex;gap:6px;flex:none}
.akr-ab .btn{height:30px;padding:0 11px;font-size:13px}
.akr-cf{height:0;overflow:hidden}
.akr-ci{margin:0 14px 12px;padding:10px 12px;border-radius:10px;background:var(--raised);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 12px;font-size:12.5px;line-height:18px}
.akr-ci.akr-d{background:var(--danger-tint)}
.akr-ci .akr-cb{display:flex;gap:6px;margin-left:auto}
.akr-ci .btn{height:28px;padding:0 10px;font-size:12.5px}
.akr-empty{padding:28px 14px;text-align:center;font-size:13px;color:var(--muted)}
@container (max-width:500px){.akr-r{flex-wrap:wrap}.akr-ab{width:100%}.akr-ab .btn{flex:1}.akr-kb{flex-direction:column}.akr-cp{width:100%;height:34px}}
</style>
<div class="akr-root"><div class="akr-card"><div class="akr-head"><div style="flex:1;min-width:0"><h4>API keys</h4><div class="akr-sub"><span class="akr-n"></span><span>active keys</span></div></div><button type="button" class="btn akr-mk" aria-expanded="false"><span style="position:absolute;inset:0"></span></button></div>
<div class="akr-body"><div class="akr-cm"><form class="akr-fm" autocomplete="off"><div><label for="akr-name">Key name</label><input id="akr-name" value="Staging agent" maxlength="40"></div>
<fieldset><legend>Access</legend><div class="seg akr-sg" role="radiogroup" aria-label="Access"><div class="ind"></div><button type="button" role="radio" data-a="Read only">Read only</button><button type="button" role="radio" data-a="Read and write">Read and write</button></div></fieldset>
<div class="akr-fb"><button type="button" class="btn akr-cc">Cancel</button><button type="submit" class="btn ink akr-ok">Create key</button></div></form></div>
<div class="akr-rw"><div class="akr-rv" role="group" aria-labelledby="akr-rt"><h5 id="akr-rt"></h5><p class="akr-rp">Copy it now. For security this is the only time it is shown.</p><div class="akr-kb"><code class="akr-kc" aria-label="New API key"></code><button type="button" class="btn akr-cp"><span style="position:absolute;inset:0"></span></button></div><div class="akr-rn"></div><div class="akr-rb"><button type="button" class="btn ink akr-dn">I have stored it</button></div></div></div>
<ul class="akr-list" aria-label="API keys"></ul></div></div><div class="akr-live" role="status" aria-live="polite" style="${SR}"></div></div>`,
  desc:'Create key grows the form open and swaps its own label to Cancel. Creating collapses the form, grows the one-time reveal panel in its place and drops the new row in from zero height with a New tag. Copy swaps to Copied with a green fill and falls back after 1.8s. Done closes the panel and fades the tag. Rotate and Revoke open an inline confirmation under the row; Rotate swaps the masked prefix and reopens the reveal, Revoke dims the row, swaps its line to Revoked, then collapses it.',
  api:'form.open(v)   create: form.open(0) → reveal.open(1, +0.3), row.open(1)   copy: label.swap(Copied), +1.8s swap back   revoke: row.dim → +0.7s row.open(0)',
  init(st){
    const mk = $(st,'.akr-mk'), cm = $(st,'.akr-cm'), fm = $(st,'.akr-fm'), rw = $(st,'.akr-rw'), rv = $(st,'.akr-rv'), list = $(st,'.akr-list'), live = $(st,'.akr-live'), body = $(st,'.akr-body');
    const nm = $(st,'#akr-name'), sg = $(st,'.akr-sg'), ind = $(sg,'.ind'), sb = $$(sg,'button'), cc = $(st,'.akr-cc'), ok = $(st,'.akr-ok');
    const rtt = $(st,'#akr-rt'), kc = $(st,'.akr-kc'), cp = $(st,'.akr-cp'), rn = $(st,'.akr-rn'), dn = $(st,'.akr-dn');
    const nn = new Digits($(st,'.akr-n'), 2), mkT = mText(mk.firstChild, 'left:0;right:0;top:0;text-align:center;line-height:30px'), cpT = mText(cp.firstChild, 'left:0;right:0;top:0;text-align:center;line-height:32px');
    const q = [], rows = [], cmS = mSlot(cm, fm, 0), rwS = mSlot(rw, rv, 0), ce = edges(0, 0), cy = edges(0, 0), cpW = new Track(0);
    let access = 0, serial = 3, composing = false, revealing = false, pin = -9, copiedJob = 0;
    const say = s => { live.textContent = s; };
    const gen = n => { let x = 40503 + n*7919, s = ''; const A = 'abcdefghijklmnopqrstuvwxyz0123456789'; for (let i = 0; i < 32; i++){ x = (x*1103515245 + 12345) & 0x7fffffff; s += A[(x >> 8) % 36]; } return 'lmk_live_' + s; };
    const mask = k => k.slice(0, 13) + '…' + k.slice(-4);
    const SEED = [ { n:'CI deploy', a:'Read and write', k:'lmk_live_4f9a7d3b1c58e2a06f9d4b7c21e', m:'Created Sep 12 · Last used 2 hours ago' }, { n:'Local agent', a:'Read only', k:'lmk_live_b81e53a9d02c4f67e1a807d3', m:'Created Aug 30 · Last used yesterday' }, { n:'Docs sync', a:'Read only', k:'lmk_live_92c0a6e4f13b78d95c0a15ae8', m:'Created Aug 4 · Never used' } ];
    const count = () => nn.set(String(rows.filter(r => !r.dead).length));
    const setAccess = (i, inst) => { access = i; sb.forEach((b, j) => b.setAttribute('aria-checked', i === j)); const b = sb[i], f = inst ? 'jump' : 'go'; ce[f](b.offsetLeft, b.offsetLeft + b.offsetWidth); cy[f](b.offsetTop, b.offsetTop + b.offsetHeight); };
    sb.forEach((b, i) => b.onclick = () => setAccess(i));
    sg.onkeydown = e => { if (e.key === 'ArrowRight' || e.key === 'ArrowDown'){ e.preventDefault(); setAccess(1); sb[1].focus(); } if (e.key === 'ArrowLeft' || e.key === 'ArrowUp'){ e.preventDefault(); setAccess(0); sb[0].focus(); } };
    const openForm = v => { composing = v; cmS.open(v, now(), 0); mk.setAttribute('aria-expanded', v); mkT.put(v ? 'Cancel' : 'Create key'); if (v){ mPush(q, now() + .3, () => { nm.focus({ preventScroll:true }); nm.select(); }); setAccess(access, true); } else mk.focus({ preventScroll:true }); };
    mkT.put('Create key', true); mk.onclick = () => { if (revealing) return; openForm(!composing); };
    cc.onclick = () => openForm(false);
    const showReveal = (title, key, note) => { const go = () => { rtt.textContent = title; kc.textContent = key; rn.textContent = note || ''; rn.style.display = note ? 'block' : 'none'; cpT.put('Copy', true); cp.style.background = ''; revealing = true; rwS.open(true); mk.disabled = true; mk.style.opacity = .5; mPush(q, now() + .35, () => dn.focus({ preventScroll:true })); say(title + '. Copy the key now, it is shown once.'); };
      if (revealing){ rwS.open(false); mPush(q, now() + .4, go); } else go(); };
    cpT.put('Copy', true);
    cp.onclick = () => { try { navigator.clipboard && navigator.clipboard.writeText(kc.textContent).catch(() => {}); } catch (e) {} cpT.put('Copied'); cpOn.set(1); const j = ++copiedJob; say('Key copied to clipboard'); mPush(q, now() + 1.8, () => { if (j === copiedJob){ cpT.put('Copy'); cpOn.set(0); } }); };
    const cpOn = new Track(0);
    dn.onclick = () => { revealing = false; rwS.open(false); mk.disabled = false; mk.style.opacity = 1; rows.forEach(r => r.nw.set(0)); mk.focus({ preventScroll:true }); say('Key hidden'); };
    const make = (d, enter, isNew) => {
      const li = mEl('li'); li.className = 'akr-li';
      li.innerHTML = `<div class="akr-in"><div class="akr-r"><div class="akr-m"><div class="akr-nm"><b></b><span class="akr-tg"></span><span class="akr-nw">New</span></div><span class="akr-px"></span><span class="akr-mt"></span></div><div class="akr-ab"><button type="button" class="btn akr-ro">Rotate</button><button type="button" class="btn akr-rk">Revoke</button></div></div><div class="akr-cf"><div class="akr-ci"><span class="akr-cm2"></span><span class="akr-cb"><button type="button" class="btn akr-x">Cancel</button><button type="button" class="btn akr-go ink"></button></span></div></div></div>`;
      $(li,'b').textContent = d.n; $(li,'.akr-tg').textContent = d.a;
      const r = { d, li, in:$(li,'.akr-in'), px:mText($(li,'.akr-px'), 'font:12.5px/20px var(--mono)'), mt:mText($(li,'.akr-mt'), 'line-height:18px'), nw:new Track(isNew ? 1 : 0), nwE:$(li,'.akr-nw'), cf:new Track(0), cfH:$(li,'.akr-cf'), cfI:$(li,'.akr-ci'), kind:null, dim:new Track(0), dead:false, slot:mSlot(li, $(li,'.akr-in'), enter ? 0 : 1), key:d.k };
      r.px.put(mask(d.k), true); r.mt.put(d.m, true); r.slot.open(true, now(), 0); if (!enter) r.slot.jump(true);
      list.insertBefore(li, isNew ? list.firstChild : null); rows.push(r);
      const ro = $(li,'.akr-ro'), rk = $(li,'.akr-rk'), go = $(li,'.akr-go'), x = $(li,'.akr-x'), msg = $(li,'.akr-cm2'); ro.setAttribute('aria-label', 'Rotate ' + d.n); rk.setAttribute('aria-label', 'Revoke ' + d.n);
      const askOpen = kind => { rows.forEach(o => { if (o !== r && o.kind){ o.kind = null; o.cf.set(0, S.snap); } }); r.kind = kind; $(li,'.akr-ci').classList.toggle('akr-d', kind === 'revoke'); go.textContent = kind === 'revoke' ? 'Revoke key' : 'Rotate key';
        go.style.cssText = kind === 'revoke' ? 'background:var(--danger);border-color:var(--danger);color:var(--card)' : '';
        msg.textContent = kind === 'revoke' ? `Revoke ${d.n}? Anything using this key stops working right away.` : `Rotate ${d.n}? You get a new key now. The old one keeps working for 24 hours.`; r.cf.set(1, S.base); mPush(q, now() + .25, () => go.focus({ preventScroll:true })); };
      const askClose = (back) => { r.kind = null; r.cf.set(0, S.snap); if (back) back.focus({ preventScroll:true }); };
      ro.onclick = () => r.kind === 'rotate' ? askClose(ro) : askOpen('rotate'); rk.onclick = () => r.kind === 'revoke' ? askClose(rk) : askOpen('revoke'); x.onclick = () => askClose(r.kind === 'revoke' ? rk : ro);
      li.onkeydown = e => { if (e.key === 'Escape' && r.kind){ askClose(r.kind === 'revoke' ? rk : ro); e.stopPropagation(); } };
      go.onclick = () => { const kind = r.kind; askClose();
        if (kind === 'rotate'){ serial++; const nk = gen(serial); r.key = nk; r.px.put(mask(nk)); r.mt.put('Rotated just now · Never used'); showReveal('Key rotated: ' + d.n, nk, 'The previous key keeps working for 24 hours, then stops.'); pin = now() + 1; list.scrollTop = 0; body.scrollTop = 0; }
        else { r.dead = true; r.mt.put('Revoked just now'); r.dim.set(1, S.base); mPush(q, now() + .8, () => { r.slot.open(false); count(); mPush(q, now() + .6, () => { r.li.remove(); rows.splice(rows.indexOf(r), 1); }); }); say(d.n + ' revoked'); (rows.find(o => o !== r && !o.dead) ? rows.find(o => o !== r && !o.dead).li.querySelector('.akr-rk') : mk).focus({ preventScroll:true }); } };
      return r;
    };
    SEED.forEach(d => make(d, false, false)); count();
    const submit = () => { const name = nm.value.trim() || 'Untitled key'; serial++; const key = gen(serial);
      const d = { n:name, a:sb[access].dataset.a, k:key, m:'Created just now · Never used' }; openForm(false); make(d, true, true); count(); body.scrollTop = 0; showReveal('Key created: ' + name, key, ''); };
    fm.onsubmit = e => { e.preventDefault(); submit(); };
    nm.oninput = () => { ok.disabled = !nm.value.trim(); ok.style.opacity = ok.disabled ? .5 : 1; };
    fm.onkeydown = e => { if (e.key === 'Escape'){ openForm(false); e.stopPropagation(); } };
    const init = () => setAccess(access, true); document.fonts.ready.then(init); requestAnimationFrame(init);
    return t => {
      mDrain(q, t);
      cmS.render(t); rwS.render(t); mkT.render(t); cpT.render(t); nn.render(t);
      const a = ce.A.at(t), b = ce.B.at(t), c = cy.A.at(t), d = cy.B.at(t); ind.style.transform = `translate(${px(a)},${px(c)})`; ind.style.width = px(b - a); ind.style.height = px(d - c);
      const co = clamp(cpOn.at(t)); cp.style.background = mix(co, 'var(--success-tint)', 'var(--card)'); cp.style.color = mix(co, 'var(--success)', 'var(--ink)'); cp.style.borderColor = mix(co, 'var(--success-tint)', 'var(--line)');
      for (const r of rows){ r.slot.render(t); r.px.render(t); r.mt.render(t);
        const nw = clamp(r.nw.at(t)); r.nwE.style.maxWidth = px(nw*60); r.nwE.style.opacity = nw.toFixed(3); r.nwE.style.padding = nw < .02 ? '0' : '0 7px';
        const f = clamp(r.cf.at(t)); r.cfH.style.height = px(f*r.cfI.offsetHeight + (f > 0 ? f*0 : 0)); r.cfH.style.visibility = f < .004 ? 'hidden' : 'visible'; fade(r.cfI, f, (1 - f)*-4);
        const dm = clamp(r.dim.at(t)); r.in.firstChild.style.opacity = (1 - .5*dm).toFixed(3); r.mt.s.forEach(s => s.style.color = dm > .5 ? 'var(--danger)' : ''); }
      if (t < pin) body.scrollTop = 0;
    };
  }});

/* ================================================================ 7. Server status */
atom({ id:'serverstatus', cat:'MCP and agents', name:'Server connection health', block:'Agent access · server status', fam:['M','S','T'], wide:true, tall:true,
  html:`<style>
.srs-root{position:absolute;inset:0;container-type:inline-size;padding:12px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.srs-card{max-width:900px;margin:0 auto;background:var(--card);border-radius:14px;box-shadow:var(--shadow)}
.srs-head{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line-soft)}
.srs-ic{flex:none;width:38px;height:38px;border-radius:10px;background:var(--raised);display:grid;place-items:center}
.srs-head h4{margin:0;font-size:14px;line-height:20px;font-weight:600}
.srs-head small{display:block;font-size:12.5px;line-height:18px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.srs-bd{display:grid;grid-template-columns:minmax(0,1fr);gap:0}
.srs-lat{padding:16px;border-bottom:1px solid var(--line-soft)}
.srs-cap{font-size:12.5px;line-height:18px;color:var(--muted)}
.srs-big{position:relative;height:56px;margin:2px 0 10px}
.srs-big>span{position:absolute;left:0;top:0;display:flex;align-items:baseline;gap:6px;font-size:44px;line-height:56px;font-weight:600;letter-spacing:-.03em}
.srs-big small{font-size:15px;font-weight:500;letter-spacing:0;color:var(--muted);align-self:flex-end;margin-bottom:11px}
.srs-dash{font-weight:400!important}
.srs-lp{gap:0!important}
.srs-spk{display:flex;align-items:flex-end;gap:3px;height:56px}
.srs-spk i{flex:1;min-width:0;border-radius:3px 3px 1px 1px}
.srs-sp{padding:16px}
.srs-sp ol{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
.srs-sp li{display:flex;align-items:center;gap:10px;font-size:13.5px;line-height:20px}
.srs-si{position:relative;flex:none;width:20px;height:20px;border-radius:50%}
.srs-si>span{position:absolute;inset:0;display:grid;place-items:center}
.srs-st{margin-left:auto;font-size:12px;color:var(--faint)}
.srs-er{height:0;overflow:hidden}
.srs-ei{margin-top:12px;padding:10px 12px;border-radius:10px;background:var(--danger-tint);color:var(--danger);font-size:12.5px;line-height:18px}
.srs-ei b{display:block;font-weight:600}
.srs-ei code{font:12px/18px var(--mono)}
.srs-ei .srs-cd{display:flex;gap:4px;align-items:center;margin-top:4px}
.srs-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:1px solid var(--line-soft)}
.srs-stats>div{padding:12px 16px;border-bottom:1px solid var(--line-soft)}
.srs-stats dt{font-size:12px;line-height:16px;color:var(--faint)}
.srs-stats dd{position:relative;margin:2px 0 0;height:22px;font-size:15px;line-height:22px;font-weight:600}
.srs-stats dd>span{position:absolute;left:0;top:0;display:flex;gap:4px;align-items:center;white-space:nowrap}
.srs-tl{gap:0!important}
.srs-ft{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px;justify-content:flex-end}
.srs-ft .btn{position:relative;height:34px;padding:0;overflow:hidden}
@container (max-width:480px){.srs-head{flex-wrap:wrap}.srs-chip{flex:1 0 100%;padding-left:50px;margin-top:-4px}}
@container (min-width:640px){
  .srs-bd{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}
  .srs-lat{border-bottom:0;border-right:1px solid var(--line-soft)}
  .srs-stats{grid-template-columns:repeat(4,minmax(0,1fr))}
  .srs-stats>div{border-bottom:0}
  .srs-stats>div:not(:last-child){border-right:1px solid var(--line-soft)}
}
</style>
<div class="srs-root"><section class="srs-card" aria-labelledby="srs-t"><div class="srs-head"><span class="srs-ic">${ic('<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>', 19, 1.75)}</span><div style="flex:1;min-width:0"><h4 id="srs-t">Postgres</h4><small>analytics-ro · stdio · postgres-mcp 0.9.2</small></div><span class="srs-chip"></span></div>
<div class="srs-bd"><div class="srs-lat"><div class="srs-cap">Round-trip latency</div><div class="srs-big"><span class="srs-n"><span class="srs-d"></span><small>ms</small></span><span class="srs-dash" style="color:var(--faint)">—</span></div><div class="srs-spk" aria-hidden="true"></div></div>
<div class="srs-sp"><ol class="srs-steps" aria-label="Connection steps"></ol><div class="srs-er"><div class="srs-ei"><b class="srs-em"></b><code class="srs-ec"></code><div class="srs-cd"><span class="srs-cl">Retrying in</span><span class="srs-c1"></span><span>s</span><span>·</span><span>attempt</span><span class="srs-c2"></span></div></div></div></div></div>
<dl class="srs-stats"><div><dt>Uptime, 30 days</dt><dd><span>99.98%</span></dd></div><div><dt>Tools available</dt><dd><span class="srs-tl"></span></dd></div><div><dt>Protocol</dt><dd><span>2025-06-18</span></dd></div><div><dt>Last ping</dt><dd><span class="srs-lp"><span class="srs-lpd"></span><span>s ago</span></span><span class="srs-lx" style="color:var(--faint)">Never</span></dd></div></dl>
<div class="srs-ft"><button type="button" class="btn srs-a" style="width:112px"><span style="position:absolute;inset:0"></span></button><button type="button" class="btn srs-b" style="width:140px"><span style="position:absolute;inset:0"></span></button></div></section><div class="srs-live" role="status" aria-live="polite" style="${SR}"></div></div>`,
  desc:'Connecting walks four steps in order: each swaps its ring for a spinner, then a check, 450 to 600ms apart, and the chip morphs to Connected when the last lands. The latency number rolls digit by digit with each ping while the sparkline shifts one bar left and every bar springs to its neighbor’s height. Simulate outage drops the bars flat and morphs everything to the error state; a countdown rolls down, the first auto retry fails at Initialize, and the second succeeds. Retry now skips the wait.',
  api:'steps[i]: wait → run → done | fail   latency.set(ms)   bars[i].set(vals[i+1])   outage: bars.set(0, t + i·0.02), err.open(1)   countdown = ceil(retryAt − t)',
  init(st){
    const live = $(st,'.srs-live'), spk = $(st,'.srs-spk'), steps = $(st,'.srs-steps'), A = $(st,'.srs-a'), B = $(st,'.srs-b'), er = $(st,'.srs-er'), erI = $(st,'.srs-ei');
    const chip = mChip([{ l:'Connected', tint:'var(--success-tint)', col:'var(--success)' }, { l:'Connecting', tint:'var(--raised)', col:'var(--muted)', spin:true }, { l:'Error', tint:'var(--danger-tint)', col:'var(--danger)' }], 1); $(st,'.srs-chip').appendChild(chip.el);
    const lat = new Digits($(st,'.srs-d'), 3), tools = new Digits($(st,'.srs-tl'), 2), lpd = new Digits($(st,'.srs-lpd'), 2), c1 = new Digits($(st,'.srs-c1'), 2), c2 = new Digits($(st,'.srs-c2'), 1);
    const nSw = new Swap(1), nEls = [$(st,'.srs-n'), $(st,'.srs-dash')], lpSw = new Swap(1), lpEls = [$(st,'.srs-lp'), $(st,'.srs-lx')];
    const aT = mText(A.firstChild, 'left:0;right:0;top:0;text-align:center;line-height:32px;font-size:13px;font-weight:500'), bT = mText(B.firstChild, 'left:0;right:0;top:0;text-align:center;line-height:32px;font-size:13px;font-weight:500');
    const STEP = ['Resolve host', 'Open TLS connection', 'Initialize session', 'List tools'], DUR = [.45, .5, .6, .5], LAT = [38, 41, 36, 44, 39, 52, 40, 37, 43, 35, 46, 39];
    const rows = STEP.map((n, i) => { const li = mEl('li'); li.innerHTML = `<span class="srs-si"><span class="srs-la" style="color:var(--faint)">${ic('<circle cx="12" cy="12" r="7"/>', 16, 2)}</span><span class="srs-lb" style="color:var(--muted)">${SPIN(16)}</span><span class="srs-lc" style="color:var(--success)">${ic(I.check, 14, 3)}</span><span class="srs-ld" style="color:var(--danger)">${ic(I.x, 13, 3)}</span></span><span class="srs-nm"></span><span class="srs-st"></span>`;
      $(li,'.srs-nm').textContent = n; steps.appendChild(li); return { li, L:$$(li,'.srs-si>span'), ring:$(li,'.srs-si'), st:$(li,'.srs-st'), sw:new Swap(0), W:[0,1,2,3].map(k => new Track(k === 0 ? 1 : 0)), k:0 }; });
    const bars = [...Array(24)].map(() => { const i = mEl('i'); spk.appendChild(i); return { e:i, v:new Track(.05) }; });
    const q = [], erS = mSlot(er, erI, 0), W = [new Track(0), new Track(1), new Track(0)];
    let state = 1, job = 0, vals = LAT.concat(LAT).slice(0, 24), li_ = 0, failsLeft = 0, attempt = 1, retryAt = 0, lastPing = 0, shownC = -1, shownLp = -1, started = false;
    const say = s => { live.textContent = s; };
    const setStep = (i, k, inst) => { const r = rows[i]; r.k = k; r.sw.to(k); r.W.forEach((w, j) => inst ? w.jump(j === k ? 1 : 0) : w.set(j === k ? 1 : 0, S.base)); r.st.textContent = k === 2 ? DUR[i].toFixed(2).replace(/^0/, '0') + 's' : k === 3 ? 'Failed' : ''; r.st.style.color = k === 3 ? 'var(--danger)' : ''; };
    const setBtns = () => { aT.put('Reconnect'); bT.put(state === 2 ? 'Retry now' : 'Simulate outage'); A.disabled = state !== 0; B.disabled = state === 1; A.style.opacity = A.disabled ? .45 : 1; B.style.opacity = B.disabled ? .45 : 1; B.dataset.p = state === 2 ? 1 : 0; };
    const barsTo = (arr, t0, stag, scale = 80) => bars.forEach((b, i) => b.v.set(Math.max(.05, arr[i]/scale), S.base, t0 + i*stag));
    const showNum = on => { nSw.to(on ? 0 : 1); };
    const connect = failAt => {
      const j = ++job; state = 1; chip.set(1); W.forEach((w, i) => w.set(i === 1 ? 1 : 0, S.base)); setBtns(); erS.open(false); lat.set(''); showNum(false); lpSw.to(1); tools.set('0');
      rows.forEach((r, i) => setStep(i, 0)); barsTo(bars.map(() => 4), now(), .01); say('Postgres connecting');
      let tt = now() + .15;
      for (let i = 0; i < STEP.length; i++){
        mPush(q, tt, () => { if (j === job) setStep(i, 1); }); tt += DUR[i];
        if (i === failAt){ mPush(q, tt, () => { if (j !== job) return; setStep(i, 3); fail('Initialize timed out after 5 s', 'initialize · no response from postgres-mcp'); }); return; }
        mPush(q, tt, () => { if (j === job) setStep(i, 2); }); }
      mPush(q, tt + .05, () => { if (j === job) good(); });
    };
    const good = () => { state = 0; attempt = 1; chip.set(0); W.forEach((w, i) => w.set(i === 0 ? 1 : 0, S.base)); setBtns(); vals = LAT.concat(LAT).slice(0, 24); li_ = 0; barsTo(vals, now(), .02); lat.set(String(LAT[0])); showNum(true); tools.set('14'); lastPing = now(); lpSw.to(0); say('Postgres connected, 38 milliseconds');
      mPush(q, now() + 1.3, () => tick(job)); };
    const tick = j => { if (j !== job || state !== 0) return; li_++; const v = LAT[(li_ + 11) % LAT.length] + ((li_*7) % 5) - 2; vals.push(v); vals.shift(); barsTo(vals, now(), 0); lat.set(String(v)); lastPing = now(); mPush(q, now() + 1.3, () => tick(j)); };
    const fail = (m, c) => { state = 2; chip.set(2); W.forEach((w, i) => w.set(i === 2 ? 1 : 0, S.base)); showNum(false); lat.set(''); lpSw.to(1); tools.set('0'); barsTo(bars.map(() => 0), now(), .015);
      $(st,'.srs-em').textContent = m; $(st,'.srs-ec').textContent = c; attempt++; retryAt = now() + (failsLeft > 0 ? 4 : 8); setBtns(); erS.open(true); c2.set(String(attempt)); say('Postgres error. ' + m); mPush(q, now() + .4, () => B.focus({ preventScroll:true })); };
    const retry = () => { const f = failsLeft > 0 ? 2 : -1; if (failsLeft > 0) failsLeft--; connect(f); };
    const outage = () => { job++; q.length = 0; failsLeft = 1; attempt = 1; fail('Connection refused', 'ECONNREFUSED 10.0.4.12:5432'); rows.forEach((r, i) => setStep(i, 0)); failsLeft = 1; };
    A.onclick = () => { if (state === 0){ failsLeft = 0; connect(-1); } };
    B.onclick = () => { if (state === 0) outage(); else if (state === 2) retry(); };
    chip.set(1, true); showNum(false); lpSw.to(1); setBtns(); tools.set('0', true); lat.set('', true); aT.put('Reconnect', true); bT.put('Simulate outage', true);
    nSw.cur = 1; nSw.prev = null; nSw.t = -9; lpSw.cur = 1; lpSw.prev = null; lpSw.t = -9;
    return t => {
      if (!started){ started = true; connect(-1); }
      mDrain(q, t);
      if (state === 2){ const s = Math.max(0, Math.ceil(retryAt - t)); if (s !== shownC){ shownC = s; c1.set(String(s)); } if (t >= retryAt){ retry(); } }
      if (state === 0){ const s = Math.min(99, Math.floor(t - lastPing)); if (s !== shownLp){ shownLp = s; lpd.set(String(s)); } }
      chip.render(t); lat.render(t); tools.render(t); lpd.render(t); c1.render(t); c2.render(t); aT.render(t); bT.render(t); erS.render(t);
      nEls.forEach((e, k) => nSw.apply(e, k, t, 6)); lpEls.forEach((e, k) => lpSw.apply(e, k, t, 3));
      const ws = W.map(w => w.at(t)); const col = mBlend(ws, ['var(--accent)', 'var(--line)', 'var(--danger)']);
      bars.forEach(b => { b.e.style.height = px(Math.max(3, clamp(b.v.at(t), 0, 1.1)*56)); b.e.style.background = col; });
      rows.forEach(r => { const ws2 = r.W.map(w => w.at(t)); r.L.forEach((e, k) => r.sw.apply(e, k, t, 0)); r.L[1].style.transform = `rotate(${((t*540)%360).toFixed(1)}deg)`; });
      B.style.background = mix(clamp(W[2].at(t)), 'var(--ink)', 'var(--card)'); B.style.color = mix(clamp(W[2].at(t)), 'var(--card)', 'var(--ink)'); B.style.borderColor = mix(clamp(W[2].at(t)), 'var(--ink)', 'var(--line)');
    };
  }});

/* ================================================================ 8. Agent access matrix */
atom({ id:'agentaccess', cat:'MCP and agents', name:'Agent permission matrix', block:'AgentAccessScreen · grants', fam:['M','S','E'], wide:true, tall:true,
  html:`<style>
.aam-root{position:absolute;inset:0;container-type:inline-size;padding:12px;display:flex;flex-direction:column}
.aam-card{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;background:var(--card);border-radius:14px;box-shadow:var(--shadow)}
.aam-head{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:12px 14px;border-bottom:1px solid var(--line-soft)}
.aam-ic{flex:none;width:36px;height:36px;border-radius:10px;background:var(--ink);color:var(--card);display:grid;place-items:center}
.aam-hm{flex:1 1 160px;min-width:0}
.aam-hm h4{margin:0;font-size:14px;line-height:20px;font-weight:600}
.aam-sb{position:relative;display:block;height:18px;font-size:12.5px;line-height:18px;color:var(--muted)}
.aam-mx{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:4px 14px 8px}
.aam-r{display:grid;grid-template-columns:minmax(120px,1.1fr) minmax(130px,1fr) repeat(5,56px);grid-template-areas:"nm sc a0 a1 a2 a3 a4";align-items:center;column-gap:4px;padding:8px 0;border-bottom:1px solid var(--line-soft)}
.aam-r:last-child{border-bottom:0}
.aam-r.h{padding:6px 0;position:sticky;top:-4px;background:var(--card);z-index:2}
.aam-r.h>div{font-size:12px;line-height:16px;font-weight:600;color:var(--muted);text-align:center}
.aam-nm{grid-area:nm;font-size:14px;line-height:20px;font-weight:600;min-width:0}
.aam-sc{grid-area:sc;min-width:0;padding-right:8px}
.aam-chip{display:inline-flex;align-items:center;gap:5px;max-width:100%;height:26px;padding:0 8px 0 10px;border-radius:13px;border:1.5px solid transparent;background:var(--raised);font-size:12px;font-weight:500;cursor:pointer;color:var(--ink)}
.aam-chip[disabled]{cursor:default;color:var(--muted)}
.aam-ct{position:relative;display:block;height:16px;overflow:hidden}
.aam-ct>span{position:absolute;left:0;top:0;white-space:nowrap;line-height:16px}
.aam-c{display:grid;place-items:center;min-width:0}
.aam-b{width:30px;height:30px;border-radius:8px;border:1.5px solid var(--line);background:var(--card);padding:0;cursor:pointer;display:grid;place-items:center}
.aam-b svg{display:block}
.aam-lk{width:30px;height:30px;display:grid;place-items:center;color:var(--faint);font-size:14px}
.aam-df{flex:none;border-top:1px solid var(--line-soft)}
.aam-dp{padding:12px 14px;background:var(--tile)}
.aam-dh{display:flex;align-items:center;gap:8px;font-size:13px;line-height:20px;font-weight:600}
.aam-dh .aam-nb{display:inline-flex;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:var(--ink);color:var(--card);font-size:12px;align-items:center;justify-content:center}
.aam-dl{margin:6px 0 0;padding:0;list-style:none;max-height:104px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.aam-dl li{font-size:12.5px;line-height:18px}
.aam-dl .aam-in{display:flex;gap:8px;align-items:center;padding:3px 0}
.aam-tg{flex:none;font-size:11px;line-height:16px;font-weight:600;padding:0 7px;border-radius:8px}
.aam-db{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}
.aam-db .btn{position:relative;height:32px;padding:0;overflow:hidden}
@container (max-width:560px){
  .aam-r{grid-template-columns:minmax(0,1fr) repeat(5,38px);grid-template-areas:"nm a0 a1 a2 a3 a4" "sc a0 a1 a2 a3 a4";column-gap:2px;row-gap:3px}
  .aam-sc{padding-right:4px}
  .aam-r.h{grid-template-areas:"nm a0 a1 a2 a3 a4"}
  .aam-r.h>div{font-size:10.5px}
  .aam-schd{display:none}
  .aam-chip .aam-ar{display:none!important}.aam-chip{padding:0 9px!important}
  .aam-nm{font-size:13.5px;line-height:18px}
  .aam-chip{height:24px;padding:0 6px 0 8px;font-size:11.5px}
  .aam-mx{padding:4px 10px 8px}
}
</style>
<div class="aam-root"><section class="aam-card" aria-label="Assistant access to Northwind"><div class="aam-head"><span class="aam-ic">${ic('<path d="M12 4v16M5 8l14 8M19 8 5 16"/>', 18, 2)}</span><div class="aam-hm"><h4>Assistant</h4><span class="aam-sb"></span></div><span class="aam-ch"></span></div>
<div class="aam-mx"><div class="aam-t" role="table" aria-label="What the assistant can do on Northwind"></div></div>
<div class="aam-df"><div class="aam-dp"><div class="aam-dh"><span>Pending changes</span><span class="aam-nb"><span class="aam-dn"></span></span></div><ul class="aam-dl" aria-label="Pending changes"></ul><div class="aam-db"><button type="button" class="btn aam-dc" style="width:84px">Discard</button><button type="button" class="btn ink aam-sv" style="width:132px"><span style="position:absolute;inset:0"></span></button></div></div></div>
</section><div class="aam-live" role="status" aria-live="polite" style="${SR}"></div></div>`,
  desc:'Each cell is a checkbox. Toggling springs the fill and check, and the cell takes a full outline (ink for added, red with a faint check for removed) so the change is visible before saving. The pending panel grows up from the bottom edge and each change enters as its own row. The header chip morphs to Can publish or delete as soon as one of those grants is on. Save swaps to a spinner, then Saved, collapses the rows and settles every outline; Discard springs everything back.',
  api:'cell.p.set(draft)   cell.q.set(draft ≠ saved)   diff.open(any)   diff[key].open(add | remove)   save: label.swap(spin → Saved), q.set(0), panel.open(0, +0.7)',
  init(st){
    const tbl = $(st,'.aam-t'), df = $(st,'.aam-df'), dp = $(st,'.aam-dp'), dl = $(st,'.aam-dl'), live = $(st,'.aam-live'), sub = mText($(st,'.aam-sb'), 'line-height:18px'), sv = $(st,'.aam-sv'), dc = $(st,'.aam-dc');
    const dn = new Digits($(st,'.aam-dn'), 2), svT = mText(sv.firstChild, 'left:0;right:0;top:0;text-align:center;line-height:30px;font-size:13px;font-weight:500'), q = [];
    const chip = mChip([{ l:'Drafts and edits only', tint:'var(--raised)', col:'var(--muted)' }, { l:'Can publish or delete', tint:'var(--warning-tint)', col:'var(--warning)' }], 0); $(st,'.aam-ch').appendChild(chip.el);
    const ACT = [['Read', 'Read'], ['Add', 'Create'], ['Edit', 'Edit'], ['Publish', 'Publish'], ['Delete', 'Delete']];
    const R = [
      { n:'Pages', sc:['Whole site', 'Drafts only', '3 pages'], sv:[1,1,1,0,0], lk:[] },
      { n:'Posts', sc:['Whole site', 'Drafts only'], sv:[1,1,1,0,0], lk:[] },
      { n:'Media library', sc:['All folders', 'Uploads only'], sv:[1,1,0,0,0], lk:[3] },
      { n:'Form submissions', sc:['All forms', 'Contact only'], sv:[1,0,0,0,0], lk:[1,2,3] },
      { n:'Members', sc:['All roles', 'Viewers'], sv:[1,0,0,0,0], lk:[3] },
      { n:'Billing', sc:['Owner view'], sv:[0,0,0,0,0], lk:[1,2,3,4] } ];
    const h = mEl('div'); h.className = 'aam-r h'; h.setAttribute('role', 'row'); h.innerHTML = `<div class="aam-nm" role="columnheader" style="text-align:left;grid-area:nm">Resource</div><div role="columnheader" style="grid-area:sc;text-align:left" class="aam-schd">Scope</div>`;
    ACT.forEach((a, i) => { const c = mEl('div', `grid-area:a${i}`, a[0]); c.setAttribute('role', 'columnheader'); c.title = a[1]; h.appendChild(c); }); tbl.appendChild(h);
    const say = s => { live.textContent = s; };
    function label(c){ c.b.setAttribute('aria-label', `${c.o.r.n}: ${ACT[c.ci][1]}`); }
    let saving = false;
    const cells = [], rows = R.map((r, ri) => { const row = mEl('div'); row.className = 'aam-r'; row.setAttribute('role', 'row');
      row.innerHTML = `<div class="aam-nm" role="rowheader"></div><div class="aam-sc" role="cell"></div>`; $(row,'.aam-nm').textContent = r.n;
      const chipB = mEl('button'); chipB.type = 'button'; chipB.className = 'aam-chip'; chipB.innerHTML = `<span class="aam-ct"></span><span class="aam-ar" style="display:flex;opacity:.7">${ic(I.chev, 11, 2.5)}</span>`;
      const ct = mText($(chipB,'.aam-ct'), ''), cw = new Track(0), cp = new Track(0); $(row,'.aam-sc').appendChild(chipB);
      const o = { r, ri, row, chipB, ct, cw, cp, sc:0, scS:0, cells:[] };
      if (r.sc.length < 2){ chipB.disabled = true; $(chipB,'.aam-ar').remove(); chipB.style.paddingRight = '10px'; }
      ct.put(r.sc[0], true);
      o.fit = inst => { const w = measureW(ct.s[ct.k], r.sc[o.sc]); if (w) inst ? cw.jump(w) : cw.set(w); };
      for (let ci = 0; ci < 5; ci++){
        const wrap = mEl('div', `grid-area:a${ci}`); wrap.className = 'aam-c'; wrap.setAttribute('role', 'cell');
        if (r.lk.includes(ci)){ wrap.innerHTML = `<span class="aam-lk" title="Not available for ${r.n.toLowerCase()}" aria-label="Not available">–</span>`; o.cells.push(null); }
        else { const b = mEl('button'); b.type = 'button'; b.className = 'aam-b'; b.setAttribute('role', 'checkbox'); b.innerHTML = ic(I.check, 16, 3);
          const c = { o, ci, b, svg:b.firstChild, d:!!r.sv[ci], s:!!r.sv[ci], p:new Track(r.sv[ci] ? 1 : 0), qq:new Track(0), g:new Track(0), risk:ci === 4 ? 'danger' : ci === 3 ? 'warn' : '' };
          wrap.appendChild(b); o.cells.push(c); cells.push(c); b.dataset.r = ri; b.dataset.c = ci; b.onclick = () => flip(c); b.onkeydown = e => nav(e, c); label(c); }
        row.appendChild(wrap); }
      chipB.onclick = () => { o.sc = (o.sc + 1) % r.sc.length; o.ct.put(r.sc[o.sc]); o.fit(); chipB.setAttribute('aria-label', `${r.n} scope: ${r.sc[o.sc]}. Change`); o.cp.set(o.sc !== o.scS ? 1 : 0, S.base); diff(); };
      chipB.setAttribute('aria-label', `${r.n} scope: ${r.sc[0]}. Change`); tbl.appendChild(row); return o; });
    const nav = (e, c) => { const dr = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] }[e.key]; if (!dr) return; e.preventDefault();
      let r = c.o.ri, k = c.ci; for (;;){ r += dr[0]; k += dr[1]; if (r < 0 || r >= rows.length || k < 0 || k > 4) return; const n = rows[r].cells[k]; if (n){ n.b.focus(); return; } } };
    const flip = c => { if (saving) return; c.d = !c.d; c.b.setAttribute('aria-checked', c.d); c.p.set(c.d ? 1 : 0, S.base); const pend = c.d !== c.s; c.qq.set(pend ? 1 : 0, S.base); c.g.set(!c.d && c.s ? 1 : 0, S.base); diff(); say(`${c.o.r.n}, ${ACT[c.ci][1]} ${c.d ? 'on' : 'off'}`); };
    cells.forEach(c => c.b.setAttribute('aria-checked', c.d));
    // pending diff
    const ds = new Map();
    const slot = mSlot(df, dp, 0), pendingList = () => { const out = [];
      rows.forEach(o => { if (o.sc !== o.scS) out.push([`s${o.ri}`, 'Scope', `${o.r.n}: ${o.r.sc[o.scS]} to ${o.r.sc[o.sc]}`]);
        o.cells.forEach(c => { if (c && c.d !== c.s) out.push([`c${o.ri}:${c.ci}`, c.d ? 'Added' : 'Removed', `${o.r.n} · ${ACT[c.ci][1]}`]); }); }); return out; };
    const TAG = { Added:['var(--success-tint)', 'var(--success)'], Removed:['var(--danger-tint)', 'var(--danger)'], Scope:['var(--raised)', 'var(--muted)'] };
    const risk = () => cells.some(c => c.d && c.risk) ? 1 : 0;
    const diff = () => { const list = pendingList(), keys = new Set(list.map(x => x[0])); if (saving) return;
      list.forEach(([k, tg, tx]) => { let e = ds.get(k);
        if (!e){ const li = mEl('li'); li.innerHTML = `<div class="aam-in"><span class="aam-tg"></span><span class="aam-tx"></span></div>`; $(li,'.aam-tg').textContent = tg; $(li,'.aam-tg').style.cssText = `background:${TAG[tg][0]};color:${TAG[tg][1]}`; $(li,'.aam-tx').textContent = tx; dl.appendChild(li);
          e = { li, slot:mSlot(li, $(li,'.aam-in'), 0) }; e.slot.open(true, now(), ds.size*.0); ds.set(k, e); dl.scrollTop = dl.scrollHeight; }
        else $(e.li,'.aam-tx').textContent = tx; });
      for (const [k, e] of ds) if (!keys.has(k)){ ds.delete(k); e.slot.open(false); mPush(q, now() + .5, () => e.li.remove()); }
      dn.set(String(list.length)); slot.open(list.length > 0); chip.set(risk());
      if (list.length){ svT.put('Save changes'); sv.disabled = dc.disabled = false; } };
    const settle = () => { rows.forEach(o => { o.scS = o.sc; o.cp.set(0, S.base); o.cells.forEach(c => { if (!c) return; c.s = c.d; c.qq.set(0, S.base); c.g.set(0, S.base); }); }); };
    sv.onclick = () => { if (saving || !pendingList().length) return; saving = true; sv.disabled = dc.disabled = true; svT.put('Saving'); const n = pendingList().length;
      mPush(q, now() + 1.1, () => { svT.put('Saved'); settle(); sub.put('Saved. Live on the next request.'); say(`${n} changes saved`);
        mPush(q, now() + .7, () => { saving = false; for (const [k, e] of ds){ e.slot.open(false); mPush(q, now() + .5, () => e.li.remove()); } ds.clear(); dn.set('0'); slot.open(false); mPush(q, now() + .5, () => { svT.put('Save changes', true); }); }); }); };
    dc.onclick = () => { if (saving) return; cells.forEach(c => { if (c.d !== c.s){ c.d = c.s; c.b.setAttribute('aria-checked', c.d); c.p.set(c.d ? 1 : 0, S.base); c.qq.set(0, S.base); c.g.set(0, S.base); } });
      rows.forEach(o => { if (o.sc !== o.scS){ o.sc = o.scS; o.ct.put(o.r.sc[o.sc]); o.fit(); o.cp.set(0, S.base); o.chipB.setAttribute('aria-label', `${o.r.n} scope: ${o.r.sc[o.sc]}. Change`); } }); diff(); say('Changes discarded'); };
    sub.put('App MCP · active 4 minutes ago', true); svT.put('Save changes', true); dn.set('0', true);
    const fitAll = () => rows.forEach(o => o.fit(true)); document.fonts.ready.then(fitAll); requestAnimationFrame(fitAll);
    return t => {
      mDrain(q, t);
      cells.forEach(c => { const p = clamp(c.p.at(t)), qv = clamp(c.qq.at(t)), g = clamp(c.g.at(t)), on = c.risk === 'danger' ? ['var(--danger-tint)', 'var(--danger)'] : c.risk === 'warn' ? ['var(--warning-tint)', 'var(--warning)'] : ['var(--accent-tint)', 'var(--accent)'];
        c.b.style.background = mix(p, on[0], 'var(--card)'); c.b.style.color = mix(g, 'var(--danger)', on[1]);
        c.b.style.borderColor = mix(qv, c.d ? 'var(--ink)' : 'var(--danger)', 'var(--line)'); c.svg.style.opacity = Math.max(p, g*.4).toFixed(3); c.svg.style.transform = `scale(${(.7 + .3*Math.max(p, g)).toFixed(3)})`; });
      rows.forEach(o => { o.ct.render(t); o.ct.s[0].parentNode.style.width = px(o.cw.at(t)); const cp = clamp(o.cp.at(t)); o.chipB.style.borderColor = mix(cp, 'var(--ink)', 'var(--raised)'); });
      slot.render(t); for (const e of ds.values()) e.slot.render(t); dn.render(t); chip.render(t); sub.render(t); svT.render(t);
      sv.style.opacity = sv.disabled && !saving ? .5 : 1;
    };
  }});

})();