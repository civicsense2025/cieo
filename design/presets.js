/** Named starting points, not mandatory branding. All fonts resolve locally. */
export const brands = Object.freeze({
  studio: Object.freeze({ light: '#595d17', dark: '#b5bc79', label: 'Studio olive' }),
  iris: Object.freeze({ light: '#6246c7', dark: '#b6a4f5', label: 'Electric iris' }),
  lagoon: Object.freeze({ light: '#087977', dark: '#72d3c9', label: 'Deep lagoon' }),
  ember: Object.freeze({ light: '#b4432f', dark: '#f3a089', label: 'Warm ember' }),
  rose: Object.freeze({ light: '#aa326d', dark: '#f0a0c8', label: 'Wild rose' }),
  mono: Object.freeze({ light: '#242830', dark: '#e3e7ed', label: 'Monochrome' }),
});
export const densities = Object.freeze({ compact: 32, comfortable: 40, spacious: 48 });
export const radii = Object.freeze({ crisp: [2, 4, 8], soft: [8, 12, 16], round: [12, 16, 24] });
Object.values(radii).forEach(Object.freeze);
export const fonts = Object.freeze({
  system: Object.freeze(['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']),
  humanist: Object.freeze(['Avenir Next', 'Segoe UI', 'sans-serif']),
  mono: Object.freeze(['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace']),
});
export const surfaces = Object.freeze({
  light: Object.freeze({ canvas: '#f3f5f7', surface: '#ffffff', raised: '#fafcfe', sunken: '#eceef0', text: '#10141a', muted: '#515963', subtle: '#626a75', border: '#d8dde3', strong: '#7d8793' }),
  dark: Object.freeze({ canvas: '#0c1016', surface: '#171b21', raised: '#20262e', sunken: '#10151b', text: '#eff2f6', muted: '#b3bbc7', subtle: '#a3acb9', border: '#343d49', strong: '#7f8a9a' }),
});
