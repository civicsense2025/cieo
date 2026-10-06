/* Preserve the original menu entrance and text swap; complete the menu's keyboard path. */
atom({
  id:'dropdown',cat:'Admin',name:'Dropdown',block:'Select / menu primitive',fam:['X','S'],tall:true,
  html:`<style>
    #dropdown .dropdown-demo{position:absolute;top:40px;left:50%;transform:translateX(-50%);width:min(256px,calc(100% - 48px))}
    #dropdown .dd-caption{margin:0 0 8px;font-size:12px;color:var(--muted)}
    #dropdown .dd{position:relative;display:flex;align-items:center;gap:8px;width:100%;min-height:48px;padding:8px 16px;border-radius:16px;background:var(--card)}
    #dropdown .lbw{position:relative;height:24px;flex:1;text-align:start;font-size:13px}
    #dropdown .mn{position:absolute;top:calc(100% + 8px);left:0;width:100%;padding:8px;border:1px solid var(--line-soft);border-radius:16px;background:var(--card);box-shadow:var(--shadow);transform-origin:24px 0;visibility:hidden;z-index:2}
    #dropdown .dd-item{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:40px;text-align:start;border:0;background:none;padding:8px 16px;border-radius:8px;font:inherit;font-size:13px;color:var(--ink);cursor:pointer}
    #dropdown .dd-item:hover,#dropdown .dd-item:focus-visible{background:var(--raised)}
    #dropdown .dd-item[aria-checked="true"]{color:var(--accent)}
  </style><div class="dropdown-demo"><p class="dd-caption" id="dropdown-label">Keep it organized</p><button type="button" class="btn dd" aria-haspopup="menu" aria-expanded="false" aria-controls="dropdown-menu"><span class="lbw"></span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div id="dropdown-menu" class="mn" role="menu" aria-labelledby="dropdown-label" inert></div></div>`,
  desc:'The original spring and stagger animate the menu. Arrow keys, Home, End, Escape, Tab and type-ahead support keyboard use.',
  api:'menu.o.set(open); item[i].o = prog(t, tOpen + i*0.03)',
  init(st){
    const dd=$(st,'.dd'),mn=$(st,'.mn'),lbw=$(st,'.lbw'),O=['Newest first','Oldest first','Most viewed','Alphabetical'];
    const labels=O.map(s=>{const el=document.createElement('span');el.className='layer';el.style.justifyContent='flex-start';el.textContent=s;lbw.append(el);return el;});
    const sw=new Swap(0),o=new Track(0);let tOpen=-9,selected=0;
    const items=O.map((s,i)=>{const b=document.createElement('button');b.type='button';b.className='dd-item';b.setAttribute('role','menuitemradio');b.setAttribute('aria-checked',String(i===0));b.tabIndex=-1;
      b.innerHTML='<span></span><span aria-hidden="true"></span>';b.firstChild.textContent=s;b.lastChild.textContent=i===0?'✓':'';
      b.onclick=()=>{selected=i;sw.to(i);items.forEach((x,j)=>{x.setAttribute('aria-checked',String(i===j));x.lastChild.textContent=i===j?'✓':'';});set(false);dd.focus();};mn.append(b);return b;});
    const set=(open,focus=false)=>{
      o.set(open?1:0,open?S.base:S.snap);dd.setAttribute('aria-expanded',String(open));mn.inert=!open;
      if(open){tOpen=now();mn.style.visibility='visible';if(focus)items[selected].focus();}
    };
    dd.onclick=event=>{event.stopPropagation();set(!o.target,true);};
    dd.onkeydown=event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();set(true,true);}if(event.key==='Escape')set(false);};
    mn.onkeydown=event=>{
      const index=items.indexOf(document.activeElement);let next=null;
      if(event.key==='ArrowDown')next=(index+1)%items.length;
      if(event.key==='ArrowUp')next=(index-1+items.length)%items.length;
      if(event.key==='Home')next=0;if(event.key==='End')next=items.length-1;
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();set(false);dd.focus();}
      if(event.key==='Tab'){set(false);return;}
      if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&event.key!==' '){const match=O.findIndex(s=>s.toLowerCase().startsWith(event.key.toLowerCase()));if(match>=0)next=match;}
      if(next!==null){event.preventDefault();items[next].focus();}
    };
    st.addEventListener('pointerdown',event=>{if(!mn.contains(event.target)&&!dd.contains(event.target))set(false);});
    st.addEventListener('focusout',event=>{if(event.relatedTarget&&!st.contains(event.relatedTarget))set(false);});
    return t=>{const p=clamp(o.at(t));mn.style.opacity=p.toFixed(3);mn.style.visibility=p<.01&&!o.target?'hidden':'visible';
      mn.style.transform=`translateY(${px((1-p)*-4)}) scale(${(.97+.03*p).toFixed(4)})`;mn.style.filter=p<.98?`blur(${((1-p)*BLUR).toFixed(2)}px)`:'none';
      items.forEach((b,i)=>{const q=o.target?clamp(prog(t,tOpen+.04+i*.03)):p;b.style.opacity=q.toFixed(3);});
      labels.forEach((el,k)=>sw.apply(el,k,t));};
  }
});
