/* Content: the same edge, height and text springs with a composed, responsive panel. */
atom({
  id: 'tabs', cat: 'Content', name: 'Tabs with panel', block: 'tabs', fam: ['E','S','M'], tall: true,
  html: `<style>
    #tabs .tabs-demo{width:min(384px,calc(100% - 32px));gap:16px}
    #tabs .tabsx{padding:4px;border-radius:16px;background:var(--raised)}
    #tabs .tabsx button{flex:1;min-height:40px;padding:8px;font-size:13px;border-radius:12px}
    #tabs .tabsx .ind{border-radius:12px}
    #tabs .panel{border:1px solid var(--line-soft);border-radius:24px;background:var(--card)}
    #tabs .tab-content{padding:24px;display:flex;flex-direction:column;align-items:stretch;gap:16px;white-space:normal;bottom:auto}
    #tabs .tab-label{font-size:12px;color:var(--muted);margin:0}
    #tabs .tab-number{font-size:40px;font-weight:600;letter-spacing:-.05em;line-height:1.1;margin:0}
    #tabs .tab-note{font-size:12px;color:var(--muted);margin:0;line-height:1.5}
    #tabs .tab-trend{display:flex;align-items:flex-end;gap:8px;height:40px}
    #tabs .tab-trend i{flex:1;background:var(--accent-tint);border-radius:4px 4px 0 0}
    #tabs .tab-trend i:last-child{background:var(--accent)}
    #tabs .tab-activity{display:flex;align-items:center;gap:8px;font-size:12px}
    #tabs .tab-avatar{display:grid;place-items:center;width:32px;height:32px;flex:none;border-radius:50%;background:var(--accent-tint);color:var(--accent);font-weight:600}
  </style>
  <div class="col tabs-demo"><div class="seg tabsx" role="tablist" aria-label="Workspace summary"><div class="ind" aria-hidden="true"></div>
  <button type="button" role="tab">Overview</button><button type="button" role="tab">Activity</button><button type="button" role="tab">Billing</button></div>
  <div class="panel" style="position:relative;overflow:hidden"></div></div>`,
  desc: 'The indicator edges, panel height and panel content use the original Cieo springs. Arrow keys move between tabs.',
  api: 'ind.go(l, r)   panel.h.set(measure(next))   swap.to(i)',
  init(st) {
    const seg=$(st,'.tabsx'), ind=$(seg,'.ind'), btns=$$(seg,'button'), panel=$(st,'.panel');
    const CONTENT=[
      '<p class="tab-label">This week</p><p class="tab-number">12,480</p><div class="tab-trend" aria-hidden="true">'+[40,60,48,76,64,88,100].map(v=>`<i style="height:${v}%"></i>`).join('')+'</div><p class="tab-note">Visitors · 18% more than last week</p>',
      '<p class="tab-label">A little progress, together.</p><div class="tab-activity"><span class="tab-avatar" aria-hidden="true">M</span><span><b>Maya</b> edited Spring launch</span></div><div class="tab-activity"><span class="tab-avatar" aria-hidden="true">T</span><span><b>Theo</b> left a comment</span></div><p class="tab-note">Two new subscribers joined this morning.</p>',
      '<p class="tab-label">Studio plan</p><p class="tab-number">$24<span style="font-size:14px;letter-spacing:0;color:var(--muted)"> / month</span></p><p class="tab-note">Next invoice on October 12.<br>Visa ending in 4242.</p>'
    ];
    const layers=CONTENT.map((html,i)=>{
      const d=document.createElement('div');d.className='layer tab-content';d.id=`tabs-panel-${i}`;
      d.setAttribute('role','tabpanel');d.setAttribute('aria-labelledby',`tabs-trigger-${i}`);d.tabIndex=0;d.innerHTML=html;panel.append(d);return d;
    });
    const e=edges(0,0), h=new Track(0), sw=new Swap(0);
    const sel=(i,instant=false)=>{
      btns.forEach((b,j)=>{b.id=`tabs-trigger-${j}`;b.setAttribute('aria-controls',`tabs-panel-${j}`);b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1;layers[j].inert=i!==j;layers[j].setAttribute('aria-hidden',String(i!==j));});
      const b=btns[i], height=layers[i].offsetHeight;
      if(instant){e.jump(b.offsetLeft,b.offsetLeft+b.offsetWidth);h.jump(height);}
      else{e.go(b.offsetLeft,b.offsetLeft+b.offsetWidth);h.set(height);sw.to(i);}
    };
    btns.forEach((b,i)=>{
      b.onclick=()=>sel(i);
      b.onkeydown=ev=>{
        const rtl=getComputedStyle(seg).direction==='rtl';
        const next=ev.key==='Home'?0:ev.key==='End'?btns.length-1:ev.key==='ArrowRight'?(i+(rtl?-1:1)+btns.length)%btns.length:ev.key==='ArrowLeft'?(i+(rtl?1:-1)+btns.length)%btns.length:null;
        if(next===null)return;ev.preventDefault();sel(next);btns[next].focus();
      };
    });
    const refresh=()=>sel(sw.cur,true);let lastWidth=-1;
    const ro=new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(width!==lastWidth){lastWidth=width;refresh();}});
    ro.observe(seg);document.fonts.ready.then(refresh);requestAnimationFrame(refresh);
    return t=>{
      const l=e.A.at(t),r=e.B.at(t);Object.assign(ind.style,{transform:`translate(${px(l)},4px)`,width:px(r-l),height:'calc(100% - 8px)'});
      panel.style.height=px(h.at(t));layers.forEach((el,k)=>sw.apply(el,k,t));
    };
  }
});
