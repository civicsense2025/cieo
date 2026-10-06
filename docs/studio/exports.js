import { toCSS, toDTCG, toPortable, serializeTheme, toNative } from '../../design/index.js';

const extensions = { css: 'css', dtcg: 'tokens.json', json: 'json', config: 'theme.json', swift: 'swift', rust: 'rs', kotlin: 'kt', dart: 'dart', python: 'py', c: 'h' };
export function exportContent(theme, format) {
  if (!Object.hasOwn(extensions, format)) throw new TypeError('Unknown export format.');
  if (format === 'css') return toCSS(theme);
  if (format === 'dtcg') return JSON.stringify(toDTCG(theme), null, 2) + '\n';
  if (format === 'json') return JSON.stringify(toPortable(theme), null, 2) + '\n';
  if (format === 'config') return serializeTheme(theme);
  return toNative(theme, format);
}
export function download(theme, format) {
  const content = exportContent(theme, format);
  const url = URL.createObjectURL(new Blob([content], { type: format === 'css' ? 'text/css;charset=utf-8' : format.includes('json') || ['config', 'dtcg'].includes(format) ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = `cieo-${theme.options.brand}-${theme.options.scheme}.${extensions[format]}`;
  document.body.append(link); link.click(); link.remove();
  // Give the browser time to start the download before releasing its object URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function copyText(content, announce) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable.');
    await navigator.clipboard.writeText(content);
    announce('Copied to the clipboard.');
  } catch {
    const dialog = document.getElementById('export-dialog');
    const field = document.getElementById('export-text');
    field.value = content; dialog.showModal(); field.focus(); field.select();
    announce('Clipboard access is blocked. Copy from the text window instead.');
  }
}
