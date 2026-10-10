# Cieo motion in primitives

**Status: direction approved in conversation on 2026-10-10 (audit all, springs on six, closed token-choice + opt-out); written spec awaiting review.** Nothing here is built.

## Intent

Finish motion the way best practice describes it in 2026: global tokens chosen by intent, springs where motion explains state, everything disableable. Hosts and agents configure motion per primitive from a closed menu — never raw milliseconds. Success means `npm run check` gains a motion gate, all 154 primitives honor tokens + reduced motion, six components move on real springs, and no new dependency ships.

What this is not: per-component duration/easing props (the bespoke-decisions smell Atlassian warns against), a new look, or a change to critically-damped character (no overshoot — brand choice, not a gap).

## Motion model (three layers, unchanged shape)

1. **Global tokens** (`tokens/tokens.css`): `--motion-duration-snap/base/soft/lazy/exit`, eases, lag, stagger. Reduced motion zeroes them unless `data-motion="full"`. Unchanged.
2. **Closed per-component choice** (new, only where something animates): which approved behavior, never raw values.
3. **Spring engine** (`src/core/spring.ts`, `src/controls/motion.ts`, `cieo/react`, `cieo/dom`): the only JS motion allowed. No new dependency.

## What animates today (verified 2026-10-10)

CSS-only: Tooltip bubble, HoverCard card, DropdownMenuSubMenu panel (opacity fades on snap token), Spinner ring (hardcoded `0.8s` — token violation, must fix), Skeleton pulse (guarded). Everything else static. Zero primitives import the spring engine. Zero primitives take motion props.

## Spring targets (six, chosen because motion explains state there)

1. TabList/TabMenu indicator slide with lagging edge (`edges` helper).
2. Pagination digit rolls (`Digits` helper).
3. Dialog enter/exit on springs (mount + dismiss paths).
4. BottomSheet enter/exit (same shell pattern as Dialog).
5. Lightbox enter/exit (same shell pattern as Dialog).
6. Carousel scroll Buttons (`scrollTo` helper via ref).

Everything else stays CSS-or-static. A component not on this list must justify animation in review or ship static.

## Props contract (only on components that animate)

```tsx
export type MotionChoice = 'none' | 'fade' | 'rise' | 'scale';
interface MotionProps {
  motion?: boolean; // default true; false renders the end state instantly
  entering?: MotionChoice; // default per component; exiting mirrors unless overridden
  exiting?: MotionChoice;
}
```

Maps: fade → opacity on snap token; rise → opacity + 4px drift (`--motion-drift`) on base token; scale → opacity + 0.96 scale on snap token. Static components get no motion props at all — prop sprawl across 154 files is how agents learned confetti. Reduced motion (OS setting or `data-motion="reduced"`) forces end states everywhere regardless of props, in CSS *and* JS (`allowed()` / `useReducedMotion`).

## Reduced-motion rules (WCAG 2.3.3)

Every animation — CSS and spring-driven — must be disableable unless essential. Concretely: token-driven durations (zero under reduce), guarded keyframes, springs jump to end state when `allowed()` is false, `data-motion="full"` remains the only override. New gate script fails on raw durations outside `var(--motion-…)` fallbacks.

## Manifest, README, docs updates

Each touched component: manifest `constraints.motion` lists its behaviors (e.g. `["fade-on-snap", "honor-render-policy"]`), platforms entry lists new props; README gains a Motion section (what moves, which token, reduced-motion result); its `site/components/<Name>.html` props table + do/don't updated by the owning lane; pages generator re-run at integration.

## Wave plan (agent bounds)

- **Wave 1 — audit + props, 10 agents:** the 8 wave-3 families, with nav split in two (TopNav-half, SideNav-half) and stage split in two (overlays/chat-half, cards/chat-half). Each agent owns its components' tsx + manifest + README + CSS + tests + doc pages, and touches nothing else. Shared files (barrel, package.json, primitives.css, exports test, generators) stay integrator-owned.
- **Wave 2 — springs + verify, 8 agents:** 6 spring implementers (one per target above — each is real JS work with interruption/reversal handling), 1 motion-gate agent (token-grep gate + reduced-motion sweep + full `npm run check`), 1 docs-regen agent (pages rebuild, index, prev/next, banner lines for new props).
- Deferred, not dropped: 7 chat-interactive parts (need streaming/token state design), `use*` hooks (README-only per spec), composites.

## Checks

- New motion gate: no raw durations outside token fallbacks; every animated component has a reduced-motion test; springs resolve end states when disallowed.
- Existing gates stay green: `npm run check` (now including wire + pages checks), per-lane tests, full `node --test`.
- Review after each wave before the next starts; one fix wave max per wave, then adjudicate.

## Open items for the owner

- The six spring targets: swap any before planning.
- Whether `exiting` earns its prop or mirrors `entering` always (spec allows both; plan picks per component).

## Next action

Review this spec file. On approval, invoke writing-plans to create the two-wave implementation plan.
