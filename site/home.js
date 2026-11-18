// The settling instrument on the home page: one target, two springs, measured.
// Cieo's lane uses the library's own closed-form critically damped spring. The comparison lane is a typical
// underdamped spring (damping ratio 0.45) with the same natural frequency, so the only difference is the damping.
import { resp, vel, settleTime, S } from '../dist/core/spring.js';

const cfg = S.base;
const ZETA = 0.45;
const MARGIN = 0.15; // where 0% and 100% sit on the track, so an overshoot stays on screen

function underdamped(dt, x0, v0) {
  const a = ZETA * cfg.w, b = cfg.w * Math.sqrt(1 - ZETA * ZETA), e = Math.exp(-a * dt), c = Math.cos(b * dt), s = Math.sin(b * dt);
  return {
    x: e * (x0 * c + ((v0 + a * x0) / b) * s),
    v: e * (v0 * c - ((a * v0 + cfg.w * cfg.w * x0) / b) * s),
  };
}
const models = {
  settle: (dt, x0, v0) => ({ x: resp(dt, x0, v0, cfg), v: vel(dt, x0, v0, cfg) }),
  bounce: underdamped,
};

const root = document.querySelector('[data-instrument]');
if (root) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const live = root.querySelector('[data-live]');
  const buttons = [...root.querySelectorAll('[data-target]')];
  const lanes = [...root.querySelectorAll('[data-lane]')].map((el) => ({
    el, kind: el.dataset.lane, track: el.querySelector('.track'), marker: el.querySelector('.marker'),
    target: el.querySelector('.target'), out: el.querySelector('output'),
    pos: 0, v: 0, goal: 0, start: 0, x0: 0, v0: 0, t0: 0, peak: 0, settledAt: null, moving: false,
  }));

  const place = (lane, fraction, node) => {
    const width = lane.track.clientWidth;
    node.style.transform = `translateX(${(width * (MARGIN + fraction * (1 - 2 * MARGIN))).toFixed(2)}px)`;
  };
  const format = (lane) => {
    const pct = (lane.pos * 100).toFixed(1).padStart(5, ' ');
    if (lane.settledAt !== null) return `settled in ${lane.settledAt.toFixed(2)} s · overshoot ${(lane.peak * 100).toFixed(1)}%`;
    return `${pct}% · v ${lane.v.toFixed(2)}/s · overshoot ${(lane.peak * 100).toFixed(1)}%`;
  };
  const draw = (lane) => { place(lane, lane.pos, lane.marker); place(lane, lane.goal, lane.target); lane.out.textContent = format(lane); };
  const announce = () => {
    if (lanes.some((l) => l.moving) || lanes.some((l) => l.settledAt === null)) return;
    const [calm, bouncy] = [lanes.find((l) => l.kind === 'settle'), lanes.find((l) => l.kind === 'bounce')];
    live.textContent = `The Cieo spring settled in ${calm.settledAt.toFixed(2)} seconds with ${(calm.peak * 100).toFixed(0)} percent overshoot. The bouncy spring overshot by ${(bouncy.peak * 100).toFixed(0)} percent.`;
  };

  let frame = 0;
  function tick(now) {
    frame = 0;
    let any = false;
    for (const lane of lanes) {
      if (!lane.moving) continue;
      const dt = (now - lane.t0) / 1000, { x, v } = models[lane.kind](dt, lane.x0, lane.v0);
      lane.pos = lane.goal + x; lane.v = v;
      const travel = lane.goal - lane.start;
      if (Math.abs(travel) > 0.01) lane.peak = Math.max(lane.peak, (Math.sign(travel) * (lane.pos - lane.goal)) / Math.abs(travel));
      // Settled means within 0.1% of the distance traveled, the same bar the library's settleTime() uses.
      if (Math.abs(x) <= 1e-3 * Math.max(Math.abs(travel), 0.05) && Math.abs(v) < 5e-2) { lane.moving = false; lane.pos = lane.goal; lane.v = 0; lane.settledAt = dt; }
      else any = true;
      draw(lane);
    }
    if (any) frame = requestAnimationFrame(tick); else announce();
  }

  function release(goal) {
    const now = performance.now();
    for (const lane of lanes) {
      // Carry the position and velocity into the new spring, so a retarget mid-flight stays continuous.
      if (lane.moving) { const dt = (now - lane.t0) / 1000, m = models[lane.kind](dt, lane.x0, lane.v0); lane.pos = lane.goal + m.x; lane.v = m.v; }
      lane.start = lane.pos; lane.goal = goal; lane.x0 = lane.pos - goal; lane.v0 = lane.v; lane.t0 = now; lane.peak = 0; lane.settledAt = null;
      if (reduced.matches) { lane.pos = goal; lane.v = 0; lane.moving = false; lane.settledAt = 0; draw(lane); lane.out.textContent = 'motion reduced · jumped to target'; }
      else lane.moving = true;
    }
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.target) === goal)));
    if (!reduced.matches && !frame) frame = requestAnimationFrame(tick);
    if (reduced.matches) live.textContent = 'Motion is reduced, so both markers jumped to the target.';
  }

  buttons.forEach((b) => b.addEventListener('click', () => release(Number(b.dataset.target))));
  for (const lane of lanes) {
    lane.track.addEventListener('pointerdown', (event) => {
      const rect = lane.track.getBoundingClientRect(), m = rect.width * MARGIN;
      release(Math.min(1, Math.max(0, (event.clientX - rect.left - m) / (rect.width - 2 * m))));
    });
    const ticks = lane.track.querySelector('.track-ticks');
    for (let i = 0; i <= 20; i += 1) {
      const tick = document.createElement('span');
      tick.style.insetInlineStart = `${(MARGIN + (i / 20) * (1 - 2 * MARGIN)) * 100}%`;
      ticks.append(tick);
    }
  }
  const settle = root.querySelector('[data-settle]');
  if (settle) settle.textContent = `${settleTime(cfg).toFixed(2)} s`;
  new ResizeObserver(() => lanes.forEach(draw)).observe(root);
  lanes.forEach(draw);
  // Play once when the instrument first scrolls into view.
  new IntersectionObserver((entries, observer) => { if (entries.some((e) => e.isIntersecting)) { observer.disconnect(); release(1); } }, { threshold: 0.6 }).observe(root);
}
