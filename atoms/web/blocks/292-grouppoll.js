atom({ id:'grouppoll', cat:'Scheduling', name:'Group-poll tally', block:'group poll, voting', fam:['M','S'],
  html:`<div class="col" style="width:min(340px,90%);margin:0 auto;gap:8px;line-height:1.5"><b style="font-size:15px;font-weight:600">When should we meet?</b><div class="card pl" style="padding:14px 16px;display:flex;flex-direction:column;gap:8px"></div></div><div class="hint">Vote — the leader inks green</div>`,
  desc:'Tapping an option morphs every row into its result bar. Fills stagger down the list, counts roll on digits, and the leader inks a success tint that holds as the terminal.',
  api:'fill.set(share, base, t+i*.05) stagger   counts Digits roll   leader lk.set(1) success hold',
  init(st){
    const box = $(st,'.card'), O = [['Tue 9:00 AM',4],['Wed 2:00 PM',6],['Thu 11:00 AM',5]];
    const rows = O.map(([n,v0]) => {
      const b = document.createElement('button');
      b.style.cssText = 'position:relative;overflow:hidden;display:flex;justify-content:space-between;align-items:center;gap:8px;border:1px solid var(--line);background:var(--card);border-radius:10px;padding:0 12px;min-height:44px;cursor:pointer;text-align:left;font-size:13px';
      const fill = document.createElement('i');
      fill.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:0;background:var(--raised)';
      const nm = document.createElement('span'); nm.textContent = n; nm.style.cssText = 'position:relative';
      const ck = document.createElement('span'); ck.textContent = '✓';
      ck.style.cssText = 'position:relative;display:inline-block;overflow:hidden;white-space:nowrap;font-size:13px';
      const left = document.createElement('span');
      left.style.cssText = 'position:relative;display:flex;gap:8px;align-items:center';
      left.appendChild(ck); left.appendChild(nm);
      const ct = document.createElement('span'); ct.style.cssText = 'position:relative;font-variant-numeric:tabular-nums';
      b.appendChild(fill); b.appendChild(left); b.appendChild(ct); box.appendChild(b);
      const dg = new Digits(ct, 2); dg.set(String(v0), true);
      return { b, fill, ck, dg, votes:v0, v:new Track(0), lk:new Track(0), ckT:new Track(0) }; });
    const foot = document.createElement('div');
    foot.className = 'row small muted';
    foot.style.cssText = 'gap:8px;align-items:center;border-top:1px solid var(--line);padding-top:10px;margin-top:2px';
    foot.innerHTML = '<span class="vc" style="font-size:12px"></span><button class="rs" style="margin-left:auto;min-height:32px;border-radius:8px;border:1px solid var(--line);background:none;padding:0 12px;cursor:pointer;font-size:12px;color:var(--ink);opacity:.7">Reset</button>';
    box.appendChild(foot);
    const vc = $$(foot,'.vc')[0];
    let voted = false;
    const tally = () => { const tot = rows.reduce((a,r) => a + r.votes, 0) || 1, t0 = now();
      const lead = rows.indexOf(rows.reduce((a,b) => b.votes >= a.votes ? b : a));
      rows.forEach((r,i) => { r.v.set(r.votes/tot*100, S.base, t0 + i*.05); r.dg.set(String(r.votes));
        r.lk.set(i === lead ? 1 : 0, S.base, t0 + EXIT + i*.05); });
      vc.textContent = tot + (tot === 1 ? ' vote' : ' votes') + ' · ' + O[lead][0] + ' leads'; };
    rows.forEach((r,i) => r.b.onclick = () => { if (voted) return; voted = true;
      r.votes++; r.ckT.set(1); r.b.style.cursor = 'default'; tally(); });
    $$(foot,'.rs')[0].onclick = () => { voted = false;
      rows.forEach((r,i) => { r.votes = O[i][1]; r.v.set(0, S.snap); r.lk.set(0, S.snap);
        r.ckT.set(0, S.snap); r.dg.set(String(r.votes)); r.b.style.cursor = 'pointer'; });
      vc.textContent = 'Tap an option to vote'; };
    vc.textContent = 'Tap an option to vote';
    return t => rows.forEach(r => { const v = r.v.at(t), s = clamp(r.lk.at(t)), c = clamp(r.ckT.at(t));
      r.fill.style.width = clamp(v) + '%';
      r.fill.style.background = mix(s,'var(--success)','var(--raised)');
      r.b.style.borderColor = mix(Math.max(s,c*.5),'var(--success)','var(--line)');
      r.ck.style.width = px(16*c); r.ck.style.opacity = c.toFixed(3);
      r.dg.render(t); });
  }});
