

atom({ id:'accordion', cat:'Content', name:'Accordion', block:'accordion, faq', fam:['M'], tall:true,
  html:`<div class="card acc" style="width:min(380px,90%);overflow:hidden"></div>`,
  desc:'Height springs to the measured body. The chevron turns on the same spring and the body fades in with height.',
  api:'body.h.set(open ? inner.scrollHeight : 0)',
  init(st){
    const box = $(st,'.acc'), Q = [['Can I use my own domain?','Yes. Add it under Settings, then point a CNAME at your site. Certificates renew on their own.'],['Is there a free plan?','The Starter plan is free for one site with up to 1,000 monthly visitors.'],['How do refunds work?','Cancel within 14 days of a charge and we refund it in full, no form needed.']];
    const rows = Q.map(([q,a],i) => { const r = document.createElement('div'); r.style.borderTop = i ? '1px solid var(--line-soft)' : '0';
      r.innerHTML = `<button style="width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;background:none;border:0;padding:13px 16px;font-weight:500;cursor:pointer;text-align:left"><span></span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button><div style="overflow:hidden;height:0"><p class="small muted" style="margin:0;padding:0 16px 14px"></p></div>`;
      r.querySelector('span').textContent = q; r.querySelector('p').textContent = a; box.appendChild(r);
      return { btn:$(r,'button'), chev:$(r,'svg'), body:$(r,'div'), inner:$(r,'p'), h:new Track(0) }; });
    let open = -1;
    rows.forEach((r,i) => r.btn.onclick = () => { open = open === i ? -1 : i; rows.forEach((x,j) => { x.h.set(open === j ? 1 : 0); x.btn.setAttribute('aria-expanded', open === j); }); });
    return t => rows.forEach(r => { const p = clamp(r.h.at(t)); r.body.style.height = px(p*r.inner.offsetHeight); r.chev.style.transform = `rotate(${(p*180).toFixed(1)}deg)`; fade(r.inner, p, (1-p)*-4); });
  }});