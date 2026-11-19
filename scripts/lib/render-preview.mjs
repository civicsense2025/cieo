// scripts/lib/render-preview.mjs — server-renders the real component so a doc preview carries the exact classes and markup it ships with.
// Props come from scripts/data/preview-props.json; a component without an entry gets props inferred from its required TypeScript props.
// A spec may also set "inContext": "Parent" (show the real parent preview, which already contains this part) or
// "scene": an element tree with {"$self":true} where the component goes, so every part is seen working among its neighbours.
// Spec values: plain JSON, {"$el":"Name","props":{},"children":[...]} for an element (a primitive name or an HTML tag), "$fn" for a no-op callback.
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const noop = () => {};
/** An inline picture keeps the page free of references to files that do not exist. */
const PLACEHOLDER_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'><rect width='320' height='200' fill='%23c9c5ba'/></svg>";
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
const human = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

export function createPreviewRenderer(root, entries) {
  const dataFile = `${root}/scripts/data/preview-props.json`;
  const overrides = existsSync(dataFile) ? JSON.parse(readFileSync(dataFile, 'utf8')) : {};
  const owner = new Map();
  for (const { dir, values } of entries) for (const v of values) if (!owner.has(v)) owner.set(v, dir);
  const modules = new Map();
  const load = async (dir) => {
    if (!modules.has(dir)) modules.set(dir, import(pathToFileURL(`${root}/dist/primitives/${dir}/${dir}.js`).href));
    return modules.get(dir);
  };
  const component = async (name) => {
    const dir = owner.get(name);
    if (!dir) return null;
    return (await load(dir))[name] ?? null;
  };

  let selfNode = null;
  async function resolve(value) {
    if (value === '$fn') return noop;
    if (value && typeof value === 'object' && value.$self) return selfNode;
    if (Array.isArray(value)) return Promise.all(value.map(resolve));
    if (value && typeof value === 'object') {
      if ('$el' in value) {
        const type = /^[a-z]/.test(value.$el) ? value.$el : await component(value.$el);
        if (!type) throw new Error(`unknown element ${value.$el}`);
        const children = await resolve(value.children ?? []);
        const props = await resolve(value.props ?? {});
        return createElement(type, { key: props.key, ...props }, ...(Array.isArray(children) ? children : [children]));
      }
      const out = {};
      for (const [k, v] of Object.entries(value)) out[k] = await resolve(v);
      return out;
    }
    return value;
  }

  /** Required props of the component's TypeScript interface, filled with plausible demo values. */
  function inferProps(dir) {
    const src = readFileSync(`${root}/src/primitives/${dir}/${dir}.tsx`, 'utf8');
    const body = src.match(new RegExp(`export interface ${dir}Props[^{]*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';
    const props = {};
    for (const m of body.matchAll(/^ {2}(\w+)(\??):\s*([^;\n]+);/gm)) {
      const [, name, optional, type] = m;
      if (optional || name === 'children') continue;
      props[name] = sample(dir, name, type.trim());
    }
    return props;
  }
  function sample(dir, name, type) {
    if (/=>/.test(type)) return '$fn';
    if (name === 'id') return kebab(dir);
    if (name === 'href') return '#';
    if (name === 'src' && type === 'string') return PLACEHOLDER_IMAGE;
    const literal = type.match(/^'([^']*)'/);
    if (literal) return literal[1];
    if (type === 'number') return 1;
    if (type === 'boolean') return false;
    if (type === 'string' || /^ReactNode/.test(type)) return human(dir);
    return undefined;
  }

  /** Marks the part being documented inside a scene, so the neighbours read as context and the part reads as the subject. */
  const focus = (html, dir) => html.replace(new RegExp(`(<[a-z0-9]+\\b[^>]*\\bclass="[^"]*\\bcieo-(?:p-)?${kebab(dir)}(?=[\\s"])[^"]*")`, 'g'), '$1 data-focus');

  /** Returns {html} or {error}; never throws, so the caller can fall back to the authored fragment. */
  return async function render(dir, seen = new Set(), extra = {}) {
    try {
      const spec = overrides[dir] ?? {};
      if (spec.inContext) {
        if (seen.has(dir)) return { error: `context cycle at ${dir}` };
        seen.add(dir);
        const parent = await render(spec.inContext, seen);
        return parent.html ? { html: focus(parent.html, dir), source: 'context' } : parent;
      }
      const Component = await component(dir);
      if (!Component) return { error: 'no exported component' };
      const props = await resolve({ ...inferProps(dir), ...(spec.props ?? {}), ...extra });
      const children = spec.children === null ? [] : await resolve(spec.children ?? human(dir));
      let node = createElement(Component, props, ...(Array.isArray(children) ? children : [children]));
      if (spec.scene) {
        selfNode = node;
        node = await resolve(spec.scene);
      } else if (spec.wrap) {
        const wrap = await resolve(spec.wrap);
        node = createElement(wrap.type, wrap.props, node);
      }
      const html = spec.scene ? focus(renderToStaticMarkup(node), dir) : renderToStaticMarkup(node);
      return html.trim() ? { html, source: overrides[dir] ? 'data' : 'inferred' } : { error: 'rendered nothing' };
    } catch (e) {
      return { error: String(e.message ?? e).split('\n')[0] };
    }
  };
}
