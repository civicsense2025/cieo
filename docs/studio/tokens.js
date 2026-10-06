import { auditTheme } from '../../design/index.js';

export function renderTokens(theme, query = '') {
  const rows = document.getElementById('token-rows'), search = query.trim().toLowerCase();
  const entries = Object.entries(theme.tokens).filter(([name, token]) => `${name} ${token.description} ${token.value}`.toLowerCase().includes(search));
  const fragment = document.createDocumentFragment();
  for (const [name, token] of entries) {
    const row = document.createElement('tr');
    for (const text of [name, Array.isArray(token.value) ? token.value.join(', ') : String(token.value), token.description]) {
      const cell = document.createElement('td'); cell.textContent = text; row.append(cell);
    }
    fragment.append(row);
  }
  rows.replaceChildren(fragment);
  document.getElementById('token-count').textContent = `${entries.length} of ${Object.keys(theme.tokens).length}`;
  document.getElementById('empty-tokens').hidden = entries.length !== 0;
  const checks = auditTheme(theme);
  document.getElementById('contrast-summary').textContent = `${checks.length} color pairs checked`;
  for (const name of ['accent', 'surface', 'text', 'success']) document.getElementById(`${name}-value`).textContent = theme.tokens[`color-${name}`].value;
}
