

atom({ id:'calendar', cat:'Scheduling', name:'Calendar event', block:'booking, timeline', fam:['D','M'], tall:true,
  html:`<div class="card" style="position:relative;width:min(300px,88%);height:300px;overflow:hidden"><div class="gr" style="position:absolute;left:44px;right:8px;top:8px;bottom:8px"></div><div class="ev" style="position:absolute;left:52px;right:16px;border-radius:8px;background:var(--accent-tint);box-shadow:inset 2px 0 0 var(--accent);color:var(--ink);padding:4px 8px;cursor:grab;touch-action:none;overflow:hidden"><b class="small" style="display:block">Design review</b><span class="tm small muted num"></span><i class="rz" style="position:absolute;left:0;right:0;bottom:0;height:8px;cursor:ns-resize"></i></div></div><div class="hint">Drag the event · drag its bottom edge</div>`,
  desc:'The event follows your drag, and its edges are pulled to the 15-minute grid on a stiff spring, so it feels magnetic without fighting you. The time label shows the snapped result.',
  api:'y = snap(raw, 15 min); top.set(y, S.snap)   bottom edge: same, min 30 min',
  init(st){
    const gr = $(st,'.gr'), ev = $(st,'.ev'), rz = $(st,'.rz'), tm = $(st,'.tm'), H0 = 9, HOURS = 8, PX = 34, Q = PX/4;
    for (let h = 0; h <= HOURS; h++){ const l = document.createElement('div'); l.style.cssText = `position:absolute;left:-36px;right:0;top:${h*PX}px;border-top:1px solid var(--line-soft);font:11px var(--sans);color:var(--muted)`; l.innerHTML = `<span style="position:absolute;left:0;top:-7px">${((H0 + h - 1) % 12) + 1}${H0 + h < 12 ? 'am' : 'pm'}</span>`; gr.appendChild(l); }
    const top = new Track(2*PX, S.snap), bot = new Track(3.5*PX, S.snap); let mode = null, s0;
    const snap = v => Math.round(v/Q)*Q, fmt = y => { const m = Math.round(y/Q)*15 + H0*60, h = Math.floor(m/60), mm = m % 60; return `${((h - 1) % 12) + 1}:${String(mm).padStart(2,'0')}`; };
    drag(ev, { down:(p, e) => { mode = e.target === rz ? 'size' : 'move'; s0 = { cy:p.cy, top:top.target, bot:bot.target }; ev.style.cursor = mode === 'size' ? 'ns-resize' : 'grabbing'; },
      move:p => { const dy = p.cy - s0.cy, max = HOURS*PX; if (mode === 'move'){ const len = s0.bot - s0.top, nt = clamp(snap(s0.top + dy), 0, max - len); top.set(nt); bot.set(nt + len); } else bot.set(clamp(snap(s0.bot + dy), top.target + 2*Q, max)); },
      up:() => { mode = null; ev.style.cursor = 'grab'; } });
    return t => { const a = top.at(t) + 8, b = bot.at(t) + 8; ev.style.top = px(a); ev.style.height = px(b - a); tm.textContent = `${fmt(top.target)} – ${fmt(bot.target)}`; };
  }});