
atom({ id:'deeplink', cat:'Views', name:'Deep-link landing', block:'deep link, navigation, landing', fam:['S','M'],
  html:`<div class="col" style="gap:8px;width:min(360px,94%)"><div class="card" style="padding:14px 16px"><button class="bk" style="border:0;background:none;cursor:pointer;font-size:13px;color:var(--accent);padding:2px 0;position:relative;height:26px;display:block"><span aria-hidden="true" style="visibility:hidden">‹ City budget</span></button><b class="hh" style="display:block;position:relative;height:24px"></b><div class="cr small muted num" style="font-size:12px"></div><div class="tt" style="position:relative;height:66px;margin-top:6px"></div><div class="ld small muted" style="font-size:12px;margin-top:4px"></div></div><div class="row" style="gap:8px"><button class="btn l0">Open: budget story</button><button class="btn l1">Open: meeting note</button></div></div><div class="hint">A shared link builds the whole stack, then lands</div>`,
  desc:'Tapping a link builds the full stack instantly with no travel, then the final pane enters heading-first and body 50ms later. The back chain lands on the correct parent every step, ending home.',
  api:'stack jumps instant   hh.to(2) then tt.to(2,+.05)   bk.to(parent) per depth   end: landed',
  init(st){
    const chain = [
      { bk:'‹ Home', h:'Home', c:'', b:'Your front page. Two shared links sit below.', ld:'' },
      { bk:'‹ Home', h:'City budget', c:'Home / Budget', b:'Start with the transfers page. It shows money moved after the vote.', ld:'' },
      { bk:'‹ City budget', h:'Reading it in ten minutes', c:'Home / Budget / Story', b:'Compare the adopted figure with last year’s actual spending. A gap over five percent deserves a question.', ld:'Landed · 2 deep ✓' }];
    const bkBox = $(st,'.bk'), hh = $(st,'.hh'), tt = $(st,'.tt');
    const mk = (box, cls, style) => chain.map((s, k) => { const e = document.createElement('span'); e.className = 'layer ' + cls; e.style.cssText = style; box.appendChild(e); return e; });
    const HB = mk(hh, '', 'font-size:15px;font-weight:600;line-height:1.5'), BB = mk(tt, '', 'font-size:13px;line-height:1.6');
    HB.forEach((e, k) => e.textContent = chain[k].h); BB.forEach((e, k) => e.textContent = chain[k].b);
    const BK = ['‹ Home', '‹ Home', '‹ City budget'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; bkBox.appendChild(e); return e; });
    const swB = new Swap(0), swH = new Swap(0), swT = new Swap(0);
    const cr = $(st,'.cr'), ld = $(st,'.ld'); let depth = 0;
    const land = d => { depth = d; const t = now();
      // stack builds instantly: crumbs + caption jump, no travel
      cr.textContent = chain[d].c; ld.textContent = chain[d].ld;
      // Home has no parent: the back link is dimmed and removed from the tab order.
      bkBox.disabled = d === 0; bkBox.style.opacity = d === 0 ? '.4' : '1';
      swB.to(d, t); swH.to(d, t); swT.to(d, t + .05); };
    $(st,'.l0').onclick = () => land(2); $(st,'.l1').onclick = () => land(1);
    bkBox.onclick = () => land(Math.max(0, depth - 1));
    land(0); swB.t = swH.t = swT.t = -9;
    return t => { BK.forEach((el, k) => swB.apply(el, k, t, 0)); HB.forEach((el, k) => swH.apply(el, k, t)); BB.forEach((el, k) => swT.apply(el, k, t)); };
  }});
