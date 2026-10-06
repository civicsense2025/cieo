import { assertTheme } from './registry.js';
import { keys, choice } from './validation.js';

const targets = ['swift', 'rust', 'kotlin', 'dart', 'python', 'c'];
const upper = (value) => value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/-/g, '_').toUpperCase();
const camel = (value) => value.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const decimal = (value) => Number.isInteger(value) ? `${value}.0` : String(value);
/** Native dimensions are reference units, not a claim that px == device pixels or Dynamic Type. */
export function toNative(theme, target, input = {}) {
  assertTheme(theme); choice(target, targets, 'native target');
  keys(input, ['namespace', 'referenceFontSize'], 'native option');
  const namespace = input.namespace ?? 'CieoDesignTokens', reference = input.referenceFontSize ?? 16;
  if (typeof namespace !== 'string' || !/^[A-Z][A-Za-z0-9]{0,56}Tokens$/.test(namespace)) throw new TypeError('Namespace must be PascalCase, end in Tokens, and contain at most 63 characters.');
  if (!Number.isFinite(reference) || reference < 1 || reference > 256) throw new RangeError('Reference font size must be 1–256.');
  const rows = Object.entries(theme.tokens).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([key, token]) => {
    let value = token.value;
    if (token.type === 'dimension') value = parseFloat(value) * (value.endsWith('rem') ? reference : 1);
    if (token.type === 'fontFamily') value = value.join(', ');
    return { key, value, numeric: typeof value === 'number' };
  });
  const prefix = upper(namespace);
  const comment = `Generated Cieo tokens. sRGB hex colors; rem × ${reference}; native text scaling remains the host's responsibility.`;
  const lines = rows.map(({ key, value, numeric }) => {
    const literal = numeric ? decimal(value) : JSON.stringify(value);
    if (target === 'swift') return `    public static let ${camel(key)}: ${numeric ? 'Double' : 'String'} = ${literal}`;
    if (target === 'rust') return `    pub const ${upper(key)}: ${numeric ? 'f64' : '&str'} = ${literal};`;
    if (target === 'kotlin') return `    const val ${upper(key)}: ${numeric ? 'Double' : 'String'} = ${literal}`;
    if (target === 'dart') return `  static const ${numeric ? 'double' : 'String'} ${camel(key)} = ${literal};`;
    if (target === 'python') return `${prefix}_${upper(key)} = ${literal}`;
    return `#define ${prefix}_${upper(key)} ${literal}`;
  });
  const body = lines.join('\n');
  if (target === 'swift') return `// ${comment}\npublic enum ${namespace} {\n${body}\n}\n`;
  if (target === 'rust') return `// ${comment}\npub mod ${prefix.toLowerCase()} {\n${body}\n}\n`;
  if (target === 'kotlin') return `// ${comment}\nobject ${namespace} {\n${body}\n}\n`;
  if (target === 'dart') return `// ${comment}\nabstract final class ${namespace} {\n${body}\n}\n`;
  if (target === 'python') return `# ${comment}\n${body}\n`;
  return `/* ${comment} */\n#ifndef ${prefix}_H\n#define ${prefix}_H\n${body}\n#endif\n`;
}
