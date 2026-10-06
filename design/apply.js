import { variables } from './css.js';

const owners = new WeakMap();
/** Scope themes to any element. No storage, DOM work, or event listeners occur on import. */
export function applyTheme(element, initial) {
  if (!element?.style || typeof element.setAttribute !== 'function') throw new TypeError('Expected a styled element.');
  if (owners.has(element)) throw new Error('This element already has a theme controller. Destroy it before replacing it.');
  let disposed = false, current = initial;
  const previous = new Map(), last = new Map();
  const oldAttribute = element.getAttribute('data-cieo-theme');
  let ownedAttribute;
  const write = (name, value) => {
    if (!previous.has(name)) previous.set(name, [element.style.getPropertyValue(name), element.style.getPropertyPriority(name)]);
    if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
    last.set(name, value);
  };
  const update = (theme) => {
    if (disposed) throw new Error('Theme controller is disposed.');
    const next = variables(theme);
    for (const [name, value] of Object.entries(next)) write(name, value);
    write('color-scheme', theme.options.scheme);
    ownedAttribute = `${theme.options.brand}-${theme.options.scheme}`;
    element.setAttribute('data-cieo-theme', ownedAttribute);
    current = theme;
  };
  const destroy = () => {
    if (disposed) return;
    disposed = true;
    // Restore only properties still owned by us; do not erase subsequent application edits.
    for (const [name, value] of last) {
      if (element.style.getPropertyValue(name) !== value || element.style.getPropertyPriority(name) !== '') continue;
      const [before, priority] = previous.get(name);
      if (before) element.style.setProperty(name, before, priority);
      else element.style.removeProperty(name);
    }
    if (element.getAttribute('data-cieo-theme') === ownedAttribute) {
      if (oldAttribute === null) element.removeAttribute('data-cieo-theme');
      else element.setAttribute('data-cieo-theme', oldAttribute);
    }
    owners.delete(element);
  };
  update(initial);
  const controller = { update, destroy, get theme() { return current; } };
  owners.set(element, controller);
  return controller;
}
