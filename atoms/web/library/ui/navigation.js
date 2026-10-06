(() => {
  const L = window.CieoLibrary;
  L.createNavigation = (atoms,state,saved,onPick) => {
    const buttons=[];
    const count = categories => atoms.filter(a => categories.includes(a.cat)).length;
    const button = (label,view,category,icon,number) => {
      const node=document.createElement('button'); node.type='button'; node.className='lib-nav-button';
      if (icon) node.innerHTML=L.icon(icon);
      const text=document.createElement('span'); text.textContent=label; node.append(text);
      const n=document.createElement('span'); n.className='lib-nav-count'; n.textContent=number; node.append(n);
      node.onclick=() => onPick(view,category);
      buttons.push({node,view,category,n}); return node;
    };
    const top=document.getElementById('library-navigation');
    top.append(button('Discover','featured','','spark',L.featured.filter(id=>atoms.some(a=>a.id===id)).length),button('Everything','all','','grid',atoms.length),button('Saved','saved','','bookmark',saved.size));
    const shelf=document.getElementById('library-collections'),spotlights=document.getElementById('library-spotlights');
    for (const c of L.collections) {
      const small=document.createElement('button'); small.type='button'; small.className='lib-collection'; small.dataset.tone=c.tone;
      small.innerHTML=`<span class="lib-collection-art">${L.art(c.key)}</span><span class="lib-collection-label"></span>`;
      small.querySelector('.lib-collection-label').textContent=c.short; small.onclick=()=>onPick('collection',c.key); shelf.append(small); buttons.push({node:small,view:'collection',category:c.key});
      const large=document.createElement('button'); large.type='button'; large.className='lib-spotlight'; large.dataset.tone=c.tone;
      large.innerHTML=`<span class="lib-collection-art">${L.art(c.key)}</span><span><strong></strong><small></small></span>`;
      large.querySelector('strong').textContent=c.name; large.querySelector('small').textContent=`${count(c.categories)} components`; large.onclick=()=>onPick('collection',c.key); spotlights.append(large);
    }
    const categoryNav=document.getElementById('library-categories');
    const groups={...L.categoryGroups};
    const known=new Set(Object.values(groups).flat());
    const rest=[...new Set(atoms.map(a=>a.cat))].filter(c=>!known.has(c));
    if (rest.length) groups.More=rest;
    for (const [label,categories] of Object.entries(groups)) {
      const relevant=categories.filter(c=>count([c])); if (!relevant.length) continue;
      const section=document.createElement('details');
      const summary=document.createElement('summary'); summary.textContent=label; section.append(summary);
      for (const c of relevant) section.append(button(c,'category',c,null,count([c])));
      categoryNav.append(section);
    }
    const update=() => {
      for (const item of buttons) {
        const active=!state.query && state.view===item.view && (!item.category || item.category===state.category);
        if (active) item.node.setAttribute('aria-current','page'); else item.node.removeAttribute('aria-current');
        if (active && item.view==='category') item.node.closest('details').open=true;
        if (item.view==='saved') item.n.textContent=saved.size;
      }
    };
    update(); return {update};
  };
})();
