(() => {
  const c=window.CieoCatalogue;
  c.familyNames={M:'Morph',S:'Swap',D:'Drag',E:'Edges',X:'Enter / exit',T:'Time'};
  c.collections={Interface:['Content','Admin','Admin kit','Inputs','Forms','Overlays','Navigation','Chrome'],Creating:['Design tools','Editor','Workspace','Layout'],Writing:['Writing','Documents','Workflow'],Imagery:['Photo effects','Image transitions','Carousels','Galleries','Scroll stories','Media']};
  c.categoryCounts=new Map(); A.forEach(a=>c.categoryCounts.set(a.cat,(c.categoryCounts.get(a.cat)||0)+1));
  const slug=s=>s.toLowerCase().replace(/\s+/g,'-');c.slug=slug;
  const link=(label,href,count,icon='dot')=>`<a class="ui-navlink" href="#${href}">${c.icon(icon)}${label}<span>${count}</span></a>`;
  const all=link('Everything','all',A.length,'grid')+link('Saved','saved','0','bookmark');
  const folders=Object.keys(c.collections).map((name,i)=>`<a class="ui-folder" href="#collection-${slug(name)}"><span class="ui-folder-art" style="--accent:${['#8576cd','#79a7c0','#c68c63','#86a285'][i]}"><i></i><i></i><i></i></span>${name}</a>`).join('');
  const categoryLinks=[...c.categoryCounts].sort(([a],[b])=>a.localeCompare(b)).map(([name,n])=>link(name,'cat-'+slug(name),n)).join('');
  const nav=`${all}<div class="ui-navtitle">Collections <span>4</span></div><div class="ui-folders">${folders}</div><div class="ui-navtitle">Explore by category <span>${c.categoryCounts.size}</span></div>${categoryLinks}`;
  document.getElementById('desktop-nav').innerHTML=nav;document.getElementById('mobile-nav').innerHTML=nav;
  document.getElementById('total-count').textContent=`${A.length} atoms`;
  document.getElementById('family-filter').innerHTML=`<button class="ui-chip" data-family="*" aria-pressed="true">All motion</button>`+Object.entries(c.familyNames).map(([id,name])=>`<button class="ui-chip" data-family="${id}" aria-pressed="false"><i>${id}</i>${name}</button>`).join('');
  c.route=()=>{
    let hash;try{hash=decodeURIComponent(location.hash.slice(1))}catch{hash='all'}
    const category=[...c.categoryCounts.keys()].find(name=>'cat-'+slug(name)===hash);
    const collection=Object.keys(c.collections).find(name=>'collection-'+slug(name)===hash);
    const params=new URLSearchParams(hash);
    return {category,collection,saved:hash==='saved',query:params.get('q')||'',atom:hash.startsWith('atom-')?hash.slice(5):null,hash};
  };
  c.markNavigation=()=>{
    const route=c.route();document.querySelectorAll('.ui-navlink,.ui-folder').forEach(a=>{
      const selected=a.hash===location.hash||a.hash==='#all'&&(!location.hash||route.atom);
      if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
      if(a.hash==='#saved'&&a.lastElementChild)a.lastElementChild.textContent=c.favorites?.size||0;
    });
    document.getElementById('saved-toggle').setAttribute('aria-pressed',String(route.saved));
  };
  document.getElementById('saved-toggle').onclick=()=>{location.hash=c.route().saved?'all':'saved'};
  document.getElementById('mobile-saved').onclick=()=>{location.hash='saved'};
  document.getElementById('mobile-nav').addEventListener('click',e=>{if(e.target.closest('a'))document.getElementById('browse-dialog').close()});
  c.paintIcons();
})();
