// scripts/primitive-inventory.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

export function reconcile({ astryx = [], cieoControls = [], recipes = [] }) {
  const known = new Set([...cieoControls.map((s) => s.toLowerCase()), ...recipes.map((s) => s.toLowerCase())]);
  const unmapped = [...astryx].filter((n) => !known.has(String(n).toLowerCase())).sort();
  const seen = new Map();
  const collisions = [];
  for (const id of recipes) {
    if (seen.has(id)) collisions.push({ id, paths: [seen.get(id), 'recipes'] });
    else seen.set(id, 'recipes');
  }
  collisions.sort((a, b) => (a.id < b.id ? -1 : 1));
  return { generatedAt: 'deterministic-test', astryx: [...astryx].sort(), cieoControls: [...cieoControls].sort(), recipes: [...recipes].sort(), collisions, unmapped };
}

const ASTRYX_NAMES = ['Button', 'ButtonGroup', 'AvatarGroup', 'Badge', 'Card', 'Table', 'Dialog', 'Toast', 'Tooltip', 'Field', 'TextInput', 'TextArea', 'Switch', 'Slider', 'List', 'Stack'];

if (process.argv[1] && process.argv[1].endsWith('primitive-inventory.mjs')) {
  const index = JSON.parse(readFileSync('atoms/web/index.json', 'utf8'));
  const recipes = index.map((e) => e.id);
  const controlsSrc = readFileSync('src/controls/index.ts', 'utf8');
  const cieoControls = [...controlsSrc.matchAll(/export\s+\{\s*([^}]+?)\s*\}\s+from/g)].flatMap((m) => m[1].split(',').map((s) => s.trim()).filter((s) => /^[A-Z]/.test(s)));
  const out = { ...reconcile({ astryx: ASTRYX_NAMES, cieoControls, recipes }), generatedAt: new Date().toISOString() };
  mkdirSync('docs/generated', { recursive: true });
  writeFileSync('docs/generated/primitive-inventory.json', JSON.stringify(out, null, 2) + '\n');
}
