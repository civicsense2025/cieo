import { densities, radii, fonts } from './presets.js';

/** Numeric decisions are shared by CSS and native exports; rem remains relative on web. */
export function foundations(config, put) {
  for (const [name, value] of Object.entries({ '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '6': 24, '8': 32, '10': 40, '12': 48, '16': 64, '24': 96 })) {
    put(`space-${name}`, 'dimension', `${value / 16}rem`, `Spacing step ${name}; ${value}px at the 16px reference size.`);
  }
  const [small, control, surface] = radii[config.radius];
  for (const [name, value] of Object.entries({ small, control, surface, pill: 9999 })) put(`radius-${name}`, 'dimension', `${value}px`, `Corner radius for ${name} shapes.`);
  put('control-height', 'dimension', `${densities[config.density] / 16}rem`, 'Control height for the selected density; touch has a separate floor.');
  put('control-small', 'dimension', `${(densities[config.density] - 8) / 16}rem`, 'Compact control height.');
  put('control-large', 'dimension', `${(densities[config.density] + 8) / 16}rem`, 'Prominent control height.');
  put('touch-target', 'dimension', '44px', 'Minimum coarse-pointer target size.');
  put('border-width', 'dimension', config.contrast === 'high' ? '2px' : '1px', 'Visible control boundary width.');
  put('focus-width', 'dimension', '2px', 'Keyboard focus indicator width.');
  put('focus-offset', 'dimension', '3px', 'Space separating focus from the control.');
  put('font-sans', 'fontFamily', fonts[config.font], 'Local UI font stack; never fetched by Cieo.');
  put('font-mono', 'fontFamily', fonts.mono, 'Local code and measurement font stack.');
  const sizes = { caption: .75, small: .875, body: 1, lead: 1.125, title: 1.5, heading: 2, display: 3.5 };
  for (const [name, size] of Object.entries(sizes)) put(`text-${name}`, 'dimension', `${size}rem`, `Responsive type role: ${name}.`);
  put('weight-normal', 'fontWeight', 400, 'Readable body weight.');
  put('weight-medium', 'fontWeight', 500, 'Control and label weight.');
  put('weight-strong', 'fontWeight', 650, 'Heading and emphasis weight.');
  put('leading-tight', 'number', 1.1, 'Display and title line height.');
  put('leading-body', 'number', 1.6, 'Long-form reading line height.');
  put('leading-control', 'number', 1.25, 'Compact interface line height.');
  put('measure', 'dimension', '42rem', 'Comfortable text-column maximum width.');
  put('container', 'dimension', '80rem', 'Wide-layout maximum width.');
  put('sidebar', 'dimension', '18rem', 'Preferred sidebar width before wrapping.');
  put('shadow-blur', 'dimension', '24px', 'Soft elevation blur; optional surface treatment.');
  put('shadow-y', 'dimension', '8px', 'Soft elevation vertical offset.');
  put('shadow-alpha', 'number', config.scheme === 'dark' ? .28 : .08, 'Elevation opacity.');
  put('disabled-opacity', 'number', .55, 'Disabled controls retain their shape and label.');
  put('layer-base', 'number', 0, 'Normal content layer.');
  put('layer-sticky', 'number', 10, 'Sticky local navigation layer.');
  put('layer-popover', 'number', 20, 'Nonmodal floating content layer.');
  put('layer-toast', 'number', 30, 'Status-notification layer.');
}
