import { createTheme } from './theme.js';
import { brands, densities, radii, fonts, displays, grounds, elevations } from './presets.js';
/** Structural validation for other languages; semantic contrast still needs an audit. */
export function themeSchema() {
  const properties = {};
  const unitFraction = new Set([
    'shadow-alpha', 'disabled-opacity', 'scrim-alpha',
    'state-hover-opacity', 'state-focus-opacity', 'state-pressed-opacity', 'state-selected-opacity', 'state-dragged-opacity',
    'motion-arrive-opacity', 'physics-rubber-band',
  ]);
  for (const [name, token] of Object.entries(createTheme().tokens)) {
    let schema;
    if (token.type === 'color') schema = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
    else if (token.type === 'dimension') schema = { type: 'string', pattern: '^(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)(?:px|rem)$' };
    else if (token.type === 'duration') schema = { type: 'string', pattern: '^(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)(?:ms|s)$' };
    else if (token.type === 'fontFamily') schema = { type: 'array', minItems: 1, maxItems: 12, items: { type: 'string', pattern: '^[A-Za-z0-9_ -]{1,80}$' } };
    else if (name === 'motion-zeta') schema = { type: 'number', minimum: 0.7, maximum: 1 };
    else schema = { type: 'number', minimum: token.type === 'fontWeight' ? 1 : 0, maximum: token.type === 'fontWeight' ? 1000 : unitFraction.has(name) ? 1 : 10000 };
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
          display: { enum: Object.keys(displays) }, ground: { enum: Object.keys(grounds) }, elevation: { enum: Object.keys(elevations) },
          zeta: { type: 'number', minimum: 0.7, maximum: 1 },
          accent: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
          components: {
            type: 'object',
            propertyNames: { pattern: '^[a-z][a-z0-9-]{0,31}$' },
            additionalProperties: {
              type: 'object',
              propertyNames: { pattern: '^[a-z][a-z0-9-]{0,31}$' },
              additionalProperties: { type: ['string', 'number'] },
            },
          },
          overrides: { type: 'object', additionalProperties: false, properties },
        },
      },
    },
  };
}
