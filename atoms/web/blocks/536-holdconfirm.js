atom({ id:'confirmhold', cat:'Overlays', name:'Hold to confirm', block:'Danger slides in, hold + countdown', fam:['X','T'], tall:true,
  html:`<div class="card col" style="width:min(270px,86%);padding:8px"><div class="rw" style="overflow:hidden"><div class="row fr" style="justify-content:space-between;padding:8px 10px"><span class="small" style="font-weight:500;font-size:13.5px;line-height:1.5">About page</span><button class="btn del" style="color:var(--danger);min-height:36px;padding:4px 10px">Delete</button></div></div></div><div class="sr" style="position:absolute;inset:0;background:var(--ink);opacity:0;pointer-events:none"></div><div class="dl card" role="alertdialog" aria-label="Confirm delete" style="position:absolute;left:50%;top:50%;width:min(250px,84%);padding:18px 20px;visibility:hidden;border-radius:15px"><b style="display:block;font-size:15px;font-weight:600;line-height:1.5">Delete \u201cAbout\u201d?</b><p class="small muted" style="margin:6px 0 12px;font-size:13px;line-height:1.55">Hold the button 3s to confirm.</p><button class="btn hd" style="width:100%;min-height:40px;background:var(--danger);border-color:var(--danger);color:#fff;position:relative;overflow:hidden"><span class="fl" style="position:absolute;inset:0;background:#ffffff2e;width:0"></span><span class="lb" style="position:relative">Hold to delete \u00b7 <b class="cd"></b></span></button><div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn cs" style="min-height:36px">Cancel</button></div></div><label class="row small muted" style="gap:6px;position:absolute;top:10px;right:12px;font-size:12px"><input type="checkbox" class="ct" checked> 3s countdown</label><div class="hint">Danger slides after dialog \u00b7 row collapses</div>`,
  desc:'The danger confirm slides in on base after the dialog. Hold-to-confirm runs a digits countdown, then the row collapses only after exit.',
  api:'dlg base; hold 3s Digits; row.h base after exit',
  init(st){
    const sr = $(st,'.sr'), dl = $(st,'.dl'), rw = $(st,'.rw'), fr = $(st,'.fr'), fl = $(st,'.fl'), hd = $(st,'.hd');
    const o = new Track(0), do2 = new Track(0), rh = new Track(1), ro = new Track(1), dg = new Digits($(dl,'.cd'), 1);
    dg.set('3', true); let last = null, timer = 0, holdT = 0;
    const set = v => { openSet(o, v); if (v) do2.set(0), do2.jump(0); else openSet(do2, false); if (v) setTimeout(() => hd.focus(), 0); };
    $(st,'.del').onclick = ev => { last = ev.currentTarget; set(true); const t0 = now(); do2.set(1, S.base, t0+.1); };
    const cancel = () => { clearTimeout(timer); dg.set('3', true); fl.style.width = '0'; };
    $(dl,'.cs').onclick = () => { cancel(); set(false); }; sr.onclick = () => { cancel(); set(false); };
    hd.addEventListener('pointerdown', () => { if (!$(st,'.ct').checked){ finish(); return; } holdT = now(); dg.set('3');
      const tick = () => { const el = (now()-holdT); const left = Math.max(0, 3-Math.floor(el)); dg.set(String(left)); fl.style.width = (clamp(el/3)*100).toFixed(1)+'%'; if (el >= 3) finish(); else timer = setTimeout(tick, 200); }; tick(); });
    const end = () => { if (o.target && !ro.target) cancel(); };
    hd.addEventListener('pointerup', end); hd.addEventListener('pointercancel', end);
    const finish = () => { cancel(); set(false); const t0 = now(); ro.set(0, S.snap, t0+.12); rh.set(0, S.base, t0+.12+EXIT); };
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape' && o.target){ cancel(); set(false); last?.focus?.(); } });
    return t => { const p = clamp(o.at(t)); sr.style.opacity = (p*.35).toFixed(3); sr.style.pointerEvents = p > .5 ? 'auto' : 'none';
      const q = clamp(do2.at(t)); dl.style.opacity = p.toFixed(3); dl.style.visibility = p < .01 ? 'hidden' : 'visible'; dl.style.pointerEvents = p > .5 ? 'auto' : 'none';
      dl.style.transform = `translate(calc(-50% + ${px((1-q)*24)}),-50%) scale(${(.96+.04*p).toFixed(4)})`;
      rw.style.height = px(Math.max(0, clamp(rh.at(t))*size(fr).h)); fade(fr, ro.at(t), null); dg.render(t); };
  }});
