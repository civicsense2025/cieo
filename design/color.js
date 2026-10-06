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
