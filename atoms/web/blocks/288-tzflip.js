atom({ id:'tzflip', cat:'Scheduling', name:'Timezone flip', block:'timezone, meeting times', fam:['M','S'],
  html:`<div class="col" style="width:min(340px,90%);margin:0 auto;gap:8px;line-height:1.5"><b style="font-size:15px;font-weight:600">Team times</b><div class="card" style="padding:14px 16px;display:flex;flex-direction:column;gap:4px"><div class="rail" style="position:relative;display:flex;gap:4px;background:var(--raised);border-radius:10px;padding:4px;margin-bottom:8px" role="tablist"></div><div class="rows" style="display:flex;flex-direction:column"></div><div class="row small muted" style="gap:6px;align-items:center;border-top:1px solid var(--line);padding-top:10px;margin-top:6px"><label style="display:contents"><input type="checkbox" class="wh" checked style="width:16px;height:16px"><span style="font-size:12px">Working hours only</span></label></div></div></div><div class="hint">Flip zones — widths spring, never jump</div>`,
  desc:'Each time blurs out and its replacement blurs in. The time column measures the longest new label and springs to fit it, so nothing jumps. Filtering to working hours only fades the late row.',
  api:'rows[i].sw.to(tz)   w.set(measure(longest))   late.o.set(wh?1:0)',
  init(st){
    const zones = ['PT','ET'], names = ['Design review','1:1 with Priya','Demo call'];
    const T = [['9:00 AM','12:30 PM','4:30 PM'],['12:00 PM','3:30 PM','7:30 PM']];
    const rail = $(st,'.rail'), box = $(st,'.rows'), pl = edges(0, 0);
    const tabs = zones.map(z => { const b = document.createElement('button'); b.setAttribute('role','tab'); b.textContent = z;
      b.style.cssText = 'position:relative;z-index:1;flex:1;min-height:32px;border:0;background:none;border-radius:8px;cursor:pointer;font-size:13px;color:var(--ink)';
      rail.appendChild(b); return b; });
    const plate = document.createElement('div');
    plate.style.cssText = 'position:absolute;top:4px;bottom:4px;border-radius:8px;background:var(--card);box-shadow:0 1px 3px rgba(0,0,0,.15)';
    rail.prepend(plate);
    const meas = s => { const m = document.createElement('span');
      Object.assign(m.style,{position:'absolute',visibility:'hidden',whiteSpace:'nowrap',font:'400 13px var(--sans)',fontVariantNumeric:'tabular-nums'});
      m.textContent = s; st.appendChild(m); const x = m.offsetWidth; m.remove(); return x; };
    const w = new Track(0); let tz = 0;
    const rows = names.map((n,i) => {
      const r = document.createElement('div');
      r.style.cssText = 'position:relative;display:flex;justify-content:space-between;align-items:center;min-height:40px;font-size:13px';
      if (i) r.style.borderTop = '1px solid var(--line)';
      const nm = document.createElement('span'); nm.textContent = n; r.appendChild(nm);
      const tw = document.createElement('span'); tw.style.cssText = 'position:relative;display:block;height:22px;overflow:hidden;text-align:right;font-variant-numeric:tabular-nums';
      const L = [0,1].map(z => { const s = document.createElement('span'); s.className = 'layer';
        s.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center end'; s.textContent = T[z][i];
        tw.appendChild(s); return s; });
      r.appendChild(tw); box.appendChild(r);
      return { r, tw, L, sw:new Swap(0), o:new Track(1) };
    });
    const fit = z => w.set(Math.max(meas(T[z][0]), meas(T[z][1]), meas(T[z][2])) + 4);
    const go = z => { tz = z; rows.forEach(r => r.sw.to(z)); fit(z);
      pl.go(tabs[z].offsetLeft, tabs[z].offsetLeft + tabs[z].offsetWidth);
      tabs.forEach((x,j) => x.style.fontWeight = j === z ? '600' : '400'); };
    tabs.forEach((b,i) => b.onclick = () => go(i));
    $(st,'.wh').onchange = e => rows[2].o.set(e.target.checked ? 0 : 1);
    rows[2].o.jump(0);
    const first = () => { pl.jump(tabs[0].offsetLeft, tabs[0].offsetLeft + tabs[0].offsetWidth); w.jump(Math.max(meas(T[0][0]), meas(T[0][1]), meas(T[0][2])) + 4); };
    document.fonts.ready.then(first); first(); tabs[0].style.fontWeight = '600';
    return t => { plate.style.left = px(pl.A.at(t)); plate.style.width = px(Math.max(0, pl.B.at(t) - pl.A.at(t)));
      const ww = px(w.at(t)); rows.forEach(r => { r.tw.style.width = ww;
        r.L.forEach((l,k) => r.sw.apply(l,k,t));
        r.r.style.opacity = clamp(r.o.at(t)).toFixed(3);
        r.r.style.pointerEvents = r.o.target < .5 ? 'none' : 'auto'; }); };
  }});
