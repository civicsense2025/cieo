

atom({ id:'alert', cat:'Content', name:'Dismissible alert', block:'alert, callout, announcement', fam:['X','M'],
  html:`<div class="col" style="width:min(360px,90%)"><div class="aw" style="overflow:hidden"><div class="al" style="display:flex;gap:10px;align-items:flex-start;background:var(--accent-tint);border-radius:12px;padding:12px 12px 12px 14px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" style="flex:none;margin-top:2px"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg><div class="small" style="flex:1"><b>Scheduled maintenance</b><br><span class="muted">Editing pauses Sunday 02:00–02:30 UTC.</span></div><button class="x" aria-label="Dismiss" style="border:0;background:none;cursor:pointer;padding:2px;color:var(--muted)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div></div><div class="small muted" style="border-top:1px solid var(--line);padding-top:10px">Content below moves up once the alert is gone.</div><button class="btn restore" style="align-self:flex-start">Restore</button></div>`,
  desc:'Fades and blurs out first, then the space collapses so content below never jumps while text is still visible.',
  api:'o.set(0, S.snap); h.set(0, S.base, t + EXIT)',
  init(st){
    const wrap = $(st,'.aw'), al = $(st,'.al'), o = new Track(1), h = new Track(1);
    $(st,'.x').onclick = () => { o.set(0, S.snap); h.set(0, S.base, now() + EXIT); };
    $(st,'.restore').onclick = () => { h.set(1); o.set(1, S.base, now() + .12); };
    return t => { wrap.style.height = px(clamp(h.at(t))*size(al).h); fade(al, o.at(t), null); };
  }});