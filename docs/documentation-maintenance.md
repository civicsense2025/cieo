# Cieo documentation maintenance

## Contents

- [Owners and scope](#owners-and-scope)
- [Same PR checks](#same-pr-checks)
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
