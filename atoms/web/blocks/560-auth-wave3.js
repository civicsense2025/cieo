
atom({ id:'auth-invite', cat:'Auth', name:'Org invite', block:'auth, invite, team', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px;background:#fff;color:#171717"><b style="font-size:15px;font-weight:600">You are invited</b><p style="font-size:13.5px;line-height:1.5;margin:0">Priya invited you to join Acme Studio as Editor.</p><div class="st-panes" style="position:relative;overflow:hidden"><div class="st-main col" style="position:absolute;inset:0 0 auto;gap:8px"><button class="ac" style="height:44px;border-radius:9px;border:0;background:#171717;color:#fff;font-weight:500;cursor:pointer;font-size:14px">Accept invite to Acme Studio</button><button class="dc" style="height:44px;border-radius:9px;border:0;background:#f1f1f1;color:#171717;font-weight:500;cursor:pointer;font-size:14px">Decline invite to Acme Studio</button></div><div class="st-cf col" style="position:absolute;inset:0 0 auto;gap:8px"><p style="font-size:13.5px;line-height:1.5;margin:0">Decline the invite to Acme Studio?</p><button class="cf" style="height:44px;border-radius:9px;border:0;background:#171717;color:#fff;font-weight:500;cursor:pointer;font-size:14px">Confirm decline</button><button class="kp" style="height:44px;border-radius:9px;border:0;background:#f1f1f1;color:#171717;font-weight:500;cursor:pointer;font-size:14px">Keep my invite</button></div></div><p class="sm" role="status" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px;color:#171717"></p></div><div class="hint">Accept lands, decline asks first</div>`,
  desc:'Accept lands a welcome line while decline arms an inline confirm step. Keep returns to the invite; every ending is text, never colour alone.',
  api:'accept -> welcomed   decline -> confirm -> declined | kept',
  init(st){
    const panes = $(st,'.st-panes'), main = $(st,'.st-main'), cf = $(st,'.st-cf'), sm = $(st,'.sm'), sw = new Swap('main'), h = new Track(0, S.soft), motion = motionSettings(st);
    let step = 'main';
    const setPanes = (active) => [[main, 'main'], [cf, 'confirm']].forEach(([el, k]) => {
      const live = k === active;
      el.inert = !live;
      if (live) { el.removeAttribute('aria-hidden'); el.style.visibility = 'visible'; }
      else el.setAttribute('aria-hidden', 'true');
    });
    const heightFor = (next) => next === 'main' ? main.offsetHeight : next === 'confirm' ? cf.offsetHeight : 0;
    const jumpToStep = () => { sw.jump(step); h.jump(heightFor(step)); setPanes(step); };
    const go = (next, focus) => {
      step = next; setPanes(next);
      if (motion.reduced()) { sw.jump(next); h.jump(heightFor(next)); }
      else { sw.to(next); h.set(heightFor(next), S.soft); }
      focus?.focus({ preventScroll:true });
    };
    setPanes(step);
    const done = (s) => { go('done'); sm.textContent = s; };
    $(st,'.ac').onclick = () => done('You are in! Welcome to Acme Studio.');
    $(st,'.dc').onclick = () => { go('confirm', $(st,'.cf')); sm.textContent = ''; };
    $(st,'.kp').onclick = () => go('main', $(st,'.ac'));
    $(st,'.cf').onclick = () => done('Invite declined. Priya was notified.');
    h.jump(main.offsetHeight); panes.style.height = px(h.at(now()));
    return t => { if (motion.changedToReduced()) jumpToStep();
      panes.style.height = px(Math.max(0, h.at(t)));
      sw.apply(main, 'main', t); if (step === 'main') main.style.visibility = 'visible';
      sw.apply(cf, 'confirm', t); if (step === 'confirm') cf.style.visibility = 'visible'; };
  }});

atom({ id:'auth-sessions', cat:'Auth', name:'Sessions', block:'auth, sessions, devices', fam:['M','S'], tall:true,
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px;background:#fff;color:#171717"><b style="font-size:15px;font-weight:600">Your sessions</b><ul class="rows" role="list" style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px"></ul><p class="sm" role="status" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px;color:#171717"></p></div><div class="hint">Revoke a device, the row goes away</div>`,
  desc:'Each row names its device and city. The current row reads This device and carries no revoke button; revoking any other row removes it and says so in text.',
  api:'revoke(id) removes row + status   current has no revoke',
  init(st){
    const rows = $(st,'.rows'), sm = $(st,'.sm'), motion = motionSettings(st);
    const items = [];
    const data = [
      { id:'mbp', device:'MacBook Pro', meta:'Portland · Active now', current:true },
      { id:'ip15', device:'iPhone 15', meta:'Portland · 2 hours ago', current:false },
      { id:'ipad', device:'iPad Air', meta:'Seattle · Yesterday', current:false },
    ];
    for (const s of data) {
      const li = document.createElement('li');
      li.setAttribute('role', 'listitem');
      li.style.cssText = 'display:flex;flex-direction:column;gap:2px;background:#f6f6f6;border-radius:9px;padding:10px 12px';
      const name = document.createElement('span');
      name.style.cssText = 'font-size:13.5px;font-weight:600;color:#171717';
      name.textContent = s.device;
      const meta = document.createElement('span');
      meta.style.cssText = 'font-size:12.5px;color:#404040';
      meta.textContent = s.meta;
      li.append(name, meta);
      if (s.current) {
        const cur = document.createElement('span');
        cur.style.cssText = 'font-size:12.5px;font-weight:600;color:#171717';
        cur.textContent = 'This device';
        li.append(cur);
      } else {
        const rv = document.createElement('button');
        rv.style.cssText = 'align-self:flex-start;min-height:44px;border:0;border-radius:9px;background:none;color:#b3261e;font-weight:500;cursor:pointer;font-size:13.5px;padding:0 4px';
        rv.setAttribute('aria-label', `Revoke ${s.device} session`);
        rv.textContent = `Revoke ${s.device}`;
        rv.onclick = () => { const before = new Map(items.filter(x => x.li.isConnected).map(x => [x, x.li.getBoundingClientRect().top])); li.remove();
          items.filter(x => x.li.isConnected).forEach(x => {
            const match = /translateY\((-?\d+(?:\.\d+)?)px\)/.exec(x.li.style.transform);
            const liveY = match ? Number(match[1]) : 0;
            const afterLayoutTop = x.li.getBoundingClientRect().top - liveY;
            const dy = before.get(x) - afterLayoutTop;
            if (motion.reduced()) x.y.jump(0); else x.y.jump(dy).set(0, S.base);
          }); sm.textContent = `${s.device} session revoked.`; };
        li.append(rv);
      }
      rows.append(li); items.push({ li, y:new Track(0) });
    }
    return t => { if (motion.changedToReduced()) items.forEach(x => x.y.jump(0));
      items.forEach(x => { if (x.li.isConnected) x.li.style.transform = `translateY(${px(x.y.at(t))})`; }); };
  }});

atom({ id:'auth-account', cat:'Auth', name:'Account', block:'auth, account, sign out', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px;background:#fff;color:#171717"><b style="font-size:15px;font-weight:600">Account</b><div class="row" style="display:flex;align-items:center;gap:10px"><span aria-hidden="true" style="width:44px;height:44px;flex:none;border-radius:50%;display:grid;place-items:center;background:#171717;color:#fff;font-size:14px;font-weight:700">JW</span><span class="col" style="display:flex;flex-direction:column;gap:2px"><b style="font-size:13.5px">Jo Warren</b><span style="font-size:12.5px;color:#404040">jo@studio.co</span></span></div><div class="st-panes" style="position:relative;overflow:hidden"><div class="st-main col" style="position:absolute;inset:0 0 auto;gap:8px"><button class="so" style="height:44px;border-radius:9px;border:0;background:#f1f1f1;color:#171717;font-weight:500;cursor:pointer;font-size:14px">Sign out</button></div><div class="st-cf col" style="position:absolute;inset:0 0 auto;gap:8px"><p style="font-size:13.5px;line-height:1.5;margin:0">Sign out of all devices?</p><button class="cf" style="height:44px;border-radius:9px;border:0;background:#171717;color:#fff;font-weight:500;cursor:pointer;font-size:14px">Confirm sign out</button><button class="cx" style="height:44px;border-radius:9px;border:0;background:#f1f1f1;color:#171717;font-weight:500;cursor:pointer;font-size:14px">Cancel</button></div></div><p class="sm" role="status" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px;color:#171717"></p></div><div class="hint">Sign out asks before it signs out</div>`,
  desc:'Sign out opens an inline Sign out of all devices step with Confirm and Cancel. Confirm lands a signed-out line; Cancel returns to the profile untouched.',
  api:'sign out -> confirm? -> signed out | back',
  init(st){
    const panes = $(st,'.st-panes'), main = $(st,'.st-main'), cf = $(st,'.st-cf'), sm = $(st,'.sm'), sw = new Swap('main'), h = new Track(0, S.soft), motion = motionSettings(st);
    let step = 'main';
    const setPanes = (active) => [[main, 'main'], [cf, 'confirm']].forEach(([el, k]) => {
      const live = k === active;
      el.inert = !live;
      if (live) { el.removeAttribute('aria-hidden'); el.style.visibility = 'visible'; }
      else el.setAttribute('aria-hidden', 'true');
    });
    const heightFor = (next) => next === 'main' ? main.offsetHeight : next === 'confirm' ? cf.offsetHeight : 0;
    const jumpToStep = () => { sw.jump(step); h.jump(heightFor(step)); setPanes(step); };
    const go = (next, focus) => {
      step = next; setPanes(next);
      if (motion.reduced()) { sw.jump(next); h.jump(heightFor(next)); }
      else { sw.to(next); h.set(heightFor(next), S.soft); }
      focus?.focus({ preventScroll:true });
    };
    setPanes(step);
    $(st,'.so').onclick = () => { go('confirm', $(st,'.cf')); sm.textContent = ''; };
    $(st,'.cx').onclick = () => go('main', $(st,'.so'));
    $(st,'.cf').onclick = () => { go('done'); sm.textContent = 'Signed out of all devices.'; };
    h.jump(main.offsetHeight); panes.style.height = px(h.at(now()));
    return t => { if (motion.changedToReduced()) jumpToStep();
      panes.style.height = px(Math.max(0, h.at(t)));
      sw.apply(main, 'main', t); if (step === 'main') main.style.visibility = 'visible';
      sw.apply(cf, 'confirm', t); if (step === 'confirm') cf.style.visibility = 'visible'; };
  }});
