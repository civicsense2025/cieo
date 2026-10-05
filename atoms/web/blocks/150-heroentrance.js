

/* ================================================================ landing lane */
{
/* ---------- Hero entrance ---------- */
atom({ id:'heroentrance', cat:'Landing', name:'Hero entrance', block:'hero, cta-button, image', fam:['S','M','T'], wide:true, tall:true,
  html:`<style>
.ldh{position:absolute;inset:0;container-type:inline-size}
.ldh-w{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:40px;align-items:center;padding:26px 56px 0}
.ldh-t{display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding-bottom:30px;min-width:0}
.ldh-e{display:inline-flex;align-items:center;gap:6px;padding:3px 11px;border-radius:99px;background:var(--accent-tint);color:var(--accent);font-size:12.5px;font-weight:500;white-space:nowrap}
.ldh-h{margin:0;font-size:clamp(28px,3.7cqi,44px);line-height:1.04;letter-spacing:-.035em;font-weight:600;text-wrap:balance}
.ldh-p{margin:0;color:var(--muted);max-width:44ch;font-size:15px;line-height:1.5}
.ldh-b{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.ldh-b .btn{padding:9px 16px;font-size:14px;border-radius:10px}
.ldh-i{align-self:end;height:262px;border-radius:14px 14px 0 0;border:1px solid var(--line);border-bottom:0;overflow:hidden;transform-origin:50% 100%;min-width:0}
.ldh-bar{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--line-soft)}
.ldh-logo{width:14px;height:14px;border-radius:4px;background:var(--ink)}
.ldh-nm{font-size:12.5px;font-weight:600}
.ldh-st{margin-left:auto;font-size:11px;font-weight:500;padding:2px 8px;border-radius:99px;background:var(--success-tint);color:var(--success)}
.ldh-bd{display:grid;grid-template-columns:104px minmax(0,1fr)}
.ldh-nv{display:flex;flex-direction:column;gap:2px;padding:10px;border-right:1px solid var(--line-soft);font-size:12.5px;color:var(--muted)}
.ldh-nv span{padding:5px 8px;border-radius:7px}
.ldh-nv .on{background:var(--accent-tint);color:var(--accent);font-weight:500}
.ldh-mn{padding:12px 14px;display:flex;flex-direction:column;gap:6px;min-width:0}
.ldh-k{font-size:12px;color:var(--muted)}
.ldh-v{display:flex;align-items:baseline;gap:8px}
.ldh-v b{font-size:26px;letter-spacing:-.03em;font-weight:600;font-variant-numeric:tabular-nums}
.ldh-v span{font-size:12px;color:var(--success);font-weight:500}
.ldh-mn svg{width:100%;height:64px;display:block}
.ldh-r{display:flex;justify-content:space-between;font-size:12.5px;padding:7px 0;border-top:1px solid var(--line-soft)}
@container (max-width:759px){
  .ldh-w{display:flex;flex-direction:column;justify-content:flex-start;align-items:center;padding:22px 20px 0;gap:0}
  .ldh-t{align-items:center;text-align:center;padding-bottom:0;gap:10px}
  .ldh-h{font-size:clamp(23px,7cqi,34px)}
  .ldh-p{font-size:13px}
  .ldh-b{justify-content:center;margin-top:2px}
  .ldh-b .btn{padding:7px 14px;font-size:13px}
  .ldh-i{position:absolute;left:9%;right:9%;bottom:0;height:88px}
}
</style>
<div class="ldh"><div class="ldh-w">
  <div class="ldh-t">
    <span class="ldh-e">New: member areas are here</span>
    <h2 class="ldh-h" style="margin:0"></h2>
    <p class="ldh-p">Write in one editor, ship to a global edge network, and keep every page under a second without touching a build step.</p>
    <div class="ldh-b"><button class="btn ink">Start free</button><button class="btn">See how it works</button></div>
  </div>
  <div class="ldh-i card" role="img" aria-label="Dashboard showing 12,408 visitors in the last 7 days, up 18 percent">
    <div class="ldh-bar"><i class="ldh-logo"></i><span class="ldh-nm">Field Notes</span><span class="ldh-st">Published</span></div>
    <div class="ldh-bd">
      <div class="ldh-nv"><span class="on">Pages</span><span>Posts</span><span>Members</span><span>Settings</span></div>
      <div class="ldh-mn"><span class="ldh-k">Visitors, last 7 days</span><div class="ldh-v"><b>12,408</b><span>+18%</span></div>
        <svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 46L25 40L50 43L75 30L100 34L125 20L150 24L175 10L200 14V60H0Z" fill="var(--accent-tint)"/><path d="M0 46L25 40L50 43L75 30L100 34L125 20L150 24L175 10L200 14" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>
        <div class="ldh-r"><span>Pricing</span><span class="num">3,214</span></div><div class="ldh-r"><span>Journal</span><span class="num">2,087</span></div></div>
    </div>
  </div>
</div></div>
<button class="btn ldh-rp" aria-label="Replay entrance" style="position:absolute;top:10px;right:12px;z-index:2">Replay</button>`,
  desc:'Order: eyebrow, then the headline words 40ms apart, then the supporting line, then both buttons together, then the product image rises 28px with a slight scale from 0.98. Everything settles in about one second and then holds perfectly still. It plays again whenever it scrolls back into view.',
  api:'t = [eyebrow 0, words .10 + i·.04, support .40, buttons .52, image .62 (soft)]   item.set(prog(t, t0 + delay))',
  init(st){
    const eb = $(st,'.ldh-e'), hh = $(st,'.ldh-h'), sp = $(st,'.ldh-p'), br = $(st,'.ldh-b'), im = $(st,'.ldh-i');
    hh.innerHTML = 'Publish pages that load before you blink'.split(' ').map(w => `<span style="display:inline-block">${w}</span>`).join(' ');
    const ws = $$(hh,'span'), D = { eb:0, w:.1, step:.04, sp:.4, br:.52, im:.62 };
    let t0 = 0, last = -9, fin = false;
    const start = t => { t0 = t; fin = false; };
    $(st,'.ldh-rp').onclick = () => start(now() + .05);
    return t => {
      // a gap in frames means the tile was off screen: play again on return
      if (t - last > .3) start(t); last = t;
      if (fin) return;
      const end = t > t0 + 1.3, e = (d, c = S.base) => end ? 1 : clamp(prog(t, t0 + d, c));
      let p = e(D.eb); fade(eb, p, (1-p)*8);
      ws.forEach((w,i) => { p = e(D.w + i*D.step); fade(w, p, (1-p)*10); });
      p = e(D.sp); fade(sp, p, (1-p)*8);
      p = e(D.br); fade(br, p, (1-p)*8);
      p = e(D.im, S.soft);
      im.style.opacity = p.toFixed(3);
      im.style.transform = `translateY(${px((1-p)*28)}) scale(${(.98 + .02*p).toFixed(4)})`;
      im.style.filter = p < .98 ? `blur(${((1-p)*BLUR).toFixed(2)}px)` : 'none';
      if (end) fin = true;
    };
  }});

/* ---------- Scroll-linked features ---------- */
atom({ id:'scrollfeatures', cat:'Landing', name:'Scroll-linked features', block:'feature-grid, image, timeline', fam:['M','S','E'], wide:true, tall:true,
  html:`<style>
.lds{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--line) transparent}
.lds-g{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px;max-width:940px;margin:0 auto;padding:0 20px}
.lds-f{height:200px;display:flex;flex-direction:column;justify-content:center;gap:6px;min-width:0}
.lds-n{font:500 12px var(--mono);color:var(--accent)}
.lds-h{margin:0;font-size:19px;line-height:1.2;letter-spacing:-.02em;font-weight:600}
.lds-p{margin:0;font-size:13.5px;line-height:1.5;color:var(--muted)}
.lds-v{position:relative;min-width:0}
.lds-s{position:sticky;height:220px;border-radius:16px;background:var(--bg);border:1px solid var(--line);overflow:hidden}
.lds-sh{position:absolute;left:0;top:0;border:1px solid var(--line);overflow:hidden}
.lds-ly{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;white-space:nowrap}
.lds-ly i{display:block}
.lds-dt{position:absolute;left:0;right:0;bottom:12px;display:flex;justify-content:center}
.lds-dt>div{position:relative;display:flex;gap:10px}
.lds-dt button{position:relative;width:8px;height:8px;padding:0;border:0;border-radius:4px;background:var(--line);cursor:pointer}
.lds-dt button::before{content:"";position:absolute;inset:-9px -4px}
.lds-bar{position:absolute;top:0;height:8px;border-radius:4px;background:var(--ink);pointer-events:none}
@media (max-width:480px){.lds-h{font-size:16px}.lds-p{font-size:12.5px}.lds-g{gap:14px;padding:0 16px}}
</style>
<div class="lds" tabindex="0" role="region" aria-label="Product features. Scroll to step through them.">
  <div class="lds-g"><div class="lds-l"></div>
    <div class="lds-v"><div class="lds-s">
      <div class="lds-sh" aria-hidden="true">
        <div class="lds-ly" style="color:var(--ink)"><div style="width:76%;display:flex;flex-direction:column;gap:8px"><i style="height:10px;width:52%;border-radius:3px;background:var(--ink)"></i><i style="height:6px;border-radius:3px;background:var(--line)"></i><i style="height:6px;width:92%;border-radius:3px;background:var(--line)"></i><i style="height:6px;width:68%;border-radius:3px;background:var(--line)"></i><i style="height:12px;width:2px;background:var(--accent)"></i></div></div>
        <div class="lds-ly" style="color:var(--bg)"><b style="font-size:26px;letter-spacing:-.03em;font-weight:600">0.4s</b><span style="font-size:11px">page load</span></div>
        <div class="lds-ly" style="color:var(--bg)"><b style="font-size:20px;letter-spacing:-.02em;font-weight:600">1,284</b><span style="font-size:11px">readers today</span><div style="display:flex;align-items:flex-end;gap:5px;height:38px;margin-top:4px"><i style="width:9px;height:40%;border-radius:2px;background:var(--bg);opacity:.5"></i><i style="width:9px;height:65%;border-radius:2px;background:var(--bg);opacity:.5"></i><i style="width:9px;height:50%;border-radius:2px;background:var(--bg);opacity:.5"></i><i style="width:9px;height:100%;border-radius:2px;background:var(--bg)"></i></div></div>
        <div class="lds-ly" style="color:var(--ink);flex-direction:row;gap:8px"><b style="font-size:14px;font-weight:600">Pay $24.00</b></div>
      </div>
      <div class="lds-dt"><div></div></div>
    </div></div>
  </div>
</div>`,
  desc:'Whichever feature crosses the panel\u2019s middle brightens and the rest dim. The sticky visual retargets from the scroll position: its shape, size, radius and color morph to the new feature on a soft spring while the inner content swaps out then in. The step indicator\u2019s leading edge moves first and the trailing edge follows 60ms later.',
  api:'i = round(scrollTop / itemH)   w[k].set(k === i, S.soft)   shape = Σ w[k]·state[k] / Σ w   ind.go(l, r)',
  init(st){
    const sc = $(st,'.lds'), fl = $(st,'.lds-l'), sv = $(st,'.lds-s'), shp = $(st,'.lds-sh'), ly = $$(shp,'.lds-ly'), box = $(st,'.lds-dt > div');
    const F = [
      ['Edit the page itself','Click any heading or paragraph and type. There is no separate preview to refresh.'],
      ['Publish in under a second','Changes go out to the edge as you save, so a new page is live before you switch tabs.'],
      ['See who is reading','Every page shows readers, scroll depth and where visitors came from, with no script to install.'],
      ['Get paid on the page','Add a price to any page and members check out right where they are reading.'] ];
    fl.innerHTML = F.map(([h,p],i) => `<div class="lds-f"><span class="lds-n">0${i+1}</span><h3 class="lds-h"></h3><p class="lds-p"></p></div>`).join('');
    const feats = $$(fl,'.lds-f'); feats.forEach((f,i) => { $(f,'h3').textContent = F[i][0]; $(f,'p').textContent = F[i][1]; });
    box.innerHTML = F.map((f,i) => `<button aria-label="Show feature ${i+1}: ${f[0]}"></button>`).join('') + '<i class="lds-bar"></i>';
    const dots = $$(box,'button'), bar = $(box,'.lds-bar');
    const IH = 200, SH = 220, N = F.length, C = ['var(--card)','var(--accent)','var(--ink)','var(--accent-tint)'];
    const Wt = F.map((_,i) => new Track(i ? 0 : 1, S.soft)), Bt = F.map((_,i) => new Track(i ? 0 : 1)), sw = new Swap(0), ed = edges(0,8);
    let act = 0, dims = { w:0, h:0 };
    const geo = i => [dots[i].offsetLeft, dots[i].offsetLeft + 8];
    const mark = () => { feats.forEach((f,k) => k === act ? f.setAttribute('aria-current','true') : f.removeAttribute('aria-current')); dots.forEach((d,k) => d.setAttribute('aria-current', k === act)); };
    const setAct = i => { act = i; Wt.forEach((w,k) => w.set(k === i ? 1 : 0, S.soft)); Bt.forEach((b,k) => b.set(k === i ? 1 : 0, S.base)); sw.to(i); ed.go(...geo(i)); mark(); };
    const layout = () => { const H = sc.clientHeight; if (!H) return;
      fl.style.padding = `${px(Math.max(0,(H - IH)/2))} 0`; sv.style.top = px((H - SH)/2);
      dims = { w:sv.clientWidth, h:sv.clientHeight }; ed.jump(...geo(act)); };
    sc.addEventListener('scroll', () => { const i = clamp(Math.round(sc.scrollTop/IH), 0, N-1); if (i !== act) setAct(i); }, { passive:true });
    dots.forEach((d,i) => d.onclick = () => sc.scrollTo({ top:i*IH, behavior:REDUCE ? 'auto' : 'smooth' }));
    new ResizeObserver(layout).observe(sc); document.fonts.ready.then(layout); requestAnimationFrame(layout); layout(); mark();
    return t => {
      const W = dims.w, H = dims.h; if (!W) return;
      const m = Math.min(H*.62, W*.78);
      const G = [[Math.min(W*.82, 300), H*.6, 12], [m, m, m/2], [Math.min(H*.42, W*.6), H*.7, 22], [Math.min(W*.86, 280), 52, 26]];
      const w = Wt.map(x => Math.max(0, x.at(t))), sum = w.reduce((a,b) => a + b, 0) || 1;
      let gw = 0, gh = 0, gr = 0, col = C[0], cw = w[0];
      w.forEach((x,k) => { gw += x*G[k][0]; gh += x*G[k][1]; gr += x*G[k][2]; if (k){ cw += x; if (x > .002) col = `color-mix(in oklab, ${C[k]} ${(x/cw*100).toFixed(1)}%, ${col})`; } });
      gw /= sum; gh /= sum; gr /= sum;
      Object.assign(shp.style, { width:px(gw), height:px(gh), borderRadius:px(gr), background:col, transform:`translate(${px((W - gw)/2)},${px(H*.44 - gh/2)})` });
      ly.forEach((el,k) => sw.apply(el, k, t));
      feats.forEach((f,k) => f.style.opacity = (.38 + .62*clamp(Bt[k].at(t))).toFixed(3));
      const a = ed.A.at(t), b = ed.B.at(t); bar.style.left = px(a); bar.style.width = px(b - a);
    };
  }});

/* ---------- Testimonial wall ---------- */
atom({ id:'testimonialwall', cat:'Landing', name:'Testimonial wall', block:'testimonial, reviews, collection', fam:['M','E','X'], wide:true, tall:true,
  html:`<style>
.ldt{position:absolute;inset:0;display:flex;flex-direction:column;gap:10px;padding-top:12px}
.ldt-fr{padding:0 16px;display:flex;flex:none}
.ldt-sc{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:2px 16px 0;scrollbar-width:thin;scrollbar-color:var(--line) transparent}
.ldt-cg{position:relative;margin-bottom:16px}
.ldt-cd{position:absolute;left:0;top:0;overflow:hidden}
.ldt-in{display:block;width:100%;text-align:left;background:none;border:0;padding:16px;cursor:pointer;font:inherit;color:inherit;position:relative}
.ldt-in:focus-visible{outline-offset:-3px}
.ldt-in>span,.ldt-q2w,.ldt-rlw{display:block}
.ldt-qm{font-size:30px;line-height:.7;height:18px;color:var(--accent);font-weight:600}
.ldt-q1{font-size:15px;line-height:1.4;font-weight:500;letter-spacing:-.01em;padding-right:22px}
.ldt-q2w{overflow:hidden;height:0}
.ldt-q2{display:block;padding-top:8px;font-size:13.5px;line-height:1.5;color:var(--muted)}
.ldt-rw{display:flex!important;align-items:center;margin-top:12px}
.ldt-av{flex:none;width:0;height:32px;border-radius:50%;background:var(--accent-tint);color:var(--accent);font-size:12px;font-weight:600;display:grid;place-items:center;overflow:hidden;opacity:0}
.ldt-wh{display:block;min-width:0}
.ldt-nm{display:block;font-size:13.5px;line-height:18px;font-weight:600}
.ldt-rlw{overflow:hidden;height:0}
.ldt-rl{display:block;font-size:12.5px;line-height:16px;color:var(--muted)}
.ldt-ch{position:absolute;top:14px;right:14px;color:var(--faint);display:flex}
</style>
<div class="ldt"><div class="ldt-fr"><div class="seg ldt-sg" role="group" aria-label="Filter testimonials"><div class="ind"></div><button>All</button><button>Writers</button><button>Studios</button><button>Shops</button></div></div>
<div class="ldt-sc"><div class="ldt-cg"></div></div></div>`,
  desc:'Choosing a filter blurs out the cards that no longer match, right where they are. The remaining cards spring to their new slots, staggered 30ms by slot, and the wall height follows. Opening a quote first collapses any other open one, then grows the card in place; only the cards beneath it in the same column move.',
  api:'card.{x,y}.set(slot(i), S.base, t + i·.03)   card.o.set(match)   other.open → close, then card.e.set(1); card.h = h0 + e·(h1 − h0)',
  init(st){
    const seg = $(st,'.ldt-sg'), ind = $(seg,'.ind'), btns = $$(seg,'button'), sc = $(st,'.ldt-sc'), cg = $(st,'.ldt-cg');
    const Q = [
      ['Writers','Priya Raman','Essayist, Field Notes','PR','I stopped fighting my own site and started writing again.','The editor looks like the page, so I catch awkward line breaks as I type. My whole newsletter archive moved over in an afternoon and nothing broke.'],
      ['Studios','Jonas Berg','Creative director, North Studio','JB','We shipped a full redesign in a week, with no developer in the loop, and the client signed off on the first round.','Case studies, a client login and the contact form all live in one place now. Our proposals link to real pages instead of PDFs.'],
      ['Shops','Ada Okafor','Founder, Loop Press','AO','Members pay without a second tool.','Checkout sits on the same page as the product story. Refunds are two clicks, and our support inbox got quieter within a month.'],
      ['Writers','Sam Whitfield','Poet and editor','SW','Pages load instantly, even on my oldest phone, which is exactly how I read.','Readers write to say the site feels calm. I never opened a settings panel to get there.'],
      ['Studios','Mei Tan','Founder, Plate and Pixel','MT','Clients can edit their own pages, so I stopped being the bottleneck.','I set the layout once and hand over a site with guard rails. Their edits take minutes, and I get to design the next project.'],
      ['Shops','Diego Alvarez','Owner, Ridgeline Ceramics','DA','Our drop sold out in nine minutes and the site never blinked.','Inventory counts update live on the page, and the waitlist form feeds our mailing list. It was the calmest launch day we have had.'] ];
    const cards = Q.map(([k,nm,rl,ini,q1,q2], i) => { const c = document.createElement('div'); c.className = 'card ldt-cd';
      c.innerHTML = `<button class="ldt-in" aria-expanded="false"><span class="ldt-qm" aria-hidden="true">&ldquo;</span><span class="ldt-q1"></span><span class="ldt-q2w"><span class="ldt-q2"></span></span><span class="ldt-rw"><span class="ldt-av" aria-hidden="true"></span><span class="ldt-wh"><b class="ldt-nm"></b><span class="ldt-rlw"><span class="ldt-rl"></span></span></span></span><span class="ldt-ch" aria-hidden="true">${ic(I.chev, 16)}</span></button>`;
      $(c,'.ldt-q1').textContent = q1; $(c,'.ldt-q2').textContent = q2; $(c,'.ldt-nm').textContent = nm; $(c,'.ldt-rl').textContent = rl; $(c,'.ldt-av').textContent = ini;
      cg.appendChild(c);
      return { i, c, k, btn:$(c,'.ldt-in'), q2w:$(c,'.ldt-q2w'), q2:$(c,'.ldt-q2'), rlw:$(c,'.ldt-rlw'), rl:$(c,'.ldt-rl'), av:$(c,'.ldt-av'), ch:$(c,'.ldt-ch svg'),
        x:new Track(0), y:new Track(0), o:new Track(1), e:new Track(0), open:false, h0:100, h1:200, q2H:0, rlH:0 }; });
    const GAP = 12, Ht = new Track(0), ed = edges(0,0); let f = 'All', q = [], want = null, lastW = 0;
    const applyP = (c, p) => { p = clamp(p);
      c.q2w.style.height = px(p*c.q2H); fade(c.q2, p, (1-p)*-6);
      c.rlw.style.height = px(p*c.rlH); fade(c.rl, p, null);
      c.av.style.width = px(32*p); c.av.style.marginRight = px(10*p); c.av.style.opacity = p.toFixed(3);
      c.ch.style.transform = `rotate(${(p*180).toFixed(1)}deg)`; c.c.style.height = px(c.h0 + p*(c.h1 - c.h0)); };
    const measure = cw => cards.forEach(c => { c.c.style.width = px(cw); applyP(c, 0);
      c.h0 = c.btn.offsetHeight; c.q2H = c.q2.offsetHeight; c.rlH = c.rl.offsetHeight; c.h1 = c.h0 + c.q2H + c.rlH; });
    const layout = (inst, stag = .03) => {
      const W = cg.clientWidth; if (!W) return;
      const cols = W >= 720 ? 3 : W >= 480 ? 2 : 1, cw = (W - (cols-1)*GAP)/cols, t0 = now();
      if (inst || W !== lastW){ measure(cw); lastW = W; }
      const A = Array(cols).fill(0), Y = Array(cols).fill(0); let n = 0;
      cards.forEach(c => { const on = f === 'All' || c.k === f;
        if (on){ let col = 0; for (let j = 1; j < cols; j++) if (A[j] < A[col] - .5) col = j;
          const x = col*(cw + GAP), y = Y[col], jump = inst || c.o.target === 0;
          if (jump){ c.x.jump(x); c.y.jump(y); } else { c.x.set(x, S.base, t0 + n*stag); c.y.set(y, S.base, t0 + n*stag); }
          A[col] += c.h0 + GAP; Y[col] += (c.open ? c.h1 : c.h0) + GAP; n++; }
        inst ? c.o.jump(on ? 1 : 0) : c.o.set(on ? 1 : 0, on ? S.base : S.snap, on ? t0 + EXIT : t0);
        c.c.inert = !on; });
      const h = Math.max(0, ...Y) - GAP; inst ? Ht.jump(Math.max(0,h)) : Ht.set(Math.max(0,h)); };
    const setOpen = (c, v) => { c.open = v; c.e.set(v ? 1 : 0, S.base); c.btn.setAttribute('aria-expanded', v); if (v) want = c.i; };
    const toggle = c => { q = []; want = null;
      if (c.open){ setOpen(c, false); layout(false, 0); return; }
      const o = cards.find(x => x.open);
      if (o){ setOpen(o, false); layout(false, 0); q.push([now() + .08, () => { setOpen(c, true); layout(false, 0); }]); }
      else { setOpen(c, true); layout(false, 0); } };
    cards.forEach(c => { c.btn.onclick = () => toggle(c); c.btn.onkeydown = ev => { if (ev.key === 'Escape' && c.open){ ev.stopPropagation(); setOpen(c, false); layout(false, 0); } }; });
    const geo = b => [b.offsetLeft, b.offsetLeft + b.offsetWidth];
    const sel = (i, inst) => { f = btns[i].textContent; q = [];
      btns.forEach((b,j) => b.setAttribute('aria-pressed', i === j));
      cards.forEach(c => { if (c.open && f !== 'All' && c.k !== f) setOpen(c, false); });
      inst ? ed.jump(...geo(btns[i])) : ed.go(...geo(btns[i])); layout(inst); };
    btns.forEach((b,i) => b.onclick = () => sel(i));
    const init = () => { sel(btns.findIndex(b => b.textContent === f), true); }; document.fonts.ready.then(init); requestAnimationFrame(init); init();
    new ResizeObserver(() => { if (cg.clientWidth && cg.clientWidth !== lastW) layout(true); }).observe(sc);
    return t => {
      while (q.length && q[0][0] <= t) q.shift()[1]();
      const a = ed.A.at(t), b = ed.B.at(t); Object.assign(ind.style, { transform:`translate(${px(a)},3px)`, width:px(b - a), height:'calc(100% - 6px)' });
      cg.style.height = px(Ht.at(t));
      cards.forEach(c => { const p = c.e.at(t), o = c.o.at(t); applyP(c, p);
        c.c.style.transform = `translate(${px(c.x.at(t))},${px(c.y.at(t))})`; fade(c.c, o, null); c.c.style.visibility = o < .01 ? 'hidden' : 'visible'; });
      if (want !== null && cards[want].e.at(t) > .97){ const c = cards[want], bottom = c.y.target + c.h1; want = null;
        if (bottom > sc.scrollTop + sc.clientHeight - 8) sc.scrollTo({ top:bottom - sc.clientHeight + 12, behavior:REDUCE ? 'auto' : 'smooth' }); }
    };
  }});
}