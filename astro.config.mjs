import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const blogDir = resolve('./src/content/blog');
const postLastmod = Object.fromEntries(
  readdirSync(blogDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const body = readFileSync(resolve(blogDir, file), 'utf8');
      const dateMatch = body.match(/^date:\s*(\S+)/m);
      const slug = file.replace(/\.md$/, '');
      return [slug, dateMatch ? new Date(dateMatch[1]).toISOString() : null];
    })
    .filter(([, lastmod]) => lastmod),
);

const buildLastmod = new Date().toISOString();

export default defineConfig({
  site: 'https://rosswilson.co.uk',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      serialize(item) {
        const slug = new URL(item.url).pathname.split('/').filter(Boolean).pop();
        item.lastmod = (slug && postLastmod[slug]) || buildLastmod;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
