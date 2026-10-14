#!/usr/bin/env node
// scripts/minify.mjs — additive post-build minification (node built-ins only).
//
// What it does (never rewrites existing outputs, only ADDS derived files):
//   dist/**/*.js              -> dist/**/*.min.js     (comments + layout whitespace only)
//   src/controls/controls.css -> dist/controls/controls.min.css (same, CSS-safe rules)
//
// Safety model (deliberately conservative, no token merging/renaming):
//   JS: single-pass scanner that is string-, template-literal- (${} aware),
//       regex- and comment-aware. Newlines are preserved 1:1 (zero ASI risk);
//       only comments, indentation, trailing space and blank lines go.
//       Every .min.js is re-parsed with `node --check`; a file that fails
//       validation is skipped and fails the build loudly (no silent partial).
//   CSS: comment strip + whitespace collapse with string awareness, a
//       calc()/min()/max()/clamp() spacing guard, and media-query `and/or/not`
//       guards. Validated by selector-sequence equality + brace balance.
//
// If this ever feels too clever, the one-liner it stands in for is:
//   npx -y esbuild dist --outdir=dist --format=esm --minify --out-extension:.js=.min.js
// Run: node scripts/minify.mjs [--check]
//   --check verifies all .min.* files are fresh without writing.

import { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
// Importing this module (e.g. from a test) must be side-effect free: the
// driver below only runs when invoked directly as a script.
const invokedDirectly = (() => {
  try {
    return !!process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
  } catch {
    return false;
  }
})();

// ---------- shared ----------
const isIdChar = (c) =>
  c === '$' || c === '_' ||
  (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
  (c >= '0' && c <= '9') || (c !== undefined && c.codePointAt(0) > 127);
// Pairs that must never be glued by whitespace removal (would form a
// different token, or worse, a // or /* comment).
const GLUE_GUARD = new Set([
  '++', '--', '==', '!=', '+=', '-=', '*=', '/=', '%=', '**',
  '<<', '>>', '&&', '||', '??', '<=', '>=', '=>', '//', '/*',
  '&&=', '||=', '??=', '**=', '<<=', '>>=', '&=', '|=', '^=',
]);
const JS_KEYWORDS_BEFORE_REGEX = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete',
  'void', 'throw', 'case', 'do', 'else', 'yield', 'await',
]);
const isWs = (c) => c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f' || c === '\v';

function minifyJs(src) {
  if (src.startsWith('#!')) {
    const nl = src.indexOf('\n');
    return src.slice(0, nl + 1) + minifyJs(src.slice(nl + 1));
  }
  let i = 0;
  const n = src.length;
  let out = '';
  let prevSig = '';
  let pendingNL = false;
  let pendingSP = false;
  const flush = (next) => {
    if (pendingNL) out += '\n';
    else if (pendingSP && prevSig && next &&
      ((isIdChar(prevSig) && isIdChar(next)) || GLUE_GUARD.has(prevSig + next))) out += ' ';
    pendingNL = false;
    pendingSP = false;
  };
  const prevWord = () => {
    let j = out.length - 1;
    while (j >= 0 && isIdChar(out[j])) j -= 1;
    return out.slice(j + 1);
  };
  const skipWs = () => {
    let nl = false;
    while (i < n && isWs(src[i])) { if (src[i] === '\n') nl = true; i += 1; }
    if (nl) pendingNL = true; else pendingSP = true;
  };
  const skipLineComment = () => {
    while (i < n && src[i] !== '\n') i += 1;
    pendingNL = true;
  };
  const atHtmlOpen = () => src.startsWith('<!--', i);
  const atHtmlClose = () => pendingNL && src.startsWith('-->', i);
  const copyString = (quote) => {
    flush(quote);
    out += quote; prevSig = quote; i += 1;
    while (i < n) {
      const c = src[i];
      out += c; i += 1;
      if (c === '\\' && i < n) { out += src[i]; i += 1; continue; }
      if (c === quote) { prevSig = quote; return; }
      if ((quote === "'" || quote === '"') && c === '\n') { prevSig = c; return; } // invalid JS anyway
    }
  };
  // Template literals copy verbatim; ${} re-enters expression mode.
  const copyTemplate = () => {
    flush('`');
    out += '`'; prevSig = '`'; i += 1;
    while (i < n) {
      const c = src[i];
      if (c === '\\' && i + 1 < n) { out += c + src[i + 1]; i += 2; continue; }
      if (c === '`') { out += c; i += 1; prevSig = '`'; return; }
      if (c === '$' && src[i + 1] === '{') {
        out += '${'; i += 2;
        prevSig = '{'; // `${` opens an expression: a leading `/` is a regex.
        copyExpr();    // Recursion is the context stack: nesting re-saves/restores.
        prevSig = '`'; // Back in template-verbatim mode (unused until close).
        continue;
      }
      out += c; i += 1;
    }
  };
  // Expression mode. stopAtBrace=true for ${...}: returns after its close.
  const copyCode = (stopAtBrace) => {
    let depth = 0;
    for (;;) {
      if (i >= n) return;
      if (atHtmlClose()) { skipLineComment(); continue; }
      const c = src[i];
      if (isWs(c)) { skipWs(); continue; }
      if (atHtmlOpen()) { skipLineComment(); continue; }
      if (c === '/' && src[i + 1] === '/') { skipLineComment(); continue; }
      if (c === '/' && src[i + 1] === '*') {
        const end = src.indexOf('*/', i + 2);
        const body = end === -1 ? src.slice(i) : src.slice(i, end + 2);
        i = end === -1 ? n : end + 2;
        // A block comment containing a newline counts as a LineTerminator
        // for the restricted productions (return/throw/...): keep the break.
        if (body.includes('\n')) pendingNL = true; else pendingSP = true;
        continue;
      }
      if (c === "'" || c === '"') { copyString(c); continue; }
      if (c === '`') { copyTemplate(); continue; }
      if (c === '{') { flush(c); out += c; prevSig = c; i += 1; depth += 1; continue; }
      if (c === '}') {
        flush(c); out += c; prevSig = c; i += 1;
        if (stopAtBrace && depth === 0) return;
        depth = Math.max(0, depth - 1); continue;
      }
      if (c === '/') { codeSlash(); continue; }
      flush(c); out += c; prevSig = c; i += 1;
    }
  };
  const copyExpr = () => copyCode(true);
  const regexAllowed = () =>
    prevSig === '' || '([{,=;:!&|?+-*%<>^~'.includes(prevSig) ||
    JS_KEYWORDS_BEFORE_REGEX.has(prevWord());
  const tryRegex = () => {
    let j = i + 1;
    let inClass = false;
    let closed = false;
    while (j < n) {
      const c = src[j];
      if (c === '\\') { j += 2; continue; }
      if (c === '\n') break;
      if (c === '[') inClass = true;
      else if (c === ']') inClass = false;
      else if (c === '/' && !inClass) { closed = true; break; }
      j += 1;
    }
    if (!closed) return false;
    j += 1;
    while (j < n && src[j] >= 'a' && src[j] <= 'z') j += 1; // flags
    flush('/');
    out += src.slice(i, j);
    prevSig = src[j - 1];
    i = j;
    return true;
  };
  const codeSlash = () => {
    // `//` and `/*` never reach here (handled above). A regex is attempted
    // first when the position allows one, so `= /=/` still parses as regex.
    if (regexAllowed() && tryRegex()) return;
    if (src[i + 1] === '=') { flush('/'); out += '/='; prevSig = '='; i += 2; return; }
    flush('/'); out += '/'; prevSig = '/'; i += 1;
  };
  copyCode(false);
  return out.replace(/^\n+/, '').replace(/\s+$/, '') + '\n';
}

function minifyCss(src) {
  // 1. Strip /* */ comments (string-aware). A block comment is replaced by a
  //    sentinel space only when glued between two identifier chars
  //    (descendant combinator); otherwise it vanishes.
  let s = '';
  {
    let i = 0;
    const n = src.length;
    let quote = null;
    while (i < n) {
      const c = src[i];
      if (quote) {
        s += c; i += 1;
        if (c === '\\' && i < n) { s += src[i]; i += 1; }
        else if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'") { quote = c; s += c; i += 1; continue; }
      if (c === '/' && src[i + 1] === '*') {
        const end = src.indexOf('*/', i + 2);
        const prev = s[s.length - 1];
        const next = end === -1 ? '' : src[end + 2];
        i = end === -1 ? n : end + 2;
        if (prev && next && isIdChar(prev) && isIdChar(next)) s += ' ';
        continue;
      }
      s += c; i += 1;
    }
  }
  // 2. Collapse whitespace. calc()/min()/max()/clamp() math and media-query
  //    `and/or/not/only` keep their spaces; `p : v` tightens only inside a
  //    declaration block (tracked by brace depth), so `a :hover` survives.
  const MATH_FN = new Set(['calc', 'min', 'max', 'clamp']);
  const MEDIA_KW = new Set(['and', 'or', 'not', 'only']);
  const wordAt = (str, pos) => {
    let k = pos;
    while (k < str.length && isIdChar(str[k])) k += 1;
    return str.slice(pos, k).toLowerCase();
  };
  const wordBefore = (pos) => {
    let j = pos - 1;
    while (j >= 0 && isIdChar(s[j])) j -= 1;
    return s.slice(j + 1, pos).toLowerCase();
  };
  let out = '';
  let i = 0;
  const n = s.length;
  const fnStack = []; // 'math' | 'other' per open paren
  let braceDepth = 0;
  let quote2 = null;
  while (i < n) {
    const c = s[i];
    if (quote2) {
      out += c; i += 1;
      if (c === '\\' && i < n) { out += s[i]; i += 1; }
      else if (c === quote2) quote2 = null;
      continue;
    }
    if (c === '"' || c === "'") { quote2 = c; out += c; i += 1; continue; }
    if (c === '{') { braceDepth += 1; out += c; i += 1; continue; }
    if (c === '}') { braceDepth = Math.max(0, braceDepth - 1); out += c; i += 1; continue; }
    if (c === '(') {
      fnStack.push(MATH_FN.has(wordBefore(i)) ? 'math' : 'other');
      out += c; i += 1; continue;
    }
    if (c === ')') { fnStack.pop(); out += c; i += 1; continue; }
    if (!isWs(c)) { out += c; i += 1; continue; }
    let j = i;
    while (j < n && isWs(s[j])) j += 1;
    const prev = out[out.length - 1] ?? '';
    const next = s[j] ?? '';
    i = j;
    if (!prev || !next) continue; // trim edges
    if (prev === '{' || prev === '}' || prev === ';' || prev === ',' || prev === '(' || prev === '[') continue;
    if (next === '{' || next === '}' || next === ';' || next === ',' || next === ')' || next === ']') continue;
    if (next === ':' || prev === ':') {
      if (braceDepth === 0) { out += ' '; continue; } // selector context: `a :hover`
      continue; // declaration context: `p:v`
    }
    if (fnStack.includes('math')) { out += ' '; continue; } // calc() needs its spaces
    if (prev === '/' || next === '/') { out += ' '; continue; } // `rgb(0 0 0 / 0.06)` slash needs sides
    if ((isIdChar(prev) || prev === ')' || prev === ']' || prev === '"' || prev === "'") &&
      (isIdChar(next) || next === '.' || next === '#' || next === '[' || next === '*')) {
      out += ' '; continue; // descendant combinator: `.a .b`, `a .b`, `* .b`
    }
    if (next === '(') {
      if (isIdChar(prev)) { out += ' '; continue; } // and(, not(, url (
      continue;
    }
    if (prev === ')') { out += ' '; continue; } // ) and (, ) bar
    if (MEDIA_KW.has(wordBefore(out.length)) || MEDIA_KW.has(wordAt(s, j))) { out += ' '; continue; }
    if (isIdChar(prev) && isIdChar(next)) { out += ' '; continue; } // descendant, `1px solid`
    // combinators (>, +, ~) and the rest glue tight
  }
  return out.replace(/;}/g, '}').trim() + '\n';
}

function cssSelectorsSeq(css) {
  // Selector fingerprint: text before each `{`, whitespace-normalised.
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, ' ');
  return noComments.split('{').slice(0, -1).map((part) => {
    const sel = part.split('}').pop() ?? '';
    // Normalise insignificant selector spacing the minifier also removes.
    return sel.replace(/\s+/g, ' ').trim().replace(/\s*([>+~,])\s*/g, '$1');
  }).join('\n');
}

// ---------- drivers ----------
function walkJs(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walkJs(p, acc);
    else if (e.name.endsWith('.js') && !e.name.endsWith('.min.js')) acc.push(p);
  }
  return acc;
}

const CSS_BANNER = '/* cieo controls.min.css — generated by scripts/minify.mjs; do not edit. Source: src/controls/controls.css */\n';
const cssSrcPath = join(root, 'src/controls/controls.css');
const cssTarget = join(root, 'dist/controls/controls.min.css');

let failures = 0;
let jsBefore = 0, jsAfter = 0, jsFiles = 0, jsSkipped = 0;
let cssBefore = 0, cssAfter = 0;
const writes = [];

const distDir = join(root, 'dist');
if (invokedDirectly && !existsSync(distDir)) {
  console.error('minify: dist/ missing — run tsc build first');
  process.exitCode = 1;
} else if (invokedDirectly && !CHECK) {
  for (const file of walkJs(distDir).sort()) {
    const src = readFileSync(file, 'utf8');
    const srcBytes = statSync(file).size;
    let min;
    try {
      min = minifyJs(src);
    } catch (err) {
      console.error(`minify: ${file}: minifier threw: ${err.message}`);
      failures += 1;
      continue;
    }
    if (min.length >= src.length) { jsSkipped += 1; continue; } // no win: skip
    const target = file.replace(/\.js$/, '.min.js');
    const probe = file.replace(/\.js$/, '.check.mjs'); // .mjs: always parsed as ESM
    writeFileSync(probe, min);
    try {
      execFileSync(process.execPath, ['--check', probe], { stdio: 'pipe' });
    } catch {
      console.error(`minify: ${target}: node --check failed, skipping`);
      failures += 1;
    } finally {
      try { unlinkSync(probe); } catch { /* noop */ }
    }
    if (failures) continue;
    writes.push([target, min]);
    jsBefore += srcBytes;
    jsAfter += Buffer.byteLength(min, 'utf8');
    jsFiles += 1;
  }
  const cssSrc = readFileSync(cssSrcPath, 'utf8');
  cssBefore = statSync(cssSrcPath).size;
  const cssMin = minifyCss(cssSrc);
  cssAfter = Buffer.byteLength(cssMin, 'utf8');
  const open = (x) => (x.match(/{/g) || []).length;
  const close = (x) => (x.match(/}/g) || []).length;
  const okBalance = open(cssSrc) === open(cssMin) && close(cssSrc) === close(cssMin) && open(cssMin) > 0;
  const okSelectors = cssSelectorsSeq(cssSrc) === cssSelectorsSeq(cssMin);
  if (!okBalance || !okSelectors || cssMin.length >= cssSrc.length) {
    console.error(`minify: CSS validation failed (balance=${okBalance} selectors=${okSelectors})`);
    failures += 1;
  } else {
    writes.push([cssTarget, CSS_BANNER + cssMin]);
  }
  for (const [path, content] of writes) writeFileSync(path, content);
} else if (invokedDirectly) {
  // --check: every dist .js with savings must have a current .min.js.
  for (const file of walkJs(distDir).sort()) {
    const src = readFileSync(file, 'utf8');
    const min = minifyJs(src);
    if (min.length >= src.length) continue;
    const target = file.replace(/\.js$/, '.min.js');
    let actual = null;
    try { actual = readFileSync(target, 'utf8'); } catch { actual = null; }
    if (actual !== min) { console.error(`Stale minified file: ${target}`); failures += 1; }
  }
  const cssSrc = readFileSync(cssSrcPath, 'utf8');
  let actual = null;
  try { actual = readFileSync(cssTarget, 'utf8'); } catch { actual = null; }
  if (actual !== CSS_BANNER + minifyCss(cssSrc)) { console.error(`Stale minified file: ${cssTarget}`); failures += 1; }
}

const pct = (a, b) => (100 * (1 - b / a)).toFixed(1);
if (invokedDirectly && !CHECK) {
  console.log(`minify: js ${jsFiles} files ${jsBefore} -> ${jsAfter} bytes (-${pct(jsBefore, jsAfter)}%)${jsSkipped ? `, ${jsSkipped} tiny skipped` : ''}`);
  if (cssAfter) console.log(`minify: controls.css ${cssBefore} -> ${cssAfter} bytes (-${pct(cssBefore, cssAfter)}%) + banner`);
}
if (failures) { console.error(`minify: ${failures} failure(s)`); process.exitCode = 1; }
else if (invokedDirectly && CHECK) console.log('minify: all .min.* files fresh');

export { minifyJs, minifyCss, cssSelectorsSeq };
