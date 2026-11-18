// One source for "how many motion recipes": the gallery's own records, so the home, pricing, foundations and recipes pages cannot disagree.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRepo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function recipeCount(repo = defaultRepo) {
  return JSON.parse(readFileSync(`${repo}/atoms/web/index.json`, 'utf8')).filter((r) => r.file.startsWith('blocks/')).length;
}
