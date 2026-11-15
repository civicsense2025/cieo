# Forma theme for Cieo

Forma skins Cieo with a documented `createTheme` recipe: the new `forma` brand preset plus audited overrides. No Cieo source change beyond the brand seed is needed; everything else uses the public override contract.

## Recipe

```js
import { createTheme, applyTheme } from 'cieo/design';
import 'cieo/design.css';
import 'cieo/primitives.css';

const FORMA_SANS = ['Helvetica Neue', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'];

export function formaTheme(scheme) {
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
      'color-focus': light ? '#3D63DD' : '#8FA3FF',
      ...(light ? { 'color-danger': '#B42318', 'color-danger-soft': '#FDF0EE' } : {}),
      'font-sans': FORMA_SANS,
      'radius-surface': '2px',
    },
  });
}

const controller = applyTheme(document.querySelector('.forma'), formaTheme('light'));
```

## Why a brand plus overrides, not a brand alone

A brand preset sets only the accent seed. Forma's identity needs warm neutral surfaces, a blue focus ring distinct from the ink accent, a Helvetica stack, and split radii — all of which the override contract covers and the pair auditor checks. `radius: 'crisp'` keeps menus and dialogs at 4px; pill controls come per-component (`Button`/`buttonClassName` `shape: "pill"`), so menus never inherit a global pill. See `docs/forma-gap-analysis.md` rows 2–3.

## Audit results

`createTheme` throws on any failing pair, so a returned theme is the proof. Pinned by `test/forma-theme.test.mjs`; run output, 2026-11-15:

- light: all 32 pairs pass (text/muted/subtle/accent 4.5:1 on canvas/surface/raised/sunken; border-strong and focus 3:1; on-accent/accent, selection, status pairs pass).
- dark: all 32 pairs pass.
- Resolved accents: light `#1F201C` on `#FFFFFF` (on-accent `#FFFFFF`); dark `#F2F1EC` on `#141412` (on-accent `#000000`).

## Deliberate deltas from the Forma spec

- `color-border-strong` keeps the Cieo cool-gray ramp (auto-adjusted to 3:1 against the warm surfaces). The spec names only the hairline.
- `color-danger` in dark keeps the Cieo default; the spec defines error tokens for light only.
- Cards, dialogs, and menus render at 4px (`radius-control` from `crisp`); only stage/curtain/dropzone surfaces read the 2px `radius-surface`. The spec's 2px-everywhere vs 10px-menu split cannot come from one radius token without re-skinning every control.
- Touch targets keep the 44px Cieo floor on coarse pointers; Forma's compact 36/30px visuals hold on fine pointers.
