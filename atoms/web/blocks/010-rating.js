

atom({ id:'rating', cat:'Content', name:'Rating', block:'rating, reviews', fam:['D'],
  html:`<div class="col" style="align-items:center;gap:12px"><div class="rt" style="position:relative;cursor:pointer;touch-action:none" role="slider" tabindex="0" aria-label="Rating" aria-valuemin="0" aria-valuemax="5" aria-valuenow="3.5" aria-valuetext="3.5 of 5"><div class="row stars" style="gap:4px;color:var(--line)"></div><div class="over" style="position:absolute;inset:0;overflow:hidden"><div class="row stars" style="gap:4px;color:var(--ink);width:max-content;flex-wrap:nowrap"></div></div></div><span class="num small muted val">3.5 of 5</span></div><div class="hint">Hover to preview, click to set</div>`,
  desc:'While the pointer is over it, the fill follows the cursor exactly. On leave it settles back to the saved value.',
  api:'fill = hovering ? pointerX : v.at(t)',
  init(st){
    const rt = $(st,'.rt'), over = $(st,'.over'), val = $(st,'.val');
    const star = '<svg style="flex:none" width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"/></svg>';
    $$(st,'.stars').forEach(s => s.innerHTML = star.repeat(5));
    const v = new Track(3.5); let hover = null;
    const at = e => { const r = rt.getBoundingClientRect(); return clamp((e.clientX - r.left)/r.width)*5; };
    rt.onpointermove = e => hover = at(e); rt.onpointerleave = () => { if (hover !== null){ v.release(hover, 0, v.target); hover = null; } };
    rt.onclick = e => { const s = Math.max(.5, Math.round(at(e)*2)/2); v.jump(s); hover = at(e); };
    rt.onkeydown = e => { if (e.key === 'ArrowRight') v.set(Math.min(5, v.target + .5)); if (e.key === 'ArrowLeft') v.set(Math.max(.5, v.target - .5)); };
    return t => { const x = hover ?? v.at(t); over.style.width = (x/5*100).toFixed(2) + '%'; val.textContent = `${v.target} of 5`; rt.setAttribute('aria-valuenow', v.target); rt.setAttribute('aria-valuetext', `${v.target} of 5`); };
  }});