atom({ id:'testimonialdeck', cat:'Landing', name:'Testimonial deck', block:'Landing quotes', fam:['D','S','M'],
  html:`<div class="col" style="gap:0;align-items:center;max-width:380px;margin:0 auto;padding:44px 16px"><p style="margin:0 0 16px;font-size:15px;font-weight:600;line-height:1.45">What readers say</p><div class="deck" style="position:relative;width:100%;height:172px;touch-action:none;cursor:grab"></div><div class="cap" style="position:relative;margin-top:12px;height:20px;display:grid;justify-items:center;font-size:12.5px;color:var(--muted);line-height:1.5"></div><div class="row small muted" style="gap:10px;margin-top:10px;align-items:center"><span class="dots" style="display:flex;gap:6px"></span><button class="btn nx" style="min-height:36px;border-radius:10px">Next</button></div></div><div class="hint">Drag the top card · fling to dismiss, release to spring home</div>`,
  desc:'The stack fans beneath the top card as it is dragged. A fast fling or far drag dismisses it and the next quote swaps in; a short drag springs home. The last card settles into a done state with a restart.',
  api:'drag → x.jump   fling: x.release(dx, vx, ±420) → swap.to(next)   else x.set(0)',
  init(st){
    const Q = [
      ['Maya','I read every issue on the train. The one subscription I never question.'],
      ['Theo','A newsroom that links its sources. The corrections policy alone is worth reading.'],
      ['Priya','Finally a site that loads fast and respects my time.']];
    const deck = $(st,'.deck'), cap = $(st,'.cap'), dots = $(st,'.dots'), nx = $(st,'.nx');
    const cards = Q.map(([who,txt],i) => { const d = document.createElement('div');
      d.style.cssText = 'position:absolute;left:0;right:0;top:0;background:var(--card);border:1px solid var(--line-soft);border-radius:10px;padding:14px 16px;box-shadow:var(--shadow)';
      d.innerHTML = `<div style="font-size:14px;line-height:1.5"></div><div class="small muted" style="margin-top:8px;font-size:12.5px">— ${who}</div>`;
      d.firstChild.textContent = '“' + txt + '”'; deck.appendChild(d); return d; });
    const done = document.createElement('div');
    done.style.cssText = 'position:absolute;left:0;right:0;top:0;border-radius:10px;padding:34px 16px;text-align:center;background:var(--raised);font-size:14px;line-height:1.5';
    done.textContent = 'That is everyone. Thanks for reading.'; deck.appendChild(done);
    const L = Q.map((_,i) => { const e = document.createElement('span'); e.style.cssText = 'grid-area:1/1;white-space:nowrap'; e.textContent = `${i+1} of ${Q.length} · ${Q[i][0]}`; cap.appendChild(e); return e; });
    const Ldone = document.createElement('span'); Ldone.style.cssText = 'grid-area:1/1;white-space:nowrap'; Ldone.textContent = 'end of quotes'; cap.appendChild(Ldone);
    const dt = Q.map(() => { const s = document.createElement('i'); s.style.cssText = 'display:block;width:7px;height:7px;border-radius:50%;background:var(--line)'; dots.appendChild(s); return s; });
    const x = new Track(0, S.soft), sw = new Swap(0);
    let cur = 0, flying = false, finished = false, sx = 0;
    const flingTo = dir => { if (finished || flying) return; flying = true; x.release(x.at(now()), dir*900, dir*440, S.soft); };
    nx.onclick = () => { if (finished){ cur = 0; finished = false; sw.to(0); x.jump(0); nx.textContent = 'Next'; } else flingTo(1); };
    drag(deck, {
      down(p){ if (finished || flying) return; sx = p.x - x.at(now()); },
      move(p){ if (finished || flying) return; x.jump(p.x - sx); },
      up(p, v){ if (finished || flying) return; const dx = x.at(now());
        if (Math.abs(v.vx) > 600 || Math.abs(dx) > 90) flingTo(Math.sign(v.vx || dx) || 1);
        else x.set(0); }
    });
    return t => {
      const dx = x.at(t);
      if (flying && Math.abs(dx) > 430){
        flying = false; x.jump(0); cur++;
        if (cur >= Q.length){ finished = true; sw.to(Q.length); nx.textContent = 'Restart'; }
        else sw.to(cur);
      }
      cards.forEach((c,i) => {
        const pos = (i - cur + Q.length*2) % Q.length;
        const gone = finished || pos !== 0;
        const top = !finished && pos === 0;
        const sc = 1 - Math.min(2,pos)*.06;
        c.style.visibility = (!finished && pos > 2) ? 'hidden' : 'visible';
        c.style.transform = top ? `translateX(${px(dx)}) translateY(${px(-Math.abs(dx)*.04)}) rotate(${(dx/28).toFixed(2)}deg)` : `translateY(${px(Math.min(2,pos)*10)}) scale(${sc.toFixed(3)})`;
        c.style.opacity = top ? clamp(1 - Math.abs(dx)/380).toFixed(3) : (finished ? 0 : (1 - Math.min(2,pos)*.25).toFixed(3));
        c.style.zIndex = 10 - pos;
      });
      fade(done, finished ? 1 : 0, finished ? 0 : 6);
      done.style.visibility = finished ? 'visible' : 'hidden';
      [...L, Ldone].forEach((e,i) => sw.apply(e,i,t));
      dt.forEach((s,i) => s.style.background = i === Math.min(cur, Q.length-1) && !finished ? 'var(--ink)' : 'var(--line)');
    };
  }});
