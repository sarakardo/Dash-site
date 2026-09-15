# V23 — Final Baseline: Article dates + Bing/IndexNow

One-time foundation hardening on top of V22.

## Changes
- Added `datePublished` to every Article/BlogPosting JSON-LD object that was missing it, using the page's existing published/modified date as the conservative first-publication date because no separate historical publication timestamp was available in the repository.
- Preserved existing `dateModified` values.
- Added an IndexNow ownership key at the site root.
- Added `indexnow-submit.mjs` for manual post-deploy submissions.
- Added `.github/workflows/indexnow.yml` to notify IndexNow automatically after pushes to `main`, after waiting for the public site to respond.
- Added `BING-INDEXNOW-SETUP.md` for the one-time Bing Webmaster Tools verification and sitemap submission.
- Kept the existing `sitemap.xml` and `robots.txt` unchanged.
- Did NOT add a physical `address` to Organization because no verified public business address was available in the project data.
- Did NOT add a Google Business Profile URL to `sameAs` because no verified public profile URL was available; no URL was guessed.

## Baseline policy
After V23, routine work should be content publishing and measured SEO iteration. Core infrastructure should only change for a real bug, security issue, platform change, or data-backed improvement.
