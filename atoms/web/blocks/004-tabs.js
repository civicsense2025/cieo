/* One panel, three states: the existing edge + swap + height springs remain. */
atom({id:'tabs',cat:'Content',name:'Tabs with panel',block:'tabs',fam:['E','S','M'],tall:true,
  html:`<div class="col" style="width:min(352px,calc(100% - 48px));gap:16px"><div class="seg tabsx" role="tablist" aria-label="Project information"><div class="ind"></div><button type="button" role="tab">Overview</button><button type="button" role="tab">Activity</button><button type="button" role="tab">Billing</button></div><div class="card panel" style="position:relative;overflow:hidden"></div></div>`,
  desc:'The active pill follows with lagging edges. Content swaps and the surface resizes together. Arrow keys, Home and End change tabs.',
  api:'indicator.go(left, right)   panelHeight.set(nextHeight)   content.to(index)',
  init(st){
    const seg=$(st,'.tabsx'),ind=$(seg,'.ind'),btns=$$(seg,'button'),panel=$(st,'.panel');
    const content=[
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:16px"><span class="muted small">This week</span><span style="color:var(--success);font-size:11px;background:var(--success-tint);padding:4px 8px;border-radius:8px">↗ 18%</span></div><div style="font-size:32px;font-weight:600;letter-spacing:-1px;margin:16px 0 8px">A good start.</div><div style="font-size:12px;color:var(--muted);line-height:1.6">Three pages published. A little more room for your next idea.</div><div aria-hidden="true" style="display:flex;align-items:end;gap:8px;height:48px;margin-top:16px"><i style="height:40%;flex:1;background:var(--accent-tint);border-radius:4px"></i><i style="height:65%;flex:1;background:var(--accent-tint);border-radius:4px"></i><i style="height:50%;flex:1;background:var(--accent-tint);border-radius:4px"></i><i style="height:85%;flex:1;background:var(--accent);border-radius:4px"></i><i style="height:100%;flex:1;background:var(--accent);border-radius:4px"></i></div>',
      '<div style="font-weight:600;font-size:16px;margin-bottom:16px">A few things happened.</div><div style="display:flex;gap:8px;align-items:center;font-size:12px;padding-block:8px"><span style="width:24px;height:24px;background:var(--accent-tint);border-radius:50%;display:grid;place-items:center">M</span>Maya edited Spring launch.</div><div style="display:flex;gap:8px;align-items:center;font-size:12px;padding-block:8px"><span style="width:24px;height:24px;background:var(--success-tint);border-radius:50%;display:grid;place-items:center">T</span>Theo left a little feedback.</div>',
      '<div class="muted small">Your workspace</div><div style="font-size:24px;font-weight:600;letter-spacing:-.5px;margin:16px 0 8px">Studio plan</div><div class="small">$24 <span class="muted">/ month</span></div><div style="font-size:11px;color:var(--muted);margin-top:16px">Next invoice · October 12</div>'
    ];
    const layers=content.map((html,i)=>{const d=document.createElement('div');d.className='layer';d.id=`tabs-panel-${i}`;d.setAttribute('role','tabpanel');d.setAttribute('aria-labelledby',`tabs-tab-${i}`);Object.assign(d.style,{display:'block',whiteSpace:'normal',padding:'24px',bottom:'auto'});d.innerHTML=html;panel.append(d);return d});
    const e=edges(0,0),h=new Track(0),sw=new Swap(0);let current=0;
    const select=(i,instant=false)=>{
      current=i;const button=btns[i],left=button.offsetLeft,right=left+button.offsetWidth;
      btns.forEach((b,j)=>{b.id=`tabs-tab-${j}`;b.setAttribute('aria-controls',`tabs-panel-${j}`);b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1;layers[j].setAttribute('aria-hidden',String(i!==j))});
      if(instant){e.jump(left,right);h.jump(layers[i].offsetHeight)}else{e.go(left,right);h.set(layers[i].offsetHeight);sw.to(i)}
    };
    btns.forEach((button,i)=>{button.onclick=()=>select(i);button.onkeydown=ev=>{const next={ArrowRight:(i+1)%3,ArrowLeft:(i+2)%3,Home:0,End:2}[ev.key];if(next!==undefined){ev.preventDefault();select(next);btns[next].focus()}}});
    const measure=()=>select(current,true);new ResizeObserver(measure).observe(seg);document.fonts.ready.then(measure);requestAnimationFrame(measure);
    return t=>{const l=e.A.at(t);Object.assign(ind.style,{transform:`translate(${px(l)},4px)`,width:px(e.B.at(t)-l),height:'calc(100% - 8px)'});panel.style.height=px(h.at(t));layers.forEach((el,k)=>sw.apply(el,k,t))};
  }
});
