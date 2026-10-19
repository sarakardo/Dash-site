# Dash registration fixes — review of Dash-site-FIXED-v2.zip

## Changes made
1. Added the R2 binding `DOCS` to `wrangler.jsonc`, using bucket name `dash-driver-docs` already present in the prior registration-fix package. This is required for driver document uploads. The bucket must exist in the Cloudflare account; config alone does not create it.
2. Fixed a Turnstile widget-key mismatch in `request.js`: widgets were stored under `pForm`/`dForm` but looked up using `#pForm`/`#dForm`. With Turnstile enabled this made the client unable to retrieve the token, so both forms could be blocked at final submit.
3. Left the current `worker.js`, HTML and site content otherwise unchanged.

## Checks performed
- `node --check worker.js`: passed
- `node --check request.js`: passed
- `wrangler.jsonc` JSON parse: passed
- Static inspection confirms both final submit buttons submit their respective forms to `/api/requests`.

## Not yet verified
- No live Cloudflare deployment or live D1/R2 submission test was performed.
- Ensure the R2 bucket `dash-driver-docs` exists and is attached to this Worker before deployment.
- Set `TURNSTILE_ENABLED=true` only when both `TURNSTILE_SITE_KEY` (public var) and `TURNSTILE_SECRET` (Worker secret) are correctly configured. Current package has Turnstile disabled by default.
- Verify required Worker secrets are present: `DATA_ENCRYPTION_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`; notification variables are optional.

## Manual acceptance test after deployment
1. Submit a valid passenger request and confirm a tracking ID appears and the row is visible in the admin panel.
2. Submit a driver application with four valid JPG/PNG/WebP documents under 5 MB each; confirm success and that all four documents open from the admin panel.
3. Repeat with Turnstile enabled only after configuring its site and secret keys; verify both forms pass the challenge.
4. Check `/api/health`; `ready` should be true and all required checks should pass.
