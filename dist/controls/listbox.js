/* Keyboard model for a select-only combobox (WAI-ARIA APG pattern). Pure: no DOM and no React, so it is unit-tested
   on its own. Focus stays on the combobox; the active option is announced through aria-activedescendant. */
const PAGE = 10;
const enabled = (items, i) => i >= 0 && i < items.length && !items[i].disabled;
export function firstEnabled(items) {
    return items.findIndex((it) => !it.disabled);
}
export function lastEnabled(items) {
    for (let i = items.length - 1; i >= 0; i -= 1)
        if (!items[i].disabled)
            return i;
    return -1;
}
/** Moves `by` enabled steps from `from` without wrapping; stays put at either end. */
export function step(items, from, by) {
    const dir = by < 0 ? -1 : 1;
    let at = enabled(items, from) ? from : dir > 0 ? -1 : items.length;
    let left = Math.abs(by);
    let i = at;
    while (left > 0) {
        i += dir;
        if (i < 0 || i >= items.length)
            break;
        if (!items[i].disabled) {
            at = i;
            left -= 1;
        }
    }
    return enabled(items, at) ? at : dir > 0 ? lastEnabled(items) : firstEnabled(items);
}
/** Type-ahead: characters typed within `timeout` ms build one search string. Repeating one character cycles through
    the options that start with it. */
export class Typeahead {
    constructor(timeout = 500) {
        this.timeout = timeout;
        this.buffer = '';
        this.last = -Infinity;
    }
    get pending() {
        return this.buffer.length > 0;
    }
    /** Returns the matching index or -1. `t` is in milliseconds. */
    find(char, items, from, t) {
        if (!items.length || !char)
            return -1;
        if (t - this.last > this.timeout)
            this.buffer = '';
        this.last = t;
        if (this.buffer.length < Typeahead.maxBuffer)
            this.buffer += char.toLowerCase();
        /* Same-character repeat (cycling) without allocating [...buffer]: early-out on first mismatch. */
        let same = true;
        for (let i = 1; i < this.buffer.length; i += 1) {
            if (this.buffer[i] !== this.buffer[0]) {
                same = false;
                break;
            }
        }
        const query = same ? this.buffer[0] : this.buffer;
        /* A fresh or repeated single character starts after the active option; a longer string may match the active one. */
        const start = query.length === 1 ? from + 1 : Math.max(from, 0);
        const n = items.length;
        /* Lazily lowercase each visited enabled label and stop at the first match: an immediate match reads O(1)
           labels instead of lowercasing all N up front, and disabled labels are never touched. */
        for (let k = 0; k < n; k += 1) {
            const i = (((start + k) % n) + n) % n;
            if (items[i].disabled)
                continue;
            if (items[i].label.toLowerCase().startsWith(query))
                return i;
        }
        return -1;
    }
    reset() {
        this.buffer = '';
        this.last = -Infinity;
    }
}
/** Caps retained keystrokes; the buffer keeps the *prefix* and freezes past the cap, so a long query keeps
    prefix semantics instead of a sliding window silently turning it into a suffix search. */
Typeahead.maxBuffer = 256;
const printable = (e) => e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
/** One key press against the current state. `t` (ms) feeds the type-ahead clock. */
export function listboxKey(state, e, items, ta, t) {
    const s = { ...state };
    const start = enabled(items, s.selected) ? s.selected : firstEnabled(items);
    if (!items.length)
        return { state: s, handled: false };
    if (!s.open) {
        switch (e.key) {
            case 'ArrowDown':
            case 'Enter':
            case ' ':
                return { state: { ...s, open: true, active: start }, handled: true };
            case 'ArrowUp':
                return { state: { ...s, open: true, active: e.altKey ? start : firstEnabled(items) }, handled: true };
            case 'Home':
                return { state: { ...s, open: true, active: firstEnabled(items) }, handled: true };
            case 'End':
                return { state: { ...s, open: true, active: lastEnabled(items) }, handled: true };
        }
        if (printable(e)) {
            const hit = ta.find(e.key, items, start, t);
            return { state: { ...s, open: true, active: hit >= 0 ? hit : start }, handled: true };
        }
        return { state: s, handled: false };
    }
    const close = (commit, handled = true) => ({
        state: { open: false, active: commit ?? s.active, selected: commit ?? s.selected },
        handled,
        commit,
    });
    const valid = enabled(items, s.active) ? s.active : undefined;
    switch (e.key) {
        case 'ArrowDown':
            return { state: { ...s, active: step(items, s.active, 1) }, handled: true };
        case 'ArrowUp':
            if (e.altKey)
                return close(valid);
            return { state: { ...s, active: step(items, s.active, -1) }, handled: true };
        case 'PageDown':
            return { state: { ...s, active: step(items, s.active, PAGE) }, handled: true };
        case 'PageUp':
            return { state: { ...s, active: step(items, s.active, -PAGE) }, handled: true };
        case 'Home':
            return { state: { ...s, active: firstEnabled(items) }, handled: true };
        case 'End':
            return { state: { ...s, active: lastEnabled(items) }, handled: true };
        case 'Escape':
            return { state: { ...s, open: false, active: s.selected }, handled: true };
        case 'Enter':
            return close(valid);
        case 'Tab':
            return close(valid, false);
        case ' ':
            /* Space inside a type-ahead string is part of the search ("New York"). */
            if (!ta.pending)
                return close(valid);
    }
    if (printable(e)) {
        const hit = ta.find(e.key, items, s.active, t);
        return { state: { ...s, active: hit >= 0 ? hit : s.active }, handled: true };
    }
    return { state: s, handled: false };
}
