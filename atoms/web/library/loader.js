/* Source-checkout entry. Ordered classic scripts also work under file://. */
(() => {
  const base=new URL('../atoms/web/',document.baseURI);
  const load=(path,source=false) => new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=new URL(path,base);script.async=false;
    if(source)script.dataset.cieoRecipeFile=path;
    script.onload=resolve;script.onerror=()=>reject(new Error(`Could not load ${path}`));document.body.append(script);
  });
  const main=async()=>{
    const plan=window.CieoLibrarySources;
    if(!Array.isArray(plan))throw new Error('Missing source manifest; run node scripts/build-library.mjs.');
    const paths=['runtime.core.js',...plan,...['icons','model','motion','cards','navigation','dialogs','settings','app'].map(name=>`library/ui/${name}.js`)];
    // Dynamic scripts with async=false fetch in parallel but execute in insertion order.
    await Promise.all(paths.map(path=>load(path,path.startsWith('blocks/'))));
    window.CieoLibrary.mount(A);
  };
  main().catch(error=>{
    const node=document.getElementById('library-loading');node.replaceChildren();
    const p=document.createElement('p');p.textContent=error.message;node.append(p);
    const hint=document.createElement('p');hint.textContent='Open this file inside the repository, or build the standalone catalogue.';node.append(hint);
    console.error(error);
  });
})();
