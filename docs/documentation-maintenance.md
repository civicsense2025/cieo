# Cieo documentation maintenance

## Contents

- [Owners and scope](#owners-and-scope)
- [Same PR checks](#same-pr-checks)
- [Releasing a version](#releasing-a-version)
- [After merge and consumer upgrades](#after-merge-and-consumer-upgrades)
- [Evidence limits](#evidence-limits)

## Owners and scope

[Source map](source-map.json) assigns reusable Apple components, motion, web
controls, portable design and dependency/documentation tooling to current docs.
[Apple contracts](apple-components.md), [web controls](../README.md#controls)
and [portable design](design-system.md) own generic APIs. Consumers own branding,
interface copy, domain state, persistence, authentication and acceptance.
Recipes remain examples; source coverage does not mark them production ready.

## Same PR checks

Update the mapped owner in the same PR as a source change, including unchanged
public behavior for internal repairs. Add source/symbol links and keep current
TOCs valid. Preserve dated reports. Run the local standard-library checker:

```sh
ruby scripts/check-documentation.rb --self-test
ruby scripts/check-documentation.rb --base HEAD --worktree
# For a committed PR, use its actual 40-character base SHA instead of HEAD.
```

The [PR template](../.github/pull_request_template.md) records impact and evidence.
The checker covers Swift sources/tests and reusable web control/design sources,
not every catalogue recipe or generated site. Existing catalogue checks retain
that responsibility. No product build is performed by the docs checker.

The `swift` CI job also runs `scripts/check-swift-literals.sh`, which fails when a
SwiftUI component hard-codes styling, and proves on its fixture that it still
catches each kind of hard-coded line.

New primitives change `package.json` only through the deep `./<Name>` exports that
`scripts/wire-primitives.mjs` regenerates; hand edits there are overwritten.

`npm run test:social` is a local browser gate for the social and audio primitives:
it drives each interactive piece with and without reduced motion and fails on any
page or console error. Run it with the unit tests when those components change.

## Releasing a version

A release is one PR that changes the version in `package.json`, both versions in
`package-lock.json` and the install tag in the README, then a tag on the merged
commit. `test/release-version.test.mjs` fails when those three disagree. Before
tagging, run `npm run check`, `npm pack --dry-run`, `scripts/check-swift-literals.sh`
and `swift build && swift test`, the same gates CI runs. Tag only the merged
`origin/main` commit (`git tag -a vX.Y.Z <sha> && git push origin vX.Y.Z`); Apple
consumers pin the tag in `Package.swift`, web consumers in `package.json`.

## After merge and consumer upgrades

Verify actual merged state, immutable resulting SHA and pushed range, then review
the [read-only PR/push workflow](../.github/workflows/documentation.yml).
Reconcile concurrent edits before updating current status. Keep build, browser,
Apple device and provider receipts separate. Correct a discrepancy in a focused
PR; do not rewrite an old report as new evidence.

Consumer upgrades are separate focused changes. Record the reviewed upstream
identity and source contents, update the consumer dependency and adoption docs,
and run producer and actual consumer checks. A changed branch or old version
label does not establish provenance. Do not silently adopt each upstream push.

## Evidence limits

Workflow files are local candidates until published through the approved PR
process. No hosted run or required branch setting is claimed. The job has
read-only contents permission, disabled persisted checkout credentials, an
immutable official checkout action and no installs/network/backend mutations.
The checker validates local links, source ownership and changed-module docs;
humans review semantic accuracy. Builds do not prove runtime or release acceptance.

## Release 0.6.3

Version 0.6.3 adds the sign-in transition and recorder waveform motion. The version appears in `package.json`, the lockfile and the install line in the README; a consumer upgrade is its own change, as described above.

## Release 0.6.4

Version 0.6.4 keeps Select choices readable in right-to-left text and with reduced motion. The version appears in `package.json`, the lockfile and the install line in the README.
