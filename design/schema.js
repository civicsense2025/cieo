import { createTheme } from './theme.js';
import { brands, densities, radii, fonts } from './presets.js';

/** Structural validation for other languages; semantic contrast still needs an audit. */
export function themeSchema() {
  const properties = {};
  for (const [name, token] of Object.entries(createTheme().tokens)) {
    let schema;
    if (token.type === 'color') schema = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
    else if (token.type === 'dimension') schema = { type: 'string', pattern: '^(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)(?:px|rem)$' };
    else if (token.type === 'fontFamily') schema = { type: 'array', minItems: 1, maxItems: 12, items: { type: 'string', pattern: '^[A-Za-z0-9_ -]{1,80}$' } };
    else schema = { type: 'number', minimum: token.type === 'fontWeight' ? 1 : 0, maximum: token.type === 'fontWeight' ? 1000 : ['shadow-alpha', 'disabled-opacity'].includes(name) ? 1 : 10000 };
    properties[name] = schema;
  }
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Cieo theme configuration v1',
    description: 'Structure only. The runtime also limits dimensions to 10000 and audits semantic color contrast.',
    type: 'object', required: ['version', 'options'], additionalProperties: false,
    properties: {
      version: { const: 1 },
      options: {
        type: 'object', additionalProperties: false,
        properties: {
          brand: { enum: Object.keys(brands) }, scheme: { enum: ['light', 'dark'] },
          density: { enum: Object.keys(densities) }, radius: { enum: Object.keys(radii) },
          contrast: { enum: ['standard', 'high'] }, font: { enum: Object.keys(fonts) },
          accent: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
          overrides: { type: 'object', additionalProperties: false, properties },
        },
      },
    },
  };
}
