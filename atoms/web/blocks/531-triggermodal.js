atom({ id:'triggermodal', cat:'Overlays', name:'Modal from trigger', block:'Scale from trigger rect + scrim', fam:['X'], tall:true,
  html:`<div class="ph" style="position:relative;width:min(280px,86%);height:220px;display:grid;place-items:center"><button class="btn ink tg" style="min-height:36px">Read story</button><div class="sr" style="position:absolute;inset:0;background:var(--ink);opacity:0;pointer-events:none;border-radius:12px"></div><div class="dl card" role="dialog" aria-modal="true" aria-labelledby="tm-t" style="position:absolute;left:50%;top:50%;width:min(240px,84%);padding:18px;visibility:hidden;border-radius:15px"><b id="tm-t" style="display:block;font-size:15px;font-weight:600;line-height:1.5">Morning routes</b><p class="small muted" style="margin:6px 0 14px;font-size:13px;line-height:1.55">A 4-minute read about rivers and slow starts.</p><div class="row" style="justify-content:flex-end"><button class="btn cs" style="min-height:36px">Close</button></div></div></div><div class="hint">Grows from the button, returns into it</div><label class="row small muted" style="gap:6px;position:absolute;top:10px;right:12px;font-size:12px"><input type="checkbox" class="sf" checked> scrim fade</label>`,
  desc:'The modal grows from the trigger rect on base while the scrim fades. Closing snaps back into the trigger faster, and focus returns to it.',
  api:'open: scale from trigger rect (base); close: snap into rect',
  init(st){
    const tg = $(st,'.tg'), sr = $(st,'.sr'), dl = $(st,'.dl'), o = new Track(0); let r = { x:.5, y:.7 };
    const set = v => { const sr0 = st.getBoundingClientRect(), tr = tg.getBoundingClientRect(); r = { x:(tr.left+tr.width/2-sr0.left)/sr0.width, y:(tr.top+tr.height/2-sr0.top)/sr0.height };
      openSet(o, v); if (v) setTimeout(() => $(dl,'.cs').focus(), 0); else tg.focus(); };
    tg.onclick = () => set(true); $(dl,'.cs').onclick = () => set(false); sr.onclick = () => set(false);
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape' && o.target) set(false); });
    return t => { const p = clamp(o.at(t)); sr.style.opacity = (p*.35).toFixed(3); sr.style.pointerEvents = p > .5 ? 'auto' : 'none';
      dl.style.opacity = p.toFixed(3); dl.style.visibility = p < .01 ? 'hidden' : 'visible'; dl.style.pointerEvents = p > .5 ? 'auto' : 'none';
      dl.style.transform = `translate(-50%,-50%) scale(${(.82+.18*p).toFixed(4)})`; dl.style.transformOrigin = `${(r.x*100).toFixed(1)}% ${(r.y*100).toFixed(1)}%`; };
  }});
