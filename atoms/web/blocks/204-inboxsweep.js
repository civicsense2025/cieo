atom({ id:'inboxsweep', cat:'Writing', name:'Inbox sweep', block:'inbox, drafts', fam:['D','X','M','S'], tall:true,
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="margin:0 auto;width:min(340px,92%);gap:8px;padding:12px"><div class="row small muted" style="justify-content:space-between"><span>Drafts to sweep</span><span><span class="dn"></span> left</span></div><div class="sr col" style="gap:0"></div><button class="btn un">Undo</button></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Arm past 80px</span></label><div class="hint">Swipe a row past the line to sweep it away</div>`,
  desc:'A row follows the finger and arms past 80 pixels. On release it flies out on the fast spring while its gap closes on the calm one, and the count left rolls down. Undo brings the last swept row back.',
  api:'x = pointer; armed = |x| > 80   out: x.release(x, v, ±W, S.snap); h.set(0, S.base, t+.15)   undo: h.set(1); x.set(0)',
  init(st){
    const sr = $(st,'.sr'), un = $(st,'.un'), dn = new Digits($(st,'.dn'), 1);
    const M = [['Spring launch','Open with the cover story'],['Pricing rewrite','Shorter, plainer, kinder'],['Member letter','Thank the founding fifty'],['Send checklist','Proof, art, time, ship']];
    const gone = [];
    const rows = M.map(([a,b],idx) => { const last = idx === M.length-1;
      const w = document.createElement('div'); w.style.cssText = 'position:relative;overflow:hidden' + (last ? '' : ';border-bottom:1px solid var(--line-soft)');
      w.innerHTML = '<div class="bk" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 18px;background:var(--raised);color:var(--ink)"><span class="small">‹ Sweep</span><span class="small">Sweep ›</span></div><div class="fg" style="position:relative;background:var(--card);padding:12px 14px;touch-action:pan-y;cursor:grab"><b class="small" style="display:block">' + a + '</b><span class="small muted">' + b + '</span></div>';
      sr.appendChild(w);
      const r = { w, fg:$(w,'.fg'), bk:$(w,'.bk'), x:new Track(0, S.snap), h:new Track(1), held:false, hx:0, sx:0, H:0, out:0 };
      drag(r.fg, { down:p => { r.held = true; r.sx = r.x.at() - p.cx; r.hx = r.x.at(); },
        move:p => r.hx = r.sx + p.cx,
        up:(p,v) => { r.held = false; const Wd = r.w.clientWidth;
          if (Math.abs(r.hx) > 80 || Math.abs(v.vx) > 700){ const s = Math.sign(r.hx || v.vx) || 1; r.H = r.w.offsetHeight;
            if (REDUCE){ r.x.jump(s*Wd); r.h.jump(0); } else { r.x.release(r.hx, v.vx, s*Wd); r.h.set(0, S.base, now() + .15); }
            r.out = s; gone.push(r); left(); }
          else if (REDUCE) r.x.jump(0); else r.x.set(0); } });
      return r; });
    const left = () => { const n = rows.filter(r => !r.out).length;
      if (REDUCE) dn.set(String(n), true); else dn.set(String(n));
      un.disabled = !gone.length; un.style.opacity = gone.length ? '' : '.45'; };
    un.onclick = () => { const r = gone.pop(); if (!r) return; r.out = 0;
      if (REDUCE){ r.h.jump(1); r.x.jump(0); } else { r.h.set(1); r.H = 0; r.x.jump(Math.sign(r.x.target || 1)*r.w.clientWidth); r.x.set(0); }
      left(); };
    dn.set(String(M.length), true); left();
    return t => { rows.forEach(r => { const x = r.held ? r.hx : r.x.at(t), a = clamp(Math.abs(x)/80);
        r.fg.style.transform = 'translateX(' + px(x) + ')';
        r.bk.style.background = a >= 1 ? 'var(--ink)' : mix(a,'var(--muted)','var(--raised)');
        r.bk.style.color = a >= 1 ? 'var(--card)' : 'var(--ink)';
        const h = clamp(r.h.at(t)); r.w.style.height = h < 1 ? px(h*(r.H || r.w.scrollHeight)) : ''; });
      dn.render(t); };
  }});
