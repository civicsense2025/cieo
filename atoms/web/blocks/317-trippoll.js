atom({ id:'trippoll', cat:'Forms', name:'Trip polls', block:'vote, poll', fam:['M'],
  html:`<div class="card" style="width:min(400px,94%);padding:14px 16px"><p style="font-size:15px;font-weight:600;line-height:1.5;margin:0">Where Saturday?</p><p style="font-size:12.5px;color:var(--muted);line-height:1.5;margin:2px 0 8px">3 friends voting · ends tonight</p><div class="opts" style="display:flex;flex-direction:column;gap:8px"></div><div class="row small muted" style="display:flex;align-items:center;gap:8px;padding:10px 2px 0;font-size:12.5px;color:var(--muted)"><span style="flex:1">Leader tint slides across</span><button type="button" class="btn pg-tg" style="height:32px;border-radius:9px" aria-pressed="true">Totals on</button></div></div><div class="hint">Vote, then change your mind</div>`,
  desc:'Votes stack their bars soft with trailing edges. The leader tint slides to the new front-runner. Totals roll digits and your vote swaps to a check. The tally holds as the terminal.',
  api:'bar[i].set(v,soft) trails .06   tint.go(leader)   total.digits.set(n)   mine.to(check)',
  init(st){
    const box = $(st,'.opts'), N = ['Ferry Building','Lands End','Dolores Park'];
    const votes = [5, 3, 2]; let mine = -1, show = true;
    const rows = N.map((n,i) => { const r = document.createElement('button'); r.style.cssText = 'position:relative;display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:1px solid var(--line);border-radius:10px;background:var(--card);padding:10px 12px;cursor:pointer;overflow:hidden';
      r.innerHTML = `<i class="fl" style="position:absolute;left:0;top:0;bottom:0;background:var(--raised);width:0"></i><i class="tint" style="position:absolute;left:0;top:0;bottom:0;width:0;background:color-mix(in oklab,var(--accent-tint) 70%, transparent)"></i><span style="position:relative;flex:1;font-size:14px;line-height:1.5">${n}</span><b class="tt" style="position:relative;font-size:13px;font-variant-numeric:tabular-nums"></b><span class="mk" style="position:relative;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--line);display:grid;place-items:center;padding:0;font-size:12px;color:var(--success)"></span>`;
      r.setAttribute('aria-pressed', 'false'); box.appendChild(r);
      r.onclick = () => { if (mine === i) mine = -1; else { if (mine >= 0) votes[mine]--; votes[i]++; mine = i; } sync(false); };
      return { r, tt:$(r,'.tt'), fl:$(r,'.fl'), tint:$(r,'.tint'), mk:$(r,'.mk'), bar:new Track(0), lead:new Track(0), dg:new Digits($(r,'.tt'), 2) }; });
    rows.forEach(x => { const a = document.createElement('span'); a.className = 'layer'; a.textContent = ''; x.mk.appendChild(a); });
    function sync(inst){ const tot = votes.reduce((a,b) => a+b, 0), mx = Math.max(...votes), li = votes.indexOf(mx), t0 = now();
      rows.forEach((x,i) => { const p = votes[i]/Math.max(1, tot);
        if (inst || REDUCE){ x.bar.jump(p); x.lead.jump(i === li ? 1 : 0); x.dg.set(String(votes[i]).padStart(2,' '), true); }
        else { x.bar.set(p, S.soft, t0 + i*.05); x.lead.set(i === li ? 1 : 0, S.soft, t0); x.dg.set(String(votes[i]).padStart(2,' ')); }
        x.mk.firstChild.textContent = mine === i ? '✓' : ''; x.mk.style.borderColor = mine === i ? 'var(--success)' : 'var(--line)';
        x.r.setAttribute('aria-pressed', mine === i); x.tt.style.display = show ? '' : 'none'; }); }
    $(st,'.pg-tg').onclick = e2 => { show = !show; const b = e2.currentTarget; b.textContent = show ? 'Totals on' : 'Totals off'; b.setAttribute('aria-pressed', show); sync(true); };
    rows.forEach((x,i) => x.dg.set(String(votes[i]).padStart(2,' '), true));
    sync(true);
    return t => rows.forEach(x => { x.fl.style.width = (clamp(x.bar.at(t))*100).toFixed(1) + '%'; x.tint.style.opacity = clamp(x.lead.at(t)).toFixed(3); x.tint.style.width = (clamp(x.bar.at(t))*100).toFixed(1) + '%'; x.dg.render(t); });
  }});
