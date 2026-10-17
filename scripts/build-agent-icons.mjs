// scripts/build-agent-icons.mjs — derives src/agent/icons.ts from the agent action icon atom.
// The atom (atoms/web/identity/agenticons-actions.js) stays the source of truth: it draws every icon as a pure
// function of (u, size, form), and u = 0 is the resting drawing. This script evaluates only its drawing half in an
// isolated context (no DOM), takes the product form at rest for each geometry tier, and writes it as plain data.
// Run: node scripts/build-agent-icons.mjs [--check]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const atomPath = `${root}/atoms/web/identity/agenticons-actions.js`;
const outPath = `${root}/src/agent/icons.ts`;
const check = process.argv.includes('--check');

const src = readFileSync(atomPath, 'utf8');
const start = src.indexOf('(() => {');
const end = src.indexOf('globalThis.AgentActionIcons');
if (start < 0 || end < 0) throw new Error('agent icon atom changed shape: drawing half not found');
// Rest-state stand-ins for the atom runtime. At u = 0 every key is still in the future, so progress is 0.
const prelude = `const S = { snap:{w:34}, base:{w:22}, soft:{w:15}, lazy:{w:9} };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prog = (t, t0) => (t - t0 <= 0 ? 0 : 1);\n`;
const body = src.slice(start + '(() => {'.length, end);
const sandbox = {};
vm.runInNewContext(`${prelude}${body}\nthis.out = { DEFS, GROUPS, frame };`, sandbox);
const { DEFS, GROUPS, frame } = sandbox.out;

// Geometry tiers the atom switches on: lod (<= 20px), sm (<= 24px), and larger.
const TIERS = [['compact', 20], ['regular', 24], ['large', 48]];
const TAGS = new Set(['path', 'circle', 'ellipse', 'rect', 'g']);
const ATTRS = new Set(['d', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'stroke', 'opacity', 'transform', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset', 'fill-opacity', 'stroke-opacity', 'fill-rule']);

function parse(markup) {
  const stack = [{ children: [] }];
  const re = /<(\/?)([a-z]+)((?:\s+[a-z-]+="[^"]*")*)\s*(\/?)>/g;
  let at = 0;
  for (const m of markup.matchAll(re)) {
    if (m.index !== at) throw new Error(`unparsed markup near: ${markup.slice(at, at + 40)}`);
    at = m.index + m[0].length;
    const [, close, tag, rawAttrs, selfClose] = m;
    if (!TAGS.has(tag)) throw new Error(`unexpected element <${tag}>`);
    if (close) {
      const node = stack.pop();
      if (node.tag !== tag) throw new Error(`mismatched </${tag}>`);
      continue;
    }
    const attrs = {};
    for (const a of rawAttrs.matchAll(/([a-z-]+)="([^"]*)"/g)) {
      if (!ATTRS.has(a[1])) throw new Error(`unexpected attribute ${a[1]} on <${tag}>`);
      attrs[a[1]] = a[2];
    }
    const node = { tag, attrs, children: [] };
    stack.at(-1).children.push(node);
    if (!selfClose) stack.push(node);
  }
  if (at !== markup.length || stack.length !== 1) throw new Error('unbalanced icon markup');
  return stack[0].children;
}

// Identity transforms at rest carry no meaning; unwrap them so the data stays minimal.
function simplify(nodes) {
  return nodes.flatMap((n) => {
    const children = simplify(n.children);
    if (n.tag === 'g' && Object.keys(n.attrs).every((k) => k === 'transform') && /^(translate\(0 0\)|)$/.test(n.attrs.transform ?? '')) return children;
    return [{ ...n, children }];
  });
}

const lit = (v) => JSON.stringify(v);
function emit(nodes) {
  return `[${nodes.map((n) => {
    const attrs = `{ ${Object.entries(n.attrs).map(([k, v]) => `${/^[a-z]+$/.test(k) ? k : lit(k)}: ${lit(v)}`).join(', ')} }`;
    return n.children.length ? `['${n.tag}', ${attrs}, ${emit(n.children)}]` : `['${n.tag}', ${attrs}]`;
  }).join(', ')}]`;
}

const tones = new Set(['success', 'danger', 'warning']);
const entries = DEFS.map((d) => {
  if (d.st !== null && !tones.has(d.st)) throw new Error(`unknown tone ${d.st}`);
  const tiers = {};
  for (const [tier, size] of TIERS) {
    const glyph = simplify(parse(frame(d, { u: 0, size }).parts.map((p) => p[1]).join('')));
    if (!glyph.length) throw new Error(`${d.k} has no resting drawing at ${size}px`);
    tiers[tier] = emit(glyph);
  }
  const regular = tiers.regular === tiers.compact ? 'compact' : null;
  const large = tiers.large === tiers.regular ? 'regular' : tiers.large === tiers.compact ? 'compact' : null;
  return { d, tiers, regular, large };
});

const consts = entries.map(({ d, tiers, regular, large }, i) => {
  const lines = [`const g${i}c: IconTree = ${tiers.compact};`];
  lines.push(regular ? `const g${i}r = g${i}c;` : `const g${i}r: IconTree = ${tiers.regular};`);
  lines.push(large ? `const g${i}l = g${i}${large[0]};` : `const g${i}l: IconTree = ${tiers.large};`);
  return lines.join('\n');
}).join('\n');

const list = entries.map(({ d }, i) =>
  `  { id: ${lit(d.k)}, name: ${lit(d.n)}, group: ${lit(d.g)}, tone: ${d.st ? lit(d.st) : 'null'}, description: ${lit(d.d)}, compact: g${i}c, regular: g${i}r, large: g${i}l },`
).join('\n');

const out = `/* Agent action and state icons as data. Generated by scripts/build-agent-icons.mjs from the agent icon atom; do not
   hand-edit. Each icon is its resting drawing in the product form: a 64-unit viewBox, a rounded square outline
   (the agent), and a stroked glyph in currentColor. No globals and no DOM: rendering is up to the caller. */

/** One SVG element: tag, attributes (SVG names), and children for groups. */
export type IconNode = readonly [tag: 'path' | 'circle' | 'ellipse' | 'rect' | 'g', attrs: Readonly<Record<string, string>>, children?: readonly IconNode[]];
export type IconTree = readonly IconNode[];
export type AgentIconGroup = ${GROUPS.map(([g]) => lit(g)).join(' | ')};
export type AgentIconTone = 'success' | 'danger' | 'warning';
export interface AgentIconDefinition {
  /** Stable key, e.g. "browsing". */
  id: string;
  /** Human name, e.g. "Browsing". */
  name: string;
  group: AgentIconGroup;
  /** Status colour the icon carries, or null for the current text colour. */
  tone: AgentIconTone | null;
  /** What the icon's motion shows in the original atom. */
  description: string;
  /** Glyph drawn at 20px and below. */
  compact: IconTree;
  /** Glyph drawn above 20px up to 24px. */
  regular: IconTree;
  /** Glyph drawn above 24px. */
  large: IconTree;
}

export const AGENT_ICON_VIEWBOX = '0 0 64 64';
export const AGENT_ICON_GROUPS: readonly { id: AgentIconGroup; hint: string }[] = [
${GROUPS.map(([g, h]) => `  { id: ${lit(g)}, hint: ${lit(h)} },`).join('\n')}
];

${consts}

export const AGENT_ICONS: readonly AgentIconDefinition[] = [
${list}
];

export type AgentIconId = ${DEFS.map((d) => lit(d.k)).join(' | ')};

const byId = new Map(AGENT_ICONS.map((icon) => [icon.id, icon]));
/** Looks an icon up by id. Returns undefined for an unknown id. */
export function getAgentIcon(id: string): AgentIconDefinition | undefined {
  return byId.get(id);
}

/** The glyph tier for a rendered pixel size. */
export function agentIconGlyph(icon: AgentIconDefinition, size: number): IconTree {
  return size <= 20 ? icon.compact : size <= 24 ? icon.regular : icon.large;
}

/** Rounds to one decimal, as the atom writes every number. */
export const roundIconUnit = (value: number): string => String(Math.round(value * 10) / 10);

/** Stroke width in viewBox units that keeps about 1.55px of stroke at any size, never under 1.7 units. Unrounded:
    pass it through roundIconUnit for an attribute. */
export function agentIconStrokeWidth(size: number): number {
  return Math.max(1.7, (1.55 * 64) / size);
}

/** The outline square for an unrounded stroke width, inset so the stroke stays inside the viewBox. */
export function agentIconOutline(strokeWidth: number): Readonly<Record<string, string>> {
  const r1 = roundIconUnit;
  return { x: r1(strokeWidth / 2 + 3), y: r1(strokeWidth / 2 + 3), width: r1(58 - strokeWidth), height: r1(58 - strokeWidth), rx: '15' };
}
`;

const prev = existsSync(outPath) ? readFileSync(outPath, 'utf8') : null;
if (prev === out) console.log('agent icons: up to date');
else if (check) {
  console.error('agent icons: stale (run node scripts/build-agent-icons.mjs)');
  process.exit(1);
} else {
  writeFileSync(outPath, out);
  console.log(`agent icons: wrote ${DEFS.length} icons to src/agent/icons.ts`);
}
