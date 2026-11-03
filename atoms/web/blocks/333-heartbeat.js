
atom({ id:'heartbeat', cat:'Dynamic', name:'Heartbeat status', block:'status, health', fam:['S','M'],
  html:`<div class="card col" style="width:min(380px,calc(100% - 24px));margin:0 auto;padding:15px 16px;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">API status</b><div class="row" style="gap:10px;align-items:center"><span class="shape" style="width:32px;height:32px;border-radius:10px;background:var(--raised);display:grid;place-items:center;padding:0"><i class="dot" style="display:block;width:12px;height:12px;border-radius:50%;background:var(--success);transform:translateY(.5px)"></i></span><span class="lb" style="position:relative;font-size:14px;font-weight:600;line-height:1.5;min-height:21px;min-width:120px"></span></div><div class="cp small muted" style="position:relative;font-size:12px;line-height:1.5;min-height:18px"></div><div class="row" style="gap:8px;align-items:center"><button class="btn rp" style="min-height:32px">Replay</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;margin-left:auto;font-size:12px"><input type="checkbox" class="lp"> loop</label></div></div><div class="hint">Slow clock while live · morphs as it degrades</div>`,
  desc:'The dot breathes on a slow clock while live. As health degrades the dot morphs warning to danger and the label swaps with it. When reports stop, the status goes stale: the dot turns grey and stops breathing, so a silent feed never reads as live. The pass ends settled on live.',
  api:'health.set(0|1|2, S.soft) every 2.2s   breathe: 1 ± .06·sin(2πt/2.4)',
  init(st){
    const lb = $(st,'.lb'), cp = $(st,'.cp'), dot = $(st,'.dot'), lp = $(st,'.lp');
    const S3 = [['Live','All systems normal · settled'],['Degraded','p99 up 2× · watching'],['Outage','Failing over · on it'],['Stale','No update for 2 min · retrying']];
    const lsw = new Swap(0), csw = new Swap(0), h = new Track(0), stale = new Track(0);
    S3.forEach(([a,b]) => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = a; lb.appendChild(e);
      const c = document.createElement('span'); c.className = 'layer'; c.textContent = b; cp.appendChild(c); });
    let k = 0, next = 1.4, done = false;
    $(st,'.rp').onclick = () => { const t = now(); k = 0; done = false; next = t + .3; lsw.to(0); csw.to(0); h.set(0, S.soft, t); stale.set(0, S.snap, t); };
    const col = v => v < 1 ? mix(v,'var(--warning)','var(--success)') : mix(v - 1,'var(--danger)','var(--warning)');
    return t => { if (lp.checked) done = false;
      if (!done && t >= next){ k++;
        if (k >= S3.length){ k = 0; done = !lp.checked; }
        lsw.to(k); csw.to(k);
        const hk = k === 3 ? 2 : k, gs = k === 3 ? 1 : 0;
        if (k === 0 && stale.target) h.jump(0); else if (REDUCE) h.jump(hk); else h.set(hk, S.soft, t);
        if (REDUCE) stale.jump(gs); else stale.set(gs, S.soft, t);
        next = t + 2.2; }
      const quiet = k === 3, ph = REDUCE || quiet ? 1 : .5 + .5*Math.sin(t*2*Math.PI/2.4), br = REDUCE || quiet ? 1 : 1 + .06*Math.sin(t*2*Math.PI/2.4);
      dot.style.background = mix(clamp(stale.at(t)), 'var(--muted)', col(clamp(h.at(t), 0, 2)));
      dot.style.opacity = (.72 + .28*ph).toFixed(3);
      dot.style.transform = `scale(${br.toFixed(3)}) translateY(.5px)`;
      [...lb.children].forEach((e,j) => lsw.apply(e,j,t)); [...cp.children].forEach((e,j) => csw.apply(e,j,t)); };
  }});
