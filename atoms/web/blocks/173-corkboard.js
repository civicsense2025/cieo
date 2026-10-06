atom({ id:'corkboard', cat:'Writing', name:'Corkboard cards', block:'writing, board', fam:['D','S','T'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="bd" style="position:relative;height:118px"></div><div class="syn small" style="position:relative;height:32px;margin-top:8px"></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Show synopsis</span></label><div class="hint">Drag a card, release to snap back</div>`,
  desc:'Scene cards follow the pointer one to one while held. On release every card springs home to its slot on the same calm spring with a 40ms stagger, and the synopsis line below swaps to the held card with a quick blur out and back in.',
  api:'down: card.follow(1:1), syn.to(i)   up: cards.release(slot, S.base, +40ms)',
  init(st){
    const C = [['Cold open','A door sings in an empty house.'],['Turn','Dust rises; something answers upstairs.'],['Button','Mara decides to stay the night.']];
    const R = REDUCE, bd = $(st,'.bd'), syn = $(st,'.syn'), W = 96;
    const sw = new Swap(0); const go = k => { sw.to(k); if (R) sw.t = -9; };
    const layers = C.map(([,s],i) => { const d = document.createElement('div'); d.textContent = s;
      d.style.cssText = 'position:absolute;inset:0'; syn.appendChild(d); return d; });
    const cards = C.map(([t],i) => {
      const c = document.createElement('div'); c.className = 'small'; c.textContent = t; c.style.touchAction = 'none';
      c.style.cssText += ';position:absolute;top:8px;width:88px;height:96px;border-radius:10px;background:var(--card);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:grab;touch-action:none';
      bd.appendChild(c);
      const cx = new Track(i*W), cy = new Track(0); let dx = 0, dy = 0;
      drag(c, { down: p => { const t = now(); dx = p.x - cx.at(t) - 4; dy = p.y - cy.at(t) - 8; c.style.zIndex = 5; go(i); },
        move: p => { cx.jump(p.x - dx - 4); cy.jump(p.y - dy - 8); },
        up: (p, v) => { c.style.zIndex = ''; const t = now();
          cards.forEach((k,j) => { const T = R ? t : t + j*.04;
            if (R){ k.cx.jump(j*W); k.cy.jump(0); } else { k.cx.release(k.cx.at(t), v.vx, j*W, S.base, T); k.cy.release(k.cy.at(t), v.vy, 0, S.base, T); } }); } });
      return { cx, cy };
    });
    return t => { cards.forEach((k,i) => { const el = bd.children[i];
        el.style.transform = `translate(${px(k.cx.at(t))},${px(k.cy.at(t))})`; });
      layers.forEach((l,i) => sw.apply(l, i, t)); };
  }});
