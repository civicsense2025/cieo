L.chromeJobs=new Set();
L.animateChrome=(element)=>{
 const value=new Track(12,S.base),time=performance.now()/1000;value.set(0,S.base,time);
 const job=t=>{const y=L.systemReduce.matches?0:value.at(t);element.style.transform=`translateY(${y.toFixed(2)}px)`;
  if(Math.abs(y)<.02){element.style.removeProperty('transform');L.chromeJobs.delete(job)}};
 if(!L.systemReduce.matches)L.chromeJobs.add(job);
};
L.dialogOpeners=new WeakMap();
L.openDialog=(dialog,opener)=>{
 if(dialog.open)return;L.dialogOpeners.set(dialog,opener||document.activeElement);dialog.returnValue='';dialog.showModal();L.animateChrome(dialog);
};
L.closeDialog=(dialog,reason='')=>{if(dialog?.open)dialog.close(reason)};
L.installDialogs=()=>{
 for(const dialog of document.querySelectorAll('.l-dialog')){
  dialog.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>L.closeDialog(dialog));
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)L.closeDialog(dialog)}});
  dialog.addEventListener('close',()=>{if(dialog.returnValue==='layout')return;const opener=L.dialogOpeners.get(dialog);if(opener?.isConnected&&opener.getClientRects().length)opener.focus({preventScroll:true})});
 }
 L.get('l-browser').addEventListener('close',()=>L.get('l-sidebar-slot').append(L.get('l-nav')));
 L.get('l-browse').onclick=()=>{L.get('l-browser-body').append(L.get('l-nav'));L.openDialog(L.get('l-browser'),L.get('l-browse'))};
 L.get('l-view').onclick=()=>L.openDialog(L.get('l-settings'),L.get('l-view'));
};
L.inspected=null;
L.inspect=(a,opener)=>{
 L.inspected=a;L.inspectorOpener=opener;document.querySelectorAll('.l-selected').forEach(e=>e.classList.remove('l-selected'));a.el.classList.add('l-selected');
 const content=L.get('l-inspector-content');content.replaceChildren();
 const name=document.createElement('h3');name.id='l-inspector-heading';name.tabIndex=-1;name.textContent=a.name;
 const desc=document.createElement('p');desc.textContent=a.desc;
 const dl=document.createElement('dl');
 dl.innerHTML=`<dt>Category</dt><dd>${L.escape(a.cat)}</dd><dt>Motion</dt><dd>${L.escape(a.fam.map(f=>L.families[f]).join(' · '))}</dd><dt>Runtime</dt><dd>Cieo original</dd>`;
 const code=document.createElement('pre');code.className='l-code';code.textContent=a.api;
 const source=document.createElement('p');source.className='l-source';source.textContent='atoms/web/'+(L.meta[a.id]?.file||'blocks/');
 const expand=document.createElement('button');expand.type='button';expand.className='l-button primary';expand.textContent='Open full preview';expand.onclick=()=>{L.closeDialog(L.get('l-inspect-sheet'));L.focusAtom(a,opener)};
 const copy=document.createElement('button');copy.type='button';copy.className='l-button';copy.innerHTML=L.icon('copy')+'Copy recipe';copy.onclick=()=>L.copy(L.recipeText(a));
 const download=document.createElement('button');download.type='button';download.className='l-button';download.textContent='Download recipe';download.onclick=()=>L.download(`${a.id}.js`,L.recipeText(a));
 const share=document.createElement('button');share.type='button';share.className='l-button';share.innerHTML=L.icon('link')+'Copy atom link';share.onclick=()=>L.copy(location.href.split('#')[0]+'#'+new URLSearchParams({atom:a.id}));
 const note=document.createElement('p');note.className='l-note';note.textContent='Recipes use the catalogue runtime and shared styles. Port the pattern with cieo/dom or cieo/react for an application.';
 content.append(name,desc,dl,code,source,expand,copy,download,share,note);
 if(innerWidth>=1280){L.get('l-inspector-slot').append(content);L.get('l-inspector').hidden=false;document.body.dataset.inspector='true';L.animateChrome(L.get('l-inspector'));name.focus({preventScroll:true})}
 else{L.get('l-inspect-body').append(content);L.openDialog(L.get('l-inspect-sheet'),opener)}
};
L.closeInspector=()=>{L.get('l-inspector').hidden=true;delete document.body.dataset.inspector;L.closeDialog(L.get('l-inspect-sheet'));document.querySelectorAll('.l-selected').forEach(e=>e.classList.remove('l-selected'));L.inspected=null;if(!document.querySelector('dialog[open]')){const opener=L.inspectorOpener; if(opener?.isConnected&&opener.getClientRects().length)opener.focus({preventScroll:true});else L.get('l-search').focus({preventScroll:true})}};
L.focused=null;
L.focusAtom=(a,opener)=>{
 L.mountAtom(a);L.needsSettle=true;L.focused=a;L.focusPlaceholder=document.createElement('div');L.focusPlaceholder.className=a.el.className;L.focusPlaceholder.style.height=a.el.offsetHeight+'px';L.focusPlaceholder.setAttribute('aria-hidden','true');a.el.before(L.focusPlaceholder);
 L.get('l-focus-title').textContent=a.name;L.get('l-focus-host').append(a.el);L.openDialog(L.get('l-focus'),opener);
 // Preserve the same DOM and state. No second initializer or copied event listeners.
 requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
};
L.restoreFocusAtom=()=>{
 if(!L.focused)return;L.needsSettle=true;L.focusPlaceholder.replaceWith(L.focused.el);L.focused=null;const opener=L.dialogOpeners.get(L.get('l-focus'));if(opener?.isConnected)opener.focus({preventScroll:true});
 requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
};
L.copy=async text=>{try{await navigator.clipboard.writeText(text);L.announce('Copied to clipboard.')}catch{
 const box=L.get('l-copy-text');box.value=text;L.openDialog(L.get('l-copy'));box.focus();box.select();
}};
L.download=(name,text)=>{const url=URL.createObjectURL(new Blob([text],{type:'text/javascript;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
