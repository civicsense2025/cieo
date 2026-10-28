const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const typeLabel = (type) => type.kind === 'enum' ? type.values.map((value) => JSON.stringify(value)).join(' | ')
  : type.kind === 'record' ? 'object' : type.kind === 'array' ? `${typeLabel(type.items)}[]` : type.kind;

export function syncPropertyRows(authored, properties) {
  authored = authored.replace(/<tr data-generated-property="[^"]+">[\s\S]*?<\/tr>/g, '');
  const present = new Set([...authored.matchAll(/<tr[^>]*>\s*<td[^>]*>([\s\S]*?)<\/td>/g)].map((match) => match[1].replace(/<[^>]*>/g, '').trim()));
  const missing = properties.filter((property) => !present.has(property.id));
  return authored + missing.map((property) => `<tr data-generated-property="${escape(property.id)}"><td>${escape(property.id)}</td><td>${escape(typeLabel(property.type))}</td><td>${property.default === undefined ? '—' : escape(JSON.stringify(property.default))}</td><td>${escape(property.note ?? (property.required ? 'Required.' : 'Optional.'))}</td></tr>`).join('');
}
