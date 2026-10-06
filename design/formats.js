import { assertTheme } from './registry.js';
import { channels } from './color.js';
import { createTheme } from './theme.js';
import { keys, record } from './validation.js';

/** Fully resolved DTCG 2025.10 values, not a general DTCG alias/import resolver. */
export function toDTCG(theme) {
  assertTheme(theme);
  const cieo = {};
  for (const [name, token] of Object.entries(theme.tokens).sort(([a], [b]) => a.localeCompare(b, 'en'))) {
    let value = token.value;
    if (token.type === 'color') value = { colorSpace: 'srgb', components: channels(value), alpha: 1, hex: value };
    if (token.type === 'dimension') value = { value: parseFloat(value), unit: value.endsWith('rem') ? 'rem' : 'px' };
    cieo[name] = { $type: token.type, $value: value, $description: token.description };
  }
  return { $description: 'Cieo semantic design tokens. Motion remains in tokens/tokens.json.', cieo };
}

/** Preserve units for languages without a Cieo code generator. JSON is the portable contract. */
export function toPortable(theme) {
  return { version: 1, colorSpace: 'srgb', dimensionUnits: ['px', 'rem'], referenceFontSize: 16, tokens: toDTCG(theme).cieo };
}

export function serializeTheme(theme) {
  assertTheme(theme);
  const ordered = Object.fromEntries(Object.entries(theme.options.overrides).sort(([a], [b]) => a.localeCompare(b, 'en')));
  return JSON.stringify({ version: 1, options: { ...theme.options, overrides: ordered } }, null, 2) + '\n';
}

export function parseTheme(source) {
  if (typeof source !== 'string' || source.length > 32768) throw new TypeError('Theme configuration must be text under 32 KiB.');
  const value = record(JSON.parse(source), 'theme configuration');
  keys(value, ['version', 'options'], 'configuration key');
  if (value.version !== 1) throw new RangeError('Unsupported theme configuration version.');
  record(value.options, 'theme options');
  return createTheme(value.options);
}
