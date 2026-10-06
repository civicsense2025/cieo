atom({ id:'curveexport', cat:'Foundations', name:'Curve exporter', block:'tokens, handoff, css spring', fam:['T'],
  html:`<div class="card col" style="width:min(380px,94%);padding:18px;gap:16px"><div class="row pk" style="gap:8px"><button class="btn" style="flex:1;min-height:32px">snap</button><button class="btn" style="flex:1;min-height:32px">base</button><button class="btn" style="flex:1;min-height:32px">soft</button><button class="btn" style="flex:1;min-height:32px">lazy</button></div><pre class="pv" style="margin:0;font:12px/1.6 var(--mono);background:var(--raised);border-radius:8px;padding:12px;min-height:64px;overflow-x:auto;white-space:pre-wrap"></pre><div class="row" style="gap:8px"><button class="btn cp" style="flex:1;min-height:36px">Copy values</button></div><div class="row small muted fm" style="gap:8px;align-items:center"><span style="font-size:12px">Format</span><button class="btn" style="min-height:32px">web</button><button class="btn" style="min-height:32px">ios</button><button class="btn" style="min-height:32px">reanimated</button></div><div class="ro" style="font:13px var(--mono);font-variant-numeric:tabular-nums;color:var(--muted)">base · web · ready</div></div><div class="hint">One click copies the spring for any platform</div>`,
  desc:'Pick a spring and a platform: the same curve as CSS, SwiftUI or Reanimated values, copied in one click.',
  api:'stiffness w² · damping 2w · ease cubic-bezier(.2,.15,.2,1)',
  init(st){
    const pv = $(st,'.pv'), ro = $(st,'.ro'), pks = $$(st,'.pk .btn'), fms = $$(st,'.fm .btn');
    const W = { snap:34, base:22, soft:15, lazy:9 }, D = { snap:200, base:300, soft:440, lazy:740 };
    let p = 'base', f = 'web';
    const fmt = () => { const w = W[p];
      if (f === 'web') return 'transition: all ' + D[p] + 'ms cubic-bezier(.2, .15, .2, 1); /* ' + p + ' · ω' + w + ' */';
      if (f === 'ios') return '.motion(.' + p + ') /* stiffness: ' + (w * w) + ', damping: ' + (2 * w) + ' */';
      return 'withSpring(to, { stiffness: ' + (w * w) + ', damping: ' + (2 * w) + ' }); // ' + p + ' · ω' + w; };
    const paint = () => { pv.textContent = fmt();
      pks.forEach(b => b.setAttribute('aria-pressed', b.textContent === p));
      fms.forEach(b => b.setAttribute('aria-pressed', b.textContent === f));
      ro.textContent = p + ' · ' + f + ' · ready'; };
    pks.forEach(b => b.onclick = () => { p = b.textContent; paint(); });
    fms.forEach(b => b.onclick = () => { f = b.textContent; paint(); });
    paint();
    $(st,'.cp').onclick = () => { const s = pv.textContent;
      const done = ok => ro.textContent = p + ' · ' + f + (ok ? ' · copied ✓' : ' · copy failed');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(() => done(true), () => done(false));
      else { const ta = document.createElement('textarea'); ta.value = s; st.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(true); } catch (err) { done(false); } ta.remove(); } };
    return () => {};
  }});
