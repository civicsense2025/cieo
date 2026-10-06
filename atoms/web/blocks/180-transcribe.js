

atom({ id:'transcribe', cat:'Writing', name:'Live transcription caret', block:'transcript, live captions', fam:['M','S','T'], tall:true,
  html:`<div class="col" style="gap:10px;width:min(340px,92%)"><div class="card tr-box" style="padding:12px 14px;min-height:120px;font-size:14px;line-height:1.7"></div><label class="row small muted" style="gap:6px;cursor:pointer"><input type="checkbox" class="tr-live" checked> Live</label></div><div class="hint">Tap a word to hear it again</div>`,
  desc:'Words blur in one by one while a soft caret rides the last word. Tapping a word pulses it like a replay. Pause stops the stream.',
  api:'tick: word.blurIn(base); caret.after(last); tap: pulse.set(1); live.toggle()',
  init(st){
    const box = $(st,'.tr-box'), live = $(st,'.tr-live');
    const W = 'The harbor bell rang twice before the gulls rose over the breakwater'.split(' ');
    const words = W.map(s => { const e = document.createElement('span'); e.textContent = s; e.style.cssText = 'cursor:pointer;border-radius:4px;padding:0 1px'; box.appendChild(e); box.appendChild(document.createTextNode(' ')); return { e, rt:-9, pu:new Track(0) }; });
    const caret = document.createElement('span');
    caret.style.cssText = 'display:inline-block;width:2px;height:1em;background:var(--ink);vertical-align:-2px;margin-left:2px;opacity:.6';
    box.appendChild(caret);
    let n = 0, t0 = now(), last = -9;
    const step = () => { if (n < words.length && live.checked){ words[n].rt = now(); last = n; n++; } };
    const iv = setInterval(step, 180);
    words.forEach((w2,i) => w2.e.onclick = () => w2.pu.set(1, S.base));
    return t => {
      words.forEach((w2,i) => {
        const p = w2.rt < 0 ? 0 : clamp(prog(t, w2.rt, S.base));
        w2.e.style.opacity = p.toFixed(3);
        w2.e.style.filter = p < .98 ? 'blur(' + ((1-p)*4).toFixed(2) + 'px)' : 'none';
        const k = clamp(w2.pu.at(t));
        w2.e.style.background = k > .02 ? 'color-mix(in oklab, var(--ink) ' + (k*14).toFixed(1) + '%, transparent)' : 'none';
        if (k > .98) w2.pu.jump(0);
      });
      caret.style.opacity = (.25 + .35*Math.abs(Math.sin(t*3))).toFixed(3);
      if (last >= 0 && words[last].e.parentNode === box) box.appendChild(caret);
    };
  }});
