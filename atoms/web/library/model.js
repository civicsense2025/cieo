(() => {
  const L = window.CieoLibrary;
  L.atoms = A; L.byId = new Map(A.map(a => [a.id, a]));
  L.featured = ['tabs','switch','dropdown','field','copy','slider','rating','progress','colorpicker','toast','palette','stagger'];
  L.families = { '*':'All motion', M:'Morph', S:'Swap', D:'Drag', E:'Edges', X:'Enter / exit', T:'Time' };
  L.categories = [...new Set(A.map(a => a.cat))];
  L.groups = {
    'Basics':['Foundations','Content','Layout','Interactive','Dynamic','Media'],
    'Forms & input':['Forms','Inputs','Newsletter','Scheduling','Guidance'],
    'Navigation & overlays':['Overlays','Navigation','Mega menus','Headers','Footers','Chrome'],
    'Work & creation':['Writing','Design tools','Editor','Documents','Workflow','Files and browsing'],
    'Data & commerce':['Data','Admin','Admin kit','Status and records','Views','Commerce','Storefront','Landing','Workspace','Maps'],
    'Connected experiences':['Email','SEO','Social','AI chat','MCP and agents','Agent activity','Video calls'],
    'Images & stories':['Photo effects','Image transitions','Carousels','Galleries','Scroll stories'],
  };
  const listed = new Set(Object.values(L.groups).flat());
  const extra = L.categories.filter(c => !listed.has(c)); if (extra.length) L.groups.More = extra;
  L.storage = {
    get(key, fallback) { try { const raw = localStorage.getItem('cieo-library-v2:'+key); return raw === null ? fallback : JSON.parse(raw); } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem('cieo-library-v2:'+key, JSON.stringify(value)); return true; } catch { return false; } },
  };
  const stored = L.storage.get('saved', []);
  L.saved = new Set(Array.isArray(stored) ? stored.filter(id => L.byId.has(id)).slice(0,A.length) : []);
  L.state = { collection:'explore', family:'*', query:'', paused:false };
  L.matches = a => {
    const s = L.state;
    const inCollection = s.collection === 'all' || (s.collection === 'explore' ? L.featured.includes(a.id) : s.collection === 'saved' ? L.saved.has(a.id) : a.cat === s.collection);
    const words = s.query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    const haystack = `${a.name} ${a.cat} ${a.block} ${a.desc} ${a.fam.map(f => L.families[f]).join(' ')}`.toLocaleLowerCase();
    return inCollection && (s.family === '*' || a.fam.includes(s.family)) && words.every(w => haystack.includes(w));
  };
  L.readHash = () => {
    const hash = location.hash.slice(1), params = new URLSearchParams(hash);
    const oldCategory = hash.startsWith('cat-') ? L.categories.find(c => 'cat-'+c.toLowerCase().replace(/\s+/g,'-') === hash) : null;
    const collection = oldCategory || params.get('collection') || 'explore';
    L.state.collection = ['explore','all','saved',...L.categories].includes(collection) ? collection : 'explore';
    L.state.family = Object.hasOwn(L.families, params.get('motion') || '') ? params.get('motion') : '*';
    L.state.query = (params.get('q') || '').slice(0,160);
  };
  L.writeHash = (push = false) => {
    const params = new URLSearchParams({collection:L.state.collection});
    if (L.state.family !== '*') params.set('motion', L.state.family);
    if (L.state.query) params.set('q', L.state.query);
    try { history[push ? 'pushState' : 'replaceState'](null,'','#'+params); } catch { /* File previews may deny history writes. */ }
  };
  L.navigate = (collection) => {
    L.state.collection = collection; L.state.query = ''; L.state.family = '*';
    document.getElementById('lib-search').value = '';
    L.writeHash(true); L.render(); window.scrollTo({top:0,behavior:'instant'});
  };
  L.toggleSaved = id => {
    if (!L.byId.has(id)) return;
    L.saved.has(id) ? L.saved.delete(id) : L.saved.add(id);
    const persisted = L.storage.set('saved',[...L.saved]);
    L.syncSaved(); if (L.state.collection === 'saved') L.render();
    L.announce(persisted ? (L.saved.has(id) ? 'Saved to this browser.' : 'Removed from saved atoms.') : 'Updated for this visit. Browser storage is unavailable.');
  };
})();
