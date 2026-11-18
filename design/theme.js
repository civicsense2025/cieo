import { markTheme } from './registry.js';
import { brands, grounds } from './presets.js';
import { contrastRatio, foreground, mix, readable, tonalRamp } from './color.js';
import { options, validTokenValue, freeze } from './validation.js';
import { foundations } from './foundations.js';

const UNIT_FRACTION_TOKENS = new Set([
  'shadow-alpha', 'disabled-opacity', 'scrim-alpha',
  'state-hover-opacity', 'state-focus-opacity', 'state-pressed-opacity', 'state-selected-opacity', 'state-dragged-opacity',
  'motion-arrive-opacity', 'physics-rubber-band',
]);

/** Pure, deterministic and server-safe. A brand seed is adjusted for its semantic contrast role. */
export function createTheme(input = {}) {
  const config = options(input), base = grounds[config.ground][config.scheme], tokens = Object.create(null);
  const minimum = config.contrast === 'high' ? 7 : 4.5;
  const put = (name, type, value, description) => { tokens[name] = { type, value, description }; };
  const color = (name, value, description) => put(`color-${name}`, 'color', value, description);
  for (const name of ['canvas', 'surface', 'raised', 'sunken']) color(name, base[name], `${name} surface, independent of brand accent.`);
  const surfaceLow = mix(base.canvas, base.surface, .5);
  const surfaceHigh = mix(base.surface, base.raised, .5);
  color('surface-low', surfaceLow, 'Low-elevation container surface between canvas and surface.');
  color('surface-high', surfaceHigh, 'High-elevation container surface between surface and raised.');
  color('scrim', '#000000', 'Backdrop scrim pigment paired with scrim-alpha.');
  const neutralSurfaces = [base.canvas, surfaceLow, base.surface, surfaceHigh, base.raised, base.sunken];
  for (const name of ['text', 'muted', 'subtle']) {
    let value = base[name];
    for (const background of neutralSurfaces) value = readable(value, background, minimum);
    color(name, value, `${name} content; checked against all neutral surfaces.`);
  }
  color('border', config.contrast === 'high' ? readable(base.strong, base.surface, 3) : base.border, 'Decorative surface divider.');
  let strong = base.strong;
  for (const background of neutralSurfaces) strong = readable(strong, background, 3);
  color('border-strong', strong, 'Control boundary, at least 3:1 against neutral surfaces.');
  let accent = config.accent ?? brands[config.brand][config.scheme];
  for (const background of neutralSurfaces) accent = readable(accent, background, minimum);
  color('accent', accent, 'Brand emphasis and links; contrast-adjusted from the requested seed.');
  const onAccent = foreground(accent);
  color('on-accent', onAccent, 'Readable foreground on the accent fill.');
  color('accent-hover', readable(mix(accent, onAccent === '#ffffff' ? '#000000' : '#ffffff', .12), onAccent, minimum), 'Pointer hover fill without a layout shift.');
  const accentSoft = mix(base.surface, accent, config.scheme === 'dark' ? .16 : .08);
  color('accent-soft', accentSoft, 'Low-chroma branded surface.');
  color('on-accent-soft', readable(accent, accentSoft, minimum), 'Readable foreground on a soft accent surface.');
  color('focus', accent, 'Keyboard focus color; never the only focus indicator.');
  color('selection', mix(base.surface, accent, .2), 'Selected-text highlight surface.');
  color('shadow', '#000000', 'Neutral elevation pigment, separate from its opacity.');
  const statuses = { success: ['#277442', '#8bd6a3'], warning: ['#8a5609', '#edc16b'], danger: ['#b0342f', '#f5a09b'], info: ['#2865b2', '#8ebbf5'] };
  const statusRamps = {};
  for (const [name, colors] of Object.entries(statuses)) {
    const seed = colors[config.scheme === 'dark' ? 1 : 0], soft = mix(base.surface, seed, .08);
    color(name, readable(seed, soft, minimum), `${name} foreground; pair with a visible label, not color alone.`);
    color(`${name}-soft`, soft, `Quiet ${name} feedback surface.`);
    statusRamps[name] = tonalRamp(seed);
  }
  foundations(config, put);
  for (const [name, value] of Object.entries(config.overrides)) {
    if (!Object.hasOwn(tokens, name)) throw new TypeError(`Unknown token override: ${name}`);
    tokens[name].value = validTokenValue(tokens[name].type, value);
    if (UNIT_FRACTION_TOKENS.has(name) && value > 1) throw new RangeError(`${name} must be between 0 and 1`);
    if (name === 'motion-zeta' && (value < 0.7 || value > 1)) throw new RangeError('motion-zeta must be between 0.7 and 1.0');
  }
  const reference = {
    neutral: tonalRamp(base.text),
    accent: tonalRamp(accent),
    ...statusRamps,
    springs: { snap: 34, base: 22, soft: 15, lazy: 9 },
  };
  // Reject invalid output rather than claim arbitrary custom palettes are accessible.
  const theme = { version: 1, options: config, reference, tokens };
  const failures = auditTheme(theme).filter((result) => !result.pass);
  if (failures.length) throw new RangeError(`Theme contrast failed: ${failures.map((item) => item.name).join(', ')}`);
  return markTheme(freeze(theme));
}

export function auditTheme(theme) {
  const get = (key) => theme.tokens[`color-${key}`].value;
  const minimum = theme.options.contrast === 'high' ? 7 : 4.5;
  const pairs = [];
  const add = (foregroundName, backgroundName, target) => {
    const ratio = contrastRatio(get(foregroundName), get(backgroundName));
    pairs.push({ name: `${foregroundName}/${backgroundName}`, ratio, minimum: target, pass: ratio >= target });
  };
  for (const bg of ['canvas', 'surface', 'raised', 'sunken']) {
    for (const fg of ['text', 'muted', 'subtle', 'accent']) add(fg, bg, minimum);
    add('border-strong', bg, 3); add('focus', bg, 3);
  }
  add('on-accent', 'accent', minimum); add('on-accent', 'accent-hover', minimum);
  add('text', 'selection', minimum); add('on-accent-soft', 'accent-soft', minimum);
  for (const status of ['success', 'warning', 'danger', 'info']) add(status, `${status}-soft`, minimum);
  return pairs;
}
