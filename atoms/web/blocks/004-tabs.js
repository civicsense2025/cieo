/* Content: keep Cieo's edge, height and content-swap springs; improve the actual tab view. */
atom({
  id:'tabs', cat:'Content', name:'Tabs with panel', block:'tabs', fam:['E','S','M'], tall:true,
  html:`<div class="col" style="width:min(380px,90%);gap:16px">
    <div class="seg tabsx" role="tablist" aria-label="Collection details" style="padding:4px;border-radius:16px">
      <div class="ind" aria-hidden="true"></div>
      <button type="button" role="tab">Overview</button><button type="button" role="tab">Activity</button><button type="button" role="tab">Billing</button>
    </div><div class="card panel" style="position:relative;overflow:hidden;border-radius:16px"></div>
  </div>`,
  desc:'The indicator follows two spring edges. Content swaps while the panel adapts to its measured height. Arrow keys move between tabs.',
  api:'ind.go(l, r)   panel.h.set(measure(next))   swap.to(i)',
  init(st){
    const seg=$(st,'.tabsx'), ind=$(seg,'.ind'), btns=$$(seg,'button'), panel=$(st,'.panel');
    const content=[
      ['A little room to create.','Three pages published this week. Everything for the next idea, together in one collection.'],
      ['The work keeps moving.','Maya edited “Spring launch”. Theo left a note. Two new people joined the collection.'],
      ['Everything in its place.','Studio plan · $24 per month. Next invoice on October 12. Visa ending 4242.'],
    ];
    const prefix=st.closest('[id]')?.id || 'cieo-tabs';
    const layers=content.map(([title,text],i)=>{
      const d=document.createElement('div'); d.className='layer';
      Object.assign(d.style,{whiteSpace:'normal',alignItems:'flex-start',justifyContent:'flex-start',flexDirection:'column',gap:'8px',padding:'24px',bottom:'auto'});
      const strong=document.createElement('strong'), body=document.createElement('span');
      strong.textContent=title; body.textContent=text; body.style.color='var(--muted)'; body.style.fontSize='14px'; body.style.lineHeight='1.6';
      d.append(strong,body); d.id=prefix+'-panel-'+i; d.setAttribute('role','tabpanel');
      d.setAttribute('aria-labelledby',prefix+'-tab-'+i); d.tabIndex=0; panel.append(d); return d;
    });
    const e=edges(0,0), h=new Track(0), sw=new Swap(0);
    const select=(i,instant=false)=>{
      const b=btns[i], l=b.offsetLeft, r=l+b.offsetWidth;
      btns.forEach((button,j)=>{
        button.id=prefix+'-tab-'+j; button.setAttribute('aria-controls',layers[j].id);
        button.setAttribute('aria-selected',String(i===j)); button.tabIndex=i===j?0:-1;
        layers[j].setAttribute('aria-hidden',String(i!==j)); layers[j].inert=i!==j;
      });
      if(instant){e.jump(l,r);h.jump(layers[i].offsetHeight);}else{e.go(l,r);h.set(layers[i].offsetHeight);sw.to(i);}
    };
    btns.forEach((button,i)=>{
      button.onclick=()=>select(i);
      button.onkeydown=event=>{
        const rtl=getComputedStyle(seg).direction==='rtl'; let next=i;
        if(event.key==='ArrowRight')next=(i+(rtl?2:1))%3;
        else if(event.key==='ArrowLeft')next=(i+(rtl?1:2))%3;
        else if(event.key==='Home')next=0;
        else if(event.key==='End')next=2;
        else return;
        event.preventDefault();select(next);btns[next].focus();
      };
    });
    const measure=()=>select(sw.cur,true);
    // Width changes include breakpoints and moving this same node into the inspector.
    const resize=new ResizeObserver(measure);resize.observe(seg);
    document.fonts.ready.then(measure);requestAnimationFrame(measure);
    return t=>{
      const l=e.A.at(t),r=e.B.at(t);
      Object.assign(ind.style,{transform:`translate(${px(l)},4px)`,width:px(r-l),height:'calc(100% - 8px)'});
      panel.style.height=px(h.at(t));layers.forEach((el,k)=>sw.apply(el,k,t));
    };
  },
});
