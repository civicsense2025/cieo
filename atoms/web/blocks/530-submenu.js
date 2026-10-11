atom({ id:'submenu', cat:'Overlays', name:'Context submenu', block:'Submenu slide, arrow turns', fam:['X','E'], tall:true,
  html:`<div class="col" style="gap:8px;align-items:center"><button class="btn ink mn" aria-haspopup="menu" style="min-height:36px">Open menu</button><div class="wrap" style="position:relative;width:230px;height:170px"><div class="m1 card" role="menu" style="position:absolute;left:0;top:0;width:150px;padding:6px"></div><div class="m2 card" role="menu" aria-label="Share submenu" style="position:absolute;left:150px;top:24px;width:150px;padding:6px;visibility:hidden"></div></div></div><label class="row small muted" style="gap:6px;position:absolute;top:10px;right:12px;font-size:12px"><input type="checkbox" class="st" checked> keep parent open</label><div class="hint">Esc steps back one level</div>`,
  desc:'The child slides 12px from the parent edge on base while edges trail 60ms. The parent stays put, the arrow turns, and Esc steps back one level.',
  api:'child.x: edges(A,B) trail .06; arrow rotate with open',
  init(st){
    const m1 = $(st,'.m1'), m2 = $(st,'.m2'), o1 = new Track(0);
    const e = edges(12, 12); e.jump(12, 12);
    const P = [['Share \u203a', true],['Rename', false],['Duplicate', false],['Delete', false]], C = ['Copy link','Email','Messages'];
    const mk = (host, names, fn) => names.map(n => { const b = document.createElement('button'); b.setAttribute('role','menuitem'); b.textContent = n;
      b.style.cssText = 'display:block;width:100%;text-align:left;border:0;background:none;padding:7px 10px;border-radius:7px;font-size:13.5px;line-height:1.5;cursor:pointer;min-height:36px';
      if (n === 'Delete') b.style.color = 'var(--danger)'; b.onclick = () => fn(n, b); host.appendChild(b); return b; });
    let child = false; const co = new Track(0);
    const arrow = mk(m1, P.map(p => p[0]), (n, b) => { if (n.startsWith('Share')){ child = true; co.set(1); e.go(0, 0); b.style.background = 'var(--raised)'; } else { b.style.background = 'var(--raised)'; setTimeout(() => b.style.background = 'none', 300); } });
    mk(m2, C, n => { arrow[0].style.background = 'none'; });
    const set = v => { openSet(o1, v); if (!v){ openSet(co, false); child = false; } };
    $(st,'.mn').onclick = ev => { last = ev.currentTarget; set(!o1.target); if (o1.target) setTimeout(() => arrow[0].focus(), 0); };
    let last = null;
    st.addEventListener('keydown', ev => { if (ev.key !== 'Escape') return; if (co.target){ openSet(co, false); child = false; arrow[0].focus(); } else if (o1.target){ set(false); last?.focus?.(); } });
    st.addEventListener('pointerdown', ev => { if (!st.contains(ev.target)) return; if (!ev.target.closest('.m1,.m2,.mn') && o1.target) set(false); });
    return t => { const p = clamp(o1.at(t)); pop(m1, p, -4);
      const cp = clamp(co.at(t)); m2.style.opacity = cp.toFixed(3); m2.style.visibility = cp < .01 ? 'hidden' : 'visible';
      m2.style.transform = `translateX(${px(e.A.at(t))})`; m2.style.filter = cp < .98 ? `blur(${((1-cp)*4).toFixed(2)}px)` : 'none'; m2.style.pointerEvents = cp > .5 ? 'auto' : 'none';
      arrow[0].style.transform = `translateX(${px(e.B.at(t)*.2)})`; };
  }});
