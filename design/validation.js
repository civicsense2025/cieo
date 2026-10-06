import { hex } from './color.js';
import { brands, densities, radii, fonts } from './presets.js';

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
export function options(input = {}) {
  keys(input, ['brand', 'scheme', 'density', 'radius', 'contrast', 'font', 'accent', 'overrides'], 'theme option');
  const get = (key, fallback) => input[key] === undefined ? fallback : input[key];
  return {
    brand: choice(get('brand', 'studio'), Object.keys(brands), 'brand'),
    scheme: choice(get('scheme', 'light'), ['light', 'dark'], 'scheme'),
    density: choice(get('density', 'comfortable'), Object.keys(densities), 'density'),
    radius: choice(get('radius', 'soft'), Object.keys(radii), 'radius'),
    contrast: choice(get('contrast', 'standard'), ['standard', 'high'], 'contrast'),
    font: choice(get('font', 'system'), Object.keys(fonts), 'font'),
    ...(input.accent === undefined ? {} : { accent: hex(input.accent) }),
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
