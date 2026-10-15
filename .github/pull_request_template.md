Describe the concrete API change and compatibility defaults.

- Documentation: update the owner in `docs/source-map.json` in this PR.
- Verification: candidate revision/dirty scope, commands, results and limitations.
- Consumer impact: identify callers and pending native/web acceptance.

Run `ruby scripts/check-documentation.rb --self-test` and the base-SHA impact
check. After merge inspect the actual immutable resulting revision and its
read-only documentation job. Follow `docs/documentation-maintenance.md`.
