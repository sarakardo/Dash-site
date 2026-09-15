# Dash Production — deployment checklist

این نسخه روی همان UI/UX و محتوای قبلی Dash ساخته شده و تغییر اصلی آن زیرساخت عملیاتی و امنیت است.

## 1) GitHub

کل فایل‌های همین پوشه را یک‌جا در ریشه repository قرار بده. هیچ پوشه‌ای لازم نیست.

## 2) Cloudflare D1

یک database با نام `dash_requests` بساز. سپس مقدار `database_id` واقعی را در `wrangler.jsonc` جایگزین کن.

بعد یک بار schema را روی production اجرا کن:

```bash
npx wrangler d1 execute dash_requests --remote --file=./schema.sql
```

Worker در اولین درخواست هم schema را بررسی می‌کند، اما اجرای migration صریح برای لانچ توصیه می‌شود.

## 3) Cloudflare R2

یک bucket خصوصی با نام `dash-driver-docs` بساز. Public Access را برای bucket فعال نکن.

## 4) Secrets

این مقادیر را فقط در Worker Secrets قرار بده، نه GitHub:

- `ADMIN_PASSWORD` — یک رمز طولانی و تصادفی برای پنل
- `ADMIN_SESSION_SECRET` — حداقل 32 بایت تصادفی
- `DATA_ENCRYPTION_KEY` — کلید تصادفی جداگانه برای رمزنگاری داده‌های حساس
- `TURNSTILE_SECRET` — فقط وقتی Turnstile را فعال می‌کنی

## 5) Turnstile

در Cloudflare Turnstile یک widget برای `dashh.ir` بساز. Site Key عمومی را در `wrangler.jsonc` در `TURNSTILE_SITE_KEY` قرار بده و Secret را به‌صورت Worker Secret با نام `TURNSTILE_SECRET` ذخیره کن. سپس `TURNSTILE_ENABLED` را `true` کن.

تا قبل از این مرحله فرم‌ها عمداً بدون Turnstile کار می‌کنند؛ وقتی فعال شد، Worker توکن را server-side با Siteverify اعتبارسنجی می‌کند.

## 6) Deploy

```bash
npx wrangler deploy
```

## 7) تست اجباری قبل از تبلیغات

1. `https://dashh.ir/api/health` باید `ready: true` برگرداند.
2. یک درخواست مسافر آزمایشی ثبت کن.
3. `/admin.html` را باز کن و همان درخواست را ببین.
4. وضعیت را تغییر بده و یادداشت ذخیره کن.
5. ثبت‌نام راننده آزمایشی را انجام بده.
6. هر چهار مدرک باید در R2 ذخیره و فقط از پنل قابل مشاهده باشند.
7. حذف درخواست باید رکورد D1 و مدارک R2 آن را پاک کند.
8. یک درخواست تکراری با همان idempotency key نباید رکورد دوم بسازد.
9. با چند درخواست پشت‌سرهم باید rate limit فعال شود.
10. اگر Turnstile فعال است، درخواست بدون توکن باید رد شود.

## 8) نکته مهم

تا وقتی تست End-to-End بالا موفق نشده، تبلیغات پولی یا همکاری با بلاگر را روی فرم اصلی شروع نکن.

## Bale notifications

New passenger requests, driver applications, and contact messages can notify an admin Bale chat after the D1 record is successfully created.

Set these as **Worker Secrets** (never put the values in `wrangler.jsonc`, frontend JavaScript, or Git):

- `BALE_BOT_TOKEN` — token of the Dash Bale bot
- `BALE_CHAT_ID` — the admin/private chat ID that should receive alerts

The Worker calls the Bale Bot API server-side. Notification failure does not fail the customer's request; the D1 record remains the source of truth.

To obtain the chat ID, send `/start` to the bot and inspect the bot's update/chat information, then store only the resulting ID as the secret.

## Google Search Console — راه‌اندازی نهایی

Search Console از داخل فایل‌های پروژه به‌صورت خودکار قابل فعال‌سازی نیست؛ تأیید مالکیت باید در حساب Google مالک دامنه انجام شود. این پروژه برای این مرحله آماده است.

1. وارد Google Search Console شوید و یک **Domain property** برای `dashh.ir` بسازید.
2. Google یک رکورد **TXT** برای DNS دامنه می‌دهد. همان مقدار را در DNS دامنه `dashh.ir` اضافه کنید.
3. بعد از انتشار DNS، در Search Console روی **Verify** بزنید.
4. از منوی **Sitemaps**، این sitemap را ثبت کنید: `https://dashh.ir/sitemap.xml`
5. در **URL Inspection**، ابتدا `https://dashh.ir/` و سپس `/faq.html` و `/replacement-driver.html` را بررسی کنید و در صورت نیاز Request indexing بزنید.
6. بعد از اولین crawl، گزارش‌های **Pages** و **Enhancements / structured data** را بررسی کنید.

> نکته: هیچ verification token، فایل تأیید یا credential در Repository قرار ندهید. اگر Google روش HTML meta/file را به شما پیشنهاد داد، مقدار اختصاصی همان حساب را فقط بعد از دریافت آن اضافه کنید.

