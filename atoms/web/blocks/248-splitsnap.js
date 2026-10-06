

atom({ id:'splitsnap', cat:'Layout', name:'Split snap drag', block:'columns, Resizable primitive', fam:['D'], wide:true,
  html:`<div class="col" style="gap:12px;align-items:center"><div style="max-width:420px;text-align:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Split snap drag</b><p class="muted" style="font-size:13px;line-height:1.5;margin:6px 0 0">The divider tracks the pointer one to one. On release it settles into the nearest snap point from your velocity.</p></div><div class="row small muted" style="gap:8px;align-items:center;font-variant-numeric:tabular-nums"><span class="pc" style="display:inline-flex;min-width:20px;justify-content:flex-end"></span><span>%</span><span aria-hidden="true">·</span><span class="sl" style="position:relative;display:inline-block;min-width:96px;min-height:20px"></span></div><div class="rz card" style="position:relative;width:min(560px,94%);height:190px;display:flex;overflow:hidden"><div class="pa" style="overflow:hidden;flex:none"><div class="small" style="padding:14px 16px;min-width:130px;font-size:13px;line-height:1.5"><b style="display:block;margin-bottom:6px;font-size:13px">Notes</b><span class="muted">Spring<br>Slotted<br>Pinned<br>Drafts</span></div></div><div class="hd" role="separator" aria-orientation="vertical" aria-label="Snap divider" tabindex="0" style="position:relative;width:12px;margin:0 -6px;flex:none;cursor:col-resize;z-index:2;touch-action:none"><i style="position:absolute;left:5px;top:0;bottom:0;width:2px;background:var(--line)"></i><i class="gp" style="position:absolute;left:3px;top:50%;width:6px;height:28px;margin-top:-14px;border-radius:3px;background:var(--faint)"></i></div><div class="small" style="flex:1;padding:14px 16px;min-width:0;font-size:13px;line-height:1.5"><b style="display:block;margin-bottom:6px;font-size:13px">Canvas</b><span class="muted">Drag the divider, then let go. It lands softly on 25, 50, or 75 percent.</span></div></div><div class="row" style="gap:8px;align-items:center"><button class="btn s25" style="min-height:32px">25</button><button class="btn s50" style="min-height:32px">50</button><button class="btn s75" style="min-height:32px">75</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="sf" checked> soft settle</label></div></div><div class="hint">Drag the divider; release to snap</div>`,
  desc:'The divider follows the pointer exactly with a grip highlight, then releases into the nearest of three snap points on a soft spring. The readout rolls to the landing percent.',
  api:'held.x = pointer   up: x.release(x, vx, snap(.25/.5/.75), soft)   pc.set(%)',
  init(st){
    const rz = $(st,'.rz'), pa = $(st,'.pa'), hd = $(st,'.hd'), gp = $(st,'.gp');
    const dg = new Digits($(st,'.pc'), 2), sw = new Swap(1);
    const L = ['Quarter','Half','Three-quarter'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; $(st,'.sl').appendChild(e); return e; });
    const SN = [.25, .5, .75], w = new Track(200), act = new Track(0, S.snap);
    let held = false, hw = 0, sx = 0;
    const W = () => rz.clientWidth, snap = f => Math.round(f * W());
    const soft = () => $(st,'.sf').checked ? S.soft : S.base;
    const show = v => { const f = v / Math.max(1, W()), k = SN.reduce((b,s,i) => Math.abs(s-f) < Math.abs(SN[b]-f) ? i : b, 1);
      dg.set(String(Math.round(SN[k]*100))); sw.to(k); };
    const go = f => { const to = snap(f); if (REDUCE) w.jump(to); else w.set(to, soft()); show(to); };
    drag(hd, { down:p => { held = true; sx = w.at() - p.cx; hw = w.at(); act.set(1); },
      move:p => { hw = clamp(sx + p.cx, 0, W()); },
      up:(p, v) => { held = false; act.set(0); const f = hw / Math.max(1, W());
        const k = SN.reduce((b,s,i) => Math.abs(s-f) < Math.abs(SN[b]-f) ? i : b, 1), to = snap(SN[k]);
        if (REDUCE) w.jump(to); else w.release(hw, v.vx, to, soft()); show(to); } });
    hd.ondblclick = () => go(.5);
    hd.onkeydown = ev => { if (ev.key === 'ArrowLeft') go(clamp(w.target / Math.max(1,W()) - .25, 0, 1) < .25 ? .25 : .5); if (ev.key === 'ArrowRight') go(.75); };
    hd.onpointerenter = () => act.set(.6); hd.onpointerleave = () => { if (!held) act.set(0); };
    $(st,'.s25').onclick = () => go(.25); $(st,'.s50').onclick = () => go(.5); $(st,'.s75').onclick = () => go(.75);
    w.jump(200); dg.set('50', true);
    return t => { pa.style.width = px(Math.max(0, held ? hw : w.at(t))); const a = clamp(act.at(t));
      gp.style.background = mix(a, 'var(--ink)', 'var(--faint)');
      gp.style.transform = `scaleY(${(1 + .3*a).toFixed(3)})`;
      dg.render(t); L.forEach((e,k) => sw.apply(e, k, t)); };
  }});
