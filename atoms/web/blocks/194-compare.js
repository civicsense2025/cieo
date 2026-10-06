

atom({ id:'compare', cat:'Writing', name:'Version compare slider', block:'version compare, diff', fam:['D','X'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="margin:0 auto;width:min(360px,92%);gap:8px;padding:12px"><div class="cmp" style="position:relative;height:150px;border-radius:12px;overflow:hidden;cursor:ew-resize;touch-action:none;border:1px solid var(--line)" role="slider" tabindex="0" aria-label="Version" aria-valuemin="1" aria-valuemax="2"><div class="pa" style="position:absolute;inset:0;padding:14px;background:var(--tile)"><div class="small muted">Draft 1</div><div style="font-weight:600;margin-top:4px">We launch in June.</div><div class="small muted" style="margin-top:4px">Three chapters cover pricing, refunds, and support hours.</div></div><div class="pb" style="position:absolute;inset:0;padding:14px;background:var(--card)"><div class="small muted">Draft 2</div><div style="font-weight:600;margin-top:4px">We launch in July.</div><div class="small" style="margin-top:4px">Three chapters cover <span style="background:var(--accent-tint);border-radius:4px;padding:0 4px">pricing, refunds, support hours, and renewals</span>.</div></div><div class="hd" style="position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:var(--ink)"><span style="position:absolute;top:50%;left:50%;width:28px;height:32px;min-height:32px;margin:-14px;border-radius:50%;background:var(--ink);box-shadow:var(--shadow)"></span></div></div><div class="row" style="justify-content:space-between;align-items:center"><span class="row" style="gap:8px"><button class="btn ba">A</button><button class="btn bb">B</button></span><span class="df small muted" style="position:relative;height:18px;min-width:170px;text-align:right"></span></div></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Snap to nearer draft</span></label><div class="hint">Drag the divider, or pick a version</div>`,
  desc:'The divider follows the pointer one to one. On release it springs to the nearer draft, and the caption swaps to match.',
  api:'x = held ? pointer : x.at(t)   up: x.release(hx,vx,near,S.soft)   cap.to(near)',
  init(st){
    const el = $(st,'.cmp'), top = $(st,'.pb'), hd = $(st,'.hd'), df = $(st,'.df');
    const x = new Track(0); let held = false, hx = 0, moved = false;
    const sw = new Swap(0);
    const L = ['Showing draft 1 — 2 changes','Showing draft 2 — approved'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-end'; e.textContent = s; df.appendChild(e); return e; });
    const ba = $(st,'.ba'), bb = $(st,'.bb');
    const show = k => {
      if (REDUCE){ sw.cur = k; sw.prev = null; sw.t = -9; } else sw.to(k);
      ba.classList.toggle('ink', k === 0); bb.classList.toggle('ink', k === 1);
    };
    const pick = k => { if (REDUCE) x.jump(k); else x.set(k, S.soft); show(k); };
    ba.onclick = () => pick(0); bb.onclick = () => pick(1); show(0); bb.classList.remove('ink'); ba.classList.add('ink');
    drag(el, { down:p => { held = true; moved = false; hx = clamp(p.x/p.w); if (REDUCE) x.jump(hx); else x.set(clamp(hx), S.soft); },
      move:p => { moved = true; hx = clamp(p.x/p.w); },
      up:(p, vel) => { held = false; const near = hx < .5 ? 0 : 1;
        if (moved){ if (REDUCE) x.jump(near); else x.release(hx, vel.vx/el.clientWidth, near, S.soft); }
        show(near); } });
    el.onkeydown = e => { if (e.key === 'ArrowRight') pick(1); if (e.key === 'ArrowLeft') pick(0); };
    return t => {
      const v = clamp(held && moved ? hx : x.at(t));
      top.style.clipPath = `inset(0 ${((1-v)*100).toFixed(2)}% 0 0)`; hd.style.left = (v*100).toFixed(2) + '%';
      L.forEach((e,k) => sw.apply(e, k, t)); el.setAttribute('aria-valuenow', v < .5 ? 1 : 2);
    };
  }});
