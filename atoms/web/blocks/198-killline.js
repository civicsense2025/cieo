atom({ id:'killline', cat:'Writing', name:'Kill line', block:'story list', fam:['X','E'], tall:true,
  html:`<div class="col" style="gap:8px;width:min(360px,92%)"><div class="small muted">Drag the middle story past the cut line</div><div class="stage" style="position:relative"><i class="cut" style="position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--line)"></i><div class="rows col" style="gap:8px"></div></div><div class="row" style="gap:8px;align-items:center"><button class="btn rs">Restore</button><span class="st small muted"></span></div></div>`,
  desc:'Dragging a story past the cut line arms a red snap. Letting go past the mark fades the row out, then its space closes and the rest spring up. Restore brings it back.',
  api:'x.release(v)   arm.set(1)   sw.to(cut), h→0   rest spring up',
  init(st){
    const S0 = ['Water rates explained', 'DRAG ME: the footnote nobody read', 'School board recap'];
    const rows = $(st,'.rows'), cut = $(st,'.cut'), info = $(st,'.st');
    const CUT = 190, H0 = 42; cut.style.left = px(CUT);
    const mk = s => { const d = document.createElement('div'); d.className = 'card small';
      d.style.cssText += 'padding:10px 12px;position:relative;overflow:hidden;touch-action:none;user-select:none';
      d.innerHTML = `<span class="a layer">${s}</span><span class="b layer" style="color:var(--danger)">Cut ✕</span>`;
      rows.appendChild(d); return d; };
    const tops = S0.map(mk);
    const mid = tops[1], l0 = mid.querySelector('.a'), l1 = mid.querySelector('.b');
    const x = new Track(0), h = new Track(1), arm = new Track(0), sw = new Swap(0);
    let dead = false;
    if (REDUCE) h.jump(1);
    drag(mid, {
      move: p => { if (dead) return; x.jump(clamp(p.x - 14, 0, 250)); arm.set(x.target > CUT ? 1 : 0, S.snap); },
      up: (p, v) => { if (dead) return;
        if (x.target > CUT){ dead = true; sw.to(1); h.set(0, S.base, now() + EXIT); arm.set(0, S.snap); info.textContent = 'cut'; }
        else x.release(x.target, v.vx * .1, 0); }
    });
    mid.style.cursor = 'grab';
    $(st,'.rs').onclick = () => { dead = false; sw.to(0); h.set(1); x.jump(0); arm.jump(0); info.textContent = ''; };
    return t => { const a = clamp(arm.at(t)), hh = clamp(h.at(t));
      cut.style.background = mix(a, 'var(--danger)', 'var(--line)');
      mid.style.borderColor = mix(a, 'var(--danger)', 'var(--line)');
      mid.style.transform = `translateX(${px(x.at(t))})`;
      mid.style.height = px(Math.max(0, hh * H0)); mid.style.paddingTop = mid.style.paddingBottom = px(hh * 10);
      mid.style.opacity = dead ? hh.toFixed(3) : '1'; mid.style.visibility = hh < .02 ? 'hidden' : 'visible';
      sw.apply(l0, 0, t); sw.apply(l1, 1, t);
      if (!dead) info.textContent = a > .5 ? 'release to cut' : ''; };
  }});
