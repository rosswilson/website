# rosswilson.co.uk — Ghost → Astro migration

**Status:** Approved design, ready for implementation plan
**Date:** 2026-05-16

## Goal

Replace the Ghost-on-DigitalOcean deployment of rosswilson.co.uk with a statically generated Astro site, deployed to Cloudflare Pages via GitHub Actions. Visually preserve the current Attila-theme look. Eliminate the ~£60/year DigitalOcean droplet cost.

## Constraints and current state

- Current site: Ghost 5.105 on a DigitalOcean droplet, Attila theme.
- Content: 2 posts (`/tour-of-bt-dial-house/`, `/festive-bugs/`) and an `/about/` page. Last post Feb 2021.
- No live use of comments, members, search, webmentions, tags, or pagination.
- The new working directory `/Users/rosswilson/Projects/rosswilson.co.uk/` is a fresh git repo with no commits.

## URLs to preserve

- `/`
- `/about/`
- `/tour-of-bt-dial-house/`
- `/festive-bugs/`
- All image paths currently under `/content/images/2021/...` (so existing hotlinks keep working).

URLs that may be dropped: `/rss/`, `/tag/*`, `/author/*`, `/webmentions/receive/`, `/sitemap*.xml` (replaced by Astro-generated `/sitemap.xml`).

## Architecture

- **Astro 5**, static output (`output: 'static'`, the default).
- **TypeScript** throughout.
- **Astro content collections** for blog posts.
- **Tailwind CSS** via `@astrojs/tailwind`, plus `@tailwindcss/typography` for post prose.
- **`@astrojs/sitemap`** for `/sitemap.xml`.
- `trailingSlash: 'always'` so generated URLs match the current site's shape.
- Static images copied verbatim under `public/content/images/2021/...` to preserve hotlink paths.

## Repo layout

```
rosswilson.co.uk/
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
├── tsconfig.json
├── .nvmrc
├── .github/workflows/deploy.yml
├── public/
│   ├── content/images/2021/…         # lifted from current site
│   ├── favicon.ico
│   └── og/default.jpg                # reused OG image from current site
├── src/
│   ├── content/
│   │   ├── config.ts                 # blog collection schema
│   │   └── blog/
│   │       ├── tour-of-bt-dial-house.md
│   │       └── festive-bugs.md
│   ├── layouts/
│   │   ├── BaseLayout.astro          # <head>, header, footer
│   │   └── PostLayout.astro          # extends BaseLayout, prose container
│   ├── components/
│   │   ├── SiteHeader.astro
│   │   ├── SiteFooter.astro
│   │   ├── HeroCover.astro
│   │   └── PostCard.astro
│   ├── pages/
│   │   ├── index.astro               # → /
│   │   ├── about.astro               # → /about/
│   │   ├── 404.astro                 # → /404.html
│   │   └── [slug]/index.astro        # → /tour-of-bt-dial-house/, /festive-bugs/
│   └── styles/global.css             # Tailwind base + small overrides
└── docs/superpowers/specs/…          # this spec and future ones
```

Post slugs derive from Markdown filenames. `src/pages/[slug]/index.astro` uses `getStaticPaths` over the `blog` collection, so adding a new Markdown file becomes a new top-level route with no extra config.

## Content schema (`src/content/config.ts`)

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().optional(),
    cover: z.string().optional(),     // path under /content/images/...
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

Drafts are excluded from the production build.

## Content migration

The 2 posts and the About page are hand-ported from the live site to Markdown:

- For each post, fetch the rendered HTML from the live site, convert the article body to Markdown (manually or with a one-shot tool), and verify images render from the preserved `/content/images/2021/...` paths.
- About page becomes `src/pages/about.astro` with its body inlined as Astro component markup (it's a single short page).
- Front matter for each post:
  - `tour-of-bt-dial-house.md`: title "Tour of BT Dial House", date 2021-02-06.
  - `festive-bugs.md`: title "Festive Bugs And Frozen Code", date 2019-01-30.

## Styling approach (rebuild Attila in Tailwind)

Tailwind utility classes plus a small `global.css` reproduce the Attila layout component-by-component:

- **Header**: full-width cover image (`HeroCover`), site name and tagline overlay; nav bar above the cover with Home / About on the left and `@rossalexwilson` Twitter link on the right.
- **Home (`/`)**: stacked `PostCard`s — title (link), byline ("By Ross Wilson on DD MMM YYYY"), excerpt. Same spacing and typographic hierarchy as the current site.
- **Post pages**: container styled with `@tailwindcss/typography` (`prose` classes), tuned to match the current font sizes, line heights, and link colours.
- **Footer**: copyright line with current year and Twitter icon. Drops the "Published with Ghost • Theme Attila" credit.
- **404**: same base layout, simple "page not found" body, link home.

System font stack to start (no web font dependency). Colours and accent values lifted from the current site so the visual result is close to identical without copying CSS.

## Build and deploy pipeline (`.github/workflows/deploy.yml`)

Single workflow, two jobs:

- **build** (runs on `push` to `main` and on `pull_request`):
  - `actions/checkout@v4`
  - `actions/setup-node@v4` with `node-version-file: .nvmrc` and npm cache
  - `npm ci`
  - `npm run build`
  - `actions/upload-artifact@v4` — upload `dist/`
- **deploy** (needs `build`):
  - `actions/download-artifact@v4`
  - `cloudflare/wrangler-action@v3` with `command: pages deploy dist --project-name rosswilson-co-uk`
  - On push to `main`: include `--branch=main` (production deploy).
  - On `pull_request`: omit `--branch=main` so Cloudflare treats it as a preview; the action posts the preview URL as a PR comment.

Required GitHub Actions secrets:
- `CLOUDFLARE_API_TOKEN` — scoped to Pages:Edit on the target account.
- `CLOUDFLARE_ACCOUNT_ID`.

Node version pinned via `.nvmrc` (Node 22 LTS).

## Cutover plan

1. Build and deploy the new site to Cloudflare Pages on its `*.pages.dev` URL. Verify `/`, `/about/`, `/tour-of-bt-dial-house/`, `/festive-bugs/`, `/404.html`, and a sample image URL.
2. Add `rosswilson.co.uk` as a Cloudflare Pages custom domain. Move DNS to Cloudflare if not already there; point the apex at the Pages project via CF's CNAME flattening.
3. Wait for the TLS cert to provision; re-verify each preserved URL on the live domain.
4. Destroy the DigitalOcean droplet and cancel DO billing.

## Explicitly out of scope

- RSS feed.
- Tag pages (`/tag/*`).
- Author pages (`/author/*`).
- Pagination (only 2 posts).
- Client-side search.
- Comments.
- Webmentions (endpoint dropped).
- Newsletter / members.
- Importing past Ghost JSON beyond the 2 published posts.

## Testing

- Local: `npm run dev`, smoke test every page and image path.
- CI: `npm run build` must pass on every push and PR.
- Pre-cutover: manually visit each preserved URL on the `*.pages.dev` deploy.
- Post-cutover: re-verify the same URLs on `rosswilson.co.uk`.
