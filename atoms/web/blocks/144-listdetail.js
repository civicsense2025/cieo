

/* ---------- Organisms ---------- */
/* ---------- Views (organisms) ---------- */
{
const vwBack = '<path d="M19 12H5M11 6l-6 6 6 6"/>';
const vwNear = (tr, t, e = .35) => Math.abs(tr.at(t) - tr.target) < e;
const vwEl = (tag, css, text) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; };
const vwRect = (st, el) => { const a = el.getBoundingClientRect(), s = st.getBoundingClientRect(); return { x:a.left - s.left, y:a.top - s.top, w:a.width, h:a.height }; };
const vwEllipsis = 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis';

/* ================================================================ 1. List to detail */
atom({ id:'listdetail', cat:'Views', name:'List to detail', block:'postlist, entry-list, collection', fam:['M','S','E'], wide:true, tall:true,
  html:`<div class="ldg" style="position:absolute;left:16px;right:16px;top:14px;bottom:30px;display:grid;gap:12px;align-content:center;grid-template-columns:repeat(var(--c,4),minmax(0,1fr));grid-auto-rows:var(--rh,230px)"></div><div class="hint">Open a post. Escape or Back returns it to its slot.</div><div class="ldf card" role="dialog" aria-modal="true" style="position:absolute;display:none;overflow:hidden;z-index:6;background:var(--card)"><div class="fa" style="position:absolute;left:0;right:0;top:0"></div><div class="ff" style="position:absolute;left:0;right:0;height:56px;padding:10px 12px;overflow:hidden;pointer-events:none"></div><div class="fd" style="position:absolute;left:0;right:0;bottom:0;padding:14px 20px 0;overflow:hidden"><div class="i1"><b style="display:block;font-size:20px;letter-spacing:-.02em;line-height:1.25"></b><span class="small muted" style="display:block;margin-top:2px"></span></div><p class="i2" style="margin:10px 0 0;font-size:13.5px;line-height:1.5;max-width:64ch"></p><p class="i3" style="margin:8px 0 0;font-size:13.5px;line-height:1.5;max-width:64ch"></p></div><button type="button" class="btn fb" style="position:absolute;top:10px;left:10px;display:flex;gap:6px;align-items:center;box-shadow:var(--shadow)">${ic(vwBack,14)}Back</button></div>`,
  desc:'The card you pick is the detail view. Siblings fade and blur out first, then the same card’s x, y, width, height and radius spring from its measured slot to fill the frame while its image grows. Back appears as it lands, then the heading and two paragraphs enter 50ms apart. Closing runs it backwards: text out, card down into the exact slot, siblings return.',
  api:'sib.set(0)   box.{x,y,w,h,r}.set(frame, t+.08)   body[i].set(1, t+.5+i*.05)   close: body.set(0); box.set(slot, t+EXIT); sib.set(1)',
  init(st){
    const grid = $(st,'.ldg'), fl = $(st,'.ldf'), fa = $(st,'.fa'), ff = $(st,'.ff'), fd = $(st,'.fd'), fb = $(st,'.fb');
    const POSTS = [
      { tag:'Agenda · 6 min', title:'Who writes the school board agenda', by:'Maya Okafor', when:'Oct 2', p:['The superintendent drafts it and the board chair approves it. Anyone can ask for an item by writing to the clerk eight days before the meeting.','Most agendas are settled before the public sees them, so the packet posted on Friday is the last draft you can still change.'] },
      { tag:'Budget · 9 min', title:'Reading a city budget in ten minutes', by:'Theo Lindqvist', when:'Sep 28', p:['Start with the transfers page. It shows which departments moved money between lines after the vote, and that is where priorities show up.','Then compare the adopted figure with last year’s actual spending. A gap of more than five percent deserves a question at the hearing.'] },
      { tag:'Votes · 4 min', title:'What a consent calendar hides', by:'Priya Raman', when:'Sep 24', p:['A consent calendar passes a stack of items in one vote with no discussion. Zoning changes and contract renewals sometimes ride along.','Any member can pull an item for its own vote. Ask your representative which ones they pulled this year and why.'] },
      { tag:'Comment · 5 min', title:'Public comment, step by step', by:'Ben Alvarez', when:'Sep 19', p:['Sign up before the meeting opens, keep to the time limit, and name the agenda item you are speaking to. The clerk reads speakers in sign-up order.','Written comments sent by noon the day before are usually entered into the record, even if you cannot attend in person.'] }
    ];
    const ARTS = [[['var(--accent)'],[118,32,14],'0 84 46 54 84 74 128 46 160 62'], [['var(--ink)'],[40,30,10],'0 70 38 48 78 66 120 38 160 58'], [['var(--muted)'],[100,26,17],'0 88 50 60 90 80 130 56 160 70'], [['var(--accent-tint)'],[128,36,12],'0 76 40 50 80 70 118 42 160 54']];
    const art = k => { const [[c],[cx,cy,r],pts] = ARTS[k], n = pts.split(' ').map(Number); let d = `M${n[0]} ${n[1]}`; for (let i = 2; i < n.length; i += 2) d += ` L${n[i]} ${n[i+1]}`; d += ' L160 100 L0 100Z';
      return `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%;display:block" aria-hidden="true"><rect width="160" height="100" fill="${c}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${k === 3 ? 'var(--accent)' : 'var(--card)'}" opacity=".5"/><path d="${d}" fill="${k === 3 ? 'var(--accent)' : 'var(--card)'}" opacity=".28"/></svg>`; };
    const face = P => `<span style="display:block;font-size:11px;font-weight:600;line-height:15px;color:var(--accent)">${P.tag}</span><span style="display:block;font-size:14px;font-weight:600;line-height:19px;${vwEllipsis}">${P.title}</span>`;
    const cards = POSTS.map((P, i) => { const b = vwEl('button', 'border:0;padding:0;text-align:left;cursor:pointer;overflow:hidden;display:flex;flex-direction:column;min-width:0;min-height:0;height:100%;color:var(--ink)'); b.type = 'button'; b.className = 'card';
      b.setAttribute('aria-label', 'Open ' + P.title); b.innerHTML = `<span class="ca" style="display:block;position:relative;flex:1;min-height:0">${art(i)}</span><span style="display:block;flex:none;height:56px;padding:10px 12px;overflow:hidden">${face(P)}</span>`;
      b.onclick = () => open(i); grid.appendChild(b); return b; });
    const items = [fb, $(fd,'.i1'), $(fd,'.i2'), $(fd,'.i3')], DELAY = [.3, .5, .55, .6];
    const T = { x:new Track(0), y:new Track(0), w:new Track(0), h:new Track(0), r:new Track(14), ah:new Track(0) };
    const sib = new Track(1), face_ = new Track(1), IT = items.map(() => new Track(0));
    let cur = -1, state = 'closed', tClose = 0, sz = [0, 0], narrow = false;
    const frame = () => { const W = st.clientWidth, H = st.clientHeight; return [10, 10, W - 20, H - 20]; };
    const detailArt = () => narrow ? 72 : 112;
    const layout = () => { const W = st.clientWidth, H = st.clientHeight, c = W >= 640 ? 4 : 2; narrow = W < 640; sz = [W, H];
      grid.style.setProperty('--c', c); grid.style.setProperty('--rh', (c === 4 ? 232 : Math.floor((H - 14 - 30 - 12)/2)) + 'px');
      $(fd,'.i1 b').style.fontSize = narrow ? '17px' : '20px'; fd.style.fontSize = narrow ? '13px' : '13.5px'; };
    const jumpBox = (r, rad, ah) => { T.x.jump(r[0]); T.y.jump(r[1]); T.w.jump(r[2]); T.h.jump(r[3]); T.r.jump(rad); T.ah.jump(ah); };
    const setBox = (r, rad, ah, t) => [[T.x, r[0]], [T.y, r[1]], [T.w, r[2]], [T.h, r[3]], [T.r, rad], [T.ah, ah]].forEach(([tr, v]) => tr.set(v, S.soft, t));
    function open(i){
      if (state !== 'closed') return; layout(); const t = now(), P = POSTS[i], rc = vwRect(st, cards[i]), ca = $(cards[i], '.ca').getBoundingClientRect();
      cur = i; state = 'open'; fa.innerHTML = art(i); ff.innerHTML = face(P); fl.setAttribute('aria-label', P.title);
      $(fd,'.i1 b').textContent = P.title; $(fd,'.i1 span').textContent = `By ${P.by} · ${P.when} · ${P.tag.split(' · ')[1]}`; $(fd,'.i2').textContent = P.p[0]; $(fd,'.i3').textContent = P.p[1];
      fl.style.display = 'block'; jumpBox([rc.x, rc.y, rc.w, rc.h], 14, ca.height); face_.jump(1); IT.forEach(x => x.jump(0));
      const t1 = t + .08;                                     // siblings leave first, then the card grows
      sib.jump(1); sib.set(0, S.snap, t); setBox(frame(), 18, detailArt(), t1); face_.set(0, S.snap, t1);
      IT.forEach((x, k) => x.set(1, S.base, t1 + DELAY[k]));  // back as it lands, heading and paragraphs 50ms apart after it settles
      grid.inert = true; setTimeout(() => fb.focus(), 0);
    }
    function close(){
      if (state !== 'open') return; const t = now(), t1 = t + EXIT, rc = vwRect(st, cards[cur]), ca = $(cards[cur], '.ca').getBoundingClientRect();
      state = 'closing'; tClose = t; IT.forEach(x => x.set(0, S.snap, t));   // text out first
      setBox([rc.x, rc.y, rc.w, rc.h], 14, ca.height, t1); face_.set(1, S.base, t1 + .1); sib.set(1, S.base, t1);
    }
    fb.onclick = close; st.addEventListener('keydown', e => { if (e.key === 'Escape' && state === 'open'){ e.preventDefault(); close(); } });
    layout();
    return t => {
      if (st.clientWidth !== sz[0] || st.clientHeight !== sz[1]){ layout(); if (state === 'open') jumpBox(frame(), 18, detailArt()); }
      if (state === 'closed') return;
      Object.assign(fl.style, { left:px(T.x.at(t)), top:px(T.y.at(t)), width:px(T.w.at(t)), height:px(T.h.at(t)), borderRadius:px(T.r.at(t)) });
      const ah = T.ah.at(t); fa.style.height = px(ah); ff.style.top = px(ah); fd.style.top = px(ah); fade(ff, face_.at(t), null);
      const sv = clamp(sib.at(t));
      cards.forEach((c, k) => { if (k === cur){ c.style.visibility = 'hidden'; return; } fade(c, sv, null); c.style.visibility = sv < .01 ? 'hidden' : 'visible'; });
      items.forEach((el, k) => { const o = clamp(IT[k].at(t)); fade(el, o, (1 - o)*8); if (k === 0) el.style.pointerEvents = o > .5 ? 'auto' : 'none'; });
      if (state === 'closing' && t > tClose + EXIT + .05 && [T.x, T.y, T.w, T.h, T.r].every(tr => vwNear(tr, t))){
        state = 'closed'; fl.style.display = 'none'; grid.inert = false;
        cards.forEach(c => { c.style.visibility = 'visible'; c.style.opacity = '1'; c.style.filter = 'none'; c.style.transform = 'none'; });
        if (document.activeElement === document.body || st.contains(document.activeElement)) cards[cur].focus({ preventScroll:true });
      }
    };
  }});

/* ================================================================ 2. Master-detail inbox */
atom({ id:'inbox', cat:'Views', name:'Master–detail inbox', block:'entry-list, Dialog / sheet', fam:['E','S','M','X'], wide:true, tall:true,
  html:`<button type="button" class="btn ibr" style="position:absolute;top:10px;right:12px">Reset</button><div class="ib card" style="position:absolute;left:12px;right:12px;top:44px;bottom:12px;overflow:hidden"><div class="ls" style="position:absolute;z-index:0;left:0;top:0;bottom:0;display:flex;flex-direction:column;background:var(--tile)"><div class="lh" style="flex:none;height:44px;padding:0 8px 0 14px;display:flex;align-items:center;justify-content:space-between;gap:8px"><span class="row" style="gap:8px"><b style="font-size:14px">Inbox</b><span role="status" aria-label="3 unread" class="row small" style="gap:5px;color:var(--muted)"><span class="cn" aria-hidden="true" style="color:var(--ink);font-weight:600"></span><span aria-hidden="true">unread</span></span></span><button type="button" class="btn ink cb" style="display:flex;gap:6px;align-items:center;padding:5px 11px">${ic(I.pen,13)}Compose</button></div><div class="lc" style="flex:1;min-height:0;overflow-y:auto"><div class="rs" style="position:relative"><i class="pl" style="position:absolute;left:6px;right:6px;top:0;height:0;border-radius:8px;background:var(--raised);z-index:0"></i></div></div></div><div class="pn" style="position:absolute;z-index:1;top:0;bottom:0;background:var(--card)"><div class="pb" style="display:none;position:absolute;left:0;right:0;top:0;height:44px;align-items:center;padding:0 10px"><button type="button" class="btn bk" style="display:flex;gap:6px;align-items:center;padding:5px 11px">${ic(vwBack,14)}Inbox</button></div><div class="pcs" style="position:absolute;left:0;right:0;bottom:0;top:0"></div></div><div class="cs" role="dialog" aria-label="New message" style="position:absolute;top:0;bottom:0;z-index:5;background:var(--card);box-shadow:var(--shadow);padding:12px 16px 14px;display:flex;flex-direction:column;gap:8px"><div class="row" style="justify-content:space-between"><b style="font-size:14px">New message</b></div><label class="row small" style="gap:8px"><span class="muted" style="width:52px;flex:none">To</span><input id="inbox-to" value="Maya Okafor" autocomplete="off" style="flex:1;min-width:0;border:1px solid var(--line);border-radius:8px;padding:6px 10px;background:var(--card);color:var(--ink);font:inherit"></label><label class="row small" style="gap:8px"><span class="muted" style="width:52px;flex:none">Subject</span><input id="inbox-subject" value="Thursday agenda" autocomplete="off" style="flex:1;min-width:0;border:1px solid var(--line);border-radius:8px;padding:6px 10px;background:var(--card);color:var(--ink);font:inherit"></label><label class="col" style="flex:1;min-height:0;gap:0"><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Message</span><textarea id="inbox-body" style="flex:1;min-height:0;resize:none;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:var(--card);color:var(--ink);font:13px/1.5 var(--sans)">Confirmed. All three speakers are signed up, and I will bring printed copies of the packet.</textarea></label><div class="row" style="justify-content:flex-end"><button type="button" class="btn cc">Cancel</button><button type="button" class="btn ink cn2">Send</button></div></div></div>`,
  desc:'Choosing a thread moves the selection plate with lagging edges, the leading edge going first. The thread pane exits, then the next thread enters from the direction of its place in the list. Then the unread dot shrinks away and the count rolls down. Compose slides a sheet over the thread pane. Send closes it first, then a new row opens at the top. Under 520px the list and thread become one column and the thread slides in from the right behind a Back button.',
  api:'plate.go(row)   pane.to(id, dir)   dot.set(0, t+.08)   count.roll(-1, t+.18)   sheet.x.set(open ? 0 : 1)   close sheet; row.h.set(1, t+EXIT)',
  init(st){
    const RH = 46, ib = $(st,'.ib'), ls = $(st,'.ls'), lc = $(st,'.lc'), rs = $(st,'.rs'), pl = $(st,'.pl'), pn = $(st,'.pn'), pb = $(st,'.pb'), pcs = $(st,'.pcs'), cs = $(st,'.cs');
    const cb = $(st,'.cb'), bk = $(st,'.bk'), cnEl = $(st,'.cn'), ctWrap = $(st,'[role=status]'), tof = $(st,'#inbox-to'), sjf = $(st,'#inbox-subject'), bf = $(st,'#inbox-body');
    const DATA = [
      { id:'a', from:'Maya Okafor', subj:'Agenda for Thursday’s session', pv:'Item 4 moved up and public comment opens the meeting.', time:'9:41', unread:true, paras:['Item 4, the water rate vote, moved ahead of the budget amendments after the clerk’s revision. Public comment now opens the meeting.','Can you confirm the three speakers who signed up by Monday? I will send the final packet to the board tonight.'] },
      { id:'b', from:'Theo Lindqvist', subj:'Re: Budget hearing testimony', pv:'Two minutes is plenty. Lead with the library.', time:'Yesterday', unread:false, paras:['Two minutes is plenty. Lead with the library hours, because that is the cut people have already heard about.','Bring one number and one name. Say what the budget line was last year and who in the room can restore it.'] },
      { id:'c', from:'County Clerk', subj:'Records request 2291 fulfilled', pv:'Fourteen files are attached, 212 pages in total.', time:'Mon', unread:true, paras:['Your request for the 2024 vendor payment ledger has been fulfilled. Fourteen files are attached, 212 pages in total.','Two pages were withheld under the personnel exemption. The log of redactions is the last file in the set.'] },
      { id:'d', from:'Priya Raman', subj:'Volunteer shifts for the voter drive', pv:'Saturday still needs two people at the library table.', time:'Mon', unread:true, paras:['Saturday still needs two people at the library table, ten to noon. Everything else is covered through the weekend.','Training takes fifteen minutes before your shift. Bring a photo ID so the registrar can sign you in.'] },
      { id:'e', from:'Ben Alvarez', subj:'Photos from the town hall', pv:'I picked the eleven where people are speaking.', time:'Sun', unread:false, paras:['I picked the eleven where people are speaking and cropped nothing, so you can decide how tight to go.','The two with the sign-up sheet are in the last folder. Faces are releasable, the signed forms are attached.'] }
    ];
    const rows = [], cnt = new Digits(cnEl, 2), q = [], sw = new Swap('b'), panes = {}, pA = new Track(0), pB = new Track(0), nv = new Track(0), cv = new Track(0);
    let unread = 0, selR = null, dir = 1, opened = false, composing = false, narrow = false, lastW = -1, nid = 0, LW = 0;
    const shift = (tr, d, t) => { tr.ev.push({ t, x0:d, v0:0, cfg:S.base }); if (tr.ev.length > 12) tr.prune(t); };
    const mkPane = d => { const p = vwEl('div', 'position:absolute;left:0;right:0;top:0;bottom:0;padding:16px 20px;overflow:hidden');
      p.appendChild(vwEl('b', 'display:block;font-size:17px;letter-spacing:-.01em;line-height:1.3', d.subj)); p.appendChild(vwEl('div', 'margin:3px 0 12px;font-size:13px;color:var(--muted)', d.sent ? `You to ${d.to} · just now` : `${d.from} · ${d.time}`));
      d.paras.forEach(s => p.appendChild(vwEl('p', 'margin:0 0 9px;font-size:13.5px;line-height:1.5;max-width:60ch', s))); pcs.appendChild(p); return p; };
    const addRow = (d, instant, t0) => {
      const w = vwEl('div', `position:relative;z-index:1;overflow:hidden;height:${RH}px`);
      w.innerHTML = `<button type="button" class="in" style="position:relative;display:block;width:calc(100% - 12px);margin:0 6px;height:${RH}px;border:0;background:none;border-radius:8px;text-align:left;padding:6px 10px 6px 24px;cursor:pointer;outline-offset:-2px;line-height:1.3;color:var(--ink)"><i class="dt" style="position:absolute;left:9px;top:19px;width:8px;height:8px;border-radius:50%;background:var(--accent)"></i><span class="row" style="justify-content:space-between;gap:8px"><span class="nm" style="font-size:13px;font-weight:600;${vwEllipsis}"></span><span class="tm num" style="font-size:12px;color:var(--faint);flex:none"></span></span><span style="display:block;font-size:12.5px;${vwEllipsis}"><span class="sj" style="font-weight:500"></span><span class="pv" style="color:var(--muted)"></span></span></button>`;
      $(w,'.nm').textContent = d.from; $(w,'.tm').textContent = d.time; $(w,'.sj').textContent = d.subj; $(w,'.pv').textContent = ' · ' + d.pv;
      const r = { id:d.id, d, w, in:$(w,'.in'), dot:$(w,'.dt'), nm:$(w,'.nm'), dotT:new Track(d.unread ? 1 : 0), h:new Track(instant ? 1 : 0), o:new Track(instant ? 1 : 0), pane:mkPane(d), dead:false, added:!instant };
      r.in.setAttribute('aria-label', `${d.unread ? 'Unread. ' : ''}${d.from}, ${d.subj}`); r.in.onclick = () => choose(r, true);
      if (!instant){ r.h.set(1, S.base, t0); r.o.set(1, S.base, t0 + .05); rs.insertBefore(w, rs.children[1]); rows.unshift(r); lc.scrollTop = 0; } else { rs.appendChild(w); rows.push(r); }
      if (d.unread) unread++; panes[d.id] = r; return r; };
    DATA.forEach(d => addRow(d, true)); selR = rows[1]; cnt.set(String(unread), true);
    const live = () => rows.filter(r => !r.dead);
    const setInert = () => { ls.inert = narrow && opened; pn.inert = narrow && !opened; cs.inert = !composing; };
    const setCount = (n, d) => { cnt.dir = d; cnt.set(String(n)); ctWrap.setAttribute('aria-label', n + ' unread'); };
    function choose(r, open, t = now()){
      if (r !== selR){
        const L = live(), dd = Math.sign(L.indexOf(r) - L.indexOf(selR)) || 1, o = selR, ot = o.w.offsetTop, ob = ot + o.w.offsetHeight, nt = r.w.offsetTop, nb = nt + r.w.offsetHeight;
        // plate stays attached to its row, so a re-select is an offset that decays; the leading edge goes first
        if (nt >= ot){ shift(pB, ob - nb, t); shift(pA, ot - nt, t + LAG); } else { shift(pA, ot - nt, t); shift(pB, ob - nb, t + LAG); }
        dir = dd; selR = r;
        if (narrow && !opened){ sw.cur = r.id; sw.prev = null; sw.t = -9; } else sw.to(r.id, t);
        if (r.d.unread){ r.d.unread = false; unread--; r.dotT.set(0, S.base, t + .08); q.push([t + .18, () => setCount(unread, -1)]); }
      }
      if (open && narrow && !opened){ opened = true; nv.set(1); setInert(); setTimeout(() => bk.focus(), 0); }
    }
    const backToList = () => { if (!opened) return; opened = false; nv.set(0); setInert(); setTimeout(() => selR.in.focus({ preventScroll:true }), 0); };
    const openCompose = () => { composing = true; cv.set(1); setInert(); setTimeout(() => tof.focus(), 0); };
    const closeCompose = () => { composing = false; cv.set(0, S.snap); setInert(); cb.focus({ preventScroll:true }); };
    cb.onclick = openCompose; $(cs,'.cc').onclick = closeCompose; bk.onclick = backToList;
    $(cs,'.cn2').onclick = () => {
      const to = tof.value.trim() || 'Maya Okafor', sj = sjf.value.trim() || '(no subject)', body = bf.value.trim() || '(no message)', t = now();
      closeCompose();                                          // sheet leaves first, then the row opens at the top
      addRow({ id:'n' + (++nid), from:'To: ' + to, to, subj:sj, pv:body.slice(0, 70), time:'Now', unread:false, sent:true, paras:[body] }, false, t + EXIT);
    };
    $(st,'.ibr').onclick = () => { const t = now();
      rows.filter(r => r.added && !r.dead).forEach(r => { r.dead = true; r.h.set(0, S.base, t); r.o.set(0, S.snap, t); });
      DATA.forEach(d => { const r = panes[d.id]; if (!r.d.unread && (d.id === 'a' || d.id === 'c' || d.id === 'd')){ r.d.unread = true; r.dotT.set(1, S.base, t + .1); } });
      choose(panes.b, false, t); if (opened) backToList(); if (composing) closeCompose();
      q.push([t + .2, () => { unread = 3; setCount(3, 1); }]); unread = 3; };
    st.addEventListener('keydown', e => {
      if (e.key === 'Escape'){ if (composing){ e.preventDefault(); closeCompose(); } else if (narrow && opened){ e.preventDefault(); backToList(); } return; }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && ls.contains(document.activeElement) && document.activeElement.classList.contains('in')){
        const L = live(), i = L.findIndex(r => r.in === document.activeElement), n = L[i + (e.key === 'ArrowDown' ? 1 : -1)]; if (n){ e.preventDefault(); n.in.focus(); } } });
    const layout = W => { lastW = W; const fw = W - 24; narrow = W < 520; LW = narrow ? fw : clamp(Math.floor(fw*.34), 240, 320);
      ls.style.width = px(LW); pn.style.left = px(narrow ? 0 : LW); pn.style.width = px(narrow ? fw : fw - LW); cs.style.left = px(narrow ? 0 : LW); cs.style.width = px(narrow ? fw : fw - LW);
      pb.style.display = narrow ? 'flex' : 'none'; pcs.style.top = narrow ? '44px' : '0'; setInert(); };
    layout(st.clientWidth);
    return t => {
      if (st.clientWidth !== lastW) layout(st.clientWidth);
      while (q.length && q[0][0] <= t) q.shift()[1]();
      rows.forEach(r => { r.w.style.height = px(clamp(r.h.at(t))*RH); fade(r.in, r.o.at(t), null); const d = clamp(r.dotT.at(t));
        r.dot.style.transform = `scale(${d.toFixed(3)})`; r.dot.style.opacity = d.toFixed(3); r.nm.style.color = mix(d, 'var(--ink)', 'var(--muted)'); });
      for (let i = rows.length - 1; i >= 0; i--) if (rows[i].dead && rows[i].h.at(t) < .01){ rows[i].w.remove(); rows[i].pane.remove(); delete panes[rows[i].id]; rows.splice(i, 1); }
      const top = selR.w.offsetTop, bot = top + selR.w.offsetHeight; plate(pl, top + pA.at(t), bot + pB.at(t));
      Object.values(panes).forEach(r => sw.apply(r.pane, r.id, t, 14*dir));
      const nvv = clamp(nv.at(t)); pn.style.transform = narrow ? `translateX(${((1 - nvv)*100).toFixed(2)}%)` : 'none';
      const c = clamp(cv.at(t)); cs.style.transform = `translateX(${((1 - c)*100).toFixed(2)}%)`; cs.style.opacity = clamp(c*2).toFixed(3); cs.style.visibility = c < .005 ? 'hidden' : 'visible';
      cnt.render(t); };
  }});

/* ================================================================ 3. Page transitions */
atom({ id:'pagetransition', cat:'Views', name:'Page transitions', block:'site-header, nav-menu, section', fam:['E','S','M'], wide:true, tall:true,
  html:`<div class="seg ptm" role="group" aria-label="Transition mode" style="position:absolute;top:8px;left:50%;transform:translateX(-50%)"><div class="ind"></div><button type="button">Cross-fade</button><button type="button">Slide</button></div><div class="site card" style="position:absolute;left:12px;right:12px;top:46px;bottom:12px;overflow:hidden"><header class="hd" style="position:absolute;left:0;right:0;top:0;height:48px;padding:0 12px 0 16px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:2;background:var(--card)"><b style="font-size:15px;letter-spacing:-.02em">Fieldnotes</b><nav class="nv" aria-label="Site" style="position:relative;display:flex;gap:2px"><i class="ul" style="position:absolute;bottom:4px;left:0;height:2px;border-radius:1px;background:var(--ink)"></i></nav></header><div class="bd" style="position:absolute;left:0;right:0;top:48px;bottom:0;overflow:hidden"></div></div>`,
  desc:'The header never moves. The underline slides to the new link with lagging edges. The outgoing page exits on the Swap rule, 100ms ease-in with a small blur, and only then do the incoming heading, paragraph and image enter 50ms apart. Cross-fade only fades. Slide also travels 28px, toward the side the link sits on in the nav.',
  api:'underline.go(l, r)   out.exit(EXIT)   in.parts[h,p,img].set(1, t+EXIT+i*.05)   mode: fade | slide(dir = sign(next - prev))',
  init(st){
    const seg = $(st,'.ptm'), sind = $(seg,'.ind'), sbtn = $$(seg,'button'), site = $(st,'.site'), nvEl = $(st,'.nv'), ul = $(st,'.ul'), bd = $(st,'.bd');
    const PG = [
      { nav:'Stories', h:'Stories from the county line', p:'Eleven reporters cover one county. This week: the water board vote, a school bus route that quietly disappeared, and the clerk’s growing backlog.', c:['var(--accent)','var(--card)',[[118,34,16],'0 84 46 54 84 74 128 46 160 62']] },
      { nav:'Method', h:'How we check a claim', p:'Every number links to its source and every quote is recorded. When we are wrong, the correction goes above the story, not underneath it.', c:['var(--ink)','var(--card)',[[44,30,11],'0 72 40 50 78 68 122 40 160 60']] },
      { nav:'About', h:'Eleven people, one county', p:'We are paid for by 4,200 members and no ads. The newsroom sits above the hardware store on Main Street, and the door is usually open.', c:['var(--raised)','var(--accent)',[[104,28,18],'0 86 52 58 92 78 132 54 160 68']] }
    ];
    const art = ([bg, fg, [[cx,cy,r], pts]]) => { const n = pts.split(' ').map(Number); let d = `M${n[0]} ${n[1]}`; for (let i = 2; i < n.length; i += 2) d += ` L${n[i]} ${n[i+1]}`; d += ' L160 100 L0 100Z';
      return `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%;display:block" aria-hidden="true"><rect width="160" height="100" fill="${bg}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fg}" opacity=".5"/><path d="${d}" fill="${fg}" opacity=".3"/></svg>`; };
    const links = PG.map((P, i) => { const a = vwEl('a', 'position:relative;padding:8px 10px;font-size:13.5px;font-weight:500;text-decoration:none', P.nav); a.href = '#' + P.nav.toLowerCase(); nvEl.insertBefore(a, ul); return a; });
    const pages = PG.map(P => { const el = vwEl('div', 'position:absolute;inset:0;padding:16px 20px;display:flex;gap:16px;flex-direction:column');
      el.innerHTML = `<div class="tc" style="display:flex;flex-direction:column;gap:8px;min-width:0;justify-content:center;flex:none"><h2 class="h" style="margin:0;font-size:22px;line-height:1.2;letter-spacing:-.025em;font-weight:600"></h2><p class="p" style="margin:0;font-size:13.5px;line-height:1.5;color:var(--muted);max-width:52ch"></p></div><div class="im" style="position:relative;flex:1;min-height:0;border-radius:10px;overflow:hidden;background:var(--raised)">${art(P.c)}</div>`;
      $(el,'.h').textContent = P.h; $(el,'.p').textContent = P.p; bd.appendChild(el);
      return { el, parts:[$(el,'.h'), $(el,'.p'), $(el,'.im')], tc:$(el,'.tc'), im:$(el,'.im'), T:[new Track(0), new Track(0), new Track(0)], dir:1 }; });
    const ue = edges(0, 0), se = edges(0, 0), lc = links.map(() => new Track(0, S.base)), ex = new Map(); let cur = 0, mode = 0, lastW = -1;
    const geo = i => [links[i].offsetLeft + 10, links[i].offsetLeft + links[i].offsetWidth - 10];
    const layout = () => { const row = site.clientWidth >= 560; lastW = st.clientWidth;
      pages.forEach(p => { p.el.style.flexDirection = row ? 'row' : 'column'; p.el.style.gap = row ? '24px' : '14px'; p.tc.style.flex = row ? '1 1 0' : 'none'; p.im.style.flex = row ? '0 0 42%' : '1'; });
      const [l, r] = geo(cur); ue.jump(l, r); const b = sbtn[mode]; se.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth); };
    const mark = () => links.forEach((a, i) => { i === cur ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
    links.forEach((a, i) => a.onclick = e => { e.preventDefault(); go(i); });
    function go(i){
      if (i === cur) return; const t = now(), d = i > cur ? 1 : -1, pg = pages[i];
      ex.set(cur, { t0:t, dir:d }); ex.delete(i); pg.dir = d;                            // outgoing page exits on the Swap clock
      pg.T.forEach((tr, k) => { tr.jump(0); tr.set(1, S.base, t + EXIT + k*.05); });     // heading, paragraph, image: 50ms apart, after the exit
      lc[cur].set(0); lc[i].set(1); const [l, r] = geo(i); ue.go(l, r); cur = i; mark();
    }
    const pickMode = (i, inst) => { mode = i; sbtn.forEach((b, j) => b.setAttribute('aria-pressed', i === j)); const b = sbtn[i]; inst ? se.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : se.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); };
    sbtn.forEach((b, i) => b.onclick = () => pickMode(i));
    pages.forEach((p, i) => p.T.forEach(tr => tr.jump(i === 0 ? 1 : 0))); lc[0].jump(1); mark(); pickMode(0, true);
    const init = () => { layout(); pickMode(mode, true); }; document.fonts.ready.then(init); requestAnimationFrame(init);
    return t => {
      if (st.clientWidth !== lastW) layout();
      const slide = mode === 1, AMP = 28;
      { const a = se.A.at(t), b = se.B.at(t); sind.style.transform = `translateX(${px(a)})`; sind.style.width = px(b - a); sind.style.height = 'calc(100% - 6px)'; sind.style.top = '3px'; }
      { const a = ue.A.at(t), b = ue.B.at(t); ul.style.transform = `translateX(${px(a)})`; ul.style.width = px(Math.max(0, b - a)); }
      links.forEach((a, i) => a.style.color = mix(clamp(lc[i].at(t)), 'var(--ink)', 'var(--muted)'));
      pages.forEach((pg, i) => {
        let show = i === cur, q = 1, dx = 0, bl = 0; const x = ex.get(i);
        if (x){ const p = clamp((t - x.t0)/EXIT), e = p*p; if (p >= 1){ ex.delete(i); show = false; } else { show = true; q = 1 - e; bl = e*BLUR; dx = slide ? -x.dir*e*AMP : 0; } }
        const s = pg.el.style; s.visibility = show ? 'visible' : 'hidden'; s.opacity = q.toFixed(3); s.filter = bl > .05 ? `blur(${bl.toFixed(2)}px)` : 'none'; s.transform = `translateX(${px(dx)})`; s.pointerEvents = i === cur ? 'auto' : 'none';
        pg.parts.forEach((el, k) => { const o = clamp(pg.T[k].at(t)), mx = slide ? pg.dir*(1 - o)*AMP : 0, my = slide ? 0 : (1 - o)*8;
          el.style.opacity = o.toFixed(3); el.style.filter = o < .98 ? `blur(${((1 - o)*BLUR).toFixed(2)}px)` : 'none'; el.style.transform = `translate(${px(mx)},${px(my)})`; });
      });
    };
  }});
}