/* Demo tree for docs/controls.html. Rendered to static HTML by scripts/build-controls-demo.mjs, then hydrated in the
   browser, so the page shows both the no-JS render and the enhanced controls. Plain createElement: no build step. */
import { createElement as h, Fragment, useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Radio, RadioGroup, Range, SearchField, Select, Switch, TextArea, TextField, buttonClassName } from '../dist/controls/index.js';

const SORT = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'viewed', label: 'Most viewed' },
  { value: 'alpha', label: 'Alphabetical' },
];
const CHAMBERS = [
  { value: 'all', label: 'All chambers' },
  { value: 'house', label: 'House' },
  { value: 'senate', label: 'Senate' },
  { value: 'joint', label: 'Joint (none this session)', disabled: true },
];
const STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York'];

const section = (title, ...kids) => h('section', { className: 'demo-section' }, h('h3', null, title), h('div', { className: 'demo-row' }, ...kids));

const iconPlus = h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', 'aria-hidden': true }, h('path', { d: 'M12 5v14M5 12h14' }));
const iconCopy = h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('rect', { x: 9, y: 9, width: 11, height: 11, rx: 2 }), h('path', { d: 'M5 15V5a2 2 0 0 1 2-2h8' }));

/* A button that runs pending (1.1s) then done (1.6s) then back, as the surface recipe does. */
function MorphButton({ skipPending, ...props }) {
  const [state, setState] = useState('idle');
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const go = () => {
    if (state !== 'idle') return;
    setState(skipPending ? 'done' : 'pending');
    const later = (ms, s) => timers.current.push(setTimeout(() => setState(s), ms));
    if (!skipPending) later(1100, 'done');
    later(skipPending ? 1600 : 2700, 'idle');
  };
  return h(Button, { ...props, state, onClick: go });
}

export function Gallery({ id }) {
  const [sort, setSort] = useState('newest');
  return h(
    'div',
    { className: 'demo-gallery' },
    section(
      'Buttons',
      h(Button, { variant: 'primary' }, 'Primary'),
      h(Button, null, 'Secondary'),
      h(Button, { variant: 'ghost' }, 'Ghost'),
      h(Button, { variant: 'text' }, 'Text button'),
      h(Button, { size: 'sm', variant: 'primary' }, 'Small'),
      h(Button, { size: 'sm', icon: iconPlus }, 'Add'),
      h(Button, { icon: iconPlus, 'aria-label': 'Add item' }),
      h(Button, { disabled: true }, 'Disabled'),
      h('a', { href: '#', className: buttonClassName({ variant: 'secondary' }) }, 'Link as button'),
    ),
    section(
      'Morph',
      h(MorphButton, { variant: 'primary', pendingLabel: 'Saving', doneLabel: 'Saved', 'data-demo': `morph-${id}` }, 'Save changes'),
      h(MorphButton, { icon: iconCopy, 'aria-label': 'Copy command', doneLabel: 'Copied', skipPending: true, 'data-demo': `copy-${id}` }),
    ),
    section(
      'Select',
      h(Select, { label: 'Sort', name: 'sort', options: SORT, value: sort, onValueChange: setSort, description: h(Fragment, null, 'Value: ', h('code', null, sort)) }),
      h(Select, { label: 'Chamber', name: 'chamber', options: CHAMBERS }),
      h(Select, { label: 'State', name: 'state', options: STATES, size: 'sm', defaultValue: 'New York' }),
    ),
    section(
      'Text fields',
      h(TextField, { label: 'Email address', type: 'email', name: 'email', autoComplete: 'off', validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter an address like name@example.com', description: 'Type an address, then press Tab.' }),
      h(TextField, { label: 'Amount', type: 'number', name: 'amount', prefix: '$', min: 1, defaultValue: '25' }),
      h(TextField, { label: 'ZIP code', name: 'zip', defaultValue: '1234', error: 'Enter a five-digit ZIP code.' }),
    ),
    section(
      'Search',
      h(SearchField, { label: 'Search bills', name: 'q', defaultValue: 'water rights' }),
      h(SearchField, { label: 'Search the site', name: 'q2', collapsible: true }),
    ),
    section('Text area', h(TextArea, { label: 'Your letter', name: 'letter', showCount: true, maxLength: 500, minRows: 3, maxRows: 8, description: 'It grows as you write.' })),
    section(
      'Choices',
      h(
        'div',
        { className: 'demo-stack' },
        h(Checkbox, { label: 'Email me new votes', name: 'votes', defaultChecked: true }),
        h(Checkbox, { label: 'Include amendments', name: 'amend', description: 'Adds about 40 items a week.' }),
        h(Checkbox, { label: 'Some topics', name: 'some', indeterminate: true }),
        h(Checkbox, { label: 'Disabled', name: 'dis', disabled: true }),
      ),
      h(
        RadioGroup,
        { label: 'Status', name: `status-${id}`, defaultValue: 'passed' },
        h(Radio, { value: 'introduced', label: 'Introduced' }),
        h(Radio, { value: 'passed', label: 'Passed' }),
        h(Radio, { value: 'law', label: 'Became law' }),
      ),
      h('div', { className: 'demo-stack' }, h(Switch, { label: 'Notifications', name: 'notify' }), h(Switch, { label: 'Compact rows', name: 'compact', defaultChecked: true })),
    ),
    section('Range', h(Range, { label: 'Since year', name: 'year', min: 1990, max: 2026, defaultValue: 2016, showValue: true })),
  );
}

/* The no-JS check: a GET form that must submit the same pairs with or without scripts. */
export function FilterForm() {
  return h(
    'form',
    { method: 'get', action: '', className: 'demo-form', id: 'filters' },
    h(SearchField, { label: 'Search legislation', name: 'q', defaultValue: 'housing' }),
    h(Select, { label: 'Sort', name: 'sort', options: SORT, defaultValue: 'oldest', autoSubmit: true }),
    h(Select, { label: 'Chamber', name: 'chamber', options: CHAMBERS }),
    h(TextField, { label: 'Sponsor', name: 'sponsor', defaultValue: 'Rivera' }),
    h(Checkbox, { label: 'Only bills with votes', name: 'voted', defaultChecked: true }),
    h(Button, { type: 'submit', variant: 'primary' }, 'Apply filters'),
  );
}

export function Demo() {
  return h(
    Fragment,
    null,
    h('div', { className: 'demo-panels' }, h('div', { className: 'demo-panel', 'data-theme': 'light' }, h('h2', null, 'Light'), h(Gallery, { id: 'l' })), h('div', { className: 'demo-panel', 'data-theme': 'dark' }, h('h2', null, 'Dark'), h(Gallery, { id: 'd' }))),
    h('div', { className: 'demo-panel', 'data-theme': 'light' }, h('h2', null, 'Filter form (works without JavaScript)'), h(FilterForm)),
  );
}
