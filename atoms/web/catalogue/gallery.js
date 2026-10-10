(() => {
  const c=window.CieoCatalogue, grid=document.getElementById('groups');
  const known=new Set(A.map(a=>a.id)), stored=c.read('cieo-catalogue-saved',[]);
  c.favorites=new Set(Array.isArray(stored)?stored.filter(id=>known.has(id)):[]);
  c.byElement=new Map();c.byId=new Map(A.map(a=>[a.id,a]));
  // Real recipes, simply curated at the front. No duplicate preview instances.
  const order=['tabs','palette','switch','colorpicker','accordion','toast','seltoolbar','goalring','dropdown','chip','slider','checkbox','field','copy'];
  const sorted=[...A].sort((a,b)=>{
    const pa=order.indexOf(a.id),pb=order.indexOf(b.id);return (pa<0?999:pa)-(pb<0?999:pb);
  });
  c.toggleSave=(id)=>{
    c.favorites.has(id)?c.favorites.delete(id):c.favorites.add(id);
    if(!c.save('cieo-catalogue-saved',[...c.favorites]))c.announce('Saved for this session. Browser storage is unavailable.');
    document.querySelectorAll(`[data-save="${id}"]`).forEach(b=>b.setAttribute('aria-pressed',String(c.favorites.has(id))));
    c.markNavigation();c.updateInspectorSave?.();if(c.route().saved)c.filter();
  };
  // Captions: recipe demos keep a trailing `<div class="hint">…</div>` inside
  // their stage HTML. Lift a trailing plain-text hint out of the preview and
  // render its text between the stage and the tile header. Sources keep their
  // markup; the rule mirrors scripts/build-library.mjs (div only, no child
  // elements, trailing at every level up to the stage).
  const takeTrailingHint=(stage)=>{
    const hints=stage.querySelectorAll('.hint');
    if(!hints.length)return '';
    const hint=hints[hints.length-1];
    if(hint.tagName!=='DIV'||hint.children.length)return '';
    let cur=hint;
    while(cur&&cur!==stage){
      let sib=cur.nextSibling;
      while(sib){
        if(sib.nodeType===1)return '';
        if(sib.nodeType===3&&sib.textContent.trim()!=='')return '';
        sib=sib.nextSibling;
      }
      cur=cur.parentElement;
    }
    if(cur!==stage)return '';
    const text=hint.textContent.trim();
    hint.remove();
    return text;
  };
  for(const [index,a] of sorted.entries()){
    const el=document.createElement('article');el.id=a.id;el.className='tile'+(a.wide?' wide':'')+(a.tall?' tall':'')+(a.big?' big':'');
    el.dataset.tone=['lilac','blue','mint','peach','butter'][index%5];
    const shell=document.createElement('div');shell.className='stage-shell';
    const stage=document.createElement('div');stage.className='stage';stage.innerHTML=a.html;
    const captionText=takeTrailingHint(stage);
    c.isolateStyles(stage,a.id);
    const marks=document.createElement('div');marks.className='ui-family-mark';marks.innerHTML=a.fam.map(f=>`<span title="${c.familyNames[f]}">${f}</span>`).join('');
    shell.append(stage);
    const header=document.createElement('header');
    const title=document.createElement('div');title.style.minWidth='0';
    const h=document.createElement('h3'),button=document.createElement('button');button.className='ui-tile-name';button.textContent=a.name;button.dataset.inspect=a.id;h.append(button);
    const category=document.createElement('p');category.textContent=a.cat;title.append(h,category);
    const tools=document.createElement('div');tools.className='ui-tile-tools';
    tools.innerHTML=`<button data-save="${a.id}" aria-label="Save ${a.id}" aria-pressed="${c.favorites.has(a.id)}">${c.icon('bookmark')}</button><button data-inspect="${a.id}" aria-label="Inspect ${a.id}">${c.icon('expand')}</button>`;
    header.append(title,marks,tools);
    const detail=document.createElement('div');detail.className='ui-detail';detail.hidden=true;
    const desc=document.createElement('p');desc.textContent=a.desc;const code=document.createElement('pre');code.textContent=a.api;detail.append(desc,code);
    el.append(shell);
    if(captionText){const cap=document.createElement('p');cap.className='ui-tile-caption';cap.textContent=captionText;el.append(cap);}
    el.append(header,detail);grid.append(el);a.el=el;a.stage=stage;a.visible=false;a.inited=false;a.render=null;c.byElement.set(el,a);
  }
  c.initAtom=a=>{
    if(a.inited)return;a.inited=true;
    try{a.render=a.init(a.stage);a.el.dataset.ready='true'}catch(error){a.el.dataset.error='true';console.error('Atom initialization:',a.id,error);}
  };
  c.observer=new IntersectionObserver(entries=>{
    for(const entry of entries){const a=c.byElement.get(entry.target);if(!a)continue;
      a.visible=entry.isIntersecting;if(a.visible&&!a.el.hidden)c.initAtom(a);
    }c.invalidate?.();
  },{rootMargin:'240px'});
  A.forEach(a=>c.observer.observe(a.el));
  document.addEventListener('click',e=>{
    const save=e.target.closest('[data-save]'),inspect=e.target.closest('[data-inspect]');
    if(save)c.toggleSave(save.dataset.save);if(inspect)c.inspect(inspect.dataset.inspect,inspect);
  });
  c.family='*';let search='';
  c.filter=()=>{
    const route=c.route(),query=search.toLowerCase().trim();let count=0;
    for(const a of A){
      const show=(!route.category||a.cat===route.category)&&(!route.collection||c.collections[route.collection].includes(a.cat))&&(!route.saved||c.favorites.has(a.id))&&(c.family==='*'||a.fam.includes(c.family))&&(!query||`${a.name} ${a.cat} ${a.desc} ${a.block}`.toLowerCase().includes(query));
      a.el.hidden=!show;if(show)count++;
    }
    const title=route.category||route.collection||(route.saved?'Saved for later.':'Everything, in motion.');
    document.getElementById('collection-title').textContent=title;
    document.getElementById('breadcrumb').textContent=route.category||route.collection||(route.saved?'Saved':'Everything');
    document.getElementById('collection-subtitle').textContent=query?`Results for “${search}”`:route.saved?'Your own little collection of good interactions.':'Small interactions. A little more feeling.';
    document.getElementById('count').textContent=`${count} ${count===1?'atom':'atoms'}`;
    document.getElementById('empty-state').hidden=count>0;c.markNavigation();c.invalidate?.();
  };
  const input=document.getElementById('atom-search');
  input.addEventListener('input',()=>{search=input.value;c.filter()});
  document.getElementById('family-filter').addEventListener('click',e=>{
    const b=e.target.closest('[data-family]');if(!b)return;c.family=b.dataset.family;
    document.querySelectorAll('[data-family]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));c.filter();
  });
  const routeChanged=()=>{
    search=c.route().query;input.value=search;c.family='*';
    document.querySelectorAll('[data-family]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.family==='*')));
    c.filter();window.scrollTo({top:0});
    const id=c.route().atom;if(id&&c.byId.has(id))c.inspect(id);
  };
  addEventListener('hashchange',routeChanged);
  document.getElementById('clear-filters').onclick=()=>{search='';input.value='';c.family='*';if(location.hash==='#all')routeChanged();else location.hash='all'};
  document.getElementById('details-toggle').onclick=e=>{const b=e.currentTarget,on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));document.querySelectorAll('.ui-detail').forEach(d=>d.hidden=!on)};
  c.startRoute=routeChanged;
})();
