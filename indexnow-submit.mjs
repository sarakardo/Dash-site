#!/usr/bin/env node
/**
 * Dash IndexNow publisher.
 *
 * Usage:
 *   node indexnow-submit.mjs article.html
 *   node indexnow-submit.mjs article-1.html article-2.html
 *   node indexnow-submit.mjs --dry-run article.html
 *
 * Run after the Cloudflare deployment has completed.
 */
import { execSync } from 'node:child_process';

const HOST = 'dashh.ir';
const KEY = 'af7545d6f221d8e983059f6bdc3af3e9';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const BASE = `https://${HOST}/`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

function gitChanged() {
  try {
    return execSync('git diff --name-only HEAD^ HEAD', { encoding: 'utf8' })
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    // This is expected when run outside a Git repository or without a parent commit.
    return [];
  }
}

function normalizePath(value) {
  return value
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\//, '');
}

function publicHtmlUrls(paths) {
  return [...new Set(
    paths
      .map(normalizePath)
      .filter(p => /(^|\/)\w[\w-]*\.html$/i.test(p))
      .filter(p => !['admin.html', '404.html'].includes(p))
      .filter(p => !p.includes('/'))
      .map(p => BASE + p)
  )];
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const explicit = args.filter(arg => arg !== '--dry-run');
const changed = explicit.length ? explicit : gitChanged();
const urls = publicHtmlUrls(changed);

if (!urls.length) {
  console.log('No public root HTML URLs to submit.');
  process.exit(0);
}

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls
};

console.log(urls.join('\n'));

if (dryRun) {
  console.log('\nDry run: no request sent to IndexNow.');
  process.exit(0);
}

const response = await fetch(INDEXNOW_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  body: JSON.stringify(payload)
});

console.log(`IndexNow response: ${response.status}`);

// IndexNow commonly returns 200 or 202 for accepted submissions.
if (!response.ok && response.status !== 202) {
  const text = await response.text().catch(() => '');
  if (text) console.error(text);
  process.exit(1);
}
