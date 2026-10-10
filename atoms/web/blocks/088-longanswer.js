

/* ---------- Form elements from Tally, Typeform and Flodesk ---------- */
atom({ id:'longanswer', cat:'Forms', name:'Long answer', block:'form (long answer)', fam:['M','S'],
  html:`<div class="col" style="width:min(320px,88%);gap:6px"><label class="small" for="la" style="font-weight:500">What should we improve?</label><div style="position:relative"><textarea id="la" rows="1" placeholder="Start typing…" style="display:block;width:100%;resize:none;overflow:hidden;border:1.5px solid var(--muted);border-radius:10px;background:var(--card);color:var(--ink);font:14px/1.5 var(--sans);padding:9px 11px;outline:none"></textarea><div class="mr" aria-hidden="true" style="position:absolute;left:0;right:0;top:0;visibility:hidden;white-space:pre-wrap;word-wrap:break-word;font:14px/1.5 var(--sans);padding:9px 11px;border:1.5px solid transparent"></div></div><div class="row small" style="justify-content:flex-end"><span class="ct num"></span></div></div>`,
  desc:'The box grows a line at a time on a spring instead of jumping. The counter turns warning at 90% of the limit and danger past it.',
  api:'h.set(mirror.offsetHeight)   counter = mix(warning | danger, muted)',
  init(st){
    const ta = $(st,'textarea'), mr = $(st,'.mr'), ct = $(st,'.ct'), MAX = 140, h = new Track(0), warn = new Track(0), over = new Track(0);
    const fit = inst => { mr.textContent = ta.value + '​'; const v = mr.offsetHeight; inst ? h.jump(v) : h.set(v); const n = ta.value.length; warn.set(n >= MAX*.9 ? 1 : 0); over.set(n > MAX ? 1 : 0); ct.textContent = `${n} / ${MAX}`; ta.setAttribute('aria-invalid', n > MAX); };
    ta.oninput = () => fit(); ta.onfocus = () => ta.style.borderColor = 'var(--ink)'; ta.onblur = () => ta.style.borderColor = 'var(--muted)'; document.fonts.ready.then(() => fit(true)); fit(true);
    return t => { ta.style.height = px(h.at(t)); const w = clamp(warn.at(t)), o = clamp(over.at(t)); ct.style.color = `color-mix(in oklab, var(--danger) ${(o*100).toFixed(1)}%, ${mix(w,'var(--warning)','var(--faint)')})`; };
  }});