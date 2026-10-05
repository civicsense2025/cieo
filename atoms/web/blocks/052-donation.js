

atom({ id:'donation', cat:'Commerce', name:'Donation amount', block:'donation', fam:['E','M','S'], tall:true,
  html:`<div class="card col" style="width:min(320px,90%);padding:16px;gap:12px"><b>Support the newsroom</b><div class="seg da" style="display:flex"><div class="ind"></div><button>$10</button><button>$25</button><button>$50</button><button>$100</button><button>Other</button></div><div class="ow" style="overflow:hidden;height:0"><label class="row small" style="gap:6px;border:1.5px solid var(--line);border-radius:9px;padding:8px 10px;background:var(--card)"><span class="muted">$</span><input id="don-amt" inputmode="numeric" placeholder="Amount" aria-label="Custom amount" style="flex:1;min-width:0;border:0;background:none;color:var(--ink);font:14px var(--sans);outline:none"></label></div><button class="btn ink go" style="height:40px;display:flex;align-items:center;justify-content:center;gap:4px">Give $<span class="amt"></span></button></div>`,
  desc:'The amount indicator stretches between chips. “Other” opens a field below on a height spring, and the button’s amount rolls digit by digit.',
  api:'ind.go(l, r)   other.h.set(1)   digits.set(amount)',
  init(st){
    const seg = $(st,'.da'), ind = $(seg,'.ind'), btns = $$(seg,'button'), ow = $(st,'.ow'), inp = $(st,'input'), d = new Digits($(st,'.amt'), 4);
    const e = edges(0,0), oh = new Track(0); let cur = 1; d.set('25', true);
    const sel = (i, inst) => { cur = i; const b = btns[i]; inst ? e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth);
      if (i === 4){ oh.set(1); d.set(String(parseInt(inp.value) || 0)); setTimeout(() => inp.focus({ preventScroll:true }), 0); } else { oh.set(0); d.set(btns[i].textContent.slice(1)); } };
    btns.forEach((b,i) => b.onclick = () => sel(i)); inp.oninput = () => { inp.value = inp.value.replace(/\D/g,'').slice(0,4); d.set(String(parseInt(inp.value) || 0)); };
    const init = () => sel(cur, true); document.fonts.ready.then(init); requestAnimationFrame(init); d.set('25', true);
    return t => { const a = e.A.at(t), b = e.B.at(t); Object.assign(ind.style,{transform:`translate(${px(a)},3px)`,width:px(b-a),height:'calc(100% - 6px)'});
      const o = clamp(oh.at(t)); ow.style.height = px(o*40); fade($(ow,'label'), o, (1-o)*-4); d.render(t); };
  }});