# Cloudflare deploy

The docs, catalogue, studio and composites are static pages, served by a Cloudflare assets-only Worker named `cieo`. There is no server code.

- [What gets published](#what-gets-published)
- [Deploying](#deploying)
- [Before the first deploy](#before-the-first-deploy)
- [Checking a deploy](#checking-a-deploy)

## What gets published

`npm run deploy:build` writes `.deploy/` (not committed). It starts at the entry pages listed in `scripts/build-deploy.mjs` and copies only the files they reference, at the same repo paths, so every relative link keeps working. A reference to a file that does not exist fails the build and names the page. Source, tests and `node_modules` are never published. `/` redirects to `/site/components/`.

## Deploying

Deploy from a clean checkout at `origin/main`, after the pull request is merged:

1. `git fetch && git status` shows nothing to commit and `main` equals `origin/main`.
2. `npm ci` if the lockfile changed.
3. `npm run deploy`, which builds the folder and runs the pinned `wrangler@4.160.0`.

`wrangler` is pinned in the script instead of installed, so the package keeps no deploy-time dependency. Move the pin when you have vetted a release at least a week old.

## Before the first deploy

1. Sign in once: `npx wrangler@4.160.0 login`.
2. Pick the account, and the domain if the site is not served on the default `workers.dev` address.
3. This repository has a Vercel preview project (`cieo-catalogue-ui-review`) linked to Git. Disconnect it before merging a move to Cloudflare, so Vercel does not keep deploying beside it.

## Checking a deploy

Open the root (it should land on the components index), a component page, the catalogue and the studio. In the browser console no request should return 404. The test `test/deploy-site.test.mjs` pins the folder contents and the link rules.
