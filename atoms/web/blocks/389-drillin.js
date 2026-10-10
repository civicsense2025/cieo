
atom({ id:'drillin', cat:'Views', name:'Drill-in navigation', block:'navigation, drill, master detail', fam:['S','M'],
  html:`<div class="tile" style="position:relative;width:min(360px,94%);height:264px;overflow:hidden;border-radius:12px;background:var(--card)"><div class="mst" style="position:absolute;inset:0 0 44px 0;padding:14px 16px"><div style="font-size:15px;font-weight:600;line-height:1.5">Stories</div><div class="small muted" style="font-size:12.5px">Tap one to drill in.</div><button class="r0 btn" style="margin-top:8px">Who writes the agenda</button><button class="r1 btn" style="margin-top:8px">Reading a city budget</button></div><div class="dtl" style="position:absolute;top:0;bottom:44px;left:0;width:100%;background:var(--card);padding:14px 16px;touch-action:pan-y"><button class="bk" style="border:0;background:none;cursor:pointer;font-size:13px;color:var(--accent);padding:6px 0;position:relative;height:30px;display:block"><span class="layer">‹ Stories</span></button><b class="dh" style="display:block;position:relative;height:24px"><span class="layer" style="font-size:15px;font-weight:600;line-height:1.5">Who writes the agenda</span></b><div class="small muted" style="font-size:12.5px">Maya Okafor · Oct 2</div><div style="font-size:13px;line-height:1.6;margin-top:6px">The superintendent drafts it and the chair approves it. Ask the clerk eight days out.</div></div><div class="tab" style="position:absolute;left:0;right:0;bottom:0;height:44px;display:flex;border-top:1px solid var(--line);background:var(--card);font-size:12px;color:var(--muted)"><span style="flex:1;display:grid;place-items:center;color:var(--ink);font-weight:600">Read</span><span style="flex:1;display:grid;place-items:center">Saved</span><span style="flex:1;display:grid;place-items:center">Me</span></div></div><label class="row small muted" style="gap:6px"><input type="checkbox" class="dm" checked> dim parent</label><div class="hint">Open a story, swipe from the left edge to go back</div>`,
  desc:'The new pane slides in from the trailing edge while the current one shifts 28px and dims. The back label swaps to the parent title and the tab bar never moves. An edge swipe tracks the finger and commits or cancels on release.',
  api:'x.set(0) in, W out   mst shifts -28 + dims   bk.to(parent)   edge drag commits>90px',
  init(st){
    const dtl = $(st,'.dtl'), mst = $(st,'.mst'), bk = $(st,'.bk').firstElementChild, dmBox = $(st,'.dm');
    const W = 360, x = new Track(W), sh = new Track(0), dm = new Track(0);
    const sw = new Swap(0); let open = false, sx = 0, sx0 = 0, armed = false;
    const titles = ['‹ Stories', '‹ Stories'];
    const show = i => { open = true; x.set(0, S.base); sh.set(-28, S.base); dm.set(dmBox.checked ? .45 : 0, S.base);
      bk.textContent = titles[i]; sw.to(1); };
    const hide = () => { open = false; x.set(W, S.base); sh.set(0, S.base); dm.set(0, S.base); sw.to(0); };
    $(st,'.r0').onclick = () => show(0); $(st,'.r1').onclick = () => show(1);
    $(st,'.bk').onclick = hide;
    drag(dtl, { down:(p) => { armed = open && p.x < 30; sx = p.cx; sx0 = x.target; },
      move:(p) => { if (armed) x.jump(Math.max(0, sx0 + (p.cx - sx))); },
      up:(p, v) => { if (!armed) return; armed = false;
        if (sx0 + (p.cx - sx) > 90 || v.vx > 600) hide(); else x.set(0, S.base); } });
    return t => { dtl.style.transform = `translateX(${x.at(t).toFixed(2)}px)`;
      mst.style.transform = `translateX(${sh.at(t).toFixed(2)}px)`;
      mst.style.opacity = (1 - dm.at(t)).toFixed(3); mst.style.filter = dm.at(t) > .02 ? `blur(${(dm.at(t)*4).toFixed(2)}px)` : 'none'; };
  }});
