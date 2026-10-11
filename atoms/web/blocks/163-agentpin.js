

/* ---------- Agent activity (organisms): an AI agent reviews a running site while a person watches ---------- */
/* Grounded in the review tool: attributed pins (author "label · last six of the agent id · agent"),
   Browse / Comment modes, "Pin this frame", saved screenshots with normalized bounds, "Recorded element" selector,
   pin status open / resolved / conflict, "Follow" / "My view", and the public `report` progress line. Severity chips,
   suggested edits and the decision card are proposed extensions that sit on the same pin discussion. */
(() => {
const mk = (tag, css, html) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; };
const hx = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// clock-based timed sequence: [time, fn] drained at the top of render
const queue = () => { const q = []; return {
  at: (dt, fn) => q.push([now() + dt, fn]),
  run: t => { for (let i = 0; i < q.length;){ if (q[i][0] <= t){ const f = q.splice(i, 1)[0][1]; f(); } else i++; } },
  clear: () => { q.length = 0; } }; };

/* ---- shared vocabulary: agent identity, severity, the page under review ---- */
const AGENT = { name:'Assistant', id:'7c41d2' };
const SPARK = '<path d="M12 4v16M12 4c6 2.5 6 13.5 0 16M4.6 14.1l14.8-3.2"/>';
const SEV = {
  block:{ l:'Blocking', i:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>' },
  warn:{ l:'Should fix', i:'<path d="M12 4 21 20H3z"/><path d="M12 10v4.5M12 17.5h.01"/>' },
  info:{ l:'Suggestion', i:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5h.01"/>' } };
const SEVC = { block:'var(--danger)', warn:'var(--warning)', info:'var(--muted)' };
const SEVT = { block:'var(--danger-tint)', warn:'var(--warning-tint)', info:'var(--raised)' };
const chip = (p, k) => `<span class="${p}-chip" data-sev="${k}">${ic(SEV[k].i, 12, 2)}${SEV[k].l}</span>`;
// agents are rounded squares, people are circles
const agentMark = (p, s = 22) => `<span class="${p}-am" aria-hidden="true" style="width:${s}px;height:${s}px;border-radius:${Math.round(s * .32)}px">${ic(SPARK, Math.round(s * .66), 2.2)}</span>`;
const person = (p, ini, s = 22) => `<span class="${p}-pe" aria-hidden="true" style="width:${s}px;height:${s}px;font-size:${s > 22 ? 10 : 9}px">${ini}</span>`;
const agentLine = p => `<span class="${p}-an"><b>${AGENT.name}</b><span class="${p}-ln"><span class="${p}-id">${AGENT.id}</span><span class="${p}-tag">Agent</span></span></span>`;

const CSS = `
.§-root{position:absolute;inset:12px;display:flex;flex-direction:column;gap:8px;min-width:0}
.§-bar{flex:none;display:flex;align-items:center;gap:10px;min-height:32px}
.§-bar .btn{padding:4px 10px;font-size:12.5px;white-space:nowrap}
.§-who{display:flex;align-items:center;gap:8px;min-width:0}
.§-am{flex:none;display:grid;place-items:center;background:var(--ink);color:var(--card)}
.§-pe{flex:none;display:grid;place-items:center;border-radius:50%;background:var(--accent);color:var(--card);font-weight:600}
.§-an{display:flex;flex-direction:column;min-width:0;line-height:1.2}
.§-an b{font-size:13px;font-weight:600;white-space:nowrap}
.§-ln{display:flex;align-items:center;gap:6px;min-width:0}
.§-id{font:11px/1 var(--mono);color:var(--muted)}
.§-tag{display:inline-flex;align-items:center;height:16px;padding:0 5px;border-radius:5px;border:0;background:var(--raised);font-size:10.5px;font-weight:600;color:var(--muted)}
.§-chip{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 7px;border-radius:6px;border:0;background:var(--raised);font-size:11.5px;font-weight:600;white-space:nowrap;flex:none}
.§-chip[data-sev=block]{color:var(--danger);background:var(--danger-tint);border-color:var(--danger)}
.§-chip[data-sev=warn]{color:var(--warning);background:var(--warning-tint);border-color:var(--warning)}
.§-chip[data-sev=info]{color:var(--muted);background:var(--raised);border-color:var(--muted)}
.§-root .dl,.§-pn .dl{line-height:1.25}
.§-sel{font:11.5px/1.3 var(--mono);color:var(--muted);overflow-wrap:anywhere}
.§-st{position:relative;flex:1 1 0;min-width:0;height:18px;font-size:12.5px;color:var(--muted)}
.§-st>span{position:absolute;left:0;top:0;right:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.§-st .§-sel{font-size:12px}
.§-root[data-n="1"] .§-st,.§-root[data-n="1"] .§-id{display:none}
/* the page under review */
.§-fr{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.§-ub{flex:none;height:30px;display:flex;align-items:center;padding:0 10px;border-bottom:1px solid var(--line-soft);background:var(--tile)}
.§-url{font:11.5px/1 var(--mono);color:var(--muted);background:var(--raised);border-radius:7px;padding:5px 10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.§-pg{position:relative;flex:1;min-height:0;overflow:hidden;container-type:inline-size;background:var(--card)}
.§-ct{position:absolute;left:0;top:0;width:100%}
.§-ov{position:absolute;inset:0;pointer-events:none}
.§-ov>*{pointer-events:auto}
.§-nav{display:flex;align-items:center;gap:14px;height:44px;padding:0 18px;border-bottom:1px solid var(--line-soft);font-size:12.5px;color:var(--muted)}
.§-logo{color:var(--ink);font-weight:600;font-size:14px;letter-spacing:-.01em;margin-right:6px}
.§-hero{display:grid;grid-template-columns:1.1fr 1fr;gap:22px;align-items:center;padding:26px 18px 22px}
.§-h1{margin:0;font-size:27px;line-height:1.08;letter-spacing:-.03em;font-weight:600;text-wrap:balance}
.§-sub{margin:10px 0 0;font-size:13.5px;line-height:1.5;color:var(--muted);max-width:40ch}
.§-bt{display:flex;align-items:center;gap:12px;margin-top:16px;flex-wrap:wrap}
.§-cta{border:0;border-radius:9px;padding:0 16px;height:36px;font:600 13px var(--sans);color:var(--card);background:color-mix(in oklab,var(--accent) 62%,var(--card));white-space:nowrap}
.§-sec{font-size:13px;font-weight:500}
.§-art{height:150px;border-radius:12px;background:var(--raised);overflow:hidden}
.§-prc{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:4px 18px 20px}
.§-pc{border:0;border-radius:12px;padding:14px;background:var(--card)}
.§-pn{font-size:12px;color:var(--muted);font-weight:500}
.§-pr{display:flex;align-items:baseline;gap:5px;margin:4px 0 8px;white-space:nowrap}
.§-pv{font-size:24px;font-weight:600;letter-spacing:-.03em}
.§-pu{font-size:11.5px;color:var(--muted)}
.§-pl{margin:0;padding:0;list-style:none;font-size:12px;color:var(--muted);display:grid;gap:5px}
.§-nws{margin:0 18px 18px;padding:14px 16px;border-radius:12px;background:var(--tile);border:0;display:flex;gap:12px 16px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.§-nws b{font-size:13.5px;font-weight:600}
.§-ns{font-size:12px;color:var(--muted);margin-top:2px}
.§-fm{display:flex;gap:8px;flex:1 1 220px;max-width:340px;min-width:0}
.§-em{flex:1;min-width:0;height:34px;border:1.5px solid var(--muted);border-radius:8px;background:var(--card);padding:0 10px;font:13px var(--sans);color:var(--ink)}
.§-sx{height:34px;border:0;border-radius:8px;background:var(--ink);color:var(--card);padding:0 12px;font:600 12.5px var(--sans)}
.§-sf{display:flex;gap:14px;padding:12px 18px 16px;font-size:11.5px;color:var(--muted);border-top:1px solid var(--line-soft)}
@container (max-width:560px){.§-hero{grid-template-columns:1fr;padding-top:18px;gap:16px}.§-art{height:104px}.§-prc{grid-template-columns:1fr}.§-h1{font-size:23px}.§-nl{display:none}}
/* pins and cards: agents are rounded squares, people are circles */
.§-pw{position:absolute;left:0;top:0;width:0;height:0}
.§-pin{position:absolute;left:-13px;top:-13px;width:26px;height:26px;padding:0;border:0;border-radius:8px;background:var(--ink);color:var(--card);font:600 11.5px var(--sans);cursor:pointer;display:grid;place-items:center}
.§-pin>span{grid-area:1/1}
.§-pd{position:absolute;right:-4px;top:-4px;width:10px;height:10px;border-radius:50%;box-shadow:0 0 0 2px var(--card);pointer-events:none}
.§-ck{position:absolute;left:0;top:0;overflow:hidden;z-index:30;visibility:hidden}
.§-cc{position:absolute;left:0;top:0}
`;
const css = p => CSS.replaceAll('§', p);

const SITE = `<header class="§-nav"><b class="§-logo">Fieldnote</b><span>Product</span><span class="§-nl">Pricing</span><span class="§-nl">Docs</span><i style="flex:1"></i><span>Sign in</span></header>
<section class="§-hero"><div><h2 class="§-h1" data-k="h1">Notes your whole team can trust</h2><p class="§-sub" data-k="sub">Fieldnote helps teams to collaborate on notes more easier.</p><div class="§-bt"><button type="button" class="§-cta" data-k="cta">Start free trial</button><span class="§-sec">Book a demo</span></div></div>
<div class="§-art" data-k="art"><svg viewBox="0 0 220 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><rect x="22" y="58" width="26" height="46" rx="5" fill="var(--faint)"/><rect x="60" y="38" width="26" height="66" rx="5" fill="var(--muted)"/><rect x="98" y="24" width="26" height="80" rx="5" fill="var(--accent)"/><rect x="136" y="46" width="26" height="58" rx="5" fill="var(--muted)"/><rect x="174" y="30" width="26" height="74" rx="5" fill="var(--ink)"/></svg></div></section>
<section class="§-prc"><article class="§-pc"><div class="§-pn">Free</div><div class="§-pr"><span class="§-pv">$0</span><span class="§-pu">forever</span></div><ul class="§-pl"><li>Unlimited notes</li><li>Share links</li><li>7-day history</li></ul></article>
<article class="§-pc" data-k="plan"><div class="§-pn">Team</div><div class="§-pr"><span class="§-pv">$12</span><span class="§-pu">per seat per month</span></div><ul class="§-pl"><li>Everything in Free</li><li>Shared workspaces</li><li>90-day history</li></ul></article>
<article class="§-pc"><div class="§-pn">Business</div><div class="§-pr"><span class="§-pv">$24</span><span class="§-pu">per seat per month</span></div><ul class="§-pl"><li>Everything in Team</li><li>Single sign-on</li><li>Audit log</li></ul></article></section>
<section class="§-nws"><div><b>Product updates, once a month</b><div class="§-ns">No spam. Unsubscribe any time.</div></div><div class="§-fm"><input class="§-em" data-k="email" placeholder="Work email"><button type="button" class="§-sx">Subscribe</button></div></section>
<footer class="§-sf"><span>Privacy</span><span>Terms</span><span>Status</span></footer>`;
const siteFrame = (p, url = 'localhost:3000/pricing') => `<div class="${p}-fr card"><div class="${p}-ub"><span class="${p}-url">${url}</span></div><div class="${p}-pg"><div class="${p}-ct">${SITE.replaceAll('§', p)}</div><div class="${p}-ov"></div></div></div>`;

// element rect in the overlay's coordinates, read live so pins follow the page while it scrolls
const liveRect = (ov, el) => { const r = el.getBoundingClientRect(), o = ov.getBoundingClientRect(); return { x:r.left - o.left, y:r.top - o.top, w:r.width, h:r.height }; };
class Site {
  constructor(root, p){
    this.fr = $(root, '.' + p + '-fr'); this.pg = $(this.fr, '.' + p + '-pg'); this.ct = $(this.pg, '.' + p + '-ct'); this.ov = $(this.pg, '.' + p + '-ov');
    this.els = {}; $$(this.ct, '[data-k]').forEach(e => this.els[e.dataset.k] = e); this.sc = new Track(0, S.soft); this.cover = 0;
  }
  max(){ return Math.max(0, this.ct.offsetHeight - this.pg.clientHeight + this.cover); }
  // scroll that puts an element at about 40% of the visible page (cover = height hidden by a sheet at the bottom)
  want(k){ const r = this.els[k].getBoundingClientRect(), c = this.ct.getBoundingClientRect(); return clamp(r.top - c.top + r.height / 2 - (this.pg.clientHeight - this.cover) * .4, 0, this.max()); }
  go(k, inst){ const y = this.want(k), moved = Math.abs(y - this.sc.target) > 4; inst ? this.sc.jump(y) : this.sc.set(y); return moved; }
  draw(t){ this.ct.style.transform = `translateY(${px(-Math.min(this.sc.at(t), this.max()))})`; }
  rect(k){ return liveRect(this.ov, this.els[k]); }
}
// four edges chase a live target; the leading edges start first, the trailing ones follow after LAG
class Box {
  constructor(){ this.f = [0, 0, 0, 0]; this.p = [0, 1, 2, 3].map(() => new Track(1)); this.o = new Track(0, S.snap); }
  go(from, to, t0 = now()){
    this.f = [from.x, from.y, from.x + from.w, from.y + from.h];
    const dx = (to.x + to.w / 2) - (from.x + from.w / 2), dy = (to.y + to.h / 2) - (from.y + from.h / 2), lead = [dx < 0, dy < 0, dx >= 0, dy >= 0];
    this.p.forEach((q, i) => { q.jump(0); q.set(1, S.base, t0 + (lead[i] ? 0 : LAG)); });
  }
  at(t, to){
    const [a, b, c, d] = this.p.map(q => clamp(q.at(t), -.2, 1.2)), x1 = lerp(this.f[0], to.x, a), y1 = lerp(this.f[1], to.y, b), x2 = lerp(this.f[2], to.x + to.w, c), y2 = lerp(this.f[3], to.y + to.h, d);
    return { x:Math.min(x1, x2), y:Math.min(y1, y2), w:Math.abs(x2 - x1), h:Math.abs(y2 - y1) };
  }
}
// a card that grows out of a pin: one rectangle morphs from the 26px pin to the card
const placeBeside = (ax, ay, w, h, W, H, r, gap = 14) => {
  const rx = r ? r.x + r.w : ax, lx = r ? r.x : ax;   // beside the element, not on top of it
  if (W - (rx + gap) >= w + 8) return { x:rx + gap, y:ay - 22 };
  if (lx - gap >= w + 8) return { x:lx - gap - w, y:ay - 22 };
  const below = (r ? r.y + r.h : ay) + 10;
  if (H - below >= h + 8) return { x:ax - w / 2, y:below };
  return { x:ax - w / 2, y:(r ? r.y : ay) - 10 - h };
};
// an agent pin: a rounded square with the project pin number and a severity dot; falls onto its element, turns to a check when resolved
class Pin {
  constructor(p, ov, f, before){
    this.f = f; this.state = 'open'; const w = this.wrap = mk('div'); w.className = p + '-pw';
    w.innerHTML = `<button type="button" class="${p}-pin" aria-expanded="false"><span class="${p}-n">${f.no}</span><span class="${p}-c">${ic(I.check, 13, 2.5)}</span><span class="${p}-q">${ic('<path d="M9 9.2a3 3 0 1 1 4.4 2.6c-.9.5-1.4 1-1.4 2.2M12 17.5h.01"/>', 14, 2.2)}</span><i class="${p}-pd" style="background:${SEVC[f.sev]}"></i></button>`;
    before ? ov.insertBefore(w, before) : ov.append(w);
    this.btn = $(w, 'button'); this.n = $(w, '.' + p + '-n'); this.c = $(w, '.' + p + '-c'); this.q = $(w, '.' + p + '-q'); this.dot = $(w, '.' + p + '-pd');
    this.fo = new Track(0, S.snap); this.fy = new Track(-28); this.rs = new Track(0); this.sel = new Track(0, S.snap); this.qm = new Track(0);
    this.fy.jump(-28); this.fy.set(0, S.base); this.fo.set(1);
  }
  label(on){ this.btn.setAttribute('aria-expanded', on); this.btn.setAttribute('aria-label', `Pin ${this.f.no}, ${SEV[this.f.sev].l}, ${AGENT.name}, ${this.state}`); }
  draw(t, x, y, on, vis = 1){
    const fo = clamp(this.fo.at(t)) * vis, fy = this.fy.at(t), rs = clamp(this.rs.at(t)), qm = clamp(this.qm.at(t)); if (this.sel.target !== (on ? 1 : 0)) this.sel.set(on ? 1 : 0); const s = clamp(this.sel.at(t));
    this.wrap.style.transform = `translate(${px(x)},${px(y)})`; this.wrap.style.zIndex = on ? 3 : 1;
    const b = this.btn.style; b.pointerEvents = fo > .5 ? 'auto' : 'none'; b.opacity = fo.toFixed(3); b.transform = `translateY(${px(fy)}) scale(${(.8 + .2 * fo).toFixed(3)})`;
    b.background = mix(rs, 'var(--success-tint)', 'var(--ink)'); b.color = mix(rs, 'var(--success)', 'var(--card)');
    b.boxShadow = `0 0 0 ${px(1.5 * rs)} ${mix(rs, 'var(--success)', 'transparent')}, 0 0 0 2px ${mix(s, 'var(--card)', 'transparent')}, 0 0 0 4px ${mix(s, 'var(--accent)', 'transparent')}, var(--shadow)`;
    this.n.style.opacity = (clamp(1 - rs * 2) * (1 - qm)).toFixed(3); this.c.style.opacity = clamp(rs * 2 - 1).toFixed(3); this.q.style.opacity = (qm * (1 - rs)).toFixed(3); this.dot.style.opacity = clamp(1 - rs * 2).toFixed(3);
  }
}
// crossfade many stacked layers through one Swap
const layers = (sw, els, t, amp = 3) => els.forEach((e, i) => sw.apply(e, i, t, amp));

/* ================================================================ 1. Agent pin and comment */
const FIND = [
  { k:'cta', sev:'block', sel:'button.cta-primary', no:7, text:'White text on this fill measures 2.9:1. WCAG AA needs 4.5:1 at this size. The accent fill measures 7.0:1.' },
  { k:'art', sev:'warn', sel:'img.hero-art', no:8, text:'This image has no alt text, so screen readers read out the file name. Describe the chart, or mark it decorative with alt="".' },
  { k:'plan', sev:'info', sel:'section.pricing article:nth-child(2)', no:9, text:'The Team plan has no marker, but the pricing doc calls it the default. A “Most popular” label would make the choice clear.' } ];

atom({ id:'agentpin', cat:'Agent activity', name:'Agent pin and comment', block:'Attributed pin discussion + Browse / Comment modes (Review workspace, Agents view)', fam:['M','E','X','S'], wide:true, tall:true,
  html:`<style>${css('apn')}
.apn-tf{position:absolute;left:0;top:0;border:1.5px solid var(--ink);border-radius:8px;pointer-events:none!important;z-index:2;visibility:hidden}
.apn-tg{position:absolute;left:-1.5px;font:11px/1 var(--mono);background:var(--ink);color:var(--card);padding:4px 6px;border-radius:5px;white-space:nowrap}
.apn-cu{position:absolute;left:0;top:0;z-index:4;pointer-events:none!important}
.apn-cl{position:absolute;left:13px;top:15px;background:var(--ink);color:var(--card);font-size:11px;font-weight:600;padding:3px 7px;border-radius:6px;white-space:nowrap}
.apn-cc{padding:12px}
.apn-hd{display:flex;align-items:center;gap:8px}
.apn-no{font-size:12px;color:var(--muted);font-weight:600}
.apn-x{border:0;background:none;color:var(--muted);padding:3px;border-radius:7px;cursor:pointer;display:grid;place-items:center}
.apn-rw{display:flex;align-items:center;flex-wrap:wrap;gap:6px 8px;margin-top:10px}
.apn-tx{margin:8px 0 0;font-size:13px;line-height:1.45;overflow-wrap:anywhere}
.apn-ft{display:flex;align-items:center;gap:10px;margin-top:12px}
.apn-sl{flex:1;font-size:12px;color:var(--muted)}
.apn-ft .btn{padding:4px 11px;font-size:12.5px}
</style><div class="apn-root">
  <div class="apn-bar"><span class="apn-who">${agentMark('apn', 26)}${agentLine('apn')}</span><span class="apn-st" role="status" aria-live="polite"><span>Reading the page</span><span></span><span></span></span><button type="button" class="btn apn-nx">Next finding</button><button type="button" class="btn apn-rp">Replay</button></div>
  ${siteFrame('apn')}</div>`,
  desc:'The agent scrolls the page to the element, its cursor glides over, and a selector frame snaps around the target with the leading edges first. Then the pin falls onto the element and only then does the comment card grow out of the pin, carrying the agent’s name, an Agent badge shaped differently from a person’s round avatar, a severity chip and the element selector. Resolving collapses the card back into the pin, which turns to a check.',
  api:'page.sc.set(y)   box.go(prev → target)   cursor.cp.set(1)   pin.fy.set(0) after fy = −28   card.o.set(1): rect lerp(pin 26×26 → card)   pin.rs.set(1) + card.o.set(0)',
  init(st){
    const root = $(st, '.apn-root'), site = new Site(st, 'apn'), ov = site.ov, bar = $(st, '.apn-bar'), stEls = $$(st, '.apn-st>span'), nx = $(st, '.apn-nx'), rp = $(st, '.apn-rp');
    const { at, run, clear } = queue(), stw = new Swap(0);
    const tf = mk('div'), tg = mk('span'), cu = mk('div'), ck = mk('div'), cc = mk('div');
    tf.className = 'apn-tf'; tg.className = 'apn-tg'; tf.append(tg);
    cu.className = 'apn-cu'; cu.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 8-6.2 1.6L9.6 19z" fill="var(--ink)" stroke="var(--card)" stroke-width="1.6" stroke-linejoin="round"/></svg><span class="apn-cl">${AGENT.name}</span>`;
    ck.className = 'apn-ck card'; ck.setAttribute('role', 'dialog'); cc.className = 'apn-cc'; ck.append(cc); ov.append(tf, cu, ck);
    const box = new Box(), cp = new Track(0, S.soft), cd = new Track(0, S.snap), co = new Track(0), ch = new Track(150), oxT = new Track(0), oyT = new Track(0);
    let pins = [], cur = null, sel = null, cardPin = null, W = 0, H = 0, CW = 280, started = false, idx = -1, lastBox = null, cs = { x:0, y:0 }, lastKey = '', tagFlip = false;
    const pad = r => ({ x:r.x - 4, y:r.y - 4, w:r.w + 8, h:r.h + 8 });
    const layout = () => { W = ov.clientWidth; H = ov.clientHeight; if (!W) return; root.dataset.n = st.clientWidth < 560 ? 1 : 0; CW = Math.round(clamp(W - 16, 220, 300)); cc.style.width = px(CW); lastKey = st.clientWidth + ':' + W + ':' + H; };
    const anchorOf = p => { const r = site.rect(p.f.k); return { x:clamp(r.x + r.w, 14, W - 14), y:clamp(r.y, 14, H - 14) }; };
    const fill = p => {
      const f = p.f, done = p.state === 'done';
      cc.innerHTML = `<div class="apn-hd">${agentMark('apn', 24)}${agentLine('apn')}<i style="flex:1"></i><span class="apn-no num">#${f.no}</span><button type="button" class="apn-x" aria-label="Close comment">${ic(I.x, 14)}</button></div><div class="apn-rw">${chip('apn', f.sev)}<span class="apn-sel">${hx(f.sel)}</span></div><p class="apn-tx">${hx(f.text)}</p><div class="apn-ft"><span class="apn-sl">${done ? 'Resolved' : 'Open · saved just now · 1 screenshot'}</span><button type="button" class="btn ${done ? '' : 'ink'} apn-rs">${done ? 'Reopen' : 'Resolve'}</button></div>`;
      $(cc, '.apn-x').onclick = () => close(true); $(cc, '.apn-rs').onclick = () => done ? reopen(p) : resolve(p);
      ck.setAttribute('aria-label', `Comment on pin ${f.no} by ${AGENT.name}`); ch.jump(cc.offsetHeight);
    };
    const makePin = f => { const p = new Pin('apn', ov, f, cu); p.btn.onclick = () => select(p); pins.push(p); return p; };
    function select(p){
      if (sel === p){ close(true); return; }
      const wasOpen = co.target === 1; sel = p; if (wasOpen) co.set(0, S.snap);
      at(wasOpen ? EXIT + .02 : 0, () => { if (sel === p) open(p); }); sync();
    }
    function open(p){
      cardPin = p; fill(p);
      const a = anchorOf(p), pl = placeBeside(a.x, a.y, CW, ch.target, W, H, site.rect(p.f.k)); oxT.jump(pl.x - a.x); oyT.jump(pl.y - a.y); co.set(1, S.base);
    }
    function close(focus){
      if (!sel) return; const p = sel; sel = null; co.set(0, S.base); sync();
      if (focus) at(.06, () => p.btn.focus({ preventScroll:true }));
    }
    function resolve(p){ p.state = 'done'; p.rs.set(1); sel = null; co.set(0, S.base); sync(); at(.3, () => p.btn.focus({ preventScroll:true })); }
    function reopen(p){ p.state = 'open'; p.rs.set(0); fill(p); }
    const sync = () => pins.forEach(p => p.label(p === sel));
    function show(i){
      clear(); close(false); idx = i; const f = FIND[i]; cur = f;
      if (i === 0){ pins.forEach(p => p.wrap.remove()); pins = []; }
      stEls[1].innerHTML = `Commenting on <span class="apn-sel">${hx(f.sel)}</span>`; stEls[2].textContent = `Comment saved as pin ${f.no}`;
      stw.to(0); box.o.set(0, S.snap);
      const moved = site.go(f.k), d = moved ? .62 : .14;
      at(d, () => {
        const r = site.rect(f.k), to = pad(r), from = lastBox && box.o.at(now()) > .05 ? lastBox : { x:cs.x, y:cs.y, w:0, h:0 };
        box.go(from, to); box.o.set(1, S.base); cp.jump(0); cp.set(1); tg.textContent = f.sel; stw.to(1);
      });
      at(d + .72, () => { cd.set(1); at(.12, () => cd.set(0)); const p = makePin(f); sync(); stw.to(2); at(.22, () => { sel = p; open(p); sync(); }); });
      at(d + 1.6, () => box.o.set(0, S.base));
    }
    nx.onclick = () => show((idx + 1) % FIND.length);
    rp.onclick = () => show(0);
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && sel){ e.preventDefault(); close(true); } });
    layout(); cs = { x:W * .82, y:H * .9 };
    return t => {
      run(t); if (st.clientWidth + ':' + ov.clientWidth + ':' + ov.clientHeight !== lastKey) layout(); if (!W) return;
      if (!started){ started = true; show(0); }
      site.draw(t);
      // read every live rect first, then write
      const aps = pins.map(anchorOf), live = cur ? site.rect(cur.k) : null;
      pins.forEach((p, i) => p.draw(t, aps[i].x, aps[i].y, sel === p));
      // target frame with lagging edges, and the agent's cursor
      const bo = clamp(box.o.at(t));
      if (live && bo > .005){
        const r = box.at(t, pad(live)); lastBox = r; const s = tf.style; s.visibility = 'visible'; s.opacity = bo.toFixed(3);
        s.transform = `translate(${px(r.x)},${px(r.y)})`; s.width = px(r.w); s.height = px(r.h); const below = r.y < 24; tg.style.top = below ? 'calc(100% + 3px)' : '-23px';
        const c1 = clamp(cp.at(t)), end = { x:live.x + live.w * .5, y:live.y + live.h * .5 }, ex = lerp(cs.x, end.x, c1), ey = lerp(cs.y, end.y, c1), press = clamp(cd.at(t));
        cu.style.opacity = bo.toFixed(3); cu.style.transform = `translate(${px(ex)},${px(ey)}) scale(${(1 - .12 * press).toFixed(3)})`; cu.dataset.x = ex; cu.dataset.y = ey; if (c1 > .98) cs = { x:ex, y:ey };
      } else { tf.style.visibility = 'hidden'; cu.style.opacity = 0; }
      // comment card: one rect that morphs between its pin and the open card
      const o = clamp(co.at(t)), p = cardPin;
      if (p && o > .002){
        const a = anchorOf(p), chh = ch.at(t), w = lerp(26, CW, o), h = lerp(26, chh, o), cs2 = ck.style;
        const tx = clamp(a.x + oxT.at(t), 8, Math.max(8, W - CW - 8)), ty = clamp(a.y + oyT.at(t), 8, Math.max(8, H - chh - 8));
        const fillc = mix(clamp(p.rs.at(t)), 'var(--success-tint)', 'var(--ink)');
        cs2.visibility = 'visible'; cs2.transform = `translate(${px(lerp(a.x - 13, tx, o))},${px(lerp(a.y - 13, ty, o))})`; cs2.width = px(w); cs2.height = px(h); cs2.borderRadius = px(lerp(8, 14, o));
        cs2.background = mix(clamp(o * 1.5), 'var(--card)', fillc); cs2.pointerEvents = o > .5 ? 'auto' : 'none';
        const cin = clamp((o - .5) * 2); fade(cc, cin, (1 - cin) * 3);
      } else ck.style.visibility = 'hidden';
      stw.apply(stEls[0], 0, t, 3); stw.apply(stEls[1], 1, t, 3); stw.apply(stEls[2], 2, t, 3);
    };
  }});

/* ================================================================ 2. Mixed agent and human thread */
const STREAMED = 'Not reliably. Placeholders disappear once you type, and several screen readers skip them. An aria-label of “Work email” fixes it without changing the layout.';
const REPLIES = ['Noted. I will keep this open and re-check the field after your next change.', 'Understood. I will test it again with the keyboard as soon as the label is in the page.', 'Thanks. I will add the result to this thread with a fresh screenshot.'];
const THREAD = [
  { who:'agent', t:'2 min ago', sev:'warn', text:'The work email field has no label, so screen readers announce it as “edit text”. Add a visible label or an aria-label.' },
  { who:'priya', t:'1 min ago', text:'Does the placeholder count as a label?' } ];
const FIND2 = { k:'email', sev:'warn', sel:'input#work-email', no:8 };

atom({ id:'agentthread', cat:'Agent activity', name:'Agent and human thread', block:'Pin discussion with attributed events (the review tool review-detail: “Discussion and activity”)', fam:['M','S','X','T'], wide:true, tall:true,
  html:`<style>${css('agt')}
.agt-cc{width:100%}
.agt-hd{display:flex;align-items:center;gap:8px;padding:10px 10px 8px 12px}
.agt-pq{flex:none;width:22px;height:22px;border-radius:7px;background:var(--ink);color:var(--card);font-size:11px;font-weight:600;display:grid;place-items:center}
.agt-hd .agt-sel{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.agt-hd .btn{padding:3px 9px;font-size:12px;display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.agt-x{border:0;background:none;color:var(--muted);padding:3px;border-radius:7px;cursor:pointer;display:grid;place-items:center}
.agt-ls{overflow:hidden;border-top:1px solid var(--line-soft)}
.agt-in{padding:0 12px}
.agt-m{padding:11px 0 0}
.agt-m:last-child{padding-bottom:12px}
.agt-mh{display:flex;align-items:center;gap:7px;font-size:12.5px}
.agt-mh b{font-weight:600}
.agt-tm{margin-left:auto;font-size:11.5px;color:var(--muted);white-space:nowrap}
.agt-bd{position:relative;margin:6px 0 0 29px;font-size:13px;line-height:1.45;overflow-wrap:anywhere}
.agt-bd p{margin:0}
.agt-bd .agt-chip{margin-top:8px}
.agt-w{display:inline-block;white-space:pre-wrap}
.agt-dots{position:absolute;left:0;top:2px;display:flex;gap:4px;height:12px;align-items:center}
.agt-dots i{width:6px;height:6px;border-radius:50%;background:var(--muted)}
.agt-fo{border-top:1px solid var(--line-soft);padding:10px 12px 12px}
.agt-dr{position:relative;height:34px}
.agt-dr>div{position:absolute;inset:0;display:flex;align-items:center;gap:8px;font-size:12.5px}
.agt-dr .btn{padding:4px 11px;font-size:12.5px;white-space:nowrap}
.agt-dr .agt-sl{flex:1;min-width:0;line-height:1.3}
.agt-ok{color:var(--success)}
.agt-cm{display:flex;gap:8px;margin:8px 0 0}
.agt-cm input{flex:1;min-width:0;height:34px;border:1.5px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);font:13px var(--sans);padding:0 10px;outline:none}
.agt-cm button{flex:none;width:34px;height:34px;padding:0;display:grid;place-items:center}
</style><div class="agt-root">
  <div class="agt-bar"><span class="agt-who">${agentMark('agt', 26)}${agentLine('agt')}</span><span class="agt-st" role="status" aria-live="polite"><span>Left a comment on <span class="agt-sel">input#work-email</span></span><span>Replying to the thread…</span><span>Waiting for your decision</span></span><button type="button" class="btn agt-rp">Replay</button></div>
  ${siteFrame('agt')}</div>`,
  desc:'The pin falls on the field and its thread grows out of it with the agent’s finding and a person’s question already in place. The agent’s three-dot indicator breathes on the clock, then its answer reveals word by word while the thread’s height eases open to follow it. Once it finishes, Accept and Dismiss fade in; either swaps to a one-line outcome with Undo. A reply from you appends a person’s message and the agent answers the same way. Resolve collapses the whole thread back into the pin.',
  api:'pin.fy.set(0)   card.o.set(1)   msg.dots(t) = sin(2π(t·1.1 − i·.18))   word[i].o = prog(t, ts + i·50ms)   list.h.set(natural)   dec.swap(wait→choose→acc|dis)   card.o.set(0) on resolve',
  init(st){
    const root = $(st, '.agt-root'), site = new Site(st, 'agt'), ov = site.ov, stEls = $$(st, '.agt-st>span'), rp = $(st, '.agt-rp');
    const { at, run, clear } = queue(), stw = new Swap(0), dec = new Swap(0);
    const ck = mk('div'), cc = mk('div'); ck.className = 'agt-ck card'; ck.setAttribute('role', 'dialog'); ck.setAttribute('aria-label', `Thread on pin ${FIND2.no}, ${FIND2.sel}`); cc.className = 'agt-cc';
    cc.innerHTML = `<div class="agt-hd"><span class="agt-pq" aria-hidden="true">${FIND2.no}</span><span class="agt-sel">${FIND2.sel}</span><button type="button" class="btn agt-rs">${ic(I.check, 13, 2.4)}<span>Resolve</span></button><button type="button" class="agt-x" aria-label="Close thread">${ic(I.x, 14)}</button></div>
      <div class="agt-ls" role="log" aria-label="Thread messages"><div class="agt-in"></div></div>
      <div class="agt-fo"><div class="agt-dr"><div><span class="agt-sl muted">Assistant is replying…</span></div><div><button type="button" class="btn agt-dm">Dismiss</button><button type="button" class="btn ink agt-ac">Accept fix</button></div><div><span class="agt-ok" style="display:grid">${ic(I.check, 15, 2.4)}</span><span class="agt-sl">Accepted. Assistant will re-check after your next change.</span><button type="button" class="btn agt-un1">Undo</button></div><div><span class="agt-sl">Dismissed as won’t fix. The pin stays in the history.</span><button type="button" class="btn agt-un2">Undo</button></div><div><span class="agt-sl muted">Thread resolved. Reopen it to keep talking.</span></div></div>
      <form class="agt-cm"><input class="agt-ip" aria-label="Reply to Assistant" placeholder="Reply to Assistant" autocomplete="off"><button type="submit" class="btn ink agt-sn" aria-label="Send reply">${ic(I.up, 15, 2.2)}</button></form></div>`;
    ck.append(cc); ov.append(ck);
    const hd = $(cc, '.agt-hd'), ls = $(cc, '.agt-ls'), inn = $(cc, '.agt-in'), fo = $(cc, '.agt-fo'), drL = $$(cc, '.agt-dr>div'), rs = $(cc, '.agt-rs'), form = $(cc, '.agt-cm'), ip = $(cc, '.agt-ip'), sn = $(cc, '.agt-sn');
    const co = new Track(0), lh = new Track(0, S.soft), oxT = new Track(0), oyT = new Track(0), tf = new Track(0, S.snap);
    let pin = null, sel = false, resolved = false, dsel = 1, busy = false, started = false, replies = 0, msgs = [], W = 0, H = 0, CW = 300, narrow = false, maxLh = 300, lastKey = '';
    const layout = () => {
      W = ov.clientWidth; H = ov.clientHeight; if (!W) return; narrow = W < 480; root.dataset.n = st.clientWidth < 560 ? 1 : 0;
      CW = Math.round(narrow ? W - 16 : clamp(W * .36, 300, 340)); ck.style.width = px(CW); cc.style.width = px(CW); if (sel) site.cover = narrow ? H - 200 : 0;
      maxLh = Math.max(110, (narrow ? H - 200 : H - 16) - hd.offsetHeight - fo.offsetHeight - 2); lastKey = st.clientWidth + ':' + W + ':' + H;
    };
    const anchor = () => { const r = site.rect('email'); return { x:clamp(r.x + r.w, 14, W - 14), y:clamp(r.y, 14, H - 14), r }; };
    const nat = () => Math.min(inn.offsetHeight, maxLh);
    const grow = () => { lh.set(nat()); at(.5, () => { ls.scrollTop = inn.offsetHeight > ls.clientHeight + 1 ? ls.scrollHeight : 0; }); };
    const addMsg = (m, instant) => {
      const el = mk('div'), agent = m.who === 'agent'; el.className = 'agt-m';
      el.innerHTML = `<div class="agt-mh">${agent ? agentMark('agt', 22) : person('agt', m.who === 'you' ? 'YO' : 'PR', 22)}<b>${agent ? AGENT.name : m.who === 'you' ? 'You' : 'Priya Raman'}</b>${agent ? '<span class="agt-tag">Agent</span>' : ''}<span class="agt-tm">${m.t}</span></div><div class="agt-bd"><p>${m.text ? hx(m.text) : ''}</p>${m.sev ? chip('agt', m.sev) : ''}${m.typing ? '<span class="agt-dots"><i></i><i></i><i></i></span>' : ''}</div>`;
      inn.append(el);
      const o = { el, e:new Track(0), p:$(el, 'p'), dots:$$(el, '.agt-dots i'), dt:$(el, '.agt-dots'), ty:new Track(m.typing ? 1 : 0, S.snap), words:[], ts:0 };
      instant ? o.e.jump(1) : o.e.set(1); msgs.push(o); return o;
    };
    const setDec = k => { dsel = k > 0 && k < 4 ? k : dsel; };
    function agentReply(text){
      stw.to(1); dec.to(0); busy = true; sn.disabled = true;
      const m = addMsg({ who:'agent', t:'just now', typing:true }); grow();
      at(.95, () => {
        m.p.innerHTML = text.split(' ').map(w => `<span class="agt-w">${hx(w)} </span>`).join(''); m.words = $$(m.p, '.agt-w'); m.ts = now(); m.ty.set(0); grow();
        at(m.words.length * .05 + .25, () => { busy = false; sn.disabled = false; stw.to(2); dec.to(resolved ? 4 : dsel); });
      });
    }
    function open(){
      layout(); sel = true; site.cover = narrow ? H - 200 : 0; site.go('email'); const a = anchor(), h0 = nat() + hd.offsetHeight + fo.offsetHeight + 2, pl = placeBeside(a.x, a.y, CW, h0, W, H, a.r); oxT.jump(pl.x - a.x); oyT.jump(pl.y - a.y);
      lh.jump(nat()); co.set(1, S.base); pin.label(true);
    }
    function close(focus){ if (!sel) return; sel = false; co.set(0, S.base); pin.label(false); if (site.cover){ site.sc.set(Math.min(site.sc.target, site.ct.offsetHeight - site.pg.clientHeight)); at(.6, () => { if (!sel) site.cover = 0; }); } if (focus) at(.06, () => pin.btn.focus({ preventScroll:true })); }
    function setResolved(v){
      resolved = v; pin.state = v ? 'resolved' : 'open'; pin.rs.set(v ? 1 : 0); $(rs, 'span').textContent = v ? 'Reopen' : 'Resolve'; if (!busy) dec.to(v ? 4 : dsel);
      if (v){ close(false); at(.3, () => pin.btn.focus({ preventScroll:true })); } pin.label(sel);
    }
    function start(){
      clear(); inn.innerHTML = ''; msgs = []; if (pin){ pin.wrap.remove(); pin = null; } sel = false; resolved = false; dsel = 1; busy = false; replies = 0; co.jump(0); lh.jump(0); ip.value = ''; sn.disabled = true; $(rs, 'span').textContent = 'Resolve';
      layout(); site.cover = narrow ? H - 200 : 0; stw.to(0); dec.cur = 0; dec.prev = null; dec.t = -9; stw.cur = 0; stw.prev = null; stw.t = -9;
      THREAD.forEach(m => addMsg(m, true)); lh.jump(Math.min(inn.offsetHeight, maxLh));
      const moved = site.go('email'), d = moved ? .62 : .14;
      at(d, () => { pin = new Pin('agt', ov, FIND2); pin.btn.onclick = () => sel ? close(true) : (resolved && dec.cur !== 4 ? dec.to(4) : null, open()); pin.label(false); });
      at(d + .3, () => open());
      at(d + 1.4, () => { stw.to(1); agentReply(STREAMED); });
    }
    $(cc, '.agt-ac').onclick = () => { dsel = 2; dec.to(2); };
    $(cc, '.agt-dm').onclick = () => { dsel = 3; dec.to(3); };
    $(cc, '.agt-un1').onclick = $(cc, '.agt-un2').onclick = () => { dsel = 1; dec.to(1); };
    rs.onclick = () => setResolved(!resolved);
    $(cc, '.agt-x').onclick = () => close(true);
    ip.oninput = () => { sn.disabled = busy || !ip.value.trim(); };
    ip.onfocus = () => tf.set(1); ip.onblur = () => tf.set(0);
    form.onsubmit = e => {
      e.preventDefault(); const v = ip.value.trim(); if (!v || busy) return; ip.value = ''; sn.disabled = true;
      addMsg({ who:'you', t:'just now', text:v }); grow(); busy = true; dec.to(0); stw.to(1); at(.4, () => agentReply(REPLIES[replies++ % REPLIES.length]));
    };
    rp.onclick = start;
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && sel){ e.preventDefault(); close(true); } });
    layout();
    return t => {
      run(t); if (st.clientWidth + ':' + ov.clientWidth + ':' + ov.clientHeight !== lastKey) layout(); if (!W) return;
      if (!started){ started = true; start(); }
      site.draw(t);
      const a = anchor();
      if (pin) pin.draw(t, a.x, a.y, sel);
      const o = clamp(co.at(t));
      if (pin && o > .002){
        const hh = hd.offsetHeight, fh = fo.offsetHeight, lhh = lh.at(t), chh = hh + lhh + fh + 2, s = ck.style;
        const tx = narrow ? 8 : clamp(a.x + oxT.at(t), 8, Math.max(8, W - CW - 8)), ty = narrow ? H - chh - 8 : clamp(a.y + oyT.at(t), 8, Math.max(8, H - chh - 8));
        const fillc = mix(clamp(pin.rs.at(t)), 'var(--success-tint)', 'var(--ink)'), w = lerp(26, CW, o), h = lerp(26, chh, o);
        s.visibility = 'visible'; s.transform = `translate(${px(lerp(a.x - 13, tx, o))},${px(lerp(a.y - 13, ty, o))})`; s.width = px(w); s.height = px(h); s.borderRadius = px(lerp(8, 14, o));
        s.background = mix(clamp(o * 1.5), 'var(--card)', fillc); s.pointerEvents = o > .5 ? 'auto' : 'none';
        ls.style.height = px(lhh); ls.style.overflowY = inn.offsetHeight > maxLh ? 'auto' : 'hidden';
        const cin = clamp((o - .5) * 2); fade(cc, cin, (1 - cin) * 3);
        layers(dec, drL, t, 3);
        ip.style.borderColor = mix(clamp(tf.at(t)), 'var(--accent)', 'var(--line)'); sn.style.opacity = sn.disabled ? '.45' : '1';
      } else ck.style.visibility = 'hidden';
      msgs.forEach(m => {
        fade(m.el, clamp(m.e.at(t)), (1 - clamp(m.e.at(t))) * 6, false);
        if (m.dots.length){ const ty = clamp(m.ty.at(t)); m.dt.style.opacity = ty.toFixed(3); m.dots.forEach((d, i) => { d.style.opacity = (.25 + .75 * (.5 + .5 * Math.sin(Math.PI * 2 * (t * 1.1 - i * .18)))).toFixed(3); }); }
        m.words.forEach((w, i) => { const q = clamp(prog(t, m.ts + i * .05, S.snap)); w.style.opacity = q.toFixed(3); w.style.transform = `translateY(${px((1 - q) * 3)})`; });
      });
      layers(stw, stEls, t, 3);
    };
  }});

/* ================================================================ 3. Evidence capture */
const SHOTS = [ { k:'cta', sel:'button.cta-primary' }, { k:'email', sel:'input#work-email' }, { k:'plan', sel:'section.pricing article:nth-child(2)' }, { k:'sub', sel:'p.hero-sub' } ];
const SHOT0 = { k:'art', sel:'img.hero-art' };

atom({ id:'evidencecapture', cat:'Agent activity', name:'Evidence capture', block:'Saved screenshots + evidence viewer (the review tool: “Saved screenshots · N”, “View screenshot”)', fam:['E','M','T','X'], wide:true, tall:true,
  html:`<style>${css('evc')}
.evc-body{flex:1;min-height:0;display:flex;gap:8px}
.evc-body .evc-fr{flex:1;min-width:0}
.evc-tray{flex:none;width:252px;display:flex;flex-direction:column;overflow:hidden;min-height:0}
.evc-th0{flex:none;display:flex;align-items:center;gap:8px;padding:0 12px;height:38px;border-bottom:1px solid var(--line-soft);font-size:13px}
.evc-th0 b{font-weight:600;flex:1}
.evc-cn{font-size:13px;font-weight:600}
.evc-ls{flex:1;min-height:0;overflow:auto;padding:6px;display:flex;flex-direction:column}
.evc-w{flex:none;overflow:hidden}
.evc-it{display:flex;align-items:center;gap:10px;width:100%;padding:6px;border:0;border-radius:10px;background:none;text-align:left;cursor:pointer;color:var(--ink)}
.evc-it:hover{background:var(--raised)}
.evc-th{position:relative;flex:none;width:92px;height:58px;border:0;border-radius:8px;background:var(--raised);overflow:hidden}
.evc-ph{position:absolute;left:0;top:0;transform-origin:0 0;background:var(--card);overflow:hidden}
.evc-cp{min-width:0;display:flex;flex-direction:column;gap:2px;font-size:12px;color:var(--muted)}
.evc-cp .evc-sel{font-size:11px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.evc-tf{position:absolute;left:0;top:0;border:1.5px solid var(--ink);outline:1.5px solid var(--card);pointer-events:none!important;visibility:hidden;z-index:2}
.evc-tf i{position:absolute;width:7px;height:7px;background:var(--card);border:1.5px solid var(--ink);box-sizing:border-box}
.evc-tg{position:absolute;left:-1.5px;font:11px/1 var(--mono);background:var(--ink);color:var(--card);padding:4px 6px;border-radius:5px;white-space:nowrap}
.evc-fly{position:absolute;left:0;top:0;z-index:20;visibility:hidden;border:0;border-radius:8px;background:var(--card);box-shadow:var(--shadow);overflow:hidden;pointer-events:none}
.evc-vw{position:absolute;inset:0;z-index:40;visibility:hidden}
.evc-sc{position:absolute;inset:-12px;background:color-mix(in oklab,var(--ink) 42%,transparent)}
.evc-vp{position:absolute;left:0;top:0;overflow:hidden}
.evc-vc{position:absolute;left:0;top:0;display:flex;flex-direction:column}
.evc-vh{flex:none;display:flex;align-items:center;gap:6px;padding:8px 8px 8px 14px;border-bottom:1px solid var(--line-soft)}
.evc-vh b{flex:1;font-size:13px;font-weight:600}
.evc-vh button{border:0;background:none;color:var(--ink);padding:5px;border-radius:7px;cursor:pointer;display:grid;place-items:center}
.evc-vh button:hover{background:var(--raised)}
.evc-vh button[disabled]{color:var(--muted);cursor:default;background:none}
.evc-vb{position:relative;flex:1;min-height:0}
.evc-vl{position:absolute;inset:0;display:flex;flex-direction:column}
.evc-pic{position:relative;flex:1;min-height:0;background:var(--raised);margin:12px 12px 0;border-radius:10px;overflow:hidden}
.evc-mt{flex:none;padding:10px 14px 12px;display:grid;gap:3px;font-size:12px;color:var(--muted)}
.evc-mt b{color:var(--ink);font-weight:600}
.evc-mt .evc-r{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.evc-root[data-n="1"] .evc-body{flex-direction:column}
.evc-root[data-n="1"] .evc-tray{width:auto;height:162px}
.evc-root[data-n="1"] .evc-ls{flex-direction:row;overflow-x:auto;overflow-y:hidden}
.evc-root[data-n="1"] .evc-it{flex-direction:column;align-items:flex-start;gap:6px;width:112px;padding:4px 6px}
.evc-root[data-n="1"] .evc-th{width:98px;height:56px}
</style><div class="evc-root">
  <div class="evc-bar"><span class="evc-who">${agentMark('evc', 26)}${agentLine('evc')}</span><span class="evc-st" role="status" aria-live="polite"><span>Reading the page</span><span></span><span></span></span><button type="button" class="btn evc-cap">Capture</button><button type="button" class="btn evc-rp">Replay</button></div>
  <div class="evc-body">${siteFrame('evc')}<aside class="evc-tray card" aria-label="Evidence tray"><div class="evc-th0"><b>Saved screenshots</b><span class="evc-cn num" aria-live="polite"></span></div><div class="evc-ls" role="list"></div></aside></div>
  <div class="evc-fly" aria-hidden="true"></div>
  <div class="evc-vw"><div class="evc-sc"></div><div class="evc-vp card" role="dialog" aria-modal="true" aria-label="Saved screenshot"><div class="evc-vc"><div class="evc-vh"><b class="evc-vt"></b><button type="button" class="evc-pv" aria-label="Previous screenshot">${ic('<path d="m15 6-6 6 6 6"/>', 16)}</button><button type="button" class="evc-nx" aria-label="Next screenshot">${ic('<path d="m9 6 6 6-6 6"/>', 16)}</button><button type="button" class="evc-cl" aria-label="Close screenshot">${ic(I.x, 16)}</button></div><div class="evc-vb"><div class="evc-vl"></div><div class="evc-vl"></div></div></div></div></div>
  </div>`,
  desc:'The agent scrolls to the element and a capture frame snaps in around it, leading edges first with the trailing edges 60ms behind, while the rest of the page dims. The region flashes once, lifts off the page as a snapshot, and shrinks and travels into the tray, landing in the slot that has just opened for it. Only when it lands does the saved-screenshots count roll up. Open any thumbnail and it grows from its own slot into a viewer with who captured it and the element it shows; arrows swap between shots.',
  api:'box.go(prev → region)   flash.set(1) → set(0)   fly.fl.set(1): rect lerp(region → slot)   slot.ent.set(1)   digits.set(n)   viewer.vo.set(1): rect lerp(slot → centred)',
  init(st){
    const root = $(st, '.evc-root'), site = new Site(st, 'evc'), ov = site.ov, stEls = $$(st, '.evc-st>span'), capB = $(st, '.evc-cap'), rpB = $(st, '.evc-rp'), list = $(st, '.evc-ls'), cnt = $(st, '.evc-cn'), fly = $(st, '.evc-fly');
    const vw = $(st, '.evc-vw'), vsc = $(st, '.evc-sc'), vp = $(st, '.evc-vp'), vc = $(st, '.evc-vc'), vls = $$(st, '.evc-vl'), vt = $(st, '.evc-vt'), vPrev = $(st, '.evc-pv'), vNext = $(st, '.evc-nx'), vClose = $(st, '.evc-cl');
    const { at, run, clear } = queue(), stw = new Swap(0), vsw = new Swap(0), digits = new Digits(cnt, 2);
    const tf = mk('div'), tg = mk('span'); tf.className = 'evc-tf'; tg.className = 'evc-tg'; tf.append(tg); ['left:-5px;top:-5px', 'right:-5px;top:-5px', 'left:-5px;bottom:-5px', 'right:-5px;bottom:-5px'].forEach(c => tf.append(mk('i', c))); ov.append(tf);
    const box = new Box(), flash = new Track(0, S.snap), fl = new Track(0, S.soft), vo = new Track(0, S.base);
    let items = [], cur = SHOT0, nextK = 0, started = false, busy = false, narrow = false, W = 0, H = 0, lastKey = '', lastBox = null, flyIt = null, flyFrom = null, view = -1, viewFrom = null, viewer = false, opener = null, VW = 0, VH = 0, count = 0;
    const MAX = 6;
    const shot = it => { const w = it.w + 16, h = it.h + 16, ph = mk('div'); ph.className = 'evc-ph'; ph.style.width = px(w); ph.style.height = px(h); ph.setAttribute('inert', ''); const c = it.node.cloneNode(true); c.removeAttribute('data-k'); c.style.cssText = `position:absolute;left:8px;top:8px;margin:0;width:${px(it.w)};height:${px(it.h)}`; ph.append(c); return ph; };
    const fitInto = (ph, it, bw, bh, max = 9) => { const w = it.w + 16, h = it.h + 16, s = Math.min(bw / w, bh / h, max); ph.style.transform = `translate(${px((bw - w * s) / 2)},${px((bh - h * s) / 2)}) scale(${s.toFixed(4)})`; };
    const toRoot = r => { const rr = root.getBoundingClientRect(); return { x:r.left - rr.left, y:r.top - rr.top, w:r.width, h:r.height }; };
    const layout = () => { W = ov.clientWidth; H = ov.clientHeight; if (!W) return; narrow = st.clientWidth < 560; root.dataset.n = narrow ? 1 : 0; lastKey = st.clientWidth + ':' + W + ':' + H;
      VW = Math.round(Math.min(st.clientWidth - 24 - 24, 560)); VH = Math.round(Math.min(st.clientHeight - 24 - 24, 400)); vc.style.width = px(VW); vc.style.height = px(VH); items.forEach(fit); };
    const fit = it => fitInto($(it.th, '.evc-ph'), it, it.th.clientWidth, it.th.clientHeight, 2);
    function makeItem(spec, node, w, h, instant, ago){
      const it = { spec, node, w, h, ent:new Track(0), ready:instant ? 1 : 0, ago }, wrap = mk('div'); wrap.className = 'evc-w'; wrap.setAttribute('role', 'listitem');
      wrap.innerHTML = `<button type="button" class="evc-it"><span class="evc-th"></span><span class="evc-cp"><span class="evc-sel">${hx(spec.sel)}</span><span>${Math.round(w)} × ${Math.round(h)} · ${ago}</span></span></button>`;
      list.prepend(wrap); it.wrap = wrap; it.btn = $(wrap, '.evc-it'); it.th = $(wrap, '.evc-th'); it.th.append(shot(it)); it.ph = $(it.th, '.evc-ph');
      it.btn.onclick = () => openViewer(it); instant ? it.ent.jump(1) : it.ent.set(1, S.base); items.unshift(it); label(); fit(it); return it;
    }
    const label = () => items.forEach((it, i) => it.btn.setAttribute('aria-label', `View screenshot ${items.length - i} of ${items.length}, ${it.spec.sel}`));
    const nat = it => narrow ? it.btn.offsetWidth : it.btn.offsetHeight;
    const snap = k => { const el = site.els[k], n = el.cloneNode(true); return { node:n, w:el.offsetWidth, h:el.offsetHeight }; };
    function capture(spec){
      if (busy || items.length >= MAX) return; cur = spec; busy = true; capB.disabled = true; clear(); stw.to(0); stEls[1].innerHTML = `Framing <span class="evc-sel">${hx(spec.sel)}</span>`;
      const moved = site.go(spec.k), d = moved ? .62 : .14;
      at(d, () => {
        const r = site.rect(spec.k), to = { x:r.x - 8, y:r.y - 8, w:r.w + 16, h:r.h + 16 }, from = lastBox && box.o.at(now()) > .05 ? lastBox : { x:0, y:0, w:W, h:H };
        box.go(from, to); box.o.set(1, S.base); tg.textContent = `${Math.round(r.w)} × ${Math.round(r.h)} · ${spec.sel}`; stw.to(1);
      });
      at(d + .8, () => {
        flash.set(1); at(.1, () => flash.set(0));
        const r = site.rect(spec.k), sn = snap(spec.k), to = { x:r.x - 8, y:r.y - 8, w:r.w + 16, h:r.h + 16 }, ob = toRoot(ov.getBoundingClientRect());
        flyFrom = { x:ob.x + to.x, y:ob.y + to.y, w:to.w, h:to.h };
        const it = makeItem(spec, sn.node, sn.w, sn.h, false, 'just now'); list.scrollLeft = 0; list.scrollTop = 0; flyIt = it; fly.replaceChildren(shot(it)); fl.jump(0); at(.1, () => fl.set(1));
        box.o.set(0, S.base); stw.to(2); stEls[2].textContent = `Saved screenshot ${count + 1} to the evidence tray`;
        at(.62, () => { count++; digits.set(String(count)); });
        at(1.25, () => { busy = false; capB.disabled = false; syncCap(); });
      });
    }
    const syncCap = () => { capB.textContent = items.length >= MAX ? 'Tray full' : 'Capture'; capB.disabled = busy || items.length >= MAX; };
    /* viewer */
    function fillView(layer, it){
      const idx = items.indexOf(it), n = items.length; layer.innerHTML = `<div class="evc-pic"></div><div class="evc-mt"><div class="evc-r">${agentMark('evc', 18)}<span><b>${AGENT.name}</b> · <span style="font-family:var(--mono);font-size:11px">${AGENT.id}</span> · agent</span></div><div>Element <b class="evc-sel" style="color:var(--ink)">${hx(it.spec.sel)}</b></div><div>${Math.round(it.w)} × ${Math.round(it.h)} CSS px · viewport 1280 × 800</div><div>Status then: open · now: open</div></div>`;
      const pic = $(layer, '.evc-pic'), ph = shot(it); pic.append(ph); layer._it = it; layer._ph = ph;
      return pic;
    }
    const fitView = layer => { const pic = $(layer, '.evc-pic'); if (pic && layer._ph) fitInto(layer._ph, layer._it, pic.clientWidth, pic.clientHeight, 3); };
    function showView(it, dir){
      const idx = items.indexOf(it), n = items.length; view = idx; vt.textContent = `Screenshot ${n - idx} of ${n}`; vPrev.disabled = idx >= n - 1; vNext.disabled = idx <= 0;
      const k = vsw.cur ^ 1; fillView(vls[k], it); fitView(vls[k]); vsw.to(k);
    }
    function openViewer(it){
      if (viewer) return; viewer = true; opener = it; viewFrom = toRoot(it.th.getBoundingClientRect()); vsw.cur = 0; vsw.prev = null; vsw.t = -9; vls[1].innerHTML = ''; vls[0].innerHTML = '';
      const idx = items.indexOf(it), n = items.length; vt.textContent = `Screenshot ${n - idx} of ${n}`; vPrev.disabled = idx >= n - 1; vNext.disabled = idx <= 0; fillView(vls[0], it); view = idx; vo.set(1, S.base);
      at(.05, () => fitView(vls[0])); at(.2, () => vClose.focus({ preventScroll:true }));
    }
    function closeViewer(){
      if (!viewer) return; viewer = false; const it = items[view] || opener; viewFrom = toRoot(it.th.getBoundingClientRect()); vo.set(0, S.base); at(.2, () => it.btn.focus({ preventScroll:true }));
    }
    vClose.onclick = closeViewer; vsc.onclick = closeViewer;
    vPrev.onclick = () => { if (view < items.length - 1) { opener = items[view + 1]; showView(items[view + 1]); } };
    vNext.onclick = () => { if (view > 0) { opener = items[view - 1]; showView(items[view - 1]); } };
    vw.addEventListener('keydown', e => {
      if (e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); closeViewer(); }
      else if (e.key === 'ArrowLeft'){ e.preventDefault(); vPrev.onclick(); } else if (e.key === 'ArrowRight'){ e.preventDefault(); vNext.onclick(); }
      else if (e.key === 'Tab'){ const f = [vPrev, vNext, vClose].filter(b => !b.disabled), i = f.indexOf(document.activeElement); if (!f.length) return; e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); }
    });
    function reset(){
      clear(); busy = false; flyIt = null; viewer = false; vo.jump(0); fl.jump(0); box.o.jump(0); lastBox = null; nextK = 0; count = 1; list.replaceChildren(); items = []; fly.replaceChildren();
      layout(); site.sc.jump(0); const sn = snap(SHOT0.k); makeItem(SHOT0, sn.node, sn.w, sn.h, true, '6 min ago'); digits.set('1', true); stw.cur = 0; stw.prev = null; stw.t = -9; syncCap();
    }
    const next = () => capture(SHOTS[nextK++ % SHOTS.length]);
    capB.onclick = next; rpB.onclick = () => { reset(); at(.4, next); };
    layout();
    return t => {
      run(t); if (st.clientWidth + ':' + ov.clientWidth + ':' + ov.clientHeight !== lastKey) layout(); if (!W) return;
      if (!started){ started = true; reset(); at(.5, next); }
      site.draw(t);
      // slots grow in; the thumbnail waits until the snapshot lands
      const f = clamp(fl.at(t));
      items.forEach(it => {
        const e = clamp(it.ent.at(t)), n = nat(it);
        if (narrow){ it.wrap.style.width = px(e * (it.natN || (it.natN = n))); it.wrap.style.height = ''; } else { it.wrap.style.height = px(e * (it.natN || (it.natN = n))); it.wrap.style.width = ''; }
        fade(it.wrap, e, 0, false); it.wrap.style.transform = 'none';
        it.th.style.opacity = (it === flyIt ? clamp((f - .9) * 10) : 1).toFixed(3);
      });
      // snapshot flight
      if (flyIt && fl.target === 1 && f < .999 && flyFrom){
        const to = toRoot(flyIt.th.getBoundingClientRect()), q = f, ph = fly.firstChild, w = lerp(flyFrom.w, to.w, q), h = lerp(flyFrom.h, to.h, q);
        fly.style.visibility = 'visible'; fly.style.transform = `translate(${px(lerp(flyFrom.x, to.x, q))},${px(lerp(flyFrom.y, to.y, q))})`; fly.style.width = px(w); fly.style.height = px(h); fly.style.opacity = (f > .9 ? clamp(1 - (f - .9) * 10) : 1).toFixed(3);
        fitInto(ph, flyIt, w - 2, h - 2, 2);
      } else { fly.style.visibility = 'hidden'; if (f >= .999 && flyIt) flyIt = null; }
      // capture frame
      const bo = clamp(box.o.at(t));
      if (bo > .005 && started){
        const r = box.at(t, padded(site.rect(cur.k))); lastBox = r; const s = tf.style, fv = clamp(flash.at(t));
        s.visibility = 'visible'; s.opacity = '1'; s.transform = `translate(${px(r.x)},${px(r.y)})`; s.width = px(r.w); s.height = px(r.h);
        s.boxShadow = `0 0 0 3000px ${mix(bo * .9, 'color-mix(in oklab, var(--ink) 40%, transparent)', 'transparent')}`; s.background = mix(fv, 'var(--card)', 'transparent'); s.borderWidth = px(1.5 + 1.5 * fv); tg.style.top = r.y < 24 ? 'calc(100% + 5px)' : '-23px'; tg.style.opacity = bo.toFixed(3);
        tf.children[0].style.opacity = bo.toFixed(3);
      } else tf.style.visibility = 'hidden';
      // viewer: one rect morphs from the thumbnail slot to the centred viewer
      const v = clamp(vo.at(t));
      if (v > .002 && viewFrom){
        const rr = { w:st.clientWidth, h:st.clientHeight }, tx = (rr.w - VW) / 2 - 12, ty = (rr.h - VH) / 2 - 12;
        const live = items[view] ? toRoot(items[view].th.getBoundingClientRect()) : viewFrom, src = viewer ? viewFrom : live;
        const s = vp.style; vw.style.visibility = 'visible'; vsc.style.opacity = v.toFixed(3);
        s.transform = `translate(${px(lerp(src.x - 12, tx, v))},${px(lerp(src.y - 12, ty, v))})`; s.width = px(lerp(src.w, VW, v)); s.height = px(lerp(src.h, VH, v)); s.borderRadius = px(lerp(8, 14, v)); s.background = mix(clamp(v * 1.5), 'var(--card)', 'var(--raised)');
        vc.style.opacity = clamp((v - .5) * 2).toFixed(3); vc.style.pointerEvents = v > .5 ? 'auto' : 'none'; vls.forEach((l, i) => vsw.apply(l, i, t, 4));
      } else vw.style.visibility = 'hidden';
      layers(stw, stEls, t, 3); digits.render(t);
    };
    function padded(r){ return { x:r.x - 8, y:r.y - 8, w:r.w + 16, h:r.h + 16 }; }
  }});

/* ================================================================ 4. Suggested edit */
// '=' kept, '-' removed, '+' added; the same ops draw the card and morph the page
const EDITS = [
  { k:'sub', kind:'Text edit', sel:'p.hero-sub', ops:[['=', 'Fieldnote'], ['=', 'helps'], ['=', 'teams'], ['-', 'to'], ['=', 'collaborate'], ['=', 'on'], ['=', 'notes'], ['=', 'more'], ['-', 'easier.'], ['+', 'easily.']], note:'Fixes two grammar slips: “to collaborate” and “more easier”.' },
  { k:'cta', kind:'Style edit', sel:'button.cta-primary', code:true, ops:[['L', '.cta-primary {'], ['=', '  background:'], ['-', '#989B6F;'], ['+', 'var(--accent);'], ['L', '}']], note:'Contrast rises from 2.9:1 to 7.0:1, which passes WCAG AA.' } ];

atom({ id:'suggestededit', cat:'Agent activity', name:'Suggested edit', block:'Agent suggestion on a pin (proposed; sits on the the review tool pin discussion)', fam:['M','E','X','S'], wide:true, tall:true,
  html:`<style>${css('sge')}
.sge-tf{position:absolute;left:0;top:0;border:1.5px solid var(--ink);border-radius:8px;pointer-events:none!important;z-index:2;visibility:hidden}
.sge-ck{position:absolute;left:0;top:0;z-index:30;visibility:hidden;transform-origin:0 0;padding:12px}
.sge-hd{display:flex;align-items:center;gap:8px}
.sge-hd .sge-chip{margin-left:auto}
.sge-mt{margin-top:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.sge-df{margin-top:8px;padding:10px 12px;border-radius:10px;background:var(--raised);font-size:13.5px;line-height:1.75;overflow-wrap:anywhere}
.sge-df.code{font:12.5px/1.8 var(--mono);white-space:pre-wrap}
.sge-ln{display:block}
.sge-d,.sge-a{border-radius:4px;padding:1px 3px;white-space:pre-wrap}
.sge-d{position:relative;background:var(--danger-tint);color:var(--danger)}
.sge-d::after{content:"";position:absolute;left:3px;right:3px;top:52%;height:1.5px;background:currentColor;transform-origin:0 50%;transform:scaleX(var(--s,1))}
.sge-a{background:var(--success-tint);color:var(--success);font-weight:500}
.sge-nt{margin:8px 0 0;font-size:12.5px;color:var(--muted)}
.sge-br{position:relative;height:34px;margin-top:12px}
.sge-br button{position:absolute;top:0;height:34px;padding:0;border-radius:9px;font:500 13px var(--sans);cursor:pointer;overflow:hidden;white-space:nowrap}
.sge-br button>span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:6px}
.sge-t{display:inline-block;overflow:hidden;white-space:pre;vertical-align:top;height:1.5em;line-height:1.5}
.sge-t.in{border-radius:3px}
</style><div class="sge-root">
  <div class="sge-bar"><span class="sge-who">${agentMark('sge', 26)}${agentLine('sge')}</span><span class="sge-st" role="status" aria-live="polite"><span>Reading the page</span><span></span></span><button type="button" class="btn sge-nx">Next suggestion</button><button type="button" class="btn sge-rp">Replay</button></div>
  ${siteFrame('sge')}</div>`,
  desc:'The agent frames the element and a suggestion card pops in beside it. Its words reveal in order: removed words get a danger tint and a strike that draws left to right, added words a success tint. Accept and Reject are one row that morphs: the chosen button grows to fill it and turns to a one-line outcome with Undo while the other collapses. On the page, accepting makes removed words close up and added words open out, and a style edit eases the button’s fill to the new value. Undo runs the same morph backwards.',
  api:'frame.go(prev → target)   card.pop(o)   word[i].o = prog(t, t0 + i·35ms)   strike.s = prog   row: acc.w = W − rej.w − gap, rej.w → 0   page: del.w = nat·(1−a), ins.w = nat·a   cta.bg = mix(a, accent, pale)',
  init(st){
    const root = $(st, '.sge-root'), site = new Site(st, 'sge'), ov = site.ov, stEls = $$(st, '.sge-st>span'), nx = $(st, '.sge-nx'), rp = $(st, '.sge-rp');
    const { at, run, clear } = queue(), stw = new Swap(0), box = new Box();
    const tf = mk('div'); tf.className = 'sge-tf'; ov.append(tf);
    const sub = site.els.sub, cta = site.els.cta;
    // the page paragraph becomes tokens so removed and added words can open and close
    const subTok = []; sub.innerHTML = EDITS[0].ops.map(([o, w], i) => o === '=' ? `<span class="sge-t" data-o="=">${hx(w)} </span>` : `<span class="sge-t in" data-o="${o}"><span>${hx(w)} </span></span>`).join('');
    $$(sub, '.sge-t').forEach(e => subTok.push({ e, o:e.dataset.o, inner:e.firstElementChild && e.dataset.o !== '=' ? e.firstElementChild : null, nat:0 }));
    const cards = EDITS.map((ed, ei) => {
      const el = mk('div'); el.className = 'sge-ck card'; el.setAttribute('role', 'group'); el.setAttribute('aria-label', `${ed.kind} suggested by ${AGENT.name} on ${ed.sel}`);
      let diff = '';
      if (ed.code){ diff = `<span class="sge-ln">${hx(ed.ops[0][1])}</span><span class="sge-ln">${hx(ed.ops[1][1])} <span class="sge-w sge-d">${hx(ed.ops[2][1])}</span></span><span class="sge-ln">${hx(ed.ops[1][1])} <span class="sge-w sge-a">${hx(ed.ops[3][1])}</span></span><span class="sge-ln">${hx(ed.ops[4][1])}</span>`; }
      else diff = ed.ops.map(([o, w]) => `<span class="sge-w ${o === '-' ? 'sge-d' : o === '+' ? 'sge-a' : ''}">${hx(w)}</span>`).join(' ');
      el.innerHTML = `<div class="sge-hd">${agentMark('sge', 24)}${agentLine('sge')}<span class="sge-chip" data-sev="${ei ? 'block' : 'info'}">${ic(SEV[ei ? 'block' : 'info'].i, 12, 2)}${ei ? 'Blocking' : 'Suggestion'}</span></div><div class="sge-mt"><b style="font-size:12.5px">${ed.kind}</b><span class="sge-sel">${hx(ed.sel)}</span></div><div class="sge-df${ed.code ? ' code' : ''}">${diff}</div><p class="sge-nt">${hx(ed.note)}</p>
        <div class="sge-br"><button type="button" class="btn sge-rj" aria-label="Reject edit"><span class="l0">Reject</span><span class="l1" style="opacity:0">Rejected · Undo</span></button><button type="button" class="btn ink sge-ac" aria-label="Accept edit"><span class="l0">Accept</span><span class="l1" style="opacity:0">${ic(I.check, 14, 2.4)}Applied · Undo</span></button></div>`;
      ov.append(el);
      const c = { ed, el, o:new Track(0), a:new Track(0, S.base), r:new Track(0, S.base), tn:new Track(0, S.lazy), t0:-9, ws:$$(el, '.sge-w'), rj:$(el, '.sge-rj'), ac:$(el, '.sge-ac'), br:$(el, '.sge-br'), state:0, ox:0, oy:0 };
      c.ac.onclick = () => decide(c, c.state === 1 ? 0 : 1); c.rj.onclick = () => decide(c, c.state === 2 ? 0 : 2); return c;
    });
    let cur = -1, started = false, W = 0, H = 0, CW = 300, lastKey = '', lastBox = null;
    const layout = () => { W = ov.clientWidth; H = ov.clientHeight; if (!W) return; root.dataset.n = st.clientWidth < 560 ? 1 : 0; CW = Math.round(clamp(W - 16, 250, 340)); cards.forEach(c => c.el.style.width = px(CW)); lastKey = st.clientWidth + ':' + W + ':' + H; };
    function decide(c, s){
      c.state = s; c.a.set(s === 1 ? 1 : 0); c.r.set(s === 2 ? 1 : 0); if (s === 1) c.tn.jump(1), c.tn.set(0, S.lazy, now() + .5);
      c.ac.setAttribute('aria-label', s === 1 ? 'Undo applied edit' : 'Accept edit'); c.rj.setAttribute('aria-label', s === 2 ? 'Undo rejected edit' : 'Reject edit');
      stEls[1].innerHTML = `${c.ed.kind} on <span class="sge-sel">${hx(c.ed.sel)}</span>: ${s === 1 ? 'applied to the page' : s === 2 ? 'rejected' : 'waiting for your review'}`; stw.cur === 1 || stw.to(1);
    }
    function show(i){
      clear(); const prev = cards[cur]; if (prev) prev.o.set(0, S.snap);
      cur = i; const c = cards[i], f = c.ed, d = (prev ? EXIT + .05 : 0) + (site.go(f.k) ? .6 : .1);
      stEls[1].innerHTML = `${f.kind} on <span class="sge-sel">${hx(f.sel)}</span>: ${c.state === 1 ? 'applied to the page' : c.state === 2 ? 'rejected' : 'waiting for your review'}`; stw.to(0); box.o.set(0, S.snap);
      at(d, () => { const r = site.rect(f.k), to = { x:r.x - 4, y:r.y - 4, w:r.w + 8, h:r.h + 8 }; box.go(lastBox && box.o.at(now()) > .05 ? lastBox : { x:to.x + to.w / 2, y:to.y + to.h / 2, w:0, h:0 }, to); box.o.set(1, S.base); stw.to(1); });
      at(d + .5, () => { const a = site.rect(f.k), pl = placeBeside(a.x + a.w, a.y, CW, c.el.offsetHeight || 260, W, H, a, 16); c.ox = pl.x - a.x; c.oy = pl.y - a.y; c.t0 = now(); c.o.set(1, S.base); });
    }
    nx.onclick = () => show((cur + 1) % cards.length);
    rp.onclick = () => { cards.forEach(c => { if (c.state) decide(c, 0); }); show(0); };
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && cur >= 0 && cards[cur].o.target === 1){ e.preventDefault(); cards[cur].o.set(0, S.base); box.o.set(0, S.base); nx.focus(); } });
    layout();
    return t => {
      run(t); if (st.clientWidth + ':' + ov.clientWidth + ':' + ov.clientHeight !== lastKey) layout(); if (!W) return;
      if (!started){ started = true; show(0); }
      site.draw(t);
      // page: removed words close up, added words open out, a style edit eases the fill
      const c0 = cards[0], a0 = clamp(c0.a.at(t)), tn0 = clamp(c0.tn.at(t));
      subTok.forEach(k => { if (!k.inner) return; if (!k.nat) k.nat = k.inner.offsetWidth; const w = k.o === '-' ? 1 - a0 : a0; k.e.style.width = px(k.nat * w); k.e.style.opacity = w.toFixed(3); k.e.style.background = k.o === '+' ? mix(tn0, 'var(--success-tint)', 'transparent') : 'none'; });
      const a1 = clamp(cards[1].a.at(t)); cta.style.background = mix(a1, 'var(--accent)', 'color-mix(in oklab, var(--accent) 62%, var(--card))');
      const live = cur >= 0 ? site.rect(EDITS[cur].k) : null, bo = clamp(box.o.at(t));
      if (live && bo > .005){ const r = box.at(t, { x:live.x - 4, y:live.y - 4, w:live.w + 8, h:live.h + 8 }); lastBox = r; const s = tf.style; s.visibility = 'visible'; s.opacity = bo.toFixed(3); s.transform = `translate(${px(r.x)},${px(r.y)})`; s.width = px(r.w); s.height = px(r.h); } else tf.style.visibility = 'hidden';
      cards.forEach((c, ci) => {
        const o = clamp(c.o.at(t)); if (o < .005){ c.el.style.visibility = 'hidden'; return; }
        const a = site.rect(c.ed.k), h = c.el.offsetHeight, s = c.el.style;
        s.left = px(clamp(a.x + c.ox, 8, Math.max(8, W - CW - 8))); s.top = px(clamp(a.y + c.oy, 8, Math.max(8, H - h - 8))); pop(c.el, o, 6); s.transformOrigin = '0 0';
        // diff words reveal in order, then the strikes draw
        c.ws.forEach((w, i) => { const q = clamp(prog(t, c.t0 + .1 + i * .035, S.snap)); w.style.opacity = q.toFixed(3); if (w.classList.contains('sge-d')) w.style.setProperty('--s', clamp(prog(t, c.t0 + .45 + i * .035, S.base)).toFixed(3)); });
        // accept / reject: one row, one morph
        const aa = clamp(c.a.at(t)), rr = clamp(c.r.at(t)), BW = c.br.clientWidth, g = 8 * (1 - aa) * (1 - rr), rw = (92 + (BW - 92) * rr) * (1 - aa), aw = BW - rw - g;
        c.rj.style.left = '0'; c.rj.style.width = px(rw); c.rj.style.opacity = clamp(1 - aa * 1.6).toFixed(3); c.rj.style.pointerEvents = aa > .5 ? 'none' : 'auto';
        c.ac.style.left = px(rw + g); c.ac.style.width = px(Math.max(0, aw)); c.ac.style.opacity = clamp(1 - rr * 1.6).toFixed(3); c.ac.style.pointerEvents = rr > .5 ? 'none' : 'auto';
        c.ac.style.background = mix(aa, 'var(--success-tint)', 'var(--ink)'); c.ac.style.color = mix(aa, 'var(--success)', 'var(--card)'); c.ac.style.borderColor = mix(aa, 'var(--success)', 'var(--ink)');
        c.rj.style.background = mix(rr, 'var(--raised)', 'var(--card)'); c.rj.style.borderColor = mix(rr, 'var(--muted)', 'var(--line)');
        const l = (b, q) => { const [l0, l1] = $$(b, 'span'); l0.style.opacity = clamp(1 - q * 2).toFixed(3); l1.style.opacity = clamp(q * 2 - 1).toFixed(3); }; l(c.ac, aa); l(c.rj, rr);
      });
      layers(stw, stEls, t, 3);
    };
  }});

/* ================================================================ 5. Review summary */
const FINDINGS = [
  { sev:'block', title:'Primary button text fails contrast', sel:'button.cta-primary', route:'/pricing', pin:7, sp:'cta', steps:['Open /pricing at 1280 × 800', 'Inspect button.cta-primary', 'Measure white text on the pale green fill'], exp:'At least 4.5:1', obs:'2.9:1' },
  { sev:'block', title:'Plan toggle traps keyboard focus', sel:'div.plan-toggle', route:'/signup', pin:8, sp:'tog', steps:['Open /signup and press Tab until the plan toggle has focus', 'Press Tab again', 'Press Shift+Tab'], exp:'Focus moves to the next field', obs:'Focus loops inside the toggle' },
  { sev:'warn', title:'Email field has no label', sel:'input#work-email', route:'/pricing', pin:9, sp:'em', steps:['Open /pricing and scroll to Product updates', 'Focus the email field with a screen reader on', 'Listen to the announcement'], exp:'“Work email, edit text”', obs:'“Edit text”' },
  { sev:'warn', title:'Hero image has no alt text', sel:'img.hero-art', route:'/pricing', pin:10, sp:'art', steps:['Open /pricing', 'Move the screen reader to the hero image'], exp:'A description, or the image skipped', obs:'The file name is read out' },
  { sev:'warn', title:'Form errors are not announced', sel:'p.field-error', route:'/signup', pin:11, sp:'err', steps:['Open /signup', 'Submit with the email field empty', 'Listen for the error'], exp:'The error is read out on submit', obs:'Nothing is announced' },
  { sev:'info', title:'Team plan has no “Most popular” marker', sel:'section.pricing article:nth-child(2)', route:'/pricing', pin:12, sp:'plan', steps:['Open /pricing', 'Compare the three plan cards'], exp:'The default plan is marked', obs:'All three cards look equal' },
  { sev:'info', title:'Hero copy has two grammar slips', sel:'p.hero-sub', route:'/pricing', pin:13, sp:'sub', steps:['Open /pricing', 'Read the line under the headline'], exp:'“…teams collaborate on notes more easily.”', obs:'“…teams to collaborate on notes more easier.”' },
  { sev:'info', title:'Footer links have no hover state', sel:'footer a', route:'/pricing', pin:14, sp:'ft', steps:['Open /pricing and scroll to the footer', 'Hover Privacy, Terms and Status'], exp:'Links change on hover', obs:'No visible change' } ];
const SPEC = {
  cta:'<button type="button" class="rvs-cta" tabindex="-1">Start free trial</button>', tog:'<div style="display:inline-flex;border:1.5px solid var(--muted);border-radius:9px;padding:3px;gap:3px;font-size:12px"><span style="padding:4px 10px;border-radius:6px;background:var(--ink);color:var(--card)">Monthly</span><span style="padding:4px 10px">Yearly</span></div>',
  em:'<input class="rvs-em" placeholder="Work email" tabindex="-1" style="width:140px">', art:'<div class="rvs-art" style="height:64px;width:120px"><svg viewBox="0 0 220 120" width="100%" height="100%" aria-hidden="true"><rect x="22" y="58" width="26" height="46" rx="5" fill="var(--faint)"/><rect x="60" y="38" width="26" height="66" rx="5" fill="var(--muted)"/><rect x="98" y="24" width="26" height="80" rx="5" fill="var(--accent)"/><rect x="136" y="46" width="26" height="58" rx="5" fill="var(--muted)"/><rect x="174" y="30" width="26" height="74" rx="5" fill="var(--ink)"/></svg></div>',
  err:'<div style="width:150px"><input class="rvs-em" placeholder="Email" tabindex="-1" style="width:100%;border-color:var(--danger)"><div style="font-size:11.5px;color:var(--danger);margin-top:4px">Enter your work email</div></div>', plan:'<div class="rvs-pc" style="width:128px;padding:10px"><div class="rvs-pn">Team</div><div class="rvs-pr"><span class="rvs-pv" style="font-size:20px">$12</span></div><div class="rvs-pu">per seat per month</div></div>',
  sub:'<p class="rvs-sub" style="margin:0;width:150px;font-size:11.5px">Fieldnote helps teams to collaborate on notes more easier.</p>', ft:'<div class="rvs-sf" style="padding:0;border:0;font-size:12px"><span>Privacy</span><span>Terms</span><span>Status</span></div>' };

atom({ id:'reviewsummary', cat:'Agent activity', name:'Review summary', block:'Agents view run result + pin list (the review tool: “Changes”, findings with status, selector and evidence)', fam:['M','S','T'], wide:true, tall:true,
  html:`<style>${css('rvs')}
.rvs-pn{position:absolute;inset:12px;display:flex;flex-direction:column;overflow:hidden}
.rvs-hd{flex:none;display:flex;align-items:center;gap:10px;padding:12px 14px 4px}
.rvs-sm{flex:none;padding:0 14px;font-size:12.5px;color:var(--muted)}
.rvs-run{position:relative;flex:none;height:24px;border-radius:7px;border:0;background:var(--raised);overflow:hidden;font-size:12px;font-weight:600;white-space:nowrap}
.rvs-run>span{position:absolute;left:0;top:0;height:100%;display:flex;align-items:center;gap:6px;padding:0 9px}
.rvs-dot{width:7px;height:7px;border-radius:50%;background:currentColor}
.rvs-fl{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:12px 14px 10px}
.rvs-f{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:8px;border:0;background:var(--raised);font:500 12.5px var(--sans);cursor:pointer;white-space:nowrap}
.rvs-f .digits{font-weight:600}
.rvs-sh{margin-left:auto;font-size:12.5px;color:var(--muted);display:flex;align-items:center;gap:4px;white-space:nowrap}
.rvs-ls{position:relative;flex:1;min-height:0;overflow-y:auto;border-top:1px solid var(--line-soft)}
.rvs-em0{position:absolute;left:14px;right:14px;top:16px;margin:0;font-size:13px;color:var(--muted)}
.rvs-r{overflow:hidden}
.rvs-h{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:2px 10px;width:100%;padding:11px 14px;border:0;border-top:1px solid var(--line-soft);background:none;text-align:left;cursor:pointer;color:var(--ink)}
.rvs-r:first-child .rvs-h{border-top:0}
.rvs-h:hover{background:var(--raised)}
.rvs-t{font-size:13.5px;font-weight:500;line-height:1.35}
.rvs-m{grid-column:2;display:flex;flex-wrap:wrap;gap:2px 10px;font-size:12px;color:var(--muted)}
.rvs-pt{font-size:12px;color:var(--muted);font-weight:600}
.rvs-cv{display:grid;place-items:center;color:var(--muted)}
.rvs-in{display:grid;grid-template-columns:168px minmax(0,1fr);gap:8px 16px;padding:2px 14px 16px 14px}
.rvs-ev{display:flex;flex-direction:column;gap:6px}
.rvs-tn{display:grid;place-items:center;height:96px;border:0;border-radius:10px;background:var(--raised);overflow:hidden}
.rvs-cp{font-size:11.5px;color:var(--muted);line-height:1.4}
.rvs-tx b{display:block;font-size:12px;font-weight:600;margin-bottom:4px}
.rvs-tx ol{margin:0 0 10px;padding-left:18px;font-size:12.5px;line-height:1.5;color:var(--muted)}
.rvs-eo{display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12.5px}
.rvs-eo span{display:block;color:var(--muted);line-height:1.4}
.rvs-pn[data-n="1"] .rvs-in{grid-template-columns:1fr}
.rvs-pn[data-n="1"] .rvs-sh{margin-left:0;width:100%}
.rvs-pn[data-n="1"] .rvs-hd{flex-wrap:wrap;row-gap:8px}
.rvs-pn[data-n="1"] .rvs-hd>i{display:none}
.rvs-pn[data-n="1"] .rvs-run{order:5}
.rvs-pn[data-n="1"] .rvs-rp{margin-left:auto}
</style><section class="card rvs-pn" aria-label="Review summary">
  <div class="rvs-hd">${agentMark('rvs', 28)}${agentLine('rvs')}<i style="flex:1"></i><span class="rvs-run" role="status" aria-live="polite"><span class="rvs-r0"><i class="rvs-dot"></i>Reviewing</span><span class="rvs-r1">${ic(I.check, 13, 2.4)}Completed</span></span><button type="button" class="btn rvs-rp" style="padding:4px 10px;font-size:12.5px">Replay</button></div>
  <div class="rvs-sm">localhost:3000 · /pricing and /signup · 3 widths · 14 screenshots</div>
  <div class="rvs-fl" role="group" aria-label="Filter findings by severity"><button type="button" class="rvs-f" data-s="*" aria-pressed="true">All <span class="rvs-c"></span></button><button type="button" class="rvs-f" data-s="block" aria-pressed="false">${ic(SEV.block.i, 13, 2)}Blocking <span class="rvs-c"></span></button><button type="button" class="rvs-f" data-s="warn" aria-pressed="false">${ic(SEV.warn.i, 13, 2)}Should fix <span class="rvs-c"></span></button><button type="button" class="rvs-f" data-s="info" aria-pressed="false">${ic(SEV.info.i, 13, 2)}Suggestions <span class="rvs-c"></span></button><span class="rvs-sh" aria-live="polite">Showing <span class="rvs-sn"></span> of <span class="rvs-st2"></span></span></div>
  <div class="rvs-ls" role="list"><p class="rvs-em0">Assistant is reviewing /pricing and /signup…</p></div></section>`,
  desc:'Findings arrive one at a time, 130ms apart: each row fades up and opens its height while the severity counts roll up digit by digit and the Reviewing chip morphs to Completed. Severity chips are full-border chips and double as filters. Switching a filter closes unmatched rows to nothing while the rest slide up, and the Showing count rolls. Opening a finding eases its height open to the saved screenshot, the steps to reproduce, and expected against observed; opening another closes the first.',
  api:'row.en.set(1, t + i·130ms); digits.set(count)   chip.p.set(1): width, fill, label swap   row.vis.set(match ? 1 : 0)   row.h = (head + body·ex)·vis·en',
  init(st){
    const pn = $(st, '.rvs-pn'), ls = $(st, '.rvs-ls'), emp = $(st, '.rvs-em0'), rp = $(st, '.rvs-rp'), run = $(st, '.rvs-run'), r0 = $(st, '.rvs-r0'), r1 = $(st, '.rvs-r1'), fb = $$(st, '.rvs-f'), shW = $(st, '.rvs-sn'), tot = $(st, '.rvs-st2');
    const { at, run:runQ, clear } = queue(), sel = new Set(), cs = fb.map(b => new Digits($(b, '.rvs-c'), 2)), dShow = new Digits(shW, 2), dTot = new Digits(tot, 2), pr = new Track(0, S.base), emT = new Track(1, S.snap);
    let rows = [], started = false, openR = null, arrived = 0, lastKey = '', rw0 = 0, rw1 = 0;
    const SEVS = ['*', 'block', 'warn', 'info'];
    const count = k => rows.filter(r => r.en.target === 1 && (k === '*' || r.f.sev === k)).length;
    const shownN = () => rows.filter(r => r.en.target === 1 && r.vis.target === 1).length;
    const paint = () => { fb.forEach((b, i) => { const k = SEVS[i], on = k === '*' ? !sel.size : sel.has(k); b.setAttribute('aria-pressed', on); }); };
    const counts = inst => { fb.forEach((b, i) => cs[i].set(String(count(SEVS[i])), inst)); dShow.set(String(shownN()), inst); dTot.set(String(count('*')), inst); };
    const match = r => !sel.size || sel.has(r.f.sev);
    function build(){
      rows.forEach(r => r.el.remove()); rows = [];
      FINDINGS.forEach((f, i) => {
        const el = mk('div'); el.className = 'rvs-r'; el.setAttribute('role', 'listitem');
        el.innerHTML = `<button type="button" class="rvs-h" aria-expanded="false">${chip('rvs', f.sev)}<span class="rvs-t">${hx(f.title)}</span><span class="rvs-pt num">#${f.pin}</span><span class="rvs-cv">${ic(I.chev, 15)}</span><span class="rvs-m"><span class="rvs-sel">${hx(f.sel)}</span><span>${f.route}</span></span></button>
          <div class="rvs-bx"><div class="rvs-in"><div class="rvs-ev"><div class="rvs-tn">${SPEC[f.sp].replaceAll('rvs-cta', 'rvs-cta')}</div><div class="rvs-cp">Saved screenshot · 1280 × 800<br>Pin #${f.pin} · ${AGENT.name} · agent</div></div><div class="rvs-tx"><b>Steps to reproduce</b><ol>${f.steps.map(x => `<li>${hx(x)}</li>`).join('')}</ol><div class="rvs-eo"><div><b>Expected</b><span>${hx(f.exp)}</span></div><div><b>Observed</b><span>${hx(f.obs)}</span></div></div></div></div></div>`;
        ls.append(el);
        const r = { f, el, head:$(el, '.rvs-h'), bx:$(el, '.rvs-bx'), inn:$(el, '.rvs-in'), cv:$(el, '.rvs-cv'), en:new Track(0), vis:new Track(1), ex:new Track(0) };
        r.head.onclick = () => toggle(r); rows.push(r);
      });
    }
    function toggle(r){ const on = openR !== r; rows.forEach(x => { x.ex.set(on && x === r ? 1 : 0); x.head.setAttribute('aria-expanded', on && x === r); }); openR = on ? r : null; }
    function arrive(){
      FINDINGS.forEach((f, i) => at(.5 + i * .13, () => { rows[i].en.set(1); arrived++; emT.set(0); counts(false); }));
      at(.5 + FINDINGS.length * .13 + .3, () => pr.set(1));
    }
    function start(){
      clear(); build(); sel.clear(); openR = null; arrived = 0; pr.jump(0); emT.jump(1); paint(); counts(true); arrive(); fb.forEach(b => b.disabled = false);
    }
    fb.forEach((b, i) => b.onclick = () => {
      const k = SEVS[i]; if (k === '*') sel.clear(); else sel.has(k) ? sel.delete(k) : sel.add(k); if (sel.size === 3) sel.clear();
      paint(); rows.forEach((r, j) => r.vis.set(match(r) ? 1 : 0, S.base, now() + (match(r) ? .06 : 0) + j * .012)); if (openR && !match(openR)) toggle(openR); dShow.set(String(rows.filter(r => r.en.target === 1 && match(r)).length));
    });
    rp.onclick = start;
    const layout = () => { pn.dataset.n = st.clientWidth < 560 ? 1 : 0; r0.dataset.w = r0.offsetWidth; rw0 = r0.offsetWidth + 18; rw1 = r1.offsetWidth + 18; lastKey = st.clientWidth; };
    layout();
    return t => {
      runQ(t); if (st.clientWidth !== lastKey) layout(); if (!started){ started = true; layout(); start(); }
      if (!rw0 || !rw1) layout();
      const p = clamp(pr.at(t)); run.style.width = px(lerp(rw0, rw1, p)); run.style.background = mix(p, 'var(--success-tint)', 'transparent'); run.style.color = mix(p, 'var(--success)', 'var(--muted)'); run.style.borderColor = mix(p, 'var(--success)', 'var(--muted)');
      fade(r0, 1 - clamp(p * 2), 0, false); fade(r1, clamp(p * 2 - 1), 0, false); r0.querySelector('i').style.opacity = (.35 + .65 * (.5 + .5 * Math.sin(Math.PI * 2 * t * .9))).toFixed(3);
      emp.style.opacity = clamp(emT.at(t)).toFixed(3);
      rows.forEach(r => {
        const en = clamp(r.en.at(t)), v = clamp(r.vis.at(t)), ex = clamp(r.ex.at(t)), hh = r.head.offsetHeight, bh = r.inn.offsetHeight, m = en * v;
        r.el.style.height = px(Math.max(0, (hh + bh * ex) * m)); r.el.style.opacity = clamp(m * 1.4).toFixed(3); r.el.style.visibility = m < .01 ? 'hidden' : 'visible';
        r.head.style.transform = `translateY(${px((1 - en) * 8)})`; r.cv.style.transform = `rotate(${(ex * 180).toFixed(1)}deg)`; r.bx.style.opacity = clamp(ex * 1.3).toFixed(3); r.bx.style.filter = ex < .98 ? `blur(${((1 - ex) * BLUR).toFixed(2)}px)` : 'none';
      });
      cs.forEach(d => d.render(t)); dShow.render(t); dTot.render(t);
      fb.forEach((b, i) => { const k = SEVS[i], on = b.getAttribute('aria-pressed') === 'true', c = k === '*' ? 'var(--ink)' : SEVC[k], tt = k === '*' ? 'var(--raised)' : SEVT[k]; b.style.borderColor = on ? c : (k === '*' ? 'var(--line)' : `color-mix(in oklab, ${c} 55%, var(--card))`); b.style.background = on ? tt : 'transparent'; b.style.color = k === '*' ? 'var(--ink)' : c; });
    };
  }});

/* ================================================================ 6. Agent comment queue */
const QUEUE = [
  { k:'cta', sev:'block', sel:'button.cta-primary', no:7, text:'White text on this fill measures 2.9:1. WCAG AA needs 4.5:1 at this size; the accent fill measures 7.0:1.' },
  { k:'sub', sev:'info', sel:'p.hero-sub', no:8, text:'Two grammar slips in the line under the headline: “to collaborate” and “more easier”.' },
  { k:'art', sev:'warn', sel:'img.hero-art', no:9, text:'This image has no alt text, so screen readers read out the file name. Describe the chart or mark it decorative.' },
  { k:'plan', sev:'info', sel:'section.pricing article:nth-child(2)', no:10, text:'The Team plan has no “Most popular” marker, though the pricing doc calls it the default.' },
  { k:'email', sev:'warn', sel:'input#work-email', no:11, text:'The email field has no label. A placeholder disappears once you type and is not a reliable label.' } ];

atom({ id:'agentqueue', cat:'Agent activity', name:'Agent comment queue', block:'Agents view: pins from a finished run (the review tool “Changes”, pin list, Follow)', fam:['M','E','D','X','T'], wide:true, tall:true,
  html:`<style>${css('agq')}
.agq-sb{position:absolute;left:0;top:0;z-index:30;overflow:hidden;visibility:hidden}
.agq-sn,.agq-sl{position:absolute;left:0;top:0}
.agq-sn{display:flex;align-items:center;gap:10px;padding:0 8px 0 10px;height:46px;font-size:13px;white-space:nowrap}
.agq-sn span.agq-tx{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
.agq-sn .btn,.agq-sl .btn{padding:4px 11px;font-size:12.5px}
.agq-ib{border:0;background:none;color:var(--muted);padding:5px;border-radius:7px;cursor:pointer;display:grid;place-items:center}
.agq-ib:hover:not([disabled]){background:var(--raised);color:var(--ink)}
.agq-ib[disabled]{color:var(--muted);opacity:.55;cursor:default}
.agq-sl{padding:10px 10px 14px 14px}
.agq-r1{display:flex;align-items:center;gap:8px}
.agq-r1 .agq-cn{flex:1;font-size:12.5px;color:var(--muted);display:flex;justify-content:center;gap:4px;align-items:center}
.agq-r2{display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap;padding-right:4px}
.agq-r2 .agq-pt{font-size:12px;font-weight:600;color:var(--muted)}
.agq-dt{position:relative;margin:6px 4px 0 0}
.agq-dt>p{position:absolute;left:0;top:0;right:0;margin:0;font-size:13.5px;line-height:1.45}
.agq-tks{position:relative;display:flex;gap:6px;margin:12px 4px 0 0}
.agq-tk{position:relative;flex:1;height:18px;padding:0;border:0;background:none;cursor:pointer}
.agq-tk::before{content:"";position:absolute;left:0;right:0;top:6px;height:6px;border-radius:3px;background:var(--raised)}
.agq-tp{position:absolute;left:0;top:6px;height:6px;border-radius:3px;background:var(--ink);pointer-events:none}
.agq-tf{position:absolute;left:0;top:0;border:1.5px solid var(--ink);border-radius:8px;pointer-events:none!important;z-index:2;visibility:hidden}
.agq-sn .agq-tx{display:flex;align-items:baseline;white-space:pre}
.agq-sc{margin:0 .3em}
.agq-sm{display:grid}
.agq-r1 .agq-cn{white-space:nowrap}
.agq-root[data-n="1"] .agq-cw,.agq-root[data-n="1"] .agq-on,.agq-root[data-n="1"] .agq-nm{display:none}
</style><div class="agq-root">
  <div class="agq-bar"><span class="agq-who">${agentMark('agq', 26)}${agentLine('agq')}</span><span class="agq-st" role="status" aria-live="polite"><span>Finished the review of /pricing</span><span></span></span><button type="button" class="btn agq-rp">Replay</button></div>
  ${siteFrame('agq')}</div>`,
  desc:'When the run finishes the snackbar rises and its count rolls up as five pins drop onto the page 90ms apart. Review morphs that same snackbar into a sheet that steps through the pins: the page scrolls so the pin sits in the visible part above the sheet, the selector frame travels to it with leading edges first, the text swaps with blur, the count rolls and the progress plate slides to the new tick. Arrow keys and ticks jump directly; Escape or Done folds the sheet back to the snackbar.',
  api:'pins[i].fy.set(0, t + i·90ms)   digits.set(n)   bar.m.set(1): rect lerp(snackbar → sheet)   page.sc.set(y)   box.go(prev → pin)   plate.go(l, r)   swap.to(detail)',
  init(st){
    const root = $(st, '.agq-root'), site = new Site(st, 'agq'), ov = site.ov, stEls = $$(st, '.agq-st>span'), rp = $(st, '.agq-rp');
    const { at, run, clear } = queue(), stw = new Swap(0), dsw = new Swap(0), box = new Box();
    const tf = mk('div'); tf.className = 'agq-tf'; ov.append(tf);
    const sb = mk('div'), sn = mk('div'), sl = mk('div'); sb.className = 'agq-sb card'; sn.className = 'agq-sn'; sl.className = 'agq-sl'; sb.setAttribute('role', 'region'); sb.setAttribute('aria-label', 'Agent review comments');
    sn.innerHTML = `<span class="agq-sm">${agentMark('agq', 24)}</span><span class="agq-tx"><span class="agq-nm">${AGENT.name} left </span><span class="agq-sc"></span> comments<span class="agq-on"> on /pricing</span></span><button type="button" class="btn ink agq-rv">Review</button><button type="button" class="agq-ib agq-dm" aria-label="Dismiss notification">${ic(I.x, 14)}</button>`;
    sl.innerHTML = `<div class="agq-r1">${agentMark('agq', 22)}${agentLine('agq')}<span class="agq-cn" aria-live="polite"><span class="agq-cw">Comment </span><span class="agq-cd"></span> of ${QUEUE.length}</span><button type="button" class="agq-ib agq-pv" aria-label="Previous comment">${ic('<path d="m15 6-6 6 6 6"/>', 16)}</button><button type="button" class="agq-ib agq-nx" aria-label="Next comment">${ic('<path d="m9 6 6 6-6 6"/>', 16)}</button><button type="button" class="agq-ib agq-cl" aria-label="Close review">${ic(I.x, 15)}</button></div>
      <div class="agq-r2"><span class="agq-chs"></span><span class="agq-sel"></span><span class="agq-pt"></span></div><div class="agq-dt"><p></p><p></p></div>
      <div class="agq-tks" role="group" aria-label="Comments in this review">${QUEUE.map((q, i) => `<button type="button" class="agq-tk" aria-label="Comment ${i + 1}, ${SEV[q.sev].l}, ${q.sel}"></button>`).join('')}<i class="agq-tp"></i></div>`;
    sb.append(sn, sl); ov.append(sb);
    const rv = $(sn, '.agq-rv'), dm = $(sn, '.agq-dm'), pv = $(sl, '.agq-pv'), nxB = $(sl, '.agq-nx'), cl = $(sl, '.agq-cl'), chs = $(sl, '.agq-chs'), selE = $(sl, '.agq-sel'), ptE = $(sl, '.agq-pt'), dt = $(sl, '.agq-dt'), dps = $$(dt, 'p'), tks = $$(sl, '.agq-tk'), tp = $(sl, '.agq-tp');
    const dSn = new Digits($(sn, '.agq-sc'), 1), dCur = new Digits($(sl, '.agq-cd'), 1);
    const mT = new Track(0, S.base), sT = new Track(0), dh = new Track(40, S.soft), plate = edges(0, 0);
    let pins = [], cur = -1, open = false, started = false, W = 0, H = 0, SW = 400, SLW = 300, lastKey = '', lastBox = null, count = 0, narrow = false, dismissed = false;
    const anchorRaw = p => { const r = site.rect(p.f.k); return { x:clamp(r.x + r.w, 14, W - 14), y:r.y, r }; };
    const layout = () => { W = ov.clientWidth; H = ov.clientHeight; if (!W) return; narrow = W < 480; root.dataset.n = st.clientWidth < 560 ? 1 : 0; SW = Math.min(W - 16, 440); SLW = W - 16; sn.style.width = px(SW); sl.style.width = px(SLW); lastKey = st.clientWidth + ':' + W + ':' + H; tickGeo(true); };
    const tickGeo = inst => { if (cur < 0) return; const b = tks[cur], l = b.offsetLeft, r = l + b.offsetWidth; inst ? plate.jump(l, r) : plate.go(l, r); };
    const sheetH = () => sl.offsetHeight;
    const fillDetail = (i, k) => { const q = QUEUE[i]; dps[k].textContent = q.text; };
    function go(i, inst){
      if (i < 0 || i >= QUEUE.length) return; const q = QUEUE[i], first = cur < 0; cur = i; const k = dsw.cur ^ 1; fillDetail(i, k); if (!first) dsw.to(k); else { dsw.cur = k; dsw.prev = null; dsw.t = -9; }
      dh.set(dps[k].offsetHeight); if (first) dh.jump(dps[k].offsetHeight);
      chs.innerHTML = chip('agq', q.sev); selE.textContent = q.sel; ptE.textContent = '#' + q.no; dCur.set(String(i + 1), first);
      tickGeo(first); pv.disabled = i === 0; nxB.setAttribute('aria-label', i === QUEUE.length - 1 ? 'Finish review' : 'Next comment');
      tks.forEach((b, j) => b.setAttribute('aria-current', j === i));
      site.cover = sheetH() + 8; const moved = site.go(q.k);
      const d = moved ? .45 : .05;
      at(d, () => { const r = site.rect(q.k), to = { x:r.x - 4, y:r.y - 4, w:r.w + 8, h:r.h + 8 }; box.go(lastBox && box.o.at(now()) > .05 ? lastBox : { x:to.x + to.w / 2, y:to.y + to.h / 2, w:0, h:0 }, to); box.o.set(1, S.base); });
    }
    function openSheet(i){
      if (open){ go(i); return; } open = true; layout(); cur = -1; go(i, true); mT.set(1); dm.tabIndex = -1; rv.tabIndex = -1; at(.25, () => nxB.focus({ preventScroll:true }));
    }
    function closeSheet(){
      if (!open) return; open = false; mT.set(0); box.o.set(0, S.base); cur0 = cur; cur = -1; pins.forEach(p => p.label(false)); rv.tabIndex = 0; dm.tabIndex = 0;
      site.sc.set(Math.min(site.sc.target, site.ct.offsetHeight - site.pg.clientHeight)); at(.6, () => { if (!open) site.cover = 0; }); at(.3, () => rv.focus({ preventScroll:true }));
    }
    let cur0 = 0;
    rv.onclick = () => openSheet(0); cl.onclick = closeSheet; pv.onclick = () => go(cur - 1);
    nxB.onclick = () => cur === QUEUE.length - 1 ? closeSheet() : go(cur + 1);
    tks.forEach((b, i) => b.onclick = () => go(i));
    dm.onclick = () => { dismissed = true; sT.set(0, S.snap); };
    st.addEventListener('keydown', e => { if (!open) return; if (e.key === 'Escape'){ e.preventDefault(); closeSheet(); } else if (e.key === 'ArrowRight' && !e.target.closest('input,textarea')){ e.preventDefault(); go(Math.min(cur + 1, QUEUE.length - 1)); } else if (e.key === 'ArrowLeft'){ e.preventDefault(); go(Math.max(cur - 1, 0)); } });
    function start(){
      clear(); pins.forEach(p => p.wrap.remove()); pins = []; open = false; cur = -1; count = 0; dismissed = false; mT.jump(0); sT.jump(0); box.o.jump(0); lastBox = null; site.cover = 0; site.sc.jump(0); dSn.set('0', true); stw.cur = 0; stw.prev = null; stw.t = -9; layout();
      at(.5, () => { sT.set(1); });
      QUEUE.forEach((q, i) => at(1.0 + i * .09, () => { const p = new Pin('agq', ov, q, sb); p.btn.onclick = () => openSheet(i); p.label(false); pins.push(p); count++; dSn.set(String(count)); }));
      at(1.6, () => { stw.to(0); });
    }
    rp.onclick = start;
    layout();
    return t => {
      run(t); if (st.clientWidth + ':' + ov.clientWidth + ':' + ov.clientHeight !== lastKey) layout(); if (!W) return;
      if (!started){ started = true; start(); }
      site.draw(t);
      pins.forEach((p, i) => { const a = anchorRaw(p), vis = clamp(1 - Math.max(0, -a.y + 4, a.y - H + 4) / 14); p.draw(t, a.x, clamp(a.y, 14, H - 14), open && cur === i, vis * clamp(((open ? H - sheetH() - 10 : H) - a.y) / 14 + .5)); });
      // the selector frame, then the snackbar that is also the sheet
      const live = open && cur >= 0 ? site.rect(QUEUE[cur].k) : null, bo = clamp(box.o.at(t));
      if (live && bo > .005){ const r = box.at(t, { x:live.x - 4, y:live.y - 4, w:live.w + 8, h:live.h + 8 }); lastBox = r; const s = tf.style; s.visibility = 'visible'; s.opacity = bo.toFixed(3); s.transform = `translate(${px(r.x)},${px(r.y)})`; s.width = px(r.w); s.height = px(r.h); } else tf.style.visibility = 'hidden';
      const m = clamp(mT.at(t)), so = clamp(sT.at(t)), dhh = dh.at(t); dt.style.height = px(dhh);
      const shh = sheetH(), w = lerp(SW, SLW, m), h = lerp(46, shh, m), x = lerp((W - SW) / 2, 8, m), y = H - lerp(12, 8, m) - h, a = Math.max(so, m);
      const s = sb.style; s.visibility = a < .01 ? 'hidden' : 'visible'; s.opacity = a.toFixed(3); s.transform = `translate(${px(x)},${px(y + (1 - so) * 12 * (1 - m))})`; s.width = px(w); s.height = px(h); s.borderRadius = px(lerp(23, 14, m)); s.pointerEvents = a > .5 ? 'auto' : 'none';
      fade(sn, clamp(1 - m * 2), 0, true); sn.style.pointerEvents = m < .3 ? 'auto' : 'none'; fade(sl, clamp(m * 2 - 1), (1 - clamp(m * 2 - 1)) * 4, true); sl.style.pointerEvents = m > .7 ? 'auto' : 'none'; sn.style.visibility = m > .98 ? 'hidden' : 'visible'; sl.style.visibility = m < .02 ? 'hidden' : 'visible';
      dps.forEach((pp, k) => dsw.apply(pp, k, t, 3)); tp.style.transform = `translateX(${px(plate.A.at(t))})`; tp.style.width = px(plate.B.at(t) - plate.A.at(t));
      dSn.render(t); dCur.render(t); layers(stw, stEls, t, 3);
    };
  }});

/* ================================================================ 7. Needs a human decision */
// a status chip whose width, colour and label morph through its states
class Chip {
  constructor(el, states){ this.el = el; this.st = states; this.ls = $$(el, ':scope > span'); this.v = new Track(0, S.base); this.w = []; }
  measure(){ this.w = this.ls.map(l => l.offsetWidth + 2); }
  set(i){ this.v.set(i); }
  draw(t){
    if (!this.w.length || this.w.some(x => !x)) this.measure(); const n = this.st.length, v = clamp(this.v.at(t), 0, n - 1), i = Math.min(n - 2, Math.floor(v)), f = v - i, a = this.st[i], b = this.st[i + 1], s = this.el.style;
    s.width = px(lerp(this.w[i], this.w[i + 1], f)); s.background = mix(f, b.t, a.t); s.color = mix(f, b.c, a.c); s.borderColor = mix(f, b.c, a.c);
    this.ls.forEach((l, k) => { const o = clamp(1 - Math.abs(v - k) * 2); l.style.opacity = o.toFixed(3); l.style.visibility = o < .01 ? 'hidden' : 'visible'; });
  }
}
const OPTS = [
  { t:'$12 per seat', s:'Pricing page, this page', say:'Thanks. I’ll treat $12 as current, flag the checkout page as out of date, and carry on with /signup.' },
  { t:'$15 per seat', s:'Checkout page', say:'Thanks. I’ll treat $15 as current, flag this pricing page as out of date, and carry on with /signup.' },
  { t:'Not sure yet', s:'Ask finance later', say:'Understood. I’ll leave both prices alone, note the mismatch for finance, and carry on with /signup.' } ];
const RUN = ['Opening /signup', 'Checking form labels', 'Capturing evidence', 'Left 2 new comments on /signup'];
const FIND7 = { k:'plan', sev:'warn', sel:'section.pricing article:nth-child(2) .price', no:9 };
const CHIP_W = { c:'var(--warning)', t:'var(--warning-tint)' }, CHIP_S = { c:'var(--success)', t:'var(--success-tint)' }, CHIP_N = { c:'var(--muted)', t:'var(--raised)' };

atom({ id:'handoff', cat:'Agent activity', name:'Needs a human decision', block:'Agent hand-off on a pin (proposed; uses the review tool run status + pin discussion)', fam:['M','S','T','X'], wide:true, tall:true,
  html:`<style>${css('hno')}
.hno-run{position:relative;flex:none;height:24px;border-radius:7px;border:0;overflow:hidden;font-size:12px;font-weight:600;white-space:nowrap}
.hno-run>span{position:absolute;left:0;top:0;height:100%;display:flex;align-items:center;gap:6px;padding:0 9px}
.hno-dot{width:7px;height:7px;border-radius:50%;background:currentColor}
.hno-cc{padding:12px}
.hno-hd{display:flex;align-items:center;gap:8px}
.hno-x{border:0;background:none;color:var(--muted);padding:3px;border-radius:7px;cursor:pointer;display:grid;place-items:center}
.hno-q{margin:12px 0 0;font-size:13.5px;line-height:1.45}
.hno-q b{font-weight:600}
.hno-ow{overflow:hidden}
.hno-oi{position:relative;padding-top:10px}
.hno-pl{position:absolute;left:0;right:0;top:0;border-radius:10px;background:var(--raised)}
.hno-o{position:relative;display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;border:0;border-radius:10px;background:none;text-align:left;cursor:pointer;color:var(--ink)}
.hno-rd{position:relative;flex:none;width:16px;height:16px;border-radius:50%;border:1.5px solid var(--muted)}
.hno-rd i{position:absolute;inset:3px;border-radius:50%;background:var(--ink)}
.hno-o b{display:block;font-size:13px;font-weight:600;line-height:1.3}
.hno-o span.s{display:block;font-size:12px;color:var(--muted);line-height:1.3}
.hno-fo{display:flex;align-items:center;gap:10px;margin-top:10px}
.hno-fo .btn{padding:5px 12px;font-size:12.5px;white-space:nowrap;flex:none}
.hno-fo .hn{font-size:12px;color:var(--muted)}
.hno-aw{overflow:hidden}
.hno-ai{padding-top:12px;display:grid;gap:10px}
.hno-m{display:flex;gap:8px;align-items:flex-start;font-size:13px;line-height:1.45}
.hno-m>div{min-width:0;flex:1}
.hno-m b{display:block;font-size:12.5px;font-weight:600;line-height:1.3;margin-bottom:1px}
.hno-w{display:inline-block;white-space:pre-wrap}
.hno-rn{position:relative;overflow:hidden}
.hno-ri{position:relative;height:22px;margin-top:12px;font-size:12.5px;color:var(--muted);display:flex;align-items:center;gap:8px}
.hno-ri>span.l{position:absolute;left:16px;top:0;height:22px;display:flex;align-items:center;white-space:nowrap}
.hno-ri .hno-dot{flex:none;background:var(--muted)}
.hno-sc{position:relative;flex:none;height:22px;border-radius:6px;border:0;overflow:hidden;font-size:11.5px;font-weight:600;white-space:nowrap}
.hno-sc>span{position:absolute;left:0;top:0;height:100%;display:flex;align-items:center;gap:4px;padding:0 7px}
.hno-hd .hno-sc{margin-left:auto}
.hno-root[data-n="1"] .hno-bar .hno-an{display:none}
.hno-root[data-n="1"] .hno-hd{flex-wrap:wrap;row-gap:8px}
.hno-root[data-n="1"] .hno-hd .hno-sc{order:5;margin-left:0}
.hno-root[data-n="1"] .hno-hd .hno-x{order:6;margin-left:auto}
</style><div class="hno-root">
  <div class="hno-bar"><span class="hno-who">${agentMark('hno', 26)}${agentLine('hno')}</span><span class="hno-st"></span><i style="flex:1"></i><span class="hno-run" role="status" aria-live="polite"><span>${ic(SEV.warn.i, 13, 2)}Paused for your decision</span><span><i class="hno-dot"></i>Running</span></span><button type="button" class="btn hno-rp">Replay</button></div>
  ${siteFrame('hno')}</div>`,
  desc:'The agent pauses on a pin it cannot settle alone. The pin falls with a question mark and a warning dot, and its card grows out of it with a Needs a human decision chip. Choosing an option slides a plate between the three rows (leading edge first). Send answer closes the options and the button away, echoes your choice, and the agent’s acknowledgement reveals word by word. Meanwhile both status chips morph in place from warning to success to running, the pin’s question mark swaps for its number, and a one-line run status steps through what the agent does next.',
  api:'pin.fy.set(0); pin.qm.set(1)   plate.go(top, bottom)   ans.set(1): options.h → 0   ack.words reveal   chip.v.set(0 → 1 → 2): width, fill, label   pin.qm.set(0)   run.swap(i)',
  init(st){
    const root = $(st, '.hno-root'), site = new Site(st, 'hno'), ov = site.ov, topChip = new Chip($(st, '.hno-run'), [{ ...CHIP_W }, { c:'var(--accent)', t:'var(--accent-tint)' }]), rp = $(st, '.hno-rp');
    const { at, run, clear } = queue(), plateE = edges(0, 0), runSw = new Swap(0);
    const ck = mk('div'), cc = mk('div'); ck.className = 'hno-ck card'; ck.setAttribute('role', 'dialog'); ck.setAttribute('aria-label', `Decision needed on pin ${FIND7.no}`); cc.className = 'hno-cc';
    cc.innerHTML = `<div class="hno-hd">${agentMark('hno', 24)}${agentLine('hno')}<span class="hno-sc"><span>${ic(SEV.warn.i, 12, 2)}Needs a human decision</span><span>${ic(I.check, 12, 2.4)}Answered</span><span><i class="hno-dot"></i>Continuing</span></span><button type="button" class="hno-x" aria-label="Close">${ic(I.x, 14)}</button></div>
      <p class="hno-q">The Team plan costs <b>$12 per seat</b> on this page but <b>$15 per seat</b> on /checkout. Which price is current?</p>
      <div class="hno-ow"><div class="hno-oi" role="radiogroup" aria-label="Which price is current"><div class="hno-pl"></div>${OPTS.map((o, i) => `<button type="button" class="hno-o" role="radio" aria-checked="false" tabindex="${i ? -1 : 0}"><span class="hno-rd"><i></i></span><span><b>${hx(o.t)}</b><span class="s">${hx(o.s)}</span></span></button>`).join('')}<div class="hno-fo"><button type="button" class="btn ink hno-sd" disabled>Send answer</button><span class="hn">Assistant is paused until you answer.</span></div></div></div>
      <div class="hno-aw"><div class="hno-ai"><div class="hno-m">${person('hno', 'YO', 22)}<div><b>You</b><span class="hno-yc"></span></div></div><div class="hno-m">${agentMark('hno', 22)}<div><b>Assistant</b><span class="hno-at"></span></div></div></div></div>
      <div class="hno-rn"><div class="hno-ri" role="status" aria-live="polite"><i class="hno-dot"></i>${RUN.map(r => `<span class="l">${r}</span>`).join('')}</div></div>`;
    ck.append(cc); ov.append(ck);
    const sc = new Chip($(cc, '.hno-sc'), [{ ...CHIP_W }, { ...CHIP_S }, { ...CHIP_N }]), hd = $(cc, '.hno-hd'), q = $(cc, '.hno-q'), ow = $(cc, '.hno-ow'), oi = $(cc, '.hno-oi'), pl = $(cc, '.hno-pl'), os = $$(cc, '.hno-o'), sd = $(cc, '.hno-sd'), hn = $(cc, '.hno-fo .hn'), aw = $(cc, '.hno-aw'), ai = $(cc, '.hno-ai'), yc = $(cc, '.hno-yc'), at2 = $(cc, '.hno-at'), rn = $(cc, '.hno-rn'), ri = $(cc, '.hno-ri'), rls = $$(ri, 'span.l'), rdot = $(ri, '.hno-dot');
    const co = new Track(0), oxT = new Track(0), oyT = new Track(0), ans = new Track(0, S.base), ak = new Track(0, S.base), rt = new Track(0, S.base), sT = new Track(0, S.snap), po = new Track(0), rds = os.map(() => new Track(0, S.snap));
    let pin = null, sel = false, choice = -1, answered = false, started = false, W = 0, H = 0, CW = 320, narrow = false, lastKey = '', words = [], ts = 0, natO = 0, natA = 0;
    const layout = () => { W = ov.clientWidth; H = ov.clientHeight; if (!W) return; narrow = W < 480; root.dataset.n = st.clientWidth < 560 ? 1 : 0; CW = Math.round(narrow ? W - 16 : clamp(W * .34, 300, 340)); ck.style.width = px(CW); cc.style.width = px(CW); lastKey = st.clientWidth + ':' + W + ':' + H; topChip.measure(); sc.measure(); };
    const anchor = () => { const r = site.rect('plan'); return { x:clamp(r.x + r.w, 14, W - 14), y:clamp(r.y, 14, H - 14), r }; };
    const rowGeo = i => [os[i].offsetTop, os[i].offsetTop + os[i].offsetHeight];
    function choose(i){
      if (answered) return; const first = choice < 0; choice = i; os.forEach((o, j) => { o.setAttribute('aria-checked', j === i); o.tabIndex = j === i ? 0 : -1; rds[j].set(j === i ? 1 : 0); }); const [a, b] = rowGeo(i);
      first ? (plateE.jump(a, b), po.set(1)) : plateE.go(a, b); sd.disabled = false; sT.set(1); hn.textContent = 'Assistant will carry on as soon as you send.';
    }
    function send(){
      if (choice < 0 || answered) return; answered = true; const o = OPTS[choice]; yc.textContent = `${o.t}. ${o.s}.`; at2.innerHTML = o.say.split(' ').map(w => `<span class="hno-w">${hx(w)} </span>`).join(''); words = $$(at2, '.hno-w'); words.forEach(w => w.style.opacity = 0);
      natA = ai.offsetHeight; ans.set(1); sc.set(1); topChip.set(1); pin.qm.set(0); pin.label(sel); os.forEach(b => b.disabled = true); ak.set(1); at(.4, () => { ts = now(); });
      at(.4 + words.length * .05 + .35, () => { sc.set(2); rt.set(1); runSw.cur = 0; runSw.prev = null; runSw.t = -9; });
      RUN.forEach((r, i) => i && at(.4 + words.length * .05 + .35 + i * 1.3, () => runSw.to(i)));
    }
    function open(){ layout(); sel = true; site.cover = narrow ? H - 190 : 0; site.go('plan'); const a = anchor(), pp = placeBeside(a.x, a.y, CW, 340, W, H, a.r); oxT.jump(pp.x - a.x); oyT.jump(pp.y - a.y); co.set(1, S.base); pin.label(true); }
    function close(focus){ if (!sel) return; sel = false; co.set(0, S.base); pin.label(false); if (site.cover){ site.sc.set(Math.min(site.sc.target, site.ct.offsetHeight - site.pg.clientHeight)); at(.6, () => { if (!sel) site.cover = 0; }); } if (focus) at(.06, () => pin.btn.focus({ preventScroll:true })); }
    function start(){
      clear(); if (pin){ pin.wrap.remove(); pin = null; } sel = false; choice = -1; answered = false; words = []; yc.textContent = ''; at2.textContent = '';
      [co, ans, ak, rt, sT, po].forEach(x => x.jump(0)); rds.forEach(x => x.jump(0)); sc.v.jump(0); topChip.v.jump(0); os.forEach(b => { b.disabled = false; b.setAttribute('aria-checked', 'false'); }); sd.disabled = true; hn.textContent = 'Assistant is paused until you answer.';
      layout(); site.cover = narrow ? H - 190 : 0; site.sc.jump(0); runSw.cur = 0; runSw.prev = null; runSw.t = -9; natO = 0;
      const moved = site.go('plan'), d = moved ? .62 : .14;
      at(d, () => { pin = new Pin('hno', ov, FIND7); pin.qm.jump(1); pin.btn.onclick = () => sel ? close(true) : open(); pin.label(false); });
      at(d + .4, () => open());
    }
    os.forEach((b, i) => { b.onclick = () => choose(i); b.onkeydown = e => { const k = { ArrowDown:1, ArrowRight:1, ArrowUp:-1, ArrowLeft:-1 }[e.key]; if (!k) return; e.preventDefault(); const j = (i + k + os.length) % os.length; choose(j); os[j].focus(); }; });
    sd.onclick = send; $(cc, '.hno-x').onclick = () => close(true); rp.onclick = start;
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && sel){ e.preventDefault(); close(true); } });
    layout();
    return t => {
      run(t); if (st.clientWidth + ':' + ov.clientWidth + ':' + ov.clientHeight !== lastKey) layout(); if (!W) return;
      if (!started){ started = true; start(); }
      site.draw(t); const a = anchor(); if (pin) pin.draw(t, a.x, a.y, sel);
      topChip.draw(t);
      const o = clamp(co.at(t));
      if (pin && o > .002){
        // option and answer blocks have animated heights; the card height follows
        if (!natO) natO = oi.offsetHeight; const an = clamp(ans.at(t)), akk = clamp(ak.at(t)), rr = clamp(rt.at(t));
        ow.style.height = an > .999 ? '0px' : px(natO * (1 - an)); ow.style.opacity = clamp(1 - an * 1.6).toFixed(3); aw.style.height = akk < .001 ? '0px' : px((natA || ai.offsetHeight) * akk); aw.style.opacity = clamp(akk * 1.4).toFixed(3); rn.style.height = px(34 * rr); rn.style.opacity = rr.toFixed(3);
        const chh = cc.offsetHeight, s = ck.style, w = lerp(26, CW, o), h = lerp(26, chh, o);
        const tx = narrow ? 8 : clamp(a.x + oxT.at(t), 8, Math.max(8, W - CW - 8)), ty = narrow ? H - chh - 8 : clamp(a.y + oyT.at(t), 8, Math.max(8, H - chh - 8));
        s.visibility = 'visible'; s.transform = `translate(${px(lerp(a.x - 13, tx, o))},${px(lerp(a.y - 13, ty, o))})`; s.width = px(w); s.height = px(h); s.borderRadius = px(lerp(8, 14, o)); s.background = mix(clamp(o * 1.5), 'var(--card)', 'var(--ink)'); s.pointerEvents = o > .5 ? 'auto' : 'none'; s.overflow = 'hidden'; s.zIndex = 30;
        const cin = clamp((o - .5) * 2); fade(cc, cin, (1 - cin) * 3);
        os.forEach((b, i) => { const r = clamp(rds[i].at(t)); b.firstElementChild.firstElementChild.style.opacity = r.toFixed(3); b.firstElementChild.style.borderColor = mix(r, 'var(--ink)', 'var(--muted)'); });
        plate(pl, plateE.A.at(t), plateE.B.at(t)); pl.style.opacity = clamp(po.at(t)).toFixed(3); sd.style.opacity = (.45 + .55 * clamp(sT.at(t))).toFixed(3);
        sc.draw(t); rls.forEach((l, i) => runSw.apply(l, i, t, 3)); rdot.style.opacity = (.35 + .65 * (.5 + .5 * Math.sin(Math.PI * 2 * t * .9))).toFixed(3);
        words.forEach((w2, i) => { const p = clamp(prog(t, ts + i * .05, S.snap)); if (!ts) return; w2.style.opacity = p.toFixed(3); w2.style.transform = `translateY(${px((1 - p) * 3)})`; });
      } else ck.style.visibility = 'hidden';
    };
  }});

})();