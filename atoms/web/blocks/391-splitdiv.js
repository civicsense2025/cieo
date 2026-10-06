
atom({ id:'splitdiv', cat:'Views', name:'Split-view divider', block:'split view, divider, panes', fam:['M'],
  html:`<div class="tile" style="position:relative;width:min(400px,96%);height:220px;border-radius:12px;background:var(--card);border:1px solid var(--line);overflow:hidden"><div class="mst" style="position:absolute;left:0;top:0;bottom:0;background:var(--fill);padding:14px 12px 14px 16px;overflow:hidden"><div style="font-size:15px;font-weight:600;line-height:1.5">Inbox</div><div class="small muted" style="font-size:12px">4 threads</div><div style="font-size:13px;line-height:1.5;padding:8px 0;border-top:1px solid var(--line);margin-top:8px;white-space:nowrap">Agenda for Thursday</div><div style="font-size:13px;line-height:1.5;padding:8px 0;border-top:1px solid var(--line);white-space:nowrap">Budget testimony</div></div><div class="dv" style="position:absolute;top:0;bottom:0;width:14px;margin-left:-7px;cursor:col-resize;touch-action:none;display:grid;place-items:center"><span style="width:4px;height:36px;border-radius:2px;background:var(--line)"></span></div><div class="dtl" style="position:absolute;top:0;bottom:0;right:0;padding:14px 16px;overflow:hidden"><div style="font-size:15px;font-weight:600;line-height:1.5">Agenda for Thursday</div><div class="small muted" style="font-size:12px">Maya Okafor</div><div style="font-size:13px;line-height:1.6;margin-top:6px">Item 4 moved ahead of the budget amendments. Public comment now opens the meeting.</div></div><div class="ov" style="position:absolute;inset:0;background:#000;opacity:0;pointer-events:none"></div></div><label class="row small muted" style="gap:6px"><input type="checkbox" class="cp" checked> collapse to overlay under 100px</label><div class="hint">Drag the divider</div>`,
  desc:'The divider tracks the finger 1:1 and rubber-bands at the minimum widths. On release both panes spring soft together to the nearest stop. Dragged under 100px the master collapses into an overlay with a dim.',
  api:'pos tracks 1:1 + rb   release: soft spring to stop   pos<100 → overlay.set(1)',
  init(st){
    const tile = $(st,'.tile'), mst = $(st,'.mst'), dv = $(st,'.dv'), dtl = $(st,'.dtl'), ov = $(st,'.ov');
    const W = () => tile.clientWidth || 400, MIN = 80, STOP = [140, 200, 260], TH = 100;
    const pos = new Track(160), ovT = new Track(0); let sx = 0, sx0 = 0;
    const cp = $(st,'.cp');
    const collapsed = () => cp.checked && pos.target < TH;
    drag(dv, { down:(p) => { sx = p.cx; sx0 = pos.target; },
      move:(p) => { let v = sx0 + (p.cx - sx); const w = W();
        if (v < MIN) v = MIN + rb(v - MIN, 90); if (v > w - 120) v = (w - 120) + rb(v - (w - 120), 90);
        pos.jump(v); ovT.jump(collapsed() ? .4 : 0); },
      up:() => { const cur = pos.target;
        pos.set(STOP.reduce((a, b) => Math.abs(b - cur) < Math.abs(a - cur) ? b : a), S.soft);
        ovT.set(collapsed() ? .4 : 0, S.base); } });
    return t => { const w = W(), p = pos.at(t), o = clamp(ovT.at(t)), mw = collapsed() ? 220 : p;
      mst.style.width = px(collapsed() ? mw : p); mst.style.zIndex = collapsed() ? 2 : 1;
      mst.style.boxShadow = collapsed() ? '4px 0 16px rgba(0,0,0,.14)' : 'none';
      dv.style.left = px(collapsed() ? mw : p); dtl.style.left = px(collapsed() ? 0 : p + 4);
      dtl.style.right = '0'; ov.style.opacity = (o * (collapsed() ? 1 : 0)).toFixed(3); };
  }});
