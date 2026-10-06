import { assertTheme } from './registry.js';
import { selector } from './validation.js';

const generic = new Set(['serif', 'sans-serif', 'monospace', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace']);
export function cssValue(token) {
  if (token.type === 'fontFamily') return token.value.map((name) => generic.has(name) ? name : `"${name}"`).join(', ');
  return String(token.value);
}
export function variables(theme) {
  assertTheme(theme);
  return Object.fromEntries(Object.entries(theme.tokens).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([key, token]) => [`--cieo-${key}`, cssValue(token)]));
}
/** Conservative selector grammar intentionally prevents stylesheet injection. */
export function toCSS(theme, target = ':root') {
  selector(target);
  const lines = Object.entries(variables(theme)).map(([key, value]) => `  ${key}: ${value};`);
  return `${target} {\n  color-scheme: ${theme.options.scheme};\n${lines.join('\n')}\n}\n`;
}
