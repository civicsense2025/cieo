atom({ id:'tagpill', cat:'Writing', name:'Tag pill autocomplete', block:'tag input, editor', fam:['M','X','E'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col ed" style="margin:0 auto;width:min(340px,92%);gap:8px"><label class="tg card" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-height:46px;padding:14px;cursor:text;border:1.5px solid var(--muted);border-radius:12px"><input placeholder="Write something, try #de…" autocomplete="off" aria-label="Editor line" style="flex:1;min-width:120px;border:0;background:none;color:var(--ink);font:14px var(--sans);outline:none;padding:4px"></label></div><div class="mn card" role="listbox" style="position:absolute;left:0;top:0;width:200px;padding:6px;visibility:hidden;transform-origin:0 0"><i class="hl" style="position:absolute;left:6px;right:6px;top:0;border-radius:7px;background:var(--raised)"></i></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Filter on #</span></label><div class="hint">Type # to filter tags, Enter makes a pill</div>`,
  desc:'Typing # filters the list inline: matches spring into their slots while misses blur out. The plate trails the top match by 60ms, and Enter morphs the word into a pill that springs open before its text fades in.',
  api:'rows.filter(#q)   match: y.set(slot); miss: o.set(0)   plate.go(first)   pill: w.set(1); o.set(1, S.base, t+.06)',
  init(st){
    const tg = $(st,'.tg'), inp = $(st,'input'), mn = $(st,'.mn'), hl = $(st,'.hl'), R = 32, P = 6;
    const TAGS = ['design','deadline','draft','launch','research','press'];
    const rows = TAGS.map(n => { const d = document.createElement('div'); d.setAttribute('role','option');
      d.innerHTML = '<span style="color:var(--accent)">#</span><span>' + n + '</span>';
      d.style.cssText += 'position:absolute;left:6px;right:6px;top:0;height:32px;display:flex;align-items:center;gap:2px;padding:0 10px;font-size:14px;cursor:pointer;border-radius:7px';
      mn.appendChild(d); return { d, n, y:new Track(P), o:new Track(0) }; });
    const o = new Track(0), H = new Track(P*2), e = edges(P, P+R);
    let vis = [], hi = 0; const chips = [];
    const q = () => { const m = inp.value.match(/#(\w*)$/); return m ? m[1].toLowerCase() : null; };
    const place = () => { const r = relRect(st, inp.getBoundingClientRect());
      mn.style.left = px(Math.min(r.x, st.clientWidth - 208)); mn.style.top = px(r.y + r.h + 6); };
    const shut = () => { if (REDUCE) o.jump(0); else o.set(0, S.snap); };
    const upd = () => { const s = q();
      if (s === null){ if (o.target) shut(); return; }
      if (!o.target){ place(); REDUCE ? o.jump(1) : o.set(1); }
      vis = rows.filter(r => r.n.toLowerCase().startsWith(s));
      rows.forEach(r => { const k = vis.indexOf(r);
        if (k >= 0){ if (REDUCE){ r.y.jump(P+k*R); r.o.jump(1); } else { r.y.set(P+k*R); r.o.set(1); } }
        else if (REDUCE) r.o.jump(0); else r.o.set(0, S.snap); });
      if (REDUCE) H.jump(P*2 + Math.max(1, vis.length)*R); else H.set(P*2 + Math.max(1, vis.length)*R);
      hi = 0; if (vis[0]) REDUCE ? e.jump(P, P+R) : e.go(P, P+R); };
    const add = txt => { const c = document.createElement('span');
      c.style.cssText = 'display:inline-flex;overflow:hidden;white-space:nowrap;border-radius:999px;background:var(--accent-tint);color:var(--accent);height:32px;min-height:32px;font-size:13px;font-weight:600';
      c.innerHTML = '<span class="ci" style="display:inline-flex;align-items:center;padding:0 10px">#' + txt + '</span>';
      tg.insertBefore(c, inp);
      const ch = { c, ci:$(c,'.ci'), W:$(c,'.ci').offsetWidth, w:new Track(0), o:new Track(0) }, t0 = now();
      if (REDUCE){ ch.w.jump(1); ch.o.jump(1); } else { ch.w.set(1); ch.o.set(1, S.base, t0 + .06); }
      chips.push(ch); };
    const pick = r => { inp.value = inp.value.replace(/#\w*$/, ''); shut(); inp.focus(); add(r.n); };
    inp.oninput = upd; inp.onblur = () => setTimeout(shut, 0);
    inp.onkeydown = ev => { if (!o.target || !vis.length) return;
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp'){ ev.preventDefault();
        hi = (hi + (ev.key === 'ArrowDown' ? 1 : vis.length-1)) % vis.length;
        if (REDUCE) e.jump(P+hi*R, P+(hi+1)*R); else e.go(P+hi*R, P+(hi+1)*R); }
      if (ev.key === 'Enter'){ ev.preventDefault(); pick(vis[hi]); }
      if (ev.key === 'Escape') shut(); };
    rows.forEach(r => { r.d.onmousedown = ev => ev.preventDefault(); r.d.onclick = () => pick(r); });
    return t => { pop(mn, o.at(t), 0); mn.style.height = px(H.at(t)); plate(hl, e.A.at(t), e.B.at(t));
      rows.forEach(r => { const v = clamp(r.o.at(t)); r.d.style.opacity = v.toFixed(3);
        r.d.style.filter = v < .98 ? 'blur(' + ((1-v)*BLUR).toFixed(2) + 'px)' : 'none';
        r.d.style.transform = 'translateY(' + px(r.y.at(t) + (1-v)*6) + ')';
        r.d.style.pointerEvents = r.o.target ? 'auto' : 'none'; });
      chips.forEach(ch => { const wv = clamp(ch.w.at(t)); ch.c.style.width = px(ch.W*wv);
        fade(ch.ci, ch.o.at(t), null); }); };
  }});
