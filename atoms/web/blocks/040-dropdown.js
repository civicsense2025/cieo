/* Admin: source-owned menu geometry, keyboard navigation and checked selection. */
atom({
  id:'dropdown',cat:'Admin',name:'Dropdown',block:'Select / menu primitive',fam:['X','S'],tall:true,
  html:`<div style="position:absolute;top:40px;left:50%;transform:translateX(-50%);width:min(248px,88%)">
    <button type="button" class="btn dd" aria-haspopup="menu" aria-expanded="false" style="position:relative;display:flex;align-items:center;gap:8px;width:100%;min-height:40px;justify-content:space-between;border-radius:16px;border:0;background:var(--raised)">
      <span class="lbw" style="position:relative;height:24px;flex:1;text-align:left"></span><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>
    </button><div class="mn card" role="menu" aria-label="Sort collection" aria-hidden="true" inert style="position:absolute;top:48px;left:0;width:100%;padding:8px;border-radius:16px;transform-origin:24px 0;visibility:hidden"></div>
  </div>`,
  desc:'A soft menu, anchored to its trigger. Arrow keys, Home, End and typeahead move through options; Escape restores focus. The selected label keeps its original content-swap spring.',
  api:'menu.o.set(open); item[i].o = prog(t, tOpen + i*0.03)',
  init(st){
    const dd=$(st,'.dd'),mn=$(st,'.mn'),lbw=$(st,'.lbw');
    const options=['Newest first','Oldest first','Most viewed','Alphabetical'];
    mn.id=(st.closest('[id]')?.id||'cieo-dropdown')+'-menu';dd.setAttribute('aria-controls',mn.id);
    const labels=options.map(text=>{const e=document.createElement('span');e.className='layer';e.style.justifyContent='flex-start';e.textContent=text;lbw.append(e);return e;});
    const sw=new Swap(0),o=new Track(0);let openedAt=-9,selected=0,active=0,typing='',typedAt=0;
    const items=options.map((text,i)=>{
      const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitemradio');b.tabIndex=-1;
      b.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:40px;text-align:left;border:0;background:none;padding:8px 16px;border-radius:8px;font:14px var(--sans);color:var(--ink);cursor:pointer';
      const name=document.createElement('span'),mark=document.createElement('span');name.textContent=text;mark.textContent='✓';mark.setAttribute('aria-hidden','true');b.append(name,mark);
      b.onpointerenter=()=>{active=i;paint();};b.onpointerleave=()=>{active=-1;paint();};
      b.onclick=()=>{selected=i;sw.to(i);set(false);paint();dd.focus();};mn.append(b);return b;
    });
    const paint=()=>items.forEach((b,i)=>{b.setAttribute('aria-checked',String(i===selected));b.lastChild.style.visibility=i===selected?'visible':'hidden';b.style.background=i===active?'var(--raised)':'none';});
    const focus=i=>{active=(i+items.length)%items.length;items[active].focus();paint();};
    const set=(value,focusIndex)=>{
      o.set(value?1:0,value?S.base:S.snap);dd.setAttribute('aria-expanded',String(value));mn.inert=!value;mn.setAttribute('aria-hidden',String(!value));
      if(value){openedAt=now();mn.style.visibility='visible';if(focusIndex!==undefined)focus(focusIndex);}
    };
    dd.onclick=event=>{event.stopPropagation();set(!o.target);};
    dd.onkeydown=event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();set(true,event.key==='ArrowDown'?selected:items.length-1);}};
    mn.onkeydown=event=>{
      const at=items.indexOf(document.activeElement);
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();set(false);dd.focus();}
      else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();focus(at+(event.key==='ArrowDown'?1:-1));}
      else if(event.key==='Home'||event.key==='End'){event.preventDefault();focus(event.key==='Home'?0:items.length-1);}
      else if(event.key==='Tab'){set(false);dd.focus();}
      else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&event.key!==' '){
        const t=performance.now();typing=(t-typedAt>700?'':typing)+event.key.toLowerCase();typedAt=t;
        const found=options.findIndex(text=>text.toLowerCase().startsWith(typing));if(found>=0){event.preventDefault();focus(found);}
      }
    };
    document.addEventListener('pointerdown',event=>{if(o.target&&!mn.contains(event.target)&&!dd.contains(event.target))set(false);});
    paint();
    return t=>{
      const p=clamp(o.at(t));mn.style.opacity=p.toFixed(3);mn.style.visibility=p<.01&&!o.target?'hidden':'visible';
      mn.style.transform=`translateY(${px((1-p)*-4)}) scale(${(.97+.03*p).toFixed(4)})`;mn.style.filter=p<.98?`blur(${((1-p)*BLUR).toFixed(2)}px)`:'none';
      items.forEach((b,i)=>b.style.opacity=(o.target?clamp(prog(t,openedAt+.04+i*.03)):p).toFixed(3));
      labels.forEach((e,k)=>{sw.apply(e,k,t);e.setAttribute('aria-hidden',String(k!==sw.cur));});
    };
  },
});
