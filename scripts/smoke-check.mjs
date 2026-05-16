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
