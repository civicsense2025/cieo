atom({ id:'settingsrow', cat:'Chrome', name:'Settings form row', block:'chrome, settings, form', fam:['S','M'],
  html:`<div class="col" style="gap:8px;max-width:440px;margin:0 auto;width:100%"><div style="font-size:15px;font-weight:600;line-height:1.5">Notification email</div><div class="small muted" style="font-size:12.5px;line-height:1.5">Knob rides base edges &middot; helper swap-blurs &middot; Enter validates</div><div style="border:1px solid color-mix(in oklab, var(--ink) 14%, transparent);border-radius:12px;padding:15px;background:var(--card);display:flex;flex-direction:column;gap:8px"><label style="font-size:13.5px;line-height:1.5;font-weight:600" for="sr-em">Email address</label><input class="em" id="sr-em" type="email" value="ada@" aria-describedby="sr-help" style="width:100%;min-height:36px;border-radius:8px;border:1.5px solid var(--muted);padding:0 10px;font-size:13.5px;line-height:1.5;box-sizing:border-box"><div class="help" id="sr-help" style="position:relative;min-height:20px;font-size:12px;line-height:1.5"></div><div class="row" style="gap:10px;align-items:center;min-height:40px;border-radius:8px"><button class="tg" role="switch" aria-checked="false" aria-label="Email notifications" style="position:relative;width:48px;height:32px;border-radius:16px;border:1.5px solid var(--muted);background:transparent;cursor:pointer;padding:0"><span class="knob" style="position:absolute;top:2px;left:2px;display:grid;place-items:center;padding:0;width:26px;height:26px;border-radius:50%;background:var(--ink);color:var(--card);font-size:12px;transform:translateY(.5px)"></span></button><span style="font-size:13.5px;line-height:1.5">Email notifications</span><span class="ok" style="position:relative;width:20px;height:20px;display:grid;place-items:center;font-size:14px;color:var(--success)"></span></div><button class="sv" style="min-height:32px;border-radius:8px;border:0;background:var(--ink);color:var(--card);font-size:13.5px;line-height:1.5;cursor:pointer">Save</button></div><label class="row small muted" style="gap:6px;font-size:12px;line-height:1.5"><input type="checkbox" class="lv" checked> validate on type</label></div><div class="hint">Type an email &middot; Enter saves &middot; Esc clears</div>`,
  desc:'Toggle knob rides on base edges. Helper text swap-blurs between hint, danger, and success states. Invalid tints danger with a message; valid holds a success check terminal. Reduced motion jumps instantly.',
  api:'knob.go(off,on); help.to(state); ring.set(err?1:0)   end: valid \u2713, hold',
  init(st){
    const em = $(st,'.em'), tg = $(st,'.tg'), knob = $(st,'.knob'),
          help = $(st,'.help'), sv = $(st,'.sv'), ok = $(st,'.ok'), lv = $(st,'.lv');
    const put = (tr,v,c) => { if (REDUCE) tr.jump(v); else tr.set(v,c); };
    const knobE = edges(2, 4);
    const errT = new Track(0,S.base), okSw = new Swap(0), helpSw = new Swap(0);
    const helps = ['We only send security alerts.', 'Enter a valid email like ada@x.com.', 'Saved \u2014 alerts on.'];
    const layers = helps.map(h => {
      const d = document.createElement('div');
      d.style.cssText = 'font-size:12px;line-height:1.5';
      d.textContent = h; help.appendChild(d); return d;
    });
    const okA = document.createElement('span'), okB = document.createElement('span');
    okB.textContent = '\u2713'; ok.appendChild(okA); ok.appendChild(okB);
    let on = false, state = 0;
    const valid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim());
    const paint = () => {
      const v = valid(), empty = !em.value.trim();
      state = empty ? 0 : (v ? 2 : 1);
      okSw.to(state === 2 ? 1 : 0); helpSw.to(state);
      put(errT, state === 1 ? 1 : 0, S.base);
      em.style.borderColor = state === 1 ? '#c23b2a' : (state === 2 ? 'var(--success)' : '');
      em.setAttribute('aria-invalid', state === 1 ? 'true' : 'false');
      tg.setAttribute('aria-checked', String(on));
    };
    const flip = () => {
      on = !on;
      if (REDUCE) knobE.jump(on?20:2, on?46:28); else knobE.go(on?20:2, on?46:28);
      tg.setAttribute('aria-checked', String(on));
    };
    knobE.jump(2,28);
    em.addEventListener('input', () => { if (lv.checked) paint(); });
    em.addEventListener('keydown', e => {
      if (e.key === 'Enter'){ paint(); e.preventDefault(); }
      else if (e.key === 'Escape'){ em.value=''; paint(); em.blur(); e.preventDefault(); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){ flip(); e.preventDefault(); }
    });
    tg.onclick = flip;
    tg.onkeydown = e => { if (e.key === 'Enter' || e.key === ' '){ flip(); e.preventDefault(); } else if (e.key === 'Escape'){ tg.blur(); e.preventDefault(); } };
    sv.onclick = () => { paint(); em.focus(); };
    paint();
    return t => {
      knob.style.left = px(knobE.A.at(t));
      knob.style.width = px(Math.max(20, knobE.B.at(t)-knobE.A.at(t)));
      knob.style.height = px(Math.max(20, knobE.B.at(t)-knobE.A.at(t)));
      knob.style.top = '2px';
      knob.style.background = mix(clamp(errT.at(t)), '#c23b2a', 'var(--ink)');
      layers.forEach((l,k) => helpSw.apply(l,k,t));
      okSw.apply(okA, 0, t); okSw.apply(okB, 1, t);
      help.style.minHeight = '20px';
    };
  }});
