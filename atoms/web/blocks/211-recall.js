atom({ id:'recall', cat:'Writing', name:'Recall flip', block:'flashcards, spaced repetition', fam:['M','S'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="align-items:center;gap:12px;padding:12px;margin:0 auto;max-width:360px"><button type="button" class="card rc" aria-label="Show answer" style="margin:0 auto;width:min(300px,88%);min-height:120px;display:grid;place-items:center;padding:20px;cursor:pointer;position:relative;border:0;font:inherit;color:inherit"><b class="qa" style="position:relative;min-height:24px;text-align:center"></b></button><div class="row" style="gap:8px;align-items:center"><button class="btn g0">Again</button><button class="btn g1">Hard</button><button class="btn g2">Easy</button><span class="small muted">in</span><b class="iv"></b></div></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Trail grade edge</span></label><div class="hint">Tap the card, then grade it</div>`,
  desc:'The card turns over with a small dip at the halfway point. The answer only swaps in once the question has left. Each grade button trails its edge behind it. The next interval rolls its digits forward.',
  api:'flip.set(1, soft); dip=sin(pi p)   qa.to(1) after exit   edge.go(grade) trails .06   iv.set(days)',
  init(st){
    const card = $(st,'button.rc'), qa = $(st,'.qa');
    const L = ['What opens the spring essay?','The market bell at dawn'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.textAlign = 'center'; e.textContent = s; qa.appendChild(e); return e; });
    const flip = new Track(0), sw = new Swap(0), dg = new Digits($(st,'.iv'), 2), e = edges(0, 120);
    const days = ['1d','3d','7d']; let shown = false; dg.set('1d', true); e.jump(0, 120);
    card.onclick = () => { if (shown) return; shown = true; flip.set(1, S.soft); sw.to(1, now()); };
    const grade = (i, inst) => { if (inst){ e.jump(0, [1,3,7][i]*40); } else { e.go(0, [1,3,7][i]*40); dg.set(days[i]); }
      shown = false; flip.set(0, S.soft); sw.to(0); };
    [$$(st,'button.g0')[0], $$(st,'button.g1')[0], $$(st,'button.g2')[0]].forEach((b,i) => b.onclick = () => grade(i));
    grade(0, true);
    return t => { const p = clamp(flip.at(t)), dip = Math.sin(Math.PI*p);
      card.style.transform = `perspective(700px) rotateY(${(p*180).toFixed(1)}deg) translateY(${(-dip*10).toFixed(2)}px) scale(${(.97+.03*dip).toFixed(4)})`;
      L.forEach((el,k) => sw.apply(el,k,t)); dg.render(t);
      card.style.borderColor = mix(clamp(e.A.at(t)/120),'var(--accent)','var(--line)'); };
  }});
