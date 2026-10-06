
atom({ id:'thumbsreason', cat:'Forms', name:'Thumbs plus reason', block:'chat, feedback', fam:['M','S'], tall:true,
  html:`<div class="card col" style="width:min(340px,calc(100% - 24px));padding:14px;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.5">Was this helpful?</b><div style="align-self:flex-start;max-width:75%;background:var(--raised);border-radius:12px;padding:8px 12px;font-size:13.5px;line-height:1.5">Here is your launch draft.</div><div class="row" style="gap:8px"><button class="tu" aria-label="Helpful" style="width:40px;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--card);display:grid;place-items:center;padding:0;cursor:pointer"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:translateY(-.5px)"><path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zM7 11l4-7a2 2 0 0 1 3.7 1.5L13 11h7a2 2 0 0 1 2 2.4l-1.5 7A2 2 0 0 1 18.5 22H7"/></svg></button><button class="td" aria-label="Not helpful" style="width:40px;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--card);display:grid;place-items:center;padding:0;cursor:pointer"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:translateY(.5px)"><path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1zM17 13l-4 7a2 2 0 0 1-3.7-1.5L11 13H4a2 2 0 0 1-2-2.4l1.5-7A2 2 0 0 1 5.5 2H17"/></svg></button><span class="ty small" style="position:relative;flex:1;height:22px;font-size:12px"></span></div><div class="why" style="overflow:hidden"><span class="small muted" style="display:block;font-size:12px;margin:2px 0 6px">Tell us why (optional)</span><div class="row" style="gap:6px"><input class="ri" placeholder="What stood out?" aria-label="Reason" style="flex:1;min-width:0;border:1px solid var(--line);border-radius:9px;padding:8px 10px;background:var(--card);color:var(--ink);font:13px var(--sans);outline:none;min-height:36px"><button class="btn ink send" style="min-height:36px;border-radius:9px">Send</button></div></div><label class="row small muted" style="gap:6px;cursor:pointer;font-size:12px"><input type="checkbox" class="ar" checked> Ask for a reason</label></div><div class="hint">Pick a thumb, then send a reason</div>`,
  desc:'The pressed thumb sinks on snap. The reason field opens its height on soft, and Send swaps the row to a thank-you terminal.',
  api:'press.set(1, S.snap) on down   why.h.set(96, S.soft)   send: ty.swap.to(thanks)',
  init(st){
    const tu = $(st,'.tu'), td = $(st,'.td'), why = $(st,'.why'), ty = $(st,'.ty'), ar = $(st,'.ar');
    const press = new Track(0), fh = new Track(0), sw = new Swap(0);
    const WHY_H = 92; fh.jump(0); why.style.height = '0px';
    let sel = -1;
    const thanks = ['Thanks — noted as helpful.', 'Thanks — noted as not helpful.'];
    const Y = ['', ...thanks].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; if (s) e.style.color = 'var(--success)'; ty.appendChild(e); return e; });
    const pick = i => { if (sel >= 0) return; sel = i; const t = now();
      [tu,td].forEach((b,j) => { b.style.borderColor = j === i ? 'var(--ink)' : 'var(--line)'; b.style.background = j === i ? 'var(--ink)' : 'var(--card)'; b.style.color = j === i ? 'var(--card)' : 'var(--ink)'; });
      if (!ar.checked){ if (REDUCE){ sw.cur = i + 1; sw.prev = null; sw.t = -9; } else sw.to(i + 1); return; }
      if (REDUCE){ fh.jump(WHY_H); } else fh.set(WHY_H, S.soft); };
    tu.onclick = () => pick(0); td.onclick = () => pick(1);
    let lastDown = null;
    tu.onpointerdown = () => { lastDown = tu; press.set(1, S.snap); }; td.onpointerdown = () => { lastDown = td; press.set(1, S.snap); };
    tu.onpointerup = tu.onpointerleave = () => { if (lastDown === tu) press.set(0, S.snap); };
    td.onpointerup = td.onpointerleave = () => { if (lastDown === td) press.set(0, S.snap); };
    $(st,'.send').onclick = () => { if (sel < 0) return; const t = now();
      if (REDUCE){ sw.cur = sel + 1; sw.prev = null; sw.t = -9; fh.jump(0); }
      else { sw.to(sel + 1); fh.set(0, S.soft, t + EXIT); } };
    return t => { const s = clamp(press.at(t));
      if (lastDown) lastDown.style.transform = `scale(${(1 - .12*s).toFixed(4)})`;
      why.style.height = px(Math.max(0, fh.at(t)));
      Y.forEach((e,k) => sw.apply(e,k,t)); };
  }});
