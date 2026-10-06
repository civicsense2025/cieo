(() => {
  const c=window.CieoCatalogue, root=document.documentElement;
  const choices={appearance:['system','light','dark'],accent:['iris','blue','green','coral'],density:['comfortable','compact'],corners:['soft','crisp']};
  const stored=c.read('cieo-catalogue-appearance',{});
  const settings=Object.fromEntries(Object.entries(choices).map(([key,values])=>[key, values.includes(stored?.[key])?stored[key]:values[0]]));
  const system=matchMedia('(prefers-color-scheme:dark)');
  const apply=()=>{
    root.dataset.appearance=settings.appearance==='system'?(system.matches?'dark':'light'):settings.appearance;
    root.dataset.accent=settings.accent;root.dataset.density=settings.density;root.dataset.corners=settings.corners;
    // Layout density never scales down a preview's interactive targets.
    root.style.setProperty('--columns',String(innerWidth<768?1:innerWidth<1408?2:settings.density==='compact'&&innerWidth>=1680?4:3));
    document.querySelectorAll('#appearance-dialog button').forEach(b=>{
      for(const key of Object.keys(choices)) if(b.dataset[key]) b.setAttribute('aria-pressed',String(settings[key]===b.dataset[key]));
    });
    c.invalidate?.();
  };
  document.getElementById('appearance-dialog').addEventListener('click',e=>{
    const button=e.target.closest('button');if(!button)return;
    for(const [key,values] of Object.entries(choices)) if(values.includes(button.dataset[key])) {
      settings[key]=button.dataset[key];apply();
      if(!c.save('cieo-catalogue-appearance',settings))c.announce('Appearance changed. Browser storage is unavailable.');
    }
  });
  system.addEventListener('change',apply);addEventListener('resize',apply,{passive:true});apply();
  c.appearance={settings,apply};
})();
