/* Text field status machine, after the field recipe: a field settles into neutral, valid or invalid on blur.
   While typing it only ever relaxes (invalid to valid once fixed, valid to neutral once broken), so it never
   scolds mid-word. Pure, unit-tested. */
export function nextFieldStatus(prev, event, r) {
    const ok = r.checks ? 'valid' : 'neutral';
    switch (event) {
        case 'reset':
            return 'neutral';
        case 'invalid':
            return 'invalid';
        case 'blur':
            /* Tabbing through an empty field is not a mistake; a submit attempt marks it through 'invalid', and leaving it
               empty afterwards keeps that mark. */
            if (r.empty)
                return prev === 'invalid' && !r.valid ? 'invalid' : 'neutral';
            return r.valid ? ok : 'invalid';
        case 'input':
            if (prev === 'invalid' && r.valid)
                return ok;
            if (prev === 'valid' && !r.valid)
                return 'neutral';
            return prev;
    }
}
/** The status on screen: a controlled `status` wins, then an `error` from the server or the app, then the machine. */
export function resolveFieldStatus(machine, opts) {
    if (opts.status)
        return opts.status;
    if (opts.error !== undefined && opts.error !== null && opts.error !== false && opts.error !== '')
        return 'invalid';
    return machine;
}
