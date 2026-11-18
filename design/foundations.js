import { densities, radii, fonts } from './presets.js';

/** Numeric decisions are shared by CSS and native exports; rem remains relative on web. */
export function foundations(config, put) {
  for (const [name, value] of Object.entries({ '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '6': 24, '8': 32, '10': 40, '12': 48, '16': 64, '24': 96 })) {
    put(`space-${name}`, 'dimension', `${value / 16}rem`, `Spacing step ${name}; ${value}px at the 16px reference size.`);
  }
  const [small, control, surface] = radii[config.radius];
  for (const [name, value] of Object.entries({ small, control, surface, pill: 9999 })) put(`radius-${name}`, 'dimension', `${value}px`, `Corner radius for ${name} shapes.`);
  put('control-height', 'dimension', `${densities[config.density] / 16}rem`, 'Control height for the selected density; touch has a separate floor.');
  put('control-xs', 'dimension', `${Math.max(24, densities[config.density] - 12) / 16}rem`, 'Extra-small dense control height.');
  put('control-small', 'dimension', `${(densities[config.density] - 8) / 16}rem`, 'Compact control height.');
  put('control-large', 'dimension', `${(densities[config.density] + 8) / 16}rem`, 'Prominent control height.');
  put('control-xl', 'dimension', `${(densities[config.density] + 12) / 16}rem`, 'Hero or toolbar control height.');
  put('touch-target', 'dimension', '44px', 'Minimum coarse-pointer target size.');
  put('border-width', 'dimension', config.contrast === 'high' ? '2px' : '1px', 'Visible control boundary width.');
  put('focus-width', 'dimension', '2px', 'Keyboard focus indicator width.');
  put('focus-offset', 'dimension', '3px', 'Space separating focus from the control.');
  put('font-sans', 'fontFamily', fonts[config.font], 'Local UI font stack; never fetched by Cieo.');
  put('font-display', 'fontFamily', fonts[config.font], 'Heading font stack: always the UI sans font, so headings and body read as one voice; never fetched by Cieo.');
  put('font-mono', 'fontFamily', fonts.mono, 'Local code and measurement font stack.');
  const sizes = { caption: .75, small: .875, body: 1, lead: 1.125, title: 1.5, heading: 2, display: 3.5 };
  for (const [name, size] of Object.entries(sizes)) put(`text-${name}`, 'dimension', `${size}rem`, `Responsive type role: ${name}.`);
  put('weight-normal', 'fontWeight', 400, 'Readable body weight.');
  put('weight-medium', 'fontWeight', 500, 'Control and label weight.');
  put('weight-strong', 'fontWeight', 650, 'Heading and emphasis weight.');
  put('weight-display', 'fontWeight', 500, 'Large display headlines and numerals: big type reads as weight already, so it stays medium.');
  put('leading-tight', 'number', 1.1, 'Display and title line height.');
  put('leading-body', 'number', 1.6, 'Long-form reading line height.');
  put('leading-control', 'number', 1.25, 'Compact interface line height.');
  put('measure', 'dimension', '42rem', 'Comfortable text-column maximum width.');
  put('container', 'dimension', '80rem', 'Wide-layout maximum width.');
  put('sidebar', 'dimension', '18rem', 'Preferred sidebar width before wrapping.');
  const ring = config.elevation === 'ring';
  put('ring-width', 'dimension', ring ? '1px' : '0px', 'Hairline drawn around a raised surface; zero unless the elevation is ring.');
  put('shadow-blur', 'dimension', ring ? '4px' : '24px', 'Elevation blur; small for ring elevation, diffuse for soft.');
  put('shadow-y', 'dimension', ring ? '1px' : '8px', 'Elevation vertical offset.');
  put('shadow-alpha', 'number', ring ? (config.scheme === 'dark' ? .4 : .05) : config.scheme === 'dark' ? .28 : .08, 'Elevation opacity.');
  put('disabled-opacity', 'number', .55, 'Disabled controls retain their shape and label.');
  put('layer-base', 'number', 0, 'Normal content layer.');
  put('layer-sticky', 'number', 10, 'Sticky local navigation layer.');
  put('layer-popover', 'number', 20, 'Nonmodal floating content layer.');
  put('layer-toast', 'number', 30, 'Status-notification layer.');
  put('layer-modal', 'number', 40, 'Modal surfaces: dialogs, sheets and lightboxes.');
  put('scrim-alpha', 'number', .45, 'Modal and sheet backdrop scrim opacity.');
  put('state-hover-opacity', 'number', .08, 'Interactive hover state-layer opacity.');
  put('state-focus-opacity', 'number', .12, 'Interactive focus state-layer opacity.');
  put('state-pressed-opacity', 'number', .12, 'Interactive pressed state-layer opacity.');
  put('state-selected-opacity', 'number', .14, 'Selected surface state-layer opacity.');
  put('state-dragged-opacity', 'number', .16, 'Dragged item state-layer opacity.');
  put('state-pressed-scale', 'number', .98, 'Tactile press scale factor.');
  put('state-lifted-scale', 'number', 1.02, 'Lifted drag or sheet scale factor.');
  put('motion-spring-snap-w', 'number', 34, 'Snap spring natural frequency (rad/s).');
  put('motion-spring-base-w', 'number', 22, 'Base spring natural frequency (rad/s).');
  put('motion-spring-soft-w', 'number', 15, 'Soft spring natural frequency (rad/s).');
  put('motion-spring-lazy-w', 'number', 9, 'Lazy ambient spring natural frequency (rad/s).');
  put('motion-zeta', 'number', config.zeta, 'Damping ratio: 1.0 is critically damped; <1 is bounded tactile.');
  put('motion-duration-snap', 'duration', '200ms', '99% settle time for snap spring.');
  put('motion-duration-base', 'duration', '300ms', '99% settle time for base spring.');
  put('motion-duration-soft', 'duration', '440ms', '99% settle time for soft spring.');
  put('motion-duration-lazy', 'duration', '740ms', '99% settle time for lazy spring.');
  put('motion-duration-exit', 'duration', '100ms', 'Outgoing content exit duration before incoming enters.');
  put('motion-lag', 'duration', '60ms', 'Trailing-edge follow delay on sliding indicators.');
  put('motion-stagger-max', 'duration', '300ms', 'Maximum cumulative stagger budget across a group.');
  put('motion-arrive-opacity', 'number', .45, 'Initial opacity for arriving list items.');
  put('motion-drift', 'dimension', '4px', 'Default directional entrance/swap travel distance.');
  put('physics-rubber-band', 'number', .55, 'Hyperbolic boundary overdrag resistance coefficient.');
  put('physics-flick-velocity', 'number', 450, 'Release velocity threshold (px/s) to project to next detent.');
}
