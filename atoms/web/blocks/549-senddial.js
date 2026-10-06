
atom({ id:'senddial', cat:'Email', name:'Send-later dial', block:'email, schedule send, dial', fam:['D','S','X'],
  html:`<div class="col" style="gap:8px;width:min(280px,92%);align-items:center"><div class="card" style="padding:14px 16px;line-height:1.5;width:100%;position:relative"><b style="font-size:15px;font-weight:600">Re: Launch plan</b><div class="small muted" style="font-size:12.5px">To Maya · draft ready</div><div class="dl" style="position:relative;min-height:24px;margin-top:6px"></div><div class="row" style="gap:8px;margin-top:8px"><button class="btn ink snd" style="min-height:32px;touch-action:none;user-select:none;-webkit-user-select:none">Hold to schedule</button></div><div class="dial" style="position:absolute;left:50%;top:44%;width:148px;height:148px;margin:-74px 0 0 -74px"></div></div><label class="row small muted" style="gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" checked> send in their timezone</label></div><div class="hint">Hold the button, drag to a time</div>`,
  desc:'A long press opens a radial dial on soft. Dragging sets the time 1:1 and the label swaps behind it. Release confirms with a snap to a scheduled terminal.',
  api:'hold .35s -> dial.set(1, soft)   drag angle -> slot, lab.to(i)   up: dial.set(0, snap), confirm',
  init(st){
    const dial = $(st,'.dial'), dl = $(st,'.dl'), btn = $(st,'.snd');
    const slots = ['Today 5 PM', 'Tonight 8 PM', 'Tomorrow 8 AM', 'Tue 8 AM'];
    const lab = ['Pick a time on the dial', ...slots.map(s => 'Send ' + s), 'Scheduled'].map((s, k) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.style.fontSize = '13px'; e.textContent = s; if (k === 5){ e.style.color = 'var(--success)'; e.style.fontWeight = '600'; } dl.appendChild(e); return e; });
    const dots = slots.map((s, i) => { const d = document.createElement('span'); const a = -Math.PI/2 + i*Math.PI/2;
      d.style.cssText = `position:absolute;left:50%;top:50%;width:44px;height:32px;margin:-16px 0 0 -22px;border-radius:16px;background:var(--card);border:1px solid var(--line);display:grid;place-items:center;font-size:11px;font-weight:600;padding:0;transform:translate(${Math.cos(a)*52}px,${Math.sin(a)*52}px)`;
      d.textContent = ['5PM','8PM','8AM','TUE'][i]; dial.appendChild(d); return { d, a }; });
    const ring = document.createElement('span');
    ring.style.cssText = 'position:absolute;left:50%;top:50%;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;border:1px solid var(--line);background:var(--tile)';
    dial.insertBefore(ring, dial.firstChild);
    const dt = new Track(0), sw = new Swap(0), sc = new Track(1);
    let open = false, idx = 0, timer = 0;
    const pick = i => { idx = (i + 4) % 4; sw.to(idx + 1); };
    const ang = e => { const r = dial.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height/2), e.clientX - (r.left + r.width/2)); };
    const near = a => { let best = 0, bd = 9; dots.forEach((o, i) => { let d = Math.abs(a - o.a); d = Math.min(d, Math.PI*2 - d); if (d < bd){ bd = d; best = i; } }); return best; };
    btn.addEventListener('pointerdown', e => { btn.setPointerCapture(e.pointerId); clearTimeout(timer); timer = setTimeout(() => { open = true; dt.set(1, S.soft); sc.set(1, S.soft); pick(near(0)); }, 350); });
    btn.addEventListener('pointermove', e => { if (open && (e.buttons & 1)) pick(near(ang(e))); });
    const close = confirm => { clearTimeout(timer); if (!open){ sw.to(5); btn.textContent = 'Scheduled'; return; } open = false; dt.set(0, S.snap); sw.to(5); btn.textContent = 'Scheduled'; };
    btn.addEventListener('pointerup', () => close(true)); btn.addEventListener('pointercancel', () => { clearTimeout(timer); open = false; dt.set(0, S.snap); });
    return t => { const p = clamp(dt.at(t));
      dial.style.opacity = p.toFixed(3); dial.style.visibility = p < .02 ? 'hidden' : 'visible';
      dial.style.transform = `scale(${(0.92 + .08*p).toFixed(4)})`;
      dots.forEach((o, i) => { const on = open && i === idx;
        o.d.style.borderColor = on ? 'var(--ink)' : 'var(--line)'; o.d.style.background = on ? 'var(--ink)' : 'var(--card)'; o.d.style.color = on ? 'var(--card)' : 'var(--ink)'; });
      lab.forEach((e, k) => sw.apply(e, k, t)); };
  }});
