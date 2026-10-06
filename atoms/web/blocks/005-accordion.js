/* The measured-height/chevron spring stays intact; semantics and composition improve. */
atom({
  id:'accordion',cat:'Content',name:'Accordion',block:'accordion, faq',fam:['M'],tall:true,
  html:`<style>
    #accordion .acc{width:min(384px,calc(100% - 32px));overflow:hidden;border:1px solid var(--line-soft);border-radius:24px;background:var(--card)}
    #accordion .acc-heading{margin:0;padding:24px 24px 16px;font-size:14px;font-weight:600;letter-spacing:-.02em}
    #accordion .acc-button{width:100%;min-height:56px;display:flex;justify-content:space-between;align-items:center;gap:16px;background:none;border:0;padding:16px 24px;font:inherit;font-size:13px;font-weight:500;cursor:pointer;text-align:start;color:var(--ink)}
    #accordion .acc-button svg{flex:none;color:var(--muted)}
    #accordion .acc-button:hover{background:var(--raised)}
    #accordion .acc-answer{overflow:hidden;height:0}
    #accordion .acc-answer p{margin:0;padding:0 24px 24px;font-size:12px;line-height:1.65;color:var(--muted)}
  </style><div class="acc"><h4 class="acc-heading">A few good questions.</h4></div>`,
  desc:'Each answer opens on the original measured-height spring. The chevron and text follow the same motion.',
  api:'body.h.set(open ? inner.scrollHeight : 0)',
  init(st){
    const box=$(st,'.acc');
    const questions=[['Can I use my own domain?','Yes. Add it under Settings and point a CNAME at the site. Certificates renew automatically.'],['Is there a free plan?','The Starter plan includes one site and up to 1,000 monthly visitors.'],['How do refunds work?','Cancel within 14 days of a charge to receive a full refund. These are example product details.']];
    const rows=questions.map(([q,a],i)=>{
      const row=document.createElement('div');row.style.borderTop='1px solid var(--line-soft)';
      row.innerHTML=`<button type="button" class="acc-button" id="acc-trigger-${i}" aria-expanded="false" aria-controls="acc-answer-${i}"><span></span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="acc-answer" id="acc-answer-${i}" role="region" aria-labelledby="acc-trigger-${i}" inert><p></p></div>`;
      row.querySelector('span').textContent=q;row.querySelector('p').textContent=a;box.append(row);
      return {btn:$(row,'button'),chev:$(row,'svg'),body:$(row,'.acc-answer'),inner:$(row,'p'),h:new Track(0)};
    });
    let open=-1;
    rows.forEach((r,i)=>r.btn.onclick=()=>{
      open=open===i?-1:i;
      rows.forEach((x,j)=>{const selected=open===j;x.h.set(selected?1:0);x.btn.setAttribute('aria-expanded',String(selected));x.body.inert=!selected;x.body.setAttribute('aria-hidden',String(!selected));});
    });
    return t=>rows.forEach(r=>{const p=clamp(r.h.at(t));r.body.style.height=px(p*r.inner.offsetHeight);r.chev.style.transform=`rotate(${(p*180).toFixed(1)}deg)`;fade(r.inner,p,(1-p)*-4);});
  }
});
