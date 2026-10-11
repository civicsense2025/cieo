// scripts/lib/primitives.mjs — shared primitive source scan.
// Single parser for `export` shapes used by wire-primitives (barrel/exports)
// and build-component-pages (import banner). Import, don't duplicate.
import { readdirSync, readFileSync, existsSync } from 'node:fs';

export function parseExports(src) {
  const values = [];
  const types = [];
  for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)) values.push(m[1]);
  for (const m of src.matchAll(/export\s+(?:const|class)\s+(\w+)/g)) values.push(m[1]);
  for (const m of src.matchAll(/export\s+interface\s+(\w+)/g)) types.push(m[1]);
  for (const m of src.matchAll(/export\s+type\s+(\w+)\s*=/g)) types.push(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of m[1].split(',')) {
      const p = part.trim();
      if (!p) continue;
      const isType = p.startsWith('type ');
      const bare = isType ? p.slice(5).trim() : p;
      const asMatch = bare.match(/^(\S+)\s+as\s+(\S+)$/);
      (isType ? types : values).push(asMatch ? asMatch[2] : bare);
    }
  }
  for (const m of src.matchAll(/export\s+type\s*\{([^}]+)\}/g)) {
    for (const part of m[1].split(',')) {
      const p = part.trim();
      if (!p) continue;
      const asMatch = p.match(/^(\S+)\s+as\s+(\S+)$/);
      types.push(asMatch ? asMatch[2] : p);
    }
  }
  return { values: [...new Set(values)], types: [...new Set(types)] };
}

// Sorted [{ dir, values, types }]; throws on missing source or valueless module.
export function scanPrimitives(root) {
  const primDir = `${root}/src/primitives`;
  const dirs = readdirSync(primDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  return dirs.map((dir) => {
    const file = `${primDir}/${dir}/${dir}.tsx`;
    if (!existsSync(file)) throw new Error(`missing component source: src/primitives/${dir}/${dir}.tsx`);
    const { values, types } = parseExports(readFileSync(file, 'utf8'));
    if (values.length === 0) throw new Error(`no exported values in ${file}`);
    return { dir, values, types };
  });
}

export function importStatement(dir, values) {
  return `import { ${values.join(', ')} } from 'cieo/${dir}';`;
}
