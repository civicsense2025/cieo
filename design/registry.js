// Export boundaries accept validated themes, not arbitrary caller-supplied CSS records.
const themes = new WeakSet();
export function markTheme(theme) { themes.add(theme); return theme; }
export function assertTheme(theme) {
  if (!themes.has(theme)) throw new TypeError('Use createTheme() or parseTheme() before exporting a theme.');
}
