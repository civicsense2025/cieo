

atom({ id:'tabstrip', cat:'Files and browsing', name:'Browser tabs', block:'tabs, editor', fam:['M','E','X'], wide:true,
  html:`<div class="col" style="width:min(620px,94%);gap:0"><div class="tsx row" style="position:relative;gap:0;padding:6px 6px 0;background:var(--raised);border-radius:12px 12px 0 0;height:42px;align-items:flex-end;overflow:hidden"><i class="ind" style="position:absolute;bottom:0;height:36px;border-radius:9px 9px 0 0;background:var(--card)"></i><button class="nt" aria-label="New tab" style="position:relative;width:30px;height:30px;margin-bottom:3px;border:0;background:none;cursor:pointer;color:var(--muted);flex:none;font-size:18px">+</button></div><div class="pg card small" style="border-radius:0 0 12px 12px;height:90px;position:relative"></div></div>`,
  desc:'New tabs open from zero width while their siblings make room; closed tabs fade their label, then collapse. The active surface slides between tabs with lagging edges and the page content swaps.',
  api:'tab.w.set(1); label.o.set(1, t + 0.06)   close: o→0, w→0 at t + 0.1   active.go(l, r)',
  init(st){
    const tsx = $(st,'.tsx'), ind = $(st,'.ind'), nt = $(st,'.nt'), pg = $(st,'.pg'), N = ['Inbox','Docs · Spring launch','Figma · Hero','Analytics','Search: yearly pricing','Calendar'];
    let tabs = [], act = null, k = 0; const W = 150;
    const add = (inst) => { const name = N[k++ % N.length], b = document.createElement('div'); b.style.cssText = 'position:relative;flex:none;height:36px;overflow:hidden;cursor:pointer';
      b.setAttribute('role', 'tab'); b.tabIndex = 0; b.setAttribute('aria-label', name); b.setAttribute('aria-selected', 'false');
      b.innerHTML = `<span class="lb" style="position:absolute;left:12px;right:28px;top:9px;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</span><button aria-label="Close ${name}" style="position:absolute;right:6px;top:8px;width:20px;height:20px;border:0;border-radius:5px;background:none;cursor:pointer;color:var(--muted);display:grid;place-items:center">${ic(I.x,11,2.5)}</button>`;
      tsx.insertBefore(b, nt); const pane = document.createElement('div'); pane.className = 'layer'; pane.style.cssText += 'justify-content:flex-start;align-items:flex-start;padding:14px 16px;white-space:normal'; pane.innerHTML = `<b>${name}</b>`; pg.appendChild(pane);
      const tb = { b, lb:$(b,'.lb'), pane, w:new Track(inst ? 1 : 0), o:new Track(inst ? 1 : 0), gone:false, sw:null };
      if (!inst){ tb.w.set(1); tb.o.set(1, S.base, now() + .06); } b.onclick = () => select(tb); b.onkeydown = ev => { if (ev.target !== b) return; if (ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); select(tb); } }; $(b,'button').onclick = ev => { ev.stopPropagation(); close(tb); }; tabs.push(tb); select(tb, inst); };
    const psw = new Swap(null);
    const select = tb => { act = tb; psw.to(tb); tabs.forEach(x => x.b.setAttribute('aria-selected', String(x === tb))); };
    const close = tb => { if (tabs.filter(x => !x.gone).length < 2) return; tb.gone = true; tb.o.set(0, S.snap); tb.w.set(0, S.base, now() + EXIT); if (act === tb){ const live = tabs.filter(x => !x.gone); select(live[Math.max(0, live.length - 1)]); } };
    nt.onclick = () => add(); add(true); add(true); add(true); select(tabs[0], true); psw.cur = tabs[0]; psw.prev = null; psw.t = -9;
    // indicator = live rect of the active tab + a decaying offset from the previous tab (edges lag)
    const dL = new Track(0), dR = new Track(0); let shownL = 0, shownR = 0, prevAct = null;
    return t => { tabs = tabs.filter(tb => { if (tb.gone && tb.w.prune(t) === 0){ tb.b.remove(); tb.pane.remove(); return false; } return true; });
      tabs.forEach(tb => { tb.b.style.width = px(W*clamp(tb.w.at(t))); fade(tb.lb, tb.o.at(t), null); psw.apply(tb.pane, tb, t, 0); });
      if (!act) return; const l = act.b.offsetLeft, r = l + act.b.offsetWidth;
      if (act !== prevAct){ if (prevAct){ const right = l >= shownL; dL.jump(shownL - l).set(0, S.base, t + (right ? LAG : 0)); dR.jump(shownR - r).set(0, S.base, t + (right ? 0 : LAG)); } prevAct = act; }
      shownL = l + dL.at(t); shownR = r + dR.at(t); ind.style.left = px(shownL); ind.style.width = px(Math.max(0, shownR - shownL)); };
  }});