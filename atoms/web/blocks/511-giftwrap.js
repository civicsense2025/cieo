atom({ id:'giftwrap', cat:'Commerce', name:'Gift wrap', block:'cart, toggle, gift', fam:['M','S'],
  html:`<div class="card col" style="width:min(300px,92%);padding:14px;gap:8px"><div class="row" style="gap:10px;align-items:center"><svg class="bow" width="44" height="33" viewBox="0 0 44 33" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" style="flex:none"><path class="b1" d="M22 12 C12 2 4 6 8 12 C11 16 18 14 22 12"/><path class="b2" d="M22 12 C32 2 40 6 36 12 C33 16 26 14 22 12"/><rect x="13" y="12" width="18" height="16" rx="3" stroke="var(--ink)"/></svg><span class="col" style="gap:2px"><b style="font-size:15px;font-weight:600">Gift wrap</b><span class="small muted" style="font-size:12.5px">Kraft paper, cotton bow</span></span><span class="fee num" style="margin-left:auto;font-size:15px;font-weight:600;font-variant-numeric:tabular-nums;min-width:52px;text-align:right"></span><button class="sw" role="switch" aria-checked="false" aria-label="Gift wrap" style="width:48px;height:36px;border-radius:18px;border:0;background:var(--raised);cursor:pointer;position:relative;padding:0;display:grid;align-items:center"><i style="position:absolute;left:4px;width:26px;height:26px;border-radius:50%;background:var(--card);box-shadow:var(--shadow);transform:translateY(.5px)"></i></button></div><div class="nt" style="overflow:hidden;max-height:0"><textarea class="ta" rows="2" maxlength="140" placeholder="Gift note…" aria-label="Gift note" style="width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:9px;padding:8px 10px;font-size:13px;line-height:1.5;resize:none"></textarea></div><label class="row small muted" style="gap:6px;font-size:12.5px"><input type="checkbox" class="fl"> Foil bow</label></div><div class="hint">Flip the wrap switch</div>`,
  desc:'The knob edges across like a switch while the note height-springs open and the bow draws itself softly. The fee rolls in place without moving the switch.',
  api:'on.set(1); knob.release → edge   note.set(H); bow.set(1,soft); fee.set(4.95)',
  init(st){
    const sw = $(st,'.sw'), knob = $(sw,'i'), nt = $(st,'.nt'), ta = $(st,'.ta'), fee = new Track(0);
    const on = new Track(0), note = new Track(0), bow = new Track(0);
    fee.jump(0); $(st,'.fee').textContent = money(0);
    sw.onclick = () => { const v = on.target < .5 ? 1 : 0; on.set(v); note.set(v); bow.set(v, S.soft); fee.set(v ? 4.95 : 0);
      sw.setAttribute('aria-checked', !!v); if (v) setTimeout(() => ta.focus(), 220); };
    $(st,'.fl').onchange = e => $(st,'.bow').style.stroke = '';
    return t => { const p = clamp(on.at(t)); knob.style.transform = `translateX(${(p*14).toFixed(2)}px) translateY(.5px)`;
      sw.style.background = mix(p,'var(--ink)','var(--raised)'); knob.style.background = mix(p,'var(--card)','var(--card)');
      nt.style.maxHeight = (clamp(note.at(t))*86).toFixed(0) + 'px';
      const b = clamp(bow.at(t)), L = 60;
      [$$(st,'.b1')[0], $$(st,'.b2')[0]].forEach(el => { el.style.strokeDasharray = L; el.style.strokeDashoffset = ((1-b)*L).toFixed(1); el.style.opacity = (.25+.75*b).toFixed(3); });
      $(st,'.fee').textContent = money(Math.max(0, fee.at(t))); };
  }});
