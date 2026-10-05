

atom({ id:'dropzone', cat:'Inputs', name:'File drop zone', block:'form, gallery upload', fam:['X','M','T'], tall:true,
  html:`<div class="col" style="width:min(340px,90%);gap:8px"><label class="dz" style="position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:18px;border:1.5px dashed var(--line);border-radius:12px;cursor:pointer;text-align:center">${ic(I.up,20)}<span class="small"><b>Drop files</b> or browse</span><span class="small muted">PNG, JPG or PDF · 5 MB max</span><input id="dz-in" type="file" multiple style="position:absolute;inset:0;opacity:0;cursor:pointer"></label><button class="btn sm" style="align-self:flex-end">Use sample files</button><div class="fl col" style="gap:6px"></div></div>`,
  desc:'Dragging a file over the zone inks its border and tints it. Each file opens its row, fills its bar, then ends in a success check or a danger message. Files never leave your browser.',
  api:'zone.over.set(dragging)   bar = load.at(t)   end → success | danger',
  init(st){
    const dz = $(st,'.dz'), fin = $(st,'input'), fl = $(st,'.fl'), over = new Track(0); const files = [];
    const add = (name, size) => { const r = document.createElement('div'); r.style.overflow = 'hidden';
      r.innerHTML = `<div class="card" style="padding:8px 10px"><div class="row small" style="gap:8px"><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500"></span><span class="muted num sz"></span><span class="st" style="position:relative;width:16px;height:16px"></span></div><div style="height:4px;border-radius:2px;background:var(--raised);margin-top:6px;overflow:hidden"><i class="br" style="display:block;height:100%"></i></div><div class="er small" style="color:var(--danger);height:0;overflow:hidden">Too large · 5 MB max</div></div>`;
      $(r,'span').textContent = name; $(r,'.sz').textContent = size > 1e6 ? (size/1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(size/1e3)) + ' KB'; fl.prepend(r);
      const bad = size > 5e6, f = { r, in:r.firstChild, h:new Track(0), ld:new Track(0, { w:4 }), bad, st:$(r,'.st'), br:$(r,'.br'), er:$(r,'.er'), end:new Track(0) };
      f.h.set(1); f.ld.set(bad ? .4 : 1, { w:4 }, now() + .15); f.doneAt = now() + (bad ? .9 : 1.6);
      f.st.innerHTML = `<span class="layer" style="color:var(--success)">${ic(I.check,16,2.5)}</span><span class="layer" style="color:var(--danger)">${ic(I.alert,16)}</span>`; files.push(f); if (files.length > 4) { const old = files.shift(); old.r.remove(); } };
    const hasFiles = ev => [...(ev.dataTransfer?.types || [])].includes('Files');
    dz.addEventListener('dragenter', ev => { if (hasFiles(ev)) over.set(1); }); dz.addEventListener('dragleave', () => over.set(0)); dz.addEventListener('drop', () => over.set(0));
    fin.onchange = () => { [...fin.files].forEach(f => add(f.name, f.size)); fin.value = ''; };
    $(st,'.sm').onclick = () => { add('cover-photo.jpg', 1.8e6); setTimeout(() => add('annual-report.pdf', 8.4e6), 250/clock.scale); };
    return t => { const o = clamp(over.at(t)); dz.style.borderColor = mix(o,'var(--ink)','var(--line)'); dz.style.background = mix(o,'var(--raised)','transparent'); dz.style.transform = `scale(${(1 + .01*o).toFixed(4)})`;
      files.forEach(f => { if (f.doneAt && t >= f.doneAt){ f.doneAt = 0; f.end.set(1); } const e = clamp(f.end.at(t));
        f.r.style.height = px(clamp(f.h.at(t))*(f.in.offsetHeight)); fade(f.in, f.h.at(t), null);
        f.br.style.width = (clamp(f.ld.at(t))*100).toFixed(2) + '%'; f.br.style.background = f.bad ? mix(e,'var(--danger)','var(--ink)') : mix(e,'var(--success)','var(--ink)');
        const ls = $$(f.st,'.layer'); ls[0].style.opacity = f.bad ? 0 : e; ls[1].style.opacity = f.bad ? e : 0; ls.forEach(l => l.style.transform = `scale(${(.6+.4*e).toFixed(3)})`);
        if (f.bad){ f.er.style.height = px(e*20); f.er.style.opacity = e; } }); };
  }});