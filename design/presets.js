/** Named starting points, not mandatory branding. All fonts resolve locally. */
export const brands = Object.freeze({
  studio: Object.freeze({ light: '#595d17', dark: '#b5bc79', label: 'Studio olive' }),
  iris: Object.freeze({ light: '#6246c7', dark: '#b6a4f5', label: 'Electric iris' }),
  lagoon: Object.freeze({ light: '#087977', dark: '#72d3c9', label: 'Deep lagoon' }),
  ember: Object.freeze({ light: '#b4432f', dark: '#f3a089', label: 'Warm ember' }),
  rose: Object.freeze({ light: '#aa326d', dark: '#f0a0c8', label: 'Wild rose' }),
  mono: Object.freeze({ light: '#242830', dark: '#e3e7ed', label: 'Monochrome' }),
  instrument: Object.freeze({ light: '#17150f', dark: '#efece4', label: 'Instrument ink' }),
});
export const densities = Object.freeze({ compact: 32, comfortable: 40, spacious: 48 });
export const radii = Object.freeze({ square: [0, 0, 0], crisp: [2, 4, 8], soft: [8, 12, 16], round: [12, 16, 24], pill: [6, 9999, 18] });
Object.values(radii).forEach(Object.freeze);
export const fonts = Object.freeze({
  system: Object.freeze(['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']),
  humanist: Object.freeze(['Avenir Next', 'Segoe UI', 'sans-serif']),
  mono: Object.freeze(['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace']),
});
/** Display faces for headings only; every stack resolves locally. */
export const displays = Object.freeze({
  sans: null,
  serif: Object.freeze(['Iowan Old Style', 'Palatino Linotype', 'Palatino', 'Georgia', 'serif']),
});
/** Neutral grounds. cool is the default; paper is a warm off-white; mist is a quiet cool grey. */
export const grounds = Object.freeze({
  cool: Object.freeze({
    light: Object.freeze({ canvas: '#f3f5f7', surface: '#ffffff', raised: '#fafcfe', sunken: '#eceef0', text: '#10141a', muted: '#515963', subtle: '#626a75', border: '#d8dde3', strong: '#7d8793' }),
    dark: Object.freeze({ canvas: '#0c1016', surface: '#171b21', raised: '#20262e', sunken: '#10151b', text: '#eff2f6', muted: '#b3bbc7', subtle: '#a3acb9', border: '#343d49', strong: '#7f8a9a' }),
  }),
  paper: Object.freeze({
    light: Object.freeze({ canvas: '#f6f4ef', surface: '#fdfcfa', raised: '#fffefd', sunken: '#edeae3', text: '#14120e', muted: '#57534b', subtle: '#6a665d', border: '#dedad1', strong: '#8a857a' }),
    dark: Object.freeze({ canvas: '#0e0d0b', surface: '#181714', raised: '#211f1b', sunken: '#12110f', text: '#f0ede6', muted: '#bab5aa', subtle: '#a9a498', border: '#36332d', strong: '#898478' }),
  }),
  mist: Object.freeze({
    light: Object.freeze({ canvas: '#f1f2f3', surface: '#fcfcfd', raised: '#ffffff', sunken: '#e7e9eb', text: '#0e1012', muted: '#4f555c', subtle: '#60666d', border: '#dadde0', strong: '#7b8188' }),
    dark: Object.freeze({ canvas: '#08090a', surface: '#121415', raised: '#1a1d1f', sunken: '#0d0f10', text: '#f1f2f3', muted: '#b1b6bc', subtle: '#a0a5ab', border: '#2c3033', strong: '#7d8389' }),
  }),
});
/** Kept for callers of the original export: the default ground. */
export const surfaces = grounds.cool;
/** soft lifts a surface with a diffuse shadow; ring draws a hairline and the faintest lift. */
export const elevations = Object.freeze({ soft: 'soft', ring: 'ring' });
