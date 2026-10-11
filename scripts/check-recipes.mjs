#!/usr/bin/env node
// Guards recipe conventions for the catalogue/library builds.
//
//  (a) hint rule: a block html field containing class="hint" should use a
//      TRAILING plain-text hint div, which the build extracts into a caption
//      element outside the preview stage. The build only extracts trailing
//      plain-text hints, so default mode FAILs only on corruption risks
//      (unclosed divs, non-div hints). Non-trailing hints and trailing hints
//      with child elements are left in the demo on purpose and reported as
//      WARN for human triage.
//      --strict enforces the literal spec regex on every hint field:
//        /<div class="hint">[^<]*<\/div>\s*$/
//  (b) type rule: FAIL on `font-size:` >= 50px except files allowlisted in
//      scripts/recipe-allowlist.json (legitimate large display type).
//  (c) click rule: WARN list of div/span elements given .onclick handlers
//      without button semantics, for human triage. Never fails.
//
// Exit non-zero on FAIL, zero otherwise. No dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blocksDir = path.join(root, 'atoms/web/blocks');
const blocks = JSON.parse(fs.readFileSync(path.join(root, 'atoms/web/blocks.json'), 'utf8'));
const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
if (args.includes('--help') || args.includes('-h')) {
  console.log(`usage: node scripts/check-recipes.mjs [--strict]
  (a) trailing plain-text hint divs  (b) font-size >= 50px allowlist
  (c) clickable-div WARN triage list  (d) cross-file class collisions.
  --strict applies the literal
  /<div class="hint">[^<]*<\\/div>\\s*$/ regex to every hint field.`);
  process.exit(0);
}

const fails = [];
const warns = [];
const fail = (section, msg) => fails.push(`${section} ${msg}`);
const warn = (section, msg) => warns.push(`${section} ${msg}`);
const lineOf = (src, index) => src.slice(0, index).split('\n').length;

// --- template-literal scanner (balanced ${} nesting, escapes) ---
function scanTemplate(src, open) {
  // open: index just after the opening backtick. Returns {text, end}.
  let out = '';
  let i = open;
  const scanExpr = (k) => {
    // k: index just after '${'. Consumes to the matching '}'. Returns {text, end}.
    let s = '${';
    let depth = 1;
    while (k < src.length && depth > 0) {
      const c = src[k];
      if (c === '\\') { s += src.slice(k, k + 2); k += 2; continue; }
      if (c === '`') { const t = scanTemplate(src, k + 1); s += '`' + t.text + '`'; k = t.end; continue; }
      if (c === "'" || c === '"') {
        let m = k + 1;
        s += c;
        while (m < src.length) {
          if (src[m] === '\\') { s += src.slice(m, m + 2); m += 2; continue; }
          s += src[m];
          if (src[m] === c) { m += 1; break; }
          m += 1;
        }
        k = m;
        continue;
      }
      if (c === '$' && src[k + 1] === '{') { depth += 1; s += '${'; k += 2; continue; }
      if (c === '{') depth += 1;
      if (c === '}') { depth -= 1; if (depth === 0) { s += '}'; k += 1; break; } }
      s += c;
      k += 1;
    }
    return { text: s, end: k };
  };
  while (i < src.length) {
    const c = src[i];
    if (c === '\\') { out += src.slice(i, i + 2); i += 2; continue; }
    if (c === '`') return { text: out, end: i + 1 };
    if (c === '$' && src[i + 1] === '{') {
      const e = scanExpr(i + 2);
      out += e.text;
      i = e.end;
      continue;
    }
    out += c;
    i += 1;
  }
  return { text: out, end: i };
}

function scanQuoted(src, open, quote) {
  let out = '';
  let i = open;
  while (i < src.length) {
    const c = src[i];
    if (c === '\\') { out += src[i + 1] ?? ''; i += 2; continue; }
    if (c === quote) return { text: out, end: i + 1 };
    out += c;
    i += 1;
  }
  return { text: out, end: i };
}

// Every `html:` field value in a block file (files hold 1..n atoms, or helpers).
function htmlFields(src) {
  const fields = [];
  const re = /[{,\s]html\s*:/g;
  let m;
  while ((m = re.exec(src))) {
    const fieldAt = m.index + m[0].length;
    let i = fieldAt;
    while (i < src.length && /\s/.test(src[i])) i += 1;
    const q = src[i];
    if (q === '`') {
      const t = scanTemplate(src, i + 1);
      fields.push({ kind: 'template', text: t.text, at: fieldAt, start: i, end: t.end });
      re.lastIndex = t.end;
    } else if (q === '"' || q === "'") {
      const t = scanQuoted(src, i + 1, q);
      fields.push({ kind: 'quoted', text: t.text, at: fieldAt, start: i, end: t.end });
      re.lastIndex = t.end;
    } else {
      fields.push({ kind: 'dynamic', text: src.slice(i, i + 60).split('\n')[0], at: fieldAt });
    }
  }
  return fields;
}

// Remove ${...} interpolations (balanced) so '<' inside JS can't confuse HTML tests.
function maskInterpolations(text) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const at = text.indexOf('${', i);
    if (at < 0) { out += text.slice(i); break; }
    out += text.slice(i, at);
    let depth = 1;
    let k = at + 2;
    while (k < text.length && depth > 0) {
      if (text[k] === '$' && text[k + 1] === '{') { depth += 1; k += 2; continue; }
      if (text[k] === '{') depth += 1;
      if (text[k] === '}') depth -= 1;
      k += 1;
    }
    i = k;
  }
  return out;
}

const STRICT_HINT = /<div class="hint">[^<]*<\/div>\s*$/;
const HINT_OPEN = /<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)\bclass="hint"([^>]*)>/g;

// (a) trailing-hint rule ------------------------------------------------
for (const rel of blocks) {
  const file = path.join(blocksDir, path.basename(rel));
  const src = fs.readFileSync(file, 'utf8');
  const base = path.basename(rel);
  for (const [n, field] of htmlFields(src).entries()) {
    const label = `${base}#${n + 1}`;
    if (field.kind === 'dynamic') {
      if (field.text.includes('hint')) warn('HINT', `${label}:${lineOf(src, field.at)} dynamic html, cannot verify statically (${field.text.trim().slice(0, 60)})`);
      continue;
    }
    const masked = maskInterpolations(field.text);
    if (!masked.includes('class="hint"')) continue;
    if (STRICT && !STRICT_HINT.test(masked)) {
      fail('HINT', `${label} hint div is not a trailing plain-text div (strict)`);
      continue;
    }
    if (STRICT_HINT.test(masked)) continue; // the common case: build extracts it
    // Classify each hint occurrence. The build extracts trailing plain-text
    // hints into captions; anything else stays in the demo. Default mode
    // FAILs only on corruption risks (unclosed divs, non-div hints); the rest
    // is WARN triage. --strict applies the literal spec regex instead.
    let occ;
    HINT_OPEN.lastIndex = 0;
    let seen = 0;
    while ((occ = HINT_OPEN.exec(masked))) {
      seen += 1;
      const tag = occ[1].toLowerCase();
      const close = masked.indexOf('</div>', occ.index);
      if (close < 0) { fail('HINT', `${label} hint div never closes`); break; }
      const inner = masked.slice(occ.index + occ[0].length, close);
      const after = masked.slice(close + 6);
      const trailing = /^(?:\s*<\/div>)*\s*$/.test(after);
      if (tag !== 'div') {
        (trailing ? fail : warn)('HINT', `${label} <${tag} class="hint"> is not a div (left in place)`);
        continue;
      }
      if (trailing && inner.includes('<')) {
        warn('HINT', `${label} trailing hint has child elements, left in place (use plain text for a caption)`);
        continue;
      }
      if (!trailing) {
        warn('HINT', `${label} non-trailing hint stays inside the preview (move to trailing position for a caption)`);
      }
    }
    if (!seen) warn('HINT', `${label} mentions class="hint" without a matching hint div`);
  }
}

// (b) large-type rule ----------------------------------------------------
let allowlist = [];
let styleAllow = new Set();
try {
  const raw = JSON.parse(fs.readFileSync(path.join(root, 'scripts/recipe-allowlist.json'), 'utf8'));
  allowlist = Array.isArray(raw) ? raw : (raw.files ?? raw.allowlist ?? []);
  if (!Array.isArray(raw) && Array.isArray(raw.style)) styleAllow = new Set(raw.style);
} catch {
  allowlist = [];
}
const allowed = new Set(allowlist.map((f) => path.basename(f)));
for (const rel of blocks) {
  const src = fs.readFileSync(path.join(blocksDir, path.basename(rel)), 'utf8');
  const base = path.basename(rel);
  for (const m of src.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)\s*px/gi)) {
    if (parseFloat(m[1]) >= 50 && !allowed.has(base)) {
      fail('TYPE', `${base}:${lineOf(src, m.index)} font-size:${m[1]}px needs an allowlist entry or a smaller size`);
    }
  }
}

// (c) clickable-div triage (WARN only) ------------------------------------
const BUTTONY = /(^|[\s,>~+.#:[\]])button\b|input|select|textarea|\.btn\b|\.tg\b|\[role\s*=/i;
function selectorTarget(sel) {
  return BUTTONY.test(sel) ? 'button-like' : 'plain';
}
for (const rel of blocks) {
  const text = fs.readFileSync(path.join(blocksDir, path.basename(rel)), 'utf8');
  const base = path.basename(rel);
  // const x = <expr> bindings for identifier resolution (+ plain reassignments)
  const bindings = new Map();
  for (const m of text.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);/g)) {
    if (!bindings.has(m[1])) bindings.set(m[1], m[2].trim());
  }
  for (const m of text.matchAll(/(?:^|[;,{\n])\s*([A-Za-z_$][\w$]*)\s*=\s*(\$\([^;]+?\)|(?:[A-Za-z_$][\w$.]*\.)?querySelector(?:All)?\([^;]+?\)|document\.getElementById\([^;]+?\)|document\.createElement\([^;]+?\)|st)\s*;/g)) {
    if (!bindings.has(m[1])) bindings.set(m[1], m[2].trim());
  }
  // callback params iterating a collection: COLL.forEach((p) => ... p.onclick)
  // or for (const p of COLL) ... p.onclick
  const paramRoots = new Map();
  for (const m of text.matchAll(/([A-Za-z_$][\w$.]*(?:\([^;{}]*\))?)\s*\.\s*(?:forEach|map|each|filter)\s*\(\s*(?:\(\s*)?([A-Za-z_$][\w$]*)/g)) {
    if (!paramRoots.has(m[2])) paramRoots.set(m[2], m[1]);
  }
  for (const m of text.matchAll(/for\s*\(\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s+of\s+([^)]+?)\)/g)) {
    if (!paramRoots.has(m[1])) paramRoots.set(m[1], m[2].trim());
  }
  const targets = new Map(); // target -> {kind, snippet}
  const note = (target, kind, at) => {
    if (!targets.has(target)) {
      const snippet = at < 0 ? target : text.slice(Math.max(0, at - 30), at + target.length + 60).replace(/\s+/g, ' ').trim().slice(0, 140);
      targets.set(target, { kind, snippet });
    }
  };
  for (const m of text.matchAll(/([A-Za-z_$][\w$]*(?:\([^;{}]*\)|\[[^\]]*\])?)\s*\.onclick\s*=/g)) note(m[1], 'onclick', m.index);
  for (const m of text.matchAll(/([A-Za-z_$][\w$]*(?:\([^;{}]*\)|\[[^\]]*\])?)\s*\.addEventListener\(\s*['"]click['"]/g)) note(m[1], 'listener', m.index);
  const selOf = (expr) => {
    let m = expr.match(/^\$\(\s*[A-Za-z_$][\w$]*\s*,\s*(['"])(.+?)\1\s*\)$/);
    if (m) return m[2];
    m = expr.match(/^(?:[A-Za-z_$][\w$.]*\.)?querySelector(?:All)?\(\s*(['"])(.+?)\1\s*\)$/);
    if (m) return m[2];
    m = expr.match(/^document\.getElementById\(\s*(['"])(.+?)\1\s*\)$/);
    if (m) return `#${m[2]}`;
    return null;
  };
  for (const [target, info] of targets) {
    const resolveName = (name) => {
      if (bindings.has(name)) return bindings.get(name);
      if (paramRoots.has(name)) {
        const coll = paramRoots.get(name);
        if (/^[A-Za-z_$][\w$]*$/.test(coll) && bindings.has(coll)) return `${bindings.get(coll)}[]`;
        return coll;
      }
      return null;
    };
    const classifyExpr = (expr, depth = 0) => {
      if (!expr || depth > 3) return 'unknown';
      expr = expr.trim();
      const s = selOf(expr);
      if (s) return selectorTarget(s);
      if (/^st$/.test(expr)) return 'stage-div';
      const ce = expr.match(/^document\.createElement\(\s*['"]([^'"]+)['"]/);
      if (ce) return /^(div|span)$/.test(ce[1]) ? 'created-div' : (/^button$/.test(ce[1]) ? 'button-like' : 'unknown');
      // element factories: mEl('div'|'button', ...), h('span', ...), etc.
      const fac = expr.match(/^[A-Za-z_$][\w$.]*\(\s*['"]([A-Za-z][\w-]*)['"]/);
      if (fac) {
        const tag = fac[1].toLowerCase();
        if (tag === 'div' || tag === 'span') return 'created-div';
        if (['button', 'a', 'input', 'select', 'option'].includes(tag)) return 'button-like';
      }
      const mem = expr.match(/^([A-Za-z_$][\w$]*)\.[A-Za-z_$][\w$]*$/);
      if (mem) return classifyExpr(resolveName(mem[1]), depth + 1);
      if (/^[A-Za-z_$][\w$]*$/.test(expr)) return classifyExpr(resolveName(expr), depth + 1);
      return 'unknown';
    };
    let cls = classifyExpr(target);
    if (cls === 'unknown' && paramRoots.has(target) && /btn|button|link|tab|chip|opt/i.test(paramRoots.get(target))) cls = 'button-like?';
    if (cls === 'button-like') continue;
    warn('CLICK', `${base} ${info.kind} on ${cls} :: ${target} :: ${info.snippet}`);
  }
}

// (d) cross-file class collisions -----------------------------------------
// Recipe <style> blocks share one document on unscoped surfaces, and
// head-injected styles (<style> outside any html: field, e.g. via
// insertAdjacentHTML) escape even the collection surface's per-tile scoping.
// Two shapes FAIL:
//  (d1) same bare selector with disjoint declaration sets across 2+ files
//       (same-file repeats are responsive overrides, not collisions;
//       identical bodies everywhere are shared convention, not collisions).
//  (d2) class used in block X, styled nowhere in X nor shared CSS, while a
//       HEAD-INJECTED style in another file defines it with layout props.
//       (Head injection bypasses per-tile scoping on every surface.)
// Anything else suspicious (usage vs foreign field-style defs) is WARN
// triage: unscoped surfaces concat everything, but most of it is either
// intentional sharing or scoped-safe on the primary surface.
const LAYOUT_PROPS = /\b(position|display|float|width|height|padding|margin|inset|top|left|right|bottom|overflow|flex|grid|transform|z-index|place-|align-|justify-|gap|order|container-type)\s*:/;
function splitSelectors(group) {
  // Split a selector group on top-level commas (parens/brackets respected).
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < group.length; i += 1) {
    const c = group[i];
    if (c === '(' || c === '[') depth += 1;
    else if (c === ')' || c === ']') depth -= 1;
    else if (c === ',' && depth === 0) { out.push(group.slice(start, i)); start = i + 1; }
  }
  out.push(group.slice(start));
  return out.map((s) => s.trim()).filter(Boolean);
}
function bareRuleEntries(css) {
  // [selector, body] for bare .cls rules, incl. comma groups + nested matches.
  const out = [];
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const r of clean.matchAll(/(^|[;}{])\s*([^{}@]+?)\s*\{([^{}]*)\}/g)) {
    if (!r[2] || r[2].trim().startsWith('@')) continue;
    const body = r[3].split(';').map((p) => p.trim()).filter(Boolean).sort().join(';');
    if (!body) continue;
    for (const part of splitSelectors(r[2])) {
      if (/^\.[A-Za-z][\w-]*$/.test(part)) out.push([part, body]);
    }
  }
  return out;
}
function styleMatches(src) {
  // All <style> matches with absolute offsets.
  const out = [];
  for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    out.push({ start: m.index, css: m[1] });
  }
  return out;
}
const SHARED_CSS = ['atoms/web/catalogue/atoms.css', 'atoms/web/catalogue/shell.css'];
const sharedClasses = new Set();
for (const rel of SHARED_CSS) {
  try {
    const css = fs.readFileSync(path.join(root, rel), 'utf8');
    for (const m of css.matchAll(/\.([A-Za-z][\w-]*)/g)) sharedClasses.add(m[1]);
  } catch { /* missing shared sheet: skip silently */ }
}
const definedBy = new Map(); // selector -> Map(file -> Set(bodies)), all defs
const headDefs = new Map(); // selector -> Map(file -> Set(bodies)), head-injected only
const usedBy = new Map(); // class -> Set(files using it in html fields)
for (const rel of blocks) {
  const file = path.join(blocksDir, path.basename(rel));
  const src = fs.readFileSync(file, 'utf8');
  const base = path.basename(rel);
  const fields = htmlFields(src);
  const inField = (idx) => fields.some((f) => f.start !== undefined && idx >= f.start && idx < (f.end ?? Infinity));
  for (const sm of styleMatches(src)) {
    const head = !inField(sm.start);
    for (const [sel, body] of bareRuleEntries(sm.css)) {
      if (!definedBy.has(sel)) definedBy.set(sel, new Map());
      const per = definedBy.get(sel);
      if (!per.has(base)) per.set(base, new Set());
      per.get(base).add(body);
      if (head) {
        if (!headDefs.has(sel)) headDefs.set(sel, new Map());
        const hp = headDefs.get(sel);
        if (!hp.has(base)) hp.set(base, new Set());
        hp.get(base).add(body);
      }
    }
  }
  for (const field of htmlFields(src)) {
    if (field.kind === 'dynamic') continue;
    const masked = maskInterpolations(field.text);
    for (const m of masked.matchAll(/class="([^"]*)"/g)) {
      for (const cls of m[1].split(/\s+/)) {
        if (/^[A-Za-z][\w-]*$/.test(cls)) {
          if (!usedBy.has(cls)) usedBy.set(cls, new Set());
          usedBy.get(cls).add(base);
        }
      }
    }
  }
}
for (const rel of ['atoms/web/catalogue/atoms.css', 'atoms/web/catalogue/shell.css']) {
  try {
    const css = fs.readFileSync(path.join(root, rel), 'utf8');
    const key = `shared:${path.basename(rel)}`;
    for (const [sel, body] of bareRuleEntries(css)) {
      if (!definedBy.has(sel)) definedBy.set(sel, new Map());
      if (!definedBy.get(sel).has(key)) definedBy.get(sel).set(key, new Set());
      definedBy.get(sel).get(key).add(body);
    }
  } catch { /* missing shared sheet: skip silently */ }
}
for (const [sel, per] of [...definedBy].sort()) {
  // Accepted convention (see recipe-allowlist.json `style`): the 41-file
  // template pins .small with !important, so it wins deterministically
  // everywhere despite the shell's plainer value. Exempt, don't normalize.
  if (styleAllow.has(sel)) continue;
  const files = [...per.keys()];
  if (files.length < 2) continue;
  const common = files.map((f) => per.get(f)).reduce((a, b) => new Set([...a].filter((x) => b.has(x))));
  if (common.size === 0) {
    fail('STYLE', `${sel} has disjoint declarations across ${files.join(', ')} (rename to a namespaced class)`);
  }
}
const warnedStyle = new Set();
for (const [cls, users] of [...usedBy].sort()) {
  const sel = `.${cls}`;
  if (sharedClasses.has(cls)) continue;
  const definers = definedBy.has(sel) ? [...definedBy.get(sel).keys()].filter((f) => !f.startsWith('shared:')) : [];
  const orphans = [...users].filter((f) => !definers.includes(f));
  if (!orphans.length || !definers.length) continue;
  // FAIL only when a head-injected definition (unscoped on every surface)
  // carries layout: that is the proven cross-tile breaker shape.
  const headOwners = (headDefs.has(sel) ? [...headDefs.get(sel).keys()] : [])
    .filter((f) => !orphans.includes(f) && [...headDefs.get(sel).get(f)].some((b) => LAYOUT_PROPS.test(b)));
  if (headOwners.length) {
    fail('STYLE', `.${cls} used in ${orphans.join(', ')} but head-styled only in ${headOwners.join(', ')} (rename one side)`);
    continue;
  }
  // Anything else foreign-styled is WARN triage: unscoped surfaces concat
  // everything, so verify visually before renaming (may be intentional sharing).
  const layoutOwners = definers.filter((f) =>
    [...definedBy.get(sel).get(f)].some((b) => LAYOUT_PROPS.test(b)));
  if (layoutOwners.length && !warnedStyle.has(cls)) {
    warnedStyle.add(cls);
    warn('STYLE', `.${cls} used in ${orphans.join(', ')} but styled only in ${layoutOwners.join(', ')} (verify visually; may be intentional sharing)`);
  }
}

// --- verdict ---
for (const w of warns) console.log(`WARN ${w}`);
for (const f of fails) console.log(`FAIL ${f}`);
const hintFails = fails.filter((f) => f.startsWith('HINT')).length;
const typeFails = fails.filter((f) => f.startsWith('TYPE')).length;
const styleFails = fails.filter((f) => f.startsWith('STYLE')).length;
const clicks = warns.filter((w) => w.startsWith('CLICK')).length;
const hintWarns = warns.filter((w) => w.startsWith('HINT')).length;
if (fails.length) {
  console.log(`check-recipes: FAIL hints=${hintFails} type=${typeFails} style=${styleFails} (warnings: hints=${hintWarns} clicks=${clicks})${STRICT ? ' [strict]' : ''}`);
  process.exit(1);
}
console.log(`check-recipes: PASS blocks=${blocks.length} (warnings: hints=${hintWarns} clicks=${clicks})${STRICT ? ' [strict]' : ''}`);
