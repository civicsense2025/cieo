# Decisions

- **Show, don't explain (2026-11-18).** Every library surface shows the real part working. Nothing is a lone word. Tests: `test/component-previews.test.mjs`, `test/site-minimal.test.mjs`. Why: the owner found text-only previews and long intros confusing.
- **One copy button, the kit's icon button (2026-11-18).** Generic actions are icons with an accessible name; the shared module is `site/copy-button.js`. Why: consistency and phone friendliness.
- **Tiles are inert and shared.** `scripts/lib/tiles.mjs` builds tiles for the Library and the home page; previews are inert so a tap opens the part page.
- **US English only.** Names we do not own (platform APIs, live URLs) carry `us-spelling-keep`.
- **Pure data logic lives in `src/data-grid` (2026-11-26).** Sorting, filtering, totals and CSV are pure TypeScript, exported as `cieo/data-grid` the way `src/agent` and `src/state` are. Tests: `test/data-grid-*.test.mjs`. Why: the host owns the data, and one shared model keeps every rule reading cells the same way.
- **Unchecked is a value, not a blank (2026-11-26).** A checkbox set to false sorts before true and is not empty; a missing checkbox is blank and sorts last. Why: the spec asks for false before true with empty values last.
- **A rule that cannot be read yet is inactive (2026-11-26).** A filter rule with a blank or unreadable value, a property the schema lacks, or an operator its type does not offer hides nothing. Why: adding a rule must never empty a table.
- **The spreadsheet guard covers DDE payloads and leading spaces (2026-11-26).** Text that starts like a formula, including `-2+3+cmd`, gets one apostrophe on export and loses it on import. `-5` and `-.5` are plain numbers and are left alone. Why: the reference rule misses DDE payloads. Test: `test/data-grid-formula.test.mjs`.
- **Numbers are strict (2026-11-26).** Leading zeros (`007`) and separators (`1,234`) read as text; exponents (`1e3`) read as numbers. Why: codes and separators must not change silently on import.
