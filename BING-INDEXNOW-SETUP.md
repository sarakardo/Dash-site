# Bing Webmaster Tools + IndexNow — Dash V22

## Already included
- `sitemap.xml` remains the canonical sitemap.
- IndexNow key file: `/af7545d6f221d8e983059f6bdc3af3e9.txt`
- `indexnow-submit.mjs` submits changed public HTML URLs to the official IndexNow API.

## One-time Bing setup
1. Add and verify `https://dashh.ir/` in Bing Webmaster Tools.
2. Submit `https://dashh.ir/sitemap.xml`.
3. Check IndexNow submissions in Bing Webmaster Tools.

## New Chkhabar article workflow
After the GitHub/Cloudflare deployment has completed:

```bash
node indexnow-submit.mjs chekhabar-new-article.html
```

Multiple URLs:

```bash
node indexnow-submit.mjs article-1.html article-2.html
```

The key file is intentionally public; IndexNow uses it to verify ownership of submitted URLs.

IndexNow notifies search engines about URL changes; it does not guarantee crawling or indexing.
