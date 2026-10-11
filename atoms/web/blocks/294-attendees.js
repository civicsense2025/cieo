atom({ id:'attendees', cat:'Scheduling', name:'Attendee fields', block:'attendees, invite form', fam:['M','S'],
  html:`<div class="col" style="width:min(340px,90%);margin:0 auto;gap:8px;line-height:1.5"><b style="font-size:15px;font-weight:600">Invite attendees</b><div class="card" style="padding:14px 16px;display:flex;flex-direction:column;gap:10px"><div class="f0" style="display:flex;flex-direction:column;gap:4px"><label style="font-size:13px">Name</label><div class="iw" style="position:relative"><input class="in" type="text" autocomplete="name" placeholder="Ada Lovelace" style="width:100%;height:36px;border-radius:8px;border:1.5px solid var(--muted);background:var(--card);padding:0 32px 0 10px;font-size:13px;color:var(--ink)"></div><div class="mg" style="position:relative;min-height:18px;font-size:12px;line-height:1.5;display:grid"></div></div><div class="f1" style="display:flex;flex-direction:column;gap:4px"><label style="font-size:13px">Email</label><div class="iw" style="position:relative"><input class="in" type="email" autocomplete="email" placeholder="ada@example.com" style="width:100%;height:36px;border-radius:8px;border:1.5px solid var(--muted);background:var(--card);padding:0 32px 0 10px;font-size:13px;color:var(--ink)"></div><div class="mg" style="position:relative;min-height:18px;font-size:12px;line-height:1.5;display:grid"></div></div><button class="go" style="min-height:36px;border-radius:10px;border:0;background:var(--ink);color:var(--card);cursor:pointer;font-size:14px;font-weight:600">Send invite</button><div class="row small muted" style="gap:6px;align-items:center;border-top:1px solid var(--line);padding-top:10px"><label style="display:contents"><input type="checkbox" class="ci" checked style="width:16px;height:16px"><span style="font-size:12px">Include calendar invite</span></label></div></div></div><div class="hint">Invalid rings red · valid earns a check</div>`,
  desc:'Each field validates as you type. A bad value rings the field red and swaps in its message; a good one earns a success check. Sending with errors surfaces every message, and a clean invite holds its success state.',
  api:'err.set(1) danger ring + msg swap   ok.set(1) success check   send: all valid → terminal',
  init(st){
    const pristine = st.innerHTML;
    const defs = [
      { box:'.f0', test:v => v.trim().length >= 2, msg:'Enter a name (2+ letters)' },
      { box:'.f1', test:v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg:'Enter a valid email' }];
    const offs = [];
    const F = defs.map(d => {
      const box = $(st,d.box), inp = $$(box,'.in')[0], mg = $$(box,'.mg')[0], iw = $$(box,'.iw')[0];
      const e0 = document.createElement('span'); e0.style.cssText = 'grid-area:1/1;display:flex;align-items:center;min-width:0;min-height:18px';
      const e1 = document.createElement('span'); e1.className = 'layer'; e1.textContent = d.msg;
      e1.style.cssText = 'grid-area:1/1;position:relative;display:flex;align-items:center;min-width:0;min-height:18px;overflow-wrap:anywhere;color:var(--danger,#c9403b)';
      mg.appendChild(e0); mg.appendChild(e1);
      const ck = document.createElement('span'); ck.textContent = '✓';
      ck.style.cssText = 'position:absolute;right:10px;top:50%;margin-top:-9px;width:0;overflow:hidden;font-size:14px;color:var(--success);transform:translateY(-1px)';
      iw.appendChild(ck);
      const f = { inp, e0, e1, ck, sw:new Swap(0), err:new Track(0), ok:new Track(0), touched:false, ...d };
      const check = quiet => { const good = d.test(inp.value);
        if (!inp.value && !f.touched && quiet) return good;
        f.err.set(!good && (f.touched || !quiet) ? 1 : 0);
        f.ok.set(good && inp.value ? 1 : 0);
        if (!good && (f.touched || !quiet)) f.sw.to(1); else f.sw.to(0);
        return good; };
      const onInput = () => check(true), onBlur = () => { f.touched = true; check(false); };
      inp.addEventListener('input', onInput);
      inp.addEventListener('blur', onBlur);
      offs.push(() => { inp.removeEventListener('input', onInput); inp.removeEventListener('blur', onBlur); });
      return f; });
    const go = $(st,'.go');
    const done = new Track(0);
    const label = ['Send invite','Invite sent ✓'];
    const li = label.map(s => { const e = document.createElement('span'); e.className = 'layer';
      e.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center'; go.appendChild(e);
      e.textContent = s; return e; });
    go.style.position = 'relative'; go.style.overflow = 'hidden';
    const gsw = new Swap(0);
    go.onclick = () => { F.forEach(f => f.touched = true);
      if (F.every(f => { const g = f.test(f.inp.value);
        f.err.set(g ? 0 : 1); f.ok.set(g ? 1 : 0); f.sw.to(g ? 0 : 1); return g; })){
        gsw.to(1); done.set(1, S.base); go.style.cursor = 'default'; } };
    const render = t => F.forEach((f,i) => { const e = clamp(f.err.at(t)), o = clamp(f.ok.at(t));
      f.inp.style.borderColor = e > .02 ? mix(e,'var(--danger,#c9403b)','var(--muted)') : mix(o,'var(--success)','var(--muted)');
      f.inp.style.boxShadow = e > .02 ? '0 0 0 3px color-mix(in oklab, var(--danger,#c9403b) ' + (e*18).toFixed(1) + '%, transparent)' : 'none';
      f.sw.apply(f.e1, 1, t); fade(f.e0, 1, 0, false);
      f.ck.style.width = px(16*o);
      if (i === 0){ li.forEach((l,k) => gsw.apply(l,k,t));
        go.style.background = mix(clamp(done.at(t)),'var(--success)','var(--ink)'); } });
    render.ctl = { fields:F, done, choice:gsw };
    render.dispose = () => { if (render.disposed) return; render.disposed = true;
      offs.forEach(off => off()); go.onclick = null; st.innerHTML = pristine; };
    return render;
  }});
