# Dash V22 — Performance / Entity Hub / AI Crawl

Based on V21.

## Changes
- Added all 8 V21 local/intent pages to the commercial hub `replacement-driver.html`.
- Converted visual PNG assets to WebP and generated responsive WebP variants.
- Added `srcset` + `sizes` to content images.
- Removed duplicate `/site.js` tags from four pages.
- Added Cloudflare Turnstile preconnect on `contact.html` and `request.html`.
- Added explicit robots.txt Allow blocks for OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User and Claude-SearchBot while preserving wildcard Allow.
- Updated preflight required assets for WebP.
- Switched the typography stack to Persian-capable system fonts (`Noto Sans Arabic` / `Noto Sans Arabic UI`) without adding an external font request.
- Preserved V21 pages, schemas, internal entity strategy, and `.assetsignore` rules.

## Validation
`node preflight.mjs` passes all existing V18/V19/V21 checks on 38 HTML pages.
