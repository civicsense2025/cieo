
// Comment recipes: threads, reactions, voice replies and link previews. All content is local and simulated.
const CM_EL = (tag, css, html) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; };
const CM_FMT = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const CM_AV = (name, size, hue) => `<span aria-hidden="true" style="flex:none;width:${size}px;height:${size}px;border-radius:50%;display:grid;place-items:center;background:${hue};color:var(--card);font:600 ${Math.round(size*.42)}px var(--sans)">${name[0].toUpperCase()}</span>`;
const CM_ICON = {
  heart:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="fill" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  chat:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.1A8 8 0 1 1 20 12z"/></svg>',
  repost:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4"/></svg>',
  send:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z"/></svg>',
  mic:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  x:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  stop:'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>',
  play:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>',
  pause:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
  smile:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/></svg>',
};
const CM_BTN = 'border:0;border-radius:50%;width:44px;height:44px;flex:none;display:grid;place-items:center;cursor:pointer;padding:0;';
const CM_LEVEL = t => clamp(.1 + .62*Math.abs(Math.sin(t*5.3))*(.55 + .45*Math.sin(t*1.7 + 1)) + .18*Math.abs(Math.sin(t*13.1)), 0, 1);

atom({ id:'comments-thread', cat:'Comments', name:'Threaded replies', block:'comments, thread, replies', fam:['M','S','E'], tall:true,
  html:`<div class="card ct-card" style="width:min(340px,94%);max-height:310px;overflow:auto;padding:12px 12px 4px"><div class="ct-post"></div><div class="ct-list"></div></div><div class="hint">Like and repost roll their counts. View more opens the rest of the thread on a height spring</div>`,
  desc:'A post with a rail that runs from the parent avatar and curves into each reply. The like and repost counts roll digit by digit, and View 3 more replies opens the nested replies on a height spring while the rail grows with them.',
  api:'rail = connector(border-left + radius) per reply   more.h.set(measure(inner))   count.set(n ± 1) → Digits',
  init(st){
    const card = $(st,'.ct-card'), post = $(st,'.ct-post'), list = $(st,'.ct-list');
    const LINE = 'background:var(--line)', ROW = 'position:relative;display:grid;gap:8px;padding-bottom:10px';
    const reply = (name, hue, when, text, last) => `<div class="ct-r" style="${ROW};grid-template-columns:28px 1fr;margin-left:46px"><i style="position:absolute;left:-29px;top:-10px;width:27px;height:24px;border-left:2px solid var(--line);border-bottom:2px solid var(--line);border-bottom-left-radius:14px;box-sizing:border-box"></i>${last ? '' : `<i style="position:absolute;left:-29px;top:12px;bottom:-10px;width:2px;${LINE}"></i>`}${CM_AV(name, 28, hue)}<div style="min-width:0"><div style="font-size:13px;line-height:20px"><b style="font-weight:600">${name}</b> <span class="muted">· ${when}</span></div><div style="font-size:14px;line-height:1.4">${text}</div></div></div>`;
    post.innerHTML = `<div style="${ROW};grid-template-columns:36px 1fr;padding-bottom:6px"><div style="position:relative">${CM_AV('ginandtanic', 36, 'var(--accent)')}<i style="position:absolute;left:17px;top:42px;bottom:-6px;width:2px;${LINE}"></i></div><div style="min-width:0"><div style="font-size:13px;line-height:20px;display:flex;align-items:center;gap:4px;flex-wrap:wrap"><b style="font-weight:600">ginandtanic</b><svg width="14" height="14" viewBox="0 0 24 24" aria-label="Verified" role="img"><circle cx="12" cy="12" r="11" fill="var(--accent)"/><path d="M7 12.5l3.4 3.4L17 9" fill="none" stroke="var(--card)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="muted">› midterms 2026 · 1d</span></div><div style="font-size:14px;line-height:1.45;margin-top:2px">Early voting turnout in the county is already past 2022 totals. Worth a look before polls open.</div><div class="ct-acts" style="display:flex;align-items:center;margin:0 -10px"><button class="ct-like" aria-pressed="false" aria-label="Like, 164" style="display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 10px;border:0;background:none;color:var(--ink);cursor:pointer;font-size:13px">${CM_ICON.heart}<span class="ct-ln num"></span></button><button class="ct-cmt" aria-label="Replies, 2" style="display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 10px;border:0;background:none;color:var(--ink);cursor:pointer;font-size:13px">${CM_ICON.chat}<span class="ct-cn num"></span></button><button class="ct-rep" aria-pressed="false" aria-label="Repost, 6" style="display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 10px;border:0;background:none;color:var(--ink);cursor:pointer;font-size:13px">${CM_ICON.repost}<span class="ct-rn num"></span></button><button class="ct-send" aria-label="Copy link" style="display:inline-flex;align-items:center;min-height:44px;padding:0 10px;border:0;background:none;color:var(--ink);cursor:pointer">${CM_ICON.send}</button><span class="ct-say small muted" role="status" style="position:relative;display:block;flex:1;min-width:0;height:20px"></span></div></div></div>`;
    list.innerHTML = reply('mara.k', 'var(--success)', '22h', 'Same here, lines wrapped past the block at 7am.') + reply('theo_p', 'var(--warning)', '20h', 'Sharing this in the neighbourhood thread.') +
      `<div class="ct-vm" style="position:relative;margin-left:46px"><i style="position:absolute;left:-29px;top:-10px;width:27px;height:34px;border-left:2px solid var(--line);border-bottom:2px solid var(--line);border-bottom-left-radius:14px;box-sizing:border-box"></i><div class="ct-vmc" style="height:100%;overflow:hidden"><button class="ct-more" aria-expanded="false" style="display:flex;align-items:center;gap:8px;min-height:44px;padding:0;border:0;background:none;color:var(--muted);font-size:13px;cursor:pointer;margin-left:4px"><span style="display:flex;margin-right:2px">${['var(--accent)','var(--danger)','var(--ink)'].map((h,i) => `<span style="margin-left:${i ? -6 : 0}px;box-shadow:0 0 0 2px var(--card);border-radius:50%;display:flex">${CM_AV('abc'[i], 18, h)}</span>`).join('')}</span>View 3 more replies</button></div></div>` +
      `<div class="ct-more-box" style="overflow:hidden;height:0;visibility:hidden"><div class="ct-in">${reply('sol.n', 'var(--danger)', '18h', 'Polls near the library were quick this morning.')}${reply('ines.d', 'var(--accent)', '16h', 'Did anyone check the county site for wait times?')}${reply('ravi', 'var(--muted)', '12h', 'Yes, it updates every fifteen minutes.', true)}</div></div>`;
    const ctLike = $(st,'button.ct-like');
    const ctCmt = $(st,'button.ct-cmt');
    const ctRep = $(st,'button.ct-rep');
    const ctSend = $(st,'button.ct-send');
    const ctMore = $(st,'button.ct-more');
    const ln = new Digits($(st,'.ct-ln'), 3), cn = new Digits($(st,'.ct-cn'), 2), rn = new Digits($(st,'.ct-rn'), 2); ln.set('164', true); cn.set('2', true); rn.set('6', true);
    const heartFill = $(ctLike,'.fill'), repIcon = $(ctRep,'svg'), say = $(st,'.ct-say'), vm = $(st,'.ct-vm'), box = $(st,'.ct-more-box'), inner = $(st,'.ct-in');
    const sayEl = ['', 'Link copied'].map(s => { const e = CM_EL('span', 'position:absolute;left:4px;top:0;font-size:12px;line-height:20px', s); say.appendChild(e); return e; }); const ssw = new Swap(0);
    const pop = { w:24, z:.45 }, hs = new Track(1, S.snap), rs = new Track(1, S.snap), mh = new Track(0, S.base), vh = new Track(44, S.base), vo = new Track(1, S.base);
    let liked = false, reposted = false, open = false, copyAt = 0;
    ctLike.onclick = () => { liked = !liked; ln.set(String(164 + (liked ? 1 : 0)), REDUCE); ctLike.setAttribute('aria-pressed', String(liked)); ctLike.setAttribute('aria-label', `Like, ${164 + (liked ? 1 : 0)}`); if (REDUCE) hs.jump(1); else { hs.jump(.7); hs.set(1, pop); } ctLike.style.color = liked ? 'var(--danger)' : 'var(--ink)'; heartFill.setAttribute('fill', liked ? 'currentColor' : 'none'); };
    ctRep.onclick = () => { reposted = !reposted; rn.set(String(6 + (reposted ? 1 : 0)), REDUCE); ctRep.setAttribute('aria-pressed', String(reposted)); ctRep.setAttribute('aria-label', `Repost, ${6 + (reposted ? 1 : 0)}`); if (REDUCE) rs.jump(1); else { rs.jump(.7); rs.set(1, pop); } ctRep.style.color = reposted ? 'var(--success)' : 'var(--ink)'; };
    ctSend.onclick = () => { ssw.to(1); copyAt = now() + 1.6; };
    const expand = () => { if (open) return; open = true; ctMore.setAttribute('aria-expanded', 'true'); box.style.visibility = 'visible'; const H = inner.offsetHeight;
      if (REDUCE){ mh.jump(H); vh.jump(0); vo.jump(0); } else { mh.set(H, S.soft); vh.set(0, S.soft); vo.set(0, S.snap); } };
    ctMore.onclick = expand; ctCmt.onclick = () => { expand(); if (!REDUCE) box.scrollIntoView({ block:'nearest', behavior:'smooth' }); };
    return t => { if (copyAt && t >= copyAt){ copyAt = 0; ssw.to(0); }
      ln.render(t); cn.render(t); rn.render(t); sayEl.forEach((e,i) => ssw.apply(e, i, t));
      heartFill.parentNode.style.transform = `scale(${hs.at(t).toFixed(3)})`; repIcon.style.transform = `scale(${rs.at(t).toFixed(3)})`;
      box.style.height = px(Math.max(0, mh.at(t))); vm.style.height = open ? px(Math.max(0, vh.at(t))) : ''; vm.style.opacity = clamp(vo.at(t)).toFixed(3); if (open && vh.at(t) < 1){ vm.style.visibility = 'hidden'; } };
  }});

atom({ id:'comments-reactions', cat:'Comments', name:'Reaction picker', block:'comments, reactions, emoji', fam:['M','S','X'], tall:true,
  html:`<div class="card rp-card" style="position:relative;width:min(340px,94%);padding:12px;display:flex;flex-direction:column;gap:6px"><div class="row" style="align-items:flex-start;gap:10px"><span aria-hidden="true" style="flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:var(--success);color:var(--card);font:600 13px var(--sans)">M</span><div style="min-width:0"><div style="font-size:13px;line-height:20px"><b style="font-weight:600">mara.k</b> <span class="muted">· 4m</span></div><div style="font-size:14px;line-height:1.45">Pushed the fix. Can you try it on staging?</div></div></div><div class="row" style="gap:6px;flex-wrap:wrap;padding-left:42px"><button class="rp-open" aria-haspopup="true" aria-expanded="false" aria-label="Add a reaction" style="${CM_BTN}background:var(--raised);color:var(--ink)">${CM_ICON.smile}</button><span class="rp-chips" style="display:contents"></span></div><div class="rp-pick" role="group" aria-label="Choose a reaction" style="position:absolute;left:46px;bottom:66px;display:flex;gap:0;padding:4px;border-radius:999px;background:var(--card);box-shadow:var(--float-shadow, var(--shadow));transform-origin:0% 100%;visibility:hidden"></div></div><div class="hint">Click or press and hold the smile to open the row. Arrow keys move, Enter picks, Escape closes</div>`,
  desc:'The picker row rises staggered from the smile button. The chosen emoji flies to its summary chip on a spring and the count rolls when it lands; picking again, or tapping your own chip, takes the reaction back.',
  api:'pick[i].{y,o}.set(0,1, base, t0 + i·0.04)   fly.{x,y}.set(chip.center)   on land: count.set(n ± 1)',
  init(st){
    const E = ['👍','❤️','😂','🎉','👀','🙏'], NAMES = ['thumbs up','heart','laughing','party','eyes','thanks'], card = $(st,'.rp-card'), pick = $(st,'.rp-pick'), chipsEl = $(st,'.rp-chips');
    const rpOpen = $(st,'button.rp-open');
    const counts = [3, 2, 0, 1, 0, 0], digits = [];
    function mkPick(e, i){ const rpPick = CM_EL('button', 'width:44px;height:44px;border:0;border-radius:50%;background:none;font-size:22px;line-height:1;cursor:pointer;padding:0', e); rpPick.type = 'button'; rpPick.setAttribute('aria-label', `React ${NAMES[i]}`); rpPick.setAttribute('aria-pressed', 'false'); rpPick.onclick = () => toggleMine(i, rpPick); pick.appendChild(rpPick); return { el:rpPick, y:new Track(16, S.base), o:new Track(0, S.base) }; }
    const picks = E.map(mkPick);
    function mkChip(e, i){ const rpChip = CM_EL('button', 'min-height:44px;border:0;background:none;padding:0;cursor:pointer;color:var(--ink);font-size:13px;position:relative', `<span class="in" style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;background:var(--raised);box-shadow:0 0 0 1.5px transparent"><span aria-hidden="true" style="font-size:15px">${e}</span><span class="num"></span></span>`); rpChip.type = 'button'; rpChip.onclick = () => toggleMine(i, rpChip); chipsEl.appendChild(rpChip);
      const d = new Digits($(rpChip,'.num'), 2); d.set(String(counts[i]), true); digits.push(d); return { el:rpChip, inn:$(rpChip,'.in'), o:new Track(counts[i] ? 1 : 0, S.snap), sc:new Track(1, S.snap) }; }
    const chips = E.map(mkChip);
    const pop = { w:24, z:.45 }, shell = new Track(0, S.base), flies = [], q = [];
    let isOpen = false, mine = -1, hold = 0, held = false;
    const sync = () => chips.forEach((c,i) => { const on = counts[i] > 0; c.el.hidden = !on && c.o.target === 0 && !c.pend; c.el.setAttribute('aria-pressed', String(mine === i)); c.el.setAttribute('aria-label', `${E[i]} ${NAMES[i]}, ${counts[i]}${mine === i ? ', you reacted' : ''}`); c.inn.style.boxShadow = mine === i ? '0 0 0 1.5px var(--accent)' : '0 0 0 1.5px transparent'; c.inn.style.background = mine === i ? 'color-mix(in oklab, var(--accent) 14%, var(--raised))' : 'var(--raised)'; });
    const setOpen = (on, byKey) => { if (on === isOpen) return; isOpen = on; rpOpen.setAttribute('aria-expanded', String(on)); const t = now();
      if (on){ pick.style.visibility = 'visible'; picks.forEach((p,i) => { p.y.jump(REDUCE ? 0 : 16); p.o.jump(REDUCE ? 1 : 0); if (!REDUCE){ p.y.set(0, S.base, t + i*.04); p.o.set(1, S.base, t + i*.04); } }); if (REDUCE) shell.jump(1); else shell.set(1, S.base, t); if (byKey) picks[Math.max(0, mine)].el.focus({ preventScroll:true }); }
      else { if (REDUCE){ shell.jump(0); picks.forEach(p => p.o.jump(0)); } else { shell.set(0, S.snap, t); picks.forEach(p => p.o.set(0, S.snap, t)); } } };
    const change = (i, delta, t) => { counts[i] = Math.max(0, counts[i] + delta); digits[i].set(String(counts[i]), REDUCE); const c = chips[i]; c.pend = false; if (counts[i] > 0){ c.el.hidden = false; c.o.set(1, S.snap, t); } else c.o.set(0, S.snap, t); if (!REDUCE && delta > 0){ c.sc.jump(.8); c.sc.set(1, pop, t); } sync(); };
    const toggleMine = (i, from) => { const t = now(); const cardR = card.getBoundingClientRect();
      if (mine === i){ mine = -1; change(i, -1, t); picks.forEach((p,k) => p.el.setAttribute('aria-pressed', 'false')); return; }
      const prev = mine; mine = i; picks.forEach((p,k) => p.el.setAttribute('aria-pressed', String(k === i)));
      if (prev >= 0) change(prev, -1, t);
      const c = chips[i]; c.pend = true; c.el.hidden = false; c.o.jump(counts[i] > 0 ? 1 : 0); sync();
      const cr = c.inn.getBoundingClientRect(), sr = from.getBoundingClientRect(), f = CM_EL('span', 'position:absolute;left:0;top:0;font-size:22px;line-height:1;pointer-events:none;will-change:transform', E[i]); card.appendChild(f);
      const sx = sr.left - cardR.left + sr.width/2 - 11, sy = sr.top - cardR.top + sr.height/2 - 11, ex = cr.left - cardR.left + 10, ey = cr.top - cardR.top + cr.height/2 - 11;
      if (REDUCE){ f.remove(); change(i, 1, t); return; }
      const fl = { f, x:new Track(sx, S.soft), y:new Track(sy, S.soft), s:new Track(1.35, S.soft) }; fl.x.jump(sx); fl.y.jump(sy); fl.x.set(ex, S.soft, t); fl.y.set(ey, S.soft, t); fl.s.jump(1.35); fl.s.set(1, S.soft, t); flies.push(fl);
      q.push([t + .5, () => { f.remove(); flies.splice(flies.indexOf(fl), 1); change(i, 1, now()); }]); setOpen(false); };
    rpOpen.onclick = () => { if (held){ held = false; return; } setOpen(!isOpen, false); };
    rpOpen.onpointerdown = () => { clearTimeout(hold); hold = setTimeout(() => { held = true; setOpen(true, false); }, 420); };
    rpOpen.onpointerup = rpOpen.onpointerleave = () => clearTimeout(hold);
    rpOpen.onkeydown = e => { if (e.key === 'ArrowUp' || e.key === 'ArrowRight'){ e.preventDefault(); setOpen(true, true); } };
    pick.onkeydown = e => { const k = picks.findIndex(p => p.el === document.activeElement); if (e.key === 'Escape'){ setOpen(false); rpOpen.focus({ preventScroll:true }); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){ e.preventDefault(); picks[(k + (e.key === 'ArrowRight' ? 1 : picks.length - 1)) % picks.length].el.focus({ preventScroll:true }); } };
    sync();
    return t => { while (q.length && q[0][0] <= t) q.shift()[1]();
      const s = clamp(shell.at(t)); pick.style.opacity = s.toFixed(3); pick.style.transform = `scale(${(.85 + .15*s).toFixed(3)})`; if (!isOpen && s < .02) pick.style.visibility = 'hidden';
      picks.forEach(p => { fade(p.el, clamp(p.o.at(t)), p.y.at(t), false); });
      chips.forEach(c => { c.el.style.opacity = clamp(c.o.at(t)).toFixed(3); c.inn.style.transform = `scale(${c.sc.at(t).toFixed(3)})`; });
      digits.forEach(d => d.render(t));
      flies.forEach(fl => { fl.f.style.transform = `translate(${px(fl.x.at(t))},${px(fl.y.at(t))}) scale(${fl.s.at(t).toFixed(3)})`; }); };
  }});

atom({ id:'comments-voice-reply', cat:'Comments', name:'Voice reply in a thread', block:'comments, voice, composer', fam:['M','S','X','T'], tall:true,
  html:`<div class="card col" style="width:min(340px,94%);padding:12px;gap:8px"><div class="row" style="align-items:flex-start;gap:10px"><span aria-hidden="true" style="flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:var(--card);font:600 13px var(--sans)">R</span><div style="min-width:0"><div style="font-size:13px;line-height:20px"><b style="font-weight:600">ravi</b> <span class="muted">· 2h</span></div><div style="font-size:14px;line-height:1.4">Does the new release fix the export bug?</div></div></div><div class="vr-list" aria-live="polite" style="display:flex;flex-direction:column;padding-left:42px"></div><div class="vr-comp" style="position:relative;height:52px"><div class="vr-type" style="position:absolute;inset:0;display:flex;align-items:center;gap:6px"><input class="vr-in" autocomplete="off" aria-label="Add to thread" placeholder="Add to thread…" style="flex:1;min-width:0;height:44px;border-radius:22px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);padding:0 14px;font-size:14px"><button class="vr-mic" aria-label="Record a voice reply" style="${CM_BTN}background:var(--raised);color:var(--ink)">${CM_ICON.mic}</button><button class="vr-send" aria-label="Send reply" style="${CM_BTN}background:var(--ink);color:var(--card)">${CM_ICON.send}</button></div><div class="vr-rec" style="position:absolute;inset:0;display:flex;align-items:center;gap:6px;padding:0 4px;border-radius:26px;background:var(--raised)"><button class="vr-cancel" aria-label="Cancel recording" style="${CM_BTN}background:none;color:var(--ink)">${CM_ICON.x}</button><div class="vr-live" aria-hidden="true" style="flex:1;min-width:0;height:32px;display:flex;align-items:center;gap:2px;overflow:hidden"></div><span class="num" role="timer" aria-label="Recording time" style="display:inline-flex;font-size:13px;font-weight:600;flex:none"><span class="vr-m"></span><span>:</span><span class="vr-s"></span></span><button class="vr-stop" aria-label="Stop and add to thread" style="${CM_BTN}background:var(--danger);color:var(--card)">${CM_ICON.stop}</button></div></div></div><div class="hint">Type and press Enter, or tap the mic, record and press Stop. The reply rises into the thread</div>`,
  desc:'The mic in the composer swaps the text field for live level bars and rolling digits. Stop sends the clip into the thread as a new reply that rises in on a height spring and carries its own mini player; typed replies land the same way.',
  api:'composer: swap(type ↔ rec)   reply.{h,y,o}.set(measure, soft)   mini player: fill = (t − t0)/dur',
  init(st){
    const list = $(st,'.vr-list'), inp = $(st,'input.vr-in');
    const vrMic = $(st,'button.vr-mic');
    const vrSend = $(st,'button.vr-send');
    const vrCancel = $(st,'button.vr-cancel');
    const vrStop = $(st,'button.vr-stop');
    const typeEl = $(st,'.vr-type'), recEl = $(st,'.vr-rec'), live = $(st,'.vr-live'), NL = 22, NB = 22;
    const dm = new Digits($(st,'.vr-m'), 1), ds = new Digits($(st,'.vr-s'), 2); dm.set('0', true); ds.set('00', true);
    const lb = [...Array(NL)].map(() => { const b = CM_EL('i', 'flex:1;min-width:2px;border-radius:2px;height:4px;background:var(--danger)'); live.appendChild(b); return b; });
    const sw = new Swap('type'); let rec = false, t0 = 0, hist = Array(NL).fill(0), samples = [], lastS = -1, sec = -1, rows = [], n = 0;
    const row = (inner, who) => { const el = CM_EL('div', 'overflow:hidden;position:relative', `<div class="in" style="display:grid;grid-template-columns:28px 1fr;gap:8px;padding:4px 0 8px">${CM_AV(who, 28, who === 'you' ? 'var(--ink)' : 'var(--success)')}<div style="min-width:0"><div style="font-size:13px;line-height:20px"><b style="font-weight:600">${who}</b> <span class="muted">· now</span></div>${inner}</div></div>`);
      list.appendChild(el); const H = $(el,'.in').offsetHeight; const r = { el, H, h:new Track(REDUCE ? H : 0, S.soft), y:new Track(REDUCE ? 0 : 14, S.soft), o:new Track(REDUCE ? 1 : 0, S.base), gone:false }; if (!REDUCE){ r.h.set(H); r.y.set(0); r.o.set(1, S.base, now() + .08); } el.style.height = px(r.h.at(now())); rows.push(r); trim(); return r; };
    const trim = () => { const live2 = rows.filter(r => !r.gone); if (live2.length > 3){ const old = live2[0]; old.gone = true; old.done = false; old.h.set(0, S.soft); old.o.set(0, S.snap); setTimeout(() => { old.el.remove(); rows = rows.filter(r => r !== old); }, REDUCE ? 60 : 800); } };
    const players = [];
    const voice = (dur, amps) => { const id = ++n, bars = amps.map(a => `<i style="flex:1;min-width:2px;border-radius:2px;height:${(4 + a*20).toFixed(1)}px;background:var(--raised)"></i>`).join('');
      const r = row(`<div class="vr-mp${id}" style="display:flex;align-items:center;gap:8px;margin-top:2px"><button class="vr-pp" aria-label="Play voice reply" style="${CM_BTN}width:44px;height:44px;background:var(--ink);color:var(--card);position:relative"><span class="pl" style="display:grid;place-items:center">${CM_ICON.play}</span><span class="pa" style="position:absolute;display:grid;place-items:center;opacity:0">${CM_ICON.pause}</span></button><div class="wv" aria-hidden="true" style="flex:1;min-width:0;height:28px;display:flex;align-items:center;gap:2px">${bars}</div><span class="num muted" style="font-size:12px;flex:none">${CM_FMT(dur)}</span></div>`, 'you');
      const vrRow = r.el;
      const vrPlay = $(vrRow,'button.vr-pp');
      const ws = [...r.el.querySelectorAll('.wv i')], P = { dur, ws, on:false, p:0, t0:0, pl:$(vrPlay,'.pl'), pa:$(vrPlay,'.pa'), k:new Track(0, S.snap) }; players.push(P);
      vrPlay.onclick = () => { const t = now(); if (!P.on){ if (P.p >= 1) P.p = 0; P.t0 = t - P.p*dur; P.on = true; } else { P.p = clamp((t - P.t0)/dur); P.on = false; } if (REDUCE) P.k.jump(P.on ? 1 : 0); else P.k.set(P.on ? 1 : 0); vrPlay.setAttribute('aria-label', P.on ? 'Pause voice reply' : 'Play voice reply'); }; };
    const esc = v => v.replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
    const text = () => { const v = inp.value.trim(); if (!v) return; row(`<div style="font-size:14px;line-height:1.4;overflow-wrap:anywhere">${esc(v)}</div>`, 'you'); inp.value = ''; };
    vrSend.onclick = text; inp.onkeydown = e => { if (e.key === 'Enter'){ e.preventDefault(); text(); } };
    const startRec = () => { const t = now(); rec = true; t0 = t; hist = Array(NL).fill(0); samples = []; lastS = -1; sec = -1; dm.set('0', true); ds.set('00', true); sw.to('rec', t); vrStop.focus({ preventScroll:true }); };
    const endRec = (keep) => { if (!rec) return; const t = now(), el = Math.max(1, Math.round(t - t0)); rec = false; sw.to('type', t);
      if (keep){ const src = samples.length ? samples : [.4], amps = [...Array(NB)].map((_,i) => { const a = Math.floor(i/NB*src.length), b = Math.max(a + 1, Math.floor((i + 1)/NB*src.length)); return Math.max(...src.slice(a, b)); }), top = Math.max(...amps) || 1; voice(el, amps.map(a => clamp(a/top, .15, 1))); }
      vrMic.focus({ preventScroll:true }); };
    vrMic.onclick = startRec; vrCancel.onclick = () => endRec(false); vrStop.onclick = () => endRec(true);
    recEl.onkeydown = e => { if (e.key === 'Escape') endRec(false); };
    // Seed the thread with one existing reply.
    (() => { const r = row('<div style="font-size:14px;line-height:1.4">Yes, shipped in 2.4. Update and try again.</div>', 'dev'); r.h.jump(r.H); r.y.jump(0); r.o.jump(1); })();
    return t => {
      if (rec){ const el = t - t0, lv = CM_LEVEL(el), s = Math.floor(el*14); if (s !== lastS){ lastS = s; hist.push(lv); hist.shift(); samples.push(lv); }
        const k = Math.floor(el); if (k !== sec){ sec = k; dm.set(String(Math.floor(k/60)), REDUCE); ds.set(String(k % 60).padStart(2,'0'), REDUCE); if (k >= 59) endRec(true); }
        lb.forEach((b,i) => { b.style.height = px(4 + hist[i]*28); }); }
      dm.render(t); ds.render(t); sw.apply(typeEl, 'type', t); sw.apply(recEl, 'rec', t);
      rows.forEach(r => { if (!r.done){ r.el.style.height = px(Math.max(0, r.h.at(t))); if (!r.h.prune(t)){ r.done = true; if (!r.gone) r.el.style.height = ''; } } $(r.el,'.in').style.opacity = clamp(r.o.at(t)).toFixed(3); $(r.el,'.in').style.transform = `translateY(${px(r.y.at(t))})`; });
      players.forEach(P => { if (P.on && t - P.t0 >= P.dur){ P.on = false; P.p = 1; P.k.set(0); } const p = P.on ? clamp((t - P.t0)/P.dur) : P.p, k = clamp(P.k.at(t));
        P.ws.forEach((b,i) => { b.style.background = mix(clamp(p*P.ws.length - i), 'var(--accent)', 'var(--raised)'); }); P.pl.style.opacity = (1 - k).toFixed(3); P.pa.style.opacity = k.toFixed(3); });
    };
  }});

atom({ id:'comments-link-preview', cat:'Comments', name:'Link preview unfurl', block:'comments, link, preview', fam:['M','S','X'],
  html:`<div class="card col" style="width:min(340px,94%);padding:12px;gap:8px"><div class="row" style="gap:6px"><input class="lu-in" type="url" inputmode="url" autocomplete="off" aria-label="Link to share" placeholder="Paste a link…" style="flex:1;min-width:0;height:44px;border-radius:22px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);padding:0 14px;font-size:14px"><button class="lu-paste" style="height:44px;padding:0 14px;border:0;border-radius:22px;background:var(--ink);color:var(--card);font-size:13px;font-weight:500;cursor:pointer;flex:none">Paste link</button></div><div class="lu-box" role="status" aria-live="polite" style="position:relative;overflow:hidden;height:0;border-radius:12px"><div class="lu-sk" aria-hidden="true" style="position:absolute;inset:0;display:flex;gap:10px;background:var(--raised);border-radius:12px;overflow:hidden"><i class="lu-sk-i" style="width:84px;flex:none;background:var(--line)"></i><span style="flex:1;padding:12px 12px 12px 0;display:flex;flex-direction:column;gap:8px;justify-content:center"><i class="lu-sk-i" style="display:block;height:10px;width:40%;border-radius:5px;background:var(--line)"></i><i class="lu-sk-i" style="display:block;height:12px;width:92%;border-radius:6px;background:var(--line)"></i><i class="lu-sk-i" style="display:block;height:12px;width:64%;border-radius:6px;background:var(--line)"></i></span></div><div class="lu-card" style="position:absolute;inset:0;display:flex;gap:10px;background:var(--raised);border-radius:12px;overflow:hidden"><div class="lu-img" style="width:84px;flex:none;overflow:hidden">${scene(true)}</div><div style="flex:1;min-width:0;padding:10px 40px 10px 0;display:flex;flex-direction:column;justify-content:center;gap:4px"><span class="lu-dom small muted" style="font-size:12px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span><b class="lu-title" style="font-size:14px;line-height:1.3;font-weight:600;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden"></b></div><button class="lu-x" aria-label="Remove link preview" style="position:absolute;right:0;top:0;width:44px;height:44px;border:0;background:none;color:var(--muted);cursor:pointer;display:grid;place-items:center">${CM_ICON.x}</button></div></div></div><div class="hint">Paste a link, or tap Paste link. A skeleton holds the space, then the card cross-fades in</div>`,
  desc:'Pasting a URL opens a reserved slot with a pulsing skeleton, then the real card cross-fades in with its image, domain and two-line title. The slot height springs to the card and the remove button collapses it again.',
  api:'url → box.h.set(84)   sk → card via Swap after 1.1s   title = slug(path).titleCase   input change → collapse',
  init(st){
    const inp = $(st,'input.lu-in');
    const luPaste = $(st,'button.lu-paste');
    const luX = $(st,'button.lu-x');
    const box = $(st,'.lu-box'), sk = $(st,'.lu-sk'), card = $(st,'.lu-card'), dom = $(st,'.lu-dom'), title = $(st,'.lu-title'), pulse = [...st.querySelectorAll('.lu-sk-i')];
    const sw = new Swap('none'), h = new Track(0, S.soft), SAMPLE = 'https://www.fieldnotes.example.org/essays/slow-motion-for-fast-interfaces';
    let url = '', readyAt = 0;
    const parse = v => { try { const u = new URL(v.trim()); if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.')) return null; return u; } catch { return null; } };
    const titleOf = u => { const seg = u.pathname.split('/').filter(Boolean).pop() || ''; const s = decodeURIComponent(seg).replace(/\.[a-z0-9]{2,4}$/i, '').replace(/[-_]+/g, ' ').trim(); return s ? s.replace(/\b\w/g, c => c.toUpperCase()) : 'Untitled page'; };
    const collapse = () => { url = ''; readyAt = 0; sw.to('none'); if (REDUCE) h.jump(0); else h.set(0, S.soft); };
    const show = v => { const u = parse(v); if (!u){ if (url) collapse(); return; } if (u.href === url) return; url = u.href;
      dom.textContent = u.hostname.replace(/^www\./, ''); title.textContent = titleOf(u); const t = now();
      if (REDUCE){ h.jump(84); sw.cur = 'card'; sw.prev = null; sw.t = -9; return; }
      sw.to('sk', t); h.set(84, S.soft, t); readyAt = t + 1.1; };
    inp.oninput = () => show(inp.value); inp.onpaste = () => setTimeout(() => show(inp.value), 0); inp.onkeydown = e => { if (e.key === 'Enter') show(inp.value); };
    luPaste.onclick = () => { inp.value = SAMPLE; show(SAMPLE); inp.focus({ preventScroll:true }); };
    luX.onclick = () => { inp.value = ''; collapse(); luPaste.focus({ preventScroll:true }); };
    return t => { if (readyAt && t >= readyAt){ readyAt = 0; sw.to('card', t); }
      box.style.height = px(Math.max(0, h.at(t))); sw.apply(sk, 'sk', t); sw.apply(card, 'card', t);
      pulse.forEach((e,i) => { e.style.opacity = (.45 + .55*(REDUCE ? .5 : .5 + .5*Math.sin(t*5 - i*.7))).toFixed(3); }); };
  }});
