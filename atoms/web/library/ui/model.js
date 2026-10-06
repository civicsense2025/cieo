/* Pure catalogue state helpers; the engine and recipes own all animation behavior. */
(() => {
  const L = window.CieoLibrary = window.CieoLibrary || {};
  L.defaults = Object.freeze({ view:'featured', category:'', query:'', family:'*', theme:'system', accent:'iris', density:'comfortable', columns:3, backdrops:true, speed:1, sort:'curated' });
  L.families = Object.freeze({ '*':'All motion', M:'Morph', S:'Swap', D:'Drag', E:'Edges', X:'Enter / exit', T:'Time' });
  L.featured = ['tabs','switch','accordion','dropdown','palette','counter','progress','field','toast','sheet','colorpicker','layers','canvaszoom','selectresize','streaming','checklist','rating','slider'];
  L.collections = [
    { key:'essentials', name:'Everyday details', short:'Essentials', tone:'lilac', categories:['Content','Admin','Forms','Inputs'] },
    { key:'writing', name:'A place to write', short:'Writing', tone:'yellow', categories:['Writing'] },
    { key:'design', name:'Creative tools', short:'Design tools', tone:'blue', categories:['Design tools','Editor'] },
    { key:'agents', name:'A human touch', short:'Agents', tone:'peach', categories:['Agent activity','MCP and agents','AI chat'] },
  ];
  L.categoryGroups = {
    'Basics':['Foundations','Content','Layout','Interactive','Dynamic','Media'],
    'Forms & input':['Forms','Inputs','Newsletter','Scheduling','Guidance'],
    'Navigation & overlays':['Overlays','Navigation','Mega menus','Headers','Footers','Chrome'],
    'Data & admin':['Data','Admin','Admin kit','Status and records','Views'],
    'Creating & editing':['Workflow','Editor','Documents','Writing','Design tools','Files and browsing'],
    'Sites & commerce':['Commerce','Storefront','Landing','Workspace','Maps'],
    'Connected work':['Email','SEO','Social','AI chat','MCP and agents','Agent activity','Video calls'],
    'Photos & transitions':['Photo effects','Image transitions','Carousels','Galleries','Scroll stories'],
  };
  L.normalize = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  L.slug = value => String(value).toLowerCase().replace(/\s+/g,'-');
  L.safeRead = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  L.safeWrite = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch { return false; } };
  L.validSettings = input => {
    const result = { ...L.defaults };
    if (!input || typeof input !== 'object' || Array.isArray(input)) return result;
    const choices = { theme:['system','light','dark'], accent:['iris','mint','coral','blue','neutral'], density:['comfortable','compact'], columns:[2,3,4], speed:[1,.25,.1], sort:['curated','name'] };
    for (const [key,values] of Object.entries(choices)) if (values.includes(input[key])) result[key] = input[key];
    if (typeof input.backdrops === 'boolean') result.backdrops = input.backdrops;
    return result;
  };
  L.route = (hash,atoms) => {
    const raw = String(hash || '').replace(/^#/,'').slice(0,4096);
    const route = {};
    const categories = [...new Set(atoms.map(a => a.cat))];
    if (raw.startsWith('cat-')) {
      const category = categories.find(c => `cat-${L.slug(c)}` === raw);
      if (category) return { view:'category', category };
    }
    if (atoms.some(a => a.id === raw)) return { atom:raw };
    const params = new URLSearchParams(raw);
    if (['featured','all','saved'].includes(params.get('view'))) route.view = params.get('view');
    if (categories.includes(params.get('category'))) Object.assign(route,{ view:'category', category:params.get('category') });
    if (L.collections.some(c => c.key === params.get('collection'))) Object.assign(route,{ view:'collection', category:params.get('collection') });
    if (params.has('q')) { route.query = params.get('q').slice(0,240); route.view = 'all'; }
    if (Object.hasOwn(L.families,params.get('family'))) route.family = params.get('family');
    if (atoms.some(a => a.id === params.get('atom'))) route.atom = params.get('atom');
    const theme = {white:'light',black:'dark',light:'light',dark:'dark',system:'system'}[params.get('theme')];
    if (theme) route.theme = theme;
    if ([2,3,4].includes(Number(params.get('cols')))) route.columns = Number(params.get('cols'));
    return route;
  };
  L.matches = (a,state,saved) => {
    if (state.query) {
      const haystack = L.normalize(`${a.name} ${a.cat} ${a.block} ${a.desc} ${a.fam.map(f => L.families[f]).join(' ')}`);
      if (!L.normalize(state.query).split(/\s+/).every(word => haystack.includes(word))) return false;
    } else {
      if (state.view === 'featured' && !L.featured.includes(a.id)) return false;
      if (state.view === 'saved' && !saved.has(a.id)) return false;
      if (state.view === 'category' && a.cat !== state.category) return false;
      if (state.view === 'collection' && !L.collections.find(c => c.key === state.category)?.categories.includes(a.cat)) return false;
    }
    return state.family === '*' || a.fam.includes(state.family);
  };
})();
