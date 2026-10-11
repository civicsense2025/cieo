
atom({ id:'auth-invite', cat:'Auth', name:'Org invite', block:'auth, invite, team', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px;background:#fff;color:#171717"><b style="font-size:15px;font-weight:600">You are invited</b><p style="font-size:13.5px;line-height:1.5;margin:0">Priya invited you to join Acme Studio as Editor.</p><div class="st-main col" style="gap:8px"><button class="ac" style="height:44px;border-radius:9px;border:0;background:#171717;color:#fff;font-weight:500;cursor:pointer;font-size:14px">Accept invite to Acme Studio</button><button class="dc" style="height:44px;border-radius:9px;border:0;background:#f1f1f1;color:#171717;font-weight:500;cursor:pointer;font-size:14px">Decline invite to Acme Studio</button></div><div class="st-cf col" style="gap:8px" hidden><p style="font-size:13.5px;line-height:1.5;margin:0">Decline the invite to Acme Studio?</p><button class="cf" style="height:44px;border-radius:9px;border:0;background:#171717;color:#fff;font-weight:500;cursor:pointer;font-size:14px">Confirm decline</button><button class="kp" style="height:44px;border-radius:9px;border:0;background:#f1f1f1;color:#171717;font-weight:500;cursor:pointer;font-size:14px">Keep my invite</button></div><p class="sm" role="status" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px;color:#171717"></p></div><div class="hint">Accept lands, decline asks first</div>`,
  desc:'Accept lands a welcome line while decline arms an inline confirm step. Keep returns to the invite; every ending is text, never colour alone.',
  api:'accept -> welcomed   decline -> confirm -> declined | kept',
  init(st){
    const main = $(st,'.st-main'), cf = $(st,'.st-cf'), sm = $(st,'.sm');
    const done = (s) => { main.hidden = true; cf.hidden = true; sm.textContent = s; };
    $(st,'.ac').onclick = () => done('You are in! Welcome to Acme Studio.');
    $(st,'.dc').onclick = () => { main.hidden = true; cf.hidden = false; sm.textContent = ''; };
    $(st,'.kp').onclick = () => { cf.hidden = true; main.hidden = false; };
    $(st,'.cf').onclick = () => done('Invite declined. Priya was notified.');
    return () => {};
  }});

atom({ id:'auth-sessions', cat:'Auth', name:'Sessions', block:'auth, sessions, devices', fam:['M','S'], tall:true,
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px;background:#fff;color:#171717"><b style="font-size:15px;font-weight:600">Your sessions</b><ul class="rows" role="list" style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px"></ul><p class="sm" role="status" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px;color:#171717"></p></div><div class="hint">Revoke a device, the row goes away</div>`,
  desc:'Each row names its device and city. The current row reads This device and carries no revoke button; revoking any other row removes it and says so in text.',
  api:'revoke(id) removes row + status   current has no revoke',
  init(st){
    const rows = $(st,'.rows'), sm = $(st,'.sm');
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
        rv.onclick = () => { li.remove(); sm.textContent = `${s.device} session revoked.`; };
        li.append(rv);
      }
      rows.append(li);
    }
    return () => {};
  }});

atom({ id:'auth-account', cat:'Auth', name:'Account', block:'auth, account, sign out', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px;background:#fff;color:#171717"><b style="font-size:15px;font-weight:600">Account</b><div class="row" style="display:flex;align-items:center;gap:10px"><span aria-hidden="true" style="width:44px;height:44px;flex:none;border-radius:50%;display:grid;place-items:center;background:#171717;color:#fff;font-size:14px;font-weight:700">JW</span><span class="col" style="display:flex;flex-direction:column;gap:2px"><b style="font-size:13.5px">Jo Warren</b><span style="font-size:12.5px;color:#404040">jo@studio.co</span></span></div><div class="st-main col" style="gap:8px"><button class="so" style="height:44px;border-radius:9px;border:0;background:#f1f1f1;color:#171717;font-weight:500;cursor:pointer;font-size:14px">Sign out</button></div><div class="st-cf col" style="gap:8px" hidden><p style="font-size:13.5px;line-height:1.5;margin:0">Sign out of all devices?</p><button class="cf" style="height:44px;border-radius:9px;border:0;background:#171717;color:#fff;font-weight:500;cursor:pointer;font-size:14px">Confirm sign out</button><button class="cx" style="height:44px;border-radius:9px;border:0;background:#f1f1f1;color:#171717;font-weight:500;cursor:pointer;font-size:14px">Cancel</button></div><p class="sm" role="status" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px;color:#171717"></p></div><div class="hint">Sign out asks before it signs out</div>`,
  desc:'Sign out opens an inline Sign out of all devices step with Confirm and Cancel. Confirm lands a signed-out line; Cancel returns to the profile untouched.',
  api:'sign out -> confirm? -> signed out | back',
  init(st){
    const main = $(st,'.st-main'), cf = $(st,'.st-cf'), sm = $(st,'.sm');
    $(st,'.so').onclick = () => { main.hidden = true; cf.hidden = false; sm.textContent = ''; };
    $(st,'.cx').onclick = () => { cf.hidden = true; main.hidden = false; };
    $(st,'.cf').onclick = () => { cf.hidden = true; sm.textContent = 'Signed out of all devices.'; };
    return () => {};
  }});
