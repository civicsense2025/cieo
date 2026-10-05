

atom({ id:'chip', cat:'Content', name:'Blur swap label', block:'buttons, cta-button', fam:['S','M'],
  html:`<button class="chipb" style="position:relative;height:44px;border-radius:22px;background:var(--ink);color:var(--card);border:0;cursor:pointer;font-weight:500"></button><div class="hint">Click to advance</div>`,
  desc:'Outgoing text blurs up and out in 100ms. Incoming text starts after it, while the pill width springs to fit.',
  api:'w.set(measure(next)); swap.to(next)',
  init(st){
    const b = $(st,'.chipb'), T = ['Upload files','Uploading 3 files','Processing','Shared with 4 people'];
    const L = T.map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; b.appendChild(e); return e; });
    const sw = new Swap(0), w = new Track(0); let i = 0;
    const width = k => { const m = document.createElement('span'); m.textContent = T[k]; Object.assign(m.style,{position:'absolute',visibility:'hidden',whiteSpace:'nowrap',font:'500 15px var(--sans)',padding:'0 22px'}); st.appendChild(m); const x = m.offsetWidth; m.remove(); return x; };
    b.onclick = () => { i = (i+1) % T.length; sw.to(i); w.set(width(i)); };
    const init = () => w.jump(width(i)); document.fonts.ready.then(init); init();
    return t => { b.style.width = px(w.at(t)); L.forEach((e,k) => sw.apply(e,k,t)); };
  }});