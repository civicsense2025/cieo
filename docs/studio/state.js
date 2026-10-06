import { createTheme, parseTheme, serializeTheme } from '../../design/index.js';

const key = 'cieo-studio-v1';
export const defaults = Object.freeze({ brand: 'studio', scheme: 'system', density: 'comfortable', radius: 'soft', contrast: 'system', font: 'system', motion: 'system', rtl: false });
export function createState(system, announce) {
  let value = { ...defaults }, overrides = {}, remember = false;
  const build = () => {
    const { motion, rtl, ...themeOptions } = value;
    return createTheme({ ...themeOptions, scheme: value.scheme === 'system' ? system().scheme : value.scheme, contrast: value.contrast === 'system' ? system().contrast : value.contrast, overrides });
  };
  const configuration = () => ({ theme: JSON.parse(serializeTheme(build())), view: { scheme: value.scheme, contrast: value.contrast, motion: value.motion, rtl: value.rtl } });
  const persist = () => {
    if (!remember) return;
    try { localStorage.setItem(key, JSON.stringify(configuration())); }
    catch { remember = false; announce('This browser blocked local storage. The theme still works without saving.'); }
  };
  const replace = (theme, view = {}) => {
    if (!['system', 'standard', 'high', undefined].includes(view.contrast) || !['system', 'light', 'dark', undefined].includes(view.scheme) || !['system', 'reduced', undefined].includes(view.motion) || ![true, false, undefined].includes(view.rtl)) throw new TypeError('Invalid presentation settings.');
    const before = value, oldOverrides = overrides;
    const { overrides: incoming, ...rest } = theme.options;
    value = { ...rest, scheme: view.scheme ?? rest.scheme, contrast: view.contrast ?? rest.contrast, motion: view.motion ?? 'system', rtl: view.rtl ?? false };
    overrides = { ...incoming };
    try { build(); } catch (error) { value = before; overrides = oldOverrides; throw error; }
  };
  const restore = (text) => {
    if (text.length > 40000) throw new RangeError('Saved configuration is too large.');
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new TypeError('Invalid saved configuration.');
    const theme = parseTheme(JSON.stringify(data.theme));
    replace(theme, data.view);
  };
  try {
    const stored = localStorage.getItem(key);
    if (stored) { restore(stored); remember = true; }
  } catch { announce('Local saving is unavailable. The preview still works.'); }
  try {
    if (location.hash.startsWith('#theme=')) restore(decodeURIComponent(location.hash.slice(7)));
  } catch { announce('That shared configuration is invalid. The current theme was kept.'); }
  let lastTheme = build();
  const resolveTheme = () => {
    try { lastTheme = build(); }
    catch {
      value = { ...value, scheme: lastTheme.options.scheme, contrast: lastTheme.options.contrast };
      announce('Kept the last valid appearance because custom overrides conflict with the system preference.');
    }
    return lastTheme;
  };
  return {
    get value() { return { ...value }; }, get remembered() { return remember; },
    theme: resolveTheme,
    update(next) {
      const before = value;
      value = { ...value, ...next };
      try { build(); } catch (error) { value = before; throw error; }
      persist();
    },
    setRemember(next) {
      remember = Boolean(next);
      if (remember) persist();
      else try { localStorage.removeItem(key); } catch { announce('The browser blocked removal of the saved preference.'); }
    },
    import(source) { replace(parseTheme(source)); persist(); },
    reset() { value = { ...defaults }; overrides = {}; persist(); },
    link() { const url = new URL(location.href); url.hash = `theme=${encodeURIComponent(JSON.stringify(configuration()))}`; return url.href; },
  };
}
