import { parseArgs, UsageError } from '../lib/args.mjs';
import { readConfig, writeConfig } from '../lib/config.mjs';
import { projectRoot } from '../lib/paths.mjs';
import { writeThemeFile } from '../lib/theme.mjs';
import { createTheme, toCSS } from '../../design/index.js';

export const USAGE = `Usage: cieo theme [key=value ...] [--print]

Set theme axes in cieo.json and regenerate the theme stylesheet.

Axes (any of): brand, scheme, density, radius
Example: npx cieo theme brand=lagoon scheme=dark

Options:
  --print  Print the generated CSS without writing anything.
  --help   Show this help.
`;

const FLAGS = { print: 'boolean', help: 'boolean' };
export const THEME_KEYS = ['brand', 'scheme', 'density', 'radius'];

function parsePairs(positionals) {
  const pairs = [];
  for (const arg of positionals) {
    const equals = arg.indexOf('=');
    if (equals <= 0) {
      throw new UsageError(`Unexpected argument '${arg}' — expected key=value pairs; usage: cieo theme [key=value ...] [--print]`);
    }
    pairs.push([arg.slice(0, equals), arg.slice(equals + 1)]);
  }
  return pairs;
}

export default async function run(rest) {
  const { flags, positionals } = parseArgs(rest, FLAGS);
  if (flags.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  const pairs = parsePairs(positionals);
  for (const [key] of pairs) {
    if (!THEME_KEYS.includes(key)) {
      process.stderr.write(`Unknown theme key '${key}' — valid keys: ${THEME_KEYS.join(', ')}.\n`);
      return 1;
    }
  }

  const root = projectRoot();
  const read = readConfig(root);
  if (read === null) {
    process.stderr.write(`No cieo.json found in ${root} — run 'npx cieo init' first.\n`);
    return 1;
  }
  const { config } = read;

  const theme = { ...config.theme };
  for (const [key, value] of pairs) theme[key] = value;
  let validated;
  try {
    validated = createTheme(theme);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    return 1;
  }

  if (flags.print === true) {
    process.stdout.write(toCSS(validated));
    return 0;
  }

  writeConfig(root, { ...config, theme });
  const { file } = writeThemeFile(root, config.target, theme);
  process.stdout.write(`Wrote ${file}.\n`);
  return 0;
}
