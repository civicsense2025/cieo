

atom({ id:'resizable', cat:'Layout', name:'Resizable panels', block:'columns, Resizable primitive', fam:['D'], wide:true,
  html:`<div class="rz card" style="position:relative;width:min(560px,94%);height:200px;display:flex;overflow:hidden"><div class="pa" style="overflow:hidden;flex:none"><div class="small" style="padding:12px;min-width:120px"><b style="display:block;margin-bottom:6px">Pages</b><span class="muted">Home<br>About<br>Journal<br>Contact</span></div></div><div class="hd" role="separator" aria-orientation="vertical" aria-label="Resize panels" tabindex="0" style="position:relative;width:12px;margin:0 -6px;flex:none;cursor:col-resize;z-index:2;touch-action:none"><i style="position:absolute;left:5px;top:0;bottom:0;width:2px;background:var(--line)"></i><i class="gp" style="position:absolute;left:3px;top:50%;width:6px;height:28px;margin-top:-14px;border-radius:3px;background:var(--faint)"></i></div><div class="small" style="flex:1;padding:12px;min-width:0"><b style="display:block;margin-bottom:6px">Editor</b><span class="muted">Drag the divider. Pull it far left to collapse the sidebar, double-click it to reset.</span></div></div>`,
  desc:'The divider follows the pointer exactly between its limits and rubber-bands beyond them. Releasing under 70px snaps the sidebar shut from your release velocity; a double-click springs it back.',
  api:'w = clamp(start + dx, 120, max) ± rb   release: w < 70 ? 0 : w',
  init(st){
    const rz = $(st,'.rz'), pa = $(st,'.pa'), hd = $(st,'.hd'), gp = $(st,'.gp'), w = new Track(180), act = new Track(0, S.snap); let held = false, hw = 0, sx = 0;
    const MIN = 120, max = () => rz.clientWidth - 160;
    drag(hd, { down:p => { held = true; sx = w.at() - p.cx; hw = w.at(); act.set(1); }, move:p => { let v = sx + p.cx; if (v > max()) v = max() + rb(v - max(), 30); else if (v < MIN) v = v < 70 ? Math.max(0, v) : MIN + rb(v - MIN, 30); hw = v; },
      up:(p, v) => { held = false; act.set(0); w.release(hw, v.vx, hw < 70 ? 0 : clamp(hw, MIN, max())); } });
    hd.ondblclick = () => w.set(180); hd.onkeydown = ev => { if (ev.key === 'ArrowLeft') w.set(Math.max(0, w.target - 20)); if (ev.key === 'ArrowRight') w.set(Math.min(max(), w.target + 20)); };
    hd.onpointerenter = () => act.set(.6); hd.onpointerleave = () => { if (!held) act.set(0); };
    return t => { pa.style.width = px(Math.max(0, held ? hw : w.at(t))); const a = clamp(act.at(t)); gp.style.background = mix(a,'var(--ink)','var(--faint)'); gp.style.transform = `scaleY(${(1 + .3*a).toFixed(3)})`; };
  }});