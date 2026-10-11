

atom({ id:'contextmenu', cat:'Overlays', name:'Context menu', block:'Context menu primitive, collection', fam:['X'], tall:true,
  html:`<div class="col" style="gap:8px;align-items:center;width:100%"><div class="row small muted" style="gap:8px"><span>Confirm delete</span><button class="btn cf" aria-pressed="true">On</button><button class="btn un" style="visibility:hidden">Undo</button></div><div class="frw" style="overflow:hidden;width:min(260px,88%)"><div class="card row fr" style="padding:12px 16px;gap:10px">${ic(I.file,20,1.75)}<span class="col" style="gap:0"><b class="small">Q3-report.pdf</b><span class="small muted">2.4 MB · edited today</span></span></div></div></div><div class="cm card" role="menu" style="position:absolute;left:0;top:0;width:180px;padding:6px;visibility:hidden"></div><div class="df card" role="alertdialog" aria-label="Confirm delete" style="position:absolute;left:50%;top:50%;width:min(230px,82%);padding:16px;visibility:hidden"><b class="small" style="display:block">Delete “Q3-report.pdf”?</b><p class="small muted" style="margin:6px 0 14px">It moves to trash. You can undo right after.</p><div class="row" style="justify-content:flex-end"><button class="btn cc">Cancel</button><button class="btn dc" style="background:var(--danger);border-color:var(--danger);color:#fff">Delete</button></div></div><div class="hint st"></div>`,
  desc:'Right-click, or long-press on touch, opens the menu at the pointer. It grows from that exact corner and flips when it would overflow. Items fade in 25ms apart; the destructive item is danger-colored. Delete asks first in a danger confirm mirroring the dialog, then the row collapses and the hint swaps to trash with Undo, which springs the row back.',
  api:'menu.at(pointer); origin = flipped ? "right" : "left"; item[i].o = prog(t, tOpen + i·0.025)   delete: confirm.o.set(1); on confirm: row.o→0, row.h→0 (t+EXIT); undo: row.h→1, row.o→1 (t+EXIT)',
  init(st){
    const cm = $(st,'.cm'), hint = $(st,'.st') || st.appendChild(Object.assign(document.createElement('div'), { className:'hint st' })), frw = $(st,'.frw'), fr = $(st,'.fr'), cf = $(st,'.cf'), un = $(st,'.un'), df = $(st,'.df'), IT = ['Open','Rename','Duplicate','Move to…','—','Delete'];
    let confirmOn = true, deleted = false;
    cf.onclick = () => { confirmOn = !confirmOn; cf.setAttribute('aria-pressed', String(confirmOn)); cf.textContent = confirmOn ? 'On' : 'Off'; };
    const items = IT.map(n => { if (n === '—'){ const h = document.createElement('hr'); h.style.cssText = 'border:0;border-top:1px solid var(--line-soft);margin:4px 0'; cm.appendChild(h); return { el:h }; }
      const b = document.createElement('button'); b.setAttribute('role','menuitem'); b.textContent = n; b.style.cssText = `display:block;width:100%;text-align:left;border:0;background:none;padding:7px 10px;border-radius:7px;font-size:14px;cursor:pointer;color:${n === 'Delete' ? 'var(--danger)' : 'var(--ink)'}`;
      b.onpointerenter = () => b.style.background = n === 'Delete' ? 'var(--danger-tint)' : 'var(--raised)'; b.onpointerleave = () => b.style.background = 'none';
      b.onclick = () => { if (n === 'Delete'){ if (deleted){ set(false); return; } if (confirmOn){ set(false); setConfirm(true); } else doDelete(); } else { set(false); msg(`${n.replace('…','')}: Q3-report.pdf`); } }; cm.appendChild(b); return { el:b }; });
    const o = new Track(0), co = new Track(0), fh = new Track(1), fo = new Track(1), uo = new Track(0), sw = new Swap(0), M = ['Right-click or long-press anywhere here']; const ml = [];
    const msg = s => { M.push(s); const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; hint.appendChild(e); ml.push(e); sw.to(M.length - 1); };
    const first = document.createElement('span'); first.className = 'layer'; first.textContent = M[0]; hint.appendChild(first); ml.push(first); hint.style.height = '18px';
    let tOpen = -9;
    const set = (v, x, y) => { if (v){ const W = st.clientWidth, H = st.clientHeight, w = 180, h = cm.offsetHeight || 210, fx = x + w > W - 8, fy = y + h > H - 8;
      cm.style.left = px(fx ? x - w : x); cm.style.top = px(fy ? Math.max(8, y - h) : y); cm.style.transformOrigin = `${fx ? '100%' : '0'} ${fy ? '100%' : '0'}`; tOpen = now(); } openSet(o, v); };
    const setConfirm = v => { openSet(co, v); if (v) setTimeout(() => $(df,'.cc').focus(), 0); };
    const doDelete = () => { if (deleted) return; deleted = true; const t0 = now(); set(false); setConfirm(false);
      fo.set(0, S.snap, t0 + .12); fh.set(0, S.base, t0 + .12 + EXIT); uo.set(1, S.base, t0 + .12); msg('Moved Q3-report.pdf to trash'); };
    const undo = () => { if (!deleted) return; deleted = false; const t0 = now();
      fh.set(1, S.base, t0); fo.set(1, S.base, t0 + EXIT); uo.set(0, S.snap, t0); msg('Restored Q3-report.pdf'); };
    un.onclick = undo;
    $(df,'.cc').onclick = () => setConfirm(false);
    $(df,'.dc').onclick = doDelete;
    const at = ev => { const r = st.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
    st.addEventListener('contextmenu', ev => { ev.preventDefault(); set(true, ...at(ev)); });
    let lp = 0; st.addEventListener('pointerdown', ev => { if (!cm.contains(ev.target)) set(false); if (ev.pointerType === 'touch'){ const p = at(ev); lp = setTimeout(() => set(true, ...p), 450); } });
    st.addEventListener('pointerup', () => clearTimeout(lp)); st.addEventListener('pointermove', () => clearTimeout(lp)); st.addEventListener('keydown', ev => { if (ev.key === 'Escape'){ if (co.target) setConfirm(false); else set(false); } });
    return t => { const p = clamp(o.at(t)); pop(cm, p, 0); items.forEach((x,i) => x.el.style.opacity = (o.target ? clamp(prog(t, tOpen + .03 + i*.025)) : p).toFixed(3)); ml.forEach((e,k) => sw.apply(e,k,t));
      frw.style.height = px(Math.max(0, clamp(fh.at(t)) * fr.offsetHeight)); fade(fr, fo.at(t), null);
      const cp = clamp(co.at(t)); df.style.opacity = cp.toFixed(3); df.style.visibility = cp < .01 && !co.target ? 'hidden' : 'visible';
      df.style.transform = `translate(-50%, calc(-50% + ${px((1-cp)*8)})) scale(${(.96+.04*cp).toFixed(4)})`; df.style.pointerEvents = cp > .5 ? 'auto' : 'none';
      fade(un, uo.at(t), null); un.style.visibility = (uo.target || uo.at(t) > .01) ? 'visible' : 'hidden'; un.disabled = !uo.target; };
  }});