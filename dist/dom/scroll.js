/* Scroll helpers. Neither intercepts or drives the user's scrolling: reveal only watches what scrolls into view,
   and scrollTo runs only when the user asked for it and stops the moment they scroll, touch, click or press a key. */
import { S, Track, allowed, config, run } from '../core/spring.js';
import { enter, gapFor, hold, list } from './index.js';
const noop = () => { };
/* Kept a Map (not a WeakMap, which cannot be iterated): revealNow must visit every waiting
   element. Entries are deleted eagerly in show()/stop()/observer-prune, reveal() prunes
   orphans below, and the size is bounded by the caller's els.length per active reveal(). */
const pending = new Map();
/* One active scroll per scroller; WeakMap so a dropped element never pins its cancel closure. */
const scrolls = new WeakMap();
function prunePending() {
    for (const [el] of pending)
        if (!el.isConnected)
            pending.delete(el);
}
/** Elements inside root that still wait to reveal take their final state at once. Call before a user-requested scrollTo. */
export function revealNow(root) {
    if (!root)
        return;
    [...pending].forEach(([el, show]) => {
        if (!el.isConnected)
            pending.delete(el);
        else if (root === el || root.contains(el))
            show(el);
    });
}
/** Elements wait in their start state and enter once, the first time they scroll into view (staggered, total ≤ 300 ms). */
export function reveal(targets, opts = {}) {
    const kind = opts.kind || 'entrance';
    const els = list(targets);
    if (!els.length || !allowed(kind) || typeof IntersectionObserver === 'undefined')
        return noop;
    prunePending(); /* collect orphans left by a dropped Cancel whose element detached unseen */
    const from = { x: 0, y: 8, scale: 1, opacity: 0, blur: 0, ...opts.from };
    const waiting = new Map();
    let observer;
    const check = () => {
        if (!allowed(kind))
            stop();
    };
    function stop() {
        observer?.disconnect();
        document.removeEventListener('motion:change', check);
        waiting.forEach((release, el) => {
            release();
            if (pending.get(el) === show)
                pending.delete(el);
        });
        waiting.clear();
    }
    const show = (el) => {
        observer.unobserve(el);
        waiting.get(el)?.();
        waiting.delete(el);
        if (pending.get(el) === show)
            pending.delete(el);
        if (!waiting.size)
            stop();
    };
    observer = new IntersectionObserver((entries) => {
        for (const el of [...waiting.keys()]) {
            if (el.isConnected)
                continue;
            observer.unobserve(el);
            waiting.delete(el);
            if (pending.get(el) === show)
                pending.delete(el);
        }
        const arrived = entries.filter((e) => e.isIntersecting && waiting.has(e.target)).map((e) => e.target);
        arrived.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        const gap = gapFor(arrived.length, opts.stagger ?? 0.04);
        arrived.forEach((el, i) => {
            observer.unobserve(el);
            waiting.get(el)();
            waiting.delete(el);
            if (pending.get(el) === show)
                pending.delete(el);
            enter(el, { kind, from, cfg: opts.cfg, delay: i * gap });
        });
        if (!waiting.size)
            stop();
    }, { rootMargin: opts.rootMargin || '0px 0px -8% 0px', threshold: opts.threshold ?? 0.1 });
    els.forEach((el) => {
        waiting.set(el, hold(el, false));
        const s = el.style;
        s.opacity = String(from.opacity);
        s.transform = `translate(${from.x}px, ${from.y}px) scale(${from.scale})`;
        pending.set(el, show);
        observer.observe(el);
    });
    document.addEventListener('motion:change', check);
    return stop;
}
const INPUTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
/** A user-requested scroll of the page (pass window) or an element, on the soft spring. Any user input stops it in place. */
export function scrollTo(scroller, x, y, opts = {}) {
    const kind = opts.kind || 'feedback';
    const page = !scroller || scroller === window || scroller === document.documentElement || scroller === document.scrollingElement;
    const node = (page ? document.scrollingElement : scroller);
    const target = (page ? window : scroller);
    const X = x ?? node.scrollLeft;
    const Y = y ?? node.scrollTop;
    const go = (left, top) => target.scrollTo({ left, top, behavior: 'instant' });
    if (!allowed(kind)) {
        go(X, Y);
        opts.done?.();
        return noop;
    }
    const cfg = config(kind, opts.cfg || S.soft);
    const tx = new Track(node.scrollLeft).set(X, cfg);
    const ty = new Track(node.scrollTop).set(Y, cfg);
    scrolls.get(node)?.();
    const snap = node.style.scrollSnapType;
    let stopped = false;
    let cancel = noop;
    const interrupt = () => {
        stopped = true;
        detach();
        cancel();
    };
    /* removeEventListener matches on capture only, so { capture: true } pairs with attach's
       { capture: true, passive: true }. Detach runs on both paths: interrupt detaches at once
       and finish() detaches again (harmless) when the loop settles on its own. */
    const detach = () => {
        INPUTS.forEach((type) => removeEventListener(type, interrupt, { capture: true }));
    };
    const cancelThis = () => {
        stopped = true;
        cancel();
    };
    scrolls.set(node, cancelThis);
    node.style.scrollSnapType = 'none';
    INPUTS.forEach((type) => addEventListener(type, interrupt, { capture: true, passive: true }));
    cancel = run({
        kind,
        step(t) {
            go(tx.at(t), ty.at(t));
            return tx.prune(t) + ty.prune(t) > 0;
        },
        finish() {
            detach();
            if (!stopped)
                go(X, Y);
            if (scrolls.get(node) === cancelThis)
                scrolls.delete(node);
            node.style.scrollSnapType = snap;
            if (!node.getAttribute('style'))
                node.removeAttribute('style');
            opts.done?.();
        },
    });
    return cancelThis;
}
