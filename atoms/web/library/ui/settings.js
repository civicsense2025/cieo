(() => {
  const L=window.CieoLibrary;
  L.createSettings=(state,changed) => {
    const root=document.documentElement,form=document.getElementById('view-settings');
    const system=matchMedia('(prefers-color-scheme: dark)');
    const appearance=document.getElementById('appearance-choices');
    const accents=document.getElementById('accent-choices');
    const themeButtons=[],accentButtons=[];
    for (const [value,label] of [['system','System'],['light','Light'],['dark','Dark']]) {
      const b=document.createElement('button');b.type='button';b.className='lib-choice';b.textContent=label;
      b.onclick=()=>{state.theme=value;apply();changed();};appearance.append(b);themeButtons.push({b,value});
    }
    for (const [value,label,color] of [['iris','Iris','#8c76d5'],['mint','Mint','#5e9e87'],['coral','Coral','#d78675'],['blue','Blue','#7b9ed3'],['neutral','Neutral','#636c7b']]) {
      const b=document.createElement('button');b.type='button';b.className='lib-swatch';b.style.setProperty('--swatch',color);b.title=label;b.setAttribute('aria-label',`${label} accent`);
      b.onclick=()=>{state.accent=value;apply();changed();};accents.append(b);accentButtons.push({b,value});
    }
    const apply=() => {
      root.dataset.theme=state.theme==='system'?(system.matches?'dark':'light'):state.theme;
      root.dataset.accent=state.accent;root.dataset.density=state.density;root.dataset.backdrops=String(state.backdrops);
      root.style.setProperty('--lib-columns',String(state.columns));
      for (const {b,value} of themeButtons) b.setAttribute('aria-pressed',String(value===state.theme));
      for (const {b,value} of accentButtons) b.setAttribute('aria-pressed',String(value===state.accent));
      for (const name of ['columns','density','speed']) form.elements.namedItem(name).value=String(state[name]);
      form.elements.namedItem('backdrops').checked=state.backdrops;
      clock.scale=state.speed;
    };
    form.addEventListener('submit',e=>e.preventDefault());
    form.addEventListener('change',e=>{
      const name=e.target.name;
      if (!['columns','density','speed','backdrops'].includes(name)) return;
      const value=name==='backdrops'?e.target.checked:['columns','speed'].includes(name)?Number(e.target.value):e.target.value;
      const valid=L.validSettings({...state,[name]:value});state[name]=valid[name];apply();changed();
    });
    system.addEventListener('change',()=>{if(state.theme==='system')apply();});
    apply();
    return {apply,reset:()=>{for(const key of ['theme','accent','density','columns','backdrops','speed'])state[key]=L.defaults[key];apply();changed();}};
  };
})();
