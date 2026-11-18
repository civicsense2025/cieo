import { assertTheme } from './registry.js';
import { selector } from './validation.js';

const generic = new Set(['serif', 'sans-serif', 'monospace', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace']);
export function cssValue(token) {
  if (token.type === 'fontFamily') return token.value.map((name) => generic.has(name) ? name : `"${name}"`).join(', ');
  return String(token.value);
}
export function variables(theme) {
  assertTheme(theme);
  const entries = Object.entries(theme.tokens).map(([key, token]) => [`--cieo-${key}`, cssValue(token)]);
  for (const [comp, props] of Object.entries(theme.options.components ?? {})) {
    for (const [prop, val] of Object.entries(props)) entries.push([`--cieo-${comp}-${prop}`, String(val)]);
  }
  return Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b, 'en')));
}
/** Conservative selector grammar intentionally prevents stylesheet injection. */
export function toCSS(theme, target = ':root') {
  selector(target);
  const lines = Object.entries(variables(theme)).map(([key, value]) => `  ${key}: ${value};`);
  return `${target} {\n  color-scheme: ${theme.options.scheme};\n${lines.join('\n')}\n}\n`;
}
