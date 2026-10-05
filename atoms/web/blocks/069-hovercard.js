

atom({ id:'hovercard', cat:'Overlays', name:'Hover card', block:'Hover card primitive, profile-header', fam:['X'],
  html:`<p style="margin:28px 0 0;align-self:start;max-width:300px;text-align:center;line-height:1.7">Written by <a href="#" class="hv" style="position:relative;color:var(--ink);font-weight:600;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px">@mayachen<span class="hc card" style="position:absolute;left:50%;top:calc(100% + 10px);width:240px;margin-left:-120px;padding:14px;text-align:left;font-weight:400;cursor:default;transform-origin:50% 0;visibility:hidden"><span class="row" style="gap:10px"><i style="width:40px;height:40px;border-radius:50%;background:var(--accent);flex:none"></i><span class="col" style="gap:0"><b class="small">Maya Chen</b><span class="small muted">@mayachen</span></span></span><span class="small" style="display:block;margin-top:8px">Editor at Field Notes. Writes about rivers, routes and slow mornings.</span><span class="small muted" style="display:block;margin-top:6px">212 following · 1.4k followers</span></span></a> on Sep 28.</p><div class="hint">Rest the pointer on the name</div>`,
  desc:'Opens only after the pointer rests for 400ms, so passing over the link does nothing. Leaving starts a 150ms grace period, and moving into the card cancels it.',
  api:'openAt = t + 0.4 on enter; closeAt = t + 0.15 on leave; card enter cancels closeAt',
  init(st){
    const a = $(st,'.hv'), hc = $(st,'.hc'), o = new Track(0); let openAt = 0, closeAt = 0;
    a.onclick = e => e.preventDefault();
    a.onpointerenter = a.onfocus = () => { closeAt = 0; if (!o.target) openAt = now() + .4; };
    a.onpointerleave = a.onblur = () => { openAt = 0; if (o.target) closeAt = now() + .15; };
    return t => { if (openAt && t >= openAt){ openAt = 0; o.set(1); } if (closeAt && t >= closeAt){ closeAt = 0; o.set(0, S.snap); } pop(hc, o.at(t), -6); };
  }});