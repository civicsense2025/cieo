/* Existing recipes and runtime are assembled before this controller. No replacement spring math. */
L.installDialogs();L.mountNavigation();L.mountTiles();L.applyAppearance();
const routeAtom=L.readRoute();L.filter();
L.get('l-search').addEventListener('input',e=>L.updateFilters({query:e.target.value}));
L.get('l-clear-search').onclick=()=>{L.get('l-search').value='';L.updateFilters({query:''});L.get('l-search').focus()};
L.get('l-reset').onclick=()=>{L.get('l-search').value='';L.updateFilters({query:'',category:'all',family:'*'})};
L.get('l-inspector-close').onclick=L.closeInspector;
L.get('l-focus').addEventListener('close',L.restoreFocusAtom);
L.get('l-inspect-sheet').addEventListener('close',()=>{if(!L.focused&&L.get('l-inspect-sheet').returnValue!=='layout')L.closeInspector()});
L.updatePlaybackStatus=()=>{const label=L.get('l-playback-status');label.lastElementChild.textContent=L.systemReduce.matches?'Reduced motion':L.state.paused?'Paused':'Live previews';label.firstElementChild.style.background=L.isStill()?'var(--faint)':'var(--success)'};
L.updatePlaybackStatus();
L.get('l-pause').onclick=()=>{
 L.state.paused=!L.state.paused;L.get('l-pause').setAttribute('aria-pressed',String(L.state.paused));
 L.get('l-pause').innerHTML=L.icon(L.state.paused?'play':'pause');
 L.get('l-pause').setAttribute('aria-label',L.state.paused?'Resume previews':'Pause previews');
 L.updatePlaybackStatus();L.needsSettle=true;
 L.announce(L.state.paused?'Previews paused. Controls still respond.':'Previews resumed.');
};
for(const b of document.querySelectorAll('[data-setting]'))b.onclick=()=>{
 L.state[b.dataset.setting]=b.dataset.value;L.applyAppearance();if(!L.saveAppearance())L.announce('Appearance changed for this visit. Storage is unavailable.');
};
for(const b of document.querySelectorAll('[data-speed]'))b.onclick=()=>{
 clock.scale=Number(b.dataset.speed);document.querySelectorAll('[data-speed]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
};
addEventListener('hashchange',()=>{
 const id=L.readRoute();L.filter();if(id){const a=A.find(x=>x.id===id);if(a){L.updateFilters({query:'',category:'all',family:'*'});a.el.scrollIntoView({block:'center'});L.inspect(a,a.el.querySelector('button'))}}
});
addEventListener('keydown',e=>{
 const editing=e.target.closest('input,textarea,select,[contenteditable="true"]');
 if(!editing&&!document.querySelector('dialog[open]')&&((e.key==='k'&&(e.metaKey||e.ctrlKey))||e.key==='/')){e.preventDefault();L.get('l-search').focus()}
 if(e.key==='Escape'&&!document.querySelector('dialog[open]')&&L.inspected)L.closeInspector();
});
let lastWidth=innerWidth;
addEventListener('resize',()=>{
 const crossed=(lastWidth>=1280)!==(innerWidth>=1280);lastWidth=innerWidth;
 if(innerWidth>=960)L.closeDialog(L.get('l-browser'));
 if(crossed&&L.inspected){const a=L.inspected;L.closeDialog(L.get('l-inspect-sheet'),'layout');L.get('l-inspector').hidden=true;delete document.body.dataset.inspector;L.inspect(a,a.el.querySelector('button'))}
});
// Reduced-motion/paused recipes settle on user input rather than play perpetual decoration.
let settleUntil=0;L.needsSettle=true;
for(const type of ['keydown','focusin','focusout','pointerup','pointercancel','pointerover'])document.addEventListener(type,e=>{if(e.target.closest('.stage'))L.needsSettle=true});
document.addEventListener('input',e=>{if(e.target.closest('.stage'))L.needsSettle=true});
document.addEventListener('click',e=>{if(e.target.closest('.stage'))L.needsSettle=true});
document.addEventListener('pointermove',e=>{if(e.buttons&&e.target.closest('.stage'))settleUntil=performance.now()+100});
L.frameCount=0;
function frame(ms){
 const dt=Math.min(.05,(ms-clock.last)/1000);clock.last=ms;
 const still=L.isStill();if(!document.hidden){
  if(!still)clock.t+=dt*clock.scale;
  else if(L.needsSettle){clock.t+=10;L.needsSettle=false}
  const t=clock.t;
  // Tick visible originals only; paused inputs can still paint their final values.
  if(!still||settleUntil>ms||L.lastRenderedTime!==t){
   for(const a of L.activeAtoms)if(a.render&&!a.el.hidden&&(!L.focused||a!==L.focused)){try{a.render(t)}catch(error){console.error(a.id,error);L.failures.push({id:a.id,message:String(error)});a.render=null}}
   if(L.focused?.render)L.focused.render(t);L.lastRenderedTime=t;
  }
  for(const job of L.chromeJobs)job(ms/1000);L.frameCount++;
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
L.systemReduce.addEventListener('change',()=>{L.needsSettle=true;L.updatePlaybackStatus();L.announce(L.systemReduce.matches?'Reduced motion: previews settle without playback.':'System motion preference updated.')});
if(routeAtom){const a=A.find(x=>x.id===routeAtom);if(a){a.el.scrollIntoView({block:'center'});L.inspect(a,a.el.querySelector('button'))}}
// A read-only diagnostic surface for recipe integrity and browser regression tests.
window.CieoCatalogue=Object.freeze({
 get count(){return A.length},get initialized(){return L.mountedCount},get errors(){return L.failures.slice()},
 get visible(){return A.filter(a=>!a.el.hidden).map(a=>a.id)},
});
