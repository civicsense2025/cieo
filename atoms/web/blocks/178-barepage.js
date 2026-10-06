

atom({ id:'barepage', cat:'Writing', name:'Bare-page fade', block:'editor, toolbar', fam:['X','S'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="gap:8px;align-items:center;padding:12px;margin:0 auto;max-width:360px"><div class="card bp-chrome row" style="gap:8px;padding:14px 16px;font-size:13px">Draft<span class="muted">·</span><span class="muted">Share</span><span class="muted">·</span><b>Enter</b></div><div class="card bp-page" style="overflow:hidden;padding:14px 16px"><p class="small" style="margin:0">The lake was flat. Mara set the lamp down and started over on the first line.</p><div class="bp-side small muted" style="overflow:hidden">812 words · calm air, no comments</div></div><label class="row small muted" style="gap:8px;cursor:pointer"><input type="checkbox" class="bp-calm" checked> calm</label></div><div class="hint">Enter to write · move to the top for tools</div>`,
  desc:'Enter fades the chrome out fast, then the page widens on a spring. Moving to the top brings the tools back. The toggle picks calm or busy air.',
  api:'enter(): chrome.set(0,snap); w.set(wide,base); top:hover → chrome.set(1)',
  init(st){
    const chrome = $(st,'.bp-chrome'), page = $(st,'.bp-page'), side = $(st,'.bp-side'), calm = $(st,'.bp-calm');
    const co = new Track(1), w = new Track(250), sb = new Track(1);
    w.jump(250); sb.jump(1);
    let writing = false;
    chrome.querySelector('b').style.cursor = 'pointer';
    chrome.querySelector('b').onclick = () => {
      writing = true; const t = now();
      co.set(0, S.snap, t); w.set(330, S.base, t + .1);
    };
    st.addEventListener('pointermove', e => {
      const r = st.getBoundingClientRect();
      if (e.clientY - r.top < 28 && writing){ writing = false; co.set(1, S.base); w.set(250, S.base); }
    });
    calm.onchange = () => sb.set(calm.checked ? 1 : 0, S.base);
    return t => {
      const c = clamp(co.at(t));
      chrome.style.opacity = c.toFixed(3);
      chrome.style.visibility = c < .02 ? 'hidden' : 'visible';
      chrome.style.filter = c < .98 ? 'blur(' + ((1-c)*4).toFixed(2) + 'px)' : 'none';
      page.style.width = px(w.at(t));
      const s = clamp(sb.at(t));
      side.style.opacity = s.toFixed(3);
      side.style.maxHeight = px(s*30);
    };
  }});
