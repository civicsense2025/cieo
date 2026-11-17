# Cloudflare deploy

The docs, catalogue, studio and composites are static pages, served by a Cloudflare assets-only Worker named `cieo`. There is no server code.

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

## Checking a deploy

Open the root (it should land on the components index), a component page, the catalogue and the studio. In the browser console no request should return 404. The test `test/deploy-site.test.mjs` pins the folder contents and the link rules.
