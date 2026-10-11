atom({ id:'shipcheck', cat:'Writing', name:'Ship checklist', block:'checklist, publish', fam:['M','S','T'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="margin:0 auto;width:min(300px,88%);gap:8px;padding:12px"><div class="row small muted" style="justify-content:space-between"><span>Ship readiness</span><span class="row" style="gap:8px"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="var(--line)" stroke-width="2.5"/><circle class="arc" cx="10" cy="10" r="8" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="50.3" stroke-dashoffset="50.3" transform="rotate(-90 10 10)"/></svg><span><span class="dn"></span> of 3</span></span></div><div class="cl col" style="gap:8px"></div><div class="row" style="gap:8px"><button class="btn ink sh" aria-label="Fix next issue" style="position:relative;flex:none;height:36px;padding:0;overflow:hidden"></button><button class="btn rs">Reset</button></div></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Stamp on complete</span></label><div class="hint">Finish all three to stamp it shipped</div>`,
  desc:'Each check fills its box, draws the tick, then runs the strike 40ms later. The ring fills and the count rolls with every step, and the ship button swaps into a success stamp on the last one. Reset clears the board.',
  api:'box.set(1); tick.set(1); strike.set(1, S.base, t+.04)   ring.set(n/3); dg.set(n)   all: swap.to(1), w.set(measure)',
  init(st){
    const cl = $(st,'.cl'), arc = $(st,'.arc'), sh = $(st,'.sh'), C = 50.3;
    const dn = new Digits($(st,'.dn'), 1), sw = new Swap(0), w = new Track(0), sv = new Track(0), ring = new Track(0);
    const L = ['Ship issue','✓ Shipped'].map(s => { const e2 = document.createElement('span'); e2.className = 'layer'; e2.textContent = s; sh.appendChild(e2); return e2; });
    const width = k => { const m = document.createElement('span'); m.textContent = L[k].textContent; Object.assign(m.style,{position:'absolute',visibility:'hidden',whiteSpace:'nowrap',font:'600 14px var(--sans)',padding:'0 16px'}); st.appendChild(m); const x = m.offsetWidth + 32; m.remove(); return x; };
    const rows = [['Proof the draft',1],['Set the cover art',0],['Pick the send time',0]].map(([n,d]) => {
      const b = document.createElement('button'); b.style.cssText = 'display:flex;align-items:center;gap:10px;border:0;background:none;padding:6px 0;cursor:pointer;text-align:left;font-size:14px';
      b.innerHTML = '<span class="bx" style="position:relative;width:18px;height:18px;border-radius:5px;border:1.5px solid var(--line);flex:none"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--card)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;left:1.5px;top:1.5px"><path d="M5 12.5 10 17.5 19 7" pathLength="1" stroke-dasharray="1"/></svg></span><span class="tx" style="position:relative"><span></span><i style="position:absolute;left:0;top:52%;height:1.5px;background:var(--muted)"></i></span>';
      $(b,'.tx span').textContent = n; cl.appendChild(b);
      const r = { b, bx:$(b,'.bx'), ck:$(b,'path'), tx:$(b,'.tx'), ln:$(b,'i'), on:d, f:new Track(d), c:new Track(d), s:new Track(d) };
      b.onclick = () => { r.on = r.on ? 0 : 1; const t0 = now();
        if (REDUCE){ r.f.jump(r.on); r.c.jump(r.on); r.s.jump(r.on); }
        else if (r.on){ r.f.set(1); r.c.set(1); r.s.set(1, S.base, t0 + .04); }
        else { r.f.set(0, S.snap); r.c.set(0, S.snap); r.s.set(0, S.snap); }
        sync(); };
      return r; });
    const sync = () => { const n = rows.filter(x => x.on).length, all = n === rows.length ? 1 : 0;
      if (REDUCE){ ring.jump(n/3); dn.set(String(n), true); sw.cur = all; sw.prev = null; sw.t = -9; w.jump(width(all)); sv.jump(all); }
      else { ring.set(n/3); dn.set(String(n)); sw.to(all); w.set(width(all)); sv.set(all); } };
    $(st,'.rs').onclick = () => { rows.forEach(r => { r.on = 0;
      if (REDUCE){ r.f.jump(0); r.c.jump(0); r.s.jump(0); } else { r.f.set(0, S.snap); r.c.set(0, S.snap); r.s.set(0, S.snap); } }); sync(); };
    sh.onclick = () => { const r = rows.find(x => !x.on); if (r) r.b.onclick(); };
    sync(); w.jump(width(sw.cur));
    return t => { rows.forEach(r => { const f = clamp(r.f.at(t)), c = clamp(r.c.at(t)), s = clamp(r.s.at(t));
        r.bx.style.background = mix(f,'var(--ink)','transparent'); r.bx.style.borderColor = mix(f,'var(--ink)','var(--line)'); r.ck.style.strokeDashoffset = (1-c).toFixed(3);
        r.ln.style.width = (s*100).toFixed(1) + '%'; r.tx.style.color = mix(s,'var(--muted)','var(--ink)'); });
      arc.style.strokeDashoffset = (C*(1-clamp(ring.at(t)))).toFixed(2); dn.render(t);
      L.forEach((e2,k) => sw.apply(e2,k,t)); sh.style.width = px(w.at(t));
      sh.style.background = mix(clamp(sv.at(t)),'var(--success)','var(--ink)'); sh.style.color = 'var(--card)'; };
  }});
