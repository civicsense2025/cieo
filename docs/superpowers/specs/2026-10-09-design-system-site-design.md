# Cieo design system site

**Status: design approved in conversation on 2026-10-09; written spec awaiting review.** Nothing here is built.

## Intent

Give people choosing or composing Cieo components one hosted place to browse them as atoms, molecules and organisms, see each one live, read how to use it, and see whole product screens built from the parts. It is hosted on Cloudflare Workers.

The structure is inspired by sites such as Astryx (atoms to organisms, live previews, product composites, a documentation layout per item). No Astryx markup, styling, text, icons or code is copied. Everything is built from Cieo's own tokens, primitives and components, under the existing look in `docs/design-system.md`. That document is the design authority; this work does not explore alternative looks.

Success means:
- Every component has a documentation page in the layout below, with a live preview that responds to the theme controls.
- Atoms, molecules, organisms and composites are each browsable as a section.
- The site deploys with one command to Cloudflare Workers and scores 100 on Lighthouse for the home page and one composite.
- `npm run check` still passes.

## Approach (option 1: combine what exists)

Consolidate the existing gallery pages into one static site. Reuse `design/`, `tokens/`, `atoms/web` and the existing runtime. No framework and no server code. The site is generated from data at build time.

Existing facts this relies on:
- `docs/catalogue.html` and `docs/library.html` are byte-identical (checked). One becomes a redirect to the new site.
- `atoms/web/index.json` lists 550 entries with `id`, `category`, `name`, `summary`, `file`, `api`. It has no atom/molecule/organism level.
- The existing component-contract spec (`2026-10-08-atomic-component-system-design.md`) makes a colocated `manifest.json` plus README the single owner of each component's identity and long-form guidance. This site reads those and does not duplicate them.

## Site structure

| Section | Content |
| --- | --- |
| Foundations | Tokens, color, type, spacing, motion, theme controls |
| Atoms | Single controls (button, input, badge) |
| Molecules | A few atoms working together (search field, form row) |
| Organisms | Complete page sections (header, pricing table, chat thread) |
| Composites | Whole product screens built only from the parts above |

Each section has an index of live preview cards and one page per component. A global theme bar (brand, light/dark, density, radius) reuses `applyTheme` and changes every preview on the page.

## Component documentation page

Every component gets this layout (modeled on the documentation pattern in Astryx's "Documentation Design" template, rebuilt in Cieo's own style):

1. **Header:** name, one-sentence summary, level badge (atom, molecule or organism), link to the Swift version if one exists.
2. **Alternating prose and live examples.** Each example is a card with:
   - a title and a live preview that responds to the theme bar;
   - **Description** and **Code** tabs under the preview;
   - a copy button on the code block;
   - an expand-to-full-size control.
3. **Property table:** name, type, default, description for each prop.
4. **Do and don't pairs:** side-by-side live examples with a short reason for each.
5. **Right rail, "On this page":** Usage, Best practices, Examples, with the current section highlighted as you scroll.
6. **Footer bar:** the install or copy command for the component, and an "Open in Workbench" link to `docs/workbench.html` with that component loaded. Astryx's "Open in Craft" and "Send to CLI" are specific to its own tools and are not reproduced.
7. **Previous and next** component within the same level.

Because there are 550 entries, authoring every field by hand is not realistic in one pass. The rule is:
- The page template and its schema are mandatory for all components.
- Prose, props, do/don't pairs and extra examples live in the component's README and manifest.
- Where a section has no authored content yet, the page shows a plain "Not documented yet" state and the build reports the count. Nothing is invented to fill the gap.
- A first pass fills summary, code and props from the existing `index.json` and Swift sources where they exist. Components with the most use (the four composites' parts) are documented first.

## Levels

Add a `level` field (`atom`, `molecule`, `organism`) to each entry. Sorting starts from category and the part's own dependencies, then anything unclear goes on a short list for the owner to decide. The build fails if any entry has no level once the list is resolved.

## Composites

Built only from library parts, so each doubles as proof the parts fit together:
1. Admin dashboard with settings
2. Storefront product page with checkout
3. AI chat workspace
4. Scheduling and booking flow

Each composite page lists the parts it uses, linking to their documentation pages.

## Hosting and performance

- Static output in `site/`, served by Cloudflare Workers static assets. One `wrangler.jsonc` and one `npm run deploy`. No Worker script unless a redirect rule needs one.
- Pre-rendered HTML, no client framework. Each page loads only its own CSS and script. Previews below the fold hydrate on scroll. Fonts use local stacks already defined by the tokens.
- Target Lighthouse 100 and green Core Web Vitals. A regression is treated as a failing test.
- Pin the Wrangler version, vet it before adding, and prefer a release at least seven days old.

## Checks

- Build check: every component has a level, a preview and a documentation page. It reports how many sections are "Not documented yet".
- Extend `test/browser/smoke.py` to open every section index and a sample of component pages, switch themes, and fail on console errors.
- Accessibility: keyboard reachability of the tabs, copy buttons and right rail, and visible focus. Not a conformance claim.
- Lighthouse run on the home page and one composite.
- Existing `npm run check` stays green.
- Redirects from the old gallery URLs are tested.

## Out of scope

- A new look or alternative themes.
- A framework migration or server-rendered app.
- Full authoring of all 550 components' prose in this effort.
- Native (Swift) acceptance testing.

## Open items for the owner

- The list of parts the sorter cannot level on its own.
- Whether the Cloudflare account and domain are ready, or a `workers.dev` address is fine at first.
