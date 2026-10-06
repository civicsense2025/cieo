/** Observe system preferences without storage or import-time side effects. */
export function watchSystemPreferences(listener, host = globalThis) {
  if (typeof listener !== 'function') throw new TypeError('A preference listener is required.');
  const media = (query) => typeof host.matchMedia === 'function' ? host.matchMedia(query) : null;
  const dark = media('(prefers-color-scheme: dark)');
  const reduced = media('(prefers-reduced-motion: reduce)');
  const contrast = media('(prefers-contrast: more)');
  let disposed = false;
  const notify = () => {
    if (!disposed) listener(Object.freeze({ scheme: dark?.matches ? 'dark' : 'light', reduced: reduced?.matches === true, contrast: contrast?.matches ? 'high' : 'standard' }));
  };
  const queries = [dark, reduced, contrast].filter(Boolean);
  // Notify before subscribing so a throwing initial callback cannot leak listeners.
  notify();
  for (const query of queries) {
    if (typeof query.addEventListener === 'function') query.addEventListener('change', notify);
    else query.addListener?.(notify);
  }
  return () => {
    if (disposed) return;
    disposed = true;
    for (const query of queries) {
      if (typeof query.removeEventListener === 'function') query.removeEventListener('change', notify);
      else query.removeListener?.(notify);
    }
  };
}
