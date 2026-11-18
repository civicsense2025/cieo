import { brands, applyTheme, watchSystemPreferences } from '../../design/index.js';
import { createState } from './state.js';
import { copyText, download, exportContent } from './exports.js';

const $ = (id) => document.getElementById(id);
const announce = (message) => { $('status').textContent = message; };
const AXES = ['ground', 'scheme', 'contrast', 'density', 'radius', 'elevation', 'font'];
let system = { scheme: 'light', reduced: false, contrast: 'standard' }, refresh = () => {};
const stopPreferences = watchSystemPreferences((next) => { system = next; refresh(); });
const state = createState(() => system, announce);
// The theme is applied to the preview board only, so the site header and footer keep the site's own look.
const controller = applyTheme($('board'), state.theme());
let format = 'css';

for (const [name, brand] of Object.entries(brands)) {
  const label = document.createElement('label'); label.className = 'brand-choice'; label.title = brand.label;
  const input = document.createElement('input'); input.type = 'radio'; input.name = 'brand'; input.value = name; input.setAttribute('aria-label', brand.label);
  const swatch = document.createElement('span'); swatch.style.setProperty('--swatch', brand.light); swatch.setAttribute('aria-hidden', 'true');
  label.append(input, swatch); $('brand-choices').append(label);
}
const renderExport = (theme) => { $('export-text-view').textContent = exportContent(theme, format); };
refresh = () => {
  const theme = state.theme(), value = state.value;
  controller.update(theme);
  for (const key of AXES) $(key).value = value[key];
  $('accent').value = value.accent ?? '';
  $('remember').checked = state.remembered;
  document.querySelectorAll('[name="brand"]').forEach((radio) => { radio.checked = radio.value === value.brand; });
  renderExport(theme);
};
const change = (next) => {
  try { state.update(next); refresh(); }
  catch (error) { announce(error.message); refresh(); }
};
$('theme-controls').addEventListener('submit', (event) => event.preventDefault());
$('theme-controls').addEventListener('change', (event) => {
  const target = event.target;
  if (target.name === 'brand') { change({ brand: target.value, accent: undefined }); return; }
  if (target.id === 'remember') { state.setRemember(target.checked); refresh(); return; }
  if (AXES.includes(target.id)) change({ [target.id]: target.value });
});
const applyAccent = () => {
  if (!$('accent').reportValidity()) return;
  change({ accent: $('accent').value || undefined });
};
$('apply-accent').addEventListener('click', applyAccent);
$('accent').addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); applyAccent(); } });
$('reset').addEventListener('click', () => { state.reset(); refresh(); announce('Back to the default theme.'); });
document.querySelectorAll('[data-format]').forEach((button) => button.addEventListener('click', () => {
  format = button.dataset.format;
  document.querySelectorAll('[data-format]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  renderExport(state.theme());
}));
$('copy').addEventListener('click', () => copyText(exportContent(state.theme(), format), announce));
$('download').addEventListener('click', () => { download(state.theme(), format); announce('The file is in your downloads.'); });
$('share').addEventListener('click', () => copyText(state.link(), announce));

// The preview components are real markup, so give the few that need it their normal behavior.
const tabs = [...document.querySelectorAll('#pv-tabs [role="tab"]')];
const panel = $('pv-panel');
const PANELS = ['Everything is on track this week.', 'Three updates since yesterday.', 'Notifications go to your inbox.'];
const select = (index, focus) => {
  tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.dataset.selected = String(i === index); tab.tabIndex = i === index ? 0 : -1; });
  panel.textContent = PANELS[index];
  panel.setAttribute('aria-labelledby', tabs[index].id);
  if (focus) tabs[index].focus();
};
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => select(i));
  tab.addEventListener('keydown', (event) => {
    const next = event.key === 'ArrowRight' ? (i + 1) % tabs.length : event.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault(); select(next, true);
  });
});
document.querySelectorAll('.cieo-toast-dismiss').forEach((button) => button.addEventListener('click', () => { button.closest('.cieo-toast').hidden = true; }));
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) { stopPreferences(); controller.destroy(); }
});
refresh();
