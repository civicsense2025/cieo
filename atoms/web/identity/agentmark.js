/* ---- agent mark: Meridian-family identity for agents (replaces the 4-point star) ----
   Grounded in the Meridian brand package: the umbrella mark is a globe of meridian lines
   with a tilted equator, icons are 1.7 ink lines on a paper tile with one pale wash, and
   the stated AI principle is "AI by invitation". People are round; agents are square. */
(() => {
const INK = '#1d1d1b', PAPER = '#faf7f2', WASH = { meridian:'#dce8fb', velo:'#f1e4ff' }, DANGER = '#b0342f';
const WASHP = 'M14 52C19 21 45 12 55 20C49 44 34 55 14 52Z';
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, a = {}, kids = []) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); kids.forEach(c => e.appendChild(c)); return e; };
const f1 = v => v.toFixed(1);
// arc of a meridian between two poles, bulging by a (cubic peak = .75a)
const arcD = (x, y0, y1, a) => { const h = y1 - y0; return `M${x} ${y0}C${f1(x + a)} ${f1(y0 + h*.2)} ${f1(x + a)} ${f1(y1 - h*.2)} ${x} ${y1}`; };

/* Concepts, all on the 64 grid of the brand icon set.
   draw(o, p): p = { t, w (0 rest … 1 working), th (meridian angle) } */
const CONCEPTS = [
  { k:'meridian', name:'Meridian', wash:WASH.meridian, rec:true,
    why:'One meridian from the umbrella mark, turning on its axis. Rests at an angle; turns while the agent works.',
    build(g){ return { ax:g.appendChild(sv('path', { d:'M32 15V49' })), arc:g.appendChild(sv('path')), eq:g.appendChild(sv('path', { d:'M15 35L49 29' })) }; },
    draw(o, p){ const a = lerp(14, 24*Math.sin(p.th), p.w), back = p.w*clamp(-Math.cos(p.th)*3);
      o.arc.setAttribute('d', arcD(32, 15, 49, a)); o.arc.style.opacity = f1(1 - .6*back); } },
  { k:'lens', name:'Lens', wash:WASH.velo,
    why:'Velo’s lens squared off, with a small meridian inside: the agent looking closely at the page.',
    build(g){ g.appendChild(sv('rect', { x:12, y:12, width:28, height:28, rx:8 })); g.appendChild(sv('path', { d:'M40 40L51 51' }));
      return { ax:g.appendChild(sv('path', { d:'M26 19V33' })), arc:g.appendChild(sv('path')) }; },
    draw(o, p){ o.arc.setAttribute('d', arcD(26, 19, 33, lerp(8, 10*Math.sin(p.th), p.w))); } },
  { k:'orbit', name:'Orbit', wash:WASH.meridian,
    why:'Meridian’s orbit icon as an eye with a square pupil. The pupil goes where the agent is paying attention.',
    build(g){ g.appendChild(sv('path', { d:'M12 32C21 14 43 14 52 32C43 50 21 50 12 32Z' }));
      return { pu:g.appendChild(sv('rect', { width:11, height:11, rx:3 })), x:new Track(32), y:new Track(32), i:-1 }; },
    draw(o, p){ const P = [[32,32],[24,28],[40,29],[36,36],[26,35]], i = p.w > .5 ? 1 + Math.floor(p.t/1.1) % 4 : 0;
      if (i !== o.i){ o.i = i; o.x.set(P[i][0], S.base, p.t); o.y.set(P[i][1], S.base, p.t); }
      o.pu.setAttribute('x', f1(o.x.at(p.t) - 5.5)); o.pu.setAttribute('y', f1(o.y.at(p.t) - 5.5)); } },
  { k:'path', name:'Path', wash:WASH.velo,
    why:'Meridian’s path icon with square nodes. The agent is the lead node and draws its own trail as it moves.',
    build(g){ const pa = g.appendChild(sv('path', { d:'M14 46C20 34 26 30 34 27C40 25 44 20 50 16' }));
      const nd = [[14,46],[34,27]].map(([x, y]) => g.appendChild(sv('rect', { x:x - 3.5, y:y - 3.5, width:7, height:7, rx:2 })));
      const hd = g.appendChild(sv('rect', { width:9, height:9, rx:2.5, class:'amk-fill' })); return { pa, nd, hd, L:0 }; },
    draw(o, p){ if (!o.L) o.L = o.pa.getTotalLength() || 52; const c = (p.t % 2.4)/1.7, q = p.w > .5 ? clamp(prog(c, 0, S.soft)) : 1, s = o.L*q;
      o.pa.style.strokeDasharray = o.L; o.pa.style.strokeDashoffset = f1(o.L - s); const pt = o.pa.getPointAtLength(s);
      o.hd.setAttribute('x', f1(pt.x - 4.5)); o.hd.setAttribute('y', f1(pt.y - 4.5)); o.nd.forEach((n, i) => n.style.opacity = s >= [0, .55][i]*o.L - .5 ? 1 : 0); } },
  { k:'invite', name:'Invitation', wash:WASH.meridian,
    why:'The open frame from “AI by invitation” around a small meridian. The frame closes in while the agent works inside what you gave it.',
    build(g){ return { tl:g.appendChild(sv('path')), br:g.appendChild(sv('path')), ax:g.appendChild(sv('path', { d:'M32 23V41' })), arc:g.appendChild(sv('path')) }; },
    draw(o, p){ const d = 5*p.w; o.tl.setAttribute('d', `M${f1(14+d)} ${f1(27+d)}V${f1(14+d)}H${f1(27+d)}`); o.br.setAttribute('d', `M${f1(50-d)} ${f1(37-d)}V${f1(50-d)}H${f1(37-d)}`);
      o.arc.setAttribute('d', arcD(32, 23, 41, lerp(8, 12*Math.sin(p.th), p.w))); } }
];
// brand: paper tile, wash, ink line. product: square outline, currentColor, weight tuned per size
const markEl = (c, size, brand) => {
  const svg = sv('svg', { viewBox:'0 0 64 64', width:size, height:size, 'aria-hidden':'true', class:'amk-svg' });
  const sw = brand ? 1.7 : Math.max(1.7, 1.55*64/size);
  if (brand){ svg.appendChild(sv('rect', { width:64, height:64, rx:16, fill:PAPER })); svg.appendChild(sv('path', { d:WASHP, fill:c.wash, opacity:.65 })); }
  const g = svg.appendChild(sv('g', { fill:'none', stroke:brand ? INK : 'currentColor', 'stroke-width':f1(sw), 'stroke-linecap':'round', 'stroke-linejoin':'round' }));
  if (!brand) g.appendChild(sv('rect', { x:sw/2 + 3, y:sw/2 + 3, width:58 - sw, height:58 - sw, rx:15 }));
  const o = c.build(g); svg.querySelectorAll('.amk-fill').forEach(e => { e.setAttribute('fill', brand ? INK : 'currentColor'); e.setAttribute('stroke', 'none'); });
  return { svg, o, c };
};

atom({ id:'agentmarks', cat:'Agent identity', name:'Agent mark concepts', block:'AgentMark (proposed)', fam:['M','T'], wide:true, tall:true,
  html:`<style>
.amk-root{position:absolute;inset:0;container-type:inline-size;display:flex;flex-direction:column;gap:12px;padding:14px;overflow:hidden;text-align:left}
.amk-top{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.amk-top p{margin:0;font-size:13px;color:var(--muted);max-width:52ch}
.amk-sg{display:inline-flex;background:var(--raised);border-radius:9px;padding:3px;gap:2px}
.amk-sg button{border:0;background:none;border-radius:7px;padding:5px 10px;font-size:12.5px;font-weight:500;color:var(--muted);cursor:pointer}
.amk-sg button[aria-pressed=true]{background:var(--card);color:var(--ink);box-shadow:var(--shadow)}
.amk-grid{flex:1;min-height:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;align-content:start}
.amk-c{position:relative;display:flex;flex-direction:column;gap:10px;padding:12px;border:1px solid var(--line);border-radius:14px;background:var(--card);cursor:pointer;text-align:left;font:inherit;color:inherit;min-width:0}
.amk-c[aria-pressed=true]{border-color:var(--ink);box-shadow:0 0 0 1px var(--ink)}
.amk-c:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.amk-big{display:block}.amk-big svg{width:100%;max-width:120px;height:auto}
.amk-sm{display:flex;align-items:center;gap:10px;color:var(--ink)}
.amk-nm{display:flex;align-items:center;gap:6px;font-weight:600;font-size:14px}
.amk-rec{font-size:11px;font-weight:600;padding:2px 7px;border-radius:999px;background:var(--success-tint);color:var(--success)}
.amk-why{font-size:12.5px;line-height:1.45;color:var(--muted)}
.amk-ctx{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--card);font-size:13px}
.amk-ctx>span{display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
.amk-pe{width:22px;height:22px;border-radius:50%;background:var(--raised);display:inline-grid;place-items:center;font-size:10px;font-weight:600;color:var(--muted)}
.amk-chip{padding:3px 9px 3px 4px;border-radius:7px;background:var(--ink);color:var(--card);font-size:12px;font-weight:500}
.amk-by b{font-weight:600}.amk-by i{font-style:normal;color:var(--faint)}
.amk-tag{font-size:11px;padding:1px 6px;border-radius:5px;border:1px solid var(--line);color:var(--muted)}
@container (max-width:900px){.amk-grid{grid-template-columns:repeat(3,minmax(0,1fr));overflow-y:auto}.amk-why{display:none}}
@container (max-width:560px){.amk-grid{grid-template-columns:minmax(0,1fr);gap:6px}.amk-c{flex-direction:row;align-items:center;gap:12px;padding:8px 10px}.amk-big svg{width:48px;height:48px}.amk-mid{display:flex;flex-direction:column;gap:6px;min-width:0}.amk-top p{display:none}.amk-ctx{gap:8px 12px}.amk-ctx .amk-by{display:none}}
</style><div class="amk-root"><div class="amk-top"><p>Five directions drawn from the Meridian brand package. Agents are square and people are round, so who did what never rests on colour.</p>
<div class="amk-sg" role="group" aria-label="Motion"><button type="button" aria-pressed="true" data-w="0">At rest</button><button type="button" aria-pressed="false" data-w="1">Working</button></div></div>
<div class="amk-grid"></div>
<div class="amk-ctx" aria-label="Selected mark in context"><span><span class="amk-pe">MR</span>Maya</span><span class="amk-chip" data-x="chip"></span><span data-x="pin"></span><span class="amk-by" data-x="by"></span></div></div>`,
  desc:'Five agent marks drawn from Meridian’s own vocabulary instead of a generic sparkle: a turning meridian, Velo’s lens, the orbit eye, the path and the invitation frame. Each shows its brand form (paper tile, one wash, 1.7 ink line) and its product form at 32, 24 and 16px as a square outline that inherits text colour. Working turns on each mark’s own motion. Picking a card updates the presence chip, pin and byline below so you judge it in context.',
  api:'mark(concept, size, brand)   working.set(0 | 1)   draw({ t, w, th })   ctx.render(selected)',
  init(st){
    const grid = $(st,'.amk-grid'), W = new Track(0), marks = []; let sel = 0, th = 0, lt = null;
    const cards = CONCEPTS.map((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'amk-c'; b.setAttribute('aria-pressed', i === sel);
      b.innerHTML = `<span class="amk-big"></span><span class="amk-mid"><span class="amk-sm"></span><span class="amk-nm"></span><span class="amk-why"></span></span>`;
      const big = markEl(c, 72, true); $(b,'.amk-big').appendChild(big.svg); marks.push(big);
      [32, 24, 16].forEach(s => { const m = markEl(c, s, false); $(b,'.amk-sm').appendChild(m.svg); marks.push(m); });
      $(b,'.amk-nm').textContent = c.name; if (c.rec){ const r = document.createElement('span'); r.className = 'amk-rec'; r.textContent = 'Recommended'; $(b,'.amk-nm').appendChild(r); }
      $(b,'.amk-why').textContent = c.why; b.setAttribute('aria-label', `${c.name}${c.rec ? ', recommended' : ''}. ${c.why}`);
      b.onclick = () => pick(i); grid.appendChild(b); return b; });
    const ctx = { chip:$(st,'[data-x=chip]'), pin:$(st,'[data-x=pin]'), by:$(st,'[data-x=by]') }; let live = [];
    const pick = i => { sel = i; cards.forEach((b, j) => b.setAttribute('aria-pressed', i === j)); const c = CONCEPTS[i];
      live = [markEl(c, 18, false), markEl(c, 22, false), markEl(c, 18, false)];
      ctx.chip.replaceChildren(live[0].svg, 'Review agent'); live[0].svg.style.color = 'var(--card)';
      ctx.pin.replaceChildren(live[1].svg, 'Left a pin on /pricing');
      ctx.by.replaceChildren(live[2].svg); const bb = document.createElement('b'); bb.textContent = 'Claude Code'; const ii = document.createElement('i'); ii.textContent = '7c41d2'; const tg = document.createElement('span'); tg.className = 'amk-tag'; tg.textContent = 'Agent';
      ctx.by.append(bb, ' ', ii, ' ', tg); };
    $$(st,'.amk-sg button').forEach(b => b.onclick = () => { $$(st,'.amk-sg button').forEach(x => x.setAttribute('aria-pressed', x === b)); W.set(+b.dataset.w, S.soft); });
    grid.addEventListener('keydown', e => { const k = { ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1 }[e.key]; if (!k) return; e.preventDefault(); const n = (sel + k + cards.length) % cards.length; pick(n); cards[n].focus(); });
    pick(0);
    return t => { const dt = lt === null ? 0 : clamp(t - lt, 0, .05); lt = t; const w = W.at(t); th += dt*2.2*w;
      const p = { t, w, th: th + .9 }; for (const m of marks) m.c.draw(m.o, p); for (const m of live) m.c.draw(m.o, p); };
  }
});

/* ---- the recommended mark through every agent state ---- */
const STATES = [
  { k:'idle', l:'Idle', d:'At rest. The meridian holds its angle.' },
  { k:'think', l:'Thinking', d:'The meridian turns on its axis at a constant, unhurried speed.' },
  { k:'browse', l:'Browsing', d:'A square marker travels the equator and the meridian leans toward where it is going.' },
  { k:'comment', l:'Commenting', d:'The tile grows Velo’s comment tail, so the mark becomes its own pin.' },
  { k:'wait', l:'Waiting for you', d:'The meridian stands upright and the invitation corners open. Nothing moves until you answer.' },
  { k:'done', l:'Done', d:'The globe folds away and the equator draws a check.' },
  { k:'error', l:'Error', d:'The equator crosses into an X and the line turns danger.' }
];
const EQ = [[15,35],[23.5,33.5],[32,32],[40.5,30.5],[49,29]], CK = [[21,33],[28,40],[28,40],[43,25],[43,25]], XX = [[22,22],[42,42],[32,32],[42,22],[22,42]];

atom({ id:'agentmarkstates', cat:'Agent identity', name:'Agent mark states', block:'AgentMark (proposed)', fam:['M','S','T'], wide:true, tall:true,
  html:`<style>
.ams-w{position:absolute;inset:0;container-type:inline-size}
.ams-root{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto;gap:14px;padding:16px;text-align:left}
.ams-hero{display:grid;place-items:center;border:1px solid var(--line);border-radius:16px;background:var(--card);min-height:0}
.ams-hero svg{width:min(190px,70%);height:auto;overflow:visible}
.ams-side{display:flex;flex-direction:column;gap:14px;min-width:0;min-height:0}
.ams-sl{position:relative;height:30px}
.ams-sl>span{position:absolute;inset:0;font-size:22px;font-weight:600;letter-spacing:-.02em;white-space:nowrap}
.ams-d{position:relative;min-height:42px;font-size:13.5px;color:var(--muted);line-height:1.45}
.ams-d>span{position:absolute;inset:0}
.ams-sz{display:flex;align-items:flex-end;gap:16px;color:var(--ink)}
.ams-sz svg{overflow:visible}
.ams-row{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;font-size:13px}
.ams-chip{display:inline-flex;align-items:center;gap:7px;padding:4px 10px 4px 5px;border-radius:8px;background:var(--ink);color:var(--card);font-weight:500;white-space:nowrap}
.ams-chip[data-err]{background:var(--danger)}
.ams-pe{display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
.ams-pe i{width:22px;height:22px;border-radius:50%;background:var(--raised);display:inline-grid;place-items:center;font-style:normal;font-size:10px;font-weight:600;color:var(--muted)}
.ams-pk{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:6px}
.ams-pk button{border:1px solid var(--line);background:var(--card);border-radius:8px;padding:6px 11px;font-size:13px;font-weight:500;cursor:pointer;color:var(--muted)}
.ams-pk button[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:var(--card)}
.ams-pk .ams-auto{margin-left:auto}
@container (max-width:600px){.ams-root{grid-template-columns:minmax(0,1fr);grid-template-rows:180px minmax(0,1fr) auto;padding:12px;gap:12px}.ams-hero svg{width:130px}.ams-sl>span{font-size:18px}.ams-pk .ams-auto{margin-left:0}.ams-pk button{padding:6px 9px;font-size:12.5px}}
</style><div class="ams-w"><div class="ams-root"><div class="ams-hero"></div><div class="ams-side"><div class="ams-sl" aria-live="polite"></div><div class="ams-d"></div><div class="ams-sz"></div>
<div class="ams-row"><span class="ams-pe"><i>MR</i>Maya</span><span class="ams-chip"></span></div></div>
<div class="ams-pk" role="group" aria-label="Agent state"></div></div></div>`,
  desc:'The Meridian mark carried through seven agent states. Thinking turns the meridian at a constant speed; Browsing sends a square marker along the equator while the meridian leans toward it; Commenting grows Velo’s comment tail so the mark doubles as a pin; Waiting stands the meridian upright and opens the invitation corners; Done and Error morph the equator’s five points into a check or an X. Every change is a critically damped spring, and the same drawing runs at brand size, 32, 24 and 16px and inside the presence chip.',
  api:'spin.set(0|1)  a = mix(rest, 24·sin θ, spin)  eq = Σ wₖ·shapeₖ  tail.set(0|1)  corners.set(0|1)  label.swap(state)',
  init(st){
    const hero = $(st,'.ams-hero'), sl = $(st,'.ams-sl'), dd = $(st,'.ams-d'), pk = $(st,'.ams-pk'), chip = $(st,'.ams-chip');
    const T = { spin:new Track(0), rest:new Track(14), glob:new Track(1), eqO:new Track(1), tail:new Track(0), brk:new Track(0), mo:new Track(0), mx:new Track(32), dang:new Track(0), w:[new Track(1), new Track(0), new Track(0)] };
    const mk = (size, brand) => {
      const svg = sv('svg', { viewBox:'0 0 64 64', width:size, height:size, 'aria-hidden':'true', style:'overflow:visible' }); const sw = brand ? 1.7 : Math.max(1.7, 1.55*64/size);
      const tl = brand ? sv('path', { d:'M10 54V74L26 58Z', fill:PAPER }) : sv('path', { d:`M${f1(4+sw/2)} 54V72L20 60`, fill:'none' });
      if (brand){ svg.appendChild(tl); svg.appendChild(sv('rect', { width:64, height:64, rx:16, fill:PAPER })); svg.appendChild(sv('path', { d:WASHP, fill:WASH.meridian, opacity:.65 })); }
      const g = svg.appendChild(sv('g', { fill:'none', 'stroke-width':f1(sw), 'stroke-linecap':'round', 'stroke-linejoin':'round' }));
      if (!brand){ g.appendChild(tl); g.appendChild(sv('rect', { x:sw/2 + 3, y:sw/2 + 3, width:58 - sw, height:58 - sw, rx:15 })); }
      const o = { svg, g, tl, brand, ax:g.appendChild(sv('path', { d:'M32 15V49' })), arc:g.appendChild(sv('path')), eq:g.appendChild(sv('path')),
        bk:g.appendChild(sv('path', { d:'M11 21V11H21M53 43V53H43' })), mk:g.appendChild(sv('rect', { width:7, height:7, rx:2, stroke:'none' })) };
      return o; };
    const heroM = mk(190, true); hero.appendChild(heroM.svg); heroM.svg.setAttribute('role', 'img');
    const sizes = [40, 32, 24, 16].map(s => mk(s, false)); sizes.forEach(m => $(st,'.ams-sz').appendChild(m.svg));
    const chipM = mk(18, false); chip.appendChild(chipM.svg); const chipT = document.createElement('span'); chip.appendChild(chipT);
    const all = [heroM, ...sizes, chipM];
    const lab = STATES.map(s => { const a = document.createElement('span'); a.textContent = s.l; sl.appendChild(a); const b = document.createElement('span'); b.textContent = s.d; dd.appendChild(b); return [a, b]; });
    const sw = new Swap(0); let cur = 0, auto = true, nextAt = 2.6, th = 0, lt = null, bi = -1;
    const go = (i, t = now()) => { cur = i; const k = STATES[i].k; sw.to(i, t);
      T.spin.set(k === 'think' ? 1 : 0, S.soft, t); T.rest.set(k === 'wait' ? 0 : k === 'error' ? -10 : 14, S.base, t);
      T.glob.set(k === 'done' || k === 'error' ? 0 : 1, S.base, t); T.eqO.set(k === 'wait' ? 0 : 1, S.base, t);
      T.tail.set(k === 'comment' ? 1 : 0, S.base, t); T.brk.set(k === 'wait' ? 1 : 0, S.base, t + (k === 'wait' ? .08 : 0));
      T.mo.set(k === 'browse' ? 1 : 0, S.base, t); T.dang.set(k === 'error' ? 1 : 0, S.base, t);
      const sh = k === 'done' ? 1 : k === 'error' ? 2 : 0; T.w.forEach((x, j) => x.set(j === sh ? 1 : 0, S.base, t + (sh ? .06 : 0)));
      $$(pk,'button').forEach((b, j) => b.getAttribute('data-i') !== null && b.setAttribute('aria-pressed', j === i));
      chipT.textContent = k === 'idle' ? 'Review agent' : `Review agent · ${STATES[i].l}`; chip.toggleAttribute('data-err', k === 'error');
      heroM.svg.setAttribute('aria-label', `Agent mark, ${STATES[i].l}`); bi = -1; };
    STATES.forEach((s, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s.l; b.setAttribute('data-i', i); b.setAttribute('aria-pressed', i === 0);
      b.onclick = () => { auto = false; ab.setAttribute('aria-pressed', 'false'); ab.textContent = 'Auto-play'; go(i); }; pk.appendChild(b); });
    const ab = document.createElement('button'); ab.type = 'button'; ab.className = 'ams-auto'; ab.textContent = 'Pause'; ab.setAttribute('aria-pressed', 'true');
    ab.onclick = () => { auto = !auto; ab.setAttribute('aria-pressed', auto); ab.textContent = auto ? 'Pause' : 'Auto-play'; nextAt = now() + 1.2; }; pk.appendChild(ab);
    go(0, -1);
    return t => {
      const dt = lt === null ? 0 : clamp(t - lt, 0, .05); lt = t;
      if (auto && t >= nextAt){ go((cur + 1) % STATES.length, t); nextAt = t + (STATES[cur].k === 'think' || STATES[cur].k === 'browse' ? 3.2 : 2.4); }
      if (STATES[cur].k === 'browse'){ const i = Math.floor(t/1.1) % 4; if (i !== bi){ bi = i; const x = [20, 44, 27, 40][i]; T.mx.set(x, S.base, t); T.rest.set((x - 32)*1.1, S.base, t); } }
      const spin = T.spin.at(t); th += dt*2.4*spin;
      const a = lerp(T.rest.at(t), 24*Math.sin(th + .6), spin), back = spin*clamp(-Math.cos(th + .6)*3);
      const ws = T.w.map(x => Math.max(0, x.at(t))), tot = ws.reduce((s, v) => s + v, 0) || 1;
      const pts = EQ.map((_, j) => [0, 1].map(c => (ws[0]*EQ[j][c] + ws[1]*CK[j][c] + ws[2]*XX[j][c])/tot));
      const eqD = 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L'), glob = clamp(T.glob.at(t)), eqO = clamp(T.eqO.at(t)), tail = clamp(T.tail.at(t)), brk = clamp(T.brk.at(t)), mo = clamp(T.mo.at(t)), dg = clamp(T.dang.at(t));
      const mx = T.mx.at(t), my = 35 - (mx - 15)*(6/34);
      for (const o of all){
        o.arc.setAttribute('d', arcD(32, 15, 49, a)); o.arc.style.opacity = f1(glob*(1 - .6*back)); o.ax.style.opacity = f1(glob);
        o.eq.setAttribute('d', eqD); o.eq.style.opacity = f1(eqO); o.bk.style.opacity = f1(brk); o.bk.style.strokeDasharray = `${f1(20*brk)} ${f1(20.01 - 20*brk)}`;
        o.mk.setAttribute('x', f1(mx - 3.5)); o.mk.setAttribute('y', f1(my - 3.5)); o.mk.style.opacity = f1(mo);
        o.tl.style.opacity = f1(tail); o.tl.setAttribute('transform', `translate(12 54) scale(${f1(tail)}) translate(-12 -54)`);
        const col = o.brand ? `color-mix(in oklab, ${DANGER} ${f1(dg*100)}%, ${INK})` : (dg > .01 ? `color-mix(in oklab, var(--danger) ${f1(dg*100)}%, currentColor)` : 'currentColor');
        o.g.setAttribute('stroke', col); o.mk.setAttribute('fill', col); }
      lab.forEach(([a1, b1], i) => { sw.apply(a1, i, t, 6); sw.apply(b1, i, t, 4); });
    };
  }
});
})();
