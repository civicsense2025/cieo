

atom({ id:'phone', cat:'Forms', name:'Phone number', block:'form (phone)', fam:['S','M'],
  html:`<div class="col" style="width:min(300px,88%);gap:6px"><label class="small" for="ph" style="font-weight:500">Mobile number</label><div class="pw row" style="height:42px;border:1.5px solid var(--line);border-radius:10px;background:var(--card);gap:0;overflow:hidden"><button class="cc" aria-label="Change country" style="position:relative;width:70px;height:100%;border:0;border-right:1px solid var(--line-soft);background:none;cursor:pointer;font:500 13px var(--sans)"></button><input id="ph" inputmode="tel" autocomplete="tel" style="flex:1;min-width:0;border:0;background:none;color:var(--ink);font:15px var(--sans);outline:none;padding:0 10px;font-variant-numeric:tabular-nums"><span class="ok" style="padding-right:10px;color:var(--success)">${ic(I.check,16,2.5)}</span></div><span class="small muted">Click the country code to switch</span></div>`,
  desc:'Digits format as you type for the chosen country. Switching country swaps the code with a blur and reformats the number. A complete number earns a success check.',
  api:'value = format(digits, country)   cc.to(country)   ok.set(complete)',
  init(st){
    const cc = $(st,'.cc'), inp = $(st,'input'), okEl = $(st,'.ok'), pw = $(st,'.pw');
    const C = [['US','+1',[3,3,4],d => `(${d.slice(0,3)}${d.length > 3 ? ') ' + d.slice(3,6) : ''}${d.length > 6 ? '-' + d.slice(6,10) : ''}`],['GB','+44',[4,6],d => d.slice(0,4) + (d.length > 4 ? ' ' + d.slice(4,10) : '')],['DE','+49',[3,8],d => d.slice(0,3) + (d.length > 3 ? ' ' + d.slice(3,11) : '')]];
    const L = C.map(([c,p]) => { const e = document.createElement('span'); e.className = 'layer'; e.innerHTML = `<b>${c}</b><span class="muted">${p}</span>`; e.style.gap = '4px'; cc.appendChild(e); return e; });
    const sw = new Swap(0), ok = new Track(0); let k = 0;
    const fmt = () => { const len = C[k][2].reduce((a,b) => a + b, 0), d = inp.value.replace(/\D/g,'').slice(0, len); inp.value = d ? C[k][3](d) : ''; inp.placeholder = C[k][3]('5'.repeat(len)).replace(/5/g,'0'); ok.set(d.length === len ? 1 : 0); };
    inp.oninput = fmt; cc.onclick = () => { k = (k + 1) % C.length; sw.to(k); fmt(); };
    inp.onfocus = () => pw.style.borderColor = 'var(--ink)'; inp.onblur = () => pw.style.borderColor = 'var(--line)'; fmt();
    return t => { L.forEach((e,i) => sw.apply(e,i,t)); const p = clamp(ok.at(t)); okEl.style.opacity = p.toFixed(3); okEl.style.transform = `scale(${(.6+.4*p).toFixed(3)})`; };
  }});