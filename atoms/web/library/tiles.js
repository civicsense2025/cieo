L.activeAtoms=new Set();L.failures=[];
L.mountedCount=0;
L.mountAtom=a=>{
 if(a.initialized)return;a.initialized=true;L.needsSettle=true;
 try{const stage=a.el.querySelector('.stage');stage.innerHTML=a.html;
  stage.querySelectorAll('button:not([type])').forEach(b=>{if(!b.closest('form'))b.type='button'});
  a.render=a.init(stage);L.mountedCount++;if(a.render)a.render(now())}
 catch(error){L.failures.push({id:a.id,message:String(error)});console.error(a.id,error);a.render=null;
  const message=document.createElement('p');message.className='l-recipe-error';message.textContent='This preview could not start. The recipe is still available in Inspect.';a.el.querySelector('.stage').append(message)}
};
L.toggleSave=a=>{
 L.saved.has(a.id)?L.saved.delete(a.id):L.saved.add(a.id);
 if(!L.storage.write('cieo-library:saved',[...L.saved]))L.announce('Saved for this visit. Device storage is unavailable.');
 L.updateSaveButton(a);L.filter();
};
L.updateSaveButton=a=>{
 a.saveButton.setAttribute('aria-pressed',String(L.saved.has(a.id)));
 a.saveButton.setAttribute('aria-label',`${L.saved.has(a.id)?'Unsave':'Save'} ${a.name}`);
 a.saveButton.querySelector('svg').style.fill=L.saved.has(a.id)?'currentColor':'none';
};
L.mountTiles=()=>{
 const grid=L.get('l-grid');const targetMap=new Map();
 const order=[...A].sort((a,b)=>{
  const ai=L.featured.indexOf(a.id),bi=L.featured.indexOf(b.id);
  return (ai<0?1000+ A.indexOf(a):ai)-(bi<0?1000+A.indexOf(b):bi);
 });
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){const a=targetMap.get(entry.target);if(entry.isIntersecting&&!a.el.hidden){L.mountAtom(a);L.activeAtoms.add(a)}else L.activeAtoms.delete(a)}
 },{rootMargin:'160px'});
 const compact=new Set(['tabs','surface','switch','field','accordion','dropdown','slider','copy','toast','checklist']);
 const hues=['var(--lib-violet)','var(--lib-blue)','var(--lib-green)','var(--lib-peach)'];
 for(const [i,a] of order.entries()){
  const el=document.createElement('article');el.className='l-tile tile'+(a.tall&&!compact.has(a.id)?' l-tall':'')+(a.wide&&a.id!=='surface'?' l-wide':'');el.id=a.id;
  el.dataset.category=a.cat;el.style.setProperty('--mat',L.featured.includes(a.id)?hues[i%4]:'var(--lib-mat)');
  const header=document.createElement('header');header.className='l-tile-head';
  const title=document.createElement('button');title.type='button';title.className='l-tile-name';title.innerHTML=`<span>${L.escape(a.name)}</span>`;
  title.setAttribute('aria-label',`Inspect ${a.name}`);title.onclick=()=>L.inspect(a,title);header.append(title);
  a.saveButton=L.iconButton('bookmark',`Save ${a.name}`,()=>L.toggleSave(a));
  const expand=L.iconButton('expand',`Expand ${a.name}`,()=>L.focusAtom(a,expand));header.append(a.saveButton,expand);
  const meta=document.createElement('div');meta.className='l-tile-meta';
  meta.innerHTML=`<span>${L.escape(a.cat)}</span><span class="l-family" title="${L.escape(a.fam.map(f=>L.families[f]).join(', '))}">${L.escape(a.fam.join(' '))}</span>`;
  const host=document.createElement('div');host.className='l-stage-host';
  const stage=document.createElement('div');stage.className='stage';host.append(stage);
  el.append(header,meta,host);grid.append(el);a.el=el;a.stageHost=host;a.visible=false;L.updateSaveButton(a);
  // Expensive recipe markup is mounted only on first visibility, then kept intact.
  targetMap.set(el,a);observer.observe(el);
 }
 L.observer=observer;
};
L.recipeText=a=>`// Cieo catalogue recipe: ${a.name}\n// Requires atoms/web/runtime.core.js and the shared recipe styles.\n// This is a recipe, not a standalone production component.\natom({\n id: ${JSON.stringify(a.id)}, cat: ${JSON.stringify(a.cat)}, name: ${JSON.stringify(a.name)},\n fam: ${JSON.stringify(a.fam)}, block: ${JSON.stringify(a.block)},\n html: ${JSON.stringify(a.html)},\n desc: ${JSON.stringify(a.desc)}, api: ${JSON.stringify(a.api)},\n ${a.init.toString()}\n});\n`;
