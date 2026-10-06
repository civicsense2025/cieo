atom({ id:'springplay', cat:'Foundations', name:'Spring playground', block:'spring presets, drag, release velocity', fam:['T','D'],
  html:`<div class="card col" style="width:min(360px,92%);padding:18px;gap:16px"><div class="sp" style="position:relative;height:64px;border-radius:12px;background:var(--raised);touch-action:none;cursor:grab"><div class="dot" style="position:absolute;left:12px;top:50%;width:24px;height:24px;margin-top:-12px;border-radius:50%;background:var(--ink)"></div></div><div class="lns col" style="gap:8px">${['snap · ω34','base · ω22','soft · ω15','lazy · ω9'].map(l=>`<div class="ln" style="position:relative;height:24px"><b style="position:absolute;left:0;top:5px;width:14px;height:14px;border-radius:50%;background:var(--ink)"></b><i class="small muted" style="position:absolute;right:0;top:2px;font-style:normal;font-size:12px">${l}</i></div>`).join('')}</div><div class="ro" style="font:13px var(--mono);font-variant-numeric:tabular-nums;color:var(--muted)">base · ω22 · ~300ms</div><div class="row small muted pk" style="gap:8px;align-items:center"><span style="font-size:12px">Preset</span><button class="btn" style="min-height:32px">snap</button><button class="btn" style="min-height:32px">base</button><button class="btn" style="min-height:32px">soft</button><button class="btn" style="min-height:32px">lazy</button></div></div><div class="hint">Drag the dot, release to settle · tap a lane to fling all four</div>`,
  desc:'Snap, base, soft and lazy side by side. Drag the dot and release: velocity carries into every spring, each settling at its own rate.',
  api:'play.release(from, v0, to, S.snap|base|soft|lazy)',
  init(st){
    const strip = $(st,'.sp'), dot = $(st,'.dot'), dots = $$(st,'.ln b'), ro = $(st,'.ro'), btns = $$(st,'.pk .btn');
    const CF = [['snap', S.snap, 200], ['base', S.base, 300], ['soft', S.soft, 440], ['lazy', S.lazy, 740]];
    let pi = 1, on = false;
    const play = new Track(.5, S.base), lanes = CF.map(c => new Track(.5, c[1]));
    const show = i => { pi = i; play.cfg = CF[i][1];
      btns.forEach((b, j) => b.setAttribute('aria-pressed', i === j));
      ro.textContent = CF[i][0] + ' · ω' + CF[i][1].w + ' · ~' + CF[i][2] + 'ms' + (REDUCE ? ' · instant' : ''); };
    btns.forEach((b, i) => b.onclick = () => show(i));
    show(1);
    const span = () => Math.max(1, strip.clientWidth - 48);
    const frac = x => clamp((x - 24) / span());
    drag(strip, {
      down: p => { on = true; const f = frac(p.x); play.jump(f); lanes.forEach(l => l.jump(f)); },
      move: p => { if (!on) return; const f = frac(p.x); play.jump(f); lanes.forEach(l => l.jump(f)); },
      up: (p, v) => { on = false; const f = frac(p.x), to = f > .5 ? 0 : 1, vn = clamp(v.vx / span(), -8, 8);
        if (REDUCE){ play.jump(to); lanes.forEach(l => l.jump(to)); return; }
        const t0 = now(); play.release(f, vn, to, CF[pi][1], t0); lanes.forEach(l => l.release(f, vn, to, undefined, t0)); }
    });
    $(st,'.lns').onclick = () => { const f = play.target, to = f > .5 ? 0 : 1, t0 = now();
      if (REDUCE){ play.jump(to); lanes.forEach(l => l.jump(to)); return; }
      play.release(play.at(t0), 0, to, CF[pi][1], t0); lanes.forEach(l => l.release(l.at(t0), 0, to, undefined, t0)); };
    return t => { const W = span();
      dot.style.transform = `translateX(${px(clamp(play.at(t)) * W)})`;
      dots.forEach((d, i) => { const w = Math.max(1, d.parentNode.clientWidth - 14);
        d.style.transform = `translateX(${px(clamp(lanes[i].at(t)) * w)})`; }); };
  }});
