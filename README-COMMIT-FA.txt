بستهٔ کامیت سئو/GEO دش — V25

این بسته برای ادغام روی مخزن موجود طراحی شده و جایگزین کامل سایت نیست. فایل‌های اصلی ظاهر و عملکرد مثل index.html، style.css، site.js، request.js، worker.js و wrangler.jsonc عمداً داخل بسته نیستند.

محتویات:
- چهار مقالهٔ جدید در chekhabar/
- chekhabar.html با لینک‌دهی به چهار مقاله
- sitemap.xml با چهار URL افزوده‌شده؛ URLهای قبلی حفظ شده‌اند
- llms.txt با توصیف مقاله‌های جدید
- .github/workflows/indexnow.yml برای ارسال HTMLهای تغییرکرده در مسیرهای ریشه و زیرپوشه به IndexNow

روش کامیت:
1. ZIP را در یک پوشهٔ جدا استخراج کن.
2. فایل‌های داخل آن را با همان مسیر نسبی در ریشهٔ مخزن فعلی sarakardo/Dash-site کپی/جایگزین کن؛ کل مخزن را پاک نکن و کل نسخهٔ V23 را روی آن نریز.
3. اگر Cloudflare در حال اصلاح فایل‌های مشترک است، قبل از جایگزینی chekhabar.html، sitemap.xml، llms.txt یا workflow، آخرین نسخه را از مخزن بگیر و با این فایل‌ها مقایسه کن.
4. Commit با پیام: SEO/GEO: publish four new articles and update discovery files
5. بعد از Deploy، باز کن: https://dashh.ir/sitemap.xml و چهار URL جدید را چک کن. سپس هر چهار URL را در Google Search Console URL Inspection بررسی و در صورت نیاز Request indexing بزن.

مهم:
- IndexNow به‌معنای ایندکس قطعی در گوگل نیست.
- این بسته robots.txt یا تنظیمات دامنه/Cloudflare را تغییر نمی‌دهد.
- LocalBusiness schema اضافه نشده؛ تا وقتی نشانی واقعی و اطلاعات رسمی واجد شرایط تأیید نشده، نباید دادهٔ کسب‌وکار محلی ساختگی منتشر کرد.
- قبل از ادغام، مطمئن شو نسخهٔ فعلی مخزن هنوز همان مبنای V23 است؛ اگر از آن جدیدتر است، فایل‌های مشترک را مقایسه کن.
