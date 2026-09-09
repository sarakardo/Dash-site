# راه‌اندازی یک‌باره فرم «ارتباط با ما»

فرم تماس در `/contact/` آماده است و پیام‌ها را در Cloudflare D1 ذخیره می‌کند. برای فعال‌شدن ذخیره‌سازی، فقط یک‌بار این مراحل انجام می‌شود.

## 1) ساخت D1

در Cloudflare برو به **Workers & Pages → D1 → Create database**.

نام پیشنهادی:

`dash-contact`

بعد از ساخت، مقدار **Database ID** را کپی کن.

## 2) قرار دادن Database ID در wrangler.jsonc

در فایل `wrangler.jsonc` این قسمت را پیدا کن:

`REPLACE_WITH_YOUR_D1_DATABASE_ID`

و ID واقعی دیتابیس را جایگزین کن.

## 3) ساخت جدول

در ترمینال پروژه اجرا کن:

`npx wrangler d1 execute dash-contact --remote --file=schema.sql`

## 4) ساخت رمز ورود مدیریت

اجرا کن:

`npx wrangler secret put ADMIN_PASSWORD`

رمزی انتخاب کن که فقط خودت داشته باشی.

## 5) استقرار

`npm run deploy`

بعد از آن:

- کاربران از `/contact/` پیام می‌فرستند.
- پیام‌ها در D1 ذخیره می‌شوند.
- تو از `/admin/messages/` با رمز مدیریت پیام‌ها را می‌خوانی.

## امنیت

صفحه مدیریت `noindex,nofollow` است و API فهرست پیام‌ها فقط با رمز مدیریت پاسخ می‌دهد. رمز را داخل فایل‌های سایت ننویس.
