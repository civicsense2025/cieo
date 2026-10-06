atom({ id:'deckstack', cat:'Writing', name:'Deck stacker', block:'headline stack', fam:['M','D'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="gap:8px;margin:0 auto;width:min(360px,92%);padding:12px"><div class="deck col" style="gap:8px"></div><div class="row small muted" style="gap:8px;align-items:center"><span>SERP</span><div class="bar" style="flex:1;height:6px;border-radius:3px;background:var(--raised);overflow:hidden"><i style="display:block;height:100%;width:0"></i></div><span class="len"></span></div><button class="btn sh">Shuffle</button></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Cap at 120 chars</span></label><div class="hint">Long stacks ink the bar toward red</div>`,
  desc:'Kicker, deck and headline trade places on soft springs with a short trailing edge. The search-result bar fills and inks from green to amber to red as it nears the cut.',
  api:'y.retarget(S.soft)   trail @t+.06   bar: len→color',
  init(st){
    const deck = $(st,'.deck'), fill = $(st,'.bar i'), len = $(st,'.len');
    const C = [['Kicker', 'City hall'], ['Headline', 'Water bills rise 40 cents in July'], ['Deck', 'The fee hid in a footnote; low streets flood first when the pumps stop.']];
    const H = 46, cards = C.map(([k,v]) => { const d = document.createElement('div'); d.className = 'card small';
      d.style.cssText += 'padding:14px 16px;position:relative'; d.innerHTML = `<span class="small muted">${k}</span><div style="font-weight:600">${v}</div><i class="tr" style="position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--line)"></i>`;
      deck.appendChild(d); return { d, k, v, tre:$(d,'.tr'), y:new Track(0, S.soft), tr:new Track(0, S.soft) }; });
    let order = [0, 1, 2];
    const layout = first => { const t0 = now();
      order.forEach((ci, slot) => { const c = cards[ci];
        if (first){ c.y.jump(slot * (H + 6)); c.tr.jump(slot * (H + 6)); }
        else { c.y.set(slot * (H + 6), S.soft, t0); c.tr.set(slot * (H + 6), S.soft, t0 + .06); } }); };
    layout(true);
    const total = () => cards.reduce((a,c) => a + c.v.length, 0);
    const LIM = 120;
    $(st,'.sh').onclick = () => { order = [...order].sort(() => Math.random() - .5); layout(false); };
    return t => { cards.forEach(c => { const y = c.y.at(t), tr = c.tr.at(t), home = cards.indexOf(c) * (H + 6);
        c.d.style.transform = `translateY(${px(y - home)})`;
        c.d.style.zIndex = 10 - Math.round(y);
        c.tre.style.transform = `scaleX(${clamp(1 - Math.abs(tr - y) / 60).toFixed(3)})`; });
      const p = clamp(total() / LIM);
      fill.style.width = (p * 100).toFixed(1) + '%';
      fill.style.background = p < .6 ? 'var(--success)' : p < .85 ? 'var(--warning)' : 'var(--danger)';
      len.textContent = `${total()}/${LIM}`; };
  }});
