import { brands, applyTheme, watchSystemPreferences } from '../../design/index.js';
import { createState } from './state.js';
import { renderTokens } from './tokens.js';
import { copyText, download, exportContent } from './exports.js';
import { wireSpecimen } from './interactions.js';

const $ = (id) => document.getElementById(id);
const announce = (message) => { $('status').textContent = message; };
let system = { scheme: 'light', reduced: false, contrast: 'standard' }, refresh = () => {};
const stopPreferences = watchSystemPreferences((next) => { system = next; refresh(); });
const narrow = matchMedia('(max-width: 800px)');
const setPanel = (open) => { $('inspector-panels').hidden = !open; $('customize-toggle').setAttribute('aria-expanded', String(open)); };
setPanel(!narrow.matches);
const resized = () => setPanel(!narrow.matches);
narrow.addEventListener('change', resized);
$('customize-toggle').addEventListener('click', () => setPanel($('inspector-panels').hidden));
const state = createState(() => system, announce);
const controller = applyTheme(document.documentElement, state.theme());
const specimen = wireSpecimen(() => system.reduced || state.value.motion === 'reduced', announce);

for (const [name, brand] of Object.entries(brands)) {
  const label = document.createElement('label'); label.className = 'brand-choice'; label.title = brand.label;
  const input = document.createElement('input'); input.type = 'radio'; input.name = 'brand'; input.value = name; input.setAttribute('aria-label', brand.label);
  const swatch = document.createElement('span'); swatch.style.setProperty('--swatch', brand.light); swatch.setAttribute('aria-hidden', 'true');
  label.append(input, swatch); $('brand-choices').append(label);
}
refresh = () => {
  const theme = state.theme(), value = state.value;
  controller.update(theme);
  document.documentElement.dataset.motion = value.motion === 'reduced' || system.reduced ? 'reduced' : 'system';
  $('preview').dir = value.rtl ? 'rtl' : 'ltr';
  for (const key of ['scheme', 'density', 'radius', 'contrast', 'font', 'motion']) $(key).value = value[key];
  $('accent').value = value.accent ?? '';
  $('remember').checked = state.remembered; $('rtl').checked = value.rtl;
  document.querySelectorAll('[name="brand"]').forEach((radio) => { radio.checked = radio.value === value.brand; });
  renderTokens(theme, $('token-search').value);
  if (system.reduced || value.motion === 'reduced') specimen.stop();
};
const change = (next) => {
  try { state.update(next); refresh(); announce('The preview and exports now use the updated design.'); }
  catch (error) { announce(error.message); refresh(); }
};
$('theme-controls').addEventListener('submit', (event) => event.preventDefault());
$('theme-controls').addEventListener('change', (event) => {
  const target = event.target;
  if (target.name === 'brand') { change({ brand: target.value, accent: undefined }); return; }
  if (target.id === 'remember') { state.setRemember(target.checked); refresh(); return; }
  if (target.id === 'rtl') { change({ rtl: target.checked }); return; }
  if (['scheme', 'density', 'radius', 'contrast', 'font', 'motion'].includes(target.id)) change({ [target.id]: target.value });
});
const applyAccent = () => {
  if (!$('accent').reportValidity()) return;
  change({ accent: $('accent').value || undefined });
};
$('apply-accent').addEventListener('click', applyAccent);
$('accent').addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); applyAccent(); } });
$('reset').addEventListener('click', () => { state.reset(); refresh(); announce('The default design has been restored.'); });
$('token-search').addEventListener('input', () => renderTokens(state.theme(), $('token-search').value));
$('download').addEventListener('click', () => { download(state.theme(), $('format').value); announce('The export is ready in the browser’s downloads.'); });
$('copy').addEventListener('click', () => copyText(exportContent(state.theme(), $('format').value), announce));
$('share').addEventListener('click', () => copyText(state.link(), announce));
$('import-theme').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > 32768) throw new RangeError('The configuration must be under 32 KiB.');
    state.import(await file.text()); refresh(); announce('The imported configuration is now active.');
  } catch (error) { announce(`Import rejected: ${error.message}`); }
  finally { event.target.value = ''; }
});
window.addEventListener('pagehide', (event) => {
  specimen.stop();
  if (!event.persisted) { stopPreferences(); narrow.removeEventListener('change', resized); controller.destroy(); }
});
refresh();
