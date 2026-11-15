// Forma theme recipe: the forma brand plus audited overrides reproduces the Forma
// spec tokens in both schemes. createTheme throws on any failing pair, so a
// returned theme is the audit proof; the pair counts below pin the contract.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTheme, auditTheme } from '../design/index.js';

const SANS = ['Helvetica Neue', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'];

function formaTheme(scheme) {
  const light = scheme === 'light';
  return createTheme({
    brand: 'forma',
    scheme,
    radius: 'crisp',
    overrides: {
      'color-canvas': light ? '#FBFAF8' : '#141412',
      'color-surface': light ? '#FFFFFF' : '#1C1C1A',
      'color-raised': light ? '#FFFFFF' : '#1C1C1A',
      'color-sunken': light ? '#F1F0EC' : '#22221F',
      'color-text': light ? '#1F201C' : '#F2F1EC',
      'color-muted': light ? '#62645D' : '#A3A49C',
      'color-subtle': light ? '#62645D' : '#A3A49C',
      'color-border': light ? '#E4E2DC' : '#33332F',
      'color-focus': light ? '#3D63DD' : '#8FABFF',
      ...(light ? { 'color-danger': '#B42318', 'color-danger-soft': '#FDF0EE' } : {}),
      'font-sans': SANS,
      'radius-surface': '2px',
    },
  });
}

test('forma light recipe passes all 32 audited pairs with spec tokens', () => {
  const theme = formaTheme('light');
  const audit = auditTheme(theme);
  assert.equal(audit.length, 32);
  assert.ok(audit.every((result) => result.pass));
  assert.equal(theme.tokens['color-text'].value, '#1f201c');
  assert.equal(theme.tokens['color-muted'].value, '#62645d');
  assert.equal(theme.tokens['color-accent'].value, '#1f201c');
  assert.equal(theme.tokens['color-on-accent'].value, '#ffffff');
  assert.equal(theme.tokens['color-focus'].value, '#3d63dd');
  assert.equal(theme.tokens['color-canvas'].value, '#fbfaf8');
  assert.equal(theme.tokens['color-surface'].value, '#ffffff');
  assert.equal(theme.tokens['color-sunken'].value, '#f1f0ec');
  assert.equal(theme.tokens['color-border'].value, '#e4e2dc');
  assert.equal(theme.tokens['color-danger'].value, '#b42318');
  assert.equal(theme.tokens['color-danger-soft'].value, '#fdf0ee');
  assert.deepEqual(theme.tokens['font-sans'].value, SANS);
  assert.equal(theme.tokens['radius-surface'].value, '2px');
});

test('forma dark recipe passes all 32 audited pairs with spec tokens', () => {
  const theme = formaTheme('dark');
  const audit = auditTheme(theme);
  assert.equal(audit.length, 32);
  assert.ok(audit.every((result) => result.pass));
  assert.equal(theme.tokens['color-text'].value, '#f2f1ec');
  assert.equal(theme.tokens['color-muted'].value, '#a3a49c');
  assert.equal(theme.tokens['color-accent'].value, '#f2f1ec');
  assert.equal(theme.tokens['color-focus'].value, '#8fabff');
  assert.equal(theme.tokens['color-canvas'].value, '#141412');
  assert.equal(theme.tokens['color-surface'].value, '#1c1c1a');
  assert.equal(theme.tokens['color-border'].value, '#33332f');
});

test('forma brand seeds the ink accent in both schemes', () => {
  assert.equal(createTheme({ brand: 'forma', scheme: 'light' }).tokens['color-accent'].value, '#1f201c');
  assert.equal(createTheme({ brand: 'forma', scheme: 'dark' }).tokens['color-accent'].value, '#f2f1ec');
});
