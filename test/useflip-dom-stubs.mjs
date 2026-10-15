// jsdom-free DOM stubs modeling browser geometry faithfully for FLIP:
// getBoundingClientRect() returns LAYOUT position + live inline residual
// (transforms affect bounding boxes), exactly like a real browser.
export const phaseLog = [];
export let phase = 'effect';
export function setPhase(p) { phase = p; }

if (typeof globalThis.DOMRect === 'undefined') {
  globalThis.DOMRect = class DOMRect {
    constructor(x = 0, y = 0, w = 0, h = 0) {
      this.x = x; this.y = y; this.width = w; this.height = h;
      this.left = x; this.top = y; this.right = x + w; this.bottom = y + h;
    }
  };
}

const TRANSLATE = /translate\(\s*(-?\d+(?:\.\d+)?)px\s*,\s*(-?\d+(?:\.\d+)?)px\s*\)/;
const TRANSLATE_X = /translateX\(\s*(-?\d+(?:\.\d+)?)px\s*\)/;
const MATRIX = /matrix\(\s*[^,]+,[^,]+,[^,]+,[^,]+,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/;

export function parseOffset(t) {
  if (!t) return { x: 0, y: 0 };
  let m = TRANSLATE.exec(t);
  if (m) return { x: +m[1], y: +m[2] };
  m = TRANSLATE_X.exec(t);
  if (m) return { x: +m[1], y: 0 };
  m = MATRIX.exec(t);
  if (m) return { x: +m[1], y: +m[2] };
  return { x: 0, y: 0 };
}

const CAMEL = { transform: 'transform', 'transform-origin': 'transformOrigin', opacity: 'opacity', filter: 'filter', 'clip-path': 'clipPath', visibility: 'visibility', 'will-change': 'willChange' };

function makeStyle() {
  const bag = new Map();
  const s = {
    getPropertyValue: (p) => bag.get(p) ?? '',
    setProperty: (p, v) => { bag.set(p, String(v)); },
    removeProperty: (p) => { bag.delete(p); },
    getPropertyPriority: () => '',
  };
  for (const [prop, camel] of Object.entries(CAMEL)) {
    Object.defineProperty(s, camel, {
      get: () => bag.get(prop) ?? '',
      set: (v) => { bag.set(prop, String(v)); },
      enumerable: true, configurable: true,
    });
  }
  return s;
}

export function makeKid(name, left, { top = 0, w = 100, h = 40 } = {}) {
  const el = {
    name,
    layout: { left, top },
    w, h,
    style: makeStyle(),
    hasAttribute: () => false,
    getAttribute: () => null,
    removeAttribute: () => {},
    getBoundingClientRect() {
      phaseLog.push(phase);
      const o = parseOffset(el.style.transform);
      return new DOMRect(el.layout.left + o.x, el.layout.top + o.y, el.w, el.h);
    },
  };
  return el;
}

export function makeContainer(kids) {
  return {
    children: kids,
    // Generous viewport rect so onscreen()/inView() gates pass.
    getBoundingClientRect: () => new DOMRect(-2000, -2000, 8000, 8000),
  };
}

// Implied flip `before` origin for a kid: flip paints dx = before - after and
// measures `after` on the clean layout, so origin = layout + painted dx.
export function impliedOrigin(kid) {
  const o = parseOffset(kid.style.transform);
  return { x: kid.layout.left + o.x, y: kid.layout.top + o.y, dx: o.x, dy: o.y };
}
