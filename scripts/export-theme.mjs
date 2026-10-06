#!/usr/bin/env node
// Pipe validated configuration to portable artifacts; stdout contains only the artifact.
import { readFileSync } from 'node:fs';
import { createTheme, parseTheme, toCSS, toPortable, toDTCG, toNative, serializeTheme } from '../design/index.js';

const [format = 'css', filename, ...extra] = process.argv.slice(2);
try {
  if (extra.length) throw new Error('Usage: node scripts/export-theme.mjs <format> [theme.json|-]');
  const theme = filename ? parseTheme(readFileSync(filename === '-' ? 0 : filename, 'utf8')) : createTheme();
  const json = (value) => JSON.stringify(value, null, 2) + '\n';
  let output;
  if (format === 'css') output = toCSS(theme);
  else if (format === 'json') output = json(toPortable(theme));
  else if (format === 'dtcg') output = json(toDTCG(theme));
  else if (format === 'config') output = serializeTheme(theme);
  else output = toNative(theme, format);
  process.stdout.write(output);
} catch (error) { console.error(`cieo-export: ${error.message}`); process.exitCode = 1; }
