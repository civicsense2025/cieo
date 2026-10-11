# Cieo primitives parity with Astryx component list (thin primitives path)

**Status: approach 1 approved in conversation on 2026-10-10; written spec awaiting review.** Nothing here is built.

## Intent

Give agents and people building with Cieo one obvious way to use every primitive named on Astryx `/components`, without copying Astryx markup, styling, text, icons, or code.

Astryx is inspiration only. Cieo stays the owner. Everything is built from Cieo tokens, `design/primitives.css`, and Cieo motion. `docs/design-system.md` is the design authority; this work does not explore a new look.

Success means:
- Every Astryx-named primitive has a Cieo counterpart importable as `import { ButtonGroup } from 'cieo/ButtonGroup'` (plus a `cieo/primitives` barrel).
- Every counterpart has a documentation page in the Documentation-Design shape (prose alternating with live examples, props table, do/don't pairs), built in Cieo style.
- The FaceStack/AvatarGroup row bug is gone: lists use a static stack, never the hover fan-out demo, with correct accessible names and reduced-motion behavior.
- `npm run check` stays green. Docs site still targets Lighthouse 100 on home + one composite.

## Why agents fail today

- `cieo/controls` ships 9 React controls only (Button, Select, TextField, TextArea, SearchField, Checkbox/Switch/Radio, Range). No ButtonGroup, no production AvatarGroup.
- `atoms/web/index.json` has 550 motion recipes including `avatars` (`blocks/084-avatars.js`): hover fans avatars apart with 30ms stagger plus a name popover. That is a motion demo, not a production primitive.
- Agents see the demo, invent a "cieo Avatar-group look" in plain CSS, and paste an overlapping face stack into every row type (stories, events, timelines, votes, bills) with animated hover, repeated names for screen readers, and photo fallbacks that violate content rules (e.g. Earl Warren must show initials, never a wrong photo).

The fix is to ship real primitives with real contracts so there is nothing to invent.

## Approach: thin Cieo primitives (approved)

New `src/primitives/<Name>.tsx` per Astryx name. Plain React + Cieo tokens + `primitives.css`. No StyleX, no new runtime dependency. Server renders real markup; scripts only enhance.

Rejected:
- Faithful Astryx port (StyleX + hooks per component): heaviest to maintain, breaks Cieo look authority, risks Lighthouse.
- Promote 550 recipes as-is: keeps the fan-out-as-AvatarGroup confusion, no props/a11y contract.

## Source and package boundaries

Proposed tree (names describe proposed files, not implemented moves):

```text
cieo/
  src/primitives/
    ButtonGroup/{ButtonGroup.tsx,manifest.json,README.md}
    AvatarGroup/{AvatarGroup.tsx,manifest.json,README.md}
    FaceStack/{FaceStack.tsx,manifest.json,README.md}  # see below; may alias AvatarGroupStatic
    ...one folder per Astryx name...
    index.ts          # barrel re-export for 'cieo/primitives'
  design/styles/
    primitives/       # one CSS module per primitive, imported via primitives.css
  site/               # generated docs (existing site spec owns layout)
```

Rules:
- One folder per primitive owns source, manifest, and long-form README. Manifest links README; it does not duplicate prose. Follows `2026-10-08-atomic-component-system-design.md` (JSON Schema Draft 2020-12, `additionalProperties: false`, versioned contracts).
- `package.json` `exports` gains deep imports: `./ButtonGroup`, `./AvatarGroup`, etc. (each with types + default), plus `./primitives` barrel. Keep existing `cieo/controls`, `cieo/dom`, `cieo/react` entry points unchanged.
- `tsconfig.json` stays `src` root; `npm run build` emits `dist/primitives/*` with `.d.ts`. `dist/` remains committed; `npm run check` verifies the new exports.
- No universal `Any` props or executable modifier strings. Override order: system defaults → host theme → component typed style → per-instance override. A color override cannot remove a label or bypass reduced motion.

## FaceStack / AvatarGroup fix (first proof)

Ship two distinct things so agents stop blending them:

1. `AvatarGroup` (production, static by default for rows):
   - Shows up to 4 faces plus a `+N` disc. Tight overlap (`-8px`), ring via `--cieo-color-*` tokens, initials discs when no photo.
   - Plain CSS, no spring fan-out. No per-avatar hover animation in lists (too heavy for dozens of rows, hostile to reduced-motion).
   - Decorative stack: root `aria-hidden="true"`. Row supplies accessible names in its own `aria-label` (e.g. `aria-label="Brown v. Board, Warren, Marshall, +2 more"`), so screen readers do not hear each name twice.
   - Content rule: exclusion respected — Earl Warren (and any person with no approved photo) renders initials, never a wrong photo. No photo fallback guessing.
   - Props: `people: { name, initials, src? }[]`, `max?: number` (default 4), `size?: sm|md`.
2. `AvatarGroupAnimated` (demo only): keeps the `084-avatars.js` fan-out + popover for the catalogue demo page. Not for rows. README says so explicitly.

Do/don't pairs on the doc page show static-in-row (do) vs fan-out-in-row (don't, with reason: cost + motion + a11y).

## Documentation page per primitive

Every primitive gets the layout from `2026-10-09-design-system-site-design.md` section "Component documentation page", modeled on Astryx Documentation-Design template but rebuilt in Cieo style:

1. Header: name, one-sentence summary, level badge (atom/molecule/organism), Swift link if exists.
2. Alternating prose + live examples. Each example card: title, live preview responding to theme bar, Description/Code tabs, copy button, expand control.
3. Property table: name, type, default, description (from manifest).
4. Do/don't pairs with short reasons.
5. Right rail "On this page": Usage, Best practices, Examples, scroll-highlighted.
6. Footer: install/copy command + "Open in Workbench" link. No Astryx "Open in Craft" / "Send to CLI" clone.
7. Prev/next within same level.

Scale rule (550 entries + ~150 Astryx names is too many to hand-author at once):
- Template + schema mandatory for all.
- Prose/props/do-don't live in the primitive's README + manifest. First pass fills summary/code/props from `index.json`, Swift sources, and Astryx prop names where they map cleanly (names only, no copied text).
- Missing sections render "Not documented yet"; build reports the count. Nothing invented.
- Document the four composites' parts first, then FaceStack/ButtonGroup, then the rest by group.

## Levels

Add `level` (`atom|molecule|organism`) per entry. Start from Astryx group + Cieo dependencies (e.g. Button=atom, ButtonGroup=molecule, ChatLayout=organism, Table=organism). Anything unclear goes on a short owner-decision list. Build fails on missing level once the list is resolved.

## Astryx coverage map (scope = every primitive on /components)

Groups from `https://astryx.atmeta.com/components/` on 2026-10-10. Each becomes one agent lane. Counts are approximate; inventory lane reconciles exact IDs.

- Action: Button, ButtonGroup, IconButton, ToggleButton, ToggleButtonGroup, DropdownMenu (+parts), MoreMenu, SegmentedControl (+Item), Toolbar.
- Content: Avatar, AvatarGroup, AvatarGroupOverflow, AvatarStatusDot, Blockquote, Citation, Code, CodeBlock, EmptyState, Heading, Icon, Kbd, Markdown, Text, Thumbnail, Timer, Timestamp, Token.
- Container: Card, ClickableCard, SelectableCard, Carousel, Collapsible (+Group), AspectRatio.
- Form: Calendar, CheckboxInput, ComplexSelector, DateInput, DateRangeInput, DateTimeInput, Field (+Label/Status), FileInput, InputGroup (+Text), MultiSelector, NumberInput, PowerSearch, RadioList (+Item), CheckboxList (+Item), Selector (+Option), Slider, Switch, TextArea, TextInput, TimeInput, Tokenizer, Typeahead (+Item).
- Layout: AppShell, Center, Divider, FormLayout, Grid (+Span), Layout (+Content/Footer/Header/Panel), HStack/VStack/Stack (+Item), Section, FormLayout, ScrollableArea, ResizeHandle.
- Navigation: Breadcrumbs (+Item), Outline, Pagination, SideNav (+Item/Heading/Section/CollapseButton), TopNav (+Item/Heading/Menu/MegaMenu*), MobileNav (+Toggle), NavIcon, Stepper (+Step), Tab (+List/Menu).
- Overlay: BottomSheet (+Switcher), CommandPalette (+Input/Item/List/Group/Empty/Footer), Dialog (+Header/Alert), HoverCard, Lightbox, Overlay, Popover, Toast, Tooltip.
- Table & List: List (+Item), MetadataList (+Item), OverflowList, Table (+Body/Cell/Footer/Header/HeaderCell/Row/SelectionToolbar), TreeList.
- Chat + Feedback: ChatComposer (+Drawer/Input/TokenElement), ChatLayout (+ScrollButton), ChatMessage (+Bubble/List/Metadata), ChatSendButton, ChatDictationButton, ChatSystemMessage, ChatTokenizedText, ChatToolCalls, Badge, Banner, ProgressBar, Skeleton, Spinner, StatusDot.
- Utility (document, do not componentize blindly): VisuallyHidden, providers/hooks (`use*`) map to docs + Cieo `dom`/`react` helpers where they exist; no fake components for hooks.

Inventory lane reconciles Astryx IDs ↔ Cieo controls ↔ `atoms/web` recipe IDs ↔ Swift atoms, emitting aliases (old IDs keep working) and marking demo-only vs production.

## Composition, state, customization

- Dependencies flow tokens → theme → atoms → molecules → organisms. Chat/Table/TopNav can depend on core atoms. Nothing depends on examples or Workbench scaffolding. Manifest graph stays acyclic.
- Behavior (focus, activation, selection, dismissal, events) belongs to the component/native primitive. Content (labels, values, section IDs) belongs to the host. Styles own layout/type/color/radius/motion via tokens. Effects (persist, network, parse, auth) belong to the host.
- Controlled values where relevant; components request change, never report success before host acceptance. Transient hover/press/disclosure may stay internal if documented.

## Hosting and performance

- Reuses the site spec: static output in `site/`, Cloudflare Workers static assets, one `wrangler.jsonc`, one deploy command. Pre-rendered HTML, per-page CSS/JS, below-fold hydration, local font stacks.
- Target Lighthouse 100 + green Core Web Vitals on home + one composite. Regression = failing test.
- Pin Wrangler, prefer release 7+ days old, vet before adding.

## Checks

- Build check: every entry has level, preview, doc page; reports "Not documented yet" count.
- `test/browser/smoke.py` extended: open each section index + sample pages, switch themes, fail on console errors.
- Keyboard reachability of tabs/copy/rail + visible focus. No conformance claim.
- Redirects from old gallery URLs tested.
- Existing `npm run check` stays green (engine + design contract + ledger + public types + tracked styles).

## Out of scope

- New look or themes. `docs/design-system.md` stays authoritative.
- Framework migration or server app.
- Hand-authoring all prose in one pass.
- Native (Swift) acceptance testing.
- Copying Astryx code, styles, text, or icons.

## Open items for the owner

- Level assignments the sorter cannot decide alone.
- Cloudflare account/domain vs `workers.dev` at first.
- Whether `FaceStack` ships as its own export or as `AvatarGroup variant="static"` (spec allows either; implementation plan picks one and aliases the other).

## Next action

Review this spec file. On approval, invoke writing-plans to create the implementation plan and split the 8 lanes + inventory lane.
