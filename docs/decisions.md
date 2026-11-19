# Decisions

- **Show, don't explain (2026-11-18).** Every library surface shows the real part working. Nothing is a lone word. Tests: `test/component-previews.test.mjs`, `test/site-minimal.test.mjs`. Why: the owner found text-only previews and long intros confusing.
- **One copy button, the kit's icon button (2026-11-18).** Generic actions are icons with an accessible name; the shared module is `site/copy-button.js`. Why: consistency and phone friendliness.
- **Tiles are inert and shared.** `scripts/lib/tiles.mjs` builds tiles for the Library and the home page; previews are inert so a tap opens the part page.
- **US English only.** Names we do not own (platform APIs, live URLs) carry `us-spelling-keep`.
