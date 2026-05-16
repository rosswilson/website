# Cutover runbook: DigitalOcean Ghost → Cloudflare Workers

Follow once, in order. Each step is independently verifiable.

## 1. Cloudflare Worker

1. Sign in to the Cloudflare dashboard and copy the **Account ID** from the right-hand sidebar.
2. Profile → API Tokens → Create Token (custom) with permission **Account · Workers Scripts · Edit**, scoped to your account.
3. In the GitHub repo settings, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as Actions secrets.
4. The Worker is configured in `wrangler.toml` at the repo root (name `rosswilson-co-uk`, asset directory `./dist`, `not_found_handling = "404-page"`). The first push to `main` will create it.
5. Push `main`. Confirm the GHA `Deploy` workflow succeeds.
6. Visit `https://rosswilson-co-uk.<account-subdomain>.workers.dev/` and verify:
   - `/`, `/about/`, `/tour-of-bt-dial-house/`, `/festive-bugs/` all render.
   - A sample image (e.g. `/content/images/2021/02/louis-reed-zDxlNcdUzxk-unsplash-1.jpg`) returns 200.
   - `/sitemap-index.xml` returns XML.
   - A nonsense URL (`/does-not-exist/`) shows the custom 404 page.

## 2. DNS and custom domain

If the domain isn't already on Cloudflare DNS, add it as a site first (registrar → "use Cloudflare nameservers"; wait for propagation).

Once on Cloudflare:

1. **Remove any existing apex DNS records** that point at the old origin (the DigitalOcean droplet) — Workers & Pages won't add a custom domain while a conflicting A/AAAA record exists. Zone → DNS → Records → delete the `@` A/AAAA records pointing at the droplet IP.
2. Workers & Pages → `rosswilson-co-uk` → **Settings → Domains & Routes → Add → Custom Domain** → `rosswilson.co.uk`. Cloudflare auto-creates the routing record and provisions TLS (~minutes).
3. Repeat for `www.rosswilson.co.uk`.
4. Add a Redirect Rule so one hostname is canonical (see section 3 below).
5. Re-run the URL checks above on `https://rosswilson.co.uk/`.

## 3. www → apex redirect

The codebase treats `https://rosswilson.co.uk` as canonical (`site:` in `astro.config.mjs`, canonical/og-url meta tags). Make `www` redirect to it.

In the Cloudflare dashboard, zone `rosswilson.co.uk` → **Rules → Redirect Rules → Create rule**:

- Name: `www → apex`
- Field: **Hostname**, Operator: **equals**, Value: `www.rosswilson.co.uk`
- Then: **Dynamic** redirect
  - Expression: `concat("https://rosswilson.co.uk", http.request.uri.path)`
  - Status code: **301 (Permanent)**
  - Preserve query string: **on**

Save and deploy. Verify:

```bash
curl -sI https://www.rosswilson.co.uk/about/ | grep -iE 'HTTP|location'
# Expect: HTTP/2 301 ... and Location: https://rosswilson.co.uk/about/
```

## 4. Droplet decommission

Do this only after the live domain serves the new site and you've used it for at least a day with no surprises.

1. Snapshot the DO droplet (cheap insurance — you can restore for a few weeks if needed).
2. Take a final Ghost content export from the admin panel (`Settings → Labs → Export`) and save it next to the snapshot, just in case.
3. Destroy the droplet.
4. Cancel any unused floating IPs, volumes, or scheduled backups.
5. Confirm the next DO billing cycle reflects the change.
