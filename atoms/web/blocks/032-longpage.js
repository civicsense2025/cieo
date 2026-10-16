

atom({ id:'longpage', cat:'Chrome', name:'Header, progress, jump to top', block:'site-header, reading-progress, jump-to-top', fam:['M','D','X'], tall:true,
  html:`<div class="col" style="gap:8px;align-items:center"><div class="row small muted" style="gap:8px"><span>Center icon</span><button class="btn ct" aria-pressed="true">On</button></div><div class="lp card" style="position:relative;width:min(380px,92%);height:290px;overflow:auto;overscroll-behavior:contain" tabindex="0" aria-label="Scrollable sample page"><header class="hd" style="position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:var(--card);border-bottom:1px solid var(--line-soft)"><b class="lg" style="transform-origin:0 50%;letter-spacing:-.02em">Field Notes</b><span class="small muted">Subscribe</span><i class="rp" style="position:absolute;left:0;bottom:-1px;height:2px;background:var(--ink)"></i></header><article class="small" style="padding:14px 16px 60px;line-height:1.65"></article><button class="jt" aria-label="Back to top" style="position:sticky;bottom:12px;left:100%;margin-right:12px;display:grid;place-items:center;line-height:0;width:36px;height:36px;border-radius:50%;border:0;background:var(--ink);color:var(--card);cursor:pointer;margin-top:-48px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button></div><div class="hint">Scroll inside the page</div></div>`,
  desc:'The progress bar tracks scroll 1:1. The header compacts once you leave the top. The back-to-top button enters after half a screen and scrolls home on a spring that any wheel input cancels.',
  api:'bar = scrollTop / max   hdr.set(scrolled ? 1 : 0)   scroll.set(0, S.soft)',
  init(st){
    const lp = $(st,'.lp'), hd = $(st,'.hd'), lg = $(st,'.lg'), rp = $(st,'.rp'), jt = $(st,'.jt'), ct = $(st,'.ct');
    let centered = true;
    ct.onclick = () => { centered = !centered; ct.setAttribute('aria-pressed', String(centered)); ct.textContent = centered ? 'On' : 'Off';
      jt.style.display = centered ? 'grid' : 'block'; jt.style.placeItems = centered ? 'center' : ''; jt.style.lineHeight = centered ? '0' : ''; };
    $(st,'article').innerHTML = ['The river path was quiet before sunrise, and the only sound was gravel under our boots.','We counted eleven herons between the second bridge and the old mill. Most stood still enough to pass for posts.','By seven the fog lifted off the water in one sheet, and the far bank came back into view like a print developing.','Notes for next time: bring the long lens, leave before five, and take the east fork where the path forks at the mill.','The walk back took half as long. It always does once you know where the path goes.','We stopped at the bakery by the station and ate standing up at the window counter.'].map(p => `<p style="margin:0 0 12px">${p}</p>`).join('');
    const c = new Track(0), jo = new Track(0), sc = new Track(0, S.soft); let auto = false;
    // Back-to-top enters after half a screen; the sample page is only about 1.6 screens tall, so 180px was out of reach.
    const art = $(st,'article'); let top = 0, max = 0;
    const mx = new ResizeObserver(() => { max = lp.scrollHeight - lp.clientHeight; }); mx.observe(lp); mx.observe(art);
    lp.onscroll = () => { const y = top = lp.scrollTop, on = y > lp.clientHeight * .5; c.set(y > 16 ? 1 : 0); jo.set(on ? 1 : 0, on ? S.base : S.snap); };
    const stop = () => auto = false; lp.addEventListener('wheel', stop, { passive:true }); lp.addEventListener('touchstart', stop, { passive:true });
    jt.onclick = () => { sc.jump(lp.scrollTop).set(0); auto = true; };
    return t => { if (auto){ lp.scrollTop = sc.at(t); top = clamp(sc.at(t), 0, max); if (!sc.prune(t)) auto = false; }
      const k = clamp(c.at(t)); hd.style.height = px(lerp(56, 42, k)); lg.style.transform = `scale(${lerp(1.15, 1, k).toFixed(4)})`;
      hd.style.boxShadow = k > .5 ? 'var(--shadow)' : 'none'; rp.style.width = (max > 0 ? top/max*100 : 0).toFixed(2) + '%';
      const o = clamp(jo.at(t)); jt.style.opacity = o.toFixed(3); jt.style.transform = `translateY(${px((1-o)*10)}) scale(${(.9+.1*o).toFixed(4)})`; jt.style.pointerEvents = o > .5 ? 'auto' : 'none'; jt.style.visibility = o < .02 ? 'hidden' : 'visible'; };
  }});