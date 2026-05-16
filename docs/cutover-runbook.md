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
