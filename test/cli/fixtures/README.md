# CLI end-to-end fixtures

Three minimal, real project shapes that the installer CLI is run against. The
end-to-end test copies one fixture into a temporary directory, runs
`npm install <cieo-tarball>` there, and then exercises the CLI. No fixture
declares a `cieo` dependency: the tarball is installed explicitly by the test,
so the fixtures stay honest about what the installer has to add.

| Fixture | Shape | Jobs it proves |
| --- | --- | --- |
| `vite-react/` | Vite + React + TypeScript app (`index.html`, `src/main.tsx`, `vite.config.ts`) | Detection and wiring of a bundler-driven React app. `src/main.tsx` imports `./App` extensionless, so the fixture also catches any tooling that rewrites imports to `.js`. |
| `next-app/` | Next.js App Router shape (`next.config.mjs`, `app/layout.tsx`, `app/page.tsx`) | Detection of the Next path. No `next` package is declared on purpose: the fixture typechecks with React types alone and never builds. |
| `static-html/` | A single static `index.html`, no `package.json` | The plain-HTML path, where there is no manifest to edit. |

Every fixture installs its own dependencies per run; the root `package.json`
devDependencies carry the same pins to warm the npm cache so the E2E runs do
not re-download tarballs on every test.

## Version pins

Picked on 2026-10-13 (UTC) under the ≥7-day rule: take the newest release whose
publish date is at least 7 days before the pick, so a very fresh publish cannot
break the suite. Verified with `npm view <pkg> version` and
`npm view <pkg> time --json`.

| Package | Pin | Published (UTC) | Age at pick |
| --- | --- | --- | --- |
| `vite` | `8.3.3` | 2026-10-06T04:10:19Z | 7d 5h |
| `@vitejs/plugin-react` | `6.1.2` | 2026-10-05T10:08:27Z | 7d 23h |
| `@types/react-dom` | `19.1.11` | 2025-10-01T17:34:27Z | 377d |

Why `@types/react-dom@19.1.11` and not the newest release: `19.3.0`
(2026-09-09) declares `peerDependencies: { "@types/react": "^19.3.0" }`, and
`19.2.x` declares `^19.2.0`; both conflict with `@types/react@19.0.4`, which
the fixtures and the root manifest pin. `19.1.11` is the newest release whose
peer range is `^19.0.0`, and its peer resolves to the existing
`@types/react@19.0.4` with no duplicate copy. Verified both ways with npm
before choosing.

The other pins (`react@19.3.0`, `react-dom@19.3.0`, `@types/react@19.0.4`,
`typescript@6.0.3`) match the root devDependencies and are not re-picked here.

## Exact pins only

Every version in these fixtures is an exact pin — no `^`, no `~`. Refreshing a
pin is a deliberate change: bump the number, re-run the date check above,
update this table, and run the CLI end-to-end test. Never widen a pin to a
range to resolve a conflict; pick a version that actually satisfies the peers.
