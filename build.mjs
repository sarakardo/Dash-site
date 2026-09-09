import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const srcDir = path.join(root, 'content', 'articles');
const outDir = path.join(root, 'chekhabar', 'articles');
const hubPath = path.join(root, 'chekhabar', 'index.html');

if (!fs.existsSync(srcDir)) throw new Error('content/articles directory is missing.');
fs.mkdirSync(outDir, { recursive: true });

function esc(s='') {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function inline(s='') {
  let x = esc(s);
  x = x.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g, (_,a,u,t='') => `<img src="${esc(u)}" alt="${esc(a)}"${t?` title="${esc(t)}"`:''} loading="lazy">`);
  x = x.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  x = x.replace(/\[([^\]]+)\]\((\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
  x = x.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  x = x.replace(/`([^`]+)`/g, '<code>$1</code>');
  return x;
}
function mdToHtml(md) {
  const lines = md.replace(/\r/g,'').split('\n');
  const out=[]; let para=[]; let list=false;
  const flushPara=()=>{ if(para.length){ out.push(`<p>${inline(para.join(' '))}</p>`); para=[]; } };
  const closeList=()=>{ if(list){ out.push('</ul>'); list=false; } };
  for (const line of lines) {
    if (!line.trim()) { flushPara(); closeList(); continue; }
    if (line.trim()==='---') continue;
    if (/^###\s+/.test(line)) { flushPara(); closeList(); out.push(`<h3>${inline(line.replace(/^###\s+/,''))}</h3>`); continue; }
    if (/^##\s+/.test(line)) { flushPara(); closeList(); out.push(`<h2>${inline(line.replace(/^##\s+/,''))}</h2>`); continue; }
    if (/^#\s+/.test(line)) { flushPara(); closeList(); out.push(`<h1>${inline(line.replace(/^#\s+/,''))}</h1>`); continue; }
    if (/^[-*]\s+/.test(line)) { flushPara(); if(!list){out.push('<ul>'); list=true;} out.push(`<li>${inline(line.replace(/^[-*]\s+/,''))}</li>`); continue; }
    if (/^>\s?/.test(line)) { flushPara(); closeList(); out.push(`<blockquote>${inline(line.replace(/^>\s?/,''))}</blockquote>`); continue; }
    para.push(line.trim());
  }
  flushPara(); closeList(); return out.join('\n');
}
function parseFrontmatter(raw, file) {
  const m=raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if(!m) throw new Error(`Frontmatter missing in ${file}`);
  const data={};
  for(const line of m[1].split('\n')){ const i=line.indexOf(':'); if(i<0) continue; data[line.slice(0,i).trim()]=line.slice(i+1).trim(); }
  for (const key of ['title','slug','excerpt','published']) if (!data[key]) throw new Error(`${key} is missing in ${file}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) throw new Error(`Invalid slug in ${file}: ${data.slug}`);
  return {meta:data, body:m[2]};
}
function layout(meta, body, canonical, previous, next) {
  const title=esc(meta.title); const desc=esc(meta.excerpt||''); const cover=esc(meta.cover||'/assets/editorial-road.png');
  const date=meta.published;
  const articleSchema={"@context":"https://schema.org","@type":"Article",headline:meta.title,description:meta.excerpt,datePublished:date,inLanguage:"fa-IR",author:{"@type":"Organization",name:"دش"},publisher:{"@type":"Organization",name:"دش"},mainEntityOfPage:canonical,image:[cfg.siteUrl+cover]};
  const breadcrumb={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[
    {"@type":"ListItem",position:1,name:"خانه",item:cfg.siteUrl+"/"},
    {"@type":"ListItem",position:2,name:"چخبر؟",item:cfg.siteUrl+"/chekhabar/"},
    {"@type":"ListItem",position:3,name:meta.title,item:canonical}
  ]};
  const prevNext = `${previous?`<a class="article-next" href="/chekhabar/articles/${esc(previous.slug)}/"><span>مطلب بعدی</span><strong>${esc(previous.title)}</strong></a>`:''}${next?`<a class="article-next" href="/chekhabar/articles/${esc(next.slug)}/"><span>مطلب قبلی</span><strong>${esc(next.title)}</strong></a>`:''}`;
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | چخبر؟ | دش</title><meta name="description" content="${desc}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><meta property="og:type" content="article"><meta property="og:locale" content="fa_IR"><meta property="og:title" content="${title} | دش"><meta property="og:description" content="${desc}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${cfg.siteUrl}${cover}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title} | دش"><meta name="twitter:description" content="${desc}"><meta name="twitter:image" content="${cfg.siteUrl}${cover}"><link rel="stylesheet" href="/style.css"><link rel="icon" href="/favicon.png"><script type="application/ld+json">${JSON.stringify(articleSchema)}</script><script type="application/ld+json">${JSON.stringify(breadcrumb)}</script><style>
.article-page{padding:55px 0 90px}.article-wrap{width:min(860px,92%);margin:auto}.breadcrumbs{color:#71808f;font-size:13px;margin-bottom:22px}.breadcrumbs a{text-decoration:underline;text-underline-offset:3px}.article-hero{margin-bottom:34px}.article-hero img{width:100%;max-height:430px;object-fit:cover;border-radius:28px;border:1px solid #dde6ec}.article-page h1{font-size:clamp(38px,5vw,62px);line-height:1.35;letter-spacing:-.04em;margin:18px 0}.article-page .meta{color:#71808f;font-size:13px}.article-content{font-size:18px;line-height:2.15;color:#263746}.article-content h2{font-size:31px;line-height:1.5;color:#091526;margin:55px 0 14px}.article-content h3{font-size:24px;color:#091526;margin:40px 0 10px}.article-content p{margin:0 0 22px}.article-content strong{color:#091526}.article-content a{color:#1687c1;text-decoration:underline;text-underline-offset:4px}.article-content blockquote{margin:32px 0;padding:22px 26px;border-right:4px solid #2fa7e3;background:#eef8fc;border-radius:18px;color:#0b3348;font-weight:800}.article-content ul{padding-right:24px}.article-content img{max-width:100%;border-radius:18px}.source-note{margin-top:55px;padding:24px;border:1px solid #dde6ec;border-radius:22px;background:#fff}.article-cta{margin-top:48px;padding:30px;border-radius:25px;background:#091526;color:#fff}.article-cta a{display:inline-flex;background:#2fa7e3;color:#091526;text-decoration:none;padding:11px 17px;border-radius:13px;font-weight:900;margin-top:10px}.contact-strip{margin-top:55px;padding:24px;border-radius:22px;background:#f4f8fa;border:1px solid #dde6ec}.contact-strip a{margin-left:16px}.article-nav{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:32px}.article-next{display:block;padding:18px;border:1px solid #dde6ec;border-radius:18px;background:#fff}.article-next span{display:block;color:#71808f;font-size:12px;margin-bottom:6px}.article-next strong{display:block;line-height:1.8}@media(max-width:700px){.article-nav{grid-template-columns:1fr}}
</style></head><body><div class="nav-shell"><header class="wrap nav"><a class="brand" href="/" aria-label="دش">د<span>ش</span></a><nav class="navlinks"><a href="/#situations">چه زمانی؟</a><a href="/#how">چطور کار می‌کند؟</a><a href="/faq.html">سؤالات متداول</a><a href="/about.html">درباره دش</a><a href="/chekhabar/">چخبر؟</a><a href="/contact/">ارتباط با ما</a></nav><a class="btn primary" href="/request.html">درخواست راننده</a></header></div><main class="article-page"><div class="article-wrap"><div class="breadcrumbs"><a href="/">خانه</a> ← <a href="/chekhabar/">چخبر؟</a> ← ${title}</div><div class="article-hero"><div class="eyebrow">${esc(meta.category||'چخبر؟')}</div><h1>${title}</h1><div class="meta">${date} · تحریریه دش</div><img src="${cover}" alt="${title}" fetchpriority="high"></div><article class="article-content">${body}</article><div class="source-note"><strong>یادداشت تحریریه</strong><p>این مطلب با اتکا به منابع ذکرشده در متن و با تمرکز بر مسئله «راننده برای خودروی شخصی» تدوین شده است. بخش مربوط به کد ملی و کارت هوشمند، ناظر به حمل‌ونقل جاده‌ای و اطلاعات منتشرشده در منبع اصلی است و نباید به‌عنوان مقررات اختصاصی رانندگان دش تفسیر شود.</p></div>${prevNext?`<nav class="article-nav" aria-label="مقالات دیگر">${prevNext}</nav>`:''}<div class="article-cta"><strong>ماشینت را رها نکن؛ راننده بخواه.</strong><p>اگر خودت نمی‌توانی یا نباید رانندگی کنی، درباره مدل راننده جایگزین دش بیشتر بدان.</p><a href="/request.html">درخواست راننده</a></div><div class="contact-strip"><strong>با دش در ارتباط باش</strong><div class="footer-contact">${cfg.phone} · <a href="${cfg.instagramUrl}" target="_blank" rel="noopener">${cfg.instagram}</a> · <a href="/contact/">ارسال پیام از سایت</a></div></div></div></main><footer class="footer"><div class="wrap footer-top"><div><strong class="footer-brand">دش</strong><div>راننده جایگزین برای خودروی شخصی</div><div class="footer-contact">${cfg.phone} · ${cfg.instagram}</div></div><div class="footerlinks"><a href="/">صفحه اصلی</a><a href="/about.html">درباره دش</a><a href="/faq.html">سؤالات متداول</a><a href="/contact/">ارتباط با ما</a><a href="/chekhabar/">چخبر؟</a></div></div></footer></body></html>`;
}

const files = fs.readdirSync(srcDir).filter(f=>f.endsWith('.md')).sort();
const articles=[];
for(const file of files){
  const raw=fs.readFileSync(path.join(srcDir,file),'utf8');
  const {meta,body}=parseFrontmatter(raw,file);
  articles.push({...meta, source:file, slug:meta.slug});
}
articles.sort((a,b)=>(b.published||'').localeCompare(a.published||''));

// Remove generated article folders so deleted/renamed source files cannot leave stale pages behind.
for (const entry of fs.readdirSync(outDir, {withFileTypes:true})) {
  const target = path.join(outDir, entry.name);
  fs.rmSync(target, {recursive:true, force:true});
}

for (let i=0;i<articles.length;i++) {
  const a=articles[i];
  const raw=fs.readFileSync(path.join(srcDir,a.source),'utf8');
  const {body}=parseFrontmatter(raw,a.source);
  const outPath=path.join(outDir,a.slug,'index.html');
  fs.mkdirSync(path.dirname(outPath),{recursive:true});
  const canonical=`${cfg.siteUrl}/chekhabar/articles/${a.slug}/`;
  fs.writeFileSync(outPath,layout(a,mdToHtml(body),canonical,articles[i-1],articles[i+1]));
  a.canonical=canonical;
}

fs.writeFileSync(path.join(root,'chekhabar','articles.json'),JSON.stringify(articles,null,2));

let hub = fs.readFileSync(hubPath,'utf8');
const cards = articles.map(a => `<a class="hub-card" href="/chekhabar/articles/${esc(a.slug)}/"><img src="${esc(a.cover||'/assets/editorial-road.png')}" alt="" loading="lazy"><div class="body"><div class="category-label">${esc(a.category||'چخبر؟')}</div><h2>${esc(a.title)}</h2><p>${esc(a.excerpt||'')}</p></div></a>`).join('');
if (!hub.includes('<!-- AUTO_ARTICLES_START -->')) throw new Error('Article marker missing in chekhabar/index.html');
hub = hub.replace(/<!-- AUTO_ARTICLES_START -->[\s\S]*?<!-- AUTO_ARTICLES_END -->/, `<!-- AUTO_ARTICLES_START -->${cards}<!-- AUTO_ARTICLES_END -->`);
fs.writeFileSync(hubPath,hub);

const staticUrls = [
  '/', '/about.html','/faq.html','/request.html','/replacement-driver.html','/personal-car-replacement-driver.html','/after-surgery.html','/illness.html','/fatigue-driving.html','/elderly-driver.html','/drinking-and-driving.html','/medication-and-driving.html','/when-not-to-drive.html','/parents-and-driving.html','/post-discharge-driving.html','/night-driving-safety.html','/driving-while-sick.html','/safe-return-home.html','/tehran-traffic-culture.html','/cinema-vs-reality.html','/chekhabar/','/contact/'
];
const allUrls=[...staticUrls,...articles.map(a=>`/chekhabar/articles/${a.slug}/`)];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls.map(u=>`  <url><loc>${cfg.siteUrl}${u}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);

console.log(`Built ${articles.length} article(s), updated hub, articles.json and sitemap.xml.`);
