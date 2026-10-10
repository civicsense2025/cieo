

atom({ id:'avatars', cat:'Content', name:'Avatar group', block:'profile-header, testimonial, Avatar', fam:['M','X'],
  html:`<div class="col" style="gap:4px"><div class="ag" style="position:relative;height:40px;width:220px"></div><div class="row small muted" style="gap:6px;flex-wrap:wrap">Thumbnails <button class="btn th-on" aria-pressed="false" style="padding:2px 9px;font-size:12px">With</button><button class="btn th-off" aria-pressed="true" style="padding:2px 9px;font-size:12px">Without</button><span style="opacity:.4">·</span> Density <button class="btn dn-cf" aria-pressed="true" style="padding:2px 9px;font-size:12px">Comfortable</button><button class="btn dn-dn" aria-pressed="false" style="padding:2px 9px;font-size:12px">Dense</button></div></div><div class="hint">Hover the group, then a face</div>`,
  desc:'Hovering the stack fans the avatars apart with a 30ms stagger. Hovering one face shows its name above it with the popover rule. Thumbnails swap initials for photo thumbs; dense tightens the pitch.',
  api:'avatar[i].x.set(open ? i·pitch.open : i·pitch.shut, S.base, t + i·0.03)   thumbs.o.set(1)   size.set(dense ? 32 : 40)',
  init(st){
    const ag = $(st,'.ag'), P = [['MC','Maya Chen','var(--accent)','linear-gradient(135deg,#7aa2ff,#3b5bdb)'],['TP','Theo Park','var(--ink)','linear-gradient(135deg,#69db7c,#2b8a3e)'],['AK','Ada Kim','var(--muted)','linear-gradient(135deg,#ffa8a8,#e64980)'],['JW','Jonas Weber','var(--faint)','linear-gradient(135deg,#ffec99,#f08c00)'],['+3','3 more','var(--raised)','linear-gradient(135deg,#e7f5ff,#74c0fc)']];
    let thumbs = false, dense = false;
    const pitch = () => dense ? [16,32] : [24,44];
    const tho = new Track(0), sz = new Track(40);
    const av = P.map(([s,n,c,g],i) => { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:0;top:0;width:40px;height:40px;border-radius:50%;background:${c};color:${i === 4 ? 'var(--ink)' : 'var(--card)'};border:2px solid var(--tile);display:grid;place-items:center;font:600 12px var(--sans);z-index:${10 - i}`;
      d.innerHTML = `<span class="ini">${s}</span><span class="th" style="position:absolute;inset:0;border-radius:50%;background:${g};opacity:0"></span><span class="tp" style="position:absolute;z-index:30;bottom:calc(100% + 8px);left:50%;transform-origin:50% 100%;white-space:nowrap;background:var(--ink);color:var(--card);font:500 12px var(--sans);padding:4px 8px;border-radius:6px;visibility:hidden"></span>`; $(d,'.tp').textContent = n;
      ag.appendChild(d); const a = { d, ini:$(d,'.ini'), th:$(d,'.th'), tp:$(d,'.tp'), x:new Track(i*24), o:new Track(0) }; d.onpointerenter = () => a.o.set(1); d.onpointerleave = () => a.o.set(0, S.snap); return a; });
    let spread = false;
    const set = open => { spread = open; const t0 = now(), [shut, opn] = pitch(); av.forEach((a,i) => { const v = i*(open ? opn : shut); if (REDUCE) a.x.jump(v); else a.x.set(v, S.base, t0 + i*.03); }); };
    const seg = (ons, offs, get, set2) => { const bs = [$(st,ons), $(st,offs)];
      const pick = v => { set2(v); bs.forEach((b,i) => { const on = (i === 0) === v; b.setAttribute('aria-pressed', on); b.classList.toggle('ink', on); }); };
      bs.forEach((b,i) => b.onclick = () => pick(i === 0)); pick(get()); return pick; };
    seg('.th-on','.th-off', () => thumbs, v => { thumbs = v; if (REDUCE) tho.jump(v ? 1 : 0); else tho.set(v ? 1 : 0); });
    seg('.dn-cf','.dn-dn', () => !dense, v => { dense = !v; const t0 = now(), [shut, opn] = pitch();
      if (REDUCE){ sz.jump(dense ? 32 : 40); av.forEach((a,i) => a.x.jump(i*(spread ? opn : shut))); }
      else { sz.set(dense ? 32 : 40); av.forEach((a,i) => a.x.set(i*(spread ? opn : shut), S.base, t0 + i*.03)); } });
    ag.onpointerenter = () => set(true); ag.onpointerleave = () => set(false);
    return t => { const p = clamp(tho.at(t)), s = sz.at(t); av.forEach(a => { a.d.style.transform = `translateX(${px(a.x.at(t))})`; a.d.style.width = a.d.style.height = px(s); a.d.style.top = px((40-s)/2); a.d.style.fontSize = px(s*0.3); a.th.style.opacity = p.toFixed(3); a.ini.style.opacity = (1-p).toFixed(3);
      const q = clamp(a.o.at(t)); a.tp.style.opacity = q.toFixed(3); a.tp.style.visibility = q < .01 ? 'hidden' : 'visible'; a.tp.style.transform = `translate(-50%, ${px((1-q)*4)}) scale(${(.97+.03*q).toFixed(4)})`; }); };
  }});