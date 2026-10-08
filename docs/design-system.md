# Cieo design foundation

Cieo keeps the existing spring engine and adds an optional visual layer. The same semantic decisions travel as CSS, typed JSON, or native constants. Importing the motion engine does not load this layer, and importing the design API does not touch the document or start an animation. Apple applications can also import the separate [CieoUI component foundation](apple-components.md); it does not depend on the reference recipe catalogue.

## Quick start

```html
<link rel="stylesheet" href="./design/themes.css">
<link rel="stylesheet" href="./tokens/tokens.css">
<link rel="stylesheet" href="./design/primitives.css">
<main class="cieo">
  <button type="button" class="cieo-button" data-variant="primary">Continue</button>
</main>
```

The `.cieo` boundary scopes the primitive styles. Custom properties alone do not restyle an application. The stylesheet uses cascade layers so normal, unlayered application styles can override it without an `!important` contest. The controls still need real labels, correct HTML elements, and application behavior.

```js
import { createTheme, applyTheme } from 'cieo/design';
import 'cieo/design.css';
import 'cieo/primitives.css';
const controller = applyTheme(document.querySelector('.workspace'), createTheme({
  brand: 'iris', scheme: 'dark', density: 'comfortable', radius: 'soft',
}));
// On a user preference change:
controller.update(createTheme({ brand: 'lagoon', scheme: 'dark' }));
// At the framework's unmount/dispose boundary:
controller.destroy();
```

Controllers own one element each. A second controller on the same element throws. Destruction restores prior inline values and priorities only when the application hasn't subsequently changed them. Nested scopes inherit CSS variables, but different elements have independent controllers. The host owns CSS inheritance at nested boundaries.

## A visual identity without a framework dependency

Six starting points cover olive, iris, lagoon, ember, rose, and monochrome. Each separates the brand accent from success, warning, danger, and information. Three densities, three corner profiles, three local font stacks, two resolved appearances, and two resolved contrast levels produce 648 supported combinations. These combinations are test cases, not separately counted improvements.

The 73 tokens cover neutral surfaces; primary, muted, and subtle content; accent and status pairs; spacing; radii; control dimensions; focus; typography; reading measures; elevation; and layer order. Explicit token overrides offer a lower-level escape hatch. `createTheme()` rejects unknown keys, invalid types, non-finite numbers, unsafe CSS values, and failing audited color pairs.

```js
createTheme({
  accent: '#e46755',
  overrides: { 'radius-control': '8px', 'space-4': '1rem', 'font-sans': ['Example Sans', 'sans-serif'] },
});
```

An accent seed can change when contrast requires it. The resolved accent is available in `theme.tokens['color-accent']`. An override changes the named token, not every dependent token: a custom color set must still satisfy the pair audit. Color overrides don't automatically recolor the old Motion Atoms catalogue or an application's existing components.

## Accessibility boundaries

The color auditor checks 32 named pairs: text and accents against four neutral surfaces, control boundaries, focus, selection, filled and soft accents, and four feedback surfaces. Standard text targets 4.5:1; the high-contrast option targets 7:1. Boundaries and focus target 3:1. These are color-pair checks, not a WCAG conformance certificate.

Coarse-pointer controls have a 44 CSS-pixel floor in the primitive stylesheet, even with compact density. That design target is deliberately larger than the WCAG 2.2 AA minimum of 24 CSS pixels, which also has exceptions. The stylesheet preserves native keyboard focus, gives errors a dashed boundary, uses visible feedback labels, handles forced colors, and removes primitive transitions under reduced motion. The motion token stylesheet now clears stagger and drift as well as durations.

An application can still introduce inaccessible text, missing labels, clipped controls, poor focus order, unsafe overrides outside the auditor's color scope, or modal behavior that these styles don't implement. Disabled-control opacity is not a promise of active-text contrast. Test the rendered application, assistive technologies, and real devices.

Sources: [WCAG 2.2 reference](https://www.w3.org/WAI/WCAG22/quickref/), [contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## Portable files, not a universal widget runtime

`toDTCG(theme)` emits the resolved subset of the Design Tokens Community Group (DTCG) 2025.10 format used here: color, dimension, font family, font weight, and number. Colors retain an explicit sRGB space, components, alpha, and a hex fallback. Dimensions retain `px` or `rem` units. This exporter is not a general alias resolver, Figma importer, or implementation of the full resolver specification.

`toPortable(theme)` wraps the same typed values with a version and a 16-unit reference font size. Any language with a JSON parser can read that contract. `theme.schema.json` validates configuration structure; it does not replace runtime dimension limits or contrast validation. `parseTheme()` imports Cieo configuration files, not arbitrary DTCG documents.

Sources: [DTCG format 2025.10](https://www.designtokens.org/tr/2025.10/format/), [DTCG color 2025.10](https://www.designtokens.org/tr/2025.10/color/). DTCG is a community specification, not a W3C Recommendation.

```js
import { toCSS, toNative, toDTCG, toPortable, serializeTheme } from 'cieo/design';
toCSS(theme, '.workspace');
toNative(theme, 'swift', { namespace: 'ExampleTokens', referenceFontSize: 16 });
toNative(theme, 'rust');
toDTCG(theme);
serializeTheme(theme); // Versioned, editable configuration for import later.
```

Six generators emit Swift, Rust, Kotlin, Dart, Python, and C constants. Namespaces must be PascalCase, end in `Tokens`, and contain at most 63 characters. The suffix prevents collisions with native keywords and built-in types. Native dimensions convert `rem × referenceFontSize`; the host maps those values to points, density-independent units, or its own renderer. The host also owns native text scaling, color conversion, accessibility, motion policy, and controls. Kotlin and Dart outputs target ordinary Kotlin objects and Dart 3 classes respectively.

## Integration matrix

| Host | Integration | Boundary |
| --- | --- | --- |
| Plain HTML; Django, Rails, Laravel, Phoenix, ASP.NET, Go or Rust servers | Link CSS or read JSON at build time | The server language doesn't interpret the styles. |
| React, Vue, Svelte, Solid or another web view layer | CSS classes; optional `applyTheme()` in its mount/dispose lifecycle | No new framework wrapper ships in this change. |
| Static sites, object storage or a content delivery network | Copy the stylesheet tree or prebuilt exports | Keep relative CSS imports intact. |
| SwiftUI, AppKit, UIKit, Android, Flutter or a custom renderer | Use generated constants or parse JSON | Native components and layout adapters remain host code. |
| Agents and build tools | Read the typed JSON and schema; use the command-line exporter | No remote agent, cloud, account, or AI is required. |

## Studio and command-line tools

`npm run studio` serves only the preview's document, style, and token directories on loopback. It has no write endpoints or dependency installation. `npm run studio:standalone` creates `Cieo-studio.html`, a single-file offline preview with an import map. The modular studio is `docs/studio/index.html`; the standalone build is a convenience artifact, not a general-purpose bundler.

The studio previews all axes, semantic colors, token search, task progress, form validation, motion replay, and right-to-left layout. System appearance, contrast, and reduced-motion changes update live. Mobile controls collapse above the specimen. Local persistence requires the “Remember on this device” option; blocked storage and clipboard access have visible fallbacks. Imports are size-limited and validated before applying. The demo does not create real hosted projects.

```sh
node scripts/export-theme.mjs config > my-theme.json
node scripts/export-theme.mjs css my-theme.json > my-theme.css
node scripts/export-theme.mjs swift my-theme.json > ExampleTokens.swift
node scripts/export-theme.mjs dtcg my-theme.json > my-theme.tokens.json
# Or use the installed command:
cieo-theme json my-theme.json
```

The CLI sends only the artifact to standard output and errors to standard error. A failed export exits nonzero. It does not write a destination file or send a network request.

## Building, packaging and review

`npm run build:design` regenerates the standalone schema, default styles, 24 named palette stylesheets, two typed JSON artifacts, and six native outputs. Generated language/palette files live under `design/generated/`, stay out of source control, and enter npm tarballs through `prepare`/`prepack`. The handoff ZIP includes them too. `design/themes.css` and `design/theme.schema.json` remain tracked and receive drift checks. The generator has no third-party dependencies.

The original spring engine, React API, DOM API, SwiftUI package, and recipe files remain unchanged. Existing import paths still resolve. The package stays private and UNLICENSED; this change does not authorize public redistribution or publish a release. The dependency versions don't change. The lockfile only gains the command-line entry metadata.

Run `npm run test:design`, `npm run test:design:types`, and `npm run test:design:browser`. Native compilation tests skip unavailable compilers explicitly. The browser test renders the offline artifact without network access; it does not certify every browser or platform. The complete repository still needs `npm run check` and the macOS Swift package checks. See `review.md`, `improvements.json`, and the packaged verification report for exact scope and results.
