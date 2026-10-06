

document.head.insertAdjacentHTML('beforeend', `<style id="player-opts">.pl-opts .btn{padding:3px 10px;font-size:12.5px}.pl-opts .btn[aria-pressed="true"]{background:var(--ink);color:var(--card);border-color:var(--ink)}</style>`);
atom({ id:'player', cat:'Media', name:'Player', block:'video, embed', fam:['M','D'],
  html:`<div class="card col" style="width:min(340px,88%);padding:16px;gap:14px"><div class="row" style="gap:12px"><div style="width:44px;height:44px;border-radius:10px;background:var(--ink)"></div><div style="flex:1;min-width:0"><b style="display:block;font-size:14px">Side A, Track 03</b><span class="small muted">Demo recording</span></div><button class="pp" aria-label="Play" style="width:40px;height:40px;border-radius:50%;border:0;background:var(--ink);color:var(--card);display:grid;place-items:center;cursor:pointer"><svg width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor"/></svg></button></div><div class="sc" style="position:relative;height:20px;cursor:pointer;touch-action:none" role="slider" tabindex="0" aria-label="Seek"><div class="bar" style="position:absolute;left:0;right:0;top:50%;border-radius:4px;background:var(--raised);overflow:hidden"><div class="fl" style="height:100%;background:var(--ink)"></div></div><div class="th" style="position:absolute;top:50%;left:0;border-radius:50%;background:var(--ink)"></div></div><div class="row small muted num" style="justify-content:space-between;margin-top:-8px"><span class="tc">0:00</span><span>3:24</span></div><div class="row small muted pl-opts" style="justify-content:space-between;border-top:1px solid var(--line-soft);padding-top:10px"><span>At end</span><span class="row" style="gap:6px" role="group" aria-label="What happens at the end"><button type="button" class="btn" data-m="stop" aria-pressed="true">Replay</button><button type="button" class="btn" data-m="loop" aria-pressed="false">Loop</button></span></div></div>`,
  desc:'Play and pause share eight points on one spring. Progress is computed from the play start time and clamps at the end, so the track lands in a paused replay state instead of wrapping; scrubbing just rewrites that start.',
  api:'progress(t) = playing ? min(1, p0 + (t − t0)/dur) : p0; at 1 → pause, Replay',
  init(st){
    const btn = $(st,'.pp'), path = $(btn,'path'), sc = $(st,'.sc'), bar = $(st,'.bar'), fl = $(st,'.fl'), th = $(st,'.th'), tc = $(st,'.tc'), DUR = 204;
    const PLAY = [[7,5],[12.5,8.4],[12.5,15.6],[7,19],[12.5,8.4],[19,12],[19,12],[12.5,15.6]], PAUSE = [[6,5],[10,5],[10,19],[6,19],[14,5],[18,5],[18,19],[14,19]];
    const ic = new Track(0), gr = new Track(0, S.snap); let playing = false, p0 = .32, t0 = 0, held = false, hp = 0, ended = false, loop = false;
    const pr = t => playing ? (loop ? (p0 + (t - t0)/DUR) % 1 : Math.min(1, p0 + (t - t0)/DUR)) : p0;
    const paintBtn = () => { btn.setAttribute('aria-label', ended && !loop ? 'Replay' : playing ? 'Pause' : 'Play'); btn.style.background = ended && !loop ? 'var(--success)' : 'var(--ink)'; };
    const stopAtEnd = () => { playing = false; p0 = 1; ended = true; ic.set(0); paintBtn(); };
    btn.onclick = () => { if (ended && !loop){ p0 = 0; ended = false; } else p0 = pr(now()); t0 = now(); playing = !playing; if (playing) ended = false; ic.set(playing ? 1 : 0); paintBtn(); };
    drag(sc, { down:p => { held = true; gr.set(1); hp = clamp(p.x/p.w); }, move:p => hp = clamp(p.x/p.w), up:() => { held = false; p0 = hp; t0 = now(); ended = hp >= 1 && !loop; paintBtn(); gr.set(0); } });
    sc.onpointerenter = () => { if (!held) gr.set(.5); }; sc.onpointerleave = () => { if (!held) gr.set(0); };
    sc.onkeydown = e => { const d = e.key === 'ArrowRight' ? .05 : e.key === 'ArrowLeft' ? -.05 : 0; if (d){ p0 = clamp(pr(now()) + d); t0 = now(); ended = false; if (!playing) paintBtn(); } };
    $$(st,'.pl-opts .btn').forEach(b => b.onclick = () => { loop = b.dataset.m === 'loop'; $$(st,'.pl-opts .btn').forEach(x => x.setAttribute('aria-pressed', x === b)); if (loop) ended = false; paintBtn(); });
    const q = a => `M${a.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L')}Z`;
    return t => { if (playing && !loop && p0 + (t - t0)/DUR >= 1) stopAtEnd();
      const k = clamp(ic.at(t)), pts = PLAY.map((p,i) => [lerp(p[0], PAUSE[i][0], k), lerp(p[1], PAUSE[i][1], k)]);
      path.setAttribute('d', q(pts.slice(0,4)) + q(pts.slice(4)));
      const p = held ? hp : pr(t), g = gr.at(t), W = sc.clientWidth, bh = 4 + 4*g, ts = 8 + 8*g;
      bar.style.height = px(bh); bar.style.transform = 'translateY(-50%)'; fl.style.width = (p*100).toFixed(3) + '%';
      th.style.width = th.style.height = px(ts); th.style.transform = `translate(${px(p*W - ts/2)}, -50%)`;
      const s = p*DUR; tc.textContent = `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; };
  }});