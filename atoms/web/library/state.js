L.categories = [...new Set(A.map(a=>a.cat))];
L.families = {'*':'All motion',M:'Morph',S:'Swap',D:'Drag',E:'Edges',X:'Enter / exit',T:'Time'};
L.sets = {
 essentials:{title:'Everyday interactions',subtitle:'Small details. Better interfaces.',icon:'sliders',mark:'↔',colors:['#aaa2eb','#ddd9fa','#fff','#e0dbf6','#5449a8'],cats:['Content','Forms','Inputs','Interactive','Admin','Admin kit']},
 writing:{title:'Writing & editing',subtitle:'A little room to think.',icon:'pen',mark:'Aa',colors:['#8dbab0','#c6e0d5','#fffcf1','#d2e6db','#426e61'],cats:['Writing','Editor','Documents','Design tools']},
 workspace:{title:'Workspace patterns',subtitle:'Everything in its place.',icon:'layers',mark:'▦',colors:['#efa982','#f4d4b2','#fff8e8','#f3dfc6','#9c6941'],cats:['Workspace','Layout','Navigation','Overlays','Views','Workflow']},
 media:{title:'Image & motion',subtitle:'Let the work do the talking.',icon:'play',mark:'◒',colors:['#85aee5','#c5d6f6','#f4f8ff','#d6e1f6','#476794'],cats:['Media','Photo effects','Image transitions','Carousels','Galleries','Scroll stories']},
};
L.featured = ['tabs','switch','field','palette','dropdown','sheet','surface','accordion','toast','slider','checklist','copy','stepper','progress','badge','rating'];
L.state = {category:'all',family:'*',query:'',paused:false,theme:'system',accent:'violet',density:'gallery',corners:'soft'};
L.storage = {read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}},write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}};
const saved=L.storage.read('cieo-library:saved',[]);
L.saved=new Set(Array.isArray(saved)?saved.filter(x=>A.some(a=>a.id===x)):[]);
const prefs=L.storage.read('cieo-library:view',{});
for(const [key,choices] of Object.entries({theme:['system','white','black'],accent:['violet','blue','green','coral'],density:['gallery','comfortable'],corners:['soft','crisp']})) {
 if(prefs && choices.includes(prefs[key])) L.state[key]=prefs[key];
}
L.systemDark=matchMedia('(prefers-color-scheme: dark)');
L.systemReduce=matchMedia('(prefers-reduced-motion: reduce)');
L.isStill=()=>L.state.paused||L.systemReduce.matches;
L.applyAppearance=()=>{
 document.documentElement.dataset.theme=L.state.theme==='system'?(L.systemDark.matches?'black':'white'):L.state.theme;
 document.documentElement.dataset.accent=L.state.accent;
 document.documentElement.dataset.corners=L.state.corners;
 L.get('l-grid').dataset.density=L.state.density;
 document.querySelectorAll('[data-setting]').forEach(b=>b.setAttribute('aria-pressed',String(L.state[b.dataset.setting]===b.dataset.value)));
};
L.systemDark.addEventListener('change',L.applyAppearance);
L.saveAppearance=()=>L.storage.write('cieo-library:view',Object.fromEntries(['theme','accent','density','corners'].map(k=>[k,L.state[k]])));
L.slug=cat=>'cat-'+cat.toLowerCase().replace(/\s+/g,'-');
L.readRoute=()=>{
 const hash=location.hash.slice(1);const legacy=L.categories.find(c=>L.slug(c)===hash);
 const p=new URLSearchParams(hash);
 const cat=legacy||p.get('view')||'all';
 L.state.category=['all','saved',...Object.keys(L.sets),...L.categories].includes(cat)?cat:'all';
 L.state.family=Object.hasOwn(L.families,p.get('motion'))?p.get('motion'):'*';
 L.state.query=(p.get('q')||'').slice(0,160);L.get('l-search').value=L.state.query;
 return p.get('atom')|| (A.some(a=>a.id===hash)?hash:null);
};
L.writeRoute=(push=false)=>{
 const p=new URLSearchParams();if(L.state.category!=='all')p.set('view',L.state.category);
 if(L.state.family!=='*')p.set('motion',L.state.family);if(L.state.query)p.set('q',L.state.query);
 try{history[push?'pushState':'replaceState'](null,'',location.pathname+location.search+(p.size?'#'+p:''))}catch{/* file hosts may deny history. */}
};
L.matches=a=>{
 const {category,family,query}=L.state;
 const categoryMatch=category==='all'||(category==='saved'?L.saved.has(a.id):L.sets[category]?L.sets[category].cats.includes(a.cat):a.cat===category);
 return categoryMatch&&(family==='*'||a.fam.includes(family))&&`${a.name} ${a.cat} ${a.block} ${a.desc}`.toLowerCase().includes(query.toLowerCase().trim());
};
L.updateFilters=(next,push=false)=>{Object.assign(L.state,next);L.filter();L.writeRoute(push)};
