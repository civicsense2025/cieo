atom({ id:'faqacc', cat:'Landing', name:'FAQ accordion', block:'Landing faq', fam:['M','S'],
  html:`<div class="col" style="gap:0;max-width:420px;margin:0 auto;padding:44px 16px"><p style="margin:0 0 4px;font-size:15px;font-weight:600;line-height:1.45">Questions, answered</p><p class="small muted" style="margin:0 0 12px;font-size:13px;line-height:1.5">Everything else lives in the docs.</p><div class="card acc" style="overflow:hidden"></div><div class="row small muted" style="gap:8px;margin-top:12px;align-items:center;font-size:12.5px;line-height:1.5"><button class="btn cl" style="min-height:36px;border-radius:10px">Collapse all</button><span>deep-link with #faq</span></div></div><div class="hint">Single-open spring · closed rows dim · #faq-2 opens instantly</div>`,
  desc:'One row opens at a time with the body height on a spring and the chevron turning on the same spring. Closed rows dim while one is open; a #faq deep link opens its row instantly with no animation.',
  api:'body.h.set(open ? 1 : 0)   dim others → .55   hash → jump(1)',
  init(st){
    const box = $(st,'.acc');
    const Q = [['Can I use my own domain?','Yes. Add it under Settings, then point a CNAME at your site. Certificates renew on their own.','faq-1'],['Is there a free plan?','The Starter plan is free for one site with up to 1,000 monthly visitors.','faq-2'],['How do refunds work?','Cancel within 14 days of a charge and we refund it in full, no form needed.','faq-3']];
    const rows = Q.map(([q,a,id],i) => { const r = document.createElement('div'); r.style.borderTop = i ? '1px solid var(--line-soft)' : '0';
      r.innerHTML = `<button style="width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;background:none;border:0;padding:13px 16px;font-weight:500;font-size:14px;line-height:1.45;cursor:pointer;text-align:left;min-height:36px"><span></span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none;display:grid;place-items:center;padding:0"><path d="m6 9 6 6 6-6"/></svg></button><div style="overflow:hidden;height:0"><p class="small muted" style="margin:0;padding:0 16px 14px;font-size:13px;line-height:1.5"></p></div>`;
      r.querySelector('span').textContent = q; r.querySelector('p').textContent = a; box.appendChild(r);
      return { root:r, btn:$(r,'button'), chev:$(r,'svg'), body:$(r,'div'), inner:$(r,'p'), h:new Track(0), dim:new Track(1, S.snap), id }; });
    let open = -1;
    const apply = inst => rows.forEach((x,j) => {
      if (inst) x.h.jump(open === j ? 1 : 0); else x.h.set(open === j ? 1 : 0);
      x.dim.set(open < 0 || open === j ? 1 : .55);
      x.btn.setAttribute('aria-expanded', open === j);
    });
    rows.forEach((r,i) => r.btn.onclick = () => { open = open === i ? -1 : i; apply();
      try { history.replaceState(null, '', open < 0 ? location.pathname : '#faq-' + (open+1)); } catch(e){} });
    $(st,'.cl').onclick = () => { open = -1; apply(); try { history.replaceState(null, '', location.pathname); } catch(e){} };
    const m = (location.hash || '').match(/#faq-(\d)/);
    if (m){ const k = +m[1]-1; if (rows[k]){ open = k; apply(true); } }
    return t => rows.forEach(r => { const p = clamp(r.h.at(t));
      r.body.style.height = px(p*size(r.inner).h);
      r.chev.style.transform = `rotate(${(p*180).toFixed(1)}deg)`;
      r.root.style.opacity = clamp(r.dim.at(t)).toFixed(3);
      fade(r.inner, p, (1-p)*-4); });
  }});
