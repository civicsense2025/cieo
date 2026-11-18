# Cloudflare deploy

The docs, catalogue, studio and composites are static pages, served by a Cloudflare assets-only Worker named `cieo`. There is no server code. It is live on the account's `workers.dev` address for the `cieo` Worker (first deployed 2026-11-17 from `d426cd8`); `npx wrangler@4.160.0 deployments list --name cieo` shows the current version and `npm run deploy` prints the address.

- [What gets published](#what-gets-published)
- [Deploying](#deploying)
- [Before the first deploy](#before-the-first-deploy)
- [Checking a deploy](#checking-a-deploy)

## What gets published

`npm run deploy:build` writes `.deploy/` (not committed). It starts at the entry pages listed in `scripts/build-deploy.mjs` and copies only the files they reference, at the same repo paths, so every relative link keeps working. A reference to a file that does not exist fails the build and names the page. Source, tests and `node_modules` are never published. `/` redirects to `/site/components/`.

## Deploying

`npm run deploy` refuses unless the tree is clean and `main` equals `origin/main`, so a feature branch or stale checkout can never publish. Then it builds the folder and runs the pinned `wrangler@4.160.0`.

1. Merge the pull request.
2. `git switch main && git pull`, and `npm ci` if the lockfile changed.
3. `npm run deploy`.

`wrangler` is pinned in `scripts/deploy.mjs` instead of installed, so the package keeps no deploy-time dependency. Move the pin when you have vetted a release at least a week old.

The folder also gets a root `index.html` and a `404.html` of its own. The build refuses to rebuild into any folder that could hold source, and a link whose letter case differs from the file name fails, because Cloudflare is case-sensitive.

## Before the first deploy

1. Sign in once: `npx wrangler@4.160.0 login`.
2. Pick the account, and the domain if the site is not served on the default `workers.dev` address.
3. This repository has a Vercel preview project (`cieo-catalogue-ui-review`) linked to Git. Disconnect it before merging a move to Cloudflare, so Vercel does not keep deploying beside it.

## URLs

Cloudflare serves clean URLs: `/site/components/Toast.html` redirects to `/site/components/Toast`, and folder pages end in a slash. Relative links in the pages keep working from either form. Links must match the file's letter case exactly.

## The contact form

`/api/contact` is the only path that runs code (`worker/contact.js`); everything else is served as static assets. A message is validated, checked for abuse, rate limited to three per minute per address, and sent through Resend. The form refuses other origins, oversized bodies and line breaks in names, ignores messages with a filled hidden field or a fill time under two seconds, and never logs a message or a key.

Set up once, by the owner:

1. **Secrets** (never committed): `npx wrangler@4.160.0 secret put RESEND_API_KEY` and `npx wrangler@4.160.0 secret put CONTACT_TO` (the inbox that receives messages). Check first with `npx wrangler@4.160.0 secret list`.
2. **Sender**: until a domain is verified with Resend, the sandbox sender is used and Resend delivers only to the account owner's own address, so set `CONTACT_TO` to that address for testing. For real use, verify the sending domain in Resend (it asks for DNS records), then set `CONTACT_FROM` in `wrangler.jsonc` under `vars` to something like `Cieo <hello@your-domain>`.
3. **Subdomain**: add the Cieo subdomain to the domain's DNS in the same Cloudflare account, then attach it to the Worker as a custom domain in the dashboard (Workers, `cieo`, Settings, Domains).

Until step 1 is done the form answers "Messages are not being accepted right now" instead of failing silently.

## Checking a deploy

Open the root (it should land on the components index), a component page, the catalogue and the studio. In the browser console no request should return 404. The test `test/deploy-site.test.mjs` pins the folder contents and the link rules.
