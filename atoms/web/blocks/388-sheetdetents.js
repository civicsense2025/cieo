
atom({ id:'sheetdetents', cat:'Views', name:'Bottom-sheet detents', block:'sheet, bottom sheet, detents', fam:['M'], tall:true,
  html:`<div class="tile" style="position:relative;width:min(360px,94%);height:280px;overflow:hidden;border-radius:12px;background:var(--fill)"><div class="dim" style="position:absolute;inset:0;background:#000;opacity:0;pointer-events:none"></div><div style="padding:14px 16px;font-size:15px;font-weight:600;line-height:1.5">Inbox</div><div class="small muted" style="padding:0 16px;font-size:12.5px">Four threads sit under the sheet.</div><div class="sht" style="position:absolute;left:0;right:0;top:0;height:250px;background:var(--card);border-radius:14px 14px 0 0;box-shadow:0 -4px 20px rgba(0,0,0,.12);touch-action:none"><div class="grab" style="display:grid;place-items:center;padding:10px 0 4px;cursor:grab"><span style="width:36px;height:4px;border-radius:2px;background:var(--line)"></span></div><div style="padding:6px 16px 0;font-size:15px;font-weight:600;line-height:1.5">Route 12 hearing</div><div class="small muted" style="padding:0 16px 8px;font-size:12.5px">Tuesday · 6 pm · Library room B</div><div style="font-size:13px;line-height:1.5;padding:8px 16px;border-top:1px solid var(--line)">The board takes public comment first.</div><div style="font-size:13px;line-height:1.5;padding:8px 16px;border-top:1px solid var(--line)">Bring the Friday packet, page 14.</div></div></div><div class="row" style="gap:8px;align-items:center"><button class="btn hf">Half</button><button class="btn fl">Full</button><span class="small muted">drag the handle · dim only at full</span></div><div class="hint">Drag the sheet, or jump to a detent</div>`,
  desc:'The sheet tracks the finger 1:1 and rubber-bands past its stops. Release velocity picks the detent: a fast fling up lands full, down lands half. The dim only fades in at full and the stops hold as terminals.',
  api:'drag 1:1 + rb past stops   vy<-500→full, vy>500→half, else nearest   dim.set(full?1:0)',
  init(st){
    const sht = $(st,'.sht'), dim = $(st,'.dim'), tile = $(st,'.tile');
    const FULL = 30, HALF = 150, CLOSED = 236;
    const y = new Track(HALF), dm = new Track(0); let startY = 0, startC = 0;
    const settle = (to, t = now()) => { y.set(to, to === FULL ? S.base : S.soft, t); dm.set(to === FULL ? .45 : 0, S.base, t); };
    const clampRb = v => v < FULL ? FULL + rb(v - FULL, 120) : v > CLOSED ? CLOSED + rb(v - CLOSED, 120) : v;
    drag(sht, { down:(p) => { startY = p.cy; startC = y.target; },
      move:(p) => { y.jump(clampRb(startC + (p.cy - startY))); dm.jump(y.target === FULL ? .45 : 0); },
      up:(p, v) => { const cur = y.target;
        if (v.vy < -500) settle(FULL);
        else if (v.vy > 500) settle(cur > (HALF + CLOSED) / 2 ? CLOSED : HALF);
        else settle([FULL, HALF, CLOSED].reduce((a, b) => Math.abs(b - cur) < Math.abs(a - cur) ? b : a)); } });
    $(st,'.hf').onclick = () => settle(HALF); $(st,'.fl').onclick = () => settle(FULL);
    tile.addEventListener('click', e => { if (e.target === tile) settle(HALF); });
    return t => { sht.style.transform = `translateY(${y.at(t).toFixed(2)}px)`; dim.style.opacity = clamp(dm.at(t)).toFixed(3); };
  }});
