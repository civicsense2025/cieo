(() => {
  const L = window.CieoLibrary;
  const categoryIcons = {'Writing':'pen','Design tools':'pen','Media':'image','Forms':'inputs','Inputs':'inputs','Navigation':'window','Overlays':'window','Foundations':'motion','Data':'grid'};
  const navItem = (label, collection, icon, count) => `<button type="button" class="lib-nav-button" data-collection="${L.escape(collection)}">${L.icon(icon)}<span>${L.escape(label)}</span><span class="lib-nav-count" ${collection === 'saved' ? 'data-saved-count' : ''}>${count}</span></button>`;
  L.buildNavigation = () => {
    const main = navItem('Explore','explore','circle',L.featured.filter(id=>L.byId.has(id)).length)+navItem('All atoms','all','grid',A.length)+navItem('Saved','saved','star',L.saved.size);
    document.querySelectorAll('[data-main-navigation]').forEach(el => el.innerHTML = main);
    const groups = Object.entries(L.groups).map(([title,cats],i) => `<details ${i<2 ? 'open' : ''}><summary>${L.escape(title)}</summary>${cats.filter(c=>L.categories.includes(c)).map((c,j)=>`<button type="button" class="lib-nav-button" data-collection="${L.escape(c)}"><span class="lib-category-icon" style="background:var(--library-${['violet','mint','peach','blue','pink','lemon'][j%6]})">${L.icon(categoryIcons[c]||'layers')}</span><span>${L.escape(c)}</span><span class="lib-nav-count">${A.filter(a=>a.cat===c).length}</span></button>`).join('')}</details>`).join('');
    document.querySelectorAll('[data-category-navigation]').forEach(el => el.innerHTML = groups);
    document.getElementById('lib-total').textContent = A.length+' live atoms';
    const featured = [['Content','Everyday details','layers'],['Inputs','Inputs that feel good','inputs'],['Overlays','A little room','window'],['Design tools','Creative tools','pen']];
    document.getElementById('lib-collections').innerHTML = featured.map(([cat,title,icon]) => `<button type="button" class="lib-collection" data-collection="${cat}"><span class="lib-collection-art">${L.icon(icon)}</span><span><strong>${title}</strong><small>${A.filter(a=>a.cat===cat).length} atoms</small></span></button>`).join('');
    document.getElementById('lib-filters').innerHTML = Object.entries(L.families).map(([id,label]) => `<button type="button" class="lib-chip" data-family="${id}" aria-pressed="false">${label}</button>`).join('');
    document.addEventListener('click', e => {
      const button = e.target.closest('[data-collection]');
      if (!button) return;
      if (document.getElementById('lib-navigation-dialog').open) L.closeDialog(document.getElementById('lib-navigation-dialog'));
      L.navigate(button.dataset.collection);
    });
  };
  L.syncNavigation = () => {
    const collection = L.state.collection;
    document.querySelectorAll('.lib-nav-button[data-collection]').forEach(el => {
      if (el.dataset.collection === collection) { el.setAttribute('aria-current','page'); const parent=el.closest('details'); if(parent)parent.open=true; }
      else el.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-family]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.family===L.state.family)));
    document.getElementById('lib-location-title').textContent = collection === 'explore' ? 'Explore' : collection === 'all' ? 'All atoms' : collection === 'saved' ? 'Saved' : collection;
  };
})();
