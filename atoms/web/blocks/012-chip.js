

atom({ id:'chip', cat:'Content', name:'Blur swap label', block:'buttons, cta-button', fam:['S','M'],
  html:`<div class="col" style="gap:16px;align-items:center"><button class="chipb" aria-label="Upload status" style="position:relative;height:48px;border-radius:24px;background:var(--accent);color:var(--card);border:0;cursor:pointer;font-weight:500"></button><label class="row small muted" style="gap:6px;cursor:pointer"><input type="checkbox" class="lp"> loop</label></div><div class="hint">Click to advance</div>`,
  desc:'Outgoing text blurs up and out in 100ms. Incoming text starts after it, while the pill width springs to fit. The last state holds as a success terminal instead of wrapping; tapping it starts over.',
  api:'w.set(measure(next)); swap.to(next)   end: success.set(1), hold',
  init(st){
    const b = $(st,'.chipb'), lp = $(st,'.lp'), T = ['Upload files','Uploading 3 files','Processing','Shared with 4 people'];
    const L = T.map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; b.appendChild(e); return e; });
    const sw = new Swap(0), w = new Track(0), sv = new Track(0); let i = 0;
    const width = k => { const m = document.createElement('span'); m.textContent = T[k]; Object.assign(m.style,{position:'absolute',visibility:'hidden',whiteSpace:'nowrap',font:'500 15px var(--sans)',padding:'0 24px'}); st.appendChild(m); const x = m.offsetWidth; m.remove(); return x; };
    b.onclick = () => {
      if (i === T.length - 1 && !lp.checked){ i = 0; sw.to(0); w.set(width(0)); sv.set(0, S.base); return; }
      i = (i+1) % T.length; sw.to(i); w.set(width(i)); sv.set(i === T.length - 1 ? 1 : 0, S.base);
    };
    const init = () => w.jump(width(i)); document.fonts.ready.then(init); init();
    return t => { const s = clamp(sv.at(t)); b.style.width = px(w.at(t));
      b.style.background = mix(s,'var(--success)','var(--accent)');
      L.forEach((e,k) => sw.apply(e,k,t)); };
  }});