/* Content: show success only after the clipboard really succeeds. Keep the original swap/morph. */
atom({
  id:'copy',cat:'Content',name:'Copy button',block:'code',fam:['S','M'],
  html:`<div class="col" style="width:min(352px,90%);gap:16px">
    <div class="card" style="position:relative;padding:24px 16px 72px;border-radius:24px;min-width:0">
      <span class="muted" style="font:12px var(--sans)">A small beginning.</span>
      <code style="display:block;overflow:auto;margin-top:16px;font:12px/1.6 var(--mono);white-space:nowrap">import { Track, S } from 'cieo';</code>
      <button type="button" class="cp" aria-label="Copy import" style="position:absolute;right:16px;bottom:16px;height:40px;border-radius:12px;border:1.5px solid var(--muted);background:var(--card);cursor:pointer;overflow:hidden;font:500 13px var(--sans);color:var(--ink)"></button>
    </div><span class="copy-message small muted" role="status" aria-live="polite"></span>
  </div>`,
  desc:'The button widens and swaps only after a successful copy. When clipboard permission is unavailable, the source is selected for manual copying instead of falsely reporting success.',
  api:'await clipboard.writeText(source)   width.set(96)   swap.to(success)',
  init(st){
    const cp=$(st,'.cp'),message=$(st,'.copy-message'),source="import { Track, S } from 'cieo';";
    const icons=[
      '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
      '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg>Copied',
    ].map(html=>{const e=document.createElement('span');e.className='layer';e.style.gap='8px';e.setAttribute('aria-hidden','true');e.innerHTML=html;cp.append(e);return e;});
    const sw=new Swap(0),width=new Track(40),ok=new Track(0);let back=0,pending=false;
    cp.onclick=async()=>{
      if(pending)return;pending=true;cp.setAttribute('aria-busy','true');
      try{
        if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
        await navigator.clipboard.writeText(source);sw.to(1);width.set(96);ok.set(1);back=now()+1.6;
        message.textContent='Import copied.';cp.setAttribute('aria-label','Import copied');
      }catch{
        const selection=getSelection(),range=document.createRange();range.selectNodeContents($(st,'code'));selection.removeAllRanges();selection.addRange(range);
        message.textContent='Clipboard unavailable. The import is selected; copy it with the browser command.';
        cp.setAttribute('aria-label','Try copying import again');
      }finally{pending=false;cp.removeAttribute('aria-busy');window.CieoLibrary?.wake();}
    };
    return t=>{
      if(back&&t>=back){back=0;sw.to(0);width.set(40);ok.set(0);cp.setAttribute('aria-label','Copy import');}
      const g=clamp(ok.at(t));cp.style.width=px(width.at(t));cp.style.color=mix(g,'var(--success)','var(--ink)');
      cp.style.borderColor=mix(g,'var(--success)','var(--muted)');cp.style.background=mix(g,'var(--success-tint)','var(--card)');
      icons.forEach((e,i)=>sw.apply(e,i,t,3));
    };
  },
});
