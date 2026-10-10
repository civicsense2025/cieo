
atom({ id:'ptrarm', cat:'Views', name:'Pull-to-refresh arm', block:'pull to refresh, refresh', fam:['M'],
  html:`<div class="tile" style="position:relative;width:min(340px,94%);height:280px;border-radius:12px;background:var(--card);overflow:hidden;touch-action:pan-y"><div class="hd" style="display:grid;place-items:center;overflow:hidden"><span class="arw" style="display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--fill);padding:0"><svg width="14" height="14" viewBox="0 0 14 14" style="margin-top:1px"><path d="M7 12V2M3 6l4-4 4 4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="st small muted" style="font-size:12px;position:relative;height:18px;display:block"><span class="layer">Pull to refresh</span></span></div><div class="rows" style="padding:4px 16px 14px"><div class="r" style="overflow:hidden"><div style="font-size:13px;line-height:1.5;padding:8px 0">Water board votes 4–3 on rates</div></div><div class="r" style="overflow:hidden;border-top:1px solid var(--line)"><div style="font-size:13px;line-height:1.5;padding:8px 0">Bus route 12 quietly disappears</div></div><div class="r" style="overflow:hidden;border-top:1px solid var(--line)"><div style="font-size:13px;line-height:1.5;padding:8px 0">Library hours survive the cut</div></div></div><div class="spin" style="position:absolute;top:14px;left:50%;width:22px;height:22px;margin-left:-11px;border-radius:50%;border:2px solid var(--line);border-top-color:var(--accent);opacity:0"></div></div><label class="row small muted" style="gap:6px"><input type="checkbox" class="sf"> stiff pull</label><div class="hint">Pull the list down, release past 64px</div>`,
  desc:'The header stretches with rising resistance the further you pull. Past the threshold the arrow turns into a release cue. Let go and the spinner holds while fresh rows height-spring in one by one, landing on an updated terminal.',
  api:'pull 1:1 then rb rising   armed past 64   release: spin holds 900ms, rows open soft staggered',
  init(st){
    const tile = $(st,'.tile'), hd = $(st,'.hd'), arw = $(st,'.arw'), spin = $(st,'.spin');
    const rows = $$(st,'.r'); const sw = new Swap(0), pull = new Track(0), open = rows.map(() => new Track(1));
    const sf = $(st,'.sf'); let sy = 0, loading = false, spinT0 = 0;
    const K = () => sf.checked ? 60 : 110, TH = 64;
    const lbl = $(st,'.st').firstElementChild;
    drag(tile, { down:(p, e) => { if (tile.scrollTop > 0 || loading) return; sy = p.cy; },
      move:(p) => { if (loading) return; const dy = p.cy - sy; if (dy <= 0 || tile.scrollTop > 0) return;
        pull.jump(dy < TH ? dy : TH + rb(dy - TH, K())); sw.to(pull.target > TH ? 1 : 0); },
      up:() => { if (loading) return; const v = pull.target;
        if (v > TH){ loading = true; spinT0 = now(); pull.set(54, S.base);
          setTimeout(() => { open.forEach((o, i) => { o.jump(0); o.set(1, S.soft, now() + i * .07); });
            pull.set(0, S.base); sw.to(2); loading = false; }, REDUCE ? 60 : 900); }
        else pull.set(0, S.base); } });
    lbl.textContent = 'Pull to refresh';
    const L2 = document.createElement('span'); L2.className = 'layer'; L2.textContent = 'Release to refresh'; $(st,'.st').appendChild(L2);
    const L3 = document.createElement('span'); L3.className = 'layer'; L3.textContent = 'Updated just now ✓'; $(st,'.st').appendChild(L3);
    return t => { const p = pull.at(t);
      hd.style.height = px(8 + p); arw.style.transform = `rotate(${(clamp(p / 90) * 180).toFixed(1)}deg)`;
      arw.style.opacity = loading ? 0 : 1; arw.style.color = p > TH ? 'var(--accent)' : 'var(--muted)';
      spin.style.opacity = loading ? 1 : 0;
      if (loading) spin.style.transform = `rotate(${((t - spinT0) * 540 % 360).toFixed(1)}deg)`;
      rows.forEach((r, i) => r.style.height = px(open[i].at(t) * 37));
      [lbl, L2, L3].forEach((el, k) => sw.apply(el, k, t)); };
  }});
