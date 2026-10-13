import { readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { createTheme } from '../../design/index.js';

export const CONFIG_NAME = 'cieo.json';

const TARGETS = ['next', 'vite', 'html'];
const FOREIGN_ABSOLUTE = /^(?:[A-Za-z]:[\\/]|[\\/])/;

function plainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function validateConfig(config) {
  if (!plainObject(config)) throw new Error('config must be a plain object.');
  const { version, target, componentsDir, alias, theme } = config;
  if (version !== 1) {
    throw new Error(`version must be 1 (got ${JSON.stringify(version)}); this CLI only supports config version 1.`);
  }
  if (!TARGETS.includes(target)) {
    throw new Error(`target must be one of ${TARGETS.join(', ')} (got ${JSON.stringify(target)}).`);
  }
  if (typeof componentsDir !== 'string' || componentsDir === '') {
    throw new Error('componentsDir must be a non-empty string.');
  }
  if (isAbsolute(componentsDir) || FOREIGN_ABSOLUTE.test(componentsDir)) {
    throw new Error(`componentsDir must be a relative path (got ${JSON.stringify(componentsDir)}).`);
  }
  if (componentsDir.split(/[\\/]+/).includes('..')) {
    throw new Error(`componentsDir must not contain '..' path segments (got ${JSON.stringify(componentsDir)}).`);
  }
  if (alias !== undefined && typeof alias !== 'string') {
    throw new Error(`alias must be a string when set (got ${JSON.stringify(alias)}).`);
  }
  if (theme === undefined) throw new Error('theme is required (use {} for the default theme).');
  try {
    createTheme(theme);
  } catch (error) {
    throw new Error(`theme: ${error.message}`);
  }
  return {
    version: 1,
    target,
    componentsDir,
    ...(alias === undefined ? {} : { alias }),
    theme,
  };
}

export function readConfig(root) {
  const path = join(root, CONFIG_NAME);
  let source;
  try {
    source = readFileSync(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    throw new Error(`${path} is not valid JSON: ${error.message}`);
  }
  return { path, config: validateConfig(parsed) };
}

export function writeConfig(root, config) {
  const validated = validateConfig(config);
  const ordered = {
    version: validated.version,
    target: validated.target,
    componentsDir: validated.componentsDir,
    ...(validated.alias === undefined ? {} : { alias: validated.alias }),
    theme: validated.theme,
  };
  writeFileSync(join(root, CONFIG_NAME), `${JSON.stringify(ordered, null, 2)}\n`);
}
