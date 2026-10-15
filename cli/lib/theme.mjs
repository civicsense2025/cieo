import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createTheme, toCSS } from '../../design/index.js';

const TARGET_FILES = {
  next: 'app/cieo-theme.css',
  vite: 'src/cieo-theme.css',
  html: 'cieo-theme.css',
};

export function themeFileFor(root, target) {
  const relative = TARGET_FILES[target];
  if (relative === undefined) {
    throw new Error(`Unknown target ${JSON.stringify(target)} — expected one of next, vite, html.`);
  }
  return join(root, relative);
}

/* Temp file + rename: a failed theme write must never leave a half-written
   stylesheet where the previous one was. */
function writeFileAtomic(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.cieo-tmp`;
  writeFileSync(temporary, content);
  try {
    renameSync(temporary, path);
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
}

export function writeThemeFile(root, target, theme) {
  const css = toCSS(createTheme(theme));
  const file = themeFileFor(root, target);
  writeFileAtomic(file, css);
  return { file, css };
}

export function verifyThemeFile(root, target, theme) {
  const expected = toCSS(createTheme(theme));
  let current;
  try {
    current = readFileSync(themeFileFor(root, target), 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
  return current === expected;
}
