atom({ id:'pricetoggle', cat:'Landing', name:'Pricing toggle morph', block:'Landing pricing', fam:['E','S','M'],
  html:`<div class="col" style="gap:0;align-items:center;max-width:380px;margin:0 auto;padding:44px 16px"><p style="margin:0;font-size:15px;font-weight:600;line-height:1.45">Simple pricing</p><div class="seg" role="group" aria-label="Billing period" style="position:relative;margin-top:12px"><div class="ind"></div><button type="button" aria-pressed="true">Monthly</button><button type="button" aria-pressed="false">Yearly</button></div><div class="tier card" style="margin-top:16px;width:100%;padding:20px;text-align:center"><div class="tn" style="font-size:13px;font-weight:600">Studio</div><div class="row" style="gap:2px;justify-content:center;align-items:baseline;margin-top:6px"><span class="pr num" style="font-size:30px;font-weight:600;letter-spacing:-.035em;display:flex"></span><span class="per small muted" style="font-size:13px"></span></div><div class="sv" style="display:inline-block;margin-top:8px;padding:3px 10px;border-radius:999px;background:var(--success-tint, color-mix(in oklab, var(--success) 14%, transparent));color:var(--success);font-size:12.5px;font-weight:600">Save 20%</div><div><button class="btn ink" style="margin-top:12px;min-height:36px;border-radius:10px">Choose Studio</button></div></div><div class="seg sm" role="group" aria-label="Plan tier" style="margin-top:12px"><div class="ind"></div><button type="button" class="small muted" style="font-size:12.5px">Starter</button><button type="button" class="small muted" style="font-size:12.5px">Studio</button><button type="button" class="small muted" style="font-size:12.5px">Scale</button></div></div><div class="hint">Thumb glides with a trailing edge · price rolls · tier lifts on yearly</div>`,
  desc:'The thumb glides with a 60ms trailing edge, the changed price rolls on its own digits, and the tier card lifts and tints on yearly while the savings pill pops in: the yearly terminal holds all three.',
  api:'thumb.go(l, r) trail @t+.06   price.set(v)   yearly: lift.set(1) + tint + pill.pop',
  init(st){
    const P = [{ n:'Starter', m:12, y:10 },{ n:'Studio', m:24, y:19 },{ n:'Scale', m:48, y:38 }];
    const seg = $(st,'.seg'), sm = $(st,'.sm'), tier = $(st,'.tier'), pr = $(st,'.pr'), per = $(st,'.per'), sv = $(st,'.sv'), tn = $(st,'.tn'), cta = $(st,'.cta, .btn.ink');
    const d = new Digits(pr, 2);
    const th = edges(0,0), lift = new Track(0, S.soft), pill = new Track(0, S.soft);
    let yearly = false, ti = 1;
    const price = () => String(yearly ? P[ti].y : P[ti].m);
    const place = (root, e, i, inst) => { const b = $$(root,'button')[i]; inst ? e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); };
    const sync = inst => {
      d.set(price(), inst);
      per.textContent = yearly ? '/mo, billed yearly' : '/mo, billed monthly';
      tn.textContent = P[ti].n; cta.textContent = 'Choose ' + P[ti].n;
      lift.set(yearly ? 1 : 0); pill.set(yearly ? 1 : 0);
      $$(seg,'button').forEach((b,i) => b.setAttribute('aria-pressed', (i === 1) === yearly));
    };
    $$(seg,'button').forEach((b,i) => b.onclick = () => { yearly = i === 1; place(seg, th, i); sync(); });
    const th2 = edges(0,0);
    $$(sm,'button').forEach((b,i) => b.onclick = () => { ti = i; place(sm, th2, i); sync(); });
    const init = () => { place(seg, th, 0, true); place(sm, th2, 1, true); sync(true); };
    document.fonts.ready.then(init); init();
    addEventListener('resize', init);
    return t => {
      const a = th.A.at(t), b = th.B.at(t), ind = $(seg,'.ind');
      ind.style.transform = `translateX(${px(a)})`; ind.style.width = px(b - a);
      const c = th2.A.at(t), e2 = th2.B.at(t), ind2 = $(sm,'.ind');
      ind2.style.transform = `translateX(${px(c)})`; ind2.style.width = px(e2 - c);
      d.render(t);
      const l = clamp(lift.at(t));
      tier.style.transform = `translateY(${px(-4*l)})`;
      tier.style.background = mix(l,'var(--raised)','var(--card)');
      pop(sv, pill.at(t), -3);
    };
  }});
