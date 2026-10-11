
atom({ id:'composefields', cat:'Email', name:'Compose fields', block:'email, compose, chips', fam:['M','S'],
  html:`<style>.cmp-tin:focus-visible{outline:2px solid var(--accent);outline-offset:2px}</style><div class="col" style="gap:8px;width:min(320px,94%)"><div class="card cmp" style="padding:14px 16px;line-height:1.5;border:1.5px solid var(--muted)"><b style="font-size:15px;font-weight:600">New message</b><div class="torow" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:8px;min-height:52px"><span class="chips" style="display:flex;gap:6px;flex-wrap:wrap"></span><input class="tin cmp-tin" placeholder="To…" style="flex:1;min-width:90px;min-height:32px;border:0;font-size:13.5px;background:none;color:var(--ink)"></div><div class="msg" style="position:relative;min-height:22px;margin-top:6px"></div><div class="row" style="gap:8px;margin-top:8px"><button class="btn ink snd" style="min-height:32px">Send</button><button class="btn cc" style="min-height:32px">Cc</button></div></div><label class="row small muted" style="gap:6px;font-size:12px;cursor:pointer"><input type="checkbox"> send copy to self</label></div><div class="hint">Type an email, hit Enter</div>`,
  desc:'Recipient chips open width-first and the text fades in after. Bad addresses flag danger with a message; good ones settle into a success check terminal.',
  api:'w.set(measure, base) then tx.to(1)   bad: danger + msg   end: ready check, hold',
  init(st){
    const chips = $(st,'.chips'), tin = $(st,'.tin'), msg = $(st,'.msg'), cmp = $(st,'.cmp'), snd = $(st,'.snd');
    const cc = $(st,'.cc'); cc.setAttribute('aria-pressed', 'false');
    // pressed state carries a text cue as well as the placeholder change
    cc.onclick = () => { tin.focus(); tin.placeholder = 'Cc…'; cc.textContent = '✓ Cc'; cc.setAttribute('aria-pressed', 'true'); };
    const ml = ['', 'Add a valid email — “maya” needs @studio.co', 'Ready to send'].map((s, k) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.style.fontSize = '12.5px'; e.textContent = s;
      if (k === 1) e.style.color = 'var(--danger)'; if (k === 2){ e.style.color = 'var(--success)'; e.style.fontWeight = '600'; } msg.appendChild(e); return e; });
    const msw = new Swap(0), bd = new Track(0);
    let n = 0, ok = 0;
    const add = raw => { const v = raw.trim().replace(/,$/, ''); if (!v) return; const t = now(), good = /.+@.+\..+/.test(v), i = n++;
      const c = document.createElement('span');
      c.style.cssText = 'display:inline-flex;align-items:center;gap:6px;height:32px;border-radius:16px;padding:0 9px 0 11px;font-size:13px;font-weight:500;border:0;background:var(--raised);overflow:hidden;white-space:nowrap';
      const dot = document.createElement('span');
      dot.style.cssText = 'width:22px;height:22px;flex:none;border-radius:50%;background:var(--card);display:grid;place-items:center;font-size:10px;font-weight:700;padding:0;transform:translateY(.5px)';
      dot.textContent = v[0].toUpperCase();
      const tx = document.createElement('span'); tx.className = 'layer'; tx.style.position = 'relative'; tx.style.inset = 'auto'; tx.textContent = v;
      const x = document.createElement('button'); x.textContent = '×'; x.setAttribute('aria-label', 'Remove ' + v);
      x.style.cssText = 'border:0;background:none;cursor:pointer;font-size:14px;min-width:24px;min-height:24px;color:var(--muted)';
      c.appendChild(dot); c.appendChild(tx); c.appendChild(x); chips.appendChild(c);
      const w = new Track(0), txo = new Track(0);
      const full = c.offsetWidth; w.set(full, S.base, t); txo.set(1, S.base, t + .12);
      if (good) ok++;
      msw.to(ok === n && n ? 2 : 1, t); bd.set(ok === n && n ? 1 : -1, S.base, t);
      x.onclick = () => { c.remove(); n--; if (good) ok--; const u = now(); msw.to(!n ? 0 : ok === n ? 2 : 1, u); bd.set(!n ? 0 : ok === n ? 1 : -1, S.base, u); };
      items.push({ c, w, tx, txo });
    };
    const items = [];
    tin.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ','){ e.preventDefault(); add(tin.value); tin.value = ''; } });
    snd.onclick = () => { if (!n){ const t = now(); msw.to(1, t); bd.set(-1, S.base, t); tin.focus(); } };
    return t => { items.forEach(o => { o.c.style.width = px(Math.max(0, o.w.at(t))); const q = clamp(o.txo.at(t));
        o.tx.style.opacity = q.toFixed(3); o.tx.style.filter = q < .98 ? `blur(${((1-q)*BLUR).toFixed(2)}px)` : 'none'; });
      const p = clamp(bd.at(t));
      cmp.style.borderColor = p > .3 ? 'var(--success)' : p < -.3 ? 'var(--danger)' : 'var(--muted)';
      ml.forEach((e, k) => msw.apply(e, k, t)); };
  }});
