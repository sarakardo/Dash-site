import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('.', import.meta.url).pathname;
const files = fs.readdirSync(root);
const required = ['index.html','request.html','driver.html','admin.html','admin.js','request.js','site.js','worker.js','schema.sql','wrangler.jsonc','_headers','robots.txt','sitemap.xml','favicon.webp','hero-dash-home.webp','hero-dash-home-480.webp','hero-dash-home-768.webp','hero-dash-home-1200.webp'];
const missing = required.filter(f => !fs.existsSync(path.join(root,f)));
if (missing.length) throw new Error(`Missing required files: ${missing.join(', ')}`);
for (const f of ['worker.js','request.js','admin.js','site.js']) {
  const r = spawnSync(process.execPath,['--check',path.join(root,f)],{encoding:'utf8'});
  if (r.status !== 0) throw new Error(`${f}: ${r.stderr}`);
}
const htmls = files.filter(f => f.endsWith('.html'));
for (const f of htmls) {
  const text = fs.readFileSync(path.join(root,f),'utf8');
  if (!/<meta[^>]+name=["']viewport["']/i.test(text)) throw new Error(`${f}: missing viewport`);
}
for (const f of htmls) {
  const text = fs.readFileSync(path.join(root,f),'utf8');
  const srcs = [...text.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1]).filter(x=>x.startsWith('/'));
  for (const ref of srcs) {
    if (ref.startsWith('/api/') || ref.startsWith('/#') || ref === '/') continue;
    const clean = ref.split('?')[0].split('#')[0].replace(/^\//,'');
    if (clean && !fs.existsSync(path.join(root,clean))) throw new Error(`${f}: missing local reference ${ref}`);
  }
}
const sitemap = fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
if (sitemap.includes('/request.html') || sitemap.includes('/admin.html')) throw new Error('Noindex/admin URL present in sitemap');
const assetsIgnore=fs.readFileSync(path.join(root,'.assetsignore'),'utf8');
const ignored = new Set(assetsIgnore.split(/\r?\n/).map(x=>x.trim()).filter(Boolean));
if (!ignored.has('SEO-KEYWORD-MAP-2026.md')) throw new Error('SEO strategy file is not hidden by .assetsignore');
for (const hidden of ['worker.js','schema.sql','wrangler.jsonc','package.json','package-lock.json','README-DEPLOY.md','preflight.mjs','build_articles.py','ARTICLE-WORKFLOW.md']) if (!ignored.has(hidden)) throw new Error(`.assetsignore missing server/config file ${hidden}`);
for (const client of ['admin.js','request.js','contact.js','site.js','_headers']) if (ignored.has(client)) throw new Error(`.assetsignore incorrectly hides client/runtime asset ${client}`);
const canonicalPages=htmls.filter(f=>!['404.html','admin.html','request.html'].includes(f));
for (const f of canonicalPages){const text=fs.readFileSync(path.join(root,f),'utf8'); if (text.includes('small-bonus-efaf.hesesh0610.workers.dev')) throw new Error(`${f}: legacy Worker URL remains in public HTML`);}
if (!fs.existsSync(path.join(root,'terms.html')) || !fs.existsSync(path.join(root,'privacy.html'))) throw new Error('Legal pages missing');
if (!fs.readFileSync(path.join(root,'_headers'),'utf8').includes('challenges.cloudflare.com')) throw new Error('Turnstile CSP missing');
if (!fs.readFileSync(path.join(root,'_headers'),'utf8').includes('Strict-Transport-Security: max-age=63072000; includeSubDomains; preload')) throw new Error('HSTS header missing');

const indexText=fs.readFileSync(path.join(root,'index.html'),'utf8');
const indexJsonLd=(indexText.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>/gi)||[]).length;
if(indexJsonLd!==1) throw new Error(`index.html: expected one JSON-LD block, found ${indexJsonLd}`);
const workerText=fs.readFileSync(path.join(root,'worker.js'),'utf8');
for(const marker of ['BALE_BOT_TOKEN','BALE_CHAT_ID','tapi.bale.ai','notifyRequest']) if(!workerText.includes(marker)) throw new Error(`Bale notification integration missing ${marker}`);
// V14 SEO regression checks
const ignoreText = fs.readFileSync(path.join(root,'.assetsignore'),'utf8');
const ignoreSet = new Set(ignoreText.split(/\r?\n/).map(x=>x.trim()).filter(Boolean));
for (const clientAsset of ['site.js','request.js','admin.js','contact.js','_headers']) {
  if (ignoreSet.has(clientAsset)) throw new Error(`Client/runtime asset is hidden by .assetsignore: ${clientAsset}`);
}
for (const redirected of ['after-surgery-driving.html','elderly-driver-safety.html','fatigue-and-driving.html','personal-car-replacement-driver.html','illness.html']) {
  if (sitemap.includes('/'+redirected)) throw new Error(`Redirected URL remains in sitemap: ${redirected}`);
}
const redirectedSet = new Set(['after-surgery-driving.html','elderly-driver-safety.html','fatigue-and-driving.html','personal-car-replacement-driver.html','illness.html']);
for (const f of htmls) {
  const text=fs.readFileSync(path.join(root,f),'utf8');
  const robots=(text.match(/<meta[^>]+name=["']robots["'][^>]*>/i)||[''])[0];
  if (!/noindex/i.test(robots) && !redirectedSet.has(f)) {
    const h1=(text.match(/<h1\b/gi)||[]).length;
    if (h1!==1) throw new Error(`${f}: expected exactly one h1, found ${h1}`);
    if (!/<meta[^>]+property=["']og:image["']/i.test(text)) throw new Error(`${f}: missing og:image`);
  }
}
for (const f of ['about.html','faq.html']) {
  const text=fs.readFileSync(path.join(root,f),'utf8');
  if (!/<body\b/i.test(text) || !/<\/body>/i.test(text)) throw new Error(`${f}: malformed body element`);
}
console.log(`PASS: ${htmls.length} HTML pages checked; required assets exist; JS syntax valid; local references resolve.`);

// V18 regression checks for AEO/Cloudflare architecture.
const legacyV18=['after-surgery-driving.html','elderly-driver-safety.html','fatigue-and-driving.html','personal-car-replacement-driver.html','illness.html'];
for(const f of legacyV18){ if(!ignoreSet.has(f)) throw new Error(`legacy redirect asset is public: ${f}`); }
const aeoPages=['driving-while-sick.html','after-surgery.html','post-discharge-driving.html','medication-and-driving.html','fatigue-driving.html','elderly-driver.html','parents-and-driving.html','drinking-and-driving.html','safe-return-home.html','night-driving-safety.html','when-not-to-drive.html','replacement-driver.html'];
for(const f of aeoPages){ const t=fs.readFileSync(path.join(root,f),'utf8'); const n=(t.match(/class=\"answer-first\"/g)||[]).length; if(n!==1) throw new Error(`AEO answer-first block count is ${n} in ${f}`); }
const idx=fs.readFileSync(path.join(root,'index.html'),'utf8'); if((idx.match(/application\/ld\+json/g)||[]).length!==1) throw new Error('index.html must contain exactly one JSON-LD block');
console.log('V18 AEO/Cloudflare regression checks passed.');

const faqText=fs.readFileSync(path.join(root,'faq.html'),'utf8'); const faqScripts=[...faqText.matchAll(/<script[^>]+type=[\"']application\/ld\+json[\"'][^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]); const faqJson=faqScripts.map(x=>JSON.parse(x)); const faqTypes=faqJson.flatMap(x=>Array.isArray(x?.['@graph'])?x['@graph']:[x]).filter(x=>x && x['@type']==='FAQPage'); if(faqTypes.length!==1) throw new Error('faq.html must contain exactly one FAQPage schema'); const faqMain=faqTypes[0].mainEntity; if(!Array.isArray(faqMain) || faqMain.length<5 || faqMain.some(q=>q['@type']!=='Question' || !q.name || !q.acceptedAnswer || q.acceptedAnswer['@type']!=='Answer' || !q.acceptedAnswer.text)) throw new Error('FAQPage schema must contain complete visible Question/Answer pairs');
const wh=fs.readFileSync(path.join(root,'_headers'),'utf8'); if(!wh.includes('small-bonus-efaf.hesesh0610.workers.dev/*')) throw new Error('workers.dev noindex host rule missing');
const wrangler=JSON.parse(fs.readFileSync(path.join(root,'wrangler.jsonc'),'utf8')); if(JSON.stringify(wrangler.assets?.run_worker_first)!==JSON.stringify(['/api/*'])) throw new Error('run_worker_first must remain selective for API only');
for(const f of aeoPages){ const tt=fs.readFileSync(path.join(root,f),'utf8'); if(!/class="answer-first"/i.test(tt)) throw new Error(`${f}: answer-first block missing`); }
console.log('V18 Deep AEO/Cloudflare checks passed.');

// V19: BreadcrumbList schema must exist on every content page that shows a visible breadcrumb.
const breadcrumbPages=['about.html','faq.html','replacement-driver.html','after-surgery.html','cinema-vs-reality.html','drinking-and-driving.html','driving-while-sick.html','elderly-driver.html','fatigue-driving.html','medication-and-driving.html','tehran-traffic-culture.html','night-driving-safety.html','parents-and-driving.html','post-discharge-driving.html','safe-return-home.html','when-not-to-drive.html'];
for(const f of breadcrumbPages){
  const t=fs.readFileSync(path.join(root,f),'utf8');
  if(!/"@type":"BreadcrumbList"/.test(t)) throw new Error(`${f}: BreadcrumbList schema missing`);
}
console.log('V19 BreadcrumbList checks passed.');

// V21 Entity / local-intent content checks
const v21Pages=['replacement-driver-tehran.html','personal-car-driver-tehran.html','after-surgery-driver-tehran.html','elderly-driver-tehran.html','driving-after-anesthesia.html','driving-after-cosmetic-surgery.html','driving-after-rhinoplasty.html','driving-after-blepharoplasty.html'];
for(const f of v21Pages){ const t=fs.readFileSync(path.join(root,f),'utf8'); if(!/class="answer-first"/i.test(t)) throw new Error(`${f}: answer-first block missing`); if(!/"@type":"BreadcrumbList"/.test(t)) throw new Error(`${f}: BreadcrumbList schema missing`); if(!/https:\/\/dashh\.ir\//.test(t)) throw new Error(`${f}: canonical domain missing`); if(!/href="\/request\.html"/.test(t)) throw new Error(`${f}: request CTA missing`); }
for(const f of v21Pages){ if(!sitemap.includes('/'+f)) throw new Error(`sitemap missing V21 page ${f}`); }
if(!fs.readFileSync(path.join(root,'llms.txt'),'utf8').includes('replacement-driver-tehran.html')) throw new Error('llms.txt missing V21 local entity pages');
if(!ignoreSet.has('ENTITY-PRESENCE-PLAN-2026.md') || !ignoreSet.has('ENTITY-SUBMISSION-PACK-2026.md')) throw new Error('Internal entity docs must stay hidden');
console.log('V21 Entity/local-intent checks passed.');
