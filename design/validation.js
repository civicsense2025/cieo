import { hex } from './color.js';
import { brands, densities, radii, fonts, grounds, elevations } from './presets.js';

export function record(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    throw new TypeError(`${name} must be a plain object.`);
  }
  return value;
}
export function keys(value, allowed, name) {
  record(value, name);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new TypeError(`Unknown ${name}: ${key}`);
}
export function choice(value, values, name) {
  if (!values.includes(value)) throw new TypeError(`Invalid ${name}: ${String(value)}`);
  return value;
}
const TOKEN_PART = /^[a-z][a-z0-9-]{0,31}$/;
const SAFE_COMPONENT_VALUE = /^(?:#[\da-fA-F]{6}|(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|ms|s|%)?|0)$/;

export function validComponentOverrides(raw) {
  const source = record(raw, 'components');
  const out = {};
  for (const [comp, props] of Object.entries(source).sort(([a], [b]) => a.localeCompare(b, 'en'))) {
    if (!TOKEN_PART.test(comp)) throw new TypeError(`Invalid component token namespace: ${comp}`);
    const entries = record(props, `components.${comp}`);
    const clean = {};
    for (const [prop, val] of Object.entries(entries).sort(([a], [b]) => a.localeCompare(b, 'en'))) {
      if (!TOKEN_PART.test(prop)) throw new TypeError(`Invalid component token property: ${comp}.${prop}`);
      const str = typeof val === 'number' && Number.isFinite(val) ? String(val) : val;
      if (typeof str !== 'string' || !SAFE_COMPONENT_VALUE.test(str)) {
        throw new TypeError(`Unsafe component token value for ${comp}.${prop}`);
      }
      clean[prop] = str;
    }
    out[comp] = clean;
  }
  return out;
}

export function options(input = {}) {
  keys(input, ['brand', 'scheme', 'density', 'radius', 'contrast', 'font', 'ground', 'elevation', 'accent', 'zeta', 'components', 'overrides'], 'theme option');
  const get = (key, fallback) => input[key] === undefined ? fallback : input[key];
  const zeta = get('zeta', 1);
  if (typeof zeta !== 'number' || !Number.isFinite(zeta)) throw new TypeError('zeta must be a finite number.');
  if (zeta < 0.7 || zeta > 1) throw new RangeError('zeta must be between 0.7 and 1.0.');
  return {
    brand: choice(get('brand', 'studio'), Object.keys(brands), 'brand'),
    scheme: choice(get('scheme', 'light'), ['light', 'dark'], 'scheme'),
    density: choice(get('density', 'comfortable'), Object.keys(densities), 'density'),
    radius: choice(get('radius', 'soft'), Object.keys(radii), 'radius'),
    contrast: choice(get('contrast', 'standard'), ['standard', 'high'], 'contrast'),
    font: choice(get('font', 'system'), Object.keys(fonts), 'font'),
    ground: choice(get('ground', 'cool'), Object.keys(grounds), 'ground'),
    elevation: choice(get('elevation', 'soft'), Object.keys(elevations), 'elevation'),
    zeta,
    ...(input.accent === undefined ? {} : { accent: hex(input.accent) }),
    components: validComponentOverrides(get('components', {})),
    overrides: Object.fromEntries(Object.entries(record(get('overrides', {}), 'overrides')).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])),
  };
}
export function validTokenValue(type, value) {
  if (type === 'color') return hex(value);
  if (type === 'dimension') {
    if (typeof value !== 'string' || !/^(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem)$/.test(value) || parseFloat(value) > 10000) {
      throw new TypeError('Dimensions must be nonnegative px/rem values up to 10000.');
    }
    return value;
  }
  if (type === 'duration') {
    if (typeof value !== 'string' || !/^(?:\d+(?:\.\d+)?|\.\d+)(?:ms|s)$/.test(value) || parseFloat(value) > 10000) {
      throw new TypeError('Durations must be nonnegative ms/s values up to 10000.');
    }
    return value;
  }
  if (type === 'fontFamily') {
    if (!Array.isArray(value) || !value.length || value.length > 12 || value.some((v) => typeof v !== 'string' || !/^[\w -]{1,80}$/.test(v))) {
      throw new TypeError('Font families must be a list of local family names.');
    }
    return [...value];
  }
  if (!Number.isFinite(value) || value < 0 || value > 10000) throw new TypeError('Expected a finite nonnegative number up to 10000.');
  if (type === 'fontWeight' && (value < 1 || value > 1000)) throw new RangeError('Font weight must be 1–1000.');
  return value;
}
export function selector(value = ':root') {
  if (typeof value !== 'string' || !/^(?::root|[.#][A-Za-z_][\w-]*|\[data-cieo-theme="[a-z][\w-]*"\])$/.test(value)) {
    throw new TypeError('Use :root, a single class/ID, or a data-cieo-theme selector.');
  }
  return value;
}
export function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
