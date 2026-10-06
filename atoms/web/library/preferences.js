(() => {
  const L=window.CieoLibrary;
  const defaults={theme:'system',accent:'violet',surfaces:'color',corners:'soft',density:'roomy',details:'shown',columns:'auto',grid:false};
  const choices={theme:['system','white','black'],accent:['violet','blue','green','coral'],surfaces:['color','neutral'],corners:['soft','crisp'],density:['roomy','compact'],details:['shown','hidden'],columns:['auto','2','3','4']};
  const stored=L.storage.get('preferences',{});L.preferences={...defaults};
  if(stored&&typeof stored==='object'&&!Array.isArray(stored))for(const key of Object.keys(defaults)){
    if(key==='grid'&&typeof stored.grid==='boolean')L.preferences.grid=stored.grid;
    else if(choices[key]?.includes(stored[key]))L.preferences[key]=stored[key];
  }
  const dark=matchMedia('(prefers-color-scheme:dark)');
  L.applyPreferences = () => {
    const p=L.preferences,root=document.documentElement;
    root.dataset.theme=p.theme==='system'?(dark.matches?'black':'white'):p.theme;
    for(const key of ['accent','surfaces','corners','density','details'])root.dataset[key]=p[key];
    root.dataset.grid=p.grid?'on':'off';
    // The responsive floor always wins; a saved desktop choice cannot force phone columns.
    root.style.setProperty('--library-columns',innerWidth<640?'1':innerWidth<1280?'2':p.columns==='auto'?(innerWidth>=1800?'4':'3'):p.columns);
    document.querySelectorAll('[data-pref]').forEach(b=>b.setAttribute('aria-pressed',String(p[b.dataset.pref]===b.dataset.value)));
    document.getElementById('lib-grid-toggle').checked=p.grid;
    document.getElementById('lib-columns').value=p.columns;
    L.wake();
  };
  L.wirePreferences = () => {
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-pref]');if(!b)return;
      if(!choices[b.dataset.pref]?.includes(b.dataset.value))return;
      L.preferences[b.dataset.pref]=b.dataset.value;L.storage.set('preferences',L.preferences);L.applyPreferences();
    });
    document.getElementById('lib-columns').onchange=e=>{
      if(!choices.columns.includes(e.target.value))return;L.preferences.columns=e.target.value;L.storage.set('preferences',L.preferences);L.applyPreferences();
    };
    document.getElementById('lib-grid-toggle').onchange=e=>{L.preferences.grid=e.target.checked;L.storage.set('preferences',L.preferences);L.applyPreferences();};
    document.getElementById('lib-reset-preferences').onclick=()=>{L.preferences={...defaults};L.storage.set('preferences',L.preferences);L.applyPreferences();L.announce('Library appearance reset. Saved atoms are unchanged.');};
    dark.addEventListener('change',L.applyPreferences);
    addEventListener('resize',L.applyPreferences,{passive:true});L.applyPreferences();
  };
})();
