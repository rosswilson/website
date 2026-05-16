# rosswilson.co.uk Ghost → Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a new static Astro site for rosswilson.co.uk that replaces Ghost on DigitalOcean, preserves the current Attila visual style and the existing post / about / image URLs, and is deployed to Cloudflare Pages via GitHub Actions.

**Architecture:** Astro 5 (static output) with TypeScript and content collections; Tailwind CSS for layout/typography (rebuilding the Attila look in utility classes); `@astrojs/sitemap` for `/sitemap.xml`; Cloudflare Pages for hosting; GitHub Actions for build + production deploy on `main` and preview deploys on PRs via `cloudflare/wrangler-action@v3`.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS 3.4, `@tailwindcss/typography`, `@astrojs/tailwind`, `@astrojs/sitemap`, Node 22 LTS, Cloudflare Pages (Direct Upload via Wrangler), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-05-16-rosswilson-co-uk-astro-migration-design.md`

---

## File map

Created in this plan:

| Path | Purpose |
| --- | --- |
| `package.json` | npm scripts + deps. |
| `package-lock.json` | Lockfile (npm-generated). |
| `.nvmrc` | Node 22. |
| `.gitignore` | Ignore `node_modules/`, `dist/`, `.astro/`, `.env*`. |
| `astro.config.mjs` | Astro config: site URL, trailingSlash, integrations. |
| `tailwind.config.mjs` | Tailwind config: content globs, typography plugin, theme tweaks. |
| `tsconfig.json` | Extends `astro/tsconfigs/strict`. |
| `src/env.d.ts` | Astro types. |
| `src/styles/global.css` | Tailwind directives + tiny custom rules. |
| `src/layouts/BaseLayout.astro` | `<head>`, header, footer, slot. |
| `src/layouts/PostLayout.astro` | Extends BaseLayout, prose container for post body. |
| `src/components/SiteHeader.astro` | Top nav with site name links + Twitter. |
| `src/components/SiteFooter.astro` | Footer copy + Twitter icon. |
| `src/components/HeroCover.astro` | Cover-image hero used on home + about. |
| `src/components/PostCard.astro` | Title / byline / excerpt card used on home. |
| `src/content/config.ts` | Blog collection schema. |
| `src/content/blog/tour-of-bt-dial-house.md` | Post content. |
| `src/content/blog/festive-bugs.md` | Post content. |
| `src/pages/index.astro` | `/` — home page. |
| `src/pages/about.astro` | `/about/`. |
| `src/pages/404.astro` | `/404.html`. |
| `src/pages/[slug]/index.astro` | Dynamic post route. |
| `public/content/images/2021/**` | Lifted images from current site. |
| `public/favicon.ico` | Lifted from current site. |
| `scripts/smoke-check.mjs` | Post-build assertion that expected paths exist in `dist/`. |
| `.github/workflows/deploy.yml` | Build + Cloudflare Pages deploy workflow. |
| `README.md` | Local dev / deploy / secrets instructions. |
| `docs/cutover-runbook.md` | DNS + droplet decommission steps. |

---

## Task 1: Bootstrap Astro project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `.nvmrc`
- Create: `.gitignore`
- Create: `src/pages/index.astro` (placeholder)

- [ ] **Step 1: Create `.nvmrc`**

```
22
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.env
.env.*
.DS_Store
```

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "rosswilson-co-uk",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/sitemap": "^3.2.1",
    "@astrojs/tailwind": "^5.1.4",
    "@tailwindcss/typography": "^0.5.15",
    "astro": "^5.0.0",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: Create `src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />
```

- [ ] **Step 6: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rosswilson.co.uk',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [tailwind(), sitemap()],
});
```

- [ ] **Step 7: Create placeholder `src/pages/index.astro`**

```astro
---
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Ross Wilson</title>
  </head>
  <body>
    <p>placeholder</p>
  </body>
</html>
```

- [ ] **Step 8: Install dependencies**

Run: `npm install`
Expected: `node_modules/` populated, `package-lock.json` written, no errors.

- [ ] **Step 9: Verify build succeeds**

Run: `npm run build`
Expected: `dist/index.html` exists and contains "placeholder". No build errors.

- [ ] **Step 10: Commit**

```bash
git add .gitignore .nvmrc package.json package-lock.json tsconfig.json astro.config.mjs src/env.d.ts src/pages/index.astro
git commit -m "chore: bootstrap Astro project"
```

---

## Task 2: Tailwind base styles

**Files:**
- Create: `tailwind.config.mjs`
- Create: `src/styles/global.css`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `tailwind.config.mjs`**

```js
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,md}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        ink: '#15171A',
      },
    },
  },
  plugins: [typography],
};
```

- [ ] **Step 2: Create `src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --ghost-accent-color: #15171A;
}

html {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

- [ ] **Step 3: Modify `src/pages/index.astro` to import the stylesheet and use a Tailwind class**

```astro
---
import '../styles/global.css';
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Ross Wilson</title>
  </head>
  <body class="font-sans text-ink">
    <p class="p-8 text-2xl">tailwind ok</p>
  </body>
</html>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `dist/index.html` exists; opening it (or `npm run preview`) shows the text in the system sans font at 1.5rem size with `color: #15171A`.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.mjs src/styles/global.css src/pages/index.astro
git commit -m "chore: wire up Tailwind base styles"
```

---

## Task 3: BaseLayout, SiteHeader, SiteFooter

Reproduce the chrome of the current Attila theme: top nav with site links and the Twitter handle, plus a footer with copyright + Twitter icon.

**Files:**
- Create: `src/components/SiteHeader.astro`
- Create: `src/components/SiteFooter.astro`
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/SiteHeader.astro`**

```astro
---
interface Props {
  active?: 'home' | 'about';
}
const { active } = Astro.props;
const linkClass = (key: 'home' | 'about') =>
  `px-3 py-2 text-sm uppercase tracking-wide ${
    active === key ? 'text-white' : 'text-white/70 hover:text-white'
  }`;
---
<nav class="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-4">
  <ul class="flex items-center">
    <li><a href="/" class={linkClass('home')}>Home</a></li>
    <li><a href="/about/" class={linkClass('about')}>About</a></li>
  </ul>
  <ul class="flex items-center">
    <li>
      <a
        href="https://twitter.com/rossalexwilson"
        target="_blank"
        rel="noopener"
        aria-label="Twitter"
        class="text-sm text-white/70 hover:text-white"
      >
        @rossalexwilson
      </a>
    </li>
  </ul>
</nav>
```

- [ ] **Step 2: Create `src/components/SiteFooter.astro`**

```astro
---
const year = new Date().getFullYear();
---
<footer class="border-t border-black/10 mt-16 py-8 text-sm text-ink/70">
  <div class="max-w-3xl mx-auto px-6 flex items-center justify-between">
    <span>Ross Wilson &copy; {year}</span>
    <a
      href="https://twitter.com/rossalexwilson"
      target="_blank"
      rel="noopener"
      aria-label="Twitter"
      class="hover:text-ink"
    >
      @rossalexwilson
    </a>
  </div>
</footer>
```

- [ ] **Step 3: Create `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';
import SiteFooter from '../components/SiteFooter.astro';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
}
const {
  title,
  description = 'Personal website and blog, really just my procrastination notes.',
  ogImage = '/content/images/2021/02/louis-reed-zDxlNcdUzxk-unsplash-1.jpg',
  canonical = Astro.url.href,
} = Astro.props;
const ogImageAbsolute = new URL(ogImage, Astro.site ?? Astro.url).href;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="icon" href="/favicon.ico" />
    <meta property="og:site_name" content="Ross Wilson" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImageAbsolute} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImageAbsolute} />
    <meta name="twitter:site" content="@rossalexwilson" />
  </head>
  <body class="font-sans text-ink min-h-screen flex flex-col">
    <slot name="header" />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </body>
</html>
```

The `<slot name="header" />` is filled differently on the home and about pages (with HeroCover) vs the post pages (with a slim nav-only header). Tasks 9 and 11 fill it in.

- [ ] **Step 4: Rewire `src/pages/index.astro` to use BaseLayout (placeholder body still)**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SiteHeader from '../components/SiteHeader.astro';
---
<BaseLayout title="Ross Wilson">
  <header slot="header" class="bg-ink py-12 relative">
    <SiteHeader active="home" />
    <div class="text-center text-white mt-12">
      <h1 class="text-5xl font-bold">Ross Wilson</h1>
      <p class="mt-2 text-white/80">My procrastination notes</p>
    </div>
  </header>
  <p class="max-w-3xl mx-auto px-6 py-12">placeholder — posts go here</p>
</BaseLayout>
```

- [ ] **Step 5: Verify build**

Run: `npm run build && npm run preview`
Expected: home page shows the dark header with title, tagline, Home/About nav, Twitter link top-right, and a footer with copyright + Twitter.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro src/components/SiteHeader.astro src/components/SiteFooter.astro src/pages/index.astro
git commit -m "feat: add BaseLayout, SiteHeader, SiteFooter chrome"
```

---

## Task 4: Blog content collection schema

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: Create `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().optional(),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: Verify build still passes with an empty collection**

Run: `npm run build`
Expected: build succeeds. Astro logs that the `blog` collection has 0 entries.

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat: define blog content collection schema"
```

---

## Task 5: Lift images and favicon from current site

We preserve the existing `/content/images/2021/...` paths so any external hotlink keeps working. We copy them under `public/` so Astro serves them verbatim at the same URL.

**Files:**
- Create: `public/favicon.ico`
- Create: `public/content/images/2021/02/louis-reed-zDxlNcdUzxk-unsplash-1.jpg` (and any other images referenced by either post)

- [ ] **Step 1: Identify every image URL referenced by the live site**

Run:
```bash
mkdir -p /tmp/rw-mirror
curl -sS -A "Mozilla/5.0" https://rosswilson.co.uk/ | grep -oE '/content/images/[^"]+'
curl -sS -A "Mozilla/5.0" https://rosswilson.co.uk/tour-of-bt-dial-house/ | grep -oE '/content/images/[^"]+'
curl -sS -A "Mozilla/5.0" https://rosswilson.co.uk/festive-bugs/ | grep -oE '/content/images/[^"]+'
curl -sS -A "Mozilla/5.0" https://rosswilson.co.uk/about/ | grep -oE '/content/images/[^"]+'
```

Expected: a list of `/content/images/2021/...` (and possibly other date prefixes) paths. Deduplicate.

- [ ] **Step 2: Download each unique image, preserving directory structure**

For each path `P` produced above, run:
```bash
mkdir -p "public${P%/*}"
curl -sS -A "Mozilla/5.0" "https://rosswilson.co.uk${P}" -o "public${P}"
```

Strip any `/size/wNNN/` segment from the path before saving — those are Ghost's on-the-fly resized variants and we only need the originals (e.g. `/content/images/2021/02/foo.jpg`). When in doubt, save both the resized and the original under their original paths.

Expected: every original referenced image exists under `public/content/images/...`.

- [ ] **Step 3: Lift the favicon**

Run:
```bash
curl -sS -A "Mozilla/5.0" "https://rosswilson.co.uk/favicon.ico" -o public/favicon.ico
```

Expected: `public/favicon.ico` exists and is a valid ICO file (`file public/favicon.ico` reports an icon).

- [ ] **Step 4: Verify the images survive the build**

Run: `npm run build`
Expected: `dist/content/images/2021/02/louis-reed-zDxlNcdUzxk-unsplash-1.jpg` exists. `dist/favicon.ico` exists.

- [ ] **Step 5: Commit**

```bash
git add public/
git commit -m "feat: lift images and favicon from live Ghost site"
```

---

## Task 6: First post + dynamic post route + PostLayout

Adds the "Tour of BT Dial House" Markdown file, the dynamic route that turns it into `/tour-of-bt-dial-house/`, and the `PostLayout` that wraps post bodies.

**Files:**
- Create: `src/content/blog/tour-of-bt-dial-house.md`
- Create: `src/layouts/PostLayout.astro`
- Create: `src/pages/[slug]/index.astro`

- [ ] **Step 1: Fetch and convert the post body**

Visit `https://rosswilson.co.uk/tour-of-bt-dial-house/` in a browser (or `curl` it), copy the article body, and convert to Markdown. Any HTML → Markdown converter is fine; verify the result by hand.

- [ ] **Step 2: Create `src/content/blog/tour-of-bt-dial-house.md`**

Front matter must match this exactly; the body is the converted Markdown from Step 1 (keep image URLs as `/content/images/2021/...`):

```markdown
---
title: Tour of BT Dial House
date: 2021-02-06
excerpt: >-
  Back in 2019 I toured a large BT telephone exchange in Manchester. I
  tweeted about it, but thought it'd be nice to preserve the photos and
  narrative here in a blog post.
cover: /content/images/2021/02/louis-reed-zDxlNcdUzxk-unsplash-1.jpg
---

<!-- converted body from the live site goes here -->
```

- [ ] **Step 3: Create `src/layouts/PostLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import SiteHeader from '../components/SiteHeader.astro';

interface Props {
  title: string;
  description?: string;
  date: Date;
  cover?: string;
}
const { title, description, date, cover } = Astro.props;
const dateLabel = date.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const dateISO = date.toISOString().slice(0, 10);
---
<BaseLayout title={`${title} — Ross Wilson`} description={description} ogImage={cover}>
  <header slot="header" class="relative bg-ink text-white">
    <SiteHeader />
    {cover && (
      <img
        src={cover}
        alt=""
        class="absolute inset-0 w-full h-full object-cover opacity-40"
      />
    )}
    <div class="relative max-w-3xl mx-auto px-6 py-24 text-center">
      <h1 class="text-4xl md:text-5xl font-bold">{title}</h1>
      <p class="mt-3 text-white/80 text-sm">
        By Ross Wilson on <time datetime={dateISO}>{dateLabel}</time>
      </p>
    </div>
  </header>
  <article class="prose prose-lg mx-auto px-6 py-12 max-w-3xl">
    <slot />
  </article>
</BaseLayout>
```

- [ ] **Step 4: Create `src/pages/[slug]/index.astro`**

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

interface Props {
  post: CollectionEntry<'blog'>;
}
const { post } = Astro.props;
const { Content } = await post.render();
---
<PostLayout
  title={post.data.title}
  description={post.data.excerpt}
  date={post.data.date}
  cover={post.data.cover}
>
  <Content />
</PostLayout>
```

- [ ] **Step 5: Verify build and visual output**

Run: `npm run build`
Expected: `dist/tour-of-bt-dial-house/index.html` exists.

Run: `npm run preview` and open `/tour-of-bt-dial-house/`.
Expected: the post renders with the dark header, cover image overlay, title, byline, and prose body. Images embedded in the body load (200 OK).

- [ ] **Step 6: Commit**

```bash
git add src/content/blog/tour-of-bt-dial-house.md src/layouts/PostLayout.astro src/pages/[slug]/index.astro
git commit -m "feat: render Tour of BT Dial House via dynamic post route"
```

---

## Task 7: Second post

Just the Markdown file — the dynamic route picks it up automatically.

**Files:**
- Create: `src/content/blog/festive-bugs.md`

- [ ] **Step 1: Fetch and convert the post body**

Visit `https://rosswilson.co.uk/festive-bugs/`, copy the article body, convert to Markdown, verify by hand.

- [ ] **Step 2: Create `src/content/blog/festive-bugs.md`**

```markdown
---
title: Festive Bugs And Frozen Code
date: 2019-01-30
excerpt: >-
  I was invited onto a podcast. Listen to me talk about Christmas-related
  bugs, and my opinion on code freezes.
---

<!-- converted body from the live site goes here -->
```

(No `cover` — the live site doesn't show one for this post.)

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: `dist/festive-bugs/index.html` exists.

Run: `npm run preview` and open `/festive-bugs/`.
Expected: the post renders. Header still has the dark band (no cover image overlay since no `cover` set).

- [ ] **Step 4: Commit**

```bash
git add src/content/blog/festive-bugs.md
git commit -m "feat: add Festive Bugs post"
```

---

## Task 8: PostCard component

**Files:**
- Create: `src/components/PostCard.astro`

- [ ] **Step 1: Create `src/components/PostCard.astro`**

```astro
---
interface Props {
  title: string;
  href: string;
  date: Date;
  excerpt?: string;
}
const { title, href, date, excerpt } = Astro.props;
const dateLabel = date.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const dateISO = date.toISOString().slice(0, 10);
---
<article class="border-b border-black/10 py-10 last:border-b-0">
  <h2 class="text-2xl md:text-3xl font-semibold">
    <a href={href} class="hover:underline">{title}</a>
  </h2>
  <p class="mt-2 text-sm text-ink/60">
    By Ross Wilson on <time datetime={dateISO}>{dateLabel}</time>
  </p>
  {excerpt && <p class="mt-4 text-ink/80 leading-relaxed">{excerpt}</p>}
</article>
```

- [ ] **Step 2: Verify the component builds (no consumers yet)**

Run: `npm run build`
Expected: build succeeds; Astro warns nothing.

- [ ] **Step 3: Commit**

```bash
git add src/components/PostCard.astro
git commit -m "feat: add PostCard component"
```

---

## Task 9: HeroCover and Home page

**Files:**
- Create: `src/components/HeroCover.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/HeroCover.astro`**

```astro
---
interface Props {
  title: string;
  subtitle?: string;
  image: string;
}
const { title, subtitle, image } = Astro.props;
---
<header class="relative h-[60vh] min-h-[420px] flex items-center justify-center overflow-hidden bg-ink text-white">
  <img src={image} alt="" class="absolute inset-0 w-full h-full object-cover" />
  <div class="absolute inset-0 bg-black/45"></div>
  <slot name="nav">
    <!-- consumer can override; default below -->
  </slot>
  <div class="relative z-10 text-center px-6">
    <h1 class="text-5xl md:text-7xl font-bold">{title}</h1>
    {subtitle && <p class="mt-4 text-lg md:text-xl text-white/85">{subtitle}</p>}
  </div>
</header>
```

- [ ] **Step 2: Rewrite `src/pages/index.astro` to list posts**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import SiteHeader from '../components/SiteHeader.astro';
import HeroCover from '../components/HeroCover.astro';
import PostCard from '../components/PostCard.astro';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---
<BaseLayout title="Ross Wilson">
  <HeroCover
    slot="header"
    title="Ross Wilson"
    subtitle="My procrastination notes"
    image="/content/images/2021/02/louis-reed-zDxlNcdUzxk-unsplash-1.jpg"
  >
    <SiteHeader slot="nav" active="home" />
  </HeroCover>
  <section class="max-w-3xl mx-auto px-6">
    {posts.map((post) => (
      <PostCard
        title={post.data.title}
        href={`/${post.slug}/`}
        date={post.data.date}
        excerpt={post.data.excerpt}
      />
    ))}
  </section>
</BaseLayout>
```

- [ ] **Step 3: Verify build and visual output**

Run: `npm run build && npm run preview`, open `/`.
Expected: cover image hero with "Ross Wilson" / "My procrastination notes", nav overlay at the top, two PostCards below in date-descending order, footer at bottom.

- [ ] **Step 4: Commit**

```bash
git add src/components/HeroCover.astro src/pages/index.astro
git commit -m "feat: build home page with hero cover and post list"
```

---

## Task 10: About page

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Fetch the About page body**

Run: `curl -sS -A "Mozilla/5.0" https://rosswilson.co.uk/about/ -o /tmp/rw-about.html`. Open it in a browser or read it as HTML, copy the article body, convert to Markdown / plain prose.

- [ ] **Step 2: Create `src/pages/about.astro`**

Replace the `<!-- about body -->` comment with the converted body, lightly cleaned (paragraphs as `<p>` tags, links as `<a>`):

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SiteHeader from '../components/SiteHeader.astro';
---
<BaseLayout title="About — Ross Wilson">
  <header slot="header" class="relative bg-ink text-white">
    <SiteHeader active="about" />
    <div class="relative max-w-3xl mx-auto px-6 py-24 text-center">
      <h1 class="text-4xl md:text-5xl font-bold">About</h1>
    </div>
  </header>
  <article class="prose prose-lg mx-auto px-6 py-12 max-w-3xl">
    <!-- about body -->
  </article>
</BaseLayout>
```

- [ ] **Step 3: Verify build**

Run: `npm run build && npm run preview`, open `/about/`.
Expected: header with title "About" and the prose body underneath.

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: add About page"
```

---

## Task 11: 404 page

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Create `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SiteHeader from '../components/SiteHeader.astro';
---
<BaseLayout title="Not found — Ross Wilson" description="Page not found.">
  <header slot="header" class="relative bg-ink text-white">
    <SiteHeader />
    <div class="relative max-w-3xl mx-auto px-6 py-24 text-center">
      <h1 class="text-4xl md:text-5xl font-bold">Page not found</h1>
      <p class="mt-3 text-white/80">
        The page you’re after isn’t here. <a href="/" class="underline">Go home</a>.
      </p>
    </div>
  </header>
</BaseLayout>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: `dist/404.html` exists.

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: add 404 page"
```

---

## Task 12: Sitemap

The sitemap integration was already added in Task 1's `astro.config.mjs`. Verify it works now that real pages exist.

**Files:** none

- [ ] **Step 1: Verify sitemap output**

Run: `npm run build`
Then: `cat dist/sitemap-index.xml`
Expected: an XML document that references one or more `sitemap-*.xml` files, all rooted at `https://rosswilson.co.uk/`.

Run: `cat dist/sitemap-0.xml`
Expected: an `<urlset>` containing entries for `/`, `/about/`, `/tour-of-bt-dial-house/`, `/festive-bugs/`.

- [ ] **Step 2: No commit (no files changed)**

If everything checks out, move on. If the sitemap is missing any URL, debug the `astro.config.mjs` integration before proceeding.

---

## Task 13: Smoke-check script

A post-build assertion that the expected paths exist. This is the CI gate that catches "I removed a page by accident".

**Files:**
- Create: `scripts/smoke-check.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create `scripts/smoke-check.mjs`**

```js
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist = resolve(process.cwd(), 'dist');

const required = [
  'index.html',
  '404.html',
  'about/index.html',
  'tour-of-bt-dial-house/index.html',
  'festive-bugs/index.html',
  'sitemap-index.xml',
  'favicon.ico',
  'content/images/2021/02/louis-reed-zDxlNcdUzxk-unsplash-1.jpg',
];

let failed = false;
for (const path of required) {
  const full = resolve(dist, path);
  try {
    await access(full);
    console.log(`ok   ${path}`);
  } catch {
    console.error(`MISS ${path}`);
    failed = true;
  }
}

if (failed) {
  console.error('\nSmoke check failed: one or more required paths are missing from dist/.');
  process.exit(1);
}
console.log('\nSmoke check passed.');
```

- [ ] **Step 2: Add the npm script**

Modify `package.json` `scripts` to add:

```json
"smoke": "node scripts/smoke-check.mjs",
"verify": "npm run build && npm run smoke"
```

The final `scripts` block should look like:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "smoke": "node scripts/smoke-check.mjs",
  "verify": "npm run build && npm run smoke"
}
```

- [ ] **Step 3: Verify the script passes against the current build**

Run: `npm run verify`
Expected: build succeeds, then smoke check logs `ok` for every required path and exits 0.

- [ ] **Step 4: Verify the script fails when something is missing**

Run: `rm dist/about/index.html && node scripts/smoke-check.mjs ; echo "exit=$?"`
Expected: `MISS about/index.html` printed, exit code non-zero.
Then restore with: `npm run build`.

- [ ] **Step 5: Commit**

```bash
git add scripts/smoke-check.mjs package.json
git commit -m "ci: add smoke-check script for required dist paths"
```

---

## Task 14: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read
  deployments: write
  pull-requests: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm run smoke
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist
          retention-days: 7

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: >
            pages deploy dist
            --project-name=rosswilson-co-uk
            ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' && '--branch=main' || format('--branch=pr-{0}', github.event.pull_request.number) }}
```

- [ ] **Step 2: Verify the workflow file is valid YAML**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"`
Expected: no output, exit 0.

(Note: actual end-to-end verification happens after the repo is pushed to GitHub with the two required secrets configured — see README in Task 15.)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GHA build + Cloudflare Pages deploy workflow"
```

---

## Task 15: README and cutover runbook

**Files:**
- Create: `README.md`
- Create: `docs/cutover-runbook.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# rosswilson.co.uk

Static personal site built with Astro and deployed to Cloudflare Pages.

## Local development

Requires Node 22 (see `.nvmrc`).

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
```

- [ ] **Step 2: Create `docs/cutover-runbook.md`**

```markdown
# Cutover runbook: DigitalOcean Ghost → Cloudflare Pages

Follow once, in order. Each step is independently verifiable.

## 1. Cloudflare Pages project

1. In the Cloudflare dashboard, create a new Pages project named `rosswilson-co-uk` with no git integration (we deploy via Wrangler from GHA).
2. Create an API token with `Account.Cloudflare Pages: Edit` scoped to your account.
3. In the GitHub repo settings, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as Actions secrets.
4. Push `main`. Confirm the GHA `Deploy` workflow succeeds.
5. Visit the assigned `https://rosswilson-co-uk.pages.dev/` URL and verify:
   - `/`, `/about/`, `/tour-of-bt-dial-house/`, `/festive-bugs/` all render.
   - A sample image (e.g. `/content/images/2021/02/louis-reed-zDxlNcdUzxk-unsplash-1.jpg`) returns 200.
   - `/sitemap-index.xml` returns XML.
   - A nonsense URL (`/does-not-exist/`) shows the custom 404 page.

## 2. DNS

If the domain isn't already on Cloudflare DNS, transfer it first (registrar → "use Cloudflare nameservers"; wait for propagation).

Once on Cloudflare:

1. In the Pages project, add `rosswilson.co.uk` as a custom domain. Cloudflare auto-creates the apex CNAME flattening record.
2. Optionally add `www.rosswilson.co.uk` redirecting to the apex.
3. Wait for the TLS cert to provision (usually < 5 min).
4. Re-run the URL checks above on `https://rosswilson.co.uk/`.

## 3. Droplet decommission

Do this only after the live domain serves the new site and you've used it for at least a day with no surprises.

1. Snapshot the DO droplet (cheap insurance — you can restore for a few weeks if needed).
2. Take a final Ghost content export from the admin panel (`Settings → Labs → Export`) and save it next to the snapshot, just in case.
3. Destroy the droplet.
4. Cancel any unused floating IPs, volumes, or scheduled backups.
5. Confirm the next DO billing cycle reflects the change.
```

- [ ] **Step 3: Commit**

```bash
git add README.md docs/cutover-runbook.md
git commit -m "docs: add README and cutover runbook"
```

---

## Final verification

- [ ] **Step 1: Run the full local verification**

```bash
rm -rf dist .astro
npm run verify
```

Expected: build succeeds; smoke-check passes; exit 0.

- [ ] **Step 2: Open every page in `npm run preview` and eyeball it**

Pages to verify:
- `/` — hero cover, two post cards, footer.
- `/about/` — header, prose body, footer.
- `/tour-of-bt-dial-house/` — header with cover overlay, byline, prose body, images inline.
- `/festive-bugs/` — header without cover overlay (no cover set), byline, prose body.
- `/404.html` — header, "Page not found", home link.

- [ ] **Step 3: Confirm `git status` is clean and `git log` reads cleanly**

Run: `git log --oneline`
Expected: ~15 focused commits, one per task.

- [ ] **Step 4: Hand off to the cutover runbook**

At this point implementation is done. Follow `docs/cutover-runbook.md` to push the repo, deploy, switch DNS, and destroy the droplet.
