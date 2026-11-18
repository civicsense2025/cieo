#!/usr/bin/env node
// Keeps the whole repository in US English. `--check` fails on any British spelling in tracked text; no flag rewrites
// text and renames files, preserving case. Words that are correct in US English (cancellation, organism, optimistic,
// aria-labelledby) are never touched.
// Usage: node scripts/us-spelling.mjs [--check]
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/** [British stem pattern, US replacement]. Patterns are word-bounded on the left and take their ending from the source. */
export const RULES = [
  [/colour/g, 'color'], [/behaviour/g, 'behavior'], [/centred/g, 'centered'], [/centring/g, 'centering'], [/centre/g, 'center'], [/\bgrey/g, 'gray'],
  [/labell(?!ed?by)/g, 'label'], [/(?<!Task\.is)cancell(?!ation)/g, 'cancel'], [/catalogue/g, 'catalog'], [/analyse(?!r)/g, 'analyze'],
  [/travell/g, 'travel'], [/modell/g, 'model'], [/signall/g, 'signal'], [/favour/g, 'favor'], [/licence/g, 'license'],
  [/\bdialogue/g, 'dialog'], [/artefact/g, 'artifact'], [/judgement/g, 'judgment'], [/\bageing/g, 'aging'],
  [/\bwhilst\b/g, 'while'], [/\bamongst\b/g, 'among'], [/\bfulfil\b/g, 'fulfill'], [/\benrol\b/g, 'enroll'],
  [/\bprogramme/g, 'program'],
  [/customis/g, 'customiz'], [/initialis/g, 'initializ'], [/normalis/g, 'normaliz'], [/recognis/g, 'recogniz'],
  [/summaris/g, 'summariz'], [/serialis/g, 'serializ'], [/visualis/g, 'visualiz'], [/synchronis/g, 'synchroniz'],
  [/minimis/g, 'minimiz'], [/maximis/g, 'maximiz'], [/organis(?!m)/g, 'organiz'], [/optimis(?!t)/g, 'optimiz'],
];
const SKIP = /^(node_modules\/|dist\/|\.deploy|docs\/generated\/|package-lock\.json$|.*\.min\.(js|css)$|.*\.(png|jpg|jpeg|gif|webp|ico|woff2?|ttf|m4a|mp3|mp4|pdf|tgz|metal)$|scripts\/us-spelling\.mjs$|test\/us-spelling\.test\.mjs$|test\/fixtures\/)/;

function applyCase(source, from, to) {
  return source.replace(new RegExp(from.source, 'gi'), (m) => {
    const lower = to;
    if (m === m.toUpperCase() && m.length > 1) return lower.toUpperCase();
    if (m[0] === m[0].toUpperCase()) return lower[0].toUpperCase() + lower.slice(1);
    return lower;
  });
}

/** A line carrying this marker is left alone: it names something outside our control, such as a live legacy URL. */
export const KEEP = 'us-spelling-keep';
const perLine = (text, fn) => text.split('\n').map((line) => (line.includes(KEEP) ? line : fn(line))).join('\n');

export function toUS(text) {
  return perLine(text, (line) => {
    let out = line;
    for (const [from, to] of RULES) out = applyCase(out, from, to);
    return out;
  });
}

export function findings(text) {
  const hits = [];
  perLine(text, (line) => { for (const [from] of RULES) for (const m of line.matchAll(new RegExp(from.source, 'gi'))) hits.push(m[0]); return line; });
  return hits;
}

const files = () => execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8', maxBuffer: 1 << 28 })
  .split('\0').filter((f) => f && !SKIP.test(f) && existsSync(f));

const isText = (buf) => !buf.subarray(0, 4000).includes(0);

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const check = process.argv.includes('--check');
  let changed = 0, bad = 0;
  for (const f of files()) {
    const buf = readFileSync(f);
    if (!isText(buf)) continue;
    const text = buf.toString('utf8');
    if (check) { const hits = findings(text); if (hits.length) { bad += 1; console.error(`${f}: ${[...new Set(hits)].slice(0, 5).join(', ')}`); } continue; }
    const next = toUS(text);
    if (next !== text) { writeFileSync(f, next); changed += 1; }
  }
  if (!check) {
    for (const f of files()) {
      const to = toUS(f);
      if (to !== f) { mkdirSync(dirname(to), { recursive: true }); execFileSync('git', ['mv', '-f', f, to]); changed += 1; }
    }
  }
  if (check) { if (bad) { console.error(`${bad} files use British spelling; run node scripts/us-spelling.mjs`); process.exit(1); } console.log('us-spelling: clean'); }
  else console.log(`us-spelling: ${changed} files rewritten or renamed`);
}
