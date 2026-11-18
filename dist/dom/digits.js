/* Rolling number: changed characters leave in EXIT, then new ones spring in from the direction of change. Ends as plain text. */
import { EXIT, S, allowed, clamp, config, now, prog } from '../core/spring.js';
import { animate, noop, owners, paint } from './paint.js';
export function digits(el, value, opts = {}) {
    const kind = opts.kind || 'feedback';
    const next = String(value);
    owners.get(el)?.();
    const prev = el.textContent ?? '';
    if (prev === next) {
        opts.done?.();
        return noop;
    }
    if (!allowed(kind, el)) {
        el.textContent = next;
        opts.done?.();
        return noop;
    }
    const dir = opts.dir ?? (parseFloat(next) < parseFloat(prev) ? -1 : 1);
    const amp = (opts.y ?? 8) * dir;
    const width = Math.max(prev.length, next.length);
    const a = prev.padStart(width);
    const b = next.padStart(width);
    const slots = [];
    el.textContent = '';
    for (let i = 0; i < width; i += 1) {
        if (a[i] === b[i]) {
            if (b[i] !== ' ')
                el.append(b[i]);
            continue;
        }
        const slot = document.createElement('span');
        const fresh = document.createElement('span');
        const old = document.createElement('span');
        slot.style.cssText = 'display:inline-block;position:relative';
        fresh.style.display = 'inline-block';
        fresh.textContent = b[i] === ' ' ? '' : b[i];
        old.style.cssText = 'display:inline-block;position:absolute;left:0;top:0';
        old.textContent = a[i];
        old.setAttribute('aria-hidden', 'true');
        slot.append(fresh, old);
        el.append(slot);
        slots.push({ fresh, old });
    }
    const t0 = now();
    const cfg = config(kind, opts.cfg || S.base);
    let oldDone = false;
    return animate([el], {
        kind,
        step(t) {
            const after = t >= t0 + EXIT;
            const e = after ? 1 : clamp((t - t0) / EXIT) ** 2;
            const p = clamp(prog(t, t0 + EXIT, cfg));
            const fq = (1 - p) * amp;
            if (!after) {
                const eo = -e * amp;
                const oo = 1 - e;
                for (const s of slots)
                    paint(s.old, oo, eo);
            }
            else if (!oldDone) {
                oldDone = true;
                for (const s of slots)
                    paint(s.old, 0, -amp);
            }
            for (const s of slots)
                paint(s.fresh, p, fq);
            return t < t0 + EXIT || 1 - p > 1e-3;
        },
        finish() {
            el.textContent = next;
            opts.done?.();
        },
    });
}
