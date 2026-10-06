/* Presentation animation uses the existing catalogue Track, S and shared clock. */
(() => {
  const L = window.CieoLibrary;
  L.createPlayback = (atoms,state,errors) => {
    let raf = null, stopped = false, current = null;
    const animations = new Set();
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const finishAnimations = () => { animations.forEach(job => job.finish()); animations.clear(); };
    const paint = time => {
      raf = null;
      if (stopped || document.hidden) return;
      const dt = Math.min(.05,Math.max(0,(time-clock.last)/1000));
      clock.last = time;
      if (!state.paused) clock.t += dt*state.speed;
      for (const a of atoms) {
        if (!a.inited || !a.render || a.el.hidden || (!a.visible && a !== current)) continue;
        try { a.render(clock.t); } catch (error) {
          errors.push({id:a.id,phase:'render',message:String(error)});
          a.render = null;
          L.markError(a,error);
        }
      }
      for (const job of [...animations]) {
        job.paint(job.track.at(time/1000));
        if (!job.track.prune(time/1000)) { job.finish(); animations.delete(job); }
      }
      if (animations.size || (!state.paused && atoms.some(a => a.render && !a.el.hidden && (a.visible || a === current)))) request();
    };
    const request = () => { if (!stopped && !document.hidden && raf === null) raf = requestAnimationFrame(paint); };
    const animate = element => {
      for (const job of animations) if (job.element === element) { job.finish(); animations.delete(job); }
      if (media.matches) return;
      const track = new Track(0,S.base);
      track.set(1,S.base,performance.now()/1000);
      const finish = () => { element.style.removeProperty('transform'); element.style.removeProperty('opacity'); };
      animations.add({element,track,finish,paint:p => { element.style.opacity=String(clamp(p)); element.style.transform=`translateY(${px((1-p)*12)})`; }});
      request();
    };
    const visibility = () => {
      if (document.hidden && raf !== null) { cancelAnimationFrame(raf); raf = null; }
      else { clock.last = performance.now(); request(); }
    };
    const reduce = () => { if (media.matches) { state.paused = true; finishAnimations(); L.playbackChanged?.(); request(); } };
    document.addEventListener('visibilitychange',visibility);
    media.addEventListener('change',reduce);
    return {
      request,animate,media,
      focus:a => { current=a; request(); },
      pause:value => { state.paused=value; clock.last=performance.now(); request(); },
      destroy:() => { stopped=true; if (raf!==null) cancelAnimationFrame(raf); finishAnimations(); document.removeEventListener('visibilitychange',visibility); media.removeEventListener('change',reduce); },
    };
  };
})();
