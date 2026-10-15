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

/* Every line with byte offsets, so callers can preserve or replace exact
   ranges. A trailing '\r' stays out of `text` but inside the line's span. */
function scanLines(source) {
  const lines = [];
  let offset = 0;
  while (offset < source.length) {
    const newline = source.indexOf('\n', offset);
    const lineEnd = newline === -1 ? source.length : newline;
    const end = lineEnd > offset && source[lineEnd - 1] === '\r' ? lineEnd - 1 : lineEnd;
    lines.push({
      start: offset,
      next: newline === -1 ? source.length : newline + 1,
      hasNewline: newline !== -1,
      text: source.slice(offset, end),
    });
    if (newline === -1) break;
    offset = newline + 1;
  }
  return lines;
}

/* Returns the offset just past the header line the block should follow, or null
   when the file has no leading import or directive. Blank and comment lines pass
   through; scanning stops at the first other line. A multi-line import counts as
   one statement and anchors after its closing line, never inside it. */
function headerAnchor(source) {
  let depth = 0;
  let inImport = false;
  let anchor = null;
  for (const line of scanLines(source)) {
    const trimmed = line.text.trim();
    if (inImport) {
      depth += bracketDelta(line.text);
      if (depth <= 0 && endsStatement(trimmed)) {
        inImport = false;
        anchor = line.next;
      }
      continue;
    }
    if (trimmed === '' || isComment(trimmed)) continue;
    if (USE_CLIENT.test(trimmed)) {
      anchor = line.next;
      continue;
    }
    if (IMPORT_START.test(trimmed)) {
      depth = bracketDelta(trimmed);
      if (depth <= 0 && endsStatement(trimmed)) anchor = line.next;
      else inImport = true;
      continue;
    }
    break;
  }
  return anchor;
}

/* Whole-line markers only: text inside a string literal or a longer comment
   line never counts. Every start marker must be immediately followed by an end
   marker, otherwise the file is ambiguous and wireEntry refuses to guess. */
function blockRange(source, file) {
  const markers = [];
  for (const line of scanLines(source)) {
    const trimmed = line.text.trim();
    if (trimmed === MARKER_START) markers.push({ kind: 'start', line });
    else if (trimmed === MARKER_END) markers.push({ kind: 'end', line });
  }
  for (let index = 0; index < markers.length; index += 1) {
    if (markers[index].kind !== 'start') continue;
    const pair = markers[index + 1];
    if (pair === undefined || pair.kind !== 'end') {
      throw new Error(
        `${file} has a /* cieo:start */ marker with no matching /* cieo:end */ marker — fix or remove the stray marker, then run this again.`,
      );
    }
  }
  const first = markers.findIndex((marker) => marker.kind === 'start');
  if (first === -1) return null;
  return {
    from: markers[first].line.start,
    to: markers[first + 1].line.next,
    trailingEol: markers[first + 1].line.hasNewline,
  };
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

  const range = blockRange(source, file);
  let next;
  if (range !== null) {
    const replacement = range.trailingEol ? `${block}${eol}` : block;
    next = source.slice(0, range.from) + replacement + source.slice(range.to);
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
