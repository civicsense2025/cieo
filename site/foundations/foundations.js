// Foundations pages: live demos for each chapter. Hand-written; the pages themselves are built by scripts/build-foundations.mjs.
import { rovingTabs } from '../roving-tabs.js';
import { LAG, S, Track, now, resp, run, settleTime } from '../../dist/core/spring.js';
import { projectToDetent, rubberBand } from '../../dist/live/index.js';
import { auditTheme, createTheme, variables } from '../../design/index.js';
import { AGENT_ICONS, AGENT_ICON_VIEWBOX, agentIconGlyph, agentIconOutline, agentIconStrokeWidth, roundIconUnit } from '../../dist/agent/icons.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Springs: the dot, the curve and the plain-language readout
const springLab = document.querySelector('[data-spring-lab]');
if (springLab) {
  const wInput = springLab.querySelector('[data-w-input]');
  const bInput = springLab.querySelector('[data-b-input]');
  const go = springLab.querySelector('[data-go]');
  const dot = springLab.querySelector('[data-dot]');
  const lane = dot.parentElement;
  const curveCieo = springLab.querySelector('[data-curve-cieo]');
  const curveBounce = springLab.querySelector('[data-curve-bounce]');
  const readout = springLab.querySelector('[data-spring-readout]');
  const presetBtns = [...springLab.querySelectorAll('[data-preset]')];
  const BOUNCY = 0.45;

  const underdampedStep = (dt, w, z) => {
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * dt) * (Math.cos(wd * dt) + ((z * w) / wd) * Math.sin(wd * dt));
  };
  const spec = () => ({ w: Number(wInput.value), z: 1 - Number(bInput.value) });

  const renderCurves = () => {
    const { w, z } = spec();
    const duration = 0.75;
    const steps = 90;
    const pMain = [];
    const pUnder = [];
    let peakMain = 0;
    for (let i = 0; i <= steps; i += 1) {
      const t = (i / steps) * duration;
      const yMain = 1 - resp(t, 1, 0, { w, z });
      peakMain = Math.max(peakMain, yMain);
      const x = 36 + (i / steps) * 540;
      pMain.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${(168 - yMain * 132).toFixed(1)}`);
      pUnder.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${(168 - underdampedStep(t, w, BOUNCY) * 132).toFixed(1)}`);
    }
    curveCieo.setAttribute('d', pMain.join(' '));
    curveBounce.setAttribute('d', pUnder.join(' '));
    const settleMs = Math.round(settleTime({ w, z }) * 1000);
    const over = Math.max(0, (peakMain - 1) * 100);
    readout.textContent = `Settles in ${settleMs} ms. ${over < 0.05 ? 'It never goes past its target.' : `It goes past its target by ${over.toFixed(1)}%, then comes back.`}`;
  };

  const track = new Track(0, S.base);
  let at = 0;
  const frame = (ts) => {
    const room = Math.max(0, lane.clientWidth);
    dot.style.transform = `translateX(${(track.at(ts) * room).toFixed(1)}px)`;
    return track.prune(ts) > 0;
  };
  const move = () => {
    at = 1 - at;
    if (reduced()) { track.jump(at); frame(now()); return; }
    track.set(at, spec(), now());
    run({ kind: 'feedback', step: frame });
  };
  go.addEventListener('click', move);
  presetBtns.forEach((btn) => btn.addEventListener('click', () => {
    wInput.value = btn.dataset.w;
    presetBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    renderCurves();
    move();
  }));
  wInput.addEventListener('input', () => {
    presetBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    renderCurves();
  });
  bInput.addEventListener('input', renderCurves);
  renderCurves();
  frame(now());
}

// 1b. Dragging, rubber band and snapping
const detentLab = document.querySelector('[data-detent-lab]');
if (detentLab) {
  const q = (name) => detentLab.querySelector(`[data-${name}]`);
  const posIn = q('pos-input');
  const velIn = q('vel-input');
  const rbIn = q('rb-input');
  const posOut = q('pos-out');
  const velOut = q('vel-out');
  const rbOut = q('rb-in');
  const readout = q('detent-readout');
  const release = q('release');
  const snap = q('snap');
  const pullBar = q('pull-bar');
  const movedBar = q('moved-bar');
  const detents = [0, 0.5, 0.9];
  const DIMENSION = 200;
  const MAX_PULL = 240;
  const update = () => {
    const pos = Number(posIn.value);
    const vel = Number(velIn.value);
    const raw = Number(rbIn.value);
    const snapped = projectToDetent(pos, vel, detents, 0.35);
    const moved = rubberBand(raw, DIMENSION, 0.55);
    posOut.textContent = String(Math.round(pos * 100));
    velOut.textContent = vel === 0 ? 'none' : `${vel > 0 ? 'forward' : 'back'} ${Math.abs(vel).toFixed(1)}`;
    rbOut.textContent = String(raw);
    release.style.insetInlineStart = `${pos * 100}%`;
    snap.style.insetInlineStart = `${snapped * 100}%`;
    pullBar.style.inlineSize = `${(raw / MAX_PULL) * 100}%`;
    movedBar.style.inlineSize = `${(moved / MAX_PULL) * 100}%`;
    readout.textContent = `The sheet settles on the ${Math.round(snapped * 100)}% stop. You pulled ${raw} px past the edge, but it only moved ${moved.toFixed(0)} px.`;
  };
  [posIn, velIn, rbIn].forEach((el) => el.addEventListener('input', update));
  update();
}

// 2. Choreography Lab
const choreoLab = document.querySelector('[data-choreo-demo]');
if (choreoLab) {
  const btns = [...choreoLab.querySelectorAll('[data-step]')];
  const pill = choreoLab.querySelector('[data-choreo-pill]');
  const panel = choreoLab.querySelector('[data-choreo-panel]');
  const titleEl = choreoLab.querySelector('[data-choreo-title]');
  const bodyEl = choreoLab.querySelector('[data-choreo-body]');
  const COPY = [
    ['Appear and leave', 'Menus and dialogs ease in quickly and leave even faster, so the screen never feels slow to get out of your way. Lists arrive one item after another, and the whole cascade never takes longer than a third of a second.'],
    ['Resize', 'When the content of a panel changes, the panel grows or shrinks to fit it instead of jumping, while the old content fades out and the new content fades in.'],
    ['Slide between steps', 'Going forward slides the next step in from the right. Going back slides it in from the left. The direction tells people where they are in the flow.'],
    ['Grow from a button', 'A card opens out of the button that started it, and folds back into it if you close it halfway through. The person always sees where it came from.'],
  ];
  const edgeA = new Track(0, S.base);
  const edgeB = new Track(0, S.base);
  const slideX = new Track(0, S.base);
  const slideO = new Track(1, S.base);
  let cur = 0;

  const placePill = (i, instant) => {
    const b = btns[i];
    if (!b) return;
    const na = b.offsetLeft;
    pill.style.top = `${b.offsetTop}px`;
    pill.style.height = `${b.offsetHeight}px`;
    const nb = b.offsetLeft + b.offsetWidth;
    if (instant) {
      edgeA.jump(na);
      edgeB.jump(nb);
      pill.style.transform = `translateX(${na}px)`;
      pill.style.width = `${nb - na}px`;
      return;
    }
    const t = now();
    if (na >= edgeA.target) {
      edgeB.set(nb, S.base, t);
      edgeA.set(na, S.base, t + LAG);
    } else {
      edgeA.set(na, S.base, t);
      edgeB.set(nb, S.base, t + LAG);
    }
    const dir = i >= cur ? 1 : -1;
    cur = i;
    titleEl.textContent = COPY[i][0];
    bodyEl.textContent = COPY[i][1];
    slideX.jump(dir * 16);
    slideX.set(0, S.base, t);
    slideO.jump(0.45);
    slideO.set(1, S.base, t);
    run({
      kind: 'feedback',
      step: (ts) => {
        const a = edgeA.at(ts);
        const bPos = edgeB.at(ts);
        pill.style.transform = `translateX(${a.toFixed(2)}px)`;
        pill.style.width = `${Math.max(0, bPos - a).toFixed(2)}px`;
        panel.style.transform = `translateX(${slideX.at(ts).toFixed(2)}px)`;
        panel.style.opacity = slideO.at(ts).toFixed(3);
        return edgeA.prune(ts) + edgeB.prune(ts) + slideX.prune(ts) + slideO.prune(ts) > 0;
      },
    });
  };

  rovingTabs(btns, (idx) => {
    panel.setAttribute('aria-labelledby', `choreo-tab-${idx}`);
    placePill(idx, false);
  });
  placePill(0, true);
}

// 3. Color: a real card under the chosen theme, plus the readability checks in plain words
const colorLab = document.querySelector('[data-color-lab]');
if (colorLab) {
  const brandSel = colorLab.querySelector('[data-color-brand]');
  const groundSel = colorLab.querySelector('[data-color-ground]');
  const schemeSel = colorLab.querySelector('[data-color-scheme]');
  const contrastSel = colorLab.querySelector('[data-color-contrast]');
  const stage = colorLab.querySelector('[data-color-stage]');
  const summary = colorLab.querySelector('[data-contrast-summary]');
  const swatchesEl = colorLab.querySelector('[data-color-swatches]');
  const rowsEl = colorLab.querySelector('[data-contrast-rows]');

  const ROLES = ['canvas', 'surface', 'sunken', 'text', 'muted', 'accent', 'success', 'warning', 'danger'];
  const NAMES = { text: 'Text', muted: 'Secondary text', subtle: 'Hint text', accent: 'Brand color', 'border-strong': 'Field outline', focus: 'Focus ring', 'on-accent': 'Button text', selection: 'Selection', 'on-accent-soft': 'Tinted button text', success: 'Success text', warning: 'Warning text', danger: 'Error text', info: 'Info text', canvas: 'page background', surface: 'card background', raised: 'raised background', sunken: 'inset background', 'accent-hover': 'hovered button', 'accent-soft': 'tinted button', 'success-soft': 'success tint', 'warning-soft': 'warning tint', 'danger-soft': 'error tint', 'info-soft': 'info tint' };
  const plain = (name) => { const [fg, bg] = name.split('/'); return `${NAMES[fg] || fg} on ${NAMES[bg] || bg}`; };
  const swatchText = (r, vars) => (r === 'text' || r === 'accent' || r === 'danger' ? vars['--cieo-color-canvas'] : vars['--cieo-color-text']);
  const updateColor = () => {
    const theme = createTheme({ brand: brandSel.value, ground: groundSel.value, scheme: schemeSel.value, contrast: contrastSel.value });
    const audit = auditTheme(theme);
    const vars = variables(theme);
    for (const [k, v] of Object.entries(vars)) stage.style.setProperty(k, v);
    const failing = audit.filter((row) => !row.pass).length;
    summary.textContent = failing === 0 ? `All ${audit.length} readability checks pass for this look.` : `${failing} of ${audit.length} readability checks fail for this look.`;
    swatchesEl.replaceChildren(...ROLES.map((r) => {
      const val = vars[`--cieo-color-${r}`] || '';
      const box = document.createElement('div');
      box.className = 'fnd-swatch';
      box.style.background = val;
      box.style.color = swatchText(r, vars);
      const label = document.createElement('strong');
      label.textContent = r;
      const code = document.createElement('code');
      code.textContent = val;
      box.append(label, code);
      return box;
    }));
    rowsEl.replaceChildren(...audit.map((row) => {
      const tr = document.createElement('tr');
      [plain(row.name), `${row.ratio.toFixed(1)} to 1`, `${row.minimum} to 1`, row.pass ? 'Pass' : 'Fail'].forEach((text) => {
        const td = document.createElement('td');
        td.textContent = text;
        tr.append(td);
      });
      return tr;
    }));
  };
  [brandSel, groundSel, schemeSel, contrastSel].forEach((el) => el.addEventListener('change', updateColor));
  updateColor();
}

// 4. Type and shape: corners and density on a real card
const shapeLab = document.querySelector('[data-shape-lab]');
if (shapeLab) {
  const stage = shapeLab.querySelector('[data-shape-stage]');
  const rBtns = [...shapeLab.querySelectorAll('[data-shape-radius]')];
  const dBtns = [...shapeLab.querySelectorAll('[data-shape-density]')];
  let curRadius = 'pill';
  let curDensity = 'comfortable';
  const syncShape = () => {
    const vars = variables(createTheme({ brand: 'instrument', ground: 'paper', radius: curRadius, density: curDensity }));
    for (const [k, v] of Object.entries(vars)) stage.style.setProperty(k, v);
  };
  rBtns.forEach((btn) => btn.addEventListener('click', () => {
    curRadius = btn.dataset.shapeRadius;
    rBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    syncShape();
  }));
  dBtns.forEach((btn) => btn.addEventListener('click', () => {
    curDensity = btn.dataset.shapeDensity;
    dBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    syncShape();
  }));
  syncShape();
}

// 5. Agents: an approval that never claims success early
const approvalLab = document.querySelector('[data-approval-lab]');
if (approvalLab) {
  const q = (name) => approvalLab.querySelector(`[data-${name}]`);
  const approve = q('approve');
  const reset = q('reset');
  const offline = q('offline');
  const badge = q('approval-badge');
  const status = q('approval-status');
  const text = q('approval-text');
  let timer = 0;
  const show = (tone, label, message, line) => {
    badge.dataset.status = tone;
    badge.textContent = label;
    text.textContent = message;
    status.textContent = line;
  };
  approve.addEventListener('click', () => {
    approve.disabled = true;
    show('warning', 'Waiting for confirmation', 'Approval sent. Waiting for the server to confirm.', 'Not confirmed yet, so nothing is shown as done.');
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (offline.checked) show('danger', 'Not sure it went through', 'No answer from the server. The invoices may or may not have been sent.', 'Check the sent list before you try again, so no one gets two.');
      else show('success', 'Confirmed', 'Sent to 42 customers.', 'The server confirmed it.');
      reset.hidden = false;
      reset.focus();
    }, offline.checked ? 2400 : 1200);
  });
  reset.addEventListener('click', () => {
    clearTimeout(timer);
    reset.hidden = true;
    approve.disabled = false;
    show('info', 'Waiting for you', 'Agent wants to send the invoice to 42 customers.', 'Nothing has been sent.');
    approve.focus();
  });
}

// 6. Agent icon sizes
const agentLab = document.querySelector('[data-agent-size-lab]');
if (agentLab) {
  const sizeBtns = [...agentLab.querySelectorAll('[data-glyph-size]')];
  const renderTree = (nodes) => nodes.map(([tag, attrs, children]) => {
    const a = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
    return children && children.length ? `<${tag} ${a}>${renderTree(children)}</${tag}>` : `<${tag} ${a}/>`;
  }).join('');
  sizeBtns.forEach((btn) => btn.addEventListener('click', () => {
    const sz = Number(btn.dataset.glyphSize);
    sizeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const sw = agentIconStrokeWidth(sz);
    const outAttrs = Object.entries(agentIconOutline(sw)).map(([k, v]) => `${k}="${v}"`).join(' ');
    for (const icon of AGENT_ICONS) {
      const slot = agentLab.querySelector(`[data-icon-slot="${icon.id}"]`);
      if (!slot) continue;
      slot.innerHTML = `<svg viewBox="${AGENT_ICON_VIEWBOX}" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="${roundIconUnit(sw)}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect ${outAttrs}/>${renderTree(agentIconGlyph(icon, sz))}</svg>`;
    }
  }));
}
