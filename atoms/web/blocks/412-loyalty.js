atom({ id:'loyalty', cat:'Storefront', name:'Loyalty stamp card', block:'loyalty, rewards, stamps', fam:['M','S'],
  html:`<div class="col" style="gap:8px;width:min(300px,100%)"><h4 style="margin:0;font-size:15px;font-weight:600;line-height:1.5">Coffee club <span class="ct num" style="font-size:13px;color:var(--muted);font-weight:500"></span></h4><div class="gr" role="group" aria-label="Stamps" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"></div><div class="rw" style="position:relative;min-height:44px"><div class="bar card row" style="gap:10px;padding:14px 16px;border-radius:12px;align-items:center"><b style="font-size:14px;line-height:1.5">Free drink unlocked</b><button type="button" class="cl" style="margin-left:auto;height:32px;padding:0 12px;border-radius:8px;border:0;background:var(--raised);cursor:pointer;font-size:13px">Claim</button></div></div><label class="row small muted" style="gap:6px;cursor:pointer"><input type="checkbox" class="rs"> Reset after claim</label></div><div class="hint">Tap a stamp; the sixth morphs to a reward</div>`,
  desc:'A stamp presses to 80% then fills softly while digits roll. The sixth stamp swaps the card into a reward pill that holds as the terminal.',
  api:'press.set(.8) → fill.set(1, soft)   dg.set(n)   full.to(1) morphs reward',
  init(st){
    const gr = $(st,'.gr'), ct = $(st,'.ct'), rw = $(st,'.rw'), bar = $(st,'.bar'), rs = $(st,'.rs');
    const dg = new Digits(ct, 1); dg.set('0', true);
    const N = 6; let n = 0; const fills = [], press = [];
    for (let i = 0; i < N; i++){ const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Stamp ' + (i + 1)); b.setAttribute('aria-pressed', 'false');
      b.style.cssText = 'aspect-ratio:1;border-radius:12px;border:1.5px solid var(--muted);background:var(--card);padding:0;display:grid;place-items:center;cursor:pointer;color:var(--muted)';
      b.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3 4 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 3-6 6-10z"/></svg>';
      gr.appendChild(b); const f = new Track(0), p = new Track(0); fills.push(f); press.push(p);
      b.onpointerdown = () => p.set(1, S.snap); b.onpointerup = () => p.set(0, S.snap);
      b.onclick = () => { if (i !== n || full.target) return; f.set(1, S.soft); b.setAttribute('aria-pressed', 'true'); n++; dg.dir = 1; dg.set(String(n)); if (n >= N) full.set(1, S.base); }; }
    const full = new Track(0);
    $(st,'.cl').onclick = () => { if (rs.checked){ n = 0; dg.dir = -1; dg.set('0'); fills.forEach(f => f.jump(0)); full.jump(0); gr.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false')); } };
    return t => { dg.render(t);
      gr.querySelectorAll('button').forEach((b, i) => { const f = clamp(fills[i].at(t)), p = clamp(press[i].at(t)), k = clamp(full.at(t));
        b.style.transform = `scale(${((1 - .2 * p) * (1 - .06 * k)).toFixed(4)})`;
        b.style.background = mix(f, 'var(--accent-tint, var(--raised))', 'var(--card)'); b.style.color = mix(f, 'var(--accent)', 'var(--faint)'); b.style.borderColor = mix(f, 'var(--accent)', 'var(--muted)'); });
      const k = clamp(full.at(t)); gr.style.opacity = (1 - k).toFixed(3); gr.style.visibility = k > .98 ? 'hidden' : 'visible'; gr.style.transform = `scale(${(.96 + .04 * (1 - k)).toFixed(4)})`;
      bar.style.opacity = k.toFixed(3); bar.style.transform = `translateY(${((1 - k) * 10).toFixed(2)}px) scale(${(.96 + .04 * k).toFixed(4)})`; bar.style.visibility = k < .02 ? 'hidden' : 'visible'; };
  }});
