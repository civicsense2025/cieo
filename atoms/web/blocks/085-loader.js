

atom({ id:'loader', cat:'Foundations', name:'Shape-morph loader', block:'lottie, buttons (loading), Material loading indicator', fam:['T','M'],
  html:`<div class="row" style="gap:36px"><svg class="lo" width="56" height="56" viewBox="-1.3 -1.3 2.6 2.6" aria-label="Loading" role="img"><path fill="var(--ink)"/></svg><div class="sp2" style="width:56px;height:56px;border-radius:50%;background:var(--raised);display:grid;place-items:center"><svg width="36" height="36" viewBox="-1.3 -1.3 2.6 2.6" aria-hidden="true"><path fill="var(--ink)"/></svg></div></div>`,
  desc:'Like a drop of water: five ripples of 2 to 6 lobes are always present, and each swells and drifts at its own slow rate. Nothing ever switches or holds, so the outline flows continuously while it turns, and every frame still comes from the clock.',
  api:'r(θ,t) = 0.9 + Σ aₖ(t)·cos(kθ + φₖ(t)), drawn as a smooth closed spline',
  init(st){
    const paths = $$(st,'path');
    // fluid: every lobe count is always present, each with its own slowly breathing amplitude and drifting phase
    const H = [[2,.045,.83,.4,.31],[3,.06,.61,1.7,-.47],[4,.05,.97,2.9,.38],[5,.035,.53,.8,-.29],[6,.025,1.19,4.1,.52]];
    const shape = t => { const rot = t*.9, N = 96, pts = [];
      for (let n = 0; n < N; n++){ const th = n/N*Math.PI*2; let r = .9;
        for (const [k,amp,f,c,drift] of H) r += amp*(.55 + .45*Math.sin(t*f*2.2 + c))*Math.cos(k*th + t*drift*2.2 + c);
        pts.push([r*Math.cos(th + rot), r*Math.sin(th + rot)]); }
      // closed quadratic spline through midpoints keeps the outline smooth at every frame
      const m = i => { const a = pts[i % N], b = pts[(i + 1) % N]; return [(a[0] + b[0])/2, (a[1] + b[1])/2]; };
      let d = `M${m(0)[0].toFixed(4)} ${m(0)[1].toFixed(4)}`;
      for (let i = 1; i <= N; i++){ const c = pts[i % N], e = m(i); d += `Q${c[0].toFixed(4)} ${c[1].toFixed(4)} ${e[0].toFixed(4)} ${e[1].toFixed(4)}`; }
      return d + 'Z'; };
    return t => { const d = REDUCE ? shape(0) : shape(t); paths.forEach(p => p.setAttribute('d', d)); };
  }});