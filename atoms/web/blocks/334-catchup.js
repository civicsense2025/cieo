
atom({ id:'catchup', cat:'Dynamic', name:'Catch-up burst', block:'metric, sync', fam:['S','M'],
  html:`<div class="card col" style="width:min(420px,calc(100% - 24px));margin:0 auto;padding:15px 16px;gap:8px"><div class="row" style="justify-content:space-between;align-items:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Sync</b><span class="pl small" style="font-size:12px;font-weight:600;line-height:1.5">Live · caught up</span></div><div class="rows col" style="gap:0"></div><div class="cap small muted" style="font-size:12px;line-height:1.5">Connected · everything applied</div><div class="row" style="gap:8px;align-items:center"><button class="btn dp" style="min-height:32px">Simulate drop</button><button class="btn rc ink" style="min-height:32px">Reconnect</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;margin-left:auto;font-size:12px"><input type="checkbox" class="wv" checked> stagger wave</label></div></div><div class="hint">Reconnect applies the backlog in one fast wave</div>`,
  desc:'Reconnect ticks the backlog on in one fast stagger wave: digits roll together, rows flash once, and the pill settles back to live. Dropped state holds until you reconnect.',
  api:'tick[i] at t + i·.06   digits.set(all) together   end: Live, hold',
  init(st){
    const rows = $(st,'.rows'), cap = $(st,'.cap'), pl = $(st,'.pl'), wv = $(st,'.wv');
    const R = [['Orders', 1204],['Revenue', 48310],['Refunds', 37]].map(([k, v], i) => {
      const r = document.createElement('div');
      r.style.cssText = 'position:relative;display:flex;justify-content:space-between;align-items:center;min-height:38px;padding:7px 0' + (i ? ';border-top:1px solid var(--line)' : '');
      r.innerHTML = `<span style="font-size:13px;line-height:1.5">${k}</span><span class="vv num" style="font-size:14px;font-weight:600;line-height:1.5;font-variant-numeric:tabular-nums"></span>`;
      rows.appendChild(r); const d = new Digits($(r,'.vv'), String(v).length);
      d.set(String(v), true); return { d, v, pend:[], w:new Track(0), wash:null }; });
    let live = true, wave = [];
    $(st,'.dp').onclick = () => { live = false; wave = []; pl.textContent = 'Offline · 5 waiting'; cap.textContent = 'Dropped · holding until reconnect'; };
    $(st,'.rc').onclick = () => { if (live) return; const t = now(), n = 5;
      wave = Array.from({ length:n }, (_,i) => ({ at: wv.checked && !REDUCE ? t + i*.06 : t, i }));
      pl.textContent = 'Syncing…'; cap.textContent = 'Applying the backlog…'; };
    return t => { while (wave.length && t >= wave[0].at){ const { i } = wave.shift();
        R.forEach(x => { const step = 3 + ((i*7 + x.v) % 23); x.v += step; x.d.dir = 1; x.d.set(String(x.v), REDUCE);
          if (!REDUCE){ x.w.jump(.4); x.w.set(0, S.lazy, t + .15); } });
        if (!wave.length){ live = true; pl.textContent = 'Live · caught up'; cap.textContent = 'Connected · everything applied'; } }
      R.forEach(x => { x.d.render(t); }); };
  }});
