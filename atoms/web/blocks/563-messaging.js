
// Messaging recipes: typing, delivery state, inbox order and group avatars. Everything is simulated locally.
const MS_EL = (tag, css, html) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; };
const MS_AV = (name, size, hue) => `<span aria-hidden="true" style="flex:none;width:${size}px;height:${size}px;border-radius:50%;display:grid;place-items:center;background:${hue};color:var(--card);font:600 ${Math.round(size*.42)}px var(--sans)">${name[0].toUpperCase()}</span>`;
const MS_BTN = 'min-height:44px;padding:0 16px;border:0;border-radius:12px;background:var(--ink);color:var(--card);font-size:13px;font-weight:500;cursor:pointer;';
const MS_POP = { w:24, z:.45 };

atom({ id:'msg-typing', cat:'Messaging', name:'Typing to message', block:'messaging, typing, reply', fam:['M','S','X','T'], tall:true,
  html:`<div class="card col" style="width:min(340px,94%);padding:0;gap:0;overflow:hidden"><div class="mt-th" role="log" aria-live="polite" style="height:236px;display:flex;flex-direction:column;justify-content:flex-end;gap:8px;padding:12px;overflow:hidden"></div><div class="row" style="padding:8px 12px;border-top:1px solid var(--line-soft);justify-content:space-between"><span class="small muted">Priya</span><button class="mt-ask" style="${MS_BTN}">Send a question</button></div></div><div class="hint">Send a question. Three dots wave, then the dots grow into the reply bubble</div>`,
  desc:'Your message rises into the thread, then three dots wave on a phase offset. When the reply arrives the same bubble grows to the measured size of the text and the words fade in.',
  api:'dots: y = −2·wave(t·6 − i·0.9)   bubble.{w,h}.set(measure(reply), soft)   text.o.set(1, base, t + 0.12)',
  init(st){
    const th = $(st,'.mt-th');
    const mtAsk = $(st,'button.mt-ask');
    const Q = [['Can you send the deck?', 'Sending it now. Slides 4 to 9 changed since Monday.'], ['Is Thursday still good?', 'Yes. Room is booked for ten, with a call link in the invite.'], ['Any blockers?', 'None. Waiting on one sign-off from legal, due tomorrow morning.']];
    const q = [], items = []; let k = 0, busy = false;
    const bubble = (mine, inner) => { const b = MS_EL('div', `align-self:${mine ? 'flex-end' : 'flex-start'};max-width:80%;padding:8px 12px;border-radius:18px;font-size:14px;line-height:1.4;overflow:hidden;position:relative;${mine ? 'background:var(--ink);color:var(--card)' : 'background:var(--raised);color:var(--ink)'}`, inner); th.appendChild(b); while (th.children.length > 5) th.firstChild.remove(); return b; };
    const rise = (b, t) => { const it = { b, y:new Track(REDUCE ? 0 : 14, S.soft), o:new Track(REDUCE ? 1 : 0, S.base) }; if (!REDUCE){ it.y.set(0, S.soft, t); it.o.set(1, S.base, t); } items.push(it); return it; };
    const measure = txt => { const m = MS_EL('div', 'position:absolute;visibility:hidden;max-width:80%;padding:8px 12px;font-size:14px;line-height:1.4;width:max-content', ''); m.textContent = txt; th.appendChild(m); const W = Math.min(m.offsetWidth, th.clientWidth*.8), H = m.offsetHeight; m.remove(); return { W:W + 1, H }; };
    const ask = () => { if (busy) return; busy = true; mtAsk.disabled = true; mtAsk.style.opacity = '.5'; const [qs, rs] = Q[k++ % Q.length], t0 = now();
      const mine = bubble(true, ''); mine.textContent = qs; rise(mine, t0);
      q.push([t0 + .6, () => { const dots = bubble(false, '<span class="d" style="display:inline-flex;gap:4px;padding:4px 2px">' + '<i style="width:7px;height:7px;border-radius:50%;background:var(--muted)"></i>'.repeat(3) + '</span>'); const it = rise(dots, now()); it.typing = now(); it.w = new Track(54); it.h = new Track(34); dots.style.width = '54px'; it.reply = rs; }]);
      q.push([t0 + 2.2, () => { const it = items.find(x => x.typing && !x.done); if (!it) return; const { W, H } = measure(it.reply); it.done = true; it.text = MS_EL('span', 'position:absolute;left:12px;top:8px;right:12px;opacity:0'); it.text.textContent = it.reply; it.b.appendChild(it.text);
        if (REDUCE){ it.w.jump(W); it.h.jump(H); } else { it.w.set(W, S.soft); it.h.set(H, S.soft); } it.o2 = new Track(REDUCE ? 1 : 0, S.base); if (!REDUCE) it.o2.set(1, S.base, now() + .12); it.settle = true; }]);
      q.push([t0 + 2.9, () => { busy = false; mtAsk.disabled = false; mtAsk.style.opacity = '1'; }]); };
    mtAsk.onclick = ask; q.push([.7, ask]);
    return t => { while (q.length && q[0][0] <= t) q.shift()[1]();
      for (const it of items){ it.b.style.opacity = clamp(it.o.at(t)).toFixed(3); it.b.style.transform = `translateY(${px(it.y.at(t))})`;
        if (it.typing && !it.done){ $$(it.b,'.d i').forEach((d,i) => { const w = REDUCE ? .5 : .5 + .5*Math.sin((t - it.typing)*6 - i*.9); d.style.opacity = (.35 + .65*w).toFixed(3); d.style.transform = `translateY(${px(-2*w)})`; }); }
        else if (it.done){ const d = $(it.b,'.d'); const o = clamp(it.o2.at(t)); it.b.style.width = px(it.w.at(t)); it.b.style.height = px(it.h.at(t)); if (d) d.style.opacity = Math.max(0, 1 - o*3).toFixed(3); it.text.style.opacity = o.toFixed(3);
          if (it.settle && !it.w.prune(t) && !it.h.prune(t) && !it.o2.prune(t)){ it.settle = false; it.b.style.width = it.b.style.height = ''; if (d) d.remove(); it.text.style.cssText = ''; } } } };
  }});

atom({ id:'msg-delivery', cat:'Messaging', name:'Delivery ticks', block:'messaging, delivery, read receipts', fam:['M','S','E','T'],
  html:`<div class="card col" style="width:min(340px,94%);padding:14px;gap:10px"><div style="align-self:flex-end;max-width:84%;padding:8px 12px 6px;border-radius:18px 18px 4px 18px;background:var(--raised);color:var(--ink)"><div style="font-size:14px;line-height:1.4">Running ten minutes late, start without me.</div><div class="row" style="justify-content:flex-end;gap:6px;margin-top:2px;font-size:11px;line-height:16px"><span class="mk-st" aria-live="polite" style="position:relative;display:block;height:16px;min-width:52px;text-align:right"></span><svg class="mk-tk" width="22" height="14" viewBox="0 0 22 14" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g class="ck"><circle cx="7" cy="7" r="5.2" stroke="currentColor" opacity=".8"/><path class="hand" d="M7 7V3.8" stroke="currentColor"/></g><path class="c1" d="M2.5 7.5l3.2 3.2L12 4" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><path class="c2" d="M9 9.2l1.5 1.5L16.8 4" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg></div></div><div class="mk-seen row" style="justify-content:flex-end;gap:8px;min-height:24px;font-size:12px"><span class="muted mk-lbl" style="opacity:0">Seen by</span><span class="mk-av" style="display:flex"></span></div><button class="mk-send" style="${MS_BTN}align-self:flex-start">Send again</button></div><div class="hint">Watch one message go from sending to sent, delivered and read, then the seen avatars slide in</div>`,
  desc:'The clock hand turns while sending. A first check draws in on Sent, a second slides in beside it on Delivered, both turn to the accent colour on Read, then the Seen by avatars slide in one after another.',
  api:'status: 0 sending → 1 sent (c1.draw) → 2 delivered (c2.draw) → 3 read (tint.set(1)) → seen[i].x.set(0, base, t + i·0.06)',
  init(st){
    const tk = $(st,'.mk-tk'), c1 = $(st,'.c1'), c2 = $(st,'.c2'), clock = $(st,'.ck'), hand = $(st,'.hand'), stEl = $(st,'.mk-st'), lbl = $(st,'.mk-lbl'), avs = $(st,'.mk-av');
    const mkSend = $(st,'button.mk-send');
    const TXT = ['Sending', 'Sent', 'Delivered', 'Read'], layers = TXT.map(s => { const e = MS_EL('span', 'position:absolute;right:0;top:0;white-space:nowrap', s); stEl.appendChild(e); return e; });
    const NAMES = ['Priya', 'Sol', 'Mara'], HUES = ['var(--accent)', 'var(--success)', 'var(--warning)'];
    const seen = NAMES.map((n,i) => { const e = MS_EL('span', `display:grid;place-items:center;width:22px;height:22px;border-radius:50%;margin-left:${i ? -6 : 0}px;box-shadow:0 0 0 2px var(--card);background:${HUES[i]};color:var(--card);font:600 10px var(--sans)`, n[0]); e.title = n; avs.appendChild(e); return { e, x:new Track(REDUCE ? 0 : 14, S.base), o:new Track(REDUCE ? 1 : 0, S.base) }; });
    const sw = new Swap(0), kc = new Track(1, S.snap), k1 = new Track(0, S.base), k2 = new Track(0, S.base), rd = new Track(0, S.soft), lo = new Track(0, S.snap);
    const SCHED = [0, .9, 1.9, 3.0], SEEN = 3.4; let t0 = 0, step = 0, seenOn = false;
    const reset = t => { t0 = t; step = 0; seenOn = false; sw.cur = 0; sw.prev = null; sw.t = -9; kc.jump(1); k1.jump(0); k2.jump(0); rd.jump(0); lo.jump(0); seen.forEach(s => { s.x.jump(REDUCE ? 0 : 14); s.o.jump(0); }); mkSend.disabled = true; mkSend.style.opacity = '.5'; };
    const go = (n, t) => { step = n; sw.to(n, t);
      if (n === 1){ kc.set(0, S.snap, t); REDUCE ? k1.jump(1) : k1.set(1, S.base, t); }
      if (n === 2){ REDUCE ? k2.jump(1) : k2.set(1, S.base, t); }
      if (n === 3){ REDUCE ? rd.jump(1) : rd.set(1, S.soft, t); } };
    mkSend.onclick = () => { reset(now()); };
    reset(0.3);
    return t => { const dt0 = t - t0;
      for (let n = step + 1; n < SCHED.length; n++) if (dt0 >= SCHED[n]) go(n, t);
      if (!seenOn && dt0 >= SEEN){ seenOn = true; lo.set(1, S.snap, t); seen.forEach((s,i) => { if (REDUCE){ s.x.jump(0); s.o.jump(1); } else { s.x.set(0, S.base, t + i*.06); s.o.set(1, S.base, t + i*.06); } }); mkSend.disabled = false; mkSend.style.opacity = '1'; }
      layers.forEach((e,i) => sw.apply(e, i, t));
      tk.style.stroke = 'currentColor'; tk.style.color = mix(clamp(rd.at(t)), 'var(--accent)', 'var(--muted)');
      clock.style.opacity = clamp(kc.at(t)).toFixed(3); hand.style.transformOrigin = '7px 7px'; hand.style.transform = `rotate(${REDUCE ? 0 : ((t*180) % 360).toFixed(1)}deg)`;
      c1.setAttribute('stroke-dashoffset', (1 - clamp(k1.at(t))).toFixed(3)); c2.setAttribute('stroke-dashoffset', (1 - clamp(k2.at(t))).toFixed(3)); c2.style.transform = `translateX(${px((1 - clamp(k2.at(t)))*-3)})`;
      lbl.style.opacity = clamp(lo.at(t)).toFixed(3);
      seen.forEach(s => { s.e.style.opacity = clamp(s.o.at(t)).toFixed(3); s.e.style.transform = `translateX(${px(s.x.at(t))})`; }); };
  }});

atom({ id:'msg-inbox', cat:'Messaging', name:'Inbox reorder', block:'messaging, inbox, unread', fam:['M','S','E','X'], tall:true,
  html:`<div class="card col" style="width:min(340px,94%);padding:8px;gap:8px"><div class="mi-list" role="list" aria-label="Conversations" style="position:relative;height:232px"></div><div class="row" style="justify-content:space-between;padding:0 4px"><span class="small muted mi-note" role="status" aria-live="polite"></span><button class="mi-new" style="${MS_BTN}">New message</button></div></div><div class="hint">Send a new message, or open a conversation to clear its unread badge</div>`,
  desc:'A new message makes its conversation slide to the top while every row in between slides down by one slot. Its unread badge pops past full size and the count rolls; opening the conversation shrinks the badge away.',
  api:'order = [touched, ...rest]   row[i].y.set(slot(order.indexOf(i)), base)   badge.s.set(1, {w:24,z:.45})   count → Digits',
  init(st){
    const list = $(st,'.mi-list'), note = $(st,'.mi-note');
    const mi_new = $(st,'button.mi-new');
    const C = [['Priya', 'var(--accent)', 'Slides look great.', 'Tue'], ['Design team', 'var(--success)', 'Mara: moved the review to 3.', 'Tue'], ['Sol', 'var(--warning)', 'Lunch tomorrow?', 'Mon'], ['Build alerts', 'var(--danger)', 'Deploy 482 finished.', 'Mon']];
    const NEW = [['Priya', 'Can you look at slide 6?'], ['Design team', 'Theo: new icons are in the file.'], ['Sol', 'I can do 12:30.'], ['Build alerts', 'Deploy 483 started.'], ['Priya', 'Thanks, shipping at 4.'], ['Sol', 'Booked the corner table.']];
    const H = 58;
    const openRow = r => { if (!r.unread) return; r.unread = 0; if (REDUCE) r.s.jump(0); else r.s.set(0, S.snap); label(r); note.textContent = `${r.name} opened`; };
    function mkRow(c, i){ const mi_row = MS_EL('button', `position:absolute;left:0;right:0;top:0;height:${H - 2}px;display:grid;grid-template-columns:40px 1fr auto;gap:10px;align-items:center;text-align:left;padding:0 10px;border:0;border-radius:12px;background:none;color:var(--ink);cursor:pointer;font:inherit`,
        `<span aria-hidden="true" style="width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:${c[1]};color:var(--card);font:600 16px var(--sans)">${c[0][0]}</span><span style="min-width:0"><span style="display:block;font-size:14px;line-height:20px;font-weight:600">${c[0]}</span><span class="pv" style="display:block;font-size:13px;line-height:18px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span></span><span style="display:flex;flex-direction:column;align-items:flex-end;gap:4px"><span class="tm" style="font-size:11px;line-height:16px;color:var(--muted)"></span><span class="bd" aria-hidden="true" style="min-width:20px;height:20px;padding:0 6px;box-sizing:border-box;border-radius:10px;background:var(--accent);color:var(--card);font-size:12px;line-height:20px;font-weight:600;display:flex;align-items:center;justify-content:center;transform:scale(0)"><span class="nb"></span></span></span>`);
      mi_row.setAttribute('role', 'listitem'); $(mi_row,'.pv').textContent = c[2]; $(mi_row,'.tm').textContent = c[3]; list.appendChild(mi_row);
      const d = new Digits($(mi_row,'.nb'), 2); const r = { el:mi_row, i, name:c[0], bd:$(mi_row,'.bd'), pv:$(mi_row,'.pv'), tm:$(mi_row,'.tm'), d, unread:0, y:new Track(i*H, S.base), s:new Track(0, MS_POP), fl:new Track(0, S.lazy) }; mi_row.onclick = () => openRow(r); return r; }
    const rows = C.map(mkRow);
    let order = rows.map((_,i) => i), n = 0;
    const slots = t => order.forEach((ri, pos) => { const r = rows[ri]; if (REDUCE) r.y.jump(pos*H); else r.y.set(pos*H, S.base, t); });
    const label = r => r.el.setAttribute('aria-label', `${r.name}, ${r.pv.textContent}${r.unread ? `, ${r.unread} unread` : ''}`);
    rows.forEach(r => label(r));
    mi_new.onclick = () => { const [name, text] = NEW[n++ % NEW.length], r = rows.find(x => x.name === name), t = now();
      r.unread = Math.min(99, r.unread + 1); r.pv.textContent = text; r.tm.textContent = 'now'; r.d.set(String(r.unread), REDUCE); if (r.s.target < 1){ if (REDUCE) r.s.jump(1); else { r.s.jump(.2); r.s.set(1, MS_POP, t); } } else if (!REDUCE){ r.s.jump(.75); r.s.set(1, MS_POP, t); }
      r.fl.jump(1); r.fl.set(0, S.lazy, t); order = [rows.indexOf(r), ...order.filter(x => x !== rows.indexOf(r))]; slots(t); label(r); note.textContent = `New message from ${name}`; };
    return t => { rows.forEach(r => { r.el.style.transform = `translateY(${px(r.y.at(t))})`; r.bd.style.transform = `scale(${Math.max(0, r.s.at(t)).toFixed(3)})`; r.el.style.background = `color-mix(in oklab, var(--accent) ${(clamp(r.fl.at(t))*14).toFixed(1)}%, transparent)`; r.d.render(t); }); };
  }});

atom({ id:'msg-group-avatar', cat:'Messaging', name:'Group avatar', block:'messaging, group, avatar', fam:['M','E'],
  html:`<div class="card col" style="width:min(340px,94%);padding:16px;gap:10px;align-items:center"><div class="mg-av" role="img" aria-label="Group avatar" style="position:relative;width:96px;height:96px"></div><b style="font-size:15px;font-weight:600">Weekend crew</b><span class="small muted mg-n" aria-live="polite" style="min-height:19px"></span><div class="row" style="gap:8px"><button class="mg-add" style="${MS_BTN}">Add member</button><button class="mg-rm" style="${MS_BTN}background:var(--raised);color:var(--ink)">Remove</button></div></div><div class="hint">Add members one at a time. The avatar re-lays out from one, to two, three, four and then a plus count</div>`,
  desc:'Every member circle springs between layout slots as people join: one fills the circle, two split diagonally, three form a triangle, four tile a grid, and past four the fourth slot becomes a plus count that rolls.',
  api:'layout(n): 1 → [full]   2 → diag   3 → triangle   4 → grid   ≥5 → 3 + "+k"   member.{x,y,s}.set(slot(i, n), base)',
  init(st){
    const av = $(st,'.mg-av'), note = $(st,'.mg-n');
    const mgAdd = $(st,'button.mg-add');
    const mgRm = $(st,'button.mg-rm');
    const P = ['Ava','Ben','Cy','Dee','Eli','Fay','Gus','Hal'], HUES = ['var(--accent)','var(--success)','var(--warning)','var(--danger)','var(--ink)','var(--muted)','var(--accent)','var(--success)'];
    const L = { 1:[[0,0,96]], 2:[[0,0,62],[34,34,62]], 3:[[23,0,50],[0,46,50],[46,46,50]], 4:[[0,0,46],[50,0,46],[0,50,46],[50,50,46]] };
    const slot = (i, n) => { const set = L[Math.min(n, 4)]; return n >= 5 && i >= 3 ? [set[3][0] + 23, set[3][1] + 23, 0] : set[i] || [48, 48, 0]; };
    const mk = (name, hue) => { const e = MS_EL('span', `position:absolute;left:0;top:0;border-radius:50%;display:grid;place-items:center;background:${hue};color:var(--card);font-weight:600;box-shadow:0 0 0 2px var(--card);overflow:hidden`, name[0]); av.appendChild(e); return e; };
    const members = [...Array(8)].map((_,i) => ({ e:mk(P[i], HUES[i]), x:new Track(48), y:new Track(48), s:new Track(0) }));
    const chip = MS_EL('span', 'position:absolute;left:0;top:0;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--raised);color:var(--ink);font-weight:600;box-shadow:0 0 0 2px var(--card);font-variant-numeric:tabular-nums', '<span>+</span><span class="cn"></span>'); av.appendChild(chip);
    const cd = new Digits($(chip,'.cn'), 2), cs = { x:new Track(48), y:new Track(48), s:new Track(0) }; cd.set('', true);
    let n = 1;
    const apply = (t, jump) => { const put = (tr, v) => (jump || REDUCE) ? tr.jump(v) : tr.set(v, S.base, t);
      members.forEach((m,i) => { const visible = i < Math.min(n, n >= 5 ? 3 : 4), [x, y, s] = visible ? slot(i, n) : [48, 48, 0]; put(m.x, x); put(m.y, y); put(m.s, visible ? s : 0); });
      const [cx, cy] = L[4][3], on = n >= 5; put(cs.x, on ? cx : 48); put(cs.y, on ? cy : 48); put(cs.s, on ? 46 : 0); if (on) cd.set(String(n - 3), REDUCE);
      note.textContent = `${n} ${n === 1 ? 'member' : 'members'}: ${P.slice(0, Math.min(n, 3)).join(', ')}${n > 3 ? ` and ${n - 3} more` : ''}`; mgAdd.disabled = n >= 8; mgRm.disabled = n <= 1; mgAdd.style.opacity = n >= 8 ? '.45' : '1'; mgRm.style.opacity = n <= 1 ? '.45' : '1';
      av.setAttribute('aria-label', `Group avatar, ${n} ${n === 1 ? 'member' : 'members'}`); };
    mgAdd.onclick = () => { if (n < 8){ n++; apply(now()); } };
    mgRm.onclick = () => { if (n > 1){ n--; apply(now()); } };
    apply(0, true);
    return t => { const put = (e, o) => { const s = Math.max(0, o.s.at(t)); e.style.width = e.style.height = px(s); e.style.transform = `translate(${px(o.x.at(t))},${px(o.y.at(t))})`; e.style.fontSize = px(Math.max(1, s*.4)); e.style.opacity = s < 1 ? '0' : '1'; };
      members.forEach(m => put(m.e, m)); put(chip, cs); cd.render(t); };
  }});
