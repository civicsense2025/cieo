
// Feedback recipes: pin-and-comment review and a helpful/not helpful panel. Nothing leaves the page.
const FB_EL = (tag, css, html) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; };
const FB_POP = { w:24, z:.45 };
const FB_BTN = 'min-height:44px;padding:0 14px;border:0;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;';

atom({ id:'feedback-pin-review', cat:'Feedback', name:'Pin and comment review', block:'feedback, review, annotations', fam:['M','S','X'], tall:true,
  html:`<div class="card col" style="width:min(340px,94%);padding:10px;gap:8px"><div class="row" style="justify-content:space-between"><button class="fb-mode" aria-pressed="false" style="${FB_BTN}background:var(--raised);color:var(--ink)">Comment mode: off</button><span class="small muted fb-n" role="status" aria-live="polite"></span></div><div class="fb-page" style="position:relative;height:210px;border-radius:10px;background:var(--bg);overflow:hidden;border:1px solid var(--line)"><div aria-hidden="true" style="position:absolute;inset:0;padding:12px;display:flex;flex-direction:column;gap:8px"><i style="display:block;height:10px;width:30%;border-radius:5px;background:var(--line)"></i><i style="display:block;height:18px;width:72%;border-radius:6px;background:var(--raised)"></i><i style="display:block;height:10px;width:90%;border-radius:5px;background:var(--line-soft)"></i><i style="display:block;height:10px;width:60%;border-radius:5px;background:var(--line-soft)"></i><i style="display:block;flex:1;border-radius:8px;background:var(--raised)"></i><i style="display:block;height:26px;width:38%;border-radius:8px;background:var(--line)"></i></div><button class="fb-hit" tabindex="-1" aria-label="Page canvas. Press Enter to drop a pin at the crosshair, arrow keys move it" style="position:absolute;inset:0;width:100%;height:100%;border:0;background:none;padding:0;pointer-events:none;border-radius:0"></button><i class="fb-cross" aria-hidden="true" style="position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;pointer-events:none;opacity:0"><b style="position:absolute;left:8px;top:0;bottom:0;width:2px;background:var(--accent)"></b><b style="position:absolute;top:8px;left:0;right:0;height:2px;background:var(--accent)"></b></i><div class="fb-pins"></div><div class="fb-po" role="dialog" aria-label="Comment" style="position:absolute;left:0;top:0;width:176px;padding:8px;border-radius:12px;background:var(--card);box-shadow:var(--float-shadow, var(--shadow));visibility:hidden;opacity:0"><div class="po-edit"><textarea class="po-text" rows="2" aria-label="Your comment" placeholder="Add a comment" style="width:100%;box-sizing:border-box;resize:none;border:1.5px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);padding:6px 8px;font:13px/1.35 var(--sans)"></textarea><div class="row" style="gap:6px;margin-top:6px"><button class="po-post" style="${FB_BTN}flex:1;padding:0 8px;background:var(--ink);color:var(--card)">Post</button><button class="po-cancel" style="${FB_BTN}flex:1;padding:0 8px;background:var(--raised);color:var(--ink)">Cancel</button></div></div><div class="po-view" hidden><div class="po-msg" style="font-size:13px;line-height:1.35;padding:2px 2px 6px;overflow-wrap:anywhere"></div><div class="row" style="gap:6px"><button class="po-resolve" style="${FB_BTN}flex:1;padding:0 8px;background:var(--success);color:var(--card)">Resolve</button><button class="po-close" style="${FB_BTN}flex:1;padding:0 8px;background:var(--raised);color:var(--ink)">Close</button></div></div></div></div></div><div class="hint">Turn on comment mode, then click the page. Without a mouse use arrow keys and Enter</div>`,
  desc:'In comment mode a crosshair follows the pointer or the arrow keys, and a click drops a numbered pin that pops past its rest size. A popover opens beside it and flips to the other side near the edge; Post turns the pin solid and Resolve fades it away.',
  api:'pin.s.set(1, {w:24,z:.45})   side = pin.x > W/2 ? left : right   po.{x,y} = clamp(pin ± 22, edge)   post: fill.set(1)   resolve: o.set(0)',
  init(st){
    const page = $(st,'.fb-page'), pinsEl = $(st,'.fb-pins'), po = $(st,'.fb-po'), cross = $(st,'.fb-cross'), count = $(st,'.fb-n'), ta = $(st,'.po-text'), edit = $(st,'.po-edit'), view = $(st,'.po-view'), msg = $(st,'.po-msg');
    const fbMode = $(st,'button.fb-mode');
    const fbHit = $(st,'button.fb-hit');
    const poPost = $(st,'button.po-post');
    const poCancel = $(st,'button.po-cancel');
    const poResolve = $(st,'button.po-resolve');
    const poClose = $(st,'button.po-close');
    const PW = 176, PIN = 28; let mode = false, cx = 150, cy = 105, nextNo = 1, pins = [], open = null;
    const po_o = new Track(0, S.snap), po_s = new Track(.9, S.base), xs = new Track(0, S.base), ys = new Track(0, S.base), cr = new Track(0, S.snap);
    let origin = '0% 50%';
    const W = () => page.clientWidth || 300, H = () => page.clientHeight || 210;
    const sync = () => { const n = pins.filter(p => p.state !== 'resolved').length; count.textContent = n ? `${n} open` : 'No comments yet'; };
    const place = pin => { const w = W(), h = H(), ph = pin.state === 'draft' ? 128 : 96, right = pin.x < w/2;
      const x = right ? Math.min(w - PW - 4, pin.x + PIN/2 + 8) : Math.max(4, pin.x - PIN/2 - 8 - PW), y = clamp(pin.y - 24, 4, Math.max(4, h - ph - 4)); origin = right ? '0% 40%' : '100% 40%'; return { x, y }; };
    const show = (pin, focus) => { open = pin; const draft = pin.state === 'draft'; edit.hidden = !draft; view.hidden = draft; msg.textContent = pin.text;
      const pos = place(pin), fresh = po_o.target === 0; po.style.transformOrigin = origin; if (REDUCE || fresh){ xs.jump(pos.x); ys.jump(pos.y); } else { xs.set(pos.x); ys.set(pos.y); }
      po.style.visibility = 'visible'; if (REDUCE){ po_o.jump(1); po_s.jump(1); } else { po_o.set(1, S.snap); po_s.jump(.9); po_s.set(1, S.base); }
      if (draft){ ta.value = pin.text; poPost.disabled = !ta.value.trim(); poPost.style.opacity = poPost.disabled ? '.5' : '1'; if (focus) setTimeout(() => ta.focus({ preventScroll:true }), 30); } else if (focus) setTimeout(() => poResolve.focus({ preventScroll:true }), 30); };
    const hide = () => { const was = open; open = null; if (REDUCE){ po_o.jump(0); po.style.visibility = 'hidden'; } else po_o.set(0, S.snap); return was; };
    const drop = (x, y) => { if (open && open.state === 'draft') cancel(); const t = now(); const btn = FB_EL('button', `position:absolute;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border:0;background:none;padding:0;cursor:pointer;transform-origin:50% 50%`, `<span class="pn" style="display:grid;place-items:center;width:${PIN}px;height:${PIN}px;margin:auto;border-radius:50% 50% 50% 4px;border:2px solid var(--accent);box-sizing:border-box;background:var(--card);color:var(--accent);font:600 12px var(--sans)"></span>`);
      const pin = { no:nextNo++, x:clamp(x, 18, W() - 18), y:clamp(y, 18, H() - 18), text:'', state:'draft', el:btn, pn:$(btn,'.pn'), s:new Track(REDUCE ? 1 : 0, FB_POP), o:new Track(1, S.base), f:new Track(0, S.base) };
      pin.pn.textContent = String(pin.no); btn.setAttribute('aria-label', `Comment ${pin.no}, draft`); btn.style.left = px(pin.x); btn.style.top = px(pin.y); btn.onclick = () => { if (open === pin) return; if (open && open.state === 'draft') cancel(); if (pin.state === 'resolved') return; show(pin, true); };
      pinsEl.appendChild(btn); pins.push(pin); if (!REDUCE) pin.s.set(1, FB_POP, t); show(pin, true); sync(); };
    const cancel = () => { const p = hide(); if (p && p.state === 'draft'){ p.state = 'resolved'; p.gone = true; if (REDUCE) p.o.jump(0); else p.o.set(0, S.snap); setTimeout(() => p.el.remove(), REDUCE ? 40 : 500); pins = pins.filter(x => x !== p); sync(); } };
    const post = () => { const v = ta.value.trim(); if (!open || !v) return; const p = open; p.text = v; p.state = 'posted'; p.el.setAttribute('aria-label', `Comment ${p.no}: ${v}`); if (REDUCE) p.f.jump(1); else p.f.set(1); hide(); p.el.focus({ preventScroll:true }); sync(); };
    const resolve = () => { if (!open) return; const p = open; p.state = 'resolved'; hide(); if (REDUCE) p.o.jump(0); else p.o.set(0, S.soft); setTimeout(() => { p.el.remove(); pins = pins.filter(x => x !== p); }, REDUCE ? 40 : 900); sync(); fbMode.focus({ preventScroll:true }); };
    const setMode = on => { mode = on; fbMode.setAttribute('aria-pressed', String(on)); fbMode.textContent = on ? 'Comment mode: on' : 'Comment mode: off'; fbMode.style.background = on ? 'var(--ink)' : 'var(--raised)'; fbMode.style.color = on ? 'var(--card)' : 'var(--ink)';
      fbHit.style.pointerEvents = on ? 'auto' : 'none'; fbHit.style.cursor = on ? 'crosshair' : 'default'; fbHit.tabIndex = on ? 0 : -1; if (REDUCE) cr.jump(on ? 1 : 0); else cr.set(on ? 1 : 0); if (!on && open && open.state === 'draft') cancel(); };
    fbMode.onclick = () => setMode(!mode);
    fbHit.onpointermove = e => { const r = page.getBoundingClientRect(); cx = e.clientX - r.left; cy = e.clientY - r.top; };
    fbHit.onclick = e => { const r = page.getBoundingClientRect(); if (e.detail === 0) drop(cx, cy); else drop(e.clientX - r.left, e.clientY - r.top); };
    fbHit.onkeydown = e => { const d = { ArrowLeft:[-12,0], ArrowRight:[12,0], ArrowUp:[0,-12], ArrowDown:[0,12] }[e.key]; if (d){ e.preventDefault(); cx = clamp(cx + d[0], 4, W() - 4); cy = clamp(cy + d[1], 4, H() - 4); } };
    ta.oninput = () => { poPost.disabled = !ta.value.trim(); poPost.style.opacity = poPost.disabled ? '.5' : '1'; };
    ta.onkeydown = e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)){ e.preventDefault(); post(); } };
    poPost.onclick = post; poCancel.onclick = cancel; poResolve.onclick = resolve; poClose.onclick = () => { hide(); };
    po.onkeydown = e => { if (e.key === 'Escape'){ e.preventDefault(); const p = open; if (p && p.state === 'draft') cancel(); else hide(); (p ? p.el : fbMode).focus({ preventScroll:true }); } };
    sync();
    return t => { for (const p of pins){ const s = Math.max(0, p.s.at(t)), f = clamp(p.f.at(t)); p.el.style.opacity = clamp(p.o.at(t)).toFixed(3); p.el.style.transform = `scale(${s.toFixed(3)})`;
        p.pn.style.background = mix(f, 'var(--accent)', 'var(--card)'); p.pn.style.color = mix(f, 'var(--card)', 'var(--accent)'); p.pn.style.borderStyle = f > .5 ? 'solid' : 'dashed'; }
      const o = clamp(po_o.at(t)); po.style.opacity = o.toFixed(3); po.style.transform = `translate(${px(xs.at(t))},${px(ys.at(t))}) scale(${po_s.at(t).toFixed(3)})`; if (!open && o < .02 && po.style.visibility !== 'hidden') po.style.visibility = 'hidden';
      cross.style.opacity = clamp(cr.at(t)).toFixed(3); cross.style.transform = `translate(${px(cx)},${px(cy)})`; };
  }});

atom({ id:'feedback-helpful', cat:'Feedback', name:'Helpful thumbs', block:'feedback, helpful, survey', fam:['M','S','E'],
  html:`<div class="card" style="width:min(340px,94%);padding:0;overflow:hidden"><div class="fh-panel" style="position:relative;height:96px"><div class="fh-ask" style="position:absolute;left:0;right:0;top:0;padding:14px;display:flex;flex-direction:column;gap:10px"><b style="font-size:15px;font-weight:600">Was this article helpful?</b><div class="row" style="gap:8px"><button class="fh-up" aria-pressed="false" style="${FB_BTN}display:flex;align-items:center;gap:8px;background:var(--raised);color:var(--ink)"><span aria-hidden="true" style="font-size:18px">👍</span>Yes</button><button class="fh-down" aria-pressed="false" style="${FB_BTN}display:flex;align-items:center;gap:8px;background:var(--raised);color:var(--ink)"><span aria-hidden="true" style="font-size:18px">👎</span>No</button></div></div><div class="fh-why" style="position:absolute;left:0;right:0;top:0;padding:14px;display:flex;flex-direction:column;gap:10px"><b class="fh-q" style="font-size:15px;font-weight:600"></b><div class="fh-chips" role="group" aria-label="Reasons" style="display:flex;flex-wrap:wrap;gap:6px"></div><div class="row" style="gap:8px"><button class="fh-send" style="${FB_BTN}background:var(--ink);color:var(--card)">Send feedback</button><button class="fh-back" style="${FB_BTN}background:none;color:var(--muted)">Back</button></div></div><div class="fh-done" style="position:absolute;left:0;right:0;top:0;padding:14px;display:flex;flex-direction:column;gap:6px"><b style="font-size:15px;font-weight:600">Thanks, that helps us.</b><span class="small muted fh-sum" style="font-size:13px;line-height:1.4"></span><button class="fh-change" style="${FB_BTN}align-self:flex-start;background:none;color:var(--accent);padding:0 4px">Change answer</button></div></div></div><div class="hint">Choose Yes or No, tick the reasons, send. The panel height follows each step</div>`,
  desc:'Choosing a thumb swaps the question for reason chips that fit that answer, and sending swaps in a thank-you that repeats what was chosen. The panel height springs to the measured size of each step instead of jumping.',
  api:'step.to(ask | why | done)   panel.h.set(measure(layer), soft)   chips: aria-pressed toggles   Change answer → ask',
  init(st){
    const panel = $(st,'.fh-panel'), ask = $(st,'.fh-ask'), why = $(st,'.fh-why'), done = $(st,'.fh-done'), q = $(st,'.fh-q'), chipsEl = $(st,'.fh-chips'), sum = $(st,'.fh-sum');
    const fhUp = $(st,'button.fh-up');
    const fhDown = $(st,'button.fh-down');
    const fhSend = $(st,'button.fh-send');
    const fhBack = $(st,'button.fh-back');
    const fhChange = $(st,'button.fh-change');
    const R = { up:['Clear steps', 'Accurate', 'Saved me time'], down:['Hard to follow', 'Out of date', 'Missing steps'] };
    const L = { ask, why, done }, sw = new Swap('ask'), h = new Track(96, S.soft); let kind = '', picked = new Set();
    const go = (k, focus) => { sw.to(k); const H = L[k].offsetHeight; if (REDUCE) h.jump(H); else h.set(H); if (focus) setTimeout(() => focus.focus({ preventScroll:true }), 140); };
    const choose = k => { kind = k; picked = new Set(); fhUp.setAttribute('aria-pressed', String(k === 'up')); fhDown.setAttribute('aria-pressed', String(k === 'down'));
      q.textContent = k === 'up' ? 'Glad it helped. What worked?' : 'Sorry about that. What went wrong?'; chipsEl.textContent = '';
      R[k].forEach(label => { const fhChip = FB_EL('button', `${FB_BTN}border-radius:999px;background:var(--raised);color:var(--ink)`, label); fhChip.type = 'button'; fhChip.setAttribute('aria-pressed', 'false');
        fhChip.onclick = () => { const on = !picked.has(label); on ? picked.add(label) : picked.delete(label); fhChip.setAttribute('aria-pressed', String(on)); fhChip.style.background = on ? 'var(--ink)' : 'var(--raised)'; fhChip.style.color = on ? 'var(--card)' : 'var(--ink)'; }; chipsEl.appendChild(fhChip); });
      go('why', chipsEl.firstChild); };
    fhUp.onclick = () => choose('up'); fhDown.onclick = () => choose('down');
    fhBack.onclick = () => go('ask', kind === 'up' ? fhUp : fhDown);
    fhSend.onclick = () => { const why2 = [...picked]; sum.textContent = `You said: ${kind === 'up' ? 'Helpful' : 'Not helpful'}${why2.length ? `, ${why2.join(', ').toLowerCase()}` : ''}.`; go('done', fhChange); };
    fhChange.onclick = () => { fhUp.setAttribute('aria-pressed', 'false'); fhDown.setAttribute('aria-pressed', 'false'); go('ask', fhUp); };
    why.addEventListener('keydown', e => { if (e.key === 'Escape') go('ask', kind === 'up' ? fhUp : fhDown); });
    h.jump(ask.offsetHeight); panel.style.height = px(h.at(0));
    return t => { Object.keys(L).forEach(k => sw.apply(L[k], k, t)); panel.style.height = px(h.at(t)); };
  }});
