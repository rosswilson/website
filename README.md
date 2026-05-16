# rosswilson.co.uk

Static personal site built with Astro and deployed to Cloudflare Pages.

## Local development

Requires Node 24 (see `.nvmrc`).

```bash
nvm use         # or: fnm use
npm install
npm run dev     # http://localhost:4321
```

## Build and verify

```bash
npm run verify  # astro build + smoke-check
```

## Deploy

`main` is the production branch. Push to `main` and GitHub Actions builds, smoke-checks, and deploys to Cloudflare Pages. Pull requests get preview deploys at `https://pr-<N>.rosswilson-co-uk.pages.dev`.

### Required GitHub Actions secrets

- `CLOUDFLARE_API_TOKEN` — token with `Account.Cloudflare Pages: Edit` permission, scoped to the target account.
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID.

## Updating dependencies

To reduce exposure to supply-chain attacks via freshly published malicious versions, dependency updates are filtered through a 7-day cooldown — versions newer than 7 days are not suggested. The cooldown lives in `.ncurc.json`.

```bash
npm run deps:check     # show available upgrades (respecting 7d cooldown)
npm run deps:upgrade   # apply them to package.json, then run npm install
```

After running `deps:upgrade`, always run `npm install && npm run verify` and review the diff before committing. CI uses `npm ci` so production installs are deterministic from `package-lock.json`.

## Adding a post

1. Create `src/content/blog/<slug>.md`:

   ```markdown
   ---
   title: Your Title
   date: 2026-MM-DD
   excerpt: Short summary that shows on the home page.
   cover: /content/images/YYYY/MM/some-image.jpg   # optional
   ---

   Markdown body here.
   ```

2. If the post uses images, drop them under `public/content/images/YYYY/MM/`.
3. Open a PR. Review the preview deploy. Merge to publish.
