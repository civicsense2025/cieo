import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ENTRY_FILES = {
  next: ['app/layout.tsx', 'app/layout.jsx'],
  vite: ['src/main.tsx', 'src/main.jsx', 'main.tsx'],
};

const MARKER_START = '/* cieo:start */';
const MARKER_END = '/* cieo:end */';
const BLOCK_LINES = [
  MARKER_START,
  "import 'cieo/tokens.css';",
  "import 'cieo/design.css';",
  "import 'cieo/primitives.css';",
  "import './cieo-theme.css';",
  MARKER_END,
];

export const MARKER_BLOCK = BLOCK_LINES.join('\n');

const IMPORT_START = /^import(?:\s|['"{*])/;
const USE_CLIENT = /^(['"])use client\1;?$/;

function isComment(trimmed) {
  return /^\/\/|^\/\*|^\*/.test(trimmed);
}

function bracketDelta(line) {
  let delta = 0;
  for (const character of line) {
    if (character === '{' || character === '(') delta += 1;
    else if (character === '}' || character === ')') delta -= 1;
  }
  return delta;
}

function endsStatement(trimmed) {
  return trimmed.includes(';') || /['"]\s*;?\s*$/.test(trimmed);
}

/* Returns the offset just past the header line the block should follow, or null
   when the file has no leading import or directive. Blank and comment lines pass
   through; scanning stops at the first other line. A multi-line import counts as
   one statement and anchors after its closing line, never inside it. */
function headerAnchor(source) {
  let offset = 0;
  let depth = 0;
  let inImport = false;
  let anchor = null;
  while (offset < source.length) {
    const newline = source.indexOf('\n', offset);
    const lineEnd = newline === -1 ? source.length : newline;
    const raw = source.slice(offset, lineEnd);
    const line = raw.endsWith('\r') ? raw.slice(0, -1) : raw;
    const trimmed = line.trim();
    const next = newline === -1 ? source.length : newline + 1;

    if (inImport) {
      depth += bracketDelta(line);
      if (depth <= 0 && endsStatement(trimmed)) {
        inImport = false;
        anchor = next;
      }
    } else if (trimmed === '' || isComment(trimmed)) {
      // Part of the leading run, but not an anchor.
    } else if (USE_CLIENT.test(trimmed)) {
      anchor = next;
    } else if (IMPORT_START.test(trimmed)) {
      depth = bracketDelta(trimmed);
      if (depth <= 0 && endsStatement(trimmed)) {
        anchor = next;
      } else {
        inImport = true;
      }
    } else {
      break;
    }
    if (newline === -1) break;
    offset = next;
  }
  return anchor;
}

export function entryFileFor(root, target) {
  const candidates = ENTRY_FILES[target];
  if (candidates === undefined) return null;
  for (const relative of candidates) {
    const path = join(root, relative);
    if (existsSync(path)) return path;
  }
  return null;
}

/* Temp file + rename: a failed wiring write must never leave a half-written
   entry file where the original on disk was. */
function writeFileAtomic(path, content) {
  const temporary = `${path}.${process.pid}.cieo-tmp`;
  writeFileSync(temporary, content);
  try {
    renameSync(temporary, path);
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
}

export function wireEntry(root, target) {
  const candidates = ENTRY_FILES[target];
  if (candidates === undefined) {
    throw new Error(`Unknown target ${JSON.stringify(target)} — expected next or vite.`);
  }
  const file = entryFileFor(root, target);
  if (file === null) {
    throw new Error(
      `No ${candidates.join(' or ')} found in ${root} — create the entry file, then paste this block at its top:\n${MARKER_BLOCK}`,
    );
  }
  const source = readFileSync(file, 'utf8');
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const block = BLOCK_LINES.join(eol);

  let next;
  const startAt = source.indexOf(MARKER_START);
  const endAt = startAt === -1 ? -1 : source.indexOf(MARKER_END, startAt + MARKER_START.length);
  if (endAt !== -1) {
    next = source.slice(0, startAt) + block + source.slice(endAt + MARKER_END.length);
  } else {
    const anchor = headerAnchor(source);
    const at = anchor ?? 0;
    const insertion =
      anchor === null
        ? `${block}${eol}`
        : anchor === source.length && !source.endsWith('\n')
          ? `${eol}${block}`
          : `${block}${eol}`;
    next = source.slice(0, at) + insertion + source.slice(at);
  }

  const changed = next !== source;
  if (changed) writeFileAtomic(file, next);
  return { file, changed };
}
