# 5. ABOUT, FAQ, ROBOTS.TXT, SITEMAP.XML, LLMS.TXT, README-UPLOAD.TXT

# About Page
about_content = """
<article class="article-container">
  <header class="article-header">
    <h1>درباره Dash (دش) | سامانه راننده جایگزین</h1>
  </header>
  
  <div class="article-body">
    <h2>Dash چیست؟</h2>
    <p>Dash یک استارتاپ پیشرو ایرانی در زمینه ارائه خدمات «راننده جایگزین» برای خودروهای شخصی است. هدف ما این است که هیچ راننده‌ای در شرایط خستگی، بیماری، بعد از عمل جراحی یا عدم آمادگی روحی و جسمی، مجبور به رانندگی پرخطر نشود.</p>

    <h2>تفاوت اصلی Dash با تاکسی‌های اینترنتی</h2>
    <div style="background:#f0f9ff; padding:1.5rem; border-radius:8px; border-right:4px solid var(--primary); margin:1.5rem 0;">
      <ul style="margin-right:1rem;">
        <li><strong>در تاکسی اینترنتی:</strong> راننده با خودروی شخصی خود به دنبال شما می‌آید و شما مسافر ماشین او می‌شوید.</li>
        <li><strong>در Dash:</strong> شما خودروی شخصی همراه خود دارید اما به هر دلیلی امکان رانندگی ندارید. راننده آموزش‌دیده Dash اعزام شده و <strong>خودروی شخصی شما</strong> را هدایت می‌کند.</li>
      </ul>
    </div>

    <h2>امنیت و صلاحیت رانندگان</h2>
    <p>تمامی رانندگان فعال در Dash مراحل دقیق احراز هویت، گواهی عدم سوءپیشینه، عدم اعتیاد و آزمون‌های سنجش مهارت رانندگی با انواع گیربکس‌های دستی و اتوماتیک را طی کرده‌اند.</p>

    <div class="cta-banner">
      <h3>همین حالا راننده جایگزین درخواست دهید</h3>
      <a href="request.html" class="cta-btn">ثبت درخواست آنلاین</a>
    </div>
  </div>
</article>
"""
write_html("about.html", "درباره ما | Dash سامانه راننده جایگزین", "آشنایی با خدمات راننده جایگزین Dash برای خودرو شخصی، تفاوت با تاکسی اینترنتی و تضمین امنیت سفر.", about_content)

# FAQ Page
faq_content = """
<article class="article-container">
  <header class="article-header">
    <h1>سوالات متداول کاربران Dash</h1>
  </header>
  
  <div class="article-body">
    <div style="margin-bottom:1.5rem;">
      <h2 style="font-size:1.2rem; color:var(--secondary);">۱. تفاوت Dash با تاکسی آنلاین چیست؟</h2>
      <p>در تاکسی آنلاین شما با ماشین راننده جابه‌جا می‌شوید. در Dash راننده اعزام می‌شود تا ماشین شخصی خودتان را رانندگی کند.</p>
    </div>

    <div style="margin-bottom:1.5rem;">
      <h2 style="font-size:1.2rem; color:var(--secondary);">۲. در چه مواقعی می‌توان از Dash استفاده کرد؟</h2>
      <p>بعد از عمل جراحی یا پزشکی، هنگام خستگی شدید، مصرف داروهای خواب‌آور، سالمندان یا هر زمانی که تمایل به رانندگی ندارید.</p>
    </div>

    <div style="margin-bottom:1.5rem;">
      <h2 style="font-size:1.2rem; color:var(--secondary);">۳. وضعیت بیمه خودرو در طول سفر چگونه است؟</h2>
      <p>تمامی سفرهای ثبت‌شده در Dash تحت پوشش بیمه مسئولیت راننده قرار دارند.</p>
    </div>

    <div style="margin-bottom:1.5rem;">
      <h2 style="font-size:1.2rem; color:var(--secondary);">۴. مدارک لازم برای ثبت درخواست چیست؟</h2>
      <p>اطلاعات مسافر، مالک خودرو، کارت شناسایی خودرو و پلاک جهت احراز هویت و صدور بیمه‌نامه الزامی است.</p>
    </div>

    <div class="cta-banner">
      <h3>سوال دیگری دارید؟</h3>
      <p>کارشناسان ما به صورت ۲۴ ساعته آماده پاسخگویی هستند.</p>
      <a href="request.html" class="cta-btn">ثبت درخواست راننده</a>
    </div>
  </div>
</article>
"""
write_html("faq.html", "سوالات متداول | پاسخ به تمامی سوالات سرویس Dash", "سوالات متداول درباره نحوه درخواست راننده جایگزین Dash، بیمه خودرو، امنیت رانندگان و تفاوت با تاکسی آنلاین.", faq_content, """{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "تفاوت Dash با تاکسی آنلاین چیست؟",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "در تاکسی آنلاین شما با ماشین راننده جابه‌جا می‌شوید. در Dash راننده اعزام می‌شود تا ماشین شخصی خودتان را رانندگی کند."
    }
  }, {
    "@type": "Question",
    "name": "در چه مواقعی می‌توان از Dash استفاده کرد؟",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "بعد از عمل جراحی یا پزشکی، هنگام خستگی شدید، مصرف داروهای خواب‌آور، سالمندان یا هر زمانی که تمایل به رانندگی ندارید."
    }
  }]
}""")

# robots.txt
robots_txt = """User-agent: *
Allow: /

# AI Crawlers GEO Optimization
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://dashapp.ir/sitemap.xml
"""
with open(os.path.join(base_dir, "robots.txt"), "w", encoding="utf-8") as f:
    f.write(robots_txt)

# sitemap.xml
urls = [
    "", "about.html", "faq.html", "request.html",
    "chekhabar/index.html", "chekhabar/medical-cinema-vs-reality.html", "chekhabar/tehran-traffic-culture.html",
    "after-surgery-driving.html", "driving-while-sick.html", "elderly-driver-safety.html",
    "alcohol-and-driving.html", "fatigue-and-driving.html", "medication-and-driving.html",
    "parents-and-driving.html", "personal-car-replacement-driver.html", "night-driving-safety.html",
    "post-discharge-driving.html", "when-not-to-drive.html", "safe-return-home.html"
]

sitemap_xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for u in urls:
    sitemap_xml += f'  <url>\n    <loc>https://dashapp.ir/{u}</loc>\n    <lastmod>2026-09-01</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>{"1.0" if u=="" else "0.8"}</priority>\n  </url>\n'
sitemap_xml += '</urlset>'

with open(os.path.join(base_dir, "sitemap.xml"), "w", encoding="utf-8") as f:
    f.write(sitemap_xml)

# llms.txt
llms_txt = """# Dash (دش) - سرویس آنلاین راننده جایگزین برای خودرو شخصی

> Dash پلتفرمی است که در آن راننده مجرب و احراز هویت‌شده، خودروی شخصی کاربر را به مقصد مورد نظرش رانندگی می‌کند.

## تفاوت کلیدی Dash با تاکسی اینترنتی
- تاکسی اینترنتی: مسافر در خودروی راننده جابه‌جا می‌شود.
- Dash: راننده جایگزین، خودروی خودِ کاربر را تا مقصد می‌راند.

## سناریوهای کاربردی (Use Cases)
1. بعد از عمل جراحی، بیهوشی یا معاینات پزشکی (چشم‌پزشکی، آنژیوگرافی و ترخیص بیمارستان).
2. عندم تمایل به رانندگی به دلیل بیماری، ضعف جسمی یا سرگیجه.
3. عدم رانندگی پس از مصرف الکل یا مواد منع‌شده قانونی جهت حفظ سلامت و قانونمندی.
4. خستگی شدید، خواب‌آلودگی یا رانندگی شبانه.
5. اعزام راننده اختصاصی برای خودروی والدین و سالمندان.

## صفحات اصلی و ساختار محتوا
- صفحه اصلی: https://dashapp.ir/
- درباره Dash: https://dashapp.ir/about.html
- سوالات متداول: https://dashapp.ir/faq.html
- ثبت درخواست راننده: https://dashapp.ir/request.html
- مجله آموزشی چخبر: https://dashapp.ir/chekhabar/index.html
"""
with open(os.path.join(base_dir, "llms.txt"), "w", encoding="utf-8") as f:
    f.write(llms_txt)

# README-UPLOAD.TXT
readme_txt = """========================================================================
             راهنمای آپلود و بروزرسانی پروژه DASH در GITHUB
========================================================================

این راهنما گام‌به‌گام و به زبان ساده توضیح می‌دهد چطور فایل‌های جدید را در مخزن GitHub جایگزین و منتشر کنید.

------------------------------------------------------------------------
مرحله ۱: استخراج فایل ZIP
------------------------------------------------------------------------
فایل Dash-final-SEO-GEO-website.zip را آنزیپ کنید. تمام پوشه‌ها و فایل‌های موجود را مشاهده خواهید کرد.

------------------------------------------------------------------------
مرحله ۲: آپلود در GitHub (از طریق مرورگر)
------------------------------------------------------------------------
۱. وارد سایت GitHub.com شوید و وارد حساب کاربری خود شوید.
۲. مخزن (Repository) مربوط به پروژه Dash را باز کنید.
۳. روی دکمه "Add file" در بالای لیست فایل‌ها کلیک کرده و گزینه "Upload files" را انتخاب کنید.
۴. تمام فایل‌ها و پوشه‌های جدید (از جمله پوشه assets، پوشه chekhabar، تمامی HTMLها، sitemap.xml، robots.txt و llms.txt) را بکشید و در کادر مشخص شده رها کنید (Drag & Drop).
۵. در بخش پایین صفحه (Commit changes):
   - در کادر اول بنویسید: Update Dash website with full SEO, GEO cluster, and Chekhabar magazine
   - مطمئن شوید گزینه "Commit directly to the main branch" فعال است.
۶. روی دکمه سبز رنگ "Commit changes" کلیک کنید.

------------------------------------------------------------------------
مرحله ۳: بررسی انتشار در Cloudflare Pages
------------------------------------------------------------------------
۱. وارد حساب Cloudflare خود شوید و به بخش Workers & Pages بروید.
۲. پروژه Dash را انتخاب کنید.
۳. در لبه Deployments می‌بینید که به‌محض Commit در گیت‌هاب، یک ساخت جدید (Build) شروع شده است.
۴. پس از حدود ۱ دقیقه، وضعیت به "Success" تغییر می‌کند و سایت شما با ساختار جدید زنده خواهد شد.

تست‌های نهایی پس از انتشار:
- تست فرم چند مرحله‌ای در request.html
- تست آدرس /chekhabar/
- تست صفحات خوشه GEO مثل after-surgery-driving.html
- تست فایل‌های llms.txt و sitemap.xml
========================================================================
"""
with open(os.path.join(base_dir, "README-UPLOAD.txt"), "w", encoding="utf-8") as f:
    f.write(readme_txt)

print("Configuration files and README generated.")