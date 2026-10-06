
atom({ id:'stepshell', cat:'Forms', name:'Multi-step form shell', block:'form, multistep, onboarding', fam:['S','M'],
  html:`<div class="col" style="gap:8px;width:min(360px,94%)"><div class="card sh" style="padding:14px 16px;overflow:hidden"><div class="row" style="justify-content:space-between;align-items:baseline"><b style="font-size:15px;font-weight:600;line-height:1.5">Join the briefing</b><span class="small muted num stp" style="font-size:12px"></span></div><div style="height:4px;border-radius:2px;background:var(--fill);margin:8px 0 0"><div class="pg" style="height:100%;border-radius:2px;background:var(--accent);width:33%"></div></div><div class="pns" style="position:relative;margin-top:8px"><div class="layer q0" style="position:absolute;inset:0"><label class="small muted" style="font-size:12px">Name</label><input class="in0" style="width:100%;height:36px;border-radius:8px;border:1px solid var(--line);padding:0 10px;font-size:14px;margin-top:4px" placeholder="Jordan Ellis"></div><div class="layer q1" style="position:absolute;inset:0"><label class="small muted" style="font-size:12px">Email</label><input class="in1" style="width:100%;height:36px;border-radius:8px;border:1px solid var(--line);padding:0 10px;font-size:14px;margin-top:4px" placeholder="you@example.org"></div><div class="layer q2" style="position:absolute;inset:0;display:grid;place-items:center;text-align:center"><div><div style="font-size:22px">✓</div><b style="font-size:15px;font-weight:600">You are on the list</b><div class="small muted" style="font-size:12.5px">First briefing lands Friday.</div></div></div></div><div class="row" style="gap:8px;margin-top:10px"><button class="btn back">Back</button><button class="btn next">Continue</button></div></div><label class="row small muted" style="gap:6px"><input type="checkbox" class="pf"> prefill answers</label></div><div class="hint">Chrome stays fixed; values survive going back</div>`,
  desc:'The chrome and progress bar never move while panels swap in the direction you travel. The shell height springs to each panel. Going back restores what you typed, and the final step morphs into a success terminal.',
  api:'panels Swap dir-aware ±28   h.set(H[i]) springs   values persist   end: success.set(1)',
  init(st){
    const H = [196, 196, 220], layers = [$$(st,'.q0')[0], $$(st,'.q1')[0], $$(st,'.q2')[0]];
    const sw = new Swap(0), h = new Track(H[0]), pg = new Track(1 / 3), sv = new Track(0);
    const sh = $(st,'.sh'), pns = $(st,'.pns'), bar = $(st,'.pg'), lab = $(st,'.stp');
    const back = $(st,'.back'), next = $(st,'.next');
    const in0 = $(st,'.in0'), in1 = $(st,'.in1');
    let i = 0, dir = 1;
    $(st,'.pf').onchange = e => { if (e.target.checked){ in0.value = 'Jordan Ellis'; in1.value = 'you@example.org'; } };
    const go = k => { dir = k > i ? 1 : -1; i = Math.max(0, Math.min(2, k));
      sw.to(i); h.set(H[i]); pg.set((i + 1) / 3); sv.set(i === 2 ? 1 : 0, S.base);
      back.style.visibility = i === 0 ? 'hidden' : 'visible';
      next.textContent = i === 1 ? 'Join' : 'Continue'; next.style.visibility = i === 2 ? 'hidden' : 'visible';
      lab.textContent = i === 2 ? 'Done' : `Step ${i + 1} of 2`; };
    back.onclick = () => go(i - 1); next.onclick = () => go(i + 1);
    [back, next].forEach(b => b.style.minHeight = '32px');
    go(0); sw.t = -9;
    return t => { layers.forEach((el, k) => sw.apply(el, k, t, 28 * dir));
      pns.style.height = px(h.at(t)); bar.style.width = (clamp(pg.at(t)) * 100).toFixed(1) + '%';
      sh.style.borderColor = mix(clamp(sv.at(t)), 'var(--success)', 'var(--line)'); };
  }});
