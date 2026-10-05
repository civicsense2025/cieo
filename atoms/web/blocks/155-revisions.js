

/* ---------- Workflow (organisms): revision history, annotation review, auth shell ---------- */
(() => {
const mk = (tag, css, html) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; };
const hx = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// clock-based timed sequence: [time, fn] drained at the top of render
const queue = () => { const q = []; return {
  at: (dt, fn) => q.push([now() + dt, fn]),
  run: t => { for (let i = 0; i < q.length;){ if (q[i][0] <= t){ const f = q.splice(i, 1)[0][1]; f(); } else i++; } },
  clear: () => { q.length = 0; } }; };
// two stacked layers that swap: write the idle layer, then exit/enter (never overlapping)
class Pair {
  constructor(els){ this.els = els; this.sw = new Swap(0); this.marks = [{ ins:[], del:[] }, { ins:[], del:[] }]; }
  collect(i){ const e = this.els[i]; this.marks[i] = { ins:$$(e, '[data-k="i"]'), del:$$(e, '[data-k="d"]').map(s => ({ e:s, w:s.offsetWidth })) }; }
  put(html){ const n = this.sw.cur ^ 1; this.els[n].innerHTML = html; this.collect(n); this.sw.to(n); }
  init(html){ this.sw.cur = 0; this.sw.prev = null; this.sw.t = -9; this.els[0].innerHTML = html; this.els[1].innerHTML = ''; this.marks = [{ ins:[], del:[] }, { ins:[], del:[] }]; }
  render(t){ this.els.forEach((e, i) => this.sw.apply(e, i, t, 4)); }
}
// pane swap with direction: old pane leaves toward -dir, new pane arrives from +dir
class DSwap extends Swap {
  to(k, dir, t = now()){ if (!super.to(k, t)) return false; this.dir = dir; return true; }
  apply(el, k, t){
    super.apply(el, k, t, 0); let x = 0;
    if (k === this.cur){ x = (1 - clamp(prog(t, this.t + EXIT))) * 18 * this.dir; }
    else if (k === this.prev){ const p = clamp((t - this.t) / EXIT); x = -p * p * 18 * this.dir; }
    el.style.transform = `translateX(${px(x)})`;
  }
}
const WHO = {
  maya:{ n:'Maya Okafor', i:'MO', c:'var(--accent)' }, theo:{ n:'Theo Lindqvist', i:'TL', c:'var(--ink)' },
  priya:{ n:'Priya Raman', i:'PR', c:'var(--muted)' }, ben:{ n:'Ben Alvarez', i:'BA', c:'var(--faint)' },
  me:{ n:'You', i:'MO', c:'var(--accent)' } };
const avatar = (w, s = 24) => `<span aria-hidden="true" style="flex:none;width:${s}px;height:${s}px;border-radius:50%;background:${w.c};color:var(--card);font-size:${s > 22 ? 10 : 9}px;font-weight:600;display:grid;place-items:center">${w.i}</span>`;
const ago = s => s < 5 ? 'now' : s < 60 ? `${Math.floor(s)}s ago` : s < 3600 ? `${Math.floor(s / 60)}m ago` : s < 86400 ? `${Math.floor(s / 3600)}h ago` : `${Math.floor(s / 86400)}d ago`;
const LOCK = '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>';

/* ================================================================ 1. Revision history */
atom({ id:'revisions', cat:'Workflow', name:'Revision history', block:'RevisionHistoryTab (editor Layers panel, History tab)', fam:['S','X','M','T'], wide:true, tall:true,
  html:`<div class="rw-rv" style="position:absolute;inset:12px;display:flex;gap:12px">
    <section class="card rw-rvp" aria-label="Editor" style="flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden">
      <header class="rw-rvh" style="flex:none;display:flex;align-items:center;gap:12px;padding:0 14px;height:44px;border-bottom:1px solid var(--line-soft)"><b class="small" style="white-space:nowrap">Refund policy</b><span class="rw-rvt" role="status" aria-live="polite" style="position:relative;flex:1;min-width:0;height:20px;overflow:hidden"><span style="position:absolute;left:0;right:0;top:0;line-height:20px;font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></span><span style="position:absolute;left:0;right:0;top:0;line-height:20px;font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></span></span></header>
      <div style="position:relative;flex:1;min-height:0;overflow:hidden"><div class="rw-rvx" style="position:absolute;inset:0;padding:14px 18px;overflow:hidden"></div><div class="rw-rvx" style="position:absolute;inset:0;padding:14px 18px;overflow:hidden"></div></div>
    </section>
    <aside class="card rw-rvs" aria-label="Version history" style="flex:none;width:262px;display:flex;flex-direction:column;overflow:hidden">
      <header style="flex:none;display:flex;align-items:center;gap:8px;height:40px;padding:0 10px 0 14px;border-bottom:1px solid var(--line-soft)"><b class="small">History</b><span class="rw-rvn small muted num" style="flex:1"></span><button type="button" class="btn rw-rvr" style="padding:3px 9px;font-size:12px">Reset</button></header>
      <div class="rw-rvc" style="position:relative;flex:1;min-height:0;overflow:auto"><button type="button" class="rw-rvcur" style="display:flex;align-items:center;gap:10px;width:calc(100% - 12px);height:48px;margin:6px 6px 2px;padding:0 6px;border:0;border-radius:9px;background:transparent;text-align:left;cursor:pointer;color:var(--ink)">${avatar(WHO.maya)}<span style="min-width:0"><span style="display:block;font-size:13px;font-weight:500;line-height:18px">Current draft</span><span class="muted" style="display:block;font-size:12px;line-height:16px">Maya Okafor · <span class="rw-tm"></span></span></span></button><div style="height:1px;margin:4px 12px;background:var(--line-soft)"></div><div class="rw-rvlist"></div></div>
    </aside></div>`,
  desc:'Each saved version shows a live relative time and its author. Hover or focus a version and the preview swaps (old text out in 100ms, then the new text in) to show what restoring would change: added words in a success tint, removed words struck in danger. Selecting a row opens Restore in place, which swaps to an inline confirmation, then to Restoring. Last, the removed words collapse and the tints fade so the current draft becomes the restored text, and a new entry enters at the top.',
  api:'body.swap(diff(current, version))   row.ah.set(H[restore|confirm|busy])   m.set(1): del.w→0, ins.tint→0   entry.e.set(1)',
  init(st){
    const rv = $(st, '.rw-rv'), side = $(st, '.rw-rvs'), scroller = $(st, '.rw-rvc'), listEl = $(st, '.rw-rvlist'), curBtn = $(st, '.rw-rvcur'), curTm = $(curBtn, '.rw-tm'), cnt = $(st, '.rw-rvn'), rst = $(st, '.rw-rvr');
    const bodyPair = new Pair($$(st, '.rw-rvx')), lblPair = new Pair($$(st, '.rw-rvt > span')), layers = $$(st, '.rw-rvx');
    const { at, run, clear } = queue();
    const MAIN = 48;
    const SEED = [
      { who:'ben', label:'Autosave', age:2280, p:['You can request a refund within 14 days of purchase, no questions asked. Refunds return to the original payment method within 3 business days. Email support with your order number to start a request.', 'Digital downloads are not refundable once opened. Gift cards cannot be refunded.'] },
      { who:'maya', label:'Autosave', age:10800, p:['You can request a refund within 14 days of purchase, no questions asked. Refunds go back to the original payment method within 5 business days. Email support to start a request.', 'Digital downloads are not refundable once opened. Gift cards cannot be refunded.'] },
      { who:'theo', label:'Published', age:93600, p:['You can request a refund within 14 days of purchase. Refunds go back to the original payment method within 5 business days. Contact support to start a request.', 'Digital downloads are not refundable once opened.'] },
      { who:'priya', label:'Published', age:518400, p:['You can request a refund within 30 days of purchase. Refunds go back to the original payment method. Contact support to start a request.', 'Digital downloads are not refundable once opened.'] } ];
    const CUR0 = { who:'maya', age:240, p:['You can request a full refund within 14 days of purchase. Refunds return to your original payment method within 3 business days. Email support with your order number and we will start the request the same day.', 'Digital downloads are refundable only if the file is faulty. Gift cards cannot be refunded.'] };

    // word diff, current -> version: '+' is in the version only, '-' is in the current draft only
    const diffWords = (a, b) => {
      const m = a.length, n = b.length, L = Array.from({ length:m + 1 }, () => new Array(n + 1).fill(0));
      for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
      const out = []; let i = 0, j = 0;
      while (i < m || j < n){
        if (i < m && j < n && a[i] === b[j]){ out.push(['=', a[i]]); i++; j++; }
        else if (i < m && (j === n || L[i + 1][j] >= L[i][j + 1])){ out.push(['-', a[i]]); i++; }
        else { out.push(['+', b[j]]); j++; }
      }
      return out;
    };
    const IS = 'color:var(--success);background:var(--success-tint);border-radius:3px';
    const DS = 'display:inline-block;overflow:hidden;white-space:pre;vertical-align:bottom;color:var(--danger);background:var(--danger-tint);text-decoration:line-through;border-radius:3px';
    const para = h => `<p style="margin:0 0 10px">${h}</p>`;
    const clean = p => p.map(s => para(hx(s))).join('');
    const diffHTML = (a, b) => { let add = 0, del = 0;
      const html = b.map((s, i) => para(diffWords(a[i].split(' '), s.split(' ')).map(([k, w]) => k === '=' ? hx(w) + ' ' : k === '+' ? (add++, `<span data-k="i" style="${IS}">${hx(w)} </span>`) : (del++, `<span data-k="d" style="${DS}">${hx(w)} </span>`)).join(''))).join('');
      return { html, add, del }; };
    const FLASH = `<span style="display:inline-flex;gap:5px;align-items:center;color:var(--success)">${ic(I.check, 13, 2.4)}Version restored to draft</span>`;

    let rows = [], uid = 0, cur, curBorn, curRev, sel, hover, busy, flashUntil, applied, appliedLbl, lblApplied, pendKey, pendT, narrow = null, lastW = 0, ts = '';
    const m = new Track(0), cb = new Track(0);

    const H = (r, k) => r.l[k].offsetHeight;
    const collapse = r => { r.state = 0; r.act.inert = true; r.ah.set(0); r.m.setAttribute('aria-pressed', 'false'); };
    const deselect = () => { if (sel){ collapse(sel); sel = null; } };
    const selectRow = r => {
      if (busy) return;
      if (sel === r){ deselect(); return; }
      if (sel) collapse(sel);
      sel = r; r.state = 1; r.act.inert = false; r.ah.set(H(r, 0)); r.sw.to(0); r.m.setAttribute('aria-pressed', 'true');
    };
    const makeRow = d => {
      const w = WHO[d.who], el = mk('div', 'position:relative;overflow:hidden;padding:0 6px;height:0');
      el.innerHTML = `<div class="rw-in" style="margin:2px 0;border-radius:9px;overflow:hidden"><button type="button" class="rw-m" aria-pressed="false" style="display:flex;align-items:center;gap:10px;width:100%;height:${MAIN}px;padding:0 8px;border:0;background:transparent;text-align:left;cursor:pointer;color:var(--ink)">${avatar(w)}<span style="min-width:0"><span style="display:block;font-size:13px;font-weight:500;line-height:18px">${hx(d.label)}</span><span class="muted" style="display:block;font-size:12px;line-height:16px">${w.n} · <span class="rw-tm"></span></span></span></button>
        <div class="rw-a" style="position:relative;overflow:hidden;height:0"><div class="rw-l0" style="position:absolute;left:0;right:0;top:0;padding:0 8px 10px 42px"><button type="button" class="btn rw-go" style="width:100%">Restore this version</button></div>
        <div class="rw-l1" style="position:absolute;left:0;right:0;top:0;padding:0 8px 10px 42px"><p class="muted" style="margin:0 0 8px;font-size:12.5px;line-height:1.4">Replace the current draft with this version? This cannot be undone.</p><div class="row" style="gap:6px"><button type="button" class="btn rw-no" style="flex:1">Cancel</button><button type="button" class="btn ink rw-yes" style="flex:1">Restore</button></div></div>
        <div class="rw-l2" style="position:absolute;left:0;right:0;top:0;padding:0 8px 10px 42px"><button type="button" class="btn" disabled style="width:100%">Restoring…</button></div></div></div>`;
      const r = { id:++uid, d, p:d.p, born:d.born, el, in:$(el, '.rw-in'), m:$(el, '.rw-m'), tm:$(el, '.rw-tm'), act:$(el, '.rw-a'), l:[$(el, '.rw-l0'), $(el, '.rw-l1'), $(el, '.rw-l2')], go:$(el, '.rw-go'), no:$(el, '.rw-no'), yes:$(el, '.rw-yes'),
        e:new Track(0), ah:new Track(0), b:new Track(0), sw:new Swap(0), state:0, ts:'' };
      r.act.inert = true;
      r.m.onclick = () => selectRow(r);
      r.el.addEventListener('pointerenter', () => { if (!busy) hover = r; });
      r.el.addEventListener('pointerleave', () => { if (hover === r) hover = null; });
      r.m.addEventListener('focusin', () => { if (!busy) hover = r; });
      r.m.addEventListener('focusout', () => { if (hover === r) hover = null; });
      r.go.onclick = () => { if (busy) return; r.state = 2; r.ah.set(H(r, 1)); r.sw.to(1); at(EXIT + .03, () => r.yes.focus({ preventScroll:true })); };
      r.no.onclick = () => { if (busy) return; r.state = 1; r.ah.set(H(r, 0)); r.sw.to(0); at(EXIT + .03, () => r.go.focus({ preventScroll:true })); };
      r.yes.onclick = () => restore(r);
      return r;
    };
    const addRow = (d, atTop, inst) => {
      const r = makeRow(d); atTop ? listEl.insertBefore(r.el, listEl.firstChild) : listEl.appendChild(r.el); atTop ? rows.unshift(r) : rows.push(r);
      inst ? r.e.jump(1) : r.e.set(1, S.base); cnt.textContent = rows.length + (rows.length === 1 ? ' version' : ' versions'); return r;
    };

    const bodyHTML = want => want ? diffHTML(cur.p, want.p) : { html:clean(cur.p), add:0, del:0 };
    const keyOf = want => want ? want.id + '@' + curRev : 'cur';
    const applyBody = (want, key) => {
      applied = key; const d = bodyHTML(want);
      if (want){ flashUntil = 0; const w = WHO[want.d.who]; appliedLbl = d.add + d.del === 0 ? 'Same as the current draft' :
        `Previewing ${hx(want.d.label.toLowerCase())} · ${ago(now() - want.born)} · <span style="color:var(--success)">+${d.add}</span> <span style="color:var(--danger)">−${d.del}</span> words`; }
      else appliedLbl = 'Current draft';
      bodyPair.put(d.html);
    };

    const restore = r => {
      if (busy) return;
      busy = r; r.state = 3; r.ah.set(H(r, 2)); r.sw.to(2); hover = null;
      at(.45, () => { bodyPair.marks[bodyPair.sw.cur].del.forEach(x => x.w = x.e.offsetWidth); m.set(1, S.soft); });   // diff resolves into the clean text
      at(1.1, () => finish(r));
    };
    const finish = r => {
      cur = { who:'maya', p:r.p.slice() }; curRev++; curBorn = now();
      const L = bodyPair.sw.cur; bodyPair.els[L].innerHTML = clean(cur.p); bodyPair.marks[L] = { ins:[], del:[] }; m.jump(0);
      applied = 'cur'; appliedLbl = 'Current draft'; flashUntil = now() + 2.6;
      busy = null; collapse(r); sel = null;
      at(.12, () => { const n = addRow({ who:'maya', label:'Restored', p:cur.p.slice(), born:now() }, true, false); scroller.scrollTop = 0; at(.4, () => n.m.focus({ preventScroll:true })); });
    };

    const reset = () => {
      clear(); busy = null; sel = null; hover = null; rows.forEach(r => r.el.remove()); rows = []; uid = 0;
      cur = { who:CUR0.who, p:CUR0.p.slice() }; curBorn = now() - CUR0.age; curRev = 0; flashUntil = 0; m.jump(0); cb.jump(1);
      SEED.forEach(d => addRow({ who:d.who, label:d.label, p:d.p, born:now() - d.age }, false, true));
      applied = 'cur'; appliedLbl = 'Current draft'; lblApplied = 'cur'; pendKey = 'cur'; pendT = 0;
      bodyPair.init(clean(cur.p)); lblPair.init('Current draft'); scroller.scrollTop = 0;
    };
    rst.onclick = reset;
    curBtn.addEventListener('pointerenter', () => { if (!busy) hover = 'cur'; });
    curBtn.addEventListener('pointerleave', () => { if (hover === 'cur') hover = null; });
    curBtn.addEventListener('focusin', () => { if (!busy) hover = 'cur'; });
    curBtn.addEventListener('focusout', () => { if (hover === 'cur') hover = null; });
    curBtn.onclick = () => { if (!busy) deselect(); };
    st.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || busy || !sel) return; e.preventDefault(); const r = sel;
      if (r.state === 2) r.no.click(); else { deselect(); r.m.focus({ preventScroll:true }); }
    });

    const layout = () => {
      const n = st.clientWidth < 620; lastW = st.clientWidth; if (n === narrow) return; narrow = n;
      rv.style.flexDirection = n ? 'column' : 'row'; rv.style.inset = n ? '8px' : '12px'; rv.style.gap = n ? '8px' : '12px';
      side.style.width = n ? 'auto' : '262px'; side.style.height = n ? '40%' : 'auto';
      layers.forEach(l => { l.style.fontSize = n ? '12px' : '14.5px'; l.style.lineHeight = n ? '1.5' : '1.65'; l.style.padding = n ? '10px 14px' : '14px 18px'; l.style.overflow = n ? 'auto' : 'hidden'; });
    };
    layout(); reset();
    return t => {
      run(t);
      if (st.clientWidth !== lastW) layout();
      const want = busy ? busy : hover !== null ? (hover === 'cur' ? null : hover) : sel, key = keyOf(want);
      if (key !== pendKey){ pendKey = key; pendT = t; }
      if (key !== applied && t - pendT >= .05) applyBody(want, key);
      const lk = flashUntil > t ? 'flash' : applied;
      if (lk !== lblApplied){ lblApplied = lk; lblPair.put(lk === 'flash' ? FLASH : appliedLbl); }
      bodyPair.render(t); lblPair.render(t);
      const mm = clamp(m.at(t));
      if (mm > .0005){ const mk2 = bodyPair.marks[bodyPair.sw.cur];
        mk2.ins.forEach(s => { s.style.background = `color-mix(in oklab, var(--success-tint) ${((1 - mm) * 100).toFixed(1)}%, transparent)`; s.style.color = mix(1 - mm, 'var(--success)', 'var(--ink)'); });
        mk2.del.forEach(d => { d.e.style.width = px(d.w * (1 - mm)); d.e.style.opacity = (1 - mm).toFixed(3); }); }
      const tb = want === null ? 1 : 0; if (cb.target !== tb) cb.set(tb);
      curBtn.style.background = mix(clamp(cb.at(t)) * .7, 'var(--raised)', 'transparent');
      const cs = ago(t - curBorn); if (cs !== ts){ ts = cs; curTm.textContent = cs; }
      for (const r of rows){
        const e = clamp(r.e.at(t)), ah = Math.max(0, r.ah.at(t)), tg = want === r ? 1 : 0; if (r.b.target !== tg) r.b.set(tg);
        r.el.style.height = px(e * (MAIN + ah + 4)); fade(r.el, e, (1 - e) * -8, false);
        r.in.style.background = mix(clamp(r.b.at(t)) * .7, 'var(--raised)', 'transparent');
        if (r === sel && Math.abs(ah - r.ah.target) > .5){ const bot = r.el.offsetTop + e * (MAIN + ah + 4); if (bot > scroller.scrollTop + scroller.clientHeight) scroller.scrollTop = bot - scroller.clientHeight; }   // keep the opening row in view
        r.act.style.height = px(ah); for (let k = 0; k < 3; k++) r.sw.apply(r.l[k], k, t, 3);
        const s = ago(t - r.born); if (s !== r.ts){ r.ts = s; r.tm.textContent = s; }
      }
    };
  }});

/* ================================================================ 2. Annotation review canvas */
const MOCK = `<svg viewBox="0 0 480 300" width="100%" height="100%" preserveAspectRatio="none" style="display:block" aria-hidden="true"><rect width="480" height="300" fill="var(--card)"/><rect width="480" height="36" fill="var(--tile)"/><path d="M0 36.5H480" stroke="var(--line)"/><rect x="20" y="13" width="46" height="10" rx="5" fill="var(--ink)"/><rect x="300" y="14" width="30" height="8" rx="4" fill="var(--faint)"/><rect x="344" y="14" width="30" height="8" rx="4" fill="var(--faint)"/><rect x="388" y="14" width="22" height="8" rx="4" fill="var(--faint)"/><rect x="420" y="9" width="44" height="18" rx="9" fill="var(--accent)"/><rect x="28" y="72" width="214" height="16" rx="8" fill="var(--ink)"/><rect x="28" y="96" width="176" height="16" rx="8" fill="var(--ink)"/><rect x="28" y="120" width="112" height="16" rx="8" fill="var(--ink)"/><rect x="28" y="150" width="200" height="7" rx="3.5" fill="var(--faint)"/><rect x="28" y="164" width="170" height="7" rx="3.5" fill="var(--faint)"/><rect x="28" y="182" width="96" height="26" rx="13" fill="var(--accent)"/><rect x="134" y="182.75" width="74" height="24.5" rx="12.25" fill="none" stroke="var(--faint)" stroke-width="1.5"/><rect x="272" y="62" width="184" height="150" rx="12" fill="var(--raised)"/><circle cx="418" cy="100" r="16" fill="var(--accent)"/><path d="M272 200 L330 130 L370 168 L408 140 L456 196 L456 200 A12 12 0 0 1 444 212 L284 212 A12 12 0 0 1 272 200Z" fill="var(--ink)"/><rect x="28" y="236" width="128" height="48" rx="8" fill="var(--tile)" stroke="var(--line)"/><rect x="176" y="236" width="128" height="48" rx="8" fill="var(--tile)" stroke="var(--line)"/><rect x="324" y="236" width="128" height="48" rx="8" fill="var(--tile)" stroke="var(--line)"/><rect x="40" y="249" width="52" height="7" rx="3.5" fill="var(--ink)"/><rect x="40" y="264" width="84" height="6" rx="3" fill="var(--faint)"/><rect x="188" y="249" width="52" height="7" rx="3.5" fill="var(--ink)"/><rect x="188" y="264" width="84" height="6" rx="3" fill="var(--faint)"/><rect x="336" y="249" width="52" height="7" rx="3.5" fill="var(--ink)"/><rect x="336" y="264" width="84" height="6" rx="3" fill="var(--faint)"/></svg>`;
const TA = 'display:block;width:100%;resize:none;margin-top:8px;border:1.5px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);font:13px/1.45 var(--sans);padding:7px 10px;outline:none';
const XB = `<button type="button" class="rw-xb" aria-label="Close comment" style="flex:none;border:0;background:none;color:var(--muted);padding:3px;border-radius:7px;cursor:pointer;display:grid;place-items:center">${ic(I.x, 14)}</button>`;
const threadHead = `<div class="row" style="align-items:flex-start;gap:8px"><span class="rw-av"></span><div style="flex:1;min-width:0"><b class="small rw-au" style="display:block;line-height:18px"></b><span class="muted" style="font-size:12px">Image point <span class="rw-no"></span></span></div>${XB}</div><p class="rw-tt" style="margin:8px 0 0;font-size:13px;line-height:1.45;overflow-wrap:anywhere"></p>`;
const LY = 'position:absolute;left:0;top:0;width:100%;padding:12px';

atom({ id:'annotate', cat:'Workflow', name:'Annotation review canvas', block:'ReviewCanvas, AnnotationCanvas (review image pins)', fam:['D','M','X','E'], wide:true, tall:true,
  html:`<div class="rw-an" style="position:absolute;inset:12px;display:flex;gap:12px">
    <section class="card" aria-label="Design preview" style="flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden">
      <header class="row" style="flex:none;height:40px;padding:0 10px 0 14px;border-bottom:1px solid var(--line-soft);gap:8px"><b class="small" style="white-space:nowrap">Spring launch, version 2</b><span style="flex:1"></span><button type="button" class="btn rw-ada" style="padding:3px 10px;font-size:12px">Add pin</button><button type="button" class="btn rw-anr" style="padding:3px 10px;font-size:12px">Reset</button></header>
      <div class="rw-cv" style="position:relative;flex:1;min-height:0;background:var(--raised);overflow:hidden">
        <div class="rw-im" style="position:absolute;left:0;top:0;width:0;height:0;cursor:crosshair"><div role="img" aria-label="Spring launch landing page design. Click to drop a pin." style="position:absolute;inset:0;border-radius:6px;overflow:hidden;box-shadow:var(--shadow)">${MOCK}</div><div class="rw-pl" style="position:absolute;inset:0"></div></div>
        <div class="rw-ck" role="dialog" aria-label="Comment" style="position:absolute;left:0;top:0;width:24px;height:24px;visibility:hidden;overflow:hidden;box-shadow:var(--shadow);z-index:30"><div class="rw-cc" style="position:absolute;left:0;top:0;width:232px">
          <div class="rw-ly" style="${LY}"><div class="row" style="justify-content:space-between"><b class="small rw-ttl"></b>${XB}</div><textarea class="rw-tx" rows="2" aria-label="Comment" placeholder="What should change here?" style="${TA}"></textarea><div class="row" style="margin-top:8px;gap:8px"><label class="row small" style="gap:6px;cursor:pointer"><input type="checkbox" class="rw-bk" style="accent-color:var(--accent);margin:0">Blocking</label><span style="flex:1"></span><button type="button" class="btn rw-cn" style="padding:4px 9px;font-size:12.5px">Cancel</button><button type="button" class="btn ink rw-sb" style="padding:4px 9px;font-size:12.5px">Comment</button></div></div>
          <div class="rw-ly" style="${LY}">${threadHead}<div class="row" style="margin-top:10px;gap:8px"><span class="rw-bl row" style="gap:5px;font-size:12.5px;font-weight:500;color:var(--danger)">${ic(I.alert, 13)}Blocking</span><span style="flex:1"></span><button type="button" class="btn ink rw-rs" style="padding:4px 10px;font-size:12.5px">Resolve</button></div></div>
          <div class="rw-ly" style="${LY}">${threadHead}<div class="row" style="margin-top:10px;gap:8px"><span class="row" style="gap:5px;font-size:12.5px;font-weight:500;color:var(--success)">${ic(I.check, 13, 2.4)}Resolved</span><span style="flex:1"></span><button type="button" class="btn rw-rp" style="padding:4px 10px;font-size:12.5px">Reopen</button></div></div>
        </div></div>
      </div></section>
    <aside class="card rw-ans" aria-label="Comments" style="flex:none;width:250px;display:flex;flex-direction:column;overflow:hidden"><header style="flex:none;display:flex;align-items:center;gap:8px;height:40px;padding:0 14px;border-bottom:1px solid var(--line-soft)"><b class="small">Comments</b><span class="rw-anc small muted num" style="flex:1;text-align:right"></span></header>
      <div style="position:relative;flex:1;min-height:0;overflow:auto"><div class="rw-anl" style="position:relative;padding:4px 0"><div class="rw-anp" style="position:absolute;left:6px;right:6px;top:0;height:0;border-radius:9px;background:var(--raised);opacity:0"></div></div><p class="rw-ane small muted" style="position:absolute;left:14px;right:14px;top:14px;margin:0">No comments yet. Click the design to drop a pin.</p></div></aside></div>`,
  desc:'Click the design: a dot marks the spot, the pin falls onto it, and only then does a comment card grow out of the pin. Pins follow the pointer 1:1 when dragged and settle from release velocity, and the card travels with the pin it belongs to. Resolving collapses the card into its pin as the pin turns to a success check. The side list shares selection: its highlight plate moves between rows with the leading edge first.',
  api:'pin.fy.set(0) after fy=−28   card.o.set(1): rect lerp(pin 24×24 → card)   pin.rs.set(1) + card.o.set(0) on resolve   plate.go(top, bottom)',
  init(st){
    const root = $(st, '.rw-an'), cv = $(st, '.rw-cv'), im = $(st, '.rw-im'), pl = $(st, '.rw-pl'), card = $(st, '.rw-ck'), cc = $(st, '.rw-cc'), side = $(st, '.rw-ans'), ls = $(st, '.rw-anl'), plateEl = $(st, '.rw-anp'), cntEl = $(st, '.rw-anc'), empty = $(st, '.rw-ane'), addBtn = $(st, '.rw-ada'), rstBtn = $(st, '.rw-anr');
    const L = $$(cc, '.rw-ly'), ta = $(L[0], '.rw-tx'), bk = $(L[0], '.rw-bk'), sub = $(L[0], '.rw-sb'), { at, run, clear } = queue();
    const ROW = 52;
    let pins = [], ghosts = [], sel = null, draft = null, held = null, hx = 0, hy = 0, rawx = 0, rawy = 0, moved = false, cardPin = null;
    let ix = 0, iy = 0, iw = 0, ih = 0, aw = 0, ah = 0, CW = 232, narrow = null, lastKey = '';
    const co = new Track(0), ch = new Track(150), oxT = new Track(0), oyT = new Track(0), pe = edges(0, 0), po = new Track(0), csw = new Swap(0), tf = new Track(0), sbT = new Track(0, S.snap);
    const no = p => pins.indexOf(p) + 1;
    const rbc = (v, max) => v < 0 ? rb(v, 24) : v > max ? max + rb(v - max, 24) : v;

    const layout = () => {
      const n = st.clientWidth < 620;
      if (n !== narrow){ narrow = n; root.style.flexDirection = n ? 'column' : 'row'; root.style.inset = n ? '8px' : '12px'; root.style.gap = n ? '8px' : '12px'; side.style.width = n ? 'auto' : '250px'; side.style.height = n ? '36%' : 'auto'; }
      aw = cv.clientWidth; ah = cv.clientHeight; if (!aw || !ah) return;
      iw = Math.max(40, Math.min(aw - 20, (ah - 20) * 1.6)); ih = iw / 1.6; ix = (aw - iw) / 2; iy = (ah - ih) / 2;
      Object.assign(im.style, { left:px(ix), top:px(iy), width:px(iw), height:px(ih) });
      CW = Math.round(clamp(aw - 16, 190, 236)); cc.style.width = px(CW);
      pins.forEach(p => { if (p !== held){ p.x.jump(p.nx * iw); p.y.jump(p.ny * ih); } });
      lastKey = st.clientWidth + ':' + aw + ':' + ah;
    };
    const placeCard = (p, inst) => {
      const cx = ix + p.nx * iw, cy = iy + p.ny * ih, w = CW, h = ch.target || 150; let ox, oy;
      if (aw - cx - 18 >= w + 8){ ox = 18; oy = -22; } else if (cx - 18 >= w + 8){ ox = -18 - w; oy = -22; }
      else if (ah - cy - 18 >= h + 8){ ox = -w / 2; oy = 18; } else { ox = -w / 2; oy = -18 - h; }
      const k = inst ? 'jump' : 'set'; oxT[k](ox); oyT[k](oy);
    };
    const syncAria = () => { pins.forEach(p => { p.btn.setAttribute('aria-pressed', p === sel); if (p.row) p.row.btn.setAttribute('aria-pressed', p === sel); }); };
    const plateTo = p => {
      if (!p || !p.row){ po.set(0, S.snap); return; }
      const i = pins.indexOf(p), a = 4 + i * ROW, b = a + ROW - 2;
      if (po.target === 0 && po.at(now()) < .05) pe.jump(a, b); else pe.go(a, b); po.set(1);
    };
    const refresh = () => {
      const o = pins.filter(p => p.state === 'open').length, d = pins.filter(p => p.state === 'done').length;
      cntEl.textContent = o + d ? `${o} open · ${d} resolved` : ''; empty.style.visibility = pins.some(p => p.row) ? 'hidden' : 'visible';
    };
    const fillThread = (ly, p) => { $(ly, '.rw-av').innerHTML = avatar(WHO[p.who]); $(ly, '.rw-au').textContent = WHO[p.who].n; $(ly, '.rw-no').textContent = no(p); $(ly, '.rw-tt').textContent = p.text;
      const bl = $(ly, '.rw-bl'); if (bl) bl.style.display = p.block ? '' : 'none'; };
    const syncSub = () => { const ok = !!ta.value.trim(); sub.disabled = !ok; sbT.set(ok ? 1 : 0); };

    const addRow = (p, inst) => {
      const w = WHO[p.who], el = mk('div', 'position:relative;z-index:1');
      el.innerHTML = `<button type="button" aria-pressed="false" style="display:flex;align-items:center;gap:10px;width:calc(100% - 12px);height:${ROW - 2}px;margin:0 6px 2px;padding:0 10px;border:0;border-radius:9px;background:none;text-align:left;cursor:pointer;color:var(--ink)"><span class="rw-bd" style="position:relative;flex:none;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--ink);font-size:11px;font-weight:600"><span class="rw-n" style="position:absolute;inset:0;display:grid;place-items:center"></span><span class="rw-c" style="position:absolute;inset:0;display:grid;place-items:center">${ic(I.check, 12, 2.6)}</span></span><span style="min-width:0;flex:1"><span class="row" style="gap:6px;font-size:12px;line-height:16px;color:var(--muted)"><span>${w.n}</span><span style="position:relative;flex:1;height:16px"><span class="rw-s0" style="position:absolute;left:0;top:0;white-space:nowrap;${p.block ? 'color:var(--danger)' : ''}">${p.block ? 'Blocking' : 'Open'}</span><span class="rw-s1" style="position:absolute;left:0;top:0;white-space:nowrap;color:var(--success)">Resolved</span></span></span><span class="rw-tl" style="display:block;font-size:13px;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></span></span></button>`;
      $(el, '.rw-tl').textContent = p.text; ls.appendChild(el);
      const r = { el, btn:$(el, 'button'), bd:$(el, '.rw-bd'), n:$(el, '.rw-n'), c:$(el, '.rw-c'), tl:$(el, '.rw-tl'), s0:$(el, '.rw-s0'), s1:$(el, '.rw-s1'), sw:new Swap(p.state === 'done' ? 1 : 0), e:new Track(0) };
      r.n.textContent = no(p); r.btn.onclick = () => select(p); inst ? r.e.jump(1) : r.e.set(1, S.base); p.row = r;
    };
    const makePin = d => {
      const wrap = mk('div', 'position:absolute;left:0;top:0;width:0;height:0'); wrap.className = 'rw-pw';
      wrap.innerHTML = `<i class="rw-dt" style="position:absolute;left:-3px;top:-3px;width:6px;height:6px;border-radius:50%;background:var(--ink);pointer-events:none;opacity:0"></i><button type="button" class="rw-pb" style="position:absolute;left:-12px;top:-12px;width:24px;height:24px;padding:0;border-radius:50%;border:1.5px solid var(--ink);cursor:grab;touch-action:none;font-size:11.5px;font-weight:600"><span class="rw-n" style="position:absolute;inset:0;display:grid;place-items:center"></span><span class="rw-c" style="position:absolute;inset:0;display:grid;place-items:center">${ic(I.check, 13, 2.5)}</span></button>`;
      pl.appendChild(wrap);
      const p = Object.assign({ wrap, btn:$(wrap, '.rw-pb'), dt:$(wrap, '.rw-dt'), n:$(wrap, '.rw-n'), c:$(wrap, '.rw-c'), x:new Track(0), y:new Track(0), fy:new Track(0), fo:new Track(1), rs:new Track(0), sel:new Track(0, S.snap), lift:new Track(0, S.snap), row:null }, d);
      p.rs.jump(d.state === 'done' ? 1 : 0);
      let ox = 0, oy = 0, sx = 0, sy = 0;
      drag(p.btn, {
        down:(q, e) => { const rc = pl.getBoundingClientRect(), t = now(); hx = p.x.at(t); hy = p.y.at(t); rawx = hx; rawy = hy; ox = hx - (q.cx - rc.left); oy = hy - (q.cy - rc.top); sx = q.cx; sy = q.cy; held = p; moved = false; },
        move:q => { const rc = pl.getBoundingClientRect(); rawx = q.cx - rc.left + ox; rawy = q.cy - rc.top + oy; hx = rbc(rawx, iw); hy = rbc(rawy, ih);
          if (!moved && Math.hypot(q.cx - sx, q.cy - sy) >= 4){ moved = true; p.lift.set(1); } },
        up:(q, v) => { held = null; if (!moved){ select(p); return; }
          p.lift.set(0); p.nx = clamp(hx / iw); p.ny = clamp(hy / ih);
          p.x.release(hx, clamp(v.vx, -1400, 1400), p.nx * iw); p.y.release(hy, clamp(v.vy, -1400, 1400), p.ny * ih); if (cardPin === p) placeCard(p); }
      });
      p.btn.onclick = e => { if (e.detail === 0) select(p); };
      p.btn.onkeydown = e => { const k = { ArrowLeft:[-1, 0], ArrowRight:[1, 0], ArrowUp:[0, -1], ArrowDown:[0, 1] }[e.key]; if (!k) return; e.preventDefault();
        const s = e.shiftKey ? .05 : .015; p.nx = clamp(p.nx + k[0] * s); p.ny = clamp(p.ny + k[1] * s); p.x.set(p.nx * iw); p.y.set(p.ny * ih); if (cardPin === p) placeCard(p); };
      return p;
    };

    function open(p){
      cardPin = p; const k = p.state === 'draft' ? 0 : p.state === 'open' ? 1 : 2;
      if (k === 0){ $(L[0], '.rw-ttl').textContent = 'Image point ' + no(p); ta.value = ''; bk.checked = false; sbT.jump(0); sub.disabled = true; } else fillThread(L[k], p);
      csw.cur = k; csw.prev = null; csw.t = -9; ch.jump(L[k].offsetHeight); placeCard(p, true); co.set(1, S.base);
      card.setAttribute('aria-label', 'Comment on image point ' + no(p));
      if (k === 0) at(.18, () => { if (sel === p) ta.focus({ preventScroll:true }); });
    }
    function select(p, delay = 0){
      if (p === sel){ close(true); return; }
      const wasOpen = co.target === 1; sel = p; plateTo(p); syncAria(); if (wasOpen) co.set(0, S.snap);
      at((wasOpen ? EXIT + .02 : 0) + delay, () => { if (sel === p) open(p); });
    }
    function close(focus){
      if (!sel) return; const p = sel;
      if (p.state === 'draft'){ discard(p); return; }
      sel = null; plateTo(null); co.set(0, S.base); syncAria();
      if (focus) at(.06, () => p.btn.isConnected && p.btn.focus({ preventScroll:true }));
    }
    function discard(p){
      if (draft === p) draft = null; const i = pins.indexOf(p); if (i >= 0) pins.splice(i, 1); ghosts.push(p);
      const wasSel = sel === p; if (wasSel){ sel = null; plateTo(null); co.set(0, S.snap); }
      p.fo.set(0, S.snap, now() + (wasSel ? EXIT : 0)); syncAria(); refresh();
      at(.45, () => { p.wrap.remove(); ghosts = ghosts.filter(g => g !== p); });
    }
    function drop(nx, ny){
      if (draft) discard(draft);
      const p = makePin({ nx, ny, state:'draft', who:'me', text:'', block:false }); pins.push(p); draft = p;
      p.x.jump(nx * iw); p.y.jump(ny * ih); p.fo.jump(0); p.fo.set(1, S.snap); p.fy.jump(-28); p.fy.set(0, S.base);
      select(p, .16);
    }
    function submit(){
      const p = draft; if (!p || !ta.value.trim()) return;
      p.text = ta.value.trim(); p.block = bk.checked; p.state = 'open'; draft = null; addRow(p, false); refresh();
      fillThread(L[1], p); csw.to(1); ch.set(L[1].offsetHeight); plateTo(p); syncAria();
      at(EXIT + .03, () => { if (sel === p) $(L[1], '.rw-rs').focus({ preventScroll:true }); });
    }
    function resolve(p){
      p.state = 'done'; p.rs.set(1); p.row.sw.to(1); sel = null; plateTo(null); co.set(0, S.base); refresh(); syncAria();
      at(.3, () => p.btn.focus({ preventScroll:true }));
    }
    function reopen(p){
      p.state = 'open'; p.rs.set(0); p.row.sw.to(0); fillThread(L[1], p); csw.to(1); ch.set(L[1].offsetHeight); refresh();
      at(EXIT + .03, () => { if (sel === p) $(L[1], '.rw-rs').focus({ preventScroll:true }); });
    }
    const seed = () => {
      [{ nx:.27, ny:.33, state:'open', who:'priya', text:'The headline wraps to three lines on tablet. Can we cut it to two?', block:true },
       { nx:.16, ny:.64, state:'done', who:'theo', text:'Change this button to Start free to match the pricing page.', block:false }].forEach(d => { const p = makePin(d); pins.push(p); p.x.jump(d.nx * iw); p.y.jump(d.ny * ih); p.fo.jump(1); p.fy.jump(0); addRow(p, true); });
      refresh(); syncAria();
    };
    const reset = () => {
      clear(); pins.concat(ghosts).forEach(p => p.wrap.remove()); pins = []; ghosts = []; ls.querySelectorAll(':scope > div:not(.rw-anp)').forEach(e => e.remove());
      sel = null; draft = null; held = null; cardPin = null; co.jump(0); po.jump(0); csw.cur = 0; csw.prev = null; csw.t = -9; layout(); seed();
    };
    $$(card, '.rw-xb').forEach(b => b.onclick = () => close(true));
    $(L[0], '.rw-cn').onclick = () => close(true);
    sub.onclick = submit;
    $(L[1], '.rw-rs').onclick = () => resolve(sel);
    $(L[2], '.rw-rp').onclick = () => reopen(sel);
    ta.oninput = syncSub; ta.onfocus = () => tf.set(1); ta.onblur = () => tf.set(0);
    ta.onkeydown = e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)){ e.preventDefault(); submit(); } };
    im.addEventListener('click', e => { if (e.target.closest('.rw-pw')) return; const rc = im.getBoundingClientRect(); drop(clamp((e.clientX - rc.left) / rc.width), clamp((e.clientY - rc.top) / rc.height)); });
    addBtn.onclick = () => drop(.5 + ((pins.length % 4) - 1.5) * .12, .5 + ((pins.length % 3) - 1) * .14);
    rstBtn.onclick = reset;
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && sel){ e.preventDefault(); close(true); } });
    layout(); reset();

    const drawPin = (p, t) => {
      const rs = clamp(p.rs.at(t)), fo = clamp(p.fo.at(t)), fy = p.fy.at(t), lf = clamp(p.lift.at(t)), tg = sel === p ? 1 : 0; if (p.sel.target !== tg) p.sel.set(tg);
      const isH = held === p, x = isH ? hx : p.x.at(t), y = isH ? hy : p.y.at(t), s = clamp(p.sel.at(t));
      p.wrap.style.transform = `translate(${px(x)},${px(y)})`; p.wrap.style.zIndex = isH || sel === p ? 3 : 1; p.wrap.style.pointerEvents = 'none';
      const b = p.btn.style; b.pointerEvents = fo > .5 ? 'auto' : 'none'; b.opacity = fo.toFixed(3); b.transform = `translateY(${px(fy - 4 * lf)}) scale(${(.8 + .2 * fo + .08 * lf).toFixed(3)})`;
      b.background = mix(rs, 'var(--success-tint)', 'var(--ink)'); b.color = mix(rs, 'var(--success)', 'var(--card)'); b.borderColor = mix(rs, 'var(--success)', 'var(--ink)');
      b.boxShadow = `0 0 0 2px ${mix(s, 'var(--card)', 'transparent')}, 0 0 0 4px ${mix(s, 'var(--accent)', 'transparent')}, var(--shadow)`;
      const lb = 'Image point ' + (pins.includes(p) ? no(p) : p._no) + (p.state === 'done' ? ', resolved' : '');
      if (lb !== p._lb){ p._lb = lb; p._no = pins.includes(p) ? no(p) : p._no; p.n.textContent = p._no; p.btn.setAttribute('aria-label', lb); }
      p.n.style.opacity = clamp(1 - rs * 2).toFixed(3); p.c.style.opacity = clamp(rs * 2 - 1).toFixed(3); p.dt.style.opacity = clamp(-fy / 28).toFixed(3);
    };
    return t => {
      run(t);
      if (st.clientWidth + ':' + cv.clientWidth + ':' + cv.clientHeight !== lastKey) layout();
      for (const p of pins) drawPin(p, t); for (const p of ghosts) drawPin(p, t);
      // comment card: one rect that morphs between its pin and the open card
      const o = clamp(co.at(t)), cp = cardPin;
      if (cp && o > .002){
        const t0 = held === cp, x0 = t0 ? hx : cp.x.at(t), y0 = t0 ? hy : cp.y.at(t), chh = ch.at(t), w = lerp(24, CW, o), h = lerp(24, chh, o);
        const tx = clamp(ix + x0 + oxT.at(t), 8, Math.max(8, aw - CW - 8)), ty = clamp(iy + y0 + oyT.at(t), 8, Math.max(8, ah - chh - 8));
        const fill = mix(clamp(cp.rs.at(t)), 'var(--success-tint)', 'var(--ink)'), cs = card.style;
        cs.visibility = 'visible'; cs.transform = `translate(${px(lerp(ix + x0 - 12, tx, o))},${px(lerp(iy + y0 - 12, ty, o))})`; cs.width = px(w); cs.height = px(h); cs.borderRadius = px(lerp(12, 14, o));
        cs.background = mix(clamp(o * 1.5), 'var(--card)', fill); cs.pointerEvents = o > .5 ? 'auto' : 'none';
        const cin = clamp((o - .5) * 2); fade(cc, cin, (1 - cin) * 3);
        for (let k = 0; k < 3; k++) csw.apply(L[k], k, t, 3);
        ta.style.borderColor = mix(clamp(tf.at(t)), 'var(--accent)', 'var(--line)'); sub.style.opacity = (.45 + .55 * clamp(sbT.at(t))).toFixed(3);
      } else card.style.visibility = 'hidden';
      plate(plateEl, pe.A.at(t), pe.B.at(t)); plateEl.style.opacity = clamp(po.at(t)).toFixed(3);
      for (const p of pins){ const r = p.row; if (!r) continue; const e = clamp(r.e.at(t)), rs = clamp(p.rs.at(t));
        fade(r.el, e, (1 - e) * 6, false); r.bd.style.background = mix(rs, 'var(--success-tint)', 'var(--ink)'); r.bd.style.color = mix(rs, 'var(--success)', 'var(--card)'); r.bd.style.borderColor = mix(rs, 'var(--success)', 'var(--ink)');
        r.n.style.opacity = clamp(1 - rs * 2).toFixed(3); r.c.style.opacity = clamp(rs * 2 - 1).toFixed(3); r.tl.style.color = mix(rs, 'var(--muted)', 'var(--ink)');
        r.sw.apply(r.s0, 0, t, 3); r.sw.apply(r.s1, 1, t, 3); }
    };
  }});

/* ================================================================ 3. Auth shell */
const INP = 'display:block;width:100%;height:36px;border:1.5px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);font:15px var(--sans);padding:0 11px;outline:none';
const field = (id, label, type, ph) => `<div><label for="${id}" class="small" style="display:block;font-weight:500;line-height:16px;margin-bottom:3px">${label}</label><input id="${id}" type="${type}" placeholder="${ph}" autocomplete="off" style="${INP}"></div>`;
const pane = (n, inner) => `<form class="rw-pn" data-p="${n}" novalidate style="position:absolute;left:0;right:0;top:0;padding:14px 16px 12px">${inner}</form>`;
const H2 = t => `<h2 style="margin:0 0 10px;font-size:20px;line-height:24px;letter-spacing:-.02em;font-weight:600">${t}</h2>`;
const ERR = '<div class="rw-er" style="overflow:hidden;height:0"><p class="rw-em" role="alert" style="margin:0;padding-top:8px;font-size:13px;line-height:16px;color:var(--danger)"></p></div>';
const PBTN = (a, b) => `<button type="submit" class="btn ink rw-sub" style="position:relative;display:block;width:100%;height:36px;margin-top:10px;padding:0"><span class="rw-b0" style="position:absolute;inset:0;display:grid;place-items:center">${a}</span><span class="rw-b1" style="position:absolute;inset:0;display:grid;place-items:center">${b}</span></button>`;
const LINK = (label, cls) => `<button type="button" class="rw-lk ${cls}" style="display:block;margin:4px auto 0;background:none;border:0;padding:4px 8px;font-size:13px;color:var(--muted);text-decoration:underline;text-underline-offset:3px;cursor:pointer">${label}</button>`;
const NOTE = body => `<div style="display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:10px;background:var(--success-tint);color:var(--success);font-size:13px;line-height:1.45"><span style="flex:none;margin-top:1px">${ic(I.check, 15, 2.4)}</span><span>${body}</span></div>`;
const OTP = [0, 1, 2, 3, 4, 5].map(i => `<input id="authshell-code-${i + 1}" inputmode="numeric" maxlength="1" ${i ? 'autocomplete="off"' : 'autocomplete="one-time-code"'} aria-label="Digit ${i + 1} of 6" style="${INP};height:44px;padding:0;text-align:center;font:600 20px var(--mono)">`).join('');

atom({ id:'authshell', cat:'Workflow', name:'Auth shell', block:'AuthShell, AuthForm, AuthStack (sign in, reset, two-factor)', fam:['S','M'], wide:true, tall:true,
  html:`<div class="rw-as card" role="region" aria-label="Admin access" style="position:relative;width:min(380px,92%);overflow:hidden">
    <div class="row" style="height:36px;padding:0 16px;justify-content:space-between;border-bottom:1px solid var(--line-soft)"><span class="small muted row" style="gap:6px">${ic(LOCK, 13)}Admin access</span><button type="button" class="rw-so" style="background:none;border:0;padding:4px 0;font-size:12.5px;color:var(--muted);text-decoration:underline;text-underline-offset:3px;cursor:pointer;visibility:hidden">Start over</button></div>
    <div class="rw-ab" style="position:relative;overflow:hidden">
      ${pane('signin', `${H2('Sign in')}${field('authshell-email', 'Email', 'email', 'you@example.com')}<div style="height:8px"></div>${field('authshell-password', 'Password', 'password', 'Demo only, 8+ characters')}${ERR}${PBTN('Enter', 'Checking…')}${LINK('Forgot password?', 'rw-to-forgot')}`)}
      ${pane('forgot', `${H2('Reset password')}${field('authshell-reset-email', 'Email', 'email', 'you@example.com')}${ERR}${PBTN('Send reset link', 'Sending…')}${LINK('Back to sign in', 'rw-to-signin')}`)}
      ${pane('sent', `${H2('Check your email')}${NOTE('If an account exists for <b class="rw-em2" style="overflow-wrap:anywhere"></b>, a reset link is on its way.')}${LINK('Back to sign in', 'rw-to-signin')}`)}
      ${pane('code', `${H2('Two-factor authentication')}<p class="small muted" style="margin:0 0 10px;line-height:1.4">Enter the 6-digit code from your authenticator app. <span style="white-space:nowrap">Demo code: 123456.</span></p><div class="rw-otp" role="group" aria-label="6-digit code" style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px">${OTP}</div>${ERR}${PBTN('Verify and sign in', 'Verifying…')}${LINK('Back to sign in', 'rw-to-signin')}`)}
      ${pane('done', `${H2('Signed in')}${NOTE('Demo complete. A real shell would open the admin dashboard here.')}${LINK('Start over', 'rw-to-signin')}`)}
    </div></div>`,
  desc:'One card holds every pane, so the frame never changes. Going to Forgot password or Enter code, the old pane slides out 18px and fades (100ms), then the next pane arrives from the direction of travel. The card’s height springs to the new pane on the same tick, so it never jumps. An error opens a danger line inside the card and adds its height to the same spring. The primary button swaps its label while it works. Everything here is demo text and nothing is sent.',
  api:'pane.swap(next, dir)   card.h.set(measure(next))   error.set(1): h += e·errH   btn.label.to(working)',
  init(st){
    const ab = $(st, '.rw-ab'), so = $(st, '.rw-so'), { at, run, clear } = queue();
    const NAMES = ['signin', 'forgot', 'sent', 'code', 'done'], EMAIL = /^\S+@\S+\.\S+$/;
    const P = NAMES.map(n => { const f = $(ab, `[data-p="${n}"]`), ins = $$(f, 'input'); ins.forEach(i => { i._tf = new Track(0); i._fl = null; i._iv = new Track(0); });
      return { n, f, er:new Track(0), erEl:$(f, '.rw-er'), em:$(f, '.rw-em'), sub:$(f, '.rw-sub'), b0:$(f, '.rw-b0'), b1:$(f, '.rw-b1'), bsw:new Swap(0), ins, eh:0, base:0, pend:false }; });
    const boxes = P[3].ins; boxes.forEach(b => b._fl = new Track(0));
    const sw = new DSwap(0), h = new Track(0), sv = new Track(0, S.snap); let cur = 0, w0 = 0, sent = '';
    const meas = k => { const p = P[k]; p.base = p.f.offsetHeight - (p.erEl ? p.erEl.offsetHeight : 0); return p.base; };
    const measAll = () => { P.forEach((p, i) => meas(i)); h.jump(P[cur].base); w0 = st.clientWidth; };
    const first = k => ({ 0:P[0].ins[0], 1:P[1].ins[0], 2:$(P[2].f, '.rw-lk'), 3:boxes[0], 4:$(P[4].f, '.rw-lk') })[k];
    const hideErr = p => { if (p.er.target){ p.er.set(0); p.ins.forEach(i => i._iv.set(0)); } };
    const showErr = (p, msg, el, all) => { p.em.textContent = msg; p.eh = p.em.offsetHeight; p.er.set(1); (all ? p.ins : [el]).forEach(i => i && i._iv.set(1)); if (el) el.focus({ preventScroll:true }); };
    const release = (p, inst) => { if (!p.sub) return; p.pend = false; p.sub.disabled = false; if (inst){ p.bsw.cur = 0; p.bsw.prev = null; p.bsw.t = -9; } else p.bsw.to(0); };
    const work = (p, fn) => { p.pend = true; p.sub.disabled = true; hideErr(p); p.bsw.to(1);
      at(.6, () => { if (fn() === false) release(p); else at(EXIT + .4, () => release(p, true)); }); };
    const go = (k, dir, focus = true) => {
      if (k === cur) return; hideErr(P[cur]); cur = k; sw.to(k, dir); meas(k); h.set(P[k].base); sv.set(k ? 1 : 0);
      if (focus) at(EXIT + .03, () => { const e = first(k); e && e.focus({ preventScroll:true }); });
    };
    const clearAll = () => { P.forEach(p => { p.ins.forEach(i => { i.value = ''; if (i._fl) i._fl.jump(0); }); p.er.jump(0); p.ins.forEach(i => i._iv.jump(0)); p.eh = 0; if (p.erEl){ p.em.textContent = ''; p.erEl.style.height = '0px'; } release(p, true); }); sent = ''; };
    const reset = () => { clear(); clearAll(); cur = 0; sw.cur = 0; sw.prev = null; sw.t = -9; sv.jump(0); h.jump(meas(0)); };

    P[0].f.onsubmit = e => { e.preventDefault(); const p = P[0]; if (p.pend) return;
      if (!EMAIL.test(p.ins[0].value.trim())) return showErr(p, 'Enter a valid email address.', p.ins[0]);
      if (p.ins[1].value.length < 8) return showErr(p, 'Password must be at least 8 characters.', p.ins[1]);
      work(p, () => go(3, 1)); };
    P[1].f.onsubmit = e => { e.preventDefault(); const p = P[1]; if (p.pend) return;
      if (!EMAIL.test(p.ins[0].value.trim())) return showErr(p, 'Enter a valid email address.', p.ins[0]);
      work(p, () => { sent = p.ins[0].value.trim(); $(P[2].f, '.rw-em2').textContent = sent; go(2, 1); }); };
    P[3].f.onsubmit = e => { e.preventDefault(); const p = P[3]; if (p.pend) return; const code = boxes.map(b => b.value).join('');
      if (code.length < 6) return showErr(p, 'Enter all 6 digits.', boxes[Math.max(0, code.length)] || boxes[5], true);
      work(p, () => { if (code !== '123456'){ showErr(p, 'That code did not match. Try again.', boxes[0], true); return false; } go(4, 1); }); };
    P[2].f.onsubmit = P[4].f.onsubmit = e => e.preventDefault();
    $(P[0].f, '.rw-to-forgot').onclick = () => { P[1].ins[0].value = P[0].ins[0].value; go(1, 1); };
    [1, 2, 3].forEach(k => $(P[k].f, '.rw-to-signin').onclick = () => go(0, -1));
    $(P[4].f, '.rw-to-signin').onclick = () => { go(0, -1); at(EXIT + .4, clearAll); };
    so.onclick = () => { go(0, -1); at(EXIT + .4, clearAll); };
    P.forEach(p => { p.f.addEventListener('input', () => hideErr(p)); p.ins.forEach(i => { i.addEventListener('focus', () => i._tf.set(1)); i.addEventListener('blur', () => i._tf.set(0)); }); });
    const syncFill = () => boxes.forEach(b => b._fl.set(b.value ? 1 : 0));
    const spread = (i, v) => { for (let j = 0; j < v.length && i + j < 6; j++) boxes[i + j].value = v[j]; syncFill(); boxes[Math.min(5, i + v.length)].focus({ preventScroll:true }); };
    boxes.forEach((b, i) => {
      b.addEventListener('input', () => { const v = b.value.replace(/\D/g, ''); if (v.length > 1){ b.value = ''; spread(i, v); return; } b.value = v; syncFill(); if (v && i < 5) boxes[i + 1].focus({ preventScroll:true }); });
      b.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !b.value && i > 0){ e.preventDefault(); boxes[i - 1].value = ''; syncFill(); boxes[i - 1].focus({ preventScroll:true }); }
        else if (e.key === 'ArrowLeft' && i > 0){ e.preventDefault(); boxes[i - 1].focus({ preventScroll:true }); }
        else if (e.key === 'ArrowRight' && i < 5){ e.preventDefault(); boxes[i + 1].focus({ preventScroll:true }); } });
      b.addEventListener('paste', e => { const v = ((e.clipboardData && e.clipboardData.getData('text')) || '').replace(/\D/g, ''); if (!v) return; e.preventDefault(); spread(i, v); });
    });
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && cur !== 0){ e.preventDefault(); go(0, -1); } });

    const draw = t => {
      run(t);
      if (st.clientWidth !== w0) measAll();
      let eh = 0;
      P.forEach((p, i) => {
        sw.apply(p.f, i, t); if (p.sub){ p.bsw.apply(p.b0, 0, t, 3); p.bsw.apply(p.b1, 1, t, 3); }
        const er = clamp(p.er.at(t)); if (p.erEl){ p.erEl.style.height = px(er * p.eh); p.em.style.opacity = er.toFixed(3); eh += er * p.eh; }
        p.ins.forEach(inp => { inp.style.borderColor = mix(clamp(inp._iv.at(t)), 'var(--danger)', mix(clamp(inp._tf.at(t)), 'var(--accent)', inp._fl ? mix(clamp(inp._fl.at(t)), 'var(--ink)', 'var(--line)') : 'var(--line)')); });
      });
      ab.style.height = px(h.at(t) + eh);
      const v = clamp(sv.at(t)); so.style.opacity = v.toFixed(3); so.style.visibility = v < .01 ? 'hidden' : 'visible';
    };
    document.fonts.ready.then(() => { measAll(); });
    reset(); measAll(); draw(now());
    return draw;
  }});
})();