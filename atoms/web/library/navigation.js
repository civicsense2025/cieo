L.mountNavigation=()=>{
 const nav=L.get('l-nav');
 const make=(key,label,icon,count)=>{
  const b=document.createElement('button');b.type='button';b.className='l-nav-button';b.dataset.category=key;
  b.innerHTML=L.icon(icon)+`<span>${L.escape(label)}</span><small>${count}</small>`;
  b.onclick=()=>{L.updateFilters({category:key,query:''},true);L.get('l-search').value='';L.closeDialog(L.get('l-browser'));window.scrollTo({top:0,behavior:'instant'})};return b;
 };
 nav.append(make('all','Everything','grid',A.length),make('saved','Saved atoms','bookmark',L.saved.size));
 const title=document.createElement('p');title.className='l-nav-title';title.textContent='Collections';nav.append(title);
 for(const [key,set] of Object.entries(L.sets))nav.append(make(key,set.title,set.icon,A.filter(a=>set.cats.includes(a.cat)).length));
 const catTitle=document.createElement('p');catTitle.className='l-nav-title';catTitle.textContent='Browse by category';nav.append(catTitle);
 const sections={'Interface':['Foundations','Content','Forms','Inputs','Interactive','Admin','Admin kit','Overlays','Navigation','Layout','Chrome','Guidance'],
  'Create & organize':['Writing','Editor','Documents','Design tools','Workspace','Workflow','Files and browsing','Views','Data','Status and records'],
  'Sites & media':['Media','Photo effects','Image transitions','Carousels','Galleries','Scroll stories','Commerce','Storefront','Landing','Headers','Footers','Mega menus','Newsletter'],
  'Connected work':['AI chat','Agent activity','MCP and agents','Email','Social','SEO','Scheduling','Video calls','Maps','Dynamic']};
 const included=new Set();
 for(const [label,cats] of Object.entries(sections)){
  const details=document.createElement('details');details.open=label==='Interface';
  const summary=document.createElement('summary');summary.textContent=label;details.append(summary);
  for(const cat of cats.filter(c=>L.categories.includes(c))){included.add(cat);details.append(make(cat,cat,'folder',A.filter(a=>a.cat===cat).length))}nav.append(details);
 }
 for(const cat of L.categories.filter(c=>!included.has(c)))nav.append(make(cat,cat,'folder',A.filter(a=>a.cat===cat).length));
 const foot=document.createElement('div');foot.className='l-sidebar-foot';foot.innerHTML='Made to feel right.<br>Powered by Cieo springs.';nav.append(foot);
 const collections=L.get('l-collections');
 for(const [key,set] of Object.entries(L.sets)){
  const b=document.createElement('button');b.type='button';b.className='l-collection';b.dataset.collection=key;
  b.setAttribute('aria-label',`Browse ${set.title}`);
  ['back','mid','paper','front','ink'].forEach((name,i)=>b.style.setProperty('--folder-'+name,set.colors[i]));
  b.innerHTML=`<div class="l-pocket" aria-hidden="true"><div class="l-pocket-card">${set.mark}</div><div class="l-pocket-front">${L.icon(set.icon)}</div></div><strong>${set.title}</strong><small>${A.filter(a=>set.cats.includes(a.cat)).length} atoms</small>`;
  b.onclick=()=>L.updateFilters({category:key,query:''},true);collections.append(b);
 }
 for(const [key,name] of Object.entries(L.families)){
  const b=document.createElement('button');b.type='button';b.className='l-chip';b.textContent=name;b.dataset.family=key;
  b.onclick=()=>L.updateFilters({family:key});L.get('l-families').append(b);
 }
};
L.filter=()=>{
 let count=0;for(const a of A){const show=L.matches(a);a.el.hidden=!show;if(show)count++}
 const category=L.state.category;const set=L.sets[category];
 L.get('l-title').textContent=category==='all'?'The motion library':category==='saved'?'Saved atoms':set?.title||category;
 L.get('l-subtitle').textContent=category==='all'?'Thoughtful little interactions. Ready to make your own.':category==='saved'?'Your favorites, together on this device.':set?.subtitle||'Real interactions. Same familiar springs.';
 L.get('l-result').textContent=`${count} of ${A.length} atoms`;
 L.get('l-empty').hidden=!!count;L.get('l-grid').hidden=!count;
 L.get('l-collections').hidden=category!=='all'||!!L.state.query||L.state.family!=='*';
 document.querySelectorAll('[data-family]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.family===L.state.family)));
 document.querySelectorAll('[data-category]').forEach(b=>{
  if(b.dataset.category===category){b.setAttribute('aria-current','page');if(b.closest('details'))b.closest('details').open=true}else b.removeAttribute('aria-current');
  if(b.dataset.category==='saved')b.querySelector('small').textContent=L.saved.size;
 });
 L.get('l-clear-search').hidden=!L.state.query;
};
