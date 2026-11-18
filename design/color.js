/** Opaque sRGB utilities. Alpha is deliberately rejected for contrast calculations. */
export function hex(value) {
  if (typeof value !== 'string' || !/^#[\da-f]{6}$/i.test(value)) {
    throw new TypeError('Expected an opaque six-digit hex color.');
  }
  return value.toLowerCase();
}
export function channels(value) {
  const color = hex(value);
  return [1, 3, 5].map((start) => parseInt(color.slice(start, start + 2), 16) / 255);
}
export function luminance(value) {
  const [r, g, b] = channels(value).map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrastRatio(first, second) {
  const a = luminance(first), b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
export function mix(first, second, amount) {
  if (!Number.isFinite(amount) || amount < 0 || amount > 1) throw new RangeError('Mix must be between zero and one.');
  const a = channels(first), b = channels(second);
  return '#' + a.map((v, i) => Math.round((v + (b[i] - v) * amount) * 255).toString(16).padStart(2, '0')).join('');
}
export function foreground(background) {
  return contrastRatio('#ffffff', background) >= contrastRatio('#000000', background) ? '#ffffff' : '#000000';
}
/** Move a seed toward black/white only as far as its semantic role requires. */
export function readable(seed, background, minimum = 4.5) {
  hex(seed); hex(background);
  if (!Number.isFinite(minimum) || minimum < 1 || minimum > 21) throw new RangeError('Invalid contrast target.');
  if (contrastRatio(seed, background) >= minimum) return hex(seed);
  const target = foreground(background);
  if (contrastRatio(target, background) < minimum) throw new RangeError('Contrast target is unattainable.');
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    if (contrastRatio(mix(seed, target, mid), background) >= minimum) hi = mid;
    else lo = mid;
  }
  return mix(seed, target, hi);
}

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * (c ** (1 / 2.4)) - 0.055);

function oklchToLinearSrgb(l, c, h) {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad), b = c * Math.sin(rad);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
  const l3 = l_ ** 3, m3 = m_ ** 3, s3 = s_ ** 3;
  return [
    +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3,
  ];
}

const inGamut = (rgb) => rgb.every((v) => v >= -1e-6 && v <= 1 + 1e-6);

/** Convert a 6-digit sRGB hex string to perceptual OKLCH { l, c, h }. */
export function hexToOklch(value) {
  const [r, g, b] = channels(value).map(srgbToLinear);
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const l = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const okA = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const okB = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const c = Math.hypot(okA, okB);
  const h = c < 1e-6 ? 0 : ((Math.atan2(okB, okA) * 180) / Math.PI + 360) % 360;
  return { l: Math.min(1, Math.max(0, l)), c, h };
}

/** Convert OKLCH (l in 0..1, c >= 0, h in degrees) to gamut-mapped 6-digit sRGB hex. */
export function oklchToHex(l, c, h = 0) {
  if (!Number.isFinite(l) || !Number.isFinite(c) || !Number.isFinite(h) || l < 0 || l > 1 || c < 0) {
    throw new RangeError('Invalid OKLCH coordinates.');
  }
  if (l <= 0) return '#000000';
  if (l >= 1) return '#ffffff';
  let rgb = oklchToLinearSrgb(l, c, h);
  if (!inGamut(rgb)) {
    let lo = 0, hi = c;
    for (let i = 0; i < 20; i += 1) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinearSrgb(l, mid, h))) lo = mid;
      else hi = mid;
    }
    rgb = oklchToLinearSrgb(l, lo, h);
  }
  return '#' + rgb.map((v) => Math.round(linearToSrgb(Math.min(1, Math.max(0, v))) * 255).toString(16).padStart(2, '0')).join('');
}

const RAMP_STOPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 100];

/** Build a 13-stop perceptual OKLCH tonal ramp (0 = black, 100 = white) preserving seed hue. */
export function tonalRamp(seed) {
  const { c, h } = hexToOklch(seed);
  const ramp = {};
  for (const stop of RAMP_STOPS) {
    if (stop === 0) ramp[stop] = '#000000';
    else if (stop === 100) ramp[stop] = '#ffffff';
    else {
      const l = stop / 100;
      const taper = stop > 85 ? (100 - stop) / 15 : stop < 15 ? stop / 15 : 1;
      ramp[stop] = oklchToHex(l, c * (0.35 + 0.65 * taper), h);
    }
  }
  return ramp;
}
