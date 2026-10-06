atom({ id:'redirect', cat:'SEO', name:'Redirect-rule builder', block:'seo redirects, rules', fam:['M','S'], tall:true,
  html:`<div class="col" style="width:min(400px,94%);gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">Redirects · <span class="ok num" style="font-variant-numeric:tabular-nums"></span>/3 valid</b><div class="rl col" style="position:relative;gap:0"></div><div class="st card" role="status" style="position:relative;height:26px;padding:0 14px;font-size:13px;font-weight:600;line-height:26px"></div><div class="hp card" style="position:relative;min-height:40px;padding:10px 14px;font-size:12.5px;line-height:1.55"></div><div class="row small muted" style="gap:6px;font-size:12.5px"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="rx" checked> regex paths</label><span aria-hidden="true">·</span><span>reorder with ↑ ↓</span></div></div>`,
  desc:'Rows spring to their slots when reordered. The regex toggle swaps its help line with blur, and an invalid source rings the field in danger with its message. All-valid swaps the terminal confirmation.',
  api:'row.y.set(slot) regex.swap.to(on) bad: ring.set(1,danger)+msg · all ok: done.to(1)',
  init(st){
    const R = [
      { f:'/old-pricing', t:'/pricing', ok:true },
      { f:'/blog/(.*)', t:'/journal/$1', ok:true },
      { f:'ht tp://bad url', t:'/journal', ok:false }
    ];
    const rl = $(st,'.rl'), rx = $(st,'.rx'), hp = $(st,'.hp'), stb = $(st,'.st');
    const H = ['Plain match: /old goes to /new, exact path only.', 'Regex on: (.*) captures anything — pair it with a $1 back-reference.'].map(s => { const e = document.createElement('span'); e.className = 'layer'; Object.assign(e.style,{justifyContent:'flex-start',whiteSpace:'normal',color:'var(--muted)'}); e.textContent = s; hp.appendChild(e); return e; });
    const hsw = new Swap(0);
    const SL = ['Keep fixing — one rule needs attention.', 'All rules valid ✓'].map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; Object.assign(e.style,{justifyContent:'flex-start'}); e.textContent = s; if (i) e.style.color = 'var(--success)'; stb.appendChild(e); return e; });
    const dsw = new Swap(0);
    const dg = new Digits($(st,'.ok'), 1); dg.set('2', true);
    const ROWH = 148;
    const rows = R.map(r => { const d = document.createElement('div'); d.className = 'card'; d.style.cssText = 'position:absolute;left:0;right:0;top:0;padding:12px 14px;display:flex;gap:8px';
      d.innerHTML = '<span style="color:var(--muted);font-size:12px;flex:none" aria-hidden="true">⠿</span><div class="col" style="flex:1;gap:6px"><input class="fr" value="' + r.f + '" aria-label="From path" style="border:1.5px solid ' + (r.ok ? 'var(--line)' : 'var(--danger)') + ';border-radius:8px;padding:7px 9px;font:13px/1.45 var(--sans);background:var(--bg);color:var(--ink);outline:none;font-variant-numeric:tabular-nums"><span class="msg" style="font-size:12px;line-height:1.5;color:' + (r.ok ? 'var(--muted)' : 'var(--danger)') + '">' + (r.ok ? '' : 'Spaces are not valid in a path. Try /old-press.') + '</span><div class="row" style="gap:6px"><span class="muted" style="font-size:12px">→</span><input class="to" value="' + r.t + '" aria-label="To path" style="flex:1;min-width:0;border:1.5px solid var(--line);border-radius:8px;padding:7px 9px;font:13px/1.45 var(--sans);background:var(--bg);color:var(--ink);outline:none"></div></div><div class="col" style="gap:4px;flex:none"><button class="btn up" aria-label="Move up" style="min-height:32px;padding:4px 10px">↑</button><button class="btn dn" aria-label="Move down" style="min-height:32px;padding:4px 10px">↓</button></div>';
      rl.appendChild(d);
      return { d, fr:$(d,'.fr'), msg:$(d,'.msg'), y:new Track(0), ok:r.ok, ring:new Track(r.ok ? 0 : 1) }; });
    const order = rows.map((_,i) => i);
    const layout = inst => order.forEach((ri,k) => { if (inst || REDUCE) rows[ri].y.jump(k*ROWH); else rows[ri].y.set(k*ROWH); });
    const move = (k, d) => { const j = k + d; if (j < 0 || j >= order.length) return; const t = order[k]; order[k] = order[j]; order[j] = t; layout(); };
    const syncValid = () => { const n = rows.filter(x => x.ok).length; dg.set(String(n)); dsw.to(n === rows.length ? 1 : 0); };
    rows.forEach((r,i) => { $(r.d,'.up').onclick = () => move(order.indexOf(i), -1); $(r.d,'.dn').onclick = () => move(order.indexOf(i), 1);
      r.fr.oninput = () => { r.ok = !/\s/.test(r.fr.value) && r.fr.value.charAt(0) === '/';
        r.fr.style.borderColor = r.ok ? 'var(--line)' : 'var(--danger)';
        r.msg.textContent = r.ok ? '' : (/\s/.test(r.fr.value) ? 'Spaces are not valid in a path. Try /old-press.' : 'Paths start with /.');
        r.msg.style.color = r.ok ? 'var(--muted)' : 'var(--danger)';
        if (REDUCE) r.ring.jump(r.ok ? 0 : 1); else r.ring.set(r.ok ? 0 : 1, S.snap);
        syncValid(); }; });
    const syncRx = inst => { if (inst || REDUCE){ hsw.cur = rx.checked ? 1 : 0; hsw.prev = null; hsw.t = -9; } else hsw.to(rx.checked ? 1 : 0); };
    rx.onchange = () => syncRx(); syncRx(true);
    syncValid();
    requestAnimationFrame(() => layout(true));
    return t => { rows.forEach(r => { r.d.style.transform = 'translateY(' + r.y.at(t).toFixed(2) + 'px)';
        const k = clamp(r.ring.at(t));
        r.fr.style.boxShadow = k > .02 ? '0 0 0 ' + (3*k).toFixed(1) + 'px color-mix(in oklab, var(--danger) 30%, transparent)' : 'none'; });
      rl.style.height = px(order.length*ROWH - 12);
      H.forEach((el,k) => hsw.apply(el,k,t)); SL.forEach((el,k) => dsw.apply(el,k,t)); dg.render(t); };
  }});
