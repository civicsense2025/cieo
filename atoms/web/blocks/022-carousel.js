

document.head.insertAdjacentHTML('beforeend', `<style id="carousel-opts">.cr-opts .btn{padding:3px 10px;font-size:12.5px}.cr-opts .btn[aria-pressed="true"]{background:var(--ink);color:var(--card);border-color:var(--ink)}</style>`);
atom({ id:'carousel', cat:'Media', name:'Carousel', block:'carousel, testimonial', fam:['D','E'],
  html:`<div class="col" style="width:min(320px,86%);gap:14px;align-items:center"><div class="vp" style="width:100%;overflow:hidden;touch-action:pan-y;cursor:grab;border-radius:14px"><div class="strip" style="display:flex;gap:12px"></div></div><div class="dots" style="position:relative;display:flex;gap:8px"></div><div class="row small muted cr-opts" style="justify-content:space-between;width:100%"><span>Motion</span><span class="row" style="gap:6px" role="group" aria-label="Preview motion"><button type="button" class="btn" data-m="anim" aria-pressed="true">Animate</button><button type="button" class="btn" data-m="inst" aria-pressed="false">Instant</button></span></div></div>`,
  desc:'Drag follows the pointer 1:1 with rubber-banding at the ends. Release projects the velocity forward to pick a slide, then settles from that velocity. Under reduced motion the release and the dot edges jump instantly.',
  api:'i = round((x − v·0.2)/step); reduced: x.jump(i·step), edges.jump; else x.release(x, v, i·step)',
  init(st){
    const vp = $(st,'.vp'), strip = $(st,'.strip'), dots = $(st,'.dots');
    const Q = [['“The editor gets out of the way.”','Priya, Field Notes'],['“We shipped the redesign in a week.”','Jonas, North Studio'],['“Members pay without a second tool.”','Ada, The Ledger'],['“Our pages finally load instantly.”','Sam, Loop Press']];
    Q.forEach(([q,a]) => { const s = document.createElement('div'); s.className = 'card'; s.style.cssText += 'flex:none;padding:18px;height:140px;display:flex;flex-direction:column;justify-content:space-between'; s.innerHTML = `<b style="font-size:17px;letter-spacing:-.01em;line-height:1.3"></b><span class="small muted"></span>`; s.children[0].textContent = q; s.children[1].textContent = a; strip.appendChild(s); });
    Q.forEach(() => { const d = document.createElement('i'); d.style.cssText = 'width:7px;height:7px;border-radius:4px;background:var(--line)'; dots.appendChild(d); });
    const ind = document.createElement('i'); ind.style.cssText = 'position:absolute;top:0;height:7px;border-radius:4px;background:var(--ink)'; dots.appendChild(ind);
    const x = new Track(0), e = edges(0,7); let held = false, hx = 0, sx = 0, cur = 0, inst = false;
    const INST = () => REDUCE || inst;
    const W = () => vp.clientWidth, step = () => W() + 12, max = () => (Q.length-1)*step();
    const slides = $$(strip,'.card');
    const goto = (i, v = 0) => { cur = clamp(i, 0, Q.length-1); if (INST()){ x.jump(cur*step()); e.jump(cur*15, cur*15 + 7); } else { x.release(held ? hx : x.at(), v, cur*step()); e.go(cur*15, cur*15 + 7); } };
    drag(vp, { down:p => { held = true; sx = x.at() + p.cx; hx = x.at(); }, move:p => { let v = sx - p.cx; if (v < 0) v = rb(v, 60); if (v > max()) v = max() + rb(v - max(), 60); hx = v; },
      up:(p, vel) => { const proj = hx + (-vel.vx)*.2; goto(Math.round(proj/step()), -vel.vx); held = false; } });
    vp.tabIndex = 0; vp.onkeydown = ev => { if (ev.key === 'ArrowRight') goto(cur+1); if (ev.key === 'ArrowLeft') goto(cur-1); };
    $$(st,'.cr-opts .btn').forEach(b => b.onclick = () => { inst = b.dataset.m === 'inst'; $$(st,'.cr-opts .btn').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    return t => { slides.forEach(s => s.style.width = px(W())); strip.style.transform = `translateX(${px(-(held ? hx : x.at(t)))})`;
      const a = e.A.at(t), b = e.B.at(t); ind.style.left = px(a); ind.style.width = px(b - a); };
  }});